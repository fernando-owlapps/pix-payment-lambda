import axios from 'axios';
import { PixProvider, Devedor, CobrancaPixResult } from '../../utils/pixProvider';

export class MercadoPagoProvider implements PixProvider {
  private accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN!;

  // Cria cobrança Pix e retorna dados para gerar o QR Code
  async criarCobranca(txid: string, valor: string, devedor: Devedor): Promise<CobrancaPixResult> {
    const body = {
      transaction_amount: Number(valor),
      description: `Pagamento PIX para ${devedor.nome}`,
      payment_method_id: 'pix',
      payer: {
        first_name: devedor.nome,
        identification: {
          type: 'CPF',
          number: devedor.cpf,
        },
      },
      external_reference: txid,
    };

    const res = await axios.post('https://api.mercadopago.com/v1/payments', body, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const { id, status, point_of_interaction } = res.data;

    if (status !== 'pending') {
      throw new Error(`Pagamento não está pendente: status=${status}`);
    }

    const qrCode = point_of_interaction.transaction_data.qr_code;
    const imagemQrcode = point_of_interaction.transaction_data.qr_code_base64;

    return {
      txid,
      qrCode,
      imagemQrcode,
    };
  }

  // Monitora status do pagamento via polling com timeout de 5 minutos
  async monitorarPagamento(txid: string): Promise<boolean> {
    const timeout = 5 * 60 * 1000; // 5 minutos
    const start = Date.now();

    while (Date.now() - start < timeout) {
      try {
        // Consulta pagamentos filtrando pela referência externa (txid)
        const res = await axios.get('https://api.mercadopago.com/v1/payments/search', {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          params: {
            external_reference: txid,
          },
        });

        const payments = res.data.results;

        if (payments && payments.length > 0) {
          // Geralmente será único pagamento com esse txid
          const payment = payments[0];
          console.log(`🔄 Status do pagamento [${txid}]: ${payment.status}`);

          if (payment.status === 'approved') {
            return true; // pagamento confirmado
          }
        }
      } catch (error: any) {
        console.warn(
          `⚠️ Erro ao monitorar pagamento [${txid}]:`,
          error.response?.data || error.message
        );
      }

      // Espera 5 segundos antes da próxima tentativa
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    // Timeout atingido, pagamento não confirmado
    return false;
  }

  // Mercado Pago não possui API para registrar webhook programaticamente
  async registrarWebhook(webhookUrl: string): Promise<void> {
    console.warn(
      'Registro de webhook Mercado Pago deve ser feito manualmente no dashboard da plataforma.'
    );
  }
}
