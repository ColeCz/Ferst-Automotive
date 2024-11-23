import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AddVehicleSearchCustomer.css'

const AddVehicleSearchCustomer = () => {
  const navigate = useNavigate()
  const [searchId, setSearchId] = useState('')
  const [customerType, setCustomerType] = useState('')
  const [customerFound, setCustomerFound] = useState(false)
  const [formData, setFormData] = useState({
    // Individual fields
    firstName: '',
    lastName: '',
    ssn: '',
    address: '',
    phone: '',

    // Business fields
    taxId: '',
    businessName: '',
    contactFirst: '',
    contactLast: '',
    contactTitle: '',
    businessAddress: '',
    businessPhone: '',
  })

  const handleSearch = async () => {
    try {
      const response = await fetch(`/api/customers/search?id=${searchId}`)
      const data = await response.json()
      if (data.customer) {
        setCustomerFound(true)
        // Populate form data based on customer type
        setFormData(data.customer)
        setCustomerType(data.customer.type)
      } else {
        setCustomerFound(false)
        setCustomerType('')
      }
    } catch (error) {
      console.error('Error searching for customer:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: customerType,
          ...formData,
        }),
      })

      if (response.ok) {
        navigate('/add-vehicle-new') // Navigate to next page
      }
    } catch (error) {
      console.error('Error saving customer:', error)
    }
  }

  return (
    <div className="search-customer-container">
      <h1>Add Vehicle - Search for Customer</h1>

      <div className="search-section">
        <input
          type="text"
          placeholder="SSN or Tax ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button onClick={handleSearch}>SEARCH FOR CUSTOMER</button>
      </div>

      {!customerFound && (
        <div className="customer-type-selection">
          <h3>Select Customer Type:</h3>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="customerType"
                value="individual"
                checked={customerType === 'individual'}
                onChange={(e) => setCustomerType(e.target.value)}
              />
              Individual
            </label>
            <label>
              <input
                type="radio"
                name="customerType"
                value="business"
                checked={customerType === 'business'}
                onChange={(e) => setCustomerType(e.target.value)}
              />
              Business
            </label>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="customer-form">
        {customerType === 'individual' && (
          <div className="individual-form">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="ssn"
              placeholder="SSN"
              value={formData.ssn}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleInputChange}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
        )}

        {customerType === 'business' && (
          <div className="business-form">
            <input
              type="text"
              name="taxId"
              placeholder="Tax ID"
              value={formData.taxId}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="businessName"
              placeholder="Name"
              value={formData.businessName}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="contactFirst"
              placeholder="Contact First"
              value={formData.contactFirst}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="contactLast"
              placeholder="Contact Last"
              value={formData.contactLast}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="contactTitle"
              placeholder="Contact Title"
              value={formData.contactTitle}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="businessAddress"
              placeholder="Address"
              value={formData.businessAddress}
              onChange={handleInputChange}
            />
            <input
              type="tel"
              name="businessPhone"
              placeholder="Phone"
              value={formData.businessPhone}
              onChange={handleInputChange}
            />
          </div>
        )}

        {customerType && (
          <button type="submit" className="submit-button">
            Continue to Add Vehicle
          </button>
        )}
      </form>
    </div>
  )
}

export default AddVehicleSearchCustomer