import { Draft, original } from 'immer';
import cloneDeep from 'lodash/cloneDeep';
import { xFindClosestIndex } from 'ml-spectra-processing';

import { Filters } from '../../../data/Filters';
import * as FiltersManager from '../../../data/FiltersManager';
import {
  DatumKind,
  SignalKindsToInclude,
} from '../../../data/constants/SignalsKinds';
import {
  addRange,
  changeRangeSignal,
  detectRanges,
  updateIntegralRanges,
  changeRange,
  changeRangesRealtive,
  Datum1D,
  Range,
  Signal,
  updateXShift,
} from '../../../data/data1d/Datum1D';
import {
  getPubIntegral,
  unlink,
  unlinkInAssignmentData,
} from '../../../data/utilities/RangeUtilities';
import { State } from '../Reducer';
import getRange from '../helper/getRange';

import { handleUpdateCorrelations } from './CorrelationsActions';
import { setDomain } from './DomainActions';

function handleAutoRangesDetection(draft: Draft<State>, detectionOptions) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const datum = draft.data[index] as Datum1D;

    const [from, to] = draft.xDomain;
    const windowFromIndex = xFindClosestIndex(datum.data.x, from);
    const windowToIndex = xFindClosestIndex(datum.data.x, to);

    detectRanges(datum, {
      ...detectionOptions,
      windowFromIndex,
      windowToIndex,
    });
    handleOnChangeRangesData(draft);
  }
}

function getRangeIndex(state: State, spectrumIndex, rangeID) {
  return (state.data[spectrumIndex] as Datum1D).ranges.values.findIndex(
    (range) => range.id === rangeID,
  );
}

function handleDeleteRange(draft: Draft<State>, action) {
  const state = original(draft) as State;
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const { id, assignmentData } = action.payload;
    const datum = draft.data[index] as Datum1D;
    if (id) {
      const range = datum.ranges.values.find((range) => range.id === id);
      unlinkInAssignmentData(assignmentData, [range]);
      const rangeIndex = getRangeIndex(state, index, id);
      datum.ranges.values.splice(rangeIndex, 1);
    } else {
      unlinkInAssignmentData(assignmentData, datum.ranges.values);
      datum.ranges.values = [];
    }
    updateIntegralRanges(draft.data[index]);
    handleOnChangeRangesData(draft);
  }
}

function handleChangeRangeSignalKind(draft: Draft<State>, action) {
  const state = original(draft) as State;
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const { rowData, value } = action.payload;
    const rangeIndex = getRangeIndex(state, index, rowData.id);
    const _range = (draft.data[index] as Datum1D).ranges.values[
      rangeIndex
    ] as Range;
    if (_range?.signal) {
      (_range.signal[rowData.tableMetaInfo.signalIndex] as Signal).kind = value;
      _range.kind = SignalKindsToInclude.includes(value)
        ? DatumKind.signal
        : DatumKind.mixed;
      updateIntegralRanges(draft.data[index]);
      handleOnChangeRangesData(draft);
    }
  }
}

function handleSaveEditedRange(draft: Draft<State>, action) {
  const state = original(draft) as State;
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const { editedRowData, assignmentData } = action.payload;
    // remove assignments in global state
    const _editedRowData = unlink(editedRowData);
    delete _editedRowData.tableMetaInfo;
    // remove assignments in assignment hook data
    // for now: clear all assignments for this range because signals or levels to store might have changed
    unlinkInAssignmentData(assignmentData, _editedRowData);

    const rangeIndex = getRangeIndex(state, index, _editedRowData.id);
    (draft.data[index] as Datum1D).ranges.values[rangeIndex] = _editedRowData;
    updateIntegralRanges(draft.data[index]);
    handleOnChangeRangesData(draft);
  }
}

function handleUnlinkRange(draft: Draft<State>, action) {
  const state = original(draft) as State;
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const {
      rangeData,
      assignmentData,
      isOnRangeLevel,
      signalIndex,
    } = action.payload;
    // remove assignments in global state
    for (let range of rangeData
      ? [rangeData]
      : (state.data[index] as Datum1D).ranges.values) {
      const _rangeData = unlink(cloneDeep(range), isOnRangeLevel, signalIndex);
      // remove assignments in assignment hook data
      if (isOnRangeLevel) {
        unlinkInAssignmentData(assignmentData, [{ id: _rangeData.id }]);
      } else {
        unlinkInAssignmentData(assignmentData, [
          { id: _rangeData.signal[signalIndex].id },
        ]);
      }

      const rangeIndex = getRangeIndex(state, index, _rangeData.id);
      (draft.data[index] as Datum1D).ranges.values[rangeIndex] = _rangeData;
    }
  }
}

function handleSetDiaIDRange(draft, action) {
  const state = original(draft);
  if (state.activeSpectrum?.id) {
    const { index } = state.activeSpectrum;
    const { rangeData, diaID, signalIndex } = action.payload;

    const rangeIndex = getRangeIndex(state, index, rangeData.id);
    const _range = draft.data[index].ranges.values[rangeIndex];
    if (signalIndex === undefined) {
      _range.diaID = diaID;
    } else {
      _range.signal[signalIndex].diaID = diaID;
    }
    _range.pubIntegral = getPubIntegral(_range);
  }
}

function handleResizeRange(draft: Draft<State>, action) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    changeRange(draft.data[index], action.data);
  }
}

function handleChangeRangeSum(draft: Draft<State>, value) {
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    (draft.data[index] as Datum1D).ranges.options.sum = value;
    updateIntegralRanges(draft.data[index]);
  }
}
function handleAddRange(draft: Draft<State>, action) {
  const { startX, endX } = action;
  const range = getRange(draft, { startX, endX });

  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    const [from, to] = range;
    addRange(draft.data[index], { from, to });
    handleOnChangeRangesData(draft);
  }
}

function handleChangeRangeRaltiveValue(draft, action) {
  const { id: rangeID, value } = action;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;
    changeRangesRealtive(draft.data[index], rangeID, value);
  }
}

function handleChangeRangeSignalValue(draft, action) {
  const { rangeID, signalID, value } = action.payload;
  if (draft.activeSpectrum?.id) {
    const { index } = draft.activeSpectrum;

    const shift = changeRangeSignal(
      draft.data[index],
      rangeID,
      signalID,
      value,
    );
    FiltersManager.applyFilter(draft.data[index], [
      { name: Filters.shiftX.id, options: shift },
    ]);

    updateXShift(draft.data[index] as Datum1D);

    handleOnChangeRangesData(draft);
    setDomain(draft);
  }
}

function handleOnChangeRangesData(draft) {
  handleUpdateCorrelations(draft);
}

export {
  handleAutoRangesDetection,
  handleDeleteRange,
  handleChangeRangeSum,
  handleAddRange,
  handleResizeRange,
  handleChangeRangeRaltiveValue,
  handleChangeRangeSignalValue,
  handleChangeRangeSignalKind,
  handleSaveEditedRange,
  handleUnlinkRange,
  handleSetDiaIDRange,
};