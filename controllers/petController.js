// controllers/petController.js
import express from 'express';
import petService from '../services/petService.js';
import Pet from '../models/petModel.js';

const router = express.Router();

// GET /pets - Obtener todas las mascotas
router.get("/pets", async (req, res) => {
    try {
        const pets = await petService.getAllPetsWithOwners();
        res.json(pets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- NUEVA RUTA ---
// GET /pets/:id - Obtener una mascota por su ID
router.get("/pets/:id", async (req, res) => {
    try {
        const pet = await petService.getPetById(req.params.id);
        res.json(pet);
    } catch (error) {
        // Si el servicio lanza un error (ej. no encontrado), devolvemos 404
        res.status(404).json({ error: error.message });
    }
});
// --- FIN DE LA NUEVA RUTA ---


// POST /pets - Crear una nueva mascota
router.post("/pets", async (req, res) => {
    try {
        const { name, type, superpower, heroId } = req.body;
        const newPet = new Pet(null, name, type, superpower, parseInt(heroId));
        const addedPet = await petService.createPet(newPet);
        res.status(201).json(addedPet);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /pets/:id - Actualizar una mascota
router.put("/pets/:id", async (req, res) => {
    try {
        const updatedPet = await petService.updatePet(req.params.id, req.body);
        res.json(updatedPet);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// DELETE /pets/:id - Eliminar una mascota
router.delete('/pets/:id', async (req, res) => {
    try {
        await petService.deletePet(req.params.id);
        res.status(200).json({ message: 'Mascota eliminada exitosamente' });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export default router;