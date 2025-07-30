# 📁 Nueva Estructura de Componentes

## Organización por Funcionalidad

### `/common/` - Componentes Reutilizables
- **`/ui/`** - Componentes básicos de interfaz
  - `FileInfo.tsx` - Información de archivos
  - `KeyboardShortcutsHelp.tsx` - Ayuda de atajos de teclado
  - `ListView.tsx` - Vista de listado
  - `UnsavedChangesIndicator.tsx` - Indicador de cambios sin guardar

- **`/forms/`** - Componentes de formularios
  - `AvatarUpload.tsx` - Subida de avatar

- **`/media/`** - Componentes de medios
  - `ImageCarousel.tsx` - Carrusel de imágenes
  - `ZoomableImage.tsx` - Imagen con zoom

### `/features/` - Componentes por Funcionalidad

- **`/categories/`** - Gestión de categorías
  - `CategoryFilter.tsx` - Filtro de categorías
  - `CategoryManager.tsx` - Administrador de categorías
  - `CategoryManagerCompact.tsx` - Versión compacta del administrador
  - `CategorySelector.tsx` - Selector de categorías

- **`/products/`** - Productos e items
  - `ProductCard.tsx` - Tarjeta de producto
  - `ProductCardSimple.tsx` - Tarjeta simple de producto
  - `ProductForm.tsx` - Formulario de producto
  - `ProductItem.tsx` - Item de producto
  - `ProductModal.tsx` - Modal de producto
  - `ProductPreview.tsx` - Vista previa de producto
  - `ItemCard.tsx` - Tarjeta de item
  - `ItemForm.tsx` - Formulario de item
  - `ItemModal.tsx` - Modal de item
  - `PressableItem.tsx` - Item presionable
  - `PressablesList.tsx` - Lista de presionables

- **`/profile/`** - Configuración de perfil
  - `BackgroundConfig.tsx` - Configuración de fondo
  - `SocialIconsConfig.tsx` - Configuración de iconos sociales
  - `StyleConfig.tsx` - Configuración de estilos

- **`/links/`** - Gestión de enlaces
  - `/SortableLinksForm/` - Formulario sorteable de enlaces
    - `ActionButtons.tsx` - Botones de acción
    - `DeleteModal.tsx` - Modal de eliminación
    - `LinkCard.tsx` - Tarjeta de enlace
    - `LinksListUpdated.tsx` - Lista actualizada de enlaces
    - `PreviewModalUpdated.tsx` - Modal de vista previa actualizado
  - `SortableLinksFormWithProducts.tsx` - Formulario principal con productos

## Sistema de Exportación

Cada carpeta tiene su propio `index.ts` que exporta todos sus componentes, permitiendo imports limpios:

```typescript
// Antes
import { ProductCard } from '@/components/ProductCard'
import { CategoryFilter } from '@/components/CategoryFilter'

// Ahora
import { ProductCard, CategoryFilter } from '@/components'
```

## Beneficios de la Nueva Estructura

1. **Separación de responsabilidades** - Cada feature tiene sus componentes
2. **Reutilización clara** - Componentes comunes separados
3. **Escalabilidad** - Fácil agregar nuevas features
4. **Mantenibilidad** - Localización clara de componentes
5. **Imports limpios** - Sistema de barril unificado
