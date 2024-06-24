import React, { useState, useEffect } from 'react';
import styles from '../../css/Loading/Loading.module.css';

const LoadingComponent = () => {
    const [showRefreshButton, setShowRefreshButton] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowRefreshButton(true);
        }, 5000); // 5초 후에 새로고침 버튼 표시

        return () => clearTimeout(timer);
    }, []);

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className={styles.loading}>
            <div className={styles.spinner}></div>
            {showRefreshButton && (
                <button className={styles.refreshButton} onClick={handleRefresh}>
                    새로고침
                </button>
            )}
        </div>
    );
};

export default LoadingComponent;
