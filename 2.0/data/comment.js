SNS("SNS.data.Comment", function(){
    var Helper= SNS.sys.Helper;


    var Comment = function(cfg){
        Comment.superclass.constructor.call(this,cfg);
    }
    Comment.DATAS = {
        getCmtBox:{
            url:"http://comment.jianghu.{serverHost}/json/cc_list.htm?_input_charset=utf-8",
            dataType:"json"
        },
        getCmtList:{
            url:"http://comment.jianghu.{serverHost}/json/page_list.htm?_input_charset=utf-8",
            dataType:"json"
        },
        postCmt:{
            url:"http://comment.jianghu.{serverHost}/json/add.htm?action=comment/comment_action&event_submit_do_add=true&_input_charset=utf-8",
            dataType:"json"
        },
        delCmt:{
            url:"http://comment.jianghu.{serverHost}/json/del_comment.htm?_input_charset=utf-8",
            dataType:"json"
        }
    }
    SNS.Base.extend(Comment, SNS.Base);
    SNS.data.Comment = Comment;
});
