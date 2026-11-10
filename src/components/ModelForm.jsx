import React, { useRef, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Dog, 
  RotateCcw, 
  Calculator, 
  Layers,
  Download,
  Upload,
  Eye,
  Sliders
} from 'lucide-react';
import { sampleCanesData } from '../data/sampleData';

export default function ModelForm({ 
  model, 
  setModel, 
  onSolve, 
  isLoading 
}) {
  const fileInputRef = useRef(null);

  const handleLoadSample = () => {
    setModel(JSON.parse(JSON.stringify(sampleCanesData)));
  };

  const handleReset = () => {
    setModel({
      optimization_type: 'min',
      variable_names: ['X1', 'X2'],
      c: [1, 1],
      constraints: [
        {
          name: 'Restricción 1',
          coefficients: [1, 1],
          operator: '<=',
          rhs: 10
        }
      ],
      decimal_precision: 4,
      max_iterations: 50
    });
  };

  // Exportar Modelo a JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(model, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "modelo-simplex-ficct.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Importar Modelo desde JSON
  const handleImportJSON = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed && Array.isArray(parsed.c) && Array.isArray(parsed.constraints)) {
            setModel(parsed);
          } else {
            alert("El archivo no tiene el formato válido de modelo Simplex.");
          }
        } catch (err) {
          alert("Error al leer el archivo JSON: " + err.message);
        }
      };
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Sanitizar antes de resolver para que no viajen strings vacíos o NaN
  const handleSolveClick = () => {
    const sanitized = {
      ...model,
      c: model.c.map(val => (val === '' || isNaN(Number(val))) ? 0 : Number(val)),
      constraints: model.constraints.map(cstr => ({
        ...cstr,
        rhs: (cstr.rhs === '' || isNaN(Number(cstr.rhs))) ? 0 : Number(cstr.rhs),
        coefficients: cstr.coefficients.map(val => (val === '' || isNaN(Number(val))) ? 0 : Number(val))
      }))
    };
    onSolve(sanitized);
  };

  // Gestión de Variables
  const addVariable = () => {
    const nextIdx = model.variable_names.length + 1;
    const newName = `X${nextIdx}`;
    setModel(prev => ({
      ...prev,
      variable_names: [...prev.variable_names, newName],
      c: [...prev.c, 0],
      constraints: prev.constraints.map(cstr => ({
        ...cstr,
        coefficients: [...cstr.coefficients, 0]
      }))
    }));
  };

  const removeVariable = (varIdx) => {
    if (model.variable_names.length <= 1) return;
    setModel(prev => ({
      ...prev,
      variable_names: prev.variable_names.filter((_, idx) => idx !== varIdx),
      c: prev.c.filter((_, idx) => idx !== varIdx),
      constraints: prev.constraints.map(cstr => ({
        ...cstr,
        coefficients: cstr.coefficients.filter((_, idx) => idx !== varIdx)
      }))
    }));
  };

  const updateVariableName = (varIdx, name) => {
    setModel(prev => {
      const updated = [...prev.variable_names];
      updated[varIdx] = name;
      return { ...prev, variable_names: updated };
    });
  };

  const updateCost = (varIdx, val) => {
    setModel(prev => {
      const updated = [...prev.c];
      updated[varIdx] = val;
      return { ...prev, c: updated };
    });
  };

  // Gestión de Restricciones
  const addConstraint = () => {
    const count = model.constraints.length + 1;
    setModel(prev => ({
      ...prev,
      constraints: [
        ...prev.constraints,
        {
          name: `Restricción ${count}`,
          coefficients: new Array(prev.variable_names.length).fill(0),
          operator: '<=',
          rhs: 0
        }
      ]
    }));
  };

  const removeConstraint = (cIdx) => {
    if (model.constraints.length <= 1) return;
    setModel(prev => ({
      ...prev,
      constraints: prev.constraints.filter((_, idx) => idx !== cIdx)
    }));
  };

  const updateConstraintName = (cIdx, name) => {
    setModel(prev => {
      const updated = [...prev.constraints];
      updated[cIdx].name = name;
      return { ...prev, constraints: updated };
    });
  };

  const updateConstraintCoeff = (cIdx, varIdx, val) => {
    setModel(prev => {
      const updated = [...prev.constraints];
      updated[cIdx].coefficients[varIdx] = val;
      return { ...prev, constraints: updated };
    });
  };

  const updateConstraintOp = (cIdx, op) => {
    setModel(prev => {
      const updated = [...prev.constraints];
      updated[cIdx].operator = op;
      return { ...prev, constraints: updated };
    });
  };

  const updateConstraintRhs = (cIdx, val) => {
    setModel(prev => {
      const updated = [...prev.constraints];
      updated[cIdx].rhs = val;
      return { ...prev, constraints: updated };
    });
  };

  // Vista matemática previa en vivo de la función Z
  const equationPreview = useMemo(() => {
    const terms = model.c.map((val, idx) => {
      const numStr = val === '' ? '0' : val;
      return `${numStr}·X${idx + 1}`;
    });
    const optLabel = model.optimization_type === 'min' ? 'Min' : 'Max';
    return `${optLabel} Z = ${terms.join(' + ')}`;
  }, [model.c, model.optimization_type]);

  return (
    <div className="bg-[#16181d] border border-[#272a31] rounded-xl p-6 sm:p-7 shadow-sm space-y-7">
      {/* Barra superior de configuración y botones de acción */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#272a31]">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[#22252e] text-orange-400 border border-[#2e323b]">
              <Calculator className="w-4 h-4" />
            </span>
            Formulación del Modelo Lineal
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Define la función objetivo, costos unitarios y restricciones en <strong className="text-orange-400 font-semibold">Bolivianos (Bs)</strong>.
          </p>
        </div>

        {/* Acciones Rápidas - Botones en Gris con Naranja Sólido */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botón Principal Sólido Naranja */}
          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-2 px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors active:scale-95"
            title="Cargar formulación del proyecto de ración para perros (7 materias primas y 5 restricciones)"
          >
            <Dog className="w-3.5 h-3.5" />
            <span>Caso Canes (7x5)</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#22252e] hover:bg-[#2c303b] text-zinc-300 font-medium rounded-lg text-xs border border-[#2e323b] transition-colors active:scale-95"
            title="Exportar configuración del modelo a archivo JSON"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Exportar</span>
          </button>

          <label 
            className="flex items-center gap-1.5 px-3 py-2 bg-[#22252e] hover:bg-[#2c303b] text-zinc-300 font-medium rounded-lg text-xs border border-[#2e323b] transition-colors active:scale-95 cursor-pointer"
            title="Importar configuración desde un archivo JSON"
          >
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span>Importar</span>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json" 
              onChange={handleImportJSON} 
              className="hidden" 
            />
          </label>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#22252e] hover:bg-[#2c303b] text-zinc-400 hover:text-zinc-200 font-medium rounded-lg text-xs border border-[#2e323b] transition-colors active:scale-95"
            title="Reiniciar a modelo mínimo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        </div>
      </div>

      {/* Controles de Optimización y Parámetros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-[#111317] p-4 rounded-xl border border-[#272a31]">
        <div>
          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Tipo de Optimización
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#16181d] rounded-lg border border-[#272a31]">
            <button
              type="button"
              onClick={() => setModel(prev => ({ ...prev, optimization_type: 'min' }))}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                model.optimization_type === 'min'
                  ? 'bg-orange-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Minimizar (Min Z)
            </button>
            <button
              type="button"
              onClick={() => setModel(prev => ({ ...prev, optimization_type: 'max' }))}
              className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                model.optimization_type === 'max'
                  ? 'bg-orange-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Maximizar (Max Z)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Precisión Decimal
          </label>
          <select
            value={model.decimal_precision}
            onChange={(e) => setModel(prev => ({ ...prev, decimal_precision: parseInt(e.target.value) || 4 }))}
            className="w-full bg-[#16181d] border border-[#272a31] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
          >
            <option value="2">2 decimales (0.00)</option>
            <option value="3">3 decimales (0.000)</option>
            <option value="4">4 decimales (0.0000)</option>
            <option value="6">6 decimales (0.000000)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Límite Máx. Iteraciones
          </label>
          <input
            type="number"
            min="10"
            max="200"
            value={model.max_iterations}
            onChange={(e) => setModel(prev => ({ ...prev, max_iterations: parseInt(e.target.value) || 50 }))}
            className="w-full bg-[#16181d] border border-[#272a31] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
          />
        </div>
      </div>

      {/* Vista Matemática Previa en Vivo */}
      <div className="bg-[#111317] border border-[#272a31] rounded-xl p-4 flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-[#1f2229] border border-[#2e323b] flex items-center justify-center shrink-0 mt-0.5">
          <Eye className="w-3.5 h-3.5 text-orange-400" />
        </div>
        <div className="space-y-1 overflow-hidden w-full">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 font-mono">
              Ecuación Objetivo en Vivo:
            </span>
            <span className="text-[10px] text-zinc-400 font-mono font-semibold bg-[#1a1c22] px-2 py-0.5 rounded border border-[#272a31]">
              Unidad: Bolivianos (Bs)
            </span>
          </div>
          <div className="font-mono text-xs text-zinc-200 overflow-x-auto py-1">
            {equationPreview}
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: Variables de Decisión y Costos */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#22252e] text-orange-400 border border-[#2e323b] flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Variables de Decisión ({model.variable_names.length}) y Costos Unitarios
            </h3>
          </div>
          <button
            type="button"
            onClick={addVariable}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 hover:text-white bg-[#22252e] hover:bg-[#2c303b] border border-[#2e323b] px-3 py-1.5 rounded-lg transition-colors active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-orange-400" />
            <span>Añadir Variable</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {model.variable_names.map((vName, idx) => (
            <div
              key={idx}
              className="bg-[#111317] border border-[#272a31] rounded-xl p-3.5 space-y-2.5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-orange-400 bg-[#1e2027] px-2 py-0.5 rounded border border-[#2e323b]">
                  X{idx + 1}
                </span>
                {model.variable_names.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariable(idx)}
                    className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors"
                    title={`Eliminar variable ${vName}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                  Materia Prima / Nombre
                </label>
                <input
                  type="text"
                  value={vName}
                  onChange={(e) => updateVariableName(idx, e.target.value)}
                  className="w-full bg-[#16181d] border border-[#272a31] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  placeholder="Ej: Maíz amarillo"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1 flex items-center justify-between">
                  <span>Costo Unitario (cⱼ)</span>
                  <span className="text-orange-400 font-mono font-semibold">Bs/kg</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={model.c[idx]}
                  onChange={(e) => updateCost(idx, e.target.value)}
                  className="w-full bg-[#16181d] border border-[#272a31] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 2: Restricciones */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#22252e] text-orange-400 border border-[#2e323b] flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Restricciones del Sistema ({model.constraints.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={addConstraint}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 hover:text-white bg-[#22252e] hover:bg-[#2c303b] border border-[#2e323b] px-3 py-1.5 rounded-lg transition-colors active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-orange-400" />
            <span>Añadir Restricción</span>
          </button>
        </div>

        <div className="space-y-3">
          {model.constraints.map((cstr, cIdx) => (
            <div
              key={cIdx}
              className="bg-[#111317] border border-[#272a31] rounded-xl p-4 space-y-3 hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-mono font-bold text-zinc-300 bg-[#1c1e25] px-2.5 py-1 rounded border border-[#2e323b]">
                    R{cIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={cstr.name}
                    onChange={(e) => updateConstraintName(cIdx, e.target.value)}
                    className="flex-1 max-w-md bg-[#16181d] border border-[#272a31] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-orange-500 font-medium"
                    placeholder="Descripción de la restricción"
                  />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* Operador y RHS */}
                  <select
                    value={cstr.operator}
                    onChange={(e) => updateConstraintOp(cIdx, e.target.value)}
                    className="bg-[#16181d] border border-[#272a31] rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-orange-400 focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="<=">&le; (Menor o igual)</option>
                    <option value=">=">&ge; (Mayor o igual)</option>
                    <option value="=">= (Igualdad estricta)</option>
                  </select>

                  <input
                    type="number"
                    step="any"
                    value={cstr.rhs}
                    onChange={(e) => updateConstraintRhs(cIdx, e.target.value)}
                    className="w-24 bg-[#16181d] border border-[#272a31] rounded-lg px-2.5 py-1 text-xs text-white font-mono font-bold focus:outline-none focus:border-orange-500 text-right"
                    placeholder="RHS"
                  />

                  {model.constraints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeConstraint(cIdx)}
                      className="text-zinc-500 hover:text-red-400 p-1.5 rounded transition-colors ml-1"
                      title="Eliminar restricción"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Matriz de coeficientes para cada variable */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2 border-t border-[#1e2027]">
                {model.variable_names.map((vName, vIdx) => (
                  <div key={vIdx} className="bg-[#16181d] p-2 rounded-lg border border-[#272a31]">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1 truncate">
                      <span className="font-medium text-zinc-300 truncate" title={vName}>
                        {vName}
                      </span>
                      <span className="font-mono text-orange-400 text-[10px]">X{vIdx + 1}</span>
                    </div>
                    <input
                      type="number"
                      step="any"
                      value={cstr.coefficients[vIdx]}
                      onChange={(e) => updateConstraintCoeff(cIdx, vIdx, e.target.value)}
                      className="w-full bg-[#111317] border border-[#272a31] rounded px-2 py-1 text-xs text-white font-mono text-right focus:outline-none focus:border-orange-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón Principal de Resolver - COLOR SÓLIDO NARANJA */}
      <div className="pt-4 border-t border-[#272a31] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-zinc-400 flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-500 shrink-0" />
          <span>El motor resolverá paso a paso con el Método Simplex de Dos Fases y Gauss-Jordan.</span>
        </div>

        <button
          type="button"
          onClick={handleSolveClick}
          disabled={isLoading}
          className="w-full sm:w-auto px-7 py-3 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Resolviendo Modelo...</span>
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4" />
              <span>Resolver con Simplex Dos Fases</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
