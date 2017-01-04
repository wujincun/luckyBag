
/**
 * Created by Administrator on 2017/1/4.
 */

var luckyBag = {
    $hrefArea : $('.hrefArea'),
    windowH : $(window).height(),

    init:function () {
        var _this = this;
        var imgs = [
            'img/h5/gameBag.png',
            'img/h5/gameText.png',
            'img/h5/rightScroll.png',
            'img/h5/LeftScroll.png',
            'img/h5/food.png',
            'img/h5/song.png',
            'img/h5/beauty.png',
            'img/h5/knead.png'
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
                _this.$hrefArea.each(function (key,value) {
                    var themeTop = $(value).offset().top;
                    if(themeTop <=  _this.windowH){
                        $(value).addClass('active')
                    }
                });
                _this.bind();
            }
        }



    },
    bind:function () {
        var _this = this;
        var $rule = $('.rule');
        var $rulePop = $('.rulePop');
        $(window).on('scroll',function () {
            var scrollTop = $(window).scrollTop();
            _this.$hrefArea.each(function (key,value) {
                var themeTop = $(value).offset().top;
                if(themeTop >= scrollTop && themeTop <= scrollTop + _this.windowH){
                    $(value).addClass('active')
                }
            });
        });
        $rule.on('click',function () {
            $rulePop.show()
        });
        $rulePop.on('click','.close',function () {
            $rulePop.hide()
        })
    }
};
luckyBag.init()