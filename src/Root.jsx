import React from 'react';
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
    background-color: rgb(40, 40, 50); /* 컨테이너 배경색 설정 */
    border: 1px solid white;
    box-sizing: border-box; /* border를 박스 모델에 포함 */
    overflow: hidden; /* PageContainer의 스크롤을 없앰 */
`;

function Root() {
    const location = useLocation();

    // 로그인 페이지 경로를 확인
    const isLoginPage = location.pathname === '/loginPage';

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
        </>
    );
}

export default Root;
