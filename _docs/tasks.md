# Project Backlog: Crowdsourced Disaster Reporting App

This backlog divides the project into self-contained tasks. The tasks are classified into two major groups:
1. **Tasks 1–12 (Non-AWS Tasks)**: Require **no AWS account or cloud infrastructure**. These can be developed, mocked, and tested entirely locally in parallel by team members (Frontend, Backend, and Product engineers).
2. **Tasks 13–21 (AWS Tasks)**: Dedicated to **one person (Cloud / Infrastructure Lead)** who provisions, configures, and connects the AWS cloud services (S3, DynamoDB, Rekognition, IAM, API Gateway, and Amplify).

---

# Part 1: Non-AWS Tasks (Zero Cloud Dependency — Local Development)

## 1. Project Scaffolding and Passing Smoke Test Setup
Goal: Initialize the repository workspace with a React frontend and a test runner that executes a passing smoke test.
Description: Initialize the project workspace and scaffold a React application using Vite in `frontend/` alongside a test runner such as Vitest or Node's test runner. Configure package scripts so that running `npm test` successfully executes and passes an initial smoke test verifying the test runner functions properly. Ensure a clean project structure with a root `.gitignore` ignoring build artifacts, coverage reports, and dependencies.

## 2. Shared Data Contract and Mock Disaster Dataset
Goal: Define the standardized JSON report schema and generate a rich mock dataset for local development.
Description: Create a schema definition specifying all report attributes including `reportId`, `disasterType`, `description`, `photoUrl`, `latitude`, `longitude`, `userSeverity`, `aiSeverity`, `aiVerification` (`CONSISTENT`, `INCONCLUSIVE`, `INCONSISTENT`), `verificationStatus`, and vote counts. Create a companion `mockReports.js` file containing at least four distinct incident records representing varied disaster scenarios and AI verification states. Ensure this dataset can be imported directly by frontend components to build and test the complete application without any network or cloud dependency.

## 3. Interactive Leaflet Map with Color-Coded Incident Pins
Goal: Render an interactive OpenStreetMap view displaying disaster incidents as color-coded markers.
Description: Implement a Leaflet map component using `leaflet` and `react-leaflet` centered on default regional coordinates with OpenStreetMap tile layers. Render custom SVG or styled markers for each incident in the dataset, color-coding pins by disaster type (e.g., blue for flood, orange for fire, stone gray for infrastructure damage) and severity. Wire an event handler so clicking any pin triggers a callback providing the selected incident's details.

## 4. Disaster Report Filter and Sort Toolbar
Goal: Create an interactive filter and sorting toolbar to slice reports by type, severity, and AI verification status.
Description: Build a toolbar component with selectable filter buttons or dropdowns for disaster types (`All`, `Flood`, `Fire`, `Earthquake`, `Infrastructure`), severity levels (`Low`, `Medium`, `High`, `Critical`), and AI assessment outcomes (`All`, `Consistent`, `Inconclusive`, `Inconsistent`). Add sort selectors to order incidents by newest timestamp or highest severity. Expose an `onChange` callback that outputs active filter criteria so the report list and map view update reactively.

## 5. Side-by-Side Citizen Claim vs AI Assessment Card
Goal: Build the core novel UI component that contrasts the citizen's claim against the AI's independent photo assessment.
Description: Construct a report detail component displaying the citizen's submitted photograph, description, and timestamp above two side-by-side comparison columns: "Citizen Claim" (stated disaster type and user-selected severity) and "AI Evidence Assessment" (outcome badge for `CONSISTENT`, `INCONCLUSIVE`, or `INCONSISTENT`, AI-estimated severity, and detected label tags with confidence percentages). Include a mandatory technical disclaimer banner at the bottom stating that the AI output is an automated evidence assessment, not an emergency response authority. Ensure the card renders cleanly in both expanded modal view and sidebar drawer formats.

## 6. Anonymous Report Submission Modal with GPS and Mini-Map Pin Adjuster
Goal: Create a one-screen anonymous reporting modal with photo preview and interactive GPS pin adjustment.
Description: Build a modal containing input controls for disaster type selection, severity level selection, an optional description, and a photo file input with instant local thumbnail preview. Automatically query the browser's `navigator.geolocation` API to populate initial coordinates, and embed a compact Leaflet mini-map with a draggable pin allowing citizens to manually adjust their location. Ensure the component validates that a photo, disaster type, and coordinates are present before invoking the submit handler.

## 7. Client-Side Community Voting UI and Duplicate-Vote Guard
Goal: Add interactive confirm and dispute voting buttons to the report card with local session deduplication.
Description: Build a voting control component featuring "Confirm (👍)" and "Dispute (👎)" action buttons displaying dynamic vote counts alongside a status badge. Store voted report IDs in the browser's `localStorage` to prevent duplicate votes from the same user session. Wire the buttons to optimistically update the report's vote count and trigger state machine transitions (`COMMUNITY_CONFIRMED` or `DISPUTED` / `FALSE`) in local state.

## 8. Local Mock API Service and Offline Data Provider
Goal: Implement an abstraction layer that allows the entire frontend to run seamlessly with mock data or live endpoints.
Description: Create a frontend API client module in `frontend/src/services/api.js` providing methods for fetching reports, submitting a new report, requesting upload URLs, and casting votes. Implement an offline fallback switch so that if `VITE_API_URL` is empty or unreachable, the client operates entirely in-memory using `mockReports.js`. Ensure this enables frontend teammates to develop and demo all UI workflows without waiting for cloud services to be online.

## 9. Backend Internal Routing Skeleton and Local Event Runner
Goal: Build the single Lambda internal router and a local script to test event routing without deploying to AWS.
Description: Create `backend/src/index.js` exporting a single request handler that inspects API Gateway HTTP API proxy events (`event.rawPath` and `event.requestContext.http.method`) and routes to internal controllers. Implement standardized JSON response utilities with default CORS headers (`Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: GET, POST, OPTIONS`). Create a `backend/localRunner.js` test harness that feeds simulated API Gateway event fixtures into the handler to verify route matching locally without AWS credentials.

## 10. Local Rule-Based AI Evidence Assessment Engine
Goal: Build and unit-test the keyword matching and severity heuristic engine that evaluates photo labels against claims.
Description: Create `backend/src/services/aiService.js` containing label dictionaries for Flood, Fire, Earthquake, and Infrastructure Damage. Implement matching logic that compares an array of detected image labels against the user's claimed disaster type and returns `CONSISTENT` (high confidence matching keywords), `INCONSISTENT` (contradicting or non-disaster labels), or `INCONCLUSIVE` (ambiguous or low confidence). Add heuristic severity calculation and write standalone local unit tests to verify consistency classifications across diverse label sets.

## 11. Community Voting Logic and Status State Machine
Goal: Implement and unit-test the voting state transition engine that updates report statuses.
Description: Build a business logic service in `backend/src/services/voteService.js` that takes an existing report and an incoming vote (`CONFIRM` or `DISPUTE`) and computes updated vote totals. Implement status threshold checks that transition `verificationStatus` from `AI_ASSESSED` to `COMMUNITY_CONFIRMED` (when confirms meet threshold) or `DISPUTED` / `FALSE` (when disputes exceed confirms). Write local unit tests verifying all status transition branches and edge cases without connecting to a live database.

## 12. Realistic Demo Data Generator and Seeding Fixtures
Goal: Create a curated dataset of realistic demo incidents with pre-evaluated labels and coordinates for demonstrations.
Description: Construct a data file in `scripts/fixtures/reportsFixture.js` containing 6 to 8 realistic incident objects complete with public test image URLs, diverse disaster types, and pre-calculated AI labels. Ensure the incidents span a coherent metropolitan area and demonstrate each key scenario: verified flood, false fire claim, inconclusive structural damage, and community-disputed hazard. Ensure the fixture can be imported both by frontend mock providers and by the cloud database seeding script.

---

# Part 2: AWS Tasks (Dedicated to One Person / Cloud Infrastructure Lead)

## 13. AWS Account Budget Alert and Onboarding Credits Configuration
Goal: Set up an AWS zero-spend budget alert and claim the new Free Tier onboarding credits.
Description: Configure a zero-spend or $1.00 budget alert in AWS Budgets with an email notification destination to prevent unexpected charges during development. Complete the introductory console checklist activities to unlock additional AWS Free Tier credits. Document the AWS region (e.g., `us-east-1` or `ap-south-1`) to be used consistently across all provisioned services.

## 14. Amazon S3 Bucket Creation and CORS Configuration
Goal: Provision a private Amazon S3 bucket with cross-origin rules configured for direct browser photo uploads.
Description: Create a private S3 bucket named `disaster-reports-[unique-suffix]` with Block All Public Access enabled for data security. Configure the bucket's CORS policy using a JSON rule allowing `PUT`, `GET`, and `HEAD` requests from `*` (or your frontend domain) with allowed headers `*`. Export the bucket name and region into the backend environment configuration template.

## 15. Amazon DynamoDB Disaster Reports Table Provisioning
Goal: Provision a serverless DynamoDB table for storing disaster reports, AI assessments, and community votes.
Description: Create an Amazon DynamoDB table named `DisasterReports` with a single partition key `reportId` of type String (`S`). Select On-Demand capacity mode to ensure zero idle charges and automatic scaling within free tier limits. Record the table name and ARN for Lambda environment variables and IAM policy scoping.

## 16. AWS IAM Lambda Execution Role and Policy Configuration
Goal: Create a dedicated IAM execution role granting Lambda permissions for DynamoDB, S3, Rekognition, and CloudWatch.
Description: Create an IAM role named `DisasterReportLambdaRole` with a trust relationship allowing the `lambda.amazonaws.com` service principal to assume it. Attach the AWS managed policies `AWSLambdaBasicExecutionRole` and `AmazonRekognitionReadOnlyAccess`, along with scoped policies granting `PutItem`, `GetItem`, `Scan`, and `UpdateItem` on `DisasterReports`, and `PutObject`/`GetObject` on the S3 bucket. Record the role ARN for association with the backend Lambda function.

## 17. Amazon Rekognition Integration in Lambda
Goal: Wire Amazon Rekognition's DetectLabels API into the Lambda backend to analyze uploaded S3 photos.
Description: Integrate `@aws-sdk/client-rekognition` into the Lambda handler and invoke `DetectLabelsCommand` on the uploaded photo's S3 bucket and key with a 65% minimum confidence threshold. Pass the returned Rekognition labels into the rule-based AI assessment engine to compute the consistency status and severity rating. Ensure proper error handling and fallback to `INCONCLUSIVE` if Rekognition detects no recognizable labels.

## 18. S3 Presigned Upload URL Lambda Route
Goal: Implement a Lambda route that generates secure presigned S3 URLs for direct browser photo uploads.
Description: Add a `POST /reports/upload-url` route to the Lambda handler using `@aws-sdk/s3-request-presigner` and `@aws-sdk/client-s3`. Parse the incoming image MIME type, generate a unique S3 key in the format `uploads/{uuid}.jpg`, and return a presigned `PUT` URL valid for 5 minutes along with the final photo URL. Test presigned URL generation and direct file upload using a local `curl` command.

## 19. Report Persistence and Listing Lambda Routes with DynamoDB
Goal: Implement Lambda routes for persisting new reports and retrieving all reports from DynamoDB.
Description: Implement `POST /reports` to orchestrate presigned photo validation, Rekognition assessment, and DynamoDB persistence using `@aws-sdk/lib-dynamodb` `PutCommand`. Implement `GET /reports` to scan and return all stored reports sorted by creation timestamp. Verify using `curl` or Postman that creating a report saves the record in DynamoDB and that `GET /reports` retrieves it.

## 20. Amazon API Gateway HTTP API Proxy and CORS Configuration
Goal: Deploy and configure an Amazon API Gateway HTTP API that proxies requests to the Lambda function.
Description: Create an HTTP API named `DisasterReportAPI` in API Gateway with a catch-all proxy route `ANY /{proxy+}` integrated with the `DisasterReportHandler` Lambda function. Configure global CORS on the API Gateway allowing all origins (`*`), headers (`*`), and methods (`GET, POST, OPTIONS`). Deploy the API to the `$default` stage with auto-deploy enabled, verify `GET /health` returns HTTP 200, and provide the Invoke URL to frontend teammates.

## 21. AWS Amplify Hosting Deployment and 6-Point Verification Check
Goal: Deploy the production frontend to AWS Amplify Hosting and verify the full application against the 6 core checkpoints.
Description: Configure AWS Amplify Hosting to build and host the React single-page application from `frontend/dist` with the `VITE_API_URL` environment variable set to the API Gateway Invoke URL. Execute an end-to-end verification run through the 6 core checkpoints: load the live map, inspect an existing report card, submit an anonymous report with GPS and photo, verify the automated AI assessment, confirm the side-by-side display, and observe the new pin appear on the live map. Document the live production URL in the repository.
