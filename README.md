# 📋 Listado de Tareas Inteligente

Una aplicación moderna, rápida y productiva para gestionar tus tareas diarias, con almacenamiento persistente y dos formas de uso: **Aplicación Web interactiva** y **Herramienta de Consola en PowerShell / Batch**.

---

## 🚀 1. Aplicación Web (Recomendado)

### ¿Cómo abrirla?
- Haz doble clic en el archivo **`abrir.bat`** o abre directamente **`index.html`** con cualquier navegador moderno (Google Chrome, Microsoft Edge, Firefox, Brave, etc.).

### ✨ Novedades y Características:
- **🗂️ Vista Dual (Lista Detallada y Tablero Kanban):** 
  - Cambia entre la lista tradicional y el tablero Kanban interactivo con soporte de **Arrastrar y Soltar** (*Drag & Drop*) entre columnas (*Por Hacer*, *Para Hoy / Urgentes*, *Completadas*).
- **✏️ Editor Completo con Subtareas (Checklists):** 
  - Edita títulos, descripciones/notas extensas, categoría, prioridad y fecha límite sin ventanas intrusivas.
  - Añade listas de subtareas con seguimiento individual de progreso (ej. *2/3 subtareas hechas*).
- **⭐ Tareas Destacadas:** Fija tareas esenciales al inicio de la lista con un solo clic.
- **⏱️ Temporizador Pomodoro Integrado:**
  - Sesiones de enfoque de 25 minutos y descansos de 5 minutos.
  - Asigna una tarea activa al temporizador con un clic.
- **↩️ Sistema de Deshacer (Undo) con Notificaciones Toast:**
  - Si borras una tarea o limpias completadas accidentalmente, cuentas con un botón de **Deshacer** inmediato.
- **🎉 Animación de Confeti & Sonido Sintetizado:**
  - Lluvia de confeti al completar tareas urgentes o el 100% de tus objetivos.
  - Sonidos interactivos y relajantes generados por hardware con la *Web Audio API* (100% offline, conmutables con el botón 🔊/🔇).
- **⌨️ Atajos de Teclado Rápidos:**
  - `N`: Crear nueva tarea
  - `/`: Búsqueda instantánea
  - `M`: Alternar entre Vista Lista y Tablero Kanban
  - `P`: Abrir / Ocultar Pomodoro
  - `D`: Cambiar tema Claro / Oscuro
  - `Esc`: Cerrar modales o limpiar búsqueda
  - `?`: Ver panel de ayuda de atajos
- **📋 Copiar como Markdown:** Copia tu listado organizado con un clic para pegarlo en Notion, GitHub, WhatsApp o Slack.
- **📥 Exportación e Importación JSON:** Copias de seguridad completas y compatibilidad con el formato de la terminal.
- **🌙 Modo Oscuro / Claro:** Diseño pulido con soporte nativo y persistencia automática.

---

## 💻 2. Herramienta de Terminal (Consola / PowerShell)

> [!NOTE]
> En Windows, la ejecución directa de archivos `.ps1` suele estar bloqueada por la directiva de seguridad del sistema (*ExecutionPolicy*). Por eso hemos incluido **`todo.bat`** para que funcione siempre y sin bloqueos.

### Forma rápida (Sin bloqueos de seguridad):
Haz doble clic sobre **`todo.bat`** o ejecuta en la terminal:
```cmd
.\todo.bat
```

### O desde PowerShell directamente:
Si deseas usar `.\todo.ps1`, habilita primero la ejecución de scripts en tu usuario:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
O ejecútalo omitiendo la política puntual:
```powershell
powershell -ExecutionPolicy Bypass -File .\todo.ps1
```

### Comandos Rápidos por Línea de Comandos:
- **Ver tareas:**
  ```cmd
  .\todo.bat -Comando "list"
  ```
- **Agregar tarea:**
  ```cmd
  .\todo.bat -Comando "add" -Texto "Comprar café" -Prioridad "Alta"
  ```
- **Marcar o desmarcar tarea:**
  ```cmd
  .\todo.bat -Comando "done" -Texto "1"
  ```
- **Eliminar tarea:**
  ```cmd
  .\todo.bat -Comando "rm" -Texto "1"
  ```

Las tareas de la consola se guardan en el archivo `tareas.json` dentro del mismo directorio.

---

## 📁 Estructura del Proyecto

```text
lista-tareas/
├── index.html        # Estructura principal con soporte de vistas, modales y Pomodoro
├── styles.css        # Diseño moderno, responsivo, Kanban, animaciones y tema oscuro
├── app.js            # Lógica completa: sonido, confeti, filtros, drag&drop y persistencia
├── abrir.bat         # Acceso directo para abrir la app en tu navegador
├── todo.bat          # Lanzador de consola directo (sin bloqueos de Windows)
├── todo.ps1          # Script de PowerShell interactivo y CLI
├── tareas.json       # Base de datos local de la consola
└── README.md         # Documentación completa del proyecto
```
