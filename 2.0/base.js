/*date 2010/12/13*/

SNS('SNS.Base', function(){
    var S = SNS, K = KISSY, D = K.DOM, E = K.Event,Log= K.log, Helper=SNS.sys.Helper;
    
    /*------------------------------------------------------------*/
    // 组件属性
    var Attribute =  function(attrs){};
    Attribute.prototype = {
        addAttrs:function(attrs){
            for(var name  in attrs){
                this.addAttr(name, attrs[name]);
            }
        },
        addAttr:function(name,cfg){

            if(!this._attrs)this._attrs={};
            this._attrs[name] = K.clone(cfg);
        
            if(cfg.to&&this.addAssocATD){
                this.addAssocATD(name,cfg.to)
            }
        },
        hasAttr:function(name){
            if(!this._attrs)this._attrs={};
            return name && (name in this._attrs);
        },
        removeAttr:function(name){
            if(this.hasAttr(name)){
                delete this.attrs.name;
            }
            return this;
        },
        set:function(name,value){
            var preVal=this.get(name);
            if(preVal === value)return;
            this.fire&&this.fire(name,"attrChange",preVal,value);
            this._setAttr(name, value);
        },
        _setAttr:function(name,value){
            var host = this,
            setValue,
            attrConfig = host._attrs[name],
            setter = attrConfig && attrConfig['setter'];
            if (setter) setValue = setter.call(host, value);
            if (setValue !== undefined) value = setValue;
            if(!host._attrs[name])host._attrs[name]={};
            host._attrs[name].value = value;
        },
        get:function(name){
            if(!this._attrs||!this._attrs[name])return;
            var host = this, attrConfig, getter, ret;

            attrConfig = host._attrs[name];
            getter = attrConfig && attrConfig['getter'];

            ret = this._attrs[name].value;

            if (getter) ret = getter.call(host, ret);
            return ret;
        }
    }


    /*------------------------------------------------------------*/
    //事件
    var customEvents=["attrChange","dataChange"];
    var isCustomEvent=function(type){
        var result=false;
        for(var i=0;i<customEvents.length;i++){
            if(customEvents[i]===type)result=true;
        }
        return result;
    }
    var Event=function(cfg){
        this.ons(cfg);
    }
    Event.prototype={
        on:function(target,type,fn,context){
          

            context=context?context:this;
            if(K.isString(fn)){
                fn=context[fn];
            }
         
            if(K.isString(target)){
                target=K.trim(target).split(",");
            }
            if(KISSY.isArray(fn)){
                for(var i=0; i<fn.length; i++){
                    Event.on(target,type,fn[i],context);
                }
                return;
            }
            if(!fn)fn=function(){};
            if(!isCustomEvent(type)){

                KISSY.Event.on(target,type,fn,context);
            }
            else {
                KISSY.EventTarget.on(target+"_"+type,fn,context);

            }
        },
        ons:function(events,context){
            for(var type in events){
                var event=events[type];

                for(var filter in event){

                    this.on(filter,type,event[filter],context);
                }
            }
        },
        un:function(target,type,fn,context){
            if(!isCustomEvent(type))KISSY.Event.remove(target,type,fn,context);
            else KISSY.EventTarget.remove(target+"_"+type,fn,context);
        },
        fire:function(target,type){
            if(isCustomEvent(type))KISSY.EventTarget.fire(target+"_"+type);
        },
        delegates:function(events,root,context){
            context=context?context:this;
            for(var type in events){
                var event=events[type];
                for(var target in event){
                    var fn=event[target];
                    this.delegate(type,event[target],root,target,context);
                }
            }
        },
        _createDelegate:function(type, fn, filter,context) {
            var self=this;
            return function(event) {
 

               
                var matchedEl = event.target;
           
             
                if(type=="mouseout"||type=="mouseover"){
               //  matchedEl=event.relatedTarget ;
                    // K.log("run :target"+matchedEl.className);
                }

                
                if (matchedEl) {
                    if(K.isString(filter)){
                        filter=K.trim(filter).split(",");
                    }
                    for(var i =0; i < filter.length; i++){
                        var f = filter[i];
                        if(type=="mouseout"||type=="mouseover"){
                             //   K.log("matchedEl:"+event.target.className+"-----"+"f:"+f);
                     
                            if (D.test(matchedEl, f)) {
                                fn.call(self, event, matchedEl);
                                break;
                            }
                        }else{

                            if (D.test(matchedEl, f)||(matchedEl=D.parent(matchedEl, f))) {
                                fn.call(self, event, matchedEl);
                                break;
                            }
                        }
                    }
            }
        }
    },
    delegate:function(type,fn,root,filter,context) {
        var self=this;
        if (!root)root = document.body;
        context=context?context:this;

        if(K.isString(fn)){
            fn=context[fn];
        }
        if(K.isArray(fn)){
            for(var i=0; i<fn.length; i++){
                self.delegate(type,fn[i],root,filter,context);
            }
            return;
        }
        if(!fn)fn=function(){};

        if(type=="focus")type="focusin" ;
        if(type=="blur")type="focusout";
        if(type=="mouseenter")type="mouseover" ;
        if(type=="mouseleave")type="mouseout"
        var fnDelegate = this._createDelegate(type, fn, filter,context);
        this.on(root, type, fnDelegate, this, this);
    }
}

/*------------------------------------------------------------*/
//数据
var Data=function(cfg){};
    Data.prototype={
        addData:function(name,cfg){
            if(!this._data)this._data={};
            if(KISSY.isString(cfg))cfg={
                url:cfg
            }
            this._data[name]=K.clone(cfg);
        },
        addDatas:function(cfg){
            for(var name in cfg){
                this.addData(name, cfg[name])
            }

        },
        setData:function(name, cfg){
            var data=this.get(name);
            if(data) cfg=K.mix(data, cfg);
            this.addData(name, cfg);
        },

        getData:function(name){
            if(!this.hasData(name))return;
            return this._data[name];
        },
        hasData:function(name){
            if(!this._data)this._data={};
            return name && (name in this._data);

        },

        loadData:function(name,success,data){
           
            if(!this.hasData(name))return;
            var self=this;

            var config=K.mix({},this._data[name]);
            config.data=K.mix(config.data||{},data);

            config.success=function(data){
                
                self._data[name].result=data;
                 
                success(data);
                self.fire&&self.fire(name,"dataChange",self._data[name].result);
            }
          //  config.use="jsonp";

          
            new SNS.request(Helper.getApiURI(config.url),config);

        },
        simpleLoadData :function(name, success){
            var n=name, arg = arguments, l = arg.length, p, newSuccess, data={};

            for(var i = 2; i<l; i++){
                p=arg[i];
                if(!p)continue;
                if(p.nodeType){
                    var params=D.attr(p,"data-param");
                    if(params) p = K.JSON.parse(params);
                    else p={}
                }
               
                data=K.mix(data,p);
            }
 
          
            newSuccess = function(data) {
   
                if (data.status === "0") {
                    success(data);
                } else {
                    Helper.showMessage(data.msg);
                }
            }
            
            this.loadData(n, newSuccess, data);
        }
    }
    /*------------------------------------------------------------*/
    //关联

    var Assoc=function(){}
    Assoc.prototype={
        addAssocs:function(cfg){
            for(var p in cfg){
                if(p=="DOMToAttr"){
                    for(var t in cfg[p]){
                        this.addAssocDTA(t,cfg[p][t])
                    }
                }
                if(p=="AttrToDom"){
                    for(var t in cfg[p]){
                        this.addAssocATD(t,cfg[p][t])
                    }
                }
            }
        },
        addAssocDTA:function(name,cfg){
            if(!this._assocDTA)this._assocDTA={};
            var t=cfg;
            if(KISSY.isString(t)){
                cfg={}
                cfg.name=t;
            }
            this._assocDTA[name]=K.clone(cfg);
            if(cfg.both){
                this.addAssocATD([cfg.name],{
                    name:name
                });
            }
        },
        addAssocATD:function(name,cfg){
            if(!this._assocATD)this._assocATD={};
            var t=cfg;
            if(KISSY.isString(t)){
                cfg={}
                cfg.name=t;
            }
            this._assocATD[name]=K.clone(cfg);
            if(cfg.both){
                this.addAssocDTA(cfg.name,{
                    name:name
                });
            }
        },
        DOMToAttr:function(name){
            var a=this._assocDTA[name];

            if(!a)return;
            if(this.getDOM&&this.get){
                this.set(a.name,this.getDOM(name));
            }

        },
        AttrToDOM:function(name){
            var d=this._assocATD[name];
            if(!d)return;
            if(this.getDOM&&this.get){
                this.setDOM(d.name,this.get(name))
            }

        },
        assoc:function(){
            var p;

            for(p in this._assocATD){

                this.AttrToDom(p);
            }
            for(p in this._assocDTA){

                var c=this._assocDTA[p];

                if(!c.both)this.DOMToAttr(p);

            }
        },
        AttrToDOMs:function(){
            var p;
            for(p in this._assocATD){

                this.AttrToDOM(p);
            }
        },
        DOMToAttrs:function(){
            var p;
            for(p in this._assocDTA){
           
                this.DOMToAttr(p);
            }
        }


    }

    /*------------------------------------------------------------*/
    //面向切面编程
    var AOP=function(cfg){}
    AOP.prototype={
        addAOPCfg:function(cfg){
            var aopfn, type, ofn, self=this, target, i, j;
            for(var p in cfg){
               
               
                for(var o in cfg[p]){
                   
                    aopfn=cfg[p][o];
                    ofn=this._getMatchFn(o);
                    for(i=0;i<ofn.length;i++){
                        
                        if(KISSY.isArray(aopfn)){
                          
                            for(j=0; j<aopfn.length; j++) {
                                aopfn=aopfn.reverse();
                                target=self[ofn[i]];
                                self[ofn[i]]= this[p](target, aopfn[j], self);
                            }
                        } else{

                           
                            target=self[ofn[i]];
                            self[ofn[i]] = this[p](target, aopfn, self);
                          
                        }
                        
                        
                    }
                }

            }
        },

        before:function(fn,before,context){
         
            var self=this;
            context=context?context:this;

          

            if(KISSY.isString(before)){
                before=self[before];
            }
            if(!before)before=function(){};

            return function(){
                
                var stop,arg=arguments, newfn= function(){
                    fn.apply(context,arg)
                };
                var e={
                    arguments:arg,
                    target:fn,
                    halt:function(){
                        stop=true;
                    }
                }

                before.call(context,e);

                if(!stop)newfn();
            }
        },
        after:function(fn,after,context){
            var self=this;
            context=context?context:this;


        
            if(KISSY.isString(after)){
                after=self[after];
            }


            if(!after)after=function(){};
            return function(){
                var stop,arg=arguments, newfn= function(){
                    fn.apply(context,arg)
                };
                var e={
                    arguments:arg,
                    target:fn,
                    halt:function(){
                        stop=true;
                    }
                }
                e.result= newfn();

                after.call(context,e);
            }

        },
        around:function(fn,around,context){
            var self=this;
            context=context?context:this;


         
            if(KISSY.isString(around)){
                around=self[around];
            }

            if(!around)around=function(){};
            var self=this;
            return function(){
                var stop,arg=arguments, newfn= function(){
                    fn.apply(context,arg)
                };
                var e={
                    arguments:arg,
                    target:newfn,
                    halt:function(){
                        stop=true;
                    }
                }

                around.call(context,e);
            };
        },
        _getMatchFn:function(reg){
            var result=[];
            reg= reg.replace("*",".*");
         
            reg=new  RegExp(reg);
            for(var p in this){
                if(reg.test(p)){result.push(p);}
            }
            return result;
        }
    }

    /*------------------------------------------------------------*/
    // dom处理
    var DOM=function(){}
    DOM.prototype={
        addDomCfgs:function(cfg){
            for(var p in cfg){
                this.addDomCfg(p,cfg[p]);
            }
        },
        addDomCfg:function(name,cfg){
            if(!this._dom)this._dom={};
            this._dom[name]=K.clone(cfg);
            if(cfg.to&&this.addAssocDTA){
                this.addAssocDTA(name,cfg.to)
            }
        },
        getDOMCfg:function(name){
            if(!this._dom)this._dom={};
            return this._dom[name];
        },
        _getDOMNode:function(cfg,context){

    
            var n,v;
            if(!cfg)return;

            if(cfg.selector)v=KISSY.DOM.get(cfg.selector,context);
       
            if(cfg.parent)v=KISSY.DOM.parent(v || cfg.selector||context,cfg.parent);
   
            if(cfg.child)v=KISSY.DOM.child(v || cfg.selector||cfg.parent||context,cfg.child);

            
            return v;

        },
        getDOM:function(name,context){
            if(!context&&this.get)context=D.get(this.get("rootNode"));
            var cfg=this.getDOMCfg(name);

            var n,v;
            if(!cfg)return;

            v=this._getDOMNode(cfg,context);

            if(!v)return;

            if(cfg.attr){
                n=v;
                switch(cfg.attr){
                    case "innerHTML":
                        v=n.innerHTML;
                        break;
                    default:
                        v=KISSY.DOM.attr(n,cfg.attr);
                        break;
                }
            }
            return v;


        },
        setDOM:function(name,value,context){
            var cfg=this.getDOMCfg(name);
            var n,v;
            if(!cfg)return;
            v=this._getDOMNode(cfg,context);

            if(!v)return;
            if(cfg.attr){

                switch(cfg.attr){
                    case "innerHTML":
                        v.innerHTML=value;
                        break;
                    default:
                        KISSY.DOM.attr(v,cfg.attr,value);
                        break;
                }
            }
            if(cfg.style){
                KISSY.DOM.css(n,cfg.style,value);

            }



        }
    }

    /*------------------------------------------------------------*/
    //初始化组件属性
    function initAttrs(host, config) {
        if (config) {
            for (var attr in config) {
                if (config.hasOwnProperty(attr))
                    host._setAttr(attr,config[attr]);
            }
        }
    }

    /*------------------------------------------------------------*/
    //组件基类
    function Base(config) {
        var c = this.constructor, i ,l=0,
        attrs=[], events=[] ,datas=[],doms=[], aops=[],assocs=[];
        // define
        while (c) {
            l++;
            attrs.push( c['ATTRS'] );
            events.push( c['EVENTS'] );
            datas.push( c['DATAS'] );
            doms.push( c['DOMS'] );
            assocs.push( c['ASSOCS'] );
            aops.push( c['AOPS'] );


            c = c.superclass ? c.superclass.constructor : null;
        }


        for(i = l-1; i >= 0; i--){
            this.addAttrs(attrs[i]);
           
        }
        initAttrs(this,config);

        // 初始化顺序

       
        for(i = l-1; i >= 0; i--){
            this.addDatas(datas[i]);  
        }
        for(i = l-1; i >= 0; i--){
            this.addDomCfgs(doms[i]);
        }
        for(i = l-1; i >= 0; i--){
            this.addAssocs(assocs[i])

        }
        for(i = l-1; i >= 0; i--){
            this.addAOPCfg(aops[i]);
        }

        for(i = l-1; i >= 0; i--){
            if(this.hasAttr("rootNode")){
                this.delegates(events[i],this.get("rootNode"), this)
            }else  {
                this.ons(events[i]);
            }

        }

    }


    /*------------------------------------------------------------*/
    //组件 oop编程
    Base.extend=function(r, s, px, sx){
        var rp = r.prototype;
        KISSY.extend(r, s, px, sx);
        KISSY.mix(r.prototype,rp);
    }



    Base._mixConfig=function(r, s)  {
        var f=function(r,p,v){
            var result=false;
            if (!(p in r)) {
                r[p] = v;
                result=true;
            }
            return result;
        }
        if (!s || !r) return r;
        var p,t,q;
        for (p in s) {

            if(p=="ATTRS"|| p=="DATAS"|| p=="DOMS"|| p=="AOPS"){
                if(f(r,p,s[p]))continue;
                for(t in s[p]){
                    if(f(r[p],t,s[p][t]))continue;
                }
            }
            if(p=="EVENTS" || p=="ASSOCS"){
                if(f(r,p,s[p]))continue;
                for(t in s[p]){
                    if(f(r[p],t,s[p][t]))continue;
                    for(q in s[p][t]){
                        if(f(r[p][t],q,s[p][t][q]))continue;
                    }
                }
            }
            f(r,p,s[q]);
            return r;
        }
    }

    Base.mix=function(){
        var o = arguments[0], i, l = arguments.length;
        for (i = 1; i < l; ++i) {
            Base._mixConfig(o, arguments[i]);
        }
        return o;
    }

    KISSY.augment(Base, Event, Attribute, Data, DOM, AOP, Assoc);
    SNS.Base = Base;

});


