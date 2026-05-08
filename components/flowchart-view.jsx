'use client'

// Componente para renderizar un diagrama de flujo clasico basado en los bloques

export function FlowchartView({ blocks }) {
  // Recolectar todas las variables de entrada
  const inputVariables = []
  
  const collectInputs = (blockList) => {
    for (const block of blockList) {
      if (block.type === 'input') {
        inputVariables.push(block.content.variable)
      }
      if (block.children) {
        if (block.children.true) collectInputs(block.children.true)
        if (block.children.false) collectInputs(block.children.false)
      }
    }
  }
  collectInputs(blocks)

  if (blocks.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center border-2 border-dashed border-border rounded-lg">
        <div className="text-center text-muted-foreground">
          <p className="font-display text-lg">Diagrama vacio</p>
          <p className="text-sm mt-1">Agrega bloques en la pestana Configuracion</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[400px] p-4 border-2 border-border rounded-lg bg-white overflow-auto">
      <div className="flex flex-col items-center">
        {/* Inicio */}
        <FlowchartBox type="terminal">Inicio</FlowchartBox>
        <FlowchartArrow />
        
        {/* Declaracion de variables si hay entradas */}
        {inputVariables.length > 0 && (
          <>
            <FlowchartBox type="process">
              Entero: {inputVariables.join(', ')}
            </FlowchartBox>
            <FlowchartArrow />
          </>
        )}
        
        {/* Bloques */}
        <FlowchartBlocks blocks={blocks} />
        
        {/* Fin */}
        <FlowchartBox type="terminal">Fin algoritmo</FlowchartBox>
      </div>
    </div>
  )
}

function FlowchartBlocks({ blocks }) {
  return (
    <>
      {blocks.map((block, index) => (
        <FlowchartBlock key={block.id} block={block} isLast={index === blocks.length - 1} />
      ))}
    </>
  )
}

function FlowchartBlock({ block, isLast }) {
  if (block.type === 'input') {
    return (
      <>
        <FlowchartBox type="io">
          Leer {block.content.variable}
        </FlowchartBox>
        <FlowchartArrow />
      </>
    )
  }

  if (block.type === 'assignment') {
    return (
      <>
        <FlowchartBox type="process">
          {block.content.variable} &larr; {block.content.expression}
        </FlowchartBox>
        <FlowchartArrow />
      </>
    )
  }

  if (block.type === 'output') {
    return (
      <>
        <FlowchartBox type="io">
          Escribir {block.content.expression}
        </FlowchartBox>
        <FlowchartArrow />
      </>
    )
  }

  if (block.type === 'conditional') {
    return <FlowchartConditional block={block} />
  }

  if (block.type === 'while') {
    return <FlowchartWhile block={block} />
  }

  return null
}

function FlowchartConditional({ block }) {
  const hasTrue = block.children.true.length > 0
  const hasFalse = block.children.false.length > 0

  return (
    <div className="flex flex-col items-center w-full">
      {/* Rombo de decision */}
      <FlowchartBox type="decision">
        {block.content.condition}
      </FlowchartBox>
      
      {/* Ramas */}
      <div className="flex w-full justify-center">
        {/* Rama SI (izquierda) */}
        <div className="flex flex-col items-center flex-1 border-r border-gray-300">
          <div className="text-xs font-semibold text-gray-600 my-1">Si</div>
          <FlowchartArrow short />
          {hasTrue ? (
            <div className="flex flex-col items-center px-2">
              <FlowchartBlocks blocks={block.children.true} />
            </div>
          ) : (
            <div className="h-8" />
          )}
        </div>
        
        {/* Rama NO (derecha) */}
        <div className="flex flex-col items-center flex-1">
          <div className="text-xs font-semibold text-gray-600 my-1">No</div>
          <FlowchartArrow short />
          {hasFalse ? (
            <div className="flex flex-col items-center px-2">
              <FlowchartBlocks blocks={block.children.false} />
            </div>
          ) : (
            <div className="h-8" />
          )}
        </div>
      </div>
      
      {/* Linea de union */}
      <div className="w-full border-t-2 border-gray-400 mt-2" />
      <FlowchartArrow />
    </div>
  )
}

function FlowchartWhile({ block }) {
  const hasBody = block.children.true.length > 0

  return (
    <div className="flex flex-col items-center w-full">
      {/* Rombo de condicion */}
      <FlowchartBox type="decision">
        {block.content.condition}
      </FlowchartBox>
      
      <div className="flex w-full justify-center">
        {/* Cuerpo del bucle (izquierda) */}
        <div className="flex flex-col items-center flex-1 border-r border-gray-300 relative">
          <div className="text-xs font-semibold text-gray-600 my-1">Si</div>
          <FlowchartArrow short />
          {hasBody && (
            <div className="flex flex-col items-center px-2">
              <FlowchartBlocks blocks={block.children.true} />
            </div>
          )}
          {/* Flecha de retorno */}
          <div className="absolute left-0 top-1/2 w-2 h-full border-l-2 border-b-2 border-gray-400" style={{ transform: 'translateY(-50%)' }} />
        </div>
        
        {/* Salida (derecha) */}
        <div className="flex flex-col items-center flex-1">
          <div className="text-xs font-semibold text-gray-600 my-1">No</div>
        </div>
      </div>
      
      <FlowchartArrow />
    </div>
  )
}

function FlowchartBox({ type, children }) {
  const baseClasses = "px-4 py-2 text-sm text-center min-w-[120px] max-w-[200px]"
  
  if (type === 'terminal') {
    // Rectangulo con esquinas redondeadas para inicio/fin
    return (
      <div className={`${baseClasses} bg-gray-100 border-2 border-gray-800 rounded-full`}>
        {children}
      </div>
    )
  }
  
  if (type === 'process') {
    // Rectangulo para procesos/asignaciones
    return (
      <div className={`${baseClasses} bg-white border-2 border-gray-800`}>
        {children}
      </div>
    )
  }
  
  if (type === 'io') {
    // Paralelogramo para entrada/salida (simulado con skew)
    return (
      <div className={`${baseClasses} bg-white border-2 border-gray-800`} style={{ transform: 'skewX(-10deg)' }}>
        <span style={{ display: 'inline-block', transform: 'skewX(10deg)' }}>{children}</span>
      </div>
    )
  }
  
  if (type === 'decision') {
    // Rombo para decisiones
    return (
      <div className="relative">
        <div 
          className={`${baseClasses} bg-white border-2 border-gray-800`}
          style={{ transform: 'rotate(45deg)', minWidth: '80px', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={{ transform: 'rotate(-45deg)', display: 'block', fontSize: '12px' }}>{children}</span>
        </div>
      </div>
    )
  }
  
  return <div className={baseClasses}>{children}</div>
}

function FlowchartArrow({ short = false }) {
  return (
    <div className={`flex flex-col items-center ${short ? 'h-4' : 'h-8'}`}>
      <div className={`w-0.5 bg-gray-800 ${short ? 'h-2' : 'h-6'}`} />
      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
    </div>
  )
}
