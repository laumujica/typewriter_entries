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

The app is hosted as a static site on GitHub Pages; Firebase Hosting is not used for this version. It does not show a sign-in screen. When the cloud is connected, new entries are saved in Firebase Realtime Database under an anonymous account and copied to this browser's local storage. Existing local entries are not automatically uploaded. The app states whether a save reached the cloud or stayed in the browser. Anonymous accounts are tied to the browser, so clearing site data can prevent access to cloud entries from that browser; PDF export provides an independent copy.

## Current technical status

The Realtime Database in the original Firebase project was deactivated after a period of inactivity and later restored. Historical entries are not being migrated. The Web app uses that project's public client configuration, anonymous Firebase Authentication, and per-user database rules in `database.rules.json`.

Cloud entries live under `entries/<anonymous user ID>`, so each browser sees only its own entries without a visible sign-in screen. The Web app configuration is public and does not protect the data; the database rules do. Rules separate visitor access but do not prevent Firebase project administrators from reading stored writing. Local storage is specific to each browser and can be removed by clearing site data. Download a PDF for an independent copy of important writing.

## Future work

- Export an editable Word document.
- Explore an optional account upgrade for recovering entries across devices, while keeping the writing interface focused. Anonymous entries would need to be linked to the new account, and local-only entries would need a deliberate migration path.
- Improve privacy beyond per-user access rules, including whether cloud storage should use client-side encryption so project administrators cannot read writing. Document the trade-offs and recovery behavior before promising this to writers.

## Project files

- `index.html`, `styles.css`: writing interface and responsive layout.
- `js/script.js`: editor behavior, entry list, local storage, and optional Firebase connection.
- `js/firebase-config.js`: public Web app configuration for the existing Firebase project.
- `database.rules.json`: per-user Realtime Database rules to publish in Firebase Console.
- `js/pdfGenerator.js`: dated, multipage A4 PDF export.
- `fonts/`: bundled Special Elite font and its Apache 2.0 license. The bundled jsPDF 2.5.2 has its MIT license in `js/jspdf-LICENSE.txt`.
- [Original 2023 process log](docs/archive/README-2023.md): preserved verbatim, including its own note that some dates are incorrect.

To run locally, serve the repository with a simple HTTP server (for example `python3 -m http.server 8000`) and open `http://localhost:8000`. Opening `index.html` directly as a `file://` URL can prevent the font file from loading for PDF generation.

**Laura Mujica · 2026 ⚡**
[lauramujica.com](https://lauramujica.com/)
