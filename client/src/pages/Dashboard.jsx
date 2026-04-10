import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { token } = useAuth();
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await api.get("/progress/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProgress(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const completedLessons = useMemo(
    () => progress.filter((item) => item.completed).length,
    [progress]
  );

  const averageScore = useMemo(() => {
    if (progress.length === 0) return 0;
    const total = progress.reduce((sum, item) => sum + (item.score || 0), 0);
    return Math.round(total / progress.length);
  }, [progress]);

  return (
    <div className="page-container">
      <h1 className="page-title">My Learning Dashboard</h1>
      <p className="page-subtitle">
        Track your Uzbek Sign Language learning progress and completed lessons.
      </p>

      <div className="grid grid-3" style={{ marginBottom: "24px" }}>
        <div className="card">
          <h3 className="section-title">Tracked Lessons</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            {progress.length}
          </p>
        </div>

        <div className="card">
          <h3 className="section-title">Completed Lessons</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            {completedLessons}
          </p>
        </div>

        <div className="card">
          <h3 className="section-title">Average Score</h3>
          <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            {averageScore}%
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">My Progress History</h2>

        {progress.length === 0 ? (
          <div className="empty-state">No learning progress recorded yet.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Lesson</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {progress.map((item) => (
                  <tr key={item.id}>
                    <td>{item.lesson?.title}</td>
                    <td>{item.lesson?.category?.name}</td>
                    <td>
                      <span className="badge">
                        {item.completed ? "Completed" : "In Progress"}
                      </span>
                    </td>
                    <td>{item.score}%</td>
                    <td>{new Date(item.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;