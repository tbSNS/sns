SNS("SNS.ajax",function(f){var c=KISSY,g=SNS.sys.Helper;var d=/^(\w+:)?\/\/([^\/?#]+)/;var b="crossdomain.htm",a="J_Crossdomain";var e=function(h,i){this._apply({method:"post",url:h},i);this.c=KISSY.merge(i,{url:h});this.c.method=this.c.method?this.c.method:"post"};e.prototype={send:function(h,i){this._apply(i,{url:h});if(!this.c.url){return this}if(!this.c.use){this.c.use=this._autoCheck(this.c.url)}switch(this.c.use){case"xhr":this._YUIRequest();break;case"iframe":this._iframeRequest();break;case"jsonp":this._JSONPRequest();break}return this},_autoCheck:function(k){var j="xhr",o,i=location,n,h,q,m;o=d.exec(k);if(o){if(o[1]!==i.protocol||o[2]!==i.host){j="jsonp";if(o[1]===i.protocol){n=o[2].split(".");h=i.host.split(".");q=n[n.length-2]+n[n.length-1];m=h[h.length-2]+h[h.length-1];if(q==m){j="iframe"}}}else{j="xhr"}}return j},_apply:function(){var j=arguments,h=j.length;this.c=this.c?this.c:{};for(var k=0;k<h;k++){for(var m in j[k]){if(j[k][m]){this.c[m]=j[k][m]}}}},_YUIRequest:function(){var h=this;var j={success:function(k){if(h.c.dataType=="json"){k=c.JSON.parse(k.responseText)}if(h.c.success){h.c.success(k,h.c)}},failure:function(k){if(h.c.dataType=="json"){k=c.JSON.parse(k.responseText)}if(h.c.failure){h.c.failure(k,h.c)}}};var i=c.param(this.c.data);YAHOO.util.Connect.asyncRequest(this.c.method,this.c.url,j,i)},_dataToString:function(i){var h="";for(var j in i){if(i[j]!=null){h+=j+"="+encodeURIComponent(i[j])+"&"}if(h.length>0){h=h.substring(0,h.length-1)}return h}},_iframeRequest:function(){e.setDomain();var i=c.DOM.create('<iframe class="crossdomain" frameborder="0" width="0" height="0"  src=""></iframe>');var k=d.exec(this.c.url);var h=this;var j=function(){c.log("ready send"+i);var m={success:function(n){c.log("request successs:"+h.c.url);if(h.c.dataType=="json"){n=c.JSON.parse(n.responseText)}if(h.c.success){h.c.success(n,h.c)}},failure:function(n){c.log("request failuree :"+h.c.url);if(h.c.dataType=="json"){n=c.JSON.parse(n.responseText)}if(h.c.failure){h.c.failure(n,h.c)}}};var l=c.param(h.c.data);if(i&&i.contentWindow&&i.contentWindow.YAHOO){i.contentWindow.YAHOO.util.Connect.asyncRequest(h.c.method,h.c.url,m,l)}};if(i.attachEvent){i.attachEvent("onload",j)}else{i.onload=j}i.src=k[0]+"/"+b;c.DOM.append(i,document.body)},_JSONPRequest:function(){var i,m,h=this;var j=++SNS._JSONP.counter;SNS._JSONP["c"+j]=function(n){if(m){window.clearTimeout(m);m=null}h.c.success.call(h,n,h.c);if(i&&i.parentNode){i.parentNode.removeChild(i)}};var k=KISSY.param(this.c.data);KISSY.log("_JSONPRequest before"+this.c.url);var l=this._buildUrl(this.c.url,k+"&callback=SNS._JSONP.c"+j);KISSY.log("_JSONPRequest after"+l);i=document.createElement("script");document.body.insertBefore(i,document.body.firstChild);window.setTimeout(function(){i.setAttribute("type","text/javascript");i.src=l},1);m=this._timeOut(i,this.c.timeout);return i},_timeOut:function(h,i,l){var j=i?i:5000;var k=window.setTimeout(function(){if(h&&h.parentNode){h.parentNode.removeChild(h)}if(l){l()}},j);return k},_buildUrl:function(h,i){h+=h.indexOf("?")>0?"&":"?";return h+i}};if(!SNS._JSONP){SNS._JSONP={};SNS._JSONP.counter=0}e.setDomain=function(){var i=window.location.hostname.toString();var k=i.split(".");var h=k.length;if(h>2){try{document.domain=k[h-2]+"."+k[h-1]}catch(j){KISSY.log("set Domain error")}}c.log("setDomain:"+document.domain);return document.domain};f.Ajax=e;f.request=function(i,h){return new e(i,h).send()};f.jsonp=function(i,h){h.use="jsonp";return new e(i,h).send()}});
