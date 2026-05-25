"use client";

import { useRef, useEffect, useCallback, useState } from "react";

const WHATSAPP_NUMBER = "12762528415";

const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi Learnexity! I need some help with ..."
);

const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

const BUTTON_SIZE = 36;
const PADDING = 8;
const DRAG_THRESHOLD = 4;

export default function WhatsAppButton() {
  const containerRef = useRef<HTMLDivElement>(null);

  const didDrag = useRef(false);

  const isDragging = useRef(false);

  const dragOffset = useRef({ x: 0, y: 0 });

  const pointerStart = useRef({ x: 0, y: 0 });

  const activePointerId = useRef<number | null>(null);

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  // Initial position
  useEffect(() => {
    setPos({
      x: window.innerWidth - 280,
      y: window.innerHeight - 100,
    });
  }, []);

  // Keep inside screen on resize
  useEffect(() => {
    const onResize = () => {
      setPos((prev) => {
        if (!prev || !containerRef.current) return prev;

        const w = containerRef.current.offsetWidth;

        return {
          x: Math.max(
            PADDING,
            Math.min(prev.x, window.innerWidth - w - PADDING)
          ),
          y: Math.max(
            PADDING,
            Math.min(
              prev.y,
              window.innerHeight - BUTTON_SIZE - PADDING
            )
          ),
        };
      });
    };

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Actual dragging movement
  const onWindowPointerMove = useCallback((e: PointerEvent) => {
    if (
      e.pointerId !== activePointerId.current ||
      !containerRef.current ||
      !isDragging.current
    ) {
      return;
    }

    const w = containerRef.current.offsetWidth;

    const newX = Math.max(
      PADDING,
      Math.min(
        e.clientX - dragOffset.current.x,
        window.innerWidth - w - PADDING
      )
    );

    const newY = Math.max(
      PADDING,
      Math.min(
        e.clientY - dragOffset.current.y,
        window.innerHeight - BUTTON_SIZE - PADDING
      )
    );

    setPos({
      x: newX,
      y: newY,
    });
  }, []);

  // Drag end
  const onWindowPointerUp = useCallback(
    (e: PointerEvent) => {
      if (e.pointerId !== activePointerId.current) return;

      isDragging.current = false;

      window.removeEventListener(
        "pointermove",
        onWindowPointerMove
      );

      window.removeEventListener(
        "pointerup",
        onWindowPointerUp
      );

      activePointerId.current = null;

      // Snap left/right ONLY if near center
      setPos((prev) => {
        if (!prev || !containerRef.current) return prev;

        const w = containerRef.current.offsetWidth;

        const centerX = prev.x + w / 2;

        const inCenterZone =
          centerX > window.innerWidth * 0.35 &&
          centerX < window.innerWidth * 0.65;

        if (!inCenterZone) return prev;

        return {
          x:
            centerX < window.innerWidth / 2
              ? PADDING
              : window.innerWidth - w - PADDING,
          y: prev.y,
        };
      });
    },
    [onWindowPointerMove]
  );

  // Start press
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLAnchorElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) {
        return;
      }

      didDrag.current = false;

      isDragging.current = false;

      activePointerId.current = e.pointerId;

      const containerRect =
        containerRef.current!.getBoundingClientRect();

      dragOffset.current = {
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top,
      };

      pointerStart.current = {
        x: e.clientX,
        y: e.clientY,
      };

      // Wait until threshold crossed
      const onEarlyMove = (ev: PointerEvent) => {
        if (ev.pointerId !== activePointerId.current) {
          return;
        }

        const dx = ev.clientX - pointerStart.current.x;

        const dy = ev.clientY - pointerStart.current.y;

        // START dragging ONLY after threshold
        if (
          !isDragging.current &&
          Math.hypot(dx, dy) >= DRAG_THRESHOLD
        ) {
          isDragging.current = true;

          didDrag.current = true;

          window.addEventListener(
            "pointermove",
            onWindowPointerMove
          );

          window.addEventListener(
            "pointerup",
            onWindowPointerUp
          );
        }
      };

      const onEarlyCancel = (ev: PointerEvent) => {
        if (ev.pointerId !== activePointerId.current) {
          return;
        }

        isDragging.current = false;

        window.removeEventListener(
          "pointermove",
          onEarlyMove
        );

        window.removeEventListener(
          "pointerup",
          onEarlyCancel
        );

        activePointerId.current = null;
      };

      window.addEventListener("pointermove", onEarlyMove);

      window.addEventListener("pointerup", onEarlyCancel);
    },
    [onWindowPointerMove, onWindowPointerUp]
  );

  // Prevent click after drag
  const onClickCapture = useCallback(
    (e: React.MouseEvent) => {
      if (didDrag.current) {
        e.preventDefault();

        e.stopPropagation();

        didDrag.current = false;
      }
    },
    []
  );

  if (!pos) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        userSelect: "none",
      }}
    >
      <style>{`
        @keyframes wa-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(37,211,102,0.45);
          }

          50% {
            box-shadow: 0 0 0 10px rgba(37,211,102,0);
          }
        }

        @keyframes wa-badge-in {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }

          70% {
            transform: scale(1.2);
          }

          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes wa-badge-pulse {
          0%, 100% {
            opacity: 1;
          }

          50% {
            opacity: 0.4;
          }
        }
      `}</style>

      {/* Label */}
      <div
        style={{
          background: "#0f0f0f",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 500,
          padding: "8px 14px",
          borderRadius: "8px",
          whiteSpace: "nowrap",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.08)",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          lineHeight: 1.5,
          pointerEvents: "none",
        }}
      >
        Need help?{" "}
        <span
          style={{
            color: "#25D366",
            fontWeight: 700,
          }}
        >
          Get in touch
        </span>
      </div>

      {/* WhatsApp Button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        draggable={false}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: `${BUTTON_SIZE}px`,
          height: `${BUTTON_SIZE}px`,
          touchAction: "none",
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
          boxShadow:
            "0 4px 16px rgba(37,211,102,0.4)",
          cursor: isDragging.current ? "grabbing" : "grab",
          textDecoration: "none",
          animation:
            "wa-pulse 2.5s ease-in-out infinite",
          flexShrink: 0,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="28"
          height="28"
          fill="#fff"
          style={{ pointerEvents: "none" }}
        >
          <path d="M16.003 2.667C8.639 2.667 2.667 8.639 2.667 16c0 2.349.635 4.552 1.742 6.455L2.667 29.333l7.09-1.717A13.267 13.267 0 0 0 16.003 29.333C23.365 29.333 29.333 23.361 29.333 16S23.365 2.667 16.003 2.667zm0 24a10.605 10.605 0 0 1-5.43-1.494l-.389-.232-4.207 1.019 1.052-4.086-.254-.397A10.587 10.587 0 0 1 5.333 16c0-5.885 4.785-10.667 10.67-10.667S26.667 10.115 26.667 16 21.888 26.667 16.003 26.667zm5.848-7.982c-.32-.16-1.893-.934-2.187-1.04-.293-.107-.507-.16-.72.16-.213.32-.826 1.04-.987 1.2-.16.16-.32.187-.64.027-1.893-.947-3.134-1.69-4.374-3.827-.33-.568.33-.527.947-1.76.107-.213.053-.4-.027-.56-.08-.16-.72-1.734-.987-2.374-.26-.621-.527-.534-.72-.545-.186-.01-.4-.013-.613-.013s-.56.08-.853.4c-.293.32-1.12 1.094-1.12 2.667s1.147 3.094 1.307 3.307c.16.213 2.254 3.441 5.467 4.827 2.032.877 2.828.952 3.844.8.613-.093 1.893-.774 2.16-1.52.267-.747.267-1.387.187-1.52-.08-.133-.293-.213-.613-.373z" />
        </svg>

        {/* Online Badge */}
        <span
          style={{
            position: "absolute",
            top: "2px",
            right: "2px",
            width: "13px",
            height: "13px",
            background: "#4ade80",
            borderRadius: "50%",
            border: "2px solid #090909",
            animation:
              "wa-badge-in 0.4s ease forwards, wa-badge-pulse 2s ease-in-out 0.4s infinite",
          }}
        />
      </a>
    </div>
  );
}