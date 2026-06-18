import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import './FeedbackOverlay.css';

export default function FeedbackOverlay({ isCorrect, correctAnswer }) {
  if (isCorrect) {
    return (
      <div className="feedback-overlay feedback-correct" role="alert">
        <div className="feedback-icon-wrapper correct-icon">
          <CheckCircle size={32} />
        </div>
        <h3 className="feedback-title">Correct!</h3>
        <p className="feedback-text">Great job! You got it right.</p>
      </div>
    );
  }

  return (
    <div className="feedback-overlay feedback-incorrect" role="alert">
      <div className="feedback-icon-wrapper incorrect-icon">
        <XCircle size={32} />
      </div>
      <h3 className="feedback-title">Incorrect</h3>
      <div className="feedback-correct-answer">
        <AlertTriangle size={16} />
        <span>Correct Answer:</span>
      </div>
      <p className="feedback-answer-text">
        {Array.isArray(correctAnswer) ? correctAnswer.join(' | ') : correctAnswer}
      </p>
    </div>
  );
}
