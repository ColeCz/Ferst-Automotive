import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/common/Header/Header'
import ProtectedElement from '../../components/common/ProtectedElement/ProtectedElement'
import './HomePage.css'

const HomePage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useState({
    vehicleType: '',
    manufacturer: '',
    year: '',
    vin: '',
    fuelType: '',
    color: '',
    keyword: '',
    filter: 'all',
  })
  const [metrics, setMetrics] = useState({
    availableVehicles: 0,
    pendingParts: 0,
  })
  const [isLoading, setIsLoading] = useState(true) // only visible if reloading browser really quickly
  const [filterSelection, setFilterSelection] = useState('all') // defaults search filter to 'all'
  const [userRoles, setUserRoles] = useState({
    clerk: false,
    salesperson: false,
    manager: false,
  })

  useEffect(() => {
    fetchMetrics() // defined below
    fetchSession() // defined below
  }, [])


/**
 * 
 * 
 * 
 * Below, fetchMetrics, is the problematic code:
 * 
 * 
 * 
 */


  // fetch metrics for the top-left two widgets
  const fetchMetrics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8081/vehicle/')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()

      console.log('Full response data:', data)
      console.log('Parts count raw value:', data.vehicles_awaiting_parts_count)

      // extract nums from the nested arrays returned by the API
      const availableCount = data.available_vehicles_count?.[0]?.[0] || 0
      const pendingCount = data.vehicles_awaiting_parts_count ? 
                        data.vehicles_awaiting_parts_count[0][0] : 0


      setMetrics({
        availableVehicles: availableCount,  // 217
        pendingParts: pendingCount,         // 83
      })
    } catch (error) {
      console.error('Error fetching metrics:', error)
      // set default values if err
      setMetrics({
        availableVehicles: 0,
        pendingParts: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSession = async () => {
    // fetches user role from session info
    try {
      const response = await fetch('http://localhost:8081/auth/session')
      if (!response.ok) {
        throw new Error('Failed to fetch session')
      }
      const data = await response.json()
      if (data.roles) {
        setUserRoles(data.roles)
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSearch = () => {
    const searchParamsWithFilter = {
      ...searchParams,
      filter: filterSelection,
    }
    console.log('Searching with params:', searchParams)

    // Implement search functionality w/ filter
  }

  

  const handleAddVehicle = () => {
    navigate('/add-vehicle-search-for-customer')
  }

  const handleViewReports = () => {
    navigate('/reports')
  }

  return (
    <div className="homepage">
      {/* <Header /> */}
      <div className="header">
        <div className="metrics">
          <div className="metric-box">
            <h3>Available Vehicles</h3>
            <span className="metric-value">
              {isLoading ? 'Loading...' : metrics.availableVehicles}
            </span>
          </div>
          <ProtectedElement
            element={
              <div className="metric-box">
                <h3>Pending Parts</h3>
                <span className="metric-value">
                  {isLoading ? 'Loading...' : metrics.pendingParts}
                </span>
              </div>
            }
            requiredRole={['clerk', 'manager']}
          />
        </div>

        <div className="search-grid">
          <input
            type="text"
            name="vehicleType"
            placeholder="Vehicle Type"
            value={searchParams.vehicleType}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="manufacturer"
            placeholder="Manufacturer"
            value={searchParams.manufacturer}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="year"
            placeholder="Year"
            value={searchParams.year}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="vin"
            placeholder="VIN"
            value={searchParams.vin}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="fuelType"
            placeholder="Fuel Type"
            value={searchParams.fuelType}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="color"
            placeholder="Color"
            value={searchParams.color}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="keyword"
            placeholder="Keyword"
            value={searchParams.keyword}
            onChange={handleInputChange}
          />
          <button className="search-button" onClick={handleSearch}>
            SEARCH
          </button>
        </div>
      </div>

      <div className="action-buttons">
      <ProtectedElement
  element={
    <div className="filter-section">
      <h3 className="filter-heading">Filter Search Results By:</h3>
      <div className="filter-radio-group">
        <label className="filter-option">
          <input
            type="radio"
            name="filter"
            value="all"
            checked={filterSelection === 'all'}
            onChange={(e) => setFilterSelection(e.target.value)}
          />
          All Vehicles
        </label>
        <label className="filter-option">
          <input
            type="radio"
            name="filter"
            value="sold"
            checked={filterSelection === 'sold'}
            onChange={(e) => setFilterSelection(e.target.value)}
          />
          Sold Vehicles
        </label>
        <label className="filter-option">
          <input
            type="radio"
            name="filter"
            value="unsold"
            checked={filterSelection === 'unsold'}
            onChange={(e) => setFilterSelection(e.target.value)}
          />
          Unsold Vehicles
        </label>
      </div>
    </div>
  }
  requiredRole="manager"
        />

        <ProtectedElement
          element={
            <button className="add-vehicle" onClick={handleAddVehicle}>
              Add Vehicle
            </button>
          }
          requiredRole="clerk"
        />

        <ProtectedElement
          element={
            <button className="view-reports" onClick={handleViewReports}>
              View Reports
            </button>
          }
          requiredRole="manager"
        />
      </div>
    </div>
  )
}

export default HomePage
