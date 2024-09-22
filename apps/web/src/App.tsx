import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Layout from '@/layout/index';

import HomePage from './pages/Home';
const ProblemsPage = React.lazy(() => import('./pages/Problems/index'));
const ProblemsDetail = React.lazy(() => import('./pages/ProblemsDetail'));
const MachineSpecPage = React.lazy(() => import('./pages/MachineSpec'));
const SupportedProversPage = React.lazy(
  () => import('./pages/SupportedProvers')
);
const HowToInteractWithJudge = React.lazy(
  () => import('./pages/HowToInteractWithJudge')
);
const HowToSubmitNewProver = React.lazy(
  () => import('./pages/HowToSubmitNewProver/index')
);
const HowToSubmitNewProblem = React.lazy(
  () => import('./pages/HowToSubmitNewProblem/index')
);

import '@/components/modal';

import Loading from './components/base/Loading';
import StatusPage from './pages/Status';

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="problems" element={<ProblemsPage />} />
            <Route path="problems/:detailId" element={<ProblemsDetail />} />
            <Route path="machine-spec" element={<MachineSpecPage />} />
            <Route
              path="/how-to-interact-with-judge"
              element={<HowToInteractWithJudge />}
            />
            <Route
              path="how-to-submit-new-prover"
              element={<HowToSubmitNewProver />}
            />
            <Route
              path="how-to-submit-new-problem"
              element={<HowToSubmitNewProblem />}
            />
            <Route
              path="supported-provers"
              element={<SupportedProversPage />}
            />
            <Route path="/status" element={<StatusPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
