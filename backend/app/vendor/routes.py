import psycopg
from flask import request, redirect, jsonify
from app import auth
from app import db
from . import blueprint

# searches for and returns a list of matching vendors using wildcards
@blueprint.route("/search", methods=['GET'])
def search_vendor():
    if not auth.is_logged_in():
        return {"success": False, "message": "User is not logged in"}

    vendor_search_name = '%' + request.args.get('vendor_search_name') + '%'

    con = db.get_connection()

    with con.cursor() as cur:
        # query the database for matching vendors
        cur.execute(db.get_query('search-vendor'), {'vendor_search_name': vendor_search_name})

        matching_vendors = cur.fetchall()

        if not matching_vendors:
            return {"success": False, "message": "No matching vendors found"}
        else:
            return matching_vendors

# for generally displaying info about the vendor on the frontend
@blueprint.route("/get", methods=['GET'])
def get_vendor():
    if not auth.is_logged_in():
        return {"success": False, "message": "User is not logged in"}

    vendor_name = request.args.get('vendor_name')

    con = db.get_connection()

    with con.cursor() as cur:
        # query the database for matching vendors
        cur.execute(db.get_query('get-vendor-details'), {'vendor_name': vendor_name})

        vendor_details = cur.fetchone()

        if not vendor_details:
            return {"success": False, "message": "Vendor not found"}
        else:
            return vendor_details

@blueprint.route("/add", methods=['POST'])
def add_vendor():
    if not auth.is_logged_in():
        return {"success": False, "message": "User is not logged in"}

    vendor_name = request.form.get('vendor_name')
    phone_num = request.form.get('phone_num')
    street = request.form.get('street')
    city = request.form.get('city')
    state_abbrv = request.form.get('state_abbrv')
    postal_code = request.form.get('postal_code')

    con = db.get_connection()

    with con.cursor() as cur:
        cur.execute(db.get_query('add-vendor'),
                    {
                        'vendor_name': vendor_name,
                        'phone_num': phone_num,
                        'street': street,
                        'city': city,
                        'state_abbrv': state_abbrv,
                        'postal_code': postal_code
                    })
        return {"success": True, "message": "Vendor added"}