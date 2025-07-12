import petRepository from '../repositories/petRepository.js';

// --- Estado del Juego y Constantes ---

// Esta variable es lo único que debe persistir en memoria entre llamadas.
// Guarda el ID de la mascota con la que estamos jugando.
let activePetId = null;

const PERSONALITIES = ['Cariñoso', 'Enojón', 'Deprimido'];
const SICKNESSES = {
    gripa: 1,
    'dolor de estomago': 1,
    sarna: 2,
};

// --- Funciones Auxiliares ---

// Actualiza el estado de la mascota ('excelente', 'muerto', etc.) basado en sus puntos de vida.
function updatePetStatus(pet) {
    if (pet.health <= 0) {
        pet.status = 'muerto';
        pet.health = 0; // Evita vida negativa
    } else if (pet.health <= 1) {
        pet.status = 'débil';
    } else if (pet.health <= 5) {
        pet.status = 'preocupante';
    } else {
        pet.status = 'excelente';
    }
}

// Guarda el estado completo y actualizado de una mascota en el archivo JSON.
async function savePetState(petToSave) {
    const allPets = await petRepository.getPets();
    const index = allPets.findIndex(p => p.id === petToSave.id);
    if (index !== -1) {
        allPets[index] = petToSave;
        await petRepository.savePets(allPets);
    }
}


// --- Lógica Principal del Servicio de Juego ---

/**
 * Función interna CLAVE: Obtiene la mascota activa y SIEMPRE lee los datos
 * más recientes desde el archivo para evitar problemas de estado obsoleto.
 */
async function getActivePet(checkIfDead = true) {
    if (!activePetId) {
        throw new Error('Debes seleccionar una mascota primero con /game/select-pet/{id}');
    }
    
    const allPets = await petRepository.getPets();
    const pet = allPets.find(p => p.id === activePetId);

    if (!pet) {
        activePetId = null; 
        throw new Error('La mascota activa ya no existe. Por favor, selecciona otra.');
    }
    if (checkIfDead && pet.health <= 0) {
        throw new Error(`${pet.name} está muerto y no puede realizar acciones.`);
    }
    return pet;
}

async function selectPet(petId) {
    const petExists = (await petRepository.getPets()).find(p => p.id === parseInt(petId));
    if (!petExists) {
        throw new Error('La mascota seleccionada no existe.');
    }
    activePetId = parseInt(petId);
    return petExists;
}

function logout() {
    if (!activePetId) {
        throw new Error('No hay ninguna mascota activa para cerrar sesión.');
    }
    activePetId = null;
    return { message: `Sesión cerrada.` };
}

async function getStatus() {
    const pet = await getActivePet(false); // Obtiene los datos frescos del archivo
    return {
        id: pet.id,
        nombre: pet.name,
        vida: pet.health,
        estado: pet.status,
        monedas: pet.coins,
        enfermedad: pet.illness || "Ninguna",
        personalidad: pet.personality,
        personalidad_original: pet.originalPersonality,
    };
}

async function feedPet() {
    const pet = await getActivePet();
    
    if (pet.health >= 10) {
        pet.illness = 'dolor de estomago';
        pet.health -= SICKNESSES['dolor de estomago'];
        updatePetStatus(pet);
        await savePetState(pet);
        throw new Error(`${pet.name} ya estaba lleno. Ahora tiene dolor de estómago y pierde 1 de vida.`);
    }

    pet.health = Math.min(10, pet.health + 3);
    pet.coins += 5;
    updatePetStatus(pet);
    await savePetState(pet);

    return { message: `Has alimentado a ${pet.name}.`, estado_actual: await getStatus() };
}

async function walkPet() {
    const pet = await getActivePet();
    
    if (pet.health >= 10) {
        pet.illness = 'dolor de estomago';
        pet.health -= SICKNESSES['dolor de estomago'];
        updatePetStatus(pet);
        await savePetState(pet);
        throw new Error(`${pet.name} ya tenía energía al máximo. Se fatigó y ahora tiene dolor de estómago.`);
    }

    pet.health = Math.min(10, pet.health + 2);
    pet.coins += 3;
    updatePetStatus(pet);
    await savePetState(pet);

    return { message: `${pet.name} ha salido a pasear.`, estado_actual: await getStatus() };
}

async function curePet() {
    const pet = await getActivePet(false); // false para poder curar si está muerto
    if (!pet.illness && pet.health > 0) {
        return { message: `${pet.name} no está enfermo.`, estado_actual: await getStatus() };
    }
    
    const illnessCured = pet.illness;
    pet.illness = null;
    if (pet.health <= 0) {
        pet.health = 1; // Revive con 1 de vida
    }
    updatePetStatus(pet);
    await savePetState(pet);
    return { message: `${pet.name} ha sido curado de ${illnessCured || 'mal estado general'}.`, estado_actual: await getStatus() };
}

async function revertPersonality() {
    const pet = await getActivePet();
    if (pet.personality === pet.originalPersonality) {
        return { message: `${pet.name} ya tiene su personalidad original.`, pet: await getStatus() };
    }
    pet.personality = pet.originalPersonality;
    await savePetState(pet);
    return { message: `La personalidad de ${pet.name} ha sido restaurada a ${pet.originalPersonality}.`, pet: await getStatus() };
}


// Se usa al crear una nueva mascota desde petService
function assignInitialPersonality(pet) {
    const randomPersonality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
    pet.personality = randomPersonality;
    pet.originalPersonality = randomPersonality;
}

// Exporta todas las funciones que necesita el controlador
export default {
    selectPet,
    logout,
    getStatus,
    feedPet,
    walkPet,
    curePet,
    revertPersonality,
    assignInitialPersonality
};