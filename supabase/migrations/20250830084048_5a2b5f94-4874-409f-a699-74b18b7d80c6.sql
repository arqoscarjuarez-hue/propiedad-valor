-- Crear tabla para propiedades comparables
CREATE TABLE public.property_comparables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  property_type TEXT NOT NULL,
  total_area DECIMAL(10,2) NOT NULL,
  land_area DECIMAL(10,2),
  apartment_area DECIMAL(10,2),
  construction_area DECIMAL(10,2),
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  age_years INTEGER DEFAULT 0,
  location_type TEXT,
  price_usd DECIMAL(15,2) NOT NULL,
  price_per_sqm_usd DECIMAL(10,2) NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Mexico',
  sale_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índices para mejorar las búsquedas
CREATE INDEX idx_property_comparables_type ON public.property_comparables(property_type);
CREATE INDEX idx_property_comparables_area ON public.property_comparables(total_area);
CREATE INDEX idx_property_comparables_location ON public.property_comparables(latitude, longitude);
CREATE INDEX idx_property_comparables_price_per_sqm ON public.property_comparables(price_per_sqm_usd);

-- Habilitar Row Level Security
ALTER TABLE public.property_comparables ENABLE ROW LEVEL SECURITY;

-- Crear política para que todos puedan ver los comparables (datos públicos)
CREATE POLICY "Anyone can view property comparables" 
ON public.property_comparables 
FOR SELECT 
USING (true);

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_property_comparables_updated_at
BEFORE UPDATE ON public.property_comparables
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar algunos datos de ejemplo
INSERT INTO public.property_comparables (
  address, property_type, total_area, construction_area, land_area, apartment_area,
  bedrooms, bathrooms, age_years, location_type, price_usd, price_per_sqm_usd,
  latitude, longitude, city, state
) VALUES 
-- Casas
('Av. Reforma 123, Col. Centro', 'casa', 150, 120, 200, NULL, 3, 2, 5, 'urbana', 350000, 2333.33, 19.4326, -99.1332, 'Ciudad de México', 'CDMX'),
('Calle Insurgentes 456, Col. Roma', 'casa', 180, 150, 250, NULL, 4, 3, 8, 'urbana', 420000, 2333.33, 19.4200, -99.1500, 'Ciudad de México', 'CDMX'),
('Av. Universidad 789, Col. Del Valle', 'casa', 200, 160, 300, NULL, 4, 3, 3, 'urbana', 500000, 2500, 19.3800, -99.1800, 'Ciudad de México', 'CDMX'),
('Calle Polanco 321, Col. Polanco', 'casa', 250, 200, 350, NULL, 5, 4, 2, 'urbana', 750000, 3000, 19.4350, -99.1900, 'Ciudad de México', 'CDMX'),
('Av. Satélite 654, Ciudad Satélite', 'casa', 170, 140, 280, NULL, 3, 2, 10, 'suburbana', 380000, 2235.29, 19.5100, -99.2400, 'Naucalpan', 'Estado de México'),

-- Apartamentos
('Torre Reforma Piso 15, Col. Juárez', 'apartamento', 85, NULL, NULL, 85, 2, 2, 3, 'urbana', 280000, 3294.12, 19.4300, -99.1400, 'Ciudad de México', 'CDMX'),
('Edificio Roma Norte Piso 8', 'apartamento', 95, NULL, NULL, 95, 2, 2, 5, 'urbana', 320000, 3368.42, 19.4150, -99.1600, 'Ciudad de México', 'CDMX'),
('Condominio Polanco Piso 12', 'apartamento', 110, NULL, NULL, 110, 3, 2, 1, 'urbana', 450000, 4090.91, 19.4400, -99.1950, 'Ciudad de México', 'CDMX'),
('Torre Condesa Piso 6', 'apartamento', 75, NULL, NULL, 75, 1, 1, 7, 'urbana', 250000, 3333.33, 19.4100, -99.1700, 'Ciudad de México', 'CDMX'),
('Residencial Santa Fe Piso 20', 'apartamento', 120, NULL, NULL, 120, 3, 3, 2, 'urbana', 500000, 4166.67, 19.3600, -99.2600, 'Ciudad de México', 'CDMX'),

-- Terrenos
('Lote Residencial Bosques', 'terreno', 300, NULL, 300, NULL, 0, 0, 0, 'suburbana', 180000, 600, 19.4000, -99.2000, 'Ciudad de México', 'CDMX'),
('Terreno Industrial Tlalnepantla', 'terreno', 500, NULL, 500, NULL, 0, 0, 0, 'suburbana', 350000, 700, 19.5400, -99.1950, 'Tlalnepantla', 'Estado de México'),
('Lote Comercial Interlomas', 'terreno', 400, NULL, 400, NULL, 0, 0, 0, 'suburbana', 400000, 1000, 19.4200, -99.2800, 'Huixquilucan', 'Estado de México'),

-- Comerciales
('Local Plaza Comercial Centro', 'comercial', 80, 80, NULL, NULL, 0, 1, 5, 'urbana', 300000, 3750, 19.4300, -99.1300, 'Ciudad de México', 'CDMX'),
('Oficina Torre Corporativa', 'comercial', 120, 120, NULL, NULL, 0, 2, 3, 'urbana', 480000, 4000, 19.4250, -99.1450, 'Ciudad de México', 'CDMX'),
('Local Comercial Av. Principal', 'comercial', 150, 150, NULL, NULL, 0, 2, 8, 'urbana', 600000, 4000, 19.4100, -99.1600, 'Ciudad de México', 'CDMX');