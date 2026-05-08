'use client'

// Componente para renderizar un diagrama Nassi-Shneiderman

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
    <div className="min-h-[400px] p-6 border-2 border-border rounded-lg bg-white overflow-auto">
      <div className="inline-block min-w-[280px]" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px' }}>
        {/* Contenedor principal */}
        <div className="border-2 border-black">
          {/* Inicio */}
          <div className="border-b-2 border-black px-4 py-2 text-center bg-gray-100">
            Inicio
          </div>
          
          {/* Declaracion de variables si hay entradas */}
          {inputVariables.length > 0 && (
            <div className="border-b-2 border-black px-4 py-2 text-center">
              Entero: {inputVariables.join(', ')}
            </div>
          )}
          
          {/* Bloques del diagrama */}
          <FlowchartBlocks blocks={blocks} />
          
          {/* Fin */}
          <div className="px-4 py-2 text-center bg-gray-100">
            Fin algoritmo
          </div>
        </div>
      </div>
    </div>
  )
}

function FlowchartBlocks({ blocks }) {
  return (
    <>
      {blocks.map((block) => (
        <FlowchartBlock key={block.id} block={block} />
      ))}
    </>
  )
}

function FlowchartBlock({ block }) {
  if (block.type === 'input') {
    return (
      <div className="border-b-2 border-black px-4 py-2 text-center">
        Leer {block.content.variable}
      </div>
    )
  }

  if (block.type === 'assignment') {
    return (
      <div className="border-b-2 border-black px-4 py-2 text-center">
        {block.content.variable}={block.content.expression}
      </div>
    )
  }

  if (block.type === 'output') {
    return (
      <div className="border-b-2 border-black px-4 py-2 text-center">
        Escribir {block.content.expression}
      </div>
    )
  }

  if (block.type === 'conditional') {
    return <ConditionalBlock block={block} />
  }

  if (block.type === 'while') {
    return <WhileBlock block={block} />
  }

  return null
}

// Bloque condicional con triangulo superior (lineas desde esquinas al centro)
function ConditionalBlock({ block }) {
  const trueBlocks = block.children.true || []
  const falseBlocks = block.children.false || []

  return (
    <div className="border-b-2 border-black">
      {/* Triangulo de decision */}
      <div className="relative" style={{ height: '50px' }}>
        <svg 
          viewBox="0 0 200 50" 
          className="w-full h-full" 
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          {/* Fondo blanco */}
          <rect x="0" y="0" width="200" height="50" fill="white" />
          
          {/* Linea diagonal izquierda (desde esquina superior izquierda al centro inferior) */}
          <line x1="0" y1="0" x2="100" y2="50" stroke="black" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          
          {/* Linea diagonal derecha (desde esquina superior derecha al centro inferior) */}
          <line x1="200" y1="0" x2="100" y2="50" stroke="black" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          
          {/* Texto V (Verdadero) - lado izquierdo */}
          <text x="25" y="45" textAnchor="middle" style={{ fontSize: '14px', fontWeight: 'bold' }}>V</text>
          
          {/* Texto F (Falso) - lado derecho */}
          <text x="175" y="45" textAnchor="middle" style={{ fontSize: '14px', fontWeight: 'bold' }}>F</text>
          
          {/* Condicion en el centro */}
          <text x="100" y="30" textAnchor="middle" style={{ fontSize: '12px' }}>{block.content.condition}</text>
        </svg>
        
        {/* Borde inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
      </div>
      
      {/* Ramas V y F */}
      <div className="flex">
        {/* Rama Verdadero (izquierda) */}
        <div className="flex-1 border-r-2 border-black">
          <NestedBlocks blocks={trueBlocks} />
        </div>
        
        {/* Rama Falso (derecha) */}
        <div className="flex-1">
          <NestedBlocks blocks={falseBlocks} />
        </div>
      </div>
    </div>
  )
}

// Bloque while con L invertida
function WhileBlock({ block }) {
  const bodyBlocks = block.children.true || []

  return (
    <div className="border-b-2 border-black">
      {/* Condicion del while */}
      <div className="px-4 py-2 text-center border-b-2 border-black bg-blue-50">
        {block.content.condition}
      </div>
      
      {/* Cuerpo del while con L invertida */}
      <div className="flex">
        {/* Barra vertical izquierda (parte de la L invertida) */}
        <div className="w-6 border-r-2 border-black bg-blue-50" />
        
        {/* Contenido del bucle */}
        <div className="flex-1">
          <NestedBlocks blocks={bodyBlocks} />
        </div>
      </div>
    </div>
  )
}

// Bloques anidados
function NestedBlocks({ blocks }) {
  if (blocks.length === 0) {
    return <div className="min-h-[30px]" />
  }

  return (
    <>
      {blocks.map((block) => (
        <NestedBlock key={block.id} block={block} />
      ))}
    </>
  )
}

function NestedBlock({ block }) {
  if (block.type === 'input') {
    return (
      <div className="border-b border-black px-3 py-2 text-center text-sm">
        Leer {block.content.variable}
      </div>
    )
  }

  if (block.type === 'assignment') {
    return (
      <div className="border-b border-black px-3 py-2 text-center text-sm">
        {block.content.variable}={block.content.expression}
      </div>
    )
  }

  if (block.type === 'output') {
    return (
      <div className="border-b border-black px-3 py-2 text-center text-sm">
        Escribir {block.content.expression}
      </div>
    )
  }

  if (block.type === 'conditional') {
    return <NestedConditionalBlock block={block} />
  }

  if (block.type === 'while') {
    return <NestedWhileBlock block={block} />
  }

  return null
}

// Condicional anidado
function NestedConditionalBlock({ block }) {
  const trueBlocks = block.children.true || []
  const falseBlocks = block.children.false || []

  return (
    <div className="border-b border-black">
      {/* Triangulo de decision */}
      <div className="relative" style={{ height: '40px' }}>
        <svg 
          viewBox="0 0 200 40" 
          className="w-full h-full" 
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          <rect x="0" y="0" width="200" height="40" fill="white" />
          <line x1="0" y1="0" x2="100" y2="40" stroke="black" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="200" y1="0" x2="100" y2="40" stroke="black" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <text x="20" y="35" textAnchor="middle" style={{ fontSize: '12px', fontWeight: 'bold' }}>V</text>
          <text x="180" y="35" textAnchor="middle" style={{ fontSize: '12px', fontWeight: 'bold' }}>F</text>
          <text x="100" y="25" textAnchor="middle" style={{ fontSize: '11px' }}>{block.content.condition}</text>
        </svg>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-black" />
      </div>
      
      {/* Ramas */}
      <div className="flex">
        <div className="flex-1 border-r border-black">
          <NestedBlocks blocks={trueBlocks} />
        </div>
        <div className="flex-1">
          <NestedBlocks blocks={falseBlocks} />
        </div>
      </div>
    </div>
  )
}

// While anidado
function NestedWhileBlock({ block }) {
  const bodyBlocks = block.children.true || []

  return (
    <div className="border-b border-black">
      {/* Condicion */}
      <div className="px-2 py-1 text-center text-sm border-b border-black bg-blue-50">
        {block.content.condition}
      </div>
      
      {/* Cuerpo con L */}
      <div className="flex">
        <div className="w-4 border-r border-black bg-blue-50" />
        <div className="flex-1">
          <NestedBlocks blocks={bodyBlocks} />
        </div>
      </div>
    </div>
  )
}
