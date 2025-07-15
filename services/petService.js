import petRepository from '../repositories/petRepository.js';
import heroRepository from '../repositories/heroRepository.js';
import gameService from './gameService.js';

// --- Funciones de Lógica de Mascotas ---

async function getAllPetsForUser(userId) {
    return await petRepository.findPetsByHeroId(userId);
}

async function getPetByIdForUser(petId, userId) {
    const pet = await petRepository.getPetById(petId);
    if (!pet || pet.heroId !== userId) {
        throw new Error('Mascota no encontrada o no pertenece a este usuario.');
    }
    return pet;
}

// --- FUNCIÓN CORREGIDA ---
async function createPetForUser(petData, userId) {
    // 1. Primero, validamos que el superhéroe (usuario) exista.
    const ownerExists = await heroRepository.getHeroById(userId);
    if (!ownerExists) {
        // Si no existe, detenemos la ejecución aquí con un error claro.
        throw new Error(`El usuario con id '${userId}' no existe.`);
    }

    // 2. Ahora que sabemos que el dueño existe, validamos si ya tiene una mascota.
    const existingPets = await petRepository.findPetsByHeroId(userId);
    if (existingPets.length > 0) {
        // Como sabemos que ownerExists no es nulo, podemos usar su nombre de forma segura.
        throw new Error(`El superhéroe ${ownerExists.name} ya tiene una mascota asignada.`);
    }

    // 3. Si todas las validaciones pasan, asignamos el dueño y la personalidad.
    petData.heroId = userId;
    gameService.assignInitialPersonality(petData);

    // 4. Finalmente, creamos la mascota en la base de datos.
    return await petRepository.addPet(petData);
}

async function updatePetForUser(petId, petData, userId) {
    const petToUpdate = await getPetByIdForUser(petId, userId); // Esto valida la propiedad

    const allowedUpdates = {
        name: petData.name,
        type: petData.type,
        superpower: petData.superpower
    };
    Object.keys(allowedUpdates).forEach(key => allowedUpdates[key] === undefined && delete allowedUpdates[key]);

    return await petRepository.updatePet(petId, allowedUpdates);
}

async function deletePetForUser(petId, userId) {
    await getPetByIdForUser(petId, userId);
    await petRepository.deletePet(petId);
    return { message: "Mascota eliminada exitosamente" };
}


export default {
    getAllPetsForUser,
    getPetByIdForUser,
    createPetForUser,
    updatePetForUser,
    deletePetForUser
};