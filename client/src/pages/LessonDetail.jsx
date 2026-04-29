// import { useEffect, useState, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/axios";
// import { useAuth } from "../context/AuthContext";
// import { getLessonProgress, saveProgress } from "../api/progress";
// import "../styles/LessonDetail.css";

// const LessonDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { token, role } = useAuth();

//   const [lesson, setLesson] = useState(null);
//   const [signs, setSigns] = useState([]);
//   const [currentSignIndex, setCurrentSignIndex] = useState(0);
//   const [completedSigns, setCompletedSigns] = useState([]);
//   const [lessonProgress, setLessonProgress] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isLessonCompleted, setIsLessonCompleted] = useState(false);
//   const [showQuizPrompt, setShowQuizPrompt] = useState(false);
//   const [streakUpdated, setStreakUpdated] = useState(false);
//   const [quizScore, setQuizScore] = useState(null);
//   const [allSignsCompleted, setAllSignsCompleted] = useState(false);

//   useEffect(() => {
//     fetchLessonData();
//   }, [id]);

//   const fetchLessonData = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch lesson details
//       const lessonRes = await api.get(`/lessons/${id}`);
//       setLesson(lessonRes.data);
      
//       // Fetch signs for this lesson
//       const signsRes = await api.get(`/signs/lessons/${id}/signs`);
//       const sortedSigns = signsRes.data.sort((a, b) => (a.order || 0) - (b.order || 0));
//       setSigns(sortedSigns);
      
//       // Fetch user progress
//       if (token && role !== "admin") {
//         const progressData = await getLessonProgress(id, token);
//         setLessonProgress(progressData);
//         setIsLessonCompleted(progressData?.completed || false);
        
//         if (progressData?.lastScore) {
//           setQuizScore(progressData.lastScore);
//         }
        
//         // Get completed signs from backend
//         let completedSignIds = progressData?.completedSigns || [];
        
//         // Also check localStorage for unsynced data
//         //const savedCompletedSigns = localStorage.getItem(`lesson_${id}_completed_signs`);
//         if (savedCompletedSigns && !progressData?.completed) {
//           const localCompleted = JSON.parse(savedCompletedSigns);
//           // Merge local and backend (take the larger set)
//           if (localCompleted.length > completedSignIds.length) {
//             completedSignIds = localCompleted;
//           }
//         }
        
//         setCompletedSigns(completedSignIds);
        
//         // Check if all signs are completed
//         if (completedSignIds.length === sortedSigns.length && !progressData?.completed) {
//           setAllSignsCompleted(true);
//           setShowQuizPrompt(true);
//         }
        
//         // Find first uncompleted sign
//         if (sortedSigns.length > 0) {
//           const firstUncompleted = sortedSigns.findIndex(
//             sign => !completedSignIds.includes(sign.id)
//           );
//           if (firstUncompleted !== -1) {
//             setCurrentSignIndex(firstUncompleted);
//           } else {
//             setCurrentSignIndex(0);
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Failed to fetch lesson data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const trackUserActivity = async () => {
//     try {
//       await api.post("/progress/track-activity", {}, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       if (!streakUpdated) {
//         setStreakUpdated(true);
//         const toast = document.createElement('div');
//         toast.className = 'streak-toast';
//         toast.innerHTML = '🔥 +1 day to your streak!';
//         document.body.appendChild(toast);
//         setTimeout(() => toast.remove(), 2000);
//       }
//     } catch (error) {
//       console.error("Failed to track activity:", error);
//     }
//   };

//   const markCurrentSignAsCompleted = async () => {
//     const currentSign = signs[currentSignIndex];
//     if (completedSigns.includes(currentSign.id)) return;
    
//     const newCompletedSigns = [...completedSigns, currentSign.id];
//     setCompletedSigns(newCompletedSigns);
    
//     localStorage.setItem(`lesson_${id}_completed_signs`, JSON.stringify(newCompletedSigns));
    
//     await trackUserActivity();
    
//     if (token) {
//       try {
//         await api.post(`/progress/lesson/${id}/sign-progress`, {
//           signId: currentSign.id,
//           completed: true
//         }, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//       } catch (error) {
//         console.error("Failed to save sign completion:", error);
//       }
//     }
    
//     // Check if ALL signs are now completed
//     if (newCompletedSigns.length === signs.length && !isLessonCompleted) {
//       setAllSignsCompleted(true);
//       setShowQuizPrompt(true);
//     }
//   };

//   const goToQuiz = () => {
//     navigate(`/lessons/${id}/quiz`);
//   };

//   const closeQuizPrompt = () => {
//     setShowQuizPrompt(false);
//   };

//   const goToNextSign = () => {
//     if (currentSignIndex < signs.length - 1) {
//       setCurrentSignIndex(currentSignIndex + 1);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const goToPreviousSign = () => {
//     if (currentSignIndex > 0) {
//       setCurrentSignIndex(currentSignIndex - 1);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const resetProgress = async () => {
//     if (window.confirm("Are you sure you want to reset your progress for this lesson? You'll need to learn all signs again.")) {
//       localStorage.removeItem(`lesson_${id}_completed_signs`);
//       setCompletedSigns([]);
//       setCurrentSignIndex(0);
//       setAllSignsCompleted(false);
//       setShowQuizPrompt(false);
      
//       if (token) {
//         try {
//           await api.delete(`/progress/lesson/${id}/sign-progress`, {
//             headers: { Authorization: `Bearer ${token}` }
//           });
//         } catch (error) {
//           console.error("Failed to reset progress:", error);
//         }
//       }
      
//       alert("Progress reset. You can now learn the signs again.");
//     }
//   };

//   const currentSign = signs[currentSignIndex];
//   const isCurrentSignCompleted = completedSigns.includes(currentSign?.id);
//   const progressPercentage = signs.length ? (completedSigns.length / signs.length) * 100 : 0;

//   if (loading) {
//     return (
//       <div className="lesson-loading">
//         <div className="loading-spinner"></div>
//         <p>Loading lesson content...</p>
//       </div>
//     );
//   }

//   if (!lesson) {
//     return <div className="lesson-error">Lesson not found</div>;
//   }

//   return (
//     <div className="lesson-detail-container">
//       {/* Completed Banner (if lesson is completed) */}
//       {isLessonCompleted && quizScore !== null && (
//         <div className="completed-banner">
//           <div className="completed-banner-content">
//             <span>🏆</span>
//             <div>
//               <strong>Lesson Completed!</strong>
//               <p>You scored {quizScore}% on the quiz. Keep practicing!</p>
//             </div>
//             <button onClick={goToQuiz} className="retake-quiz-btn">
//               Retake Quiz
//             </button>
//           </div>
//         </div>
//       )}

//       {/* All Signs Completed Banner - Show when all signs are done */}
//       {allSignsCompleted && !isLessonCompleted && (
//         <div className="all-signs-completed-banner">
//           <div className="banner-content">
//             <span>🎉</span>
//             <div>
//               <strong>All Signs Completed!</strong>
//               <p>Great job! You've learned all {signs.length} signs. Now take the quiz to complete the lesson.</p>
//             </div>
//             <button onClick={goToQuiz} className="take-quiz-now-btn">
//               Take Quiz Now →
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Quiz Prompt Modal (fallback) */}
//       {showQuizPrompt && !isLessonCompleted && !allSignsCompleted && (
//         <div className="quiz-prompt-overlay">
//           <div className="quiz-prompt-card">
//             <button className="close-prompt" onClick={closeQuizPrompt}>×</button>
//             <div className="quiz-prompt-emoji">📝</div>
//             <h2>Ready to Test Your Knowledge?</h2>
//             <p>You've completed all {signs.length} signs in this lesson!</p>
//             <button onClick={goToQuiz} className="btn btn-primary">
//               Take the Quiz →
//             </button>
//             <button onClick={closeQuizPrompt} className="btn btn-secondary">
//               Continue Reviewing
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Progress Bar */}
//       <div className="lesson-progress-bar">
//         <div 
//           className="lesson-progress-fill" 
//           style={{ width: `${progressPercentage}%` }}
//         />
//         <span className="lesson-progress-text">
//           {completedSigns.length} of {signs.length} signs learned
//         </span>
//       </div>

//       {/* Navigation Header */}
//       <div className="lesson-nav-header">
//         <button onClick={() => navigate("/lessons")} className="nav-back">
//           ← Back to Lessons
//         </button>
//         <h1 className="lesson-title">{lesson.title}</h1>
//         <div className="lesson-actions">
//           <button onClick={resetProgress} className="reset-progress-btn" title="Reset progress">
//             ↺
//           </button>
//           {/* Always show Take Quiz button when lesson is completed OR all signs are completed */}
//           {(isLessonCompleted || allSignsCompleted) && (
//             <button onClick={goToQuiz} className="take-quiz-nav-btn">
//               📝 Take Quiz
//             </button>
//           )}
//           <div className="lesson-counter">
//             Sign {currentSignIndex + 1} of {signs.length}
//           </div>
//         </div>
//       </div>

//       {/* Main Sign Card */}
//       <div className="sign-card-container">
//         <div className="sign-card">
//           {/* Sign Visualization */}
//           <div className="sign-visual">
//             {currentSign?.imageUrl ? (
//               <img 
//                 src={currentSign.imageUrl} 
//                 alt={currentSign.word}
//                 className="sign-image"
//               />
//             ) : (
//               <div className="sign-placeholder">
//                 <span className="sign-letter">{currentSign?.word}</span>
//               </div>
//             )}
//           </div>

//           {/* Video (if available) */}
//           {currentSign?.videoUrl && (
//             <div className="sign-video-container">
//               <video 
//                 src={currentSign.videoUrl}
//                 controls
//                 className="sign-video"
//                 poster={currentSign.imageUrl}
//               />
//             </div>
//           )}

//           {/* Sign Information */}
//           <div className="sign-info">
//             <div className="sign-word-section">
//               <span className="sign-word">{currentSign?.word}</span>
//               <span className="sign-meaning">{currentSign?.meaningUz}</span>
//             </div>

//             <div className="sign-description">
//               <p>{currentSign?.description || "Bu imo-ishora tilidagi belgi. Uni o'rganish uchun rasm va videolardan foydalaning."}</p>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="sign-actions">
//             {!isCurrentSignCompleted ? (
//               <button 
//                 onClick={markCurrentSignAsCompleted}
//                 className="btn-mark-completed"
//               >
//                 ✓ Mark as Learned
//               </button>
//             ) : (
//               <div className="completed-badge">
//                 ✓ Learned
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Navigation Buttons */}
//         <div className="sign-navigation">
//           <button 
//             onClick={goToPreviousSign}
//             disabled={currentSignIndex === 0}
//             className="nav-btn nav-prev"
//           >
//             ← Previous
//           </button>
          
//           <div className="sign-dots">
//             {signs.map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => setCurrentSignIndex(index)}
//                 className={`sign-dot ${index === currentSignIndex ? 'active' : ''} ${completedSigns.includes(signs[index]?.id) ? 'completed' : ''}`}
//                 title={`Go to sign ${index + 1}`}
//               />
//             ))}
//           </div>
          
//           <button 
//             onClick={goToNextSign}
//             disabled={currentSignIndex === signs.length - 1}
//             className="nav-btn nav-next"
//           >
//             Next →
//           </button>
//         </div>
//       </div>

//       {/* Signs Preview Section */}
//       <div className="signs-preview-section">
//         <h3>📖 All Signs in This Lesson</h3>
//         <div className="signs-preview-grid">
//           {signs.map((sign, index) => (
//             <div
//               key={sign.id}
//               onClick={() => setCurrentSignIndex(index)}
//               className={`preview-item ${completedSigns.includes(sign.id) ? 'completed' : ''} ${index === currentSignIndex ? 'current' : ''}`}
//             >
//               <div className="preview-letter">{sign.word}</div>
//               <div className="preview-meaning">{sign.meaningUz}</div>
//               {completedSigns.includes(sign.id) && <div className="preview-check">✓</div>}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LessonDetail;

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { getLessonProgress, saveProgress } from "../api/progress";
import "../styles/LessonDetail.css";

const LessonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, role } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [signs, setSigns] = useState([]);
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [completedSigns, setCompletedSigns] = useState([]);
  const [lessonProgress, setLessonProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [showQuizPrompt, setShowQuizPrompt] = useState(false);
  const [streakUpdated, setStreakUpdated] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [allSignsCompleted, setAllSignsCompleted] = useState(false);

  useEffect(() => {
    fetchLessonData();
  }, [id]);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      
      // Fetch lesson details
      const lessonRes = await api.get(`/lessons/${id}`);
      setLesson(lessonRes.data);
      
      // Fetch signs for this lesson
      const signsRes = await api.get(`/signs/lessons/${id}/signs`);
      const sortedSigns = signsRes.data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setSigns(sortedSigns);
      
      // Fetch user progress
      if (token && role !== "admin") {
        const progressData = await getLessonProgress(id, token);
        setLessonProgress(progressData);
        setIsLessonCompleted(progressData?.completed || false);
        
        if (progressData?.lastScore) {
          setQuizScore(progressData.lastScore);
        }
        
        // Get completed signs from backend ONLY (no localStorage)
        let completedSignIds = progressData?.completedSigns || [];
        
        setCompletedSigns(completedSignIds);
        
        // Check if all signs are completed
        if (completedSignIds.length === sortedSigns.length && !progressData?.completed) {
          setAllSignsCompleted(true);
          setShowQuizPrompt(true);
        }
        
        // Find first uncompleted sign
        if (sortedSigns.length > 0) {
          const firstUncompleted = sortedSigns.findIndex(
            sign => !completedSignIds.includes(sign.id)
          );
          if (firstUncompleted !== -1) {
            setCurrentSignIndex(firstUncompleted);
          } else {
            setCurrentSignIndex(0);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch lesson data:", error);
    } finally {
      setLoading(false);
    }
  };

  const trackUserActivity = async () => {
    try {
      await api.post("/progress/track-activity", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!streakUpdated) {
        setStreakUpdated(true);
        const toast = document.createElement('div');
        toast.className = 'streak-toast';
        toast.innerHTML = '🔥 +1 day to your streak!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      }
    } catch (error) {
      console.error("Failed to track activity:", error);
    }
  };

  const markCurrentSignAsCompleted = async () => {
    const currentSign = signs[currentSignIndex];
    if (completedSigns.includes(currentSign.id)) return;
    
    // Track activity for streak
    await trackUserActivity();
    
    // Update progress in backend (this will create/update UserSignProgress)
    if (token) {
      try {
        await api.post(`/progress/lesson/${id}/sign-progress`, {
          signId: currentSign.id,
          completed: true
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error("Failed to save sign completion:", error);
        alert("Failed to save progress. Please try again.");
        return;
      }
    }
    
    // Refresh lesson data to get updated completed signs
    await fetchLessonData();
  };

  const goToQuiz = () => {
    navigate(`/lessons/${id}/quiz`);
  };

  const closeQuizPrompt = () => {
    setShowQuizPrompt(false);
  };

  const goToNextSign = () => {
    if (currentSignIndex < signs.length - 1) {
      setCurrentSignIndex(currentSignIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousSign = () => {
    if (currentSignIndex > 0) {
      setCurrentSignIndex(currentSignIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const resetProgress = async () => {
    if (window.confirm("Are you sure you want to reset your progress for this lesson? You'll need to learn all signs again.")) {
      if (token) {
        try {
          // Use PATCH instead of DELETE
          await api.patch(`/progress/lesson/${id}/sign-progress/reset`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Refresh data
          await fetchLessonData();
          alert("Progress reset successfully.");
        } catch (error) {
          console.error("Failed to reset progress:", error);
          alert("Failed to reset progress. Please try again.");
        }
      }
    }
  };
  const currentSign = signs[currentSignIndex];
  const isCurrentSignCompleted = completedSigns.includes(currentSign?.id);
  const progressPercentage = signs.length ? (completedSigns.length / signs.length) * 100 : 0;

  if (loading) {
    return (
      <div className="lesson-loading">
        <div className="loading-spinner"></div>
        <p>Loading lesson content...</p>
      </div>
    );
  }

  if (!lesson) {
    return <div className="lesson-error">Lesson not found</div>;
  }

  return (
    <div className="lesson-detail-container">
      {/* Completed Banner (if lesson is completed) */}
      {isLessonCompleted && quizScore !== null && (
        <div className="completed-banner">
          <div className="completed-banner-content">
            <span>🏆</span>
            <div>
              <strong>Lesson Completed!</strong>
              <p>You scored {quizScore}% on the quiz. Keep practicing!</p>
            </div>
            <button onClick={goToQuiz} className="retake-quiz-btn">
              Retake Quiz
            </button>
          </div>
        </div>
      )}

      {/* All Signs Completed Banner - Show when all signs are done */}
      {allSignsCompleted && !isLessonCompleted && (
        <div className="all-signs-completed-banner">
          <div className="banner-content">
            <span>🎉</span>
            <div>
              <strong>All Signs Completed!</strong>
              <p>Great job! You've learned all {signs.length} signs. Now take the quiz to complete the lesson.</p>
            </div>
            <button onClick={goToQuiz} className="take-quiz-now-btn">
              Take Quiz Now →
            </button>
          </div>
        </div>
      )}

      {/* Quiz Prompt Modal (fallback) */}
      {showQuizPrompt && !isLessonCompleted && !allSignsCompleted && (
        <div className="quiz-prompt-overlay">
          <div className="quiz-prompt-card">
            <button className="close-prompt" onClick={closeQuizPrompt}>×</button>
            <div className="quiz-prompt-emoji">📝</div>
            <h2>Ready to Test Your Knowledge?</h2>
            <p>You've completed all {signs.length} signs in this lesson!</p>
            <button onClick={goToQuiz} className="btn btn-primary">
              Take the Quiz →
            </button>
            <button onClick={closeQuizPrompt} className="btn btn-secondary">
              Continue Reviewing
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="lesson-progress-bar">
        <div 
          className="lesson-progress-fill" 
          style={{ width: `${progressPercentage}%` }}
        />
        <span className="lesson-progress-text">
          {completedSigns.length} of {signs.length} signs learned
        </span>
      </div>

      {/* Navigation Header */}
      <div className="lesson-nav-header">
        <button onClick={() => navigate("/lessons")} className="nav-back">
          ← Back to Lessons
        </button>
        <h1 className="lesson-title">{lesson.title}</h1>
        <div className="lesson-actions">
          <button onClick={resetProgress} className="reset-progress-btn" title="Reset progress">
            ↺
          </button>
          {/* Always show Take Quiz button when lesson is completed OR all signs are completed */}
          {(isLessonCompleted || allSignsCompleted) && (
            <button onClick={goToQuiz} className="take-quiz-nav-btn">
              📝 Take Quiz
            </button>
          )}
          <div className="lesson-counter">
            Sign {currentSignIndex + 1} of {signs.length}
          </div>
        </div>
      </div>

      {/* Main Sign Card */}
      <div className="sign-card-container">
        <div className="sign-card">
          {/* Sign Visualization */}
          <div className="sign-visual">
            {currentSign?.imageUrl ? (
              <img 
                src={currentSign.imageUrl} 
                alt={currentSign.word}
                className="sign-image"
              />
            ) : (
              <div className="sign-placeholder">
                <span className="sign-letter">{currentSign?.word}</span>
              </div>
            )}
          </div>

          {/* Video (if available) */}
          {currentSign?.videoUrl && (
            <div className="sign-video-container">
              <video 
                src={currentSign.videoUrl}
                controls
                className="sign-video"
                poster={currentSign.imageUrl}
              />
            </div>
          )}

          {/* Sign Information */}
          <div className="sign-info">
            <div className="sign-word-section">
              <span className="sign-word">{currentSign?.word}</span>
              <span className="sign-meaning">{currentSign?.meaningUz}</span>
            </div>

            <div className="sign-description">
              <p>{currentSign?.description || "Bu imo-ishora tilidagi belgi. Uni o'rganish uchun rasm va videolardan foydalaning."}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sign-actions">
            {!isCurrentSignCompleted ? (
              <button 
                onClick={markCurrentSignAsCompleted}
                className="btn-mark-completed"
              >
                ✓ Mark as Learned
              </button>
            ) : (
              <div className="completed-badge">
                ✓ Learned
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="sign-navigation">
          <button 
            onClick={goToPreviousSign}
            disabled={currentSignIndex === 0}
            className="nav-btn nav-prev"
          >
            ← Previous
          </button>
          
          <div className="sign-dots">
            {signs.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSignIndex(index)}
                className={`sign-dot ${index === currentSignIndex ? 'active' : ''} ${completedSigns.includes(signs[index]?.id) ? 'completed' : ''}`}
                title={`Go to sign ${index + 1}`}
              />
            ))}
          </div>
          
          <button 
            onClick={goToNextSign}
            disabled={currentSignIndex === signs.length - 1}
            className="nav-btn nav-next"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Signs Preview Section */}
      <div className="signs-preview-section">
        <h3>📖 All Signs in This Lesson</h3>
        <div className="signs-preview-grid">
          {signs.map((sign, index) => (
            <div
              key={sign.id}
              onClick={() => setCurrentSignIndex(index)}
              className={`preview-item ${completedSigns.includes(sign.id) ? 'completed' : ''} ${index === currentSignIndex ? 'current' : ''}`}
            >
              <div className="preview-letter">{sign.word}</div>
              <div className="preview-meaning">{sign.meaningUz}</div>
              {completedSigns.includes(sign.id) && <div className="preview-check">✓</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;