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

/** Set after you add an asset: `import logo from '@/assets/...'` then assign here. */
const BRAND_LOGO_SRC = ''

/** Optional hero image under the form (e.g. showroom photo). */
const LOGIN_BOTTOM_IMAGE_SRC = ''

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse e-mail est requise")
    .email('Veuillez entrer une adresse e-mail valide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caracteres'),
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
            <LuCar className="flex-shrink-0" size={28} style={{ color: '#2e0854' }} aria-hidden />
            {BRAND_LOGO_SRC ? (
              <img src={BRAND_LOGO_SRC} alt={appName} style={{ height: 28 }} />
            ) : (
              <span className="mocaz-signin-brand-text">{appName}</span>
            )}
          </div>
        </header>

        <p className="mocaz-signin-eyebrow text-center mb-2">Automotive systems</p>
        <h1 className="mocaz-signin-headline text-center mb-4">Precision curation</h1>

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
                  Email address
                </label>
                <FormControl
                  type="email"
                  id="userEmail"
                  placeholder="curator@mocaz.com"
                  className="mocaz-signin-input"
                  isInvalid={!!errors.email}
                  {...register('email')}
                />
                {errors.email && <small className="text-danger d-block mt-1">{errors.email.message}</small>}
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                  <label htmlFor="userPassword" className="mocaz-signin-label mb-0">
                    Password
                  </label>
                  <Link to="/auth-2/reset-pass" className="mocaz-signin-link">
                    Forgot password?
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
                  Keep me signed in
                </label>
              </div>
              <div className="d-grid">
                <button type="submit" className="mocaz-signin-submit d-flex align-items-center justify-content-center gap-2" disabled={isSubmitting || mutation.isPending}>
                  {isSubmitting || mutation.isPending ? 'Signing in…' : 'Sign in'}
                  <LuArrowRight size={18} aria-hidden />
                </button>
              </div>
            </form>
            <div className="text-center mt-4 pt-1">
              <p className="mocaz-signin-label mb-1" style={{ letterSpacing: '0.1em' }}>
                Don&apos;t have an account?
              </p>
              <a href="mailto:support@m-occaz.ma" className="fw-bold text-dark text-uppercase small text-decoration-none" style={{ letterSpacing: '0.08em' }}>
                Contact admin
              </a>
            </div>
          </CardBody>
        </Card>

        <div className="mocaz-signin-hero mb-3">
          {LOGIN_BOTTOM_IMAGE_SRC ? (
            <img src={LOGIN_BOTTOM_IMAGE_SRC} alt="" />
          ) : (
            <div className="mocaz-signin-hero-placeholder">Set LOGIN_BOTTOM_IMAGE_SRC in sign-in/index.tsx</div>
          )}
        </div>

        <footer className="mt-auto text-center pb-2">
          <p className="mocaz-signin-footer-muted mb-2">
            © {currentYear} {appName} automotive systems. Precision curation.
          </p>
          <div className="mocaz-signin-footer-links d-flex flex-wrap justify-content-center gap-3">
            <a href="#">Privacy policy</a>
            <a href="#">Terms of service</a>
            <a href="mailto:support@m-occaz.ma">Support</a>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Index
