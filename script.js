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
  appId: "1:658456453344:web:6040ebce270daf7248f085",
  measurementId: "G-BZTXEJPM9M",
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Reference to your entries in the database
var entriesRef = firebase.database().ref("entries");

// Fetch the entries
entriesRef.on("value", function (snapshot) {
  var entries = snapshot.val();
  // Process the entries and display them on your website
  // You can update your displayEntries() function accordingly
  displayEntries(entries);
});

document.addEventListener("DOMContentLoaded", function () {
  // Call displayEntries here
  displayEntries(entries);
});

/* No sé si esto romperá algo */
function displayEntries(entries) {
  var entriesList = document.querySelector(".entries-list");
  entriesList.innerHTML = ""; // Clear existing entries

  for (var key in entries) {
    var entry = entries[key];
    var entryItem = document.createElement("li");
    entryItem.textContent = entry.title;
    entryItem.addEventListener("click", function () {
      // Display the entry details in the modal
      openModal(entry.title, entry.text);
    });
    entriesList.appendChild(entryItem);
  }
}

/* Acá empieza todo creo */
entryTitle.addEventListener("click", () => {
  const titleElement = document.getElementById("new-title");
  if (titleElement.textContent === "Nueva entrada") {
    titleElement.textContent = "";
  }
});

typedText.addEventListener("click", () => {
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
          modalTitle.textContent = title;
          modalContent.textContent = content;
          modal.style.display = "block";
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

// ... (otros eventos y código posterior)
