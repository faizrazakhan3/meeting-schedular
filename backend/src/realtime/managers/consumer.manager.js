const roomManager = require('./room.manager');

class ConsumerManager {
    
    async consume(socketId, roomId, transportId, producerId, rtpCapabilities) {
        const room = roomManager.getRoom(roomId);
        if (!room) throw new Error('Room not found');

        const peer = room.getPeer(socketId);
        if (!peer) throw new Error('Peer not found');

        const transport = peer.getTransport(transportId);
        if (!transport) throw new Error(`Transport ${transportId} not found`);

        if (!room.router.canConsume({ producerId, rtpCapabilities })) {
            throw new Error('Cannot consume this producer');
        }

        const consumer = await transport.consume({
            producerId,
            rtpCapabilities,
            paused: true // Always start paused according to Mediasoup docs, then resume on client
        });

        peer.addConsumer(consumer);
        return { consumer, peer };
    }

    /**
     * Unpause the video/audio stream
     */
    async resumeConsumer(socketId, roomId, consumerId) {
        const room = roomManager.getRoom(roomId);
        if (!room) throw new Error('Room not found');

        const peer = room.getPeer(socketId);
        if (!peer) throw new Error('Peer not found');

        const consumer = peer.consumers.get(consumerId);
        if (!consumer) throw new Error(`Consumer ${consumerId} not found`);

        await consumer.resume();
    }
}

module.exports = new ConsumerManager();
