-- ==========================================================
-- VIZANTINO PIEL - MIGRACIÓN DE EVOLUCIÓN TECNOLÓGICA FASE 2 A 5
-- Compatibilidad total con datos y tablas existentes
-- ==========================================================

-- 1. EXTENDER TABLA PRODUCTS CON CAMPOS DE DIMENSIONES Y VARIANTES
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS dimensions JSONB DEFAULT '{"length_cm": 0, "height_cm": 0, "width_cm": 0, "capacity": ""}'::jsonb,
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS related_ids JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 2. TABLA DE TRANSFERENCIAS ENTRE SUCURSALES (LOGÍSTICA INTERNA)
CREATE TABLE IF NOT EXISTS public.inventory_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio TEXT UNIQUE NOT NULL,
    origin_branch TEXT NOT NULL,      -- Independencia, Alfareros, Tonalá
    destination_branch TEXT NOT NULL, -- Independencia, Alfareros, Tonalá
    product_id INTEGER REFERENCES public.products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status TEXT DEFAULT 'En Tránsito' NOT NULL, -- 'En Tránsito', 'Recibido', 'Cancelado'
    responsible TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    received_at TIMESTAMPTZ
);

ALTER TABLE public.inventory_transfers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Control de transferencias" ON public.inventory_transfers;
CREATE POLICY "Control de transferencias" ON public.inventory_transfers FOR ALL USING (true);

-- 3. TABLA DE KITS Y PAQUETES DE REGALO DE TEMPORADA
CREATE TABLE IF NOT EXISTS public.product_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    compare_at_price NUMERIC(10, 2),
    items JSONB NOT NULL, -- [{"product_id": 1, "qty": 1}, ...]
    image TEXT,
    season TEXT, -- 'Día de las Madres', 'Día del Padre', 'Navidad', 'Corporativo'
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.product_kits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública de kits" ON public.product_kits;
CREATE POLICY "Lectura pública de kits" ON public.product_kits FOR ALL USING (true);

-- 4. TABLA DE PROGRAMA DE LEALTAD Y BENEFICIOS (CLIENTES & COLABORADORES)
CREATE TABLE IF NOT EXISTS public.loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id),
    email TEXT UNIQUE NOT NULL,
    account_type TEXT DEFAULT 'cliente' NOT NULL, -- 'cliente', 'colaborador'
    points_balance INTEGER DEFAULT 0 NOT NULL,
    tier TEXT DEFAULT 'Bronce' NOT NULL, -- 'Bronce', 'Plata', 'Oro', 'Colaborador Taller'
    discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso a lealtad" ON public.loyalty_accounts;
CREATE POLICY "Acceso a lealtad" ON public.loyalty_accounts FOR ALL USING (true);

-- 5. TABLA DE CUPONES Y PROMOCIONES CONFIGURABLES
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL, -- 'percentage', 'fixed'
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_amount NUMERIC(10, 2) DEFAULT 0.00,
    min_items_count INTEGER DEFAULT 1,
    max_uses INTEGER,
    times_used INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true NOT NULL,
    valid_from TIMESTAMPTZ DEFAULT now() NOT NULL,
    valid_until TIMESTAMPTZ
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura de promociones" ON public.promotions;
CREATE POLICY "Lectura de promociones" ON public.promotions FOR SELECT USING (true);

-- Insertar cupón de bienvenida inicial oficial
INSERT INTO public.promotions (code, description, discount_type, discount_value, min_order_amount, active)
VALUES ('VIZANTINO10', 'Cupón de bienvenida 10% en tu primera compra en línea', 'percentage', 10.00, 1000.00, true)
ON CONFLICT (code) DO NOTHING;

-- 6. EXTENDER TABLA ORDERS CON FACTURACIÓN Y SEGUIMIENTO
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_carrier TEXT DEFAULT 'DHL Express',
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS billing_data JSONB, -- RFC, Razón Social, Régimen, Uso CFDI
ADD COLUMN IF NOT EXISTS discount_applied NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS promotion_code TEXT;
