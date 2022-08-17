import { AttributeValue, DynamoDB, PutItemCommandInput } from '@aws-sdk/client-dynamodb';
import { logger } from '@kore/common-node';
import { marshall as utilMarshall, marshallOptions } from '@aws-sdk/util-dynamodb';

export const tableName = process.env.TABLE_NAME ?? '';
export const client = new DynamoDB({ region: process.env.REGION ?? 'us-west-2' });

export function marshall<T extends { [K in keyof T]: unknown }>(
  data: T,
  options?: marshallOptions | undefined
): {
  [key: string]: AttributeValue;
} {
  return utilMarshall(data, { ...options, removeUndefinedValues: true });
}

export const createGroupingHandler = async (
  id1: string,
  id2: string,
  data: { [key: string]: unknown },
  type: string
): Promise<unknown> => {
  const types = type.split('_');
  const pk = `${types[0].toUpperCase()}#${id1}`;
  const sk = `${types[1].toUpperCase()}#${id2}`;

  const args: PutItemCommandInput = {
    TableName: tableName,
    Item: marshall({
      pk,
      sk,
      gsipk1: sk,
      gsisk1: pk,
      [`${type.toLowerCase()}_data`]: {
        created: Date.now().toString(),
        created_by: id1,
        last_modified: Date.now().toString(),
        last_modified_by: id1,
        ...data
      },
      type: type.toUpperCase()
    })
  };

  try {
    await client.putItem(args);
    return type;
  } catch (e) {
    logger.warn(e);
    return null;
  }
};
