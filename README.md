# cdk backend sample

## Dependencies

* [Node.js](https://nodejs.org/) version 14

    Make sure NPM version >= 7 (`npm i -g npm`)

* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)

* [Docker](https://www.docker.com/products/docker-desktop)

## Initialize

* Clone repo: `git clone https://github.com/ckoled/cdk-backend-sample.git`

* Initialize `npm run init:deploy`

## Destroy

* `npm run destroy`
    
    *Note: dynamodb tables and log groups do not delete, delete through AWS console to fully destroy

## Other Commands

* Clean: `npm run clean`
* Install Dependencies: `npm i`
* Deploy: `npm run deploy`
* Build: `npm run build`
* Cdk: `npm run cdk -- [synth, deploy, diff, destroy,...]`