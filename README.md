# NMRium

React component to display and process nuclear magnetic resonance (NMR) spectra.

<h3 align="center">

  <a href="https://www.zakodium.com">
    <img src="https://www.zakodium.com/brand/zakodium-logo-white.svg" width="50" alt="Zakodium logo" />
  </a>

  <p>
    Maintained by <a href="https://www.zakodium.com">Zakodium</a>
  </p>

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![npm download][download-image]][download-url]

</h3>

## Use it

Visit https://www.nmrium.org for examples of usage.

## Use as a library in a React project

### Install the package

```console
npm install nmrium
```

### OpenChemLib version

This module makes use of `openchemlib/full`.  
If you use OpenChemLib somewhere else in your project, make sure to also import
from `openchemlib/full` to avoid having multiple OCL versions in your bundle.

### Use the component

```jsx
import NMRium from 'nmrium';

function MyComponent() {
  return <NMRium />;
}
```

## Development and testing

There is an automatic build on each commit. You can test the latest build from `master` at:

https://dev.nmrium.org/

Want to play ? You can do some 1D NMR exercises ;)

https://dev.nmrium.org/?sampleURL=https%3A//cheminfo.github.io/nmr-dataset2/toc.json

Also you can do some 2D NMR exercises ;)

https://dev.nmrium.org?sampleURL=https%3A//cheminfo.github.io/nmr-dataset1/data/2d.json

You can do some 1D NMR tests/ exams ;)

https://dev.nmrium.org?sampleURL=https%3A//cheminfo.github.io/nmr-dataset2/exam.json

If you have jcamps accessible from an URL and that your server allow cross-origin you can directly open your file in the demo application:

https://dev.nmrium.org?sampleURL=https%3A//cheminfo.github.io/nmr-dataset2/100-86-7/1h.dx

Link loading the default samples test cases

https://dev.nmrium.org?sampleURL=https%3A%2F%2Fcheminfo.github.io%2Fnmrium%2Fsamples.json#/

### Install and test locally

```console
git clone https://github.com/cheminfo/nmrium.git
cd nmrium
npm i
npm start
```

### General information about the programmation

- Useful vscode plugins:
  - prettier
  - eslint
  - intellicode
  - gitlens
  - live share
  - github pull request
  - Bracket Pair Colorizer
- When you develop 2 different projects in parallel that depends of each other don't forget to use `npm link`.

### Commit messages

Please use `semantic commit messages` : https://www.conventionalcommits.org/en/v1.0.0/

### Programming with React and D3

The idea is to use the approach described in the bottom of the document:
"React for element creation, D3 as the visualization kernel" :
https://medium.com/@Elijah_Meeks/interactive-applications-with-react-d3-f76f7b3ebc71

### Immutable javascript

Please read the following blog post:

https://dev.to/glebec/four-ways-to-immutability-in-javascript-3b3l

And in particular we want to use immer: https://github.com/immerjs/immer

## Publish

```bash
npm version patch
git push --follow-tags
npm publish
```

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/nmrium.svg
[npm-url]: https://npmjs.org/package/nmrium
[ci-image]: https://github.com/cheminfo/nmrium/workflows/Node.js%20CI/badge.svg?branch=master
[ci-url]: https://github.com/cheminfo/nmrium/actions?query=workflow%3A%22Node.js+CI%22
[download-image]: https://img.shields.io/npm/dm/nmrium.svg
[download-url]: https://npmjs.org/package/nmrium
