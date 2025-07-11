import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Superhéroes',
      version: '1.1.0',
      description: 'API para gestionar Superhéroes y sus Mascotas, con validación de asignación 1 a 1.',
    },
    servers: [{ url: 'http://localhost:3000' }],
    tags: [
      { name: 'Heroes', description: 'Operaciones sobre los superhéroes' },
      { name: 'Pets', description: 'Operaciones sobre las mascotas' },
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
        },
        PetWithOwner: { // <-- Nuevo esquema para la respuesta detallada
          type: 'object',
          properties: {
            id: { type: 'integer' }, name: { type: 'string' }, type: { type: 'string' },
            superpower: { type: 'string' }, heroId: { type: 'integer' },
            owner: { 
                type: 'object',
                properties: {
                    id: { type: 'integer' }, name: { type: 'string' }, alias: { type: 'string' }
                },
                description: "Objeto del superhéroe dueño. Puede ser null."
            }
          }
        }
      },
    },
    paths: {
      '/heroes': {
        get: { tags: ['Heroes'], summary: 'Obtiene todos los superhéroes', responses: { '200': { description: 'Lista de superhéroes.' } } },
        post: { tags: ['Heroes'], summary: 'Crea un nuevo superhéroe', responses: { '201': { description: 'Superhéroe creado.' } } },
      },
      '/heroes/{id}': {
        put: { tags: ['Heroes'], summary: 'Actualiza un superhéroe por ID', parameters: [{in: 'path', name: 'id', required: true, schema: {type: 'integer'}}], responses: {'200': {description: 'Superhéroe actualizado.'}}},
        delete: { tags: ['Heroes'], summary: 'Elimina un superhéroe por ID', parameters: [{in: 'path', name: 'id', required: true, schema: {type: 'integer'}}], responses: {'200': {description: 'Superhéroe eliminado.'}}}
      },
      '/heroes/city/{city}': {
        get: { tags: ['Heroes'], summary: 'Encuentra superhéroes por ciudad', parameters: [{in: 'path', name: 'city', required: true, schema: {type: 'string'}}], responses: {'200': {description: 'Lista de héroes en la ciudad.'}}}
      },
      '/pets': {
        get: { tags: ['Pets'], summary: 'Obtiene todas las mascotas y sus dueños', responses: { '200': { description: 'Lista de mascotas.' } } },
        post: { tags: ['Pets'], summary: 'Crea una nueva mascota (con validación 1 a 1)', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Pet' } } } }, responses: { '201': { description: 'Mascota creada.' } } }
      },
      '/pets/{id}': {
        // --- NUEVA DEFINICIÓN PARA EL GET POR ID ---
        get: {
            tags: ['Pets'],
            summary: 'Obtiene una mascota por su ID con detalles del dueño',
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
            responses: { 
                '200': { 
                    description: 'Detalles de la mascota.',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/PetWithOwner' } } }
                },
                '404': { description: 'Mascota no encontrada.' }
            }
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
      }
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;