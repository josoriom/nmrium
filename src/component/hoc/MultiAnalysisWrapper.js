import { forwardRef } from 'react';

import { useChartData } from '../context/ChartContext';

function MultiAnalysisWrapper(WrappedComponent) {
  const Wrapper = (props) => {
    const {
      activeTab,
      spectraAanalysis,
      AnalysisObj,
      displayerKey,
    } = useChartData();
    const { forwardedRef, ...rest } = props;

    return (
      <WrappedComponent
        {...rest}
        activeTab={activeTab}
        spectraAanalysis={spectraAanalysis}
        AnalysisObj={AnalysisObj}
        displayerKey={displayerKey}
        ref={forwardedRef}
      />
    );
  };
  return forwardRef((props, ref) => {
    return <Wrapper {...props} forwardedRef={ref} />;
  });
}
export default MultiAnalysisWrapper;
