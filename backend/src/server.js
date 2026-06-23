require("dotenv").config();
const https = require('https');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const mediasoupConfig = require('./config/mediasoup.config');
const workerManager = require('./realtime/managers/worker.manager');
const setupSocketHandlers = require('./realtime/socket/socket.handler');

const db = require("./config/db");

const app = require("./app");
const { initCronJobs } = require("./modules/notifications/cron");

initCronJobs();

const seedNotifications = async () => {
  try {
    const result = await new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) as count FROM notifications', (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
    if (result[0].count === 0) {
      console.log('Seeding initial notifications...');
      const sample = [
        [1, 'invite',   101, 'You have been invited to meeting 101'],
        [1, 'reminder',102, 'Reminder: meeting 102 starts soon'],
        [2, 'invite',   103, 'You have been invited to meeting 103']
      ];
      await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO notifications (user_id, type, meeting_id, message) VALUES ?',
          [sample],
          (err) => err ? reject(err) : resolve()
        );
      });
      console.log('Sample notifications seeded.');
    }
  } catch (e) {
    console.error('Error seeding notifications:', e);
  }
};

const PORT = process.env.PORT || 5000;

async function startApp() {
    try {
        await seedNotifications();
        
        const certPath = path.join(__dirname, '..', 'cert.pem');
        const keyPath = path.join(__dirname, '..', 'key.pem');

        if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
            console.error('ERROR: SSL certificates not found!');
            process.exit(1);
        }

        const privateKey = fs.readFileSync(keyPath, 'utf8');
        const certificate = fs.readFileSync(certPath, 'utf8');

        const server = https.createServer({
            key: privateKey,
            cert: certificate
        }, app);

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
            console.log('====================================');
        });

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