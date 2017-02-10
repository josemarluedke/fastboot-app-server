"use strict";
var assert = require('assert');
var cluster = require('cluster');
var os = require('os');
var Worker = require('./worker');
var FastBootAppServer = (function () {
    function FastBootAppServer(options) {
        options = options || {};
        this.distPath = options.distPath;
        this.downloader = options.downloader;
        this.notifier = options.notifier;
        this.cache = options.cache;
        this.ui = options.ui;
        this.gzip = options.gzip;
        this.username = options.username;
        this.password = options.password;
        this.httpServer = options.httpServer;
        this.beforeMiddleware = options.beforeMiddleware;
        this.afterMiddleware = options.afterMiddleware;
        this.resilient = options.resilient;
        if (!this.ui) {
            var UI = require('./ui');
            this.ui = new UI();
        }
        this.propagateUI();
        if (cluster.isWorker) {
            this.worker = new Worker({
                ui: this.ui,
                distPath: this.distPath || process.env.FASTBOOT_DIST_PATH,
                cache: this.cache,
                gzip: this.gzip,
                username: this.username,
                password: this.password,
                httpServer: this.httpServer,
                beforeMiddleware: this.beforeMiddleware,
                afterMiddleware: this.afterMiddleware,
                resilient: this.resilient
            });
            this.worker.start();
        }
        else {
            this.workerCount = options.workerCount ||
                (process.env.NODE_ENV === 'test' ? 1 : null) ||
                os.cpus().length;
            assert(this.distPath || this.downloader, "FastBootAppServer must be provided with either a distPath or a downloader option.");
            assert(!(this.distPath && this.downloader), "FastBootAppServer must be provided with either a distPath or a downloader option, but not both.");
        }
    }
    FastBootAppServer.prototype.start = function () {
        var _this = this;
        if (cluster.isWorker) {
            return;
        }
        return this.initializeApp()
            .then(function () { return _this.subscribeToNotifier(); })
            .then(function () { return _this.forkWorkers(); })
            .then(function () {
            if (_this.initializationError) {
                _this.broadcast({ event: 'error', error: _this.initializationError.stack });
            }
        })
            .catch(function (err) {
            _this.ui.writeLine(err.stack);
        });
    };
    FastBootAppServer.prototype.stop = function () {
        this.broadcast({ event: 'shutdown' });
    };
    FastBootAppServer.prototype.propagateUI = function () {
        if (this.downloader) {
            this.downloader.ui = this.ui;
        }
        if (this.notifier) {
            this.notifier.ui = this.ui;
        }
        if (this.cache) {
            this.cache.ui = this.ui;
        }
        if (this.httpServer) {
            this.httpServer.ui = this.ui;
        }
    };
    FastBootAppServer.prototype.initializeApp = function () {
        var _this = this;
        // If there's a downloader, it returns a promise for downloading the app
        if (this.downloader) {
            return this.downloadApp()
                .catch(function (err) {
                _this.ui.writeLine('Error downloading app');
                _this.ui.writeLine(err.stack);
                _this.initializationError = err;
            });
        }
        this.ui.writeLine("using distPath; path=" + this.distPath);
        return Promise.resolve();
    };
    FastBootAppServer.prototype.downloadApp = function () {
        var _this = this;
        this.ui.writeLine('downloading app');
        return this.downloader.download()
            .then(function (distPath) {
            _this.distPath = distPath;
        })
            .catch(function (err) {
            if (err.name.match(/AppNotFound/)) {
                _this.ui.writeError('app not downloaded');
            }
            else {
                throw err;
            }
        });
    };
    FastBootAppServer.prototype.subscribeToNotifier = function () {
        var _this = this;
        if (this.notifier) {
            this.ui.writeLine('subscribing to update notifications');
            return this.notifier.subscribe(function () {
                _this.ui.writeLine('reloading server');
                _this.initializeApp()
                    .then(function () { return _this.reload(); });
            })
                .catch(function (err) {
                _this.ui.writeLine('Error subscribing');
                _this.ui.writeLine(err.stack);
                _this.initializationError = err;
            });
        }
    };
    FastBootAppServer.prototype.broadcast = function (message) {
        var workers = cluster.workers;
        for (var id in workers) {
            workers[id].send(message);
        }
    };
    FastBootAppServer.prototype.reload = function () {
        this.broadcast({ event: 'reload' });
    };
    FastBootAppServer.prototype.forkWorkers = function () {
        var promises = [];
        for (var i = 0; i < this.workerCount; i++) {
            promises.push(this.forkWorker());
        }
        return Promise.all(promises);
    };
    FastBootAppServer.prototype.forkWorker = function () {
        var _this = this;
        var env = this.buildWorkerEnv();
        var worker = cluster.fork(env);
        this.ui.writeLine("forked worker " + worker.process.pid);
        worker.on('exit', function (code, signal) {
            if (signal) {
                _this.ui.writeLine("worker was killed by signal: " + signal);
            }
            else if (code !== 0) {
                _this.ui.writeLine("worker exited with error code: " + code);
            }
            else {
                _this.ui.writeLine("worker exited");
            }
            _this.forkWorker();
        });
        return new Promise(function (resolve) {
            _this.ui.writeLine('worker online');
            worker.on('message', function (message) {
                if (message.event === 'http-online') {
                    resolve();
                }
            });
        });
    };
    FastBootAppServer.prototype.buildWorkerEnv = function () {
        var env = {};
        if (this.distPath) {
            env.FASTBOOT_DIST_PATH = this.distPath;
        }
        return env;
    };
    return FastBootAppServer;
}());
module.exports = FastBootAppServer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFzdGJvb3QtYXBwLXNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImZhc3Rib290LWFwcC1zZXJ2ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDO0FBRWIsSUFBTSxNQUFNLEdBQWEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzNDLElBQU0sT0FBTyxHQUFZLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM1QyxJQUFNLEVBQUUsR0FBaUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRXZDLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUVuQztJQUNFLDJCQUFZLE9BQU87UUFDakIsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFFeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztRQUNyQyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFDakMsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQzNCLElBQUksQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUNqQyxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7UUFDckMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztRQUNqRCxJQUFJLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUM7UUFDL0MsSUFBSSxD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