import { Draft } from 'immer';

import { State } from '../../../component/reducer/Reducer';
import { Molecule } from '../../molecules/Molecule';
import { Datum1D, Integrals, Ranges } from '../../types/data1d';
import { SumOptions } from '../../types/data1d/SumOptions';
import getAtom from '../../utilities/getAtom';

import {
  isSpectrum1D,
  updateRangesRelativeValues,
  updateIntegralsRelativeValues,
} from '.';

export interface SumParams {
  nucleus: string;
  molecules: Molecule[];
}

export type SetSumOptions = Omit<SumOptions, 'isSumConstant'>;

export function initSumOptions(options: SumOptions, params: SumParams) {
  let newOptions = { ...options };
  const { molecules, nucleus } = params;

  if (options.sumAuto && Array.isArray(molecules) && molecules.length > 0) {
    const { mf, key } = molecules[0];
    newOptions = { ...newOptions, sumAuto: true, mf, moleculeKey: key };
  } else {
    const { mf, moleculeKey, ...resOptions } = newOptions;
    newOptions = { ...resOptions, sumAuto: false };
  }
  if (!newOptions.sum) {
    newOptions.sum = getSum(newOptions.mf || null, nucleus);
  }

  return newOptions;
}

export function getSum(mf: string | null | undefined, nucleus: string) {
  const defaultSum = 100;

  if (!mf || !nucleus) return defaultSum;

  const atom = getAtom(nucleus);
  const atoms = getAtoms(mf);

  return atoms[atom] ? atoms[atom] : defaultSum;
}

export function setSumOptions(
  data: Ranges | Integrals,
  params: { options: SetSumOptions; nucleus: string },
) {
  const { nucleus, options } = params;
  if (options.sumAuto) {
    const { mf, moleculeKey } = options;
    const sum = getSum(mf, nucleus);
    data.options = { ...data.options, sumAuto: true, moleculeKey, mf, sum };
  } else {
    const { mf, moleculeKey, ...resOptions } = data.options;
    data.options = { ...resOptions, sumAuto: false, sum: options.sum };
  }
}

export function getAtoms(mf: string): Record<string, number> {
  const result = {};
  // eslint-disable-next-line prefer-named-capture-group
  const data = mf.split(/(\d+)/);
  for (let i = 0; i < data.length - 1; i = i + 2) {
    result[data[i]] = Number(data[i + 1]);
  }
  return result;
}

/**
 * change the sum for ranges and integrals in all spectra based on molecule
 * it handle three cases
 * 1 - edit and existing molecule
 * 2- delete molecule / edit molecule and as a result of that it generate more than one molecule
 * 3- add a molecule for the first time
 * @param draft     State draft
 * @param molKey    Molecule key
 * @param molecule  Molecules list
 */
export function changeSpectraRelativeSum(
  draft: Draft<State>,
  molKey: string,
  molecule: Molecule,
) {
  const keys: (keyof Datum1D)[] = ['ranges', 'integrals'];

  for (const spectrum of draft.data) {
    if (isSpectrum1D(spectrum)) {
      for (const key of keys) {
        const { moleculeKey, mf, sumAuto } = spectrum[key].options;

        if ((molKey === moleculeKey || (!moleculeKey && !mf)) && sumAuto) {
          const options: Partial<SetSumOptions> = molecule
            ? {
                mf: molecule.mf,
                moleculeKey: molecule.key,
              }
            : {
                mf: undefined,
                moleculeKey: undefined,
              };

          setSumOptions(spectrum[key], {
            nucleus: spectrum.info.nucleus,
            options: { ...options, sumAuto: true, sum: undefined },
          });
          updateRangesRelativeValues(spectrum, true);
          updateIntegralsRelativeValues(spectrum, true);
        }
      }
    }
  }
}