import { useCallback } from 'react';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

import { useDispatch } from '../context/DispatchContext';
import { useChartData } from '../context/ChartContext';
import { DELETE_RANGE } from '../reducer/types/Types';
import { useHighlight } from '../highlight';

const stylesOnHover = css`
  pointer-events: bounding-box;
  @-moz-document url-prefix() {
    pointer-events: fill;
  }
  user-select: 'none';
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */

  :hover .range-area {
    height: 100%;
    fill: #ff6f0057;
    cursor: pointer;
  }
  .delete-button {
    visibility: hidden;
  }
`;

const stylesHighlighted = css`
  pointer-events: bounding-box;

  @-moz-document url-prefix() {
    pointer-events: fill;
  }
  .range-area {
    height: 100%;
    fill: #ff6f0057;
  }
  .delete-button {
    visibility: visible;
    cursor: pointer;
  }
`;

const Range = ({ id, from, to, integral }) => {
  const highlight = useHighlight([id]);

  const { scaleX } = useChartData();
  const dispatch = useDispatch();

  const deleteRange = useCallback(() => {
    dispatch({ type: DELETE_RANGE, rangeID: id });
  }, [dispatch, id]);

  const DeleteButton = () => {
    return (
      <svg
        className="delete-button"
        // transform={`translate(${scaleX()(to) - 20},10)`}
        x={`translate(${scaleX()(to) - 20},10)`}
        onClick={() => deleteRange()}
        data-no-export="true"
        width="16"
        height="16"
      >
        <rect rx="5" width="16" height="16" fill="#c81121" />
        <line x1="5" x2="10" y1="8" y2="8" stroke="white" strokeWidth="2" />
      </svg>
    );
  };

  return (
    <g
      css={highlight.isActive ? stylesHighlighted : stylesOnHover}
      key={id}
      {...highlight.onHover}
    >
      <g transform={`translate(${scaleX()(to)},10)`}>
        <rect
          x="0"
          width={`${scaleX()(from) - scaleX()(to)}`}
          height="6"
          className="range-area"
          fill="green"
        />
        <text
          textAnchor="middle"
          x={(scaleX()(from) - scaleX()(to)) / 2}
          y="20"
          fontSize="10"
          fill="red"
        >
          {integral.toFixed(1)}
        </text>
      </g>
      <DeleteButton />
    </g>
  );
};

export default Range;
