import { useEffect, useState } from "react";

import { api } from "../lib/api";

export function ChatPanel({ characterId, seriesId, selectedVersionId }) {
  const [character, setCharacter] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    api.getCharacter(characterId).then(async (detail) => {
      setCharacter(detail);
      const versionId = selectedVersionId ?? detail.versions[0]?.id;
      if (!versionId) {
        return;
      }
      const session = await api.createSession({
        series_id: seriesId,
        character_id: characterId,
        character_version_id: versionId,
        title: `${detail.display_name} Chat`,
        mode: "persona_chat"
      });
      setSessionId(session.id);
      setMessages([]);
    });
  }, [characterId, seriesId, selectedVersionId]);

  async function handleSend(event) {
    event.preventDefault();
    if (!draft.trim() || !sessionId) {
      return;
    }
    const updatedMessages = await api.sendMessage(sessionId, draft);
    setMessages(updatedMessages);
    setDraft("");
  }

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <p className="eyebrow">First-Person Persona Chat</p>
          <h2>{character ? `Talk to ${character.display_name}` : "Loading chat..."}</h2>
        </div>
      </div>

      <div className="chat-log">
        {messages.length === 0 ? (
          <p className="placeholder">
            Ask about fears, goals, relationships, or what this character would do next.
          </p>
        ) : (
          messages.map((message) => (
            <article
              key={message.id}
              className={message.speaker_type === "character" ? "bubble ai" : "bubble user"}
            >
              <strong>{message.speaker_type === "character" ? "Character" : "You"}</strong>
              <p>{message.message_text}</p>
            </article>
          ))
        )}
      </div>

      <form className="composer" onSubmit={handleSend}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="What are you trying to protect right now?"
        />
        <button type="submit">Send</button>
      </form>
    </section>
  );
}
