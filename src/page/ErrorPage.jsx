import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/ErrorPage/ErrorPage.module.css';

const ErrorPage = () => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate('/');
    };

    return (
        <div className={styles.errorPage}>
            <div className={styles.errorContent}>
                <h1 className={styles.errorTitle}>에러가 발생했습니다!</h1>
                <p className={styles.errorMessage}>요청하신 페이지를 찾을 수 없습니다.</p>
                <button className={styles.backButton} onClick={goBack}>
                    뒤로가기
                </button>
            </div>
        </div>
    );
};

export default ErrorPage;
