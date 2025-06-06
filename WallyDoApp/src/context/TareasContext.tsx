// src/context/TareasContext.tsx
import React, { createContext, useState, useContext } from 'react';

// Tipo para una tarea
export type Tarea = {
  id: string;
  titulo: string;
  fecha: string;        // legible: '03/06/2025'
  fechaISO: string;     // ISO: '2025-06-03'
  hora: string;
  categoria: string;
  estado: string;
};

// Definición del contexto
type TareasContextType = {
  tareas: Tarea[];
  agregarTarea: (t: Tarea) => void;
};

// Crear el contexto
const TareasContext = createContext<TareasContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useTareas = (): TareasContextType => {
  const context = useContext(TareasContext);
  if (!context) {
    throw new Error('useTareas debe usarse dentro de un TareasProvider');
  }
  return context;
};

// Provider del contexto
export const TareasProvider = ({ children }: { children: React.ReactNode }) => {
  const [tareas, setTareas] = useState<Tarea[]>([]);

  const agregarTarea = (t: Tarea) => {
    setTareas(prev => [...prev, t]);
  };

  return (
    <TareasContext.Provider value={{ tareas, agregarTarea }}>
      {children}
    </TareasContext.Provider>
  );
};
