import { useMemo } from 'react'
import { marked } from 'marked'

// Le contenu vient uniquement des fiches de cours du dépôt (pas de texte saisi par l'utilisateur).
export function Markdown({ source }: { source: string }) {
  const html = useMemo(() => {
    const brut = marked.parse(source, { async: false }) as string
    return brut.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>')
  }, [source])
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
}
