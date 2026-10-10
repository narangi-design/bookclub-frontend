import { Fragment, type ReactNode } from 'react'
import type { TelegramEntity } from '@/types'
import { buildEntityTree, type EntityNode } from '@/utils'

// Only web/mail links become <a> — tg:// and anything else render as plain text
function safeHref(url: string): string | null {
  return /^(https?:|mailto:)/i.test(url) ? url : null
}

function link(href: string | null, children: ReactNode) {
  return href
    ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
    : <>{children}</>
}

function wrap(entity: TelegramEntity, raw: string, children: ReactNode): ReactNode {
  switch (entity.type) {
    case 'bold': return <strong>{children}</strong>
    case 'italic': return <em>{children}</em>
    case 'underline': return <u>{children}</u>
    case 'strikethrough': return <s>{children}</s>
    case 'spoiler': return <span className="tg-spoiler">{children}</span>
    case 'code': return <code>{children}</code>
    case 'pre': return <pre>{children}</pre>
    case 'blockquote':
    case 'expandable_blockquote': return <blockquote>{children}</blockquote>
    case 'text_link': return link(safeHref(entity.url ?? ''), children)
    case 'url': return link(safeHref(/^[a-z]+:/i.test(raw) ? raw : `https://${raw}`), children)
    case 'email': return link(`mailto:${raw}`, children)
    case 'mention': return link(`https://t.me/${raw.replace(/^@/, '')}`, children)
    default: return <>{children}</>
  }
}

function render(text: string, nodes: EntityNode[]): ReactNode[] {
  return nodes.map((node, i) => {
    if (typeof node === 'string') return node
    const { offset, length } = node.entity
    const raw = text.slice(offset, offset + length)
    return <Fragment key={i}>{wrap(node.entity, raw, render(text, node.children))}</Fragment>
  })
}

interface Props {
  text: string
  entities: TelegramEntity[]
  className?: string
}

/** Message text with Telegram formatting/links restored from its entities — no HTML is stored or injected. */
export default function TelegramText({ text, entities, className }: Props) {
  return <div className={className}>{render(text, buildEntityTree(text, entities))}</div>
}
