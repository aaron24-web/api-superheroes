import fs from 'fs-extra';
import Hero from '../models/heroModel.js';

// Corregido para apuntar al archivo correcto
const filePath = './superheroes.json'; 

async function getHeroes() {
    try {
        const data = await fs.readJson(filePath);
        return data.map(hero => new Hero(
            hero.id, hero.name, hero.alias, hero.city, hero.team
        ));
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        console.error("Error al leer el archivo de héroes:", error);
        return [];
    }
}

async function saveHeroes(heroes) {
    try {
        await fs.writeJson(filePath, heroes, { spaces: 2 });
    } catch (error) {
        console.error("Error al guardar el archivo de héroes:", error);
    }
}

// Exportación correcta como un objeto de funciones
export default {
    getHeroes,
    saveHeroes
};