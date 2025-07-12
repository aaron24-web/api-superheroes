// controllers/gameController.js
import express from 'express';
import gameService from '../services/gameService.js';

const router = express.Router();

// Seleccionar una mascota para empezar a jugar
router.post("/game/select-pet/:id", async (req, res) => {
    try {
        const pet = await gameService.selectPet(req.params.id);
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

export default router;