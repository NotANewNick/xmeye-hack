$(function () {
	var SnapCfg = new Array;
	var chnIndex = -1;
	var pageTitle = $("#Record_Snap").text();
	var weekIndex = 0;
	var bGet = new Array;
	var copyCfg;
	var bCopy;
	var nCopyWeek;
	function GetTimeVal(el){
		var tmp = $(el).val() * 1;
		if(tmp <= 9){
			return '0' + tmp;
		}else{
			return tmp;
		}
	}
	function EnableBox(a, b) {
		var d = $(b);
		if (a == 0) {
			d.find("select").prop("disabled", true);
			d.find("input").prop("disabled", true);
			if (d.css("display") != "none") {
				d.stop().fadeTo("slow", 0.2);
				d.find(".recmask").stop().fadeTo("slow", 0.2);
			}
		} else {
			d.find("select").prop("disabled", false);
			d.find("input").prop("disabled", false);
			if (d.css("display") != "none") {
				d.stop().fadeTo("slow", 1);
				d.find(".recmask").stop().fadeTo("slow", 1);
			}
			d.children().prop("disabled", false);
		}
		d = null
	}
	function SaveAllChnCfg(){
		var cfg = {};
		var cfgName = "Storage.Snapshot.[ff]";
		cfg[cfgName] = cloneObj(SnapCfg[0][SnapCfg[0].Name]);
		cfg.Name = cfgName;
		RfParamCall(function (data){
			ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
			Init();
		}, pageTitle, cfgName, -1, WSMsgID.WsMsgID_CONFIG_SET, cfg);
	}
	function SaveChnCfg(nIndex){
		if(nIndex < gDevice.loginRsp.ChannelNum){
			if(bGet[nIndex]){
				var CfgData = SnapCfg[nIndex];
				RfParamCall(function (data){						
					SaveChnCfg(nIndex + 1);
				}, pageTitle, "Storage.Snapshot", nIndex, WSMsgID.WsMsgID_CONFIG_SET, CfgData);
			}else{
				SaveChnCfg(nIndex + 1);
			}
		}else{
			ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
		}
	}
	function ShowData(nChn, nWeek, bChangeWeek) {
		var cfg = SnapCfg[nChn][SnapCfg[nChn].Name];
		if(!bChangeWeek){
			var bSameTimeSection = true;
			var i=0;
			for (i = 0; i < 7;i++ ){
				for(var j = i + 1; j < 7; j++ ){
					for(var k = 0; k < 4; k++){
						if(cfg.Mask[i][k] != cfg.Mask[j][k] ||
							cfg.TimeSection[i][k] != cfg.TimeSection[j][k]){
							bSameTimeSection = false;
							break;
						}
					}
					if (!bSameTimeSection){
						break;
					}
				}
				if (!bSameTimeSection){
					break;
				}
			}
			if (bSameTimeSection){
				$("#SnapWeekChid").val(7);
			}else{
				$("#SnapWeekChid").val(weekIndex);
			}
		}
		
		//$("#PreCapture").val(cfg.PreSnap);
		var tsCfg = cfg.TimeSection;
		for (var i = 1; i <= 4; ++i) {
			var sect = tsCfg[nWeek][i - 1].split(" ");
			var tSect = sect[1].split("-");
			var btSect = tSect[0].split(":");
			var etSect = tSect[1].split(":");
			$("#StartHour" + i).val(btSect[0]);
			$("#StartMinute" + i).val(btSect[1]);
			$("#EndHour" + i).val(etSect[0]);
			$("#EndMinute" + i).val(etSect[1]);
			var mask = cfg.Mask[nWeek][i-1];
			if(mask & 1){
				$("#Normal" + i).prop("checked", true);
			}else{
				$("#Normal" + i).prop("checked", false);
			}
			if(mask & 4){
				$("#Motion" + i).prop("checked", true);
			}else{
				$("#Motion" + i).prop("checked", false);
			}
			if(mask & 2){
				$("#Alarm" + i).prop("checked", true);
			}else{
				$("#Alarm" + i).prop("checked", false);
			}
		}
		if(cfg.SnapMode == "ConfigSnap"){
			$("#AutoMode").prop("checked", true);
			EnableBox(1, "#SnapWeek_TABLE");
			EnableBox(1, "#SnapTimeSectBox");
		}else if(cfg.SnapMode == "ManualSnap"){
			$("#ManualMode").prop("checked", true);
			EnableBox(0, "#SnapWeek_TABLE");
			EnableBox(0, "#SnapTimeSectBox");
		}else{
			$("#ClosedMode").prop("checked", true);
			EnableBox(0, "#SnapWeek_TABLE");
			EnableBox(0, "#SnapTimeSectBox");
		}
		MasklayerHide();
	}
	function GetSnapCfg(nChn, nWeek, bChangeWeek){
		if(!bGet[nChn]){
			RfParamCall(function(a){
				SnapCfg[nChn] = a;
				var timeSection = SnapCfg[nChn][SnapCfg[nChn].Name].TimeSection;
				for(var i = 0; i < timeSection.length; i++){
					if(isObject(timeSection[i])){
						for(var j = 0; j < timeSection[i].length ; j++){
							if(timeSection[i][j] == ""){
								timeSection[i][j] = "0 00:00:00-00:00:00";
							}
						}
					}
				}
				SnapCfg[nChn][SnapCfg[nChn].Name].TimeSection = timeSection;
				bGet[nChn] = true;
				ShowData(nChn, nWeek, bChangeWeek);
			}, pageTitle, "Storage.Snapshot", nChn, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			ShowData(nChn, nWeek, bChangeWeek);
		}
	}
	function SaveSnapCfg(nChn, nWeek){
		if (nChn < 0 || nChn > gDevice.loginRsp.ChannelNum || nWeek < 0 || nWeek > 6){
			return false;
		}
		var cfg = SnapCfg[nChn][SnapCfg[nChn].Name];
		//cfg.PreSnap = $("#PreCapture").val() * 1;
		for(var i = 0; i < 4; i++){
			var ts = "";
			var j = i + 1;
			var TSCfg = cfg.TimeSection[nWeek][i];
			TSCfg = TSCfg.split(" ");
			ts += TSCfg[0];
			ts += " ";
			ts += GetTimeVal($("#StartHour" + j)) + ":" + GetTimeVal($("#StartMinute" + j)) + ":00-";
			ts += GetTimeVal($("#EndHour" + j)) + ":" + GetTimeVal($("#EndMinute" + j)) + ":00";
			cfg.TimeSection[nWeek][i] = ts;
			var nMask = 0x00;
			if($("#Normal" + j).prop("checked")){
				nMask |= 0x01 << 0;
			}
			if($("#Motion" + j).prop("checked")){
				nMask |= 0x01 << 2;
			}
			if($("#Alarm" + j).prop("checked")){
				nMask |= 0x01 << 1;
			}
			cfg.Mask[nWeek][i] = "0x" + toHex(nMask,8);
		}
		var Mode;
		if($("#AutoMode").prop("checked")){
			Mode = "ConfigSnap";
		}else if($("#ManualMode").prop("checked")){
			Mode = "ManualSnap";
		}else{
			Mode = "ClosedSnap";
		}
		cfg.SnapMode = Mode;
		return true;
	}
	function Init(){
		bCopy = false;
		copyCfg = null;
		var i;
		for (i = 0; i < gDevice.loginRsp.ChannelNum; i++) {
			bGet[i] = false;
			SnapCfg[i] = null;
		}
		var nChn = chnIndex == gDevice.loginRsp.ChannelNum ? 0 : chnIndex;
		var nWeek = weekIndex == 7 ? 0: weekIndex;
		GetSnapCfg(nChn, nWeek, false);
	}

	$(function () {
		if(gDevice.devType == devTypeEnum.DEV_IPC){
			$("#Snap_CHN_TABLE, #SnapCP, #SnapPA").css("display", "none");
		}
		if(gDevice.bGetDefault){
			$("#SnapDefault").css("display", "");
		}
		$(".recsect input").prop("maxlength", 2);
		$("#SnapChid").empty();
		var i;
		for (i = 0; i < gDevice.loginRsp.ChannelNum; i++) {
			bGet[i] = false;
			SnapCfg[i] = null;
			$("#SnapChid").append('<option class="option" value="' + i + '">' + gDevice.getChannelName(i) + '</option>');
		}
		if(gDevice.loginRsp.ChannelNum > 1){
			$("#SnapChid").append('<option class="option" value="' + i + '">' + lg.get("IDS_CFG_ALL") + '</option>');
		}
		var strWeek = [lg.get("IDS_WD_Sunday"), lg.get("IDS_WD_Monday"),lg.get("IDS_WD_Tuesday"),
		lg.get("IDS_WD_Wednesday"),lg.get("IDS_WD_Thursday"),lg.get("IDS_WD_Friday"),
		lg.get("IDS_WD_Saturday"), lg.get("IDS_CFG_ALL")];
		$("#SnapWeekChid").empty();
		for(i = 0; i < strWeek.length; i++){
			$("#SnapWeekChid").append('<option value="'+ i +'">'+ strWeek[i] +'</option>');
		}
		if(chnIndex == -1){
			chnIndex = 0;
			var d = new Date();
			weekIndex = d.getDay();
		}
		$("#SnapChid").val(chnIndex);
		$("#SnapWeekChid").val(weekIndex);
		$("input[name='a']").click(function(){
			var nIndex = chnIndex;
			if (chnIndex == gDevice.loginRsp.ChannelNum){
				nIndex = 0;
			}
			var cfg = SnapCfg[nIndex][SnapCfg[nIndex].Name];
			if($("#AutoMode").prop("checked")){
				EnableBox(1, "#SnapWeek_TABLE");
				EnableBox(1, "#SnapTimeSectBox");
				cfg.SnapMode = "ConfigSnap";
			}else{
				EnableBox(0, "#SnapWeek_TABLE");
				EnableBox(0, "#SnapTimeSectBox");
				if($("#ManualMode").prop("checked")){
					cfg.SnapMode = "ManualSnap"
				}else{
					cfg.SnapMode = "ClosedSnap"
				}
			}
		});
		$("#SnapWeekChid").change(function(){
			var nWeekChoose = $(this).val() * 1;
			var nChannel = chnIndex;
			if (chnIndex == gDevice.loginRsp.ChannelNum){
				nChannel = 0;
			}
			if (nWeekChoose == 7){
				GetSnapCfg(nChannel, 0, true);
				weekIndex = nWeekChoose;
			}else if (weekIndex == 7 ){
				GetSnapCfg(nChannel, nWeekChoose, true);
				weekIndex = nWeekChoose;
			}else{
				if (nWeekChoose != weekIndex){
					SaveSnapCfg(nChannel, weekIndex);
					GetSnapCfg(nChannel, nWeekChoose, true);
					weekIndex = nWeekChoose;
				}
			}
		});
		$("#SnapChid").change(function () {
			var nChannel = $(this).val() * 1;
			var nWeek = weekIndex;
			if(nWeek == 7){
				nWeek = 0;
			}
			if (nChannel == gDevice.loginRsp.ChannelNum){
				GetSnapCfg(0, nWeek, false);
				chnIndex = nChannel;
			}else if (chnIndex == gDevice.loginRsp.ChannelNum){
				GetSnapCfg(nChannel, nWeek, false);
				chnIndex = nChannel;
			}else{
				if (nChannel != chnIndex){
					SaveSnapCfg(chnIndex, nWeek);
					chnIndex = nChannel;
					GetSnapCfg(chnIndex, nWeek, false);
				}
			}
		});
		$("#SnapCP").click(function () {
			var nChn = $("#SnapChid").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum){
				nChn = 0;
			}
			var nWeek = $("#SnapWeekChid").val() * 1;
			if(nWeek == 7){
				nWeek = 0;
			}
			SaveSnapCfg(nChn, nWeek);
			copyCfg = cloneObj(SnapCfg[nChn]);
			bCopy = true;
			nCopyWeek = nWeek;
		});
		$("#SnapPA").click(function(){
			if(!bCopy) return;
			var cfg = copyCfg[copyCfg.Name];
			$("#PacketLength").val(cfg.PacketLength);
			$("#PreRecord").val(cfg.PreRecord);
			var tsCfg = cfg.TimeSection;
			for (var i = 1; i <= 4; ++i) {
				var sect = tsCfg[nCopyWeek][i - 1].split(" ");
				var tSect = sect[1].split("-");
				var btSect = tSect[0].split(":");
				var etSect = tSect[1].split(":");
				$("#StartHour" + i).val(btSect[0]);
				$("#StartMinute" + i).val(btSect[1]);
				$("#EndHour" + i).val(etSect[0]);
				$("#EndMinute" + i).val(etSect[1]);
				var mask = cfg.Mask[nCopyWeek][i-1];
				if(mask & 1){
					$("#Normal" + i).prop("checked", true);
				}else{
					$("#Normal" + i).prop("checked", false);
				}
				if(mask & 4){
					$("#Motion" + i).prop("checked", true);
				}else{
					$("#Motion" + i).prop("checked", false);
				}
				if(mask & 2){
					$("#Alarm" + i).prop("checked", true);
				}else{
					$("#Alarm" + i).prop("checked", false);
				}
			}
			if(cfg.SnapMode == "ConfigSnap"){
				$("#AutoMode").prop("checked", true);
				EnableBox(1, "#SnapWeek_TABLE");
				EnableBox(1, "#SnapTimeSectBox");
			}else if(cfg.SnapMode == "ManualSnap"){
				$("#ManualMode").prop("checked", true);
				EnableBox(0, "#SnapWeek_TABLE");
				EnableBox(0, "#SnapTimeSectBox");
			}else{
				$("#ClosedMode").prop("checked", true);
				EnableBox(0, "#SnapWeek_TABLE");
				EnableBox(0, "#SnapTimeSectBox");
			}
			var nWeek = $("#SnapWeekChid").val() * 1;
			if(nWeek == 7){
				nWeek = 0;
			}
			for(var i = 0; i < 4; i++){
				cfg.Mask[nWeek][i] = cfg.Mask[nCopyWeek][i];
				cfg.TimeSection[nWeek][i] = cfg.TimeSection[nCopyWeek][i];
			}
		});
		$("#SnapSave").click(function () {
			var nChn = $("#SnapChid").val() * 1;
			var nWeek = $("#SnapWeekChid").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum){
				var i;
				if(nWeek == 7){
					for(i = 0; i < 7; i++){
						SaveSnapCfg(0, i);
					}
				}else{
					SaveSnapCfg(0, nWeek);
				}
				if(gDevice.loginRsp.SoftWareVersion > "V2.62.R07" || gDevice.loginRsp.BuildTime > "2024-04-01"){
					SaveAllChnCfg();
				}else{
					for (i = 1; i < nChn; i++ ){
						if(bGet[i] && isObject(SnapCfg[i])){
							SnapCfg[i][SnapCfg[i].Name] = cloneObj(SnapCfg[0][SnapCfg[0].Name]);
						}else{
							var cfg = {};
							var cfgName = "Storage.Snapshot.[" + i + "]";
							cfg[cfgName] = cloneObj(SnapCfg[0][SnapCfg[0].Name]);
							cfg.Name = cfgName;
							SnapCfg[i] = cfg;
							bGet[i] = true;
						}
					}
					SaveChnCfg(0);
				}
			}else if(nChn != gDevice.loginRsp.ChannelNum && nWeek == 7){
				for ( i = 0; i < 7; i ++ ){
					SaveSnapCfg(nChn, i);
				}
				SaveChnCfg(0);
			}else{
				SaveSnapCfg(nChn, nWeek);
				SaveChnCfg(0);
			}	
		});
		$("#SnapRF").click(function () {
			Init();
		});
		$(".recsect input").keyup(function (){
			var tmp = $(this).val().replace(/\D/g,'');
			$(this).val(tmp);
			var i;
			var nSect;	//组别
			var nWitch;	//0开始时间小时. 1开始时间分钟 2结束时间小时. 3结束时间分钟
			var a = $("div[id^='secttime']");
			var b;
			for(i = 0; i < 4; i++){
				if(a.eq(i).prop("id") == $(this).parent().prop("id")){
					nSect = i;
					b = a.eq(i).find("input");
					break;
				}
			}
			for(i = 0; i < 4; i++){
				if(b.eq(i).prop("id") == $(this).prop("id")){
					nWitch = i;
					break;
				}
			}
			var bChange = false;	
			var timeArr = [b.eq(0).val() * 1, b.eq(1).val() * 1,
						   b.eq(2).val() * 1, b.eq(3).val() * 1];		
			if (0 == nWitch || 2 == nWitch){//小时检查
				if (timeArr[nWitch] > 24){
					timeArr[nWitch] = 24;
					bChange = true;
				}
			
				if (2 == nWitch && tmp == ""){
					timeArr[nWitch] = 24;
					bChange = true;
				}
			}else{//分钟检查
				if (timeArr[nWitch] > 59){
					timeArr[nWitch] = 59;
					bChange = true;
				}
			}
			if (timeArr[0] == 24){
				timeArr[1] = 0;
				bChange = true;
			}
			if (timeArr[2] == 24){
				timeArr[3] = 0;
				bChange = true;
			}	
			if (bChange){
				for(i = 0; i < 4; i++){
					if(i != nWitch){
						b.eq(i).val(timeArr[i] < 10 ? '0' + timeArr[i] : timeArr[i]);
					}else{
						if(tmp != ''){
							b.eq(i).val(timeArr[i]);
						}			
					}
				}
			}
		});
		$(".recsect input").blur(function (){
			var i;
			var nSect;
			var nWitch;
			var a = $("div[id^='secttime']");
			var b;
			for(i = 0; i < 4; i++){
				if(a.eq(i).prop("id") == $(this).parent().prop("id")){
					nSect = i;
					b = a.eq(i).find("input");
					break;
				}
			}
			for(i = 0; i < 4; i++){
				if(b.eq(i).prop("id") == $(this).prop("id")){
					nWitch = i;
					break;
				}
			}
			var timeArr = [b.eq(0).val() * 1, b.eq(1).val() * 1,
						   b.eq(2).val() * 1, b.eq(3).val() * 1];		
			if (0 == nWitch || 2 == nWitch){
				if (timeArr[2] < timeArr[0]){
					timeArr[2] = timeArr[0];
				}else if (timeArr[2] == timeArr[0]){
					if(timeArr[3] < timeArr[1]){
						timeArr[3] = timeArr[1];
					}
				}
			}else{
				if (timeArr[2] == timeArr[0] && timeArr[3] < timeArr[1]){
					timeArr[3] = timeArr[1];
				}
			}
			for(i = 0; i < 4; i++){
				b.eq(i).val(timeArr[i] < 10 ? '0' + timeArr[i] : timeArr[i]);
			}
		});
		$("#SnapDefault").click(function(){
			var nChn = chnIndex == gDevice.loginRsp.ChannelNum ? 0 : chnIndex;
			var nWeek = weekIndex == 7 ? 0: weekIndex;
			RfParamCall(function(a){
				SnapCfg[nChn] = a;
				var timeSection = SnapCfg[nChn][SnapCfg[nChn].Name].TimeSection;
				for(var i = 0; i < timeSection.length; i++){
					if(isObject(timeSection[i])){
						for(var j = 0; j < timeSection[i].length ; j++){
							if(timeSection[i][j] == ""){
								timeSection[i][j] = "0 00:00:00-00:00:00";
							}
						}
					}
				}
				SnapCfg[nChn][SnapCfg[nChn].Name].TimeSection = timeSection;
				bGet[nChn] = true;
				ShowData(nChn, nWeek, false);
			}, pageTitle, "Storage.Snapshot", nChn, WSMsgID.WsMsgID_DEFAULTCONFIG_GET);
		});
		Init()
	});
});
