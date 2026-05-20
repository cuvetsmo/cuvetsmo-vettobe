import { ImageResponse } from "next/og";
import { getStudentAssignments, getDepartments } from "@/lib/data/source";

// Parchment academic palette — mirrors globals.css :root
const BG = "#fbf6e9";
const SURFACE = "#fffcf2";
const INK = "#1f3026";
const INK_MUTED = "#5d6e60";
const INK_FAINT = "#8a9690";
const ACCENT = "#c44827";
const ACCENT_SOFT = "#f4d4c5";
const SUCCESS = "#5d8348";
const WARN = "#c89211";
const BORDER = "#e6dec7";

export const alt = "Vet to be — student profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Noto Sans Thai TTF — needed because next/og's default font has no Thai glyphs.
// Fetched on first invocation, cached at the module level by the runtime.
let cachedFont: { regular?: ArrayBuffer; bold?: ArrayBuffer } = {};

async function loadFont(weight: "regular" | "bold"): Promise<ArrayBuffer | null> {
  if (cachedFont[weight]) return cachedFont[weight]!;
  // Verified Google Fonts gstatic URLs (Noto Sans Thai v29, fetched from CSS API)
  const url =
    weight === "bold"
      ? "https://fonts.gstatic.com/s/notosansthai/v29/iJWnBXeUZi_OHPqn4wq6hQ2_hbJ1xyN9wd43SofNWcd1MKVQt_So_9CdU3NqpzE.ttf"
      : "https://fonts.gstatic.com/s/notosansthai/v29/iJWnBXeUZi_OHPqn4wq6hQ2_hbJ1xyN9wd43SofNWcd1MKVQt_So_9CdU5RtpzE.ttf";
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    cachedFont[weight] = buf;
    return buf;
  } catch {
    return null;
  }
}

export default async function StudentOG({
  params,
}: {
  params: Promise<{ year: string; shortId: string }>;
}) {
  const { year, shortId } = await params;
  const yearId = Number(year);
  const padded = (shortId || "").padStart(3, "0");

  const [rows, depts, fontRegular, fontBold] = await Promise.all([
    getStudentAssignments(yearId, padded),
    getDepartments(),
    loadFont("regular"),
    loadFont("bold"),
  ]);

  const fonts = [
    ...(fontRegular ? [{ name: "NotoThai", data: fontRegular, style: "normal" as const, weight: 400 as const }] : []),
    ...(fontBold ? [{ name: "NotoThai", data: fontBold, style: "normal" as const, weight: 700 as const }] : []),
  ];

  // Empty state
  if (!rows || rows.length === 0) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: BG,
            color: INK,
            fontFamily: "NotoThai",
          }}
        >
          <div style={{ display: "flex", fontSize: 60, fontWeight: 700 }}>Vet to be</div>
          <div style={{ display: "flex", fontSize: 28, color: INK_MUTED, marginTop: 16 }}>
            no data · #{padded} · {yearId}
          </div>
        </div>
      ),
      { ...size, fonts }
    );
  }

  const first = rows[0];
  const totalDays = rows.reduce((s, r) => s + (r.days_practiced ?? 0), 0);
  const deptCount = new Set(rows.map((r) => r.dept_slug)).size;
  const certOk = totalDays >= 7;
  const deptShort = (slug: string) => depts.find((d) => d.slug === slug)?.short_th ?? slug;
  const topPlacements = rows.slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: BG,
          color: INK,
          padding: "56px 70px",
          fontFamily: "NotoThai",
          // Subtle accent corner — radial-gradient avoids needing positioned overlay
          backgroundImage: `radial-gradient(circle at 100% 0%, ${ACCENT_SOFT} 0%, transparent 30%), radial-gradient(circle at 0% 100%, rgba(93,131,72,0.08) 0%, transparent 25%)`,
        }}
      >
        {/* Header line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: ACCENT,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.06em",
          }}
        >
          <div style={{ display: "flex" }}>VETTOBE.CUVETSMO.COM</div>
          <div style={{ display: "flex", color: INK_FAINT, fontSize: 18, margin: "0 14px" }}>—</div>
          <div style={{ display: "flex", color: INK_MUTED, fontSize: 22, fontWeight: 400 }}>
            Vet to be {yearId}
          </div>
        </div>

        {/* Nickname row */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginTop: 26,
          }}
        >
          <div style={{ display: "flex", fontSize: 92, fontWeight: 700, lineHeight: 1.0, color: INK }}>
            {first.nickname}
          </div>
          <div style={{ display: "flex", fontSize: 50, color: INK_FAINT, fontWeight: 400, marginLeft: 24 }}>
            #{padded}
          </div>
        </div>

        {/* Full name + year */}
        {first.full_name && (
          <div style={{ display: "flex", fontSize: 28, color: INK_MUTED, marginTop: 8 }}>
            {first.full_name}
          </div>
        )}
        <div style={{ display: "flex", fontSize: 22, color: INK_FAINT, marginTop: 6 }}>
          ปี {first.student_year} · cuvet{first.student_year === 5 ? "86" : "87"}
        </div>

        {/* Stats strip */}
        <div style={{ display: "flex", gap: 16, marginTop: 36 }}>
          <Stat label="วันรวม" value={`${totalDays} วัน`} />
          <Stat label="แผนกที่ฝึก" value={String(deptCount)} />
          <Stat
            label="เกียรติบัตร"
            value={certOk ? "ได้" : "ไม่ครบ"}
            valueColor={certOk ? SUCCESS : WARN}
          />
        </div>

        {/* Top placements list */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 30 }}>
          {topPlacements.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: i === 0 ? 0 : 8,
                fontSize: 22,
                color: INK_MUTED,
              }}
            >
              <div
                style={{
                  display: "flex",
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "4px 12px",
                  fontFamily: "NotoThai",
                  fontSize: 18,
                  color: INK,
                  marginRight: 14,
                }}
              >
                W{r.week}
              </div>
              <div style={{ display: "flex", color: INK, fontWeight: 700, marginRight: 12 }}>
                {deptShort(r.dept_slug)}
              </div>
              <div style={{ display: "flex", color: INK_FAINT, fontSize: 18 }}>
                {r.days_practiced} วัน
              </div>
            </div>
          ))}
          {rows.length > 3 && (
            <div style={{ display: "flex", color: INK_FAINT, fontSize: 18, marginTop: 8 }}>
              + อีก {rows.length - 3} แผนก
            </div>
          )}
        </div>

        {/* Footer URL */}
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            fontSize: 18,
            color: INK_FAINT,
            paddingTop: 30,
          }}
        >
          vettobe.cuvetsmo.com / students / {yearId} / {padded}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}

function Stat({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: "14px 22px",
        minWidth: 180,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 16,
          letterSpacing: "0.06em",
          color: INK_FAINT,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 34,
          fontWeight: 700,
          marginTop: 4,
          color: valueColor ?? INK,
        }}
      >
        {value}
      </div>
    </div>
  );
}
