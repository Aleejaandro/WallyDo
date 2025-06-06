# tools/texto_a_voz.py

import asyncio
import edge_tts
import tempfile
import os
from playsound import playsound


def responder_con_voz(texto: str):
    # Reproducción de voz desactivada: se gestiona desde el frontend
    pass



"""
async def reproducir_voz(texto: str, voz: str = "es-ES-AlvaroNeural", velocidad: str = "+0%"):
    comunicador = edge_tts.Communicate(text=texto, voice=voz, rate=velocidad)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
        output_file = tmp.name
    await comunicador.save(output_file)
    playsound(output_file)
    os.remove(output_file)

async def responder_con_voz(texto: str):
    await reproducir_voz(texto)
"""