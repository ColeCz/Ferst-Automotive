from flask import Flask, jsonify, request
from app.vehicle import blueprint
import psycopg

'''
I'm not done with the search_vehicles route, I just wanted to show a start on the routes. I'll pick up the pace greatly now that
I'm caught up on flask. 

Here are some changes I'll make today...
    - restricted views (likely handled in another route, Idk yet)
    - column and variable names not fully matching
    - add more error handling
    - check and test functionality
'''

# connection details
DB_HOST = 'db'  
DB_NAME = 'postgres'
DB_USER = 'postgres'
DB_PASSWORD = 'postgres'


# reusable connection
def connect_db():
    try:
        conn = psycopg.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASSWORD)
        return conn
    except Exception as e:
        print(f"Error: {e}")
        return None

@blueprint.route('/homepage', methods=['GET'])
def show_vehicles():

    parameters = {
        'vin': request.args.get('vin'),
        'year': request.args.get('year'),
        'color': request.args.get('color'),
        'manufacturer': request.args.get('manufacturer'),
        'vehicle_type': request.args.get('vehicle_type'),
        'fuel_type': request.args.get('fuel_type'),
        'description': request.args.get('description')                  # aka keyword
    }

    with open('app/sql_queries/vehicle_search.sql', 'r') as file:
        query = file.read()

    conn = connect_db()
    cur = conn.cursor()
    cur.execute(query, parameters)
    results = cur.fetchall()
    conn.close()

    return jsonify(results)     # will format later
