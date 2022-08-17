import { handler, IGraphQLEvent } from './index';
import { IPrincipal } from './types/index';
import * as gHandler from './handlers/graphqlHandlers';

describe('kore-admin graphql handler', () => {
  // it('getPrincipals event', async () => {
  //   const event: IGraphQLEvent = {
  //     info: {
  //       fieldName: 'getManyPrincipals'
  //     },
  //     arguments: {}
  //   }
  //   jest.spyOn(gHandler.client, "scan").mockImplementation(async (args) => {
  //     return {
  //       Items: [
  //         gHandler.marshall({
  //           principal_data: {
  //             id: '1'
  //           }
  //         })
  //       ]
  //     }
  //   });
  //   const ret = await handler(event);
  //   expect(ret).toMatchObject([{ id: '1' }]);
  // });

  it('getPrincipals event', async () => {
    const event: IGraphQLEvent = {
      info: {
        fieldName: 'getManyPrincipals'
      },
      arguments: {}
    }
    const mocked = jest.fn(gHandler.getObjectsHandler)
    jest.spyOn(gHandler, "getObjectsHandler").mockImplementation(async (props: gHandler.IGraphQLHandlerProps) => {
      jest.spyOn(props.entity, "scan").mockImplementation(async (args) => {
        return {
          Items: [{
            data: {
              id: '1'
            }
          }]
        }
      });
      return mocked(props);
    });
    const ret = await handler(event);
    expect(ret).toMatchObject([{ id: '1' }]);
  });

  it('getPrincipal event', async () => {
    const event: IGraphQLEvent = {
      info: {
        fieldName: 'getOnePrincipal'
      },
      arguments: {id: '1'}
    }
    const mocked = jest.fn(gHandler.getObjectHandler)
    jest.spyOn(gHandler, "getObjectHandler").mockImplementation(async (props: gHandler.IGraphQLHandlerProps) => {
      jest.spyOn(props.entity, "get").mockImplementation(async (args) => {
        return {
          Item: {
            data: {
              id: '1'
            }
          }
        }
      });
      return mocked(props);
    });
    const ret = await handler(event);
    expect(ret).toMatchObject({ id: '1' });
  });

  it('creatPrincipal event', async () => {
    const event: IGraphQLEvent = {
      info: {
        fieldName: 'createPrincipal'
      },
      arguments: {}
    };
    const mocked = jest.fn(gHandler.createObjectHandler)
    jest.spyOn(gHandler, "createObjectHandler").mockImplementation(async (props: gHandler.IGraphQLHandlerProps) => {
      jest.spyOn(props.entity, "put").mockImplementation(async (args) => Promise);
      return await mocked(props);
    });
    const ret: IPrincipal = (await handler(event)) as IPrincipal;
    expect(ret.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  })
});
