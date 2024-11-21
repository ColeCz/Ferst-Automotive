from flask import Blueprint

blueprint = Blueprint(__name__.split(".")[-1:], __name__)

from . import routes
