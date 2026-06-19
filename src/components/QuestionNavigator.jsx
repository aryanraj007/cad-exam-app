import React from 'react';
import './QuestionNavigator.css';

export default function QuestionNavigator({ 
  totalQuestions, 
  currentIndex, 
  activeQuestions, 
  evaluatedQuestions, 
  onNavigate 
}) {
  return (
    <div className="question-navigator">
      <div className="navigator-grid">
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const qId = activeQuestions[idx]?.id;
          const evaluation = evaluatedQuestions[qId];
          let statusClass = 'unanswered';
          
          if (evaluation === true) statusClass = 'correct';
          else if (evaluation === false) statusClass = 'incorrect';

          const isActive = idx === currentIndex;

          return (
            <button
              key={idx}
              className={`nav-grid-btn ${statusClass} ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(idx)}
              aria-label={`Go to question ${idx + 1}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
