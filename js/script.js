document.addEventListener("DOMContentLoaded", () => {
  const titleField = document.getElementById("new-title");
  const textField = document.getElementById("new-text");
  const list = document.getElementById("saved-list");
  const status = document.getElementById("save-status");
  const saveButton = document.querySelector(".save-button");
  const overlay = document.querySelector(".modal-overlay");
  const localKey = "typewriter-entries-v1";
  const draftKey = "typewriter-draft-v1";
  let localEntries = {};
  let remoteEntries = {};
  let entriesRef;
  let cloudAvailable = false;
  let selectedEntry;
  let activeUid = null;

  try {
    localEntries = JSON.parse(localStorage.getItem(localKey) || "{}") || {};
  } catch (error) {
    console.warn("Could not recover local entries", error);
  }

  const setStatus = (message) => { status.textContent = message; };
  try {
    const draft = JSON.parse(localStorage.getItem(draftKey) || "null");
    if (draft && (typeof draft.title === "string" || typeof draft.content === "string")) {
      titleField.textContent = typeof draft.title === "string" ? draft.title : "";
      textField.textContent = typeof draft.content === "string" ? draft.content : "";
      setStatus("Draft restored from this browser.");
    }
  } catch (error) {
    console.warn("Could not recover draft", error);
  }
  function saveDraft() {
    try {
      const title = titleField.innerText;
      const content = textField.innerText;
      if (title.trim() || content.trim()) {
        localStorage.setItem(draftKey, JSON.stringify({ title, content }));
        setStatus("Draft saved automatically in this browser.");
      } else {
        localStorage.removeItem(draftKey);
        setStatus("");
      }
    } catch (error) {
      console.error("Could not save draft", error);
      setStatus("Draft could not be saved automatically. Copy your text before closing.");
    }
  }
  titleField.addEventListener("input", saveDraft);
  textField.addEventListener("input", saveDraft);

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

  async function saveEntry() {
    const title = titleField.innerText.trim();
    const content = textField.innerText.trim();
    if (!title || !content) {
      setStatus("Write a title and some text before saving.");
      return;
    }
    saveButton.disabled = true;
    const id = `entry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const entry = { title, content, createdAt: new Date().toISOString() };
    try {
      if (cloudAvailable && entriesRef) {
        await entriesRef.child(id).set(entry);
        saveLocal(id, entry);
        setStatus("Entry saved.");
      } else if (saveLocal(id, entry)) {
        setStatus("Entry saved in this browser. Download a PDF to keep a copy.");
      } else {
        setStatus("Could not save. Copy your text before closing this page.");
        return;
      }
      renderEntries();
      clearSavedDraft(title, content);
    } catch (error) {
      console.error("Could not save to Firebase", error);
      cloudAvailable = false;
      if (saveLocal(id, entry)) {
        renderEntries();
        clearSavedDraft(title, content);
        setStatus("Entry saved in this browser. Download a PDF to keep a copy.");
      } else {
        setStatus("Could not save. Copy your text before closing this page.");
      }
    } finally {
      saveButton.disabled = false;
    }
  }

  function clearSavedDraft(savedTitle, savedContent) {
    if (titleField.innerText.trim() !== savedTitle || textField.innerText.trim() !== savedContent) return;
    titleField.textContent = "";
    textField.textContent = "";
    try {
      localStorage.removeItem(draftKey);
    } catch (error) {
      console.warn("Could not clear saved draft", error);
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
  const firebaseConfig = window.TYPEWRITER_FIREBASE_CONFIG;
  if (!firebaseConfig || !firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.databaseURL) {
    return;
  }
  try {
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    auth.onAuthStateChanged((user) => {
      if (!user) {
        cloudAvailable = false;
        auth.signInAnonymously().catch((error) => {
          console.warn("Anonymous Firebase sign-in failed", error);
        });
        return;
      }
      if (activeUid === user.uid) return;
      if (entriesRef) entriesRef.off();
      activeUid = user.uid;
      cloudAvailable = false;
      remoteEntries = {};
      renderEntries();
      entriesRef = firebase.database().ref(`entries/${user.uid}`);
      entriesRef.on("value", (snapshot) => {
        remoteEntries = snapshot.val() || {};
        cloudAvailable = true;
        renderEntries();
      }, (error) => {
        cloudAvailable = false;
        console.warn("Cloud storage is unavailable", error);
      });
    });
  } catch (error) {
    console.warn("Could not initialize Firebase", error);
  }
});
