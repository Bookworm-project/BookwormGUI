'use strict';

var webpack = require('webpack'),
    jsPath  = 'app',
    path = require('path'),
    srcPath = path.join(__dirname, 'app');

var isProd = (process.env.NODE_ENV === 'production');

function getPlugins() {
    var plugins = [];

    // Always expose NODE_ENV to webpack, you can now use `process.env.NODE_ENV`
    // inside your code for any environment checks; UglifyJS will automatically
    // drop any unreachable code.
    plugins.push(new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': process.env.NODE_ENV
        }
    }));

    // Conditionally add plugins for Production builds.
    if (isProd) {
        plugins.push(new webpack.optimize.UglifyJsPlugin());
    }

    return plugins;
}

var config = {
    target: 'web',
    entry: {
        app: path.join(srcPath, 'app.jsx')
        //, common: ['react-dom', 'react']
    },
    resolve: {
        alias: {},
        extensions: ['.js', '.jsx']
    },
    devServer: {
      contentBase: path.join(__dirname),
      compress: false,
      port: 8684
    },
    output: {
        path:path.resolve(__dirname, jsPath, 'build'),
        publicPath: '',
        filename: '[name].js'
    },

    module: {
        loaders: [
            {
                test: /\.(js|jsx)?$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            { test: /vendor\/.+\.(jsx|js)$/,
              loader: 'imports-loader?jQuery=jquery,$=jquery,this=>window'
            },
            {
                test: /\.scss$/,
                include: /\/app\/assets/,
                loader: 'style!css!sass'
            }
        ]
    },
    plugins: getPlugins()
};

module.exports = config;
