/**
 * Telemetry Module — Samsung Connect / SmartThings Cloud Integration Stub
 * Simulates passing analytics to the SmartThings Cloud ecosystem for enterprise tracking.
 */

const SESSION_KEY = 'cad_mcq_session';

function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (raw) return JSON.parse(raw);
  const session = {
    sessionId: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    totalQuestions: 0,
    correctCount: 0,
    incorrectCount: 0,
    errors: [],
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function updateSession(data) {
  const session = { ...getSession(), ...data };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

/**
 * Emit an analytics event to the Samsung Connect (SmartThings Cloud) ecosystem.
 * In production, this would POST to the SmartThings Cloud API.
 */
export function emitSamsungConnectEvent(payload) {
  const session = getSession();
  const event = {
    type: 'CAD_MCQ_EVENT',
    timestamp: new Date().toISOString(),
    sessionId: session.sessionId,
    ...payload,
  };
  console.log('[SmartThings Cloud] Event emitted:', event);
  return event;
}

export function trackAnswer(questionId, isCorrect, selectedAnswer, correctAnswer) {
  const session = getSession();
  if (isCorrect) {
    updateSession({ correctCount: session.correctCount + 1 });
  } else {
    updateSession({
      incorrectCount: session.incorrectCount + 1,
      errors: [...session.errors, { questionId, selectedAnswer, correctAnswer, at: new Date().toISOString() }],
    });
  }
  emitSamsungConnectEvent({
    action: 'ANSWER_EVALUATED',
    questionId,
    isCorrect,
    selectedAnswer,
    correctAnswer,
  });
}

export function trackCompletion(totalQuestions, correctCount, incorrectCount) {
  const score = Math.round((correctCount / totalQuestions) * 100);
  emitSamsungConnectEvent({
    action: 'ASSESSMENT_COMPLETE',
    totalQuestions,
    correctCount,
    incorrectCount,
    scorePercent: score,
  });
  return score;
}

export function getSessionStats() {
  return getSession();
}
