// apps/web/src/pages/HowToContribute/index.tsx

import { useRequest } from 'ahooks';
import ProblemsDescription from '../ProblemsDescription';

const HowToContribute = () => {
  const { data: howToContributeData, error } = useRequest(() => 
    fetch('/docs/how_to_contribute.md').then(res => res.text())
  );

  if (error) {
    return <div>Failed to load How to Contribute content</div>;
  }

  if (!howToContributeData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-container" style={{ paddingTop: '24px' }}>
      <h1>How to Contribute</h1>
      <ProblemsDescription mdFile={howToContributeData} />
    </div>
  );
};

export default HowToContribute;