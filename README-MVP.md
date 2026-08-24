# MVP local — Rankea Refaccionarias

Proyecto Next.js App Router para `rankearefaccionarias.info`, planteado como directorio nacional de refaccionarias. El MVP inicia con Querétaro como primer estado y publica la base inicial depurada desde `data_top100.csv`.

## Rutas implementadas

- `/`
- `/queretaro/`
- `/queretaro/{municipio}/`
- `/queretaro/{municipio}/{businessSlug}/`
- `/sitemap.xml`
- `/robots.txt`

La estructura aprobada es geo-first para poder escalar a más estados. No se usa `/refaccionarias/` como prefijo.

## Comandos

```bash
cd "RANKEA REFACCIONARIAS"
npm run verify
npm run build
npm run dev
```

## Verificación realizada

`npm run verify && npm run build` pasó correctamente.

Resultado clave:

- 99 fichas publicadas verificadas tras deduplicación.
- URLs geo-first verificadas.
- 99 URLs únicas.
- Canónicas bajo `https://rankearefaccionarias.info`.
- Build generó 110 páginas estáticas.
- Ficha de ejemplo generada: `/queretaro/queretaro/spr-autopartes-queretaro-251524/`.

## Servidor local

Quedó corriendo en:

`http://localhost:3001`

Background id StarNet:

`bg_3f02ab5d-f81b-41b5-8742-d79dc1640442`
