import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { getQuizQuestions } from "../api/quiz"; // adjust path
import { useAuth } from "../context/AuthContext";
import { getLessonProgress, saveProgress } from "../api/progress";
import CameraSignPredictor from "../components/CameraSignPredictor";

const TYPE_LABELS = {
  sign_to_meaning_mcq: "Sign image → choose meaning",
  word_to_sign_mcq: "Word → choose sign image",
  camera_sign_match: "Word → show sign on camera",
  sign_to_text: "Sign image → type the meaning",
  match_pairs: "Match pairs",
};

const LessonDetail = () => {
  const { id } = useParams();
  const { token, role } = useAuth();

  const getOptionLabel = (index) => String.fromCharCode(65 + index);

  const [lesson, setLesson] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [checkedResults, setCheckedResults] = useState({});
  const [hasCheckedAll, setHasCheckedAll] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [lessonProgress, setLessonProgress] = useState(null);
  const [savingProgress, setSavingProgress] = useState(false);
  const [pairCheckedResults, setPairCheckedResults] = useState({});
  const [activeCameraQuestionId, setActiveCameraQuestionId] = useState(null);
  const [cameraPredictions, setCameraPredictions] = useState({});
  const [cameraStatuses, setCameraStatuses] = useState({});
  const [cameraStableCounts, setCameraStableCounts] = useState({});

  // Helper
  const captureFrameAndPredict = async (question) => {
  if (!videoRef.current) return;

  const canvas = document.createElement("canvas");
  canvas.width = videoRef.current.videoWidth || 640;
  canvas.height = videoRef.current.videoHeight || 480;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

  const image = canvas.toDataURL("image/jpeg", 0.8);

  try {
    const res = await fetch("http://localhost:8001/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image }),
    });

    const data = await res.json();

    handleCameraPrediction(question, {
      label: data.stable_label,
      confidence: data.confidence,
      rawLabel: data.label,
      handDetected: data.hand_detected,
    });
  } catch (error) {
    console.error("Prediction failed:", error);
  }
};

  // Pair match
  const [pairAnswers, setPairAnswers] = useState({});

    const handlePairAnswerChange = (questionId, leftKey, rightValue) => {
        if (hasCheckedAll) return;

        setPairAnswers((prev) => ({
            ...prev,
            [questionId]: {
            ...(prev[questionId] || {}),
            [leftKey]: rightValue,
            },
        }));
    };

  const practiceStorageKey = `lesson-practice-open-${id}`;
  const [showPractice, setShowPractice] = useState(() => {
    const saved = localStorage.getItem(practiceStorageKey);
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem(practiceStorageKey, String(showPractice));
  }, [showPractice, practiceStorageKey]);

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    try {
      const res = await api.get(`/lessons/${id}`);
      setLesson(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
  const fetchLessonProgressData = async () => {
    if (!token || role === "admin") return;

    try {
      setLoadingProgress(true);
      const data = await getLessonProgress(id, token);
      setLessonProgress(data);
      setProgressSaved(!!data);
    } catch (error) {
      console.error("Failed to fetch lesson progress:", error);
    } finally {
      setLoadingProgress(false);
    }
  };

    fetchLessonProgressData();
  }, [id, token, role]);

  useEffect(() => {
  const fetchAllQuestions = async () => {
    try {
      if (!lesson?.quizzes?.length) {
        setAllQuestions([]);
        return;
      }

      const questionsByQuiz = await Promise.all(
        lesson.quizzes.map(async (quiz) => {
          const questions = await getQuizQuestions(quiz.id);

          return questions.map((question) => ({
            ...question,
            quizTitle: quiz.title,
          }));
        })
      );

      setAllQuestions(questionsByQuiz.flat());
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      setAllQuestions([]);
    }
  };

  fetchAllQuestions();
}, [lesson]);

useEffect(() => {
  if (!activeCameraQuestionId || !videoRef.current) return;

  const question = allQuestions.find((q) => q.id === activeCameraQuestionId);
  if (!question) return;

  const interval = setInterval(() => {
    captureFrameAndPredict(question);
  }, 500);

  return () => clearInterval(interval);
}, [activeCameraQuestionId, allQuestions]);

  const groupedQuestions = useMemo(() => {
    const groups = {};

    allQuestions.forEach((q) => {
      if (!groups[q.type]) groups[q.type] = [];
      groups[q.type].push(q);
    });

    return groups;
  }, [allQuestions]);

  const orderedSigns = useMemo(() => {
    return [...(lesson?.signs || [])].sort((a, b) => {
      const ao = a.order ?? 999999;
      const bo = b.order ?? 999999;
      return ao - bo;
    });
  }, [lesson]);

const handleSelectAnswer = (questionId, value) => {
    if (hasCheckedAll) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
};

  const handleTextAnswerChange = (questionId, value) => {
    if (hasCheckedAll) return;

    setTextAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

const handleCheckAllAnswers = () => {
  const results = {};
  const pairResults = {};

  allQuestions.forEach((q) => {
    if (q.type === "sign_to_meaning_mcq") {
      results[q.id] = selectedAnswers[q.id] === q.correctAnswer;
    } else if (q.type === "word_to_sign_mcq") {
      results[q.id] =
        String(selectedAnswers[q.id] || "") === String(q.correctAnswer || "");
    } else if (q.type === "sign_to_text") {
      const entered = (textAnswers[q.id] || "").trim().toLowerCase();
      const correct = (q.correctAnswer || "").trim().toLowerCase();
      results[q.id] = entered === correct;
    } else if (q.type === "match_pairs") {
      const pairs = Array.isArray(q.optionsJson) ? q.optionsJson : [];
      const userMatches = pairAnswers[q.id] || {};

      const currentPairResults = {};

      pairs.forEach((item, idx) => {
        const leftKey = String(item.leftSignId || idx);
        currentPairResults[leftKey] = userMatches[leftKey] === item.right;
      });

      pairResults[q.id] = currentPairResults;
      results[q.id] =
        pairs.length > 0 &&
        Object.values(currentPairResults).every(Boolean);
    } else if (q.type === "camera_sign_match") {
        results[q.id] = !!cameraStatuses[q.id];
    } else {
      results[q.id] = false;
    }
  });

  setCheckedResults(results);
  setPairCheckedResults(pairResults);
  setHasCheckedAll(true);
};

const handleRefreshAnswers = () => {
  setSelectedAnswers({});
  setTextAnswers({});
  setPairAnswers({});
  setCheckedResults({});
  setPairCheckedResults({});
  setCameraPredictions({});
  setCameraStatuses({});
  setCameraStableCounts({});
  setHasCheckedAll(false);
  setProgressSaved(false);
};

const isCameraPredictionCorrect = (question, predictedLabel) => {
  if (!question?.sign || !predictedLabel) return false;

  const expected = String(question.sign.word || "")
    .trim()
    .toLowerCase();

  const normalizedPrediction = String(predictedLabel)
    .trim()
    .toLowerCase();

  return expected === normalizedPrediction;
};

const handleCameraMatchDone = (questionId) => {
  if (hasCheckedAll) return;

  setCameraAnswers((prev) => ({
    ...prev,
    [questionId]: true,
  }));
};

const handleCameraPrediction = (question, prediction) => {
  const label = prediction?.label || "";
  const confidence = prediction?.confidence ?? 0;
  const handDetected = prediction?.handDetected ?? false;

  const isCorrect =
    handDetected &&
    confidence > 0.5 &&
    isCameraPredictionCorrect(question, label);

  setCameraPredictions((prev) => ({
    ...prev,
    [question.id]: {
      label,
      confidence,
      handDetected,
    },
  }));

  setCameraStatuses((prev) => ({
    ...prev,
    [question.id]: isCorrect,
  }));

  if (isCorrect) {
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("stop-camera-sign-predictor", {
          detail: { questionId: question.id },
        })
      );
    }, 300);
  }
};

const scoreBreakdown = useMemo(() => {
  if (!allQuestions.length) {
    return {
      totalPercent: 0,
      exactSolvedCount: 0,
    };
  }

  const perQuestionWeight = 100 / allQuestions.length;

  let totalPercent = 0;
  let exactSolvedCount = 0;

  allQuestions.forEach((q) => {
    if (q.type === "match_pairs") {
      const pairs = Array.isArray(q.optionsJson) ? q.optionsJson : [];
      const pairResults = pairCheckedResults[q.id] || {};
      const totalPairs = pairs.length;

      if (totalPairs > 0) {
        const correctPairs = Object.values(pairResults).filter(Boolean).length;
        const perPairWeight = perQuestionWeight / totalPairs;
        const questionPercent = correctPairs * perPairWeight;

        totalPercent += questionPercent;

        if (correctPairs === totalPairs) {
          exactSolvedCount += 1;
        }
      }
    } else {
      if (checkedResults[q.id]) {
        totalPercent += perQuestionWeight;
        exactSolvedCount += 1;
      }
    }
  });

  return {
    totalPercent: Math.round(totalPercent),
    exactSolvedCount,
  };
}, [allQuestions, checkedResults, pairCheckedResults]);

const quizScore = scoreBreakdown.totalPercent;
const solvedCount = scoreBreakdown.exactSolvedCount;

  const handleMarkCompleted = async () => {
    if (!token) {
        alert("Please login first");
        return;
    }

    if (!hasCheckedAll) {
        alert("Please check your answers first");
        return;
    }

    try {
        setSavingProgress(true);

        const res = await saveProgress(
        {
            lessonId: Number(id),
            completed: true,
            score: quizScore,
        },
        token
        );

        setLessonProgress(res.progress);
        setProgressSaved(true);
        alert("Lesson completed successfully");
    } catch (error) {
        console.error(error);
        alert("Failed to save progress");
    } finally {
        setSavingProgress(false);
    }
};

  if (!lesson) {
    return <div className="page-container">Loading...</div>;
  }

  return (
    <div className="page-container">
     <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
            flexWrap: "wrap",
        }}>
        <div>
            <span className="badge">{lesson.category?.name}</span>
            <h1 className="page-title" style={{ marginTop: "14px" }}>
                {lesson.title}
            </h1>
            <p className="page-subtitle">{lesson.description}</p>
        </div>
      
      {role !== "admin" && (
        <div className="actions-row" style={{ marginTop: "20px" }}>
            <button
            className="btn btn-primary"
            onClick={handleMarkCompleted}
            disabled={!hasCheckedAll || savingProgress || lessonProgress?.completed}
            style={{
                opacity: !hasCheckedAll || savingProgress || lessonProgress?.completed ? 0.6 : 1,
                cursor:
                !hasCheckedAll || savingProgress || lessonProgress?.completed
                    ? "not-allowed"
                    : "pointer",
            }}
            >
            {lessonProgress?.completed
                ? "Lesson Completed"
                : savingProgress
                ? "Saving..."
                : "Mark Lesson as Completed"}
            </button>
        </div>
       )}
     </div>

      <div className="grid grid-3" style={{ marginBottom: "20px" }}>
        <div className="card">
          <h3 className="section-title">Signs</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            {orderedSigns.length}
          </p>
        </div>

        <div className="card">
          <h3 className="section-title">Practice Score</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            {quizScore}%
          </p>
        </div>

        <div className="card">
          <h3 className="section-title">Lesson Status</h3>
          <p style={{ margin: 0, color: "#64748b" }}>
            {progressSaved ? "Saved to dashboard" : "Not saved yet"}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gap: "24px" }}>
        <div className="card">
          <div className="toolbar" style={{ marginBottom: "16px" }}>
            <div className="toolbar-left">
              <h2 className="section-title" style={{ margin: 0 }}>
                Signs in this lesson
              </h2>
              <span className="badge">{orderedSigns.length} items</span>
            </div>
          </div>

          {orderedSigns.length === 0 ? (
            <div className="empty-state">No signs available yet.</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "16px",
              }}
            >
              {orderedSigns.map((sign) => (
                <div
                  key={sign.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "14px",
                    background: "#f8fafc",
                  }}
                >
                  {sign.imageUrl ? (
                    <img
                      src={sign.imageUrl}
                      alt={sign.word}
                      style={{
                        width: "100%",
                        height: "220px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        marginBottom: "12px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "220px",
                        borderRadius: "12px",
                        background: "#e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#64748b",
                        marginBottom: "12px",
                      }}
                    >
                      No image
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <strong style={{ fontSize: "1rem" }}>{sign.word}</strong>
                    {sign.order != null && <span className="badge">#{sign.order}</span>}
                  </div>

                  <div
                    style={{
                      color: "#0f172a",
                      fontWeight: 600,
                      marginBottom: "6px",
                    }}
                  >
                    {sign.meaningUz}
                  </div>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "0.92rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {sign.description || "No description provided."}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="toolbar" style={{ marginBottom: "16px" }}>
            <div className="toolbar-left">
              <h2 className="section-title" style={{ margin: 0 }}>
                Practice
              </h2>
              <span className="badge">{allQuestions.length} questions</span>
            </div>

            <div className="toolbar-right">
              {!showPractice ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowPractice(true)}
                >
                  Start Practice
                </button>
              ) : (
                <button
                    className="btn btn-secondary"
                    onClick={handleRefreshAnswers}
                    disabled={lessonProgress?.completed}
                    style={{
                        opacity: lessonProgress?.completed ? 0.6 : 1,
                        cursor: lessonProgress?.completed ? "not-allowed" : "pointer",
                    }}
                    title={
                        lessonProgress?.completed
                        ? "Lesson already completed. Reset is disabled."
                        : ""
                    }
                    >
                    Refresh Answers
                </button>
              )}
            </div>
          </div>

          {!showPractice ? (
            <div className="empty-state">
              Click <strong>Start Practice</strong> to open question types and solve
              all questions.
            </div>
          ) : allQuestions.length === 0 ? (
            <div className="empty-state">No practice questions available yet.</div>
          ) : (
            <div style={{ display: "grid", gap: "24px" }}>
              {Object.entries(groupedQuestions).map(([type, questions]) => (
                <div
                  key={type}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "16px",
                    background: "#f8fafc",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginBottom: "16px",
                    }}
                  >
                    <h3 style={{ margin: 0 }}>{TYPE_LABELS[type] || type}</h3>
                    <span className="badge">{questions.length} question(s)</span>
                  </div>

                  <div style={{ display: "grid", gap: "20px" }}>
                    {questions.map((q, index) => {
                      const options = Array.isArray(q.optionsJson) ? q.optionsJson : [];
                      const isCorrect = checkedResults[q.id];

                      return (
                        <div
                          key={q.id}
                          style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: "14px",
                            padding: "16px",
                            background: "#fff",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 700,
                              marginBottom: "8px",
                              fontSize: "1rem",
                            }}
                          >
                            {index + 1}. {q.prompt}
                          </div>

                          {q.quizTitle && (
                            <div style={{ color: "#64748b", marginBottom: "12px" }}>
                              Quiz: {q.quizTitle}
                            </div>
                          )}

                        {q.type === "sign_to_meaning_mcq" && (
                            <>
                                <div style={{ marginBottom: "14px" }}>
                                {q.sign?.imageUrl ? (
                                    <img
                                    src={q.sign.imageUrl}
                                    alt={q.sign?.word || "Sign image"}
                                    style={{
                                        width: "250px",
                                        height: "250px",
                                        objectFit: "cover",
                                        borderRadius: "12px",
                                        display: "block",
                                        border: "1px solid #e2e8f0",
                                    }}
                                    />
                                ) : (
                                    <div
                                    style={{
                                        width: "100%",
                                        height: "260px",
                                        borderRadius: "12px",
                                        background: "#f1f5f9",
                                        border: "1px dashed #cbd5e1",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#64748b",
                                        fontWeight: 500,
                                        textAlign: "center",
                                        padding: "16px",
                                    }}
                                    >
                                    Sign image is missing for this question
                                    </div>
                                )}
                                </div>

                                <div style={{ display: "grid", gap: "10px" }}>
                                {options.map((option, idx) => (
                                    <button
                                    key={idx}
                                    className={`quiz-option ${
                                        selectedAnswers[q.id] === option ? "selected" : ""
                                    }`}
                                    onClick={() => handleSelectAnswer(q.id, option)}
                                    disabled={hasCheckedAll || !q.sign?.imageUrl}
                                    style={{
                                        opacity: !q.sign?.imageUrl ? 0.6 : 1,
                                        cursor:
                                        hasCheckedAll || !q.sign?.imageUrl ? "not-allowed" : "pointer",
                                    }}
                                    >
                                    {getOptionLabel(idx)}. {option} harfi
                                    </button>
                                ))}
                                </div>
                            </>
                            )}

                          {q.type === "word_to_sign_mcq" && (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                    gap: "12px",
                                    alignItems: "start",
                                }}
                            >
                                {options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectAnswer(q.id, String(option.signId))}
                                    disabled={hasCheckedAll}
                                    className={`quiz-option ${
                                    selectedAnswers[q.id] === String(option.signId) ? "selected" : ""
                                    }`}
                                    style={{
                                        textAlign: "left",
                                        padding: "10px",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "12px",
                                        background: "#fff",
                                        cursor: hasCheckedAll ? "not-allowed" : "pointer",
                                    }}
                                >
                                    {option.imageUrl ? (
                                    <>
                                        <div className="quiz-image-wrapper">
                                        <img
                                            src={option.imageUrl}
                                            alt={option.word}
                                            className="quiz-image"
                                        />
                                        </div>
                                    </>
                                    ) : (
                                    <div
                                        style={{
                                            width: "100%",
                                            height: "150px",
                                            background: "#e2e8f0",
                                            borderRadius: "10px",
                                            marginBottom: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#64748b",
                                        }}
                                    >
                                        No image
                                    </div>
                                    )}

                                    <div
                                    style={{
                                        fontWeight: 600,
                                        marginTop: "8px",
                                        textAlign: "center",
                                    }}
                                    >
                                    {getOptionLabel(idx)}
                                    </div>
                                </button>
                                ))}
                            </div>
                            )}

                          {q.type === "sign_to_text" && (
                            <>
                              {q.sign?.imageUrl && (
                                <img
                                  src={q.sign.imageUrl}
                                  alt={q.sign.word}
                                  style={{
                                    width: "100%",
                                    maxHeight: "240px",
                                    objectFit: "cover",
                                    borderRadius: "12px",
                                    marginBottom: "14px",
                                  }}
                                />
                              )}

                              <input
                                className="input"
                                placeholder="Type your answer"
                                value={textAnswers[q.id] || ""}
                                onChange={(e) =>
                                  handleTextAnswerChange(q.id, e.target.value)
                                }
                                disabled={hasCheckedAll}
                              />
                            </>
                          )}

                          {q.type === "camera_sign_match" && (
                                <>
                                    <CameraSignPredictor
                                    question={q}
                                    disabled={hasCheckedAll}
                                    onPredictionResult={handleCameraPrediction}
                                    />

                                    <div
                                    style={{
                                        marginTop: "12px",
                                        padding: "12px",
                                        borderRadius: "10px",
                                        border: "1px solid #e2e8f0",
                                        background: "#fff",
                                    }}
                                    >
                                    <div style={{ color: "#334155" }}>
                                        Final prediction:
                                        <strong style={{ marginLeft: "6px" }}>
                                        {cameraPredictions[q.id]?.label || "—"}
                                        </strong>
                                    </div>

                                    <div
                                        style={{
                                        marginTop: "8px",
                                        fontWeight: 700,
                                        color:
                                            cameraStatuses[q.id] == null
                                            ? "#64748b"
                                            : cameraStatuses[q.id]
                                            ? "#16a34a"
                                            : "#dc2626",
                                        }}
                                    >
                                        {cameraStatuses[q.id] == null
                                        ? "Waiting for correct sign"
                                        : cameraStatuses[q.id]
                                        ? "Correct sign detected"
                                        : "Wrong sign detected"}
                                    </div>
                                    </div>
                                </>
                           )}

                            {q.type === "match_pairs" && (() => {
                            const pairs = Array.isArray(q.optionsJson) ? q.optionsJson : [];

                            const rightOptions = pairs
                                .map((item) => item.right)
                                .filter(Boolean)
                                .sort();

                            return (
                                <div style={{ display: "grid", gap: "12px" }}>
                                {pairs.map((item, idx) => {
                                    const leftKey = String(item.leftSignId || idx);

                                    const sign = lesson.signs?.find(
                                    (s) => s.id === Number(item.leftSignId)
                                    );

                                    const pairIsCorrect = pairCheckedResults[q.id]?.[leftKey];

                                    return (
                                    <div
                                        key={leftKey}
                                        style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 220px",
                                        gap: "12px",
                                        alignItems: "center",
                                        padding: "10px",
                                        borderRadius: "12px",
                                        border: hasCheckedAll
                                            ? pairIsCorrect
                                            ? "1px solid #22c55e"
                                            : "1px solid #ef4444"
                                            : "1px solid #e2e8f0",
                                        background: hasCheckedAll
                                            ? pairIsCorrect
                                            ? "#f0fdf4"
                                            : "#fef2f2"
                                            : "#fff",
                                        }}
                                    >
                                        <div
                                        style={{
                                            padding: "10px",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "10px",
                                            background: "#f8fafc",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: "200px",
                                            width: "300px"
                                        }}
                                        >
                                        {sign?.imageUrl ? (
                                            <img
                                            src={sign.imageUrl}
                                            alt={sign.word}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                borderRadius: "8px",
                                            }}
                                            />
                                        ) : (
                                            <div style={{ color: "#64748b" }}>No image</div>
                                        )}
                                        </div>

                                        <div>
                                        <select
                                            className="input"
                                            value={pairAnswers[q.id]?.[leftKey] || ""}
                                            onChange={(e) =>
                                            handlePairAnswerChange(q.id, leftKey, e.target.value)
                                            }
                                            disabled={hasCheckedAll}
                                        >
                                            <option value="">Select match</option>
                                            {rightOptions.map((option, optionIdx) => (
                                            <option key={optionIdx} value={option}>
                                                {option}
                                            </option>
                                            ))}
                                        </select>

                                        {hasCheckedAll && (() => {
                                            const pairs = Array.isArray(q.optionsJson) ? q.optionsJson : [];
                                            const totalPairs = pairs.length;
                                            const correctPairs = Object.values(pairCheckedResults[q.id] || {}).filter(Boolean).length;

                                            const perQuestionWeight = allQuestions.length ? 100 / allQuestions.length : 0;
                                            const earnedPercent =
                                                totalPairs > 0 ? Math.round((correctPairs / totalPairs) * perQuestionWeight) : 0;

                                            return (
                                                <div
                                                style={{
                                                    marginTop: "10px",
                                                    fontWeight: 700,
                                                    color: "#334155",
                                                }}
                                                >
                                                Earned for this question: {earnedPercent}%
                                                </div>
                                        );
                                        })()}
                                        </div>
                                    </div>
                                    );
                                })}
                                </div>
                            );
                            })()}

                          {hasCheckedAll && q.type !== "match_pairs" && (
                            <div
                              className={`quiz-feedback ${
                                isCorrect ? "correct" : "wrong"
                              }`}
                              style={{ marginTop: "14px" }}
                            >
                              {isCorrect
                                ? "Correct answer!"
                                : `Wrong answer${
                                    q.correctAnswer
                                      ? `. Correct answer: ${q.correctAnswer}`
                                      : "."
                                  }`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div
                style={{
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ color: "#334155", fontWeight: 700 }}>
                  Result: {solvedCount} / {allQuestions.length} solved ({quizScore}%)
                </div>

                {!hasCheckedAll ? (
                  <button className="btn btn-primary" onClick={handleCheckAllAnswers}>
                    Check Answers
                  </button>
                ) : (
                  <button className="btn btn-secondary" onClick={handleRefreshAnswers}>
                    Refresh Answers
                  </button>
                )}
              </div>
            </div>
          )}

          {role !== "admin" && hasCheckedAll && (
            <div className="actions-row" style={{ marginTop: "20px" }}>
              <button className="btn btn-primary" onClick={handleMarkCompleted}>
                Mark Lesson as Completed
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;