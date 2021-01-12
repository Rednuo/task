const   path = require('path'),
        webpack = require('webpack'),
        ExtractTextPlugin = require("extract-text-webpack-plugin"),
        AssetsPlugin = require('assets-webpack-plugin'),
        WebpackChunkHash = require("webpack-chunk-hash"),
        argv = require('yargs').argv;

const   browsers = [
            'Android >= 4',
            'iOS >= 7',
        ];

module.exports = {
    cache: true,
    context: path.join(__dirname, "./tasks/assets"),
    entry: {
        vendors: ['./js/babel.js','react','react-dom','fastclick','axios','js-cookie'],
        newUserBenefits:["./js/pages/newUserBenefits/index.js"],
        yqNewUserBenefits:["./js/pages/yqNewUserBenefits/index.js"],
        ttTaskCenter:["./js/pages/ttTaskCenter/index.js"],
        rewardCenter2: ["./js/pages/rewardCenter2/index.js"],
        yqTaskCenter: ["./js/pages/yqTaskCenter/index.js"],
        rewardCenter2ForiOSMain: ["./js/pages/rewardCenter2/indexForiOSMain.js"],
        rewardCenter2ForiOSFantuan: ["./js/pages/rewardCenter2/indexForiOSFantuan.js"],
        rewardCenter2ForAndroidMain: ["./js/pages/rewardCenter2/indexForAndroidMain.js"]
    },
    output: {
        path: path.join(__dirname, './tasks/dist'),
        filename: 'js/[name].[chunkhash:12].164.js',
        publicPath: '/tasks/dist/'
    },
    resolve: {
        modules: [
            path.join(__dirname, "./tasks/assets"),
            "node_modules"
        ]
    },
    plugins: [
        new WebpackChunkHash(),
        new webpack.optimize.CommonsChunkPlugin({ name: 'vendors', filename: 'js/vendors.[chunkhash:12].164.js' }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new ExtractTextPlugin({
            filename: "css/[name].[contenthash:12].css",
            disable: false,
            allChunks: true
        }),
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: '"production"'
          }
        }),
        new AssetsPlugin({
            filename:'/tasks/dist/webpack.assets.js',
            processOutput:function(assets){
                return 'window.WEBPACK_ASSETS='+JSON.stringify(assets);
            }
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': 'production'
        }),
        new webpack.HashedModuleIdsPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin()
    ],
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: [
                        ['@babel/preset-env',{
                            useBuiltIns: "usage",
                            modules: false,
                            targets: {browsers},
                            corejs: 2,
                        }],
                        ['@babel/preset-react']
                    ],
                    plugins: [
                        ["@babel/plugin-transform-runtime", {
                            corejs: 2,
                            helpers: true,
                            regenerator: true,
                            useESModules: false
                        }]
                    ]
                }
            }]
        }, {
            test: /\.(woff|woff2|eot|ttf|otf)\??.*$/,
            use: ['url-loader?limit=8192&name=[name].[ext]']
        }, {
            test: /\.(jpe?g|png|gif|svg)\??.*$/,
            use: ['url-loader?limit=4096&name=image/[hash:12].[name].[ext]']
        }, {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                use: ["css-loader"],
                fallback: "style-loader"
            })
        }, {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                use: [{
                    loader:"css-loader",
                },{
                    loader:"sass-loader",
                },{
                    loader: "postcss-loader",
                    options: {
                        ident: 'postcss',
                        plugins: [
                            require("autoprefixer")({
                                'browsers': browsers
                            })
                        ]
                    }
                }],
                fallback: "style-loader"
            })
        }]
    }
};