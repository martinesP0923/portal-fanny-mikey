# Portal de Comunicaciones — I.E.D. Fanny Mikey

Sitio web para el Departamento de Comunicaciones: Emisora Fanny Music, Danza y Teatro, y Noticias, con un panel de locución protegido por contraseña.

## ⚠️ Importante sobre la seguridad del acceso

Este sitio se aloja en GitHub Pages, lo cual significa que **todo el código es público** (cualquiera puede verlo). Por eso, el correo y la contraseña de acceso **no están escritos en ningún archivo del proyecto**. En su lugar, se crean de forma segura dentro de tu propio proyecto de Supabase (paso 3 más abajo), y el sitio solo verifica el ingreso contra ese servicio.

## Qué necesitas antes de empezar

- Una cuenta gratuita en [supabase.com](https://supabase.com)
- Una cuenta de GitHub

## Paso 1 — Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) → **New project**.
2. Ponle un nombre, por ejemplo `fanny-mikey-comunicaciones`, y una contraseña de base de datos (guárdala, es distinta a la del portal).
3. Espera 1-2 minutos a que se cree el proyecto.

## Paso 2 — Crear las tablas y el almacenamiento

1. En el menú lateral, entra a **SQL Editor** → **New query**.
2. Abre el archivo `sql/schema.sql` de este proyecto, copia todo su contenido y pégalo ahí.
3. Dale a **Run**. Esto crea las tablas de la emisora, danza/teatro, noticias, y el bucket de archivos `media`.

## Paso 3 — Crear el usuario de acceso (Presentadores)

1. En el menú lateral, entra a **Authentication** → **Users** → **Add user** → **Create new user**.
2. Correo: `departamentocomunicacionfm@gmail.com`
3. Contraseña: la que ya tienes definida.
4. Marca **Auto Confirm User** para que quede activo de inmediato.
5. Guarda.

Ese será el único usuario que puede entrar al panel de "Presentadores". Puedes crear más adelante otros usuarios (otros presentadores) de la misma forma.

## Paso 4 — Conectar el sitio con tu proyecto

1. En Supabase, ve a **Project Settings** → **API**.
2. Copia el **Project URL** y la llave **anon public**.
3. Abre el archivo `assets/js/supabase-config.js` de este proyecto y reemplaza:
   ```js
   const SUPABASE_URL = "PEGA_AQUI_TU_SUPABASE_URL";
   const SUPABASE_ANON_KEY = "PEGA_AQUI_TU_SUPABASE_ANON_KEY";
   ```
   con tus propios valores.

   > La llave "anon public" está diseñada para ser pública y usarse en el navegador — no es un secreto. La seguridad real la dan las políticas de la base de datos (ya incluidas en `schema.sql`), que impiden que alguien sin sesión de presentador pueda crear, editar o borrar contenido.

## Paso 5 — Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (puede ser público) y sube todo el contenido de esta carpeta.
2. Ve a **Settings** → **Pages** en el repositorio.
3. En "Branch", selecciona `main` y la carpeta `/ (root)`. Guarda.
4. En unos minutos tu sitio quedará disponible en una dirección como:
   `https://tu-usuario.github.io/nombre-del-repositorio/`

## Cómo se usa

- **Estudiantes**: entran a "Emisora Fanny Music" y piden canciones sin necesidad de iniciar sesión.
- **Presentadores**: entran a "Presentadores", inician sesión con el correo y la contraseña configurados en el Paso 3, y desde ahí:
  - Actualizan qué canción está sonando y gestionan las solicitudes.
  - Publican contenido de Danza y Teatro (título, contenido, 1 foto, 1 video).
  - Publican noticias (epígrafe, titular, bajada, cuerpo, hasta 2 fotos y 1 video).
- Todo lo publicado aparece automáticamente en las páginas públicas del sitio.

## Estructura del proyecto

```
index.html              → Página de inicio
emisora.html            → Emisora (pública)
danza-teatro.html       → Danza y Teatro (pública)
noticias.html           → Noticias (pública)
presentadores.html      → Inicio de sesión
admin.html              → Panel de locución (protegido)
assets/css/style.css    → Estilos del sitio
assets/js/              → Lógica de cada página
assets/images/logo.png  → Escudo del colegio (fondo transparente)
sql/schema.sql          → Esquema de base de datos para Supabase
```

## Cambiar textos, colores o logo más adelante

- Los colores y tipografías están centralizados al inicio de `assets/css/style.css` (sección `:root`).
- El logo es `assets/images/logo.png`; solo reemplázalo por otro archivo con el mismo nombre para cambiarlo.
