/**
 * Utilidades para manejo de geolocalización
 */

export interface Location {
  lat: number;
  lng: number;
}

/**
 * Obtiene la ubicación actual del usuario
 */
export const getUserLocation = (): Promise<Location> => {
  return new Promise((resolve) => {
    console.log('Iniciando detección de ubicación...');
    
    if (!navigator.geolocation) {
      console.log('Geolocalización no disponible');
      resolve({ lat: 19.4326, lng: -99.1332 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log('Ubicación detectada:', lat, lng);
        resolve({ lat, lng });
      },
      (error) => {
        console.log('Error obteniendo ubicación:', error);
        resolve({ lat: 19.4326, lng: -99.1332 });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Calcula la distancia entre dos puntos geográficos
 */
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};