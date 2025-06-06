import unicodedata
from language_tool_python import LanguageTool, utils


# Inicializa LanguageTool para español
tool = LanguageTool('es')

def quitar_tildes(texto):
    return ''.join((c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn'))

def corregir_ortografia(frase):
    """
    Corrige errores ortográficos en la frase dada.
    """
    return utils.correct(frase, tool.check(frase))

def normalizar_texto(texto):
    """
    Aplica una normalización básica: pasa a minúsculas, quita tildes y espacios extra.
    """
    texto = texto.lower()
    texto = quitar_tildes(texto)
    texto = texto.strip()
    return texto

# --- FUNCIONES OPCIONALES POR SI HACEN FALTA ---

# def eliminar_duplicados(frase):
#     """
#     Elimina palabras duplicadas seguidas (ej: "tengo que que ir").
#     """
#     palabras = frase.split()
#     resultado = [palabras[0]] if palabras else []
#     for palabra in palabras[1:]:
#         if palabra != resultado[-1]:
#             resultado.append(palabra)
#     return ' '.join(resultado)

# def limpiar_espacios(frase):
#     """
#     Elimina espacios múltiples dejando solo uno entre palabras.
#     """
#     return ' '.join(frase.split())
