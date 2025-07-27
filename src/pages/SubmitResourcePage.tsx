import React, { useState } from 'react'
import { ResourceSubmissionForm } from '../components/resource/ResourceSubmissionForm'
import { Button } from '../components/ui/button'
import { Link } from 'react-router-dom'
import { CheckCircle, Plus } from 'lucide-react'
import { useSEO } from '../hooks/useSEO'

export function SubmitResourcePage() {
  const [submitted, setSubmitted] = useState(false)

  useSEO({
    title: 'Bidrag med Ressource - Farlandet.dk',
    description: 'Del dine værdifulde ressourcer med danske fædre. Tilføj podcasts, artikler, tips, bøger og meget mere til vores fælles bibliotek.',
    keywords: ['bidrag ressource', 'del indhold', 'submit resource', 'forslag til fædre', 'community bidrag'],
    url: 'https://farlandet.dk/submit',
  })

  const handleSubmissionSuccess = () => {
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Tak for dit bidrag!</h1>
          <p className="text-muted-foreground mb-6">
            Din ressource er sendt til gennemgang og vil blive offentliggjort efter godkendelse.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Hvad sker der nu?</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Din ressource gennemgås af vores moderatorer</li>
                <li>• Du får besked når ressourcen er godkendt</li>
                <li>• Ressourcen bliver tilgængelig for alle brugere</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => setSubmitted(false)}>
                <Plus className="h-4 w-4 mr-2" />
                Tilføj en til
              </Button>
              <Button variant="outline" asChild>
                <Link to="/resources">
                  Se alle ressourcer
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Bidrag med Indhold</h1>
        <p className="text-muted-foreground">
          Del en ressource med fællesskabet. Det kan være en artikel, bog, video, tip eller andet nyttigt indhold for danske fædre.
        </p>
      </div>

      {/* Guidelines */}
      <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">Retningslinjer for indhold</h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Indholdet skal være relevant for danske fædre</li>
          <li>• Vær respektfuld og konstruktiv i din tilgang</li>
          <li>• Sørg for at links og filer er tilgængelige</li>
          <li>• Beskriv indholdet tydeligt så andre kan vurdere relevansen</li>
          <li>• Undgå duplikater - tjek om ressourcen allerede findes</li>
        </ul>
      </div>

      {/* Submission Form */}
      <div className="mb-8">
        <ResourceSubmissionForm onSuccess={handleSubmissionSuccess} />
      </div>

      {/* Help Section */}
      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Brug for hjælp?</h3>
        <p className="text-muted-foreground mb-4">
          Hvis du har spørgsmål om at indsende indhold eller støder på problemer, kan du kontakte os.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" asChild>
            <Link to="/guidelines">
              Læs retningslinjer
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/contact">
              Kontakt support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}