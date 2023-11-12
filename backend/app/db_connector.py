import psycopg2
from psycopg2 import sql

from . import db_connection_params


def delete_object(table: str, idobject: int):
    with psycopg2.connect(**db_connection_params) as connection:
        cursor = connection.cursor()

        delete_query = sql.SQL(f"DELETE FROM {table} WHERE id{table} = %s")

        cursor.execute(delete_query, (idobject,))
        connection.commit()