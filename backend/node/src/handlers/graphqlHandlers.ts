import { SchemaType } from 'dynamodb-toolbox/dist/classes/Entity';
import { Entity } from 'dynamodb-toolbox';

var bcrypt = require('bcryptjs');

export interface IGraphQLHandlerProps {
  id?: string;
  type?: string;
  data?: {
    [key: string]: any;
  };
  entity: Entity<{ [x: string]: SchemaType }>;
}

export const getObjectsHandler = async <T>(props: IGraphQLHandlerProps): Promise<any> => {
  const filters: any[] = [];
  Object.entries(props.data ?? {}).forEach(([k, v], i) => {
    filters[i] = { attr: k, eq: v };
  });
  const resp = await props.entity.scan({
    limit: 50,
    filters
  });
  return resp.Items?.map((item: any) => item.data as T);
};

export const getObjectHandler = async <T>(props: IGraphQLHandlerProps): Promise<any> => {
  const key = {
    id: props.id,
    type: props.type?.toUpperCase()
  };

  return (await props.entity.get(key)).Item.data as T;
};

export const createObjectHandler = async (props: IGraphQLHandlerProps): Promise<any> => {
  const id = props.id;
  if (props.type == 'USER') {
    props.data!.password = bcrypt.hash(props.data!.password, 10);
  }
  const data = {
    id,
    created: Date.now().toString(),
    created_by: id,
    last_modified: Date.now().toString(),
    last_modified_by: id,
    ...props.data
  };

  const item = {
    id: props.id,
    type: props.type?.toUpperCase(),
    data: data
  } as Partial<{ [x: string]: SchemaType }>;

  await props.entity.put(item);
  return data;
};

export const updateObjectHandler = async (props: IGraphQLHandlerProps): Promise<any> => {
  const item = {
    id: props.id,
    type: props.type,
    data: {
      $set: props.data
    }
  } as Partial<{ [x: string]: SchemaType }>;

  await props.entity.update(item);
  return props.id;
};

export const deleteObjectHandler = async (props: IGraphQLHandlerProps): Promise<any> => {
  const key = {
    id: props.id,
    type: props.type
  };

  await props.entity.delete(key);
  return props.id;
};
