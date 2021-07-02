import { LambdaRestApi } from '@aws-cdk/aws-apigateway';
import { AuthorizationType, GraphqlApi, Schema } from '@aws-cdk/aws-appsync';
import { AttributeType, Table } from '@aws-cdk/aws-dynamodb';
import { Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Stack, StackProps, Construct, CfnOutput } from '@aws-cdk/core';
import * as path from 'path';

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const graphqlApi = new GraphqlApi(this, 'graphqlApi', {
      name: 'graphqlApi',
      schema: Schema.fromAsset(path.join(__dirname, 'graphql', 'schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          // use jwt
          authorizationType: AuthorizationType.API_KEY
        }
      },
    });

    const graphqlTbl = new Table(this, 'graphqlTable', {
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING
      }
    });

    const handler = new NodejsFunction(this, 'handlerFunction', {
      runtime: Runtime.NODEJS_14_X,
      entry: path.join(__dirname, '..', '..', 'node', 'src', 'index.ts'),
      environment: {
        TABLE_NAME: graphqlTbl.tableName,
        REGION: graphqlTbl.env.region
      }
    });

    graphqlTbl.grantReadWriteData(handler);

    const graphqlDS = graphqlApi.addLambdaDataSource('graphqlDS', handler);

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

    const api = new LambdaRestApi(this, 'api', {
      handler,
      defaultCorsPreflightOptions: {
        allowOrigins: ['*']
      },
      proxy: false,
    });

    const loginRoute = api.root.addResource('login');
    loginRoute.addMethod('POST');

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
