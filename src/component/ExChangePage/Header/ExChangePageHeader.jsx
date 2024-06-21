import React from 'react';
import styles from '../../../css/ExChangePage/Header/ExChangePageHeader.module.css';
import { ReactComponent as SettingsIcon } from '../../../svg/ExChangePage/Header/settings.svg';
import { ReactComponent as NotificationsIcon } from '../../../svg/ExChangePage/Header/notifications.svg';
import { Link } from 'react-router-dom';

function ExChangePageHeader() {
    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}></div>
            <div className={styles.headerCenter}>
                <span className={styles.title}>거래소</span>
            </div>
            <div className={styles.headerRight}>
                <Link to="/loginPage">
                    <div>로그아웃</div>
                </Link>
                <SettingsIcon className={styles.icon} />
                <NotificationsIcon className={styles.icon} />
            </div>
        </header>
    );
}

export default ExChangePageHeader;
