from decimal import Decimal

from flask import request
from psycopg.rows import dict_row

from app import auth
from app import db
from . import blueprint


@blueprint.route("/get")
def get():
    req_id = request.args.get("id")

    con = db.get_connection()

    with con.cursor() as cur:
        cur.execute(db.get_query("get-transaction"), {"trans_id": req_id})
        cur.row_factory = dict_row

        row = cur.fetchone()

    if row:
        row["trans_date"] = row["trans_date"].isoformat()

    return row or {}

@blueprint.route("/add", methods=["POST"])
def add():
    # if not auth.is_logged_in():
    #     return {"success": False, "message": "User is not logged in"}

    vin = request.form.get("vin")

    con = db.get_connection()
    with con.cursor() as cur:
        cur.execute(db.get_query('get-parts-cost'),
                    {
                        'vehicle_vin': vin,
                    })
        parts_cost = (cur.fetchone()[0])      # convert to int since query returns string like "007"
    con.commit()

    # Scale the sale price according to the spec
    purchase_price = Decimal(request.form.get("price"))

    params = {
        "trans_price": purchase_price,
        "customer": request.form.get("customer"),
        "vehicle_vin": vin
    }

    trans_type = request.form.get("type")
    match trans_type:
        case "PURCHASE":
            if not auth.has_role("clerk"):
                return {"success": False, "message": "User does not have clerk role"}

            query = db.get_query("add-transaction-purchase")
            params |= {
                "clerk": auth.get_username(),
                "condition": request.form.get("condition")
            }
        case "SALE":
            # if not auth.has_role("salesperson"): # TODO Uncomment after testing
            #     return {"success": False, "message": "User does not have salesperson role"}

            sale_price = purchase_price * Decimal(1.25)  # TODO does the front end pass in the price as a string?
            sale_price += parts_cost * Decimal(1.1)
            sale_price = sale_price.quantize(Decimal('0.01'))

            params['trans_price'] = sale_price

            query = db.get_query("add-transaction-sale")
            params |= {
                "salesperson": auth.get_username(),
            }
        case _:
            return {"success": False, "message": "Unknown transaction type. Valid types: 'PURCHASE', 'SALE'"}

    con = db.get_connection()

    try:
        with con.cursor() as cur:
            cur.execute(query, params)

        con.commit()
    except Exception as e:
        con.rollback()
        return {"success": False, "message": f"Error: {e}"}

    return {"success": True, "message": None}

@blueprint.route("/delete", methods=["POST"])
def delete():
    if not auth.is_logged_in():
        return {"success": False, "message": "User is not logged in"}
    elif not auth.has_role("owner"):
        return {"success": False, "message": "User does not have owner role"}

    trans_id = request.args.get("id")

    con = db.get_connection()

    try:
        with con.cursor() as cur:
            cur.execute(db.get_query("delete-transaction"), {"trans_id": trans_id})
            rowcount = cur.rowcount

        con.commit()
    except Exception as e:
        con.rollback()
        return {"success": False, "message": f"Error: {e}"}

    if rowcount > 0:
        return {"success": True, "message": None}
    else:
        return {"success": False, "message": f"Transaction with id {trans_id} not found"}

@blueprint.route("/validate-for-sale", methods=["GET"])
def validate_for_sale():
    # if not auth.is_logged_in():
    #     return {"success": False, "message": "User is not logged in"}

    request.args.get("vin")
    query = db.get_query("validate-for-sale")

    params = {
        "vin": request.args.get("vin")
    }

    con = db.get_connection()
    try:
        with con.cursor() as cur:
            cur.execute(query, params)
            sale_price_valid = cur.fetchone()

            if sale_price_valid:
                return {"success": True, "message": "Vehicle is for sale"}
            else:
                return {"success": False, "message": "Vehicle not for sale"}

        con.commit()
    except Exception as e:
        con.rollback()
        return {"success": False, "message": f"Error: {e}"}
