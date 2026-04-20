import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "#0D0D0D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1.5px solid #7A6012",
          position: "relative",
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 14,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: -0.5,
            marginRight: 0,
          }}
        >
          C
        </span>
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 14,
            fontWeight: 700,
            color: "#C9922A",
            letterSpacing: -0.5,
          }}
        >
          J
        </span>
      </div>
    ),
    { ...size }
  );
}
