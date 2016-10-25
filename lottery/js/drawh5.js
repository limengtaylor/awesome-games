/**
 * Created by zx.wang on 2016/1/18.
 */
var drawh5fuc = {
    fnScrollLeft:function(){
        var speed=50,
            scroll_begin = document.getElementById("scrollbegin"),
            scroll_end = document.getElementById("scrollend"),
            scroll_div = document.getElementById("scrollarea");

        scroll_end.innerHTML = scroll_begin.innerHTML;
        function Marquee(){
            if(scroll_end.offsetWidth - scroll_div.scrollLeft <= 0){
                scroll_div.scrollLeft -= scroll_begin.offsetWidth;
            } else {
                scroll_div.scrollLeft++;
            }
        }
        var MyMar=setInterval(Marquee,speed);
        scroll_div.onmouseover=function() {
            clearInterval(MyMar);
        }
        scroll_div.onmouseout=function() {
            MyMar=setInterval(Marquee,speed);
        }
    }
}

$(function(){
    //滚动
    drawh5fuc.fnScrollLeft();

    lottery.lottery({
        selector:     '.sudoku',
        width:        3,
        height:       4,
        index:        0,    // 初始位置
        initSpeed:    500,  // 初始转动速度
        // upStep:       50,   // 加速滚动步长
        // upMax:        50,   // 速度上限
        // downStep:     30,   // 减速滚动步长
        // downMax:      500,  // 减速上限
        // waiting:      5000, // 匀速转动时长
        beforeRoll: function () { // 重写滚动前事件：beforeRoll
            // console.log(this);
            //var _self = this;
            // alert(1);
        },
        beforeDown: function () { // 重写减速前事件：beforeDown
            // console.log(this);
            //alert(2);
            this.options.target = 4;
            this._down();

        },
        aim: function () { // 重写计算中奖号的方法：aim
            // console.log(this);
            //this.options.target = 7;
        },
        afterRoll: function(){
            layer.closeAll();
            var index = layer.open({
                type: 1,
                content: ' <div class="dialog-wrap" id="dialog">'+
                '<div class="mask"></div>' +
                '<div class="draw-dialog-bg">'+
                '<div class="diclose" id="iclose">'+
                    '<img src="img/diclose.png" width="100%" alt="">'+
                '</div>'+
                '<div class="ddialog ">'+
                '<div class="item1" >'+
                '<div class="words">'+
                    '<p>恭喜您获得 <em>200元</em>优惠券<br/>优惠券已放入您的账户。</p>'+
                '<p> 您的抽奖次数已用完，赶快分享至微信获取更多抽奖机会吧！</p>'+
                '</div>'+
                '<div class="btns">'+
                    '<a href="javascript:;" class="wxshare" id="wxshare">微信分享</a>'+
                    '<a href="###" class="usetickets">使用优惠券</a>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>',
                anim: 0,
                style: ''
            });

            $("#iclose").click(function(){
                layer.close(index);
            })
        }
    });


    /*我的奖品*/
    $("#userprize").click(function(){
       $('#prizes').show();
    });
    $('#prizeclose').click(function(){
        $('#prizes').hide();
    })
    /*活动规则*/
    $('#drawrule').click(function(){
       $('#rules').show();
    });
    $('#ruleclose').click(function(){
        $('#rules').hide();
    })
})