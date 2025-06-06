import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  TouchableWithoutFeedback,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import Tts from 'react-native-tts';

import { BACKEND_URL } from '../config';

import { WallyLogo2Icon, CalendarIcon, ClockIcon, FolderIcon } from '../utils/icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { getSvgByCategoria } from '../utils/icons';
import { useTareas } from '../context/TareasContext';


const frasesWally = [
  { texto: 'La constancia vence al talento.', autor: 'Proverbio' },
  { texto: 'No cuentes los días, haz que los días cuenten.', autor: 'Muhammad Ali' },
  { texto: 'Tu mente clara, tu día mejor.', autor: 'WallyDo' },
  { texto: 'La disciplina es el puente entre metas y logros.', autor: 'Jim Rohn' },
  { texto: 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.', autor: 'Robert Collier' },
  { texto: 'Organiza tu vida y tu mente te lo agradecerá.', autor: 'WallyDo' },
];

const fraseDelDia = frasesWally[Math.floor(Math.random() * frasesWally.length)];
const mensajeInicial = {
  id: 'mensaje-inicial',
  texto: `Frase del día:\n"${fraseDelDia.texto}" — ${fraseDelDia.autor}`,
  tipo: 'wally',
};

const convertirADateISO = (fecha: string): string => {
  // Convierte "04/06/2025" a "2025-06-04"
  const [dia, mes, anio] = fecha.split('/');
  if (!dia || !mes || !anio) return '';
  return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
};


const InteraccionScreen = () => {
  const navigation = useNavigation();
  const [mensaje, setMensaje] = useState('');
  const [historial, setHistorial] = useState([mensajeInicial]);
  const [procesandoAudio, setProcesandoAudio] = useState(false);
  const [mostrarBotonScroll, setMostrarBotonScroll] = useState(false);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [modoDebug] = useState(true); // Toggle para mostrar intención

  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const [grabando, setGrabando] = useState(false);
  const audioPathRef = useRef('');
  const grabacionEnCursoRef = useRef(false);
  const grabacionProtegidaRef = useRef(false);
  const tiempoInicioGrabacionRef = useRef(0);
  const scrollViewRef = useRef(null);
  const { agregarTarea } = useTareas();

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [historial]);

  const solicitarPermisoMicrofono = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Permiso para usar el micrófono',
        message: 'WallyDo necesita acceso al micrófono para escuchar tus tareas',
        buttonPositive: 'Aceptar',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const iniciarGrabacion = async () => {
    if (grabando || grabacionProtegidaRef.current || grabacionEnCursoRef.current) return;

    grabacionProtegidaRef.current = true;

    try {
      try {
        await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
        await new Promise(res => setTimeout(res, 200));
      } catch {}

      const permisoOk = await solicitarPermisoMicrofono();
      if (!permisoOk) {
        setHistorial(prev => [...prev, {
          id: Date.now().toString() + '-permiso',
          texto: 'No se otorgó permiso al micrófono.',
          tipo: 'wally',
        }]);
        return;
      }

      const audioPath = `${RNFS.DocumentDirectoryPath}/audio_${Date.now()}.mp4`;
      audioPathRef.current = audioPath;
      tiempoInicioGrabacionRef.current = Date.now();

      const path = await audioRecorderPlayer.startRecorder(audioPath);
      if (!path) throw new Error('No se pudo iniciar la grabación');

      grabacionEnCursoRef.current = true;
      setGrabando(true);
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      grabacionEnCursoRef.current = false;
      setGrabando(false);
      setHistorial(prev => [...prev, {
        id: Date.now().toString() + '-error',
        texto: 'No se pudo iniciar la grabación. Intenta mantener pulsado un poco más.',
        tipo: 'wally',
      }]);
    } finally {
      grabacionProtegidaRef.current = false;
    }
  };


  const detenerYEnviarAudio = async () => {
    if (!grabando && !grabacionEnCursoRef.current) return;

    const duracion = Date.now() - tiempoInicioGrabacionRef.current;
    if (duracion < 1000) {
      setGrabando(false);
      grabacionEnCursoRef.current = false;
      setHistorial(prev => [...prev, {
        id: Date.now().toString() + '-short',
        texto: 'Grabación cancelada por ser demasiado breve. Mantené pulsado un poco más.',
        tipo: 'wally',
      }]);
      return;
    }

    let data = null;

    try {
      setProcesandoAudio(true);
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      grabacionEnCursoRef.current = false;

      const exists = await RNFS.exists(result);
      if (!exists) throw new Error('Archivo no encontrado');

      const formData = new FormData();
      formData.append('archivo', {
        uri: `file://${result}`,
        name: 'grabacion_temp.mp4',
        type: 'audio/mp4',
      });

      const response = await fetch(`${BACKEND_URL}/hablar`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorTexto = await response.text();
        throw new Error(`Error backend: ${errorTexto}`);
      }

      data = await response.json();

      agregarTarea({
        id: Date.now().toString(),
        titulo: data.titulo,
        fecha: data.fecha, // original legible
        fechaISO: convertirADateISO(data.fecha), // ISO
        hora: data.hora,
        categoria: data.categoria,
        estado: data.estado,
      });


      setHistorial(prev => [
        ...prev,
        { id: Date.now().toString() + '-voz', texto: data.texto_usuario, tipo: 'usuario' },
        data.intencion === 'crear_tarea'
          ? {
              id: Date.now().toString() + '-render',
              tipo: 'wally',
              render: () => (
                <View style={[styles.mensaje, styles.mensajeWally]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <FolderIcon width={16} height={16} style={{ marginRight: 6 }} />
                    <Text style={styles.mensajeTextoBold}>Tarea creada:</Text>
                  </View>
                  <Text style={styles.mensajeTexto}>{data.titulo}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                    <CalendarIcon width={16} height={16} style={{ marginRight: 6 }} />
                    <Text style={styles.mensajeTexto}>{data.fecha}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <ClockIcon width={16} height={16} style={{ marginRight: 6 }} />
                    <Text style={styles.mensajeTexto}>{data.hora}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    {getSvgByCategoria(data.categoria)}
                    <Text style={[styles.mensajeTexto, { marginLeft: 6 }]}>
                      {data.categoria} | {data.estado}
                    </Text>
                  </View>
                  {modoDebug && (
                    <Text style={{ marginTop: 6, fontSize: 12, color: '#888' }}>
                      Intención: {data.intencion}
                    </Text>
                  )}
                </View>
              ),
            }
          : {
              id: Date.now().toString() + '-respuesta',
              texto: data.mensaje_voz,
              tipo: 'wally',
            },
      ]);

      if (data.mensaje_voz) {
        Tts.speak(data.mensaje_voz);
      }
    }

     finally {
      setGrabando(false);
      grabacionEnCursoRef.current = false;
      grabacionProtegidaRef.current = false;
      setProcesandoAudio(false);
    }
  };


  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 10;
    setMostrarBotonScroll(!isNearBottom);
  };

  const scrollToBottom = () => scrollViewRef.current?.scrollToEnd({ animated: true });

  const handleEnviar = async () => {
    if (!mensaje.trim()) return;

    const nuevoMensaje = {
      id: Date.now().toString(),
      texto: mensaje,
      tipo: 'usuario',
    };

    setHistorial(prev => [...prev, nuevoMensaje]);
    setMensaje('');

    try {
      const response = await fetch(`${BACKEND_URL}/procesar_frase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: mensaje }),
      });

      const data = await response.json();

      agregarTarea({
        id: Date.now().toString(),
        titulo: data.titulo,
        fecha: data.fecha,
        fechaISO: convertirADateISO(data.fecha), // <-- AÑADE ESTA LÍNEA
        hora: data.hora,
        categoria: data.categoria,
        estado: data.estado,
      });



      const mensajeWally = {
        id: Date.now().toString() + '-wally',
        tipo: 'wally',
        render: () => (
          <View style={[styles.mensaje, styles.mensajeWally]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <FolderIcon width={16} height={16} style={{ marginRight: 6 }} />
              <Text style={styles.mensajeTextoBold}>Tarea creada:</Text>
            </View>
            <Text style={styles.mensajeTexto}>{data.titulo}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <CalendarIcon width={16} height={16} style={{ marginRight: 6 }} />
              <Text style={styles.mensajeTexto}>{data.fecha}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <ClockIcon width={16} height={16} style={{ marginRight: 6 }} />
              <Text style={styles.mensajeTexto}>{data.hora}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              {getSvgByCategoria(data.categoria)}
              <Text style={[styles.mensajeTexto, { marginLeft: 6 }]}>
                {data.categoria} | {data.estado}
              </Text>
            </View>
            {modoDebug && (
              <Text style={{ marginTop: 6, fontSize: 12, color: '#888' }}>
                Intención: {data.intencion}
              </Text>
            )}
          </View>
        ),
      };
      setHistorial(prev => [...prev, mensajeWally]);
    } catch (error) {
      setHistorial(prev => [
        ...prev,
        { id: Date.now().toString() + '-error', texto: 'No pude procesar esa frase.', tipo: 'wally' },
      ]);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => setMostrarMenu(false)}>
      <View style={{ flex: 1 }}>
        <ImageBackground source={require('../assets/fondo-blanco.png')} style={StyleSheet.absoluteFill}>
          <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.encabezadoChat}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="chevron-back" size={28} color="#333" />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 8 }}>
                <WallyLogo2Icon width={54} height={54} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.nombre}>
                    <Text style={{ color: '#1a1a1a' }}>Wally</Text>
                    <Text style={{ color: '#00c3ff' }}>Do</Text>
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.estadoPunto} />
                    <Text style={styles.estadoTexto}>En Línea</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => setMostrarMenu(true)} style={styles.iconoOpciones}>
                <Icon name="ellipsis-vertical" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollViewRef}
              style={styles.historial}
              contentContainerStyle={{ paddingBottom: 20 }}
              onScroll={handleScroll}
              scrollEventThrottle={100}
            >
              {historial.map((msg, index) => {
                const AnimatedView = index === 0 ? Animated.View : View;
                return (
                  <AnimatedView key={msg.id} entering={index === 0 ? FadeIn.duration(800) : undefined}>
                    {msg.render ? (
                      msg.render()
                    ) : (
                      <View style={[styles.mensaje, msg.tipo === 'usuario' ? styles.mensajeUsuario : styles.mensajeWally]}>
                        <Text style={styles.mensajeTexto}>{msg.texto}</Text>
                      </View>
                    )}
                  </AnimatedView>
                );
              })}
            </ScrollView>

            {mostrarBotonScroll && (
              <TouchableOpacity style={styles.botonScrollAbajo} onPress={scrollToBottom}>
                <Icon name="chevron-down-outline" size={24} color="#fff" />
              </TouchableOpacity>
            )}

            <View style={styles.inputRow}>
              <TouchableOpacity
                onPressIn={iniciarGrabacion}
                onPressOut={detenerYEnviarAudio}
                style={{ paddingHorizontal: 10 }}
              >
                <Icon name={grabando ? 'mic' : 'mic-outline'} size={24} color={grabando ? '#e53935' : '#1a73e8'} />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder="¿Qué quieres hacer?"
                value={mensaje}
                onChangeText={setMensaje}
                onSubmitEditing={handleEnviar}
              />
              <TouchableOpacity onPress={handleEnviar}>
                <Icon name="send" size={24} color="#1a73e8" />
              </TouchableOpacity>
            </View>

            {mostrarMenu && (
              <TouchableWithoutFeedback>
                <View style={styles.menuOpciones}>
                  <TouchableOpacity style={styles.menuItem}><Text style={styles.menuTexto}>Cambiar fondo</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}><Text style={styles.menuTexto}>Ajustes</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}><Text style={styles.menuTexto}>Sugerencias</Text></TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            )}
          </KeyboardAvoidingView>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  encabezadoChat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(243, 246, 252, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 3,
  },
  nombre: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  estadoTexto: {
    fontSize: 12,
    color: '#4caf50',
  },
  estadoPunto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
  },
  historial: {
    flex: 1,
    padding: 20,
  },
  mensaje: {
    marginBottom: 12,
    maxWidth: '80%',
    borderRadius: 10,
    padding: 12,
  },
  mensajeUsuario: {
    alignSelf: 'flex-end',
    backgroundColor: '#e6e6e6',
  },
  mensajeWally: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f4fd',
  },
  mensajeTexto: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
  },
  mensajeTextoBold: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  fraseTexto: {
    fontSize: 15,
    color: '#1a1a1a',
    lineHeight: 22,
    fontStyle: 'normal',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
 },
  botonScrollAbajo: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    backgroundColor: '#1a73e8',
    borderRadius: 25,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },

  iconoOpciones: {
    paddingLeft: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuOpciones: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 999,
  },

  menuItem: {
    paddingVertical: 10,
  },

  menuTexto: {
    fontSize: 15,
    color: '#1a1a1a',
  },

  menuCerrar: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },

});

export default InteraccionScreen;
