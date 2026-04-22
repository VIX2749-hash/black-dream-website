import { useEffect, useState } from "react";

import { api } from "../lib/api";

export function CharacterPanel({ characterId, selectedVersionId, onVersionChange }) {
  const [character, setCharacter] = useState(null);

  useEffect(() => {
    api.getCharacter(characterId).then(setCharacter);
  }, [characterId]);

  useEffect(() => {
    if (character?.versions?.length && !selectedVersionId) {
      onVersionChange?.(character.versions[0].id);
    }
  }, [character, selectedVersionId, onVersionChange]);

  if (!character) {
    return <section className="card">Loading character...</section>;
  }

  const version =
    character.versions.find((item) => item.id === selectedVersionId) ?? character.versions[0];
  const recentMemories = character.memories.slice(0, 4);
  const recentEmotions = character.emotions.slice(0, 4);

  return (
    <section className="card hero">
      <div>
        <p className="eyebrow">{character.role_type}</p>
        <h2>{character.display_name}</h2>
        <p>{character.bio_short}</p>
      </div>
      <div className="grid two">
        <div className="subcard">
          <h3>Current Arc Version</h3>
          <select
            className="select"
            value={version?.id ?? ""}
            onChange={(event) => onVersionChange?.(Number(event.target.value))}
          >
            {character.versions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.version_label}
              </option>
            ))}
          </select>
          <p>{version.version_label}</p>
          <small>
            {version.arc_name} · {version.start_unit}-{version.end_unit}
          </small>
          <div className="tag-row">
            {version.core_persona.traits?.map((trait) => (
              <span key={trait} className="tag">
                {trait}
              </span>
            ))}
          </div>
        </div>
        <div className="subcard">
          <h3>Current Emotion</h3>
          {character.emotions[0] ? (
            <>
              <p>{character.emotions[0].primary_emotion}</p>
              <small>{character.emotions[0].trigger_text}</small>
            </>
          ) : (
            <p>No emotion snapshot yet.</p>
          )}
        </div>
      </div>

      <div className="grid three">
        <div className="subcard">
          <h3>Goals</h3>
          {version.core_persona.goals?.map((goal) => (
            <p key={goal}>{goal}</p>
          ))}
        </div>
        <div className="subcard">
          <h3>Fears</h3>
          {version.core_persona.fears?.map((fear) => (
            <p key={fear}>{fear}</p>
          ))}
        </div>
        <div className="subcard">
          <h3>Relationships</h3>
          {character.relationships.map((item) => (
            <p key={item.target_character_id}>
              {item.target_character_name}: {item.label}
            </p>
          ))}
        </div>
      </div>

      <div className="grid two">
        <div className="subcard">
          <h3>Hidden Traits</h3>
          {(version.private_profile.hidden_traits ?? []).map((item, index) => (
            <p key={`${item}-${index}`}>{typeof item === "string" ? item : JSON.stringify(item)}</p>
          ))}
        </div>
        <div className="subcard">
          <h3>Contradictions</h3>
          {(version.private_profile.contradictions ?? []).map((item, index) => (
            <p key={`${item}-${index}`}>{typeof item === "string" ? item : JSON.stringify(item)}</p>
          ))}
        </div>
      </div>

      <div className="grid two">
        <div className="subcard">
          <h3>Recent Memory</h3>
          {recentMemories.map((item) => (
            <p key={item.id}>
              {item.memory_type}: {item.summary}
            </p>
          ))}
        </div>
        <div className="subcard">
          <h3>Emotion History</h3>
          {recentEmotions.map((item) => (
            <p key={item.id}>
              {item.primary_emotion}: {item.trigger_text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
