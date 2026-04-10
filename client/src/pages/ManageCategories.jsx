import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ManageCategories = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const totalLessons = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (cat.lessons?.length || 0), 0);
  }, [categories]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setForm({ name: "", description: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await api.put(
          `/categories/${editingId}`,
          {
            name: form.name.trim(),
            description: form.description.trim(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await api.post(
          "/categories",
          {
            name: form.name.trim(),
            description: form.description.trim(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      console.error(error);
      alert(editingId ? "Failed to update category" : "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name || "",
      description: category.description || "",
    });
  };

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Delete category "${name}"? This may also affect related lessons.`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (editingId === id) resetForm();
      fetchCategories();
    } catch (error) {
      console.error(error);
      alert("Failed to delete category");
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Category Management</h1>
      <p className="page-subtitle">
        Organize the learning structure of SignBridge by creating and managing lesson categories.
      </p>

      <div className="grid grid-3" style={{ marginBottom: "24px" }}>
        <div className="card">
          <h3 className="section-title">Total Categories</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            {categories.length}
          </p>
        </div>

        <div className="card">
          <h3 className="section-title">Total Lessons</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            {totalLessons}
          </p>
        </div>

        <div className="card">
          <h3 className="section-title">Admin Tip</h3>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Keep categories broad and clear, such as Greetings, Alphabet, and Daily Words.
          </p>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2 className="section-title">
            {editingId ? "Edit Category" : "Create New Category"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input
                className="input"
                type="text"
                placeholder="e.g. Numbers"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="textarea"
                rows="5"
                placeholder="Write a short category description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="actions-row">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading
                  ? editingId
                    ? "Updating..."
                    : "Creating..."
                  : editingId
                  ? "Update Category"
                  : "Create Category"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
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
            <h2 className="section-title" style={{ margin: 0 }}>
              Existing Categories
            </h2>
            <span className="badge">{categories.length} items</span>
          </div>

          {categories.length === 0 ? (
            <div className="empty-state">No categories available.</div>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {categories.map((cat) => (
                <div
                  key={cat.id}
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
                      alignItems: "flex-start",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 8px" }}>{cat.name}</h3>
                      <p
                        style={{
                          margin: 0,
                          color: "#64748b",
                          lineHeight: 1.6,
                        }}
                      >
                        {cat.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div className="actions-row" style={{ marginTop: "14px" }}>
                    <span className="meta-pill">
                      Lessons: {cat.lessons?.length || 0}
                    </span>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEdit(cat)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(cat.id, cat.name)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;