document.addEventListener("DOMContentLoaded", function () {
  const typedText = document.querySelector(".typed-text");
  const entryTitle = document.querySelector(".entry-title");
  const savedList = document.querySelector(".saved-list");
  const modal = document.querySelector(".modal-overlay");
  const modalTitle = document.querySelector(".modal-title");
  const modalContent = document.querySelector(".modal-content");
  const modalClose = document.querySelector(".modal-close");
  const saveButton = document.querySelector(".save-button");

  // Initialize Firebase!
  const firebaseConfig = {
    apiKey: "AIzaSyCX6yqmOzw34lvST1DjWjCV3D0yUxFJHbg",
    authDomain: "typewriter-entries.firebaseapp.com",
    databaseURL: "https://typewriter-entries-default-rtdb.firebaseio.com",
    projectId: "typewriter-entries",
    storageBucket: "typewriter-entries.appspot.com",
    messagingSenderId: "658456453344",
    appId: "1:658456453344:web:2bc32cd9c9cd204048f085",
    measurementId: "G-P7S4WZ33MB",
  };

  firebase.initializeApp(firebaseConfig);

  // Reference to your entries in the database
  var entriesRef = firebase.database().ref("entries");

  // Fetch the entries
  entriesRef.on("value", function (snapshot) {
    var entries = snapshot.val();
    displayEntries(entries);
  });

  // Establecer una referencia a la base de datos de Firebase
  const database = firebase.database();

  function displayEntries(entries) {
    var entriesList = document.querySelector(".saved-list");
    entriesList.innerHTML = ""; // Clear existing entries

    if (entries) {
      // Asegúrate de que las entradas no sean nulas
      for (var key in entries) {
        var entry = entries[key];
        var entryItem = document.createElement("li");
        entryItem.textContent = entry.title;
        entryItem.addEventListener("click", function () {
          openModal(entry.title, entry.content, entry.creationDate);
        });
        entriesList.appendChild(entryItem);
      }
    }
  }

  // Inicializar los campos editables
  entryTitle.addEventListener("focus", () => {
    const titleElement = document.getElementById("new-title");
    if (titleElement.textContent === "Nueva entrada") {
      titleElement.textContent = "";
    }
  });

  typedText.addEventListener("focus", () => {
    const typedText = document.getElementById("new-text");
    if (typedText.textContent === "Escriba su texto aquí") {
      typedText.textContent = "";
    }
  });

  saveButton.addEventListener("click", () => {
    const content = typedText.textContent;
    const title = entryTitle.textContent;

    if (content.trim() !== "" && title.trim() !== "" && title !== "Título") {
      const id = `escrito_${Date.now()}`;

      const entryData = {
        title: title,
        content: content,
      };

      database
        .ref("entradas/" + id)
        .set(entryData)
        .then(() => {
          const listItem = document.createElement("li");
          const link = document.createElement("a");

          link.textContent = title;
          link.href = "#" + id;
          link.addEventListener("click", (event) => {
            event.preventDefault();
            openModal(title, content);
          });

          listItem.appendChild(link);
          savedList.appendChild(listItem);

          typedText.textContent = "Escriba su texto aquí";
          entryTitle.textContent = "Nueva entrada";
        })
        .catch((error) => {
          console.error("Error al guardar la entrada: ", error);
        });
    }
  });

  modalClose.addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  function openModal(title, content) {
    modalTitle.textContent = title;
    modalContent.textContent = content;
    modal.style.display = "block";
  }

  function genPDF() {
    const title = modalTitle.textContent; // Obtener el título de la entrada
    const content = modalContent.textContent; // Obtener el contenido de la entrada
    const creationDate = new Date(); // Obtener la fecha actual
    const formattedDate = `${
      creationDate.getMonth() + 1
    }${creationDate.getDate()}${creationDate.getFullYear()}_${creationDate.getHours()}${creationDate.getMinutes()}`;

    // Formatear el nombre del archivo
    const fileName = `${title
      .replace(/\s+/g, "_")
      .toLowerCase()}_${formattedDate}.pdf`;

    const doc = new jsPDF();

    // Añadir el título y el contenido al PDF
    doc.text(title, 10, 10);
    doc.text(content, 10, 20);
  }

  // Suponiendo que tienes un botón para generar el PDF
  const pdfButton = document.querySelector(".pdf-button");
  pdfButton.addEventListener("click", genPDF);
});
