# Heroes of the Aturi Cluster ship builder

This project is a web based ship builder and campaign tracker for the "Heroes of the Aturi Cluster" campaign for the x-wing miniatures game. The concept was originally built to help my campaign players understand all the options for upgrading their ships in one place. It provides a web based interface to spend Xp on upgrades and track XP throughout your pilots time in the campaign. Ship builds can be shared via unique URLs.

A live version can be found at: [http://hotac-ship-builder.netlify.com](http://hotac-ship-builder.netlify.com)

The project is written entirely in javascript and html. Styling is generated using the Sass preprocessor.

Thsi project owes many thanks to two x-wing projects without which, this would have not been possible:
* [x-wing miniatures data](https://github.com/guidokessels/xwing-data)
* [x-wing miniatures font](https://github.com/geordanr/xwing-miniatures-font)

## Contributing
* Bugfix pull requests are welcome
* For larger feature changes, please raise an issue first to discuss the approach and possible ideas

### Testing
* This project makes use of CircleCI for implementing automated testing on branches and pull requests
* Tests must pass before merging to master
* Stylistic rules are provided by sass-lint and eslint, and should be adhered to to pass the tests

## Development

### Requirements
* nodeJS 7+
* npm
* bower `npm install -g bower`
* gulp `npm install -g gulp`

### Setup
* Clone the repo
* Run `npm install` in the project root
* Run `bower install` in the project root
* Run `gulp dev`
  * This will compile the javascript, css and auto-recompile any changes to these via gulp watch
  * Gulp will start a local web server on port 8000 which can be accessed at http://localhost:8000
  * The gulp server has liverelaod enabled, so chnages to html, js or css will automatically be refreshed

### Deploy
* Run `gulp` to create a deployable folder in the `\app` directory which can be copied to any web server
* The master branch of the original repo is automatically deployed to netlify

### Structure
* `app/`
  * Contains `index.html` which is the main entry point
  * Also contains a static `images/` folder. Everything else in here is automatically compiled by gulp
  * The project uses CDN versions of material lite js/css framework, the featherlight library, and 
* `js-src/` - Contains the javascript source.
  * This uses `main.js` as the entry point and is compiled to a single JS file in the app using browserify
  * Javascript uses only jQuery and lodash libraries and implements a loose coupling between "models" and "views" via `controllers/page.js`
* `node/` - Contains node.js modules for use by the gulp tasks
* `sass/` - Contains the project sass. `main.sass` is the entry point, which includes the other sass files.
