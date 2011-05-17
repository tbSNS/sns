
SNS("SNS.widget.Feed", function(){
    var K = KISSY, D = K.DOM, E = K.Event,JSON = K.JSON, Helper = SNS.sys.Helper;

    var Feed=function(cfg){
     
        Feed.superclass.constructor.call(this, cfg);
    }

    Feed.ATTRS = {
        rootNode: {
            value:"#J_FeedsContainer"
        },
        paramGetFeed:{
            value:{
                page:1
            }
        }
    }

    Feed.EVENTS = {
        "click":{
            ".icon-del-simple": "delFeedEvent",
            ".J_DeleteMB": "delJiwaiFeedEvent",
            ".icon-filter-simple": "filterFeedEvent",
            ".J_viewMoreFresh": "loadMoreFeedEvent",
            ".small-img": "zoomOutEvent",
            ".J_ZoomInImg": "zoomInEvent",
            ".big-img": "zoomInEvent",
            ".J_FeedTab,.J_MoreTab": "feedTabEvent",
            ".J_Share": "shareEvent",
            ".J_Reply": "cmtEvent",
            ".J_Forward": "forwardEvent",
            ".sns-linkcheck":"checkLinkEvent",
            ".more-share":"showMoreShareEvent"
        },
        "mouseenter":{

            ".short-url":function(e,target){
   
                SNS.widget.ShortLink.show(e,target);
            }
        },
        "mouseleave":{
            ".short-url":function(e,target){
                SNS.widget.ShortLink.hide(e,target);
            }
        }

    }

    Feed.DOMS = {
        item:{
            parent:".item"
        }
    }

    Feed.AOPS = {
        before :{
            "*Event":"preventDefault",
            "delJiwaiFeedEvent":"checkLogin"
        }
    }

    SNS.Base.extend(Feed, SNS.data.Feed,{
        init:function(){

            this.fixedHover(this.get("rootNode"));
            return this;
        },
        scrollLoadFeed:function(cfg){
     
            var self = this, d = "getFeed", data = this.getData(d);
            cfg = cfg || {};
            var  param = K.merge(this.get("paramGetFeed"), cfg.param||{});
          
            var  scrollLoad= new SNS.util.ScrollLoad({
                url:cfg.url||data.url,
                param:param,
                el: cfg.el||D.get(self.get("rootNode")),
                success:function(txt, param, el){

                   if(cfg.success) cfg.success(txt, param, el);

                    self.fixedHover(el);
                }
            }).init();
            return scrollLoad;
        },

        loadFeed:function(cfg){
            var self = this, d = "getFeed", data = this.getData(d);
            var  newcfg =  {};
            var  el = cfg.el || D.get(self.get("rootNode"));
            var url = cfg.url|| data.url;
            var loading = document.createElement('div');
            loading.innerHTML = "<img src='http://img06.taobaocdn.com/tps/i6/T13l0vXhRrXXXXXXXX-24-24.gif' alt='loading ...' /><br /><br />";
            el.appendChild(loading);
            newcfg.data = K.merge(this.get("paramGetFeed"), cfg.param||{
                page:1
            })
            newcfg.success=function(data){
                loading.style.display="none"
                D.remove(loading);
                el.innerHTML=data.responseText;
                if(cfg.success)cfg.success(data.responseText);

            }


            SNS.request(url, newcfg);
        },
        // 个人主页仍然使用原来的加载方式

        loadMoreFeedEvent:function(e, t){
            var param=D.attr(t, "data-param");
            if(!param)return;
            var self=this;

            var  el = D.get(self.get("rootNode"));

            var loading = document.createElement('div');
            loading.innerHTML = "<img src='http://img06.taobaocdn.com/tps/i6/T13l0vXhRrXXXXXXXX-24-24.gif' alt='loading ...' /><br /><br />";
            el.appendChild(loading);
            param=K.JSON.parse(param);
            var cfg={
                data:param,
                success:function(data){

                    loading.style.display="none"
                    D.remove(loading);

                    el.innerHTML+=data.responseText;
                }
            }

            D.remove(t);
            SNS.request(t.href, cfg);

        },
        delFeedEvent:function(e, t){

            var item=this.getDOM("item",t);
            this.simpleLoadData("delFeed",function(){
                D.remove(item)
            },item, t);
        },

        delJiwaiFeedEvent: function(e, t){
            var d="delJiwaiFeed", self= this, panel,item=this.getDOM("item",t), confirm, txt;

            confirm = function(){
                if(panel)panel.hide();
                self.simpleLoadData(d, function(){
                    D.remove(item);
                },item, t);
            },
            //开发加文案
            txt = D.attr("data-txt", t)||"您确定要删除这条叽歪吗?";
            panel= Helper.showConfirm(txt,confirm);
        },

        filterFeedEvent : function(e, t){
            e.preventDefault();
            var d="filterFeed", self= this, panel, item=this.getDOM("item",t),
            confirm = function(){

                if(panel)panel.hide();
                self.simpleLoadData(d, function(){
                    D.remove(item)
                }, t);
            },
            //开发加文案 并判断类型
            txt = D.attr("data-txt", t)||"以后不再接收<span>这个好友的该类型</span>动态，你确认吗?(你可以在隐私设置里解除此屏蔽)?";
            panel= Helper.showConfirm(txt,confirm);
        },




        shareEvent : function(e, t){
            var li= D.parent(t),
            param =JSON.parse(D.attr("data-param",li)) ;
            SNS.widget.Share.shareSub(param);
        },

        zoomOutEvent : function(e, t){

            e.preventDefault();
            var self = this,
            item = D.parent(t ,".item"),
            smallImg = D.get('img.small-img',  item),
            bigImg = D.get('img.big-img',  item),
            childNode = D.get('a.toggle',  item);

            D.addClass(childNode, "J_ZoomInImg");
            childNode.innerHTML = "收起"
            var  toggleContainer = childNode.parentNode;

            bigImg.onload = function() {
                setTimeout(function() {
                    smallImg.style.display = 'none';
                    bigImg.style.display = 'block';

                    self.resize(bigImg, 450, 1500);

                    D.removeClass(toggleContainer, 'hidden');
                    //ie6触发reflow
                    var sib = YAHOO.util.Dom.getNextSibling(item)
                    sib && Helper.doReflow(sib);
                }, 50);
            }


            bigImg.src = smallImg.getAttribute('data-src');

        },
        zoomInEvent : function(e, t){
            e.preventDefault();

            var self = this,
            item = D.parent(t ,".item"),
            smallImg = D.get('img.small-img',  item),
            bigImg = D.get('img.big-img',  item),
            childNode = D.get('a.toggle',  item);
            var  toggleContainer = childNode.parentNode;

            //   bigImg.src = smallImg.getAttribute('data-src');
            smallImg.style.display = 'block';
            bigImg.style.display = 'none';

            D.addClass(toggleContainer, 'hidden');

            var sib = YAHOO.util.Dom.getNextSibling(item)
            sib && Helper.doReflow(sib);


        },
        cmtEvent : function(e, t){
            e.preventDefault();
            var el = D.parent(t,".item"),  reply = D.get(".fd-reply",el), self = this,  cfg;
            if(t._status==1){
                reply.innerHTML="";
                D.addClass(reply,"hidden")
                t._status=0;
                return;
            }
            t._status=1;
            D.removeClass(reply,"hidden")
            if(t._c)t._c.init();
            else{
               
                cfg =JSON.parse(D.attr(t,"data-cfg"));
                cfg.rootNode=reply;
                //添加评论回调
                K.mix(cfg, self.get('commentCallback'));
                t._c= new SNS.widget.Comment(cfg);
                t._c.init();

            }
            return t._c;
        },


        forwardEvent: function(e, t){
            // 所有参数放在el上
            e.preventDefault();
            var self = this,  cfg;
            cfg =  JSON.parse(D.attr(t, "data-cfg"));

            return new SNS.widget.Forward(cfg).init();

        },

        resize:function(img, w, h){
            var p1=w/h;
            var p2=img.width/img.height;
            if(p2>=p1&&img.width>w){
                img.width=w;
                img.height=img.width/p2;
            }
            else if(p2<p1&&img.height>h){
                img.height=h;
                img.width=img.height*p2;
            }
        },

        checkLogin: function(e){
            var afterLogin=function(){}
            if (!Helper.checkAndShowLogin({
                callback:afterLogin
            })){
                e.halt();
            }
        },
        checkLinkEvent: function(e, t) {
            new SNS.sys.LinkCheck(t).check();
        },
        toggleClass:function(e, t){
            D.toggleClass(t, "hover")
        },
        preventDefault:function(e){

            KISSY.log("preventDefault")
            KISSY.log(e&&e.arguments&&e.arguments[0])
            KISSY.log(e.arguments[0].preventDefault)
            if(e&&e.arguments&&e.arguments[0])e.arguments[0].preventDefault();
        },
        fixedHover :function(root) {
            var list = D.query('.item', root);
            E.on(list, 'mouseenter', function(e) {
                D.addClass(e.currentTarget, 'hover');
            });

            E.on(list, 'mouseleave', function(e) {
                D.removeClass(e.currentTarget, 'hover');
            });

        },
        showMoreShareEvent:function(e, t){
           
            if(t._status==1)return;
            t._status=1;
            var param=D.attr(t,"data-param");
            if(param) param = K.JSON.parse(param);
            this.loadData("moreShare",function(data){
               
                var panel=SNS.sys.snsNearbyPanel(t,data.result.html,{
                    width:"400px",
                    offsetTop:"-50px",
                    offsetLeft:"80px",
                    hideHandle:true,
                    onShow:function(){
                        if(K.get("span",t))K.get("span",t).className="fd-open";
                    },
                    
                    onHide:function(){
                  
                       if(K.get("span",t)) K.get("span",t).className="fd-close";
                    }
                }).show();
     
            }, param);
        }
    });
    SNS.widget.Feed=Feed;
},"SNS.data.Feed,SNS.widget.ShortLink,SNS.util.ScrollLoad,SNS.widget.Comment")

