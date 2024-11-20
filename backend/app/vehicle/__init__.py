from flask import Blueprint

blueprint = Blueprint("vehicle", __name__)

from . import routes