// src/components/SubscriptionPlans.jsx
import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const SubscriptionPlans = () => {
  const { token, user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      name: "FREE",
      price: "$0",
      period: "forever",
      features: [
        "Access to basic lessons",
        "Limited quizzes",
        "Basic progress tracking",
        "Standard support",
      ],
      color: "#64748b",
    },
    {
      name: "MONTHLY",
      price: "$9.99",
      period: "per month",
      features: [
        "All FREE features",
        "Full lesson library",
        "Unlimited quizzes",
        "Advanced progress analytics",
        "Priority support",
        "Achievement badges",
      ],
      color: "#3b82f6",
      popular: true,
    },
    {
      name: "YEARLY",
      price: "$89.99",
      period: "per year",
      features: [
        "All MONTHLY features",
        "Save 25%",
        "Exclusive content",
        "Early access to new features",
        "Certificate of completion",
      ],
      color: "#8b5cf6",
    },
    {
      name: "LIFETIME",
      price: "$299.99",
      period: "one-time",
      features: [
        "All YEARLY features",
        "Lifetime access",
        "Future updates included",
        "Premium support",
        "Custom learning path",
      ],
      color: "#f59e0b",
    },
  ];

  const handleSubscribe = async (plan) => {
    setSelectedPlan(plan.name);
    setLoading(true);
    
    try {
      const res = await api.post(
        "/subscriptions/create",
        { plan: plan.name, duration: plan.name === "YEARLY" ? "yearly" : "monthly" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Successfully subscribed to ${plan.name} plan!`);
      
      // Redirect to payment gateway if needed
      if (res.data.clientSecret) {
        // Handle Stripe payment
        console.log("Payment client secret:", res.data.clientSecret);
      }
    } catch (error) {
      console.error("Subscription failed:", error);
      alert("Subscription failed. Please try again.");
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div style={{ padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "16px" }}>
          Choose Your Learning Path
        </h1>
        <p style={{ color: "#64748b", fontSize: "18px" }}>
          Unlock your full potential with SignBridge Premium
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              border: plan.popular ? `2px solid ${plan.color}` : "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "24px",
              background: "#fff",
              position: "relative",
              transition: "transform 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {plan.popular && (
              <div
                style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: plan.color,
                  color: "#fff",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                MOST POPULAR
              </div>
            )}

            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
              {plan.name}
            </h2>
            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "36px", fontWeight: 800 }}>{plan.price}</span>
              <span style={{ color: "#64748b" }}> / {plan.period}</span>
            </div>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loading && selectedPlan === plan.name}
              style={{
                width: "100%",
                padding: "12px",
                background: plan.color,
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: loading && selectedPlan === plan.name ? "not-allowed" : "pointer",
                marginBottom: "20px",
                opacity: loading && selectedPlan === plan.name ? 0.6 : 1,
              }}
            >
              {loading && selectedPlan === plan.name ? "Processing..." : "Subscribe Now"}
            </button>

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {plan.features.map((feature, idx) => (
                <li
                  key={idx}
                  style={{
                    padding: "8px 0",
                    color: "#334155",
                    fontSize: "14px",
                    borderBottom: idx !== plan.features.length - 1 ? "1px solid #e2e8f0" : "none",
                  }}
                >
                  ✓ {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;