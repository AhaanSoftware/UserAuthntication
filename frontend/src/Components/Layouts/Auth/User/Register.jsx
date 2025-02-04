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
import EmailVerificationForm from "./Email";
import "./Register.css"; // Custom CSS for styling

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();

  // Handle Signup Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !mobile ||
      !otpVerified
    ) {
      return setError("Please fill all required fields and verify OTP");
    }

    try {
      const response = await axios.post("/register", {
        firstName,
        lastName,
        email,
        password,
        mobile,
      });
      setSuccess(response.data.msg);
      setError("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response ? err.response.data.msg : "Server error");
      setSuccess("");
    }
  };

  // Request OTP for Mobile Verification
  const handleRequestOtp = async () => {
    if (!mobile) return setError("Please enter a valid mobile number");
    try {
      await axios.post("/api/request-otp", { mobile });
      setIsOtpSent(true);
      setError("");
    } catch (err) {
      setError(err.response ? err.response.data.msg : "Failed to send OTP");
    }
  };

  // Verify OTP for Mobile Verification
  const handleVerifyOtp = async () => {
    if (!otp) return setError("Please enter the OTP");
    try {
      const response = await axios.post("/api/verify-otp", { mobile, otp });
      if (response.data.success) {
        setOtpVerified(true);
        setSuccess("OTP Verified");
        setError("");
      } else {
        setError("Invalid OTP");
      }
    } catch (err) {
      setError("Failed to verify OTP");
    }
  };

  // Handle OTP input (for 5-digit OTP)
  const handleOtpChange = (e, index) => {
    let value = e.target.value;
    if (value.length === 1 && !isNaN(value)) {
      let otpArray = otp.split("");
      otpArray[index] = value;
      setOtp(otpArray.join(""));
    }
  };

  return (
    <Container
      fluid
      className="signup-container d-flex justify-content-center align-items-center"
    >
      <Card className="signup-card p-2">
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

            <EmailVerificationForm />

            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </Form.Group>

            <Form.Group controlId="formMobile" className="mb-3">
              <div className="row">
                <Col md={8} className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="form-input"
                  />
                </Col>
                <Col md={4} className="mb-3">
                  <Button
                    variant="primary"
                    onClick={handleRequestOtp}
                    className="otp-button w-100" // w-100 makes the button fill the column width
                  >
                    Send OTP
                  </Button>
                </Col>
              </div>
            </Form.Group>

            {isOtpSent && (
              <>
                <Form.Group controlId="formOtp" className="mb-3">
                  <div className="d-flex justify-content-between">
                    {Array(5)
                      .fill("")
                      .map((_, index) => (
                        <Form.Control
                          key={index}
                          type="text"
                          maxLength="1"
                          value={otp[index] || ""}
                          onChange={(e) => handleOtpChange(e, index)}
                          className="otp-input"
                        />
                      ))}
                  </div>
                </Form.Group>
                <Button
                  variant="primary"
                  onClick={handleVerifyOtp}
                  className="w-100 mb-3 verify-button"
                >
                  Verify OTP
                </Button>
              </>
            )}

            <Button
              variant="success"
              type="submit"
              className="w-50 submit-button"
            >
              Register
            </Button>
          </Row>
        </Form>
      </Card>
    </Container>
  );
};

export default Signup;
