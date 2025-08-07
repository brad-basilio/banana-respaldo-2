# 🔧 CORRECCIÓN LAYOUTS: Dimensiones de Celdas y Imágenes

## 🐛 Problema Identificado

En layouts con celdas, las imágenes **NO respetaban** los tamaños configurados en las celdas editables. El problema se manifestaba especialmente al generar thumbnails.

### Causa Raíz

**WorkspaceSize Incorrecto**: Todas las celdas recibían las dimensiones del workspace completo (`workspaceDimensions`) en lugar de sus dimensiones reales calculadas según el grid layout.

```jsx
// ❌ ANTES (Incorrecto)
<EditableCell
    workspaceSize={workspaceDimensions} // 800x600px para TODAS las celdas
    // ... otras props
/>
```

**Problema**: Una celda en un grid 2x2 debería ser ~400x300px, pero recibía 800x600px, causando cálculos de posición y tamaño incorrectos.

## ✅ Solución Implementada

### 1. Función de Cálculo de Dimensiones

```javascript
const calculateCellDimensions = (layout, cellIndex, workspaceDimensions) => {
    // Parsear grid-cols-N y grid-rows-N del template CSS
    const colsMatch = layout.template.match(/grid-cols-(\d+)/);
    const rowsMatch = layout.template.match(/grid-rows-(\d+)/);
    
    const cols = colsMatch ? parseInt(colsMatch[1]) : 1;
    const rows = rowsMatch ? parseInt(rowsMatch[1]) : 1;
    
    // Calcular gap y dimensiones disponibles
    const gapValue = layout.style?.gap ? parseInt(layout.style.gap) : 24;
    const availableWidth = workspaceDimensions.width - (gapValue * (cols - 1));
    const availableHeight = workspaceDimensions.height - (gapValue * (rows - 1));
    
    // Dimensiones por celda
    return {
        width: Math.floor(availableWidth / cols),
        height: Math.floor(availableHeight / rows)
    };
};
```

### 2. Aplicación en Renderizado

```jsx
// ✅ DESPUÉS (Correcto)
{pages[currentPage].cells.map((cell, idx) => {
    const cellDimensions = calculateCellDimensions(layout, idx, workspaceDimensions);
    
    return (
        <EditableCell
            workspaceSize={cellDimensions} // Dimensiones específicas de la celda
            // ... otras props
        />
    );
})}
```

## 📊 Comparación de Dimensiones

### Ejemplo: Layout 2x2 en workspace 800x600px

| Elemento | Antes (Incorrecto) | Después (Correcto) | Mejora |
|----------|-------------------|-------------------|---------|
| **Celda Superior Izq** | 800x600px | 388x288px | ✅ Proporcional |
| **Celda Superior Der** | 800x600px | 388x288px | ✅ Proporcional |
| **Celda Inferior Izq** | 800x600px | 388x288px | ✅ Proporcional |
| **Celda Inferior Der** | 800x600px | 388x288px | ✅ Proporcional |

### Cálculo de Dimensiones
- **Gap**: 24px entre celdas
- **Ancho disponible**: 800 - (24×1) = 776px → 388px por celda
- **Alto disponible**: 600 - (24×1) = 576px → 288px por celda

## 🎯 Beneficios de la Corrección

### ✅ Posicionamiento Correcto
- Las imágenes ahora usan porcentajes **relativos a la celda**, no al workspace completo
- `position: absolute` con `left: 50%` = centro de la celda, no del workspace

### ✅ Dimensionamiento Proporcional
- `width: 100%` en una imagen = ancho de la celda, no del workspace
- Los controles de tamaño funcionan correctamente

### ✅ Thumbnails Precisos
- Los thumbnails reflejan exactamente lo que se ve en la interfaz
- No más discrepancias entre vista y capture

### ✅ Layouts Responsivos
- Cada layout (1x1, 2x1, 2x2, etc.) calcula automáticamente las dimensiones correctas
- Soporte para gaps personalizados

## 🔍 Debug y Monitoreo

### Console Logs Añadidos
```javascript
console.log(`🔧 [CELL-DIMENSIONS] Layout: ${layout.id}, Celda: ${cellIndex}, Grid: ${cols}x${rows}, Dims: ${cellWidth}x${cellHeight}`);
```

### Verificación
1. **Abrir DevTools Console**
2. **Aplicar un layout con múltiples celdas**
3. **Ver los logs de dimensiones calculadas**
4. **Verificar que cada celda tiene dimensiones apropiadas**

## 🧪 Casos de Prueba

### Layout 1x1 (Básico)
- **Celda única**: 800x600px (workspace completo)
- **Sin gaps**: Usa todas las dimensiones

### Layout 2x1 (Horizontal)
- **2 celdas horizontales**: 388x600px cada una
- **Gap 24px**: Entre las celdas

### Layout 2x2 (Grid)
- **4 celdas**: 388x288px cada una
- **Gaps**: 24px horizontal y vertical

### Layout 3x1 (Triple)
- **3 celdas horizontales**: ~251x600px cada una
- **2 gaps de 24px**: Entre celdas

## 📁 Archivos Modificados

### Editor.jsx
- **Línea ~315**: Nueva función `calculateCellDimensions`
- **Línea ~8890**: Aplicación de dimensiones calculadas en renderizado
- **Console logs**: Para debugging de dimensiones

## ⚠️ Consideraciones

### Fallback Safety
- Si no se puede parsear el layout → usar `workspaceDimensions` completo
- Manejo de layouts personalizados o malformados

### Performance
- Cálculo simple y rápido en cada render
- No impacto significativo en rendimiento

### Compatibilidad
- Funciona con layouts existentes
- No rompe el modo libre (sin layouts)

---
*Implementado: Agosto 2025*
*Estado: ✅ Activo*
*Impacto: Solo layouts con múltiples celdas*
