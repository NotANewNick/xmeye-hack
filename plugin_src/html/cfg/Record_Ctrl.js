//# sourceURL=Record_Ctrl.js
$(function () {
    var pageTitle = $("#Record_Ctrl").text();;
	var RecordCfg;
	var ExtRecord;
	var ExtAbilityPram = parseInt(gDevice.ExtRecSupport.AbilityPram);
	var nChannelNum = gDevice.loginRsp.ChannelNum;
	var bNextPage = false;
	function clkRa(stream, type, num) {
		var a = "#Main";
		var b = "#MainAll"
		if(stream === 1){
			a = "#Ext";
			b = "#ExtAll";
		}
		if(type === 1){
			a += "Auto";
		}else if(type === 2){
			a += "Manual";
		}else if(type === 3){
			a += "Stop";
		}
		if(ExtAbilityPram == 1){
			if(a.indexOf("Main") >= 0){
				$("#ExtAuto" + num).prop("checked", false);
				$("#ExtManual" + num).prop("checked", false);		
				if($("#ExtAll1").prop("checked")){
					$("#ExtAll1").prop("checked", false);
				}
				if($("#ExtAll2").prop("checked")){
					$("#ExtAll2").prop("checked", false);
				}
				if(a.indexOf("Stop") < 0){
					$("#ExtStop" + num).prop("checked", false);
					if($("#ExtAll3").prop("checked")){
						$("#ExtAll3").prop("checked", false);
					}
				}
			}else{
				$("#MainAuto" + num).prop("checked", false);
				$("#MainManual" + num).prop("checked", false);
				$("#MainStop" + num).prop("checked", true);
				if($("#MainAll1").prop("checked")){
					$("#MainAll1").prop("checked", false);
				}
				if($("#MainAll2").prop("checked")){
					$("#MainAll2").prop("checked", false);
				}
				if($("#MainAll3").prop("checked")){
					$("#MainAll3").prop("checked", false);
				}
			}	
		}
		
		if (nChannelNum == 1) {
			$(b + type).click();
		} else {
			var chk = $(a + num).prop("checked");
			var i = 1;
			for (i; i <= nChannelNum; i++) {
				if (i == num) continue;
				if ($(a + i).prop("checked") != chk) {
					break;
				}
			}
			if (i <= nChannelNum) {
				var c = 3;
				for (var i = 1; i <= c; i++) {
					$(b + i).prop("checked", false);
				}
			} else {
				$(b + type).prop("checked", true);
			}
		}
	}
	function ShowData(){
		$(".cfg_radio_box input").prop("checked", false);
		var arr = [[0, 0, 0]];
		if((ExtAbilityPram == 1 || ExtAbilityPram == 2) && isObject(ExtRecord)){
			arr.push([0, 0, 0]);
		}
		
		for(var i = 1; i <= nChannelNum; i++){
			var a, num;
			var type = RecordCfg[RecordCfg.Name][i - 1].RecordMode;
			if (type == "ConfigRecord") {
				a = "#MainAuto";
				num = 0;
			} else if (type == "ManualRecord") {
				a = "#MainManual";
				num = 1;
				if(GetFunAbility(gDevice.Ability.OtherFunction.NoSupportHandleRecord)){
					a = "#MainAuto";
					num = 0;
				}
			} else if (type == "ClosedRecord") {
				a = "#MainStop";
				num = 2;
			}
			$(a + i).click();
			arr[0][num] = arr[0][num] + 1;
			
			if((ExtAbilityPram == 1 || ExtAbilityPram == 2) && isObject(ExtRecord)){
				var type = ExtRecord[ExtRecord.Name][i - 1].RecordMode;
				if (type == "ConfigRecord") {
					a = "#ExtAuto";
					num = 0;
				} else if (type == "ManualRecord") {
					a = "#ExtManual";
					num = 1;
					if(GetFunAbility(gDevice.Ability.OtherFunction.NoSupportHandleRecord)){
						a = "#ExtAuto";
						num = 0;
					}
				} else if (type == "ClosedRecord") {
					a = "#ExtStop";
					num = 2;	
				}
				if($("#MainStop" + i).prop("checked") || ExtAbilityPram != 1){
					$(a + i).click();
					arr[1][num] = arr[1][num] + 1;
				}
			}
		}
		for(var k = 0; k < arr.length; k++){
			var a = "#MainAll";
			if(k === 1){
				a = "#ExtAll";
			}
			for(var n = 1; n <= 3; n++){
				if(arr[k][n-1] == nChannelNum){
					$(a + n).prop("checked", true);
				}
			}
		}
		MasklayerHide();
	}
	function LoadConfig(){
		RfParamCall(function(a){
			RecordCfg = a;
			if(ExtAbilityPram == 1 || ExtAbilityPram == 2){
				RfParamCall(function(a){
					ExtRecord = a;
					FillDate();
				}, pageTitle, "ExtRecord", -1, WSMsgID.WsMsgID_CONFIG_GET);
			}else{
				FillDate();
			}
		}, pageTitle, "Record", -1, WSMsgID.WsMsgID_CONFIG_GET);
	}
	function FillDate(){
		if(ExtAbilityPram == 1){ //  主辅码流二选一
			$("#Main_StopBox").css("display", "none");
		}else if(ExtAbilityPram == 2){//  主辅码流同时录像
			$("#Main_StopBox").css("display", "");
		}else{
			$("#ExtSplitDiv, #ExtBox").css("display", "none");
		}
		$("#MainRadio_Box, #ExtRadio_Box").empty();
		for(var k = 0; k < nChannelNum; k++){
			$("<div id='ridoM" + k + "' class='cfg_radio_box' style='width: 25px !important;'></div>")
				.appendTo($('#MainRadio_Box'));
			$("<div class='form-group'><label class='spanOne'>" + (k + 1) + "</label></div>")
				.appendTo($("#ridoM" + k));
			$("<div class='form-group'><span class='radioSpan'><input id='MainAuto" + (k + 1) + "' name='main" 
			+ (k + 1) +"' value='' type='radio' onclick='clkRaCallBack(0,1," + (k + 1) + ")'>"
			+ "<label for='' >&nbsp;</label></span></div>").appendTo($("#ridoM" + k));
			
			$("<div class='form-group' id='MainManualGroup"+ (k + 1) +"'><span class='radioSpan'><input id='MainManual" + (k + 1) + "' name='main" 
			+ (k + 1) +"' value='' type='radio' onclick='clkRaCallBack(0,2," + (k + 1) + ")'>"
			+ "<label for='' >&nbsp;</label></span></div>").appendTo($("#ridoM" + k));
			$("<div class='form-group' id='MainStopGroup"+ (k + 1) +"'><span class='radioSpan'><input id='MainStop"
			+ (k + 1) + "' name='main"+ (k + 1) +"' value='' type='radio' onclick='clkRaCallBack(0,3," + (k + 1) + ")'>"
			+ "<label for='' >&nbsp;</label></span></div>").appendTo($("#ridoM" + k));
	
			if(ExtAbilityPram == 1 || ExtAbilityPram == 2){
				$("<div id='ridoExt" + k + "' class='cfg_radio_box' style='width: 25px !important;'></div>")
				.appendTo($('#ExtRadio_Box'));
				$("<div class='form-group'><span class='radioSpan'><input id='ExtAuto" + (k + 1) + "' name='ext" 
				+ (k + 1) +"' value='' type='radio' onclick='clkRaCallBack(1,1," + (k + 1) + ")'>"
				+ "<label for='' >&nbsp;</label></span></div>").appendTo($("#ridoExt" + k));
				
				$("<div class='form-group' id='ExtManualGroup"+ (k + 1) +"'><span class='radioSpan'><input id='ExtManual" + (k + 1) + "' name='ext" 
				+ (k + 1) +"' value='' type='radio' onclick='clkRaCallBack(1,2," + (k + 1) + ")'>"
				+ "<label for='' >&nbsp;</label></span></div>").appendTo($("#ridoExt" + k));		
				$("<div class='form-group'><span class='radioSpan'><input id='ExtStop" + (k + 1) + "' name='ext"
				+ (k + 1) +"' value='' type='radio' onclick='clkRaCallBack(1,3," + (k + 1) + ")'>"
				+ "<label for='' >&nbsp;</label></span></div>").appendTo($("#ridoExt" + k));
			}
		}
		
		bNextPage = false;
		if(gDevice.loginRsp.ChannelNum <= 32){
			$("#RecCtrlNext").css("display", "none");
			PageChannelLayout(0, gDevice.loginRsp.ChannelNum - 1);
		}else{
			$("#RecCtrlNext").css("display", "");
			RecCtrlNext.innerHTML = lg.get("IDS_NEXT_PAGE");
			PageChannelLayout(0, 31);
		}
		if(ExtAbilityPram == 1){
			$("#MainBox").find("div[id^='MainStopGroup']").css("display", "none");
		}else if(ExtAbilityPram == 2){
			$("#MainBox").find("div[id^='MainStopGroup']").css("display", "");
		}
		
		if(GetFunAbility(gDevice.Ability.OtherFunction.NoSupportHandleRecord)){
			$("#Main_ManualBox, #Ext_ManualBox").css("display", "none");
			$("#MainBox").find("div[id^='MainManualGroup']").css("display", "none");
			$("#ExtBox").find("div[id^='ExtManualGroup']").css("display", "none");
		}
		ShowData();
	}
	function PageChannelLayout(bChannel, echannel){
		$("#MainRadio_Box .cfg_radio_box").css("display", "none");
		var jqMainGroup = $("#MainRadio_Box .cfg_radio_box");		
		var jqExtGroup = "";
		if(ExtAbilityPram == 1 || ExtAbilityPram == 2){
			$("#ExtRadio_Box .cfg_radio_box").css("display", "none");
			jqExtGroup = $("#ExtRadio_Box .cfg_radio_box");
		}		
		for (var j = bChannel; j <= echannel; j++) {
			$(jqMainGroup[j]).css("display", "");
			if(ExtAbilityPram == 1 || ExtAbilityPram == 2){
				$(jqExtGroup[j]).css("display", "");
			}
		}
	}
	$(function(){
		$("#RecCtrlRf").click(function (){
			LoadConfig();
		});
		$("#RecCtrlSave").click(function (){
			for (var i = 1; i <= nChannelNum; i++) {
				if(ExtAbilityPram == 1)
				{
					RecordCfg[RecordCfg.Name][i-1].RecordMode = "ClosedRecord";
					ExtRecord[ExtRecord.Name][i-1].RecordMode = "ClosedRecord";
					if($("#MainAuto" + i).prop("checked")){
						RecordCfg[RecordCfg.Name][i-1].RecordMode = "ConfigRecord";
					}else if($("#MainManual" + i).prop("checked")){
						RecordCfg[RecordCfg.Name][i-1].RecordMode = "ManualRecord";
					}else if($("#ExtAuto" + i).prop("checked")){
						ExtRecord[ExtRecord.Name][i-1].RecordMode = "ConfigRecord";
					}else if($("#ExtManual" + i).prop("checked")){
						ExtRecord[ExtRecord.Name][i-1].RecordMode = "ManualRecord";
					}
				}
				else
				{
					if($("#MainAuto" + i).prop("checked")){
						RecordCfg[RecordCfg.Name][i-1].RecordMode = "ConfigRecord";
					}else if($("#MainManual" + i).prop("checked")){
						RecordCfg[RecordCfg.Name][i-1].RecordMode = "ManualRecord";
					}else if($("#MainStop" + i).prop("checked")){
						RecordCfg[RecordCfg.Name][i-1].RecordMode = "ClosedRecord";
					}
					if(ExtAbilityPram == 2){
						if($("#ExtAuto" + i).prop("checked")){
							ExtRecord[ExtRecord.Name][i-1].RecordMode = "ConfigRecord";
						}else if($("#ExtManual" + i).prop("checked")){
							ExtRecord[ExtRecord.Name][i-1].RecordMode = "ManualRecord";
						}else if($("#ExtStop" + i).prop("checked")){
							ExtRecord[ExtRecord.Name][i-1].RecordMode = "ClosedRecord";
						}
					}
				}
			}
			RfParamCall(function(a){
				if(ExtAbilityPram == 2 || ExtAbilityPram == 1){
					RfParamCall(function(a){
						ShowPaop(pageTitle,lg.get("IDS_SAVE_SUCCESS"));
					}, pageTitle, "ExtRecord", -1, WSMsgID.WsMsgID_CONFIG_SET, ExtRecord);
				}else{
					ShowPaop(pageTitle,lg.get("IDS_SAVE_SUCCESS"));
				}
			}, pageTitle, "Record", -1, WSMsgID.WsMsgID_CONFIG_SET, RecordCfg);
		});
		$("input[name='MainAll']").click(function () {
			var id = $(this).attr("id");
			var item;
			if(id == "MainAll1"){
				item = "#MainAuto";
			}else if(id == "MainAll2"){
				item = "#MainManual";
			}else if(id == "MainAll3"){
				item = "#MainStop";
			}
			for (var i = 1; i <= nChannelNum; i++) {
				$(item + i).prop("checked", true);
				if(ExtAbilityPram == 1){
					$("#ExtAuto" + i).prop("checked", false);
					$("#ExtManual" + i).prop("checked", false);
					if($("#ExtAll1").prop("checked")){
						$("#ExtAll1").prop("checked", false);
					}
					if($("#ExtAll2").prop("checked")){
						$("#ExtAll2").prop("checked", false);
					}
					if(id != "MainAll3"){
						$("#ExtStop" + i).prop("checked", false);
						if($("#ExtAll3").prop("checked")){
							$("#ExtAll3").prop("checked", false);
						}
					}
				}
			}
		});
		$("input[name='ExtAll']").click(function () {
			var id = $(this).attr("id");
			var item;
			if(id == "ExtAll1"){
				item = "#ExtAuto";
			}else if(id == "ExtAll2"){
				item = "#ExtManual";
			}else if(id == "ExtAll3"){
				item = "#ExtStop";
			}
			for (var i = 1; i <= nChannelNum; i++) {
				$(item + i).prop("checked", true);
				if(ExtAbilityPram == 1){
					$("#MainAuto" + i).prop("checked", false);
					$("#MainManual" + i).prop("checked", false);
					$("#MainStop" + i).prop("checked", true);
					if($("#MainAll1").prop("checked")){
						$("#MainAll1").prop("checked", false);
					}
					if($("#MainAll2").prop("checked")){
						$("#MainAll2").prop("checked", false);
					}
					if($("#MainAll3").prop("checked")){
						$("#MainAll3").prop("checked", false);
					}
				}
			}
		});
		$("#RecCtrlNext").click(function (){
			if(!bNextPage){
				PageChannelLayout(32, gDevice.loginRsp.ChannelNum - 1);
				RecCtrlNext.innerHTML = lg.get("IDS_PRE_PAGE");
				bNextPage = true;
			}else{
				PageChannelLayout(0, 31);
				RecCtrlNext.innerHTML = lg.get("IDS_NEXT_PAGE");
				bNextPage = false;
			}
		});
		clkRaCallBack = clkRa;
		LoadConfig();
	});
});
