/**
 * Seed Script: Populates DynamoDB table with curated demo incidents
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { demoIncidentFixtures } from './fixtures/reportsFixture.js';

const region = process.env.AWS_REGION || 'ap-south-1';
const tableName = process.env.TABLE_NAME || 'DisasterReports';

async function seed() {
  console.log(`Starting seed to DynamoDB table "${tableName}" in region "${region}"...`);

  const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));

  let successCount = 0;
  for (const report of demoIncidentFixtures) {
    try {
      await client.send(new PutCommand({
        TableName: tableName,
        Item: report
      }));
      console.log(`✓ Seeded report: ${report.reportId} (${report.disasterType})`);
      successCount++;
    } catch (err) {
      console.error(`✗ Failed to seed ${report.reportId}:`, err.message);
    }
  }

  console.log(`\nSeeding completed: ${successCount}/${demoIncidentFixtures.length} reports successfully added.`);
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
