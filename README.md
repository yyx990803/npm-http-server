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
    /path/to/file   The path to a file in that package (optional, defaults to main module)

### Bower Support

In general, we recommend JavaScript libraries do not use Bower because it places additional burdens on package authors for little to no gain. However, we have included support for Bower for the sake of legacy applications that still need to use it for some reason.

To get a Bower bundle from a package that supports it use the `/bower.zip` file path. The zip archive that Bower needs is created dynamically based on the config in `bower.json`. The archive contains `bower.json` and all files listed in its `main` section. For convenience, the `version` number is automatically replaced with the one from `package.json` so there is no need to manually update it.
