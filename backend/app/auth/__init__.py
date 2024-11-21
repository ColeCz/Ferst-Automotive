from flask import Blueprint

blueprint = Blueprint(__name__.split(".")[-1:], __name__)

from . import routes

from .has_role import has_role
from .is_logged_in import is_logged_in
from .get_username import get_username
