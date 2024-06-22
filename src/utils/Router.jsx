import { createBrowserRouter } from 'react-router-dom';

import Root from '../Root';

import BuyCoins from '../page/BuyCoins';
import LoginPage from '../page/LoginPage';
import ExchangePage from '../page/ExchangePage';
import SignupPage from '../page/SignupPage';
import AdminPage from '../page/AdminPage';
import ErrorPage from '../page/ErrorPage';
import MyCoinPage from '../page/MyCoinPage';

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <Root />,
            errorElement: <ErrorPage />, // 에러 페이지 설정
            children: [
                {
                    path: '',
                    element: <ExchangePage />,
                },
                {
                    path: '/buycoins',
                    element: <BuyCoins />,
                },
                {
                    path: '/loginPage',
                    element: <LoginPage />,
                },
                {
                    path: '/signup',
                    element: <SignupPage />,
                },
                {
                    path: '/adminPage',
                    element: <AdminPage />,
                },
                {
                    path: '/mycoinpage',
                    element: <MyCoinPage />,
                },
            ],
        },
    ]

    // {    gh-pages 연결용 코드
    //     basename: `${process.env.PUBLIC_URL}`,
    // }
);

export default router;
