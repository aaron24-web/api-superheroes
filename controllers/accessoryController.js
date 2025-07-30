import express from 'express';
import accessoryRepository from '../repositories/accessoryRepository.js';

// La variable se llama 'router'
const router = express.Router();

// Endpoint para obtener la lista de todos los accesorios disponibles
router.get('/accessories', async (req, res) => {
    try {
        const accessories = await accessoryRepository.getAccessories();
        res.json(accessories);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los accesorios.' });
    }
});

// La exportación debe coincidir con el nombre de la variable: 'router'
export default router;