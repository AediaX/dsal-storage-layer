/* eslint-disable jsx-a11y/alt-text */
import React from "react";

// ─── STATUS BADGE STYLES ──────────────────────────────────────────────────────
export const STATUS_STYLE = {
  selected:    { bg: "#dcfce7", text: "#15803d", dot: "#22c55e", label: "Selected" },
  pending:     { bg: "#fef9c3", text: "#a16207", dot: "#eab308", label: "Pending" },
  shortlisted: { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6", label: "Shortlisted" },
  rejected:    { bg: "#fee2e2", text: "#b91c1c", dot: "#ef4444", label: "Rejected" },
  completed:   { bg: "#f3e8ff", text: "#7c3aed", dot: "#a855f7", label: "Completed" },
};

// ─── SVG-DERIVED BRAND TOKENS ─────────────────────────────────────────────────
// Extracted directly from Business_Manager.svg
const NAVY  = "#1d3949";   // top-right corner block
const GOLD  = "#e0a43d";   // bottom-left corner block
const RED   = "#e2404d";   // red accent strip (top-left)
const WHITE = "#ffffff";
const INK   = "#030303";   // near-black text

const IDCard = React.forwardRef(function IDCard({ app, qrBase64, logoBase64 }, ref) {
  const sc   = STATUS_STYLE[app?.status] || STATUS_STYLE.pending;
  const role = app?.chosenCourse || "Web Development Intern";

  // ── SVG card proportions: 141.75 × 240.75 (≈ 0.589 : 1)
  // We render at 320 px wide → height ≈ 543 px.
  const W = 320;
  const H = Math.round(W / (141.75 / 240.75)); // ~543

  // ── Corner geometry (proportional to SVG regions) ──────────────────────────
  // Navy top-right:  x 86–141.5  y 0–100   in 141.75×240.75 space
  //   → as fractions: x-start 60.7%, width 39.3%, height 41.5%
  const navyLeft  = Math.round(W * (86 / 141.75));         // ~194 px
  const navyH     = Math.round(H * (100 / 240.75));        // ~226 px

  // Gold bottom-left: x 0–36.25  y 140.34–240.41
  //   → height-start 58.3%, height 41.6%, width 25.6%
  const goldW     = Math.round(W * (36.25 / 141.75));      // ~82 px
  const goldTop   = Math.round(H * (140.34 / 240.75));     // ~315 px

  // Red strip top-left: x 0–73.81  y 0–10
  //   → width 52.1%, height 4.2%
  const redW      = Math.round(W * (73.81 / 141.75));      // ~167 px
  const redH      = Math.round(H * (10 / 240.75));         // ~23 px

  // Logo zone:     x 30.12–111.66  y 8–51.93
  const logoX     = Math.round(W * (30.12 / 141.75));
  const logoW     = Math.round(W * ((111.66 - 30.12) / 141.75));
  const logoTop   = Math.round(H * (8 / 240.75));
  const logoH     = Math.round(H * ((51.93 - 8) / 240.75));

  // QR / central content zone: x 33.4–108  y 55–129.64
  const qrX       = Math.round(W * (33.4 / 141.75));
  const qrW       = Math.round(W * ((108 - 33.4) / 141.75));
  const qrTop     = Math.round(H * (55 / 240.75));
  const qrH       = Math.round(H * ((129.64 - 55) / 240.75));

  // Inner card inset: x 7.43–133.94  y 7.79–232.71
  const inset     = Math.round(W * (7.43 / 141.75));       // ~17 px

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: `${W}px`,
        height: `${H}px`,
        borderRadius: "18px",
        overflow: "hidden",
        background: WHITE,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        boxShadow: "0 20px 60px -16px rgba(0,0,0,0.25), 0 6px 20px rgba(0,0,0,0.08)",
        userSelect: "none",
        border: "1px solid #e2e8f0",
      }}
    >
      {/* ─── BACKGROUND CORNER BLOCKS (exact SVG proportions) ─────────────── */}

      {/* Navy top-right block */}
      <div style={{
        position: "absolute",
        top: 0,
        left: navyLeft,
        width: W - navyLeft,
        height: navyH,
        background: NAVY,
        zIndex: 0,
      }} />

      {/* Gold bottom-left block */}
      <div style={{
        position: "absolute",
        top: goldTop,
        left: 0,
        width: goldW,
        height: H - goldTop,
        background: GOLD,
        zIndex: 0,
      }} />

      {/* Red strip – top-left, ~half-width */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: redW,
        height: redH,
        background: RED,
        zIndex: 1,
      }} />

      {/* ─── INNER CARD AREA (slightly inset, matches 7.43,7.79 inner clip) ── */}
      <div style={{
        position: "absolute",
        top: inset,
        left: inset,
        right: inset,
        bottom: inset,
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        pointerEvents: "none",
      }}>

        {/* ── LOGO / COMPANY AREA (top center, y 8-52 in SVG) ── */}
        <div style={{
          position: "absolute",
          top: logoTop - inset,
          left: logoX - inset,
          width: logoW,
          height: logoH,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          zIndex: 3,
        }}>
          {/* Company logo mark */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {logoBase64 ? (
              <img
                src={logoBase64}
                style={{ width: "28px", height: "28px", borderRadius: "6px", filter: "brightness(0) invert(1)" }}
                alt="logo"
              />
            ) : (
              <div style={{
                width: "28px", height: "28px", borderRadius: "6px",
                background: "rgba(255,255,255,0.2)",
                border: "1.5px solid rgba(255,255,255,0.6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: WHITE, fontWeight: 800, fontSize: "14px",
              }}>A</div>
            )}
            <span style={{
              fontSize: "20px", fontWeight: 800,
              color: "black",
              letterSpacing: "-0.02em",
              textShadow: "0 1px 3px rgb(0, 0, 0)",
            }}>AediaX</span>
          </div>

          {/* Role tag */}
          <div style={{
            fontSize: "9px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.75)",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            background: "rgba(255,255,255,0.12)",
            padding: "2px 8px",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.2)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}>
            {role}
          </div>
        </div>

        {/* ── QR CODE (center, y 55-130 in SVG) ── */}
        <div style={{
          position: "absolute",
          top: qrTop - inset,
          left: qrX - inset,
          width: qrW,
          height: qrH,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
        }}>
          <div style={{
            width: qrW - 8,
            height: qrH - 8,
            borderRadius: "10px",
            overflow: "hidden",
            border: "2px solid #e2e8f0",
            background: "#f8fafc",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}>
            {qrBase64 ? (
              <img src={qrBase64} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="QR" />
            ) : (
              <div style={{
                width: "100%", height: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#f1f5f9", fontSize: "10px", color: "#94a3b8", textAlign: "center",
              }}>
                QR Code<br />Loading…
              </div>
            )}
          </div>
        </div>

        {/* ── MAIN CONTENT (below QR, y ~130-210 in SVG) ── */}
        <div style={{
          position: "absolute",
          top: Math.round(H * (132 / 240.75)) - inset,
          left: 0,
          right: 0,
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          padding: "0 12px",
        }}>
          {/* Name */}
          <div style={{
            fontSize: "17px",
            fontWeight: 700,
            color: INK,
            letterSpacing: "-0.015em",
            lineHeight: 1.2,
            textAlign: "center",
            wordBreak: "break-word",
          }}>
            {app?.fullName || "—"}
          </div>

          {/* Registration ID */}
          <div style={{
            fontSize: "11px",
            fontFamily: "'SF Mono', 'Menlo', 'Consolas', monospace",
            color: "#64748b",
            letterSpacing: "0.5px",
          }}>
            ID: {app?.registrationNumber || "AEDI61576"}
          </div>

          {/* Divider */}
          <div style={{
            width: "40px", height: "2px",
            background: `linear-gradient(90deg, ${RED}, ${GOLD})`,
            borderRadius: "2px",
            margin: "2px 0",
          }} />

          {/* Contact fields */}
          <div style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            marginTop: "2px",
          }}>
            {/* Email */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 10px",
              background: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #eef2f6",
            }}>
              <span style={{
                fontSize: "8.5px", fontWeight: 700,
                color: NAVY, textTransform: "uppercase",
                letterSpacing: "0.5px", minWidth: "38px",
              }}>Email</span>
              <span style={{
                fontSize: "11.5px", color: INK, fontWeight: 500,
                wordBreak: "break-all", flex: 1,
              }}>
                {app?.email || "—"}
              </span>
            </div>

            {/* Phone */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 10px",
              background: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #eef2f6",
            }}>
              <span style={{
                fontSize: "8.5px", fontWeight: 700,
                color: NAVY, textTransform: "uppercase",
                letterSpacing: "0.5px", minWidth: "38px",
              }}>Phone</span>
              <span style={{
                fontSize: "11.5px", color: INK, fontWeight: 500, flex: 1,
              }}>
                {app?.phone || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* ── FOOTER (website + status badge, y ~215-230 in SVG) ── */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px 10px",
          borderTop: "1px solid #eef2f6",
          background: WHITE,
        }}>
          <span style={{
            fontSize: "11px", fontWeight: 700,
            color: NAVY, letterSpacing: "0.2px",
          }}>
            aediax.com
          </span>
          <span style={{
            fontSize: "10px", fontWeight: 600,
            background: sc.bg, color: sc.text,
            padding: "3px 10px", borderRadius: "20px",
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            <span style={{
              width: "5px", height: "5px",
              background: sc.dot, borderRadius: "50%",
              display: "inline-block",
            }} />
            {sc.label}
          </span>
        </div>
      </div>

      {/* ── DECORATIVE DOTS on navy area ── */}
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          top: `${redH + 12 + i * 22}px`,
          right: `${16 + (i % 2) * 14}px`,
          width: "4px", height: "4px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.25)",
          zIndex: 1,
        }} />
      ))}

      {/* ── THIN GOLD ACCENT LINE (right edge of gold corner) ── */}
      <div style={{
        position: "absolute",
        top: goldTop,
        left: goldW - 1,
        width: "2px",
        height: H - goldTop,
        background: `linear-gradient(180deg, ${GOLD}, transparent)`,
        zIndex: 1,
      }} />

      {/* ── THIN NAVY ACCENT LINE (left edge of navy corner) ── */}
      <div style={{
        position: "absolute",
        top: 0,
        left: navyLeft - 1,
        width: "2px",
        height: navyH,
        background: `linear-gradient(180deg, ${NAVY}, transparent)`,
        zIndex: 1,
      }} />
    </div>
  );
});

export default IDCard;