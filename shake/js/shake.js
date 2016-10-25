/**
 *
 * @authors jachin (zx.wang@ctrip.com)
 * @date    2016-04-16 16:04:57
 * @describe shake摇一摇
 * @version $Id$
 */

(function(global, factory){
  if (typeof define === 'function' && define.amd) {
    // 定义AMD模式加载
    define(function() {
      return factory(global, global.document);
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    //定义CMD模式加载
    module.exports = factory(global, global.document);
  } else {
    //定义构造函数加载
    global.Shake = factory(global, global.document);
  }
  //传入global(window)变量及默认factory函数
} (typeof window !== 'undefined' ? window : this, function(window, document ) {

  'use strict';
  function Shake(options) {
    //特征检测
    this.hasDeviceMotion = 'ondevicemotion' in window;

    this.options = {
      //摇一摇的默认速度阈值
      threshold: 15,
      //事件之间的默认时间间隔
      timeout:1000
    };

    if ( typeof options === 'object') {
      // 覆盖默认属性
      for(var i in options ) {
        if (options.hasOwnProperty(i)) {
          // 过滤，替换属性值
          this.options[i] = options[i];
        }
      }
    }

    //使用日期防止多个摇晃影响
    this.lastTime = new Date();

    //设置默认手机晃动不同方向加速度值
    this.lastX = null;
    this.lastY = null;
    this.lastZ = null;

    //创建自定义事件
    if (typeof document.CustomEvent === 'function') {
      // statement
      this.event = new document.CustomEvent('shake', {
        bubbles: true,
        cancelable: true
      });
    } else if (typeof document.createEvent === 'function') {
      // statement
      this.event = document.createEvent('Event');
      this.event.initEvent('shake', true, true);
    } else {
      return false;
    }

    //默认开始监听
    this.start();
  }

  //重置时间
  Shake.prototype.reset = function () {

    this.lastTime = new Date();
    this.lastX = null;
    this.lastY = null;
    this.lastZ = null;
  };

  //开始监听devicemotion
  Shake.prototype.start = function(argument){
     // body...
     this.reset();
     if (this.hasDeviceMotion) {
       // statement
       window.addEventListener('devicemotion', this, false);
     }
  };

  //停止监听摇晃事件
  Shake.prototype.stop = function() {
    if (this.hasDeviceMotion) {
      // statement
      window.removeEventListener('devicemotion', this, false);
    }
    this.reset();
  };

  //计算是否在摇一摇
  Shake.prototype.devicemotion = function(e) {
    //获取设备加速度信息
    var current = e.accelerationIncludingGravity,
    currentTime,
    timeDifference,
    deltaX = 0,
    deltaY = 0,
    deltaZ = 0;

    if ((this.lastX === null) && (this.lastY === null) && (this.lastZ === null)) {
      // statement
      this.lastX = current.x;
      this.lastY = current.y;
      this.lastZ = current.z;
      return;
    }

    deltaX = Math.abs(this.lastX - current.x);
    deltaY = Math.abs(this.lastY - current.y);
    deltaZ = Math.abs(this.lastZ - current.z);

    if (((deltaX > this.options.threshold) && (deltaY > this.options.threshold)) || ((deltaX > this.options.threshold) && (deltaZ > this.options.threshold)) || ((deltaY > this.options.threshold) && (deltaZ > this.options.threshold))){
      // 计算自上次抖动设备注册后的时间
      currentTime = new Date();
      timeDifference = currentTime.getTime() - this.lastTime.getTime();

      if ( timeDifference > this.options.timeout) {
        // 停止监听晃动事件
        window.dispatchEvent(this.event);
        this.lastTime = new Date();
      }
    }
    //重新赋值当前设备加速度信息
    this.lastX = current.x;
    this.lastY = current.y;
    this.lastZ = current.z;

  };

  //事件处理
  Shake.prototype.handleEvent = function(e) {
    if (typeof (this[e.type]) === 'function') {
      // statement
      return this[e.type](e);
    }
  };


  return Shake;

})

);






























