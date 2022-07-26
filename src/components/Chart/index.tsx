import ReactEcharts from 'echarts-for-react';

import '../../styles/chart.scss';

export default function Chart({ data, xMax, yMax }: { data: { vested: any[], unlocked: any[] }, xMax?: number, yMax?: number }) {
  const xMin = Math.min(...[data.unlocked[0][0], ...(data.vested[0][0] && [data.vested[0][0]] && [])]);
  console.log('xMin', xMin / 1000);
  console.log('xMax', xMax);
  console.log('withOffset', xMax && (xMax + (xMax - xMin / 1000) * 0.03));
  const computedMin = xMax && (xMin / 1000 - (xMax - xMin / 1000) * 0.03) * 1000;
  const computedMax = xMax && (xMax + (xMax - xMin / 1000) * 0.03) * 1000;
  console.log('computedMin', computedMin);
  console.log('computedMax', computedMax);
  const option = {
    useUTC: true,
    title: [
      {
        text: 'Schedule in UTC',
        top: '10px',
        left: 'center',
        textStyle: {
          fontWeight: 'normal',
        },
      },
    ],
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
        min: computedMin,
        max: computedMax,
      },
    ],
    yAxis: [
      {
        type: 'value',
        max: yMax,
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
              { xAxis: new Date(), yAxis: yMax || 'max' },
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

Chart.defaultProps = {
  xMax: null,
  yMax: null,
};
