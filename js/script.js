document.addEventListener("DOMContentLoaded", () => {
  const titleField = document.getElementById("new-title");
  const textField = document.getElementById("new-text");
  const list = document.getElementById("saved-list");
  const status = document.getElementById("save-status");
  const saveButton = document.querySelector(".save-button");
  const overlay = document.querySelector(".modal-overlay");
  const localKey = "typewriter-entries-v1";
  const placeholders = [[titleField, "New entry"], [textField, "Start writing here"]];
  let localEntries = {};
  let remoteEntries = {};
  let entriesRef;
  let cloudAvailable = false;
  let selectedEntry;

  try {
    localEntries = JSON.parse(localStorage.getItem(localKey) || "{}") || {};
  } catch (error) {
    console.warn("Could not recover local entries", error);
  }

  const setStatus = (message) => { status.textContent = message; };
  function saveLocal(id, entry) {
    try {
      localStorage.setItem(localKey, JSON.stringify({ ...localEntries, [id]: entry }));
      localEntries[id] = entry;
      return true;
    } catch (error) {
      console.error("Could not save in this browser", error);
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
    if (!title || !content || title === "New entry" || content === "Start writing here") {
      setStatus("Write a title and some text before saving.");
      return;
    }
    saveButton.disabled = true;
    const id = `escrito_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const entry = { title, content, createdAt: new Date().toISOString() };
    try {
      if (cloudAvailable && entriesRef) {
        await entriesRef.child(id).set(entry);
        saveLocal(id, entry);
        setStatus("Entry saved to Firebase and this browser.");
      } else if (saveLocal(id, entry)) {
        setStatus("Firebase is unavailable. Entry saved only in this browser.");
      } else {
        setStatus("Could not save. Copy your text before closing this page.");
        return;
      }
      renderEntries();
      titleField.textContent = "New entry";
      textField.textContent = "Start writing here";
    } catch (error) {
      console.error("Could not save to Firebase", error);
      cloudAvailable = false;
      if (saveLocal(id, entry)) {
        renderEntries();
        titleField.textContent = "New entry";
        textField.textContent = "Start writing here";
        setStatus("Firebase is unavailable. Entry saved only in this browser.");
      } else {
        setStatus("Could not save. Copy your text before closing this page.");
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
      ? new Date(entry.createdAt).toLocaleDateString("en-US") : "";
    document.getElementById("pdf-status").textContent = "";
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
    const pdfButton = document.querySelector(".pdf-button");
    pdfButton.disabled = true;
    try {
      await generatePDF(selectedEntry);
    } catch (error) {
      console.error("Could not generate the PDF", error);
      document.getElementById("pdf-status").textContent = "Could not generate the PDF. Please try again.";
    } finally {
      pdfButton.disabled = false;
    }
  });

  renderEntries();
  setStatus("Connecting to Firebase… Local entries are available.");
  setTimeout(() => {
    if (!cloudAvailable) {
      setStatus("Firebase is unavailable. Entries are saved only in this browser.");
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
      setStatus("Firebase connected. Entries are also saved in this browser.");
    }, (error) => {
      cloudAvailable = false;
      console.warn("Firebase is unavailable", error);
      setStatus("Firebase is unavailable. Entries are saved only in this browser.");
    });
  } catch (error) {
    console.warn("Could not initialize Firebase", error);
    setStatus("Firebase is unavailable. Entries are saved only in this browser.");
  }
});
