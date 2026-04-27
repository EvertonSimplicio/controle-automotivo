-- SQL para configurar o banco de dados no Supabase

-- 1. Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Veículos
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model TEXT NOT NULL,
  brand TEXT NOT NULL,
  plate TEXT NOT NULL,
  year TEXT,
  initial_odometer NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Usuários (Opcional, se não usar Auth do Supabase)
CREATE TABLE app_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'STANDARD',
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Localizações
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Despesas/Registros
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT NOT NULL,
  odometer NUMERIC NOT NULL,
  odometer_start NUMERIC,
  value NUMERIC NOT NULL,
  location_id UUID REFERENCES locations(id),
  fuel_type TEXT,
  liters NUMERIC,
  description TEXT,
  notes TEXT,
  maintenance_items JSONB,
  rate_per_km NUMERIC,
  status TEXT,
  payment_method TEXT,
  user_id UUID,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Configurar RLS (Row Level Security) - Adicione conforme sua necessidade
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Exemplo: Permitir acesso total para fins de desenvolvimento (CUIDADO EM PRODUÇÃO)
CREATE POLICY "Acesso total" ON vehicles FOR ALL USING (true);
CREATE POLICY "Acesso total" ON app_users FOR ALL USING (true);
CREATE POLICY "Acesso total" ON locations FOR ALL USING (true);
CREATE POLICY "Acesso total" ON expenses FOR ALL USING (true);
