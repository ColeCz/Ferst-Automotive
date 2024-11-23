from flask import session


def is_logged_in() -> bool:
    return session.get("username") is not None
