const jwt = require('jsonwebtoken');

// Middleware de verificación de token JWT
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // Verificar que el header Authorization exista
    if (!authHeader) {
        return res.status(403).json({ 
            success: false,
            mensaje: 'Token requerido' 
        });
    }

    // Validar formato Bearer <token>
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ 
            success: false,
            mensaje: 'Formato de token inválido. Use: Bearer <token>' 
        });
    }

    const token = parts[1];

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