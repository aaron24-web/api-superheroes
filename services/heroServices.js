import heroRepository from '../repositories/heroRepository.js';

async function getAllHeroes() {
    return await heroRepository.getHeroes();
}

async function getHeroById(id) {
    const heroes = await heroRepository.getHeroes();
    return heroes.find(h => h.id === parseInt(id));
}

async function addHero(hero) {
    const heroes = await heroRepository.getHeroes();
    hero.id = heroes.length > 0 ? Math.max(...heroes.map(h => h.id)) + 1 : 1;
    heroes.push(hero);
    await heroRepository.saveHeroes(heroes);
    return hero;
}

async function updateHero(id, heroData) {
    const heroes = await heroRepository.getHeroes();
    const index = heroes.findIndex(h => h.id === parseInt(id));
    if (index === -1) throw new Error('Héroe no encontrado');
    
    heroes[index] = { ...heroes[index], ...heroData };
    await heroRepository.saveHeroes(heroes);
    return heroes[index];
}

async function deleteHero(id) {
    let heroes = await heroRepository.getHeroes();
    const initialLength = heroes.length;
    heroes = heroes.filter(h => h.id !== parseInt(id));
    if (heroes.length === initialLength) throw new Error('Héroe no encontrado');
    
    await heroRepository.saveHeroes(heroes);
    return { message: 'Héroe eliminado' };
}

// Las demás funciones de tu servicio...
async function findHeroesByCity(city) {
    const heroes = await heroRepository.getHeroes();
    return heroes.filter(h => h.city.toLowerCase() === city.toLowerCase());
}

async function faceVillain(heroId, villainName) {
    const hero = await getHeroById(heroId);
    if (!hero) throw new Error('Héroe no encontrado para enfrentar al villano');
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