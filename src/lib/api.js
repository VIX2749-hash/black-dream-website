const API_BASE = "http://127.0.0.1:8000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: options.body instanceof FormData ? {} : {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  listSeries() {
    return request("/series");
  },
  listCharacters(seriesId) {
    return request(`/series/${seriesId}/characters`);
  },
  getCharacter(characterId) {
    return request(`/characters/${characterId}`);
  },
  createSession(payload) {
    return request("/chat/session", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  sendMessage(sessionId, message) {
    return request(`/chat/${sessionId}/message`, {
      method: "POST",
      body: JSON.stringify({ message })
    });
  },
  searchScenes(seriesId, query) {
    return request(`/search/scenes?series_id=${seriesId}&q=${encodeURIComponent(query)}`);
  },
  compareCharacters(characterAId, characterBId) {
    return request("/simulate/compare", {
      method: "POST",
      body: JSON.stringify({
        character_a_id: characterAId,
        character_b_id: characterBId
      })
    });
  },
  debateCharacters(characterAId, characterBId, topic) {
    return request("/simulate/debate", {
      method: "POST",
      body: JSON.stringify({
        character_a_id: characterAId,
        character_b_id: characterBId,
        topic
      })
    });
  },
  alternateTimeline(characterId, premise) {
    return request("/simulate/alternate-timeline", {
      method: "POST",
      body: JSON.stringify({
        character_id: characterId,
        premise
      })
    });
  },
  uploadSeriesFolder(slug, files) {
    const formData = new FormData();
    formData.append("slug", slug);
    files.forEach((file) => {
      formData.append(
        "files",
        file,
        file.webkitRelativePath && file.webkitRelativePath.length > 0
          ? file.webkitRelativePath
          : file.name
      );
    });
    return request("/admin/upload-series-folder", {
      method: "POST",
      body: formData
    });
  }
};
