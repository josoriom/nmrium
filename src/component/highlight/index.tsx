import {
  createContext,
  useReducer,
  useMemo,
  useContext,
  useCallback,
  useEffect,
} from 'react';

export enum HighlightedSource {
  PEAK = 'PEAK',
  INTEGRAL = 'INTEGRAL',
  SIGNAL = 'SIGNAL',
  RANGE = 'RANGE',
  ZONE = 'ZONE',
  EXCLUSION_ZONE = 'EXCLUSION_ZONE',
  MULTIPLE_ANALYSIS_ZONE = 'MULTIPLE_ANALYSIS_ZONE',
  DATABASE = 'DATABASE',
  UNKNOWN = 'UNKNOWN',
}

type HighlightedSourceType = keyof typeof HighlightedSource;

interface SourceData {
  type: HighlightedSourceType;
  extra?: any;
}

type HighlightActions = 'HIDE' | 'SHOW' | 'SET_PERMANENT' | 'UNSET_PERMANENT';

interface HighlightState {
  highlights: Record<string, number>;
  highlighted: string[];
  highlightedPermanently: string[];
  sourceData: SourceData | null;
}

interface HighlightContextProps {
  highlight: HighlightState;
  dispatch: (props: { type: HighlightActions; payload?: any }) => void;
  remove: () => void;
}

const emptyState = {
  highlight: {
    highlights: {},
    highlighted: [],
    highlightedPermanently: [],
    sourceData: null,
  },
  dispatch: () => null,
  remove: () => null,
};

const highlightContext = createContext<HighlightContextProps>(emptyState);

function highlightReducer(state, action) {
  switch (action.type) {
    case 'SHOW': {
      const { convertedHighlights, sourceData } = action.payload;
      const { type = HighlightedSource.UNKNOWN, extra = null } =
        sourceData || {};

      const newState = {
        ...state,
        highlights: { ...state.highlights },
        sourceData: { type, extra },
      };
      for (const value of convertedHighlights) {
        if (!(value in newState.highlights)) {
          newState.highlights[value] = 1;
        }
      }
      newState.highlighted = Object.keys(newState.highlights);

      return newState;
    }
    case 'HIDE': {
      const { convertedHighlights } = action.payload;

      const newState = {
        ...state,
        highlights: { ...state.highlights },
        sourceData: null,
      };
      for (const value of convertedHighlights) {
        if (value in newState.highlights) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete newState.highlights[value];
        }
      }
      newState.highlighted = Object.keys(newState.highlights);
      return newState;
    }
    case 'SET_PERMANENT': {
      const newState = {
        ...state,
        // allow just one permanent highlights group at same time
        highlightedPermanently: action.payload,
      };

      return newState;
    }
    case 'UNSET_PERMANENT': {
      const newState = {
        ...state,
        highlightedPermanently: [],
      };

      return newState;
    }
    default: {
      throw new Error(`unknown action type: ${action.type}`);
    }
  }
}

export function HighlightProvider(props) {
  const [highlight, dispatch] = useReducer(
    highlightReducer,
    emptyState.highlight,
  );

  const contextValue = useMemo(() => {
    function remove() {
      dispatch({
        type: 'HIDE',
        payload: { convertedHighlights: highlight.highlighted },
      });
    }
    return { highlight, dispatch, remove };
  }, [highlight]);

  return (
    <highlightContext.Provider value={contextValue}>
      {props.children}
    </highlightContext.Provider>
  );
}

export function useHighlightData() {
  return useContext(highlightContext);
}

/**
 * @param {Array<string | number>}  highlights
 * @param {SourceData = null} sourceData
 */
export function useHighlight(
  highlights: (string | number)[],
  sourceData: SourceData | null = null,
) {
  if (!Array.isArray(highlights)) {
    throw new Error('highlights must be an array');
  }
  const { dispatch, highlight } = useHighlightData();

  const convertedHighlights = useMemo(() => {
    const newHighlights: Array<any> = [];
    for (const highlight of highlights) {
      if (typeof highlight !== 'string' && typeof highlight !== 'number') {
        throw new Error(`highlight key must be a string or number`);
      }
      if (highlight !== '') {
        newHighlights.push(String(highlight));
      }
    }
    return newHighlights;
  }, [highlights]);

  useEffect(() => {
    // if deletion of component then also delete its highlight information -> componentWillUnmount
    return () => {
      dispatch({
        type: 'HIDE',
        payload: { convertedHighlights: [] },
      });
      dispatch({
        type: 'UNSET_PERMANENT',
      });
    };
  }, [dispatch]);

  const isActive = useMemo(() => {
    return highlight.highlighted.some((key) =>
      convertedHighlights.includes(key),
    );
  }, [convertedHighlights, highlight.highlighted]);

  const isActivePermanently = useMemo(() => {
    return highlight.highlightedPermanently.some((key) =>
      convertedHighlights.includes(key),
    );
  }, [convertedHighlights, highlight.highlightedPermanently]);

  const show = useCallback(() => {
    dispatch({
      type: 'SHOW',
      payload: {
        convertedHighlights,
        sourceData,
      },
    });
  }, [dispatch, convertedHighlights, sourceData]);

  const hide = useCallback(() => {
    dispatch({
      type: 'HIDE',
      payload: {
        convertedHighlights,
      },
    });
  }, [convertedHighlights, dispatch]);

  const add = useCallback(
    (id) => {
      dispatch({
        type: 'SHOW',
        payload: { convertedHighlights: [], id },
      });
    },
    [dispatch],
  );

  const remove = useCallback(
    (id) => {
      dispatch({
        type: 'HIDE',
        payload: { convertedHighlights: [], id },
      });
    },
    [dispatch],
  );

  const click = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!isActivePermanently) {
        dispatch({
          type: 'SET_PERMANENT',
          payload: convertedHighlights,
        });
      } else {
        dispatch({
          type: 'UNSET_PERMANENT',
        });
      }
    },
    [convertedHighlights, dispatch, isActivePermanently],
  );

  return useMemo(() => {
    return {
      isActive,
      onHover: {
        onMouseEnter: show,
        onMouseLeave: hide,
      },
      onClick: click,
      show,
      hide,
      isActivePermanently,
      click,
      add,
      remove,
    };
  }, [add, click, hide, isActive, isActivePermanently, remove, show]);
}
