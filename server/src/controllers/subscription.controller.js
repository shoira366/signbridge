const prisma = require("../config/prisma.config");
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Get current user's subscription
exports.getMySubscription = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });
    
    if (!subscription) {
      const newSubscription = await prisma.subscription.create({
        data: {
          userId,
          plan: "FREE",
          status: "ACTIVE",
          startDate: new Date(),
        },
      });
      return res.json(newSubscription);
    }
    
    res.json(subscription);
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
};

// Create checkout session - Handles NEW subscriptions and UPGRADES
exports.createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { planId } = req.body;
    
    console.log(`📝 Creating checkout for user ${userId} with plan: ${planId}`);
    
    if (!planId || !['monthly', 'yearly', 'lifetime'].includes(planId)) {
      return res.status(400).json({ error: "Invalid plan selected" });
    }
    
    // Check if user already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
    });
    
    // CASE 1: User has MONTHLY and wants to upgrade to YEARLY
    if (existingSubscription && existingSubscription.plan === 'MONTHLY' && planId === 'yearly') {
      console.log(`🔄 UPGRADE: Monthly -> Yearly for user ${userId}`);
      
      try {
        // Get Stripe subscription details
        const stripeSubscription = await stripe.subscriptions.retrieve(existingSubscription.stripeSubscriptionId);
        
        // Calculate proration
        const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
        const currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
        const now = new Date();
        
        const totalDays = Math.ceil((currentPeriodEnd - currentPeriodStart) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.ceil((currentPeriodEnd - now) / (1000 * 60 * 60 * 24));
        
        const monthlyPrice = 9.99;
        const yearlyPrice = 89.99;
        const remainingPercentage = daysRemaining / totalDays;
        const remainingValue = monthlyPrice * remainingPercentage;
        let amountToCharge = yearlyPrice - remainingValue;
        
        if (isNaN(amountToCharge) || amountToCharge < 0) {
          amountToCharge = 80.00;
        }
        
        const amountInCents = Math.round(amountToCharge * 100);
        
        console.log(`💰 Proration: Monthly $${monthlyPrice} -> Yearly $${yearlyPrice}`);
        console.log(`   Days remaining: ${daysRemaining}/${totalDays}`);
        console.log(`   Remaining value: $${remainingValue.toFixed(2)}`);
        console.log(`   Amount to charge: $${amountToCharge.toFixed(2)}`);
        
        // Create ONE-TIME payment checkout for the prorated amount
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Upgrade to Yearly Plan',
                  description: `Upgrade from Monthly to Yearly\n\nOriginal Yearly price: $${yearlyPrice}\nCredit from current month: $${remainingValue.toFixed(2)}\n\nTotal to pay today: $${amountToCharge.toFixed(2)}`,
                },
                unit_amount: amountInCents,
              },
              quantity: 1,
            },
          ],
          success_url: `${process.env.CLIENT_URL}/subscription?upgrade_success=true`,
          cancel_url: `${process.env.CLIENT_URL}/subscription?upgrade_canceled=true`,
          metadata: {
            userId: userId.toString(),
            type: 'upgrade',
            fromPlan: 'monthly',
            toPlan: 'yearly',
            oldSubscriptionId: existingSubscription.stripeSubscriptionId,
            oldCustomerId: existingSubscription.stripeCustomerId,
            proratedAmount: amountToCharge.toFixed(2),
          },
          customer: existingSubscription.stripeCustomerId,
          customer_email: req.user.email,
        });
        
        console.log(`✅ Prorated checkout created: ${session.url}`);
        return res.json({ url: session.url });
        
      } catch (error) {
        console.error("Upgrade error:", error);
        return res.status(500).json({ error: "Failed to process upgrade. Please try again." });
      }
    }
    
    // CASE 2: User already has the same plan
    if (existingSubscription && existingSubscription.plan === planId.toUpperCase()) {
      return res.status(400).json({ 
        error: `You are already on the ${existingSubscription.plan} plan.` 
      });
    }
    
    // CASE 3: User has YEARLY and wants something else
    if (existingSubscription && existingSubscription.plan !== 'FREE') {
      return res.status(400).json({ 
        error: `You have a ${existingSubscription.plan} plan. Please contact support to change plans.` 
      });
    }
    
    // CASE 4: NEW user - regular checkout
    const priceIds = {
      monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_YEARLY_PRICE_ID,
      lifetime: process.env.STRIPE_LIFETIME_PRICE_ID
    };
    
    const priceId = priceIds[planId];
    if (!priceId) {
      return res.status(400).json({ error: "Price ID not configured" });
    }
    
    const mode = planId === 'lifetime' ? 'payment' : 'subscription';
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });
    
    const session = await stripe.checkout.sessions.create({
      mode: mode,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/subscription?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/subscription?canceled=true`,
      metadata: {
        userId: userId.toString(),
        planId: planId
      },
      customer_email: user?.email,
    });
    
    console.log(`✅ New checkout session created: ${session.url}`);
    res.json({ url: session.url });
    
  } catch (error) {
    console.error("Create checkout session error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const currentSub = await prisma.subscription.findUnique({
      where: { userId },
    });
    
    if (currentSub?.stripeSubscriptionId) {
      await stripe.subscriptions.update(currentSub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }
    
    const subscription = await prisma.subscription.update({
      where: { userId },
      data: {
        status: "CANCELLED",
        autoRenew: false,
      },
    });
    
    res.json({ message: "Subscription cancelled successfully", subscription });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
};

// Check premium access
exports.checkPremiumAccess = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { lessonId } = req.params;
    
    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(lessonId) },
      select: { isPremium: true },
    });
    
    if (!lesson?.isPremium) {
      return res.json({ hasAccess: true, isPremium: false });
    }
    
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });
    
    const hasAccess = subscription && 
                     subscription.status === "ACTIVE" && 
                     subscription.plan !== "FREE";
    
    res.json({ hasAccess, isPremium: true });
  } catch (error) {
    console.error("Check premium access error:", error);
    res.status(500).json({ error: "Failed to check access" });
  }
};

// Stripe Webhook Handler
exports.handleStripeWebhook = async (req, res) => {
  console.log("🔥 WEBHOOK RECEIVED");
  
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    if (session.metadata.type === 'upgrade') {
      const userId = parseInt(session.metadata.userId);
      const toPlan = session.metadata.toPlan;
      const oldSubscriptionId = session.metadata.oldSubscriptionId;
      
      console.log(`🔄 Processing upgrade for user ${userId} to ${toPlan}`);
      
      try {
        // Instead of creating a new subscription, UPDATE the existing one
        if (oldSubscriptionId) {
          const updatedSubscription = await stripe.subscriptions.update(
            oldSubscriptionId,
            {
              items: [{
                price: process.env.STRIPE_YEARLY_PRICE_ID,
              }],
              proration_behavior: 'none', // Already paid prorated amount
            }
          );
          
          const subscriptionItemId = updatedSubscription.items.data[0]?.id;
          let endDate = new Date();
          endDate.setFullYear(endDate.getFullYear() + 1);
          
          // Update database
          await prisma.subscription.update({
            where: { userId },
            data: {
              plan: "YEARLY",
              status: "ACTIVE",
              endDate: endDate,
              stripeSubscriptionId: updatedSubscription.id,
              stripeSubscriptionItemId: subscriptionItemId,
              autoRenew: true,
              updatedAt: new Date(),
            },
          });
          
          console.log(`✅ User ${userId} upgraded to YEARLY via subscription update`);
        }
        
        // Create notification
        await prisma.notification.create({
          data: {
            userId,
            title: "🎉 Plan Upgraded!",
            message: `Your plan has been upgraded to YEARLY. Your new billing date is ${new Date(endDate).toLocaleDateString()}.`,
            type: "SUBSCRIPTION",
          },
        });
        
      } catch (error) {
        console.error("Upgrade error:", error);
      }
      
    } else {
      // NEW subscription (new user)
      const userId = parseInt(session.metadata.userId);
      const planId = session.metadata.planId;
      
      console.log(`💰 New subscription for user ${userId} with plan ${planId}`);
      
      let subscriptionItemId = null;
      let stripeSubscriptionId = null;
      
      if (session.subscription) {
        stripeSubscriptionId = session.subscription;
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        subscriptionItemId = subscription.items.data[0]?.id;
      }
      
      let endDate = new Date();
      let planName = "";
      
      switch (planId) {
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1);
          planName = "MONTHLY";
          break;
        case 'yearly':
          endDate.setFullYear(endDate.getFullYear() + 1);
          planName = "YEARLY";
          break;
        case 'lifetime':
          endDate = null;
          planName = "LIFETIME";
          break;
      }
      
      await prisma.subscription.upsert({
        where: { userId },
        update: {
          plan: planName,
          status: "ACTIVE",
          endDate: endDate,
          stripeSubscriptionId: stripeSubscriptionId,
          stripeSubscriptionItemId: subscriptionItemId,
          stripeCustomerId: session.customer,
          autoRenew: planId !== 'lifetime',
        },
        create: {
          userId,
          plan: planName,
          status: "ACTIVE",
          startDate: new Date(),
          endDate: endDate,
          stripeSubscriptionId: stripeSubscriptionId,
          stripeSubscriptionItemId: subscriptionItemId,
          stripeCustomerId: session.customer,
          autoRenew: planId !== 'lifetime',
        },
      });
      
      console.log(`✅ New subscription: User ${userId} -> ${planName}`);
      
      // Create welcome notification
      await prisma.notification.create({
        data: {
          userId,
          title: "🎉 Welcome to Premium!",
          message: `Thank you for subscribing to the ${planName} plan!`,
          type: "SUBSCRIPTION",
        },
      });
    }
  }
  
  res.json({ received: true });
};

// Get pending plan change
exports.getPendingPlanChange = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: {
        plan: true,
        pendingPlan: true,
        endDate: true,
      },
    });
    
    if (subscription?.pendingPlan) {
      res.json({
        hasPendingChange: true,
        currentPlan: subscription.plan,
        newPlan: subscription.pendingPlan,
        effectiveDate: subscription.endDate,
      });
    } else {
      res.json({
        hasPendingChange: false,
        currentPlan: subscription?.plan,
      });
    }
  } catch (error) {
    console.error("Get pending plan change error:", error);
    res.status(500).json({ error: error.message });
  }
};