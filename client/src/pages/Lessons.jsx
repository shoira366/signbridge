import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { getMyProgress } from "../api/progress";
import "../styles/Lesson.css";

const Lessons = () => {
  const { token, role } = useAuth();

  const [lessons, setLessons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [progress, setProgress] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, [token, role]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const [categoriesRes, lessonsRes] = await Promise.all([
        api.get("/categories"),
        api.get("/lessons"),
      ]);

      setCategories(categoriesRes.data);
      setLessons(lessonsRes.data);

      if (token && role !== "admin") {
        const progressData = await getMyProgress(token);
        
        let progressArray = [];
        if (progressData && progressData.progress) {
          progressArray = progressData.progress || [];
        } else if (Array.isArray(progressData)) {
          progressArray = progressData;
        }
        
        setProgress(progressArray);
      } else {
        setProgress([]);
      }
    } catch (error) {
      console.error("Failed to load lessons page data:", error);
      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  const getLessonProgress = (lessonId) => {
    return progress.find((item) => item.lessonId === lessonId) || null;
  };

  const getQuestionCount = (lesson) => {
    if (!lesson?.quizzes?.length) return 0;

    return lesson.quizzes.reduce((sum, quiz) => {
      return sum + (quiz.questions?.length || 0);
    }, 0);
  };

  const filteredLessons = useMemo(() => {
    const q = search.toLowerCase().trim();

    return lessons.filter((lesson) => {
      const matchesSearch =
        !q ||
        (lesson.title || "").toLowerCase().includes(q) ||
        (lesson.description || "").toLowerCase().includes(q) ||
        (lesson.category?.name || "").toLowerCase().includes(q);

      const matchesCategory = selectedCategory
        ? String(lesson.categoryId) === String(selectedCategory)
        : true;

      return matchesSearch && matchesCategory;
    });
  }, [lessons, search, selectedCategory]);

  const completedCount = useMemo(() => {
    return progress.filter((item) => item.completed).length;
  }, [progress]);

  const averageScore = useMemo(() => {
    if (!progress.length) return 0;
    const total = progress.reduce((sum, item) => sum + (item.lastScore || 0), 0);
    return Math.round(total / progress.length);
  }, [progress]);

  const getStatusLabel = (lessonProgress) => {
    if (lessonProgress?.completed) return "Completed";
    if (lessonProgress) return "In Progress";
    return "Not Started";
  };

  const getStatusClass = (lessonProgress) => {
    if (lessonProgress?.completed) return "completed";
    if (lessonProgress) return "in-progress";
    return "not-started";
  };

  const getQuizState = (hasQuiz, lessonProgress) => {
    if (!hasQuiz) return { label: "No Quiz", class: "no-quiz" };
    if (lessonProgress?.completed) return { label: "Unlocked", class: "unlocked" };
    return { label: "Locked", class: "locked" };
  };

  if (loading) {
    return (
      <div className="lessons-page">
        <div className="loading-container">Loading lessons...</div>
      </div>
    );
  }

  return (
    <div className="lessons-page">
      <div className="lessons-header">
        <span className="lessons-badge">Learning Library</span>
        <h1 className="lessons-title">Explore Lessons</h1>
        <p className="lessons-subtitle">
          Study each lesson first, then unlock practice quizzes step by step.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Lessons</span>
          <strong className="stat-value">{lessons.length}</strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">Completed</span>
          <strong className="stat-value">
            {token && role !== "admin" ? completedCount : 0}
          </strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">Average Score</span>
          <strong className="stat-value">
            {token && role !== "admin" ? `${averageScore}%` : "—"}
          </strong>
        </div>
      </div>

      <div className="toolbar-card card">
        <div className="toolbar">
          <div className="toolbar-left">
            <h2 className="toolbar-title">Find a lesson</h2>
          </div>

          <div className="toolbar-right">
            <input
              className="search-input"
              type="text"
              placeholder="Search lessons, topics, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredLessons.length === 0 ? (
        <div className="empty-state">
          No lessons found for your current search or selected category.
        </div>
      ) : (
        <div>
          {filteredLessons.map((lesson) => {
            const lessonProgress = getLessonProgress(lesson.id);
            const questionCount = getQuestionCount(lesson);
            const hasQuiz = questionCount > 0;
            const signPreview = (lesson.signs || [])
              .slice()
              .sort((a, b) => (a.order ?? 999999) - (b.order ?? 999999))
              .slice(0, 4);

            const statusLabel = getStatusLabel(lessonProgress);
            const statusClass = getStatusClass(lessonProgress);
            const quizState = getQuizState(hasQuiz, lessonProgress);

            return (
              <div key={lesson.id} className="lesson-card">
                <div className="lesson-header">
                  <div className="lesson-title-section">
                    <span className="lesson-difficulty-badge">
                      {lesson.difficulty || "lesson"}
                    </span>
                    <h3 className="lesson-title">{lesson.title}</h3>
                  </div>

                  <div className="lesson-status-badges">
                    <span className={`status-badge ${statusClass}`}>
                      {statusLabel}
                    </span>
                    <span className={`quiz-badge ${quizState.class}`}>
                      Quiz: {quizState.label}
                    </span>
                  </div>
                </div>

                <p className="lesson-description">
                  {lesson.description || "No lesson description"}
                </p>

                <div className="lesson-meta">
                  <span className="meta-pill">
                    Category: {lesson.category?.name || "Unknown"}
                  </span>
                  <span className="meta-pill">
                    {lesson.signs?.length || 0} signs
                  </span>
                  <span className="meta-pill">
                    {questionCount} practice question{questionCount === 1 ? "" : "s"}
                  </span>
                  {lessonProgress && (
                    <span className="meta-pill">
                      Best score: {lessonProgress.bestScore || 0}%
                    </span>
                  )}
                </div>

                <div className="signs-preview">
                  <div className="signs-preview-header">
                    <h4 className="signs-preview-title">Signs preview</h4>
                    <span className="signs-preview-count">
                      {lesson.signs?.length || 0} total
                    </span>
                  </div>

                  {signPreview.length === 0 ? (
                    <div className="empty-state" style={{ margin: 0 }}>
                      No sign content added yet.
                    </div>
                  ) : (
                    <div className="signs-grid">
                      {signPreview.map((sign) => (
                        <div key={sign.id} className="sign-card">
                          {sign.imageUrl ? (
                            <img
                              src={sign.imageUrl}
                              alt={sign.word}
                              className="sign-image"
                            />
                          ) : (
                            <div className="sign-image-placeholder">No image</div>
                          )}

                          <strong className="sign-word">{sign.word}</strong>
                          <div className="sign-meaning">{sign.meaningUz}</div>
                          <div className="sign-description">
                            {sign.description || "No description provided."}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lesson-footer">
                  <div className="lesson-footer-message">
                    {lessonProgress?.completed
                      ? "Lesson completed. Quiz is unlocked."
                      : hasQuiz
                      ? "Complete the lesson first to unlock its quiz."
                      : "Open the lesson to start learning."}
                  </div>

                  <Link to={`/lessons/${lesson.id}`} className="open-lesson-btn">
                    Open Lesson
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Lessons;