const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'https://meerfans.github.io/meerFaucet',
            ws: true,
            secure: false,
            changeOrigin: true,
            pathRewrite: {
                "^/api": "/",
            }
        })
    );
    // app.use(
    //     '/api',
    //     createProxyMiddleware({
    //         target: 'http://47.111.233.176:18546/',
    //         secure:false,
    //         changeOrigin: true,
    //         pathRewrite: {
    //             "^/api": "/",
    //         }
    //     })
    // );
};

// 设置代理跨域