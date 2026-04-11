//# sourceURL=Record_SnapSchedule.js
$(function () {
	var SnapScheCfg = new Array;
	var chnIndex = -1;
	var pageTitle = $("#Record_SnapSchedule").text();
	var bGet = new Array;
	var bReboot;
	var TriggerData = new Array;
	var bBreviary = GetFunAbility(gDevice.Ability.OtherFunction.SupportBreviary);
	var nCnt = gDevice.loginRsp.ChannelNum * 4;
	var nSnapMode;
	var BreviaryCfg;
	$("#TriggerSto").prop("checked",true);
	if(gDevice.devType == devTypeEnum.DEV_IPC){
		$("#Snap_CHN_TABLE").css("display", "none");
	}
	
	var MaskDivH = $("#TriggerSnapList").height();
	$("#TriggerSnapDiv .MaskDiv").css("height", MaskDivH + "px");

	deleteBtnCallBack = deleteBtnClick;

	function absTime(aTime, bTime){
		aTime = aTime.split(":");
		bTime = bTime.split(":");
		var aMillis = aTime[0]*1*3600 + aTime[1]*1*60 + aTime[2]*1;
		var bMillis = bTime[0]*1*3600 + bTime[1]*1*60 + bTime[2]*1;
		if(aMillis > bMillis)
		{
			var tmpMillis = aMillis;
			aMillis = bMillis;
			bMillis = tmpMillis;
		}
		var ret1 = bMillis-aMillis;
		var ret2 = 24*3600+aMillis-bMillis;

		return ret1<ret2 ? ret1 : ret2;
	}
	function compTime(aTime, bTime){
		aTime = aTime.split(":");
		bTime = bTime.split(":");
		var aMillis = aTime[0]*1*3600 + aTime[1]*1*60 + aTime[2]*1;
		var bMillis = bTime[0]*1*3600 + bTime[1]*1*60 + bTime[2]*1;
		return aMillis>bMillis ? 1 : (aMillis==bMillis?0:-1);
	}
	function GetTimeVal(el){
		var tmp = $(el).val() * 1;
		if(tmp <= 9){
			return '0' + tmp;
		}else{
			return tmp;
		}
	}
	function EnableIntervalBox(){
		var CheckBtn = ["#IntervalEmail", "#IntervalFTP", "#IntervalSto"];
		var item = ["#Email_Time", "#FTP_Time", "#Storage_Time"];
		var i;
		for(i = 0; i < CheckBtn.length; i++){
			if($(CheckBtn[i]).prop("checked")){
				$(item[i]).find("input").prop("disabled", false);
				$(item[i]).fadeTo(0, 1);
			}else{
				$(item[i]).find("input").prop("disabled", true);
				$(item[i]).fadeTo(0, 0.4);
			}
		}
	}
	function EnableBox(a, b) {
		var d = $(b);
		if (a == 0) {
			d.find("select, input, button").prop("disabled", true);
			d.children().prop("disabled", true);
			if (d.css("display") != "none") {
				d.stop().fadeTo("slow", 0.4);
				d.find(".recmask").stop().fadeTo("slow", 0.4);
			}
			d.find("button").addClass("btn-disable");
			$("#TriggerSnapDiv .MaskDiv").css("display", "block");
		} else {
			d.find("select, input, button").prop("disabled", false);
			if (d.css("display") != "none") {
				d.stop().fadeTo("slow", 1);
				d.find(".recmask").stop().fadeTo("slow", 1);
			}
			d.children().prop("disabled", false);
			d.find("button").removeClass("btn-disable");
			$("#TriggerSnapDiv .MaskDiv").css("display", "none");
		}
		d = null
	}
	function deleteBtnClick(rowindex){
		if(!$("#TriggerType").prop("checked"))
			return;
		
		var nChn = $("#SnapConChid").val() * 1;
		var cfg = SnapScheCfg[nChn][SnapScheCfg[nChn].Name];
		var data = TriggerData[nChn];
		data.splice(rowindex, 1);
		cfg.TriggerSnap.splice(rowindex, 1);
		
		if(data.length == 0){
			cfg.TriggerSnap = null;
		}else{
			for(var i = 0; i < data.length; i++){
				data[i].No = i + 1;
			}
		}
		
		listDataCall(data);
	}
	function listDataCall(data){
		var table = $("#TriggerSnapTable")[0];
		var nClearRow = table.rows.length;
		var i;
		for (i = 0; i < nClearRow; ++i) {
			table.deleteRow(0);
		}
		for(i = 0; i < data.length; ++i) {
			var tr = table.insertRow(i);
			var td1 = tr.insertCell(0);
			var td2 = tr.insertCell(1);
			var td3 = tr.insertCell(2);
			var td4 = tr.insertCell(3);
			var td5 = tr.insertCell(4);
			td1.innerHTML = '<input class="CustomSnapClass" type="checkbox" value="'+i+'"/><label>&nbsp;'+ data[i].No +'</label>';
			td2.innerHTML = toHtmlEncode(data[i].Time);
			td3.innerHTML = toHtmlEncode(data[i].Email);
			td4.innerHTML = toHtmlEncode(data[i].FTP);
			td5.innerHTML = toHtmlEncode(data[i].Storage);
		}
		var nHeight = $("#TriggerSnapList .table-responsive").height()-$("#TriggerSnapList .table-head").height();
		var nHeadPadding = 0;
		if(data.length * 30 > nHeight){
			nHeadPadding = TableRightPadding;
		}
		$("#TriggerSnapList .table-head").css("padding-right", nHeadPadding+"px");
		$("#TriggerSnapList .table-content").css("height", nHeight+'px');
	}
	function ShowData(nChn) {
		$("#TriggerEmail, #TriggerFTP").prop("checked", false);
		var cfg = SnapScheCfg[nChn][SnapScheCfg[nChn].Name];
		$("#EmailTime, #FTPTime, #StorageTime").empty();
		if(cfg.IntervalSnap.EmailTime != 0){
			$("#EmailTime").val(cfg.IntervalSnap.EmailTime);
			$("#IntervalEmail").prop("checked", true);
		}else{
			$("#EmailTime").val(nCnt);
			$("#IntervalEmail").prop("checked", false);
		}
		if(cfg.IntervalSnap.FTPTime != 0){
			$("#FTPTime").val(cfg.IntervalSnap.FTPTime);
			$("#IntervalFTP").prop("checked", true);
		}else{
			$("#FTPTime").val(nCnt);
			$("#IntervalFTP").prop("checked", false);
		}
		if(cfg.IntervalSnap.StorageTime !=0 ){
			$("#StorageTime").val(cfg.IntervalSnap.StorageTime);
			$("#IntervalSto").prop("checked", true);
		}else{
			$("#StorageTime").val(nCnt);
			$("#IntervalSto").prop("checked", false);
		}
		TriggerData[nChn] = [];
		var TriggerCfg = cfg.TriggerSnap;
		if(TriggerCfg){
			for (var i = 0; i < TriggerCfg.length; i++) {
				var temp = {};
				temp.No = i + 1;
				var time = TriggerCfg[i].triggerTime.split(' ');
				temp.Time = time[1];
				temp.Email = TriggerCfg[i].Email ? '*' : '';
				temp.FTP = TriggerCfg[i].FTP ? '*' : '';
				temp.Storage = TriggerCfg[i].Storage ? '*' : '';
				TriggerData[nChn].push(temp);
			}
		}
		listDataCall(TriggerData[nChn]);
		nSnapMode = cfg.SnapType;
		switch(cfg.SnapType){
		case 0:
			$("#IntervalType").prop("checked", true);
			EnableBox(1, "#IntervalBox");
			EnableBox(0, "#TriggerBox");
			EnableIntervalBox();
			break;
		case 1:
			$("#TriggerType").prop("checked", true);
			EnableBox(0, "#IntervalBox");
			EnableBox(1, "#TriggerBox");
			break;
		case 2:
			$("#CloseType").prop("checked", true);
			EnableBox(0, "#IntervalBox");
			EnableBox(0, "#TriggerBox");
			break;
		}
		MasklayerHide();
	}
	function GetSnapSchedule(nChn){
		if(!bGet[nChn]){
			RfParamCall(function(a){
				SnapScheCfg[nChn] = a;
				bGet[nChn] = true;
				ShowData(nChn);
			}, pageTitle, "Snap.SnapConfig", nChn, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			ShowData(nChn);
		}
	}
	function SaveSnapSchedule(nChn){
		var cfg = SnapScheCfg[nChn][SnapScheCfg[nChn].Name];
		cfg.SnapType = nSnapMode;
		if($("#IntervalEmail").prop("checked")){
			cfg.IntervalSnap.EmailTime = $("#EmailTime").val() * 1;
		}else{
			cfg.IntervalSnap.EmailTime = 0;
		}
		if($("#IntervalFTP").prop("checked")){
			cfg.IntervalSnap.FTPTime = $("#FTPTime").val() * 1;
		}else{
			cfg.IntervalSnap.FTPTime = 0;
		}
		if($("#IntervalSto").prop("checked")){
			cfg.IntervalSnap.StorageTime = $("#StorageTime").val() * 1;
		}else{
			cfg.IntervalSnap.StorageTime = 0;
		}		
	}
	function SaveExCfg(){
		if(bBreviary){
			RfParamCall(function(a, b){		
				ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
				if (chnIndex == gDevice.loginRsp.ChannelNum  && (gDevice.loginRsp.SoftWareVersion > "V2.62.R07" || gDevice.loginRsp.BuildTime > "2024-04-01")){
					Init();
				}
			}, pageTitle, "Snap.Breviary", -1, WSMsgID.WsMsgID_CONFIG_SET, BreviaryCfg);
		}else{
			ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
			if (chnIndex == gDevice.loginRsp.ChannelNum  && (gDevice.loginRsp.SoftWareVersion > "V2.62.R07" || gDevice.loginRsp.BuildTime > "2024-04-01")){
				Init();
			}
		}
	}
	function SaveAllCfg(){
		var CfgData = {
			"Name": "Snap.SnapConfig.[ff]",
			"Snap.SnapConfig.[ff]": cloneObj(SnapScheCfg[0][SnapScheCfg[0].Name])
		};
		RfParamCall(function (data){
			SaveExCfg();
		}, pageTitle, CfgData.Name, -1, WSMsgID.WsMsgID_CONFIG_SET, CfgData);
	}
	function SaveCfg(nChn){
		if(nChn < gDevice.loginRsp.ChannelNum){
			if(bGet[nChn]){
				RfParamCall(function(a){
					SaveCfg(nChn + 1);
				}, pageTitle, "Snap.SnapConfig", nChn, WSMsgID.WsMsgID_CONFIG_SET, SnapScheCfg[nChn])
			}else{
				SaveCfg(nChn + 1);
			}
		}else{
			SaveExCfg();
		}
	}
	function GetTimingInfo(nChn){
		var uploadT = GetTimeVal($("#Upload_Ttime_Hour")) + ":" + GetTimeVal($("#Upload_Ttime_Min")) + ":" + GetTimeVal($("#Upload_Ttime_Sec"));
		var TriggerTime = "0000-00-00 " + uploadT;
		var aTime = uploadT;
		var info = {
			"Time": aTime,
			"Email": $("#TriggerEmail").prop("checked") ? '*' : '',
			"FTP": $("#TriggerFTP").prop("checked") ? '*' : '',
			"Storage": $("#TriggerSto").prop("checked") ? '*' : '',
		}
		var StripInfo = {
			"Email": $("#TriggerEmail").prop("checked"),
			"FTP": $("#TriggerFTP").prop("checked"),
			"Storage": $("#TriggerSto").prop("checked"),
			"triggerTime": TriggerTime
		}
		var cfg = SnapScheCfg[nChn][SnapScheCfg[nChn].Name];
		var data = TriggerData[nChn];
		if(data.length == 0){
			info.No = 1;
			data.push(info);
			if(cfg.TriggerSnap == null){
				cfg.TriggerSnap = [];
			}
			cfg.TriggerSnap.push(StripInfo);
			return;
		}
		var i;
		var bFlag = false;
		for(i = 0; i < data.length; i++){
			var bTime = data[i].Time;
			var absVal = absTime(aTime, bTime)
			if(absVal == 0){
				break;
			}
			if(absVal < 5){
				ShowPaop(pageTitle, lg.get("IDS_SNAPS_TIMESETFAIL"));
				break;
			}
			if(compTime(aTime, bTime) < 0){
				info.No = i + 1;
				data.splice(i, 0, info);
				cfg.TriggerSnap.splice(i, 0, StripInfo);
				bFlag = true;
				break;
			}
		}
		
		if(bFlag){
			for(var j = i + 1; j < data.length; j++){
				data[j].No = j + 1;
			}
		}
		
		if(i == data.length){
			info.No = i + 1;
			data.push(info);
			cfg.TriggerSnap.push(StripInfo);
		}
	}
	function Init(){
		var i;
		for (i = 0; i < gDevice.loginRsp.ChannelNum; i++) {
			bGet[i] = false;
			SnapScheCfg[i] = null;
		}
		var nIndex = chnIndex;
		if(nIndex == gDevice.loginRsp.ChannelNum){
			nIndex = 0;
		}
		if(bBreviary){
			$("#Breviary_div").css("display", "");
			RfParamCall(function(a, b){
				BreviaryCfg = a;
				$("#Breviary").prop("checked", BreviaryCfg[BreviaryCfg.Name].BreviaryEn)
				GetSnapSchedule(nIndex);
			}, pageTitle, "Snap.Breviary", -1, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			$("#Breviary_div").css("display", "none");
			GetSnapSchedule(nIndex);
		}
	}
	$(function () {
		$("#Upload_Ttime").timer({
			Type: 1
		});
		$("#SnapConChid").empty();
		var i;
		for (i = 0; i < gDevice.loginRsp.ChannelNum; i++) {
			bGet[i] = false;
			SnapScheCfg[i] = null;
			TriggerData[i] = new Array;
			$("#SnapConChid").append('<option class="option" value="' + i + '">' + gDevice.getChannelName(i) + '</option>');
		}
		$("#SnapConChid").append('<option class="option" value="' + i + '">' + lg.get("IDS_CFG_ALL") + '</option>');
		
		if(chnIndex == -1){
			chnIndex = 0;
		}
		$("#SnapConChid").val(chnIndex);
		$("input[name='SnapType']").click(function(){
			if($("#IntervalType").prop("checked")){
				nSnapMode = 0;
				EnableBox(1, "#IntervalBox");
				EnableBox(0, "#TriggerBox");
				EnableIntervalBox();
			}else if($("#TriggerType").prop("checked")){
				nSnapMode = 1;
				EnableBox(0, "#IntervalBox");
				EnableBox(1, "#TriggerBox");
			}else{
				nSnapMode = 2;
				EnableBox(0, "#IntervalBox");
				EnableBox(0, "#TriggerBox");
			}
		});
		$("#IntervalBox input[type='checkbox']").click(function(){
			EnableIntervalBox();
		});
		$("#EmailTime, #FTPTime, #StorageTime").keyup(function(){
			if(keyboardFilter(event)) {
				NumberRangeMaxEx(this,86400)
			}
		});
		$("#EmailTime, #FTPTime, #StorageTime").blur(function(){
			NumberRange(this,nCnt,86400,-1);
		})
		$("#SnapConChid").change(function(){
			var nSel = $(this).val() * 1;		
			//选择全部通道，默认显示第一通道数据，而且上一通道的数据也不需要保存
			if (nSel == gDevice.loginRsp.ChannelNum){
				GetSnapSchedule(0);
				chnIndex = nSel;
			}else if (chnIndex == gDevice.loginRsp.ChannelNum){
				GetSnapSchedule(nSel);
				chnIndex = nSel;
			}else {
				SaveSnapSchedule(chnIndex);
				GetSnapSchedule(nSel);
				chnIndex = nSel;
			}
		});
		$("#SnapScheRF").click(function () {
			Init();
		});
		$("#SnapScheSave").click(function(){
			if(bBreviary){
				BreviaryCfg[BreviaryCfg.Name].BreviaryEn = $("#Breviary").prop("checked")
			}
			var nChn = $("#SnapConChid").val() * 1;			
			if (nChn == gDevice.loginRsp.ChannelNum  && (gDevice.loginRsp.SoftWareVersion > "V2.62.R07" || gDevice.loginRsp.BuildTime > "2024-04-01")){
				SaveSnapSchedule(0);
				if(
				  ($("#IntervalEmail").prop("checked")&&SnapScheCfg[0][SnapScheCfg[0].Name].IntervalSnap.EmailTime<nCnt)
				||($("#IntervalFTP").prop("checked")&&SnapScheCfg[0][SnapScheCfg[0].Name].IntervalSnap.FTPTime<nCnt)
				||($("#IntervalSto").prop("checked")&&SnapScheCfg[0][SnapScheCfg[0].Name].IntervalSnap.StorageTime<nCnt)
				  )
				{
					ShowPaop(pageTitle,lg.get("IDS_SCHEDULE_WRONG_TIME")+nCnt+lg.get("IDS_SEC"));
					return;
				}
				SaveAllCfg();
			}else{
				SaveSnapSchedule(nChn);
				if(
				   ($("#IntervalEmail").prop("checked")&&SnapScheCfg[nChn][SnapScheCfg[nChn].Name].IntervalSnap.EmailTime<nCnt)
				 ||($("#IntervalFTP").prop("checked")&&SnapScheCfg[nChn][SnapScheCfg[nChn].Name].IntervalSnap.FTPTime<nCnt)
				 ||($("#IntervalSto").prop("checked")&&SnapScheCfg[nChn][SnapScheCfg[nChn].Name].IntervalSnap.StorageTime<nCnt)
				  )
				{
					ShowPaop(pageTitle,lg.get("IDS_SCHEDULE_WRONG_TIME")+nCnt+lg.get("IDS_SEC"));
					return;
				}
				SaveCfg(0);
			}
		});
		$("#TriggerAdd").click(function (){
			var nChn = $("#SnapConChid").val() * 1;
			if(nChn < 0 || nChn >= gDevice.loginRsp.ChannelNum){
				nChn = 0;
			}
			if(TriggerData[nChn].length >= 256)
				return;
			GetTimingInfo(nChn);
			listDataCall(TriggerData[nChn]);
		});
		$("#TriggerDel").click(function(){
			var arrSelRow = [];
			$(".CustomSnapClass").each(function(){
				if ($(this).prop("checked")) {
					arrSelRow.push($(this).prop("value") *1);
				}
			});
			if(arrSelRow.length == 0) {
				return;
			}
			var nChn = $("#SnapConChid").val() * 1;
			if(nChn < 0 || nChn >= gDevice.loginRsp.ChannelNum){
				nChn = 0;
			}
			var cfg = SnapScheCfg[nChn][SnapScheCfg[nChn].Name];
			var data = TriggerData[nChn];
			
			var i, j;
			for(i = 0; i < arrSelRow.length - 1; i++){
				for(j = 0; j < arrSelRow.length - i - 1; j++){
					if(arrSelRow[j] > arrSelRow[j + 1]){
						var temp = arrSelRow[j];
						arrSelRow[j] = arrSelRow[j + 1];
						arrSelRow[j + 1] = temp;
					}
				}
			}
			for(i = arrSelRow.length - 1; i >= 0; i--){
				data.splice(arrSelRow[i], 1);
				cfg.TriggerSnap.splice(arrSelRow[i], 1);
			}
			if(data.length == 0){
				cfg.TriggerSnap = null;
			}else{
				for( i = 0; i < data.length; i++){
					data[i].No = i + 1;
				}
			}
			listDataCall(data);
		});
		Init()
	});
});
