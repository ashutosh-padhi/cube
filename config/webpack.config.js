/* eslint-disable */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var packageJson = require('../package.json');
var envConfig = require('dotenv').config();
var globalDefinations = { VERSION: `"${packageJson.version}"` };
var _envConfig;
var imageNames = ['white', 'yellow', 'red', 'green', 'orange', 'blue'];
for (_envConfig in envConfig.parsed) {
        if (envConfig.parsed.hasOwnProperty(_envConfig)) {
                globalDefinations['$_' + _envConfig] = envConfig.parsed[_envConfig];
        }
}
var sassEnvVariables = `
    $env-size: ${globalDefinations.$_SIZE};
    $env-side: ${globalDefinations.$_SIDE};
    `;
if (
        globalDefinations.$_STYLE_BACK_IMAGE_ENABLED &&
        globalDefinations.$_STYLE_BACK_IMAGE_ENABLED.toLowerCase() === 'true'
) {
        (function generateImagesAssets() {
                sassEnvVariables += `$env-background-enabled: true;`;
                var imageSize = +globalDefinations.$_SIDE * +globalDefinations.$_SIZE;
                imageNames.forEach(function (imageName) {
                        var fullImageName = `${imageName}.png`;
                        var imagePath = path.join(__dirname, '..', 'res', fullImageName);
                        if (fs.existsSync(imagePath)) {
                                sassEnvVariables += `$${imageName}-image: url(../images/${fullImageName});`;
                                sharp(imagePath)
                                        .resize(imageSize)
                                        .toFile(
                                                path.join(
                                                        __dirname,
                                                        '..',
                                                        'src',
                                                        'web',
                                                        'assets',
                                                        'images',
                                                        fullImageName
                                                ),
                                                function (err, info) {
                                                        if (err) {
                                                                throw err;
                                                        }
                                                        console.log(info);
                                                }
                                        );
                        }
                });
        })();
} else {
        sassEnvVariables += `$env-background-enabled: false;
    $white-image: none;
    $yellow-image: none;
    $red-image: none;
    $green-image: none;
    $orange-image: none;
    $blue-image: none;
    `;
}

var config = {
        entry: './src/web/index.js',
        output: {
                filename: 'bundle.js',
                path: path.resolve(__dirname, '../dist'),
        },
        module: {
                rules: [
                        {
                                test: /\.s[ac]ss$/i,
                                use: [
                                        'style-loader',
                                        'css-loader',
                                        {
                                                loader: 'sass-loader',
                                                options: {
                                                        additionalData: sassEnvVariables,
                                                },
                                        },
                                ],
                        },
                        {
                                test: /\.css$/i,
                                use: ['style-loader', 'css-loader'],
                        },
                        {
                                test: /\.tmpl\.htm[l]+$/i,
                                use: ['html-loader'],
                        },
                        {
                                test: /\.pug$/,
                                loader: '@webdiscus/pug-loader',
                        },
                        {
                                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                                type: 'asset/resource',
                        },
                ],
        },
        plugins: [
                new HtmlWebpackPlugin({
                        template: './src/web/index.html',
                }),
                new webpack.DefinePlugin(globalDefinations),
        ],
};
if (process.env.NODE_ENV === 'development') {
        config.mode = 'development';
        config.devtool = 'source-map';
        config.devServer = {
                static: {
                        directory: path.join(__dirname, '../dist'),
                },
                compress: true,
                port: 9000,
        };
} else {
        config.mode = 'production';
}
module.exports = config;
