# tools/notion_utils.py
from datetime import datetime
from zoneinfo import ZoneInfo  
import os
import requests
from dotenv import load_dotenv

load_dotenv()

NOTION_API_KEY = os.getenv("NOTION_API_KEY")
NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID")  # Lo pondrás en tus variables de entorno

HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28"
}


def combinar_fecha_hora_iso(fecha_str: str, hora_str: str) -> str:
    """
    Combina fecha y hora en formato ISO ajustado a UTC usando la zona horaria local (Europe/Madrid).
    """
    if "Fecha no especificada" in fecha_str or "Hora no especificada" in hora_str:
        return None

    try:
        local_dt = datetime.strptime(f"{fecha_str} {hora_str}", "%d/%m/%Y %H:%M")
        local_dt = local_dt.replace(tzinfo=ZoneInfo("Europe/Madrid"))
        utc_dt = local_dt.astimezone(ZoneInfo("UTC"))
        return utc_dt.isoformat()
    except Exception as e:
        print(f"[ERROR FECHA ISO] {e}")
        return None


def crear_payload_notion_tarea(titulo: str, fecha: str, hora: str, categoria: str, estado: str) -> dict:
    """
    Construye el payload que se enviará a Notion.
    Incluye: Tarea (title), Fecha (date), Categoría (multi_select) y Estado (multi_select).
    """
    fecha_iso = combinar_fecha_hora_iso(fecha, hora)

    properties = {
        "Tarea": {
            "title": [
                {
                    "text": {"content": titulo}
                }
            ]
        },
        "Categoría": {
            "multi_select": [
                {"name": categoria}
            ]
        },
        "Estado": {
            "multi_select": [
                {"name": estado}
            ]
        }
    }

    if fecha_iso:
        properties["Fecha"] = {
            "date": {
                "start": fecha_iso
            }
        }

    return {
        "parent": {"database_id": NOTION_DATABASE_ID},
        "properties": properties
    }


def enviar_a_notion(payload):
    """
    Envía el payload JSON a la API de Notion para crear una página.
    """
    url = "https://api.notion.com/v1/pages"
    response = requests.post(url, headers=HEADERS, json=payload)

    if response.status_code == 200:
        print("✅ Tarea enviada correctamente a Notion.")
    else:
        print(f"❌ Error al enviar a Notion: {response.status_code} - {response.text}")

