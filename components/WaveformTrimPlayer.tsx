"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min.js";
import { Howl } from "howler";

const AUDIO_SRC = "/audio/song2.mp3";
const FIXED_DURATION = 30;

export default function WaveformRegionSelector() {
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionRef = useRef<any>(null);
  const soundRef = useRef<Howl | null>(null);

  const [regionStart, setRegionStart] = useState(0);

  useEffect(() => {
    if (!waveformRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current!,
      waveColor: "#ddd",
      progressColor: "#3b82f6",
      height: 100,
      barWidth: 2,
      responsive: true,
      plugins: [
        RegionsPlugin.create({
          regions: [],
          dragSelection: {
            slop: 5,
          },
        }),
      ],
    });

    wavesurfer.load(AUDIO_SRC);

    wavesurfer.on("ready", () => {
      const duration = wavesurfer.getDuration();
      const defaultStart = Math.max(0, duration / 2 - FIXED_DURATION / 2);
      const defaultEnd = defaultStart + FIXED_DURATION;

      // เพิ่ม region เริ่มต้น
      const region = wavesurfer.addRegion({
        // start: defaultStart,
        // end: defaultEnd,
        // color: "rgba(59, 130, 246, 0.3)",
        // drag: true,
        // resize: true,
      });

      regionRef.current = region;
      setRegionStart(defaultStart);

      // เมื่อ region ถูกลาก
      region.on("update-end", () => {
        const start = region.start;
        const end = region.end;

        // บังคับให้ความยาวอยู่ที่ 30 วิ
        if (end - start !== FIXED_DURATION) {
          region.update({ end: start + FIXED_DURATION });
        }

        setRegionStart(start);
      });
    });

    wavesurferRef.current = wavesurfer;

    return () => {
      wavesurfer.destroy();
    };
  }, []);

  const playRegion = () => {
    if (soundRef.current) {
      soundRef.current.unload();
    }

    const sound = new Howl({
      src: [AUDIO_SRC],
      html5: true,
      preload: true,
      onplay: () => {
        sound.seek(regionStart);
        setTimeout(() => {
          sound.pause();
        }, FIXED_DURATION * 1000);
      },
    });

    soundRef.current = sound;
    sound.play();
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold">
        🎚️ เลือกช่วง 30 วินาทีจาก Waveform
      </h2>

      <div ref={waveformRef} className="w-full" />

      <div className="text-sm text-gray-700">
        ช่วงที่เลือก: {regionStart.toFixed(1)}s -{" "}
        {(regionStart + FIXED_DURATION).toFixed(1)}s
      </div>

      <button
        onClick={playRegion}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ▶️ เล่นช่วงที่เลือก
      </button>
    </div>
  );
}
