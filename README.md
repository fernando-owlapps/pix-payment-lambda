# Payment Pix

### Observações

src/
├── handlers/
│   └── payment/
│       ├── pix/
│       │   ├── create.ts              # POST /payment/pix — cria cobrança Pix
│       │   └── webhook.ts             # POST /payment/pix/webhook — webhook Pix
│       ├── card/
│       │   ├── create.ts              # POST /payment/card — cria cobrança cartão
│       │   └── webhook.ts             # POST /payment/card/webhook — webhook cartão
│       ├── crypto/
│       │   ├── create.ts              # POST /payment/crypto — cria cobrança cripto
│       │   └── webhook.ts             # POST /payment/crypto/webhook — webhook cripto
│       └── ...
│
├── services/
│   └── payment/
│       ├── pix.service.ts             # Lógica de negócio Pix
│       ├── card.service.ts            # Lógica de negócio cartão
│       └── crypto.service.ts          # Lógica de negócio cripto
│
├── providers/
│   ├── auth/
│   │   ├── gerencianet-token.provider.ts     # Implementação OAuth Gerencianet
│   │   ├── mercadopago-token.provider.ts     # Implementação OAuth MercadoPago
│   │   └── index.ts                          # export { MercadoPagoTokenProvider, ... }
│
│   ├── pix/
│   │   └── index.ts                   # getPixProvider() orquestrador
│   │                                 # export { MercadoPagoProvider, GerencianetProvider }
│
│   ├── gerencianet/
│   │   ├── gerencianet.provider.ts   # Implementação PixProvider
│   │   └── index.ts
│
│   ├── mercadopago/
│   │   ├── mercadopago.provider.ts   # Implementação PixProvider
│   │   └── index.ts
│   └── ...
│
├── domain/
│   ├── types/
│   │   ├── pix.types.ts              # Interfaces: Payer, PixCharge, PixProvider
│   │   ├── card.types.ts             # Tipos para cartão
│   │   ├── crypto.types.ts           # Tipos para cripto
│   │   ├── common.types.ts           # PaymentStatus, PaymentMethod, etc.
│   │   └── oauth.types.ts            # interface OAuthTokenProvider
│
└── utils/
    └── helpers.ts                    # Funções utilitárias (formatação, validação, etc.)


## Scripts disponíveis

- `build`  
  Compila o TypeScript para JavaScript na pasta `dist`.

- `start`  
  Roda a aplicação localmente usando `ts-node` (ideal para debug rápido).

- `offline`  
  Executa o Serverless Offline para testar APIs localmente.

- `deploy`  
  Realiza o deploy da aplicação na AWS via Serverless Framework.

- `remove`  
  Remove o deploy da AWS.

- `type-check`  
  Verifica os tipos do TypeScript sem compilar (rápido).

---

### Observações

- A entrada principal após build é o arquivo `dist/index.js`.
- Utilize os scripts para facilitar o fluxo de desenvolvimento, teste e deploy.



