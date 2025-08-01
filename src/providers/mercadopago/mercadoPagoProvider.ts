import axios from 'axios';
import { PixProvider, Devedor, CobrancaPixResult } from '../../utils/pixProvider';

import dotenv from 'dotenv';
dotenv.config();

export class MercadoPagoProvider implements PixProvider {
  private accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN!;

  async criarCobranca(txid: string, valor: string, devedor: Devedor): Promise<CobrancaPixResult> {
    const body = {
      transaction_amount: Number(valor),
      payment_method_id: 'pix',
      description: 'Pagamento via Pix',
      external_reference: txid,
      payer: {
        email: devedor?.email || 'TESTUSER958462752@sandbox.mercadopago.com', // e-mail de teste válido para sandbox
        first_name: devedor?.nome || 'APRO',
      },
    };

    const res = await axios.post('https://api.mercadopago.com/v1/payments', body, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': txid,
      },
    });

    const payment = res.data.point_of_interaction.transaction_data;
    const qrCode = payment.qr_code;
    const imagemQrcode = payment.qr_code_base64;

    return {
      txid,
      qrCode,
      imagemQrcode,
    };
  }

  async monitorarPagamento(txid: string): Promise<boolean> {
    const timeout = 5 * 60 * 1000;
    const start = Date.now();

    while (Date.now() - start < timeout) {
      try {
        const res = await axios.get('https://api.mercadopago.com/v1/payments/search', {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          params: {
            external_reference: txid,
          },
        });

        const payments = res.data.results;
        if (payments.length > 0) {
          const payment = payments[0];
          console.log(`🔄 Status do pagamento [${txid}]: ${payment.status}`);
          if (payment.status === 'approved') return true;
        }
      } catch (error: any) {
        console.warn(`⚠️ Erro ao monitorar pagamento [${txid}]:`, error.response?.data || error.message);
      }

      await new Promise((r) => setTimeout(r, 5000));
    }

    return false;
  }

  async registrarWebhook(_url: string): Promise<void> {
    console.warn('Webhook para Mercado Pago deve ser registrado manualmente no dashboard.');
  }
}
