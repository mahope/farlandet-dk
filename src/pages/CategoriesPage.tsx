import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { useCategories } from '../hooks/useCategories'
import { LoadingSpinner } from '../components/ui/loading-spinner'

export function CategoriesPage() {
  const { categories, loading, error } = useCategories()

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Kategorier</h1>
          <p className="text-muted-foreground mb-4">
            Der opstod en fejl ved indlæsning af kategorier.
          </p>
          <Button onClick={() => window.location.reload()}>
            Prøv igen
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Kategorier</h1>
        <p className="text-muted-foreground">
          Udforsk ressourcer organiseret efter kategori. Klik på en kategori for at se alle ressourcer i den kategori.
        </p>
      </div>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <Link key={category.id} to={`/resources?category=${category.id}`}>
              <div className="p-6 border rounded-lg hover:shadow-md transition-all duration-200 hover:border-primary/50">
                <div className="flex items-center mb-3">
                  <div className="w-4 h-4 rounded-full mr-3 bg-blue-500" />
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                </div>
                
                {category.description && (
                  <p className="text-muted-foreground text-sm mb-4">
                    {category.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    0 ressourcer
                  </span>
                  <Button variant="ghost" size="sm">
                    Se alle →
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Ingen kategorier fundet</h2>
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

      {/* Back to Resources */}
      <div className="mt-12 text-center">
        <Button variant="outline" asChild>
          <Link to="/resources">
            ← Tilbage til alle ressourcer
          </Link>
        </Button>
      </div>
    </div>
  )
}