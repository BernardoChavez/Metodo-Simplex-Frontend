/**
 * Datos precargados y ejemplos predefinidos de Investigación Operativa I.
 */

// 1. Formulación de Ración para Canes (Proyecto Final IO1)
export const sampleCanesData = {
  optimization_type: "min",
  variable_names: [
    "Maíz amarillo",
    "Sorgo granífero",
    "Afrecho de arroz",
    "Afrecho de trigo",
    "Torta de soya",
    "Harina de carne/hueso",
    "Aceite de soya"
  ],
  c: [2.95, 1.73, 1.00, 1.35, 3.58, 5.80, 9.50],
  constraints: [
    {
      name: "Proteína Cruda (mínimo 18% -> >= 1800)",
      coefficients: [8.5, 9.0, 12.5, 15.0, 45.0, 50.0, 0.0],
      operator: ">=",
      rhs: 1800.0
    },
    {
      name: "Grasa Cruda (mínimo 5.5% -> >= 550)",
      coefficients: [3.8, 3.3, 13.0, 4.0, 1.5, 10.0, 99.0],
      operator: ">=",
      rhs: 550.0
    },
    {
      name: "Fibra Cruda (mínimo 3.5% -> >= 350)",
      coefficients: [2.2, 2.5, 11.0, 10.0, 6.0, 1.0, 0.0],
      operator: ">=",
      rhs: 350.0
    },
    {
      name: "Calcio (mínimo 0.5% -> >= 50)",
      coefficients: [0.02, 0.04, 0.05, 0.12, 0.28, 8.00, 0.0],
      operator: ">=",
      rhs: 50.0
    },
    {
      name: "Producción total del lote (= 100 kg)",
      coefficients: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
      operator: "=",
      rhs: 100.0
    }
  ],
  decimal_precision: 4,
  max_iterations: 50
};

// 2. Modelo 2D Ideal para Probar el Método Gráfico (2 Variables, 3 Restricciones, Max Z)
export const sample2DData = {
  optimization_type: "max",
  variable_names: ["Pantalones", "Chaquetas"],
  c: [3.0, 5.0],
  constraints: [
    {
      name: "Disponibilidad de Tela (m²)",
      coefficients: [1.0, 0.0],
      operator: "<=",
      rhs: 4.0
    },
    {
      name: "Horas de Costura (hrs)",
      coefficients: [0.0, 2.0],
      operator: "<=",
      rhs: 12.0
    },
    {
      name: "Capacidad de Ensamblaje",
      coefficients: [3.0, 2.0],
      operator: "<=",
      rhs: 18.0
    }
  ],
  decimal_precision: 2,
  max_iterations: 50
};

// 3. Fabricación de Muebles (3 Variables, 4 Restricciones Mixtas, Max Z)
export const sampleFurnitureData = {
  optimization_type: "max",
  variable_names: ["Mesas", "Sillas", "Escritorios"],
  c: [50.0, 30.0, 45.0],
  constraints: [
    {
      name: "Madera disponible (pies)",
      coefficients: [2.0, 1.0, 3.0],
      operator: "<=",
      rhs: 60.0
    },
    {
      name: "Horas de carpintería",
      coefficients: [4.0, 2.0, 1.0],
      operator: "<=",
      rhs: 80.0
    },
    {
      name: "Horas de acabado",
      coefficients: [1.0, 1.0, 1.0],
      operator: "<=",
      rhs: 30.0
    },
    {
      name: "Demanda mínima de mesas",
      coefficients: [1.0, 0.0, 0.0],
      operator: ">=",
      rhs: 5.0
    }
  ],
  decimal_precision: 2,
  max_iterations: 50
};
