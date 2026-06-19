const config = require('../../config/mediasoup.config');
const workerManager = require('./worker.manager');

/**
 * Room represents a single video call/meeting.
 * Each room has its own Mediasoup Router.
 * A Router is responsible for receiving media from Producers and forwarding it to Consumers.
 */
class Room {
    constructor(id, router) {
        this.id = id;
        this.router = router;
        // Map of socketId -> Peer
        this.peers = new Map();
    }

    addPeer(peer) {
        this.peers.set(peer.id, peer);
    }

    getPeer(socketId) {
        return this.peers.get(socketId);
    }

    removePeer(socketId) {
        const peer = this.peers.get(socketId);
        if (peer) {
            peer.close();
            this.peers.delete(socketId);
        }
    }

    getPeers() {
        return Array.from(this.peers.values());
    }
}

/**
 * Room Manager keeps track of all active rooms in the application.
 */
class RoomManager {
    constructor() {
        // Map of roomId -> Room
        this.rooms = new Map();
    }

    /**
     * Creates a new room or returns an existing one.
     */
    async getOrCreateRoom(roomId) {
        let room = this.rooms.get(roomId);

        // If the room doesn't exist, create it
        if (!room) {
            console.log(`Creating new room: ${roomId}`);
            
            // Get the next available worker to balance load
            const worker = workerManager.getOptimalWorker();
            
            // Create a Router for this room.
            // We pass the media codecs configured in config.js so the router knows what media it can handle.
            const router = await worker.createRouter({
                mediaCodecs: config.mediasoup.router.mediaCodecs
            });

            room = new Room(roomId, router);
            this.rooms.set(roomId, room);
        }

        return room;
    }

    /**
     * Gets an existing room by ID.
     */
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    /**
     * Cleans up a room if it's empty to free up server resources.
     */
    removeRoomIfEmpty(roomId) {
        const room = this.rooms.get(roomId);
        if (room && room.peers.size === 0) {
            console.log(`Room ${roomId} is empty, closing router and removing room.`);
            // Closing the router automatically closes all its Transports, Producers, and Consumers.
            room.router.close();
            this.rooms.delete(roomId);
        }
    }
}

// Export a singleton instance
module.exports = new RoomManager();
