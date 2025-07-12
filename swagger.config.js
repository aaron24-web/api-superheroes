import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Superhéroes',
      version: '2.0.0',
      description: 'API para gestionar Superhéroes, sus Mascotas y un minijuego interactivo con sistema de vida, enfermedades y personalidad.',
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
          properties: {
            id: { type: 'integer' }, name: { type: 'string' }, type: { type: 'string' },
            superpower: { type: 'string' }, heroId: { type: 'integer' },
            health: { type: 'integer' }, status: { type: 'string' }, coins: { type: 'integer' },
            illness: { type: 'string', nullable: true },
            personality: { type: 'string' }, originalPersonality: { type: 'string' },
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
          }
        }
      },
    },
    paths: {
      // --- Rutas de Héroes ---
      '/heroes': {
        get: {
          tags: ['Heroes'],
          summary: 'Obtiene todos los superhéroes',
          responses: { '200': { description: 'OK' } },
        },
        post: {
          tags: ['Heroes'],
          summary: 'Crea un nuevo superhéroe',
          // --- ESTA ES LA SECCIÓN AÑADIDA ---
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Superhero' }
              }
            }
          },
          responses: { '201': { description: 'Superhéroe creado.' } },
        },
      },
      '/heroes/{id}': {
        get: {
          tags: ['Heroes'], summary: 'Obtiene un superhéroe por ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'OK' } }
        },
        put: {
          tags: ['Heroes'],
          summary: 'Actualiza un superhéroe por ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          // --- ESTA ES LA SECCIÓN AÑADIDA ---
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Superhero' }
              }
            }
          },
          responses: { '200': { description: 'Superhéroe actualizado.' } },
        },
        delete: {
          tags: ['Heroes'], summary: 'Elimina un superhéroe por ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Superhéroe eliminado.' } },
        },
      },
      '/heroes/city/{city}': {
        get: { tags: ['Heroes'], summary: 'Encuentra superhéroes por ciudad', parameters: [{ in: 'path', name: 'city', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } }
      },

      // --- Rutas de Mascotas ---
      '/pets': {
        get: {
          tags: ['Pets'],
          summary: 'Obtiene todas las mascotas y sus dueños',
          responses: { '200': { description: 'Lista de mascotas.' } }
        },
        post: {
          tags: ['Pets'],
          summary: 'Crea una nueva mascota',
          // --- ESTA ES LA SECCIÓN CORREGIDA ---
          requestBody: {
            required: true,
            description: "Datos de la nueva mascota a crear.",
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Pet'
                }
              }
            }
          },
          responses: { '201': { description: 'Mascota creada.' } }
        }
      },
      '/pets/{id}': {
        get: { tags: ['Pets'], summary: 'Obtiene una mascota por su ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
        put: {
          tags: ['Pets'],
          summary: 'Actualiza una mascota por ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          // --- ESTA ES LA SECCIÓN CORREGIDA ---
          requestBody: {
            required: true,
            description: "Datos de la mascota a actualizar.",
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Pet'
                }
              }
            }
          },
          responses: { '200': { description: 'Mascota actualizada.' } }
        },
        delete: { tags: ['Pets'], summary: 'Elimina una mascota por ID', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Eliminado' } } }
      },

      // --- Rutas de Juego ---
      '/game/select-pet/{id}': {
        post: {
          tags: ['Game'],
          summary: 'Selecciona una mascota para empezar a interactuar',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' }, description: 'ID de la mascota a seleccionar' }],
          responses: { '200': { description: 'Mascota seleccionada.' }, '404': { description: 'Mascota no encontrada.' } }
        }
      },
      '/game/logout': {
        post: {
          tags: ['Game'],
          summary: 'Cierra la sesión con la mascota activa',
          responses: { '200': { description: 'Sesión cerrada.' }, '400': { description: 'No hay mascota seleccionada.' } }
        }
      },
      '/game/status': {
        get: {
          tags: ['Game'],
          summary: 'Consulta el estado de la mascota activa',
          responses: { 
            '200': { 
              description: 'Estado actual de la mascota.',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/GameStatus' }}}
            }, 
            '400': { description: 'Ninguna mascota seleccionada.' } 
          }
        }
      },
      '/game/feed': {
        post: {
          tags: ['Game'],
          summary: 'Alimenta a la mascota activa (puede causar eventos aleatorios)',
          responses: { '200': { description: 'Mascota alimentada.' }, '400': { description: 'Error o ninguna mascota seleccionada.' } }
        }
      },
      '/game/walk': {
        post: {
          tags: ['Game'],
          summary: 'Saca a pasear a la mascota activa (puede causar eventos aleatorios)',
          responses: { '200': { description: 'Mascota ha paseado.' }, '400': { description: 'Error o ninguna mascota seleccionada.' } }
        }
      },
      '/game/cure': {
        post: {
          tags: ['Game'],
          summary: 'Cura a la mascota activa si está enferma',
          responses: { '200': { description: 'Mascota curada.' }, '400': { description: 'Error o ninguna mascota seleccionada.' } }
        }
      },
      '/game/revert-personality': {
        post: {
          tags: ['Game'],
          summary: 'Restaura la personalidad original de la mascota activa',
          responses: { '200': { description: 'Personalidad restaurada.' }, '400': { description: 'Error o ninguna mascota seleccionada.' } }
        }
      }
    },
  },
  apis: [], // Dejamos 'apis' vacío porque definimos todo aquí
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;