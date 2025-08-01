import express from 'express';
import petService from '../services/petService.js';
import Pet from '../models/petModel.js';
import { check, validationResult } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Proteger todas las rutas de mascotas para asegurar que un usuario ha iniciado sesión.
router.use(protect);

// 2. Middleware para obtener el ID del HÉROE seleccionado desde los encabezados.
const getSelectedHeroId = (req, res, next) => {
    const heroId = req.headers['x-user-id'];
    if (!heroId) {
        return res.status(400).json({ error: "El encabezado 'x-user-id' (ID del Héroe) es requerido." });
    }
    req.heroId = parseInt(heroId, 10);
    next();
};

// GET /pets - Obtiene solo las mascotas del HÉROE seleccionado
router.get("/pets", getSelectedHeroId, async (req, res) => {
    try {
        const pets = await petService.getAllPetsForHero(req.heroId);
        res.json(pets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /pets - Crea una mascota para el HÉROE seleccionado
router.post("/pets", getSelectedHeroId, [
    check('name', 'El nombre es requerido').not().isEmpty(),
    check('type', 'El tipo es requerido').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { name, type, superpower } = req.body;
        const newPetData = new Pet(null, name, type, superpower, null);
        const addedPet = await petService.createPetForHero(newPetData, req.heroId);
        res.status(201).json(addedPet);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /pets/:id
router.get("/pets/:id", getSelectedHeroId, async (req, res) => {
    try {
        const petId = req.params.id;
        const pet = await petService.getPetByIdForHero(petId, req.heroId);
        res.json(pet);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// PUT /pets/:id
router.put("/pets/:id", getSelectedHeroId, async (req, res) => {
    try {
        const petId = req.params.id;
        const updatedPet = await petService.updatePetForHero(petId, req.body, req.heroId);
        res.json(updatedPet);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// DELETE /pets/:id
router.delete('/pets/:id', getSelectedHeroId, async (req, res) => {
    try {
        const petId = req.params.id;
        await petService.deletePetForHero(petId, req.heroId);
        res.status(200).json({ message: 'Mascota eliminada exitosamente.' });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export default router;