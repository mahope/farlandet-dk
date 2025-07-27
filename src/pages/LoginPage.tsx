import { useSEO } from '../hooks/useSEO'
import { AuthModal } from '../components/auth/AuthModal'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const navigate = useNavigate()

  useSEO({
    title: 'Log ind - Farlandet.dk',
    description: 'Log ind på Farlandet.dk for at få adgang til alle funktioner og bidrage til fællesskabet af danske fædre.'
  })

  const handleSuccess = () => {
    // Redirect to homepage after successful login
    navigate('/')
  }

  const handleClose = () => {
    // Go back to previous page if user cancels
    navigate(-1)
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        <AuthModal
          onSuccess={handleSuccess}
          onClose={handleClose}
        />
      </div>
    </div>
  )
}