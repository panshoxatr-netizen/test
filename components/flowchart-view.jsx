'use client'

// Componente para renderizar un diagrama de flujo clasico estilo Nassi-Shneiderman / tabular

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
      <div className="inline-block min-w-[300px]">
        {/* Contenedor principal con borde */}
        <table className="border-collapse border-2 border-black w-full" style={{ fontFamily: 'monospace' }}>
          <tbody>
            {/* Inicio */}
            <tr>
              <td className="border-2 border-black px-4 py-2 text-center bg-gray-50">
                Inicio
              </td>
            </tr>
            
            {/* Declaracion de variables si hay entradas */}
            {inputVariables.length > 0 && (
              <tr>
                <td className="border-2 border-black px-4 py-2 text-center">
                  Entero: {inputVariables.join(', ')}
                </td>
              </tr>
            )}
            
            {/* Bloques del diagrama */}
            <FlowchartRows blocks={blocks} />
            
            {/* Fin */}
            <tr>
              <td className="border-2 border-black px-4 py-2 text-center bg-gray-50">
                Fin algoritmo
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FlowchartRows({ blocks }) {
  return (
    <>
      {blocks.map((block) => (
        <FlowchartRow key={block.id} block={block} />
      ))}
    </>
  )
}

function FlowchartRow({ block }) {
  if (block.type === 'input') {
    return (
      <tr>
        <td className="border-2 border-black px-4 py-2 text-center">
          Leer {block.content.variable}
        </td>
      </tr>
    )
  }

  if (block.type === 'assignment') {
    return (
      <tr>
        <td className="border-2 border-black px-4 py-2 text-center">
          {block.content.variable} &larr; {block.content.expression}
        </td>
      </tr>
    )
  }

  if (block.type === 'output') {
    return (
      <tr>
        <td className="border-2 border-black px-4 py-2 text-center">
          Escribir {block.content.expression}
        </td>
      </tr>
    )
  }

  if (block.type === 'conditional') {
    return <FlowchartConditionalRow block={block} />
  }

  if (block.type === 'while') {
    return <FlowchartWhileRow block={block} />
  }

  return null
}

function FlowchartConditionalRow({ block }) {
  const trueBlocks = block.children.true || []
  const falseBlocks = block.children.false || []
  
  // Verificar si hay condicionales anidados en la rama falsa
  const hasNestedConditional = falseBlocks.length === 1 && falseBlocks[0].type === 'conditional'

  if (hasNestedConditional) {
    // Renderizar condicional con anidamiento horizontal (como en la imagen)
    return <FlowchartNestedConditional block={block} />
  }

  return (
    <tr>
      <td className="border-2 border-black p-0">
        <table className="w-full border-collapse">
          <tbody>
            {/* Fila del rombo/condicion */}
            <tr>
              <td colSpan={2} className="border-b-2 border-black p-0 relative">
                <DecisionDiamond condition={block.content.condition} />
              </td>
            </tr>
            {/* Etiquetas Si/No */}
            <tr>
              <td className="border-r-2 border-b-2 border-black px-2 py-1 text-center text-xs font-bold w-1/2">
                Si
              </td>
              <td className="border-b-2 border-black px-2 py-1 text-center text-xs font-bold w-1/2">
                No
              </td>
            </tr>
            {/* Contenido de las ramas */}
            <tr>
              <td className="border-r-2 border-black p-0 align-top w-1/2">
                <NestedBlocksTable blocks={trueBlocks} />
              </td>
              <td className="p-0 align-top w-1/2">
                <NestedBlocksTable blocks={falseBlocks} />
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}

function FlowchartNestedConditional({ block }) {
  const trueBlocks = block.children.true || []
  const nestedConditional = block.children.false[0]
  const nestedTrueBlocks = nestedConditional.children.true || []
  const nestedFalseBlocks = nestedConditional.children.false || []

  return (
    <tr>
      <td className="border-2 border-black p-0">
        <table className="w-full border-collapse">
          <tbody>
            {/* Primera condicion */}
            <tr>
              <td colSpan={3} className="border-b-2 border-black p-0 relative">
                <DecisionDiamond condition={block.content.condition} />
              </td>
            </tr>
            {/* Segunda condicion (anidada) en la rama No */}
            <tr>
              <td className="border-r-2 border-b-2 border-black px-2 py-1 text-center text-xs font-bold" style={{ width: '33%' }}>
                Si
              </td>
              <td colSpan={2} className="border-b-2 border-black p-0 relative">
                <DecisionDiamond condition={nestedConditional.content.condition} />
              </td>
            </tr>
            {/* Etiquetas de la condicion anidada */}
            <tr>
              <td className="border-r-2 border-black" style={{ width: '33%' }}></td>
              <td className="border-r-2 border-b-2 border-black px-2 py-1 text-center text-xs font-bold" style={{ width: '33%' }}>
                Si
              </td>
              <td className="border-b-2 border-black px-2 py-1 text-center text-xs font-bold" style={{ width: '33%' }}>
                No
              </td>
            </tr>
            {/* Contenido de las tres ramas */}
            <tr>
              <td className="border-r-2 border-black p-0 align-top" style={{ width: '33%' }}>
                <NestedBlocksTable blocks={trueBlocks} />
              </td>
              <td className="border-r-2 border-black p-0 align-top" style={{ width: '33%' }}>
                <NestedBlocksTable blocks={nestedTrueBlocks} />
              </td>
              <td className="p-0 align-top" style={{ width: '33%' }}>
                <NestedBlocksTable blocks={nestedFalseBlocks} />
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}

function FlowchartWhileRow({ block }) {
  const bodyBlocks = block.children.true || []

  return (
    <tr>
      <td className="border-2 border-black p-0">
        <table className="w-full border-collapse">
          <tbody>
            {/* Condicion del while */}
            <tr>
              <td className="border-b-2 border-black p-0 relative">
                <DecisionDiamond condition={block.content.condition} isWhile />
              </td>
            </tr>
            {/* Cuerpo del bucle */}
            <tr>
              <td className="p-0">
                <div className="flex">
                  {/* Barra lateral izquierda que indica el bucle */}
                  <div className="w-4 bg-gray-200 border-r-2 border-black flex items-center justify-center">
                    <div className="transform -rotate-90 text-xs font-bold whitespace-nowrap text-gray-500">
                      REPETIR
                    </div>
                  </div>
                  {/* Contenido del bucle */}
                  <div className="flex-1">
                    <NestedBlocksTable blocks={bodyBlocks} />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}

function DecisionDiamond({ condition, isWhile = false }) {
  return (
    <div className="flex items-center justify-center py-3 px-2">
      <div className="relative">
        {/* Rombo usando bordes */}
        <svg viewBox="0 0 120 60" className="w-full max-w-[200px] h-auto">
          {/* Lineas diagonales que forman el rombo */}
          <line x1="60" y1="5" x2="115" y2="30" stroke="black" strokeWidth="2" />
          <line x1="115" y1="30" x2="60" y2="55" stroke="black" strokeWidth="2" />
          <line x1="60" y1="55" x2="5" y2="30" stroke="black" strokeWidth="2" />
          <line x1="5" y1="30" x2="60" y2="5" stroke="black" strokeWidth="2" />
          {/* Texto de la condicion */}
          <text x="60" y="34" textAnchor="middle" className="text-xs" style={{ fontSize: '10px' }}>
            {condition}
          </text>
        </svg>
      </div>
    </div>
  )
}

function NestedBlocksTable({ blocks }) {
  if (blocks.length === 0) {
    return <div className="min-h-[30px]" />
  }

  return (
    <table className="w-full border-collapse">
      <tbody>
        {blocks.map((block) => (
          <NestedBlockRow key={block.id} block={block} />
        ))}
      </tbody>
    </table>
  )
}

function NestedBlockRow({ block }) {
  if (block.type === 'input') {
    return (
      <tr>
        <td className="border-b border-black px-2 py-2 text-center text-sm">
          Leer {block.content.variable}
        </td>
      </tr>
    )
  }

  if (block.type === 'assignment') {
    return (
      <tr>
        <td className="border-b border-black px-2 py-2 text-center text-sm">
          {block.content.variable} &larr; {block.content.expression}
        </td>
      </tr>
    )
  }

  if (block.type === 'output') {
    return (
      <tr>
        <td className="border-b border-black px-2 py-2 text-center text-sm">
          Escribir<br/>{block.content.expression}
        </td>
      </tr>
    )
  }

  if (block.type === 'conditional') {
    return (
      <tr>
        <td className="p-0">
          <NestedConditionalTable block={block} />
        </td>
      </tr>
    )
  }

  if (block.type === 'while') {
    return (
      <tr>
        <td className="border-b border-black p-0">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border-b border-black p-0">
                  <DecisionDiamond condition={block.content.condition} isWhile />
                </td>
              </tr>
              <tr>
                <td className="p-0">
                  <NestedBlocksTable blocks={block.children.true || []} />
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    )
  }

  return null
}

function NestedConditionalTable({ block }) {
  const trueBlocks = block.children.true || []
  const falseBlocks = block.children.false || []

  return (
    <table className="w-full border-collapse">
      <tbody>
        <tr>
          <td colSpan={2} className="border-b border-black p-0">
            <DecisionDiamond condition={block.content.condition} />
          </td>
        </tr>
        <tr>
          <td className="border-r border-b border-black px-1 py-1 text-center text-xs font-bold w-1/2">
            Si
          </td>
          <td className="border-b border-black px-1 py-1 text-center text-xs font-bold w-1/2">
            No
          </td>
        </tr>
        <tr>
          <td className="border-r border-black p-0 align-top w-1/2">
            <NestedBlocksTable blocks={trueBlocks} />
          </td>
          <td className="p-0 align-top w-1/2">
            <NestedBlocksTable blocks={falseBlocks} />
          </td>
        </tr>
      </tbody>
    </table>
  )
}
