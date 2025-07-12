import express from "express";
import { check, validationResult } from 'express-validator';
import heroServices from "../services/heroServices.js";
import Hero from "../models/heroModel.js";

// --- ESTA ES LA LÍNEA QUE FALTABA ---
const router = express.Router();

// Llama a getAllHeroes que ahora incluye la mascota
router.get("/heroes", async (req, res) => {
    try {
        const heroes = await heroServices.getAllHeroes();
        res.json(heroes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Llama a getHeroById que ahora incluye la mascota
router.get("/heroes/:id", async (req, res) => {
    try {
        const hero = await heroServices.getHeroById(req.params.id);
        res.json(hero);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Ruta para crear un nuevo héroe
router.post("/heroes",
    [
        check('name').not().isEmpty().withMessage('El nombre es requerido'),
        check('alias').not().isEmpty().withMessage('El alias es requerido')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { name, alias, city, team } = req.body;
            const newHero = new Hero(null, name, alias, city, team);
            const addedHero = await heroServices.addHero(newHero);
            res.status(201).json(addedHero);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
});

// Ruta para actualizar un héroe por su ID
router.put("/heroes/:id", async (req, res) => {
    try {
        const updatedHero = await heroServices.updateHero(req.params.id, req.body);
        res.json(updatedHero);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Ruta para eliminar un héroe por su ID
router.delete('/heroes/:id', async (req, res) => {
    try {
        const result = await heroServices.deleteHero(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Ruta para buscar héroes por ciudad
router.get('/heroes/city/:city', async (req, res) => {
  try {
    const heroes = await heroServices.findHeroesByCity(req.params.city);
    res.json(heroes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta para enfrentar a un villano
router.post('/heroes/:id/enfrentar', async (req, res) => {
  try {
    const result = await heroServices.faceVillain(req.params.id, req.body.villain);
    res.json({ message: result });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

export default router;