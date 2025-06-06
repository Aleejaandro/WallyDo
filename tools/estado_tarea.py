# estado_tarea.py
import json
import os
import re

# Expresiones comunes por estado
EXPRESIONES_ESTADO = {
    "completada": [
        r"(tarea\s)?(completad[ao]|hecho|terminad[ao]|acabado|resuelto)",
        r"(ya )?(la )?termin[ée]",
        r"(ya )?est[aá] (hecha|completa|resuelta)"
    ],
    "en curso": [
        r"(est[oyá] )?(haciendo|trabajando en|desarrollando|empezando|realizando)",
        r"(aún )?(no )?he (terminado|acabado)",
        r"llevo (algo|poco|mucho|parte) hecho",
        r"en progreso",
        r"ya (he empezado|comencé|inicié)"
    ],
    "sin empezar": [
        r"(aún|todav[iaía]) no (empiezo|he empezado|inicio|iniciado)",
        r"no he (hecho|comenzado|arrancado) (la )?tarea",
        r"no (empezad[ao]|iniciado|arrancado)"
    ]
}

def detectar_estado_tarea(frase_limpia):
    """
    Detecta el estado de una tarea a partir de expresiones comunes en la frase.
    Retorna: "completada", "en curso", "sin empezar" o "desconocido"
    """
    for estado, patrones in EXPRESIONES_ESTADO.items():
        for patron in patrones:
            if re.search(patron, frase_limpia, re.IGNORECASE):
                return estado
    return "desconocido"

def limpiar_estado_de_frase(frase: str) -> str:
    """
    Elimina menciones al estado como 'en progreso', 'completada', etc. antes de pasar a OpenAI.
    """
    frase_limpia = frase
    for patrones in EXPRESIONES_ESTADO.values():
        for patron in patrones:
            frase_limpia = re.sub(patron, '', frase_limpia, flags=re.IGNORECASE)
    return ' '.join(frase_limpia.split())


def mover_a_completadas(tarea, ruta_base="data/completadas"):
    """
    Guarda la tarea completada en una base de datos específica por categoría.
    """
    categoria = tarea.get("categoria", "General").lower()
    categorias_validas = ["deporte", "estudio", "personal", "salud", "trabajo"]
    if categoria not in categorias_validas:
        categoria = "general"

    nombre_archivo = f"{ruta_base}/{categoria}_completadas.json"

    # Crear carpeta si no existe
    os.makedirs(ruta_base, exist_ok=True)

    # Cargar tareas existentes
    if os.path.exists(nombre_archivo):
        with open(nombre_archivo, "r", encoding="utf-8") as f:
            tareas = json.load(f)
    else:
        tareas = []

    # Añadir la nueva tarea completada
    tareas.append(tarea)

    # Guardar el archivo
    with open(nombre_archivo, "w", encoding="utf-8") as f:
        json.dump(tareas, f, ensure_ascii=False, indent=2)

    print(f"[✔️] Tarea movida a completadas/{categoria}_completadas.json")

# Para adaptar a MongoDB o base externa:
# - Reemplaza el guardado en JSON por una inserción en la colección correspondiente.
# - Usa la categoría como filtro para agrupar si es necesario.
