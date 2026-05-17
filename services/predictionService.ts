import { imageProcessingEndpoints } from '../config/env';
import { imageProcessingClient } from './imageProcessingClient';

export interface PredictionResponse {
  tieneEstrabismo: boolean;
  confianza: number;
}

export const predictStrabismus = async (
  documentoIdentidad: string,
  imageUri: string
): Promise<PredictionResponse> => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'image.jpg',
  } as any);

  return imageProcessingClient<PredictionResponse>(imageProcessingEndpoints.predict(documentoIdentidad), {
    method: 'POST',
    body: formData,
  });
};
