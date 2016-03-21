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

ProxyFilter.prototype.parseRule = function(expr, target) {
  var self = this;
  var targetParts = target.split(' ');
  var target = targetParts[0]
  var removeText = targetParts[1];
  return {
    "expr": expr,
    "target": target,
    "removeText": removeText
  };
};

ProxyFilter.prototype.matchRuleExpr = function(url) {
  var self = this;
  var ruleExpr = null;
  for (var expr in self.configs.rules) {
    if ((new RegExp(expr)).test(url)) {
      ruleExpr = expr
    }
  }
  return ruleExpr;
};

ProxyFilter.prototype.onRequest = function(context, next) {
  var self = this;
  var res = context.res,
    req = context.req;
  //匹配规则表达式
  var ruleExpr = self.matchRuleExpr(req.url);
  if (!ruleExpr) return next();
  //解析规则
  var rule = self.parseRule(ruleExpr, self.configs.rules[ruleExpr]);
  if (rule.removeText) {
    req.url = req.url.replace(rule.removeText, "") || "/";
  }
  //代理请求
  self.proxy.web(req, res, {
    "target": rule.target
  });
};

module.exports = ProxyFilter;