KISSY.add("KISSY.sns.path",function(S){
    
    var D = S.DOM,
        E = S.Event,
        Path;

	/**
	 * @class 请求路径地址，进行请求时需要的URI统一资源地址
	 * @memberOf SNS
	 * @author 涵宇
	 */

    Path = {

          /**
           * @lends SNS.Path.prototype
           */
     
		   /**
		    * 获取 API 的 URI
            * @function
            * @name getApiURI
            * @memberOf SNS.util.Path#
            * @param {String} [config.api] 要拼接的 URI 片段
            * @param {Boolean} [config.useCache] 是否使用缓存
            * @param {Boolean} [config.ignoreToken] 是否不加 Token
		    */
			getApiURI : function(api,useCache,ignoreToken) {
				var that = this;

                if (!(api.substr(0, 7) === "http://" || api.substr(0, 8) === "https://") && api.indexOf(":") > 0) {
					
					//第一个冒号索引位置；
					var semPos = api.indexOf(":");
					
                    //获取应用对应地址
                    var apiServer = that.getServerPath(api);
                    if (apiServer !== "") {
						api = (apiServer + api.substr(semPos + 1)).replace(/assets\.taobaocdn\.com/, 'a.tbcdn.cn');
					}
				}

                //不使用缓存，添加邮戳码
				if (!useCache) {
					api = that.addStamp(api);
				}
       
                //添加Token
				if (!ignoreToken) {	
                   api = that.addToken(api);
				}

                //api格式化
				var newApi=S.substitute(api, {
                    serverHost : that.getHost().server,
                    cdnHost: that.getHost().cdn
				});

				return newApi;
			},

            /**
             * 获取app服务器地址对应名
             * @function
             * @name getServerPath
             * @memberOf SNS.util.Path#
             * @param { String } uri 资源路径地址
             */
            getServerPath : function(uri) {
               var uriServers = {
                    assets   : "http://assets.{cdnHost}/p/sns/1.0",
                    assetsV  : "http://assets.{cdnHost}/apps",
                    portal   : "http://jianghu.{serverHost}",
                    app      : "http://app.jianghu.{serverHost}",
                    comment  : "http://comment.jianghu.{serverHost}",
                    poke     : "http://poke.jianghu.{serverHost}",
                    share    : "http://share.jianghu.{serverHost}",
                    blog     : "http://blog.jianghu.{serverHost}",
                    fx       : "http://fx.{serverHost}",
                    checkCode: "http://comment.jianghu.{serverHost}/json/get_comment_check_code.htm",
                    feedCheckCode: "http://jianghu.{serverHost}/json/get_feed_comment_check_code.htm"
               };

               var serverPath = uriServers[uri.substr(0, uri.indexOf(":"))] || "";

               return serverPath;

            },
            
            /**
             * 获取主域名
             * @function
             * @name getHost
             * @memberOf SNS.util.Path#
             */
            getHost : function() {

              var hostname = location.hostname,
                  serverHost = 'taobao.com',
                  cdnHost = 'taobaocdn.com';

              if(S.sns.domain.get(2) !== 'taobao.com') {
                serverHost = cdnHost = 'daily.taobao.net'; 
              }

              return {server:serverHost,cdn:cdnHost};

            },

			/**
			 * 添加时间戳
             * @function
             * @name addStamp
             * @memberOf SNS.util.Path#
			 * @param { String } url 链接地址
			 */
			addStamp:function(url) {
				var that = this;
				return that.buildURI(url, "t=" + new Date().getTime());
			},

            /**
             * 添加_tb_token统一码
             * @function
             * @name addToken
             * @memberOf SNS.util.Path#
             * @param { String } url 链接地址
             */
            addToken:function(url){
               var that = this,
                   tokens,
                   i,
                   newUrl,
                   elToken = D.get("#Jianghu_tb_token");

                   if (elToken) {
                       tokens = elToken.getElementsByTagName("INPUT");
                       for(i = 0;i < tokens.length;i++){
                           newUrl = that.buildURI(url, [tokens[i].name, encodeURIComponent(tokens[i].value)].join("="));
                       }
                   }

                   return newUrl;
            },
			
			/**
			 * 拼接 URI，自动判断第一部分是否有 ?，如果有则以 & 连接，
			 * 否则以 ? 连接第一部分和第二部分，其他部分均以 & 连接;
             * @function
             * @name buildURI
             * @memberOf SNS.util.Path#
			 */
			buildURI : function() {
				
				//转成参数数组式;
				var args = Array.prototype.slice.call(arguments);	
				if (args.length < 2) {
					return args[0] || "";
				}

				//shift()方法是删除数组的第一项;
				var uri = args.shift();	 
				uri += uri.indexOf("?") > 0 ? "&" : "?";

				//这里的替换方法是用来消除重复的&符号，类如：comment&&type=xx...
				return uri + args.join("&").replace(/&+/g, "&");	
			},

           /**
            * 设置Token
            * @function
            * @name setToken
            * @memberOf SNS.util.Path#
            * @param { String } token 统一码
            * @param { Function } callback 设置成功后回调函数
            */
           setToken : function(token,callback) {
             var that = this;
             token && that.createToken(token);
             callback && callback();
           },

           /**
            * 创建Token
            * @function
            * @name createToken
            * @memberOf SNS.util.Path#
            * @param { String } token 统一码
            */
            createToken : function(token) {
                var tokenStr = token || "",
                tokenArr = tokenStr.split("="),
                tokenDiv = D.get('#Jianghu_tb_token'),
                input;
                if(!tokenDiv) {
                    tokenDiv = D.create('<div>');
                    D.attr(tokenDiv,'id','Jianghu_tb_token');
                    D.html(tokenDiv,'<input type="hidden" />');
                    D.append(tokenDiv,document.body);
                }
                if (tokenStr && tokenArr.length === 2) {
                    input = D.children(tokenDiv)[0];
                    input.name = tokenArr[0];
                    input.value = tokenArr[1];
                }
               
           },

           /**
            * 获取Token
            * @function
            * @name getToken
            * @memberOf SNS.util.Path#
            */
           getToken : function() {
             var that = this,
                 apiToken = 'comment:/json/token.htm';

             S.getScript(that.buildURI(that.getApiURI(apiToken),'callback=SNS.sys.Helper.setToken'),function(){},'gbk');
           }
     
    };

    S.namespace('KISSY.sns').path = Path;

});
