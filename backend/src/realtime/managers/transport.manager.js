const config = require('../../config/mediasoup.config');
const roomManager = require('./room.manager');

class TransportManager {
    /**
     * Create a WebRTC transport on the server side
     */
    async createWebRtcTransport(socketId, roomId, forceTcp) {
        const room = roomManager.getRoom(roomId);
        if (!room) throw new Error('Room not found');

        const peer = room.getPeer(socketId);
        if (!peer) throw new Error('Peer not found');

        const transport = await room.router.createWebRtcTransport({
            listenIps: config.mediasoup.webRtcTransport.listenIps,
            enableUdp: !forceTcp,
            enableTcp: true,
            preferUdp: !forceTcp,
            initialAvailableOutgoingBitrate: config.mediasoup.webRtcTransport.initialAvailableOutgoingBitrate
        });

        peer.addTransport(transport);

        return {
            params: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters
            }
        };
    }

    /**
     * Connect the server-side transport using the client's DTLS parameters
     */
    async connectTransport(socketId, roomId, transportId, dtlsParameters) {
        const room = roomManager.getRoom(roomId);
        if (!room) throw new Error('Room not found');

        const peer = room.getPeer(socketId);
        if (!peer) throw new Error('Peer not found');

        const transport = peer.getTransport(transportId);
        if (!transport) throw new Error(`Transport ${transportId} not found`);

        await transport.connect({ dtlsParameters });
    }
}

module.exports = new TransportManager();
