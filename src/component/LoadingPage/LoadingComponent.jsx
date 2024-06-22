import React from 'react';
import styles from '../../css/Loading/Loading.module.css';

const LoadingComponent = () => (
    <div className={styles.loading}>
        <div className={styles.spinner}></div>
    </div>
);

export default LoadingComponent;
