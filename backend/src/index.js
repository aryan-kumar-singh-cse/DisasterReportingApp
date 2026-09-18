import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { RekognitionClient, DetectLabelsCommand } from '@aws-sdk/client-rekognition';
import { assessEvidence } from './services/aiService.js';
import { applyVote } from './services/voteService.js';
import crypto from 'crypto';

const region = process.env.AWS_REGION || 'ap-south-1';
const tableName = process.env.TABLE_NAME || 'DisasterReports';
const bucketName = process.env.BUCKET_NAME || 'disaster-reports-storage';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));
const s3 = new S3Client({ region });
const rekognition = new RekognitionClient({ region });

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body)
  };
}

export async function handler(event) {
  console.log('Event received:', JSON.stringify(event));

  // Determine path and method from API Gateway proxy event
  const path = event.rawPath || event.path || '';
  const method = (event.requestContext?.http?.method || event.httpMethod || '').toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return response(200, { ok: true });
  }

  try {
    // 1. Health Check
    if (path.endsWith('/health')) {
      return response(200, {
        status: 'ok',
        service: 'ResQ Disaster Intelligence Backend',
        timestamp: new Date().toISOString()
      });
    }

    // 2. GET /reports
    if (path.endsWith('/reports') && method === 'GET') {
      const result = await ddb.send(new ScanCommand({ TableName: tableName }));
      const items = (result.Items || []).sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      return response(200, items);
    }

    // 3. POST /reports/upload-url
    if (path.endsWith('/reports/upload-url') && method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const contentType = body.contentType || 'image/jpeg';
      const fileExt = contentType.includes('png') ? 'png' : 'jpg';
      const s3Key = `uploads/${crypto.randomUUID()}.${fileExt}`;

      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        ContentType: contentType
      });

      const uploadUrl = await getSignedUrl(s3, putCommand, { expiresIn: 300 });
      const photoUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;

      return response(200, { uploadUrl, s3Key, photoUrl });
    }

    // 4. POST /reports (Submit new incident & run AI assessment)
    if (path.endsWith('/reports') && method === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {};
      const {
        disasterType,
        userSeverity,
        description,
        photoKey,
        photoUrl,
        latitude,
        longitude,
        locationName
      } = body;

      if (!disasterType || latitude === undefined || longitude === undefined) {
        return response(400, { error: 'Missing required fields: disasterType, latitude, longitude' });
      }

      // Run Rekognition assessment if S3 photo is provided
      let detectedLabels = [];
      if (photoKey && bucketName) {
        try {
          const rekogRes = await rekognition.send(
            new DetectLabelsCommand({
              Image: {
                S3Object: {
                  Bucket: bucketName,
                  Name: photoKey
                }
              },
              MaxLabels: 15,
              MinConfidence: 65
            })
          );
          detectedLabels = rekogRes.Labels || [];
        } catch (rekogErr) {
          console.warn('Rekognition analysis warning:', rekogErr.message);
        }
      }

      const assessment = assessEvidence(disasterType, detectedLabels);

      const reportId = `rep-${crypto.randomUUID().slice(0, 8)}`;
      const now = new Date().toISOString();

      const newReport = {
        reportId,
        disasterType,
        userSeverity: userSeverity || 'Medium',
        description: description || '',
        photoKey: photoKey || null,
        photoUrl: photoUrl || '',
        latitude: Number(latitude),
        longitude: Number(longitude),
        locationName: locationName || 'Citizen Report',
        aiSeverity: assessment.aiSeverity,
        aiVerification: assessment.aiVerification,
        aiDetectedLabels: (assessment.matchingLabels.length > 0 ? assessment.matchingLabels : detectedLabels).slice(0, 5).map(l => ({
          name: l.Name || l.name,
          confidence: Math.round(l.Confidence || l.confidence || 0)
        })),
        verificationStatus: 'AI_ASSESSED',
        confirmVotes: 0,
        disputeVotes: 0,
        createdAt: now
      };

      await ddb.send(new PutCommand({
        TableName: tableName,
        Item: newReport
      }));

      return response(201, newReport);
    }

    // 5. POST /reports/{id}/vote
    const voteMatch = path.match(/\/reports\/([a-zA-Z0-9_-]+)\/vote$/);
    if (voteMatch && method === 'POST') {
      const reportId = voteMatch[1];
      const body = event.body ? JSON.parse(event.body) : {};
      const { voteType } = body;

      if (!['CONFIRM', 'DISPUTE'].includes(voteType)) {
        return response(400, { error: 'Invalid voteType. Must be CONFIRM or DISPUTE' });
      }

      // Fetch current report
      const getRes = await ddb.send(new GetCommand({
        TableName: tableName,
        Key: { reportId }
      }));

      if (!getRes.Item) {
        return response(404, { error: 'Report not found' });
      }

      const updatedFields = applyVote(getRes.Item, voteType);

      await ddb.send(new UpdateCommand({
        TableName: tableName,
        Key: { reportId },
        UpdateExpression: 'SET confirmVotes = :cv, disputeVotes = :dv, verificationStatus = :vs',
        ExpressionAttributeValues: {
          ':cv': updatedFields.confirmVotes,
          ':dv': updatedFields.disputeVotes,
          ':vs': updatedFields.verificationStatus
        }
      }));

      return response(200, {
        ...getRes.Item,
        ...updatedFields
      });
    }

    return response(404, { error: `Not found: ${method} ${path}` });
  } catch (error) {
    console.error('Server error:', error);
    return response(500, { error: error.message || 'Internal Server Error' });
  }
}
