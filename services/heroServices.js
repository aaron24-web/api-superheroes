import heroRepository from '../repositories/heroRepository.js';
import petRepository from '../repositories/petRepository.js'; // Para borrar mascotas asociadas
import Hero from '../models/heroModel.js';

// Modificado para aceptar un userId y filtrar los héroes
async function getAllHeroes(userId) {
    return await heroRepository.getHeroes(userId);
}

async function getHeroById(id) {
    const hero = await heroRepository.getHeroById(id);
    if (!hero) {
        throw new Error('Héroe no encontrado');
    }
    // Opcional: Para mayor seguridad, se podría verificar que hero.userId coincida con el del usuario del token.
    return hero;
}

// Modificado para aceptar un userId y asociarlo al nuevo héroe
async function addHero(heroData, userId) {
    const newHero = new Hero(null, heroData.name, heroData.alias, heroData.city, heroData.team);
    return await heroRepository.addHero(newHero, userId);
}

async function updateHero(id, heroData) {
    await getHeroById(id); // Valida que el héroe exista primero
    return await heroRepository.updateHero(id, heroData);
}

async function deleteHero(id) {
    await getHeroById(id); // Valida que el héroe exista

    // Lógica para borrar las mascotas del héroe
    const pets = await petRepository.getPets();
    const remainingPets = pets.filter(p => p.heroId !== parseInt(id));
    await petRepository.savePets(remainingPets);
    
    // Borra al héroe
    await heroRepository.deleteHero(id);
    return { message: 'Héroe y sus mascotas asociadas han sido eliminados.' };
}

// Modificado para buscar solo dentro de los héroes del usuario
async function findHeroesByCity(city, userId) {
    const heroes = await heroRepository.getHeroes(userId); // Obtiene solo los héroes del usuario
    return heroes.filter(h => h.city.toLowerCase() === city.toLowerCase());
}

async function faceVillain(heroId, villainName) {
    const hero = await getHeroById(heroId);
    return `${hero.alias} está enfrentando a ${villainName}!`;
}

export default {
    getAllHeroes,
    getHeroById,
    addHero,
    updateHero,
    deleteHero,
    findHeroesByCity,
    faceVillain
};