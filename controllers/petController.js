import express from 'express';
import petService from '../services/petService.js';
import Pet from '../models/petModel.js';
import { check, validationResult } from 'express-validator';

const router = express.Router();

// --- Middleware de Autenticación de Usuario ---
// Este middleware se ejecuta ANTES que cualquier ruta de mascotas.
// Su trabajo es verificar que el encabezado 'x-user-id' exista y añadirlo a la petición.
const userAuthMiddleware = (req, res, next) => {
    const userId = req.headers['x-user-id'];

    if (!userId) {
        // Si no se proporciona el encabezado, se rechaza la petición.
        return res.status(401).json({ error: "El encabezado 'x-user-id' es requerido para esta operación." });
    }
    // Añadimos el userId al objeto 'req' para que las siguientes funciones puedan usarlo.
    req.userId = parseInt(userId, 10);
    next(); // Pasa al siguiente middleware o a la ruta correspondiente.
};

// Aplicamos el middleware a TODAS las rutas que empiecen con /pets.
// Esto protege todos los endpoints de mascotas (GET, POST, PUT, DELETE).
router.use('/pets', userAuthMiddleware);


// --- Endpoints Protegidos ---

// GET /pets - Obtiene solo las mascotas DEL USUARIO ACTUAL.
router.get("/pets", async (req, res) => {
    try {
        // Pasamos el ID del usuario (obtenido por el middleware) al servicio.
        const pets = await petService.getAllPetsForUser(req.userId);
        res.json(pets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /pets/:id - Obtiene una mascota específica DEL USUARIO ACTUAL.
router.get("/pets/:id", async (req, res) => {
    try {
        const petId = req.params.id;
        const pet = await petService.getPetByIdForUser(petId, req.userId);
        res.json(pet);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});


// POST /pets - Crea una mascota PARA EL USUARIO ACTUAL.
router.post("/pets",
    [
        // La validación ya no necesita 'heroId' porque lo tomamos del encabezado.
        check('name', 'El nombre es requerido').not().isEmpty(),
        check('type', 'El tipo es requerido').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, type, superpower } = req.body;
            // Creamos la mascota. El heroId se asignará en el servicio usando req.userId.
            const newPet = new Pet(null, name, type, superpower, null);
            const addedPet = await petService.createPetForUser(newPet, req.userId);
            res.status(201).json(addedPet);
        } catch (error) {
            // Errores de negocio como "el héroe ya tiene una mascota".
            res.status(400).json({ error: error.message });
        }
    }
);

// PUT /pets/:id - Actualiza una mascota DEL USUARIO ACTUAL.
router.put("/pets/:id", async (req, res) => {
    try {
        const petId = req.params.id;
        // Pasamos tanto el ID de la mascota como el ID del usuario para validación.
        const updatedPet = await petService.updatePetForUser(petId, req.body, req.userId);
        res.json(updatedPet);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// DELETE /pets/:id - Elimina una mascota DEL USUARIO ACTUAL.
router.delete('/pets/:id', async (req, res) => {
    try {
        const petId = req.params.id;
        // Pasamos el ID de la mascota y el del usuario para asegurar que solo borre la suya.
        await petService.deletePetForUser(petId, req.userId);
        res.status(200).json({ message: 'Mascota eliminada exitosamente.' });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export default router;