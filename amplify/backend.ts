import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { HelloWorldLambdaStack } from './functions/resources';
import { JmasLambdaStack } from './functions/jmas-function';
import { RevalidacionLambdaStack } from './functions/revalidacion-function';


const backend = defineBackend({
  auth,
  data,
});

// Crear stack para la función JMAS
const jmasStack = backend.createStack('JmasStack');

// Crear la tabla DynamoDB
const jmasTable = new dynamodb.Table(jmasStack, 'Jmas', {
  tableName: 'Jmas',
  partitionKey: { name: 'Cuenta', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});

// Crear función Lambda con acceso a la tabla
new JmasLambdaStack(jmasStack, 'JmasLambdaResource', {
  table: jmasTable,
});


// Crear stack y Lambda de HelloWorld (si la sigues usando)
const helloStack = backend.createStack('HelloWorldLambdaStack');
new HelloWorldLambdaStack(helloStack, 'helloWorldLambdaResource', {});


// Crear stack para revalidación
const revalidacionStack = backend.createStack('RevalidacionStack');


// Crear tabla DynamoDB
const revalidacionTable = new dynamodb.Table(revalidacionStack, 'Revalidacion', {
  tableName: 'Revalidacion',
  partitionKey: { name: 'placa', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
});

new RevalidacionLambdaStack(revalidacionStack, 'RevalidacionLambdaResource', {
  table: revalidacionTable,
});