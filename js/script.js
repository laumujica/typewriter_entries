document.addEventListener("DOMContentLoaded", () => {
  const titleField = document.getElementById("new-title");
  const textField = document.getElementById("new-text");
  const list = document.getElementById("saved-list");
  const status = document.getElementById("save-status");
  const saveButton = document.querySelector(".save-button");
  const overlay = document.querySelector(".modal-overlay");
  const localKey = "typewriter-entries-v1";
  const placeholders = [[titleField, "Nueva entrada"], [textField, "Escriba su texto aquí"]];
  let localEntries = {};
  let remoteEntries = {};
  let entriesRef;
  let cloudAvailable = false;
  let selectedEntry;

  try {
    localEntries = JSON.parse(localStorage.getItem(localKey) || "{}") || {};
  } catch (error) {
    console.warn("No se pudieron recuperar las entradas locales", error);
  }

  const setStatus = (message) => { status.textContent = message; };
  function saveLocal(id, entry) {
    try {
      localStorage.setItem(localKey, JSON.stringify({ ...localEntries, [id]: entry }));
      localEntries[id] = entry;
      return true;
    } catch (error) {
      console.error("No se pudo guardar en este navegador", error);
      return false;
    }
  }

  function renderEntries() {
    list.replaceChildren();
    const entries = Object.entries({ ...localEntries, ...remoteEntries })
      .filter(([, entry]) => entry && entry.title && entry.content)
      .sort(([idA, a], [idB, b]) => (b.createdAt || idB).localeCompare(a.createdAt || idA));
    for (const [, entry] of entries) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "entry-link";
      button.textContent = entry.title;
      button.addEventListener("click", () => openEntry(entry));
      item.appendChild(button);
      list.appendChild(item);
    }
  }

  for (const [field, placeholder] of placeholders) {
    field.addEventListener("focus", () => {
      if (field.textContent.trim() === placeholder) field.textContent = "";
    });
    field.addEventListener("blur", () => {
      if (!field.textContent.trim()) field.textContent = placeholder;
    });
  }

  async function saveEntry() {
    const title = titleField.innerText.trim();
    const content = textField.innerText.trim();
    if (!title || !content || title === "Nueva entrada" || content === "Escriba su texto aquí") {
      setStatus("Escribí un título y un texto antes de guardar.");
      return;
    }
    saveButton.disabled = true;
    const id = `escrito_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const entry = { title, content, createdAt: new Date().toISOString() };
    try {
      if (cloudAvailable && entriesRef) {
        await entriesRef.child(id).set(entry);
        saveLocal(id, entry);
        setStatus("Entrada guardada en Firebase y en este navegador.");
      } else if (saveLocal(id, entry)) {
        setStatus("Firebase no está disponible. Entrada guardada solo en este navegador.");
      } else {
        setStatus("No se pudo guardar. Copiá el texto antes de cerrar la página.");
        return;
      }
      renderEntries();
      titleField.textContent = "Nueva entrada";
      textField.textContent = "Escriba su texto aquí";
    } catch (error) {
      console.error("Error al guardar en Firebase", error);
      cloudAvailable = false;
      if (saveLocal(id, entry)) {
        renderEntries();
        titleField.textContent = "Nueva entrada";
        textField.textContent = "Escriba su texto aquí";
        setStatus("Firebase no está disponible. Entrada guardada solo en este navegador.");
      } else {
        setStatus("No se pudo guardar. Copiá el texto antes de cerrar la página.");
      }
    } finally {
      saveButton.disabled = false;
    }
  }

  function openEntry(entry) {
    selectedEntry = entry;
    document.querySelector(".modal-title").textContent = entry.title;
    document.querySelector(".modal-content").textContent = entry.content;
    document.querySelector(".modal-creation-date").textContent = entry.createdAt
      ? new Date(entry.createdAt).toLocaleDateString("es-AR") : "";
    overlay.style.display = "block";
    document.querySelector(".modal-close").focus();
  }
  function closeEntry() {
    overlay.style.display = "none";
    selectedEntry = null;
  }
  saveButton.addEventListener("click", saveEntry);
  document.querySelector(".modal-close").addEventListener("click", closeEntry);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeEntry();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && selectedEntry) closeEntry();
  });
  document.querySelector(".pdf-button").addEventListener("click", async () => {
    if (!selectedEntry) return;
    try {
      await generatePDF(selectedEntry);
    } catch (error) {
      console.error("No se pudo generar el PDF", error);
      setStatus("No se pudo generar el PDF. Intentá de nuevo.");
    }
  });

  renderEntries();
  setStatus("Conectando con Firebase… Las entradas locales están disponibles.");
  setTimeout(() => {
    if (!cloudAvailable) {
      setStatus("Firebase no está disponible. Las entradas se guardan solo en este navegador.");
    }
  }, 6000);
  try {
    firebase.initializeApp({
      apiKey: "AIzaSyCX6yqmOzw34lvST1DjWjCV3D0yUxFJHbg",
      authDomain: "typewriter-entries.firebaseapp.com",
      databaseURL: "https://typewriter-entries-default-rtdb.firebaseio.com",
      projectId: "typewriter-entries",
      storageBucket: "typewriter-entries.appspot.com",
      messagingSenderId: "658456453344",
      appId: "1:658456453344:web:2bc32cd9c9cd204048f085"
    });
    entriesRef = firebase.database().ref("entradas");
    entriesRef.on("value", (snapshot) => {
      remoteEntries = snapshot.val() || {};
      cloudAvailable = true;
      renderEntries();
      setStatus("Firebase conectado. Las entradas también se guardan en este navegador.");
    }, (error) => {
      cloudAvailable = false;
      console.warn("Firebase no está disponible", error);
      setStatus("Firebase no está disponible. Las entradas se guardan solo en este navegador.");
    });
  } catch (error) {
    console.warn("No se pudo iniciar Firebase", error);
    setStatus("Firebase no está disponible. Las entradas se guardan solo en este navegador.");
  }
});
