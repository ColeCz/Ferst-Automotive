from flask import session


def get_username() -> str:
    return session.get("username")
