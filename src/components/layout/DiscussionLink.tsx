import './DiscussionLink.scss'

interface Props {
  url: string
  variant?: 'inline' | 'boxed'
}

export default function DiscussionLink({ url, variant = 'inline' }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`discussion-link${variant === 'boxed' ? ' discussion-link--boxed' : ''}`}
      title="Запись заседания"
    >
      ▶
    </a>
  )
}
