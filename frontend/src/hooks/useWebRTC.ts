import { useEffect, useState, useRef } from 'react';
import { WebRTCClient } from '../lib/WebRTCClient';
import type { RemoteStream } from '../lib/WebRTCClient';

export function useWebRTC(roomId: string) {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
    const clientRef = useRef<WebRTCClient | null>(null);

    useEffect(() => {
        if (!roomId) return;

        const handleStreamsChange = () => {
            if (clientRef.current) {
                setRemoteStreams(Array.from(clientRef.current.remoteStreams.values()));
            }
        };

        const client = new WebRTCClient(roomId, handleStreamsChange);
        clientRef.current = client;

        // Start local media automatically
        client.startLocalMedia().then(stream => {
            setLocalStream(stream);
        }).catch(err => {
            console.error("Could not start local media", err);
        });

        return () => {
            client.disconnect();
            clientRef.current = null;
        };
    }, [roomId]);

    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
            }
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
            }
        }
    };

    return {
        localStream,
        remoteStreams,
        toggleAudio,
        toggleVideo,
    };
}
