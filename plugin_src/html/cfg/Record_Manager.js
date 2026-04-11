//# sourceURL=Record_Manager.js
$(function () {
	var recordCfg = new Array;
	var chnIndex = -1;
	var pageTitle = $("#Record_Manager").text();
	var weekIndex = 0;
	var bAlarmShow = GetFunAbility(gDevice.Ability.AlarmFunction.AlarmConfig) || GetFunAbility(gDevice.Ability.AlarmFunction.IPCAlarm);
	if(g_productID === "G2"){
		bAlarmShow = !1;
		$("#Redundancy_div").hide();
	}
	var bSdShow = GetFunAbility(gDevice.Ability.OtherFunction.SDsupportRecord);
	var bUsbShow = GetFunAbility(gDevice.Ability.OtherFunction.USBsupportRecord);
	var bBreviaryShow = false;
	var BreviaryCfg = null;
	var bPreRec = false;
	var preRec = null;
	var bGet = new Array;
	var copyCfg;
	var bCopy;
	var nCopyWeek;
	var StoragePos;
	var SupExtRec;
	var bReboot;
	var bNoHandleRecord = GetFunAbility(gDevice.Ability.OtherFunction.NoSupportHandleRecord);
	if (GetFunAbility(gDevice.Ability.OtherFunction.SupportSnapSchedule)){
		bBreviaryShow = false;
	}else{
		bBreviaryShow = GetFunAbility(gDevice.Ability.OtherFunction.SupportBreviary);
	}
	if(gDevice.devType == devTypeEnum.DEV_IPC){
		$("#REC_CHN_TABLE, #RECconfigCP, #RECconfigPA").css("display", "none");	
	}
	$(".recsect input").prop("maxlength", 2);
	function ShowData(nChn, nWeek, bChangeWeek) {
		var cfg = recordCfg[nChn][recordCfg[nChn].Name];
		if(!bChangeWeek){
			var bSameTimeSection = true;
			var i=0;
			for (i = 0; i < 7;i++ ){
				for(var j = i + 1; j < 7; j++ ){
					for(var k = 0; k < 4; k++){
						if(cfg.Mask[i][k] != cfg.Mask[j][k] ||
							cfg.TimeSection[i][k] != cfg.TimeSection[j][k]){
							bSameTimeSection = false;
							break;
						}
					}
					if (!bSameTimeSection){
						break;
					}
				}
				if (!bSameTimeSection){
					break;
				}
			}
			
			if (bSameTimeSection){
				$("#RECWeekChid").val(7);
			}else{
				$("#RECWeekChid").val(weekIndex);
			}
		}
		
		$("#PreRecord_div").css("display", "");
		var bEnable = GetFunAbility(gDevice.Ability.OtherFunction.SupportDigitalPre);
		if(nChn >= gDevice.loginRsp.VideoInChannel){
			if(!bEnable){
				$("#PreRecord_div").css("display", "none");
			}
		}
		$("#Redundancy").prop("checked", cfg.Redundancy);
		$("#PacketLength").val(cfg.PacketLength);
		$("#PreRecord").val(cfg.PreRecord);
		var tsCfg = cfg.TimeSection;
		for (var i = 1; i <= 4; ++i) {
			var sect = tsCfg[nWeek][i - 1].split(" ");
			var tSect = sect[1].split("-");
			var btSect = tSect[0].split(":");
			var etSect = tSect[1].split(":");
			$("#StartHour" + i).val(btSect[0]);
			$("#StartMinute" + i).val(btSect[1]);
			$("#EndHour" + i).val(etSect[0]);
			$("#EndMinute" + i).val(etSect[1]);
			if(!bNoHandleRecord){
				var mask = cfg.Mask[nWeek][i-1];
				if(mask & 1){
					$("#Normal" + i).prop("checked", true);
				}else{
					$("#Normal" + i).prop("checked", false);
				}
				if(mask & 4){
					$("#Motion" + i).prop("checked", true);
				}else{
					$("#Motion" + i).prop("checked", false);
				}
				if(mask & 2){
					$("#Alarm" + i).prop("checked", true);
				}else{
					$("#Alarm" + i).prop("checked", false);
				}
			}
		}
		if(bNoHandleRecord){
			$("#NoHandleRecordMode_Div input").attr("data", 0);
			$("#NoHandleRecordMode_Div input").prop("checked", false);
			var nMask = parseInt(cfg.Mask[0][0]);
			if(cfg.RecordMode == "ConfigRecord"){
				if(nMask == 1){
					$("#NormalMode").attr("data", 1);
					$("#NormalMode").prop("checked", true);
				}else if(nMask == 6){
					$("#AlarmMode").attr("data", 1);
					$("#AlarmMode").prop("checked", true);
				}else if(nMask == 7){
					$("#NormalMode, #AlarmMode").attr("data", 1);
					$("#NormalMode, #AlarmMode").prop("checked", true);
				}	
			}else if(cfg.RecordMode == "ClosedRecord"){
				$("#ClosedMode2").attr("data", 1);
				$("#ClosedMode2").prop("checked", true);
			}else{
				$("#NormalMode").attr("data", 1);
				$("#NormalMode").prop("checked", true);
			}
		}else{
			if(cfg.RecordMode == "ConfigRecord"){
				$("#AutoMode").prop("checked", true);
				EnableBox(1, "#Week_TABLE");
				EnableBox(1, "#RecTimeSectBox");
			}else if(cfg.RecordMode == "ManualRecord"){
				$("#ManualMode").prop("checked", true);
				EnableBox(0, "#Week_TABLE");
				EnableBox(0, "#RecTimeSectBox");
			}else{
				$("#ClosedMode").prop("checked", true);
				EnableBox(0, "#Week_TABLE");
				EnableBox(0, "#RecTimeSectBox");
			}
			if(parseInt(SupExtRec[SupExtRec.Name].AbilityPram) != 0){
				EnableBox(1, "#Week_TABLE");
				EnableBox(1, "#RecTimeSectBox");
			}
		}
				
		MasklayerHide();
	}
	function GetReocrdCfg(nChn, nWeek, bChangeWeek){
		if(!bGet[nChn]){
			RfParamCall(function(a){
				recordCfg[nChn] = a;
				var timeSection = recordCfg[nChn][recordCfg[nChn].Name].TimeSection;
				for(var i = 0; i < timeSection.length; i++){
					if(isObject(timeSection[i])){
						for(var j = 0; j < timeSection[i].length ; j++){
							if(timeSection[i][j] == ""){
								timeSection[i][j] = "0 00:00:00-00:00:00";
							}
						}
					}
				}
				recordCfg[nChn][recordCfg[nChn].Name].TimeSection = timeSection;
				bGet[nChn] = true;				
				ShowData(nChn, nWeek, bChangeWeek);
			}, pageTitle, "Record", nChn, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			ShowData(nChn, nWeek, bChangeWeek);
		}
	}
	function FillDate(){
		if(bBreviaryShow){
			$("#Breviary").prop("checked", BreviaryCfg[BreviaryCfg.Name].BreviaryEn)
		}
		if (bSdShow){
			$("#SD").prop("checked", StoragePos[StoragePos.Name].SD);
		}
		if (bUsbShow){
			$("#USB").prop("checked", StoragePos[StoragePos.Name].USB);
		}	
		if(parseInt(SupExtRec[SupExtRec.Name].AbilityPram) != 0 || bNoHandleRecord){
			$("#RecordModeBox").css("display", "none");
		}
		var nChn = chnIndex == gDevice.loginRsp.ChannelNum ? 0 : chnIndex;
		var nWeek = weekIndex == 7 ? 0: weekIndex;
		GetReocrdCfg(nChn, nWeek, false);
	}
	function LoadCfg(){
		RfParamCall(function(a, b){
			if(a.Ret == 100){
				bPreRec = true;
				preRec = a;
			}else{
				bPreRec = false;
			}
			RfParamCall(function(a, b){
				StoragePos = a;
				RfParamCall(function(a, b){
					SupExtRec = a;
					//SupExtRec[SupExtRec.Name].AbilityPram = "0x00000002";
					if(bBreviaryShow){
						RfParamCall(function(a, b){
							BreviaryCfg = a;
							FillDate();
						}, pageTitle, "Snap.Breviary", -1, WSMsgID.WsMsgID_CONFIG_GET);
					}else{
						FillDate();
					}
				}, pageTitle, "SupportExtRecord", -1, WSMsgID.WsMsgID_ABILITY_GET);
			}, pageTitle, "Storage.StoragePosition", -1, WSMsgID.WsMsgID_CONFIG_GET);
		}, pageTitle, "MaxPreRecord", -1, WSMsgID.WsMsgID_ABILITY_GET);
	}
	function EnableBox(a, b) {
		if(bNoHandleRecord){
			return;
		}
		var d = $(b);
		if (a == 0) {
			d.find("select").prop("disabled", true);
			d.find("input").prop("disabled", true);
			if (d.css("display") != "none") {
				d.stop().fadeTo("slow", 0.2);
				d.find(".recmask").stop().fadeTo("slow", 0.2);
			}
		} else {
			d.find("select").prop("disabled", false);
			d.find("input").prop("disabled", false);
			if (d.css("display") != "none") {
				d.stop().fadeTo("slow", 1);
				d.find(".recmask").stop().fadeTo("slow", 1);
			}
			d.children().prop("disabled", false);
		}
		d = null
	}
	function GetTimeVal(el){
		var tmp = $(el).val() * 1;
		if(tmp <= 9){
			return '0' + tmp;
		}else{
			return tmp;
		}
	}
	function SaveReocrdCfg(nChn, nWeek){
		if (nChn < 0 || nChn > gDevice.loginRsp.ChannelNum || nWeek < 0 || nWeek > 6){
			return false;
		}
		var cfg = recordCfg[nChn][recordCfg[nChn].Name];
		cfg.Redundancy = $("#Redundancy").prop("checked");
		cfg.PacketLength = $("#PacketLength").val() * 1;
		cfg.PreRecord = $("#PreRecord").val() * 1;
		for(var i = 0; i < 4; i++){
			var ts = "";
			var j = i + 1;
			var TSCfg = cfg.TimeSection[nWeek][i];
			TSCfg = TSCfg.split(" ");
			ts += TSCfg[0];
			ts += " ";
			var nStartHour = GetTimeVal($("#StartHour" + j));
			var nStartMinute = GetTimeVal($("#StartMinute" + j));
			var nEndHour = GetTimeVal($("#EndHour" + j));
			var nEndMinute = GetTimeVal($("#EndMinute" + j));
			if (nEndHour == nStartHour) {
				if (nStartMinute > nEndMinute) {
					ShowPaop(pageTitle, lg.get("IDS_BEGIN_OVER_EDNTIME"));
					return false;
				} 
			} else if (nEndHour < nStartHour) {
				ShowPaop(pageTitle, lg.get("IDS_BEGIN_OVER_EDNTIME"));
				return false;
			}
			ts += GetTimeVal($("#StartHour" + j)) + ":" + GetTimeVal($("#StartMinute" + j)) + ":00-";
			ts += GetTimeVal($("#EndHour" + j)) + ":" + GetTimeVal($("#EndMinute" + j)) + ":00";
			cfg.TimeSection[nWeek][i] = ts;
			if(!bNoHandleRecord){
				var nMask = 0x00;
				if($("#Normal" + j).prop("checked")){
					nMask |= 0x01 << 0;
				}
				if($("#Motion" + j).prop("checked")){
					nMask |= 0x01 << 2;
				}
				if($("#Alarm" + j).prop("checked")){
					nMask |= 0x01 << 1;
				}
				cfg.Mask[nWeek][i] = "0x" + toHex(nMask,8);
			}
		}
		
		if(bNoHandleRecord){
			var nNormal = $("#NormalMode").prop("checked");
			var nAlarm = $("#AlarmMode").prop("checked");
			if(nNormal || nAlarm){
				cfg.RecordMode = "ConfigRecord";
				if(nNormal && nAlarm){
					SetAllMask(nChn, 7);
				}else if(nNormal){
					SetAllMask(nChn, 1);
				}else{
					SetAllMask(nChn, 6);
				}	
			}else{
				cfg.RecordMode = "ClosedRecord";
			}		
		}else{
			var Mode;
			if($("#AutoMode").prop("checked")){
				Mode = "ConfigRecord";
			}else if($("#ManualMode").prop("checked")){
				Mode = "ManualRecord";
			}else{
				Mode = "ClosedRecord";
			}
//			if(parseInt(SupExtRec[SupExtRec.Name].AbilityPram) !=  0){
				cfg.RecordMode = Mode;
//			}
		}
		
		return true;
	}
	function SaveAllCfg(callback){
		RfParamCall(function(a){
			var RecordAll = a;
			for(var i = 0; i < gDevice.loginRsp.ChannelNum; i++){
				var sRecordMode = a[a.Name][i].RecordMode;
				a[a.Name][i] = cloneObj(recordCfg[0][recordCfg[0].Name]);
				if(!bNoHandleRecord){
					a[a.Name][i].RecordMode = sRecordMode;
				}
			}
			RfParamCall(function(a){
				if(parseInt(SupExtRec[SupExtRec.Name].AbilityPram) == 1 || parseInt(SupExtRec[SupExtRec.Name].AbilityPram) == 2){
					RfParamCall(function(a){
						var RecordAllEx = a;
						for(var i = 0; i < gDevice.loginRsp.ChannelNum; i++){
							var sRecordMode = RecordAllEx[RecordAllEx.Name][i].RecordMode;
							var sMask = RecordAllEx[RecordAllEx.Name][i].Mask
							RecordAllEx[RecordAllEx.Name][i] = cloneObj(recordCfg[0][recordCfg[0].Name]);
							if(parseInt(SupExtRec[SupExtRec.Name].AbilityPram) == 1 && recordCfg[0][recordCfg[0].Name].RecordMode !== "ClosedRecord"){
								sRecordMode = "ClosedRecord";
							}
							RecordAllEx[RecordAllEx.Name][i].RecordMode = sRecordMode;
							if(bNoHandleRecord){								
								RecordAllEx[RecordAllEx.Name][i].Mask = sMask;
							}
						}
						RfParamCall(function(a){
							callback(true);
						}, pageTitle, "ExtRecord", -1, WSMsgID.WsMsgID_CONFIG_SET, RecordAllEx);
					}, pageTitle, "ExtRecord", -1, WSMsgID.WsMsgID_CONFIG_GET);
				}else{
					callback(true);
				}
			}, pageTitle, "Record", -1, WSMsgID.WsMsgID_CONFIG_SET, RecordAll);
		}, pageTitle, "Record", -1, WSMsgID.WsMsgID_CONFIG_GET);
	}
	function SaveExCfg(){
		bReboot = false;
		RfParamCall(function(a, b){
			if(a.Ret == 603){
				bReboot = true;
			}
			if(bBreviaryShow){
				RfParamCall(function(a, b){
					if(!bReboot){
						ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
						var nChn = $("#RECConfigChid").val() * 1;
						if (nChn == gDevice.loginRsp.ChannelNum && (gDevice.loginRsp.SoftWareVersion > "V2.62.R07" || gDevice.loginRsp.BuildTime > "2024-04-01")){
							Init();
						}
					}else{
						RebootDev(pageTitle, lg.get("IDS_CONFIRM_RESTART"), true);
					}
				}, pageTitle, "Snap.Breviary", -1, WSMsgID.WsMsgID_CONFIG_SET, BreviaryCfg);
			}else{
				if(!bReboot){
					ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
					var nChn = $("#RECConfigChid").val() * 1;
					if (nChn == gDevice.loginRsp.ChannelNum && (gDevice.loginRsp.SoftWareVersion > "V2.62.R07" || gDevice.loginRsp.BuildTime > "2024-04-01")){
						Init();
					}
				}else{
					RebootDev(pageTitle, lg.get("IDS_CONFIRM_RESTART"), true);
				}
			}
		}, pageTitle, "Storage.StoragePosition", -1, WSMsgID.WsMsgID_CONFIG_SET, StoragePos);
	}
	function SaveAllChnCfg(){
		if(parseInt(SupExtRec[SupExtRec.Name].AbilityPram) == 1 || parseInt(SupExtRec[SupExtRec.Name].AbilityPram) == 2){
			SaveAllCfg(function(a){
				if(a){
					SaveExCfg();
				}
			})
		}else{
			var cfg = {};
			var cfgName = "Record.[ff]";
			cfg[cfgName] = cloneObj(recordCfg[0][recordCfg[0].Name]);
			cfg.Name = cfgName;
			RfParamCall(function (data){
				SaveExCfg();
			}, pageTitle, cfgName, -1, WSMsgID.WsMsgID_CONFIG_SET, cfg);
		}
	}
	function SaveChnCfg(nIndex){
		if(nIndex < gDevice.loginRsp.ChannelNum){
			if(bGet[nIndex]){
				var CfgData = recordCfg[nIndex];
				RfParamCall(function (data){					
					if(parseInt(SupExtRec[SupExtRec.Name].AbilityPram) == 1 || parseInt(SupExtRec[SupExtRec.Name].AbilityPram) == 2){
						RfParamCall(function(a){
							var recordCfgEx = {};
							recordCfgEx.Name = "ExtRecord.[" + nIndex + "]";
							recordCfgEx[recordCfgEx.Name]= cloneObj(CfgData[CfgData.Name]);
							var sRecordMode = a[a.Name].RecordMode;
							if(parseInt(SupExtRec[SupExtRec.Name].AbilityPram) == 1 && CfgData[CfgData.Name].RecordMode !== "ClosedRecord"){
								sRecordMode = "ClosedRecord";
							}
							recordCfgEx[recordCfgEx.Name].RecordMode = sRecordMode;
							RfParamCall(function(data){
								SaveChnCfg(nIndex + 1);
							},pageTitle , "ExtRecord", nIndex, WSMsgID.WsMsgID_CONFIG_SET, recordCfgEx);

						},pageTitle, "ExtRecord", nIndex, WSMsgID.WsMsgID_CONFIG_GET);
					}else{
						SaveChnCfg(nIndex + 1);
					}
				}, pageTitle, "Record", nIndex, WSMsgID.WsMsgID_CONFIG_SET, CfgData);
			}else{
				SaveChnCfg(nIndex + 1);
			}
		}else{
			SaveExCfg();
		}
	}
	
	function Init(){
		bCopy = false;
		copyCfg = null;
		for (var i = 0; i < gDevice.loginRsp.ChannelNum; i++) {
			bGet[i] = false;
			recordCfg[i] = null;
		}
		LoadCfg();
	}
	function SetAllMask(nChn, nMask){
		var Mask = recordCfg[nChn][recordCfg[nChn].Name].Mask;
		for (var i = 0; i < 7;i++ ){
			for(var j = 0; j < 4; j++){
				Mask[i][j] = "0x" + toHex(nMask,8);
			}
		}
	}
	
	$(function () {
		if(bNoHandleRecord){
			$(".recmask").css("display", "none");
			$("#NoHandle_RecordModeBox").css("display", "");
		}
		if(gDevice.bGetDefault){
			$("#RECconfigDE").css("display", "");
		}
		$("#RECConfigChid").empty();
		var i;
		for (i = 0; i < gDevice.loginRsp.ChannelNum; i++) {
			$("#RECConfigChid").append('<option class="option" value="' + i + '">' + gDevice.getChannelName(i) + '</option>');
		}
		if(gDevice.loginRsp.ChannelNum > 1){
			$("#RECConfigChid").append('<option class="option" value="' + i + '">' + lg.get("IDS_CFG_ALL") + '</option>');
		}
		var strWeek = [lg.get("IDS_WD_Sunday"), lg.get("IDS_WD_Monday"),lg.get("IDS_WD_Tuesday"),
		lg.get("IDS_WD_Wednesday"),lg.get("IDS_WD_Thursday"),lg.get("IDS_WD_Friday"),
		lg.get("IDS_WD_Saturday"), lg.get("IDS_CFG_ALL")];
		$("#RECWeekChid").empty();
		for(i = 0; i < strWeek.length; i++){
			$("#RECWeekChid").append('<option value="'+ i +'">'+ strWeek[i] +'</option>');
		}
		
		if(chnIndex == -1){
			chnIndex = 0;
			var d = new Date();
			weekIndex = d.getDay();
		}
		$("#RECConfigChid").val(chnIndex);
		$("#RECWeekChid").val(weekIndex);
		
		if (!bAlarmShow){
			$("#AlarmTip, #Alarm1Span, #Alarm2Span, #Alarm3Span, #Alarm4Span").css("display", "none");
		}
		if (!bSdShow){
			$("#SD_div").css("display", "none");
		}
		if (!bUsbShow){
			$("#USB_div").css("display", "none");
		}
		if (!bBreviaryShow){
			$("#BreviaryBox").css("display", "none");
		}
		$("input[name='a']").click(function(){
			var nIndex = chnIndex;
			if (chnIndex == gDevice.loginRsp.ChannelNum){
				nIndex = 0;
			}
			var cfg = recordCfg[nIndex][recordCfg[nIndex].Name];
			if($("#AutoMode").prop("checked")){
				EnableBox(1, "#Week_TABLE");
				EnableBox(1, "#RecTimeSectBox");
				cfg.RecordMode = "ConfigRecord";
			}else{
				EnableBox(0, "#Week_TABLE");
				EnableBox(0, "#RecTimeSectBox");
				if($("#ManualMode").prop("checked")){
					cfg.RecordMode = "ManualRecord"
				}else{
					cfg.RecordMode = "ClosedRecord"
				}
			}
		});
		$("#RECWeekChid").change(function(){
			var nWeekChoose = $(this).val() * 1;
			var nChannel = chnIndex;
			if (chnIndex == gDevice.loginRsp.ChannelNum){
				nChannel = 0;
			}
			if (nWeekChoose == 7){
				GetReocrdCfg(nChannel, 0, true);
				weekIndex = nWeekChoose;
			}else if (weekIndex == 7 ){
				GetReocrdCfg(nChannel, nWeekChoose, true);
				weekIndex = nWeekChoose;
			}else{
				if (nWeekChoose != weekIndex){
					if (!SaveReocrdCfg(nChannel, weekIndex)){
						$("#RECWeekChid").val(weekIndex);
						return ;
					}
					GetReocrdCfg(nChannel, nWeekChoose, true);
					weekIndex = nWeekChoose;
				}
			}
		});
		$("#RECConfigChid").change(function () {
			var nChannel = $(this).val() * 1;
			var nWeek = weekIndex;
			if(nWeek == 7){
				nWeek = 0;
			}
			if (nChannel == gDevice.loginRsp.ChannelNum){
				GetReocrdCfg(0, nWeek, false);
				chnIndex = nChannel;
			}else if (chnIndex == gDevice.loginRsp.ChannelNum){
				GetReocrdCfg(nChannel, nWeek, false);
				chnIndex = nChannel;
			}else{
				if (nChannel != chnIndex){
					if (!SaveReocrdCfg(chnIndex, nWeek)){
						$("#RECConfigChid").val(chnIndex);
						return ;
					}
					chnIndex = nChannel;
					GetReocrdCfg(chnIndex, nWeek, false);
				}
			}
		});
		$("#RECconfigCP").click(function () {
			var nChn = $("#RECConfigChid").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum){
				nChn = 0;
			}
			var nWeek = $("#RECWeekChid").val() * 1;
			if(nWeek == 7){
				nWeek = 0;
			}
			if (!SaveReocrdCfg(nChn, nWeek)) {
				return ;
			}
			copyCfg = cloneObj(recordCfg[nChn]);
			bCopy = true;
			nCopyWeek = nWeek;
		});
		$("#RECconfigPA").click(function(){
			if(!bCopy) return;
			var cfg = copyCfg[copyCfg.Name];
			$("#Redundancy").prop("checked", cfg.Redundancy);
			$("#PacketLength").val(cfg.PacketLength);
			$("#PreRecord").val(cfg.PreRecord);		
			var tsCfg = cfg.TimeSection;
			for (var i = 1; i <= 4; ++i) {
				var sect = tsCfg[nCopyWeek][i - 1].split(" ");
				var tSect = sect[1].split("-");
				var btSect = tSect[0].split(":");
				var etSect = tSect[1].split(":");
				$("#StartHour" + i).val(btSect[0]);
				$("#StartMinute" + i).val(btSect[1]);
				$("#EndHour" + i).val(etSect[0]);
				$("#EndMinute" + i).val(etSect[1]);
				if(!bNoHandleRecord){
					var mask = cfg.Mask[nCopyWeek][i-1];
					if(mask & 1){
						$("#Normal" + i).prop("checked", true);
					}else{
						$("#Normal" + i).prop("checked", false);
					}
					if(mask & 4){
						$("#Motion" + i).prop("checked", true);
					}else{
						$("#Motion" + i).prop("checked", false);
					}
					if(mask & 2){
						$("#Alarm" + i).prop("checked", true);
					}else{
						$("#Alarm" + i).prop("checked", false);
					}
				}
			}
				
			if(bNoHandleRecord){
				$("#NoHandleRecordMode_Div input").attr("data", 0);
				$("#NoHandleRecordMode_Div input").prop("checked", false);
				var nMask = parseInt(cfg.Mask[0][0]);
				if(cfg.RecordMode == "ConfigRecord"){
					if(nMask == 1){
						$("#NormalMode").attr("data", 1);
						$("#NormalMode").prop("checked", true);
					}else if(nMask == 6){
						$("#AlarmMode").attr("data", 1);
						$("#AlarmMode").prop("checked", true);
					}else if(nMask == 7){
						$("#NormalMode, #AlarmMode").attr("data", 1);
						$("#NormalMode, #AlarmMode").prop("checked", true);
					}	
				}else if(cfg.RecordMode == "ClosedRecord"){
					$("#ClosedMode2").attr("data", 1);
					$("#ClosedMode2").prop("checked", true);
				}else{
					$("#NormalMode").attr("data", 1);
					$("#NormalMode").prop("checked", true);
				}
			}else{
				if(cfg.RecordMode == "ConfigRecord"){
					$("#AutoMode").prop("checked", true);
					EnableBox(1, "#Week_TABLE");
					EnableBox(1, "#RecTimeSectBox");
				}else if(cfg.RecordMode == "ManualRecord"){
					$("#ManualMode").prop("checked", true);
					EnableBox(0, "#Week_TABLE");
					EnableBox(0, "#RecTimeSectBox");
				}else{
					$("#ClosedMode").prop("checked", true);
					EnableBox(0, "#Week_TABLE");
					EnableBox(0, "#RecTimeSectBox");
				}		
				if(parseInt(SupExtRec[SupExtRec.Name].AbilityPram) != 0){
					EnableBox(1, "#Week_TABLE");
					EnableBox(1, "#RecTimeSectBox");
				}	
			}
			var nWeek = $("#RECWeekChid").val() * 1;
			if(nWeek == 7){
				nWeek = 0;
			}
			for(var i = 0; i < 4; i++){
				cfg.Mask[nWeek][i] = cfg.Mask[nCopyWeek][i];
				cfg.TimeSection[nWeek][i] = cfg.TimeSection[nCopyWeek][i];
			}
		});
		$("#RECconfigSave").click(function () {
			if(bBreviaryShow){
				BreviaryCfg[BreviaryCfg.Name].BreviaryEn = $("#Breviary").prop("checked")
			}
			if (bSdShow){
				StoragePos[StoragePos.Name].SD = $("#SD").prop("checked");
			}
			if (bUsbShow){
				StoragePos[StoragePos.Name].USB = $("#USB").prop("checked");
			}
			var nChn = $("#RECConfigChid").val() * 1;
			var nWeek = $("#RECWeekChid").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum){
				var i;
				if(nWeek == 7){
					for(i = 0; i < 7; i++){
						if (!SaveReocrdCfg(0, i)) {
							return ;
						}
					}
				}else{
					if (!SaveReocrdCfg(0, nWeek)){
						return ;
					}
				}
				if(gDevice.loginRsp.SoftWareVersion > "V2.62.R07" || gDevice.loginRsp.BuildTime > "2024-04-01"){
					SaveAllChnCfg();
				}else{
					for (i = 1; i < nChn; i++ ){
						if(bGet[i] && isObject(recordCfg[i])){
							recordCfg[i][recordCfg[i].Name] = cloneObj(recordCfg[0][recordCfg[0].Name]);
						}else{
							var cfg = {};
							var cfgName = "Record.[" + i + "]";
							cfg[cfgName] = cloneObj(recordCfg[0][recordCfg[0].Name]);
							cfg.Name = cfgName;
							recordCfg[i] = cfg;
							bGet[i] = true;
						}
					}
					SaveChnCfg(0);
				}
			}else if(nChn != gDevice.loginRsp.ChannelNum && nWeek == 7){
				for ( i = 0; i < 7; i ++ ){
					if (!SaveReocrdCfg(nChn, i)){
						return ;
					}
				}
				SaveChnCfg(0);
			}else{
				if (!SaveReocrdCfg(nChn, nWeek)) {
					return ;
				}
				SaveChnCfg(0);
			}	
		});
		$("#RECconfigRF").click(function () {
			Init();
		});
		$("#PreRecord").keyup(function(){
			var maxValue = 30;
			if(bPreRec){
				maxValue = parseInt(preRec[preRec.Name].AbilityPram);
			}
			
			if(keyboardFilter(event)) {
				NumberRange(this, 0, maxValue, -1);
			}
		});
		$(".recsect input").keyup(function (){
			var tmp = $(this).val().replace(/\D/g,'');
			$(this).val(tmp);
			var i;
			var nSect;	//组别
			var nWitch;	//0开始时间小时. 1开始时间分钟 2结束时间小时. 3结束时间分钟
			var a = $("div[id^='secttime']");
			var b;
			for(i = 0; i < 4; i++){
				if(a.eq(i).prop("id") == $(this).parent().prop("id")){
					nSect = i;
					b = a.eq(i).find("input");
					break;
				}
			}
			
			for(i = 0; i < 4; i++){
				if(b.eq(i).prop("id") == $(this).prop("id")){
					nWitch = i;
					break;
				}
			}
			
			var bChange = false;	
			var timeArr = [b.eq(0).val() * 1, b.eq(1).val() * 1,
						   b.eq(2).val() * 1, b.eq(3).val() * 1];		
			if (0 == nWitch || 2 == nWitch){//小时检查
				if (timeArr[nWitch] > 24){
					timeArr[nWitch] = 24;
					bChange = true;
				}
			
				if (2 == nWitch && tmp == ""){
					timeArr[nWitch] = 24;
					bChange = true;
				}
			}else{//分钟检查
				if (timeArr[nWitch] > 59){
					timeArr[nWitch] = 59;
					bChange = true;
				}
			}
	
			if (timeArr[0] == 24){
				timeArr[1] = 0;
				bChange = true;
			}	
	
			if (timeArr[2] == 24){
				timeArr[3] = 0;
				bChange = true;
			}	
			if (bChange){
				for(i = 0; i < 4; i++){
					if(i != nWitch){
						b.eq(i).val(timeArr[i] < 10 ? '0' + timeArr[i] : timeArr[i]);
					}else{
						if(tmp != ''){
							b.eq(i).val(timeArr[i]);
						}
					}
				}
			}
		});
		$(".recsect input").blur(function (){
			var i;
			var nSect;	//组别
			var nWitch;	//0开始时间小时. 1开始时间分钟 2结束时间小时. 3结束时间分钟
			var a = $("div[id^='secttime']");
			var b;
			for(i = 0; i < 4; i++){
				if(a.eq(i).prop("id") == $(this).parent().prop("id")){
					nSect = i;
					b = a.eq(i).find("input");
					break;
				}
			}
			for(i = 0; i < 4; i++){
				if(b.eq(i).prop("id") == $(this).prop("id")){
					nWitch = i;
					break;
				}
			}
			var timeArr = [b.eq(0).val() * 1, b.eq(1).val() * 1,
						   b.eq(2).val() * 1, b.eq(3).val() * 1];		
/*			if (0 == nWitch || 2 == nWitch){//小时检查
				if (timeArr[2] < timeArr[0]){
					timeArr[2] = timeArr[0];
				}else if (timeArr[2] == timeArr[0]){
					if(timeArr[3] < timeArr[1]){
						timeArr[3] = timeArr[1];
					}
				}
			}else{//分钟检查
				if (timeArr[2] == timeArr[0] && timeArr[3] < timeArr[1]){
					timeArr[3] = timeArr[1];
				}
			}
*/		
			for(i = 0; i < 4; i++){
				b.eq(i).val(timeArr[i] < 10 ? '0' + timeArr[i] : timeArr[i]);
			}
		});
		$("#NoHandleRecordMode_Div input").click(function(){
			var itemId = $(this).prop("id");
			var flag =  $(this).attr("data") * 1 ? true : false;			
			switch (itemId){
				case "NormalMode":
					$(this).prop("checked", !flag);
					$(this).attr("data", !flag * 1);
					if(!flag){
						$("#ClosedMode2").prop("checked", false);
						$("#ClosedMode2").attr("data", 0);					
					}else{
						if($("#AlarmMode").attr("data") * 1 == 0){
							$("#ClosedMode2").attr("data", 1);
							$("#ClosedMode2").prop("checked", true);													
						}
					}
					break;
				case "AlarmMode":
					$(this).prop("checked", !flag);
					$(this).attr("data", !flag * 1);
					if(!flag){
						$("#ClosedMode2").prop("checked", false);
						$("#ClosedMode2").attr("data", 0);					
					}else{
						if($("#NormalMode").attr("data") * 1 == 0){
							$("#ClosedMode2").attr("data", 1);
							$("#ClosedMode2").prop("checked", true);													
						}
					}					
					break;
				case "ClosedMode2":
					if(!flag){
						$(this).prop("checked", true);
						$(this).attr("data", 1);
						$("#NormalMode, #AlarmMode").attr("data", 0);
						$("#NormalMode, #AlarmMode").prop("checked", false);
					}
					break;
				default:
					break;
			}
		});
		$("#RECconfigDE").click(function(){	
			var nChn = chnIndex == gDevice.loginRsp.ChannelNum ? 0 : chnIndex;
			var nWeek = weekIndex == 7 ? 0: weekIndex;
			RfParamCall(function(a){
				recordCfg[nChn] = a;
				var timeSection = recordCfg[nChn][recordCfg[nChn].Name].TimeSection;
				for(var i = 0; i < timeSection.length; i++){
					if(isObject(timeSection[i])){
						for(var j = 0; j < timeSection[i].length ; j++){
							if(timeSection[i][j] == ""){
								timeSection[i][j] = "0 00:00:00-00:00:00";
							}
						}
					}
				}
				recordCfg[nChn][recordCfg[nChn].Name].TimeSection = timeSection;
				bGet[nChn] = true;				
				ShowData(nChn, nWeek, false);
			}, pageTitle, "Record", nChn, WSMsgID.WsMsgID_DEFAULTCONFIG_GET);	
		});
		Init();
	});
});
