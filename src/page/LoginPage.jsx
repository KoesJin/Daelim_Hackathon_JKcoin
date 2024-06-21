import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../css/LoginPage/LoginPage.module.css';

const LoginPage = () => {
    localStorage.removeItem('user_key'); // 로그인 페이지 접속하면 로컬스토리지값 삭제
    const [user_id, setUser_id] = useState('');
    const [user_pw, setUser_pw] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let baseURL = '';
            if (process.env.NODE_ENV === 'development') {
                // If in development environment, use local IP
                baseURL = 'http://121.139.20.242:5011';
            }
            // Make the request with the appropriate base URL
            const response = await axios.post(`${baseURL}/api/jkcoin_login`, {
                user_id,
                user_pw,
            });
            const { valid, user_key } = response.data;
            if (valid) {
                localStorage.setItem('user_key', user_key);
                navigate('/');
            } else {
                setError('Invalid user ID or password');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            setError('Error logging in');
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>JK Coin</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    placeholder="User ID"
                    value={user_id}
                    onChange={(e) => setUser_id(e.target.value)}
                    className={styles.input}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={user_pw}
                    onChange={(e) => setUser_pw(e.target.value)}
                    className={styles.input}
                    required
                />
                <button type="submit" className={styles.button}>
                    로그인
                </button>
                <Link to="/signup" className={styles.button}>
                    회원가입
                </Link>
            </form>

            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
};

export default LoginPage;
