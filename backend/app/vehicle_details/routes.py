import psycopg
from flask import Blueprint, jsonify, request
from app.vehicle_details import blueprint
import logging

# Database connection parameters
DB_HOST = 'db'
DB_PORT = '5432'
DB_NAME = 'dealership'
DB_USER = 'dealership'
DB_PASSWORD = 'dealership'

# Utility function to execute SQL queries and return results
def execute_query(query, params=None):
    try:
        # Log the query and parameters for debugging
        logging.info(f"Executing query: {query} with parameters: {params}")

        # Connect to the PostgreSQL database
        with psycopg.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        ) as con:
            with con.cursor() as cur:
                # Execute the provided query with parameters (use dictionary for named placeholders)
                cur.execute(query, params)
                # Fetch all results
                result = cur.fetchall()

                # Log the raw result to check what's being fetched
                logging.info(f"Query result: {result}")

                # Return the results and column names as dictionaries
                columns = [desc[0] for desc in cur.description]
                formatted_result = [dict(zip(columns, row)) for row in result]
                return formatted_result
    except psycopg.Error as e:
        logging.error(f"Database error: {e}")
        logging.error(f"Error Details: {e.diag.message_detail}")
        return {"error": "Database error occurred, please try again later."}
    except Exception as e:
        logging.error(f"Error executing query: {e}")
        return {"error": str(e)}

@blueprint.route('/get-vehicle-details/<vin>', methods=['GET'])
def vehicle_details(vin):
    # Determine the user's role from the request arguments
    user_role = request.args.get('role', 'public')  # Default to 'public' if no role is provided

    # Step 4: Adjust role logic for the owner
    if user_role == 'owner':
        user_role = 'manager'  # Treat the owner as having manager-level access

    # Log the received VIN and adjusted role for debugging
    logging.info(f"Received VIN: {vin} and adjusted Role: {user_role}")

    # Map roles to their respective SQL query files
    query_paths = {
        'manager': 'app/db/queries/get-vehicle-details-manager.sql',
        'owner': 'app/db/queries/get-vehicle-details-manager.sql',  # Owner uses manager query
        'public': 'app/db/queries/get-vehicle-details.sql'  # Default for public users
    }

    # Select the appropriate query file based on the adjusted role
    query_path = query_paths.get(user_role, query_paths['public'])

    try:
        # Read the SQL query from the file
        with open(query_path, 'r') as file:
            query = file.read()

        # Log the SQL query for debugging
        logging.info(f"SQL Query: {query}")

        # Prepare parameters as a dictionary for named placeholders
        params = {'vin': vin}  # Using named placeholder "vin"

        # Execute the query with the VIN as a parameter to fetch vehicle details
        vehicle_details_result = execute_query(query, params=params)

        # Handle any errors returned by execute_query
        if isinstance(vehicle_details_result, dict) and "error" in vehicle_details_result:
            logging.error(f"Error executing vehicle details query: {vehicle_details_result}")
            return jsonify(vehicle_details_result), 500

        # If no vehicle is found, return a 404 message
        if not vehicle_details_result:
            logging.warning(f"No vehicle found for VIN: {vin}")
            return jsonify({"message": "Vehicle not found"}), 404

        # Return the vehicle details as JSON
        return jsonify(vehicle_details_result[0])  # Return the first result

    except FileNotFoundError as e:
        logging.error(f"SQL file not found: {e}")
        return jsonify({"error": "SQL query file not found."}), 500
    except Exception as e:
        # Catch any other exceptions and return an error message
        logging.error(f"Error occurred: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500
