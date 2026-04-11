$(function(){
	var ResumePTZState;
	var PTZCfg;
	var PTZProtocol;
	var RS485Cfg;
	var	RS485Protocol;
	var PTZMode;
	var IdleState;
	var ChnIndex = -1;
	var bHasPtzCtrlMode = false;
	var bShowPTZState = GetFunAbility(gDevice.Ability.OtherFunction.SupportResumePtzState);
	var bEnableIdleState = false;//GetFunAbility(gDevice.Ability.OtherFunction.SupportPtzIdleState);
	var parityArr = ["None", "Odd", "Even", "Mark", "Space"];
	var pageTitle = $("#System_PTZ").text();
	if(gDevice.devType == devTypeEnum.DEV_IPC){
		$("#PTZChn_div").css("display", "none");
	}
	function ShowCurData(nIndex) {
		if (nIndex < 0) {
			return;
		}
		if (bHasPtzCtrlMode && gDevice.devType != devTypeEnum.DEV_IPC) {
			var ctrlMode = PTZMode[PTZMode.Name];
			$("#SelMode").val(ctrlMode[nIndex].PTZCtrlMode);
		}
		var Cfg = PTZCfg[PTZCfg.Name][nIndex];
		var PTZPro = PTZProtocol[PTZProtocol.Name];
		var i = 0;
		for (i = 0; i < PTZPro.length; i++) {
			if (Cfg.ProtocolName == PTZPro[i]) {
				$("#SelProtocol").val(i);
				break;
			}
		}
		$("#InputAddress").val(Cfg.DeviceNo);
		$("#SelBaudrate").val(Cfg.Attribute[0]);
		for(i = 0; i < parityArr.length; i++){
			if(parityArr[i] == Cfg.Attribute[1]) {
				$("#SelParity").val(i);
				break;
			} 
		}
		$("#SelDataBit").val(Cfg.Attribute[2]);
		$("#SelStopBit").val(Cfg.Attribute[3]);
	}
	function ShowData() {
		if (gDevice.loginRsp.VideoInChannel == 0) {
			$("#PTZTitle").css("display", "none");
			$("#PTZChn_div").css("display", "none");
			$("#table_control_mode").css("display", "none");
			$("#SelProtocol").css("display", "none");
			$("#InputAddress").css("display", "none");
			$("#SelBaudrate").css("display", "none");
			$("#SelDataBit").css("display", "none");
			$("#SelStopBit").css("display", "none");
			$("#SelParity").css("display", "none");
		}
		var RSCfg = RS485Cfg[RS485Cfg.Name][0];
		var RS485Pro = RS485Protocol[RS485Protocol.Name];
		
		$("#SelChannel").val(ChnIndex);
		var i = 0;
		for (i = 0; i < RS485Pro.length; i++) {
			if (RSCfg.ProtocolName == RS485Pro[i]) {
				$("#SelProtocolRS").val(i);
				break;
			}
		}
		$("#InputAddressRS").val(RSCfg.DeviceNo);
		$("#SelBaudrateRS").val(RSCfg.Attribute[0]);
		for(i = 0; i < parityArr.length; i++){
			if(parityArr[i] == RSCfg.Attribute[1]) {
				$("#SelParityRS").val(i);
				break;
			} 
		}
		$("#SelDataBitRS").val(RSCfg.Attribute[2]);
		$("#SelStopBitRS").val(RSCfg.Attribute[3]);
		
		if (bShowPTZState) {		//获取云台的预置点或点间巡航的配置
			var cfg = ResumePTZState[ResumePTZState.Name].PtzState[0];
			if (cfg.PresetState.Enable || cfg.TourState.Running || cfg.PoweroffState.Enable) {
				$("#SwitchPowerBoot").removeClass("selectDisable").addClass("selectEnable").attr("data", "1");
				if (cfg.PoweroffState.Enable) {
					$("#SelState").val(0);
					UpdateStateID(0);
					var nTemp = cfg.PoweroffState.PresetID - 21;
					nTemp = nTemp < 0 ? 0 : nTemp;
					$("#SelStateID").val(nTemp);
				}
				if (cfg.PresetState.Enable) {
					$("#SelState").val(1);
					UpdateStateID(1);
					var nTemp = cfg.PresetState.PresetID - 1;
					nTemp = nTemp < 0 ? 0 : nTemp;
					$("#SelStateID").val(nTemp);
				}
				if (cfg.TourState.Running) {
					$("#SelState").val(2);
					UpdateStateID(2);
					var nTemp = cfg.TourState.LineID - 1;
					nTemp = nTemp < 0 ? 0 : nTemp;
					$("#SelStateID").val(nTemp);
				}
			}else {
				$("#SwitchPowerBoot").removeClass("selectEnable").addClass("selectDisable").attr("data", "0");
				$("#SelState").val(0);
				UpdateStateID(0);
				$("#SelStateID").val(0);
			}
			DivBox_Net("#SwitchPowerBoot", "#selStateBox");
		}
		
		var nChannel = ChnIndex == gDevice.loginRsp.VideoInChannel ? 0 : ChnIndex;
		ShowCurData(nChannel);
		MasklayerHide();
	}
	function UpdateProtocol() {
		var PTZPro = PTZProtocol[PTZProtocol.Name];
		var RS485Pro = RS485Protocol[RS485Protocol.Name];
		$("#SelProtocol, #SelProtocolRS").empty();
		var i = 0;
		for (i = 0; i < PTZPro.length; i++) {
			$("#SelProtocol").append('<option value="'+i+'">'+ PTZPro[i] +'</option>');
		}
		for (i = 0; i < RS485Pro.length; i++) {
			$("#SelProtocolRS").append('<option value="'+i+'">'+ RS485Pro[i] +'</option>');
		}
	}
	function GetProtocolCfg() {
		RfParamCall(function(a){
			PTZProtocol = a;
			RfParamCall(function(a){
				RS485Protocol = a;
				UpdateProtocol();
				ShowData();
			}, pageTitle, "UartProtocol", -1, WSMsgID.WsMsgID_ABILITY_GET);
		}, pageTitle, "PTZProtocol", -1, WSMsgID.WsMsgID_ABILITY_GET);
	}
	function GetRS485Cfg() {
		RfParamCall(function(a){
			RS485Cfg = a;
			GetProtocolCfg();
		}, pageTitle, "Uart.RS485", -1, WSMsgID.WsMsgID_CONFIG_GET);
	}
	function GetPTZCtrlMode() {
		bHasPtzCtrlMode = false;
		var BuildTime = gDevice.loginRsp.BuildTime;
		var BuildDate = BuildTime.split(" ")[0];
		var nYear = BuildDate.split("-")[0] *1;
		var nMonth = BuildDate.split("-")[1] *1;
		var nDay = BuildDate.split("-")[2] *1;
		if ((nYear*10000 + nMonth*100 + nDay) > (2016*10000+5*100+19) && gDevice.devType != devTypeEnum.DEV_IPC) {
			bHasPtzCtrlMode = true;
		}
		if (bHasPtzCtrlMode && gDevice.devType != devTypeEnum.DEV_IPC) {
			RfParamCall(function(a,b){
				PTZMode = a;
				$("#table_control_mode").css("display", "");
				GetRS485Cfg();
			}, pageTitle, "PTZCtrlMode", -1, WSMsgID.WsMsgID_CONFIG_GET);
		}else {
			$("#table_control_mode").css("display", "none");
			GetRS485Cfg();
		}
	}
	function GetPTZCfg() {
		if (gDevice.loginRsp.VideoInChannel) {
			ChnIndex = 0;
			RfParamCall(function(a){
				PTZCfg = a;
				GetPTZCtrlMode();
			}, pageTitle, "Uart.PTZ", -1, WSMsgID.WsMsgID_CONFIG_GET);
		}else {
			ChnIndex = -1;
			GetPTZCtrlMode();
		}
	}
	function LoadConfig() {
		if (bShowPTZState) {
			RfParamCall(function (a) {
				ResumePTZState = a;
					var cfg = ResumePTZState[ResumePTZState.Name].PtzState[0];
					if (!isObject(cfg.PoweroffState)) {
						cfg.PoweroffState = {};
						cfg.PoweroffState.Enable=false;
						cfg.PoweroffState.PresetID=0;
					}
				GetPTZCfg();
			}, pageTitle, "General.ResumePtzState", -1, WSMsgID.WsMsgID_CONFIG_GET);
		} else {
			GetPTZCfg();
		}
	}
	function SaveResumePtzState(){
		if (bShowPTZState) {
			RfParamCall(function(a){
				ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
			}, pageTitle, "General.ResumePtzState", -1, WSMsgID.WsMsgID_CONFIG_SET, ResumePTZState);
		}else {
			ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
		}
	}
	function SaveRS485(){
		RfParamCall(function(a){
			SaveResumePtzState();
		}, pageTitle, "Uart.RS485", -1, WSMsgID.WsMsgID_CONFIG_SET, RS485Cfg);
	}
	function SavePTZCtrlMode(){
		if (bHasPtzCtrlMode && gDevice.devType != devTypeEnum.DEV_IPC) {
			RfParamCall(function(a){
				SaveRS485();
			}, pageTitle, "PTZCtrlMode", -1, WSMsgID.WsMsgID_CONFIG_SET, PTZMode);
		}else {
			SaveRS485();
		}
	}
	function SaveConfig() {
		if (gDevice.loginRsp.VideoInChannel > 0) {
			RfParamCall(function(a){
				SavePTZCtrlMode();
			}, pageTitle, "Uart.PTZ", -1, WSMsgID.WsMsgID_CONFIG_SET, PTZCfg);
		}else {
			SavePTZCtrlMode();
		}
	}
	function UpdateStateID(index) {
		$("#SelStateID").empty();
		var nMax = 0;
		nTemp = -1;
		if (index == 0) {
			nMax = 100;
			nTemp = 21;
		}else if (index == 1) {
			nMax = 64;
			nTemp = 1;
		}else if (index == 2) {
			nMax = 4;
			nTemp = 1;
		}
		for (var i=0; i < nMax; i++) {
			var nVal = i + nTemp;
			$("#SelStateID").append('<option value="'+i+'">'+nVal+'</option>');
		}
	}
	function SaveCurData(nIndex) {
		if (nIndex < 0) {
			return;
		}
		var Cfg = PTZCfg[PTZCfg.Name][nIndex];
		var PTZPro = PTZProtocol[PTZProtocol.Name];
		Cfg.ProtocolName = PTZPro[$("#SelProtocol").val() *1];
		Cfg.DeviceNo = $("#InputAddress").val() *1;
		Cfg.Attribute[0] = $("#SelBaudrate").val() *1;
		Cfg.Attribute[1] = parityArr[$("#SelParity").val() *1];
		Cfg.Attribute[2] = $("#SelDataBit").val() *1;
		Cfg.Attribute[3] = $("#SelStopBit").val() *1;
		
		if (bHasPtzCtrlMode && gDevice.devType != devTypeEnum.DEV_IPC) {
			var ctrlMode = PTZMode[PTZMode.Name][nIndex];
			ctrlMode.PTZCtrlMode = $("#SelMode").val() *1;
		}
	}
	function SaveData() {
		if (bShowPTZState) {
			var cfg = ResumePTZState[ResumePTZState.Name].PtzState[0];
			var nState = $("#SelState").val() *1;
			var bEnable = $("#SwitchPowerBoot").attr("data") == "1" ? true : false;
			if (bEnable) {
				if (nState == 0) {
					if (cfg.TourState.Running) {
						cfg.TourState.Running = false;
						cfg.TourState.LineID = 1;
					}
					if (cfg.PresetState.Enable) {
						cfg.PresetState.Enable = false;
						cfg.PresetState.PresetID = 1
					}
					cfg.PoweroffState.Enable = bEnable;
					cfg.PoweroffState.PresetID = $("#SelStateID").val() *1 + 21;
					ResumePTZState[ResumePTZState.Name].Enable = bEnable;
				}
				if (nState == 1) {
					if (cfg.TourState.Running) {
						cfg.TourState.Running = false;
						cfg.TourState.LineID = 1;
					}
					if (cfg.PoweroffState.Enable) {
						cfg.PoweroffState.Enable = false;
						cfg.PoweroffState.PresetID = 21
					}
					cfg.PresetState.Enable = bEnable;
					cfg.PresetState.PresetID = $("#SelStateID").val() *1 + 1;
					ResumePTZState[ResumePTZState.Name].Enable = bEnable;
					
				}
				if (nState == 2) {
					if (cfg.PoweroffState.Enable) {
						cfg.PoweroffState.Enable = false;
						cfg.PoweroffState.PresetID = 21;
					}
					if (cfg.PresetState.Enable) {
						cfg.PresetState.Enable = false;
						cfg.PresetState.PresetID = 1
					}
					cfg.TourState.Running = bEnable;
					cfg.TourState.LineID = $("#SelStateID").val() *1 + 1;
					ResumePTZState[ResumePTZState.Name].Enable = bEnable;
				}
			}else {
				cfg.PoweroffState.Enable = bEnable;
				cfg.PresetState.Enable = bEnable;
				cfg.TourState.Running = bEnable;
				cfg.PoweroffState.PresetID = 21;
				cfg.PresetState.PresetID = 1;
				cfg.TourState.LineID = 1;
				ResumePTZState[ResumePTZState.Name].Enable = bEnable;
			}
		}
		
		if (gDevice.loginRsp.VideoInChannel > 0) {
			var cfg = PTZCfg[PTZCfg.Name];
			if (ChnIndex == gDevice.loginRsp.VideoInChannel) {
				SaveCurData(0);
				for (var i = 1; i < gDevice.loginRsp.VideoInChannel; i++) {
					cfg[i].ProtocolName = cfg[0].ProtocolName;
					cfg[i].DeviceNo = cfg[0].DeviceNo;
					cfg[i].Attribute[0] = cfg[0].Attribute[0];
					cfg[i].Attribute[1] = cfg[0].Attribute[1];
					cfg[i].Attribute[2] = cfg[0].Attribute[2];
					cfg[i].Attribute[3] = cfg[0].Attribute[3];
				}
			}else {
				SaveCurData(ChnIndex);
			}
		}
		
		var RSCfg = RS485Cfg[RS485Cfg.Name][0];
		var RS485Pro = RS485Protocol[RS485Protocol.Name];
		RSCfg.ProtocolName = RS485Pro[$("#SelProtocolRS").val() *1];
		RSCfg.DeviceNo = $("#InputAddressRS").val() *1;
		RSCfg.Attribute[0] = $("#SelBaudrateRS").val() *1;
		RSCfg.Attribute[1] = parityArr[$("#SelParityRS").val() *1];
		RSCfg.Attribute[2] = $("#SelDataBitRS").val() *1;
		RSCfg.Attribute[3] = $("#SelStopBitRS").val() *1;
	}
	$(function(){
		var i = 0;
		$("#SelChannel").empty();
		for(i = 0; i < gDevice.loginRsp.VideoInChannel; i++) {
			$("#SelChannel").append('<option value="'+i+'">'+(i+1)+'</option>');
		}
		$("#SelChannel").append('<option value="'+gDevice.loginRsp.VideoInChannel+'">'+ lg.get("IDS_PATH_ALL") +'</option>');
		
		$("#SelMode").empty();
		$("#SelMode").append('<option value="0">'+ lg.get("IDS_PTZ_Coaxial") +'</option>');
		$("#SelMode").append('<option value="1">'+ lg.get("IDS_PTZ_RS485") +'</option>');
		$("#SelMode").append('<option value="2">'+ lg.get("IDS_PATH_ALL") +'</option>');
		
		$("#SelParity, #SelParityRS").empty();
		for(i = 0; i < parityArr.length; i++) {
			var tmp = parityArr[i].toUpperCase();
			$("#SelParity, #SelParityRS").append('<option value="'+i+'">'+ lg.get("IDS_PTZ_" + tmp) +'</option>');
		}
		
		if (bShowPTZState) {
			$("#ptz_set_state").css("display", "");
			$("#SelState").empty();
			$("#SelState").append('<option value="0">'+ lg.get("IDS_PTZ_PoweroffState") +'</option>');
			$("#SelState").append('<option value="1">'+ lg.get("IDS_PTZ_PresetState") +'</option>');
			$("#SelState").append('<option value="2">'+ lg.get("IDS_PTZ_TourState") +'</option>');

			$("#SelState").change(function(){
				var nIndex = $(this).val() * 1;
				UpdateStateID(nIndex);
				var number = 0;				
				var cfg = ResumePTZState[ResumePTZState.Name].PtzState[0];
				if (nIndex == 0){
					if (cfg.PoweroffState.Enable){
						number = cfg.PoweroffState.PresetID - 21;
					}else{
						number = 0;
					}
			
					if (number < 0){
						number = 0;
					}
					$("#SelStateID").val(number);
				}
				if (nIndex == 1){
					if (cfg.PresetState.Enable){
						number = cfg.PresetState.PresetID - 1;
					}else{
						number = 0;
					}
					if (number < 0){
						number = 0;
					}
					$("#SelStateID").val(number);
				}
				if (nIndex == 2){
					if (cfg.TourState.Running){
						number = cfg.TourState.LineID - 1;
					}else{
						number = 0;
					}
			
					if (number < 0){
						number = 0;
					}
					$("#SelStateID").val(number);
				}
			});
		}
		$("#SelChannel").change(function(){
			var nSel = $(this).val() *1;
			if (nSel == gDevice.loginRsp.VideoInChannel) {
				ShowCurData(0);
				ChnIndex = nSel;
			}else if (ChnIndex == gDevice.loginRsp.VideoInChannel) {
				ShowCurData(nSel);
				ChnIndex = nSel;
			}else {
				if ( nSel != ChnIndex) {
					SaveCurData(ChnIndex);
					ShowCurData(nSel);
					ChnIndex = nSel;
				}
			}
		});
		$("#SwitchPowerBoot").click(function(){
			if ($(this).attr("data") == "0") {
				$("#SwitchPowerBoot").removeClass("selectDisable").addClass("selectEnable").attr("data", "1");
			}else {
				$("#SwitchPowerBoot").removeClass("selectEnable").addClass("selectDisable").attr("data", "0");
			}
			DivBox_Net("#SwitchPowerBoot", "#selStateBox");
		});
		$("#SwitchIdleState").click(function(){
			
		});
		$("#BtnRefresh").click(function(){
			LoadConfig();
		});
		$("#BtnSave").click(function(){
			SaveData();
			SaveConfig();
		});
		LoadConfig();
	});
});