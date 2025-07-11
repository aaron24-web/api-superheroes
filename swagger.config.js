import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Superhéroes',
      version: '1.0.0',
      description: 'Documentación para la API de Superhéroes',
    },
    servers: [{ url: 'http://localhost:3000' }],
    // 1. Define las etiquetas globales para organizar los endpoints
    tags: [
      {
        name: 'Heroes',
        description: 'Operaciones sobre los superhéroes',
      },
    ],
    // 2. Define los esquemas o modelos reutilizables
    components: {
      schemas: {
        Superhero: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'El ID del héroe.' },
            name: { type: 'string', description: 'El nombre real del héroe.' },
            alias: { type: 'string', description: 'El alias del héroe.' },
            city: { type: 'string', description: 'La ciudad del héroe.' },
            team: { type: 'string', description: 'El equipo del héroe.' },
          },
          example: {
            id: 1,
            name: "Bruce Wayne",
            alias: "Batman",
            city: "Gotham",
            team: "Justice League"
          }
        },
      },
    },
    // 3. Define todas las rutas y sus operaciones
    paths: {
      // --- Ruta para GET y POST de /heroes ---
      '/heroes': {
        get: {
          tags: ['Heroes'],
          summary: 'Obtiene todos los superhéroes',
          responses: {
            '200': {
              description: 'Lista de superhéroes.',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Superhero' },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Heroes'],
          summary: 'Crea un nuevo superhéroe',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Superhero' },
              },
            },
          },
          responses: {
            '201': { description: 'Superhéroe creado.' },
          },
        },
      },
      // --- Ruta para PUT y DELETE de /heroes/{id} ---
      '/heroes/{id}': {
        put: {
          tags: ['Heroes'],
          summary: 'Actualiza un superhéroe por ID',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Superhero' },
              },
            },
          },
          responses: {
            '200': { description: 'Superhéroe actualizado.' },
          },
        },
        delete: {
          tags: ['Heroes'],
          summary: 'Elimina un superhéroe por ID',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'integer' },
            },
          ],
          responses: {
            '200': { description: 'Superhéroe eliminado.' },
          },
        },
      },
      // --- Ruta para encontrar héroes por ciudad ---
      '/heroes/city/{city}': {
        get: {
          tags: ['Heroes'],
          summary: 'Encuentra superhéroes por ciudad',
          parameters: [
            {
              in: 'path',
              name: 'city',
              required: true,
              schema: { type: 'string' },
              description: 'La ciudad donde opera el superhéroe.'
            }
          ],
          responses: {
            '200': {
              description: 'Una lista de superhéroes encontrados en esa ciudad.',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Superhero' }
                  }
                }
              }
            },
            '404': {
              description: 'No se encontraron héroes en esa ciudad.'
            }
          }
        }
      }
    },
  },
  // Dejamos 'apis' vacío porque no estamos escaneando comentarios en los archivos
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;