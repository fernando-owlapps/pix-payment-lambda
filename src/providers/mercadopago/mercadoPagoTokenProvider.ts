// providers/mercadoPagoTokenProvider.ts
import { OAuthTokenProvider } from "../oauthTokenProvider";

export class MercadoPagoTokenProvider implements OAuthTokenProvider {
  private accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN!;

  async getToken(): Promise<string> {
    if (!this.accessToken) {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN não está definido no .env");
    }
    return this.accessToken;
  }

  async invalidateTokenCache(): Promise<void> {
    // Não faz nada, token Mercado Pago não expira automaticamente
    console.log("Invalidate token não aplicável para Mercado Pago");
  }
}
