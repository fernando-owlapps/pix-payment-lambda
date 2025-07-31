import dotenv from 'dotenv';
dotenv.config();

import { GerencianetProvider } from '../src/providers/gerencianet/gerencianetProvider';
// Para trocar de provedor, basta importar outro que implemente PixProvider
// import { OutroProvedorPix } from '../src/providers/outroProvedor';

import { PixProvider } from '../src/utils/pixProvider';

// Instancia o provedor atual (aqui Gerencianet)
const pixProvider: PixProvider = new GerencianetProvider();

async function registrarWebhookPix() {
  // Obtém a URL do webhook a partir do .env
  const webhookUrl = process.env.WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('❌ WEBHOOK_URL não definido no arquivo .env');
    process.exit(1);
  }

  try {
    // Chama o método do provider para registrar o webhook
    await pixProvider.registrarWebhook(webhookUrl);
    console.log('✅ Webhook Pix registrado com sucesso.');
  } catch (error: any) {
    console.error('❌ Erro ao registrar webhook Pix:');
    // Caso axios retorne erro estruturado
    console.error(error.response?.data || error.message);
    process.exit(1);
  }
}

// Executa o registro do webhook assim que o script roda
registrarWebhookPix();
