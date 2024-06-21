import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { ko } from 'date-fns/locale'; // 한글 로케일 가져오기
import styles from '../css/SignUpPage/SignupPage.module.css';

registerLocale('ko', ko); // 한글 로케일 등록

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: '',
        birthDate: '', // 문자열로 변경
        phoneNumber: '',
        email: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const datePickerRef = useRef(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleDateChange = (date) => {
        setFormData({
            ...formData,
            birthDate: date ? formatDate(date) : '',
        });
    };

    const parseDateString = (value) => {
        const datePattern = /^\d{4}\.\d{2}\.\d{2}$/;
        if (!datePattern.test(value)) {
            return null;
        }

        const [year, month, day] = value.split('.').map(Number);
        const parsedDate = new Date(year, month - 1, day);

        return isNaN(parsedDate.getTime()) ? null : parsedDate;
    };

    const handleBlur = (e) => {
        if (e.target.name === 'birthDate') {
            const parsedDate = parseDateString(e.target.value);
            if (parsedDate) {
                handleDateChange(parsedDate);
            } else {
                setFormData({
                    ...formData,
                    birthDate: '',
                });
                setError('날짜 형식이 잘못되었습니다. YYYY.MM.DD 형식으로 입력하세요.');
            }
        }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = `0${d.getMonth() + 1}`.slice(-2);
        const day = `0${d.getDate()}`.slice(-2);
        return `${year}.${month}.${day}`;
    };

    const validateForm = () => {
        const { name, password, confirmPassword, birthDate, phoneNumber, email } = formData;
        if (name.length < 2) {
            setError('아이디 2글자 이상이어야 합니다.');
            return false;
        }
        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return false;
        }
        if (!/^\d{4}\.\d{2}\.\d{2}$/.test(birthDate)) {
            setError('생년월일은 YYYY.MM.DD 형식으로 입력하세요.');
            return false;
        }
        if (!/^\d{11}$/.test(phoneNumber)) {
            setError('전화번호는 11자여야 합니다.');
            return false;
        }
        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
            setError('유효한 이메일 주소를 입력하세요.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, password, birthDate, phoneNumber, email } = formData;

        if (!validateForm()) {
            return;
        }

        try {
            let baseURL = '';
            if (process.env.NODE_ENV === 'development') {
                // If in development environment, use local IP
                baseURL = 'http://121.139.20.242:5011';
            }
            const response = await axios.post(`${baseURL}/api/signup`, {
                name,
                password,
                birthDate,
                phoneNumber,
                email,
            });

            if (response.data.success) {
                navigate('/loginPage');
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error('Error signing up:', error);

            // 서버에서 400 에러 처리
            if (error.response && error.response.status === 400) {
                setError(error.response.data.message); // 서버에서 받은 에러 메시지 표시
            } else {
                setError('Error signing up'); // 기타 오류 처리
            }
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>회원가입</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="text"
                    name="name"
                    placeholder="ID"
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
                <div className={styles.datePickerWrapper}>
                    <input
                        type="text"
                        name="birthDate"
                        placeholder="연도. 월. 일."
                        value={formData.birthDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={styles.inputDate}
                        pattern="\d{4}\.\d{2}\.\d{2}"
                        required
                    />
                    <FaRegCalendarAlt
                        className={styles.calendarIcon}
                        onClick={() => datePickerRef.current.setOpen(true)}
                    />
                    <DatePicker
                        selected={formData.birthDate ? parseDateString(formData.birthDate) : null}
                        onChange={handleDateChange}
                        dateFormat="yyyy.MM.dd"
                        maxDate={new Date()}
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        locale="ko" // 한글 로케일 설정
                        ref={datePickerRef}
                        customInput={<div />}
                    />
                </div>
                <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={styles.input}
                    required
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
                <Link to="/loginPage" className={`${styles.button} ${styles.linkButton}`}>
                    뒤로 가기
                </Link>
            </form>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
};

export default SignupPage;
