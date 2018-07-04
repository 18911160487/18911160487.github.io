var isWindowLoad = false;
var amc_testMode = false;
window.addEventListener && window.addEventListener("load", function() {
    isWindowLoad = true;
});
(function(window) {
    'use strict';

    var shareJson = '';

    function define_library() {
        var ua = navigator.userAgent.toLowerCase();
        var amcTools = {};

        var shareTitle = '';
        var shareDesc = '';
        var shareImageURL = '';

        var weixinID = 'wx6a95e4f94bcdf351';
        var weixinAuthLink = 'https://m.chinaamc.com/mphone/mp/wxRedirect/go?redirectUrl=';
        var weixinShareAuthLink = 'https://m.chinaamc.com/mphone/mp/wxshare/getWXShareConfigInfoForJsonp?shareURL=';

        if (amc_testMode) {
            weixinID = 'wxe3d14c8eeabd246d';
            weixinAuthLink = 'http://mtest.chinaamc.com/mphone/mp/wxRedirect/go?redirectUrl=';
            weixinShareAuthLink = 'http://mtest.chinaamc.com/mphone/mp/wxshare/getWXShareConfigInfoForJsonp?shareURL=';
        }


        var getAbsoltePath = function(strUrl) {
            if (strUrl.toLowerCase().indexOf("https:") != -1 || strUrl.toLowerCase().indexOf("http:") != -1 || strUrl.toLowerCase().indexOf("file:") != -1) {
                return strUrl;
            }

            var strHref = window.location.href.split("/")[0] + "//" + window.location.host;
            if (strUrl.indexOf("/") == 0 || strUrl.indexOf("~/") == 0) {
                strUrl = strHref + strUrl.replace("~/", "/");
            } else {
                var arrHref = window.location.pathname.split("/"); //获取当前的相对路径级
                if (arrHref && arrHref[0] == '') {
                    arrHref.shift();
                }

                var intBackNum = 1;
                //对../进行退级计算
                var strBack = "";
                var back = "../";
                while (strUrl.indexOf(back) == 0) { //退回上一级目录
                    intBackNum++;
                    back += "../";
                    strBack += "../";
                }

                //减去多余的../符
                if (intBackNum > 1) {
                    strUrl = strUrl.replace(strBack, ""); //替换退格符                    
                }

                arrHref.length = arrHref.length - intBackNum; //减去路径级

                var strPath = arrHref.join("/"); //组成路径
                var strSpace = (strPath.length == 0 ? "" : "/");
                strUrl = strHref + "/" + strPath + strSpace + strUrl;
            }
            return strUrl;
        };

        window.addShareAction = function(title, desc, imageURL, shareURL, circleDesc) {
            //微信的具体参数修改
            var wxData = {
                "title": title,
                "desc": desc,
                "imageUrl": imageURL,
                "link": shareURL
            };

            if (!circleDesc) {
                circleDesc = title;
            }

            // if (wxData.link == undefined) {
            wxData.link = window.location.href.split('#')[0];
            // }
            var requestURL = weixinShareAuthLink + encodeURIComponent(wxData.link) + "&callback=jsonp" + "&_" + (new Date()).getTime() + "=";

            var script = document.createElement("script");
            script.src = requestURL;
            document.getElementsByTagName("head")[0].appendChild(script);
            window.jsonp = function(data) {
                console.info(data);
                var configJson;
                if (typeof(data) == "string") {
                    configJson = JSON.parse(data);
                } else {
                    configJson = data;
                }
                wxData.link = configJson.shareURL;

                var ret = wx.config({
                    debug: false,
                    appId: configJson.appId,
                    timestamp: configJson.timestamp,
                    nonceStr: configJson.nonceStr,
                    signature: configJson.signature,
                    jsApiList: ['onMenuShareTimeline',
                        'onMenuShareAppMessage',
                        'onMenuShareQQ', 'onMenuShareWeibo'
                    ]
                });

                wx.ready(function() {
                    setMenuShare();
                });

                function setMenuShare() {
                    wx.onMenuShareTimeline({
                        title: circleDesc,
                        // link: wxData.link,
                        link: shareURL,
                        desc: wxData.desc,
                        imgUrl: wxData.imageUrl,
                        success: function() {},
                        cancel: function() {}
                    });

                    wx.onMenuShareAppMessage({
                        title: wxData.title,
                        desc: wxData.desc,
                        // link: wxData.link,
                        link: shareURL,
                        imgUrl: wxData.imageUrl,
                        type: '',
                        dataUrl: '',
                        success: function() {},
                        cancel: function() {}
                    });

                    wx.onMenuShareQQ({
                        title: wxData.title,
                        desc: wxData.desc,
                        link: wxData.link,
                        imgUrl: wxData.imageUrl,
                        success: function() {},
                        cancel: function() {}
                    });

                    wx.onMenuShareWeibo({
                        title: wxData.title,
                        desc: wxData.desc,
                        link: wxData.link,
                        imgUrl: wxData.imageUrl,
                        success: function() {},
                        cancel: function() {}
                    });
                }
            };
        };

        var initWXShare = function(title, desc, imageURL, shareURL) {
            var oSc = document.createElement('script');
            oSc.src = 'https://res.wx.qq.com/open/js/jweixin-1.0.0.js';
            document.getElementsByTagName('head')[0].appendChild(oSc);
            //下面是微信逻辑
            if (!window.addEventListener) {
                return;
            }

            if (!isWindowLoad) {
                window.addEventListener("load", function() {
                    addShareAction(title, desc, imageURL, shareURL);
                });
            } else {
                addShareAction(title, desc, imageURL, shareURL);
            }

        };

        amcTools.isWKWebView = function() {
            if (ua.indexOf('wkwebview') != -1) {
                return true;
            } else {
                return false;
            }
        }

        amcTools.isAmcfm = function() {
            if (ua.indexOf('amcfmapp') != -1) {
                return true;
            } else {
                return false;
            }
        };

        amcTools.isAmchqt = function() {
            if (ua.indexOf('amchqtapp') != -1) {
                return true;
            } else {
                return false;
            }
        };

        amcTools.isWX = function() {
            if (ua.match(/MicroMessenger/i) == 'micromessenger') {
                return true;
            } else {
                return false;
            }
        };

        amcTools.getPlatFormID = function() {
            if (amcTools.isAmcfm()) {
                return "app";
            } else if (amcTools.isAmchqt()) {
                return "app";
            } else if (amcTools.isWX()) {
                return "weixin";
            } else {
                return "h5";
            }
        };

        amcTools.jumpToLinkWithConfig = function(linkDic) {
            var link = linkDic.default ? linkDic.default : '';

            if (linkDic.gj && amcTools.isAmcfm()) {
                link = linkDic.gj;
            } else if (linkDic.hqt && amcTools.isAmchqt()) {
                link = linkDic.hqt;
            } else if (linkDic.wx && amcTools.isWX()) {
                link = linkDic.wx;
            }
            window.location = link;
        };

        amcTools.initShare = function(shareObject) {
            if (!shareObject) {
                return;
            }

            if (!shareObject.shareURL) {
                shareObject.shareURL = window.location.href.split('#')[0];
            }

            var iconURL = shareObject.imageURL ? getAbsoltePath(shareObject.imageURL) : '';

            window.shareJson = '{"type":"url","title":"' + shareObject.title + '","message":"' + shareObject.desc + '","url":"' + shareObject.shareURL + '","image":"' +
                iconURL
            if (shareObject.callback) {
                window.shareJson += '","callback":"' + shareObject.callback;
            }
            window.shareJson += '"}';
            if (amcTools.isAmcfm() && window.addEventListener) {
                window.addEventListener('load', function() {
                    window.location.href = 'amcfm://script/callShowShare?a=1';
                });
            } else if (amcTools.isAmchqt() && window.addEventListener) {
                window.addEventListener('load', function() {
                    window.location.href = 'amchqt://script/callShowShare?a=1';
                });
            } else if (amcTools.isWX()) {
                initWXShare(shareObject.title, shareObject.desc, iconURL, shareObject.shareURL);
            } else {
                // Do nothing for now...
            }
        };

        amcTools.shareWxDialog = function(shareObject) {
            if (!shareObject) {
                return;
            }

            if (!shareObject.shareURL) {
                shareObject.shareURL = window.location.href.split('#')[0];
            }

            var iconURL = shareObject.imageURL ? getAbsoltePath(shareObject.imageURL) : '';

            var shareStr = '';
            shareStr = '{"platform":"weixin","type":"url","title":"' + shareObject.title + '","message":"' + shareObject.desc + '","url":"' + shareObject.shareURL + '","image":"' +
                iconURL
            if (shareObject.callback) {
                shareStr += '","callback":"' + shareObject.callback;
            }
            shareStr += '"}';
            if (amcTools.isAmcfm() || amcTools.isAmchqt()) {
                if (window.amcTools.isWKWebView()) {
                    window.webkit.messageHandlers.amcfm_utils.postMessage({
                        "share": shareStr
                    });
                } else {
                    amcfm_utils.share(shareStr);
                }
            }
        };

        amcTools.shareWxCircle = function(shareObject) {
            if (!shareObject) {
                return;
            }

            if (!shareObject.shareURL) {
                shareObject.shareURL = window.location.href.split('#')[0];
            }

            var iconURL = shareObject.imageURL ? getAbsoltePath(shareObject.imageURL) : '';

            var shareStr = '';
            shareStr = '{"platform":"weixin_Circle","type":"url","title":"' + shareObject.title + '","message":"' + shareObject.desc + '","url":"' + shareObject.shareURL + '","image":"' +
                iconURL
            if (shareObject.callback) {
                shareStr += '","callback":"' + shareObject.callback;
            }
            shareStr += '"}';
            if (amcTools.isAmcfm() || amcTools.isAmchqt()) {
                if (window.amcTools.isWKWebView()) {
                    window.webkit.messageHandlers.amcfm_utils.postMessage({
                        "share": shareStr
                    });
                } else {
                    amcfm_utils.share(shareStr);
                }
            }
        };

        amcTools.addLinkForElement = function(element, linkDic) {

            var link = linkDic.default ? linkDic.default : '';

            if (linkDic.gj && amcTools.isAmcfm()) {
                link = linkDic.gj;
            } else if (linkDic.hqt && amcTools.isAmchqt()) {
                link = linkDic.hqt;
            } else if (linkDic.wx && amcTools.isWX()) {
                link = linkDic.wx;
            }

            if (!element) {
                return;
            } else if (element.tagName && element.tagName == 'A') {
                element.href = link;
            } else {
                element.addEventListener('click', function(event) {
                    event.preventDefault();
                    window.location.href = link;
                });
            }
        };

        amcTools.purchaseLinkConfig = function(fundCode, fundName) {

            if (!fundCode) {
                return undefined;
            }

            var optionalFundName = fundName ? fundName : '-';

            var dic = {
                default: 'https://m.chinaamc.com/mphone/mp/purchase/deposit/' + fundCode + '/wgw',
                gj: 'amcfm://trade/purchase?fundCode=' + fundCode + '&fundName=' + optionalFundName,
                hqt: 'amchqt://trade/purchase?fundCode=' + fundCode + '&fundName=' + optionalFundName,
                wx: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6a95e4f94bcdf351&redirect_uri=https%3A%2F%2Fm.chinaamc.com%2Fmphone%2Fmp%2FwxRedirect%2Fgo%3FredirectUrl%3Dhttps%3A%2F%2Fm.chinaamc.com%2Fmphone%2Fmp%2Fpurchase%2Fdeposit%2F' + fundCode + '%2Fwx&response_type=code&scope=snsapi_base&state=123#wechat_redirect'
            };

            return dic;
        };

        amcTools.subscribeLinkConfig = function(fundCode, fundName) {

            if (!fundCode) {
                return undefined;
            }

            var optionalFundName = fundName ? fundName : '-';

            var dic = {
                default: 'https://m.chinaamc.com/mphone/mp/subscribe/subscribe/' + fundCode + '/wgw',
                gj: 'amcfm://trade/subscribe?fundCode=' + fundCode + '&fundName=' + optionalFundName,
                hqt: 'amchqt://trade/subscribe?fundCode=' + fundCode + '&fundName=' + optionalFundName,
                wx: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx6a95e4f94bcdf351&redirect_uri=https%3A%2F%2Fm.chinaamc.com%2Fmphone%2Fmp%2FwxRedirect%2Fgo%3FredirectUrl%3Dhttps%3A%2F%2Fm.chinaamc.com%2Fmphone%2Fmp%2Fsubscribe%2Fsubscribe%2F' + fundCode + '%2Fwx&response_type=code&scope=snsapi_base&state=123#wechat_redirect'
            };

            return dic;
        };

        amcTools.authLinkForUrl = function(url) {

            if (!url) {
                return undefined;
            } else {
                var redUri = encodeURIComponent(weixinAuthLink + encodeURIComponent(url));
                return 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + weixinID + '&redirect_uri=' + redUri + '&response_type=code&scope=snsapi_base&state=123#wechat_redirect';
            }
        };

        return amcTools;
    }

    if (typeof(amcTools) === 'undefined') {
        window.amcTools = define_library();

        if (window.amcTools.isAmcfm() || window.amcTools.isAmchqt()) {
            window.callShowShare = function(str) {
                if (str) {
                    if (window.amcTools.isWKWebView()) {
                        window.webkit.messageHandlers.amcfm_utils.postMessage({
                            "shouldShowShare": "yes",
                            "message": window.shareJson
                        });
                    } else {
                        amcfm_utils.showShare(window.shareJson);
                    }
                }
            };
        }

    } else {
        console.log("amcTools is already defined.");
    }
})(window);