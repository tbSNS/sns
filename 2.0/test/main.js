module.declare(["a","b","c"],function(require,exports,module){
   
    var a =require("a").a;
    var b =require("b").b
    var c =require("c");
    var result = c(a,b);
    console.log("-------------------main module ------------------------")
    console.log("a="+a)
    console.log("b="+b)
    console.log("c="+c)
    console.log("c(a,b)="+result)
    

})