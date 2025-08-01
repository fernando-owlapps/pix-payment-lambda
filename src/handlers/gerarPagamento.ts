import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

import { PixProvider, Devedor } from '../utils/pixProvider';

// import { GerencianetProvider } from '../providers/gerencianet/gerencianetProvider';
import { MercadoPagoProvider } from '../providers/mercadopago/mercadoPagoProvider';

// const pixProvider: PixProvider = new GerencianetProvider();
const pixProvider: PixProvider = new MercadoPagoProvider();

export const gerarPagamento: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ erro: 'Requisição inválida: body ausente' }),
      };
    }

    const { valor, devedor }: { valor?: string; devedor?: Devedor } = JSON.parse(event.body);

    // Validações obrigatórias
    if (!valor) {
      return {
        statusCode: 400,
        body: JSON.stringify({ erro: 'Valor obrigatório' }),
      };
    }

    if (!devedor?.nome || !devedor?.cpf) {
      return {
        statusCode: 400,
        body: JSON.stringify({ erro: 'Dados do devedor (nome e cpf) obrigatórios' }),
      };
    }

    // Geração do txid (UUID sem hífens, até 35 caracteres)
    const txid = uuidv4().replace(/-/g, '').substring(0, 35);

    // Cria cobrança via provedor Pix
    const cobranca = await pixProvider.criarCobranca(txid, valor, devedor);

    return {
      statusCode: 200,
      body: JSON.stringify({
        txid,
        qrCode: cobranca.qrCode,
        imagemQrcode: cobranca.imagemQrcode,
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
