// import { useEffect, useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import api from "../api/axios";
// import { useAuth } from "../context/AuthContext";
// import "../styles/Admin.css"; // Create this CSS file

// const ManageLessons = () => {
//   const { token } = useAuth();

//   const [lessons, setLessons] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
//   const [search, setSearch] = useState("");

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingId, setEditingId] = useState(null);

//   const [form, setForm] = useState({
//     categoryId: "",
//     title: "",
//     description: "",
//     difficulty: "beginner",
//     videoUrl: "",
//   });

//   useEffect(() => {
//     fetchLessons();
//     fetchCategories();
//   }, []);

//   const fetchLessons = async () => {
//     try {
//       const res = await api.get("/lessons");
//       setLessons(res.data);
//     } catch (error) {
//       console.error("Failed to fetch lessons:", error);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const res = await api.get("/categories");
//       setCategories(res.data);
//     } catch (error) {
//       console.error("Failed to fetch categories:", error);
//     }
//   };

//   const openCreateModal = () => {
//     setEditingId(null);
//     setForm({
//       categoryId: "",
//       title: "",
//       description: "",
//       difficulty: "beginner",
//       videoUrl: "",
//     });
//     setIsModalOpen(true);
//   };

//   const openEditModal = (lesson) => {
//     setEditingId(lesson.id);
//     setForm({
//       categoryId: String(lesson.categoryId || ""),
//       title: lesson.title || "",
//       description: lesson.description || "",
//       difficulty: lesson.difficulty || "beginner",
//       videoUrl: lesson.videoUrl || "",
//     });
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setEditingId(null);
//     setForm({
//       categoryId: "",
//       title: "",
//       description: "",
//       difficulty: "beginner",
//       videoUrl: "",
//     });
//   };

//   const handleLessonSubmit = async (e) => {
//     e.preventDefault();

//     if (!form.categoryId || !form.title.trim()) {
//       alert("Category and lesson title are required");
//       return;
//     }

//     try {
//       setLoading(true);

//       const payload = {
//         categoryId: Number(form.categoryId),
//         title: form.title.trim(),
//         description: form.description.trim(),
//         difficulty: form.difficulty,
//         videoUrl: form.videoUrl.trim(),
//       };

//       if (editingId) {
//         await api.put(`/lessons/${editingId}`, payload, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//       } else {
//         await api.post("/lessons", payload, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//       }

//       closeModal();
//       fetchLessons();
//     } catch (error) {
//       console.error(error);
//       alert(editingId ? "Failed to update lesson" : "Failed to create lesson");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteLesson = async (id, title) => {
//     const confirmed = window.confirm(`Delete lesson "${title}"?`);
//     if (!confirmed) return;

//     try {
//       await api.delete(`/lessons/${id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       fetchLessons();
//     } catch (error) {
//       console.error(error);
//       alert("Failed to delete lesson");
//     }
//   };

//   const beginnerCount = lessons.filter(
//     (lesson) => lesson.difficulty === "beginner"
//   ).length;

//   const filteredLessons = useMemo(() => {
//     return lessons.filter((lesson) => {
//       const matchesCategory = selectedCategoryFilter
//         ? String(lesson.categoryId) === String(selectedCategoryFilter)
//         : true;

//       const q = search.toLowerCase().trim();
//       const matchesSearch =
//         !q ||
//         lesson.title.toLowerCase().includes(q) ||
//         (lesson.description || "").toLowerCase().includes(q) ||
//         (lesson.category?.name || "").toLowerCase().includes(q);

//       return matchesCategory && matchesSearch;
//     });
//   }, [lessons, selectedCategoryFilter, search]);

//   return (
//     <div className="page-container">
//       <div className="page-header-row">
//         <div>
//           <h1 className="page-title">Lesson Management</h1>
//           <p className="page-subtitle">
//             Manage lesson records from one clean admin panel. Create lessons in a modal and handle nested content on a separate page.
//           </p>
//         </div>

//         <button className="btn btn-primary" onClick={openCreateModal}>
//           + Create Lesson
//         </button>
//       </div>

//       <div className="grid grid-3" style={{ marginBottom: "24px" }}>
//         <div className="card">
//           <h3 className="section-title">Total Lessons</h3>
//           <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
//             {lessons.length}
//           </p>
//         </div>

//         <div className="card">
//           <h3 className="section-title">Beginner Lessons</h3>
//           <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
//             {beginnerCount}
//           </p>
//         </div>

//         <div className="card">
//           <h3 className="section-title">Available Categories</h3>
//           <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
//             {categories.length}
//           </p>
//         </div>
//       </div>

//       <div className="card">
//         <div className="toolbar">
//           <div className="toolbar-left">
//             <h2 className="section-title" style={{ margin: 0 }}>
//               Existing Lessons
//             </h2>
//             <span className="badge">{filteredLessons.length} shown</span>
//           </div>

//           <div className="toolbar-right">
//             <input
//               className="input"
//               style={{ width: "260px" }}
//               type="text"
//               placeholder="Search lessons..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />

//             <select
//               className="select"
//               style={{ width: "220px" }}
//               value={selectedCategoryFilter}
//               onChange={(e) => setSelectedCategoryFilter(e.target.value)}
//             >
//               <option value="">All categories</option>
//               {categories.map((cat) => (
//                 <option key={cat.id} value={cat.id}>
//                   {cat.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {filteredLessons.length === 0 ? (
//           <div className="empty-state">No lessons found.</div>
//         ) : (
//           <div className="table-wrap">
//             <table className="table">
//               <thead>
//                 <tr>
//                   <th>Title</th>
//                   <th>Category</th>
//                   <th>Difficulty</th>
//                   <th>Signs</th>
//                   <th>Quiz</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredLessons.map((lesson) => (
//                   <tr key={lesson.id}>
//                     <td>
//                       <div style={{ fontWeight: 700 }}>{lesson.title}</div>
//                       <div style={{ color: "#64748b", marginTop: "4px" }}>
//                         {lesson.description || "No description"}
//                       </div>
//                     </td>
//                     <td>{lesson.category?.name || "Unknown"}</td>
//                     <td>
//                       <span className="badge">{lesson.difficulty}</span>
//                     </td>
//                     <td>{lesson.signs?.length || 0}</td>
//                     <td>{lesson.quizzes?.length || 0}</td>
//                     <td>
//                       <div className="actions-row">
//                         <button
//                           className="btn btn-secondary"
//                           onClick={() => openEditModal(lesson)}
//                         >
//                           Edit
//                         </button>

//                         <Link
//                           to={`/admin/lessons/${lesson.id}/content`}
//                           className="btn btn-secondary"
//                         >
//                           Manage Content
//                         </Link>

//                         <button
//                           className="btn btn-danger"
//                           onClick={() =>
//                             handleDeleteLesson(lesson.id, lesson.title)
//                           }
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {isModalOpen && (
//         <div className="modal-overlay" onClick={closeModal}>
//           <div className="modal-card" onClick={(e) => e.stopPropagation()}>
//             <div className="page-header-row" style={{ marginBottom: "16px" }}>
//               <div>
//                 <h2 className="section-title" style={{ margin: 0 }}>
//                   {editingId ? "Edit Lesson" : "Create Lesson"}
//                 </h2>
//                 <p className="page-subtitle" style={{ margin: "8px 0 0" }}>
//                   Fill in the lesson details below.
//                 </p>
//               </div>

//               <button className="btn btn-secondary" onClick={closeModal}>
//                 Close
//               </button>
//             </div>

//             <form onSubmit={handleLessonSubmit}>
//               <div className="form-group">
//                 <label className="form-label">Category</label>
//                 <select
//                   className="select"
//                   value={form.categoryId}
//                   onChange={(e) =>
//                     setForm({ ...form, categoryId: e.target.value })
//                   }
//                 >
//                   <option value="">Select category</option>
//                   {categories.map((cat) => (
//                     <option key={cat.id} value={cat.id}>
//                       {cat.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Lesson Title</label>
//                 <input
//                   className="input"
//                   type="text"
//                   placeholder="e.g. Basic Greetings"
//                   value={form.title}
//                   onChange={(e) => setForm({ ...form, title: e.target.value })}
//                 />
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Description</label>
//                 <textarea
//                   className="textarea"
//                   rows="5"
//                   placeholder="Write a short lesson description"
//                   value={form.description}
//                   onChange={(e) =>
//                     setForm({ ...form, description: e.target.value })
//                   }
//                 />
//               </div>

//               <div className="grid grid-2">
//                 <div className="form-group">
//                   <label className="form-label">Difficulty</label>
//                   <select
//                     className="select"
//                     value={form.difficulty}
//                     onChange={(e) =>
//                       setForm({ ...form, difficulty: e.target.value })
//                     }
//                   >
//                     <option value="beginner">Beginner</option>
//                     <option value="intermediate">Intermediate</option>
//                   </select>
//                 </div>

//                 <div className="form-group">
//                   <label className="form-label">Video URL</label>
//                   <input
//                     className="input"
//                     type="text"
//                     placeholder="Optional video link"
//                     value={form.videoUrl}
//                     onChange={(e) =>
//                       setForm({ ...form, videoUrl: e.target.value })
//                     }
//                   />
//                 </div>
//               </div>

//               <div className="actions-row">
//                 <button className="btn btn-primary" type="submit" disabled={loading}>
//                   {loading
//                     ? editingId
//                       ? "Updating..."
//                       : "Creating..."
//                     : editingId
//                     ? "Update Lesson"
//                     : "Create Lesson"}
//                 </button>

//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={closeModal}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManageLessons;

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/Admin.css";

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
    imageUrl: "",
    order: "",
    isPremium: false,
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
      imageUrl: "",
      order: "",
      isPremium: false,
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
      imageUrl: lesson.imageUrl || "",
      order: lesson.order || "",
      isPremium: lesson.isPremium || false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
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
        imageUrl: form.imageUrl.trim(),
        order: form.order ? Number(form.order) : 0,
        isPremium: form.isPremium,
      };

      if (editingId) {
        await api.put(`/lessons/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post("/lessons", payload, {
          headers: { Authorization: `Bearer ${token}` },
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
    if (window.confirm(`Delete lesson "${title}"?`)) {
      try {
        await api.delete(`/lessons/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchLessons();
      } catch (error) {
        console.error(error);
        alert("Failed to delete lesson");
      }
    }
  };

  const beginnerCount = lessons.filter(l => l.difficulty === "beginner").length;
  const premiumCount = lessons.filter(l => l.isPremium).length;

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesCategory = selectedCategoryFilter
        ? String(lesson.categoryId) === String(selectedCategoryFilter)
        : true;
      const q = search.toLowerCase().trim();
      const matchesSearch = !q ||
        lesson.title.toLowerCase().includes(q) ||
        (lesson.description || "").toLowerCase().includes(q) ||
        (lesson.category?.name || "").toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [lessons, selectedCategoryFilter, search]);

  return (
    <div className="admin-page">
      {/* Back Button */}
      <div className="admin-back-nav">
        <Link to="/admin" className="admin-back-btn">
          ← Back to Admin Dashboard
        </Link>
      </div>
      
      {/* Header */}
      <div className="admin-header-section">
        <div>
          <h1 className="admin-page-title">📚 Lesson Management</h1>
          <p className="admin-page-subtitle">Create, edit, and manage all lessons in the platform</p>
        </div>
        <button className="admin-btn-primary" onClick={openCreateModal}>
          <span>+</span> New Lesson
        </button>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📖</div>
          <div className="admin-stat-info">
            <h3>{lessons.length}</h3>
            <p>Total Lessons</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">🌱</div>
          <div className="admin-stat-info">
            <h3>{beginnerCount}</h3>
            <p>Beginner Lessons</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">💎</div>
          <div className="admin-stat-info">
            <h3>{premiumCount}</h3>
            <p>Premium Lessons</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📁</div>
          <div className="admin-stat-info">
            <h3>{categories.length}</h3>
            <p>Categories</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <input
          type="text"
          className="admin-search"
          placeholder="Search lessons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-select"
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Lessons Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Signs</th>
              <th>Quizzes</th>
              <th>Premium</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLessons.map((lesson) => (
              <tr key={lesson.id}>
                <td>
                  <div className="admin-lesson-title">{lesson.title}</div>
                  <div className="admin-lesson-desc">{lesson.description?.slice(0, 60)}...</div>
                </td>
                <td><span className="admin-badge">{lesson.category?.name || "Uncategorized"}</span></td>
                <td>
                  <span className={`admin-difficulty ${lesson.difficulty}`}>
                    {lesson.difficulty === "beginner" ? "🌱 Beginner" : "📘 Intermediate"}
                  </span>
                </td>
                <td>{lesson.signs?.length || 0}</td>
                <td>{lesson.quizzes?.length || 0}</td>
                <td>
                  {lesson.isPremium ? (
                    <span className="admin-premium-badge">💎 Premium</span>
                  ) : (
                    <span className="admin-free-badge">Free</span>
                  )}
                </td>
                <td>
                  <div className="admin-actions">
                    <button className="admin-btn-icon edit" onClick={() => openEditModal(lesson)} title="Edit">✏️</button>
                    <Link to={`/admin/lessons/${lesson.id}/content`} className="admin-btn-icon content" title="Manage Content">📝</Link>
                    <button className="admin-btn-icon delete" onClick={() => handleDeleteLesson(lesson.id, lesson.title)} title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingId ? "Edit Lesson" : "Create New Lesson"}</h2>
              <button className="admin-modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleLessonSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Category *</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Lesson Title *</label>
                  <input type="text" placeholder="e.g., Basic Greetings" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>

                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea rows="4" placeholder="Describe what students will learn..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Difficulty</label>
                    <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Order</label>
                    <input type="number" placeholder="Display order" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Video URL</label>
                    <input type="text" placeholder="YouTube or video link" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
                  </div>

                  <div className="admin-form-group">
                    <label>Image URL</label>
                    <input type="text" placeholder="Thumbnail image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-checkbox">
                    <input type="checkbox" checked={form.isPremium} onChange={(e) => setForm({ ...form, isPremium: e.target.checked })} />
                    <span>Premium Lesson (only for subscribers)</span>
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-btn-primary" disabled={loading}>
                  {loading ? "Saving..." : (editingId ? "Update Lesson" : "Create Lesson")}
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