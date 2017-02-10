"use strict";
var express = require('express');
var basicAuth = require('./basic-auth');
function noop() { }
var ExpressHTTPServer = (function () {
    function ExpressHTTPServer(options) {
        options = options || {};
        this.ui = options.ui;
        this.distPath = options.distPath;
        this.username = options.username;
        this.password = options.password;
        this.cache = options.cache;
        this.gzip = options.gzip || false;
        this.beforeMiddleware = options.beforeMiddleware || noop;
        this.afterMiddleware = options.afterMiddleware || noop;
        this.app = express();
    }
    ExpressHTTPServer.prototype.serve = function (fastbootMiddleware) {
        var _this = this;
        var app = this.app;
        var username = this.username;
        var password = this.password;
        this.beforeMiddleware(app);
        if (this.gzip) {
            this.app.use(require('compression')());
        }
        if (username !== undefined || password !== undefined) {
            this.ui.writeLine("adding basic auth; username=" + username + "; password=" + password);
            app.use(basicAuth(username, password));
        }
        if (this.cache) {
            app.get('/*', this.buildCacheMiddleware());
        }
        if (this.distPath) {
            app.get('/', fastbootMiddleware);
            app.use(express.static(this.distPath));
            app.get('/assets/*', function (req, res) {
                res.sendStatus(404);
            });
        }
        app.get('/*', fastbootMiddleware);
        this.afterMiddleware(app);
        return new Promise(function (resolve) {
            var listener = app.listen(process.env.PORT || 3000, function () {
                var host = listener.address().address;
                var port = listener.address().port;
                _this.ui.writeLine('HTTP server started; url=http://%s:%s', host, port);
                resolve();
            });
        });
    };
    ExpressHTTPServer.prototype.buildCacheMiddleware = function () {
        var _this = this;
        return function (req, res, next) {
            var path = req.path;
            Promise.resolve(_this.cache.fetch(path, req))
                .then(function (response) {
                if (response) {
                    _this.ui.writeLine("cache hit; path=" + path);
                    res.send(response);
                }
                else {
                    _this.ui.writeLine("cache miss; path=" + path);
                    _this.interceptResponseCompletion(path, res);
                    next();
                }
            })
                .catch(function () { return next(); });
        };
    };
    ExpressHTTPServer.prototype.interceptResponseCompletion = function (path, res) {
        var _this = this;
        var send = res.send.bind(res);
        res.send = function (body) {
            var ret = send(body);
            _this.cache.put(path, body, res)
                .then(function () {
                _this.ui.writeLine("stored in cache; path=" + path);
            })
                .catch(function () {
                var truncatedBody = body.replace(/\n/g).substr(0, 200);
                _this.ui.writeLine("error storing cache; path=" + path + "; body=" + truncatedBody + "...");
            });
            res.send = send;
            return ret;
        };
    };
    return ExpressHTTPServer;
}());
module.exports = ExpressHTTPServer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzcy1odHRwLXNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImV4cHJlc3MtaHR0cC1zZXJ2ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDO0FBRWIsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ25DLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUUxQyxrQkFBaUIsQ0FBQztBQUVsQjtJQUNFLDJCQUFZLE9BQU87UUFDakIsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFFeEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUNqQyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFDakMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUMzQixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDO1FBQ3pELElBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUM7UUFFdkQsSUFBSSxDQUFDLEdBQUcsR0FBRyxPQUFPLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQsaUNBQUssR0FBTCxVQUFNLGtCQUFrQjtRQUF4QixpQkEwQ0M7UUF6Q0MsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNuQixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzdCLElBQUksUUFBUSxHQUFH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