import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { ArrowRight, Heart, Users, BookOpen, Star, Zap, Globe, Shield, Sparkles, TrendingUp } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { useResources } from '../hooks/useResources'

export function HomePage() {
  const { categories, loading: categoriesLoading } = useCategories()
  const { resources } = useResources('approved')

  const featuredStats = [
    { icon: Users, label: 'Aktive fædre', value: '1.2k+', color: 'text-blue-600' },
    { icon: BookOpen, label: 'Ressourcer delt', value: resources.length.toString(), color: 'text-green-600' },
    { icon: Heart, label: 'Hjælpsomme svar', value: '2.3k+', color: 'text-pink-600' },
    { icon: Star, label: 'Bedømmelser', value: '4.8/5', color: 'text-yellow-600' },
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
    <div className="min-h-screen">
      {/* Modern Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.05)_25%,rgba(68,68,68,.05)_50%,transparent_50%,transparent_75%,rgba(68,68,68,.05)_75%)] bg-[length:20px_20px]"></div>
        
        <div className="relative container mx-auto px-4 lg:px-6 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 animate-scale-in">
              <Sparkles className="h-4 w-4" />
              <span>Danmarks mest hjælpsomme far-fællesskab</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-display-lg lg:text-display-xl font-bold text-foreground mb-6 leading-tight">
              Velkommen til{' '}
              <span className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent">
                Farlandet
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Det danske fællesskab hvor fædre deler viden, ressourcer og erfaringer. 
              Find inspiration til forældreskab, aktiviteter og meget mere.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center flex-wrap mb-16">
              <Button asChild size="lg" className="group">
                <Link to="/categories">
                  Udforsk ressourcer 
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/submit">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Bidrag med indhold
                </Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
              {featuredStats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-card shadow-md mb-4 group-hover:scale-110 transition-transform duration-200 ${stat.color.replace('text-', 'bg-').replace('-600', '-50')}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
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
              <div key={index} className="text-center group animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors duration-200">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
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
      <section className="py-20 gradient-subtle">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <TrendingUp className="h-4 w-4" />
              <span>Populære kategorier</span>
            </div>
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
                <Card key={i} className="animate-pulse border-0 shadow-md">
                  <CardHeader className="pb-4">
                    <div className="h-6 bg-muted rounded-lg w-3/4 mb-3"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(0, 6).map((category, index) => (
                <Card key={category.id} className="card-hover border-0 shadow-md bg-card group cursor-pointer animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between text-foreground group-hover:text-primary transition-colors duration-200">
                      <span>{category.name}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                    </CardTitle>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Resources Section */}
      <section className="py-20 bg-card">
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
              <Card key={resource.id} className="card-hover border-0 shadow-md bg-card group animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <CardHeader className="pb-4">
                  <CardTitle className="line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">
                    {resource.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 text-muted-foreground leading-relaxed">
                    {resource.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {resource.category?.name}
                    </span>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      <span>{resource.votes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

      {/* Modern CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,.05)_75%)] bg-[length:20px_20px]"></div>
        
        <div className="relative container mx-auto px-4 lg:px-6 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-display-md font-bold mb-6">
              Klar til at komme i gang?
            </h2>
            <p className="text-xl text-primary-100 mb-12 leading-relaxed">
              Bliv en del af Danmarks mest hjælpsomme far-fællesskab. Del dine erfaringer og lær af andre.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg" variant="secondary" className="bg-white text-primary-700 hover:bg-primary-50 shadow-lg hover:shadow-xl">
                <Link to="/submit">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Del din første ressource
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                <Link to="/categories">
                  Udforsk kategorier
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}