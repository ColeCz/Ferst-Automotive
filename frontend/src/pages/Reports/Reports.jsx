import React, { useState, useEffect } from 'react'
import './Reports.css'

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchReportData = async (reportType) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/reports/${reportType}`)
      if (!response.ok) {
        throw new Error('Failed to fetch report data')
      }
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReportSelect = (reportType) => {
    setSelectedReport(reportType)
    fetchReportData(reportType)
  }

  return (
    <div className="reports-container">
      <h1>Reports</h1>

      <div className="reports-menu">
        <button
          className={`report-button ${selectedReport === 'seller-history' ? 'selected' : ''}`}
          onClick={() => handleReportSelect('seller-history')}
        >
          SELLER HISTORY
        </button>

        <button
          className={`report-button ${selectedReport === 'inventory-time' ? 'selected' : ''}`}
          onClick={() => handleReportSelect('inventory-time')}
        >
          AVERAGE TIME IN INVENTORY
        </button>

        <button
          className={`report-button ${selectedReport === 'price-condition' ? 'selected' : ''}`}
          onClick={() => handleReportSelect('price-condition')}
        >
          PRICE PER CONDITION
        </button>

        <button
          className={`report-button ${selectedReport === 'parts-statistics' ? 'selected' : ''}`}
          onClick={() => handleReportSelect('parts-statistics')}
        >
          PARTS STATISTICS
        </button>

        <button
          className={`report-button ${selectedReport === 'monthly-sales' ? 'selected' : ''}`}
          onClick={() => handleReportSelect('monthly-sales')}
        >
          MONTHLY SALES
        </button>
      </div>

      <div className="report-display">
        {isLoading ? (
          <div>Loading...</div>
        ) : reportData ? (
          <div className="report-content">
            {/* Render report data here based on selectedReport type */}
            <pre>{JSON.stringify(reportData, null, 2)}</pre>
          </div>
        ) : (
          <div>Select a report to view data</div>
        )}
      </div>
    </div>
  )
}

export default Reports
