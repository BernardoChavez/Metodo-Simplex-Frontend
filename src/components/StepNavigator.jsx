import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';

export default function StepNavigator({ 
  currentStepIndex, 
  totalSteps, 
  onStepChange,
  steps = []
}) {
  if (totalSteps <= 0) return null;

  const currentStep = steps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  return (
    <div className="bg-[#16181d] border border-[#272a31] rounded-xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Información del Paso Actual */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#22252e] border border-[#2e323b] text-orange-400 font-mono font-bold text-sm shrink-0">
          #{currentStepIndex + 1}
        </div>
        <div className="space-y-0.5 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-tight">
              Paso {currentStepIndex + 1} de {totalSteps}
            </span>
            {currentStep && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#22252e] text-orange-400 border border-[#2e323b]">
                Fase {currentStep.phase}
              </span>
            )}
            {isLast && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-600/20 text-orange-300 border border-orange-500/40">
                Óptimo
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 truncate max-w-xs sm:max-w-md">
            {currentStep?.description || 'Iteración Simplex Gauss-Jordan'}
          </p>
        </div>
      </div>

      {/* Control Deslizante de Pasos */}
      <div className="flex-1 max-w-sm w-full px-2 space-y-1">
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
          <span>Inicio</span>
          <span className="text-orange-400 font-semibold">{progressPercent}% completado</span>
          <span>Óptimo</span>
        </div>
        <input
          type="range"
          min="0"
          max={totalSteps - 1}
          value={currentStepIndex}
          onChange={(e) => onStepChange(parseInt(e.target.value))}
          className="w-full accent-orange-500 cursor-pointer h-1.5 bg-[#272a31] rounded-lg transition-all"
        />
      </div>

      {/* Botones de Navegación con Colores Sólidos */}
      <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
        <button
          type="button"
          onClick={() => onStepChange(0)}
          disabled={isFirst}
          className="p-2 rounded-lg bg-[#22252e] hover:bg-[#2c303b] text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-[#2e323b]"
          title="Primer Tablero"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onStepChange(currentStepIndex - 1)}
          disabled={isFirst}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#22252e] hover:bg-[#2c303b] text-zinc-200 font-medium text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-[#2e323b]"
          title="Paso Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        <button
          type="button"
          onClick={() => onStepChange(currentStepIndex + 1)}
          disabled={isLast}
          className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
          title="Siguiente Paso"
        >
          <span>Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onStepChange(totalSteps - 1)}
          disabled={isLast}
          className="p-2 rounded-lg bg-[#22252e] hover:bg-[#2c303b] text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-[#2e323b]"
          title="Último Tablero (Solución Óptima)"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
