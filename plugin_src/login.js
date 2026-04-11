//# sourceURL=login.js
$(function(){
    if(gDevice.programLogo.bLoginTopLogo){
        $(".loginTopLogo").css({"background":"url('LoginTopLogo.png') no-repeat 50% 50%"});
    }
    if(gDevice.programLogo.bLogo){
        $(".logoImg").css({"background":"url('logo.png') no-repeat 50% 50%"});
    }
    $(".loginTopLogo").css("display", "block");
    
    $("#login_language").rsselect();
    $("#login_language").rsselect({
        height: "22px",
        showArrow: true,
        selectChange: function() {
            lg.refresh();
            gVar.lg = $("#login_language").rsselect("getValue");
            gVar.ChangeLang(gVar.lg);
        }
    });
    $("#login_language").rsselect("append", gOemInfo.langArray);
    $("#login_language").rsselect("setValue", gVar.lg);
    if (gOemInfo.langArray.length == 1) {
        $('#login_language').addClass('none');
    }

    gVar.pswMinLen = 0;
    gVar.pswMaxLen = 64;
    $("#loginPsw").attr("maxlength", gVar.pswMaxLen);
    $("#login_user_input,#login_user_input_confirm").attr("maxlength", gVar.pswMaxLen);
    gVar.userNameLen = 16;
    $("#userName").attr("maxlength", gVar.userNameLen);
    $("#login_userName_input").attr("maxlength", gVar.userNameLen);
    if (g_BrowseType != BrowseType.BrowseChrome) {
        if (g_BrowseType != BrowseType.BrowseOpera) {
            $(".PswEyeShow").attr("type", "password");
        }
    }
    if(g_BrowseType == BrowseType.BrowseChrome || g_BrowseType == BrowseType.BrowseOpera){
        // skin.css 添加样式
        document.styleSheets[0].insertRule('.PswEyeShow {-webkit-text-security:disc}', 0);
    }
    $('#userName').prop('placeholder', lg.get("IDS_USERNAME"));
    $('#loginPsw').prop('placeholder', lg.get("IDS_PSW"));

    $("#loginBtn").addClass("loginBtnNormal");
    $("#loginBtn").mouseover(function() {
        $(this).removeClass("loginBtnNormal").addClass("loginBtnOver")
    }).mouseout(function() {
        $(this).removeClass("loginBtnOver").addClass("loginBtnNormal")
    });

    if( WebCms.web.visibleForgetPwd && gDevice.SafetyAbility){
        var nQuestion = gDevice.SafetyAbility[gDevice.SafetyAbility.Name].Question;
        var nQr = gDevice.SafetyAbility[gDevice.SafetyAbility.Name].VerifyQRCode;
        if(nQuestion != 1 && nQuestion != 2 && nQr != 1 && nQr != 2){
            $("#ForgetPwdDiv").css("display", "none");
        }else{
            $("#ForgetPwdDiv").css("display", "");
        }
    }else{
        $("#ForgetPwdDiv").css("display", "none");
    }
    
    function LoadForgetPage(){
		MasklayerShow();
		WebCms.util.loadhtml({
			webUrl: "html/forgetpwd.html",
			callback: function(b) {
				$("#ForgetPwdContent .content_container").html(b).css("display", "block");
				lan("forgetpwd");
				WebCms.util.loadjs({
					webUrl: "html/forgetpwd.js",
					callback: function() {
						if (g_BrowseType==BrowseType.BrowseMSIE && g_browserVer.split(".")[0] * 1 <= 9) {
							$("select").addClass("IE9Select")
						}
					}
				})
			}
		});	
	}

    function onLoginBtnClk(c) {
        Web_prompt(lg.get("IDS_LOGIN_CONTTING"), false);
    
        if ($("#userName").val() == "") {
            Web_prompt(lg.get("IDS_NO_USERNAME"), true);
            return
        }
        var a = $("#" + c).attr("name");
        if (a == "clicked") {
            return
        } else {
            $("#" + c).attr("name", "clicked")
        }
        $("#loginBtn").removeClass("loginBtnNormal loginBtnOver").addClass("loginBtnDisable");
        gDevice.username = $("#userName").val();
        gDevice.password = $("#loginPsw").val();
        function LoadAlarmFunc(callback) {
            WebCms.util.loadhtml({
                webUrl: "html/alarm.html",
                callback: function(b) {
                    $("#alarm").html(b).css("display", "none");
                    SetResize("alarm");
                    WebCms.util.loadjs({
                        webUrl: "html/alarm.js",
                        callback: function() {
                            callback(100);
                        }
                    })
                }
            });
        }
        
        function loginSuccess() {
            var promptdiv = '<div id="PopPormptBox" style="display:none"><div id="PopPormptBar"><div id="PopPormptTitle"></div><div id="PopPormptClose"></div></div><div id="PopPormptContant"></div></div>';
            $("body").append(promptdiv); 
            $("#PopPormptClose").click(function(){
                $("#PopPormptBox").attr("name","out").css("display","none");
            });
            var iframe = document.getElementById('MaskLayout');
            var iframedoc = iframe.contentDocument || iframe.contentWindow.document; 
            iframedoc.body.innerHTML = "<div id='WaitTip' style='background: rgba(255,255,255,1);width:400px;height: 60px;line-height:60px;border-radius: 6px;margin: auto;margin-top:10px;opacity:1;color:#AEAEAE;text-align:center;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select:none;'>"+lg.get("IDS_WAIT_TIP")+"</div>"; 
    
            if (g_BrowseType != BrowseType.BrowseMSIE) {
                $("#loginPsw").attr("type", "text");
                $("#loginPsw").val = "";
            }
            liveBtn.innerHTML = lg.get("IDS_OSD_INFO");
            playbackBtn.innerHTML = lg.get("IDS_REPLAY");
            alarmBtn.innerHTML = lg.get("IDS_ALARM");
            configBtn.innerHTML = lg.get("IDS_SYS_SET");
            clientBtn.innerHTML = lg.get("IDS_PATH_PATH");
            logoutBtn.innerHTML = lg.get("IDS_LOGOUT");
            if(/*WebCms.plugin.isLoaded*/!0){
                $("#LiveMenu").css("display", "block");
            }else{
                $("#LiveMenu").css("display", "none");
            }
            $("#ClientMenu").css("display", "block");
            $("#AlarmMenu").css("display", "block");
            if(WebCms.web.visiblePlayBackMenu && WebCms.plugin.isLoaded){
                $("#PlayBackMenu").css("display", "block");
            }else{
                $("#PlayBackMenu").css("display", "none");
            }
            $("#login").css("display", "none");
            $(".header").css("display", "block");
            $(".mfoot").css("display", "block");
            $("#logout").attr("title", lg.get("IDS_LOGOUT"));
            var div = '<div class="alarmShowTip" style="display:none"></div>';
            $("#AlarmMenu").append(div); 
            LoadAlarmFunc(function(a){
                $("#LiveMenu").click();
            });
        }
        function syncTime(callback){
            var curTime = new Date;
            var sTime = curTime.getUTCFullYear()+"-";
            sTime += prefixInteger(curTime.getUTCMonth()+1, 2)+"-";
            sTime += prefixInteger(curTime.getUTCDate(), 2)+" ";
            sTime += prefixInteger(curTime.getUTCHours(), 2)+ ":";
            sTime += prefixInteger(curTime.getUTCMinutes(), 2)+":";
            sTime += prefixInteger(curTime.getUTCSeconds(), 2);
            var msg = {"Name" : "OPUTCTimeSetting",  "OPUTCTimeSetting":sTime};
            gDevice.SendMsg(WSMsgID.WSMsgID_SYSMANAGER_REQ, msg, function(a){
                callback(a.Ret);
            });
        }
        function SetBrowseLang(lang, callback){
            var req = { "BrowserLanguage" : { "BrowserLanguageType" : lang }, "Name" : "BrowserLanguage"};
            gDevice.SendMsg(WSMsgID.WsMsgID_CONFIG_SET, req, function(a){
                if(a.Ret == 100){
                    if(gDevice.devType == devTypeEnum.DEV_IPC){
                        if(typeof g_disableSyncTime != "undefined" && g_disableSyncTime * 1 == 1)
                        {
                            callback(a.Ret);
                        }
                        else
                        {
                            syncTime(callback);
                        }
                    }else{
                        callback(a.Ret);
                    }
                }else{
                    callback(a.Ret);
                }
            });
        }
        (function(type, callback){
            gDevice.LoginDev(function(a){
                if(a.Ret == 100){
                    gDevice.GetBaseInfo(type, function(a){
                        callback(a);
                    });
                }else{
                    callback(a.Ret);
                }
            });
        })(0, function(a){
            if(a == 100){
                var nLang = getLanguageCode(gVar.lg);
                SetBrowseLang(nLang, function(a){
                    $("#loginBtn").attr("name", "");
                    $("#loginBtn").removeClass("loginBtnDisable").addClass("loginBtnNormal");
                    if(a == 100){
                        var o = {};
                        $.cookie("Language", gVar.lg, o);
                        $.cookie("User", gDevice.username, o);
                        gDevice.startKeepAlive();
                        loginSuccess();
                    }else{
                        Web_prompt(getCodeErrorString(a), true);
                    }
                });
            }else{
                $("#loginBtn").attr("name", "");
                $("#loginBtn").removeClass("loginBtnDisable").addClass("loginBtnNormal");
                Web_prompt(getCodeErrorString(a), true);
            }
        });
    }

    gDevice.GetPreLoginInfo(function(a){
        gDevice.devLanuage = a.Language;
        gDevice.tcpPort = a.TCPPort;
        gOemInfo.setCurLang(gDevice.devLanuage);
        lan("login");
        
        GetRandomFunc(function(a){
            if(a != null && typeof a.RandomUser == 'string'){
                $("#userName").val(a.RandomUser);
                if(a.RandomPwd != 101 && a.RandomPwd != 102){
                    $("#loginPsw").val(a.RandomPwd);
                }
            }else{
                var b = $.cookie("User") ? $.cookie("User") : "";
                $("#userName").val(b);
            }
            if(gDevice.ip == "127.0.0.1"){
                gDevice.ip = "10.10.32.17";
                gDevice.httpPort = 80;
                $("#userName").val('pc');
                $("#loginPsw").val('111111qQ');
            }
            
            $("body,#userName,#loginPsw").keydown(function (e) {
                if (e.keyCode == 13) {
                    $(".loginBtn").click();
                }
            });
            $("#ForgetPwd").click(function(){
                LoadForgetPage();
            });
            $("#loginBtn").click(function(event){
                updatePositionInfo(event);
                onLoginBtnClk("loginBtn");
            });
            var name = WebCms.plugin.setupname + ".exe";
            $('#DownloadLink').attr({href: WebCms.plugin.downloadaddr, download: name || ''});
            MasklayerHide();
        });
    });
});