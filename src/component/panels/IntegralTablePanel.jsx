import React, { useEffect, useState, useContext } from 'react';

import { ChartContext } from '../context/ChartContext';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '../elements/Table';

const IntegralTablePanel = () => {
  const [integrals, setIntegrals] = useState([]);
  const { activeSpectrum, data } = useContext(ChartContext);

  useEffect(() => {
    const spectrum = activeSpectrum
      ? data.find((d) => d.id === activeSpectrum.id)
      : [];
    const hasData = spectrum && spectrum.integrals;
    setIntegrals(hasData ? spectrum.integrals : []);
  }, [activeSpectrum, data]);

  return activeSpectrum && data && integrals.length > 0 ? (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell align="center">From</TableCell>
          <TableCell align="center">To</TableCell>
          <TableCell align="center">Value</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {integrals.map((row) => (
          <TableRow key={row.to + row.from + row.value}>
            <TableCell align="center" component="th" scope="row">
              {row.from.toFixed(2)}
            </TableCell>
            <TableCell align="center">{row.to.toFixed(2)}</TableCell>
            <TableCell align="center">{row.value.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ) : (
    <p
      style={{
        textAlign: 'center',
        width: '100%',
        fontSize: '11px',
        padding: '5px',
        color: 'gray',
      }}
    >
      No Data
    </p>
  );
};

export default IntegralTablePanel;
