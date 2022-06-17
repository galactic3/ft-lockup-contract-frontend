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
      axisPointer: {
        type: 'cross',
      },
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
        name: 'Total',
        type: 'line',
        color: '#00B988',
        areaStyle: {
          opacity: 1,
        },
        data: data.vested,
        z: 1,
      },
      {
        name: 'Vested',
        type: 'line',
        color: '#0069D1',
        areaStyle: {
          opacity: 1,
        },
        data: data.locked,
        z: 2,
      },
    ],
  };
  return <ReactEcharts option={option} />;
}
