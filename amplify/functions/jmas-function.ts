import { Duration, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

interface JmasLambdaProps extends StackProps {
  table: dynamodb.Table;
}

export class JmasLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props: JmasLambdaProps) {
    super(scope, id, props);

    const { table } = props;

    const jmasLambda = new lambda.Function(this, 'JmasFunction', {
      functionName: 'JmasFunction',
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('./amplify/functions/jmas'),
      timeout: Duration.seconds(30),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantReadWriteData(jmasLambda);

    // ✅ Crear API Gateway endpoint
    const api = new apigateway.LambdaRestApi(this, 'JmasApi', {
      handler: jmasLambda,
      proxy: false,
    });

    // Ruta POST y GET: /jmas
    const jmas = api.root.addResource('jmas');
    jmas.addMethod('GET', undefined, {
        authorizationType: apigateway.AuthorizationType.NONE,
      });
      
      jmas.addMethod('POST', undefined, {
        authorizationType: apigateway.AuthorizationType.NONE,
      });
      
      
    new CfnOutput(this, 'JmasAPIURL', {
        value: api.url,
        exportName: `${Stack.of(this).stackName}-JmasAPIURL`,
      });
      
      
  }
}
