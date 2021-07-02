import { apigHandlerRouter } from './apigHandlerRouter';
import { createEntity } from './graphqlHandler';
import { getObjectsHandler } from './graphqlHandlers';
import { IUser } from '../types';

var bcrypt = require('bcryptjs');

const loginHandler = async (event: any, context: unknown): Promise<unknown> => {
  try {
    const body = JSON.parse(event.body!);
    const users = await getObjectsHandler<IUser>({
      data: {
        username: body.username,
      },
      entity: createEntity('USER')
    });
    const user = users[0] as IUser;
    if (!(await bcrypt.compare(body.password, user.password!))) throw new Error('invalid credentials');
    return { statusCode: 200, body: user.id };
  } catch (e) {
    return { statusCode: 401, body: e };
  }
};

export const handler = apigHandlerRouter({
    '/login::POST': loginHandler,
  }
);
