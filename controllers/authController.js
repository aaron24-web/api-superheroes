// controllers/authController.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '../config/db.js';

const router = express.Router();

async function getUsersCollection() {
    const db = await connectDB();
    return db.collection('users');
}

// RUTA: POST /auth/register
router.post('/auth/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
    }

    try {
        const users = await getUsersCollection();
        const existingUser = await users.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'El nombre de usuario ya existe.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = await users.insertOne({ username, password: hashedPassword });
        
        res.status(201).json({ message: 'Usuario registrado exitosamente.', userId: newUser.insertedId });

    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor al registrar usuario.' });
    }
});

// RUTA: POST /auth/login
router.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
    }

    try {
        const users = await getUsersCollection();
        const user = await users.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }
        
        // El secreto del token debería estar en tu archivo .env
        const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET || 'tu_secreto_super_secreto', {
            expiresIn: '1h' // El token expira en 1 hora
        });

        res.json({
            message: 'Inicio de sesión exitoso.',
            token,
            user: { id: user._id, username: user.username }
        });

    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor al iniciar sesión.' });
    }
});

export default router;