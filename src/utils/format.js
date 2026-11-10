import Fraction from 'fraction.js';

/**
 * Formatea un número flotante en formato decimal o como fracción exacta.
 * 
 * @param {number|null|undefined} val - Número a formatear
 * @param {number} precision - Decimales a mostrar en modo decimal
 * @param {boolean} isFraction - Si es true, intenta convertir a fracción irreducible
 * @returns {string} - Representación formateada
 */
export function formatValue(val, precision = 4, isFraction = false) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  if (isNaN(num)) return '—';
  if (Math.abs(num) < 1e-9) return '0';

  if (!isFraction) {
    // Modo decimal redondeado
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: precision,
      useGrouping: false
    });
  }

  // Modo fracción
  try {
    const f = new Fraction(num);
    // Si el denominador es absurdo (ej: > 10,000 por redondeo flotante), usar aproximación simple o decimal
    if (f.d > 10000) {
      // Intentar simplificar redondeando a la precisión
      const rounded = Number(num.toFixed(precision));
      const fApprox = new Fraction(rounded);
      if (fApprox.d <= 10000) {
        return fApprox.toFraction();
      }
      return num.toFixed(precision);
    }
    return f.toFraction();
  } catch (e) {
    return num.toFixed(precision);
  }
}

