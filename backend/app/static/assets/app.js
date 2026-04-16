const state = {
  token: localStorage.getItem("gymTrackToken") || "",
  user: JSON.parse(localStorage.getItem("gymTrackUser") || "null"),
  workouts: [],
  progress: [],
  summary: {
    total_workouts: 0,
    total_exercises: 0,
    total_sets: 0,
    total_volume: 0,
  },
};

const elements = {
  authStatus: document.getElementById("auth-status"),
  heroUser: document.getElementById("hero-user"),
  heroSubtitle: document.getElementById("hero-subtitle"),
  logoutButton: document.getElementById("logout-button"),
  signupForm: document.getElementById("signup-form"),
  loginForm: document.getElementById("login-form"),
  workoutForm: document.getElementById("workout-form"),
  workoutsList: document.getElementById("workouts-list"),
  workoutsEmpty: document.getElementById("workouts-empty"),
  progressTable: document.getElementById("progress-table"),
  progressEmpty: document.getElementById("progress-empty"),
  toast: document.getElementById("toast"),
  metricWorkouts: document.getElementById("metric-workouts"),
  metricExercises: document.getElementById("metric-exercises"),
  metricSets: document.getElementById("metric-sets"),
  metricVolume: document.getElementById("metric-volume"),
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function showToast(message, isError = false) {
  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");
  elements.toast.style.background = isError ? "rgba(123, 29, 29, 0.96)" : "rgba(24, 21, 18, 0.94)";
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    elements.toast.classList.add("hidden");
  }, 2600);
}

async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(path, { ...options, headers });
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data && typeof data.detail === "string" ? data.detail : "Something went wrong.";
    throw new Error(detail);
  }

  return data;
}

function saveSession(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem("gymTrackToken", token);
  localStorage.setItem("gymTrackUser", JSON.stringify(user));
}

function clearSession() {
  state.token = "";
  state.user = null;
  state.workouts = [];
  state.progress = [];
  state.summary = {
    total_workouts: 0,
    total_exercises: 0,
    total_sets: 0,
    total_volume: 0,
  };
  localStorage.removeItem("gymTrackToken");
  localStorage.removeItem("gymTrackUser");
}

function formatDate(value) {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function renderHeader() {
  if (state.user) {
    elements.authStatus.textContent = `Signed in as ${state.user.email}`;
    elements.heroUser.textContent = `${state.user.full_name}, your progress dashboard is live.`;
    elements.heroSubtitle.textContent = "Add workouts, keep your set history tight, and keep chasing the next rep PR.";
    elements.logoutButton.classList.remove("hidden");
  } else {
    elements.authStatus.textContent = "Signed out";
    elements.heroUser.textContent = "Ready for your next session";
    elements.heroSubtitle.textContent = "Create an account or log in to start tracking your lifts.";
    elements.logoutButton.classList.add("hidden");
  }
}

function renderSummary() {
  elements.metricWorkouts.textContent = state.summary.total_workouts;
  elements.metricExercises.textContent = state.summary.total_exercises;
  elements.metricSets.textContent = state.summary.total_sets;
  elements.metricVolume.textContent = `${state.summary.total_volume.toFixed(1)} kg`;
}

function renderProgress() {
  const hasItems = state.progress.length > 0;
  elements.progressEmpty.classList.toggle("hidden", hasItems);
  elements.progressTable.innerHTML = hasItems
    ? state.progress
        .map(
          (item) => `
            <div class="progress-row">
              <div>
                <strong>${escapeHtml(item.exercise_name)}</strong>
                <span class="subtle">${item.total_sets} tracked sets</span>
              </div>
              <div class="progress-meta">
                <div>Best: ${item.best_weight.toFixed(1)} kg</div>
                <div>Volume: ${item.total_volume.toFixed(1)} kg</div>
              </div>
            </div>
          `,
        )
        .join("")
    : "";
}

function renderWorkouts() {
  const hasWorkouts = state.workouts.length > 0;
  elements.workoutsEmpty.classList.toggle("hidden", hasWorkouts || Boolean(state.user));

  if (!state.user && !hasWorkouts) {
    elements.workoutsEmpty.textContent = "Sign in to start creating workouts and logging sets.";
  } else if (state.user && !hasWorkouts) {
    elements.workoutsEmpty.textContent = "No workouts yet. Add your first training split above.";
  }

  elements.workoutsList.innerHTML = state.workouts
    .map(
      (workout) => `
        <article class="workout-card">
          <div class="workout-header">
            <div class="workout-title-group">
              <h3>${escapeHtml(workout.name)}</h3>
              <span class="subtle">${escapeHtml(workout.description || "No description yet")} • Updated ${formatDate(workout.updated_at)}</span>
            </div>
            <button type="button" data-action="delete-workout" data-workout-id="${workout.id}">Delete</button>
          </div>

          <form class="exercise-form" data-workout-id="${workout.id}">
            <div class="form-grid-compact">
              <input name="name" type="text" placeholder="Exercise name" required>
              <input name="notes" type="text" placeholder="Notes or cues">
              <button type="submit">Add exercise</button>
            </div>
          </form>

          <div class="exercise-list">
            ${
              workout.exercises.length
                ? workout.exercises
                    .map(
                      (exercise) => `
                        <div class="exercise-card">
                          <div class="exercise-header">
                            <div class="exercise-title-group">
                              <h4>${escapeHtml(exercise.name)}</h4>
                              <span class="subtle">${escapeHtml(exercise.notes || "No exercise notes")}</span>
                            </div>
                            <button type="button" data-action="delete-exercise" data-exercise-id="${exercise.id}">Remove</button>
                          </div>

                          <form class="set-form" data-exercise-id="${exercise.id}">
                            <div class="form-grid-compact">
                              <input name="reps" type="number" min="1" step="1" placeholder="Reps" required>
                              <input name="weight" type="number" min="0" step="0.5" placeholder="Weight (kg)" required>
                              <button type="submit">Add set</button>
                            </div>
                          </form>

                          <div class="set-list">
                            ${
                              exercise.sets.length
                                ? exercise.sets
                                    .map(
                                      (setItem) => `
                                        <div class="set-row">
                                          <span>${setItem.reps} reps x ${setItem.weight.toFixed(1)} kg</span>
                                          <span>${formatDate(setItem.performed_at)}</span>
                                        </div>
                                      `,
                                    )
                                    .join("")
                                : '<div class="subtle">No sets logged yet.</div>'
                            }
                          </div>
                        </div>
                      `,
                    )
                    .join("")
                : '<div class="subtle">No exercises added yet. Start with your first lift.</div>'
            }
          </div>
        </article>
      `,
    )
    .join("");
}

async function loadDashboard() {
  if (!state.token) {
    renderHeader();
    renderSummary();
    renderProgress();
    renderWorkouts();
    return;
  }

  try {
    const [workouts, summary, progress] = await Promise.all([
      apiFetch("/api/workouts"),
      apiFetch("/api/progress/summary"),
      apiFetch("/api/progress/exercises"),
    ]);

    state.workouts = workouts;
    state.summary = summary;
    state.progress = progress;
    renderHeader();
    renderSummary();
    renderProgress();
    renderWorkouts();
  } catch (error) {
    clearSession();
    renderHeader();
    renderSummary();
    renderProgress();
    renderWorkouts();
    showToast(error.message, true);
  }
}

async function handleAuth(event, path) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await apiFetch(path, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    saveSession(response.access_token, response.user);
    form.reset();
    showToast(path.includes("signup") ? "Account created." : "Logged in.");
    await loadDashboard();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function handleWorkoutSubmit(event) {
  event.preventDefault();
  if (!state.token) {
    showToast("Log in first to create workouts.", true);
    return;
  }

  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "").trim() || null,
  };

  try {
    await apiFetch("/api/workouts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    form.reset();
    showToast("Workout added.");
    await loadDashboard();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function handleWorkoutAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const action = target.dataset.action;
  if (!action) {
    return;
  }

  try {
    if (action === "delete-workout") {
      await apiFetch(`/api/workouts/${target.dataset.workoutId}`, { method: "DELETE" });
      showToast("Workout removed.");
    } else if (action === "delete-exercise") {
      await apiFetch(`/api/workouts/exercises/${target.dataset.exerciseId}`, { method: "DELETE" });
      showToast("Exercise removed.");
    } else {
      return;
    }

    await loadDashboard();
  } catch (error) {
    showToast(error.message, true);
  }
}

async function handleNestedForms(event) {
  event.preventDefault();
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const formData = new FormData(form);

  try {
    if (form.classList.contains("exercise-form")) {
      const payload = {
        name: String(formData.get("name") || "").trim(),
        notes: String(formData.get("notes") || "").trim() || null,
      };
      await apiFetch(`/api/workouts/${form.dataset.workoutId}/exercises`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showToast("Exercise added.");
    }

    if (form.classList.contains("set-form")) {
      const payload = {
        reps: Number(formData.get("reps")),
        weight: Number(formData.get("weight")),
      };
      await apiFetch(`/api/workouts/exercises/${form.dataset.exerciseId}/sets`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showToast("Set logged.");
    }

    form.reset();
    await loadDashboard();
  } catch (error) {
    showToast(error.message, true);
  }
}

elements.signupForm.addEventListener("submit", (event) => handleAuth(event, "/api/auth/signup"));
elements.loginForm.addEventListener("submit", (event) => handleAuth(event, "/api/auth/login"));
elements.workoutForm.addEventListener("submit", handleWorkoutSubmit);
elements.workoutsList.addEventListener("click", handleWorkoutAction);
elements.workoutsList.addEventListener("submit", handleNestedForms);
elements.logoutButton.addEventListener("click", () => {
  clearSession();
  renderHeader();
  renderSummary();
  renderProgress();
  renderWorkouts();
  showToast("Logged out.");
});

renderHeader();
renderSummary();
renderProgress();
renderWorkouts();
loadDashboard();
