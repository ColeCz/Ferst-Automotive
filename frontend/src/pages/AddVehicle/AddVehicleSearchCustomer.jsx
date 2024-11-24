import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AddVehicleSearchCustomer.css'

const AddVehicleSearchCustomer = () => {
  const navigate = useNavigate()
  const [ssn, setSSN] = useState('')
  const [taxId, setTaxId] = useState('')
  const [customerFound, setCustomerFound] = useState(false)
  const [customerType, setCustomerType] = useState('')
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

  const handleSearch = async (type, id) => {
    try {
      const idType = type === 'individual' ? 'ssn' : 'tin'
      const searchParams = new URLSearchParams()
      searchParams.append(idType, id)

      console.log('Searching with params:', searchParams.toString())  // Debug

      const response = await fetch(`http://localhost:8081/vehicle/search-customers?${searchParams.toString()}`, {
        credentials: 'include',
      })

      console.log('Response:', response)  // Debug

      const data = await response.json()
  
      console.log('Data:', data)  // Debug

      if (data.customer) {
        setCustomerFound(true)
        setFormData(data.customer)
        setCustomerType(type) // set type based on search type
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
      const response = await fetch('http://localhost:8081/vehicle/customers', { //////
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: customerType,
          ...formData,
        }),
      })

      if (response.ok) {
        navigate('/add-vehicle-new')
      }
    } catch (error) {
      console.error('Error saving customer:', error)
    }
  }

  return (
    <div className="search-customer-container">
      <h1>Add Vehicle - Search for Customer</h1>

      <div className="search-sections">
        {/* Individual Search Section */}
        <div className="search-section">
          <input
            type="text"
            placeholder="Enter SSN"
            value={ssn}
            onChange={(e) => setSSN(e.target.value)}
          />
          <button onClick={() => {
            console.log('Search button clicked')
            handleSearch('individual', ssn)
          }}>
            Search for Customer by SSN
          </button>
        </div>

        {/* Business Search Section */}
        <div className="search-section">
          <input
            type="text"
            placeholder="Enter Tax ID"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
          />
          <button onClick={() => handleSearch('business', taxId)}>
            Search for Business by Tax ID
          </button>
        </div>
      </div>

      {!customerFound && (
        <div className="customer-type-selection">
          <h3>Customer Not Found</h3>
          <p>If the customer doesn't exist, select a customer type to create new:</p>
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
              placeholder="Business Name"
              value={formData.businessName}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="contactFirst"
              placeholder="Contact First Name"
              value={formData.contactFirst}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="contactLast"
              placeholder="Contact Last Name"
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
              placeholder="Business Address"
              value={formData.businessAddress}
              onChange={handleInputChange}
            />
            <input
              type="tel"
              name="businessPhone"
              placeholder="Business Phone"
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