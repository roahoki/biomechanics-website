# Biomechanics Website

Este README documenta la estructura del proyecto `BIOMECHANICS-WEBSITE`, incluyendo una descripción de cada archivo y carpeta, orientado a facilitar el mantenimiento y la escalabilidad del código.

---

## Tabla de Contenidos

- [Estructura General](#estructura-general)
  - [.next](#.next)
  - [node\_modules](#node_modules)
  - [public](#public)
  - [src](#src)
  - [.env.local](#.env.local)
  - [.gitignore](#.gitignore)
  - [Default.md](#default.md)
  - [middleware.ts](#middleware.ts)
  - [next-env.d.ts](#next-env.d.ts)
  - [next.config.ts](#next.config.ts)
  - [package.json y lock](#package.json-y-lock)
  - [postcss.config.mjs](#postcss.config.mjs)
  - [README.md](#readme.md)

---

## Estructura General

### `.next/`

Carpeta generada automáticamente por Next.js con los archivos de compilación del proyecto. **No editar.**

### `node_modules/`

Dependencias instaladas del proyecto. **No editar directamente.**

### `public/`

Archivos estáticos accesibles públicamente.

- `globe.svg`: Imagen SVG probablemente usada como ícono o fondo.
- `profile.jpg`: Imagen JPG visible en el frontend.

### `src/`

Carpeta principal del código fuente.

#### `src/app/`

Contiene las rutas principales de la aplicación (modelo App Router de Next.js).

- `admin/logout.ts`: Función para hacer logout de admin
- `admin/page.tsx`: Página básica del panel de admin
- `api/update-links/route.ts`: Ruta de API. Aquí se hace un POST a links.json para guardar los links del linktree.
- `blog/page.tsx`: Página del blog. POR DESARROLLAR
- `colors/page.tsx`: Página que contiene los colores base acorde a Brand Book para guiar desarrollo.
- `links/page.tsx`: Página para visualizar/enlazar links de contenido de Biomechanics
- `login/actions.ts`: Función de login de admin, con mini lógica de credenciales.
- `login/page.tsx`: Página de login de admin (inicio de sesión).
- `music/page.tsx`: Página musical. POR DESARROLLAR
- `layout.tsx`: Layout general de toda la aplicación
- `page.tsx`: Landing Page.

#### `src/components/`

Componentes reutilizables dentro de la aplicación.

- `AdminBadge.tsx`: Insignia de Admin que acompaña por toda la página
- `SortableLinksForm.tsx`: Vista de Admin para manejar los links del linktree

#### `src/data/`

- `links.json`: Archivo JSON con datos estructurados sobre enlaces.

#### `src/lib/`

Funciones auxiliares y utilitarias.

- `auth.ts`: Funciones relacionadas a autenticación. Verifica el token de la cookie del admin

#### `src/styles/`

- `globals.css`: Archivo principal de estilos globales. Aquí puedes incluir configuraciones base de Tailwind u otros estilos globales.

### `.env.local`

Variables de entorno locales. No se sube a Git. Aquí se colocan credenciales o configuraciones sensibles.

### `.gitignore`

Especifica los archivos/carpetas que no deben ser subidos a Git (como `.next/`, `node_modules/`, `.env.local`, etc).

### `Default.md`

README predeterminado que viene con el framework

### `middleware.ts`

Middleware de Next.js, usado para aplicar lógicas entre la request y la respuesta (como redirecciones o validaciones) con el propósito de acceso como admin.

### `next-env.d.ts`

Archivo generado automáticamente por Next.js para habilitar el tipado en TypeScript.

### `next.config.ts`

Archivo de configuración de Next.js. Aquí puedes modificar el comportamiento del framework (dominios externos, redirecciones, rutas personalizadas, etc).

### `package.json` y `package-lock.json`

- `package.json`: Lista las dependencias, scripts de ejecución, y metadata del proyecto.
- `package-lock.json`: Registro exacto de las versiones instaladas de las dependencias.

### `postcss.config.mjs`

Configuración de PostCSS, usado en combinación con Tailwind CSS.

### `README.md`

Este archivo. Útil para documentar cómo funciona el proyecto y facilitar el onboarding.

