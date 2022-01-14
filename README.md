# dvs-2021
viz for the annual data visualization society's competition

### `yarn install`
goes through and installs all dependencies

### `yarn dev`
compiles code and starts a developement server at `http://localhost:1234`.

### `yarn build` or `yarn prototypes-build`
builds static, compiled filed in `dist` folder. Use `prototypes-build` when building for two-n prototype deployment because it sets the correct base URL to be able to load in the assets.

### `yarn deploy`
to deploy to [two-n prototypes site](http://prototypes.two-n.com/dataviz-pay-explorer/).

### `node ./dataPrep.mjs`
parses csv file named `data_2021_main.csv` in `./data` folder and creates a json file called `formattedData.json` that is read into `src/components/App.js`

*requirements for generating data*
* csv must be named `data_2021_main.csv`
