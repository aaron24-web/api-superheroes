import express from "express";
import { check, validationResult } from 'express-validator';
import heroServices from "../services/heroServices.js";
import Hero from "../models/heroModel.js";
import { protect } from '../middleware/authMiddleware.js'; // <-- IMPORTA LA PROTECCIÓN

const router = express.Router();

// APLICA LA PROTECCIÓN A TODAS LAS RUTAS DE HÉROES
// Solo los usuarios con un token válido podrán acceder a estas rutas.
router.use(protect);

// GET /heroes - AHORA OBTIENE SÓLO LOS HÉROES DEL USUARIO LOGUEADO
router.get("/heroes", async (req, res) => {
    try {
        // Pasa el ID del usuario (obtenido del token) al servicio para filtrar
        const heroes = await heroServices.getAllHeroes(req.user.userId);
        res.json(heroes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /heroes/:id - Obtiene un héroe específico (ya está protegido)
router.get("/heroes/:id", async (req, res) => {
    try {
        const hero = await heroServices.getHeroById(req.params.id);
        // Opcional: podrías añadir una capa extra de seguridad para verificar que este héroe le pertenece al usuario.
        res.json(hero);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// POST /heroes - AHORA CREA EL HÉROE ASOCIADO AL USUARIO LOGUEADO
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
            // Pasa el ID del usuario del token para asociar el nuevo héroe
            const addedHero = await heroServices.addHero(newHero, req.user.userId);
            res.status(201).json(addedHero);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
});

// PUT /heroes/:id - Actualiza un héroe (ya está protegido)
router.put("/heroes/:id", async (req, res) => {
    try {
        const updatedHero = await heroServices.updateHero(req.params.id, req.body);
        res.json(updatedHero);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// DELETE /heroes/:id - Elimina un héroe (ya está protegido)
router.delete('/heroes/:id', async (req, res) => {
    try {
        const result = await heroServices.deleteHero(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// GET /heroes/city/:city - Busca héroes por ciudad (ya está protegido)
router.get('/heroes/city/:city', async (req, res) => {
  try {
    // El servicio deberá ser modificado para aceptar también el userId si quieres que la búsqueda sea solo dentro de los héroes del usuario.
    const heroes = await heroServices.findHeroesByCity(req.params.city, req.user.userId);
    res.json(heroes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /heroes/:id/enfrentar - Ruta de ejemplo (ya está protegida)
router.post('/heroes/:id/enfrentar', async (req, res) => {
  try {
    const result = await heroServices.faceVillain(req.params.id, req.body.villain);
    res.json({ message: result });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

export default router;