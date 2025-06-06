# tools/voz_a_texto.py

import torch
import sounddevice as sd
from transformers import pipeline
import uuid
import os
import whisper

device = "cuda:0" if torch.cuda.is_available() else "cpu"

# 1. Transcripción local desde micrófono con sounddevice (modo CLI)
pipe = pipeline(
    "automatic-speech-recognition",
    model="openai/whisper-small",
    device=0 if "cuda" in device else -1,
)

def escuchar_microfono(duracion_segundos=5, frecuencia_muestreo=16000):
    """
    Captura audio desde el micrófono y lo convierte a texto.
    """
    print("🎤 Escuchando...")

    audio = sd.rec(
        int(duracion_segundos * frecuencia_muestreo),
        samplerate=frecuencia_muestreo,
        channels=1,
        dtype="float32"
    )
    sd.wait()

    audio_tensor = torch.tensor(audio.squeeze())
    audio_np = audio_tensor.cpu().numpy() if audio_tensor.is_cuda else audio_tensor.numpy()

    transcription = pipe(audio_np)
    transcribed_text = transcription.get("text", "").strip()

    if not transcribed_text:
        print("❌ No se detectó voz o la transcripción está vacía.")
        return None

    print("📝 Transcripción:", transcribed_text)
    return transcribed_text


# Carga del modelo solo una vez
whisper_model = whisper.load_model("small")

# Ruta segura para los temporales dentro del proyecto
RUTA_TEMP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "temp_audios"))
os.makedirs(RUTA_TEMP_DIR, exist_ok=True)

def transcribir_audio_memoria(audio_bytes: bytes) -> str:
    # Generar nombre único para el archivo
    nombre_archivo = f"temp_{uuid.uuid4().hex}.mp4"
    ruta_temp = os.path.join(RUTA_TEMP_DIR, nombre_archivo)

    # Escribir el archivo temporal de forma segura
    with open(ruta_temp, "wb") as f:
        f.write(audio_bytes)

    print(f"🧠 Transcribiendo desde: {ruta_temp}")

    try:
        result = whisper_model.transcribe(ruta_temp)
        return result.get("text", "").strip()
    except Exception as e:
        print("❌ Error transcribiendo audio:", e)
        return ""
    finally:
        try:
            os.remove(ruta_temp)
            print(f"🧹 Archivo temporal eliminado: {ruta_temp}")
        except Exception as e:
            print(f"⚠️ No se pudo eliminar el archivo temporal: {e}")