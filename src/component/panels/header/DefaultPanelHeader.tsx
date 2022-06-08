/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { CSSProperties, memo, ReactNode } from 'react';
import { FaRegTrashAlt, FaCog, FaFilter } from 'react-icons/fa';

import ToggleButton from '../../elements/ToggleButton';
import ToolTip from '../../elements/ToolTip/ToolTip';

const styles = css`
  display: flex;
  flex-direction: row;
  border-bottom: 0.55px solid rgb(240, 240, 240);
  padding: 0px 5px;

  .left-container {
    display: flex;
    flex-direction: row;
    flex: 1;
  }
  button {
    background-color: transparent;
    border: none;
    padding: 5px;
  }

  button:disabled {
    opacity: 0.6;
  }

  .counter-label {
    margin: 0;
    text-align: right;
    line-height: 22px;
    padding: 0px 10px;
    white-space: nowrap;
  }
`;

interface DefaultPanelHeaderProps {
  counter?: number;
  counterFiltered?: number;
  deleteToolTip?: string;
  filterToolTip?: string;
  onDelete?: () => void;
  onFilter?: () => void;
  onSettingClick?: () => void;
  filterIsActive?: boolean;
  canDelete?: boolean;
  showSettingButton?: boolean;
  showCounter?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

function DefaultPanelHeader({
  counter,
  onDelete = () => null,
  deleteToolTip = 'Delete',
  onFilter = () => null,
  filterToolTip = '',
  filterIsActive = false,
  counterFiltered = 0,
  children,
  onSettingClick = () => null,
  showSettingButton = false,
  canDelete = true,
  style = {},
  className = '',
}: DefaultPanelHeaderProps) {
  return (
    <div css={styles} {...{ style, className }}>
      <div className="left-container">
        {canDelete && (
          <ToolTip title={deleteToolTip} popupPlacement="right">
            <button type="button" onClick={onDelete} disabled={counter === 0}>
              <FaRegTrashAlt />
            </button>
          </ToolTip>
        )}

        {/* Optional if there is no filter needed, e.g. in spectra panel */}
        {filterToolTip ? (
          <ToggleButton
            popupTitle={filterToolTip}
            popupPlacement="right"
            onClick={onFilter}
            defaultValue={filterIsActive}
          >
            <FaFilter style={{ pointerEvents: 'none', fontSize: '12px' }} />
          </ToggleButton>
        ) : null}

        {children}
      </div>
      {counter !== undefined && (
        <p className="counter-label">
          [{' '}
          {filterIsActive &&
          filterIsActive &&
          counterFiltered !== undefined
            ? `${counterFiltered}/${counter}`
            : counter}{' '}
          ]
        </p>
      )}
      {showSettingButton && (
        <ToolTip title="preferences" popupPlacement="left">
          <button type="button" onClick={onSettingClick}>
            <FaCog />
          </button>
        </ToolTip>
      )}
    </div>
  );
}

export default memo(DefaultPanelHeader);
