import { io, Socket } from 'socket.io-client';
import { Device, types } from 'mediasoup-client';

type Transport = types.Transport;
type Producer = types.Producer;
type Consumer = types.Consumer;

export interface RemoteStream {
    peerId: string;
    producerId: string;
    stream: MediaStream;
}

export class WebRTCClient {
    private socket: Socket;
    private device: Device | null = null;
    private sendTransport: Transport | null = null;
    private receiveTransport: Transport | null = null;
    private videoProducer: Producer | null = null;
    private audioProducer: Producer | null = null;
    private consumers: Map<string, Consumer> = new Map();

    public localStream: MediaStream | null = null;
    public remoteStreams: Map<string, RemoteStream> = new Map();
    
    private roomId: string;
    private onRemoteStreamsChange: () => void;

    constructor(roomId: string, onRemoteStreamsChange: () => void) {
        this.roomId = roomId;
        this.onRemoteStreamsChange = onRemoteStreamsChange;
        
        // Connect to Socket.IO backend
        // We use https and wss because of the basicSsl setup
        this.socket = io('https://localhost:5000', {
            transports: ['websocket', 'polling'],
            secure: true,
        });

        this.setupSocketListeners();
    }

    private setupSocketListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to signaling server');
            this.joinRoom();
        });

        this.socket.on('newProducer', async ({ producerId, peerId, kind }) => {
            console.log('New producer available:', { producerId, peerId, kind });
            await this.consumeRemoteMedia(producerId, peerId);
        });

        this.socket.on('producerClosed', ({ producerId }) => {
            this.removeConsumer(producerId);
        });

        this.socket.on('peerLeft', ({ peerId }) => {
            // Remove all streams for this peer
            const streamsToRemove = Array.from(this.remoteStreams.values())
                .filter(s => s.peerId === peerId)
                .map(s => s.producerId);
            
            streamsToRemove.forEach(pid => this.removeConsumer(pid));
        });
    }

    private removeConsumer(producerId: string) {
        const consumer = this.consumers.get(producerId);
        if (consumer) {
            consumer.close();
            this.consumers.delete(producerId);
        }
        
        if (this.remoteStreams.has(producerId)) {
            this.remoteStreams.delete(producerId);
            this.onRemoteStreamsChange();
        }
    }

    private async joinRoom() {
        this.socket.emit('joinRoom', { roomId: this.roomId }, async (response: any) => {
            if (response.error) {
                console.error('Failed to join room:', response.error);
                return;
            }
            console.log('Joined room, RTP capabilities received');
            await this.initializeDevice(response.routerRtpCapabilities);
        });
    }

    private async initializeDevice(routerRtpCapabilities: any) {
        try {
            this.device = new Device();
            await this.device.load({ routerRtpCapabilities });
            console.log('Mediasoup device loaded');
            
            await this.createSendTransport();
            await this.createReceiveTransport();
            
            // Get already existing producers in the room
            this.socket.emit('getProducers', {}, (producers: any) => {
                if (producers && !producers.error) {
                    producers.forEach((p: any) => this.consumeRemoteMedia(p.id, p.peerId));
                }
            });

        } catch (error) {
            console.error('Failed to initialize device:', error);
        }
    }

    private async createSendTransport() {
        this.socket.emit('createWebRtcTransport', { forceTcp: false, producing: true, consuming: false }, async (response: any) => {
            if (response.error || !this.device) return;

            this.sendTransport = this.device.createSendTransport(response.params);

            this.sendTransport.on('connect', ({ dtlsParameters }: any, callback: any, errback: any) => {
                this.socket.emit('connectTransport', {
                    transportId: this.sendTransport!.id,
                    dtlsParameters
                }, (response: any) => {
                    if (response.error) errback(new Error(response.error));
                    else callback();
                });
            });

            this.sendTransport.on('produce', async (parameters: any, callback: any, errback: any) => {
                this.socket.emit('produce', {
                    transportId: this.sendTransport!.id,
                    kind: parameters.kind,
                    rtpParameters: parameters.rtpParameters,
                    appData: parameters.appData
                }, (response: any) => {
                    if (response.error) errback(new Error(response.error));
                    else callback({ id: response.id });
                });
            });
        });
    }

    private async createReceiveTransport() {
        this.socket.emit('createWebRtcTransport', { forceTcp: false, producing: false, consuming: true }, async (response: any) => {
            if (response.error || !this.device) return;

            this.receiveTransport = this.device.createRecvTransport(response.params);

            this.receiveTransport.on('connect', ({ dtlsParameters }: any, callback: any, errback: any) => {
                this.socket.emit('connectTransport', {
                    transportId: this.receiveTransport!.id,
                    dtlsParameters
                }, (response: any) => {
                    if (response.error) errback(new Error(response.error));
                    else callback();
                });
            });
        });
    }

    public async startLocalMedia() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: true
            });

            const videoTrack = this.localStream.getVideoTracks()[0];
            const audioTrack = this.localStream.getAudioTracks()[0];

            if (this.sendTransport) {
                if (videoTrack) {
                    this.videoProducer = await this.sendTransport.produce({ track: videoTrack });
                }
                if (audioTrack) {
                    this.audioProducer = await this.sendTransport.produce({ track: audioTrack });
                }
            }
            
            // Trigger re-render for local video
            this.onRemoteStreamsChange();
            return this.localStream;
        } catch (error) {
            console.error('Error accessing local media:', error);
            throw error;
        }
    }

    public stopLocalMedia() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        if (this.videoProducer) this.videoProducer.close();
        if (this.audioProducer) this.audioProducer.close();
        
        this.localStream = null;
        this.onRemoteStreamsChange();
    }

    private async consumeRemoteMedia(producerId: string, peerId: string) {
        if (!this.device || !this.receiveTransport) {
            console.warn('Device or receive transport not ready to consume');
            return;
        }

        this.socket.emit('consume', {
            transportId: this.receiveTransport.id,
            producerId,
            rtpCapabilities: this.device.rtpCapabilities
        }, async (params: any) => {
            if (params.error) {
                console.error('Consume error:', params.error);
                return;
            }

            const consumer = await this.receiveTransport!.consume({
                id: params.id,
                producerId: params.producerId,
                kind: params.kind,
                rtpParameters: params.rtpParameters
            });

            this.consumers.set(producerId, consumer);

            // Important: We must tell the server to resume the consumer
            this.socket.emit('resumeConsumer', { consumerId: consumer.id }, () => {});

            const mediaStream = new MediaStream([consumer.track]);
            
            this.remoteStreams.set(producerId, {
                peerId,
                producerId,
                stream: mediaStream
            });

            this.onRemoteStreamsChange();
        });
    }

    public disconnect() {
        this.stopLocalMedia();
        if (this.socket) {
            this.socket.disconnect();
        }
        if (this.sendTransport) this.sendTransport.close();
        if (this.receiveTransport) this.receiveTransport.close();
    }
}
