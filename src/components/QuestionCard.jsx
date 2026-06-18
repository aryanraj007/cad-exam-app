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
    const isSelected = Array.isArray(selectedAnswer) ? selectedAnswer.includes(option) : selectedAnswer === option;
    const isCorrectOption = Array.isArray(question.correctAnswer) ? question.correctAnswer.includes(option) : question.correctAnswer === option;
    
    if (!isEvaluated && isSelected) cls += ' selected';
    if (isEvaluated) {
      if (isCorrectOption) cls += ' correct-option';
      else if (isSelected) cls += ' incorrect-option';
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
      <h2 className="question-text">
        {question.question}
        {Array.isArray(question.correctAnswer) && (
          <span className="multiple-select-hint"> (Select all that apply)</span>
        )}
      </h2>
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
