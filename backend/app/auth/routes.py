from flask import request
from flask import session
from psycopg.rows import dict_row

from . import blueprint
from app.db import get_connection
from app.db import get_query

@blueprint.route("/login", methods=["POST"])
def login():
    if request.form.get("username") is None or request.form.get("password") is None:
        return {"success": False, "message": "Username or password is missing"}

    con = get_connection()

    with con.cursor() as cur:
        cur.row_factory = dict_row

        cur.execute(get_query("authenticate-user"), {
            "username": request.form.get("username").lower(),
            "password": request.form.get("password")
        })

        auth_row = cur.fetchone()

        if not auth_row:
            return {"success": False, "message": "Username or password is incorrect"}

        cur.execute(get_query("get-user-type"), {
            "username": auth_row["username"]
        })

        group_row = cur.fetchone()

    session.clear()

    session["username"] = auth_row["username"]
    session["roles"] = {
        "clerk": group_row["isclerk"],
        "salesperson": group_row["issalesperson"],
        "manager": group_row["ismanager"],
        "owner": auth_row["username"] == "owner"
    }

    return {"success": True, "message": ""}

@blueprint.route("/logout", methods=["POST"])
def logout():
    session.clear()

    return {"success": True, "message": ""}

@blueprint.route("/session")
def get_session():
    return {
        "username": session.get("username"),
        "roles": session.get("roles")
    }
