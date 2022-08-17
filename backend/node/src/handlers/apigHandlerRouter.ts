import { APIGatewayProxyEvent } from 'aws-lambda';

export interface IRoutes {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: (event: any, context: unknown) => Promise<unknown> | unknown;
}

export const apigRouteKeyProvider = (path: string, method: string): string => {
  return `${path}::${method}`;
};

export const apigHandlerRouter = (
  routes: IRoutes
): ((event: APIGatewayProxyEvent, context: unknown) => Promise<unknown>) => {
  return async (event: APIGatewayProxyEvent, context: unknown) => {
    const key = apigRouteKeyProvider(event.requestContext.resourcePath, event.requestContext.httpMethod);

    const action = routes[key];
    return await action(event, context);
  };
};
