import emailjs from "emailjs-com";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";
const WELCOME_TEMPLATE = import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE || "YOUR_WELCOME_TEMPLATE";
const PAYMENT_TEMPLATE = import.meta.env.VITE_EMAILJS_PAYMENT_TEMPLATE || "YOUR_PAYMENT_TEMPLATE";
const PASSWORD_RESET_TEMPLATE = import.meta.env.VITE_EMAILJS_PASSWORD_RESET_TEMPLATE || "YOUR_PASSWORD_RESET_TEMPLATE";

/**
 * Send a welcome email after a new user signs up.
 * @param {string} name - User's display name
 * @param {string} email - User's email address
 */
export async function sendWelcomeEmail(name, email) {
  try {
    await emailjs.send(
      SERVICE_ID,
      WELCOME_TEMPLATE,
      {
        to_name: name,
        to_email: email,
        from_name: "Secuvion",
        message: `Welcome to Secuvion, ${name}! Your account has been created successfully. Explore our cybersecurity tools and stay protected.`,
      },
      PUBLIC_KEY
    );
  } catch (error) {
    console.warn("Failed to send welcome email:", error);
  }
}

/**
 * Send a payment confirmation email after a successful transaction.
 * @param {string} name - User's display name
 * @param {string} email - User's email address
 * @param {string} plan - The plan purchased (pro, enterprise)
 * @param {number|string} amount - The payment amount
 */
export async function sendPaymentConfirmation(name, email, plan, amount) {
  try {
    await emailjs.send(
      SERVICE_ID,
      PAYMENT_TEMPLATE,
      {
        to_name: name,
        to_email: email,
        from_name: "Secuvion",
        plan: plan,
        amount: amount,
        message: `Thank you for upgrading to the ${plan} plan, ${name}! Your payment of ${amount} has been received. Enjoy full access to all premium features.`,
      },
      PUBLIC_KEY
    );
  } catch (error) {
    console.warn("Failed to send payment confirmation email:", error);
  }
}

/**
 * Send a notification email after a password reset request.
 * @param {string} email - User's email address
 */
export async function sendPasswordResetNotification(email) {
  try {
    await emailjs.send(
      SERVICE_ID,
      PASSWORD_RESET_TEMPLATE,
      {
        to_email: email,
        from_name: "Secuvion",
        message: "A password reset has been requested for your Secuvion account. If you did not request this, please ignore this email. Otherwise, check your inbox for the reset link from Firebase.",
      },
      PUBLIC_KEY
    );
  } catch (error) {
    console.warn("Failed to send password reset notification:", error);
  }
}
