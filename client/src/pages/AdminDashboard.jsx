const AdminDashboard = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">
        Manage learning content, categories, and lesson structure for SignBridge.
      </p>

      <div className="grid grid-3">
        <div className="card card-hover">
          <h3 className="section-title">Manage Categories</h3>
          <p className="page-subtitle">
            Create and organize lesson groups such as alphabet, greetings, and daily words.
          </p>
        </div>

        <div className="card card-hover">
          <h3 className="section-title">Manage Lessons</h3>
          <p className="page-subtitle">
            Add lesson titles, descriptions, and connect them to categories.
          </p>
        </div>

        <div className="card card-hover">
          <h3 className="section-title">Content Workflow</h3>
          <p className="page-subtitle">
            Keep lesson content clear, structured, and ready for learners.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;