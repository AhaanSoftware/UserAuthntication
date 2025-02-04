// utils/emailService.js
const nodemailer = require('nodemailer');

// Set up the email transporter (this example uses Gmail SMTP, but you can use any service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email address (e.g., 'example@gmail.com')
    pass: process.env.EMAIL_PASS, // Your email password (or app-specific password)
  },
});

// Function to generate OTP (Random 6-digit OTP)
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
};

// Function to send OTP email
const sendOtpEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: email, // Recipient address
      subject: 'Your OTP Code', // Email Subject
      text: `Your OTP is: ${otp}`, // Email Body
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('OTP sent to email!');
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = { generateOtp, sendOtpEmail };
