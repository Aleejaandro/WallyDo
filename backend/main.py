from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import sys
import os
import uuid
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from procesador_frases import procesar_frase  # Importamos tu motor de análisis
from tools.voz_a_texto import transcribir_audio_memoria

app = FastAPI()

# Modelo de entrada para frases del usuario
class FraseUsuario(BaseModel):
    texto: str

# Modelo de datos para tareas manuales (ya lo tenías)
class Tarea(BaseModel):
    titulo: str
    fecha: str
    hora: str
    categoria: str
    estado: str

# Base de datos ficticia en memoria
tareas_db = []

@app.post("/procesar_frase")
async def endpoint_procesar_frase(data: FraseUsuario):
    resultado = procesar_frase(data.texto)
    return resultado or {"mensaje": "No se pudo procesar la frase"}

@app.post("/crear_tarea")
async def crear_tarea(tarea: Tarea):
    tarea_id = str(uuid.uuid4())
    tarea_dict = tarea.dict()
    tarea_dict["id"] = tarea_id
    tareas_db.append(tarea_dict)
    return {"mensaje": "Tarea creada", "tarea_id": tarea_id}

@app.post("/hablar")
async def endpoint_hablar(archivo: UploadFile = File(...)):
    audio_bytes = await archivo.read()

    frase_usuario = transcribir_audio_memoria(audio_bytes)
    if not frase_usuario:
        return {"error": "No se detectó voz."}

    resultado = procesar_frase(frase_usuario)
    if not resultado:
        return {"error": "La frase no pudo procesarse."}

    #  Mensaje personalizado por intención
    if resultado.get("intencion") == "crear_tarea":
        mensaje_voz = f"De acuerdo, he creado la tarea: {resultado['titulo']}"
    else:
        mensaje_voz = resultado.get("mensaje_voz", "He entendido tu frase.")

    # Respuesta en voz
    # await responder_con_voz(mensaje_voz)

    # Devolver todo al frontend
    return {
        "texto_usuario": frase_usuario,
        "mensaje_voz": mensaje_voz,
        **resultado
    }