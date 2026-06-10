import "../assets/css/BackendStyle.css";
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants';

// The Admin is a distinct actor authenticated by a real username + password against
// the server (no longer a hardcoded client-side check). A successful login returns a
// bearer token that gates every /admin/* call. See docs/adr/0003.
const LoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password) {
            alert('Enter your username and password');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.ADMIN_LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                alert(data?.message || 'Login failed: incorrect username or password');
                return;
            }

            const { token } = await response.json();
            sessionStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
            navigate('/admin');
        } catch (error) {
            console.error(error);
            alert('Login failed. Please try again.');
        } finally {
            setLoading(false);
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
                <button type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
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
