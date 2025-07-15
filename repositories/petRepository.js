import { connectDB } from '../config/db.js';

// Función para asegurar que los IDs se traten como números
const toInt = id => parseInt(id, 10);

/**
 * Obtiene la colección 'pets' de la base de datos.
 * @returns {Promise<Collection>} La colección de MongoDB.
 */
async function getCollection() {
    const db = await connectDB();
    return db.collection('pets');
}

/**
 * Obtiene todas las mascotas de la base de datos.
 * (Usado principalmente por el gameService para el estado global).
 * @returns {Promise<Array>} Un arreglo con todas las mascotas.
 */
async function getPets() {
    const collection = await getCollection();
    return await collection.find({}).toArray();
}

/**
 * Busca y devuelve una mascota específica por su ID.
 * @param {number} petId - El ID de la mascota.
 * @returns {Promise<object|null>} El objeto de la mascota o null si no se encuentra.
 */
async function getPetById(petId) {
    const collection = await getCollection();
    return await collection.findOne({ id: toInt(petId) });
}

/**
 * Busca y devuelve todas las mascotas que pertenecen a un superhéroe específico.
 * Esta es la función clave para el Enfoque 1.
 * @param {number} heroId - El ID del superhéroe (usuario).
 * @returns {Promise<Array>} Un arreglo con las mascotas del usuario.
 */
async function findPetsByHeroId(heroId) {
    const collection = await getCollection();
    return await collection.find({ heroId: toInt(heroId) }).toArray();
}

/**
 * Añade una nueva mascota a la base de datos.
 * @param {object} pet - El objeto de la mascota a crear.
 * @returns {Promise<object>} La mascota creada con su nuevo ID.
 */
async function addPet(pet) {
    const collection = await getCollection();
    // Lógica para autoincrementar el ID
    const lastPet = await collection.find().sort({ id: -1 }).limit(1).toArray();
    pet.id = lastPet.length > 0 ? lastPet[0].id + 1 : 1;
    
    await collection.insertOne(pet);
    return pet;
}

/**
 * Actualiza una mascota existente en la base de datos.
 * @param {number} petId - El ID de la mascota a actualizar.
 * @param {object} petData - Los campos a actualizar.
 * @returns {Promise<object>} La mascota actualizada.
 */
async function updatePet(petId, petData) {
    const collection = await getCollection();
    // Excluimos el _id que añade MongoDB para evitar conflictos
    const { _id, ...updateData } = petData;
    await collection.updateOne({ id: toInt(petId) }, { $set: updateData });
    return getPetById(petId);
}

/**
 * Elimina una mascota de la base de datos por su ID.
 * @param {number} petId - El ID de la mascota a eliminar.
 */
async function deletePet(petId) {
    const collection = await getCollection();
    await collection.deleteOne({ id: toInt(petId) });
}

/**
 * Guarda el estado completo de todas las mascotas.
 * (Esencial para el gameService).
 * @param {Array} pets - El arreglo completo de mascotas con su estado actualizado.
 */
async function savePets(pets) {
    const collection = await getCollection();
    // Borramos todo y re-insertamos para mantener la consistencia del estado del juego.
    await collection.deleteMany({});
    if (pets.length > 0) {
        const petsToInsert = pets.map(({ _id, ...pet }) => pet);
        await collection.insertMany(petsToInsert);
    }
}

// Exportamos todas las funciones que los servicios necesitarán.
export default {
    getPets,
    getPetById,
    findPetsByHeroId,
    addPet,
    updatePet,
    deletePet,
    savePets
};