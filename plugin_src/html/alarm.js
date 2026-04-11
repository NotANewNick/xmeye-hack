//# sourceURL=alarm.js
$(function() {
	var rowNum = 0;
	function FillAlarmInfo(aB){
		var type = aB[aB.Name].Event;
		var typeTitle = "";
		var sChannel = gDevice.getChannelName(aB[aB.Name].Channel);
		switch (type){
			case "VideoMotion":
			case "MotionDetect":
				if ($("#Motion_check").prop("checked")){
					typeTitle = "IDS_VIDEO_MOTION";
				} 
				break;
			case "VideoBlind":
			case "BlindDetect":
				if ($("#Blind_check").prop("checked")){
					typeTitle = "IDS_VIDEO_BLIND";
				} 
				break;
			case "VideoLoss":
			case "LossDetect":
				if ($("#Loss_check").prop("checked")){
					typeTitle = "IDS_VIDEO_LOSS";
				} 
				break;
			case "LocalIO": 
			case "LocalAlarm":
			case "NetAlarm":
			case "ManualAlarm":
				if($("#IO_check").prop("checked")) {
					typeTitle = "IDS_IO_TRIGGER";
					sChannel = lg.get("IDS_ALARM_PORT") + ' ' + gDevice.getChannelName(aB[aB.Name].Channel);
				}
				break;
			case "VideoAnalyze":
				if($("#Analyze_check").prop("checked")){
					typeTitle = "IDS_ANALYZE_ALARM";
				}
				break;
			case "HumanDetect":
			case "appEventHumanDetectAlarm": 
				if($("#Human_check").prop("checked")){
					typeTitle = "IDS_HUMAN_DETECT";
				}
				break;
			case "FaceDetectV2":
			case "FaceDetect":
			case "FaceDetection":
				if($("#FaceDetect_check").prop("checked")) {
					typeTitle = "IDS_FACEDETECT_ALARM";
				}
				break;
			case "StorageFailure": 
				if($("#DiskError_check").prop("checked")) {
					typeTitle = "IDS_DISK_ERROR";
				} 
				break;
			case "StorrageLowSpace":
			case "StorageLowSpace":
				if($("#DiskFull_check").prop("checked")) {
					typeTitle = "IDS_DISK_FULL";
				}
				break;
			case "CarShapeDetect":
				if($("#Carshape_check").prop("checked")) {
					typeTitle = "CarShapeDetect";
				}
				break;
			case "FallDown":
			case "HumanFallDown":
				if($("#Falldown_check").prop("checked")) {
					typeTitle = "IDS_FALLDOWN";
				}
				break;
			default:
				typeTitle = "";
				break;
		}

		if(typeTitle === ""){
			return;
		}
		var tr = $("#AlarmTable")[0].insertRow(rowNum++);
		var td1 = tr.insertCell(0);
		td1.innerHTML = rowNum;
		var td2 = tr.insertCell(1);
		td2.innerHTML = getCurTime();
		var td3 = tr.insertCell(2);
		td3.innerHTML = lg.getEx(typeTitle);
		var td4 = tr.insertCell(3);
		td4.innerHTML = sChannel;
		var contentH = $("#AlarmList .table-content").height();
		if(rowNum * 30 > contentH){
			$("#AlarmList .table-head").css("padding-right",  TableRightPadding + "px");
			var n=parseInt(contentH/30);
			var eTable = $("#AlarmList .table-content").get(0);
			var nowPos = eTable.scrollTop;
			var maxPos = eTable.scrollHeight; 
			if(nowPos < maxPos && eTable.scrollTop < maxPos && rowNum > n) {
				eTable.scrollTop = 30*(rowNum-n);
			}
		}

		if(gDevice.AlarmType.alarmtype.Prompt){
			if($("#alarm").attr("data-name") == "active"){
				return;
			}
			var msg = lg.getEx("IDS_ALARM_NEWMESSAGE");
			$(".alarmShowTip").show();
		}else{
			$(".alarmShowTip").hide();
		}
	}
	function SendAlarmTypeChecked(){
		var all=$("#allType").prop("checked");
		var Prompt=$("#Prompt_check").prop("checked");
		var Motion=$("#Motion_check").prop("checked");
		var Blind=$("#Blind_check").prop("checked");
		var Loss=$("#Loss_check").prop("checked");
		var IO=$("#IO_check").prop("checked");
		var Analyze=$("#Analyze_check").prop("checked");
		var Human=$("#Human_check").prop("checked");
		var FaceDetect=$("#FaceDetect_check").prop("checked");
		var DiskError=$("#DiskError_check").prop("checked");
		var DiskFull=$("#DiskFull_check").prop("checked");
		var Carshape=$("#Carshape_check").prop("checked");
		var Falldown=$("#Falldown_check").prop("checked");
		var cmd ={
			'MainType': 14,
			'SubType': 0,
			'alarmtype':{
				'all': all,
				'Prompt': Prompt,
				'Motion': Motion,
				'Blind': Blind,
				'Loss': Loss,
				'IO': IO,
				'Analyze': Analyze,
				'Human': Human,
				'FaceDetect': FaceDetect,
				'DiskError': DiskError,
				'DiskFull': DiskFull,
				'Carshape': Carshape,
				'Falldown': Falldown
			}
		}
		if(WebCms.plugin.isLoaded){
			gDevice.storeAlarmType(cmd,function(a){
				if(a.Ret!=100){
					DebugStringEvent("storeAlarmType ERROR");
				}else{
					gDevice.AlarmType.alarmtype = cmd.alarmtype;
				}
			});
		}
	}
	function getAlarmType(msg){
		if(isObject(msg)){
			if(msg.Ret==100){
				gDevice.AlarmType = msg;
				$("#allType").prop("checked", msg.alarmtype.all);
				$("#Prompt_check").prop("checked", msg.alarmtype.Prompt);
				$("#Motion_check").prop("checked", msg.alarmtype.Motion);
				$("#Blind_check").prop("checked", msg.alarmtype.Blind);
				$("#Loss_check").prop("checked", msg.alarmtype.Loss);
				$("#IO_check").prop("checked", msg.alarmtype.IO);
				$("#Analyze_check").prop("checked", msg.alarmtype.Analyze);
				$("#Human_check").prop("checked", msg.alarmtype.Human);
				$("#FaceDetect_check").prop("checked", msg.alarmtype.FaceDetect);
				$("#DiskError_check").prop("checked", msg.alarmtype.DiskError);
				$("#DiskFull_check").prop("checked", msg.alarmtype.DiskFull);
				$("#Carshape_check").prop("checked", msg.alarmtype.Carshape);
				$("#Falldown_check").prop("checked", msg.alarmtype.Falldown);
			}
		}
	}
	function AlarmInfoEventProcess(aB){
		var aQ = aB.SubEvent;
		if(aQ == AlarmEvent.SubEventAlarmInfo){
			if(aB[aB.Name].Status == "Start"){
				FillAlarmInfo(aB);
			}
		}else if(aQ == AlarmEvent.SubEventAlarmInit){
			gDevice.getAlarmType(function(a){
				if(a.Ret != WEB_ERROR.ERR_UNLOADPUGIN){
					getAlarmType(a);
				}
				MasklayerHide();
			});
		}
	}
	AlarmInfoEventCallBack = AlarmInfoEventProcess;
	
	$(function() {
		function h() {
			var i = 0;
			flagArr = [];
			$("#alarmListBox input[id!='allType']").each(function() {
				if ($(this).parent().css("display") != "none") {
					if (!$(this).prop("checked")) {
						flagArr[i] = 0
					} else {
						flagArr[i] = 1
					}
					i++
				}
			})
		}
		if(g_productID === "G2"){
			$("#Blind_box").css("display", "none");
			$("#Loss_box").css("display", "none");
			$("#IO_box").css("display", "none");
		}
		if (!GetFunAbility(gDevice.Ability.AlarmFunction.MotionDetect)) {
			$("#Motion_box").css("display", "none");
		}
		if(!GetFunAbility(gDevice.Ability.AlarmFunction.BlindDetect)){
			$("#Blind_box").css("display", "none");
		}
		if(!GetFunAbility(gDevice.Ability.AlarmFunction.LossDetect)){
			$("#Loss_box").css("display", "none");
		}
		if(!(GetFunAbility(gDevice.Ability.AlarmFunction.NewVideoAnalyze) || (GetFunAbility(gDevice.Ability.AlarmFunction.NewVideoAnalyze_digit) && gDevice.loginRsp.DigChannel > 0))){
			$("#Analyze_box").css("display", "none");
		}
		if(!GetFunAbility(gDevice.Ability.AlarmFunction.HumanDectionDVR) && !GetFunAbility(gDevice.Ability.AlarmFunction.HumanDection)
		&& !GetFunAbility(gDevice.Ability.AlarmFunction.HumanDectionNVRNew)){
			$("#Human_box").css("display", "none");
		}
		
		if(gDevice.loginRsp.DigChannel > 0 && gDevice.loginRsp.VideoInChannel == 0){
			$("#FaceDetect_box").css("display","");
		}else if(!GetFunAbility(gDevice.Ability.AlarmFunction.FaceDetect)){
			$("#FaceDetect_box").css("display","none");
		}
		if (!GetFunAbility(gDevice.Ability.AlarmFunction.CarShapeDetection)) {
			$("#Carshape_box").css("display", "none");
		}
		if(!GetFunAbility(gDevice.Ability.AlarmFunction.StorageFailure)){
			$("#DiskError_box").css("display", "none");
		}
		if(!GetFunAbility(gDevice.Ability.AlarmFunction.StorageLowSpace)){
			$("#DiskFull_box").css("display", "none");
		}
		if(!GetFunAbility(gDevice.Ability.AlarmFunction.HumanFallDown)){
			$("#Falldown_box").css("display", "none");
		}
		$("#alarmListBox input[id!='allType']").on("click", function() {
			h();
			var aB = 0;
			for (var aC in flagArr) {
				if (flagArr[aC] == 1) {
					aB++
				}
			}
			if (aB == flagArr.length) {
				$("#allType").prop("checked", true);
			} else {
				$("#allType").prop("checked", false);
			}
		});
		$("#allType").on("click", function() {
			var i = $(this).prop("checked");
			if (!i) {
				$("#alarmListBox").find("input[id!='allType']:visible").prop("checked", false);
			} else {
				$("#alarmListBox").find("input[id!='allType']:visible").prop("checked", true);
			}
		});
		$("#Prompt_check").click(function(){
			SendAlarmTypeChecked();
		})
		$("#alarmListBox input").on("click", function() {
			SendAlarmTypeChecked();
		});

		var bHideAlarmItem = true;
		$("#alarmListBox span[id!='alarmAllBox']").each(function() {
			if($(this).prop("id") != "IO_box" && $(this).css("display") != "none"){
				bHideAlarmItem = false;
				return false;
			}
		});
		if(bHideAlarmItem){
			$("#AlarmMenu").css("display", "none");
		}

		gDevice.getAlarmType(function(a){
			if(a.Ret == WEB_ERROR.ERR_SUCESS){
				gDevice.AlarmType = a;
				if(gDevice.AlarmType.alarmtype == void 0) return;
					var alarmType = gDevice.AlarmType.alarmtype;
					$("#allType").prop("checked", alarmType.all);
					$("#Prompt_check").prop("checked", alarmType.Prompt);
					$("#Motion_check").prop("checked", alarmType.Motion);
					$("#Blind_check").prop("checked", alarmType.Blind);
					$("#Loss_check").prop("checked", alarmType.Loss);
					$("#IO_check").prop("checked", alarmType.IO);
					$("#Analyze_check").prop("checked", alarmType.Analyze);
					$("#Human_check").prop("checked", alarmType.Human);
					$("#FaceDetect_check").prop("checked", alarmType.FaceDetect);
					$("#DiskError_check").prop("checked", alarmType.DiskError);
					$("#DiskFull_check").prop("checked", alarmType.DiskFull);
					$("#Carshape_check").prop("checked", alarmType.Carshape);
					$("#Falldown_check").prop("checked", alarmType.Falldown);
			}
		});
	});

});
