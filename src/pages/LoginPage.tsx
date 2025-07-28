import { useSEO } from '../hooks/useSEO'

export function LoginPage() {
  useSEO({
    title: 'Login - Farlandet.dk',
    description: 'Log ind på Farlandet.dk for at bidrage til fædrefællesskabet.',
    keywords: ['login', 'log ind', 'admin'],
    url: 'https://farlandet.dk/login',
    type: 'website'
  })

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Admin Login
        </h1>
        <p className="text-lg text-muted-foreground">
          Kun for administratorer og moderatorer
        </p>
      </div>

      {/* Migration notice */}
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-yellow-800">⚠️ Under Migration</h2>
        <p className="text-yellow-700 mb-4">
          Login funktionaliteten er midlertidigt utilgængelig mens vi migrerer til PocketBase.
        </p>
        <p className="text-yellow-700">
          Admin funktioner kommer snart tilbage!
        </p>
      </div>

      {/* Info */}
      <div className="bg-card p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Information</h2>
        <p className="text-muted-foreground mb-4">
          Almindelige brugere behøver ikke længere at logge ind for at browse ressourcer.
        </p>
        <p className="text-muted-foreground">
          Kun administratorer og moderatorer har brug for login for at administrere indhold.
        </p>
      </div>

      <div className="text-center mt-6">
        <a href="/" className="text-primary hover:underline">
          Gå til Forsiden
        </a>
      </div>
    </div>
  )
}