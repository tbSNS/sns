SNS("SNS.widget.ShortLink",function(){

    var Lang = YAHOO.lang, Event = YAHOO.util.Event, Dom = YAHOO.util.Dom, Helper = SNS.sys.Helper, Get = YAHOO.util.Get, Anim = YAHOO.util.Anim;

    /**
     * Feeds加载完后显示短域名的源地址
     * @function
     */
    SNS.widget.ShortLink = {

        setpos:function(el,t,s){
            var point = Dom.getXY(t);
            Dom.setStyle(el,'display','block');
            Dom.setStyle(el,'top',point[1] + 24 +'px');
            Dom.setStyle(el,'left',point[0]+(t.offsetWidth / 8) +'px');
            Dom.getFirstChild(Dom.getElementsByClassName('native-url','span',el)[0]).innerHTML = '源链接:' + s;
        },

        show:function(e,target){
            var rt = Event.getRelatedTarget(e),
        
            doc = window.document,
            body = doc.body;

                
            if(rt != target && !Dom.isAncestor(target,rt)){
       
                var point = Dom.getXY(target);

                var param = target.innerHTML,
                attr = Dom.getAttribute(target.parentNode,'data-sr'),
                api = Dom.getAttribute(target.parentNode,'data-url');


                if(attr){
                    var oTip = Dom.get('J_urlPop');
                    SNS.widget.ShortLink.setpos(oTip,target,attr);

                }else{

                    new SNS.sys.BasicDataSource({
                        url: api,
                        parms: {
                            shorturl: param
                        },
                        success: function(data) {
                            if(data.errorcode === '0' && data.sourceurl !== ''){
                                var oTip = Dom.get('J_urlPop'),sourceLink;
                                if(data.sourceurl.split('').length > 40) {
                                    sourceLink = data.sourceurl.substring(0,40)+'...';
                                }else{
                                    sourceLink = data.sourceurl;
                                }

                                if(!oTip){
                                    var oWrapper,oBox,oB,oS,sourceLink;
                                    oWrapper = doc.createElement('DIV');
                                    oWrapper.id = 'J_urlPop';
                                    oWrapper.className = 'url-wrapper';
                                    oBox = doc.createElement('SPAN');
                                    oBox.className = 'native-url';
                                    oB = doc.createElement('B');
                                    oS = doc.createElement('S');

                                    oB.appendChild(doc.createTextNode('源链接:' + sourceLink));
                                    oBox.appendChild(oB);
                                    oBox.appendChild(oS);
                                    oWrapper.appendChild(oBox);
                                    body.appendChild(oWrapper);

                                    Dom.setStyle(oWrapper,'display','block');
                                    Dom.setStyle(oWrapper,'top',point[1] + 24 +'px');
                                    Dom.setStyle(oWrapper,'left',point[0]+(target.offsetWidth / 8) +'px');
                                    Dom.setAttribute(target.parentNode,'data-sr',sourceLink);
                                }else{
                                    SNS.widget.ShortLink.setpos(oTip,target,sourceLink);
                                    Dom.setAttribute(target.parentNode,'data-sr',sourceLink);
                                }

                            }else {
                                return;
                            }
                        }
                    }).jsonp();
                }

            }
        },

        hide:function(e,target){
            var oTip = Dom.get('J_urlPop'),
            rt = Event.getRelatedTarget(e);
            if(rt != target && !Dom.isAncestor(target,rt)){
                Dom.setStyle(oTip,'display','none');
            }
        }
    };


});


SNS('SNS.widget.LinkCheck', function(S) {
    var LinkCheck = function(){

    }
    SNS.widget.LinkCheck = LinkCheck;
})






SNS('SNS.widget.LinkCheck', function(S) {

function openUrl(url){
    var S = KISSY, DOM = S.DOM,openTempForm,tempInput,str,strs;
       openTempForm = DOM.get("#openTempForm");
      if( openTempForm == null ){
           var openTempForm = DOM.create("<form>",{
           target:'_blank',
           name:'openTempForm',
           id:'openTempForm'
           }
         );
      DOM.append (openTempForm,document.body);
      }
     if(url.indexOf("?")!= -1){
           str = url.substr(url.indexOf("?")+1,url.length);
           strs = str.split("&");
            for(var i = 0; i < strs.length; i ++){
              tempInput = DOM.create("<input>",{
              type:'hidden',
              value:decodeURIComponent(strs[i].split("=")[1]),
              name:strs[i].split("=")[0]
              }
             );
             DOM.append( tempInput,openTempForm);
             input = null;
             tempInput = null;

           }
    }
   str = null;
   strs = null;
   DOM.attr(openTempForm,"action",url);
   openTempForm.submit();
}


    var D=YAHOO.util.Dom,E=YAHOO.util.Event,

    /*初始化
	** @linkarr 指定连接的元素或listNoe
	** @_spi 和开发约定的请求地址,用于判断连接是否安全
	*/
    LinkCheck=function(linkarr){
        this.linkarr= linkarr;
        this.link="";
    }
    /*当前打开的连接*/
    LinkCheck.link="";
    /*当前打开连接的标题*/
    LinkCheck.linktitle="";
    /*对话框
	** @state 0:安全连接,1:不安全连接(和开发约定)
	*/
    LinkCheck.open=function(state){
        if(state==0){
            
            var _openState=openUrl(LinkCheck.link);
            /*当window.open被浏览器屏蔽时,弹出选择框*/
            if(_openState==null){
                SNS.sys.LinkCheck.open(1);
            }
        }else{
            LinkCheck.linkid=D.generateId(null,"J_linkcheck");
            popupDialog = new SNS.sys.Popup({
                /*标题*/
                title:LinkCheck.linktitle+"<p id="+LinkCheck.linkid+">"+LinkCheck.link+"</p>",
                width: 290,
                height:127,
                hideMask: false,
                content:"访问内容超出本站范围,不能确定是否安全。",
                /*模块框额外样式,app-share-next.css中*/
                type: 'linkCheck',
                onShow:function(){
                    var self=this;
                    var parentObj=D.getAncestorByClassName(LinkCheck.linkid,"linkCheck");
                    /*按钮的父元素*/
                    var parentObj2=parentObj.getElementsByTagName("button")[0].parentNode;
                    /*隐藏默认的button的元素*/
                    parentObj.getElementsByTagName("button")[0].style.display="none";
                    /*插入继续访问的A标签*/
                    var _a=document.createElement("a");
                    _a.href=LinkCheck.link;
                    _a.target="_blank";
                    _a.innerHTML="<span>继续访问</span>";
                    /*插入取消访问的A标签*/
                    var _a_hide=document.createElement("a");
                    D.setStyle(_a,'cuscor','pointer');
                    _a_hide.innerHTML="<span>取消访问</span>";
                    parentObj2.appendChild(_a);
                    parentObj2.appendChild(_a_hide);
                    /*点击连接后取消*/
                    E.on([_a,_a_hide],"click",function(e){
                        self.hide();
                    });
                }
            });
        }
    }
    YAHOO.lang.augmentObject(LinkCheck.prototype,{
        _init:function(){
            var self=this;
            E.on(this.linkarr,"click",function(e){
                E.stopEvent(e);
                var obj=E.getTarget(e);
                self.check(obj);
            });
        },
        
        check: function(){
            var obj = this.linkarr;
            if (obj.tagName!=="A"){
                return false
            };
            /*获取连接*/
            SNS.sys.LinkCheck.link=obj.href;
            /*获取标题*/
            SNS.sys.LinkCheck.linktitle=obj.getAttribute("data-linktitle");
            /* @url=当前判断的url地址*/
            var _SPI =SNS.sys.Helper.getApiURI("http://share.jianghu.{serverHost}/security/site_security.htm?callback=SNS.sys.LinkCheck.open&url="+obj.href+"&_input_charset=utf-8");
            YAHOO.util.Get.script(_SPI,{
                timeout: 1000,
                /*超时启用的回调函数*/
                onTimeout:function(){
                    SNS.sys.LinkCheck.open(1);
                }
            });
            
        }
    });
    SNS.widget.LinkCheck = S.sys.LinkCheck = LinkCheck;
})



