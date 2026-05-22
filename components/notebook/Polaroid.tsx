import Image from "next/image";
import { ReactNode } from "react";

/**
 * A standalone polaroid card (for use OUTSIDE the PhotoWall — where the
 * wire+swing physics aren't needed). White border, optional tape strip,
 * caption at bottom. Slightly rotated.
 */
export default function Polaroid({
  src,
  alt,
  caption,
  width = 220,
  rotate = -3,
  tape = true,
  children,
  className = "",
}: {
  src?: string;
  alt?: string;
  caption?: ReactNode;
  width?: number;
  rotate?: number;
  tape?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative bg-white inline-block ${className}`}
      style={{
        padding: 10,
        paddingBottom: 30,
        width,
        transform: `rotate(${rotate}deg)`,
        boxShadow:
          "0 14px 28px -8px rgba(0,0,0,0.22), 0 4px 10px -6px rgba(0,0,0,0.15)",
      }}
    >
      {tape && (
        <span
          aria-hidden
          className="absolute"
          style={{
            top: -10,
            left: "50%",
            transform: "translateX(-50%) rotate(-3deg)",
            width: 60,
            height: 18,
            background: "var(--tape-yellow)",
            opacity: 0.85,
            boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
          }}
        />
      )}
      <div
        className="relative bg-line overflow-hidden"
        style={{
          width: width - 20,
          height: (width - 20) * 1.25,
        }}
      >
        {children
          ? children
          : src && (
              <Image
                src={src}
                alt={alt ?? ""}
                fill
                sizes={`${width}px`}
                className="object-cover"
                unoptimized
              />
            )}
      </div>
      {caption && (
        <div
          className="absolute left-0 right-0 text-center text-foreground/80"
          style={{
            bottom: 8,
            fontFamily: "var(--font-hand)",
            fontSize: "1rem",
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
}
