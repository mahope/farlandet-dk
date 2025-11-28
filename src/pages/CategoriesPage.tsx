import { Link } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCategories } from '../hooks/useCategories'
import { Loader2, FolderOpen, ArrowRight } from 'lucide-react'

export function CategoriesPage() {
  const { categories, loading, error } = useCategories()

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-display-md mb-4">Kategorier</h1>
            <p className="text-muted-foreground mb-6">
              Der opstod en fejl ved indlæsning af kategorier.
            </p>
            <Button onClick={() => window.location.reload()}>
              Prøv igen
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display-md mb-2">Kategorier</h1>
          <p className="text-muted-foreground text-lg">
            Udforsk ressourcer organiseret efter kategori
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(category => (
              <Link key={category.id} to={`/resources?category=${category.slug}`}>
                <Card className="h-full card-hover border-2 hover:border-primary/30 group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <FolderOpen
                          className="w-6 h-6"
                          style={{ color: category.color }}
                        />
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs"
                      >
                        {category.resource_count || 0} ressourcer
                      </Badge>
                    </div>

                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    <div className="flex items-center text-sm text-primary font-medium">
                      <span>Se ressourcer</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <FolderOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Ingen kategorier fundet</h2>
            <p className="text-muted-foreground mb-6">
              Der er endnu ikke oprettet nogen kategorier.
            </p>
            <Button asChild>
              <Link to="/submit">
                Bidrag med den første ressource
              </Link>
            </Button>
          </div>
        )}

        {/* Browse All Resources */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link to="/resources">
              Se alle ressourcer
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  )
}