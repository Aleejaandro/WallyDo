import re
from datetime import datetime, timedelta
import dateparser
import logging
from unidecode import unidecode

def quitar_tildes(texto):
    return unidecode(texto)

# Función para comprobar si un año es bisiesto
def es_bisiesto(year):
    return (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)


dias_por_mes = {
        1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30,
        7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31
    }

meses = {
            "enero": 1, "febrero": 2, "marzo": 3, "abril": 4, "mayo": 5, "junio": 6,
            "julio": 7, "agosto": 8, "septiembre": 9, "octubre": 10, "noviembre": 11, "diciembre": 12
    }

# Validar fecha considerando días imposibles
def validar_fecha(dia, mes, año):
    if mes < 1 or mes > 12 or dia < 1:
        return False

    if mes == 2 and dia == 29:
        if año is not None and not es_bisiesto(año):
            return False
    elif dia > dias_por_mes[mes]:
        return False

    return True
def generar_diccionario_numeros(hasta=100):
        unidades = [
            "", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho",
            "nueve", "diez", "once", "doce", "trece", "catorce", "quince",
            "dieciséis", "diecisiete", "dieciocho", "diecinueve"
        ]
        decenas = [
            "", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta",
            "setenta", "ochenta", "noventa"
        ]
        diccionario = {}
        for i, texto in enumerate(unidades):
            if i > hasta:
                break
            if i == 1:
                diccionario["uno"] = i
                diccionario["una"] = i
            if texto:
                diccionario[texto] = i

        for d in range(2, 10):
            if d * 10 > hasta:
                break
            diccionario[decenas[d]] = d * 10
            for u in range(1, 10):
                numero = d * 10 + u
                if numero > hasta:
                    break
                if u == 1:
                    diccionario[f"{decenas[d]} y un"] = numero
                    diccionario[f"{decenas[d]} y uno"] = numero
                    diccionario[f"{decenas[d]} y una"] = numero
                else:
                    diccionario[f"{decenas[d]} y {unidades[u]}"] = numero
                if d == 2 and u <= 5:
                    diccionario[f"veinti{unidades[u]}"] = numero

        if hasta >= 100:
            diccionario["cien"] = 100

        return diccionario

numeros_texto_a_numero = generar_diccionario_numeros()

def detectar_coletillas_horarias(frase_normalizada: str, hora_base: int, minuto_base: int, hora_actual: int, minuto_actual: int):
    """
    Detecta coletillas horarias fijas (ej. "en punto", "y cuarto", "y media", "menos cuarto")
    o generales (ej. "y veintitres", "menos diez", etc.) y devuelve (hora, minutos)
    usando como base la hora actual o la hora ya detectada.
    """
    if hora_base is None:
        hora_base = hora_actual
    if minuto_base is None:
        minuto_base = minuto_actual

    # 1. Coletillas FIJAS como "en punto", "y media", "menos cuarto"
    match_coletilla_fija = re.search(r"(en punto|y cuarto|y media|menos cuarto)", frase_normalizada)
    
    if match_coletilla_fija:
        coletilla = match_coletilla_fija.group(1)

        if coletilla == "en punto":
            nuevo_minuto = 0
        elif coletilla == "y cuarto":
            nuevo_minuto = 15
        elif coletilla == "y media":
            nuevo_minuto = 30
        elif coletilla == "menos cuarto":
            nuevo_minuto = 45
        else:
            nuevo_minuto= minuto_base

        # Ajustar la hora si ya pasó ese minuto
        nueva_hora = hora_base
        if nuevo_minuto < minuto_base:
            nueva_hora += 1

        # Si era "menos cuarto" y quieres restar una hora, puedes hacerlo
        # elif coletilla == "menos cuarto":
        #    nueva_hora -= 1

        # Ajuste si pasamos de 23
        if nueva_hora >= 24:
            nueva_hora %= 24

        return nueva_hora, min(nuevo_minuto, 59)

    # 2.Coletillas GENERALES "y cinco", "menos diez", etc.
    match_coletilla_general = re.search(r" (y|menos) (\w+|\d+)", frase_normalizada)# si añado a(?: las?)? coge la hora del pprincipio y no la coletilla 

    if match_coletilla_general:
        operador = match_coletilla_general.group(1)
        texto_minutos = match_coletilla_general.group(2)

        # Convertir el texto a número: si es dígito o buscar en el diccionario
        if texto_minutos.isdigit():
            cantidad = int(texto_minutos)
        else:
            cantidad = numeros_texto_a_numero.get(texto_minutos)

        if cantidad is not None:
            nueva_hora = hora_base
            if operador == "y":
                # Si el nuevo minuto ya pasó, subimos la hora en 1
                if cantidad < minuto_base:
                    nueva_hora += 1
                nuevo_minuto = cantidad
            elif   operador == "menos":
                nuevo_minuto = 60 - cantidad
                if nuevo_minuto <= minuto_base:
                    nueva_hora += 1
            else:
                nuevo_minuto=minuto_base
            if nueva_hora >= 24:
                nueva_hora %= 24

            return nueva_hora, min(nuevo_minuto, 59)

    # Si no se detecta ninguna coletilla
    return None, None

def detectar_fecha_y_hora(frase: str):
    hoy = datetime.now()
    hora_actual = hoy.hour
    minuto_actual = hoy.minute
    fecha = None
    hora = None
    minutos = None
    fecha_parseada = None
    preguntar_hora = False
    alerta = None
    
     # Normalizar la frase al principio
    frase_normalizada= quitar_tildes(frase.lower())

    # Bloques horarios típicos para actividades (inicio, fin)
    bloques_horarios_actividad = {
        "cenar": (20, 23),
        "desayunar": (7, 10),
        "entrenar": (7, 21),
        "reunión": (8, 18),
        "comprar": (9, 21),
        "medico": (8, 18),
        "clase": (8, 15),
        "cita": (8, 18),
        "comer": (13, 16),
        "almorzar": (13, 16),
        "merendar": (17, 19),
    }

    # ACTIVIDAD DETECTADA
    actividad_detectada = None
    for actividad in bloques_horarios_actividad.keys():
        if actividad in frase_normalizada:
            actividad_detectada = actividad
            break
        
    #============================================================
    # 📅 1) ✔️ FECHA CON FORMATO "15/04/2025" o "15/04"
    #============================================================
    
    match_fecha_slash = re.search(r"(\d{1,2})/(\d{1,2})(?:/(\d{4}))?", frase_normalizada)      
    if match_fecha_slash:
        dia = int(match_fecha_slash.group(1))
        mes = int(match_fecha_slash.group(2))
        año = int(match_fecha_slash.group(3)) if match_fecha_slash.group(3) else hoy.year
        if not validar_fecha(dia, mes, año):
          
            mes_en_texto = meses.get(mes, f"{mes} (Desconocido)")
            print(f"⚠️ Fecha inválida detectada: Día {dia}, Mes {mes} ({mes_en_texto}), Año {año}. Esa combinación no existe.")
            fecha = None
        else:
            fecha = datetime(day=dia, month=mes, year=año)
        
    #============================================================
    # 📅 2) ✔️ DETECTAR FECHAS TIPO "20 de marzo"
    #============================================================
    
    match_fecha_texto = re.search(r"(\w+) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)", frase_normalizada, re.IGNORECASE)
    fecha_offset = None  # <- NUEVO
    
    if match_fecha_texto:
        dia_texto = match_fecha_texto.group(1).strip()
        mes_texto = match_fecha_texto.group(2).lower()
        
        if dia_texto in ["principios", "mediados", "finales"]:
        # No hacemos nada aquí, dejamos que otro bloque maneje
            pass
        else:   
            try:
                dia = int(dia_texto)
            except ValueError:
                # Si no es un dígito, intentar convertir usando numeros_texto_a_numero 
                dia = numeros_texto_a_numero.get(dia_texto,None)
                
            if dia is None:
                print(f"⚠️ No se pudo interpretar el día: {dia_texto}")
            else:
                mes = meses[mes_texto]
                año = hoy.year
                if validar_fecha(dia, mes, año):
                    fecha = datetime(day=dia, month=mes, year=año)
                    fecha_offset = match_fecha_texto.end()  # <- Guardamos el punto donde termina "20 de marzo"
                else:
                    print(f"⚠️ Fecha inválida detectada: Día {dia}, Mes {mes} ({mes_texto if 'mes_texto' in locals() else ''}), Año {año}. Esa combinación no existe.")
                    fecha = None
                
            
    #===============================================================      
    # 📅 3) ✔️ "Hoy", "Mañana", "Pasado mañana"
    #===============================================================
    
    if "hoy" in frase_normalizada:
        fecha = hoy
    elif "pasado manana" in frase_normalizada:
        fecha = hoy + timedelta(days=2)
    elif "manana" in frase_normalizada:
        fecha = hoy + timedelta(days=1)    
        
    #================================================================    
    # 📅 4) ✔️ EXPRESIONES "en X días", "en X semanas", "en X meses"
    #================================================================
    
    match_cantidad_tiempo = re.search(r"(en|dentro de)\s+(\w+|\d+)\s+(dia|dias|semana|semanas|mes|meses)", frase_normalizada)
    
    if match_cantidad_tiempo:
        cantidad_texto = match_cantidad_tiempo.group(2).strip()
        unidad = match_cantidad_tiempo.group(3).strip()
              
        
         # Convertir palabra a número si es necesario
        cantidad = numeros_texto_a_numero.get(cantidad_texto, None)
        if cantidad is None:
            try:
                cantidad = int(cantidad_texto)
            except ValueError:
                cantidad = None

        if cantidad is not None:
            if "dia" in unidad:
                fecha = hoy + timedelta(days=cantidad)
            elif "semana" in unidad:
                fecha = hoy + timedelta(weeks=cantidad)
            elif "mes" in unidad:
                # Sumar meses manualmente
                for _ in range(cantidad):
                    mes = hoy.month + 1 if hoy.month < 12 else 1
                    año = hoy.year if hoy.month < 12 else hoy.year + 1
                    dias_mes = dias_por_mes[mes]
                    # Ajuste por bisiesto en febrero
                    if mes == 2 and año % 4 == 0 and (año % 100 != 0 or año % 400 == 0):
                        dias_mes = 29  
                    hoy += timedelta(days=dias_mes)
                fecha = hoy

            if hora is None:
                preguntar_hora = True
     
     
    #================================================================
    # 📅 5) ✔️ "principios/mediados/finales de la semana que viene"
    #================================================================
    
    match_semana_relativa = re.search(r"(principios|mediados|finales) de la (?:semana que viene|proxima semana)",frase_normalizada)
    if match_semana_relativa:
        referencia_semana = match_semana_relativa.group(1)  # "principios", "mediados" o "finales"

        # Calculamos el lunes de la semana próxima
        dias_hasta_prox_lunes = (7 - hoy.weekday()) % 7 or 7
        prox_lunes = hoy + timedelta(days=dias_hasta_prox_lunes)

        # Ajustamos según "principios" (ej. lunes), "mediados" (ej. miércoles), "finales" (ej. viernes)
        if referencia_semana == "principios":
            fecha = prox_lunes  # lunes
        elif referencia_semana == "mediados":
            fecha = prox_lunes + timedelta(days=2)  # miércoles
        elif referencia_semana == "finales":
            fecha = prox_lunes + timedelta(days=4)  # viernes ( sábado/domingo )

        preguntar_hora = True 
        
    #================================================================    
    # 📅 6) ✔️ DETECTAR "principios/mediados/finales del próximo mes"
    #================================================================
    
    match_proximo_mes_relativo = re.search(r"(principios|mediados|finales) del? (?:proximo mes|mes que viene)",frase_normalizada)
    if match_proximo_mes_relativo:
        referencia_mes = match_proximo_mes_relativo.group(1)  # "principios", "mediados", "finales"

        next_month = hoy.month + 1
        next_year = hoy.year
        if next_month > 12:
            next_month = 1
            next_year += 1

        # Asignar día según "principios/mediados/finales"
        if referencia_mes == "principios":
            day = 1
        elif referencia_mes == "mediados":
            day = 15
        else:  # finales
            day = 28

        # Validar el día en ese mes (ej. febrero, meses de 30 días, etc.)
        if not validar_fecha(day, next_month, next_year):
            day = dias_por_mes[next_month]
            # Ajuste si es febrero y no es bisiesto
            if next_month == 2 and not es_bisiesto(next_year) and day == 29:
                day = 28

        fecha = datetime(next_year, next_month, day)
        preguntar_hora = True
      
    #================================================================================    
    # 📅 7) ✔️ "el próximo mes" o "el mes que viene" (SIN principios/mediados/finales)    
    #================================================================================
    
    elif "el proximo mes" in frase_normalizada or "el mes que viene" in frase_normalizada:
        # Si no se especifica el día, se mantiene como está
        next_month = hoy.month + 1
        next_year = hoy.year
        if next_month > 12:
            next_month = 1
            next_year += 1

        day = 1  # Día por defecto

        if not validar_fecha(day, next_month, next_year):
            day = dias_por_mes[next_month]
            if next_month == 2 and not es_bisiesto(next_year) and day == 29:
                day = 28

        fecha = datetime(next_year, next_month, day)
        preguntar_hora = True 
        
        
    match_proximo_mes_dia = re.search(r"(?:el )?dia (\d{1,2}) del? (?:proximo mes|mes que viene)", frase_normalizada)
    if match_proximo_mes_dia:
        day = int(match_proximo_mes_dia.group(1))
        next_month = hoy.month + 1
        next_year = hoy.year
        if next_month > 12:
            next_month = 1
            next_year += 1

        if not validar_fecha(day, next_month, next_year):
            print(f"⚠️ Fecha inválida detectada: Día {day}, Mes {next_month}, Año {next_year}. Esa combinación no existe.")
            fecha = None
        else:
            fecha = datetime(next_year, next_month, day)
        preguntar_hora = True

         
    #================================================================    
    # 📅 8) ✔️ "la próxima semana" / "la semana que viene" (SIN principios/mediados/finales)
    #================================================================
    
    elif "la proxima semana" in frase_normalizada or "la semana que viene" in frase_normalizada:
        dias_hasta_lunes = (7 - hoy.weekday()) % 7 or 7
        fecha = hoy + timedelta(days=dias_hasta_lunes)
        preguntar_hora = True
           
        
        
    #=============================================================================      
    # 📅 9) ✔️ "Principios/mediados/finales de [MES]"
    #=============================================================================
    
    match_mes_relativo = re.search(r"(principios|mediados|finales) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)", frase_normalizada)

    if match_mes_relativo:
        referencia = match_mes_relativo.group(1)  # principios, mediados, finales
        mes_texto = match_mes_relativo.group(2).lower()
        
        mes = meses[mes_texto]
        año = hoy.year

        if referencia == "principios":
            dia = 2
        elif referencia == "mediados":
            dia = 15
        elif referencia == "finales":
            dia = 28

        #  Validar el día según el mes.
        if not validar_fecha(dia, mes, año):
            dia = dias_por_mes[mes]

        fecha = datetime(day=dia, month=mes, year=año)
        fecha_offset = match_mes_relativo.end() 
        
  

    #======================================================================    
    # 📅 10) ✔️ DETECTAR DÍAS DE LA SEMANA (Lunes, Martes, etc.)
    #======================================================================
    # Antes de detectar días de la semana
    frase_normalizada = re.sub(r"\bel\s+(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b", r"\1", frase_normalizada)

    dias_semana = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]
    hoy_dia_semana = hoy.weekday()
    for i, dia in enumerate(dias_semana):
        if dia in frase_normalizada:
            diferencia = (i - hoy_dia_semana) % 7
            fecha = hoy + timedelta(days=diferencia)
            

    #======================================================================       
    # 11) DETECTAR HORA
    #======================================================================
    #explicit_hour_found = False
    #fragmento_a_buscar = frase[0:] 
    #hora_match = re.search(r"(?i)(?:a las|a la)\s*(\d{1,2})(?::(\d{1,2}))?\s*(?:am|pm|h|horas)?\b", frase_normalizada)

    """  
  # Si hay fecha_offset, buscar después de la fecha. Si no, buscar en toda la frase
    fragmento_a_buscar = frase[fecha_offset:] if fecha_offset else frase

        # Buscar hora ANTES y DESPUÉS de la fecha por si acaso
    hora_match_global = re.search(r"(a las |a la )?(\d{1,2})(?:[:\.](\d{2}))?\s*(am|pm|h|horas)?", frase, re.IGNORECASE)
    hora_match_offset = re.search(r"(a las |a la )?(\d{1,2})(?:[:\.](\d{2}))?\s*(am|pm|h|horas)?", fragmento_a_buscar, re.IGNORECASE)


    # Decidir cuál usar:
    # 1. Si hay offset (ejemplo: "Reunión el 20 de marzo a las 22")
    # 2. Si hay hora antes de fecha (ejemplo: "Reunión a las 8 el 20 de marzo")
    hora_match = hora_match_offset or hora_match_global
    # Siempre buscar en toda la frase porque la hora puede ir antes o después de la fecha
    #hora_match = re.search(r"(a las |a la )?(\d{1,2})(?:[:\.](\d{2}))?\s*(am|pm|h|horas)?", frase_normalizada, re.IGNORECASE)
"""
        
        # --- Detección de hora explícita ---
    
        
        # --- Detección de hora explícita ---
    explicit_hour_found = False
    hora_match = re.search(r"(?i)(?:a las|a la)\s*(\d{1,2}|[a-zA-Z]+)\s*(?::(\d{1,2}))?\s*(am|pm|h|horas)?\b", frase_normalizada)
    if hora_match:
        explicit_hour_found = True
        hora_texto = hora_match.group(1)

        # Si la hora es un número en texto, como "7", "siete", etc.
        if hora_texto.isdigit():
            hora = int(hora_texto)  # Si es un número directo (ej. "7")
        else:
            # Si es texto (ej. "siete"), usamos el diccionario de números
            hora = numeros_texto_a_numero.get(hora_texto.strip().lower(), None)

        minutos = int(hora_match.group(2)) if hora_match.group(2) else 0
        sufijo = hora_match.group(3)

        # Si la hora se detectó en formato texto y no fue mapeada, devolvemos un error o dejamos como 'hora no válida'
        if hora is None:
            print("⚠️ Hora no reconocida correctamente.")
            hora = None

        if sufijo:
            if sufijo.lower() == 'pm' and hora < 12:
                hora += 12
            elif sufijo.lower() == 'am' and hora == 12:
                hora = 0
        else:
            # Ajuste por defecto si no hay sufijo AM/PM
            if 1 <= hora <= 6:
                # Si la coletilla detectada es "menos", se interpreta que la hora base es la siguiente:
                match_coletilla = re.search(r"(y|menos) (\w+|\d+)", frase_normalizada)
                if match_coletilla:
                    operador = match_coletilla.group(1)
                    if operador == "menos":
                        hora = (hora - 1) + 12
                    else:  # operador == "y"
                        hora = hora + 12
                else:
                    # Si no se detecta coletilla, también asumimos PM
                    hora = hora + 12

                
        
        
        
        
        
        

        # Ajustes según "por la mañana", "por la tarde" o "por la noche"
        por_manana = ("por la manana" in frase_normalizada or "de la manana" in frase_normalizada)
        por_tarde = ("por la tarde" in frase_normalizada or "de la tarde" in frase_normalizada)
        por_noche = ("por la noche" in frase_normalizada or "de la noche" in frase_normalizada)
        if por_manana:
            if hora >= 13:
                preguntar_hora = True
        elif por_tarde:
            if hora < 12:
                hora += 12
        elif por_noche:
            if hora < 12:
                hora += 12
        else:
            if actividad_detectada:
                inicio, fin = bloques_horarios_actividad[actividad_detectada]
                if not (inicio <= hora <= fin):
                    alerta = f"¿Seguro que quieres {actividad_detectada} a las {hora:02d}? Suele hacerse entre las {inicio}:00 y las {fin}:00."
            else:
                if hora <= 5:
                    hora += 12
    else:
        explicit_hour_found = False

    # --- Si no se detectó hora explícita, asignar valores por defecto según el periodo ---
    if not explicit_hour_found or hora is None:
        if "por la manana" in frase_normalizada or "de la manana" in frase_normalizada:
            hora, minutos = 9, 0
        elif "por la tarde" in frase_normalizada or "de la tarde" in frase_normalizada:
            hora, minutos = 17, 0
        elif "por la noche" in frase_normalizada or "de la noche" in frase_normalizada:
            hora, minutos = 21, 0

    # --- Integrar la detección de coletillas llamando a la función ---
    hora_coletilla, minutos_coletilla = detectar_coletillas_horarias(
        frase_normalizada,
        hora if hora is not None else hora_actual,
        minutos if minutos is not None else minuto_actual,
        hora_actual,
        minuto_actual
    )
    if hora_coletilla is not None:
        hora = hora_coletilla
    if minutos_coletilla is not None:
        minutos = minutos_coletilla

    # --- Validar la hora final ---
    if hora is not None and (hora < 0 or hora > 23):
        hora = None
        minutos = 0
        preguntar_hora = True

    # --- Generar alerta si hay hora válida y se detectó actividad ---
    if hora is not None and actividad_detectada:
        inicio, fin = bloques_horarios_actividad[actividad_detectada]
        if not (inicio <= hora <= fin):
            alerta = f"¿Seguro que quieres {actividad_detectada} a las {hora:02d}? Suele hacerse entre las {inicio}:00 y las {fin}:00."

    # --- Fallback: Si aún no se detecta hora, intentamos detectar colectillas de nuevo ---
    if hora is None:
        hora, minutos = detectar_coletillas_horarias(frase_normalizada, hora_actual, minuto_actual, hora_actual, minuto_actual)

    # --- PARSING GENERAL CON DATEPARSER (último recurso) ---
    if fecha is None:
        fecha_parseada = dateparser.parse(frase, settings={'PREFER_DATES_FROM': 'future'})
        if fecha_parseada:
            fecha = fecha_parseada.date()
            logging.info(f"Dateparser interpretó la fecha como: {fecha}")
        if hora is None and fecha_parseada and fecha_parseada.time() is not None:
            hora = fecha_parseada.hour
            minutos = fecha_parseada.minute
    else:
        fecha_parseada = None

    # --- Formateo final de fecha y hora ---
    fecha_str = fecha.strftime("%d/%m/%Y") if fecha else "Fecha no especificada"
    hora_str = f"{hora:02d}:{minutos:02d}" if hora is not None and not preguntar_hora else "Preguntar" if preguntar_hora else "Hora no especificada"


    return fecha_str, hora_str, alerta


def limpiar_frase_de_temporalidades(frase):
    """
    Elimina expresiones temporales de la frase (fechas, horas, coletillas, días de la semana, etc.)
    """
    patrones = [
        
        # 1. Fechas en formato numérico
        r"\b(el )?(día )?(\d{1,2}/\d{1,2}(?:/\d{4})?)\b",
        
        # 2. Fechas en formato texto
        r"\b(el )?(día )?\d{1,2} de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b",
        r"\b(el )?(veinti\w+|treinta y \w+|\w{3,}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b",
        
        # 3. Referencias temporales comunes
        r"\b(hoy|mañana|pasado mañana)\b",
        r"\b(en|dentro de)\s+(un|una|\w+|\d+)\s+(d[ií]a|d[ií]as|semana|semanas|mes|meses)\b",
        r"\b(a principios|a mediados|a finales) de( la)? (semana que viene|próxima semana|[a-z]+)\b",
        r"\b(a principios|a mediados|a finales) del? (próximo mes|mes que viene)\b",
        r"\b(el próximo mes|el mes que viene|la próxima semana|la semana que viene)\b",
        r"\b(el )?(d[ií]a \d{1,2} del? (proximo mes|próximo mes|mes que viene))\b",
        
        # 4. Días de la semana
        r"\b(el\s+)?(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b",

        # 5. Horas explícitas
        r"\b(a las|a la)?\s*\d{1,2}(?::\d{1,2})?\s*(am|pm|h|horas)?\b",
        
        # 6. Coletillas horarias
        r"\b(por la mañana|por la tarde|por la noche|de la mañana|de la tarde|de la noche)\b",
        r"\b(a )?y (media|cuarto|veintitres|cinco|diez|veinte)\b",
        r"\b(a )?menos (cuarto|cinco|diez|veinte|\w+)\b",
        r"\ben punto\b",
        
        # 7. Limpieza extra
        r"(?<=\s),",  # comas sueltas
    ]

    frase_limpia = frase
    for patron in patrones:
        frase_limpia = re.sub(patron, "", frase_limpia, flags=re.IGNORECASE)

     # Normalizar espacios y eliminar puntuación extra
    frase_limpia = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", frase_limpia)  # Por si acaso se mezclan mayúsculas
    frase_limpia = re.sub(r"\s{2,}", " ", frase_limpia).strip()
    frase_limpia = re.sub(r"\s+[,.!?;:]+", "", frase_limpia)
    
    return frase_limpia



#===================================
# PRUEBAS DE LA FUNCIÓN
#===================================
if __name__ == "__main__":
    frases = [      
        "Cenar con Pablo a las 9",
        "Comer a las 11",
        "Entrenar a las 23",
        "Reunión el día 20 de marzo a las 22",
        "Reunión a las 8 el día 20 de marzo",
        "Comprar pan a las 9",
        "Cenar a las 14",
        "Correr por la noche",
        "Entrenar a las 7",
        "Camianr por la mañana",
        "Clase a las 10",
        "El viernes por la tarde gimnasio",
        "Pasado mañana por la tarde médico",
        "Dentro de 3 días voy a entrenar",
        "en dos semanas tengo reunión",
        "en tres semanas tengo reunión",
        "mañana tengo que revisar proyecto",
        "la próxima semana tengo reunión",
        "Voy al médico dentro de quince días",
        "En 5 meses cumplo los años",
        "en seis meses vuelo a africa",
        "Revisar proyecto en 7 días",
        "Tengo reunión el 31/04/2025",
        "Viaje el 15/04",
        "Cumpleaños el 3 de junio",
        "Reunion a la 1 el 15 de febrero",
        "Reunión a las 5 el 32 de enero",
        "Recoger a los niños a las 3 el dia 31 de abril",
        "Ir a por el perro a las 8 el 3 de marzo",
        "Recoger a los niños el proximo mes",
        "Tengo reunion a principios de marzo",
        "Pagar la factura a mediados de abril",
        "Cita con el dentista a mediados de marzo",
        "Cita con el dentista a finales de febrero",
        "Cita con el dentista a finales de la semana que viene",
        "Recoger  Iker a mediados de la semana que viene",
        "Recoger a los niños dentro de 5 meses",
        "Recoger a los niños el próximo mes",
        "Ir al dentista el mes que viene",
        "Pagar el alquiler a principios del próximo mes",
        "Tendré una reunión a finales del mes que viene",
        "El próximo mes, tengo que renovar el pasaporte",
        "¿Podríamos agendar la llamada el mes que viene?",
        "La fiesta será el próximo mes, probablemente el día 1",
        "Cita con el doctor el mes que viene, a las 9 de la mañana",
        "Tengo vacaciones el próximo mes",
        "Planeo mudarme el próximo mes, antes del día 10",
        "El mes que viene celebraré mi aniversario",
        "Debo entregar un informe a finales del próximo mes",
        "Cita con el doctor el mes que viene, a las 10 de la mañana",
        "Pagar la facrtura a principios del próximo mes",
        "Tendré una reunión a finales del mes que viene",
        "Ir al campo a mediados de la semana que viene",
        "Tendré una reunión a mediados del mes que viene",
        "ir a por el pan en 5 meses",
        "ir a por el pan en una semana ",
        "ir a correr el dia 15 del mes que viene",
        "Cita a las 3 en punto",
        "Clase a las 8 y media",
        "Reunión a las 10 y cuarto",
        "Entrenar a las 7 menos cuarto de la tarde",
        "Quedamos a las 9 y cinco",
        "Entreno a las 6 menos diez",
        "Revisión médica a las 11 y veinte",
        "Reunión a las 3 menos veinte",
        "Ir al gimaniso a y media",
        "Reunión a y veintitres",
        "Is al medico dentro de quince dias",
        "Ir al medico en doce dias",
        "Ir al medico en cinco meses",
        "Ir al medico en 5 semanas",
        "Ir al medico en cinco semanas",
        "recoger el coche el veinte de marzo a las 5",
        "Escribir una carta a un amigo que hace tiempo que no veo",
        "El viernes comprar el pan a las 8",
        "Viernes comida de empresa",
        "Mañana tengo que ir al médico a las siete",

        
        
        
    ]

    for frase in frases:
        fecha, hora, alerta = detectar_fecha_y_hora(frase)
        frase_limpia = limpiar_frase_de_temporalidades(frase)
        print(f"Frase: {frase}")
        print(f"Frase limpia: {frase_limpia}")
        print(f"Fecha: {fecha}, Hora: {hora}")
        if alerta:
            print(f"⚠️ Alerta: {alerta}")
        print("-" * 50)