import React, { useState, useEffect } from 'react'
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
    customerId: '',
    firstName: '',
    lastName: '',
    ssn: '',
    address: '',
    phone: '',
    email: '',

    // Business fields
    taxId: '',
    businessName: '',
    contactFirst: '',
    contactLast: '',
    contactTitle: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: ''
  })

  // Debug effect
  useEffect(() => {
    console.log('Current state:', {
      ssn,
      taxId,
      customerFound,
      customerType,
      formData
    })
  }, [ssn, taxId, customerFound, customerType, formData])  

  const handleSearch = async (type, id) => {
    try {
      const idType = type === 'individual' ? 'ssn' : 'tin'
      const searchParams = new URLSearchParams()
      searchParams.append(idType, id)

      console.log('Searching with params:', searchParams.toString())

      const response = await fetch(`http://localhost:8081/vehicle/search-customers?${searchParams.toString()}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Received customer data:', data)

      if (data.customer) {
        setCustomerFound(true)
        
        console.log('Raw customer data:', data.customer)
        const mappedData = mapDatabaseToFormData(data.customer)
        console.log('Mapped form data:', mappedData)
        
        setFormData(mappedData)
        setCustomerType(type)
      } else {
        setCustomerFound(false)
        setCustomerType(type) // Still set the type for the empty form
        
        // Clear the form data
        setFormData({
          customerId: '',
          firstName: '',
          lastName: '',
          ssn: '',
          address: '',
          phone: '',
          email: '',
          taxId: '',
          businessName: '',
          contactFirst: '',
          contactLast: '',
          contactTitle: '',
          businessAddress: '',
          businessPhone: '',
          businessEmail: ''
        })
      }
    } catch (error) {
      console.error('Error searching for customer:', error)
      setCustomerFound(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const mapDatabaseToFormData = (dbData) => {
    console.log('Mapping database data:', dbData)
    
    if (Array.isArray(dbData)) {
      // Check if it's an individual (has SSN) or business (has TIN)
      if (dbData[9]) { // SSN is at index 9 for individuals
        return {
          customerId: dbData[0],
          email: dbData[1] || '',
          phone: dbData[2] || '',
          address: `${dbData[6] || ''}, ${dbData[5] || ''}, ${dbData[4] || ''} ${dbData[3] || ''}`,
          firstName: dbData[7] || '',
          lastName: dbData[8] || '',
          ssn: dbData[9] || ''
        }
      } else { // Business
        return {
          customerId: dbData[0],
          email: dbData[1] || '',
          businessPhone: dbData[2] || '',
          businessAddress: `${dbData[6] || ''}, ${dbData[5] || ''}, ${dbData[4] || ''} ${dbData[3] || ''}`,
          businessName: dbData[7] || '',
          contactTitle: dbData[8] || '',
          contactFirst: dbData[9] || '',
          contactLast: dbData[10] || '',
          taxId: dbData[11] || ''
        }
      }
    }
    
    // Fallback in case data format changes
    console.error('Unexpected data format:', dbData)
    return {}
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // If we found an existing customer, use their ID
    if (customerFound) {
      navigate('/add-vehicle-new', {
        state: { 
          customerId: formData.customerId,
          customerType: customerType 
        }
      })
      return
    }

    try {
      let queryParams = new URLSearchParams()
      
      if (customerType === 'individual') {
        const [street, city, stateAndZip = ''] = formData.address.split(',').map(s => s.trim())
        const [state_abbrv = '', postal_code = ''] = stateAndZip.split(' ').map(s => s.trim())

        queryParams.append('email', formData.email || '')
        queryParams.append('phone_num', formData.phone)
        queryParams.append('postal_code', postal_code)
        queryParams.append('state_abbrv', state_abbrv)
        queryParams.append('city', city)
        queryParams.append('street', street)
        queryParams.append('ssn', formData.ssn)
        queryParams.append('firstname', formData.firstName)
        queryParams.append('lastname', formData.lastName)
      } else {
        const [street, city, stateAndZip = ''] = formData.businessAddress.split(',').map(s => s.trim())
        const [state_abbrv = '', postal_code = ''] = stateAndZip.split(' ').map(s => s.trim())

        queryParams.append('email', formData.businessEmail || '')
        queryParams.append('phone_num', formData.businessPhone)
        queryParams.append('postal_code', postal_code)
        queryParams.append('state_abbrv', state_abbrv)
        queryParams.append('city', city)
        queryParams.append('street', street)
        queryParams.append('tin', formData.taxId)
        queryParams.append('business_name', formData.businessName)
        queryParams.append('contact_title', formData.contactTitle)
        queryParams.append('contact_firstname', formData.contactFirst)
        queryParams.append('contact_lastname', formData.contactLast)
      }

      console.log('Sending query params:', queryParams.toString())

      const response = await fetch(`http://localhost:8081/vehicle/add-customer?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Response:', data)

      // Navigate with the new customer's ID
      if (data.message === "Individual customer added successfully" || 
          data.message === "Business customer added successfully") {
        navigate('/add-vehicle-new', {
          state: { 
            customerId: data.customerId,
            customerType: customerType
          }
        })
      } else {
        console.error('Unexpected response:', data)
      }
    } catch (error) {
      console.error('Error saving customer:', error)
      alert('Error saving customer: ' + error.message)
    }
  }

  try {
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
          <h3>Customer Not Found?</h3>
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
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="ssn"
              placeholder="SSN"
              value={formData.ssn}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email (Optional)"
              value={formData.email}
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
              required
            />
            <input
              type="text"
              name="businessName"
              placeholder="Business Name"
              value={formData.businessName}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="contactFirst"
              placeholder="Contact First Name"
              value={formData.contactFirst}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="contactLast"
              placeholder="Contact Last Name"
              value={formData.contactLast}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="contactTitle"
              placeholder="Contact Title"
              value={formData.contactTitle}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="businessAddress"
              placeholder="Business Address"
              value={formData.businessAddress}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="businessPhone"
              placeholder="Business Phone"
              value={formData.businessPhone}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="businessEmail"
              placeholder="Business Email (Optional)"
              value={formData.businessEmail}
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
  } catch (error) {
    console.error('Render error:', error)
    return <div>Error loading page. Please check console.</div>
  }
}

export default AddVehicleSearchCustomer