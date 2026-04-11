//# sourceURL=live.js
$(function() {
	var m_bMouseDown = false;
	var m_bBroadcast = false;
	var m_bDeviceTalk = false;
	var m_bChannelTalk = false;
	var m_bTalkPageCfgLoading = false;
	var m_nTalkChannel = -1;
	var m_AudioCfg;
	var m_MultiLens= -1;
	var m_PTZElect = false;
	var pageTitle = $("#liveBtn").text();
	var WndStatus = {"bDigitalZoom":false,"bAudio":false,"nRageState":0};
	var AllWndStatus = [];
	var preHumanAT = [];
	var preHumanCF = [];
	var bIPC = gDevice.devType == devTypeEnum.DEV_IPC ? true : false;
	var talkTitle = "";
	talkTitle = lg.get("AudioInFormat");
	for(var i = 0; i < gDevice.loginRsp.ChannelNum;i++){
		AllWndStatus[i] = WndStatus;
	}
	var bFullChannelPlay = false;
	var nCurFullChannelPlayStream = -1;
	$("#menuMask").css("display","none");
	if(GetFunAbility(gDevice.Ability.OtherFunction.SupportCoaxialParamCtrl)){
		$("#MenuBtn").css("display", "");
	}
	if(gDevice.loginRsp.ChannelNum == 1){
		$("#wndModeTabBtn").css("display", "none");
	}
	if(!WebCms.plugin.isLoaded){
		$("#wndModeTabBtn").css("display", "none");
		$("#FullChnPreviewTabBtn").css("display", "none");
		if(gDevice.devType != devTypeEnum.DEV_IPC ){
			$("#TalkBtn").css("display", "none");
		}else{
			$(".DeviceTalk_Box").css("display", "none");
		}
		$("#FullChannelRecord").css("display", "none");
		$(".SystemStatus_Box").css("display", "none");
	}
	function ShowVersionInfo(a){
		if(a.bNew){
			ShowPaop(lg.get("IDS_CECK_VERSION"),lg.get("IDS_NEW_VERSION"));
			gVar.bNewVersion = a.bNew;
			gVar.newVersion = a.newVersion;
		}
	}
	if (GetFunAbility(gDevice.Ability.OtherFunction.MultiLensTwoSensor)) {
		m_MultiLens = 2;
	} else if (GetFunAbility(gDevice.Ability.OtherFunction.MultiLensThreeSensor)) {
		m_MultiLens = 3;
	} else {
		m_MultiLens = 1;
	}
	function GetFlipMirror(nChannel,callback){
		var name;
		if(nChannel == -1){
			name = { "Name": "Uart.PTZControlCmd" };
		}else{
			name = { "Name": "Uart.PTZControlCmd.[" + nChannel + "]" };
		}
		gDevice.GetMsg(WSMsgID.WsMsgID_CONFIG_GET, name, callback);
	}
	function createChannelList(b) {
		var d = "";
		for (var c = 0; c < b; c++) {
			d += "<div class='channelRow' id='channelRow_" + c + "'>";
			d += "<div class='chnBtn recordBtn' id='chnRecord_" + c + "' title='" + lg.get("IDS_LIVE_Record") + "' name=''></div>";
			d += "<div class='chnBtn extraPlayBtn' id='chnExtraPlay_" + c + "' title='" + lg.get("IDS_SUBSTREAM") + "' name=''></div>";
			if(WebCms.plugin.isLoaded){
				d += "<div class='chnBtn mainPlayBtn' id='chnMainPlay_" + c + "' title='" + lg.get("IDS_MAINSTREAM") + "' name=''></div>";
			}else{
				d += "<div class='chnBtn mainPlayBtn' id='chnMainPlay_" + c + "' title='" + lg.get("IDS_MAINSTREAM") + "' name=''" +"style='display:none'></div>";
			}
			d += "<div class='channelNum' id='chnNameBtn_" + c + "'>" + gDevice.getChannelName(c) + "</div>";
			d += "</div>"
		}
		$("#channelList").append(d);
		d = null;
	}
	function liveSetTipText() {
		$("#fullScreen").attr("title", lg.get("IDS_LIVE_ViewFull"));
		$("#localCapture").attr("title", lg.get("IDS_LocalCapture"));
		$("#digitalZoom").attr("title", lg.get("IDS_LIVE_DigitalZoom"));
		$("#audio").attr("title", lg.get("IDS_LIVE_Audio"));
		$("#GoPreset").attr("title", lg.get("IDS_LIVE_Goto"));
		$("#AddPreset").attr("title", lg.get("IDS_LIVE_AddPreset"));
		$("#DelPreset").attr("title", lg.get("IDS_LIVE_DelPreset"));
		$("#startTour").attr("title", lg.get("IDS_LIVE_StartTour"));
		$("#stopTour").attr("title", lg.get("IDS_LIVE_StopTour"));
		$("#editTour").attr("title", lg.get("IDS_LIVE_EditTour"));
		$("#FullChannelPreview").attr("title", lg.get("IDS_LIVE_FullChannelPreview"));
		$("#FullChannelRecord").attr("title", lg.get("IDS_LIVE_FullChannelRecord"));
		$("#PlayOriginal").attr("title", lg.get("IDS_LIVE_PlayOriginal"));
		$("#PlayCoverWnd").attr("title", lg.get("IDS_LIVE_PlayCoverWnd"));
		$("#DelElePrePtBtn").attr("title", lg.get("IDS_LIVE_DelPreset"));
		$("#AddElePrePtBtn").attr("title", lg.get("IDS_LIVE_AddPreset"));
		$("#GoElePrePtBtn").attr("title", lg.get("IDS_LIVE_Goto"));
		$("#ElectZoomIn").html(lg.get("IDS_LIVE_ElectZoom"));
		$("#ElectZoomOut").html(lg.get("IDS_LIVE_ElectEnlarge"));
		$("#ElectRedu").html(lg.get("IDS_LIVE_ElectRedu"));
		$("#CruiseInput").attr("title", lg.get("IDS_LIVE_Unchangeable"));
		$("#PlayRatio").attr("title", lg.get("IDS_Video_Proportion"));
		$("#PlayRatio_4_3").attr("title", "4:3");
		$("#PlayRatio_16_9").attr("title", "16:9");
		BrightnessIcon.innerHTML =  lg.get("IDS_LIVE_Brightness");
		ContrastIcon.innerHTML= lg.get("IDS_LIVE_Contrast");
		SaturationIcon.innerHTML = lg.get("IDS_LIVE_Saturation");
		HueIcon.innerHTML=lg.get("IDS_LIVE_Hue");
		MicphoneVolumnL.innerHTML=lg.get("IDS_MICPHONE_VOLUMN");
		HornVolumnL.innerHTML=lg.get("IDS_HORN_VOLUMN");
	}
	function ShowSpeedNum(value){
		$("#speedNum").text(value);
	}
	function SetBrightness(value){
		gDevice.SetColor(ColorType.ColorBrightness, value,function(a){});
	}
	function SetContrast(value){
		gDevice.SetColor(ColorType.ColorContrast, value,function(a){});
	}
	function SetSaturation(value){
		gDevice.SetColor(ColorType.ColorSaturation, value,function(a){});
	}
	function SetHue(value){
		gDevice.SetColor(ColorType.ColorHue, value,function(a){});
	}
	function SetHormVolumn(){
		var value = $("#HornVolumnSlider").slider("getValue") * 1;	
		var cmd = {
			"Name": "fVideo.Volume",
			"fVideo.Volume": [{
				"AudioMode": "Single",
				"LeftVolume": value,
				"RightVolume": value
			}]
		};
		RfParamCall(function(a){
			if(a.Ret==100){
				DebugStringEvent("SetHormVolumn suc");
			}
		}, pageTitle, "fVideo.Volume", -1, WSMsgID.WsMsgID_CONFIG_SET, cmd,true);
	}
	function SetMicphoneVolumn(){
		var value = $("#MicphoneVolumnSlider").slider("getValue") * 1;	
		var cmd = {
			"Name": "fVideo.VolumeIn",
			"fVideo.VolumeIn": [{
				"AudioMode": "Single",
				"LeftVolume": value,
				"RightVolume": value
			}]
		};
		RfParamCall(function(a){
			if(a.Ret==100){
				DebugStringEvent("SetMicphoneVolumn suc");
			}
		}, pageTitle, "fVideo.VolumeIn", -1, WSMsgID.WsMsgID_CONFIG_SET, cmd,true);
	}
	function GetCorridorMode(){
		if (GetFunAbility(gDevice.Ability.OtherFunction.SupportCorridorMode) && gDevice.devType == devTypeEnum.DEV_IPC) {
			RfParamCall(function(a){
				if (a.Ret == 100) {
					b = a[a.Name][0];
					if (b.CorridorMode == 1 || b.CorridorMode == 2 || b.CorridorMode == 3) {
						gDevice.PlayOriginal(ProportionAdjustmentCallBack);
					}
				}
				MasklayerHide();
			}, pageTitle, "Camera.ParamEx", -1, WSMsgID.WsMsgID_CONFIG_GET);
		} else {
			MasklayerHide();
		}
	}
	function CheckFlipMirrorAfterPreview(callback){
		if(gVar.CurChannel!=-1){
			GetFlipMirror(gVar.CurChannel, function (o) {
				if (o.Ret != 100) {
					if (gDevice.devType != devTypeEnum.DEV_IPC) {
						$("#FlipMirrorSet").css("display", "none");
					}
				} else {
					$("#FlipMirrorSet").css("display", "");
					var cfg = o[o.Name][0];
					$("#Mirror").prop("checked", cfg && cfg.MirrorOperation);
					$("#Flip").prop("checked", cfg && cfg.FlipOperation);
				}
				callback();
			});
		}else{
			if (gDevice.devType != devTypeEnum.DEV_IPC) {
				$("#FlipMirrorSet").css("display", "none");
			}
			callback();
		}
	}
	function PreviewPlayCallback(a){
		$("#chnRecord_" + a.Chn).attr("name", "");
		$("#chnMainPlay_" + a.Chn).attr("name", "");
		$("#chnExtraPlay_" + a.Chn).attr("name", "");
		if(a.Ret == WEB_ERROR.ERR_SUCESS){
			if(a.oldChn >= 0 ){
				$("#chnMainPlay_" + a.oldChn).attr("name", "");
				$("#chnExtraPlay_" + a.oldChn).attr("name", "");
				$("#chnRecord_" + a.oldChn).attr("name", "");
			}
			if (a.Stream == 0) {
				gVar.CurChannel = a.Chn;
				$("#chnMainPlay_" + a.Chn).attr("name", "active");
			}else if(a.Stream == 1) {
				gVar.CurChannel = a.Chn;
				$("#chnExtraPlay_" + a.Chn).attr("name", "active");
			}else{
				gVar.CurChannel = -1;
			}
			GetCorridorMode();
		}else{
			if(a.Ret == 120){
				ShowPaop(pageTitle, lg.get("IDS_PREVIEW_UNENABLE"));
			}else if(a.Ret == 107){
				ShowPaop(pageTitle, lg.get("IDS_NO_POWER"));
			}else{
				ShowPaop(pageTitle, lg.get("IDS_PREVIEW_FAIL"));
			}
			if (a.oldChn >= 0) {
				$("#chnMainPlay_" + a.oldChn).attr("name", "");
				$("#chnExtraPlay_" + a.oldChn).attr("name", "");
				$("#chnRecord_" + a.oldChn).attr("name", "");
			}
		}
		$("#FlipMirrorSet").css("display", "");
		MasklayerHide();
		CheckFlipMirrorAfterPreview(function(){
			gDevice.runAutoCheckWnd();
		});
		
	}
	function FullChannelPreviewPlayStartCallback(a) {
		bFullChannelPlay = true;
		CheckFlipMirrorAfterPreview(function(){
			GetCorridorMode();
		});
	}
	function FullChannelPreviewPlayStopCallback(a){
		MasklayerHide();	
		bFullChannelPlay = false;
		if (gDevice.devType != devTypeEnum.DEV_IPC) {
			$("#FlipMirrorSet").css("display", "none");
		}
	}
	function LocalRecordCallback(a){
		if(a.Ret == WEB_ERROR.ERR_SUCESS){
			if (a.Record) {
				$("#chnRecord_" + a.Chn).attr("name", "active");
			}else{
				$("#chnRecord_" + a.Chn).attr("name", "");
				if(WebCms.plugin.isLoaded){
					var chnName = $("#chnNameBtn_" + a.Chn).text();
					var str = chnName + " " + lg.get("IDS_RECORD_SUCCESS") + a.RecPath;
					ShowPaop(pageTitle, str);
				}
			}
		}
	}
	function FullChannelRecordStartCallback(a){
		MasklayerHide();	
	}

	function FullChannelRecordStopCallback(a){
		gDevice.LoadClientConfig(51, function(a){
			if (a.Ret == 100) {
				var str = lg.get("IDS_RECORD_SUCCESS") + a.RecPath;
				ShowPaop(pageTitle, str);
			}else if(a.Ret == 101){
				var str = lg.get("IDS_RECORD_SUCCESS") + lg.get("IDS_CLIENT_Browse_Failed");
				ShowPaop(pageTitle, str);
				MasklayerHide();
			}
		});
	}
	function ProportionAdjustmentCallBack(a){
		if(a.Ret == 100){
			$(".RatioBtn").attr("name", "");
			if(a.SubMsg == 12){
				$("#PlayRatio").css("background-position", "0px -196px");
				$("#PlayOriginal").attr("name", "active");
			}else if(a.SubMsg == 13){
				$("#PlayRatio").css("background-position", "0px -224px");
				$("#PlayCoverWnd").attr("name", "active");
			}else if(a.SubMsg == 18){
				var nRatio = a.Ratio;
				if(nRatio == 2){
					$("#PlayRatio").css("background-position", "0px -252px");
					$("#PlayRatio_4_3").attr("name", "active");
				}else{
					$("#PlayRatio").css("background-position", "0px -280px");
					$("#PlayRatio_16_9").attr("name", "active");
				}
			}
		}
	}
	$(function(){
		var s = 
		'<div id="videoRatioBar" data-name="" style="display:none;">\n' + 
		'	<div class=" RatioBtn" id="PlayCoverWnd" name="" data-val="0"></div>\n' +
		'	<div class=" RatioBtn" id="PlayOriginal" name="" data-val="1"></div>\n' +
		'	<div class=" RatioBtn" id="PlayRatio_4_3" name="" data-val="2"></div>\n' +
		'	<div class=" RatioBtn" id="PlayRatio_16_9" name="" data-val="3"></div>\n' +
		'</div>\n';
		$("#mfoot").append(s);
		if(WebCms.web.webstyle == "JvFeng" || WebCms.web.webstyle == "JF"){
			$("#ptz_speed").css("display", "none");
			$("#ptz_SpeedSlider").css("display", "");
		}else{
			$("#ptz_speed").css("display", "");
			$("#ptz_SpeedSlider").css("display", "none");
		}
		function previewEventProcess(k) {
			var aQ = k.SubEvent;
			switch(aQ){
				case PreviewEvent.SubEventPreviewSelectWndChanged:{
					var b = k.Data;
					gVar.CurChannel = b.Channel;
					if(b.PlayStatus == PlayStatus.StatusPlaying){
						$("#BrightnessSlider").slider("setValue", b.nBrightness);
						$("#ContrastSlider").slider("setValue", b.nContrast);
						$("#SaturationSlider").slider("setValue", b.nHue);
						$("#HueSlider").slider("setValue", b.nSaturation);
						if(b.Audio){
							$("#audio").attr("name", "active");
							$("#audio").css("background-position", "0px -140px");
						}else{
							$("#audio").attr("name", "");
							$("#audio").css("background-position", "0px -112px");
						}
						if(b.DigitalZoom){
							$("#digitalZoom").attr("name","active");			
						}else{
							$("#digitalZoom").attr("name","");
						}
												
						$("#PlayRatioTabBtn").css("display", "");
						$(".RatioBtn").attr("name", "");
							if(b.RageState == 0){
							$("#PlayCoverWnd").attr("name", "active");							
							$("#PlayRatio").css("background-position", "0px -224px");
						}else if(b.RageState == 1){
							$("#PlayOriginal").attr("name", "active");							
							$("#PlayRatio").css("background-position", "0px -196px");
						}else if(b.RageState == 2){
							$("#PlayRatio_4_3").attr("name", "active");
							$("#PlayRatio").css("background-position", "0px -252px");
						}else if(b.RageState == 3){	
							$("#PlayRatio_16_9").attr("name", "active");
							$("#PlayRatio").css("background-position", "0px -280px");
						}else{
							$("#PlayCoverWnd").attr("name", "active");
							$("#PlayRatio").css("background-position", "0px -224px");
						}
						
						GetFlipMirror(gVar.CurChannel, function (o) {
							if (o.Ret != 100) {
								if (gDevice.devType != devTypeEnum.DEV_IPC) {
									$("#FlipMirrorSet").css("display", "none");
								}
							} else {
								$("#FlipMirrorSet").css("display", "");
								var cfg = o[o.Name][0];
								$("#Mirror").prop("checked", cfg && cfg.MirrorOperation);
								$("#Flip").prop("checked", cfg && cfg.FlipOperation);
							}
						});
					}else{
						$("#BrightnessSlider").slider("setValue", 0);
						$("#ContrastSlider").slider("setValue", 0);
						$("#SaturationSlider").slider("setValue", 0);
						$("#HueSlider").slider("setValue", 0);
						$("#audio").attr("name", "");
						$("#audio").css("background-position", "0px -112px");
						$("#digitalZoom").attr("name","");				
						$(".RatioBtn").attr("name", "");
						$("#PlayRatioTabBtn").attr("name", "");
						$("#PlayRatioTabBtn, #videoRatioBar").css("display", "none");						
						$("#FlipMirrorSet").css("display", "none");
					}
				}
				break;
				case PreviewEvent.SubEventSingleChnStatus:{
					var b = k.Data;
					gVar.CurChannel = b.CurChannel;
					if(b.Chn == b.CurChannel && b.PlayStatus == PlayStatus.StatusPlaying){
						$("#BrightnessSlider").slider("setValue", b.nBrightness);
						$("#ContrastSlider").slider("setValue", b.nContrast);
						$("#SaturationSlider").slider("setValue", b.nHue);
						$("#HueSlider").slider("setValue", b.nSaturation);
						if(b.Audio){
							$("#audio").attr("name", "active");
							$("#audio").css("background-position", "0px -140px");
						}else{
							$("#audio").attr("name", "");
							$("#audio").css("background-position", "0px -112px");
						}
						if(b.DigitalZoom){
							$("#digitalZoom").attr("name","active");				
						}else{
							$("#digitalZoom").attr("name","");
						}							
						$("#PlayRatioTabBtn").css("display", "");
						$(".RatioBtn").attr("name", "");
						if(b.RageState == 0){
							$("#PlayCoverWnd").attr("name", "active");						
							$("#PlayRatio").css("background-position", "0px -224px");
						}else if(b.RageState == 1){
							$("#PlayOriginal").attr("name", "active");
							$("#PlayRatio").css("background-position", "0px -196px");
						}else if(b.RageState == 2){
							$("#PlayRatio_4_3").attr("name", "active");
							$("#PlayRatio").css("background-position", "0px -252px");
						}else if(b.RageState == 3){
							$("#PlayRatio_16_9").attr("name", "active");
							$("#PlayRatio").css("background-position", "0px -280px");
						}else{		
							$("#PlayCoverWnd").attr("name", "active");
							$("#PlayRatio").css("background-position", "0px -224px");
						}
					}else{
						$("#BrightnessSlider").slider("setValue", 0);
						$("#ContrastSlider").slider("setValue", 0);
						$("#SaturationSlider").slider("setValue", 0);
						$("#HueSlider").slider("setValue", 0);
						$("#audio").attr("name", "");
						$("#audio").css("background-position", "0px -112px");
						$("#digitalZoom").attr("name","");
						$(".RatioBtn").attr("name", "");
						$("#PlayRatioTabBtn").attr("name", "");
						$("#PlayRatioTabBtn, #videoRatioBar").css("display", "none");
					}	
				}
				break;
				case PreviewEvent.SubEventAllChnStatus:{
					var a = k.ChnStatus;
					var rec = 0;
					for(var i = 0; i < a.length ; i++){
						if(a[i].Ret == WEB_ERROR.ERR_SUCESS){
							if(a[i].Stream == 0){
								$("#chnExtraPlay_" + a[i].Chn).attr("name", "");
								$("#chnMainPlay_" + a[i].Chn).attr("name", "active");
							}else if(a[i].Stream == 1){
								$("#chnExtraPlay_" + a[i].Chn).attr("name", "active");
								$("#chnMainPlay_" + a[i].Chn).attr("name", "");
							}else if(a[i].Stream == 9){
								$("#chnExtraPlay_" + a[i].Chn).attr("name", "");
								$("#chnMainPlay_" + a[i].Chn).attr("name", "");
								gVar.CurChannel = -1;
							}
						}else{
							if(a[i].Ret == WEB_ERROR.ERR_CPU_FULLLOAD)
							{
								ShowPaop(pageTitle,lg.get("IDS_LIVE_CPUFullLoad"));
							}
							else if(a[i].Ret == WEB_ERROR.ERR_MEMORY_FULLLOAD)
							{
								ShowPaop(pageTitle,lg.get("IDS_LIVE_MemoryFullLoad"));
							}
							$("#chnExtraPlay_" + a[i].Chn).attr("name", "");
							$("#chnMainPlay_" + a[i].Chn).attr("name", "");
						}
						if(a[i].Record == 0){
							$("#chnRecord_" + a[i].Chn).attr("name", "");
						}else{
							$("#chnRecord_" + a[i].Chn).attr("name", "active");
							rec += 1;
						}
					}
					if(rec == 0){
						$("#FullChannelRecord").attr("name", "");
					}else{
						$("#FullChannelRecord").attr("name", "active");
					}
				}
				break;
				case PreviewEvent.SubEventAutoCheckVersion :{
					ShowVersionInfo(k);
				}
				break;
				case PreviewEvent.SubEventAutoCheckWebVersion:{
					if(k.bNew){
						ShowPaop(lg.get("IDS_CECK_VERSION"),lg.get("IDS_NEW_VERSION"));
					}
					break;
				}
				case PreviewEvent.SubEventShowSystemStatus :{
					$("#SystemStatusContent_SystemCpu").val(k.SystemCpu + "%");
					if(k.SystemCpu >= 90){
						$("#SystemStatusContent_SystemCpu").attr("name","active");		
					}else{
						$("#SystemStatusContent_SystemCpu").attr("name","");
					}
					$("#SystemStatusContent_AppMemory").val(k.AppMemory + "MB");
					if(k.AppMemory >= 1024){
						$("#SystemStatusContent_AppMemory").attr("name","active");		
					}else{
						$("#SystemStatusContent_AppMemory").attr("name","");
					}	
				}
				break;
				case PreviewEvent.SubEventShowPTZElectronic :{
					if (m_MultiLens == 1){
						if (k.nShowElect == 1) {
							$("#ElectBtn").css("display", "");
						} else if (k.nShowElect == 0){
							$("#ElectBtn").css("display", "none");
							$("#ElectPage").hide();
							$("#ElectBtn").attr("name", "");	
						}
						if (m_PTZElect == true) {
							$("#ElectPage").hide();
							$("#ElectBtn").attr("name", "");
							$("#ptzPage").show();
							$("#liveCtrlTip").html(lg.get("IDS_AUTH_PTZControl"));
							$("#PTZBtn").attr("name", "active");
							m_PTZElect = false;
						}	
					}
				}
				break;
				case PreviewEvent.SubEventShowCorridorMode :{
					if (GetFunAbility(gDevice.Ability.OtherFunction.SupportCorridorMode) && bIPC) {
						var bPlay = false;
						if($("#chnMainPlay_0").attr("name") == "active"
							|| $("#chnExtraPlay_0").attr("name") == "active"){
							bPlay = true;
						}
						if(bPlay){
							GetCorridorMode();
						}
					}
				}
				break;
			}
			
		}
		
		$("#ptz_SpeedSlider").slider({minValue: 0, maxValue: 8, showText:false, dragmoveCallback: ShowSpeedNum});
		$("#ptz_SpeedSlider").slider("setValue",5);
		$("#BrightnessSlider").slider({minValue: 0, maxValue: 128, showText:false, dragmoveCallback: SetBrightness});
		$("#ContrastSlider").slider({minValue: 0, maxValue: 128, showText:false, dragmoveCallback: SetContrast});
		$("#SaturationSlider").slider({minValue: 0, maxValue: 128, showText:false, dragmoveCallback: SetSaturation});
		$("#HueSlider").slider({minValue: 0, maxValue: 128, showText:false, dragmoveCallback: SetHue});
		if(!WebCms.plugin.isLoaded){
			$("#BrightnessSlider").slider("setValue", 64);
			$("#ContrastSlider").slider("setValue", 64);
			$("#SaturationSlider").slider("setValue", 128);
			$("#HueSlider").slider("setValue", 64);
		}
		$("#MicphoneVolumnSlider").slider({minValue: 0, maxValue: 100, showText:false, mouseupCallback: SetMicphoneVolumn});
		$("#HornVolumnSlider").slider({minValue: 0, maxValue: 100, showText:false, mouseupCallback: SetHormVolumn});
		$(".second_close_PointLoopSet").click(function(){
			$("#PointLoopDlg").css("display", "none");
			gVar.bEditTour = false;
			MasklayerShow();
			gDevice.HidePlugin(false,function(){
				MasklayerHide();
			});
		});
		$("#SelPoint").empty();
		for (var i=0; i < 255; i++) {
			$("#SelPoint").append('<option value="'+(i+1)+'">'+(i+1)+'</option>');
		}
		$("#SelPoint").val(1);
		$("#InputInterval").val(5);
		createChannelList(gDevice.loginRsp.ChannelNum);
		liveSetTipText();
		$("#liveCtrlTip").html(lg.get("IDS_AUTH_PTZControl"));
		// 通用定制，设置默认步长
		if(typeof g_defaultPtzStep != "undefined" && g_defaultPtzStep * 1 != NaN)
		{
			var nStep = g_defaultPtzStep * 1;
			if(nStep <= 0) nStep = 1;
			if(nStep > 8) nStep = 8;
			for(var i = 1; i <= 8; i++)
			{
				if(i <= nStep)
				{
					$(".ptzSpeedImg[data-uid='" + i + "']").attr("name", "active");
					$(".ptzSpeedImg[data-uid='" + i + "']").addClass("speed-img-active");
				}
				else
				{
					$(".ptzSpeedImg[data-uid='" + i + "']").attr("name", "");
					$(".ptzSpeedImg[data-uid='" + i + "']").removeClass("speed-img-active");
				}
			}
			$("#speedNum").html("" + nStep);
		}

		function InitTalkPage(){
			var firstChannel=-1;
			var lambda=function(){
				firstChannel=firstChannel==-1?0:firstChannel;
				if(m_bChannelTalk && m_nTalkChannel >= 0){
					$("#btnTalkCtrl").html(lg.get("IDS_LIVE_StopTalk"));
					$("#btnTalkCtrl").attr("name","active");
					$("#TalkChannelSelect").val(m_nTalkChannel);
				}else{
					$("#btnTalkCtrl").html(lg.get("IDS_LIVE_StartTalk"));
					$("#btnTalkCtrl").attr("name","");
					$("#TalkChannelSelect").val(firstChannel);
				}
				if(m_bDeviceTalk){
					$("#btnDeviceTalkCtrl").html(lg.get("IDS_LIVE_StopTalk"));
					$("#btnDeviceTalkCtrl").attr("name","active");
				}else{
					$("#btnDeviceTalkCtrl").html(lg.get("IDS_LIVE_StartTalk"));
					$("#btnDeviceTalkCtrl").attr("name","");
				}
				if(m_bBroadcast){
					$("#btnBroadcastCtrl").html(lg.get("IDS_LIVE_StopTalk"));
					$("#btnBroadcastCtrl").attr("name","active");
				}else{
					$("#btnBroadcastCtrl").html(lg.get("IDS_LIVE_StartTalk"));
					$("#btnBroadcastCtrl").attr("name","");
				}
				if(GetFunAbility(gDevice.Ability.OtherFunction.SupportSetVolume)){
					$("#HornVolumn").css("display", "");
					RfParamCall(function (a){
						if(a.Ret == 100){
							$("#HornVolumnSlider").slider("setValue", a[a.Name][0].RightVolume);
						}
						
						if(GetFunAbility(gDevice.Ability.OtherFunction.SupportSetInVolume)){
							$("#MicphoneVolumn").css("display", "");
							RfParamCall(function(a){
								if(a.Ret == 100){
									$("#MicphoneVolumnSlider").slider("setValue", a[a.Name][0].RightVolume);
								}
								m_bTalkPageCfgLoading = false;
								$("#TalkPage").show();
								MasklayerHide();
							}, pageTitle, "fVideo.VolumeIn", -1, WSMsgID.WsMsgID_CONFIG_GET, null, true);	
						}else{
							$("MicphoneVolumn").css("display", "none");
							m_bTalkPageCfgLoading = false;
							$("#TalkPage").show();
							MasklayerHide();
						}
					}, pageTitle, "fVideo.Volume", -1, WSMsgID.WsMsgID_CONFIG_GET, null, true);
				}else{
					$("#HornVolumn").css("display", "none");
					
					if(GetFunAbility(gDevice.Ability.OtherFunction.SupportSetInVolume)){
						$("#MicphoneVolumn").css("display", "");
						RfParamCall(function(a){
							if(a.Ret == 100){
								$("#MicphoneVolumnSlider").slider("setValue", a[a.Name][0].RightVolume);
							}
							m_bTalkPageCfgLoading = false;
							$("#TalkPage").show();
							MasklayerHide();
						}, pageTitle, "fVideo.VolumeIn", -1, WSMsgID.WsMsgID_CONFIG_GET, null, true);
					}else{
						$("MicphoneVolumn").css("display", "none");
						m_bTalkPageCfgLoading = false;
						$("#TalkPage").show();
						MasklayerHide();
					}
				}
			}
			$(".ChannelTalk_Box, .Broadcast_Box").css("display","none");
			if(gDevice.devType == devTypeEnum.DEV_IPC || !WebCms.plugin.isLoaded){
				$(".ChannelTalk_Box, .Broadcast_Box").css("display","none");
				lambda();
			}else{
				$("#TalkChannelSelect").empty();
				var SupportIPCTalk;
				var ChanStatus;
				function fillTalkChannel(){
					var dataHtml = '';
					var nSurportTalk = 0;
					var TalkChnArry = []; 
					for (var j = 0; j < gDevice.loginRsp.ChannelNum; j++) {
						TalkChnArry[j] = 0;
						if(SupportIPCTalk[j] == 1){
							if(j >= gDevice.loginRsp.VideoInChannel && ChanStatus[j - gDevice.loginRsp.VideoInChannel].Status != "Connected"){
								continue;
							}
							if(firstChannel==-1){
								firstChannel=j;
							}
							TalkChnArry[j] = 1;
							nSurportTalk++;
							dataHtml += '<option value="' + j + '">' + gDevice.getChannelName(j) + '</option>';
						}
					}
					if(nSurportTalk > 0){
						$(".ChannelTalk_Box, .Broadcast_Box").css("display","");
						var m = TalkChnArry.lastIndexOf(1);
						if(m < gDevice.loginRsp.VideoInChannel){
							$(".Broadcast_Box").css("display","none");
						}				
						$("#TalkChannelSelect").append(dataHtml);
						$("#TalkChannelSelect").val(firstChannel);
					}else{
						$(".ChannelTalk_Box, .Broadcast_Box").css("display","none");
					}
					lambda();
				}
				// DVR获取音频采集模式
				function GetAudioAcquisitionMode(){
					if(gDevice.loginRsp.VideoInChannel > 0){
						RfParamCall(function(a){
							if(a.Ret == 100){
								// 同轴采集模式禁用设备对讲
								if(a[a.Name]["AudioAcquisitionMode"][0] > 0){
									DivBox(0, ".DeviceTalk_Box");
									$("#btnDeviceTalkCtrl").css("pointer-events", "none");
								}else{
									DivBox(1, ".DeviceTalk_Box");
									$("#btnDeviceTalkCtrl").css("pointer-events", "auto");
								}
							}else{
								DivBox(1, ".DeviceTalk_Box");
								$("#btnDeviceTalkCtrl").css("pointer-events", "auto");
							}
							fillTalkChannel();
						}, pageTitle, "fVideo.AudioAcquisitionMode", -1, WSMsgID.WsMsgID_CONFIG_GET);
					}else {
						fillTalkChannel();
					}
				}	
				//获取通道能力级
				RfParamCall(function(a){
					if(a.Ret == 100){
						SupportIPCTalk = a[a.Name];
						var m = SupportIPCTalk.lastIndexOf(1);
						if(gDevice.loginRsp.DigChannel > 0 &&  m >= gDevice.loginRsp.VideoInChannel){
							RfParamCall(function(a){
								ChanStatus = a[a.Name];
								GetAudioAcquisitionMode();
							}, pageTitle, "NetWork.ChnStatus", -1, WSMsgID.WsMsgID_CONFIG_GET);
						}else{
							GetAudioAcquisitionMode();
						}
					}else{
						lambda();
					}						
				}, pageTitle, "ChannelSystemFunction@SupportIPCTalk", -1, WSMsgID.WSMsgID_CHANNEL_ABILITY_GET_REQ, null, true);
			}
		}
		$("#TalkChannelSelect").change(function(){
			if(m_bChannelTalk){
				MasklayerShow();
				gDevice.StopTalk(function(a){
					MasklayerHide();
					if(a.Ret == 100){
						$("#btnTalkCtrl").html(lg.get("IDS_LIVE_StartTalk"));
						$("#btnTalkCtrl").attr("name","");
						m_bChannelTalk = false;
						m_nTalkChannel = -1;
					}
				});
			}
		});
		$(".LiveTabBtn").click(function(){
			if(m_bTalkPageCfgLoading)
				return;
			var id = $(this).attr("id");
			var ch=gVar.CurChannel;

			var obj = this;
			// 从电子云台页面点击到非电子云台页面，需要设置状态为false
			if(m_PTZElect && id != "ElectBtn")
			{
				gDevice.PTZElect(ch, 11, 0, function(){	
					ChangeLiveTabPage(obj);
				});
			}
			else
			{
				ChangeLiveTabPage(obj);
			}

			function ChangeLiveTabPage(obj){
				if(id == "PTZBtn"){
					$("#colorPage").hide();
					$("#TalkPage").hide();
					$("#ElectPage").hide();
					$("#ptzPage").show();
					$("#MenuPage").hide();
					$("#MenuBtn").attr("name", "");
					$("#colorBtn").attr("name", "");
					$("#TalkBtn").attr("name", "");
					$("#ElectBtn").attr("name", "");
					$(obj).attr("name", "active");
					$("#liveCtrlTip").html(lg.get("IDS_AUTH_PTZControl"));
					m_PTZElect = false;
				}else if(id == "colorBtn"){
					$("#ptzPage").hide();
					$("#TalkPage").hide();
					$("#ElectPage").hide();
					$("#colorPage").show();
					$("#MenuPage").hide();
					$("#MenuBtn").attr("name", "");
					$("#PTZBtn").attr("name", "");
					$("#TalkBtn").attr("name", "");
					$("#ElectBtn").attr("name", "");
					$("#liveCtrlTip").html(lg.get("IDS_IMG_CONFIG"));
					$(obj).attr("name", "active");
					m_PTZElect = false;
				}else if(id == "TalkBtn"){
					$("#ptzPage").hide();
					$("#colorPage").hide();
					$("#ElectPage").hide();
					$("#TalkPage").show();
					$("#MenuPage").hide();
					$("#MenuBtn").attr("name", "");
					$("#PTZBtn").attr("name", "");
					$("#colorBtn").attr("name", "");
					$("#ElectBtn").attr("name", "");
					$("#liveCtrlTip").html(lg.get("IDS_AUTH_Talk_01"));
					$(obj).attr("name", "active");
					m_PTZElect = false;
					m_bTalkPageCfgLoading = true;
					InitTalkPage();	
				}else if(id == "ElectBtn") {
					$("#ptzPage").hide();
					$("#colorPage").hide();
					$("#TalkPage").hide();
					$("#MenuPage").hide();
					$("#MenuBtn").attr("name", "");
					$("#PTZBtn").attr("name", "");
					$("#colorBtn").attr("name", "");
					$("#TalkBtn").attr("name", "");
					$("#liveCtrlTip").html(lg.get("IDS_AUTH_PTZElect"));
					$(obj).attr("name", "active");
					m_PTZElect = true;
					gDevice.PTZElect(ch, 10, 0, function(){	
						$("#ElectPage").show();
					});
				} else if (id == "MenuBtn") {
					$("#colorPage").hide();
					$("#TalkPage").hide();
					$("#ElectPage").hide();
					$("#ptzPage").hide();
					$("#MenuPage").show();
					$("#PTZBtn").attr("name", "");
					$("#colorBtn").attr("name", "");
					$("#TalkBtn").attr("name", "");
					$("#ElectBtn").attr("name", "");
					$(obj).attr("name", "active");
					$("#liveCtrlTip").html(lg.get("IDS_AUTH_OSDMenu"));
					m_PTZElect = false;
				}
			}
		});
		$("#btnDeviceTalkCtrl").click(function(){
			if(m_bChannelTalk){
				ShowPaop(talkTitle, lg.get("IDS_LIVE_CHANNEL_TALK_OPEN"));
				return;
			}
			if(m_bBroadcast){
				ShowPaop(talkTitle, lg.get("IDS_LIVE_BROADCAST_OPEN_DEVICETALK"));
				return;
			}
			if(!m_bDeviceTalk){
				//MasklayerShow();
				gDevice.StartDeviceTalk(function(a){
					//MasklayerHide();
					if(a.Ret == 100){
						$("#btnDeviceTalkCtrl").html( lg.get("IDS_LIVE_StopTalk"));
						$("#btnDeviceTalkCtrl").attr("name","active");
						m_bDeviceTalk = true;
					}else if(a.Ret == 101 || a.Ret == 1016){
						ShowPaop(talkTitle, lg.get("IDS_LIVE_StartTalk_Ret_failed"));
					}
					else if(a.Ret == 107){
						ShowPaop(talkTitle, lg.get("IDS_NO_POWER"));
					}
				});
			}else{
				//MasklayerShow();
				gDevice.StopTalk(function(a){
					//MasklayerHide();
					if(a.Ret == 100){
						$("#btnDeviceTalkCtrl").html(lg.get("IDS_LIVE_StartTalk"));
						$("#btnDeviceTalkCtrl").attr("name","");
						m_bDeviceTalk = false;
					}
				});
			}
			
		});
		$("#btnTalkCtrl").click(function(){
			if(m_bDeviceTalk){
				ShowPaop(talkTitle, lg.get("IDS_LIVE_DEVICE_TALK_OPEN"));
				return;
			}
			if(m_bBroadcast){
				ShowPaop(talkTitle, lg.get("IDS_LIVE_BROADCAST_OPEN_CHANNELTALK"));
				return;
			}
			if(m_bChannelTalk){
				MasklayerShow();
				gDevice.StopTalk(function(a){
					MasklayerHide();
					if(a.Ret == 100){
						$("#btnTalkCtrl").html(lg.get("IDS_LIVE_StartTalk"));
						$("#btnTalkCtrl").attr("name","");
						m_bChannelTalk = false;
						m_nTalkChannel = -1;
					}
				});
			}else{
				MasklayerShow();
				gDevice.StartChannelTalk($("#TalkChannelSelect").val()*1,function(a){
					MasklayerHide();
					if(a.Ret == 100){
						$("#btnTalkCtrl").attr("name", "active");
						$("#btnTalkCtrl").html(lg.get("IDS_LIVE_StopTalk"));
						m_bChannelTalk = true;
						m_nTalkChannel = $("#TalkChannelSelect").val()*1;
					}else if(a.Ret == 101 || a.Ret == 1016){
						ShowPaop(talkTitle, lg.get("IDS_LIVE_StartTalk_Ret_failed"));
						$("#btnTalkCtrl").attr("name", "");
						$("#btnTalkCtrl").html(lg.get("IDS_LIVE_StartTalk"));
						m_bChannelTalk = false;
						m_nTalkChannel = -1;
					}
					else if(a.Ret == 107){
						ShowPaop(talkTitle, lg.get("IDS_NO_POWER"));
						$("#btnTalkCtrl").attr("name", "");
						$("#btnTalkCtrl").html(lg.get("IDS_LIVE_StartTalk"));
						m_bChannelTalk = false;
						m_nTalkChannel = -1;
					}
				});
			}
			
		});
		$("#btnBroadcastCtrl").click(function(){
			if(m_bChannelTalk){
				ShowPaop(talkTitle, lg.get("IDS_LIVE_CHANNEL_TALK_OPEN_BROADCAST"));
				return;
			}
			if(m_bDeviceTalk){
				ShowPaop(talkTitle, lg.get("IDS_LIVE_DEVICE_TALK_OPEN_BROADCAST"));
				return;
			}
			if(m_bBroadcast){
				MasklayerShow();
				gDevice.StopTalk(function(a){
					MasklayerHide();
					if(a.Ret == 100){
						$("#btnBroadcastCtrl").html(lg.get("IDS_LIVE_StartTalk"));
						$("#btnBroadcastCtrl").attr("name","");
						m_bBroadcast = false;
					}
				});
			}else{
				MasklayerShow();
				gDevice.StartChannelTalk(-1,function(a){
					MasklayerHide();
					if(a.Ret == 100){
						$("#btnBroadcastCtrl").attr("name", "active");
						$("#btnBroadcastCtrl").html(lg.get("IDS_LIVE_StopTalk"));
						m_bBroadcast = true;
					}else if(a.Ret == 101){
						ShowPaop(talkTitle, lg.get("IDS_LIVE_BROADCAST_Ret_failed"));
						$("#btnBroadcastCtrl").attr("name", "");
						$("#btnBroadcastCtrl").html(lg.get("IDS_LIVE_StartTalk"));
						m_bBroadcast = false;
					}
				});
			}
		});
		$("#wndModeTabBtn").mouseover(function(){
			$(".CurWndModeBtn").css("background-position-x", "-28px");
			$(".WndModeDownBtn").css("background-position-x", "-8px");
		}).mouseout(function(){
			$(".CurWndModeBtn").css("background-position-x", "-0px");
			$(".WndModeDownBtn").css("background-position-x", "-0px");
		}).click(function(){
			if($(this).attr("name") != "active" ){
				$("#StreamBar, #videoRatioBar").hide();
				$("#FullChnPreviewTabBtn, #PlayRatioTabBtn").attr("name", "");
				$("#wndModeBar").show();
				$(".WndModeBtn").each(function() {
					var nShowMode = gDevice.GetWndShowMode(gDevice.loginRsp.ChannelNum);
					var nMode = $(this).attr("data-val") * 1;
					if (nMode <= nShowMode) {
						$(this).css("background-position", "0 -"+nMode*28 +"px");
						$(this).css("display", "");
					} else {
						$(this).css("display", "none");
					}
				});
				$(this).attr("name", "active");
			}else{
				$("#wndModeBar").hide();
				$("#StreamBar, #videoRatioBar").hide();
				$("#FullChnPreviewTabBtn, #PlayRatioTabBtn").attr("name", "");
				$(this).attr("name", "");
			}
		});
		$(".WndModeBtn").mouseover(function(){
			$(this).css("background-position-x", "-28px");
		}).mouseout(function(){
			$(this).css("background-position-x", "-0px");
		}).click(function(){
			var mode = $(this).attr("data-val")*1;
			$(".CurWndModeBtn").css("background-position-y", "-"+mode*28+"px");
			gDevice.SetWndShowMode(mode,function(a){
				if(a.Ret == 100){
					gVar.CurChannel = a.Chn;
				}	
			});
		});
		$(".StreamTypeBtn").mouseover(function(){
			
		}).mouseout(function(){
			
		}).click(function(){
			var id = $(this).attr("id");
			if(id != "Stream_Stop"){
				var Stream = $(this).attr("data-val")*1;
				MasklayerShow();
				if(bIPC && GetFunAbility(gDevice.Ability.PreviewFunction.PreviewShowPedRule)){
					GetHumanCfg(0, HumanCfgCallBack, function(){
						gDevice.PreviewPlay(-1, Stream, FullChannelPreviewPlayStartCallback);
					});
				}
				else{
					gDevice.PreviewPlay(-1, Stream, FullChannelPreviewPlayStartCallback);
				}		
			}else{
				nCurFullChannelPlayStream = -1;
				MasklayerShow();
				gDevice.PreviewStop(-1,FullChannelPreviewPlayStopCallback);
			}	
		});
		$("#FullChnPreviewTabBtn").mouseover(function(){
			$(".FullChnPreviewBtn").css("background-position-x", "-28px");
			$(".FullChnPreviewDownBtn").css("background-position-x", "-8px");
		}).mouseout(function(){
			if($(".FullChnPreviewBtn").attr("name") != "active"){
				$(".FullChnPreviewBtn").css("background-position-x", "-0px");
			}
			$(".FullChnPreviewDownBtn").css("background-position-x", "-0px");
		}).click(function(){
			if($(this).attr("name") != "active" ){
				$("#StreamBar").show();
				$("#wndModeBar, #videoRatioBar").hide();
				$("#wndModeTabBtn, #PlayRatioTabBtn").attr("name", "");
				$(this).attr("name", "active");
			}else{
				$("#wndModeBar").hide();
				$("#StreamBar, #videoRatioBar").hide();
				$("#wndModeTabBtn, #PlayRatioTabBtn").attr("name", "");
				$(this).attr("name", "");
			}
		});
		$("#PlayRatioTabBtn").mouseover(function(){
			$(".PlayRatioBtn").css("background-position-x", "-28px");
			$(".PlayRatioDownBtn").css("background-position-x", "-8px");
		}).mouseout(function(){
			$(".PlayRatioBtn").css("background-position-x", "-0px");
			$(".PlayRatioDownBtn").css("background-position-x", "-0px");
		}).click(function(){
			if($(this).attr("name") != "active" ){
				$("#videoRatioBar").show();
				$("#wndModeBar, #StreamBar").hide();
				$("#wndModeTabBtn, #FullChnPreviewTabBtn").attr("name", "");
				$(this).attr("name", "active");
			}else{
				$("#wndModeBar, #StreamBar, #videoRatioBar").hide();
				$("#wndModeTabBtn, #FullChnPreviewTabBtn").attr("name", "");
				$(this).attr("name", "");
			}
		});	
		$(".liveControlBtn").mouseover(function () {
			var id = $(this).attr("id");
			if(id == "audio"){
				$(this).css("background-position-x", "-28px");
			}
		}).mouseout(function () {
			var id = $(this).attr("id");
			if($(this).attr("name") != "active" && (id == "audio")){
				$(this).css("background-position-x", "0px");
			}
		}).click(function () {
			var curId = $(this).attr("id");
			if(curId == "fullScreen"){
				gDevice.FullScreen(1);
			}else if(curId == "digitalZoom"){
				var b= $(this);
				gDevice.DigitalZoom(function(a){
					if(a.Ret == 100){
						b.attr("name", "active");
					}else{
						b.attr("name", "");
					}
				});
			}else if(curId == "audio"){
				var a = $(this);
				var c = gVar.CurChannel;
				if (c >= 0) {
					gDevice.SetSound(c, function (b) {
						if (b.Audio) {
							a.attr("name", "active");
							a.css("background-position", "0px -140px");
						} else {
							a.attr("name", "");
							a.css("background-position", "0px -112px");
						}
					});
				}
			}else if(curId == "localCapture"){
				var c = gVar.CurChannel;
				if (c >= 0) {
					gDevice.LocalCapture(c, function (a) {
						if (a.Ret == 100) {
							if(WebCms.plugin.isLoaded){
								var str = lg.get("IDS_CAPTURE_SUCCESS") + a.CapPath;
								ShowPaop(pageTitle, str);
							}
						} else {
							ShowPaop(pageTitle, lg.get("IDS_CAPTURE_FAIL"));
						}
					});
				} else {
					ShowPaop(lg.get("IDS_OSD_INFO"), lg.get("IDS_NO_VIDEO"));
				}
			}else if(curId == "FullChannelRecord"){
				var bPlay = false;
				for(var i = 0;i < gDevice.loginRsp.ChannelNum;i++ ){
					if ($("#chnMainPlay_" + i).attr("name") == "active" ||
					$("#chnExtraPlay_" + i).attr("name") == "active") {
						bPlay = true;
					}
				}
				if(!bPlay){
					ShowPaop("Record", lg.get("IDS_NOT_OPEN_PREVIEW"));
					return;
				}
				var bRecord = false;
				if($("#FullChannelRecord").attr("name") == "active"){
					bRecord = false;
				}else{
					bRecord = true;
				}
				if(bRecord){
					gDevice.LocalRecord(-1, true, FullChannelRecordStartCallback);
				}else{
					gDevice.LocalRecord(-1, false, FullChannelRecordStopCallback);
				}
				
			}
		});	
		$(".RatioBtn").mouseover(function () {
			
		}).mouseout(function () {
		
		}).click(function () {
			var curId = $(this).attr("id");
			if(curId == "PlayOriginal"){
				gDevice.PlayOriginal(ProportionAdjustmentCallBack);
			}else if(curId == "PlayCoverWnd"){
				gDevice.PlayCoverWnd(ProportionAdjustmentCallBack);
			}else{
				var nRatio = $(this).attr("data-val") * 1;
				gDevice.PlayRatio(nRatio, ProportionAdjustmentCallBack);
			}
		});
		$(".mainPlayBtn").click(function (e) {
			if ($(this).attr("name") == "disable") {
				return false;
			}
			var bOpen = $(this).attr("name") == "active";
			var str = $(this).attr("id");
			var chn = str.split("_")[1] * 1;
			var wnd = 0;
			if(!bOpen){
				//MasklayerShow();
				if(bIPC && GetFunAbility(gDevice.Ability.PreviewFunction.PreviewShowPedRule)){
					GetHumanCfg(0, HumanCfgCallBack, function(){
						gDevice.PreviewPlay(chn, 0, PreviewPlayCallback);
					});
				}
				else{
					gDevice.PreviewPlay(chn, 0, PreviewPlayCallback);
				}
			}else{
				//MasklayerShow();
				gDevice.PreviewStop(chn, function(a,b){
					MasklayerHide();
					gVar.CurChannel = -1;
					$("#chnMainPlay_" + chn).attr("name", "");
					$("#chnExtraPlay_" + chn).attr("name", "");	
					if($("#chnRecord_" + chn).attr("name") == "active"){
						$("#chnRecord_" + chn).attr("name", "");
					}					
					if (gDevice.devType != devTypeEnum.DEV_IPC) {
						$("#FlipMirrorSet").css("display", "none");
					}
				});
			}
			e.stopPropagation();
		});
		$(".extraPlayBtn").click(function(e){
			if ($(this).attr("name") == "disable") {
				return false;
			}
			var bOpen = $(this).attr("name") == "active";
			var str = $(this).attr("id");
			var chn = str.split("_")[1] * 1;
			var wnd = 0;
			function f(){
				if(bIPC && GetFunAbility(gDevice.Ability.PreviewFunction.PreviewShowPedRule)){
					GetHumanCfg(0, HumanCfgCallBack, function(){
						gDevice.PreviewPlay(chn, 1, PreviewPlayCallback);
					});
				}
				else{
					gDevice.PreviewPlay(chn, 1, PreviewPlayCallback);
				}
			}
			if(!bOpen){
				if(!WebCms.plugin.isLoaded && gVar.CurChannel >= 0){
					gDevice.PreviewStop(chn, function(a){
						gVar.CurChannel = -1;
						$("#chnMainPlay_" + chn).attr("name", "");
						$("#chnExtraPlay_" + chn).attr("name", "");
						if($("#chnRecord_" + chn).attr("name") == "active"){
							$("#chnRecord_" + chn).attr("name", "");
						}
						f();
					});
				}else{
					f();
				}
			}else{
				//MasklayerShow();
				gDevice.PreviewStop(chn, function(a){
					MasklayerHide();
					gVar.CurChannel = -1;
					$("#chnMainPlay_" + chn).attr("name", "");
					$("#chnExtraPlay_" + chn).attr("name", "");
					if($("#chnRecord_" + chn).attr("name") == "active"){
						$("#chnRecord_" + chn).attr("name", "");
					}
					if (gDevice.devType != devTypeEnum.DEV_IPC) {
						$("#FlipMirrorSet").css("display", "none");
					}
				});	
			}
			e.stopPropagation();
		});
		$(".recordBtn").click(function(e){
			if ($(this).attr("name") == "disable") {
				return false;
			}
			var bOpen = $(this).attr("name") == "active";
			var str = $(this).attr("id");
			var chn = str.split("_")[1] * 1;
			if ($("#chnMainPlay_" + chn).attr("name") != "active" &&
				$("#chnExtraPlay_" + chn).attr("name") != "active") {
					ShowPaop("Record", lg.get("IDS_NOT_OPEN_PREVIEW"));
				return;
			}
			
			if(!bOpen){
				gDevice.LocalRecord(chn, true, LocalRecordCallback);
			}else{
				gDevice.LocalRecord(chn, false, LocalRecordCallback);
			}
		});
		$(".ptz-button").mousedown(function(){
			if(gVar.CurChannel >= 0){
				var nPTZType = $(this).attr("data-uid") * 1;
				var nSpeed = $("#speedNum").text() *1;
				var nStop = 0;
				gDevice.PTZcontrol(nPTZType, gVar.CurChannel, nSpeed, nStop, 0, null);
				m_bMouseDown = true;
			}
		}).mouseup(function(){
			if(gVar.CurChannel >= 0){
				if(m_bMouseDown){
					var nPTZType = $(this).attr("data-uid") * 1;
					var nSpeed = $("#speedNum").text() *1;
					var nStop = 1;
					gDevice.PTZcontrol(nPTZType, gVar.CurChannel, nSpeed, nStop, 0, null);	
				}
			}
			m_bMouseDown = false;
		}).mouseover(function(){
			var nPosX = $(this).attr("data-posx") *1;
			var nPosY = $(this).attr("data-posy") *1;
			$("#LIVE_YT").css("background-position", "-" + nPosX + "px -" + nPosY + "px");
		}).mouseout(function(){
			$("#LIVE_YT").css("background-position", "0 -280px");
			if(gVar.CurChannel >= 0){
				if(m_bMouseDown){
					var nPTZType = $(this).attr("data-uid") * 1;
					var nSpeed = $("#speedNum").text() *1;
					var nStop = 1;
					gDevice.PTZcontrol(nPTZType, gVar.CurChannel, nSpeed, nStop, 0, null);	
				}
			}
			m_bMouseDown = false;
		});
		$(".ptz-button1").click(function(){
			var curId = $(this).attr("id");
			if (curId == "ytCenterL") {			//打开菜单
				var nPTZType = $(this).attr("data-uid") * 1;
				var c = gVar.CurChannel;
				var nSpeed = $("#speedNum").text() *1;
				gDevice.PTZcontrol(nPTZType, c, nSpeed, 0, 0, null);

				// var o = {};
				// o.nChannel = c;
				// o.nPTZType = $(this).attr("data-uid") * 1;
				// if (c < 0) return;
				// gDevice.PTZcontrol(o, null);
			}else if (curId == "ytCenterR") {	//3D打印
			}
		}).mouseover(function(){
			var nPosX = $(this).attr("data-posx") *1;
			var nPosY = $(this).attr("data-posy") *1;
			$("#LIVE_YT").css("background-position", "-" + nPosX + "px -" + nPosY + "px");
		}).mouseout(function(){
			$("#LIVE_YT").css("background-position", "0 -280px");
		});
		function SetScalTwoLens(stream,nSpeed){
			gDevice.GetOpSensor(gVar.CurChannel,stream,nSpeed,function(){
				if(!m_bMouseDown){
					return;
				}
				setTimeout(SetScalTwoLens(stream,nSpeed),400);
			});
		}

		function SetScalTwoLensEx(nType,nSpeed){
			gDevice.ScaleSwitch(nType,nSpeed,function(){
				if(!m_bMouseDown){
					return;
				}
				setTimeout(SetScalTwoLensEx(nType,nSpeed),400);
			});
		}
		$(".PtzCtrlMinus1,.PtzCtrlPlus1").mousedown(function(){
			m_bMouseDown = true;
			var CurChannel=gVar.CurChannel;
			if (CurChannel< 0) return;
			var nPTZType = $(this).attr("data-uid") * 1;
			if(nPTZType == 8 || nPTZType == 9){
				gDevice.GetScaleTwoLensAbility(gVar.CurChannel,function(a){
					if(!a){
						gVar.SupportScaleTwoLens = false;
						var nSpeed = $("#speedNum").text() * 1;
						var nStop = 0;
						gDevice.PTZcontrol(nPTZType, CurChannel, nSpeed, nStop, 0, null);
					}else{
						gVar.SupportScaleTwoLens = true;
						var nSpeed = $("#speedNum").text() * 1;
						if(nPTZType == 8){
							SetScalTwoLensEx(1,nSpeed);
						}else if(nPTZType == 9){
							SetScalTwoLensEx(0,nSpeed);
						}
						
					}
					
				});
			}else{
				m_bMouseDown = true;
				var nSpeed = $("#speedNum").text() * 1;
				var nStop = 0;
				gDevice.PTZcontrol(nPTZType, CurChannel, nSpeed, nStop, 0, null);
			}
			
		}).mouseup(function () {
			if (m_bMouseDown) {
				var nPTZType = $(this).attr("data-uid") * 1;
				if(gVar.SupportScaleTwoLens && (nPTZType == 8 || nPTZType == 9)){
					
				}else{
					var CurChannel=gVar.CurChannel;
					if (CurChannel < 0) return;
					var nSpeed = $("#speedNum").text() * 1;
					var nStop = 1;
					gDevice.PTZcontrol(nPTZType, CurChannel, nSpeed, nStop, 0, null);
				}
			}
			m_bMouseDown = false;
		}).mouseover(function(){
			
		}).mouseout(function(){
			if(m_bMouseDown){
				var nPTZType = $(this).attr("data-uid") * 1;
				if(gVar.SupportScaleTwoLens && (nPTZType == 8 || nPTZType == 9)){
					
				}else{
					var CurChannel=gVar.CurChannel;
					if (CurChannel < 0) return;
					var nSpeed = $("#speedNum").text() * 1;
					var nStop = 1;
					gDevice.PTZcontrol(nPTZType, CurChannel, nSpeed, nStop, 0, null);
				}
			}
			m_bMouseDown = false;
		});
		$("#ptz_speed").mouseout(function() {
			$(".ptzSpeedImg").removeClass("ptzSpeedImg").addClass("ptzSpeedImg");
			var i = 0;
			$(".ptzSpeedImg").each(function() {
				if ($(this).attr("name") == "active") {
					++i;
					$(this).addClass("speed-img-active")
				}
				$("#speedNum").text(i)
			})
		});
		$(".ptzSpeedBlock").mouseover(function() {
			$(".ptzSpeedImg").removeClass("ptzSpeedImg speed-img-active").addClass("ptzSpeedImg");
			var q = $(this).data("uid");
			for (var p = 1; p <= q; p++) {
				$(".ptzSpeedImg[data-uid=" + p + "]").addClass("speed-img-hover");
				$("#speedNum").text(q)
			}
		}).mouseout(function() {
			$(".ptzSpeedImg").removeClass("speed-img-hover")
		}).click(function() {
			$(".ptzSpeedImg").removeClass("ptzSpeedImg speed-img-active").addClass("ptzSpeedImg").removeAttr("name");
			for (var p = 1; p <= $(this).data("uid"); p++) {
				$(".ptzSpeedImg[data-uid =" + p + "]").removeClass("speed-img-hover").addClass("speed-img-active").attr("name",
					"active")
			}
		});
		$(".PresetBtn").mouseover(function(){
			
		}).mouseout(function(){
			
		}).click(function(){
			var nPTZType = $(this).attr("data-uid") * 1;
			var c = gVar.CurChannel;
			if (c < 0) return;
			var nPresetIndex = $("#InputPreset").val() * 1;
			var bExist = 0;
			if (nPTZType == 17) {
				gDevice.PTZcontrol(nPTZType, c, nPresetIndex, 0, 0, function (a) {
					if (a.Ret == 100) {
						if (nPTZType == 17) {
							var str = lg.get("IDS_ADD_POINT") + " " + nPresetIndex + " " + lg.get("IDS_SUCCESS");
							ShowPaop("PTZ", str);
						} else {
							ShowPaop("PTZ", lg.get("IDS_SAVE_SUCCESS"));	
						}
					} else {
						if (nPTZType == 17) {
							var str = lg.get("IDS_ADD_POINT") + " " + nPresetIndex + " " + lg.get("IDS_FAILED");
							ShowPaop("PTZ", str);
						} else {
							ShowPaop("PTZ", lg.get("IDS_SAVE_FAILED"));
						}
					}
				});
			} else {
				var bSupportOnvif = true;
				var chn = (c >= gDevice.loginRsp.VideoInChannel) ? c - gDevice.loginRsp.VideoInChannel : c;
				var fName = (c >= gDevice.loginRsp.VideoInChannel) ? "bypass@Uart.PTZPreset" : "Uart.PTZPreset";
				GetIpcSoftVersion(c, function (strSoftVersion) {
					var verisonList = strSoftVersion.split(".");
					if (verisonList.length == 7) {
						var cOvifServer = verisonList[4];
						if (cOvifServer[3] == '0') {
							bSupportOnvif = false;
						}
					} else {
						bSupportOnvif = true;  //获取不到默认支持onvif
					}


					RfParamCall(function(b){
						if (b.Ret == 100 || (bSupportOnvif && b.Ret == 607)) {
							if (b.Ret == 100) {
								var PresetCfg = b[b.Name];
								if(PresetCfg != null && fName.indexOf("bypass@") >= 0){
									PresetCfg = PresetCfg[0];
								}
								if (PresetCfg == null) {
									ShowPaop("PTZ", lg.get("IDS_PRESET_NOT_EXIST"));
									return ;
								}
								for (var i = 0;i < PresetCfg.length;i++){
									if (nPresetIndex == PresetCfg[i].Id) {
										bExist = 1;
									}
								}
								if (bExist != 1) {
									ShowPaop("PTZ", lg.get("IDS_PRESET_NOT_EXIST"));
									return ;
								}
							}
							AddOrGoPresetFunc();
						} else {
							ShowPaop("PTZ", lg.get("IDS_PRESET_NOT_EXIST"));
						}
					}, pageTitle, fName, chn, WSMsgID.WsMsgID_CONFIG_GET, null, true);

				});

				function AddOrGoPresetFunc(){
					gDevice.PTZcontrol(nPTZType, c, nPresetIndex, 0, 0, function (a) {
						if (a.Ret == 100) {
							if (nPTZType == 18) {
								var str = lg.get("IDS_DELETE_POINT") + " " + nPresetIndex + " " + lg.get("IDS_SUCCESS");
								ShowPaop("PTZ", str);
							} else if (nPTZType == 19) {
								var str = lg.get("IDS_CALL_POINT") + " " + nPresetIndex + " " + lg.get("IDS_SUCCESS");
								ShowPaop("PTZ", str);
							} else {
								ShowPaop("PTZ", lg.get("IDS_SAVE_SUCCESS"));	
							}
						} else {
							if (nPTZType == 18) {
								var str = lg.get("IDS_DELETE_POINT") + " " + nPresetIndex + " " + lg.get("IDS_FAILED");
								ShowPaop("PTZ", str);
							} else if (nPTZType == 19) {
								var str = lg.get("IDS_CALL_POINT") + " " + nPresetIndex + " " + lg.get("IDS_FAILED");
								ShowPaop("PTZ", str);
							} else {
								ShowPaop("PTZ", lg.get("IDS_SAVE_FAILED"));
							}
						}
					});
				}
			}
		});
		$(".TourBtn").mouseover(function(){
			
		}).mouseout(function(){
			
		}).click(function(){
			var id = $(this).attr("id");
			var nPTZType = $(this).attr("data-uid") * 1;
			var c = gVar.CurChannel;
			if (c < 0) return;
			var bExist = 0;
			if ("editTour" == id) {
				gDevice.HidePlugin(true, function () {
					var nTourNumber = $("#InputTour").val() * 1;
					$("#InputLine").val(nTourNumber);
					MasklayerShow(1);
					$("#PointLoopDlg").show();
					gVar.bEditTour = true;
				});
			} else {
				var bSupportOnvif = true;
				var nTourIndex = $("#InputTour").val() * 1;
				var chn = (c >= gDevice.loginRsp.VideoInChannel) ? c - gDevice.loginRsp.VideoInChannel : c;
				var fName = (c >= gDevice.loginRsp.VideoInChannel) ? "bypass@Uart.PTZTour" : "Uart.PTZTour";
				GetIpcSoftVersion(c, function (strSoftVersion) {
					var verisonList = strSoftVersion.split(".");
					if (verisonList.length == 7) {
						var cOvifServer = verisonList[4];
						if (cOvifServer[3] == '0') {
							bSupportOnvif = false;
						}
					} else {
						bSupportOnvif = true;  //获取不到默认支持onvif
					}

					RfParamCall(function(b){
						if(b.Ret == 100 || (bSupportOnvif && b.Ret == 607)){
							if (b.Ret == 100) {
								var TourCfg = b[b.Name];
								if(TourCfg != null && fName.indexOf("bypass@") >= 0){
									TourCfg = TourCfg[0];
								}
								if (TourCfg == null) {
									ShowPaop("PTZ", lg.get("IDS_TOUR_NOT_EXIST"));
									return ;
								}
								if (TourCfg != null) {
									for (var i = 0;i < TourCfg.length;i++){
										if (nTourIndex == TourCfg[i].Id) {
											bExist = 1;
										}
									}
								}
								if (bExist != 1) {
									ShowPaop("PTZ", lg.get("IDS_TOUR_NOT_EXIST"));
									return ;
								}
							}
							gDevice.PTZcontrol(nPTZType, c, nTourIndex, 0, 0, function (a) {
								if (a.Ret == 100) {
									if (nPTZType == 28) {
										ShowPaop("PTZ", lg.get("IDS_START_TOUR_SUCCESS"));
									} else if (nPTZType == 29) {
										ShowPaop("PTZ", lg.get("IDS_STOP_TOUR_SUCCESS"));
									} else {
										ShowPaop("PTZ", lg.get("IDS_SAVE_SUCCESS"));
									}
								} else {
									if (nPTZType == 28) {
										ShowPaop("PTZ", lg.get("IDS_START_TOUR_FAILED"));
									} else if (nPTZType == 29) {
										ShowPaop("PTZ", lg.get("IDS_STOP_TOUR_FAILED"));
									} else {
										ShowPaop("PTZ", lg.get("IDS_SAVE_FAILED"));
									}
								}
							});
						} else {
							ShowPaop("PTZ", lg.get("IDS_TOUR_NOT_EXIST"));
						}
					}, pageTitle, fName, chn, WSMsgID.WsMsgID_CONFIG_GET, null, true);
				});
			}
		});
		$("#btnAddPoint, #btnClearPoint, #btnClearLine").click(function(){
			var id = $(this).attr("id");
			var ch=gVar.CurChannel;
			if (ch < 0) return;
			var nPTZType = -1;
			var bTourExist = 0;
			var bPresetExist = 0;
			var nTourIndex = $("#InputLine").val() * 1;
			var nPresetIndex = $("#SelPoint").val() * 1;
			var nInterval = $("#InputInterval").val() * 1;
			if ("btnAddPoint" == id) {
				nPTZType = 26;
				bTourExist = 1;
			} else if ("btnClearPoint" == id) {
				nPTZType = 27;
				bTourExist = 1;
			} else if ("btnClearLine" == id) {
				nPTZType = 30;
				bPresetExist = 1;
			} else {
				return;
			}
			var bSupportOnvif = true;
			var chn = (ch >= gDevice.loginRsp.VideoInChannel) ? ch - gDevice.loginRsp.VideoInChannel : ch;
			var fPresetName = (ch >= gDevice.loginRsp.VideoInChannel) ? "bypass@Uart.PTZPreset" : "Uart.PTZPreset";
			var fTourName = (ch >= gDevice.loginRsp.VideoInChannel) ? "bypass@Uart.PTZTour" : "Uart.PTZTour";
			GetIpcSoftVersion(ch, function (strSoftVersion) {
				var verisonList = strSoftVersion.split(".");
				if (verisonList.length == 7) {
					var cOvifServer = verisonList[4];
					if (cOvifServer[3] == '0') {
						bSupportOnvif = false;
					}
				} else {
					bSupportOnvif = true;  //获取不到默认支持onvif
				}

				if (nPTZType == 26 || nPTZType == 27){
					if(bIPC){
						RfParamCall(function(b){
							if (b.Ret == 100 || (bSupportOnvif && b.Ret == 607)) {
								if (b.Ret == 100) {
									var PresetCfg = b[b.Name];
									if(PresetCfg != null && fPresetName.indexOf("bypass@") >= 0){
										PresetCfg = PresetCfg[0];
									}
									if (PresetCfg == null) {
										ShowPaop("PTZ", lg.get("IDS_PRESET_NOT_EXIST"));
										return ;
									}
									for (var i = 0;i < PresetCfg.length;i++){
										if (nPresetIndex == PresetCfg[i].Id) {
											bPresetExist = 1;
										}
									}
									if (bPresetExist != 1) {
										ShowPaop("PTZ", lg.get("IDS_PRESET_NOT_EXIST"));
										return ;
									}
								}
								AddOrClearPointFunc();
							} else {
								ShowPaop("PTZ", lg.get("IDS_PRESET_NOT_EXIST"));
								return ;
							}
						}, pageTitle, fPresetName, chn, WSMsgID.WsMsgID_CONFIG_GET, null, true);
					}
					else{
						AddOrClearPointFunc();
					}
				} else {
					RfParamCall(function(b){
						if (b.Ret == 100 || (b.Ret == 607 && bSupportOnvif)) {
							if (b.Ret == 100) {
								var TourCfg = b[b.Name];
								if(TourCfg != null && fTourName.indexOf("bypass@") >= 0){
									TourCfg = TourCfg[0];
								}
								if (TourCfg == null) {
									ShowPaop("PTZ", lg.get("IDS_TOUR_NOT_EXIST"));
									return ;
								}
								if (TourCfg != null) {
									for (var i = 0;i < TourCfg.length;i++){
										if (nTourIndex == TourCfg[i].Id) {
											bTourExist = 1;
										}
									}
								}
								if (bTourExist != 1){
									ShowPaop("PTZ", lg.get("IDS_TOUR_NOT_EXIST"));
									return ;
								} 
							}
							gDevice.PTZcontrol(nPTZType, ch, nTourIndex, nPresetIndex, nInterval, function (a) {
								if (a.Ret == 100) {
									ShowPaop("PTZ", lg.get("IDS_SAVE_SUCCESS"));
									StopTourFunc();
								} else {
									ShowPaop("PTZ", lg.get("IDS_SAVE_FAILED"));
								}
							});
						} else {
							ShowPaop("PTZ", lg.get("IDS_TOUR_NOT_EXIST"));
							return ;
						}
					}, pageTitle, fTourName, chn, WSMsgID.WsMsgID_CONFIG_GET, null, true);
				}
			});

			function StopTourFunc(){
				gDevice.PTZcontrol(29, ch, nTourIndex, 0, 0, function (a) {					
				});
			}
			function AddOrClearPointFunc(){
				if (nPTZType == 26) {
					gDevice.PTZcontrol(nPTZType, ch, nTourIndex, nPresetIndex, nInterval, function (a) {
						if (a.Ret == 100) {
							ShowPaop("PTZ", lg.get("IDS_SAVE_SUCCESS"));
						} else {
							ShowPaop("PTZ", lg.get("IDS_SAVE_FAILED"));
						}
					});
				} else {
					RfParamCall(function(c){
						if (c.Ret == 100 || (bSupportOnvif && c.Ret == 607)) {
							if (c.Ret == 100) {
								var TourCfg = c[c.Name];
								if(TourCfg != null && fTourName.indexOf("bypass@") >= 0){
									TourCfg = TourCfg[0];
								}
								if (TourCfg == null) {
									ShowPaop("PTZ", lg.get("IDS_TOUR_NOT_EXIST"));
									return ;
								}
								if (TourCfg != null) {
									for (var i = 0;i < TourCfg.length;i++){
										if (nTourIndex == TourCfg[i].Id) {
											bTourExist = 1;
										}
									}
								}
								if (bTourExist != 1) {
									ShowPaop("PTZ", lg.get("IDS_TOUR_NOT_EXIST"));
									return ;
								}
							}
							gDevice.PTZcontrol(nPTZType, ch, nTourIndex, nPresetIndex, nInterval, function (a) {
								if (a.Ret == 100) {
									ShowPaop("PTZ", lg.get("IDS_SAVE_SUCCESS"));
								} else {
									ShowPaop("PTZ", lg.get("IDS_SAVE_FAILED"));
								}
							});
						} else {
							ShowPaop("PTZ", lg.get("IDS_TOUR_NOT_EXIST"));
							return ;
						}
					}, pageTitle, fTourName, chn, WSMsgID.WsMsgID_CONFIG_GET, null, true);
				}
			}
		});
		$("#SetDefault").click(function(){
			gDevice.SetColor(ColorType.ColorDefault, 64,function(a){
				$("#BrightnessSlider").slider("setValue", 64);
				$("#ContrastSlider").slider("setValue", 64);
				if(!WebCms.plugin.isLoaded){
					$("#SaturationSlider").slider("setValue", 128);
				}else{
					$("#SaturationSlider").slider("setValue", 64);
				}
				$("#HueSlider").slider("setValue", 64);
			});
		});
		$("#OnPreset,#DownPreset,#LeftPreset, #RightPreset,#ElectZoomIn,#ElectZoomOut, #ElectRedu").click(function(){
			var ch=gVar.CurChannel;
			if (ch < 0) return;
			var type = $(this).attr("data-val") * 1;
			var num = $("#Sel").val() * 1;
			gDevice.PTZElect(ch, type, num, function(){
			});
		}).mouseover(function(){ 
			var id = $(this).attr("data-val");
			if ("0" == id) {
				$("#Elect").css("background-position", "0px 0px");
			} else if ("1" == id) {
				$("#Elect").css("background-position", "-280px 0px");
			} else if ("2" == id) {
				$("#Elect").css("background-position", "0px -140px");
			} else if ("3" == id) {
				$("#Elect").css("background-position", "-140px 0px");
			} 
		}).mouseout(function(){
			$("#Elect").css("background-position", "-140px -140px");
		});
		$("#DelElePrePtBtn, #AddElePrePtBtn, #GoElePrePtBtn").click(function(){
			var ch=gVar.CurChannel;
			if (ch < 0) return;
			var type = $(this).attr("data-val") * 1;
			var num = $("#Sel").val() * 1;
			if (6 == type) {
				num = $("#InputEle").val() * 1;
			}else if (7 == type) {
				num = $("#InputEle").val() * 1;
			}else if (8 == type) {
				num = $("#InputEle").val() * 1;
			}
			gDevice.PTZElect(ch, type, num, function(a){
				if (a.Ret == 100) {
					if (type == 6) {
						var str = lg.get("IDS_DELETE_POINT") + " " + num + " " + lg.get("IDS_SUCCESS");
						ShowPaop("PTZ", str);
					} else if (type == 7) {
						var str = lg.get("IDS_ADD_POINT") + " " + num + " " + lg.get("IDS_SUCCESS");
						ShowPaop("PTZ", str);
					} else if (type == 8) {
						var str = lg.get("IDS_CALL_POINT") + " " + num + " " + lg.get("IDS_SUCCESS");
						ShowPaop("PTZ", str);
					} else {
						ShowPaop("PTZ", lg.get("IDS_SAVE_SUCCESS"));
					}
				} else {
					if (type == 6) {
						var str = lg.get("IDS_DELETE_POINT") + " " + num + " " + lg.get("IDS_FAILED");
						ShowPaop("PTZ", str);
					} else if (type == 7) {
						var str = lg.get("IDS_ADD_POINT") + " " + num + " " + lg.get("IDS_FAILED");
						ShowPaop("PTZ", str);
					} else if (type == 8) {
						var str = lg.get("IDS_CALL_POINT") + " " + num + " " + lg.get("IDS_FAILED");
						ShowPaop("PTZ", str);
					} else {
						ShowPaop("PTZ", lg.get("IDS_SAVE_FAILED"));
					}
				}
			});
		}).mouseover(function(){ 
			var id = $(this).attr("data-val");
			if ("6" == id) {
				$("#DelElePrePtBtn").css("background-position", "0px -40px");
			} else if ("7" == id) {
				$("#AddElePrePtBtn").css("background-position", "0px -20px");
			} else if ("8" == id) {
				$("#GoElePrePtBtn").css("background-position", "0px -0px");
			} 
		}).mouseout(function(){
			var id = $(this).attr("data-val");
			if ("6" == id) {
				$("#DelElePrePtBtn").css("background-position", "-44px -40px");
			} else if ("7" == id) {
				$("#AddElePrePtBtn").css("background-position", "44px -20px");
			} else if ("8" == id) {
				$("#GoElePrePtBtn").css("background-position", "44px -0px");
			} 
		});
		$("#Mirror,#Flip").click(function(){
			var cfg;
			if(gDevice.devType==devTypeEnum.DEV_IPC){
				cfg={ "Name": "Uart.PTZControlCmd" };
			}else{
				cfg={ "Name": "Uart.PTZControlCmd.[" + gVar.CurChannel + "]" };
			}
			cfg[cfg.Name]=[];
			var bMirror= $("#Mirror").prop("checked");
			var bFlip= $("#Flip").prop("checked");
			cfg[cfg.Name][0]={"MirrorOperation":bMirror,"FlipOperation": bFlip,"ModifyCfg":true};
			RfParamCall(function(b){
				if(b.Ret!=100){
					ShowPaop(pageTitle, lg.get("IDS_SAVE_FAILED"));
				}
			}, pageTitle, "Uart.PTZControlCmd", gVar.CurChannel, WSMsgID.WsMsgID_CONFIG_SET, cfg);
		});
		$(".MenuBtn").click(function(){ 
			var ch = gVar.CurChannel;
			if (ch < 0) return;
			var id = $(this).attr("data-val") * 1;
			var obj = {
				Name:"OPNetCoaxialCtrl",
				"OPNetCoaxialCtrl":{
					"Channel":ch,
					"cmdType":0,
					"cmd":id,
				}
			}
			RfParamCall(function(b){

			}, pageTitle, "OPNetCoaxialCtrl", ch, WSMsgID.WSMsgID_OSD_MENU, obj);
		}).mouseover(function(){ 
			var id = $(this).attr("data-val") * 1;
			if (OSDCmdEnum.OSDCMD_SET == id) {
				$("#OSDMenu").css("background-position", "-280px -140px");
			} else if (OSDCmdEnum.OSDCMD_UP == id) {
				$("#OSDMenu").css("background-position", "0px 0px");
			} else if (OSDCmdEnum.OSDCMD_DOWN == id) {
				$("#OSDMenu").css("background-position", "-280px 0px");
			} else if (OSDCmdEnum.OSDCMD_LEFT == id) {
				$("#OSDMenu").css("background-position", "0px -140px");
			} else if (OSDCmdEnum.OSDCMD_RIGHT == id) {
				$("#OSDMenu").css("background-position", "-140px 0px");
			} 
		}).mouseout(function(){
			$("#OSDMenu").css("background-position", "-140px -140px");
		});

		function LoginStartPreviewByDeviceType(){
			if(!WebCms.plugin.isLoaded) {
				MasklayerHide();
				return;
			}
			gDevice.CheckToolVersion(0,function(){
				var callbackFunc = function(){	
					MasklayerHide();
					// 后端设备登录后打开预览的时候，会显示 gVar.CurChannel通道的镜像翻转
					CheckFlipMirrorAfterPreview(function(){	
						gDevice.runAutoCheckWnd();				
					});
				}
				if(WebCms.plugin.autopreviewnum <= 0){
					callbackFunc();
					return;
				}
	
				// 登录后根据设备类型打开预览
				var channelNums = gDevice.loginRsp.ChannelNum;
				channelNums = channelNums > WebCms.plugin.autopreviewnum?WebCms.plugin.autopreviewnum:channelNums;
	
				var Stream = 0;
				var channels = 0;
				// 非IPC设备，或者 多通道IPC设备
				var bOpenMultiChn = !bIPC || (bIPC && channelNums > 1);
				if(!bOpenMultiChn){
					callbackFunc = PreviewPlayCallback;
				}else{
					channels = channelNums + 256;
					if(channelNums >= 8) Stream = 1;// 如果打开路数超过8路，默认辅码流
				}
				if(!bOpenMultiChn && GetFunAbility(gDevice.Ability.PreviewFunction.PreviewShowPedRule)){
					GetHumanCfg(0, HumanCfgCallBack, function(){
						gDevice.PreviewPlay(channels, Stream, PreviewPlayCallback);
					});
				}
				else{
					gDevice.PreviewPlay(channels, Stream, callbackFunc);
				}
			});
		}

		function GetHumanCfg(nIndex, callback1, callback2){
			RfParamCall(function(a){
				if(a.Ret == 100){
					preHumanCF[nIndex] = a;
					RfParamCall(function(a){
						if(a.Ret == 100){
							preHumanAT[0] = a[a.Name];	
							callback1(a, callback2);
						}
					}, pageTitle, "HumanRuleLimit", -1, WSMsgID.WsMsgID_ABILITY_GET);			
				}
			}, pageTitle, "Detect.HumanDetection", nIndex, WSMsgID.WsMsgID_CONFIG_GET);
		}
		function HumanCfgCallBack(ret, callback2){
			var rule =  ret[ret.Name].Enable && ret[ret.Name].ShowRule;
			var msg = {
				"MainType": 34,
				"SubType": 0,
				"Channel": 0,
				"ShowRule": rule,			
				"AreaNum": preHumanAT[0].AreaNum,
				"LineNum": preHumanAT[0].LineNum,
				"PedRule": ret[ret.Name].PedRule,					
			}
			gDevice.sendHumanCfg(msg, function(a){
				callback2();
			});
		}
		previewEventCallBack = previewEventProcess;
		var nShowMode = gDevice.GetWndShowMode(gDevice.loginRsp.ChannelNum);
		$(".CurWndModeBtn").css("background-position-y", "-"+nShowMode*28+"px");
		var offsetLeft = $("#PlayRatioTabBtn").offset().left - 10 + "px";		
		$("#videoRatioBar").css("margin-left", offsetLeft);
		$("#PlayRatioTabBtn").css("display", "none");

		var channelNums = gDevice.loginRsp.ChannelNum;
		channelNums = channelNums > WebCms.plugin.autopreviewnum?WebCms.plugin.autopreviewnum:channelNums;
		var mode = gDevice.GetWndShowMode(channelNums);
		$(".CurWndModeBtn").css("background-position-y", "-"+mode*28+"px");

		if (gDevice.devType == devTypeEnum.DEV_IPC) {
			$("#StreamBar").css("margin-left", "408px")
			$("#FlipMirrorSet").css("display", "");
			var name = "Uart.PTZControlCmd";
			GetFlipMirror(-1, function(o){
				if (o.Ret != 100) {
					$("#FlipMirrorSet").css("display", "none");
				} else {
					var cfg = o[o.Name][0];
					$("#Mirror").prop("checked", cfg && cfg.MirrorOperation);
					$("#Flip").prop("checked", cfg && cfg.FlipOperation);
				}
				if(bIPC && GetFunAbility(gDevice.Ability.PreviewFunction.PreviewShowPedRule)){									// 特定IPC产品使用
					LoginStartPreviewByDeviceType();
				}
				else{
					LoginStartPreviewByDeviceType();
				}
			});
		}else{
			$("#StreamBar").css("margin-left", "460px");
			$("#FlipMirrorSet").css("display", "none");
			LoginStartPreviewByDeviceType();
		}
	});
});