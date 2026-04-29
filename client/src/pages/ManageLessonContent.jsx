import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  adminGetQuizzesByLesson, 
  adminCreateQuiz, 
  adminUpdateQuiz, 
  adminDeleteQuiz,
  adminCreateQuizQuestion,
  adminUpdateQuizQuestion,
  adminDeleteQuizQuestion
} from "../api/quiz";
import "../styles/Admin.css";

const QUESTION_TYPES = [
  { value: "sign_to_meaning_mcq", label: "Sign image → choose meaning", icon: "🖼️", description: "Show a sign image, user picks the correct meaning" },
  { value: "word_to_sign_mcq", label: "Word → choose sign image", icon: "📝", description: "Show a word, user picks the correct sign image" },
  { value: "camera_sign_match", label: "Word → show sign on camera", icon: "📷", description: "User shows the sign to camera" },
  { value: "sign_to_text", label: "Sign image → type the meaning", icon: "⌨️", description: "User types the meaning of the sign" },
  { value: "match_pairs", label: "Match pairs", icon: "🔗", description: "Match signs with their meanings" },
];

const emptySignForm = {
  word: "",
  meaningUz: "",
  description: "",
  order: "",
  image: null,
};

const emptyQuizForm = {
  title: "",
};

const emptyQuestionForm = {
  type: "sign_to_meaning_mcq",
  prompt: "",
  signId: "",
  correctAnswer: "",
  optionsText: ["", "", "", ""],
  imageOptionSignIds: ["", "", "", ""],
  matchPairs: [
    { leftSignId: "", right: "" },
    { leftSignId: "", right: "" },
  ],
  isPremium: false,
  points: 1,
};

const ManageLessonContent = () => {
  const { id } = useParams();
  const { token } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  const [loadingQuizAction, setLoadingQuizAction] = useState(false);

  const [editingSign, setEditingSign] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [signForm, setSignForm] = useState(emptySignForm);
  const [imagePreview, setImagePreview] = useState("");

  const [quizForm, setQuizForm] = useState(emptyQuizForm);
  const [questionForm, setQuestionForm] = useState(emptyQuestionForm);

  useEffect(() => {
    fetchLesson();
    fetchQuizzes();
  }, [id]);

  const fetchLesson = async () => {
    try {
      const res = await api.get(`/lessons/${id}`);
      setLesson(res.data);
    } catch (error) {
      console.error("Failed to fetch lesson:", error);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const res = await adminGetQuizzesByLesson(id);
      const quizData = res || [];
      setQuizzes(quizData);

      setSelectedQuizId((prev) => {
        if (prev && quizData.some((q) => q.id === prev)) return prev;
        return quizData.length ? quizData[0].id : null;
      });
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
    }
  };

  const currentQuiz = useMemo(() => {
    return quizzes.find((q) => q.id === selectedQuizId) || null;
  }, [quizzes, selectedQuizId]);

  const resetSignModal = () => {
    setEditingSign(null);
    setSignForm(emptySignForm);
    setImagePreview("");
    setIsSignModalOpen(false);
  };

  const openCreateSignModal = () => {
    setEditingSign(null);
    setSignForm(emptySignForm);
    setImagePreview("");
    setIsSignModalOpen(true);
  };

  const openEditSignModal = (sign) => {
    setEditingSign(sign);
    setSignForm({
      word: sign.word || "",
      meaningUz: sign.meaningUz || "",
      description: sign.description || "",
      order: sign.order ?? "",
      image: null,
    });
    setImagePreview(sign.imageUrl || "");
    setIsSignModalOpen(true);
  };

  const resetQuizModal = () => {
    setEditingQuiz(null);
    setQuizForm(emptyQuizForm);
    setIsQuizModalOpen(false);
  };

  const openCreateQuizModal = () => {
    setEditingQuiz(null);
    setQuizForm(emptyQuizForm);
    setIsQuizModalOpen(true);
  };

  const openEditQuizModal = (quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({ title: quiz.title || "" });
    setIsQuizModalOpen(true);
  };

  const resetQuestionModal = () => {
    setEditingQuestion(null);
    setQuestionForm(emptyQuestionForm);
    setIsQuestionModalOpen(false);
  };

  const openCreateQuestionModal = () => {
    if (!selectedQuizId) {
      alert("Create or select a quiz first");
      return;
    }
    setEditingQuestion(null);
    setQuestionForm(emptyQuestionForm);
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (question) => {
    const nextForm = {
      type: question.type || "sign_to_meaning_mcq",
      prompt: question.prompt || "",
      signId: question.signId ? String(question.signId) : "",
      correctAnswer: question.correctAnswer || "",
      optionsText: ["", "", "", ""],
      imageOptionSignIds: ["", "", "", ""],
      matchPairs: [
        { leftSignId: "", right: "" },
        { leftSignId: "", right: "" },
      ],
      isPremium: question.isPremium || false,
      points: question.points || 1,
    };

    if (question.type === "sign_to_meaning_mcq" && Array.isArray(question.optionsJson)) {
      nextForm.optionsText = [
        question.optionsJson[0] || "",
        question.optionsJson[1] || "",
        question.optionsJson[2] || "",
        question.optionsJson[3] || "",
      ];
    }

    if (question.type === "word_to_sign_mcq" && Array.isArray(question.optionsJson)) {
      nextForm.imageOptionSignIds = [
        question.optionsJson[0]?.signId ? String(question.optionsJson[0].signId) : "",
        question.optionsJson[1]?.signId ? String(question.optionsJson[1].signId) : "",
        question.optionsJson[2]?.signId ? String(question.optionsJson[2].signId) : "",
        question.optionsJson[3]?.signId ? String(question.optionsJson[3].signId) : "",
      ];
    }

    if (question.type === "match_pairs" && Array.isArray(question.optionsJson)) {
      nextForm.matchPairs = question.optionsJson.length > 0
        ? question.optionsJson.map((pair) => ({
            leftSignId: pair.leftSignId ? String(pair.leftSignId) : "",
            right: pair.right || "",
          }))
        : [
            { leftSignId: "", right: "" },
            { leftSignId: "", right: "" },
          ];
    }

    setEditingQuestion(question);
    setQuestionForm(nextForm);
    setIsQuestionModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSignForm((prev) => ({ ...prev, image: file }));
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(editingSign?.imageUrl || "");
    }
  };

  const handleAddOrUpdateSign = async (e) => {
    e.preventDefault();
    if (!signForm.word.trim() || !signForm.meaningUz.trim()) {
      alert("Both sign word and Uzbek meaning are required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("word", signForm.word.trim());
      formData.append("meaningUz", signForm.meaningUz.trim());
      formData.append("description", signForm.description.trim());
      if (signForm.order) formData.append("order", signForm.order);
      if (signForm.image) formData.append("image", signForm.image);

      if (editingSign) {
        await api.put(`/signs/${editingSign.id}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post(`/lessons/${id}/signs`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
      }
      resetSignModal();
      fetchLesson();
    } catch (error) {
      console.error(error);
      alert(editingSign ? "Failed to update sign" : "Failed to add sign");
    }
  };

  const handleDeleteSign = async (signId) => {
    if (window.confirm("Delete this sign?")) {
      try {
        await api.delete(`/signs/${signId}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchLesson();
      } catch (error) {
        console.error(error);
        alert("Failed to delete sign");
      }
    }
  };

  const handleAddOrUpdateQuiz = async (e) => {
    e.preventDefault();
    if (!quizForm.title.trim()) {
      alert("Quiz title is required");
      return;
    }

    try {
      setLoadingQuizAction(true);
      if (editingQuiz) {
        await adminUpdateQuiz(editingQuiz.id, { title: quizForm.title.trim() });
      } else {
        await adminCreateQuiz(id, { title: quizForm.title.trim() });
      }
      resetQuizModal();
      await fetchQuizzes();
    } catch (error) {
      console.error(error);
      alert(editingQuiz ? "Failed to update quiz" : "Failed to create quiz");
    } finally {
      setLoadingQuizAction(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Delete this quiz and all its questions?")) {
      try {
        await adminDeleteQuiz(quizId);
        await fetchQuizzes();
      } catch (error) {
        console.error(error);
        alert("Failed to delete quiz");
      }
    }
  };

  const handleQuestionTypeChange = (value) => {
    setQuestionForm({
      ...emptyQuestionForm,
      type: value,
      prompt: value === "match_pairs" ? "Match given signs with its meaning" : "",
      points: 1,
    });
  };

  const handleTextOptionChange = (index, value) => {
    const next = [...questionForm.optionsText];
    next[index] = value;
    setQuestionForm((prev) => ({ ...prev, optionsText: next }));
  };

  const handleImageOptionChange = (index, value) => {
    const next = [...questionForm.imageOptionSignIds];
    next[index] = value;
    setQuestionForm((prev) => ({ ...prev, imageOptionSignIds: next }));
  };

  const handleMatchPairChange = (index, field, value) => {
    const nextPairs = [...questionForm.matchPairs];
    nextPairs[index] = { ...nextPairs[index], [field]: value };
    setQuestionForm((prev) => ({ ...prev, matchPairs: nextPairs }));
  };

  const addMatchPairRow = () => {
    setQuestionForm((prev) => ({
      ...prev,
      matchPairs: [...prev.matchPairs, { leftSignId: "", right: "" }],
    }));
  };

  const removeMatchPairRow = (index) => {
    setQuestionForm((prev) => {
      if (prev.matchPairs.length <= 2) return prev;
      return {
        ...prev,
        matchPairs: prev.matchPairs.filter((_, i) => i !== index),
      };
    });
  };

  const handleAddOrUpdateQuestion = async (e) => {
    e.preventDefault();

    if (!selectedQuizId) {
      alert("Select a quiz first");
      return;
    }

    if (!questionForm.prompt.trim()) {
      alert("Prompt is required");
      return;
    }

    let payload = {
      type: questionForm.type,
      prompt: questionForm.prompt.trim(),
      signId: questionForm.signId ? Number(questionForm.signId) : null,
      correctAnswer: questionForm.correctAnswer ? String(questionForm.correctAnswer).trim() : null,
      optionsJson: null,
      points: questionForm.points || 1,
      isPremium: questionForm.isPremium || false,
    };

    if (questionForm.type === "sign_to_meaning_mcq") {
      const cleanOptions = questionForm.optionsText.map((item) => item.trim());
      if (cleanOptions.some((item) => !item)) {
        alert("All 4 text options are required");
        return;
      }
      if (!payload.signId) {
        alert("Select a linked sign");
        return;
      }
      if (!payload.correctAnswer) {
        alert("Correct answer is required");
        return;
      }
      payload.optionsJson = cleanOptions;
    }

    if (questionForm.type === "word_to_sign_mcq") {
      const optionIds = questionForm.imageOptionSignIds.filter(Boolean);
      if (optionIds.length !== 4) {
        alert("Choose 4 sign image options");
        return;
      }
      const mappedOptions = optionIds.map((signIdValue) => {
        const sign = lesson.signs?.find((s) => s.id === Number(signIdValue));
        return sign ? { signId: sign.id, word: sign.word, imageUrl: sign.imageUrl } : null;
      });
      if (mappedOptions.some((item) => !item)) {
        alert("Some selected sign options are invalid");
        return;
      }
      if (!payload.correctAnswer) {
        alert("Correct answer is required");
        return;
      }
      payload.optionsJson = mappedOptions;
    }

    if (questionForm.type === "camera_sign_match") {
      if (!payload.signId) {
        alert("Select the expected sign");
        return;
      }
    }

    if (questionForm.type === "sign_to_text") {
      if (!payload.signId) {
        alert("Select a linked sign");
        return;
      }
      if (!payload.correctAnswer) {
        alert("Correct text answer is required");
        return;
      }
    }

    if (questionForm.type === "match_pairs") {
      const cleanedPairs = questionForm.matchPairs
        .map((pair) => ({
          leftSignId: pair.leftSignId ? Number(pair.leftSignId) : null,
          right: pair.right.trim(),
        }))
        .filter((pair) => pair.leftSignId && pair.right);
      if (cleanedPairs.length < 2) {
        alert("Add at least 2 valid sign-meaning pairs");
        return;
      }
      payload.signId = null;
      payload.correctAnswer = null;
      payload.optionsJson = cleanedPairs;
    }

    try {
      setLoadingQuizAction(true);
      if (editingQuestion) {
        await adminUpdateQuizQuestion(editingQuestion.id, payload);
      } else {
        await adminCreateQuizQuestion(selectedQuizId, payload);
      }
      resetQuestionModal();
      await fetchQuizzes();
    } catch (error) {
      console.error(error);
      alert(editingQuestion ? "Failed to update question" : "Failed to create question");
    } finally {
      setLoadingQuizAction(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Delete this question?")) {
      try {
        await adminDeleteQuizQuestion(questionId);
        await fetchQuizzes();
      } catch (error) {
        console.error(error);
        alert("Failed to delete question");
      }
    }
  };

  if (!lesson) {
    return <div className="admin-page">Loading lesson content...</div>;
  }

  return (
    <div className="admin-page">
      {/* Back Button */}
      <div className="admin-back-nav">
        <Link to="/admin/lessons" className="admin-back-btn">
          ← Back
        </Link>
      </div>

      <div className="admin-header-section">
        <div>
          <h1 className="admin-page-title">Manage Lesson Content</h1>
          <p className="admin-page-subtitle">Organize lesson signs and quizzes</p>
        </div>
        <Link to="/admin/lessons" className="admin-btn-secondary">← Back to Lessons</Link>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📖</div>
          <div className="admin-stat-info">
            <h3>{lesson.title}</h3>
            <p>{lesson.category?.name || "No Category"}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">✋</div>
          <div className="admin-stat-info">
            <h3>{lesson.signs?.length || 0}</h3>
            <p>Total Signs</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📝</div>
          <div className="admin-stat-info">
            <h3>{quizzes.length}</h3>
            <p>Total Quizzes</p>
          </div>
        </div>
      </div>

      {/* Signs Section */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Signs in this Lesson</h3>
          <button className="admin-btn-primary" onClick={openCreateSignModal}>+ Add Sign</button>
        </div>
        {lesson.signs?.length === 0 ? (
          <div className="admin-empty">No signs added yet.</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "70px" }}>Image</th>
                  <th>Word</th>
                  <th>Meaning (Uz)</th>
                  <th style={{ width: "60px" }}>Order</th>
                  <th style={{ width: "100px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lesson.signs.map((sign) => (
                  <tr key={sign.id}>
                    <td style={{ textAlign: "center" }}>
                      {sign.imageUrl ? (
                        <img src={sign.imageUrl} alt={sign.word} className="admin-sign-image" />
                      ) : (
                        <div className="admin-sign-placeholder">No img</div>
                      )}
                    </td>
                    <td>
                      <strong>{sign.word}</strong>
                      {sign.description && (
                        <div className="admin-sign-desc">{sign.description.slice(0, 40)}...</div>
                      )}
                    </td>
                    <td>{sign.meaningUz}</td>
                    <td style={{ textAlign: "center" }}>{sign.order || "—"}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn-icon edit" onClick={() => openEditSignModal(sign)} title="Edit">✏️</button>
                        <button className="admin-btn-icon delete" onClick={() => handleDeleteSign(sign.id)} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quizzes and Questions Grid */}
      <div className="admin-two-columns">
        {/* Quizzes List */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Quizzes</h3>
            <button className="admin-btn-primary" onClick={openCreateQuizModal}>+ Add Quiz</button>
          </div>
          {quizzes.length === 0 ? (
            <div className="admin-empty">No quizzes added yet.</div>
          ) : (
            <div className="admin-quiz-list">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className={`admin-quiz-item ${selectedQuizId === quiz.id ? 'active' : ''}`}
                  onClick={() => setSelectedQuizId(quiz.id)}
                >
                  <div>
                    <strong>{quiz.title}</strong>
                    <div className="admin-quiz-stats">{quiz.questions?.length || 0} questions</div>
                  </div>
                  <div className="admin-actions">
                    <button className="admin-btn-icon edit" onClick={(e) => { e.stopPropagation(); openEditQuizModal(quiz); }}>✏️</button>
                    <button className="admin-btn-icon delete" onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz.id); }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Quiz Questions</h3>
            <button className="admin-btn-primary" onClick={openCreateQuestionModal}>+ Add Question</button>
          </div>
          {!currentQuiz ? (
            <div className="admin-empty">Select a quiz first.</div>
          ) : currentQuiz.questions?.length === 0 ? (
            <div className="admin-empty">No questions in this quiz yet.</div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "100px" }}>Type</th>
                    <th>Prompt</th>
                    <th style={{ width: "120px" }}>Linked Sign</th>
                    <th style={{ width: "80px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentQuiz.questions.map((q) => (
                    <tr key={q.id}>
                      <td>
                        <span className="admin-badge">
                          {q.type === "sign_to_meaning_mcq" && "🖼️ MCQ"}
                          {q.type === "word_to_sign_mcq" && "📝 Word→Sign"}
                          {q.type === "camera_sign_match" && "📷 Camera"}
                          {q.type === "sign_to_text" && "⌨️ Text"}
                          {q.type === "match_pairs" && "🔗 Match"}
                        </span>
                      </td>
                      <td style={{ fontSize: "13px" }}>
                        {q.prompt?.length > 50 ? q.prompt.slice(0, 50) + "..." : q.prompt}
                      </td>
                      <td>
                        {q.sign?.word ? (
                          <div className="admin-linked-sign">
                            {q.sign.imageUrl && (
                              <img src={q.sign.imageUrl} alt={q.sign.word} className="admin-linked-sign-image" />
                            )}
                            <span>{q.sign.word}</span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button className="admin-btn-icon edit" onClick={() => openEditQuestionModal(q)}>✏️</button>
                          <button className="admin-btn-icon delete" onClick={() => handleDeleteQuestion(q.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sign Modal */}
      {isSignModalOpen && (
        <div className="admin-modal-overlay" onClick={resetSignModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingSign ? "Edit Sign" : "Add New Sign"}</h2>
              <button className="admin-modal-close" onClick={resetSignModal}>×</button>
            </div>
            <form onSubmit={handleAddOrUpdateSign}>
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Word *</label>
                    <input type="text" value={signForm.word} onChange={(e) => setSignForm({ ...signForm, word: e.target.value })} required />
                  </div>
                  <div className="admin-form-group">
                    <label>Meaning (Uzbek) *</label>
                    <input type="text" value={signForm.meaningUz} onChange={(e) => setSignForm({ ...signForm, meaningUz: e.target.value })} required />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea rows="3" value={signForm.description} onChange={(e) => setSignForm({ ...signForm, description: e.target.value })} />
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Order</label>
                    <input type="number" value={signForm.order} onChange={(e) => setSignForm({ ...signForm, order: e.target.value })} />
                  </div>
                  <div className="admin-form-group">
                    <label>Image</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                  </div>
                </div>
                {imagePreview && <img src={imagePreview} alt="Preview" className="admin-image-preview" />}
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={resetSignModal}>Cancel</button>
                <button type="submit" className="admin-btn-primary">{editingSign ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {isQuizModalOpen && (
        <div className="admin-modal-overlay" onClick={resetQuizModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingQuiz ? "Edit Quiz" : "Create New Quiz"}</h2>
              <button className="admin-modal-close" onClick={resetQuizModal}>×</button>
            </div>
            <form onSubmit={handleAddOrUpdateQuiz}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Quiz Title *</label>
                  <input type="text" placeholder="e.g., Alphabet Practice" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} required />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={resetQuizModal}>Cancel</button>
                <button type="submit" className="admin-btn-primary" disabled={loadingQuizAction}>{editingQuiz ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {isQuestionModalOpen && (
        <div className="admin-modal-overlay" onClick={resetQuestionModal}>
          <div className="admin-modal admin-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h2>{editingQuestion ? "Edit Quiz Question" : "Create New Question"}</h2>
                <p className="admin-modal-subtitle">Configure the question details and options</p>
              </div>
              <button className="admin-modal-close" onClick={resetQuestionModal}>×</button>
            </div>
            <form onSubmit={handleAddOrUpdateQuestion}>
              <div className="admin-modal-body">
                {/* Question Type Selection */}
                <div className="admin-form-group">
                  <label className="admin-label">Question Type *</label>
                  <div className="admin-question-types">
                    {QUESTION_TYPES.map((type) => (
                      <div
                        key={type.value}
                        className={`admin-type-card ${questionForm.type === type.value ? 'active' : ''}`}
                        onClick={() => handleQuestionTypeChange(type.value)}
                      >
                        <div className="admin-type-icon">{type.icon}</div>
                        <div className="admin-type-info">
                          <div className="admin-type-name">{type.label}</div>
                          <div className="admin-type-desc">{type.description}</div>
                        </div>
                        {questionForm.type === type.value && <div className="admin-type-check">✓</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="admin-form-group">
                  <label className="admin-label">Question Prompt *</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g., What is the meaning of this sign?"
                    value={questionForm.prompt}
                    onChange={(e) => setQuestionForm({ ...questionForm, prompt: e.target.value })}
                    required
                  />
                </div>

                {/* Linked Sign */}
                {["sign_to_meaning_mcq", "camera_sign_match", "sign_to_text"].includes(questionForm.type) && (
                  <div className="admin-form-group">
                    <label className="admin-label">Linked Sign *</label>
                    <select
                      className="admin-select"
                      value={questionForm.signId}
                      onChange={(e) => setQuestionForm({ ...questionForm, signId: e.target.value })}
                      required
                    >
                      <option value="">Select a sign</option>
                      {lesson.signs?.map((sign) => (
                        <option key={sign.id} value={sign.id}>{sign.word} - {sign.meaningUz}</option>
                      ))}
                    </select>
                    {questionForm.signId && lesson.signs?.find(s => s.id === Number(questionForm.signId))?.imageUrl && (
                      <div className="admin-sign-preview">
                        <img src={lesson.signs.find(s => s.id === Number(questionForm.signId)).imageUrl} alt="Sign preview" />
                      </div>
                    )}
                  </div>
                )}

                {/* MCQ Text Options */}
                {questionForm.type === "sign_to_meaning_mcq" && (
                  <div className="admin-form-group">
                    <label className="admin-label">Answer Options *</label>
                    <div className="admin-options-grid">
                      {[0, 1, 2, 3].map((idx) => (
                        <div key={idx} className="admin-option-item">
                          <span className="admin-option-letter">{String.fromCharCode(65 + idx)}</span>
                          <input
                            type="text"
                            className="admin-input"
                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            value={questionForm.optionsText[idx]}
                            onChange={(e) => handleTextOptionChange(idx, e.target.value)}
                            required
                          />
                        </div>
                      ))}
                    </div>
                    <label className="admin-label" style={{ marginTop: "16px" }}>Correct Answer *</label>
                    <select
                      className="admin-select"
                      value={questionForm.correctAnswer}
                      onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                      required
                    >
                      <option value="">Select correct answer</option>
                      {questionForm.optionsText.map((opt, idx) => opt && (
                        <option key={idx} value={opt}>{String.fromCharCode(65 + idx)}. {opt}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Word to Sign Options */}
                {questionForm.type === "word_to_sign_mcq" && (
                  <div className="admin-form-group">
                    <label className="admin-label">Image Options *</label>
                    <div className="admin-options-grid">
                      {[0, 1, 2, 3].map((idx) => (
                        <div key={idx} className="admin-option-item">
                          <span className="admin-option-letter">{String.fromCharCode(65 + idx)}</span>
                          <select
                            className="admin-select"
                            value={questionForm.imageOptionSignIds[idx]}
                            onChange={(e) => handleImageOptionChange(idx, e.target.value)}
                            required
                          >
                            <option value="">Select sign</option>
                            {lesson.signs?.map((sign) => (
                              <option key={sign.id} value={sign.id}>{sign.word}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                    <label className="admin-label" style={{ marginTop: "16px" }}>Correct Answer *</label>
                    <select
                      className="admin-select"
                      value={questionForm.correctAnswer}
                      onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                      required
                    >
                      <option value="">Select correct answer</option>
                      {questionForm.imageOptionSignIds.map((signId, idx) => {
                        const sign = lesson.signs?.find(s => s.id === Number(signId));
                        return signId && sign ? (
                          <option key={idx} value={signId}>{String.fromCharCode(65 + idx)}. {sign.word}</option>
                        ) : null;
                      })}
                    </select>
                  </div>
                )}

                {/* Sign to Text */}
                {questionForm.type === "sign_to_text" && (
                  <div className="admin-form-group">
                    <label className="admin-label">Correct Answer (Text) *</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="e.g., Hello"
                      value={questionForm.correctAnswer}
                      onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                      required
                    />
                  </div>
                )}

                {/* Match Pairs */}
                {questionForm.type === "match_pairs" && (
                  <div className="admin-form-group">
                    <label className="admin-label">Match Pairs *</label>
                    <div className="admin-match-pairs">
                      {questionForm.matchPairs.map((pair, index) => {
                        const selectedSign = lesson.signs?.find(s => s.id === Number(pair.leftSignId));
                        return (
                          <div key={index} className="admin-pair-item">
                            <div className="admin-pair-left">
                              <label>Sign {index + 1}</label>
                              <select
                                className="admin-select"
                                value={pair.leftSignId}
                                onChange={(e) => handleMatchPairChange(index, "leftSignId", e.target.value)}
                              >
                                <option value="">Select sign</option>
                                {lesson.signs?.map((sign) => (
                                  <option key={sign.id} value={sign.id}>{sign.word}</option>
                                ))}
                              </select>
                              {selectedSign?.imageUrl && (
                                <img src={selectedSign.imageUrl} alt={selectedSign.word} className="admin-pair-image" />
                              )}
                            </div>
                            <div className="admin-pair-arrow">→</div>
                            <div className="admin-pair-right">
                              <label>Meaning {index + 1}</label>
                              <input
                                type="text"
                                className="admin-input"
                                placeholder="e.g., Hello"
                                value={pair.right}
                                onChange={(e) => handleMatchPairChange(index, "right", e.target.value)}
                              />
                            </div>
                            {questionForm.matchPairs.length > 2 && (
                              <button type="button" className="admin-pair-remove" onClick={() => removeMatchPairRow(index)}>×</button>
                            )}
                          </div>
                        );
                      })}
                      <button type="button" className="admin-add-pair" onClick={addMatchPairRow}>+ Add Pair</button>
                    </div>
                  </div>
                )}

                {/* Settings Row */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-label">Points</label>
                    <input
                      type="number"
                      className="admin-input"
                      min="1"
                      max="10"
                      value={questionForm.points}
                      onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-checkbox-label">
                      <input
                        type="checkbox"
                        checked={questionForm.isPremium}
                        onChange={(e) => setQuestionForm({ ...questionForm, isPremium: e.target.checked })}
                      />
                      <span>Premium Question (only for subscribers)</span>
                    </label>
                    <p className="admin-hint">Premium questions are only visible to users with active subscriptions</p>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={resetQuestionModal}>Cancel</button>
                <button type="submit" className="admin-btn-primary" disabled={loadingQuizAction}>
                  {loadingQuizAction ? "Saving..." : (editingQuestion ? "Update Question" : "Create Question")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLessonContent;