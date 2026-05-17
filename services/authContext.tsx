import { jwtDecode } from 'jwt-decode';
import { createContext, useContext, useEffect, useState } from 'react';
import { tokenStorage } from './tokenStorage';

interface UserData {
  id: number;
  correo: string;
  rol: string;
  nombres: string;
  apellidos: string;
  documentoIdentidad: string;
  tipoDocumento: string | null;
  numeroTele?: string;
  // Campos específicos de Responsable
  parentesco?: string;
  ocupacion?: string;
  ciudadResidencia?: string;
  iat?: number;
  exp?: number;
  sub?: string;
}

const isTokenExpired = (decoded: UserData): boolean => {
  if (!decoded.exp) return false;
  return decoded.exp * 1000 < Date.now();
};

interface AuthContextType {
  isAuthenticated: boolean;
  userData: UserData | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    const token = await tokenStorage.getToken();
    if (token) {
      try {
        const decoded = jwtDecode<UserData>(token);
        if (isTokenExpired(decoded)) {
          await logout();
          return;
        }
        setUserData(decoded);
        setIsAuthenticated(true);
      } catch (error) {
        await logout();
      }
    }
  };

  const login = async (token: string) => {
    try {
      const decoded = jwtDecode<UserData>(token);
      if (isTokenExpired(decoded)) {
        throw new Error('El token ha expirado');
      }
      await tokenStorage.setToken(token);
      setUserData(decoded);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await tokenStorage.removeToken();
    setUserData(null);
    setIsAuthenticated(false);
  };

  const updateToken = async (token: string) => {
    try {
      const decoded = jwtDecode<UserData>(token);
      if (isTokenExpired(decoded)) {
        throw new Error('El token ha expirado');
      }
      await tokenStorage.setToken(token);
      setUserData(decoded);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userData, login, logout, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}