import { useState, useCallback, useMemo } from 'react';
import { Play, BookOpen, Clock, Award } from 'lucide-react';
import questions from './data/questions.json';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import QuestionCard from './components/QuestionCard';
import FeedbackOverlay from './components/FeedbackOverlay';
import Navigation from './components/Navigation';
import ScoreBoard from './components/ScoreBoard';
import { trackAnswer, trackCompletion } from './utils/telemetry';
import './App.css';

const VIEWS = { WELCOME: 'welcome', QUIZ: 'quiz', RESULTS: 'results' };

export default function App() {
  const [view, setView] = useState(VIEWS.WELCOME);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [errorLog, setErrorLog] = useState([]);

  const total = questions.length;
  const currentQ = questions[currentIndex];

  const handleStart = useCallback(() => setView(VIEWS.QUIZ), []);

  const handleSelectAnswer = useCallback((option) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: option }));
  }, [currentQ]);

  const handleEvaluate = useCallback(() => {
    const selected = selectedAnswers[currentQ.id];
    if (!selected) return;
    const correct = selected === currentQ.correctAnswer;
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

  const handleAcknowledge = useCallback(() => setIsAcknowledged(true), []);

  const handleNext = useCallback(() => {
    if (currentIndex >= total - 1) {
      trackCompletion(total, correctCount + (isCorrect ? 0 : 0), incorrectCount);
      setView(VIEWS.RESULTS);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setIsEvaluated(false);
    setIsCorrect(false);
    setIsAcknowledged(false);
  }, [currentIndex, total, correctCount, incorrectCount, isCorrect]);

  const handlePrevious = useCallback(() => {
    if (currentIndex <= 0) return;
    setCurrentIndex((i) => i - 1);
    setIsEvaluated(false);
    setIsCorrect(false);
    setIsAcknowledged(false);
  }, [currentIndex]);

  const handleRestart = useCallback(() => {
    setView(VIEWS.WELCOME);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsEvaluated(false);
    setIsCorrect(false);
    setIsAcknowledged(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setErrorLog([]);
  }, []);

  return (
    <div className="app-container">
      <Header total={total} />

      <div className="main-card">
        {view === VIEWS.WELCOME && (
          <div className="welcome-screen">
            <div className="welcome-icon-wrap">
              <BookOpen size={32} />
            </div>
            <h2 className="welcome-title">ServiceNow CAD Exam Prep</h2>
            <p className="welcome-desc">
              Master the Certified Application Developer exam with {total} practice
              questions covering all major domains.
            </p>
            <div className="welcome-info">
              <span className="info-chip"><Clock size={14} /> Self-paced</span>
              <span className="info-chip"><Award size={14} /> 70% to pass</span>
              <span className="info-chip"><BookOpen size={14} /> {total} Questions</span>
            </div>
            <button className="start-btn" onClick={handleStart}>
              <Play size={18} />
              Start Assessment
            </button>
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
                onAcknowledge={handleAcknowledge}
              />
            )}
            <Navigation
              currentIndex={currentIndex}
              totalQuestions={total}
              selectedAnswer={selectedAnswers[currentQ.id] || null}
              isEvaluated={isEvaluated}
              isCorrect={isCorrect}
              isAcknowledged={isAcknowledged}
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
          />
        )}
      </div>
    </div>
  );
}
