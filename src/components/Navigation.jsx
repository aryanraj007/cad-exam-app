import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import './Navigation.css';

export default function Navigation({
  currentIndex,
  totalQuestions,
  selectedAnswer,
  isEvaluated,
  isCorrect,
  isAcknowledged,
  onPrevious,
  onNext,
  onEvaluate,
}) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  const canEvaluate = selectedAnswer && !isEvaluated;
  const canGoNext = isEvaluated && (isCorrect || isAcknowledged) && !isLast;
  const isFinished = isEvaluated && (isCorrect || isAcknowledged) && isLast;

  return (
    <div className="navigation-bar">
      <button
        className="nav-btn nav-prev"
        onClick={onPrevious}
        disabled={isFirst}
        aria-label="Previous question"
      >
        <ChevronLeft size={18} />
        <span>Previous</span>
      </button>

      {!isEvaluated && (
        <button
          className="nav-btn nav-submit"
          onClick={onEvaluate}
          disabled={!canEvaluate}
          aria-label="Submit answer"
        >
          <Send size={16} />
          <span>Submit Answer</span>
        </button>
      )}

      {isEvaluated && !isFinished && (
        <button
          className="nav-btn nav-next"
          onClick={onNext}
          disabled={!canGoNext}
          aria-label="Next question"
        >
          <span>Next</span>
          <ChevronRight size={18} />
        </button>
      )}

      {isFinished && (
        <button className="nav-btn nav-finish" onClick={onNext} aria-label="View results">
          <span>View Results</span>
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
