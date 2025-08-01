// especifico para gerencianet
// const requiredVars = [
//   'CLIENT_ID',
//   'CLIENT_SECRET',
//   'CERT_PATH',
//   'KEY_PATH',
//   'WEBHOOK_URL',
//   'DYNAMODB_TABLE_NAME',
//   'AWS_REGION',
// ];

const requiredVars = [
  'WEBHOOK_URL',
  'DYNAMODB_TABLE_NAME',
  'AWS_REGION',
];

function checkEnv() {
  const missingVars = requiredVars.filter((v) => !process.env[v]);

  if (missingVars.length > 0) {
    console.error('❌ Variáveis de ambiente faltando:', missingVars.join(', '));
    process.exit(1);
  } else {
    console.log('✅ Todas variáveis de ambiente necessárias estão definidas.');
  }
}

checkEnv();
