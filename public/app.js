// --- CONFIGURACIÓN ---
// La URL de tu API. Si pruebas en local, usa 'http://localhost:3000'.
const API_BASE_URL = ''; // Sin URL base, hará las peticiones al mismo dominio

// --- ELEMENTOS DEL DOM ---
// Pantallas
const heroSelectionScreen = document.getElementById('hero-selection-screen');
const petSelectionScreen = document.getElementById('pet-selection-screen');
const gameScreen = document.getElementById('game-screen');

// Elementos de la pantalla de Héroes
const heroList = document.getElementById('hero-list');
const createHeroBtn = document.getElementById('create-hero-btn');
const deleteHeroBtn = document.getElementById('delete-hero-btn');
const selectHeroBtn = document.getElementById('select-hero-btn');

// Elementos de la pantalla de Mascotas
const petScreenTitle = document.getElementById('pet-screen-title');
const petList = document.getElementById('pet-list');
const createPetBtn = document.getElementById('create-pet-btn');
const deletePetBtn = document.getElementById('delete-pet-btn');
const selectPetBtn = document.getElementById('select-pet-btn');
const backToHeroesBtn = document.querySelector('#pet-selection-screen .back-btn');

// Elementos de la pantalla de Juego
const gameScreenTitle = document.getElementById('game-screen-title');
const statusDisplay = document.getElementById('status-display');
const feedBtn = document.getElementById('feed-btn');
const walkBtn = document.getElementById('walk-btn');
const cureBtn = document.getElementById('cure-btn');
const revertPersonalityBtn = document.getElementById('revert-personality-btn');
const buyAccessoryBtn = document.getElementById('buy-accessory-btn');
const equipAccessoryBtn = document.getElementById('equip-accessory-btn');
const logoutBtn = document.getElementById('logout-btn');
const backToPetsBtn = document.querySelector('#game-screen .back-btn');


// --- ESTADO DE LA APLICACIÓN ---
let selectedHeroId = null;
let selectedHeroAlias = '';
let selectedPetId = null;
let selectedPetName = '';


// --- FUNCIONES DE NAVEGACIÓN ---
function showScreen(screenToShow) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    screenToShow.classList.add('active');
}


// --- LÓGICA DE HÉROES ---
async function loadHeroes() {
    try {
        const response = await fetch(`${API_BASE_URL}/heroes`);
        if (!response.ok) throw new Error(`Error de red: ${response.statusText}`);
        
        const heroes = await response.json();
        heroList.innerHTML = ''; 

        heroes.forEach(hero => {
            const li = document.createElement('li');
            li.textContent = `${hero.alias} (${hero.name})`;
            li.dataset.id = hero.id;
            li.dataset.alias = hero.alias;

            li.addEventListener('click', () => {
                heroList.querySelectorAll('li').forEach(item => item.classList.remove('selected'));
                li.classList.add('selected');
                selectedHeroId = hero.id;
                selectedHeroAlias = hero.alias;
            });

            heroList.appendChild(li);
        });
    } catch (error) {
        console.error('Error al cargar los héroes:', error);
        alert('No se pudieron cargar los héroes desde la API. Revisa la consola y asegúrate de que la API esté corriendo.');
    }
}

createHeroBtn.addEventListener('click', async () => {
    const name = prompt("Nombre real del héroe:");
    const alias = prompt("Alias del héroe:");
    if (!name || !alias) return alert("El nombre y el alias son requeridos.");
    
    try {
        await fetch(`${API_BASE_URL}/heroes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, alias, city: "N/A", team: "N/A" }),
        });
        alert('¡Héroe creado!');
        loadHeroes();
    } catch (error) {
        alert('No se pudo crear el héroe.');
    }
});

deleteHeroBtn.addEventListener('click', async () => {
    if (!selectedHeroId) return alert("Por favor, selecciona un héroe para eliminar.");
    if (confirm("¿Seguro que quieres eliminar a este héroe y sus mascotas?")) {
        try {
            await fetch(`${API_BASE_URL}/heroes/${selectedHeroId}`, { method: 'DELETE' });
            alert('Héroe eliminado.');
            selectedHeroId = null;
            loadHeroes();
        } catch (error) {
            alert('No se pudo eliminar el héroe.');
        }
    }
});


// --- LÓGICA DE MASCOTAS ---
async function loadPetsForHero(heroId) {
    petScreenTitle.textContent = `Mascotas de ${selectedHeroAlias}`;
    petList.innerHTML = '<li>Cargando...</li>';
    selectedPetId = null;
    try {
        const response = await fetch(`${API_BASE_URL}/pets`, { headers: { 'x-user-id': heroId } });
        if (!response.ok) throw new Error('Error en la API');
        const pets = await response.json();
        petList.innerHTML = '';
        if (pets.length === 0) {
            petList.innerHTML = '<li>Este héroe no tiene mascotas. ¡Crea una!</li>';
        } else {
            pets.forEach(pet => {
                const li = document.createElement('li');
                li.textContent = `${pet.name} (${pet.type})`;
                li.dataset.id = pet.id;
                li.dataset.name = pet.name;
                li.addEventListener('click', () => {
                    petList.querySelectorAll('li').forEach(item => item.classList.remove('selected'));
                    li.classList.add('selected');
                    selectedPetId = pet.id;
                    selectedPetName = pet.name;
                });
                petList.appendChild(li);
            });
        }
    } catch (error) {
        petList.innerHTML = '<li>Error al cargar las mascotas.</li>';
    }
}

createPetBtn.addEventListener('click', async () => {
    const name = prompt("Nombre de la mascota:");
    const type = prompt("Tipo de animal:");
    if (!name || !type) return alert("El nombre y el tipo son requeridos.");
    try {
        const response = await fetch(`${API_BASE_URL}/pets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': selectedHeroId },
            body: JSON.stringify({ name, type, superpower: prompt("Superpoder:") }),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error);
        }
        alert('¡Mascota creada!');
        loadPetsForHero(selectedHeroId);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

deletePetBtn.addEventListener('click', async () => {
    if (!selectedPetId) return alert("Por favor, selecciona una mascota para eliminar.");
    if (confirm("¿Seguro que quieres eliminar esta mascota?")) {
        try {
            await fetch(`${API_BASE_URL}/pets/${selectedPetId}`, {
                method: 'DELETE',
                headers: { 'x-user-id': selectedHeroId }
            });
            alert('Mascota eliminada.');
            loadPetsForHero(selectedHeroId);
        } catch (error) {
            alert('No se pudo eliminar la mascota.');
        }
    }
});


// --- LÓGICA DE JUEGO ---
async function selectPetForGame(petId) {
    try {
        const response = await fetch(`${API_BASE_URL}/game/select-pet/${petId}`, {
            method: 'POST',
            headers: { 'x-user-id': selectedHeroId }
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error);
        }
        gameScreenTitle.textContent = `Jugando con ${selectedPetName}`;
        await updateGameStatus();
        showScreen(gameScreen);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function updateGameStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/game/status`, { headers: { 'x-user-id': selectedHeroId } });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error);
        }
        const status = await response.json();
        statusDisplay.innerHTML = `
            <p><strong>Vida:</strong> ${status.vida} / 10 | <strong>Estado:</strong> ${status.estado}</p>
            <p><strong>Monedas:</strong> ${status.monedas} 🪙</p>
            <p><strong>Enfermedad:</strong> ${status.enfermedad}</p>
            <p><strong>Personalidad:</strong> ${status.personalidad} (Original: ${status.personalidad_original})</p>
            <p><strong>Equipado:</strong> 
                Lentes: ${status.accesorios_equipados.lentes?.nombre || 'Ninguno'}, 
                Ropa: ${status.accesorios_equipados.ropa?.nombre || 'Ninguno'}, 
                Sombrero: ${status.accesorios_equipados.sombrero?.nombre || 'Ninguno'}
            </p>
        `;
    } catch (error) {
        statusDisplay.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
}

async function performGameAction(action) {
    try {
        const response = await fetch(`${API_BASE_URL}/game/${action}`, {
            method: 'POST',
            headers: { 'x-user-id': selectedHeroId }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        
        if (result.message) alert(result.message);
        await updateGameStatus();
    } catch (error) {
        alert(`Error: ${error.message}`);
        await updateGameStatus();
    }
}


// --- EVENT LISTENERS (BOTONES) ---
selectHeroBtn.addEventListener('click', () => {
    if (!selectedHeroId) return alert("Por favor, selecciona un héroe.");
    loadPetsForHero(selectedHeroId);
    showScreen(petSelectionScreen);
});

backToHeroesBtn.addEventListener('click', () => showScreen(heroSelectionScreen));

selectPetBtn.addEventListener('click', () => {
    if (!selectedPetId) return alert("Por favor, selecciona una mascota para jugar.");
    selectPetForGame(selectedPetId);
});

feedBtn.addEventListener('click', () => performGameAction('feed'));
walkBtn.addEventListener('click', () => performGameAction('walk'));
cureBtn.addEventListener('click', () => performGameAction('cure'));
revertPersonalityBtn.addEventListener('click', () => performGameAction('revert-personality'));

buyAccessoryBtn.addEventListener('click', () => {
    const accessoryId = prompt("Ingresa el ID del accesorio que quieres comprar (ej. 1, 2, 3):");
    if (accessoryId) {
        performGameAction(`buy/${accessoryId}`);
    }
});

equipAccessoryBtn.addEventListener('click', () => {
    const accessoryId = prompt("Ingresa el ID del accesorio que quieres equipar:");
    if (accessoryId) {
        performGameAction(`equip/${accessoryId}`);
    }
});

backToPetsBtn.addEventListener('click', () => {
    loadPetsForHero(selectedHeroId);
    showScreen(petSelectionScreen);
});

logoutBtn.addEventListener('click', async () => {
    try {
        await fetch(`${API_BASE_URL}/game/logout`, {
            method: 'POST',
            headers: { 'x-user-id': selectedHeroId }
        });
        alert("Has terminado de jugar.");
        loadPetsForHero(selectedHeroId);
        showScreen(petSelectionScreen);
    } catch (error) {
        alert('No se pudo cerrar la sesión del juego.');
    }
});


// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    loadHeroes();
    showScreen(heroSelectionScreen);
});