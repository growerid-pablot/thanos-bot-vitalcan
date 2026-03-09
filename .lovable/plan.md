

## Plan: Rediseno robusto de la seccion de reclamos

### Problema actual
El flujo de reclamos es lineal y sin validaciones. Acepta cualquier input, no simula busquedas, no permite corregir datos, no maneja datos faltantes, y no muestra resumen final.

### Cambio principal: Reescribir `chatEngine.ts` con estado enriquecido

La funcion `processUserInput` actualmente es stateless (solo recibe state + input). Para soportar validaciones, datos acumulados, reintentos y resumen editable, necesita acceso a un **contexto de reclamo acumulado**.

**Arquitectura propuesta:** Agregar un objeto `ClaimData` que se pase y retorne junto con el estado, y mover toda la logica de reclamos a handlers dedicados con validacion.

### Nuevos estados de conversacion (productos)

```text
product_claim_intro
product_claim_product_name
product_claim_product_confirm    ← simula busqueda, pide confirmacion
product_claim_lot_number
product_claim_lot_missing        ← manejo de "no lo tengo"
product_claim_packaging_date
product_claim_packaging_missing
product_claim_expiry_date        ← NUEVO
product_claim_expiry_missing
product_claim_reason
product_claim_reason_confirm     ← reformulacion + confirmacion
product_claim_purchase_location
product_claim_summary            ← resumen editable
product_claim_edit_select        ← elegir campo a editar
```

Facturacion y entregas tambien ganan estados de motivo y resumen.

### Cambios en archivos

**1. `src/lib/chatEngine.ts`** — Reescritura mayor:
- Agregar interface `ClaimData` con campos: product, lot, packagingDate, expiryDate, reason, purchaseLocation, cada uno con valor nullable
- Cambiar `BotResponse` para incluir `claimData?: ClaimData`
- Cambiar `processUserInput` para recibir y retornar `claimData`
- Agregar validadores: `isValidLot()` (alfanumerico, <=12 chars), `isValidDate()` (DD/MM/AAAA o DD-MM-AAAA), `isShortReason()` (<10 chars)
- Agregar `isMissingDataResponse()` para detectar "no lo tengo", "no encuentro", etc.
- Simular busqueda de producto con `PRODUCT_CATALOG` lookup y fuzzy match simple
- Agregar `formatClaimSummary()` para generar resumen con datos o "pendiente"
- Logica de edicion: desde resumen, volver al campo elegido y retornar al resumen
- Agregar estados equivalentes para facturacion (motivo + resumen) y entregas (fecha entrega + motivo + resumen)
- Actualizar `DEMO_SCENARIOS` con confirmaciones intermedias ("Si, es correcto", etc.)

**2. `src/components/ChatInterface.tsx`** — Cambios menores:
- Agregar estado `claimData` al componente
- Pasar `claimData` a `processUserInput` y actualizar con la respuesta
- Resetear `claimData` en `handleReset`
- En `handleRunScenario`, propagar `claimData` entre pasos

**3. `src/components/MessageBubble.tsx`** — Sin cambios (ya soporta bold con `**`).

### Validaciones implementadas

| Campo | Validacion | Error amable | Dato faltante |
|-------|-----------|-------------|---------------|
| Producto | No vacio, >2 chars | Pedir mas precision | N/A (obligatorio) |
| Lote | Alfanumerico, <=12 chars | Explicar formato esperado | Permitir continuar como "pendiente" |
| Fecha envasado | Formato DD/MM/AAAA | Mostrar ejemplo | Permitir continuar como "pendiente" |
| Fecha vencimiento | Formato DD/MM/AAAA | Mostrar ejemplo | Permitir continuar como "pendiente" |
| Motivo | No vacio, >10 chars | Repreguntar con empatia | N/A (obligatorio) |
| Lugar compra | No vacio | Repreguntar | N/A (obligatorio) |

### Simulaciones clave

1. **Busqueda de producto**: Catalogo hardcoded de ~8 productos Vitalcan. Match por substring. Respuesta: "Buscando en la base de datos..." → "Encontre: [nombre completo]. Es correcto?"
2. **Interpretacion de motivo**: Clasificacion simple por keywords (calidad, envase, olor, vencido, etc.) → reformulacion generica + confirmacion
3. **Resumen final**: Listado formateado de todos los campos con opcion Confirmar / Editar

### Flujo de facturacion mejorado
- Agregar estado `billing_claim_reason` (ya existe) con validacion de motivo no vacio
- Agregar estado `billing_claim_summary` con resumen y confirmacion
- Validar fecha y numero de factura no vacios

### Flujo de entregas mejorado
- Agregar `delivery_claim_delivery_date` (nuevo)
- Mejorar `delivery_claim_reason` con validacion
- Agregar `delivery_claim_summary` con resumen y confirmacion

### Demo scenarios actualizados
Los escenarios automaticos incluiran las confirmaciones intermedias para que funcionen correctamente con la nueva logica.

