# Neural Network Data Oranizer

## Motivation

This is a project for the bachelor thesis of Lukas Gueldenhaupt for the [Institute for Communications Technology](https://www.ifn.ing.tu-bs.de/en/ifn/sp/).
Tutor for this is [Samy Elshamy](https://www.ifn.ing.tu-bs.de/en/ifn/sp/elshamy/).

## Idea

The idea of this application is to provide an organizer to handle different config and result files for projects at the institute. It should be a generic platform where you
can manage your neural network files independently from its original program, no matter which program was used to create them.

Basic features will be:

- User Login with LDAP
- Upload of configs and results
- Project Dashboard
- Filter for projects/configs/results
- Mappings for config parameters

## NPM Scripts

This boilerplate comes with predefined NPM scripts, defined in `package.json`:

- `$ npm run start` - Run the Meteor application.
- `$ npm run start:prod` - Run the Meteor application in production mode.
- `$ npm run build` - Creates a Meteor build version under `./build/` directory.
- `$ npm run clear` - Resets Meteor's cache and clears the MongoDB collections.
- `$ npm run meteor:update` - Updates Meteor's version and it's dependencies.
- `$ npm run test` - Executes Meteor in test mode with Mocha.
- `$ npm run test:ci` - Executes Meteor in test mode with Mocha for CI (run once).

This package contains:

- TypeScript support (with `@types`) and Angular 2 compilers for Meteor
- Angular2-Meteor
- Angular 2 (core, common, compiler, platform, router, forms)
- SASS, LESS, CSS support (Also support styles encapsulation for Angular 2)
- Testing framework with Mocha and Chai
- [Meteor-RxJS](http://angular-meteor.com/meteor-rxjs/) support and usage


