/**
 * Class ʵ��
 * ʹ���������ʵ�ּ̳к���չ
 * requires SNS 
 * @author zhangquan
 * @date   2009-08-17
 */
module.declare(function(require, exports, module){
		 
    /**
     * Class�Ĺ�����
     * @param {Object} ����������������Լ���
     * @return {Function} ����Ĺ�����
     */
    function Class(newClass,classData){
        //��������Ƿ������ͣ��Ѵ˷�������������
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
	
    //����
    Class.mixin=function(original, extended){
        if(original){
            for (var key in (extended || {})) if(extended[key]!=null)original[key] = extended[key];
		
            return original;
        }
    }
   
    //����
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
	 *��������
	 *@method Class.implement
	 *@origin {Object} Դʼ����
	 *@parms {Object} ��Ҫʵ�ֵ�����
	 */
    Class._build=function(origin, key, value){
        //ʵ�ּ̳к���չ
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
		* ���̳�
		* @super ��Function������
		*/
        extend:function(parent){
			
            //�̳�ԭ��
            this.parent=parent;
            var F=function(){};
            F.prototype=parent.prototype;
            this.prototype=new F();

            //���ø���Ĺ�������ֻ֧���ڹ��캯����ֱ�ӵ���
			
			
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
		* ������չ
		* ��֧��instanceof����
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
    //���ù��߷���
		
		
    }
	
	
    return Class;

	
});
