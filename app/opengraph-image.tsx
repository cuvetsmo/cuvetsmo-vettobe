import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Vet to be — ศูนย์รวมโครงการ Vet to be CUVET";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #fbf6e9 0%, #fffcf2 50%, #f4d4c5 100%)",
          color: "#1f3026",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              background: "#f4d4c5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            🐾
          </div>
          <div style={{ fontSize: 28, fontWeight: 500, color: "#c44827" }}>
            vettobe.cuvetsmo.com
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              marginBottom: 24,
            }}
          >
            Vet to be
          </div>
          <div style={{ fontSize: 36, color: "#5d6e60", lineHeight: 1.3 }}>
            ศูนย์รวมโครงการฝึกงานคลินิก
            <br />
            ของนิสิตคณะสัตวแพทย์ จุฬาฯ
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#5d6e60",
            fontSize: 22,
          }}
        >
          <div>ค้นรายชื่อ · รีวิวแผนก · ดูตารางย้อนหลัง</div>
          <div style={{ color: "#c44827", fontWeight: 500 }}>CUVETSMO</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
