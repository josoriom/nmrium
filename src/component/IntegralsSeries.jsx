import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { XY } from 'ml-spectra-processing';
import { ChartContext } from './context/ChartContext';
import * as d3 from 'd3'
// { width, height, margin, data, xDomain, yDomain, getScale }
const IntegralsSeries = ({ data }) => {

  const {
    width,
    height,
    margin,
    xDomain,
    getScale,
    verticalAlign,
    activeSpectrum,
  } = useContext(ChartContext);
  
  // const [integralYDomain,setIntegralYDomain] = useState();


// const getIntegralYDomain = () =>{
//   // console.log(data);
//   let yArray = data.reduce((acc, d, i) => {
//     console.log((d.hasOwnProperty('integrals')) ? d3.extent( d.integrals.map((integral)=>integral.y)): []);
//     const extent = ((d.hasOwnProperty('integrals')) ? d3.extent(d.integrals && d.integrals.map((integral)=>integral.y)): [];
//     return acc.concat(extent);
//   }, []);

//   console.log(yArray);

//  return d3.extent(yArray);
// }

// useEffect(()=>{
//   console.log(data);
//   getIntegralYDomain();
//   // const yIntegralDomain = getIntegralYDomain();
//   // console.log(yIntegralDomain);
//   // setIntegralYDomain(yIntegralDomain);
// },[data]);

// const getIntegralYScale = () =>{

//   return d3.scaleLinear(integralYDomain, [height - margin.bottom, margin.top]);
// }

  function makePath(data) {

    const { id, x, y } = data;
    const scale = getScale(id);
    const pathPoints = XY.reduce(x, y, {
      from: xDomain[0],
      to: xDomain[1],
    });
    // scale.y
    let path = `M ${scale.x(pathPoints.x[0])} ${scale.y(pathPoints.y[0])}`;

    path += pathPoints.x
      .slice(1)
      .map((point, i) => {
        return ` L ${scale.x(point)} ${scale.y(pathPoints.y[i])}`;
      })
      .join('');

    return path;
  }

  const IsActive = (id) => {
    return activeSpectrum === null
      ? true
      : id === activeSpectrum.id
      ? true
      : false;
  };

 
  return (
    <g key={'path'}>
      <defs>
        <clipPath id="clip">
          <rect
            width={`${width - margin.left - margin.right}`}
            height={`${height - margin.top - margin.bottom}`}
            x={`${margin.left}`}
            y={`${margin.top}`}
          />
        </clipPath>
      </defs>

      <g className="paths" clipPath="url(#clip)">
        {data &&
          data[0] &&
          data.filter((d)=>d.isVisible === true).map(
            (d, i) =>
              // d.isVisible &&
              d.integrals &&
              d.integrals.map((integral,j) => (
                <path
                  className="line"
                  key={`integral-${d.id}-${j}`}
                  stroke="black"
                  style={{ opacity: IsActive(d.id) ? 1 : 0.2 }}
                  d={makePath({id:d.id,x:integral.x,y:integral.y})}
                  transform={`translate(0,${i * verticalAlign})`}
                />
              )),
          )}
      </g>
    </g>
  );
};

export default IntegralsSeries;

IntegralsSeries.contextTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.object,
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }),
  xDomain: PropTypes.array,
  yDomain: PropTypes.array,
  getScale: PropTypes.func,
};
