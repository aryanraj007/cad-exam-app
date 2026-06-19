import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import './Navigation.css';

export default function Navigation({
  currentIndex,
  totalQuestions,
  selectedAnswer,
  isEvaluated,
  onPrevious,
  onNext,
  onEvaluate,
}) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  const hasSelection = Array.isArray(selectedAnswer) ? selectedAnswer.length > 0 : !!selectedAnswer;
  const canEvaluate = hasSelection && !isEvaluated;
  const canGoNext = isEvaluated && !isLast;
  const isFinished = isEvaluated && isLast;

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

      {!isLast && (
        <button
          className="nav-btn nav-next"
          onClick={onNext}
          aria-label="Next question"
        >
          <span>Next</span>
          <ChevronRight size={18} />
        </button>
      )}

      {isLast && (
        <button 
          className="nav-btn nav-finish" 
          onClick={onNext} 
          disabled={!isEvaluated}
          aria-label="View results"
        >
          <span>View Results</span>
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
