//# sourceURL=System_ColorParam.js
$(function(){
    var chnIndex = -1;
    var VideoColor;
    var oldVideoColor;
    var CameraCfg = null;
    var bIPC = gDevice.devType == devTypeEnum.DEV_IPC ? true : false;
    var nAnaChannel = gDevice.loginRsp.VideoInChannel;
    var nDigChannel = gDevice.loginRsp.DigChannel;
    var nTotalChannel = gDevice.loginRsp.ChannelNum;
    var bGetCamera = false;
    var bOnvifChannel = [];
    var copyCh = [];
    var pageTitle = $("#System_ColorParam").text();
    $("#TimeEnable, #BH, #BM, #EH, #EM").prop("disabled", true);
    if(!bIPC){
        $("#CameraSet").css("display", "none");
    }
    function FillData(nColor, nCamera){
        $("#colorCopyTD").css("display", "none");
        if(chnIndex >= gDevice.loginRsp.VideoInChannel){
            $("#ColorSetdefault, #AnalogBtnBox").css("display", "none");
        }else{
            if(bIPC){
                $("#ColorSetdefault").css("display", "");
                $("#AnalogBtnBox").css("display", "none");
            }else{
                $("#ColorSetdefault").css("display", "none");
                $("#AnalogBtnBox").css("display", "");
            }
        }
        $("#ColorSet_Box .MaskDiv").css({
            "width": "100%",
            "left": 0
        });
        $("#ColorSet_Box .slider").css({
            "opacity": 1,
        });
        bGetCamera = nCamera == 100 ? true : false;
        if(nColor != 100){
            DivBox(0, "#ColorSet_Box");
            if(bIPC){
                DivBox(0, "#CameraSet");
            }
            $("#ColorSet_Box .MaskDiv").css("display", "block");
            $("#ColorSet_Ok").attr("disabled", true);
    	    $("#ColorSet_Ok").stop().addClass("btn-disable").fadeTo("slow", 0.2);
			
            if(bIPC){
                $("#ColorSetdefault").attr("disabled", true);
                $("#ColorSetdefault").stop().addClass("btn-disable").fadeTo("slow", 0.2);
            }else{
                if(chnIndex < gDevice.loginRsp.VideoInChannel){
                    $("#AnalogBtnBox").find("button").attr("disabled", true);
                    $("#AnalogBtnBox").find("button").stop().addClass("btn-disable").fadeTo("slow", 0.2);
                }
            }
            return;
        }else{
            DivBox(1, "#ColorSet_Box");
            if(bIPC){
                DivBox(1, "#CameraSet");
            }
            $("#ColorSet_Box .MaskDiv").css("display", "none");
            $("#ColorSet_Ok").attr("disabled", false);
            $("#ColorSet_Ok").stop().removeClass("btn-disable").fadeTo("slow", 1);
			
            if(bIPC){
                $("#ColorSetdefault").attr("disabled", false);
                $("#ColorSetdefault").stop().removeClass("btn-disable").fadeTo("slow", 1);
            }else{
                if(chnIndex < gDevice.loginRsp.VideoInChannel){
                    $("#AnalogBtnBox").find("button").attr("disabled", false);
                    $("#AnalogBtnBox").find("button").stop().removeClass("btn-disable").fadeTo("slow", 1);
                }
            }
        }

        try{
            var Enable1 = VideoColor[VideoColor.Name][0].Enable, Enable2 = VideoColor[VideoColor.Name][1].Enable;
            $("#TimeEnable").prop("checked", Enable1 ? true : false);
            var sect = VideoColor[VideoColor.Name][0].TimeSection.split(" ");
            var tSect = sect[1].split("-");
            var btSect = tSect[0].split(":");
            var etSect = tSect[1].split(":");
            $("#BH").val(btSect[0]);
            $("#BM").val(btSect[1]);
            $("#EH").val(etSect[0]);
            $("#EM").val(etSect[1]);
            var cfg = VideoColor[VideoColor.Name][0].VideoColorParam;
            $("#Brightness_Slider").slider("setValue", cfg.Brightness);			
            $("#Contrast_Slider").slider("setValue", cfg.Contrast);		
            $("#Saturation_Slider").slider("setValue", cfg.Saturation);		
            $("#Hue_Slider").slider("setValue", cfg.Hue);		
            $("#Gain_Slider").slider("setValue", cfg.Gain);	
            $("#Horizontal_Slider").slider("setValue", cfg.Acutance&0x00000000f);
            $("#Vertical_Slider").slider("setValue", (cfg.Acutance&0x000000f00) >> 8);
            $("#TimeEnable2").prop("checked", Enable2 ? true : false);
            var sect = VideoColor[VideoColor.Name][1].TimeSection.split(" ");
            var tSect = sect[1].split("-");
            var btSect = tSect[0].split(":");
            var etSect = tSect[1].split(":");
            if(btSect[0] == "00" && btSect[1] == "00" && etSect[0] == "24" && etSect[1] == "00")
            {
                $("#BH2").val("19");
                $("#BM2").val("00");
                $("#EH2").val("07");
                $("#EM2").val("00");
            }
            else
            {
                $("#BH2").val(btSect[0]);
                $("#BM2").val(btSect[1]);
                $("#EH2").val(etSect[0]);
                $("#EM2").val(etSect[1]);
            }
            cfg = VideoColor[VideoColor.Name][1].VideoColorParam;
            $("#Brightness_Slider2").slider("setValue", cfg.Brightness);			
            $("#Contrast_Slider2").slider("setValue", cfg.Contrast);		
            $("#Saturation_Slider2").slider("setValue", cfg.Saturation);		
            $("#Hue_Slider2").slider("setValue", cfg.Hue);		
            $("#Gain_Slider2").slider("setValue", cfg.Gain);	
            $("#Horizontal_Slider2").slider("setValue", cfg.Acutance&0x00000000f);
            $("#Vertical_Slider2").slider("setValue", (cfg.Acutance&0x000000f00) >> 8);
            var bEnable2 = $("#TimeEnable2").prop("checked");
            $("#TimeSection2 input").prop("disabled", !bEnable2);
            if(bIPC){
                $("#GainDiv, #VerticalDiv").css("display", "none");
                if (!GetFunAbility(gDevice.Ability.OtherFunction.NotSupportAH)){
                    $("#HorizontalDiv").css("display", "none");
                }
                if(nCamera == 100){
                    cfg = CameraCfg[CameraCfg.Name];
                    $("#MirrorCkbox").prop("checked", parseInt(cfg.PictureMirror, 16) ? true : false);
                    $("#RollCkbox").prop("checked", parseInt(cfg.PictureFlip, 16) ? true : false);
                    
                    if(cfg.IRCUTMode == 0){
                        $("#IR_Cut_0").css("display", "none");
                        $("#IR_Cut_1").css("display", "");
                    }else if(cfg.IRCUTMode == 1){
                        $("#IR_Cut_1").css("display", "none");
                        $("#IR_Cut_0").css("display", "");
                    }
                    DivBox(1, "#CameraSet");
                }else{
                    DivBox(0, "#CameraSet");
					if(nCamera == 107)
                    	ShowPaop(pageTitle, lg.get("IDS_NO_POWER"));
                }
            }else{
                var nChannel = $("#ColorChid").val()*1;
                if(nChannel >= nAnaChannel && nChannel < nTotalChannel){
                    $("#IR_Cut_1").css("display", "none");
                    $("#IR_Cut_0").css("display", "");
                    if(nCamera == 100){
                        if(CameraCfg[CameraCfg.Name].IRCUTMode == 0){
                            $("#IR_Cut_0").css("display", "none");
                            $("#IR_Cut_1").css("display", "");
                        }
                    }else if(nCamera == 107){
                        ShowPaop(pageTitle, lg.get("IDS_NO_POWER"));
                    }
                }else if(nChannel >= 0 && nChannel < nAnaChannel){
                    $("#IR_Cut_1").css("display", "none");
                    $("#IR_Cut_0").css("display", "");
                }
            }

            DivBox(0, "#Sect");
            DivBox(Enable2 ? 1 : 0, "#TimeSection2");
            EnableSlider();
        }
        catch (b) {
            VideoColor = null;
            ShowPaop(pageTitle, lg.get("IDS_REFRESH_FAILED"));
        }
    }
    function EnableSlider(){
        var nStatus = 2;
        var nChannel = $("#ColorChid").val()*1;
        if(bGetCamera && CameraCfg[CameraCfg.Name].IRCUTMode == 1 || !bIPC && (nChannel >= 0 && nChannel < nAnaChannel)){
            nStatus = 1;
            var bEnable2 = $("#TimeEnable2").prop("checked");
            if(!bEnable2){
                nStatus = 0;
            }	
        }        
        $("#ColorSet_Box .MaskDiv").css({
            "width": "100%",
            "left": 0
        });
        $("#ColorSet_Box .slider").css({
            "opacity": 1,
        });       
        if(bOnvifChannel[chnIndex]){
            $("#IR_Cut_0, #IR_Cut_1").css("display", "none");
            $("#HueDiv, #GainDiv, #VerticalDiv").find(".MaskDiv").css("display", "block");
            $("#HueDiv, #GainDiv, #VerticalDiv").find(".slider").fadeTo("slow", 0.6);
            $("#BrightnessDiv, #ContrastDiv, #SaturationDiv, #HorizontalDiv").find(".MaskDiv")
            .css({
                "display": "block",
                "width": "50%",
                "left": "165px"
            });
            $("#BrightnessDiv, #ContrastDiv, #SaturationDiv, #HorizontalDiv").find(".second").fadeTo("slow", 0.6);
            return;
        }
        if(nStatus == 0){
            $("#BrightnessDiv, #ContrastDiv, #SaturationDiv, #HorizontalDiv, #HueDiv, #GainDiv, #VerticalDiv").find(".MaskDiv")
            .css({
                "display": "block",
                "width": "50%",
                "left": "165px"
            });
            $("#BrightnessDiv, #ContrastDiv, #SaturationDiv, #HorizontalDiv, #HueDiv, #GainDiv, #VerticalDiv").find(".second").fadeTo("slow", 0.6);
        }
    }
    function SaveColorToDev(){
        if(!isObject(VideoColor)){
            return;
        }
        RfParamCall(function(a, b){
            oldVideoColor = cloneObj(VideoColor);
            if(bIPC && bGetCamera){
                cfg = CameraCfg[CameraCfg.Name];
                cfg.PictureMirror = '0x' + toHex($("#MirrorCkbox").prop("checked") * 1, 8);
                cfg.PictureFlip = '0x' + toHex($("#RollCkbox").prop("checked") * 1, 8);
                RfParamCall(function(a, b){
                    if (a.Ret == 603 ){
                        RebootDev(pageTitle, lg.get("IDS_CONFIRM_RESTART"), true);
                    }else{
                        ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
                    }
                }, pageTitle, "Camera.Param", 0, WSMsgID.WsMsgID_CONFIG_SET, CameraCfg);
            }else{
                ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
            }
        }, pageTitle, "AVEnc.VideoColor",  $("#ColorChid").val()*1, WSMsgID.WsMsgID_CONFIG_SET, VideoColor);
    }
    function SetColor(){
        if(!isObject(VideoColor)){
            return;
        }
        WndToObject();
        RfParamCall(function(a, b){
            oldVideoColor = cloneObj(VideoColor);
        }, pageTitle, "AVEnc.VideoColor",  $("#ColorChid").val()*1, WSMsgID.WsMsgID_CONFIG_SET, VideoColor,true);
    }
    function LoadConfig(callback) {
        MasklayerShow();
        RfParamCall(function(a){
            if(a.Ret==100){
                VideoColor = a;
                if(bIPC){
                    RfParamCall(function(b){
                        if(b.Ret == 100){
                            CameraCfg = b;
                        }
                        FillData(a.Ret, b.Ret);
                        callback(a.Ret);
                    }, pageTitle, "Camera.Param", 0, WSMsgID.WsMsgID_CONFIG_GET, null,true);
                }else{
                    var nChannel = $("#ColorChid").val()*1;
                    if(nChannel >= nAnaChannel && nChannel < nTotalChannel){
                        RfParamCall(function(b){
                            if(b.Ret == 100){
                                CameraCfg = b;
                            }
                            FillData(a.Ret, b.Ret);
                            callback(a.Ret);
                        }, pageTitle, "Camera.Param", $("#ColorChid").val()*1, WSMsgID.WsMsgID_CONFIG_GET, null,true);
                    }else{
                        FillData(a.Ret);
                        callback(a.Ret);
                    }
                }
            }else{
                FillData(-1);
                callback(a.Ret);
            }
        }, pageTitle, "AVEnc.VideoColor", $("#ColorChid").val()*1, WSMsgID.WsMsgID_CONFIG_GET, null,true);
	}
    function WndToObject(){
        if(!isObject(VideoColor)){
            return;
        }
        VideoColor[VideoColor.Name][0].Enable = $("#TimeEnable").prop("checked") ? 1 : 0;
        VideoColor[VideoColor.Name][1].Enable = $("#TimeEnable2").prop("checked") ? 1 : 0;
        
        var ts = "0 ";
        ts += GetTimeVal($("#BH2")) + ":" + GetTimeVal($("#BM2")) + ":00-";
        ts += GetTimeVal($("#EH2")) + ":" + GetTimeVal($("#EM2")) + ":00";
        VideoColor[VideoColor.Name][1].TimeSection = ts;
        
        var EndT = [$("#BH2").val() * 1, $("#BM2").val() * 1, $("#EH2").val() * 1, $("#EM2").val() * 1];
        if((!$("#TimeEnable2").prop("checked")) || (EndT[0] == 0 && EndT[1] == 0 && EndT[2] == 0 && EndT[3] == 0)){
            $("#BH").val("00");
            $("#BM").val("00");
            $("#EH").val("24");
            $("#EM").val("00");
            
            $("#BH2").val("00");
            $("#BM2").val("00");
            $("#EH2").val("00");
            $("#EM2").val("00");
            if(!bIPC){
                $("#BH2").val("19");
                $("#EH2").val("07");
            }
        }else{
            if($("#EH2").val() * 1 != 24){
                $("#BH").val(GetTimeVal($("#EH2")));
            }else{
                $("#BH").val("00");
            }
            if($("#BH2").val() * 1 != 0){
                $("#EH").val(GetTimeVal($("#BH2")));
            }else{
                $("#EH").val("00");
            }
            
            $("#BM").val(GetTimeVal($("#EM2")));
            $("#EM").val(GetTimeVal($("#BM2")));
        }
        
        ts = "0 ";
        ts += GetTimeVal($("#BH")) + ":" + GetTimeVal($("#BM")) + ":00-";
        ts += GetTimeVal($("#EH")) + ":" + GetTimeVal($("#EM")) + ":00";
        VideoColor[VideoColor.Name][0].TimeSection = ts;
            
        var cfg = VideoColor[VideoColor.Name][0].VideoColorParam;
        cfg.Brightness = $("#Brightness_Slider").slider("getValue") * 1;		
        cfg.Contrast = $("#Contrast_Slider").slider("getValue") * 1;		
        cfg.Saturation = $("#Saturation_Slider").slider("getValue") * 1;	
        cfg.Hue = $("#Hue_Slider").slider("getValue") * 1;	
        cfg.Gain = $("#Gain_Slider").slider("getValue") * 1;
        var Horizontal_Acutance1= $("#Horizontal_Slider").slider("getValue") * 1;
        var Vertical_Acutance1=($("#Vertical_Slider").slider("getValue") * 1 )<< 8;
        cfg.Acutance=0;
        cfg.Acutance |= Horizontal_Acutance1;
        cfg.Acutance |=Vertical_Acutance1;

        cfg = VideoColor[VideoColor.Name][1].VideoColorParam;
        cfg.Brightness = $("#Brightness_Slider2").slider("getValue") * 1;			
        cfg.Contrast = $("#Contrast_Slider2").slider("getValue") * 1;
        cfg.Saturation = $("#Saturation_Slider2").slider("getValue") * 1;
        cfg.Hue = $("#Hue_Slider2").slider("getValue") * 1;		
        cfg.Gain = $("#Gain_Slider2").slider("getValue") * 1;
        var Horizontal_Acutance2= $("#Horizontal_Slider2").slider("getValue") * 1;
        var Vertical_Acutance2=($("#Vertical_Slider2").slider("getValue") * 1 )<< 8;
        cfg.Acutance=0;
        cfg.Acutance |= Horizontal_Acutance2;
        cfg.Acutance |=Vertical_Acutance2;
    }
    
    function CheckEnable2(){
        var bEnable2 = $("#TimeEnable2").prop("checked");
        var EndT = [$("#BH2").val() * 1, $("#BM2").val() * 1, $("#EH2").val() * 1, $("#EM2").val() * 1];
        if(!bEnable2 || (EndT[0] == 0 && EndT[1] == 0 && EndT[2] == 0 && EndT[3] == 0)){
            $("#BH").val("00");
            $("#BM").val("00");
            $("#EH").val("24");
            $("#EM").val("00");
        }else{
            if($("#EH2").val() * 1 != 24){
                $("#BH").val(GetTimeVal($("#EH2")));
            }else{
                $("#BH").val("00");;
            }
            if($("#BH2").val() * 1 != 0){
                $("#EH").val(GetTimeVal($("#BH2")));
            }else{
                $("#EH").val("00");
            }
            $("#BM").val(GetTimeVal($("#EM2")));
            $("#EM").val(GetTimeVal($("#BM2")));
            if(24 == $("#EH").val() * 1){
                $("#EM").val("00");
            }
        }
        
        $("#TimeSection2 input").prop("disabled", !bEnable2);
        DivBox(bEnable2 ? 1 : 0,"#TimeSection2");
        $("#ColorSet_Box .MaskDiv").css({
            "display": "none",
            "width": "100%",
            "left": 0
        });
        $("#ColorSet_Box .slider").css({
            "opacity": 1,
        });
        if(!bEnable2){
            $("#BrightnessDiv, #ContrastDiv, #SaturationDiv, #HorizontalDiv, #HueDiv, #GainDiv, #VerticalDiv").find(".MaskDiv")
            .css({
                "display": "block",
                "width": "50%",
                "left": "165px"
            });
            $("#BrightnessDiv, #ContrastDiv, #SaturationDiv, #HorizontalDiv, #HueDiv, #GainDiv, #VerticalDiv").find(".second").fadeTo("slow", 0.6);
        }
    }
    function SetVideoColorParam(nType){
//      nType 0: default  1:Cold   2: Warm
        var ColorValue = [
            [50, 50, 50, 50, 0, 8, 15],
            [50, 50, 50, 50, 0, 8, 15]
        ];
        if(nType == 1){
            var ColorValue = [
                [75, 50, 50, 50, 0, 0, 0],
                [75, 50, 50, 50, 0, 0, 0]
            ];
        }else if(nType == 2){
            var ColorValue = [
                [35, 50, 50, 50, 0, 0, 0],
                [35, 50, 50, 50, 0, 0, 0]
            ];
        }
        
        $("#Brightness_Slider").slider("setValue", ColorValue[0][0]);
        $("#Contrast_Slider").slider("setValue", ColorValue[0][1]);
        $("#Saturation_Slider").slider("setValue", ColorValue[0][2]);
        $("#Hue_Slider").slider("setValue", ColorValue[0][3]);
        $("#Gain_Slider").slider("setValue", ColorValue[0][4]);
        $("#Horizontal_Slider").slider("setValue", ColorValue[0][5]);
        $("#Vertical_Slider").slider("setValue", ColorValue[0][6]);
        var bEnable2 = $("#TimeEnable2").prop("checked");
        if(bEnable2){
            $("#Brightness_Slider2").slider("setValue", ColorValue[1][0]);
            $("#Contrast_Slider2").slider("setValue", ColorValue[1][1]);
            $("#Saturation_Slider2").slider("setValue", ColorValue[1][2]);
            $("#Hue_Slider2").slider("setValue", ColorValue[1][3]);
            $("#Gain_Slider2").slider("setValue", ColorValue[1][4]);
            $("#Horizontal_Slider2").slider("setValue", ColorValue[1][5]);
            $("#Vertical_Slider2").slider("setValue", ColorValue[1][6]);
        }
        WndToObject();
        SaveColorToDev();
    }
    function SaveCopyColorCfg(nIndex){
        if(nIndex < copyCh.length){
            var cfgData = {
                "Name": "AVEnc.VideoColor.[" + copyCh[nIndex] + "]"
            };
            cfgData[cfgData.Name] = cloneObj(VideoColor[VideoColor.Name]);
            RfParamCall(function (data){
                SaveCopyColorCfg(nIndex + 1);
            }, pageTitle, cfgData.Name, -1, WSMsgID.WsMsgID_CONFIG_SET, cfgData);
        }else{
            ShowPaop(pageTitle, lg.get("IDS_COPY_SUC"));
        }
    }
	
    $(function(){
        var oldChannel = 0;
        $("#ColorChid").change(function(){
            var nChannelNum = $(this).val() * 1;
            if(oldChannel != nChannelNum){
                oldChannel = nChannelNum;
                chnIndex = nChannelNum;
                LoadConfig(function(a){
                    if(a == 100){
                        gDevice.ColorSetPreviewPlay(nChannelNum,1,function(a){
                            MasklayerHide();
                        });
                    }else{
                        if(a == 107){
                            ShowPaop(pageTitle, lg.get("IDS_NO_POWER"));
                        }else{
                            ShowPaop(pageTitle, lg.get("IDS_REFRESH_FAILED"));
                        }                     
                        gDevice.ColorSetPreviewStop(function(){
							MasklayerHide();
						});
                    }
                });
            }
        });
        if(gDevice.loginRsp.VideoInChannel > 0 && !bIPC){
            $("#CopyChanDiv").divBox({
                number: gDevice.loginRsp.VideoInChannel,
                bkColor: gVar.skin_mColor,
                borderColor: gVar.skin_bColor,
                ExType: true,
                parentLev: 1,
                activeTextClr: "#FFFFFF",
                bDownID:"CopyChanDiv"
            });
            $("#CopyChanDiv > div").click(function(){
                var bAll = true;
                $("#CopyChanDiv > div").each(function(t) {
                    if ($(this).css("background-color").replace(/\s/g, "") != gVar.skin_mColor.replace(/\s/g, "")) {
                        bAll = false;
                    }
                    $("#colorck").prop("checked", bAll);
                });
            });
        }
        var nTmpWidth = 120;
        $("#Brightness_Slider").slider({width: nTmpWidth, minValue: 0, maxValue: 100});
        $("#Brightness_Slider2").slider({width: nTmpWidth, minValue: 0, maxValue: 100});		
        $("#Contrast_Slider").slider({width: nTmpWidth, minValue: 0, maxValue: 100});
        $("#Contrast_Slider2").slider({width: nTmpWidth, minValue: 0, maxValue: 100});	
        $("#Saturation_Slider").slider({width: nTmpWidth, minValue: 0, maxValue: 100});
        $("#Saturation_Slider2").slider({width: nTmpWidth, minValue: 0, maxValue: 100});
        $("#Hue_Slider").slider({width: nTmpWidth, minValue: 0, maxValue: 100});
        $("#Hue_Slider2").slider({width: nTmpWidth, minValue: 0, maxValue: 100});
        $("#Gain_Slider").slider({width: nTmpWidth, minValue: 0, maxValue: 100});
        $("#Gain_Slider2").slider({width: nTmpWidth, minValue: 0, maxValue: 100});
        $("#Horizontal_Slider").slider({width: nTmpWidth, minValue: 0, maxValue: 15});
        $("#Horizontal_Slider2").slider({width: nTmpWidth, minValue: 0, maxValue: 15});
        $("#Vertical_Slider").slider({width: nTmpWidth, minValue: 0, maxValue: 15});
        $("#Vertical_Slider2").slider({width: nTmpWidth, minValue: 0, maxValue: 15});
        $("#TimeSection2 input").unbind();
        $("#TimeSection2 input").keyup(function(){
            var tmp = $(this).val().replace(/\D/g,'');
            $(this).val(tmp);
            var nWitch;
            var b = $("#TimeSection2 input");	
            for(var i = 0; i < 4; i++){
                if(b.eq(i).prop("id") == $(this).prop("id")){
                    nWitch = i;
                    break;
                }
            }
            
            var timeArr = [b.eq(0).val() * 1, b.eq(1).val() * 1,
                            b.eq(2).val() * 1, b.eq(3).val() * 1];		
            if (0 == nWitch || 2 == nWitch){
                if (timeArr[nWitch] >= 24){
                    timeArr[nWitch] = 0;
                    if(nWitch == 0){
                        timeArr[nWitch+1] = 0;
                    }
                }
            }else{
                var iEh2 = timeArr[nWitch - 1];
                if (iEh2 != 24 && timeArr[nWitch] > 59){
                    timeArr[nWitch] = 59;
                }

                 if(timeArr[0] == timeArr[2] && timeArr[1] == timeArr[3]){
                     timeArr[3] += 1;
                     if(timeArr[3] == 60){
                         timeArr[3] = 0;
                         timeArr[2] = (timeArr[2] + 1) % 24;
                     }
                 }
            }

            for(i = 0; i < 4; i++){
                if(i != nWitch){
                    b.eq(i).val(timeArr[i] < 10 ? '0' + timeArr[i] : timeArr[i]);
                }else{					
                    if (tmp != ''){
                        b.eq(i).val(timeArr[i]);
                    }
                }
            }
        });
        $("#TimeSection2 input").blur(function (){
            var i;
            var nWitch;	
            var b = $("#TimeSection2 input");	
            for(i = 0; i < 4; i++){
                if(b.eq(i).prop("id") == $(this).prop("id")){
                    nWitch = i;
                    break;
                }
            }
            
            var timeArr = [b.eq(0).val() * 1, b.eq(1).val() * 1,
                            b.eq(2).val() * 1, b.eq(3).val() * 1];		
            if (0 == nWitch || 2 == nWitch){
                if (timeArr[nWitch] < 0){
                    timeArr[nWitch] = 0;
                }
                if (timeArr[nWitch] > 24){
                    timeArr[nWitch] = 24;
                }
            }else{
                var iEh2 = timeArr[nWitch - 1];
                if (timeArr[nWitch] < 0){
                    timeArr[nWitch] = 0;
                }
                if (iEh2 != 24 && timeArr[nWitch] > 59){
                    timeArr[nWitch] = 59;
                }
                if(iEh2 == 24){
                    timeArr[nWitch] = 0;
                }
            }
    
            for(i = 0; i < 4; i++){
                b.eq(i).val(timeArr[i] < 10 ? '0' + timeArr[i] : timeArr[i]);
            }
            
            CheckEnable2();
        });
        $("#TimeEnable2").unbind().click(function(){
            CheckEnable2();
        });
        $("#ColorSetdefault").unbind().click(function(){
            $("#Brightness_Slider").slider("setValue", 50);			
            $("#Contrast_Slider").slider("setValue", 50);		
            $("#Saturation_Slider").slider("setValue", 50);		
            $("#Hue_Slider").slider("setValue", 50);		
            $("#Gain_Slider").slider("setValue", 0);	
            $("#Horizontal_Slider").slider("setValue", 8);
            $("#Vertical_Slider").slider("setValue", 15);
    
            $("#Brightness_Slider2").slider("setValue", 50);			
            $("#Contrast_Slider2").slider("setValue", 50);		
            $("#Saturation_Slider2").slider("setValue", 50);		
            $("#Hue_Slider2").slider("setValue", 50);		
            $("#Gain_Slider2").slider("setValue", 0);	
            $("#Horizontal_Slider2").slider("setValue", 8);
            $("#Vertical_Slider2").slider("setValue", 15);
            
            if(bIPC){
                cfg = CameraCfg[CameraCfg.Name];
                $("#MirrorCkbox").prop("checked", false);
                $("#RollCkbox").prop("checked", false);
            }
            WndToObject();
            SaveColorToDev();
        });
        $("#AnalogBtnBox > button[id!= 'CopySet']").unbind().click(function(){
            var id = $(this).prop("id");
            var nType = 0;
            if(id == "ColdColorSet"){
                nType = 1;
            }else if(id == "WarmColorSet"){
                nType = 2;
            }
            SetVideoColorParam(nType);
        });
        $("#ColorSet_Ok").unbind().click(function(){
            WndToObject();
            SaveColorToDev();
        });
        $("#ColorSet_Refresh").unbind().click(function(){
            LoadConfig(function(a){
                MasklayerHide();
                if(a == 107){
                    ShowPaop(pageTitle, lg.get("IDS_NO_POWER"));
                }else if(a != 100){
                    if(a == WEB_ERROR.ERR_RUNNING){
                        ShowPaop(pageTitle, lg.get("IDS_WAIT_TIP"));
                    }else{
                        ShowPaop(pageTitle, lg.get("IDS_REFRESH_FAILED"));
                    }
                }
            });
        });
        $("#CopySet").unbind().click(function(){
            $("#colorck").prop("checked", false);
            if ($("#colorCopyTD").css("display") != "none") {
                $("#colorCopyTD").css("display", "none");
            } else {
                $("#colorCopyTD").css("display", "block");
                $("#CopyChanDiv > div").css({
                    "background-color": "transparent",
                    color: "inherit"
                });
            }
        });
        $("#colorck").click(function () {
            $("#CopyChanDiv > div").each(function (i) {
                var bCheckd = $("#colorck").prop("checked");
                if(bCheckd){
                    $(this).css({
                        "background-color": gVar.skin_mColor,
                        color: "#FFFFFF"
                    });
                }else{
                    $(this).css({
                        "background-color": "transparent",
                        color: "inherit"
                    });
                }
            });
        });
        $("#colorOk").click(function () {
            $("#colorCopyTD").css("display", "none");
            WndToObject();
            copyCh = [];
            $("#CopyChanDiv > div").each(function(i) {
                var bCheckd = ($(this).css("background-color").replace(/\s/g, "") == gVar.skin_mColor.replace(/\s/g, "") && $(this).css("display") != "none") ? 1 : 0;
                if (bCheckd) {
                    if(i === chnIndex) return true;
                    DebugStringEvent(i);
                    copyCh.push(i);
                }
            });         
            if(copyCh.length > 0){
                SaveCopyColorCfg(0);
            }
        });
        $(".cfg_container").unbind().scroll(function(event){
            $("#colorsetOcx").css("top",$(".cfg_container")[0].scrollTop+20);
        });
        function initColorSet(){
            bOnvifChannel = [];
            var chnArry = [];
            $("#ColorChid").empty();
            var dataHtml = '';
            for (var j = 0; j < nAnaChannel; j++) {
                dataHtml += '<option value="' + j + '">' + gDevice.getChannelName(j) + '</option>';
                chnArry.push(j);
                bOnvifChannel[j] = false;
            }
            if(nAnaChannel > 0 && chnIndex == -1){
                chnIndex = 0;
            }
            $("#ColorChid").append(dataHtml);
            if(nDigChannel > 0 && !bIPC){
                var ssDigitChStatus;
                var ssRemoteDevice;
                function AddDigitChannels(){
                    for (var i = nAnaChannel; i < gDevice.loginRsp.ChannelNum; i++) {
                        bOnvifChannel[i] = false;
						var m = i - nAnaChannel;
						if (ssDigitChStatus[m].Status != "Connected") {
							continue;
						}
                        var nIndex = ssRemoteDevice[m].SingleConnId - 1;//配置的第几个
                        if (ssRemoteDevice[m].ConnType == "SINGLE" && nIndex >= 0 && (ssRemoteDevice[m].Decoder[nIndex].Protocol == "TCP"
                            || ssRemoteDevice[m].Decoder[nIndex].Protocol == "ONVIF"))
                        {
                            if(ssRemoteDevice[m].Decoder[nIndex].Protocol == "ONVIF"){
                                bOnvifChannel[i] = true;
                            }
                            var dataHtml = '<option value="' + i + '">' + gDevice.getChannelName(i) + '</option>';
                            $("#ColorChid").append(dataHtml);
                            if(chnIndex == -1){
                                chnIndex = i;
                            }
							chnArry.push(i);
                        }					
					}
                    if(chnArry.length > 0){
						if($.inArray(chnIndex, chnArry) < 0){
							chnIndex = chnArry[0];
						}
                        $("#ColorChid").val(chnIndex);
                        LoadConfig(function(a){
                            if(a == 100){
                                gDevice.ColorSetPreviewPlay(chnIndex,1,function(a){
                                    MasklayerHide();
                                });
                            }else{
                                if(a == 107){
                                    ShowPaop(pageTitle, lg.get("IDS_NO_POWER"));
                                }else{
                                    ShowPaop(pageTitle, lg.get("IDS_REFRESH_FAILED"));
                                }                     
                                gDevice.ColorSetPreviewStop(function(){
                                    MasklayerHide();
                                });
                            }
                        });
                    }else{
                        $(".cfg_container").css("visibility", "hidden");
                        gDevice.HidePlugin(true,function(){
                            MasklayerHide();
                            ShowPaop(pageTitle, lg.get("IDS_CHSTA_NoConfig"));
                        });
                    }
                }
                RfParamCall(function(a){
                    ssDigitChStatus = a[a.Name];
                    RfParamCall(function(b){
                        ssRemoteDevice = b[b.Name];
                        AddDigitChannels();
                    }, pageTitle, "NetWork.RemoteDeviceV3", -1, WSMsgID.WsMsgID_CONFIG_GET);
                }, pageTitle, "NetWork.ChnStatus", -1, WSMsgID.WsMsgID_CONFIG_GET);
            }else{
                $("#ColorChid").val(chnIndex);
                LoadConfig(function(a){
                    if(a == 100){
                        gDevice.ColorSetPreviewPlay(chnIndex,1,function(a){
                            MasklayerHide();
                        });
                    }
                    else
                    {
                        if(a == 107){
                            ShowPaop(pageTitle, lg.get("IDS_NO_POWER"));
                        }else{
                            ShowPaop(pageTitle, lg.get("IDS_REFRESH_FAILED"));
                        }                     
                        gDevice.ColorSetPreviewStop(function(){
                            MasklayerHide();
                        });
                    }
                });
            }
        }
        initColorSetEvent = initColorSet;
        initColorSet();
	});
    
});