import ReactEcharts from 'echarts-for-react';

import '../../styles/chart.scss';

export default function Chart({ data }: { data: { vested: any[], locked: any[] } }) {
  console.log(data);

  const option = {
    title: {
      text: '',
    },
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      top: '10%',
      left: '2%',
      right: '3%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'time',
        boundaryGap: ['1%', '1%'],
        splitNumber: 15,
        scale: true,
      },
    ],
    yAxis: [
      {
        type: 'value',
      },
    ],
    series: [
      {
        name: 'Locked',
        type: 'line',
        color: '#00B988',
        areaStyle: {},
        data: data.locked,
      },
      {
        name: 'Vested',
        type: 'line',
        color: '#0069D1',
        areaStyle: {},
        data: data.vested,
      },
    ],
  };
  return <ReactEcharts option={option} />;
}
