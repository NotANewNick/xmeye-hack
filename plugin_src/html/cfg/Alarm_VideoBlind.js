//# sourceURL=Alarm_VideoBlind.js
$(function () {
	var color = gVar.skin_mColor;
    var bColor = gVar.skin_bColor;
    var BlindCfg = new Array;
    var chnIndex = -1;
	var bGet = new Array;
	var copyCfg = null;
    var bCopy = false;
	var ChannelH;
    var pageTitle = $("#Alarm_VideoBlind").text();
	var bIPC = gDevice.devType == devTypeEnum.DEV_IPC ? true : false;
	var bRecord = !GetFunAbility(gDevice.Ability.OtherFunction.NOHDDRECORD);
	var bSnap = (GetFunAbility(gDevice.Ability.EncodeFunction.SnapStream) || GetFunAbility(gDevice.Ability.OtherFunction.SupportSnapSchedule));
	var bNoMulityAlarmLink = GetFunAbility(gDevice.Ability.OtherFunction.NoSupportMulityAlarmLink);
	function ShowData(nIndex) {
		$(".rightEx > div[name='all']").css({
			"background-color": "transparent",
			color: "inherit"
		});
		var chnCfg = null;
		chnCfg = BlindCfg[nIndex][BlindCfg[nIndex].Name];
		var btnFlag = chnCfg.Enable?1:0;
		$("#VBChnSwitch").attr("data", btnFlag);
		$("#VBSensitivity").val(chnCfg.Level);
		var eventHandler = chnCfg.EventHandler;
		$("#VBSendEmail").prop("checked", eventHandler.MailEnable);
		$("#VBShowMessage").prop("checked", eventHandler.TipEnable);       
		$("#VBPhone").prop("checked", eventHandler.MessageEnable);
		$("#VBFTP").prop("checked", eventHandler.FTPEnable);
		$("#VBWriteLog").prop("checked", eventHandler.LogEnable );
		if(gDevice.loginRsp.AlarmOutChannel > 0){
			$("#VBAODelay").val(eventHandler.AlarmOutLatch);
			ShowMask("#VB_AOChannelDiv > div[name!='all']", eventHandler.AlarmOutMask);
		}
		if(bRecord){
			$("#VBRecordDelay").val(eventHandler.RecordLatch);
			if(bNoMulityAlarmLink){
				$("#VBRecord").prop("checked", eventHandler.RecordEnable);
			}
			else {
				ShowMask("#VB_RecChannelDiv > div[name!='all']", eventHandler.RecordMask);
			}
		}
		if(bNoMulityAlarmLink){
			$("#VBTour").prop("checked", eventHandler.TourEnable);
		}
		else {
			ShowMask("#VB_TourChannelDiv > div[name!='all']", eventHandler.TourMask);
		}
		
		if(bSnap){
			if(bNoMulityAlarmLink){
				$("#VBSnap").prop("checked", eventHandler.SnapEnable);
			}
			else {
				ShowMask("#VB_SnapChannelDiv > div[name!='all']", eventHandler.SnapShotMask);
			}
		}
		SetAlarmToneType(eventHandler,"#bl_AbAlarmToneType","#bl_AbAlarmTone");
		ChangeVoiceType("#bl_AbAlarmToneType","#bl_alarmAndCustom");
		OnClickedEnable();
		InitButton();
		MasklayerHide();
	}
	function GetBlindCfg(nIndex){
		if(!bGet[nIndex]){
			RfParamCall(function(a,b){
				BlindCfg[nIndex] = a;
				var timeSection = BlindCfg[nIndex][BlindCfg[nIndex].Name].EventHandler.TimeSection;
				for(var i = 0; i < timeSection.length; i++){
					if(isObject(timeSection[i])){
						for(var j = 0; j < timeSection[i].length ; j++){
							if(timeSection[i][j] == ""){
								timeSection[i][j] = "0 00:00:00-00:00:00";
							}
						}
					}
				}
				BlindCfg[nIndex][BlindCfg[nIndex].Name].EventHandler.TimeSection = timeSection;
				bGet[nIndex] = true;
				ShowData(nIndex);
			}, pageTitle, "Detect.BlindDetect", nIndex, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			ShowData(nIndex);
		}
	}
	function InitChannel(){
		bCopy = false;
		copyCfg = null;	
		var j;
		for (j = 0; j < gDevice.loginRsp.ChannelNum; j++) {
			BlindCfg[j] = null;
			bGet[j] = false;
		}
		var nIndex = chnIndex;
		if(nIndex == gDevice.loginRsp.ChannelNum){
			nIndex = 0;
		}
		GetBlindCfg(nIndex);
	}
	function FillAlarmType(){
		GetLocalVoiceTipType("Detect.BlindDetect", function(){
			GetAlarmToneType("Detect.BlindDetect","#bl_Alarm_tone","#bl_AbAlarmToneType","#bl_AbAlarmTone");
			InitChannel();
		});
	}
	function CHOSDSaveSel(nIndex) {
		var chnCfg = BlindCfg[nIndex][BlindCfg[nIndex].Name];
		if(isObject(chnCfg)){
			chnCfg.Enable = $("#VBChnSwitch").attr("data") * 1?true:false;
			chnCfg.Level = $("#VBSensitivity").val()*1;
			var eventHandler = chnCfg.EventHandler;
			if(gDevice.loginRsp.AlarmOutChannel > 0){
				eventHandler.AlarmOutLatch = $("#VBAODelay").val() * 1;
				eventHandler.AlarmOutMask = GetMasks("#VB_AOChannelDiv > div[name!='all']");
				eventHandler.AlarmOutEnable = false;
				if (parseInt(eventHandler.AlarmOutMask) > 0){
					eventHandler.AlarmOutEnable = true;
				}
			}
			if(bRecord){
				eventHandler.RecordLatch = $("#VBRecordDelay").val() * 1;
				if (bNoMulityAlarmLink){
					eventHandler.RecordEnable = $("#VBRecord").prop("checked");
					eventHandler.RecordMask = GetSingleChnMasks(eventHandler.RecordEnable, nIndex);
				}else{
					eventHandler.RecordMask = GetMasks("#VB_RecChannelDiv > div[name!='all']");
					eventHandler.RecordEnable = false;
					if (parseInt(eventHandler.RecordMask) > 0) {
						eventHandler.RecordEnable = true;						
					}
				}
			}
			if (bNoMulityAlarmLink){
				eventHandler.TourEnable = $("#VBTour").prop("checked");
				eventHandler.TourMask = GetSingleChnMasks(eventHandler.TourEnable, nIndex);
			}else{
				eventHandler.TourMask = GetMasks("#VB_TourChannelDiv > div[name!='all']");
				eventHandler.TourEnable = false;
				if (parseInt(eventHandler.TourMask)){
					eventHandler.TourEnable = true;
				}
			}
			if(bSnap){
				if (bNoMulityAlarmLink){
					eventHandler.SnapEnable = $("#VBSnap").prop("checked");
					eventHandler.SnapShotMask = GetSingleChnMasks(eventHandler.SnapEnable, nIndex);
				}else{
					eventHandler.SnapShotMask = GetMasks("#VB_SnapChannelDiv > div[name!='all']");
					eventHandler.SnapEnable = false;
					if (parseInt(eventHandler.SnapShotMask) > 0) {
						eventHandler.SnapEnable = true;
					}
				}
			}
			eventHandler.MailEnable = $("#VBSendEmail").prop("checked");
			eventHandler.TipEnable = $("#VBShowMessage").prop("checked");       
			eventHandler.MessageEnable = $("#VBPhone").prop("checked");
			eventHandler.FTPEnable = $("#VBFTP").prop("checked");
			eventHandler.LogEnable = $("#VBWriteLog").prop("checked");
			SaveAlarmToneType(eventHandler,"#bl_AbAlarmToneType","#bl_AbAlarmTone");
			return true;
		}
		return false;
    }
	function SaveAllCfg(){
		var CfgData = {
			"Name": "Detect.BlindDetect.[ff]",
			"Detect.BlindDetect.[ff]": cloneObj(BlindCfg[0][BlindCfg[0].Name])
		};
		SetAlarmLinkAllEnable(CfgData);
		RfParamCall(function (data){
			ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
			FillAlarmType();
		}, pageTitle, CfgData.Name, -1, WSMsgID.WsMsgID_CONFIG_SET, CfgData);
	}
	function SaveCfg(nIndex){
		if(nIndex < gDevice.loginRsp.ChannelNum){
			if(bGet[nIndex]){
				RfParamCall(function (data){
					SaveCfg(nIndex + 1);
				}, pageTitle, "Detect.BlindDetect", nIndex, WSMsgID.WsMsgID_CONFIG_SET, BlindCfg[nIndex]);
			}else{
				SaveCfg(nIndex + 1);
			}
		}else{
			ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
		}
	}
	function OnClickedEnable(){
		var _flag = $("#VBChnSwitch").attr("data") * 1;
        DivBox(_flag, "#VBDivBoxAll");
		if(_flag){
			$("#VBDivBoxAll .MaskDiv").css("display", "none");
		}else{
			$("#VBDivBoxAll .MaskDiv").css("display", "block");
		}
	}
	$(function(){
		if (bNoMulityAlarmLink){
			$("#AlarmLinkBox").css("display", "");
			$("#MulityAlarmLinkBox").css("display", "none");
			$("#VB_enableBox").addClass("group-box").css("margin-top", "5px");
		}else{
			$("#AlarmLinkBox").css("display", "none");
			$("#MulityAlarmLinkBox").css("display", "");
		}				
		if (GetFunAbility(gDevice.Ability.AlarmFunction.ScreenTip)){
			$("#VB_ShowMessageBox").css("display", "");
		}
		if (bIPC) {
			$("#table_channel, #VB_DivBoxTour, #VB_TourBox, #VB_ShowMessageBox, #VBCP, #VBPaste").css("display", "none");
		}
		if(gDevice.bGetDefault){
			$("#VBDefault").css("display", "");
		}
		if (GetFunAbility(gDevice.Ability.TipShow.NoEmailTipShow)) {
			$("#VB_SendEmailBox").css("display", "none")
		}
		if (!bRecord) {
			$("#VB_DivBoxRecord, #VB_RecordDelayDiv, #VB_RecordBox").css("display", "none");
		}else {
			recChannel("VB_RecChannelDiv", color, bColor);
			ChannelH = $("#VB_DivBoxRecord").height();
			$("#VB_DivBoxRecord .MaskDiv").css("height", ChannelH + "px");
		}
		if(!bSnap) {
			$("#VB_DivBoxSnap, #VB_SnapBox").css("display", "none");
		}else {
			recChannel("VB_SnapChannelDiv", color, bColor);	
			ChannelH = $("#VB_DivBoxSnap").height();
			$("#VB_DivBoxSnap .MaskDiv").css("height", ChannelH + "px");
		}
		if(!GetFunAbility(gDevice.Ability.NetServerFunction.NetPMS)){
			$("#VB_PhoneBox").css("display", "none");
		}

		if (GetFunAbility(gDevice.Ability.TipShow.NoFTPTipShow) || !GetFunAbility(gDevice.Ability.NetServerFunction.NetFTP)){
			$("#VB_FTPBox").css("display", "none");
		}
		if (!GetFunAbility(gDevice.Ability.OtherFunction.SupportWriteLog)) {
			$("#VB_WriteLogBox").css("display", "none");
		}
		if(gDevice.loginRsp.BuildTime >= "2011-11-14 13:53:32"){
			var bPtz = GetFunAbility(gDevice.Ability.CommFunction.CommRS485);
			bPtz &= (gDevice.loginRsp.ChannelNum > 0);
			if(bPtz){
				$("#VB_PTZSetDiv").css("display", "");
				$("#VB_RecordDelayDiv").css("margin-left", "400px");
			}else{
				$("#VB_PTZSetDiv").css("display", "none");
				$("#VB_RecordDelayDiv").css("margin-left", "0px");
				$("#VBRecordDelay").removeClass("timeTxt");
			}
		}
		recChannel("VB_TourChannelDiv", color, bColor);
		ChannelH = $("#VB_DivBoxTour").height();
		$("#VB_DivBoxTour .MaskDiv").css("height", ChannelH + "px");
		if(gDevice.loginRsp.AlarmOutChannel == 0){
			$("#VB_AOEvent").css("display", "none");
		}else {
			recChannel("VB_AOChannelDiv", color, bColor, gDevice.loginRsp.AlarmOutChannel);
			ChannelH = $("#VB_AOEvent").height();
			$("#VB_AOEvent .MaskDiv").css("height", ChannelH + "px");
		}
		for(var j = 1; j <= 6; j++){
			var level = lg.get("IDS_SSV_" + j);
			$("#VBSensitivity").append('<option value="' + j + '">' + level + '</option>');
		}
		$('#VBDivBoxAll :checked').prop("checked",false);
		$("#vb_btn_box").css("margin-left", "115px");
		ChangeBtnState();
		$("#VBChid").empty();
		var dataHtml = '';
		var j;
		for (j = 0; j < gDevice.loginRsp.ChannelNum; j++) {
			BlindCfg[j] = null;
			bGet[j] = false;
			dataHtml += '<option value="' + j + '">' + gDevice.getChannelName(j) + '</option>';
		}		
		if(gDevice.loginRsp.ChannelNum > 1){
			dataHtml += '<option value="' + j + '">' + lg.get("IDS_CFG_ALL") + '</option>';

		}
		$("#VBChid").append(dataHtml);
		if(chnIndex == -1){
			chnIndex = 0;
		}
		$("#VBChid").val(chnIndex);
		$("#VBChid").change(function () {
			var nChn = $("#VBChid").val() * 1;	
			if (nChn == gDevice.loginRsp.ChannelNum){
				GetBlindCfg(0);
				chnIndex = nChn;
			}else if ( chnIndex == gDevice.loginRsp.ChannelNum){
				GetBlindCfg(nChn);
				chnIndex = nChn;
			}else {
				CHOSDSaveSel(chnIndex);
				GetBlindCfg(nChn);
				chnIndex = nChn;
			}
		});
		$("#VBRf").click(function () {
			FillAlarmType();
		});
		$("#VBSave").click(function () {
			var nChn = $("#VBChid").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum && (gDevice.loginRsp.SoftWareVersion > "V2.62.R07" || gDevice.loginRsp.BuildTime > "2024-04-01")){
				CHOSDSaveSel(0);
				SaveAllCfg();
			}else{
				CHOSDSaveSel(nChn);
				SaveCfg(0);
			}
		});
		$("#VBCP").click(function () {
			var nChn = $("#VBChid").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum){
				nChn = 0;
			}
			CHOSDSaveSel(nChn);
			copyCfg = cloneObj(BlindCfg[nChn]);
			bCopy = true; 
		});
		$("#VBPaste").click(function () {
			if(!bCopy) return;
			$(".rightEx > div[name='all']").css({
				"background-color": "transparent",
				color: "inherit"
			});
			var cfg = copyCfg[copyCfg.Name];		
			var btnFlag = cfg.Enable?1:0;
			$("#VBChnSwitch").attr("data", btnFlag);
			$("#VBSensitivity").val(cfg.Level);
			var eventHandler = cfg.EventHandler;
			$("#VBSendEmail").prop("checked", eventHandler.MailEnable);
			$("#VBShowMessage").prop("checked", eventHandler.TipEnable);       
			$("#VBPhone").prop("checked", eventHandler.MessageEnable);
			$("#VBFTP").prop("checked", eventHandler.FTPEnable);
			$("#VBWriteLog").prop("checked", eventHandler.LogEnable );
			if(gDevice.loginRsp.AlarmOutChannel > 0){
				$("#VBAODelay").val(eventHandler.AlarmOutLatch);
				ShowMask("#VB_AOChannelDiv > div[name!='all']", eventHandler.AlarmOutMask);
			}
			if(bRecord){
				$("#VBRecordDelay").val(eventHandler.RecordLatch);
				if(bNoMulityAlarmLink){
					$("#VBRecord").prop("checked", eventHandler.RecordEnable);
				}
				else {
					ShowMask("#VB_RecChannelDiv > div[name!='all']", eventHandler.RecordMask);
				}
			}
			if(bNoMulityAlarmLink){
				$("#VBTour").prop("checked", eventHandler.TourEnable);
			}
			else {
				ShowMask("#VB_TourChannelDiv > div[name!='all']", eventHandler.TourMask);
			}
			if(bSnap){
				if(bNoMulityAlarmLink){
					$("#VBSnap").prop("checked", eventHandler.SnapEnable);
				}
				else {
					ShowMask("#VB_SnapChannelDiv > div[name!='all']", eventHandler.SnapShotMask);
				}
			}
			var nChn = $("#VBChid").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum){
				for (var k = 0; k < gDevice.loginRsp.ChannelNum; k++){
					if (!bGet[k]) continue;
					var cfgHanlder = BlindCfg[k][BlindCfg[k].Name].EventHandler;
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
				var cfgHanlder = BlindCfg[nChn][BlindCfg[nChn].Name].EventHandler;
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
			SetAlarmToneType(eventHandler,"#bl_AbAlarmToneType","#bl_AbAlarmTone");
			ChangeVoiceType("#bl_AbAlarmToneType","#bl_alarmAndCustom");
			OnClickedEnable();
			InitButton();
		});
		$("#VB_Period").click(function() {	
			MasklayerShow(1);
			SetWndTop("#period_dialog", 60);
			$("#period_dialog").show(function(){
				var nIndex = chnIndex;
				if(chnIndex == gDevice.loginRsp.ChannelNum){
					nIndex = 0;
				}
				var timeSection = BlindCfg[nIndex][BlindCfg[nIndex].Name].EventHandler.TimeSection;
				ShowPeriodWnd(timeSection, AlarmTypeEnum.Blind);
			});
		});
		$("#VB_PTZSet").click(function() {
			MasklayerShow(1);
			if(gDevice.loginRsp.ChannelNum <= 32){
				SetWndTop("#PtzLink_dialog", 60);
			}else{
				SetWndTop("#PtzLink_dialog");
			}
			$("#PtzLink_dialog").show(function(){
				var nIndex = chnIndex;
				if(chnIndex == gDevice.loginRsp.ChannelNum){
					nIndex = 0;
				}
				var PtzCfg = BlindCfg[nIndex][BlindCfg[nIndex].Name].EventHandler.PtzLink;
				ShowPTZ(PtzCfg, AlarmTypeEnum.Blind);
			});
		});
		$("#VBChnSwitch").click(function () {
			OnClickedEnable();
		});
		$("#bl_AbAlarmToneType").change(function(){
			ChangeVoiceType("#bl_AbAlarmToneType","#bl_alarmAndCustom");
		})
		$("#bl_AbAlarmToneCustomButton").click(function () {
			var cmd={
				"FilePurpose":7
			};
			var chn= $("#VBChid").val() * 1;
			if(chn == gDevice.loginRsp.ChannelNum){
				chn = -1;
			}
			ShowVoiceCustomDlg(chn,cmd,pageTitle);
		});
		$("#VBDefault").click(function() {
			var nIndex = $("#VBChid").val() * 1;
			if (nIndex == gDevice.loginRsp.ChannelNum){
				nIndex = 0;
			}
			RfParamCall(function(a,b){
				BlindCfg[nIndex] = a;
				var timeSection = BlindCfg[nIndex][BlindCfg[nIndex].Name].EventHandler.TimeSection;
				for(var i = 0; i < timeSection.length; i++){
					if(isObject(timeSection[i])){
						for(var j = 0; j < timeSection[i].length ; j++){
							if(timeSection[i][j] == ""){
								timeSection[i][j] = "0 00:00:00-00:00:00";
							}
						}
					}
				}
				BlindCfg[nIndex][BlindCfg[nIndex].Name].EventHandler.TimeSection = timeSection;
				bGet[nIndex] = true;
				ShowData(nIndex);
			}, pageTitle, "Detect.BlindDetect", nIndex, WSMsgID.WsMsgID_DEFAULTCONFIG_GET);
		});
		FillAlarmType();
	});
});
