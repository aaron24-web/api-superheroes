document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN ---
    const API_BASE_URL = 'https://api-superheroes-o1b1.onrender.com';

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

    // --- ESTADO DE LA APLICACIÓN ---
    let state = {
        selectedHeroId: null,
        selectedHeroAlias: '',
        selectedPetId: null,
        selectedPetName: ''
    };

    // --- FUNCIONES AUXILIARES ---
    const showLoading = (show) => loadingOverlay.classList.toggle('hidden', !show);

    const showAlert = (message, type = 'success') => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${type}`;
        alertDiv.textContent = message;
        alertContainer.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 4000);
    };

    const apiRequest = async (endpoint, options = {}) => {
        showLoading(true);
        try {
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers,
            };
            if (state.selectedHeroId) {
                headers['x-user-id'] = state.selectedHeroId;
            }
            
            const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
            
            const responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.error || 'Ocurrió un error desconocido.');
            }
            return responseData;
        } catch (error) {
            showAlert(error.message, 'error');
            throw error;
        } finally {
            showLoading(false);
        }
    };

    const showScreen = (screenName) => {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[screenName].classList.add('active');
        
        // --- NUEVO: Añade o quita la clase del body para el fondo ---
        if (screenName === 'game') {
            body.classList.add('game-active');
        } else {
            body.classList.remove('game-active');
        }
    };

    // --- MODIFICADO: Acepta un 'avatarType' para generar la imagen correcta ---
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
            
            // --- Lógica de avatares ---
            if (config.avatarType === 'hero') {
                // Para héroes, usamos avatares de personas
                img.src = `https://i.pravatar.cc/40?u=${item.id}`;
            } else {
                // Para mascotas, usamos imágenes de animales al azar
                // El "?random=${item.id}" asegura que la imagen sea diferente para cada mascota pero consistente
                img.src = `https://loremflickr.com/40/40/animal,pet?random=${item.id}`;
            }
            
            li.appendChild(img);
            
            const text = document.createElement('span');
            text.textContent = config.display(item);
            li.appendChild(text)

            li.dataset.id = item.id;
            config.data.forEach(dataAttr => {
                li.dataset[dataAttr] = item[dataAttr];
            });

            li.addEventListener('click', () => {
                listElement.querySelectorAll('li').forEach(el => el.classList.remove('selected'));
                li.classList.add('selected');
                config.onSelect(item);
            });
            listElement.appendChild(li);
        });
    };

    // --- LÓGICA DE HÉROES ---
    async function loadHeroes() {
        try {
            const heroes = await apiRequest('/heroes');
            // --- MODIFICADO: Se añade avatarType: 'hero' ---
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

    // --- LÓGICA DE MASCOTAS ---
    async function loadPets() {
        petScreenTitle.textContent = `Mascotas de ${state.selectedHeroAlias}`;
        petList.innerHTML = '';
        state.selectedPetId = null;
        try {
            const pets = await apiRequest('/pets');
            // --- MODIFICADO: Se añade avatarType: 'pet' ---
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

    // --- LÓGICA DE JUEGO ---
    async function updateGameStatus() {
        try {
            const status = await apiRequest('/game/status');
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
        } catch (error) {
            statusDisplay.innerHTML = `<p style="color: red;">No se pudo cargar el estado. Puede que necesites seleccionar una mascota de nuevo.</p>`;
        }
    }

    async function performGameAction(action) {
        try {
            const result = await apiRequest(`/game/${action}`, { method: 'POST' });
            if (result.message) showAlert(result.message);
            updateGameStatus();
        } catch (error) {
            console.error(`Fallo en la acción: ${action}`);
            updateGameStatus(); 
        }
    }
    
    // --- EVENT LISTENERS ---
    document.body.addEventListener('click', async (e) => {
        const target = e.target;
        
        // --- Navegación ---
        if (target.matches('.back-btn')) {
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
            try {
                await apiRequest('/game/logout', { method: 'POST' });
                showAlert("Has terminado de jugar.");
                showScreen('pet');
            } catch (error) {
                 console.error("Fallo al cerrar sesión del juego");
            }
        }

        // --- Acciones de Creación/Eliminación/Modificación ---
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

        // --- Acciones de Juego ---
        if (target.id === 'feed-btn') performGameAction('feed');
        if (target.id === 'walk-btn') performGameAction('walk');
        if (target.id === 'cure-btn') performGameAction('cure');
        if (target.id === 'revert-personality-btn') performGameAction('revert-personality');
        
        if (target.id === 'buy-accessory-btn') {
            const id = prompt("ID del accesorio a comprar:");
            if (id) performGameAction(`buy/${id}`);
        }
        
        if (target.id === 'equip-accessory-btn') {
            const id = prompt("ID del accesorio a equipar:");
            if (id) performGameAction(`equip/${id}`);
        }
    });

    // --- INICIALIZACIÓN ---
    loadHeroes();
    showScreen('hero');
});