// Importaciones
import React, { useEffect, useState, useRef, } from 'react';
import {View,Text,ScrollView,TouchableOpacity,StyleSheet,SafeAreaView,Image,} from 'react-native';
import { Dimensions, Modal, TouchableWithoutFeedback, Animated, Easing, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import TarjetaEstilo1 from '../components/taskCard';

// Utilidades y SVGs
import { getColorByCategoria, getColorByEstado } from '../utils/colors';
import { getSvgByCategoria, getSvgByEstado} from '../utils/icons';
import { CalendarIcon, ClockIcon, ListIcon, ListCheckIcon, ListIconSimple, WallyLogoIcon,EyeIcon} from '../utils/icons';
import FeedScreen from './FeedScreen';

import { useRoute } from '@react-navigation/native';



const TareasScreen = ({ navigation }: any) => {
  const route = useRoute();
  const [tareas, setTareas] = useState<any[]>([]);
  const [modoVista, setModoVista] = useState<'proximas' | 'recientes' | 'feed'>('proximas');

  const [mostrarModalVista, setMostrarModalVista] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(500)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    if (mostrarModalVista) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 300,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [mostrarModalVista]);

  // Función para obtener tareas simuladas
  const obtenerTareas = async () => {
    const tareasFicticias: any[] = [
      {
        id: '1',
        titulo: 'Enviar informe al jefe para reconocimiento médico laboral',
        fecha: '2025-05-31',
        hora: '10:00',
        categoria: 'Estudio',
        estado: 'Sin empezar',
      },
      {
        id: '2',
        titulo: 'Ir al gimnasio',
        fecha: '2025-06-17',
        hora: '14:00',
        categoria: 'Deporte',
        estado: 'En curso',
      },
      {
        id: '3',
        titulo: 'Preparar documentación fiscal para Hacienda',
        fecha: '2025-06-13',
        hora: '09:30',
        categoria: 'Trabajo',
        estado: 'En curso',
      },
      {
        id: '5',
        titulo: 'Estudiar para el examen final de Inteligencia Artificial',
        fecha: '2025-06-21',
        hora: '18:00',
        categoria: 'Estudio',
        estado: 'Sin empezar',
      },
      {
        id: '6',
        titulo: 'Sesión de pesas en el gimnasio',
        fecha: '2025-06-22',
        hora: '22:30',
        categoria: 'Deporte',
        estado: 'En curso',
      },
      {
        id: '7',
        titulo: 'Revisar contrato laboral antes de firmarlo',
        fecha: '2025-06-23',
        hora: '11:00',
        categoria: 'Trabajo',
        estado: 'Sin empezar',
      },
      {
        id: '8',
        titulo: 'Ir a fisioterapia por la periostitis tibial',
        fecha: '2025-06-24',
        hora: '16:45',
        categoria: 'Salud',
        estado: 'Sin empezar',
      },
      {
        id: '9',
        titulo: 'Leer 30 páginas del libro "Hábitos Atómicos"',
        fecha: '2025-07-25',
        hora: '20:00',
        categoria: 'Personal',
        estado: 'En curso',
      },
      {
        id: '10',
        titulo: 'Preparar presentación del proyecto WallyDo para inversores',
        fecha: '2025-06-28',
        hora: '10:30',
        categoria: 'Trabajo',
        estado: 'Sin empezar',
      },
      {
        id: '11',
        titulo: 'Llamar al centro médico para resultados de análisis',
        fecha: '2025-05-26',
        hora: '12:15',
        categoria: 'Salud',
        estado: 'En curso',
      },
      {
        id: '12',
        titulo: 'Correr 5 km por la noche',
        fecha: '2025-05-30',
        hora: '21:00',
        categoria: 'Deporte',
        estado: 'Sin empezar',
      }

    ];
    setTareas(tareasFicticias);
  };

  // Al montar el componente, cargar vista y tareas
  useEffect(() => {
    const cargarVistaYDatos = async () => {
      const guardada = await AsyncStorage.getItem('modoVistaTareas');
      if (guardada === 'proximas' || guardada === 'recientes' || guardada === 'feed') {
        setModoVista(guardada);
      }
      await obtenerTareas();
    };
    cargarVistaYDatos();
  }, []);

  // Cambiar modo de vista (y guardar preferencia)
  const cambiarVista = async (modo: 'proximas' | 'recientes' | 'feed') => {
    setModoVista(modo);
    await AsyncStorage.setItem('modoVistaTareas', modo);
    setMostrarModalVista(false);
    scaleAnim.setValue(1);
  };

  // Animar botón del ojo
   const animarBotonVista = () => {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.15,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => setMostrarModalVista(true));
  };

  // Ordenar tareas por fecha
  const tareasOrdenadas = tareas.sort((a, b) => {
    const fechaA = new Date(`${a.fecha}T${a.hora}`);
    const fechaB = new Date(`${b.fecha}T${b.hora}`);
    return fechaA.getTime() - fechaB.getTime();
  });

  // Filtrar próximas tareas
  const tareasProximas = tareasOrdenadas
    .filter((t) => new Date(`${t.fecha}T${t.hora}`) >= new Date())
    .slice(0, 10); // máximo 10 próximas

  // Elegir qué tareas mostrar según el modo de vista
  const tareasMostradas = modoVista === 'proximas'
      ? tareasProximas
      : tareasOrdenadas.slice().reverse().slice(0, 10); // últimas añadidas

  // Formatear fecha de YYYY-MM-DD a DD/MM/YYYY
  const formatearFecha = (fechaISO: string) => {
    if (fechaISO.includes('/')) return fechaISO;  // Ya está formateada
    const [a, m, d] = fechaISO.split('-');
    return `${d}/${m}/${a}`;
  };
return (
   <SafeAreaView style={styles.container}>
     {/* Contenido scrollable */}
     <ScrollView
       style={{ backgroundColor: '#ffffff' }}
       contentContainerStyle={styles.scrollContent}
     >
       {/* Toolbar */}
       <View style={styles.toolbar}>
         {/* Título centrado */}
         <View style={styles.toolbarTitleContainer}>
           <Text style={styles.toolbarTitle}>
             Wally<Text style={{ color: '#00c3ff' }}>Do</Text>
           </Text>
         </View>

         <TouchableOpacity
           style={[
             styles.botonVistaAbsoluto,
             mostrarModalVista && styles.botonVistaActivo, // <-- estilo extra si está abierto
           ]}
           onPress={() => setMostrarModalVista(true)}
         >
           <EyeIcon
             width={20}
             height={20}
             fill={mostrarModalVista ? '#fff' : '#1a1a1a'} // Icono blanco si activo
           />
         </TouchableOpacity>
       </View>

       {/* Encabezado dinámico */}
       <View style={styles.sectionHeader}>
         <ListIconSimple width={16} height={16} />
         <Text style={styles.sectionHeaderText}>
           {modoVista === 'proximas'
             ? 'Próximas tareas'
             : modoVista === 'recientes'
             ? 'Últimas tareas añadidas'
             : 'WallyFeed'}
         </Text>
       </View>

       {/* Lista de tareas */}
       {modoVista === 'feed' ? (
         <FeedScreen />
       ) : tareasMostradas.length === 0 ? (
         <Text style={styles.emptyText}>Vacío</Text>
       ) : modoVista === 'proximas' ? (
         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
           <View>
             {/* Cabecera de tabla */}
             <View style={[styles.row, styles.header]}>
               <View style={[styles.cell, styles.taskCell]}>
                 <Text style={styles.headerLabel}>Tarea</Text>
               </View>
               <View style={styles.headerCell}>
                 <CalendarIcon width={16} height={16} />
                 <Text style={styles.headerLabel}>Fecha</Text>
               </View>
               <View style={styles.headerCell}>
                 <ClockIcon width={16} height={16} />
                 <Text style={styles.headerLabel}>Hora</Text>
               </View>
               <View style={styles.headerCell}>
                 <ListIcon width={16} height={16} />
                 <Text style={styles.headerLabel}>Categoría</Text>
               </View>
               <View style={styles.headerCell}>
                 <ListCheckIcon width={16} height={16} />
                 <Text style={styles.headerLabel}>Estado</Text>
               </View>
             </View>

             {/* Filas de tareas */}
             {tareasMostradas.map((tarea) => (
               <View key={tarea.id} style={styles.row}>
                 <View style={[styles.cell, styles.taskCell]}>
                   <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                     <View style={{ flex: 1, paddingRight: 10 }}>
                       <Text style={styles.cellText} numberOfLines={2}>
                         {tarea.titulo}
                       </Text>
                     </View>
                     <TouchableOpacity style={styles.abrirBtn}>
                       <Text style={styles.abrirText}>ABRIR</Text>
                     </TouchableOpacity>
                   </View>
                 </View>
                 <View style={styles.cell}>
                   <Text style={styles.cellText}>{formatearFecha(tarea.fecha)}</Text>
                 </View>
                 <View style={styles.cell}>
                   <Text style={styles.cellText}>{tarea.hora}</Text>
                 </View>
                 <View style={styles.cell}>
                   <View
                     style={[
                       styles.badge,
                       {
                         backgroundColor: getColorByCategoria(tarea.categoria),
                         flexDirection: 'row',
                         alignItems: 'center',
                         paddingVertical: 4,
                         paddingHorizontal: 8,
                         borderRadius: 10,
                       },
                     ]}
                   >
                     {getSvgByCategoria(tarea.categoria)}
                     <Text style={[styles.badgeText, { marginLeft: 6 }]}>{tarea.categoria}</Text>
                   </View>
                 </View>
                 <View style={styles.cell}>
                   <View
                     style={[
                       styles.badge,
                       {
                         backgroundColor: getColorByEstado(tarea.estado),
                         flexDirection: 'row',
                         alignItems: 'center',
                         paddingVertical: 4,
                         paddingHorizontal: 8,
                         borderRadius: 10,
                       },
                     ]}
                   >
                     {getSvgByEstado(tarea.estado)}
                     <Text style={[styles.badgeText, { marginLeft: 6 }]}>{tarea.estado}</Text>
                   </View>
                 </View>
               </View>
             ))}
             <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>Tu progreso esta semana</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>7</Text>
                    <Text style={styles.statLabel}>Tareas completadas</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>3</Text>
                    <Text style={styles.statLabel}>Cumplidas hoy</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>10</Text>
                    <Text style={styles.statLabel}>En progreso</Text>
                  </View>
                </View>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: '70%' }]} />
                </View>
                <Text style={styles.progressText}>70% de avance semanal</Text>
              </View>
           </View>
         </ScrollView>
       ) : (
         <View style={{ paddingHorizontal: 8, paddingTop: 8 }}>
           {tareasMostradas.map((item) => (
             <TarjetaEstilo1
               key={item.id}
               tarea={item}
               modoVertical={true}
               getColorByCategoria={getColorByCategoria}
               formatearFecha={formatearFecha}
               getSvgByCategoria={getSvgByCategoria}
             />
           ))}
         </View>


       )}

     </ScrollView>

     {/* Modal con selector de vista */}
     <Modal visible={mostrarModalVista} transparent animationType="none">
       {/* Capa oscura semitransparente */}
       <TouchableWithoutFeedback onPress={() => setMostrarModalVista(false)}>
         <View style={styles.modalOverlay} />
       </TouchableWithoutFeedback>

       {/* Tarjeta deslizable con animación */}
       <Animated.View style={[styles.modalContenido, { transform: [{ translateY }], opacity: opacityAnim, },]}>
         <Text style={styles.modalTitulo}>Seleccionar vista</Text>

         <TouchableOpacity style={styles.modalOpcionFila} onPress={() => cambiarVista('proximas')}>
           <ListCheckIcon width={16} height={16} />
           <Text style={styles.modalOpcionTexto}>Próximas tareas</Text>
         </TouchableOpacity>

         <TouchableOpacity style={styles.modalOpcionFila} onPress={() => cambiarVista('recientes')}>
           <ClockIcon width={16} height={16} />
           <Text style={styles.modalOpcionTexto}>Últimas añadidas</Text>
         </TouchableOpacity>

         <TouchableOpacity style={styles.modalOpcionFila} onPress={() => cambiarVista('feed')}>
           <Icon name="images-outline" size={18} color="#1a1a1a" />
           <Text style={styles.modalOpcionTexto}>WallyFeed</Text>
         </TouchableOpacity>


         <TouchableOpacity onPress={() => alert('Próximamente')}>
          <View style={styles.modalOpcionFila}>
            <Icon name="options-outline" size={18} color="#1a1a1a" />
            <Text style={styles.modalOpcionTexto}>Más...</Text>
            </View>
         </TouchableOpacity>
       </Animated.View>
     </Modal>

    {/* Navbar inferior con botón central personalizado */}
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => navigation.navigate('Tareas')}>
        <Icon
          name="home-outline"
          size={24}
          color={route.name === 'Tareas' ? '#00c3ff' : '#000'}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Calendario')}>
        <Icon name="calendar-outline" size={24} />
      </TouchableOpacity>
      {/* Botón flotante central */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Interaccion')}
        style={{
          backgroundColor: '#00c3ff',
          borderRadius: 30,
          padding: 10,
          marginTop: -20,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        }}
      >
        <WallyLogoIcon width={42} height={42} fill="#ffffff" />
      </TouchableOpacity>
      <TouchableOpacity><Icon name="notifications-outline" size={24} /></TouchableOpacity>
      <TouchableOpacity><Icon name="person-outline" size={24} /></TouchableOpacity>
    </View>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    backgroundColor: 'rgba(243, 246, 252, 0.9)',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  toolbarTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  scrollContent: {
    paddingTop: 80,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    backgroundColor: '#f4f6f8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 6,
  },
  emptyText: {
    color: '#aaa',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#555',
    paddingVertical: 10,
  },
  header: {
    backgroundColor: '#f5f5f5',
  },
  headerCell: {
    width: 150,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderRightColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerLabel: {
    color: '#444',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
  cell: {
    width: 150,
    paddingHorizontal: 5,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  cellText: {
    color: '#222',
    fontSize: 14,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
  },
  abrirBtn: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 10,
  },
  abrirText: {
    color: '#333',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskCell: {
    width: 320,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 65,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },

  // Modal deslizante
 modalOverlay: {
   position: 'absolute',
   top: 0,
   bottom: 0,
   left: 0,
   right: 0,
   backgroundColor: 'rgba(0,0,0,0.1)',
   zIndex: 999,
 },

 modalContenido: {
   position: 'absolute',
   bottom: 0,
   left: 0,
   right: 0,
   backgroundColor: 'rgba(255,255,255,0.95)',
   padding: 20,
   borderTopLeftRadius: 16,
   borderTopRightRadius: 16,
   zIndex: 1000,
   shadowColor: '#000',
   shadowOffset: { width: 0, height: -3 },
   shadowOpacity: 0.1,
   shadowRadius: 10,
   elevation: 10,
 },

 modalTitulo: {
   fontWeight: 'bold',
   fontSize: 16,
   marginBottom: 12,
   textAlign: 'center',
   color: '#1a1a1a',
 },

 modalOpcionFila: {
   flexDirection: 'row',
   alignItems: 'center',
   paddingVertical: 12,
   gap: 10,
 },

 modalOpcionTexto: {
   fontSize: 15,
   color: '#1a1a1a',
 },

botonVistaAbsoluto: {
  position: 'absolute',
  right: 20,
  top: 15,
  width: 34,
  height: 34,
  borderRadius: 17,
  borderWidth: 1.5,
  borderColor: '#00c3ff',
  backgroundColor: 'transparent',
  alignItems: 'center',
  justifyContent: 'center',
},
botonVistaActivo: {
  backgroundColor: '#00c3ff',
  borderColor: '#00c3ff',
},
statsContainer: {
  marginTop: 20,
  marginBottom: 30,
  backgroundColor: '#f7fafd',
  borderRadius: 12,
  padding: 16,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 6,
  elevation: 2,
},
statsTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 12,
  color: '#1a1a1a',
},
statsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 16,
},
statCard: {
  flex: 1,
  marginHorizontal: 4,
  backgroundColor: '#ffffff',
  borderRadius: 10,
  padding: 10,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.03,
  shadowRadius: 4,
  elevation: 1,
},
statNumber: {
  fontSize: 22,
  fontWeight: 'bold',
  color: '#00c3ff',
},
statLabel: {
  fontSize: 12,
  color: '#555',
  textAlign: 'center',
  marginTop: 4,
},
progressBarBackground: {
  height: 10,
  borderRadius: 5,
  backgroundColor: '#e0e0e0',
  overflow: 'hidden',
},
progressBarFill: {
  height: 10,
  backgroundColor: '#00c3ff',
},
progressText: {
  marginTop: 8,
  fontSize: 12,
  color: '#888',
  textAlign: 'center',
},




});



export default TareasScreen;
