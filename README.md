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

npm-http-server recognizes URLs in the format `/:packageSpec/:file` where:

    packageSpec     The name of a package on npm + version number, e.g. history@1.12.5
    file            The path to a file in that package

Your `packageSpec` can also use an [npm dist-tag](https://docs.npmjs.com/cli/dist-tag) instead of a version number, or omit the version number entirely to automatically use the `latest` tag, but you won't get the same long-term caching benefits. An example URL looks like:

    /history@1.12.5/umd/History.min.js
