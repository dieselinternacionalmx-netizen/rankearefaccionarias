# Rankea Refaccionarias — Instrucciones para Codex

## Objetivo

Mejorar la arquitectura SEO y el diseño visual de Rankea Refaccionarias para que el sitio funcione como un directorio nacional de refaccionarias, comenzando con Querétaro y Nuevo León, pero preparado desde el inicio para crecer a los 32 estados, cientos de municipios y miles de fichas.

La prioridad no es crear páginas llenas de texto para SEO. Cada página debe ser útil para una persona real, estar bien interconectada y utilizar datos verificables.

---

# 1. Arquitectura general

Usar una estructura jerárquica clara:

```text
/
├── refaccionarias/
│   ├── queretaro/
│   │   ├── queretaro/
│   │   ├── corregidora/
│   │   ├── el-marques/
│   │   └── san-juan-del-rio/
│   └── nuevo-leon/
│       ├── monterrey/
│       ├── guadalupe/
│       ├── apodaca/
│       ├── san-nicolas-de-los-garza/
│       └── santa-catarina/
│
├── categorias/
│   ├── frenos/
│   ├── suspension/
│   ├── motor/
│   ├── diesel/
│   └── transmision/
│
└── refaccionaria/
    └── nombre-del-negocio/
```

La arquitectura debe poder evolucionar posteriormente hacia combinaciones como:

```text
/refaccionarias/queretaro/frenos/
/refaccionarias/queretaro/diesel/
/refaccionarias/nuevo-leon/monterrey/suspension/
/refaccionarias/nuevo-leon/monterrey/frenos/
```

No hardcodear Querétaro y Nuevo León como únicos estados posibles.

Estados, municipios, ciudades, categorías y fichas deben generarse dinámicamente desde los datos disponibles.

---

# 2. Hub nacional

Crear una página:

```text
/refaccionarias/
```

Debe funcionar como índice nacional.

Debe incluir:

- H1: `Refaccionarias en México`
- Buscador principal.
- Estados disponibles.
- Ciudades con mayor número de fichas.
- Categorías principales.
- Refaccionarias destacadas.
- Enlaces hacia todos los hubs estatales indexables.
- Texto editorial corto que explique qué ofrece Rankea Refaccionarias.

No presentar el proyecto como limitado a Querétaro y Nuevo León.

---

# 3. Hubs por estado

Ejemplo:

```text
/refaccionarias/queretaro/
```

Cada estado debe ser una landing editorial + directorio + nodo de interlinking.

## Hero

Ejemplo:

```text
Refaccionarias en Querétaro
```

Subheadline:

```text
Encuentra refaccionarias, autopartes y proveedores en Querétaro. Explora negocios por municipio, categoría o ubicación.
```

Incluir un buscador limitado inicialmente al estado seleccionado.

---

# 4. Datos generales del estado

Agregar un bloque editorial con datos útiles y comprobables.

Ejemplos de información permitida:

- Número oficial de municipios.
- Población del estado.
- Capital.
- Regiones o principales zonas urbanas.
- Contexto económico o automotriz cuando sea relevante.
- Principales municipios.
- Datos de actividad económica cuando exista una fuente oficial.

## Fuentes

Priorizar:

1. INEGI.
2. Gobierno del estado.
3. Gobiernos municipales.
4. Secretaría de Economía.
5. Data México.
6. Otras dependencias oficiales mexicanas.

## Regla estricta

No inventar datos.

No generar automáticamente afirmaciones como:

- “la zona con más refaccionarias”
- “el municipio más importante para autopartes”
- “la mayor concentración de talleres”
- “el estado líder en...”

a menos que exista evidencia verificable.

Si no existe un dato fiable, omitirlo.

No escribir párrafos artificiales sólo para aumentar el número de palabras.

---

# 5. Fuentes y trazabilidad

Guardar internamente, cuando sea posible:

```text
source_name
source_url
source_date
last_verified
```

Esto permitirá actualizar información posteriormente.

Los datos estadísticos no deben quedar enterrados en texto hardcodeado.

Separar:

- contenido editorial;
- datos estructurados;
- fichas de negocios.

---

# 6. Municipios del estado

Después del bloque introductorio mostrar:

```text
Explora refaccionarias por municipio
```

Cada municipio con fichas debe enlazar a su propia landing.

Ejemplo Querétaro:

```text
Querétaro
Corregidora
El Marqués
San Juan del Río
Pedro Escobedo
```

No crear páginas indexables de municipios sin contenido suficiente únicamente para inflar el número de URLs.

Idealmente mostrar también:

```text
24 refaccionarias
12 refaccionarias
8 refaccionarias
```

si esos números provienen de nuestra propia base de datos.

---

# 7. Hubs por municipio o ciudad

Ejemplo:

```text
/refaccionarias/queretaro/corregidora/
```

H1:

```text
Refaccionarias en Corregidora, Querétaro
```

Contenido:

- Buscador local.
- Introducción corta.
- Listado principal de refaccionarias.
- Mapa si se dispone de coordenadas.
- Categorías existentes en esa ubicación.
- Colonias o zonas únicamente cuando existan datos suficientes.
- Municipios cercanos.
- Enlaces hacia el hub estatal.

No crear contenido genérico duplicado cambiando únicamente el nombre del municipio.

---

# 8. Refaccionarias destacadas

En cada hub estatal mostrar entre 6 y 9 fichas destacadas.

La selección no debe llamarse “las mejores” salvo que exista una metodología real.

Utilizar preferentemente:

```text
Refaccionarias destacadas
```

Criterios posibles:

- ficha completa;
- fotografía;
- teléfono;
- WhatsApp;
- ubicación;
- horario;
- rating;
- número de reseñas;
- datos recientemente verificados.

Cada card debe incluir únicamente lo útil:

- imagen;
- nombre;
- municipio / ciudad;
- rating y número de reseñas cuando existan;
- categoría;
- botón `Ver refaccionaria`;
- WhatsApp/teléfono sólo cuando no ensucie la interfaz.

---

# 9. Categorías

Crear taxonomía real.

Ejemplos:

```text
Motor
Frenos
Suspensión
Dirección
Transmisión
Embrague
Sistema eléctrico
Baterías
Filtros
Lubricantes
Enfriamiento
Diesel
Tractocamión
Carrocería
Accesorios
```

No asignar categorías a un negocio mediante texto inventado.

La categoría debe provenir de datos conocidos, clasificación manual o reglas suficientemente confiables.

---

# 10. Páginas categoría + ubicación

Preparar la arquitectura para URLs como:

```text
/refaccionarias/queretaro/frenos/
/refaccionarias/queretaro/suspension/
/refaccionarias/nuevo-leon/diesel/
/refaccionarias/nuevo-leon/monterrey/frenos/
```

Sólo indexar estas páginas cuando exista suficiente inventario real.

Evitar crear miles de páginas vacías o con dos resultados.

---

# 11. Interlinking

La navegación debe formar una red clara:

```text
México
↓
Estado
↓
Municipio / Ciudad
↓
Categoría
↓
Ficha
```

Y también permitir rutas laterales:

```text
Ficha
→ municipio
→ estado
→ categoría
→ negocios similares
```

No dejar páginas huérfanas.

Añadir breadcrumbs visibles:

```text
Inicio > Refaccionarias > Querétaro > Corregidora > Nombre del negocio
```

Implementar `BreadcrumbList` mediante JSON-LD.

---

# 12. SEO on-page

Cada página debe generar dinámicamente:

- `<title>`
- meta description
- canonical
- H1 único
- breadcrumbs
- Open Graph
- Twitter cards cuando aplique

Ejemplos:

## Estado

```text
Title:
Refaccionarias en Querétaro | Rankea Refaccionarias
```

```text
Description:
Encuentra refaccionarias en Querétaro. Consulta negocios por municipio, ubicación y tipo de refacción, con teléfonos, horarios y opiniones.
```

## Municipio

```text
Title:
Refaccionarias en Corregidora, Querétaro | Rankea Refaccionarias
```

---

# 13. Datos estructurados

Implementar JSON-LD cuando corresponda.

Para fichas de negocio evaluar:

```text
LocalBusiness
AutomotiveBusiness
AutoPartsStore
```

Usar el tipo que represente correctamente cada negocio.

Incluir únicamente propiedades realmente conocidas:

```text
name
address
telephone
openingHours
geo
url
image
aggregateRating
```

No crear rating ni horarios falsos.

Para páginas de listado utilizar cuando sea apropiado:

```text
ItemList
BreadcrumbList
```

---

# 14. Canonicals y contenido duplicado

Evitar que filtros y parámetros creen cientos de URLs indexables.

Ejemplo:

```text
?orden=rating
?abierto=1
?page=2
```

Definir correctamente:

- canonical;
- noindex cuando corresponda;
- paginación;
- URLs limpias.

No permitir que múltiples URLs representen exactamente el mismo contenido.

---

# 15. Sitemap

Generar sitemaps separados si el volumen comienza a crecer.

Ejemplo:

```text
/sitemap-estados.xml
/sitemap-municipios.xml
/sitemap-refaccionarias.xml
/sitemap-categorias.xml
```

No incluir:

- páginas noindex;
- filtros;
- búsquedas internas;
- páginas vacías;
- URLs canónicas duplicadas.

---

# 16. Páginas con poco contenido

No crear automáticamente páginas indexables simplemente porque exista una combinación posible.

Ejemplo:

```text
Querétaro + transmisiones automáticas + municipio X
```

Si sólo tiene una ficha, probablemente no merece todavía una landing SEO independiente.

Crear reglas mínimas de inventario antes de indexar páginas programáticas.

---

# 17. UX del hub estatal

Visualmente el sitio necesita sentirse como una plataforma automotriz moderna y no como una plantilla de directorio.

Orden recomendado para un hub:

```text
HEADER
↓
HERO DEL ESTADO
↓
BUSCADOR
↓
DATOS CLAVE DEL ESTADO
↓
EXPLORA POR MUNICIPIO
↓
REFACCIONARIAS DESTACADAS
↓
BUSCAR POR CATEGORÍA
↓
LISTADO DE REFACCIONARIAS
↓
CONTENIDO EDITORIAL ÚTIL
↓
OTROS MUNICIPIOS
↓
OTROS ESTADOS
↓
CTA PARA DUEÑOS
↓
FOOTER
```

---

# 18. Dirección visual

El sitio actualmente necesita una mejora visual importante.

Queremos:

- desktop primero, sin abandonar responsive;
- ancho útil aproximado de 1280–1480 px;
- composición editorial;
- mucho mejor uso de espacios;
- jerarquía tipográfica fuerte;
- cards grandes y limpias;
- bordes sutiles;
- interfaz premium;
- fotografías reales de negocios cuando existan;
- azul navy, rojo, blanco y grises;
- rojo utilizado principalmente como acento;
- encabezados fuertes;
- UI moderna.

Evitar:

- demasiados gradientes;
- exceso de sombras;
- cards por absolutamente todo;
- iconos genéricos gigantes;
- fondos metálicos;
- estética de taller de los años 90;
- apariencia de tema WordPress de directorio;
- bloques de texto enormes;
- saturación de rojo.

La estética debe estar más cerca de:

```text
marketplace moderno
+
buscador local
+
portal editorial
+
producto digital premium
```

y menos cerca de:

```text
directorio amarillo
+
portal de clasificados
```

---

# 19. Hero del home

El hero principal debe ser amplio en desktop.

Headline recomendado:

```text
Encuentra la refacción.
Encuentra quién la vende.
```

Buscador protagonista:

```text
[ ¿Qué refacción o refaccionaria buscas? ]
[ Ciudad o estado ]
[ BUSCAR ]
```

Añadir accesos rápidos:

```text
Frenos
Suspensión
Motor
Diesel
Transmisión
```

No utilizar un hero simplemente decorativo.

El buscador debe ser la función principal.

---

# 20. Home como hub nacional

Orden recomendado:

```text
HEADER
↓
HERO + BUSCADOR
↓
ESTADOS DISPONIBLES
↓
CIUDADES PRINCIPALES
↓
CATEGORÍAS
↓
REFACCIONARIAS DESTACADAS
↓
CÓMO FUNCIONA
↓
CONTENIDO / GUÍAS
↓
CTA PARA NEGOCIOS
↓
FOOTER
```

No mencionar de forma prominente que sólo tenemos dos estados.

Simplemente mostrar los estados actualmente disponibles.

---

# 21. Mobile

Aunque diseñemos primero una experiencia desktop potente, móvil debe estar cuidadosamente trabajado.

Priorizar:

- búsqueda;
- llamar;
- WhatsApp;
- abrir mapa;
- horarios;
- navegación;
- cards;
- filtros.

Evitar simplemente apilar la versión desktop.

---

# 22. Performance

Priorizar Core Web Vitals.

- imágenes responsive;
- WebP / AVIF;
- lazy loading;
- dimensiones explícitas de imágenes;
- evitar JavaScript innecesario;
- minimizar CLS;
- fuentes optimizadas;
- no cargar mapas pesados hasta que sean necesarios.

---

# 23. Principio editorial

Antes de publicar una página preguntarse:

> ¿Esta página sería útil si Google no existiera?

Si la respuesta es no, no deberíamos crearla únicamente para SEO.

El objetivo es que Rankea Refaccionarias termine convirtiéndose en una base de información realmente útil sobre dónde encontrar refacciones en México, y que el SEO sea consecuencia de una buena arquitectura, datos estructurados, contenido verificable e interlinking.
