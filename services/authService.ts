
import { backendEndpoints } from '../config/env';
import { backendClient } from './backendClient';

interface LoginResponse {
  token?: string;
  error?: string;
  success?: boolean;
}

export const loginUser = async (correo: string, password: string): Promise<LoginResponse> => {
  try {
    return await backendClient<LoginResponse>(backendEndpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify({ correo, password }),
    });
  } catch (error) {
    return { error: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}` };
  }
};
