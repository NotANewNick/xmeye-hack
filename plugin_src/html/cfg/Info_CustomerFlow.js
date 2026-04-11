//# sourceURL=Info_CustomerFlow.js
$(function() {
	var queryParam = {};
	var pageTitle = $("#Info_CustomerFlow").text();
	var flowCfg = null;
	var flowCount = null;
	var _sHeight = 480;
	var _sWidth = $("#graph_Rect").width();;
	var _blankTopHeight = 30;
	var _blankBottomHeight = 50;
	var _itemHeight = 40;
	var _itemWidth = 0;
	var _itemAreaWidth = 0;
	var _blankLeftWidth = 55;
	var _blankRightWidth = 45;
	var _itemCount = 5;
	var _itemAreaCount = 20;
	var bHasCounted = false;
	var nActionType = 0;	//0: 日报 1: 周报 2：月报 3：年报
	var nFlowType = 0;		//0: 进入 1：离开 2：经过
	var nDisplayType = 0;	//0：列表 1: 柱形  2：折线
	var _timeArray = [24, 7, 31, 12];
	var bIPC = gDevice.devType == devTypeEnum.DEV_IPC ? true : false;
	var chnIndex = -1;
	var detectCfg = null;
	var strWeek = [lg.get("IDS_WD_Monday"),lg.get("IDS_WD_Tuesday"),
	lg.get("IDS_WD_Wednesday"),lg.get("IDS_WD_Thursday"),lg.get("IDS_WD_Friday"),
	lg.get("IDS_WD_Saturday"), lg.get("IDS_WD_Sunday")];

	function FillList(){
		var str = lg.get("IDS_CountTime");
		var arrTimeUnit = lg.get("IDS_FlowTimeUnit").split('|');
		if(nActionType == 0){
			str += "(" + arrTimeUnit[0] + ")";
		}else if(nActionType == 2){
			str += "(" + arrTimeUnit[1] + ")";
		}else if(nActionType == 3){
			str += "(" + arrTimeUnit[2] + ")";
		}
		Date_Time.innerHTML = str;
		if(nFlowType == 0){
			Date_Count.innerHTML = lg.get("IDS_FlowEnterCount");
		}else if(nFlowType == 1){
			Date_Count.innerHTML = lg.get("IDS_FlowLeaveCount");
		}else if(nFlowType == 2){
			Date_Count.innerHTML = lg.get("IDS_FlowPassCount");
		}
		var table = $("#FlowTable")[0];
		var nClearRow = table.rows.length;
		for (var n = 0; n < nClearRow; ++n) {
			table.deleteRow(0);
		}

		if(!bHasCounted || !isObject(flowCount) || flowCount.length == 0){
			return;
		}

		for(var i=0; i < flowCount.length; i++) {
			var tr = table.insertRow(i);
			var td1 = tr.insertCell(0);
			var td2 = tr.insertCell(1);
			var str =  i + 1;
			if(nActionType == 0){
				str = prefixInteger(i, 2) + ":00-" + prefixInteger(i + 1, 2) + ":00";
			}else if(nActionType == 1){
				str = strWeek[i];
			}
			td1.innerHTML = str;
			td2.innerHTML = flowCount[i];
		}
		
		var nHeadPadding = 0;
		var contentH = $("#FlowList .table-responsive").height()-$("#FlowList .table-head").height();
		if(flowCount.length * 30 > contentH){
			nHeadPadding = TableRightPadding;
		}
		$("#FlowList .table-head").css("padding-right", nHeadPadding+"px");
	}

	function ShowData(){
		if(!bHasCounted || !isObject(flowCfg)){
			if(nDisplayType == 0){
				FillList();
			}else{
				InitGraph();
			}
			return;
		}
		flowCount = flowCfg[flowCfg.Name].FlowEnterCount;
		if(nFlowType == 1){
			flowCount = flowCfg[flowCfg.Name].FlowLeaveCount;
		}else if(nFlowType == 2){
			flowCount = flowCfg[flowCfg.Name].FlowPassCount;
		}

		if(nDisplayType == 0){
			FillList();
		}else{
			InitGraph();
			DrawGraph();
		}
	}

	function InitGraph(){
        var canvas = document.getElementById('graph_cvs');
        if(!canvas.getContext) return;
		
        var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, _sWidth, _sHeight);
		
		_sWidth = $("#graph_Rect").width();
		canvas.width = _sWidth;
		canvas.height = _sHeight;
		ctx.fillStyle = "#FFFDF6";
		ctx.fillRect(_blankLeftWidth, _blankTopHeight, _sWidth - _blankLeftWidth - _blankRightWidth, 400);
		
		ctx.fillStyle = "#6D6D6D";
		ctx.strokeStyle = "#B0B0B0";	
		ctx.font = "12px sans-serif"
		var dateText = '0';
		
		if(nActionType == 2){
			var strStartDate = $("#FlowStartDate").val().split('-');
			var numdays = GetMonthDays(parseInt(strStartDate[0]), parseInt(strStartDate[1]) - 1);
			_timeArray[2] = numdays;
		}
		_itemHeight = (_sHeight - _blankTopHeight - _blankBottomHeight) / _itemCount;
		_itemAreaWidth = _sWidth - _blankLeftWidth - _blankRightWidth;
		_itemWidth = _itemAreaWidth / _timeArray[nActionType];
		for (var i = 0, j = 0; j < _timeArray[nActionType]; i++) {
			var xPos = _blankLeftWidth + _itemWidth * i;
				if (xPos < _blankLeftWidth || xPos > (_sWidth - _blankRightWidth)) {
				continue;
			}
			ctx.moveTo(xPos + 0.5, _sHeight - _blankBottomHeight);
			ctx.lineTo(xPos + 0.5, _sHeight - _blankBottomHeight + 5);
				
			dateText = (i + 1).toString();
			var xLeft = (xPos + _itemWidth/2 - 5);
			if(nActionType == 1){
				dateText = strWeek[i];
				var nTextWidth = ctx.measureText(dateText).width
				xLeft = (xPos + (_itemWidth - nTextWidth)/2);
			}
			ctx.fillText(dateText, xLeft, _sHeight - _blankBottomHeight + 25);
			j++;
		}
		
		var sFlowType = lg.get("IDS_FlowEnterCount");
		if(nFlowType == 1){
			sFlowType = lg.get("IDS_FlowLeaveCount");
		}else if(nFlowType == 2){
			sFlowType = lg.get("IDS_FlowPassCount");
		}
		ctx.fillText(sFlowType, 30, 17);

		var arrTimeUnit = lg.get("IDS_FlowTimeUnit").split('|');
		var sTimeUnit = "";
		if(nActionType == 0){
			sTimeUnit = arrTimeUnit[0];
		}else if(nActionType == 2){
			sTimeUnit = arrTimeUnit[1];
		}else if(nActionType == 3){
			sTimeUnit = arrTimeUnit[2];
		}
		ctx.fillText(sTimeUnit, (_sWidth - _blankLeftWidth - _blankRightWidth) / 2, _sHeight - 5);
		ctx.stroke();
		ctx.closePath();
	}

	function DrawGraph(){
		if(!bHasCounted  || !isObject(flowCount) || flowCount.length == 0){
			return;
		}
		var canvas = document.getElementById('graph_cvs');
        if(!canvas.getContext) return;
		var ctx = canvas.getContext("2d");	
		ctx.beginPath();
		ctx.fillStyle = "#6D6D6D";
		ctx.strokeStyle = "#B0B0B0";
		ctx.moveTo(_blankLeftWidth + 0.5, _blankTopHeight);
		ctx.lineTo(_blankLeftWidth + 0.5, _sHeight - _blankBottomHeight);
		ctx.moveTo(_sWidth - _blankRightWidth + 0.5, _blankTopHeight);
		ctx.lineTo(_sWidth - _blankRightWidth + 0.5, _sHeight - _blankBottomHeight);
		
		var nMaxNum = Math.max.apply(null, flowCount);
		nMaxNum = nMaxNum < 5 ? 5 : nMaxNum;
		nMaxNum = nMaxNum % 5 == 0 ? nMaxNum : (parseInt(nMaxNum / 5) + 1) * 5;
		_itemAreaCount = nMaxNum / _itemCount;

		for (var i = 0; i <= _itemCount; i++) {
			if(i % 2 == 0){
				ctx.moveTo(_blankLeftWidth, _blankTopHeight + _itemHeight * i - 0.5*((i+1)%2));
				ctx.lineTo(_sWidth - _blankRightWidth, _blankTopHeight + _itemHeight * i - 0.5*((i+1)%2));
			}else{
				ctx.moveTo(_blankLeftWidth, _blankTopHeight + _itemHeight * i - 0.5*((i+1)%2) + 0.5);
				ctx.lineTo(_sWidth - _blankRightWidth, _blankTopHeight + _itemHeight * i - 0.5*((i+1)%2) + 0.5);
			}
			
			var nCount = i * _itemAreaCount;
			dateText = nCount.toString();
			var fontWidth = dateText.length * 6 + 10;
			ctx.fillText(dateText, _blankLeftWidth - fontWidth, _sHeight - _itemHeight * i - (_blankBottomHeight - 5));
		}
		ctx.stroke();
		
		ctx.fillStyle = "#4BB2C5";
		if(nDisplayType == 1){
			for(var i = 0; i <= flowCount.length; i++){
				var h = flowCount[i];
				var nHeight = h * _itemHeight /_itemAreaCount;
				var xPos = _blankLeftWidth + _itemWidth * i + _itemWidth / 2 - 5;
				var yPos = _sHeight - nHeight - _blankBottomHeight;
				ctx.fillRect(xPos, yPos, 10, nHeight);	
			}
		}else if(nDisplayType == 2){
			ctx.strokeStyle = "#4BB2C5";
			ctx.lineWidth = 2;
			ctx.beginPath();	
			for(var i = 0; i <= flowCount.length; i++){
				var h = flowCount[i];
				var xPos = _blankLeftWidth + _itemWidth * i + _itemWidth / 2;
				var yPos = _sHeight - h * _itemHeight /_itemAreaCount - _blankBottomHeight;
				if(i == 0){
					ctx.moveTo(xPos, yPos);
				}else{
					ctx.lineTo(xPos, yPos);
				}
			}		
			ctx.stroke();
			ctx.closePath();

			for(var i = 0; i < flowCount.length; i++){
				var h = flowCount[i];
				var xPos = _blankLeftWidth + _itemWidth * i + _itemWidth / 2;
				var yPos = _sHeight - h * _itemHeight /_itemAreaCount - _blankBottomHeight;				
				ctx.beginPath();
				ctx.arc(xPos, yPos, 3, 0, 2*Math.PI);
				ctx.fill();
			}
		}	
	}

	function GetMonthDays(y, m){
		var monthlengths = '31,28,31,30,31,30,31,31,30,31,30,31'.split(',');
		var numdays = monthlengths[m] * 1;
		if (1 == m && ((y%4 == 0 && y%100 != 0) || y%400 == 0)) numdays = 29;
		return numdays;
	}
	function GraphCanvasResizeEvent(){
		if(nDisplayType != 0){
			ShowData();
		}
	}
	function ResizeTable(){
		var contentH = $("#FlowList .table-responsive").height()-$("#FlowList .table-head").height();
		$("#FlowList .table-content").css("height", contentH+'px');
	}
	GraphCanvasResizeCallBack = GraphCanvasResizeEvent;

	function QueryData(bType){
		queryParam = {};
		var sTime;
		var strStartDate = $("#FlowStartDate").val().split('-');
		sTime = strStartDate[0] + "-" + prefixInteger(parseInt(strStartDate[1]),2) +'-'+ prefixInteger(parseInt(strStartDate[2]),2);
		sTime += " 00:00:00";
		queryParam.BeginTime = sTime;
		queryParam.Action = "GetInOutCount";
		nActionType = $("#ReportTypeSel").val() * 1;
		if(nActionType == 0){
			queryParam.CountCycles = 60;
			queryParam.CycleNum = 24;
		}else if(nActionType == 1){
			queryParam.BeginTime = GetMondayTime(sTime);
			queryParam.CountCycles = 1440;
			queryParam.CycleNum = 7;
		}else if(nActionType == 2){
			sTime = strStartDate[0] + "-" + prefixInteger(parseInt(strStartDate[1]),2) +"-01  00:00:00";
			queryParam.BeginTime = sTime;
			queryParam.CountCycles = 1440;
			var numdays = GetMonthDays(parseInt(strStartDate[0]), parseInt(strStartDate[1]) - 1);
			queryParam.CycleNum = numdays;
			_timeArray[2] = numdays;
		}else{
			queryParam.Action = "GetYearReportByM";
			queryParam.CycleNum = 12;
		}

		bHasCounted = false;
		var req = {};
		if(chnIndex == -1){
			req.Name = "CustomerFlowData";
		}else{
			req.Name = "bypass@CustomerFlowData.[" + chnIndex + "]";
		}
		
		req.CustomerFlowData = queryParam;
		RfParamCall(function(a,b){
			if(a.Ret != 100){
				ShowPaop(pageTitle, lg.get("IDS_REFRESH_FAILED"));
			}
			flowCfg = a;
			bHasCounted = true;
			ShowData();
			if(bType == 2){
				ExportFile();
			}else if(bType == 0){
				ShowPaop(pageTitle, lg.get("IDS_REFRESH_SUCCESS"));
			}
		}, pageTitle, "CustomerFlowData", -1, WSMsgID.WSMsgID_FLOW_REQ, req, true);
	}
	function ExportFile(){
		var tableName = "";
		var fileName = "";
		var str = $("#FlowList thead").find('th').eq(0).html();
		if(nActionType == 0){
			tableName = lg.get("IDS_DailyReport");
		}else if(nActionType == 1){
			tableName = lg.get("IDS_WeeklyReport");
		}else if(nActionType == 2){
			tableName = lg.get("IDS_MonthlyReport");
		}else if(nActionType == 3){
			tableName = lg.get("IDS_AnnualReport");
		}
		str += "," + lg.get("IDS_FlowEnterCount") + "," + lg.get("IDS_FlowLeaveCount") + "," + lg.get("IDS_FlowPassCount") + "\n"; 

		var sTime = queryParam.BeginTime.split(" ");
		var sBeginDate = sTime[0].split("-");
		sTime = sBeginDate[0] + sBeginDate[1] + sBeginDate[2];
		if(nActionType == 3){
			sTime = sBeginDate[0] + "0101";
		}
		if(bIPC){
			fileName = tableName + "_" + sTime + ".csv";
		}else{
			var chn = chnIndex < 9 ? '0' + (chnIndex + 1) : (chnIndex + 1);
			fileName = tableName + "_" + chn + "_" + sTime + ".csv";
		}
		
		var cfg = flowCfg[flowCfg.Name];
        for(var i = 0 ; i < cfg.FlowEnterCount.length; i++ ){
			var tmp = $("#FlowTable tr").eq(i).find("td").eq(0).html();
			str += tmp + ',';
			str += cfg.FlowEnterCount[i] + ',';
			str += cfg.FlowLeaveCount[i] + ',';
			str += cfg.FlowPassCount[i] + ',';
            str+='\n';
        }
		str = "\ufeff" + str;
		SaveFileToLocal(str, fileName);
	}
	function ClearData(nClearType){
		var tip = lg.get("IDS_FLOW_SURETOREMOVE");
		if(nClearType == 1){
			tip = lg.get("IDS_OSD_SURETOREMOVE");
		}
		var dataHtml = '<div class="confirm_prompt"><div>\n' +
			'<div class="confirm_str">'+tip+'</div></div>' +
			'<div class="btn_box">\n' +
			'<input type="button" class="btn" id="clearBtnOk" value='+lg.get("IDS_OK")+' />\n' +
			'<input type="button" class="btn btn_cancle" value='+lg.get("IDS_CANCEL")+' />' +
			'</div></div>';
		RenderSencondShow(lg.get("IDS_ALARM_PROMPT"),dataHtml,'Tips_Content',true);
		
		$("#clearBtnOk").click(function(a){
			$(".btn_cancle").click();
			var sAction = 'ClearInOutCount';
			if(nClearType == 1){
				sAction = 'ResetFlowOsd';
			}
			var sName = "CustomerFlowData";
			if(chnIndex != -1){
				sName = "bypass@CustomerFlowData.[" + chnIndex + "]";
			}
			var req = {
				"Name" : sName,
				"CustomerFlowData" : {
					"Action" : sAction
				}
			};
			RfParamCall(function(a){
				if(a.Ret != 100){
					ShowPaop(pageTitle, lg.get("IDS_DATA_REMOVE_FAIL"));
					return;
				}
				ShowPaop(pageTitle, lg.get("IDS_DATA_REMOVE_SUCCESS"));
				if(nClearType == 0){
					bHasCounted = false;
					flowCfg = null;
					QueryData(1);
				}
			}, pageTitle, "CustomerFlowData", -1, WSMsgID.WSMsgID_FLOW_REQ, req, true);
		});		
	}
	function GetMondayTime(d){
		var date = new Date(d);
		var time = date.getTime();
		var day = date.getDay();
		if(day == 0){
			day = 7;
		}
		var oneDayTime = 24 * 60 * 60 * 1000;
		var mondayTime = time - (day - 1) * oneDayTime;
		var monday = new Date(mondayTime);
			
		var nYear = monday.getFullYear();
		var nMonth = monday.getMonth() + 1;
		var nday = monday.getDate();
		var str = nYear + "-" + prefixInteger(nMonth, 2) + "-" + prefixInteger(nday, 2) + " 00:00:00";
		return str;
	}
	function InitChannel() {
		var arrCh = [];
		var CustomerFlowCountFunc;
		$("#FlowChannelSel").empty();
		var dataHtml = '';
		var j;

		if(gDevice.loginRsp.DigChannel > 0){
			RfParamCall(function(a, b){
				CustomerFlowCountFunc = a[a.Name];
				for (j = gDevice.loginRsp.VideoInChannel; j < gDevice.loginRsp.ChannelNum; j++) {
					if(CustomerFlowCountFunc[j]){
						if(chnIndex == -1) chnIndex = j;
						arrCh.push(j);
						dataHtml += '<option value="' + j + '">' + gDevice.getChannelName(j) + '</option>';
					}
				}

				$("#FlowChannelSel").append(dataHtml);
				if(arrCh.length > 0) {					
					chnIndex = arrCh[0];
					$("#FlowChannelSel").val(chnIndex);
					$("#CustomerFlow_page").css("visibility", "visible");
				}else{
					MasklayerHide();
					$("#CustomerFlow_page").css("visibility", "hidden");
					ShowPaop(pageTitle, lg.get("IDS_CHSTA_NoConfig"));
				}
				GetCustomerFlowDetectCfg();
			}, pageTitle,  "ChannelSystemFunction@SupportCustomerFlowCount", -1, WSMsgID.WSMsgID_CHANNEL_ABILITY_GET_REQ);
		}
    }
	
	function GetCustomerFlowDetectCfg(bHide, callback)
	{
		if(bIPC){
			var fName = "Detect.CustomerFlow";
			var chn = -1;
			if(!bIPC)
			{
				fName = "bypass@Detect.CustomerFlow";
				chn = chnIndex;
			}
			RfParamCall(function(a, b){
				if(a.Ret == 100)
				{
					detectCfg = a;
					$("#CFDetectDive").css("display", "");
					$("#CFEnableSwitch").prop("checked", detectCfg[detectCfg.Name].Enable);
					$("#CFIsOutside").prop("checked", detectCfg[detectCfg.Name].IsOutSide);
				}
				else
				{
					$("#CFDetectDive").css("display", "none");
				}
				MasklayerHide();
				if(callback != null)
				{
					callback();
				}
			}, pageTitle, fName, chn, WSMsgID.WsMsgID_CONFIG_GET, null, bHide == null ? true : bHide);
		}
		else
		{
			if(callback != null)
			{
				callback();
			}
		}
	}
	
	function SaveCustomerFlowDetectCfg(callback)
	{
		var fName = "Detect.CustomerFlow";
		var chn = -1;
		if(!bIPC)
		{
			chn = chnIndex;
			fName = "bypass@Detect.CustomerFlow"; 
		}

		detectCfg[detectCfg.Name].Enable = $("#CFEnableSwitch").prop("checked");
		detectCfg[detectCfg.Name].IsOutSide = $("#CFIsOutside").prop("checked");

		RfParamCall(function(a){
			if(a.Ret == 100)
			{
				ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
			}
			if(callback != null)
			{
				callback();
			}
		}, pageTitle, fName, chn, WSMsgID.WsMsgID_CONFIG_SET, detectCfg);
	}

	$("#CF_Refresh").click(function(){
		GetCustomerFlowDetectCfg(false);
	});

	$("#CF_Save").click(function(){
		SaveCustomerFlowDetectCfg();
	});

	$(function() {
		var str = lg.get("IDS_CountTime");
		var arrTimeUnit = lg.get("IDS_FlowTimeUnit").split('|');
		str += "(" + arrTimeUnit[0] + ")";
		Date_Time.innerHTML = str;
		Date_Count.innerHTML = lg.get("IDS_FlowEnterCount");

		$("#ReportTypeSel").empty();
		$("#ReportTypeSel").append('<option value="0">' + lg.get("IDS_DailyReport") + '</option>');
		$("#ReportTypeSel").append('<option value="1">' + lg.get("IDS_WeeklyReport") + '</option>');
		$("#ReportTypeSel").append('<option value="2">' + lg.get("IDS_MonthlyReport") + '</option>');
		$("#ReportTypeSel").append('<option value="3">' + lg.get("IDS_AnnualReport") + '</option>');

		$("#CountTypeSel").empty();
		$("#CountTypeSel").append('<option value="0">' + lg.get("IDS_FlowEnterCount") + '</option>');
		$("#CountTypeSel").append('<option value="1">' + lg.get("IDS_FlowLeaveCount") + '</option>');
		$("#CountTypeSel").append('<option value="2">' + lg.get("IDS_FlowPassCount") + '</option>');

		$("#FlowStartDate").simpleCalendarCtrl({
			type: 1,
			x: $("#FlowStartDate").offset().left - $("#CustomerFlow_page .leftContent").offset().left - 21,
			y: $("#FlowStartDate").offset().top - $("#CustomerFlow_page .leftContent").offset().top + $("#FlowStartDate").css("height").split(
				"px")[0] * 1 + 2,
			Laguage: gVar.lg,
			name: "FlowTimer1",
			nIframe: "Flowframe1"
		});
		$("#FlowStartDate").val($("#FlowStartDate").simpleCalendarCtrl.formatOutput(new Date()));
		$("#FlowStartTime").timer({Type: 1});
		$("#FlowStartTime").timer.SetTimeIn24("00:00:00", $("#FlowStartTime"));
		ResizeTable();

		$("#FlowChannelSel").change(function(){
			chnIndex = $(this).val() * 1;
			GetCustomerFlowDetectCfg();
		});
		$("#CountTypeSel").change(function(){
			nFlowType = $(this).val() * 1;
			ShowData();
		});
		$("#btnClear").click(function(){
			ClearData(0);
		});
		$("#btnResetOSD").click(function(){
			ClearData(1);
		});

		$("#btnCount").click(function(){
			QueryData(0);
		});

		$("#FlowTabBtn_Box .FlowTabBtn").click(function(){
			$(".FlowTabBtn").attr("name","");
			$(this).attr("name","active");
			var id = $(this).attr("id");
			$(".check-btn-box").css("display", "none");
			if(id == "listTab"){
				$("#listPage").css("display", "");
				$("#graphPage").css("display", "none");
				nDisplayType = 0;
				$("#ExportFlow_Div").css("display", "");
				ResizeTable();
			}else{
				$("#listPage").css("display", "none");
				$("#graphPage").css("display", "");
				if(id == "histogramTab"){
					nDisplayType = 1;
				}else{
					nDisplayType = 2;
				}
				$("#ExportFlow_Div").css("display", "none");
			}
			ShowData();
		});
		$("#ExportFlowBtn").click(function(){
			QueryData(2);
		});

		if (bIPC) {
			$("#CustomerFlow_page").css("visibility", "visible");
			$("#Channel_Div").css("display", "none");
			chnIndex = -1;
			GetCustomerFlowDetectCfg();
		} else {
			InitChannel();
		}
		MasklayerHide();
	});
});
