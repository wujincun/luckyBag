/**
 * Created by Administrator on 2016/12/24.
 */
var lucyBag = {
    w: $(window).width(),
    h: $(window).height(),
    num: 20,//bag的数量
    bags: [],//bag的数组
    lastTime: 0,//两次时间间隔的上一次shijian
    frameS: 0,//一帧走的距离
    flag: false,//是否点在小人上
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
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = this.w;
        canvas.height = this.h;
        ctx.clearRect(0, 0, this.w, this.h);
        this.drawBags(ctx);
        this.drawChild(ctx);
        this.gameLoop(ctx);
        this.bind()
    },
    drawBags: function (ctx) {
        var _this = this;
        _this.bagSpeed = _this.h / 3000;
        for (var i = 0; i < _this.num; i++) {
            _this.bags[i] = {};
            _this.bags[i].img = new Image();
            _this.bags[i].img.src = 'img/bag.png';
            _this.bags[i].renderSize = [50, 50];
            var x = Math.random() * (_this.w - _this.bags[i].renderSize[0]);
            var y = Math.random() * (_this.h - _this.bags[i].renderSize[1]) - _this.h;
            _this.bags[i].position = [x, y];
            ctx.drawImage(_this.bags[i].img, _this.bags[i].position[0], _this.bags[i].position[1], _this.bags[i].renderSize[0], _this.bags[i].renderSize[1])
        }
    },
    drawChild: function (ctx) {
        var _this = this;
        _this.child = {};
        _this.child.img = new Image();
        _this.child.img.src = 'img/child.png';
        _this.child.renderSize = [80, 80];
        _this.child.position = [(_this.w - _this.child.renderSize[0]) / 2, _this.h - _this.child.renderSize[1]];
        ctx.drawImage(_this.child.img, _this.child.position[0], _this.child.position[1], _this.child.renderSize[0], _this.child.renderSize[1])
    },
    gameLoop: function (ctx) {
        var _this = this;

        function animationRun() {
            window.cancelAnimationFrame(_this.loopId);//不清理会动画积累
            /*//计时
             timeGap = Date.now() - _this.initTime - _this.pauseTime;
             seconds = Math.round(timeGap / 10);
             _this.$time.text(seconds / 100 + 's');*/
            //位移
            var curTime = Date.now();
            if (_this.lastTime > 0) {
                _this.frameS = _this.bagSpeed * 17;
                //_this.s = _this.speed * (curTime - _this.lastTime);
            }
            _this.lastTime = curTime;
            //清除
            ctx.clearRect(0, 0, _this.w, _this.h);
            ctx.drawImage(_this.child.img, _this.child.position[0], _this.child.position[1], _this.child.renderSize[0], _this.child.renderSize[1])
            _this.loopBags(ctx);//福袋
            _this.loopLandmine(ctx);//地雷
            _this.loopId = window.requestAnimationFrame(animationRun);
        }

        animationRun();
    },
    loopBags: function (ctx) {
        var _this = this;
        for (var i = 0; i < _this.bags.length; i++) {
            if (_this.bags[i].position[1] >= _this.h || _this.checkCollision()) {
                _this.bags[i].position[0] = Math.random() * (_this.w - _this.bags[i].renderSize[0]);
                _this.bags[i].position[1] = Math.random() * (_this.h - _this.bags[i].renderSize[1]) - _this.h
            } else {
                _this.bags[i].position[1] = _this.bags[i].position[1] + _this.frameS;
            }
            ctx.drawImage(_this.bags[i].img, _this.bags[i].position[0], _this.bags[i].position[1], _this.bags[i].renderSize[0], _this.bags[i].renderSize[1])
        }
    },
    loopLandmine: function (ctx) {

    },
    //碰撞检测
    checkCollision: function () {
        var _this = this;
        if (_this.child.position) {

        }
    },
    bind: function () {
        var _this = this;
        var initX, moveY, moveX;
        canvas.addEventListener('touchstart', function (e) {
            e.preventDefault();
            moveX = initX = e.targetTouches[0].pageX;
            moveY =  e.targetTouches[0].pageY;
            if (moveX > _this.child.position[0] && moveX < _this.child.position[0] + _this.child.renderSize[0] && moveY > _this.child.position[1] && moveY < _this.child.position[1] + _this.child.renderSize[1]) {
                _this.flag = true;
            }
        });
        canvas.addEventListener('touchmove', function (e) {
            e.preventDefault();
            if (_this.flag) {// 小人随手移动一定距离
                moveX = e.targetTouches[0].pageX;
                distanceX = moveX - initX;
                var x = _this.child.position[0] + distanceX/2;
                if (x <= 0) {
                    _this.child.position[0] = 0
                } else if (x >= _this.w - _this.child.renderSize[0]) {
                    _this.child.position[0] = _this.w - _this.child.renderSize[0]
                } else {
                    _this.child.position[0] = _this.child.position[0] + distanceX
                }
            }
        });
        canvas.addEventListener('touchend', function (e) {
            e.preventDefault();
            _this.flag = false
        });
    }
};

lucyBag.init();