import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const q = search.toLowerCase().trim();
      if (!q) return true;

      return (
        cat.name.toLowerCase().includes(q) ||
        (cat.description || "").toLowerCase().includes(q)
      );
    });
  }, [categories, search]);

  const totalLessons = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (cat.lessons?.length || 0), 0);
  }, [categories]);

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <span className="badge">Learning Categories</span>
          <h1 className="page-title" style={{ marginTop: "14px" }}>
            Category Library
          </h1>
          <p className="page-subtitle">
            Explore structured Uzbek Sign Language learning tracks. Each category
            groups related lessons to help learners progress in a focused and
            organized way.
          </p>
        </div>
      </div>

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
          <h3 className="section-title">Learning Structure</h3>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Categories help learners move through sign language topics in a clear
            and manageable sequence.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="toolbar">
          <div className="toolbar-left">
            <h2 className="section-title" style={{ margin: 0 }}>
              Browse Categories
            </h2>
          </div>

          <div className="toolbar-right">
            <input
              className="input"
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "280px" }}
            />
          </div>
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="empty-state">
          No categories found for your current search.
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "1fr", gap: "16px" }}>
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="card card-hover">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <span className="badge">Category</span>
                  <h3 style={{ marginTop: "12px", marginBottom: "10px" }}>
                    {cat.name}
                  </h3>
                  <p className="page-subtitle" style={{ marginBottom: "14px" }}>
                    {cat.description || "No description available for this category."}
                  </p>

                  <div className="lesson-meta">
                    <span className="meta-pill">Structured Path</span>
                    <span className="meta-pill">Beginner Friendly</span>
                    <span className="meta-pill">UzSL Learning</span>
                  </div>
                </div>

                <div
                  style={{
                    minWidth: "220px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "12px",
                  }}
                >
                  <span className="meta-pill">
                    {cat.lessons?.length || 0} lesson(s)
                  </span>

                  <div style={{ color: "#64748b", fontSize: "0.95rem", textAlign: "right" }}>
                    {cat.lessons?.length
                      ? `This category contains ${cat.lessons.length} lesson(s).`
                      : "No lessons added yet."}
                  </div>

                  <Link to="/lessons" className="btn btn-primary">
                    View Lessons
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;