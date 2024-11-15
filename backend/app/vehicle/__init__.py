from flask import Blueprint

blueprint = Blueprint("vehicle", __name__)

from app.vehicle import routes