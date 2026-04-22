import { useMemo, useState } from "react";

import { api } from "../lib/api";

export function ImportPanel({ onImported }) {
  const [slug, setSlug] = useState("");
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");

  const canImport = useMemo(() => slug.trim().length > 0 && files.length > 0, [slug, files]);

  async function handleImport() {
    if (!canImport) {
      return;
    }
    setStatus("Uploading and importing...");
    try {
      const result = await api.uploadSeriesFolder(slug.trim(), files);
      setStatus(
        `Imported ${result.title} with ${result.imported_characters} characters and ${result.imported_chapters} chapters.`
      );
      setFiles([]);
      onImported?.();
    } catch (error) {
      setStatus(`Import failed: ${error.message}`);
    }
  }

  return (
    <div className="panel">
      <h2>Import Series</h2>
      <input
        value={slug}
        onChange={(event) => setSlug(event.target.value)}
        placeholder="series slug, e.g. one-piece"
      />
      <label className="upload-label">
        <span>Select series folder</span>
        <input
          type="file"
          multiple
          webkitdirectory=""
          directory=""
          onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
        />
      </label>
      <small>{files.length > 0 ? `${files.length} files selected` : "Choose a folder with summary, characters, and chapters."}</small>
      <button type="button" onClick={handleImport} disabled={!canImport}>
        Upload And Import
      </button>
      {status ? <p>{status}</p> : null}
    </div>
  );
}
