import { forwardRef, useMemo } from 'react';

import { useChartData } from '../context/ChartContext';

export default function InfoWrapper(WrappedComponent) {
  function Wrapper(props) {
    const { data, activeSpectrum } = useChartData();

    const { info = {}, meta = {} } = useMemo(() => {
      if (data && activeSpectrum && activeSpectrum.id) {
        const datum = data.find((datum) => datum.id === activeSpectrum.id) || {
          info: {},
          meta: {},
        };
        return datum;
      }
      return {};
    }, [activeSpectrum, data]);

    const { forwardedRef, ...rest } = props;
    return (
      <WrappedComponent {...rest} info={info} meta={meta} ref={forwardedRef} />
    );
  }

  return forwardRef((props, ref) => {
    return <Wrapper {...props} forwardedRef={ref} />;
  });
}
