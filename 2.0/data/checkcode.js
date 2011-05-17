SNS("SNS.data.CheckCode", function(){
    var Helper= SNS.sys.Helper;
    var CheckCode = function(cfg){
        CheckCode.superclass.constructor.call(this,cfg);
    }
    CheckCode.DATAS = {
        "getCheckCode":{
            dataType:"json",
            url:Helper.getApiURI("http://comment.jianghu.{serverHost}/json/check_code.htm")
        }
    }
    SNS.Base.extend(CheckCode, SNS.Base);
    SNS.data.CheckCode = CheckCode;
});
