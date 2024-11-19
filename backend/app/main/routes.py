import psycopg
print(psycopg.__version__)

from backend.app import db
from backend.app.main import blueprint


@blueprint.route("/")
def root():
    return "Hello World!"

@blueprint.route("/ping")
def ping():
    with psycopg.connect(db.get_connection_info()) as con:
        with con.cursor() as cur:
            return cur.execute(db.get_query("ping")).fetchone()[0]
