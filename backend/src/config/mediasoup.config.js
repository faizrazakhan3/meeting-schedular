const os = require('os');

module.exports = {
    // Web server configuration
    listenIp: '0.0.0.0',
    listenPort: process.env.PORT || 5000,
    
    // Mediasoup configuration
    mediasoup: {
        // Number of mediasoup workers to launch.
        // Usually one per CPU core.
        numWorkers: Object.keys(os.cpus()).length,
        // -it used all the cpu like if you have 11
        // numWorkers:3,
        
        // mediasoup Worker settings
        worker: {
            rtcMinPort: 10000,
            rtcMaxPort: 10100,
            logLevel: 'warn',
            logTags: [
                'info',
                'ice',
                'dtls',
                'rtp',
                'srtp',
                'rtcp'
            ],
        },
        
        // mediasoup Router settings
        // The router handles media routing within a room.
        router: {
            // RtpCodecCapability[]: Represents the codecs supported by this router.
            // We configure the router to support basic audio and video codecs.
            mediaCodecs: [
                {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000,
                    channels: 2
                },
                {
                    kind: 'video',
                    mimeType: 'video/VP8',
                    clockRate: 90000,
                    parameters: {
                        'x-google-start-bitrate': 1000
                    }
                }
            ]
        },
        
        // mediasoup WebRtcTransport settings
        // Defines how the server communicates with the client's WebRTC endpoint.
        webRtcTransport: {
            listenIps: [
                {
                    // Listen on all interfaces
                    ip: '0.0.0.0',
                    // The announced IP is what the client will use to connect to this server.
                    // For local development, your local network IP ('10.200.32.63' or '127.0.0.1') is fine.
                    // In production, this MUST be the server's public IP address.
                    // We use process.env.PUBLIC_IP to allow dynamic configuration.
                    announcedIp: process.env.PUBLIC_IP || '10.200.32.63'
                }
            ],
            // initialAvailableOutgoingBitrate is used by the SFU to estimate bandwidth.
            initialAvailableOutgoingBitrate: 1000000,
            // Maximum bitrate in bps
            maxIncomingBitrate: 1500000
        }
    }
};
