import { Layout } from '@/components/layout/Layout'
import { Button } from '../components/ui/button'
import { Link } from 'react-router-dom'
import { Shield, Users, Heart, AlertTriangle } from 'lucide-react'

export function GuidelinesPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Retningslinjer for Fællesskabet</h1>
        <p className="text-muted-foreground">
          Danish Fathers Directory er et fællesskab bygget på respekt, støtte og deling af værdifuld viden. 
          Disse retningslinjer hjælper os med at opretholde et positivt miljø for alle.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="text-center p-6 border rounded-lg">
          <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Støtte</h3>
          <p className="text-sm text-muted-foreground">
            Vi støtter hinanden som fædre i alle livets faser
          </p>
        </div>
        <div className="text-center p-6 border rounded-lg">
          <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Fællesskab</h3>
          <p className="text-sm text-muted-foreground">
            Vi bygger et stærkt netværk af danske fædre
          </p>
        </div>
        <div className="text-center p-6 border rounded-lg">
          <Shield className="h-8 w-8 text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Respekt</h3>
          <p className="text-sm text-muted-foreground">
            Vi behandler alle med respekt og forståelse
          </p>
        </div>
      </div>

      {/* Guidelines Sections */}
      <div className="space-y-8">
        {/* Content Guidelines */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Retningslinjer for Indhold</h2>
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-semibold mb-3">✅ Hvad vi hilser velkommen</h3>
            <ul className="space-y-2 mb-6">
              <li>Relevante ressourcer for danske fædre</li>
              <li>Praktiske tips og råd om forældreskab</li>
              <li>Anbefalinger til bøger, artikler, podcasts og videoer</li>
              <li>Personlige erfaringer og læring</li>
              <li>Støttende kommentarer og konstruktiv feedback</li>
              <li>Spørgsmål og diskussioner om faderskap</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3">❌ Hvad vi ikke tillader</h3>
            <ul className="space-y-2 mb-6">
              <li>Spam, reklamer eller selvpromovering uden værdi</li>
              <li>Diskriminerende eller hadefuldt indhold</li>
              <li>Irrelevant indhold der ikke handler om faderskap</li>
              <li>Krænkende eller respektløse kommentarer</li>
              <li>Personangreb eller chikane</li>
              <li>Ophavsretsbeskyttet materiale uden tilladelse</li>
            </ul>
          </div>
        </section>

        {/* Community Behavior */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Adfærd i Fællesskabet</h2>
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-semibold mb-3">Vær respektfuld</h3>
            <p className="mb-4">
              Vi kommer alle fra forskellige baggrunde og har forskellige oplevelser med faderskap. 
              Vær respektfuld overfor andres meninger, selvom du ikke er enig.
            </p>

            <h3 className="text-lg font-semibold mb-3">Vær støttende</h3>
            <p className="mb-4">
              Faderskap kan være udfordrende. Tilbyd støtte og opmuntring til andre fædre, 
              især dem der deler svære oplevelser.
            </p>

            <h3 className="text-lg font-semibold mb-3">Vær konstruktiv</h3>
            <p className="mb-4">
              Når du giver feedback eller kritik, fokuser på indholdet og ikke personen. 
              Tilbyd konstruktive forslag når det er muligt.
            </p>
          </div>
        </section>

        {/* Quality Standards */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Kvalitetsstandarder</h2>
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-semibold mb-3">For ressourcer</h3>
            <ul className="space-y-2 mb-6">
              <li>Giv en klar og beskrivende titel</li>
              <li>Beskriv kort hvad ressourcen handler om</li>
              <li>Vælg den rigtige kategori og tilføj relevante tags</li>
              <li>Sørg for at links fungerer og er tilgængelige</li>
              <li>Tjek at ressourcen ikke allerede findes</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3">For kommentarer</h3>
            <ul className="space-y-2 mb-6">
              <li>Vær relevant og tilføj værdi til diskussionen</li>
              <li>Undgå gentagelser af hvad andre allerede har sagt</li>
              <li>Brug venlig og professionel tone</li>
              <li>Citer kilder når du deler faktuel information</li>
            </ul>
          </div>
        </section>

        {/* Moderation */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Moderation og Håndhævelse</h2>
          <div className="p-6 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  Overtrædelse af retningslinjer
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                  Ved overtrædelse af disse retningslinjer kan følgende ske:
                </p>
                <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                  <li>• Advarsler og vejledning</li>
                  <li>• Fjernelse af indhold</li>
                  <li>• Midlertidig suspension</li>
                  <li>• Permanent udelukkelse i grove tilfælde</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Reporting */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Rapportering</h2>
          <p className="mb-4">
            Hvis du støder på indhold eller adfærd der overtræder disse retningslinjer, 
            bedes du rapportere det til moderatorerne.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link to="/contact">
                Rapporter problem
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/support">
                Få hjælp
              </Link>
            </Button>
          </div>
        </section>
      </div>

      {/* Call to Action */}
      <div className="mt-12 p-6 bg-muted rounded-lg text-center">
        <h3 className="text-lg font-semibold mb-2">Klar til at bidrage?</h3>
        <p className="text-muted-foreground mb-4">
          Nu hvor du kender retningslinjerne, er du klar til at dele dine ressourcer med fællesskabet.
        </p>
        <Button asChild>
          <Link to="/submit">
            Bidrag med en ressource
          </Link>
        </Button>
      </div>
        </div>
      </div>
    </Layout>
  )
}