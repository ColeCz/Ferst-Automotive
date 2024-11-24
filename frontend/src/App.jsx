// This file does nothing but define the frontend's routes.
// In each component imported below, starting with HomePage and ending with VehicleForm, we'll use the 'useNavigate()' hook to handle navigation between pages.
// ProtectedRoute is a custom component in its own folder that restricts user page access by roles.

import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom'

// Components:
import Login from './components/common/Login/Login'
import HomePage from './pages/HomePage/HomePage'
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute'
import Header from './components/common/Header/Header'
// Pages:
import Reports from './pages/Reports/Reports'
import VehicleDetails from './pages/VehicleDetails/VehicleDetails'
import SellVehicleSearchCustomer from './pages/SellVehicle/SellVehicleSearchCustomer'
import ConfirmSale from './pages/SellVehicle/ConfirmSale'
import SearchVendor from './pages/AddPart/SearchVendor'
import NewPart from './pages/AddPart/NewPart'
import AddVehicleSearchCustomer from './pages/AddVehicle/AddVehicleSearchCustomer'
import VehicleForm from './pages/AddVehicle/VehicleForm'

// To stop Header.jsx from rendering on '/login' page
const HeaderWrapper = () => {
  const location = useLocation()
  return location.pathname === '/login' ? null : <Header />
}

function App() {
  return (
    <Router>
      <div>
        <HeaderWrapper />
        <Routes>
          <Route path="/login" element={<Login />}></Route>
          {/* Main routes */}
          <Route path="/" element={<HomePage />} />
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredRole="manager">
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route path="/details/:vehicleId" element={<VehicleDetails />} />

          {/* Sell vehicle flow */}
          <Route
            path="/sell-vehicle-search-customer"
            element={<SellVehicleSearchCustomer />}
          />
          <Route path="/sell-car-confirm" element={<ConfirmSale />} />

          {/* Add part flow */}
          <Route path="/add-part-search-vendor" element={<SearchVendor />} />
          <Route path="/add-part-new-part" element={<NewPart />} />

          {/* Add vehicle flow */}
          <Route
            path="/add-vehicle-search-for-customer"
            element={
              <ProtectedRoute requiredRole="clerk">
                <AddVehicleSearchCustomer />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/add-vehicle-new"  // Changed from "/add-vehicle-form"
            element={
              <ProtectedRoute requiredRole="clerk">
                <VehicleForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
