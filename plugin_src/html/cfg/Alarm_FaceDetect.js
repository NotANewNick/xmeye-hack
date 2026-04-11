$(document).ready(function () {
    var chnIndex = -1;
    var color = gVar.skin_mColor;
    var bColor = gVar.skin_bColor;
    var pageTitle = $("#Alarm_FaceDetect").text();   
	var faceCfg = new Array;
	var faceFunc;
	var copyCfg = null;
	var bCopy = false;
	var bGet = new Array;
	var arrCh = new Array;
	var bIPC = gDevice.devType == devTypeEnum.DEV_IPC ? true : false;
	var bNoMulityAlarmLink = GetFunAbility(gDevice.Ability.OtherFunction.NoSupportMulityAlarmLink);
	function OnClickedEnable(){
		var j = $("#FDEnable").attr("data") * 1;
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
		var cfgName = faceCfg[nIndex].Name;
		var eventHandler = faceCfg[nIndex][cfgName].EventHandler;
		var btnFlag = faceCfg[nIndex][cfgName].Enable?1:0
		$("#FDEnable").attr("data", btnFlag);
        $("#FDSendEmail").prop("checked", eventHandler.MailEnable);
        $("#FDShowMessage").prop("checked", eventHandler.TipEnable);       
        $("#FDPhone").prop("checked", eventHandler.MessageEnable);
        $("#FDWriteLog").prop("checked", eventHandler.LogEnable );
		
		if(gDevice.loginRsp.AlarmOutChannel > 0){
			$("#FDAODelay").val(eventHandler.AlarmOutLatch);
			ShowMask("#FD_AOChannelDiv > div[name!='all']", eventHandler.AlarmOutMask);
		}
		if(bNoMulityAlarmLink){
			$("#FDTour").prop("checked", eventHandler.TourEnable);
		}else{
			ShowMask("#FD_TourChannelDiv > div[name!='all']", eventHandler.TourMask);
		}
		SetAlarmToneType(eventHandler,"#fa_AbAlarmToneType","#fa_AbAlarmTone");
		ChangeVoiceType("#fa_AbAlarmToneType","#fa_alarmAndCustom");
		OnClickedEnable();
        InitButton2();
		return true;
    }
	function GetFaceCfg(nIndex){
		if(!bGet[nIndex]){
			RfParamCall(function(a,b){
				faceCfg[nIndex] = a;
				var timeSection = faceCfg[nIndex][faceCfg[nIndex].Name].EventHandler.TimeSection;
				for(var i = 0; i < timeSection.length; i++){
					if(isObject(timeSection[i])){
						for(var j = 0; j < timeSection[i].length ; j++){
							if(timeSection[i][j] == ""){
								timeSection[i][j] = "0 00:00:00-00:00:00";
							}
						}
					}
				}
				faceCfg[nIndex][faceCfg[nIndex].Name].EventHandler.TimeSection = timeSection;
				bGet[nIndex] = true;
				ShowData(nIndex);
				MasklayerHide();
			}, pageTitle, "Detect.FaceDetection", nIndex, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			ShowData(nIndex);
		}
	}
	function InitChannel() {
		arrCh = [];
		bGet = [];
		faceCfg = [];
		copyCfg = null;
		bCopy = false;
		$("#FDChannelMask").empty();
		var dataHtml = '';
		if(bIPC){
			arrCh.push(0);
			$("#FDChannelMask").append('<option value="0">' + gDevice.getChannelName(0) + '</option>');
			faceCfg[0] = null;
			bGet[0] = false;
			chnIndex = 0;
			GetFaceCfg(0);
		}else{
			RfParamCall(function(a, b){
				faceFunc = a[a.Name];
				for (var j = 0; j < gDevice.loginRsp.ChannelNum; j++) {
					faceCfg[j] = null;
					bGet[j] = false;
					if(faceFunc[j] || bIPC){
						if(chnIndex == -1) chnIndex = j;
						arrCh.push(j);
						dataHtml += '<option value="' + j + '">' + gDevice.getChannelName(j) + '</option>';
					}
				}
				if(arrCh.length > 1){
					dataHtml += '<option value="' + gDevice.loginRsp.ChannelNum + '">' + lg.get("IDS_CFG_ALL") + '</option>';
				}
				$("#FDChannelMask").append(dataHtml);
				if(arrCh.length > 0) {
					var nIndex = chnIndex;
					if($.inArray(chnIndex, arrCh) >= 0){
						nIndex = chnIndex;
						$("#FDChannelMask").val(nIndex);
					}else{
						nIndex = arrCh[0];
						if(chnIndex == gDevice.loginRsp.ChannelNum && arrCh.length > 1){
							$("#CS_ChannelMask").val(gDevice.loginRsp.ChannelNum);
						}else{
							$("#CS_ChannelMask").val(arrCh[0]);
							chnIndex = arrCh[0];
						}
					}
					GetFaceCfg(nIndex);	
				}else{
					MasklayerHide();
					$("#FacePage").css("visibility", "hidden");
					ShowPaop(pageTitle, lg.get("IDS_CHSTA_NoConfig"));
				}
			}, pageTitle, "ChannelSystemFunction@SupportFaceDetectV2", -1, WSMsgID.WSMsgID_CHANNEL_ABILITY_GET_REQ);
		}
    }
	function FillAlarmType(){
		GetLocalVoiceTipType("Detect.FaceDetection", function(){
			GetAlarmToneType("Detect.FaceDetection","#fa_Alarm_tone","#fa_AbAlarmToneType","#fa_AbAlarmTone");
			InitChannel();
		});
	}
	function CHOSDSaveSel(nIndex) {
		var cfgName = faceCfg[nIndex].Name;
		faceCfg[nIndex][cfgName].Enable = $("#FDEnable").attr("data")*1?true:false;
		var eventHandler = faceCfg[nIndex][cfgName].EventHandler;
		if(isObject(eventHandler)){
			if(bNoMulityAlarmLink){
				eventHandler.TourEnable = $("#FDTour").prop("checked");
				eventHandler.TourMask = GetSingleChnMasks(eventHandler.TourEnable, nIndex);
			}else{
				eventHandler.TourMask = GetMasks("#FD_TourChannelDiv > div[name!='all']");
				eventHandler.TourEnable = false;
				if (parseInt(eventHandler.TourMask) > 0){
					eventHandler.TourEnable = true;
				}
			}
			if(gDevice.loginRsp.AlarmOutChannel > 0){
				eventHandler.AlarmOutMask = GetMasks("#FD_AOChannelDiv > div[name!='all']");
				eventHandler.AlarmOutLatch = $("#FDAODelay").val() * 1;
				eventHandler.AlarmOutEnable = false;
				if (parseInt(eventHandler.AlarmOutMask) > 0){
					eventHandler.AlarmOutEnable = true;
				}
			}
			eventHandler.PtzEnable = true;
            eventHandler.MailEnable = $("#FDSendEmail").prop("checked");
            eventHandler.TipEnable = $("#FDShowMessage").prop("checked");
            eventHandler.MessageEnable = $("#FDPhone").prop("checked");
            eventHandler.LogEnable = $("#FDWriteLog").prop("checked");
			SaveAlarmToneType(eventHandler,"#fa_AbAlarmToneType","#fa_AbAlarmTone");
			return true;
		}
		return false;
    }
	function SaveCfg(nIndex){
		if(nIndex < arrCh.length){
			var chn = arrCh[nIndex];
			if(bGet[chn]){
				RfParamCall(function (data){
					var Enable = faceCfg[chn][faceCfg[chn].Name].Enable;
					if(Enable){
						var cfgName = "Detect.HumanDetection.[" + chn +"].Enable";
						if (GetFunAbility(gDevice.Ability.AlarmFunction.HumanDectionDVR) && chn < gDevice.loginRsp.VideoInChannel){
							cfgName = "Detect.HumanDetectionDVR.[" + chn + "].Enable";
						}
						var object = {"Name": cfgName};
						object[object.Name] = Enable;
						RfParamCall(function(a,b){
							SaveCfg(nIndex + 1);
						}, pageTitle, cfgName, -1, WSMsgID.WsMsgID_CONFIG_SET, object);
					}else{
						SaveCfg(nIndex + 1);
					}
				}, pageTitle, "Detect.FaceDetection", chn, WSMsgID.WsMsgID_CONFIG_SET, faceCfg[chn]);
			}else{
				SaveCfg(nIndex + 1);
			}
		}else{
			ShowPaop(pageTitle,lg.get("IDS_SAVE_SUCCESS"));
		}
	}
	$(function () {
		if (bIPC) {
			$("#FDChannelDiv, #DivBoxAll, #FD_CP, #FD_Paste").css("display", "none");
		}
		if (bNoMulityAlarmLink){
			$("#AlarmLinkBox").css("display", "");
			$("#MulityAlarmLinkBox").css("display", "none");
			$("#FD_enableBox").addClass("group-box").css("margin-top", "5px");
		}else{
			$("#AlarmLinkBox").css("display", "none");
			$("#MulityAlarmLinkBox").css("display", "");
		}
		if(gDevice.bGetDefault){
			$("#FD_Default").css("display", "");
		}
		if (GetFunAbility(gDevice.Ability.TipShow.NoEmailTipShow)) {
			$("#FD_SendEmailBox").css("display", "none")
		}
		if(!GetFunAbility(gDevice.Ability.NetServerFunction.NetPMS)){
			$("#FD_PhoneBox").css("display", "none");
		}
		if (!GetFunAbility(gDevice.Ability.OtherFunction.SupportWriteLog)) {
			$("#FD_WriteLogBox").css("display", "none");
		}
		if (GetFunAbility(gDevice.Ability.AlarmFunction.ScreenTip)){
			$("#FD_ShowMessageBox").css("display", "");
		}
		if(gDevice.loginRsp.BuildTime >= "2011-11-14 13:53:32"){
			var bPtz = GetFunAbility(gDevice.Ability.CommFunction.CommRS485);
			bPtz &= (gDevice.loginRsp.ChannelNum > 0);
			if(bPtz){
				$("#FD_PTZSetDiv").css("display", "");
			}else{
				$("#FD_PTZSetDiv").css("display", "none");
			}
		}
		recChannel("FD_TourChannelDiv", color, bColor);
		var ChannelH = $("#FD_DivBoxTour").height();
		$("#FD_DivBoxTour .MaskDiv").css("height", ChannelH + "px");
		if(gDevice.loginRsp.AlarmOutChannel == 0){
			$("#FD_AOEvent").css("display", "none");
		}else {
			recChannel("FD_AOChannelDiv", color, bColor, gDevice.loginRsp.AlarmOutChannel);
			ChannelH = $("#FD_AOEvent").height();
			$("#FD_AOEvent .MaskDiv").css("height", ChannelH + "px");
		}
		$('#DivBoxAll :checked').prop("checked",false);
		ChangeBtnState2();
		$("#FDChannelMask").change(function () {
			var nChn = $("#FDChannelMask").val() * 1;	
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
		$("#FD_SV").click(function () {
			var nChn = $("#FDChannelMask").val() * 1;
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
			var _saveCfg = faceCfg[nChn][faceCfg[nChn].Name];
			if(bNoMulityAlarmLink){
				if(_saveCfg[_saveCfg.Name].EventHandler.TourEnable){
					_saveCfg[_saveCfg.Name].EventHandler.TourMask="0xffffffffffffffff";
				}else{
					_saveCfg[_saveCfg.Name].EventHandler.TourMask="0x0";
				}
			}
			for (var i = 1; i < gDevice.loginRsp.ChannelNum; i++ ){
				if(faceFunc[i]){
					if(bGet[i] && isObject(faceCfg[i])){
						faceCfg[i][faceCfg[i].Name] = cloneObj(_saveCfg);
					}else{
						var cfg = {};
						var cfgName = "Detect.FaceDetection.[" + i + "]";
						cfg[cfgName] = cloneObj(_saveCfg);
						cfg.Name = cfgName;
						faceCfg[i] = cfg;
						bGet[i] = true;
					}
				}
			}
			SaveCfg(0);
		}
	
		$("#FD_Rf").click(function () {
			FillAlarmType();
		});
		$("#FD_Period").click(function() {	
			MasklayerShow(1);
			SetWndTop("#period_dialog", 60);
			$("#period_dialog").show(function(){
				var nIndex = chnIndex;
				if(chnIndex == gDevice.loginRsp.ChannelNum){
					nIndex = arrCh[0];
				}
				var cfgName = faceCfg[nIndex].Name;
				var timeSection = faceCfg[nIndex][cfgName].EventHandler.TimeSection;
				ShowPeriodWnd(timeSection, AlarmTypeEnum.Face);
			});
		});
		$("#FD_PTZSet").click(function() {	
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
				var cfgName = faceCfg[nIndex].Name;
				var PtzCfg = faceCfg[nIndex][cfgName].EventHandler.PtzLink;
				ShowPTZ(PtzCfg, AlarmTypeEnum.Face);
			});
		});
		$("#FDEnable").click(function() {
			OnClickedEnable();
		});
		$("#FD_CP").click(function () {
			var nChn = $("#FDChannelMask").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum){
				nChn = arrCh[0];
			}
			CHOSDSaveSel(nChn);
			copyCfg = cloneObj(faceCfg[nChn]);
			bCopy = true; 
		});
		$("#FD_Paste").click(function () {
			if(!bCopy)
				return;
			$(".rightEx > div[name='all']").css({
				"background-color": "transparent",
				color: "inherit"
			});
			var eventHandler = copyCfg[copyCfg.Name].EventHandler;
			var btnFlag = copyCfg[copyCfg.Name].Enable?1:0;
			$("#FDEnable").attr("data", btnFlag);
			$("#FDSendEmail").prop("checked", eventHandler.MailEnable);
			$("#FDShowMessage").prop("checked", eventHandler.TipEnable);       
			$("#FDPhone").prop("checked", eventHandler.MessageEnable);
			$("#FDWriteLog").prop("checked", eventHandler.LogEnable );
			if(gDevice.loginRsp.AlarmOutChannel > 0){
				$("#FDAODelay").val(eventHandler.AlarmOutLatch);
				ShowMask("#FD_AOChannelDiv > div[name!='all']", eventHandler.AlarmOutMask);
			}
			if(bNoMulityAlarmLink){
				$("#FDTour").prop("checked", eventHandler.TourEnable);
			}else{
				ShowMask("#FD_TourChannelDiv > div[name!='all']", eventHandler.TourMask);
			}
			
			var nChn = $("#FDChannelMask").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum){
				for (var k = 0; k < gDevice.loginRsp.ChannelNum; k++){
					if (!faceFunc[k] || !bGet[k]) continue;
					var cfgHanlder = faceCfg[k][faceCfg[k].Name].EventHandler;
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
				var cfgHanlder = faceCfg[nChn][faceCfg[nChn].Name].EventHandler;
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
			
			SetAlarmToneType(eventHandler,"#fa_AbAlarmToneType","#fa_AbAlarmTone");
			ChangeVoiceType("#fa_AbAlarmToneType","#fa_alarmAndCustom");
			OnClickedEnable();
			InitButton2();	
		});
		$("#fa_AbAlarmToneType").change(function(){
			ChangeVoiceType("#fa_AbAlarmToneType","#fa_alarmAndCustom");
		})
		$("#fa_AbAlarmToneCustomButton").click(function(){
			var cmd={
				"FilePurpose":7
			};
			ShowVoiceCustomDlg(-1,cmd,pageTitle);
		});
		$("#FD_Default").click(function() {
			var nIndex = $("#FDChannelMask").val() * 1;
			if (nIndex == gDevice.loginRsp.ChannelNum){
				nIndex = 0;
			}
			RfParamCall(function(a,b){
				faceCfg[nIndex] = a;
				var timeSection = faceCfg[nIndex][faceCfg[nIndex].Name].EventHandler.TimeSection;
				for(var i = 0; i < timeSection.length; i++){
					if(isObject(timeSection[i])){
						for(var j = 0; j < timeSection[i].length ; j++){
							if(timeSection[i][j] == ""){
								timeSection[i][j] = "0 00:00:00-00:00:00";
							}
						}
					}
				}
				faceCfg[nIndex][faceCfg[nIndex].Name].EventHandler.TimeSection = timeSection;
				bGet[nIndex] = true;
				ShowData(nIndex);
				MasklayerHide();
			}, pageTitle, "Detect.FaceDetection", nIndex, WSMsgID.WsMsgID_DEFAULTCONFIG_GET);
		});
		FillAlarmType();
    });
});