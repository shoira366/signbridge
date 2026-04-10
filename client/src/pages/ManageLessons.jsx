import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ManageLessons = () => {
  const { token } = useAuth();

  const [lessons, setLessons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    categoryId: "",
    title: "",
    description: "",
    difficulty: "beginner",
    videoUrl: "",
  });

  useEffect(() => {
    fetchLessons();
    fetchCategories();
  }, []);

  const fetchLessons = async () => {
    try {
      const res = await api.get("/lessons");
      setLessons(res.data);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      categoryId: "",
      title: "",
      description: "",
      difficulty: "beginner",
      videoUrl: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (lesson) => {
    setEditingId(lesson.id);
    setForm({
      categoryId: String(lesson.categoryId || ""),
      title: lesson.title || "",
      description: lesson.description || "",
      difficulty: lesson.difficulty || "beginner",
      videoUrl: lesson.videoUrl || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({
      categoryId: "",
      title: "",
      description: "",
      difficulty: "beginner",
      videoUrl: "",
    });
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();

    if (!form.categoryId || !form.title.trim()) {
      alert("Category and lesson title are required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        categoryId: Number(form.categoryId),
        title: form.title.trim(),
        description: form.description.trim(),
        difficulty: form.difficulty,
        videoUrl: form.videoUrl.trim(),
      };

      if (editingId) {
        await api.put(`/lessons/${editingId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await api.post("/lessons", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      closeModal();
      fetchLessons();
    } catch (error) {
      console.error(error);
      alert(editingId ? "Failed to update lesson" : "Failed to create lesson");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (id, title) => {
    const confirmed = window.confirm(`Delete lesson "${title}"?`);
    if (!confirmed) return;

    try {
      await api.delete(`/lessons/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchLessons();
    } catch (error) {
      console.error(error);
      alert("Failed to delete lesson");
    }
  };

  const beginnerCount = lessons.filter(
    (lesson) => lesson.difficulty === "beginner"
  ).length;

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesCategory = selectedCategoryFilter
        ? String(lesson.categoryId) === String(selectedCategoryFilter)
        : true;

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        lesson.title.toLowerCase().includes(q) ||
        (lesson.description || "").toLowerCase().includes(q) ||
        (lesson.category?.name || "").toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [lessons, selectedCategoryFilter, search]);

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Lesson Management</h1>
          <p className="page-subtitle">
            Manage lesson records from one clean admin panel. Create lessons in a modal and handle nested content on a separate page.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal}>
          + Create Lesson
        </button>
      </div>

      <div className="grid grid-3" style={{ marginBottom: "24px" }}>
        <div className="card">
          <h3 className="section-title">Total Lessons</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            {lessons.length}
          </p>
        </div>

        <div className="card">
          <h3 className="section-title">Beginner Lessons</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            {beginnerCount}
          </p>
        </div>

        <div className="card">
          <h3 className="section-title">Available Categories</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            {categories.length}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="toolbar-left">
            <h2 className="section-title" style={{ margin: 0 }}>
              Existing Lessons
            </h2>
            <span className="badge">{filteredLessons.length} shown</span>
          </div>

          <div className="toolbar-right">
            <input
              className="input"
              style={{ width: "260px" }}
              type="text"
              placeholder="Search lessons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="select"
              style={{ width: "220px" }}
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredLessons.length === 0 ? (
          <div className="empty-state">No lessons found.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Signs</th>
                  <th>Quiz</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{lesson.title}</div>
                      <div style={{ color: "#64748b", marginTop: "4px" }}>
                        {lesson.description || "No description"}
                      </div>
                    </td>
                    <td>{lesson.category?.name || "Unknown"}</td>
                    <td>
                      <span className="badge">{lesson.difficulty}</span>
                    </td>
                    <td>{lesson.signs?.length || 0}</td>
                    <td>{lesson.quizzes?.length || 0}</td>
                    <td>
                      <div className="actions-row">
                        <button
                          className="btn btn-secondary"
                          onClick={() => openEditModal(lesson)}
                        >
                          Edit
                        </button>

                        <Link
                          to={`/admin/lessons/${lesson.id}/content`}
                          className="btn btn-secondary"
                        >
                          Manage Content
                        </Link>

                        <button
                          className="btn btn-danger"
                          onClick={() =>
                            handleDeleteLesson(lesson.id, lesson.title)
                          }
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

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="page-header-row" style={{ marginBottom: "16px" }}>
              <div>
                <h2 className="section-title" style={{ margin: 0 }}>
                  {editingId ? "Edit Lesson" : "Create Lesson"}
                </h2>
                <p className="page-subtitle" style={{ margin: "8px 0 0" }}>
                  Fill in the lesson details below.
                </p>
              </div>

              <button className="btn btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>

            <form onSubmit={handleLessonSubmit}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="select"
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Lesson Title</label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. Basic Greetings"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="textarea"
                  rows="5"
                  placeholder="Write a short lesson description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="select"
                    value={form.difficulty}
                    onChange={(e) =>
                      setForm({ ...form, difficulty: e.target.value })
                    }
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Video URL</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Optional video link"
                    value={form.videoUrl}
                    onChange={(e) =>
                      setForm({ ...form, videoUrl: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="actions-row">
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading
                    ? editingId
                      ? "Updating..."
                      : "Creating..."
                    : editingId
                    ? "Update Lesson"
                    : "Create Lesson"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
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

export default ManageLessons;