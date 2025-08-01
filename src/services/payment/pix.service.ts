import { PixProvider, Payer, PixChargeResponse } from "domain/types/pix.types";
import { getPixProvider } from "providers/pix";

const pixProvider: PixProvider = getPixProvider();

/**
 * Cria uma cobrança Pix e retorna os dados do QR Code.
 */
export async function createPixPayment(
  txid: string,
  valor: string,
  payer: Payer
): Promise<PixChargeResponse> {
  return pixProvider.create(txid, valor, payer);
}

/**
 * Inicia o monitoramento assíncrono do pagamento do Pix.
 */
export async function monitorPixPayment(txid: string): Promise<void> {
  try {
    const pago = await pixProvider.monitor(txid);

    if (pago) {
      console.log(`✅ Pagamento confirmado para txid: ${txid}`);
      // TODO: atualizar pedido, emitir eventos, notificar sistema, etc.
    } else {
      console.warn(`⚠️ Pagamento não realizado para txid: ${txid}`);
      // TODO: tratar retries, alertas, cancelamentos, etc.
    }
  } catch (err) {
    console.error(`Erro ao monitorar pagamento Pix [${txid}]:`, err);
  }
}

/**
 * Registra o webhook Pix na instituição financeira (se aplicável).
 */
export async function registerPixWebhook(webhookUrl: string): Promise<void> {
  await pixProvider.registerWebhook(webhookUrl);
}
