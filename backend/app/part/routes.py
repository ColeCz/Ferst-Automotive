import psycopg
from flask import request, redirect, jsonify
from app import db
from . import blueprint


@blueprint.route("/add-parts-order", methods=['POST'])
def add_parts_order(vendor_name):
    vehicle_vin = request.args.get('vehicle_vin')

    with psycopg.connect(db.get_connection_info()) as con:
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

            return jsonify({"vehicle_vin": vehicle_vin, "order_num": order_num})


@blueprint.route("/add-part", methods=['POST'])
def add_part(vendor_id):
    # get last part order for the vin
    vehicle_vin = request.args.get('vehicle_vin')
    order_num = request.args.get('order_num')

    part_number = request.form.get('part_number')
    unit_price = request.form.get('unit_price')
    part_description = request.form.get('part_description')
    quantity = request.form.get('quantity')

    with psycopg.connect(db.get_connection_info()) as con:
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

            return jsonify({'success': True})


