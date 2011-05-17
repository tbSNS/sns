/*
 * 叽歪转发
 * 调用 new SNS.widget.MicroblogForward({参数列表})
 * @author bofei
 * @date 2010.12.20
 */

SNS("SNS.widget.Forward",function() {



    var  Helper = SNS.sys.Helper,  K=KISSY, D=K.DOM, E = K.Event;

    /*
     * @class  叽歪转发
     */
    var Forward = function(cfg) {
        //需要传到后台的参数
        this.cfg = {
            param:{},
            paramCmt:{},
            paramFwd:{},
            maxlength: '210',
            txt: '顺便说点什么吧...',
            tplURL: 'http://t.{serverHost}/weibo/ajax/forward.htm?_input_charset=utf-8',
            fowardURL: 'http://t.{serverHost}/weibo/addWeiboResult.htm?event_submit_do_publish_weibo=1&action=weibo/weiboAction',
            postMBCommentURL: 'http://comment.jianghu.{serverHost}/json/publish_comment.htm?action=comment/commentAction&event_submit_do_publish_comment_batch=true',
            //转发成功是否要刷新页面
            refresh: false
        };
        this._cfg(cfg);
    }
    Forward.prototype = {

        /*
         * @constructs
         */
        init: function(cfg) {

            this._setup();


        },
        _cfg: function(cfg) {
            this.cfg = K.merge(this.cfg, cfg || {});
        },
        // 配置参数 创建弹出层
        _setup: function() {
              // 检查登录状态，没登录直接显示登录框
            if (!Helper.checkAndShowLogin({
                callback: function() {

                }
            })) {
                // 修正 IE6 下文本框有可能无法获取焦点的 bug

                return;
            }
            var self=this;
            var popup=function(html){

                self.panel = SNS.sys.snsCenterPanel(html, {
                    width: '398px',
                    hideHandleTop: '10px',
                    hideHandleRight: '10px',
                    fixed: false
                });



                // 初始化点名功能
                new SNS.widget.MicroSuggest({
                    root: self.panel.content,
                    minHeight: 60,
                    callback: function() {
                        self.showNum();
                    }
                });
                // 限制textarea的长度
                Helper.addMaxLenSupport(self.panel.content, 210, 'f-txt');

				self.recoverTxt();//设置默认文案
                self.showNum();
                self._on();

            }


            SNS.request(Helper.getApiURI(self.cfg.tplURL),{
                data:self.cfg.param,
                dataType:"json",
                success:function(data){
                    if(data.status=="0"){
                      
                        popup(data.result.html);
                        self.cfg.paramFwd=data.result.param;
                        self.cfg.paramCmt=data.result.paramCmt;
           

                    }
                    else Helper.showMessage(data.msg);
                }
            })

        },


        // 添加事件
        _on: function() {
            var self = this, content = self.panel.content,
				num = D.get('.num-value',content),
				textarea = D.get('.f-txt',  content),

				cancle = D.get('.cancle', content),
				confirm = D.get('.confirm', content),
				face = D.get('.icon-insert-face',content),
				value = textarea.value;

            Helper.fixCursorPosition(textarea);
            SNS.sys.form.setPlaceHolder(textarea);
            textarea.style.overflow = 'hidden';

            if (D.attr(textarea,"placeholder")==value) {
				textarea.value="";
				textarea.focus();
            }
            else {
				//如果前两个字符为 // 则定位到第一个, 否则在最后
				if(0 === K.trim(value).indexOf('//')) {
					this.setCaretPosition(textarea, 0);
				}
				textarea.focus();
            }


            E.on(textarea, 'keyup', function() {
                self.showNum();

            });

            E.on(cancle, 'click', function(e) {
                e.preventDefault();
                self.panel.hide();
            },this, true);

            E.on(confirm, 'click', function(e) {
                e.preventDefault();
                this.clearTxt();
                self.forwardEvent();
            },this, true);

            //添加表情事件
            SNS.widget.faceSelector.init({
                elTrigger:face,
                container:content,
                insertBefore:function(){
                    if (textarea.value.length >= 210)return false;

                },
                insertAfter:function(){
                    self.clearTxt();
                    var n = 210 - textarea.value.length;
                    if (n < 0)n = 0;
                    num.innerHTML = n;

                }
            });


        },
        clearTxt: function() {
            var self = this, content = self.panel.content,
            textarea = D.get('.f-txt',content);
            if (textarea.value == this.cfg.txt) {
                textarea.value = '';
            }
        },
        showNum: function() {
            var self = this, content = self.panel.content,
            num = D.get('em.num-value', this.content),
            textarea = D.get('.f-txt', content);

            var n = 210 - textarea.value.length;
            if (n < 0)n = 0;
            num.innerHTML = n;
        },
        recoverTxt: function() {
            var self = this, content = self.panel.content,
            textarea = D.get('.f-txt', content);
            if (K.trim(textarea.value) == '') {
                textarea.value = this.cfg.txt;
            }
        },
        //设置光标位置函数
        setCaretPosition: function(ctrl, pos) {
            setTimeout(function() {
                if (ctrl.setSelectionRange)
                {
                    ctrl.focus();
                    ctrl.setSelectionRange(pos, pos);
                }
                else if (ctrl.createTextRange) {
                    var range = ctrl.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', pos);
                    range.moveStart('character', pos);
                    range.select();
                }
                ctrl.focus();
            }, 50);
        },


        forwardEvent: function() {
             // 检查登录状态，没登录直接显示登录框
            if (!Helper.checkAndShowLogin({
                callback: function() {

                }
            })) {
                // 修正 IE6 下文本框有可能无法获取焦点的 bug

                return;
            }


            var self = this, content = self.panel.content,
            num =D.get('.num-value'.content),
            textarea = D.get('.f-txt', content),
            sendmsg =D.get('.sendmsg', content),
            osendmsg = D.get('.osendmsg',  content),

            param= K.mix(this.cfg.paramFwd,{
                content:textarea.value
            }),
            paramCmt = K.mix(this.cfg.paramCmt, {
                batch:0,
                content:textarea.value
            });

            //转发转评论
            if (sendmsg.checked&&osendmsg&&osendmsg.checked)paramCmt.batch = '2';
            if (!sendmsg.checked&&osendmsg&&osendmsg.checked)paramCmt.batch = '1';



            var successPanel = function(msg) {
                var html = '<div>转发成功.</div>'
                new SNS.sys.Popup({
                    title: '小提示',
                    content: html,
                    type: 'success',
                    onShow: function() {
                        var that = this;
                        setTimeout(function() {
                            that.hide();
                        }, 4000);
                    }
                });
            }
            var failurePanel = function(msg) {
                new SNS.sys.Popup({
                    title: '小提示',
                    content: msg,
                    type: 'error'
                });
            //var panel=Helper.showMessage(msg);

            }

            var success = function(data) {
                if (data.status == 1) {
                    self.panel.hide();
                    if ((sendmsg && sendmsg.checked) || (osendmsg && osendmsg.checked)) {
                        self.comment(paramCmt, successPanel);
                    } else successPanel();
                }
                else if (data.status == 2) {
                    failurePanel(data.msg);
                }
                else {
                    if (!Helper.checkAndShowLogin()) {
                        return;
                    }
                }
            }

            this.forward(param, success);

        },
        forward:function(param,success){
            param =K.mix(this.cfg.paramFwd, param||{});
            new SNS.sys.BasicDataSource({
                url: Helper.getApiURI(this.cfg.fowardURL),
                parms: param,
                success: success
            }).iframeProxy();
        },


        comment:function(param, success){
            var self=this;
            var commentCallback = function(data) {
                if (!data.msg)data.msg = '';
                if (data && data.status && data.status == 12) {

                    var content = '<div class="sns-nf">' +
                    '<div id="J_FollowCheckCodeMsg" style="color:red;margin-bottom:20px;">' + data.msg + '</div>' +
                    '<span>验证码：</span>' +
                    '<input type="text" maxlength="4" id="J_FollowCheckCode" class="f-txt" style="width:50px"/>' +
                    '<img id="J_FollowCheckCodeImg" style="vertical-align:middle" width="100" src="' + SNS.sys.Helper.getApiURI(data.result.checkCodeUrl) + '"/>' +
                    '(不区分大小写) &nbsp;' +
                    '<a href="#" id="J_FollowCheckCodeChange">换一张</a>' +
                    '</div>';
                    var checkCode, change, img;
                    var checkpanel = SNS.sys.snsDialog({
                        width: '400px',
                        className: 'checkCode',
                        title: '请输入评论验证码:',
                        height: '167px',
                        content: content,
                        confirmBtn: function() {
                            var checkCode = D.get('#J_FollowCheckCode');
                            var msg = D.get('#J_FollowCheckCodeMsg');
                            var newQueryParam = param;
                            newQueryParam['TPL_checkcode'] = checkCode.value;
                            self.comment(newQueryParam, success);
                            checkpanel.hide();
                        }
                    });

                    checkCode = D.get('#J_FollowCheckCode');
                    change = D.get('#J_FollowCheckCodeChange');
                    img = D.get('#J_FollowCheckCodeImg');
                    E.on(change, 'click', function(e) {
                        e.halt();
                        img.src = SNS.sys.Helper.getApiURI(data.result.checkCodeUrl);
                    });

                }
                else {
                    if(success)success();
                }

            }

            var cmt= new SNS.data.Comment()
            cmt.loadData("postCmt",commentCallback, param);
        }

    };

    SNS.widget.Forward = Forward;

});
