/*
 * author bofei  2010/12/29
 *
 */

SNS("SNS.widget.CheckCode",function(){
    var Helper= SNS.sys.Helper,K=KISSY,D = K.DOM, E = K.Event;
    
    var CheckCode=function(cfg){
        CheckCode.superclass.constructor.call(this,cfg);
    }
    CheckCode.ATTRS = {
        rootNode:{
            value:"#J_CheckCode"
        }
    }
    CheckCode.EVENTS = {
        click:{
            ".newCheckCode" :"change"
        }
    }

    CheckCode.DOMS = {
        img:{
            selector:"img"
        },
        input:{
            selector:"input"
        }
    }

    SNS.Base.extend(CheckCode, SNS.data.CheckCode,{
        init: function(){

        },
        change:function(e){

            if(e) e.preventDefault();
            var self = this;
            this.getCheckCode(1,function(data){
                self.show(data.result.checkCodeUrl);
            });
        },

        require:function(){
            var self=this
            this.getCheckCode(0,function(data){
                if(data.status=="0")self.show(data.result.checkCodeUrl);
            });
        },
        getCheckCode: function(need_url,success){

            need_url=need_url?need_url:0
            var self=this;
            this.loadData("getCheckCode",success,{
                need_url:need_url
            });
        },
        getValue:function(){
            var  root=D.get(this.get("rootNode")),  input = this.getDOM("input");
           return input.value;
        },

        clearValue:function(){
            var root=D.get(this.get("rootNode")),  input = this.getDOM("input");
            input.value="";
        },

        show:function(url){
            var self=this, root=D.get(self.get("rootNode")),  img = this.getDOM("img");
            img.src = Helper.getApiURI(url);
            root.style.display="block";
        },
        isShow:function(){
            var self=this, root=D.get(self.get("rootNode"));
            return root.style.display=="block";
        },
        hide:function(){
            var self=this, root=D.get(self.get("rootNode")),  input = this.getDOM("input");
            root.style.display="none";
            input.value="";
        }
    });

    SNS.widget.CheckCode = CheckCode;


},"SNS.data.CheckCode")
