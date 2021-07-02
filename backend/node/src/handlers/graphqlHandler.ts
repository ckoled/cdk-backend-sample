import { v4 as uuidv4 } from 'uuid';
import { Table, Entity } from 'dynamodb-toolbox';
import { SchemaType } from 'dynamodb-toolbox/dist/classes/Entity';
import { DynamoDB } from 'aws-sdk';
import * as gHandlers from './graphqlHandlers';

export interface IGraphQLEvent {
  info: {
    fieldName: string;
  };
  arguments: {
    id?: string;
    data?: {
      [key: string]: any;
    };
    where?: {
      [key: string]: any;
    };
    [key: string]: any;
  };
}

const DocumentClient = new DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME ?? 'table';

const principalTable = new Table({
  name: tableName,
  partitionKey: 'pk',
  sortKey: 'sk',
  DocumentClient
});

export const createEntity = (type: string): Entity<{ [x: string]: SchemaType }> => {
  return new Entity({
    name: type.toUpperCase(),
    attributes: {
      pk: { partitionKey: true, hidden: true },
      sk: { sortKey: true, hidden: true, default: (data: any) => `${data.type.toUpperCase}#${data.id}` },
      id: ['pk', 1],
      type: ['pk', 0],
      data: { map: `${type.toLowerCase()}_data`, type: 'map' }
    },
    table: principalTable
  });
};

export enum TYPES {
  User = 'USER'
}

export const handler = async (event: IGraphQLEvent): Promise<any> => {
  const name = event.info.fieldName;

  let type = '';
  for (let item in TYPES) {
    if (name.includes(item)) type = item.toUpperCase();
  }
  
  const entity = createEntity(type);

  if (name.startsWith('getMany')) {
    return await gHandlers.getObjectsHandler({
      data: event.arguments.where,
      type,
    });
  } else if (name.startsWith('getOne')) {
    return await gHandlers.getObjectHandler({
      id: event.arguments.id,
      type,
      entity
    });
  } else if (name.startsWith('create')) {
    return await gHandlers.createObjectHandler({
      id: uuidv4(),
      type,
      data: event.arguments.data,
      entity
    });
  } else if (name.startsWith('update')) {
    return await gHandlers.updateObjectHandler({
      id: event.arguments.id,
      type,
      data: event.arguments.data,
      entity
    });
  } else if (name.startsWith('delete')) {
    return await gHandlers.deleteObjectHandler({
      id: event.arguments.id,
      type,
      entity
    });
  } else return null;
};
