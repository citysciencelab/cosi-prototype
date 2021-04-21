# Prototype for CoSI – Cockpit for Social Infrastructure

The CoSI protoype was developed in 2019 by the CityScienceLab as a proof of concept.
The prototype is a sophisticated web-GIS application currently evolving towards a planning support system for social infrastrcuture planners.

![CoSI Video](https://drive.google.com/uc?export=view&id=1ABGo_bBoE5uny4XcFliBhZcMwl8oUy8z)

The prototype has been adapted to work in the [Urban Data Platform](http://www.urbandataplatform.hamburg/) environment and is now based on the [Masterportal](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src) (Hamburg's Urban Data Platform Web-Gis) code.
The most recent version can be found here:
https://github.com/citysciencelab/cosi

CoSI Publications :
https://www.researchgate.net/publication/344340813_Cockpit_Social_Infrastructure_-_Developing_a_planning_support_system_in_Hamburg
International Journal of E-Planning Research (IJEPR): currently in review

CoSI is also mentioned in the 'Digital Strategy for Hamburg':
https://www.hamburg.de/contentblob/14924946/e80007b350f1abdc455cfaea7e8cd76c/data/download-digitalstrategie-englisch.pdf

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.7.


## Installing

```
npm install
```

## Configuration

Copy the configuration template from `src/app/config-dist.json` to `src/app/config.json` and adjust it to your needs.
Data for the Infoscreen is currently saved locally in `src\assets\data`.
The configuration for the data sources for the layers is done via `src\app\config.json`.
Due to data protection these sources are partially on our local server.

## Development server

Run `ng serve --aot` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

Run `ng serve --aot --locale de-DE --i18nFile src/locale/messages.de-DE.xlf` for a localized version. Add the `--host 0.0.0.0` parameter if you want to access the app from another computer in the network.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
