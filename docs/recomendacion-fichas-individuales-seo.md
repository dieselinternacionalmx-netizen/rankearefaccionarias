# Recomendacion SEO para Fichas Individuales

## Diagnostico

La ficha individual actual funciona como pagina basica de contacto: nombre, descripcion corta, badges, direccion, categoria, telefono, sitio web, reclamo y negocios similares. Para un MVP esta bien, pero para SEO programatico nacional todavia es delgada y demasiado uniforme.

El riesgo principal no es tecnico; es editorial. Si 100 o miles de fichas comparten casi la misma estructura y texto, Google puede percibirlas como paginas de bajo valor. La solucion no es inventar informacion, sino usar mejor los datos reales: categoria, municipio, colonia, telefono, sitio web validado, coordenadas, estado de validacion y enlaces internos.

## Estructura Recomendada

La ficha individual deberia presentarse como una mini landing local, no solo como una tarjeta ampliada.

1. Hero compacto

   - H1: nombre publico del negocio.
   - Sublinea: categoria + municipio + estado.
   - Badges: telefono disponible, sitio web validado, datos publicos, coordenadas disponibles.
   - CTA primario: llamar si hay telefono.
   - CTA secundario: visitar sitio si esta validado.

2. Panel de contacto

   - Telefono formateado.
   - Direccion completa.
   - Colonia.
   - Municipio y estado.
   - Sitio web solo si `showWebsiteButton` es true.
   - Mensaje: "Valida horarios, disponibilidad y piezas antes de trasladarte."

3. Descripcion editorial unica

   Usar una plantilla con variaciones por datos disponibles:

   - Si hay colonia: mencionar colonia.
   - Si hay categoria especifica: explicar que pertenece a esa categoria.
   - Si hay sitio web validado: indicar que hay enlace disponible.
   - Si no hay telefono/sitio: mostrarlo como dato pendiente, no como falla.

4. Bloque de datos verificados

   - Fuente: DENUE/INEGI.
   - Estado de sitio web: working, broken, missing.
   - Ultima revision si existe `lastmod` o `published_at`.
   - Aviso de actualizacion/reclamo.

5. Mapa o ubicacion

   Si hay `lat` y `lng`, agregar un bloque de ubicacion con enlace a Google Maps:

   - `https://www.google.com/maps/search/?api=1&query={lat},{lng}`

6. Enlaces internos

   - Volver al municipio.
   - Ver mas refaccionarias en el mismo municipio.
   - Ver mas negocios de la misma categoria.
   - A futuro: estado, colonia y categoria nacional.

7. Negocios similares

   Priorizar similitud por:

   - Mismo municipio.
   - Misma categoria.
   - Cercania si hay coordenadas.
   - Telefono/sitio disponible como desempate.

8. FAQ programatica

   Solo con respuestas seguras:

   - "¿Como puedo contactar a {Nombre}?"
   - "¿Donde esta {Nombre}?"
   - "¿La informacion de {Nombre} esta verificada?"
   - "¿Puedo reclamar esta ficha?"

## Plantillas SEO

### Title

Base:

`{Nombre} | Refaccionaria en {Municipio}, {Estado}`

Variantes:

- `{Nombre} | {Categoria} en {Municipio}, {Estado}`
- `{Nombre} en {Colonia}, {Municipio} | Rankea Refaccionarias`
- `{Nombre}: telefono y direccion en {Municipio}, {Estado}`

### Meta Description

Base:

`Consulta direccion, telefono y datos disponibles de {Nombre}, refaccionaria en {Municipio}, {Estado}. Ficha basada en datos publicos.`

Con sitio validado:

`Consulta direccion, telefono y sitio web disponible de {Nombre}, refaccionaria en {Municipio}, {Estado}. Valida informacion antes de visitar.`

Sin telefono:

`Consulta direccion y datos publicos de {Nombre}, refaccionaria en {Municipio}, {Estado}. La informacion puede requerir validacion por el negocio.`

### H1

`{Nombre}`

### Intro

`{Nombre} aparece en Rankea Refaccionarias como negocio de {categoria} en {municipio}, {estado}. En esta ficha puedes revisar direccion, telefono y sitio web cuando esten disponibles.`

## JSON-LD

Usar `AutoPartsStore` con campos reales:

- `name`
- `url`
- `address`
- `telephone`
- `geo`
- `areaServed`

No incluir:

- `openingHours`
- `aggregateRating`
- `review`
- `priceRange`
- `sameAs` si el sitio no esta validado

## Cambios Concretos Recomendados

1. Agregar campos derivados en `lib/data.ts`:

   - `stateName`
   - `mapsUrl`
   - `hasCoordinates`
   - `contactCompleteness`
   - `validationLabel`

2. Crear componente de ficha:

   - `components/BusinessProfile.tsx`
   - Separar hero, contacto, informacion, FAQ y similares.

3. Mejorar `app/queretaro/[municipio]/[businessSlug]/page.tsx`:

   - Canonical absoluto con `siteUrl`.
   - JSON-LD con URL absoluta.
   - FAQ visible + FAQ schema si se implementa bien.
   - Enlace a Google Maps si hay coordenadas.

4. Mejorar similares:

   - Hoy toma los primeros 3 del municipio.
   - Debe priorizar misma categoria y datos de contacto completos.

5. Preparar escalabilidad nacional:

   - Evitar hardcodear "Querétaro" en los componentes.
   - Usar `stateSlug` y `stateName`.
   - Mantener rutas geo-first por estado.

## Prioridades

1. Corregir ficha individual para que use estado dinamico, canonical absoluto y JSON-LD absoluto.
2. Agregar bloque de contacto/ubicacion mas rico con mapa.
3. Agregar descripcion editorial variable sin inventar datos.
4. Agregar FAQ programatica segura.
5. Mejorar enlaces internos y negocios similares.

