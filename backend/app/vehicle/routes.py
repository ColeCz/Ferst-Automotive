import datetime

from flask import request
from flask import session

from . import blueprint
from app import auth
from app import db
from app import transaction
from datetime import datetime


def query_db(query_name: str, query_parameters: dict = None):
    conn = db.get_connection()

    try:
        with conn.cursor() as cur:
            query = db.get_query(query_name)
            print(f"\nExecuting query '{query_name}':")
            print("Query:", query)
            print("Parameters:", query_parameters)
            cur.execute(query, query_parameters)
            result = cur.fetchall()
            if result:
                print(f"Number of results: {len(result)}")
                print("First row:", result[0] if result else None)
            else:
                print("No results returned")
            return result if result else None
    except Exception as e:
        print(f"Error executing query: {e}")
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
    print("\n=== Starting Vehicle Search ===")
    print("Request args:", request.args)
    print(
        "User roles:",
        {
            "manager": auth.has_role("manager"),
            "owner": auth.has_role("owner"),
            "clerk": auth.has_role("clerk"),
            "salesperson": auth.has_role("salesperson"),
        },
    )

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

    print("Filter type:", parameters.get("search_filter"))
    print(
        "Query used:",
        (
            "search-vehicles-unsold"
            if parameters.get("search_filter") == "unsold"
            else (
                "search-vehicles-sold"
                if parameters.get("search_filter") == "sold"
                else "search-vehicles-all"
            )
        ),
    )
    print(
        "Number of matching vehicles:",
        len(matching_vehicles) if matching_vehicles else 0,
    )
    print("Raw matching vehicles data:", matching_vehicles)

    query_name = None
    if parameters.get("search_filter") == "unsold":
        query_name = "search-vehicles-unsold"
    elif parameters.get("search_filter") == "sold":
        query_name = "search-vehicles-sold"
    else:
        query_name = "search-vehicles-all"

    print(f"Using query: {query_name}")
    print(f"With parameters: {parameters}")

    print("\nFinal results:")
    print(
        f"Number of matching vehicles: {len(matching_vehicles) if matching_vehicles else 0}"
    )
    print(f"Available vehicles count: {available_vehicles_count}")
    print(f"Pending parts count: {vehicles_awaiting_parts_count}")
    print("=== End Vehicle Search ===\n")

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


@blueprint.route("/add-customer", methods=["GET"])
def add_customer():

    parameters = {
        "email": request.args.get("email"),  # optional
        "phone_num": request.args.get("phone_num"),
        "postal_code": request.args.get("postal_code"),
        "state_abbrv": request.args.get("state_abbrv"),
        "city": request.args.get("city"),
        "street": request.args.get("street"),
        "ssn": request.args.get("ssn"),
        "firstname": request.args.get("firstname"),
        "lastname": request.args.get("lastname"),
        "tin": request.args.get("tin"),
        "business_name": request.args.get("business_name"),
        "contact_title": request.args.get("contact_title"),
        "contact_firstname": request.args.get("contact_firstname"),
        "contact_lastname": request.args.get("contact_lastname"),
    }

    conn = db.get_connection()
    try:
        if parameters.get("ssn"):
            with conn.cursor() as cur:
                query = db.get_query("add-individual")
                cur.execute(query, parameters)
                # Get the new customer_id
                cur.execute(
                    "SELECT currval(pg_get_serial_sequence('customer', 'customer_id'))"
                )
                customer_id = cur.fetchone()[0]
                conn.commit()
            return {
                "message": "Individual customer added successfully",
                "customerId": customer_id,
            }

        elif parameters.get("tin"):
            with conn.cursor() as cur:
                query = db.get_query("add-business")
                cur.execute(query, parameters)
                # Get the new customer_id
                cur.execute(
                    "SELECT currval(pg_get_serial_sequence('customer', 'customer_id'))"
                )
                customer_id = cur.fetchone()[0]
                conn.commit()
            return {
                "message": "Business customer added successfully",
                "customerId": customer_id,
            }

        else:
            return {"error": "You must fill out every required field (all but email)"}

    except Exception as e:
        return {"error": str(e)}


@blueprint.route("/add-vehicle", methods=["POST"])
def add_vehicle():

    parameters = {
        "vin": request.form.get("vin"),
        "vehicle_type": request.form.get("vehicle_type"),
        "model_name": request.form.get("model_name"),
        "model_year": request.form.get("model_year"),
        "manufacturer": request.form.get("manufacturer"),
        "fuel_type": request.form.get("fuel_type"),
        "horsepower": request.form.get("horsepower"),
        "description": request.form.get("description"),
        "customer": request.form.get("customer_id"),
        "trans_price": request.form.get("trans_price"),
        "condition": request.form.get("condition"),
        "clerk": auth.get_username(),
    }

    for key, value in parameters.items():
        if value is None:
            return {"error": f"missing required field: {key}"}

    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            vehicle_query = db.get_query("add-vehicle")
            cur.execute(vehicle_query, parameters)
            purchase_query = db.get_query("add-transaction-purchase")
            cur.execute(purchase_query, parameters)
            conn.commit()
        return {"message": "vehicle purchased successfully"}
    except Exception as e:
        return {"error": str(e)}
