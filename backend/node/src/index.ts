import { handler as authHandler } from './handlers/authHandler'
import { handler as graphqlHandler } from './handlers/graphqlHandler';

export const handler = async (event: any, context: unknown): Promise<unknown> => {
  if(event.body) return await authHandler(event, context);
  else if(event.info) return await graphqlHandler(event);
  else return null;
}