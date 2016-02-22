var httpProxy = require("http-proxy");

function ProxyFilter(server) {
    var self = this;
    //读取配置
    self.configs = server.configs.proxy || {};
    self.configs.options = self.configs.options || {};
    self.configs.rules = self.configs.rules || {};
    // 新建一个代理 Proxy Server 对象  
    self.proxy = httpProxy.createProxyServer(self.configs.options);
};

ProxyFilter.prototype.onRequest = function (context, next) {
    var self = this;
    var res = context.res,
        req = context.req;
    for (var expr in self.configs.rules) {
        if (new RegExp(expr).test(req.url)) {
            var target = self.configs.rules[expr];
            return self.proxy.web(req, res, {
                target: target
            });
        }
    }
    next();
};

module.exports = ProxyFilter;