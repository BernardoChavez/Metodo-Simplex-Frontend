# Metodo Simplex Frontend — Simplex FICCT (IO1)

Interfaz de usuario moderna en **React 18 + Vite + Tailwind CSS** para el modelado y visualización paso a paso del **Método Simplex de Dos Fases**.

Desarrollado para la materia de **Investigación Operativa I** de la **Facultad Integral de Ciencias de la Computación y Telecomunicaciones (FICCT - UAGRM)**.

---

## 🎨 Características de Diseño e Interfaz
- **Identidad Institucional FICCT**: Escudo oficial de la facultad e interfaz limpia en **Gris carbón (`#111317`) con Naranja sólido (`#ea580c`)**.
- **Tipografía**: **Plus Jakarta Sans** para textos generales y **JetBrains Mono** para tablas y matrices numéricas.
- **Visualizador de Tableros Simplex**:
  - Resaltado estricto de columna pivote, fila pivote y elemento pivote.
  - Registro de transformaciones elementales de fila de Gauss-Jordan.
  - Navegador interactivo de iteraciones con barra de progreso.
- **Alternador Fracciones / Decimales**: Conversión instantánea entre quebrados exactos ($1/2$) y decimales ($0.50$).
- **Método Gráfico 2D**: Gráfico cartesiano SVG con polígono de región factible y vértices extremos evaluados para modelos de 2 variables.
- **Análisis de Sensibilidad y Dualidad**: Tablas de intervalos permisibles e informe del problema dual.
- **Exportación e Impresión**: Descarga/carga de modelos en formato JSON e impresión en PDF con encabezado académico oficial de la UAGRM.

---

## 🛠️ Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo Vite
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.
