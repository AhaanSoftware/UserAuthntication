import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
} from "react-bootstrap";
import "./Register.css"; // Custom CSS for styling

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reenterPassword, setReenterPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailVerified, setEmailVerified] = useState(false); // Track email verification status
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationError, setVerificationError] = useState(false);
  const navigate = useNavigate();

  const handleEmailVerified = () => {
    setEmailVerified(true); // Set email as verified when OTP is validated
  };

  // Handle email verification request
  const handleVerifyEmail = async () => {
    try {
      const response = await axios.post("http://localhost:3000/user/verify-email", { email });
      if (response.status === 200) {
        setShowOtpField(true);
        setVerificationError(false); // Reset previous errors
      }
    } catch (error) {
      console.error("Error during email verification:", error);
      setVerificationError(true); // Mark verification error
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to the next input field when a digit is entered
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }

    // Check if all OTP digits are filled
    if (newOtp.every((digit) => digit !== "")) {
      const otpCode = newOtp.join("");
      verifyOtp(otpCode);
    }
  };

  // Function to verify OTP
  const verifyOtp = async (otpCode) => {
    try {
      const response = await axios.post("http://localhost:3000/user/verify-otp", { email, otp: otpCode });
      if (response.status === 200 && response.data.success) {
        setOtpVerified(true);
        setVerificationError(false);
        handleEmailVerified(); // Notify parent component that email is verified
      } else {
        setOtpVerified(false);
        setVerificationError(true);
      }
    } catch (error) {
      setVerificationError(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all fields are filled and passwords match
    if (!firstName || !lastName || !password || !reenterPassword) {
      return setError("Please fill all required fields.");
    }

    if (password !== reenterPassword) {
      return setError("Passwords do not match.");
    }

    // Check if email is verified before proceeding
    if (!emailVerified) {
      return setError("Please verify your email before registering.");
    }

    try {
      const response = await axios.post("http://localhost:3000/user/signup", {
        firstName,
        lastName,
        email,
        password,
      });

      setSuccess(response.data.msg);
      setError("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response ? err.response.data.msg : "Server error");
      setSuccess("");
    }
  };

  return (
    <Container fluid className="signup-container d-flex justify-content-center align-items-center">
      <Card className="signup-card p-4">
        <h2 className="text-center mb-4">Signup</h2>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3 justify-content-center">
            <Col xs={12} md={6}>
              <Form.Group controlId="formFirstName" className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="form-input"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group controlId="formLastName" className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="form-input"
                />
              </Form.Group>
            </Col>

            {/* Email Verification Form */}
            <Row className="mb-3">
              <Col md={otpVerified ? 12 : 8}>
                <Form.Control
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={showOtpField || otpVerified}
                />
              </Col>
              <Col md={otpVerified ? 0 : 4}>
                {!otpVerified && (
                  <Button onClick={handleVerifyEmail} className="verify-button w-100">
                    Verify
                  </Button>
                )}
              </Col>
            </Row>

            {showOtpField && !otpVerified && (
              <Form.Group controlId="formOtp" className="mb-3">
                <div className="d-flex" style={{ gap: "10px" }}>
                  {otp.map((digit, index) => (
                    <Form.Control
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      maxLength={1}
                      className={`otp-input text-center ${verificationError ? "border-danger" : ""}`}
                      style={{ flex: 1, width: "20%" }}
                    />
                  ))}
                </div>
              </Form.Group>
            )}

            <Col xs={12} md={12}>
              <Form.Group controlId="formPassword" className="mb-3">
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                />
              </Form.Group>
            </Col>

            {/* Re-enter Password field */}
            <Col xs={12} md={12}>
              <Form.Group controlId="formReenterPassword" className="mb-3">
                <Form.Control
                  type="password"
                  placeholder="Re-enter Password"
                  value={reenterPassword}
                  onChange={(e) => setReenterPassword(e.target.value)}
                  className="form-input"
                />
              </Form.Group>
            </Col>

            <Button variant="success" type="submit" className="w-50 submit-button">
              Register
            </Button>
          </Row>
        </Form>
      </Card>
    </Container>
  );
};

export default Signup;
