/**
 * showlogin.js
 * @author qiaofu<amdgigabyte#gmail.com>
 *
 * 浮出登陆框，不依赖于第一次亲密接触
 * 希望用户调用的时候SNS.widget.showlogin(id,fn);
 * id是浮出层的一个id
 * fn是处理浮层完毕的回调
 */
(function() {
    var K = KISSY,
        D = K.DOM,
        doc = document,
        E = K.Event;
        //这里要先用js在页面的最后创建一个浮层
            //目前样式打包进css基础css文件了
        if (!D.get('#J_login')) {

            if (location.host.indexOf('taobao.com') !== -1) {
                var iframeurl = 'https://login.taobao.com/member/login.jhtml?style=miniall';
            } else {
                var iframeurl = 'https://login.daily.taobao.net/member/login.jhtml?style=miniall';
            }

            var htmlString = '<div class="popup-login" style="display:none;">';
                htmlString += '<iframe id="J_loginiframe"';
                htmlString += ' width="354" height="285" frameborder="0"';
                htmlString += 'scrolling="no" src="#"';
                htmlString += ' data-src="' + iframeurl + '"></iframe>';
                htmlString += '<s class="clo-btn">x</s>';
                htmlString += '</div>';
            var theLoginDiv = D.create(htmlString);
            //插入到dom里面
            D.append('body', theLoginDiv);
        }

        function _showLoginPopup(hook, fn) {
            if (!hook) {
                //如果hook留空那么就使用默认的hook
                //，这里的hook约定的是class=J_LoginPopup
                hook = 'J_LoginPopup';
            }

            K.use('uibase,overlay', function(S) {
                var Align = S.UIBase.Align;
                if (!S.one(theLoginDiv)) return;

                var loginPop = new S.Overlay({
                    srcNode: S.one(theLoginDiv),
                    width: 354,
                    height: 285,
                    align: {
                        node: null,
                        points: [Align.CC, Align.CC],
                        offset: [0, 0]
                    },
                    mask: true
                });

                loginPop.on('show', function() {
                    var clo_btn = S.get('.clo-btn');
                    //登录框里面的mini登录会去做
                    //自适应高度，所以要对登录框
                    //设定高度，如果没有高度，mini
                    //登录会反复的请求xclient
                    //这里先把mini登录的iframe的
                    //src写成data-src，浮层显示的时候
                    //再把src加上。
                    //另外要注意的是会不会有缓存的问题
                    var theSrc = D.attr('#J_loginiframe', 'data-src');
                    D.attr('#J_loginiframe', 'src', theSrc);
                    E.on(clo_btn, 'click', function() {
                        loginPop.hide();
                    });
                });
                //bind show events
                E.on('body', 'click', function(e) {
                    if (!D.hasClass(e.target, 'J_Loginpopup')) {return;}
                    e.preventDefault();
                    loginPop.show();
                });
                //reg LoginSuccess to window
                function LoginSuccess() {
                    loginPop.hide();
                    //在a消失之后执行回调
                    if (K.isFunction(fn)) {
                        fn();
                    }
                }
                loginPopup = LoginSuccess;
                //loginPopup这个在外部页面调用
                //这里要把浮层的关闭事件注册到window上面
            });
        }
    SNS.widget.showLogin = _showLoginPopup;
})();
