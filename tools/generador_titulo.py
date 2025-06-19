# tools/openai_utils.py
from openai import OpenAI
import os
import spacy

# Asegúrate de tener esta variable como variable de entorno (segura)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generar_titulo_resumen(frase_limpia):
    """
    Usa la API de OpenAI para generar un título breve basado en la frase limpia sin temporalidades.
    """
    prompt = f"""
    Convierte esta frase del usuario en un título breve y claro, sin eliminar articulos necesarios, ideal para mostrar como tarea o recordatorio en una app personal. 
    Usa un verbo en infinitivo al principio (como: Llamar, Ir, Comprar, etc.). 
    Elimina expresiones como "tengo que", "debo", "voy a", pero mantén el contexto completo (lugares, destinatarios, objetos) para que no se pierda información clave.
    Elimina indicaciones temporales ni expresiones horarias.
    Frase: "{frase_limpia}"
    Título:
    """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            temperature=0.3,
            messages=[
                {"role": "system", "content": "Eres un asistente que convierte frases de usuario en títulos breves de tareas. Mantén naturalidad y claridad. Incluye artículos como 'el', 'la', 'del' si ayudan a que suene mejor. No acortes en exceso si se pierde contexto útil. Y no añadas indicaciones temporales ni expresiones horarias"},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"[ERROR OPENAI] {e}")
        return "acción_desconocida"


