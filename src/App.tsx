import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './app/AppLayout'
import { NotFoundPage } from './app/NotFoundPage'
import { CallbackPage } from './features/auth/CallbackPage'
import { LoggedOutPage } from './features/auth/LoggedOutPage'
import { RequireRole } from './features/auth/RequireRole'
import { AuctionDetailPage } from './features/auctions/AuctionDetailPage'
import { AuctionsPage } from './features/auctions/AuctionsPage'
import { CreateAuctionPage } from './features/auctions/CreateAuctionPage'
import { ListingDetailPage } from './features/listings/ListingDetailPage'
import { ListingsPage } from './features/listings/ListingsPage'
import { NewListingPage } from './features/listings/NewListingPage'
import { SellerDashboardPage } from './features/seller/SellerDashboardPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="callback" element={<CallbackPage />} />
        <Route path="logged-out" element={<LoggedOutPage />} />
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
          <Route
            path="listings/:id/auctions/new"
            element={
              <RequireRole role="SELLER">
                <CreateAuctionPage />
              </RequireRole>
            }
          />
          <Route path="auctions" element={<AuctionsPage />} />
          <Route path="auctions/:id" element={<AuctionDetailPage />} />
          <Route
            path="seller"
            element={
              <RequireRole role="SELLER">
                <SellerDashboardPage />
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
