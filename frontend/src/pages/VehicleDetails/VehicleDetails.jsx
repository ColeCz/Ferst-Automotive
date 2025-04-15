import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useParams } from 'react-router-dom'
import ProtectedElement from '../../components/common/ProtectedElement/ProtectedElement'
import './VehicleDetails.css'

function VehicleDetails() {
  const navigate = useNavigate()
  const { vehicleId } = useParams()
  const [vehicle, setVehicle] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        console.log('Fetching details for VIN:', vehicleId)
        
        const response = await fetch(`http://localhost:8081/vehicle_details/get-vehicle-details/${vehicleId}?role=manager`, {
          credentials: 'include',
        })
  
        if (!response.ok) {
          const errorText = await response.text()
          console.log('Error response:', errorText)
          throw new Error(`Vehicle not found (Status: ${response.status})`)
        }
  
        const data = await response.json()
        console.log('Full vehicle data:', JSON.stringify(data, null, 2)) // Pretty print all data
        setVehicle(data)
      } catch (err) {
        console.error('Error fetching vehicle details:', err)
        setError(err.message)
      }
    }
  
    fetchVehicleDetails()
  }, [vehicleId])

  const handleSellVehicle = () => {
    navigate(`/sell-vehicle-search-customer?vin=${vehicleId}`)
  }

  if (error) return <div className="error-message">{error}</div>
  if (!vehicle) return <div className="loading">Loading...</div>

  const formatCurrency = (amount) => {
    return amount ? new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount) : 'N/A'
  }

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A'
  }

  if (error) return <div className="error-message">{error}</div>
  if (!vehicle) return <div className="loading">Loading...</div>

  return (
    <div className="vehicle-details-container">
      <div className="vehicle-info">
        <h2>Vehicle Details</h2>
        <div style={{ textAlign: "center"}}>
          <img 
            src={"/images/"+vehicle.image_url}
            alt={"/images/Sedan.jpg"}
            style={{ maxWidth: "35%", height: "auto" }}
          />
        </div>
        {/* Basic Vehicle Information */}
        <div className="section basic-info">
          <h3>Basic Information</h3>
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
              <span className="label">Horsepower:</span>
              <span className="value">{vehicle.horsepower}</span>
            </div>
            <div className="detail-item">
              <span className="label">Description:</span>
              <span className="value">{vehicle.description}</span>
            </div>
          </div>
        </div>

        {/* Protected Purchase Information */}
        <ProtectedElement
          element={
            vehicle.purchase_date || vehicle.purchase_price || vehicle.purchase_condition || vehicle.purchasing_clerk ? (
              <div className="section purchase-info">
                <h3>Purchase Information</h3>
                <div className="details-list">
                  {vehicle.purchase_date && (
                    <div className="detail-item">
                      <span className="label">Purchase Date:</span>
                      <span className="value">{formatDate(vehicle.purchase_date)}</span>
                    </div>
                  )}
                  {vehicle.purchase_price && (
                    <div className="detail-item">
                      <span className="label">Purchase Price:</span>
                      <span className="value">{formatCurrency(vehicle.purchase_price)}</span>
                    </div>
                  )}
                  {vehicle.purchase_condition && (
                    <div className="detail-item">
                      <span className="label">Condition at Purchase:</span>
                      <span className="value">{vehicle.purchase_condition}</span>
                    </div>
                  )}
                  {vehicle.purchasing_clerk && (
                    <div className="detail-item">
                      <span className="label">Purchasing Clerk:</span>
                      <span className="value">{vehicle.purchasing_clerk}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null
          }
          requiredRole={['clerk', 'manager']}
        />

        {/* Protected Parts Information */}
        <ProtectedElement
          element={
            vehicle.part_number && (
              <div className="section parts-info">
                <h3>Parts Information</h3>
                <div className="details-list">
                  <div className="detail-item">
                    <span className="label">Part Number:</span>
                    <span className="value">{vehicle.part_number}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Description:</span>
                    <span className="value">{vehicle.part_description}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className="value">{vehicle.part_status}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Unit Price:</span>
                    <span className="value">{formatCurrency(vehicle.part_price)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Quantity:</span>
                    <span className="value">{vehicle.part_quantity}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Vendor:</span>
                    <span className="value">{vehicle.part_vendor}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Total Parts Cost:</span>
                    <span className="value">{formatCurrency(vehicle.total_parts_cost)}</span>
                  </div>
                </div>
              </div>
            )
          }
          requiredRole={['clerk', 'manager']}
        />

        {/* Protected Seller Information */}
        <ProtectedElement
        element={
          vehicle.seller_email || vehicle.seller_phone || 
          (vehicle.seller_street && vehicle.seller_city && vehicle.seller_state && vehicle.seller_postal_code) ? (
            <div className="section seller-info">
              <h3>Seller Information</h3>
              <div className="details-list">
                {vehicle.seller_email && (
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{vehicle.seller_email}</span>
                  </div>
                )}
                {vehicle.seller_phone && (
                  <div className="detail-item">
                    <span className="label">Phone:</span>
                    <span className="value">{vehicle.seller_phone}</span>
                  </div>
                )}
                {(vehicle.seller_street && vehicle.seller_city && vehicle.seller_state && vehicle.seller_postal_code) && (
                  <div className="detail-item">
                    <span className="label">Address:</span>
                    <span className="value">
                      {`${vehicle.seller_street}, ${vehicle.seller_city}, ${vehicle.seller_state} ${vehicle.seller_postal_code}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : null
        }
        requiredRole={['clerk', 'manager']}
      />

        {/* Protected Buyer Information - Manager Only */}
        <ProtectedElement
          element={
            vehicle.buyer_email && (
              <div className="section buyer-info">
                <h3>Buyer Information</h3>
                <div className="details-list">
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{vehicle.buyer_email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Phone:</span>
                    <span className="value">{vehicle.buyer_phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Address:</span>
                    <span className="value">
                      {`${vehicle.buyer_street}, ${vehicle.buyer_city}, ${vehicle.buyer_state} ${vehicle.buyer_postal_code}`}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Sale Date:</span>
                    <span className="value">{formatDate(vehicle.sale_date)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Sale Price:</span>
                    <span className="value">{formatCurrency(vehicle.sale_price)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Salesperson:</span>
                    <span className="value">{vehicle.selling_salesperson}</span>
                  </div>
                </div>
              </div>
            )
          }
          requiredRole="manager"
        />
        {/* Sell Vehicle Button */}
        <ProtectedElement
          element={
            <div className="section">
              <button 
                className="sell-vehicle-button" 
                onClick={handleSellVehicle}
                disabled={vehicle.sale_status === 'Sold'}
              >
                {vehicle.sale_status === 'Sold' ? 'VEHICLE ALREADY SOLD' : 'SELL VEHICLE'}
              </button>
            </div>
          }
          requiredRole="salesperson"
        />
      </div>
    </div>
  )
}

export default VehicleDetails