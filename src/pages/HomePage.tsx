import { Link } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { SkeletonCard } from '../components/ui/skeleton'
import { ArrowRight, Heart, Users, BookOpen, Star, Zap, Globe, Shield, Sparkles, TrendingUp } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { useResources } from '../hooks/useResources'

export function HomePage() {
  const { categories, loading: categoriesLoading } = useCategories()
  const { resources } = useResources('approved')

  const featuredStats = [
    { icon: Users, label: 'Aktive fædre', value: '1.2k+', color: 'primary' },
    { icon: BookOpen, label: 'Ressourcer delt', value: resources.length.toString(), color: 'secondary' },
    { icon: Heart, label: 'Hjælpsomme svar', value: '2.3k+', color: 'accent' },
    { icon: Star, label: 'Bedømmelser', value: '4.8/5', color: 'warning' },
  ]

  const features = [
    {
      icon: Zap,
      title: 'Hurtig adgang',
      description: 'Find det du søger på sekunder med vores kraftfulde søgefunktion'
    },
    {
      icon: Globe,
      title: 'Dansk fællesskab',
      description: 'Skabt af og for danske fædre der ønsker at dele viden og erfaringer'
    },
    {
      icon: Shield,
      title: 'Kvalitetssikret',
      description: 'Alt indhold er modereret for at sikre høj kvalitet og relevans'
    }
  ]

  return (
    <Layout>
      {/* Hero Section - Legende & Energisk */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Floating shapes background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-shapes">
            <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
            <div className="absolute top-40 right-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-40 right-1/3 w-36 h-36 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        <div className="relative container mx-auto px-4 lg:px-6 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge med wiggle animation */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-semibold mb-8 animate-bounce-in hover:scale-105 transition-transform cursor-default">
              <Sparkles className="h-4 w-4 animate-wiggle" />
              <span>Danmarks mest hjælpsomme far-fællesskab</span>
            </div>

            {/* Main Heading med gradient */}
            <h1 className="text-display-lg lg:text-display-2xl font-extrabold text-foreground mb-6 leading-tight">
              Velkommen til{' '}
              <span className="bg-gradient-to-r from-primary via-primary-600 to-secondary bg-clip-text text-transparent animate-gradient">
                Farlandet
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Det danske fællesskab hvor fædre deler viden, ressourcer og erfaringer.
              Find inspiration til forældreskab, aktiviteter og meget mere.
            </p>

            {/* CTA Buttons med nye styles */}
            <div className="flex gap-4 justify-center flex-wrap mb-16">
              <Button asChild size="xl" variant="accent" pulse className="group">
                <Link to="/categories">
                  Udforsk ressourcer
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link to="/submit">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Bidrag med indhold
                </Link>
              </Button>
            </div>

            {/* Quick Stats med animated counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredStats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center group animate-bounce-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`
                    inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4
                    shadow-lg transition-all duration-300 ease-out
                    group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-xl
                    ${stat.color === 'primary' ? 'bg-primary/15 shadow-primary/20 group-hover:shadow-primary/30' : ''}
                    ${stat.color === 'secondary' ? 'bg-secondary/15 shadow-secondary/20 group-hover:shadow-secondary/30' : ''}
                    ${stat.color === 'accent' ? 'bg-accent/15 shadow-accent/20 group-hover:shadow-accent/30' : ''}
                    ${stat.color === 'warning' ? 'bg-warning/15 shadow-warning/20 group-hover:shadow-warning/30' : ''}
                  `}>
                    <stat.icon className={`h-7 w-7 ${
                      stat.color === 'primary' ? 'text-primary' :
                      stat.color === 'secondary' ? 'text-secondary' :
                      stat.color === 'accent' ? 'text-accent' :
                      'text-warning'
                    }`} />
                  </div>
                  <div className="text-3xl lg:text-4xl font-extrabold text-foreground mb-1 tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-display-md font-bold text-foreground mb-4">
              Hvorfor vælge Farlandet?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Vi har skabt den perfekte platform for danske fædre der ønsker at dele og lære
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center group p-8 rounded-3xl bg-background hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-bounce-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <feature.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-gradient-to-br from-background to-primary/5">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <Badge variant="accent" size="lg" className="mb-4">
              <TrendingUp className="h-4 w-4 mr-1" />
              Populære kategorier
            </Badge>
            <h2 className="text-display-md font-bold text-foreground mb-4">
              Udforsk vores kategorier
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Organiseret indhold der gør det let at finde præcis det du søger
            </p>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(0, 6).map((category, index) => (
                <Link to={`/categories/${category.slug}`} key={category.id}>
                  <Card
                    glow
                    className="h-full cursor-pointer animate-bounce-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between group-hover:text-primary transition-colors duration-200">
                        <span>{category.name}</span>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                      </CardTitle>
                      <CardDescription className="leading-relaxed">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Resources Section */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-display-md font-bold text-foreground mb-4">
              Seneste ressourcer
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Se hvad fællesskabet har delt for nylig
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {resources.slice(0, 6).map((resource, index) => (
              <Link to={`/resources/${resource.id}`} key={resource.id}>
                <Card
                  glow
                  className="h-full cursor-pointer animate-bounce-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg">
                      {resource.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 leading-relaxed">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Badge variant="default">
                        {resource.category?.name}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Heart className="h-4 w-4 text-accent" />
                        <span className="font-semibold tabular-nums">{resource.votes}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/categories">
                Se alle ressourcer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Modern CTA Section med gradient */}
      <section className="py-24 bg-gradient-to-r from-primary via-primary-600 to-secondary text-white relative overflow-hidden">
        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent rounded-full blur-3xl opacity-30" />
        </div>

        <div className="relative container mx-auto px-4 lg:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-display-md font-bold mb-6">
              Klar til at komme i gang?
            </h2>
            <p className="text-xl text-white/80 mb-12 leading-relaxed">
              Bliv en del af Danmarks mest hjælpsomme far-fællesskab. Del dine erfaringer og lær af andre.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="xl" className="bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <Link to="/submit">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Del din første ressource
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="border-2 border-white/50 text-white hover:bg-white/10 hover:border-white">
                <Link to="/categories">
                  Udforsk kategorier
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
