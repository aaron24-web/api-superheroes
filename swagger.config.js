import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Superhéroes (Multi-Usuario)',
      version: '4.0.0',
      description: 'API final con sistema de usuarios basado en Superhéroes. Las operaciones de Mascotas y Juego requieren el header x-user-id.',
    },
    servers: [
      {
        url: 'https://api-superheroes-o1b1.onrender.com', // ¡Tu URL pública de Render!
        description: 'Servidor de Producción'
      },
      {
        url: 'http://localhost:3000', // Mantenemos la local para pruebas
        description: 'Servidor de Desarrollo Local'
      }
    ],
    // --- NUEVO: Definimos el método de "autenticación" ---
    components: {
      securitySchemes: {
        userIdHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'x-user-id',
          description: 'ID del Superhéroe (usuario) que realiza la petición.'
        }
      },
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
          description: "Usado para crear una mascota. El heroId se toma del header.",
          properties: {
            name: { type: 'string' },
            type: { type: 'string' },
            superpower: { type: 'string' },
          },
          required: ["name", "type"]
        },
        GameStatus: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            vida: { type: 'integer' },
            estado: { type: 'string' },
            monedas: { type: 'integer' },
            enfermedad: { type: 'string', nullable: true },
            personalidad: { type: 'string' },
            ultima_actualizacion: { type: 'string', format: 'date-time' },
            inventario: { type: 'array', items: { type: 'integer' } },
            accesorios_equipados: { type: 'object' }
          }
        }
      }
    },
    // --- NUEVO: Aplicamos la seguridad de forma global por defecto ---
    security: [
      {
        userIdHeader: []
      }
    ],
    paths: {
      // --- Rutas de Héroes (Públicas) ---
      '/heroes': {
        get: {
          tags: ['Heroes'],
          summary: 'Obtiene todos los superhéroes (usuarios)',
          security: [], // Hacemos esta ruta explícitamente pública
          responses: { '200': { description: 'OK' } }
        },
        post: {
          tags: ['Heroes'],
          summary: 'Crea un nuevo superhéroe (usuario)',
          security: [], // Hacemos esta ruta explícitamente pública
          requestBody: {required: true, content: {'application/json': {schema: {$ref: '#/components/schemas/Superhero'}}}},
          responses: { '201': { description: 'Creado' } }
        },
      },
      '/heroes/{id}': {
        get: {
          tags: ['Heroes'], summary: 'Obtiene un superhéroe por ID',
          security: [],
          parameters: [{in: 'path', name: 'id', required: true, schema: {type: 'integer'}}],
          responses: {'200':{description: 'OK'}}
        },
        delete: {
          tags: ['Heroes'],
          summary: 'Elimina un superhéroe por ID',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Superhéroe eliminado.' } },
        },
      },
      
      // --- Rutas de Mascotas (Protegidas) ---
      '/pets': {
        get: {
          tags: ['Pets'],
          summary: 'Obtiene las mascotas del usuario actual',
          responses: { '200': { description: 'OK' }, '401': {description: 'No autorizado (falta x-user-id)'} }
        },
        post: {
          tags: ['Pets'],
          summary: 'Crea una nueva mascota para el usuario actual',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Pet' } } }
          },
          responses: { '201': { description: 'Creado' }, '401': {description: 'No autorizado'} }
        }
      },
      '/pets/{id}': {
        get: {
            tags: ['Pets'], summary: 'Obtiene una mascota específica del usuario actual',
            parameters: [{in: 'path', name: 'id', required: true, schema: {type: 'integer'}}],
            responses: {'200': {description: 'OK'}, '401': {description: 'No autorizado'}, '404': {description: 'No encontrado'}}
        },
        put: {
            tags: ['Pets'], summary: 'Actualiza una mascota del usuario actual',
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
            requestBody: {required: true, content: {'application/json': {schema: {$ref: '#/components/schemas/Pet'}}}},
            responses: { '200': { description: 'Actualizado' } }
        },
        delete: {
            tags: ['Pets'], summary: 'Elimina una mascota del usuario actual',
            parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
            responses: { '200': { description: 'Eliminado' } }
        }
      },

      // --- Rutas de Juego (Protegidas) ---
      '/game/select-pet/{id}': {
        post: {
          tags: ['Game'],
          summary: 'Selecciona una mascota del usuario actual para interactuar',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { '200': { description: 'Mascota seleccionada.' } }
        }
      },
      '/game/logout': { post: { tags: ['Game'], summary: 'Cierra la sesión con la mascota activa', responses: { '200': { description: 'Sesión cerrada.' } } } },
      '/game/status': { get: { tags: ['Game'], summary: 'Consulta el estado de la mascota activa', responses: { '200': { description: 'Estado actual.', content: { 'application/json': { schema: { $ref: '#/components/schemas/GameStatus' }}}}}} },
      '/game/feed': { post: { tags: ['Game'], summary: 'Alimenta a la mascota activa', responses: { '200': { description: 'Mascota alimentada.' } } } },
      '/game/walk': { post: { tags: ['Game'], summary: 'Saca a pasear a la mascota activa', responses: { '200': { description: 'Mascota ha paseado.' } } } },
      '/game/cure': { post: { tags: ['Game'], summary: 'Cura a la mascota activa', responses: { '200': { description: 'Mascota curada.' } } } },
      '/game/revert-personality': { post: { tags: ['Game'], summary: 'Restaura la personalidad original', responses: { '200': { description: 'Personalidad restaurada.' } } } },
      '/game/buy/{accessoryId}': { post: { tags: ['Game'], summary: 'Compra un accesorio', parameters: [{ in: 'path', name: 'accessoryId', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Compra exitosa.' } } } },
      '/game/equip/{accessoryId}': { post: { tags: ['Game'], summary: 'Equipa un accesorio', parameters: [{ in: 'path', name: 'accessoryId', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Accesorio equipado.' } } } }
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;