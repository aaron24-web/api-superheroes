// controllers/gameController.js
import express from 'express';
import gameService from '../services/gameService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protege todas las rutas del juego para asegurar que el usuario ha iniciado sesión
router.use(protect);

// Middleware para obtener el ID del HÉROE seleccionado (que es el dueño de la mascota)
const getSelectedHeroId = (req, res, next) => {
    const heroId = req.headers['x-user-id'];
    if (!heroId) {
        return res.status(400).json({ error: "El encabezado 'x-user-id' (ID del Héroe) es requerido." });
    }
    req.heroId = parseInt(heroId, 10);
    next();
};

// Aplica el middleware a TODAS las rutas de /game
router.use('/game', getSelectedHeroId);

// Seleccionar una mascota para empezar a jugar
router.post("/game/select-pet/:id", async (req, res) => {
    try {
        const pet = await gameService.selectPet(req.params.id, req.heroId);
        res.status(200).json({ message: `Has seleccionado a ${pet.name}. ¡Que empiece el juego!`, pet });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Cerrar sesión con la mascota actual
router.post("/game/logout", (req, res) => {
    try {
        const result = gameService.logout();
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Obtener el estado de la mascota activa
router.get("/game/status", async (req, res) => {
    try {
        const status = await gameService.getStatus();
        res.status(200).json(status);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// Alimentar a la mascota activa
router.post("/game/feed", async (req, res) => {
    try {
        const result = await gameService.feedPet();
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Sacar a pasear a la mascota activa
router.post("/game/walk", async (req, res) => {
    try {
        const result = await gameService.walkPet();
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Curar a la mascota activa
router.post("/game/cure", async (req, res) => {
    try {
        const result = await gameService.curePet();
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Revertir la personalidad de la mascota activa
router.post("/game/revert-personality", async (req, res) => {
    try {
        const result = await gameService.revertPersonality();
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/game/buy/:accessoryId", async (req, res) => {
    try {
        const result = await gameService.buyAccessory(req.params.accessoryId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/game/equip/:accessoryId", async (req, res) => {
    try {
        const result = await gameService.equipAccessory(req.params.accessoryId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;