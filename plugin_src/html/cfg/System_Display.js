//# sourceURL=System_Display.js
$(function(){
	var chnIndex = -1;
	var DialogType = -1;
	var ssDigitChStatus;
	var ssRemoteDevice;
	var BlindCapability;
	var VideoWidget;
	var ChnName;
	var GUISet;
	var VgaRes;
	var VideoOut;
	var bShowVagRes = false;
	var pts = [];
	var nCoverNum = 4;
	var bNeedReboot = false;
	var bNextPage = false; 
	var OSDInfo;
	var nOSDNum = 4;
	var bShowOSD = GetFunAbility(gDevice.Ability.OtherFunction.SupportOSDInfo);
	var pageTitle = $("#System_Display").text();
	var inValidChannelName = [];
	var bIPC = gDevice.devType == devTypeEnum.DEV_IPC ? true : false;
	var bDigAreaCoverage = GetFunAbility(gDevice.Ability.OtherFunction.SupportDigitalChannelAreaCoverage)
	var chnArry = [];
	var digBlindCapability = new Array;
	var digVideoWidget = new Array;
	var bGetDig = new Array;
	var arrTimeTitlePos = [];
	var arrChnTitlePos = [];
	var arrOsdTitlePos = [];
	var arrCoverWndPos = [];

	$("#AlarmGlint").css("display","none");
	$("#LabAlarmGlint").css("display","none");
	$("#QRoceEn").css("display","none");
	$("#LaQRoceEn").css("display","none");
	$("#ChanWindowGrid").css("display","none");
	$("#LaChanWindowGrid").css("display","none");
	$("#BitRateEn").css("display","none");
	$("#LaBitRateEn").css("display","none");
	
	var SettingHtml =
		'	<div id="TimeChannelSet" style="display:none; width:600px; height:400px;' +
		'		background-color:#000;">\n' +
		'		<img id="Title_Img" src="" style="position:absolute;' +
		'		width:600px; height:400px;" />\n' +
		'		<div id="SettingAreaBox" style="position:absolute;">\n' +
		'			<div class="MoveArea" id="SettingArea">\n' +
		'				<div id="Channel_Title" class="MovBlock">' + lg.get("IDS_CHANNEL") +
		'				</div>\n' +
		'				<div id="Time_Title" class="MovBlock">' + lg.get("IDS_TIME") +
		'				</div>\n' +
		'				<div id="MoveBlockOsd" class="MovBlock">OSD</div>\n' +
		'			</div>\n' +
		'		</div>\n' +
		'	</div>\n' +
			
		'	<div id="ChannelNameSet" style="display:none;">\n' +
		'	</div>\n' +
			
		'	<div id="VidoeShelterSet" style="display:none; width:600px; height:400px;' +
		'		background-color:#000;">\n' +
		'		<img id="Cover_Img" src="" style="position:absolute;' +
		'		width:600px; height:400px;" />\n' +
		'		<canvas id="ShelterCvs" width="600" height="400" ' +
		'			style=" position:absolute;"></canvas>\n' +
		'	</div>\n' +
			
		'	<div id="OSDSet" style="display:none;">\n' +
		'	</div>\n' +

		'	<div class="btn_box" style="padding-left:150px;">\n' +
		'		<button type="button" class="btn" id="DlgBtnNext" ' +
		'			style="display:none;">Next</button>\n' +
		'		<button class="btn" id="DlgBtnOk">' + lg.get("IDS_OK") +
		'		</button>\n' +
		'		<button class="btn btn_cancle" id="DlgBtnCancel">' + lg.get("IDS_CANCEL") + 
		'		</button>\n' +
		'	</div>';
	
	function UpdateCoverChn(){
		$("#CoverChan").innerHTML = "";
		$("#CoverChan").divBox({
			number: nCoverNum,
			bkColor: gVar.skin_mColor,
			borderColor: gVar.skin_bColor,
			ExType: true,
			parentLev: 1,
			activeTextClr: "#FFFFFF",
			bDownID:"CoverChan"
		});	
	}
	function UpdateVGARes() {
		if (bShowVagRes && isObject(VgaRes)) {
			var cfg = VgaRes[VgaRes.Name];
			$("#SelVideoRes").empty();
			for (var i=0; i < cfg.length; i++) {
				$("#SelVideoRes").append('<option value="'+cfg[i]+'">'+cfg[i]+'</option>')
			}
		}
	}
	function ShowChnData() {
		$("#CfgBox .check-btn-box").css("display", "none");
		var cfg;
		if(chnIndex < gDevice.loginRsp.VideoInChannel){
			cfg = VideoWidget[VideoWidget.Name][chnIndex];
			$("#CfgBox .check-btn-box").css("display", "");
			$("#TimeTitle2").prop("checked", cfg.TimeTitleAttribute.EncodeBlend);
			$("#ChannelTitle2").prop("checked", cfg.ChannelTitleAttribute.EncodeBlend);
			nCoverNum = BlindCapability[BlindCapability.Name].BlindCoverNum;
		}else{
			var nDig = chnIndex - gDevice.loginRsp.VideoInChannel
			cfg = digVideoWidget[nDig][digVideoWidget[nDig].Name][0];
			nCoverNum = digBlindCapability[nDig].BlindCoverNum;
		}
		
		var CoverDisplay = nCoverNum > 0 ? "" : "none";
		$("#CoverBox").css("display", CoverDisplay);
		UpdateCoverChn();
		
		var nNum = 0;
		$("#CoverChan > div").css({
			"background-color": "transparent",
			color: "inherit"
		});
		$("#CoverChan > div").each(function (i) {
			if (i < nCoverNum) {
				if (cfg.Covers[i].EncodeBlend) {
					$(this).mousedown().mouseup();
					nNum++;
				}
			}
		});
		if (nNum > 0) {
			$("#SwitchCover").removeClass("selectDisable").addClass("selectEnable").attr("data", "1");
			$("#table_cover_set").css("display", "");
			$("#coverSpace").css("display", "none");
		}else {
			$("#SwitchCover").removeClass("selectEnable").addClass("selectDisable").attr("data", "0");
			$("#table_cover_set").css("display", "none");
			$("#coverSpace").css("display", "");
		}
	
		if (bShowOSD) {
			var OSDCfg = OSDInfo[OSDInfo.Name].OSDInfo[chnIndex];
			$("#OSD").prop("checked", OSDCfg.OSDInfoWidget.EncodeBlend);
			for (var i = 0; i < nOSDNum; ++i) {
				$("#OSDInput" + (i+1)).val(OSDCfg.Info[i]);
			}
		}
		if(typeof g_visibleSetTimeChnOSD != "undefined" && g_visibleSetTimeChnOSD * 1 == 0
			&& gDevice.loginRsp.HardWare == "XM530V200_X3-WR-V-BL_16M")
		{
			$("#TimeChannelOSDBox").css("display", "none");
			$("#OSDBox").css("display", "none");
		}
	}
	function ShowData() {
		bNeedReboot = false;
		UpdateVGARes();
		if (bShowVagRes) {
			var VideoOutCfg = VideoOut[VideoOut.Name];
			var strVideoRes = VideoOutCfg.Mode.Width + "*" + VideoOutCfg.Mode.Height;
			$("#SelVideoRes").val(strVideoRes);
		}
		var VGAResDisplay = bShowVagRes ? "" : "none";
		$("#table_Res").css("display", VGAResDisplay);
		
		var SetCfg = GUISet[GUISet.Name];
		$("#TimeTitle").prop("checked", SetCfg.TimeTitleEnable);
		$("#ChannelTitle").prop("checked", SetCfg.ChannelTitleEnable);
		$("#RecordStatus").prop("checked", SetCfg.RecordStateEnable);
		$("#AlarmStatus").prop("checked", SetCfg.AlarmStateEnable);
		//$("#ResistTwitter").prop("checked", SetCfg.Deflick);

		$("#AlarmGlint").prop("checked", SetCfg.AlarmGlint);
		$("#ChanWindowGrid").prop("checked", SetCfg.ChanWindowGridEnable);
		$("#QRoceEn").prop("checked", SetCfg.QRcodeEnable);
		$("#BitRateEn").prop("checked", SetCfg.ChanStateBitRateEnable);

		if (SetCfg.WindowAlpha == -1) {
			$("#table_translider").css("display", "none");
		}else {
			$("#TranSlider").slider("setValue", SetCfg.WindowAlpha);
		}

		var ChanDisplay = chnIndex >= 0 ? "" : "none";
		$("#CfgBox").css("display", ChanDisplay);
		$("#table_chnName_set").css("display", ChanDisplay);
		
		if (GetFunAbility(gDevice.Ability.OtherFunction.AlterDigitalName)) {
			$("#table_chnName_set").css("display", "");
		}
		
		if(typeof g_visibleSetTimeChnOSD != "undefined" && g_visibleSetTimeChnOSD * 1 == 0
			&& gDevice.loginRsp.HardWare == "XM530V200_X3-WR-V-BL_16M")
		{
			$("#TimeChannelOSDBox").css("display", "none");
			$("#OSDBox").css("display", "none");
		}
		
		if(chnIndex >= 0){
			if(chnIndex >= gDevice.loginRsp.VideoInChannel){
				GetDigitalChannelAreaCoverage(chnIndex - gDevice.loginRsp.VideoInChannel);
			}else{
				ShowChnData();
				MasklayerHide();
			}
		}else{
			MasklayerHide();
		}
	}
	function GetDigitalChannelAreaCoverage(nDig){
		if(!bGetDig[nDig]){
			var fName = "bypass@BlindCapability";
			RfParamCall(function(a){
				if(a.Ret == 100){
					digBlindCapability[nDig] = a[a.Name];
				}else{
					digBlindCapability[nDig] = { "BlindCoverNum" : 4 };
				}
				fName = "bypass@AVEnc.VideoWidget";
				RfParamCall(function(a){
					digVideoWidget[nDig] = a;
					bGetDig[nDig] = true;
					ShowChnData();
					MasklayerHide();
				}, pageTitle, fName, nDig, WSMsgID.WsMsgID_CONFIG_GET);
			}, pageTitle, fName, nDig, WSMsgID.WSMsgID_CHANNEL_ABILITY_GET_REQ, null, true);
		}else{
			ShowChnData();
			MasklayerHide();
		}
	}
	function GetOtherCfg() {
		RfParamCall(function(a){
			GUISet = a;
			if (gDevice.devType != devTypeEnum.DEV_IPC) {
				RfParamCall(function(a){
					VgaRes = a;
					if(isObject(a.VGAresolution)){
						RfParamCall(function(a){
							VideoOut = a;
							bShowVagRes = true;
							ShowData();
						}, pageTitle, "fVideo.VideoOut", -1, WSMsgID.WsMsgID_CONFIG_GET);
					}else{
						ShowData();
					}
				}, pageTitle, "VGAresolution", -1, WSMsgID.WsMsgID_ABILITY_GET);
			}else {
				ShowData();
			}
		}, pageTitle, "fVideo.GUISet", -1, WSMsgID.WsMsgID_CONFIG_GET);
	}
	function GetOSDCfg(){
		if (bShowOSD) {
			RfParamCall(function(a){
				OSDInfo = a;
				if (a != null) {
					RfParamCall(function(b){
						if (b.Ret == 100) {
							var n = b[b.Name];
							if (n != null) {
								nOSDNum = b[b.Name]["SupportOSDInfo"]["MaxLine"];
								if (nOSDNum <= 0 || nOSDNum > 8){
									nOSDNum = 4;
								}
							} else {
								nOSDNum = 4;
							}
						} else {
							nOSDNum = 4; 
						} 
						GetOtherCfg();
					}, pageTitle, "Ability.OSDShow", -1, WSMsgID.WsMsgID_CONFIG_GET, "", true)
				} else {
					GetOtherCfg();
				}
			}, pageTitle, "fVideo.OSDInfo", -1, WSMsgID.WsMsgID_CONFIG_GET);
		}else {
			GetOtherCfg();
		}
	}
	function GetChannelTitleCfg() {
		if (gDevice.loginRsp.ChannelNum > 0) {
			RfParamCall(function(a){
				ChnName = a;
				GetOSDCfg();
			}, pageTitle, "ChannelTitle", -1, WSMsgID.WsMsgID_CONFIG_CHANNELTILE_GET);
		}else {
			GetOSDCfg();
		}
	}
	function GetVideoWidgetCfg() {
		if (gDevice.loginRsp.VideoInChannel > 0) {
			RfParamCall(function(a){
				VideoWidget = a;
				GetChannelTitleCfg();
			}, pageTitle, "AVEnc.VideoWidget", -1, WSMsgID.WsMsgID_CONFIG_GET);
		}else {
			GetChannelTitleCfg();
		}
	}
	function LoadConifg() {
		RfParamCall(function(a){
			BlindCapability = a;
			nCoverNum = BlindCapability[BlindCapability.Name].BlindCoverNum;
			GetVideoWidgetCfg();
		}, pageTitle, "BlindCapability", -1, WSMsgID.WsMsgID_ABILITY_GET);
	}
	function InitChannel() {
		var chnArry = [];
		$("#SelChannel").empty();
		for(var i = 0; i < gDevice.loginRsp.VideoInChannel; i++){
			$("#SelChannel").append('<option value="'+i+'">'+(i+1)+'</option>');
			chnArry.push(i);
		}
		
		if(gDevice.loginRsp.DigChannel > 0 && !bIPC){
			RfParamCall(function(a){
				ssDigitChStatus = a;
				RfParamCall(function(b){
					ssRemoteDevice = b;
					if(bDigAreaCoverage){
						for (var i = gDevice.loginRsp.VideoInChannel; i < gDevice.loginRsp.ChannelNum; i++) {	
							var m = i - gDevice.loginRsp.VideoInChannel;
							bGetDig[m] = false;
							digBlindCapability[m] =  null;
							digVideoWidget[m] = null;
							if (ssDigitChStatus[ssDigitChStatus.Name][m].Status != "Connected") {
									continue;
							}
							var nIndex = ssRemoteDevice[ssRemoteDevice.Name][m].SingleConnId - 1;
							if	(ssRemoteDevice[ssRemoteDevice.Name][m].ConnType == "SINGLE" && nIndex >= 0
								&& ssRemoteDevice[ssRemoteDevice.Name][m].Decoder[nIndex].Protocol == "TCP"){
								if(chnIndex == -1){
									chnIndex = i;
								}
								chnArry.push(i);
								var dataHtml = '<option value="' + i + '">' + gDevice.getChannelName(i) + '</option>';
								$("#SelChannel").append(dataHtml);
							}
						}
						if(chnArry.length > 0){
							if($.inArray(chnIndex, chnArry) < 0){
								chnIndex = chnArry[0];
							}
							$("#SelChannel").val(chnIndex);
						}
						LoadConifg();
					}else{
						if(chnArry.length > 0){
							if($.inArray(chnIndex, chnArry) < 0){
								chnIndex = chnArry[0];
							}
							$("#SelChannel").val(chnIndex);
						}
						LoadConifg();
					}
				}, pageTitle, "NetWork.RemoteDeviceV3", -1, WSMsgID.WsMsgID_CONFIG_GET);
			}, pageTitle, "NetWork.ChnStatus", -1, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			if($.inArray(chnIndex, chnArry) < 0){
				chnIndex = chnArry[0];
			}
			$("#SelChannel").val(chnIndex);
			LoadConifg();
		}
	}
	function SaveChnData() {
		if (chnIndex >= 0) {
			var cfg;
			if(chnIndex < gDevice.loginRsp.VideoInChannel){
				cfg = VideoWidget[VideoWidget.Name][chnIndex];
				cfg.TimeTitleAttribute.EncodeBlend = $("#TimeTitle2").prop("checked");
				cfg.ChannelTitleAttribute.EncodeBlend = $("#ChannelTitle2").prop("checked");
			}else{
				var nDig = chnIndex - gDevice.loginRsp.VideoInChannel;
				cfg = digVideoWidget[nDig][digVideoWidget[nDig].Name][0];
			}
			
			if ($("#SwitchCover").attr("data") == "0") {
				for (var i=0; i < nCoverNum; i++) {
					cfg.Covers[i].EncodeBlend = false;
				}
			}else {
				var color = gVar.skin_mColor;
				$("#CoverChan > div").each(function (i) {
					if (i < nCoverNum) {
						bCheckd = ($(this).css("background-color").replace(/\s/g, "") == color.replace(/\s/g, "") && $(this).css("display") != "none") ? true : false;
						cfg.Covers[i].EncodeBlend = bCheckd;
					}
				});
			}
		}
		if (bShowOSD) {
			var OSDCfg = OSDInfo[OSDInfo.Name].OSDInfo[chnIndex];
			OSDCfg.OSDInfoWidget.EncodeBlend = $("#OSD").prop("checked");
			OSDCfg.OSDInfoWidget.PreviewBlend = $("#OSD").prop("checked");
		}
	}
	function SaveOSDInfo(){
		if (bShowOSD) {
			var nHeight = 24;
			var nLineNum = 0;
			var arrText = [];
			var nTxtWidth = 0;
			for (var i = 0; i < nOSDNum; i++) {
				var tempTxt = OSDInfo[OSDInfo.Name].OSDInfo[chnIndex].Info[i];
				if (tempTxt == "") {
					continue;
				}
				arrText[nLineNum] = tempTxt;
				++nLineNum;
				var nTempTxtWidth = GetTextWidth(tempTxt, nHeight);
				if (nTempTxtWidth > nTxtWidth) {
					nTxtWidth = nTempTxtWidth;
				}
			}
			var nWidth = ((nTxtWidth + 31) >> 5) << 5;
			// 适当调整宽度
			if(nTxtWidth > 64){
				var modVal = nTxtWidth % 32;
				if(modVal < 16 && modVal >= 8){
					nWidth += 8;
				}
				else if(modVal < 24 && modVal >= 16){
					nWidth += 16;
				}
				else if(modVal < 32 && modVal >= 24 || modVal == 0){
					nWidth += 24;
				}
			}
			var pDotBuf = new Uint8Array(nWidth*nLineNum*nHeight/8);		//点阵数组
			GetTextDot(nWidth, nHeight, nLineNum, arrText, pDotBuf);
			gDevice.SendBinaryData(BinaryType.TypeOSDDot, nWidth, nHeight, nLineNum, pDotBuf, function(a){
				if (a.Ret == 603) {
					bNeedReboot = true;
				}
				RfParamCall(function(a) {
					if (a.Ret == 603) {
						bNeedReboot = true;
					}
					if (bNeedReboot) {
						RebootDev(pageTitle, lg.get("IDS_CONFIRM_RESTART"), true);
					} else {
						ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
					}
				}, pageTitle, "fVideo.OSDInfo", -1, WSMsgID.WsMsgID_CONFIG_SET, OSDInfo);
			});
		}else {
			if (bNeedReboot) {
				RebootDev(pageTitle, lg.get("IDS_CONFIRM_RESTART"), true);
			} else {
				ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
			}
		}
	}
	function SaveChannelTitleDot(){
		if (bIPC) {
			var nWidth, nHeight;
			if (GetFunAbility(gDevice.Ability.OtherFunction.SupportSmallChnTitleFont)){
				nHeight = 18;
			}else{
				nHeight = 24;
			}
			var arrText = [];
			arrText[0] = ChnName[ChnName.Name][0];
			var nTxtWidth = GetTextWidth(arrText[0], nHeight);
			if (nTxtWidth == -1) return -1;
			nWidth = ((nTxtWidth + 31) >> 5) << 5;
			// 适当调整宽度
			if(nTxtWidth > 64){
				var modVal = nTxtWidth % 32;
				if(modVal < 16 && modVal >= 8){
					nWidth += 8;
				}
				else if(modVal < 24 && modVal >= 16){
					nWidth += 16;
				}
				else if(modVal < 32 && modVal >= 24 || modVal == 0){
					nWidth += 24;
				}
			}
			var pDotBuf = new Uint8Array(nWidth*nHeight/8);	
			GetTextDot(nWidth, nHeight, 1, arrText, pDotBuf);
			gDevice.SendBinaryData(BinaryType.TypeChannelTitleDot, nWidth, nHeight, 1, pDotBuf, function(a){
				if (a.Ret == 603) {
					bNeedReboot = true;
				}
				SaveOSDInfo();
			});
		}else {
			SaveOSDInfo();
		}
	}
	function SaveChannelTitleCfg(){
		RfParamCall(function(a) {
			if (a.Ret == 603) {
				bNeedReboot = true;
			}
			SaveChannelTitleDot();
		}, pageTitle, "ChannelTitle", -1, WSMsgID.WsMsgID_CONFIG_CHANNELTILE_SET, ChnName);
	}
	function SaveDigitalVideoWidgetCfg(nDig){
		if(bDigAreaCoverage){
			if(nDig < gDevice.loginRsp.DigChannel){
				if(bGetDig[nDig]){
					var fName = "bypass@AVEnc.VideoWidget";
					RfParamCall(function (a){
						if(a.Ret == 603){
							bReboot = true;
						}
						SaveDigitalVideoWidgetCfg(nDig + 1);
					}, pageTitle, fName, nDig, WSMsgID.WsMsgID_CONFIG_SET, digVideoWidget[nDig]);
				}else{
					SaveDigitalVideoWidgetCfg(nDig + 1);
				}
			}else{
				SaveChannelTitleCfg();
			}
		}else{
			SaveChannelTitleCfg();
		}
	}
	function SaveVideoWidgetCfg(){
		if (gDevice.loginRsp.VideoInChannel > 0) {
			RfParamCall(function(a) {
				if (a.Ret == 603) {
					bNeedReboot = true;
				}
				SaveDigitalVideoWidgetCfg(0);
			}, pageTitle, "AVEnc.VideoWidget", -1, WSMsgID.WsMsgID_CONFIG_SET, VideoWidget);
		}else {
			SaveDigitalVideoWidgetCfg(0);
		}
	}
	function SaveData() {
		var SetCfg = GUISet[GUISet.Name];
		SetCfg.TimeTitleEnable = $("#TimeTitle").prop("checked");
		SetCfg.ChannelTitleEnable = $("#ChannelTitle").prop("checked");
		SetCfg.RecordStateEnable = $("#RecordStatus").prop("checked");
		SetCfg.AlarmStateEnable = $("#AlarmStatus").prop("checked");
		//SetCfg.Deflick = $("#ResistTwitter").prop("checked");

		SetCfg.AlarmGlint = $("#AlarmGlint").prop("checked");
		SetCfg.ChanWindowGridEnable = $("#ChanWindowGrid").prop("checked");
		SetCfg.QRcodeEnable = $("#QRoceEn").prop("checked");
		SetCfg.ChanStateBitRateEnable = $("#BitRateEn").prop("checked");

		if (SetCfg.WindowAlpha != -1) {
			SetCfg.WindowAlpha = $("#TranSlider").slider("getValue") *1;
		}
		if (bShowVagRes) {
			var cfg = VideoOut[VideoOut.Name];
			var strRes = $("#SelVideoRes").find("option:selected").text();
			if (strRes.split('*')[0] *1 >= 3840) {
				//提示语
			}
			cfg.Mode.Width = strRes.split('*')[0] *1;
			cfg.Mode.Height = strRes.split('*')[1] *1;
		}
		SaveChnData();
		RfParamCall(function(a){
			if (a.Ret == 603) {
				bNeedReboot = true;
			}	
			if (bShowVagRes) {
				RfParamCall(function(a){
					if (a.Ret == 603) {
						bNeedReboot = true;
					}
					SaveVideoWidgetCfg();
				}, pageTitle, "fVideo.VideoOut", -1, WSMsgID.WsMsgID_CONFIG_SET, VideoOut);
			}else {
				SaveVideoWidgetCfg();
			}	
		}, pageTitle, "fVideo.GUISet", -1, WSMsgID.WsMsgID_CONFIG_SET, GUISet);
	};
	function GetTextDot(nWidth, nLineHeight, nLineNum, arrText, arrData){
		var nHeight = nLineHeight * nLineNum;
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		document.body.appendChild(canvas);
		canvas.width = nWidth;
		canvas.height = nHeight;
		ctx.clearRect(0, 0, nWidth, nHeight);
		ctx.font = "normal " + nLineHeight + "px 宋体";
		if(gVar.lg == "Russian"){
			ctx.font = "normal " + nLineHeight + "px Arial";
		}
		ctx.fillStyle = "#000";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		var yPos = nLineHeight/2;
		for(var i =0 ; i< nLineNum;i++){
			ctx.fillText(arrText[i], nWidth / 2, yPos);
			yPos += nLineHeight;
		}

		var imgData = null;
		if(nWidth > 0 && nHeight > 0)
		{
			imgData = ctx.getImageData(0, 0, nWidth, nHeight);
		}
		
		for (var y = 0; y < nHeight; y++) {
			var val = 0;
			for (var x = 0; x < nWidth; x++) { 
				var nPos = (y * nWidth + x) * 4 + 3;
				//alpha
				if(imgData.data[nPos] > 0) { 
					var nB = parseInt(x / 8);
					var by = x % 8;
					val = arrData[nWidth/8*y+nB];
					arrData[nWidth/8*y+nB] = (val | (0x80 >> by));
				} 
			} 
		}
		document.body.removeChild(canvas);
	}
	function GetTextWidth(txt, fontSize){
		var nRet = -1;
		var span = document.createElement("span");
		span.innerText = txt;
		span.style.fontSize = fontSize + "px";
		span.style.fontWeight = "normal";
		span.style.fontFamily = "宋体";
		if(gVar.lg == "Russian"){
			span.style.fontFamily = "Arial";
		}
		document.body.appendChild(span);
		nRet =  span.offsetWidth;
		document.body.removeChild(span);
		return nRet;
	}
	function SaveSetting(){
		if (DialogType == 0) {
			SaveChnName();
			if(inValidChannelName.length > 0){
				var errorChannel = "";
				for(var i = 0; i < inValidChannelName.length; i++){
					errorChannel += lg.get("Channel") + (inValidChannelName[i] + 1);
					errorChannel += (i == inValidChannelName.length - 1) ? ', ' : "、";
				}
				ShowPaop(pageTitle, errorChannel + lg.get("IDS_DISP_ChannelNameInvalid"));
				return;
			}
		}else if(DialogType == 1){
			var ShelterWidth = $("#ShelterCvs").width();
			var ShelterHeight = $("#ShelterCvs").height(); 
			for(var i = 0; i < nCoverNum; i++){
				var cover;	
				if(chnIndex < gDevice.loginRsp.VideoInChannel){
					cover = VideoWidget[VideoWidget.Name][chnIndex].Covers[i];
				}else{
					var nDig = chnIndex - gDevice.loginRsp.VideoInChannel;
					cover = digVideoWidget[nDig][digVideoWidget[nDig].Name][0].Covers[i];
				}				

				// 若操作过，则使用客户端计算坐标，否则使用原配置坐标
				if(typeof arrCoverWndPos[chnIndex] != "undefined" && arrCoverWndPos[chnIndex][i].bMoveLeft)
				{
					cover.RelativePos[0] = parseInt(pts[i][0].x*8192/ShelterWidth);
					if(cover.RelativePos[0] > 8192) cover.RelativePos[0]=8192;
				}
				else
				{
					cover.RelativePos[0] = 	arrCoverWndPos[chnIndex][i].posX1;
				}
				if(typeof arrCoverWndPos[chnIndex] != "undefined" && arrCoverWndPos[chnIndex][i].bMoveTop)
				{
					cover.RelativePos[1] = parseInt(pts[i][0].y*8192/ShelterHeight);
					if(cover.RelativePos[1] > 8192) cover.RelativePos[1]=8192;
				}
				else
				{
					cover.RelativePos[1] = 	arrCoverWndPos[chnIndex][i].posY1;
				}
				if(typeof arrCoverWndPos[chnIndex] != "undefined" && arrCoverWndPos[chnIndex][i].bMoveRight)
				{
					cover.RelativePos[2] = parseInt(pts[i][2].x*8192/ShelterWidth);
					if(cover.RelativePos[2] > 8192) cover.RelativePos[2]=8192;
				}
				else
				{
					cover.RelativePos[2] = 	arrCoverWndPos[chnIndex][i].posX2;
				}
				if(typeof arrCoverWndPos[chnIndex] != "undefined" && arrCoverWndPos[chnIndex][i].bMoveBottom)
				{
					cover.RelativePos[3] = parseInt(pts[i][2].y*8192/ShelterHeight);
					if(cover.RelativePos[3] > 8192) cover.RelativePos[3]=8192;
				}
				else
				{
					cover.RelativePos[3] = 	arrCoverWndPos[chnIndex][i].posY2;
				}
				
				var temp;	//确保left < right,top < bottom
				if(cover.RelativePos[0] >= cover.RelativePos[2]){
					temp = cover.RelativePos[0];
					cover.RelativePos[0] = cover.RelativePos[2];
					cover.RelativePos[2] = temp;
				}
				if(cover.RelativePos[1] >= cover.RelativePos[3]){
					temp = cover.RelativePos[1];
					cover.RelativePos[1] = cover.RelativePos[3];
					cover.RelativePos[3] = temp;
				}
			}
		}else if (DialogType == 2) {
			var AreaWidth = $("#SettingArea").width();
			var AreaHeight = $("#SettingArea").height();
			var OffsetX = $("#SettingArea").position().left;
			var OffsetY = $("#SettingArea").position().top;

			var ChanPosX = $("#Channel_Title").position().left - OffsetX;
			var ChanPosY = $("#Channel_Title").position().top - OffsetY;
			var TimePosX = $("#Time_Title").position().left - OffsetX;
			var TimePosY = $("#Time_Title").position().top - OffsetY;
			var OsdPosX = $("#MoveBlockOsd").position().left - OffsetX;
			var OsdPosY = $("#MoveBlockOsd").position().top - OffsetY;
			
			var cfg;
			if(chnIndex < gDevice.loginRsp.VideoInChannel){
				cfg = VideoWidget[VideoWidget.Name][chnIndex];
			}else{
				var nDig = chnIndex - gDevice.loginRsp.VideoInChannel;
				cfg = digVideoWidget[nDig][digVideoWidget[nDig].Name][0];
			}
			// 若操作过，则使用客户端计算坐标，否则使用原配置坐标
			if(typeof arrChnTitlePos[chnIndex] != "undefined" && arrChnTitlePos[chnIndex].bMove)
			{
				cfg.ChannelTitleAttribute.RelativePos[0] = parseInt(ChanPosX*8192.0/AreaWidth);
				cfg.ChannelTitleAttribute.RelativePos[1] = parseInt(ChanPosY*8192.0/AreaHeight);
			}
			else
			{
				cfg.ChannelTitleAttribute.RelativePos[0] = arrChnTitlePos[chnIndex].posX;
				cfg.ChannelTitleAttribute.RelativePos[1] = arrChnTitlePos[chnIndex].posY;
			}
			if(typeof arrTimeTitlePos[chnIndex] != "undefined" && arrTimeTitlePos[chnIndex].bMove)
			{
				cfg.TimeTitleAttribute.RelativePos[0] = parseInt(TimePosX*8192.0/AreaWidth);
				cfg.TimeTitleAttribute.RelativePos[1] = parseInt(TimePosY*8192.0/AreaHeight);
			}
			else
			{
				cfg.TimeTitleAttribute.RelativePos[0] = arrTimeTitlePos[chnIndex].posX;
				cfg.TimeTitleAttribute.RelativePos[1] = arrTimeTitlePos[chnIndex].posY;
			}
			if(bShowOSD && typeof OSDInfo != 'undefined'){
				if(typeof arrOsdTitlePos[chnIndex] != "undefined" && arrOsdTitlePos[chnIndex].bMove)
				{
					OSDInfo[OSDInfo.Name].OSDInfo[chnIndex].OSDInfoWidget.RelativePos[0] = parseInt(OsdPosX*8192.0/AreaWidth);
					OSDInfo[OSDInfo.Name].OSDInfo[chnIndex].OSDInfoWidget.RelativePos[1] = parseInt(OsdPosY*8192.0/AreaHeight);
				}
				else
				{
					OSDInfo[OSDInfo.Name].OSDInfo[chnIndex].OSDInfoWidget.RelativePos[0] = arrOsdTitlePos[chnIndex].posX;
					OSDInfo[OSDInfo.Name].OSDInfo[chnIndex].OSDInfoWidget.RelativePos[1] = arrOsdTitlePos[chnIndex].posY;
				}
			}
		}else if(DialogType == 3){
			var OSDCfg = OSDInfo[OSDInfo.Name].OSDInfo[chnIndex];
			var jqInput = $("#OSDSet").find("input");
			for (var j = 0; j < nOSDNum; j++) {
				OSDCfg.Info[j] = $(jqInput[j]).val();
			}
		}
		
		DialogType = -1;
		closeDialog();
	};
	function TitlePos(){
		var AreaWidth = $("#SettingArea").width();
		var AreaHeight = $("#SettingArea").height();
		var OffsetX = $("#SettingArea").position().left;
		var OffsetY = $("#SettingArea").position().top;
		var cfg = VideoWidget[VideoWidget.Name][chnIndex];
		var ids = [$("#Channel_Title"), $("#Time_Title"),$("#MoveBlockOsd")];
		var ids_x = [OffsetX, OffsetX, OffsetX];
		var ids_y = [OffsetY, OffsetY, OffsetY];

		if($("#ChannelTitle2").prop("checked")){
			ids_x[0] = cfg.ChannelTitleAttribute.RelativePos[0]/8192.0*AreaWidth;
			ids_y[0] = cfg.ChannelTitleAttribute.RelativePos[1]/8192.0*AreaHeight;
			arrChnTitlePos[chnIndex] = {
				posX : cfg.ChannelTitleAttribute.RelativePos[0],
				posY : cfg.ChannelTitleAttribute.RelativePos[1],
				bMove : false
			}
			$("#Channel_Title").css("display", "");
		}else{
			$("#Channel_Title").css("display", "none");
		}
		if($("#TimeTitle2").prop("checked")){
			ids_x[1] = cfg.TimeTitleAttribute.RelativePos[0]/8192.0*AreaWidth;
			ids_y[1] = cfg.TimeTitleAttribute.RelativePos[1]/8192.0*AreaHeight;
			arrTimeTitlePos[chnIndex] = {
				posX : cfg.TimeTitleAttribute.RelativePos[0],
				posY : cfg.TimeTitleAttribute.RelativePos[1],
				bMove : false
			}
			$("#Time_Title").css("display", "");
		}else{
			$("#Time_Title").css("display", "none");
		}
		if($("#OSD").prop("checked") && bShowOSD && typeof OSDInfo != 'undefined') {
			ids_x[2] = OSDInfo[OSDInfo.Name].OSDInfo[chnIndex].OSDInfoWidget.RelativePos[0]/8192.0*AreaWidth;
			ids_y[2] = OSDInfo[OSDInfo.Name].OSDInfo[chnIndex].OSDInfoWidget.RelativePos[1]/8192.0*AreaHeight;
			arrOsdTitlePos[chnIndex] = {
				posX : OSDInfo[OSDInfo.Name].OSDInfo[chnIndex].OSDInfoWidget.RelativePos[0],
				posY : OSDInfo[OSDInfo.Name].OSDInfo[chnIndex].OSDInfoWidget.RelativePos[1],
				bMove : false
			}
			$("#MoveBlockOsd").css("display", "");
		}else{
			$("#MoveBlockOsd").css("display", "none");
		}
		
		var ChanW = $("#Channel_Title").width();
		var ChanH = $("#Channel_Title").height();
		if (ids_x[0] + ChanW > AreaWidth) {
			ids_x[0] = AreaWidth - ChanW;
		}
		if (ids_y[0] + ChanH > AreaHeight) {
			ids_y[0] = AreaHeight - ChanH;
		}
		$("#Channel_Title").css("width", ChanW + "px").css("height", ChanH + "px");
		var TimeW = $("#Time_Title").width();
		var TimeH = $("#Time_Title").height();
		if (ids_x[1] + TimeW > AreaWidth) {
			ids_x[1] = AreaWidth - TimeW;
		}
		if (ids_y[1] + TimeH > AreaHeight) {
			ids_y[1] = AreaHeight - TimeH;
		}
		$("#Time_Title").css("width", TimeW + "px").css("height", TimeH + "px");
		var OsdW = $("#MoveBlockOsd").width();
		var OsdH = $("#MoveBlockOsd").height();
		if (ids_x[2] + OsdW > AreaWidth) {
			ids_x[2] = AreaWidth - OsdW;
		}
		if (ids_y[2] + OsdH > AreaHeight) {
			ids_y[2] = AreaHeight - OsdH;
		}
		$("#MoveBlockOsd").css("width", OsdW + "px").css("height", OsdH + "px");
		var ids_w = [ChanW, TimeW, OsdW];
		var ids_h = [ChanH, TimeH, OsdH];
		var beginOffset = {x: 0, y: 0};
		$.each(ids, function(i, obj) {
			obj.unbind();
			obj.mousedown(function(e) {
				beginOffset = {x: e.offsetX, y: e.offsetY};
				BeginMove(i, e, obj);
			});
			obj.css({  
				'left' : ids_x[i] + OffsetX, 
				'top' : ids_y[i] + OffsetY
			});
		});
		function BeginMove(i, e, obj) {
			var posX = obj.position().left;
			var posY = obj.position().top;
			var beginX = e.pageX;
			var beginY = e.pageY;
			$("#Config_dialog .content_details").unbind();
			$("#Config_dialog .content_details").bind("mousemove", function(ev) {
				if(obj.attr("id") == "Channel_Title")
				{
					arrChnTitlePos[chnIndex].bMove = true;
				}
				else if(obj.attr("id") == "Time_Title")
				{
					arrTimeTitlePos[chnIndex].bMove = true;
				}
				else if(obj.attr("id") == "MoveBlockOsd")
				{
					arrOsdTitlePos[chnIndex].bMove = true;
				}
				var endX = ev.pageX;
				var endY = ev.pageY;
				var newPosX = endX - beginX + posX;
				var newPosY = endY - beginY + posY;
				var MaxMoveX = AreaWidth - ids_w[i] + OffsetX - 1;
				var MaxMoveY = AreaHeight - ids_h[i] + OffsetY - 1;
				if((newPosX >= OffsetX && newPosX < MaxMoveX) && (newPosY >= OffsetY && newPosY < MaxMoveY)){
					obj.css({"left" : newPosX, "top" : newPosY});
				}else {
					var str = "newPoint: x:" + newPosX + ", y: " + newPosY + "mouse: offsetX: " + 
						ev.offsetX + ", offsetY: " + ev.offsetY;
					DebugStringEvent(str);
					
					if(newPosX <= OffsetX - 25 - beginOffset.x 
					|| newPosX >= MaxMoveX + 23 + (ids_w[i] -beginOffset.x) 
					|| newPosY <= OffsetY - 20 - beginOffset.y
					|| newPosY >= MaxMoveY + 70 + (ids_h[i] -beginOffset.y)){
						$(this).unbind("mousemove");
					}
					
					if(newPosX < OffsetX){
						newPosX = OffsetX;
					}else if(newPosX >= MaxMoveX){
						newPosX = MaxMoveX;
					}		
					if(newPosY < OffsetY){
						newPosY = OffsetY;
					}else if(newPosY >= MaxMoveY){
						newPosY = MaxMoveY;
					}				
					obj.css({"left" : newPosX, "top" : newPosY});				
				}
			}).mouseup(function(e){
				$(this).unbind("mousemove");
			}).mouseleave(function(e){
				$(this).unbind()
			});
		}
		
		$("#DlgBtnOk").click(function(){
			SaveSetting();
		});
	}
	function ShowCovers() {
		var ShelterWidth = $("#ShelterCvs").width();
		var ShelterHeight = $("#ShelterCvs").height();
		var Offset = $("#ShelterCvs").offset();
		var bMouseDown = false;
		var pointNum = 4;
		var nState = -1;		//鼠标左键按下的位置：1-选择边框,2-选择顶点, 3-选择矩形内部
		var nPointId = -1;		//按顺序左下右上
		var nSelect = -1;
		var bShow = [];
		var bSelView = [];		//Cover区域是否被选中
		pts = [];
		initPts();
		function  initPts(){
			var Covers;
			if(chnIndex < gDevice.loginRsp.VideoInChannel){
				Covers = VideoWidget[VideoWidget.Name][chnIndex].Covers;
			}else{
				var nDig = chnIndex - gDevice.loginRsp.VideoInChannel
				Covers = digVideoWidget[nDig][digVideoWidget[nDig].Name][0].Covers;
			}
			for(var i = 0; i < nCoverNum; i++){
				pts.push([]);		
				var _left = parseInt(Covers[i].RelativePos[0]*ShelterWidth/8192);
				var _top = parseInt(Covers[i].RelativePos[1]*ShelterHeight/8192);
				var _right = parseInt(Covers[i].RelativePos[2]*ShelterWidth/8192);
				var _bottom = parseInt(Covers[i].RelativePos[3]*ShelterHeight/8192);
				pts[i].push({'x': _left, 'y': _top});
				pts[i].push({'x': _left, 'y': _bottom});
				pts[i].push({'x': _right, 'y': _bottom});
				pts[i].push({'x': _right, 'y': _top});
				bSelView[i] = false;
				// 坐上点和右下点坐标， 两点决定一个矩形, 存储初始状态
				if(typeof arrCoverWndPos[chnIndex] == "undefined")
				{
					arrCoverWndPos[chnIndex] = [];
				}
				arrCoverWndPos[chnIndex][i] = {
					posX1 : Covers[i].RelativePos[0],
					posY1 : Covers[i].RelativePos[1],
					posX2 : Covers[i].RelativePos[2],
					posY2 : Covers[i].RelativePos[3],
					bMoveLeft: false,			// 左边移动，修改X1
					bMoveTop: false,			// 上边移动，修改Y1
					bMoveRight: false,			// 右边移动，修改X2
					bMoveBottom: false			// 下边移动，修改Y2
				}
			}

			var color = gVar.skin_mColor;
			$("#CoverChan > div").each(function (i) {
				if (i < nCoverNum) {
					bCheckd = ($(this).css("background-color").replace(/\s/g, "") == color.replace(/\s/g, "") && $(this).css("display") != "none") ? true : false;
					bShow[i] = bCheckd;
				}
			});			
		}
		$("#ShelterCvs").unbind();
		$("#ShelterCvs").mousedown(function(e){
			if (e.button ==0) {		//鼠标左键
				var beginPos = {"x": e.pageX - Offset.left, "y": e.pageY-Offset.top};
				nState = -1;
				nPointId = -1;
				nSelect = -1;
				for(var i = 0; i < nCoverNum; i++){
					if(bShow[i] && CheckSelect(beginPos, i)){
						nSelect = i;
						bSelView[nSelect] = !bSelView[nSelect];
						drawPolygon();					
						break;
					}
				}
				
				if(nSelect >= 0){
					$(this).bind("mousemove",function(ev){
						var endPos = {"x": ev.pageX - Offset.left, "y":ev.pageY - Offset.top};
						var points = pts[nSelect];
						
						if(nState == 2){
							// 点击顶点
						}else if(nState == 3){
							// 对应区域覆盖框有移动的操作，标记该框，坐标计算以客户端计算为准，否则保持原有配置返回
							arrCoverWndPos[chnIndex][nSelect].bMoveLeft = true;
							arrCoverWndPos[chnIndex][nSelect].bMoveTop = true;
							arrCoverWndPos[chnIndex][nSelect].bMoveRight = true;
							arrCoverWndPos[chnIndex][nSelect].bMoveBottom = true;

							var temp = cloneObj(points);
							var arr = [];
							for(var i=0; i < 4; i++){
								temp[i].x += endPos.x - beginPos.x;
								temp[i].y += endPos.y - beginPos.y;
								if(!CheckPoint(temp[i])){
									arr.push(i);
								}
							}
							
							if(arr.length == 2){
								for(var i = 0; i < 4; i++){
									if(i != arr[0] && i != arr[1]){
										if(temp[arr[0]].x < 0){
											temp[i].x = temp[i].x - temp[arr[0]].x;
										}
										if(temp[arr[0]].x > ShelterWidth){
											temp[i].x = temp[i].x - (temp[arr[0]].x - ShelterWidth);
										}
										if(temp[arr[0]].y < 0){
											temp[i].y = temp[i].y - temp[arr[0]].y;
										}
										if(temp[arr[0]].y > ShelterHeight){
											temp[i].y = temp[i].y - (temp[arr[0]].y - ShelterHeight);
										}
									}
								}
								
								if(temp[arr[0]].x < 0){
									temp[arr[0]].x = 0;
									temp[arr[1]].x = 0;
								}
								if(temp[arr[0]].x > ShelterWidth){
									temp[arr[0]].x = ShelterWidth;
									temp[arr[1]].x = ShelterWidth;
								}
								if(temp[arr[0]].y < 0){
									temp[arr[0]].y = 0;
									temp[arr[1]].y = 0;
								}
								if(temp[arr[0]].y > ShelterHeight){
									temp[arr[0]].y = ShelterHeight;
									temp[arr[1]].y = ShelterHeight;
								}
							}else if(arr.length > 2){
								return;
							}
								
							for(var i=0; i < 4; i++){
								points[i].x = temp[i].x;
								points[i].y = temp[i].y;
							}
							beginPos = endPos;
						}else if(nState == 1){
							// 点击边框
							var temp = cloneObj(points);
							// 点击边nPointID: 0:左边  1:下边  2:右边  3:上边
							// points点 0:x1y1  1:x1y2  2:x2y2  3:x2y1
							var nNextPointId = nPointId + 1;
							if (nPointId == pointNum - 1) {
								nNextPointId = 0;
							}
							if (temp[nNextPointId].x == points[nPointId].x) {
								temp[nNextPointId].x = temp[nPointId].x += endPos.x - beginPos.x;
							} 
							if(temp[nNextPointId].y == points[nPointId].y) {
								temp[nNextPointId].y = temp[nPointId].y += endPos.y - beginPos.y;
							}
							if (!CheckPoint(temp[nPointId]) || !CheckPoint(temp[nNextPointId])) {
								return;
							}
							points[nPointId].x = temp[nPointId].x;
							points[nPointId].y = temp[nPointId].y;
							points[nNextPointId].x = temp[nNextPointId].x;
							points[nNextPointId].y = temp[nNextPointId].y;
							beginPos = endPos;
							if(nPointId == 0)		// 移动左边
							{
								arrCoverWndPos[chnIndex][nSelect].bMoveLeft = true;			// 修改 x1
							}
							else if(nPointId == 1)	// 移动下边
							{
								arrCoverWndPos[chnIndex][nSelect].bMoveBottom = true;		// 修改 y2
							}
							else if(nPointId == 2)	// 移动右边
							{
								arrCoverWndPos[chnIndex][nSelect].bMoveRight = true;		// 修改 x2
							}
							else if(nPointId == 3)	// 移动上边
							{
								arrCoverWndPos[chnIndex][nSelect].bMoveTop = true;			// 修改 y1
							}
						}
						drawPolygon();
					}); 
				}
			}
		}).mouseup(function(e){
			$(this).unbind("mousemove");
		}).mouseout(function(e){
			$(this).unbind("mousemove");
		});
		drawPolygon();

		function CheckPoint(pt){
			if(pt.x >= 0 && pt.x <= ShelterWidth && pt.y >=0 && pt.y <= ShelterHeight) {
				return true;
			}
			return false;
		}

		function CheckSelect(pt, nIndex){
			var bFinded = false;
			var points = pts[nIndex];
			for ( var n = 0; n < pointNum; n ++ ){
				// 查找mousedown触发坐标和矩形四顶点是否在一定误差内吻合，判断是否点击某一顶点
				if(Math.abs(pt.x - points[n].x) < 5 && Math.abs(pt.y - points[n].y) < 5){
					bFinded = true;
					nState = 2;
					nPointId = n;
				}
			}
			if(nState == -1){
				var lna = 0;
				var lnb = 0;
				var lnc = 0;
				for (var j = 0; j < pointNum; j++){
					var k = j+1 < pointNum ? j+1 : 0;
					lna = (points[j].x-points[k].x) * (points[j].x-points[k].x) + 
							(points[j].y-points[k].y) * (points[j].y-points[k].y);
					lnb = (pt.x-points[k].x) * (pt.x-points[k].x) + 
							(pt.y-points[k].y) * (pt.y-points[k].y);
					lnc = (pt.x-points[j].x) * (pt.x-points[j].x) + 
							(pt.y-points[j].y) * (pt.y-points[j].y);

					if ((Math.sqrt(lnb) + Math.sqrt(lnc)) < (Math.sqrt(lna)+1)){
						nState=1;
						nPointId=j;
						bFinded = true;
					}
				}
			}
			if(nState == -1){
				if(PtInPolygon(pt, points, pointNum)){
					bFinded = true;
					nState=3;
				}
			}
			return bFinded;
		}
		
		function drawPolygon(){
			var cvs = document.getElementById("ShelterCvs");
			var ctx = cvs.getContext('2d');
			ctx.clearRect(0 , 0, ShelterWidth, ShelterHeight);
			var points; 
			for (var j = 0; j < nCoverNum; j++){
				if(!bShow[j]) continue;
				if(bSelView[j]){
					ctx.strokeStyle = "#ffff00";
				}else{
					ctx.strokeStyle = "#f00";
				}
				points = pts[j];
				ctx.beginPath();
				ctx.moveTo(points[0].x, points[0].y);
				var txtPointX = points[0].x;
				var txtPointY = points[0].y;
				for(var i =1;i< pointNum;i++){
					ctx.lineTo(points[i].x, points[i].y);
					txtPointX = Math.min(txtPointX, points[i].x);
					txtPointY = Math.min(txtPointY, points[i].y);
				}
				ctx.lineTo(points[0].x, points[0].y);
				// 设置颜色
				ctx.fillStyle = "#fff";
				ctx.fillText(j+1, txtPointX, txtPointY + 10);
				ctx.stroke();
			}
		}
		$("#DlgBtnOk").click(function(){
			SaveSetting();
		});
	}
	function PageChannelLayout(bChannel, echannel){
		$("#ChannelNameSet .form-group").css("display", "none");
		var jqGroup = $("#ChannelNameSet .form-group");
		for (var j = bChannel; j <= echannel; j++) {
			$(jqGroup[j]).css("display", "");
			if(bIPC){
				continue;
			}
			if (j >= gDevice.loginRsp.VideoInChannel) {
				var jqInput = $(jqGroup[j]).find("input");
				var m = j - gDevice.loginRsp.VideoInChannel;
				if (ssDigitChStatus[ssDigitChStatus.Name][m].Status == "Connected" && ssRemoteDevice[ssRemoteDevice.Name][m].ConnType == "SINGLE") {
					$(jqInput).css("opacity", "1").prop("disabled", false);
				}else {
					$(jqInput).css("opacity", "0.2").prop("disabled", true);
				}
			}
		}
	}
	function ShowChnName(){
		bNextPage = false;
		$("#ChannelNameSet").empty();
		for(var i = 0; i < gDevice.loginRsp.ChannelNum; i++){
			$("#ChannelNameSet").append('<div class="form-group"><label>'+lg.get("IDS_CHANNEL")+" "+(i+1)+
				'</label><input type="text" class="inputTxt"'+'id="chnName'+i+'"'+'></div>');
				$("#chnName"+i).val(ChnName[ChnName.Name][i]);
		}
		if(gDevice.loginRsp.ChannelNum <= 32){
			$("#DlgBtnNext").css("display", "none");
			PageChannelLayout(0, gDevice.loginRsp.ChannelNum - 1);
		}else{
			$("#DlgBtnNext").css("display", "");
			DlgBtnNext.innerHTML = lg.get("IDS_NEXT_PAGE");
			PageChannelLayout(0, 31);
		}	
	}
	function SaveChnName(){
		var jqInput = $("#ChannelNameSet .form-group").find("input");
		inValidChannelName = [];
		for (var j = 0, i = 0; j < gDevice.loginRsp.ChannelNum; j++) {
			var itemChannelName = $(jqInput[j]).val();
			if(itemChannelName.indexOf('"') != -1 || itemChannelName.indexOf('\\') != -1){
				inValidChannelName[i++] = j;
				continue;
			}
			ChnName[ChnName.Name][j] = itemChannelName;
		}
	}
	function ShowOSD(){
		bNextPage = false;
		$("#OSDSet").empty();
		var OSDCfg = OSDInfo[OSDInfo.Name].OSDInfo[chnIndex];
		for(var i = 0; i < nOSDNum; i++){
			$("#OSDSet").append('<div class="cfg_row"><input class="inputTxt" value="'+ OSDCfg.Info[i] +'"></div>');
		}	
	}
	$(function(){
		$(".check-btn-box").find("label").css("width", "130px");
		if(bIPC){
			$("#DVRSet_BOX").css("display", "none");
		}
		$("#TranSlider").slider({width: 250, minValue: 128, maxValue: 255, mouseupCallback: null});
		var RecCheckDisplay = GetFunAbility(gDevice.Ability.OtherFunction.NOHDDRECORD) ? "none" : "";
		$("#SpanRecord").css("display", RecCheckDisplay);
		if (bShowOSD) {
			$("#SpanOSD").css("display", "");
			$("#OSDBox").css("display", "");
			$("#OSDInputBox").css("display", "none");
			$("#BtnOSDDiv").css("display", "");
		}
		$(document).off('click', '#DlgBtnNext'); 
		$(document).on('click', '#DlgBtnNext', function(){
			if(!bNextPage){
				PageChannelLayout(32, gDevice.loginRsp.ChannelNum - 1);
				DlgBtnNext.innerHTML = lg.get("IDS_PRE_PAGE");
				bNextPage = true;
			}else{
				PageChannelLayout(0, 31);
				DlgBtnNext.innerHTML = lg.get("IDS_NEXT_PAGE");
				bNextPage = false;
			}
		});
		$("#SelChannel").change(function(){
			var nSel = $(this).val() *1;
			if (nSel != chnIndex) {
				SaveChnData();
				chnIndex = nSel;
				if(chnIndex >= gDevice.loginRsp.VideoInChannel){
					GetDigitalChannelAreaCoverage(chnIndex - gDevice.loginRsp.VideoInChannel);
				}else{
					ShowChnData();
				}
			}
		});
		$("#BtnChanNameSet").click(function(){
			$("#Config_dialog .content_container").html(SettingHtml);
			DialogType = 0;
			if(bIPC && gDevice.loginRsp.ChannelNum == 1){
				$("#Config_dialog").css("width", "375px");
				$("#Config_dialog .btn_box").css("padding-left", "65px");
			}else{
				$("#Config_dialog").css("width", "600px");
				$("#Config_dialog .btn_box").css("padding-left", "150px");
			}
			
			$("#ChannelNameSet").css("display", "");
			$("#TimeChannelSet, #VidoeShelterSet, #OSDSet").css("display", "none");
			Config_Title.innerHTML = lg.get("IDS_DISP_ChanNameSet");
			
			if(gDevice.loginRsp.ChannelNum <= 32){
				SetWndTop("#Config_dialog", 60);
			}else{
				SetWndTop("#Config_dialog");
			}
			MasklayerShow(1);
			ShowChnName();
			$("#Config_dialog").show(function(){
				function ChannelNameLimit(obj){
					var total = 0, charCode, len;
					for (len = obj.str.length; obj.limit < len; obj.limit++) {
						charCode = obj.str.charCodeAt(obj.limit);
						if (0x00000000 <= charCode && charCode <= 0x0000007f) {
							total += 1;
						} else if (0x00000080 <= charCode && charCode <= 0x000007FF) {
							total += 2;
						} else if (0x00000800 <= charCode && charCode <= 0x0000FFFF) {
							total += 3;
						} else if (0x00010000 <= charCode && charCode <= 0x001FFFFF) {
							total += 4;
						} else if (0x00200000 <= charCode && charCode <= 0x03FFFFFF) {
							total += 5;
						} else if (0x04000000 <= charCode && charCode <= 0x7FFFFFFF) {
							total += 6;
						}
						if(total>=64){
							return false;
						}
					}
					return true;
				}

				$("#ChannelNameSet .form-group input").unbind().bind('input propertychange',function(){
					var obj={
						"str":str=$(this).val(),
						"limit":0
					}
					if(!ChannelNameLimit(obj)){
						obj.str=obj.str.substring(0,obj.limit);
					}
					$(this).val(obj.str);

				})
			});
			$("#DlgBtnOk").click(function(){
				SaveSetting();
			});
		});
		$("#SwitchCover").click(function() {
			if ($(this).attr("data") == "0") {
				$("#SwitchCover").removeClass("selectDisable").addClass("selectEnable").attr("data", "1");
				$("#table_cover_set").css("display", "");
				$("#coverSpace").css("display", "none");
			}else {
				$("#SwitchCover").removeClass("selectEnable").addClass("selectDisable").attr("data", "0");
				$("#table_cover_set").css("display", "none");
				$("#coverSpace").css("display", "");
			}
		})
		$("#BtnCoverSet").click(function(){
			$("#Config_dialog .content_container").html(SettingHtml);
			DialogType = 1;
			$("#Config_dialog").css("width", "650px");
			$("#Config_dialog .btn_box").css("padding-left", "175px");
			SetWndTop("#Config_dialog");
			
			$("#VidoeShelterSet").css("display", "");
			$("#ChannelNameSet, #TimeChannelSet, #OSDSet").css("display", "none");
			Config_Title.innerHTML = lg.get("IDS_DISP_VideoShelterSet");
			
			var bSelectChan = false;
			var color = gVar.skin_mColor;
			$("#CoverChan > div").each(function (i) {
				if (i < nCoverNum) {
					bSelectChan = ($(this).css("background-color").replace(/\s/g, "") == color.replace(/\s/g, "") && $(this).css("display") != "none") ? true : false;
					if(bSelectChan){
						return false;
					}
				}
			});
			if (!bSelectChan) {
				ShowPaop(pageTitle, lg.get("IDS_DISP_SelectVideoChn"));
				return;
			}else{
				MasklayerShow();
				function showPic(a){
					MasklayerShow(1);
					if(a== ""){
						$("#Cover_Img").css("display", "none");
					}else{
						$("#Cover_Img").attr("src", a);
						$("#Cover_Img").css("display", "");
					}
					$("#Config_dialog").show(function(){
						ShowCovers();
					});
				}
				gDevice.ParamCapture(chnIndex, function(a){
					var b = "";
					if(a.Ret == WEB_ERROR.ERR_SUCESS){
						if(WebCms.plugin.isLoaded){
							b = gVar.captureUrl;
							var timeStamp = (new Date).getTime();
							b = b + "?update=" + timeStamp;
						}else{
							b = a.url;
						}
					}
					showPic(b);
				});
			}			
		});
		$("#BtnChannelSet").click(function(){
			$("#Config_dialog .content_container").html(SettingHtml);
			if(!$("#TimeTitle2").prop("checked") && !$("#ChannelTitle2").prop("checked")
			&& !$("#OSD").prop("checked")){
				return;
			}
			
			DialogType = 2;
			$("#Config_dialog").css("width", "650px");
			$("#Config_dialog .btn_box").css("padding-left", "175px");
			SetWndTop("#Config_dialog");
			
			$("#TimeChannelSet").css("display", "");
			$("#ChannelNameSet, #VidoeShelterSet, #OSDSet").css("display", "none");
			Config_Title.innerHTML = lg.get("IDS_DISP_TimeChanSet");
			
			MasklayerShow();
			function showPic(a){
				MasklayerShow(1);
				if(a == ""){
					$("#Cover_Img").css("display", "none");
				}else{
					$("#Title_Img").attr("src", a);
					$("#Title_Img").css("display", "");
				}
				$("#Config_dialog").show("normal", function(){
					TitlePos();
				});
			}
			gDevice.ParamCapture(chnIndex, function(a){
				var b = "";
				if(a.Ret == WEB_ERROR.ERR_SUCESS){
					if(WebCms.plugin.isLoaded){
						b = gVar.captureUrl;
						var timeStamp = (new Date).getTime();
						b = b + "?update=" + timeStamp;
					}else{
						b = a.url;
					}
				}
				showPic(b);
			});
		});
		$("#BtnSave").click(function(){
			SaveData();
		});
		$("#BtnRefresh").click(function(){
			InitChannel();
		});
		$("#BtnChanOSDSet").click(function(){
			$("#Config_dialog .content_container").html(SettingHtml);
			DialogType = 3;
			$("#Config_dialog").css("width", "355px");
			$("#Config_dialog .btn_box").css("padding-left", "55px");
			SetWndTop("#Config_dialog", 60);
			$("#OSDSet").css("display", "");
			$("#ChannelNameSet, #TimeChannelSet, #VidoeShelterSet").css("display", "none");
			Config_Title.innerHTML = lg.get("IDS_DISP_OSDInfo");
			MasklayerShow(1);
			$("#Config_dialog").show(function(){
				ShowOSD();
			});
			
			$("#DlgBtnOk").click(function(){
				SaveSetting();
			});
		});
		InitChannel();
	});
});