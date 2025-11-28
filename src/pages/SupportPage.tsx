import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Link } from 'react-router-dom'
import { Search, HelpCircle, BookOpen, MessageCircle, Settings, Users, Shield } from 'lucide-react'

export function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Kom i gang',
      icon: BookOpen,
      questions: [
        {
          question: 'Hvordan opretter jeg en konto?',
          answer: 'Klik på "Log ind" i toppen af siden, og vælg derefter "Opret konto". Udfyld formularen med din email og vælg et password.'
        },
        {
          question: 'Hvordan finder jeg relevante ressourcer?',
          answer: 'Brug søgefeltet i toppen, eller gennemse kategorier på forsiden. Du kan også filtrere ressourcer på "Alle Ressourcer" siden.'
        },
        {
          question: 'Hvordan bidrage med en ressource?',
          answer: 'Når du er logget ind, klik på "Bidrag med Indhold" eller gå til /submit. Udfyld formularen med detaljer om din ressource.'
        }
      ]
    },
    {
      id: 'account-management',
      title: 'Kontostyring',
      icon: Settings,
      questions: [
        {
          question: 'Hvordan ændrer jeg min profil?',
          answer: 'Gå til din profilside ved at klikke på dit brugernavn. Her kan du opdatere dine oplysninger og præferencer.'
        },
        {
          question: 'Hvordan nulstiller jeg mit password?',
          answer: 'På login-siden, klik på "Glemt password?" og følg instruktionerne sendt til din email.'
        },
        {
          question: 'Kan jeg slette min konto?',
          answer: 'Ja, kontakt os via kontaktformularen for at få hjælp til at slette din konto permanent.'
        }
      ]
    },
    {
      id: 'community',
      title: 'Fællesskab',
      icon: Users,
      questions: [
        {
          question: 'Hvordan virker voteringer?',
          answer: 'Du kan vote ressourcer op eller ned for at hjælpe andre med at finde de bedste ressourcer. Høj-votede ressourcer vises øverst.'
        },
        {
          question: 'Hvordan kommenterer jeg på ressourcer?',
          answer: 'Under hver ressource kan du tilføje kommentarer. Vær respektfuld og konstruktiv i dine kommentarer.'
        },
        {
          question: 'Hvad gør moderatorerne?',
          answer: 'Moderatorer gennemgår nye ressourcer, håndhæver retningslinjer og hjælper med at holde fællesskabet sikkert og konstruktivt.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Teknisk support',
      icon: HelpCircle,
      questions: [
        {
          question: 'Siden loader ikke korrekt',
          answer: 'Prøv at opdatere siden (F5 eller Ctrl+R). Hvis problemet fortsætter, ryd din browser-cache eller prøv en anden browser.'
        },
        {
          question: 'Jeg kan ikke uploade filer',
          answer: 'Sørg for at filen er under 10MB og i et understøttet format (PDF, JPEG, PNG). Kontakt os hvis problemet fortsætter.'
        },
        {
          question: 'Links virker ikke',
          answer: 'Rapporter defekte links via kontaktformularen. Vi arbejder på at holde alle links opdaterede.'
        }
      ]
    },
    {
      id: 'privacy-security',
      title: 'Privatliv og sikkerhed',
      icon: Shield,
      questions: [
        {
          question: 'Hvordan bruges mine data?',
          answer: 'Læs vores privatlivspolitik for detaljerede oplysninger om dataindsamling og -brug. Vi deler aldrig dine data med tredjeparter.'
        },
        {
          question: 'Er mine oplysninger sikre?',
          answer: 'Ja, vi bruger SSL-kryptering og industristandarder for at beskytte dine data. Passwords gemmes krypteret.'
        },
        {
          question: 'Kan jeg rapportere misbrug?',
          answer: 'Ja, brug kontaktformularen eller email os direkte for at rapportere upassende indhold eller adfærd.'
        }
      ]
    }
  ]

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      searchQuery === '' || 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Support Center</h1>
        <p className="text-muted-foreground">
          Find svar på almindelige spørgsmål eller kontakt os for hjælp
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Søg i FAQ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button variant="outline" asChild className="h-auto p-4">
          <Link to="/contact">
            <div className="text-center">
              <MessageCircle className="h-6 w-6 mx-auto mb-2" />
              <div className="font-semibold">Kontakt Support</div>
              <div className="text-xs text-muted-foreground">Få personlig hjælp</div>
            </div>
          </Link>
        </Button>
        
        <Button variant="outline" asChild className="h-auto p-4">
          <Link to="/guidelines">
            <div className="text-center">
              <BookOpen className="h-6 w-6 mx-auto mb-2" />
              <div className="font-semibold">Retningslinjer</div>
              <div className="text-xs text-muted-foreground">Læs reglerne</div>
            </div>
          </Link>
        </Button>
        
        <Button variant="outline" asChild className="h-auto p-4">
          <Link to="/submit">
            <div className="text-center">
              <HelpCircle className="h-6 w-6 mx-auto mb-2" />
              <div className="font-semibold">Bidrag med Indhold</div>
              <div className="text-xs text-muted-foreground">Del en ressource</div>
            </div>
          </Link>
        </Button>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-8">
        {filteredCategories.length > 0 ? (
          filteredCategories.map(category => {
            const IconComponent = category.icon
            return (
              <section key={category.id}>
                <div className="flex items-center mb-4">
                  <IconComponent className="h-5 w-5 mr-2 text-primary" />
                  <h2 className="text-xl font-semibold">{category.title}</h2>
                </div>
                
                <div className="space-y-4">
                  {category.questions.map((qa, index) => (
                    <details key={index} className="group border rounded-lg">
                      <summary className="flex justify-between items-center cursor-pointer p-4 hover:bg-muted/50">
                        <span className="font-medium">{qa.question}</span>
                        <HelpCircle className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="px-4 pb-4">
                        <p className="text-muted-foreground">{qa.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )
          })
        ) : (
          <div className="text-center py-8">
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ingen resultater fundet</h3>
            <p className="text-muted-foreground mb-4">
              Prøv at ændre dine søgeord eller kontakt os direkte
            </p>
            <Button asChild>
              <Link to="/contact">
                Kontakt Support
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Still Need Help */}
      <div className="mt-12 p-6 bg-muted rounded-lg text-center">
        <h3 className="text-lg font-semibold mb-2">Fandt du ikke svar på dit spørgsmål?</h3>
        <p className="text-muted-foreground mb-4">
          Kontakt vores supportteam, så hjælper vi dig gerne videre
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/contact">
              Kontakt Support
            </Link>
          </Button>
          <Button variant="outline">
            <a href="mailto:support@danishfathersdirectory.dk">
              Send Email
            </a>
          </Button>
        </div>
      </div>

      {/* Response Time Info */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Vores supportteam svarer typisk inden for 1-2 arbejdsdage</p>
      </div>
        </div>
      </div>
    </Layout>
  )
}