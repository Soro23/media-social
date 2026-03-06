import { cookies } from 'next/headers';
import { Client, Account, Databases, Users } from 'node-appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, SESSION_COOKIE } from './config';

/**
 * Cliente de sesión: actúa en nombre del usuario autenticado.
 * Usa la cookie de sesión almacenada tras el login.
 */
export async function createSessionClient() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

  if (session) {
    client.setSession(session);
  }

  return {
    account: new Account(client),
    databases: new Databases(client),
  };
}

/**
 * Cliente de administrador: usa la API Key con permisos completos.
 * Solo para operaciones de servidor (nunca exponer al cliente).
 */
export function createAdminClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY!);

  return {
    account: new Account(client),
    databases: new Databases(client),
    users: new Users(client),
  };
}
