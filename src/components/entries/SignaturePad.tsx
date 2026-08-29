'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import styles from './SignaturePad.module.css';

export interface SignaturePadHandle {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
}

// A minimal canvas signature pad — no external dependency. Exposes an
// imperative handle instead of firing onChange per stroke, since the
// parent only ever needs the image at save time.
export const SignaturePad = forwardRef<SignaturePadHandle, { width?: number; height?: number }>(
  function SignaturePad({ width = 400, height = 150 }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawingRef = useRef(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    function getContext() {
      return canvasRef.current?.getContext('2d') ?? null;
    }

    function paintWhiteBackground() {
      const canvas = canvasRef.current;
      const ctx = getContext();
      if (canvas && ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    // Transparent by default — exported without this, the PNG would have
    // no background, which reads oddly when viewed as a saved record later.
    useEffect(() => {
      paintWhiteBackground();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    }

    function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
      const ctx = getContext();
      if (!ctx) return;
      drawingRef.current = true;
      const { x, y } = getPoint(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
      if (!drawingRef.current) return;
      const ctx = getContext();
      if (!ctx) return;
      const { x, y } = getPoint(e);
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
      if (!hasDrawn) setHasDrawn(true);
    }

    function handlePointerUp() {
      drawingRef.current = false;
    }

    useImperativeHandle(ref, () => ({
      clear() {
        paintWhiteBackground();
        setHasDrawn(false);
      },
      isEmpty() {
        return !hasDrawn;
      },
      toDataURL() {
        return canvasRef.current?.toDataURL('image/png') ?? '';
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.canvas}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    );
  },
);
