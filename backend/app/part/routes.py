import psycopg
from flask import request, redirect, jsonify
from app import auth
from app import db
from . import blueprint

# successfully tested with POST http://localhost:5000/part/add-parts-order?vehicle_vin=Y033F7MCLW5266860&vendor_name=Opentech
@blueprint.route("/add-parts-order", methods=['POST'])
def add_parts_order():
    if not auth.is_logged_in():
        return {"success": False, "message": "User is not logged in"}

    vehicle_vin = request.args.get('vehicle_vin')
    vendor_name = request.args.get('vendor_name')

    con = db.get_connection()

    with con.cursor() as cur:
        cur.execute(db.get_query('get-last-order-number'),
                    {
                        'vehicle_vin': vehicle_vin,
                    })
        last_order_number = int(cur.fetchone()[0])      # convert to int since query returns string like "007"
        order_num = last_order_number + 1
        order_num_str = str(order_num).zfill(3)         # convert int back to format "008"

        cur.execute(db.get_query('add-parts-order'),
                    {
                        'order_num': order_num_str,
                        'vehicle_vin': vehicle_vin,
                        'vendor_name': vendor_name
                    })

    con.commit()

    return {"success": True, "vehicle_vin": vehicle_vin, "order_num": order_num}

# successfully tested with POST on http://localhost:5000/part/add-part?vehicle_vin=Y033F7MCLW5266860&order_num=006
@blueprint.route("/add-part", methods=['POST'])
def add_part():
    if not auth.is_logged_in():
        return {"success": False, "message": "User is not logged in"}

    # get last part order for the vin
    vehicle_vin = request.args.get('vehicle_vin')
    order_num = request.args.get('order_num')

    part_number = request.form.get('part_number')
    unit_price = request.form.get('unit_price')
    part_description = request.form.get('part_description')
    quantity = request.form.get('quantity')

    con = db.get_connection()

    with con.cursor() as cur:
        cur.execute(db.get_query('add-part'),
                    {
                        'part_number': part_number,
                        'vehicle_vin': vehicle_vin,
                        'order_num': order_num,
                        'unit_price': unit_price,
                        'part_description': part_description,
                        'quantity': quantity
                    })

    con.commit()

    return {'success': True}


