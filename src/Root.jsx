import React from 'react';
import { Outlet } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Helmet } from 'react-helmet';

import { createGlobalStyle } from 'styled-components';
import styled from 'styled-components';

// 전역 스타일 정의
const GlobalStyles = createGlobalStyle`
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

`;

const AnimationContainer = styled.div`
    width: 100%;
    height: 100%;
`;

function Root() {
    return (
        <>
            <Helmet>
                <title>JKCoin</title>
            </Helmet>
            <GlobalStyles />
            <TransitionGroup>
                <CSSTransition classNames="fade" timeout={300}>
                    <AnimationContainer>
                        <Outlet />
                    </AnimationContainer>
                </CSSTransition>
            </TransitionGroup>
        </>
    );
}

export default Root;
