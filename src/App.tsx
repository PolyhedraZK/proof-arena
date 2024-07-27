import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Layout from '@/layout/index';

// lazy页面
const ProblemsPage = React.lazy(() => import('./pages/Problems/index'));
const ProblemsDescription = React.lazy(() => import('./pages/ProblemsDescription/index'));
// 使用NiceModal注册modal
import '@/components/modal';

import ProblemsDetail from './pages/ProblemsDetail';

function App() {
  return (
    <BrowserRouter>
      <React.Suspense>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="problems" element={<ProblemsPage />} />
            <Route
              path="problemsDetail/:detailId"
              element={<ProblemsDetail />}
            />
            <Route path="problemsDescription/:mdFile" element={<ProblemsDescription />} />
          </Route>
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;
