# MANUAL OPERATIVO DEL SISTEMA ERP + CRM + E-COMMERCE
## VIZANTINO PIEL — GUÍA DE USUARIO Y ADMINISTRACIÓN

---

### 1. Acceso a la Plataforma
- **URL Directa**: `https://www.vizantinopiel.com/admin.html` (o `admin.html` en el servidor local/Vercel).
- **Desde la Tienda Pública**: En [index.html](file:///d:/Pagina%20Web%20Vizantino%20Piel/index.html), abre el modal de administración con tus credenciales y haz clic en el botón dorado **"Suite ERP & CRM"**.
- **Credenciales Maestras Iniciales**:
  - **Usuario**: `direccion@vizantinopiel.com`
  - **Contraseña**: `Vizantino2026Master!`
  - **Rol**: Administrador General (Permisos Totales)

---

### 2. Estructura de Módulos Operativos

#### FASE 2: CRM — Gestión de Clientes
- Permite dar de alta clientes **Particulares** o **Empresas**.
- Registra RFC, Razón Social, teléfono de contacto y WhatsApp para seguimiento comercial personalizado.
- Monitorea en tiempo real el saldo deudor, límite de crédito otorgado e historial acumulado de compras.
- Sincronización automática: Los pedidos finalizados en la tienda online se vinculan directamente al cliente en el CRM.

#### FASE 3: Proveedores y Suministros
- Catálogo centralizado de curtidores y proveedores de herrajes (León, Tonalá, Guadalajara).
- Control de términos de pago (Contado, Crédito a 15, 30 o 45 días) y tiempos promedio de entrega.
- Generación de Órdenes de Compra vinculadas a cuentas por pagar (CxP).

#### FASE 4: Inventario & Kardex Multi-sucursal
- Control de existencias desglosado por sede:
  - **Sucursal Independencia** (Tlaquepaque Centro)
  - **Sucursal Alfareros**
  - **Sucursal Tonalá**
  - **Almacén Central / E-Commerce**
- **Kardex Transaccional**: Cada entrada por compra, salida por venta, merma o traspaso queda registrada con folio, fecha, usuario responsable y justificación.
- **Alertas de Stock Mínimo**: El sistema notifica cuando un producto tiene $\le 4$ unidades disponibles para prevenir quiebres de inventario.

#### FASE 5: Ventas y Cotizaciones
- **Venta Rápida (Punto de Venta Mostrador)**: Registro de ventas presenciales con descuento automático de inventario.
- **Cotizaciones Formales**: Permite emitir cotizaciones comerciales a clientes mayoristas o empresas.
- **Conversión a Venta con 1 Clic**: Una cotización autorizada se transforma de inmediato en venta oficial.
- **Comprobantes en PDF**: Generación instantánea de comprobantes de venta con identidad gráfica Vizantino Piel, listos para imprimir o enviar por WhatsApp.

#### FASE 6: Compras y Recepción de Mercancía
- Emisión de Órdenes de Compra (OC) a proveedores autorizados.
- **Botón de Recepción**: Al llegar el pedido al taller o sucursal, el encargado presiona "Recibir", sumando de forma automática las existencias al catálogo y Kardex.

#### FASE 7: Control Financiero de Pagos (CxC / CxP)
- Registro transparente de abonos, anticipos y liquidaciones tanto de clientes como a proveedores.
- Métodos soportados: Efectivo, Transferencia Interbancaria SPEI, Terminal bancaria física y pasarela Mercado Pago.
- Cálculo de saldos dinámico para garantizar conciliación bancaria sin duplicidad.

#### FASE 8: Facturación Administrativa Interna
> [!IMPORTANT]
> **Normativa Legal y Fiscal:**
> Todos los documentos emitidos en este módulo son de control administrativo interno. Cuentan de manera obligatoria y fija con la leyenda:
> **"Documento administrativo sin validez fiscal. No constituye un CFDI."**
> No se realiza timbrado ante el SAT ni se consumen timbres PAC.

- Cálculo automático de IVA (16%) y desglose de subtotales.
- Generador de PDF comercial con marca de agua y diseño ejecutivo.

#### FASE 9: Reportes y Exportación de Datos
- **Métricas Clave (KPIs)**: Ventas del mes, cartera por cobrar (CxC), pasivos a proveedores (CxP) y valor del stock.
- **Exportaciones con 1 Clic**: Descarga directa en formato `.CSV` compatible con Microsoft Excel, Google Sheets y sistemas contables.

#### FASE 10: Seguridad, Roles y Auditoría
- Roles configurados: *Administrador General*, *Ventas*, *Inventario*, *Compras* y *Contabilidad*.
- Auditoría de eventos sensibles para garantizar trazabilidad.

---

### 3. Pasos para Aplicar la Migración en Supabase

1. Accede a tu panel en [Supabase Console](https://supabase.com/dashboard).
2. Selecciona tu proyecto: `zujfslxqgllzmxdoioie`.
3. Dirígete a la pestaña **SQL Editor** en el menú izquierdo.
4. Abre el archivo local [supabase_erp_crm_migration.sql](file:///d:/Pagina%20Web%20Vizantino%20Piel/supabase_erp_crm_migration.sql).
5. Copia todo su contenido, pégalo en el editor SQL de Supabase y haz clic en **Run**.
6. Las tablas, vistas, roles y políticas RLS quedarán activadas inmediatamente.
