import * as SecureStore from 'expo-secure-store';
import { UpdateResponsableData, updateResponsableProfile } from '../updateProfileService';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock global fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('updateProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('updateResponsableProfile', () => {
    const mockUserData: UpdateResponsableData = {
      nombres: 'Juan',
      apellidos: 'Pérez',
      numeroTele: '1234567890'
    };

    it('debe actualizar el perfil exitosamente con token', async () => {
      // Arrange
      const mockToken = 'mock-jwt-token';
      const mockResponse = {
        token: mockToken,
      };

      mockSecureStore.getItemAsync.mockResolvedValueOnce(mockToken);
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Act
      const result = await updateResponsableProfile(mockUserData);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('userToken');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1]?.method).toBe('PUT');
      expect(callArgs[1]?.headers).toMatchObject({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      });
    });

    it('debe retornar error cuando no hay token disponible', async () => {
      // Arrange
      mockSecureStore.getItemAsync.mockResolvedValueOnce(null);

      // Act
      const result = await updateResponsableProfile(mockUserData);

      // Assert
      expect(result).toHaveProperty('error');
      expect(result.error).toBe('No hay sesión activa');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('debe enviar los datos correctos en el body de la petición', async () => {
      // Arrange
      const mockToken = 'mock-token';
      const mockResponse = { token: 'new-token' };

      mockSecureStore.getItemAsync.mockResolvedValueOnce(mockToken);
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Act
      await updateResponsableProfile(mockUserData);

      // Assert
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body).toMatchObject(mockUserData);
      expect(body.nombres).toBe(mockUserData.nombres);
      expect(body.apellidos).toBe(mockUserData.apellidos);
      expect(body.numeroTele).toBe(mockUserData.numeroTele);
    });

    it('debe retornar error cuando el servidor responde con error', async () => {
      // Arrange
      const mockToken = 'mock-token';
      const errorResponse = {
        error: 'Error al actualizar el perfil'
      };

      mockSecureStore.getItemAsync.mockResolvedValueOnce(mockToken);
      mockFetch.mockResolvedValueOnce({
        status: 400,
        ok: false,
        json: async () => errorResponse,
      } as Response);

      // Act
      const result = await updateResponsableProfile(mockUserData);

      // Assert
      expect(result).toHaveProperty('error');
      expect(result.error).toBe('Error al actualizar el perfil');
    });

    it('debe retornar error genérico cuando no hay mensaje en la respuesta', async () => {
      // Arrange
      const mockToken = 'mock-token';

      mockSecureStore.getItemAsync.mockResolvedValueOnce(mockToken);
      mockFetch.mockResolvedValueOnce({
        status: 500,
        ok: false,
        json: async () => ({}),
      } as Response);

      // Act
      const result = await updateResponsableProfile(mockUserData);

      // Assert
      expect(result).toHaveProperty('error');
      expect(result.error).toBe('Error al actualizar el perfil');
    });

    it('debe manejar errores de conexión', async () => {
      // Arrange
      const mockToken = 'mock-token';
      const connectionError = new Error('Network error');

      mockSecureStore.getItemAsync.mockResolvedValueOnce(mockToken);
      mockFetch.mockRejectedValueOnce(connectionError);

      // Act
      const result = await updateResponsableProfile(mockUserData);

      // Assert
      expect(result).toHaveProperty('error');
      expect(result.error).toBe('Error al conectar con el servidor');
    });

    it('debe manejar errores al obtener el token de SecureStore', async () => {
      // Arrange
      const storageError = new Error('Storage error');

      mockSecureStore.getItemAsync.mockRejectedValueOnce(storageError);
      
      // Act
      const result = await updateResponsableProfile(mockUserData);

      // Assert
      expect(result).toHaveProperty('error');
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('userToken');
    });

    it('debe configurar los headers correctamente con token', async () => {
      // Arrange
      const mockToken = 'bearer-token-123';
      const mockResponse = { token: 'new-token' };

      mockSecureStore.getItemAsync.mockResolvedValueOnce(mockToken);
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Act
      await updateResponsableProfile(mockUserData);

      // Assert
      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[1]?.headers).toMatchObject({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      });
    });

    it('debe manejar diferentes valores opcionales', async () => {
      // Arrange
      const testCases: UpdateResponsableData[] = [
        { nombres: 'Juan', apellidos: 'Pérez' },
        { nombres: 'Juan', apellidos: 'Pérez', numeroTele: '1234567890' },
        { nombres: 'Juan', apellidos: 'Pérez', parentesco: 'Padre' },
        { nombres: 'Juan', apellidos: 'Pérez', ocupacion: 'Médico', ciudadResidencia: 'Bogotá' },
      ];
      const mockToken = 'mock-token';
      const mockResponse = { token: 'new-token' };

      for (const userData of testCases) {
        mockSecureStore.getItemAsync.mockResolvedValueOnce(mockToken);
        mockFetch.mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: async () => mockResponse,
        } as Response);

        // Act
        await updateResponsableProfile(userData);

        // Assert
        const callArgs = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
        const body = JSON.parse(callArgs[1]?.body as string);
        expect(body.nombres).toBe(userData.nombres);
        expect(body.apellidos).toBe(userData.apellidos);
      }
    });

    it('debe manejar strings vacíos en campos opcionales', async () => {
      // Arrange
      const userDataWithEmptyFields: UpdateResponsableData = {
        nombres: 'Juan',
        apellidos: 'Pérez',
        numeroTele: '',
        parentesco: '',
        ocupacion: '',
        ciudadResidencia: ''
      };
      const mockToken = 'mock-token';
      const mockResponse = { token: 'new-token' };

      mockSecureStore.getItemAsync.mockResolvedValueOnce(mockToken);
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Act
      await updateResponsableProfile(userDataWithEmptyFields);

      // Assert
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.numeroTele).toBe('');
      expect(body.parentesco).toBe('');
      expect(body.ocupacion).toBe('');
      expect(body.ciudadResidencia).toBe('');
    });
  });
});

