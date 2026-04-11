$(document).ready(function () {
    var chnIndex = -1;
    var pageTitle = $("#Alarm_Intelligent").text();
	var AnalyseCfg = new Array;
	var AnalyseDig = new Array;
	var bGet = new Array;
	var bGetDig = new Array;
	var digitalCh = new Array;
	var analyseAbility = null;
	var analyseAbilityV2All = new Array;
	var bReboot = false;
	var bIPC = gDevice.devType == devTypeEnum.DEV_IPC ? true : false;
	var digType = ["Pub", "PEARule", "OSCRule", "AVDRule"];
	var PEAZoneObj;
	var OSCZoneObj;
	var MODULE_TYPE = {
		PEA: 0,
		OSC: 1,
		AVD: 2,
		CPC: 3,
		BCT: 4,
		ALL: 5
	};
	function ShowModuleType(nIndex){
		$("#Arithmetic").empty();
		var dataHtml = '';
		if(nIndex < gDevice.loginRsp.VideoInChannel){
			if (ExtractMask(analyseAbility.IntelPEA, nIndex)){
				dataHtml += '<option value="' + 0 + '">' + lg.get("IDS_SMART_PEA") + '</option>';
			}
			if (ExtractMask(analyseAbility.IntelOSC, nIndex)){
				dataHtml += '<option value="' + 1 + '">' + lg.get("IDS_SMART_OSC") + '</option>';
			}
			if (ExtractMask(analyseAbility.IntelAVD, nIndex)){
				dataHtml += '<option value="' + 2 + '">' + lg.get("IDS_SMART_AVD") + '</option>';
			}
		}else{
			if (!isObject(analyseAbilityV2All[nIndex])) return;
			if (analyseAbilityV2All[nIndex].IntelPEA > 0){
				dataHtml += '<option value="' + 0 + '">' + lg.get("IDS_SMART_PEA") + '</option>';
			}
			if (analyseAbilityV2All[nIndex].IntelOSC > 0){
				dataHtml += '<option value="' + 1 + '">' + lg.get("IDS_SMART_OSC") + '</option>';
			}
			if (analyseAbilityV2All[nIndex].IntelAVD > 0){
				dataHtml += '<option value="' + 2 + '">' + lg.get("IDS_SMART_AVD") + '</option>';
			}
		}

		if (GetFunAbility(gDevice.Ability.OtherFunction.SupportBallCameraTrackDetect)){
			dataHtml += '<option value="' + 4 + '">' + lg.get("IDS_SMART_CRUISETRACK") + '</option>';
		}
		
		$("#Arithmetic").append(dataHtml);
	}
	function ShowData(nIndex){
		ShowModuleType(nIndex);
		if (nIndex < gDevice.loginRsp.VideoInChannel || bIPC){//模拟通道、IPC
			$("#LinkSetDiv, #TraceSwitchDiv, #RuleSwitchDiv").css("display", "");
			var cfg = AnalyseCfg[nIndex][AnalyseCfg[nIndex].Name];
			$("#Arithmetic").val(cfg.ModuleType);

			if (MODULE_TYPE.PEA == cfg.ModuleType){
				$("#TraceSwitch").attr("data", cfg.RuleConfig.PEARule.ShowTrack);
				$("#RuleSwitch").attr("data", cfg.RuleConfig.PEARule.ShowRule);
			}else if (MODULE_TYPE.OSC == cfg.ModuleType){			
				$("#TraceSwitch").attr("data", cfg.RuleConfig.OSCRule.ShowTrack);
				$("#RuleSwitch").attr("data", cfg.RuleConfig.OSCRule.ShowRule);
			}else if (MODULE_TYPE.AVD == cfg.ModuleType){
				$("#TraceSwitchDiv, #RuleSwitchDiv").css("display", "none");
			}else if (4 == cfg.ModuleType){
				$("#LinkSetDiv, #RuleSwitchDiv").css("display", "none");
				$("#TraceSwitch").attr("data", cfg.RuleConfig.BCTRule.ShowTrack);	
			}

			$("#IntelSwitch").attr("data", cfg.Enable?0:1);
			$("#IntelSwitch").click();			
		}else if(nIndex >= gDevice.loginRsp.VideoInChannel){
			$("#LinkSetDiv, #TraceSwitchDiv, #RuleSwitchDiv").css("display", "");
			var cfg = AnalyseDig[nIndex];
			$("#Arithmetic").val(cfg.Pub.ModuleType);
			if (MODULE_TYPE.PEA == cfg.Pub.ModuleType){
				$("#TraceSwitch").attr("data", cfg.PEARule.ShowTrack);
				$("#RuleSwitch").attr("data", cfg.PEARule.ShowRule);
			}else if (MODULE_TYPE.OSC == cfg.Pub.ModuleType){			
				$("#TraceSwitch").attr("data", cfg.OSCRule.ShowTrack);
				$("#RuleSwitch").attr("data", cfg.OSCRule.ShowRule);
			}else if (MODULE_TYPE.AVD == cfg.Pub.ModuleType){
				$("#TraceSwitchDiv, #RuleSwitchDiv").css("display", "none");
			}else{
				$("#RuleSwitchDiv").css("display", "none");
			}
			$("#IntelSwitch").attr("data", cfg.Pub.Enable?0:1);
			$("#IntelSwitch").click();
		}
		InitButton2();
	}
	function GetDigAnalyzeCfg(nIndex, nType){
		if(!bGetDig[nIndex]){
			if(nType < 4){
				// 0:Pub  1：PEA  2:OSC  3:AVD
				if(nType == 0 
					|| nType == 1 && analyseAbilityV2All[nIndex].IntelPEA > 0
					|| nType == 2 && analyseAbilityV2All[nIndex].IntelOSC > 0
					|| nType == 3 && analyseAbilityV2All[nIndex].IntelAVD > 0)
				{
					var req = {"Name":"OPIntellInfo","OPIntellInfo":{"Channel" : nIndex, "IntellType" : nType} };
					RfParamCall(function(a){
						AnalyseDig[nIndex][digType[nType]] = a;
						GetDigAnalyzeCfg(nIndex, nType + 1);
					}, pageTitle, "OPIntellInfo", -1, WSMsgID.WSMsgID_GET_INTELL_INFO_REQ, req);
				}
				else
				{
					GetDigAnalyzeCfg(nIndex, nType + 1);
				}
			}else{
				bGetDig[nIndex] = true;
				ShowData(nIndex);
				MasklayerHide();
			}
		}else{
			ShowData(nIndex);
		}
	}
	function GetAnalyzeCfg(nIndex){
		if(!bGet[nIndex]){
			RfParamCall(function(a){
				AnalyseCfg[nIndex] = a;
				var timeSection = AnalyseCfg[nIndex][AnalyseCfg[nIndex].Name].EventHandler.TimeSection;
				for(var i = 0; i < timeSection.length; i++){
					if(isObject(timeSection[i])){
						for(var j = 0; j < timeSection[i].length ; j++){
							if(timeSection[i][j] == ""){
								timeSection[i][j] = "0 00:00:00-00:00:00";
							}
						}
					}
				}
				AnalyseCfg[nIndex][AnalyseCfg[nIndex].Name].EventHandler.TimeSection = timeSection;
				bGet[nIndex] = true;
				if(nIndex >= gDevice.loginRsp.VideoInChannel){
					AnalyseDig[nIndex] = {};
					GetDigAnalyzeCfg(nIndex, 0);
				}else{
					ShowData(nIndex);
					MasklayerHide();
				}
			}, pageTitle, "Detect.Analyze", nIndex, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			ShowData(nIndex);
		}
	}
	function FillChannel(){
		$("#IntelligentCh").empty();
		var dataHtml = '';
		var iChannelFirst = -1;		//记录第一个有算法规则的通道
		var bFirst = true;		
		for (var i = 0; i < gDevice.loginRsp.ChannelNum; i++){
			//主要该通道有一个有算法规则就显示
			if(i < gDevice.loginRsp.VideoInChannel){ 
				if((ExtractMask(analyseAbility.IntelAVD, i)
				|| ExtractMask(analyseAbility.IntelOSC, i)
				|| ExtractMask(analyseAbility.IntelPEA, i)) && GetFunAbility(gDevice.Ability.AlarmFunction.NewVideoAnalyze)){
					dataHtml += '<option value="' + i + '">' + gDevice.getChannelName(i) + '</option>';
					if (bFirst){
						iChannelFirst = i;
						bFirst = false;
					}
				}
			}else{
				if(!isObject(analyseAbilityV2All[i])) continue;
				if ((analyseAbilityV2All[i].IntelPEA > 0
					|| analyseAbilityV2All[i].IntelOSC > 0
					|| analyseAbilityV2All[i].IntelAVD > 0) && GetFunAbility(gDevice.Ability.AlarmFunction.NewVideoAnalyze_digit))
				{
					dataHtml += '<option value="' + i + '">' + gDevice.getChannelName(i) + '</option>';
					if (bFirst){
						iChannelFirst = i;
						bFirst = false;
					}
				}
			}
		}
		$("#IntelligentCh").append(dataHtml);
		if (iChannelFirst >= 0){
			chnIndex = iChannelFirst;
			$("#IntelligentCh").val(iChannelFirst);
			GetAnalyzeCfg(chnIndex);
		}else {
			$("#IntelligentPage").css("display", "none");
			MasklayerHide();
			ShowPaop(pageTitle, lg.get("IDS_NET_TIP_OTHER"));
		}
	}
	function GetDigitAbility(nIndex){
		if(nIndex < digitalCh.length){
			var chn = digitalCh[nIndex];	
			req = {"Name" : "OPIntellAbilty","OPIntellAbilty":{"Channel" : chn}  };
			RfParamCall(function(a){
				analyseAbilityV2All[chn] = a;
				GetDigitAbility(nIndex + 1);
			}, pageTitle, "OPIntellAbilty", -1, WSMsgID.WSMsgID_GET_INTELL_ABILITY, req);
		}else{			
			FillChannel();
		}
	}
	function GetAbility(){
		RfParamCall(function(a){
			analyseAbility = a[a.Name];
			if(digitalCh.length > 0){
				GetDigitAbility(0);
			}else{
				FillChannel();
			}
		}, pageTitle, "Intelligent", -1, WSMsgID.WsMsgID_ABILITY_GET);
	}
	function InitChannel() {
		for(var i = 0; i < gDevice.loginRsp.ChannelNum; i++){
			bGet[i] = false;
			bGetDig[i] = false;
			AnalyseCfg[i] = null;
			AnalyseDig[i] = null;
			analyseAbilityV2All[i] = null;
		}
		digitalCh = [];
		if(gDevice.loginRsp.DigChannel > 0 && !bIPC && GetFunAbility(gDevice.Ability.AlarmFunction.NewVideoAnalyze_digit)){
			var ssDigitChStatus;
			RfParamCall(function(a){
				ssDigitChStatus = a[a.Name];
				RfParamCall(function(b){
					ssRemoteDevice = b[b.Name];
					for (var i = gDevice.loginRsp.VideoInChannel; i < gDevice.loginRsp.ChannelNum; i++) {
						var m = i - gDevice.loginRsp.VideoInChannel;
						if (ssDigitChStatus[m].Status == "Connected"){
							var nIndex = ssRemoteDevice[m].SingleConnId - 1;//配置的第几个
							if (ssRemoteDevice[m].ConnType == "SINGLE" && nIndex >= 0
								&& ssRemoteDevice[m].Decoder[nIndex].Protocol == "TCP"){
								digitalCh.push(i);
							}
						}
					}
					if(gDevice.loginRsp.VideoInChannel > 0){
						GetAbility();
					}else if(digitalCh.length > 0){
						GetDigitAbility(0)
					}else{
						ShowChildConfigFrame(pageTitle, false,false);
						MasklayerHide();
						ShowPaop(pageTitle,lg.get("IDS_CHSTA_NoConfig"));
					}			
				}, pageTitle, "NetWork.RemoteDeviceV3", -1, WSMsgID.WsMsgID_CONFIG_GET);
			}, pageTitle, "NetWork.ChnStatus", -1, WSMsgID.WsMsgID_CONFIG_GET);		
		}else{
			GetAbility();
		}
    }
	function FillAlarmType(){
		GetLocalVoiceTipType("Detect.Analyze", function(){
			InitChannel();
		});
	}
	function CHOSDSaveSel(nIndex) {
		if (nIndex < gDevice.loginRsp.VideoInChannel || bIPC){//模拟通道、IPC
			var cfg = AnalyseCfg[nIndex][AnalyseCfg[nIndex].Name];
			cfg.Enable = $("#IntelSwitch").attr("data") * 1 ? true : false;
			cfg.ModuleType = $("#Arithmetic").val() * 1;

			if (MODULE_TYPE.PEA == cfg.ModuleType){
				cfg.RuleConfig.PEARule.ShowTrack = $("#TraceSwitch").attr("data") * 1 ? 1 : 0;
				cfg.RuleConfig.PEARule.ShowRule = $("#RuleSwitch").attr("data") * 1 ? 1 : 0;
			}else if (MODULE_TYPE.OSC == cfg.ModuleType){			
				cfg.RuleConfig.OSCRule.ShowTrack = $("#TraceSwitch").attr("data") * 1 ? 1 : 0;
				cfg.RuleConfig.OSCRule.ShowRule = $("#RuleSwitch").attr("data") * 1 ? 1 : 0;
			}else if (4 == cfg.ModuleType){
				cfg.RuleConfig.BCTRule.ShowTrack = $("#TraceSwitch").attr("data") * 1 ? 1 : 0;	
			}			
		}else if (nIndex >= gDevice.loginRsp.VideoInChannel){
			var cfg = AnalyseDig[nIndex];
			cfg.Pub.Enable = $("#IntelSwitch").attr("data") * 1 ? true : false;
			cfg.Pub.ModuleType = $("#Arithmetic").val() * 1;

			if (MODULE_TYPE.PEA == cfg.Pub.ModuleType && isObject(cfg.PEARule)){
				cfg.PEARule.ShowTrack = $("#TraceSwitch").attr("data") * 1 ? 1 : 0;
				cfg.PEARule.ShowRule = $("#RuleSwitch").attr("data") * 1 ? 1 : 0;
			}else if (MODULE_TYPE.OSC == cfg.Pub.ModuleType && isObject(cfg.OSCRule)){			
				cfg.OSCRule.ShowTrack = $("#TraceSwitch").attr("data") * 1 ? 1 : 0;
				cfg.OSCRule.ShowRule = $("#RuleSwitch").attr("data") * 1 ? 1 : 0;
			}
		}
    }
	function SaveAnalyseDig(nIndex, nType){
		if(nIndex < gDevice.loginRsp.ChannelNum){
			if(bGetDig[nIndex]){
				if(nType < 4){
					var fname = digType[nType];
					if(isObject(AnalyseDig[nIndex][fname]))
					{
						var CfgData = {
							"Name": "IntellAllInfo",
							"Channel": nIndex,
							"Data": AnalyseDig[nIndex][fname],
							"IntellType": nType
						}
						
						RfParamCall(function (a){
							if (a.Ret == 603) {
								bReboot = true;
							}
							SaveAnalyseDig(nIndex, nType + 1);
						}, pageTitle, "OPIntellInfo", -1, WSMsgID.WSMsgID_SET_INTELL_ALL_INFO_REQ, CfgData);
					}
					else
					{
						SaveAnalyseDig(nIndex, nType + 1);
					}
				}else{
					SaveAnalyseDig(nIndex + 1, 0);
				}
			}else{
				SaveAnalyseDig(nIndex + 1, 0);
			}
		}else{
			if(!bReboot){
				ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
			}else{
				RebootDev(pageTitle, lg.get("IDS_CONFIRM_RESTART"), true);
			}
		}
	}
	function SaveAnalyseCfg(nIndex){
		if(nIndex < gDevice.loginRsp.ChannelNum){
			if(bGet[nIndex]){
				var CfgData;
				var fname = "Detect.Analyze.[" + nIndex +"]";
				CfgData = AnalyseCfg[nIndex];
				RfParamCall(function (a){
					if (a.Ret == 603) {
						bReboot = true;
					}
					SaveAnalyseCfg(nIndex + 1);
				}, pageTitle, fname, -1, WSMsgID.WsMsgID_CONFIG_SET, CfgData);
			}else{
				SaveAnalyseCfg(nIndex + 1);
			}
		}else{
			if(gDevice.loginRsp.DigChannel > 0 && !bIPC){
				SaveAnalyseDig(gDevice.loginRsp.VideoInChannel, 0);
			}else{
				if(!bReboot){
					ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
				}else{
					RebootDev(pageTitle, lg.get("IDS_CONFIRM_RESTART"), true);
				}
			}
		}
	}
	function ShowAVDRuleSet(cfg){
		MasklayerShow(1);
		var AVDHtml = 
		'	<div class="cfg_row" id="AVDSensitivityDiv">\n' +
		'		<div class="cfg_row_left" id="AVDSensitivityL">Sensitivity</div>\n' +
		'		<div class="cfg_row_right">\n' +
		'			<select class="select" id="AVDSensitivity" style="width: 150px"></select>\n' +
		'		</div>\n' +
		'	</div>\n' +
			
		'	<div class="check-btn-box" id="AVD_enableBox" style="margin-top:15px">\n' +
		'		<span id="AVD_ChangeBox">\n' +
		'			<input id="AVDChange" type="checkbox"/>\n' +
		'			<label for="AVDChange" id="AVD_ChangeL">Scene change detection</label>\n' +
		'		</span>\n' +
		'	</div>\n' +

		'	<div class="btn_box" style="padding-left:125px;">\n' +
		'		<button type="button" class="btn" id="AVD_OK">OK</button>\n' +
		'		<button type="button" class="btn btn_cancle" id="AVD_cancle">Cancel</button>\n' +
		'	</div>\n';
		$("#Config_dialog .content_container").html(AVDHtml);
		Config_Title.innerHTML = lg.get("IDS_SMART_AVD");
		SetWndTop("#Config_dialog", 60);						
		$("#Config_dialog").css("width", '550px');
		lan("AVD_dialog");
		$("#Config_dialog").show(function(){
			$("#AVDSensitivity").empty();
			for(var j = 5; j >= 3; j--){
				var level = lg.get("IDS_SSV_" + (j - 1));
				$("#AVDSensitivity").append('<option value="' + j + '">' + level + '</option>');
			}
			$("#AVDSensitivity").val(cfg.Level);
			$("#AVDChange").prop("checked", cfg.ChangeEnable ? true: false);
			
			$("#AVD_OK").click(function(){
				cfg.Level = $("#AVDSensitivity").val() * 1;
				cfg.ChangeEnable = $("#AVDChange").prop("checked") ? 1: 0;
				closeDialog();
			});
		});
	}
    $(function () {
		ChangeBtnState2();
		$("#IntelSwitch").click(function () {
			var j = $(this).attr("data") * 1;
			DivBox(j, "#Intel_Content_div");
		});
		$("#IntelligentCh").change(function () {
			var nSel  = $("#IntelligentCh").val() * 1;
			CHOSDSaveSel(chnIndex);
			if(nSel >= 0){
				GetAnalyzeCfg(nSel);
				chnIndex = nSel;
			}
		});
		$("#IntelligentSV").click(function () {
			var nChn = $("#IntelligentCh").val() * 1;
			CHOSDSaveSel(nChn);
			bReboot = false;
			SaveAnalyseCfg(0);
		});
		$("#IntelligentRf").click(function () {
			FillAlarmType();
		});
		$("#Arithmetic").change(function(){
			var nChn = $("#IntelligentCh").val() * 1;
			var Mode = $(this).val() * 1;
			var cfg = AnalyseCfg[nChn][AnalyseCfg[nChn].Name].RuleConfig;
			$("#LinkSetDiv, #TraceSwitchDiv, #RuleSwitchDiv").css("display", "");
			if (MODULE_TYPE.PEA == Mode){
				$("#TraceSwitch").attr("data", cfg.PEARule.ShowTrack);
				$("#RuleSwitch").attr("data", cfg.PEARule.ShowRule);
			}else if (MODULE_TYPE.OSC == Mode){
				$("#TraceSwitch").attr("data", cfg.OSCRule.ShowTrack);
				$("#RuleSwitch").attr("data", cfg.OSCRule.ShowRule);
			}else if (MODULE_TYPE.AVD == Mode) {
				$("#TraceSwitchDiv, #RuleSwitchDiv").css("display", "none");
			}else if (4 == Mode){
				$("#LinkSetDiv, #RuleSwitchDiv").css("display", "none");
				$("#TraceSwitch").attr("data", cfg.BCTRule.ShowTrack);
			}
			InitButton2();
		});
		$("#RuleSet").click(function(){
			var nChn = $("#IntelligentCh").val() * 1;
			var nType = $("#Arithmetic").val() * 1;
			switch(nType){
			case MODULE_TYPE.PEA: {
					var cfg;
					if (nChn < gDevice.loginRsp.VideoInChannel || bIPC){
						cfg = AnalyseCfg[nChn][AnalyseCfg[nChn].Name].RuleConfig.PEARule;
					}else if (nChn >= gDevice.loginRsp.VideoInChannel){
						cfg = AnalyseDig[nChn].PEARule;
					}
					MasklayerShow();
					var _parent = "#Config_dialog .content_container";
					gVar.LoadChildConfigPage("PEA_Zone", "", _parent, function(){
						Config_Title.innerHTML = lg.get("IDS_SMART_PEA");
						lan("PEA_Zone");
						SetWndTop("#Config_dialog");						
						$("#Config_dialog").css("width", '650px');
						function showPic(imgUrl){
							MasklayerShow(1);
							if(imgUrl == ""){
								$("#PEA_Img").css("display", "none");
							}else{
								$("#PEA_Img").attr("src", imgUrl);
								$("#PEA_Img").css("display", "");
							}
							$("#Config_dialog").show(500);
							PEAZoneObj = new PEAZone({
								nChannel: nChn,
								PEARuleCfg: cfg
							});
						}
						gDevice.ParamCapture(nChn, function(a){
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
				}
				break;
			case MODULE_TYPE.OSC: {
					var cfg;
					if (nChn < gDevice.loginRsp.VideoInChannel || bIPC){
						cfg = AnalyseCfg[nChn][AnalyseCfg[nChn].Name].RuleConfig.OSCRule;
					}else if (nChn >= gDevice.loginRsp.VideoInChannel){
						cfg = AnalyseDig[nChn].OSCRule;
					}
					MasklayerShow();
					var _parent = "#Config_dialog .content_container";
					gVar.LoadChildConfigPage("OSC_Zone", "", _parent, function(){
						Config_Title.innerHTML = lg.get("IDS_SMART_OSC");
						lan("OSC_Zone");
						SetWndTop("#Config_dialog");
						$("#Config_dialog").css("width", '650px');
						function showPic(imgUrl){
							if(imgUrl == ""){
								$("#OSC_Img").css("display", "none");
							}else{
								$("#OSC_Img").attr("src", imgUrl);
								$("#OSC_Img").css("display", "");
							}
							$("#Config_dialog").show(500);
							OSCZoneObj = new OSCZone({
								nChannel: nChn,
								OSCRuleCfg: cfg
							});
						}
						gDevice.ParamCapture(nChn, function(a){
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
				}
				break;
			case MODULE_TYPE.AVD: {
					var cfg;
					if (nChn < gDevice.loginRsp.VideoInChannel || bIPC){
						cfg = AnalyseCfg[nChn][AnalyseCfg[nChn].Name].RuleConfig.AVDRule;
					}else if (nChn >= gDevice.loginRsp.VideoInChannel){
						cfg = AnalyseDig[nChn].AVDRule;
					}
					ShowAVDRuleSet(cfg);
				}
			}
		});
		$("#LinkSet").click(function() {
			var cfg = AnalyseCfg[chnIndex][AnalyseCfg[chnIndex].Name].EventHandler;
			MasklayerShow(1);
			var _parent = "#Config_dialog .content_container";
			gVar.LoadChildConfigPage("Alarm_PID", "", _parent, function(){
				Config_Title.innerHTML = lg.get("IDS_CA_RULELINK");
				lan("Alarm_PID");
				SetWndTop("#Config_dialog", 60);
				$("#Config_dialog").css("width", '815px');
				$("#Config_dialog").show(500);
				SetEventHandler(cfg, chnIndex, pageTitle);		
			});
		});
		FillAlarmType();
    });
});