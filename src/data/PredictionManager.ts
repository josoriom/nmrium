import { predictAll, signalsToXY, signals2DToZ } from 'nmr-processing';
import OCL from 'openchemlib/full';

import { DatumKind } from './constants/SignalsKinds';
import {
  initiateDatum1D,
  mapRanges,
  updateIntegralsRelativeValues,
} from './data1d/Spectrum1D';
import { initiateDatum2D } from './data2d/Spectrum2D';
import { Datum1D } from './types/data1d';
import { Datum2D, Signal2D, Zone } from './types/data2d';
import generateID from './utilities/generateID';

export interface PredictionOptions {
  frequency: number;
  '1d': {
    '1H': { from: number; to: number };
    '13C': { from: number; to: number };
    nbPoints: number;
    lineWidth: number;
  };
  '2d': {
    nbPoints: { x: number; y: number };
  };
  spectra: {
    proton: boolean;
    carbon: boolean;
    cosy: boolean;
    hsqc: boolean;
    hmbc: boolean;
  };
}

export const defaultPredictionOptions: PredictionOptions = {
  frequency: 400,
  '1d': {
    '1H': { from: -1, to: 12 },
    '13C': { from: -5, to: 220 },
    nbPoints: 2 ** 17,
    lineWidth: 1,
  },
  '2d': {
    nbPoints: { x: 1024, y: 1024 },
  },
  spectra: {
    proton: true,
    carbon: true,
    cosy: true,
    hsqc: true,
    hmbc: true,
  },
};

export const FREQUENCIES: Array<{ key: number; value: number; label: string }> =
  [
    { key: 1, value: 60, label: '60 MHz' },
    { key: 2, value: 100, label: '100 MHz' },
    { key: 3, value: 200, label: '200 MHz' },
    { key: 4, value: 300, label: '300 MHz' },
    { key: 5, value: 400, label: '400 MHz' },
    { key: 6, value: 500, label: '500 MHz' },
    { key: 7, value: 600, label: '600 MHz' },
    { key: 8, value: 800, label: '800 MHz' },
    { key: 9, value: 1000, label: '1000 MHz' },
    { key: 10, value: 1200, label: '1200 MHz' },
  ];

const baseURL = 'https://nmr-prediction.service.zakodium.com';

export async function predictSpectra(molfile: string): Promise<any> {
  const molecule = OCL.Molecule.fromMolfile(molfile);

  return predictAll(molecule, {
    predictOptions: {
      C: {
        webserviceURL: `${baseURL}/v1/predict/carbon`,
      },
    },
  });
}

export function generateSpectra(
  data: Record<string, any>,
  inputOptions: PredictionOptions,
): Array<Datum1D | Datum2D> {
  const spectra: Array<Datum1D | Datum2D> = [];
  const color = '#593315';
  for (const experiment in data) {
    if (inputOptions.spectra[experiment]) {
      const spectrum = data[experiment];
      switch (experiment) {
        case 'proton':
        case 'carbon': {
          const datum = generated1DSpectrum({
            spectrum,
            inputOptions,
            experiment,
            color,
          });
          spectra.push(datum);

          break;
        }
        case 'cosy':
        case 'hsqc':
        case 'hmbc': {
          const datum = generated2DSpectrum({
            spectrum,
            inputOptions,
            experiment,
            color,
          });
          spectra.push(datum);

          break;
        }
        default:
          break;
      }
    }
  }
  return spectra;
}

function generated1DSpectrum(params: {
  inputOptions: PredictionOptions;
  spectrum: any;
  experiment: string;
  color: string;
}) {
  const { spectrum, inputOptions, experiment, color } = params;

  const { signals, ranges, nucleus } = spectrum;

  const {
    '1d': { nbPoints },
    frequency: freq,
  } = inputOptions;
  const frequency = getFrequency(nucleus, freq);
  const { x, y } = signalsToXY(signals, {
    ...inputOptions['1d'][nucleus],
    frequency,
    nbPoints,
  });
  const datum = initiateDatum1D(
    {
      data: { x, im: null, re: y },
      display: {
        color,
      },
      info: {
        nucleus,
        originFrequency: frequency,
        baseFrequency: frequency,
        pulseSequence: 'prediction',
        solvent: '',
        experiment,
        isFt: true,
      },
    },
    [],
  );
  datum.ranges.values = mapRanges(ranges, datum);
  updateIntegralsRelativeValues(datum);
  return datum;
}

function mapZones(zones: Array<Partial<Zone>>) {
  return zones.reduce<Array<Zone>>((zonesAcc, zone: any) => {
    const { signals, ...resZone } = zone;
    const newSignals = signals.reduce(
      (signalsAcc: Signal2D[], signal: Signal2D) => {
        const { x, y, id, ...resSignal } = signal;
        signalsAcc.push({
          id: id || generateID(),
          kind: 'signal',
          x: { ...x, originDelta: x.delta || 0 },
          y: { ...y, originDelta: y.delta || 0 },
          ...resSignal,
        });
        return signalsAcc;
      },
      [],
    );

    zonesAcc.push({
      id: generateID(),
      ...resZone,
      signals: newSignals,
      kind: DatumKind.signal,
    });
    return zonesAcc;
  }, []);
}

function generated2DSpectrum(params: {
  inputOptions: PredictionOptions;
  spectrum: any;
  experiment: string;
  color: string;
}) {
  const { spectrum, inputOptions, experiment, color } = params;
  const { signals, zones, nuclei } = spectrum;

  const xOption = inputOptions['1d'][nuclei[0]];
  const yOption = inputOptions['1d'][nuclei[1]];

  const width = get2DWidth(nuclei);
  const frequency = getFrequency(nuclei, inputOptions.frequency);

  const spectrumData = signals2DToZ(signals, {
    from: { x: xOption.from, y: yOption.from },
    to: { x: xOption.to, y: yOption.to },
    nbPoints: {
      x: inputOptions['2d'].nbPoints.x,
      y: inputOptions['2d'].nbPoints.y,
    },
    width,
  });

  const datum = initiateDatum2D(
    {
      data: { ...spectrumData, noise: 0.01 },
      display: {
        positiveColor: experiment === 'hmbc' ? '#e68337' : color,
      },
      info: {
        nucleus: nuclei,
        originFrequency: frequency,
        baseFrequency: frequency,
        pulseSequence: experiment,
        experiment: '2d',
      },
    },
    [],
  );
  datum.zones.values = mapZones(zones);
  return datum;
}

function get2DWidth(nucleus: string[]) {
  return nucleus[0] === nucleus[1] ? 0.03 : { x: 0.03, y: 0.32 };
}

function getFrequency(
  nucleus: string | string[],
  inputFrequency: number,
): number | string {
  const ration13C = 0.25;

  if (typeof nucleus === 'string') {
    return nucleus === '13C' ? inputFrequency * ration13C : inputFrequency;
  } else {
    if (nucleus[0] === nucleus[1]) {
      return `${inputFrequency},${inputFrequency}`;
    } else {
      return `${inputFrequency},${inputFrequency * ration13C}`;
    }
  }
}
