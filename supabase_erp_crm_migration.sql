-- ==============================================================================
-- VIZANTINO PIEL — MIGRACIÓN OFICIAL ERP + CRM + E-COMMERCE INTEGRADO
-- Compatible con PostgreSQL 14+ y Supabase SQL Editor
-- Totalmente aditivo: No altera ni elimina tablas existentes
-- ==============================================================================

-- 1. EXTENSIÓN UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- FASE 2: MÓDULO CRM (CLIENTES PARTICULARES Y EMPRESAS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_type TEXT DEFAULT 'PARTICULAR' NOT NULL CHECK (customer_type IN ('PARTICULAR', 'EMPRESA')),
    full_name TEXT NOT NULL,
    business_name TEXT, -- Razón Social (para empresas o clientes con requerimiento comercial)
    rfc TEXT,           -- Registro Federal de Contribuyentes (opcional)
    tax_regime TEXT,    -- Régimen fiscal informativo
    cfdi_use TEXT,      -- Uso preferente
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    billing_address JSONB DEFAULT '{"street": "", "exterior": "", "interior": "", "colony": "", "zip": "", "city": "", "state": "Jalisco", "country": "México"}'::jsonb,
    shipping_address JSONB DEFAULT '{"street": "", "exterior": "", "interior": "", "colony": "", "zip": "", "city": "", "state": "Jalisco", "country": "México"}'::jsonb,
    credit_limit NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    current_balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL, -- Saldo adeudado
    total_purchased NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    internal_notes TEXT,
    status TEXT DEFAULT 'ACTIVO' NOT NULL CHECK (status IN ('ACTIVO', 'INACTIVO', 'PROSPECTO', 'BLOQUEADO')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.crm_customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso completo a crm_customers" ON public.crm_customers;
CREATE POLICY "Acceso completo a crm_customers" ON public.crm_customers FOR ALL USING (true);

-- ==============================================================================
-- FASE 3: MÓDULO DE PROVEEDORES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    commercial_name TEXT,
    contact_name TEXT,
    rfc TEXT,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    address TEXT,
    payment_terms TEXT DEFAULT 'Contado' NOT NULL, -- 'Contado', '15 Días', '30 Días', '45 Días'
    lead_time_days INTEGER DEFAULT 7,              -- Plazo promedio de entrega
    bank_details JSONB DEFAULT '{"bank": "", "clabe": "", "account": "", "beneficiary": ""}'::jsonb,
    supplied_categories JSONB DEFAULT '["Piel Vacuno", "Herrajes", "Forros", "Cierres", "Hilo Encerado"]'::jsonb,
    current_balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL, -- Cuentas por pagar pendientes
    rating NUMERIC(3, 1) DEFAULT 5.0,
    internal_notes TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso completo a suppliers" ON public.suppliers;
CREATE POLICY "Acceso completo a suppliers" ON public.suppliers FOR ALL USING (true);

-- ==============================================================================
-- FASE 4: INVENTARIO AVANZADO & KARDEX DE MOVIMIENTOS
-- ==============================================================================
-- Kardex para auditoría y rastreo transaccional de cada movimiento
CREATE TABLE IF NOT EXISTS public.inventory_kardex (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio TEXT NOT NULL,
    product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    branch TEXT NOT NULL DEFAULT 'Independencia', -- 'Independencia', 'Alfareros', 'Tonalá', 'Almacén Central'
    movement_type TEXT NOT NULL CHECK (movement_type IN ('ENTRADA_COMPRA', 'SALIDA_VENTA', 'TRASPASO_SALIDA', 'TRASPASO_ENTRADA', 'AJUSTE_POSITIVO', 'AJUSTE_MERMA', 'DEVOLUCION_CLIENTE')),
    quantity_in INTEGER DEFAULT 0 NOT NULL,
    quantity_out INTEGER DEFAULT 0 NOT NULL,
    balance_after INTEGER NOT NULL,
    unit_cost NUMERIC(10, 2) DEFAULT 0.00,
    reference_folio TEXT, -- Folio de venta, orden de compra o traspaso
    reason TEXT,
    authorized_by TEXT DEFAULT 'Administrador General',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.inventory_kardex ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso completo a inventory_kardex" ON public.inventory_kardex;
CREATE POLICY "Acceso completo a inventory_kardex" ON public.inventory_kardex FOR ALL USING (true);

-- ==============================================================================
-- FASE 5: VENTAS Y COTIZACIONES (UNIFICADAS CON LA TIENDA Y POS MANUAL)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio TEXT UNIQUE NOT NULL,                       -- 'VEN-2026-0001' o 'COT-2026-0001'
    order_type TEXT DEFAULT 'VENTA' NOT NULL CHECK (order_type IN ('VENTA', 'COTIZACION')),
    channel TEXT DEFAULT 'ONLINE' NOT NULL CHECK (channel IN ('ONLINE', 'TIENDA_FISICA', 'WHATSAPP', 'MAYOREO')),
    branch TEXT DEFAULT 'Independencia' NOT NULL,
    customer_id UUID REFERENCES public.crm_customers(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    customer_city TEXT,
    shipping_address TEXT,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    shipping_cost NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    amount_paid NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    balance_due NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    payment_status TEXT DEFAULT 'PENDIENTE' NOT NULL CHECK (payment_status IN ('PENDIENTE', 'PARCIAL', 'PAGADO', 'CANCELADO')),
    order_status TEXT DEFAULT 'EN_PREPARACION' NOT NULL CHECK (order_status IN ('COTIZACION', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO', 'CANCELADO')),
    payment_method TEXT DEFAULT 'MERCADO_PAGO',
    customization_notes TEXT,
    tracking_carrier TEXT DEFAULT 'DHL Express',
    tracking_number TEXT,
    converted_from_quote TEXT,                        -- Referencia al folio si nació como cotización
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso completo a sales_orders" ON public.sales_orders;
CREATE POLICY "Acceso completo a sales_orders" ON public.sales_orders FOR ALL USING (true);

-- Partidas de venta
CREATE TABLE IF NOT EXISTS public.sales_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_order_id UUID REFERENCES public.sales_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES public.products(id),
    product_sku TEXT,
    product_name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    customization TEXT,
    total NUMERIC(10, 2) NOT NULL
);

ALTER TABLE public.sales_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso completo a sales_order_items" ON public.sales_order_items;
CREATE POLICY "Acceso completo a sales_order_items" ON public.sales_order_items FOR ALL USING (true);

-- ==============================================================================
-- FASE 6: COMPRAS Y RECEPCIÓN DE MERCANCÍA
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio TEXT UNIQUE NOT NULL,                        -- 'OC-2026-0001'
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    supplier_name TEXT NOT NULL,
    destination_branch TEXT DEFAULT 'Almacén Central' NOT NULL,
    status TEXT DEFAULT 'BORRADOR' NOT NULL CHECK (status IN ('BORRADOR', 'ORDENADA', 'RECEPCION_PARCIAL', 'RECIBIDA_COMPLETA', 'CANCELADA')),
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    amount_paid NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    balance_due NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    payment_status TEXT DEFAULT 'PENDIENTE' NOT NULL CHECK (payment_status IN ('PENDIENTE', 'PARCIAL', 'PAGADO')),
    expected_delivery_date DATE,
    received_at TIMESTAMPTZ,
    notes TEXT,
    created_by TEXT DEFAULT 'Administrador de Compras',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso completo a purchase_orders" ON public.purchase_orders;
CREATE POLICY "Acceso completo a purchase_orders" ON public.purchase_orders FOR ALL USING (true);

-- Partidas de compra
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES public.products(id),
    item_description TEXT NOT NULL,
    unit_cost NUMERIC(10, 2) NOT NULL,
    quantity_ordered INTEGER NOT NULL CHECK (quantity_ordered > 0),
    quantity_received INTEGER DEFAULT 0 NOT NULL,
    total NUMERIC(10, 2) NOT NULL
);

ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso completo a purchase_order_items" ON public.purchase_order_items;
CREATE POLICY "Acceso completo a purchase_order_items" ON public.purchase_order_items FOR ALL USING (true);

-- ==============================================================================
-- FASE 7: CONTROL FINANCIERO Y MOVIMIENTOS DE PAGO (CxC / CxP)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payments_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio TEXT UNIQUE NOT NULL,                        -- 'REC-2026-0001'
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('COBRO_CLIENTE', 'PAGO_PROVEEDOR', 'ANTICIPO', 'REEMBOLSO')),
    sales_order_id UUID REFERENCES public.sales_orders(id) ON DELETE SET NULL,
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.crm_customers(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    entity_name TEXT NOT NULL,                         -- Nombre del cliente o proveedor
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('EFECTIVO', 'TRANSFERENCIA_SPEI', 'MERCADO_PAGO', 'TARJETA_TERMINAL', 'CHEQUE')),
    reference_number TEXT,                             -- Rastreo SPEI, ID de Mercado Pago, etc.
    proof_url TEXT,
    notes TEXT,
    created_by TEXT DEFAULT 'Caja / Administración',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.payments_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso completo a payments_ledger" ON public.payments_ledger;
CREATE POLICY "Acceso completo a payments_ledger" ON public.payments_ledger FOR ALL USING (true);

-- ==============================================================================
-- FASE 8: FACTURACIÓN ADMINISTRATIVA INTERNA (SIN TIMBRADO SAT / SIN CFDI)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.administrative_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio TEXT UNIQUE NOT NULL,                        -- 'FAC-ADM-2026-0001'
    sales_order_id UUID REFERENCES public.sales_orders(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.crm_customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_rfc TEXT DEFAULT 'XAXX010101000',
    customer_business_name TEXT,
    fiscal_address TEXT,
    items JSONB NOT NULL,                              -- Lista de conceptos, cantidades y precios
    subtotal NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    vat_percentage NUMERIC(5, 2) DEFAULT 16.00 NOT NULL,
    vat_amount NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    status TEXT DEFAULT 'EMITIDA' NOT NULL CHECK (status IN ('EMITIDA', 'CANCELADA', 'PAGADA')),
    disclaimer TEXT DEFAULT 'Documento administrativo sin validez fiscal. No constituye un CFDI.' NOT NULL,
    notes TEXT,
    created_by TEXT DEFAULT 'Facturación Vizantino',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT
);

ALTER TABLE public.administrative_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso completo a administrative_invoices" ON public.administrative_invoices;
CREATE POLICY "Acceso completo a administrative_invoices" ON public.administrative_invoices FOR ALL USING (true);

-- ==============================================================================
-- FASE 10: USUARIOS, ROLES Y AUDITORÍA DE SEGURIDAD
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.erp_roles (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL -- {"crm": {"view": true, "create": true, ...}, "inventory": {...}}
);

CREATE TABLE IF NOT EXISTS public.erp_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_name TEXT NOT NULL DEFAULT 'Ventas',
    assigned_branch TEXT DEFAULT 'Todas',
    active BOOLEAN DEFAULT true NOT NULL,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.erp_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso completo a erp_users" ON public.erp_users;
CREATE POLICY "Acceso completo a erp_users" ON public.erp_users FOR ALL USING (true);

-- Registro de Auditoría de Acciones Críticas
CREATE TABLE IF NOT EXISTS public.erp_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'CREAR_VENTA', 'AJUSTE_INVENTARIO', 'ALTA_PROVEEDOR', etc.
    target_module TEXT NOT NULL,
    target_folio TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.erp_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso a auditoría" ON public.erp_audit_logs;
CREATE POLICY "Acceso a auditoría" ON public.erp_audit_logs FOR ALL USING (true);

-- Roles por defecto del sistema
INSERT INTO public.erp_roles (name, description, permissions)
VALUES 
('Administrador General', 'Control total de la plataforma y módulos', '{"all": true}'::jsonb),
('Ventas', 'Acceso a cotizaciones, pedidos, CRM y caja', '{"crm": true, "sales": true, "pos": true, "reports": false}'::jsonb),
('Inventario', 'Gestión de catálogo, kardex, stock y traspasos', '{"inventory": true, "transfers": true, "kardex": true}'::jsonb),
('Compras', 'Gestión de proveedores y órdenes de compra', '{"suppliers": true, "purchases": true, "inventory_view": true}'::jsonb),
('Contabilidad', 'Control de pagos, CxC, CxP, facturas administrativas y reportes', '{"finance": true, "invoicing": true, "reports": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Usuario maestro Administrador inicial
INSERT INTO public.erp_users (full_name, email, password_hash, role_name, assigned_branch)
VALUES 
('Dirección General Vizantino', 'direccion@vizantinopiel.com', 'Vizantino2026Master!', 'Administrador General', 'Todas'),
('Ventas Mostrador', 'ventas@vizantinopiel.com', 'Ventas2026!', 'Ventas', 'Independencia'),
('Almacén Central', 'almacen@vizantinopiel.com', 'Almacen2026!', 'Inventario', 'Todas')
ON CONFLICT (email) DO NOTHING;

-- ==============================================================================
-- VISTAS ANALÍTICAS PARA REPORTES Y DASHBOARD (FASE 9)
-- ==============================================================================
CREATE OR REPLACE VIEW public.view_erp_dashboard_kpis AS
SELECT
    (SELECT COALESCE(SUM(total), 0) FROM public.sales_orders WHERE created_at >= CURRENT_DATE AND payment_status = 'PAGADO') AS sales_today,
    (SELECT COALESCE(SUM(total), 0) FROM public.sales_orders WHERE created_at >= date_trunc('month', CURRENT_DATE) AND payment_status = 'PAGADO') AS sales_month,
    (SELECT COALESCE(SUM(balance_due), 0) FROM public.sales_orders WHERE balance_due > 0) AS total_cxc,
    (SELECT COALESCE(SUM(balance_due), 0) FROM public.purchase_orders WHERE balance_due > 0) AS total_cxp,
    (SELECT COALESCE(SUM(stock * price), 0) FROM public.products) AS inventory_valuation,
    (SELECT COUNT(*) FROM public.products WHERE stock <= 3) AS low_stock_count;
