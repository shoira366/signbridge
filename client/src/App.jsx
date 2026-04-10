import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Categories from "./pages/Categories";
import Lessons from "./pages/Lessons";
import LessonDetail from "./pages/LessonDetail";
import AdminDashboard from "./pages/AdminDashboard";
import ManageCategories from "./pages/ManageCategories";
import ManageLessons from "./pages/ManageLessons";
import Dashboard from "./pages/Dashboard";
import ManageLessonContent from "./pages/ManageLessonContent";

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/lessons/:id" element={<LessonDetail />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute adminOnly={true}>
                <ManageCategories />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/lessons"
            element={
              <ProtectedRoute adminOnly={true}>
                <ManageLessons />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/lessons/:id/content"
            element={
              <ProtectedRoute adminOnly={true}>
                <ManageLessonContent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;