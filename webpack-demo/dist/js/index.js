!function(n){function e(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return n[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}var t={};e.m=n,e.c=t,e.d=function(n,t,r){e.o(n,t)||Object.defineProperty(n,t,{configurable:!1,enumerable:!0,get:r})},e.n=function(n){var t=n&&n.__esModule?function(){return n.default}:function(){return n};return e.d(t,"a",t),t},e.o=function(n,e){return Object.prototype.hasOwnProperty.call(n,e)},e.p="",e(e.s=11)}([function(n,e,t){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=function(n){return n&&n.__esModule?n:{default:n}}(t(1));t(3),e.default=function(){return{name:"layer",tpl:r.default}}},function(n,e,t){n.exports='\r\n<div class="layer">\n\t<div>this is a layer.html</div>\r\n\t<img src="'+t(2)+'"/>\n</div>\r\n'},function(n,e,t){n.exports=t.p+"img/1.jpg"},function(n,e,t){},function(n,e,t){},function(n,e){n.exports={ret:!0,code:"0000",data:[{name:"liuxiangpo"},{name:"liuxiang"},{name:"liu"}]}},,,,,,function(n,e,t){"use strict";function r(n){return n&&n.__esModule?n:{default:n}}var o=r(t(0));r((r((r(t(4)),t(12))),t(5))),new function(){var n=document.getElementById("app"),e=new o.default;n.innerHTML=e.tpl,$(".app").css({background:"url(img/1.jpg)"}),$.ajax({type:"get",url:"./static/ajax.json",success:function(n){console.log(n)},error:function(){console.log("error")}}),$("body").click(function(){"undefined"==window.hash&&(window.hash="p=2")})}},function(n,e,t){}]);