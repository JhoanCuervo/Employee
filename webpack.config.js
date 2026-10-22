const GasPlugin = require("gas-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

const assignPath = (pathUser) => path.resolve(__dirname, pathUser ? pathUser : '')

const entry = assignPath('./src/Index.ts');
const outDir = assignPath('./server');
const outName = 'code.js';

module.exports = {
    mode: "production",
    entry,
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    output: {
        path: outDir,
        filename: outName,
    },
    plugins: [
        new GasPlugin({
            autoGlobalExportsFiles: [entry],
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },

    devtool: false,
};
