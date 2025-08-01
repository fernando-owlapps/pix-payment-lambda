import { APIGatewayProxyHandler } from 'aws-lambda';
import { Payer } from 'domain/types/pix.types';
import { createPixPayment, monitorPixPayment } from 'services/payment/pix.service';
import { v4 as uuidv4 } from 'uuid';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ erro: 'Requisição inválida: body ausente' }),
      };
    }

    const { valor, payer }: { valor?: string; payer?: Payer } = JSON.parse(event.body);

    if (!valor) {
      return {
        statusCode: 400,
        body: JSON.stringify({ erro: 'Valor obrigatório' }),
      };
    }

    if (!payer?.name || !payer?.cpf) {
      return {
        statusCode: 400,
        body: JSON.stringify({ erro: 'Dados do devedor (nome e cpf) obrigatórios' }),
      };
    }

    const txid = uuidv4().replace(/-/g, '').substring(0, 35);

    const cobranca = await createPixPayment(txid, valor, payer);

    // Inicia o monitoramento de pagamento de forma assíncrona
    monitorPixPayment(txid).catch((err: any) =>
      console.error(`Erro ao monitorar pagamento do Pix [${txid}]:`, err),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        txid,
        qrCode: cobranca.qrCode,
        imagemQrcode: cobranca.imageQrcode,
      }),
    };
  } catch (error: any) {
    console.error('Erro ao gerar Pix:', error.response?.data || error.message || error);
    return {
      statusCode: 500,
      body: JSON.stringify({ erro: 'Erro ao gerar Pix' }),
    };
  }
};
