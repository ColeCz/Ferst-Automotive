import os


def get_connection_info():
    return os.getenv("DB_URL")
