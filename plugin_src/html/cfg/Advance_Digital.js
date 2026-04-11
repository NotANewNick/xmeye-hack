$(function() {
	var chnIndex = -1;
	var bGet = new Array;
	var listData = new Array;
	var ssRemoteDevice;
	var DecodeCfg;
	var DemodeParCfg;
	var TimeSynCfg;
	var pageTitle = $("#Advance_Digital").text();
	var bZoneTime = GetFunAbility(gDevice.Ability.OtherFunction.SupportTimeZone);
	var bSetcheck = true;
	var bDel = false;
	var bDemode = false;
	var bHideZone = false;
	var sLastMode;
	var nHavCheck = 1;
	var nDigChannel = gDevice.loginRsp.DigChannel;
	var RemoteObj = null;
	var selectRow = -1;
	var bSaveAll = false;
	var nCopyChn = -1;
	var s_DigTimeSynMaps = {
		"OFF": 0,
		"UTC": 1,
		"Local": 2,
		"T&Z": 3
	};

	function ShowData(nChn){
		if(nChn == nDigChannel){
			nChn = 0;
		}
		bSetcheck = true;
		bHideZone = false;
		var DigitChnInfo = ssRemoteDevice[ssRemoteDevice.Name][nChn];
		if (!bDel ){
			$("#DigitalSwitch").attr("data", DigitChnInfo.Enable ? 0 : 1);
			$("#DigitalSwitch").click();
			$("#CheckTime").attr("data", DigitChnInfo.EnCheckTime ? 1 : 0);
			var SynType = TimeSynCfg[TimeSynCfg.Name][nChn].TimeSyn;
			if (bZoneTime && s_DigTimeSynMaps[SynType] > 0){
				$("#CheckTime").attr("data", 1);
			}else if(bZoneTime && s_DigTimeSynMaps[SynType] == 0){
				$("#CheckTime").attr("data", 0);
			}
			$("#ConMode").val(DigitChnInfo.ConnType);
			sLastMode = DigitChnInfo.ConnType;
		}
		
		var nIndex = 0;
		if(!bGet[nChn]){
			listData[nChn] = [];
			if(DigitChnInfo.Decoder != null){
				for (var j = 0; j < DigitChnInfo.Decoder.length; j++){
					if (j >= 32) break;
					if (DigitChnInfo.Decoder[j].IPAddress == ""){
						continue;
					}
					var temp = {};
					temp.No = nIndex + 1;
					temp.Name = DigitChnInfo.Decoder[j].ConfName;
					temp.DevType = DigitChnInfo.Decoder[j].DevType;				
					temp.IP = DigitChnInfo.Decoder[j].IPAddress;
					temp.RemoteCh = DigitChnInfo.Decoder[j].Channel + 1;
					temp.Decoder = DigitChnInfo.Decoder[j];
					listData[nChn].push(temp);
					nIndex ++;
				}
			}
			bGet[nChn] = true;
			listDataCall(listData[nChn]);
		}else{
			listDataCall(listData[nChn]);
		}
		
		$("#TimeMode").prop("disabled", false);
		if (sLastMode == "MULTI"){
			if (!bDel ){ //删除时这些就不刷新了
				$("#SynChEn_Div").css("display", "none");
				$("#TourTimeDiv").css("display", "");
				$("#TourTime").val(DigitChnInfo.TourIntv);
			}
			for (var i = 0, nIndex = 0; i < listData[nChn].length; i++,nIndex++) {  //处理删除异常问题
				while (DigitChnInfo.Decoder[nIndex].IPAddress == ""){
					nIndex ++;
				}
				var CheckItem = "#listCheck" + i;
				$(CheckItem).prop("checked", DigitChnInfo.Decoder[nIndex].Enable);
				if (3 == s_DevType[DigitChnInfo.Decoder[nIndex].DevType] && $(CheckItem).prop("checked")){
					$("#TimeMode").prop("disabled", true);
					$("#TimeMode").val(3);
					bHideZone=true;
				}else{
					//$("#TimeMode").prop("disabled", false);
				}	
			}
		}else{
			if (!bDel){ //删除时这些就不刷新了
				$("#SynChEn_Div").css("display", "");
				$("#TourTimeDiv").css("display", "none");
				$("#SynChEn").attr("data", DigitChnInfo.SynchResolution ? 0 : 1);
			}
			if ( DigitChnInfo.SingleConnId > 0 ){
				var CheckItem = "#listCheck" + (DigitChnInfo.SingleConnId - 1);
				$(CheckItem).prop("checked", true);
				nHavCheck = 1;
				if (s_DevType[DigitChnInfo.Decoder[DigitChnInfo.SingleConnId-1].DevType]==3){
					$("#TimeMode").prop("disabled", true);
					$("#TimeMode").val(3);
					bHideZone=true;
				}
			}
		}
		bSetcheck = false;
		bDel = false;
		if (bDemode){
			var deleyTime = DemodeParCfg[DemodeParCfg.Name][nChn].deleyTimeMs;
			var DecDeleyTime = DecodeCfg.DecodeDeleyTime;
			if (deleyTime <= DecDeleyTime[0]){
				$("#Decode").val(0);
			} else if (deleyTime > DecDeleyTime[0] && deleyTime <= DecDeleyTime[1]){
				$("#Decode").val(1);
			} else if (deleyTime > DecDeleyTime[1] && deleyTime <= DecDeleyTime[2]){
				$("#Decode").val(2);
			} else if (deleyTime > DecDeleyTime[2] && deleyTime <= DecDeleyTime[3]){
				$("#Decode").val(3);
			} else if (deleyTime > DecDeleyTime[3] && deleyTime <= DecDeleyTime[4]){
				$("#Decode").val(4);
			} else if (deleyTime > DecDeleyTime[4] && deleyTime <= DecDeleyTime[5]){
				$("#Decode").val(5);
			} else if (deleyTime > DecDeleyTime[5] && deleyTime <= DecDeleyTime[6]){
				$("#Decode").val(6);
			}
		}
		if (bZoneTime){
			var SynType = TimeSynCfg[TimeSynCfg.Name][nChn].TimeSyn
			$("#TimeMode").val(s_DigTimeSynMaps[SynType]);
		}
		InitButton();
		MasklayerHide();
	}
	function listDataCall(data){
		selectRow = -1;
		var table = $("#DigitalTable")[0];
		var nClearRow = table.rows.length;
		var i;
		for (i = 0; i < nClearRow; ++i) {
			table.deleteRow(0);
		}
		for(i = 0; i < data.length; ++i) {
			var tr = table.insertRow(i);
			tr.classList.add("CustomDigitalClass");
			$(tr).attr("d", "not-active");
			var td1 = tr.insertCell(0);
			var td2 = tr.insertCell(1);
			var td3 = tr.insertCell(2);
			var td4 = tr.insertCell(3);
			var td5 = tr.insertCell(4);
			td1.innerHTML = '<input type="checkbox" id="listCheck'+i+'" onclick="NetListCheckCallBack(this, '+i+');"/><label>&nbsp;'+ (i + 1) +'</label>';
			td2.innerHTML = toHtmlEncode(data[i].Name);
			td3.innerHTML = toHtmlEncode(data[i].DevType);
			td4.innerHTML = toHtmlEncode(data[i].IP);
			td5.innerHTML = toHtmlEncode(data[i].RemoteCh);
		}
		var nHeight = $("#DigitalList .table-responsive").height()-$("#DigitalList .table-head").height();
		var nHeadPadding = data.length * 30 > nHeight ? TableRightPadding : 0;
		$("#DigitalList .table-head").css("padding-right", nHeadPadding+"px");
		$("#DigitalList .table-content").css("height", nHeight+'px');
		$(".CustomDigitalClass").dblclick(function(){
			var enable = $("#DigitalSwitch").attr("data") * 1 ? true : false;
			if(!enable){
				return;
			}
			var nIndex = $(this)[0].rowIndex;
			DoubleClick(nIndex, listData[chnIndex][nIndex]);
		});
		$(".CustomDigitalClass").click(function(){
			selectRow = $(this)[0].rowIndex;
			$(".CustomDigitalClass").attr("d", "not-active");
			$(this).attr("d", "active");
		});
	}
	function SaveChnData(nChn){
		var DigitChnInfo = ssRemoteDevice[ssRemoteDevice.Name][nChn];
		DigitChnInfo.Enable = $("#DigitalSwitch").attr("data") * 1 ? true : false;
		DigitChnInfo.EnCheckTime = $("#CheckTime").attr("data") * 1 ? true : false;
		if (bZoneTime && $("#TimeMode").val() * 1 == 0 ){
			DigitChnInfo.EnCheckTime = false;
		}else if (bZoneTime && $("#TimeMode").val() * 1 > 0)
		{
			DigitChnInfo.EnCheckTime = true;
		}
		
		DigitChnInfo.ConnType = $("#ConMode").val();
		if (bDemode){
			DemodeParCfg[DemodeParCfg.Name][nChn].deleyTimeMs = parseInt(DecodeCfg.DecodeDeleyTime[$("#Decode").val() * 1]);
		}
		if (bZoneTime){
			var SynType = $("#TimeMode").val() * 1;
			TimeSyn = "";
			if(SynType == 0){
				TimeSyn = "OFF";
			}else if(SynType == 1){
				TimeSyn = "UTC";
			}else if(SynType == 2){
				TimeSyn = "Local";
			}else if(SynType == 3){
				TimeSyn = "T&Z";
			}
			TimeSynCfg[TimeSynCfg.Name][nChn].TimeSyn = TimeSyn;
		}
		
		SaveNetConfig();  
		return true;
	}
	function SaveNetConfig(){
		var nChannel = chnIndex;
		if (chnIndex == nDigChannel){
			nChannel = 0;
		}
		var DigitChnInfo = ssRemoteDevice[ssRemoteDevice.Name][nChannel];
		if (sLastMode == "MULTI" ){
			for (var i = 0; i < listData[nChannel].length; i++){
				var itemCheck = "#listCheck" + i;
				DigitChnInfo.Decoder[i].Enable = $(itemCheck).prop("checked");
				DigitChnInfo.TourIntv = $("#TourTime").val() * 1;
			}
		}else{   //单连接
			DigitChnInfo.SynchResolution = $("#SynChEn").attr("data") * 1 ? false : true;
		}
	}
	function NetListCheck(el, nIndex){
		var nCurChn = $("#DigitalCh").val() * 1;
		if (nCurChn == nDigChannel){
			nCurChn = 0;
		}
		var DigitChnInfo = ssRemoteDevice[ssRemoteDevice.Name][nCurChn];
		if(sLastMode == "MULTI"){
			if (3 == s_DevType[DigitChnInfo.Decoder[nIndex].DevType]){
				if (!$(el).prop("checked")){
					$("#TimeMode").prop("disabled", false);
				}else if ($(el).prop("checked")){
					$("#TimeMode").prop("disabled", true);
					$("#TimeMode").val(3);
				}
			}else{
				//$("#TimeMode").prop("disabled", false);
			}
		}else{
			if($(el).prop("checked")){
				if (DigitChnInfo.SingleConnId > 0){
					$("#listCheck" + (DigitChnInfo.SingleConnId -1)).prop("checked", false);
				}
				DigitChnInfo.SingleConnId = "0x" + toHex((nIndex + 1), 8);  //暂时记录打钩的情况
				if (3 == s_DevType[DigitChnInfo.Decoder[nIndex].DevType]){
					$("#TimeMode").prop("disabled", true);
					$("#TimeMode").val(3);
				}else{
					$("#TimeMode").prop("disabled", false);
				}
			}else{
				DigitChnInfo.SingleConnId = "0x000000";
			}
		}
	}
	function SaveCfg(nIndex){
		if(nIndex < nDigChannel){
			var data = {
			"Name" : "NetWork.RemoteDeviceV3.[" + nIndex + "]"
			};
			if(bSaveAll){
				data[data.Name] = ssRemoteDevice[ssRemoteDevice.Name][0];
			}else{
				data[data.Name] = ssRemoteDevice[ssRemoteDevice.Name][nIndex];
			}
			RfParamCall(function(a){
				SaveCfg(nIndex + 1);
			}, pageTitle, "NetWork.RemoteDeviceV3", nIndex, WSMsgID.WsMsgID_CONFIG_SET, data);
		}else{
			if(bDemode){
				RfParamCall(function(a){
					if(bZoneTime){
						RfParamCall(function(a){
							ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
						},pageTitle, "NetWork.DigTimeSyn", -1, WSMsgID.WsMsgID_CONFIG_SET, TimeSynCfg);
					}else{
						ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
					}
				}, pageTitle, "Media.DecodeParam", -1, WSMsgID.WsMsgID_CONFIG_SET, DemodeParCfg);
			}else{
				if(bZoneTime){
					RfParamCall(function(a){
						ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
					},pageTitle, "NetWork.DigTimeSyn", -1, WSMsgID.WsMsgID_CONFIG_SET, TimeSynCfg);
				}else{
					ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
				}
			}
		}
	}
	function DoubleClick(nIndex, data){
		if(nIndex < 0) return;
		var dataCfg = {
			"NetConfig": data.Decoder,
			"Channel": nIndex
		}
		
		var nCurChn = $("#DigitalCh").val() * 1;
		if(nCurChn == nDigChannel){
			nCurChn = 0;
		}
		MasklayerShow(1);
		var _parent = "#Config_dialog .content_container";
		gVar.LoadChildConfigPage("Advance_Remote", "", _parent, function(){
			Config_Title.innerHTML = lg.get("IDS_REMOTE_CHANNEL");
			lan("Advance_Remote");				
			SetWndTop("#Config_dialog");
			$("#Config_dialog").css("width", '800px');
			$("#Config_dialog").show(500);
			RemoteObj = new Remote({
				SaveCallback: GetRemoteData
			});
			RemoteObj.InitRemote(nIndex, data.Decoder, false);	
		});		
	}
	function GetRemoteData(bAdd, nIndex, NetConfig){
		var nCurChn = $("#DigitalCh").val() * 1;
		if(nCurChn == nDigChannel){
			nCurChn = 0;
		}
		var CheckedArr = [];
		for(var i = 0; i < listData[nCurChn].length; i++){
			var checkBtn = "#listCheck" + i;
			if($(checkBtn).prop("checked")){
				CheckedArr.push(checkBtn);
			}
		}
		var data = {};
		if(bAdd){
			data.No = nIndex + 1;
		}else{
			data = listData[nCurChn][nIndex];
		}
		data.Name = NetConfig.ConfName;
		data.DevType = NetConfig.DevType;				
		data.IP = NetConfig.IPAddress;
		data.RemoteCh = NetConfig.Channel + 1;
		data.Decoder = NetConfig;
		var DigitChnInfo = ssRemoteDevice[ssRemoteDevice.Name][nCurChn];
		if(bAdd){
			listData[nCurChn].push(data);										
			if(DigitChnInfo.Decoder == null){
				DigitChnInfo.Decoder = [];
			}
			DigitChnInfo.Decoder.push(NetConfig);
		}else{
			DigitChnInfo.Decoder[nIndex] = NetConfig;
		}
		listDataCall(listData[nCurChn]);
		for(var i = 0; i < CheckedArr.length; i++){
			$(CheckedArr[i]).prop("checked", true);
		}	
		RemoteObj = null;
	}
	function Init(){
		nCopyChn = -1; 
		$("#DigitalCh").empty();
		var i;
		var dataHtml = "";
		for (i = 0; i < nDigChannel; i++) {
			bGet[i] = false;
			listData[i] = new Array;
			if(chnIndex == -1){
				chnIndex = i;
			}
			dataHtml += '<option value="' + i + '">' + gDevice.getChannelName(gDevice.loginRsp.VideoInChannel + i) + '</option>';
		}
		$("#DigitalCh").append(dataHtml);
		if(nDigChannel != 1){
			$("#DigitalCh").append('<option value="' + i + '">' + lg.get("IDS_CFG_ALL") + '</option>');
		}
		$("#DigitalCh").val(chnIndex);
		RfParamCall(function(a){
			DecodeCfg = a[a.Name];
			bDemode = true;
			RfParamCall(function(a){
				DemodeParCfg = a;
				var i;
				var decodeVal = '';
				$("#Decode").empty();
				for(i = 0; i < 2; i++){
					decodeVal = lg.get("IDS_DIG_REALPRIORITY") + (i + 1);
					$("#Decode").append('<option value="' + i + '">' + decodeVal + '</option>');
				}
				$("#Decode").append('<option value="2">' + lg.get("IDS_SSV_3") + '</option>');
				for(i = 0; i < 4; i++){
					decodeVal = lg.get("IDS_DIG_FLOWPRIORITY") + (i + 1);
					$("#Decode").append('<option value="' + (i + 3) + '">' + decodeVal + '</option>');
				}
				RfParamCall(function(a, b){
					ssRemoteDevice = a;
					if(bZoneTime){
						RfParamCall(function(a, b){
							if(a.Ret == 100){
								TimeSynCfg = a;
								$("#TimeMode_div").css("display", "");
								$("#CheckTime_Div").css("display", "none");
							}
							ShowData(chnIndex);
						}, pageTitle, "NetWork.DigTimeSyn", -1, WSMsgID.WsMsgID_CONFIG_GET);
					}else{
						ShowData(chnIndex);
					}
				}, pageTitle, "NetWork.RemoteDeviceV3", -1, WSMsgID.WsMsgID_CONFIG_GET);
			}, pageTitle, "Media.DecodeParam", -1, WSMsgID.WsMsgID_CONFIG_GET);	
		}, pageTitle, "DecodeDeleyTimePrame", -1, WSMsgID.WsMsgID_ABILITY_GET);
	}
	$(function () {
		var MaskDivH = $("#DigitalList").height();
		$("#DigitalListDiv .MaskDiv").css("height", MaskDivH + "px");
		$("#TimeMode").append('<option value="0">' + lg.get("IDS_DIG_OFF") + '</option>');
		$("#TimeMode").append('<option value="1">' + lg.get("IDS_DIG_UTC") + '</option>');
		$("#TimeMode").append('<option value="2">' + lg.get("IDS_DIG_LOCAL") + '</option>');
		$("#TimeMode").append('<option value="3">' + lg.get("IDS_DIG_ZONETIME") + '</option>');
		$("#ConMode").append('<option value="SINGLE">' + lg.get("IDS_DIG_SINGLELINK") + '</option>');
		if (!GetFunAbility(gDevice.Ability.OtherFunction.SupportWIFINVR)) {
			if (!(GetFunAbility(gDevice.Ability.OtherFunction.SupportConnMulti == false))) {
				$("#ConMode").append('<option value="MULTI">' + lg.get("IDS_DIG_MULLINK") + '</option>');
			}
		}
		if(nDigChannel == 1){
			$("DigitalCP, #DigitalPaste").css("display", "none");
		}
		if(gDevice.bGetDefault){
			$("#DigitalDe").css("display", "");
		}
		ChangeBtnState();
		NetListCheckCallBack = NetListCheck;
		$("#DigitalCh").change(function(){
			var nChannel = $(this).val() * 1;
			if (nDigChannel == nChannel){
				ShowData(0);
				chnIndex = nChannel;
			} else if (chnIndex == nDigChannel){
				ShowData(nChannel);
				chnIndex = nChannel;
			} else {
				if (nChannel != chnIndex ) {
					SaveChnData(chnIndex);  //先保存之前的数字通道
					ShowData(nChannel);
					chnIndex = nChannel;
					nHavCheck = 0;
				}
			}
		});
		$("#ConMode").click(function(){
			bSetcheck = true;
			var nCurChn = $("#DigitalCh").val() * 1;
			if (nCurChn == nDigChannel){
				nCurChn =0;
			}
			if ($("#ConMode").val() != sLastMode){
				SaveNetConfig();
				sLastMode = $("#ConMode").val();
			}
			var DigitChnInfo = ssRemoteDevice[ssRemoteDevice.Name][nCurChn];
			if (sLastMode == "MULTI"){
				$("#SynChEn_Div").css("display", "none");
				$("#TourTimeDiv").css("display", "");
				var nCount = listData[chnIndex].length;
				var HideZone = false;
				for (var i = 0; i < nCount; i++){
					var itemCheck = "#listCheck" + i;
					$(itemCheck).prop("checked", DigitChnInfo.Decoder[i].Enable);
					if (3 == s_DevType[DigitChnInfo.Decoder[i].DevType] && $(itemCheck).prop("checked")){		
						$("#TimeMode").prop("disabled", true);
						$("#TimeMode").val(3);
						HideZone=true;
					}
				}
				if (HideZone == false){
					$("#TimeMode").prop("disabled", false);
				}
				$("#TourTime").val(DigitChnInfo.TourIntv);
			}else {
				$("#SynChEn_Div").css("display", "");
				$("#TourTimeDiv").css("display", "none");
				var nCount = listData[chnIndex].length;
				var HideZone=false;
				for (var i = 0; i < nCount; i++)
				{
					var itemCheck = "#listCheck" + i;
					if (DigitChnInfo.SingleConnId == i + 1 ){
						$(itemCheck).prop("checked", true);
						if (3 == s_DevType[DigitChnInfo.Decoder[i].DevType]){
							$("#TimeMode").prop("disabled", true);
							$("#TimeMode").val(3);
							HideZone = true;
						}
					}else{
						$(itemCheck).prop("checked", false);
					}
				}
				if (!HideZone){
					$("#TimeMode").prop("disabled", false);
				}
				$("#SynChEn").attr("data", DigitChnInfo.SynchResolution ? 0 : 1);
			}
	
			bSetcheck = false;
		});
		$("#DigitalSwitch").click(function () {
			var _flag = $(this).attr("data") * 1;
			DivBox(_flag, "#DivBoxAll");
			EnableButton(_flag, "#DigitalAdd");
			EnableButton(_flag, "#DigitalDel");
			if(_flag){
				$("#DigitalListDiv .MaskDiv").css("display", "none");
			}else{
				$("#DigitalListDiv .MaskDiv").css("display", "block");
			}
		});
		$("#DigitalRf").click(function(){
			Init();
		});
		$("#DigitalSave").click(function(){
			var nChn = $("#DigitalCh").val() * 1;
			if(nChn == nDigChannel){
				SaveChnData(0);
				for(var i = 0; i < nDigChannel; i++){
					DemodeParCfg[DemodeParCfg.Name][i].deleyTimeMs = DemodeParCfg[DemodeParCfg.Name][0].deleyTimeMs;
					TimeSynCfg[TimeSynCfg.Name][i].TimeSyn = TimeSynCfg[TimeSynCfg.Name][0].TimeSyn;
				}
				bSaveAll = true;
				SaveCfg(0);
			}else{
				SaveChnData(nChn);
				SaveCfg(0);
			}
		});
		$("#DigitalDel").click(function(){
			if(selectRow < 0) {
				return;
			}
			bDel = true;
			var nCurChn = $("#DigitalCh").val() * 1;
			if(nCurChn == nDigChannel){
				nCurChn = 0;
			}
			var DigitChnInfo = ssRemoteDevice[ssRemoteDevice.Name][nCurChn];
			var data = listData[nCurChn];
			data.splice(selectRow, 1);
			if(data.length == 0){
				DigitChnInfo.Decoder = null;
			}else{
				DigitChnInfo.Decoder = [];
				if(sLastMode == "SINGLE"){
					if(DigitChnInfo.SingleConnId < data.length){
						DigitChnInfo.SingleConnId == "0x00000000";
					}
				}
				for(var i = 0; i < data.length; i++){
					if(i >= 32) break;
					DigitChnInfo.Decoder[i] = data[i].Decoder;
				}
			}
			ShowData(nCurChn);
		});
		$("#DigitalAdd").click(function(){
			var nCurChn = $("#DigitalCh").val() * 1;
			if(nCurChn == nDigChannel){
				nCurChn = 0;
			}
			
			var nCount = listData[nCurChn].length;
			if(nCount >= 20){
				ShowPaop(pageTitle, lg.get("IDS_REMOTE_EXCEEDMAXLINK"));
				return;
			}		
	
			MasklayerShow(1);
			var _parent = "#Config_dialog .content_container";
			gVar.LoadChildConfigPage("Advance_Remote", "", _parent, function(){
				Config_Title.innerHTML = lg.get("IDS_REMOTE_CHANNEL");
				lan("Advance_Remote");				
				SetWndTop("#Config_dialog");				
				$("#Config_dialog").css("width", '800px');
				$("#Config_dialog").show(500);
				RemoteObj = new Remote({
					SaveCallback: GetRemoteData
				});
				RemoteObj.InitRemote(nCount, null, true);	
			});	
		});
		$("#DigitalCP").click(function(){
			var nChn = chnIndex;
			if (nChn == nDigChannel){
				nChn = 0;
			}
			SaveChnData(nChn);  //先保存之前的数字通道
			nCopyChn = nChn;
		});
		$("#DigitalPaste").click(function(){
			if(nCopyChn == -1) return;
			var nChn = chnIndex;
			if (nChn == nDigChannel){
				nChn = 0;
				for(var i = 0; i < nDigChannel; i++){
					if(i == nCopyChn) continue;
					bGet[i] = false;
					ssRemoteDevice[ssRemoteDevice.Name][i] = cloneObj(ssRemoteDevice[ssRemoteDevice.Name][nCopyChn]);
					DemodeParCfg[DemodeParCfg.Name][i].deleyTimeMs = DemodeParCfg[DemodeParCfg.Name][nCopyChn].deleyTimeMs
					if(bZoneTime){
						TimeSynCfg[TimeSynCfg.Name][i].TimeSyn = TimeSynCfg[TimeSynCfg.Name][nCopyChn].TimeSyn;
					}
				}
			}else{
				bGet[nChn] = false;
				ssRemoteDevice[ssRemoteDevice.Name][nChn] = cloneObj(ssRemoteDevice[ssRemoteDevice.Name][nCopyChn]);
				DemodeParCfg[DemodeParCfg.Name][nChn].deleyTimeMs = DemodeParCfg[DemodeParCfg.Name][nCopyChn].deleyTimeMs
				if(bZoneTime){
					TimeSynCfg[TimeSynCfg.Name][nChn].TimeSyn = TimeSynCfg[TimeSynCfg.Name][nCopyChn].TimeSyn;
				}
			}
			ShowData(nChn);
		});
		$("#DigitalDe").click(function(){
			var nIndex = chnIndex == nDigChannel ? 0 : chnIndex;
			bGet[nIndex] = false;
			RfParamCall(function(a){
				DemodeParCfg[DemodeParCfg.Name][nIndex] = a[a.Name][nIndex];
				RfParamCall(function(a, b){
					ssRemoteDevice[ssRemoteDevice.Name][nIndex] = a[a.Name][nIndex];
					if(bZoneTime){
						RfParamCall(function(a, b){
							if(a.Ret == 100){
								TimeSynCfg[TimeSynCfg.Name][nIndex] = a[a.Name][nIndex];
							}
							ShowData(nIndex);
						}, pageTitle, "NetWork.DigTimeSyn", -1, WSMsgID.WsMsgID_DEFAULTCONFIG_GET);
					}else{
						ShowData(nIndex);
					}
				}, pageTitle, "NetWork.RemoteDeviceV3", -1, WSMsgID.WsMsgID_DEFAULTCONFIG_GET);
			}, pageTitle, "Media.DecodeParam", -1, WSMsgID.WsMsgID_DEFAULTCONFIG_GET);	
		});
		Init();
	});
});