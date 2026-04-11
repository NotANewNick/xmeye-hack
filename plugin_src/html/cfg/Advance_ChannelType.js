//# sourceURL=Advance_ChannelType.js
$(document).ready(function() {
	var ChnMode;
	var oldChnMode;
	var oldMode;
	var DAModeState;
	var oldDAModeState;
	var DAModeAbility;
	var nCheckItem;
	var bSupportChADMode = GetFunAbility(gDevice.Ability.EncodeFunction.CustomChnDAMode);
	var bReboot;
	var nCustomChnNum=0;
	var nCurClickChn = 0; 
	var nAnalogCount;
	var moduleNum = 1;
	var chanType=[];
	var bEnableModCus = false;
	var nFirstColumWidth = 70;
	var nOtherColumWidth = 105;
	var maxTableH = 210;
	var MaxPreviewNum;
	var bAutoCreateDestory = GetFunAbility(gDevice.Ability.OtherFunction.SupportAutoCreateDestory);
	var chanArry=[];
	var pageTitle = $("#Advance_ChannelType").text();
	var ChnModeType = [
		"AnalogCap1080N", "AnalogCap1080P", "AnalogCap12M", "AnalogCap3MChn", "AnalogCap3M_N", "AnalogCap4K", "AnalogCap4K_N", 
		"AnalogCap4M", "AnalogCap4M_N", "AnalogCap5MChn", "AnalogCap5M_N", "AnalogCap720N", "AnalogCap720P", "AnalogCap960H", 
		"AnalogCap960PChn", "AnalogCapCIF", "AnalogCapD1", "AnalogCapHD1", "AnalogCapWSVGA", "AnalogCapWUXGAChn", 
		"DigitalCap1080N","DigitalCap1080P", "DigitalCap12M", "DigitalCap3MChn", "DigitalCap3M_N", "DigitalCap4K", "DigitalCap4K_N", 
		"DigitalCap4M", "DigitalCap4M_N", "DigitalCap5MChn", "DigitalCap5M_N", "DigitalCap720N", "DigitalCap720P", "DigitalCap960H",
		"DigitalCap960PChn", "DigitalCapCIF", "DigitalCapD1","DigitalCapHD1", "DigitalCapWSVGA", "DigitalCapWUXGAChn"
	]; 
	// 模拟通道5M通用统一改为4K-N
	var chnModeName = [
		"1080N", "1080P", "12M", "3M", "3M-N", "4K", "4K-N", 
		"4M", "4M-N", "4K-N", "5M-N", "720N", "720P", "960H",
		"960P", "CIF", "D1", "HD1", "WSVGA", "WUXGA",
		"1080N", "1080P", "12M", "3M", "3M-N", "4K", "4K-N",
		"4M", "4M-N", "5M", "5M-N", "720N", "720P", "960H",
		"960P", "CIF", "D1", "HD1", "WSVGA", "WUXGA"
	];
	function ShowChannelNumTip(nSel){	
		var cfg = ChnMode[ChnMode.Name].TotalChnsMode[nSel];
		var PlayBlackNum = cfg.DigitalCapPlay;
		var nDefaultPlaybackNum = cfg.AnalogCapPlay;
		
		if (GetFunAbility(gDevice.Ability.OtherFunction.SupportMaxPlayback) && PlayBlackNum){
			$("#PlayBackMaxDiv").css("display", "");
			$("#PlayBackMax").text(PlayBlackNum);

			if ( nDefaultPlaybackNum == PlayBlackNum ){
				$("#DefaultPBMaxDiv").css("display", "none");
			}else{
				$("#DefaultPBMaxDiv").css("display", "");
				$("#DefaultPBMax").text(nDefaultPlaybackNum);
			}
			if(ChnMode[ChnMode.Name].TotalChnsModeNum >= 2){
				$("#ChnTipDiv").css("display", "");
			}else{
				$("#ChnTipDiv").css("display", "none");
			}
		}else{
			$("#ChnTipDiv").css("display", "none");
		}

		if(!bAutoCreateDestory){
			$("#PreviewMaxNum").text(chanArry[nSel]);
		}
	}
	function CheckChannelModule(nChm) {
		if ((nChm < 1)  || (nChm > nCustomChnNum)){
			return false;
		}

		var nChannel = nChm - 1;
		var abiCfg = DAModeAbility["ChnDAModeAbility"]["TotalCustomMode"][nCheckItem];
		if (0 == abiCfg.AnalogChnMax || 0 == abiCfg.DigitalChnMax){
			return false;
		}

		var bIsable = true;
		var i;
		if ((nChm > 1) && (nCustomChnNum != nChm)){
			if (chanType[nChannel - 1] != chanType[nChannel + 1]){
				bIsable = true;
			}else{
				bIsable = false;
			}
		}else{
			if (nCustomChnNum == 1){
				return true;
			}else if(nCustomChnNum  == nChm) {
				if (0 == chanType[nChannel - 1]) {
					bIsable = false;
				}else if(chanType[nChannel] != chanType[nChannel - 1]){
					bIsable = true;
				}else{
					for (i = nChm - 2; i > 1; i--){
						if (chanType[nChannel - 1] != chanType[i]){
							bIsable = false;
							break;
						}
					}
				}
			}else if (1 == nChm){
				if (1 == chanType[nChannel + 1]){
					bIsable = false;
				}else if (chanType[nChannel] != chanType[nChannel + 1]){
					bIsable = true;
				}else{
					for (i = nChm + 2; i < nCustomChnNum; i++){
						if (chanType[nChannel + 1] != chanType[i]){
							bIsable = false;
							break;
						}
					}
				}
			}
		}

		var nCount_A = 0;
		var nCount_D = 0;
		for (i = 0; i < nCustomChnNum; i++){
			if (1 == chanType[i]){
				nCount_A++;
			}else{
				nCount_D++;
			}
		}

		if (1 == chanType[nChannel] && nCount_D >= abiCfg.DigitalChnMax) {
			bIsable = false;
		}else if (0 == chanType[nChannel] && nCount_A >= abiCfg.AnalogChnMax) {
			bIsable = false;
		}

		return bIsable;
	}
	function RefushChannelMode(nChm) {
		if (0 >= nChm || nChm > 64){
			return ;
		}

		var bIsAble = CheckChannelModule(nChm);
		if (!bEnableModCus)
		{
			bIsAble = false;
		}
		
		var strState = "";
		var strAna = "A";
		if (GetFunAbility(gDevice.Ability.OtherFunction.SupportStringChangedXPOE)){
			strAna = "XPOE";
		}
		
		if(chanType[nChm - 1]){
			strState = strAna + nChm;
		}else{
			strState = "D" + (nChm - nAnalogCount);
		}
		$("#DAChan" + nChm).text(strState);
		
		if (bIsAble){//显示切换按钮
			var chanBtn = "#chanbt" + nChm;
			$("<div id='chanbt" + nChm + "' class = 'DAbtn' onclick='ChangeModeCallBack("
				+ nChm + ")'></div>").appendTo("#DAChan" + nChm);
			if (nCurClickChn != 0 && nCurClickChn != nChm){
				if(chanType[nChm - 1] == 0){
					$(chanBtn).addClass("Analog_Active");
				}else{
					$(chanBtn).addClass("Digital_Active");
				}
			}else{
				if(chanType[nChm - 1] == 0){
					$(chanBtn).addClass("Analog");
				}else{
					$(chanBtn).addClass("Digital");
				}
			}
		}
	}
	function RefushAllChannelMode(){
		nAnalogCount = 0;
		var i;
		for (i = 0; i < nCustomChnNum; i++){
			if (1 == chanType[i]){
				nAnalogCount++;
			}
		}
		for (i = 0; i < nCustomChnNum; i++){
			RefushChannelMode(i+1);
		}
	}
	function SetChannelMode(mode){
		var bkWidth = 500;
		var bkHeight = 250;
		$("#ChnDATab").empty();
		var _width,_height,i,j;
		switch(mode){
		case 1:	
		case 2:
		case 3:
			_width = parseInt(bkWidth/mode)-1;
			_height = bkHeight - 1;
			var htmlList = '<tr>';
			for (i = 0; i < mode; i++){
				htmlList += '<td><div class="DAChanDisplay" id="DAChan' + (i + 1) + 
				'"></div></td>';
			}
			htmlList += '</tr>';
			$("#ChnDATab").append(htmlList);
			$(".DAChanDisplay").css("width", _width)
				.css("height", _height)
				.css("line-height", _height+'px');
			break;
		case 6:
			_width = parseInt(bkWidth/3)-1;
			_height = parseInt(bkHeight/3)-1;
			var htmlList = '<tr>';
			htmlList += '<td colspan="2" rowspan="2" style="border-right:1px solid #C2C9D1;"><div class="DAChanDisplay" id="DAChan1"></div></td>';
			htmlList += '<td><div class="DAChanDisplay" id="DAChan2"></div></td>';
			htmlList += '</tr>';
			$("#ChnDATab").append(htmlList);
			htmlList = '<tr><td><div class="DAChanDisplay" id="DAChan3"></div></td></tr>';
			$("#ChnDATab").append(htmlList);
			
			htmlList = '<tr>';
			htmlList += '<td><div class="DAChanDisplay" id="DAChan6"></div></td>';
			htmlList += '<td><div class="DAChanDisplay" id="DAChan5"></div></td>';
			htmlList += '<td><div class="DAChanDisplay" id="DAChan4"></div></td>';
			htmlList += '</tr>';
			$("#ChnDATab").append(htmlList);
			
			$(".DAChanDisplay[id!='DAChan1']").css("width", _width)
				.css("height", _height)
				.css("line-height", _height+'px');
			$("#DAChan1").css("line-height", 2*_height+'px');
			break;
		case 8:
			_width = parseInt(bkWidth/4)-1;
			_height = parseInt(bkHeight/4)-1;
			var htmlList = '<tr>';
			htmlList += '<td colspan="3" rowspan="3" style="border-right:1px solid #C2C9D1;"><div class="DAChanDisplay" id="DAChan1"></div></td>';
			htmlList += '<td><div class="DAChanDisplay" id="DAChan2"></div></td>';
			htmlList += '</tr>';
			$("#ChnDATab").append(htmlList);
			htmlList = '<tr><td><div class="DAChanDisplay" id="DAChan3"></div></td></tr>';
			$("#ChnDATab").append(htmlList);
			htmlList = '<tr><td><div class="DAChanDisplay" id="DAChan4"></div></td></tr>';
			$("#ChnDATab").append(htmlList);
			
			htmlList = '<tr>';
			htmlList += '<td><div class="DAChanDisplay" id="DAChan8"></div></td>';
			htmlList += '<td><div class="DAChanDisplay" id="DAChan7"></div></td>';
			htmlList += '<td><div class="DAChanDisplay" id="DAChan6"></div></td>';
			htmlList += '<td><div class="DAChanDisplay" id="DAChan5"></div></td>';
			htmlList += '</tr>';
			$("#ChnDATab").append(htmlList);

			$(".DAChanDisplay[id!='DAChan1']").css("width", _width)
				.css("height", _height)
				.css("line-height", _height+'px');
				
			$("#DAChan1").css("line-height", 3*_height+'px');
			break;
		case 4:
		case 9:
		case 10:
		case 12:
		case 16:
		case 20:
		case 24:
		case 25:
		case 32:
		case 64:
			var rowNum, colNum;
			if(mode == 12){
				rowNum = 3;
				colNum = 4;
			}else if(mode == 20){
				rowNum = 4;
				colNum = 5;
			}else if(mode == 24){
				rowNum = colNum = 5;
			}else if(mode == 32){
				rowNum = colNum = 6;
			}else{
				rowNum = colNum = Math.sqrt(mode);
			}
			_width = parseInt(bkWidth/colNum) - 1;
			_height = parseInt(bkHeight/rowNum) - 1;
			for(i = 0; i < rowNum; i++){
				var htmlList = '<tr>';
				for(j = 0; j < colNum; j++){
					if (i * colNum + j > mode - 1){
						htmlList += '<td colspan="' + (colNum -j) + '"></td>';
						break;
					}			
					htmlList += '<td><div class="DAChanDisplay" id="DAChan' + 
					(i * colNum + j + 1) + '"></div></td>';
				}
				htmlList += '</tr>';
				$("#ChnDATab").append(htmlList);
			}
			$(".DAChanDisplay").css("width", _width)
				.css("height", _height)
				.css("line-height", _height+'px');
			break;
		}
		var tableH = $("#ChnDATab").height();
		$("#ModuleView .MaskDiv").css("height", tableH + 'px')
	}
	function CheckCustomRadio(nChnNum){
		if ((1 > nChnNum) || (64 < nChnNum)){
			return;
		}
		nCurClickChn = 0;
		nCustomChnNum = nChnNum;
		SetChannelMode(nChnNum);
		chanType = [];
		var stateCfg = oldDAModeState[oldDAModeState.Name];
		if (nCheckItem == ChnMode[ChnMode.Name].CurChnsMode && nCustomChnNum == stateCfg.ChnTotalNum
		&& stateCfg.UseCustomMode){
			for (var i = 0; i < nCustomChnNum; i++){
				if (stateCfg.ChnMode & (1 << i)) {
					chanType[i] = 1;
				}else{
					chanType[i] = 0;
				}
			}
		}else{
			var mode = DAModeAbility["ChnDAModeAbility"]["TotalCustomMode"][nCheckItem];
			for (var i = 0; i < nCustomChnNum; i++){
				if (i < mode.AnalogChnMax){
					chanType[i] = 1;
				}else{
					chanType[i] = 0;
				}
			}
		}
		RefushAllChannelMode();
	}
	function SetChannelView(){
		var CustomMode = DAModeAbility["ChnDAModeAbility"]["TotalCustomMode"][nCheckItem];
		$("#ModuleChan").empty();
		bEnableModCus = false;
		var i;
		for(i = 0; i < CustomMode.TotalChnMax; i++){
			if(CustomMode.SplitMsk & (1 << i)){
				$("<span><input id='radid" + (i + 1) + "' name='rad' type='radio' onclick='clkRaCallBack("
				+ (i + 1) + ")'><label for='radid" + (i + 1) + "' >" + (i + 1) + "</label></span>").appendTo("#ModuleChan");
				bEnableModCus = true;
			}
		}
		
		if(!bEnableModCus){
			$("#DABox").css("display", "none");
		}else{
			$("#DABox").css("display", "");
		}
		var inputs = $("#ModuleChan").find("input");
		moduleNum = inputs.length ;
		var _count = 0;
		for(i = moduleNum - 1; i >= 0; i--){
			if (2 > _count){
				_count++;
			}else{
				$(inputs[i]).prop("disabled", true);
			}
		}
	}
	function UpdateCustomItems(){
		var nChkCustom = false;
		SetChannelView();
		if(nCheckItem == oldChnMode[oldChnMode.Name].CurChnsMode && oldDAModeState[oldDAModeState.Name].UseCustomMode){
			nChkCustom = DAModeState[DAModeState.Name].UseCustomMode ? true : false;
			var radbtn = "#radid" + DAModeState[DAModeState.Name].ChnTotalNum;
			$(radbtn).prop("checked", true);
			CheckCustomRadio(DAModeState[DAModeState.Name].ChnTotalNum);
		}else{
			var inputs = $("#ModuleChan").find("input");
			if(inputs.length >= 1){
				$(inputs[inputs.length - 1]).prop("checked", false);
				$(inputs[inputs.length - 1]).click();
			}
		}

		$("#ModuleCustom").prop("checked", !nChkCustom);
		$("#ModuleCustom").click();
	}
	function ShowDAMode(){
		if(!bSupportChADMode){
			$("#DABox").css("display", "none");
		}else{
			$("#DABox").css("display", "");
			UpdateCustomItems();
		}
	}
	function CheckMode(nSel){
		$(".CustomChnTypeClass").each(function(){
			if (nSel == $(this).prop("value") *1) {
				$(this).prop("checked", true);
			}else {
				$(this).prop("checked", false);
			}
		});
		nCheckItem = nSel;
		ShowDAMode();
	}
	function ShowMode(){
		if(bAutoCreateDestory){
			$("#PreviewMaxTipDiv").css("display", "none");
			$("#PreviewMaxDiv").css("display", "");
		}else{
			$("#PreviewMaxTipDiv").css("display", "");
			$("#PreviewMaxDiv").css("display", "none");
		}
		var modes = new Array();
		var bZeros = new Array();
		var AnalogCol = 0;
		var DigitalCol = 0;
		var curMode;
		var i, j;
		for (i = 0; i < ChnMode[ChnMode.Name].TotalChnsModeNum; i++) {
			curMode = ChnMode[ChnMode.Name].TotalChnsMode[i];		
			for (j = 0; j < ChnModeType.length; j++){
				if(!bZeros[j]){
					if (curMode[ChnModeType[j]] > 0) {
						bZeros[j] = 1;
					}
				}
			}
		}
		var temp;
		for (j = 0; j < ChnModeType.length; j++){
			if(bZeros[j]){
				if(ChnModeType[j].indexOf("Analog") != -1){
					AnalogCol++;
				}else{
					DigitalCol++;
				}
				temp = {};
				temp.Type = ChnModeType[j];
				temp.Name = chnModeName[j];
				modes.push(temp);
			}
		}
		var rowData = [];
		for (i = 0; i < ChnMode[ChnMode.Name].TotalChnsModeNum; i++) {
			curMode = ChnMode[ChnMode.Name].TotalChnsMode[i];
			var tempRow = {};
			chanArry[i] = 0;
			for(var n = 0; n < modes.length; n++){
				tempRow[modes[n].Type] = curMode[modes[n].Type] == 0 ? '.' : curMode[modes[n].Type];
				chanArry[i] += curMode[modes[n].Type];
			}
			rowData.push(tempRow);
		}

		var secondHeadCol = [];
		for(i = 0; i < modes.length; i++){
			var tempCol = { Name: modes[i].Name, Type: modes[i].Type };
			secondHeadCol.push(tempCol);
		}
	
		var firstHeadCol = [];
		var tempCol = {};
		if(AnalogCol > 0){
			var strLocal = lg.get("IDS_MODE_LOCAL");
			if (GetFunAbility(gDevice.Ability.OtherFunction.SupportStringChangedXPOE)){
				strLocal = lg.get("IDS_MODE_XPOE");
			}
			tempCol.Name = strLocal;
			tempCol.Width = AnalogCol * nOtherColumWidth + nFirstColumWidth;
			firstHeadCol.push(tempCol);
			if(DigitalCol > 0){
				tempCol = {};
				tempCol.Name = lg.get("IDS_MODE_NET");
				tempCol.Width = DigitalCol * nOtherColumWidth;
				firstHeadCol.push(tempCol);
			}
		}else{
			tempCol.Name = lg.get("IDS_MODE_NET");
			tempCol.Width = DigitalCol * nOtherColumWidth;
			firstHeadCol.push(tempCol);
		}
		
		//动态生成表格
		$("#firstHeadTable, #secondHeadTable, #ChanTypeTable").html('');
		var headColGroupHtml = '<colgroup>';
		var headTheadHtml = '<thead><tr>';
		for (i = 0; i < firstHeadCol.length; i++) {
			headColGroupHtml += '<col style="width:'+ firstHeadCol[i].Width +'px">';
			headTheadHtml += '<th>'+ firstHeadCol[i].Name +'</th>';
		}
		headColGroupHtml += '</colgroup>';
		headTheadHtml += '</tr></thead>';
		$("#firstHeadTable").html(headColGroupHtml + headTheadHtml);

		headColGroupHtml = '<colgroup><col style="width:'+nFirstColumWidth+'px">';
		headTheadHtml = '<thead class="secondHead"><tr><th></th>';
		for (i = 0; i < secondHeadCol.length; i++) {
			headColGroupHtml += '<col style="width:'+ nOtherColumWidth +'px">';
			headTheadHtml += '<th>'+ secondHeadCol[i].Name +'</th>';
		}
		headColGroupHtml += '</colgroup>';
		headTheadHtml += '</tr></thead>';
		$("#secondHeadTable").html(headColGroupHtml + headTheadHtml);

		var contentTbodyHtml = '<tbody>';
		for (i = 0; i < rowData.length; i++) {
			contentTbodyHtml += '<tr d="not-active">';
			contentTbodyHtml += '<td><input class="CustomChnTypeClass" value="'+i+'" type="checkbox"/></td>';
			for (var j = 0; j < secondHeadCol.length; j++) {
				contentTbodyHtml += '<td>'+ rowData[i][secondHeadCol[j].Type] +'</td>';
			}
			contentTbodyHtml += '</tr>';
		}
		contentTbodyHtml += '</tbody>';
		$("#ChanTypeTable").html(headColGroupHtml + contentTbodyHtml);
		
		//根据列数调整表格宽度
		$("#ChanTypeList").css("width", secondHeadCol.length * nOtherColumWidth + nFirstColumWidth + "px");
		
		var nHeadPadding = 0;
		var nHeight = maxTableH - $("#ChanTypeList .table-head").height()*2;
		if(rowData.length * 30 > nHeight){
			nHeadPadding = TableRightPadding;
			$("#ChanTypeList .table-content").css("height", nHeight+'px');
			$("#ChanTypeList").css("height", maxTableH + 'px');
		}else{
			nHeight = rowData.length * 30;
			var tableH = $("#ChanTypeList .table-head").height()*2 + nHeight;
			$("#ChanTypeList .table-content").css("height", nHeight+'px');			
			$("#ChanTypeList").css("height", tableH + 'px');
			$("#ChanTypeList .table-responsive").css("border-bottom", "none");
		}
		$("#ChanTypeList .table-head").css("padding-right", nHeadPadding+"px");
		
		$(".CustomChnTypeClass").click(function(){
			var bCheck = $(this).prop("checked");
			var nSel = $(this).prop("value") *1;
			if (nSel == nCheckItem) {
				$(this).prop("checked", true);
			}else {
				CheckMode(nSel);
			}
		});
		
		$("#ChanTypeTable tr").click(function(){
			var nSel = $(this)[0].rowIndex;
			$("#ChanTypeTable tr").attr("d", "not-active");
			$(this).attr("d", "active");
			ShowChannelNumTip(nSel);		
		});

		oldMode = ChnMode[ChnMode.Name].CurChnsMode;
		nCheckItem = oldMode;
		ShowChannelNumTip(nCheckItem);
		ShowDAMode();
		CheckMode(nCheckItem);
		if(bAutoCreateDestory){
			$("#PreviewMaxChannel").empty();
			var SupportChannel = MaxPreviewNum[MaxPreviewNum.Name].SupportChannel;
			var nIndex = 0;
			for(i = 0; i < SupportChannel.length; i++){
				$("#PreviewMaxChannel").append('<option value="' + i + '">' + SupportChannel[i] + '</option>');
				if(MaxPreviewNum[MaxPreviewNum.Name].PreviewNum == SupportChannel[i]){
					nIndex = i;
				}
			}

			// 若遍历完列表后都没有找到对应的最大支持数量，则需要从大往小比较，取最接近PreviewNum的最大支持数量
			if(SupportChannel[nIndex] != MaxPreviewNum[MaxPreviewNum.Name].PreviewNum)
			{
				for(var i = SupportChannel.length - 1; i >= 0; i--)
				{
					if(SupportChannel[i] < MaxPreviewNum[MaxPreviewNum.Name].PreviewNum)
					{
						nIndex = i;
						break;
					}
				}
			}

			$("#PreviewMaxChannel").val(nIndex);
		}
	}
	function ChangeMode(nChm){
		if (nChm < 1 || nChm > nCustomChnNum){
			return ;
		}
		nCurClickChn = nChm;
		chanType[nChm - 1] = 1 - chanType[nChm - 1];
		RefushAllChannelMode();
	}
	function InitMode(){
		RfParamCall(function(a){
			ChnMode = a;
			oldChnMode = cloneObj(ChnMode);
			if(ChnMode[ChnMode.Name].TotalChnsModeNum >= 2){
				bAutoCreateDestory = false;
			}
			if(bSupportChADMode){
				RfParamCall(function(a){
					DAModeState = a;
					oldDAModeState = cloneObj(a);
					RfParamCall(function(a){
						DAModeAbility = a;
						ShowMode();
						MasklayerHide();
					}, pageTitle, "ChnDAModeAbility", -1, WSMsgID.WsMsgID_ABILITY_GET);
				}, pageTitle, "AVEnc.ChnDAModeState", -1, WSMsgID.WsMsgID_CONFIG_GET);
			}else{
				if(bAutoCreateDestory){
					RfParamCall(function(a){
						MaxPreviewNum = a;
						ShowMode();
					}, pageTitle, "fVideo.MaxPreviewNum", -1, WSMsgID.WsMsgID_CONFIG_GET);
				}else{
					ShowMode();
				}
				MasklayerHide();
			}
		}, pageTitle, "NetWork.ChnMode", -1, WSMsgID.WsMsgID_CONFIG_GET);
	}
	function SaveModeData(){
		var cfg = DAModeState[DAModeState.Name];
		if(bEnableModCus){
			cfg.UseCustomMode = $("#ModuleCustom").prop("checked");
			cfg.ChnTotalNum = nCustomChnNum;
			var nArr = [0x00, 0x00];
			for (var i = 0; i < 32; i++){	////目前只处理前32路		
				if(i >= cfg.ChnTotalNum){
					break;
				}
				var m = parseInt(i/16);
				var n = i % 16;
				nArr[m] |= chanType[i] << n;
			}
			cfg.ChnMode = "0x"+toHex(nArr[1], 4) + toHex(nArr[0], 4);
		}else{
			cfg.UseCustomMode = false;
			cfg.ChnTotalNum = 1;
			cfg.ChnMode = "0x00000000";
		}
	}
	$(function () {
		$("#ModeRf").click(function (){
			InitMode();
		});
		$("#ModuleCustom").click(function (){
			var enable = !$(this).prop("checked");
			var inputs = $("#ModuleChan").find("input");
			$(inputs[moduleNum - 1]).prop("disabled", enable);
			$(inputs[moduleNum - 2]).prop("disabled", enable);
			$("#ModuleView .DAbtn").prop("disabled", enable);
			
			if(enable){
				$("#ModuleChan, #ModuleView").stop().fadeTo("slow", 0.5);
				$("#ModuleView .MaskDiv").css("display", "block");
			}else{
				$("#ModuleChan, #ModuleView").stop().fadeTo("slow", 1);
				$("#ModuleView .MaskDiv").css("display", "none");
			}
		});
		$("#ModeSave").click(function (){
			var bSave = false;
			if(bSupportChADMode){
				SaveModeData();
				var cfg = DAModeState[DAModeState.Name], oldCfg = oldDAModeState[oldDAModeState.Name];
				if(cfg.UseCustomMode == oldCfg.UseCustomMode ){
					if(oldCfg.UseCustomMode){
						if(cfg.ChnTotalNum != oldCfg.ChnTotalNum || parseInt(cfg.ChnMode) != parseInt(oldCfg.ChnMode)){
							bSave = true;
						}
					}else{
						bSave = false;
					}
				}else {
					bSave = true;
				}
			}

			var bSaveAuto = false;
			if(bAutoCreateDestory){
				var nSel = $("#PreviewMaxChannel").val() * 1;
				var SupportChannel = MaxPreviewNum[MaxPreviewNum.Name].SupportChannel;
				if(MaxPreviewNum[MaxPreviewNum.Name].PreviewNum != SupportChannel[nSel]){
					MaxPreviewNum[MaxPreviewNum.Name].PreviewNum = SupportChannel[nSel];
					MaxPreviewNum[MaxPreviewNum.Name].SupportChannel = [];
					bSaveAuto = true;
				}
			}
			if(nCheckItem == ChnMode["NetWork.ChnMode"].CurChnsMode){
				if((bSupportChADMode && !bSave) || (bAutoCreateDestory && !bSaveAuto)){
					ShowPaop(pageTitle, lg.get("IDS_MODE_NOCHANGE"));
					return;
				}
			}
			ChnMode["NetWork.ChnMode"].CurChnsMode = nCheckItem;
			RfParamCall(function(a){
				if(a.Ret == 603){
					bReboot = true;
				}
				if(bSupportChADMode){
					RfParamCall(function(a){
						if(a.Ret == 603){
							bReboot = true;
						}
						if(!bReboot){
							ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
						}else {
							RebootDev(pageTitle, lg.get("IDS_CONFIRM_RESTART"), false);
						}
					}, pageTitle, "AVEnc.ChnDAModeState", -1, WSMsgID.WsMsgID_CONFIG_SET, DAModeState);
				}else{
					if(bAutoCreateDestory && bSaveAuto){
						RfParamCall(function(a){
							if(a.Ret == 100){
								ShowPaop(pageTitle, lg.get("IDS_ELECT_SUCCESS"));
								window.setTimeout(function() {
									AutoClose(pageTitle)
								}, 1000);
							}else{
								if(a.Ret == 603){
									bReboot = true;
								}
								if(!bReboot){
									ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
								}else {
									RebootDev(pageTitle, lg.get("IDS_CONFIRM_RESTART"), false);
								}
							}
						}, pageTitle, "fVideo.MaxPreviewNum", -1, WSMsgID.WsMsgID_CONFIG_SET, MaxPreviewNum);
					}else{
						if(!bReboot){
							ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
						}else {
							RebootDev(pageTitle, lg.get("IDS_CONFIRM_RESTART"), false);
						}
					}
				}
			}, pageTitle, "NetWork.ChnMode", -1, WSMsgID.WsMsgID_CONFIG_SET, ChnMode);
		});
		clkRaCallBack = CheckCustomRadio;
		ChangeModeCallBack = ChangeMode;
		InitMode();
    });
});