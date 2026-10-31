# MANUAL OPERATIVO Y TÉCNICO: SUITE ERP + CRM + E-COMMERCE
## VIZANTINO PIEL — GUÍA MAESTRA DE USUARIO Y ADMINISTRACIÓN

---

### 1. ACCESO OFICIAL Y ARQUITECTURA
- **URL Oficial en Producción**: [`https://www.vizantinopiel.com/system`](https://www.vizantinopiel.com/system) (o `https://vizantino.vercel.app/system`).
- **Acceso Directo desde la Tienda**: Desde [`index.html`](file:///d:/Pagina%20Web%20Vizantino%20Piel/index.html), haciendo clic en el botón dorado **"Suite ERP & CRM"**.
- **Credenciales Maestras Iniciales**:
  - **Usuario**: `direccion@vizantinopiel.com`
  - **Contraseña**: `Vizantino2026Master!`
  - **Rol**: `Administrador General` (Acceso irrestricto)
- **Base de Datos**: Supabase PostgreSQL (`zujfslxqgllzmxdoioie.supabase.co`) con Row Level Security (RLS) habilitado.

---

### 2. RESUMEN DE MÓDULOS OPERATIVOS

#### Módulo 1: Dashboard Ejecutivo (Fase 1 y 9)
- Indicadores en tiempo real: Ventas del Mes, Cuentas por Cobrar (CxC), Cuentas por Pagar (CxP), Valuación de Inventario a costo, Alertas de existencias mínimas y últimas transacciones en vivo.

#### Módulo 2: CRM — Gestión de Clientes (Fase 2)
- Clasificación entre **Particulares** y **Empresas** (Razón Social y RFC).
- Historial 360°, saldo deudor, límite de crédito y enlaces directos a WhatsApp para cotizaciones personalizadas.
- **Sincronización Transaccional**: Toda compra concretada en la tienda online (`index.html`) se asocia o registra automáticamente en el CRM sin duplicidad.

#### Módulo 3: Proveedores & Cadena de Suministro (Fase 3)
- Directorio de curtidores y proveedores de herrajes artesanales (León, Tonalá, Guadalajara).
- Monitoreo de condiciones de crédito, plazos de entrega, saldos pendientes y emisión rápida de órdenes de compra.

#### Módulo 4: Inventario Multi-Sucursal & Kardex Inmutable (Fase 4)
- Existencias desglosadas por almacén:
  - **Sucursal Independencia** (Showroom principal).
  - **Sucursal Alfareros** (Tienda y punto de entrega).
  - **Almacén Tonalá** (Bodega de curtidos y stock central).
- **Regla Estricta**: Prohibición de existencias negativas sin autorización expresa.
- Kardex transaccional con auditoría de tipos de movimiento: `ENTRADA_COMPRA`, `SALIDA_VENTA`, `TRASPASO`, `AJUSTE_POSITIVO`, `AJUSTE_MERMA`, `DEVOLUCION_CLIENTE`.
- Códigos SKU y EAN-13 integrados.

#### Módulo 5: Ventas, POS & Cotizaciones (Fase 5)
- Unificación de ventas de mostrador (POS), órdenes web y cotizaciones mayoristas.
- **Conversión en 1 Clic**: Cotización $\to$ Venta formal, descontando existencias en el Kardex de forma atómica.
- Comprobantes de venta descargables en PDF con paleta de lujo Vizantino (`#120d0a` y `#c6a477`).
- Soporte de anticipos, abonos y seguimiento de entregas.

#### Módulo 6: Compras & Recepción de Mercancía (Fase 6)
- Flujo administrativo: Solicitud $\to$ Orden de Compra (`OC-2026-XXXX`) $\to$ Recepción de Mercancía $\to$ Cuenta por Pagar $\to$ Liquidación.
- Al confirmar la recepción física, el sistema suma automáticamente el stock al almacén destino y crea la póliza de entrada en Kardex.

#### Módulo 7: Control Financiero de Pagos (Fase 7)
- Panel de flujo de caja en vivo: Ingresos Cobrados, Egresos a Proveedores, Flujo Neto en Caja.
- Conciliación de Cuentas por Cobrar (CxC) y Cuentas por Pagar (CxP).
- Recibos de pago foliados (`REC-2026-XXXX`) con comprobante en PDF.

#### Módulo 8: Facturación Administrativa Sin Timbrado (Fase 8)
- Emisión de facturas proforma y comprobantes administrativos internos (`FAC-ADM-2026-XXXX`).
- Desglose de Subtotal, IVA configurable (16% o 0%) y Total.
- **Leyenda Legal Obligatoria**:
  > *"Documento administrativo sin validez fiscal. No constituye un CFDI."*
  (Cumple estrictamente con la normativa comercial sin emitir timbrado ante el SAT).

#### Módulo 9: Reportes & Business Intelligence (Fase 9)
- 8 Tarjetas KPI avanzadas con filtros dinámicos (Fecha, Canal, Sucursal, Categoría).
- Ranking de productos más vendidos y cartera de clientes VIP.
- Fórmulas financieras documentadas y exportaciones multiformato a CSV (UTF-8 BOM con compatibilidad Excel) e Informes Gerenciales en PDF.

#### Módulo 10: Usuarios, Roles & Seguridad (Fase 10)
- Matriz de roles iniciales: Administrador General, Ventas & POS, Inventario & Almacén, Compras & Suministro, Contabilidad & Finanzas.
- Permisos granulares (Ver, Crear, Editar, Eliminar, Autorizar, Exportar).
- Bitácora de Auditoría en tiempo real con historial cronológico inmutable y exportación a CSV.

---

### 3. FÓRMULAS FINANCIERAS UTILIZADAS
1. **Ingreso Neto**: Suma de ventas con estatus `PAGADO` o `ENTREGADO`.
2. **Utilidad Bruta Proyectada**:
   $$\text{Utilidad Bruta} = \text{Precio de Venta} - \text{Costo de Adquisición}$$
   $$\text{Margen \%} = \left(\frac{\text{Utilidad Bruta}}{\text{Precio de Venta}}\right) \times 100$$
3. **Saldos CxC y CxP**:
   $$\text{Saldo Pendiente} = \text{Importe Total} - \sum(\text{Abonos Conciliados})$$
4. **Flujo Neto de Efectivo**:
   $$\text{Flujo Neto} = \sum(\text{Cobros Entrantes}) - \sum(\text{Egresos Pagados})$$

---

### 4. MATRIZ DE PERMISOS POR ROL

| Módulo | Administrador | Ventas & POS | Inventario | Compras | Contabilidad |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **CRM Clientes** | Total | Operativo | Solo Lectura | Sin Acceso | Cartera |
| **Inventario & Kardex** | Total | Consulta Stock | Operativo / Traspasos | Recepción OC | Valuación |
| **Ventas & Pedidos** | Total | Operativo | Sin Acceso | Sin Acceso | Auditoría |
| **Compras & Proveedores** | Total | Sin Acceso | Recepción | Operativo | Pasivos |
| **Control de Pagos** | Total | Cobro Mostrador | Sin Acceso | Sin Acceso | Total Finanzas |
| **Facturación Admin** | Total | Emisión Proforma | Sin Acceso | Sin Acceso | Total |
| **Reportes & BI** | Total | Metas | Rotación | Historial | Reportes CxC/CxP |
| **Usuarios & Seguridad**| Total | Sin Acceso | Sin Acceso | Sin Acceso | Sin Acceso |

---

### 5. VERIFICACIÓN Y VALIDACIÓN (FASE 13)
- **Tienda Pública**: `index.html` y catálogo en línea preservan las 65 imágenes oficiales sin alteración.
- **Enrutamiento Limpio**: Configurado en `vercel.json` para servir `/system` sin extensiones `.html`.
- **Diseño**: Paleta de lujo con café cuero oscuro (`#120d0a`, `#1c1511`), acentos dorados (`#c6a477`), beige (`#f5ebe1`) e interfaz 100% adaptable a computadoras de escritorio, tablets y smartphones.
