require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const PocketBase = require('pocketbase/cjs');

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors());

// PocketBase client
const PB_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const pb = new PocketBase(PB_URL);

pb.admins && console.log('PocketBase client ready for', PB_URL);

app.get('/health', (req, res) => res.json({ ok: true }));

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  try {
    const authData = await pb.collection('users').authWithPassword(email, password);
    const user = authData.record;
    return res.json({ ok: true, user: { id: user.id, email: user.email }, token: authData.token });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ error: 'Password must be 6+ characters' });

  try {
    const created = await pb.collection('users').create({ email, password, passwordConfirm: password });
    return res.status(201).json({ ok: true, user: { id: created.id, email: created.email } });
  } catch (err) {
    console.error(err);
    // PocketBase will return 400 for validation/duplicate errors
    if (err && err.status === 400) return res.status(400).json({ error: err.message || 'Validation error' });
    return res.status(500).json({ error: 'Internal error' });
  }
});

// Request password reset (create a token row)
app.post('/api/reset-password', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Missing email' });

  try {
    await pb.collection('users').requestPasswordReset(email);
    return res.json({ ok: true, message: 'If the account exists, you will receive an email' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
