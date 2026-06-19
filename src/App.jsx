import { useState, useCallback, useMemo } from 'react';
import { Play, BookOpen, Clock, Award, Layers, Home } from 'lucide-react';
import dumpQuestions from './data/questions_131.json';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import QuestionCard from './components/QuestionCard';
import FeedbackOverlay from './components/FeedbackOverlay';
import Navigation from './components/Navigation';
import ScoreBoard from './components/ScoreBoard';
import QuestionNavigator from './components/QuestionNavigator';
import { trackAnswer, trackCompletion } from './utils/telemetry';
import './App.css';

const SET_SIZE = 20;
const VIEWS = { DASHBOARD: 'dashboard', WELCOME: 'welcome', SET_SELECT: 'set_select', QUIZ: 'quiz', RESULTS: 'results' };

const DATASETS = [
  { 
    id: 'dumps', 
    title: 'ServiceNow CAD Dumps', 
    description: '131 Real Exam Questions', 
    questions: dumpQuestions 
  }
];

export default function App() {
  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [activeDataset, setActiveDataset] = useState(null);
  const [activeSetIndex, setActiveSetIndex] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [evaluatedQuestions, setEvaluatedQuestions] = useState({});
  const [errorLog, setErrorLog] = useState([]);

  // Split questions into sets of 20 dynamically based on the active dataset
  const questionSets = useMemo(() => {
    if (!activeDataset) return [];
    const sets = [];
    for (let i = 0; i < activeDataset.questions.length; i += SET_SIZE) {
      sets.push(activeDataset.questions.slice(i, i + SET_SIZE));
    }
    return sets;
  }, [activeDataset]);

  const activeQuestions = activeSetIndex !== null ? questionSets[activeSetIndex] : [];
  const total = activeQuestions.length;
  const currentQ = activeQuestions[currentIndex];

  const correctCount = Object.values(evaluatedQuestions).filter(v => v === true).length;
  const incorrectCount = Object.values(evaluatedQuestions).filter(v => v === false).length;
  const isEvaluated = currentQ ? evaluatedQuestions[currentQ.id] !== undefined : false;
  const isCorrect = currentQ ? evaluatedQuestions[currentQ.id] === true : false;

  const handleSelectDataset = useCallback((dataset) => {
    setActiveDataset(dataset);
    setView(VIEWS.WELCOME);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setView(VIEWS.DASHBOARD);
    setActiveDataset(null);
    setActiveSetIndex(null);
  }, []);

  const handleStart = useCallback(() => setView(VIEWS.SET_SELECT), []);

  const handleSelectSet = useCallback((setIdx) => {
    setActiveSetIndex(setIdx);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setEvaluatedQuestions({});
    setErrorLog([]);
    setView(VIEWS.QUIZ);
  }, []);

  const doEvaluate = useCallback((selected, question) => {
    const isMultiple = Array.isArray(question.correctAnswer);
    if (!selected || (isMultiple && selected.length === 0)) return;
    
    let correct = false;
    if (isMultiple) {
      correct = selected.length === question.correctAnswer.length && selected.every(val => question.correctAnswer.includes(val));
    } else {
      correct = selected === question.correctAnswer;
    }

    setEvaluatedQuestions((prev) => {
      if (prev[question.id] !== undefined) return prev;
      return { ...prev, [question.id]: correct };
    });

    if (!correct) {
      let selectedDisplay = isMultiple ? selected.join(', ') : selected;
      let correctDisplay = isMultiple ? question.correctAnswer.join(', ') : question.correctAnswer;
      setErrorLog((prev) => [
        ...prev,
        { question: question.question, selected: selectedDisplay, correct: correctDisplay },
      ]);
    }
    trackAnswer(question.id, correct, selected, question.correctAnswer);
  }, []);

  const handleSelectAnswer = useCallback((option) => {
    if (isEvaluated) return;
    
    const isMultiple = Array.isArray(currentQ.correctAnswer);
    const currentSelections = selectedAnswers[currentQ.id];
    let newSelections;

    if (isMultiple) {
      let arr = currentSelections || [];
      if (arr.includes(option)) {
        arr = arr.filter((o) => o !== option);
      } else {
        arr = [...arr, option];
      }
      newSelections = arr;
    } else {
      newSelections = option;
    }

    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: newSelections }));

    if (!isMultiple) {
      doEvaluate(newSelections, currentQ);
    } else if (newSelections.length === currentQ.correctAnswer.length) {
      doEvaluate(newSelections, currentQ);
    }
  }, [currentQ, isEvaluated, selectedAnswers, doEvaluate]);

  const handleEvaluate = useCallback(() => {
    doEvaluate(selectedAnswers[currentQ.id], currentQ);
  }, [selectedAnswers, currentQ, doEvaluate]);

  const handleNavigate = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex >= total - 1) {
      trackCompletion(total, correctCount, incorrectCount);
      setView(VIEWS.RESULTS);
      return;
    }
    setCurrentIndex((i) => i + 1);
  }, [currentIndex, total, correctCount, incorrectCount]);

  const handlePrevious = useCallback(() => {
    if (currentIndex <= 0) return;
    setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  const handleBackToSets = useCallback(() => {
    setView(VIEWS.SET_SELECT);
    setActiveSetIndex(null);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setEvaluatedQuestions({});
    setErrorLog([]);
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setEvaluatedQuestions({});
    setErrorLog([]);
    setView(VIEWS.QUIZ);
  }, []);

  return (
    <div className="app-container">
      <Header total={activeDataset ? activeDataset.questions.length : dumpQuestions.length} />

      <div className="main-card">
        {view === VIEWS.DASHBOARD && (
          <div className="dashboard-screen">
            <h2 className="dashboard-title">ServiceNow CAD Practice Portal</h2>
            <p className="dashboard-desc">Select an exam set to start your practice session.</p>
            <div className="dashboard-grid">
              {DATASETS.map((dataset) => (
                <button
                  key={dataset.id}
                  className="dataset-card"
                  onClick={() => handleSelectDataset(dataset)}
                >
                  <BookOpen size={32} className="dataset-icon" />
                  <h3>{dataset.title}</h3>
                  <p>{dataset.description}</p>
                  <span className="dataset-count">{dataset.questions.length} Questions</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === VIEWS.WELCOME && activeDataset && (
          <div className="welcome-screen">
            <button className="back-btn" onClick={handleBackToDashboard}>
              <Home size={16} /> Back to Dashboard
            </button>
            <div className="welcome-icon-wrap">
              <BookOpen size={32} />
            </div>
            <h2 className="welcome-title">{activeDataset.title}</h2>
            <p className="welcome-desc">
              {activeDataset.description} with {activeDataset.questions.length} practice
              questions organized into {questionSets.length} focused sets.
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

        {view === VIEWS.SET_SELECT && activeDataset && (
          <div className="set-select-screen">
            <button className="back-btn" onClick={() => setView(VIEWS.WELCOME)}>
              &larr; Back to {activeDataset.title}
            </button>
            <h2 className="set-select-title">Choose a Question Set</h2>
            <p className="set-select-desc">Each set contains up to {SET_SIZE} questions. Pick one to start practicing.</p>
            <div className="sets-grid">
              {questionSets.map((set, idx) => (
                <button
                  key={idx}
                  className="set-card"
                  onClick={() => handleSelectSet(idx)}
                >
                  <div className="set-number">Set {idx + 1}</div>
                  <div className="set-range">
                    Q{idx * SET_SIZE + 1} — Q{Math.min((idx + 1) * SET_SIZE, activeDataset.questions.length)}
                  </div>
                  <div className="set-count">{set.length} Questions</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {view === VIEWS.QUIZ && currentQ && (
          <div className="quiz-container">
            <QuestionNavigator
              totalQuestions={total}
              currentIndex={currentIndex}
              activeQuestions={activeQuestions}
              evaluatedQuestions={evaluatedQuestions}
              onNavigate={handleNavigate}
            />
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
          </div>
        )}

        {view === VIEWS.RESULTS && (
          <ScoreBoard
            total={total}
            correct={correctCount}
            incorrect={incorrectCount}
            errors={errorLog}
            onRestart={handleRestart}
            onBackToSets={handleBackToSets}
            onBackToDashboard={handleBackToDashboard}
            setLabel={`Set ${activeSetIndex + 1}`}
          />
        )}
      </div>
    </div>
  );
}
