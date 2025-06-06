// TarjetaEstilo1: Borde lateral izquierdo con color por categoría adaptable (horizontal o vertical)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getColorByCategoria } from '../utils/colors';
import { getSvgByCategoria } from '../utils/icons';

// Componente principal con soporte para vista horizontal (default) y vertical (con `modoVertical`)
const TarjetaEstilo1 = ({ tarea, getColorByCategoria, formatearFecha, getSvgByCategoria, modoVertical = false }) => {
  return (
    <View style={[styles.card, modoVertical && styles.cardVertical]}>

      {/* Franja lateral izquierda con color contextual según categoría */}
      <View
        style={[
          styles.leftBar,
          { backgroundColor: getColorByCategoria(tarea.categoria) },
        ]}
      />

      {/* Título de la tarea (máximo 2 líneas) */}
      <Text style={styles.titulo} numberOfLines={2} ellipsizeMode="tail">
        {tarea.titulo}
      </Text>

      {/* Fecha y hora combinadas en una sola línea */}
      <Text style={styles.fechaHora}>
        {formatearFecha(tarea.fecha)} - {tarea.hora}
      </Text>

      {/* Categoría con su icono contextual */}
      <View style={styles.categoria}>
        {getSvgByCategoria(tarea.categoria)}
        <Text style={styles.categoriaTexto}>{tarea.categoria}</Text>
      </View>
    </View>
  );
};

// Estilos reutilizables y adaptables para modo horizontal / vertical
const styles = StyleSheet.create({
  // Estilo base de la tarjeta
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 10,
    width: 220,
    padding: 10,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    minHeight: 80,
    maxHeight: 100,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
  },

  // Variante para disposición vertical (ocupa 100% del ancho y margen inferior)
  cardVertical: {
    width: '100%',
    marginRight: 0,
    marginBottom: 16,
    maxHeight: undefined, // Permite crecer libremente
  },


  // Franja de color lateral izquierda
  leftBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },

  // Título principal
  titulo: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },

  // Texto para fecha y hora
  fechaHora: {
    fontSize: 12,
    color: '#555',
  },

  // Fila de categoría + icono
  categoria: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  // Texto para nombre de categoría
  categoriaTexto: {
    fontSize: 12,
    color: '#555',
    marginLeft: 6,
  },
});

export default TarjetaEstilo1;



// TarjetaEstilo2: Fondo completo suave por categoría
export const TarjetaEstilo2 = ({ tarea, getColorByCategoria }) => {
  return (
    <View
      style={{
        backgroundColor: getColorByCategoria(tarea.categoria) + '33', // transparencia
        borderRadius: 12,
        marginRight: 10,
        width: 220,
        padding: 12,
      }}
    >
      <Text style={{ color: '#222', fontWeight: 'bold', marginBottom: 6 }}>{tarea.titulo}</Text>
      <Text style={{ color: '#333', fontSize: 12 }}>{tarea.fecha} - {tarea.hora}</Text>
      <Text style={{ marginTop: 8, fontSize: 12, color: '#444' }}>Categoría: {tarea.categoria}</Text>
    </View>
  );
};

// TarjetaEstilo3: Icono contextual + sombra blanca + enfoque minimalista
import { Ionicons } from 'react-native-vector-icons';

export const TarjetaEstilo3 = ({ tarea, getColorByCategoria, getIconByCategoria }) => {
  return (
    <View
      style={{
        backgroundColor: '#ffffffee',
        borderRadius: 12,
        marginRight: 10,
        width: 220,
        padding: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Ionicons name={getIconByCategoria(tarea.categoria)} size={16} color={getColorByCategoria(tarea.categoria)} />
        <Text style={{ color: '#222', fontWeight: 'bold', marginLeft: 6 }}>{tarea.titulo}</Text>
      </View>
      <Text style={{ color: '#444', fontSize: 12 }}>{tarea.fecha} - {tarea.hora}</Text>
      <Text style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Categoría: {tarea.categoria}</Text>
    </View>
  );
};
