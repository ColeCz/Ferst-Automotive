from . import blueprint
import datetime
from flask import jsonify, request, session
import psycopg

DB_HOST = 'db'  
DB_PORT = '5432'
DB_NAME = 'dealership'
DB_USER = 'dealership'
DB_PASSWORD = 'dealership'

def connect_db():
    try:
        conn = psycopg.connect(host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD)
        return conn
    except Exception as e:
        return f"Error: {e}"
    
def query_db(path_to_query, query_parameters=None):
    conn = connect_db()
    try:
        with open(path_to_query, 'r') as file:
            query = file.read()

        with conn.cursor() as cur:
            cur.execute(query, query_parameters)
            result = cur.fetchall()
            return result if result else None
    except Exception as e:
        return f"Error: {e}"
    finally: conn.close()
    

# route for searching vehicles, for all permissions
@blueprint.route('/', methods=['GET'])
def search_vehicles():
    # TODO check that filtered search .sql files are correct, they don't seem to allow searching with all parameters
    # TODO create modified 'search-vehicles.sql' file that returns count of search
    # TODO test route

    # get all front-end parameters that will be used in the queries
    parameters = {
        'vin': request.args.get('vin'), 
        'vehicle_type': request.args.get('vehicle_type'),
        'year': request.args.get('year'),
        'color': request.args.get('color'),
        'manufacturer': request.args.get('manufacturer'),
        'fuel_type': request.args.get('fuel_type'),
        'description': request.args.get('description'),
        'search_filter': request.args.get('search_filter')
    }

    # ensure year is valid (likely handled in frontend as well)
    year = request.args.get('year')
    if year and int(year) > datetime.now().year + 1:
        return jsonify({"error": f"Vehicles of year {year} have not been made yet"})

    # ensure only employees search with vin (likely handled in frontend as well)
    if parameters['vin']:
        if not (session.get('manager') or session.get('clerk') or session.get('salesperson') or session.get('owner')):
            return jsonify({"error": "Only employees can search with VIN"})
        
    # manager/owner priveleged search
    if session.get('manager') or session.get('owner'):
        available_vehicles_count = query_db('app/db/queries/count-available-vehicles.sql')
        vehicles_awaiting_parts_count = query_db('app/db/queries/count-pending-parts-vehicles.sql')
        matching_vehicles_count = None  # not returned on manager/owner search

        if session.get('search_filter') == "unsold":
            matching_vehicles = query_db('app/db/queries/search-vehicles-unsold.sql', parameters)   # TODO check query select statement
        elif session.get('search_filter') == "sold":
            matching_vehicles = query_db('app/db/queries/search-vehicles-sold.sql', parameters)     # TODO check query select statement
        else:
            matching_vehicles = query_db('app/db/queries/search-vehicles-all.sql', parameters)      # TODO check query select statement

    # clerk priveleged search (likely combining with owner/manager search)
    elif session.get('clerk'): 
        matching_vehicles = query_db('app/db/queries/search-vehicles-unsold.sql')
        available_vehicles_count = query_db('app/db/queries/count-available-vehicles.sql')
        vehicles_awaiting_parts_count = query_db('app/db/queries/count-pending-parts-vehicles.sql')
        matching_vehicles_count = None  # not returned on clerk search

    # nonpriveleged search for users/salespeople
    else:
        matching_vehicles = query_db('app/db/queries/search-vehicles.sql')
        matching_vehicles_count = query_db('app/db/queries/count-matching-vehicles.sql')            # TODO create this query
        available_vehicles_count = None       # not returned on general search
        vehicles_awaiting_parts_count = None  # not returned on general search

    return jsonify({
        "matching_vehicles": matching_vehicles,
        "available_vehicles_count": available_vehicles_count,
        "vehicles_awaiting_parts_count": vehicles_awaiting_parts_count,
        "matching_vehicles_count": matching_vehicles_count
    })

