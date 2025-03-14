import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerAge, setRegisterAge] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('https://whiteboard-ftu8.onrender.com/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      localStorage.setItem('token', data.token);
      navigate('/canvasList');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    
    try {
      const response = await fetch('https://whiteboard-ftu8.onrender.com/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          age: registerAge
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      setRegisterSuccess('Registration successful! You can now login.');
      // Clear form fields after successful registration
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterAge('');
      
      // Close modal after a delay
      setTimeout(() => {
        setShowRegisterModal(false);
        setRegisterSuccess('');
      }, 3000);
      
    } catch (err) {
      setRegisterError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginContainer}>
        <h2>Login</h2>
        {error && <p style={styles.errorMessage}>{error}</p>}
        <form onSubmit={handleLogin} style={styles.loginForm}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={styles.inputField}
          />
          <div style={styles.passwordContainer}>
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={styles.inputField}
            />
            <span 
              onClick={() => setShowPassword(!showPassword)} 
              style={styles.eyeIcon}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button type="submit" style={styles.loginButton}>Login</button>
          <div style={styles.registerPrompt}>
            <span>Don't have an account?</span>
            <button 
              type="button" 
              onClick={() => setShowRegisterModal(true)}
              style={styles.signUpButton}
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2>Create Account</h2>
              <button 
                style={styles.closeButton} 
                onClick={() => setShowRegisterModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            {registerError && <p style={styles.errorMessage}>{registerError}</p>}
            {registerSuccess && <p style={styles.successMessage}>{registerSuccess}</p>}
            <form onSubmit={handleRegister} style={styles.registerForm}>
              <div style={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <input 
                  id="name"
                  type="text" 
                  placeholder="Enter your name" 
                  value={registerName} 
                  onChange={(e) => setRegisterName(e.target.value)} 
                  style={styles.inputField}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label htmlFor="email">Email <span style={styles.requiredStar}>*</span></label>
                <input 
                  id="email"
                  type="email" 
                  placeholder="Enter your email" 
                  value={registerEmail} 
                  onChange={(e) => setRegisterEmail(e.target.value)} 
                  required 
                  style={styles.inputField}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label htmlFor="password">Password <span style={styles.requiredStar}>*</span></label>
                <div style={styles.passwordContainer}>
                  <input 
                    id="password"
                    type={showRegisterPassword ? 'text' : 'password'} 
                    placeholder="Create a password" 
                    value={registerPassword} 
                    onChange={(e) => setRegisterPassword(e.target.value)} 
                    required 
                    style={styles.inputField}
                  />
                  <span 
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)} 
                    style={styles.eyeIcon}
                  >
                    {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label htmlFor="age">Age</label>
                <input 
                  id="age"
                  type="number" 
                  placeholder="Enter your age" 
                  value={registerAge} 
                  onChange={(e) => setRegisterAge(e.target.value)} 
                  min="1"
                  max="120"
                  style={styles.inputField}
                />
              </div>
              
              <button type="submit" style={styles.registerButton}>Create Account</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh'
  },
  loginContainer: {
    width: '300px',
    margin: '50px auto',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    backgroundColor: 'white'
  },
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  inputField: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    width: '100%'
  },
  passwordContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative'
  },
  eyeIcon: {
    position: 'absolute',
    right: '10px',
    cursor: 'pointer'
  },
  loginButton: {
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontWeight: 'bold'
  },
  errorMessage: {
    color: 'red',
    margin: '10px 0'
  },
  successMessage: {
    color: 'green',
    margin: '10px 0'
  },
  registerPrompt: {
    marginTop: '15px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px'
  },
  signUpButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    fontWeight: 'bold',
    padding: '5px',
    textDecoration: 'underline'
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    width: '90%',
    maxWidth: '400px',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
    boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.2)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px'
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5px',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    transition: 'background-color 0.2s',
    hover: {
      backgroundColor: '#f0f0f0'
    }
  },
  registerForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
    gap: '5px'
  },
  requiredStar: {
    color: 'red'
  },
  registerButton: {
    padding: '12px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    marginTop: '10px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s'
  }
};

export default Login;