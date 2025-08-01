// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtiene el token del encabezado ('Bearer TOKEN')
            token = req.headers.authorization.split(' ')[1];

            // Verifica el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_super_secreto');
            
            // Añade los datos del usuario decodificado a la petición
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ error: 'No autorizado, token fallido' });
        }
    }

    if (!token) {
        res.status(401).json({ error: 'No autorizado, no hay token' });
    }
};