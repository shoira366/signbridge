// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import api from "../api/axios";
// import "../styles/Subscription.css";

// const Subscription = () => {
//   const { token, user } = useAuth();
//   const navigate = useNavigate();
//   const [subscription, setSubscription] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showCancelConfirm, setShowCancelConfirm] = useState(false);
//   const [activatingPlan, setActivatingPlan] = useState(null);

//   useEffect(() => {
//     if (token) {
//       fetchSubscription();
//     } else {
//       setLoading(false);
//     }
//   }, [token]);

//   const fetchSubscription = async () => {
//     try {
//       const response = await api.get("/subscriptions/me", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setSubscription(response.data);
//     } catch (error) {
//       console.error("Failed to fetch subscription:", error);
//       // Set default free subscription on error
//       setSubscription({ plan: "FREE", status: "ACTIVE" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleActivatePlan = async (planId) => {
//     setActivatingPlan(planId);
//     try {
//       const response = await api.post(
//         "/subscriptions/create-checkout-session",
//         { planId },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
      
//       const data = response.data;
      
//       if (data.url) {
//         // Redirect to Stripe Checkout
//         window.location.href = data.url;
//       } else {
//         throw new Error('No checkout URL received');
//       }
//     } catch (error) {
//       console.error("Failed to activate plan:", error);
//       alert(error.response?.data?.error || "Could not initiate payment. Please try again.");
//     } finally {
//       setActivatingPlan(null);
//     }
//   };

//   const handleCancelSubscription = async () => {
//     try {
//       await api.post("/subscriptions/cancel", {}, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       await fetchSubscription();
//       setShowCancelConfirm(false);
//       alert("Subscription cancelled successfully");
//     } catch (error) {
//       console.error("Failed to cancel subscription:", error);
//       alert("Failed to cancel subscription");
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const plans = [
//     {
//       id: "free",
//       name: "Free",
//       price: 0,
//       period: "forever",
//       description: "Perfect for getting started",
//       features: [
//         "Basic lessons access (10 lessons)",
//         "Limited quizzes (5 per week)",
//         "Basic progress tracking",
//         "Community support",
//         "1 device only",
//         "Standard response time (48h)"
//       ],
//       icon: "🎓",
//       color: "#64748b",
//       borderColor: "#e2e8f0",
//       buttonText: "Current Plan",
//       buttonClass: "current",
//       popular: false,
//       badge: null
//     },
//     {
//       id: "monthly",
//       name: "Premium Monthly",
//       price: 9.99,
//       period: "month",
//       originalPrice: 12.99,
//       description: "Most flexible option",
//       features: [
//         "Full lesson library access (50+ lessons)",
//         "Unlimited quizzes",
//         "Advanced progress analytics",
//         "Priority email support",
//         "All achievement badges",
//         "Streak recovery",
//         "Up to 3 devices"
//       ],
//       icon: "💎",
//       color: "#3b82f6",
//       borderColor: "#3b82f6",
//       buttonText: "Activate Monthly",
//       buttonClass: "primary",
//       popular: false,
//       badge: null
//     },
//     {
//       id: "yearly",
//       name: "Premium Yearly",
//       price: 89.99,
//       period: "year",
//       originalPrice: 155.88,
//       description: "Best value • Save 42%",
//       features: [
//         "All Monthly features",
//         "2 months free",
//         "Exclusive content library",
//         "Early access to new features",
//         "Certificate of completion",
//         "Premium support 24/7",
//         "Unlimited devices",
//         "Downloadable materials"
//       ],
//       icon: "👑",
//       color: "#8b5cf6",
//       borderColor: "#8b5cf6",
//       buttonText: "Activate Yearly",
//       buttonClass: "featured",
//       popular: true,
//       badge: "🔥 Most Popular"
//     },
//     {
//       id: "lifetime",
//       name: "Lifetime Premium",
//       price: 299.99,
//       period: "one-time",
//       description: "Best long-term investment",
//       features: [
//         "All Yearly features",
//         "Lifetime access",
//         "All future updates included",
//         "Priority VIP support",
//         "Custom learning path",
//         "Lifetime certificate",
//         "Exclusive lifetime badge",
//         "1-on-1 coaching session"
//       ],
//       icon: "🌟",
//       color: "#f59e0b",
//       borderColor: "#f59e0b",
//       buttonText: "Activate Lifetime",
//       buttonClass: "premium",
//       popular: false,
//       badge: "✨ Best Value"
//     }
//   ];

//   const currentPlan = plans.find(p => p.id.toLowerCase() === subscription?.plan?.toLowerCase()) || plans[0];
//   const isPremium = subscription?.plan !== "FREE";

//   if (loading) {
//     return (
//       <div className="subscription-container-modern">
//         <div className="loading-spinner">
//           <div className="spinner"></div>
//           <p>Loading subscription details...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="subscription-container-modern">
//       {/* Hero Section */}
//       <div className="subscription-hero">
//         <button className="back-button-hero" onClick={() => navigate(-1)}>
//           ← Back
//         </button>
//         <div className="hero-content">
//           <span className="hero-badge">SIGNBRIDGE PREMIUM</span>
//           <h1 className="hero-title">
//             Unlock Your Full<br />Learning Potential
//           </h1>
//           <p className="hero-subtitle">
//             Get unlimited access to all lessons, advanced analytics, and premium features.
//             Start your journey to sign language fluency today.
//           </p>
//         </div>
//       </div>

//       {/* Current Plan Section (for premium users) */}
//       {isPremium && (
//         <div className="current-plan-section">
//           <div className="current-plan-card" style={{ borderColor: currentPlan.color }}>
//             <div className="current-plan-header">
//               <div className="current-plan-icon">{currentPlan.icon}</div>
//               <div className="current-plan-info">
//                 <div className="current-plan-status" style={{ background: currentPlan.color }}>
//                   ACTIVE PLAN
//                 </div>
//                 <h2>{currentPlan.name}</h2>
//                 {subscription?.endDate && (
//                   <p>Renews on {formatDate(subscription.endDate)}</p>
//                 )}
//               </div>
//             </div>
//             <div className="current-plan-features">
//               {currentPlan.features.slice(0, 4).map((feature, i) => (
//                 <span key={i}>{feature}</span>
//               ))}
//             </div>
//             {subscription?.plan !== "LIFETIME" && (
//               <div className="cancel-section">
//                 {showCancelConfirm ? (
//                   <div className="cancel-confirm-card">
//                     <p>Are you sure you want to cancel your subscription?</p>
//                     <div className="cancel-buttons">
//                       <button className="cancel-no" onClick={() => setShowCancelConfirm(false)}>
//                         Keep Premium
//                       </button>
//                       <button className="cancel-yes" onClick={handleCancelSubscription}>
//                         Yes, Cancel
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <button className="cancel-subscription-btn" onClick={() => setShowCancelConfirm(true)}>
//                     Cancel Subscription
//                   </button>
//                 )}
//               </div>
//             )}
//             {subscription?.plan === "LIFETIME" && (
//               <div className="lifetime-badge">
//                 🌟 Lifetime Access - Never expires!
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* All Plans - Show all 4 plans */}
//       <div className="pricing-section">
//         <div className="section-header">
//           <h2>{isPremium ? "Explore Other Plans" : "Choose Your Plan"}</h2>
//           <p>{isPremium ? "Want to switch? Check out our other options" : "Flexible options to fit your learning journey"}</p>
//         </div>

//         <div className="pricing-grid-4">
//           {plans.map((plan) => {
//             const isCurrentPlan = plan.id === currentPlan.id && isPremium;
//             const isDisabled = isCurrentPlan;
            
//             return (
//               <div
//                 key={plan.id}
//                 className={`pricing-card-modern ${plan.popular ? 'popular' : ''} ${isCurrentPlan ? 'current-plan-active' : ''}`}
//                 style={{
//                   '--plan-color': plan.color,
//                   '--plan-border': plan.borderColor
//                 }}
//               >
//                 {plan.badge && (
//                   <div className="plan-badge" style={{ background: plan.color }}>
//                     {plan.badge}
//                   </div>
//                 )}
                
//                 <div className="plan-header-modern">
//                   <div className="plan-icon-modern" style={{ background: `${plan.color}15` }}>
//                     {plan.icon}
//                   </div>
//                   <h3>{plan.name}</h3>
//                   <div className="plan-price-modern">
//                     {plan.originalPrice && (
//                       <span className="original-price">${plan.originalPrice}</span>
//                     )}
//                     <span className="price">${plan.price}</span>
//                     <span className="period">/{plan.period}</span>
//                   </div>
//                   <p className="plan-description-modern">{plan.description}</p>
//                   {plan.originalPrice && (
//                     <div className="savings-badge-modern">
//                       Save ${(plan.originalPrice - plan.price).toFixed(2)}
//                     </div>
//                   )}
//                 </div>

//                 <div className="plan-features-modern">
//                   {plan.features.map((feature, i) => (
//                     <div key={i} className="feature-item-modern">
//                       <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                       </svg>
//                       <span>{feature}</span>
//                     </div>
//                   ))}
//                 </div>

//                 <button
//                   className={`activate-button ${plan.buttonClass}`}
//                   style={{
//                     background: isDisabled ? '#e2e8f0' : plan.color,
//                     cursor: isDisabled ? 'not-allowed' : 'pointer',
//                     opacity: isDisabled ? 0.6 : 1
//                   }}
//                   onClick={() => !isDisabled && handleActivatePlan(plan.id)}
//                   disabled={isDisabled}
//                 >
//                   {activatingPlan === plan.id ? (
//                     <span className="activating-spinner"></span>
//                   ) : isDisabled ? (
//                     'Current Plan'
//                   ) : (
//                     `${plan.buttonText}`
//                   )}
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Features Comparison */}
//       <div className="features-section">
//         <div className="section-header">
//           <h2>Compare All Features</h2>
//           <p>Everything you need to master sign language</p>
//         </div>

//         <div className="comparison-table">
//           <div className="comparison-header">
//             <div className="comparison-cell feature-name">Features</div>
//             <div className="comparison-cell">Free</div>
//             <div className="comparison-cell">Premium Monthly</div>
//             <div className="comparison-cell">Premium Yearly</div>
//             <div className="comparison-cell">Lifetime</div>
//           </div>
          
//           {[
//             { name: "Lesson Library Access", free: "10 lessons", monthly: "50+ lessons", yearly: "All lessons", lifetime: "All lessons" },
//             { name: "Weekly Quizzes", free: "5 per week", monthly: "Unlimited", yearly: "Unlimited", lifetime: "Unlimited" },
//             { name: "Progress Analytics", free: "Basic", monthly: "Advanced", yearly: "Advanced", lifetime: "Advanced" },
//             { name: "Achievement Badges", free: "Limited", monthly: "All badges", yearly: "All badges", lifetime: "All badges" },
//             { name: "Certificate of Completion", free: "❌", monthly: "❌", yearly: "✅", lifetime: "✅" },
//             { name: "Priority Support", free: "48h", monthly: "24h", yearly: "24/7", lifetime: "VIP 24/7" },
//             { name: "Downloadable Materials", free: "❌", monthly: "❌", yearly: "✅", lifetime: "✅" },
//             { name: "Multi-device Sync", free: "1", monthly: "3", yearly: "Unlimited", lifetime: "Unlimited" },
//             { name: "Exclusive Content", free: "❌", monthly: "❌", yearly: "✅", lifetime: "✅" },
//             { name: "Future Updates", free: "Basic", monthly: "Basic", yearly: "Standard", lifetime: "All updates" },
//             { name: "1-on-1 Coaching", free: "❌", monthly: "❌", yearly: "❌", lifetime: "✅" }
//           ].map((feature, i) => (
//             <div key={i} className="comparison-row">
//               <div className="comparison-cell feature-name">{feature.name}</div>
//               <div className="comparison-cell free-value">{feature.free}</div>
//               <div className="comparison-cell monthly-value">{feature.monthly}</div>
//               <div className="comparison-cell yearly-value">{feature.yearly}</div>
//               <div className="comparison-cell lifetime-value">{feature.lifetime}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Testimonials Section */}
//       <div className="testimonials-section">
//         <div className="section-header">
//           <h2>Trusted by Language Learners</h2>
//           <p>Join thousands of satisfied users</p>
//         </div>

//         <div className="testimonials-grid">
//           <div className="testimonial-card">
//             <div className="testimonial-stars">★★★★★</div>
//             <p>"The premium features transformed my learning experience. The unlimited quizzes and detailed analytics helped me improve faster than ever!"</p>
//             <div className="testimonial-author">
//               <strong>Sarah Johnson</strong>
//               <span>Premium Yearly Member</span>
//             </div>
//           </div>
//           <div className="testimonial-card">
//             <div className="testimonial-stars">★★★★★</div>
//             <p>"Best investment in my education. The lifetime plan is worth every penny. The certificate and exclusive content are game-changers."</p>
//             <div className="testimonial-author">
//               <strong>Michael Chen</strong>
//               <span>Lifetime Member</span>
//             </div>
//           </div>
//           <div className="testimonial-card">
//             <div className="testimonial-stars">★★★★★</div>
//             <p>"Monthly plan is perfect for my budget. I love the flexibility and the content is amazing!"</p>
//             <div className="testimonial-author">
//               <strong>Emily Rodriguez</strong>
//               <span>Premium Monthly Member</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* FAQ Section */}
//       <div className="faq-section-modern">
//         <div className="section-header">
//           <h2>Frequently Asked Questions</h2>
//           <p>Everything you need to know</p>
//         </div>

//         <div className="faq-grid-modern">
//           <div className="faq-item-modern">
//             <div className="faq-question-modern">Can I cancel anytime?</div>
//             <div className="faq-answer-modern">Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.</div>
//           </div>
//           <div className="faq-item-modern">
//             <div className="faq-question-modern">What payment methods are accepted?</div>
//             <div className="faq-answer-modern">We accept all major credit cards, PayPal, Apple Pay, and Google Pay.</div>
//           </div>
//           <div className="faq-item-modern">
//             <div className="faq-question-modern">Is there a money-back guarantee?</div>
//             <div className="faq-answer-modern">Yes, all paid plans come with a 30-day money-back guarantee.</div>
//           </div>
//           <div className="faq-item-modern">
//             <div className="faq-question-modern">Can I switch between plans?</div>
//             <div className="faq-answer-modern">Absolutely! You can upgrade or downgrade your plan at any time.</div>
//           </div>
//           <div className="faq-item-modern">
//             <div className="faq-question-modern">What happens after Lifetime purchase?</div>
//             <div className="faq-answer-modern">You get unlimited access forever, including all future updates and features.</div>
//           </div>
//           <div className="faq-item-modern">
//             <div className="faq-question-modern">Is there a free trial?</div>
//             <div className="faq-answer-modern">Yes, we offer a 7-day free trial for all annual plans.</div>
//           </div>
//         </div>
//       </div>

//       {/* Trust Badges */}
//       <div className="trust-badges-modern">
//         <div className="trust-badge">
//           <span className="trust-icon">🔒</span>
//           <div>
//             <strong>Secure Payment</strong>
//             <p>256-bit SSL encryption</p>
//           </div>
//         </div>
//         <div className="trust-badge">
//           <span className="trust-icon">💳</span>
//           <div>
//             <strong>Cancel Anytime</strong>
//             <p>No hidden fees</p>
//           </div>
//         </div>
//         <div className="trust-badge">
//           <span className="trust-icon">⭐</span>
//           <div>
//             <strong>30-Day Guarantee</strong>
//             <p>Full refund if not satisfied</p>
//           </div>
//         </div>
//         <div className="trust-badge">
//           <span className="trust-icon">💬</span>
//           <div>
//             <strong>24/7 Support</strong>
//             <p>Priority assistance</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Subscription;

// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import api from "../api/axios";
// import "../styles/Subscription.css";

// const Subscription = () => {
//   const { token, user } = useAuth();
//   const navigate = useNavigate();
//   const [subscription, setSubscription] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showCancelConfirm, setShowCancelConfirm] = useState(false);
//   const [activatingPlan, setActivatingPlan] = useState(null);
//   const [changingPlan, setChangingPlan] = useState(false);
//   const [pendingChange, setPendingChange] = useState(null);
//   const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
//   const [selectedNewPlan, setSelectedNewPlan] = useState(null);

//   useEffect(() => {
//     if (token) {
//       fetchSubscription();
//       fetchPendingChange();
//     } else {
//       setLoading(false);
//     }
//   }, [token]);

//   const fetchSubscription = async () => {
//     try {
//       const response = await api.get("/subscriptions/me",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setSubscription(response.data);
//     } catch (error) {
//       console.error("Failed to fetch subscription:", error);
//       setSubscription({ plan: "FREE", status: "ACTIVE" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPendingChange = async () => {
//     try {
//       const response = await api.get("/subscriptions/pending-change",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setPendingChange(response.data);
//     } catch (error) {
//       console.error("Failed to fetch pending change:", error);
//     }
//   };

//   const handleActivatePlan = async (planId) => {
//     setActivatingPlan(planId);
//     try {
//       const response = await api.post(
//         "/subscriptions/create-checkout-session",
//         { planId },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       const data = response.data;
      
//       // If user has existing subscription, redirect to customer portal
//       if (data.requiresPortal) {
//         const confirmChange = window.confirm(
//           `You already have a ${data.currentPlan} plan.\n\n` +
//           `You will be redirected to Stripe's secure customer portal where you can:\n` +
//           `• Change your plan (prorated charges applied automatically)\n` +
//           `• Update payment method\n` +
//           `• Cancel subscription\n\n` +
//           `Click OK to continue.`
//         );
        
//         if (confirmChange && data.url) {
//           window.location.href = data.url;
//         }
//       } else if (data.url) {
//         // New subscription - redirect to Stripe checkout
//         window.location.href = data.url;
//       } else {
//         throw new Error('No URL received');
//       }
//     } catch (error) {
//       console.error("Failed to activate plan:", error);
//       alert(error.response?.data?.error || "Could not initiate payment. Please try again.");
//     } finally {
//       setActivatingPlan(null);
//     }
//   };

//   const handlePlanChange = async (newPlanId) => {
//     try {
//       const response = await api.post(
//         "/subscriptions/handle-plan-change",
//         { newPlanId },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
      
//       if (response.data.type === 'upgrade') {
//         alert(`${response.data.message}\nCharged: $${response.data.prorationAmount}\nNew billing date: ${new Date(response.data.effectiveDate).toLocaleDateString()}`);
//         await fetchSubscription();
//       } else {
//         alert(`${response.data.message}\nEffective date: ${new Date(response.data.effectiveDate).toLocaleDateString()}`);
//         await fetchPendingChange();
//       }
//     } catch (error) {
//       alert(error.response?.data?.error || "Failed to change plan");
//     }
//   };

//   const handleCancelSubscription = async () => {
//     try {
//       await api.post("/subscriptions/cancel", {});
//       await fetchSubscription();
//       setShowCancelConfirm(false);
//       alert("Subscription cancelled successfully");
//     } catch (error) {
//       console.error("Failed to cancel subscription:", error);
//       alert("Failed to cancel subscription");
//     }
//   };

//   const handleChangePlan = async (newPlanId) => {
//     setChangingPlan(true);
//     try {
//       const response = await api.post("/subscriptions/change-plan", { newPlanId });
//       const data = response.data;
      
//       if (data.requiresProratedPayment) {
//         // Show proration details before redirecting
//         const confirmMessage = 
//           `💡 Plan Upgrade Details:\n\n` +
//           `Current Plan: Monthly ($${data.proration.monthlyPrice}/month)\n` +
//           `New Plan: Yearly ($${data.proration.yearlyPrice}/year)\n\n` +
//           `You've already paid for part of your current month.\n` +
//           `Remaining value: $${data.proration.remainingValue}\n` +
//           `Amount to pay today: $${data.proration.amountToCharge}\n\n` +
//           `You will be redirected to Stripe to complete the payment.\n` +
//           `Click OK to continue.`;
        
//         const confirm = window.confirm(confirmMessage);
        
//         if (confirm) {
//           // Create prorated checkout session
//           const checkoutResponse = await api.post("/subscriptions/create-checkout-session", { 
//             planId: newPlanId 
//           });
          
//           if (checkoutResponse.data.url) {
//             window.location.href = checkoutResponse.data.url;
//           }
//         }
//       } else if (data.requiresPortal) {
//         alert(`You will be redirected to manage your subscription.`);
//         // Create portal session or handle downgrade
//       } else {
//         alert(data.message || "Plan change processed successfully");
//         await fetchSubscription();
//       }
//     } catch (error) {
//       console.error("Failed to change plan:", error);
//       alert(error.response?.data?.error || "Failed to change plan");
//     } finally {
//       setChangingPlan(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const plans = [
//     {
//       id: "free",
//       name: "Free",
//       price: 0,
//       period: "forever",
//       description: "Perfect for getting started",
//       features: [
//         "Basic lessons access (10 lessons)",
//         "Limited quizzes (5 per week)",
//         "Basic progress tracking",
//         "Community support",
//         "1 device only",
//         "Standard response time (48h)"
//       ],
//       icon: "🎓",
//       color: "#64748b",
//       borderColor: "#e2e8f0",
//       buttonText: "Current Plan",
//       buttonClass: "current",
//       popular: false,
//       badge: null
//     },
//     {
//       id: "monthly",
//       name: "Premium Monthly",
//       price: 9.99,
//       period: "month",
//       originalPrice: 12.99,
//       description: "Most flexible option",
//       features: [
//         "Full lesson library access (50+ lessons)",
//         "Unlimited quizzes",
//         "Advanced progress analytics",
//         "Priority email support",
//         "All achievement badges",
//         "Streak recovery",
//         "Up to 3 devices"
//       ],
//       icon: "💎",
//       color: "#3b82f6",
//       borderColor: "#3b82f6",
//       buttonText: "Activate Monthly",
//       buttonClass: "primary",
//       popular: false,
//       badge: null
//     },
//     {
//       id: "yearly",
//       name: "Premium Yearly",
//       price: 89.99,
//       period: "year",
//       originalPrice: 155.88,
//       description: "Best value • Save 42%",
//       features: [
//         "All Monthly features",
//         "2 months free",
//         "Exclusive content library",
//         "Early access to new features",
//         "Certificate of completion",
//         "Premium support 24/7",
//         "Unlimited devices",
//         "Downloadable materials"
//       ],
//       icon: "👑",
//       color: "#8b5cf6",
//       borderColor: "#8b5cf6",
//       buttonText: "Activate Yearly",
//       buttonClass: "featured",
//       popular: true,
//       badge: "🔥 Most Popular"
//     },
//     {
//       id: "lifetime",
//       name: "Lifetime Premium",
//       price: 299.99,
//       period: "one-time",
//       description: "Best long-term investment",
//       features: [
//         "All Yearly features",
//         "Lifetime access",
//         "All future updates included",
//         "Priority VIP support",
//         "Custom learning path",
//         "Lifetime certificate",
//         "Exclusive lifetime badge",
//         "1-on-1 coaching session"
//       ],
//       icon: "🌟",
//       color: "#f59e0b",
//       borderColor: "#f59e0b",
//       buttonText: "Activate Lifetime",
//       buttonClass: "premium",
//       popular: false,
//       badge: "✨ Best Value"
//     }
//   ];

//   const currentPlan = plans.find(p => p.id.toLowerCase() === subscription?.plan?.toLowerCase()) || plans[0];
//   const isPremium = subscription?.plan !== "FREE";

//   if (loading) {
//     return (
//       <div className="subscription-container-modern">
//         <div className="loading-spinner">
//           <div className="spinner"></div>
//           <p>Loading subscription details...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="subscription-container-modern">
//       {/* Hero Section */}
//       <div className="subscription-hero">
//         <button className="back-button-hero" onClick={() => navigate(-1)}>
//           ← Back
//         </button>
//         <div className="hero-content">
//           <span className="hero-badge">SIGNBRIDGE PREMIUM</span>
//           <h1 className="hero-title">
//             Unlock Your Full<br />Learning Potential
//           </h1>
//           <p className="hero-subtitle">
//             Get unlimited access to all lessons, advanced analytics, and premium features.
//             Start your journey to sign language fluency today.
//           </p>
//         </div>
//       </div>

//       {/* Current Plan Section */}
//       {isPremium && (
//         <div className="current-plan-section">
//           <div className="current-plan-card" style={{ borderColor: currentPlan.color }}>
//             <div className="current-plan-header">
//               <div className="current-plan-icon">{currentPlan.icon}</div>
//               <div className="current-plan-info">
//                 <div className="current-plan-status" style={{ background: currentPlan.color }}>
//                   ACTIVE PLAN
//                 </div>
//                 <h2>{currentPlan.name}</h2>
//                 {subscription?.endDate && (
//                   <p>Renews on {formatDate(subscription.endDate)}</p>
//                 )}
//               </div>
//             </div>
//             <div className="current-plan-features">
//               {currentPlan.features.slice(0, 4).map((feature, i) => (
//                 <span key={i}>{feature}</span>
//               ))}
//             </div>
            
//             {/* Plan Change Section */}
//             {subscription?.plan !== "LIFETIME" && (
//               <div className="change-plan-section">
//                 <h4>Change Plan</h4>
                
//                 {pendingChange?.hasPendingChange ? (
//                   <div className="pending-change-card">
//                     <p>⚠️ Your plan will change to <strong>{pendingChange.newPlan}</strong> on <strong>{new Date(pendingChange.effectiveDate).toLocaleDateString()}</strong></p>
//                   </div>
//                 ) : (
//                   <div className="change-plan-buttons">
//                     {subscription?.plan !== "MONTHLY" && (
//                       <button 
//                         className="change-plan-btn"
//                         onClick={() => {
//                           setSelectedNewPlan('monthly');
//                           setShowPlanChangeModal(true);
//                         }}
//                       >
//                         Switch to Monthly
//                         <small>Changes take effect next billing cycle</small>
//                       </button>
//                     )}
//                     {subscription?.plan !== "YEARLY" && (
//                       <button 
//                         className="change-plan-btn upgrade"
//                         onClick={() => {
//                           setSelectedNewPlan('yearly');
//                           setShowPlanChangeModal(true);
//                         }}
//                       >
//                         Switch to Yearly
//                         <small>Save 42% • Charged prorated difference</small>
//                       </button>
//                     )}
//                   </div>
//                 )}
                
//                 <p className="change-plan-note">
//                   {subscription?.plan === "MONTHLY" 
//                     ? "💡 Upgrade to Yearly and get 2 months free! You'll be charged the prorated difference today."
//                     : "💡 Downgrade to Monthly. Changes take effect at next billing cycle with no refund."}
//                 </p>
//               </div>
//             )}
            
//             {/* Cancel Section */}
//             {subscription?.plan !== "LIFETIME" && (
//               <div className="cancel-section">
//                 {showCancelConfirm ? (
//                   <div className="cancel-confirm-card">
//                     <p>Are you sure you want to cancel your subscription?</p>
//                     <div className="cancel-buttons">
//                       <button className="cancel-no" onClick={() => setShowCancelConfirm(false)}>
//                         Keep Premium
//                       </button>
//                       <button className="cancel-yes" onClick={handleCancelSubscription}>
//                         Yes, Cancel
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <button className="cancel-subscription-btn" onClick={() => setShowCancelConfirm(true)}>
//                     Cancel Subscription
//                   </button>
//                 )}
//               </div>
//             )}
            
//             {subscription?.plan === "LIFETIME" && (
//               <div className="lifetime-badge">
//                 🌟 Lifetime Access - Never expires!
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Pricing Cards - Show for non-premium users */}
//       {!isPremium && (
//         <div className="pricing-section">
//           <div className="section-header">
//             <h2>Choose Your Plan</h2>
//             <p>Flexible options to fit your learning journey</p>
//           </div>

//           <div className="pricing-grid-4">
//             {plans.map((plan) => {
//               const isCurrentPlan = plan.id === currentPlan.id && isPremium;
//               const isDisabled = isCurrentPlan;
              
//               return (
//                 <div
//                   key={plan.id}
//                   className={`pricing-card-modern ${plan.popular ? 'popular' : ''}`}
//                   style={{
//                     '--plan-color': plan.color,
//                     '--plan-border': plan.borderColor
//                   }}
//                 >
//                   {plan.badge && (
//                     <div className="plan-badge" style={{ background: plan.color }}>
//                       {plan.badge}
//                     </div>
//                   )}
                  
//                   <div className="plan-header-modern">
//                     <div className="plan-icon-modern" style={{ background: `${plan.color}15` }}>
//                       {plan.icon}
//                     </div>
//                     <h3>{plan.name}</h3>
//                     <div className="plan-price-modern">
//                       {plan.originalPrice && (
//                         <span className="original-price">${plan.originalPrice}</span>
//                       )}
//                       <span className="price">${plan.price}</span>
//                       <span className="period">/{plan.period}</span>
//                     </div>
//                     <p className="plan-description-modern">{plan.description}</p>
//                     {plan.originalPrice && (
//                       <div className="savings-badge-modern">
//                         Save ${(plan.originalPrice - plan.price).toFixed(2)}
//                       </div>
//                     )}
//                   </div>

//                   <div className="plan-features-modern">
//                     {plan.features.map((feature, i) => (
//                       <div key={i} className="feature-item-modern">
//                         <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
//                           <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                         </svg>
//                         <span>{feature}</span>
//                       </div>
//                     ))}
//                   </div>

//                   <button
//                     className={`activate-button ${plan.buttonClass}`}
//                     style={{
//                       background: plan.color,
//                       cursor: 'pointer',
//                     }}
//                     onClick={() => handleActivatePlan(plan.id)}
//                     disabled={activatingPlan === plan.id}
//                   >
//                     {activatingPlan === plan.id ? (
//                       <span className="activating-spinner"></span>
//                     ) : (
//                       plan.buttonText
//                     )}
//                   </button>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* Plan Change Modal */}
//       {showPlanChangeModal && selectedNewPlan && (
//         <div className="modal-overlay" onClick={() => setShowPlanChangeModal(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <h3>Confirm Plan Change</h3>
//             <p>Are you sure you want to switch to <strong>{selectedNewPlan.toUpperCase()}</strong> plan?</p>
//             {selectedNewPlan === 'yearly' && (
//               <p className="upgrade-note">✨ You'll be charged the prorated difference today.</p>
//             )}
//             {selectedNewPlan === 'monthly' && (
//               <p className="downgrade-note">⚠️ Your plan will change at the end of your current billing cycle. No refund for remaining time.</p>
//             )}
//             <div className="modal-buttons">
//               <button className="modal-cancel" onClick={() => setShowPlanChangeModal(false)}>
//                 Cancel
//               </button>
//               <button 
//                 className="modal-confirm"
//                 onClick={() => handleChangePlan(selectedNewPlan)}
//                 disabled={changingPlan}
//               >
//                 {changingPlan ? "Processing..." : "Confirm Change"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Features Comparison */}
//       <div className="features-section">
//         <div className="section-header">
//           <h2>Compare All Features</h2>
//           <p>Everything you need to master sign language</p>
//         </div>

//         <div className="comparison-table">
//           <div className="comparison-header">
//             <div className="comparison-cell feature-name">Features</div>
//             <div className="comparison-cell">Free</div>
//             <div className="comparison-cell">Premium Monthly</div>
//             <div className="comparison-cell">Premium Yearly</div>
//             <div className="comparison-cell">Lifetime</div>
//           </div>
          
//           {[
//             { name: "Lesson Library Access", free: "10 lessons", monthly: "50+ lessons", yearly: "All lessons", lifetime: "All lessons" },
//             { name: "Weekly Quizzes", free: "5 per week", monthly: "Unlimited", yearly: "Unlimited", lifetime: "Unlimited" },
//             { name: "Progress Analytics", free: "Basic", monthly: "Advanced", yearly: "Advanced", lifetime: "Advanced" },
//             { name: "Achievement Badges", free: "Limited", monthly: "All badges", yearly: "All badges", lifetime: "All badges" },
//             { name: "Certificate of Completion", free: "❌", monthly: "❌", yearly: "✅", lifetime: "✅" },
//             { name: "Priority Support", free: "48h", monthly: "24h", yearly: "24/7", lifetime: "VIP 24/7" },
//             { name: "Downloadable Materials", free: "❌", monthly: "❌", yearly: "✅", lifetime: "✅" },
//             { name: "Multi-device Sync", free: "1", monthly: "3", yearly: "Unlimited", lifetime: "Unlimited" },
//             { name: "Exclusive Content", free: "❌", monthly: "❌", yearly: "✅", lifetime: "✅" },
//             { name: "Future Updates", free: "Basic", monthly: "Basic", yearly: "Standard", lifetime: "All updates" },
//             { name: "1-on-1 Coaching", free: "❌", monthly: "❌", yearly: "❌", lifetime: "✅" }
//           ].map((feature, i) => (
//             <div key={i} className="comparison-row">
//               <div className="comparison-cell feature-name">{feature.name}</div>
//               <div className="comparison-cell free-value">{feature.free}</div>
//               <div className="comparison-cell monthly-value">{feature.monthly}</div>
//               <div className="comparison-cell yearly-value">{feature.yearly}</div>
//               <div className="comparison-cell lifetime-value">{feature.lifetime}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Testimonials Section */}
//       <div className="testimonials-section">
//         <div className="section-header">
//           <h2>Trusted by Language Learners</h2>
//           <p>Join thousands of satisfied users</p>
//         </div>

//         <div className="testimonials-grid">
//           <div className="testimonial-card">
//             <div className="testimonial-stars">★★★★★</div>
//             <p>"The premium features transformed my learning experience. The unlimited quizzes and detailed analytics helped me improve faster than ever!"</p>
//             <div className="testimonial-author">
//               <strong>Sarah Johnson</strong>
//               <span>Premium Yearly Member</span>
//             </div>
//           </div>
//           <div className="testimonial-card">
//             <div className="testimonial-stars">★★★★★</div>
//             <p>"Best investment in my education. The lifetime plan is worth every penny. The certificate and exclusive content are game-changers."</p>
//             <div className="testimonial-author">
//               <strong>Michael Chen</strong>
//               <span>Lifetime Member</span>
//             </div>
//           </div>
//           <div className="testimonial-card">
//             <div className="testimonial-stars">★★★★★</div>
//             <p>"Monthly plan is perfect for my budget. I love the flexibility and the content is amazing!"</p>
//             <div className="testimonial-author">
//               <strong>Emily Rodriguez</strong>
//               <span>Premium Monthly Member</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* FAQ Section */}
//       <div className="faq-section-modern">
//         <div className="section-header">
//           <h2>Frequently Asked Questions</h2>
//           <p>Everything you need to know</p>
//         </div>

//         <div className="faq-grid-modern">
//           <div className="faq-item-modern">
//             <div className="faq-question-modern">Can I cancel anytime?</div>
//             <div className="faq-answer-modern">Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.</div>
//           </div>
//           <div className="faq-item-modern">
//             <div className="faq-question-modern">What payment methods are accepted?</div>
//             <div className="faq-answer-modern">We accept all major credit cards, PayPal, Apple Pay, and Google Pay.</div>
//           </div>
//           <div className="faq-item-modern">
//             <div className="faq-question-modern">Is there a money-back guarantee?</div>
//             <div className="faq-answer-modern">Yes, all paid plans come with a 30-day money-back guarantee.</div>
//           </div>
//           <div className="faq-item-modern">
//             <div className="faq-question-modern">Can I switch between plans?</div>
//             <div className="faq-answer-modern">Absolutely! Upgrades take effect immediately with prorated charges. Downgrades take effect at the next billing cycle.</div>
//           </div>
//           <div className="faq-item-modern">
//             <div className="faq-question-modern">What happens after Lifetime purchase?</div>
//             <div className="faq-answer-modern">You get unlimited access forever, including all future updates and features.</div>
//           </div>
//           <div className="faq-item-modern">
//             <div className="faq-question-modern">Is there a free trial?</div>
//             <div className="faq-answer-modern">Yes, we offer a 7-day free trial for all annual plans.</div>
//           </div>
//         </div>
//       </div>

//       {/* Trust Badges */}
//       <div className="trust-badges-modern">
//         <div className="trust-badge">
//           <span className="trust-icon">🔒</span>
//           <div>
//             <strong>Secure Payment</strong>
//             <p>256-bit SSL encryption</p>
//           </div>
//         </div>
//         <div className="trust-badge">
//           <span className="trust-icon">💳</span>
//           <div>
//             <strong>Cancel Anytime</strong>
//             <p>No hidden fees</p>
//           </div>
//         </div>
//         <div className="trust-badge">
//           <span className="trust-icon">⭐</span>
//           <div>
//             <strong>30-Day Guarantee</strong>
//             <p>Full refund if not satisfied</p>
//           </div>
//         </div>
//         <div className="trust-badge">
//           <span className="trust-icon">💬</span>
//           <div>
//             <strong>24/7 Support</strong>
//             <p>Priority assistance</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Subscription;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "../styles/Subscription.css";

const Subscription = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [activatingPlan, setActivatingPlan] = useState(null);
  const [pendingChange, setPendingChange] = useState(null);

  useEffect(() => {
    if (token) {
      fetchSubscription();
      fetchPendingChange();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchSubscription = async () => {
    try {
      const response = await api.get("/subscriptions/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscription(response.data);
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
      // Set default free subscription on error
      setSubscription({ plan: "FREE", status: "ACTIVE" });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingChange = async () => {
    try {
      const response = await api.get("/subscriptions/pending-change",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingChange(response.data);
    } catch (error) {
      console.error("Failed to fetch pending change:", error);
      // Don't show error to user, just set pendingChange to null
      setPendingChange(null);
    }
  };

  const handleActivatePlan = async (planId) => {
    console.log("🚀 Activating plan:", planId);
    setActivatingPlan(planId);
    
    try {
      const response = await api.post("/subscriptions/create-checkout-session", { planId });
      console.log("Response:", response.data);
      
      if (response.data.url) {
        console.log("Redirecting to:", response.data.url);
        window.location.href = response.data.url;
      } else {
        throw new Error("No URL received");
      }
    } catch (error) {
      console.error("Failed to activate plan:", error);
      const errorMessage = error.response?.data?.error || error.message || "Could not initiate payment";
      alert(errorMessage);
    } finally {
      setActivatingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await api.post("/subscriptions/cancel", {});
      await fetchSubscription();
      setShowCancelConfirm(false);
      alert("Subscription cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      alert("Failed to cancel subscription");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Basic lessons access (10 lessons)",
        "Limited quizzes (5 per week)",
        "Basic progress tracking",
        "Community support",
        "1 device only",
        "Standard response time (48h)"
      ],
      icon: "🎓",
      color: "#64748b",
      borderColor: "#e2e8f0",
      buttonText: "Current Plan",
      buttonClass: "current",
      popular: false,
      badge: null
    },
    {
      id: "monthly",
      name: "Premium Monthly",
      price: 9.99,
      period: "month",
      originalPrice: 12.99,
      description: "Most flexible option",
      features: [
        "Full lesson library access (50+ lessons)",
        "Unlimited quizzes",
        "Advanced progress analytics",
        "Priority email support",
        "All achievement badges",
        "Streak recovery",
        "Up to 3 devices"
      ],
      icon: "💎",
      color: "#3b82f6",
      borderColor: "#3b82f6",
      buttonText: "Activate Monthly",
      buttonClass: "primary",
      popular: false,
      badge: null
    },
    {
      id: "yearly",
      name: "Premium Yearly",
      price: 89.99,
      period: "year",
      originalPrice: 155.88,
      description: "Best value • Save 42%",
      features: [
        "All Monthly features",
        "2 months free",
        "Exclusive content library",
        "Early access to new features",
        "Certificate of completion",
        "Premium support 24/7",
        "Unlimited devices",
        "Downloadable materials"
      ],
      icon: "👑",
      color: "#8b5cf6",
      borderColor: "#8b5cf6",
      buttonText: "Activate Yearly",
      buttonClass: "featured",
      popular: true,
      badge: "🔥 Most Popular"
    },
    {
      id: "lifetime",
      name: "Lifetime Premium",
      price: 299.99,
      period: "one-time",
      description: "Best long-term investment",
      features: [
        "All Yearly features",
        "Lifetime access",
        "All future updates included",
        "Priority VIP support",
        "Custom learning path",
        "Lifetime certificate",
        "Exclusive lifetime badge",
        "1-on-1 coaching session"
      ],
      icon: "🌟",
      color: "#f59e0b",
      borderColor: "#f59e0b",
      buttonText: "Activate Lifetime",
      buttonClass: "premium",
      popular: false,
      badge: "✨ Best Value"
    }
  ];

  // Safely get current plan with fallback
  const currentPlanId = subscription?.plan?.toLowerCase() || "free";
  const currentPlan = plans.find(p => p.id === currentPlanId) || plans[0];
  const isPremium = subscription?.plan !== "FREE" && subscription?.plan !== undefined;

  if (loading) {
    return (
      <div className="subscription-container-modern">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-container-modern">
      {/* Hero Section */}
      <div className="subscription-hero">
        <button className="back-button-hero" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="hero-content">
          <span className="hero-badge">SIGNBRIDGE PREMIUM</span>
          <h1 className="hero-title">
            Unlock Your Full<br />Learning Potential
          </h1>
          <p className="hero-subtitle">
            Get unlimited access to all lessons, advanced analytics, and premium features.
            Start your journey to sign language fluency today.
          </p>
        </div>
      </div>

      {/* Current Plan Section - Only show if user has subscription data */}
      {subscription && isPremium && (
        <div className="current-plan-section">
          <div className="current-plan-card" style={{ borderColor: currentPlan.color }}>
            <div className="current-plan-header">
              <div className="current-plan-icon">{currentPlan.icon}</div>
              <div className="current-plan-info">
                <div className="current-plan-status" style={{ background: currentPlan.color }}>
                  ACTIVE PLAN
                </div>
                <h2>{currentPlan.name}</h2>
                {subscription?.endDate && (
                  <p>Renews on {formatDate(subscription.endDate)}</p>
                )}
              </div>
            </div>
            <div className="current-plan-features">
              {currentPlan.features.slice(0, 4).map((feature, i) => (
                <span key={i}>{feature}</span>
              ))}
            </div>
            
            {/* Plan Change Section */}
            {subscription?.plan !== "LIFETIME" && (
              <div className="change-plan-section">
                <h4>Change Plan</h4>
                
                {pendingChange?.hasPendingChange ? (
                  <div className="pending-change-card">
                    <p>⚠️ Your plan will change to <strong>{pendingChange.newPlan}</strong> on <strong>{new Date(pendingChange.effectiveDate).toLocaleDateString()}</strong></p>
                  </div>
                ) : (
                  <div className="change-plan-buttons">
                    {subscription?.plan !== "MONTHLY" && (
                      <button 
                        className="change-plan-btn"
                        onClick={() => handleActivatePlan('monthly')}
                        disabled={activatingPlan === 'monthly'}
                      >
                        {activatingPlan === 'monthly' ? 'Processing...' : 'Switch to Monthly'}
                        <small>Changes take effect next billing cycle</small>
                      </button>
                    )}
                    {subscription?.plan !== "YEARLY" && (
                      <button 
                        className="change-plan-btn upgrade"
                        onClick={() => handleActivatePlan('yearly')}  // This calls the checkout
                        disabled={activatingPlan === 'yearly'}
                      >
                        {activatingPlan === 'yearly' ? 'Processing...' : 'Switch to Yearly'}
                        <small>Save 42% • You'll be charged the prorated difference</small>
                      </button>
                    )}
                  </div>
                )}
                
                <p className="change-plan-note">
                  {subscription?.plan === "MONTHLY" 
                    ? "💡 Upgrade to Yearly and get 2 months free! You'll be charged the prorated difference today."
                    : "💡 Downgrade to Monthly. Changes take effect at next billing cycle with no refund."}
                </p>
              </div>
            )}
            
            {/* Cancel Section */}
            {subscription?.plan !== "LIFETIME" && (
              <div className="cancel-section">
                {showCancelConfirm ? (
                  <div className="cancel-confirm-card">
                    <p>Are you sure you want to cancel your subscription?</p>
                    <div className="cancel-buttons">
                      <button className="cancel-no" onClick={() => setShowCancelConfirm(false)}>
                        Keep Premium
                      </button>
                      <button className="cancel-yes" onClick={handleCancelSubscription}>
                        Yes, Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="cancel-subscription-btn" onClick={() => setShowCancelConfirm(true)}>
                    Cancel Subscription
                  </button>
                )}
              </div>
            )}
            
            {subscription?.plan === "LIFETIME" && (
              <div className="lifetime-badge">
                🌟 Lifetime Access - Never expires!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pricing Cards - Show for non-premium users OR when loading */}
      {(!isPremium || !subscription) && (
        <div className="pricing-section">
          <div className="section-header">
            <h2>Choose Your Plan</h2>
            <p>Flexible options to fit your learning journey</p>
          </div>

          <div className="pricing-grid-4">
            {plans.map((plan) => {
              // Skip showing free plan if user already has premium
              if (isPremium && plan.id === "free") return null;
              
              return (
                <div
                  key={plan.id}
                  className={`pricing-card-modern ${plan.popular ? 'popular' : ''}`}
                  style={{
                    '--plan-color': plan.color,
                    '--plan-border': plan.borderColor
                  }}
                >
                  {plan.badge && (
                    <div className="plan-badge" style={{ background: plan.color }}>
                      {plan.badge}
                    </div>
                  )}
                  
                  <div className="plan-header-modern">
                    <div className="plan-icon-modern" style={{ background: `${plan.color}15` }}>
                      {plan.icon}
                    </div>
                    <h3>{plan.name}</h3>
                    <div className="plan-price-modern">
                      {plan.originalPrice && (
                        <span className="original-price">${plan.originalPrice}</span>
                      )}
                      <span className="price">${plan.price}</span>
                      <span className="period">/{plan.period}</span>
                    </div>
                    <p className="plan-description-modern">{plan.description}</p>
                    {plan.originalPrice && (
                      <div className="savings-badge-modern">
                        Save ${(plan.originalPrice - plan.price).toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div className="plan-features-modern">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="feature-item-modern">
                        <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`activate-button ${plan.buttonClass}`}
                    style={{
                      background: plan.color,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleActivatePlan(plan.id)}
                    disabled={activatingPlan === plan.id}
                  >
                    {activatingPlan === plan.id ? (
                      <span className="activating-spinner"></span>
                    ) : (
                      plan.buttonText
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Features Comparison */}
      <div className="features-section">
        <div className="section-header">
          <h2>Compare All Features</h2>
          <p>Everything you need to master sign language</p>
        </div>

        <div className="comparison-table">
          <div className="comparison-header">
            <div className="comparison-cell feature-name">Features</div>
            <div className="comparison-cell">Free</div>
            <div className="comparison-cell">Premium Monthly</div>
            <div className="comparison-cell">Premium Yearly</div>
            <div className="comparison-cell">Lifetime</div>
          </div>
          
          {[
            { name: "Lesson Library Access", free: "10 lessons", monthly: "50+ lessons", yearly: "All lessons", lifetime: "All lessons" },
            { name: "Weekly Quizzes", free: "5 per week", monthly: "Unlimited", yearly: "Unlimited", lifetime: "Unlimited" },
            { name: "Progress Analytics", free: "Basic", monthly: "Advanced", yearly: "Advanced", lifetime: "Advanced" },
            { name: "Achievement Badges", free: "Limited", monthly: "All badges", yearly: "All badges", lifetime: "All badges" },
            { name: "Certificate of Completion", free: "❌", monthly: "❌", yearly: "✅", lifetime: "✅" },
            { name: "Priority Support", free: "48h", monthly: "24h", yearly: "24/7", lifetime: "VIP 24/7" },
            { name: "Downloadable Materials", free: "❌", monthly: "❌", yearly: "✅", lifetime: "✅" },
            { name: "Multi-device Sync", free: "1", monthly: "3", yearly: "Unlimited", lifetime: "Unlimited" },
            { name: "Exclusive Content", free: "❌", monthly: "❌", yearly: "✅", lifetime: "✅" },
            { name: "Future Updates", free: "Basic", monthly: "Basic", yearly: "Standard", lifetime: "All updates" },
            { name: "1-on-1 Coaching", free: "❌", monthly: "❌", yearly: "❌", lifetime: "✅" }
          ].map((feature, i) => (
            <div key={i} className="comparison-row">
              <div className="comparison-cell feature-name">{feature.name}</div>
              <div className="comparison-cell free-value">{feature.free}</div>
              <div className="comparison-cell monthly-value">{feature.monthly}</div>
              <div className="comparison-cell yearly-value">{feature.yearly}</div>
              <div className="comparison-cell lifetime-value">{feature.lifetime}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="testimonials-section">
        <div className="section-header">
          <h2>Trusted by Language Learners</h2>
          <p>Join thousands of satisfied users</p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p>"The premium features transformed my learning experience. The unlimited quizzes and detailed analytics helped me improve faster than ever!"</p>
            <div className="testimonial-author">
              <strong>Sarah Johnson</strong>
              <span>Premium Yearly Member</span>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p>"Best investment in my education. The lifetime plan is worth every penny. The certificate and exclusive content are game-changers."</p>
            <div className="testimonial-author">
              <strong>Michael Chen</strong>
              <span>Lifetime Member</span>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p>"Monthly plan is perfect for my budget. I love the flexibility and the content is amazing!"</p>
            <div className="testimonial-author">
              <strong>Emily Rodriguez</strong>
              <span>Premium Monthly Member</span>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section-modern">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know</p>
        </div>

        <div className="faq-grid-modern">
          <div className="faq-item-modern">
            <div className="faq-question-modern">Can I cancel anytime?</div>
            <div className="faq-answer-modern">Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.</div>
          </div>
          <div className="faq-item-modern">
            <div className="faq-question-modern">What payment methods are accepted?</div>
            <div className="faq-answer-modern">We accept all major credit cards, PayPal, Apple Pay, and Google Pay.</div>
          </div>
          <div className="faq-item-modern">
            <div className="faq-question-modern">Is there a money-back guarantee?</div>
            <div className="faq-answer-modern">Yes, all paid plans come with a 30-day money-back guarantee.</div>
          </div>
          <div className="faq-item-modern">
            <div className="faq-question-modern">Can I switch between plans?</div>
            <div className="faq-answer-modern">Absolutely! Upgrades take effect immediately with prorated charges. Downgrades take effect at the next billing cycle.</div>
          </div>
          <div className="faq-item-modern">
            <div className="faq-question-modern">What happens after Lifetime purchase?</div>
            <div className="faq-answer-modern">You get unlimited access forever, including all future updates and features.</div>
          </div>
          <div className="faq-item-modern">
            <div className="faq-question-modern">Is there a free trial?</div>
            <div className="faq-answer-modern">Yes, we offer a 7-day free trial for all annual plans.</div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="trust-badges-modern">
        <div className="trust-badge">
          <span className="trust-icon">🔒</span>
          <div>
            <strong>Secure Payment</strong>
            <p>256-bit SSL encryption</p>
          </div>
        </div>
        <div className="trust-badge">
          <span className="trust-icon">💳</span>
          <div>
            <strong>Cancel Anytime</strong>
            <p>No hidden fees</p>
          </div>
        </div>
        <div className="trust-badge">
          <span className="trust-icon">⭐</span>
          <div>
            <strong>30-Day Guarantee</strong>
            <p>Full refund if not satisfied</p>
          </div>
        </div>
        <div className="trust-badge">
          <span className="trust-icon">💬</span>
          <div>
            <strong>24/7 Support</strong>
            <p>Priority assistance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;