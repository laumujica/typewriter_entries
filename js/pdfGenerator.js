function genPDF() {
  var doc = new jsPDF();
  let modalTitle = document.querySelector(".modal-title");
  let modalContent = document.querySelector(".modal-content");
  const title = modalTitle.textContent;
  const content = modalContent.textContent;

  doc.text(20, 20, title);
  doc.text(20, 30, content);

  /* doc.save("Nueva_entrada.pdf"); */

  // Get current date in ddmmaa format
  const currentDate = new Date();
  const formattedDate =
    ("0" + currentDate.getDate()).slice(-2) +
    ("0" + (currentDate.getMonth() + 1)).slice(-2) +
    currentDate.getFullYear().toString().slice(-2) +
    "_" +
    ("0" + currentDate.getHours()).slice(-2) +
    ("0" + currentDate.getMinutes()).slice(-2);

  // Save the PDF with the formatted date in the filename
  doc.save("Nueva_entrada_" + formattedDate + ".pdf");
}
