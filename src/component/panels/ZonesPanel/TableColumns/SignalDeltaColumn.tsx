import lodashGet from 'lodash/get';
import { Fragment, useCallback } from 'react';

import { useDispatch } from '../../../context/DispatchContext';
import EditableColumn from '../../../elements/EditableColumn';
import { CHANGE_ZONE_SIGNAL_VALUE } from '../../../reducer/types/Types';

import { RowDataProps } from './ActionsColumn';

interface SignalDeltaColumnProps {
  rowData: RowDataProps;
  onHoverSignalX: any;
  onHoverSignalY: any;
}

function SignalDeltaColumn({
  rowData,
  onHoverSignalX,
  onHoverSignalY,
}: SignalDeltaColumnProps) {
  const dispatch = useDispatch();

  const signalDeltaX = lodashGet(rowData, 'tableMetaInfo.signal.x.delta', null);
  const signalDeltaY = lodashGet(rowData, 'tableMetaInfo.signal.y.delta', null);
  const id = lodashGet(rowData, 'tableMetaInfo.signal.id', undefined);

  const saveXHandler = useCallback(
    (event) => {
      const value = event.target.value;
      dispatch({
        type: CHANGE_ZONE_SIGNAL_VALUE,
        payload: {
          zoneID: rowData.id,
          signal: { id, x: value },
        },
      });
    },
    [dispatch, id, rowData.id],
  );
  const saveYHandler = useCallback(
    (event) => {
      const value = event.target.value;
      dispatch({
        type: CHANGE_ZONE_SIGNAL_VALUE,
        payload: {
          zoneID: rowData.id,
          signal: { id, y: value },
        },
      });
    },
    [dispatch, id, rowData.id],
  );

  return (
    <Fragment>
      <td {...onHoverSignalX}>
        {signalDeltaX !== null ? (
          <EditableColumn
            value={signalDeltaX.toFixed(2)}
            onSave={saveXHandler}
            type="number"
            style={{ padding: '0.1rem 0.4rem' }}
          />
        ) : (
          ''
        )}
      </td>
      <td {...onHoverSignalY}>
        {signalDeltaY !== null ? (
          <EditableColumn
            value={signalDeltaY.toFixed(2)}
            onSave={saveYHandler}
            type="number"
            style={{ padding: '0.1rem 0.4rem' }}
          />
        ) : (
          ''
        )}
      </td>
    </Fragment>
  );
}

export default SignalDeltaColumn;