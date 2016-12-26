/**
 * Created by Administrator on 2016/12/24.
 */
var lucyBag = {
    init:function () {
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
    render:function () {
        this.w = $(window).width();
        this.h = $(window).height();
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = this.w;
        canvas.height = this.h;
        ctx.clearRect(0, 0, this.w, this.h);

        this.gameLoop(ctx)
    },
    bind:function () {
        
    },
    drawBag:function (ctx) {
        var _this = this;
        _this.luckyBag = new Image();
        _this.luckyBag.src = 'img/bag.png';
        ctx.drawImage(_this.luckyBag,0,0,147,147)
    },
    gameLoop:function (ctx) {
        var _this = this;
        window.requestAnimationFrame(gameLoop);
        _this.drawBag(ctx);
        //_this.drawChild()
    }
};
var drawBag = function () {
    
};
lucyBag.init();