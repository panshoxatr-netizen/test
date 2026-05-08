'use client'

import { CheckCircle2, AlertCircle, ArrowRight, AlertTriangle, XCircle } from 'lucide-react'

export function ExecutionPanel({ history, outputs, errors = [] }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h2 className="font-display font-semibold text-lg mb-4">Prueba de Escritorio</h2>
      
      {/* Errors Panel */}
      {errors.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Errores y Advertencias ({errors.length})
          </h3>
          <div className="space-y-2 max-h-[150px] overflow-y-auto">
            {errors.map((error, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg text-sm flex items-start gap-2 ${
                  error.type === 'warning' 
                    ? 'bg-amber-50 border border-amber-200 text-amber-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {error.type === 'warning' 
                  ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                }
                <div>
                  <span className="font-medium">Paso {error.step + 1}:</span> {error.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution History */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Historial de Ejecucion</h3>
        {history.length === 0 ? (
          <div className="text-center text-muted-foreground py-4 bg-secondary/50 rounded-lg">
            <p className="text-sm">Sin pasos ejecutados</p>
            <p className="text-xs mt-1">Presiona &quot;Ejecutar&quot; para comenzar</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {history.map((entry, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  entry.isError 
                    ? 'bg-red-50 border-red-500' 
                    : entry.isWarning 
                      ? 'bg-amber-50 border-amber-500'
                      : entry.isStopped
                        ? 'bg-gray-100 border-gray-500'
                        : 'bg-secondary/50 border-primary'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${
                    entry.isError 
                      ? 'bg-red-500 text-white' 
                      : entry.isWarning 
                        ? 'bg-amber-500 text-white'
                        : entry.isStopped
                          ? 'bg-gray-500 text-white'
                          : 'bg-primary text-primary-foreground'
                  }`}>
                    {entry.step + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      entry.isError ? 'text-red-700' : entry.isWarning ? 'text-amber-700' : ''
                    }`}>
                      {entry.isError && <AlertCircle className="w-4 h-4 inline mr-1" />}
                      {entry.isWarning && <AlertTriangle className="w-4 h-4 inline mr-1" />}
                      {entry.action}
                    </p>
                    {Object.keys(entry.variables).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(entry.variables).map(([name, value]) => (
                          <span
                            key={name}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-background rounded text-xs font-mono"
                          >
                            {name}
                            <ArrowRight className="w-3 h-3" />
                            {value === null ? 'null' : typeof value === 'string' ? `"${value}"` : String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outputs */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Salidas (Alerts)</h3>
        {outputs.length === 0 ? (
          <div className="text-center text-muted-foreground py-4 bg-secondary/50 rounded-lg">
            <p className="text-sm">Sin salidas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {outputs.map((output, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                <span className="font-mono text-sm break-all">
                  {output === null ? 'null' : typeof output === 'string' ? `"${output}"` : String(output)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
