
import { useSEO } from '../hooks/useSEO'

export function SubmitResourcePage() {
  useSEO({
    title: 'Indsend Ressource - Farlandet.dk',
    description: 'Del en ressource med Farlandet.dk fællesskabet. Upload links, PDFer, podcasts, artikler og meget mere.',
    keywords: ['indsend ressource', 'del link', 'upload pdf', 'fællesskab bidrag'],
    url: 'https://farlandet.dk/submit',
    type: 'website'
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Indsend en Ressource
        </h1>
        <p className="text-lg text-muted-foreground">
          Del værdifulde ressourcer med det danske fædrefællesskab
        </p>
      </div>

      {/* Migration notice */}
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-800">⚠️ Under Migration</h2>
        <p className="text-yellow-700 mb-4">
          Funktionaliteten for at indsende ressourcer er midlertidigt utilgængelig mens vi migrerer til PocketBase.
        </p>
        <p className="text-yellow-700">
          Du kan stadig browse eksisterende ressourcer på forsiden. Indsendelse af nye ressourcer kommer snart tilbage!
        </p>
      </div>

      {/* Introduction section */}
      <div className="bg-card p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">Hvad kan du dele?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔗</span>
            <span>Links til nyttige websites</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <span>PDF dokumenter</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎧</span>
            <span>Podcast episoder</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📰</span>
            <span>Artikler og blogindlæg</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <span>Bøger og e-bøger</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <span>Tips og tricks</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎥</span>
            <span>Videoer og tutorials</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍿</span>
            <span>Film og TV-serier</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📺</span>
            <span>Dokumentarer</span>
          </div>
        </div>
      </div>

      {/* Guidelines section */}
      <div className="bg-card p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">Retningslinjer for Indsendelse</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Ressourcen skal være relevant for danske fædre</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Skriv en klar og beskrivende titel</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Tilføj en kort beskrivelse af indholdet</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Vælg den mest passende kategori</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Tilføj relevante tags for lettere søgning</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1">✗</span>
            <span>Indhold der ikke er relevant for forældreskab</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1">✗</span>
            <span>Spam, reklamer eller kommercielt indhold</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1">✗</span>
            <span>Stødende eller upassende materiale</span>
          </li>
        </ul>
      </div>

      {/* Call to action */}
      <div className="text-center bg-muted p-8 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">
          Kom snart tilbage
        </h2>
        <p className="text-muted-foreground mb-6">
          Indsendelse af ressourcer kommer tilbage efter migrationen til PocketBase er færdig
        </p>
        <a href="/" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors">
          Gå til Forsiden
        </a>
      </div>
    </div>
  )
}