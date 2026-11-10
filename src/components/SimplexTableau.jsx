import React from 'react';
import { ArrowDown, ArrowLeft, Target, CheckCircle2, Terminal } from 'lucide-react';
import { formatValue } from '../utils/format';

export default function SimplexTableau({ 
  step, 
  precision = 4, 
  optimizationType = 'min',
  isFractionMode = false 
}) {
  if (!step) {
    return (
      <div className="bg-[#16181d] border border-[#272a31] rounded-xl p-10 text-center text-zinc-400 space-y-2">
        <p className="font-semibold text-sm text-zinc-300">No hay datos de iteración para mostrar.</p>
        <p className="text-xs text-zinc-500">Configura el modelo y presiona "Resolver con Simplex Dos Fases".</p>
      </div>
    );
  }

  const {
    phase,
    phase_title,
    step_number,
    description,
    objective_name = (phase === 1 ? 'W' : 'Z'),
    indicator_label,
    headers,
    matrix,
    basic_vars,
    cb,
    cj,
    zj,
    zj_cj,
    pivot_row,
    pivot_col,
    pivot_element,
    entering_var,
    leaving_var,
    ratios,
    row_operations
  } = step;

  const varHeaders = headers.slice(0, headers.length - 1);
  const isFinalStep = pivot_row === null || pivot_row === undefined;
  const isMin = optimizationType.toLowerCase() === 'min';

  const defaultIndicator = phase === 1 
    ? 'Wⱼ - Cⱼ' 
    : (isMin ? 'Zⱼ - Cⱼ' : 'Cⱼ - Zⱼ');
  const activeIndicatorLabel = indicator_label || defaultIndicator;

  const currentObjVal = matrix.reduce((acc, row, rIdx) => acc + cb[rIdx] * row[row.length - 1], 0);

  return (
    <div className="bg-[#16181d] border border-[#272a31] rounded-xl p-6 sm:p-7 shadow-sm space-y-6">
      {/* Encabezado del Tablero con Resumen de Pivote */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#272a31]">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#22252e] text-orange-400 border border-[#2e323b]">
              {phase === 1 ? 'Fase 1' : 'Fase 2'}
            </span>
            <span className="text-xs font-medium text-zinc-400 font-mono bg-[#111317] px-2 py-0.5 rounded border border-[#272a31]">
              Iteración #{step_number}
            </span>
            {isFinalStep && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-orange-600/20 text-orange-300 border border-orange-500/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                Tablero Óptimo de {phase === 1 ? 'Fase 1' : 'Fase 2'}
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{phase_title}</h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">{description}</p>
        </div>

        {/* Resumen del Pivote Visual */}
        {!isFinalStep && (
          <div className="flex flex-wrap items-center gap-2 bg-[#111317] border border-[#272a31] p-2.5 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs text-zinc-300">
              <span className="text-zinc-500 text-[11px]">Entra:</span>
              <span className="font-mono font-bold text-orange-400 bg-[#1e2027] px-2 py-0.5 rounded border border-[#2e323b] flex items-center gap-1">
                <ArrowDown className="w-3 h-3 text-orange-400" />
                {entering_var}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-300">
              <span className="text-zinc-500 text-[11px]">Sale:</span>
              <span className="font-mono font-bold text-red-400 bg-[#1e2027] px-2 py-0.5 rounded border border-[#2e323b] flex items-center gap-1">
                <ArrowLeft className="w-3 h-3 text-red-400" />
                {leaving_var}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-300">
              <span className="text-zinc-500 text-[11px]">Pivote:</span>
              <span className="font-mono font-bold text-white bg-orange-600 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                <Target className="w-3 h-3 text-white" />
                {formatValue(pivot_element, precision, isFractionMode)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Renderizado de la Tabla Simplex */}
      <div className="overflow-x-auto rounded-lg border border-[#272a31] bg-[#111317]">
        <table className="w-full border-collapse text-xs text-left">
          <thead>
            {/* Fila de Costos Cj */}
            <tr className="bg-[#14161b] text-zinc-400 border-b border-[#272a31] font-mono text-[11px]">
              <th className="p-2.5 text-center text-zinc-500 bg-[#14161b]" colSpan={2}>
                Cⱼ
              </th>
              {cj.map((cost, idx) => (
                <th
                  key={idx}
                  className={`p-2.5 text-center transition-colors ${
                    idx === pivot_col ? 'bg-orange-500/10 text-orange-400 font-bold' : ''
                  }`}
                >
                  {formatValue(cost, precision, isFractionMode)}
                </th>
              ))}
              <th className="p-2.5 text-center text-zinc-600">--</th>
              {!isFinalStep && ratios && (
                <th className="p-2.5 text-center text-zinc-600">--</th>
              )}
            </tr>

            {/* Fila de Encabezados Principales */}
            <tr className="bg-[#181a20] text-zinc-200 border-b border-[#272a31] font-bold text-xs">
              <th className="p-3 text-center border-r border-[#272a31] w-16 bg-[#181a20] sticky left-0 z-10 shadow-sm">
                Base
              </th>
              <th className="p-3 text-center border-r border-[#272a31] w-16 bg-[#181a20]">
                C_B
              </th>
              {varHeaders.map((header, colIdx) => {
                const isPivotCol = colIdx === pivot_col;
                return (
                  <th
                    key={colIdx}
                    className={`p-3 text-center border-r border-[#272a31] transition-colors ${
                      isPivotCol
                        ? 'bg-orange-500/15 text-orange-400 font-bold border-b-2 border-b-orange-500'
                        : ''
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span>{header}</span>
                      {isPivotCol && (
                        <span className="text-[10px] text-orange-400 font-normal flex items-center gap-0.5">
                          <ArrowDown className="w-2.5 h-2.5" /> Entra
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
              <th className="p-3 text-center border-r border-[#272a31] bg-[#181a20] text-orange-400 font-bold">
                RHS (b)
              </th>
              {!isFinalStep && ratios && (
                <th className="p-3 text-center bg-[#181a20] text-zinc-300">
                  Razón (θ = b/a)
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#22252c] font-mono">
            {matrix.map((rowVals, rowIdx) => {
              const isPivotRow = rowIdx === pivot_row;
              const rhsVal = rowVals[rowVals.length - 1];
              const ratioVal = ratios && ratios[rowIdx];

              return (
                <tr
                  key={rowIdx}
                  className={`transition-colors ${
                    isPivotRow
                      ? 'bg-red-950/20 hover:bg-red-950/30'
                      : 'hover:bg-[#16181d]'
                  }`}
                >
                  {/* Variable Básica */}
                  <td className={`p-3 text-center font-bold border-r border-[#272a31] sticky left-0 z-10 ${
                    isPivotRow ? 'text-red-400 bg-[#1e1418] font-black' : 'text-zinc-300 bg-[#111317]'
                  }`}>
                    <div className="flex items-center justify-center gap-1.5">
                      {isPivotRow && <ArrowLeft className="w-3.5 h-3.5 text-red-400" />}
                      <span>{basic_vars[rowIdx]}</span>
                    </div>
                  </td>

                  {/* Costo en Base (CB) */}
                  <td className="p-3 text-center text-zinc-400 border-r border-[#272a31]">
                    {formatValue(cb[rowIdx], precision, isFractionMode)}
                  </td>

                  {/* Coeficientes a_ij */}
                  {rowVals.slice(0, rowVals.length - 1).map((val, colIdx) => {
                    const isPivotCell = isPivotRow && colIdx === pivot_col;
                    const isColHighlighted = colIdx === pivot_col;

                    return (
                      <td
                        key={colIdx}
                        className={`p-3 text-center border-r border-[#272a31] transition-colors ${
                          isPivotCell
                            ? 'bg-orange-600 text-white font-black'
                            : isColHighlighted
                            ? 'bg-orange-500/10 text-orange-300 font-medium'
                            : isPivotRow
                            ? 'text-red-200 bg-red-950/10'
                            : 'text-zinc-300'
                        }`}
                      >
                        {formatValue(val, precision, isFractionMode)}
                      </td>
                    );
                  })}

                  {/* Lado Derecho (RHS) */}
                  <td className={`p-3 text-center font-bold border-r border-[#272a31] ${
                    isPivotRow ? 'text-red-300' : 'text-orange-400'
                  }`}>
                    {formatValue(rhsVal, precision, isFractionMode)}
                  </td>

                  {/* Razón Mínima Theta */}
                  {!isFinalStep && ratios && (
                    <td className={`p-3 text-center ${
                      isPivotRow
                        ? 'font-bold text-red-300 bg-red-950/40'
                        : 'text-zinc-500'
                    }`}>
                      {ratioVal !== null && ratioVal !== undefined 
                        ? formatValue(ratioVal, precision, isFractionMode) 
                        : '—'}
                    </td>
                  )}
                </tr>
              );
            })}

            {/* Fila Zj o Wj */}
            <tr className="bg-[#14161b] font-bold border-t-2 border-[#272a31] text-zinc-300">
              <td className="p-3 text-center border-r border-[#272a31] sticky left-0 z-10 bg-[#14161b]" colSpan={2}>
                {objective_name}ⱼ
              </td>
              {zj.map((val, idx) => (
                <td
                  key={idx}
                  className={`p-3 text-center border-r border-[#272a31] ${
                    idx === pivot_col ? 'bg-orange-500/10 text-orange-400' : ''
                  }`}
                >
                  {formatValue(val, precision, isFractionMode)}
                </td>
              ))}
              {/* Valor actual de Z o W */}
              <td className="p-3 text-center text-orange-400 bg-[#1b1e26] border-r border-[#272a31] font-bold">
                <span title={`${objective_name} = ${currentObjVal.toFixed(precision)}`}>
                  {formatValue(currentObjVal, precision, isFractionMode)}
                </span>
              </td>
              {!isFinalStep && ratios && <td className="p-3 bg-[#14161b]"></td>}
            </tr>

            {/* Fila de Indicadores: Wj - Cj (Fase 1) o Zj - Cj / Cj - Zj (Fase 2) */}
            <tr className="bg-[#14161b] font-bold border-t border-[#272a31] text-zinc-300">
              <td className="p-3 text-center border-r border-[#272a31] text-orange-400 sticky left-0 z-10 bg-[#14161b]" colSpan={2}>
                {activeIndicatorLabel}
              </td>
              {zj_cj.map((val, idx) => {
                const isPivotCol = idx === pivot_col;
                return (
                  <td
                    key={idx}
                    className={`p-3 text-center border-r border-[#272a31] ${
                      isPivotCol
                        ? 'bg-orange-500/20 text-orange-400 font-bold'
                        : val > 0
                        ? 'text-orange-400'
                        : 'text-zinc-500'
                    }`}
                  >
                    {formatValue(val, precision, isFractionMode)}
                  </td>
                );
              })}
              <td className="p-3 text-center text-zinc-600 border-r border-[#272a31]">--</td>
              {!isFinalStep && ratios && <td className="p-3 bg-[#14161b]"></td>}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Operaciones Elementales de Gauss-Jordan Aplicadas */}
      {row_operations && row_operations.length > 0 && (
        <div className="bg-[#111317] border border-[#272a31] rounded-xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-orange-500" />
            <span>Transformaciones Elementales de Fila (Gauss-Jordan)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono text-zinc-300">
            {row_operations.map((op, opIdx) => (
              <div
                key={opIdx}
                className="bg-[#16181d] px-3 py-1.5 rounded-lg border border-[#272a31] flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                <span className="text-zinc-200">{op}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
