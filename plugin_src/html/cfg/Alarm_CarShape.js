//# sourceURL=Alarm_CarShape.js
$(function () {
    var chnIndex = -1;
    var color = gVar.skin_mColor;
    var bColor = gVar.skin_bColor;
    var pageTitle = $("#Alarm_CarShape").text();   
	var carShapeCfg = new Array;
	var copyCfg = null;
	var bCopy = false;
	var bGet = new Array;
	var arrCh = new Array;
	var carShapeFunc;
	var bRecord = !GetFunAbility(gDevice.Ability.OtherFunction.NOHDDRECORD);
	var bSnap = (GetFunAbility(gDevice.Ability.EncodeFunction.SnapStream) || GetFunAbility(gDevice.Ability.OtherFunction.SupportSnapSchedule));
	var bSupportAlarmVoiceTipInterval = GetFunAbility(gDevice.Ability.OtherFunction.SupportAlarmVoiceTipInterval);
	var bIPC = gDevice.devType == devTypeEnum.DEV_IPC ? true : false;
	var bNoMulityAlarmLink = GetFunAbility(gDevice.Ability.OtherFunction.NoSupportMulityAlarmLink);
	var bSupportVehicleShowTrack = false;
	var bSupportVehicleVoiceTip = false;
	var chnArry = [];
	function OnClickedEnable(){
		var j = $("#CS_Enable").attr("data") * 1;
		DivBox(j, "#DivBoxAll");
		if(j){
			$("#DivBoxAll .MaskDiv").css("display", "none");
		}else{
			$("#DivBoxAll .MaskDiv").css("display", "block");
		}
	}
	function ShowData(nIndex) {
		$(".rightEx > div[name='all']").css({
			"background-color": "transparent",
			color: "inherit"
		});
		var cfgName = carShapeCfg[nIndex].Name;
		var eventHandler = carShapeCfg[nIndex][cfgName].EventHandler;
		var btnFlag = carShapeCfg[nIndex][cfgName].Enable?1:0
		$("#CS_Enable").attr("data", btnFlag);
		$("#CS_SendEmail").prop("checked", eventHandler.MailEnable);
		$("#CS_ShowMessage").prop("checked", eventHandler.TipEnable);       
		$("#CS_Phone").prop("checked", eventHandler.MessageEnable);
		$("#CS_FTP").prop("checked", eventHandler.FTPEnable);
		$("#CS_WriteLog").prop("checked", eventHandler.LogEnable);
		$("#CS_ShowTrackBox").css("display", bSupportVehicleShowTrack ? "" : "none");
		$("#CS_VoiceTipBox").css("display", bSupportVehicleVoiceTip ? "" : "none");
		$("#CS_ShowTrack").prop("checked", carShapeCfg[nIndex][cfgName].ShowTrack);
		$("#CS_VoiceTip").prop("checked", eventHandler.VoiceEnable);
		if(bNoMulityAlarmLink){
			$("#CSSnap").prop("checked", eventHandler.SnapEnable);
		}else{
			ShowMask("#CS_SnapChannelDiv > div[name!='all']", eventHandler.SnapShotMask);
		}

		if(gDevice.loginRsp.AlarmOutChannel > 0){
			$("#CS_AODelay").val(eventHandler.AlarmOutLatch);
			ShowMask("#CS_AOChannelDiv > div[name!='all']", eventHandler.AlarmOutMask);
		}	
		if(bRecord){
			$("#CSRecordDelay").val(eventHandler.RecordLatch);
			if(bNoMulityAlarmLink){
				$("#CSRecord").prop("checked", eventHandler.RecordEnable);
			}else{
				ShowMask("#CS_RecChannelDiv > div[name!='all']", eventHandler.RecordMask);
			}
		}
		if(bNoMulityAlarmLink){
			$("#CSTour").prop("checked", eventHandler.TourEnable);
		}else{
			ShowMask("#CS_TourChannelDiv > div[name!='all']", eventHandler.TourMask);
		}
		if(bSupportAlarmVoiceTipInterval){
			$("#CS_VoiceInterval").val(eventHandler.VoiceTipInterval);
		}
		SetAlarmToneType(eventHandler,"#CS_AbAlarmToneType","#CS_AbAlarmTone");
		ChangeVoiceType("#CS_AbAlarmToneType","#CS_alarmAndCustom");
		OnClickedEnable();
		InitButton2();
		return true;
    }
	function GetFaceCfg(nIndex){
		if(!bGet[nIndex]){
			RfParamCall(function(a,b){
				carShapeCfg[nIndex] = a;
				var timeSection = carShapeCfg[nIndex][carShapeCfg[nIndex].Name].EventHandler.TimeSection;
				for(var i = 0; i < timeSection.length; i++){
					if(isObject(timeSection[i])){
						for(var j = 0; j < timeSection[i].length ; j++){
							if(timeSection[i][j] == ""){
								timeSection[i][j] = "0 00:00:00-00:00:00";
							}
						}
					}
				}
				carShapeCfg[nIndex][carShapeCfg[nIndex].Name].EventHandler.TimeSection = timeSection;
				bGet[nIndex] = true;
				ShowData(nIndex);
				MasklayerHide();
			}, pageTitle, "Detect.CarShapeDetection", nIndex, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			ShowData(nIndex);
		}
	}

	function NVRGetIPCSystemFunction(index, callback)
	{
		if(index < chnArry.length)
		{
			GetIpcSystemFunction(chnArry[index], function(a){
				if(typeof a != "undefined")
				{
					carShapeFunc[chnArry[index]] = a.AlarmFunction.CarShapeDetection;
				}
				NVRGetIPCSystemFunction(index + 1, callback);
			});
		}
		else
		{
			callback();
		}
	}

	function InitChannel() {
		arrCh = [];
		bGet = [];
		carShapeCfg = [];
		copyCfg = null;
		bCopy = false;
		chnArry = [];
		carShapeFunc = [];
		$("#CS_ChannelMask").empty();
		var dataHtml = '';
		var j;
		for (j = 0; j < gDevice.loginRsp.VideoInChannel; j++) {
			if(chnIndex == -1) chnIndex = j;
			carShapeCfg[j] = null;
			bGet[j] = false;
			arrCh.push(j);
			dataHtml += '<option value="' + j + '">' + gDevice.getChannelName(j) + '</option>';
		}

		if(gDevice.loginRsp.DigChannel > 0 && !bIPC){
			RfParamCall(function(a){
				var ssDigitChStatus = a[a.Name];
				RfParamCall(function(b){
					var ssRemoteDevice = b[b.Name];
					for (var i = gDevice.loginRsp.VideoInChannel; i < gDevice.loginRsp.ChannelNum; i++) {
						var m = i - gDevice.loginRsp.VideoInChannel;
						if (ssDigitChStatus[m].Status != "Connected") {
								continue;
						}
						var nIndex = ssRemoteDevice[m].SingleConnId - 1;
						if	(ssRemoteDevice[m].ConnType == "SINGLE" && nIndex >= 0
							&& ssRemoteDevice[m].Decoder[nIndex].Protocol == "TCP"){
							if(chnIndex == -1){
								chnIndex = i;
							}
							chnArry.push(i);
						}
					}
					if(chnArry.length > 0){
						for (j = gDevice.loginRsp.VideoInChannel; j < gDevice.loginRsp.ChannelNum; j++) {
							carShapeCfg[j] = null;
							bGet[j] = false;
							carShapeFunc[j] = false;
						}

						NVRGetIPCSystemFunction(0, function(){
							for (j = gDevice.loginRsp.VideoInChannel; j < gDevice.loginRsp.ChannelNum; j++) {
								if(carShapeFunc[j]){
									if(chnIndex == -1) chnIndex = j;
									arrCh.push(j);
									dataHtml += '<option value="' + j + '">' + gDevice.getChannelName(j) + '</option>';
								}
							}

							if(arrCh.length > 1){
								dataHtml += '<option value="' + gDevice.loginRsp.ChannelNum + '">' + lg.get("IDS_CFG_ALL") + '</option>';
							}
							$("#CS_ChannelMask").append(dataHtml);
							if(arrCh.length > 0) {	
								var nIndex = chnIndex;
								if(chnIndex >= gDevice.loginRsp.VideoInChannel){
									if($.inArray(chnIndex, arrCh) >= 0){
										nIndex = chnIndex
										$("#CS_ChannelMask").val(nIndex);
									}else{
										nIndex = arrCh[0];
										if(chnIndex == gDevice.loginRsp.ChannelNum && arrCh.length > 1){
											$("#CS_ChannelMask").val(gDevice.loginRsp.ChannelNum);
										}else{
											$("#CS_ChannelMask").val(arrCh[0]);
											chnIndex = arrCh[0];
										}
									}
								}else{
									$("#CS_ChannelMask").val(nIndex);
								}
								GetFaceCfg(nIndex);	
							}else{
								MasklayerHide();
								$("#CarShapePage").css("visibility", "hidden");
								ShowPaop(pageTitle, lg.get("IDS_CHSTA_NoConfig"));
							}
						});
					}else{
						MasklayerHide();
						$("#CarShapePage").css("visibility", "hidden");
						ShowPaop(pageTitle, lg.get("IDS_CHSTA_NoConfig"));
					}
				}, pageTitle, "NetWork.RemoteDeviceV3", -1, WSMsgID.WsMsgID_CONFIG_GET); 
			}, pageTitle, "NetWork.ChnStatus", -1, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			if (gDevice.loginRsp.VideoInChannel > 1) {
				dataHtml += '<option value="' + gDevice.loginRsp.ChannelNum + '">' + lg.get("IDS_CFG_ALL") + '</option>';
			}
			$("#CS_ChannelMask").append(dataHtml);
			var nIndex = chnIndex;
			if(nIndex == gDevice.loginRsp.ChannelNum){
				nIndex = 0;
			}
			$("#CS_ChannelMask").val(chnIndex);

			if(bIPC){
				RfParamCall(function(a){
					if(a.Ret == 100 && a[a.Name] != null && typeof a[a.Name].ShowTrack != "undefined")
					{
						bSupportVehicleShowTrack = a[a.Name].ShowTrack;
					}
					else
					{
						bSupportVehicleShowTrack = false;
					}
					if(a.Ret == 100 && a[a.Name] != null && typeof a[a.Name].VoiceTip != "undefined")
					{
						bSupportVehicleVoiceTip = a[a.Name].VoiceTip;
					}
					else
					{
						bSupportVehicleVoiceTip = false;
					}
					GetFaceCfg(nIndex);
				}, pageTitle,  "VehicleRuleLimit", -1, WSMsgID.WsMsgID_ABILITY_GET, null, true);
			}
			else
			{
				GetFaceCfg(nIndex);
			}
		}
    }
	function FillAlarmType(){
		GetLocalVoiceTipType("Detect.CarShapeDetection", function(){
			GetAlarmToneType("Detect.CarShapeDetection","#CS_Alarm_tone","#CS_AbAlarmToneType","#CS_AbAlarmTone");
			InitChannel();
		});
	}
	function CHOSDSaveSel(nIndex) {
		var cfgName = carShapeCfg[nIndex].Name;
		carShapeCfg[nIndex][cfgName].Enable = $("#CS_Enable").attr("data")*1?true:false;
		var eventHandler = carShapeCfg[nIndex][cfgName].EventHandler;
		if(isObject(eventHandler)){
			if(gDevice.loginRsp.AlarmOutChannel > 0){
				eventHandler.AlarmOutMask = GetMasks("#CS_AOChannelDiv > div[name!='all']");
				eventHandler.AlarmOutLatch = $("#CS_AODelay").val() * 1;
				eventHandler.AlarmOutEnable = false;
				if (parseInt(eventHandler.AlarmOutMask) > 0){
					eventHandler.AlarmOutEnable = true;
				}
			}
			if(bRecord){
				eventHandler.RecordLatch = $("#CSRecordDelay").val() * 1;
				if (bNoMulityAlarmLink){
					eventHandler.RecordEnable = $("#CSRecord").prop("checked");
					eventHandler.RecordMask = GetSingleChnMasks(eventHandler.RecordEnable, nIndex);
				}else{
					eventHandler.RecordMask = GetMasks("#CS_RecChannelDiv > div[name!='all']");
					eventHandler.RecordEnable = false;
					if (parseInt(eventHandler.RecordMask) > 0) {
						eventHandler.RecordEnable = true;
					}
				}
			}
			if (bNoMulityAlarmLink){
				eventHandler.TourEnable = $("#CSTour").prop("checked");
				eventHandler.TourMask = GetSingleChnMasks(eventHandler.TourEnable, nIndex);
			}else{
				eventHandler.TourMask = GetMasks("#CS_TourChannelDiv > div[name!='all']");
				eventHandler.TourEnable = false;
				if (parseInt(eventHandler.TourMask) > 0){
					eventHandler.TourEnable = true;
				}
			}
			if (bSnap){
				if (bNoMulityAlarmLink){
					eventHandler.SnapEnable = $("#CSSnap").prop("checked");
					eventHandler.SnapShotMask = GetSingleChnMasks(eventHandler.SnapEnable, nIndex);
				}else{
					eventHandler.SnapShotMask = GetMasks("#CS_SnapChannelDiv > div[name!='all']");
					eventHandler.SnapEnable = false;
					if (parseInt(eventHandler.SnapShotMask) > 0) {
						eventHandler.SnapEnable = true;
					}
				}
			}
			if(bSupportAlarmVoiceTipInterval){
				eventHandler.VoiceTipInterval = $("#CS_VoiceInterval").val() * 1;
			}
			eventHandler.PtzEnable = true;
			eventHandler.MailEnable = $("#CS_SendEmail").prop("checked");
			eventHandler.TipEnable = $("#CS_ShowMessage").prop("checked");
			eventHandler.MessageEnable = $("#CS_Phone").prop("checked");
			eventHandler.FTPEnable = $("#CS_FTP").prop("checked");
			eventHandler.LogEnable = $("#CS_WriteLog").prop("checked");
			carShapeCfg[nIndex][cfgName].ShowTrack = $("#CS_ShowTrack").prop("checked");
			eventHandler.VoiceEnable = $("#CS_VoiceTip").prop("checked");
			SaveAlarmToneType(eventHandler,"#CS_AbAlarmToneType","#CS_AbAlarmTone");
			return true;
		}
		return false;
    }
	function SaveCfg(nIndex){
		if(nIndex < arrCh.length){
			var chn = arrCh[nIndex];
			if(bGet[chn]){
				RfParamCall(function (data){
					SaveCfg(nIndex + 1);
				}, pageTitle, "Detect.CarShapeDetection", chn, WSMsgID.WsMsgID_CONFIG_SET, carShapeCfg[chn]);
			}else{
				SaveCfg(nIndex + 1);
			}
		}else{
			ShowPaop(pageTitle,lg.get("IDS_SAVE_SUCCESS"));
		}
	}
	$(function () {
		if (bNoMulityAlarmLink){
			$("#AlarmLinkBox").css("display", "");
			$("#MulityAlarmLinkBox").css("display", "none");
			$("#CS_enableBox").addClass("group-box").css("margin-top", "5px");
		}else{
			$("#AlarmLinkBox").css("display", "none");
			$("#MulityAlarmLinkBox").css("display", "");
		}
		if (bIPC) {
			$("#CS_ChannelDiv, #CS_DivBoxTour, #CS_TourBox, #CS_CP, #CS_Paste").css("display", "none");
		}
		if(gDevice.bGetDefault){
			$("#CS_Default").css("display", "");
		}
		if (GetFunAbility(gDevice.Ability.AlarmFunction.ScreenTip)){
			$("#CS_ShowMessageBox").css("display", "");
		}
		if (GetFunAbility(gDevice.Ability.TipShow.NoEmailTipShow)) {
			$("#CS_SendEmailBox").css("display", "none")
		}
		if (bSnap && bIPC){
			$("#CS_DivBoxSnap, #CS_SnapBox").css("display", "");
			recChannel("CS_SnapChannelDiv", color, bColor);
			ChannelH = $("#CS_DivBoxSnap").height;
			$("#CS_DivBoxSnap .MaskDiv").css("height", ChannelH + "px");
		}
		if(!GetFunAbility(gDevice.Ability.NetServerFunction.NetPMS)){
			$("#CS_PhoneBox").css("display", "none");
		}
		if (GetFunAbility(gDevice.Ability.TipShow.NoFTPTipShow) || !GetFunAbility(gDevice.Ability.NetServerFunction.NetFTP)){
			$("#CS_FTPBox").css("display", "none");
		}
		if (!GetFunAbility(gDevice.Ability.OtherFunction.SupportWriteLog)) {
			$("#CS_WriteLogBox").css("display", "none");
		}

		if (!bRecord) {
			$("#CS_DivBoxRecord, #CS_RecordDelayDiv, #CS_RecordBox").css("display", "none");
		}else {
			recChannel("CS_RecChannelDiv", color, bColor);
			ChannelH = $("#CS_DivBoxRecord").height();
			$("#CS_DivBoxRecord .MaskDiv").css("height", ChannelH + "px");
		}
		if(bSupportAlarmVoiceTipInterval){
			$("#CS_VoiceIntervalDiv").css("display", "");
		}

		if(gDevice.loginRsp.BuildTime >= "2011-11-14 13:53:32"){
			var bPtz = GetFunAbility(gDevice.Ability.CommFunction.CommRS485);
			bPtz &= (gDevice.loginRsp.ChannelNum > 0);
			if(bPtz){
				$("#CS_PTZSetDiv").css("display", "");
			}else{
				$("#CS_PTZSetDiv").css("display", "none");
			}
		}
		recChannel("CS_TourChannelDiv", color, bColor);
		var ChannelH = $("#CS_DivBoxTour").height();
		$("#CS_DivBoxTour .MaskDiv").css("height", ChannelH + "px");
		if(gDevice.loginRsp.AlarmOutChannel == 0){
			$("#CS_AOEvent").css("display", "none");
		}else {
			recChannel("CS_AOChannelDiv", color, bColor, gDevice.loginRsp.AlarmOutChannel);
			ChannelH = $("#CS_AOEvent").height();
			$("#CS_AOEvent .MaskDiv").css("height", ChannelH + "px");
		}
		$('#DivBoxAll :checked').prop("checked",false);
		ChangeBtnState2();
		$("#CS_ChannelMask").change(function () {
			var nChn = $("#CS_ChannelMask").val() * 1;	
			if(nChn == gDevice.loginRsp.ChannelNum){
				GetFaceCfg(arrCh[0]);
				chnIndex = nChn;
			}else if(chnIndex == gDevice.loginRsp.ChannelNum){
				GetFaceCfg(nChn);
				chnIndex = nChn;
			}else{
				CHOSDSaveSel(chnIndex);
				GetFaceCfg(nChn);
				chnIndex = nChn;
			}
		});
		$("#CS_SV").click(function () {
			var nChn = $("#CS_ChannelMask").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum){
				CHOSDSaveSel(arrCh[0]);
				SaveAllCfg();
			}else{
				CHOSDSaveSel(nChn);
				SaveCfg(0);
			}
		});
		
		function SaveAllCfg(){
			var nChn = arrCh[0];
			var _saveCfg = carShapeCfg[nChn][carShapeCfg[nChn].Name];
			if(bNoMulityAlarmLink){
				if(_saveCfg[_saveCfg.Name].EventHandler.RecordEnable){
					_saveCfg[_saveCfg.Name].EventHandler.RecordMask="0xffffffffffffffff";
				}else{
					_saveCfg[_saveCfg.Name].EventHandler.RecordMask="0x0";
				}
				if(_saveCfg[_saveCfg.Name].EventHandler.TourEnable){
					_saveCfg[_saveCfg.Name].EventHandler.TourMask="0xffffffffffffffff";
				}else{
					_saveCfg[_saveCfg.Name].EventHandler.TourMask="0x0";
				}
				
				if(bSnap){
					if(_saveCfg[_saveCfg.Name].EventHandler.SnapEnable){
						_saveCfg[_saveCfg.Name].EventHandler.SnapShotMask="0xffffffffffffffff";
					}else{
						_saveCfg[_saveCfg.Name].EventHandler.SnapShotMask="0x0";
					}
				}
			}
			for (var i = 1; i < gDevice.loginRsp.ChannelNum; i++ ){
				if($.inArray(i, arrCh) < 0){
					continue;
				}
				if (bGet[i] && isObject(carShapeCfg[i])) {
					carShapeCfg[i][carShapeCfg[i].Name] = cloneObj(_saveCfg);
				} else {
					var cfg = {};
					var cfgName = "Detect.CarShapeDetection.[" + i + "]";
					cfg[cfgName] = cloneObj(_saveCfg);
					cfg.Name = cfgName;
					carShapeCfg[i] = cfg;
					bGet[i] = true;
				}
			}
			SaveCfg(0);
		}
	
		$("#CS_Rf").click(function () {
			FillAlarmType();
		});
		$("#CS_Period").click(function() {	
			MasklayerShow(1);
			SetWndTop("#period_dialog", 60);
			$("#period_dialog").show(function(){
				var nIndex = chnIndex;
				if(chnIndex == gDevice.loginRsp.ChannelNum){
					nIndex = arrCh[0];
				}
				var cfgName = carShapeCfg[nIndex].Name;
				var timeSection = carShapeCfg[nIndex][cfgName].EventHandler.TimeSection;
				ShowPeriodWnd(timeSection, AlarmTypeEnum.CapShape);
			});
		});
		$("#CS_PTZSet").click(function() {	
			MasklayerShow(1);
			if(gDevice.loginRsp.ChannelNum <= 32){
				SetWndTop("#PtzLink_dialog", 60);
			}else{
				SetWndTop("#PtzLink_dialog");
			}
			$("#PtzLink_dialog").show(function(){
				var nIndex = chnIndex;
				if(chnIndex == gDevice.loginRsp.ChannelNum){
					nIndex = arrCh[0];
				}
				var cfgName = carShapeCfg[nIndex].Name;
				var PtzCfg = carShapeCfg[nIndex][cfgName].EventHandler.PtzLink;
				ShowPTZ(PtzCfg, AlarmTypeEnum.CapShape);
			});
		});
		$("#CS_Enable").click(function() {
			OnClickedEnable();
		});
		$("#CS_CP").click(function () {
			var nChn = $("#CS_ChannelMask").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum){
				nChn = arrCh[0];
			}
			CHOSDSaveSel(nChn);
			copyCfg = cloneObj(carShapeCfg[nChn]);
			bCopy = true; 
		});
		$("#CS_Paste").click(function () {
			if(!bCopy)
				return;
			$(".rightEx > div[name='all']").css({
				"background-color": "transparent",
				color: "inherit"
			});
			var eventHandler = copyCfg[copyCfg.Name].EventHandler;
			var btnFlag = copyCfg[copyCfg.Name].Enable?1:0;
			$("#CS_Enable").attr("data", btnFlag);
			$("#CS_SendEmail").prop("checked", eventHandler.MailEnable);
			$("#CS_ShowMessage").prop("checked", eventHandler.TipEnable);       
			$("#CS_Phone").prop("checked", eventHandler.MessageEnable);
			$("#CS_FTP").prop("checked", eventHandler.FTPEnable);
			$("#CS_WriteLog").prop("checked", eventHandler.LogEnable);
			$("#CS_ShowTrack").prop("checked", copyCfg[copyCfg.Name].ShowTrack);
			$("#CS_VoiceTip").prop("checked", eventHandler.VoiceEnable);
			if(gDevice.loginRsp.AlarmOutChannel > 0){
				$("#CS_AODelay").val(eventHandler.AlarmOutLatch);
				ShowMask("#CS_AOChannelDiv > div[name!='all']", eventHandler.AlarmOutMask);
			}
			if(bRecord){
				$("#CSRecordDelay").val(eventHandler.RecordLatch);
				if(bNoMulityAlarmLink){
					$("#CSRecord").prop("checked", eventHandler.RecordEnable);
				}else{
					ShowMask("#CS_RecChannelDiv > div[name!='all']", eventHandler.RecordMask);
				}
			}
			if(bNoMulityAlarmLink){
				$("#CSTour").prop("checked", eventHandler.TourEnable);
			}else{
				ShowMask("#CS_TourChannelDiv > div[name!='all']", eventHandler.TourMask);
			}
			
			if (bSnap){
				if(bNoMulityAlarmLink){
					$("#CSSnap").prop("checked", eventHandler.SnapEnable);
				}else {
					ShowMask("#CS_SnapChannelDiv > div[name!='all']", eventHandler.SnapShotMask);
				}
			}

			var nChn = $("#CS_ChannelMask").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum){
				for (var k = 0; k < gDevice.loginRsp.ChannelNum; k++){
					if (!bGet[k]) continue;
					var cfgHanlder = carShapeCfg[k][carShapeCfg[k].Name].EventHandler;
					for (var i = 0; i < 7; i++) {
						for (var j = 0; j < 6; j++) {
							cfgHanlder.TimeSection[i][j] = eventHandler.TimeSection[i][j];
						}
					}
					for (var m = 0; m < gDevice.loginRsp.ChannelNum; m++) {
						cfgHanlder.PtzLink[m][0] = eventHandler.PtzLink[m][0];
						cfgHanlder.PtzLink[m][1] = eventHandler.PtzLink[m][1];
					}
				}
			} else {
				var cfgHanlder = carShapeCfg[nChn][carShapeCfg[nChn].Name].EventHandler;
				for (var i = 0; i < 7; i++) {
					for (var j = 0; j < 6; j++) {
						cfgHanlder.TimeSection[i][j] = eventHandler.TimeSection[i][j];
					}
				}
	
				for (var m = 0; m < gDevice.loginRsp.ChannelNum; m++) {
					cfgHanlder.PtzLink[m][0] = eventHandler.PtzLink[m][0];
					cfgHanlder.PtzLink[m][1] = eventHandler.PtzLink[m][1];
				}
			}
			if(bSupportAlarmVoiceTipInterval){
				$("#CS_VoiceInterval").val(eventHandler.VoiceTipInterval);
			}
			
			SetAlarmToneType(eventHandler,"#CS_AbAlarmToneType","#CS_AbAlarmTone");
			ChangeVoiceType("#CS_AbAlarmToneType","#CS_alarmAndCustom");
			OnClickedEnable();
			InitButton2();	
		});
		$("#CS_AbAlarmToneType").change(function(){
			ChangeVoiceType("#CS_AbAlarmToneType","#CS_alarmAndCustom");
		})
		$("#CS_AbAlarmToneCustomButton").click(function(){
			var cmd={
				"FilePurpose":7
			};
			ShowVoiceCustomDlg(-1,cmd,pageTitle);
		});
		$("#CS_Default").click(function(){
			var nIndex = chnIndex == gDevice.loginRsp.ChannelNum ? 0 : chnIndex;
			RfParamCall(function(a,b){
				carShapeCfg[nIndex] = a;
				var timeSection = carShapeCfg[nIndex][carShapeCfg[nIndex].Name].EventHandler.TimeSection;
				for(var i = 0; i < timeSection.length; i++){
					if(isObject(timeSection[i])){
						for(var j = 0; j < timeSection[i].length ; j++){
							if(timeSection[i][j] == ""){
								timeSection[i][j] = "0 00:00:00-00:00:00";
							}
						}
					}
				}
				carShapeCfg[nIndex][carShapeCfg[nIndex].Name].EventHandler.TimeSection = timeSection;
				bGet[nIndex] = true;
				ShowData(nIndex);
				MasklayerHide();
			}, pageTitle, "Detect.CarShapeDetection", nIndex, WSMsgID.WsMsgID_DEFAULTCONFIG_GET);			
		});		
		FillAlarmType();
    });
});