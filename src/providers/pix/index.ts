import { PixProvider } from "domain/types/pix.types";
import { GerencianetProvider } from "providers/gerencianet";
import { MercadoPagoProvider } from "providers/mercadopago";

export function getPixProvider(): PixProvider {
  const provider = process.env.PIX_PROVIDER || 'mercadopago';

  switch (provider.toLowerCase()) {
    case 'mercadopago':
      return new MercadoPagoProvider();
    case 'gerencianet':
      return new GerencianetProvider();
    default:
      throw new Error(`Provedor Pix não suportado: ${provider}`);
  }
}