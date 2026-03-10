

## Plan: Import Excel Data as Local Mock Data Layer

### Overview
Parse the 4 uploaded Excel files and create typed TypeScript data files + repository helpers, without modifying the chat engine yet.

### Data Analysis Summary

**Products (productos_vitalcan.xlsx):** ~6000 rows, heavily mixed with raw materials, packaging, construction supplies, clothing, marketing materials, etc. Only a subset are actual pet food/pet products. Will filter to include only rows whose names or reference codes match Vitalcan brand lines (Balanced, Complete, Nutrique, Therapy, Premium, Hop!, Belcan/Belcat, Natural Recipe) and pet accessories (collars, bowls, harnesses, etc.).

**Contacts (Contactos_vitalcan.xlsx):** ~80 rows with Name, ID Number, Email. Clean data, straightforward import.

**Claim Reasons (motivos_vitalcan.xlsx):** 38 rows with a single "Nombre" column. Will categorize each by keywords.

**Support Teams (equipos_de_soporte.xlsx):** 9 rows. Simple import with inferred specialties.

### Files to Create

1. **`src/data/products.ts`** — Filtered ~500-800 real pet products from the 6000+ rows. Each with `id`, `name`, `internalReference`, `aliases` (lowercase, no accents), `active`. Rows that are clearly raw materials (MI*, MA*, MF*, VA*, IN*, OP*, C0*, BU*, ENV*), packaging, construction, or have no recognizable product name will be excluded.

2. **`src/data/contacts.ts`** — All ~80 contacts with `id`, `name`, `identificationNumber`, `email`, `active`.

3. **`src/data/claimReasons.ts`** — All 38 reasons with `id`, `name`, `category` (inferred from keywords: facturacion, documentacion, producto_calidad, producto_envase, producto_contenido, salud_nutricion, logistica, otros), `active`.

4. **`src/data/supportTeams.ts`** — 9 teams with `id`, `name`, `specialties[]`, `active`.

5. **`src/lib/productRepository.ts`** — `getAllProducts()`, `searchProducts(query)` (substring match on name/aliases), `findBestProductMatch(query)` (scored fuzzy match).

6. **`src/lib/contactRepository.ts`** — `getAllContacts()`, `findContactByIdNumber(query)`, `findContactByName(query)`.

7. **`src/lib/reasonRepository.ts`** — `getAllClaimReasons()`, `getClaimReasonsByCategory(category)`.

8. **`src/lib/supportTeamRepository.ts`** — `getAllSupportTeams()`, `getSupportTeamBySpecialty(specialty)`.

### Product Filtering Strategy

Include rows where:
- Reference starts with known product prefixes: `011`, `012`, `013`, `021`, `025`, `031`, `032`, `131`, `132`, `P00`, `L00`, `A00`, `D11`, `D21`, `MU0`
- OR name contains brand keywords: Balanced, Complete, Nutrique, Therapy, Premium, Hop, Belcan, Belcat, Natural Recipe, BNR, BAL, CPT, COM, THP, NUT, PRE
- Exclude packaging (ENV*, BB0*), raw materials (MI*, MA*, MF*, MFT*), maintenance (VA*), operations (OP*, C00*, BU*, IN0*), marketing materials (200*, 201* with non-product names like "Banner", "Bolsa", "Afiche", etc.)

### No Changes To
- `chatEngine.ts` — data layer only, no integration yet
- Any existing components

