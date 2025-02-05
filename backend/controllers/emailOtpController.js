const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Otp = require('../models/otpModel');  // Import your OTP model
const User = require('../models/userModel');
// Create a reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // or another email service
    auth: {
        user: "soumitra.ahaansoftware@gmail.com", // Your email
        pass: "jqnt jewb lvro smjo", // Your app password or real password
    },
});

// Generate OTP (6-digit number)
const generateOtp = () => {
    return crypto.randomInt(100000, 999999); // generates a random 6-digit number
};

// Function to send OTP email
const sendOtpEmail = (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender email
        to: email,                   // Recipient email
        subject: 'Your OTP Code',    // Subject of the email
        text: `Your OTP code is: ${otp}`, // OTP text
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
const requestEmailOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
      return res.status(400).json({ msg: 'Please provide a valid email address' });
  }

  try {
      // Generate a 6-digit OTP
      const otp = generateOtp();

      // Check if there's an existing OTP for this email that is still valid
      const existingOtp = await Otp.findOne({ email });

      if (existingOtp) {
          // Check if the existing OTP has expired
          if (existingOtp.expiry > Date.now()) {
              return res.status(400).json({ msg: 'An OTP has already been sent. Please wait for it to expire.' });
          }

          // If OTP expired, delete the old OTP and create a new one
          await Otp.deleteOne({ email });
      }

      // Store the OTP with an expiration time (e.g., 5 minutes)
      const otpData = new Otp({
          email,
          otp,
          expiry: Date.now() + 5 * 60 * 1000, // OTP expires in 5 minutes
      });

      await otpData.save();  // Save OTP in the database

      // Send the OTP to the email
      sendOtpEmail(email, otp);

      res.json({ msg: 'OTP sent successfully' });
  } catch (error) {
      console.error('Error while requesting OTP:', error);
      res.status(500).json({ msg: 'Server error while sending OTP' });
  }
};


// Controller to verify OTP
const verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
      return res.status(400).json({ msg: 'Please provide both email and OTP' });
  }

  try {
      // Find the email verification record in the database
      const emailVerification = await EmailVerification.findOne({ email });

      if (!emailVerification) {
          return res.status(400).json({ msg: 'No OTP request found for this email' });
      }

      // Check if OTP has expired
      if (Date.now() > emailVerification.otpExpiry) {
          await EmailVerification.deleteOne({ email });  // Remove expired OTP
          return res.status(400).json({ msg: 'OTP has expired' });
      }

      // Check if OTP is correct
      if (emailVerification.otp === otp) {
          // Mark the email as verified
          emailVerification.isVerified = true;
          await emailVerification.save();

          res.json({ success: true, msg: 'Email verified successfully' });
      } else {
          return res.status(400).json({ msg: 'Invalid OTP' });
      }
  } catch (error) {
      console.error('Error while verifying OTP:', error);
      res.status(500).json({ msg: 'Server error while verifying OTP' });
  }
};




module.exports = { requestEmailOtp, verifyEmailOtp };
