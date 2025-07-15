import petRepository from '../repositories/petRepository.js';
import heroRepository from '../repositories/heroRepository.js';
import gameService from './gameService.js';

/**
 * Obtiene todas las mascotas que pertenecen a un usuario específico.
 * @param {number} userId - El ID del superhéroe (usuario).
 * @returns {Promise<Array>} Un arreglo con las mascotas del usuario.
 */
async function getAllPetsForUser(userId) {
    return await petRepository.findPetsByHeroId(userId);
}

/**
 * Obtiene una mascota específica por su ID, verificando que pertenezca al usuario.
 * @param {number} petId - El ID de la mascota a buscar.
 * @param {number} userId - El ID del superhéroe (usuario) que realiza la petición.
 * @returns {Promise<object>} El objeto de la mascota encontrada.
 */
async function getPetByIdForUser(petId, userId) {
    const pet = await petRepository.getPetById(petId);

    if (!pet || pet.heroId !== userId) {
        throw new Error('Mascota no encontrada o no pertenece a este usuario.');
    }
    return pet;
}

/**
 * Crea una nueva mascota y la asigna al usuario actual.
 * @param {object} petData - Los datos básicos de la mascota.
 * @param {number} userId - El ID del superhéroe (usuario) que será el dueño.
 * @returns {Promise<object>} La mascota creada.
 */
async function createPetForUser(petData, userId) {
    // 1. Validamos que el superhéroe (usuario) exista.
    const ownerExists = await heroRepository.getHeroById(userId);
    if (!ownerExists) {
        throw new Error(`El usuario con id '${userId}' no existe.`);
    }

    // --- LÓGICA ELIMINADA ---
    // Hemos quitado la validación que comprobaba si el héroe ya tenía una mascota.
    // Ahora puede tener tantas como quiera.

    // 2. Asignamos el dueño y la personalidad inicial.
    petData.heroId = userId;
    gameService.assignInitialPersonality(petData);

    // 3. Creamos la mascota en la base de datos.
    return await petRepository.addPet(petData);
}

/**
 * Actualiza los datos básicos de una mascota, verificando la propiedad.
 * @param {number} petId - El ID de la mascota a actualizar.
 * @param {object} petData - Los nuevos datos para la mascota.
 * @param {number} userId - El ID del usuario que realiza la acción.
 * @returns {Promise<object>} La mascota actualizada.
 */
async function updatePetForUser(petId, petData, userId) {
    await getPetByIdForUser(petId, userId); // Valida la propiedad

    const allowedUpdates = {
        name: petData.name,
        type: petData.type,
        superpower: petData.superpower
    };

    Object.keys(allowedUpdates).forEach(key => allowedUpdates[key] === undefined && delete allowedUpdates[key]);

    return await petRepository.updatePet(petId, allowedUpdates);
}

/**
 * Elimina una mascota, verificando la propiedad.
 * @param {number} petId - El ID de la mascota a eliminar.
 * @param {number} userId - El ID del usuario que realiza la acción.
 */
async function deletePetForUser(petId, userId) {
    await getPetByIdForUser(petId, userId); // Valida la propiedad
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