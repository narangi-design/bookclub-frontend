import { describe, it, expect } from 'vitest'
import { buildEntityTree } from '@/utils'

describe('buildEntityTree', () => {
  it('returns plain text when there are no entities', () => {
    expect(buildEntityTree('просто текст', [])).toEqual(['просто текст'])
  })

  it('wraps a link in the middle of the text', () => {
    const link = { type: 'text_link', offset: 10, length: 7, url: 'https://example.com' }
    expect(buildEntityTree('Смотрите «Сталкер»!', [link])).toEqual([
      'Смотрите «', { entity: link, children: ['Сталкер'] }, '»!',
    ])
  })

  it('nests bold inside a link regardless of input order', () => {
    const bold = { type: 'bold', offset: 0, length: 4 }
    const link = { type: 'text_link', offset: 0, length: 8, url: 'https://x.y' }
    expect(buildEntityTree('один дваXXX', [bold, link])).toEqual([
      { entity: link, children: [{ entity: bold, children: ['один'] }, ' два'] },
      'XXX',
    ])
  })

  it('uses UTF-16 offsets, so emoji count as two units', () => {
    const bold = { type: 'bold', offset: 3, length: 3 }
    expect(buildEntityTree('📚 тут', [bold])).toEqual(['📚 ', { entity: bold, children: ['тут'] }])
  })

  it('skips an entity that overlaps the previous one', () => {
    const a = { type: 'bold', offset: 0, length: 4 }
    const b = { type: 'italic', offset: 2, length: 4 }
    expect(buildEntityTree('abcdef', [a, b])).toEqual([
      { entity: a, children: ['ab', { entity: b, children: ['cd'] }] },
      'ef',
    ])
  })
})
