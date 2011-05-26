/**
 * Class 实现
 * 使代码更容易实现继承和扩展
 * requires SNS 
 * @author zhangquan
 * @date   2009-08-17
 */
module.declare(function(require, exports, module){
		 
    /**
     * Class的构造器
     * @param {Object} 构造新类所需的属性集合
     * @return {Function} 新类的构造器
     */
    function Class(newClass,classData){
        //如果参数是方法类型，把此方法当作构造器
        if(typeof newClass !=="function"){
            classData = newClass;
            newClass=function(){
                var value = (this.constructor) ? this.constructor.apply(this, arguments) : this;
                return value;
            }
        }

        if(!classData) classData = {};
     
		
        Class._build(newClass,classData);
        var parentMethod=newClass.prototype["parent"];
        parentMethod=parentMethod?parentMethod:Object;
        newClass.constructor=Class;
        newClass.prototype.constructor=newClass;
		
        return newClass;
		
    }
	
    //混入
    Class.mixin=function(original, extended){
        if(original){
            for (var key in (extended || {})) if(extended[key]!=null)original[key] = extended[key];
		
            return original;
        }
    }
   
    //复制
    Class.clone=function(object){
        var cloned;
		
        switch (typeof(object)){
            case 'object':
                cloned = {};
                for (var p in object) cloned[p] = Class.clone(object[p]);
                break;
            case 'array':
                cloned = [];
                for (var i = 0, l = object.length; i < l; i++) cloned[i] = Class.clone(object[i]);
                break;
            default:
                return object;
        }
		
        return cloned;
    }

	

    /**
	 *构造新类
	 *@method Class.implement
	 *@origin {Object} 源始对象
	 *@parms {Object} 需要实现的属性
	 */
    Class._build=function(origin, key, value){
        //实现继承和扩展
        if (typeof(key) == 'object'){
            for (var p in key) Class._build(origin,p,key[p]);
            return origin;
        }
				
				
        var inheritance=Class.inheritance[key];
        if(inheritance){
            value=inheritance.call(origin,value);
            if(value==null)return origin;
        }
				
        var proto = origin.prototype;
				

        switch (typeof(value)){
			
            case 'object':
                proto[key] = Class.clone(value);
                break;
            case 'function':
                value._name=key;
                proto[key]=value;
                break;
            case 'array':
                proto[key] = Class.clone(value);
                break;
			
            default:
                proto[key] = value;
                break;

        }
	
    }
	
	
    Class.inheritance={
		
	
        /**
		* 单继承
		* @super ｛Function｝超类
		*/
        extend:function(parent){
			
            //继承原型
            this.parent=parent;
            var F=function(){};
            F.prototype=parent.prototype;
            this.prototype=new F();

            //调用父类的构造器，只支持在构造函数中直接调用
			
			
            this.prototype.parent=function(){
                this._sope=arguments.callee._owner;
				
				
                var previous = this._sope.parent.prototype[arguments.callee.caller._name];
                if (!previous) throw new Error('The method "' + method + '" has no parent.');
                this._sope=arguments.callee._owner;
				
                return previous.apply(this, arguments);
            }
			
            this.prototype.parent._owner=this;
			
        },
		
        /**
		* 多重扩展
		* 不支持instanceof操作
		* @parents {Array} 
		*/
        implement:function(parents){
            var parentlist=[];
            if(typeof(parents)=="array")parentlist=parents;
            else parentlist.push(parents);
		
			
            for(var i=0;i<parentlist.length;i++){
                var parent=parentlist[i];

                if(typeof(parent)=="function")parentlist[i]=new parent();
                Class.mixin(this.prototype,parentlist[i]);
            }
        },
        statics:function(methods){
            Class.mixin(this,methods);
        },
        config :function(cls, data){
            
        }
    //常用工具方法
		
		
    }
	
	
    return Class;

	
});
