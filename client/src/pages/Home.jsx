import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const Home = () => {
  const [stats, setStats] = useState({
    lessons: 0,
    categories: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const lessonsRes = await api.get("/lessons");
      const categoriesRes = await api.get("/categories");

      setStats({
        lessons: lessonsRes.data.length,
        categories: categoriesRes.data.length,
      });
    } catch (error) {
      console.error("Failed to fetch homepage stats:", error);
    }
  };

  return (
    <div className="page-container">
      <section className="hero">
        <div className="hero-panel">
          <span className="badge">Uzbek Sign Language Learning Platform</span>
          <h1>Learn Uzbek Sign Language with confidence</h1>
          <p>
            SignBridge helps learners explore Uzbek Sign Language through
            structured lessons, categorized vocabulary, and interactive practice.
            Start with beginner topics and grow step by step.
          </p>

          <div className="actions-row">
            <Link to="/lessons" className="btn btn-primary">
              Start Learning
            </Link>
            <Link to="/categories" className="btn btn-secondary">
              Browse Categories
            </Link>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <h3>{stats.lessons}</h3>
            <p>Available Lessons</p>
          </div>

          <div className="stat-card">
            <h3>{stats.categories}</h3>
            <p>Categories</p>
          </div>

          <div className="stat-card">
            <h3>Interactive</h3>
            <p>Practice lessons with quiz-based learning and progress tracking.</p>
          </div>
        </div>
      </section>

      <section className="grid grid-3">
        <div className="card card-hover">
          <h3 className="section-title">Structured Learning</h3>
          <p className="page-subtitle">
            Learn through categories like alphabet, greetings, and daily words.
          </p>
        </div>

        <div className="card card-hover">
          <h3 className="section-title">Lesson-Based Practice</h3>
          <p className="page-subtitle">
            Each lesson contains signs, meanings, and quiz questions.
          </p>
        </div>

        <div className="card card-hover">
          <h3 className="section-title">Track Your Progress</h3>
          <p className="page-subtitle">
            Save completed lessons and monitor your learning journey.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;