from . import blueprint

@blueprint.route("/get")
def get_vehicle():
    return "Vehicle"
