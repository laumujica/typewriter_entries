# Typewriter Entries

A quiet place to write. [Try the prototype](https://laumujica.github.io/typewriter_entries/).

Typewriter Entries is a small writing tool I started on **August 11, 2023**. It grew from my interest in writing and in digital products that help people focus on one task. The screen has a title, a large writing area, and a short list of saved entries. There are no controls for fonts, sizes, or layout: editing can happen later, after the writing is done.

## The experience

1. Write a title and a text.
2. Save the entry and open it from **Saved entries**.
3. Download an A4 PDF named after the title and dated on the day of export. The PDF embeds the same Special Elite typeface used by the editor.

This is an experimental MVP, not a commercial product. I return to it as I learn more about product design, focused writing, and editorial workflows. A possible next export format is Word, so a draft can move into a more flexible editing stage.

## What I built and revisited

I designed the writing flow and visual direction, then built the interface in HTML, CSS, and JavaScript. The first version connected to Firebase Realtime Database and generated downloadable PDFs in the browser with jsPDF. In 2026 I revisited the implementation to restore the save and export flow, preserve the original project history, and make the storage state visible to writers.

The app is hosted as a static site on GitHub Pages. It does not have accounts. When Firebase is unavailable, entries are saved in this browser's local storage and are **not synced to other devices**. The app states which storage is in use. Entries saved locally remain local when Firebase comes back; automatic synchronization is not implemented.

## Current technical status

The Firebase configuration committed in this repository points to the **`typewriter-entries`** project and its `entradas` path. On September 29, 2026, that Realtime Database returned **“has been deactivated.”** The separate project ID `maquina-escribir-7b053` was mentioned in the original project notes, but the repository does not point to it; its default Realtime Database endpoint also returned “has been deactivated.” We should identify the correct project and inspect its existing data before changing configuration or database rules.

The browser-only fallback keeps new writing, the saved list, and PDF export usable while the Firebase project is recovered. Local storage is specific to each browser and can be removed by clearing site data. Do not rely on it as the sole copy of irreplaceable writing; download a PDF.

## Project files

- `index.html`, `styles.css`: writing interface and responsive layout.
- `js/script.js`: editor behavior, entry list, Firebase connection, and local fallback.
- `js/pdfGenerator.js`: dated, multipage A4 PDF export.
- `fonts/`: bundled Special Elite font and its Apache 2.0 license. The bundled jsPDF 2.5.2 has its MIT license in `js/jspdf-LICENSE.txt`.
- [Original 2023 process log](docs/archive/README-2023.md): preserved verbatim, including its own note that some dates are incorrect.

To run locally, serve the repository with a simple HTTP server (for example `python3 -m http.server 8000`) and open `http://localhost:8000`. Opening `index.html` directly as a `file://` URL can prevent the font file from loading for PDF generation.

**Laura Mujica · 2026 ⚡**
[lauramujica.com](https://lauramujica.com/)
