// apps/web/src/pages/MachineSpec/index.tsx

import { useRequest } from 'ahooks';

import ProblemsDescription from '../ProblemsDescription';

const MachineSpec = () => {
  const { data: machineSpecData, error } = useRequest(() =>
    fetch('/docs/machine_specification.md').then(res => res.text())
  );

  if (error) {
    return <div>Failed to load Machine Specification content</div>;
  }

  if (!machineSpecData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-container" style={{ paddingTop: '24px' }}>
      <h1>Judge Machine Specification</h1>
      <ProblemsDescription mdFile={machineSpecData} />
    </div>
  );
};

export default MachineSpec;
