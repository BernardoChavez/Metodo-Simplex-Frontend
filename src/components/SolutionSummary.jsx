import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  PieChart, 
  Scale, 
  Coins, 
  Check, 
  Layers, 
  Lock, 
  Printer, 
  Sliders, 
  GitCompare, 
  ArrowRight 
} from 'lucide-react';
import { formatValue } from '../utils/format';

export default function SolutionSummary({ 
  response, 
  model, 
  isFractionMode = false 
}) {
  if (!response) return null;

  const {
    status,
    message,
    optimal_z,
    solution = {},
    slack_surplus = {},
    constraints_analysis = [],
    cost_sensitivity = [],
    rhs_sensitivity = [],
    dual_problem = null,
    has_alternative_optima = false,
    alternative_optima_vars = [],
    total_iterations,
    phase1_iterations,
    phase2_iterations
  } = response;

  const [activeSubTab, setActiveSubTab] = useState('solution'); // 'solution' | 'sensitivity' | 'dual'

  const isOptimal = status === 'OPTIMAL';
  const isInfeasible = status === 'INFEASIBLE';
  const isUnbounded = status === 'UNBOUNDED';

  const precision = model?.decimal_precision || 4;
  const totalWeight = Object.values(solution).reduce((acc, val) => acc + val, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#16181d] border border-[#272a31] rounded-xl p-6 sm:p-7 shadow-sm space-y-6">
      {/* Encabezado Académico Exclusivo para Impresión / PDF */}
      <div className="hidden print:flex items-center justify-between border-b-2 border-zinc-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <img src="/escudo_ficct.png" alt="Escudo FICCT" className="w-14 h-14 object-contain" />
          <div>
            <h1 className="text-base font-bold uppercase text-zinc-900 tracking-tight">
              Universidad Autónoma Gabriel René Moreno
            </h1>
            <h2 className="text-xs font-semibold text-zinc-700">
              Facultad Integral de Ciencias de la Computación y Telecomunicaciones (FICCT)
            </h2>
            <p className="text-[11px] text-zinc-600">
              Investigación Operativa I &middot; Reporte de Solución Óptima y Sensibilidad Simplex Dos Fases
            </p>
          </div>
        </div>
        <div className="text-right text-[11px] text-zinc-600 font-mono">
          <p className="font-bold text-zinc-900">UAGRM &middot; FICCT</p>
          <p>Santa Cruz de la Sierra, Bolivia</p>
          <p>{new Date().toLocaleDateString('es-BO')}</p>
        </div>
      </div>

      {/* Barra de Encabezado y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#272a31]">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#22252e] text-orange-400 border border-[#2e323b]">
              <PieChart className="w-4 h-4" />
            </span>
            Resultados y Análisis Operativo
          </h3>
          <p className="text-xs text-zinc-400">
            Interpretación económica, dualidad y sensibilidad post-óptima para el proyecto de raciones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Subpestañas Sólidas en Gris y Naranja */}
          <div className="flex items-center gap-1 bg-[#111317] p-1 rounded-lg border border-[#272a31] text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveSubTab('solution')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeSubTab === 'solution'
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-[#22252e]'
              }`}
            >
              Solución y Recursos
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('sensitivity')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                activeSubTab === 'sensitivity'
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-[#22252e]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Sensibilidad</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('dual')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                activeSubTab === 'dual'
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-[#22252e]'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Problema Dual</span>
            </button>
          </div>

          {/* Botón de Impresión / PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#22252e] hover:bg-[#2c303b] text-zinc-300 font-medium rounded-lg border border-[#2e323b] transition-colors text-xs active:scale-95"
            title="Imprimir o exportar reporte a PDF"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Banner de Estado */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
        isOptimal 
          ? 'bg-[#121c16] border-emerald-800/60 text-emerald-300' 
          : isInfeasible 
          ? 'bg-[#241416] border-red-800/60 text-red-300'
          : 'bg-[#241e14] border-amber-800/60 text-amber-300'
      }`}>
        {isOptimal && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
        {isInfeasible && <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
        {isUnbounded && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
        
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-sm tracking-wide text-white">
              {isOptimal ? 'Solución Óptima Encontrada' : `Estado: ${status}`}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#111317] font-mono border border-[#272a31] text-zinc-300">
              {total_iterations} iteraciones ({phase1_iterations} en Fase 1, {phase2_iterations} en Fase 2)
            </span>
          </div>
          <p className="text-xs opacity-90">{message}</p>
        </div>
      </div>

      {/* Alerta de Soluciones Múltiples (Óptimos Alternativos) */}
      {has_alternative_optima && (
        <div className="p-4 rounded-xl bg-[#1e1728] border border-purple-800/60 text-purple-200 flex items-start gap-3">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-purple-300">
              Existen Múltiples Soluciones Óptimas Alternativas
            </h4>
            <p className="text-xs text-purple-200/90">
              Al menos una variable no básica tiene costo reducido igual a cero (<code className="bg-purple-950 px-1 py-0.5 rounded font-mono">Zⱼ - Cⱼ = 0</code>). 
              Esto significa que dicha variable puede ingresar a la base generando otra mezcla factible exactamente con el mismo costo óptimo.
            </p>
            {alternative_optima_vars.length > 0 && (
              <p className="text-xs text-purple-300 font-mono mt-1">
                Variables candidatas a entrar: <strong>{alternative_optima_vars.join(', ')}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {isOptimal && activeSubTab === 'solution' && (
        <>
          {/* Métricas Principales en Gris con Acento Naranja */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111317] border border-[#272a31] p-5 rounded-xl space-y-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-orange-500" />
                Costo Óptimo Total (Z*)
              </span>
              <div className="text-3xl font-extrabold text-white font-mono flex items-baseline gap-1.5">
                <span className="text-orange-400">{formatValue(optimal_z, precision, isFractionMode)}</span>
                <span className="text-sm text-orange-500 font-bold">Bs</span>
              </div>
              <p className="text-xs text-zinc-400">
                {model?.optimization_type === 'min' ? 'Costo mínimo para el lote de 100 kg' : 'Beneficio máximo alcanzado'}
              </p>
            </div>

            <div className="bg-[#111317] border border-[#272a31] p-5 rounded-xl space-y-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-zinc-400" />
                Peso Total Formulado
              </span>
              <div className="text-3xl font-extrabold text-white font-mono flex items-baseline gap-1.5">
                <span>{formatValue(totalWeight, precision, isFractionMode)}</span>
                <span className="text-sm text-zinc-400 font-normal">kg</span>
              </div>
              <p className="text-xs text-zinc-400">
                Suma de materias primas seleccionadas (cumple restricción de 100 kg)
              </p>
            </div>

            <div className="bg-[#111317] border border-[#272a31] p-5 rounded-xl space-y-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-zinc-400" />
                Ingredientes en la Mezcla
              </span>
              <div className="text-3xl font-extrabold text-white font-mono">
                {Object.values(solution).filter(v => v > 0.0001).length} / {Object.keys(solution).length}
              </div>
              <p className="text-xs text-zinc-400">
                Materias primas con aporte positivo &gt; 0 en la solución básica
              </p>
            </div>
          </div>

          {/* Tabla de Variables de Decisión */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-orange-500" />
                Composición Óptima de la Ración (Variables de Decisión Xⱼ)
              </h4>
              <span className="text-xs text-zinc-400">
                Unidad: <strong className="text-orange-400">Bolivianos (Bs)</strong> y <strong className="text-zinc-200">Kilogramos (kg)</strong>
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#272a31] bg-[#111317]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#16181d] text-zinc-300 font-bold border-b border-[#272a31]">
                    <th className="p-3">Variable</th>
                    <th className="p-3">Materia Prima</th>
                    <th className="p-3 text-right">Cantidad Óptima</th>
                    <th className="p-3 text-right">% Participación</th>
                    <th className="p-3 text-right">Costo Unitario</th>
                    <th className="p-3 text-right">Costo Total</th>
                    <th className="p-3 text-center">Estado en la Base</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#22252c] font-mono">
                  {Object.entries(solution).map(([varName, val], idx) => {
                    const percentage = totalWeight > 0 ? (val / totalWeight) * 100 : 0;
                    const unitCost = model?.c[idx] || 0;
                    const subtotal = val * unitCost;
                    const isUsed = val > 0.0001;

                    return (
                      <tr key={idx} className={isUsed ? 'bg-[#14161b] hover:bg-[#1a1c22]' : 'opacity-50'}>
                        <td className="p-3 font-bold text-orange-400">X{idx + 1}</td>
                        <td className="p-3 font-sans font-medium text-white">{varName}</td>
                        <td className="p-3 text-right font-bold text-white">
                          {formatValue(val, precision, isFractionMode)} kg
                        </td>
                        <td className="p-3 text-right text-zinc-300">
                          {percentage.toFixed(2)}%
                        </td>
                        <td className="p-3 text-right text-zinc-400">
                          {unitCost.toFixed(2)} Bs/kg
                        </td>
                        <td className="p-3 text-right font-bold text-orange-400">
                          {formatValue(subtotal, precision, isFractionMode)} Bs
                        </td>
                        <td className="p-3 text-center">
                          {isUsed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-[#22252e] text-orange-400 border border-[#2e323b]">
                              <Check className="w-3 h-3 text-orange-500" /> Básica
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium text-zinc-500 bg-[#16181d]">
                              No Básica (0 kg)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de Análisis Detallado de Restricciones */}
          {constraints_analysis.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  Análisis de Restricciones, Recursos y Precios Sombra Duales
                </h4>
                <span className="text-xs text-zinc-400">
                  Dualidad &middot; Sensibilidad de Recursos
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#272a31] bg-[#111317]">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#16181d] text-zinc-300 font-bold border-b border-[#272a31]">
                      <th className="p-3">Restricción</th>
                      <th className="p-3 text-center">Operador</th>
                      <th className="p-3 text-right">Requerimiento (RHS)</th>
                      <th className="p-3 text-right">Valor Obtenido (LHS)</th>
                      <th className="p-3 text-right">Holgura / Exceso</th>
                      <th className="p-3 text-center">Estado del Recurso</th>
                      <th className="p-3 text-right">Precio Sombra (Dual yᵢ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#22252c] font-mono">
                    {constraints_analysis.map((cstr, cIdx) => (
                      <tr 
                        key={cIdx} 
                        className={`transition-colors ${
                          cstr.is_binding 
                            ? 'bg-orange-950/15 hover:bg-orange-950/25' 
                            : 'hover:bg-[#16181d]'
                        }`}
                      >
                        <td className="p-3 font-sans font-medium text-white flex items-center gap-2">
                          <span className="font-mono text-zinc-400 font-bold">R{cIdx + 1}</span>
                          <span>{cstr.name}</span>
                        </td>
                        <td className="p-3 text-center font-bold text-orange-400">
                          {cstr.operator}
                        </td>
                        <td className="p-3 text-right text-zinc-300">
                          {formatValue(cstr.rhs, precision, isFractionMode)}
                        </td>
                        <td className="p-3 text-right font-bold text-white">
                          {formatValue(cstr.lhs, precision, isFractionMode)}
                        </td>
                        <td className="p-3 text-right text-zinc-400">
                          {formatValue(cstr.slack_or_surplus, precision, isFractionMode)}
                        </td>
                        <td className="p-3 text-center">
                          {cstr.is_binding ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-orange-600/20 text-orange-300 border border-orange-500/40">
                              <Lock className="w-3 h-3 text-orange-400" /> Activa / Limitante
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-medium text-zinc-400 bg-[#16181d]">
                              No Limitante (Holgada)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-bold text-orange-400">
                          {cstr.shadow_price > 0 ? (
                            <span>{formatValue(cstr.shadow_price, precision, isFractionMode)} Bs/ud</span>
                          ) : (
                            <span className="text-zinc-500">0.00 Bs/ud</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tarjetas de Holguras y Excesos (S y E) */}
          {Object.keys(slack_surplus).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-500" />
                Variables Auxiliares del Modelo Canónico (Holguras S y Excesos E)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(slack_surplus).map(([varName, val], idx) => {
                  const isSlack = varName.startsWith('S');
                  const isBinding = val < 0.005;

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border space-y-1.5 ${
                        isBinding
                          ? 'bg-orange-950/20 border-orange-600/40'
                          : 'bg-[#111317] border-[#272a31]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#16181d] text-zinc-200 border border-[#272a31]">
                          {varName} ({isSlack ? 'Holgura' : 'Exceso'})
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isBinding
                            ? 'bg-orange-600/20 text-orange-300 border border-orange-500/40'
                            : 'bg-[#16181d] text-zinc-400'
                        }`}>
                          {isBinding ? 'Activa (= 0)' : 'Sobrecumplida'}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-300 font-mono">
                        Valor: <span className="font-bold text-white">{formatValue(val, precision, isFractionMode)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Subpestaña 2: Análisis de Sensibilidad (Rangos c_j y b_i) */}
      {isOptimal && activeSubTab === 'sensitivity' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#111317] border border-[#272a31] text-xs text-zinc-300 space-y-1">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-500" />
              ¿Qué es el Análisis de Sensibilidad?
            </h4>
            <p>
              Determina los <strong>intervalos de variación permisibles</strong> en los costos unitarios (cⱼ) y en los requerimientos de recursos (bᵢ) 
              dentro de los cuales la base óptima actual <strong>se mantiene inalterada</strong> sin necesidad de resolver todo el problema nuevamente.
            </p>
          </div>

          {/* Rangos de Coeficientes de Costo (c_j) */}
          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-orange-500" />
              Rangos de Sensibilidad para Costos Unitarios (cⱼ en Bs/kg)
            </h4>

            <div className="overflow-x-auto rounded-xl border border-[#272a31] bg-[#111317]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#16181d] text-zinc-300 font-bold border-b border-[#272a31]">
                    <th className="p-3">Variable</th>
                    <th className="p-3 text-right">Costo Actual (cⱼ)</th>
                    <th className="p-3 text-right">Mínimo Permisible</th>
                    <th className="p-3 text-right">Máximo Permisible</th>
                    <th className="p-3 text-center">Estado</th>
                    <th className="p-3">Interpretación Económica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#22252c] font-mono">
                  {cost_sensitivity.map((cs, idx) => {
                    const minStr = cs.min_allowable !== null ? `${formatValue(cs.min_allowable, precision, isFractionMode)} Bs` : '-∞';
                    const maxStr = cs.max_allowable !== null ? `${formatValue(cs.max_allowable, precision, isFractionMode)} Bs` : '+∞';

                    return (
                      <tr key={idx} className="hover:bg-[#16181d]">
                        <td className="p-3 font-sans font-medium text-white">{cs.name}</td>
                        <td className="p-3 text-right font-bold text-orange-400">{cs.current_value} Bs</td>
                        <td className="p-3 text-right text-zinc-300">{minStr}</td>
                        <td className="p-3 text-right text-zinc-300">{maxStr}</td>
                        <td className="p-3 text-center">
                          {cs.is_basic ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#22252e] text-orange-400 border border-[#2e323b]">
                              Básica (En mezcla)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium text-zinc-400 bg-[#16181d]">
                              No Básica
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-sans text-[11px] text-zinc-400">
                          {cs.is_basic
                            ? `Si el precio se mantiene entre ${minStr} y ${maxStr}, la mezcla óptima sigue usando este ingrediente.`
                            : `Su precio debe bajar a menos de ${minStr} para que sea rentable incluirlo en la mezcla.`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rangos de Lados Derechos (b_i) */}
          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-orange-500" />
              Rangos de Sensibilidad para Lados Derechos / Requerimientos (bᵢ)
            </h4>

            <div className="overflow-x-auto rounded-xl border border-[#272a31] bg-[#111317]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#16181d] text-zinc-300 font-bold border-b border-[#272a31]">
                    <th className="p-3">Restricción</th>
                    <th className="p-3 text-right">Valor Actual (bᵢ)</th>
                    <th className="p-3 text-right">Límite Inferior</th>
                    <th className="p-3 text-right">Límite Superior</th>
                    <th className="p-3">Impacto en el Costo Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#22252c] font-mono">
                  {rhs_sensitivity.map((rs, idx) => {
                    const minStr = rs.min_allowable !== null ? formatValue(rs.min_allowable, precision, isFractionMode) : '-∞';
                    const maxStr = rs.max_allowable !== null ? formatValue(rs.max_allowable, precision, isFractionMode) : '+∞';

                    return (
                      <tr key={idx} className="hover:bg-[#16181d]">
                        <td className="p-3 font-sans font-medium text-white">{rs.name}</td>
                        <td className="p-3 text-right font-bold text-orange-400">{rs.current_value}</td>
                        <td className="p-3 text-right text-zinc-300">{minStr}</td>
                        <td className="p-3 text-right text-zinc-300">{maxStr}</td>
                        <td className="p-3 font-sans text-[11px] text-zinc-400">
                          Dentro de [{minStr}, {maxStr}], cada unidad adicional cambia el costo en su precio sombra correspondiente.
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subpestaña 3: Problema Dual */}
      {isOptimal && activeSubTab === 'dual' && dual_problem && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#111317] border border-[#272a31] text-xs text-zinc-300 space-y-1">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-orange-500" />
              Teorema Fundamental de la Dualidad
            </h4>
            <p>
              Todo problema de Programación Lineal (Primal) tiene un problema Dual simétrico asociado. 
              Por el <strong>Teorema de Dualidad Fuerte</strong>, el costo mínimo del Primal es exactamente igual al beneficio máximo del Dual:
              <strong className="text-orange-400 font-mono ml-1">Z* = W* = {formatValue(optimal_z, precision, isFractionMode)} Bs</strong>.
            </p>
          </div>

          {/* Formulación Dual */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Función Objetivo Dual */}
            <div className="bg-[#111317] border border-[#272a31] p-5 rounded-xl space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-orange-500" />
                Función Objetivo Dual (W)
              </h5>
              <div className="bg-[#16181d] p-3 rounded-lg border border-[#272a31] font-mono text-sm text-orange-400 overflow-x-auto">
                {dual_problem.objective_function}
              </div>
              <div className="text-xs text-zinc-400 flex items-center justify-between">
                <span>Valor Óptimo Dual:</span>
                <span className="font-mono font-bold text-white text-base">
                  W* = {formatValue(dual_problem.optimal_w, precision, isFractionMode)} Bs
                </span>
              </div>
            </div>

            {/* Solución Dual (Variables Y_i) */}
            <div className="bg-[#111317] border border-[#272a31] p-5 rounded-xl space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-orange-500" />
                Valores Óptimos de las Variables Duales (Yᵢ)
              </h5>
              <div className="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto pr-1">
                {Object.entries(dual_problem.dual_solution).map(([yName, yVal], idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#16181d] px-3 py-1.5 rounded border border-[#272a31]">
                    <span className="text-zinc-300 font-sans">{yName}</span>
                    <span className="font-bold text-orange-400">
                      {formatValue(yVal, precision, isFractionMode)} Bs/ud
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Restricciones Duales */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-500" />
              Restricciones del Problema Dual (Asociadas a cada Variable Primal Xⱼ)
            </h5>
            <div className="bg-[#111317] border border-[#272a31] rounded-xl p-4 space-y-2 font-mono text-xs">
              {dual_problem.constraints.map((dCstr, idx) => (
                <div key={idx} className="bg-[#16181d] px-3 py-2 rounded border border-[#272a31] text-zinc-300 flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>{dCstr}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
