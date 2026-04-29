// // import { useEffect, useState } from "react";
// // import { useParams, useNavigate } from "react-router-dom";
// // import { useAuth } from "../context/AuthContext";
// // import { getQuizQuestions } from "../api/quiz";
// // import api from "../api/axios";
// // import { saveProgress, saveUserAnswers } from "../api/progress";
// // import CameraSignPredictor from "../components/CameraSignPredictor";
// // import "../styles/QuizQuestion.css";

// // const TYPE_LABELS = {
// //   sign_to_meaning_mcq: "Sign image → choose meaning",
// //   word_to_sign_mcq: "Word → choose sign image",
// //   camera_sign_match: "Word → show sign on camera",
// //   sign_to_text: "Sign image → type the meaning",
// //   match_pairs: "Match pairs",
// // };

// // const getOptionStyle = (isSelected, isChecked, isCorrectAnswer, isLocked) => {
// //   const base = {
// //     width: "100%",
// //     textAlign: "left",
// //     padding: "12px 16px",
// //     borderRadius: "10px",
// //     fontSize: "14px",
// //     fontWeight: 500,
// //     transition: "all 0.15s",
// //     border: "1.5px solid #e2e8f0",
// //     background: "#fff",
// //     color: "#1e293b",
// //   };

// //   if (isLocked) {
// //     if (isSelected && isCorrectAnswer) {
// //       return { ...base, border: "1.5px solid #22c55e", background: "#f0fdf4", color: "#16a34a", fontWeight: 700, cursor: "not-allowed" };
// //     }
// //     if (isSelected && !isCorrectAnswer) {
// //       return { ...base, border: "1.5px solid #ef4444", background: "#fef2f2", color: "#dc2626", fontWeight: 700, cursor: "not-allowed" };
// //     }
// //     if (!isSelected && isCorrectAnswer) {
// //       return { ...base, border: "1.5px solid #22c55e", background: "#f0fdf4", color: "#16a34a", fontWeight: 600, opacity: 0.7, cursor: "not-allowed" };
// //     }
// //     return { ...base, opacity: 0.6, cursor: "not-allowed" };
// //   }

// //   if (!isChecked) {
// //     if (isSelected) return { ...base, border: "1.5px solid #0d6efd", background: "#e7f0ff", color: "#0d6efd", fontWeight: 600 };
// //     return base;
// //   }
  
// //   if (isSelected && isCorrectAnswer) return { ...base, border: "1.5px solid #22c55e", background: "#f0fdf4", color: "#16a34a", fontWeight: 700, cursor: "not-allowed" };
// //   if (isSelected && !isCorrectAnswer) return { ...base, border: "1.5px solid #ef4444", background: "#fef2f2", color: "#dc2626", fontWeight: 700, cursor: "not-allowed" };
// //   if (!isSelected && isCorrectAnswer) return { ...base, border: "1.5px solid #22c55e", background: "#f0fdf4", color: "#16a34a", fontWeight: 600, opacity: 0.7, cursor: "not-allowed" };
// //   return { ...base, opacity: 0.45, cursor: "not-allowed" };
// // };

// // const QuizPage = () => {
// //   const { id } = useParams();
// //   const navigate = useNavigate();
// //   const { token, role } = useAuth();
// //   const getOptionLabel = (index) => String.fromCharCode(65 + index);

// //   const [lesson, setLesson] = useState(null);
// //   const [allQuestions, setAllQuestions] = useState([]);
// //   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
// //   const [selectedAnswers, setSelectedAnswers] = useState({});
// //   const [textAnswers, setTextAnswers] = useState({});
// //   const [pairAnswers, setPairAnswers] = useState({});
// //   const [cameraPredictions, setCameraPredictions] = useState({});
// //   const [cameraStatuses, setCameraStatuses] = useState({});
// //   const [hasCheckedAll, setHasCheckedAll] = useState(false);
// //   const [checkedResults, setCheckedResults] = useState({});
// //   const [pairCheckedResults, setPairCheckedResults] = useState({});
// //   const [quizSubmitted, setQuizSubmitted] = useState(false);
// //   const [score, setScore] = useState(0);
// //   const [loading, setLoading] = useState(true);
// //   const [submitting, setSubmitting] = useState(false);

// //   useEffect(() => {
// //     fetchLessonAndQuestions();
// //   }, [id]);

// //   const fetchLessonAndQuestions = async () => {
// //     try {
// //       setLoading(true);
      
// //       // Fetch lesson details
// //       const lessonRes = await api.get(`/lessons/${id}`);
// //       setLesson(lessonRes.data);
      
// //       // Fetch all questions from lesson's quizzes
// //       if (lessonRes.data?.quizzes?.length) {
// //         const questionsByQuiz = await Promise.all(
// //           lessonRes.data.quizzes.map(async (quiz) => {
// //             const questions = await getQuizQuestions(quiz.id, token);
// //             return questions.map((q) => ({ ...q, quizTitle: quiz.title }));
// //           })
// //         );
// //         setAllQuestions(questionsByQuiz.flat());
// //       }
// //     } catch (error) {
// //       console.error("Failed to fetch lesson data:", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleSelectAnswer = (questionId, value) => {
// //     if (hasCheckedAll) return;
// //     setSelectedAnswers((prev) => ({ ...prev, [questionId]: value }));
// //   };

// //   const handleTextAnswerChange = (questionId, value) => {
// //     if (hasCheckedAll) return;
// //     setTextAnswers((prev) => ({ ...prev, [questionId]: value }));
// //   };

// //   const handlePairAnswerChange = (questionId, leftKey, rightValue) => {
// //     if (hasCheckedAll) return;
// //     setPairAnswers((prev) => ({
// //       ...prev,
// //       [questionId]: { ...(prev[questionId] || {}), [leftKey]: rightValue },
// //     }));
// //   };

// //   const handleCameraPrediction = (question, prediction) => {
// //     const label = prediction?.label || "";
// //     const confidence = prediction?.confidence ?? 0;
// //     const handDetected = prediction?.handDetected ?? false;
// //     const isCorrect = handDetected && confidence > 0.5 && 
// //       String(question?.sign?.word || "").trim().toLowerCase() === String(label).trim().toLowerCase();
    
// //     setCameraPredictions((prev) => ({ ...prev, [question.id]: { label, confidence, handDetected } }));
// //     setCameraStatuses((prev) => ({ ...prev, [question.id]: isCorrect }));
    
// //     if (isCorrect) {
// //       setTimeout(() => {
// //         window.dispatchEvent(new CustomEvent("stop-camera-sign-predictor", { detail: { questionId: question.id } }));
// //       }, 300);
// //     }
// //   };

// //   const handleSubmitQuiz = async () => {
// //     if (submitting) return;
    
// //     setSubmitting(true);
    
// //     // Calculate results
// //     const results = {};
// //     const pairResults = {};
// //     let correctCount = 0;
// //     let totalPoints = 0;
    
// //     allQuestions.forEach((q) => {
// //       if (q.type === "sign_to_meaning_mcq") {
// //         const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
// //         results[q.id] = isCorrect;
// //         if (isCorrect) correctCount++;
// //         totalPoints++;
// //       } 
// //       else if (q.type === "word_to_sign_mcq") {
// //         const isCorrect = String(selectedAnswers[q.id] || "") === String(q.correctAnswer || "");
// //         results[q.id] = isCorrect;
// //         if (isCorrect) correctCount++;
// //         totalPoints++;
// //       } 
// //       else if (q.type === "sign_to_text") {
// //         const entered = (textAnswers[q.id] || "").trim().toLowerCase();
// //         const correct = (q.correctAnswer || "").trim().toLowerCase();
// //         const isCorrect = entered === correct;
// //         results[q.id] = isCorrect;
// //         if (isCorrect) correctCount++;
// //         totalPoints++;
// //       } 
// //       else if (q.type === "match_pairs") {
// //         const pairs = Array.isArray(q.optionsJson) ? q.optionsJson : [];
// //         const userMatches = pairAnswers[q.id] || {};
// //         const currentPairResults = {};
// //         let pairCorrectCount = 0;
        
// //         pairs.forEach((item, idx) => {
// //           const leftKey = String(item.leftSignId || idx);
// //           const isPairCorrect = userMatches[leftKey] === item.right;
// //           currentPairResults[leftKey] = isPairCorrect;
// //           if (isPairCorrect) pairCorrectCount++;
// //         });
        
// //         pairResults[q.id] = currentPairResults;
// //         const isOverallCorrect = pairs.length > 0 && pairCorrectCount === pairs.length;
// //         results[q.id] = isOverallCorrect;
// //         if (isOverallCorrect) {
// //           correctCount++;
// //         }
// //         totalPoints++;
// //       } 
// //       else if (q.type === "camera_sign_match") {
// //         const isCorrect = !!cameraStatuses[q.id];
// //         results[q.id] = isCorrect;
// //         if (isCorrect) correctCount++;
// //         totalPoints++;
// //       }
// //     });
    
// //     const finalScore = Math.round((correctCount / totalPoints) * 100);
// //     setScore(finalScore);
// //     setCheckedResults(results);
// //     setPairCheckedResults(pairResults);
// //     setHasCheckedAll(true);
// //     setQuizSubmitted(true);
    
// //     // Save answers to backend
// //     if (token) {
// //       const answersToSave = [];
      
// //       allQuestions.forEach((q) => {
// //         if (q.type === "sign_to_meaning_mcq" || q.type === "word_to_sign_mcq") {
// //           if (selectedAnswers[q.id]) {
// //             answersToSave.push({
// //               questionId: q.id,
// //               selectedAnswer: selectedAnswers[q.id],
// //               isCorrect: results[q.id] || false
// //             });
// //           }
// //         } 
// //         else if (q.type === "sign_to_text") {
// //           if (textAnswers[q.id]) {
// //             answersToSave.push({
// //               questionId: q.id,
// //               selectedAnswer: textAnswers[q.id],
// //               isCorrect: results[q.id] || false
// //             });
// //           }
// //         } 
// //         else if (q.type === "match_pairs") {
// //           if (pairAnswers[q.id] && Object.keys(pairAnswers[q.id]).length > 0) {
// //             answersToSave.push({
// //               questionId: q.id,
// //               selectedAnswer: JSON.stringify(pairAnswers[q.id]),
// //               isCorrect: results[q.id] || false
// //             });
// //           }
// //         }
// //         else if (q.type === "camera_sign_match") {
// //           if (cameraStatuses[q.id] !== undefined) {
// //             const cameraData = {
// //               label: cameraPredictions[q.id]?.label || "",
// //               confidence: cameraPredictions[q.id]?.confidence || 0,
// //               handDetected: cameraPredictions[q.id]?.handDetected || false
// //             };
// //             answersToSave.push({
// //               questionId: q.id,
// //               selectedAnswer: JSON.stringify(cameraData),
// //               isCorrect: cameraStatuses[q.id] || false
// //             });
// //           }
// //         }
// //       });
      
// //       try {
// //         await saveUserAnswers(id, answersToSave, token);
// //         await saveProgress({ 
// //           lessonId: Number(id), 
// //           completed: true, 
// //           score: finalScore 
// //         }, token);
// //       } catch (error) {
// //         console.error("Failed to save quiz results:", error);
// //       }
// //     }
    
// //     setSubmitting(false);
// //   };

// //   const goToNextQuestion = () => {
// //     if (currentQuestionIndex < allQuestions.length - 1) {
// //       setCurrentQuestionIndex(currentQuestionIndex + 1);
// //     }
// //   };

// //   const goToPreviousQuestion = () => {
// //     if (currentQuestionIndex > 0) {
// //       setCurrentQuestionIndex(currentQuestionIndex - 1);
// //     }
// //   };

// //   const goToDashboard = () => {
// //     navigate("/dashboard");
// //   };

// //   const goToLesson = () => {
// //     navigate(`/lessons/${id}`);
// //   };

// //   const renderQuestionContent = (q, index) => {
// //     const options = Array.isArray(q.optionsJson) ? q.optionsJson : [];
// //     const isCorrect = hasCheckedAll ? checkedResults[q.id] : undefined;
// //     const showCheckedState = hasCheckedAll;

// //     if (q.type === "sign_to_meaning_mcq") {
// //       return (
// //         <>
// //           <div style={{ marginBottom: "14px" }}>
// //             {q.sign?.imageUrl ? (
// //               <img src={q.sign.imageUrl} alt={q.sign?.word || "Sign image"} style={{ width: "250px", height: "250px", objectFit: "cover", borderRadius: "12px", display: "block", border: "1px solid #e2e8f0" }} />
// //             ) : (
// //               <div style={{ width: "100%", height: "260px", borderRadius: "12px", background: "#f1f5f9", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontWeight: 500, textAlign: "center", padding: "16px" }}>
// //                 Sign image is missing
// //               </div>
// //             )}
// //           </div>
// //           <div style={{ display: "grid", gap: "10px" }}>
// //             {options.map((option, idx) => {
// //               const isSelected = selectedAnswers[q.id] === option;
// //               const isThisCorrect = option === q.correctAnswer;
// //               return (
// //                 <button
// //                   key={idx}
// //                   onClick={() => handleSelectAnswer(q.id, option)}
// //                   disabled={showCheckedState || !q.sign?.imageUrl}
// //                   style={getOptionStyle(isSelected, showCheckedState, isThisCorrect, false)}
// //                 >
// //                   {getOptionLabel(idx)}. {option}
// //                   {showCheckedState && isSelected && (
// //                     <span style={{ float: "right" }}>{isThisCorrect ? "✓" : "✗"}</span>
// //                   )}
// //                   {showCheckedState && !isSelected && isThisCorrect && (
// //                     <span style={{ float: "right", color: "#16a34a" }}>✓</span>
// //                   )}
// //                 </button>
// //               );
// //             })}
// //           </div>
// //         </>
// //       );
// //     }

// //     if (q.type === "word_to_sign_mcq") {
// //       return (
// //         <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", alignItems: "start" }}>
// //           {options.map((option, idx) => {
// //             const isSelected = selectedAnswers[q.id] === String(option.signId);
// //             const isThisCorrect = String(option.signId) === String(q.correctAnswer);
// //             let borderColor = "#e2e8f0";
// //             let bgColor = "#fff";
// //             if (showCheckedState) {
// //               if (isSelected && isThisCorrect)  { borderColor = "#22c55e"; bgColor = "#f0fdf4"; }
// //               if (isSelected && !isThisCorrect) { borderColor = "#ef4444"; bgColor = "#fef2f2"; }
// //               if (!isSelected && isThisCorrect) { borderColor = "#22c55e"; bgColor = "#f0fdf4"; }
// //             } else if (isSelected) {
// //               borderColor = "#0d6efd"; bgColor = "#e7f0ff";
// //             }
// //             return (
// //               <button
// //                 key={idx}
// //                 onClick={() => handleSelectAnswer(q.id, String(option.signId))}
// //                 disabled={showCheckedState}
// //                 style={{ textAlign: "left", padding: "10px", border: `2px solid ${borderColor}`, borderRadius: "12px", background: bgColor, cursor: showCheckedState ? "not-allowed" : "pointer", transition: "all 0.15s" }}
// //               >
// //                 {option.imageUrl ? (
// //                   <div className="quiz-image-wrapper">
// //                     <img src={option.imageUrl} alt={option.word} className="quiz-image" />
// //                   </div>
// //                 ) : (
// //                   <div style={{ width: "100%", height: "150px", background: "#e2e8f0", borderRadius: "10px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>No image</div>
// //                 )}
// //                 <div style={{ fontWeight: 600, marginTop: "8px", textAlign: "center" }}>
// //                   {getOptionLabel(idx)}
// //                   {showCheckedState && isSelected && (
// //                     <span style={{ marginLeft: 6, color: isThisCorrect ? "#16a34a" : "#dc2626" }}>
// //                       {isThisCorrect ? "✓" : "✗"}
// //                     </span>
// //                   )}
// //                   {showCheckedState && !isSelected && isThisCorrect && (
// //                     <span style={{ marginLeft: 6, color: "#16a34a" }}>✓</span>
// //                   )}
// //                 </div>
// //               </button>
// //             );
// //           })}
// //         </div>
// //       );
// //     }

// //     if (q.type === "sign_to_text") {
// //       return (
// //         <>
// //           {q.sign?.imageUrl && (
// //             <img src={q.sign.imageUrl} alt={q.sign.word} style={{ width: "100%", maxHeight: "240px", objectFit: "cover", borderRadius: "12px", marginBottom: "14px" }} />
// //           )}
// //           <input
// //             className="input"
// //             placeholder="Type your answer"
// //             value={textAnswers[q.id] || ""}
// //             onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
// //             disabled={showCheckedState}
// //             style={{
// //               borderColor: showCheckedState ? (checkedResults[q.id] ? "#22c55e" : "#ef4444") : undefined,
// //               background: showCheckedState ? (checkedResults[q.id] ? "#f0fdf4" : "#fef2f2") : undefined,
// //             }}
// //           />
// //         </>
// //       );
// //     }

// //     if (q.type === "camera_sign_match") {
// //       return (
// //         <>
// //           <CameraSignPredictor
// //             question={q}
// //             disabled={showCheckedState}
// //             onPredictionResult={handleCameraPrediction}
// //           />
// //           <div style={{ marginTop: "12px", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff" }}>
// //             <div style={{ color: "#334155" }}>
// //               Predicted sign: <strong>{cameraPredictions[q.id]?.label || "—"}</strong>
// //             </div>
// //             <div style={{ marginTop: "8px", fontWeight: 700, color: cameraStatuses[q.id] == null ? "#64748b" : cameraStatuses[q.id] ? "#16a34a" : "#dc2626" }}>
// //               {cameraStatuses[q.id] == null 
// //                 ? "Show the sign in front of camera" 
// //                 : cameraStatuses[q.id] 
// //                   ? "✓ Correct sign detected!" 
// //                   : `✗ Wrong sign. Expected: ${q.sign?.word || "unknown"}`}
// //             </div>
// //           </div>
// //         </>
// //       );
// //     }

// //     if (q.type === "match_pairs") {
// //       const pairs = Array.isArray(q.optionsJson) ? q.optionsJson : [];
// //       const rightOptions = pairs.map((item) => item.right).filter(Boolean).sort();
// //       return (
// //         <div style={{ display: "grid", gap: "12px" }}>
// //           {pairs.map((item, idx) => {
// //             const leftKey = String(item.leftSignId || idx);
// //             const sign = lesson?.signs?.find((s) => s.id === Number(item.leftSignId));
// //             const pairIsCorrect = showCheckedState ? pairCheckedResults[q.id]?.[leftKey] : undefined;
// //             return (
// //               <div key={leftKey} style={{ 
// //                 display: "grid", 
// //                 gridTemplateColumns: "1fr 220px", 
// //                 gap: "12px", 
// //                 alignItems: "center", 
// //                 padding: "10px", 
// //                 borderRadius: "12px", 
// //                 border: showCheckedState ? (pairIsCorrect ? "1px solid #22c55e" : "1px solid #ef4444") : "1px solid #e2e8f0", 
// //                 background: showCheckedState ? (pairIsCorrect ? "#f0fdf4" : "#fef2f2") : "#fff" 
// //               }}>
// //                 <div style={{ padding: "10px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", height: "200px", width: "300px" }}>
// //                   {sign?.imageUrl ? (
// //                     <img src={sign.imageUrl} alt={sign.word} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
// //                   ) : (
// //                     <div style={{ color: "#64748b" }}>No image</div>
// //                   )}
// //                 </div>
// //                 <div>
// //                   <select
// //                     className="input"
// //                     value={pairAnswers[q.id]?.[leftKey] || ""}
// //                     onChange={(e) => handlePairAnswerChange(q.id, leftKey, e.target.value)}
// //                     disabled={showCheckedState}
// //                     style={{
// //                       borderColor: showCheckedState ? (pairIsCorrect ? "#22c55e" : "#ef4444") : undefined,
// //                       background: showCheckedState ? (pairIsCorrect ? "#f0fdf4" : "#fef2f2") : undefined,
// //                     }}
// //                   >
// //                     <option value="">Select match</option>
// //                     {rightOptions.map((option, optionIdx) => (
// //                       <option key={optionIdx} value={option}>{option}</option>
// //                     ))}
// //                   </select>
// //                 </div>
// //               </div>
// //             );
// //           })}
// //         </div>
// //       );
// //     }

// //     return null;
// //   };

// //   if (loading) {
// //     return <div className="page-container">Loading quiz...</div>;
// //   }

// //   const currentQuestion = allQuestions[currentQuestionIndex];
// //   const hasAllQuestions = allQuestions.length > 0;
// //   const answeredCount = Object.keys(selectedAnswers).length + Object.keys(textAnswers).length + Object.keys(pairAnswers).length + Object.keys(cameraStatuses).length;
// //   const totalQuestions = allQuestions.length;

// //   // Results view
// //   if (quizSubmitted) {
// //     const percentage = score;
// //     let resultMessage = "";
// //     let resultEmoji = "";
    
// //     if (percentage >= 90) {
// //       resultMessage = "Excellent! You're a sign language master!";
// //       resultEmoji = "🏆";
// //     } else if (percentage >= 70) {
// //       resultMessage = "Great job! Keep practicing!";
// //       resultEmoji = "🎉";
// //     } else if (percentage >= 50) {
// //       resultMessage = "Good effort! Review the lesson and try again.";
// //       resultEmoji = "👍";
// //     } else {
// //       resultMessage = "Need more practice. Review the signs and try again.";
// //       resultEmoji = "📚";
// //     }

// //     return (
// //       <div className="page-container">
// //         <div className="card" style={{ textAlign: "center", padding: "48px", maxWidth: "600px", margin: "0 auto" }}>
// //           <div style={{ fontSize: "64px", marginBottom: "20px" }}>{resultEmoji}</div>
// //           <h1 style={{ marginBottom: "16px" }}>Quiz Completed!</h1>
// //           <div style={{ width: "150px", height: "150px", margin: "0 auto 24px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
// //             <span style={{ fontSize: "48px", fontWeight: "800", color: "white" }}>{score}%</span>
// //           </div>
// //           <p style={{ color: "#64748b", marginBottom: "32px" }}>{resultMessage}</p>
          
// //           <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginBottom: "32px" }}>
// //             <div style={{ textAlign: "center" }}>
// //               <div style={{ fontSize: "28px", fontWeight: "800", color: "#4f46e5" }}>{totalQuestions}</div>
// //               <div style={{ fontSize: "12px", color: "#64748b" }}>Total Questions</div>
// //             </div>
// //             <div style={{ textAlign: "center" }}>
// //               <div style={{ fontSize: "28px", fontWeight: "800", color: "#4f46e5" }}>{Math.round((score / 100) * totalQuestions)}</div>
// //               <div style={{ fontSize: "12px", color: "#64748b" }}>Correct Answers</div>
// //             </div>
// //           </div>
          
// //           <div className="actions-row" style={{ justifyContent: "center" }}>
// //             <button onClick={() => navigate(`/lessons/${id}`)} className="btn btn-secondary">Back to Lesson</button>
// //             <button onClick={goToDashboard} className="btn btn-primary">Go to Dashboard</button>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="page-container">
// //       <div className="card">
// //         <div className="toolbar" style={{ marginBottom: "16px" }}>
// //           <div className="toolbar-left">
// //             <h2 className="section-title" style={{ margin: 0 }}>Lesson Quiz</h2>
// //             <span className="badge">{lesson?.title}</span>
// //           </div>
// //           <div className="toolbar-right">
// //             <span className="badge">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
// //           </div>
// //         </div>

// //         {/* Progress bar */}
// //         <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "2px", marginBottom: "24px", overflow: "hidden" }}>
// //           <div style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`, height: "100%", background: "linear-gradient(90deg, #4f46e5, #7c3aed)", transition: "width 0.3s" }} />
// //         </div>

// //         {hasAllQuestions && currentQuestion && (
// //           <div key={currentQuestion.id} style={{ border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", background: "#fff" }}>
// //             <div style={{ fontWeight: 700, marginBottom: "8px", fontSize: "1rem" }}>
// //               {currentQuestionIndex + 1}. {currentQuestion.prompt}
// //             </div>
// //             {currentQuestion.quizTitle && (
// //               <div style={{ color: "#64748b", marginBottom: "12px" }}>Quiz: {currentQuestion.quizTitle}</div>
// //             )}

// //             {renderQuestionContent(currentQuestion, currentQuestionIndex)}

// //             {hasCheckedAll && currentQuestion.type !== "match_pairs" && currentQuestion.type !== "camera_sign_match" && (
// //               <div style={{ marginTop: "14px", padding: "10px", borderRadius: "8px", background: checkedResults[currentQuestion.id] ? "#f0fdf4" : "#fef2f2", color: checkedResults[currentQuestion.id] ? "#16a34a" : "#dc2626", fontWeight: 500 }}>
// //                 {checkedResults[currentQuestion.id]
// //                   ? "✓ Correct answer!"
// //                   : `✗ Wrong answer${currentQuestion.correctAnswer ? `. Correct answer: ${currentQuestion.correctAnswer}` : "."}`}
// //               </div>
// //             )}
// //           </div>
// //         )}

// //         {/* Navigation */}
// //         <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", gap: "12px" }}>
// //           <button
// //             onClick={goToPreviousQuestion}
// //             disabled={currentQuestionIndex === 0}
// //             className="btn btn-secondary"
// //             style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
// //           >
// //             ← Previous
// //           </button>
          
// //           <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
// //             {allQuestions.map((_, idx) => (
// //               <button
// //                 key={idx}
// //                 onClick={() => setCurrentQuestionIndex(idx)}
// //                 style={{
// //                   width: "32px",
// //                   height: "32px",
// //                   borderRadius: "50%",
// //                   border: currentQuestionIndex === idx ? "2px solid #4f46e5" : "1px solid #e2e8f0",
// //                   background: selectedAnswers[allQuestions[idx].id] || textAnswers[allQuestions[idx].id] || pairAnswers[allQuestions[idx].id] || cameraStatuses[allQuestions[idx].id] !== undefined ? "#d1fae5" : "white",
// //                   cursor: "pointer"
// //                 }}
// //               >
// //                 {idx + 1}
// //               </button>
// //             ))}
// //           </div>

// //           {currentQuestionIndex < totalQuestions - 1 ? (
// //             <button onClick={goToNextQuestion} className="btn btn-primary">
// //               Next →
// //             </button>
// //           ) : (
// //             <button
// //               onClick={handleSubmitQuiz}
// //               disabled={submitting}
// //               className="btn btn-primary"
// //               style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
// //             >
// //               {submitting ? "Submitting..." : "Submit Quiz"}
// //             </button>
// //           )}
// //         </div>

// //         <div style={{ marginTop: "16px", textAlign: "center", fontSize: "12px", color: "#64748b" }}>
// //           {answeredCount} of {totalQuestions} questions answered
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default QuizPage;

// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { getQuizQuestions } from "../api/quiz";
// import api from "../api/axios";
// import { saveProgress, saveUserAnswers } from "../api/progress";
// import { getMySubscription } from "../api/subscription"
// import CameraSignPredictor from "../components/CameraSignPredictor";
// import "../styles/QuizQuestion.css";

// const TYPE_LABELS = {
//   sign_to_meaning_mcq: "Sign image → choose meaning",
//   word_to_sign_mcq: "Word → choose sign image",
//   camera_sign_match: "Word → show sign on camera",
//   sign_to_text: "Sign image → type the meaning",
//   match_pairs: "Match pairs",
// };

// const getOptionStyle = (isSelected, isChecked, isCorrectAnswer, isLocked) => {
//   const base = {
//     width: "100%",
//     textAlign: "left",
//     padding: "12px 16px",
//     borderRadius: "10px",
//     fontSize: "14px",
//     fontWeight: 500,
//     transition: "all 0.15s",
//     border: "1.5px solid #e2e8f0",
//     background: "#fff",
//     color: "#1e293b",
//   };

//   if (isLocked) {
//     if (isSelected && isCorrectAnswer) {
//       return { ...base, border: "1.5px solid #22c55e", background: "#f0fdf4", color: "#16a34a", fontWeight: 700, cursor: "not-allowed" };
//     }
//     if (isSelected && !isCorrectAnswer) {
//       return { ...base, border: "1.5px solid #ef4444", background: "#fef2f2", color: "#dc2626", fontWeight: 700, cursor: "not-allowed" };
//     }
//     if (!isSelected && isCorrectAnswer) {
//       return { ...base, border: "1.5px solid #22c55e", background: "#f0fdf4", color: "#16a34a", fontWeight: 600, opacity: 0.7, cursor: "not-allowed" };
//     }
//     return { ...base, opacity: 0.6, cursor: "not-allowed" };
//   }

//   if (!isChecked) {
//     if (isSelected) return { ...base, border: "1.5px solid #0d6efd", background: "#e7f0ff", color: "#0d6efd", fontWeight: 600 };
//     return base;
//   }
  
//   if (isSelected && isCorrectAnswer) return { ...base, border: "1.5px solid #22c55e", background: "#f0fdf4", color: "#16a34a", fontWeight: 700, cursor: "not-allowed" };
//   if (isSelected && !isCorrectAnswer) return { ...base, border: "1.5px solid #ef4444", background: "#fef2f2", color: "#dc2626", fontWeight: 700, cursor: "not-allowed" };
//   if (!isSelected && isCorrectAnswer) return { ...base, border: "1.5px solid #22c55e", background: "#f0fdf4", color: "#16a34a", fontWeight: 600, opacity: 0.7, cursor: "not-allowed" };
//   return { ...base, opacity: 0.45, cursor: "not-allowed" };
// };

// const QuizPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { token, role } = useAuth();
//   const getOptionLabel = (index) => String.fromCharCode(65 + index);

//   const [lesson, setLesson] = useState(null);
//   const [allQuestions, setAllQuestions] = useState([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [textAnswers, setTextAnswers] = useState({});
//   const [pairAnswers, setPairAnswers] = useState({});
//   const [cameraPredictions, setCameraPredictions] = useState({});
//   const [cameraStatuses, setCameraStatuses] = useState({});
//   const [hasCheckedAll, setHasCheckedAll] = useState(false);
//   const [checkedResults, setCheckedResults] = useState({});
//   const [pairCheckedResults, setPairCheckedResults] = useState({});
//   const [quizSubmitted, setQuizSubmitted] = useState(false);
//   const [score, setScore] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
  
//   // Premium related states
//   const [isPremium, setIsPremium] = useState(false);
//   const [premiumMessage, setPremiumMessage] = useState("");
//   const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//   const [premiumQuestionCount, setPremiumQuestionCount] = useState(0);
//   const [availableQuestions, setAvailableQuestions] = useState([]);

//   useEffect(() => {
//     fetchLessonAndQuestions();
//     checkPremiumStatus();
//   }, [id]);

//   const checkPremiumStatus = async () => {
//     if (!token) return;
//     try {
//       const subscription = await getMySubscription(token);
//       const isUserPremium = subscription && subscription.plan !== "FREE";
//       setIsPremium(isUserPremium);
//     } catch (error) {
//       console.error("Failed to check premium status:", error);
//       setIsPremium(false);
//     }
//   };

//   const fetchLessonAndQuestions = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch lesson details
//       const lessonRes = await api.get(`/lessons/${id}`);
//       setLesson(lessonRes.data);
      
//       // Fetch all questions from lesson's quizzes
//       if (lessonRes.data?.quizzes?.length) {
//         let allQ = [];
//         for (const quiz of lessonRes.data.quizzes) {
//           const response = await getQuizQuestions(quiz.id, token);
//           const questions = response.questions || response;
//           allQ = [...allQ, ...questions.map((q) => ({ ...q, quizTitle: quiz.title }))];
//         }
        
//         // Separate premium questions
//         const premiumQuestions = allQ.filter(q => q.isPremium === true);
//         const freeQuestions = allQ.filter(q => !q.isPremium);
        
//         setPremiumQuestionCount(premiumQuestions.length);
        
//         // Only show upgrade modal for free users who have premium questions
//         if (premiumQuestions.length > 0 && !isPremium) {
//           setPremiumMessage(`✨ Upgrade to Premium to unlock ${premiumQuestions.length} more questions including camera sign detection!`);
//           // Don't auto-show modal, just show banner
//           setShowUpgradeModal(false);
//           setAvailableQuestions(freeQuestions);
//           setAllQuestions(freeQuestions);
//         } else {
//           setAllQuestions(allQ);
//         }
//       }
//     } catch (error) {
//       console.error("Failed to fetch lesson data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelectAnswer = (questionId, value) => {
//     if (hasCheckedAll) return;
//     setSelectedAnswers((prev) => ({ ...prev, [questionId]: value }));
//   };

//   const handleTextAnswerChange = (questionId, value) => {
//     if (hasCheckedAll) return;
//     setTextAnswers((prev) => ({ ...prev, [questionId]: value }));
//   };

//   const handlePairAnswerChange = (questionId, leftKey, rightValue) => {
//     if (hasCheckedAll) return;
//     setPairAnswers((prev) => ({
//       ...prev,
//       [questionId]: { ...(prev[questionId] || {}), [leftKey]: rightValue },
//     }));
//   };

//   const handleCameraPrediction = (question, prediction) => {
//     const label = prediction?.label || "";
//     const confidence = prediction?.confidence ?? 0;
//     const handDetected = prediction?.handDetected ?? false;
//     const isCorrect = handDetected && confidence > 0.5 && 
//       String(question?.sign?.word || "").trim().toLowerCase() === String(label).trim().toLowerCase();
    
//     setCameraPredictions((prev) => ({ ...prev, [question.id]: { label, confidence, handDetected } }));
//     setCameraStatuses((prev) => ({ ...prev, [question.id]: isCorrect }));
    
//     if (isCorrect) {
//       setTimeout(() => {
//         window.dispatchEvent(new CustomEvent("stop-camera-sign-predictor", { detail: { questionId: question.id } }));
//       }, 300);
//     }
//   };

//   const handleSubmitQuiz = async () => {
//     if (submitting) return;
    
//     setSubmitting(true);
    
//     // Calculate results
//     const results = {};
//     const pairResults = {};
//     let correctCount = 0;
//     let totalPoints = 0;
    
//     allQuestions.forEach((q) => {
//       if (q.type === "sign_to_meaning_mcq") {
//         const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
//         results[q.id] = isCorrect;
//         if (isCorrect) correctCount++;
//         totalPoints++;
//       } 
//       else if (q.type === "word_to_sign_mcq") {
//         const isCorrect = String(selectedAnswers[q.id] || "") === String(q.correctAnswer || "");
//         results[q.id] = isCorrect;
//         if (isCorrect) correctCount++;
//         totalPoints++;
//       } 
//       else if (q.type === "sign_to_text") {
//         const entered = (textAnswers[q.id] || "").trim().toLowerCase();
//         const correct = (q.correctAnswer || "").trim().toLowerCase();
//         const isCorrect = entered === correct;
//         results[q.id] = isCorrect;
//         if (isCorrect) correctCount++;
//         totalPoints++;
//       } 
//       else if (q.type === "match_pairs") {
//         const pairs = Array.isArray(q.optionsJson) ? q.optionsJson : [];
//         const userMatches = pairAnswers[q.id] || {};
//         const currentPairResults = {};
//         let pairCorrectCount = 0;
        
//         pairs.forEach((item, idx) => {
//           const leftKey = String(item.leftSignId || idx);
//           const isPairCorrect = userMatches[leftKey] === item.right;
//           currentPairResults[leftKey] = isPairCorrect;
//           if (isPairCorrect) pairCorrectCount++;
//         });
        
//         pairResults[q.id] = currentPairResults;
//         const isOverallCorrect = pairs.length > 0 && pairCorrectCount === pairs.length;
//         results[q.id] = isOverallCorrect;
//         if (isOverallCorrect) {
//           correctCount++;
//         }
//         totalPoints++;
//       } 
//       else if (q.type === "camera_sign_match") {
//         const isCorrect = !!cameraStatuses[q.id];
//         results[q.id] = isCorrect;
//         if (isCorrect) correctCount++;
//         totalPoints++;
//       }
//     });
    
//     const finalScore = Math.round((correctCount / totalPoints) * 100);
//     setScore(finalScore);
//     setCheckedResults(results);
//     setPairCheckedResults(pairResults);
//     setHasCheckedAll(true);
//     setQuizSubmitted(true);
    
//     // Save answers to backend
//     if (token) {
//       const answersToSave = [];
      
//       allQuestions.forEach((q) => {
//         if (q.type === "sign_to_meaning_mcq" || q.type === "word_to_sign_mcq") {
//           if (selectedAnswers[q.id]) {
//             answersToSave.push({
//               questionId: q.id,
//               selectedAnswer: selectedAnswers[q.id],
//               isCorrect: results[q.id] || false
//             });
//           }
//         } 
//         else if (q.type === "sign_to_text") {
//           if (textAnswers[q.id]) {
//             answersToSave.push({
//               questionId: q.id,
//               selectedAnswer: textAnswers[q.id],
//               isCorrect: results[q.id] || false
//             });
//           }
//         } 
//         else if (q.type === "match_pairs") {
//           if (pairAnswers[q.id] && Object.keys(pairAnswers[q.id]).length > 0) {
//             answersToSave.push({
//               questionId: q.id,
//               selectedAnswer: JSON.stringify(pairAnswers[q.id]),
//               isCorrect: results[q.id] || false
//             });
//           }
//         }
//         else if (q.type === "camera_sign_match") {
//           if (cameraStatuses[q.id] !== undefined) {
//             const cameraData = {
//               label: cameraPredictions[q.id]?.label || "",
//               confidence: cameraPredictions[q.id]?.confidence || 0,
//               handDetected: cameraPredictions[q.id]?.handDetected || false
//             };
//             answersToSave.push({
//               questionId: q.id,
//               selectedAnswer: JSON.stringify(cameraData),
//               isCorrect: cameraStatuses[q.id] || false
//             });
//           }
//         }
//       });
      
//       try {
//         await saveUserAnswers(id, answersToSave, token);
//         await saveProgress({ 
//           lessonId: Number(id), 
//           completed: true, 
//           score: finalScore 
//         }, token);
//       } catch (error) {
//         console.error("Failed to save quiz results:", error);
//       }
//     }
    
//     setSubmitting(false);
//   };

//   const goToNextQuestion = () => {
//     if (currentQuestionIndex < allQuestions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//     }
//   };

//   const goToPreviousQuestion = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const goToDashboard = () => {
//     navigate("/dashboard");
//   };

//   const goToLesson = () => {
//     navigate(`/lessons/${id}`);
//   };

//   const renderQuestionContent = (q, index) => {
//     const options = Array.isArray(q.optionsJson) ? q.optionsJson : [];
//     const isCorrect = hasCheckedAll ? checkedResults[q.id] : undefined;
//     const showCheckedState = hasCheckedAll;

//     if (q.type === "sign_to_meaning_mcq") {
//       return (
//         <>
//           <div style={{ marginBottom: "14px" }}>
//             {q.sign?.imageUrl ? (
//               <img src={q.sign.imageUrl} alt={q.sign?.word || "Sign image"} style={{ width: "250px", height: "250px", objectFit: "cover", borderRadius: "12px", display: "block", border: "1px solid #e2e8f0" }} />
//             ) : (
//               <div style={{ width: "100%", height: "260px", borderRadius: "12px", background: "#f1f5f9", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontWeight: 500, textAlign: "center", padding: "16px" }}>
//                 Sign image is missing
//               </div>
//             )}
//           </div>
//           <div style={{ display: "grid", gap: "10px" }}>
//             {options.map((option, idx) => {
//               const isSelected = selectedAnswers[q.id] === option;
//               const isThisCorrect = option === q.correctAnswer;
//               return (
//                 <button
//                   key={idx}
//                   onClick={() => handleSelectAnswer(q.id, option)}
//                   disabled={showCheckedState || !q.sign?.imageUrl}
//                   style={getOptionStyle(isSelected, showCheckedState, isThisCorrect, false)}
//                 >
//                   {getOptionLabel(idx)}. {option}
//                   {showCheckedState && isSelected && (
//                     <span style={{ float: "right" }}>{isThisCorrect ? "✓" : "✗"}</span>
//                   )}
//                   {showCheckedState && !isSelected && isThisCorrect && (
//                     <span style={{ float: "right", color: "#16a34a" }}>✓</span>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </>
//       );
//     }

//     if (q.type === "word_to_sign_mcq") {
//       return (
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", alignItems: "start" }}>
//           {options.map((option, idx) => {
//             const isSelected = selectedAnswers[q.id] === String(option.signId);
//             const isThisCorrect = String(option.signId) === String(q.correctAnswer);
//             let borderColor = "#e2e8f0";
//             let bgColor = "#fff";
//             if (showCheckedState) {
//               if (isSelected && isThisCorrect)  { borderColor = "#22c55e"; bgColor = "#f0fdf4"; }
//               if (isSelected && !isThisCorrect) { borderColor = "#ef4444"; bgColor = "#fef2f2"; }
//               if (!isSelected && isThisCorrect) { borderColor = "#22c55e"; bgColor = "#f0fdf4"; }
//             } else if (isSelected) {
//               borderColor = "#0d6efd"; bgColor = "#e7f0ff";
//             }
//             return (
//               <button
//                 key={idx}
//                 onClick={() => handleSelectAnswer(q.id, String(option.signId))}
//                 disabled={showCheckedState}
//                 style={{ textAlign: "left", padding: "10px", border: `2px solid ${borderColor}`, borderRadius: "12px", background: bgColor, cursor: showCheckedState ? "not-allowed" : "pointer", transition: "all 0.15s" }}
//               >
//                 {option.imageUrl ? (
//                   <div className="quiz-image-wrapper">
//                     <img src={option.imageUrl} alt={option.word} className="quiz-image" />
//                   </div>
//                 ) : (
//                   <div style={{ width: "100%", height: "150px", background: "#e2e8f0", borderRadius: "10px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>No image</div>
//                 )}
//                 <div style={{ fontWeight: 600, marginTop: "8px", textAlign: "center" }}>
//                   {getOptionLabel(idx)}
//                   {showCheckedState && isSelected && (
//                     <span style={{ marginLeft: 6, color: isThisCorrect ? "#16a34a" : "#dc2626" }}>
//                       {isThisCorrect ? "✓" : "✗"}
//                     </span>
//                   )}
//                   {showCheckedState && !isSelected && isThisCorrect && (
//                     <span style={{ marginLeft: 6, color: "#16a34a" }}>✓</span>
//                   )}
//                 </div>
//               </button>
//             );
//           })}
//         </div>
//       );
//     }

//     if (q.type === "sign_to_text") {
//       return (
//         <>
//           {q.sign?.imageUrl && (
//             <img src={q.sign.imageUrl} alt={q.sign.word} style={{ width: "100%", maxHeight: "240px", objectFit: "cover", borderRadius: "12px", marginBottom: "14px" }} />
//           )}
//           <input
//             className="input"
//             placeholder="Type your answer"
//             value={textAnswers[q.id] || ""}
//             onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
//             disabled={showCheckedState}
//             style={{
//               borderColor: showCheckedState ? (checkedResults[q.id] ? "#22c55e" : "#ef4444") : undefined,
//               background: showCheckedState ? (checkedResults[q.id] ? "#f0fdf4" : "#fef2f2") : undefined,
//             }}
//           />
//         </>
//       );
//     }

//     if (q.type === "camera_sign_match") {
//       return (
//         <>
//           <CameraSignPredictor
//             question={q}
//             disabled={showCheckedState}
//             onPredictionResult={handleCameraPrediction}
//           />
//           <div style={{ marginTop: "12px", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff" }}>
//             <div style={{ color: "#334155" }}>
//               Predicted sign: <strong>{cameraPredictions[q.id]?.label || "—"}</strong>
//             </div>
//             <div style={{ marginTop: "8px", fontWeight: 700, color: cameraStatuses[q.id] == null ? "#64748b" : cameraStatuses[q.id] ? "#16a34a" : "#dc2626" }}>
//               {cameraStatuses[q.id] == null 
//                 ? "Show the sign in front of camera" 
//                 : cameraStatuses[q.id] 
//                   ? "✓ Correct sign detected!" 
//                   : `✗ Wrong sign. Expected: ${q.sign?.word || "unknown"}`}
//             </div>
//           </div>
//         </>
//       );
//     }

//     if (q.type === "match_pairs") {
//       const pairs = Array.isArray(q.optionsJson) ? q.optionsJson : [];
//       const rightOptions = pairs.map((item) => item.right).filter(Boolean).sort();
//       return (
//         <div style={{ display: "grid", gap: "12px" }}>
//           {pairs.map((item, idx) => {
//             const leftKey = String(item.leftSignId || idx);
//             const sign = lesson?.signs?.find((s) => s.id === Number(item.leftSignId));
//             const pairIsCorrect = showCheckedState ? pairCheckedResults[q.id]?.[leftKey] : undefined;
//             return (
//               <div key={leftKey} style={{ 
//                 display: "grid", 
//                 gridTemplateColumns: "1fr 220px", 
//                 gap: "12px", 
//                 alignItems: "center", 
//                 padding: "10px", 
//                 borderRadius: "12px", 
//                 border: showCheckedState ? (pairIsCorrect ? "1px solid #22c55e" : "1px solid #ef4444") : "1px solid #e2e8f0", 
//                 background: showCheckedState ? (pairIsCorrect ? "#f0fdf4" : "#fef2f2") : "#fff" 
//               }}>
//                 <div style={{ padding: "10px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", height: "200px", width: "300px" }}>
//                   {sign?.imageUrl ? (
//                     <img src={sign.imageUrl} alt={sign.word} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
//                   ) : (
//                     <div style={{ color: "#64748b" }}>No image</div>
//                   )}
//                 </div>
//                 <div>
//                   <select
//                     className="input"
//                     value={pairAnswers[q.id]?.[leftKey] || ""}
//                     onChange={(e) => handlePairAnswerChange(q.id, leftKey, e.target.value)}
//                     disabled={showCheckedState}
//                     style={{
//                       borderColor: showCheckedState ? (pairIsCorrect ? "#22c55e" : "#ef4444") : undefined,
//                       background: showCheckedState ? (pairIsCorrect ? "#f0fdf4" : "#fef2f2") : undefined,
//                     }}
//                   >
//                     <option value="">Select match</option>
//                     {rightOptions.map((option, optionIdx) => (
//                       <option key={optionIdx} value={option}>{option}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       );
//     }

//     return null;
//   };

//   if (loading) {
//     return <div className="page-container">Loading quiz...</div>;
//   }

//   const currentQuestion = allQuestions[currentQuestionIndex];
//   const hasAllQuestions = allQuestions.length > 0;
//   const answeredCount = Object.keys(selectedAnswers).length + Object.keys(textAnswers).length + Object.keys(pairAnswers).length + Object.keys(cameraStatuses).length;
//   const totalQuestions = allQuestions.length;

//   // Results view
//   if (quizSubmitted) {
//     const percentage = score;
//     let resultMessage = "";
//     let resultEmoji = "";
    
//     if (percentage >= 90) {
//       resultMessage = "Excellent! You're a sign language master!";
//       resultEmoji = "🏆";
//     } else if (percentage >= 70) {
//       resultMessage = "Great job! Keep practicing!";
//       resultEmoji = "🎉";
//     } else if (percentage >= 50) {
//       resultMessage = "Good effort! Review the lesson and try again.";
//       resultEmoji = "👍";
//     } else {
//       resultMessage = "Need more practice. Review the signs and try again.";
//       resultEmoji = "📚";
//     }

//     return (
//       <div className="page-container">
//         <div className="card" style={{ textAlign: "center", padding: "48px", maxWidth: "600px", margin: "0 auto" }}>
//           <div style={{ fontSize: "64px", marginBottom: "20px" }}>{resultEmoji}</div>
//           <h1 style={{ marginBottom: "16px" }}>Quiz Completed!</h1>
//           <div style={{ width: "150px", height: "150px", margin: "0 auto 24px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
//             <span style={{ fontSize: "48px", fontWeight: "800", color: "white" }}>{score}%</span>
//           </div>
//           <p style={{ color: "#64748b", marginBottom: "32px" }}>{resultMessage}</p>
          
//           <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginBottom: "32px" }}>
//             <div style={{ textAlign: "center" }}>
//               <div style={{ fontSize: "28px", fontWeight: "800", color: "#4f46e5" }}>{totalQuestions}</div>
//               <div style={{ fontSize: "12px", color: "#64748b" }}>Questions Taken</div>
//             </div>
//             <div style={{ textAlign: "center" }}>
//               <div style={{ fontSize: "28px", fontWeight: "800", color: "#4f46e5" }}>{Math.round((score / 100) * totalQuestions)}</div>
//               <div style={{ fontSize: "12px", color: "#64748b" }}>Correct Answers</div>
//             </div>
//           </div>
          
//           {premiumQuestionCount > 0 && !isPremium && (
//             <div style={{ marginBottom: "24px", padding: "16px", background: "#fef3c7", borderRadius: "12px" }}>
//               <p style={{ color: "#92400e", marginBottom: "8px" }}>
//                 💎 You answered {totalQuestions} out of {totalQuestions + premiumQuestionCount} available questions.
//               </p>
//               <button onClick={() => navigate("/subscription")} className="btn btn-primary">
//                 Upgrade to Premium for {premiumQuestionCount} More Questions →
//               </button>
//             </div>
//           )}
          
//           <div className="actions-row" style={{ justifyContent: "center" }}>
//             <button onClick={() => navigate(`/lessons/${id}`)} className="btn btn-secondary">Back to Lesson</button>
//             <button onClick={goToDashboard} className="btn btn-primary">Go to Dashboard</button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="page-container">
//       {/* Premium Banner for Free Users */}
//       {premiumQuestionCount > 0 && !isPremium && !showUpgradeModal && (
//         <div className="premium-banner" style={{ marginBottom: "20px", padding: "16px 20px", background: "linear-gradient(135deg, #fef3c7, #fde68a)", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
//           <div>
//             <span style={{ fontSize: "20px" }}>💎</span>
//             <strong style={{ marginLeft: "8px", color: "#92400e" }}>Premium Feature</strong>
//             <span style={{ marginLeft: "8px", color: "#78350f" }}>{premiumQuestionCount} advanced questions locked</span>
//           </div>
//           <button onClick={() => setShowUpgradeModal(true)} className="btn btn-primary" style={{ background: "#f59e0b", padding: "8px 20px", fontSize: "13px" }}>
//             Upgrade to Unlock →
//           </button>
//         </div>
//       )}

//       <div className="card">
//         <div className="toolbar" style={{ marginBottom: "16px" }}>
//           <div className="toolbar-left">
//             <h2 className="section-title" style={{ margin: 0 }}>Lesson Quiz</h2>
//             <span className="badge">{lesson?.title}</span>
//           </div>
//           <div className="toolbar-right">
//             <span className="badge">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
//           </div>
//         </div>

//         {/* Progress bar */}
//         <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "2px", marginBottom: "24px", overflow: "hidden" }}>
//           <div style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`, height: "100%", background: "linear-gradient(90deg, #4f46e5, #7c3aed)", transition: "width 0.3s" }} />
//         </div>

//         {hasAllQuestions && currentQuestion && (
//           <div key={currentQuestion.id} style={{ border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", background: "#fff" }}>
//             <div style={{ fontWeight: 700, marginBottom: "8px", fontSize: "1rem" }}>
//               {currentQuestionIndex + 1}. {currentQuestion.prompt}
//             </div>
//             {currentQuestion.quizTitle && (
//               <div style={{ color: "#64748b", marginBottom: "12px" }}>Quiz: {currentQuestion.quizTitle}</div>
//             )}

//             {renderQuestionContent(currentQuestion, currentQuestionIndex)}

//             {hasCheckedAll && currentQuestion.type !== "match_pairs" && currentQuestion.type !== "camera_sign_match" && (
//               <div style={{ marginTop: "14px", padding: "10px", borderRadius: "8px", background: checkedResults[currentQuestion.id] ? "#f0fdf4" : "#fef2f2", color: checkedResults[currentQuestion.id] ? "#16a34a" : "#dc2626", fontWeight: 500 }}>
//                 {checkedResults[currentQuestion.id]
//                   ? "✓ Correct answer!"
//                   : `✗ Wrong answer${currentQuestion.correctAnswer ? `. Correct answer: ${currentQuestion.correctAnswer}` : "."}`}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Navigation */}
//         <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", gap: "12px" }}>
//           <button
//             onClick={goToPreviousQuestion}
//             disabled={currentQuestionIndex === 0}
//             className="btn btn-secondary"
//             style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
//           >
//             ← Previous
//           </button>
          
//           <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
//             {allQuestions.map((_, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => setCurrentQuestionIndex(idx)}
//                 style={{
//                   width: "32px",
//                   height: "32px",
//                   borderRadius: "50%",
//                   border: currentQuestionIndex === idx ? "2px solid #4f46e5" : "1px solid #e2e8f0",
//                   background: selectedAnswers[allQuestions[idx].id] || textAnswers[allQuestions[idx].id] || pairAnswers[allQuestions[idx].id] || cameraStatuses[allQuestions[idx].id] !== undefined ? "#d1fae5" : "white",
//                   cursor: "pointer"
//                 }}
//               >
//                 {idx + 1}
//               </button>
//             ))}
//           </div>

//           {currentQuestionIndex < totalQuestions - 1 ? (
//             <button onClick={goToNextQuestion} className="btn btn-primary">
//               Next →
//             </button>
//           ) : (
//             <button
//               onClick={handleSubmitQuiz}
//               disabled={submitting}
//               className="btn btn-primary"
//               style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
//             >
//               {submitting ? "Submitting..." : "Submit Quiz"}
//             </button>
//           )}
//         </div>

//         <div style={{ marginTop: "16px", textAlign: "center", fontSize: "12px", color: "#64748b" }}>
//           {answeredCount} of {totalQuestions} questions answered
//         </div>
//       </div>

//       {/* Upgrade Modal */}
//       {showUpgradeModal && (
//         <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
//           <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
//             <button className="modal-close" onClick={() => setShowUpgradeModal(false)}>×</button>
//             <div className="upgrade-modal-icon">💎</div>
//             <h2>Unlock Premium Questions!</h2>
//             <p>{premiumMessage}</p>
//             <div className="upgrade-features">
//               <div className="upgrade-feature">✓ {premiumQuestionCount} additional quiz questions</div>
//               <div className="upgrade-feature">✓ Camera sign detection practice</div>
//               <div className="upgrade-feature">✓ Advanced progress analytics</div>
//               <div className="upgrade-feature">✓ Certificate of completion</div>
//             </div>
//             <div className="upgrade-buttons">
//               <button onClick={() => navigate("/subscription")} className="upgrade-btn">
//                 Upgrade Now
//               </button>
//               <button onClick={() => setShowUpgradeModal(false)} className="continue-btn">
//                 Continue with Free Questions
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QuizPage;

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getQuizQuestions } from "../api/quiz";
import api from "../api/axios";
import { saveProgress, saveUserAnswers } from "../api/progress";
import { getMySubscription } from "../api/subscription"
import CameraSignPredictor from "../components/CameraSignPredictor";
import "../styles/QuizQuestion.css";

const TYPE_LABELS = {
  sign_to_meaning_mcq: "Sign image → choose meaning",
  word_to_sign_mcq: "Word → choose sign image",
  camera_sign_match: "Word → show sign on camera",
  sign_to_text: "Sign image → type the meaning",
  match_pairs: "Match pairs",
};

const getOptionStyle = (isSelected, isChecked, isCorrectAnswer, isLocked) => {
  const base = {
    width: "100%",
    textAlign: "left",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.15s",
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#1e293b",
  };

  if (isLocked) {
    if (isSelected && isCorrectAnswer) {
      return { ...base, border: "1.5px solid #22c55e", background: "#f0fdf4", color: "#16a34a", fontWeight: 700, cursor: "not-allowed" };
    }
    if (isSelected && !isCorrectAnswer) {
      return { ...base, border: "1.5px solid #ef4444", background: "#fef2f2", color: "#dc2626", fontWeight: 700, cursor: "not-allowed" };
    }
    if (!isSelected && isCorrectAnswer) {
      return { ...base, border: "1.5px solid #22c55e", background: "#f0fdf4", color: "#16a34a", fontWeight: 600, opacity: 0.7, cursor: "not-allowed" };
    }
    return { ...base, opacity: 0.6, cursor: "not-allowed" };
  }

  if (!isChecked) {
    if (isSelected) return { ...base, border: "1.5px solid #0d6efd", background: "#e7f0ff", color: "#0d6efd", fontWeight: 600 };
    return base;
  }
  
  if (isSelected && isCorrectAnswer) return { ...base, border: "1.5px solid #22c55e", background: "#f0fdf4", color: "#16a34a", fontWeight: 700, cursor: "not-allowed" };
  if (isSelected && !isCorrectAnswer) return { ...base, border: "1.5px solid #ef4444", background: "#fef2f2", color: "#dc2626", fontWeight: 700, cursor: "not-allowed" };
  if (!isSelected && isCorrectAnswer) return { ...base, border: "1.5px solid #22c55e", background: "#f0fdf4", color: "#16a34a", fontWeight: 600, opacity: 0.7, cursor: "not-allowed" };
  return { ...base, opacity: 0.45, cursor: "not-allowed" };
};

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, role } = useAuth();
  const getOptionLabel = (index) => String.fromCharCode(65 + index);

  const [lesson, setLesson] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [pairAnswers, setPairAnswers] = useState({});
  const [cameraPredictions, setCameraPredictions] = useState({});
  const [cameraStatuses, setCameraStatuses] = useState({});
  const [hasCheckedAll, setHasCheckedAll] = useState(false);
  const [checkedResults, setCheckedResults] = useState({});
  const [pairCheckedResults, setPairCheckedResults] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Premium related states
  const [isPremium, setIsPremium] = useState(false);
  const [premiumMessage, setPremiumMessage] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [premiumQuestionCount, setPremiumQuestionCount] = useState(0);
  const [freeQuestionCount, setFreeQuestionCount] = useState(0);

  useEffect(() => {
    fetchLessonAndQuestions();
    checkPremiumStatus();
  }, [id]);

  const checkPremiumStatus = async () => {
    if (!token) return;
    try {
      const subscription = await getMySubscription(token);
      const isUserPremium = subscription && subscription.plan !== "FREE";
      setIsPremium(isUserPremium);
    } catch (error) {
      console.error("Failed to check premium status:", error);
      setIsPremium(false);
    }
  };

  const fetchLessonAndQuestions = async () => {
    try {
      setLoading(true);
      
      // Fetch lesson details
      const lessonRes = await api.get(`/lessons/${id}`);
      setLesson(lessonRes.data);
      
      // Fetch all questions from lesson's quizzes
      if (lessonRes.data?.quizzes?.length) {
        let allQ = [];
        for (const quiz of lessonRes.data.quizzes) {
          const response = await getQuizQuestions(quiz.id, token);
          // The response now contains { questions: [], premiumCount, isPremium, etc. }
          const questionsData = response.questions || response;
          const questions = Array.isArray(questionsData) ? questionsData : [];
          allQ = [...allQ, ...questions.map((q) => ({ ...q, quizTitle: quiz.title }))];
        }
        
        // Count premium questions
        const premiumQuestions = allQ.filter(q => q.isPremium === true);
        const freeQuestions = allQ.filter(q => !q.isPremium);
        
        setPremiumQuestionCount(premiumQuestions.length);
        setFreeQuestionCount(freeQuestions.length);
        
        // Show ALL questions - premium ones will be locked in UI
        setAllQuestions(allQ);
        
        if (premiumQuestions.length > 0 && !isPremium) {
          setPremiumMessage(`✨ Upgrade to Premium to unlock ${premiumQuestions.length} more questions including camera sign detection!`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch lesson data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId, value) => {
    if (hasCheckedAll) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleTextAnswerChange = (questionId, value) => {
    if (hasCheckedAll) return;
    setTextAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handlePairAnswerChange = (questionId, leftKey, rightValue) => {
    if (hasCheckedAll) return;
    setPairAnswers((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] || {}), [leftKey]: rightValue },
    }));
  };

  const handleCameraPrediction = (question, prediction) => {
    const label = prediction?.label || "";
    const confidence = prediction?.confidence ?? 0;
    const handDetected = prediction?.handDetected ?? false;
    const isCorrect = handDetected && confidence > 0.5 && 
      String(question?.sign?.word || "").trim().toLowerCase() === String(label).trim().toLowerCase();
    
    setCameraPredictions((prev) => ({ ...prev, [question.id]: { label, confidence, handDetected } }));
    setCameraStatuses((prev) => ({ ...prev, [question.id]: isCorrect }));
    
    if (isCorrect) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("stop-camera-sign-predictor", { detail: { questionId: question.id } }));
      }, 300);
    }
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    
    // Calculate results - only count questions the user can answer
    const results = {};
    const pairResults = {};
    let correctCount = 0;
    let totalPoints = 0;
    
    allQuestions.forEach((q) => {
      // Skip premium questions for free users - they don't count toward score
      const isQuestionAccessible = isPremium || !q.isPremium;
      
      if (!isQuestionAccessible) {
        // Premium question locked for free user - mark as not attempted
        results[q.id] = false;
        return;
      }
      
      if (q.type === "sign_to_meaning_mcq") {
        const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
        results[q.id] = isCorrect;
        if (isCorrect) correctCount++;
        totalPoints++;
      } 
      else if (q.type === "word_to_sign_mcq") {
        const isCorrect = String(selectedAnswers[q.id] || "") === String(q.correctAnswer || "");
        results[q.id] = isCorrect;
        if (isCorrect) correctCount++;
        totalPoints++;
      } 
      else if (q.type === "sign_to_text") {
        const entered = (textAnswers[q.id] || "").trim().toLowerCase();
        const correct = (q.correctAnswer || "").trim().toLowerCase();
        const isCorrect = entered === correct;
        results[q.id] = isCorrect;
        if (isCorrect) correctCount++;
        totalPoints++;
      } 
      else if (q.type === "match_pairs") {
        const pairs = Array.isArray(q.optionsJson) ? q.optionsJson : [];
        const userMatches = pairAnswers[q.id] || {};
        const currentPairResults = {};
        let pairCorrectCount = 0;
        
        pairs.forEach((item, idx) => {
          const leftKey = String(item.leftSignId || idx);
          const isPairCorrect = userMatches[leftKey] === item.right;
          currentPairResults[leftKey] = isPairCorrect;
          if (isPairCorrect) pairCorrectCount++;
        });
        
        pairResults[q.id] = currentPairResults;
        const isOverallCorrect = pairs.length > 0 && pairCorrectCount === pairs.length;
        results[q.id] = isOverallCorrect;
        if (isOverallCorrect) {
          correctCount++;
        }
        totalPoints++;
      } 
      else if (q.type === "camera_sign_match") {
        const isCorrect = !!cameraStatuses[q.id];
        results[q.id] = isCorrect;
        if (isCorrect) correctCount++;
        totalPoints++;
      }
    });
    
    const finalScore = totalPoints > 0 ? Math.round((correctCount / totalPoints) * 100) : 0;
    setScore(finalScore);
    setCheckedResults(results);
    setPairCheckedResults(pairResults);
    setHasCheckedAll(true);
    setQuizSubmitted(true);
    
    // Save answers to backend
    if (token) {
      const answersToSave = [];
      
      allQuestions.forEach((q) => {
        const isQuestionAccessible = isPremium || !q.isPremium;
        if (!isQuestionAccessible) return; // Don't save locked premium answers
        
        if (q.type === "sign_to_meaning_mcq" || q.type === "word_to_sign_mcq") {
          if (selectedAnswers[q.id]) {
            answersToSave.push({
              questionId: q.id,
              selectedAnswer: selectedAnswers[q.id],
              isCorrect: results[q.id] || false
            });
          }
        } 
        else if (q.type === "sign_to_text") {
          if (textAnswers[q.id]) {
            answersToSave.push({
              questionId: q.id,
              selectedAnswer: textAnswers[q.id],
              isCorrect: results[q.id] || false
            });
          }
        } 
        else if (q.type === "match_pairs") {
          if (pairAnswers[q.id] && Object.keys(pairAnswers[q.id]).length > 0) {
            answersToSave.push({
              questionId: q.id,
              selectedAnswer: JSON.stringify(pairAnswers[q.id]),
              isCorrect: results[q.id] || false
            });
          }
        }
        else if (q.type === "camera_sign_match") {
          if (cameraStatuses[q.id] !== undefined) {
            const cameraData = {
              label: cameraPredictions[q.id]?.label || "",
              confidence: cameraPredictions[q.id]?.confidence || 0,
              handDetected: cameraPredictions[q.id]?.handDetected || false
            };
            answersToSave.push({
              questionId: q.id,
              selectedAnswer: JSON.stringify(cameraData),
              isCorrect: cameraStatuses[q.id] || false
            });
          }
        }
      });
      
      try {
        await saveUserAnswers(id, answersToSave, token);
        await saveProgress({ 
          lessonId: Number(id), 
          completed: true, 
          score: finalScore 
        }, token);
      } catch (error) {
        console.error("Failed to save quiz results:", error);
      }
    }
    
    setSubmitting(false);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  const goToLesson = () => {
    navigate(`/lessons/${id}`);
  };

  const isQuestionLocked = (question) => {
    return !isPremium && question.isPremium;
  };

  const renderQuestionContent = (q, index) => {
    const options = Array.isArray(q.optionsJson) ? q.optionsJson : [];
    const isCorrect = hasCheckedAll ? checkedResults[q.id] : undefined;
    const showCheckedState = hasCheckedAll;
    const isLocked = isQuestionLocked(q);

    if (isLocked && !showCheckedState) {
      return (
        <div className="locked-question-card">
          <div className="locked-icon">🔒</div>
          <h3>Premium Question</h3>
          <p>This question is only available for premium users.</p>
          <button onClick={() => navigate("/subscription")} className="btn btn-primary">
            Upgrade to Premium
          </button>
        </div>
      );
    }

    if (q.type === "sign_to_meaning_mcq") {
      return (
        <>
          <div style={{ marginBottom: "14px" }}>
            {q.sign?.imageUrl ? (
              <img src={q.sign.imageUrl} alt={q.sign?.word || "Sign image"} style={{ width: "250px", height: "250px", objectFit: "cover", borderRadius: "12px", display: "block", border: "1px solid #e2e8f0" }} />
            ) : (
              <div style={{ width: "100%", height: "260px", borderRadius: "12px", background: "#f1f5f9", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontWeight: 500, textAlign: "center", padding: "16px" }}>
                Sign image is missing
              </div>
            )}
          </div>
          <div style={{ display: "grid", gap: "10px" }}>
            {options.map((option, idx) => {
              const isSelected = selectedAnswers[q.id] === option;
              const isThisCorrect = option === q.correctAnswer;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(q.id, option)}
                  disabled={showCheckedState || !q.sign?.imageUrl}
                  style={getOptionStyle(isSelected, showCheckedState, isThisCorrect, false)}
                >
                  {getOptionLabel(idx)}. {option}
                  {showCheckedState && isSelected && (
                    <span style={{ float: "right" }}>{isThisCorrect ? "✓" : "✗"}</span>
                  )}
                  {showCheckedState && !isSelected && isThisCorrect && (
                    <span style={{ float: "right", color: "#16a34a" }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      );
    }

    if (q.type === "word_to_sign_mcq") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", alignItems: "start" }}>
          {options.map((option, idx) => {
            const isSelected = selectedAnswers[q.id] === String(option.signId);
            const isThisCorrect = String(option.signId) === String(q.correctAnswer);
            let borderColor = "#e2e8f0";
            let bgColor = "#fff";
            if (showCheckedState) {
              if (isSelected && isThisCorrect)  { borderColor = "#22c55e"; bgColor = "#f0fdf4"; }
              if (isSelected && !isThisCorrect) { borderColor = "#ef4444"; bgColor = "#fef2f2"; }
              if (!isSelected && isThisCorrect) { borderColor = "#22c55e"; bgColor = "#f0fdf4"; }
            } else if (isSelected) {
              borderColor = "#0d6efd"; bgColor = "#e7f0ff";
            }
            return (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(q.id, String(option.signId))}
                disabled={showCheckedState}
                style={{ textAlign: "left", padding: "10px", border: `2px solid ${borderColor}`, borderRadius: "12px", background: bgColor, cursor: showCheckedState ? "not-allowed" : "pointer", transition: "all 0.15s" }}
              >
                {option.imageUrl ? (
                  <div className="quiz-image-wrapper">
                    <img src={option.imageUrl} alt={option.word} className="quiz-image" />
                  </div>
                ) : (
                  <div style={{ width: "100%", height: "150px", background: "#e2e8f0", borderRadius: "10px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>No image</div>
                )}
                <div style={{ fontWeight: 600, marginTop: "8px", textAlign: "center" }}>
                  {getOptionLabel(idx)}
                  {showCheckedState && isSelected && (
                    <span style={{ marginLeft: 6, color: isThisCorrect ? "#16a34a" : "#dc2626" }}>
                      {isThisCorrect ? "✓" : "✗"}
                    </span>
                  )}
                  {showCheckedState && !isSelected && isThisCorrect && (
                    <span style={{ marginLeft: 6, color: "#16a34a" }}>✓</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    if (q.type === "sign_to_text") {
      return (
        <>
          {q.sign?.imageUrl && (
            <img src={q.sign.imageUrl} alt={q.sign.word} style={{ width: "100%", maxHeight: "240px", objectFit: "cover", borderRadius: "12px", marginBottom: "14px" }} />
          )}
          <input
            className="input"
            placeholder="Type your answer"
            value={textAnswers[q.id] || ""}
            onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
            disabled={showCheckedState}
            style={{
              borderColor: showCheckedState ? (checkedResults[q.id] ? "#22c55e" : "#ef4444") : undefined,
              background: showCheckedState ? (checkedResults[q.id] ? "#f0fdf4" : "#fef2f2") : undefined,
            }}
          />
        </>
      );
    }

    if (q.type === "camera_sign_match") {
      return (
        <>
          <CameraSignPredictor
            question={q}
            disabled={showCheckedState}
            onPredictionResult={handleCameraPrediction}
          />
          <div style={{ marginTop: "12px", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff" }}>
            <div style={{ color: "#334155" }}>
              Predicted sign: <strong>{cameraPredictions[q.id]?.label || "—"}</strong>
            </div>
            <div style={{ marginTop: "8px", fontWeight: 700, color: cameraStatuses[q.id] == null ? "#64748b" : cameraStatuses[q.id] ? "#16a34a" : "#dc2626" }}>
              {cameraStatuses[q.id] == null 
                ? "Show the sign in front of camera" 
                : cameraStatuses[q.id] 
                  ? "✓ Correct sign detected!" 
                  : `✗ Wrong sign. Expected: ${q.sign?.word || "unknown"}`}
            </div>
          </div>
        </>
      );
    }

    if (q.type === "match_pairs") {
      const pairs = Array.isArray(q.optionsJson) ? q.optionsJson : [];
      const rightOptions = pairs.map((item) => item.right).filter(Boolean).sort();
      return (
        <div style={{ display: "grid", gap: "12px" }}>
          {pairs.map((item, idx) => {
            const leftKey = String(item.leftSignId || idx);
            const sign = lesson?.signs?.find((s) => s.id === Number(item.leftSignId));
            const pairIsCorrect = showCheckedState ? pairCheckedResults[q.id]?.[leftKey] : undefined;
            return (
              <div key={leftKey} style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 220px", 
                gap: "12px", 
                alignItems: "center", 
                padding: "10px", 
                borderRadius: "12px", 
                border: showCheckedState ? (pairIsCorrect ? "1px solid #22c55e" : "1px solid #ef4444") : "1px solid #e2e8f0", 
                background: showCheckedState ? (pairIsCorrect ? "#f0fdf4" : "#fef2f2") : "#fff" 
              }}>
                <div style={{ padding: "10px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", height: "200px", width: "300px" }}>
                  {sign?.imageUrl ? (
                    <img src={sign.imageUrl} alt={sign.word} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
                  ) : (
                    <div style={{ color: "#64748b" }}>No image</div>
                  )}
                </div>
                <div>
                  <select
                    className="input"
                    value={pairAnswers[q.id]?.[leftKey] || ""}
                    onChange={(e) => handlePairAnswerChange(q.id, leftKey, e.target.value)}
                    disabled={showCheckedState}
                    style={{
                      borderColor: showCheckedState ? (pairIsCorrect ? "#22c55e" : "#ef4444") : undefined,
                      background: showCheckedState ? (pairIsCorrect ? "#f0fdf4" : "#fef2f2") : undefined,
                    }}
                  >
                    <option value="">Select match</option>
                    {rightOptions.map((option, optionIdx) => (
                      <option key={optionIdx} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return <div className="page-container">Loading quiz...</div>;
  }

  const currentQuestion = allQuestions[currentQuestionIndex];
  const hasAllQuestions = allQuestions.length > 0;
  const answeredCount = Object.keys(selectedAnswers).length + Object.keys(textAnswers).length + Object.keys(pairAnswers).length + Object.keys(cameraStatuses).length;
  const totalQuestions = allQuestions.length;
  const accessibleQuestions = allQuestions.filter(q => isPremium || !q.isPremium).length;

  // Results view
  if (quizSubmitted) {
    const percentage = score;
    let resultMessage = "";
    let resultEmoji = "";
    
    if (percentage >= 90) {
      resultMessage = "Excellent! You're a sign language master!";
      resultEmoji = "🏆";
    } else if (percentage >= 70) {
      resultMessage = "Great job! Keep practicing!";
      resultEmoji = "🎉";
    } else if (percentage >= 50) {
      resultMessage = "Good effort! Review the lesson and try again.";
      resultEmoji = "👍";
    } else {
      resultMessage = "Need more practice. Review the signs and try again.";
      resultEmoji = "📚";
    }

    return (
      <div className="page-container">
        <div className="card" style={{ textAlign: "center", padding: "48px", maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>{resultEmoji}</div>
          <h1 style={{ marginBottom: "16px" }}>Quiz Completed!</h1>
          <div style={{ width: "150px", height: "150px", margin: "0 auto 24px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "48px", fontWeight: "800", color: "white" }}>{score}%</span>
          </div>
          <p style={{ color: "#64748b", marginBottom: "32px" }}>{resultMessage}</p>
          
          <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginBottom: "32px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#4f46e5" }}>{accessibleQuestions}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Questions Answered</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#4f46e5" }}>{Math.round((score / 100) * accessibleQuestions)}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Correct Answers</div>
            </div>
          </div>
          
          {premiumQuestionCount > 0 && !isPremium && (
            <div style={{ marginBottom: "24px", padding: "16px", background: "#fef3c7", borderRadius: "12px" }}>
              <p style={{ color: "#92400e", marginBottom: "8px" }}>
                💎 You answered {accessibleQuestions} out of {totalQuestions} available questions.
              </p>
              <button onClick={() => navigate("/subscription")} className="btn btn-primary">
                Upgrade to Premium for {premiumQuestionCount} More Questions →
              </button>
            </div>
          )}
          
          <div className="actions-row" style={{ justifyContent: "center" }}>
            <button onClick={() => navigate(`/lessons/${id}`)} className="btn btn-secondary">Back to Lesson</button>
            <button onClick={goToDashboard} className="btn btn-primary">Go to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Premium Banner for Free Users */}
      {premiumQuestionCount > 0 && !isPremium && !showUpgradeModal && (
        <div className="premium-banner" style={{ marginBottom: "20px", padding: "16px 20px", background: "linear-gradient(135deg, #fef3c7, #fde68a)", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span style={{ fontSize: "20px" }}>💎</span>
            <strong style={{ marginLeft: "8px", color: "#92400e" }}>Premium Feature</strong>
            <span style={{ marginLeft: "8px", color: "#78350f" }}>{premiumQuestionCount} advanced questions locked</span>
          </div>
          <button onClick={() => setShowUpgradeModal(true)} className="btn btn-primary" style={{ background: "#f59e0b", padding: "8px 20px", fontSize: "13px" }}>
            Upgrade to Unlock →
          </button>
        </div>
      )}

      <div className="card">
        <div className="toolbar" style={{ marginBottom: "16px" }}>
          <div className="toolbar-left">
            <h2 className="section-title" style={{ margin: 0 }}>Lesson Quiz</h2>
            <span className="badge">{lesson?.title}</span>
          </div>
          <div className="toolbar-right">
            <span className="badge">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "2px", marginBottom: "24px", overflow: "hidden" }}>
          <div style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`, height: "100%", background: "linear-gradient(90deg, #4f46e5, #7c3aed)", transition: "width 0.3s" }} />
        </div>

        {hasAllQuestions && currentQuestion && (
          <div key={currentQuestion.id} style={{ border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px", background: "#fff" }}>
            <div style={{ fontWeight: 700, marginBottom: "8px", fontSize: "1rem" }}>
              {currentQuestionIndex + 1}. {currentQuestion.prompt}
              {isQuestionLocked(currentQuestion) && <span style={{ marginLeft: "8px", fontSize: "12px", color: "#f59e0b" }}>(Premium)</span>}
            </div>
            {currentQuestion.quizTitle && (
              <div style={{ color: "#64748b", marginBottom: "12px" }}>Quiz: {currentQuestion.quizTitle}</div>
            )}

            {renderQuestionContent(currentQuestion, currentQuestionIndex)}

            {hasCheckedAll && currentQuestion.type !== "match_pairs" && currentQuestion.type !== "camera_sign_match" && !isQuestionLocked(currentQuestion) && (
              <div style={{ marginTop: "14px", padding: "10px", borderRadius: "8px", background: checkedResults[currentQuestion.id] ? "#f0fdf4" : "#fef2f2", color: checkedResults[currentQuestion.id] ? "#16a34a" : "#dc2626", fontWeight: 500 }}>
                {checkedResults[currentQuestion.id]
                  ? "✓ Correct answer!"
                  : `✗ Wrong answer${currentQuestion.correctAnswer ? `. Correct answer: ${currentQuestion.correctAnswer}` : "."}`}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", gap: "12px" }}>
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="btn btn-secondary"
            style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
          >
            ← Previous
          </button>
          
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
            {allQuestions.map((q, idx) => {
              const isLocked = isQuestionLocked(q);
              const isAnswered = selectedAnswers[q.id] || textAnswers[q.id] || pairAnswers[q.id] || cameraStatuses[q.id] !== undefined;
              
              return (
                <button
                  key={idx}
                  onClick={() => !isLocked && setCurrentQuestionIndex(idx)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: currentQuestionIndex === idx ? "2px solid #4f46e5" : "1px solid #e2e8f0",
                    background: isLocked ? "#f1f5f9" : (isAnswered ? "#d1fae5" : "white"),
                    cursor: isLocked ? "not-allowed" : "pointer",
                    position: "relative",
                    color: isLocked ? "#94a3b8" : "#1e293b",
                    fontWeight: isLocked ? "normal" : "normal"
                  }}
                  disabled={isLocked}
                  title={isLocked ? "Premium question - Upgrade to unlock" : `Question ${idx + 1}`}
                >
                  {idx + 1}
                  {isLocked && (
                    <span style={{ 
                      position: "absolute", 
                      top: "-4px", 
                      right: "-4px", 
                      fontSize: "12px",
                      opacity: 1,
                      zIndex: 1
                    }}>
                      🔒
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {currentQuestionIndex < totalQuestions - 1 ? (
            <button onClick={goToNextQuestion} className="btn btn-primary">
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="btn btn-primary"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </div>

        <div style={{ marginTop: "16px", textAlign: "center", fontSize: "12px", color: "#64748b" }}>
          {answeredCount} of {accessibleQuestions} questions answered
          {premiumQuestionCount > 0 && !isPremium && ` (${premiumQuestionCount} premium questions locked)`}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUpgradeModal(false)}>×</button>
            <div className="upgrade-modal-icon">💎</div>
            <h2>Unlock Premium Questions!</h2>
            <p>{premiumMessage}</p>
            <div className="upgrade-features">
              <div className="upgrade-feature">✓ {premiumQuestionCount} additional quiz questions</div>
              <div className="upgrade-feature">✓ Camera sign detection practice</div>
              <div className="upgrade-feature">✓ Advanced progress analytics</div>
              <div className="upgrade-feature">✓ Certificate of completion</div>
            </div>
            <div className="upgrade-buttons">
              <button onClick={() => navigate("/subscription")} className="upgrade-btn">
                Upgrade Now
              </button>
              <button onClick={() => setShowUpgradeModal(false)} className="continue-btn">
                Continue with Free Questions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;