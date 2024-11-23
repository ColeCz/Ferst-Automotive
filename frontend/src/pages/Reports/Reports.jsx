import React, { useState, useEffect } from 'react'
import './Reports.css'

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [month, setMonth] = useState(new Date().getMonth() + 1) // Current month
  const [year, setYear] = useState(new Date().getFullYear()) // Current year

  const fetchReportData = async (reportType) => {
    setIsLoading(true)
    try {
      let url = `http://localhost:8081/reports/${reportType}`
      if (reportType === 'monthly-sales') {
        url += `?month=${month}&year=${year}`
      }
      const response = await fetch(url, {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch report data')
      }
      const data = await response.json()
      console.log('Received report data:', data) // Debug log
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

  const renderTable = () => {
    if (!reportData || reportData.length === 0) return null

    const columns = Object.keys(reportData[0])

    const formatValue = (value, column) => {
      // for debugging
      console.log(
        `Formatting column ${column}, value:`,
        value,
        `type: ${typeof value}`,
      )

      if (value === null || value === undefined) return '-'

      if (column === 'flagged') return value ? 'Yes' : 'No'

      if (column === 'seller_type' || column === 'seller_name') return value

      // handle num types
      if (column === 'avg_purchase_price' || column === 'cost_per_vehicle') {
        const numValue = parseFloat(value)
        if (isNaN(numValue)) return '-'
        return `$${numValue.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      }

      if (typeof value === 'number') {
        return value.toLocaleString('en-US')
      }

      return value
    }

    return (
      <table className="report-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column.replace(/_/g, ' ').toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reportData.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={`${index}-${column}`}>
                  {formatValue(row[column], column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
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
          className={`report-button ${selectedReport === 'average-time-in-inventory' ? 'selected' : ''}`}
          onClick={() => handleReportSelect('average-time-in-inventory')}
        >
          AVERAGE TIME IN INVENTORY
        </button>

        <button
          className={`report-button ${selectedReport === 'price-per-condition' ? 'selected' : ''}`}
          onClick={() => handleReportSelect('price-per-condition')}
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

      {selectedReport === 'monthly-sales' && (
        <div className="date-filters">
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2024, i, 1).toLocaleString('default', {
                  month: 'long',
                })}
              </option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {[...Array(5)].map((_, i) => {
              const yearValue = new Date().getFullYear() - i
              return (
                <option key={yearValue} value={yearValue}>
                  {yearValue}
                </option>
              )
            })}
          </select>
          <button onClick={() => fetchReportData('monthly-sales')}>
            Update
          </button>
        </div>
      )}

      <div className="report-display">
        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : reportData ? (
          <div className="report-content">{renderTable()}</div>
        ) : (
          <div className="no-data">Select a report to view data</div>
        )}
      </div>
    </div>
  )
}

export default Reports
