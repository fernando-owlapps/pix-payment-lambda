import axios from 'axios';
import fs from 'fs';
import https from 'https';
// import { PixProvider, Devedor, CobrancaPixResult } from '../../utils/pixProvider';
// import { getOAuthTokenDynamoDB } from '../../old/auth';

import dotenv from 'dotenv';
import { PixProvider, Payer, PixChargeResponse } from 'domain/types/pix.types';
dotenv.config();

export class GerencianetProvider implements PixProvider {
  private agent = new https.Agent({
    cert: fs.readFileSync(process.env.CERT_PATH!),
    key: fs.readFileSync(process.env.KEY_PATH!),
  });

  private chavePix = process.env.CHAVE_PIX || 'seu-email@provedor.com';

  private readonly TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos
  private readonly POLLING_INTERVAL_MS = 5000; // 5 segundos

  async create(txid: string, valor: string, payer: Payer): Promise<PixChargeResponse> {
    // const token = await getOAuthTokenDynamoDB();
    const token = ''

    const body = {
      calendario: { expiracao: 300 }, // expiração em 5 minutos
      payer,
      valor: { original: valor },
      chave: this.chavePix,
      solicitacaoPagador: 'Por favor, pague antes de 5 minutos para evitar cancelamento.',
    };

    const res = await axios.put(`https://api-pix.gerencianet.com.br/v2/cob/${txid}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      httpsAgent: this.agent,
    });

    if (!res.data.loc || !res.data.loc.id) {
      throw new Error('Resposta da cobrança não contém loc.id');
    }

    const locId = res.data.loc.id;

    const qrRes = await axios.get(`https://api-pix.gerencianet.com.br/v2/loc/${locId}/qrcode`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      httpsAgent: this.agent,
    });

    return {
      txid,
      qrCode: qrRes.data.qrcode,
      imageQrcode: qrRes.data.imagemQrcode,
    };
  }

  async monitor(txid: string): Promise<boolean> {
    // const token = await getOAuthTokenDynamoDB();
    const token = ''
    const start = Date.now();

    while (Date.now() - start < this.TIMEOUT_MS) {
      try {
        const res = await axios.get(`https://api-pix.gerencianet.com.br/v2/cob/${txid}`, {
          headers: { Authorization: `Bearer ${token}` },
          httpsAgent: this.agent,
        });

        const status = res.data.status;
        console.log(`🔄 Status do pagamento [${txid}]: ${status}`);

        if (status === 'CONCLUIDA') return true;
      } catch (error: any) {
        console.warn(
          '⚠️ Erro ao monitorar pagamento:',
          error.response?.data || error.message || JSON.stringify(error)
        );
      }

      await new Promise((resolve) => setTimeout(resolve, this.POLLING_INTERVAL_MS));
    }

    return false;
  }

  async registerWebhook(webhookUrl: string): Promise<void> {
    // const token = await getOAuthTokenDynamoDB();
    const token = ''

    try {
      const res = await axios.put(
        `https://api-pix.gerencianet.com.br/v2/webhook/${encodeURIComponent(this.chavePix)}`,
        { webhookUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          httpsAgent: this.agent,
        }
      );

      console.log('✅ Webhook registrado com sucesso:', res.data);
    } catch (error: any) {
      console.error(
        '❌ Falha ao registrar webhook:',
        error.response?.data || error.message || JSON.stringify(error)
      );
      throw error;
    }
  }
}
