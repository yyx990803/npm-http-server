# npm-http-server

npm-http-server is a small HTTP server that serves up files from npm packages.

## Installation

    $ npm install npm-http-server

## Configuration and Usage

    registryURL     The URL of the npm registry, defaults to https://registry.npmjs.org
    port            The TCP port to bind, defaults to 5000
    bowerBundle     The URL to use for Bower zip files, defaults to /bower.zip

Set configuration variables using [`npm config`](https://docs.npmjs.com/cli/config):

    $ npm config set npm-http-server:port 8080

Then, use `npm start` to start the server.

## URL Format

npm-http-server recognizes URLs in the format `/package@version/path/to/file` where:

    package         The @scope/name of an npm package (scope is optional)
    version         The version, version range, or tag
    /path/to/file   The path to a file in that package (optional, defaults to main module)

### Bower Support

To get a Bower bundle from a package that supports it use the `/bower.zip` file path. The zip archive that Bower needs is created dynamically based on the config in `bower.json`. The archive contains `bower.json` and all files listed in its `main` section. For convenience, the `version` number is automatically replaced with the one from `package.json` so there is no need to manually update it.

**Please note: *We do NOT recommend JavaScript libraries use Bower*.** It was originally written to solve the problem of bundling CSS and other static assets together with JavaScript in a single package. However, that problem is much more ably solved by bundlers like webpack and Browserify at build time. Additionally, Bower requires JavaScript libraries to check their build into GitHub (see [why this is bad](https://medium.com/@kentcdodds/why-i-don-t-commit-generated-files-to-master-a4d76382564#.txdxyz5gy)) and publish to the Bower registry, both of which are extra overhead that JavaScript libraries should be able to avoid by publishing just the source to npm and using a postinstall script to generate the build.
