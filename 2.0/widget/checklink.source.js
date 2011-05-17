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


})
