/**
 * Peer Store keeps track of a single user's state.
 * 
 * Transport: The WebRTC connection between the client and Mediasoup. (Usually one for sending, one for receiving).
 * Producer: An entity sending media TO the server (e.g., user's microphone or camera).
 * Consumer: An entity receiving media FROM the server (e.g., watching someone else's camera).
 */
class Peer {
    constructor(socketId) {
        this.id = socketId;
        
        this.transports = new Map();
        this.producers = new Map();
        this.consumers = new Map();
    }

    /**
     * Adds a WebRTC transport to this peer.
     */
    addTransport(transport) {
        this.transports.set(transport.id, transport);
    }

    /**
     * Retrieves a transport by its ID.
     */
    getTransport(id) {
        return this.transports.get(id);
    }

    addProducer(producer) {
        this.producers.set(producer.id, producer);
    }

    getProducer(id) {
        return this.producers.get(id);
    }

    /**
     * Adds a Consumer (receiving media from server) to this peer.
     */
    addConsumer(consumer) {
        this.consumers.set(consumer.id, consumer);
    }

    
    close() {
        console.log(`Closing peer ${this.id}`);
        
        // Close all transports. 
        // Closing a transport automatically closes its associated producers and consumers in Mediasoup.
        for (const transport of this.transports.values()) {
            transport.close();
        }

        this.transports.clear();
        this.producers.clear();
        this.consumers.clear();
    }
}

module.exports = Peer;
