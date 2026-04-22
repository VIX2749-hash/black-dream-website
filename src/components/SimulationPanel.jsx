import { useMemo, useState } from "react";

import { api } from "../lib/api";

export function SimulationPanel({ characters, selectedCharacterId }) {
  const [otherCharacterId, setOtherCharacterId] = useState("");
  const [comparison, setComparison] = useState(null);
  const [debate, setDebate] = useState(null);
  const [topic, setTopic] = useState("Should loyalty matter more than survival?");
  const [premise, setPremise] = useState("What if the betrayal never happened?");
  const [alternateTimeline, setAlternateTimeline] = useState(null);

  const options = useMemo(
    () => characters.filter((item) => item.id !== selectedCharacterId),
    [characters, selectedCharacterId]
  );

  async function handleCompare() {
    if (!selectedCharacterId || !otherCharacterId) {
      return;
    }
    const result = await api.compareCharacters(selectedCharacterId, Number(otherCharacterId));
    setComparison(result);
  }

  async function handleDebate() {
    if (!selectedCharacterId || !otherCharacterId || !topic.trim()) {
      return;
    }
    const result = await api.debateCharacters(
      selectedCharacterId,
      Number(otherCharacterId),
      topic
    );
    setDebate(result);
  }

  async function handleAlternateTimeline() {
    if (!selectedCharacterId || !premise.trim()) {
      return;
    }
    const result = await api.alternateTimeline(selectedCharacterId, premise);
    setAlternateTimeline(result);
  }

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Simulation</p>
          <h2>Compare characters or stage a debate</h2>
        </div>
      </div>

      <div className="grid two">
        <div className="subcard">
          <h3>Choose Second Character</h3>
          <select
            className="select"
            value={otherCharacterId}
            onChange={(event) => setOtherCharacterId(event.target.value)}
          >
            <option value="">Select character</option>
            {options.map((item) => (
              <option key={item.id} value={item.id}>
                {item.display_name}
              </option>
            ))}
          </select>
          <button type="button" onClick={handleCompare}>
            Compare
          </button>
        </div>
        <div className="subcard">
          <h3>Debate Topic</h3>
          <input value={topic} onChange={(event) => setTopic(event.target.value)} />
          <button type="button" onClick={handleDebate}>
            Run Debate
          </button>
        </div>
      </div>

      <div className="subcard alt-card">
        <h3>Alternate Timeline</h3>
        <input value={premise} onChange={(event) => setPremise(event.target.value)} />
        <button type="button" onClick={handleAlternateTimeline}>
          Simulate Counterfactual
        </button>
      </div>

      {comparison ? (
        <div className="grid two simulation-grid">
          <div className="subcard">
            <h3>Similarities</h3>
            {comparison.similarities.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <div className="subcard">
            <h3>Differences</h3>
            {comparison.differences.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <div className="subcard">
            <h3>Tension Points</h3>
            {comparison.tension_points.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <div className="subcard">
            <h3>Likely Dynamic</h3>
            <p>{comparison.likely_dynamic}</p>
          </div>
        </div>
      ) : null}

      {debate ? (
        <div className="results">
          {debate.turns.map((turn, index) => (
            <article key={`${turn.speaker}-${index}`} className="result-card">
              <small>{turn.speaker}</small>
              <p>{turn.text}</p>
            </article>
          ))}
          <article className="result-card">
            <small>Summary</small>
            <p>{debate.summary}</p>
          </article>
        </div>
      ) : null}

      {alternateTimeline ? (
        <div className="grid two simulation-grid">
          <div className="subcard">
            <h3>Immediate Shift</h3>
            <p>{alternateTimeline.immediate_shift}</p>
          </div>
          <div className="subcard">
            <h3>Sample Response</h3>
            <p>{alternateTimeline.sample_response}</p>
          </div>
          <div className="subcard">
            <h3>Relationship Effects</h3>
            {alternateTimeline.relationship_effects.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <div className="subcard">
            <h3>Emotional Effects</h3>
            {alternateTimeline.emotional_effects.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <div className="subcard">
            <h3>Likely Actions</h3>
            {alternateTimeline.likely_actions.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
