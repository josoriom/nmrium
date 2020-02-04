import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MF } from 'react-mf';
import { StructureEditor } from 'react-ocl/full';
import { Molecule } from 'openchemlib';

import NMRDisplayer from '../../component/NMRDisplayer.jsx';

async function loadData(file) {
  const response = await fetch(file);
  checkStatus(response);
  const data = await response.json();
  return data;
}

function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

const styles = {
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  nmrContainer: {
    height: '60%',
  },

  bottomContainer: {
    display: 'flex',
  },
  bottomRightContainer: {
    width: '50%',
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
  },
  MF: {
    height: '20%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    border: '1px dashed gray',
  },
  resultContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '80%',
  },

  result: {
    width: '50%',
    height: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
  },

  StructureEditor: {
    backgroundColor: 'white',
    flex: '1',
  },
};

export default function Exercise(props) {
  const [data, setData] = useState();
  const [resultFlag, setResultFlag] = useState(null);
  const { file, title, baseURL } = props;

  const checkAnswer = useCallback(
    (response) => {
      if (
        data &&
        data.molecules &&
        data.molecules[0] &&
        data.molecules[0].molfile
      ) {
        const MolResult = Molecule.fromMolfile(data.molecules[0].molfile);
        const MolResponse = Molecule.fromMolfile(response);
        const idCodeResult = MolResult.getIDCode();
        const idCodeResponse = MolResponse.getIDCode();
        // console.log({ idCodeResponse, idCodeResult });
        if (idCodeResult === idCodeResponse) {
          // correct answer
          setResultFlag(true);
        } else {
          setResultFlag(false);
          // wrong answer
        }
      }
    },
    [data],
  );

  const MFResult = useMemo(() => {
    let mf = '';
    if (
      data &&
      data.molecules &&
      data.molecules[0] &&
      data.molecules[0].molfile
    ) {
      const molecule = Molecule.fromMolfile(data.molecules[0].molfile);
      mf = molecule.getMolecularFormula().formula;
      return mf;
    }

    return '';
    // need to display the MF somehow
  }, [data]);

  useEffect(() => {
    if (file) {
      loadData(file).then((d) => {
        const _d = JSON.parse(JSON.stringify(d).replace(/\.\/+?/g, baseURL));
        setData(_d);
      });
    } else {
      setData({});
    }
  }, [baseURL, file, props]);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 30,
      }}
    >
      <h5 className="title">
        Display and process 1D NMR spectra from a jcamp-dx file
      </h5>
      <p className="category">{title}</p>
      <div style={styles.mainContainer}>
        <div style={styles.nmrContainer}>
          <NMRDisplayer
            data={data}
            preferences={{
              panels: {
                hidePeaksPanel: true,
                hideInformationPanel: true,
                hideRangesPanel: true,
                hideStructuresPanel: true,
                hideFiltersPanel: true,
              },
            }}
          />
        </div>
        <div style={styles.bottomContainer}>
          <div style={styles.StructureEditor}>
            <StructureEditor
              svgMenu={true}
              fragment={false}
              onChange={checkAnswer}
            />
          </div>
          <div style={styles.bottomRightContainer}>
            <div style={styles.MF}>
              <MF style={{ color: 'navy', fontSize: 30 }} mf={MFResult} />
            </div>
            <div
              style={{
                ...styles.resultContainer,
              }}
            >
              <div
                style={{
                  ...styles.result,
                  backgroundColor:
                    resultFlag == null ? 'white' : resultFlag ? 'green' : 'red',
                  color: resultFlag == null ? 'black' : 'white',
                }}
              >
                {resultFlag == null ? (
                  <p>Result</p>
                ) : resultFlag === true ? (
                  <p>Right Molecule</p>
                ) : (
                  <p>Wrong Molecule !!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
