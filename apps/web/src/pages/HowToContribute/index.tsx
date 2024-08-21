import { useRequest } from 'ahooks';
import Giscus from '@giscus/react';
import ProblemsDescription from '../ProblemsDescription';
import { giscusConfig } from '@/config/giscus';

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
      <div style={{ marginTop: '48px' }}>
        <h2>Discussions</h2>
        <Giscus
          {...giscusConfig}
          term="How to Contribute"
          mapping="specific"
        />
      </div>
    </div>
  );
};

export default HowToContribute;