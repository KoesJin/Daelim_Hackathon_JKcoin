import { createBrowserRouter } from 'react-router-dom';

import Root from '../Root';
import ExchangePage from '../page/ExChangePage';
import BuyCoins from '../page/BuyCoins';

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <Root />,
            children: [
                {
                    path: '',
                    element: <ExchangePage />,
                },
                {
                    path: '/buycoins',
                    element: <BuyCoins />,
                },
            ],
        },
    ]

    // {    gh-pages 연결용 코드
    //     basename: `${process.env.PUBLIC_URL}`,
    // }
);

export default router;
