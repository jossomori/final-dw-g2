const jwt = require('jsonwebtoken');

// Middleware de verificación de token JWT
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];

    // Verificar que el token exista
    if (!token) {
        return res.status(403).json({ 
            success: false,
            mensaje: 'Token requerido' 
        });
    }

    // Verificar y decodificar el token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ 
                success: false,
                mensaje: 'Token inválido' 
            });
        }

        // Almacenar información del usuario en req.user
        req.user = decoded;
        next();
    });
};

module.exports = verificarToken;