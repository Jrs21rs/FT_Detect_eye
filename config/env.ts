type Profile = 'development' | 'staging' | 'production';

interface AppConfig {
  backendBaseUrl: string;
  imageProcessingBaseUrl: string;
  apiTimeout: number;
  enableLogging: boolean;
  enableDebugMode: boolean;
}

const profiles: Record<Profile, AppConfig> = {
  development: {
    backendBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    imageProcessingBaseUrl: process.env.EXPO_PUBLIC_IMAGE_PROCESSING_API_URL || 'http://localhost:8000',
    apiTimeout: 30000,
    enableLogging: true,
    enableDebugMode: true,
  },
  staging: {
    backendBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://staging-api.example.com',
    imageProcessingBaseUrl: process.env.EXPO_PUBLIC_IMAGE_PROCESSING_API_URL || 'https://staging-image.example.com',
    apiTimeout: 20000,
    enableLogging: true,
    enableDebugMode: false,
  },
  production: {
    backendBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://reconocimiento-estrabismo.onrender.com',
    imageProcessingBaseUrl: process.env.EXPO_PUBLIC_IMAGE_PROCESSING_API_URL || 'https://fastapi-tppn.onrender.com',
    apiTimeout: 15000,
    enableLogging: false,
    enableDebugMode: false,
  },
};

const currentProfile: Profile = (process.env.EXPO_PUBLIC_PROFILE as Profile) || 'development';

// Log temporal para depuración
console.log('EXPO_PUBLIC_PROFILE:', process.env.EXPO_PUBLIC_PROFILE);
console.log('currentProfile:', currentProfile);

export const env = profiles[currentProfile];

export const profile = {
  current: currentProfile,
  isDevelopment: currentProfile === 'development',
  isStaging: currentProfile === 'staging',
  isProduction: currentProfile === 'production',
};

export const backendEndpoints = {
  auth: {
    login: '/auth/login',
    registerResponsible: '/auth/register/responsable',
    registerPatient: '/auth/register/paciente',
  },
  responsables: {
    update: '/api/responsables/Update',
  },
  pacientes: {
    byResponsible: (responsibleId: number) => `/api/pacientes/responsable/${responsibleId}`,
  },
};

export const imageProcessingEndpoints = {
  predict: (documentoIdentidad: string) => `/predict/${documentoIdentidad}`,
};

