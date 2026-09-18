# TwoTruths 🛰️ — The Disaster Intelligence Map That Shows You What It Doesn't Know

> **"Most platforms collapse verification into a badge. TwoTruths shows the disagreement — because in a disaster, the gap between what people claim and what the evidence shows is the most honest signal you can give a responder."**

---

## ⚡ The Problem & Core Thesis
When a crisis unfolds, crowdsourcing platforms (Ushahidi, GDACS, SeeClickFix) usually attempt to force every report into a binary label: *Verified* or *Unverified*. 

**Verification is a lie of compression.** Collapsing human claim and sensor evidence into a single badge destroys the most valuable tactical signal: **the shape of the disagreement.**
- Citizen claims Flood; AI sees a puddle.
- Citizen claims Wildfire; AI detects a backyard barbecue.
- Citizen claims Infrastructure Collapse; AI confirms twisted rebar and broken concrete.

That gap is not noise — it is the most honest signal you can deliver to emergency incident commanders.

---

## 🚀 The 7 Key Innovations
1. **The Dissonance Meter (Visual Centerpiece)**: A 3-zone visual gauge (`Aligned` / `Partial` / `Divergent`) mapping the delta between human testimony and Rekognition computer vision evidence.
2. **Live Disagreement Feed (Demo Showstopper)**: A real-time scrolling ticker atop the map spotlighting divergent claims with instant camera fly-to.
3. **Responder Triage View (Decision Payoff)**: Toggle between Citizen View and Responder View. Scores every incident using:
   $$\text{Triage Score} = (\text{Severity} \times 0.4) + (\text{Corroboration} \times 0.3) + ((1 - \text{Dissonance}) \times 0.3)$$
   *Divergent reports are deprioritized for field action, but flagged for verification rather than suppressed.*
4. **Evidence Chain (Trust Layer)**: Expandable drawer detailing detected label confidence bars, negative space analysis (*"What the AI didn't see"*), and raw JSON inspection.
5. **Human-Readable AI Summary**: Dynamic, clear synthesis explaining the alignment or discrepancy in natural language.
6. **Corroboration Clustering**: Spatial-temporal clustering identifying high-density reporting zones.
7. **The Challenge Flow (Dialogue, Not Verdict)**: Allows citizens to challenge assessments with counter-photos or contextual explanations.

---

## 🛠️ AWS Serverless Architecture (Free Tier Consolidated)
- **Frontend**: React + Vite, Leaflet, Tailwind / Modern CSS, hosted on **AWS Amplify**.
- **API**: **Amazon API Gateway HTTP API** (`/{proxy+}`) with CORS enabled.
- **Backend**: Single consolidated **AWS Lambda** function (`DisasterReportHandler`) with internal routing.
- **Data**: **Amazon DynamoDB** on-demand single table (`DisasterReports`).
- **Media**: Direct browser upload to **Amazon S3** via presigned PUT URLs.
- **Vision**: **Amazon Rekognition** (`DetectLabels`) rule-based analysis.

---

## ⚠️ Positioning & Ethical AI Disclaimer
*AI-assisted evidence assessment — not an emergency verification authority. TwoTruths treats AI as a second witness, not a judge.*

---

## 🏃 Quick Start (Frontend Local Demo)
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Backend Local Runner
```bash
cd backend
npm install
node localRunner.js
```
