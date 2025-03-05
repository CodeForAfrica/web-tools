Media Cloud Web Tools
=====================

This is a shared repository for all the front-facing [Media Cloud](https://mediacloud.org) web tools.
This includes:
 * [Explorer](https://explorer.civicsignal.africa)
 * [Source Manager](https://sources.civicsignal.africa)
 * [Topic Mapper](https://topics.civicsignal.africa)
 * [Tools](https://tools.civicsignal.africa)

**Check out the `doc` folder for more documentation.**

Dev Installation
----------------

Git:
 * `git submodule update --init --recursive`

Python:
 * Follow the instructions in `doc/python-versions.md` to setup Python the way we do
 * Once you've got Python setup, install the requirements by running `pip install -r requirements.txt`

Node and npm:
 * On Windows, make sure to create an environment variable: `set NODE_ENV=dev`
 * make sure your node installation is up-to-date (we work with v8.2.1 right now)
 * `npm install` to install all the package dependencies (as specified in the `package.json`)

MongoDB:
[Install MongoDb](https://docs.mongodb.com/manual/administration/install-community/):
* `brew tap mongodb/brew`
* `brew install mongodb-community@4.4`
If you get a connection refused error, make sure you've started the server by running `brew services start mongodb-community@4.4`

Redis:
[Install Redis](http://redis.io/)  We develop on OS X and install via the [HomeBrew package manager](http://brew.sh): `brew install redis`

MemCache:
On OSX, make sure to run `brew install libmemcached` otherwise you'll get an error about pylibmc failing to install (http://brew.sh)


Configuration
-------------

Copy `config/app.config.template` to `config/app.config` and fill in the required info there.

**NOTE**: `MEDIA_CLOUD_API_KEY` and `MEDIA_CLOUD_API_URL` are **required**. You can find your `MEDIA_CLOUD_API_KEY` on your profile page.

Running the Apps
----------------

You need to open two terminal windows and run one thing in each (so the hot-reloading can work):
 * `redis-server` to start redis (if it's not running already)
 * `npm run topics-dev` or `npm run sources-dev`
 * `python run.py`
    - if you get flask errors, run the `pip install -r requirements.txt` line again. On Mac Osx, you may need to run with --ignore-installed

Toolchain
---------

You will make your life easier by installing these tools:
 * [PyCharm](https://www.jetbrains.com/pycharm/) - our IDE of choice for Python development
 * [Redux DevTools Chrome extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
 * [React Developer Tools Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi).
 * Set up your environment with [SublimeText](https://www.sublimetext.com) and linting following [these instructions](https://medium.com/planet-arkency/catch-mistakes-before-you-run-you-javascript-code-6e524c36f0c8#.1mela5864).
 * Note - you need to tell Sublime to install the Sublime package control manager and then you need to install the necessary packages using Sublime's command line. That's all there in the link, just make sure you follow the prompts explicity.
 * To browse your local DB on a Mac use [MongoHub](https://github.com/bububa/MongoHub-Mac), or [MongoExpress for a web-based UI](https://github.com/mongo-express/mongo-express)

Development
-----------

Python linting rules can be found in `.pylintrc`. To run linting run:

```
make lint.py
```

To run JS linting rules:

```
npx eslint
```

We use PyCharm and run linting on the flying using the
[pylint-pycharm](https://github.com/leinardi/pylint-pycharm) plugin.
After installing it, enable real-time inspection:
* Preferences > Editor > Inspections > Pylint
* Check "Pylint real-time scan"


A pre-commit hooks will run JavaScript linting (e.g. when you commit, linting will be run). You can try to automatically fix JavaScript linting errors by running:

```shell
$ npm run lint_fix
```

Not all errors can be fixed this way and for more details about the linting error see [eslint](https://eslint.org).

Using Docker
-------------

You can use Docker for development and building a production image with Make commands. 

To start an application in development, use the following convention: `make <APP_NAME>-dev`. For example, you can run `make tools-dev`, `make sources-dev`, `make explorer-dev`, or `make topics-dev` to start tools, sources, explorer or topics, respectively. 

To build a production image, run the following command:

```
make release SUPPORT_URL=<SUPPORT_URL> IMAGE_TAG=<TAG> PLATFORM=<PLATFORM> .
```
