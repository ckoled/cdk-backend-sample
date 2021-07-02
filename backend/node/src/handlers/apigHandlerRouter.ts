export interface IRoutes {
  [key: string]: (event: any, context: unknown) => Promise<unknown> | unknown;
}

export const apigRouteKeyProvider = (path: string, method: string): string => {
  return `${path}::${method}`;
};

export const apigHandlerRouter = (
  routes: IRoutes
): ((event: any, context: unknown) => Promise<unknown>) => {
  return async (event: any, context: unknown) => {
    const key = apigRouteKeyProvider(event.requestContext.resourcePath, event.requestContext.httpMethod);

    const action = routes[key];
    return await action(event, context);
  };
};
