import React, { useState } from 'react';
import {
  Calculator,
  Table2,
  PieChart,
  AlertCircle,
  Binary,
  Code2,
  Compass
} from 'lucide-react';
import escudoFicct from './assets/escudo_ficct.png';
import ModelForm from './components/ModelForm';
import SimplexTableau from './components/SimplexTableau';
import StepNavigator from './components/StepNavigator';
import SolutionSummary from './components/SolutionSummary';
import GraphicalMethod from './components/GraphicalMethod';
import { sampleCanesData } from './data/sampleData';
import { solveSimplex } from './services/api';

export default function App() {
  const [model, setModel] = useState(sampleCanesData);
  const [solution, setSolution] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('model'); // 'model' | 'tableaus' | 'solution' | 'graphical'
  const [isFractionMode, setIsFractionMode] = useState(false);

  const is2DModel = model.variable_names && model.variable_names.length === 2;

  const handleSolve = async (modelToSolve) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = modelToSolve || model;
      const res = await solveSimplex(payload);
      setSolution(res);
      setCurrentStepIndex(0);
      setActiveTab('tableaus');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error de conexión con el backend FastAPI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111317] text-zinc-100 flex flex-col font-sans selection:bg-orange-600/30 selection:text-orange-200">
      {/* Barra de Navegación Superior - Diseño Limpio Gris Sólido */}
      <header className="border-b border-[#272a31] bg-[#16181d] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo FICCT y Título Oficial */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('model')}
              className="flex items-center gap-3 text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1f2229] border border-[#2e323b] flex items-center justify-center p-1 shadow-sm">
                <img
                  src={escudoFicct}
                  alt="Escudo FICCT - UAGRM"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Simplex FICCT
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#22252d] text-orange-400 border border-[#2e323b]">
                    Dos Fases &bull; IO1
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 hidden sm:block">
                  Facultad Integral de Ciencias de la Computación y Telecomunicaciones &middot; UAGRM
                </p>
              </div>
            </button>
          </div>

          {/* Selector de Pestañas y Controles */}
          <div className="flex items-center gap-2">
            {/* Toggle Fracción / Decimal */}
            <button
              type="button"
              onClick={() => setIsFractionMode(!isFractionMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${isFractionMode
                  ? 'bg-zinc-800 border-orange-500/80 text-orange-400'
                  : 'bg-[#1b1d23] border-[#272a31] text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                }`}
              title="Alternar entre números decimales y quebrados exactos"
            >
              <Binary className="w-3.5 h-3.5 text-orange-500" />
              <span className="hidden md:inline">Modo:</span>
              <span className="font-mono">{isFractionMode ? 'Fracciones (½)' : 'Decimales (.00)'}</span>
            </button>

            {/* Selector de Pestañas Principales con Colores Sólidos */}
            <nav className="flex items-center gap-1 bg-[#1b1d23] p-1 rounded-lg border border-[#272a31] text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('model')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${activeTab === 'model'
                    ? 'bg-orange-600 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#242730]'
                  }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Modelo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tableaus')}
                disabled={!solution}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${!solution
                    ? 'opacity-40 cursor-not-allowed text-zinc-500'
                    : activeTab === 'tableaus'
                      ? 'bg-orange-600 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#242730]'
                  }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Tableros ({solution ? solution.steps.length : 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('solution')}
                disabled={!solution}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${!solution
                    ? 'opacity-40 cursor-not-allowed text-zinc-500'
                    : activeTab === 'solution'
                      ? 'bg-orange-600 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#242730]'
                  }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>Solución</span>
              </button>

              {/* Pestaña Gráfico 2D condicional */}
              {is2DModel && (
                <button
                  type="button"
                  onClick={() => setActiveTab('graphical')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${activeTab === 'graphical'
                      ? 'bg-orange-600 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#242730]'
                    }`}
                  title="Método Gráfico 2D para 2 variables"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Gráfico 2D</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner de Error si falla la API */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-700/60 text-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm">Error en la resolución del modelo</h4>
              <p className="text-xs text-red-300">{error}</p>
              <p className="text-[11px] text-red-400/80">
                Asegúrate de que el backend de FastAPI esté iniciado en <code className="bg-red-900/60 px-1 py-0.5 rounded font-mono">http://localhost:8000</code>.
              </p>
            </div>
          </div>
        )}

        {/* Pestaña 1: Configuración del Modelo */}
        {activeTab === 'model' && (
          <ModelForm
            model={model}
            setModel={setModel}
            onSolve={handleSolve}
            isLoading={isLoading}
          />
        )}

        {/* Pestaña 2: Tableros Paso a Paso */}
        {activeTab === 'tableaus' && solution && (
          <div className="space-y-6">
            <StepNavigator
              currentStepIndex={currentStepIndex}
              totalSteps={solution.steps.length}
              onStepChange={setCurrentStepIndex}
              steps={solution.steps}
            />

            <SimplexTableau
              step={solution.steps[currentStepIndex]}
              precision={model.decimal_precision}
              optimizationType={model.optimization_type}
              isFractionMode={isFractionMode}
            />
          </div>
        )}

        {/* Pestaña 3: Resumen de la Solución */}
        {activeTab === 'solution' && solution && (
          <SolutionSummary
            response={solution}
            model={model}
            isFractionMode={isFractionMode}
          />
        )}

        {/* Pestaña 4: Método Gráfico 2D */}
        {activeTab === 'graphical' && is2DModel && (
          <GraphicalMethod
            model={model}
            solution={solution}
            precision={model.decimal_precision}
            isFractionMode={isFractionMode}
          />
        )}
      </main>

      {/* Pie de Página Sólido y Limpio */}
      <footer className="border-t border-[#272a31] py-5 text-xs text-zinc-400 mt-auto bg-[#16181d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-[#1f2229] border border-[#2e323b] flex items-center justify-center p-0.5">
              <img src={escudoFicct} alt="FICCT" className="w-full h-full object-contain" />
            </div>
            <p className="text-zinc-300">
              <strong className="text-zinc-100 font-semibold">Facultad de Ciencias de la Computación y Telecomunicaciones (FICCT)</strong> &middot; UAGRM
            </p>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Code2 className="w-3.5 h-3.5 text-orange-500" /> Método Dos Fases &middot; Gauss-Jordan &middot; Sensibilidad &middot; Dualidad
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
