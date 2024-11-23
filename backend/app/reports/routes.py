from flask import jsonify, request, session
import psycopg
from app.reports import blueprint
import logging

# Database connection parameters
DB_HOST = "db"
DB_PORT = "5432"
DB_NAME = "dealership"
DB_USER = "dealership"
DB_PASSWORD = "dealership"


# Utility function to execute SQL queries and return results
def execute_query(query, params=None):
    try:
        # Connect to the PostgreSQL database
        with psycopg.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
        ) as con:
            with con.cursor() as cur:
                # Execute the provided query with parameters
                cur.execute(query, params)
                # Fetch all results
                result = cur.fetchall()

                # Log the raw result to check what's being fetched
                logging.info(f"Query result: {result}")

                # Return the results and column names
                columns = [desc[0] for desc in cur.description]
                formatted_result = [dict(zip(columns, row)) for row in result]
                return formatted_result
    except Exception as e:
        # If there's an error executing the query
        logging.error(f"Error executing query: {e}")
        return {"error": str(e)}


# Route for the 'Seller History' report
@blueprint.route("/seller-history", methods=["GET"])
def seller_history():
    try:
        with open("app/db/queries/report-seller-history.sql", "r") as file:
            query = file.read()

        result = execute_query(query)

        # debug log the raw result
        logging.info("Raw seller history result:")
        for row in result:
            logging.info(row)

        if isinstance(result, dict) and "error" in result:
            return jsonify(result), 500

        # transform None/NULL vals to 0/false for consistent frontend display (otherwise they're just empty - we can vote on this later if need be)
        for row in result:
            try:
                row["total_vehicles_sold"] = int(row.get("total_vehicles_sold", 0) or 0)
                row["avg_purchase_price"] = float(row.get("avg_purchase_price", 0) or 0)
                row["cost_per_vehicle"] = float(row.get("cost_per_vehicle", 0) or 0)
                row["flagged"] = bool(row.get("flagged", False))

                # debug log each transformed row
                logging.info(f"Transformed row: {row}")

            except (ValueError, TypeError) as e:
                logging.error(f"Error transforming row {row}: {e}")
                # if conversion fails, set to 0
                if "avg_purchase_price" not in row or row["avg_purchase_price"] is None:
                    row["avg_purchase_price"] = 0.0
                if "cost_per_vehicle" not in row or row["cost_per_vehicle"] is None:
                    row["cost_per_vehicle"] = 0.0

        if result:
            return jsonify(result)
        else:
            return jsonify({"message": "No seller history data found"}), 404

    except Exception as e:
        logging.error(f"Error in seller history: {e}")
        return jsonify({"error": str(e)}), 500


# Route for the 'Monthly Sales' report
@blueprint.route("/monthly-sales", methods=["GET"])
def monthly_sales():
    # Get the month and year from query parameters
    month = request.args.get("month")
    year = request.args.get("year")

    # Check if month and year are provided
    if not month or not year:
        return (
            jsonify({"error": "Month and year are required as query parameters"}),
            400,
        )

    try:
        # SQL query for monthly sales
        query = """
        SELECT
            COUNT(DISTINCT t.trans_id) AS total_vehicles_sold,
            SUM(t.trans_price) AS total_gross_income,
            SUM(t.trans_price - COALESCE(p.trans_price, 0)) AS total_net_income
        FROM Transaction t
        JOIN Sale s ON t.trans_id = s.transactions
        LEFT JOIN (
            SELECT trans_id, trans_price
            FROM Transaction t2
            JOIN Purchase p2 ON t2.trans_id = p2.transactions
        ) p ON t.vehicle_vin = (
            SELECT t3.vehicle_vin
            FROM Transaction t3
            WHERE t3.trans_id = p.trans_id
        )
        WHERE EXTRACT(MONTH FROM t.trans_date) = %s
        AND EXTRACT(YEAR FROM t.trans_date) = %s;
        """

        # Execute the query with the provided month and year as parameters
        result = execute_query(query, (month, year))

        if isinstance(result, dict) and "error" in result:
            return jsonify(result), 500

        # If result contains data, return it
        if result:
            return jsonify(result)
        else:
            return (
                jsonify(
                    {"message": "No sales data found for the specified month and year"}
                ),
                404,
            )

    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return jsonify({"error": str(e)}), 500


# Route for the 'Average Time in Inventory' report
@blueprint.route("/average-time-in-inventory", methods=["GET"])
def average_time_in_inventory():
    with open("app/db/queries/report-inventory-time.sql", "r") as file:
        query = file.read()

    result = execute_query(query)

    if isinstance(result, dict) and "error" in result:
        return jsonify(result), 500

    if result:
        return jsonify(result)
    else:
        return jsonify({"message": "No average time in inventory data found"}), 404


# Route for the 'Price Per Condition' report
@blueprint.route("/price-per-condition", methods=["GET"])
def price_per_condition():
    try:
        with open("app/db/queries/report-price-per-condition.sql", "r") as file:
            query = file.read()

        result = execute_query(query)

        if isinstance(result, dict) and "error" in result:
            return jsonify(result), 500

        if result:
            return jsonify(result)
        else:
            return jsonify({"message": "No price per condition data found"}), 404

    except FileNotFoundError:
        logging.error("SQL file for price per condition not found.")
        return jsonify({"error": "SQL file for price per condition not found"}), 500
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return jsonify({"error": str(e)}), 500


# Route for the 'Parts Statistics' report
@blueprint.route("/parts-statistics", methods=["GET"])
def parts_statistics():
    try:
        with open("app/db/queries/report-parts-statistics.sql", "r") as file:
            query = file.read()

        result = execute_query(query)

        if isinstance(result, dict) and "error" in result:
            return jsonify(result), 500

        if result:
            return jsonify(result)
        else:
            return jsonify({"message": "No parts statistics data found"}), 404

    except FileNotFoundError:
        logging.error("SQL file for parts statistics not found.")
        return jsonify({"error": "SQL file for parts statistics not found"}), 500
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return jsonify({"error": str(e)}), 500


@blueprint.route("/monthly-sales-drilldown", methods=["GET"])
def monthly_sales_drilldown():
    # Get the month and year from the request parameters
    month = request.args.get("month")
    year = request.args.get("year")

    if not month or not year:
        return jsonify({"error": "Month and year are required"}), 400

    # Prepare the query
    query = """
    SELECT
        s.salesperson,
        COUNT(s.transactions) AS vehicles_sold,
        SUM(t.trans_price) AS total_sales_amount
    FROM Sale s
    JOIN Transaction t ON s.transactions = t.trans_id
    WHERE EXTRACT(YEAR FROM t.trans_date) = %(year)s
    AND EXTRACT(MONTH FROM t.trans_date) = %(month)s
    GROUP BY s.salesperson
    ORDER BY vehicles_sold DESC, total_sales_amount DESC;
    """

    # Use the execute_query function to fetch results
    result = execute_query(query, {"month": month, "year": year})

    if isinstance(result, dict) and "error" in result:
        # Handle error if occurred in execute_query
        return jsonify(result), 500

    # Return the results in JSON format
    if result:
        return jsonify(result)
    else:
        return jsonify({"message": "No sales data found for this month"}), 404
