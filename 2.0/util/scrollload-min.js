SNS("SNS.util.ScrollLoad",function(){var d=YAHOO.lang,b=YAHOO.util.Event,c=YAHOO.util.Dom;var a=KISSY,f=a.DOM,e=a.Event;SNS.util.ScrollLoad=function(g){this.cfg={el:"",page:1,distance:200,delay:100,url:"",param:{}};this.cfg=a.merge(this.cfg,g||{});this.page=this.cfg.page;if(this.cfg.param.page){this.page=this.cfg.param.page}this.status="stop"};SNS.util.ScrollLoad.prototype={init:function(){this.cfg.el=c.get(this.cfg.el);if(!this.cfg.el){return this}this._check();return this},_check:function(){var g=this;a.ready(function(){g._request(function(h){if(!a.trim(h)){return}if(g._canScroll()){g._check()}else{g._on()}})})},_canScroll:function(){var g=c.getY(this.cfg.el)+this.cfg.el.offsetHeight;return g-c.getDocumentScrollTop()-this.cfg.distance<c.getViewportHeight()},_request:function(i){if(this.status=="loading"||this.status=="destroy"){return}var g=this,k;var h=a.mix(g.cfg.param,{page:g.page});var j=function(m){if(g.status=="destroy"){return}g.status="stop";g.page++;if(k){k.style.display="none"}var l=document.createElement("div");l.innerHTML=m.responseText;g.cfg.el.appendChild(l);if(i){i(m.responseText)}if(g.cfg.success){g.cfg.success(m.responseText,h,l)}if(!a.trim(m.responseText)){g.destroy();return}};k=document.createElement("div");k.innerHTML="<img src='http://img06.taobaocdn.com/tps/i6/T13l0vXhRrXXXXXXXX-24-24.gif' alt='loading ...' /><br /><br />";g.cfg.el.appendChild(k);SNS.request(this.cfg.url,{success:j,data:h});this.status="loading"},_on:function(){var g=this;this.scrollFn=function(){if(g._canScroll()&&g.status=="stop"){if(g._timeout){clearTimeout(g._timeout);g._timeout=null}g._timeout=setTimeout(function(){g._request()},g.cfg.delay)}};b.on(window,"scroll",this.scrollFn);b.on(window,"resize",this.scrollFn)},destroy:function(){b.removeListener(window,"scroll");b.removeListener(window,"resize");clearTimeout(this._timeout);this._timeout=null;this.status="destroy"}}});
