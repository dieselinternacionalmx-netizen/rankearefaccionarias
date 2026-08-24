# Rediseño visual implementado: Refaccionarias Querétaro

## Objetivo

Aplicar el brief visual aprobado al MVP local para que el sitio se sienta como herramienta/directorio moderno, no como tabla publicada.

## Dirección aplicada

- Industrial limpio + marketplace local + señalética automotriz.
- Hero oscuro con patrón sutil tipo mapa/rutas.
- Fondo hueso claro, cards blancas, acentos ámbar y acciones azules/charcoal.
- Cards escaneables con datos reales y estados claros.
- Rutas geo-first conservadas: `/queretaro/{municipio}/{businessSlug}`.

## Archivos principales modificados

- `app/globals.css`
- `app/page.tsx`
- `app/queretaro/page.tsx`
- `app/queretaro/[municipio]/page.tsx`
- `app/queretaro/[municipio]/[businessSlug]/page.tsx`
- `components/BusinessCard.tsx`

## Componentes/UX implementados

- Header compacto.
- Hero oscuro con buscador grande.
- Chips de municipios.
- Panel visual tipo mapa/rutas sin imagen pesada.
- Estadísticas del directorio.
- Cards accionables con badges: teléfono, sitio web, datos públicos.
- Hubs por estado y municipio.
- Ficha individual como mini landing con CTA de llamada, sitio y reclamar ficha.
- Panel de confianza basado en datos públicos DENUE/INEGI.
- Estados para datos faltantes sin inventar información.

## Verificación

Comando ejecutado:

```bash
cd refacciones-qro-site && npm run verify && npm run build
```

Resultado:

```txt
VERIFY OK published=100 geoFirst=true uniqueUrls=100
✓ Compiled successfully
✓ Generating static pages using 9 workers (110/110)
```

Rutas probadas por HTTP local:

```txt
/ -> 200
/queretaro/ -> 200
/queretaro/queretaro/spr-autopartes-queretaro-251524/ -> 200
```

## Notas

- No se cambiaron slugs ni fuente de datos.
- No se inventaron horarios, reseñas, inventario ni especialidades.
- El sitio sigue usando las top 100 fichas publicables del grupo A.
