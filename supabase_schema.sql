-- ==========================================================
-- ESQUEMA DE BASE DE DATOS PARA VIZANTINO PIEL (SUPABASE / POSTGRESQL)
-- 100% Compatible con el editor SQL de Supabase
-- ==========================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE CLIENTES
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    city TEXT,
    address TEXT,
    password_hash TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilitar RLS en customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de clientes propios" ON public.customers;
CREATE POLICY "Lectura pública de clientes propios" ON public.customers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inserción pública para registro de clientes" ON public.customers;
CREATE POLICY "Inserción pública para registro de clientes" ON public.customers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Actualización de datos por el propio cliente" ON public.customers;
CREATE POLICY "Actualización de datos por el propio cliente" ON public.customers FOR UPDATE USING (true);


-- 3. TABLA DE PRODUCTOS (CATÁLOGO E INVENTARIO MULTI-SUCURSAL)
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    sku TEXT UNIQUE,
    barcode TEXT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0 NOT NULL,
    stock_independencia INTEGER DEFAULT 0,
    stock_alfareros INTEGER DEFAULT 0,
    stock_tonala INTEGER DEFAULT 0,
    image TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilitar RLS en products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de productos activos" ON public.products;
CREATE POLICY "Lectura pública de productos activos" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Control administrativo de productos" ON public.products;
CREATE POLICY "Control administrativo de productos" ON public.products FOR ALL USING (true);


-- 4. INSERTAR LOS 11 PRODUCTOS OFICIALES DE VIZANTINO PIEL
INSERT INTO public.products (id, sku, name, category, price, stock, stock_independencia, stock_alfareros, stock_tonala, image, description)
VALUES 
(1, 'VZ-BOL-001', 'Bolso calidad élite', 'Bolsos', 3000.00, 8, 3, 3, 2, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80', 'Bolso confeccionado con cuero vacuno premium de textura suave y durabilidad excepcional. Herrajes dorados inoxidables y compartimentos interiores reforzados.'),
(2, 'VZ-BOL-002', 'Bolsa Cherry Vizantino', 'Bolsos', 3000.00, 5, 2, 2, 1, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', 'Diseño exclusivo en tonalidad cereza profunda con pátina satinada. Silueta sofisticada perfecta para ocasiones de gala o uso ejecutivo de distinción.'),
(3, 'VZ-CAR-001', 'Tarjetero de piel corte vacuno', 'Carteras', 280.00, 25, 10, 10, 5, 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80', 'Minimalismo absoluto. Capacidad para 6 tarjetas y compartimento central con acabados de corte y pulido a mano por artesanos jaliscienses.'),
(4, 'VZ-CAR-002', 'Cartera Slim piel corte vacuno', 'Carteras', 300.00, 18, 7, 7, 4, 'https://images.unsplash.com/photo-1606503829007-885ceb5a86a0?auto=format&fit=crop&w=800&q=80', 'Perfil ultradelgado que no abulta los bolsillos. Piel auténtica curtida al natural que adquiere una textura única y envejecimiento noble con el uso.'),
(5, 'VZ-CAR-003', 'Cartera Slim large piel corte vacuno', 'Carteras', 400.00, 12, 5, 5, 2, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80', 'Espacio optimizado de mayor longitud para billetes extendidos, cheques y hasta 10 tarjetas con costura al tono de hilo encerado de alta resistencia.'),
(6, 'VZ-CAR-004', 'Tarjetero con apartado para billete', 'Carteras', 350.00, 20, 8, 8, 4, 'https://images.unsplash.com/photo-1563903530908-afdd155d057a?auto=format&fit=crop&w=800&q=80', 'La comodidad de un tarjetero ligero fusionada con ranura de acceso inmediato para billetes doblados. Funcionalidad moderna en piel pura.'),
(7, 'VZ-CAR-005', 'Carteras piel corte vacuno', 'Carteras', 300.00, 15, 6, 6, 3, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80', 'Billetera tradicional bifold con doble compartimento para divisas y ranuras ergonómicas. Sello de garantía de autenticidad Vizantino grabado al calor.'),
(8, 'VZ-CAR-006', 'Cartera en piel exótica', 'Carteras', 350.00, 10, 4, 4, 2, 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=800&q=80', 'Grabado en relieve con acabado exótico tipo reptil sobre base de piel genuina de vacuno. Textura distinguida que proyecta lujo contemporáneo.'),
(9, 'VZ-CAR-007', 'Tarjetero en pieles exóticas', 'Carteras', 500.00, 8, 3, 3, 2, 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80', 'Edición limitada para coleccionistas. Piel grabada de textura exótica con brillo satinado de alta durabilidad y tacto inigualable.'),
(10, 'VZ-CRO-001', 'Crossbody Piel Genuina', 'Crossbody', 1800.00, 6, 2, 2, 2, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80', 'Bolso cruzado ergonómico con correa ajustable confeccionada en doble piel. Cierres metálicos de suave deslizamiento y forro interno resistente.'),
(11, 'VZ-MOC-001', 'Mochila Piel Corte Vacuno', 'Mochilas', 2200.00, 4, 2, 1, 1, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', 'Mochila estructurada en cuero vacuno grueso pero flexible. Compartimento acolchado para dispositivos y tirantes ergonómicos.')
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock;


-- 5. TABLA DE PEDIDOS / ÓRDENES (E-COMMERCE & POS)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_city TEXT,
    customer_address TEXT,
    items JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping_cost NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    customization TEXT,
    status TEXT DEFAULT 'En Preparación' NOT NULL,
    channel TEXT DEFAULT 'ONLINE' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilitar RLS en orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura de órdenes por cliente o admin" ON public.orders;
CREATE POLICY "Lectura de órdenes por cliente o admin" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Creación de nuevas órdenes" ON public.orders;
CREATE POLICY "Creación de nuevas órdenes" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Actualización de estatus de órdenes" ON public.orders;
CREATE POLICY "Actualización de estatus de órdenes" ON public.orders FOR UPDATE USING (true);


-- 6. TABLA DE ADMINISTRADORES
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT DEFAULT 'Administrador General Vizantino',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura interna administradores" ON public.admin_users;
CREATE POLICY "Lectura interna administradores" ON public.admin_users FOR SELECT USING (true);

-- Insertar el Administrador Maestro Oficial
INSERT INTO public.admin_users (email, password_hash, name)
VALUES ('admin@vizantino.com', 'VizantinoAdmin2026', 'Administrador General Vizantino')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
