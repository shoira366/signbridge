import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const QUESTION_TYPES = [
  {
    value: "sign_to_meaning_mcq",
    label: "Sign image → choose meaning",
  },
  {
    value: "word_to_sign_mcq",
    label: "Word → choose sign image",
  },
  {
    value: "camera_sign_match",
    label: "Word → show sign on camera",
  },
  {
    value: "sign_to_text",
    label: "Sign image → type the meaning",
  },
  {
    value: "match_pairs",
    label: "Match pairs",
  },
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
      const res = await api.get(`quizzes/lessons/${id}`);
      const quizData = res.data || [];
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
    setQuizForm({
      title: quiz.title || "",
    });
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
        nextForm.matchPairs =
            question.optionsJson.length > 0
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

    setSignForm((prev) => ({
      ...prev,
      image: file,
    }));

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
      formData.append("order", signForm.order || "");

      if (signForm.image) {
        formData.append("image", signForm.image);
      }

      if (editingSign) {
        await api.put(`/signs/${editingSign.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.post(`/lessons/${id}/signs`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
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
    const confirmed = window.confirm("Delete this sign?");
    if (!confirmed) return;

    try {
      await api.delete(`/signs/${signId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchLesson();
    } catch (error) {
      console.error(error);
      alert("Failed to delete sign");
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

      let res;
      if (editingQuiz) {
        res = await api.put(
          `/quizzes/${editingQuiz.id}`,
          { title: quizForm.title.trim() },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        res = await api.post(
          `/lessons/${id}/quizzes`,
          { title: quizForm.title.trim() },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      resetQuizModal();
      await fetchQuizzes();
      setSelectedQuizId(res.data.id);
    } catch (error) {
      console.error(error);
      alert(editingQuiz ? "Failed to update quiz" : "Failed to create quiz");
    } finally {
      setLoadingQuizAction(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    const confirmed = window.confirm("Delete this quiz and all its questions?");
    if (!confirmed) return;

    try {
      await api.delete(`/quizzes/${quizId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchQuizzes();
    } catch (error) {
      console.error(error);
      alert("Failed to delete quiz");
    }
  };

const handleQuestionTypeChange = (value) => {
  setQuestionForm({
    type: value,
    prompt:
      value === "match_pairs"
        ? "Match given signs with its meaning"
        : "",
    signId: "",
    correctAnswer: "",
    optionsText: ["", "", "", ""],
    imageOptionSignIds: ["", "", "", ""],
    matchPairs: [
      { leftSignId: "", right: "" },
      { leftSignId: "", right: "" },
    ],
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
      correctAnswer: questionForm.correctAnswer
        ? String(questionForm.correctAnswer).trim()
        : null,
      optionsJson: null,
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
        const sign = lesson.signs.find((s) => s.id === Number(signIdValue));
        return sign
          ? {
              signId: sign.id,
              word: sign.word,
              imageUrl: sign.imageUrl,
            }
          : null;
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
        await api.put(`/questions/${editingQuestion.id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await api.post(`/quizzes/${selectedQuizId}/questions`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
    const confirmed = window.confirm("Delete this question?");
    if (!confirmed) return;

    try {
      await api.delete(`quizzes/questions/${questionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchQuizzes();
    } catch (error) {
      console.error(error);
      alert("Failed to delete question");
    }
  };

const handleMatchPairChange = (index, field, value) => {
  const nextPairs = [...questionForm.matchPairs];
  nextPairs[index] = {
    ...nextPairs[index],
    [field]: value,
  };

  setQuestionForm((prev) => ({
    ...prev,
    matchPairs: nextPairs,
  }));
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

  if (!lesson) {
    return <div className="page-container">Loading lesson content...</div>;
  }

  return (
    <div className="page-container">
      <div className="actions-row" style={{ marginBottom: "16px" }}>
        <Link to="/admin/lessons" className="btn btn-secondary">
          Back to Lessons
        </Link>
      </div>

      <div className="page-header-row">
        <div>
          <h1 className="page-title">Manage Lesson Content</h1>
          <p className="page-subtitle">
            Organize lesson signs and quizzes from one structured page.
          </p>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: "24px" }}>
        <div className="card">
          <h3 className="section-title">Lesson</h3>
          <p style={{ margin: 0, fontWeight: 700 }}>{lesson.title}</p>
          <p style={{ color: "#64748b", marginTop: "6px" }}>
            {lesson.description || "No lesson description"}
          </p>
        </div>

        <div className="card">
          <h3 className="section-title">Signs</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            {lesson.signs?.length || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="section-title">Quizzes</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            {quizzes.length}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="toolbar">
          <div className="toolbar-left">
            <h2 className="section-title" style={{ margin: 0 }}>
              Signs
            </h2>
            <span className="badge">{lesson.signs?.length || 0} items</span>
          </div>

          <div className="toolbar-right">
            <button className="btn btn-primary" onClick={openCreateSignModal}>
              + Add Sign
            </button>
          </div>
        </div>

        {lesson.signs?.length === 0 ? (
          <div className="empty-state">No signs added yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Word</th>
                  <th>Meaning (Uz)</th>
                  <th>Description</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lesson.signs.map((sign) => (
                  <tr key={sign.id}>
                    <td style={{ width: "120px" }}>
                      {sign.imageUrl ? (
                        <img
                          src={sign.imageUrl}
                          alt={sign.word}
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "12px",
                            background: "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#64748b",
                            fontSize: "12px",
                            textAlign: "center",
                            padding: "8px",
                          }}
                        >
                          No image
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontWeight: 700 }}>{sign.word}</div>
                    </td>

                    <td>{sign.meaningUz}</td>
                    <td>{sign.description || "—"}</td>
                    <td>{sign.order ?? "—"}</td>

                    <td>
                      <div className="actions-row">
                        <button
                          className="btn btn-secondary"
                          onClick={() => openEditSignModal(sign)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteSign(sign.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="toolbar">
            <div className="toolbar-left">
              <h2 className="section-title" style={{ margin: 0 }}>
                Quizzes
              </h2>
              <span className="badge">{quizzes.length} items</span>
            </div>

            <div className="toolbar-right">
              <button className="btn btn-primary" onClick={openCreateQuizModal}>
                + Add Quiz
              </button>
            </div>
          </div>

          {quizzes.length === 0 ? (
            <div className="empty-state">No quizzes added yet.</div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  onClick={() => setSelectedQuizId(quiz.id)}
                  style={{
                    border:
                      selectedQuizId === quiz.id
                        ? "2px solid #2563eb"
                        : "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "14px",
                    background: "#f8fafc",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="actions-row"
                    style={{ justifyContent: "space-between" }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{quiz.title}</div>
                      <div style={{ color: "#64748b", marginTop: "6px" }}>
                        {quiz.questions?.length || 0} questions
                      </div>
                    </div>

                    <div className="actions-row">
                      <button
                        className="btn btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditQuizModal(quiz);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuiz(quiz.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="toolbar">
            <div className="toolbar-left">
              <h2 className="section-title" style={{ margin: 0 }}>
                Quiz Questions
              </h2>
              <span className="badge">
                {currentQuiz?.questions?.length || 0} items
              </span>
            </div>

            <div className="toolbar-right">
              <button className="btn btn-primary" onClick={openCreateQuestionModal}>
                + Add Question
              </button>
            </div>
          </div>

          {!currentQuiz ? (
            <div className="empty-state">Select a quiz first.</div>
          ) : currentQuiz.questions?.length === 0 ? (
            <div className="empty-state">No questions in this quiz yet.</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Prompt</th>
                    <th>Linked Sign</th>
                    <th>Correct Answer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentQuiz.questions.map((q) => (
                    <tr key={q.id}>
                      <td>
                        <span className="badge">{q.type}</span>
                      </td>
                      <td>{q.prompt}</td>
                      <td>{q.sign?.word || "—"}</td>
                      <td>{q.correctAnswer || "—"}</td>
                      <td>
                        <div className="actions-row">
                          <button
                            className="btn btn-secondary"
                            onClick={() => openEditQuestionModal(q)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteQuestion(q.id)}
                          >
                            Delete
                          </button>
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

      {isSignModalOpen && (
        <div className="modal-overlay" onClick={resetSignModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="page-header-row" style={{ marginBottom: "16px" }}>
              <div>
                <h2 className="section-title" style={{ margin: 0 }}>
                  {editingSign ? "Edit Sign" : "Add Sign"}
                </h2>
                <p className="page-subtitle" style={{ margin: "8px 0 0" }}>
                  {editingSign
                    ? "Update the selected sign."
                    : "Create a new sign for this lesson."}
                </p>
              </div>

              <button className="btn btn-secondary" onClick={resetSignModal}>
                Close
              </button>
            </div>

            <form onSubmit={handleAddOrUpdateSign}>
              <div className="form-group">
                <label className="form-label">Word</label>
                <input
                  className="input"
                  placeholder="e.g. A"
                  value={signForm.word}
                  onChange={(e) =>
                    setSignForm({ ...signForm, word: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Meaning (Uzbek)</label>
                <input
                  className="input"
                  placeholder="e.g. A harfi"
                  value={signForm.meaningUz}
                  onChange={(e) =>
                    setSignForm({ ...signForm, meaningUz: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="textarea"
                  rows="4"
                  placeholder="Optional sign description"
                  value={signForm.description}
                  onChange={(e) =>
                    setSignForm({ ...signForm, description: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Order</label>
                <input
                  className="input"
                  type="number"
                  placeholder="e.g. 1"
                  value={signForm.order}
                  onChange={(e) =>
                    setSignForm({ ...signForm, order: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sign Image</label>
                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              {imagePreview && (
                <div style={{ marginBottom: "16px" }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "180px",
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                </div>
              )}

              <div className="actions-row">
                <button className="btn btn-primary" type="submit">
                  {editingSign ? "Update Sign" : "Save Sign"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetSignModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isQuizModalOpen && (
        <div className="modal-overlay" onClick={resetQuizModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="page-header-row" style={{ marginBottom: "16px" }}>
              <div>
                <h2 className="section-title" style={{ margin: 0 }}>
                  {editingQuiz ? "Edit Quiz" : "Add Quiz"}
                </h2>
                <p className="page-subtitle" style={{ margin: "8px 0 0" }}>
                  {editingQuiz
                    ? "Update the selected quiz."
                    : "Create a quiz container for this lesson."}
                </p>
              </div>

              <button className="btn btn-secondary" onClick={resetQuizModal}>
                Close
              </button>
            </div>

            <form onSubmit={handleAddOrUpdateQuiz}>
              <div className="form-group">
                <label className="form-label">Quiz Title</label>
                <input
                  className="input"
                  placeholder="e.g. A–E Practice Quiz"
                  value={quizForm.title}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, title: e.target.value })
                  }
                />
              </div>

              <div className="actions-row">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={loadingQuizAction}
                >
                  {loadingQuizAction
                    ? "Saving..."
                    : editingQuiz
                    ? "Update Quiz"
                    : "Save Quiz"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetQuizModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isQuestionModalOpen && (
        <div className="modal-overlay" onClick={resetQuestionModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="page-header-row" style={{ marginBottom: "16px" }}>
              <div>
                <h2 className="section-title" style={{ margin: 0 }}>
                  {editingQuestion ? "Edit Quiz Question" : "Add Quiz Question"}
                </h2>
                <p className="page-subtitle" style={{ margin: "8px 0 0" }}>
                  {editingQuestion
                    ? "Update the selected quiz question."
                    : "Create a typed quiz question inside the selected quiz."}
                </p>
              </div>

              <button className="btn btn-secondary" onClick={resetQuestionModal}>
                Close
              </button>
            </div>

            <form onSubmit={handleAddOrUpdateQuestion}>
              <div className="form-group">
                <label className="form-label">Question Type</label>
                <select
                  className="select"
                  value={questionForm.type}
                  onChange={(e) => handleQuestionTypeChange(e.target.value)}
                >
                  {QUESTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Prompt</label>
                <input
                  className="input"
                  placeholder="Enter question prompt"
                  value={questionForm.prompt}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, prompt: e.target.value })
                  }
                />
              </div>

              {["sign_to_meaning_mcq", "camera_sign_match", "sign_to_text"].includes(
                questionForm.type
              ) && (
                <div className="form-group">
                  <label className="form-label">Linked Sign</label>
                  <select
                    className="select"
                    value={questionForm.signId}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, signId: e.target.value })
                    }
                  >
                    <option value="">Select sign</option>
                    {lesson.signs?.map((sign) => (
                      <option key={sign.id} value={sign.id}>
                        {sign.word}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {questionForm.type === "sign_to_meaning_mcq" && (
                <>
                  {[0, 1, 2, 3].map((idx) => (
                    <div className="form-group" key={idx}>
                      <label className="form-label">Option {idx + 1}</label>
                      <input
                        className="input"
                        value={questionForm.optionsText[idx]}
                        onChange={(e) =>
                          handleTextOptionChange(idx, e.target.value)
                        }
                      />
                    </div>
                  ))}

                  <div className="form-group">
                    <label className="form-label">Correct Answer</label>
                    <input
                      className="input"
                      placeholder="Exact correct meaning"
                      value={questionForm.correctAnswer}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          correctAnswer: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}

              {questionForm.type === "word_to_sign_mcq" && (
                <>
                  {[0, 1, 2, 3].map((idx) => (
                    <div className="form-group" key={idx}>
                      <label className="form-label">Image Option {idx + 1}</label>
                      <select
                        className="select"
                        value={questionForm.imageOptionSignIds[idx]}
                        onChange={(e) =>
                          handleImageOptionChange(idx, e.target.value)
                        }
                      >
                        <option value="">Select sign</option>
                        {lesson.signs?.map((sign) => (
                          <option key={sign.id} value={sign.id}>
                            {sign.word}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}

                  <div className="form-group">
                    <label className="form-label">Correct Answer</label>
                    <input
                      className="input"
                      placeholder="Correct sign id"
                      value={questionForm.correctAnswer}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          correctAnswer: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}

              {questionForm.type === "sign_to_text" && (
                <div className="form-group">
                  <label className="form-label">Correct Text Answer</label>
                  <input
                    className="input"
                    placeholder="Type the correct answer"
                    value={questionForm.correctAnswer}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        correctAnswer: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              {questionForm.type === "camera_sign_match" && (
                <div className="form-group">
                  <label className="form-label">Expected Sign</label>
                  <p style={{ color: "#64748b", marginTop: 0 }}>
                    The selected linked sign will be used as the expected answer.
                  </p>
                </div>
              )}

              {questionForm.type === "match_pairs" && (
                <div
                    style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "16px",
                    background: "#f8fafc",
                    }}
                >
                    <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "14px",
                        gap: "12px",
                        flexWrap: "wrap",
                    }}
                    >
                    <div>
                        <label className="form-label" style={{ marginBottom: "4px", display: "block" }}>
                        Match Pairs
                        </label>
                        <p style={{ margin: 0, color: "#64748b" }}>
                        Match given signs with their meanings.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={addMatchPairRow}
                    >
                        + Add Pair
                    </button>
                    </div>

                    <div style={{ display: "grid", gap: "12px" }}>
                    {questionForm.matchPairs.map((pair, index) => {
                        const selectedSign = lesson.signs?.find(
                        (s) => s.id === Number(pair.leftSignId)
                        );

                        return (
                        <div
                            key={index}
                            style={{
                            display: "grid",
                            gridTemplateColumns: "220px 1fr auto",
                            gap: "12px",
                            alignItems: "end",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            padding: "12px",
                            background: "#fff",
                            }}
                        >
                            <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Sign {index + 1}</label>
                            <select
                                className="select"
                                value={pair.leftSignId}
                                onChange={(e) =>
                                handleMatchPairChange(index, "leftSignId", e.target.value)
                                }
                            >
                                <option value="">Select sign</option>
                                {lesson.signs?.map((sign) => (
                                <option key={sign.id} value={sign.id}>
                                    {sign.word}
                                </option>
                                ))}
                            </select>

                            <div style={{ marginTop: "10px" }}>
                                {selectedSign?.imageUrl ? (
                                <img
                                    src={selectedSign.imageUrl}
                                    alt={selectedSign.word}
                                    style={{
                                    width: "100%",
                                    height: "160px",
                                    objectFit: "cover",
                                    borderRadius: "12px",
                                    border: "1px solid #e2e8f0",
                                    }}
                                />
                                ) : (
                                <div
                                    style={{
                                    width: "100%",
                                    height: "160px",
                                    borderRadius: "12px",
                                    background: "#f1f5f9",
                                    border: "1px dashed #cbd5e1",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#64748b",
                                    fontSize: "14px",
                                    textAlign: "center",
                                    padding: "12px",
                                    }}
                                >
                                    No sign selected
                                </div>
                                )}
                            </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Meaning {index + 1}</label>
                            <input
                                className="input"
                                placeholder="e.g. Apple"
                                value={pair.right}
                                onChange={(e) =>
                                handleMatchPairChange(index, "right", e.target.value)
                                }
                            />
                            </div>

                            <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => removeMatchPairRow(index)}
                            disabled={questionForm.matchPairs.length <= 2}
                            style={{
                                opacity: questionForm.matchPairs.length <= 2 ? 0.6 : 1,
                                cursor:
                                questionForm.matchPairs.length <= 2
                                    ? "not-allowed"
                                    : "pointer",
                            }}
                            >
                            Remove
                            </button>
                        </div>
                        );
                    })}
                    </div>
                </div>
                )}

              <div className="actions-row">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={loadingQuizAction}
                >
                  {loadingQuizAction
                    ? "Saving..."
                    : editingQuestion
                    ? "Update Question"
                    : "Save Question"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetQuestionModal}
                >
                  Cancel
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