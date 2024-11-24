import datetime

from flask import request
from flask import session

from . import blueprint
from app import auth
from app import db
from datetime import datetime


def query_db(query_name: str, query_parameters: dict = None):
    conn = db.get_connection()

    try:
        with conn.cursor() as cur:
            cur.execute(db.get_query(query_name), query_parameters)
            result = cur.fetchall()
            return result if result else None
    except Exception as e:
        return f"Error: {e}"


def validate_year(year=None):
    if year:
        try:
            year = int(year)
            if year > datetime.now().year + 1:
                return {"error": f"Vehicles of year {year} have not been made yet"}
        except ValueError:
            return {"error": "Invalid year format, year must be a number"}
    return None


# route for searching vehicles, for all permissions
@blueprint.route("/", methods=["GET"])
def search_vehicles():

    # get all front-end parameters that will be used in the queries
    keyword = request.args.get("keyword", None)
    keyword = (
        f"%{keyword}%" if keyword else None
    )  # handle concatenation in python to avoid psycopg errors
    parameters = {
        "vin": request.args.get("vin"),
        "vehicle_type": request.args.get("vehicle_type"),
        "year": request.args.get("year"),
        "color": request.args.get("color"),
        "manufacturer": request.args.get("manufacturer"),
        "fuel_type": request.args.get("fuel_type"),
        "keyword": keyword,
        "search_filter": request.args.get("search_filter"),
    }

    # ensure year is valid (likely handled in frontend as well)
    validation_result = validate_year(parameters.get("year"))
    if validation_result:
        return validation_result

    # ensure only employees search with vin (likely handled in frontend as well)
    if parameters["vin"]:
        if not (
            auth.has_role("manager")
            or auth.has_role("clerk")
            or auth.has_role("salesperson")
            or auth.has_role("owner")
        ):
            return {"error": "Only employees can search with VIN"}

    # manager/owner/clerk priveleged search
    if auth.has_role("manager") or auth.has_role("owner") or auth.has_role("clerk"):
        print("User has privileged role")  # Debug log
        vehicles_awaiting_parts_count = query_db("count-pending-parts-vehicles")
        print(f"Parts count query result: {vehicles_awaiting_parts_count}")  # Debug log

        # filtered search/clerk search
        if parameters.get("search_filter") == "unsold" or auth.has_role("clerk"):
            matching_vehicles = query_db("search-vehicles-unsold", parameters)
        elif parameters.get("search_filter") == "sold":
            matching_vehicles = query_db("search-vehicles-sold", parameters)
        else:
            matching_vehicles = query_db("search-vehicles-all", parameters)

    # nonpriveleged search for users/salespeople
    else:
        matching_vehicles = query_db("search-vehicles", parameters)
        vehicles_awaiting_parts_count = None  # not returned on general search

    available_vehicles_count = query_db("count-available-vehicles")  # returned for all

    return {
        "matching_vehicles": matching_vehicles,
        "available_vehicles_count": available_vehicles_count,
        "vehicles_awaiting_parts_count": vehicles_awaiting_parts_count,
    }


# searches business or individual, used by clerks to add vehicles
@blueprint.route("/search-customers", methods=["GET"])
def search_customer():

    parameters = {"ssn": request.args.get("ssn"), "tin": request.args.get("tin")}

    customer = None
    if parameters.get("ssn"):
        customer = query_db("search-individual", parameters)
        if customer:
            # Transform to match frontend expected format
            customer = customer[0] if isinstance(customer, list) else customer
    elif parameters.get("tin"):
        customer = query_db("search-business", parameters)
        if customer:
            customer = customer[0] if isinstance(customer, list) else customer
    else:
        return {"error": "Must enter TIN or SSN to search"}

    return {"customer": customer}
