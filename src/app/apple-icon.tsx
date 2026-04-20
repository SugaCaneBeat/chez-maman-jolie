import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "#0D0D0D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "8px solid #7A6012",
          position: "relative",
        }}
      >
        {/* Letters */}
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 78,
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1,
            }}
          >
            C
          </span>
          <span
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 78,
              fontWeight: 700,
              color: "#C9922A",
              lineHeight: 1,
            }}
          >
            J
          </span>
        </div>
        {/* Diamond */}
        <div
          style={{
            position: "absolute",
            bottom: 26,
            left: "50%",
            width: 12,
            height: 12,
            background: "#C9922A",
            transform: "translateX(-50%) rotate(45deg)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
