import React, { useEffect, useRef } from 'react';
import { MicOff } from 'lucide-react';

interface VideoTileProps {
    stream: MediaStream | null;
    isLocal?: boolean;
    name?: string;
}

export const VideoTile: React.FC<VideoTileProps> = ({ stream, isLocal = false, name = "Participant" }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(err => {
                if (err.name !== 'AbortError') {
                    console.error("Error playing video stream:", err);
                }
            });
        }
    }, [stream]);

    // Check if video and audio tracks exist and are enabled
    const hasVideo = stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;
    const hasAudio = stream && stream.getAudioTracks().length > 0 && stream.getAudioTracks()[0].enabled;

    return (
        <div className="relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden group border border-slate-800">
            {stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal} // Always mute local video so you don't hear yourself
                    className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''} ${!hasVideo ? 'hidden' : ''}`}
                />
            ) : null}

            {/* Placeholder if no video */}
            {(!stream || !hasVideo) && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-4xl font-semibold text-slate-400">
                        {name.charAt(0).toUpperCase()}
                    </div>
                </div>
            )}

            {/* Name overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                    <span className="text-white font-medium text-sm">
                        {isLocal ? 'You' : name}
                    </span>
                    <div className="flex gap-2">
                        {!hasAudio && (
                            <div className="bg-red-500/20 text-red-500 p-1 rounded-full">
                                <MicOff size={14} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
