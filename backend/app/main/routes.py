from app import db
from . import blueprint


@blueprint.route("/")
def root():
    return "Hello World!"

@blueprint.route("/ping")
def ping():
    con = db.get_connection()

    with con.cursor() as cur:
        return cur.execute(db.get_query("ping")).fetchone()[0]
