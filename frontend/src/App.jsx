// This file does nothing but define the frontend's routes.
// In each component imported below, starting with HomePage and ending with VehicleForm, we'll use the 'useNavigate()' hook to handle navigation between pages.
// ProtectedRoute is a custom component in its own folder that restricts user page access by roles.

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import components
import HomePage from './components/HomePage/HomePage';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute'
import Reports from './components/Reports/Reports';
import VehicleDetails from './components/VehicleDetails/VehicleDetails';
import { SearchCustomer as SellVehicleSearch } from './components/SellVehicle/SearchCustomer';
import ConfirmSale from './components/SellVehicle/ConfirmSale';
import SearchVendor from './components/AddPart/SearchVendor';
import NewPart from './components/AddPart/NewPart';
import { SearchCustomer as AddVehicleSearch } from './components/AddVehicle/SearchCustomer';
import VehicleForm from './components/AddVehicle/VehicleForm';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main routes */}
        <Route path="/" element={<HomePage />} />

        <Route 
          path="/reports" 
          element={<ProtectedRoute element={Reports} requiredRole="manager" />} 
        />
        <Route path="/details/:vehicleId" element={<VehicleDetails />} />
        
        {/* Sell vehicle flow */}
        <Route path="/sell-vehicle-search-customer" element={<SellVehicleSearch />} />
        <Route path="/sell-car-confirm" element={<ConfirmSale />} />
        
        {/* Add part flow */}
        <Route path="/add-part-search-vendor" element={<SearchVendor />} />
        <Route path="/add-part-new-part" element={<NewPart />} />
        
        {/* Add vehicle flow */}
        <Route path="/add-vehicle-search-customer" element={<AddVehicleSearch />} />
        <Route path="/add-vehicle-form" element={<VehicleForm />} />
      </Routes>
    </Router>
  );
}

export default App;