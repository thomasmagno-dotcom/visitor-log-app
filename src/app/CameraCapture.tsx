"use client";

import { useRef, useState, useEffect, useCallback } from "react";

type Props = {
  onCapture: (dataUrl: string) => void;
  onClear: () => void;
  captured: string | null;
};

export default function CameraCapture({ onCapture, onClear, captured }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const startCamera = useCallback(async (mode: "user" | "environment") => {
    // Stop any existing stream first
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError("Camera access denied. Please allow camera access in your browser settings.");
    }
  }, []);

  useEffect(() => {
    if (cameraOpen) startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [cameraOpen, facingMode, startCamera]);

  function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraOpen(false);
    onCapture(dataUrl);
  }

  function retake() {
    onClear();
    setCameraOpen(true);
  }

  function toggleCamera() {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
  }

  // ── Captured preview ──────────────────────────────────────────────
  if (captured) {
    return (
      <div className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-xl border-2 border-green-400 bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={captured} alt="Visitor photo" className="w-full object-cover max-h-64" />
          <span className="absolute top-2 right-2 rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Photo captured
          </span>
        </div>
        <button
          type="button"
          onClick={retake}
          className="self-start rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Retake Photo
        </button>
      </div>
    );
  }

  // ── Camera open ───────────────────────────────────────────────────
  if (cameraOpen) {
    return (
      <div className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-xl bg-black border border-gray-200">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-h-64 object-cover"
          />
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4 text-center text-sm text-red-300">
              {error}
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={takePhoto}
            className="flex-1 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Take Photo
          </button>
          <button
            type="button"
            onClick={toggleCamera}
            title="Flip camera"
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => { streamRef.current?.getTracks().forEach((t) => t.stop()); setCameraOpen(false); }}
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Prompt to open camera ─────────────────────────────────────────
  return (
    <button
      type="button"
      onClick={() => setCameraOpen(true)}
      className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center hover:border-green-400 hover:bg-green-50 transition-colors group"
    >
      <svg className="mx-auto h-10 w-10 text-gray-300 group-hover:text-green-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <p className="mt-2 text-sm font-semibold text-gray-600 group-hover:text-green-700">Open Camera</p>
      <p className="mt-0.5 text-xs text-gray-400">A photo is required to complete sign-in</p>
    </button>
  );
}
