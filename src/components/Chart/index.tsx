import ReactEcharts from 'echarts-for-react';

import '../../styles/chart.scss';

export default function Chart({ data, xMax, yMax }: { data: { vested: any[], unlocked: any[], claimed: any[] }, xMax?: number, yMax?: number }) {
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
        text: 'Schedule timestamps are in UTC',
        top: '13px',
        left: 'center',
        // right: '30px',
        textStyle: {
          fontWeight: 'normal',
          fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
          fontSize: '14px',
          color: '#242F57',
          opacity: 0.5,
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
      left: '30px',
      right: '30px',
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
      {
        name: 'Claimed',
        type: 'line',
        color: '#E9AF1C',
        areaStyle: {
          opacity: 1,
        },
        data: data.claimed,
      },
    ],
  };
  return <ReactEcharts option={option} style={{ borderRadius: 10 }} />;
}

Chart.defaultProps = {
  xMax: null,
  yMax: null,
};
