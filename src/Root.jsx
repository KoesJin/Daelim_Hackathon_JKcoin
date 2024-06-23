import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Helmet } from 'react-helmet';
import { createGlobalStyle } from 'styled-components';
import styled from 'styled-components';
import Footer from './component/GlobalFooter/Footer';
import LoadingComponent from './component/LoadingPage/LoadingComponent'; // 새로 추가된 로딩 컴포넌트
import SettingsModal from './component/SettingsIcon/SettingsModal'; // 모달 컴포넌트 추가

// 전역 스타일 정의
const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    color: #ffffff; /* 텍스트 색상 */
    background-color: rgb(40, 40, 40); 
    overflow-x: hidden; /* 가로 스크롤 막음 */
    font-family: 'Noto Sans KR', sans-serif; /* 폰트 적용 */
  }

  html {
    overflow: hidden; /* 스크롤을 막음 */
  }

  * {
    font-family: inherit; /* 모든 요소에 폰트 상속 */
  }

  .fade-enter {
    opacity: 0;
  }
  .fade-enter-active {
    opacity: 1;
    transition: opacity 250ms ease-in;
  }
  .fade-exit {
    opacity: 1;
  }
  .fade-exit-active {
    opacity: 0;
    transition: opacity 250ms ease-out;
  }

  @media (max-width: 600px) {
    .page-container {
      height: calc(100vh - 2px); /* border로 인해 발생하는 높이 초과를 방지 */
    }
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Noto Sans KR', sans-serif; /* 타이틀 폰트 적용 */
    font-weight: bold;
  }

  h2 {
    font-size: 1.5em;
  }

  @media (max-width: 768px) {
    h2 {
      font-size: 1.3em;
    }
  }
`;

const AnimationContainer = styled.div`
    flex: 1;
    width: 100%;
    overflow-y: auto; /* 컨텐츠 영역의 스크롤 허용 */
    -webkit-overflow-scrolling: touch; /* 터치 스크롤링을 부드럽게 함 */
`;

const PageContainer = styled.div`
    width: 100%;
    max-width: 1200px; /* 최대 너비 설정 */
    height: 100vh;
    margin: 0 auto; /* 가운데 정렬 */
    display: flex;
    flex-direction: column;
    background-color: rgb(40, 40, 50);
    box-sizing: border-box; /* border를 박스 모델에 포함 */
    overflow-y: hidden; /* 상위 컨테이너에서 스크롤 막음 */
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    font-size: 2em;
    text-align: center;
    pointer-events: none;
    opacity: ${(props) => (props.visible ? 1 : 0)};
    transition: opacity 0.5s ease-in-out;
`;

function Root() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLandscape, setIsLandscape] = useState(false);
    const [loading, setLoading] = useState(true); // 로딩 상태 추가
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 추가

    const isLoginPage =
        location.pathname.toLowerCase() === '/loginpage' || location.pathname.toLowerCase() === '/signup';

    useEffect(() => {
        const handleOrientationChange = () => {
            if (window.screen.orientation.angle === 90 || window.screen.orientation.angle === 270) {
                setIsLandscape(true);
            } else {
                setIsLandscape(false);
            }
        };

        window.addEventListener('orientationchange', handleOrientationChange);
        handleOrientationChange(); // 초기 호출

        return () => {
            window.removeEventListener('orientationchange', handleOrientationChange);
        };
    }, []);

    useEffect(() => {
        const scrollPositions = {};
        const saveScrollPosition = () => {
            scrollPositions[location.pathname] = window.scrollY;
        };

        const restoreScrollPosition = () => {
            window.scrollTo(0, scrollPositions[location.pathname] || 0);
        };

        saveScrollPosition();
        return () => {
            saveScrollPosition();
            restoreScrollPosition();
        };
    }, [location.pathname]);

    useEffect(() => {
        const checkLoginStatus = () => {
            const token = localStorage.getItem('user_key');
            if (!token && !isLoginPage) {
                navigate('/loginpage');
            }
            setLoading(false);
        };

        checkLoginStatus();
    }, [location.pathname, navigate, isLoginPage]);

    const handleModalOpen = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Helmet>
                <title>JKCoin</title>
                <meta name="theme-color" content={isModalOpen ? '#444444' : '#000000'} />
            </Helmet>
            <GlobalStyles />
            <PageContainer className="page-container">
                <TransitionGroup>
                    <CSSTransition classNames="fade" timeout={300} key={location.key}>
                        <AnimationContainer className="scrollable">
                            {loading ? <LoadingComponent /> : <Outlet />}
                        </AnimationContainer>
                    </CSSTransition>
                </TransitionGroup>
                {!isLoginPage && !loading && !isModalOpen && <Footer />}{' '}
                {/* 모달이 열려 있을 때는 Footer를 렌더링하지 않음 */}
            </PageContainer>
            <button onClick={handleModalOpen}>설정 열기</button>
            {isModalOpen && <SettingsModal onClose={handleModalClose} />}
            <Overlay visible={isLandscape}>기기를 세로로 돌려주세요.</Overlay>
        </>
    );
}

export default Root;
