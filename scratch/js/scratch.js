
(function(root, factory) {
  var $ = root.Zepto ? 'zepto' : 'jquery';
  if (typeof define === 'function' && define.amd) {
    define([$], factory);
  } else if (typeof module !== 'undefined' && typeof exports === 'object' && define.cmd) {
    module.exports = factory;
  } else {
    factory(root.jQuery || root.Zepto);
  }
})(this, function($, undefined) {
  'use strict';
  function Scratch(el,options){
    this.$el = $(el);
    this.options = options;
    this.init = false;
    this.enabled = true;
    this._gennerate();
  }

  Scratch.prototype = {
    _gennerate:function(){
      var _this = this;
      var isSupportCanvas = (document.createElement('canvas')).getContext;
      if(!isSupportCanvas) {
        this.$el.append('Canvas is not supported in this browser.');
        return true;
      }

      //新建canvas
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
      //设定样式
      if(this.$el.css('position') === 'static') {
        this.$el.css('position','relative');
      }

      this.$img = $('<img src=""/>').attr('crossOrigin','').css({
        position: 'absolute',
        width:'100%',
        height:'100%'
      });

      this.$scratch = $(this.canvas).css({
        position:'absolute',
        width:'100%',
        height:'100%'
      });

      //canvas绑定移动设备事件
      this.$scratch.on('touchstart',function(e){
          if(e.targetTouches && e.targetTouches.length == 1){
            e.preventDefault();// 阻止浏览器默认事件，重要
             if(!_this.enabled) {
              return true;
            }
            _this.canvasOffset = $(_this.canvas).offset();
            var touch = e.targetTouches[0];
            _this._scratchFunc(touch,'Down');
          }
      }).on('touchmove',function(e){
          if(e.targetTouches && e.targetTouches.length == 1){
            e.preventDefault();// 阻止浏览器默认事件，重要
            var touch = e.targetTouches[0];
            _this._scratchFunc(touch,'Move');
          }

      }).on('touchend',function(e) {
          if(e.targetTouches && e.targetTouches.length == 1){
            e.preventDefault();// 阻止浏览器默认事件，重要
            var touch = e.targetTouches[0];
            _this._scratchFunc(touch,'Up');
          }
      });

      //canvas绑定PC事件
      this.$scratch.mousedown(function(e){
        if(!_this.enabled) {
          return true;
        }
        _this.canvasOffset = $(_this.canvas).offset();
        _this.scratch = true;
        _this._scratchFunc(e,'Down');
      }).mousemove(function(e){
        if(_this.scratch) {
          _this._scratchFunc(e,'Move');
        }
      }).mouseup(function(e){
        if(_this.scratch) {
          _this.scratch = false;
          _this._scratchFunc(e,'Up');
        }
      });

      //设置optionns
      this._setOptions();

      //添加img的dom结构，canvas的dom结构
      this.$el.append(this.$img).append(this.$scratch);

      //初始化和重置
      this.init = true;
      this.reset();
    },
    reset:function(){
      var _this = this,
      width = Math.ceil(this.$el.width()),
      height = Math.ceil(this.$el.height()),
      devicePixelRatio = window.devicePixelRatio || 1;

      this.pixels = width * height;

      this.$scratch.attr('width',width).attr('height',height);

      this.canvas.setAttribute('width',width*devicePixelRatio);
      this.canvas.setAttribute('height',height*devicePixelRatio);
      this.context.scale(devicePixelRatio,devicePixelRatio);

      this.pixels = width*devicePixelRatio*height*devicePixelRatio;

      //默认隐藏img元素
      this.$img.hide();

      //设置背景
      if(this.options.bg){
        if(this.options.bg.charAt(0) === '#') {
          this.$el.css('backgroundColor',this.options.bg);
        } else {
          this.$el.css('backgroundColor','');
          this.$img.attr('src',this.options.bg);
        }
      }
      //设置前景
      if(this.options.fg){
        if(this.options.fg.charAt(0) === '#') {
          this.context.fillStyle = this.options.fg;
          this.context.beginPath();
          this.context.rect(0,0,width,height);
          this.context.fill();
          this.$img.show();
        } else {
          $(new Image()).attr('crossOrigin','').attr('src',this.options.fg).load(function(){
            _this.context.drawImage(this,0,0,width,height);
            _this.$img.show();
          });
        }
      }
    },
    clear:function(){
      this.context.clearRect(0,0,Math.ceil(this.$el.width()),Math.ceil(this.$el.height()));
    },
    enable:function(enabled) {
      this.enabled = enabled === true ? true : false;
    },
    destroy:function(){
      //?
      this.$el.children().remove();
      $.removeData(this.$el,'scratch');
    },
    _setOptions:function(){
      var opt,func;
      for(opt in this.options) {
        this.options[opt] = this.$el.attr('data-'+opt) || this.options[opt];
        func = 'set' + opt.charAt(0).toUpperCase() + opt.substring(1);
        if(this[func]) {
          this[func](this.options[opt]);
        }
      }
    },
    setBg:function(){
      if(this.init) {
        this.reset();
      }
    },
    setFg:function(){
      this.setBg();
    },
    setCursor:function(cursor) {
      this.$el.css('cursor',cursor);
    },
    _scratchFunc:function (e, event) {
      this.pageX = Math.floor(e.pageX - this.canvasOffset.left);
      this.pageY = Math.floor(e.pageY - this.canvasOffset.top);
      // 调用对应方法
      this['_scratch'+ event](e);

      if(this.options.realtime || event === 'Up') {
        if(this.options['scratch' + event]) {
          this.options['scratch' + event].apply(this,[e,this._scratchPercent()]);
        }
      }
    },
    _scratchPercent:function() {
      var hits = 0,
      imageData = this.context.getImageData(0,0,this.canvas.width,this.canvas.height);
      //?
      for(var i = 0, ii = imageData.data.length; i < ii;i = i + 4){
        if (imageData.data[i] === 0 && imageData.data[i+1] ===0 && imageData.data[i+2] === 0 && imageData.data[i+3] ===0) {
          hits++;
        }
      }
      return (hits / this.pixels) * 100;
    },
    _scratchDown:function(e) {
      this.context.globalCompositeOperation = 'destination-out';
      this.context.lineJoin = 'round';
      this.context.lineGap = 'round';
      this.context.strokeStyle = this.options.color;
      this.context.lineWidth = this.options.size;

      //画出单点在只有点击没有滑动的情况下
      this.context.beginPath();
      this.context.arc(this.pageX,this.pageY,this.options.size / 2, 0 , Math.PI * 2, true);
      this.context.closePath();
      this.context.fill();

      this.context.beginPath();
      this.context.moveTo(this.pageX,this.pageY);
    },
    _scratchMove:function (e) {
      this.context.lineTo(this.pageX,this.pageY);
      this.context.stroke();
    },
    _scratchUp:function () {
      this.context.closePath();
    }
  };

  $.fn.scratch = function (options,value) {
    function get() {
      var scratch = $.data(this, 'scratch');
      if(!scratch) {
        scratch = new Scratch(this, $.extend(true,{},options));
        $.data(this,'scratch',scratch);
      }
      return scratch;
    };
    if(typeof options === 'string') {
      var scratch,
      values = [],
      func = (value !== undefined ? 'set' : 'get') + options.charAt(0).toUpperCase() + options.substring(1),
      steOpt = function(){
        if(scratch.options[options]){
          scratch.options[options] = value;
        }
        if(scratch[func]) {
          scratch[func].apply(scratch,[value]);
        }
      },
      getOpt = function(){
        if(scratch[func]) {
          return scratch[func].apply(scratch,[value]);
        } else if(scratch.options[options]) {
          return scratch.options[options];
        } else {
          return undefined;
        }
      },
      runOpt = function(){
        scratch = $.data(this,'scratch');
        if(scratch) {
          if(scratch[options]) {
            scratch[options].apply(scratch,[value]);
          } else if(value != undefined) {
            setOpt();
          } else {
            values.push(getOpt());
          }
        }
      };
      this.each(runOpt);
      return values.length ? (values.length === 1 ? values[0] : values ) : this;
    }

    options = $.extend({},$.fn.scratch.defaults,options);
    return this.each(get);
  };

  $.fn.scratch.defaults = {
    size:5,
    bg:'#cacaca',
    fg:'#6699ff',
    realtime:true,
    scratchDown:null,
    scratchUp:null,
    scratchMove:null,
    cursor:'crosshair'
  };
});