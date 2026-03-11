

## Plan: Integrate CUIT Identification, Real Repos, and PDF into Chat Engine

### Summary
Rewrite the chat engine to use real local data repositories for client identification (by CUIT), product search, and claim reason suggestion. Add PDF price list delivery. Update MessageBubble for link rendering. 4 files modified/created.

### 1. `src/lib/reasonRepository.ts` — Add `suggestClaimReasons()`

Add a keyword-based scoring function that maps user free-text descriptions to the 38 real claim reasons. Each reason ID gets a list of Spanish keywords (e.g., `cr-006` → `['bicho', 'insecto', 'gusano', ...]`). Scoring: exact word match = 10pts, multi-word substring = 15pts, reason name match = 20pts. Returns top 3 sorted by score.

### 2. `public/Lista_de_precios.pdf` — Copy uploaded file

Copy the uploaded PDF to `public/Lista_de_precios.pdf` so it can be served at `/Lista_de_precios.pdf`.

### 3. `src/components/MessageBubble.tsx` — Support clickable links

Update the `dangerouslySetInnerHTML` rendering to also convert `[text](url)` markdown links into `<a>` tags with `target="_blank"`, in addition to the existing `**bold**` support.

### 4. `src/lib/chatEngine.ts` — Major rewrite

**New ConversationState values:**
```
awaiting_cuit_for_claim
confirm_client_for_claim
awaiting_cuit_for_price_list
confirm_client_for_price_list  
awaiting_cuit_for_account
confirm_client_for_account
awaiting_cuit_for_sales_order
confirm_client_for_sales_order
product_claim_reason_suggest     // shows matched motivos from real DB
product_claim_product_select     // multiple product matches → pick one
```

Remove old states: `awaiting_customer_id_for_price_list`, `awaiting_customer_id_for_account_status`, `awaiting_customer_id_for_sales_order`.

**New ClaimData fields:**
```typescript
clientName?: string | null;
clientCuit?: string | null;
clientIsNew?: boolean;
```

**New imports:**
```typescript
import { findContactByIdNumber } from './contactRepository';
import { findBestProductMatch, searchProducts } from './productRepository';
import { suggestClaimReasons } from './reasonRepository';
```

**Flow changes:**

1. **All 4 main menu options** now route to `awaiting_cuit_for_*` states first. The bot asks: "Para continuar, por favor indicame tu CUIT."

2. **CUIT handler** (shared logic): Strips hyphens/spaces, calls `findContactByIdNumber()`. If found → shows name, asks confirmation with quick replies. If not found → marks as new client, continues.

3. **After CUIT confirmed for claims** → shows claim type menu (same as before).

4. **After CUIT confirmed for price list** → sends message with markdown link `[📄 Descargar lista de precios](/Lista_de_precios.pdf)`.

5. **After CUIT for account status** → if not found, blocks with email fallback (`facturaciones@vitalcan.com.ar`). If found, shows demo response.

6. **After CUIT for sales order** → shows demo future capability message.

7. **Product search** → Replace `PRODUCT_CATALOG` and `findProduct()` with `findBestProductMatch()` and `searchProducts()` from real repo. When multiple matches (>1 and ≤5), show top 3 as quick replies + "Ninguno de estos". When single match, show confirmation.

8. **Reason suggestion** → Replace `reformulateReason()` with `suggestClaimReasons()`. If 1+ matches found, suggest best match with "Sí, usar este motivo" / "Ver otras opciones" / "Ninguna coincide". "Ver otras opciones" shows up to 3 as quick replies. "Ninguna coincide" registers generic reason. New state `product_claim_reason_suggest` handles the alternatives display.

9. **Summaries** → Add client info line: `• **Cliente:** ${clientName} (${clientCuit})` or `• **Cliente:** Cliente nuevo`.

10. **Claim closure** → Updated messages:
    - "Tu ticket ya fue ingresado en la base de datos. Un asesor se va a comunicar con vos para continuar el seguimiento."
    - "Este caso será derivado a Contact Center y luego asignado al equipo correspondiente."
    - "En esta versión demo la carga se simula localmente, pero en una implementación real el ticket quedaría registrado en el sistema."

11. **Demo scenarios** → Updated to include CUIT steps. Use `'30713322705'` (VITALCAN S.A.) for claim scenarios, and appropriate CUITs for other flows. Add `'Sí, es correcto'` confirmation steps after CUIT.

### Technical Details

**CUIT search mechanics:**
- `findContactByIdNumber` strips hyphens/spaces from both input and stored values
- Contacts store IDs like `'30713322705'` or `'30-70888840-7'`
- User can type `30-71332270-5` or `30713322705`, both match

**Product search mechanics:**
- `searchProducts(query)` does substring match on name, aliases, reference, brand
- `findBestProductMatch(query)` scores results by exact match (50pts), word match (10pts each), brand match (20pts), shorter name preference
- Show up to 3 results as quick replies when multiple matches

**Reason suggestion mechanics:**
- New `suggestClaimReasons(description)` scores against keyword map per reason ID
- Returns top 3 ClaimReasonRecord sorted by score
- Bot shows best match name and asks confirmation

### Files Summary
| File | Action |
|------|--------|
| `src/lib/reasonRepository.ts` | Add `suggestClaimReasons()` with keyword scoring |
| `public/Lista_de_precios.pdf` | Copy uploaded PDF |
| `src/components/MessageBubble.tsx` | Add markdown link rendering |
| `src/lib/chatEngine.ts` | Major rewrite: CUIT flows, real repos, reason suggestion, PDF delivery, updated closures and scenarios |

