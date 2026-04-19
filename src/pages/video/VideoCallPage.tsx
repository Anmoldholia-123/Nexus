import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, Users, MoreVertical
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const VideoCallPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Initialize camera mock using WebRTC
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        const str = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(str);
        activeStream = str;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = str;
        }
      } catch (err) {
        console.warn("Camera access denied or unsupported, falling back to mock UI.");
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
    }
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
    }
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = displayStream;
        }
        
        displayStream.getVideoTracks()[0].onended = () => {
          if (localVideoRef.current && stream) {
            localVideoRef.current.srcObject = stream;
          }
          setIsScreenSharing(false);
        };
        setIsScreenSharing(true);
      } catch (e) {
        console.log("Screenshare canceled.");
      }
    } else {
      if (localVideoRef.current && stream) {
        localVideoRef.current.srcObject = stream;
      }
      setIsScreenSharing(false);
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    // Return back to where we came from, typically the dashboard or meetings page
    navigate(-1);
  };

  return (
    <div className="h-[calc(100vh-4rem)] -m-6 bg-gray-900 flex flex-col relative animate-fade-in">
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-gray-900/80 to-transparent">
        <h2 className="text-white font-medium">Meeting: {id || 'General Room'}</h2>
        <div className="flex space-x-3 items-center text-white">
          <span className="flex items-center text-sm"><Users size={16} className="mr-1"/> 2</span>
        </div>
      </div>

      {/* Main Video Area Grid */}
      <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Remote Participant Mock */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-800 flex items-center justify-center border border-gray-700">
          <div className="text-center">
            <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl text-white font-bold">
              MC
            </div>
            <p className="text-white font-medium">Michael Chen (Waiting)</p>
          </div>
          <div className="absolute bottom-4 left-4 bg-gray-900/60 px-3 py-1 rounded-md text-white text-sm">
            Michael Chen
          </div>
        </div>

        {/* Local Participant */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-800 border border-gray-700">
          {isVideoEnabled ? (
            <video 
              ref={localVideoRef}
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
               <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl text-white font-bold">
                You
               </div>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-gray-900/60 px-3 py-1 rounded-md text-white text-sm flex items-center">
            You {!isAudioEnabled && <MicOff size={14} className="ml-2 text-red-500" />}
          </div>
        </div>
        
      </div>

      {/* Controls Footer */}
      <div className="h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-center space-x-6">
        
        <button 
          onClick={toggleAudio}
          className={`p-3 rounded-full flex items-center justify-center transition-colors ${
            isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {isAudioEnabled ? <Mic className="text-white" size={24} /> : <MicOff className="text-white" size={24} />}
        </button>

        <button 
          onClick={toggleVideo}
          className={`p-3 rounded-full flex items-center justify-center transition-colors ${
            isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {isVideoEnabled ? <Video className="text-white" size={24} /> : <VideoOff className="text-white" size={24} />}
        </button>

        <button 
          onClick={toggleScreenShare}
          className={`p-3 rounded-full flex items-center justify-center transition-colors ${
            isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <MonitorUp className="text-white" size={24} />
        </button>

        <button className="p-3 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600">
          <MoreVertical className="text-white" size={24} />
        </button>

        <button 
          onClick={endCall}
          className="p-3 px-6 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-medium"
        >
          <PhoneOff size={24} className="mr-2" />
          End Call
        </button>

      </div>
    </div>
  );
};
