import ReactEcharts from 'echarts-for-react';

import '../../styles/chart.scss';

export default function Chart({ data }: { data: { vested: any[], unlocked: any[] } }) {
  const option = {
    useUTC: true,
    title: {
      text: 'Schedule in UTC',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      bottom: '3%',
      selectedMode: false,
      icon: 'circle',
    },
    grid: {
      top: '15%',
      left: '2%',
      right: '3%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'time',
        boundaryGap: ['3%', '3%'],
        splitNumber: 15,
      },
    ],
    yAxis: [
      {
        type: 'value',
      },
    ],
    series: [
      {
        name: 'Vested',
        type: 'line',
        color: '#0069D1',
        areaStyle: {
          opacity: 1,
        },
        markLine: {
          data: [
            [
              { xAxis: new Date(), yAxis: 0 },
              { xAxis: new Date(), yAxis: 'max' },
            ],
          ],
          lineStyle: {
            type: 'dashed',
            color: '#FF594E',
          },
          symbol: 'none',
        },
        data: data.vested,
      },
      {
        name: 'Unlocked',
        type: 'line',
        color: '#00B988',
        areaStyle: {
          opacity: 1,
        },
        data: data.unlocked,
      },
    ],
  };
  return <ReactEcharts option={option} />;
}
