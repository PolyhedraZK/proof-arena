import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Layout from '@/layout/index';

import HomePage from './pages/Home';
const ProblemsPage = React.lazy(() => import('./pages/Problems/index'));
const ProblemsDetail = React.lazy(() => import('./pages/ProblemsDetail'));
const HowToContributePage = React.lazy(() => import('./pages/HowToContribute'));
const MachineSpecPage = React.lazy(() => import('./pages/MachineSpec'));
const SupportedProversPage = React.lazy(
  () => import('./pages/SupportedProvers')
);

import '@/components/modal';

import Loading from './components/base/Loading';

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="problems" element={<ProblemsPage />} />
            <Route
              path="problemsDetail/:detailId"
              element={<ProblemsDetail />}
            />
            <Route path="how-to-contribute" element={<HowToContributePage />} />
            <Route path="machine-spec" element={<MachineSpecPage />} />
            <Route
              path="supported-provers"
              element={<SupportedProversPage />}
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
