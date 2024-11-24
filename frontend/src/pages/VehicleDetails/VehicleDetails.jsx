import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './VehicleDetails.css'

const VehicleDetails = () => {
  const [vehicle, setVehicle] = useState(null)
  const [error, setError] = useState(null)
  const { vehicleId } = useParams()

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        console.log('Fetching details for VIN:', vehicleId)
        
        const response = await fetch(`http://localhost:8081/vehicle_details/get-vehicle-details/${vehicleId}`, {
          credentials: 'include',
        })
  
        if (!response.ok) {
          const errorText = await response.text()
          console.log('Error response:', errorText)
          throw new Error(`Vehicle not found (Status: ${response.status})`)
        }
  
        const data = await response.json()
        console.log('Received vehicle data:', data)
        setVehicle(data)
      } catch (err) {
        console.error('Error fetching vehicle details:', err)
        setError(err.message)
      }
    }
  
    fetchVehicleDetails()
  }, [vehicleId]) // dependency array only includes vehicleId

  if (error) return <div className="error-message">{error}</div>
  if (!vehicle) return <div className="loading">Loading...</div>

  return (
    <div className="vehicle-details-container">
      <div className="vehicle-info">
        <h2>Vehicle Details</h2>
        <div className="details-list">
          <div className="detail-item">
            <span className="label">VIN:</span>
            <span className="value">{vehicle.vin}</span>
          </div>
          <div className="detail-item">
            <span className="label">Type:</span>
            <span className="value">{vehicle.vehicle_type}</span>
          </div>
          <div className="detail-item">
            <span className="label">Manufacturer:</span>
            <span className="value">{vehicle.manufacturer}</span>
          </div>
          <div className="detail-item">
            <span className="label">Model:</span>
            <span className="value">{vehicle.model_name}</span>
          </div>
          <div className="detail-item">
            <span className="label">Year:</span>
            <span className="value">{vehicle.model_year}</span>
          </div>
          <div className="detail-item">
            <span className="label">Fuel Type:</span>
            <span className="value">{vehicle.fuel_type}</span>
          </div>
          <div className="detail-item">
            <span className="label">Color:</span>
            <span className="value">{vehicle.color_name}</span>
          </div>
          <div className="detail-item">
            <span className="label">Horsepower:</span>
            <span className="value">{vehicle.horsepower}</span>
          </div>
          <div className="detail-item">
            <span className="label">Sale Status:</span>
            <span className="value">{vehicle.sale_status}</span>
          </div>
          <div className="detail-item">
            <span className="label">Description:</span>
            <span className="value">{vehicle.description}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VehicleDetails
