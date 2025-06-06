readme: |
  # 🧠 WallyDo – Tu asistente personal inteligente

  **WallyDo** es una app de organización personal impulsada por IA conversacional. Entiende lo que dices, convierte tus frases en tareas, te organiza el día y te ayuda a construir buenos hábitos. Todo desde una interfaz intuitiva por texto o voz.

  ---

  ## 🚀 Características principales

  ✅ **Detección inteligente de tareas**  
  Comprende lo que quieres hacer sin necesidad de comandos. Usa NLP y modelos entrenados para extraer acción, categoría, intención, fecha y hora.

  🎤 **Reconocimiento de voz y respuesta hablada**  
  Interactúa por voz gracias a la integración de Whisper y Text-to-Speech. Solo habla con WallyDo y él se encarga del resto.

  📅 **Gestión proactiva del día**  
  Agenda, tareas y hábitos organizados automáticamente. WallyDo te sugiere, recuerda y se adapta a ti.

  🧠 **Modelos propios de IA**  
  Incluye modelos entrenados específicamente para detectar intención y clasificar categorías personalizadas.

  📱 **App móvil en React Native**  
  Diseño limpio, funcional y responsivo, con navegación fluida y animaciones personalizadas.

  ---

  ## 📷 Capturas de pantalla

  | Vista principal | Interacción | Feed motivacional |
  |-----------------|-------------|--------------------|
  | ![](./assets/screenshots/home.png) | ![](./assets/screenshots/chat.png) | ![](./assets/screenshots/feed.png) |

  ---

  ## 🛠️ Tecnologías usadas

  - **Frontend:** React Native (bare workflow)
  - **Backend:** FastAPI
  - **ML/NLP:** Transformers (DistilBERT), spaCy, embeddings propios
  - **Reconocimiento de voz:** OpenAI Whisper
  - **Text-to-Speech:** Edge TTS
  - **Base de datos:** MongoDB (planeada), Notion (prototipo)
  - **Infraestructura:** Git LFS, Python, Node.js

  ---

  ## ⚙️ Instalación

  1. Clona el repositorio:
     ```bash
     git clone https://github.com/Aleejaandro/WallyDo.git
     cd WallyDo
     ```

  2. Asegúrate de tener Git LFS instalado:
     ```bash
     git lfs install
     git lfs pull
     ```

  3. Configura los entornos virtuales:
     - Para el backend:  
       ```bash
       cd backend/
       pip install -r requirements.txt
       ```

     - Para la app móvil:  
       ```bash
       cd WallyDoApp/
       npm install
       npx react-native run-android
       ```

  ---

  ## 🧪 Dataset y modelos

  - Modelos entrenados con frases reales y datos sintéticos.
  - Clasificador de intención y clasificador de categoría alojados con Git LFS.
  - Dataset personalizado en formato JSON.

  ---

  ## 🧑‍💼 Licencia empresarial

  WallyDo está preparado para escalar a equipos de trabajo:

  - Panel para líderes con métricas de hábitos y tareas del equipo.
  - Asignación de tareas entre miembros.
  - Micro-retos y dinámicas de productividad colectivas.

  ➡️ Contacto: **[LinkedIn Alejandro](https://www.linkedin.com/in/alejandrof-tech/)**

  ---

  ## 📌 Roadmap

  - [x] MVP funcional con voz y detección de intención
  - [x] App móvil interactiva
  - [ ] Panel web para usuarios avanzados
  - [ ] Integración con Google Calendar
  - [ ] Sistema de hábitos recurrentes y gamificación

  ---

  ## 🤝 Contribuciones

  Este proyecto está en desarrollo activo. Si tienes ideas o sugerencias, ¡serán bienvenidas!

  ---

  ## ⭐ Créditos

  Desarrollado por **Alejandro Fuentes** como proyecto final de Máster en Inteligencia Artificial 2025.

  ---
