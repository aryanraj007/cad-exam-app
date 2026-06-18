import { useState, useCallback, useMemo } from 'react';
import { Play, BookOpen, Clock, Award, Layers } from 'lucide-react';
import allQuestions from './data/questions.json';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import QuestionCard from './components/QuestionCard';
import FeedbackOverlay from './components/FeedbackOverlay';
import Navigation from './components/Navigation';
import ScoreBoard from './components/ScoreBoard';
import { trackAnswer, trackCompletion } from './utils/telemetry';
import './App.css';

const SET_SIZE = 20;
const VIEWS = { WELCOME: 'welcome', SET_SELECT: 'set_select', QUIZ: 'quiz', RESULTS: 'results' };

// Split questions into sets of 20
const questionSets = [];
for (let i = 0; i < allQuestions.length; i += SET_SIZE) {
  questionSets.push(allQuestions.slice(i, i + SET_SIZE));
}

export default function App() {
  const [view, setView] = useState(VIEWS.WELCOME);
  const [activeSetIndex, setActiveSetIndex] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [errorLog, setErrorLog] = useState([]);

  const activeQuestions = activeSetIndex !== null ? questionSets[activeSetIndex] : [];
  const total = activeQuestions.length;
  const currentQ = activeQuestions[currentIndex];

  const handleStart = useCallback(() => setView(VIEWS.SET_SELECT), []);

  const handleSelectSet = useCallback((setIdx) => {
    setActiveSetIndex(setIdx);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsEvaluated(false);
    setIsCorrect(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setErrorLog([]);
    setView(VIEWS.QUIZ);
  }, []);

  const handleSelectAnswer = useCallback((option) => {
    const isMultiple = Array.isArray(currentQ.correctAnswer);
    setSelectedAnswers((prev) => {
      const currentSelections = prev[currentQ.id];
      if (isMultiple) {
        let arr = currentSelections || [];
        if (arr.includes(option)) {
          arr = arr.filter((o) => o !== option);
        } else {
          arr = [...arr, option];
        }
        return { ...prev, [currentQ.id]: arr };
      } else {
        return { ...prev, [currentQ.id]: option };
      }
    });
  }, [currentQ]);

  const handleEvaluate = useCallback(() => {
    const selected = selectedAnswers[currentQ.id];
    const isMultiple = Array.isArray(currentQ.correctAnswer);
    if (!selected || (isMultiple && selected.length === 0)) return;
    
    let correct = false;
    if (isMultiple) {
      correct = selected.length === currentQ.correctAnswer.length && selected.every(val => currentQ.correctAnswer.includes(val));
    } else {
      correct = selected === currentQ.correctAnswer;
    }

    setIsEvaluated(true);
    setIsCorrect(correct);
    if (correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setIncorrectCount((c) => c + 1);
      setErrorLog((prev) => [
        ...prev,
        { question: currentQ.question, selected, correct: currentQ.correctAnswer },
      ]);
    }
    trackAnswer(currentQ.id, correct, selected, currentQ.correctAnswer);
  }, [selectedAnswers, currentQ]);

  const handleNext = useCallback(() => {
    if (currentIndex >= total - 1) {
      trackCompletion(total, correctCount, incorrectCount);
      setView(VIEWS.RESULTS);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setIsEvaluated(false);
    setIsCorrect(false);
  }, [currentIndex, total, correctCount, incorrectCount]);

  const handlePrevious = useCallback(() => {
    if (currentIndex <= 0) return;
    setCurrentIndex((i) => i - 1);
    setIsEvaluated(false);
    setIsCorrect(false);
  }, [currentIndex]);

  const handleBackToSets = useCallback(() => {
    setView(VIEWS.SET_SELECT);
    setActiveSetIndex(null);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsEvaluated(false);
    setIsCorrect(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setErrorLog([]);
  }, []);

  const handleRestart = useCallback(() => {
    // Restart same set
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsEvaluated(false);
    setIsCorrect(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setErrorLog([]);
    setView(VIEWS.QUIZ);
  }, []);

  return (
    <div className="app-container">
      <Header total={allQuestions.length} />

      <div className="main-card">
        {view === VIEWS.WELCOME && (
          <div className="welcome-screen">
            <div className="welcome-icon-wrap">
              <BookOpen size={32} />
            </div>
            <h2 className="welcome-title">ServiceNow CAD Exam Prep</h2>
            <p className="welcome-desc">
              Master the Certified Application Developer exam with {allQuestions.length} practice
              questions organized into {questionSets.length} focused sets of {SET_SIZE} questions each.
            </p>
            <div className="welcome-info">
              <span className="info-chip"><Clock size={14} /> Self-paced</span>
              <span className="info-chip"><Award size={14} /> 70% to pass</span>
              <span className="info-chip"><Layers size={14} /> {questionSets.length} Sets</span>
            </div>
            <button className="start-btn" onClick={handleStart}>
              <Play size={18} />
              Choose a Question Set
            </button>
          </div>
        )}

        {view === VIEWS.SET_SELECT && (
          <div className="set-select-screen">
            <h2 className="set-select-title">Choose a Question Set</h2>
            <p className="set-select-desc">Each set contains {SET_SIZE} questions. Pick one to start practicing.</p>
            <div className="sets-grid">
              {questionSets.map((set, idx) => (
                <button
                  key={idx}
                  className="set-card"
                  onClick={() => handleSelectSet(idx)}
                >
                  <div className="set-number">Set {idx + 1}</div>
                  <div className="set-range">
                    Q{idx * SET_SIZE + 1} — Q{Math.min((idx + 1) * SET_SIZE, allQuestions.length)}
                  </div>
                  <div className="set-count">{set.length} Questions</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === VIEWS.QUIZ && currentQ && (
          <>
            <ProgressBar
              current={currentIndex}
              total={total}
              correct={correctCount}
              incorrect={incorrectCount}
            />
            <QuestionCard
              key={currentQ.id}
              question={currentQ}
              questionIndex={currentIndex}
              totalQuestions={total}
              selectedAnswer={selectedAnswers[currentQ.id] || null}
              isEvaluated={isEvaluated}
              isCorrect={isCorrect}
              onSelectAnswer={handleSelectAnswer}
            />
            {isEvaluated && (
              <FeedbackOverlay
                isCorrect={isCorrect}
                correctAnswer={currentQ.correctAnswer}
              />
            )}
            <Navigation
              currentIndex={currentIndex}
              totalQuestions={total}
              selectedAnswer={selectedAnswers[currentQ.id] || null}
              isEvaluated={isEvaluated}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onEvaluate={handleEvaluate}
            />
          </>
        )}

        {view === VIEWS.RESULTS && (
          <ScoreBoard
            total={total}
            correct={correctCount}
            incorrect={incorrectCount}
            errors={errorLog}
            onRestart={handleRestart}
            onBackToSets={handleBackToSets}
            setLabel={`Set ${activeSetIndex + 1}`}
          />
        )}
      </div>
    </div>
  );
}
