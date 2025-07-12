// swagger.config.js

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Superhéroes',
      version: '2.0.0-alpha',
      description: 'API para gestionar Superhéroes, sus Mascotas y un minijuego interactivo.',
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
          responses: {
            '200': { description: 'Lista de superhéroes.' },
          },
        },
        post: {
          tags: ['Heroes'],
          summary: 'Crea un nuevo superhéroe',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Superhero' } }
            }
          },
          responses: {
            '201': { description: 'Superhéroe creado.' },
          },
        },
      },
      '/heroes/{id}': {
        get: {
            tags: ['Heroes'],
            summary: 'Obtiene un superhéroe por ID',
            parameters: [{in: 'path', name: 'id', required: true, schema: {type: 'integer'}}],
            responses: { '200': { description: 'Detalles del Héroe.' }}
        },
        put: {
          tags: ['Heroes'],
          summary: 'Actualiza un superhéroe por ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Superhero' } } }
          },
          responses: { '200': { description: 'Superhéroe actualizado.' } },
        },
        delete: {
          tags: ['Heroes'],
          summary: 'Elimina un superhéroe por ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Superhéroe eliminado.' } },
        },
      },
      '/heroes/city/{city}': {
        get: {
          tags: ['Heroes'],
          summary: 'Encuentra superhéroes por ciudad',
          parameters: [{ in: 'path', name: 'city', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Lista de héroes en la ciudad.' }}
        }
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
          summary: 'Crea una nueva mascota (con validación 1 a 1)',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pet' } } }
          },
          responses: { '201': { description: 'Mascota creada.' } }
        }
      },
      '/pets/{id}': {
        get: {
            tags: ['Pets'],
            summary: 'Obtiene una mascota por su ID con el nombre del dueño',
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
            responses: { '200': { description: 'Detalles de la mascota.' }, '404': { description: 'Mascota no encontrada.' } }
        },
        put: {
          tags: ['Pets'],
          summary: 'Actualiza una mascota por ID (con validación 1 a 1)',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Pet' } } } },
          responses: { '200': { description: 'Mascota actualizada.' } }
        },
        delete: {
          tags: ['Pets'],
          summary: 'Elimina una mascota por ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Mascota eliminada.' } }
        }
      },

      // --- Rutas de Juego ---
      '/game/select-pet/{id}': {
        post: {
          tags: ['Game'],
          summary: 'Selecciona una mascota para empezar a interactuar',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' }, description: 'ID de la mascota a seleccionar' }],
          responses: { '200': { description: 'Mascota seleccionada exitosamente.' }, '404': { description: 'Mascota no encontrada.' } }
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
          responses: { '200': { description: 'Estado actual de la mascota.' }, '400': { description: 'Ninguna mascota seleccionada.' } }
        }
      },
      '/game/feed': {
        post: {
          tags: ['Game'],
          summary: 'Alimenta a la mascota activa para subir 3 puntos de vida',
          responses: { '200': { description: 'Mascota alimentada.' }, '400': { description: 'Ninguna mascota seleccionada.' } }
        }
      },
      '/game/walk': {
        post: {
          tags: ['Game'],
          summary: 'Saca a pasear a la mascota activa para subir 2 puntos de vida',
          responses: { '200': { description: 'Mascota ha paseado.' }, '400': { description: 'Ninguna mascota seleccionada.' } }
        }
      }
    },
  },
  apis: [], // Dejamos 'apis' vacío porque definimos todo aquí
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;