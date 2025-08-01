import { APIGatewayProxyHandler } from 'aws-lambda';
import axios from 'axios';

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    console.log('🔔 Webhook recebido:', JSON.stringify(body, null, 2));

    const paymentId = body?.data?.id;
    if (!paymentId) {
      return {
        statusCode: 400,
        body: 'Webhook sem payment ID.',
      };
    }

    // 🔍 Consulta o pagamento no Mercado Pago
    const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const payment = response.data;
    const txid = payment.external_reference;
    const status = payment.status;

    console.log(`ℹ️ Pagamento ${paymentId} - status: ${status} - txid: ${txid}`);

    if (!txid || !status) {
      return {
        statusCode: 400,
        body: 'Dados insuficientes após consultar o pagamento.',
      };
    }

    if (status === 'approved' || status === 'accredited') {
      console.log(`✅ Pagamento confirmado para txid: ${txid}`);
      // Atualize seu sistema aqui
    }

    return {
      statusCode: 200,
      body: 'OK',
    };
  } catch (error: any) {
    console.error('❌ Erro ao processar webhook:', error.response?.data || error.message);
    return {
      statusCode: 500,
      body: 'Erro ao processar webhook',
    };
  }
};
