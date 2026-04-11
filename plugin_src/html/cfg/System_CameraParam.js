//# sourceURL=System_CameraParam.js
$(document).ready(function () {
    var chnIndex = -1;
	var CameraCfg;
	var CameraExCfg;
	var ClearFogCfg;
	var CameraAblity;
	var SpecialNightCfg;
	var _Defaultelect=50;
	var pageTitle = $("#System_CameraParam").text();
	var _bWidth = false;
	var _bImgStyle = false;
	var _bClearFog = false;
	var channelFun;
	var _bHumanCfg = GetFunAbility(gDevice.Ability.AlarmFunction.HumanDection);
	var _bNVRHuman = GetFunAbility(gDevice.Ability.AlarmFunction.HumanDectionNVR) || GetFunAbility(gDevice.Ability.AlarmFunction.HumanDectionNVRNew);
	var motionCfg;
	var humanCfg;
	var digitalHumanAbility;
	var strImgStyle = ["typedefault", "type1", "type2"];
	var bIPC = gDevice.devType == devTypeEnum.DEV_IPC ? true : false;
	var currentGearCtrlBox = null;
	var currentDNCDiv = null;
	if(bIPC){
		_bWidth = GetFunAbility(gDevice.Ability.OtherFunction.SupportBT);
		_bImgStyle = GetFunAbility(gDevice.Ability.OtherFunction.SupportCamareStyle);
	}else{
		$("#Debug_Div").css("display", "none");
	}
	var _bCorridorMode = GetFunAbility(gDevice.Ability.OtherFunction.SupportCorridorMode);
	var _bSpecialNight = GetFunAbility(gDevice.Ability.OtherFunction.SpecialNight);
	var digitalSystemFunc;
	var _bLP4G = GetFunAbility(gDevice.Ability.OtherFunction.LP4GSupportDoubleLightSwitch);
	var LP4GLedParameter;
	var _bListCameraDayLightModes = GetFunAbility(gDevice.Ability.OtherFunction.SupportListCameraDayLightModes);
	var CameraDayLightModes;
	var WhiteLightCfg;
	var bSupportFullColorLightWorkPeriod = GetFunAbility(gDevice.Ability.OtherFunction.SupportFullColorLightWorkPeriod);
	
	function UpdateDNMode(){
		$("#Cam_DNMode").empty();
		if(_bLP4G){
			$("#Cam_DNMode").append('<option value="' + 0 + '">' + lg.get("IDS_CAM_StarIR") + '</option>');
			$("#Cam_DNMode").append('<option value="' + 1 + '">' + lg.get("IDS_CAM_Color") + '</option>');
			return;
		}

		if(_bListCameraDayLightModes && typeof CameraDayLightModes != 'undefined' && CameraDayLightModes.length > 0){
			var strModes = [lg.get("IDS_CAM_StarIR"), lg.get("IDS_CAM_Color"), lg.get("IDS_CAM_BlackWhite"),
			lg.get("IDS_CAM_IntelMotionDetect"), lg.get("IDS_CAM_WarmLight"), lg.get("IDS_CAM_InteligentInfrared"), lg.get("IDS_CAM_LicensePlate")];

			for(var i = 0; i < CameraDayLightModes.length; i++){
				var nMode = CameraDayLightModes[i].value;
				$("#Cam_DNMode").append('<option value="' + nMode + '">' + strModes[nMode] + '</option>');
			}
		}else{
			var bSupportHideNormalDLMode = false;
			var bSupportSoftPhotosensitive = false;
			var bSupportDoubleLightBoxCamera = false
			if(bIPC){
				bSupportHideNormalDLMode = GetFunAbility(gDevice.Ability.OtherFunction.SupportHideNormalDLMode);
				bSupportSoftPhotosensitive = GetFunAbility(gDevice.Ability.OtherFunction.SupportSoftPhotosensitive);
				bSupportDoubleLightBoxCamera = GetFunAbility(gDevice.Ability.OtherFunction.SupportDoubleLightBoxCamera);
			}else{
				bSupportHideNormalDLMode = (typeof channelFun.SupportHideNormalDLMode == 'undefined') ? 0 : 
											channelFun.SupportHideNormalDLMode[chnIndex];
				bSupportSoftPhotosensitive = channelFun.SoftPhotoSensitiveMask[chnIndex];
				bSupportDoubleLightBoxCamera = (typeof channelFun.SupportDoubleLightBoxCamera == 'undefined') ? 0 :
											channelFun.SupportDoubleLightBoxCamera[chnIndex];
			}
			if(!bSupportHideNormalDLMode){
				$("#Cam_DNMode").append('<option value="' + 0 + '">' + lg.get("IDS_CAM_StarIR") + '</option>');
				$("#Cam_DNMode").append('<option value="' + 1 + '">' + lg.get("IDS_CAM_Color") + '</option>');
				$("#Cam_DNMode").append('<option value="' + 2 + '">' + lg.get("IDS_CAM_BlackWhite") + '</option>');
			}
			
			if((isObject(CameraAblity) && CameraAblity.SupportIntellDoubleLight == 1)||bSupportDoubleLightBoxCamera){
				$("#Cam_DNMode").append('<option value="' + 3 + '">' + lg.get("IDS_CAM_IntelMotionDetect") + '</option>');
			}
			if(bSupportSoftPhotosensitive){
				$("#Cam_DNMode").append('<option value="' + 4 + '">' + lg.get("IDS_CAM_WarmLight") + '</option>');
				$("#Cam_DNMode").append('<option value="' + 5 + '">' + lg.get("IDS_CAM_InteligentInfrared") + '</option>');	
			}
			if(GetFunAbility(gDevice.Ability.OtherFunction.SupportPlateDetect)){
				$("#Cam_DNMode").append('<option value="' + 6 + '">' + lg.get("IDS_CAM_LicensePlate") + '</option>');
			}
		}
	}
	function ShowLevel(id){
		var mode = "#" + id;
		switch(id){
		case "Cam_DwdrMode": 
			if ($(mode).val() * 1 == 1) {
				DivBox(1, "#digital_wide");
			} else {
				DivBox(0, "#digital_wide");
			}
			break;
		case "Cam_GainMode":
			if($(mode).val() * 1 == 1){
				DivBox(1, "#Gainwide");
			} else {
				DivBox(0, "#Gainwide");
			}
			break;
		case "Cam_DefogMode":
			if($(mode).val() * 1 == 1){
				DivBox(1, "#Defog_level");
			} else {
				DivBox(0, "#Defog_level");
			}
			break;
		}
	}
	function ShowAdjustVlaue(div, dncdiv) {
		$(div).slider({width:130, minValue:1, maxValue:5, mouseupCallback:null});
		$(dncdiv).slider({width: 130, minValue: 10, maxValue: 50, mouseupCallback: null});
		var DNval = $("#Cam_DNMode").val() * 1;
        if($("#Cam_DNMode").val() != null && DNval < 3){
			$(dncdiv).css("display", "block");
			$(div).css("display", "none");
			$(dncdiv).slider("setValue", CameraCfg[CameraCfg.Name].DncThr);
		}else{
			$(dncdiv).css("display", "none");
			if(_bWidth){
				$(div).css("display", "block");
				$(div).slider("setValue", CameraExCfg[CameraExCfg.Name].AutomaticAdjustment);
			}else{
				$(div).css("display", "none");
			}
		}
    }

	function ShowDayNightSwitchControl()
	{
		var currentIndex = $("#DayNightSwtichSelect").val() * 1;

		if(currentIndex == 0)
		{
			$("#GearCtrlBox2").css("display", "");
			$("#DayTimeSectionBox").css("display", "none");
			ShowAdjustVlaue("#Auto_Adjustment2", "#RDNC2");
		}
		else if(currentIndex == 1 || currentIndex == 2)
		{
			$("#GearCtrlBox2").css("display", "none");
			$("#DayTimeSectionBox").css("display", "none");
		}
		else if(currentIndex == 3)
		{
			$("#GearCtrlBox2").css("display", "none");
			$("#DayTimeSectionBox").css("display", "");
			ShowTimeSection(CameraExCfg[CameraExCfg.Name]["DayNightSwitch"]["KeepDayPeriod"]);
		}
		else{
			//...
		}
	}

	function ShowTimeSection(time)
	{
		if(typeof time == "undefined")
		{
			$("#BH").val("00");
			$("#BM").val("00");
			$("#EH").val("24");
			$("#EM").val("00");
			return;
		}

		var sect = time.split(" ");
		var tSect = sect[1].split("-");
		var bSect = tSect[0].split(":");
		var eSect = tSect[1].split(":");

		$("#BH").val(bSect[0]);
		$("#BM").val(bSect[1]);
		$("#EH").val(eSect[0]);
		$("#EM").val(eSect[1]);
	}

	function ShowData() {
		EnableBox(false);
		var cfg = CameraCfg[CameraCfg.Name];	
		$("#Exposure_Mode").val(cfg.ExposureParam.Level);
		$("#Exposure_Mode").change();
		if(0.0 == parseInt(cfg.ExposureParam.LeastTime,16) || 0.0 == parseInt(cfg.ExposureParam.MostTime,16)){
			$("#min_time_id").val("0.0");
			$("#max_time_id").val("80");
		} else {
			$("#min_time_id").val(parseInt(cfg.ExposureParam.LeastTime,16)/1000);
			$("#max_time_id").val(parseInt(cfg.ExposureParam.MostTime,16)/1000);
		}
		UpdateDNMode();

		$("#Cam_DNMode").val(0);
		if(_bLP4G){
			$("#Cam_DNMode").val(LP4GLedParameter[LP4GLedParameter.Name].Type - 1);
		}else{
			SetCurComboData("#Cam_DNMode", parseInt(cfg.DayNightColor, 16));
		}	

		if(isObject(CameraAblity) && CameraAblity.SupManualSwitchDayNight == 1)
		{
			$("#GearCtrlBox").css("display", "none");
			$("#DayNightSwitch").css("display", "");
			$("#DayNightSwtichSelect").empty();
			$("#DayNightSwtichSelect").append('<option value="0">' + lg.get("IDS_DayNightSwitch_AutoChange") + '</option>');
			$("#DayNightSwtichSelect").append('<option value="1">' + lg.get("IDS_DayNightSwitch_DayMode") + '</option>');
			$("#DayNightSwtichSelect").append('<option value="2">' + lg.get("IDS_DayNightSwitch_NightMode") + '</option>');
			$("#DayNightSwtichSelect").append('<option value="3">' + lg.get("IDS_DayNightSwitch_ClockMode") + '</option>');
			$("#GearCtrlBox2").css("display", "none");
			$("#DayTimeSectionBox").css("display", "none");
			ShowAdjustVlaue("#Auto_Adjustment2", "#RDNC2");
			currentGearCtrlBox = "#Auto_Adjustment2";
			currentDNCDiv = "#RDNC2";

			var cfgEx = CameraExCfg[CameraExCfg.Name];
			if(isObject(cfgEx.DayNightSwitch))
			{
				var switchMode = cfgEx["DayNightSwitch"]["SwitchMode"] * 1;
				if(switchMode == 0)
				{
					$("#GearCtrlBox2").css("display", "");
					$("#DayTimeSectionBox").css("display", "none");
				}
				else if(switchMode == 1 || switchMode == 2)
				{
					$("#GearCtrlBox2").css("display", "none");
					$("#DayTimeSectionBox").css("display", "none");
				}
				else if(switchMode == 3)
				{
					$("#GearCtrlBox2").css("display", "none");
					$("#DayTimeSectionBox").css("display", "");
					ShowTimeSection(cfgEx["DayNightSwitch"]["KeepDayPeriod"]);
				}
				else
				{
					//...
				}
				$("#DayNightSwtichSelect").val(switchMode);
			}
		}
		else
		{
			$("#GearCtrlBox").css("display", "");
			$("#DayNightSwitch").css("display", "none");
			$("#GearCtrlBox2").css("display", "none");
			$("#DayTimeSectionBox").css("display", "none");
			ShowAdjustVlaue("#Auto_Adjustment", "#RDNC");
			currentDNCDiv = "#RDNC";
			currentGearCtrlBox = "#Auto_Adjustment";
		}

		$("#Cam_Iris").val(parseInt(cfg.ApertureMode, 16));
		$("#Cam_WBMode").val(parseInt(cfg.WhiteBalance, 16));
		$("#Cam_BLC").val(parseInt(cfg.BLCMode, 16));
		$("#Cam_AE").val(cfg.ElecLevel);
		$("#Cam_AE_Default").text(_Defaultelect);
		if(_bWidth && isObject(CameraExCfg)){
			$("#BT_Div").css("display", "");
			var cfgEx = CameraExCfg[CameraExCfg.Name];
			if(_bImgStyle){
				$("#Image_Style").css("display", "");
				for (var i=0; i < strImgStyle.length; i++) {
					if (strImgStyle[i] == cfgEx.Style) {
						$("#Cam_Image_Style").val(i);
						break;
					}
				}
			}else{
				$("#Image_Style").css("display", "none");
			}
			$("#Cam_DwdrMode").val(cfgEx.BroadTrends.AutoGain);
			ShowLevel("Cam_DwdrMode");
			$("#Cam_DwdrStrength").val(cfgEx.BroadTrends.Gain);
			if(_bCorridorMode){
				$("#CorridorMode").val(cfgEx.CorridorMode);
				$("#Corridor_Mode").css("display", "");
			}else{
				$("#Corridor_Mode").css("display", "none");
			}
			if (isObject(CameraAblity) && CameraAblity.SupportPreventOverExpo == 1) {
				var CfgEx = CameraExCfg[CameraExCfg.Name];
				$("#PreOverExposureSpan").css("display", "");
				$("#PreOverExposureSwitch").prop("checked", parseInt(CfgEx.PreventOverExpo) ? true : false);
			}else {
				$("#PreOverExposureSpan").css("display", "none");
			}
		}else{
			$("#BT_Div").css("display", "none");
			$("#PreOverExposureSpan").css("display", "none");
		}
		$("#Cam_Sen").slider("setValue", cfg.AeSensitivity);
		if(_bClearFog){
			$("#Cam_DefogMode").val(ClearFogCfg[ClearFogCfg.Name].enable * 1);
			ShowLevel("Cam_DefogMode");
			$("#Cam_DefogThreshTarget").val(ClearFogCfg[ClearFogCfg.Name].level);
			$("#Defog_Mode_Div").css("display", "");
		}else{
			$("#Defog_Mode_Div").css("display", "none");
		}
		$("#Cam_GainMode").val(cfg.GainParam.AutoGain);
		ShowLevel("Cam_GainMode");
		$("#Cam_GainStrength").val(cfg.GainParam.Gain);
		$("#Cam_Slow_shutter").val(parseInt(parseInt(cfg.EsShutter, 16)/2));
		$("#IR_CUTR").val(cfg.IRCUTMode);
		$("#day_dn_id").val(cfg.Day_nfLevel);
		$("#night_dn_id").val(cfg.Night_nfLevel);
		$("#MirrorSwitch").prop("checked", parseInt(cfg.PictureMirror, 16) ? true : false);
		$("#FlipSwitch").prop("checked", parseInt(cfg.PictureFlip, 16) ? true : false);
		$("#AntiSwitch").prop("checked", parseInt(cfg.RejectFlicker, 16) ? true : false);
		$("#IrSwapSwitch").prop("checked", parseInt(cfg.IrcutSwap) ? true : false);
		if(_bSpecialNight){
			cfg = SpecialNightCfg[SpecialNightCfg.Name];
			$("#SpecialNightSwitch").prop("checked", cfg.enable);
		}

		// 白光全彩模式才显示 亮灯时间段
		$("#WhiteLightUpTimeSectionBox").css("display", "none");
		if(bSupportFullColorLightWorkPeriod && WhiteLightCfg != null)
		{
			$("#LU_BH, #LU_BM, #LU_EH, #LU_EM").prop("disabled", true);
			DivBox(1, "#LightUpTimeSection");

			function PadZero(num, length)
			{
				return ("0000000000000000" + num).substr(-length);
			}

			if(typeof WhiteLightCfg[WhiteLightCfg.Name] != "undefined" && typeof WhiteLightCfg[WhiteLightCfg.Name].WorkPeriod != "undefined")
			{
				$("#LightUp_TimeEnable").prop("checked", WhiteLightCfg[WhiteLightCfg.Name].WorkPeriod.Enable ? true : false);
				$("#LU_BH, #LU_BM, #LU_EH, #LU_EM").prop("disabled", WhiteLightCfg[WhiteLightCfg.Name].WorkPeriod.Enable ? false : true);
				$("#LU_BH").val(PadZero(WhiteLightCfg[WhiteLightCfg.Name].WorkPeriod.SHour, 2));
				$("#LU_BM").val(PadZero(WhiteLightCfg[WhiteLightCfg.Name].WorkPeriod.SMinute, 2));
				$("#LU_EH").val(PadZero(WhiteLightCfg[WhiteLightCfg.Name].WorkPeriod.EHour, 2));
				$("#LU_EM").val(PadZero(WhiteLightCfg[WhiteLightCfg.Name].WorkPeriod.EMinute, 2));
				DivBox(WhiteLightCfg[WhiteLightCfg.Name].WorkPeriod.Enable * 1, "#LightUpTimeSection");
			}
			
			if(parseInt(cfg.DayNightColor, 16) == 1)
			{
				$("#WhiteLightUpTimeSectionBox").css("display", "");
			}

			$("#LightUp_TimeEnable").click(function(){
				var bCheck = $("#LightUp_TimeEnable").prop("checked");
				$("#LU_BH, #LU_BM, #LU_EH, #LU_EM").prop("disabled", !bCheck);
				DivBox(bCheck * 1, "#LightUpTimeSection");
			});

			$("#LightUpTimeSection input").keyup(function(){
				var tmp = $(this).val().replace(/\D/g,'');
				$(this).val(tmp);
				var nWitch;
				var b = $("#LightUpTimeSection input");	
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

			$("#LightUpTimeSection input").focusout(function(){
				var tmp = $(this).val().replace(/\D/g,'');
				$(this).val(tmp);
				var nWitch;
				var b = $("#LightUpTimeSection input");	
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
					var strPad = timeArr[i];
					if(strPad == 0)
						strPad = "00";
					else if(strPad < 10)
						strPad = '0' + timeArr[i];

					b.eq(i).val(strPad);
				}
			});
		}

		InitButton();
		MasklayerHide();
    }
	function EnableBox(bShow, Ret){
		if(bShow){
			$("#CameraParamSet_Box .MaskDiv").css("display", "block");
			$("#Gainwide, #digital_wide, #Defog_level").css("opacity", "1");
			DivBox(0, "#CameraParamSet_Box");
			$("#ChncamSV").attr("disabled", true);
			$("#ChncamSV").stop().addClass("btn-disable").fadeTo("slow", 0.2);
			if(typeof Ret != "undefinded" && Ret == 107){
				ShowPaop(pageTitle, lg.get("IDS_NO_POWER"));
			}
			else{
				ShowPaop(pageTitle, lg.get("GetConfigFail"));
			}
		}else{
			$("#CameraParamSet_Box .MaskDiv").css("display", "none");
			DivBox(1, "#CameraParamSet_Box");
			$("#ChncamSV").attr("disabled", false);
			$("#ChncamSV").stop().removeClass("btn-disable").fadeTo("slow", 1);
		}	
	}
	function GetWhiteLightCfg(){
		RfParamCall(function(a){
			if(a.Ret == 100){
				WhiteLightCfg = a;
			}
			ShowData();
		}, pageTitle, "Camera.WhiteLight", -1, WSMsgID.WsMsgID_CONFIG_GET);
	}
	function GetSpecialNight(){
		if(_bSpecialNight){
			RfParamCall(function(a){
				SpecialNightCfg = a;
				if(bSupportFullColorLightWorkPeriod)
				{
					GetWhiteLightCfg();
				}
				else
				{
					ShowData();
				}
			}, pageTitle, "Camera.SpecialNight", -1, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			if(bSupportFullColorLightWorkPeriod)
			{
				GetWhiteLightCfg();
			}
			else
			{
				ShowData();
			}
		}
	}
	function GetLP4GLedParameter(){
		if(_bLP4G){
			var fName = "Dev.LP4GLedParameter";
			var nChn = -1;
			if(!bIPC){
				fName = "bypass@Dev.LP4GLedParameter"
				nChn = chnIndex - gDevice.loginRsp.VideoInChannel;
			}
			RfParamCall(function(a){
				LP4GLedParameter = a;
				GetSpecialNight();
			}, pageTitle, fName, nChn, WSMsgID.WsMsgID_CONFIG_GET, null, true);
		}else{
			GetSpecialNight();
		}
	}
	function GetDetectCfg(){
		RfParamCall(function(a){
			motionCfg = a;
			RfParamCall(function(a){
				humanCfg = a;
				GetLP4GLedParameter();
			}, pageTitle, "Detect.HumanDetection", chnIndex, WSMsgID.WsMsgID_CONFIG_GET);
		}, pageTitle, "Detect.MotionDetect", chnIndex, WSMsgID.WsMsgID_CONFIG_GET);
	}
	function GetDigitalHuman(){
		RfParamCall(function(a){
			if (typeof a[a.Name] == 'undefined'){
				digitalHumanAbility = {};
				digitalHumanAbility.HumanDection = false;
				digitalHumanAbility.SupportAlarmLinkLight = false;
				digitalHumanAbility.SupportAlarmVoiceTips = false;
				digitalHumanAbility.SupportAlarmVoiceTipsType = false;
			}else{
				digitalHumanAbility = a[a.Name];
			}
			if(!digitalHumanAbility.HumanDection){
				GetLP4GLedParameter();
			}else{
				GetDetectCfg();
			}	
		}, pageTitle, "NetUse.DigitalHumanAbility", chnIndex, WSMsgID.WsMsgID_CONFIG_GET);
	}
	function GetClearFog(){
		RfParamCall(function(a){
			_bClearFog = false;
			if(a.Ret == 100){
				ClearFogCfg = a;
				_bClearFog = true;
			}
			if(_bHumanCfg || _bNVRHuman){
				if(_bHumanCfg){
					GetDetectCfg();
				}else{
					GetDigitalHuman();
				}			
			}else{
				GetLP4GLedParameter();
			}
		}, pageTitle, "Camera.ClearFog", chnIndex, WSMsgID.WsMsgID_CONFIG_GET);
	}
	function GetCameraCfg(){
		RfParamCall(function(a){
			if(a.Ret != 100){
				EnableBox(true, a.Ret);
				MasklayerHide();
				return;
			}
			CameraCfg = a;
			if(_bWidth){
				CameraExCfg = null;
				RfParamCall(function(a){
					if(a.Ret != 100){
						EnableBox(true, a.Ret);
						MasklayerHide();
						return;
					}
					CameraExCfg = a;
					GetClearFog();
				}, pageTitle, "Camera.ParamEx", chnIndex, WSMsgID.WsMsgID_CONFIG_GET, null, true);
			}else{
				GetClearFog();
			}
		}, pageTitle, "Camera.Param", chnIndex, WSMsgID.WsMsgID_CONFIG_GET, null, true);
	}
	function GetCameraAblity(){
		var ch, nChn, cfgName, cmdid, listModesName;
		if(bIPC){
			ch = -1;
			nChn = -1;
			cfgName = "Camera";
			cmdid = WSMsgID.WsMsgID_ABILITY_GET;
			listModesName = "CameraDayLightModes";
		}else{
			ch = chnIndex;
			nChn = chnIndex - gDevice.loginRsp.VideoInChannel;
			cfgName = "ChannelCameraAbility";
			cmdid = WSMsgID.WSMsgID_CHANNEL_ABILITY_GET_REQ;
			listModesName = "bypass@CameraDayLightModes";
			_bWidth = channelFun.BroadTrends[chnIndex];
			_bImgStyle = channelFun.CamareStyle[chnIndex];
			_bCorridorMode = channelFun.CorridorMode[chnIndex];
		}
		$("#Exposure_Mode").empty();
		$("#Exposure_Mode").append('<option value="0">' + lg.get("IDS_CAM_ExposureAuto") + '</option>');
		RfParamCall(function(a){
			if(a.Ret != 100){
				EnableBox(true, a.Ret);
				MasklayerHide();
				return;
			}

			CameraAblity = a[a.Name];
			if (isObject(CameraAblity)) {
				_Defaultelect = CameraAblity.ElecLevel;
				for (var m = 0; m < CameraAblity.Count; m++) {
					for (var n = m; n < CameraAblity.Count - 1; n++) {
						var ntemp = 0;
						if (CameraAblity.Speeds[m] < CameraAblity.Speeds[n + 1]) {
							ntemp = CameraAblity.Speeds[m];
							CameraAblity.Speeds[m] = CameraAblity.Speeds[n + 1];
							CameraAblity.Speeds[n + 1] = ntemp;
						}
					}
				}
				for (var j = 0; j < CameraAblity.Count; j++) {
					var temp = "1/" + parseInt(1000000 / parseInt(CameraAblity.Speeds[j]));				
					$("#Exposure_Mode").append('<option value="' + (j + 1) + '">' + (lg.get("IDS_CAM_ExposureManual")+"_"+temp) + '</option>');
				}
			}
			if(_bListCameraDayLightModes){
				RfParamCall(function(a){
					if(a.Ret == 100){
						CameraDayLightModes = a[a.Name];
						GetCameraCfg();
					}
				}, pageTitle, listModesName, nChn, cmdid, null, true);
			}else{
				GetCameraCfg();
			}	
		}, pageTitle, cfgName, ch, cmdid, null, true);
	}
	function GetChannelFunc(){
		RfParamCall(function(a){
			if(a.Ret == 100){
				digitalSystemFunc = a[a.Name];
				_bLP4G = GetFunAbility(digitalSystemFunc.OtherFunction.LP4GSupportDoubleLightSwitch);
				_bListCameraDayLightModes = GetFunAbility(digitalSystemFunc.OtherFunction.SupportListCameraDayLightModes);
			}		
			RfParamCall(function(a){
				channelFun = a[a.Name];
				GetCameraAblity();
			}, pageTitle, "ChannelSystemFunction", -1, WSMsgID.WSMsgID_CHANNEL_ABILITY_GET_REQ);
		}, pageTitle, "bypass@SystemFunction", chnIndex - gDevice.loginRsp.VideoInChannel, WSMsgID.WSMsgID_CHANNEL_ABILITY_GET_REQ, null, true);
	}
	function InitChannel(){
		$("#ChncamChannelMask").empty();
		var chnArry = [];
		if(gDevice.loginRsp.DigChannel > 0){
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
							var dataHtml = '<option value="' + i + '">' + gDevice.getChannelName(i) + '</option>';
							$("#ChncamChannelMask").append(dataHtml);
						}
					}
					if(chnArry.length > 0){
						if($.inArray(chnIndex, chnArry) < 0){
							chnIndex = chnArry[0];
						}
						$("#ChncamChannelMask").val(chnIndex);
						GetChannelFunc();
					}else{
						MasklayerHide();
						$("#CameraParam_page").hide();
						ShowPaop(pageTitle, lg.get("IDS_CHSTA_NoConfig"));
					}
				}, pageTitle, "NetWork.RemoteDeviceV3", -1, WSMsgID.WsMsgID_CONFIG_GET); 
			}, pageTitle, "NetWork.ChnStatus", -1, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			ShowChildConfigFrame(pageTitle, false, false);
			ShowPaop(pageTitle, lg.get("IDS_CHSTA_NoConfig"));
			MasklayerHide();
		}
	}
	function SaveSelChn() {
		var cfg = CameraCfg[CameraCfg.Name];
		cfg.ExposureParam.Level = $("#Exposure_Mode").val() * 1;
		var temp = '0x' + toHex($("#min_time_id").val() * 1000, 8);
		cfg.ExposureParam.LeastTime = temp;
		temp = '0x' + toHex($("#max_time_id").val() * 1000, 8);
		cfg.ExposureParam.MostTime = temp;
		cfg.ApertureMode = '0x' + toHex($("#Cam_Iris").val(), 8);
		cfg.WhiteBalance = '0x' + toHex($("#Cam_WBMode").val(), 8);
		cfg.BLCMode = '0x' + toHex($("#Cam_BLC").val(), 8);
		cfg.ElecLevel = $("#Cam_AE").val() * 1;
		cfg.AeSensitivity = $("#Cam_Sen").slider("getValue");
		cfg.GainParam.AutoGain = $("#Cam_GainMode").val() * 1;
		cfg.GainParam.Gain = $("#Cam_GainStrength").val() *1
		cfg.EsShutter = '0x' + toHex($("#Cam_Slow_shutter").val() * 2, 8);
		cfg.IRCUTMode = $("#IR_CUTR").val() * 1;
		cfg.Day_nfLevel = $("#day_dn_id").val() * 1;
		cfg.Night_nfLevel = $("#night_dn_id").val() * 1;
		cfg.PictureMirror = '0x' + toHex($("#MirrorSwitch").prop("checked") * 1, 8);
		cfg.PictureFlip = '0x' + toHex($("#FlipSwitch").prop("checked") * 1, 8);
		cfg.RejectFlicker = '0x' + toHex($("#AntiSwitch").prop("checked") * 1, 8);
		cfg.IrcutSwap = $("#IrSwapSwitch").prop("checked") * 1;
		var DNval = $("#Cam_DNMode").val() * 1;
		if($("#Cam_DNMode").val() != null){
			if(_bLP4G){
				LP4GLedParameter[LP4GLedParameter.Name].Type = $("#Cam_DNMode").val() * 1 + 1;
			}else{
				cfg.DayNightColor = '0x' + toHex(DNval, 8);
				if(DNval < 3){
					cfg.DncThr = $(currentDNCDiv).slider("getValue");
				}
			}
		}
		if(_bWidth && isObject(CameraExCfg)){
			var cfgEx = CameraExCfg[CameraExCfg.Name];
			if(_bImgStyle){
				cfgEx.Style = strImgStyle[$("#Cam_Image_Style").val()*1];
			}
			cfgEx.BroadTrends.AutoGain = $("#Cam_DwdrMode").val() * 1;
			cfgEx.BroadTrends.Gain = $("#Cam_DwdrStrength").val() *1;
			if($("#Cam_DNMode").val() != null && DNval >= 3){
				cfgEx.AutomaticAdjustment = $(currentGearCtrlBox).slider("getValue");
			}
			if (isObject(CameraAblity) && CameraAblity.SupportPreventOverExpo == 1) {
				cfgEx.PreventOverExpo = $("#PreOverExposureSwitch").prop("checked") *1;
			}
			// 日夜切换
			if (isObject(CameraAblity) && CameraAblity.SupManualSwitchDayNight == 1) {
				var currentIndex = $("#DayNightSwtichSelect").val() * 1;
				if(isObject(cfgEx.DayNightSwitch))
				{
					cfgEx.DayNightSwitch.SwitchMode = currentIndex;
					if(currentIndex == 3)
					{
						var ts = "0 ";
						ts += GetTimeVal($("#BH")) + ":" + GetTimeVal($("#BM")) + ":00-";
						ts += GetTimeVal($("#EH")) + ":" + GetTimeVal($("#EM")) + ":00";
						cfgEx.DayNightSwitch.KeepDayPeriod = ts; 
					}
				}
			}
			if(_bCorridorMode){
				cfgEx.CorridorMode = $("#CorridorMode").val()*1;
			}
		}
		if(_bClearFog){
			ClearFogCfg[ClearFogCfg.Name].enable = $("#Cam_DefogMode").val()*1 == 1 ? true : false;
			ClearFogCfg[ClearFogCfg.Name].level = $("#Cam_DefogThreshTarget").val() *1;
		}
		if(_bSpecialNight){
			cfg = SpecialNightCfg[SpecialNightCfg.Name];
			cfg.enable = $("#SpecialNightSwitch").prop("checked");
		}
	}
	function SaveWhiteLightCfg(){
		WhiteLightCfg[WhiteLightCfg.Name].WorkPeriod.Enable = $("#LightUp_TimeEnable").prop("checked") * 1;
		WhiteLightCfg[WhiteLightCfg.Name].WorkPeriod.SHour = $("#LU_BH").val() * 1;
		WhiteLightCfg[WhiteLightCfg.Name].WorkPeriod.SMinute = $("#LU_BM").val() * 1;
		WhiteLightCfg[WhiteLightCfg.Name].WorkPeriod.EHour = $("#LU_EH").val() * 1;
		WhiteLightCfg[WhiteLightCfg.Name].WorkPeriod.EMinute = $("#LU_EM").val() * 1;
		RfParamCall(function(a){
			if(bReboot){
				RebootDev(pageTitle, lg.get("IDS_CONFIRM_RESTART"), false);
			}
			else{
				ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
			}
		}, pageTitle, "Camera.WhiteLight", -1, WSMsgID.WsMsgID_CONFIG_SET, WhiteLightCfg, true);
	}
	function SaveSpecialNight(){
		if(_bSpecialNight){
			RfParamCall(function(a){
				if(bSupportFullColorLightWorkPeriod)
				{
					SaveWhiteLightCfg();
				}
				else
				{
					if(bReboot){
						RebootDev(pageTitle, lg.get("IDS_CONFIRM_RESTART"), false);
					}
					else{
						ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
					}
				}
			}, pageTitle, "Camera.SpecialNight", -1, WSMsgID.WsMsgID_CONFIG_SET, SpecialNightCfg);
		}else{
			if(bSupportFullColorLightWorkPeriod)
			{
				SaveWhiteLightCfg();
			}
			else
			{
				if(bReboot){
					RebootDev(pageTitle, lg.get("IDS_CONFIRM_RESTART"), false);
				}
				else{
					ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
				}
			}
		}
	}
	function SaveLP4GLedParameter(){
		if(_bLP4G){
			var fName = "Dev.LP4GLedParameter";
			var nChn = -1;
			if(!bIPC){
				fName = "bypass@Dev.LP4GLedParameter"
				nChn = chnIndex - gDevice.loginRsp.VideoInChannel;
			}
			RfParamCall(function(a){
				SaveSpecialNight();
			}, pageTitle, fName, nChn, WSMsgID.WsMsgID_CONFIG_SET, LP4GLedParameter);
		}else{
			SaveSpecialNight();
		}
	}
	function SaveHumanCfg(){
		if(!humanCfg[humanCfg.Name].Enable){
			humanCfg[humanCfg.Name].Enable = true;
			RfParamCall(function(a){
				SaveLP4GLedParameter();
			}, pageTitle, "Detect.HumanDetection", chnIndex, WSMsgID.WsMsgID_CONFIG_SET, humanCfg);
		}else{
			SaveLP4GLedParameter();
		}
	}
	function SaveMotionCfg(){
		var cfg = CameraCfg[CameraCfg.Name];
		var bSaveMotionAndHuman = false;
		if(parseInt(cfg.DayNightColor, 16) == 3){
			if(_bHumanCfg || (_bNVRHuman && isObject(digitalHumanAbility)
			&& digitalHumanAbility.HumanDection)){
				if(!motionCfg[motionCfg.Name].Enable || !humanCfg[humanCfg.Name].Enable){
					bSaveMotionAndHuman = true;
				}
			}
		}
		
		if(bSaveMotionAndHuman){
			if(!motionCfg[motionCfg.Name].Enable){
				motionCfg[motionCfg.Name].Enable = true;
				RfParamCall(function(a){
					SaveHumanCfg();
				}, pageTitle, "Detect.MotionDetect", chnIndex, WSMsgID.WsMsgID_CONFIG_SET, motionCfg);
			}else{
				SaveHumanCfg();
			}
		}else{
			SaveLP4GLedParameter();
		}
	}
	function SaveClearFog(){
		if(_bClearFog){
			RfParamCall(function(a){
				SaveMotionCfg();
			}, pageTitle, "Camera.ClearFog", chnIndex, WSMsgID.WsMsgID_CONFIG_SET, ClearFogCfg);
		}else{
			SaveMotionCfg();
		}
	}
    $(function () {
		if(_bSpecialNight){
			$("#SpecialNightSpan").css("display", "");
		}
		if (gDevice.loginRsp.ChannelNum > 1 && !bIPC) {
			$("#CAM_CHN_TABLE").css("display", "block");
		}
		$("#Cam_Iris").empty();
		$("#Cam_Iris").append('<option value="0">'+ lg.get("IDS_CAM_Close") +'</option>');
		$("#Cam_Iris").append('<option value="1">'+ lg.get("IDS_CAM_Open") +'</option>');
		$("#Cam_WBMode").empty();
		$("#Cam_WBMode").append('<option value="0">'+ lg.get("IDS_CAM_AutoOper") +'</option>');
		$("#Cam_WBMode").append('<option value="1">'+ lg.get("IDS_CAM_Indoor") +'</option>');
		$("#Cam_WBMode").append('<option value="2">'+ lg.get("IDS_CAM_Outdoor") +'</option>');
		$("#Cam_BLC").empty();
		$("#Cam_BLC").append('<option value="0">'+ lg.get("IDS_CAM_Close") +'</option>');
		$("#Cam_BLC").append('<option value="1">'+ lg.get("IDS_CAM_Open") +'</option>');
		$("#Cam_Image_Style").empty();
		for (var i = 0; i < 3; i++) {
			$("#Cam_Image_Style").append('<option value="'+i+'">'+ (lg.get("IDS_CAM_Style") + (i+1)) +'</option>');
		} 
		$("#Cam_DwdrMode").empty();
		$("#Cam_DwdrMode").append('<option value="0">'+ lg.get("IDS_CAM_Close") +'</option>');
		$("#Cam_DwdrMode").append('<option value="1">'+ lg.get("IDS_CAM_Open") +'</option>');
		$("#Cam_DefogMode").empty();
		$("#Cam_DefogMode").append('<option value="0">'+ lg.get("IDS_CAM_Close") +'</option>');
		$("#Cam_DefogMode").append('<option value="1">'+ lg.get("IDS_CAM_Open") +'</option>');
		$("#Cam_GainMode").empty();
		$("#Cam_GainMode").append('<option value="0">'+ lg.get("IDS_CAM_Close") +'</option>');
		$("#Cam_GainMode").append('<option value="1">'+ lg.get("IDS_CAM_Open") +'</option>');
		$("#Cam_Slow_shutter").empty();
		var strArr = ["None", "Low", "Mid", "High"]
		for (var i=0; i < 4; i++) {
			$("#Cam_Slow_shutter").append('<option value="'+i+'">'+ lg.get("IDS_CAM_Shutter"+strArr[i]) +'</option>');
		}
		$("#IR_CUTR").empty();
		$("#IR_CUTR").append('<option value="0">'+ lg.get("IDS_CAM_SyncSwitch") +'</option>');
		$("#IR_CUTR").append('<option value="1">'+ lg.get("IDS_CAM_AutoSwitch") +'</option>');
		$("#day_dn_id").empty();
		$("#night_dn_id").empty();
		for (var i=0; i < 6; i++) {
			$("#day_dn_id").append('<option value="'+i+'">'+i+'</option>');
			$("#night_dn_id").append('<option value="'+i+'">'+i+'</option>');
		}
		$("#CorridorMode").empty();
		$("#CorridorMode").append('<option value="0">'+ lg.get("IDS_CAM_NormalMode") +'</option>');
		var str = lg.get("IDS_CAM_CorridorMode") + '1';
		$("#CorridorMode").append('<option value="1">'+ str +'</option>');
		$("#CorridorMode").append('<option value="2">'+ lg.get("IDS_CAM_Reflection") +'</option>');
		var str = lg.get("IDS_CAM_CorridorMode") + '2';
		$("#CorridorMode").append('<option value="3">'+ str +'</option>');

		$("#Cam_Sen").slider({width: 130, minValue: 1, maxValue: 10, mouseupCallback: null});
		$("#SendBtn").click(function(){
			var strSend = $("#DebugInput").val();
			if (strSend != "") {
				var data = {
					"DebugCamera" : strSend, 
					"Name" : "DebugCamera"
				};
				RfParamCall(function(a){
					ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
				}, pageTitle, "DebugCamera", -1, WSMsgID.WsMsgID_SYSTEM_DEBUG_REQ, data);
			}
		});
		$("#SaveBtn").click(function(){
			var data = {
				"DebugCameraSaveCmd":"debugsave",
				"Name":"DebugCameraSaveCmd"
			};
			RfParamCall(function(a){
				ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
			}, pageTitle, "DebugCameraSaveCmd", -1, WSMsgID.WsMsgID_SYSTEM_DEBUG_REQ, data);
		});
		$("#Cam_DwdrMode, #Cam_GainMode, #Cam_DefogMode").change(function () {
			ShowLevel($(this).attr('id'));
		});
		$("#Cam_DNMode").change(function () {
			ShowAdjustVlaue(currentGearCtrlBox, currentDNCDiv);
			if(bSupportFullColorLightWorkPeriod)
			{
				$("#WhiteLightUpTimeSectionBox").css("display", $("#Cam_DNMode").val() * 1 == 1 ? "" : "none");
			}
		});
		$("#DayNightSwtichSelect").change(function(){
			ShowDayNightSwitchControl();
		});
		$("#Exposure_Mode").change(function () {
			if($("#Exposure_Mode").val() * 1 == 0){
				$("#exposure_autoDiv").css("display", "");
			}else{
				$("#exposure_autoDiv").css("display", "none");
			}
		});
		$("#ChncamChannelMask").change(function () {
			chnIndex = $("#ChncamChannelMask").val() * 1;
			GetChannelFunc();
		});
		$("#ChncamRf").click(function () {
			if(bIPC){
				GetCameraAblity();
			}else{
				InitChannel();
			}
		});
		$("#min_time_id, #max_time_id").keyup(function () {
			if (!/^\d+\.?\d*$/.test($(this).val())) {
				var tmp = /^\d+\.?\d*/.exec($(this).val());
				if(tmp == null){
					tmp = '';
				}
				$(this).val(tmp);
			}
			if(parseFloat($(this).val()) > 80){
				$(this).val(80);
			}
		});
		$("#min_time_id, #max_time_id").blur(function () {
			var value = parseFloat($(this).val());
			if (parseInt(value * 1000) < 1 || $(this).val() == '') {
				$(this).val("0.001");
			}
			$(this).val(parseFloat($(this).val()));
			
			var LeastTime = parseFloat($("#min_time_id").val());
			var MostTime = parseFloat($("#max_time_id").val());
			if(MostTime < LeastTime){
				$("#max_time_id").val(LeastTime);
				$("#min_time_id").val(LeastTime);
			}
		});
		$("#TimeSection input").keyup(function(){
			var tmp = $(this).val().replace(/\D/g,'');
			$(this).val(tmp);
			var nWitch;
			var b = $(this).parent().find("input");;
			for(var i = 0; i < 4; i++){
				if(b.eq(i).prop("id") == $(this).prop("id")){
					nWitch = i;
					break;
				}
			}

			var timeArr = [b.eq(0).val() * 1, b.eq(1).val() * 1,
			b.eq(2).val() * 1, b.eq(3).val() * 1];		
			if (0 == nWitch || 2 == nWitch){
				if (timeArr[nWitch] > 24){
					timeArr[nWitch] = 24;
				}
			}else{
				var iEh2 = timeArr[nWitch - 1];
				if (iEh2 != 24 && timeArr[nWitch] > 59){
					timeArr[nWitch] = 59;
				}
				if(iEh2 == 24){
					timeArr[nWitch] = 0;
				}
			}
			if (timeArr[0] == 24){
				timeArr[1] = 0;
			}

			if (timeArr[2] == 24){
				timeArr[3] = 0;
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
		$("#TimeSection input").blur(function (){
			var i;
			var nWitch;	
			var b = $(this).parent().find("input");		
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
		});
		$("#ChncamSV").click(function () {
			bReboot = false;
			SaveSelChn();
			RfParamCall(function(a,b){
				if(_bWidth && isObject(CameraExCfg)){
					RfParamCall(function(a, b){
						if(a.Ret == 603){
							bReboot = true;
						}
						SaveClearFog();
					}, pageTitle, "Camera.ParamEx", chnIndex, WSMsgID.WsMsgID_CONFIG_SET, CameraExCfg);
				}else{
					SaveClearFog();
				}
			}, pageTitle, "Camera.Param", chnIndex, WSMsgID.WsMsgID_CONFIG_SET, CameraCfg);
		});

		ChangeBtnState();
		if(bIPC){
			chnIndex = 0;
			GetCameraAblity();
		}else{
			InitChannel();
		}
    });
});