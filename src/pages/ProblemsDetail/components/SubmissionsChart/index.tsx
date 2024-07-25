import ReactEcharts from 'echarts-for-react'
import { LeftOutlined } from '@ant-design/icons'
import { useStyles } from './index.style.ts'
import { Segmented, ConfigProvider } from 'antd';
import { useEffect, useState } from 'react';

type SubmissionsChartType = {
  goBack: (open: boolean) => void;
  chartData: { name: string; value: any[]; }[];
}
const SubmissionsChart = ({ goBack, chartData }: SubmissionsChartType) => {
  const { styles } = useStyles()
  const [submissionsChartData, setSubmissionsChartData] = useState<any>()
  const options = {
    height: '95%',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '2%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: submissionsChartData?.value?.map(item => item.name)
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: submissionsChartData?.value?.map(item => item.value),
      type: 'bar',
      barWidth: 60,
      itemStyle: {
        color: '#EAEBEA',
        borderRadius: 4,
      },
      emphasis: {
        itemStyle: {
          color: '#34A853'
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params) => `${params.value}s`
        },
      }
    }]
  }
  useEffect(() => {
    setSubmissionsChartData(chartData[0])
  },[chartData])
  return <div className={styles.submissionsChartBox}>
    <div className={styles.boxSpace}>
      <div>
        <LeftOutlined onClick={() => goBack(true)} />
        <span className={styles.title}>Metric analysis charts</span>
      </div>
      <ConfigProvider theme={{
        components: {
          Segmented: {
            itemColor: 'rgba(43, 51, 45, 0.60)',
            itemActiveBg: 'rgba(52, 168, 83, 0.10)',
            itemHoverBg: 'rgba(52, 168, 83, 0.10)',
            itemSelectedBg: 'rgba(52, 168, 83, 0.10)',
            itemSelectedColor: '#2B332D',
            trackBg: '#fff',
            borderRadius: 100,
          }
        }
      }}>
        <Segmented<string>
          className={styles.segmentedStyle}
          // options={['Setup time', 'Witness generation time', 'Proof generation time', 'Verification time', 'Peak memory', 'Proof size']}
          options={chartData.map(item => item.name)}
          onChange={(value) => {
            const chartDataList = chartData.find(item => item.name === value)
            setSubmissionsChartData(chartDataList)
          }}
          value={submissionsChartData?.name||chartData[0].name}
        />
      </ConfigProvider>

    </div>
    <ReactEcharts option={options} />
  </div>
};

export default SubmissionsChart