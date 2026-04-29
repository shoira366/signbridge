import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import MainNavbar from "./components/MainNavbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AchievementBadges from "./components/AchievementBadges";
import ErrorBoundary from "./components/ErrorBoundary";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Lessons from "./pages/Lessons";
import LessonDetail from "./pages/LessonDetail";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import QuizPage from "./pages/QuizQuestion";
import Quizzes from "./pages/Quizzes";
import AdminDashboard from "./pages/AdminDashboard";
import ManageCategories from "./pages/ManageCategories";
import ManageLessons from "./pages/ManageLessons";
import ManageLessonContent from "./pages/ManageLessonContent";

// Layout component that includes Navbar only for non-home and non-admin pages
const Layout = ({ children }) => {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Hide navbar on home page and all admin routes
  const isHomePage = pathname === "/";
  const isAdminRoute = pathname.startsWith("/admin");
  const showNavbar = !isHomePage && !isAdminRoute;
  
  return (
    <>
      {showNavbar && <MainNavbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* User Routes - Shows MainNavbar */}
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/lessons/:id" element={<LessonDetail />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route 
            path="/dashboard" 
            element={
              <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary>
            } 
          />
          <Route path="/achievements" element={<AchievementBadges />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/lessons/:id/quiz" element={<QuizPage />} />

          {/* Admin Routes - No MainNavbar (admin has its own sidebar) */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/lessons" 
            element={
              <AdminRoute>
                <ManageLessons />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/lessons/:id/content" 
            element={
              <AdminRoute>
                <ManageLessonContent />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/categories" 
            element={
              <AdminRoute>
                <ManageCategories />
              </AdminRoute>
            } 
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;