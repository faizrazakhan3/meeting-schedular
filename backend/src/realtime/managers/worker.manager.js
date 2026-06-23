const mediasoup = require('mediasoup');
const config = require('../../config/mediasoup.config');

/**
 * Worker Manager is responsible for starting and keeping track of Mediasoup Workers.
 * A Worker is a C++ process that handles the actual media routing. 
 * We typically create one Worker per CPU core to maximize performance.
 */
class WorkerManager {
    constructor() {
        this.workers = [];
        this.nextWorkerIndex = 0;
    }

    /**
     * Creates Mediasoup workers based on the configuration.
     * This should be called once when the server starts.
     */
    async initialize() {
        console.log(`Starting ${config.mediasoup.numWorkers} Mediasoup workers...`);
        
        for (let i = 0; i < config.mediasoup.numWorkers; i++) {
            const worker = await mediasoup.createWorker({
                logLevel: config.mediasoup.worker.logLevel,
                logTags: config.mediasoup.worker.logTags,
                rtcMinPort: config.mediasoup.worker.rtcMinPort,
                rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
            });

            // If the worker process dies unexpectedly, log it and exit.
            // In a production environment, you might want to handle this gracefully.
            worker.on('died', () => {
                console.error(`Mediasoup worker ${worker.pid} died, exiting...`);
                process.exit(1);
            });

            this.workers.push(worker);
            console.log(`Worker ${worker.pid} created.`);
        }
    }

    /**
     * Gets the next available worker using a simple round-robin approach.
     * This distributes new rooms evenly across the CPU cores.
     * 
     * @returns {mediasoup.types.Worker}
     */
    getOptimalWorker() {
        const worker = this.workers[this.nextWorkerIndex];
        
        if (this.workers.length > 1) {
            this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.workers.length;
        }

        return worker;
    }

    async close() {
        console.log('Closing Mediasoup workers...');

        for (const worker of this.workers) {
            worker.close();
        }

        this.workers = [];
        this.nextWorkerIndex = 0;
    }
}

module.exports = new WorkerManager();
