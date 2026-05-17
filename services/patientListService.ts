import { backendEndpoints } from '../config/env';
import { backendClient } from './backendClient';

export interface Paciente {
  id: number;
  nombres: string;
  apellidos: string;
  documentoIdentidad: string;
}

export const getPatientsByResponsible = async (responsibleId: number): Promise<Paciente[]> => {
  return backendClient<Paciente[]>(backendEndpoints.pacientes.byResponsible(responsibleId), {
    auth: true,
  });
};
