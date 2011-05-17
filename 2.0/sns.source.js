/*
author: bofei
*/

/**
 * @name SNS
 * @namespace 淘江湖全局命名空间
 */

(function(win,K) {

    var SNS = function(name,fn,reqs){
        SNS.Loader.run(name,fn,reqs);
        return SNS;
    };

    K.mix(SNS, {
        _init: function(o) {
        
            var scripts = document.getElementsByTagName('script'),
            currentScript = scripts[scripts.length - 1],
            base = currentScript.src.replace(/^(.*)(tbra-sns)(-min)?\.js[^/]*/i, '$1');
          

            this.config = o||{};
            this.config.base=base;
            this.namespace('util', 'data','widget','sys', 'app');
            return this;
        }
       
    });


    //启动SNS
    SNS._init(config);
    win.SNS=SNS;

})(window,KISSY);



//模块管理
(function(S, K){


    var  LOADING = 1,LOADED = 2, ERROR = 3, ATTACHED = 4, ATTACHING = 5,num = 0;

    var Mod=function(name,fn,childs){
        this.fn=fn||function(){};
        this.childs=childs||[];
        this.parents=[];
        this.name=name||"MOD["+(num++)+"]";
        this.status=LOADING;

    }

    Mod.prototype={
        addParent:function(mod){
            //需要解决循环引用问题
           if(mod.name==this.name)return;
            this.parents.push(mod);
            mod.childs.push(this);
        },
        attachNext:function(){
            var next,childs=this.childs, i, l=this.childs.length;
            for(i=0;i<l;i++){
                next=childs[i];
                if(!next.isAttached())break;
            }
            if(next&&next.isAttaching()){
                next.run();
                this.attachNext();
            }
            if(next&&i==l-1&&next.isAttached()){
                this.ready();
            }

        },
        hasParent:function(){

            return this.parents.length>0;
        },

        _notify:function(){
            var parent, i, l=this.parents.length;
            for(i=0;i<l;i++){

                parent=this.parents[i];
                parent.attachNext(this);
            }
        },

        isReady:function(){
            var i,c,result=true;

            for(i=0;i<this.childs.length;i++){
                c=this.childs[i];
                if(!c.isAttached()){
                    result=false;
                    break;
                }

            }
            return result;
        },
        ready:function(){

            this.status=ATTACHING;
            this._notify();
        },
        loadComplete: function(){
            this.status=LOADED;
            if(this.isReady()){
                this.ready();
            }
        },
        isLoading:function(){
            return this.status==LOADING;
        },
        isLoaded:function(){
            return this.status==LOADED;
        },
        isAttaching:function(){
            return this.status==ATTACHING;
        },
        isAttached:function(){
            return this.status==ATTACHED;
        },
        run:function(){
            K.log("run " +this.name)
            this.status=ATTACHED;
            this.fn(SNS,KISSY);

        }
    }

    var root=new Mod("root");

    var Resource={
        mods:{},
        add:function(mod){
            var o=this.get(mod.name);
            if(o){
                o.fn=mod.fn;
            }
            else {
                o=mod;
                this.mods[mod.name]=o;
            }
            return o;
        },
        get:function(name){
            return this.mods[name];
        }
    }


    var Loader={
        run:function(name,fn,reqs){
            var mod,  i, self=this;
            if(K.isFunction(name)) {
                reqs = fn;
                fn = name;
                name = undefined;
            }
            if(!fn) return;

            mod=Resource.add(new Mod(name, fn));
            if(!mod.hasParent()) mod.addParent(root);

            reqs=(reqs||"").split(',');
            
            var require = function(name,parentNode){
                if(name=="") return;
                var reqMod=Resource.get(name);
                if(reqMod){
                    reqMod.addParent(parentNode);
                }
                else {
                    reqMod=Resource.add(new Mod(name));
                    reqMod.addParent(parentNode);
                    self._load(name,{
                        onSuccess:function(){
                        // K.log(name+' is success')
                        },
                        onFailure:function(){
                            K.log(name+" is error");
                        },
                        onTimeout:function(){
                            K.log(name+" is timeout");
                        }
                    });
                }
            }

            for(i=0; i<reqs.length; i++){
                if(K.trim(reqs[i]) == "") continue;
                require(reqs[i], mod);
            }


            if(!mod.isAttached()){mod.loadComplete();}
            

        },
        _load:function(name,success){
            if(!name)return;


            K.getScript(this.nameToPath(name),success);
        },
        nameToPath:function(name){
            var app , ns, base, f, url, h, combo, fmt=".js", t = SNS.config.load.t+".js";
            h=name.indexOf("http://");
            if(h==0) {
                url=name;
            } else {
               
                f = name.indexOf(".");
                app = name.toLowerCase().substring(0, f);
                
                ns = name.toLowerCase().substring(f+1);
              /*  if(name.indexOf("+") != -1)
                   url=this.combo(app,ns);
                else*/
                if(!K.Config.debug)fmt="-min"+fmt;
               url = this.cfg[app]+ns.replace(/[.]/g,"/")+fmt+"?"+t;
            }
         
            return  url;
        },
        combo:function(app, ns){
            ns=ns.replace(/[.]/g,"/").replace(/[+]/g,".js,");
            return this.cfg[app]+"??"+ns+".js";
        },
        _root:root,
        _resource:Resource,
        cfg:{
            sns:S.config.base
        }
    }

    S.Loader=Loader;

})(SNS,KISSY);
