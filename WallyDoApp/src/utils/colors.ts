//  Colores por categoría
export const getColorByCategoria = (categoria: string): string => {
  switch (categoria) {
    case 'Estudio': return '#ba55d3';     // violeta
    case 'Trabajo': return '#1e90ff';     // azul
    case 'Deporte': return '#6a5acd';     // morado
    case 'Personal': return '#a0522d';    // marrón
    case 'Salud': return '#2e8b57';       // verde suave
    default: return '#777';               // gris por defecto
  }
};

//  Colores por estado
export const getColorByEstado = (estado: string): string => {
  switch (estado) {
    case 'Sin empezar': return '#8b0000'; // rojo oscuro
    case 'En curso': return '#ffa500';    // naranja
    case 'Completada': return '#228b22';  // verde
    default: return '#666';
  }
};
