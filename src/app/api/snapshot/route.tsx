import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import type { MilestoneKind } from "@/lib/milestones";
import { z } from "zod";

export const runtime = "edge";

// ---------------------------------------------------------------------------
// Accent config (mirrors ShareSnapshotCard)
// ---------------------------------------------------------------------------

type Accent = "blue" | "emerald" | "amber" | "violet" | "rose";

const ACCENT_CONFIG: Record<Accent, { bg: string; glow: string; badge: string; badgeText: string }> = {
  blue: { bg: "linear-gradient(135deg, #1e3a5f, #0f172a, #1a1a2e)", glow: "rgba(59,130,246,0.1)", badge: "rgba(59,130,246,0.15)", badgeText: "#60a5fa" },
  emerald: { bg: "linear-gradient(135deg, #0d3320, #0a0f0f, #0d2818)", glow: "rgba(16,185,129,0.1)", badge: "rgba(16,185,129,0.15)", badgeText: "#34d399" },
  amber: { bg: "linear-gradient(135deg, #3d2800, #0f0a0a, #2d1f00)", glow: "rgba(245,158,11,0.1)", badge: "rgba(245,158,11,0.15)", badgeText: "#fbbf24" },
  violet: { bg: "linear-gradient(135deg, #2d1b5e, #0f0a1a, #1a1030)", glow: "rgba(139,92,246,0.1)", badge: "rgba(139,92,246,0.15)", badgeText: "#a78bfa" },
  rose: { bg: "linear-gradient(135deg, #4a1225, #0f0a0c, #2d0f1a)", glow: "rgba(244,63,94,0.1)", badge: "rgba(244,63,94,0.15)", badgeText: "#fb7185" },
};

const KIND_LABEL: Record<MilestoneKind, string> = {
  net_worth_growth: "Milestone",
  goal_completed: "Goal Reached",
  debt_paid_off: "Achievement",
  savings_streak: "Streak",
  budget_adherence: "Discipline",
  funny: "Fun Fact",
};

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

const snapshotBodySchema = z.object({
  kind: z.enum(["net_worth_growth", "goal_completed", "debt_paid_off", "savings_streak", "budget_adherence", "funny"]),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(200),
  stat: z.string().max(50),
  detail: z.string().max(200).nullable(),
  accent: z.enum(["blue", "emerald", "amber", "violet", "rose"]).default("blue"),
  displayName: z.string().max(100).optional(),
});

type SnapshotBody = z.infer<typeof snapshotBodySchema>;

function buildSnapshotElement(body: SnapshotBody) {
  if (body.kind === "funny") return buildFunnySnapshot(body);
  return buildRegularSnapshot(body);
}

function buildRegularSnapshot(body: SnapshotBody) {
  const accent = ACCENT_CONFIG[body.accent] ?? ACCENT_CONFIG.blue;
  const label = KIND_LABEL[body.kind] ?? "Milestone";

  const dateLabel = new Date().toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        width: 800,
        height: 450,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 48,
        background: accent.bg,
        color: "white",
        fontFamily: "Inter, system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow blob */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: accent.glow,
          filter: "blur(60px)",
        }}
      />

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
        {/* Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div
            style={{
              padding: "4px 14px",
              borderRadius: 100,
              fontSize: 14,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              background: accent.badge,
              color: accent.badgeText,
            }}
          >
            {label}
          </div>
        </div>

        {/* Title */}
        <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.2 }}>{body.title}</div>
        <div style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>
          {body.subtitle}
        </div>

        {/* Stat */}
        {body.stat && (
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: accent.badgeText,
              marginTop: 20,
              letterSpacing: -1,
            }}
          >
            {body.stat}
          </div>
        )}

        {/* Detail */}
        {body.detail && (
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginTop: 12 }}>
            {body.detail}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: 20,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          W
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
            {body.displayName ? `${body.displayName} · ` : ""}Tracked with Wealth
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{dateLabel}</span>
        </div>
      </div>
    </div>
  );
}

function buildFunnySnapshot(body: SnapshotBody) {
  const dateLabel = new Date().toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        width: 800,
        height: 450,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 48,
        background: "linear-gradient(135deg, #4a1225, #1a0a14, #2d1040)",
        color: "white",
        fontFamily: "Inter, system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dual glow blobs */}
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "rgba(244,63,94,0.15)",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: -20,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "rgba(245,158,11,0.1)",
          filter: "blur(50px)",
        }}
      />

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
        {/* Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div
            style={{
              padding: "4px 14px",
              borderRadius: 100,
              fontSize: 14,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              background: "rgba(244,63,94,0.15)",
              color: "#fb7185",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Fun Fact
          </div>
        </div>

        {/* Big stat */}
        {body.stat && (
          <div
            style={{
              fontSize: 60,
              fontWeight: 800,
              color: "#fda4af",
              letterSpacing: -2,
              lineHeight: 1,
              marginBottom: 16,
            }}
          >
            {body.stat}
          </div>
        )}

        {/* Title */}
        <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2 }}>{body.title}</div>
        <div style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>
          {body.subtitle}
        </div>

        {/* Detail quip */}
        {body.detail && (
          <div style={{ fontSize: 16, fontStyle: "italic", color: "rgba(255,255,255,0.4)", marginTop: 14 }}>
            {`\u201C${body.detail}\u201D`}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: 20,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f43f5e, #f59e0b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          W
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
            {body.displayName ? `${body.displayName} · ` : ""}Tracked with Wealth
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{dateLabel}</span>
        </div>
      </div>
    </div>
  );
}

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = snapshotBodySchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return NextResponse.json({ error: `Validation failed: ${issues}` }, { status: 400 });
  }

  return new ImageResponse(buildSnapshotElement(result.data), { width: 800, height: 450 });
}
