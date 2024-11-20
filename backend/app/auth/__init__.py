from flask import Blueprint

blueprint = Blueprint("auth", __name__)

from . import routes

from .has_role import has_role
from .is_logged_in import is_logged_in
