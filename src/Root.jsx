import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Helmet } from 'react-helmet';
import { createGlobalStyle } from 'styled-components';
import styled from 'styled-components';
import Footer from './component/GlobalFooter/Footer';

// 전역 스타일 정의
const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    color: #ffffff; /* 텍스트 색상 */
    background-color: rgb(40, 40, 40); 
    overflow: hidden; /* 스크롤을 막음 */
  }

  html {
    overflow: hidden; /* 스크롤을 막음 */
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
`;

const AnimationContainer = styled.div`
    flex: 1;
    width: 100%;
    overflow-y: auto; /* 컨텐츠 영역의 스크롤 허용 */
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
    overflow: hidden; /* PageContainer의 스크롤을 없앰 */
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
    const [isLandscape, setIsLandscape] = useState(false);

    // 로그인 페이지 경로를 확인
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

    return (
        <>
            <Helmet>
                <title>JKCoin</title>
            </Helmet>
            <GlobalStyles />
            <PageContainer className="page-container">
                <TransitionGroup>
                    <CSSTransition classNames="fade" timeout={300} key={location.key}>
                        <AnimationContainer>
                            <Outlet />
                        </AnimationContainer>
                    </CSSTransition>
                </TransitionGroup>
                {!isLoginPage && <Footer />} {/* 로그인 페이지가 아닌 경우에만 Footer 렌더링 */}
            </PageContainer>
            <Overlay visible={isLandscape}>기기를 세로로 돌려주세요.</Overlay>
        </>
    );
}

export default Root;
