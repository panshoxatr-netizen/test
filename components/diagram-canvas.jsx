'use client'

import { useState } from 'react'
import { X, GripVertical, Plus } from 'lucide-react'

const blockStyles = {
  input: {
    container: 'bg-emerald-50 border-emerald-400',
    header: 'bg-emerald-400 text-white',
    label: 'ENTRADA'
  },
  assignment: {
    container: 'bg-amber-50 border-amber-400',
    header: 'bg-amber-400 text-white',
    label: 'ASIGNACIÓN'
  },
  output: {
    container: 'bg-blue-50 border-blue-400',
    header: 'bg-blue-400 text-white',
    label: 'SALIDA'
  },
  conditional: {
    container: 'bg-purple-50 border-purple-400',
    header: 'bg-purple-400 text-white',
    label: 'SI-SINO'
  },
  while: {
    container: 'bg-rose-50 border-rose-400',
    header: 'bg-rose-400 text-white',
    label: 'MIENTRAS'
  }
}

export function DiagramCanvas({ 
  blocks, 
  currentStep, 
  currentBlockId,
  executionHistory, 
  onUpdateBlock, 
  onDeleteBlock 
}) {
  if (blocks.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center border-2 border-dashed border-border rounded-lg">
        <div className="text-center text-muted-foreground">
          <p className="font-display text-lg">Diagrama vacio</p>
          <p className="text-sm mt-1">Agrega bloques desde el panel izquierdo</p>
        </div>
      </div>
    )
  }

  const isBlockActive = (blockId) => {
    return blockId === currentBlockId
  }

  return (
    <div className="min-h-[400px] p-4 border-2 border-border rounded-lg bg-secondary/20">
      <div className="space-y-2">
        {blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            isActive={isBlockActive(block.id)}
            currentBlockId={currentBlockId}
            executionHistory={executionHistory}
            currentStep={currentStep}
            onUpdate={(updates) => onUpdateBlock(block.id, updates)}
            onDelete={() => onDeleteBlock(block.id)}
            onUpdateChild={(childId, updates) => onUpdateBlock(childId, updates)}
            onDeleteChild={onDeleteBlock}
          />
        ))}
      </div>
    </div>
  )
}

function BlockRenderer({ 
  block, 
  isActive, 
  currentBlockId,
  executionHistory, 
  currentStep, 
  onUpdate, 
  onDelete,
  onUpdateChild,
  onDeleteChild
}) {
  const style = blockStyles[block.type]
  const activeClass = isActive ? 'ring-4 ring-primary ring-offset-2 animate-pulse' : ''

  const isChildActive = (blockId) => {
    return blockId === currentBlockId
  }

  if (block.type === 'input') {
    return (
      <InputBlock
        block={block}
        style={style}
        activeClass={activeClass}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    )
  }

  if (block.type === 'assignment') {
    return (
      <AssignmentBlock
        block={block}
        style={style}
        activeClass={activeClass}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    )
  }

  if (block.type === 'output') {
    return (
      <OutputBlock
        block={block}
        style={style}
        activeClass={activeClass}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    )
  }

  if (block.type === 'conditional') {
    return (
      <ConditionalBlock
        block={block}
        style={style}
        activeClass={activeClass}
        isChildActive={isChildActive}
        currentBlockId={currentBlockId}
        executionHistory={executionHistory}
        currentStep={currentStep}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onUpdateChild={onUpdateChild}
        onDeleteChild={onDeleteChild}
      />
    )
  }

  if (block.type === 'while') {
    return (
      <WhileBlock
        block={block}
        style={style}
        activeClass={activeClass}
        isChildActive={isChildActive}
        currentBlockId={currentBlockId}
        executionHistory={executionHistory}
        currentStep={currentStep}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onUpdateChild={onUpdateChild}
        onDeleteChild={onDeleteChild}
      />
    )
  }

  return null
}

function InputBlock({ block, style, activeClass, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(block.content.variable)

  const handleSave = () => {
    onUpdate({ content: { ...block.content, variable: value } })
    setEditing(false)
  }

  return (
    <div className={`border-2 rounded-lg overflow-hidden ${style.container} ${activeClass} transition-all`}>
      <div className={`${style.header} px-3 py-1 flex items-center justify-between text-sm font-medium`}>
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 opacity-50" />
          <span>{style.label}</span>
        </div>
        <button onClick={onDelete} className="hover:bg-white/20 p-1 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3">
        {editing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1 px-2 py-1 border rounded text-sm"
              placeholder="Nombre de variable"
            />
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-emerald-500 text-white rounded text-sm hover:bg-emerald-600"
            >
              OK
            </button>
          </div>
        ) : (
          <div 
            onClick={() => setEditing(true)}
            className="cursor-pointer hover:bg-white/50 p-2 rounded text-center font-mono"
          >
            Leer <strong>{block.content.variable}</strong>
          </div>
        )}
      </div>
    </div>
  )
}

function AssignmentBlock({ block, style, activeClass, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [variable, setVariable] = useState(block.content.variable)
  const [expression, setExpression] = useState(block.content.expression)

  const handleSave = () => {
    onUpdate({ content: { variable, expression } })
    setEditing(false)
  }

  return (
    <div className={`border-2 rounded-lg overflow-hidden ${style.container} ${activeClass} transition-all`}>
      <div className={`${style.header} px-3 py-1 flex items-center justify-between text-sm font-medium`}>
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 opacity-50" />
          <span>{style.label}</span>
        </div>
        <button onClick={onDelete} className="hover:bg-white/20 p-1 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3">
        {editing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={variable}
              onChange={(e) => setVariable(e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder="Variable"
            />
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder="Expresión"
            />
            <button
              onClick={handleSave}
              className="w-full px-3 py-1 bg-amber-500 text-white rounded text-sm hover:bg-amber-600"
            >
              Guardar
            </button>
          </div>
        ) : (
          <div 
            onClick={() => setEditing(true)}
            className="cursor-pointer hover:bg-white/50 p-2 rounded text-center font-mono"
          >
            <strong>{block.content.variable}</strong> ← {block.content.expression}
          </div>
        )}
      </div>
    </div>
  )
}

function OutputBlock({ block, style, activeClass, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [expression, setExpression] = useState(block.content.expression)

  const handleSave = () => {
    onUpdate({ content: { expression } })
    setEditing(false)
  }

  return (
    <div className={`border-2 rounded-lg overflow-hidden ${style.container} ${activeClass} transition-all`}>
      <div className={`${style.header} px-3 py-1 flex items-center justify-between text-sm font-medium`}>
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 opacity-50" />
          <span>{style.label}</span>
        </div>
        <button onClick={onDelete} className="hover:bg-white/20 p-1 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3">
        {editing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="flex-1 px-2 py-1 border rounded text-sm"
              placeholder="Expresión a mostrar"
            />
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        ) : (
          <div 
            onClick={() => setEditing(true)}
            className="cursor-pointer hover:bg-white/50 p-2 rounded text-center font-mono"
          >
            Mostrar <strong>{block.content.expression}</strong>
          </div>
        )}
      </div>
    </div>
  )
}

function ConditionalBlock({ 
  block, 
  style, 
  activeClass, 
  isChildActive,
  currentBlockId,
  executionHistory,
  currentStep,
  onUpdate, 
  onDelete,
  onUpdateChild,
  onDeleteChild
}) {
  const [editing, setEditing] = useState(false)
  const [condition, setCondition] = useState(block.content.condition)

  const handleSave = () => {
    onUpdate({ content: { condition } })
    setEditing(false)
  }

  const addChildBlock = (branch, type) => {
    const newBlock = {
      id: Date.now(),
      type,
      content: getDefaultContent(type),
      children: type === 'conditional' || type === 'while' ? { true: [], false: [] } : null
    }
    const newChildren = {
      ...block.children,
      [branch]: [...block.children[branch], newBlock]
    }
    onUpdate({ children: newChildren })
  }

  return (
    <div className={`border-2 rounded-lg overflow-hidden ${style.container} ${activeClass} transition-all`}>
      <div className={`${style.header} px-3 py-1 flex items-center justify-between text-sm font-medium`}>
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 opacity-50" />
          <span>{style.label}</span>
        </div>
        <button onClick={onDelete} className="hover:bg-white/20 p-1 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Condition */}
      <div className="p-3 border-b-2 border-purple-300">
        {editing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="flex-1 px-2 py-1 border rounded text-sm"
              placeholder="Condición"
            />
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
            >
              OK
            </button>
          </div>
        ) : (
          <div 
            onClick={() => setEditing(true)}
            className="cursor-pointer hover:bg-white/50 p-2 rounded text-center font-mono"
          >
            ¿{block.content.condition}?
          </div>
        )}
      </div>
      
      {/* Branches */}
      <div className="grid grid-cols-2 divide-x-2 divide-purple-300 overflow-auto">
        <div className="p-2">
          <div className="text-center text-xs font-semibold text-purple-600 mb-2">VERDADERO</div>
          <div className="space-y-2 min-h-[60px]">
            {block.children.true.map(child => (
              <BlockRenderer
                key={child.id}
                block={child}
                isActive={isChildActive(child.id)}
                currentBlockId={currentBlockId}
                executionHistory={executionHistory}
                currentStep={currentStep}
                onUpdate={(updates) => onUpdateChild(child.id, updates)}
                onDelete={() => onDeleteChild(child.id)}
                onUpdateChild={onUpdateChild}
                onDeleteChild={onDeleteChild}
                />
            ))}
            <AddBlockButton onAdd={(type) => addChildBlock('true', type)} />
          </div>
        </div>
        <div className="p-2">
          <div className="text-center text-xs font-semibold text-purple-600 mb-2">FALSO</div>
          <div className="space-y-2 min-h-[60px]">
            {block.children.false.map(child => (
              <BlockRenderer
                key={child.id}
                block={child}
                isActive={isChildActive(child.id)}
                currentBlockId={currentBlockId}
                executionHistory={executionHistory}
                currentStep={currentStep}
                onUpdate={(updates) => onUpdateChild(child.id, updates)}
                onDelete={() => onDeleteChild(child.id)}
                onUpdateChild={onUpdateChild}
                onDeleteChild={onDeleteChild}
              />
            ))}
            <AddBlockButton onAdd={(type) => addChildBlock('false', type)} />
          </div>
        </div>
      </div>
    </div>
  )
}

function WhileBlock({ 
  block, 
  style, 
  activeClass,
  isChildActive,
  currentBlockId,
  executionHistory,
  currentStep,
  onUpdate, 
  onDelete,
  onUpdateChild,
  onDeleteChild
}) {
  const [editing, setEditing] = useState(false)
  const [condition, setCondition] = useState(block.content.condition)

  const handleSave = () => {
    onUpdate({ content: { condition } })
    setEditing(false)
  }

  const addChildBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type,
      content: getDefaultContent(type),
      children: type === 'conditional' || type === 'while' ? { true: [], false: [] } : null
    }
    const newChildren = {
      ...block.children,
      true: [...block.children.true, newBlock]
    }
    onUpdate({ children: newChildren })
  }

  return (
    <div className={`border-2 rounded-lg overflow-hidden ${style.container} ${activeClass} transition-all`}>
      <div className={`${style.header} px-3 py-1 flex items-center justify-between text-sm font-medium`}>
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 opacity-50" />
          <span>{style.label}</span>
        </div>
        <button onClick={onDelete} className="hover:bg-white/20 p-1 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Condition */}
      <div className="p-3 border-b-2 border-rose-300">
        {editing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="flex-1 px-2 py-1 border rounded text-sm"
              placeholder="Condición"
            />
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-rose-500 text-white rounded text-sm hover:bg-rose-600"
            >
              OK
            </button>
          </div>
        ) : (
          <div 
            onClick={() => setEditing(true)}
            className="cursor-pointer hover:bg-white/50 p-2 rounded text-center font-mono"
          >
            Mientras ({block.content.condition})
          </div>
        )}
      </div>
      
      {/* Body */}
      <div className="p-2 ml-4 border-l-4 border-rose-300 overflow-auto">
        <div className="space-y-2 min-h-[60px]">
          {block.children.true.map(child => (
            <BlockRenderer
              key={child.id}
              block={child}
              isActive={isChildActive(child.id)}
              currentBlockId={currentBlockId}
              executionHistory={executionHistory}
              currentStep={currentStep}
              onUpdate={(updates) => onUpdateChild(child.id, updates)}
              onDelete={() => onDeleteChild(child.id)}
onUpdateChild={onUpdateChild}
                onDeleteChild={onDeleteChild}
              />
            ))}
            <AddBlockButton onAdd={addChildBlock} />
        </div>
      </div>
    </div>
  )
}

function AddBlockButton({ onAdd }) {
  const [showMenu, setShowMenu] = useState(false)

  const blockOptions = [
    { type: 'input', label: 'Entrada' },
    { type: 'assignment', label: 'Asignación' },
    { type: 'output', label: 'Salida' },
    { type: 'conditional', label: 'Condicional' },
    { type: 'while', label: 'Mientras' }
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full p-2 border-2 border-dashed border-gray-300 rounded text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors flex items-center justify-center gap-1 text-sm"
      >
        <Plus className="w-4 h-4" />
        Agregar
      </button>
      {showMenu && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded shadow-lg z-10">
          {blockOptions.map(opt => (
            <button
              key={opt.type}
              onClick={() => {
                onAdd(opt.type)
                setShowMenu(false)
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function getDefaultContent(type) {
  switch (type) {
    case 'input':
      return { variable: 'x' }
    case 'assignment':
      return { variable: 'resultado', expression: '0' }
    case 'output':
      return { expression: 'resultado' }
    case 'conditional':
      return { condition: 'x > 0' }
    case 'while':
      return { condition: 'i < 10' }
    default:
      return {}
  }
}
