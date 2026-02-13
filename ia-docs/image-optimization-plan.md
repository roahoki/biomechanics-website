# Plan de Optimización de Imágenes - Biomechanics Website

**Fecha de Creación:** 2026-02-13  
**Scope Principal:** Página `/links` y componentes relacionados  
**Branch:** `feat/optimize-images`

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Diagnóstico Actual](#diagnóstico-actual)
3. [Problemas Identificados](#problemas-identificados)
4. [Análisis de Impacto](#análisis-de-impacto)
5. [Plan de Optimización](#plan-de-optimización)
6. [Análisis de Librerías](#análisis-de-librerías)
7. [Decisión sobre Supabase](#decisión-sobre-supabase)
8. [Roadmap de Implementación](#roadmap-de-implementación)
9. [Métricas de Éxito](#métricas-de-éxito)

---

## Resumen Ejecutivo

La página `/links` carga extremadamente lento debido a que **las imágenes se cargan sin ninguna optimización**. El problema principal es que se sirven imágenes en su tamaño original desde Supabase Storage directamente, sin compresión, sin thumbnails, y sin utilizar las capacidades de optimización de Next.js.

### Conclusión Principal
> **Se puede lograr una mejora del 70-85% en tiempo de carga SIN modificar la respuesta de Supabase**, aplicando optimizaciones exclusivamente en el frontend de Next.js.

---

## Diagnóstico Actual

### Arquitectura de Imágenes Actual

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   Supabase       │         │   Next.js        │         │   Browser        │
│   Storage        │ ──────► │   App (sin opt)  │ ──────► │   (carga lenta)  │
│   (imágenes      │         │                  │         │                  │
│   originales)    │         │   CSS background │         │   Descarga full  │
└──────────────────┘         │   o <img> nativo │         │   resolution     │
                             └──────────────────┘         └──────────────────┘
```

### Flujo de Carga de la Página `/links`

1. **Carga inicial:** Se hace fetch a Supabase para obtener `site_settings`
2. **Datos recibidos:** 18 links con ~25+ URLs de imágenes (según logs)
3. **Renderizado:** Cada item usa `background-image: url(...)` en CSS
4. **Problema:** El browser descarga TODAS las imágenes al mismo tiempo, en su resolución original

### Archivos Críticos Analizados

| Archivo | Problema Principal |
|---------|-------------------|
| `src/app/links/page.tsx` | Usa `<img>` nativo en lugar de `next/image` para avatar |
| `src/components/features/products/PressableItem.tsx` | **Usa `background-image` CSS** - no permite optimización |
| `src/components/features/products/PressablesList.tsx` | Layout masonry recalcula en cada resize |
| `src/components/common/media/ZoomableImage.tsx` | Usa `<img>` nativo en todos lados |
| `src/components/features/products/ItemModal.tsx` | Thumbnails sin lazy loading |
| `src/components/features/products/ProductModal.tsx` | Thumbnails sin lazy loading |

---

## Problemas Identificados

### 1. **Crítico: Uso de `background-image` CSS en lugar de `<Image>`**

```tsx
// PressableItem.tsx - PROBLEMA ACTUAL
<button
    style={{
        backgroundImage: itemData.images?.length > 0 
            ? `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${itemData.images[0]})` 
            : undefined,
        backgroundSize: 'cover',
    }}
>
```

**Impacto:** 
- No hay lazy loading
- No hay conversión a WebP/AVIF
- No hay responsive images
- No hay image optimization de Next.js
- Las imágenes se descargan en su tamaño ORIGINAL (potencialmente varios MB cada una)

### 2. **Uso de `<img>` nativo con eslint-disable**

```tsx
// links/page.tsx - Avatar
// eslint-disable-next-line @next/next/no-img-element
<img
    src={profileImage}
    alt="Foto de perfil Biomechanics"
    className={`${commonClasses} clickable`}
    width={128}
    height={128}
/>
```

**Impacto:** Se ignora intencionalmente el aviso de ESLint que sugiere usar `next/image`.

### 3. **Sin Lazy Loading Efectivo**

Actualmente no hay lazy loading implementado. Todas las imágenes se cargan al mismo tiempo cuando la página renderiza, causando:
- Alto uso de ancho de banda inicial
- Bloqueo del hilo principal
- LCP (Largest Contentful Paint) muy alto

### 4. **Thumbnails de Alta Resolución**

En los modales (`ItemModal.tsx`, `ProductModal.tsx`), los thumbnails de 64x64px cargan las imágenes completas:

```tsx
// ItemModal.tsx - Thumbnails que cargan imágenes full
<img
    src={image}  // URL de imagen original (potencialmente 2000x3000px)
    alt={`${item.title} ${index + 1}`}
    className="w-full h-full object-cover"  // Se muestra en 64x64px
/>
```

### 5. **Detección de Aspect Ratio Ineficiente**

```tsx
// Carga la imagen COMPLETA solo para detectar dimensions
const detectImageAspectRatio = (src: string): Promise<number> => {
    return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
            const aspectRatio = img.width / img.height
            resolve(aspectRatio)
        }
        img.src = src  // Descarga imagen completa
    })
}
```

### 6. **Configuración de Next.js Subutilizada**

```typescript
// next.config.ts - CONFIGURACIÓN EXISTE PERO NO SE USA
images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'jbgwwdtjwagvradijzvy.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
    formats: ['image/avif', 'image/webp'],  // ✅ Configurado pero no aprovechado
}
```

---

## Análisis de Impacto

### Estimación de Carga Actual vs Optimizada

| Escenario | Carga Actual | Carga Optimizada | Mejora |
|-----------|--------------|------------------|--------|
| 18 items con 1 imagen c/u (avg 500KB) | ~9 MB | ~900 KB (thumbnails WebP) | **90%** |
| Imagen de fondo (1920x1080) | ~2 MB | ~200 KB (WebP optimizado) | **90%** |
| Avatar (128x128 mostrado) | ~300 KB | ~15 KB (WebP) | **95%** |
| **Total inicial** | **~11.3 MB** | **~1.1 MB** | **~90%** |

### Web Vitals Esperados

| Métrica | Estimado Actual | Objetivo | 
|---------|-----------------|----------|
| LCP (Largest Contentful Paint) | >4s | <2.5s |
| FID (First Input Delay) | >300ms | <100ms |
| CLS (Cumulative Layout Shift) | >0.25 | <0.1 |
| TTI (Time to Interactive) | >6s | <3.5s |

---

## Plan de Optimización

### Fase 1: Optimizaciones de Alto Impacto (Quick Wins)

#### 1.1 Reemplazar `background-image` por `next/image`

**Prioridad: CRÍTICA**

```tsx
// ANTES (PressableItem.tsx)
<button
    style={{
        backgroundImage: `url(${itemData.images[0]})`
    }}
>

// DESPUÉS
import Image from 'next/image'

<button className="relative overflow-hidden">
    <Image
        src={itemData.images[0]}
        alt={itemData.title}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover"
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDA..."
    />
    {/* Overlay para el gradiente */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/20" />
</button>
```

#### 1.2 Implementar Lazy Loading Nativo

**Archivo:** `PressablesList.tsx`

```tsx
// Agregar IntersectionObserver para cargar imágenes on-demand
import { useInView } from 'react-intersection-observer'

function PressableItemWrapper({ item, ...props }) {
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px 0px', // Pre-cargar 200px antes de entrar en viewport
    })
    
    return (
        <div ref={ref}>
            {inView ? <PressableItem item={item} {...props} /> : <Placeholder />}
        </div>
    )
}
```

#### 1.3 Crear Componente `OptimizedImage`

Crear un wrapper reutilizable para todas las imágenes:

```tsx
// src/components/common/media/OptimizedImage.tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
    src: string
    alt: string
    fill?: boolean
    width?: number
    height?: number
    sizes?: string
    priority?: boolean
    className?: string
    quality?: number
}

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="#1a1a1a"/>
  <rect id="r" width="${w}" height="${h}" fill="url(#g)"/>
  <animate attributeName="x" values="-${w};${w}" dur="1s" repeatCount="indefinite"/>
  <defs>
    <linearGradient id="g">
      <stop offset="0%" stop-color="#1a1a1a"/>
      <stop offset="50%" stop-color="#2a2a2a"/>
      <stop offset="100%" stop-color="#1a1a1a"/>
    </linearGradient>
  </defs>
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str)

export function OptimizedImage({
    src,
    alt,
    fill,
    width,
    height,
    sizes = '100vw',
    priority = false,
    className = '',
    quality = 75
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    if (hasError) {
        return (
            <div className={`bg-gray-800 flex items-center justify-center ${className}`}>
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        )
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill={fill}
            width={width}
            height={height}
            sizes={sizes}
            quality={quality}
            priority={priority}
            className={`${className} ${isLoading ? 'scale-105 blur-sm' : 'scale-100 blur-0'} transition-all duration-300`}
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
            onLoad={() => setIsLoading(false)}
            onError={() => setHasError(true)}
        />
    )
}
```

### Fase 2: Optimizaciones de Mediano Plazo

#### 2.1 Pregenerar BlurDataURL para Imágenes

**Opción A: Generación en tiempo de build (recomendado para imágenes estáticas)**

```typescript
// lib/image-blur.ts
import { getPlaiceholder } from 'plaiceholder'

export async function getBlurDataURL(src: string): Promise<string> {
    try {
        const response = await fetch(src)
        const buffer = Buffer.from(await response.arrayBuffer())
        const { base64 } = await getPlaiceholder(buffer, { size: 10 })
        return base64
    } catch {
        return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...'
    }
}
```

**Opción B: Almacenar blur hash en Supabase (para imágenes dinámicas)**

Agregar campo `blur_hash` o `blur_data_url` a la tabla de items.

#### 2.2 Optimizar Thumbnails en Modales

```tsx
// En ItemModal.tsx y ProductModal.tsx
<Image
    src={image}
    alt={`${item.title} ${index + 1}`}
    width={64}
    height={64}
    className="object-cover"
    sizes="64px"
    quality={60}  // Menor calidad para thumbnails
/>
```

#### 2.3 Implementar Image Prefetching Inteligente

```tsx
// Prefetch de imágenes del siguiente item en el carrusel
useEffect(() => {
    if (item?.images?.length > 1) {
        const nextIndex = (currentImageIndex + 1) % item.images.length
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = item.images[nextIndex]
        link.as = 'image'
        document.head.appendChild(link)
    }
}, [currentImageIndex, item?.images])
```

### Fase 3: Optimizaciones Avanzadas

#### 3.1 Implementar Progressive Image Loading

```tsx
// Componente que carga primero una versión muy pequeña, luego la full
function ProgressiveImage({ src, alt, ...props }) {
    const [currentSrc, setCurrentSrc] = useState(null)
    
    useEffect(() => {
        // Cargar thumbnail primero (Next.js lo generará automáticamente)
        const img = new Image()
        img.src = src
        img.onload = () => setCurrentSrc(src)
    }, [src])
    
    return (
        <Image
            src={currentSrc || src}
            alt={alt}
            {...props}
            quality={currentSrc ? 85 : 10}
        />
    )
}
```

#### 3.2 Skeleton Loading para Grids

```tsx
function ImageSkeleton() {
    return (
        <div className="animate-pulse bg-gray-800 rounded-xl" style={{ aspectRatio: '1' }}>
            <div className="w-full h-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer" />
        </div>
    )
}
```

#### 3.3 Virtual Scrolling para Listas Largas (si hay muchos items)

Considerar `react-virtual` o `react-window` si la lista crece significativamente.

---

## Análisis de Librerías

### Librerías Actuales - Evaluación

| Librería | Uso Actual | Veredicto | Acción |
|----------|-----------|-----------|--------|
| `cropperjs` | Crop de imágenes al subir | ✅ Mantener | Ya comprime a 800x800 max |
| `framer-motion` | Animaciones de UI | ✅ Mantener | No afecta rendimiento de imágenes |
| `next/image` | **NO SE USA** | ⚠️ Implementar | Debe usarse en todos lados |

### Librerías a Agregar

| Librería | Propósito | Justificación | Bundle Size |
|----------|-----------|---------------|-------------|
| `react-intersection-observer` | Lazy loading | Implementar carga diferida eficiente | ~2KB gzip |
| `plaiceholder` (opcional) | Generar blur placeholders | Mejor UX durante carga | Server-side only |

### Librerías a NO Agregar

| Librería | Razón de NO uso |
|----------|-----------------|
| `sharp` (browser) | Next.js ya lo usa internamente para optimización |
| `blurhash` | `plaiceholder` es más simple y suficiente |
| `react-lazy-load` | `next/image` + IntersectionObserver es mejor |

### Comandos de Instalación

```bash
# Agregar react-intersection-observer para lazy loading
npm install react-intersection-observer

# Opcional: plaiceholder para blur data URLs en server
npm install plaiceholder
```

---

## Decisión sobre Supabase

### Pregunta: ¿Es necesario modificar Supabase Storage?

**Respuesta: NO es necesario para esta fase de optimización.**

### Justificación

1. **Next.js Image Optimization es suficiente:**
   - Next.js tiene un servidor de optimización de imágenes built-in
   - Soporta remotePatterns (ya configurado para Supabase)
   - Genera automáticamente WebP/AVIF
   - Crea versiones redimensionadas on-demand
   - Implementa caching efectivo

2. **Complejidad vs Beneficio:**
   - Modificar Supabase requiere: funciones Edge, triggers, almacenamiento adicional
   - El beneficio marginal sería ~10-15% adicional
   - Next.js optimization da ~80-90% del beneficio con 0 cambios en backend

3. **Futuro (opcional):**
   Si en el futuro se necesita más optimización, se puede considerar:
   - Supabase Image Transformation (feature beta)
   - Cloudinary/Imgix como CDN de imágenes
   - Edge Functions para generar thumbnails al subir

### Diagrama de Flujo Optimizado

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   Supabase       │         │   Next.js        │         │   Browser        │
│   Storage        │         │   Image Server   │         │                  │
│   (originales)   │ ──────► │   (optimiza)     │ ──────► │   WebP/AVIF      │
└──────────────────┘         │   - Resize       │         │   Lazy loaded    │
                             │   - Compress     │         │   Con blur       │
                             │   - Cache        │         └──────────────────┘
                             └──────────────────┘
```

---

## Roadmap de Implementación

### Semana 1: Quick Wins (Impacto Inmediato)

- [ ] **Día 1-2:** Crear componente `OptimizedImage.tsx`
- [ ] **Día 2-3:** Migrar `PressableItem.tsx` de `background-image` a `next/image`
- [ ] **Día 3-4:** Migrar avatar en `links/page.tsx` a `next/image`
- [ ] **Día 4-5:** Agregar `react-intersection-observer` y lazy loading

### Semana 2: Mejoras Incrementales

- [ ] Optimizar thumbnails en `ItemModal.tsx` y `ProductModal.tsx`
- [ ] Implementar skeleton loading
- [ ] Optimizar imagen de fondo de página
- [ ] Eliminar detección de aspect ratio ineficiente (usar datos de Supabase)

### Semana 3: Polish y Medición

- [ ] Implementar blur placeholders
- [ ] Testing de performance en dispositivos móviles
- [ ] Documentar cambios y mejores prácticas
- [ ] Medir mejoras con Lighthouse

---

## Métricas de Éxito

### Objetivos Cuantitativos

| Métrica | Baseline | Objetivo | Cómo Medir |
|---------|----------|----------|------------|
| Tamaño de carga inicial | ~11 MB | <2 MB | DevTools Network |
| LCP | >4s | <2.5s | Lighthouse |
| Lighthouse Performance Score | ~40 | >75 | Lighthouse |
| Time to Interactive | >6s | <3.5s | Lighthouse |

### Cómo Validar

```bash
# Ejecutar Lighthouse localmente
npx lighthouse http://localhost:3000/links --output=html --output-path=./lighthouse-report.html

# O usar la extensión de Chrome DevTools
```

### Checklist de Verificación Post-Implementación

- [ ] Las imágenes cargan en formato WebP/AVIF (verificar en Network tab)
- [ ] Las imágenes se cargan diferidamente (lazy loading funciona)
- [ ] El placeholder blur aparece antes de la imagen
- [ ] No hay errores en consola relacionados a imágenes
- [ ] El layout no "salta" cuando cargan las imágenes (CLS bajo)
- [ ] Las imágenes se ven nítidas en retina/2x displays

---

## Notas Adicionales

### Warning de Clerk

```
Clerk: The prop "afterSignInUrl" is deprecated...
```

Este warning no está relacionado con imágenes pero debería actualizarse eventualmente a `fallbackRedirectUrl` o `forceRedirectUrl`.

### Video como Avatar

El sitio permite video como avatar, lo cual no puede optimizarse con `next/image`. Considerar:
- Comprimir videos antes de subir
- Limitar duración/tamaño de videos
- Usar `<video poster="...">` para imagen de preview

---

## Archivos a Modificar (Resumen)

| Archivo | Tipo de Cambio |
|---------|---------------|
| `src/components/common/media/OptimizedImage.tsx` | **CREAR** |
| `src/components/features/products/PressableItem.tsx` | Migrar a next/image |
| `src/components/features/products/PressablesList.tsx` | Agregar lazy loading |
| `src/components/common/media/ZoomableImage.tsx` | Migrar a next/image |
| `src/components/features/products/ItemModal.tsx` | Optimizar thumbnails |
| `src/components/features/products/ProductModal.tsx` | Optimizar thumbnails |
| `src/app/links/page.tsx` | Migrar avatar a next/image |
| `package.json` | Agregar `react-intersection-observer` |

---

## Referencias

- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)
- [Web Vitals](https://web.dev/vitals/)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [react-intersection-observer](https://github.com/thebuilder/react-intersection-observer)

---

*Documento generado para el proyecto biomechanics-website. Actualizar conforme avance la implementación.*
