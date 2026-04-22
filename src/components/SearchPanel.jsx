import { useState } from "react";

import { api } from "../lib/api";

export function SearchPanel({ seriesId }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  async function handleSearch(event) {
    event.preventDefault();
    if (!query.trim() || !seriesId) {
      return;
    }
    const items = await api.searchScenes(seriesId, query);
    setResults(items);
  }

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Scene Search</p>
          <h2>Search by quote, location, or emotion hint</h2>
        </div>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for rivalry, court, loyalty..."
        />
        <button type="submit">Search</button>
      </form>

      <div className="results">
        {results.map((item) => (
          <article key={item.id} className="result-card">
            <small>{item.chapter_title}</small>
            <h3>{item.location}</h3>
            <p>{item.text}</p>
            <div className="tag-row">
              {item.emotion_tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
