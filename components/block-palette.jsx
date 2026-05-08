'use client'

import { 
  ArrowDownToLine, 
  Variable, 
  MessageSquare, 
  GitBranch, 
  Repeat 
} from 'lucide-react'

const blockTypes = [
  {
    type: 'input',
    label: 'Entrada',
    description: 'Leer dato (input)',
    icon: ArrowDownToLine,
    color: 'bg-emerald-100 border-emerald-400 text-emerald-700'
  },
  {
    type: 'assignment',
    label: 'Asignación',
    description: 'Asignar valor',
    icon: Variable,
    color: 'bg-amber-100 border-amber-400 text-amber-700'
  },
  {
    type: 'output',
    label: 'Salida',
    description: 'Mostrar (alert)',
    icon: MessageSquare,
    color: 'bg-blue-100 border-blue-400 text-blue-700'
  },
  {
    type: 'conditional',
    label: 'Condicional',
    description: 'Si-Sino (if-else)',
    icon: GitBranch,
    color: 'bg-purple-100 border-purple-400 text-purple-700'
  },
  {
    type: 'while',
    label: 'Mientras',
    description: 'Bucle (while)',
    icon: Repeat,
    color: 'bg-rose-100 border-rose-400 text-rose-700'
  }
]

export function BlockPalette({ onAddBlock }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h2 className="font-display font-semibold text-lg mb-4">Bloques</h2>
      <div className="space-y-2">
        {blockTypes.map(({ type, label, description, icon: Icon, color }) => (
          <button
            key={type}
            onClick={() => onAddBlock(type)}
            className={`w-full p-3 rounded-lg border-2 ${color} hover:scale-[1.02] transition-all text-left`}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </div>
            <p className="text-xs mt-1 opacity-80">{description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
