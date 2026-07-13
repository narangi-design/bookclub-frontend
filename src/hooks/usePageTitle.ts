import { useEffect } from 'react'

const SITE = 'Элитный книжный клуб'

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : SITE
    return () => { document.title = SITE }
  }, [title])
}
