import { useState } from 'react'

interface UseNotificationModalReturn {
  error: {
    isOpen: boolean
    message: string | null
    show: (msg: string) => void
    hide: () => void
  }
  success: {
    isOpen: boolean
    message: string | null
    show: (msg: string) => void
    hide: () => void
  }
}

/**
 * Custom hook for managing error and success modals
 * @returns Object with error and success modal state and control functions
 *
 * @example
 * const { error, success } = useNotificationModal()
 *
 * // Show error
 * error.show('Une erreur est survenue')
 *
 * // Show success
 * success.show('Opération réussie!')
 */
export const useNotificationModal = (): UseNotificationModalReturn => {
  const [errorOpen, setErrorOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [successOpen, setSuccessOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const showError = (msg: string) => {
    setErrorMessage(msg)
    setErrorOpen(true)
  }

  const hideError = () => {
    setErrorOpen(false)
    setErrorMessage(null)
  }

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
    setSuccessOpen(true)
  }

  const hideSuccess = () => {
    setSuccessOpen(false)
    setSuccessMessage(null)
  }

  return {
    error: {
      isOpen: errorOpen,
      message: errorMessage,
      show: showError,
      hide: hideError,
    },
    success: {
      isOpen: successOpen,
      message: successMessage,
      show: showSuccess,
      hide: hideSuccess,
    },
  }
}
