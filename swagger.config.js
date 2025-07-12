import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Superhéroes',
      version: '2.2.0',
      description: 'API para gestionar Superhéroes y sus Mascotas, con un minijuego interactivo que incluye decaimiento de vida pasivo por tiempo.',
    },
    servers: [{ url: 'http://localhost:3000' }],
    tags: [
      { name: 'Heroes', description: 'Operaciones CRUD de Superhéroes' },
      { name: 'Pets', description: 'Operaciones CRUD de Mascotas' },
      { name: 'Game', description: 'Endpoints para interactuar con la mascota activa' },
    ],
    components: {
      schemas: {
        Superhero: {
          type: 'object',
          properties: {
            id: { type: 'integer' }, name: { type: 'string' }, alias: { type: 'string' },
            city: { type: 'string' }, team: { type: 'string' },
          }
        },
        Pet: {
          type: 'object',
          description: "Modelo completo de una mascota, usado al crearla.",
          properties: {
            id: { type: 'integer', readOnly: true },
            name: { type: 'string' },
            type: { type: 'string' },
            superpower: { type: 'string' },
            heroId: { type: 'integer' },
            health: { type: 'integer', readOnly: true },
            status: { type: 'string', readOnly: true },
            coins: { type: 'integer', readOnly: true },
            illness: { type: 'string', nullable: true, readOnly: true },
            personality: { type: 'string', readOnly: true },
            originalPersonality: { type: 'string', readOnly: true },
            lastUpdated: { type: 'string', format: 'date-time', readOnly: true },
          },
          required: ["name", "type", "heroId"]
        },
        PetUpdate: {
          type: 'object',
          description: "Campos permitidos para actualizar una mascota.",
          properties: {
            name: { type: 'string' },
            type: { type: 'string' },
            superpower: { type: 'string' },
            heroId: { type: 'integer' }
          }
        },
        GameStatus: {
          type: 'object',
          description: "El estado actual de la mascota en el juego.",
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            vida: { type: 'integer' },
            estado: { type: 'string' },
            monedas: { type: 'integer' },
            enfermedad: { type: 'string', nullable: true },
            personalidad: { type: 'string' },
            personalidad_original: { type: 'string' },
            ultima_actualizacion: { type: 'string', format: 'date-time' }
          }
        }
      },
    },
    paths: {
      // --- Rutas de Héroes ---
      '/heroes': {
        get: { tags: ['Heroes'], summary: 'Obtiene todos los superhéroes', responses: { '200': { description: 'OK' } } },
        post: { tags: ['Heroes'], summary: 'Crea un nuevo superhéroe', requestBody: {required: true, content: {'application/json': {schema: {$ref: '#/components/schemas/Superhero'}}}}, responses: { '201': { description: 'Creado' } } },
      },
      '/heroes/{id}': {
        get: { tags: ['Heroes'], summary: 'Obtiene un superhéroe por ID', parameters: [{in: 'path', name: 'id', required: true, schema: {type: 'integer'}}], responses: {'200':{description: 'OK'}}},
        put: { tags: ['Heroes'], summary: 'Actualiza un superhéroe por ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], requestBody: {required: true, content: {'application/json': {schema: {$ref: '#/components/schemas/Superhero'}}}}, responses: { '200': { description: 'Actualizado' } } },
        delete: { tags: ['Heroes'], summary: 'Elimina un superhéroe por ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Eliminado' } } },
      },
      '/heroes/city/{city}': {
        get: { tags: ['Heroes'], summary: 'Encuentra superhéroes por ciudad', parameters: [{ in: 'path', name: 'city', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } }
      },

      // --- Rutas de Mascotas ---
      '/pets': {
        get: { tags: ['Pets'], summary: 'Obtiene todas las mascotas y sus dueños', responses: { '200': { description: 'OK' } } },
        post: { tags: ['Pets'], summary: 'Crea una nueva mascota (con validación 1 a 1)', requestBody: {required: true, content: {'application/json': {schema: {$ref: '#/components/schemas/Pet'}}}}, responses: { '201': { description: 'Creado' } } }
      },
      '/pets/{id}': {
        get: { tags: ['Pets'], summary: 'Obtiene una mascota por su ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
        put: {
          tags: ['Pets'],
          summary: 'Actualiza los datos básicos de una mascota (no los de juego)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PetUpdate' }
              }
            }
          },
          responses: { '200': { description: 'Mascota actualizada.' } }
        },
        delete: { tags: ['Pets'], summary: 'Elimina una mascota por ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Eliminado' } } }
      },

      // --- Rutas de Juego ---
      '/game/select-pet/{id}': {
        post: { tags: ['Game'], summary: 'Selecciona una mascota para empezar a interactuar', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Mascota seleccionada.' } } }
      },
      '/game/logout': {
        post: { tags: ['Game'], summary: 'Cierra la sesión con la mascota activa', responses: { '200': { description: 'Sesión cerrada.' } } }
      },
      '/game/status': {
        get: {
          tags: ['Game'],
          summary: 'Consulta el estado de la mascota activa (calcula pérdida de vida pasiva)',
          responses: { 
            '200': { 
              description: 'Estado actual de la mascota.',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/GameStatus' }}}
            }
          }
        }
      },
      '/game/feed': {
        post: { tags: ['Game'], summary: 'Alimenta a la mascota activa (+3 de vida)', responses: { '200': { description: 'Mascota alimentada.' } } }
      },
      '/game/walk': {
        post: { tags: ['Game'], summary: 'Saca a pasear a la mascota activa (+2 de vida)', responses: { '200': { description: 'Mascota ha paseado.' } } }
      },
      '/game/cure': {
        post: { tags: ['Game'], summary: 'Cura a la mascota activa si está enferma (revive si está muerta)', responses: { '200': { description: 'Mascota curada.' } } }
      },
      '/game/revert-personality': {
        post: { tags: ['Game'], summary: 'Restaura la personalidad original de la mascota activa', responses: { '200': { description: 'Personalidad restaurada.' } } }
      }
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;