import './ProgressBar.css';

export default function ProgressBar({ current, total, correct, incorrect }) {
  const pct = Math.round(((current + 1) / total) * 100);

  return (
    <div className="progress-container">
      <div className="progress-stats">
        <span className="stat correct-stat">✓ {correct}</span>
        <span className="stat incorrect-stat">✗ {incorrect}</span>
        <span className="stat remaining-stat">{total - current - 1} left</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-label">{pct}% Complete</div>
    </div>
  );
}
