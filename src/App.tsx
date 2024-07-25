import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Layout from '@/layout/index';

import LoginPage from './pages/Login/index';

// lazy页面
const ProblemsPage = React.lazy(() => import('./pages/Problems/index'));
// 使用NiceModal注册modal
import '@/components/modal';
import ProblemsDetail from './pages/ProblemsDetail';

function App() {
  return (
    <BrowserRouter>
      <React.Suspense>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route path="/" element={<Layout />}>
            <Route path="problems" element={<ProblemsPage />} />
            <Route path="problemsDetail/:detailId" element={<ProblemsDetail />} />
          </Route>
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;
