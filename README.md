BookwormGUI
-------------

The line chart visualization for Bookworm.

Settings are in `static/options.json`.
Example configurations are in `static/examples/`.

Bookworm API endpoints allow cross-origin requests by default,
so you can run this visualization on a different server than wherever you set up the back end, or
even on your computer.

For example, to run a HathiTrust+Bookworm visualization on your computer:
- Copy `static/examples/options.hathitrust.json` to `static/options.json`. Note the optional 'host' argument pointing to server. 
- Run a local web server, e.g. with `python -m http.server`
