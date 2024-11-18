from app.vehicle import blueprint

@blueprint.route("/get")
def get_vehicle():
    return "Vehicle"
