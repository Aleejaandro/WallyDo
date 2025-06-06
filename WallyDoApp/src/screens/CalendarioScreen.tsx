import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { isSameDay, isSameWeek, parseISO } from 'date-fns';

import { useTareas } from '../context/TareasContext';
import { getColorByCategoria } from '../utils/colors';
import { getSvgByCategoria, WallyLogoIcon } from '../utils/icons';

// Configurar idioma
LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

const CalendarioScreen = () => {
  const navigation = useNavigation();
  const { tareas } = useTareas();
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [modoVista, setModoVista] = useState<'hoy' | 'semana' | 'todas' | 'seleccion'>('hoy');

  const hoy = new Date();

  // Agrupar tareas por fechaISO
  const tareasPorFecha = tareas.reduce((acc, tarea) => {
    if (!acc[tarea.fechaISO]) acc[tarea.fechaISO] = [];
    acc[tarea.fechaISO].push(tarea);
    return acc;
  }, {} as { [fecha: string]: any[] });

  // Filtrar tareas según el modo de vista
    const tareasFiltradas = tareas.filter((tarea) => {
      const fecha = tarea.fechaISO ? parseISO(tarea.fechaISO) : null;

      switch (modoVista) {
        case 'hoy':
          return fecha ? isSameDay(fecha, hoy) : false;
        case 'semana':
          return fecha ? isSameWeek(fecha, hoy, { weekStartsOn: 1 }) : false;
        case 'seleccion':
          return tarea.fechaISO === fechaSeleccionada;
        case 'todas':
        default:
          return true;
      }
    });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>
          Wall<Text style={{ color: '#00c3ff' }}>Endar</Text>
        </Text>
      </View>

      {/* Filtro superior */}
      <View style={styles.filtrosRow}>
        {['hoy', 'semana', 'todas'].map((op) => (
          <TouchableOpacity
            key={op}
            onPress={() => setModoVista(op as any)}
            style={[
              styles.filtroChip,
              modoVista === op && styles.filtroChipActivo,
            ]}
          >
            <Text style={[
              styles.filtroTexto,
              modoVista === op && styles.filtroTextoActivo,
            ]}>
              {op === 'hoy' ? 'Hoy' : op === 'semana' ? 'Semana' : 'Todas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Calendario */}
      <Calendar
        onDayPress={(day) => {
            setFechaSeleccionada(day.dateString);
            setModoVista('seleccion');
          }}
        markedDates={{
          ...Object.fromEntries(
            Object.entries(tareasPorFecha).map(([fecha]) => [
              fecha,
              {
                marked: true,
                dotColor: '#00c3ff',
              },
            ])
          ),
          [fechaSeleccionada]: {
            selected: true,
            selectedColor: '#00c3ff',
            marked: true,
            dotColor: '#ffffff',
          },
        }}
        theme={{
          selectedDayBackgroundColor: '#00c3ff',
          todayTextColor: '#00c3ff',
          arrowColor: '#00c3ff',
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
        }}
        style={styles.calendario}
      />

      {/* Lista tareas */}
      <ScrollView contentContainerStyle={styles.tareasContainer}>
        {tareasFiltradas.length > 0 ? (
          Object.entries(
            tareasFiltradas.reduce((acc, tarea) => {
              const fechaLegible = tarea.fechaISO
                ? new Date(tarea.fechaISO).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Fecha no especificada';

              if (!acc[fechaLegible]) acc[fechaLegible] = [];
              acc[fechaLegible].push(tarea);
              return acc;
            }, {} as Record<string, typeof tareas>)
          ).map(([fecha, grupo]) => (
            <View key={fecha}>
              {(modoVista === 'todas' || modoVista === 'semana') && (
                <Text style={styles.fechaLabel}>{fecha}</Text>
              )}
              {grupo.map((tarea) => (
                <View key={tarea.id} style={styles.tareaCard}>
                  <View style={styles.tituloContainer}>
                    <Text style={styles.tituloTarea}>{tarea.titulo}</Text>
                    <Text style={styles.hora}>{tarea.hora}</Text>
                  </View>
                  <View style={styles.categoriaEstado}>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: getColorByCategoria(tarea.categoria) },
                      ]}
                    >
                      {getSvgByCategoria(tarea.categoria)}
                      <Text style={styles.badgeTexto}>{tarea.categoria}</Text>
                    </View>
                    <Text style={styles.estado}>{tarea.estado}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.sinTareas}>No hay tareas para esta vista.</Text>
        )}
      </ScrollView>


      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate('Tareas')}>
          <Icon name="home-outline" size={24} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="calendar-outline" size={24} color="#00c3ff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Interaccion')}
          style={styles.botonCentral}
        >
          <WallyLogoIcon width={42} height={42} fill="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="notifications-outline" size={24} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="person-outline" size={24} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  encabezado: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'rgba(243, 246, 252, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  filtrosRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 10,
  },
  filtroChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filtroChipActivo: {
    backgroundColor: '#00c3ff',
  },
  filtroTexto: {
    color: '#333',
    fontSize: 14,
  },
  filtroTextoActivo: {
    color: '#fff',
    fontWeight: '600',
  },
  calendario: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 12,
    padding: 10,
    elevation: 2,
  },
  tareasContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  tareaCard: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 1,
  },
  tituloContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tituloTarea: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  hora: {
    fontSize: 13,
    color: '#555',
    marginLeft: 10,
  },
  categoriaEstado: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  badgeTexto: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 6,
  },
  estado: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  sinTareas: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 20,
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
  botonCentral: {
    backgroundColor: '#00c3ff',
    borderRadius: 30,
    padding: 10,
    marginTop: -20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fechaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginTop: 10,
    marginBottom: 6,
    marginLeft: 2,
    textTransform: 'capitalize',
  },

});

export default CalendarioScreen;
