// providers/gerencianetTokenProvider.ts
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import axios from "axios";
import fs from "fs";
import https from "https";
import { OAuthTokenProvider } from "../oauthTokenProvider";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME!;
const CACHE_KEY = "oauth_token";

export class GerencianetTokenProvider implements OAuthTokenProvider {
  private ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

  // Agente HTTPS com certificado e chave para comunicação segura
  private agent = new https.Agent({
    cert: fs.readFileSync(process.env.CERT_PATH!),
    key: fs.readFileSync(process.env.KEY_PATH!),
  });

  // Busca token diretamente na API da Gerencianet
  private async fetchTokenFromApi(): Promise<{ access_token: string; expires_in: number }> {
    const response = await axios.post(
      "https://api-pix.gerencianet.com.br/oauth/token",
      "grant_type=client_credentials",
      {
        auth: {
          username: process.env.CLIENT_ID!,
          password: process.env.CLIENT_SECRET!,
        },
        httpsAgent: this.agent,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    return response.data;
  }

  // Retorna token válido, lendo do cache (DynamoDB) ou buscando na API se necessário
  async getToken(): Promise<string> {
    const now = Date.now();

    try {
      const getItemCmd = new GetItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({ id: CACHE_KEY }),
      });
      const data = await this.ddbClient.send(getItemCmd);

      if (data.Item) {
        const item = unmarshall(data.Item);
        // Retorna token se ainda não expirou
        if (item.expiresAt && item.expiresAt > now) {
          return item.token;
        }
      }
    } catch (error) {
      console.warn("Falha ao ler token do DynamoDB:", error);
    }

    // Se cache inválido ou não encontrado, busca novo token na API
    const { access_token, expires_in } = await this.fetchTokenFromApi();

    try {
      const putItemCmd = new PutItemCommand({
        TableName: TABLE_NAME,
        Item: marshall({
          id: CACHE_KEY,
          token: access_token,
          // Armazena expiracão com 30 segundos de folga para segurança
          expiresAt: now + expires_in * 1000 - 30000,
        }),
      });
      await this.ddbClient.send(putItemCmd);
    } catch (error) {
      console.warn("Falha ao gravar token no DynamoDB:", error);
    }

    return access_token;
  }

  // Método para invalidar cache manualmente, removendo o token do DynamoDB
  async invalidateTokenCache(): Promise<void> {
    try {
      const deleteCmd = new DeleteItemCommand({
        TableName: TABLE_NAME,
        Key: marshall({ id: CACHE_KEY }),
      });
      await this.ddbClient.send(deleteCmd);
      console.log("Cache do token OAuth invalidado no DynamoDB");
    } catch (error) {
      console.error("Erro ao invalidar token no DynamoDB:", error);
    }
  }
}
