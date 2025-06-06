import spacy
from sentence_transformers import SentenceTransformer, util

# Carga SpaCy en español
nlp = spacy.load("es_core_news_md")

# Carga el modelo de embeddings
modelo_embeddings = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Lista extendida de acciones comunes
acciones_candidatas = [
    # Organización y gestión
    "organizar", "planificar", "anotar", "programar", "agendar", "recordar", "gestionar", "configurar", "revisar",

    # Comunicación
    "llamar", "enviar", "escribir", "contestar", "consultar", "responder", "avisar", "preguntar",

    # Estudio y trabajo
    "leer", "estudiar", "investigar", "resumir", "preparar", "editar", "evaluar", "repasar", "entregar", "asistir",

    # Salud y autocuidado
    "entrenar", "meditar", "descansar", "correr", "caminar", "relajar", "cocinar", "comer", "hidratar", "dormir",

    # Finanzas
    "pagar", "facturar", "revisar", "ahorrar", "comprar", "vender", "invertir", "cobrar",

    # Casa y tareas domésticas
    "limpiar", "ordenar", "lavar", "planchar", "organizar", "reponer", "revisar", "arreglar", "preparar",

    # Transporte y logística
    "viajar", "conducir", "llevar", "recoger", "reservar", "comprar", "coordinar", "buscar", "enviar",

    # Tecnología
    "instalar", "actualizar", "descargar", "subir", "probar", "reiniciar", "configurar", "sincronizar",

    # Personal / ocio
    "visitar", "salir", "ver", "disfrutar", "jugar", "escuchar", "verificar", "celebrar", "felicitar", "cuidar",

    # Otros comunes
    "pedir", "notar", "decidir", "leer", "hacer", "crear", "construir", "renovar"
]


def extraer_accion_desde_titulo(titulo: str) -> str:
    """
    Extrae el verbo principal (acción) desde el título generado por OpenAI.
    Usa SpaCy y embeddings como respaldo.
    """
    doc = nlp(titulo.lower())

    # 1. Buscar primer verbo en infinitivo con SpaCy
    for token in doc:
        if token.pos_ == "VERB" and token.tag_ == "VMN0000":  # infinitivo
            return token.lemma_

    # 2. Si no se detectó con SpaCy, usar embeddings
    embedding_titulo = modelo_embeddings.encode(titulo, convert_to_tensor=True)
    embedding_acciones = modelo_embeddings.encode(acciones_candidatas, convert_to_tensor=True)

    similitudes = util.cos_sim(embedding_titulo, embedding_acciones)[0]
    mejor_idx = similitudes.argmax().item()
    return acciones_candidatas[mejor_idx]


  