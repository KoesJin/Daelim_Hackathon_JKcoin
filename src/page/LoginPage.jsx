import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../css/LoginPage/LoginPage.module.css';
import logo from '../img/LoginJkCoin.png'; // 로고 이미지 경로를 맞게 수정하세요

const LoginPage = () => {
    if (localStorage.getItem('user_key') === 'null') {
        alert('회원인증이 완료되지않았습니다. (관리자: 이하늘 010-24799-363)');
    }
    localStorage.removeItem('user_key'); // 로그인 페이지 접속하면 로컬스토리지값 삭제
    const [user_id, setUser_id] = useState('');
    const [user_pw, setUser_pw] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 입력 값 유효성 검사
        if (!user_id) {
            setError('아이디를 입력하세요.');
            return;
        }
        if (!user_pw) {
            setError('비밀번호를 입력하세요.');
            return;
        }

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
                setError('아이디 또는 비밀번호가 잘못되었습니다.');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            setError('로그인 오류가 발생했습니다.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.titleContainer}>
                <img src={logo} alt="JK Coin Logo" className={styles.logo} />
                <h2 className={styles.title}>JK Coin</h2>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    placeholder="User ID"
                    value={user_id}
                    onChange={(e) => setUser_id(e.target.value)}
                    className={styles.loginInput}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={user_pw}
                    onChange={(e) => setUser_pw(e.target.value)}
                    className={styles.loginInput}
                    required
                />
                <button type="submit" className={styles.button}>
                    로그인
                </button>
                <Link to="/signup" className={`${styles.button} ${styles.linkButton}`}>
                    회원가입
                </Link>
            </form>

            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
};

export default LoginPage;
