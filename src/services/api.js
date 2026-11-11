import { sampleCanesData } from '../data/sampleData';

// Normalizar la URL de la API (soporta con o sin /api/v1 al final)
const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim().replace(/\/+$/, '');
const BASE_URL = rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl}/api/v1`;

export const solveSimplex = async (payload) => {
  try {
    const response = await fetch(`${BASE_URL}/simplex/solve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error en la solicitud: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error solveSimplex:', error);
    throw error;
  }
};

export const getSampleCanes = async () => {
  try {
    const response = await fetch(`${BASE_URL}/simplex/sample-canes`);
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn('Backend sample not reachable, using bundled sample data:', e);
  }
  return sampleCanesData;
};
