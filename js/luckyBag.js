/**
 * Created by Administrator on 2016/12/24.
 */
var lucyBag = {
    num: 10,
    init: function () {
        var _this = this;
        //加载完图片后render
        var imgs = [
            'img/bag.png',
            'img/child.png',
            'img/runner_06.png'
        ];
        var num = imgs.length;
        for (var i = 0; i < num; i++) {
            var img = new Image();
            img.src = imgs[i];
            img.onload = function () {
                num--;
                if (num > 0) {
                    return;
                }
                _this.render()
            }
        }
        //requestAnimation兼容
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (callback, element) {
                var currTime = Date.now();
                var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
                var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
        }
    },
    render: function () {
        this.w = $(window).width();
        this.h = $(window).height();
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = this.w;
        canvas.height = this.h;
        ctx.clearRect(0, 0, this.w, this.h);
        this.drawBags(ctx);
        this.drawChild(ctx);
        this.gameLoop(ctx)
    },
    bind: function () {

    },
    drawBags: function (ctx) {
        var _this = this;
        _this.luckyBag = new Image();
        _this.luckyBag.src = 'img/bag.png';
        _this.luckyBag.renderSize = [50, 50];
        for (var i = 0; i < _this.num; i++) {
            var x = Math.random() * (_this.w - _this.luckyBag.renderSize[0]);
            var y = Math.random() * (_this.h - _this.luckyBag.renderSize[1]);
            ctx.drawImage(_this.luckyBag, x, y, _this.luckyBag.renderSize[0], _this.luckyBag.renderSize[1])
        }
    },
    drawChild: function (ctx) {
        var _this = this;
        _this.child = new Image();
        _this.child.src = 'img/child.png';
        _this.child.renderSize = [80, 80];
        _this.child.position = [(_this.w - _this.child.renderSize[0]) / 2, _this.h - _this.child.renderSize[1]];
        ctx.drawImage(_this.child, _this.child.position[0], _this.child.position[1], _this.child.renderSize[0], _this.child.renderSize[1])
    },
    gameLoop: function (ctx) {
        var _this = this;
        function animationRun(){
            window.cancelAnimationFrame(_this.loopId);//不清理会动画积累
            _this.loopBags(ctx);
            _this.loopLandmine(ctx);
            _this.loopId = window.requestAnimationFrame(animationRun);

        }
        animationRun();
    }
};

lucyBag.init();