import React, { useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import styles from '../css/SeeMorePage/SeeMorePage.module.css';
import { useNavigate } from 'react-router-dom';

const SeeMorePage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const navigate = useNavigate();

    const openModal = (content) => {
        setModalContent(content);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent('');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>더보기</div>
            </div>
            <div className={styles.userInfo}>
                <div className={styles.userImage}></div>
                <div className={styles.userDetails}>
                    <div className={styles.userName}>곰모띠</div>
                    <div className={styles.userStatus}>원화 입출금 가능 등급</div>
                </div>
            </div>
            <div className={styles.notice}>
                <h2>공지사항</h2>
                <ul>
                    <li>[뉴스] 업비트 대학생 서포터즈 '업투' 3기 모집</li>
                    <li>[뉴스] "총 10BTC 규모, 업비트 가상자산 투자 대회...</li>
                </ul>
            </div>
            <div className={styles.policy}>
                <h2>약관 및 정책</h2>
                <ul>
                    <li onClick={() => openModal('개인정보 처리방침')}>개인정보 처리방침</li>
                    <li onClick={() => openModal('청소년보호정책')}>청소년보호정책</li>
                    <li onClick={() => navigate('/investments')}>입출금 현황</li>
                </ul>
                <p>앱 버전 1.0.0.0</p>
            </div>
            <div className={styles.customerCenter}>
                <button>고객센터</button>
            </div>
            <CSSTransition
                in={isModalOpen}
                timeout={300}
                classNames={{
                    enter: styles.fadeEnter,
                    enterActive: styles.fadeEnterActive,
                    exit: styles.fadeExit,
                    exitActive: styles.fadeExitActive,
                }}
                unmountOnExit
            >
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeButton} onClick={closeModal}>
                            닫기
                        </button>
                        <h2>{modalContent}</h2>
                        <p>
                            {modalContent === '개인정보 처리방침' && (
                                <>
                                    <strong>개인정보 처리방침</strong>
                                    <br />
                                    고객님의 개인정보는 안전하게 보호되며, 회사의 개인정보 처리방침에 따라 적법하게
                                    처리됩니다. 자세한 사항은 홈페이지에서 확인하시기 바랍니다.
                                </>
                            )}
                            {modalContent === '청소년보호정책' && (
                                <>
                                    <strong>청소년보호정책</strong>
                                    <br />
                                    회사는 청소년 보호를 위해 관련 법규를 준수하며, 청소년 유해정보로부터 보호하기 위해
                                    최선을 다하고 있습니다.
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </CSSTransition>
        </div>
    );
};

export default SeeMorePage;
