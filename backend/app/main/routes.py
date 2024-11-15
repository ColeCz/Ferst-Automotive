import psycopg

from app import db
from app.main import blueprint


@blueprint.route("/")
def root():
    return "Hello World!"

@blueprint.route("/ping")
def ping():
    with psycopg.connect(db.get_connection_info()) as con:
        with con.cursor() as cur:
            return cur.execute(db.get_query("ping")).fetchone()[0]
