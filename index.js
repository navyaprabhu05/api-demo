const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Load Firebase service account from environment variable
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin SDK:", error.message);
  process.exit(1); // Exit the app if Firebase config fails
}

const db = admin.firestore();

// GET AQI Data
app.get('/aqi', async (req, res) => {
  try {
    const snapshot = await db.collection('SensorData').get();
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(data);
  } catch (err) {
    res.status(500).send(`Error fetching AQI data: ${err.message}`);
  }
});

// POST AQI Data
app.post('/aqi', async (req, res) => {
  try {
    const docRef = await db.collection('SensorData').add(req.body);
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    res.status(500).send(`Error adding AQI data: ${err.message}`);
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 API running at http://localhost:${PORT}`);
});
