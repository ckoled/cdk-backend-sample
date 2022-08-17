import { App } from '@aws-cdk/core';
import { BackendStack } from '../lib/backendStack';

const app = new App();
new BackendStack(app, 'BackendStack');
