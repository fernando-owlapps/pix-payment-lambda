import axios from 'axios';
import fs from 'fs';
import https from 'https';
import { getOAuthTokenDynamoDB } from './src/old/auth';

// Chave Pix parametrizada via env
const CHAVE_PIX = process.env.CHAVE_PIX || 'seu-email@provedor.com';

/**
 * Cria um novo https.Agent com certificados do filesystem.
 */
function createAgent() {
  return new https.Agent({
    cert: fs.readFileSync(process.env.CERT_PATH!),
    key: fs.readFileSync(process.env.KEY_PATH!),
  });
}

/**
 * Cria uma cobrança Pix.
 * @param txid Identificador da cobrança
 * @param valor Valor original da cobrança, string no formato "10.00"
 * @param devedor Dados do pagador (nome e cpf), obrigatórios
 */
export async function criarCobrancaPix(
  txid: string,
  valor: string,
  devedor: { nome: string; cpf: string }
) {
  try {
    const token = await getOAuthTokenDynamoDB();
    const agent = createAgent();

    const res = await axios.put(
      `https://api-pix.gerencianet.com.br/v2/cob/${txid}`,
      {
        calendario: { expiracao: 300 }, // 5 minutos
        devedor,
        valor: { original: valor },
        chave: CHAVE_PIX,
        solicitacaoPagador: 'Pague antes de 5 minutos',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        httpsAgent: agent,
      }
    );

    const locId = res.data.loc.id;

    const qrRes = await axios.get(
      `https://api-pix.gerencianet.com.br/v2/loc/${locId}/qrcode`,
      {
        headers: { Authorization: `Bearer ${token}` },
        httpsAgent: agent,
      }
    );

    return {
      txid,
      qrCode: qrRes.data.qrcode,
      imagemQrcode: qrRes.data.imagemQrcode,
    };
  } catch (error: any) {
    console.error('Erro ao criar cobrança Pix:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Monitora status da cobrança até 5 minutos.
 * @param txid Identificador da cobrança Pix
 * @returns true se pagamento concluído, false caso contrário
 */
export async function monitorarPagamento(txid: string): Promise<boolean> {
  const token = await getOAuthTokenDynamoDB();
  const timeout = 5 * 60 * 1000; // 5 minutos
  const startTime = Date.now();
  const agent = createAgent();

  while (Date.now() - startTime < timeout) {
    try {
      const res = await axios.get(
        `https://api-pix.gerencianet.com.br/v2/cob/${txid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          httpsAgent: agent,
        }
      );

      const status = res.data.status;
      console.log(`Status [${txid}]:`, status);

      if (status === 'CONCLUIDA') {
        return true;
      }
    } catch (error: any) {
      console.warn(`Erro ao consultar status do Pix [${txid}]:`, error.response?.data || error.message);
      // Pode implementar retry/backoff aqui se quiser
    }

    // Espera 5 segundos antes da próxima checagem
    await new Promise((r) => setTimeout(r, 5000));
  }

  console.warn(`Timeout: cobrança Pix ${txid} não foi concluída em 5 minutos.`);
  return false;
}

/**
 * Registra o webhook Pix.
 * @param webhookUrl URL para receber notificações de pagamento
 */
export async function registrarWebhookPix(webhookUrl: string) {
  try {
    const token = await getOAuthTokenDynamoDB();
    const agent = createAgent();

    const res = await axios.put(
      `https://api-pix.gerencianet.com.br/v2/webhook/${encodeURIComponent(CHAVE_PIX)}`,
      { webhookUrl },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        httpsAgent: agent,
      }
    );

    console.log('✅ Webhook registrado com sucesso!');
    console.log(res.data);
  } catch (error: any) {
    console.error('Erro ao registrar webhook:', error.response?.data || error.message);
    throw error;
  }
}
