require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
const verifyToken = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (req.method === 'GET' && req.path.endsWith('.html')) {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const target = req.path.replace(/\.html$/, '') || '/';
    return res.redirect(301, target + qs);
  }
  next();
});

app.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/cart') return next();
  express.static(path.join(__dirname, '..'))(req, res, next);
});

app.use('/json', express.static(path.join(__dirname, 'json')));

app.get('/favicon.ico', (req, res) => {
  const fp = path.join(__dirname, '..', 'favicon.ico');
  if (fs.existsSync(fp)) return res.sendFile(fp);
  res.sendStatus(204);
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

app.use('/login', authRoutes);

app.post('/cart', verifyToken, async (req, res) => {
  const db = require('./config/database');
  const user = req.user;
  
  if (!user || !user.userId) {
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }

  const { items, payment_method, shipping_type, address } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart items required' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const cartRes = await client.query('SELECT cart_id FROM cart WHERE user_id = $1 AND status = $2 FOR UPDATE', [user.userId, 'active']);
    let cartId;
    if (cartRes.rows.length > 0) {
      cartId = cartRes.rows[0].cart_id;
    } else {
      const insertCart = await client.query('INSERT INTO cart(user_id, status) VALUES($1, $2) RETURNING cart_id', [user.userId, 'active']);
      cartId = insertCart.rows[0].cart_id;
    }

    await client.query('DELETE FROM cart_item WHERE cart_id = $1', [cartId]);

    const insertItemText = 'INSERT INTO cart_item(cart_id, product_id, quantity) VALUES($1, $2, $3)';
    for (const it of items) {
      const productId = it.product_id || it.id || null;
      const quantity = Number(it.quantity || it.cantidad || 1);
      if (!productId) {
        throw new Error('Each cart item must include a product_id');
      }
      await client.query(insertItemText, [cartId, productId, quantity]);
    }

    if (payment_method || shipping_type || address) {
      await client.query('INSERT INTO order_detail(cart_id, payment_method, shipping_type, address) VALUES($1, $2, $3, $4)', [cartId, payment_method || '', shipping_type || '', address || '']);
      await client.query('UPDATE cart SET status = $1 WHERE cart_id = $2', ['ordered', cartId]);
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Cart saved', cartId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error saving cart:', err.message || err);
    res.status(500).json({ success: false, message: 'Error saving cart' });
  } finally {
    client.release();
  }
});

app.use((req, res, next) => {
  if (req.path.includes('.') || req.path.startsWith('/api') || req.path.startsWith('/login')) return next();
  const candidate = path.join(__dirname, '..', req.path.endsWith('/') ? req.path + 'index.html' : req.path + '.html');
  if (fs.existsSync(candidate)) return res.sendFile(candidate);
  next();
});

app.use(verifyToken);

app.get('/api/products', (req, res) => {
  res.json({ 
    success: true,
    message: 'Products data retrieved successfully',
    user: req.user,
    data: [] 
  });
});

app.get('/api/cart', (req, res) => {
  res.json({ 
    success: true,
    message: 'Cart data retrieved successfully',
    user: req.user,
    data: [] 
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});