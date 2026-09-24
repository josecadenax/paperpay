import { Fragment, type ReactNode } from 'react'

/*
 * Renderizador mínimo para el markdown de los artículos (encabezados, listas, código,
 * negritas y código en línea). Construye elementos de React, nunca HTML crudo,
 * así que el contenido del backend no puede inyectar scripts.
 */

type Block =
  | { kind: 'h2' | 'h3' | 'p'; text: string }
  | { kind: 'ul' | 'ol'; items: string[] }
  | { kind: 'code'; text: string }

// El título, autores y DOI ya se muestran en la cabecera; el cuerpo empieza en el primer "## ".
function bodyOf(markdown: string): string {
  const start = markdown.search(/^## /m)
  return start === -1 ? markdown : markdown.slice(start)
}

function parse(markdown: string): Block[] {
  const blocks: Block[] = []
  const lines = bodyOf(markdown).split('\n')
  let paragraph: string[] = []

  const flush = () => {
    if (paragraph.length) blocks.push({ kind: 'p', text: paragraph.join(' ') })
    paragraph = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      flush()
      const code: string[] = []
      while (++i < lines.length && !lines[i].trim().startsWith('```')) code.push(lines[i])
      blocks.push({ kind: 'code', text: code.join('\n') })
    } else if (trimmed.startsWith('### ')) {
      flush()
      blocks.push({ kind: 'h3', text: trimmed.slice(4) })
    } else if (trimmed.startsWith('## ')) {
      flush()
      blocks.push({ kind: 'h2', text: trimmed.slice(3) })
    } else if (/^[-*] /.test(trimmed) || /^\d+\. /.test(trimmed)) {
      flush()
      const kind = /^\d+\. /.test(trimmed) ? 'ol' : 'ul'
      const last = blocks[blocks.length - 1]
      const item = trimmed.replace(/^([-*]|\d+\.) /, '')
      if (last && last.kind === kind) last.items.push(item)
      else blocks.push({ kind, items: [item] })
    } else if (trimmed === '' || trimmed === '---' || trimmed.startsWith('# ')) {
      flush()
    } else {
      paragraph.push(trimmed)
    }
  }
  flush()
  return blocks
}

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>
    return <Fragment key={i}>{part}</Fragment>
  })
}

export function MarkdownContent({ markdown }: { markdown: string }) {
  return (
    <>
      {parse(markdown).map((block, i) => {
        switch (block.kind) {
          case 'h2':
            return <h2 key={i}>{inline(block.text)}</h2>
          case 'h3':
            return <h3 key={i}>{inline(block.text)}</h3>
          case 'code':
            return (
              <pre key={i}>
                <code>{block.text}</code>
              </pre>
            )
          case 'ul':
          case 'ol': {
            const List = block.kind
            return (
              <List key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{inline(item)}</li>
                ))}
              </List>
            )
          }
          default:
            return <p key={i}>{inline(block.text)}</p>
        }
      })}
    </>
  )
}
