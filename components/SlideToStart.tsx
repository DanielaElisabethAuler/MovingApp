"use client";

import { useRef, useState } from "react";

// Slider, den man von links nach rechts zieht, um zu starten.
// Funktioniert mit Maus + Touch (Pointer Events).
export function SlideToStart({
  onComplete,
  label = "Zum Starten ziehen",
}: {
  onComplete: () => void;
  label?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pos = useRef(0);
  const [x, setX] = useState(0);

  const KNOB = 56;

  function maxX() {
    const el = track.current;
    return el ? el.clientWidth - KNOB - 8 : 0;
  }

  function set(v: number) {
    pos.current = v;
    setX(v);
  }

  function onDown(e: React.PointerEvent) {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onMove(e: React.PointerEvent) {
    if (!dragging.current || !track.current) return;
    const rect = track.current.getBoundingClientRect();
    const nx = Math.max(0, Math.min(maxX(), e.clientX - rect.left - KNOB / 2));
    set(nx);
  }

  function onUp() {
    if (!dragging.current) return;
    dragging.current = false;
    if (pos.current >= maxX() - 6) {
      set(maxX());
      onComplete();
    } else {
      set(0);
    }
  }

  const progress = maxX() > 0 ? x / maxX() : 0;

  return (
    <div className="slide" ref={track}>
      <span className="slide-label" style={{ opacity: 1 - progress * 1.4 }}>
        {label}
      </span>
      <button
        type="button"
        className="slide-knob"
        style={{ transform: `translateX(${x}px)` }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        aria-label={label}
      >
        →
      </button>
    </div>
  );
}
