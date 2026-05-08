'use client'

export function VariablesPanel({ variables }) {
  const entries = Object.entries(variables)

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h2 className="font-display font-semibold text-lg mb-4">Variables</h2>
      {entries.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <p className="text-sm">Sin variables definidas</p>
          <p className="text-xs mt-1">Las variables aparecerán aquí durante la ejecución</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(([name, value]) => (
            <div
              key={name}
              className="flex items-center justify-between p-3 bg-secondary rounded-lg"
            >
              <span className="font-mono font-medium text-primary">{name}</span>
              <span className="font-mono text-foreground bg-background px-3 py-1 rounded">
                {typeof value === 'string' ? `"${value}"` : String(value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
