/**
 * Format API error response for display in forms
 */
export const formatApiErrors = (error: any): Record<string, string> => {
    const response = error.response?.data
    
    // If backend already provided formatted errors object
    if (response?.errors && typeof response.errors === 'object') {
        return response.errors
    }
    
    // Fallback to message if no errors object
    if (response?.message) {
        return { submit: response.message }
    }
    
    // Default error message
    return { submit: 'Une erreur est survenue. Veuillez réessayer.' }
}

/**
 * Display error message for a specific field
 */
export const getFieldError = (errors: Record<string, string>, fieldName: string): string | null => {
    return errors[fieldName] || null
}

/**
 * Check if field has error
 */
export const hasFieldError = (errors: Record<string, string>, fieldName: string): boolean => {
    return !!errors[fieldName]
}

/**
 * Get all error messages as array
 */
export const getAllErrors = (errors: Record<string, string>): string[] => {
    return Object.values(errors).filter(error => error && error !== 'submit')
}
