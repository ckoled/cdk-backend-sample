import { AuthorizationType, GraphqlApi, Schema } from '@aws-cdk/aws-appsync';
import { AttributeType, Table } from '@aws-cdk/aws-dynamodb';
import { Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { CfnOutput, Construct } from '@aws-cdk/core';
import * as path from 'path';

export default class GraphqlConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    
    const graphqlApi = new GraphqlApi(this, 'graphqlApi', {
      name: 'graphqlApi',
      schema: Schema.fromAsset(path.join(__dirname, '..', 'graphql', 'schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY
        }
      },
    });

    const graphqlTbl = new Table(this, 'graphqlTable', {
      tableName: 'graphqlTable',
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING
      }
    });

    const graphqlFunction = new NodejsFunction(this, 'graphqlFunction', {
      runtime: Runtime.NODEJS_14_X,
      entry: path.join(__dirname, '..', '..', '..', 'node', 'src', 'graphqlFunction.ts'),
      environment: {
        TABLE_NAME: graphqlTbl.tableName,
        REGION: graphqlTbl.env.region
      }
    });

    graphqlTbl.grantReadWriteData(graphqlFunction);

    const graphqlDS = graphqlApi.addLambdaDataSource('graphqlDS', graphqlFunction);

    graphqlDS.createResolver({
      typeName: 'Query',
      fieldName: 'getManyUsers'
    });

    graphqlDS.createResolver({
      typeName: 'Query',
      fieldName: 'getOneUser'
    });

    graphqlDS.createResolver({
      typeName: 'Mutation',
      fieldName: 'createUser'
    });

    graphqlDS.createResolver({
      typeName: 'Mutation',
      fieldName: 'updateUser'
    });

    graphqlDS.createResolver({
      typeName: 'Mutation',
      fieldName: 'deleteUser'
    });

    new CfnOutput(this, 'graphqlApiUrl', {
      value: graphqlApi.graphqlUrl,
      exportName: 'graphqlApiUrl'
    });

    new CfnOutput(this, 'graphqlApiKey', {
      value: graphqlApi.apiKey!,
      exportName: 'graphqlApiKey'
    });
  }
}