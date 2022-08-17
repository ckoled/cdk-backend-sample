import { LambdaRestApi } from '@aws-cdk/aws-apigateway';
import { Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Construct } from '@aws-cdk/core';
import * as path from 'path';

export default class AuthConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const authFunction = new NodejsFunction(this, 'authFunction', {
      runtime: Runtime.NODEJS_14_X,
      entry: path.join(__dirname, '..', '..', '..', 'node', 'src', 'authFunction.ts')
    });

    const api = new LambdaRestApi(this, 'api', {
      handler: authFunction,
      defaultCorsPreflightOptions: {
        allowOrigins: ['*']
      },
      proxy: false,
    });

    const loginRoute = api.root.addResource('login');
    loginRoute.addMethod('POST');
  }
}