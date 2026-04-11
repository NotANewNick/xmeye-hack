$(function () {
    var pageTitle = $("#Alarm_Output").text();;
	var AlarmOut;
	var AlarmOutChannel = gDevice.loginRsp.AlarmOutChannel;
	function clkRa(type, num) {
		if (AlarmOutChannel == 1) {
			$("#radioall" + type).click();
		} else {
			var chk = $("#radid" + type + num).prop("checked");
			var i = 1;
			for (i; i <= AlarmOutChannel; i++) {
				if (i == num) continue;
				if ($("#radid" + type + i).prop("checked") != chk) {
					break;
				}
			}
			if (i <= AlarmOutChannel) {
				for (var j = 1; j <= 3; j++) {
					$("#radioall" + j).prop("checked", false);
				}
			} else {
				$("#radioall" + type).prop("checked", true);
			}
		}
	}
	function ShowData(){
		$(".cfg_radio_box input").prop("checked", false);
		RfParamCall(function(a,b){
			AlarmOut = a;
			var arr = [0, 0, 0];
			for (var i = 1; i <= AlarmOutChannel; i++) {
				var num = 1;
				var type = AlarmOut[AlarmOut.Name][i - 1].AlarmOutType;
				if (type == "AUTO") {
					num = 1;
				} else if (type == "MANUAL") {
					num = 2;
				} else if (type == "CLOSE") {
					num = 3;
				}
				arr[num-1] = arr[num-1] + 1;
				$("#radid" + num + i).prop("checked", true);
				var sta = AlarmOut[AlarmOut.Name][i - 1].AlarmOutStatus;
				if (sta == "OPEN") {
					$("#chkStaid" + i).prop("checked", false);
				} else {
					$("#chkStaid" + i).prop("checked", true);
				}
			}
			
			for(var n = 1; n <= 3; n++){
				if(arr[n-1] == AlarmOutChannel){
					$("#radioall" + n).prop("checked", true);
				}
			}
			MasklayerHide();
		}, pageTitle, "Alarm.AlarmOut", -1, WSMsgID.WsMsgID_CONFIG_GET);
	}
	$(function(){
		clkRaCallBack = clkRa;
		for(var k = 0; k < AlarmOutChannel; k++){
			$("<div id='rido" + k + "' class='cfg_radio_box' style='width: 50px !important;'></div>")
				.appendTo($('#AlarmOutDiv'));
			$("<div class='form-group'><label class='spanOne'>" + (k + 1) + "</label></div>")
				.appendTo($("#rido" + k));
			
			$("<div class='form-group'><span class='radioSpan'><input id='radid1" + (k + 1) + "' name='rad" 
			+ (k + 1) +"' value='' type='radio' onclick='clkRaCallBack(1," + (k + 1) + ")'>"
			+ "<label for='' >&nbsp;</label></span></div>").appendTo($("#rido" + k));
			
			$("<div class='form-group'><span class='radioSpan'><input id='radid2" + (k + 1) + "' name='rad" 
			+ (k + 1) +"' value='' type='radio' onclick='clkRaCallBack(2," + (k + 1) + ")'>"
			+ "<label for='' >&nbsp;</label></span></div>").appendTo($("#rido" + k));			
			$("<div class='form-group'><span class='radioSpan'><input id='radid3" + (k + 1) + "' name='rad"
			+ (k + 1) +"' value='' type='radio' onclick='clkRaCallBack(3," + (k + 1) + ")'>"
			+ "<label for='' >&nbsp;</label></span></div>").appendTo($("#rido" + k));			
			$("<div class='form-group'><span class='radioSpan'><input id='chkStaid" + (k + 1) +
			"' name='checkbox_one' type='checkbox' disabled><label for=''> &nbsp;</label></span></div>")
			.appendTo($("#rido" + k));		
		}
		$("#OutRf").click(function (){
			ShowData();
		});
		$("#OutSave").click(function (){
			for (var i = 1; i <= AlarmOutChannel; i++) {
				if ($("#radid1" + i).prop("checked")) {
					AlarmOut[AlarmOut.Name][i - 1].AlarmOutType = "AUTO";
				} else if ($("#radid2" + i).prop("checked")) {
					AlarmOut[AlarmOut.Name][i - 1].AlarmOutType = "MANUAL";
				} else if ($("#radid3" + i).prop("checked")) {
					AlarmOut[AlarmOut.Name][i - 1].AlarmOutType = "CLOSE";
				}
				AlarmOut[AlarmOut.Name][i - 1].AlarmOutStatus = "OPEN";
			}
			RfParamCall(function(a,b){
				ShowPaop(pageTitle,lg.get("IDS_SAVE_SUCCESS"));
			}, pageTitle, "Alarm.AlarmOut", -1, WSMsgID.WsMsgID_CONFIG_SET, AlarmOut);
		});
		$("#radioall1, #radioall2, #radioall3").click(function () {
			var id = $(this).attr("id");
			var num = 1;
			if(id == "radioall1"){
				num = 1;
			}else if(id == "radioall2"){
				num = 2;
			}else if(id == "radioall3"){
				num = 3;
			}
			for (var i = 1; i <= AlarmOutChannel; i++) {
				$("#radid" + num + i).prop("checked", true);
			}
		});
		ShowData();
	});
});
