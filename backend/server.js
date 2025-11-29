const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const verificarToken = require('./middleware/authMiddleware');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Rutas públicas (sin autenticación)
app.use('/login', authRoutes);

// Rutas protegidas (requieren autenticación)
app.get('/api/productos', verificarToken, (req, res) => {
  res.json({ 
    success: true,
    mensaje: 'Productos obtenidos correctamente',
    usuario: req.user,
    datos: [] 
  });
});

app.get('/api/carrito', verificarToken, (req, res) => {
  res.json({ 
    success: true,
    mensaje: 'Datos del carrito obtenidos correctamente',
    usuario: req.user,
    datos: [] 
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});