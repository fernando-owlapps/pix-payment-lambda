export interface Devedor {
  nome: string;
  cpf: string;
}

export interface CobrancaPixResult {
  txid: string;
  qrCode: string;
  imagemQrcode: string;
}

export interface PixProvider {
  /**
   * Cria uma cobrança Pix com base no txid, valor e dados do devedor.
   */
  criarCobranca(txid: string, valor: string, devedor: Devedor): Promise<CobrancaPixResult>;

  /**
   * Monitora uma cobrança Pix até ser paga (ou timeout).
   */
  monitorarPagamento(txid: string): Promise<boolean>;

  /**
   * Registra o webhook Pix (chamado pela instituição quando há mudança de status).
   */
  registrarWebhook(webhookUrl: string): Promise<void>;
}
