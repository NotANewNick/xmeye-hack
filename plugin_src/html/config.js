//# sourceURL=config.js
$(function() {
	var c = "";
	var g = {
		firstLevelMenu: "",
		secondLevelMenu: ""
	};
	var lastChildPageID = "";
	var lastChildPageID2 = "";
	var b = lg.get("IDS_WEEK_ARRAY").split(",");
	function LoadNetService(){
		var pFunc={};
		$.extend(pFunc, gDevice.Ability.NetServerFunction);
		if(g_productID === "G2"){
			pFunc.NetDDNS = !1;
			pFunc.NetPPPoE = !1;
			pFunc.NetARSP = !1;
			pFunc.NetUPNP = !1;
			pFunc.NetFTP = !1;
			pFunc.NetAlarmCenter = !1;
		}
		var $item = $("#System_NetService_item");
		$item.empty();
		var dataHtml = '<li class="arrow_left" style="display:none; float:left"></li>\n';
		if (GetFunAbility(pFunc.NetIPFilter)) {		//白黑名单
			dataHtml += '<li class="content-menu-item" id="NetService_IPFilter">\n' + 
			'	<div id="NetService_IPFilterL">'+lg.get("IDS_NETS_NetIPFilter")+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}
		if (GetFunAbility(pFunc.NetDDNS)) {			//DDNS功能
			dataHtml += '<li class="content-menu-item" id="NetService_DDNS">\n' +
			'	<div id="NetService_DDNSL">'+lg.get("IDS_NETS_NetDDNS")+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}
		if (GetFunAbility(pFunc.NetEmail)) {			//Email功能
			dataHtml += '<li class="content-menu-item" id="NetService_Email">\n'+
			'	<div id="NetService_EmailL">'+lg.get("IDS_NETS_NetEmail")+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}
		if (GetFunAbility(pFunc.NetMutlicast)) {		//多播功能
		}
		if (GetFunAbility(pFunc.NetNTP)) {				//NTP功能
			dataHtml += '<li class="content-menu-item" id="NetService_NTP">\n' +
			'	<div id="NetService_NTPL">'+lg.get("IDS_NETS_NetNTP")+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}
		if (GetFunAbility(pFunc.NetPPPoE)) {			//PPPOE
			dataHtml += '<li class="content-menu-item" id="NetService_PPPoE">\n' +
			'	<div id="NetService_PPPoEL">'+lg.get("IDS_NETS_NetPPPoE")+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}
		if (GetFunAbility(pFunc.NetARSP)) {			//ARSP
			dataHtml += '<li class="content-menu-item" id="NetService_ARSP">\n' +
			'	<div id="NetService_ARSPL">'+lg.get("IDS_NETS_NetARSP")+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}
		if (GetFunAbility(pFunc.Net3G)) {				//3G网络Wireless
			dataHtml += '<li class="content-menu-item" id="NetService_3G">\n' +
			'	<div id="NetService_3GL">'+lg.get("IDS_NETS_Net3G")+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}
		if (GetFunAbility(pFunc.NetUPNP)) {			//UPNP
			dataHtml += '<li class="content-menu-item" id="NetService_UPNP">\n' +
			'	<div id="NetService_UPNPL">'+lg.get("IDS_NETS_NetUPNP")+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}
		if (GetFunAbility(pFunc.NetFTP)) {				//FTP
			dataHtml += '<li class="content-menu-item" id="NetService_FTP">\n' +
			'	<div id="NetService_FTPL">'+lg.get("IDS_NETS_NetFTP")+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}
		if (GetFunAbility(pFunc.NetWifi)) {			//Wifi
			dataHtml += '<li class="content-menu-item" id="NetService_Wifi">\n' +
			'	<div id="NetService_WifiL">'+lg.get("IDS_NETS_NetWifi")+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}
		if (GetFunAbility(pFunc.NetAlarmCenter)) {		//报警中心
			dataHtml += '<li class="content-menu-item" id="NetService_AlarmCenter">\n' + 
			'	<div id="NetService_AlarmCenterL">'+lg.get("IDS_NETS_NetAlarmCenter")+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}

		if (GetFunAbility(pFunc.NetRTSP)) {			//RTSP
			dataHtml += '<li class="content-menu-item" id="NetService_RTSP">\n' +
			'	<div id="NetService_RTSPL">'+lg.get("IDS_NETS_NetRTSP")+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}
		if (GetFunAbility(pFunc.NetDAS)) {				//主动注册
			dataHtml += '<li class="content-menu-item" id="NetService_DAS">\n' +
			'	<div id="NetService_DASL">'+lg.get("IDS_NETS_NetDAS")+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}
		if (GetFunAbility(pFunc.NetNat)) {				//NAT穿透，MTU配置,CLOUD
			dataHtml += '<li class="content-menu-item" id="NetService_Nat">\n' +
			'	<div id="NetService_NatL">'+lg.get("IDS_NETS_NetNat")+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}
		if (GetFunAbility(pFunc.NetSPVMN)) {			//国标28181
			dataHtml += '<li class="content-menu-item" id="NetService_SPVMN">\n' +
			'	<div id="NetService_SPVMNL">'+lg.get("IDS_NETS_NetSPVMN")+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}
		if (GetFunAbility(pFunc.RTMP)) {				//RTMP
			dataHtml += '<li class="content-menu-item" id="NetService_RTMP">\n' +
			'	<div id="NetService_RTMPL">'+lg.get("RTMP")+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}
		if (GetFunAbility(pFunc.NetPMS)) {
			var temp;
			if (GetFunAbility(pFunc.NetPMSV2)) {
				temp = lg.get("IDS_NETS_NetPMSV2");
			}else {
				temp = lg.get("IDS_NETS_NetPMS");
			}
			dataHtml += '<li class="content-menu-item" id="NetService_PMS">\n' + 
			'	<div id="NetService_PMSL">'+temp+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}
		if (GetFunAbility(gDevice.Ability.OtherFunction.SupportCommDataUpload)) {
			dataHtml += '<li class="content-menu-item" id="NetService_SerialTrans">\n' +
			'	<div id="NetService_SerialTransL">'+lg.get("IDS_NETS_TransFunction")+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}
		if(GetFunAbility(gDevice.Ability.OtherFunction.SupportGat1400))	{
			dataHtml += '<li class="content-menu-item" id="NetService_Gat1400">\n' + 
			'	<div id="NetService_Gat1400L">'+lg.get("IDS_NETS_Gat1400")+'</div>\n' +
			' 	<div class="menu-item-after"></div>\n' + 
			'</li>\n';
		}

		dataHtml += '<li class="arrow_right" style="display:none; float:right;"></li>';
		$item.append(dataHtml);
		var totalItems = $item.find(".content-menu-item").length;
		$item.attr("totalIndex", totalItems);
		$item.attr("leftIndex", 0);
		$item.attr("rightIndex", totalItems);
		
		var b = $item.find(".content-menu-item");
		$("#System_NetService_item .arrow_left").click(function(){
			var itemW = $item.width();
			var leftIndex = $item.attr("leftIndex") * 1 - 1;
			$item.find(".arrow_left, .arrow_right").css("display", "none");
			var childW = 0;
			var h = leftIndex;
			for(; h < b.length; h++){
				$(b[h]).css("display", ""); 
				childW += $(b[h]).width() + 15 * 2 + 3;
				if(leftIndex == 0){
					if(childW + 26 >= itemW){
						$item.attr("rightIndex", h - 1);
						$item.find(".arrow_right").css("display", "");
						break;
					}
				}else{
					if(childW + 26 * 2 >= itemW){
						$item.attr("rightIndex", h - 1);
						$item.find(".arrow_left, .arrow_right").css("display", "");
						break;
					}
				}
			}
			if(h <= b.length - 1){
				for(var j = h; j <= b.length - 1; j++){
					$(b[j]).css("display", "none");
				}
			}else{
				$item.attr("rightIndex", b.length - 1);
				if(leftIndex > 1){
					$item.find(".arrow_left").css("display", "");
				}
			}
			$item.attr("leftIndex", leftIndex);
		});
		$("#System_NetService_item .arrow_right").click(function(){
			var itemW = $item.width();
			var rightIndex = $item.attr("rightIndex") * 1 + 1;
			$item.find(".arrow_left, .arrow_right").css("display", "none");
			var childW = 0;
			var h = rightIndex;
			for(; h >= 0; h--){
				$(b[h]).css("display", ""); 
				childW += $(b[h]).width() + 15 * 2 + 3;
				if(rightIndex == b.length - 1){
					if(childW + 26 >= itemW){
						$item.attr("leftIndex", h + 1);
						$item.find(".arrow_left").css("display", "");
						break;
					}
				}else{
					if(childW + 26 * 2 >= itemW){
						$item.attr("leftIndex", h + 1);
						$item.find(".arrow_left, .arrow_right").css("display", "");
						break;
					}
				}
			}
			if(h >= 0){
				for(var j = 0; j <= h; j++){
					$(b[j]).css("display", "none");
				}
			}
			$item.attr("rightIndex", rightIndex);
		});
	}
	var d = function(j) {
		$("#firstLevelMenu").text(j.firstLevelMenu);
		$("#secondLevelMenu").text(j.secondLevelMenu)
	};
	$(function(){
		for (var h = 0; h < 7; h++) {
			if (h == 0) {
				gVar.weekArr[h] = b[6]
			} else {
				gVar.weekArr[h] = b[h - 1]
			}
		}
		if(g_productID === "G2"){
			gDevice.Ability.OtherFunction.SupportSnapSchedule = !1;
			gDevice.Ability.EncodeFunction.SnapStream = !1;
		}
		if (GetFunAbility(gDevice.Ability.CommFunction.CommRS485)) {	//485串口能力级
			if (gDevice.loginRsp.VideoInChannel) {		//存在模拟通道
				$("#System_PTZ").css("display", "");
				System_PTZ.innerHTML = lg.get("IDS_SYSTEM_PTZ");
			}else {
				if (gDevice.loginRsp.DigChannel) {		//全数字通道
					$("#System_PTZ").css("display", "");
					System_PTZ.innerHTML = lg.get("IDS_PTZ_TitleRS");
				}
			}
		}
		if (GetFunAbility(gDevice.Ability.CommFunction.CommRS232)) {
			$("#System_Serial").css("display", "");
		}
		if (GetFunAbility(gDevice.Ability.OtherFunction.NOHDDRECORD)) {	//无硬盘录像
			$("#mRecord, #mRecord_parameter, #Advance_HddManager, #Info_HddInfo").css("display", "none");
		}else{
			var bSnapSchedule = GetFunAbility(gDevice.Ability.OtherFunction.SupportSnapSchedule);
			if(bSnapSchedule){
				$("#Record_SnapSchedule").css("display", "");
			}else{
				$("#Record_SnapSchedule").css("display", "none");
			}
			var bSnap = GetFunAbility(gDevice.Ability.EncodeFunction.SnapStream);
			if (gDevice.loginRsp.VideoInChannel == 0){  //全数字通道
				bSnap =  false;
			}
			if( bSnap && !bSnapSchedule){
				$("#Record_Snap").css("display", "");
			}else{
				$("#Record_Snap").css("display", "none");
			}
			if(parseInt(gDevice.ExtRecSupport.AbilityPram) != 0){
				$("#Record_Ctrl").css("display", "");
			}
			if(typeof g_RecordSchedule != "undefined" && g_RecordSchedule){
				$("#Record_Manager").css("display", "none");
				$("#Record_Manager_jh").css("display", "");
			}else{
				$("#Record_Manager").css("display", "");
				$("#Record_Manager_jh").css("display", "none");
			}
		}
		if(gDevice.devType == devTypeEnum.DEV_IPC || (gDevice.loginRsp.DigChannel > 0 && GetFunAbility(gDevice.Ability.OtherFunction.SupportModifyFrontcfg))){
			if("JFOS_IPC" == g_oemName){
				$("#System_CameraParam_Simp").css("display", "");
			}else{
				$("#System_CameraParam").css("display", "");
			}
		}
		if(gDevice.devType == devTypeEnum.DEV_IPC || WebCms.web.webstyle == "JFPro"){
			$("#Advance_ChannelType").css("display","none");
		}
		if(gDevice.loginRsp.DigChannel <= 0 || gDevice.devType == devTypeEnum.DEV_IPC){
			$("#Advance_Digital").css("display", "none");
		}
		if(!GetFunAbility(gDevice.Ability.AlarmFunction.LossDetect)){
			$("#Alarm_VideoLoss").css("display", "none");
		}
		if(gDevice.loginRsp.AlarmOutChannel <= 0){
			$("#Alarm_Output").css("display", "none");
		}
		if (GetFunAbility(gDevice.Ability.NetServerFunction.NetIPv6)) {
			$("#System_NetworkIPV6").css("display", "");
		} 
		if(GetFunAbility(gDevice.Ability.AlarmFunction.NewVideoAnalyze) || 
			(GetFunAbility(gDevice.Ability.AlarmFunction.NewVideoAnalyze_digit) && gDevice.loginRsp.DigChannel > 0)){
			$("#Alarm_Intelligent").css("display", "");
		}
		if(!GetFunAbility(gDevice.Ability.AlarmFunction.HumanDectionDVR)){
			$("#Alarm_HumanDetect").css("display","none");
		}
		if(!GetFunAbility(gDevice.Ability.AlarmFunction.FaceDetect)){
			$("#Alarm_FaceDetect").css("display","none");
		}
		if (!GetFunAbility(gDevice.Ability.AlarmFunction.MotionDetect)) {
			$("#Alarm_Motion").css("display", "none");
		}
		if (!GetFunAbility(gDevice.Ability.AlarmFunction.BlindDetect)) {
			$("#Alarm_VideoBlind").css("display", "none");
		}
		if (gDevice.loginRsp.AlarmInChannel || GetFunAbility(gDevice.Ability.AlarmFunction.IPCAlarm)) {
			$("#Alarm_Input").css("display", "block");
		}
		if (gDevice.loginRsp.DigChannel <= 0 || gDevice.devType == devTypeEnum.DEV_IPC) {
			$("#Info_ChanStatus").css("display", "none");
		}
		if (!GetFunAbility(gDevice.Ability.OtherFunction.SupportDimenCode)
			|| typeof g_visibleQRInfo != "undefined" && g_visibleQRInfo * 1 == 0){	// 福克斯子客户定制
			$("#Info_QR").css("display", "none");
		}
		if(!(gDevice.loginRsp.VideoInChannel>0||GetFunAbility(gDevice.Ability.OtherFunction.SupportDigitalEncode))){
			$("#System_Encode").css("display", "none");
		}
		if (GetFunAbility(gDevice.Ability.AlarmFunction.CarShapeDetection) && WebCms.web.webstyle != "JFPro") {
			$("#Alarm_CarShape").css("display", "");
		}
		if(!(GetFunAbility(gDevice.Ability.AlarmFunction.StorageNotExist)
		|| GetFunAbility(gDevice.Ability.AlarmFunction.StorageFailure)
		|| GetFunAbility(gDevice.Ability.AlarmFunction.StorageLowSpace)
		|| GetFunAbility(gDevice.Ability.AlarmFunction.NetAbort)
		|| GetFunAbility(gDevice.Ability.AlarmFunction.NetIpConflict))){
			$("#Alarm_Exception").css("display", "none");
		}
		if (GetFunAbility(gDevice.Ability.OtherFunction.SupportCustomerFlowCount)) {
			$("#Info_CustomerFlow").css("display", "");
		}

		if(gDevice.loginRsp.VideoInChannel == 0 && (GetFunAbility(gDevice.Ability.AlarmFunction.HumanDectionNVR) 
		|| GetFunAbility(gDevice.Ability.AlarmFunction.HumanDectionNVRNew))){
			$("#Alarm_SmartAlarm").show();
			$("#Alarm_Motion, #Alarm_HumanDetect, #Alarm_FaceDetect").hide();
			if(WebCms.web.webstyle == "JFPro"){
				$("#Alarm_CarShape").css("display", "none");
			}	
		}else{
			$("#Alarm_SmartAlarm").hide();
		}
		if(GetFunAbility(gDevice.Ability.OtherFunction.SupportShowIPCParam) && gDevice.loginRsp.DigChannel > 0){
			$("#System_IPCParam").css("display", "");
			if($("#System_CameraParam").css("display") != "none"){
				$("#System_CameraParam").css("display", "none");
			}
		}
		if(GetFunAbility(gDevice.Ability.EncodeFunction.SupportROI) && WebCms.plugin.isLoaded){
			$("#System_ROI").css("display", "");
		}
		if(!WebCms.plugin.isLoaded){
			$("#IPCParam_ImageSet").css("display", "none");
			$("#System_ColorParam").css("display", "none");
            if(gDevice.devType == devTypeEnum.DEV_IPC){
                $("#Advance_Upgrade").css("display", "none");
            }
		}
		if(g_productID === "G2"){
			$("#Alarm_Motion").hide();
			$("#Alarm_VideoBlind").hide();
			$("#Alarm_VideoLoss").hide();
			$("#Alarm_Output").hide();
			$("#System_Display").hide();
			$("#Advance_HddManager").hide();
			$("#Alarm_Input").hide();
			$("#Alarm_FaceDetect").hide();
			$("#Alarm_SmartAlarm").show();
		}
		LoadNetService();
		$(".RemoteSet_Menu").click(function() {
			g.firstLevelMenu = $(this).text();
			var j = $(this).attr("id") + "_parameter";
			$(".RemoteSet_Menu_listBox").addClass("none");
			$(".RemoteSet_Menu").removeAttr("d");
			if ($("#" + j).attr("d") != "active") {
				$("#" + j).removeClass("none");
				$(".RemoteSet_Menu_listBox").removeAttr("d");
				$("#" + j).attr("d", "active");
				$(this).attr("d", "active")
			} else {
				$("#" + j).addClass("none");
				$("#" + j).removeAttr("d");
				$(this).removeAttr("d")
			}
		});
		$(".content-menu-item").on("click", function() {
			MasklayerShow();
			var a = $(this).attr("id");
			if(a != lastChildPageID2){
				lastChildPageID2 = a;
				var b = $(this);
				b.siblings().removeClass("active").end().addClass("active");
				var c = a;	
				gVar.SubPage = a;
				gVar.LoadChildConfigPage(c)
			}else{
				if (a == "IPCParam_ImageSet") {
					if ($("#imagesetOcx").length != 0) {
						$("#imagesetOcx").append($("#ipcplugin").detach());
						$("#ipcplugin").css({
							width: "100%",
							height: "100%"
						});
					}
					gDevice.HidePlugin(false, function () {
						initImageSetEvent();
					});
				} else {
					MasklayerHide();
				}
			}
		});
		$(".RemoteSet_Menu_list").click(function() {
			MasklayerShow();
			if ($(this).hasClass("mInteSM")) {
				var id = $(this).attr("id");
				if(id == lastChildPageID) {
					if(id == "System_IPCParam" && gVar.SubPage == "IPCParam_ImageSet") {
						if ($("#imagesetOcx").length != 0) {
							$("#imagesetOcx").append($("#ipcplugin").detach());
							$("#ipcplugin").css({
								width: "100%",
								height: "100%"
							});
						}
						gDevice.HidePlugin(false, function () {
							initImageSetEvent();
						});		
					}else{
						MasklayerHide();
					}
					return;
				}
				lastChildPageID = id;
				gVar.SubPage = id;
				$(".content-menu-wrapper").removeClass("none");
				$("#chlidCfgContent").css("top", (48 + 35) + "px");
				$(".content-menu-list").hide();
				var a = $(this).attr("id") + "_item";
				$("#" + a).show();
				$(".RemoteSet_Menu_list").attr("d", "not-active").removeClass("RemoteSet_Menu_list RemoteSet_Menu_list_active")
					.addClass("RemoteSet_Menu_list");
				$(this).attr("d", "active").addClass("RemoteSet_Menu_list_active");
				g.secondLevelMenu = $(this).text();
				d(g);
				var f = false;
				var e;
				var b = $("#" + a).children();
				for (var h = 0; h < b.length; h++) {
					if ($(b[h]).css("display") != "none" && $(b[h]).hasClass("content-menu-item")) {
						e = $(b[h]).attr("id");
						f = true;
						break
					}
				}
				if (!f) {
					ShowPaop($("#" + e).text(), lg.get("IDS_PAGE_FAILED"));
					return
				}
				var c = $("#" + e);
				c.siblings().removeClass("active").end().addClass("active");
				lastChildPageID2 = e;
				gVar.SubPage = e;
				gVar.LoadChildConfigPage(e)
			} else {
				var id = $(this).attr("id");
				if (id != lastChildPageID) {
					lastChildPageID = id;
					gVar.SubPage = id;
					$(".content-menu-wrapper").addClass("none");
					$("#chlidCfgContent").css("top", "48px");
					g.secondLevelMenu = $(this).text();
					if ($(this).attr("d") != "active") {
						$(".RemoteSet_Menu_list").attr("d", "not-active").removeClass(
							"RemoteSet_Menu_list RemoteSet_Menu_list_active").addClass("RemoteSet_Menu_list");
						$(this).attr("d", "active").addClass("RemoteSet_Menu_list_active");
						d(g)
					}
					gVar.LoadChildConfigPage($(this).attr("id"));
				} else {
					if (id == "System_ColorParam") {
						if ($("#colorsetOcx").length != 0) {
							$("#colorsetOcx").append($("#ipcplugin").detach());
							$("#ipcplugin").css({
								width: "100%",
								height: "100%"
							});
						}
						gDevice.HidePlugin(false, function () {
							initColorSetEvent();
						});
					} else if(id == "System_ROI"){
						if ($("#roiSetOcx").length != 0) {
							$("#roiSetOcx").append($("#ipcplugin").detach());
							$("#ipcplugin").css({
								width: "100%",
								height: "100%"
							});
						}
						gDevice.HidePlugin(false, function () {
							initColorSetEvent();
						});
					} else {
						MasklayerHide();
					}
				}
			}
		});
		$(".RemoteSet_Menu_listBox").addClass("none");
		$(".RemoteSet_Menu").each(function() {
			if ($(this).css("display") != "none") {
				var j = $(this).attr("id");
				$("#" + j + "_parameter").removeClass("none");
				return false
			}
		});
		$(".RemoteSet_Menu_list").each(function() {
			$(this).attr("d", "not-active");
			if ($(this).css("display") != "none" && $(this).parent().css("display") != "none") {
				c = $(this).attr("id");
				return false;
			}
		});
		if(c != ""){
			$("#" + c).attr("d", "active").addClass("RemoteSet_Menu_list_active");
			$("#" + c).parent().attr("d", "active");
			$(".RemoteSet_Menu:visible").first().attr("d", "active");
			g.firstLevelMenu = $(".RemoteSet_Menu:visible").first().text();
			$("#firstLevelMenu").text(g.firstLevelMenu);
			$("#secondLevelMenu").text($("#" + c).html());
			gVar.LoadChildConfigPage(c);
		}
		var bHideAlarm = true;
		$("#mAlarm_parameter .RemoteSet_Menu_list").each(function() {
			if ($(this).css("display") != "none") {
				bHideAlarm = false;
				return false;
			}
		});
		if(bHideAlarm){
			$("#mAlarm, #mAlarm_parameter").css("display", "none");
		}
		$("#menuMask").css("display","none");
	});
});
