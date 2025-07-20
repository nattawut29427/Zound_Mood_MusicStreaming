"use client";

import React, { useRef, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";

export default function Page() {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [startDuration, setStartDuration] = React.useState(0);
  const [endDuration, setEndDuration] = React.useState(0);

  useEffect(() => {
    const regions = RegionsPlugin.create();
    if (!waveformRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "violet",
      progressColor: "purple",
      height: 64,
      barWidth: 5,
      barRadius: 100,
      responsive: true,
      minPxPerSec: 50,
      hideScrollbar: true,
      plugins: [regions],
    });

    wavesurfer.load(
      "https://pub-c2871af45ec34b41aec9f740046cdd02.r2.dev/Diarytrimm/3da72ff9-45ae-46a6-8cd8-ea062d698633.mp3"
    );

    wavesurfer.on("ready", () => {
      const region = regions.addRegion({
        start: 0,
        end: 5,
        content: "Cramped region",
        color: "rgba(235, 0, 0, 0.5)",
        resize: true,
        drag: true,
      });
    });

    // เมื่อ region ถูกอัปเดต
    regions.on("region-updated", (region) => {
      const start = region.start;
      const end = region.end;

      setStartDuration(start);
      setEndDuration(end);

      wavesurfer.play(start, end);
    });

    regions.on("region-clicked", (region) => {
      wavesurfer.stop();
    });

    wavesurferRef.current = wavesurfer;

    return () => {
      wavesurfer.destroy();
    };
  }, []);

  return (
    <div>
      <div
        ref={waveformRef}
        id="waveform"
        style={{
          pointerEvents: "none", 
          position: "relative",
        }}
      />
      <div>
        <p>Start: {startDuration}s</p>
        <p>End: {endDuration}s</p>
      </div>
    </div>
  );
}
