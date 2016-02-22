var httpProxy = require("http-proxy");

function ProxyFilter(server) {
    var self = this;
    var utils = server.require("$./core/utils");
    //读取配置
    self.configs = server.configs.proxy || {};
    self.configs.options = self.configs.options || {};
    if (utils.isNull(self.configs.options.xfwd)) {
        self.configs.options.xfwd = true;
    }
    if (utils.isNull(self.configs.options.changeOrigin)) {
        self.configs.options.changeOrigin = true;
    }
    self.configs.rules = self.configs.rules || {};
    // 新建一个代理 Proxy Server 对象  
    self.proxy = httpProxy.createProxyServer(self.configs.options);
};

ProxyFilter.prototype.onRequest = function (context, next) {
    var self = this;
    var res = context.res,
        req = context.req;
    for (var expr in self.configs.rules) {
        var exprParts = expr.split(' ');
        var exprText = exprParts[0]
        var removeText = exprParts[1];
        if (new RegExp(exprText).test(req.url)) {
            if (removeText) {
                req.url = req.url.replace(removeText, "");
            }
            if (req.url == "") {
                req.url = "/";
            }
            var target = self.configs.rules[expr];
            return self.proxy.web(req, res, {
                target: target
            });
        }
    }
    next();
};

module.exports = ProxyFilter;