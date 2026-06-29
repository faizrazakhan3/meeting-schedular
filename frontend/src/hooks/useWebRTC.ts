import { useEffect, useState, useRef } from 'react';
import { WebRTCClient } from '../lib/WebRTCClient';
import type { RemoteStream } from '../lib/WebRTCClient';
import toast from 'react-hot-toast';

export function useWebRTC(roomId: string) {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
    const [peerNames, setPeerNames] = useState<Map<string, string>>(new Map());
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

        // Register handler to receive userJoined events with names
        client.setUserJoinedHandler((peerId, name) => {
            setPeerNames(prev => {
                const newMap = new Map(prev);
                newMap.set(peerId, name);
                return newMap;
            });

            toast.success(`${name} joined the meeting`);
        });

        // Start local media automatically
        client.startLocalMedia().then(stream => {
            setLocalStream(stream);
        }).catch(err => {
            console.error("Could not start local media", err);
            toast.error(`Could not access camera/microphone: ${err.message || err}`);
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
        peerNames,
        toggleAudio,
        toggleVideo,
    };
}
