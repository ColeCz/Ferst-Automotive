from importlib.resources import files

query_root = files(__package__).joinpath("queries")


def get_query(name: str) -> str | None:  # | None:
    try:
        with query_root.joinpath(f"{name}.sql").open(mode="r") as file:
            return file.read()
    except FileNotFoundError:
        return None
