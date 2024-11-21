import atexit

from psycopg_pool import pool
from flask import g

from . import get_connection_info


connection_pool = pool.ConnectionPool(get_connection_info(), open=False)

def init_pool(app):
    connection_pool.open()
    atexit.register(connection_pool.close)

    @app.teardown_appcontext
    def return_connection(exception):
        connection = g.pop("connection", None)

        if connection is not None:
            connection_pool.putconn(connection)

def get_connection():
    if "connection" not in g:
        g.connection = connection_pool.getconn()

    return g.connection