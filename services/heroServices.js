import heroRepository from '../repositories/heroRepository.js';
import petRepository from '../repositories/petRepository.js'; // Para borrar mascotas asociadas
import Hero from '../models/heroModel.js';

async function getAllHeroes() {
    return await heroRepository.getHeroes();
}

async function getHeroById(id) {
    const hero = await heroRepository.getHeroById(id);
    if (!hero) {
        throw new Error('Héroe no encontrado');
    }
    return hero;
}

// --- FUNCIÓN CORREGIDA ---
// Ahora llama directamente a la función 'addHero' del repositorio.
async function addHero(heroData) {
    // Usamos el modelo para asegurar la estructura correcta
    const newHero = new Hero(null, heroData.name, heroData.alias, heroData.city, heroData.team);
    return await heroRepository.addHero(newHero);
}

// --- FUNCIÓN CORREGIDA ---
// Ahora llama directamente a la función 'updateHero' del repositorio.
async function updateHero(id, heroData) {
    await getHeroById(id); // Valida que el héroe exista primero
    return await heroRepository.updateHero(id, heroData);
}

// --- FUNCIÓN CORREGIDA ---
// Ahora llama directamente a la función 'deleteHero' del repositorio.
async function deleteHero(id) {
    await getHeroById(id); // Valida que el héroe exista

    // Lógica adicional para borrar las mascotas del héroe y mantener la BD limpia
    const pets = await petRepository.getPets();
    const remainingPets = pets.filter(p => p.heroId !== parseInt(id));
    await petRepository.savePets(remainingPets); // Esta función sí existe y es necesaria
    
    // Ahora sí, borramos al héroe
    await heroRepository.deleteHero(id);
    return { message: 'Héroe y sus mascotas asociadas han sido eliminados.' };
}

async function findHeroesByCity(city) {
    const heroes = await heroRepository.getHeroes();
    return heroes.filter(h => h.city.toLowerCase() === city.toLowerCase());
}

async function faceVillain(heroId, villainName) {
    const hero = await getHeroById(heroId);
    return `${hero.alias} está enfrentando a ${villainName}!`;
}

// Exportamos todas las funciones que usan los controladores
export default {
    getAllHeroes,
    getHeroById,
    addHero,
    updateHero,
    deleteHero,
    findHeroesByCity,
    faceVillain
};