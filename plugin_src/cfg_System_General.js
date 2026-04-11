//# sourceURL=System_General.js
$(function(){
	var SupportLang = {};
	var OPTimeQuery;
	var LocationInfo = {};
	var GeneralInfo = {};
	var TimeZone = {};
	var NetNTP = {};
	var MultiVstd = {};		//支持视频制式
	var NetCommon;
	var DataFormat = ["YYMMDD", "MMDDYY", "DDMMYY"];
	var DateSeparator = [".", "-", "/"];
	var TimeFormat = ["24", "12"];
	var HddFull = ["StopRecord", "OverWrite"];
	var bSupportNetNTP = GetFunAbility(gDevice.Ability.NetServerFunction.NetNTP);
	var bSupportTimeZone = GetFunAbility(gDevice.Ability.OtherFunction.SupportTimeZone);
	var bIsIPC = gDevice.devType == devTypeEnum.DEV_IPC ? true : false;
	var pageTitle = $("#System_General").text();
	function getMonthWeek(a, b, c) {
		var date = new Date(a, parseInt(b) - 1, c);
		w = date.getDay();
		d = date.getDate();
		if(w==0){
			w=7;
		}
		var config = {
			getMonth:date.getMonth()+1,
			getYear:date.getFullYear(),
			getWeek:Math.ceil((d + 6 - w) / 7),
		};
		return config;
	};

	function ShowWeekDst() {
		var Year = OPTimeQuery.split("-")[0] *1;
		var DstStart = LocationInfo[LocationInfo.Name].DSTStart;
		var DstEnd = LocationInfo[LocationInfo.Name].DSTEnd;
		var StartMonth = DstStart.Month < 1 ? 1 : DstStart.Month;
		var EndMonth = DstEnd.Month < 1 ? 1 : DstEnd.Month;
		StartMonth = StartMonth > 12 ? 12 : StartMonth;
		EndMonth = EndMonth > 12 ? 12 : EndMonth;
		$("#DstStartMonth").val(StartMonth);
		$("#DstEndMonth").val(EndMonth);
		if (DstStart.Week > 0) {
			$("#DstStartWeek").val(DstStart.Week);
			$("#DstEndWeek").val(DstEnd.Week);
		}else {
			$("#DstStartWeek").val(1);
			$("#DstEndWeek").val(1);
		}
		var StartWeekDay = DstStart.Day > 31 ? 31 : DstStart.Day;
		var EndWeekDay = DstEnd.Day > 31 ? 31 : DstEnd.Day;
		if (DstStart.Week > 0) {
			StartWeekDay = StartWeekDay > 6 ? 6 : StartWeekDay < 0?0:StartWeekDay;
			EndWeekDay = EndWeekDay > 6 ? 6 : EndWeekDay<0?0:EndWeekDay;
			$("#DstStartWeekDay").val(StartWeekDay);
			$("#DstEndWeekDay").val(EndWeekDay);
		}else {
			StartWeekDay = StartWeekDay < 1 ? 1 : StartWeekDay;
			EndWeekDay = EndWeekDay < 1 ? 1 : EndWeekDay;
			var date1 = new Date(Year + "/" + StartMonth + "/" + StartWeekDay);
			var date2 = new Date(Year + "/" + EndMonth + "/" + EndWeekDay);
			$("#DstStartWeekDay").val(date1.getDay());
			$("#DstEndWeekDay").val(date2.getDay());
		}
		$("#dstWeekTimer").timer.SetTimeIn24(DstStart.Hour + ":" + DstStart.Minute , $("#dstWeekTimer"), false);
		$("#dstWeekTimer2").timer.SetTimeIn24(DstEnd.Hour + ":" + DstEnd.Minute , $("#dstWeekTimer2"), false);
	}
	
	function ShowDateDst() {
		var Year = OPTimeQuery.split("-")[0] *1;
		var DstStart = LocationInfo[LocationInfo.Name].DSTStart;
		var DstEnd = LocationInfo[LocationInfo.Name].DSTEnd;
		var StartMonth = DstStart.Month < 1 ? 1 : DstStart.Month;
		var EndMonth = DstEnd.Month == 0 ? 1 : DstEnd.Month;
		StartMonth = StartMonth > 12 ? 12 : StartMonth;
		EndMonth = EndMonth > 12 ? 12 : EndMonth;
		var StartDay = DstStart.Day > 31 ? 31 : DstStart.Day;
		var EndDay = DstEnd.Day > 31 ? 31 : DstEnd.Day;
		StartDay = StartDay < 1 ? 1 : StartDay;
		EndDay = EndDay < 1 ? 1 : EndDay;
		$("#DstStartDate").attr("data-date", Year + "-" + StartMonth + "-" + StartDay);
		$("#DstEndDate").attr("data-date", Year + "-" + EndMonth + "-" + EndDay);
		var DstStartTime = StartMonth + "/" + StartDay + "/" + Year;
		var DstEndTime = EndMonth + "/" + EndDay + "/" + Year;
		$("#DstStartDate").val($("#DstStartDate").simpleCalendarCtrl.formatOutput(new Date(DstStartTime)));
		$("#DstEndDate").val($("#DstEndDate").simpleCalendarCtrl.formatOutput(new Date(DstEndTime)));
		$("#dstDateTimer").timer.SetTimeIn24(DstStart.Hour + ":" + DstStart.Minute , $("#dstDateTimer"), false);	//false ->has not second
		$("#dstDateTimer2").timer.SetTimeIn24(DstEnd.Hour + ":" + DstEnd.Minute, $("#dstDateTimer2"), false);	//false ->has not second
	}
	function week2Date(year,month,week,dayofWeak){
		dayofWeak=(dayofWeak==0?7:dayofWeak);
		var a=new Date;
		a.setFullYear(year);
		a.setMonth(month-1);
		a.setDate(1);
		var firstDOfM=(a.getDay()==0?7:a.getDay()) ;
		var dif=dayofWeak-firstDOfM;
		if(firstDOfM>dayofWeak){
			week+=1;
		}
		var time=new Date;
		time.setFullYear(year);
		time.setMonth(month-1);
		time.setDate((week-1)*7+1+dif);
		if(time.getMonth()+1!=month)
		{
			time.setFullYear(year);
			time.setMonth(month-1);
			time.setDate((week-2)*7+1+dif);
		}
		return time;
	}
	function SaveDst() {
		var DstStart = LocationInfo[LocationInfo.Name].DSTStart;
		var DstEnd = LocationInfo[LocationInfo.Name].DSTEnd;
		var nSelMode = $("#SelDstMode").val() *1;
		if (nSelMode == 0) {		//save week dst
			var dstStartTime = $("#dstWeekTimer").timer.GetTimeFor24($("#dstWeekTimer"));
			var dstEndTime = $("#dstWeekTimer2").timer.GetTimeFor24($("#dstWeekTimer2"));
			var sDate=week2Date(OPTimeQuery.split("-")[0] *1,$("#DstStartMonth").val() *1,$("#DstStartWeek").val() *1,$("#DstStartWeekDay").val() *1);
			var eDate=week2Date(OPTimeQuery.split("-")[0] *1,$("#DstEndMonth").val() *1,$("#DstEndWeek").val() *1,$("#DstEndWeekDay").val() *1);
			sDate.setHours(dstStartTime.split(":")[0] *1);
			sDate.setMinutes(dstStartTime.split(":")[1] *1);
			eDate.setHours(dstEndTime.split(":")[0] *1);
			eDate.setMinutes(dstEndTime.split(":")[1] *1);
/*			
			if(sDate.getTime()>eDate.getTime())
			{
				ShowPaop(pageTitle,lg.get("IDS_PBK_InvalidTime"));
				return false;
			}
*/			
			DstStart.Year = OPTimeQuery.split("-")[0] *1;
			DstStart.Month = $("#DstStartMonth").val() *1;
			DstStart.Week = $("#DstStartWeek").val() *1;
			DstStart.Day = $("#DstStartWeekDay").val() *1;
			DstStart.Hour = dstStartTime.split(":")[0] *1;
			DstStart.Minute = dstStartTime.split(":")[1] *1;
			DstEnd.Year = OPTimeQuery.split("-")[0] *1;
			DstEnd.Month = $("#DstEndMonth").val() *1;
			DstEnd.Week = $("#DstEndWeek").val() *1;
			DstEnd.Day = $("#DstEndWeekDay").val() *1;
			DstEnd.Hour = dstEndTime.split(":")[0] *1;
			DstEnd.Minute = dstEndTime.split(":")[1] *1;
		}else {						//save date dst
			var dstStartDate = $("#DstStartDate").attr("data-date");
			var dstEndDate = $("#DstEndDate").attr("data-date");
			var dstStartTime = $("#dstDateTimer").timer.GetTimeFor24($("#dstDateTimer"));
			var dstEndTime = $("#dstDateTimer2").timer.GetTimeFor24($("#dstDateTimer2"));
			var sDate=str2Date(dstStartDate+" "+dstStartTime);
			var eDate=str2Date(dstEndDate+" "+dstEndTime);
/*			
			if(eDate.getTime()<sDate.getTime())
			{
				ShowPaop(pageTitle,lg.get("IDS_PBK_InvalidTime"));
				return false;
			}
*/			
			DstStart.Year = dstStartDate.split("-")[0] *1;
			DstStart.Month = dstStartDate.split("-")[1] *1;
			DstStart.Day = dstStartDate.split("-")[2] *1;
			DstStart.Week = 0;
			DstStart.Hour = dstStartTime.split(":")[0] *1;
			DstStart.Minute = dstStartTime.split(":")[1] *1;
			DstEnd.Year = dstEndDate.split("-")[0] *1;
			DstEnd.Month = dstEndDate.split("-")[1] *1;
			DstEnd.Day = dstEndDate.split("-")[2] *1;
			DstEnd.Week = 0;
			DstEnd.Hour = dstEndTime.split(":")[0] *1;
			DstEnd.Minute = dstEndTime.split(":")[1] *1;
		}
		return true;
	}
	function ShowData(flag) {
		var CfgLocal = LocationInfo[LocationInfo.Name];
		var CfgGeneral = GeneralInfo[GeneralInfo.Name];
		$("#SysDate").simpleCalendarCtrl("setFormat", CfgLocal.DateFormat);
		$("#SysDate").simpleCalendarCtrl("setSeparator", CfgLocal.DateSeparator);		
		var SysDate = OPTimeQuery.split(" ")[0];
		var SysTime = OPTimeQuery.split(" ")[1];
		$("#SysDate").attr("data-date", SysDate);
		var dateFormat = SysDate.split("-")[1] + "/" + SysDate.split("-")[2] + "/" + SysDate.split("-")[0];
		$("#SysDate").val($("#SysDate").simpleCalendarCtrl.formatOutput(new Date(dateFormat), $("#SysDate")));
		$("#SysTime").timer.SetTimeIn24("" + SysTime.split(":")[0] + ":" + SysTime.split(":")[1] + ":" + SysTime.split(":")[2], $("#SysTime"));
		$("#SysTime").timer.fnRun($("#SysTime"), $("#SysDate"));			
		var i;
		for (i=0; i < DataFormat.length; i++) {
			if (DataFormat[i] == CfgLocal.DateFormat) {
				$("#SelDataFormat").val(i);
				break;
			}
		}
		$("#SelDataFormat").change();
		for (i=0; i < DateSeparator.length; i++) {
			if (DateSeparator[i] == CfgLocal.DateSeparator) {
				$("#SelDateSeparator").val(i);
				break;
			}
		}
		for(i=0; i < TimeFormat.length; i++) {
			if (TimeFormat[i] == CfgLocal.TimeFormat) {
				$("#SelTimeFormat").val(i);
				$("#SysTime").timer.ChangeType(1 - i, $("#SysTime"));
				break;
			}
		}
		for (i=0; i < HddFull.length;i++) {
			if (HddFull[i] == CfgGeneral.OverWrite) {
				$("#SelHddFull").val(i);
				break;
			}
		}
		$("#InputRemoteAddr").val(CfgGeneral.LocalNo);
		$("#InputStandByTime").val(CfgGeneral.AutoLogout);
		if (bIsIPC && bSupportNetNTP) {
			if (bSupportTimeZone) {
				$("#TimeZone").css("display", "none");
				$("#SelTimeZone").css("display", "none");
			}else {
				$("#TimeZone").css("display", "");
				$("#SelTimeZone").css("display", "");
			}
			RfParamCall(function(a,b){
				NetNTP = a;
				$("#SelTimeZone").val(NetNTP[NetNTP.Name].TimeZone);
			},pageTitle, "NetWork.NetNTP", -1, WSMsgID.WsMsgID_CONFIG_GET);
		}
		
		// 先有支持语言能力，后有支持视频制式能力，如果语言能力获取不到就代表视频制式也获取不到
		$("#SelLanguage").empty();
		$("#SelVideoMode").empty();
		if (SupportLang == null || SupportLang.length == 0) {
			$("#SelLanguage").append('<option value="0">ENGLISH</option>');
			$("#SelLanguage").append('<option value="1">简体中文</option>');
			$("#SelVideoMode").append('<option value="0">PAL</option>');
			$("#SelVideoMode").val(0);
			$("#SelLanguage").val(1);
			$("#SelLanguage").prop("disabled", true);
			$("#SelVideoMode").prop("disabled", true);
		}else {
			var SupportVstd = MultiVstd[MultiVstd.Name];
			if (SupportVstd == "") {
				$("#SelVideoMode").append('<option value="0">PAL</option>');
				$("#SelVideoMode").val(0);
			}else {
				var arrVstd = SupportVstd.split("|");
				for(i=0; i < arrVstd.length; i++) {
					$("#SelVideoMode").append('<option value="'+ i +'">'+ arrVstd[i] +'</option>');
					if (arrVstd[i] == CfgLocal.VideoFormat) {
						$("#SelVideoMode").val(i);
					}
				}
			}

			var nLen = SupportLang.length;
			for (var i=0; i < nLen; i++) {
				var lan = SupportLang[i];
				var langTemp = "IDS_LANG_" + lan;
				$("#SelLanguage").append('<option value='+ i +'>' + lg.get(langTemp) + '</option>');
				if (CfgLocal.Language == lan) {
					$("#SelLanguage").val(i);
				}
			}
			$("#SelLanguage").prop("disabled", false);
			$("#SelVideoMode").prop("disabled", false);
		}
		
		if (bSupportTimeZone) {
			$("#table_time_zone").css("display", "");
			$("#TimeZone").css("display", "none");
			$("#SelTimeZone").css("display", "none");
			var nHour = parseInt(TimeZone[TimeZone.Name].timeMin/60);
			var nMin  = Math.abs(TimeZone[TimeZone.Name].timeMin%60);
			var strZone= "";
			if(nHour > 0) {
				strZone += "-";
			}else {
				strZone += "+";
			}
			strZone += prefixInteger(Math.abs(nHour),2) + ":" + prefixInteger(nMin,2);
			$('#SelTimeZone2 option:contains("'+strZone+'")').prop("selected", true);
		}else {
			$("#table_time_zone").css("display", "none");
		}

		if (CfgLocal.DSTRule == "Off") {
			$("#DstCheckBox").prop("checked", false);
			$("#DstSettingBox").hide();
		}else {
			$("#DstCheckBox").prop("checked", true);
			$("#DstSettingBox").show();
		}
		if(flag){
			ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
		}
		$("#InputMachineName").val(NetCommon[NetCommon.Name].HostName);
		MasklayerHide();
	}
	function LoadConfig(flag) {
		RfParamCall(function(a,b){
			SupportLang = a[a.Name];
			RfParamCall(function(a,b){
				MultiVstd = a;
				RfParamCall(function(a,b){
					OPTimeQuery = a["OPTimeQuery"];
					RfParamCall(function(a,b){
						LocationInfo = a;
						RfParamCall(function(a,b){
							GeneralInfo = a;
							RfParamCall(function(a,b){
								NetCommon= a;
								if (bSupportTimeZone) {
									RfParamCall(function(a,b){
										TimeZone=a;
										ShowData(flag);
									}, pageTitle, "System.TimeZone", -1, WSMsgID.WsMsgID_CONFIG_GET);
								}else {
									ShowData(flag);
								}
							},pageTitle, "NetWork.NetCommon", -1, WSMsgID.WsMsgID_CONFIG_GET);
						}, pageTitle, "General.General", -1, WSMsgID.WsMsgID_CONFIG_GET);
					}, pageTitle, "General.Location", -1, WSMsgID.WsMsgID_CONFIG_GET);
				}, pageTitle, "OPTimeQuery", -1, WSMsgID.WSMsgID_TIMEQUERY_REQ);
			}, pageTitle, "MultiVstd", -1, WSMsgID.WsMsgID_ABILITY_GET);
		}, pageTitle, "MultiLanguage", -1, WSMsgID.WsMsgID_ABILITY_GET);
	}
	function SaveNetNTP(bReboot) {
		if(bIsIPC && bSupportNetNTP) {
			NetNTP[NetNTP.Name].TimeZone = $("#SelTimeZone").val()*1
			RfParamCall(function(a){
				if(!bReboot){
					LoadConfig(true);
				}else {
					RebootDev(pageTitle, lg.get("IDS_CONFIRM_RESTART"), true);
				}		
			}, pageTitle, "NetWork.NetNTP", -1, WSMsgID.WsMsgID_CONFIG_SET, NetNTP);
		}else {
			if(!bReboot){
				LoadConfig(true);
			}else {
				RebootDev(pageTitle, lg.get("IDS_CONFIRM_RESTART"), true);
			}		
		}
	}
	function SaveConfig() {
		var CfgLocal = LocationInfo[LocationInfo.Name];
		var CfgGeneral = GeneralInfo[GeneralInfo.Name];

		var LocalNo = $("#InputRemoteAddr").val() *1;
		if (LocalNo > 998) {
			LocalNo = 998;
		}else if (LocalNo < 0) {
			LocalNo = 0;
		}
		CfgGeneral.LocalNo = LocalNo;
		CfgGeneral.OverWrite = HddFull[$("#SelHddFull").val()*1];
		NetCommon[NetCommon.Name].HostName = $("#InputMachineName").val();

		var AutoLogout = $("#InputStandByTime").val() *1;
		if (AutoLogout > 60) {
			AutoLogout = 60;
		}else if (AutoLogout < 0) {
			AutoLogout = 0;
		}
		CfgGeneral.AutoLogout = AutoLogout;
		
		CfgLocal.DSTRule = $("#DstCheckBox").prop("checked") ? "On" : "Off";
		CfgLocal.DateFormat = DataFormat[$("#SelDataFormat").val()*1];
		CfgLocal.DateSeparator = DateSeparator[$("#SelDateSeparator").val()*1];
		CfgLocal.TimeFormat = TimeFormat[$("#SelTimeFormat").val() *1];
		
		var nSelLang = $("#SelLanguage").val() *1;
		if (SupportLang == null || SupportLang.length == 0) {
			if (nSelLang == 0) {
				CfgLocal.Language = "English";
			}else if (nSelLang == 1) {
				CfgLocal.Language = "SimpChinese";
			}
		}else {
			if (nSelLang >=0 && nSelLang < SupportLang.length) {
				CfgLocal.Language = SupportLang[nSelLang];
			}
		}
		CfgLocal.VideoFormat = $("#SelVideoMode").find("option:selected").text();
		var resTimeSetting = "";
		var SystemTime = {
			"Name":"OPTimeSetting",
			"OPTimeSetting":"0000-00-00 00:00:00"
		};
		var SysDate = $("#SysDate").attr("data-date");
		var SysTime = $("#SysTime").timer.GetTimeFor24($("#SysTime"));
		SystemTime.OPTimeSetting = SysDate + " " + SysTime;
		if (bSupportTimeZone) {
			//	获得时区与时间
			var text = $("#SelTimeZone2").find("option:selected").text();
			var sPos = text.indexOf("[");
			var ePos = text.indexOf("]");
			var stime = text.substr(sPos+1, ePos-sPos-1);
			sPos = stime.indexOf("-");
			var nFlag = 1;
			if(sPos == -1){
				sPos = stime.indexOf("+");
				nFlag = -1;
			}
			stime = stime.substr(sPos+1,ePos-sPos-1);
			var arr = stime.split(":");
			timeZoneMin = TimeZone[TimeZone.Name].timeMin;
			var timeZonetext = $("#SelTimeZone2").find("option:selected").text().match(/C(.*?)\]/);
			var FullTimeFormat = SysDate + "T" + SysTime + timeZonetext[1];
			//计算时区偏移:设置的时区向设备进行偏移
			var curFullTime = new Date(FullTimeFormat);
			var utcTime = curFullTime.getTime() + curFullTime.getTimezoneOffset() * 60 * 1000;
			var targetTime =  new Date(utcTime  - parseInt(timeZoneMin) * 60 * 1000);
			var year = targetTime.getFullYear();
			var month = String(targetTime.getMonth() + 1).padStart(2, '0');
			var day = String(targetTime.getDate()).padStart(2, '0');
			var hours = String(targetTime.getHours()).padStart(2, '0');
			var minutes = String(targetTime.getMinutes()).padStart(2, '0');
			var seconds = String(targetTime.getSeconds()).padStart(2, '0');
			resTimeSetting = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
			//设置时区偏移
			TimeZone[TimeZone.Name].timeMin = nFlag*(parseInt(arr[0])*60+parseInt(arr[1]));
		}
		if(resTimeSetting != "") SystemTime.OPTimeSetting = resTimeSetting;
		var bReboot = false; //改变视频制式（PAL/NTSC）、切换语言需重启设备
		RfParamCall(function(a){
			RfParamCall(function(a){
				if (a.Ret == 603) {
					bReboot = true;
				}
				RfParamCall(function(a){
					RfParamCall(function(a){
						if (bSupportTimeZone) {
							RfParamCall(function(a){
								SaveNetNTP(bReboot);
							}, pageTitle, "System.TimeZone", -1, WSMsgID.WsMsgID_CONFIG_SET, TimeZone);
						}else {
							SaveNetNTP(bReboot);
						}
					}, pageTitle, "NetWork.NetCommon", -1, WSMsgID.WsMsgID_CONFIG_SET, NetCommon);
				}, pageTitle, "General.General", -1, WSMsgID.WsMsgID_CONFIG_SET, GeneralInfo);
			}, pageTitle, "General.Location", -1, WSMsgID.WsMsgID_CONFIG_SET, LocationInfo);
		}, pageTitle, "OPTimeSetting", -1, WSMsgID.WSMsgID_SYSMANAGER_REQ, SystemTime);
	}
	$(function(){
		$("#SysDate").simpleCalendarCtrl({
			type: 1,
			x: $("#SysDate").offset().left - $("#chlidCfgContent").offset().left - 21,
			y: $("#SysDate").offset().top - $("#chlidCfgContent").offset().top + $("#SysDate").css("height").split(
				"px")[0] * 1 + 2,
			Laguage: gVar.lg,
			name: "PiTimer1",
			nIframe: "iframe1",
			UseZS: true
		});

		function InitHtml() {
			var i;
			$("#SelTimeZone2").empty();
			for(i = 0; i < 7; i++) {
				var UTC = lg.get("IDS_GEN_TZUTC"+(i+1));
				var arrTimeZone = [];
				arrTimeZone = UTC.split('|');
				for (var j=0; j < arrTimeZone.length; j++) {
					$("#SelTimeZone2").append('<option value="'+ (i*5+j) +'">'+ arrTimeZone[j] +'</option>');
				}
			}
			$("#SelTimeZone").empty();
			for (i = 0; i < 33; i++) {
				$("#SelTimeZone").append('<option value="'+ i +'">'+ lg.get("IDS_GEN_TZGMT"+i) +'</option>');
			}
			$("#SelDataFormat").empty();
			for(i=0; i < 3; i++) {
				$("#SelDataFormat").append('<option value="'+ i +'">'+ lg.get("IDS_GEN_DateFormat"+(i+1)) +'</option>');
			}
			$("#SelTimeFormat").empty();
			for (i=0; i < 2; i++) {
				$("#SelTimeFormat").append('<option value="'+ i +'">'+ lg.get("IDS_GEN_TimeFormat"+(i+1)) +'</option>')
			}
			$("#SelHddFull").empty();
			$("#SelHddFull").append('<option value="0">'+ lg.get("IDS_GEN_DiskFullStop") +'</option>');
			$("#SelHddFull").append('<option value="1">'+ lg.get("IDS_GEN_DiskFullOverWirte") +'</option>');

			if(gDevice.loginRsp.HardWare.indexOf("NBD") != -1){
				$("#table_video_mode").css("display", "none");
			}
		}
		function ShowDstSetting(){
			var DstHtml = 
		'	<div id="ChoseDst">\n' +
		'	    <div id="DSTXLSEnable">\n' +
		'	        <div class="cfg_row">\n' +
		'	            <div class="cfg_row_left" id="DstMode">'+ lg.get("IDS_GEN_DstMode") +'</div>\n'+
		'	            <div class="cfg_row_right">\n' +
		'	                <select id="SelDstMode" class="select"></select>\n' +
		'	            </div>\n' +
		'	        </div>\n' +
		'	        <div id="DstWeek">\n' +
		'	            <div class="cfg_row">\n' +
		'	                <div class="cfg_row_left" id="start_timeL">'+ lg.get("IDS_GEN_DstStart") +'					 </div>\n' +
		'	                <div class="cfg_row_right">\n' +
		'	                    <div style="width:235px; overflow:hidden; clear:left; float:left;">\n' +
		'	                        <select id="DstStartMonth"></select>\n' +
		'	                        <select id="DstStartWeek"></select>\n' +
		'	                        <select id="DstStartWeekDay"></select>\n' +
		'	                    </div>\n' +
		'	                    <div id="dstWeekTimer" style="height:25px; overflow:hidden"></div>\n' +
		'	                </div>\n' +
		'	            </div>\n' +
		'	            <div class="cfg_row">\n' +
		'	                <div class="cfg_row_left" id="end_timeL">' + lg.get("IDS_GEN_DstEnd") +
		'					</div>\n' +
		'	                <div class="cfg_row_right">\n' +
		'	                    <div style="width:235px; overflow:hidden; clear:left; float:left;">\n' +
		'	                        <select id="DstEndMonth"></select>\n' +
		'	                        <select id="DstEndWeek"></select>\n' +
		'	                        <select id="DstEndWeekDay"></select>\n' +
		'	                    </div>\n' +
		'	                    <div id="dstWeekTimer2" style="height:25px; overflow:hidden"></div>\n' +
		'	                </div>\n' +
		'	            </div>\n' +
		'	        </div>\n' +
		'	        <div id="DstDate">\n' +
		'	            <div class="cfg_row">\n' +
		'	                <div class="cfg_row_left" id="start_time2">' + lg.get("IDS_GEN_DstStart") +
		'					</div>\n' +
		'	                <div class="cfg_row_right">\n' +
		'	                    <div style="float:left;">\n' +
		'	                        <input id="DstStartDate" readonly="readonly" type="text" ' +
		'							style=" float:right;width:155px;height:24px;margin-top:4px;' +
		'							margin-right:4px;" data-date=""/>\n' +
		'	                    </div>\n'+
		'	                    <div id="dstDateTimer" style="float: left; height: 25px; ' +
		'							overflow: hidden"></div>\n' +
		'	                </div>\n' +
		'	            </div>\n' +
		'	            <div class="cfg_row">\n' +
		'	                <div class="cfg_row_left" id="end_time2">' + lg.get("IDS_GEN_DstEnd") +
		'					</div>\n' +
		'	                <div class="cfg_row_right">\n' +
		'	                    <div style="float:left;">\n' +
		'	                        <input id="DstEndDate" readonly="readonly" type="text" ' +
		'							style=" float:right;width:155px;height:24px;margin-top:4px;' +
		'							margin-right:4px;" data-date=""/>' +
		'	                    </div>\n' +
		'	                    <div id="dstDateTimer2" style="float:left; height:25px; ' +
		'						overflow: hidden"></div>\n' +
		'	                </div>\n' +
		'	            </div>\n' +
		'	        </div>\n' +
		'	    </div>\n' +
		'	</div>\n' +
		'	<div class="btn_box" style="padding-left:150px;">\n' +
		'		<button type="button" class="btn" id="btn_confirm">' + lg.get("IDS_OK") +
		'		</button>\n' +
		'		<button type="button" class="btn btn_cancle" '+
		'       id="General_btn_cancle">'+ lg.get("IDS_CANCEL") + '</button>\n' +
		'	</div>\n' +
		'	<div id="PiTimer2" style="width:285px; height:0px; overflow:hidden;"></div>\n' +
		'	<div id="PiTimer3" style="width:285px; height:0px; overflow:hidden;"></div>\n' +
		'	<iframe id="iframe2" style="width:0px; height:0px; border:0px; overflow:hidden; ' +
		'   	position: absolute"></iframe>\n' +
		'	<iframe id="iframe3" style="width:0px; height:0px; border:0px; overflow:hidden; ' +
		'		position: absolute"></iframe>';

			$("#Config_dialog .content_container").html(DstHtml);
			Config_Title.innerHTML = lg.get("IDS_GEN_DstSettingTitle");
			SetWndTop("#Config_dialog", 60);						
			$("#Config_dialog").css("width", '550px');			
			
			$("#DstStartDate").simpleCalendarCtrl({
				type: 1,
				x: 185,
				y: 115,
				Laguage: gVar.lg,
				name: "PiTimer2",
				nIframe: "iframe2",
				UseZS: true
			});
			$("#DstEndDate").simpleCalendarCtrl({
				type: 1,
				x: 186,
				y:145,
				Laguage: gVar.lg,
				name: "PiTimer3",
				nIframe: "iframe3",
				UseZS: true
			});
			$("#dstWeekTimer").timer({Type: 1, hasSecond:false});
			$("#dstWeekTimer2").timer({Type: 1, hasSecond:false});
			$("#dstDateTimer").timer({Type: 1, hasSecond:false});
			$("#dstDateTimer2").timer({Type: 1, hasSecond:false});
			
			$("#SelDstMode").change(function() {
				if ($("#SelDstMode").val() == 0) { //Week mode
					$("#DstWeek").css("display", "");
					$("#DstDate").css("display", "none");
					ShowWeekDst();
				} else {
					$("#DstWeek").css("display", "none");
					$("#DstDate").css("display", "");
					ShowDateDst();
				}
			});
			$("#btn_confirm").click(function(){
				if(SaveDst()==true){
					closeDialog();
				}
			});
			
			$("#SelDstMode").empty();
			$("#SelDstMode").append('<option value="0">'+ lg.get("IDS_GEN_DstWeek") +'</option>');
			$("#SelDstMode").append('<option value="1">'+ lg.get("IDS_GEN_DstDate") +'</option>');
			$("#DstStartMonth").empty();
			$("#DstEndMonth").empty();
			for(i = 0; i < 12;i++){
				$("#DstStartMonth").append('<option value="'+(i+1)+'">'+ lg.get("IDS_MON"+(i+1)) +'</option>');
				$("#DstEndMonth").append('<option value="'+(i+1)+'">'+ lg.get("IDS_MON"+(i+1)) +'</option>');
			}
			$("#DstStartWeek").empty();
			$("#DstEndWeek").empty();
			for (i = 0; i < 5; i++) {
				$("#DstStartWeek").append('<option value="'+(i+1)+'">'+ lg.get("IDS_GEN_DstWeek"+ (i+1)) +'</option>');
				$("#DstEndWeek").append('<option value="'+(i+1)+'">'+ lg.get("IDS_GEN_DstWeek"+ (i+1)) +'</option>');
			}
			$("#DstStartWeekDay").empty();
			$("#DstEndWeekDay").empty();
			var weekDay = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
			for(var i=0; i < 7; i++) {
				$("#DstStartWeekDay").append('<option value="'+ i +'">'+ lg.get("IDS_GEN_" + weekDay[i]) +'</option>');
				$("#DstEndWeekDay").append('<option value="'+ i +'">'+ lg.get("IDS_GEN_" + weekDay[i]) +'</option>');
			}
			
			var DstStart = LocationInfo[LocationInfo.Name].DSTStart;
			if (DstStart.Week == 0) {
				$("#SelDstMode").val(1);
			}else {
				$("#SelDstMode").val(0);
			}
			$("#SelDstMode").change();
			MasklayerShow(1);
			SetWndTop("#Config_dialog", 60);
			$("#Config_dialog").show();
		}
		$("#DstCheckBox").click(function(){
			var bCheck = $(this).prop("checked");
			if(bCheck){
				$("#DstSettingBox").show();
			}else{
				$("#DstSettingBox").hide();
			}
		});
		$("#DstSetting").click(function(){
			ShowDstSetting();
		});
		$("#SelDataFormat").change(function(){
			var nSel = $(this).val() * 1;
			$("#SysDate").simpleCalendarCtrl("setFormat", DataFormat[nSel]);		
			var SysDate = $("#SysDate").attr("data-date");
			var dateFormat = SysDate.split("-")[1] + "/" + SysDate.split("-")[2] + "/" + SysDate.split("-")[0];
			$("#SysDate").val($("#SysDate").simpleCalendarCtrl.formatOutput(new Date(dateFormat), $("#SysDate")));
		});
		$("#SelDateSeparator").change(function(){
			var nSel = $(this).val() * 1;
			$("#SysDate").simpleCalendarCtrl("setSeparator", DateSeparator[nSel]);
			var SysDate = $("#SysDate").attr("data-date");
			var dateFormat = SysDate.split("-")[1] + "/" + SysDate.split("-")[2] + "/" + SysDate.split("-")[0];
			$("#SysDate").val($("#SysDate").simpleCalendarCtrl.formatOutput(new Date(dateFormat), $("#SysDate")));
		});
		$("#SelTimeFormat").change(function(){
			var nSel =  $("#SelTimeFormat").val() * 1;
			$("#SysTime").timer.ChangeType(1 - nSel, $("#SysTime"));
		});
		$("#SelTimeZone2").change(function(){
			var nHour = parseInt(TimeZone[TimeZone.Name].timeMin/60);
			var nMin  = Math.abs(TimeZone[TimeZone.Name].timeMin%60);
			var strZone= "";
			if(nHour > 0) {
				strZone += "-";
			}else {
				strZone += "+";
			}
			strZone += prefixInteger(Math.abs(nHour),2) + ":" + prefixInteger(nMin,2);
			RfParamCall(function(a,b){
				if(a.Ret == 100){
					//获得Dev时区与时间
					var tmpOPTimeQuery = a["OPTimeQuery"];
					var SysDate = tmpOPTimeQuery.split(" ")[0];
					var SysTime = tmpOPTimeQuery.split(" ")[1];
					var tmpSysCurDate = SysDate + "T" + SysTime + strZone;
					var text = $("#SelTimeZone2").find("option:selected").text();
					var sPos = text.indexOf("[");
					var ePos = text.indexOf("]");
					var stime = text.substr(sPos+1, ePos-sPos-1);
					sPos = stime.indexOf("-");
					var nFlag = 1;
					if(sPos == -1){
						sPos = stime.indexOf("+");
						nFlag = -1;
					}
					stime = stime.substr(sPos+1,ePos-sPos-1);
					var arr = stime.split(":");
					var timeMin = nFlag*(parseInt(arr[0])*60+parseInt(arr[1]));
					//计算时区偏移
					var currentDate = new Date(tmpSysCurDate);
					var localTime = currentDate.getTime();
					var offsetTime = currentDate.getTimezoneOffset() * 60 * 1000;
					var utcTime = localTime + offsetTime;
					var adjustedTime =new Date(utcTime - timeMin * 60 * 1000);
					//设置控件时间
					$("#SysTime").timer.SetTimeIn24("" + adjustedTime.getHours().toString().padStart(2, '0') + ":" + adjustedTime.getMinutes().toString().padStart(2, '0') + ":" + adjustedTime.getSeconds().toString().padStart(2, '0'), $("#SysTime"));
					$("#SysTime").timer.fnRun($("#SysTime"), $("#SysDate"));	
					var sDate = adjustedTime.toLocaleDateString('en-CA');
					$("#SysDate").attr("data-date", sDate);
					var dateFormat = sDate.split("-")[1] + "/" + sDate.split("-")[2] + "/" + sDate.split("-")[0];
					$("#SysDate").val($("#SysDate").simpleCalendarCtrl.formatOutput(new Date(dateFormat), $("#SysDate")));
					MasklayerHide();
				}
			}, pageTitle, "OPTimeQuery", -1, WSMsgID.WSMsgID_TIMEQUERY_REQ);
			
        });
		$("#BtnRefresh").click(function(){
			LoadConfig(false);
		});
		$("#BtnSave").click(function(){
			SaveConfig();
		});
		InitHtml();
		LoadConfig(false);
	});
});