import { useRoutes } from 'react-router'
import { routes } from '@/routes'

/**
 * Global chrome and palette: `LayoutProvider` defaults (`useLayoutContext`) +
 * `src/assets/scss` (MOCAZ / M-occaz brand).
 */
function App() {
  return useRoutes(routes)
}

export default App
