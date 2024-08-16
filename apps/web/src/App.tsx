import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Layout from '@/layout/index';

// lazy页面
const ProblemsPage = React.lazy(() => import('./pages/Problems/index'));
const ProblemsDetail = React.lazy(() => import('./pages/ProblemsDetail'));
const HowToContribute = React.lazy(() => import('./pages/HowToContribute'));
const JudgerSpec = React.lazy(() => import('./pages/JudgerSpec'));
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
              path="problems/problemsDetail/:detailId"
              element={<ProblemsDetail />}
            />
            <Route path="howToContribute" element={<HowToContribute />} />
            <Route path="judgerSpec" element={<JudgerSpec />} />
          </Route>
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default App;
