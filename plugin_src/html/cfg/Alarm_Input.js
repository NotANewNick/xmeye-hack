//# sourceURL=Alarm_Input.js
$(document).ready(function () {
	var color = gVar.skin_mColor;
    var bColor = gVar.skin_bColor;
	var fname = ["Alarm.LocalAlarm", "Alarm.IPCAlarm"];
	var LocalAlarm = new Array;
	var IPCAlarm = new Array;
    var chnIndex = -1;
	var nType = -1;
	var bGet = new Array;
	var bCopy = new Array;
	var copyLocal = null;
	var copyIPC = null;
    var pageTitle = $("#Alarm_Input").text();
	var nTotalNum = 0;
	var bLocalAlarm = false;
	var bHasShowIPCAlarm = false;
	var bIPCAlarm = GetFunAbility(gDevice.Ability.AlarmFunction.IPCAlarm);
	var bRecord = !GetFunAbility(gDevice.Ability.OtherFunction.NOHDDRECORD);
	var bSnap = (GetFunAbility(gDevice.Ability.EncodeFunction.SnapStream) || GetFunAbility(gDevice.Ability.OtherFunction.SupportSnapSchedule));
	var bIPC = gDevice.devType == devTypeEnum.DEV_IPC ? true : false;
	var bNoMulityAlarmLink = GetFunAbility(gDevice.Ability.OtherFunction.NoSupportMulityAlarmLink);
	function OnClickedEnable(){
		var flag = $("#alarmEnableSwitch").attr("data") * 1;
        DivBox(flag, "#INDivBoxAll");
		DivBox(flag, "#table_dev_type");
		if(flag){
			$("#INDivBoxAll .MaskDiv").css("display", "none");
		}else{
			$("#INDivBoxAll .MaskDiv").css("display", "block");
		}
	}
	function FillData(cfg){
		$(".rightEx > div[name='all']").css({
			"background-color": "transparent",
			color: "inherit"
		});
		var btnFlag = cfg.Enable?1:0;
		$("#alarmEnableSwitch").attr("data", btnFlag);
		
		var devType = cfg.SensorType == "NC" ? 0:1;	//NC-Noraml close, NO-Normal open
		$("#alarmDevType").val(devType);
		
		var eventHandler = cfg.EventHandler;
		$("#INEventLatch").val(eventHandler.EventLatch);
		$("#INSendEmail").prop("checked", eventHandler.MailEnable);
		$("#INShowMessage").prop("checked", eventHandler.TipEnable);       
		$("#INPhone").prop("checked", eventHandler.MessageEnable);
		$("#INFTP").prop("checked", eventHandler.FTPEnable);
		$("#INWriteLog").prop("checked", eventHandler.LogEnable);
		$("#INShortMsg").prop("checked", eventHandler.ShortMsgEnable);
		$("#INMultimedia").prop("checked", eventHandler.MultimediaMsgEnable);
		if(gDevice.loginRsp.AlarmOutChannel > 0){
			$("#INAODelay").val(eventHandler.AlarmOutLatch);
			ShowMask("#IN_AOChannelDiv > div[name!='all']", eventHandler.AlarmOutMask);
		}
		if(bRecord){
			$("#INRecordDelay").val(eventHandler.RecordLatch);
			if(bNoMulityAlarmLink){
				$("#INRecord").prop("checked", eventHandler.RecordEnable);
			}else{
				ShowMask("#IN_RecChannelDiv > div[name!='all']", eventHandler.RecordMask);
			}
		}
		if(bNoMulityAlarmLink){
			$("#INTour").prop("checked", eventHandler.TourEnable);
		}else{
			ShowMask("#IN_TourChannelDiv > div[name!='all']", eventHandler.TourMask);	
		}
		if(bSnap){
			if(bNoMulityAlarmLink){
				$("#INSnap").prop("checked", eventHandler.SnapEnable);
			}else {
				ShowMask("#IN_SnapChannelDiv > div[name!='all']", eventHandler.SnapShotMask);
			}
		}
		SetAlarmToneType(eventHandler,"#in_AbAlarmToneType","#in_AbAlarmTone");
		ChangeVoiceType("#in_AbAlarmToneType","#in_alarmAndCustom");
		OnClickedEnable();
	}
	function ShowChnData(nIndex) {
		var cfg = null;
		if(nType == 0){
			cfg = LocalAlarm[nIndex][LocalAlarm[nIndex].Name];
		} else if(nType == 1){
			cfg = IPCAlarm[nIndex][IPCAlarm[nIndex].Name];
		}
		
		if (isObject(cfg)) {
			FillData(cfg);
			InitButton();
		}
	}
	function GetDigStatus(nChn, callback){
		RfParamCall(function(a){
			var ssDigitChStatus = a[a.Name];
			RfParamCall(function(b){
				var ssRemoteDevice = b[b.Name];
				var a = false;
				if (ssDigitChStatus[nChn].Status == "Connected"
					&& ssRemoteDevice[nChn].ConnType == "SINGLE") {
					var nIndex = ssRemoteDevice[nChn].SingleConnId - 1;//配置的第几个
					if	(nIndex >= 0 && (ssRemoteDevice[nChn].Decoder[nIndex].Protocol == "TCP"
						|| ssRemoteDevice[nChn].Decoder[nIndex].Protocol == "ONVIF")){
						a = true;
					}
				}
				callback(a);
			}, pageTitle, "NetWork.RemoteDeviceV3", -1, WSMsgID.WsMsgID_CONFIG_GET);
		}, pageTitle, "NetWork.ChnStatus", -1, WSMsgID.WsMsgID_CONFIG_GET);
	}
	function ShowData(nIndex){
		$("#alarmEnableSwitch").prop("disabled", false);
		if(nType == 0){
			GetLocalAlarm(nIndex);
		} else if(nType == 1){
			GetDigStatus(nIndex, function(a){
				if(!a){
					IPCAlarm[nIndex][IPCAlarm[nIndex].Name].Enable = false;
					$("#alarmEnableSwitch").prop("disabled", true);
				}
				ShowChnData(nIndex);
				if(!bHasShowIPCAlarm){
					bHasShowIPCAlarm = true;
				}
				MasklayerHide();
			});
		}
	}
	function GetLocalAlarm(nIndex){
		if(!bGet[0][nIndex]){
			RfParamCall(function(a){
				LocalAlarm[nIndex] = a;
				var timeSection = LocalAlarm[nIndex][LocalAlarm[nIndex].Name].EventHandler.TimeSection;
				for(var i = 0; i < timeSection.length; i++){
					if(isObject(timeSection[i])){
						for(var j = 0; j < timeSection[i].length ; j++){
							if(timeSection[i][j] == ""){
								timeSection[i][j] = "0 00:00:00-00:00:00";
							}
						}
					}
				}
				LocalAlarm[nIndex][LocalAlarm[nIndex].Name].EventHandler.TimeSection = timeSection;
				bGet[0][nIndex] = true;
				ShowChnData(nIndex);
				MasklayerHide();
			}, pageTitle, fname[0], nIndex, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			ShowChnData(nIndex);
		}
	}
	function GetIPCAlarm(nIndex){
		if(nIndex < gDevice.loginRsp.DigChannel){
			if(!bGet[1][nIndex]){
				RfParamCall(function(a){
					IPCAlarm[nIndex] = a;
					var timeSection = IPCAlarm[nIndex][IPCAlarm[nIndex].Name].EventHandler.TimeSection;
					var i, j;
					if(timeSection == null){
						timeSection = new Array(7);
						for(i = 0; i < timeSection.length; i++){
							timeSection[i] = new Array(6);
							for(j = 0; j < timeSection.length; j++){
								if(j == 0)
								{
									timeSection[i][j] = "1 00:00:00-24:00:00";
								}
								else
								{
									timeSection[i][j] = "0 00:00:00-24:00:00";
								}
							}
						}
					}else{
						for(i = 0; i < timeSection.length; i++){
							if(isObject(timeSection[i])){
								for(j = 0; j < timeSection[i].length ; j++){
									if(timeSection[i][j] == ""){
										timeSection[i][j] = "0 00:00:00-00:00:00";
									}
								}
							}
						}
					}
					IPCAlarm[nIndex][IPCAlarm[nIndex].Name].EventHandler.TimeSection = timeSection;
					bGet[1][nIndex] = true;
					GetIPCAlarm(nIndex + 1);
				}, pageTitle, fname[1], nIndex, WSMsgID.WsMsgID_CONFIG_GET);
			}else{
				GetIPCAlarm(nIndex + 1);
			}
		}else{
			var nChn = chnIndex;
			if(nChn == nTotalNum){
				nChn = 0;
			}
			ShowData(nChn);
		}
	}
	function InitChannel() {
		var dataHtml = '';
		$("#alarmChannel").empty();
		var i;
		var nDigChn = gDevice.loginRsp.DigChannel;
		if (nType == 0) {
			for (i = 0; i < gDevice.loginRsp.AlarmInChannel; i++) {
				dataHtml += '<option value="' + i + '">' + (i + 1) + '</option>';
			}
			if(gDevice.loginRsp.AlarmInChannel > 1){
				dataHtml += '<option value="' + i + '">' + lg.get("IDS_CFG_ALL") + '</option>';
			}
			$("#alarmChannel").append(dataHtml);
			nTotalNum = gDevice.loginRsp.AlarmInChannel;
		} else {
			if(nDigChn > 0){
				for (i = gDevice.loginRsp.VideoInChannel; i < gDevice.loginRsp.ChannelNum; i++) {
					var m = i - gDevice.loginRsp.VideoInChannel;	
					dataHtml += '<option value="' + m + '">' + gDevice.getChannelName(i) + '</option>';
				}
				if(nDigChn > 1){
					dataHtml += '<option value="' + nDigChn + '">' + lg.get("IDS_CFG_ALL") + '</option>';
				}
				$("#alarmChannel").append(dataHtml);
				nTotalNum = nDigChn;
			}else{
				ShowPaop(pageTitle, "NoConfig");
			}
		}
	}
	function Init(){
		$("#alarmType").val(nType);
		bCopy = [false, false];
		copyLocal = null;
		copyIPC = null;
		var i;
		bHasShowIPCAlarm = false;
		for (i = 0; i < gDevice.loginRsp.AlarmInChannel; i++) {
			bGet[0][i] = false;
			LocalAlarm[i] = null;
		}
		
		if(gDevice.loginRsp.DigChannel > 0 && !bIPC){
			for (i = 0; i < gDevice.loginRsp.DigChannel; i++) {
				bGet[1][i] = false;
				IPCAlarm[i] = null;
			}
		}
		InitChannel();	
		$("#alarmChannel").val(chnIndex);
		if(bIPCAlarm){
			GetIPCAlarm(0);
		}else{
			var nChn = chnIndex;
			if(nChn == nTotalNum){
				nChn = 0;
			}
			ShowData(nChn);
		}
	}
	function FillAlarmType(){
		GetLocalVoiceTipType("Alarm.LocalAlarm", function(){
			GetAlarmToneType("Alarm.LocalAlarm","#in_Alarm_tone","#in_AbAlarmToneType","#in_AbAlarmTone");
			Init();
		});
	}
	function CHOSDSaveSel(nIndex) {
		var cfg = null;
		if(nType == 0){
			cfg = LocalAlarm[nIndex][LocalAlarm[nIndex].Name];
		} else {
			cfg = IPCAlarm[nIndex][IPCAlarm[nIndex].Name];
		}
		if (isObject(cfg)) {
			cfg.Enable = $("#alarmEnableSwitch").attr("data") *1 == 1 ? true:false;
			cfg.SensorType = $("#alarmDevType").val() *1 == 1 ? "NO":"NC";
			var eventHandler = cfg.EventHandler;
			eventHandler.EventLatch = $("#INEventLatch").val() * 1;			
			if(gDevice.loginRsp.AlarmOutChannel > 0){
				eventHandler.AlarmOutLatch = $("#INAODelay").val() * 1;
				eventHandler.AlarmOutMask = GetMasks("#IN_AOChannelDiv > div[name!='all']");
				eventHandler.AlarmOutEnable = false;
				if (parseInt(eventHandler.AlarmOutMask) > 0){
					eventHandler.AlarmOutEnable = true;
				}
			}
			if(bRecord){
				eventHandler.RecordLatch = $("#INRecordDelay").val() * 1;
				if (bNoMulityAlarmLink){
					eventHandler.RecordEnable = $("#INRecord").prop("checked");
					eventHandler.RecordMask = GetSingleChnMasks(eventHandler.RecordEnable, nIndex);
				}else{
					eventHandler.RecordMask = GetMasks("#IN_RecChannelDiv > div[name!='all']");
					eventHandler.RecordEnable = false;
					if (parseInt(eventHandler.RecordMask) > 0) {
						eventHandler.RecordEnable = true;						
					}
				}
			}
			if (bNoMulityAlarmLink){
				eventHandler.TourEnable = $("#INTour").prop("checked");
				eventHandler.TourMask = GetSingleChnMasks(eventHandler.TourEnable, nIndex);
			}else{
				eventHandler.TourMask = GetMasks("#IN_TourChannelDiv > div[name!='all']");
				eventHandler.TourEnable = false;
				if (parseInt(eventHandler.TourMask)){
					eventHandler.TourEnable = true;
				}
			}
			if(bSnap){
				if (bNoMulityAlarmLink){
					eventHandler.SnapEnable = $("#INSnap").prop("checked");
					eventHandler.SnapShotMask = GetSingleChnMasks(eventHandler.SnapEnable, nIndex);
				}else{
					eventHandler.SnapShotMask = GetMasks("#IN_SnapChannelDiv > div[name!='all']");
					eventHandler.SnapEnable = false;
					if (parseInt(eventHandler.SnapShotMask) > 0) {
						eventHandler.SnapEnable = true;
					}
				}
			}
			eventHandler.MailEnable = $("#INSendEmail").prop("checked");
			eventHandler.TipEnable = $("#INShowMessage").prop("checked");       
			eventHandler.MessageEnable = $("#INPhone").prop("checked");
			eventHandler.FTPEnable = $("#INFTP").prop("checked");
			eventHandler.LogEnable = $("#INWriteLog").prop("checked");
			eventHandler.ShortMsgEnable = $("#INShortMsg").prop("checked");
			eventHandler.MultimediaMsgEnable = $("#INMultimedia").prop("checked");
			SaveAlarmToneType(eventHandler,"#in_AbAlarmToneType","#in_AbAlarmTone");
			return true;
		}
		return false;
	}
	function SaveIPCAlarm(nIndex) {
		if (nIndex < gDevice.loginRsp.DigChannel && !bIPC) {
			var cfgData = IPCAlarm[nIndex];
			RfParamCall(function(data) {
				SaveIPCAlarm(nIndex + 1);
			}, pageTitle, fname[1], nIndex, WSMsgID.WsMsgID_CONFIG_SET, cfgData);
		} else {
			ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
			var nChn = $("#alarmChannel").val() * 1;
			var nCurType = $("#alarmType").val() * 1;
			if (nChn == gDevice.loginRsp.AlarmInChannel && nCurType == 0 && (gDevice.loginRsp.SoftWareVersion > "V2.62.R07" || gDevice.loginRsp.BuildTime > "2024-04-01")){
				FillAlarmType();
			}
		}
	}
	function SaveAllLocalAlarm(){
		var CfgData = {
			"Name": "Alarm.LocalAlarm.[ff]",
			"Alarm.LocalAlarm.[ff]": cloneObj(LocalAlarm[0][LocalAlarm[0].Name])
		};
		SetAlarmLinkAllEnable(CfgData);
		RfParamCall(function (data){
			SaveIPCAlarm(0);
		}, pageTitle, CfgData.Name, -1, WSMsgID.WsMsgID_CONFIG_SET, CfgData);
	}
	function SaveLocalAlarm(nIndex){
		if(nIndex < gDevice.loginRsp.AlarmInChannel){
			if(bGet[0][nIndex]){
				RfParamCall(function (data){
					SaveLocalAlarm(nIndex + 1);
				}, pageTitle, fname[0], nIndex, WSMsgID.WsMsgID_CONFIG_SET, LocalAlarm[nIndex]);
			}else{
				SaveLocalAlarm(nIndex + 1);
			}
		}else{
			SaveIPCAlarm(0);
		}
	}
	$(function(){
		if (bNoMulityAlarmLink){
			$("#AlarmLinkBox").css("display", "");
			$("#MulityAlarmLinkBox").css("display", "none");
			$("#IN_enableBox").addClass("group-box").css("margin-top", "5px");
		}else{
			$("#AlarmLinkBox").css("display", "none");
			$("#MulityAlarmLinkBox").css("display", "");
		}
		if(gDevice.bGetDefault){
			$("#INDefault").css("display", "");
		}
		if (GetFunAbility(gDevice.Ability.TipShow.NoEmailTipShow)) {
			$("#IN_SendEmailBox").css("display", "none")
		}
		if (!bRecord) {
			$("#IN_DivBoxRecord, #IN_RecordDelayDiv, #IN_RecordBox").css("display", "none");
		}else {
			recChannel("IN_RecChannelDiv", color, bColor);
			ChannelH = $("#IN_DivBoxRecord").height();
			$("#IN_DivBoxRecord .MaskDiv").css("height", ChannelH + "px");
		}
		if(!bSnap) {
			$("#IN_DivBoxSnap, #IN_SnapBox").css("display", "none");
		}else {
			recChannel("IN_SnapChannelDiv", color, bColor);
			ChannelH = $("#IN_DivBoxSnap").height();
			$("#IN_DivBoxSnap .MaskDiv").css("height", ChannelH + "px");
		}
		if(!GetFunAbility(gDevice.Ability.NetServerFunction.NetPMS)){
			$("#IN_PhoneBox").css("display", "none");
		}

		if (GetFunAbility(gDevice.Ability.TipShow.NoFTPTipShow) || !GetFunAbility(gDevice.Ability.NetServerFunction.NetFTP)){
			$("#IN_FTPBox").css("display", "none");
		}
		if (!GetFunAbility(gDevice.Ability.OtherFunction.SupportWriteLog)) {
			$("#IN_WriteLogBox").css("display", "none");
		}
		if (!GetFunAbility(gDevice.Ability.NetServerFunction.NetPhoneShortMsg)) {
			$("#IN_ShortMsgBox").css("display", "none");
		}
		if (!GetFunAbility(gDevice.Ability.NetServerFunction.NetPhoneMultimediaMsg)) {
			$("#IN_MultimediaBox").css("display", "none");
		}
		if(gDevice.loginRsp.BuildTime >= "2011-11-14 13:53:32"){
			var bPtz = GetFunAbility(gDevice.Ability.CommFunction.CommRS485);
			bPtz &= (gDevice.loginRsp.ChannelNum > 0);
			if(bPtz){
				$("#IN_PTZSetDiv").css("display", "");
				$("#IN_RecordDelayDiv").css("margin-left", "400px");
			}else{
				$("#IN_PTZSetDiv").css("display", "none");
				$("#IN_RecordDelayDiv").css("margin-left", "0px");
				$("#INRecordDelay").removeClass("timeTxt");
			}
		}
		recChannel("IN_TourChannelDiv", color, bColor);	
		ChannelH = $("#IN_DivBoxTour").height();
		$("#IN_DivBoxTour .MaskDiv").css("height", ChannelH + "px");
		if(gDevice.loginRsp.AlarmOutChannel == 0){
			$("#IN_AOEvent").css("display", "none");
		}else {
			recChannel("IN_AOChannelDiv", color, bColor, gDevice.loginRsp.AlarmOutChannel);
			ChannelH = $("#IN_AOEvent").height();
			$("#IN_AOEvent .MaskDiv").css("height", ChannelH + "px");
		}
		$('#INDivBoxAll :checked').prop("checked",false);
		if (GetFunAbility(gDevice.Ability.AlarmFunction.ScreenTip)){
			$("#IN_ShowMessageBox").css("display", "");
		}
		if(bIPC){
			 $("#IN_DivBoxTour, #IN_ShowMessageBox, #IN_TourBox").css("display", "none");
		}
		$("#alarm_btn_box").css("margin-left", "115px");
		ChangeBtnState();
		$("#alarmType").empty();
		if (gDevice.loginRsp.AlarmInChannel > 0) {
			bLocalAlarm = true;
			$("#alarmType").append('<option value="0">'+ lg.get("IDS_ALARM_TYPE_LOCAL") +'</option>');
			nType = 0;
			bGet[0] = [];
		} 
		if (gDevice.loginRsp.DigChannel > 0 && !bIPC) {
			$("#alarmType").append('<option value="1">'+ lg.get("IDS_ALARM_TYPE_IPC") +'</option>');
			if (nType == -1) {
				nType = 1;
			}
			bGet[1] = [];
		}
		$("#alarmDevType").empty();
		$("#alarmDevType").append('<option value="0">'+ lg.get("IDS_ALARM_NORMAL_CLOSE") +'</option>');
		$("#alarmDevType").append('<option value="1">'+ lg.get("IDS_ALARM_NORMAL_OPEN") +'</option>');
		$("#alarmType").change(function() {
			var nCurType = $("#alarmType").val() * 1;
			var nCurChn = chnIndex;
			var nAllchannel = gDevice.loginRsp.AlarmInChannel;
			if (nCurType){
				nAllchannel = gDevice.loginRsp.DigChannel;
			}
			if (chnIndex >= nAllchannel){
				nAllchannel = chnIndex;
			}
			
			if (chnIndex == nAllchannel){
				nType = nCurType;
				InitChannel();
				$("#alarmChannel").val(0);
				ShowData(0);
				chnIndex = 0;
			}else{
				if (nType != nCurType){
					var nIndex = nCurChn;
					if(nIndex == nTotalNum){
						nIndex = 0;
					}
					CHOSDSaveSel(nIndex);
				}
				nType = nCurType;
				InitChannel();
				$("#alarmChannel").val(nCurChn);
				ShowData(nCurChn);
				chnIndex = nCurChn;
			}
		});
		$("#alarmChannel").change(function(){
			var nChn = $(this).val() * 1;
			var nAllChannel = gDevice.loginRsp.AlarmInChannel;
			if ((nType == 0 && !bLocalAlarm) || nType == 1){
				nAllChannel = gDevice.loginRsp.DigChannel;
			}
			
			if (nChn == nAllChannel){
				ShowData(0);
				chnIndex = nChn;
			} else if (chnIndex == nAllChannel){
				ShowData(nChn);
				chnIndex = nChn;
			}else{
				if (nChn != chnIndex){
					CHOSDSaveSel(chnIndex);
					ShowData(nChn);
					chnIndex = nChn;
				}
			}
		});
		$("#alarmEnableSwitch").click(function() {
			OnClickedEnable();
		});
		$("#INCP").click(function () {
			var nCurType = $("#alarmType").val() * 1;
			var nChn = $("#alarmChannel").val() * 1;
			if (nChn == gDevice.loginRsp.AlarmInChannel){
				nChn = 0;
			}
			CHOSDSaveSel(nChn);
			if (!bIPCAlarm){
				copyLocal = cloneObj(LocalAlarm[nChn]);
				bCopy[0] = true;
			}else{
				if (nCurType){
					copyIPC = cloneObj(IPCAlarm[nChn]);
					bCopy[1] = true;
				}else{
					copyLocal = cloneObj(LocalAlarm[nChn]);
					bCopy[0] = true;
				}
			}
		});
		$("#INPaste").click(function () {
			if(!bCopy[0] && !bCopy[1])
				return;
			if($("#alarmEnableSwitch").prop("disabled"))	//启用按钮禁用状态，粘贴功能无效
				return;	
			var nCurType = $("#alarmType").val() * 1;
			var nChn = $("#alarmChannel").val() * 1;
			var cfg = null;
			if(nCurType == 0){
				if(!bCopy[0]) 
					return;
				cfg = copyLocal[copyLocal.Name];
			}else{
				if(!bCopy[1]) 
					return;
				cfg = copyIPC[copyIPC.Name];
			}
			FillData(cfg);
			var eventHandler = cfg.EventHandler;
			if (nChn == gDevice.loginRsp.ChannelNum){
				for (var k = 0; k < gDevice.loginRsp.ChannelNum; k++){
					if (!bGet[nCurType][k]) continue;
					var cfgHanlder = null;
					if(nCurType == 0){
						cfgHanlder = LocalAlarm[k][LocalAlarm[k].Name].EventHandler;
					}else{
						cfgHanlder = IPCAlarm[k][IPCAlarm[k].Name].EventHandler;
					}
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
				var cfgHanlder = null;
				if(nCurType == 0){
					cfgHanlder = LocalAlarm[nChn][LocalAlarm[nChn].Name].EventHandler;
				}else{
					cfgHanlder = IPCAlarm[nChn][IPCAlarm[nChn].Name].EventHandler;
				}
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
			InitButton();
		});
		$("#INRf").click(function () {
			FillAlarmType();
		});
		$("#INSave").click(function () {
			var nChn = $("#alarmChannel").val() * 1;
			var nCurType = $("#alarmType").val() * 1;
				
			if (nChn == nTotalNum){
				CHOSDSaveSel(0);
				if(nCurType == 0){
					if(gDevice.loginRsp.SoftWareVersion > "V2.62.R07" || gDevice.loginRsp.BuildTime > "2024-04-01"){
						SaveAllLocalAlarm();
					}else{
						SaveLocalAlarm(0);
					}
				}else{
					for (var i = 1; i < gDevice.loginRsp.DigChannel; i++ ){
						if(bGet[1][i] && isObject(IPCAlarm[i])){
							IPCAlarm[i][IPCAlarm[i].Name] = cloneObj(IPCAlarm[0][IPCAlarm[0].Name]);
							SetAlarmLinkAllEnable(IPCAlarm[i]);
						}else{
							var cfg = {};
							var cfgName = fname[1] + ".[" + i + "]";
							cfg[cfgName] = cloneObj(IPCAlarm[0][IPCAlarm[0].Name]);
							cfg.Name = cfgName;
							SetAlarmLinkAllEnable(cfg);
							IPCAlarm[i] = cfg;
							bGet[1][i] = true;
						}
					}
					SaveLocalAlarm(0);
				}
			}else{
				CHOSDSaveSel(nChn);
				SaveLocalAlarm(0);
			}
		});
		$("#IN_Period").click(function() {	
			MasklayerShow(1);
			SetWndTop("#period_dialog", 60);
			$("#period_dialog").show(function(){
				var nIndex = chnIndex;
				var timeSection = null;
				if(nType == 0){
					if(chnIndex == gDevice.loginRsp.AlarmInChannel){
						nIndex = 0;
					}
					timeSection = LocalAlarm[nIndex][LocalAlarm[nIndex].Name].EventHandler.TimeSection;
				}else{
					if(chnIndex == gDevice.loginRsp.DigChannel){
						nIndex = 0;			
					}
					timeSection = IPCAlarm[nIndex][IPCAlarm[nIndex].Name].EventHandler.TimeSection;
				}
				ShowPeriodWnd(timeSection, AlarmTypeEnum.Input);
			});
		});
		$("#IN_PTZSet").click(function() {
			MasklayerShow(1);
			if(gDevice.loginRsp.ChannelNum <= 32){
				SetWndTop("#PtzLink_dialog", 60);
			}else{
				SetWndTop("#PtzLink_dialog");
			}
			$("#PtzLink_dialog").show(function(){
				var nIndex = chnIndex;
				var PtzCfg = null;
				if(nType == 0){
					if(chnIndex == gDevice.loginRsp.AlarmInChannel){
						nIndex = 0;
					}
					PtzCfg = LocalAlarm[nIndex][LocalAlarm[nIndex].Name].EventHandler.PtzLink;
				}else{
					if(chnIndex == gDevice.loginRsp.DigChannel){
						nIndex = 0;
					}
					PtzCfg = IPCAlarm[nIndex][IPCAlarm[nIndex].Name].EventHandler.PtzLink;
				}
				ShowPTZ(PtzCfg, AlarmTypeEnum.Input);
			});
		});	
		$("#in_AbAlarmToneType").change(function(){
			ChangeVoiceType("#in_AbAlarmToneType","#in_alarmAndCustom");
		})
		$("#in_AbAlarmToneCustomButton").click(function(){
			var cmd={
				"FilePurpose":7
			};
			ShowVoiceCustomDlg(-1,cmd,pageTitle);
		});	
		$("#INDefault").click(function(){
			var nIndex = $("#alarmChannel").val() * 1;
			var nAllChannel = gDevice.loginRsp.AlarmInChannel;
			if ((nType == 0 && !bLocalAlarm) || nType == 1){
				nAllChannel = gDevice.loginRsp.DigChannel;
			}
			if(nIndex == nAllChannel){
				nIndex = 0;
			}
			
			RfParamCall(function(a){
				if(nType == 0){
					LocalAlarm[nIndex] = a;
				}else if(nType == 1){
					IPCAlarm[nIndex] = a;
				}

				var timeSection = a[a.Name].EventHandler.TimeSection;
				var i, j;
				if(timeSection == null){
					timeSection = new Array(7);
					for(i = 0; i < timeSection.length; i++){
						timeSection[i] = new Array(6);
						for(j = 0; j < timeSection.length; j++){
							if(j == 0)
							{
								timeSection[i][j] = "1 00:00:00-24:00:00";
							}
							else
							{
								timeSection[i][j] = "0 00:00:00-24:00:00";
							}
						}
					}
				}else{
					for(i = 0; i < timeSection.length; i++){
						if(isObject(timeSection[i])){
							for(j = 0; j < timeSection[i].length ; j++){
								if(timeSection[i][j] == ""){
									timeSection[i][j] = "0 00:00:00-00:00:00";
								}
							}
						}
					}
				}
				a[a.Name].EventHandler.TimeSection = timeSection;
				bGet[nType][nIndex] = true;
				ShowChnData(nIndex);
				MasklayerHide();
			}, pageTitle, fname[nType], nIndex, WSMsgID.WsMsgID_DEFAULTCONFIG_GET);
		});
	
		if(nType != -1){
			chnIndex = 0;
			FillAlarmType();
		}
	});
});