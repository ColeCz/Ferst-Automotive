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
          <select
            name="vehicleType"
            value={searchParams.vehicleType}
            onChange={handleInputChange}
          >
            <option value="">Select Vehicle Type</option>
            <option value="Convertible">Convertible</option>
            <option value="Coupe">Coupe</option>
            <option value="CUV">CUV</option>
            <option value="Minivan">Minivan</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
          </select>
          <select
            name="manufacturer"
            value={searchParams.manufacturer}
            onChange={handleInputChange}
          >
            <option value="">Select Manufacturer</option>
            <option value="Acura">Acura</option>
            <option value="Alfa Romeo">Alfa Romeo</option>
            <option value="Aston Martin">Aston Martin</option>
            <option value="Audi">Audi</option>
            <option value="Bentley">Bentley</option>
            <option value="BMW">BMW</option>
            <option value="Buick">Buick</option>
            <option value="Cadillac">Cadillac</option>
            <option value="Chevrolet">Chevrolet</option>
            <option value="Chrysler">Chrysler</option>
            <option value="Dodge">Dodge</option>
            <option value="Ferrari">Ferrari</option>
            <option value="FIAT">FIAT</option>
            <option value="Ford">Ford</option>
            <option value="Geeley">Geeley</option>
            <option value="GMC">GMC</option>
            <option value="Honda">Honda</option>
            <option value="Hyundai">Hyundai</option>
            <option value="INFINITI">INFINITI</option>
            <option value="Jaguar">Jaguar</option>
            <option value="Jeep">Jeep</option>
            <option value="Karma">Karma</option>
            <option value="Kia">Kia</option>
            <option value="Lamborghini">Lamborghini</option>
            <option value="Land Rover">Land Rover</option>
            <option value="Lexus">Lexus</option>
            <option value="Lincoln">Lincoln</option>
            <option value="Lotus">Lotus</option>
            <option value="Maserati">Maserati</option>
            <option value="MAZDA">MAZDA</option>
            <option value="McLaren">McLaren</option>
            <option value="Mercedes-Benz">Mercedes-Benz</option>
            <option value="MINI">MINI</option>
            <option value="Mitsubishi">Mitsubishi</option>
            <option value="Nio">Nio</option>
            <option value="Nissan">Nissan</option>
            <option value="Porsche">Porsche</option>
            <option value="Ram">Ram</option>
            <option value="Rivian">Rivian</option>
            <option value="smart">smart</option>
            <option value="Subaru">Subaru</option>
            <option value="Tesla">Tesla</option>
            <option value="Toyota">Toyota</option>
            <option value="Volkswagen">Volkswagen</option>
            <option value="Volvo">Volvo</option>
            <option value="XPeng">XPeng</option>
          </select>
          <select
            name="year"
            value={searchParams.year}
            onChange={handleInputChange}
          >
            <option value="">Select Year</option>
            <option value="2002">2002</option>
            <option value="2003">2003</option>
            <option value="2004">2004</option>
            <option value="2005">2005</option>
            <option value="2006">2006</option>
            <option value="2007">2007</option>
            <option value="2008">2008</option>
            <option value="2009">2009</option>
            <option value="2010">2010</option>
            <option value="2011">2011</option>
            <option value="2012">2012</option>
            <option value="2013">2013</option>
            <option value="2014">2014</option>
            <option value="2015">2015</option>
            <option value="2019">2019</option>
            <option value="2020">2020</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
          </select>
          <input
            type="text"
            name="vin"
            placeholder="VIN"
            value={searchParams.vin}
            onChange={handleInputChange}
          />
          <select
            name="fuelType"
            value={searchParams.fuelType}
            onChange={handleInputChange}
          >
            <option value="">Select Fuel Type</option>
            <option value="Battery">Battery</option>
            <option value="Diesel">Diesel</option>
            <option value="Fuel Cell">Fuel Cell</option>
            <option value="Gas">Gas</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Natural Gas">Natural Gas</option>
            <option value="Plugin Hybrid">Plugin Hybrid</option>
          </select>
          <select
            name="color"
            value={searchParams.color}
            onChange={handleInputChange}
          >
            <option value="">Select Color</option>
            <option value="Aluminum">Aluminum</option>
            <option value="Beige">Beige</option>
            <option value="Black">Black</option>
            <option value="Blue">Blue</option>
            <option value="Bronze">Bronze</option>
            <option value="Brown">Brown</option>
            <option value="Claret">Claret</option>
            <option value="Copper">Copper</option>
            <option value="Cream">Cream</option>
            <option value="Gold">Gold</option>
            <option value="Gray">Gray</option>
            <option value="Green">Green</option>
            <option value="Maroon">Maroon</option>
            <option value="Metallic">Metallic</option>
            <option value="Navy">Navy</option>
            <option value="Orange">Orange</option>
            <option value="Pink">Pink</option>
            <option value="Purple">Purple</option>
            <option value="Red">Red</option>
            <option value="Rose">Rose</option>
            <option value="Rust">Rust</option>
            <option value="Silver">Silver</option>
            <option value="Tan">Tan</option>
            <option value="Turquoise">Turquoise</option>
            <option value="White">White</option>
            <option value="Yellow">Yellow</option>
          </select>
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
