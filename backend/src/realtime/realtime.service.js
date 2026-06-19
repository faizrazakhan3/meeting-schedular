const roomManager = require('./managers/room.manager');
const transportManager = require('./managers/transport.manager');
const producerManager = require('./managers/producer.manager');
const consumerManager = require('./managers/consumer.manager');
const Peer = require('./stores/peer.store');

class RealtimeService {
    async joinRoom(socketId, roomId) {
        // Get or create the room (and its Router)
        const room = await roomManager.getOrCreateRoom(roomId);
        
        // Create a new Peer object to track this user's state
        const peer = new Peer(socketId);
        room.addPeer(peer);
        
        // Return the router's RTP Capabilities
        return {
            routerRtpCapabilities: room.router.rtpCapabilities
        };
    }

    async createWebRtcTransport(socketId, roomId, forceTcp) {
        return await transportManager.createWebRtcTransport(socketId, roomId, forceTcp);
    }

    async connectTransport(socketId, roomId, transportId, dtlsParameters) {
        return await transportManager.connectTransport(socketId, roomId, transportId, dtlsParameters);
    }

    async produce(socketId, roomId, transportId, kind, rtpParameters, appData) {
        return await producerManager.produce(socketId, roomId, transportId, kind, rtpParameters, appData);
    }

    getProducers(socketId, roomId) {
        return producerManager.getProducers(socketId, roomId);
    }

    async consume(socketId, roomId, transportId, producerId, rtpCapabilities) {
        return await consumerManager.consume(socketId, roomId, transportId, producerId, rtpCapabilities);
    }

    async resumeConsumer(socketId, roomId, consumerId) {
        return await consumerManager.resumeConsumer(socketId, roomId, consumerId);
    }

    handleDisconnect(socketId, roomId) {
        if (roomId) {
            const room = roomManager.getRoom(roomId);
            if (room) {
                // Remove peer and close their transports/producers/consumers
                room.removePeer(socketId);
                
                // Clean up the room if it's empty
                roomManager.removeRoomIfEmpty(roomId);
                
                return true;
            }
        }
        return false;
    }
}

module.exports = new RealtimeService();
