// apps/web/src/pages/MachineSpec/index.tsx

import { useRequest } from 'ahooks';
import ProblemsDescription from '../ProblemsDescription';

const MachineSpec = () => {
  const { data: problemData } = useRequest(() => fetch('/problemData.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }));

  const judgeSpec = problemData?.find(item => item.problem_id === 0);

  return (
    <div className="main-container" style={{ paddingTop: '24px' }}>
      <h1>Judge Machine Specification</h1>
      <ProblemsDescription mdFile={judgeSpec?.details || ''} />
    </div>
  );
};

export default MachineSpec;