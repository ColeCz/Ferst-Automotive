// This file does nothing but define the frontend's routes.
// In each component imported below, starting with HomePage and ending with VehicleForm, we'll use the 'useNavigate()' hook to handle navigation between pages.
// ProtectedRoute is a custom component in its own folder that restricts user page access by roles.

import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// If confused about some component/page names, try looking at paths:
// Ex: To sell a vehicle, we must first search a customer.
import Login from './components/common/Login/Login'
import HomePage from './pages/HomePage/HomePage'
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute'
import Reports from './pages/Reports/Reports'
import VehicleDetails from './pages/VehicleDetails/VehicleDetails'
import SellVehicleSearchCustomer from './pages/SellVehicle/SellVehicleSearchCustomer'
import ConfirmSale from './pages/SellVehicle/ConfirmSale'
import SearchVendor from './pages/AddPart/SearchVendor'
import NewPart from './pages/AddPart/NewPart'
import AddVehicleSearchCustomer from './pages/AddVehicle/AddVehicleSearchCustomer'
import VehicleForm from './pages/AddVehicle/VehicleForm'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<Login />}></Route>
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
        <Route path="/add-vehicle-form" element={<VehicleForm />} />
      </Routes>
    </Router>
  )
}

export default App
