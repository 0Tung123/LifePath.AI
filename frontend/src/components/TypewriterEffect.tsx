"use client";

import { useState, useEffect, useRef } from "react";

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export default function TypewriterEffect({
  text,
  speed = 30,
  onComplete,
  className = "",
}: TypewriterEffectProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let index = 0;
    setDisplayedText("");
    setIsComplete(false);

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;

        // Tự động cuộn xuống khi văn bản dài
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      } else {
        clearInterval(interval);
        setIsComplete(true);
        if (onComplete) {
          onComplete();
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  const handleSkip = () => {
    setDisplayedText(text);
    setIsComplete(true);
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={className}
        dangerouslySetInnerHTML={{ __html: displayedText }}
      />

      {!isComplete && (
        <button
          onClick={handleSkip}
          className="mt-4 text-blue-400 hover:text-blue-300 transition-colors text-sm"
        >
          Bấm để hiển thị toàn bộ
        </button>
      )}
    </div>
  );
}
