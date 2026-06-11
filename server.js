require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const routes  = require('./src/routes/index');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/vcharter', routes);

// ── Health Check ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'Vehicle Charter Service API is running' }));

// ── 404 Handler ────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Vehicle Charter Service API running on http://localhost:${PORT}`);
});
