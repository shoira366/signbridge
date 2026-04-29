import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/Admin.css";

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
    <div className="admin-page">
      {/* Back Button */}
      <div className="admin-back-nav">
        <Link to="/admin" className="admin-back-btn">
          ← Back to Admin Dashboard
        </Link>
      </div>

      <div className="admin-header-section">
        <div>
          <h1 className="admin-page-title">📁 Category Management</h1>
          <p className="admin-page-subtitle">
            Organize the learning structure of SignBridge by creating and managing lesson categories.
          </p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📁</div>
          <div className="admin-stat-info">
            <h3>{categories.length}</h3>
            <p>Total Categories</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📚</div>
          <div className="admin-stat-info">
            <h3>{totalLessons}</h3>
            <p>Total Lessons</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">💡</div>
          <div className="admin-stat-info">
            <p style={{ fontSize: "13px", margin: 0 }}>Keep categories broad and clear, such as Greetings, Alphabet, and Daily Words.</p>
          </div>
        </div>
      </div>

      <div className="admin-two-columns">
        {/* Create/Edit Form */}
        <div className="admin-card">
          <h3 className="admin-card-title">
            {editingId ? "✏️ Edit Category" : "➕ Create New Category"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label className="admin-label">Category Name *</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g., Numbers, Greetings, Alphabet"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Description</label>
              <textarea
                className="admin-textarea"
                rows="4"
                placeholder="Write a short category description..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="admin-btn-primary" disabled={loading}>
                {loading ? "Saving..." : (editingId ? "Update Category" : "Create Category")}
              </button>
              {editingId && (
                <button type="button" className="admin-btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Categories List */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Existing Categories</h3>
            <span className="admin-badge">{categories.length} items</span>
          </div>

          {categories.length === 0 ? (
            <div className="admin-empty">No categories available.</div>
          ) : (
            <div className="admin-categories-list">
              {categories.map((cat) => (
                <div key={cat.id} className="admin-category-item">
                  <div className="admin-category-info">
                    <h4>{cat.name}</h4>
                    <p>{cat.description || "No description provided."}</p>
                    <div className="admin-category-meta">
                      <span className="admin-badge">📚 {cat.lessons?.length || 0} lessons</span>
                    </div>
                  </div>
                  <div className="admin-category-actions">
                    <button className="admin-btn-icon edit" onClick={() => handleEdit(cat)} title="Edit">✏️</button>
                    <button className="admin-btn-icon delete" onClick={() => handleDelete(cat.id, cat.name)} title="Delete">🗑️</button>
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