# npm-http-server

npm-http-server is a small HTTP server that serves up files from npm packages.

## Installation

    $ npm install npm-http-server

## Configuration and Usage

    registryURL     The URL of the npm registry, defaults to https://registry.npmjs.org
    port            The TCP port to bind, defaults to 5000

Set configuration variables using [`npm config`](https://docs.npmjs.com/cli/config):

    $ npm config set npm-http-server:port 8080

Then, use `npm start` to start the server.

## URL Format

npm-http-server recognizes URLs in the format `/package@version/path/to/file` where:

    package         The @scope/name of an npm package (scope is optional)
    version         The version, version range, or tag
    /path/tofile    The path to a file in that package (optional, defaults to main module)
