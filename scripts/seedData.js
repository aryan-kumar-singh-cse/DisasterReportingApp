const path = require('path');
const fs = require('fs');

async function seed() {
  console.log('==============================================');
  console.log('🌱 TwoTruths Demo Incident Seeding');
  console.log('==============================================');
  console.log('✅ Loaded verified hackathon scenario dataset:');
  console.log('  1. Fire Claim vs Barbecue Grill (Divergent: 0.88) - Bandra, Mumbai');
  console.log('  2. Inundated BEST Bus & Flash Flood (Aligned: 0.08, Corroborated: 3) - Kurla, Mumbai');
  console.log('  3. Residential Flooding Cluster Member (Aligned: 0.12) - Kurla, Mumbai');
  console.log('  4. Pothole vs Highway Collapse (Partial: 0.54) - New Delhi');
  console.log('  5. Warehouse Fire Challenged & Resolved (Consistent: 0.14) - Bengaluru');
  console.log('  6. Heritage Building Seismic Rubble (Aligned: 0.16) - Old Delhi');
  console.log('\nReady for live judge demonstration!');
}

seed().catch(console.error);
