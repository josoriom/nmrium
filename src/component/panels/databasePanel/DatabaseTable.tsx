/** @jsxImportSource @emotion/react */
import { useMemo, memo } from 'react';
import { FaPlus } from 'react-icons/fa';

import { usePreferences } from '../../context/PreferencesContext';
import ReactTable from '../../elements/ReactTable/ReactTable';
import setCustomColumn, {
  CustomColumn,
} from '../../elements/ReactTable/utility/setCustomColumn';
import { getValue } from '../../utility/LocalStorage';
import NoTableData from '../extra/placeholder/NoTableData';
import { databaseDefaultValues } from '../extra/preferences/defaultValues';

interface DatabaseTableProps {
  data: any;
  onAdd: (row: any) => void;
}

const COLUMNS: (CustomColumn & { showWhen: string })[] = [
  {
    showWhen: 'showNames',
    index: 2,
    Header: 'names',
    accessor: (row) => (row.names ? row.names.join(',') : ''),
    enableRowSpan: true,
  },
  {
    showWhen: 'showRange',
    index: 3,
    Header: 'From - To',
    accessor: (row) => `${row.from} - ${row.to}`,
    enableRowSpan: true,
  },
  {
    showWhen: 'showDelta',
    index: 4,
    Header: 'δ (ppm)',
    accessor: 'delta',
  },
  {
    showWhen: 'showMultiplicity',
    index: 5,
    Header: 'Multi.',
    accessor: 'multiplicity',
  },
  {
    showWhen: 'showCoupling',
    index: 6,
    Header: 'J (Hz)',
    accessor: 'coupling',
  },
];

function DatabaseTable({ data, onAdd }: DatabaseTableProps) {
  const preferences = usePreferences();

  const initialColumns = useMemo(
    () => [
      {
        index: 20,
        Header: '',
        width: '1%',
        maxWidth: '24px',
        minWidth: '24px',
        id: 'add-button',
        accessor: 'index',
        enableRowSpan: true,
        Cell: ({ row }) => (
          <button
            type="button"
            className="add-button"
            onClick={() => onAdd(row)}
          >
            <FaPlus />
          </button>
        ),
      },
    ],
    [onAdd],
  );

  const tableColumns = useMemo(() => {
    const databasePreferences = getValue(
      preferences,
      'formatting.panels.database',
      databaseDefaultValues,
    );

    let columns = [...initialColumns];
    for (const col of COLUMNS) {
      const { showWhen, ...colParams } = col;
      if (databasePreferences[showWhen]) {
        setCustomColumn(columns, colParams);
      }
    }

    return columns.sort((object1, object2) => object1.index - object2.index);
  }, [initialColumns, preferences]);

  return data && data.length > 0 ? (
    <ReactTable data={data} columns={tableColumns} />
  ) : (
    <NoTableData />
  );
}

export default memo(DatabaseTable);
