import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '../css/SignUpPage/SignupPage.module.css';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: '',
        birthDate: null, // Date 객체 사용
        phoneNumber: '',
        email: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleDateChange = (date) => {
        setFormData({
            ...formData,
            birthDate: date,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, password, confirmPassword, birthDate, phoneNumber, email } = formData;

        // 유효성 검사
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await axios.post('http://your-api-endpoint/signup', {
                name,
                password,
                birthDate,
                phoneNumber,
                email,
            });

            if (response.data.success) {
                navigate('/login');
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error('Error signing up:', error);
            setError('Error signing up');
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>회원가입</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.input}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={styles.input}
                    required
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={styles.input}
                    required
                />
                <DatePicker
                    selected={formData.birthDate}
                    onChange={handleDateChange}
                    className={styles.input}
                    placeholderText="Birth Date"
                    dateFormat="yyyy-MM-dd"
                    maxDate={new Date()}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                />
                <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={styles.input}
                    required
                    pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}" // 전화번호 형식 패턴
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.input}
                    required
                />
                <button type="submit" className={styles.button}>
                    회원가입
                </button>
                <Link to="/loginpage" className={`${styles.button} ${styles.linkButton}`}>
                    뒤로 가기
                </Link>
            </form>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
};

export default SignupPage;
