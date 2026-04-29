// src/components/PremiumGuard.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import SubscriptionPlans from "./SubscriptionPlans";

const PremiumGuard = ({ children, lessonId }) => {
  const { token } = useAuth();
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [lessonId]);

  const checkAccess = async () => {
    try {
      const res = await api.get(`/subscriptions/check/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHasAccess(res.data.hasAccess);
    } catch (error) {
      console.error("Check access error:", error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Checking access...</div>;

  if (!hasAccess) {
    return (
      <div>
        <div
          style={{
            background: "#fef3c7",
            border: "1px solid #fbbf24",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#92400e", marginBottom: "8px" }}>🔒 Premium Content</h2>
          <p style={{ color: "#92400e" }}>
            This lesson is only available for premium users. Upgrade your plan to access this content and much more!
          </p>
        </div>
        <SubscriptionPlans />
      </div>
    );
  }

  return children;
};

export default PremiumGuard;