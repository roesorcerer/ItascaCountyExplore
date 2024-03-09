import "../assets/css/BackendStyle.css";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Hardcoded credentials for demonstration purposes
    const hardcodedUsername = 'adminUser';
    const hardcodedPassword = 'adminPass';

    const handleLogin = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        // Here you would handle authentication.
        // This example just redirects to the admin page if the username and password are filled.
        if (username === hardcodedUsername && password === hardcodedPassword) {
            console.log('Login Successful');
            navigate('/admin'); // Redirect to admin page upon successful login // Redirect to admin page upon successful login
        } else {
            console.log('Login Failed: Username or password missing');
            alert('Login failed: Incorrect username or password');
        }
    };

    return (
        <div className="login-form-bg h-100">
            <div className="container h-100">
                <div className="row justify-content-center align-items-center h-100">
                    <div className="col-xl-6">
                        <div className="form-input-content">
                            <div className="card login-form mb-0">
                                <div className="card-body pt-5">
                                    {/* Title */} 
                                    <span className="text-center">Secret Admin Login </span>

                                    {/* Login form */ }
        <form className="mt-5 mb-5 login-input" onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Login</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;