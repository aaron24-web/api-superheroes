import petRepository from '../repositories/petRepository.js';

// --- Estado del Juego y Constantes ---
let activePetId = null; // Guarda el ID de la mascota con la que jugamos

const PERSONALITIES = ['Cariñoso', 'Enojón', 'Deprimido'];
const SICKNESSES = {
    gripa: 1,
    'dolor de estomago': 1,
    sarna: 2,
};
const HP_DECAY_RATE_PER_MINUTE = 1; // Puntos de vida perdidos por minuto
const PERSONALITY_DECAY_RATE_PER_30S = 1; // Puntos de vida perdidos cada 30s por personalidad incorrecta

// --- Funciones Auxiliares ---

/**
 * Actualiza el estado de la mascota ('excelente', 'muerto', etc.) basado en sus puntos de vida.
 * @param {object} pet La mascota a actualizar.
 */
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

/**
 * Guarda el estado completo y actualizado de una mascota en el archivo JSON.
 * @param {object} petToSave La mascota con su estado actualizado.
 */
async function savePetState(petToSave) {
    const allPets = await petRepository.getPets();
    const index = allPets.findIndex(p => p.id === petToSave.id);
    if (index !== -1) {
        allPets[index] = petToSave;
        await petRepository.savePets(allPets);
    }
}

/**
 * Calcula y aplica el decaimiento de vida pasivo basado en el tiempo transcurrido.
 * @param {object} pet La mascota a actualizar.
 * @returns {object} La mascota con su estado de vida actualizado.
 */
function applyTimeBasedDecay(pet) {
    const now = new Date();
    const lastUpdated = new Date(pet.lastUpdated);
    const secondsPassed = Math.floor((now - lastUpdated) / 1000);

    if (secondsPassed <= 0) return pet; // No ha pasado tiempo, no hay cambios

    let healthLost = 0;

    // 1. Decaimiento de vida natural (por minuto)
    healthLost += (secondsPassed / 60) * HP_DECAY_RATE_PER_MINUTE;

    // 2. Decaimiento por enfermedad (por minuto)
    if (pet.illness) {
        const sicknessDamage = SICKNESSES[pet.illness] || 0;
        healthLost += (secondsPassed / 60) * sicknessDamage;
    }

    // 3. Decaimiento por personalidad incorrecta (cada 30 segundos)
    if (pet.personality !== pet.originalPersonality) {
        healthLost += (secondsPassed / 30) * PERSONALITY_DECAY_RATE_PER_30S;
    }

    if (healthLost > 0) {
        pet.health -= Math.floor(healthLost);
    }

    // Actualizamos la fecha y el estado antes de devolver
    pet.lastUpdated = now.toISOString();
    updatePetStatus(pet);
    
    return pet;
}


// --- Lógica Principal del Servicio de Juego ---

/**
 * Función interna CLAVE: Obtiene la mascota activa y SIEMPRE aplica el decaimiento por tiempo
 * para trabajar con los datos más recientes.
 */
async function getActivePet(checkIfDead = true) {
    if (!activePetId) {
        throw new Error('Debes seleccionar una mascota primero con /game/select-pet/{id}');
    }

    let allPets = await petRepository.getPets();
    let pet = allPets.find(p => p.id === activePetId);

    if (!pet) {
        activePetId = null;
        throw new Error('La mascota activa ya no existe. Por favor, selecciona otra.');
    }

    // ¡Aplicamos el decaimiento justo después de leerla!
    pet = applyTimeBasedDecay(pet);

    if (checkIfDead && pet.health <= 0) {
        await savePetState(pet); // Guarda el estado de "muerto"
        throw new Error(`${pet.name} está muerto y no puede realizar acciones.`);
    }

    return pet;
}

async function selectPet(petId) {
    const pets = await petRepository.getPets();
    const petExists = pets.find(p => p.id === parseInt(petId));
    if (!petExists) throw new Error('La mascota seleccionada no existe.');

    activePetId = parseInt(petId);
    
    // Actualizamos su estado al seleccionarla
    const pet = applyTimeBasedDecay(petExists);
    await savePetState(pet);

    return pet;
}

function logout() {
    if (!activePetId) throw new Error('No hay ninguna mascota activa para cerrar sesión.');
    activePetId = null;
    return { message: `Sesión cerrada.` };
}

async function getStatus() {
    const pet = await getActivePet(false);
    await savePetState(pet); // Guardamos el estado actualizado por el tiempo
    return {
        id: pet.id,
        nombre: pet.name,
        vida: pet.health,
        estado: pet.status,
        monedas: pet.coins,
        enfermedad: pet.illness || "Ninguna",
        personalidad: pet.personality,
        personalidad_original: pet.originalPersonality,
        ultima_actualizacion: pet.lastUpdated,
    };
}

async function feedPet() {
    let pet = await getActivePet(); // Obtiene el estado ya actualizado con el decaimiento

    if (pet.health >= 10) {
        pet.illness = 'dolor de estomago';
        pet.health -= SICKNESSES['dolor de estomago'];
        updatePetStatus(pet);
        await savePetState(pet);
        throw new Error(`${pet.name} ya estaba lleno. Ahora tiene dolor de estómago y pierde 1 de vida.`);
    }

    pet.health = Math.min(10, pet.health + 3);
    pet.coins += 5;
    pet.lastUpdated = new Date().toISOString(); // Resetea el reloj
    updatePetStatus(pet);
    await savePetState(pet);

    return { message: `Has alimentado a ${pet.name}.`, estado_actual: await getStatus() };
}

async function walkPet() {
    let pet = await getActivePet();

    if (pet.health >= 10) {
        pet.illness = 'dolor de estomago';
        pet.health -= SICKNESSES['dolor de estomago'];
        updatePetStatus(pet);
        await savePetState(pet);
        throw new Error(`${pet.name} ya tenía energía al máximo. Se fatigó y ahora tiene dolor de estómago.`);
    }

    pet.health = Math.min(10, pet.health + 2);
    pet.coins += 3;
    pet.lastUpdated = new Date().toISOString();
    updatePetStatus(pet);
    await savePetState(pet);

    return { message: `${pet.name} ha salido a pasear.`, estado_actual: await getStatus() };
}

async function curePet() {
    let pet = await getActivePet(false);
    if (!pet.illness && pet.health > 0) {
        return { message: `${pet.name} no está enfermo.`, estado_actual: await getStatus() };
    }

    const illnessCured = pet.illness;
    pet.illness = null;
    if (pet.health <= 0) {
        pet.health = 1; // Revive con 1 de vida
    }
    pet.lastUpdated = new Date().toISOString();
    updatePetStatus(pet);
    await savePetState(pet);
    return { message: `${pet.name} ha sido curado de ${illnessCured || 'mal estado general'}.`, estado_actual: await getStatus() };
}

async function revertPersonality() {
    let pet = await getActivePet();
    if (pet.personality === pet.originalPersonality) {
        return { message: `${pet.name} ya tiene su personalidad original.`, pet: await getStatus() };
    }
    pet.personality = pet.originalPersonality;
    pet.lastUpdated = new Date().toISOString();
    await savePetState(pet);
    return { message: `La personalidad de ${pet.name} ha sido restaurada a ${pet.originalPersonality}.`, pet: await getStatus() };
}

// Se usa al crear una nueva mascota
function assignInitialPersonality(pet) {
    const randomPersonality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
    pet.personality = randomPersonality;
    pet.originalPersonality = randomPersonality;
    pet.lastUpdated = new Date().toISOString();
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