const admin = require('firebase-admin');
const fs = require('fs');

// ✅ Load correct Firebase service account key
const serviceAccount = require('./serviceAccountKey.json'); // No extra `.json.json`

// ✅ Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ✅ Load and parse sensor data JSON
const rawData = JSON.parse(fs.readFileSync('sensor_data_150.json', 'utf8'));

// ✅ Your JSON has the structure: { "SensorData": { "<id>": { ... } } }
const sensorData = rawData.SensorData;

async function uploadData() {
  if (!sensorData || typeof sensorData !== 'object') {
    console.error("❌ Invalid JSON format: Expected an object under 'SensorData'");
    return;
  }

  const batch = db.batch();
  const collectionRef = db.collection('SensorData');

  Object.entries(sensorData).forEach(([docId, record]) => {
    const docRef = collectionRef.doc(docId); // Use original doc ID
    batch.set(docRef, record);
  });

  await batch.commit();
  console.log(`✅ Uploaded ${Object.keys(sensorData).length} records to Firestore`);
}

uploadData().catch(error => {
  console.error("❌ Upload failed:", error.message);
});
