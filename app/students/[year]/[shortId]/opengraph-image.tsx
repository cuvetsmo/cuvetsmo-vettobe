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

// Note: not setting runtime="edge" because lib/data/source.ts uses unstable_cache
// + server-only imports that are easier in the Node runtime.
export const alt = "Vet to be — student profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function StudentOG({
  params,
}: {
  params: Promise<{ year: string; shortId: string }>;
}) {
  const { year, shortId } = await params;
  const yearId = Number(year);
  const padded = (shortId || "").padStart(3, "0");

  const [rows, depts] = await Promise.all([
    getStudentAssignments(yearId, padded),
    getDepartments(),
  ]);

  // Fallback if no data
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
          }}
        >
          <div style={{ fontSize: 60, fontWeight: 600 }}>Vet to be</div>
          <div style={{ fontSize: 28, color: INK_MUTED, marginTop: 16 }}>
            ไม่พบข้อมูล #{padded} ปี {yearId}
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const first = rows[0];
  const totalDays = rows.reduce((s, r) => s + (r.days_practiced ?? 0), 0);
  const deptCount = new Set(rows.map((r) => r.dept_slug)).size;
  const certOk = totalDays >= 7;
  const deptShort = (slug: string) =>
    depts.find((d) => d.slug === slug)?.short_th ?? slug;

  // Top 3 dept-week placements to show on card
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
          padding: "60px 70px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Soft accent corners */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 280,
            height: 280,
            background: ACCENT_SOFT,
            opacity: 0.4,
            borderBottomLeftRadius: "100%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 200,
            height: 200,
            background: SUCCESS,
            opacity: 0.06,
            borderTopRightRadius: "100%",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            color: ACCENT,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            zIndex: 1,
          }}
        >
          <span>VETTOBE.CUVETSMO.COM</span>
          <span style={{ color: INK_FAINT, fontSize: 18 }}>·</span>
          <span style={{ color: INK_MUTED, fontSize: 22, textTransform: "none" }}>
            Vet to be {yearId}
          </span>
        </div>

        {/* Name */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 24,
            marginTop: 30,
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: 96, fontWeight: 600, lineHeight: 1.0 }}>
            {first.nickname}
          </span>
          <span style={{ fontSize: 52, color: INK_FAINT, fontWeight: 400 }}>
            #{padded}
          </span>
        </div>
        {first.full_name && (
          <div
            style={{
              fontSize: 28,
              color: INK_MUTED,
              marginTop: 8,
              zIndex: 1,
            }}
          >
            {first.full_name}
          </div>
        )}
        <div
          style={{
            fontSize: 22,
            color: INK_FAINT,
            marginTop: 6,
            zIndex: 1,
          }}
        >
          ปี {first.student_year} · cuvet{first.student_year === 5 ? "86" : "87"}
        </div>

        {/* Stats strip */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
            zIndex: 1,
          }}
        >
          <Stat label="วันรวม" value={`${totalDays} วัน`} />
          <Stat label="แผนกที่ฝึก" value={String(deptCount)} />
          <Stat
            label="เกียรติบัตร"
            value={certOk ? "✓ ได้" : "⚠ ไม่ครบ"}
            valueColor={certOk ? SUCCESS : WARN}
          />
        </div>

        {/* Top placements */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: 30,
            zIndex: 1,
          }}
        >
          {topPlacements.map((r) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 22,
                color: INK_MUTED,
              }}
            >
              <span
                style={{
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "4px 12px",
                  fontFamily: "monospace",
                  fontSize: 18,
                  color: INK,
                }}
              >
                W{r.week}
              </span>
              <span style={{ color: INK, fontWeight: 500 }}>{deptShort(r.dept_slug)}</span>
              <span style={{ color: INK_FAINT, fontSize: 18 }}>
                {r.days_practiced} วัน
              </span>
            </div>
          ))}
          {rows.length > 3 && (
            <div style={{ color: INK_FAINT, fontSize: 18, marginTop: 4 }}>
              + อีก {rows.length - 3} แผนก
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 70,
            fontSize: 18,
            color: INK_FAINT,
            zIndex: 1,
          }}
        >
          vettobe.cuvetsmo.com / students / {yearId} / {padded}
        </div>
      </div>
    ),
    { ...size }
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
        padding: "16px 22px",
        minWidth: 180,
      }}
    >
      <span
        style={{
          fontSize: 16,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: INK_FAINT,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 34,
          fontWeight: 600,
          marginTop: 4,
          color: valueColor ?? INK,
        }}
      >
        {value}
      </span>
    </div>
  );
}
