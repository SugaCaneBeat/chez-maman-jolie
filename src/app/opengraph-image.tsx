import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Plats traditionnels africains servis Chez Maman Jolie — Paris 11";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0D0D0D 0%, #1a1208 55%, #2a1f0a 100%)",
          position: "relative",
          fontFamily: "Georgia, serif",
          color: "#FFFFFF",
        }}
      >
        {/* Halos décoratifs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "rgba(201, 146, 42, 0.18)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: -150,
            width: 540,
            height: 540,
            borderRadius: "50%",
            background: "rgba(201, 146, 42, 0.10)",
            filter: "blur(40px)",
          }}
        />

        {/* Logo circulaire */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "#0D0D0D",
            border: "5px solid #7A6012",
            marginBottom: 36,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span
              style={{
                fontSize: 62,
                fontWeight: 700,
                color: "#FFFFFF",
                lineHeight: 1,
              }}
            >
              C
            </span>
            <span
              style={{
                fontSize: 62,
                fontWeight: 700,
                color: "#C9922A",
                lineHeight: 1,
              }}
            >
              J
            </span>
          </div>
        </div>

        {/* Tag */}
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 8,
            color: "#C9922A",
            textTransform: "uppercase",
            fontWeight: 700,
            marginBottom: 22,
          }}
        >
          Cuisine Africaine Authentique
        </div>

        {/* Titre principal */}
        <div
          style={{
            display: "flex",
            fontSize: 88,
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.05,
            textAlign: "center",
          }}
        >
          Chez Maman Jolie
        </div>

        {/* Filet doré */}
        <div
          style={{
            width: 120,
            height: 3,
            background: "#C9922A",
            marginTop: 32,
            marginBottom: 28,
          }}
        />

        {/* Sous-titre */}
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "rgba(255,255,255,0.85)",
            fontFamily: "Inter, system-ui, sans-serif",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          Restaurant &amp; Traiteur — Pondu, Yassa, Mafé · Livraison Paris 6j/7
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            display: "flex",
            alignItems: "center",
            gap: 24,
            fontSize: 22,
            color: "rgba(255,255,255,0.55)",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          <span>chezmamanjolie.com</span>
          <span style={{ color: "#C9922A" }}>•</span>
          <span>Paris 11ème</span>
          <span style={{ color: "#C9922A" }}>•</span>
          <span>@chezmamanjolie</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
