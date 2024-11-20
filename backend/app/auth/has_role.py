from flask import session


def has_role(role: str) -> bool:
    roles = session.get("roles")

    if roles is None:
        return False
    elif role not in roles:
        raise Exception(f"Invalid role passed: {role}")

    return roles.get(role)
