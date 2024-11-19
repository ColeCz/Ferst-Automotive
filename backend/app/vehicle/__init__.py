from flask import Blueprint

blueprint = Blueprint("vehicle", __name__)

from backend.app.vehicle import routes