/**
 * Created by Administrator on 2016/12/24.
 */
var lucyBag = {
    w: $(window).width(),
    h: $(window).height(),
    bagNum: 10,//bag的数量
    landmineNum: 5,//地雷的数量
    bags: [],//bag的数组
    landmines : [],//地雷的数组
    lastTime: 0,//两次时间间隔的上一次时间
    bagS: 0,//一帧福袋走的距离
    landMineS: 0,//一帧雷走的距离
    flag: false,//是否点在小人上
    maxBag:100,//最大福袋的尺寸
    minBag:50,//最小福袋的尺寸
    maxLandMine:100,//最大福袋的尺寸
    minLandMine:50,//最小福袋的尺寸
    score: 0,//分值
    timer:null,//30秒倒计时
    timeGap : 0,//每一帧的时间间隔
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
        var _this = this;
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = _this.w;
        canvas.height = _this.h;
        ctx.clearRect(0, 0, _this.w, _this.h);
        _this.drawBags(ctx);
        _this.drawLandmine(ctx);
        _this.drawChild(ctx);
        _this.gameLoop(ctx);
        _this.bind();
        _this.countTime({
            duration:30,
            step:0.01,
            ele:$('.time'),
            handler4ToTime:function(){
                _this.gameOver();
            }
        });
    },
    drawBags: function (ctx) {
        var _this = this;
        _this.maxBagSpeed = _this.h / 1000;//福袋最大的速度
        _this.minBagSpeed = _this.h / 3000;//福袋最小的速度
        for (var i = 0; i < _this.bagNum; i++) {
            _this.bags[i] = {};
            _this.bags[i].img = new Image();
            _this.bags[i].img.src = 'img/bag.png';
            var bagW = Math.random()*(_this.maxBag - _this.minBag) + _this.minBag;
            var bagH = bagW * 1334/1334;
            _this.bags[i].renderSize = [bagW, bagH];
            var x = Math.random() * (_this.w - _this.bags[i].renderSize[0]);
            var y = Math.random() * (_this.h - _this.bags[i].renderSize[1]) - _this.h;
            _this.bags[i].position = [x, y];
            _this.bags[i].speed = Math.random() * (_this.maxBagSpeed - _this.minBagSpeed) + _this.minBagSpeed;
            ctx.drawImage(_this.bags[i].img, _this.bags[i].position[0], _this.bags[i].position[1], _this.bags[i].renderSize[0], _this.bags[i].renderSize[1])
        }
    },
    drawLandmine:function (ctx) {
        var _this = this;
        _this.maxLandMineSpeed= _this.h / 1000;//福袋最大的速度
        _this.minLandMineSpeed = _this.h / 3000;//福袋最小的速度
        for (var i = 0; i < _this.landmineNum; i++) {
            _this.landmines[i] = {};
            _this.landmines[i].img = new Image();
            _this.landmines[i].img.src = 'img/child.png';
            var landmineW = Math.random()*(_this.maxLandMine - _this.minLandMine) + _this.minLandMine;
            var landmineH = landmineW * 1334/1334;
            _this.landmines[i].renderSize = [landmineW, landmineH];
            var x = Math.random() * (_this.w - _this.landmines[i].renderSize[0]);
            var y = Math.random() * (_this.h - _this.landmines[i].renderSize[1]) - _this.h;
            _this.landmines[i].position = [x, y];
            _this.landmines[i].speed = Math.random() * (_this.maxLandMineSpeed - _this.minLandMineSpeed) + _this.minLandMineSpeed;
            ctx.drawImage(_this.landmines[i].img, _this.landmines[i].position[0], _this.landmines[i].position[1], _this.landmines[i].renderSize[0], _this.landmines[i].renderSize[1])
        }
    },
    drawChild: function (ctx) {
        var _this = this;
        _this.child = {};
        _this.child.img = new Image();
        _this.child.img.src = 'img/child.png';
        _this.child.renderSize = [80, 80];
        var x = (_this.w - _this.child.renderSize[0]) / 2;
        var y =  _this.h - _this.child.renderSize[1];
        _this.child.position = [x,y];
        _this.child.initPositionX = x;
        ctx.drawImage(_this.child.img, _this.child.position[0], _this.child.position[1], _this.child.renderSize[0], _this.child.renderSize[1])
    },
    gameLoop: function (ctx) {
        var _this = this;
        function animationRun() {
            window.cancelAnimationFrame(_this.loopId);//不清理会动画积累
            //位移
            var curTime = Date.now();
            if (_this.lastTime > 0) {
                /*_this.bagS = _this.bagSpeed * 17;
                _this.landMineS = _this.landMineSpeed * 17;*/
                _this.timeGap = curTime - _this.lastTime;
                //_this.bagS  = _this.bagSpeed * (curTime - _this.lastTime);
                //_this.landMineS = _this.landMineSpeed * (curTime - _this.lastTime);
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
            if (_this.bags[i].position[1] >= _this.h || _this.checkCollision(_this.bags[i])) {
                if(_this.checkCollision(_this.bags[i])){
                    _this.score += 10;
                    $('.score').text(_this.score)
                }
                _this.bags[i].position[0] = Math.random() * (_this.w - _this.bags[i].renderSize[0]);
                _this.bags[i].position[1] = Math.random() * (_this.h - _this.bags[i].renderSize[1]) - _this.h
            } else {
                _this.bags[i].position[1] = _this.bags[i].position[1] + _this.bags[i].speed * _this.timeGap;
            }
            ctx.drawImage(_this.bags[i].img, _this.bags[i].position[0], _this.bags[i].position[1], _this.bags[i].renderSize[0], _this.bags[i].renderSize[1])
        }
    },
    loopLandmine: function (ctx) {
        var _this = this;
        for (var i = 0; i < _this.landmines.length; i++) {
            if (_this.landmines[i].position[1] >= _this.h || _this.checkCollision(_this.landmines[i])) {
                if(_this.checkCollision(_this.landmines[i])){
                    _this.score -= 10;
                    $('.score').text(_this.score)
                }
                _this.landmines[i].position[0] = Math.random() * (_this.w - _this.landmines[i].renderSize[0]);
                _this.landmines[i].position[1] = Math.random() * (_this.h - _this.landmines[i].renderSize[1]) - _this.h
            } else {
                _this.landmines[i].position[1] = _this.landmines[i].position[1] + _this.landmines[i].speed * _this.timeGap;
            }
            ctx.drawImage(_this.landmines[i].img, _this.landmines[i].position[0], _this.landmines[i].position[1], _this.landmines[i].renderSize[0], _this.landmines[i].renderSize[1])
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
                _this.positionX = _this.child.initPositionX + distanceX;
                if (_this.positionX <= 0) {
                    _this.child.position[0] = 0
                } else if (_this.positionX >= _this.w - _this.child.renderSize[0]) {
                    _this.child.position[0] = _this.w - _this.child.renderSize[0]
                } else {
                    _this.child.position[0] = _this.positionX;
                }
            }
        });
        canvas.addEventListener('touchend', function (e) {
            e.preventDefault();
            _this.flag = false;
            _this.child.initPositionX = _this.positionX
        });
    },
    //碰撞检测
    checkCollision: function (bagItem) {
        var _this = this;
        if (bagItem.position[1] + bagItem.renderSize[1] >= _this.child.position[1] &&
            (
                (bagItem.position[0] > _this.child.position[0] && bagItem.position[0] < _this.child.position[0] + _this.child.renderSize[0]) ||
                (bagItem.position[0] + bagItem.renderSize[0] > _this.child.position[0] && bagItem.position[0] + bagItem.renderSize[0] < _this.child.position[0] + _this.child.renderSize[0]) ||
                (bagItem.position[0] < _this.child.position[0] && bagItem.position[0] + bagItem.renderSize[0] > _this.child.position[0] + _this.child.renderSize[0])
            )
        ) {
            return true 
        }
    },
    //倒计时
    countTime:function (cfg){
        var _this = this;
        _this.timer = setInterval(cutTime,cfg.step*1000);
        function cutTime(){
            if(cfg.duration <= 0.01){
                cfg.ele.text(0);
                clearInterval(_this.timer);
                cfg.handler4ToTime();
            }else{
                cfg.duration = cfg.duration - cfg.step;
                cfg.ele.text((cfg.duration).toFixed(2))
            }
        }
    },
    //游戏结束
    gameOver:function () {
        var _this = this;
        window.cancelAnimationFrame(_this.loopId);
    }
};

lucyBag.init();