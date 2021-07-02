import { SchemaType } from 'dynamodb-toolbox/dist/classes/Entity';
import { Entity } from 'dynamodb-toolbox';
import { marshallOptions, marshall as utilMarshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { AttributeValue, DynamoDB, ScanCommandInput } from '@aws-sdk/client-dynamodb';

var bcrypt = require('bcryptjs');

export const client = new DynamoDB({ region: process.env.REGION });

export interface IGraphQLHandlerProps {
  id?: string;
  type?: string;
  data?: {
    [key: string]: any;
  };
  entity?: Entity<{ [x: string]: SchemaType }>;
}

export function marshall<T extends { [K in keyof T]: unknown }>(
  data: T,
  options?: marshallOptions | undefined
): {
  [key: string]: AttributeValue;
} {
  return utilMarshall(data, { ...options, removeUndefinedValues: true });
}

export const getObjectsHandler = async <T>(props: IGraphQLHandlerProps): Promise<any> => {
  // USE GSI'S!!!!!!!
  let args: ScanCommandInput = {
    TableName: process.env.TABLE_NAME
  };
  if (props.data) {
    const params = { ...props.data };
    let fltrExpr = '';
    Object.entries(params).forEach(([k, v]) => {
      fltrExpr += `#data.${k}=:${k} and `;
    });
    fltrExpr = fltrExpr.substr(0, fltrExpr.length - 5);

    args = {
      ...args,
      FilterExpression: fltrExpr,
      ExpressionAttributeNames: {
        '#data': `${props.type?.toLowerCase()}_data`
      },
      ExpressionAttributeValues: marshall(Object.fromEntries(Object.entries(params).map(([k, v]) => [`:${k}`, v])))
    };
  }

  try {
    const resp = await client.scan(args);
    return resp.Items?.map((item) => unmarshall(item)[`${props.type?.toLowerCase()}_data`] as T);
  } catch (e) {
    return null;
  }
};

export const getObjectHandler = async <T>(props: IGraphQLHandlerProps): Promise<any> => {
  const key = {
    id: props.id,
    type: props.type?.toUpperCase()
  };

  return (await props.entity!.get(key)).Item.data as T;
};

export const createObjectHandler = async (props: IGraphQLHandlerProps): Promise<any> => {
  const id = props.id;
  if (props.type == 'USER') {
    props.data!.password = bcrypt.hashSync(props.data!.password, 10);
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

  await props.entity!.put(item);
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

  await props.entity!.update(item);
  return props.id;
};

export const deleteObjectHandler = async (props: IGraphQLHandlerProps): Promise<any> => {
  const key = {
    id: props.id,
    type: props.type
  };

  await props.entity!.delete(key);
  return props.id;
};
