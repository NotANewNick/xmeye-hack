//# sourceURL=Alarm_VideoLoss.js
$(function () {
	var color = gVar.skin_mColor;
    var bColor = gVar.skin_bColor;
    var LossCfg = new Array;
    var chnIndex = -1;
	var bGet = new Array;
	var copyCfg = null;
    var bCopy = false;
    var pageTitle = $("#Alarm_VideoLoss").text();
	var ChannelH;
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
		chnCfg = LossCfg[nIndex][LossCfg[nIndex].Name];
		var btnFlag = chnCfg.Enable?1:0;
		$("#VLChnSwitch").attr("data", btnFlag);
		var eventHandler = chnCfg.EventHandler;
	        $("#VLSendEmail").prop("checked", eventHandler.MailEnable);
	        $("#VLShowMessage").prop("checked", eventHandler.TipEnable);       
	        $("#VLPhone").prop("checked", eventHandler.MessageEnable);
	        $("#VLFTP").prop("checked", eventHandler.FTPEnable);
	        $("#VLWriteLog").prop("checked", eventHandler.LogEnable );
		if(gDevice.loginRsp.AlarmOutChannel > 0){
			$("#VLAODelay").val(eventHandler.AlarmOutLatch);
			ShowMask("#VL_AOChannelDiv > div[name!='all']", eventHandler.AlarmOutMask);
		}
		if(bRecord){
			$("#VLRecordDelay").val(eventHandler.RecordLatch);
			if(bNoMulityAlarmLink){
				$("#VLRecord").prop("checked", eventHandler.RecordEnable);
			}else{
       	 			ShowMask("#VL_RecChannelDiv > div[name!='all']", eventHandler.RecordMask);
			}
		}
		if(bNoMulityAlarmLink){
			$("#VLTour").prop("checked", eventHandler.TourEnable);
		}else{
			ShowMask("#VL_TourChannelDiv > div[name!='all']", eventHandler.TourMask);
		}
		if(bSnap){
			if(bNoMulityAlarmLink){
				$("#VLSnap").prop("checked", eventHandler.SnapEnable);
			}else{
				ShowMask("#VL_SnapChannelDiv > div[name!='all']", eventHandler.SnapShotMask);
			}
		}
		if(nIndex<gDevice.loginRsp.VideoInChannel){
			$("#lo_AbAlarmTone"+" option[voiceEnum='"+3+"']").remove();
		}else{
			$("#lo_AbAlarmTone"+" option[voiceEnum='"+5+"']").remove();
		}
		SetAlarmToneType(eventHandler,"#lo_AbAlarmToneType","#lo_AbAlarmTone");
		ChangeVoiceType("#lo_AbAlarmToneType","#lo_alarmAndCustom");
		OnClickedEnable();
		InitButton();
		MasklayerHide();
	}
	function GetLossCfg(nIndex){
		if(!bGet[nIndex]){
			RfParamCall(function(a,b){
				LossCfg[nIndex] = a;
				var timeSection = LossCfg[nIndex][LossCfg[nIndex].Name].EventHandler.TimeSection;
				for(var i = 0; i < timeSection.length; i++){
					if(isObject(timeSection[i])){
						for(var j = 0; j < timeSection[i].length ; j++){
							if(timeSection[i][j] == ""){
								timeSection[i][j] = "0 00:00:00-00:00:00";
							}
						}
					}
				}
				LossCfg[nIndex][LossCfg[nIndex].Name].EventHandler.TimeSection = timeSection;
				bGet[nIndex] = true;
				ShowData(nIndex);
			}, pageTitle, "Detect.LossDetect", nIndex, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			ShowData(nIndex);
		}
	}
	function InitChannel(){
		bCopy = false;
		copyCfg = null;
		var j;
		for (j = 0; j < gDevice.loginRsp.ChannelNum; j++) {
			LossCfg[j] = null;
			bGet[j] = false;
		}
		var nIndex = chnIndex;
		if(nIndex == gDevice.loginRsp.ChannelNum){
			nIndex = 0;
		}
		GetLossCfg(nIndex);
	}
	function FillAlarmType(){
		GetLocalVoiceTipType("Detect.LossDetect", function(){
			GetAlarmToneType("Detect.LossDetect","#lo_Alarm_tone","#lo_AbAlarmToneType","#lo_AbAlarmTone");
			InitChannel();
		});
	}
	function CHOSDSaveSel(nIndex) {
		var chnCfg = LossCfg[nIndex][LossCfg[nIndex].Name];
		if(isObject(chnCfg)){
			chnCfg.Enable = $("#VLChnSwitch").attr("data") * 1?true:false;
			var eventHandler = chnCfg.EventHandler;
			if(gDevice.loginRsp.AlarmOutChannel > 0){
				eventHandler.AlarmOutLatch = $("#VLAODelay").val() * 1;
				eventHandler.AlarmOutMask = GetMasks("#VL_AOChannelDiv > div[name!='all']");
				eventHandler.AlarmOutEnable = false;
				if (parseInt(eventHandler.AlarmOutMask) > 0){
					eventHandler.AlarmOutEnable = true;
				}
			}
			if(bRecord){
				eventHandler.RecordLatch = $("#VLRecordDelay").val() * 1;
				if (bNoMulityAlarmLink){
					eventHandler.RecordEnable = $("#VLRecord").prop("checked");
					eventHandler.RecordMask = GetSingleChnMasks(eventHandler.RecordEnable, nIndex);
				}else{
					eventHandler.RecordMask = GetMasks("#VL_RecChannelDiv > div[name!='all']");
					eventHandler.RecordEnable = false;
					if (parseInt(eventHandler.RecordMask) > 0) {
						eventHandler.RecordEnable = true;
						}
					}
			}
			if (bNoMulityAlarmLink){
				eventHandler.TourEnable = $("#VLTour").prop("checked");
				eventHandler.TourMask = GetSingleChnMasks(eventHandler.TourEnable, nIndex);
			}else{
				eventHandler.TourMask = GetMasks("#VL_TourChannelDiv > div[name!='all']");
				eventHandler.TourEnable = false;
				if (parseInt(eventHandler.TourMask)){
					eventHandler.TourEnable = true;
				}
			}
			if(bSnap){
				if (bNoMulityAlarmLink){
					eventHandler.SnapEnable = $("#VLSnap").prop("checked");
					eventHandler.SnapShotMask = GetSingleChnMasks(eventHandler.SnapEnable, nIndex);
				}else{
					eventHandler.SnapShotMask = GetMasks("#VL_SnapChannelDiv > div[name!='all']");
					eventHandler.SnapEnable = false;
					if (parseInt(eventHandler.SnapShotMask) > 0) {
						eventHandler.SnapEnable = true;
					}
				}
			}
			eventHandler.MailEnable = $("#VLSendEmail").prop("checked");
			eventHandler.TipEnable = $("#VLShowMessage").prop("checked");       
			eventHandler.MessageEnable = $("#VLPhone").prop("checked");
			eventHandler.FTPEnable = $("#VLFTP").prop("checked");
			eventHandler.LogEnable = $("#VLWriteLog").prop("checked");
			SaveAlarmToneType(eventHandler,"#lo_AbAlarmToneType","#lo_AbAlarmTone");
			return true;
		}
		return false;
    }
	function SaveAllCfg(){
		var CfgData = {
			"Name": "Detect.LossDetect.[ff]",
			"Detect.LossDetect.[ff]": cloneObj(LossCfg[0][LossCfg[0].Name])
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
				}, pageTitle, "Detect.LossDetect", nIndex, WSMsgID.WsMsgID_CONFIG_SET, LossCfg[nIndex]);
			}else{
				SaveCfg(nIndex + 1);
			}
		}else{
			ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
		}
	}
	function OnClickedEnable(){
		var _flag = $("#VLChnSwitch").attr("data") * 1;
        	DivBox(_flag, "#VLDivBoxAll");
		if(_flag){
			$("#VLDivBoxAll .MaskDiv").css("display", "none");
		}else{
			$("#VLDivBoxAll .MaskDiv").css("display", "block");
		}
	}

	$(function(){
		if (bNoMulityAlarmLink){
			$("#AlarmLinkBox").css("display", "");
			$("#MulityAlarmLinkBox").css("display", "none");
			$("#VL_enableBox").addClass("group-box").css("margin-top", "5px");
		}else{
			$("#AlarmLinkBox").css("display", "none");
			$("#MulityAlarmLinkBox").css("display", "");
		}
		if (GetFunAbility(gDevice.Ability.AlarmFunction.ScreenTip)){
			$("#VL_ShowMessageBox").css("display", "");
		}
		if (bIPC) {
			$("#table_channel, #VL_DivBoxTour, #VL_TourBox,  #VL_ShowMessageBox, #VLCP, #VLPaste").css("display", "none");
		}
		if(gDevice.bGetDefault){
			$("#VLDefault").css("display", "");
		}
		if (GetFunAbility(gDevice.Ability.TipShow.NoEmailTipShow)) {
			$("#VL_SendEmailBox").css("display", "none")
		}
		if (!bRecord) {
			$("#VL_DivBoxRecord, #VL_RecordDelayDiv, #VL_RecordBox").css("display", "none");
		}else {
			recChannel("VL_RecChannelDiv", color, bColor);
			ChannelH = $("#VL_DivBoxRecord").height();
			$("#VL_DivBoxRecord .MaskDiv").css("height", ChannelH + "px");
		}
		if(!bSnap) {
			$("#VL_DivBoxSnap, #VL_SnapBox").css("display", "none");
		}else {
			recChannel("VL_SnapChannelDiv", color, bColor);
			ChannelH = $("#VL_DivBoxSnap").height();
			$("#VL_DivBoxSnap .MaskDiv").css("height", ChannelH + "px");
		}
		if(!GetFunAbility(gDevice.Ability.NetServerFunction.NetPMS)){
			$("#VL_PhoneBox").css("display", "none");
		}
		if (GetFunAbility(gDevice.Ability.TipShow.NoFTPTipShow) || !GetFunAbility(gDevice.Ability.NetServerFunction.NetFTP)){
			$("#VL_FTPBox").css("display", "none");
		}
		if (!GetFunAbility(gDevice.Ability.OtherFunction.SupportWriteLog)) {
			$("#VL_WriteLogBox").css("display", "none");
		}
		if(gDevice.loginRsp.BuildTime >= "2011-11-14 13:53:32"){
			var bPtz = GetFunAbility(gDevice.Ability.CommFunction.CommRS485);
			bPtz &= (gDevice.loginRsp.ChannelNum > 0);
			if(bPtz){
				$("#VL_PTZSetDiv").css("display", "");
				$("#VL_RecordDelayDiv").css("margin-left", "400px");
			}else{
				$("#VL_PTZSetDiv").css("display", "none");
				$("#VL_RecordDelayDiv").css("margin-left", "0px");
				$("#VLRecordDelay").removeClass("timeTxt");
			}
		}
		recChannel("VL_TourChannelDiv", color, bColor);
		ChannelH = $("#VL_DivBoxTour").height();
		$("#VL_DivBoxTour .MaskDiv").css("height", ChannelH + "px");
		if(gDevice.loginRsp.AlarmOutChannel == 0){
			$("#VL_AOEvent").css("display", "none");
		}else {
			recChannel("VL_AOChannelDiv", color, bColor, gDevice.loginRsp.AlarmOutChannel);
			ChannelH = $("#VL_AOEvent").height();
			$("#VL_AOEvent .MaskDiv").css("height", ChannelH + "px");
		}
		$('#VLDivBoxAll :checked').prop("checked",false);
		$("#vl_btn_box").css("margin-left", "115px");
		$("#VLChid").empty();
		var dataHtml = '';
		var j;
		for (j = 0; j < gDevice.loginRsp.ChannelNum; j++) {
			LossCfg[j] = null;
			bGet[j] = false;
			dataHtml += '<option value="' + j + '">' + gDevice.getChannelName(j) + '</option>';
		}		
		if(gDevice.loginRsp.ChannelNum > 1){
			dataHtml += '<option value="' + j + '">' + lg.get("IDS_CFG_ALL") + '</option>';

		}
		$("#VLChid").append(dataHtml);
		if(chnIndex == -1){
			chnIndex = 0;
		}
		$("#VLChid").val(chnIndex);
		ChangeBtnState();
		$("#VLChid").change(function () {
			var nChn = $("#VLChid").val() * 1;
			
			//选择全部通道，默认显示第一通道数据，而且上一通道的数据也不需要保存
			if (nChn == gDevice.loginRsp.ChannelNum){
				GetLossCfg(0);
				chnIndex = nChn;
			}else if ( chnIndex == gDevice.loginRsp.ChannelNum){
				GetLossCfg(nChn);
				chnIndex = nChn;
			}else {
				CHOSDSaveSel(chnIndex);
				GetLossCfg(nChn);
				chnIndex = nChn;
			}
		});
		$("#VLRf").click(function () {
			FillAlarmType();
		});
		$("#VLSave").click(function () {
			var nChn = $("#VLChid").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum  && (gDevice.loginRsp.SoftWareVersion > "V2.62.R07" || gDevice.loginRsp.BuildTime > "2024-04-01")){
				CHOSDSaveSel(0);
				SaveAllCfg();
			}else{
				CHOSDSaveSel(nChn);
				SaveCfg(0);
			}
		});
		$("#VLCP").click(function () {
			var nChn = $("#VLChid").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum){
				nChn = 0;
			}
			CHOSDSaveSel(nChn);
			copyCfg = cloneObj(LossCfg[nChn]);
			bCopy = true; 
		});
		$("#VLPaste").click(function () {
			if(!bCopy) return;
			$(".rightEx > div[name='all']").css({
				"background-color": "transparent",
				color: "inherit"
			});
			var cfg = copyCfg[copyCfg.Name];
			var btnFlag = cfg.Enable?1:0;
			$("#VLChnSwitch").attr("data", btnFlag);
			var eventHandler = cfg.EventHandler;
			$("#VLSendEmail").prop("checked", eventHandler.MailEnable);
			$("#VLShowMessage").prop("checked", eventHandler.TipEnable);       
			$("#VLPhone").prop("checked", eventHandler.MessageEnable);
			$("#VLFTP").prop("checked", eventHandler.FTPEnable);
			$("#VLWriteLog").prop("checked", eventHandler.LogEnable );
			if(gDevice.loginRsp.AlarmOutChannel > 0){
				$("#VLAODelay").val(eventHandler.AlarmOutLatch);
				ShowMask("#VL_AOChannelDiv > div[name!='all']", eventHandler.AlarmOutMask);
			}
			if(bRecord){
				$("#VLRecordDelay").val(eventHandler.RecordLatch);
				if(bNoMulityAlarmLink){
					$("#VLRecord").prop("checked", eventHandler.RecordEnable);
				}
				else {
					ShowMask("#VL_RecChannelDiv > div[name!='all']", eventHandler.RecordMask);
				}
			}
			if(bNoMulityAlarmLink){
				$("#VLTour").prop("checked", eventHandler.TourEnable);
			}
			else {
				ShowMask("#VL_TourChannelDiv > div[name!='all']", eventHandler.TourMask);
			}
			if(bSnap){
				if(bNoMulityAlarmLink){
					$("#VLSnap").prop("checked", eventHandler.SnapEnable);
				}
				else {
					ShowMask("#VL_SnapChannelDiv > div[name!='all']", eventHandler.SnapShotMask);
				}
			}
			var nChn = $("#VLChid").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum){
				for (var k = 0; k < gDevice.loginRsp.ChannelNum; k++){
					if (!bGet[k]) continue;
					var cfgHanlder = LossCfg[k][LossCfg[k].Name].EventHandler;
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
				var cfgHanlder = LossCfg[nChn][LossCfg[nChn].Name].EventHandler;
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
			SetAlarmToneType(eventHandler,"#lo_AbAlarmToneType","#lo_AbAlarmTone");
			ChangeVoiceType("#lo_AbAlarmToneType","#lo_alarmAndCustom");
			OnClickedEnable();
			InitButton();
		});
		$("#VL_Period").click(function() {	
			MasklayerShow(1);
			SetWndTop("#period_dialog", 60);
			$("#period_dialog").show(function(){
				var nIndex = chnIndex;
				if(chnIndex == gDevice.loginRsp.ChannelNum){
					nIndex = 0;
				}
				var timeSection = LossCfg[nIndex][LossCfg[nIndex].Name].EventHandler.TimeSection;
				ShowPeriodWnd(timeSection, AlarmTypeEnum.Loss);
			});
		});
		$("#VL_PTZSet").click(function() {
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
				var PtzCfg = LossCfg[nIndex][LossCfg[nIndex].Name].EventHandler.PtzLink;
				ShowPTZ(PtzCfg, AlarmTypeEnum.Loss);
			});
		});
		$("#VLChnSwitch").click(function () {
			OnClickedEnable();
		});
		$("#lo_AbAlarmToneType").change(function(){
			ChangeVoiceType("#lo_AbAlarmToneType","#lo_alarmAndCustom");
		})
		$("#lo_AbAlarmToneCustomButton").click(function () {
			var cmd={
				"FilePurpose":7
			};
			ShowVoiceCustomDlg(-1,cmd,pageTitle);
		});
		$("#VLDefault").click(function() {
			var nIndex = $("#VLChid").val() * 1;
			if (nIndex == gDevice.loginRsp.ChannelNum){
				nIndex = 0;
			}
			RfParamCall(function(a,b){
				LossCfg[nIndex] = a;
				var timeSection = LossCfg[nIndex][LossCfg[nIndex].Name].EventHandler.TimeSection;
				for(var i = 0; i < timeSection.length; i++){
					if(isObject(timeSection[i])){
						for(var j = 0; j < timeSection[i].length ; j++){
							if(timeSection[i][j] == ""){
								timeSection[i][j] = "0 00:00:00-00:00:00";
							}
						}
					}
				}
				LossCfg[nIndex][LossCfg[nIndex].Name].EventHandler.TimeSection = timeSection;
				bGet[nIndex] = true;
				ShowData(nIndex);
			}, pageTitle, "Detect.LossDetect", nIndex, WSMsgID.WsMsgID_DEFAULTCONFIG_GET);
		});
		FillAlarmType();
	});
});