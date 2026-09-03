"""
SHRAV — PDF Report Generator
Uses reportlab (pure Python, zero system deps) to produce a styled PDF.
Input: the report dict from the session store.
Output: bytes of the PDF.
"""
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT


_DARK_BG = colors.HexColor("#050509")
_SURFACE = colors.HexColor("#0C0C14")
_BORDER = colors.HexColor("#1A1A2E")
_ACCENT = colors.HexColor("#00E5FF")
_WHITE = colors.HexColor("#F0F0FF")
_SECONDARY = colors.HexColor("#6B7A99")
_RISK_LOW = colors.HexColor("#00FF87")
_RISK_SUSP = colors.HexColor("#FFB800")
_RISK_HIGH = colors.HexColor("#FF2D55")

_STATE_COLOR = {
    "LOW_RISK": _RISK_LOW,
    "SUSPICIOUS": _RISK_SUSP,
    "HIGH_RISK": _RISK_HIGH,
}
_STATE_LABEL = {
    "LOW_RISK": "LOW RISK",
    "SUSPICIOUS": "SUSPICIOUS",
    "HIGH_RISK": "HIGH RISK",
}


def generate(report: dict, filename: str = "audio.wav", duration_sec: float = 0.0) -> bytes:
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        topMargin=20 * mm, bottomMargin=20 * mm,
        leftMargin=20 * mm, rightMargin=20 * mm,
    )

    styles = getSampleStyleSheet()

    s_title = ParagraphStyle("Title", parent=styles["Normal"],
                              textColor=_ACCENT, fontSize=28,
                              spaceAfter=2, fontName="Helvetica-Bold")
    s_sub = ParagraphStyle("Sub", parent=styles["Normal"],
                           textColor=_SECONDARY, fontSize=10, spaceAfter=6)
    s_body = ParagraphStyle("Body", parent=styles["Normal"],
                            textColor=_WHITE, fontSize=10, spaceAfter=6)
    s_small = ParagraphStyle("Small", parent=styles["Normal"],
                             textColor=_SECONDARY, fontSize=8, spaceAfter=4)
    s_warn = ParagraphStyle("Warn", parent=styles["Normal"],
                            textColor=_RISK_HIGH, fontSize=9,
                            spaceAfter=4, fontName="Helvetica-Bold")
    s_h2 = ParagraphStyle("H2", parent=styles["Normal"],
                          textColor=_ACCENT, fontSize=13,
                          spaceAfter=4, fontName="Helvetica-Bold")

    state = report.get("final_state", "LOW_RISK")
    sc = _STATE_COLOR.get(state, _WHITE)
    sl = _STATE_LABEL.get(state, state)
    score_pct = round(report.get("final_score", 0) * 100, 1)
    conf_pct = round(report.get("confidence", 0) * 100, 1)

    story = []

    # ── Header ──
    story.append(Paragraph("SHRAV", s_title))
    story.append(Paragraph("Voice Impersonation Detection Report", s_sub))
    story.append(Paragraph(
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  ·  File: {filename}  ·  Duration: {duration_sec:.1f}s",
        s_small
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=_ACCENT, spaceAfter=10))

    # ── Risk state ──
    s_state = ParagraphStyle("State", parent=styles["Normal"],
                             textColor=sc, fontSize=36,
                             spaceAfter=6, fontName="Helvetica-Bold",
                             alignment=TA_CENTER)
    story.append(Paragraph(sl, s_state))
    story.append(Spacer(1, 4 * mm))

    # ── Scores table ──
    scores_data = [
        ["Metric", "Value"],
        ["Risk Score", f"{score_pct}%"],
        ["Confidence", f"{conf_pct}%"],
        ["Model Used", report.get("model_used", "N/A")],
    ]
    t = Table(scores_data, colWidths=[80 * mm, 90 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), _ACCENT),
        ("TEXTCOLOR", (0, 0), (-1, 0), _DARK_BG),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("TEXTCOLOR", (0, 1), (-1, -1), _WHITE),
        ("BACKGROUND", (0, 1), (-1, -1), _SURFACE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [_SURFACE, _BORDER]),
        ("GRID", (0, 0), (-1, -1), 0.5, _BORDER),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(t)
    story.append(Spacer(1, 8 * mm))

    # ── Timeline ──
    timeline = report.get("timeline", [])
    if timeline:
        story.append(Paragraph("Risk Timeline", s_h2))
        tl_data = [["Time (s)", "Risk Score"]] + [
            [f"{p['t']:.1f}s", f"{p['score'] * 100:.1f}%"] for p in timeline
        ]
        tl = Table(tl_data, colWidths=[80 * mm, 90 * mm])
        tl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), _ACCENT),
            ("TEXTCOLOR", (0, 0), (-1, 0), _DARK_BG),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("TEXTCOLOR", (0, 1), (-1, -1), _WHITE),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [_SURFACE, _BORDER]),
            ("GRID", (0, 0), (-1, -1), 0.5, _BORDER),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ]))
        story.append(tl)
        story.append(Spacer(1, 8 * mm))

    # ── Safety line ──
    story.append(HRFlowable(width="100%", thickness=1, color=_RISK_HIGH, spaceAfter=6))
    story.append(Paragraph(
        f"⚠ {report.get('recommendation', 'Verify using a second channel before acting.')}",
        s_warn
    ))
    story.append(Paragraph(
        "This report was generated by a baseline anti-spoofing model not yet validated on Marathi speech. "
        "Results are indicative only and must not be used as sole evidence.",
        s_small
    ))

    doc.build(story)
    return buf.getvalue()
