import { io, Socket } from 'socket.io-client';
import { Device, types } from 'mediasoup-client';

type Transport = types.Transport;
type Producer = types.Producer;
type Consumer = types.Consumer;

export interface RemoteStream {
    peerId: string;
    stream: MediaStream;
}

export class WebRTCClient {
  // Callback that UI can register to receive join notifications with actual names
  private onUserJoined?: (peerId: string, name: string) => void;

  /**
   * Register a handler for the `userJoined` socket event.
   */
  public setUserJoinedHandler(cb: (peerId: string, name: string) => void) {
    this.onUserJoined = cb;
  }
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

        // Listen for userJoined events broadcast by the server
        this.socket.on('userJoined', ({ peerId, name }) => {
            if (this.onUserJoined) {
                this.onUserJoined(peerId, name);
            }
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
            const remoteStream = this.remoteStreams.get(peerId);
            if (remoteStream) {
                const tracks = remoteStream.stream.getTracks();
                const producerIdsToClose: string[] = [];
                for (const [prodId, consumer] of this.consumers.entries()) {
                    if (tracks.some(t => t.id === consumer.track.id)) {
                        producerIdsToClose.push(prodId);
                    }
                }
                producerIdsToClose.forEach(pid => this.removeConsumer(pid));
            }
            this.remoteStreams.delete(peerId);
        });
    }

    private removeConsumer(producerId: string) {
        const consumer = this.consumers.get(producerId);
        if (consumer) {
            // Find which peer owns this track and remove it
            for (const [peerId, remoteStream] of this.remoteStreams.entries()) {
                const track = remoteStream.stream.getTracks().find(t => t.id === consumer.track.id);
                if (track) {
                    const remainingTracks = remoteStream.stream.getTracks().filter(t => t.id !== consumer.track.id);
                    if (remainingTracks.length === 0) {
                        this.remoteStreams.delete(peerId);
                    } else {
                        const newStream = new MediaStream(remainingTracks);
                        this.remoteStreams.set(peerId, {
                            peerId,
                            stream: newStream
                        });
                    }
                    break;
                }
            }
            consumer.close();
            this.consumers.delete(producerId);
            this.onRemoteStreamsChange();
        }
    }

    private async joinRoom() {
        // Retrieve the logged‑in user's display name from session storage
        const storedUser = sessionStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : {};
        const name = user.name || 'Anonymous';
+
        this.socket.emit('joinRoom', { roomId: this.roomId, name }, async (response: any) => {
            if (response.error) {
                console.error('Failed to join room:', response.error);
                return;
            }
            console.log('Joined room, RTP capabilities received');
            
            // Register names of peers already in the room
            if (response.peers && Array.isArray(response.peers)) {
                response.peers.forEach((peer: any) => {
                    if (peer.peerId && peer.name && this.onUserJoined) {
                        this.onUserJoined(peer.peerId, peer.name);
                    }
                });
            }

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
                    producers.forEach((p: any) => this.consumeRemoteMedia(p.producerId, p.peerId));
                }
            });

        } catch (error) {
            console.error('Failed to initialize device:', error);
        }
    }

    private createSendTransport(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket.emit('createWebRtcTransport', { forceTcp: false, producing: true, consuming: false }, async (response: any) => {
                if (response.error) {
                    console.error('Failed to create send transport:', response.error);
                    reject(new Error(response.error));
                    return;
                }
                if (!this.device) {
                    reject(new Error('Device not initialized'));
                    return;
                }

                try {
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

                    // If local stream is already active, publish its tracks now
                    if (this.localStream) {
                        const videoTrack = this.localStream.getVideoTracks()[0];
                        const audioTrack = this.localStream.getAudioTracks()[0];
                        if (videoTrack && !this.videoProducer) {
                            this.videoProducer = await this.sendTransport.produce({ track: videoTrack });
                        }
                        if (audioTrack && !this.audioProducer) {
                            this.audioProducer = await this.sendTransport.produce({ track: audioTrack });
                        }
                        this.onRemoteStreamsChange();
                    }

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    private createReceiveTransport(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket.emit('createWebRtcTransport', { forceTcp: false, producing: false, consuming: true }, async (response: any) => {
                if (response.error) {
                    console.error('Failed to create receive transport:', response.error);
                    reject(new Error(response.error));
                    return;
                }
                if (!this.device) {
                    reject(new Error('Device not initialized'));
                    return;
                }

                try {
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

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    private async getUserMediaWithFallback(): Promise<MediaStream> {
        const constraintsList = [
            {
                video: { width: 1280, height: 720 },
                audio: true
            },
            {
                video: true,
                audio: true
            },
            {
                video: false,
                audio: true
            }
        ];

        let lastError: any = null;

        for (const constraints of constraintsList) {
            try {
                console.log('Attempting getUserMedia with constraints:', constraints);
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                console.log('Successfully acquired stream with constraints:', constraints);
                return stream;
            } catch (error: any) {
                console.warn(`getUserMedia failed for constraints ${JSON.stringify(constraints)}:`, error);
                lastError = error;
            }
        }

        console.warn('All standard getUserMedia options failed. Creating dummy stream...');
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#475569';
                ctx.font = '24px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Camera Disabled/Unavailable', canvas.width / 2, canvas.height / 2);
            }
            
            const videoStream = (canvas as any).captureStream ? (canvas as any).captureStream(1) : null;
            const dummyVideoTrack = videoStream ? videoStream.getVideoTracks()[0] : null;

            let dummyAudioTrack: MediaStreamTrack | null = null;
            try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContextClass) {
                    const ctx = new AudioContextClass();
                    const oscillator = ctx.createOscillator();
                    const dst = ctx.createMediaStreamDestination();
                    oscillator.connect(dst);
                    dummyAudioTrack = dst.stream.getAudioTracks()[0];
                }
            } catch (e) {
                console.warn('Failed to create dummy audio track:', e);
            }

            const tracks: MediaStreamTrack[] = [];
            if (dummyVideoTrack) tracks.push(dummyVideoTrack);
            if (dummyAudioTrack) tracks.push(dummyAudioTrack);

            if (tracks.length > 0) {
                return new MediaStream(tracks);
            }
        } catch (e) {
            console.error('Failed to create dummy stream:', e);
        }

        throw lastError || new Error('Could not access media devices');
    }

    public async startLocalMedia() {
        try {
            this.localStream = await this.getUserMediaWithFallback();

            const videoTrack = this.localStream.getVideoTracks()[0];
            const audioTrack = this.localStream.getAudioTracks()[0];

            if (this.sendTransport) {
                if (videoTrack && !this.videoProducer) {
                    this.videoProducer = await this.sendTransport.produce({ track: videoTrack });
                }
                if (audioTrack && !this.audioProducer) {
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

            try {
                const consumer = await this.receiveTransport!.consume({
                    id: params.id,
                    producerId: params.producerId,
                    kind: params.kind,
                    rtpParameters: params.rtpParameters
                });

                this.consumers.set(producerId, consumer);

                // Important: We must tell the server to resume the consumer
                this.socket.emit('resumeConsumer', { consumerId: consumer.id }, () => {});

                // Group by peerId and create a new MediaStream instance to trigger React re-render
                const existingRemote = this.remoteStreams.get(peerId);
                if (existingRemote) {
                    const newTracks = [...existingRemote.stream.getTracks(), consumer.track];
                    const newStream = new MediaStream(newTracks);
                    this.remoteStreams.set(peerId, {
                        peerId,
                        stream: newStream
                    });
                } else {
                    const mediaStream = new MediaStream([consumer.track]);
                    this.remoteStreams.set(peerId, {
                        peerId,
                        stream: mediaStream
                    });
                }

                this.onRemoteStreamsChange();
            } catch (err) {
                console.error('Error consuming remote media:', err);
            }
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
