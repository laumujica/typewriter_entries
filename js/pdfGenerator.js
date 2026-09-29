let fontDataPromise;

async function getTypewriterFont() {
  if (!fontDataPromise) {
    fontDataPromise = fetch("fonts/SpecialElite-Regular.ttf")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load the typeface");
        return response.arrayBuffer();
      })
      .then((buffer) => {
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let offset = 0; offset < bytes.length; offset += 8192) {
          binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
        }
        return btoa(binary);
      })
      .catch((error) => {
        fontDataPromise = null;
        throw error;
      });
  }
  return fontDataPromise;
}

async function generatePDF(entry) {
  const doc = new jspdf.jsPDF({ unit: "mm", format: "a4" });
  doc.addFileToVFS("SpecialElite-Regular.ttf", await getTypewriterFont());
  doc.addFont("SpecialElite-Regular.ttf", "SpecialElite", "normal");
  doc.setFont("SpecialElite", "normal");

  const margin = 22;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const textWidth = pageWidth - 2 * margin;
  const date = new Date();
  const dateLabel = date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  doc.setFontSize(18);
  let y = margin + 4;
  for (const line of doc.splitTextToSize(entry.title, textWidth)) {
    doc.text(line, margin, y);
    y += 9;
  }
  doc.setFontSize(10);
  doc.text(dateLabel, margin, y + 2);
  y += 17;
  doc.setFontSize(12);

  for (const paragraph of entry.content.split(/\r?\n/)) {
    const lines = paragraph ? doc.splitTextToSize(paragraph, textWidth) : [""];
    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        doc.setFont("SpecialElite", "normal");
        doc.setFontSize(12);
        y = margin + 4;
      }
      if (line) doc.text(line, margin, y);
      y += 7;
    }
  }

  const safeTitle = entry.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 70) || "entry";
  const stamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  doc.save(`${safeTitle}_${stamp}.pdf`);
}
