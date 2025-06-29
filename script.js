document.addEventListener("DOMContentLoaded", () => {
  // Elementos de control
  const timerDisplay = document.getElementById("timer");
  const startBtn = document.getElementById("start");
  const pauseBtn = document.getElementById("pause");
  const resetBtn = document.getElementById("reset");
  const dingSound = document.getElementById("ding-sound");

  const inputWork = document.getElementById("input-work");
  const inputShortBreak = document.getElementById("input-short-break");
  const inputLongBreak = document.getElementById("input-long-break");
  const saveTimesBtn = document.getElementById("save-times");

  // Elementos de estadísticas
  const totalCyclesDisplay = document.getElementById("total-cycles");
  const totalWorkTimeDisplay = document.getElementById("total-work-time");
  const totalBreakTimeDisplay = document.getElementById("total-break-time");

  // Tiempos por defecto (en segundos)
  let workTime = 25 * 60;
  let shortBreakTime = 5 * 60;
  let longBreakTime = 15 * 60;

  let currentTime = workTime;
  let timer;
  let isRunning = false;
  let currentState = "work"; // "work", "short", "long"

  // Estadísticas
  let totalCycles = 0;         // ciclos completados (solo trabajo)
  let totalWorkTime = 0;       // segundos trabajados acumulados
  let totalBreakTime = 0;      // segundos descansados acumulados

  // Función para guardar estadísticas en localStorage
  function saveStats() {
    localStorage.setItem("pomodoroStats", JSON.stringify({
      totalCycles,
      totalWorkTime,
      totalBreakTime
    }));
  }

  // Función para cargar estadísticas de localStorage
  function loadStats() {
    const stats = JSON.parse(localStorage.getItem("pomodoroStats"));
    if (stats) {
      totalCycles = stats.totalCycles || 0;
      totalWorkTime = stats.totalWorkTime || 0;
      totalBreakTime = stats.totalBreakTime || 0;
    }
  }

  // Función para mostrar estadísticas en pantalla
  function updateStatsDisplay() {
    totalCyclesDisplay.textContent = `Ciclos completados: ${totalCycles}`;
    totalWorkTimeDisplay.textContent = `Tiempo trabajado: ${Math.floor(totalWorkTime / 60)} min`;
    totalBreakTimeDisplay.textContent = `Tiempo de descanso: ${Math.floor(totalBreakTime / 60)} min`;
  }

  // Cargar configuración desde localStorage
  function loadConfig() {
    const config = JSON.parse(localStorage.getItem("pomodoroConfig"));
    if (config) {
      workTime = config.workTime;
      shortBreakTime = config.shortBreakTime;
      longBreakTime = config.longBreakTime;

      inputWork.value = workTime / 60;
      inputShortBreak.value = shortBreakTime / 60;
      inputLongBreak.value = longBreakTime / 60;
    }
  }

  // Guardar configuración en localStorage
  function saveConfig() {
    workTime = parseInt(inputWork.value) * 60 || 25 * 60;
    shortBreakTime = parseInt(inputShortBreak.value) * 60 || 5 * 60;
    longBreakTime = parseInt(inputLongBreak.value) * 60 || 15 * 60;

    localStorage.setItem("pomodoroConfig", JSON.stringify({
      workTime, shortBreakTime, longBreakTime
    }));

    resetTimer();
    alert("¡Tiempos guardados y temporizador reiniciado!");
  }

  // Actualizar el display del timer
  function updateDisplay() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  // Actualizar la UI según el estado actual
  function updateStateUI() {
    document.body.classList.remove("state-work", "state-short", "state-long");

    if (currentState === "work") {
      document.body.classList.add("state-work");
    } else if (currentState === "short") {
      document.body.classList.add("state-short");
    } else if (currentState === "long") {
      document.body.classList.add("state-long");
    }
  }

  // Función que inicia el temporizador
  function startTimer() {
    if (!isRunning) {
      isRunning = true;
      timer = setInterval(() => {
        currentTime--;
        updateDisplay();

        // Acumular tiempo en estadísticas
        if (currentState === "work") {
          totalWorkTime++;
        } else {
          totalBreakTime++;
        }
        updateStatsDisplay();

        if (currentTime <= 0) {
          clearInterval(timer);
          isRunning = false;
          dingSound.play();

          if (Notification.permission === "granted") {
            new Notification("¡Tiempo terminado!", {
              body: currentState === "work" ? "¡Tómate un descanso! 🍵" : "¡Hora de trabajar! 💪",
              icon: "🍅"
            });
          }

          // Cambiar de estado y actualizar estadísticas
          if (currentState === "work") {
            totalCycles++;
            saveStats();

            currentState = "short";
            currentTime = shortBreakTime;
          } else {
            currentState = "work";
            currentTime = workTime;
          }

          updateStateUI();
          updateDisplay();
          alert("⏱ ¡Ciclo terminado! Cambio de estado.");
        }
      }, 1000);
    }
  }

  function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
    saveStats(); // guardar progreso parcial también
  }

  function resetTimer() {
    clearInterval(timer);
    isRunning = false;

    if (currentState === "work") currentTime = workTime;
    else if (currentState === "short") currentTime = shortBreakTime;
    else currentTime = longBreakTime;

    updateDisplay();
    updateStateUI();
    saveStats();
  }

  // Eventos para temporizador y configuración
  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);
  saveTimesBtn.addEventListener("click", saveConfig);

  // Inicialización
  loadConfig();
  loadStats();
  updateStatsDisplay();
  resetTimer();

  // Lista de tareas
  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");
  const taskList = document.getElementById("task-list");

  function saveTasks() {
    const tasks = [];
    taskList.querySelectorAll("li").forEach(li => {
      tasks.push({
        text: li.querySelector("span").textContent,
        completed: li.classList.contains("completed")
      });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks"));
    if (!tasks) return;
    tasks.forEach(task => {
      const li = document.createElement("li");
      if (task.completed) li.classList.add("completed");
      li.innerHTML = `
        <span>${task.text}</span>
        <div>
          <button class="complete-btn">✔️</button>
          <button class="delete-btn">🗑️</button>
        </div>
      `;
      taskList.appendChild(li);
    });
  }

  taskForm.addEventListener("submit", e => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (text !== "") {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${text}</span>
        <div>
          <button class="complete-btn">✔️</button>
          <button class="delete-btn">🗑️</button>
        </div>
      `;
      taskList.appendChild(li);
      taskInput.value = "";
      saveTasks();
    }
  });

  taskList.addEventListener("click", e => {
    const li = e.target.closest("li");
    if (!li) return;

    if (e.target.classList.contains("complete-btn")) {
      li.classList.toggle("completed");
      saveTasks();
    } else if (e.target.classList.contains("delete-btn")) {
      li.remove();
      saveTasks();
    }
  });

  loadTasks();

  // Modo oscuro
  const toggleDarkModeBtn = document.getElementById("toggle-dark-mode");

  function setDarkMode(enabled) {
    if (enabled) {
      document.body.classList.add("dark-mode");
      toggleDarkModeBtn.textContent = "☀️ Modo Claro";
      localStorage.setItem("darkMode", "enabled");
    } else {
      document.body.classList.remove("dark-mode");
      toggleDarkModeBtn.textContent = "🌙 Modo Oscuro";
      localStorage.setItem("darkMode", "disabled");
    }
  }

  const darkModeSaved = localStorage.getItem("darkMode") === "enabled";
  setDarkMode(darkModeSaved);

  toggleDarkModeBtn.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-mode");
    setDarkMode(!isDark);
  });

  // Pedir permiso para notificaciones si no está dado
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
});
