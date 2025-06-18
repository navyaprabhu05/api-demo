// demoapi/index.js

const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const serverless = require('serverless-http'); // ✅ required for Vercel

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Firebase config from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// GET route
app.get('/aqi', async (req, res) => {
  try {
    const snapshot = await db.collection('SensorData').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST route
app.post('/aqi', async (req, res) => {
  try {
    const docRef = await db.collection('SensorData').add(req.body);
    res.status(201).json({ id: docRef.id });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Export for Vercel
module.exports = app;
module.exports.handler = serverless(app); // ✅ important for Vercel
