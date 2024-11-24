import React, { useState, useEffect, useCallback } from 'react'
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
  const [searchResults, setSearchResults] = useState([])

  // later on, need to wrap this in useCallback()
  const performSearch = useCallback(async () => {
    console.log('performSearch called with filterSelection:', filterSelection)
    try {
      const queryParams = new URLSearchParams({
        ...searchParams,
        search_filter: filterSelection
      }).toString()
        
      console.log('Making API call with queryParams:', queryParams)
      const response = await fetch(`http://localhost:8081/vehicle/?${queryParams}`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      console.log('Received search results:', data)
      setSearchResults(data.matching_vehicles || [])
    } catch (error) {
      console.error('Error performing search:', error)
      setSearchResults([])
    }
  }, [searchParams, filterSelection])

  useEffect(() => {
    fetchMetrics() // defined below
    fetchSession() // defined below
  }, [])

  // this useEffect exists to handle filter changes. performSEarch is memoized & only recreated when searchParams or filterSelection changes
  useEffect(() => {
    console.log('Filter changed, performing search...')
    performSearch()
  }, [filterSelection, performSearch])

  // purely for bug testing
  useEffect(() => {
    console.log('userRoles changed:', userRoles)
  }, [userRoles])

  // fetch metrics for the top-left two widgets
  const fetchMetrics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8081/vehicle/')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()

      console.log('Raw metrics data:', data)
      console.log('Pending parts data:', data.vehicles_awaiting_parts_count)

      // extract nums from the nested arrays returned by the API
      const availableCount = data.available_vehicles_count?.[0]?.[0] || 0
      const pendingCount = Array.isArray(data.vehicles_awaiting_parts_count) 
          ? data.vehicles_awaiting_parts_count[0][0]
          : data.vehicles_awaiting_parts_count || 0

      console.log('Processed counts:', { availableCount, pendingCount })

      setMetrics({
        availableVehicles: availableCount, // 217
        pendingParts: pendingCount, // 83
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
      console.log('Fetching session...')
      const response = await fetch('http://localhost:8081/auth/session', {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch session')
      }
      const data = await response.json()
      console.log('Session response:', data)

      if (data.roles) {
        console.log('Setting user roles to:', data.roles)
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
    performSearch()
  }

  const handleAddVehicle = () => {
    // Log the current state when button is clicked
    console.log('Current userRoles when clicking:', userRoles)

    if (userRoles?.clerk) {
      // Added optional chaining for safety
      navigate('/add-vehicle-search-for-customer')
    } else {
      console.log('Not a clerk, roles:', userRoles)
    }
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
                <h3>Vehicles with Pending Parts</h3>
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
                    onChange={(e) => {
                      console.log('Filter changed to:', e.target.value)
                      setFilterSelection(e.target.value)
                    }}
                  />
                  All Vehicles
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="filter"
                    value="sold"
                    checked={filterSelection === 'sold'}
                    // the below changes filterSelection to "sold", and because filterSeleciton is in the dependency array of performSearch in the useEffect, performSearch is recreated with the new filter value. performSearch itself is also in the dependency array of a separate useEffect, so the effect runs again, re-calling performSearch, and query re-runs.
                    onChange={(e) => {
                      console.log('Filter changed to:', e.target.value)
                      setFilterSelection(e.target.value)
                    }}
                  />
                  Sold Vehicles
                </label>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="filter"
                    value="unsold"
                    checked={filterSelection === 'unsold'}
                    onChange={(e) => {
                      console.log('Filter changed to:', e.target.value)
                      setFilterSelection(e.target.value)
                    }}
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
      <div className="search-results">
  <table className="vehicles-table">
    <thead>
      <tr>
        <th>VIN</th>
        <th>Vehicle Type</th>
        <th>Year</th>
        <th>Manufacturer</th>
        <th>Fuel Type</th>
        <th>Color</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {searchResults.map((vehicle, index) => (
        <tr key={index}>
          <td>{vehicle[0]}</td>
          <td>{vehicle[1]}</td>
          <td>{vehicle[2]}</td>
          <td>{vehicle[3]}</td>
          <td>{vehicle[4]}</td>
          <td>{vehicle[5]}</td>
          <td>{vehicle[6]}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </div>
  )
}

export default HomePage
