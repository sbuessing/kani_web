# Configuring environment.
npm install -g @angular/cli

npm install -g firebase-tools

npm install

firebase login


## Most common config.

npm run emulators, ng serve, and functions/npm run hotreload 


## Site commands

npm run emulators

ng serve - Hitting prod

npm run e-start   - website hitting all emulators.

npm run updateStaging

npm run updateProd

## Functions commands in /functions:

npm run hotreload

npm run serve   - Hot reloads functions with only the one emulator.

npm run deploy


## Configuring Firebase

Along with the normal in-UI setup, you must turn on file download:
https://firebase.google.com/docs/storage/web/download-files
gsutil cors set cors.json gs://kanireader.appspot.com

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Deploy
Make sure data/words/ copied to site/src/assets/words/
Run `ng build` first.
Run `firebase deploy` to deploy everything.

Or ./deploysite.sh


## Further help
To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
