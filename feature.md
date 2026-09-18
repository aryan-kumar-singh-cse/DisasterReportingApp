# ResQ — Feature & Differentiation Document

## 1. Project Idea

A **citizen-driven disaster intelligence platform** where people report disaster damage or help/rescue needs using geo-tagged photographs, and get a transparent AI-assisted evidence assessment shown alongside their own claim.

---

# 2. Honest Positioning

This project does **not** claim that crowdsourced disaster mapping is new. Prior art:

- **Ushahidi** — mature crowdsourced crisis mapping, human/volunteer-driven verification, extensively deployed.
- **GDACS** — global disaster awareness, scientific impact estimation, alerts.
- **SeeClickFix** — location-based civic issue reporting.

None of these expose a side-by-side "what the citizen said vs what the AI independently saw" view. That gap is the actual claim this project makes.

---

# 3. Features

## 3.1 Anonymous Photo + GPS Reporting
Citizen submits: disaster type, user-selected severity, a photo, and GPS location (auto-captured, manually adjustable). No account required.

## 3.2 AI-Assisted Evidence Assessment
Rekognition analyzes the photo; a rule-based check compares detected labels against the user's claimed disaster type and returns one of three outcomes — `CONSISTENT`, `INCONCLUSIVE`, `INCONSISTENT` — plus an independent AI-estimated severity. Never presented as proof of truth, always framed as "AI-assisted evidence assessment."

## 3.3 User Claim vs AI Assessment — Side-by-Side Display
The report card shows the user's stated disaster type + severity directly next to the AI's independently detected evidence and severity estimate, so a disagreement is visible rather than hidden behind a single "Verified" badge. **This is the project's core novel contribution.**

## 3.4 Live Filterable Map
Reports plotted on a Leaflet/OpenStreetMap view, filterable by disaster type, severity, and verification status, sortable by newest/severity/distance.

## 3.5 Community Confirm/Dispute Voting
Two buttons per report, vote counts stored in DynamoDB, feeding a simple status state machine (`PENDING → AI_ASSESSED → COMMUNITY_CONFIRMED / DISPUTED`). A report can end up `FALSE` and stays visibly labeled rather than deleted.

---

# 4. Comparison With Existing Public Resources

| Capability | This Project | Ushahidi | GDACS | SeeClickFix |
|---|---|---|---|---|
| Citizen crowdsourced reports | ✓ | ✓ | Not primary | ✓ |
| Anonymous reporting | ✓ | Deployment dependent | Not primary model | Deployment dependent |
| Photo + AI evidence assessment | **✓ — core claim** | Not core model | Different purpose (scientific impact) | Not core |
| User claim vs AI assessment shown side by side | **✓ — the actual novel piece** | Not offered (single verification status) | Not applicable | Not applicable |
| Community Confirm/Dispute | ✓ | ✓ human/volunteer verification | Not primary | Community interaction |

---

# 5. The One Sentence Pitch

> **"Most disaster-reporting platforms collapse verification into a single status. We show the citizen's claim and the AI's independent read of the photo side by side, so the disagreement itself becomes information — not something hidden behind a 'Verified' badge."**

Keep the pitch anchored here — it's the part genuinely absent from Ushahidi/GDACS/SeeClickFix's public-facing models.

---

# 6. Technical Disclaimer

The AI assessment is **not a safety-critical truth detector** — present it as *AI-assisted evidence assessment*, never as proof. This is a hackathon prototype demonstrating an information workflow, not an emergency-response authority.

---

# 7. Demo Highlights

1. **Anonymous, one-tap-style reporting** — photo + GPS, no login.
2. **AI assessment shown transparently against the user's own claim** — the core novel idea.
3. **Live filterable map** showing the report appear in real time.
4. **Live voting** changing a report's status.
