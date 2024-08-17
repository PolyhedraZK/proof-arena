// apps/web/src/pages/HowToContribute/index.tsx

import { useRequest } from 'ahooks';
import ProblemsDescription from '../ProblemsDescription';

const HowToContribute = () => {
  const { data: problemData } = useRequest(() => fetch('/problemData.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }));

  const howToContribute = problemData?.find(item => item.problem_id === -1);

  return (
    <div className="main-container" style={{ paddingTop: '24px' }}>
      <h1>How to Contribute</h1>
      <ProblemsDescription mdFile={howToContribute?.details || ''} />
    </div>
  );
};

export default HowToContribute;