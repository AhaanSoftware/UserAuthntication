const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Temporary storage for OTPs (in memory, use database or cache in production)
const otpStore = {}; 

// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other email services like SendGrid, etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your email password
  },
});

// Function to send OTP email
const sendOtpEmail = (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending OTP email:', error);
    } else {
      console.log('OTP sent:', info.response);
    }
  });
};

// Controller to handle OTP request via email
const requestEmailOtp = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: 'Please provide a valid email address' });
  }

  // Generate a 6-digit OTP
  const otp = crypto.randomInt(100000, 999999); // Random 6-digit OTP

  // Store the OTP with an expiration time (e.g., 5 minutes)
  otpStore[email] = { otp, expiry: Date.now() + 5 * 60 * 1000 }; // OTP expires in 5 minutes

  // Send the OTP to the email
  sendOtpEmail(email, otp);

  res.json({ msg: 'OTP sent successfully' });
};

// Controller to verify OTP
const verifyEmailOtp = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ msg: 'Please provide both email and OTP' });
  }

  const storedOtpData = otpStore[email];

  if (!storedOtpData) {
    return res.status(400).json({ msg: 'No OTP request found for this email' });
  }

  // Check if OTP is expired
  if (Date.now() > storedOtpData.expiry) {
    delete otpStore[email]; // Remove expired OTP
    return res.status(400).json({ msg: 'OTP has expired' });
  }

  // Verify OTP
  if (storedOtpData.otp === otp) {
    delete otpStore[email]; // Remove OTP after successful verification
    return res.json({ success: true, msg: 'OTP Verified Successfully' });
  } else {
    return res.status(400).json({ msg: 'Invalid OTP' });
  }
};

module.exports = { requestEmailOtp, verifyEmailOtp };
