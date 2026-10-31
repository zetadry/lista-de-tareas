// ==========================================================================
// Listado de Tareas - Aplicación Web Inteligente
// ==========================================================================

const STORAGE_KEY = 'lista_tareas_data_v1';
const THEME_KEY = 'lista_tareas_theme';
const SOUND_KEY = 'lista_tareas_sound';
const VIEW_KEY = 'lista_tareas_view';

// Estado global de la aplicación
let tasks = [];
let currentFilter = 'todas';
let currentCategory = 'todas';
let currentPriority = 'todas';
let currentSort = 'fechaCreacion';
let searchQuery = '';
let currentView = 'list';
let soundEnabled = true;

// Estado de Deshacer (Undo)
let undoBuffer = null;
let undoTimer = null;

// Tareas de demostración enriquecidas
const defaultTasks = [
  {
    id: '1',
    title: 'Completar informe trimestral y enviar al equipo',
    notes: 'Revisar métricas clave y balance financiero del periodo.',
    category: 'Trabajo',
    priority: 'alta',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    completed: false,
    pinned: true,
    subtasks: [
      { id: '1-1', text: 'Recopilar métricas de ventas', completed: true },
      { id: '1-2', text: 'Redactar conclusiones principales', completed: false },
      { id: '1-3', text: 'Exportar a PDF y enviar por correo', completed: false }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '2',
    title: 'Comprar frutas, verduras frescas y café en grano',
    notes: 'Comprar en el mercado local o supermercado.',
    category: 'Hogar',
    priority: 'media',
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    pinned: false,
    subtasks: [],
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: '3',
    title: 'Leer 30 minutos de un libro de desarrollo personal',
    notes: 'Capítulo 4 sobre hábitos atómicos.',
    category: 'Personal',
    priority: 'baja',
    dueDate: '',
    completed: true,
    pinned: false,
    subtasks: [],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// Elementos del DOM principales
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const toggleNotesBtn = document.getElementById('toggleNotesBtn');
const formNotesArea = document.getElementById('formNotesArea');
const taskNotesInput = document.getElementById('taskNotesInput');
const categorySelect = document.getElementById('categorySelect');
const prioritySelect = document.getElementById('prioritySelect');
const dueDateInput = document.getElementById('dueDateInput');
const quickDateBtns = document.querySelectorAll('.btn-quick-date');

const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const filterPills = document.querySelectorAll('.pill-btn');
const statItems = document.querySelectorAll('.stat-item');
const categoryFilter = document.getElementById('categoryFilter');
const priorityFilter = document.getElementById('priorityFilter');
const sortSelect = document.getElementById('sortSelect');

// Vistas
const viewListBtn = document.getElementById('viewListBtn');
const viewKanbanBtn = document.getElementById('viewKanbanBtn');
const listView = document.getElementById('listView');
const kanbanView = document.getElementById('kanbanView');
const kanbanTodoTasks = document.getElementById('kanbanTodoTasks');
const kanbanTodayTasks = document.getElementById('kanbanTodayTasks');
const kanbanDoneTasks = document.getElementById('kanbanDoneTasks');
const kanbanCountTodo = document.getElementById('kanbanCountTodo');
const kanbanCountToday = document.getElementById('kanbanCountToday');
const kanbanCountDone = document.getElementById('kanbanCountDone');

// Estadísticas y progreso
const totalTasksEl = document.getElementById('totalTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const urgentTasksEl = document.getElementById('urgentTasks');
const completedTasksEl = document.getElementById('completedTasks');
const progressBarEl = document.getElementById('progressBar');
const progressPercentEl = document.getElementById('progressPercent');

// Acciones inferiores
const markAllDoneBtn = document.getElementById('markAllDoneBtn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const copyListBtn = document.getElementById('copyListBtn');
const exportBtn = document.getElementById('exportBtn');
const importFileInput = document.getElementById('importFileInput');

// Botones superiores
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');
const shortcutsBtn = document.getElementById('shortcutsBtn');
const shortcutsModal = document.getElementById('shortcutsModal');
const closeShortcutsModalBtn = document.getElementById('closeShortcutsModalBtn');
const closeShortcutsBtn = document.getElementById('closeShortcutsBtn');

// Modal de edición
const editModal = document.getElementById('editModal');
const closeEditModalBtn = document.getElementById('closeEditModalBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editTaskForm = document.getElementById('editTaskForm');
const editTaskId = document.getElementById('editTaskId');
const editTaskTitle = document.getElementById('editTaskTitle');
const editTaskNotes = document.getElementById('editTaskNotes');
const editTaskCategory = document.getElementById('editTaskCategory');
const editTaskPriority = document.getElementById('editTaskPriority');
const editTaskDueDate = document.getElementById('editTaskDueDate');
const modalSubtasksList = document.getElementById('modalSubtasksList');
const modalNewSubtaskInput = document.getElementById('modalNewSubtaskInput');
const modalAddSubtaskBtn = document.getElementById('modalAddSubtaskBtn');
let modalSubtasksCache = [];

// Pomodoro Widget
const pomodoroToggleBtn = document.getElementById('pomodoroToggleBtn');
const pomodoroWidget = document.getElementById('pomodoroWidget');
const pomodoroTimerDisplay = document.getElementById('pomodoroTimerDisplay');
const pomodoroModeLabel = document.getElementById('pomodoroModeLabel');
const pomodoroTaskName = document.getElementById('pomodoroTaskName');
const pomodoroStartBtn = document.getElementById('pomodoroStartBtn');
const pomodoroPlayIcon = document.getElementById('pomodoroPlayIcon');
const pomodoroResetBtn = document.getElementById('pomodoroResetBtn');
const pomodoroModeBtn = document.getElementById('pomodoroModeBtn');

let pomodoroDuration = 25 * 60;
let pomodoroRemaining = 25 * 60;
let pomodoroIsRunning = false;
let pomodoroMode = 'focus'; // 'focus' o 'break'
let pomodoroTimer = null;

// Toasts y Notificaciones
const toastContainer = document.getElementById('toastContainer');
const confettiCanvas = document.getElementById('confettiCanvas');

// ==========================================================================
// 1. Sintetizador de Sonido (Web Audio API - Cero dependencias externas)
// ==========================================================================
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSound(type) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'complete') {
      // Doble campana armónica y gratificante
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'add') {
      // Pop positivo rápido
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'delete') {
      // Tono suave descendente
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'star') {
      // Brillo agudo de estrella
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'pomodoro') {
      // Triplete de campanas suaves
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (e) {
    console.warn('Audio no disponible o bloqueado:', e);
  }
}

// ==========================================================================
// 2. Animación de Confeti Integrada (Pure Vanilla Canvas)
// ==========================================================================
function launchConfetti() {
  if (!confettiCanvas) return;
  const ctx = confettiCanvas.getContext('2d');
  const width = (confettiCanvas.width = window.innerWidth);
  const height = (confettiCanvas.height = window.innerHeight);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
  const particles = [];
  const particleCount = 70;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: width * (0.3 + Math.random() * 0.4),
      y: height * 0.4,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -14 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      gravity: 0.35,
      opacity: 1
    });
  }

  let animationFrame;
  function updateConfetti() {
    ctx.clearRect(0, 0, width, height);
    let alive = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.vRot;
      p.opacity -= 0.012;

      if (p.opacity > 0 && p.y < height) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        ctx.restore();
      }
    });

    if (alive) {
      animationFrame = requestAnimationFrame(updateConfetti);
    } else {
      ctx.clearRect(0, 0, width, height);
      cancelAnimationFrame(animationFrame);
    }
  }

  updateConfetti();
}

// ==========================================================================
// 3. Inicialización y Persistencia
// ==========================================================================
function init() {
  loadPreferences();
  loadTasks();
  setupEventListeners();
  render();
}

function loadPreferences() {
  // Tema
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(savedTheme);

  // Sonido
  const savedSound = localStorage.getItem(SOUND_KEY);
  soundEnabled = savedSound !== null ? savedSound === 'true' : true;
  updateSoundUI();

  // Vista
  const savedView = localStorage.getItem(VIEW_KEY) || 'list';
  switchView(savedView);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  if (themeToggleBtn) {
    if (theme === 'dark') {
      themeIcon.textContent = '☀️';
      themeText.textContent = 'Claro';
    } else {
      themeIcon.textContent = '🌙';
      themeText.textContent = 'Oscuro';
    }
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem(SOUND_KEY, soundEnabled);
  updateSoundUI();
  if (soundEnabled) {
    playSound('add');
    showToast('Sonido activado 🔊');
  } else {
    showToast('Sonido silenciado 🔇');
  }
}

function updateSoundUI() {
  if (soundIcon) {
    soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
  }
  if (soundToggleBtn) {
    soundToggleBtn.classList.toggle('active', soundEnabled);
  }
}

function switchView(viewName) {
  currentView = viewName;
  localStorage.setItem(VIEW_KEY, viewName);

  if (viewListBtn && viewKanbanBtn) {
    viewListBtn.classList.toggle('active', viewName === 'list');
    viewKanbanBtn.classList.toggle('active', viewName === 'kanban');
  }

  if (listView && kanbanView) {
    if (viewName === 'list') {
      listView.style.display = 'flex';
      kanbanView.style.display = 'none';
    } else {
      listView.style.display = 'none';
      kanbanView.style.display = 'grid';
    }
  }
  render();
}

// Cargar y normalizar tareas
function loadTasks() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        tasks = parsed.map(normalizeTask);
      } else {
        tasks = [...defaultTasks];
      }
    } catch (e) {
      console.error('Error al cargar datos:', e);
      tasks = [...defaultTasks];
    }
  } else {
    tasks = [...defaultTasks];
    saveTasks();
  }
}

// Asegura que las tareas tengan todos los campos requeridos y soporte formato tareas.json
function normalizeTask(t) {
  return {
    id: t.id || t.Id || Date.now().toString() + Math.random().toString(36).substring(2, 5),
    title: t.title || t.Titulo || 'Tarea sin título',
    notes: t.notes || t.Notas || '',
    category: t.category || t.Categoria || 'Trabajo',
    priority: (t.priority || t.Prioridad || 'media').toLowerCase(),
    dueDate: t.dueDate || t.FechaLimite || '',
    completed: !!(t.completed !== undefined ? t.completed : t.Completada),
    pinned: !!t.pinned,
    subtasks: Array.isArray(t.subtasks)
      ? t.subtasks.map(st => ({
          id: st.id || Date.now().toString() + Math.random().toString(36).substring(2, 4),
          text: st.text || '',
          completed: !!st.completed
        }))
      : [],
    createdAt: t.createdAt || t.FechaCreacion || new Date().toISOString()
  };
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ==========================================================================
// 4. Configuración de Eventos del DOM
// ==========================================================================
function setupEventListeners() {
  // Formulario principal
  taskForm.addEventListener('submit', handleAddTask);

  // Toggle de notas en formulario
  toggleNotesBtn.addEventListener('click', () => {
    formNotesArea.classList.toggle('open');
    if (formNotesArea.classList.contains('open')) {
      taskNotesInput.focus();
    }
  });

  // Botones de fecha rápida
  quickDateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const days = parseInt(btn.dataset.days, 10);
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      dueDateInput.value = targetDate.toISOString().split('T')[0];
    });
  });

  // Búsqueda
  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase().trim();
    clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
    render();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    searchInput.focus();
    render();
  });

  // Filtros de estado (Pills)
  filterPills.forEach(btn => {
    btn.addEventListener('click', () => {
      filterPills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      syncStatItemActive(currentFilter);
      render();
    });
  });

  // Click en tarjetas de estadística para filtrar rápidamente
  statItems.forEach(item => {
    item.addEventListener('click', () => {
      const filter = item.dataset.statFilter;
      currentFilter = filter;
      syncFilterPillActive(filter);
      syncStatItemActive(filter);
      render();
    });
  });

  // Filtros secundarios
  categoryFilter.addEventListener('change', e => {
    currentCategory = e.target.value;
    render();
  });

  priorityFilter.addEventListener('change', e => {
    currentPriority = e.target.value;
    render();
  });

  sortSelect.addEventListener('change', e => {
    currentSort = e.target.value;
    render();
  });

  // Conmutador de vistas (Lista / Kanban)
  viewListBtn.addEventListener('click', () => switchView('list'));
  viewKanbanBtn.addEventListener('click', () => switchView('kanban'));

  // Acciones en lote e inferiores
  markAllDoneBtn.addEventListener('click', handleMarkAllDone);
  clearCompletedBtn.addEventListener('click', handleClearCompleted);
  copyListBtn.addEventListener('click', handleCopyList);
  exportBtn.addEventListener('click', handleExportTasks);
  importFileInput.addEventListener('change', handleImportTasks);

  // Botones de encabezado
  themeToggleBtn.addEventListener('click', toggleTheme);
  soundToggleBtn.addEventListener('click', toggleSound);

  // Atajos modal
  shortcutsBtn.addEventListener('click', () => shortcutsModal.classList.add('open'));
  closeShortcutsModalBtn.addEventListener('click', () => shortcutsModal.classList.remove('open'));
  closeShortcutsBtn.addEventListener('click', () => shortcutsModal.classList.remove('open'));
  shortcutsModal.addEventListener('click', e => {
    if (e.target === shortcutsModal) shortcutsModal.classList.remove('open');
  });

  // Modal de edición
  closeEditModalBtn.addEventListener('click', closeEditModal);
  cancelEditBtn.addEventListener('click', closeEditModal);
  editModal.addEventListener('click', e => {
    if (e.target === editModal) closeEditModal();
  });
  editTaskForm.addEventListener('submit', handleSaveEditModal);

  // Subtareas en modal
  modalAddSubtaskBtn.addEventListener('click', handleAddModalSubtask);
  modalNewSubtaskInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddModalSubtask();
    }
  });

  // Pomodoro
  pomodoroToggleBtn.addEventListener('click', togglePomodoroWidget);
  pomodoroStartBtn.addEventListener('click', togglePomodoroTimer);
  pomodoroResetBtn.addEventListener('click', resetPomodoroTimer);
  pomodoroModeBtn.addEventListener('click', togglePomodoroMode);

  // Atajos globales de teclado
  document.addEventListener('keydown', handleGlobalKeydown);

  // Drag & drop en columnas Kanban
  setupKanbanDropZones();
}

function syncStatItemActive(filter) {
  statItems.forEach(item => {
    item.classList.toggle('active', item.dataset.statFilter === filter);
  });
}

function syncFilterPillActive(filter) {
  filterPills.forEach(pill => {
    pill.classList.toggle('active', pill.dataset.filter === filter);
  });
}

// ==========================================================================
// 5. Atajos de Teclado
// ==========================================================================
function handleGlobalKeydown(e) {
  // Ignorar si el usuario está escribiendo en un input o textarea
  const tag = e.target.tagName.toLowerCase();
  const isEditing = tag === 'input' || tag === 'textarea' || tag === 'select';

  if (e.key === 'Escape') {
    if (editModal.classList.contains('open')) {
      closeEditModal();
      return;
    }
    if (shortcutsModal.classList.contains('open')) {
      shortcutsModal.classList.remove('open');
      return;
    }
    if (searchInput === document.activeElement) {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.style.display = 'none';
      searchInput.blur();
      render();
      return;
    }
    if (isEditing) {
      e.target.blur();
    }
  }

  if (isEditing) return;

  if (e.key === 'n' || e.key === 'N') {
    e.preventDefault();
    taskInput.focus();
  } else if (e.key === '/') {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  } else if (e.key === 'd' || e.key === 'D') {
    e.preventDefault();
    toggleTheme();
  } else if (e.key === 'm' || e.key === 'M') {
    e.preventDefault();
    switchView(currentView === 'list' ? 'kanban' : 'list');
  } else if (e.key === 'p' || e.key === 'P') {
    e.preventDefault();
    togglePomodoroWidget();
  } else if (e.key === '?') {
    e.preventDefault();
    shortcutsModal.classList.add('open');
  }
}

// ==========================================================================
// 6. Lógica de Tareas (CRUD y Acciones)
// ==========================================================================
function handleAddTask(e) {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  const newTask = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 4),
    title: title,
    notes: taskNotesInput.value.trim(),
    category: categorySelect.value,
    priority: prioritySelect.value,
    dueDate: dueDateInput.value,
    completed: false,
    pinned: false,
    subtasks: [],
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask);
  saveTasks();

  // Reset de formulario
  taskForm.reset();
  formNotesArea.classList.remove('open');
  playSound('add');
  showToast(`Tarea agregada: "${truncate(title, 30)}"`);
  render();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  saveTasks();

  if (task.completed) {
    playSound('complete');
    // Celebrar si se completaron todas o si era de alta prioridad
    const allDone = tasks.length > 0 && tasks.every(t => t.completed);
    if (allDone || task.priority === 'alta') {
      launchConfetti();
    }
    showToast(`✓ Tarea completada: "${truncate(task.title, 25)}"`);
  } else {
    playSound('add');
  }

  render();
}

function togglePinTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.pinned = !task.pinned;
  saveTasks();
  playSound('star');
  showToast(task.pinned ? '⭐ Tarea destacada al inicio' : 'Tarea desmarcada de destacadas');
  render();
}

function deleteTask(id) {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return;

  const deletedTask = tasks[index];
  tasks.splice(index, 1);
  saveTasks();
  playSound('delete');

  // Guardar en buffer para Deshacer
  setUndoBuffer({
    type: 'single',
    task: deletedTask,
    index: index,
    message: `Tarea eliminada: "${truncate(deletedTask.title, 25)}"`
  });

  render();
}

// Subtareas en la tarjeta
function toggleSubtask(taskId, subtaskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const st = task.subtasks.find(s => s.id === subtaskId);
  if (!st) return;

  st.completed = !st.completed;

  // Si todas las subtareas se completan, sugerir o auto-marcar
  const allSubtasksDone = task.subtasks.length > 0 && task.subtasks.every(s => s.completed);
  if (allSubtasksDone && !task.completed) {
    task.completed = true;
    playSound('complete');
    launchConfetti();
    showToast(`¡Todas las subtareas completadas! Tarea marcada como hecha.`);
  } else {
    playSound('add');
  }

  saveTasks();
  render();
}

// Marcar todas
function handleMarkAllDone() {
  const pending = tasks.filter(t => !t.completed);
  if (pending.length === 0) {
    showToast('Todas las tareas ya están completadas 👍');
    return;
  }

  tasks.forEach(t => (t.completed = true));
  saveTasks();
  playSound('complete');
  launchConfetti();
  showToast(`¡${pending.length} tarea(s) marcadas como completadas! 🎉`);
  render();
}

// Limpiar completadas
function handleClearCompleted() {
  const completed = tasks.filter(t => t.completed);
  if (completed.length === 0) {
    showToast('No hay tareas completadas para eliminar.');
    return;
  }

  const previousTasks = [...tasks];
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  playSound('delete');

  setUndoBuffer({
    type: 'multiple',
    previousList: previousTasks,
    message: `${completed.length} tareas completadas eliminadas`
  });

  render();
}

// ==========================================================================
// 7. Sistema de Deshacer (Undo) con Toast
// ==========================================================================
function setUndoBuffer(data) {
  if (undoTimer) clearTimeout(undoTimer);
  undoBuffer = data;

  showToast(data.message, true);

  undoTimer = setTimeout(() => {
    undoBuffer = null;
  }, 6000);
}

function executeUndo() {
  if (!undoBuffer) return;

  if (undoBuffer.type === 'single') {
    tasks.splice(undoBuffer.index, 0, undoBuffer.task);
  } else if (undoBuffer.type === 'multiple') {
    tasks = undoBuffer.previousList;
  }

  saveTasks();
  playSound('add');
  undoBuffer = null;
  if (undoTimer) clearTimeout(undoTimer);

  // Cerrar toasts actuales
  toastContainer.innerHTML = '';
  showToast('Acción deshecha con éxito ↩️');
  render();
}

function showToast(message, withUndo = false) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${escapeHTML(message)}</span>`;

  if (withUndo) {
    const undoBtn = document.createElement('button');
    undoBtn.className = 'toast-undo-btn';
    undoBtn.textContent = '↩ Deshacer';
    undoBtn.addEventListener('click', executeUndo);
    toast.appendChild(undoBtn);
  }

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  }, 5000);
}

// ==========================================================================
// 8. Modal de Edición Completa
// ==========================================================================
function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editTaskId.value = task.id;
  editTaskTitle.value = task.title;
  editTaskNotes.value = task.notes || '';
  editTaskCategory.value = task.category || 'Trabajo';
  editTaskPriority.value = task.priority || 'media';
  editTaskDueDate.value = task.dueDate || '';

  // Clonar subtareas para edición en caché
  modalSubtasksCache = (task.subtasks || []).map(st => ({ ...st }));
  renderModalSubtasks();

  editModal.classList.add('open');
  editTaskTitle.focus();
}

function closeEditModal() {
  editModal.classList.remove('open');
  modalSubtasksCache = [];
}

function renderModalSubtasks() {
  modalSubtasksList.innerHTML = '';
  if (modalSubtasksCache.length === 0) {
    modalSubtasksList.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">Sin subtareas añadidas todavía.</span>`;
    return;
  }

  modalSubtasksCache.forEach((st, idx) => {
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; background: var(--bg-primary); padding: 0.35rem 0.6rem; border-radius: 6px; border: 1px solid var(--border-color);';
    row.innerHTML = `
      <input type="checkbox" ${st.completed ? 'checked' : ''} style="cursor: pointer;">
      <span style="flex: 1; font-size: 0.85rem; ${st.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${escapeHTML(st.text)}</span>
      <button type="button" style="background: none; border: none; color: var(--danger); cursor: pointer; font-size: 0.85rem; padding: 2px;">✕</button>
    `;

    const chk = row.querySelector('input');
    chk.addEventListener('change', () => {
      st.completed = chk.checked;
      renderModalSubtasks();
    });

    const del = row.querySelector('button');
    del.addEventListener('click', () => {
      modalSubtasksCache.splice(idx, 1);
      renderModalSubtasks();
    });

    modalSubtasksList.appendChild(row);
  });
}

function handleAddModalSubtask() {
  const text = modalNewSubtaskInput.value.trim();
  if (!text) return;

  modalSubtasksCache.push({
    id: Date.now().toString() + Math.random().toString(36).substring(2, 4),
    text: text,
    completed: false
  });

  modalNewSubtaskInput.value = '';
  modalNewSubtaskInput.focus();
  renderModalSubtasks();
}

function handleSaveEditModal(e) {
  e.preventDefault();
  const id = editTaskId.value;
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const newTitle = editTaskTitle.value.trim();
  if (!newTitle) return;

  task.title = newTitle;
  task.notes = editTaskNotes.value.trim();
  task.category = editTaskCategory.value;
  task.priority = editTaskPriority.value;
  task.dueDate = editTaskDueDate.value;
  task.subtasks = [...modalSubtasksCache];

  saveTasks();
  closeEditModal();
  playSound('add');
  showToast('Tarea actualizada correctamente ✨');
  render();
}

// ==========================================================================
// 9. Copiar, Exportar e Importar
// ==========================================================================
function handleCopyList() {
  if (tasks.length === 0) {
    showToast('No hay tareas para copiar.');
    return;
  }

  let text = `# 📋 Lista de Tareas (${new Date().toLocaleDateString()})\n\n`;
  tasks.forEach(t => {
    const status = t.completed ? '[x]' : '[ ]';
    const prio = t.priority ? `[${t.priority.toUpperCase()}]` : '';
    const date = t.dueDate ? `(Plazo: ${t.dueDate})` : '';
    text += `- ${status} ${t.title} ${prio} ${date}\n`;
    if (t.notes) {
      text += `  > ${t.notes}\n`;
    }
    if (t.subtasks && t.subtasks.length > 0) {
      t.subtasks.forEach(st => {
        text += `    - ${st.completed ? '[x]' : '[ ]'} ${st.text}\n`;
      });
    }
  });

  navigator.clipboard.writeText(text).then(() => {
    playSound('add');
    showToast('¡Lista copiada al portapapeles en formato Markdown! 📋');
  }).catch(() => {
    showToast('No se pudo acceder al portapapeles.');
  });
}

function handleExportTasks() {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute('href', dataStr);
  dlAnchorElem.setAttribute('download', `tareas_${new Date().toISOString().split('T')[0]}.json`);
  dlAnchorElem.click();
  showToast('Archivo JSON exportado con éxito 📥');
}

function handleImportTasks(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const imported = JSON.parse(event.target.result);
      let listToImport = [];

      if (Array.isArray(imported)) {
        listToImport = imported;
      } else if (imported && typeof imported === 'object') {
        // En caso de que sea un objeto único (como tareas.json de PowerShell si tiene 1 sola tarea)
        listToImport = [imported];
      }

      if (listToImport.length > 0) {
        tasks = listToImport.map(normalizeTask);
        saveTasks();
        playSound('add');
        launchConfetti();
        showToast(`Se importaron ${tasks.length} tarea(s) correctamente 📤`);
        render();
      } else {
        showToast('El archivo no contiene tareas válidas.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error al leer o interpretar el archivo JSON.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// ==========================================================================
// 10. Temporizador Pomodoro
// ==========================================================================
function togglePomodoroWidget() {
  const isHidden = pomodoroWidget.style.display === 'none';
  pomodoroWidget.style.display = isHidden ? 'flex' : 'none';
  pomodoroToggleBtn.classList.toggle('active', isHidden);
}

function togglePomodoroTimer() {
  if (pomodoroIsRunning) {
    pausePomodoroTimer();
  } else {
    startPomodoroTimer();
  }
}

function startPomodoroTimer() {
  pomodoroIsRunning = true;
  pomodoroStartBtn.innerHTML = '<span>⏸</span> Pausar';
  pomodoroPlayIcon.textContent = '⏸';

  pomodoroTimer = setInterval(() => {
    pomodoroRemaining--;
    updatePomodoroDisplay();

    if (pomodoroRemaining <= 0) {
      clearInterval(pomodoroTimer);
      pomodoroIsRunning = false;
      pomodoroStartBtn.innerHTML = '<span>▶</span> Iniciar';
      playSound('pomodoro');
      launchConfetti();

      if (pomodoroMode === 'focus') {
        showToast('¡Sesión de Pomodoro completada! Tómate un descanso ☕');
        setPomodoroMode('break');
      } else {
        showToast('¡Descanso terminado! Listo para enfocarte 🚀');
        setPomodoroMode('focus');
      }
    }
  }, 1000);
}

function pausePomodoroTimer() {
  pomodoroIsRunning = false;
  clearInterval(pomodoroTimer);
  pomodoroStartBtn.innerHTML = '<span>▶</span> Reanudar';
}

function resetPomodoroTimer() {
  clearInterval(pomodoroTimer);
  pomodoroIsRunning = false;
  pomodoroRemaining = pomodoroDuration;
  pomodoroStartBtn.innerHTML = '<span>▶</span> Iniciar';
  updatePomodoroDisplay();
}

function setPomodoroMode(mode) {
  pomodoroMode = mode;
  if (mode === 'focus') {
    pomodoroDuration = 25 * 60;
    pomodoroRemaining = 25 * 60;
    pomodoroModeLabel.textContent = 'Modo Enfoque (25m)';
    pomodoroModeBtn.textContent = '☕ Descanso (5m)';
  } else {
    pomodoroDuration = 5 * 60;
    pomodoroRemaining = 5 * 60;
    pomodoroModeLabel.textContent = 'Modo Descanso (5m)';
    pomodoroModeBtn.textContent = '🎯 Enfoque (25m)';
  }
  resetPomodoroTimer();
}

function togglePomodoroMode() {
  setPomodoroMode(pomodoroMode === 'focus' ? 'break' : 'focus');
}

function updatePomodoroDisplay() {
  const m = Math.floor(pomodoroRemaining / 60);
  const s = pomodoroRemaining % 60;
  const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  pomodoroTimerDisplay.textContent = timeStr;
}

function setPomodoroFocusTask(taskTitle) {
  pomodoroTaskName.textContent = taskTitle ? `Enfocado en: "${truncate(taskTitle, 35)}"` : 'Enfoque general';
  if (pomodoroWidget.style.display === 'none') {
    togglePomodoroWidget();
  }
  showToast(`Pomodoro enfocado en: "${truncate(taskTitle, 25)}" ⏱️`);
}

// ==========================================================================
// 11. Drag and Drop para Tablero Kanban
// ==========================================================================
let draggedTaskId = null;

function setupKanbanDropZones() {
  const columns = document.querySelectorAll('.kanban-col');

  columns.forEach(col => {
    col.addEventListener('dragover', e => {
      e.preventDefault();
      col.classList.add('drag-over');
    });

    col.addEventListener('dragleave', () => {
      col.classList.remove('drag-over');
    });

    col.addEventListener('drop', e => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const targetCol = col.dataset.col;

      if (!draggedTaskId) return;
      const task = tasks.find(t => t.id === draggedTaskId);
      if (!task) return;

      if (targetCol === 'completadas') {
        if (!task.completed) {
          task.completed = true;
          playSound('complete');
          showToast(`✓ Tarea movida a Completadas`);
        }
      } else if (targetCol === 'hoy') {
        task.completed = false;
        task.dueDate = new Date().toISOString().split('T')[0];
        playSound('add');
        showToast(`Tarea asignada para Hoy`);
      } else if (targetCol === 'pendientes') {
        task.completed = false;
        playSound('add');
        showToast(`Tarea marcada como pendiente`);
      }

      saveTasks();
      draggedTaskId = null;
      render();
    });
  });
}

// ==========================================================================
// 12. Renderizado Principal
// ==========================================================================
function render() {
  const today = new Date().toISOString().split('T')[0];

  // 1. Estadísticas
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const urgent = tasks.filter(t => !t.completed && t.dueDate && t.dueDate <= today).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  totalTasksEl.textContent = total;
  pendingTasksEl.textContent = pending;
  urgentTasksEl.textContent = urgent;
  completedTasksEl.textContent = completed;
  progressBarEl.style.width = `${percent}%`;
  progressPercentEl.textContent = `${percent}%`;

  // 2. Filtrado de tareas
  let filtered = tasks.filter(t => {
    // Filtro de estado
    if (currentFilter === 'pendientes' && t.completed) return false;
    if (currentFilter === 'completadas' && !t.completed) return false;
    if (currentFilter === 'destacadas' && !t.pinned) return false;
    if (currentFilter === 'urgentes') {
      if (t.completed) return false;
      const isUrgent = (t.dueDate && t.dueDate <= today) || t.priority === 'alta';
      if (!isUrgent) return false;
    }

    // Filtro de categoría
    if (currentCategory !== 'todas' && t.category !== currentCategory) return false;

    // Filtro de prioridad
    if (currentPriority !== 'todas' && t.priority !== currentPriority) return false;

    // Filtro de búsqueda
    if (searchQuery) {
      const inTitle = t.title.toLowerCase().includes(searchQuery);
      const inNotes = (t.notes || '').toLowerCase().includes(searchQuery);
      const inCategory = (t.category || '').toLowerCase().includes(searchQuery);
      if (!inTitle && !inNotes && !inCategory) return false;
    }

    return true;
  });

  // 3. Ordenamiento
  filtered.sort((a, b) => {
    // Las destacadas (pinned) siempre se muestran arriba
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }

    if (currentSort === 'fechaLimite') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    } else if (currentSort === 'prioridad') {
      const pWeights = { alta: 3, media: 2, baja: 1 };
      return (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
    } else if (currentSort === 'alfabetico') {
      return a.title.localeCompare(b.title);
    } else {
      // fechaCreacion descendente
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // 4. Renderizar Vista según la pestaña activa
  if (currentView === 'list') {
    renderListView(filtered);
  } else {
    renderKanbanView(tasks); // El Kanban muestra las columnas completas
  }
}

function renderListView(filtered) {
  listView.innerHTML = '';

  if (filtered.length === 0) {
    listView.innerHTML = `
      <div class="empty-state">
        <span>✨</span>
        <h3>No se encontraron tareas</h3>
        <p>Prueba ajustando los filtros o crea una nueva tarea para comenzar.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(task => {
    const item = document.createElement('div');
    item.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''} ${task.pinned ? 'is-pinned' : ''}`;

    const priorityLabel = {
      alta: 'Alta',
      media: 'Media',
      baja: 'Baja'
    }[task.priority] || task.priority;

    // Subtareas info
    const subtasksTotal = (task.subtasks || []).length;
    const subtasksDone = (task.subtasks || []).filter(s => s.completed).length;
    const subtasksBadge = subtasksTotal > 0
      ? `<span class="badge badge-subtasks">☑️ ${subtasksDone}/${subtasksTotal} subtareas</span>`
      : '';

    item.innerHTML = `
      <div class="task-row-top">
        <div class="task-left">
          <div class="task-checkbox-custom" role="checkbox" aria-checked="${task.completed}" title="${task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div class="task-content">
            <div class="task-title">${escapeHTML(task.title)}</div>
            ${task.notes ? `<div class="task-desc">${escapeHTML(task.notes)}</div>` : ''}
            <div class="task-badges">
              <span class="badge badge-cat">📁 ${escapeHTML(task.category)}</span>
              <span class="badge badge-${task.priority}">⚡ ${priorityLabel}</span>
              ${formatDateBadge(task.dueDate)}
              ${subtasksBadge}
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn-icon star ${task.pinned ? 'active' : ''}" title="${task.pinned ? 'Desmarcar destacada' : 'Fijar como destacada'}">⭐</button>
          <button class="btn-icon pomodoro" title="Enfocarse en esta tarea con Pomodoro">⏱️</button>
          <button class="btn-icon edit" title="Editar tarea">✏️</button>
          <button class="btn-icon delete" title="Eliminar tarea">🗑️</button>
        </div>
      </div>
    `;

    // Renderizar subtareas inline si existen
    if (task.subtasks && task.subtasks.length > 0) {
      const subContainer = document.createElement('div');
      subContainer.className = 'subtasks-container';

      task.subtasks.forEach(st => {
        const stRow = document.createElement('div');
        stRow.className = `subtask-item ${st.completed ? 'completed' : ''}`;
        stRow.innerHTML = `
          <input type="checkbox" class="subtask-checkbox" ${st.completed ? 'checked' : ''}>
          <span>${escapeHTML(st.text)}</span>
        `;

        stRow.querySelector('.subtask-checkbox').addEventListener('change', () => {
          toggleSubtask(task.id, st.id);
        });

        subContainer.appendChild(stRow);
      });

      item.appendChild(subContainer);
    }

    // Eventos
    const chk = item.querySelector('.task-checkbox-custom');
    chk.addEventListener('click', () => toggleTask(task.id));

    const starBtn = item.querySelector('.btn-icon.star');
    starBtn.addEventListener('click', () => togglePinTask(task.id));

    const pomoBtn = item.querySelector('.btn-icon.pomodoro');
    pomoBtn.addEventListener('click', () => setPomodoroFocusTask(task.title));

    const editBtn = item.querySelector('.btn-icon.edit');
    editBtn.addEventListener('click', () => openEditModal(task.id));

    const delBtn = item.querySelector('.btn-icon.delete');
    delBtn.addEventListener('click', () => deleteTask(task.id));

    listView.appendChild(item);
  });
}

function renderKanbanView(allTasks) {
  const today = new Date().toISOString().split('T')[0];

  kanbanTodoTasks.innerHTML = '';
  kanbanTodayTasks.innerHTML = '';
  kanbanDoneTasks.innerHTML = '';

  // Filtrar según búsqueda si aplica
  let filtered = allTasks;
  if (searchQuery) {
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(searchQuery) ||
      (t.notes || '').toLowerCase().includes(searchQuery)
    );
  }

  const todoList = filtered.filter(t => !t.completed && (!t.dueDate || t.dueDate > today));
  const todayList = filtered.filter(t => !t.completed && t.dueDate && t.dueDate <= today);
  const doneList = filtered.filter(t => t.completed);

  kanbanCountTodo.textContent = todoList.length;
  kanbanCountToday.textContent = todayList.length;
  kanbanCountDone.textContent = doneList.length;

  appendKanbanCards(kanbanTodoTasks, todoList);
  appendKanbanCards(kanbanTodayTasks, todayList);
  appendKanbanCards(kanbanDoneTasks, doneList);
}

function appendKanbanCards(container, cardList) {
  if (cardList.length === 0) {
    container.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-light); text-align: center; padding: 1.5rem 0; font-style: italic;">Sin tareas aquí</span>`;
    return;
  }

  cardList.forEach(task => {
    const card = document.createElement('div');
    card.className = `kanban-card priority-${task.priority}`;
    card.draggable = true;
    card.dataset.id = task.id;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.35rem;">
        <span class="kanban-card-title">${escapeHTML(task.title)}</span>
        <button class="btn-icon delete" style="width: 22px; height: 22px; font-size: 0.75rem;" title="Eliminar">🗑️</button>
      </div>
      <div class="task-badges" style="margin-top: 0.2rem;">
        <span class="badge badge-${task.priority}">⚡ ${task.priority.toUpperCase()}</span>
        <span class="badge badge-cat">📁 ${escapeHTML(task.category)}</span>
        ${task.dueDate ? formatDateBadge(task.dueDate) : ''}
      </div>
    `;

    card.addEventListener('dragstart', () => {
      draggedTaskId = task.id;
      card.classList.add('is-dragging');
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('is-dragging');
    });

    card.addEventListener('click', e => {
      if (!e.target.classList.contains('delete')) {
        openEditModal(task.id);
      }
    });

    card.querySelector('.btn-icon.delete').addEventListener('click', e => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    container.appendChild(card);
  });
}

// ==========================================================================
// 13. Formato y Utilidades
// ==========================================================================
function formatDateBadge(dateStr) {
  if (!dateStr) return '';
  const today = new Date().toISOString().split('T')[0];
  const [y, m, d] = dateStr.split('-');
  const display = `${d}/${m}/${y}`;

  if (dateStr < today) {
    return `<span class="badge badge-date overdue">⚠️ Venció ${display}</span>`;
  } else if (dateStr === today) {
    return `<span class="badge badge-date today">📅 Hoy (${display})</span>`;
  }
  return `<span class="badge badge-date">📅 ${display}</span>`;
}

function escapeHTML(str) {
  if (!str) return '';
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}

function truncate(str, max = 30) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '...' : str;
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', init);
