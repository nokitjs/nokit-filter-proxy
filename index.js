var httpProxy = require("http-proxy");

function ProxyFilter(server) {
  var self = this;
  var utils = self.utils = server.require("$./core/utils");
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
  //新建一个代理 Proxy Server 对象  
  self.proxy = httpProxy.createProxyServer(self.configs.options);
  //proxy req 
  self.onProxyReqHandler = self.onProxyReqHandler.bind(self);
  self.proxy.on("proxyReq", self.onProxyReqHandler);
};

ProxyFilter.prototype.onProxyReqHandler = function(proxyReq, req, res, options) {
  var self = this;
  if (!self.configs.headers) return;
  self.utils.each(self.configs.headers, function(name, value) {
    proxyReq.setHeader(name, value);
  });
};

ProxyFilter.prototype.matchRule = function(url) {
  var self = this;
  var rule = null;
  self.utils.each(self.configs.rules, function(exprText, target) {
    var expr = new RegExp(exprText);
    if (expr.test(url)) {
      var urlParts = expr.exec(url);
      rule = {
        url: urlParts.length > 1 ? urlParts[1] : url,
        target: target
      };
    }
  });
  return rule;
};

ProxyFilter.prototype.onRequest = function(context, next) {
  var self = this;
  var res = context.res,
    req = context.req;
  //匹配规则表达式
  var rule = self.matchRule(req.url);
  if (!rule) return next();
  req.url = rule.url || "/";
  //代理请求
  self.proxy.web(req, res, {
    "target": rule.target
  });
};

module.exports = ProxyFilter;