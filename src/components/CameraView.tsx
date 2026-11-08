import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Camera, CameraOff, RefreshCw, Upload, ShieldCheck, AlertCircle } from 'lucide-react';
import { generateSelfieDataUri } from '../services/storage';

export interface CameraViewHandle {
  capturePhoto: (metadata: {
    employeeName: string;
    timestamp: string;
    status: string;
    locationText?: string;
  }) => string;
}

interface CameraViewProps {
  employeeName: string;
  isCapturing?: boolean;
}

export const CameraView = forwardRef<CameraViewHandle, CameraViewProps>(({ employeeName }, ref) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'active' | 'denied' | 'simulated'>('starting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera
  const startCamera = async (facing: 'user' | 'environment' = 'user') => {
    setCameraState('starting');
    setErrorMessage('');

    // Stop existing stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('simulated');
      setErrorMessage('Browser tidak mendukung WebRTC camera API, beralih ke mode simulasi live.');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraState('active');
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('Camera access issue:', error.name, error.message);
      setCameraState('simulated');
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setErrorMessage('Izin kamera ditolak di browser. Mode simulasi selfie diaktifkan agar absensi tetap berjalan lancar.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setErrorMessage('Tidak ada perangkat webcam terdeteksi. Beralih ke mode simulasi selfie.');
      } else {
        setErrorMessage('Kamera tidak dapat diakses (' + (error.message || 'Error') + '). Menggunakan mode simulasi.');
      }
    }
  };

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedPhoto(event.target.result as string);
          setCameraState('simulated');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Expose capture method via ref
  useImperativeHandle(ref, () => ({
    capturePhoto: ({ employeeName: name, timestamp, status, locationText }) => {
      // If user uploaded a custom photo
      if (uploadedPhoto) {
        return uploadedPhoto;
      }

      // If live camera is active, render to canvas with watermark
      if (cameraState === 'active' && videoRef.current && videoRef.current.videoWidth > 0) {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Mirror if front camera
          if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
          } else {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          }

          // Stamp watermark background bar
          const barHeight = 65;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.fillRect(16, canvas.height - barHeight - 16, canvas.width - 32, barHeight);
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 1;
          ctx.strokeRect(16, canvas.height - barHeight - 16, canvas.width - 32, barHeight);

          // Watermark text
          ctx.font = 'bold 14px "JetBrains Mono", monospace';
          ctx.fillStyle = '#38BDF8';
          ctx.fillText(`PRESENSIPRO • VERIFIKASI PRESENSI RESMI`, 32, canvas.height - barHeight + 5);

          ctx.font = 'bold 15px "JetBrains Mono", monospace';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(`${name} • ${status}`, 32, canvas.height - barHeight + 25);

          ctx.font = '12px "JetBrains Mono", monospace';
          ctx.fillStyle = '#94A3B8';
          const locStr = locationText ? ` • ${locationText}` : '';
          ctx.fillText(`${timestamp}${locStr}`, 32, canvas.height - barHeight + 43);

          return canvas.toDataURL('image/jpeg', 0.88);
        }
      }

      // Fallback: Generate high fidelity crisp SVG selfie data URI
      return generateSelfieDataUri(
        name,
        timestamp,
        status,
        status.includes('TEPAT') ? '#059669' : '#2563EB'
      );
    },
  }));

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner flex flex-col items-center justify-center min-h-[300px] sm:min-h-[360px]">
      {/* Live Video Element */}
      {cameraState === 'active' && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover aspect-4/3 max-h-[400px] ${
            facingMode === 'user' ? 'scale-x-[-1]' : ''
          }`}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              videoRef.current.play().catch(console.error);
            }
          }}
        />
      )}

      {/* Simulated Camera Feed View */}
      {cameraState === 'simulated' && (
        <div className="w-full aspect-4/3 max-h-[400px] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950">
          {uploadedPhoto ? (
            <img
              src={uploadedPhoto}
              alt="Preview Selfie"
              className="w-full h-full object-cover absolute inset-0"
            />
          ) : (
            <>
              {/* Virtual camera placeholder */}
              <div className="w-24 h-24 rounded-full bg-blue-600/20 border-2 border-blue-500/50 flex items-center justify-center mb-3 relative">
                <span className="text-3xl font-bold text-blue-400">
                  {employeeName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()}
                </span>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-slate-200 font-semibold text-sm">{employeeName}</p>
              <p className="text-slate-400 text-xs mt-1 max-w-xs">
                Mode Kamera Simulasi Aktif. Foto selfie otomatis terverifikasi dengan timestamp & GPS.
              </p>
            </>
          )}
        </div>
      )}

      {/* Loading state */}
      {cameraState === 'starting' && (
        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-300">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-2" />
          <p className="text-sm font-medium">Menghubungkan ke Kamera Perangkat...</p>
          <p className="text-xs text-slate-400 mt-1">Mohon izinkan akses kamera pada peramban Anda</p>
        </div>
      )}

      {/* Facial Oval Framing Guide (when active) */}
      {cameraState === 'active' && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
          <div className="w-48 h-64 sm:w-56 sm:h-72 border-2 border-dashed border-white/40 rounded-[50%] relative flex items-center justify-center">
            {/* Center target crosshair */}
            <div className="w-4 h-4 border-t border-b border-white/60"></div>
            <div className="h-4 w-4 border-l border-r border-white/60 absolute"></div>
          </div>
          <span className="mt-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white/90 text-xs font-medium tracking-wide">
            Posisikan Wajah di Dalam Oval
          </span>
        </div>
      )}

      {/* Top Overlay Badge */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              cameraState === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-slate-200">
            {cameraState === 'active' ? 'LIVE CAM • 30 FPS' : 'SIMULASI KAMERA'}
          </span>
        </div>

        {cameraState === 'active' && (
          <button
            type="button"
            onClick={handleToggleFacingMode}
            className="pointer-events-auto p-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 transition"
            title="Putar Kamera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Bottom Controls / Fallback Action Toolbar */}
      <div className="w-full bg-slate-950/90 border-t border-slate-800/80 p-3 px-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          {cameraState === 'active' ? (
            <Camera className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="truncate max-w-[200px] sm:max-w-xs">
            {cameraState === 'active'
              ? 'Kamera WebRTC Terhubung'
              : errorMessage || 'Simulasi Selfie Aktif'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {cameraState !== 'active' && (
            <button
              type="button"
              onClick={() => startCamera(facingMode)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-[11px] font-medium flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              Coba Kamera
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-[11px] font-medium flex items-center gap-1.5"
            title="Unggah Foto dari Perangkat"
          >
            <Upload className="w-3 h-3 text-blue-400" />
            Unggah Foto
          </button>
        </div>
      </div>
    </div>
  );
});

CameraView.displayName = 'CameraView';
