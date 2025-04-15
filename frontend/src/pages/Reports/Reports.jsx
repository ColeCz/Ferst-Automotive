import React, { useState } from 'react'
import './Reports.css'

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [drilldownData, setDrilldownData] = useState(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1) // Current month
  const [year, setYear] = useState(new Date().getFullYear()) // Current year

  const fetchReportData = async (reportType) => {
    setIsLoading(true)
    setDrilldownData(null) // to clear drilldown data when changing reports
    try {
      let url = `http://localhost:8081/reports/${reportType}`

      // for monthly sales, fetch all months
      if (reportType === 'monthly-sales') {
        // get data for last 5y
        const currentYear = new Date().getFullYear()
        const allData = []

        for (let y = currentYear; y >= currentYear - 4; y--) {
          for (let m = 1; m <= 12; m++) {
            const response = await fetch(`${url}?month=${m}&year=${y}`, {
              credentials: 'include',
            })
            if (response.ok) {
              const data = await response.json()
              if (data && data.length > 0 && data[0].total_vehicles_sold > 0) {
                // Add month/year info to each row
                data[0].month = m
                data[0].year = y
                allData.push(data[0])
              }
            }
          }
        }
        setReportData(
          allData.sort((a, b) => {
            // sort by year descending, then month descending
            if (b.year !== a.year) return b.year - a.year
            return b.month - a.month
          }),
        )
      } else {
        const response = await fetch(url, {
          credentials: 'include',
        })
        if (!response.ok) {
          throw new Error('Failed to fetch report data')
        }
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDrilldownData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `http://localhost:8081/reports/monthly-sales-drilldown?month=${month}&year=${year}`,
        { credentials: 'include' },
      )
      if (!response.ok) {
        throw new Error('Failed to fetch drilldown data')
      }
      const data = await response.json()
      setDrilldownData(data)
    } catch (error) {
      console.error('Error fetching drilldown data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReportSelect = (reportType) => {
    setSelectedReport(reportType)
    setDrilldownData(null) // clear drilldown data when changing reports
    fetchReportData(reportType)
  }

  const renderTable = () => {
    if (!reportData || reportData.length === 0) return null

    if (selectedReport === 'monthly-sales') {
      return (
        <div>
          <table className="report-table">
            <thead>
              <tr>
                <th>MONTH</th>
                <th>YEAR</th>
                <th>TOTAL VEHICLES SOLD</th>
                <th>TOTAL GROSS INCOME</th>
                <th>TOTAL NET INCOME</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                <tr key={index}>
                  <td>
                    {new Date(2024, row.month - 1, 1).toLocaleString(
                      'default',
                      {
                        month: 'long',
                      },
                    )}
                  </td>
                  <td>{row.year}</td>
                  <td>{row.total_vehicles_sold.toLocaleString('en-US')}</td>
                  <td>
                    $
                    {row.total_gross_income.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    $
                    {row.total_net_income.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {drilldownData && (
            <div className="drilldown-section">
              <h2>
                Sales Details for{' '}
                {new Date(2024, month - 1, 1).toLocaleString('default', {
                  month: 'long',
                })}{' '}
                {year}
              </h2>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>SALESPERSON</th>
                    <th>VEHICLES SOLD</th>
                    <th>TOTAL SALES AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {drilldownData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.salesperson}</td>
                      <td>{row.vehicles_sold.toLocaleString('en-US')}</td>
                      <td>
                        $
                        {row.total_sales_amount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )
    }

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
      if (
        column === 'avg_purchase_price' ||
        column === 'cost_per_vehicle' ||
        // add condition for Price Per Condition report columns
        column === 'average_price' ||
        column === 'price' ||
        column.toLowerCase().includes('price')
      ) {
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
          <button onClick={fetchDrilldownData}>Drilldown</button>
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
