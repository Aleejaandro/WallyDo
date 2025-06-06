# procesador_frases.py

from utils.preprocesamiento import quitar_tildes, corregir_ortografia, normalizar_texto
from tools.temporales import detectar_fecha_y_hora, limpiar_frase_de_temporalidades
from minimodelos.det_categoria import predecir_categoria
from minimodelos.det_intencion import detectar_intencion
from tools.estado_tarea import detectar_estado_tarea, mover_a_completadas, limpiar_estado_de_frase
from tools.generador_titulo import generar_titulo_resumen
from datetime import datetime
from tools.notion import crear_payload_notion_tarea, enviar_a_notion
import uuid
from tools.extraer_accion import extraer_accion_desde_titulo
from tools.voz_a_texto import escuchar_microfono
from tools.texto_a_voz import responder_con_voz
import sys


# Detección de la intención de la frase

def procesar_frase(frase_usuario):
    """
    Procesa la frase recibida y actúa en función de la intención detectada.
    """
    print(f"\nFrase: {frase_usuario}")

    # 1. Preprocesamiento inicial
    frase_sin_tildes = quitar_tildes(frase_usuario.lower())
    frase_corregida = corregir_ortografia(frase_sin_tildes)
    frase_normalizada = normalizar_texto(frase_corregida)

    # 2. Detectar intención
    intencion_detectada = detectar_intencion(frase_normalizada)
    print(f"[DEBUG] Intención detectada: {intencion_detectada}")

    # 3. Ejecutar flujo según intención
    if intencion_detectada == "crear_tarea":
        resultado_tarea = crear_tarea(frase_usuario, frase_normalizada)

        if (
            not resultado_tarea
            or not isinstance(resultado_tarea, tuple)
            or len(resultado_tarea) != 2
            or not isinstance(resultado_tarea[0], dict)
        ):
            print("⚠️ Resultado de crear_tarea inválido:", resultado_tarea)
            return {"mensaje_voz": "⚠️ No se pudo crear la tarea. Verifica la frase."}

        resultado, _ = resultado_tarea

        return {
            "mensaje_voz": f"Tarea creada: {resultado['titulo']}",
            "intencion": "crear_tarea",
            "titulo": resultado["titulo"],
            "fecha": resultado["fecha"],
            "hora": resultado["hora"],
            "categoria": resultado["categoría"],
            "estado": resultado["estado"]
        }

    elif intencion_detectada == "crear_recordatorio":
        print("accion: recordatorio")
        print("🔔 Aquí se crearía un recordatorio.")
        return {"mensaje_voz": "Esto es un recordatorio."}

    elif intencion_detectada == "eliminar_tarea":
        print("accion: eliminar")
        print("🗑️ Aquí se eliminaría una tarea.")

    elif intencion_detectada == "modificar_tarea":
        print("accion: modificar")
        modificar_tarea(frase_usuario, frase_corregida)

    elif intencion_detectada == "consultar_tarea":
        print("accion: consultar")
        print("📅 Aquí se mostraría la agenda o tareas pendientes.")

    elif intencion_detectada == "completar_tarea":
        print("accion: completar")
        estado_detectado = detectar_estado_tarea(frase_normalizada)

        if estado_detectado == "completada":
            print("✅ Tarea detectada como completada. Se movería a la base de datos de completadas.")
        elif estado_detectado == "en curso":
            print("🕐 Tarea en curso. Estado actualizado.")
        else:
            print("⚠️ No se reconoció un cambio claro de estado.")

        return {"mensaje_voz": "Tarea marcada como completada."}

    elif intencion_detectada == "recurrente":
        print("accion: recurrente")
        print("🔁 Aquí se configuraría una tarea recurrente.")

    else:
        print("❌ Intención no reconocida")
        return {"mensaje_voz": "❌ No entendí esa frase. Intenta con otra diferente."}

    


def crear_tarea(frase_original, frase_corregida):
    # 1. Limpieza temporal y detecciones
    frase_limpia = limpiar_frase_de_temporalidades(frase_corregida)
    fecha, hora, alerta = detectar_fecha_y_hora(frase_corregida)
    categoria_detectada = predecir_categoria(frase_limpia)
    
    # 2. Detectar estado si se menciona, si no por defecto.
    estado_detectado = detectar_estado_tarea(frase_limpia)
    if estado_detectado == "desconocido":
        estado_detectado = "Sin empezar"
    frase_para_titulo = limpiar_estado_de_frase(frase_limpia)
    
    # 3. Generar título usando OpenAI
    titulo_generado = generar_titulo_resumen(frase_para_titulo)

    # 4. 🔹 Parte visible para el usuario (app / Notion)
    tarea_visual = {
        "titulo": titulo_generado,
        "fecha": fecha,
        "hora": hora,
        "categoría": categoria_detectada,
        "estado": estado_detectado
    }
    print("📬 Payload a Notion:", tarea_visual)
    payload = crear_payload_notion_tarea(titulo=tarea_visual["titulo"],
                                         fecha=tarea_visual["fecha"],
                                         hora=tarea_visual["hora"],
                                         categoria=tarea_visual["categoría"],
                                         estado=tarea_visual["estado"]
                                         )
    enviar_a_notion(payload)

    # 3. 🔒 Parte interna de WallyDo para aprendizaje y sugerencias
    id_tarea = str(uuid.uuid4()) 
    tarea_interna = {
        "id": id_tarea,
        "frase_original": frase_original,
        "frase_limpia": frase_limpia,
        "accion" : extraer_accion_desde_titulo(titulo_generado), # se extraerá a partir del título luego
        "titulo_generado": titulo_generado,
        "timestamp_creacion": datetime.now().isoformat(), 
        "categoria": categoria_detectada,
        "estado": estado_detectado,
        "historial_usuario": []  # estructura preparada para futuro
    }

    # Mostrar resumen (puedes imprimir o guardar)
    print("\n📝 Tarea para el usuario:")
    for k, v in tarea_visual.items():
        print(f"{k}: {v}")

    print("\n🧠 Datos internos para WallyDo:")
    for k, v in tarea_interna.items():
        print(f"{k}: {v}")
        
    return tarea_visual, tarea_interna       
        
def modificar_tarea(frase_original, frase_corregida):
    """
    Modifica el estado de una tarea si se detecta una indicación clara.
    """
    frase_limpia = limpiar_frase_de_temporalidades(frase_corregida)
    nuevo_estado = detectar_estado_tarea(frase_limpia)

    if nuevo_estado == "desconocido":
        print("⚠️ No se reconoció un estado válido en la frase.")
        return

    # Simulación de una tarea ya existente que será modificada
    tarea_modificada = {
        "frase_original": frase_original,
        "frase_limpia": frase_limpia,
        "fecha": "Fecha no especificada",
        "hora": "Hora no especificada",
        "accion": "accion_dummy",
        "categoria": "Personal",
        "intencion": "modificar_tarea",
        "estado": nuevo_estado,
        "alerta": None
    }

    if nuevo_estado == "completada":
        mover_a_completadas(tarea_modificada)
    else:
        print(f"✏️ Estado actualizado a: {nuevo_estado}")
        print("📌 Tarea modificada:")
        for k, v in tarea_modificada.items():
            print(f"{k}: {v}")



def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--voz":
        print("🎤 Modo voz activado. Habla cuando quieras...")
        frase_usuario = escuchar_microfono()
        if not frase_usuario or not frase_usuario.strip():  # Verifica si es None o vacío
            print("❌ No se detectó voz. Intenta de nuevo.")
            return
        print(f"🗣️ Frase detectada: {frase_usuario}")
    else:
        frase_usuario = input("💬 Escribe una frase para WallyDo: ")

    # Procesar la frase y obtener mensaje de voz
    resultado = procesar_frase(frase_usuario)

    # Hablar si se detectó algo válido
    mensaje = resultado.get("mensaje_voz", "He entendido tu frase.")
    responder_con_voz(mensaje)


if __name__ == "__main__":
    main()
