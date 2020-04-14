const { log } = require('../../lib');
const { Season } = require('../../models');

const schema = {
  description: 'Delete season from the site',
  summary: 'Delete season',
  tags: ['Season'],
  params: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
        },
        accessToken: {
          type: 'string',
        },
        refreshToken: {
          type: 'string',
        },
      },
    },
  },
};

const handler = async (req, reply) => {
  if (!req.auth.jwtPayload.roles.includes('admin')) {
    reply.status(403).send({
      status: 'ERROR',
      error: 'Forbidden',
    });
    return;
  }

  try {
    await Season.findOneAndDelete({
      _id: req.params.id,
    });
  } catch (error) {
    log.error('Error deleting season: ', error);
    reply.status(500).send({
      status: 'ERROR',
      error: 'Internal Server Error',
    });
    return;
  }

  const { newTokens = {} } = req.auth;
  reply.send({
    status: 'OK',
    accessToken: newTokens.accessToken,
    refreshToken: newTokens.refreshToken,
  });
};

module.exports = async function (fastify) {
  fastify.route({
    method: 'DELETE',
    url: '/:id/delete',
    preValidation: fastify.auth([fastify.verifyJWT]),
    handler,
    schema,
  });
};
