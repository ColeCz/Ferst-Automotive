import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './VehicleForm.css'

const VehicleForm = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { customerId, customerType } = location.state || {}

  const [formData, setFormData] = useState({
    vin: '',
    vehicle_type: '',
    condition: '',
    trans_price: '',
  })

  // check if customerId exists (persisted from last page)
  useEffect(() => {
    if (!customerId) {
      navigate('/add-vehicle-search-for-customer')
    }
  }, [customerId, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // create FormData object (this is the form the backend is expecting)
    const formDataObj = new FormData()
    formDataObj.append('vin', formData.vin)
    formDataObj.append('vehicle_type', formData.vehicle_type)
    formDataObj.append('condition', formData.condition)
    formDataObj.append('trans_price', formData.trans_price)
    formDataObj.append('customer_id', customerId)

    // these fields are required by backend, but can be default values:
    formDataObj.append('model_name', 'Unknown')
    formDataObj.append('model_year', new Date().getFullYear())
    formDataObj.append('manufacturer', 'Unknown')
    formDataObj.append('fuel_type', 'Unknown')
    formDataObj.append('horsepower', '0')
    formDataObj.append('description', 'No description provided')

    try {
      const response = await fetch(
        'http://3.147.185.195:8081/vehicle/add-vehicle',
        {
          method: 'POST',
          credentials: 'include',
          body: formDataObj,
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add vehicle')
      }

      const data = await response.json()
      if (data.message === 'vehicle purchased successfully') {
        alert('Vehicle added successfully!')
        navigate('/')
      }
    } catch (error) {
      console.error('Error adding vehicle:', error)
      alert('Error adding vehicle: ' + error.message)
    }
  }

  return (
    <div className="vehicle-form-container">
      <h1>Add New Vehicle</h1>
      <h2>
        Adding vehicle for{' '}
        {customerType === 'individual' ? 'Individual' : 'Business'} Customer ID:{' '}
        {customerId}
      </h2>

      <form onSubmit={handleSubmit} className="vehicle-form">
        <div className="form-group">
          <label htmlFor="vin">VIN:</label>
          <input
            id="vin"
            type="text"
            name="vin"
            value={formData.vin}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="vehicle_type">Vehicle Type:</label>
          <select
            id="vehicle_type"
            name="vehicle_type"
            value={formData.vehicle_type}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Type</option>
            <option value="Car">Car</option>
            <option value="Truck">Truck</option>
            <option value="SUV">SUV</option>
            <option value="Van">Van</option>
            <option value="Convertible">Convertible</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="condition">Condition:</label>
          <select
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Condition</option>
            <option value="Excellent">Excellent</option>
            <option value="Very Good">Very Good</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="trans_price">Purchase Price:</label>
          <input
            id="trans_price"
            type="number"
            name="trans_price"
            min="0"
            step="0.01"
            value={formData.trans_price}
            onChange={handleInputChange}
            required
          />
        </div>

        <button
          type="submit"
          disabled={
            !formData.vin ||
            !formData.vehicle_type ||
            !formData.condition ||
            !formData.trans_price
          }
        >
          Add Vehicle
        </button>
      </form>
    </div>
  )
}

export default VehicleForm
