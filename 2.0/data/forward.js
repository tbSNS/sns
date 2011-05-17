
SNS("SNS.data.Forward",function(){
    var Helper=SNS.sys.Helper;
    var Forward = function(cfg){
        Forward.superclass.constructor.call(this,cfg);
    }
    Forward.DATAS = {
        forward:Helper.getApiURI("http://t.{serverHost}/weibo/addWeiboResult.htm?event_submit_do_publish_weibo=1&action=weibo/weiboAction")
    }
    SNS.Base.extend(Forward, SNS.Base,{
        forward:function(param,success){
            var self=this;
            new SNS.sys.BasicDataSource({
                url: Helper.getApiURI(self.getData("forward").url),
                parms: param,
                success: success
            }).iframeProxy();
        }
    });
    SNS.data.Forward = Forward;
})

