import json
import os
import boto3
from decimal import Decimal

def default_serializer(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def handler(event, context):
    if event['httpMethod'] == 'POST':
        body = json.loads(event['body'])
        cuenta = body.get('Cuenta')
        direccion = body.get('direccion')
        giro = body.get('giro')
        numero_medidor = body.get('numero_medidor')
        nombres_apellidos = body.get('nombres_apellidos')

        if not cuenta:
            return { 'statusCode': 400, 'body': 'Cuenta is required' }

        table.put_item(Item={
            'Cuenta': cuenta,
            'direccion': direccion,
            'giro': giro,
            'numero_medidor': numero_medidor,
            'nombres_apellidos': nombres_apellidos,
            'status': 'pendiente',
            'adeudo': 'pendiente',
            'consumido': 0
        })

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Item inserted'})
        }

    elif event['httpMethod'] == 'GET':
        try:
            response = table.scan()
            return {
                'statusCode': 200,
                'body': json.dumps(response['Items'], default=default_serializer)
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': str(e)})
            }

    else:
        return {
            'statusCode': 405,
            'body': 'Method Not Allowed'
        }
