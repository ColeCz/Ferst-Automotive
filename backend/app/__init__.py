from flask import Flask
from flask_cors import CORS

import app.db
import app.main
import app.auth
import app.vehicle


def create_app():
    app = Flask(__name__)
    CORS(app)

    db.init_pool(app)

    app.secret_key = "2a678c251a30e17249729a70012c88445cb117ba1e74d2c475c0186cd3a06053"

    app.register_blueprint(main.blueprint)
    app.register_blueprint(auth.blueprint, url_prefix="/auth")
    app.register_blueprint(vehicle.blueprint, url_prefix="/vehicle")

    return app
