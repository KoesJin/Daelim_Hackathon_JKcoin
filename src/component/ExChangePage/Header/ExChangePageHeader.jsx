// ExChangePageHeader.jsx
import React, { useState, useEffect } from 'react';
import styles from '../../../css/ExChangePage/Header/ExChangePageHeader.module.css';
import { ReactComponent as SettingsIcon } from '../../../svg/ExChangePage/Header/settings.svg';
import { ReactComponent as NotificationsIcon } from '../../../svg/ExChangePage/Header/notifications.svg';
import SettingsModal from '../../SettingsIcon/SettingsModal';

function ExChangePageHeader({ onModalChange }) {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        onModalChange(showModal);
    }, [showModal, onModalChange]);

    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <>
            <header className={styles.header}>
                <div className={styles.headerLeft}></div>
                <div className={styles.headerCenter}>
                    <span className={styles.title}>거래소</span>
                </div>
                <div className={styles.headerRight}>
                    <SettingsIcon className={styles.icon} onClick={openModal} />
                    <NotificationsIcon className={styles.icon} />
                </div>
                {showModal && <SettingsModal onClose={closeModal} />}
            </header>
            <div className={styles.content}></div>
        </>
    );
}

export default ExChangePageHeader;
