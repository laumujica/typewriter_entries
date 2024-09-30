function genPDF() {
  var doc = new jsPDF();
  let modalTitle = document.querySelector(".modal-title");
  let modalContent = document.querySelector(".modal-content");

  const title = modalTitle.textContent;
  const content = modalContent.textContent;

  // Establecer el ancho máximo del texto en mm
  const maxWidth = 170; // Deja espacio para márgenes
  const marginTop = 20; // Margen superior para el contenido
  const titleHeight = 10; // Altura del título
  const lineHeight = 10; // Espaciado entre líneas

  // Título
  doc.setFont("times", "bold");
  doc.text(20, 20, title);

  // Contenido
  doc.setFont("times", "normal");
  const splitContent = doc.splitTextToSize(content, maxWidth);
  
  let y = marginTop + titleHeight; // Posición inicial para el contenido

  splitContent.forEach((line) => {
    // Verificar si se necesita una nueva página
    if (y + lineHeight > doc.internal.pageSize.height) {
      doc.addPage(); // Añadir nueva página
      y = marginTop; // Reiniciar la posición Y
    }
    doc.text(20, y, line);
    y += lineHeight; // Mover hacia abajo para la próxima línea
  });

  // Obtener la fecha actual en formato ddmmaa
  const currentDate = new Date();
  const formattedDate =
    ("0" + currentDate.getDate()).slice(-2) +
    ("0" + (currentDate.getMonth() + 1)).slice(-2) +
    currentDate.getFullYear().toString().slice(-2) +
    "_" +
    ("0" + currentDate.getHours()).slice(-2) +
    ("0" + currentDate.getMinutes()).slice(-2);
  
  const fileName = `Nueva_entrada_${formattedDate}.pdf`;

  // Guardar el PDF con la fecha formateada en el nombre del archivo
  doc.save(fileName);
}
