import './QuestionCard.css';

export default function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  isEvaluated,
  isCorrect,
  onSelectAnswer,
}) {
  const getOptionClass = (option) => {
    let cls = 'option-btn';
    if (!isEvaluated && selectedAnswer === option) cls += ' selected';
    if (isEvaluated) {
      if (option === question.correctAnswer) cls += ' correct-option';
      else if (selectedAnswer === option) cls += ' incorrect-option';
    }
    return cls;
  };

  const optionLetters = 'ABCDEFGHIJ';

  return (
    <div className="question-card">
      <div className="question-header">
        <span className="question-badge">Question {questionIndex + 1} / {totalQuestions}</span>
        <span className="question-id">{question.id}</span>
      </div>
      <h2 className="question-text">{question.question}</h2>
      <div className="options-grid">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            className={getOptionClass(option)}
            onClick={() => !isEvaluated && onSelectAnswer(option)}
            disabled={isEvaluated}
            aria-label={`Option ${optionLetters[idx]}: ${option}`}
          >
            <span className="option-letter">{optionLetters[idx]}</span>
            <span className="option-text">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
