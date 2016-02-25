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
        if (!(new RegExp(expr)).test(req.url) ||
            !self.configs.rules[expr]) {
            continue;
        }
        var ruleParts = self.configs.rules[expr].split(' ');
        var target = ruleParts[0]
        var removeText = ruleParts[1];
        if (removeText) {
            req.url = req.url.replace(removeText, "");
        }
        if (req.url == "") {
            req.url = "/";
        }
        return self.proxy.web(req, res, {
            target: target
        });
    }
    next();
};

module.exports = ProxyFilter;