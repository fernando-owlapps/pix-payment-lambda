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
      MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
      PIX_PROVIDER: process.env.PIX_PROVIDER || '',
    },
  },

  functions: {
    paymentPix: {
      handler: 'src/handlers/payment/pix/create.handler',
      events: [
        {
          http: {
            path: 'payment/pix',
            method: 'post',
            cors: true,
          },
        },
      ],
    },
    webhookPix: {
      handler: 'src/handlers/payment/pix/webhook.handler',
      events: [
        {
          http: {
            path: 'payment/pix/webhook',
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
