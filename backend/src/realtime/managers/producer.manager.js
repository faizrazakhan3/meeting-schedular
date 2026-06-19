const roomManager = require('./room.manager');

class ProducerManager {
    /**
     * Create a Producer on the transport
     */
    async produce(socketId, roomId, transportId, kind, rtpParameters, appData) {
        const room = roomManager.getRoom(roomId);
        if (!room) throw new Error('Room not found');

        const peer = room.getPeer(socketId);
        if (!peer) throw new Error('Peer not found');

        const transport = peer.getTransport(transportId);
        if (!transport) throw new Error(`Transport ${transportId} not found`);

        const producer = await transport.produce({
            kind,
            rtpParameters,
            appData: { ...appData, peerId: socketId }
        });

        peer.addProducer(producer);
        return producer;
    }

    /**
     * Get existing producers for a user joining late
     */
    getProducers(socketId, roomId) {
        const room = roomManager.getRoom(roomId);
        if (!room) return [];

        const producerList = [];
        
        room.getPeers().forEach(peer => {
            if (peer.id === socketId) return;

            peer.producers.forEach(producer => {
                producerList.push({
                    producerId: producer.id,
                    peerId: peer.id,
                    kind: producer.kind
                });
            });
        });

        return producerList;
    }
}

module.exports = new ProducerManager();
