/* =====================================================================
   Field Journal — front end
   Talks to your existing DRF ModelViewSets using Django session auth
   (cookies + CSRF token), so make sure you're logged in via
   /accounts/login/ in the same browser session.

   >>> EDIT THIS BLOCK if your routes differ <<<
   ===================================================================== */
const API = {
  journal:       "/journal/journal/",        // JournalViewSet (router default)
  taskCheckbox:  "/main/taskcheckboxes/",    // TaskCheckBoxViewSet
  taskAmount:    "/main/task-amount/",       // TaskAmountViewSet
};

// You told me detail ops use `?id=` as a query param rather than a path
// segment. If that's not quite right, this is the only place to fix it.
function detailUrl(base, id) {
  return `${base}?id=${encodeURIComponent(id)}`;
}
// The `record` custom @action (PATCH) on BaseTaskViewSet — adjust the
// path shape here if your router mounts it differently.
function recordUrl(base, id) {
  return `${base}record/?id=${encodeURIComponent(id)}`;
}

/* ===================================================================
   Small helpers
   =================================================================== */
function getCookie(name) {
  const match = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return match ? decodeURIComponent(match[2]) : null;
}
const CSRF_TOKEN = () => getCookie("csrftoken");

async function api(url, { method = "GET", body, isForm = false } = {}) {
  const headers = {};
  if (method !== "GET") headers["X-CSRFToken"] = CSRF_TOKEN();
  if (body && !isForm) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    headers,
    credentials: "same-origin",
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  if (res.status === 401 || res.status === 403) {
    toast("Your session expired — please log in again", true);
    throw new Error("Not authenticated");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${url} failed (${res.status}): ${text.slice(0, 200)}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function toast(message, isError = false) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.toggle("error", isError);
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (el.hidden = true), 2600);
}

function escapeHtml(str) {
  return (str ?? "").toString()
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/* ===================================================================
   STATE
   =================================================================== */
const state = {
  activeTab: "checkbox",   // "checkbox" | "amount"
  checkboxTasks: [],
  amountTasks: [],
  journals: [],
};

/* ===================================================================
   INIT
   =================================================================== */
async function init() {
  try {
    await Promise.all([loadTasks(), loadJournals()]);
    renderTasks();
    renderJournals();
  } catch (err) {
    console.error(err);
  }
}

async function loadTasks() {
  const [cb, amt] = await Promise.all([
    api(API.taskCheckbox),
    api(API.taskAmount),
  ]);
  state.checkboxTasks = Array.isArray(cb) ? cb : cb.results || [];
  state.amountTasks = Array.isArray(amt) ? amt : amt.results || [];
}

async function loadJournals() {
  const data = await api(API.journal);
  state.journals = Array.isArray(data) ? data : data.results || [];
}

/* ===================================================================
   TABS
   =================================================================== */
document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    state.activeTab = btn.dataset.tab;
    document.getElementById("task-form-slot").innerHTML = "";
    renderTasks();
  });
});

/* ===================================================================
   TASK RENDERING
   =================================================================== */
function currentTaskList() {
  return state.activeTab === "checkbox" ? state.checkboxTasks : state.amountTasks;
}
function currentTaskApi() {
  return state.activeTab === "checkbox" ? API.taskCheckbox : API.taskAmount;
}

function isTaskDone(task) {
  return !!(task.record && task.record.is_finished);
}

function renderTasks() {
  const list = document.getElementById("task-list");
  const empty = document.getElementById("task-empty");
  const tasks = currentTaskList();

  list.innerHTML = "";
  empty.hidden = tasks.length > 0;

  tasks.forEach((task) => list.appendChild(renderTaskRow(task)));
}

function renderTaskRow(task) {
  const li = document.createElement("li");
  li.className = "task-row";
  li.dataset.id = task.id;

  const done = isTaskDone(task);
  const isAmount = state.activeTab === "amount";

  let progressHtml = "";
  if (isAmount) {
    const cur = task.current_amount ?? 0;
    const tot = task.total_amout ?? task.total_amount ?? 0;
    const pct = tot > 0 ? Math.min(100, Math.round((cur / tot) * 100)) : 0;
    progressHtml = `
      <div class="task-progress">
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="progress-label">${cur} / ${tot} ${escapeHtml(task.unit || "")}</div>
        <div class="amount-controls">
          <button class="amount-btn" data-action="dec" aria-label="Decrease">&minus;</button>
          <button class="amount-btn" data-action="inc" aria-label="Increase">&plus;</button>
        </div>
      </div>`;
  }

  li.innerHTML = `
    <div class="task-complete-bg">Done &#10003;</div>
    <div class="task-card" tabindex="0">
      <div class="task-main">
        <p class="task-name">${escapeHtml(task.name)}</p>
        <div class="task-meta">
          <span class="badge ${done ? "badge-status-done" : "badge-status-pending"}">${done ? "complete" : "pending"}</span>
          ${task.habit ? `<span class="badge badge-habit">habit #${escapeHtml(task.habit)}</span>` : ""}
          ${task.remind_at ? `<span class="badge">reminds ${fmtDate(task.remind_at)}</span>` : ""}
        </div>
        ${progressHtml}
      </div>
      <div class="task-actions">
        <button class="icon-btn" data-action="edit" aria-label="Edit task">&#9998;</button>
        <button class="icon-btn danger" data-action="delete" aria-label="Delete task">&#10005;</button>
      </div>
    </div>
  `;

  if (done) li.querySelector(".task-card").classList.add("is-done");

  wireSwipe(li, task);
  li.querySelector('[data-action="edit"]').addEventListener("click", () => openTaskForm(task));
  li.querySelector('[data-action="delete"]').addEventListener("click", () => deleteTask(task));

  if (isAmount) {
    li.querySelector('[data-action="inc"]').addEventListener("click", () => bumpAmount(task, 1));
    li.querySelector('[data-action="dec"]').addEventListener("click", () => bumpAmount(task, -1));
  }

  return li;
}

/* ---- swipe-left-to-complete ---- */
function wireSwipe(li, task) {
  const card = li.querySelector(".task-card");
  let startX = null;
  let dx = 0;
  const THRESHOLD = 90;

  function onDown(e) {
    if (e.target.closest(".icon-btn") || e.target.closest(".amount-btn")) return;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    card.classList.add("dragging");
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
  }
  function onMove(e) {
    if (startX === null) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    dx = Math.min(0, x - startX);
    card.style.transform = `translateX(${dx}px)`;
  }
  function onUp() {
    card.classList.remove("dragging");
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("touchmove", onMove);
    window.removeEventListener("touchend", onUp);
    if (dx <= -THRESHOLD && !isTaskDone(task)) {
      card.style.transform = `translateX(-100%)`;
      completeTask(task);
    } else {
      card.style.transform = "translateX(0)";
    }
    startX = null; dx = 0;
  }

  card.addEventListener("pointerdown", onDown);
  card.addEventListener("touchstart", onDown, { passive: true });
}

async function completeTask(task) {
  const base = currentTaskApi();
  try {
    await api(recordUrl(base, task.id), {
      method: "PATCH",
      body: { is_finished: true, finish_time: new Date().toISOString() },
    });
    task.record = { ...(task.record || {}), is_finished: true, finish_time: new Date().toISOString() };
    toast("Marked done");
    renderTasks();
  } catch (err) {
    console.error(err);
    toast("Couldn't update — see console", true);
    renderTasks();
  }
}

async function bumpAmount(task, delta) {
  const base = currentTaskApi();
  const next = Math.max(0, (task.current_amount ?? 0) + delta);
  try {
    const updated = await api(detailUrl(base, task.id), {
      method: "PATCH",
      body: { current_amount: next },
    });
    Object.assign(task, updated);
    renderTasks();
  } catch (err) {
    console.error(err);
    toast("Couldn't update amount", true);
  }
}

async function deleteTask(task) {
  if (!confirm(`Delete "${task.name}"?`)) return;
  const base = currentTaskApi();
  try {
    await api(detailUrl(base, task.id), { method: "DELETE" });
    const arr = state.activeTab === "checkbox" ? state.checkboxTasks : state.amountTasks;
    const idx = arr.findIndex((t) => t.id === task.id);
    if (idx > -1) arr.splice(idx, 1);
    renderTasks();
    toast("Task deleted");
  } catch (err) {
    console.error(err);
    toast("Couldn't delete task", true);
  }
}

/* ---- add / edit task form (inline expand) ---- */
document.getElementById("add-task-btn").addEventListener("click", () => openTaskForm(null));

function openTaskForm(task) {
  const slot = document.getElementById("task-form-slot");
  const isAmount = state.activeTab === "amount";
  const editing = !!task;

  slot.innerHTML = `
    <form class="inline-form" id="task-form">
      <div class="field">
        <label for="tf-name">Task name</label>
        <input type="text" id="tf-name" required value="${escapeHtml(task?.name || "")}">
      </div>
      <div class="field-row">
        <div class="field">
          <label for="tf-remind-at">Remind at (date)</label>
          <input type="date" id="tf-remind-at" value="${task?.remind_at || ""}">
        </div>
        <div class="field">
          <label for="tf-remind-every">Remind every (hours)</label>
          <input type="number" min="0" id="tf-remind-every" value="${task?.remind_every_hours ?? ""}">
        </div>
      </div>
      ${isAmount ? `
      <div class="field-row">
        <div class="field">
          <label for="tf-total">Total amount</label>
          <input type="number" min="1" id="tf-total" value="${task?.total_amout ?? task?.total_amount ?? 1}">
        </div>
        <div class="field">
          <label for="tf-unit">Unit</label>
          <input type="text" id="tf-unit" placeholder="glasses, pages…" value="${escapeHtml(task?.unit || "")}">
        </div>
      </div>` : ""}
      <div class="form-actions">
        <button type="button" class="btn-secondary" id="tf-cancel">Cancel</button>
        <button type="submit" class="btn-primary">${editing ? "Save changes" : "Add task"}</button>
      </div>
    </form>
  `;

  document.getElementById("tf-cancel").addEventListener("click", () => (slot.innerHTML = ""));
  document.getElementById("task-form").addEventListener("submit", (e) => {
    e.preventDefault();
    saveTask(task, isAmount);
  });
}

async function saveTask(task, isAmount) {
  const base = isAmount ? API.taskAmount : API.taskCheckbox;
  const remindEveryHrs = document.getElementById("tf-remind-every").value;

  const payload = {
    name: document.getElementById("tf-name").value.trim(),
    remind_at: document.getElementById("tf-remind-at").value || null,
    remind_every: remindEveryHrs ? `${remindEveryHrs}:00:00` : null,
  };
  if (isAmount) {
    payload.total_amout = Number(document.getElementById("tf-total").value || 1);
    payload.unit = document.getElementById("tf-unit").value.trim();
  }

  try {
    let saved;
    if (task) {
      saved = await api(detailUrl(base, task.id), { method: "PATCH", body: payload });
      Object.assign(task, saved);
    } else {
      saved = await api(base, { method: "POST", body: payload });
      (isAmount ? state.amountTasks : state.checkboxTasks).unshift(saved);
    }
    document.getElementById("task-form-slot").innerHTML = "";
    renderTasks();
    toast(task ? "Task updated" : "Task added");
  } catch (err) {
    console.error(err);
    toast("Couldn't save task — see console", true);
  }
}

/* ===================================================================
   JOURNAL RENDERING
   =================================================================== */
function renderJournals() {
  const feed = document.getElementById("journal-feed");
  const empty = document.getElementById("journal-empty");
  feed.innerHTML = "";
  empty.hidden = state.journals.length > 0;

  state.journals
    .slice()
    .sort((a, b) => new Date(b.created) - new Date(a.created))
    .forEach((entry) => feed.appendChild(renderJournalCard(entry)));
}

function renderJournalCard(entry) {
  const card = document.createElement("div");
  card.className = "journal-card";
  card.dataset.id = entry.id;

  const images = entry.images || [];
  const imagesHtml = images.length
    ? `<div class="journal-images">${images
        .map((src) => `<img class="journal-thumb" src="${src}" alt="">`)
        .join("")}</div>`
    : "";

  card.innerHTML = `
    <div class="journal-card-top">
      <div class="journal-title-row">
        <h3 class="journal-title">${escapeHtml(entry.title || "Untitled")}</h3>
        <span class="emotion-badge emotion-${entry.emotion}">${(entry.emotion || "").toLowerCase()} · ${entry.emotion_rating}/10</span>
      </div>
      <span class="journal-date">${fmtDate(entry.created)}</span>
    </div>
    <p class="journal-text">${escapeHtml(entry.text)}</p>
    ${imagesHtml}
    <div class="journal-actions" style="margin-top:12px;">
      <button class="icon-btn bookmark-btn ${entry.is_bookmark ? "active" : ""}" data-action="bookmark" aria-label="Bookmark">&#9733;</button>
      <button class="icon-btn" data-action="edit" aria-label="Edit entry">&#9998;</button>
      <button class="icon-btn danger" data-action="delete" aria-label="Delete entry">&#10005;</button>
    </div>
  `;

  card.querySelectorAll(".journal-thumb").forEach((img) =>
    img.addEventListener("click", () => openLightbox(img.src))
  );
  card.querySelector('[data-action="bookmark"]').addEventListener("click", () => toggleBookmark(entry));
  card.querySelector('[data-action="edit"]').addEventListener("click", () => openJournalForm(entry));
  card.querySelector('[data-action="delete"]').addEventListener("click", () => deleteJournal(entry));

  return card;
}

async function toggleBookmark(entry) {
  try {
    const saved = await api(detailUrl(API.journal, entry.id), {
      method: "PATCH",
      body: { is_bookmark: !entry.is_bookmark },
    });
    Object.assign(entry, saved);
    renderJournals();
  } catch (err) {
    console.error(err);
    toast("Couldn't update bookmark", true);
  }
}

async function deleteJournal(entry) {
  if (!confirm(`Delete "${entry.title || "this entry"}"?`)) return;
  try {
    await api(detailUrl(API.journal, entry.id), { method: "DELETE" });
    state.journals = state.journals.filter((j) => j.id !== entry.id);
    renderJournals();
    toast("Entry deleted");
  } catch (err) {
    console.error(err);
    toast("Couldn't delete entry", true);
  }
}

/* ---- add / edit journal form (inline expand) ---- */
document.getElementById("add-journal-btn").addEventListener("click", () => openJournalForm(null));

const EMOTIONS = ["HAPPY", "SAD", "ANGRY", "CALM", "NEUTRAL"];

function openJournalForm(entry) {
  const slot = document.getElementById("journal-form-slot");
  const editing = !!entry;

  slot.innerHTML = `
    <form class="inline-form" id="journal-form">
      <div class="field">
        <label for="jf-title">Title</label>
        <input type="text" id="jf-title" value="${escapeHtml(entry?.title || "")}">
      </div>
      <div class="field-row">
        <div class="field">
          <label for="jf-emotion">Emotion</label>
          <select id="jf-emotion">
            ${EMOTIONS.map((e) => `<option value="${e}" ${entry?.emotion === e ? "selected" : ""}>${e[0]}${e.slice(1).toLowerCase()}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="jf-rating">Intensity</label>
          <div class="rating-row">
            <input type="range" id="jf-rating" min="1" max="10" value="${entry?.emotion_rating ?? 5}">
            <span class="rating-value" id="jf-rating-value">${entry?.emotion_rating ?? 5}</span>
          </div>
        </div>
      </div>
      <div class="field">
        <label for="jf-text">Entry</label>
        <textarea id="jf-text">${escapeHtml(entry?.text || "")}</textarea>
      </div>
      <div class="field">
        <label>Photos</label>
        <div class="file-drop">
          <input type="file" id="jf-images" accept="image/*" multiple>
        </div>
      </div>
      <div class="checkbox-field field">
        <input type="checkbox" id="jf-bookmark" ${entry?.is_bookmark ? "checked" : ""}>
        <label for="jf-bookmark">Bookmark this entry</label>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-secondary" id="jf-cancel">Cancel</button>
        <button type="submit" class="btn-primary">${editing ? "Save changes" : "Add entry"}</button>
      </div>
    </form>
  `;

  document.getElementById("jf-rating").addEventListener("input", (e) => {
    document.getElementById("jf-rating-value").textContent = e.target.value;
  });
  document.getElementById("jf-cancel").addEventListener("click", () => (slot.innerHTML = ""));
  document.getElementById("journal-form").addEventListener("submit", (e) => {
    e.preventDefault();
    saveJournal(entry);
  });
}

async function saveJournal(entry) {
  const form = new FormData();
  form.append("title", document.getElementById("jf-title").value.trim());
  form.append("emotion", document.getElementById("jf-emotion").value);
  form.append("emotion_rating", document.getElementById("jf-rating").value);
  form.append("text", document.getElementById("jf-text").value);
  form.append("is_bookmark", document.getElementById("jf-bookmark").checked);

  const files = document.getElementById("jf-images").files;
  for (const file of files) form.append("upload_images", file);

  try {
    let saved;
    if (entry) {
      saved = await api(detailUrl(API.journal, entry.id), { method: "PATCH", body: form, isForm: true });
      Object.assign(entry, saved);
    } else {
      saved = await api(API.journal, { method: "POST", body: form, isForm: true });
      state.journals.unshift(saved);
    }
    document.getElementById("journal-form-slot").innerHTML = "";
    renderJournals();
    toast(entry ? "Entry updated" : "Entry saved");
  } catch (err) {
    console.error(err);
    toast("Couldn't save entry — see console", true);
  }
}

/* ===================================================================
   Lightbox
   =================================================================== */
function openLightbox(src) {
  document.getElementById("lightbox-img").src = src;
  document.getElementById("lightbox").hidden = false;
}
document.getElementById("lightbox-close").addEventListener("click", () => {
  document.getElementById("lightbox").hidden = true;
});
document.getElementById("lightbox").addEventListener("click", (e) => {
  if (e.target.id === "lightbox") document.getElementById("lightbox").hidden = true;
});

/* ===================================================================
   GO
   =================================================================== */
init();
