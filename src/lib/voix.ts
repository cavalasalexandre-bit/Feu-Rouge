// Lecture à voix haute avec la synthèse vocale du navigateur (aucun service externe).

export function voixDisponible(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

function voixFrancaise(): SpeechSynthesisVoice | undefined {
  const voix = window.speechSynthesis.getVoices()
  return voix.find((v) => v.lang === 'fr-BE') ?? voix.find((v) => v.lang === 'fr-FR') ?? voix.find((v) => v.lang.startsWith('fr'))
}

/** Texte lu pour une question : l'énoncé puis les réponses annoncées par leur lettre. */
export function texteALire(question: string, choix: string[]): string {
  const lettres = ['A', 'B', 'C', 'D']
  return [question, ...choix.map((c, i) => `${lettres[i]} : ${c}.`)].join(' ')
}

/** Durée estimée de lecture silencieuse (secondes), utilisée quand la voix est coupée ou indisponible. */
export function dureeLectureEstimee(texte: string): number {
  const mots = texte.split(/\s+/).filter(Boolean).length
  return Math.min(14, Math.max(4, Math.round(mots / 3)))
}

/**
 * Lit le texte et se résout à la fin de la lecture (ou si la lecture échoue).
 * Sécurité : se résout aussi après un délai maximum, certains navigateurs n'émettant pas « end ».
 */
export function lire(texte: string): Promise<void> {
  if (!voixDisponible()) return Promise.resolve()
  return new Promise((resolve) => {
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(texte)
    u.lang = 'fr-BE'
    const v = voixFrancaise()
    if (v) u.voice = v
    u.rate = 1
    let fini = false
    const terminer = () => {
      if (fini) return
      fini = true
      resolve()
    }
    u.onend = terminer
    u.onerror = terminer
    window.setTimeout(terminer, (dureeLectureEstimee(texte) + 10) * 1000)
    synth.speak(u)
  })
}

export function arreterLecture(): void {
  if (voixDisponible()) window.speechSynthesis.cancel()
}
