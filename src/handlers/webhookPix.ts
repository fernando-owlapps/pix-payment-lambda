import { APIGatewayProxyHandler } from 'aws-lambda';

export const webhookPix: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    console.log('🔔 Webhook recebido:', body);

    const txid = body.external_reference || body.txid;
    const status = body.status || body.payment_status;

    if (!txid || !status) {
      return {
        statusCode: 400,
        body: 'Dados incompletos no webhook.',
      };
    }

    if (status === 'approved' || status === 'accredited') {
      console.log(`✅ Pagamento confirmado para txid: ${txid}`);
      // Atualize seu sistema aqui: banco de dados, eventos, etc.
    } else {
      console.log(`ℹ️ Status do pagamento para ${txid}: ${status}`);
    }

    return {
      statusCode: 200,
      body: 'OK',
    };
  } catch (error) {
    console.error('Erro no webhook Pix:', error);
    return {
      statusCode: 500,
      body: 'Erro no webhook',
    };
  }
};
