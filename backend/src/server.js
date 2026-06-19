require("dotenv").config();
const https = require('https');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');

const mediasoupConfig = require('./config/mediasoup.config');
const workerManager = require('./realtime/managers/worker.manager');
const setupSocketHandlers = require('./realtime/socket/socket.handler');

require("./config/db");

const app = require("./app");
const { initCronJobs } = require("./modules/notifications/cron");

// Start cron jobs
initCronJobs();

const PORT = process.env.PORT || 5000;

async function startApp() {
    try {
        let privateKey, certificate;
        const certPath = path.join(__dirname, '..', 'cert.pem');
        const keyPath = path.join(__dirname, '..', 'key.pem');

        if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
            privateKey = fs.readFileSync(keyPath, 'utf8');
            certificate = fs.readFileSync(certPath, 'utf8');
        } else {
            console.log('Generating self-signed SSL certificates for HTTPS...');

            const attrs = [{ name: 'commonName', value: mediasoupConfig.listenIp }];
            const pems = await selfsigned.generate(attrs, { days: 365 });

            privateKey = pems.private;
            certificate = pems.cert;

            fs.writeFileSync(keyPath, privateKey);
            fs.writeFileSync(certPath, certificate);

            console.log('Certificates generated successfully.');
        }

        const server = https.createServer({ key: privateKey, cert: certificate }, app);

        // Initialize Socket.IO
        const io = new Server(server, {
            cors: {
                origin: '*'
            }
        });

        console.log('Initializing Mediasoup...');
        await workerManager.initialize();

        console.log('Setting up Socket.IO handlers...');
        setupSocketHandlers(io);

        server.listen(PORT, mediasoupConfig.listenIp, () => {
            const announcedIp = mediasoupConfig.mediasoup.webRtcTransport.listenIps[0].announcedIp;
            const mode = process.env.PUBLIC_IP ? 'PRODUCTION' : 'LOCAL';

            console.log('====================================');
            console.log(`Server is running in ${mode} mode!`);
            console.log(`Local Access: https://localhost:${PORT}`);
            console.log(`Network/Public Access: https://${announcedIp}:${PORT}`);
            if (!process.env.PUBLIC_IP) {
                console.log('Note: To run in production over the internet, provide a PUBLIC_IP environment variable.');
            }
            console.log('====================================');
        });

        // For shutdown down the server 
        const shutdown = async () => {
            console.log('\nShutting down server...');
            try {
                await workerManager.close();
                server.close(() => {
                    console.log('HTTPS server closed.');
                    process.exit(0);
                });
            } catch (error) {
                console.error('Shutdown error:', error);
                process.exit(1);
            }
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

    } catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
}

startApp();