import React, { useMemo } from 'react';
import { Target, Info, CheckCircle2, Compass } from 'lucide-react';
import { formatValue } from '../utils/format';

export default function GraphicalMethod({ 
  model, 
  solution, 
  precision = 4, 
  isFractionMode = false 
}) {
  if (!model || model.variable_names.length !== 2) {
    return (
      <div className="bg-[#16181d] border border-[#272a31] rounded-xl p-8 text-center text-zinc-400">
        El Método Gráfico 2D solo está disponible para modelos con exactamente 2 variables de decisión (X₁, X₂).
      </div>
    );
  }

  const [vName1, vName2] = model.variable_names;
  const [c1, c2] = model.c;
  const isMin = model.optimization_type === 'min';

  // Cálculo de vértices, líneas de restricción y región factible
  const graphData = useMemo(() => {
    const rawConstraints = model.constraints;

    // Líneas de restricción: a1*x1 + a2*x2 = b
    const ineqs = rawConstraints.map((cstr, idx) => ({
      a1: Number(cstr.coefficients[0]) || 0,
      a2: Number(cstr.coefficients[1]) || 0,
      rhs: Number(cstr.rhs) || 0,
      op: cstr.operator,
      name: cstr.name || `R${idx + 1}`
    }));

    // Todas las fronteras incluyendo no negatividad
    const boundaryLines = [
      ...ineqs.map(c => ({ a1: c.a1, a2: c.a2, rhs: c.rhs })),
      { a1: 1, a2: 0, rhs: 0 }, // x1 = 0
      { a1: 0, a2: 1, rhs: 0 }  // x2 = 0
    ];

    // Encontrar intersecciones de pares de rectas
    const intersections = [];
    const n = boundaryLines.length;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const l1 = boundaryLines[i];
        const l2 = boundaryLines[j];
        const det = l1.a1 * l2.a2 - l2.a1 * l1.a2;

        if (Math.abs(det) > 1e-9) {
          const x = (l1.rhs * l2.a2 - l2.rhs * l1.a2) / det;
          const y = (l1.a1 * l2.rhs - l2.a1 * l1.rhs) / det;
          intersections.push({ x, y });
        }
      }
    }

    // Filtrar vértices factibles (no negatividad y todas las restricciones)
    const feasibleVertices = [];
    for (const pt of intersections) {
      if (pt.x < -1e-5 || pt.y < -1e-5) continue;

      let isFeasible = true;
      for (const ineq of ineqs) {
        const val = ineq.a1 * pt.x + ineq.a2 * pt.y;
        if (ineq.op === '<=' && val > ineq.rhs + 1e-4) {
          isFeasible = false;
          break;
        } else if (ineq.op === '>=' && val < ineq.rhs - 1e-4) {
          isFeasible = false;
          break;
        } else if (ineq.op === '=' && Math.abs(val - ineq.rhs) > 1e-4) {
          isFeasible = false;
          break;
        }
      }

      if (isFeasible) {
        const alreadyExists = feasibleVertices.some(
          v => Math.abs(v.x - pt.x) < 1e-4 && Math.abs(v.y - pt.y) < 1e-4
        );
        if (!alreadyExists) {
          const zVal = c1 * pt.x + c2 * pt.y;
          feasibleVertices.push({ x: pt.x, y: pt.y, z: zVal });
        }
      }
    }

    // Ordenar vértices angularmente alrededor del centroide para dibujar el polígono convexo
    if (feasibleVertices.length >= 3) {
      const cx = feasibleVertices.reduce((sum, v) => sum + v.x, 0) / feasibleVertices.length;
      const cy = feasibleVertices.reduce((sum, v) => sum + v.y, 0) / feasibleVertices.length;
      feasibleVertices.sort((v1, v2) => Math.atan2(v1.y - cy, v1.x - cx) - Math.atan2(v2.y - cy, v2.x - cx));
    }

    // Identificar el vértice óptimo
    let optimalVertex = null;
    if (feasibleVertices.length > 0) {
      optimalVertex = isMin
        ? feasibleVertices.reduce((min, v) => (v.z < min.z ? v : min), feasibleVertices[0])
        : feasibleVertices.reduce((max, v) => (v.z > max.z ? v : max), feasibleVertices[0]);
    }

    // Dimensiones para escala SVG
    const allX = [...feasibleVertices.map(v => v.x), 5];
    const allY = [...feasibleVertices.map(v => v.y), 5];
    for (const ineq of ineqs) {
      if (Math.abs(ineq.a1) > 1e-6) allX.push(ineq.rhs / ineq.a1);
      if (Math.abs(ineq.a2) > 1e-6) allY.push(ineq.rhs / ineq.a2);
    }
    const maxX = Math.max(...allX.filter(v => v >= 0 && v < 1e6), 10) * 1.25;
    const maxY = Math.max(...allY.filter(v => v >= 0 && v < 1e6), 10) * 1.25;

    return {
      ineqs,
      feasibleVertices,
      optimalVertex,
      maxX,
      maxY
    };
  }, [model, c1, c2, isMin]);

  const { ineqs, feasibleVertices, optimalVertex, maxX, maxY } = graphData;

  // Parámetros de lienzo SVG
  const width = 600;
  const height = 450;
  const padding = 50;

  const toSvgX = (x) => padding + (x / maxX) * (width - 2 * padding);
  const toSvgY = (y) => height - padding - (y / maxY) * (height - 2 * padding);

  // Puntos del polígono factible
  const polygonPoints = feasibleVertices.map(v => `${toSvgX(v.x)},${toSvgY(v.y)}`).join(' ');

  // Colores para las rectas (Paleta Gris con Naranja y neutros)
  const lineColors = ['#ea580c', '#38bdf8', '#a855f7', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="bg-[#16181d] border border-[#272a31] rounded-xl p-6 sm:p-7 shadow-sm space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#272a31]">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#22252e] text-orange-400 border border-[#2e323b]">
              <Compass className="w-4 h-4" />
            </span>
            Método Gráfico 2D (Región Factible y Vértices)
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Representación en el plano cartesiano de las restricciones, región convexa y búsqueda del vértice óptimo.
          </p>
        </div>

        {optimalVertex && (
          <div className="bg-[#111317] border border-[#272a31] px-4 py-2 rounded-lg flex items-center gap-3 font-mono text-xs">
            <span className="text-zinc-400">Vértice Óptimo:</span>
            <span className="text-orange-400 font-bold">
              ({formatValue(optimalVertex.x, precision, isFractionMode)}, {formatValue(optimalVertex.y, precision, isFractionMode)})
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-white font-bold">
              Z* = {formatValue(optimalVertex.z, precision, isFractionMode)}
            </span>
          </div>
        )}
      </div>

      {/* Gráfico SVG y Tabla de Vértices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Lienzo SVG */}
        <div className="lg:col-span-7 bg-[#111317] p-4 rounded-xl border border-[#272a31] flex flex-col items-center">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xl h-auto select-none">
            {/* Cuadrícula tenue */}
            {[0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
              const xVal = maxX * frac;
              const yVal = maxY * frac;
              return (
                <g key={idx} stroke="#22252e" strokeDasharray="3 3">
                  <line x1={toSvgX(xVal)} y1={padding} x2={toSvgX(xVal)} y2={height - padding} />
                  <line x1={padding} y1={toSvgY(yVal)} x2={width - padding} y2={toSvgY(yVal)} />
                </g>
              );
            })}

            {/* Polígono de la Región Factible */}
            {feasibleVertices.length >= 3 && (
              <polygon
                points={polygonPoints}
                fill="rgba(234, 88, 12, 0.18)"
                stroke="#ea580c"
                strokeWidth="2"
              />
            )}

            {/* Ejes X e Y */}
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding + 15}
              y2={height - padding}
              stroke="#52525b"
              strokeWidth="2"
            />
            <line
              x1={padding}
              y1={height - padding}
              x2={padding}
              y2={padding - 15}
              stroke="#52525b"
              strokeWidth="2"
            />

            {/* Etiquetas de los Ejes */}
            <text x={width - padding + 20} y={height - padding + 4} fill="#d4d4d8" fontSize="11" fontWeight="bold">
              X₁ ({vName1})
            </text>
            <text x={padding - 10} y={padding - 20} fill="#d4d4d8" fontSize="11" fontWeight="bold">
              X₂ ({vName2})
            </text>

            {/* Rectas de Restricción */}
            {ineqs.map((ineq, idx) => {
              const color = lineColors[idx % lineColors.length];
              let x1 = 0, y1 = 0, x2 = maxX, y2 = 0;

              if (Math.abs(ineq.a2) > 1e-7) {
                y1 = ineq.rhs / ineq.a2;
                y2 = (ineq.rhs - ineq.a1 * maxX) / ineq.a2;
              } else if (Math.abs(ineq.a1) > 1e-7) {
                x1 = ineq.rhs / ineq.a1;
                x2 = ineq.rhs / ineq.a1;
                y1 = 0;
                y2 = maxY;
              }

              return (
                <line
                  key={idx}
                  x1={toSvgX(x1)}
                  y1={toSvgY(y1)}
                  x2={toSvgX(x2)}
                  y2={toSvgY(y2)}
                  stroke={color}
                  strokeWidth="2"
                />
              );
            })}

            {/* Vértices Factibles */}
            {feasibleVertices.map((v, idx) => {
              const isOpt = optimalVertex && Math.abs(v.x - optimalVertex.x) < 1e-4 && Math.abs(v.y - optimalVertex.y) < 1e-4;
              return (
                <g key={idx}>
                  {isOpt ? (
                    <>
                      <circle cx={toSvgX(v.x)} cy={toSvgY(v.y)} r="6" fill="#ea580c" stroke="#ffffff" strokeWidth="2" />
                      <text
                        x={toSvgX(v.x) + 8}
                        y={toSvgY(v.y) - 8}
                        fill="#f97316"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        ÓPTIMO ({v.x.toFixed(1)}, {v.y.toFixed(1)})
                      </text>
                    </>
                  ) : (
                    <>
                      <circle cx={toSvgX(v.x)} cy={toSvgY(v.y)} r="4" fill="#71717a" stroke="#18181b" strokeWidth="1.5" />
                      <text
                        x={toSvgX(v.x) + 6}
                        y={toSvgY(v.y) - 6}
                        fill="#a1a1aa"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        V{idx + 1}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Leyenda de Restricciones */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3 text-xs">
            <div className="flex items-center gap-1.5 text-orange-400 font-semibold">
              <span className="w-3 h-3 rounded bg-orange-500/25 border border-orange-500" />
              <span>Región Factible</span>
            </div>
            {ineqs.map((ineq, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-3 h-0.5" style={{ backgroundColor: lineColors[idx % lineColors.length] }} />
                <span>{ineq.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabla de Vértices y Evaluación de Z */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-500" />
              Evaluación en los Vértices Extremos
            </h4>
            <p className="text-xs text-zinc-400">
              Por el Teorema Fundamental de la PL, la solución óptima siempre se encuentra en uno de los vértices de la región factible.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#272a31] bg-[#111317]">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#16181d] text-zinc-300 font-bold border-b border-[#272a31]">
                  <th className="p-2.5">Vértice</th>
                  <th className="p-2.5 font-mono">X₁ ({vName1})</th>
                  <th className="p-2.5 font-mono">X₂ ({vName2})</th>
                  <th className="p-2.5 text-right font-mono font-bold">Valor Z</th>
                  <th className="p-2.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22252c] font-mono">
                {feasibleVertices.map((v, idx) => {
                  const isOpt = optimalVertex && Math.abs(v.x - optimalVertex.x) < 1e-4 && Math.abs(v.y - optimalVertex.y) < 1e-4;

                  return (
                    <tr key={idx} className={isOpt ? 'bg-orange-950/20 font-bold' : 'hover:bg-[#16181d]'}>
                      <td className="p-2.5 text-zinc-400">V{idx + 1}</td>
                      <td className="p-2.5 text-white">{formatValue(v.x, precision, isFractionMode)}</td>
                      <td className="p-2.5 text-white">{formatValue(v.y, precision, isFractionMode)}</td>
                      <td className={`p-2.5 text-right ${isOpt ? 'text-orange-400 font-bold' : 'text-zinc-300'}`}>
                        {formatValue(v.z, precision, isFractionMode)}
                      </td>
                      <td className="p-2.5 text-center">
                        {isOpt ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-600/20 text-orange-300 border border-orange-500/40">
                            <CheckCircle2 className="w-3 h-3" /> Óptimo
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-[10px]">Factible</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#111317] rounded-xl border border-[#272a31] text-xs text-zinc-400 space-y-1">
            <span className="font-semibold text-zinc-300 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-orange-500" /> Criterio de Selección:
            </span>
            <p>
              Para {model.optimization_type === 'min' ? 'Minimizar' : 'Maximizar'} Z, se elige el vértice con el {model.optimization_type === 'min' ? 'menor' : 'mayor'} valor evaluado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
