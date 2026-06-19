const realtimeService = require('../realtime.service');

module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        
        // We attach the roomId to the socket object for easy access in other events
        socket.roomId = null;

        /**
         * 1. JOIN ROOM
         * Client wants to join a specific room.
         */
        socket.on('joinRoom', async ({ roomId }, callback) => {
            try {
                const result = await realtimeService.joinRoom(socket.id, roomId);
                
                socket.roomId = roomId;
                socket.join(roomId);

                callback(result);
            } catch (error) {
                console.error('Error joining room:', error);
                callback({ error: error.message });
            }
        });

        /**
         * 2. CREATE TRANSPORT
         * Client wants to create a WebRTC transport.
         */
        socket.on('createWebRtcTransport', async ({ forceTcp, producing, consuming }, callback) => {
            try {
                const result = await realtimeService.createWebRtcTransport(socket.id, socket.roomId, forceTcp);
                callback(result);
            } catch (error) {
                console.error('Error creating WebRTC transport:', error);
                callback({ error: error.message });
            }
        });

        /**
         * 3. CONNECT TRANSPORT
         */
        socket.on('connectTransport', async ({ transportId, dtlsParameters }, callback) => {
            try {
                await realtimeService.connectTransport(socket.id, socket.roomId, transportId, dtlsParameters);
                callback({});
            } catch (error) {
                console.error('Error connecting transport:', error);
                callback({ error: error.message });
            }
        });

        /**
         * 4. PRODUCE (SEND MEDIA)
         */
        socket.on('produce', async ({ transportId, kind, rtpParameters, appData }, callback) => {
            try {
                const producer = await realtimeService.produce(socket.id, socket.roomId, transportId, kind, rtpParameters, appData);

                // Notify all other peers in the room
                socket.to(socket.roomId).emit('newProducer', {
                    producerId: producer.id,
                    peerId: socket.id,
                    kind: producer.kind
                });

                callback({ id: producer.id });
            } catch (error) {
                console.error('Error producing:', error);
                callback({ error: error.message });
            }
        });

        /**
         * 5. GET EXISTING PRODUCERS
         */
        socket.on('getProducers', (data, callback) => {
            try {
                const producerList = realtimeService.getProducers(socket.id, socket.roomId);
                callback(producerList);
            } catch (error) {
                console.error('Error getting producers:', error);
                callback({ error: error.message });
            }
        });

        /**
         * 6. CONSUME (RECEIVE MEDIA)
         */
        socket.on('consume', async ({ transportId, producerId, rtpCapabilities }, callback) => {
            try {
                const { consumer, peer } = await realtimeService.consume(socket.id, socket.roomId, transportId, producerId, rtpCapabilities);

                // When consumer transport closes, close the consumer
                consumer.on('transportclose', () => {
                    consumer.close();
                });

                // When the producer closes, close the consumer
                consumer.on('producerclose', () => {
                    socket.emit('producerClosed', { producerId });
                    peer.consumers.delete(consumer.id);
                    consumer.close();
                });

                // Send consumer parameters back to the client
                callback({
                    id: consumer.id,
                    producerId: producerId,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters
                });
            } catch (error) {
                console.error('Error consuming:', error);
                callback({ error: error.message });
            }
        });

        /**
         * 7. RESUME CONSUMER
         */
        socket.on('resumeConsumer', async ({ consumerId }, callback) => {
            try {
                await realtimeService.resumeConsumer(socket.id, socket.roomId, consumerId);
                callback({});
            } catch (error) {
                console.error('Error resuming consumer:', error);
                callback({ error: error.message });
            }
        });

        /**
         * 8. DISCONNECT / LEAVE ROOM
         */
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
            
            if (socket.roomId) {
                const success = realtimeService.handleDisconnect(socket.id, socket.roomId);
                if (success) {
                    // Notify others that this peer left
                    socket.to(socket.roomId).emit('peerLeft', { peerId: socket.id });
                }
            }
        });
    });
};
