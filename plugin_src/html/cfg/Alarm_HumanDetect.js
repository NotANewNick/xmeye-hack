//# sourceURL=Alarm_HumanDetect.js
$(function () {
	var color = gVar.skin_mColor;
    var bColor = gVar.skin_bColor;
    var chnIndex = -1;
    var pageTitle = $("#Alarm_HumanDetect").text();
	var bGet = new Array;
	var HumanCfg = new Array;
	var faceFunc = new Array;
	var SupportLight = new Array;
	var copyCfg = null;
	var bCopy = false;
	var ChannelH;
	var bRecord = !GetFunAbility(gDevice.Ability.OtherFunction.NOHDDRECORD);
	var bSnap = (GetFunAbility(gDevice.Ability.EncodeFunction.SnapStream) || GetFunAbility(gDevice.Ability.OtherFunction.SupportSnapSchedule));
	var bNoMulityAlarmLink = GetFunAbility(gDevice.Ability.OtherFunction.NoSupportMulityAlarmLink);
	function OnClickedEnable(){
		var j = $("#PD_ChnSwitch").attr("data") * 1;
        DivBox(j, "#DivBoxAll");
		DivBox(j, "#PD_Content_div");
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
		var cfg = HumanCfg[nIndex][HumanCfg[nIndex].Name];
		var btnFlag = cfg.Enable?1:0;
		$("#PD_ChnSwitch").attr("data", btnFlag);
		//$("#PD_Sensitive").val(cfg.Level);
		$("#PDLoiter").val(cfg.LoiterLatch);
		
		var eventHandler = cfg.EventHandler;
		if(SupportLight[nIndex]){
			$("#PDLights").attr("data", eventHandler.ShowInfo?1:0);
		}else{
			$("#PDLights").attr("data", 0);
		}
		
		$("#PDEventLatch").val(eventHandler.EventLatch);	
        $("#PDSendEmail").prop("checked", eventHandler.MailEnable);
        $("#PDShowMessage").prop("checked", eventHandler.TipEnable);       
        $("#PDPhone").prop("checked", eventHandler.MessageEnable);
        $("#PDFTP").prop("checked", eventHandler.FTPEnable);
        $("#PDWriteLog").prop("checked", eventHandler.LogEnable );

		
		if(gDevice.loginRsp.AlarmOutChannel > 0){
			$("#PDAODelay").val(eventHandler.AlarmOutLatch);
			ShowMask("#PD_AOChannelDiv > div[name!='all']", eventHandler.AlarmOutMask);
		}

		if(bRecord){
			$("#PDRecordDelay").val(eventHandler.RecordLatch);
			if(bNoMulityAlarmLink){
				$("#PDRecord").prop("checked", eventHandler.RecordEnable);
			}else{
				ShowMask("#PD_RecChannelDiv > div[name!='all']", eventHandler.RecordMask);
			}
		}
		if(bNoMulityAlarmLink){
			$("#PDTour").prop("checked", eventHandler.TourEnable);
		}else{
			ShowMask("#PD_TourChannelDiv > div[name!='all']", eventHandler.TourMask);
		}
		if(bSnap){
			if(bNoMulityAlarmLink){
				$("#PDSnap").prop("checked", eventHandler.SnapEnable);
			}else{
				ShowMask("#PD_SnapChannelDiv > div[name!='all']", eventHandler.SnapShotMask);
			}
		}
		if(GetFunAbility(gDevice.Ability.OtherFunction.SupportAlarmVoiceTips)){
			$("#PDVoice").prop("checked", eventHandler.VoiceEnable);
		}else{
			SetAlarmToneType(eventHandler,"#hu_AbAlarmToneType","#hu_AbAlarmTone");
			ChangeVoiceType("#hu_AbAlarmToneType","#hu_alarmAndCustom");
		}
		OnClickedEnable();
		if(SupportLight[nIndex]){
			$("#PDLights").css("pointer-events","all");
		}else{
			$("#PDLights").css("pointer-events","none");
		}
		InitButton2();
    }
	function GetHumanCfg(nIndex){
		if(!bGet[nIndex]){
			RfParamCall(function(a){
				HumanCfg[nIndex] = a;
				var timeSection = HumanCfg[nIndex][HumanCfg[nIndex].Name].EventHandler.TimeSection;
				for(var i = 0; i < timeSection.length; i++){
					if(isObject(timeSection[i])){
						for(var j = 0; j < timeSection[i].length ; j++){
							if(timeSection[i][j] == ""){
								timeSection[i][j] = "0 00:00:00-00:00:00";
							}
						}
					}
				}
				HumanCfg[nIndex][HumanCfg[nIndex].Name].EventHandler.TimeSection = timeSection;
				bGet[nIndex] = true;
				ShowData(nIndex);
				MasklayerHide();
			}, pageTitle, "Detect.HumanDetectionDVR", nIndex, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			ShowData(nIndex);
		}
	}
	function InitChannel() {
		copyCfg = null;
		bCopy = false; 
        $("#PDChannelMask").empty();
        var dataHtml = '';
		var j;
		for (var j = 0; j < gDevice.loginRsp.VideoInChannel; j++) {
			if(chnIndex == -1)chnIndex = 0;
			HumanCfg[j] = null;
			bGet[j] = false;
			faceFunc[j] = 0;
			SupportLight[j] = 0;
			dataHtml += '<option value="' + j + '">' + gDevice.getChannelName(j) + '</option>';
		}
		dataHtml += '<option value="' + j + '">' + lg.get("IDS_CFG_ALL") + '</option>';
		$("#PDChannelMask").append(dataHtml);
		if(chnIndex >=0 ) {
			$("#PDChannelMask").val(chnIndex);
			var nIndex = chnIndex;
			if(nIndex == gDevice.loginRsp.VideoInChannel){
				nIndex = 0;
			}			
			RfParamCall(function(a, b){
				if(typeof a[a.Name].CoaxialCameraSupportLight != 'undefined'){
					SupportLight = a[a.Name].CoaxialCameraSupportLight;
				}	
				if(typeof a[a.Name].SupportFaceDetectV2 != 'undefined'){
					faceFunc = a[a.Name].SupportFaceDetectV2;
				}
				GetHumanCfg(nIndex);
			}, pageTitle, "ChannelSystemFunction", -1, WSMsgID.WSMsgID_CHANNEL_ABILITY_GET_REQ);
		}else{
			MasklayerHide();
		}
    }
	function FillAlarmType(){
		GetLocalVoiceTipType("Detect.HumanDetectionDVR", function(){
			GetAlarmToneType("Detect.HumanDetectionDVR","#hu_Alarm_tone","#hu_AbAlarmToneType","#hu_AbAlarmTone");
			InitChannel();
		});
	}
	function SaveHumanCfg(nIndex){
		var cfg = HumanCfg[nIndex][HumanCfg[nIndex].Name];
		cfg.Enable = $("#PD_ChnSwitch").attr("data") * 1 ? true : false;
		//cfg.Level = $("#PD_Sensitive").val() * 1;
		cfg.LoiterLatch = $("#PDLoiter").val() * 1;
		
		var eventHandler = cfg.EventHandler;
		if(SupportLight[nIndex]){
			eventHandler.ShowInfo = $("#PDLights").attr("data") * 1 ? true : false;
		}
		eventHandler.EventLatch = $("#PDEventLatch").val() * 1;
		if(gDevice.loginRsp.AlarmOutChannel > 0){
			eventHandler.AlarmOutLatch = $("#PDAODelay").val() * 1;
			eventHandler.AlarmOutMask = GetMasks("#PD_AOChannelDiv > div[name!='all']");
			eventHandler.AlarmOutEnable = false;
			if (parseInt(eventHandler.AlarmOutMask) > 0){
				eventHandler.AlarmOutEnable = true;
			}
		}
		if(bRecord){
			eventHandler.RecordLatch = $("#PDRecordDelay").val() * 1;
			if (bNoMulityAlarmLink){
				eventHandler.RecordEnable = $("#PDRecord").prop("checked");
				eventHandler.RecordMask = GetSingleChnMasks(eventHandler.RecordEnable, nIndex);
			}else{
				eventHandler.RecordMask = GetMasks("#PD_RecChannelDiv > div[name!='all']");
				eventHandler.RecordEnable = false;
				if (parseInt(eventHandler.RecordMask) > 0) {
					eventHandler.RecordEnable = true;
					}
				}
		}
		if (bNoMulityAlarmLink){
			eventHandler.TourEnable = $("#PDTour").prop("checked");
			eventHandler.TourMask = GetSingleChnMasks(eventHandler.TourEnable, nIndex);
		}else{
			eventHandler.TourMask = GetMasks("#PD_TourChannelDiv > div[name!='all']");
			eventHandler.TourEnable = false;
			if (parseInt(eventHandler.TourMask)){
				eventHandler.TourEnable = true;
			}
		}
		if(bSnap){
			if (bNoMulityAlarmLink){
				eventHandler.SnapEnable = $("#PDSnap").prop("checked");
				eventHandler.SnapShotMask = GetSingleChnMasks(eventHandler.SnapEnable, nIndex);
			}else{
				eventHandler.SnapShotMask = GetMasks("#PD_SnapChannelDiv > div[name!='all']");
				eventHandler.SnapEnable = false;
				if (parseInt(eventHandler.SnapShotMask) > 0) {
					eventHandler.SnapEnable = true;
				}
			}
		}
		eventHandler.MailEnable = $("#PDSendEmail").prop("checked");
        eventHandler.TipEnable = $("#PDShowMessage").prop("checked");       
        eventHandler.MessageEnable = $("#PDPhone").prop("checked");
        eventHandler.FTPEnable = $("#PDFTP").prop("checked");
        eventHandler.LogEnable = $("#PDWriteLog").prop("checked");
		if(GetFunAbility(gDevice.Ability.OtherFunction.SupportAlarmVoiceTips)){
			eventHandler.VoiceEnable = $("#PDVoice").prop("checked");
		}else{
			SaveAlarmToneType(eventHandler,"#hu_AbAlarmToneType","#hu_AbAlarmTone");
		}
	}
	function SaveAllFaceEnable(nIndex){
		if(nIndex < gDevice.loginRsp.VideoInChannel){
			var Enable = HumanCfg[0][HumanCfg[0].Name].Enable;
			if(!Enable && faceFunc[0] && faceFunc[nIndex]){
				var cfgName = "Detect.FaceDetection.[" + nIndex + "].Enable";
				var object = {"Name": cfgName};
				object[object.Name] = Enable;
				RfParamCall(function(a,b){
					SaveAllFaceEnable(nIndex + 1);
				}, pageTitle, cfgName, -1, WSMsgID.WsMsgID_CONFIG_SET, object);
			}else{
				SaveAllFaceEnable(nIndex + 1);
			}
		}else{
			ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
			FillAlarmType();
		}
	}
	function SaveAllCfg(){
		var CfgData = {
			"Name": "Detect.HumanDetectionDVR.[ff]",
			"Detect.HumanDetectionDVR.[ff]": cloneObj(HumanCfg[0][HumanCfg[0].Name])
		};
		SetAlarmLinkAllEnable(CfgData);
		RfParamCall(function (data){
			SaveAllFaceEnable(0);
		}, pageTitle, CfgData.Name, -1, WSMsgID.WsMsgID_CONFIG_SET, CfgData);
	}
	function SaveCfg(nIndex){
		if(nIndex < gDevice.loginRsp.VideoInChannel){
			if(bGet[nIndex]){
				RfParamCall(function (data){
					var Enable = HumanCfg[nIndex][HumanCfg[nIndex].Name].Enable;
					if(!Enable && faceFunc[nIndex]){	
						var cfgName = "Detect.FaceDetection.[" + nIndex + "].Enable";
						var object = {"Name": cfgName};
						object[object.Name] = Enable;
						RfParamCall(function(a,b){
							SaveCfg(nIndex + 1);
						}, pageTitle, cfgName, -1, WSMsgID.WsMsgID_CONFIG_SET, object);
					}else{
						SaveCfg(nIndex + 1);
					}
				}, pageTitle, "Detect.HumanDetectionDVR", nIndex, WSMsgID.WsMsgID_CONFIG_SET, HumanCfg[nIndex]);
			}else{
				SaveCfg(nIndex + 1);
			}
		}else{
			ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
		}
	}
    $(function () {
		if (bNoMulityAlarmLink){
			$("#AlarmLinkBox").css("display", "");
			$("#MulityAlarmLinkBox").css("display", "none");
			$("#PD_enableBox").addClass("group-box").css("margin-top", "5px");
		}else{
			$("#AlarmLinkBox").css("display", "none");
			$("#MulityAlarmLinkBox").css("display", "");
		}
		if(gDevice.bGetDefault){
			$("#PD_Default").css("display", "");
		}
		if (GetFunAbility(gDevice.Ability.AlarmFunction.ScreenTip)){
			$("#PD_ShowMessageBox").css("display", "");
		}
		if (GetFunAbility(gDevice.Ability.TipShow.NoEmailTipShow)) {
			$("#PD_SendEmailBox").css("display", "none")
		}
		if (!bRecord) {
			$("#PD_DivBoxRecord, #PD_RecordDelayDiv, #PD_RecordBox").css("display", "none");
		}else {
			recChannel("PD_RecChannelDiv", color, bColor);
			ChannelH = $("#PD_DivBoxRecord").height();
			$("#PD_DivBoxRecord .MaskDiv").css("height", ChannelH + "px");
		}
		if(!bSnap) {
			$("#PD_DivBoxSnap, #PD_SnapBox").css("display", "none");
		}else {
			recChannel("PD_SnapChannelDiv", color, bColor);
			ChannelH = $("#PD_DivBoxSnap").height();
			$("#PD_DivBoxSnap .MaskDiv").css("height", ChannelH + "px");
		}
		
		if(!GetFunAbility(gDevice.Ability.NetServerFunction.NetPMS)){
			$("#PD_PhoneBox").css("display", "none");
		}
		if (GetFunAbility(gDevice.Ability.TipShow.NoFTPTipShow) || !GetFunAbility(gDevice.Ability.NetServerFunction.NetFTP)){
			$("#PD_FTPBox").css("display", "none");
		}
		if (!GetFunAbility(gDevice.Ability.OtherFunction.SupportWriteLog)) {
			$("#PD_WriteLogBox").css("display", "none");
		}
		if(!GetFunAbility(gDevice.Ability.OtherFunction.SupportAlarmVoiceTips)){
			$("#PD_VoiceBox").css("display", "none");
		}
		if(gDevice.loginRsp.BuildTime >= "2011-11-14 13:53:32"){
			var bPtz = GetFunAbility(gDevice.Ability.CommFunction.CommRS485);
			bPtz &= (gDevice.loginRsp.ChannelNum > 0);
			if(bPtz){
				$("#PD_PTZSetDiv").css("display", "");
				$("#PD_RecordDelayDiv").css("margin-left", "400px");
			}else{
				$("#PD_PTZSetDiv").css("display", "none");
				$("#PD_RecordDelayDiv").css("margin-left", "0px");
				$("#PDRecordDelay").removeClass("timeTxt");
			}
		}
		recChannel("PD_TourChannelDiv", color, bColor);
		ChannelH = $("#PD_DivBoxTour").height();
		$("#PD_DivBoxTour .MaskDiv").css("height", ChannelH + "px");
		
		if(gDevice.loginRsp.AlarmOutChannel == 0){
			$("#PD_AOEvent").css("display", "none");
		}else {
			recChannel("PD_AOChannelDiv", color, bColor, gDevice.loginRsp.AlarmOutChannel);
			ChannelH = $("#PD_AOEvent").height();
			$("#PD_AOEvent .MaskDiv").css("height", ChannelH + "px");
		}
		// for(var j = 1; j <= 6; j++){
		// 	var level = lg.get("IDS_SSV_" + j);
		// 	$("#PD_Sensitive").append('<option value="' + j + '">' + level + '</option>');
		// }
		
		$('#DivBoxAll :checked').prop("checked",false);
		ChangeBtnState2();
		$("#PD_SV").click(function () {
			var nChn = $("#PDChannelMask").val() * 1;
			if (nChn == gDevice.loginRsp.VideoInChannel && (gDevice.loginRsp.SoftWareVersion > "V2.62.R07" || gDevice.loginRsp.BuildTime > "2024-04-01")){
				SaveHumanCfg(0);
				SaveAllCfg();
			}else{
				SaveHumanCfg(nChn);
				SaveCfg(0);
			}
		});
		$("#PD_Period").click(function() {	
			MasklayerShow(1);
			SetWndTop("#period_dialog", 60);
			$("#period_dialog").show(function(){
				var nIndex = chnIndex;
				if(chnIndex == gDevice.loginRsp.VideoInChannel){
					nIndex = 0;
				}
				var timeSection = HumanCfg[nIndex][HumanCfg[nIndex].Name].EventHandler.TimeSection;
				ShowPeriodWnd(timeSection, AlarmTypeEnum.Human);
			});
		});
		$("#PD_PTZSet").click(function() {
			MasklayerShow(1);
			if(gDevice.loginRsp.ChannelNum <= 32){
				SetWndTop("#PtzLink_dialog", 60);
			}else{
				SetWndTop("#PtzLink_dialog");
			}
			$("#PtzLink_dialog").show(function(){
				var nIndex = chnIndex;
				if(chnIndex == gDevice.loginRsp.VideoInChannel){
					nIndex = 0;
				}
				var PtzCfg = HumanCfg[nIndex][HumanCfg[nIndex].Name].EventHandler.PtzLink;
				ShowPTZ(PtzCfg, AlarmTypeEnum.Human);
			});
		});
		$("#PD_Rf").click(function () {
			FillAlarmType();
		});
		$("#PDChannelMask").change(function () {
			var nChn = $(this).val() * 1;
			if(nChn == gDevice.loginRsp.VideoInChannel){
				GetHumanCfg(0);
				chnIndex = nChn;
			}else if(chnIndex == gDevice.loginRsp.VideoInChannel){
				GetHumanCfg(nChn);
				chnIndex = nChn;
			}else{
				SaveHumanCfg(chnIndex);
				GetHumanCfg(nChn);
				chnIndex = nChn;
			}
		});
		$("#PD_COPY").click(function () {	
			var nChn = $("#PDChannelMask").val() * 1;
			if (nChn == gDevice.loginRsp.VideoInChannel){
				nChn = 0;
			}
			SaveHumanCfg(nChn);
			copyCfg = cloneObj(HumanCfg[nChn]);
			bCopy = true; 
		});
		$("#PD_Paste").click(function () {
			if(!bCopy) return;
			$(".rightEx > div[name='all']").css({
				"background-color": "transparent",
				color: "inherit"
			});
			var cfg = copyCfg[copyCfg.Name];
			var btnFlag = cfg.Enable?1:0;
			$("#PD_ChnSwitch").attr("data", btnFlag);
			//$("#PD_Sensitive").val(cfg.Level);
			$("#PDLoiter").val(cfg.LoiterLatch);
			var eventHandler = cfg.EventHandler;
			$("#PDLights").attr("data", eventHandler.ShowInfo?1:0);
			$("#PDEventLatch").val(eventHandler.EventLatch);	
			$("#PDSendEmail").prop("checked", eventHandler.MailEnable);
			$("#PDShowMessage").prop("checked", eventHandler.TipEnable);       
			$("#PDPhone").prop("checked", eventHandler.MessageEnable);
			$("#PDFTP").prop("checked", eventHandler.FTPEnable);
			$("#PDWriteLog").prop("checked", eventHandler.LogEnable);
			if(gDevice.loginRsp.AlarmOutChannel > 0){
				$("#PDAODelay").val(eventHandler.AlarmOutLatch);
				ShowMask("#PD_AOChannelDiv > div[name!='all']", eventHandler.AlarmOutMask);
			}
			if(bRecord){
				$("#PDRecordDelay").val(eventHandler.RecordLatch);
				if(bNoMulityAlarmLink){
					$("#PDRecord").prop("checked", eventHandler.RecordEnable);
				}else{
					ShowMask("#PD_RecChannelDiv > div[name!='all']", eventHandler.RecordMask);
				}
			}
			if(bNoMulityAlarmLink){
				$("#PDTour").prop("checked", eventHandler.TourEnable);
			}else{
				ShowMask("#PD_TourChannelDiv > div[name!='all']", eventHandler.TourMask);
			}
			if(bSnap){
				if(bNoMulityAlarmLink){
					$("#PDSnap").prop("checked", eventHandler.SnapEnable);
				}else{
					ShowMask("#PD_SnapChannelDiv > div[name!='all']", eventHandler.SnapShotMask);
				}
			}
			var nChn = $("#PDChannelMask").val() * 1;
			if (nChn == gDevice.loginRsp.VideoInChannel){
				for (var k = 0; k < gDevice.loginRsp.VideoInChannel; k++){
					if (!bGet[k]) continue;
					var cfgHanlder = HumanCfg[k][HumanCfg[k].Name].EventHandler;
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
				var cfgHanlder = HumanCfg[nChn][HumanCfg[nChn].Name].EventHandler;
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
			if(GetFunAbility(gDevice.Ability.OtherFunction.SupportAlarmVoiceTips)){
				$("#PDVoice").prop("checked", eventHandler.VoiceEnable);
			}else{
				SetAlarmToneType(eventHandler,"#hu_AbAlarmToneType","#hu_AbAlarmTone");
				ChangeVoiceType("#hu_AbAlarmToneType","#hu_alarmAndCustom");
			}
			OnClickedEnable();
			InitButton2();
		});
		$("#PD_ChnSwitch").click(function() {
			OnClickedEnable();
		});
		$("#hu_AbAlarmToneType").change(function(){
			ChangeVoiceType("#hu_AbAlarmToneType","#hu_alarmAndCustom");
		})
		$("#hu_AbAlarmToneCustomButton").click(function(){
			var cmd={
				"FilePurpose":7
			};
			ShowVoiceCustomDlg(-1,cmd,pageTitle);
		});
		$("#PD_Default").click(function() {
			var nIndex = $("#PDChannelMask").val() * 1;
			if (nIndex == gDevice.loginRsp.VideoInChannel){
				nIndex = 0;
			}
			RfParamCall(function(a){
				HumanCfg[nIndex] = a;
				var timeSection = HumanCfg[nIndex][HumanCfg[nIndex].Name].EventHandler.TimeSection;
				for(var i = 0; i < timeSection.length; i++){
					if(isObject(timeSection[i])){
						for(var j = 0; j < timeSection[i].length ; j++){
							if(timeSection[i][j] == ""){
								timeSection[i][j] = "0 00:00:00-00:00:00";
							}
						}
					}
				}
				HumanCfg[nIndex][HumanCfg[nIndex].Name].EventHandler.TimeSection = timeSection;
				bGet[nIndex] = true;
				ShowData(nIndex);
				MasklayerHide();
			}, pageTitle, "Detect.HumanDetectionDVR", nIndex, WSMsgID.WsMsgID_DEFAULTCONFIG_GET);
		});
		FillAlarmType();
    });
});