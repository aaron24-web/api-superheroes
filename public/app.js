document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN ---
    const API_BASE_URL = ''; // Usar '' para pruebas locales

    const HERO_AVATARS = [
        '/images/hero_avatars/hero1.jpg',
        '/images/hero_avatars/hero2.jpg',
        '/images/hero_avatars/hero3.jpg',
        '/images/hero_avatars/hero4.jpg',
        '/images/hero_avatars/hero5.jpg',
        '/images/hero_avatars/hero6.jpg',
        '/images/hero_avatars/hero7.jpg',
        '/images/hero_avatars/hero8.jpg'
    ];

    const PET_AVATARS = [
        '/images/avatars/1.jpg',
        '/images/avatars/2.jpg',
        '/images/avatars/3.jpg',
        '/images/avatars/4.jpg',
        '/images/avatars/5.jpg',
        '/images/avatars/6.jpg',
        '/images/avatars/7.jpg'
    ];

    const PET_ACTION_GIFS = {
        jump: '/images/pet_actions/catjump.gif',
        comer: '/images/pet_actions/catcomer.gif',
        salir: '/images/pet_actions/catsalir.gif',
        salud: '/images/pet_actions/catsalud.gif',
        perso: '/images/pet_actions/catperso.gif',
        debil: '/images/pet_actions/catdebil.gif',
        // Nuevas animaciones de accesorios y dinero
        lentes: '/images/pet_actions/catlentes.gif',
        sombrero: '/images/pet_actions/catsombrero.gif',
        capa: '/images/pet_actions/catcapa.gif',
        mono: '/images/pet_actions/catmono.gif',
        dinero: '/images/pet_actions/catdinero.gif'
    };

    // --- ELEMENTOS DEL DOM ---
    const screens = {
        hero: document.getElementById('hero-selection-screen'),
        pet: document.getElementById('pet-selection-screen'),
        game: document.getElementById('game-screen')
    };
    const body = document.body;
    const heroList = document.getElementById('hero-list');
    const petList = document.getElementById('pet-list');
    const petScreenTitle = document.getElementById('pet-screen-title');
    const gameScreenTitle = document.getElementById('game-screen-title');
    const statusDisplay = document.getElementById('status-display');
    const loadingOverlay = document.getElementById('loading-overlay');
    const alertContainer = document.getElementById('alert-container');
    const backgroundMusic = document.getElementById('background-music');
    const muteBtn = document.getElementById('mute-btn');
    const petGif = document.getElementById('pet-gif');
    const accessoryModal = document.getElementById('accessory-modal');
    const accessoryList = document.getElementById('accessory-list');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // --- LÓGICA DE MÚSICA Y ESTADO ---
    let musicStarted = false;
    let state = { selectedHeroId: null, selectedHeroAlias: '', selectedPetId: null, selectedPetName: '' };
    let lastKnownHealth = 10;
    let gameStatusInterval;
    let allAccessories = [];
    let currentPetInventory = [];

    // --- LÓGICA DE MÚSICA ---
    if (localStorage.getItem('musicMuted') === 'true') {
        backgroundMusic.muted = true;
        muteBtn.textContent = '🔇';
    } else {
        backgroundMusic.muted = false;
        muteBtn.textContent = '🔊';
    }
    function playMusic() {
        if (backgroundMusic && !musicStarted) {
            backgroundMusic.volume = 0.2;
            backgroundMusic.play().catch(e => console.error("La música necesita interacción del usuario para empezar."));
            musicStarted = true;
        }
    }
    document.body.addEventListener('click', playMusic, { once: true });
    muteBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        if (!musicStarted) playMusic();
        backgroundMusic.muted = !backgroundMusic.muted;
        muteBtn.textContent = backgroundMusic.muted ? '🔇' : '🔊';
        localStorage.setItem('musicMuted', backgroundMusic.muted);
    });

    // --- FUNCIONES AUXILIARES ---
    const showLoading = (show) => document.getElementById('loading-overlay').classList.toggle('hidden', !show);

    const showAlert = (message, type = 'success') => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${type}`;
        alertDiv.textContent = message;
        alertContainer.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 4000);
    };

    const apiRequest = async (endpoint, options = {}, showLoader = true) => {
        if (showLoader) {
            showLoading(true);
        }
        try {
            const headers = { 'Content-Type': 'application/json', ...options.headers };
            if (state.selectedHeroId) headers['x-user-id'] = state.selectedHeroId;
            const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
            const responseData = await response.json();
            if (!response.ok) throw new Error(responseData.error || 'Ocurrió un error desconocido.');
            return responseData;
        } catch (error) {
            // No mostramos alerta aquí para manejarla específicamente donde se llama
            throw error;
        } finally {
            if (showLoader) {
                showLoading(false);
            }
        }
    };
    
    const showScreen = (screenName) => {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        if (screens[screenName]) screens[screenName].classList.add('active');
        
        clearInterval(gameStatusInterval);
        if (screenName === 'game') {
            gameStatusInterval = setInterval(updateGameStatus, 5000);
        }
    };

    const renderList = (listElement, items, config) => {
        listElement.innerHTML = '';
        if (items.length === 0) {
            const li = document.createElement('li');
            li.textContent = config.emptyText;
            li.style.cursor = 'default';
            li.style.textAlign = 'center';
            listElement.appendChild(li);
            return;
        }
        items.forEach(item => {
            const li = document.createElement('li');
            const img = document.createElement('img');
            const avatarList = config.avatarType === 'hero' ? HERO_AVATARS : PET_AVATARS;
            img.src = avatarList[item.id % avatarList.length];
            li.appendChild(img);
            const text = document.createElement('span');
            text.textContent = config.display(item);
            li.appendChild(text);
            li.dataset.id = item.id;
            config.data.forEach(dataAttr => { li.dataset[dataAttr] = item[dataAttr]; });
            li.addEventListener('click', () => {
                listElement.querySelectorAll('li').forEach(el => el.classList.remove('selected'));
                li.classList.add('selected');
                config.onSelect(item);
            });
            listElement.appendChild(li);
        });
    };
    
    // --- LÓGICA DE ANIMACIÓN Y ACCESORIOS ---
    let gifTimeout;
    function playActionGif(actionName, duration = 2500) {
        clearTimeout(gifTimeout);
        if (PET_ACTION_GIFS[actionName]) {
            petGif.src = PET_ACTION_GIFS[actionName];
        }
        gifTimeout = setTimeout(() => {
            updateGameStatus(true);
        }, duration);
    }
    
    async function showAccessoryModal(mode) {
        const status = await apiRequest('/game/status', {}, false);
        currentPetInventory = status.inventario || [];
        
        if (allAccessories.length === 0) {
            allAccessories = await apiRequest('/accessories', {}, false);
        }

        accessoryList.innerHTML = '';
        const itemsToShow = mode === 'buy' ? allAccessories : allAccessories.filter(acc => currentPetInventory.includes(acc.id));

        if (itemsToShow.length === 0) {
            accessoryList.innerHTML = `<p style="text-align: center;">${mode === 'buy' ? 'No hay más accesorios en la tienda.' : 'No tienes accesorios para equipar.'}</p>`;
        }

        itemsToShow.forEach(acc => {
            const owned = currentPetInventory.includes(acc.id);
            const itemDiv = document.createElement('div');
            itemDiv.className = 'accessory-item';
            itemDiv.innerHTML = `
                <span>${acc.nombre} (${acc.costo} 🪙)</span>
                <button data-id="${acc.id}" class="${mode}-btn" ${owned && mode === 'buy' ? 'disabled' : ''}>
                    ${owned ? (mode === 'buy' ? 'Comprado' : 'Equipar') : 'Comprar'}
                </button>
            `;
            accessoryList.appendChild(itemDiv);
        });

        accessoryModal.classList.remove('hidden');
    }

    // --- LÓGICA DE JUEGO ---
    async function updateGameStatus(skipDamageCheck = false) {
        try {
            const status = await apiRequest('/game/status', {}, false);
            statusDisplay.innerHTML = `
                <p><strong>Vida:</strong> ${status.vida} / 10 | <strong>Estado:</strong> ${status.estado}</p>
                <p><strong>Monedas:</strong> ${status.monedas} 🪙</p>
                <p><strong>Enfermedad:</strong> ${status.enfermedad || 'Ninguna'}</p>
                <p><strong>Personalidad:</strong> ${status.personalidad} (Original: ${status.personalidad_original})</p>
                <p><strong>Equipado:</strong> 
                    Lentes: ${status.accesorios_equipados.lentes?.nombre || 'Ninguno'}, 
                    Ropa: ${status.accesorios_equipados.ropa?.nombre || 'Ninguno'}, 
                    Sombrero: ${status.accesorios_equipados.sombrero?.nombre || 'Ninguno'}
                </p>`;
            
            if (!skipDamageCheck && status.vida < lastKnownHealth) {
                playActionGif('debil');
            } else {
                const currentGifFile = petGif.src.split('/').pop();
                let targetGifFile;

                if (status.vida <= 4) {
                    targetGifFile = PET_ACTION_GIFS.debil.split('/').pop();
                    if (currentGifFile !== targetGifFile) {
                        petGif.src = PET_ACTION_GIFS.debil;
                    }
                } else {
                    targetGifFile = PET_ACTION_GIFS.jump.split('/').pop();
                    if (currentGifFile !== targetGifFile) {
                        petGif.src = PET_ACTION_GIFS.jump;
                    }
                }
            }
            lastKnownHealth = status.vida;
        } catch (error) {
            // No se muestra alerta para no molestar al usuario en un proceso de fondo
        }
    }

    async function performGameAction(action) {
        try {
            const result = await apiRequest(`/game/${action}`, { method: 'POST' });
            if (result && result.message) showAlert(result.message);
            return Promise.resolve();
        } catch (error) {
            // Pasamos el objeto de error para poder leer el mensaje
            return Promise.reject(error);
        }
    }

    async function loadHeroes() {
        try {
            const heroes = await apiRequest('/heroes');
            renderList(heroList, heroes, {
                display: hero => `${hero.alias} (${hero.name})`,
                data: ['alias', 'name', 'city', 'team'],
                emptyText: 'No hay héroes. ¡Crea el primero!',
                onSelect: hero => {
                    state.selectedHeroId = hero.id;
                    state.selectedHeroAlias = hero.alias;
                },
                avatarType: 'hero'
            });
        } catch (error) {
            console.error('Fallo al cargar héroes');
        }
    }
    
    async function loadPets() {
        petScreenTitle.textContent = `Mascotas de ${state.selectedHeroAlias}`;
        petList.innerHTML = '';
        state.selectedPetId = null;
        try {
            const pets = await apiRequest('/pets');
            renderList(petList, pets, {
                display: pet => `${pet.name} (${pet.type})`,
                data: ['name', 'type', 'superpower'],
                emptyText: 'Este héroe no tiene mascotas. ¡Crea una!',
                onSelect: pet => {
                    state.selectedPetId = pet.id;
                    state.selectedPetName = pet.name;
                },
                avatarType: 'pet'
            });
        } catch (error) {
            console.error('Fallo al cargar mascotas');
        }
    }

    // --- EVENT LISTENERS ---
    document.body.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.matches('.back-btn')) {
            clearInterval(gameStatusInterval);
            showScreen(target.dataset.target);
        }
        
        if (target.id === 'select-hero-btn') {
            if (!state.selectedHeroId) return showAlert("Por favor, selecciona un héroe.", 'error');
            showScreen('pet');
            loadPets();
        }

        if (target.id === 'select-pet-btn') {
            if (!state.selectedPetId) return showAlert("Por favor, selecciona una mascota.", 'error');
            try {
                await apiRequest(`/game/select-pet/${state.selectedPetId}`, { method: 'POST' });
                gameScreenTitle.textContent = `Jugando con ${state.selectedPetName}`;
                showScreen('game');
                updateGameStatus();
            } catch (error) {
                console.error("Fallo al seleccionar mascota para juego");
            }
        }
        
        if (target.id === 'logout-btn') {
            clearInterval(gameStatusInterval);
            try {
                await apiRequest('/game/logout', { method: 'POST' });
                showAlert("Has terminado de jugar.");
                showScreen('pet');
            } catch (error) {
                 console.error("Fallo al cerrar sesión del juego");
            }
        }

        if (target.id === 'create-hero-btn') {
            const name = prompt("Nombre real del héroe:");
            const alias = prompt("Alias del héroe:");
            if (!name || !alias) return;
            try {
                await apiRequest('/heroes', { method: 'POST', body: JSON.stringify({ name, alias, city: "N/A", team: "N/A" }) });
                showAlert('¡Héroe creado!');
                loadHeroes();
            } catch(e) {}
        }
        
        if (target.id === 'modify-hero-btn') {
            if (!state.selectedHeroId) return showAlert("Selecciona un héroe para modificar.", 'error');
            const selectedHeroLi = heroList.querySelector(`[data-id='${state.selectedHeroId}']`);
            const name = prompt("Nuevo nombre real del héroe:", selectedHeroLi.dataset.name);
            const alias = prompt("Nuevo alias del héroe:", selectedHeroLi.dataset.alias);
            const city = prompt("Nueva ciudad del héroe:", selectedHeroLi.dataset.city);
            const team = prompt("Nuevo equipo del héroe:", selectedHeroLi.dataset.team);
            if (!name || !alias) return;
            try {
                await apiRequest(`/heroes/${state.selectedHeroId}`, { method: 'PUT', body: JSON.stringify({ name, alias, city, team }) });
                showAlert('¡Héroe modificado!');
                loadHeroes();
            } catch(e) {}
        }

        if (target.id === 'delete-hero-btn') {
            if (!state.selectedHeroId) return showAlert("Selecciona un héroe para eliminar.", 'error');
            if (!confirm("¿Seguro? Se eliminarán el héroe y TODAS sus mascotas.")) return;
            try {
                await apiRequest(`/heroes/${state.selectedHeroId}`, { method: 'DELETE' });
                showAlert('Héroe eliminado.');
                state.selectedHeroId = null;
                loadHeroes();
            } catch(e) {}
        }
        
        if (target.id === 'create-pet-btn') {
            const name = prompt("Nombre de la mascota:");
            const type = prompt("Tipo de animal:");
            if (!name || !type) return;
            try {
                await apiRequest('/pets', { method: 'POST', body: JSON.stringify({ name, type, superpower: prompt("Superpoder:") || "Ninguno" }) });
                showAlert('¡Mascota creada!');
                loadPets();
            } catch(e) {}
        }
        
        if (target.id === 'modify-pet-btn') {
            if (!state.selectedPetId) return showAlert("Selecciona una mascota para modificar.", 'error');
            const selectedPetLi = petList.querySelector(`[data-id='${state.selectedPetId}']`);
            const name = prompt("Nuevo nombre de la mascota:", selectedPetLi.dataset.name);
            const type = prompt("Nuevo tipo de animal:", selectedPetLi.dataset.type);
            const superpower = prompt("Nuevo superpoder:", selectedPetLi.dataset.superpower);
            if (!name || !type) return;
            try {
                await apiRequest(`/pets/${state.selectedPetId}`, { method: 'PUT', body: JSON.stringify({ name, type, superpower }) });
                showAlert('¡Mascota modificada!');
                loadPets();
            } catch(e) {}
        }
        
        if (target.id === 'delete-pet-btn') {
            if (!state.selectedPetId) return showAlert("Selecciona una mascota para eliminar.", 'error');
            if (!confirm("¿Seguro que quieres eliminar esta mascota?")) return;
            try {
                await apiRequest(`/pets/${state.selectedPetId}`, { method: 'DELETE' });
                showAlert('Mascota eliminada.');
                loadPets();
            } catch(e) {}
        }

        if (target.id === 'feed-btn') {
            performGameAction('feed').then(() => playActionGif('comer')).catch(() => playActionGif('debil'));
        }
        if (target.id === 'walk-btn') {
            performGameAction('walk').then(() => playActionGif('salir')).catch(() => playActionGif('debil'));
        }
        if (target.id === 'cure-btn') {
            performGameAction('cure').then(() => playActionGif('salud')).catch(() => {});
        }
        if (target.id === 'revert-personality-btn') {
            performGameAction('revert-personality').then(() => playActionGif('perso')).catch(() => {});
        }
        
        if (target.id === 'buy-accessory-btn') {
            showAccessoryModal('buy');
        }
        if (target.id === 'equip-accessory-btn') {
            showAccessoryModal('equip');
        }
        if (target.id === 'close-modal-btn') {
            accessoryModal.classList.add('hidden');
        }

        if (target.matches('.buy-btn')) {
            const id = target.dataset.id;
            performGameAction(`buy/${id}`)
                .then(() => {
                    showAlert("¡Compra exitosa!");
                    updateGameStatus(true);
                })
                .catch((error) => {
                    if (error && error.message && error.message.includes('suficientes monedas')) {
                        playActionGif('dinero');
                    }
                    showAlert(error.message); // Muestra el mensaje de error de la API
                });
            accessoryModal.classList.add('hidden');
        }

        if (target.matches('.equip-btn')) {
            const id = parseInt(target.dataset.id);
            const accessory = allAccessories.find(acc => acc.id === id);
            let animationName = 'jump'; // Animación por defecto

            if (accessory) {
                const name = accessory.nombre.toLowerCase();
                if (name.includes('lentes')) animationName = 'lentes';
                else if (name.includes('sombrero')) animationName = 'sombrero';
                else if (name.includes('capa')) animationName = 'capa';
                else if (name.includes('moño')) animationName = 'mono';
            }

            performGameAction(`equip/${id}`)
                .then(() => playActionGif(animationName))
                .catch(() => {});
            accessoryModal.classList.add('hidden');
        }
    });

    // --- INICIALIZACIÓN ---
    loadHeroes();
    showScreen('hero');
});