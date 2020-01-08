/** @jsx jsx */
import { jsx } from '@emotion/core';

import { useChartData } from './context/ChartContext';
import Range from './Range';

const Ranges = () => {
  const { data } = useChartData();

  return (
    <g clipPath="url(#clip)">
      {data &&
        data[0] &&
        data
          .filter((d) => d.isVisible === true && d.ranges)
          .map((d) => (
            <g key={d.id}>
              {d.ranges.map((range) => (
                <Range
                  key={range.id}
                  id={range.id}
                  from={range.from}
                  to={range.to}
                  integral={range.integral}
                />
              ))}
            </g>
          ))}
    </g>
  );
};

export default Ranges;
