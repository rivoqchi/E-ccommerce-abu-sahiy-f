import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          background:
            "linear-gradient(135deg, #1a2330 0%, #243447 50%, #2f5d8a 100%)",
          color: "white",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 72, letterSpacing: -1 }}>{SITE_NAME}</div>
        <div
          style={{
            marginTop: 16,
            fontSize: 28,
            opacity: 0.85,
            fontFamily: "sans-serif",
            maxWidth: 700,
          }}
        >
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    { ...size },
  );
}
