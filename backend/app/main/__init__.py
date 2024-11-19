from flask import Blueprint

blueprint = Blueprint("main", __name__)

from backend.app.main import routes
