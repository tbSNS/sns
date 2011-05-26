

(function (context) {

    var

    /**
   * --------------------------------
   *  定义一个工具集，来帮助建造模块系统
   * --------------------------------
   */
  
    isEmpty= function(it) {
        for (var p in it) return 0;
        return 1;
    },

    toString = {}.toString,
    testPrefix= "[object ",
    functionMarker= testPrefix + "Function]",
    arrayMarker= testPrefix + "Array]",
    stringMarker= testPrefix + "String]",

    isFunction= function(it) {
        return toString.call(it)==functionMarker;
    },

    isString= function(it) {
        return toString.call(it)==stringMarker;
    },

    isArray= function(it) {
        return toString.call(it)==arrayMarker;
    },

    forEach= function(vector, callback) {
        for (var i= 0; vector && i<vector.length;) callback(vector[i++]);
    },

    setIns= function(set, name) {
        set[name]= 1;
    },

    setDel= function(set, name) {
        delete set[name];
    },

    mix= function(dest, src) {
        for (var p in src) dest[p]= src[p];
        return dest;
    };
    // 临时代码，防止报错
    if(!context.console){
        console={};
        console.log=function(m){
        }
    }

    /**
   * --------------------------------
   *  定义一些变量来存储各种状态下模块信息
   * --------------------------------
   */
    var
    //存储正在加载的模块信息，防止重复加载
    loadingModules = {},
    //当前正在等待被记录的模块信息
    pendingModule,
    // 存储已经载入到模块环境的模块
    memoryModules = {},
    // 存储模块exports 对象
    requireModules = {},
    // 针对老ie浏览器js执行问题，定义一个变量来记录当前正在执行的javascript,以获取模块id
    scriptTagMemoryIE,
    
    mainModule,
    
    mainModuleDir;

    /**
   * --------------------------------
   *  相路径相关的一些方法
   * --------------------------------
   */

    /**
   * Extracts the directory portion of a path.
   * dirname('a/b/c.js') ==> 'a/b/'
   * dirname('d.js') ==> './'
   */
    var
    
    dirname = function (path) {
        var s = ('./' + path).replace(/(.*)?\/.*/, '$1').substring(2);
        return (s ? s : '.') + '/';
    },

    /**
   * Canonicalizes a path.
   * realpath('./a//b/../c') ==> 'a/c'
   */
    realpath = function (path) {
        // 'a//b/c' ==> 'a/b/c'
        path = path.replace(/([^:]\/)\/+/g, '$1');

        // 'a/b/c', just return.
        if (path.indexOf('.') === -1) {
            return path;
        }

        var old = path.split('/');
        var ret = [], part, i = 0, len = old.length;

        for (; i < len; i++) {
            part = old[i];
            if (part === '..') {
                if (ret.length === 0) {
                //无效路径
                }
                ret.pop();
            }
            else if (part !== '.') {
                ret.push(part);
            }
        }

        return ret.join('/');
    },

    getHost = function (url) {
        return url.replace(/^(\w+:\/\/[^/]+)\/?.*$/, '$1');
    },


    /**
     * Turn a script URL into a canonical module.id
     **/
    uriToId = function (moduleURL, relaxValidation){
        var i, id=moduleURL;

        /* Treat the whole web as our module repository.
   * 'http://www.page.ca/a/b/module.js' has id '/www.page.ca/a/b/module'.
   */

      
        i = moduleURL.indexOf("://");
        
        if (i != -1){
            id = moduleURL.slice(i + 2);
        }
            
     
        id = realpath(id);
        if ((i = id.indexOf('?')) != -1)
            id = id.slice(0, i);
        if ((i = id.indexOf('#')) != -1)
            id = id.slice(0, i);

        if (!relaxValidation && (id.slice(-3) != ".js"))
            throw new Error("Invalid module URL: " + moduleURL);
        id = id.slice(0,-3);

        return id;
    };


    /**
   * --------------------------------
   *  获取资源相关的方法
   * --------------------------------
   */
    var scriptOnload = function(node, callback) {
        node.addEventListener('load', callback, false);
        node.addEventListener('error', callback, false);

    // NOTICE: Nothing will happen in Opera when the file status is 404. In
    // this case, the callback will be called when time is out.

    };
    if (!document.addEventListener) {
        scriptOnload = function(node, callback) {
            node.attachEvent('onreadystatechange', function() {
                var rs = node.readyState;
                if (rs === 'loaded' || rs === 'complete') {
                    callback();
                }
            });
        }
    }

    
    var head,
   
    getScript = function(url, callback, charset) {
        if(!head) head = document.getElementsByTagName('head')[0];
        var node = document.createElement('script');
        var isLoaded = false;
        var  cb =function() {
            isLoaded = true;
            if (callback) callback.call(node);

            // Reduces memory leak.
            try {
                if (node.clearAttributes) {
                    node.clearAttributes();
                } else {
                    for (var p in node) delete node[p];
                }
            } catch (x) {
            }
        // head.removeChild(node);
        }
        scriptOnload(node, cb);

        setTimeout(function() {
            if (!isLoaded) {
                cb();
            }
        }, 1000);

        if (charset) node.setAttribute('charset', charset);
        node.async = true;
        node.src = url;
        return head.insertBefore(node, head.firstChild);
    },

 
    getInteractiveScript = function() {
        
        var scripts = head.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            var script = scripts[i];
            if (script.readyState === 'interactive') {
                return script;
            }
        }

        return null;
    }

  
    /**
     * -----------------------------------------------
     * reqiure
     * -----------------------------------------------
     */

    var initializeModule = function(module,moduleFactory){
        var require, exports;
  console.log('module ('+module.id   +') init ')
        require = createRequire(module);
        exports = requireModules[module.id] = {};
        var result =moduleFactory(require, exports, module);
        if(result!==undefined){
            requireModules[module.id]=result;
        }
        
       
    }
    // 实现commonjs module2.0定义的 require 对象
    // http://www.page.ca/~wes/CommonJS/

    var createRequire = function (module) {
        
        var newRequire = function(moduleIdentifier){
            var id = newRequire.id(moduleIdentifier);
           
            if (!requireModules[id] && memoryModules[id]){
                var  module  = new Module(id, memoryModules[id].dependencies);
                initializeModule(module,memoryModules[id].moduleFactory);
            }
           
            if (id === null || !requireModules[id])
                throw new Error("Module " + id + " is not available.");
            return requireModules[id];
        }


        newRequire.memoize = function (id, dependencies, moduleFactory) {
            if(memoryModules[id]) throw new Error("此模块已经存在id："+id);
            memoryModules[id] = {
                moduleFactory: moduleFactory,
                dependencies: dependencies
            };
        }

        newRequire.isMemoized = function (id){
            return memoryModules[id] ? true : false;
        }

        newRequire.uri = function (moduleIdentifier){
            var id = newRequire.id( moduleIdentifier);
            if (id === '')
                throw new Error("Cannot canonically name the resource bearing this main module");
            return window.location.protocol + "/" + id + ".js";
        }

        newRequire.id = function (moduleIdentifier) {
            var relativeModuleId = module.id?module.id:mainModuleDir;
            var id =moduleIdentifier;
            var ret;
            // 去后缀
            if(id.indexOf('.js') !== -1){
                id= id.substring(0,id.indexOf('.js'));
            }

            // absolute id
            if (id.indexOf('://') !== -1) {
              
                ret = id.substring(id.indexOf('://')+2);
                
            }
            // relative id
            else if (id.indexOf('./') === 0 || id.indexOf('../') === 0) {
                // Converts './a' to 'a', to avoid unnecessary loop in realpath.
                id = id.replace(/^\.\//, '');
                ret = dirname(relativeModuleId) + id;
            }
            // root id
            else if (id.indexOf('/') === 0) {
                ret = getHost(relativeModuleId) + id;
            }
            // top-level id
            else {
                ret = mainModuleDir + '/' + id;
            }

            return realpath(ret);
        }
        //This property is deprecated and the name reserved for
        // environments wishing to provide backwards
        // compatibility with Modules/1.1.1 modules using this feature.
        newRequire.main = mainModule;
        module.require =newRequire;

        return newRequire;
   

    }

    /**
     * -----------------------------------------------
     * // 实现commonjs module2.0定义的 module 对象
     * -----------------------------------------------
     */
    var Module = function (id, dependencies) {
        this.id = id;
        this.dependencies = dependencies;
    }

    Module.prototype.declare = function( dependencies, moduleFactory) {

        if(isFunction(dependencies)){
            moduleFactory =dependencies;
            dependencies = [];
        }
        var require =this.require, uri;

        if (document.attachEvent && !window.opera) {
            // For IE6-9 browsers, the script onload event may not fire right
            // after the the script is evaluated. Kris Zyp found that it
            // could query the script nodes and the one that is in "interactive"
            // mode indicates the current script. Ref: http://goo.gl/JHfFW
            var script = getInteractiveScript();
            if (script) {
                uri = script.hasAttribute ? // non-IE6/7
                script.src :
                // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
                script.getAttribute('src', 4);
            }

            // In IE6-9, if the script is in the cache, the "interactive" mode
            // sometimes does not work. The script code actually executes *during*
            // the DOM insertion of the script tag, so we can keep track of which
            // script is being requested in case define() is called during the DOM
            // insertion.
            else {
                uri = scriptTagMemoryIE;
            }

        // NOTE: If the id-deriving methods above is failed, then falls back
        // to use onload event to get the module uri.
        }
        if (uri) {
          
            require.memoize(uriToId(uri), dependencies, moduleFactory);

        } else {
            // Saves information for "real" work in the onload event.
            pendingModule = {
                dependencies:dependencies,
                moduleFactory:moduleFactory
            };
        }

    };

    Module.prototype.provide = function (dependencies, callback) {
       

 
        var self = this ,deps = [], id, require = self.require;
        //验证参数
        // 去重
        for(var i=0, n = dependencies.length;i<n;i++){
            id= require.id(dependencies[i]);
            if(!require.isMemoized(id)){
                deps.push(dependencies[i]);
            }
        }
    
        //如果没有依赖，直接运行callback
        if(deps.length === 0) {
            callback();
            return
        }
    
        for(var j = 0, m = deps.length, remain = m; j <n; j ++){
  
            (function(moduleIdentifier){
                
                self.load(moduleIdentifier, function(){
                    var deps = (memoryModules[require.id(moduleIdentifier)] || 0).dependencies || [];
                    var m = deps.length;

                    if (m) {
                        remain += m;

                        provide(deps, function() {
                            remain -= m;
                            if (remain === 0) if(callback)callback();
                        }, true);
                    }

                    if (--remain === 0) if(callback)callback();
                });
            })(deps[j]);
        }

    }

    Module.prototype.load = function(moduleIdentifier, callback){
        var require =this.require;
        if (module.hasOwnProperty("declare"))
            delete module.declare;
      
        var id = require.id(moduleIdentifier);
       
        var uri = require.uri(moduleIdentifier);
     
        var cb =function() {
            if (pendingModule) {
                var moduleFactory =pendingModule.moduleFactory;

                //为moduleFactory 增加一个适配器， 使模块的返回结果进行加工和处理
                var moduleAdapte = function(require, exports ,module){
                    var result = moduleFactory(require, exports ,module);
                    if(result!= undefined&&result.moduleContext){
                        result.moduleContex = module;
                       
                    } else{
                        for(var p in exports){
                            if(exports[p].moduleContext)exports[p].moduleContext = module;
                        }
                    }
                    return result;
                }
                require.memoize(id, pendingModule.dependes, moduleAdapte);
                pendingModule = null;
            }

            if (loadingModules[uri]) {
                delete loadingModules[uri];
            }

            if (callback) callback();

        }
        if (loadingModules[uri]) {
             
            scriptOnload(loadingModules[uri], cb);
        }
        else {
            // See fn-define.js: "uri = data.pendingModIE"
            scriptTagMemoryIE = uri;
            console.log('load module <a href="'+uri+'">'+uri+'</a>')
            loadingModules[uri] = getScript(uri, cb);

            scriptTagMemoryIE = null;
        }

       
    }

    
    /**
     * -----------------------------------------------
     * 系统初始化
     * -----------------------------------------------
     */

    var bootstrap = function (){

        mainModuleDir = dirname(uriToId(window.location.href , true));
        /** Extra-module environment */
   
        context.module  = new Module('', []);

        context.require = createRequire(context.module);
        
    }

    bootstrap();


    /**
     * -----------------------------------------------
     * 主模块初始化
     * -----------------------------------------------
     */
    
    var initializeMainModule = function (dependencies, moduleFactory){
        /* special extra-module environment bootstrap declare needs to go */
        if (module.hasOwnProperty("declare"))delete module.declare;

        if (module.constructor.prototype.main) throw new Error("Main module has already been initialized!");

        var scripts = document.getElementsByTagName("SCRIPT");
        var currentScript = scripts[scripts.length-1];
     
        var id = require.id(currentScript.src);
 
        mainModuleDir = dirname(id);
        require.memoize(require.uri(id), dependencies, moduleFactory);
        module.constructor.prototype.main = new Module(id, dependencies);
       
        module.provide(dependencies,function(){
           
            initializeModule(module.constructor.prototype.main,moduleFactory);
             
 
        }) 
    }

    module.declare = function (dependencies, moduleFactory){
        if (isFunction(dependencies)){
            moduleFactory = dependencies;
            dependencies = [];
        }
        initializeMainModule(dependencies, moduleFactory);
    }


})(window);

