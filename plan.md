# ResQ — Crowdsourced Disaster Reporting Platform (Hackathon MVP Plan)

## 1. Objective

Build a working web-based crowdsourced disaster reporting demo, leaning heavily on AI coding tools (Claude Code / Cursor / similar) for boilerplate generation.

Citizens submit geo-tagged disaster damage/help reports with photos, get an AI-assisted evidence assessment, and see reports on a public map.

### Hard constraints

- Web application only.
- AWS-based architecture, Free Tier / Always Free services preferred.
- Avoid continuously running infrastructure (no EC2/ECS/RDS).
- No paid third-party APIs for the core demo.
- **Section 3 must be fully working before Section 4 is started.**
- Deployment account should be checked for actual Free Tier/credit eligibility before relying on it.
- Keep an AWS Budget alert enabled before the demo.

### Important reality check

AI coding tools generate application code fast, but they do **not** remove the actual bottlenecks in a serverless AWS build: IAM permissions, API Gateway console configuration, CORS errors, Rekognition IAM policy attachment, and debugging Lambda logs. Plan around that, not around code-writing speed — configuration and integration work is largely serial, human work.

---

# 2. Tech Stack

## Frontend
React + Vite, simple CSS, Leaflet + OpenStreetMap for the map.

## Hosting
AWS Amplify Hosting (hosting only, not the full Amplify backend framework).

## Backend (serverless, consolidated to minimize configuration overhead)

```
React/Vite
    |
    v
Amplify Hosting
    |
    v
API Gateway (single proxy resource: {proxy+})
    |
    v
ONE Lambda function (internal routing)
    |
    +------> DynamoDB
    |
    +------> S3
    |
    +------> Rekognition
```

Services used: Amplify, API Gateway, Lambda, DynamoDB, S3, Rekognition.

---

# 3. Core Scope (build this first, fully, end-to-end)

## 3.1 Anonymous Report Submission
POST `/report` — disaster type, user-selected severity, photo, GPS from `navigator.geolocation`, user-adjustable pin.

## 3.2 DynamoDB — single table
Fields: `reportId, disasterType, description, photoUrl, latitude, longitude, userSeverity, aiSeverity, aiVerification, verificationStatus, createdAt`.
No indexes beyond a simple scan/query for demo-scale data.

## 3.3 AI Evidence Assessment (Rekognition, rule-based)
```
Photo → Rekognition DetectLabels → Lambda rule check against user's disasterType
      → result: CONSISTENT / INCONCLUSIVE / INCONSISTENT
      → simple heuristic severity estimate from label set
```
Keep the rule set small — a short allowlist of labels per disaster type (e.g. Flood: water, flooding, puddle; Fire: fire, smoke, flame) is enough. Always support `INCONCLUSIVE`.

## 3.4 User Claim vs AI Assessment Display
Show both side by side on the report card.

## 3.5 Public Map
Leaflet map, pins colored by disaster type, filter by type/severity/status, sort by newest/severity/distance.

**Definition of done for the core (6 checkpoints):**
1. Open the web app.
2. View existing reports on a map.
3. Submit a report anonymously (photo + GPS + type + severity).
4. Receive an AI assessment (Consistent/Inconclusive/Inconsistent + AI severity).
5. See user claim vs AI assessment side by side.
6. See the new report appear on the filterable map.

If these six work reliably, **the demo is safe to give**, regardless of what else got built.

---

# 4. Extended Scope

## 4.1 Community Confirm/Dispute Voting
Two buttons + vote counts in DynamoDB, feeding:
```
PENDING → AI_ASSESSED → COMMUNITY_CONFIRMED / DISPUTED
```
`FALSE` status rides along with this at no extra cost.

---

# 5. AWS Services

| Service | Use |
|---|---|
| AWS Amplify Hosting | React deployment |
| API Gateway | Backend API (single proxy route) |
| AWS Lambda | Backend logic (one consolidated function) |
| DynamoDB | Application database |
| S3 | Photo storage |
| Amazon Rekognition | Image analysis |

---

# 6. Build Approach — phases with exit criteria

Work in **phases with hard exit criteria** rather than rigid hourly checkpoints — don't move to the next phase until the current one's criteria are met, regardless of clock time.

### Phase 1 — Infra skeleton
Set up AWS (DynamoDB table, S3 bucket, API Gateway `{proxy+}` route, single Lambda, IAM roles, budget alert) while scaffolding the React/Vite app and Leaflet map with placeholder/seed data. Use AI coding tools to draft the Lambda routing logic and React components in parallel — they're fast at exactly this kind of boilerplate, while AWS console configuration remains manual work.
**Exit criteria:** Lambda deployed and reachable via API Gateway returning a hardcoded response; React app renders a map with 2-3 hardcoded pins.

### Phase 2 — Core submission flow
Wire the submission form to POST to the Lambda, write to DynamoDB, upload photo to S3. Use AI tools to generate the presigned-URL Lambda code and the fetch/upload logic on the frontend.
**Exit criteria:** a submitted report (with real photo) appears in DynamoDB and S3.

### Phase 3 — AI assessment + claim display
Wire Rekognition into the submission Lambda path, build the rule-based consistency/severity logic, build the claim-vs-AI UI component.
**Exit criteria:** a submitted report shows a real AI assessment next to the user's claim, on the map.

**→ At this point, run the full core demo flow once, before doing anything else.**

### Phase 4 — Voting + polish
Add voting (4.1). Then spend remaining time exclusively on reliability — re-test the core flow repeatedly, seed realistic demo data, fix bugs.

---

# 7. Demo Flow

1. Open public map — show existing seeded reports.
2. Submit a new flood/damage report anonymously (photo, GPS, type, severity).
3. Show AI processing: `Type consistency: Consistent`, `AI Severity: Severe`.
4. Show user claim vs AI assessment side by side.
5. Show the new marker appear on the map, filter by type/severity to demonstrate it.
6. Cast a confirm/dispute vote, show the status change live.

Don't narrate anything that hasn't actually been run successfully at least once.

---

# 8. Key Principle

The consolidation in this plan (one Lambda instead of several, phases instead of rigid hour blocks) is designed around the actual constraint: AWS console configuration and integration debugging are serial, human bottlenecks that AI coding tools don't remove. A demo that reliably does its core checklist beats a demo that unreliably attempts a longer one.
