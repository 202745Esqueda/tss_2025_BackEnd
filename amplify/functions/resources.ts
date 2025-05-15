import { CfnOutput, Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class HelloWorldLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Define the Lambda function
    const helloWorldFunction = new lambda.Function(this, 'HelloWorldFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('./amplify/functions/hello-world'),
      functionName: 'HelloWorldFunction',
      description: 'This is my custom Lambda function created using CDK',
      timeout: Duration.seconds(30),
      memorySize: 128,
      environment: {
        TEST: 'test',
      },
    });

    new CfnOutput(this, 'HellowWorldFunctionArn', {
      value: helloWorldFunction.functionArn,
      exportName: 'HelloWorldFunctionArn',
    });
  }
}