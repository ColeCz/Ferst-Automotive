import backend.app.db
import backend.app.main
import backend.app.vehicle

from flask import Flask


def create_app():
    app = Flask(__name__)

    app.register_blueprint(main.blueprint)
    app.register_blueprint(vehicle.blueprint, url_prefix="/vehicle")

    return app
