
import { Button } from '../components/ui/button'
import { Link } from 'react-router-dom'
import { Shield, Eye, Database, Mail } from 'lucide-react'

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Privatlivspolitik</h1>
        <p className="text-muted-foreground">
          Sidst opdateret: Januar 2025
        </p>
        <p className="text-muted-foreground mt-2">
          Danish Fathers Directory respekterer dit privatliv og er forpligtet til at beskytte dine personlige oplysninger. 
          Denne privatlivspolitik forklarer, hvordan vi indsamler, bruger og beskytter dine data.
        </p>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="p-6 border rounded-lg">
          <Shield className="h-8 w-8 text-green-500 mb-3" />
          <h3 className="font-semibold mb-2">Sikkerhed først</h3>
          <p className="text-sm text-muted-foreground">
            Vi bruger industristandarder for at beskytte dine data
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <Eye className="h-8 w-8 text-blue-500 mb-3" />
          <h3 className="font-semibold mb-2">Gennemsigtighed</h3>
          <p className="text-sm text-muted-foreground">
            Vi er åbne om hvilke data vi indsamler og hvorfor
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Data Collection */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Database className="h-6 w-6 mr-2" />
            Hvilke oplysninger indsamler vi?
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Kontooplysninger</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Email-adresse (påkrævet for oprettelse af konto)</li>
                <li>Brugernavn (valgfrit)</li>
                <li>Profilbillede (valgfrit)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Indhold og aktivitet</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Ressourcer du deler</li>
                <li>Kommentarer og voteringer</li>
                <li>Søgehistorik (gemmes lokalt)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Tekniske oplysninger</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>IP-adresse og browserinformation</li>
                <li>Enhedstype og skærmopløsning</li>
                <li>Besøgstidspunkter og sidevisninger</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Usage */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Hvordan bruger vi dine oplysninger?</h2>
          
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <h3 className="font-semibold mb-2">Primære formål</h3>
              <ul className="space-y-1 text-sm">
                <li>• Levere og vedligeholde vores tjenester</li>
                <li>• Personalisere din oplevelse</li>
                <li>• Kommunikere med dig om kontoopdateringer</li>
                <li>• Moderere indhold og håndhæve retningslinjer</li>
              </ul>
            </div>

            <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
              <h3 className="font-semibold mb-2">Forbedring af tjenesten</h3>
              <ul className="space-y-1 text-sm">
                <li>• Analysere brug for at forbedre funktionalitet</li>
                <li>• Identificere og rette tekniske problemer</li>
                <li>• Udvikle nye features baseret på brugerfeedback</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Sharing */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Deling af oplysninger</h2>
          
          <div className="p-6 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 rounded-lg mb-4">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
              Vi sælger IKKE dine data
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200">
              Danish Fathers Directory sælger, lejer eller giver aldrig dine personlige oplysninger videre til tredjeparter for kommercielle formål.
            </p>
          </div>

          <h3 className="text-lg font-semibold mb-3">Hvornår deler vi oplysninger?</h3>
          <ul className="space-y-2">
            <li><strong>Med dit samtykke:</strong> Kun når du eksplicit giver tilladelse</li>
            <li><strong>Juridiske krav:</strong> Hvis det kræves af loven eller myndigheder</li>
            <li><strong>Sikkerhed:</strong> For at beskytte brugere og forebygge misbrug</li>
            <li><strong>Tjenesteudbydere:</strong> Med pålidelige partnere der hjælper med drift (f.eks. hosting)</li>
          </ul>
        </section>

        {/* Data Security */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Datasikkerhed</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Tekniske foranstaltninger</h3>
              <ul className="text-sm space-y-1">
                <li>• SSL/TLS kryptering</li>
                <li>• Sikre servere og databaser</li>
                <li>• Regelmæssige sikkerhedsopdateringer</li>
                <li>• Adgangskontrol og logning</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Organisatoriske foranstaltninger</h3>
              <ul className="text-sm space-y-1">
                <li>• Begrænset adgang til persondata</li>
                <li>• Medarbejdertræning i datasikkerhed</li>
                <li>• Regelmæssige sikkerhedsgennemgange</li>
                <li>• Incidenthåndtering og -rapportering</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Dine rettigheder</h2>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Under GDPR har du ret til:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">📋 Indsigt</h4>
                <p className="text-sm">Se hvilke oplysninger vi har om dig</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">✏️ Rettelse</h4>
                <p className="text-sm">Få rettet forkerte oplysninger</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">🗑️ Sletning</h4>
                <p className="text-sm">Få slettet dine personoplysninger</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">📤 Portabilitet</h4>
                <p className="text-sm">Få dine data i et struktureret format</p>
              </div>
            </div>
          </div>
        </section>

        {/* Cookies */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Cookies og sporing</h2>
          
          <p className="mb-4">
            Vi bruger cookies og lignende teknologier til at forbedre din oplevelse:
          </p>
          
          <div className="space-y-3">
            <div className="p-3 border-l-4 border-gray-400 bg-gray-50 dark:bg-gray-950/20">
              <strong>Nødvendige cookies:</strong> Kræves for grundlæggende funktionalitet (login, præferencer)
            </div>
            <div className="p-3 border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-950/20">
              <strong>Analytiske cookies:</strong> Hjælper os forstå hvordan siden bruges (kan fravalges)
            </div>
            <div className="p-3 border-l-4 border-green-400 bg-green-50 dark:bg-green-950/20">
              <strong>Funktionelle cookies:</strong> Gemmer præferencer og forbedrer brugeroplevelsen
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Mail className="h-6 w-6 mr-2" />
            Kontakt os
          </h2>
          
          <p className="mb-4">
            Hvis du har spørgsmål om denne privatlivspolitik eller vil udøve dine rettigheder, 
            kan du kontakte os:
          </p>
          
          <div className="p-4 bg-muted rounded-lg">
            <p><strong>Email:</strong> privacy@danishfathersdirectory.dk</p>
            <p><strong>Svar inden:</strong> 30 dage</p>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link to="/contact">
                Kontakt os
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/support">
                Få hjælp
              </Link>
            </Button>
          </div>
        </section>

        {/* Updates */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Ændringer til denne politik</h2>
          
          <p className="mb-4">
            Vi kan opdatere denne privatlivspolitik fra tid til anden. Væsentlige ændringer vil blive kommunikeret via:
          </p>
          
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Email til registrerede brugere</li>
            <li>Banner på hjemmesiden</li>
            <li>Opdatering af "Sidst opdateret" datoen</li>
          </ul>
          
          <p className="text-sm text-muted-foreground">
            Ved fortsat brug af tjenesten efter ændringer accepterer du den opdaterede politik.
          </p>
        </section>
      </div>
    </div>
  )
}