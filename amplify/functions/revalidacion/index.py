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
anio = int(os.environ['ANIO_REVALIDADO'])

def handler(event, context):
    if event['httpMethod'] == 'POST':
        try:
            body = json.loads(event['body'])

            item = {
                'placa': body.get('placa'),
                'propietario': body.get('propietario'),
                'modelo': body.get('modelo'),
                'marca': body.get('marca'),
                'linea': body.get('linea'),
                'serie': body.get('serie'),
                'tipo': body.get('tipo'),
                'estatus': 'pendiente',
                'adeudo_total': Decimal("0.0"),
                'año_revalidado': anio
            }

            if not item['placa']:
                return {'statusCode': 400, 'body': 'Placa es obligatoria'}

            table.put_item(Item=item)

            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'Registro creado'})
            }

        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': str(e)})
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

    return {
        'statusCode': 405,
        'body': 'Método no permitido'
    }
