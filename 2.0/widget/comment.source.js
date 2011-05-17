SNS("SNS.widget.Comment", function(){

    var K = KISSY, D = K.DOM, E = K.Event, Helper = SNS.sys.Helper;

    var Comment = function(cfg) {
        Comment.superclass.constructor.call(this,cfg);
    }

    //属性配置
    Comment.ATTRS = {

        //各种参数
        param : {
            value : null
        },
        paramList:{
            value:null
        },
        paramReply:{
            value:{}
        },
        paramFwd:{
            value:{}
        },
        //
        rootNode : {
            value:"#J_CmtWidget"
        },
        txt:{
            value:"我也插句话..."
        },
        content:{
            value:"12345"
        },
        maxLength:{
            value:210
        },
        isAutoHeight:{
            value:true
        },

        isSynMB:{
            value:false
        },
        isSuggest:{
            value: false
        },
        isOpen :{
            value:false
        },

        isReply :{
            value:false
        },
        moreurl:{
            varlue:""
        },

        checkcode:{
            value:""
        },
        callback:{
            value:""
        },
        initCmtCallback:{
            value:function(){}
        }

    }


    // dom 配置
    Comment.DOMS = {
        content:{
            selector:".f-txt",
            attr:"value",
            to:"content"
        },
        checkcode:{
            selector:".f-checkcode",
            attr:"value",
            to:"checkcode"
        },
        checkcodeContainer:{
            selector:".checkcode"
        },
        sycMB:{
            selector:".J_SycMB",
            attr:"checked",
            to:"isSynMB"
        },


        face:{
            selector:".face"
        },
        txt:{
            selector:".f-txt"
        },

        list:{
            selector:"ul.comment-list"
        },
        cmt:{
            parent:"li"
        },
        form:{
            selector:".new-r"
        },
        count:{
            selector: ".J_LetterCount"
        }

    }

    //事件配置
    Comment.EVENTS = {
        click:{
            ".J_PostComment" : "postCmtEvent",
            ".J_UnfoldMoreComment":"unfoldMoreComment",
            ".J_FoldMoreComment":"foldMoreComment",
            ".J_DelR" : "delCmtEvent",
            ".J_ReR" : "replyCmtEvent",
            ".page,.page-up,.page-down" : "getCmtListEvent",
            ".page-up" : "getCmtListEvent",
            ".page-down" : "getCmtListEvent"

        },
        focus:{
            ".f-txt" : "requireCheckCode"
        },
        keyup:{
            ".f-txt":"showLength"
        }
    }

    //aop 配置
    Comment.AOPS = {
        before: {
            "postCmtEvent" : ["checkLogin","DOMToAttrs","valid"],
            "*Event":"preventDefault",
            "delCmt" : "checkLogin"
        }
    }

    //原形方法
    SNS.Base.extend(Comment,SNS.data.Comment,{

        init: function() {
            var that = this;
            //防止 ie6 下产生网页错误
            K.ready(function() {
                that.renderCmtBox();
            });
        },
        renderCmtBox : function(){
            var d = "getCmtBox" ,success, root=this.get("rootNode"), txt, self=this;
            success = function(data){
                if(!data)return
                D.get(root).innerHTML = data.result.html;
                txt = self.getDOM("txt");

                Helper.addMaxLenSupport(D.get(root), self.get("maxLength"), 'f-txt');
                self.showLength(null,txt);
                self.initFace();
                self.initCheckCode();

                self.setMoreUrl();
                self.initSuggest();
                SNS.sys.form.setPlaceHolder(txt);

                txt.focus();
                txt.value=""
                var cb=self.get("initCmtCallback");
                cb(data);

            }
            this.simpleLoadData(d, success, this.get("param"), this.get("paramList"));
        },

        requireCheckCode:function(){
            if(!this.checkCode.isShow())  this.checkCode.require();
        },

        postCmtEvent:function(e, t){

            var d = "postCmt",  self = this, success, list ,content = self.get("content"), checkcode = this.get("checkcode"),param={};

            success=function(data){
                var s = data.status, r = data.result, m = data.msg
                if(s=="0"){
                    list = self.getDOM("list");

                    list.innerHTML=data.result.html+list.innerHTML;
                    self.forward();

                    self.checkCode.hide();


                    self.reset();

                } else if(s =="12"||s == "13"){
                    Helper.showMessage(m);
                    self.checkCode.show(data.result.checkCodeUrl);

                } else {
                    Helper.showMessage(m);
                }
                if(self.callback)self.callback(param, data);

                if(window.commentAfterCallback)commentAfterCallback(param, data);

            }
            param = K.merge(param,this.get("param"),this.get("paramReply"),D.attr(t,"data-param"));
            param.content = content;
            param.TPL_checkcode=checkcode;
            this.loadData(d, success, param);

        // this.simpleLoadData("forward",function(){}, this.get("param"), this.get("paramForward"),{content:content})
        },


        delCmtEvent:function(e){
            e.preventDefault();
            var d = "delCmt", t = e.target, base, del,  self = this, success;
            success=function(data){
                D.remove(self.getDOM("cmt", t));
            }
            this.simpleLoadData(d, success,this.get("param"), t);
        },


        getCmtListEvent: function(e, t){
            e.preventDefault();
            var d = "getCmtList",  base, list,  self = this, success;
            list = D.attr(t, "data-param");
            if(!list)return;
            success=function(data){

                self.getDOM("list").innerHTML=data.result.html;
                var  txt = self.getDOM("txt");
               if(txt) txt.focus();
            }
            this.simpleLoadData(d, success,this.get("param"),this.get("paramList"), t);
        },


        showMoreComment: function(){

        },

        replyCmtEvent:function(e, t){
            this.set("paramReply",K.JSON.parse(D.attr(t, "data-param")));
            this.getDOM("txt").value=D.attr(t, "data-txt");
            this.getDOM("txt").focus();
        },
        forward:function(){
            //同步发微博
            var self = this, param;
            if(!this.get("isSynMB"))return;
            K.log(this.get("paramFwd"));
            param = K.mix(this.get("paramFwd"),{
                content:self.get("content")
            })
            var cfg={
                paramFwd:param
            };
            new SNS.widget.Forward(cfg).forward();
        },

        reset:function(){

            this.setDOM("content","");
            this.getDOM("txt").value=""
            this.getDOM("count").innerHTML=this.get("maxLength");
            var root=this.get("rootNode")
            D.get(".J_SycMB" ,root).checked=false;
            this.set("paramReply",{});

        },

        initFace: function(){
            var self=this, rootNode = D.get(this.get("rootNode"));
            var face= this.getDOM("face");
            var txt=this.getDOM("txt");
            var max= this.get("maxLength")
            SNS.widget.faceSelector.init({
                elTrigger:face,
                container:rootNode,
                insertBefore:function(){
                    if (txt.value.length >= max)return false;

                },
                insertAfter:function(){
                    if (max - txt.value.length< 0)var n = 0;
                    self.showLength(null,txt,n);
                }
            });

        },
        initCheckCode: function(){
            var self=this, root=D.get(self.get("rootNode")), checkCode = self.getDOM("checkcodeContainer");

            this.checkCode=new SNS.widget.CheckCode({
                rootNode:checkCode
            });

            this.checkCode.require();
        },
        initSuggest: function(){
            var self=this;
            // 初始化点名功能
            new SNS.widget.MicroSuggest({
                root: D.get(self.get("rootNode")),
                className:"f-txt",
                autoHeight:false
            });
        },
        showLength:function(e, t, n){
            var count = this.getDOM('count');
            n=n?n:this.get("maxLength")- t.value.length
            if (count)count.innerHTML =n;
        },


        valid: function(e){
            var c=this.get("content"), txt=D.attr(this.getDOM("txt"),"placeholder"), msg=SNS.sys.Helper.showMessage;


            if (c === "" || c === txt) {
                msg("内容不能为空或者全是空格.");
                e.halt();
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

        preventDefault:function(e){

            if(e&&e.arguments&&e.arguments[0])e.arguments[0].preventDefault();

        },
        setMoreUrl:function(){
            var list = this.getDOM("list"), moreurl=D.get(".more-comment", list);
            if(moreurl)moreurl.href=this.get("moreurl");
        }
    });
    SNS.widget.Comment=Comment;

},"SNS.data.Comment,SNS.data.Forward,SNS.widget.CheckCode")




