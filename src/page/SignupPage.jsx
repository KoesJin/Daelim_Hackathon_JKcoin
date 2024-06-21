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
                setError('Invalid date format. Please use YYYY.MM.DD.');
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
