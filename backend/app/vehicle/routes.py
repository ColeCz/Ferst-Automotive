import datetime
import psycopg

from flask import request
from flask import session

from . import blueprint
from app import auth
from app import db


def query_db(query_name: str, query_parameters: dict = None):
    with psycopg.connect(db.get_connection_info()) as conn:
        try:
            with conn.cursor() as cur:
                cur.execute(db.get_query(query_name), query_parameters)
                result = cur.fetchall()
                return result if result else None
        except Exception as e:
            return f"Error: {e}"
    

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
    if year and int(year) > datetime.date.today().year + 1:
        return {"error": f"Vehicles of year {year} have not been made yet"}

    # ensure only employees search with vin (likely handled in frontend as well)
    if parameters['vin']:
        if not (auth.has_role('manager') or auth.has_role('clerk') or auth.has_role('salesperson') or auth.has_role('owner')):
            return {"error": "Only employees can search with VIN"}
        
    # manager/owner priveleged search
    if auth.has_role('manager') or auth.has_role('owner'):
        available_vehicles_count = query_db('count-available-vehicles')
        vehicles_awaiting_parts_count = query_db('count-pending-parts-vehicles')
        matching_vehicles_count = None  # not returned on manager/owner search

        if session.get('search_filter') == "unsold":
            matching_vehicles = query_db('search-vehicles-unsold', parameters)   # TODO check query select statement
        elif session.get('search_filter') == "sold":
            matching_vehicles = query_db('search-vehicles-sold', parameters)     # TODO check query select statement
        else:
            matching_vehicles = query_db('search-vehicles-all', parameters)      # TODO check query select statement

    # clerk priveleged search (likely combining with owner/manager search)
    elif auth.has_role('clerk'):
        matching_vehicles = query_db('search-vehicles-unsold')
        available_vehicles_count = query_db('count-available-vehicles')
        vehicles_awaiting_parts_count = query_db('count-pending-parts-vehicles')
        matching_vehicles_count = None  # not returned on clerk search

    # nonpriveleged search for users/salespeople
    else:
        matching_vehicles = query_db('search-vehicles')
        matching_vehicles_count = query_db('count-matching-vehicles')            # TODO create this query
        available_vehicles_count = None       # not returned on general search
        vehicles_awaiting_parts_count = None  # not returned on general search

    return {
        "matching_vehicles": matching_vehicles,
        "available_vehicles_count": available_vehicles_count,
        "vehicles_awaiting_parts_count": vehicles_awaiting_parts_count,
        "matching_vehicles_count": matching_vehicles_count
    }
