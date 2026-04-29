// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import api from "../api/axios";
// import { useAuth } from "../context/AuthContext";
// import "../styles/Quizzes.css";

// const Quizzes = () => {
//   const { token, user } = useAuth();
//   const navigate = useNavigate();
//   const [quizzes, setQuizzes] = useState([]);
//   const [lessons, setLessons] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [selectedLesson, setSelectedLesson] = useState("");
//   const [userProgress, setUserProgress] = useState({});

//   useEffect(() => {
//     fetchData();
//   }, [token]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch all lessons
//       const lessonsRes = await api.get("/lessons");
//       setLessons(lessonsRes.data);
      
//       // Fetch all quizzes for each lesson
//       const allQuizzes = [];
//       for (const lesson of lessonsRes.data) {
//         const quizzesRes = await api.get(`/quizzes`);
//         if (quizzesRes.data && quizzesRes.data.length > 0) {
//           allQuizzes.push({
//             ...quizzesRes.data[0],
//             lessonId: lesson.id,
//             lessonTitle: lesson.title,
//             lessonCategory: lesson.category?.name,
//             signsCount: lesson.signs?.length || 0,
//             isPremium: lesson.isPremium || false
//           });
//         }
//       }
      
//       setQuizzes(allQuizzes);
      
//       // Fetch user progress for quizzes
//       if (token) {
//         const progressRes = await api.get("/progress/me", {
//           headers: { Authorization: `Bearer ${token}` }
//         });
        
//         const progressMap = {};
//         if (progressRes.data && progressRes.data.progress) {
//           progressRes.data.progress.forEach(p => {
//             progressMap[p.lessonId] = {
//               completed: p.completed,
//               score: p.lastScore || p.bestScore || 0
//             };
//           });
//         } else if (Array.isArray(progressRes.data)) {
//           progressRes.data.forEach(p => {
//             progressMap[p.lessonId] = {
//               completed: p.completed,
//               score: p.lastScore || p.bestScore || 0
//             };
//           });
//         }
//         setUserProgress(progressMap);
//       }
      
//     } catch (error) {
//       console.error("Failed to fetch quizzes:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredQuizzes = quizzes.filter(quiz => {
//     const matchesSearch = !search || 
//       quiz.lessonTitle?.toLowerCase().includes(search.toLowerCase()) ||
//       quiz.title?.toLowerCase().includes(search.toLowerCase());
    
//     const matchesLesson = !selectedLesson || quiz.lessonId === parseInt(selectedLesson);
    
//     return matchesSearch && matchesLesson;
//   });

//   const getQuizStatus = (quiz) => {
//     const progress = userProgress[quiz.lessonId];
    
//     // Check if lesson is completed via quiz
//     if (progress?.completed) {
//         return {
//         status: "completed",
//         label: "Completed",
//         score: progress.bestScore || progress.score || 0,
//         icon: "✅",
//         color: "#10b981"
//         };
//     }
    
//     // Check if all signs are completed (quiz should be unlocked)
//     if (quiz.completedSignsCount === quiz.totalSignsCount && quiz.totalSignsCount > 0) {
//         return {
//         status: "ready",
//         label: "Ready",
//         score: null,
//         icon: "📝",
//         color: "#f59e0b"
//         };
//     }
    
//     return {
//         status: "locked",
//         label: "Locked",
//         score: null,
//         icon: "🔒",
//         color: "#ef4444"
//     };
//   };

//   const handleTakeQuiz = (quiz) => {
//     const status = getQuizStatus(quiz);
//     if (status.status === "locked") {
//       alert("Complete the lesson first to unlock the quiz!");
//       return;
//     }
//     navigate(`/lessons/${quiz.lessonId}/quiz`);
//   };

//   if (loading) {
//     return (
//       <div className="quizzes-page">
//         <div className="loading-spinner"></div>
//         <p>Loading quizzes...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="quizzes-page">
//       <div className="quizzes-header">
//         <h1 className="quizzes-title">📝 Practice Quizzes</h1>
//         <p className="quizzes-subtitle">
//           Test your knowledge with interactive quizzes. Complete lessons first to unlock their quizzes.
//         </p>
//       </div>

//       {/* Stats Summary */}
//       <div className="quizzes-stats">
//         <div className="stat-card">
//           <span className="stat-value">{quizzes.length}</span>
//           <span className="stat-label">Total Quizzes</span>
//         </div>
//         <div className="stat-card">
//           <span className="stat-value">
//             {Object.values(userProgress).filter(p => p.completed).length}
//           </span>
//           <span className="stat-label">Completed</span>
//         </div>
//         <div className="stat-card">
//           <span className="stat-value">
//             {Math.round(Object.values(userProgress).reduce((sum, p) => sum + (p.score || 0), 0) / (Object.values(userProgress).filter(p => p.completed).length || 1))}%
//           </span>
//           <span className="stat-label">Average Score</span>
//         </div>
//       </div>

//       {/* Search and Filter */}
//       <div className="quizzes-filters">
//         <input
//           type="text"
//           className="search-input"
//           placeholder="Search quizzes..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//         <select
//           className="filter-select"
//           value={selectedLesson}
//           onChange={(e) => setSelectedLesson(e.target.value)}
//         >
//           <option value="">All Lessons</option>
//           {lessons.map(lesson => (
//             <option key={lesson.id} value={lesson.id}>
//               {lesson.title}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Quizzes Grid */}
//       {filteredQuizzes.length === 0 ? (
//         <div className="empty-state">
//           <span>📭</span>
//           <p>No quizzes found</p>
//         </div>
//       ) : (
//         <div className="quizzes-grid">
//           {filteredQuizzes.map(quiz => {
//             const status = getQuizStatus(quiz);
//             const isLocked = status.status === "locked";
            
//             return (
//               <div key={quiz.id} className={`quiz-card ${isLocked ? 'locked' : 'unlocked'}`}>
//                 {quiz.isPremium && (
//                   <div className="premium-badge">💎 Premium</div>
//                 )}
//                 <div className="quiz-card-header">
//                   <div className="quiz-status-icon" style={{ background: `${status.color}15` }}>
//                     {status.icon}
//                   </div>
//                   <div className="quiz-info">
//                     <h3 className="quiz-title">{quiz.lessonTitle}</h3>
//                     <p className="quiz-lesson">{quiz.title || "Lesson Quiz"}</p>
//                   </div>
//                 </div>
                
//                 <div className="quiz-details">
//                   <div className="detail-item">
//                     <span>📚</span>
//                     <span>{quiz.signsCount} signs</span>
//                   </div>
//                   <div className="detail-item">
//                     <span>❓</span>
//                     <span>{quiz.questions?.length || 0} questions</span>
//                   </div>
//                 </div>
                
//                 {status.status === "completed" && (
//                   <div className="quiz-score">
//                     <span>Your score: </span>
//                     <strong style={{ color: "#10b981" }}>{status.score}%</strong>
//                   </div>
//                 )}
                
//                 <button
//                   onClick={() => handleTakeQuiz(quiz)}
//                   className={`quiz-btn ${isLocked ? 'locked-btn' : 'unlocked-btn'}`}
//                   disabled={isLocked}
//                 >
//                   {isLocked ? "🔒 Complete Lesson First" : "📝 Take Quiz →"}
//                 </button>
                
//                 {isLocked && (
//                   <div className="quiz-locked-message">
//                     Complete the lesson to unlock the quiz
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Quizzes;

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/Quizzes.css";

const Quizzes = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userProgress, setUserProgress] = useState({});
  const [completedSigns, setCompletedSigns] = useState({});

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all lessons with their quizzes
      const lessonsRes = await api.get("/lessons");
      const lessons = lessonsRes.data;
      
      // Fetch all quizzes
      const quizzesRes = await api.get("/quizzes");
      const allQuizzes = quizzesRes.data || [];
      
      // Fetch user progress for lessons
      let progressMap = {};
      let completedSignsMap = {};
      
      if (token) {
        // Get lesson progress (completed status)
        const progressRes = await api.get("/progress/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (progressRes.data && progressRes.data.progress) {
          progressRes.data.progress.forEach(p => {
            progressMap[p.lessonId] = {
              completed: p.completed,
              score: p.lastScore || p.bestScore || 0
            };
          });
        } else if (Array.isArray(progressRes.data)) {
          progressRes.data.forEach(p => {
            progressMap[p.lessonId] = {
              completed: p.completed,
              score: p.lastScore || p.bestScore || 0
            };
          });
        }
        
        // Get completed signs for each lesson
        for (const lesson of lessons) {
          try {
            const signsRes = await api.get(`/signs/lessons/${lesson.id}/signs`);
            const allSigns = signsRes.data || [];
            const totalSigns = allSigns.length;
            
            // Get user's completed signs for this lesson
            const completedRes = await api.get(`/signs/lesson/${lesson.id}/completed-signs`, {
              headers: { Authorization: `Bearer ${token}` }
            }).catch(() => ({ data: [] }));
            
            const completedCount = completedRes.data?.length || 0;
            const allSignsCompleted = totalSigns > 0 && completedCount === totalSigns;
            
            completedSignsMap[lesson.id] = {
              total: totalSigns,
              completed: completedCount,
              allCompleted: allSignsCompleted
            };
          } catch (error) {
            console.error(`Failed to fetch signs for lesson ${lesson.id}:`, error);
          }
        }
      }
      
      setUserProgress(progressMap);
      setCompletedSigns(completedSignsMap);
      
      // Combine quizzes with lesson data
      const enhancedQuizzes = allQuizzes.map(quiz => {
        const lesson = lessons.find(l => l.id === quiz.lessonId);
        const progress = progressMap[quiz.lessonId];
        const signsData = completedSignsMap[quiz.lessonId];
        
        // Determine if quiz is unlocked
        const isLessonCompleted = progress?.completed || false;
        const allSignsCompleted = signsData?.allCompleted || false;
        const isUnlocked = isLessonCompleted || allSignsCompleted;
        
        return {
          ...quiz,
          lessonId: quiz.lessonId,
          lessonTitle: lesson?.title || "Unknown Lesson",
          lessonCategory: lesson?.category?.name,
          signsCount: lesson?.signs?.length || 0,
          isPremium: lesson?.isPremium || false,
          questionsCount: quiz.questions?.length || 0,
          userProgress: progress,
          isUnlocked: isUnlocked,
          isCompleted: progress?.completed || false,
          allSignsCompleted: allSignsCompleted
        };
      });
      
      setQuizzes(enhancedQuizzes);
      
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = !search || 
      quiz.lessonTitle?.toLowerCase().includes(search.toLowerCase()) ||
      quiz.title?.toLowerCase().includes(search.toLowerCase());
    
    return matchesSearch;
  });

  const getQuizStatus = (quiz) => {
    // If lesson is completed via quiz
    if (quiz.isCompleted) {
      return {
        status: "completed",
        label: "Completed",
        score: quiz.userProgress?.score || 0,
        icon: "✅",
        color: "#10b981"
      };
    }
    
    // If all signs are completed (quiz should be unlocked)
    if (quiz.allSignsCompleted) {
      return {
        status: "ready",
        label: "Ready",
        score: null,
        icon: "📝",
        color: "#f59e0b"
      };
    }
    
    // If lesson is unlocked but not completed
    if (quiz.isUnlocked) {
      return {
        status: "ready",
        label: "Ready",
        score: null,
        icon: "📝",
        color: "#f59e0b"
      };
    }
    
    return {
      status: "locked",
      label: "Locked",
      score: null,
      icon: "🔒",
      color: "#ef4444"
    };
  };

  const handleTakeQuiz = (quiz) => {
    const status = getQuizStatus(quiz);
    if (status.status === "locked") {
      alert("Complete all signs in the lesson first to unlock the quiz!");
      return;
    }
    navigate(`/lessons/${quiz.lessonId}/quiz`);
  };

  const completedCount = Object.values(userProgress).filter(p => p.completed).length;
  const averageScore = Object.values(userProgress)
    .filter(p => p.completed)
    .reduce((sum, p) => sum + (p.score || 0), 0) / (completedCount || 1);

  if (loading) {
    return (
      <div className="quizzes-page">
        <div className="loading-spinner"></div>
        <p>Loading quizzes...</p>
      </div>
    );
  }

  return (
    <div className="quizzes-page">
      <div className="quizzes-header">
        <h1 className="quizzes-title">📝 Practice Quizzes</h1>
        <p className="quizzes-subtitle">
          Test your knowledge with interactive quizzes. Complete all signs in a lesson to unlock its quiz.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="quizzes-stats">
        <div className="stat-card">
          <span className="stat-value">{quizzes.length}</span>
          <span className="stat-label">Total Quizzes</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{completedCount}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{Math.round(averageScore)}%</span>
          <span className="stat-label">Average Score</span>
        </div>
      </div>

      {/* Search */}
      <div className="quizzes-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search quizzes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="empty-state">
          <span>📭</span>
          <p>No quizzes found</p>
        </div>
      ) : (
        <div className="quizzes-grid">
          {filteredQuizzes.map(quiz => {
            const status = getQuizStatus(quiz);
            const isLocked = status.status === "locked";
            const isReady = status.status === "ready";
            
            return (
              <div key={quiz.id} className={`quiz-card ${isLocked ? 'locked' : 'unlocked'}`}>
                {quiz.isPremium && (
                  <div className="premium-badge">💎 Premium</div>
                )}
                <div className="quiz-card-header">
                  <div className="quiz-status-icon" style={{ background: `${status.color}15` }}>
                    {status.icon}
                  </div>
                  <div className="quiz-info">
                    <h3 className="quiz-title">{quiz.lessonTitle}</h3>
                    <p className="quiz-lesson">{quiz.title || "Lesson Quiz"}</p>
                  </div>
                </div>
                
                <div className="quiz-details">
                  <div className="detail-item">
                    <span>📚</span>
                    <span>{quiz.signsCount} signs</span>
                  </div>
                  <div className="detail-item">
                    <span>❓</span>
                    <span>{quiz.questionsCount} questions</span>
                  </div>
                </div>
                
                {status.status === "completed" && (
                  <div className="quiz-score">
                    <span>Your score: </span>
                    <strong style={{ color: "#10b981" }}>{status.score}%</strong>
                  </div>
                )}
                
                {isReady && !quiz.isCompleted && (
                  <div className="quiz-ready-message">
                    ✨ All signs completed! Quiz is ready to take.
                  </div>
                )}
                
                <button
                  onClick={() => handleTakeQuiz(quiz)}
                  className={`quiz-btn ${isLocked ? 'locked-btn' : 'unlocked-btn'}`}
                  disabled={isLocked}
                >
                  {isLocked ? "🔒 Complete All Signs First" : isReady ? "📝 Take Quiz →" : "📝 Take Quiz →"}
                </button>
                
                {isLocked && (
                  <div className="quiz-locked-message">
                    Complete all signs in the lesson to unlock the quiz
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Quizzes;