/**
 * sns.js
 * @author         bofei
 * @changelog      ver 1.0 @ 2010-9-25    Initialize release
 */

SNS("SNS.ajax",function(S){
    var K = KISSY, Helper= SNS.sys.Helper;
    var rurl = /^(\w+:)?\/\/([^\/?#]+)/;
    var PROXYNAME="crossdomain.htm",PROXYID="J_Crossdomain";
    /**
     * <ul>
     * <li>在同域的情况下Connect直接调用YAHOO.util.YAHOO.util.Connect请求资源;</li>
     * <li>在子域的情况下Connect 首先通一个id 为“J_StaticIframeProxy”的iframe获取请求域根目录下的代理文件
     * static_iframe_proxy.html。并将domain设成一致，再用iframe中的YAHOO.util.YAHOO.util.Connect
     * 发送请求；<li>
     * <li>当上述情况都不符合的情况使用jsonp发送请求</li>
     * </ul>
     * @name Ajax
     * @memberOf SNS
     * @class Connect类对YAHOO.util.YAHOO.util.Connect进行了封装，并增加了跨域处理的能力。
     * @param url {String} 要请求资源的url地址
     * @param c {Object} 配置信息
     *  <ul>
     *     <li>method: ｛string｝请求方法:"GET"和"POST",当使用JSONP时只能使用“GET”方法</li>
     *     <li>use: {string}发送请求的方式，Connect支持三种，分别是原生的XHR（xhr）,通过iframe代理(iframe),和JSONP(jsonp)</li>
     *     <li>success:{function}请求成功时的回调方法</li>
     *     <li>failure:{function} 请求失败时的回调方法，注意jsonp不存在这个回调</li>
     *     <li>data:{string}输送的数据</li>
     *  </ul>
     *  @example <p>new SNS.Ajax(u,c).send()</p><p>SNS.request(u,c)</p> <a href="../../examples/util/ajax.html">demo</a>
     */
    var Ajax=function(url,c){
        
        this._apply({
            method:"post",
            url:url
        },c);
        this.c= KISSY.merge(c,{
            url:url
        });
        this.c.method=this.c.method?this.c.method:"post";
      

    }

    Ajax.prototype=
    /**
     * @lends SNS.Ajax.prototype
     */
    {

        /**
         * 自动判断跨域，发送请求
         *
         * @function
         * @param url {String} 要请求资源的url地址
         * @param c {Object} 配置信息
         */
        send:function(url,c){
            this._apply(c,{
                url:url
            });
            if(!this.c.url) return this;
            if(!this.c.use)  this.c.use=this._autoCheck(this.c.url);



            switch(this.c.use){
                case "xhr" :
                    this._YUIRequest();
                    break;
                case "iframe":
                    this._iframeRequest();
                    break;
                case "jsonp":
                    this._JSONPRequest();
                    break;
            }

            return this;
        },
       
        /**
         * 根据跨域情况，选择请求方式
         */
        _autoCheck:function(url){
            var use="xhr",p,l=location,pa,ha,ps,hs;
            p = rurl.exec(url);
            if(p){
                if( p[1] !== l.protocol || p[2] !== l.host){
                    use="jsonp";
                    if( p[1] === l.protocol){
                        pa=p[2].split(".");
                        ha=l.host.split(".");
                        ps=pa[pa.length-2]+pa[pa.length-1];
                        hs=ha[ha.length-2]+ha[ha.length-1];
                        if(ps==hs)use="iframe";
                    }
                }else use="xhr";
            }
            return use;
        },

        _apply:function(){
            var a=arguments, l=a.length;
            this.c=this.c?this.c:{}
            for(var i=0;i<l;i++){
                for(var p in a[i]){
                    if(a[i][p])this.c[p]=a[i][p];
                }
            }
        },

        _YUIRequest:function(){
            var self=this;
            var callback={
                success:function(data){
                  
                    if(self.c.dataType=="json")data=K.JSON.parse(data.responseText);
                    if(self.c.success)  self.c.success(data, self.c)
                },
                failure:function(data){
                    if(self.c.dataType=="json")data=K.JSON.parse(data.responseText);
                    if(self.c.failure) self.c.failure(data, self.c)
                }
            };
            var data=K.param(this.c.data);
            YAHOO.util.Connect.asyncRequest(this.c.method,this.c.url,callback,data);

        },

        _dataToString:function(data){
            var s="";
            for(var p in data){
                if(data[p]!=null)s+=p+"="+encodeURIComponent(data[p])+"&";
                if(s.length>0)s=s.substring(0,s.length-1);
                return s;
            }
        },
        _iframeRequest:function(){
            Ajax.setDomain();
         

   
            var    iframe = K.DOM.create('<iframe class="crossdomain" frameborder="0" width="0" height="0"  src=""></iframe>');
               

            var parts = rurl.exec(this.c.url);
            var self=this;
            var send=function(){
               
                K.log("ready send"+iframe)
                var callback={
                    success:function(data){
                        K.log("request successs:"+self.c.url);
                      /*  if(iframe){
                            K.DOM.remove(iframe);
                           K.log("delde iframe")
                        }
                     */
                        if(self.c.dataType=="json")data=K.JSON.parse(data.responseText);

                        if(self.c.success)self.c.success(data, self.c)
                    },
                    failure:function(data){
                        K.log("request failuree :"+self.c.url);
                      //  if(iframe)   K.DOM.remove(iframe)
                        if(self.c.dataType=="json")data=K.JSON.parse(data.responseText);
                        if(self.c.failure)self.c.failure(data, self.c)
                    }
                };

                
                var data=K.param(self.c.data);


               if(iframe&&iframe.contentWindow&& iframe.contentWindow.YAHOO) iframe.contentWindow.YAHOO.util.Connect.asyncRequest(self.c.method,self.c.url,callback,data);
            }
            // 当iframe加载完成后发送请求
            //参考：http://www.planabc.net/2009/09/22/iframe_onload/
            if (iframe.attachEvent){
                iframe.attachEvent("onload", send);
            } else {
                iframe.onload = send;
            }
            //获取请求资源的iframe代理文件
            iframe.src=parts[0]+"/"+PROXYNAME;
            K.DOM.append(iframe, document.body);
            

        },
        _JSONPRequest:function(){

            var script,timer,self=this;
            var index=++SNS._JSONP.counter;
            SNS._JSONP['c' + index] = function(json){
                if(timer){
                    window.clearTimeout(timer);
                    timer=null;
                }
                self.c.success.call(self,json, self.c);
                if(script&&script.parentNode)script.parentNode.removeChild(script);
            }

            var parms=KISSY.param(this.c.data);
            KISSY.log("_JSONPRequest before"+this.c.url);
            var src = this._buildUrl(this.c.url,parms+"&callback=SNS._JSONP.c"+ index);
            KISSY.log("_JSONPRequest after"+src);

            script=document.createElement("script");
            document.body.insertBefore(script,document.body.firstChild);
            window.setTimeout(function(){
                script.setAttribute("type","text/javascript");
                script.src=src;
            },1);
            timer=this._timeOut(script,this.c.timeout);
            return script;

        },

        _timeOut:function(requestObject,timeout,callback){

            var time=timeout?timeout:5000;
            var timer=window.setTimeout(function(){
                if(requestObject&&requestObject.parentNode)  requestObject.parentNode.removeChild(requestObject);
                if(callback)callback();
            },time);
            return timer;
        },

        _buildUrl:function(url,parms){
            url += url.indexOf("?") > 0 ? "&" : "?";
            return url+parms;

        }

    
    };

    if (!SNS._JSONP) {
        SNS._JSONP = {};
        SNS._JSONP.counter=0;
    }

    Ajax.setDomain= function(){
       
        var _hostname = window.location.hostname.toString();
        var _hosts = _hostname.split(".");
        var _len = _hosts.length;
        //设置域名
        if(_len>2){
            try{
                document.domain= _hosts[_len-2]+"."+_hosts[_len-1];
            }catch(e){
                KISSY.log("set Domain error")
            }
        }
        K.log("setDomain:"+document.domain)
        return document.domain;
    };

    S.Ajax=Ajax;


    //提供一些简便的方法，便于调用
    /**
     * 自动判断跨域，发送请求
     * @name request
     * @memberOf SNS#
     * @function
     */
    S.request=function(url,config){
       
        return new Ajax(url,config).send();
    };

    /**
     * 使用jsonp的方式请求资源
     * @name jsonp
     * @memberOf SNS#
     * @function
     */
    
    S.jsonp=function(url,config){
        config.use="jsonp"
        return new Ajax(url,config).send();
    };


})

