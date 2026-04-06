import { appName, currentYear } from '@/helpers'
import { Link, useNavigate } from 'react-router'
import { Alert, Card, CardBody, FormControl } from 'react-bootstrap'
import { LuArrowRight, LuCar } from 'react-icons/lu'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { login } from '@/services/auth'
import { useAuth } from '@/context/AuthProvider'
import logo from '@/assets/images/logo_moccaz.png'
import login_image from '@/assets/images/login_image.jpg'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse e-mail est requise")
    .email('Veuillez entrer une adresse e-mail valide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

const Index = () => {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: true,
    },
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setUser(data.user)
      navigate('/dashboard')
    },
    onError: (error: any) => {
      setApiError(error.response?.data?.message || error.message || "Une erreur s'est produite lors de la connexion")
    },
  })

  const onSubmit = (data: LoginFormData) => {
    setApiError('')
    mutation.mutate({ email: data.email, password: data.password })
  }

  return (
    <div className="mocaz-signin-page d-flex flex-column">
      <div className="mocaz-signin-inner flex-grow-1 d-flex flex-column px-3 py-4 py-md-5">
        <header className="mb-3">
          <div className="mocaz-signin-brand-row">
            {/* <LuCar className="flex-shrink-0" size={28} style={{ color: '#2e0854' }} aria-hidden /> */}
            <img src={logo} alt="Logo" style={{ height: 28 }} />
          </div>
        </header>

        <p className="mocaz-signin-eyebrow text-center mb-2">m-automotiv systèmes</p>

        <Card className="mocaz-signin-card border-0 mb-4">
          <CardBody>
            {apiError && (
              <Alert variant="danger" className="py-2 mb-3 small">
                {apiError}
              </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label htmlFor="userEmail" className="mocaz-signin-label d-block mb-2">
                  Adresse e-mail
                </label>
                <FormControl
                  type="email"
                  id="userEmail"
                  placeholder="exemple@m-occaz.ma"
                  className="mocaz-signin-input"
                  isInvalid={!!errors.email}
                  {...register('email')}
                />
                {errors.email && <small className="text-danger d-block mt-1">{errors.email.message}</small>}
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                  <label htmlFor="userPassword" className="mocaz-signin-label mb-0">
                    Mot de passe
                  </label>
                  <Link to="/auth-2/reset-pass" className="mocaz-signin-link">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <FormControl
                  type="password"
                  id="userPassword"
                  placeholder="••••••••"
                  className="mocaz-signin-input"
                  isInvalid={!!errors.password}
                  {...register('password')}
                />
                {errors.password && <small className="text-danger d-block mt-1">{errors.password.message}</small>}
              </div>
              <div className="form-check mb-4">
                <input className="form-check-input" type="checkbox" id="rememberMe" {...register('rememberMe')} />
                <label className="form-check-label small text-secondary" htmlFor="rememberMe">
                  Rester connecté
                </label>
              </div>
              <div className="d-grid">
                <button type="submit" className="mocaz-signin-submit d-flex align-items-center justify-content-center gap-2" disabled={isSubmitting || mutation.isPending}>
                  {isSubmitting || mutation.isPending ? 'Connexion…' : 'Se connecter'}
                  <LuArrowRight size={18} aria-hidden />
                </button>
              </div>
            </form>
            <div className="text-center mt-4 pt-1">
              <p className="mocaz-signin-label mb-1" style={{ letterSpacing: '0.1em' }}>
                Pas encore de compte ?
              </p>
              <a href="mailto:support@m-occaz.ma" className="fw-bold text-dark text-uppercase small text-decoration-none" style={{ letterSpacing: '0.08em' }}>
                Contacter l&apos;administrateur
              </a>
            </div>
          </CardBody>
        </Card>

      
        <footer className="mt-auto text-center pb-2">
          <p className="mocaz-signin-footer-muted mb-2">
            © {currentYear} {appName} — systèmes automobiles. Curation précise.
          </p>
          <div className="mocaz-signin-footer-links d-flex flex-wrap justify-content-center gap-3">
            <a href="#">Politique de confidentialité</a>
            <a href="#">Conditions d&apos;utilisation</a>
            <a href="mailto:support@m-occaz.ma">Assistance</a>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Index
