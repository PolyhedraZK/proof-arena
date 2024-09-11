import { CloseOutlined } from '@ant-design/icons';
import { ConfigProvider, Drawer, Segmented } from 'antd';
import { useResponsive } from 'antd-style';
import ReactEcharts from 'echarts-for-react';
import { useEffect, useState } from 'react';

import CheckMark from '@/assets/icons/check-mark.svg?r';
import FilterIcon from '@/assets/icons/filterIcon.svg?r';
import BaseButton from '@/components/base/BaseButton.tsx';
import BaseEmpty from '@/components/base/BaseEmpty.tsx';
import {
  formatNumber,
  formatNumberToExponential,
  formatNumberToString,
} from '@/utils/formatNumber.ts';
import { toSuperscript10 } from '@/utils/superScript.ts';

import { useStyles } from './index.style.ts';

type SubmissionsChartType = {
  chartData: any[];
};
const createUnit = (type: string) => {
  switch (type) {
    case 'setup_time':
    case 'witness_generation_time':
    case 'proof_generation_time':
    case 'verify_time':
      return 'seconds';
    case 'peak_memory':
      return 'KB';
    case 'proof_size':
      return 'B';
    default:
      return '';
  }
};
const segmentedOptions = [
  {
    label: 'Setup time',
    value: 'setup_time',
  },
  {
    label: 'Witness generation time',
    value: 'witness_generation_time',
  },
  {
    label: 'Proof generation time',
    value: 'proof_generation_time',
  },
  {
    label: 'Verification time',
    value: 'verify_time',
  },
  {
    label: 'Peak memory',
    value: 'peak_memory',
  },
  {
    label: 'Proof size',
    value: 'proof_size',
  },
];
const findChartName = (value: string) => {
  return segmentedOptions.find(item => item.value === value)?.label;
};
const SubmissionsChart = ({ chartData }: SubmissionsChartType) => {
  const { styles, cx } = useStyles();
  const { mobile } = useResponsive();
  const [segmentedValue, setSegmentedValue] = useState<any>();
  const [isLog, setIsLog] = useState<boolean | number>(true); // 使用对数来展示
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const logOptions = [
    {
      label: 'Linear Scale',
      value: '0',
    },
    {
      label: 'Log Scale',
      value: '1',
    },
  ];

  const options = {
    title: {
      subtext: `${findChartName(segmentedValue)}: ${createUnit(
        segmentedValue
      )}`,
    },
    height: '86%',
    grid: {
      left: '1%',
      right: '1%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: chartData?.map(item => item.prover_name),
      axisLabel: {
        interval: 0,
        rotate: mobile ? 90 : 0,
        fontSize: 12,
        lineHeight: 6,
        formatter: mobile
          ? (value: string) => {
              if (value?.length > 7) {
                const result: string[] = [];
                for (let i = 0; i < value.length; i += 7) {
                  result.push(value.substring(i, 7));
                }
                return result.join('\n');
              }
              return value;
            }
          : (value: string) => value,
      },
    },
    yAxis: isLog
      ? {
          type: 'log',
          startValue:
            Math.min(...chartData.map(item => item[segmentedValue])) * 0.01,
          axisLabel: {
            formatter: (value: number) => {
              const exponent = Math.log10(value);
              return `10${toSuperscript10(exponent.toFixed(0))}`;
            },
          },
        }
      : {
          type: 'value',
        },
    series: [
      {
        data: chartData?.map(item => item[segmentedValue]),
        type: 'bar',
        barWidth: 60,
        itemStyle: {
          color: '#EAEBEA',
          borderRadius: 4,
        },
        emphasis: {
          itemStyle: {
            color: '#34A853',
          },
          label: {
            show: true,
            position: 'top',
            formatter: params => {
              if (isLog) {
                return formatNumber(params.value);
              }
              return formatNumberToString(params.value);
            },
          },
        },
      },
    ],
  };
  useEffect(() => {
    setSegmentedValue(segmentedOptions[0].value);
  }, [chartData]);
  const changeDrawer = item => {
    setSegmentedValue(item.value);
    setDrawerOpen(false);
  };
  return (
    <div className={styles.submissionsChartBox}>
      {chartData?.length ? (
        <>
          <ConfigProvider
            theme={{
              components: {
                Segmented: {
                  itemColor: 'rgba(43, 51, 45, 0.60)',
                  itemActiveBg: 'rgba(52, 168, 83, 0.10)',
                  itemHoverBg: 'rgba(52, 168, 83, 0.10)',
                  itemSelectedBg: 'rgba(52, 168, 83, 0.10)',
                  itemSelectedColor: '#2B332D',
                  trackBg: '#fff',
                  borderRadius: 100,
                },
              },
            }}
          >
            <div className={styles.boxSpace}>
              <span className={styles.title}>Metric analysis charts</span>
              {!mobile && (
                <BaseButton
                  onClick={() => setIsLog(!isLog)}
                  className={styles.changeBtnLog}
                >
                  {isLog ? 'Linear Scale' : 'Log Scale'}
                </BaseButton>
              )}
              {mobile ? (
                <div>
                  <FilterIcon
                    onClick={() => setDrawerOpen(true)}
                    style={{ marginTop: 5 }}
                  />
                  <Drawer
                    height={439}
                    style={{ background: 'rgba(0, 0, 0, 0.1)' }}
                    styles={{
                      body: {
                        borderStartStartRadius: 16,
                        borderStartEndRadius: 16,
                        background: '#fff',
                        padding: '20px 16px',
                      },
                    }}
                    placement={'bottom'}
                    closable={false}
                    onClose={() => setDrawerOpen(false)}
                    open={drawerOpen}
                  >
                    <div className={styles.drawerTitleBox}>
                      <div className={styles.drawerTitleBox}>
                        {' '}
                        <FilterIcon /> &nbsp;Select
                      </div>
                      <CloseOutlined onClick={() => setDrawerOpen(false)} />
                    </div>
                    <div className={styles.drawerList}>
                      {segmentedOptions?.map(item => (
                        <div
                          onClick={() => changeDrawer(item)}
                          className={styles.drawerListItem}
                        >
                          <span>{item.label}</span>
                          {segmentedValue === item.value && (
                            <CheckMark className={styles.checkMarkIcon} />
                          )}
                        </div>
                      ))}
                    </div>
                  </Drawer>
                </div>
              ) : null}
            </div>
            {mobile && (
              <div className={styles.isLogSegmentedStyle}>
                <Segmented<string>
                  className={cx(
                    styles.segmentedStyle,
                    styles.logSegmentedStyle
                  )}
                  options={logOptions}
                  onChange={value => {
                    console.log(value);
                    setIsLog(Number(value));
                  }}
                  value={Number(isLog).toString()}
                />
              </div>
            )}
            {!mobile && (
              <Segmented<string>
                block
                className={styles.segmentedStyle}
                options={segmentedOptions}
                onChange={value => {
                  setSegmentedValue(value);
                }}
                value={segmentedValue}
              />
            )}
            <ReactEcharts
              style={{ height: mobile ? 430 : 484 }}
              option={options}
            />
          </ConfigProvider>
        </>
      ) : (
        <BaseEmpty description={'No Submissions'} />
      )}
    </div>
  );
};

export default SubmissionsChart;
