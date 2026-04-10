import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Lessons = () => {
  const { token, role } = useAuth();

  const [lessons, setLessons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [progress, setProgress] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchLessons();

    if (token && role !== "admin") {
      fetchProgress();
    }
  }, [token, role]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await api.get("/lessons");
      setLessons(res.data);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await api.get("/progress/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProgress(res.data);
    } catch (error) {
      console.error("Failed to fetch progress:", error);
    }
  };

  const getLessonProgress = (lessonId) => {
    return progress.find((item) => item.lessonId === lessonId);
  };

  const getQuestionCount = (lesson) => {
    if (!lesson?.quizzes?.length) return 0;
    return lesson.quizzes.reduce((sum, quiz) => {
      return sum + (quiz.questions?.length || 0);
    }, 0);
  };

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const q = search.toLowerCase().trim();

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
    if (progress.length === 0) return 0;
    const total = progress.reduce((sum, item) => sum + (item.score || 0), 0);
    return Math.round(total / progress.length);
  }, [progress]);

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <span className="badge">Learning Library</span>
          <h1 className="page-title" style={{ marginTop: "14px" }}>
            Explore Lessons
          </h1>
          <p className="page-subtitle">
            Discover Uzbek Sign Language lessons by topic, preview real lesson
            signs, and continue your progress step by step.
          </p>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: "24px" }}>
        <div className="card">
          <h3 className="section-title">Total Lessons</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            {lessons.length}
          </p>
        </div>

        <div className="card">
          <h3 className="section-title">Completed</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            {token && role !== "admin" ? completedCount : 0}
          </p>
        </div>

        <div className="card">
          <h3 className="section-title">Average Score</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            {token && role !== "admin" ? `${averageScore}%` : "—"}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="toolbar">
          <div className="toolbar-left">
            <h2 className="section-title" style={{ margin: 0 }}>
              Find a lesson
            </h2>
          </div>

          <div className="toolbar-right">
            <input
              className="input"
              type="text"
              placeholder="Search lessons, topics, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "280px" }}
            />

            <select
              className="select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: "220px" }}
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
        <div style={{ display: "grid", gap: "24px" }}>
          {filteredLessons.map((lesson) => {
            const lessonProgress = getLessonProgress(lesson.id);
            const signPreview = (lesson.signs || [])
              .slice()
              .sort((a, b) => {
                const ao = a.order ?? 999999;
                const bo = b.order ?? 999999;
                return ao - bo;
              })
              .slice(0, 4);

            const questionCount = getQuestionCount(lesson);

            return (
              <div key={lesson.id} className="card card-hover">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    <span className="badge">{lesson.difficulty || "lesson"}</span>
                    <h3 style={{ marginTop: "14px", marginBottom: "10px" }}>
                      {lesson.title}
                    </h3>
                  </div>

                  {lessonProgress && (
                    <span className="badge">
                      {lessonProgress.completed ? "Completed" : "In Progress"}
                    </span>
                  )}
                </div>

                <p className="page-subtitle" style={{ marginBottom: "16px" }}>
                  {lesson.description || "No lesson description"}
                </p>

                <div className="lesson-meta" style={{ marginBottom: "18px" }}>
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
                      Score: {lessonProgress.score}%
                    </span>
                  )}
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    marginBottom: "20px",
                    padding: "18px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "18px",
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
                      marginBottom: "14px",
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>
                      Signs in this lesson
                    </h4>
                    <span className="badge">{lesson.signs?.length || 0} total</span>
                  </div>

                  {signPreview.length === 0 ? (
                    <div className="empty-state" style={{ margin: 0 }}>
                      No sign content added yet.
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: "16px",
                      }}
                    >
                      {signPreview.map((sign) => (
                        <div
                          key={sign.id}
                          style={{
                            background: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "16px",
                            padding: "14px",
                            minHeight: "100%",
                          }}
                        >
                          {sign.imageUrl ? (
                            <img
                              src={sign.imageUrl}
                              alt={sign.word}
                              style={{
                                width: "100%",
                                height: "190px",
                                objectFit: "cover",
                                borderRadius: "12px",
                                marginBottom: "12px",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "100%",
                                height: "190px",
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
                            {sign.order != null && (
                              <span className="badge">#{sign.order}</span>
                            )}
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

                <div
                  style={{
                    padding: "18px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "18px",
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginBottom: "10px",
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>
                      Practice questions
                    </h4>
                    <span className="badge">{questionCount} available</span>
                  </div>

                  <div style={{ color: "#64748b", lineHeight: 1.6 }}>
                    {questionCount > 0
                      ? "This lesson includes structured quiz and practice activities to help you check recognition and understanding."
                      : "No practice questions have been added to this lesson yet."}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "18px",
                    paddingTop: "16px",
                    borderTop: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ color: "#64748b", fontSize: "0.95rem" }}>
                    {lessonProgress
                      ? lessonProgress.completed
                        ? "You have completed this lesson."
                        : "You started this lesson already."
                      : "Not started yet."}
                  </div>

                  <Link to={`/lessons/${lesson.id}`} className="btn btn-primary">
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