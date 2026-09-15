'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}

interface LoginLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface LoginLocationResult {
  location: LoginLocation | null;
  error?: string;
}

interface LoginResult {
  success: boolean;
  error?: string;
  locationRequired?: boolean;
}

const LOCATION_REQUIRED_ERROR = '📍 Por seguridad, debes activar y permitir la ubicación precisa para usar YZ DIGITAL.';

function getLoginLocation(): Promise<LoginLocationResult> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve({
      location: null,
      error: `${LOCATION_REQUIRED_ERROR} Este dispositivo o navegador no permite obtenerla.`,
    });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (coords.accuracy > 500) {
          resolve({
            location: null,
            error: `${LOCATION_REQUIRED_ERROR} Activa la opción “Ubicación precisa” e inténtalo nuevamente.`,
          });
          return;
        }

        resolve({
          location: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
          },
        });
      },
      (error) => {
        const detail = error.code === error.PERMISSION_DENIED
          ? 'Pulsa “Volver a pedir ubicación”. Si el permiso quedó bloqueado, abre el candado de la barra del navegador, cambia Ubicación a “Permitir” y vuelve a intentarlo.'
          : error.code === error.TIMEOUT
          ? 'No pudimos obtener el GPS a tiempo. Verifica que esté encendido e inténtalo nuevamente.'
          : 'Enciende el GPS y activa la ubicación precisa antes de volver a intentarlo.';
        resolve({ location: null, error: `${LOCATION_REQUIRED_ERROR} ${detail}` });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 12000,
      }
    );
  });
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    try {
      const locationResult = await getLoginLocation();
      if (!locationResult.location) {
        setLoading(false);
        return {
          success: false,
          error: locationResult.error || LOCATION_REQUIRED_ERROR,
          locationRequired: true,
        };
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, location: locationResult.location }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        return { success: false, error: data.error || 'Error al iniciar sesión' };
      }

      setUser(data.user);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Error de conexión' };
    }
  };

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      router.push('/login');
      router.refresh();
    }
  }, [router]);

  // Cierre por inactividad exclusivamente para mayoristas.
  useEffect(() => {
    if (!user || user.role !== 'WHOLESALER') return;

    const timeoutMs = 30 * 60 * 1000;
    const pingIntervalMs = 60 * 1000;
    let lastInteractionAt = Date.now();
    let lastPingAt = 0;
    let logoutStarted = false;

    const sendPing = async () => {
      if (logoutStarted) return;
      lastPingAt = Date.now();
      try {
        const response = await fetch('/api/auth/heartbeat', { method: 'POST' });
        if (response.status === 401 && !logoutStarted) {
          logoutStarted = true;
          await logout();
        }
      } catch {
        // Un corte de red no cierra la sesión por sí solo; el siguiente pulso reintenta.
      }
    };

    const recordInteraction = () => {
      lastInteractionAt = Date.now();
      if (lastInteractionAt - lastPingAt >= pingIntervalMs) void sendPing();
    };

    const checkIdle = () => {
      if (Date.now() - lastInteractionAt >= timeoutMs && !logoutStarted) {
        logoutStarted = true;
        void logout();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        recordInteraction();
        checkIdle();
      }
    };

    void sendPing();
    const interval = window.setInterval(checkIdle, 15 * 1000);
    window.addEventListener('pointerdown', recordInteraction, { passive: true });
    window.addEventListener('keydown', recordInteraction, { passive: true });
    window.addEventListener('touchstart', recordInteraction, { passive: true });
    window.addEventListener('scroll', recordInteraction, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('pointerdown', recordInteraction);
      window.removeEventListener('keydown', recordInteraction);
      window.removeEventListener('touchstart', recordInteraction);
      window.removeEventListener('scroll', recordInteraction);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, logout]);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
