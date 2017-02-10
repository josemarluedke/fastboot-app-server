"use strict";
var FastBoot = require('fastboot');
var fastbootMiddleware = require('fastboot-express-middleware');
var ExpressHTTPServer = require('./express-http-server');
var Worker = (function () {
    function Worker(options) {
        this.distPath = options.distPath;
        this.httpServer = options.httpServer;
        this.ui = options.ui;
        this.cache = options.cache;
        this.gzip = options.gzip;
        this.username = options.username;
        this.password = options.password;
        this.beforeMiddleware = options.beforeMiddleware;
        this.afterMiddleware = options.afterMiddleware;
        this.resilient = options.resilient;
        if (!this.httpServer) {
            this.httpServer = new ExpressHTTPServer({
                ui: this.ui,
                distPath: this.distPath,
                cache: this.cache,
                gzip: this.gzip,
                username: this.username,
                password: this.password,
                beforeMiddleware: this.beforeMiddleware,
                afterMiddleware: this.afterMiddleware,
            });
        }
        if (!this.httpServer.cache) {
            this.httpServer.cache = this.cache;
        }
        if (!this.httpServer.distPath) {
            this.httpServer.distPath = this.distPath;
        }
        if (!this.httpServer.ui) {
            this.httpServer.ui = this.ui;
        }
    }
    Worker.prototype.start = function () {
        if (!this.distPath) {
            this.middleware = this.noAppMiddleware();
        }
        else {
            this.middleware = this.buildMiddleware();
        }
        this.bindEvents();
        this.serveHTTP();
    };
    Worker.prototype.bindEvents = function () {
        var _this = this;
        process.on('message', function (message) { return _this.handleMessage(message); });
    };
    Worker.prototype.handleMessage = function (message) {
        switch (message.event) {
            case 'reload':
                this.fastboot.reload();
                break;
            case 'error':
                this.error = message.error;
                break;
            case 'shutdown':
                process.exit(0);
                break;
        }
    };
    Worker.prototype.buildMiddleware = function () {
        this.fastboot = new FastBoot({
            distPath: this.distPath,
            resilient: this.resilient
        });
        return fastbootMiddleware({
            fastboot: this.fastboot
        });
    };
    Worker.prototype.serveHTTP = function () {
        this.ui.writeLine('starting HTTP server');
        return this.httpServer.serve(this.middleware)
            .then(function () {
            process.send({ event: 'http-online' });
        });
    };
    Worker.prototype.noAppMiddleware = function () {
        var _this = this;
        return function (req, res) {
            var html = '<h1>No Application Found</h1>';
            if (_this.error) {
                html += '<pre style="color: red">' + _this.error + '</pre>';
            }
            res.status(500).send(html);
        };
    };
    return Worker;
}());
module.exports = Worker;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid29ya2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUViLElBQU0sUUFBUSxHQUFhLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMvQyxJQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0FBQ2xFLElBQU0saUJBQWlCLEdBQUksT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFFNUQ7SUFDRSxnQkFBWSxPQUFPO1FBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUNqQyxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7UUFDckMsSUFBSSxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUMzQixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUNqQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDO1FBQ2pELElBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQztRQUMvQyxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7UUFFbkMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksaUJBQWlCLENBQUM7Z0JBQ3RDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDWCxRQUFRLEVBQUUsSUFBSSxDQUFDLFFB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