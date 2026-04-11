//# sourceURL=System_Serial.js
$(function(){
	var ComPro;
	var CommCfg;
	var parityArr = ["None", "Odd", "Even", "Mark", "Space"];
	var pageTitle = $("#System_Serial").text();
	function ShowData() {
		var cfg = CommCfg[CommCfg.Name][0];
		for (var i = 0; i < ComPro.length; i++) {
			if (ComPro[i] == cfg.ProtocolName) {
				$("#SelFunc").val(i);
				break;
			}
		}
		for (var j = 0; j < parityArr.length; j++) {
			if (parityArr[j] == cfg.Attribute[1]) {
				$("#SelParitySerial").val(j);
				break;
			}
		}
		$("#SelBaudrateSerial").val(cfg.Attribute[0]);
		$("#SelDataBitSerial").val(cfg.Attribute[2]);
		$("#SelStopBitSerial").val(cfg.Attribute[3]);
		MasklayerHide();
	}
	function LoadConfig() {
		RfParamCall(function(a){
			ComPro = a[a.Name];
			$("#SelFunc").empty();
			for(var i = 0; i < ComPro.length; i++) {
				$("#SelFunc").append('<option value="'+i+'">'+ ComPro[i] +'</option>');
			}
			RfParamCall(function(a){
				CommCfg = a;
				ShowData();
			}, pageTitle, "Uart.Comm", -1, WSMsgID.WsMsgID_CONFIG_GET);
		}, pageTitle, "ComProtocol", -1, WSMsgID.WsMsgID_ABILITY_GET);
	}
	function SaveData() {
		var cfg = CommCfg[CommCfg.Name][0];
		cfg.ProtocolName = ComPro[$("#SelFunc").val() *1];
		cfg.Attribute[0] = $("#SelBaudrateSerial").val() *1;
		cfg.Attribute[1] = parityArr[$("#SelParitySerial").val() *1];
		cfg.Attribute[2] = $("#SelDataBitSerial").val() *1;
		cfg.Attribute[3] = $("#SelStopBitSerial").val() *1;
		RfParamCall(function(a){
			if (a.Ret == 603) {
				ShowPaop(pageTitle, "Will be Reboot");
			}else {
				ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
			}
		}, pageTitle, "Uart.Comm", -1, WSMsgID.WsMsgID_CONFIG_SET, CommCfg);
	}
	$(function(){
		$("#SelParitySerial").empty();
		for(var i = 0; i < parityArr.length; i++) {
			var tmp = parityArr[i].toUpperCase();
			$("#SelParitySerial").append('<option value="'+i+'">'+ lg.get("IDS_PTZ_" + tmp) +'</option>');
		}
		$("#BtnRefreshSerial").click(function(){
			LoadConfig();
		});
		$("#BtnSaveSerial").click(function(){
			SaveData();
		});
		LoadConfig();
	});
})