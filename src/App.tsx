import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Layout from '@/layout/index';

// lazy页面
const ProblemsPage = React.lazy(() => import('./pages/Problems/index'));
const ProblemsDescription = React.lazy(() => import('./pages/ProblemsDescription/index'));
const ProblemsDetail = React.lazy(() => import('./pages/ProblemsDetail'));
// 使用NiceModal注册modal
import '@/components/modal';


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
          </Route>
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;
