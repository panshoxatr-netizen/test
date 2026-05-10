'use client'

import { useState, useCallback, useRef } from 'react'
import { DiagramCanvas } from '@/components/diagram-canvas'
import { BlockPalette } from '@/components/block-palette'
import { ExecutionPanel } from '@/components/execution-panel'
import { VariablesPanel } from '@/components/variables-panel'
import { Play, RotateCcw, Trash2, Square, StepForward } from 'lucide-react'

export default function Home() {
  const [blocks, setBlocks] = useState([])
  const [executionState, setExecutionState] = useState({
    isRunning: false,
    isPaused: false,
    currentStep: -1,
    currentBlockId: null,
    variables: {},
    history: [],
    outputs: [],
    errors: []
  })
  
  // Refs para controlar la ejecucion
  const stopRequestedRef = useRef(false)
  const stepModeRef = useRef(false)
  const continueStepRef = useRef(null)

  const addBlock = useCallback((type) => {
    const newBlock = {
      id: Date.now(),
      type,
      content: getDefaultContent(type),
      children: type === 'conditional' || type === 'while' ? { true: [], false: [] } : null
    }
    setBlocks(prev => [...prev, newBlock])
  }, [])

  const updateBlock = useCallback((id, updates) => {
    setBlocks(prev => updateBlockRecursive(prev, id, updates))
  }, [])

  const deleteBlock = useCallback((id) => {
    setBlocks(prev => deleteBlockRecursive(prev, id))
  }, [])

  const clearAll = useCallback(() => {
    setBlocks([])
    setExecutionState({
      isRunning: false,
      isPaused: false,
      currentStep: -1,
      currentBlockId: null,
      variables: {},
      history: [],
      outputs: [],
      errors: []
    })
  }, [])

  const stopExecution = useCallback(() => {
    stopRequestedRef.current = true
    if (continueStepRef.current) {
      continueStepRef.current('stop')
    }
  }, [])

  const nextStep = useCallback(() => {
    if (continueStepRef.current) {
      continueStepRef.current('continue')
    }
  }, [])

  const executeProgram = useCallback(async (stepByStep = false) => {
    if (blocks.length === 0) return

    stopRequestedRef.current = false
    stepModeRef.current = stepByStep

    setExecutionState({
      isRunning: true,
      isPaused: stepByStep,
      currentStep: -1,
      currentBlockId: null,
      variables: {},
      history: [],
      outputs: [],
      errors: []
    })

    const execution = {
      variables: {},
      history: [],
      outputs: [],
      errors: [],
      stepIndex: 0
    }

    const addError = (blockId, message, type = 'error') => {
      const errorEntry = {
        step: execution.stepIndex,
        blockId,
        message,
        type,
        timestamp: new Date().toLocaleTimeString()
      }
      execution.errors.push(errorEntry)
      execution.history.push({
        step: execution.stepIndex,
        blockId,
        action: `Error: ${message}`,
        variables: { ...execution.variables },
        isError: type === 'error'
      })
      
      // Si es un error (no warning), mostrar alert y marcar para detener
      if (type === 'error') {
        alert(`Error en la ejecucion:\n${message}`)
        stopRequestedRef.current = true
      }
    }

    const executeBlocks = async (blockList, setStep) => {
      for (const block of blockList) {
        // Verificar si se solicito detener
        if (stopRequestedRef.current) {
          execution.history.push({
            step: execution.stepIndex,
            blockId: block.id,
            action: 'Ejecucion detenida por el usuario',
            variables: { ...execution.variables },
            isStopped: true
          })
          return false
        }

        const continueExecution = await setStep(execution.stepIndex, { ...execution.variables }, block.id)
        if (!continueExecution) return false
        
        if (block.type === 'input') {
          const varName = block.content.variable
          
          // Validar nombre de variable
          if (!varName || varName.trim() === '') {
            addError(block.id, 'Nombre de variable vacio en bloque de entrada')
            return false
          }

          const userInput = prompt(`Ingrese valor para ${varName}:`)
          
          // Manejar cancelacion del usuario - DETENER TODA LA EJECUCION
          if (userInput === null) {
            addError(block.id, `Entrada cancelada por el usuario - Ejecucion detenida`, 'error')
            execution.history.push({
              step: execution.stepIndex,
              blockId: block.id,
              action: `Entrada cancelada: Ejecucion detenida`,
              variables: { ...execution.variables },
              isStopped: true
            })
            return false // Detener toda la ejecucion
          }

          // Manejar entrada vacia
          if (userInput.trim() === '') {
            addError(block.id, `Entrada vacia para variable "${varName}"`, 'warning')
            execution.variables[varName] = ''
            execution.history.push({
              step: execution.stepIndex,
              blockId: block.id,
              action: `Entrada: ${varName} = "" (vacio)`,
              variables: { ...execution.variables },
              isWarning: true
            })
            execution.stepIndex++
            continue
          }

          const value = isNaN(Number(userInput)) ? userInput : Number(userInput)
          execution.variables[varName] = value
          execution.history.push({
            step: execution.stepIndex,
            blockId: block.id,
            action: `Entrada: ${varName} = ${typeof value === 'string' ? `"${value}"` : value}`,
            variables: { ...execution.variables }
          })
        } else if (block.type === 'assignment') {
          const { variable, expression } = block.content
          
          // Validar nombre de variable
          if (!variable || variable.trim() === '') {
            addError(block.id, 'Nombre de variable vacio en bloque de asignacion')
            return false
          }

          // Validar expresion
          if (!expression || expression.trim() === '') {
            addError(block.id, `Expresion vacia para variable "${variable}"`)
            return false
          }

          try {
            const { value, undefinedVars } = evaluateExpression(expression, execution.variables)
            
            // Variables no definidas ahora son errores que detienen la ejecucion
            if (undefinedVars.length > 0) {
              addError(block.id, `Variables no definidas: ${undefinedVars.join(', ')}`)
              return false
            }
            
            execution.variables[variable] = value
            execution.history.push({
              step: execution.stepIndex,
              blockId: block.id,
              action: `Asignacion: ${variable} = ${value}`,
              variables: { ...execution.variables }
            })
          } catch (e) {
            addError(block.id, `Error al evaluar "${expression}": ${e.message}`)
            return false
          }
        } else if (block.type === 'output') {
          const { expression } = block.content

          // Validar expresion
          if (!expression || expression.trim() === '') {
            addError(block.id, 'Expresion vacia en bloque de salida')
            return false
          }

          try {
            const { value, undefinedVars } = evaluateExpression(expression, execution.variables)
            
            // Variables no definidas ahora son errores que detienen la ejecucion
            if (undefinedVars.length > 0) {
              addError(block.id, `Variables no definidas en salida: ${undefinedVars.join(', ')}`)
              return false
            }
            
            execution.outputs.push(value)
            execution.history.push({
              step: execution.stepIndex,
              blockId: block.id,
              action: `Salida: ${typeof value === 'string' ? `"${value}"` : value}`,
              variables: { ...execution.variables }
            })
            alert(`Salida: ${value}`)
          } catch (e) {
            addError(block.id, `Error en salida: ${e.message}`)
            return false
          }
        } else if (block.type === 'conditional') {
          const { condition } = block.content

          if (!condition || condition.trim() === '') {
            addError(block.id, 'Condicion vacia en bloque condicional')
            return false
          }

          try {
            const { value: conditionResult, undefinedVars } = evaluateCondition(condition, execution.variables)
            
            // Variables no definidas ahora son errores que detienen la ejecucion
            if (undefinedVars.length > 0) {
              addError(block.id, `Variables no definidas en condicion: ${undefinedVars.join(', ')}`)
              return false
            }
            
            execution.history.push({
              step: execution.stepIndex,
              blockId: block.id,
              action: `Condicion: ${condition} → ${conditionResult}`,
              variables: { ...execution.variables }
            })
            execution.stepIndex++
            
            if (conditionResult) {
              const result = await executeBlocks(block.children.true, setStep)
              if (!result) return false
            } else {
              const result = await executeBlocks(block.children.false, setStep)
              if (!result) return false
            }
            continue
          } catch (e) {
            addError(block.id, `Error en condicion: ${e.message}`)
            return false
          }
        } else if (block.type === 'while') {
          const { condition } = block.content

          if (!condition || condition.trim() === '') {
            addError(block.id, 'Condicion vacia en bloque mientras')
            return false
          }

          let iterations = 0
          const maxIterations = 1000
          
          try {
            let { value: conditionResult, undefinedVars } = evaluateCondition(condition, execution.variables)
            
            // Variables no definidas ahora son errores que detienen la ejecucion
            if (undefinedVars.length > 0) {
              addError(block.id, `Variables no definidas en condicion while: ${undefinedVars.join(', ')}`)
              return false
            }
            
            while (conditionResult && iterations < maxIterations) {
              if (stopRequestedRef.current) {
                execution.history.push({
                  step: execution.stepIndex,
                  blockId: block.id,
                  action: 'Bucle detenido por el usuario',
                  variables: { ...execution.variables },
                  isStopped: true
                })
                return false
              }
              
              execution.history.push({
                step: execution.stepIndex,
                blockId: block.id,
                action: `While: ${condition} → true (iteracion ${iterations + 1})`,
                variables: { ...execution.variables }
              })
              
              const continueExec = await setStep(execution.stepIndex, { ...execution.variables }, block.id)
              if (!continueExec) return false
              execution.stepIndex++
              
              const result = await executeBlocks(block.children.true, setStep)
              if (!result) return false
              iterations++
              
              // Re-evaluar condicion
              const evalResult = evaluateCondition(condition, execution.variables)
              conditionResult = evalResult.value
              undefinedVars = evalResult.undefinedVars
              
              // Si hay variables no definidas en re-evaluacion, tambien es error
              if (undefinedVars.length > 0) {
                addError(block.id, `Variables no definidas en condicion while: ${undefinedVars.join(', ')}`)
                return false
              }
            }
            
            if (iterations >= maxIterations) {
              addError(block.id, `Bucle infinito detectado (${maxIterations} iteraciones maximas alcanzadas)`)
              return false
            }
            
            execution.history.push({
              step: execution.stepIndex,
              blockId: block.id,
              action: `While: ${condition} → false (fin del bucle, ${iterations} iteraciones)`,
              variables: { ...execution.variables }
            })
            continue
          } catch (e) {
            addError(block.id, `Error en bucle while: ${e.message}`)
            return false
          }
        }
        
        execution.stepIndex++
      }
      return true
    }

    const setStep = async (step, vars, blockId) => {
      return new Promise(resolve => {
        setExecutionState(prev => ({
          ...prev,
          currentStep: step,
          currentBlockId: blockId,
          variables: vars,
          history: [...execution.history],
          outputs: [...execution.outputs],
          errors: [...execution.errors],
          isPaused: stepModeRef.current
        }))

        if (stepModeRef.current) {
          // Modo paso a paso - esperar a que el usuario presione siguiente
          continueStepRef.current = (action) => {
            continueStepRef.current = null
            if (action === 'stop') {
              stopRequestedRef.current = true
              resolve(false)
            } else {
              resolve(true)
            }
          }
        } else {
          // Modo automatico - continuar despues de un delay
          setTimeout(() => {
            if (stopRequestedRef.current) {
              resolve(false)
            } else {
              resolve(true)
            }
          }, 800)
        }
      })
    }

    await executeBlocks(blocks, setStep)

    setExecutionState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      currentStep: -1,
      currentBlockId: null,
      history: execution.history,
      outputs: execution.outputs,
      errors: execution.errors,
      variables: execution.variables
    }))
  }, [blocks])

  const resetExecution = useCallback(() => {
    stopRequestedRef.current = true
    if (continueStepRef.current) {
      continueStepRef.current('stop')
    }
    setExecutionState({
      isRunning: false,
      isPaused: false,
      currentStep: -1,
      currentBlockId: null,
      variables: {},
      history: [],
      outputs: [],
      errors: []
    })
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="font-display text-2xl font-bold text-primary">
            Diagrama NS - Prueba de Escritorio
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crea diagramas de bloques y ejecuta pruebas de escritorio paso a paso
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Panel izquierdo - Paleta de bloques */}
          <aside className="lg:col-span-2">
            <BlockPalette onAddBlock={addBlock} />
          </aside>

          {/* Panel central - Canvas del diagrama */}
          <section className="lg:col-span-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                <h2 className="font-display font-semibold text-lg">Diagrama</h2>
                <div className="flex flex-wrap gap-2">
                  {/* Boton Ejecutar */}
                  <button
                    onClick={() => executeProgram(false)}
                    disabled={executionState.isRunning || blocks.length === 0}
                    className="flex items-center gap-2 px-2.5 sm:px-4 py-1 sm:py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Ejecutar todo el programa automaticamente"
                  >
                    <Play className="w-4 h-4" />
                    <span className="hidden sm:inline">Ejecutar</span>
                  </button>
                  
                  {/* Boton Paso a Paso */}
                  <button
                    onClick={() => executeProgram(true)}
                    disabled={executionState.isRunning || blocks.length === 0}
                    className="flex items-center gap-2 px-2.5 sm:px-4 py-1 sm:py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Ejecutar paso a paso"
                  >
                    <StepForward className="w-4 h-4" />
                    <span className="hidden sm:inline">Paso a Paso</span>
                  </button>

                  {/* Boton Siguiente Paso (solo visible en modo paso a paso) */}
                  {executionState.isPaused && executionState.isRunning && (
                    <button
                      onClick={nextStep}
                      className="flex items-center gap-2 px-2.5 sm:px-4 py-1 sm:py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors animate-pulse"
                      title="Ejecutar siguiente paso"
                    >
                      <StepForward className="w-4 h-4" />
                      <span className="hidden sm:inline">Siguiente</span>
                    </button>
                  )}

                  {/* Boton Detener */}
                  {executionState.isRunning && (
                    <button
                      onClick={stopExecution}
                      className="flex items-center gap-2 px-2.5 sm:px-4 py-1 sm:py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      title="Detener ejecucion"
                    >
                      <Square className="w-4 h-4" />
                      <span className="hidden sm:inline">Detener</span>
                    </button>
                  )}

                  {/* Boton Reiniciar */}
                  <button
                    onClick={resetExecution}
                    disabled={!executionState.isRunning && executionState.history.length === 0}
                    className="flex items-center gap-2 px-2.5 sm:px-4 py-1 sm:py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Reiniciar ejecucion"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Reiniciar</span>
                  </button>

                  {/* Boton Limpiar */}
                  <button
                    onClick={clearAll}
                    disabled={executionState.isRunning}
                    className="flex items-center gap-2 px-2.5 sm:px-4 py-1 sm:py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Limpiar todo"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Limpiar</span>
                  </button>
                </div>
              </div>

              {/* Indicador de estado */}
              {executionState.isRunning && (
                <div className={`mb-4 p-2 rounded-lg text-sm font-medium ${executionState.isPaused ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                  {executionState.isPaused 
                    ? 'Modo Paso a Paso - Presiona "Siguiente" para continuar'
                    : 'Ejecutando programa...'
                  }
                </div>
              )}

              <DiagramCanvas
                blocks={blocks}
                currentStep={executionState.currentStep}
                currentBlockId={executionState.currentBlockId}
                executionHistory={executionState.history}
                onUpdateBlock={updateBlock}
                onDeleteBlock={deleteBlock}
              />
            </div>
          </section>

          {/* Panel derecho - Variables y ejecucion */}
          <aside className="lg:col-span-4 space-y-6">
            <VariablesPanel variables={executionState.variables} />
            <ExecutionPanel 
              history={executionState.history} 
              outputs={executionState.outputs}
              errors={executionState.errors}
            />
          </aside>
        </div>
      </main>
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

function updateBlockRecursive(blocks, id, updates) {
  return blocks.map(block => {
    if (block.id === id) {
      return { ...block, ...updates }
    }
    if (block.children) {
      return {
        ...block,
        children: {
          true: updateBlockRecursive(block.children.true, id, updates),
          false: updateBlockRecursive(block.children.false, id, updates)
        }
      }
    }
    return block
  })
}

function deleteBlockRecursive(blocks, id) {
  return blocks.filter(block => block.id !== id).map(block => {
    if (block.children) {
      return {
        ...block,
        children: {
          true: deleteBlockRecursive(block.children.true, id),
          false: deleteBlockRecursive(block.children.false, id)
        }
      }
    }
    return block
  })
}

function evaluateExpression(expression, variables) {
  let expr = expression
  const undefinedVars = []
  
  // Encontrar todas las variables en la expresion
  const varRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g
  const reservedWords = ['true', 'false', 'null', 'undefined', 'NaN', 'Infinity', 'Math', 'parseInt', 'parseFloat', 'String', 'Number', 'Boolean']
  
  let match
  while ((match = varRegex.exec(expression)) !== null) {
    const varName = match[1]
    if (!reservedWords.includes(varName) && !(varName in variables) && isNaN(Number(varName))) {
      if (!undefinedVars.includes(varName)) {
        undefinedVars.push(varName)
      }
    }
  }
  
  // Reemplazar variables definidas
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\b${key}\\b`, 'g')
    if (typeof value === 'string') {
      expr = expr.replace(regex, `"${value}"`)
    } else if (value === null) {
      expr = expr.replace(regex, '0') // Tratar null como 0 para calculos
    } else {
      expr = expr.replace(regex, value)
    }
  }
  
  try {
    const value = Function(`"use strict"; return (${expr})`)()
    return { value, undefinedVars }
  } catch (e) {
    throw new Error(`Expresion invalida: ${expression}`)
  }
}

function evaluateCondition(condition, variables) {
  let expr = condition
  const undefinedVars = []
  
  // Convertir = simple a == para comparaciones (para usuarios no familiarizados con JS)
  // Pero no tocar <= >= != 
  expr = expr.replace(/([^<>!=])=([^=])/g, '$1==$2')
  // Asegurar que no haya === (convertir a ==)
  expr = expr.replace(/===/g, '==')
  
  const varRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g
  const reservedWords = ['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']
  
  let match
  const originalExpr = expr
  while ((match = varRegex.exec(condition)) !== null) {
    const varName = match[1]
    if (!reservedWords.includes(varName) && !(varName in variables) && isNaN(Number(varName))) {
      if (!undefinedVars.includes(varName)) {
        undefinedVars.push(varName)
      }
    }
  }
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\b${key}\\b`, 'g')
    if (typeof value === 'string') {
      expr = expr.replace(regex, `"${value}"`)
    } else if (value === null) {
      expr = expr.replace(regex, 'null')
    } else {
      expr = expr.replace(regex, value)
    }
  }
  
  try {
    const value = Function(`"use strict"; return (${expr})`)()
    return { value: Boolean(value), undefinedVars }
  } catch (e) {
    throw new Error(`Condicion invalida: ${condition}`)
  }
}
