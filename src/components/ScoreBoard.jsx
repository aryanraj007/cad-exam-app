import { Trophy, BarChart3, Target, RotateCcw, XCircle } from 'lucide-react';
import './ScoreBoard.css';

export default function ScoreBoard({ total, correct, incorrect, errors, onRestart }) {
  const score = Math.round((correct / total) * 100);
  const passed = score >= 70;

  return (
    <div className="scoreboard">
      <div className={`score-hero ${passed ? 'hero-pass' : 'hero-fail'}`}>
        <div className="score-ring">
          <svg viewBox="0 0 120 120" className="ring-svg">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke={passed ? '#10b981' : '#ef4444'}
              strokeWidth="8"
              strokeDasharray={`${(score / 100) * 327} 327`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              className="ring-progress"
            />
          </svg>
          <div className="score-value">{score}%</div>
        </div>
        <h2 className="score-verdict">{passed ? 'Passed!' : 'Keep Practicing'}</h2>
        <p className="score-subtitle">
          {passed ? 'You demonstrated strong knowledge of ServiceNow CAD concepts.' : 'Review the incorrect answers and try again to improve your score.'}
        </p>
      </div>

      <div className="score-stats-grid">
        <div className="score-stat">
          <Target size={20} />
          <div>
            <span className="stat-num">{total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="score-stat stat-correct">
          <Trophy size={20} />
          <div>
            <span className="stat-num">{correct}</span>
            <span className="stat-label">Correct</span>
          </div>
        </div>
        <div className="score-stat stat-wrong">
          <XCircle size={20} />
          <div>
            <span className="stat-num">{incorrect}</span>
            <span className="stat-label">Incorrect</span>
          </div>
        </div>
        <div className="score-stat">
          <BarChart3 size={20} />
          <div>
            <span className="stat-num">{score}%</span>
            <span className="stat-label">Score</span>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="errors-review">
          <h3 className="errors-title">Review Incorrect Answers</h3>
          <div className="errors-list">
            {errors.map((err, i) => (
              <div key={i} className="error-item">
                <div className="error-q">Q{i + 1}: {err.question}</div>
                <div className="error-your">Your answer: <span>{err.selected}</span></div>
                <div className="error-correct">Correct: <span>{err.correct}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="restart-btn" onClick={onRestart}>
        <RotateCcw size={18} />
        <span>Restart Quiz</span>
      </button>
    </div>
  );
}
