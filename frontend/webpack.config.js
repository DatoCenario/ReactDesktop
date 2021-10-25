module.exports = {
    mode: 'production',
    entry: ["@babel/polyfill", './index.tsx'],
    output: {
        path: `${__dirname}/build`,
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['', '.js', '.ts', '.tsx'],
    },
    module: {
        rules: [
          {
            test: /\.(tsx|jsx)$/,
            use: {
              loader: 'babel-loader'
            }
          }
        ]
      }
}