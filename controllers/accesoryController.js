import express from 'express';
import accessoryRepository from '../repositories/accessoryRepository.js';

const router = express.Router();

// GET /accessories - Obtiene todos los accesorios disponibles
router.get("/accessories", async (req, res) => {
    try {
        const accessories = await accessoryRepository.getAccessories();
        res.json(accessories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;