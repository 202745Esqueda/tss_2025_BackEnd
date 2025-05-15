import { Duration, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

interface RevalidacionLambdaProps extends StackProps {
  table: dynamodb.Table;
}

export class RevalidacionLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props: RevalidacionLambdaProps) {
    super(scope, id, props);

    const { table } = props;

    const lambdaFn = new lambda.Function(this, 'RevalidacionFunction', {
      functionName: 'RevalidacionFunction',
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('./amplify/functions/revalidacion'),
      timeout: Duration.seconds(30),
      environment: {
        TABLE_NAME: table.tableName,
        ANIO_REVALIDADO: new Date().getFullYear().toString(), // pasa año actual
      },
    });

    table.grantReadWriteData(lambdaFn);

    const api = new apigateway.LambdaRestApi(this, 'RevalidacionApi', {
      handler: lambdaFn,
      proxy: false,
    });

    const reval = api.root.addResource('revalidacion');
    reval.addMethod('POST', undefined, {
      authorizationType: apigateway.AuthorizationType.NONE,
    });

    reval.addMethod('GET', undefined, {
      authorizationType: apigateway.AuthorizationType.NONE,
    });

    new CfnOutput(this, 'RevalidacionAPIURL', {
      value: api.url,
      exportName: `${Stack.of(this).stackName}-RevalidacionAPIURL`,
    });
  }
}
