SNS("SNS.widget.CheckCode",function(){var c=SNS.sys.Helper,b=KISSY,e=b.DOM,d=b.Event;var a=function(f){a.superclass.constructor.call(this,f)};a.ATTRS={rootNode:{value:"#J_CheckCode"}};a.EVENTS={click:{".newCheckCode":"change"}};a.DOMS={img:{selector:"img"},input:{selector:"input"}};SNS.Base.extend(a,SNS.data.CheckCode,{init:function(){},change:function(g){if(g){g.preventDefault()}var f=this;this.getCheckCode(1,function(h){f.show(h.result.checkCodeUrl)})},require:function(){var f=this;this.getCheckCode(0,function(g){if(g.status=="0"){f.show(g.result.checkCodeUrl)}})},getCheckCode:function(f,h){f=f?f:0;var g=this;this.loadData("getCheckCode",h,{need_url:f})},getValue:function(){var f=e.get(this.get("rootNode")),g=this.getDOM("input");return g.value},clearValue:function(){var f=e.get(this.get("rootNode")),g=this.getDOM("input");g.value=""},show:function(i){var h=this,f=e.get(h.get("rootNode")),g=this.getDOM("img");g.src=c.getApiURI(i);f.style.display="block"},isShow:function(){var g=this,f=e.get(g.get("rootNode"));return f.style.display=="block"},hide:function(){var h=this,f=e.get(h.get("rootNode")),g=this.getDOM("input");f.style.display="none";g.value=""}});SNS.widget.CheckCode=a},"SNS.data.CheckCode");
