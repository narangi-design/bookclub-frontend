import './OpenTextCloud.scss'

interface Props {
  texts: string[]
}

export default function OpenTextCloud({ texts }: Props) {
  if (texts.length === 0) {
    return <p className="open-text-empty">Пока никто ничего не написал.</p>
  }

  return (
    <div className="open-text-cloud">
      {texts.map((text, i) => (
        <blockquote key={i} className="open-text-snippet">{text}</blockquote>
      ))}
    </div>
  )
}
