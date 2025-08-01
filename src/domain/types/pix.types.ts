export interface Payer {
  email: string
  name: string;
  cpf: string;
}

export interface PixChargeResponse {
  txid: string;
  qrCode: string;
  imageQrcode: string;
}

export interface PixProvider {
  /**
   * Cria uma cobrança Pix com base no txid, valor e dados do devedor.
   */
  create(txid: string, valor: string, payer: Payer): Promise<PixChargeResponse>;

  /**
   * Monitora uma cobrança Pix até ser paga (ou timeout).
   */
  monitor(txid: string): Promise<boolean>;

  /**
   * Registra o webhook Pix (chamado pela instituição quando há mudança de status).
   */
  registerWebhook(webhookUrl: string): Promise<void>;
}
