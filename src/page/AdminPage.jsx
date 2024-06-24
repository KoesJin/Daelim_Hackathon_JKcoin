import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../css/AdminPage/AdminPage.module.css';
import { ReactComponent as BackIcon } from '../svg/BuyCoinsPage/Back.svg'; // BackIcon을 임포트합니다. (경로는 적절히 수정)

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userKeys, setUserKeys] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('user_key') !== 'admin1' && localStorage.getItem('user_key') !== 'admin2') {
            navigate('/');
        } else {
            let baseURL = '';
            if (process.env.NODE_ENV === 'development') {
                baseURL = 'http://121.139.20.242:5011';
            }
            axios
                .get(`${baseURL}/api/users_with_null_key`)
                .then((response) => {
                    setUsers(response.data);
                    setLoading(false);
                })
                .catch((error) => {
                    setError(error);
                    setLoading(false);
                });
        }
    }, [navigate]);

    const handleInputChange = (id, value) => {
        setUserKeys({
            ...userKeys,
            [id]: value,
        });
    };

    const handleAssignKey = (uid) => {
        const userKey = userKeys[uid];
        if (!userKey) {
            alert('키 값을 입력하세요.');
            return;
        }
        let baseURL = '';
        if (process.env.NODE_ENV === 'development') {
            baseURL = 'http://121.139.20.242:5011';
        }
        axios
            .post(`${baseURL}/api/assign_user_key`, { uid, userKey })
            .then((response) => {
                setUsers(users.map((user) => (user.uid === uid ? { ...user, user_key: userKey } : user)));
                alert('키가 성공적으로 지정되었습니다.');
                window.location.reload();
            })
            .catch((error) => {
                console.error('키 지정 중 오류가 발생했습니다:', error);
                alert('키 지정 중 오류가 발생했습니다.');
            });
    };

    if (loading) {
        return <div className={styles.loadingMessage}>로딩 중...</div>;
    }

    if (error) {
        return <div className={styles.errorMessage}>오류: {error.message}</div>;
    }

    return (
        <div className={styles.container}>
            <Link to="/" className={styles.backButton}>
                <BackIcon className={styles.backIcon} />
            </Link>
            <div className={styles.title}>관리자 페이지</div>
            <div className={styles.userList}>
                {users.length === 0 ? (
                    <p>키 값이 비어 있는 사용자가 없습니다.</p>
                ) : (
                    <ul>
                        {users.map((user) => (
                            <li key={user.uid} className={styles.userItem}>
                                <p>식별자 : {user.uid}</p>
                                <p>아이디 : {user.user_id}</p>
                                <p>패스워드 : {user.user_pw}</p>
                                <p>생년월일 : {user.udate}</p>
                                <p>이메일 : {user.umail}</p>
                                <input
                                    type="text"
                                    value={userKeys[user.uid] || ''}
                                    onChange={(e) => handleInputChange(user.uid, e.target.value)}
                                    placeholder="지정할 키 값을 입력하세요"
                                    className={styles.inputField}
                                />
                                <button onClick={() => handleAssignKey(user.uid)} className={styles.assignButton}>
                                    키 지정
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
