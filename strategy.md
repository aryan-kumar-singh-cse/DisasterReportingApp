# Implementation Strategy — Crowdsourced Disaster Reporting App

This document outlines the phased, task-by-task execution plan for a coding agent to build and verify the disaster reporting application end-to-end.

Each phase has **explicit inputs, files to create/modify, exact commands to execute, and hard exit criteria**. Do not proceed to the next phase until the current phase's exit criteria are verified.

---

## Phase Overview

```text
Phase 0: Workspace & Contracts Setup
   │
Phase 1: Frontend Scaffolding & Local Mock Experience (Zero Cloud Dependency)
   │
Phase 2: Consolidated Backend Architecture (Lambda Router + Business Logic)
   │
Phase 3: S3 Presigned Upload & Data Persistence Pipeline
   │
Phase 4: AI Rekognition Rules & Novel Side-by-Side Assessment UI
   │
Phase 5: Community Voting & Status State Machine
   │
Phase 6: Seeding, Verification Checklist & Demo Readiness
   │
Phase 7: Production Build & Deployment
```

---

## Phase 0: Workspace & Contracts Setup

### Objective
Establish the repository structure, dependency configurations, and shared data contracts.

### Tasks
1. **Initialize Git Repository and Directory Tree**:
   ```bash
   git init
   mkdir -p frontend/src/{components,services,data,assets,utils}
   mkdir -p backend/src/{handlers,services,utils}
   mkdir -p scripts
   ```
2. **Define Data Contract (`shared/types.json` or `frontend/src/data/schema.js`)**:
   Document the DynamoDB / API object shape:
   ```json
   {
     "reportId": "string (UUID)",
     "disasterType": "Flood | Fire | Earthquake | Infrastructure Damage | Other",
     "description": "string",
     "photoUrl": "string (S3 URL or Presigned GET URL)",
     "latitude": 19.0760,
     "longitude": 72.8777,
     "userSeverity": "Low | Medium | High | Critical",
     "aiSeverity": "Low | Medium | High | Critical | Unknown",
     "aiVerification": "CONSISTENT | INCONCLUSIVE | INCONSISTENT",
     "aiDetectedLabels": [
       { "name": "Flood", "confidence": 98.4 },
       { "name": "Water", "confidence": 95.1 }
     ],
     "verificationStatus": "PENDING | AI_ASSESSED | COMMUNITY_CONFIRMED | DISPUTED | FALSE",
     "confirmVotes": 0,
     "disputeVotes": 0,
     "createdAt": "ISO8601 string"
   }
   ```
3. **Configure Root `.gitignore`**:
   Ensure `node_modules/`, `dist/`, `.env`, `.env.local`, and build artifacts are excluded.

### Exit Criteria
- Directory tree created.
- Schema contract file committed and accessible to both frontend and backend.

---

## Phase 1: Frontend Scaffolding & Local Mock UI

### Objective
Build the entire user interface using mock data so the app is 100% interactive locally before integrating cloud services.

### Tasks
1. **Scaffold React + Vite Project**:
   ```bash
   npm create vite@latest frontend -- --template react
   cd frontend
   npm install leaflet react-leaflet lucide-react
   ```
2. **Create Mock Data (`frontend/src/data/mockReports.js`)**:
   Include at least 4 diverse reports:
   - Report 1: Flood claim, AI `CONSISTENT` (Water, Flood labels).
   - Report 2: Fire claim, AI `INCONSISTENT` (Photo shows a pet or indoors with 0 fire labels).
   - Report 3: Damage claim, AI `INCONCLUSIVE` (Blurry image, low confidence).
   - Report 4: Community disputed report (`DISPUTED` / `FALSE` status).
3. **Implement Leaflet Map Component (`frontend/src/components/ReportMap.jsx`)**:
   - Color-coded map markers based on `disasterType` (e.g. Red = Fire, Blue = Flood, Amber = Damage).
   - Clickable markers that open the side drawer or popup with report details.
4. **Implement Side-by-Side Assessment Card (`frontend/src/components/ReportCard.jsx`)**:
   - **Column A (Citizen Claim)**: Stated disaster type, user-assessed severity badge, description, photo, and timestamp.
   - **Column B (AI Evidence Assessment)**: Status badge (`CONSISTENT` / `INCONCLUSIVE` / `INCONSISTENT`), AI-estimated severity, detected label chips with confidence percentages.
   - **Footer**: Required disclaimer banner: *"AI-assisted evidence assessment — not an emergency verification authority."*
5. **Implement Anonymous Report Form Modal (`frontend/src/components/ReportFormModal.jsx`)**:
   - Geolocation auto-detection via `navigator.geolocation.getCurrentPosition`.
   - Mini Leaflet map inside the modal to drag/adjust the report pin.
   - Dropdown for disaster type and severity selector buttons.
   - Photo file picker with local instant image preview (`URL.createObjectURL`).
6. **Implement Filter and Sort Bar (`frontend/src/components/FilterBar.jsx`)**:
   - Filter by Disaster Type, Severity, and AI Status (`All`, `Consistent`, `Inconsistent`, etc.).
   - Sort by Newest, Highest Severity, and Distance.

### Exit Criteria
- `npm run dev` boots without errors.
- The map renders pins, filters update the map view, clicking pins reveals the side-by-side claim card, and the submission modal functions with local state.

---

## Phase 2: Consolidated Backend Architecture

### Objective
Create the single AWS Lambda function with internal routing, supporting both mock local testing and cloud invocation.

### Tasks
1. **Initialize Backend Package**:
   ```bash
   cd backend
   npm init -y
   npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @aws-sdk/client-rekognition
   ```
2. **Implement Internal Router (`backend/src/index.js`)**:
   Handle incoming API Gateway HTTP API proxy events (`event.rawPath` or `event.path` and `event.requestContext.http.method`):
   - `GET /health` $\to$ Returns `{ status: "ok", timestamp }`
   - `GET /reports` $\to$ Queries/Scans DynamoDB for all reports.
   - `POST /reports/upload-url` $\to$ Generates S3 presigned PUT URL.
   - `POST /reports` $\to$ Validates body, invokes Rekognition assessment, and stores in DynamoDB.
   - `POST /reports/{id}/vote` $\to$ Increments confirm/dispute counters and updates verification status.
3. **Implement Rekognition Rule Engine (`backend/src/services/aiService.js`)**:
   - Rule table mapping keywords:
     - `Flood`: `["water", "flood", "flooding", "river", "puddle", "rain", "submerged"]`
     - `Fire`: `["fire", "flame", "smoke", "wildfire", "blaze", "ash", "bonfire"]`
     - `Earthquake`: `["rubble", "ruins", "debris", "collapsed building", "crack", "earthquake"]`
     - `Infrastructure Damage`: `["destruction", "collapsed", "fallen tree", "pothole", "broken bridge"]`
   - Decision logic:
     - If matching labels $\ge 1$ with confidence $> 70\%$ $\to$ `CONSISTENT`.
     - If detected labels do not overlap with disaster keywords $\to$ `INCONSISTENT`.
     - If label confidence is low or photo is ambiguous $\to$ `INCONCLUSIVE`.
   - Severity heuristic calculation:
     - Based on high-impact labels (e.g. `wildfire`, `collapsed building`) or count of matching disaster indicators.
4. **Implement Local Lambda Runner (`backend/localRunner.js`)**:
   Create a small script to test the Lambda handler locally against mock event fixtures before uploading to AWS.

### Exit Criteria
- Running `node backend/localRunner.js` successfully routes mock requests for `/health` and runs the AI rule checker against sample label payloads.

---

## Phase 3: S3 Presigned Upload & Data Persistence Pipeline

### Objective
Connect the frontend and backend to complete the end-to-end report submission pipeline with real S3 uploads and DynamoDB records.

### Tasks
1. **Frontend API Client (`frontend/src/services/api.js`)**:
   - Abstract `fetch` calls pointing to `import.meta.env.VITE_API_URL`.
   - Fallback to mock data if `VITE_API_URL` is unset or offline.
2. **Direct Browser-to-S3 Upload Flow (`frontend/src/services/uploadService.js`)**:
   ```javascript
   // 1. Request presigned URL from Lambda
   const { uploadUrl, s3Key, fileUrl } = await api.getUploadUrl(file.type);

   // 2. Direct PUT to S3
   await fetch(uploadUrl, {
     method: 'PUT',
     headers: { 'Content-Type': file.type },
     body: file
   });

   // 3. Post metadata to Lambda
   const report = await api.createReport({ ...metadata, photoKey: s3Key, photoUrl: fileUrl });
   ```
3. **DynamoDB Persistence in Lambda (`backend/src/handlers/createReport.js`)**:
   - Save report attributes using DynamoDB Document Client `PutCommand`.
   - Ensure default values for `confirmVotes: 0`, `disputeVotes: 0`, and `verificationStatus: "AI_ASSESSED"`.

### Exit Criteria
- Submitting the form in the browser uploads the image to the S3 bucket and inserts a row into the DynamoDB `DisasterReports` table.

---

## Phase 4: Rekognition Integration & Side-by-Side Claim Feature

### Objective
Trigger Amazon Rekognition during submission and present the side-by-side comparison in the UI.

### Tasks
1. **Integrate Rekognition in Lambda (`backend/src/handlers/createReport.js`)**:
   - Call `DetectLabelsCommand` passing the S3 bucket and object key.
   - Run results through `aiService.js` to compute `aiVerification`, `aiSeverity`, and extract top 5 labels with confidence.
2. **Connect Frontend Side-by-Side Display**:
   - Verify newly submitted reports immediately show both the citizen's inputs and the AI assessment.
   - Display visual badges:
     - `CONSISTENT` (Green badge, check icon).
     - `INCONCLUSIVE` (Yellow/Orange badge, alert icon).
     - `INCONSISTENT` (Red badge, warning icon).
3. **Map Pin Updates**:
   - Add mini indicators on map markers showing whether AI confirmed or flagged inconsistency.

### Exit Criteria
- Submitting a flood photo returns `CONSISTENT` with detected water/flood labels. Submitting an irrelevant photo (e.g. food, furniture) returns `INCONSISTENT`. Both cases display side by side accurately.

---

## Phase 5: Community Voting & Status State Machine

### Objective
Enable citizens to confirm or dispute reports, driving the report verification state machine.

### Tasks
1. **Backend Vote Endpoint (`POST /reports/{id}/vote`)**:
   - Use DynamoDB `UpdateCommand` with atomic expressions:
     ```javascript
     UpdateExpression: "ADD #field :inc"
     ```
   - Calculate new status based on thresholds:
     - If `confirmVotes >= 3` and `confirmVotes > disputeVotes * 2` $\to$ `COMMUNITY_CONFIRMED`.
     - If `disputeVotes >= 3` and `disputeVotes >= confirmVotes` $\to$ `DISPUTED` (or `FALSE`).
2. **Frontend Voting Buttons (`frontend/src/components/VoteControls.jsx`)**:
   - "Confirm (👍)" and "Dispute (👎)" buttons with live vote counts.
   - Client-side storage (e.g., `localStorage`) to prevent multiple votes from the same browser session.
   - Visual status badge transition on the card in real-time.

### Exit Criteria
- Clicking "Dispute" 3 times transitions the card status to `DISPUTED` / `FALSE`, and the card remains visible with the updated status.

---

## Phase 6: Seeding, Verification Checklist & Demo Readiness

### Objective
Populate realistic demo incidents and verify the application against the 6 core checkpoints from [plan.md](file:///home/piyushxdev/Disaster-Report-app/plan.md).

### Tasks
1. **Create Database Seeding Script (`scripts/seedData.js`)**:
   - Seeds 5–8 realistic disaster reports with varying severities and AI statuses across the target demo city/region.
2. **Execute Full 6-Point Verification Checklist**:
   - [ ] 1. Load the web app and view all seeded reports on the map.
   - [ ] 2. Filter map pins by disaster type and severity.
   - [ ] 3. Submit a new anonymous report (photo + GPS + type + severity).
   - [ ] 4. Confirm AI analysis executes (`CONSISTENT` / `INCONCLUSIVE` / `INCONSISTENT`).
   - [ ] 5. Confirm user claim vs AI assessment appear side-by-side.
   - [ ] 6. Confirm the new report pin appears on the live map and votes update its status.
3. **Demo Rehearsal Run**:
   - Walk through the exact hackathon presentation script from Section 7 of [plan.md](file:///home/piyushxdev/Disaster-Report-app/plan.md).

### Exit Criteria
- All 6 checklist items pass consecutively without console errors or manual intervention.

---

## Phase 7: Production Build & Deployment

### Objective
Package the frontend and deploy to AWS Amplify Hosting.

### Tasks
1. **Production Build Test**:
   ```bash
   cd frontend && npm run build
   ```
   Ensure zero bundling or lint errors and verify `dist/` is created.
2. **Deploy to AWS Amplify Hosting**:
   - Connect repository or deploy static artifact using the steps in [aws_setup.md](file:///home/piyushxdev/Disaster-Report-app/aws_setup.md).
   - Configure `VITE_API_URL` environment variable.
3. **Post-Deployment Smoke Test**:
   - Access the live public Amplify URL, submit a live report, and confirm the map updates on production.

### Exit Criteria
- The live production URL is accessible publicly and completes the submission flow.
