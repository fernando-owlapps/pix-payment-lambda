import type { AWS } from '@serverless/typescript';
import * as dotenv from 'dotenv';

// Opcional carregar .env aqui para rodar localmente com serverless-offline
dotenv.config();

const config: AWS = {
  service: 'pix-payment-lambda',
  frameworkVersion: '4',
  plugins: [
    'serverless-offline',
    'serverless-scriptable-plugin',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    environment: {
      WEBHOOK_URL: process.env.WEBHOOK_URL || '',
      MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
    },
  },

  functions: {
    gerarPagamento: {
      handler: 'src/handler.gerarPagamento',
      events: [
        {
          http: {
            path: 'gerar-pix',
            method: 'post',
            cors: true,
          },
        },
      ],
    },
    webhookPix: {
      handler: 'src/handler.webhookPix',
      events: [
        {
          http: {
            path: 'webhook-pix',
            method: 'post',
            cors: true,
          },
        },
      ],
    },
  },

  custom: {
    scriptHooks: {
      'before:deploy:deploy': 'npx ts-node scripts/validate-env.ts',
      'after:deploy:finalize': 'npx ts-node scripts/registrar-webhook.ts',
    },
  },
};

export = config;
