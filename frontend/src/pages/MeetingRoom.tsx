import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users, PhoneOff, Mic, MicOff, Video, VideoOff, LayoutGrid } from 'lucide-react';
import { useWebRTC } from '../hooks/useWebRTC';
import { VideoTile } from '../components/VideoTile';

const MeetingRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const knownPeersRef = useRef<Set<string>>(new Set());

  const { localStream, remoteStreams, toggleAudio, toggleVideo, peerNames } = useWebRTC(roomId || '');

  // Show toast when a new participant joins (no duplicates)
  useEffect(() => {
    remoteStreams.forEach(r => {
      const id = r.peerId;
      if (!knownPeersRef.current.has(id)) {
        toast(`${peerNames.get(id) ?? id} joined the meeting`);
        knownPeersRef.current.add(id);
      }
    });
  }, [remoteStreams, peerNames]);

  if (!roomId) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl mb-4">Invalid Meeting Room</h1>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleToggleAudio = () => {
    toggleAudio();
    setAudioEnabled(!audioEnabled);
  };

  const handleToggleVideo = () => {
    toggleVideo();
    setVideoEnabled(!videoEnabled);
  };

  const handleLeaveMeeting = () => {
    navigate('/dashboard');
  };

  const totalParticipants = remoteStreams.length + 1; // +1 for local

  // Calculate dynamic grid columns and rows like MS Teams (Gallery View)
  const calculateGrid = (count: number) => {
    if (count === 1) return { cols: 1, rows: 1 };
    if (count === 2) return { cols: 2, rows: 1 };
    if (count <= 4) return { cols: 2, rows: 2 };
    if (count <= 6) return { cols: 3, rows: 2 };
    if (count <= 9) return { cols: 3, rows: 3 };
    if (count <= 12) return { cols: 4, rows: 3 };
    if (count <= 16) return { cols: 4, rows: 4 };
    return { cols: 5, rows: Math.ceil(count / 5) };
  };

  const { cols, rows } = calculateGrid(totalParticipants);

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col font-sans overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-white font-semibold tracking-wide">Meeting Room</h1>
            <p className="text-slate-400 text-sm">ID: {roomId}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-800/50 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700/50 flex items-center gap-2">
            <LayoutGrid size={16} />
            {totalParticipants} Participant{totalParticipants !== 1 ? 's' : ''}
          </div>
        </div>
      </div>



      {/* Video Grid Area */}
      <div className="flex-1 p-4 md:p-6 relative overflow-hidden flex items-center justify-center bg-slate-950">
        <div
          className="w-full h-full max-w-[1600px] grid gap-4 transition-all duration-500 ease-in-out"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
          }}
        >
          {/* Local User */}
          <div className="relative w-full h-full min-h-0 min-w-0 transition-all duration-500">
            <VideoTile stream={localStream} isLocal={true} name="You" />
          </div>

          {/* Remote Users */}
          {remoteStreams.map(remote => (
            <div key={remote.peerId} className="relative w-full h-full min-h-0 min-w-0 transition-all duration-500">
               <VideoTile stream={remote.stream} isLocal={false} name={peerNames.get(remote.peerId) || remote.peerId} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="h-24 pb-4 px-6 flex items-center justify-center z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/60 px-8 py-4 rounded-2xl flex items-center gap-6 shadow-2xl">
          {/* Microphone Toggle */}
          <button
            onClick={handleToggleAudio}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              audioEnabled
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
            }`}
          >
            {audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
          </button>

          {/* Camera Toggle */}
          <button
            onClick={handleToggleVideo}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              videoEnabled
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
            }`}
          >
            {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
          </button>

          <div className="w-px h-8 bg-slate-800 mx-2" />

          {/* End Call Button */}
          <button
            onClick={handleLeaveMeeting}
            className="h-14 px-8 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-semibold flex items-center gap-3 transition-all duration-300 shadow-lg shadow-red-600/20 hover:shadow-red-500/30"
          >
            <PhoneOff size={20} />
            <span>Leave</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
