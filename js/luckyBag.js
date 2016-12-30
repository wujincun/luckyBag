/**
 * Created by Administrator on 2016/12/24.
 */
var lucyBag = {
    $popContentArea : $('.popContentArea'),
    $restArea : $('.restArea'),
    w: $(window).width(),
    h: $(window).height(),
    bagNum: 8,//bag的数量
    landmineNum: 3,//地雷的数量
    bags: [],//bag的数组
    landmines : [],//地雷的数组
    scores:[],//+10的分数提示数组
    lastTime: 0,//两次时间间隔的上一次时间
    flag: false,//是否点在小人上
    score: 0,//分值
    timer:null,//30秒倒计时
    timeGap : 0,//每一帧的时间间隔
    API:{
        getResult:'mock/getResult.json'
    },
    init: function () {
        var _this = this;
        //加载完图片后render
        var imgs = [
            'img/game/background.jpg',
            'img/game/backgroundPlay.jpg',
            'img/game/bag.png',
            'img/game/landMine.png',
            'img/game/child.png',
            'img/game/addScore.png',
            'img/game/reduceScore.png'
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
        _this.drawBackground(ctx);
        _this.drawBags(ctx);
        _this.drawLandmine(ctx);
        _this.drawChild(ctx);
        _this.renderListener(ctx);
    },
    renderListener: function (ctx) {
        var _this = this;
        var readyCountNum = 4;
        var readyCountTimer = setInterval(function () {
            readyCountNum--;
            if (readyCountNum == 0) {
                clearInterval(readyCountTimer);
                $('#countTime').hide();
                _this.gameLoop(ctx);
                _this.bind();
                _this.countDownTime({
                    duration:30,
                    step:0.01,
                    ele:$('.time'),
                    handler4ToTime:function(){
                        _this.gameOver();
                    }
                });
            } else {
                $('#cutTime').attr('class', 'num_' + readyCountNum);
            }
        }, 1000);
    },
    drawBackground:function (ctx) {
        var _this = this;
        _this.background = {};
        _this.background.img = new Image();
        _this.background.img.src = 'img/game/background.jpg';
        ctx.drawImage(_this.background.img,0,0,_this.w,_this.h)
    },
    drawBags: function (ctx) {
        var _this = this;
        _this.maxBagSize = 163 * _this.w/640;//最大福袋的尺寸 163*158
        _this.minBagSize = 0.57 * _this.maxBagSize;//最小福袋的尺寸  93*89
        _this.maxBagSpeed = _this.h / 1000;//福袋最大的速度
        _this.minBagSpeed = _this.h / 3000;//福袋最小的速度
        for (var i = 0; i < _this.bagNum; i++) {
            _this.bags[i] = {};
            _this.bags[i].img = new Image();
            _this.bags[i].img.src = 'img/game/bag.png';
            var bagW = Math.random()*(_this.maxBagSize - _this.minBagSize) + _this.minBagSize;
            var bagH = bagW * 158/163;
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
        _this.maxLandMineSize = 135 * _this.w/640;//最大地雷的尺寸 135*169
        _this.minLandMineSize = 0.56 * _this.maxLandMineSize;//最小地雷的尺寸 75*95
        _this.maxLandMineSpeed= _this.h / 1000;//福袋最大的速度
        _this.minLandMineSpeed = _this.h / 3000;//福袋最小的速度
        for (var i = 0; i < _this.landmineNum; i++) {
            _this.landmines[i] = {};
            _this.landmines[i].img = new Image();
            _this.landmines[i].img.src = 'img/game/landMine.png';
            var landmineW = Math.random()*(_this.maxLandMineSize - _this.minLandMineSize) + _this.minLandMineSize;
            var landmineH = landmineW * 169/135;
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
        _this.child.img.src = 'img/game/child.png';
        _this.child.renderSize = [168*_this.w/640, 216*_this.w/640]; //168*216
        var x = (_this.w - _this.child.renderSize[0]) / 2;
        var y =  _this.h - _this.child.renderSize[1] - 54*_this.h/1136;
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
                _this.timeGap = 17;
                //_this.timeGap = curTime - _this.lastTime;
            }
            _this.lastTime = curTime;
            //清除
            ctx.clearRect(0, 0, _this.w, _this.h);
            //画
            _this.background.img.src = "img/game/backgroundPlay.jpg";
            ctx.drawImage(_this.background.img,0,0,_this.w,_this.h);
            ctx.drawImage(_this.child.img, _this.child.position[0], _this.child.position[1], _this.child.renderSize[0], _this.child.renderSize[1])
            _this.loopBags(ctx);//福袋
            _this.loopLandmine(ctx);//地雷
            _this.loopScores(ctx);
            _this.loopId = window.requestAnimationFrame(animationRun);
        }
        animationRun();
    },
    loopBags: function (ctx) {
        var _this = this;
        for (var i = 0; i < _this.bags.length; i++) {
            if (_this.bags[i].position[1] >= _this.h || _this.checkCollision(_this.bags[i])) {
                if(_this.checkCollision(_this.bags[i])){
                    _this.score += 5;
                    $('.score').text(_this.score);
                    var score = {};
                    score.img = new Image();
                    score.img.src = "img/game/addScore.png";
                    score.renderSize = [_this.w*45/640,_this.w*27/640]; //45*27
                    score.speed = (50 * _this.h/1136)/500;
                    score.position = [_this.child.position[0] + (_this.child.renderSize[0] - score.renderSize[0])/2,_this.child.position[1]]
                    _this.scores.push(score);
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
                    _this.score -= 20;
                    $('.score').text(_this.score);
                    var score = {};
                    score.img = new Image();
                    score.img.src = "img/game/reduceScore.png";
                    score.renderSize = [_this.w*64/640,_this.w*30/640]; //64*30
                    score.speed = (50 * _this.h/1136)/500;
                    score.position = [_this.child.position[0] + (_this.child.renderSize[0] - score.renderSize[0])/2,_this.child.position[1]];
                    _this.scores.push(score);
                }
                _this.landmines[i].position[0] = Math.random() * (_this.w - _this.landmines[i].renderSize[0]);
                _this.landmines[i].position[1] = Math.random() * (_this.h - _this.landmines[i].renderSize[1]) - _this.h
            } else {
                _this.landmines[i].position[1] = _this.landmines[i].position[1] + _this.landmines[i].speed * _this.timeGap;
            }
            ctx.drawImage(_this.landmines[i].img, _this.landmines[i].position[0], _this.landmines[i].position[1], _this.landmines[i].renderSize[0], _this.landmines[i].renderSize[1])
        }
    },
    loopScores:function (ctx) {
        var _this = this;
        for(var i=0;i<_this.scores.length;i++){
            if(_this.scores[i].position[1] <= _this.h - 316*_this.h/1136){
                _this.scores.splice(_this.scores[i],1)
            }else{
                _this.scores[i].position[1] = _this.scores[i].position[1] - _this.scores[i].speed * _this.timeGap;
                ctx.drawImage(_this.scores[i].img,_this.scores[i].position[0],_this.scores[i].position[1],_this.scores[i].renderSize[0],_this.scores[i].renderSize[1])
            }
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
        _this.$popContentArea.on('click','.popContent .close',function () {
            _this.$popContentArea.hide();
            _this.$restArea.hide()
        });
        _this.$popContentArea.on('click','.popContent .share',function(){
            _this.$restArea.find('.shareHint').show();
        });
        _this.$popContentArea.on('click','.successPop .bags .bag',function(){
            $.ajax({
                url:_this.API.getResult,
                type:'GET',
                dataType:'json',
                data:{

                }
            }).done(function (data) {
                var code = data.code;
                if(code == 200){
                    var $getCouponPop = _this.$popContentArea.find('.getCouponPop');
                    $getCouponPop.find('.couponMoneyNum').text(data.result.coupon);
                    $getCouponPop.show().siblings().hide();
                }else{
                    var $noCouponPop = _this.$popContentArea.find('.noCouponPop');
                    $noCouponPop.show().siblings().hide();
                }
            })
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
    countDownTime:function (cfg){
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
        var $clock = _this.$popContentArea.find('.clock');
        window.cancelAnimationFrame(_this.loopId);
        _this.$restArea.find('.mask').show().siblings().hide();
        $clock.show().siblings().hide();
        setTimeout(function(){
             $clock.hide();
            _this.handleResult();
        },1000)
    },
    //成功失败的弹窗处理
    handleResult:function () {
        var _this = this;
        if(_this.score >= 80){
            _this.$popContentArea.find('.successPop').show().siblings().hide();
        }else{
            _this.$popContentArea.find('.failPop').show().siblings().hide()
        }
    }
};

lucyBag.init();