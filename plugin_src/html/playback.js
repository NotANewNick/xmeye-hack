//# sourceURL=playback.js
$(function(){
	var color = gVar.skin_mColor;
	var bColor = gVar.skin_bColor;
	var pageTitle = lg.get("IDS_REPLAY");
	var m_timeLineCtrl = null;
	var queryChArr = [];
	var queryParam = {};
	var recordData = [];
	var playFileArr = [];
	var downloadFileArr = [];
	var nCurPage = -1;
	var nGetPage = 0;
	var m_nPlayStyle = PlayBackType.PBK_TYPE_LOCAL;
	var bSupportMultiChn = false;
	var nBarHeight = 20 + 20 + 10;
	var contentH = 0;
	var nRecType = 0;
	var nSelectWnd = 0;
	var bDownloading = false;
	var bSettingPos = false;
	var viewsNum = 1;
	var views = [];
	var sAlarm = {
		"*": 0xff,
		"R": 0x00,    ///< 普通文件(R)
		"A": 0x01,    ///< 外部报警(A)
		"M": 0x02,    ///< 动态检测(M)
		"H": 0x04    ///< 手动录像(H)
	}
	var downloadByTime = {};
	if(gDevice.loginRsp.ChannelNum > 1){
		bSupportMultiChn = true;
		viewsNum = 4;
	}
	function playbackSetTipText(){
		$("#pbBtnPlay").attr("title", lg.get("IDS_LIVE_Play"));
		$("#pbBtnPause").attr("title", lg.get("IDS_PBK_Pause"));
		$("#pbBtnStop").attr("title", lg.get("IDS_REC_STOP"));
		$("#pbBtnSlow").attr("title", lg.get("IDS_PBK_Slow"));
		$("#pbBtnFast").attr("title", lg.get("IDS_PBK_Fast"));
		$("#pbBtnPreFrame").attr("title", lg.get("IDS_PBK_PrevFrame"));
		$("#pbBtnNextFrame").attr("title", lg.get("IDS_PBK_NextFrame"));
		$("#pbBtnRecord").attr("title", lg.get("IDS_LIVE_Record"));
		$("#pbBtnSnap").attr("title", lg.get("IDS_LocalCapture"));
		$("#pbBtnAudio").attr("title", lg.get("IDS_LIVE_Audio"));
		$("#pbBtnZoom").attr("title", lg.get("IDS_PBK_Region"));
	}
	function hasRecord(wnd, time){
		var bHas = false;
		for(var j =0;j < recordData[wnd].length;j++){
			var sSec = parseInt(recordData[wnd][j].Begin * 60);
			var eSec = parseInt(recordData[wnd][j].End * 60);
			var stime = time.split(":");
			var curSec = parseInt(stime[0])*60*60+parseInt(stime[1])*60+parseInt(stime[2]);
			if(curSec >= sSec && curSec < eSec){
				bHas = true;
				break;
			}else if(sSec > curSec){
				break;
			}
		}
		return bHas;
	}
	
	function bRecordEnd(wnd, time){
		var bEnd = false;
		var stime = time.split(":");
		var curSec = parseInt(stime[0])*60*60+parseInt(stime[1])*60+parseInt(stime[2]);
		var nEndIndex = recordData[wnd].length - 1;
		if(nEndIndex >= 0){
			var eSec = parseInt(recordData[wnd][nEndIndex].End * 60);
			if(curSec >= eSec){
				bEnd = true;
			}
		}
		return bEnd;
	}
	
	function GetChannelWnd(chn){
		var wnd = 0;
		if(m_nPlayStyle == PlayBackType.PBK_TYPE_LOCAL){
			wnd = chn;
		}else{
			for(var i = 0; i < queryChArr.length; i++){
				if(queryChArr[i] == chn){
					wnd = i;
				}
			}
		}
		return wnd;
	}
	function ResetView(wnd){
		views[wnd] = {
			"Status": PlayStatus.StatusNoPlay,
			"Zoom": false, 
			"Record":false,
			"Audio": false
		}
	}
	function InitViews(){
		for(var i = 0; i < viewsNum; i++){
			ResetView(i);
		}
	}
	function SetViewStatus(wnd){
		if(views[wnd].Record){
			$("#pbBtnRecord").RSButton("setStatus", RSBtnStatus.Pressed);
		}
		if(views[wnd].Zoom){
			$("#pbBtnZoom").RSButton("setStatus", RSBtnStatus.Pressed);
		}
		if(views[wnd].Audio){
			$("#pbBtnAudio").RSButton("setStatus", RSBtnStatus.Pressed);
		}
	}
	function ResizeTable(){
		contentH = $("#FileList .table-responsive").height()-$("#FileList .table-head").height();
		$("#FileList .table-content").css("height", contentH+'px');
	}
	function ShowTimeLine(bShow){
		if (bShow) {
			$("#playbackOcx").css("bottom", (nBarHeight+65)+"px");
			$("#pbControlBtn_Box").css("bottom", (nBarHeight+15) + "px");
			$("#progressBar").css("display", "");
			$("#SliderBox").css("display", "none");
			m_timeLineCtrl.resize();
		}else {
			$("#playbackOcx").css("bottom", "50px");
			$("#pbControlBtn_Box").css("bottom", "0");
			$("#progressBar").css("display", "none");
			$("#SliderBox").css("display", "");
		}
		$("#SyncMode_Box").css("display", bShow?"":"none");
	}
	function SetBtnEnable(obj, bEnable) {
		if (bEnable) {
			$(obj).attr("disabled", false);
			$(obj).stop().fadeTo("slow", 1)
		} else {
			$(obj).attr("disabled", true);
			$(obj).stop().fadeTo("slow", 0.4)
		}
	}
	function ChangeDlg(nIndex) {
		if (nIndex == 0) {
			$("#SreachDlg").css("display", "");
			$("#PlayListDlg").css("display", "none");
		}else if (nIndex == 1) {
			$("#SreachDlg").css("display", "none");
			$("#PlayListDlg").css("display", "");
			$("#ThirdBtnBox").show();
			$("#FileList").css("top", "130px");
			ResizeTable();
		}
	}
	function updateBtnStatus(nStatus) {
		$(".pbControlBtn").each(function(){
			$(this).RSButton("setStatus", nStatus);
		});
		$("#PlaySlider").slider("setDisable", nStatus == RSBtnStatus.Disabled?true:false);
	}
	function UpdateType(){
		$("#audio").attr("name", "");
		$("#audio").css("background-position", "0px -112px");
		MasklayerShow();
		$("#SelType").empty();
		$("#SelType").val(0);
		function a(bLineShow){
			ShowTimeLine(bLineShow);
			gDevice.SetPlaybackMode(m_nPlayStyle, function(a){
				gDevice.HidePlugin(false, function(a){
					gDevice.runAutoCheckWnd();
					MasklayerHide();
				});
			});
		}
		if (m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_FILE) {
			var typeArr = ["All", "AlarmRecordFile", "DetectRecordfile", "GeneralRecordFile",
						"HandRecordFile", "AllPic", "AlarmRecordPic", "DetectRecordPic", 
						"GeneralRecordPic", "HandRecordPic"];
			var nMax = typeArr.length;
			for (var i = 0; i < nMax; ++i) {
				$("#SelType").append('<option value="'+i+'">'+ lg.get("IDS_PBK_" + typeArr[i]) +'</option>');
			}
			if (GetFunAbility(gDevice.Ability.OtherFunction.SupportImpRecord)) {
				$("#SelType").append('<option value="'+nMax+'">'+ lg.get("IDS_PBK_KeyRecord") +'</option>');
			}
			$("#ChannelDiv").divBox("setSingleSelect", true);
			a(false);
		}else if(m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_TIME) {
			var typeArr = ["All", "AlarmRecordFile", "DetectRecordfile", "GeneralRecordFile", "HandRecordFile"];
			var nMax = typeArr.length;
			for (var i = 0; i < nMax; ++i) {
				$("#SelType").append('<option value="'+i+'">'+ lg.get("IDS_PBK_" + typeArr[i]) +'</option>');
			}
			if (GetFunAbility(gDevice.Ability.OtherFunction.SupportImpRecord)) {
				$("#SelType").append('<option value="'+nMax+'">'+ lg.get("IDS_PBK_KeyRecord") +'</option>');
			}
			$("#ChannelDiv").divBox("setSingleSelect", !bSupportMultiChn);
			if (bSupportMultiChn) {
				nBarHeight = 4 * 20 + 20 + 10; 
			}
			$("#progressBar").css("height", nBarHeight + "px");
			a(true);
		}else{
			a(false);
		}
	}
	function OnClickAllSelect(){
		var bCheckd = $("#AllSelect").prop("checked");
		$(".ListCheckBox").each(function(){
			$(this).prop("checked", bCheckd);
		});
	}
	function ShowPageData(nPage) {
		var table = $("#FileTable")[0];
		var nClearRow = table.rows.length; 
		for (var n = 0; n < nClearRow; ++n) {
			table.deleteRow(0);
		}
		var nHeadpadding = 0;
		if (m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_FILE) {
			if (recordData[nPage] == null) return;
			for (var i=0; i < recordData[nPage].length; i++){
				var cfg = recordData[nPage][i];
				var sTime = cfg.BeginTime;
				var eTime = cfg.EndTime;
				eTime = eTime.split(" ")[1];
				var sInfo = sTime + "-" + eTime;
				var No = nPage * 64 + i + 1;
	
				var tr = table.insertRow(i);
				tr.classList.add("CustomPlaybackClass");
				var td1 = tr.insertCell(0);
				td1.innerHTML = '<input class="ListCheckBox" type="checkbox" value="'+i+'"/>';
				var td2 = tr.insertCell(1);
				td2.innerHTML = No;
				var td3 = tr.insertCell(2);
				td3.innerHTML = sInfo;
			}
			if (recordData[nPage].length * 30 > contentH) {
				nHeadpadding = TableRightPadding;
			}
		}else if(m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_TIME) {
			var sTime = queryParam.BeginTime;
			var eTime = queryParam.EndTime.split(" ")[1];
			var sInfo = sTime + "-" + eTime;
			
			var tr = table.insertRow(0);
			tr.classList.add("CustomPlaybackClass");
			var td1 = tr.insertCell(0);
			td1.innerHTML = '<input class="ListCheckBox" type="checkbox" value="0"/>';
			var td2 = tr.insertCell(1);
			td2.innerHTML = 1;
			var td3 = tr.insertCell(2);
			td3.innerHTML = sInfo;
		}else {
			return;
		}
		$("#FileList .table-head").css("padding-right", nHeadpadding+"px");
	
		$(".ListCheckBox").click(function(){
			var nCount = 0;
			var nCheckNum = 0;
			$(".ListCheckBox").each(function(){
				if ($(this).prop("checked")) {
					++nCheckNum;
				}
				++nCount;
			});
			if (nCount == nCheckNum) {
				$("#AllSelect").prop("checked", true);
			}else {
				$("#AllSelect").prop("checked", false);
			}
		});	
		$(".CustomPlaybackClass").click(function(){			
			$(".CustomPlaybackClass").attr("d", "not-active");
			$(this).attr("d", "active");
		});
		$(".CustomPlaybackClass").dblclick(function(){
			var colCheckBox = $(this)[0].cells[0].firstChild;
			var value = colCheckBox.value * 1;
			playFileArr = [];
			var stream = $("#SelStream").val()*1;
			var chn = queryChArr[0];
			if(chn >= 0){
				if(queryParam.Type != "jpg"){
					beginPlay(m_nPlayStyle, chn, stream, value);
				}else{
					beginPicturePlay(chn, value);
				}
			}
		});
		OnClickAllSelect();
	}
	
	function beginPicturePlay(chn, nSel){
		if(bDownloading){
			return;
		}
		var tempFile = [];
		tempFile.push(recordData[nCurPage][nSel]);
		gDevice.PlaybackDownload(1, chn, 0, tempFile, function(a){
			if(a.Ret == WEB_ERROR.ERR_SUCESS){
			}
		}, "PicturePlay");
	}
	
	function QueryRecord(playStyle) {
		var msg = {}
		msg = $.extend(msg, queryParam);
		if(playStyle == PlayBackType.PBK_TYPE_REMOTE_FILE){
			msg.DriverTypeMask = "0x0000FFFF";
			msg.StreamType = "0x"+toHex(queryParam.StreamType,8);
		}else if(playStyle == PlayBackType.PBK_TYPE_REMOTE_TIME){
			msg.LowStreamType = "0x" +toHex(queryParam.LowStreamType,8);
			msg.HighStreamType = "0x" +toHex(queryParam.HighStreamType,8);
		}
		var req = {"Name":"OPFileQuery", "OPFileQuery":msg};
		gDevice.SearchRecord(req, function(a){
			if (playStyle == PlayBackType.PBK_TYPE_REMOTE_FILE) {
				if (a.Ret == 100) {
					var nLen = 0;
					if(a.OPFileQuery){
						nLen = a.OPFileQuery.length;
						recordData[nGetPage] = a.OPFileQuery;
						nCurPage++;
						nGetPage++;
					}
					if (a.OPFileQuery == null || nLen < 64) { //不存在下一页
						SetBtnEnable("#PageDown", false);
					}else { 										//存在下一页
						queryParam.BeginTime = a.OPFileQuery[nLen-1].EndTime;
						SetBtnEnable("#PageDown", true);
					}
					ChangeDlg(1);
					ShowPageData(nCurPage);
				}else if(a.Ret == 119){
					ShowPaop(pageTitle, lg.get("IDS_NORECORD"));
				}
			}else if(playStyle == PlayBackType.PBK_TYPE_REMOTE_TIME) {
				//处理按时间回放数据
				if(!isObject(a) || a.Ret == WEB_ERROR.ERR_RUNNING || a["OPFileQuery"] == null ){
					if(a.Ret == 119){
						ShowPaop(pageTitle, lg.get("IDS_NORECORD"));
					}
					return;
				}
				var Data = a["OPFileQuery"]["ByTimeInfo"];
				var tempRecordData = [];
				if(Data){
					for(var k = 0; k < Data.length; k++){
						var wnd = GetChannelWnd(Data[k].iChannel);
						recordData[wnd] = [];
						var data = Data[k].cRecordBitMap;
						var cRecord = base64ToBytes(data);
						var nLastType = 0;
						var nStartMin = -1;
						var nEndMin = -1;
						var m_nTimeSect = new Array();
						for (var i = 0; i < 24; i++){
							m_nTimeSect[i] = new Array();
							for (var j = 0; j < 60; j++){							
								var nIndex = parseInt((i * 60 + j) / 2);
								if ((i * 60 + j) % 2){
									m_nTimeSect[i][j] = (cRecord[nIndex] >> 4) & 0xF;
								}else{
									m_nTimeSect[i][j] = cRecord[nIndex] & 0xF;
								}
						
								var nMinute = i * 60 + j;
								if (m_nTimeSect[i][j] > 0 ){
									if(nStartMin == -1) {
										nStartMin = nMinute;
										nEndMin = nStartMin + 1;
										nLastType = m_nTimeSect[i][j];
									}
									if(m_nTimeSect[i][j] != nLastType && nLastType > 0){
										//录像种类发生改变
										var temp = {
											Begin: nStartMin,
											End: nEndMin,
											chn: wnd,
											Type: nLastType-1
										};
										recordData[wnd].push(temp);

										//重新开始统计时间段
										nStartMin = nMinute;
										nEndMin = nStartMin + 1;
										nLastType = m_nTimeSect[i][j];
									}else if(nLastType > 0){
										nEndMin = nMinute + 1;
									}
								}else{//这分种没有录像
									if(nStartMin != -1 && nEndMin != -1 && nLastType > 0){
										var temp = {
											Begin: nStartMin,
											End: nEndMin,
											chn: wnd,
											Type: nLastType-1
										};
										recordData[wnd].push(temp);

										nStartMin = -1;
										nEndMin = -1;
										nLastType = 0;
									}
								}
							}
						}
						if(nStartMin != -1 && nEndMin != -1 && nLastType > 0){
							var temp = {
								Begin: nStartMin,
								End: nEndMin,
								chn: wnd,
								Type: nLastType-1
							};
							recordData[wnd].push(temp);
						}

						tempRecordData = tempRecordData.concat(recordData[wnd]);
					}
					m_timeLineCtrl.initData(tempRecordData);
					tempRecordData = [];
					ChangeDlg(1);
					ShowPageData(0);
				}
			}
		});
	}
	function beginPlay(playstyle, chn, stream, sel){
		var tempFile = [];
		if (playstyle == PlayBackType.PBK_TYPE_REMOTE_FILE){
			if(sel == -1){
				for (var i = 0; i < playFileArr.length; i++){
					var nIndex = playFileArr[i];
					tempFile.push(recordData[nCurPage][nIndex]);
				}
			}else{
				tempFile.push(recordData[nCurPage][sel]);
			}
//			MasklayerShow();
			gDevice.PlaybackPlay(playstyle, chn, stream, tempFile, 0, null);		
		}else if (playstyle == PlayBackType.PBK_TYPE_REMOTE_TIME){
			var tr = $("#FileTable")[0].rows[0];
			var QueryTime = tr.cells[2].innerText;
			queryParam.BeginTime = QueryTime.split(" ")[0] + " " + QueryTime.split(" ")[1].split("-")[0];
			queryParam.EndTime = QueryTime.split(" ")[0] + " " + QueryTime.split(" ")[1].split("-")[1];
			for(var i = 0; i < queryChArr.length; i++){
				if(recordData[i] == void 0 || recordData[i].length == 0){
					continue;
				}
		
				var fileInfo = {
					"BeginTime":queryParam.BeginTime,
					"EndTime":queryParam.EndTime,
					"Channel":queryChArr[i],
					"Wnd": GetChannelWnd(queryChArr[i]),
					"FileType": nRecType,
					"Alarm" : sAlarm[queryParam.Event]
				};
				tempFile.push(fileInfo);
			}
//			MasklayerShow();
			gDevice.PlaybackPlay(playstyle, chn, stream, tempFile, -1, PlaybackPlayCallBack);		
		}else{
			return;
		}
	}
	function setPlayPos(nPos){
		if(!bSettingPos){
			if(!Number.isNaN(nPos)){
				$("#PlaySlider").slider("setValue", nPos);
			}else{
				a =1;
			}
		}
	}
	function StartSetProcess(){
		DebugStringEvent("StartSetProcess begin");
		var value = $("#PlaySlider").slider("getValue")*1;
		DebugStringEvent("begin press,value=" +value);
		setPlayPos(value);
		bSettingPos = true;
	}
	function SetProcess(){
		var value = $("#PlaySlider").slider("getValue")*1;
		if(Number.isNaN(value)){
			bSettingPos = false;
			return;
		}
		var chn;
		if(m_nPlayStyle == PlayBackType.PBK_TYPE_LOCAL){
			chn = nSelectWnd;
		}else{
			chn = queryParam.Channel;
		}
		gDevice.PlayBackControl(chn, PlaybackCtrl.PlaybackSetPos, value, function(a){
			bSettingPos = false;

			// 插件V4.0.0.1开始，远程回放按文件回放，设置进度的操作是重新播放文件，之前的录像会关闭，因此重置为Normal状态
			if(typeof a.Recording != "undefined"){
				$("#pbBtnRecord").RSButton("setStatus", RSBtnStatus.Normal);
			}
			
			if(a.Ret == WEB_ERROR.ERR_SUCESS){
				setPlayPos(value);
			}
		});
	}
	function PlaybackPlayCallBack(a){
		MasklayerHide();
		if(a.Ret == 100){
			for(var i = 0; i < a.ChnStatus.length;i++){
				ResetView(a.ChnStatus[i].Wnd);
				if(a.ChnStatus[i].Ret == 100){
					var nWnd = a.ChnStatus[i].Wnd;
					views[nWnd].Status = PlayStatus.StatusPlaying;
				}
			}
		}
	}
	function PlaybackDownloadCallBack(a){	
		if(a.Ret == WEB_ERROR.ERR_SUCESS){		
			if(m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_TIME
				&& $("#DownloadPosBox").css("display") != "none"){
				return;
			}
			bDownloading = true;
			var str = lg.get("IDS_DOWNLOAD_START") + a.DownPath;
			ShowPaop(pageTitle, str);
			$("#BtnDownload").css("display", "none");
			$("#BtnCancelDownload").css("display", "");
			$("#DownloadPosBox").css("display", "");
			$("#DownloadProgress").val(0);
			$("#DownloadPos").text("0%");
			$("#FileList").css("top", '160px');
			ResizeTable();
		}else if(a.Ret == WEB_ERROR.ERR_DownloadPathNotExists){
			ShowPaop(pageTitle,lg.get("IDS_NULL_DOWNLOADPATH"));
		}
	}
	
	function PlayBackControlCallBack(a){
		if(a.Ret != WEB_ERROR.ERR_SUCESS){
			return;
		}
		MasklayerHide();
		$("#pbBtnSlow").attr("title", lg.get("IDS_PBK_Slow"));
		$("#pbBtnFast").attr("title", lg.get("IDS_PBK_Fast"));
		var nCmd = a.Cmd;
		var b = a.ChnStatus;
		var i = -1;
		for(var j = 0; j < b.length; j++){
			if(b[j].Ret == WEB_ERROR.ERR_SUCESS){
				var nWnd = b[j].Wnd;
				views[nWnd].Status = b[j].Status;
				if(nWnd == nSelectWnd){
					i = j;
				}
			}
		}
		
		if(i < 0 || i >= b.length){
			return;
		}
		
		switch (nCmd){
			case PlaybackCtrl.PlaybackContinue:{				
				updateBtnStatus(RSBtnStatus.Normal);
				SetViewStatus(nSelectWnd);
				$("#pbBtnPlay").RSButton("setStatus", RSBtnStatus.Pressed);
			}
			break;
			case PlaybackCtrl.PlaybackPause:
				$("#pbBtnPlay").RSButton("setStatus", RSBtnStatus.Normal);
				$("#pbBtnPause").RSButton("setStatus", RSBtnStatus.Pressed);
				$("#pbBtnSlow").RSButton("setStatus", RSBtnStatus.Disabled);
				$("#pbBtnFast").RSButton("setStatus", RSBtnStatus.Disabled);
				$("#pbBtnNextFrame").RSButton("setStatus", RSBtnStatus.Disabled);
				$("#pbBtnPreFrame").RSButton("setStatus", RSBtnStatus.Disabled);									
				SetViewStatus(nSelectWnd);
				break;
			case PlaybackCtrl.PlaybackSlow:
				if(b[i].Ret == WEB_ERROR.ERR_SUCESS){
					updateBtnStatus(RSBtnStatus.Normal);
					if(b[i].Status == PlayStatus.StatusSlow){
						$("#pbBtnSlow").RSButton("setStatus", RSBtnStatus.Pressed);
						if(b[i].Mode != -1){
							$("#pbBtnSlow").attr("title", lg.get("IDS_PBK_Slow") + b[i].Mode);
						}
					}else{
						$("#pbBtnPlay").RSButton("setStatus", RSBtnStatus.Pressed);
					}
					SetViewStatus(nSelectWnd);
				}
				break;
			case PlaybackCtrl.PlaybackFast:
				updateBtnStatus(RSBtnStatus.Normal);
				if(b[i].Status == PlayStatus.StatusFast){
					$("#pbBtnFast").RSButton("setStatus", RSBtnStatus.Pressed);
					if(b[i].Mode != -1){
						$("#pbBtnFast").attr("title", lg.get("IDS_PBK_Fast") + b[i].Mode);
					}
				}else{
					$("#pbBtnPlay").RSButton("setStatus", RSBtnStatus.Pressed);
				}
				SetViewStatus(nSelectWnd);
				break;
			case PlaybackCtrl.PlaybackNextFrame:
			case PlaybackCtrl.PlaybackPrevFrame:								
				if(b[i].Ret == 100 && (b[i].Status == PlayStatus.StatusNextFrame
				|| b[i].Status == PlayStatus.StatusPrevFrame)){
					$("#pbBtnPlay").RSButton("setStatus", RSBtnStatus.Normal);
					$("#pbBtnStop").RSButton("setStatus", RSBtnStatus.Normal);
					$("#pbBtnSlow").RSButton("setStatus", RSBtnStatus.Disabled);
					$("#pbBtnFast").RSButton("setStatus", RSBtnStatus.Disabled);
					if(b[i].Status == PlayStatus.StatusNextFrame){
						$("#pbBtnPreFrame").RSButton("setStatus", RSBtnStatus.Normal);
						$("#pbBtnNextFrame").RSButton("setStatus", RSBtnStatus.Pressed);
					}else{
						$("#pbBtnNextFrame").RSButton("setStatus", RSBtnStatus.Normal);
						$("#pbBtnPreFrame").RSButton("setStatus", RSBtnStatus.Pressed);
					}
					SetViewStatus(nSelectWnd);
				}
				break;
			default:
				break;
			
		}
	}	
	
	function ResetDownloadBox(){
		$("#BtnDownload").css("display", "");
		$("#BtnCancelDownload").css("display", "none");
		$("#DownloadPosBox").css("display", "none");
		$("#FileList").css("top", '130px');
		ResizeTable();
	}
	
	function DownloadDownLoadByTime(){
		if(downloadByTime.curIndex >= queryChArr.length){
			bDownloading = false;	
			if(downloadByTime.DownPath != ""){
				var str = lg.get("IDS_DOWNLOAD_SUCCESS") + downloadByTime.DownPath;
				ShowPaop(pageTitle, str);
			} 
			ResetDownloadBox();

			return;
		}

		var chn = queryChArr[downloadByTime.curIndex];
		var stream = $("#SelStream").val()*1;	
		var msg = {}
		msg.Channel = chn;
		msg.BeginTime = downloadByTime.BeginTime;
		msg.EndTime = queryParam.EndTime;
		msg.DriverTypeMask = "0x0000FFFF";
		msg.StreamType = "0x"+toHex(stream, 8);
		msg.Type = queryParam.Type;
		msg.Event = queryParam.Event;

		var req = {"Name":"OPFileQuery", "OPFileQuery":msg};
		gDevice.SearchRecord(req, function(a){
			if (a.Ret == 100) {
				var nLen = 0;
				var tempFile = [];
				if(a.OPFileQuery){
					nLen = a.OPFileQuery.length;
					tempFile = a.OPFileQuery;
				}
				if (a.OPFileQuery == null){
					downloadByTime.curIndex += 1;
					downloadByTime.BeginTime = queryParam.BeginTime;
					DownloadDownLoadByTime();
				}else if (nLen < 64) {
					downloadByTime.curIndex += 1;
					downloadByTime.BeginTime = queryParam.BeginTime;
					gDevice.PlaybackDownload(0, chn, stream, tempFile, PlaybackDownloadCallBack);
				}else {
					downloadByTime.BeginTime = a.OPFileQuery[nLen-1].EndTime;
					gDevice.PlaybackDownload(0, chn, stream, tempFile, PlaybackDownloadCallBack);
				}
			}else {
				downloadByTime.curIndex += 1;
				downloadByTime.BeginTime = queryParam.BeginTime;
				DownloadDownLoadByTime();
			}
		});
	}
	function TimeLineClickedEvent(wnd, time, bInZone) {	//点击时间刻度表
		if (!bInZone){
			return;
		}
		var bHasRecord = true;
		if(typeof recordData[wnd] == "undefined" || recordData[wnd].length == 0){
			bHasRecord = false;
		}
		if(bHasRecord){
			bHasRecord = hasRecord(wnd, time);
		}
		if(!bHasRecord){
			gDevice.SetSelectWnd(wnd, function(a){
				
			});
		}else{
			var tempFile = [];
			if(queryParam.Sync){
				for(var i = 0; i < queryChArr.length; i++){
					if(recordData[i] == void 0 || recordData[i].length == 0){
						continue;
					}
					
					if(!bRecordEnd(i, time)){				
						var fileInfo = {
							"BeginTime":queryParam.BeginTime.split(" ")[0] + " " + time,
							"EndTime":queryParam.EndTime,
							"Channel":queryChArr[i],
							"Wnd": GetChannelWnd(queryChArr[i]),
							"FileType": nRecType,
							"Alarm" : sAlarm[queryParam.Event]
						};
						tempFile.push(fileInfo);
					}
				}
			}else{
				var chn = queryChArr[wnd];
				var fileInfo = {
					"BeginTime":queryParam.BeginTime.split(" ")[0] + " " + time,
					"EndTime":queryParam.EndTime,
					"Channel":chn,
					"Wnd": wnd,
					"FileType": nRecType,
					"Alarm" : sAlarm[queryParam.Event]
				};
				tempFile.push(fileInfo);
			}
		
			var stream = $("#SelStream").val()*1;		
//				MasklayerShow();
			gDevice.PlaybackPlay(m_nPlayStyle, chn, stream, tempFile, wnd, PlaybackPlayCallBack);
		}
	}
	function TimeLineResizeEvent() {
		if(m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_TIME){
			m_timeLineCtrl.resize();
		}
		ResizeTable();
	}
	function PlaybackResultEvent(aB) {
		var aQ = aB.SubEvent;
		var aV = aB.Data;
		if(aQ == PlaybackEvent.SubEventPlaybackPos){
			if (m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_FILE 
			|| m_nPlayStyle == PlayBackType.PBK_TYPE_LOCAL){
				setPlayPos(aV.pos);
			}else if(m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_TIME){
				var TimeStamp = aV.pos;
				var nHour = parseInt(TimeStamp / 3600);
				var nMinute = parseInt((TimeStamp - nHour*3600) / 60);
				var nSecond = TimeStamp - nHour*3600 - nMinute*60;
				var date = {
					"Hour": nHour,
					"Minute": nMinute,
					"Second": nSecond
				};
				m_timeLineCtrl.showMovePointer(aV.wnd, date);
			}
		}else if(aQ == PlaybackEvent.SubEventPlaybackStart){
			MasklayerHide();
			$("#pbBtnSlow").attr("title", lg.get("IDS_PBK_Slow"));
			$("#pbBtnFast").attr("title", lg.get("IDS_PBK_Fast"));
			if(aB.Ret == WEB_ERROR.ERR_SUCESS){
				bSettingPos = false;
				updateBtnStatus(RSBtnStatus.Normal);
				$("#pbBtnPlay").RSButton("setStatus", RSBtnStatus.Pressed);
				ResetView(aV.Wnd);
				views[aV.Wnd].Status = PlayStatus.StatusPlaying;
				if(playFileArr.length > 0){
					var nSel = playFileArr[aV.PlayIndex];
					$(".CustomPlaybackClass").attr("d", "not-active");
					$(".CustomPlaybackClass").eq(nSel).attr("d", "active");
				}
			}
		}else if(aQ == PlaybackEvent.SubEventPlaybackDownloadEnd){
			if(m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_TIME){
				if(downloadByTime.DownPath == ""){
					downloadByTime.DownPath = aV.DownPath;
				}
				DownloadDownLoadByTime();
			}else{
				bDownloading = false;
				var str = lg.get("IDS_DOWNLOAD_SUCCESS") + aV.DownPath;
				ShowPaop(pageTitle, str);
				ResetDownloadBox();
			}
		}else if(aQ == PlaybackEvent.SubEventPlaybackSelectWndChanged){
			nSelectWnd = aV.Wnd;
			views[nSelectWnd].Status = aV.Status;
			views[nSelectWnd].Record = aV.Record;
			views[nSelectWnd].Zoom = aV.Zoom;
			views[nSelectWnd].Audio = aV.Audio;
			if(m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_TIME){
				m_timeLineCtrl.setCurChn(nSelectWnd);
			}
			var nMode = aV.Mode;
			var status = aV.Status;
			$("#pbBtnSlow").attr("title", lg.get("IDS_PBK_Slow"));
			$("#pbBtnFast").attr("title", lg.get("IDS_PBK_Fast"));
			updateBtnStatus(RSBtnStatus.Normal);
			if(status == PlayStatus.StatusNoPlay){
				updateBtnStatus(RSBtnStatus.Disabled);
				if(m_nPlayStyle == PlayBackType.PBK_TYPE_LOCAL){
					$("#pbBtnPlay").RSButton("setStatus", RSBtnStatus.Normal);
				}					
			}else{
				if(status == PlayStatus.StatusPause){
					$("#pbBtnPlay").RSButton("setStatus", RSBtnStatus.Normal);
					$("#pbBtnPause").RSButton("setStatus", RSBtnStatus.Pressed);
					$("#pbBtnSlow").RSButton("setStatus", RSBtnStatus.Disabled);
					$("#pbBtnFast").RSButton("setStatus", RSBtnStatus.Disabled);
					$("#pbBtnNextFrame").RSButton("setStatus", RSBtnStatus.Disabled);
					$("#pbBtnPreFrame").RSButton("setStatus", RSBtnStatus.Disabled);
				}else if(status == PlayStatus.StatusSlow){
					$("#pbBtnSlow").RSButton("setStatus", RSBtnStatus.Pressed);
					if(nMode != -1){
						$("#pbBtnSlow").attr("title", lg.get("IDS_PBK_Slow") + nMode);
					}
				}else if(status == PlayStatus.StatusFast){
					$("#pbBtnFast").RSButton("setStatus", RSBtnStatus.Pressed);
					if(nMode != -1){
						$("#pbBtnFast").attr("title", lg.get("IDS_PBK_Fast") + nMode);
					}
				}else if(status == PlayStatus.StatusNextFrame || status == PlayStatus.StatusPrevFrame){
					$("#pbBtnPlay").RSButton("setStatus", RSBtnStatus.Normal);
					$("#pbBtnStop").RSButton("setStatus", RSBtnStatus.Normal);
					$("#pbBtnSlow").RSButton("setStatus", RSBtnStatus.Disabled);
					$("#pbBtnFast").RSButton("setStatus", RSBtnStatus.Disabled);
					if(status == PlayStatus.StatusNextFrame){
						$("#pbBtnNextFrame").RSButton("setStatus", RSBtnStatus.Pressed);
					}else if(status == PlayStatus.StatusPrevFrame){
						$("#pbBtnPreFrame").RSButton("setStatus", RSBtnStatus.Pressed);
					}
				}else{
					$("#pbBtnPlay").RSButton("setStatus", RSBtnStatus.Pressed);
					$("#pbBtnPause").RSButton("setStatus", RSBtnStatus.Normal);
				}
				if(views[nSelectWnd].Record){
					$("#pbBtnRecord").RSButton("setStatus", RSBtnStatus.Pressed);
				}
				if(views[nSelectWnd].Audio){
					$("#pbBtnAudio").RSButton("setStatus", RSBtnStatus.Pressed);
				}
			} 
			if(views[nSelectWnd].Zoom){
				$("#pbBtnZoom").RSButton("setStatus", RSBtnStatus.Pressed);
			}
		}else if(aQ == PlaybackEvent.SubEventPlaybackDownloadPos){
			if(!bDownloading){
				downloadFileArr = [];
				ResetDownloadBox();
				return;
			}				

			$("#DownloadProgress").val(aV.Pos);
			var strPos = aV.Pos/10 + "%";
			$("#DownloadPos").text(strPos);
		}else if(aQ == PlaybackEvent.SubEventPlaybackEnd){
			if(aV.Wnd == nSelectWnd){
				$("#pbBtnSlow").attr("title", lg.get("IDS_PBK_Slow"));
				$("#pbBtnFast").attr("title", lg.get("IDS_PBK_Fast"));
				setPlayPos(1000);
				updateBtnStatus(RSBtnStatus.Disabled);
				setPlayPos(0);
				if(m_nPlayStyle == PlayBackType.PBK_TYPE_LOCAL){
					$("#pbBtnPlay").RSButton("setStatus", RSBtnStatus.Normal);
				}
			}
			views[aV.Wnd].Status = PlayStatus.StatusNoPlay;
			if(m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_TIME){
				m_timeLineCtrl.hideMovePointer(aV.Wnd);
			}
		}else if(aQ == PlaybackEvent.SubEventPlaybackLayoutReset){
			$("#SyncMode").prop("checked", false);
			setPlayPos(0);
			updateBtnStatus(RSBtnStatus.Disabled);
			$("#SelPlayBack").val(0);
			DivBox(1, "#remoteSearch");
			$("#ChannelDiv > div").css({
				"background-color": "transparent",
				color: "inherit"
			});
			$("#AllSelect").prop("checked", false);
			recordData = [];
			for(var i = 0; i < viewsNum; i++){
				m_timeLineCtrl.hideMovePointer(i);
			}
			m_timeLineCtrl.initData([]);
			ChangeDlg(0);
			ResetDownloadBox();
			$("#Channel_Box .MaskDiv, #pbBtnPreFrame").css("display", "none");
			$("#ByNameRadio").prop("checked", true);
			$("#ChannelDiv > div").css({
				"background-color": "transparent",
				color: "inherit"
			});
			DivBox(1, "#EndDateBox");
			m_nPlayStyle = PlayBackType.PBK_TYPE_REMOTE_FILE;
			UpdateType();
		}else if(aQ == PlaybackEvent.SubEventPlaybackLayoutReLogin){
			$("#pbBtnSlow").attr("title", lg.get("IDS_PBK_Slow"));
			$("#pbBtnFast").attr("title", lg.get("IDS_PBK_Fast"));
			setPlayPos(0);
			updateBtnStatus(RSBtnStatus.Disabled);
			for(var i = 0; i < viewsNum; i++){
				m_timeLineCtrl.hideMovePointer(i);
			}
			ResetDownloadBox();
		}
	}
	function InitTimelineObj() {
		var i = false;
		var typeArr=[];
		for(var i in g_recTypeEnum){
			typeArr.push(g_recTypeEnum[i]);
		}
		m_timeLineCtrl = new timeline({
			divId: "progress-bar",
			chnNum: viewsNum,
			dataTypeArr: typeArr,
			dataTypeColorArr: recColor,
			optimizeData: true,
			fontColor: "#a4a4a4",
			clickCallback: TimeLineClickedEvent,
			blankLeftWidth: 60,
			b24Hour: i
		})
	}
	function GotoCallBack(){
		setPlayPos(0);
		updateBtnStatus(RSBtnStatus.Disabled);
		$("#ChannelDiv > div").css({
			"background-color": "transparent",
			color: "inherit"
		});
		$("#AllSelect").prop("checked", false);
		recordData = [];
		if(m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_TIME){
			for(var i = 0; i < viewsNum; i++){
				m_timeLineCtrl.hideMovePointer(i);
			}
		}
		m_timeLineCtrl.initData([]);
		ChangeDlg(0);
		ResetDownloadBox();
		MasklayerHide();
	}

	$("#SelPlayBack").empty();
	$("#SelPlayBack").append('<option value="0">'+ lg.get("IDS_PBK_Remote") +'</option>');
	$("#SelPlayBack").append('<option value="1">'+ lg.get("IDS_PBK_Local") +'</option>');
	$("#SelPlayBack").val(0);
	$("#SelStream").empty();
	$("#SelStream").append('<option value="0">'+lg.get("IDS_MAINSTREAM")+'</option>');
	if(parseInt(gDevice.ExtRecSupport.AbilityPram) != 0 || GetFunAbility(gDevice.Ability.OtherFunction.SupportExtPlayBack)){
		$("#SelStream").append('<option value="1">'+lg.get("IDS_EXTSREAM")+'</option>');
	}
	$("#SelStream").val(0);

	$("#pbStartDate").simpleCalendarCtrl({
		type: 1,
		x: $("#pbStartDate").offset().left - $(".leftContent").offset().left - 20,
		y: $("#pbStartDate").offset().top - $(".leftContent").offset().top + 25,
		Laguage: gVar.lg,
		name: "pbTimer1",
		nIframe: "pbframe1"
	});
	$("#pbEndDate").simpleCalendarCtrl({
		type: 1,
		x: $("#pbEndDate").offset().left - $(".leftContent").offset().left - 20,
		y: $("#pbEndDate").offset().top - $(".leftContent").offset().top + 25,
		Laguage: gVar.lg,
		name: "pbTimer2",
		nIframe: "pbframe2"
	});
	$("#pbStartDate").val($("#pbStartDate").simpleCalendarCtrl.formatOutput(new Date()));
	$("#pbEndDate").val($("#pbEndDate").simpleCalendarCtrl.formatOutput(new Date()));
	
	$("#ByNameRadio").prop("checked", true);
	$("#pbStartTime").timer({Type: 1});
	$("#pbEndTime").timer({Type: 1});
	$("#pbStartTime").timer.SetTimeIn24("00:00:00", $("#pbStartTime"));
	$("#pbEndTime").timer.SetTimeIn24("23:59:59", $("#pbEndTime"));
	m_nPlayStyle = PlayBackType.PBK_TYPE_REMOTE_FILE;
	
	$("#ChannelDiv").divBox({
		number: gDevice.loginRsp.ChannelNum,
		bkColor: color,
		borderColor: bColor,
		ExType: true,
		parentLev: 2,
		activeTextClr: "#FFFFFF",
		rowNum:8,
		maxSelectNum: bSupportMultiChn ? 4: -1,
		bSingleSelect:true,
		bDownID:"ChannelDiv"
	});
	var ChannelH = $("#Channel_Box").height();
	$("#Channel_Box .MaskDiv").css("height", ChannelH + "px");
	$("#PlaySlider").slider({minValue: 0, maxValue: 1000, width:400, showText:false, bResize:true, 
	toDoc:true, mousedownCallback: StartSetProcess, mouseupCallback: SetProcess});

	$(".pbControlBtn").each(function(){
		var nPosY = $(this).attr("data-posy") *1;
		$(this).RSButton({
			width: 37,
			height: 37,
			posY: nPosY,
			status: RSBtnStatus.Disabled,
			click: function(aM) {
				var curId = $(aM).attr("id");
				var wnd = nSelectWnd;
				var chn = -1;
				if(m_nPlayStyle == PlayBackType.PBK_TYPE_LOCAL){
					chn = wnd;
				}else{
					chn = queryChArr[nSelectWnd];
					if(chn == void 0 || chn < 0) return;
				}
				var curChn = chn;
				
				if(m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_TIME && queryParam.Sync == 1
				&&(curId == "pbBtnPlay" || curId == "pbBtnStop" || curId == "pbBtnPause" 
				|| curId == "pbBtnSlow" || curId == "pbBtnFast" || curId == "pbBtnNextFrame")){
					chn = -1;
				}
				switch (curId) {
					case "pbBtnPlay":
						var status = views[nSelectWnd].Status;
						if(status == PlayStatus.StatusNoPlay){
							if(m_nPlayStyle == PlayBackType.PBK_TYPE_LOCAL){
								MasklayerShow();
								gDevice.LocalBackPlay(function(a){													
									MasklayerHide();
									if(a.Ret == WEB_ERROR.ERR_SUCESS){
										bSettingPos = false;
										updateBtnStatus(RSBtnStatus.Normal);
										$("#pbBtnPlay").RSButton("setStatus", RSBtnStatus.Pressed);
										ResetView(a.Wnd);
										views[a.Wnd].Status = PlayStatus.StatusPlaying;
									}
								});							
							}
						}else if(status == PlayStatus.StatusPause 
						|| status == PlayStatus.StatusNextFrame || status == PlayStatus.StatusPrevFrame
						|| status == PlayStatus.StatusSlow || status == PlayStatus.StatusFast){
//								MasklayerShow();
							gDevice.PlayBackControl(chn, PlaybackCtrl.PlaybackContinue, 0, PlayBackControlCallBack);
						}
						break;
					case "pbBtnStop":
//							MasklayerShow();
						gDevice.PlaybackStop(chn, function(a){
							MasklayerHide();
							$("#pbBtnSlow").attr("title", lg.get("IDS_PBK_Slow"));
							$("#pbBtnFast").attr("title", lg.get("IDS_PBK_Fast"));
							updateBtnStatus(RSBtnStatus.Disabled);
							setPlayPos(0);
							if(m_nPlayStyle == PlayBackType.PBK_TYPE_LOCAL){
								$("#pbBtnPlay").RSButton("setStatus", RSBtnStatus.Normal);
								views[a.Wnd].Status = PlayStatus.StatusNoPlay;
							}else if(m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_TIME){
								if(chn == -1){
									for(var i = 0; i < viewsNum; i++){
										m_timeLineCtrl.hideMovePointer(i);
										views[i].Status = PlayStatus.StatusNoPlay;
									}
								}else{
									m_timeLineCtrl.hideMovePointer(a.Wnd);
									views[a.Wnd].Status = PlayStatus.StatusNoPlay;
								}	
							}else if(m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_FILE){
								views[a.Wnd].Status = PlayStatus.StatusNoPlay;
							}
						});
						break;
					case "pbBtnPause":
//							MasklayerShow();
						gDevice.PlayBackControl(chn, PlaybackCtrl.PlaybackPause, 0, PlayBackControlCallBack);
						break;
					case "pbBtnSlow":
//							MasklayerShow();
						gDevice.PlayBackControl(chn, PlaybackCtrl.PlaybackSlow, 0, PlayBackControlCallBack);
						break;
					case "pbBtnFast":
//							MasklayerShow();
						gDevice.PlayBackControl(chn, PlaybackCtrl.PlaybackFast, 0, PlayBackControlCallBack);
						break;
					case "pbBtnPreFrame":
					case "pbBtnNextFrame":
//							MasklayerShow();
						var cmd = PlaybackCtrl.PlaybackNextFrame;
						if(curId == "pbBtnPreFrame"){
							cmd = PlaybackCtrl.PlaybackPrevFrame;
						}
						gDevice.PlayBackControl(chn, cmd, 1, PlayBackControlCallBack);
						break;
					case "pbBtnSnap":
						gDevice.PlaybackCapture(chn, function(a){
							if(a.Ret == 100){
								var str = lg.get("IDS_CAPTURE_SUCCESS") + a.CapPath;
								ShowPaop(pageTitle, str);
							}else{
								ShowPaop(pageTitle, lg.get("IDS_CAPTURE_FAIL"));
							}
						});
						break;
					case "pbBtnZoom":
						gDevice.PlaybackZoom(chn, function(a){
							if(a.Ret == 100){
								if(a.Zoom){
									$("#pbBtnZoom").RSButton("setStatus", RSBtnStatus.Pressed);
									views[wnd].Zoom = true;
								}else{
									$("#pbBtnZoom").RSButton("setStatus", RSBtnStatus.Normal);
									views[wnd].Zoom = false;
								}
							}
						});							
						break;
					case "pbBtnRecord":
						gDevice.PlaybackRecord(chn, function(a){
							if(a.Ret == 100){
								if(a.Record){
									$("#pbBtnRecord").RSButton("setStatus", RSBtnStatus.Pressed);		
									views[wnd].Record = true;
								}else{
									if(views[wnd].Record){
										var str = "";
										if(m_nPlayStyle != PlayBackType.PBK_TYPE_LOCAL){
											var chnName = gDevice.getChannelName(a.Chn);
											str = chnName + " " + lg.get("IDS_RECORD_SUCCESS") + a.RecPath;	
										}else{
											str = lg.get("IDS_PBK_Local") + " " +
												lg.get("IDS_RECORD_SUCCESS") + a.RecPath;	
										}
										ShowPaop(pageTitle, str);
									}
									$("#pbBtnRecord").RSButton("setStatus", RSBtnStatus.Normal);
									views[wnd].Record = false;
								}
							}
						});
						break;
					case "pbBtnAudio":
						gDevice.PlaybackSound(chn, function(a){
							if(a.Audio){
								$("#pbBtnAudio").RSButton("setStatus", RSBtnStatus.Pressed);
								views[wnd].Audio = true;
							}else{
								$("#pbBtnAudio").RSButton("setStatus", RSBtnStatus.Normal);
								views[wnd].Audio = false;
							}
						});
						break;
					default:
						break
				}
			}
		})
	});

	playbackSetTipText();
	updateBtnStatus(RSBtnStatus.Disabled);
	InitTimelineObj();	
	InitViews();
	playbackEventCallBack = PlaybackResultEvent;
	timeLineResizeCallBack = TimeLineResizeEvent;
	timeLineResizeCallBack();

	$("#Channel_Box .MaskDiv").css("display", "none");
		
	$("#localPBKFileBrowse").change(function(e){
	});
	$("#SelPlayBack").change(function(){
		var nLastPlayStyle = m_nPlayStyle;
		var nSel = $(this).val() *1;
		if (nSel == 0) {
			DivBox(1, "#remoteSearch");
			m_nPlayStyle = $("#ByNameRadio").prop("checked")?PlayBackType.PBK_TYPE_REMOTE_FILE:PlayBackType.PBK_TYPE_REMOTE_TIME;
			$("#Channel_Box .MaskDiv, #pbBtnPreFrame").css("display", "none");
		}else {
			$("#ChannelDiv > div").css({
				"background-color": "transparent",
				color: "inherit"
			});
			m_nPlayStyle = PlayBackType.PBK_TYPE_LOCAL;
			DivBox(0, "#remoteSearch");
			$("#pbBtnPlay").RSButton("setStatus", RSBtnStatus.Normal);
			$("#Channel_Box .MaskDiv, #pbBtnPreFrame").css("display", "block");
		}
		
		if(nLastPlayStyle == PlayBackType.PBK_TYPE_LOCAL){			
			MasklayerShow();
			gDevice.PlaybackStop(-1, function(a){
				MasklayerHide();
				$("#pbBtnSlow").attr("title", lg.get("IDS_PBK_Slow"));
				$("#pbBtnFast").attr("title", lg.get("IDS_PBK_Fast"));
				setPlayPos(0);
				updateBtnStatus(RSBtnStatus.Disabled);
				UpdateType();
			});
		}else{
			UpdateType();
		}
	});
	$("#ByNameRadio, #ByTimeRadio").click(function(){
		var curId = $(this).attr("id");
		if ("ByNameRadio" == curId){
			if(m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_FILE) return;
			$("#ChannelDiv > div").css({
				"background-color": "transparent",
				color: "inherit"
			});
			DivBox(1, "#EndDateBox");
			m_nPlayStyle = PlayBackType.PBK_TYPE_REMOTE_FILE;
		}else if("ByTimeRadio" == curId){
			if(m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_TIME) return;
			DivBox(0, "#EndDateBox");
			m_nPlayStyle = PlayBackType.PBK_TYPE_REMOTE_TIME;
		}
		UpdateType();
	});
	$("#BtnSearch").click(function(){
		bDownloading = false;
		queryChArr = [];
		var count = 0;
		$("#ChannelDiv > div").each(function (i) {
			var bCheckd = ($(this).css("background-color").replace(/\s/g, "") == color.replace(/\s/g, "") && $(this).css("display") != "none") ? true : false;
			if (bCheckd) {
				queryChArr.push(i);
			}
		});
		
		var nChnNum = queryChArr.length;
		if (nChnNum == 0) {
			ShowPaop(pageTitle, lg.get("IDS_PBK_SelectNull"));
			return -1;
		}

		if (m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_FILE && nChnNum != 1) {
			ShowPaop(pageTitle, lg.get("IDS_PBK_SelectOne"));
			return -1;
		}
	
		queryParam = {};
		var sTime, eTime;
		var strStartDate = $("#pbStartDate").val().split('-');
		var strStartTime = $("#pbStartTime").timer.GetTimeFor24($("#pbStartTime")).split(':');
		sTime = strStartDate[0] + "-" + prefixInteger(parseInt(strStartDate[1]),2) +'-'+ prefixInteger(parseInt(strStartDate[2]),2);
		sTime += " " + prefixInteger(parseInt(strStartTime[0]),2) + ":" + prefixInteger(parseInt(strStartTime[1]), 2) + ":" + prefixInteger(parseInt(strStartTime[2]), 2);
		var strEndDate = $("#pbEndDate").val().split('-');
		var strEndTime = $("#pbEndTime").timer.GetTimeFor24($("#pbEndTime")).split(':');
		if (m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_FILE) {
			queryParam.Channel = queryChArr[0];
			queryParam.StreamType = $("#SelStream").val()*1;
			eTime = strEndDate[0] + "-" + prefixInteger(parseInt(strEndDate[1]),2) +'-'+ prefixInteger(parseInt(strEndDate[2]),2);
		}else if(m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_TIME) {
			var nStreamMask = [0x0,0x0];
			var nChMask = [0x0,0x0];
			for(var i = 0; i< queryChArr.length; ++i){
				var ch = queryChArr[i];
				var m = parseInt(ch/32);
				var n = parseInt(ch%32);
				if($("#SelStream").val() == "1"){
					nStreamMask[m] |= (0x01 << n);
				}
				nChMask[m] |= (0x01 << ch);
			}
			queryParam.LowChannel = nChMask[0];
			queryParam.HighChannel = nChMask[1];
			queryParam.LowStreamType = nStreamMask[0];
			queryParam.HighStreamType = nStreamMask[1];
			queryParam.Sync = $("#SyncMode").prop("checked") ? 1 : 0;;
			eTime = strStartDate[0] + "-" + prefixInteger(parseInt(strStartDate[1]),2) +'-'+ prefixInteger(parseInt(strStartDate[2]),2);
		}
		eTime += " " + prefixInteger(parseInt(strEndTime[0]), 2) + ":" + prefixInteger(parseInt(strEndTime[1]), 2) + ":" + prefixInteger(parseInt(strEndTime[2]), 2);
	
		nRecType = $("#SelType").val() *1;
		if(nRecType > 4){
			queryParam.Type = "jpg";
		}else{
			queryParam.Type = "h264";
		}
		if(nRecType == 0 || nRecType == 5){
			queryParam.Event = "*";
		}else if(nRecType == 1 || nRecType == 6){
			queryParam.Event = "A";
		}else if(nRecType == 2 || nRecType == 7){
			queryParam.Event = "M";
		}else if(nRecType == 3 || nRecType == 8){
			queryParam.Event = "R";
		}else if(nRecType == 4 || nRecType == 9){
			queryParam.Event = "H";
		}
		var sDate = str2Date(sTime);
		var eDate = str2Date(eTime); 
		if(eDate.getTime() <= sDate.getTime()){
			ShowPaop(pageTitle, lg.get("IDS_PBK_InvalidTime"));
			return;
		}
		
		queryParam.BeginTime = sTime;
		queryParam.EndTime = eTime;
		
		SetBtnEnable("#PageUp", false);
		SetBtnEnable("#PageDown", false);
		nCurPage = -1;
		nGetPage = 0;
		recordData = [];
		m_timeLineCtrl.initData([]);
		QueryRecord(m_nPlayStyle);
	});

	$("#GotoSearch").click(function(){
		MasklayerShow();
		gDevice.PlaybackStop(-1, function(a){
			$("#pbBtnSlow").attr("title", lg.get("IDS_PBK_Slow"));
			$("#pbBtnFast").attr("title", lg.get("IDS_PBK_Fast"));
			if(bDownloading){
				gDevice.PlaybackCancelDownload(function(a){
					if(a.Ret == 100){
						bDownloading = false;
						downloadFileArr = [];
						ResetDownloadBox();
						GotoCallBack();
					}
				});
			}else{
				GotoCallBack();
			}
		});		
	});
	
	$("#BtnPlay").click(function(){
		playFileArr = [];
		$(".ListCheckBox").each(function(){
			if ($(this).prop("checked")) {
				playFileArr.push($(this).val() *1);
			}
		})
		if(playFileArr.length == 0) {
			ShowPaop(pageTitle, lg.get("IDS_PBK_SelectFile"));
			return;
		}
		
		var tableRows = $("#FileTable")[0].rows;
		var chn = queryChArr[0]; 
		var stream = $("#SelStream").val()*1; 
		if(chn >= 0){
			if(queryParam.Type != "jpg"){
				beginPlay(m_nPlayStyle, chn, stream, -1);
			}else{
				beginPicturePlay(chn, playFileArr[0]);
			}
		}
	});
	$("#BtnDownload").click(function(){
		downloadFileArr = [];
		$(".ListCheckBox").each(function(){
			if ($(this).prop("checked")) {
				downloadFileArr.push($(this).val() *1);
			}
		})
		if(downloadFileArr.length == 0) {
			ShowPaop(pageTitle, lg.get("IDS_PBK_SelectFile"));
			return;
		}
		var chn = queryChArr[0]; 
		var stream = $("#SelStream").val()*1;
		var nSel = -1;
		if (m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_FILE){
			var tempFile = [];
			for(var i = 0; i < downloadFileArr.length; i++){
				var nIndex = downloadFileArr[i];
				tempFile.push(recordData[nCurPage][nIndex])
			}
			bDownloading = false;
			var nFileType = 0;
			if(queryParam.Type == "jpg"){
				nFileType = 1;
			}
			gDevice.PlaybackDownload(nFileType, chn, stream, tempFile, PlaybackDownloadCallBack);
		}else if (m_nPlayStyle == PlayBackType.PBK_TYPE_REMOTE_TIME){
			downloadByTime.curIndex = 0;
			downloadByTime.BeginTime = queryParam.BeginTime;
			downloadByTime.DownPath = "";
			DownloadDownLoadByTime();
		}
	});
	$("#BtnCancelDownload").click(function(){
		gDevice.PlaybackCancelDownload(function(a){
			if(a.Ret == 100){
				bDownloading = false;
				downloadFileArr = [];
				var str = lg.get("IDS_CALCEL_DOWNLOAD_SUCCESS");
				ShowPaop(pageTitle, str);
				ResetDownloadBox();
			}
		});
	});
	$("#PageUp").click(function(){
		nCurPage--;
		ShowPageData(nCurPage);
		if (nCurPage == 0) {
			SetBtnEnable("#PageUp", false);
		}
		SetBtnEnable("#PageDown", true);
	});
	$("#PageDown").click(function(){
		if (nGetPage != nCurPage + 1) {
			nCurPage++;
			ShowPageData(nCurPage);
			if (nCurPage >= 0) {
				SetBtnEnable("#PageUp", true);
			}
			if (nGetPage == nCurPage + 1 && recordData[nCurPage].length < 64) {
				SetBtnEnable("#PageDown", false);
			}
			return;
		}
		QueryRecord(m_nPlayStyle);
		SetBtnEnable("#PageUp", true);
	});
	$("#AllSelect").click(function(){
		OnClickAllSelect();
	});
	UpdateType();
});