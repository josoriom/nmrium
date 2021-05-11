/** @jsxImportSource @emotion/react */

import { useHighlight } from '../../../highlight/index';
import { HighlightedRowStyle, ConstantlyHighlightedRowStyle } from '../Style';

function ReactTableRow({ row, onContextMenu }) {
  const highlight = useHighlight([
    Object.prototype.hasOwnProperty.call(row.original, 'id')
      ? row.original.id
      : '',
  ]);

  return (
    <tr
      onContextMenu={onContextMenu}
      key={row.getRowProps().key}
      css={
        highlight.isActive
          ? HighlightedRowStyle
          : Object.prototype.hasOwnProperty.call(
              row.original,
              'isConstantlyHighlighted',
            ) && row.original.isConstantlyHighlighted === true
          ? ConstantlyHighlightedRowStyle
          : null
      }
      {...row.getRowProps()}
      {...highlight.onHover}
    >
      {row.cells.map((cell) => {
        const { minWidth, maxWidth, width, padding } = cell.column;
        return (
          <td
            key={cell.key}
            {...cell.getCellProps()}
            onContextMenu={(e) => {
              e.preventDefault();

              return false;
            }}
            style={{ minWidth, maxWidth, width, padding }}
          >
            {cell.render('Cell')}
          </td>
        );
      })}
    </tr>
  );
}

export default ReactTableRow;