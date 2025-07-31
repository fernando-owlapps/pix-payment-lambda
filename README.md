# Payment Pix

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
