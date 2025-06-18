const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serverless = require('serverless-http');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Load Firebase credentials from Vercel environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 🔹 GET /aqi — fetch all AQI sensor data
app.get('/aqi', async (req, res) => {
  try {
    const snapshot = await db.collection('SensorData').get();
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log("Fetched AQI data:", data); // For Vercel logs
    res.json(data);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send(`Error fetching AQI data: ${err.message}`);
  }
});

// 🔸 POST /aqi — add new sensor data to Firestore
app.post('/aqi', async (req, res) => {
  try {
    const docRef = await db.collection('SensorData').add(req.body);
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    console.error("Error adding data:", err);
    res.status(500).send(`Error adding AQI data: ${err.message}`);
  }
});

// ✅ Export app for Vercel serverless deployment
module.exports = app;
module.exports.handler = serverless(app);
