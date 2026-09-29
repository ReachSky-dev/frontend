import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './app/AppLayout'
import { NotFoundPage } from './app/NotFoundPage'
import { CallbackPage } from './features/auth/CallbackPage'
import { RequireRole } from './features/auth/RequireRole'
import { ListingDetailPage } from './features/listings/ListingDetailPage'
import { ListingsPage } from './features/listings/ListingsPage'
import { NewListingPage } from './features/listings/NewListingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="callback" element={<CallbackPage />} />
        <Route element={<AppLayout />}>
          <Route index element={<ListingsPage />} />
          <Route path="listings/:id" element={<ListingDetailPage />} />
          <Route
            path="listings/new"
            element={
              <RequireRole role="SELLER">
                <NewListingPage />
              </RequireRole>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
