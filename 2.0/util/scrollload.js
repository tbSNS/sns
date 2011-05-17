
SNS("SNS.util.ScrollLoad",function(){
    var Lang = YAHOO.lang, Event = YAHOO.util.Event, Dom = YAHOO.util.Dom;
    var K = KISSY, D = K.DOM, E = K.Event;


    SNS.util.ScrollLoad = function(cfg) {

        this.cfg = {
            //feeds容器
            el: '',
            page: 1,
            // 滚动条到浏览器底部的距离，小于此距离时触发加载feeds 动作
            distance: 200,
            // 加载feeds 事件触发后的延时
            delay: 100,
            url:"",
            param: {}
        };

        this.cfg = K.merge(this.cfg, cfg || {});



        this.page=this.cfg.page;
        if(this.cfg.param.page)this.page= this.cfg.param.page;
        this.status="stop"

    };


    SNS.util.ScrollLoad.prototype = {
        // 初始化方法
        init: function() {
             
            this.cfg.el = Dom.get(this.cfg.el);
            if (!this.cfg.el)return this;
            this._check();
            return this;
        },
        _check:function(){
            var self=this;

            //防止ie6过早操作dom
            K.ready(function() {
                self._request( function(html) {
                    if(!K.trim(html))return;
                    if(self._canScroll()){
                        self._check();
                    } else{
                        self._on();
                    }
                });
            });


        },
        // 检查是是否有滚动条
        _canScroll: function() {

            var h = Dom.getY(this.cfg.el) + this.cfg.el.offsetHeight;
            return h - Dom.getDocumentScrollTop() - this.cfg.distance < Dom.getViewportHeight();
        },
        _request:function(success){
            
            if(this.status == "loading"|| this.status=="destroy") return;
            var self=this, loading;
            var param=  K.mix(self.cfg.param,{
                page:self.page
            })
            var callback=function(resp){
                if(self.status=="destroy")return ;
                self.status="stop"
              
                self.page++;
                if(loading) {
                    loading.style.display="none";
                // D.remove(loading);
                }

             
                var newContent = document.createElement('div');
                newContent.innerHTML = resp.responseText;
               

                self.cfg.el.appendChild(newContent);
                if(success) success(resp.responseText);
               
                if(self.cfg.success)self.cfg.success(resp.responseText, param, newContent);
                if(!K.trim(resp.responseText)){

                    self.destroy();
                    return;
                }
                 

                
            }


            loading = document.createElement('div');
            loading.innerHTML = "<img src='http://img06.taobaocdn.com/tps/i6/T13l0vXhRrXXXXXXXX-24-24.gif' alt='loading ...' /><br /><br />";
            self.cfg.el.appendChild(loading);


            SNS.request(this.cfg.url,{
                success:callback,
                data:param
            })
            //YAHOO.util.Connect.asyncRequest('POST', this.cfg.url, callback, K.param(param));
            this.status="loading";
        },

        // 添加滚动条事件
        _on: function() {
            var self = this;
            this.scrollFn= function() {
                if (self._canScroll()&&self.status=="stop") {
                    if (self._timeout) {
                        clearTimeout(self._timeout);
                        self._timeout = null;
                    }
                    self._timeout = setTimeout(function() {
                        self._request();
                    }, self.cfg.delay);
                }

            }

            Event.on(window, 'scroll', this.scrollFn);
            Event.on(window, 'resize', this.scrollFn);
        },
        destroy:function(){
            Event.removeListener (window, 'scroll');
            Event.removeListener (window, 'resize');
            clearTimeout(this._timeout);
            this._timeout = null;
            this.status="destroy";

        }
    };


})
