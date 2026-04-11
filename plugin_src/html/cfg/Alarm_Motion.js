//# sourceURL=Alarm_Motion.js
$(function () {
	var color = gVar.skin_mColor;
    var bColor = gVar.skin_bColor;
	var bGet = new Array;
    var motionCfg = new Array;
	var motionArea = null;
	var motionAreaDig;
	var HumanCfg = new Array;
	var humanAbility = new Array;
	var digitalHumanAbility = new Array;
	var chPeaInHumanPed = null;
	var bGetIPCMotion = new Array;
	var IPCMotion = new Array;
	var VoiceTipCfg;
    var chnIndex = -1;
    var bCopy = false;
	var copyCfg = null;
	var copyNVRCfg = null;
	var bHumanEnable = false;
	var bkWidth;
	var bkHeight;
	var nRegion = [];
	var ChannelH;
    var pageTitle = $("#Alarm_Motion").text();
	var bIPC = gDevice.devType == devTypeEnum.DEV_IPC ? true : false;
	var bHumanCfg = GetFunAbility(gDevice.Ability.AlarmFunction.HumanDection);
	var bPetDetect = GetFunAbility(gDevice.Ability.AlarmFunction.HumanBasedPetDetect);
	var bNVRHuman = GetFunAbility(gDevice.Ability.AlarmFunction.HumanDectionNVRNew);
	var bShowRule = GetFunAbility(gDevice.Ability.PreviewFunction.PreviewShowPedRule);
	var bSupportAlarmVoiceInterval = false;
	var bHuman = bHumanCfg;
	var HumanZoneObj;
	var borderColor = "";
	var borderWidth = 0;
	var bIPCPeaRule = GetFunAbility(gDevice.Ability.AlarmFunction.PEAInHumanPed);
	var bVoiceTip = GetFunAbility(gDevice.Ability.OtherFunction.SupportAlarmVoiceTipsType);
	var bRecord = !GetFunAbility(gDevice.Ability.OtherFunction.NOHDDRECORD);
	var bSnap = (GetFunAbility(gDevice.Ability.EncodeFunction.SnapStream) || GetFunAbility(gDevice.Ability.OtherFunction.SupportSnapSchedule));
	var bNoMulityAlarmLink = GetFunAbility(gDevice.Ability.OtherFunction.NoSupportMulityAlarmLink);
	var bSupportAlarmVoiceTipSelect = false;
	var RegionHtml = 
		'	<div id="MotionSP" style="width:600px; height:400px;">\n' +
		'		<img id="motion_Img" src="" style="position:absolute;' +
		'			width:600px; height:400px;" />\n' +
		'		<canvas id="motion_cvs" width="600" height="400"'+
		'			style="position:absolute;">No Support</canvas>' +
		'	</div>\n' +
		'	<div class="btn_box" style="padding-left:175px;">\n' +						
		'		<button class="btn" id="SaveRegionBtn">' + lg.get("IDS_SAVE") + '</button>\n' +
		'		<button class="btn btn_cancle" id="Region_Cancel">' + lg.get("IDS_CANCEL") + '</button>\n' +
		'	</div>';
		
	var IPCLinkHtml =
		'	<div class="check-btn-box" id="MV_enableBox" style="margin-top:15px">\n' +
		'		<span id="MVNVR_VoiceBox" style="width:130px">\n' +
		'			<input id="MVNVRVoice" type="checkbox"/>\n' +
		'			<label for="MVNVRVoice" id="MVNVRVoiceL">'+ lg.get("IDS_ALARM_SOUND") +
		'			</label>\n' +				
		'		</span>\n' +		
		'		<span id="MV_AlarmLightBox">\n' +
		'			<input id="AlarmLight" type="checkbox"/>\n' +
		'			<label for="AlarmLight" id="AlarmLightL">'+ lg.get("IDS_ALARM_LightS") +
		'			</label>\n' +				
		'		</span>\n' +
		'	</div>\n' +
		'	<div id="NVR_VoiceBox">\n' +
		'		<div class="cfg_row" id="NVR_VoiceTipDiv">\n' +
		'			<div class="cfg_row_left" id="NVR_VoiceTipL">'+ lg.get("IDS_VOICE_PROMPT") +'</div>\n' +
		'			<div class="cfg_row_right">\n' +
		'				<select class="select" id="NVR_VoiceTip" style="float:left"></select>\n' +
		'			</div>\n' +
		'		</div>\n' +

		'		<div class="cfg_row" id="NVR_VoiceCustomDiv">\n' +
		'			<div class="cfg_row_left" id="NVR_VoiceCustomL">'+ lg.get("IDS_CUSTOM") +'</div>\n' +
		'			<div class="cfg_row_right">\n' +
		'				<button id="NVR_VoiceCustomBtn" class="btn autoWidth"' +
		'				style="margin-left:0px;">'+ lg.get("IDS_SETTING") +'</button>\n' +
		'			</div>\n' +
		'		</div>\n' +
		'	</div>\n' +
		'	<div class="btn_box" style="padding-left:150px;">\n' +
		'		<button class="btn" id="IPCLink_OK">'+ lg.get("IDS_OK") +'</button>\n' +
		'		<button class="btn btn_cancle" id="IPCLink_Cancle">'+ lg.get("IDS_CANCEL") +
		'		</button>\n' +
		'	</div>';
	
	function ShowData(nIndex) {
		$(".rightEx > div[name='all']").css({
			"background-color": "transparent",
			color: "inherit"
		});
		if (nIndex >= gDevice.loginRsp.ChannelNum){
			$("#MV_HumanEnableDiv").css("display", "none");
			bHuman = false;	
			if (GetFunAbility(gDevice.Ability.OtherFunction.ShowAlarmLevelRegion)){
				$("#LevelRegionBox").css("display", "");				
			}else{
				$("#LevelRegionBox").css("display", "none");
			}
		}else{
			$("#LevelRegionBox").css("display", "");
		}
		if (bHumanCfg){
			$("#MV_HumanEnableDiv").css("display", "");
			var bEnable = HumanCfg[nIndex][HumanCfg[nIndex].Name].Enable
			$("#MV_HumanEnable").attr("data", bEnable ? 1 : 0);
			if(bEnable && bIPCPeaRule && bIPC){
				RegionL.innerHTML = lg.get("IDS_CA_RULE");
			}else{
				RegionL.innerHTML = lg.get("IDS_Region");
			}
			bHuman = true;
		}
		if (bNVRHuman){
			if (nIndex >= gDevice.loginRsp.VideoInChannel){
				var nDiaChannel = nIndex;
				if (digitalHumanAbility[nDiaChannel].HumanDection){
					$("#MV_HumanEnableDiv").css("display", "");
					var bEnable = HumanCfg[nDiaChannel][HumanCfg[nDiaChannel].Name].Enable
					$("#MV_HumanEnable").attr("data", bEnable ? 1 : 0);
					
					bHuman = true;
					if(bEnable && chPeaInHumanPed[nIndex]){
						RegionL.innerHTML = lg.get("IDS_CA_RULE");
					}else{
						RegionL.innerHTML = lg.get("IDS_Region");
					}
				}else{
					$("#MV_HumanEnableDiv").css("display", "none");
					RegionL.innerHTML = lg.get("IDS_Region");
					bHuman = false;
				}
				if (digitalHumanAbility[nDiaChannel].SupportAlarmLinkLight || digitalHumanAbility[nDiaChannel].SupportAlarmVoiceTips){
					$("#MV_IPCLinkDiv").css("display", "");
				}else{
					$("#MV_IPCLinkDiv").css("display", "none");
				}
			}else{
				$("#MV_HumanEnableDiv").css("display", "none");
				bHuman = false;

				$("#MV_IPCLinkDiv").css("display", "none");
				RegionL.innerHTML = lg.get("IDS_Region");
			}
		}else{
			$("#MV_IPCLinkDiv").css("display", "none");
		}
		if (!bNVRHuman && !bHumanCfg){
			$("#MV_HumanEnableDiv").css("display", "none");
			RegionL.innerHTML = lg.get("IDS_Region");
			bHuman = false;
		}

		var cfg = motionCfg[nIndex][motionCfg[nIndex].Name];
		$("#MVSensitivity").val(cfg.Level);
		var btnFlag = cfg.Enable?1:0;
		$("#MotionChnSwitch").attr("data", btnFlag);
		var eventHandler = cfg.EventHandler;
		$("#MVEventLatch").val(eventHandler.EventLatch);
		$("#MVSendEmail").prop("checked", eventHandler.MailEnable);
		$("#MVShowMessage").prop("checked", eventHandler.TipEnable);       
		$("#MVPhone").prop("checked", eventHandler.MessageEnable);
		$("#MVFTP").prop("checked", eventHandler.FTPEnable);
		$("#MVWriteLog").prop("checked", eventHandler.LogEnable );
		if(gDevice.loginRsp.AlarmOutChannel > 0){
			$("#MVAODelay").val(eventHandler.AlarmOutLatch);
			ShowMask("#MV_AOChannelDiv > div[name!='all']", eventHandler.AlarmOutMask);
		}
		if(bRecord){
			$("#MVRecordDelay").val(eventHandler.RecordLatch);
			if(bNoMulityAlarmLink){
				$("#MVRecord").prop("checked", eventHandler.RecordEnable);
			}else{
				ShowMask("#MV_RecChannelDiv > div[name!='all']", eventHandler.RecordMask);
			}
		}
		if(bNoMulityAlarmLink){
			$("#MVTour").prop("checked", eventHandler.TourEnable);
		}else{
			ShowMask("#MV_TourChannelDiv > div[name!='all']", eventHandler.TourMask);
		}		
		if(bSnap){
			if(bNoMulityAlarmLink){
				$("#MVSnap").prop("checked", eventHandler.SnapEnable);
			}else{
				ShowMask("#MV_SnapChannelDiv > div[name!='all']", eventHandler.SnapShotMask);
			}
		}
		if(bVoiceTip){
			$("#VoiceTip").val(eventHandler.VoiceType);
		}
		if(bSupportAlarmVoiceTipSelect){
			if(bHumanCfg){
				$("#VoiceTipDiv").css("display", $("#MV_HumanEnable").attr("data") * 1 ? "" : "none");
			}
			else{
				$("#VoiceTipDiv").css("display", "");
			}
		}
		if(bSupportAlarmVoiceInterval){
			$("#VoiceInterval").val(eventHandler.VoiceTipInterval);
		}
		if(GetFunAbility(gDevice.Ability.OtherFunction.SupportAlarmVoiceTips)){
			$("#MVVoice").prop("checked", eventHandler.VoiceEnable);
		}else{
			SetAlarmToneType(eventHandler,"#mo_AbAlarmToneType","#mo_AbAlarmTone");
			ChangeVoiceType("#mo_AbAlarmToneType","#mo_alarmAndCustom");
		}
		OnClickedEnable();
		InitButton();
	}
	function GetHumanCfg(nIndex, callback){
		RfParamCall(function(a){
			if(a.Ret == 100){
				humanAbility[nIndex] = a[a.Name];
				if(bIPC && bShowRule && isObject(humanAbility[nIndex]) && humanAbility[nIndex].ShowRule)
				{
					var msg = {
						"MainType": 34,
						"SubType": 2				
					}
					borderColor = "#0000ff";
					borderWidth = 4;
					gDevice.sendHumanCfg(msg, function(a){
						if(a.Ret == 100)
						{
							borderColor = a.RuleBorderColor;
							borderWidth = a.RuleBorderWidth;
						}
						RfParamCall(function(a){
							HumanCfg[nIndex] = a; 
							callback();
						}, pageTitle, "Detect.HumanDetection", nIndex, WSMsgID.WsMsgID_CONFIG_GET);
					});
					return;
				}
			}

			RfParamCall(function(a){
				HumanCfg[nIndex] = a; 
				callback();
			}, pageTitle, "Detect.HumanDetection", nIndex, WSMsgID.WsMsgID_CONFIG_GET);
		}, pageTitle, "HumanRuleLimit", -1, WSMsgID.WsMsgID_ABILITY_GET);
	}
	function GetDigitalHuman(nChn, callback){
		if(nChn < gDevice.loginRsp.VideoInChannel){
			callback();
			return;
		}
		RfParamCall(function(a){
			if (typeof a[a.Name] == 'undefined'){
				digitalHumanAbility[nChn] = {};
				digitalHumanAbility[nChn].HumanDection = false;
				digitalHumanAbility[nChn].SupportAlarmLinkLight = false;
				digitalHumanAbility[nChn].SupportAlarmVoiceTips = false;
				digitalHumanAbility[nChn].SupportAlarmVoiceTipsType = false;
			}else{
				digitalHumanAbility[nChn] = a[a.Name];
			}
			if(!digitalHumanAbility[nChn].HumanDection){
				GetDetectIPC(nChn, function(){
					callback();
				});
			}else{
				RfParamCall(function(a){
					chPeaInHumanPed = a[a.Name]; 
					RfParamCall(function(a){
						humanAbility[nChn] = a[a.Name];
						RfParamCall(function(a){
							HumanCfg[nChn] = a; 
							GetDetectIPC(nChn, function(){
								callback();
							});
						}, pageTitle, "Detect.HumanDetection", nChn, WSMsgID.WsMsgID_CONFIG_GET);
					}, pageTitle, "ChannelHumanRuleLimit", nChn, WSMsgID.WSMsgID_CHANNEL_ABILITY_GET_REQ);
				}, pageTitle, "ChannelSystemFunction@SupportPeaInHumanPed", -1, WSMsgID.WSMsgID_CHANNEL_ABILITY_GET_REQ);
			}
		}, pageTitle, "NetUse.DigitalHumanAbility", nChn, WSMsgID.WsMsgID_CONFIG_GET);
	}
	function GetDetectIPC(nChn, callback){
		if (digitalHumanAbility[nChn].SupportAlarmLinkLight || digitalHumanAbility[nChn].SupportAlarmVoiceTips){
			bGetIPCMotion[nChn] = false;
			RfParamCall(function(a){
				IPCMotion[nChn] = a;
				bGetIPCMotion[nChn] = true;
				callback();
			}, pageTitle, "Detect.MotionDetectIPC", nChn, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			callback();
		}
	}
	function GetMotionCfg(nIndex){
		if(!bGet[nIndex]){
			RfParamCall(function(a){
				motionCfg[nIndex] = a;
				var timeSection = motionCfg[nIndex][motionCfg[nIndex].Name].EventHandler.TimeSection;
				for(var i = 0; i < timeSection.length; i++){
					if(isObject(timeSection[i])){
						for(var j = 0; j < timeSection[i].length ; j++){
							if(timeSection[i][j] == ""){
								timeSection[i][j] = "0 00:00:00-00:00:00";
							}
						}
					}
				}
				motionCfg[nIndex][motionCfg[nIndex].Name].EventHandler.TimeSection = timeSection;
				bGet[nIndex] = true;
				if(bHumanCfg){
					GetHumanCfg(nIndex, function(){
						if(bNVRHuman){
							GetDigitalHuman(nIndex, function(){
								ShowData(nIndex);
								MasklayerHide();
							});
						}else{
							ShowData(nIndex);
							MasklayerHide();
						}
					});
				}else{
					if(bNVRHuman){
						GetDigitalHuman(nIndex, function(){
							ShowData(nIndex);
							MasklayerHide();
						});
					}else{
						ShowData(nIndex);
						MasklayerHide();
					}
				}
			}, pageTitle, "Detect.MotionDetect", nIndex, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			ShowData(nIndex);
		}
	}
	function InitChannel(){
		bCopy = false;
		copyCfg = null;
		for (var j = 0; j < gDevice.loginRsp.ChannelNum; j++) {
			bGet[j] = false;
			motionCfg[j] = null;
			HumanCfg[j] = null;
			humanAbility[j] = null;
			digitalHumanAbility[j] = null;
			bGetIPCMotion[j] = false;
			IPCMotion[j] = null;
		}
		var nIndex = chnIndex;
		if(nIndex == gDevice.loginRsp.ChannelNum){
			nIndex = 0;
		}
		RfParamCall(function(a){
			motionArea = a;
			if(bVoiceTip){
				RfParamCall(function (a){
					VoiceTipCfg = a;
					dataHtml = '';
					$("#VoiceTip").empty();
					var cfg = VoiceTipCfg[VoiceTipCfg.Name].VoiceTip;
					var hideCustomBox = "none";
					for(var i = 0; i < cfg.length; i++){
						dataHtml += '<option value="' + cfg[i].VoiceEnum + '">' + cfg[i].VoiceText + '</option>';
						if(cfg[i].VoiceEnum == 550){
							hideCustomBox = "";
						}
					}
					$("#VoiceTip").append(dataHtml);
					GetMotionCfg(nIndex);
					$("#Custom_box").css("display", hideCustomBox);
				}, pageTitle, "Ability.VoiceTipType", -1, WSMsgID.WsMsgID_CONFIG_GET);
			}else{
				GetMotionCfg(nIndex);
			}						
		}, pageTitle, "MotionArea", -1, WSMsgID.WsMsgID_ABILITY_GET);
	}
	function FillAlarmType(){
		GetLocalVoiceTipType("Detect.MotionDetect", function(){
			GetAlarmToneType("Detect.MotionDetect","#mo_Alarm_tone","#mo_AbAlarmToneType","#mo_AbAlarmTone");
			InitChannel();
		});
	}
	function GetHumanRule(chn, iRule, iTrack, iBorderColor, iBorderWidth){
		var cfg = HumanCfg[chn][HumanCfg[chn].Name];
		cfg.ShowRule = iRule;
		cfg.ShowTrack = iTrack;
		borderColor = iBorderColor;
		borderWidth = iBorderWidth;
	}
	function drawGrid(nRow, nCol){
		var cvs = document.getElementById("motion_cvs");
		var ctx = cvs.getContext('2d');
		var wCell = bkWidth/ nCol;
		var hCell = bkHeight/ nRow;
		ctx.clearRect(0,0,bkWidth,bkHeight);
		ctx.strokeStyle = "#0f0";
		ctx.fillStyle = "#f00";
		ctx.globalAlpha = 0.2;
		var xPos =0;
		var yPos = 0;
		for(var i=0;i < nRow;i++){
			for(var j=0;j< nCol;j++){
				ctx.strokeRect(xPos,yPos,wCell,hCell);
				if(nRegion[i][j]){
					ctx.fillRect(xPos,yPos,wCell,hCell);
				}
				xPos += wCell;
			}
			yPos += hCell;
			xPos = 0;
		}
	}
	function drawPolygon(pts, nRow, nCol){
		var cvs = document.getElementById("motion_cvs");
		var ctx = cvs.getContext('2d');
		ctx.clearRect(0,0,bkWidth,bkHeight);
		ctx.strokeStyle = "#f00";
		ctx.globalAlpha = 1;
		ctx.beginPath();
		var wSpace = parseInt((bkWidth/nCol)/2) < 5 ? parseInt((bkWidth/nCol)/2) : 5;
		var hSpace = parseInt((bkHeight/nRow)/2) < 5 ? parseInt((bkHeight/nRow)/2) : 5;
		var points = [];
		for(var i = 0; i < pts.length; i++){
			var x, y;
			if(pts[i].x <= wSpace){
				x = wSpace;
			}else if(pts[i].x >= bkWidth - wSpace){
				x = bkWidth - wSpace;
			}else{
				x = pts[i].x
			}
			if(pts[i].y <= hSpace){
				y = hSpace;
			}else if(pts[i].y >= bkHeight - hSpace){
				y = bkHeight - hSpace;
			}else{
				y = pts[i].y;
			}
			points.push({x:x, y:y});
		}
		ctx.moveTo(points[0].x, points[0].y);
		for(var i = 1;i < points.length;i++){
			ctx.lineTo(points[i].x, points[i].y);
		}
		ctx.lineTo(points[0].x, points[0].y);
		ctx.stroke();
	}
	function showHumanArea(nChn, _nRow, _nCol){
		MasklayerShow(1);
		Config_Title.innerHTML = lg.get("IDS_Region");
		motion_cvs.innerHTML = lg.get("IDS_NOT_SUPPORT");
		SetWndTop("#Config_dialog", 60);						
		$("#Config_dialog").css("width", '650px');
		$("#Config_dialog").show(function(){
			var region = motionCfg[nChn][motionCfg[nChn].Name].Region;
			bkWidth = $("#motion_cvs").width();
			bkHeight = $("#motion_cvs").height();
			var wCell = bkWidth/_nCol;
			var hCell = bkHeight/_nRow;
			var pointNum = 4;
			var nState = -1;		//鼠标左键按下的位置：1-选择坐标,2-选择边框, 3-选择矩形内部
			var nPointId = -1;		//按顺序左下右上
			var humanPts = [];
			InitArea();
			function InitArea(){
				var leftTop = {x:50, y:40};
				var rightBottom = {x:150, y:85};
				var leftPt = false;
				for (var i = 0 ; i < _nRow ; i++){
					for (var j = 0 ; j < _nCol ; j++){
						if (region[i] & ( 1 << j )){
							var x = j * wCell;
							var y = i * hCell;
							if (!leftPt){
								leftTop.x = x;
								leftTop.y = y;
								leftPt = true;
							}
							rightBottom.x = x + wCell;
							rightBottom.y = y + hCell;
							if (j == _nCol - 1){
								if (bkWidth - rightBottom.x < wCell &&  bkWidth - rightBottom.x > 0){
									rightBottom.x = bkWidth;
								}
							}
							if (i == _nRow - 1){
								if (bkHeight - rightBottom.y < hCell && bkHeight - rightBottom.y > 0){
									rightBottom.y = bkHeight;
								}
							}
						}
					}
				}
				humanPts.push({x: leftTop.x, y: leftTop.y});
				humanPts.push({x: leftTop.x, y: rightBottom.y});
				humanPts.push({x: rightBottom.x, y: rightBottom.y});
				humanPts.push({x: rightBottom.x, y: leftTop.y});
			}
			var offset = $("#motion_cvs").offset();
			$("#motion_cvs").unbind();
			$("#motion_cvs").mousedown(function(e){
				if (e.button ==0) {		//鼠标左键
					var beginPos = {"x": e.pageX - offset.left, "y": e.pageY-offset.top};
					nState = -1;
					nPointId = -1;
					CheckSelect(beginPos);			
					$(this).bind("mousemove",function(ev){
						var endPos = {"x": ev.pageX - offset.left, "y":ev.pageY - offset.top};
						var points = humanPts;
						
						if(nState == 3){
							var temp = cloneObj(points);
							for(var i=0; i < 4; i++){
								temp[i].x += endPos.x - beginPos.x;
								temp[i].y += endPos.y - beginPos.y;
								if(!CheckPoint(temp[i])){
									return;
								}
							}
							for(var i=0; i < 4; i++){
								points[i].x = temp[i].x;
								points[i].y = temp[i].y;
							}
							beginPos = endPos;
						}else if(nState == 1){
							var temp = cloneObj(points);
							var nNextPointId = nPointId + 1;
							if (nPointId == pointNum - 1) {
								nNextPointId = 0;
							}
							if (temp[nNextPointId].x == points[nPointId].x) {
								temp[nNextPointId].x = temp[nPointId].x += endPos.x - beginPos.x;
							} 
							if(temp[nNextPointId].y == points[nPointId].y) {
								temp[nNextPointId].y = temp[nPointId].y += endPos.y - beginPos.y;
							}
							/*设置矩形最小长宽为30*/
							if(nPointId == 0 && temp[nPointId + 2].x - temp[nPointId].x <= 30){
								temp[nNextPointId].x = temp[nPointId].x = temp[nPointId + 2].x - 30;
							}
							if(nPointId == 1 && temp[nPointId].y - temp[nPointId + 2].y <= 30){
								temp[nNextPointId].y = temp[nPointId].y = temp[nPointId + 2].y + 30;
							}
							if(nPointId == 2 && temp[nPointId].x - temp[nPointId - 2].x <= 30){
								temp[nNextPointId].x = temp[nPointId].x = temp[nPointId - 2].x + 30;
							}
							if(nPointId == 3 && temp[nPointId - 2].y - temp[nPointId].y <= 30){
								temp[nNextPointId].y = temp[nPointId].y = temp[nPointId - 2].y - 30;
							}
							if (!CheckPoint(temp[nPointId]) || !CheckPoint(temp[nNextPointId])) {
								return;
							}
							points[nPointId].x = temp[nPointId].x;
							points[nPointId].y = temp[nPointId].y;
							points[nNextPointId].x = temp[nNextPointId].x;
							points[nNextPointId].y = temp[nNextPointId].y;
							beginPos = endPos;
						}
						drawPolygon(humanPts, _nRow, _nCol);
					}); 
				}
			}).mouseup(function(e){
				$(this).unbind("mousemove");
			}).mouseout(function(e){
				$(this).unbind("mousemove");
			});
			drawPolygon(humanPts, _nRow, _nCol);
			function CheckPoint(pt){
				if(pt.x >= 0 && pt.x <= bkWidth && pt.y >=0 && pt.y <= bkHeight) {
					return true;
				}
				return false;
			}
			function CheckSelect(pt){
				var bFinded = false;
				var points = humanPts;
				for ( var n = 0; n < points.length; n ++ ){
					if(Math.abs(pt.x - points[n].x)<5 && Math.abs(pt.y - points[n].y) < 5){
						bFinded = true;
						nState = 2;
						nPointId = n;
					}
				}
				if(nState == -1){
					var lna = 0;
					var lnb = 0;
					var lnc = 0;
					for (var j = 0; j < pointNum; j++){
						var k = j+1 < pointNum ? j+1 : 0;
						lna = (points[j].x-points[k].x) * (points[j].x-points[k].x) + 
								(points[j].y-points[k].y) * (points[j].y-points[k].y);
						lnb = (pt.x-points[k].x) * (pt.x-points[k].x) + 
								(pt.y-points[k].y) * (pt.y-points[k].y);
						lnc = (pt.x-points[j].x) * (pt.x-points[j].x) + 
								(pt.y-points[j].y) * (pt.y-points[j].y);
	
						if ((Math.sqrt(lnb) + Math.sqrt(lnc)) < (Math.sqrt(lna)+1)){
							nState=1;
							nPointId=j;
							bFinded = true;
						}
					}
				}
				if(nState == -1){
					if(PtInPolygon(pt, points, pointNum)){
						bFinded = true;
						nState=3;
					}
				}
				return bFinded;
			}
			$("#SaveRegionBtn").unbind().click(function() {
				var leftTop = HitTest(humanPts[0]);
				var rightBottom = HitTest(humanPts[2]);	
				for (var i = 0 ; i < _nRow ; i++){
					var Region_temp = region[i];
					Region_temp = Region_temp.substring(2);
					var mask = [];
					mask[1] = parseInt(Region_temp.substr(0, 4), 16);
					mask[0] = parseInt(Region_temp.substr(4, 4), 16);
					for (var j = 0 ; j < 32 ; j++){
						var m = parseInt(j/16); 
						var n = j % 16;
						if(j < _nCol){
							if (j >= leftTop.x && j <= rightBottom.x && i >= leftTop.y && i <= rightBottom.y ){
								mask[m] |= 1 << n; 
							}else{
								mask[m] = mask[m] & ~(1 << n);
							}
						}
						else
						{
							mask[m] = mask[m] & ~(1 << n);
						}
					}
					region[i] ="0x" + toHex(mask[1],4) + toHex(mask[0],4);
				}
				closeDialog();
			});
			function HitTest(point){
				var pos = {x:0, y:0};
				if (point.x < 0){
					point.x = 0;
				}
	
				if (point.y < 0){
					point.y = 0;
				}
	
				if (wCell && hCell){
					pos.x = parseInt(point.x / wCell);	//列
					pos.y = parseInt(point.y / hCell);	//行
				}
				return pos;
			}
		});
		
	}
	function showMotionArea(nChn, _nRow, _nCol){
		MasklayerShow(1);
		Config_Title.innerHTML = lg.get("IDS_Region");
		motion_cvs.innerHTML = lg.get("IDS_NOT_SUPPORT");
		SetWndTop("#Config_dialog");						
		$("#Config_dialog").css("width", '650px');
		
		$("#Config_dialog").show(function(){
			var region = motionCfg[nChn][motionCfg[nChn].Name].Region;
			bkWidth = $("#motion_cvs").width();
			bkHeight = $("#motion_cvs").height();
			var wCell =  bkWidth/ _nCol;
			var hCell = bkHeight/_nRow;
			nRegion = [];
			for(var i=0;i < _nRow;i++){
				nRegion[i] = [];
				for(var j=0;j<_nCol;j++){
					nRegion[i][j] = ExtractMask(region[i],j)?true:false;
				}
			}
			var offset = $("#motion_cvs").offset();
			$("#motion_cvs").unbind();
			$("#motion_cvs").mousedown(function(e){
				if(e.button ==0){
					var pt = {x:e.pageX - offset.left,
					y:e.pageY-offset.top};
					var pos = GetPos(pt);
					if(pos.x > _nCol || pos.y > _nRow) return;
					nRegion[pos.y][pos.x] = !nRegion[pos.y][pos.x];
					drawGrid(_nRow, _nCol);
					$(this).bind("mousemove",function(ev){
						var pt2 = {x:ev.pageX - offset.left,
						y:ev.pageY-offset.top};
						var pos2 = GetPos(pt2);
						if(pos2.x > _nCol || pos2.y > _nRow) return;
						var bx = pos.x > pos2.x ?pos2.x:pos.x;
						var ex = pos.x > pos2.x ?pos.x:pos2.x;
						var by = pos.y > pos2.y ?pos2.y:pos.y;
						var ey = pos.y > pos2.y ?pos.y:pos2.y;
						for(var i = by;i<=ey;i++){
							for(var j =bx;j<=ex;j++){
								nRegion[i][j] = nRegion[pos.y][pos.x];
							}
						}
						drawGrid(_nRow, _nCol);
					});
				}
			}).mouseup(function(e){
				$(this).unbind("mousemove");
			}).mouseout(function(e){
				$(this).unbind("mousemove");
			});
			function GetPos(pt){
				if(pt.x < 0)pt.x=0;
				if(pt.y < 0)pt.y =0;
				var pos = {x:0,y:0};
				if(hCell && wCell){
					pos.x = parseInt(pt.x  / wCell);
					pos.y = parseInt(pt.y /hCell);
				}
				return pos;
			}
			drawGrid(_nRow, _nCol);
			$("#SaveRegionBtn").unbind().click(function() {
				for (var i = 0; i < _nRow; i++){
					var Region_temp = region[i];
					Region_temp = Region_temp.substring(2);
					var mask = [];
					mask[1] = parseInt(Region_temp.substr(0, 4), 16);
					mask[0] = parseInt(Region_temp.substr(4, 4), 16);
					for (var j = 0; j < 32; j++){		// 列上限32位
						var m = parseInt(j/16);
						var n = j % 16;
						if(j < _nCol)
						{
							if (nRegion[i][j]){
								mask[m] |= 1 << n;
							}else{
								mask[m] = mask[m] & ~(1 << n);
							}
						}
						else				// 超过列的位,置0
						{
							mask[m] = mask[m] & ~(1 << n);
						}
					}
					region[i] ="0x" + toHex(mask[1],4) + toHex(mask[0],4);
				}
				$(".dialog_role").css("display", "none");
				MasklayerHide();
			});
		});
	}
	function ShowAreaSet(nChn, nRow, nCol){
		var bShow = bHuman;
		var bEnable = $("#MV_HumanEnable").attr("data") * 1 ? true : false;
		if (!(bShow && bEnable)){
			if(nRow == 0 || nCol == 0){
				MasklayerHide();
				ShowPaop(pageTitle, lg.get("IDS_INFO_NO_SUPPORT"));
				return;
			}
			$("#Config_dialog .content_container").html(RegionHtml);
			function showPic(imgUrl){
				MasklayerShow(1);
				if(imgUrl == ""){
					$("#motion_Img").css("display", "none");
				}else{
					$("#motion_Img").attr("src", imgUrl);
					$("#motion_Img").css("display", "");
				}
				showMotionArea(nChn, nRow, nCol);
			}
			gDevice.ParamCapture(nChn, function(a){
				var b = "";
				if(a.Ret == WEB_ERROR.ERR_SUCESS){
					if(WebCms.plugin.isLoaded){
						b = gVar.captureUrl;
						var timeStamp = (new Date).getTime();
						b = b + "?update=" + timeStamp;
					}else{
						b = a.url;
					}
				}
				showPic(b);
			});
		}else{
			if((bNVRHuman && chPeaInHumanPed[nChn]) || (bHumanCfg && bIPCPeaRule)){
				MasklayerShow();
				var _parent = "#Config_dialog .content_container";
				gVar.LoadChildConfigPage("PEA_Zone", "Human_Zone", _parent, function(){
					Config_Title.innerHTML = lg.get("IDS_CA_RULE");
					lan("PEA_Zone");
					SetWndTop("#Config_dialog");
					$("#Config_dialog").css("width", '650px');
					var cfg = HumanCfg[nChn][HumanCfg[nChn].Name];
					function showPic(imgUrl){
						MasklayerShow(1);
						if(imgUrl == ""){
							$("#PEA_Img").css("display", "none");
						}else{
							$("#PEA_Img").attr("src", imgUrl);
							$("#PEA_Img").css("display", "");
						}
						$("#Config_dialog").show(500);
						HumanZoneObj = new HumanZone({
							nChannel: nChn,		
							iShowRule: cfg.ShowRule,
							iShowTrack: cfg.ShowTrack,
							humanAbility: humanAbility[nChn],
							PedRule: cfg.PedRule,
							bShowRuleStyle: bIPC && bShowRule && isObject(humanAbility[nChn]) && humanAbility[nChn].ShowRule,
							iBorderColor: borderColor,
							iBorderWidth: borderWidth,
							SaveCallback: GetHumanRule
						});
					}
					gDevice.ParamCapture(nChn, function(a){
						var b = "";
						if(a.Ret == WEB_ERROR.ERR_SUCESS){
							if(WebCms.plugin.isLoaded){
								b = gVar.captureUrl;
								var timeStamp = (new Date).getTime();
								b = b + "?update=" + timeStamp;
							}else{
								b = a.url;
							}
						}
						showPic(b);
					});
				});			
			}else{
				if(nRow == 0 || nCol == 0){
					MasklayerHide();
					ShowPaop(pageTitle, lg.get("IDS_INFO_NO_SUPPORT"));
					return;
				}
				$("#Config_dialog .content_container").html(RegionHtml);
				function showPic(imgUrl){
					MasklayerShow(1);
					if(imgUrl == ""){
						$("#motion_Img").css("display", "none");
					}else{
						$("#motion_Img").attr("src", imgUrl);
						$("#motion_Img").css("display", "");
					}
					showHumanArea(nChn, nRow, nCol);
				}
				gDevice.ParamCapture(nChn, function(a){
					var b = "";
					if(a.Ret == WEB_ERROR.ERR_SUCESS){
						if(WebCms.plugin.isLoaded){
							b = gVar.captureUrl;
							var timeStamp = (new Date).getTime();
							b = b + "?update=" + timeStamp;
						}else{
							b = a.url;
						}
					}
					showPic(b);
				});
			}
		}
	}
	function CHOSDSaveSel(nIndex) {
		var cfg = motionCfg[nIndex][motionCfg[nIndex].Name];
		if(isObject(cfg)){
			cfg.Enable = $("#MotionChnSwitch").attr("data") * 1?true:false;
			cfg.Level = $("#MVSensitivity").val()*1;
			var eventHandler = cfg.EventHandler;
			eventHandler.EventLatch = $("#MVEventLatch").val() * 1;			
			if(gDevice.loginRsp.AlarmOutChannel > 0){
				eventHandler.AlarmOutLatch = $("#MVAODelay").val() * 1;
				eventHandler.AlarmOutMask = GetMasks("#MV_AOChannelDiv > div[name!='all']");
				eventHandler.AlarmOutEnable = false;
				if (parseInt(eventHandler.AlarmOutMask) > 0){
					eventHandler.AlarmOutEnable = true;
				}
			}
			if(bRecord){
				eventHandler.RecordLatch = $("#MVRecordDelay").val() * 1;
				if (bNoMulityAlarmLink){
					eventHandler.RecordEnable = $("#MVRecord").prop("checked");
					eventHandler.RecordMask = GetSingleChnMasks(eventHandler.RecordEnable, nIndex);
				}else{
					eventHandler.RecordMask = GetMasks("#MV_RecChannelDiv > div[name!='all']");
					eventHandler.RecordEnable = false;
					if (parseInt(eventHandler.RecordMask) > 0) {
						eventHandler.RecordEnable = true;
					}
				}
			}
			if (bNoMulityAlarmLink){
				eventHandler.TourEnable = $("#MVTour").prop("checked");
				eventHandler.TourMask = GetSingleChnMasks(eventHandler.TourEnable, nIndex);
			}else{
				eventHandler.TourMask = GetMasks("#MV_TourChannelDiv > div[name!='all']");
				eventHandler.TourEnable = false;
				if (parseInt(eventHandler.TourMask)){
					eventHandler.TourEnable = true;
				}
			}
			
			if(bSnap){
				if (bNoMulityAlarmLink){
					eventHandler.SnapEnable = $("#MVSnap").prop("checked");
					eventHandler.SnapShotMask = GetSingleChnMasks(eventHandler.SnapEnable, nIndex);
				}else{
					eventHandler.SnapShotMask = GetMasks("#MV_SnapChannelDiv > div[name!='all']");
					eventHandler.SnapEnable = false;
					if (parseInt(eventHandler.SnapShotMask) > 0) {
						eventHandler.SnapEnable = true;
					}
				}
			}
			eventHandler.MailEnable = $("#MVSendEmail").prop("checked");
			eventHandler.TipEnable = $("#MVShowMessage").prop("checked");       
			eventHandler.MessageEnable = $("#MVPhone").prop("checked");
			eventHandler.FTPEnable = $("#MVFTP").prop("checked");
			eventHandler.LogEnable = $("#MVWriteLog").prop("checked");
			
			if(bVoiceTip){
				if($("#MV_HumanEnable").attr("data") * 1)
				{
					eventHandler.VoiceType = $("#VoiceTip").val() * 1;
				}
				else				// 移动侦测使用默认警铃声
				{
					eventHandler.VoiceType = 24;
				}
			}
			if(bSupportAlarmVoiceInterval){
				eventHandler.VoiceTipInterval = $("#VoiceInterval").val() * 1;
			}
			if(GetFunAbility(gDevice.Ability.OtherFunction.SupportAlarmVoiceTips)){
				eventHandler.VoiceEnable = $("#MVVoice").prop("checked");
			}else{
				SaveAlarmToneType(eventHandler,"#mo_AbAlarmToneType","#mo_AbAlarmTone");
			}
			return true;
		}
		return false;
    }
	function SaveAllCfg(){
		var CfgData = {
			"Name": "Detect.MotionDetect.[ff]",
			"Detect.MotionDetect.[ff]": cloneObj(motionCfg[0][motionCfg[0].Name])
		};
		SetAlarmLinkAllEnable(CfgData);
		RfParamCall(function (data){
			if(bNVRHuman && isObject(IPCMotion[0])){
				CfgData = null;
				CfgData = {
					"Name": "Detect.MotionDetectIPC.[ff]",
					"Detect.MotionDetectIPC.[ff]": cloneObj(IPCMotion[0][IPCMotion[0].Name])
				};
				RfParamCall(function (data){
					InitChannel();
					ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
				}, pageTitle, CfgData.Name, -1, WSMsgID.WsMsgID_CONFIG_SET, CfgData)
			}else{
				InitChannel();
				ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
			}
		}, pageTitle, CfgData.Name, -1, WSMsgID.WsMsgID_CONFIG_SET, CfgData);
	}
	function SaveIPCMotion(nIndex){
		if(nIndex < gDevice.loginRsp.ChannelNum){
			if (bNVRHuman && isObject(digitalHumanAbility[nIndex]) && (digitalHumanAbility[nIndex].SupportAlarmLinkLight || digitalHumanAbility[nIndex].SupportAlarmVoiceTips)
			&& bGetIPCMotion[nIndex]){
				//2019-04-16 同步是否启用选项
				IPCMotion[nIndex][IPCMotion[nIndex].Name].Enable = motionCfg[nIndex][motionCfg[nIndex].Name].Enable;
				RfParamCall(function(a){
					SaveIPCMotion(nIndex + 1);
				}, pageTitle, "Detect.MotionDetectIPC", nIndex, WSMsgID.WsMsgID_CONFIG_SET, IPCMotion[nIndex]);
			}else{
				SaveIPCMotion(nIndex + 1);
			}
		}else{
			ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
		}
	}
	function SaveHumanCfg(nIndex){
		if(nIndex < gDevice.loginRsp.ChannelNum){
			if (bGet[nIndex] && (bHumanCfg || (bNVRHuman && isObject(digitalHumanAbility[nIndex])
				&& digitalHumanAbility[nIndex].HumanDection))){
				RfParamCall(function(a){
					if(bIPC && bShowRule && isObject(humanAbility[nIndex]) && humanAbility[nIndex].ShowRule){					// IPC
						var msg = {
							"MainType": 34,
							"SubType": 3,
							"RuleBorderColor": borderColor,
							"RuleBorderWidth": borderWidth
						}
						gDevice.sendHumanCfg(msg, function(a){
							msg = {
								"MainType": 34,
								"SubType": 1,
								"Channel": nIndex,
								"ShowRule": HumanCfg[nIndex][HumanCfg[nIndex].Name].ShowRule,
								"AreaNum": humanAbility[nIndex].AreaNum,
								"LineNum": humanAbility[nIndex].LineNum,
								"PedRule": HumanCfg[nIndex][HumanCfg[nIndex].Name].PedRule,							
							};
							gDevice.sendHumanCfg(msg, function(a){
								SaveHumanCfg(nIndex + 1);
							});
						});
					}
					else{
						SaveHumanCfg(nIndex + 1);
					}
				}, pageTitle, "Detect.HumanDetection", nIndex, WSMsgID.WsMsgID_CONFIG_SET, HumanCfg[nIndex]);
			}else{
				SaveHumanCfg(nIndex + 1);
			}
		}else{
			if(bNVRHuman){
				SaveIPCMotion(gDevice.loginRsp.VideoInChannel);
			}else{
				ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
			}
		}
	}
	function SaveCfg(nIndex){
		if(nIndex < gDevice.loginRsp.ChannelNum){
			if(bGet[nIndex]){
				RfParamCall(function (data){
					SaveCfg(nIndex + 1);
				}, pageTitle, "Detect.MotionDetect", nIndex, WSMsgID.WsMsgID_CONFIG_SET, motionCfg[nIndex]);
			}else{
				SaveCfg(nIndex + 1);
			}
		}else{
			if(bHumanCfg || bNVRHuman){
				SaveHumanCfg(0);
			}else{
				ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
			}
		}
	}
	function OnClickedEnable(){
		var _flag = $("#MotionChnSwitch").attr("data") * 1;
        DivBox(_flag, "#MVDivBoxAll");
		DivBox(_flag, "#MV_IPCLinkDiv");
		DivBox(_flag, "#MV_HumanEnableDiv");
		DivBox(_flag, "#VoiceIntervalDiv");
		if(_flag){
			$("#MVDivBoxAll .MaskDiv").css("display", "none");
		}else{
			$("#MVDivBoxAll .MaskDiv").css("display", "block");
		}
		
		var bVoice = $("#MVVoice").prop("checked");
		if (_flag && bVoice){
			DivBox(1, "#VoiceTipDiv");
			
			var nVoice = $("#VoiceTip").val() * 1;
			if (550 != nVoice){
				DivBox(0, "#Custom_box");
			}else{
				DivBox(1, "#Custom_box");
			}
			DivBox(1, "#VoiceIntervalDiv");
		}else{
			DivBox(0, "#VoiceTipDiv");
			DivBox(0, "#VoiceIntervalDiv");
		}
	}
	$(function(){
		if (bNoMulityAlarmLink){
			$("#AlarmLinkBox").css("display", "");
			$("#MulityAlarmLinkBox").css("display", "none");
			$("#MV_enableBox").addClass("group-box").css("margin-top", "5px");
		}else{
			$("#AlarmLinkBox").css("display", "none");
			$("#MulityAlarmLinkBox").css("display", "");
		}
		if (bIPC) {
			$("#table_channel, #MV_DivBoxTour, #MV_TourBox, #MV_ShowMessageBox, #MVCP, #MVPaste").css("display", "none");
			$("#table_channel").parent().css("display", "none");

			if(bHumanCfg && GetFunAbility(gDevice.Ability.OtherFunction.SupportAlarmVoiceTipInterval)){
				bSupportAlarmVoiceInterval = true;
			}
		}else{
			if(GetFunAbility(gDevice.Ability.OtherFunction.SupportAlarmVoiceTipInterval)){
				bSupportAlarmVoiceInterval = true;
			}
		}
		if (bPetDetect) {
			MV_HumanEnableL.innerHTML = lg.get("IDS_PET_DETECT");
		}
		if(gDevice.bGetDefault){
			$("#MVDefault").css("display", "");
		}

		if(!GetFunAbility(gDevice.Ability.OtherFunction.SupportAlarmVoiceTips)){
			$("#MV_VoiceBox").css("display", "none");
		}
		if(bVoiceTip && GetFunAbility(gDevice.Ability.OtherFunction.SupportAlarmVoiceTips)){
			$("#VoiceTipDiv").css("display", "");
			bSupportAlarmVoiceTipSelect = true;
		}
		if(bSupportAlarmVoiceInterval){
			$("#VoiceIntervalDiv").css("display", "");
		}	
		if (GetFunAbility(gDevice.Ability.TipShow.NoEmailTipShow)) {
			$("#MV_SendEmailBox").css("display", "none")
		}
		if (!bRecord) {
			$("#MV_DivBoxRecord, #MV_RecordDelayDiv, #MV_RecordBox").css("display", "none");
		}else {
			recChannel("MV_RecChannelDiv", color, bColor);
			ChannelH = $("#MV_DivBoxRecord").height();
			$("#MV_DivBoxRecord .MaskDiv").css("height", ChannelH + "px");
		}
		if(!bSnap) {
			$("#MV_DivBoxSnap, #MV_SnapBox").css("display", "none");
		}else{
			recChannel("MV_SnapChannelDiv", color, bColor);
			ChannelH = $("#MV_DivBoxSnap").height();
			$("#MV_DivBoxSnap .MaskDiv").css("height", ChannelH + "px");
		}
		if(!GetFunAbility(gDevice.Ability.NetServerFunction.NetPMS)){
			$("#MV_PhoneBox").css("display", "none");
		}
		if (GetFunAbility(gDevice.Ability.TipShow.NoFTPTipShow) || !GetFunAbility(gDevice.Ability.NetServerFunction.NetFTP)){
			$("#MV_FTPBox").css("display", "none");
		}
		if (!GetFunAbility(gDevice.Ability.OtherFunction.SupportWriteLog)) {
			$("#MV_WriteLogBox").css("display", "none");
		}
		if(gDevice.loginRsp.BuildTime >= "2011-11-14 13:53:32"){
			var bPtz = GetFunAbility(gDevice.Ability.CommFunction.CommRS485);
			bPtz &= (gDevice.loginRsp.ChannelNum > 0);
			if(bPtz){
				$("#MV_PTZSetDiv").css("display", "");
				$("#MV_RecordDelayDiv").css("margin-left", "400px");
			}else{
				$("#MV_PTZSetDiv").css("display", "none");
				$("#MV_RecordDelayDiv").css("margin-left", "0px");
				$("#MVRecordDelay").removeClass("timeTxt");
			}
		}
		$("#MV_HumanEnableDiv").css("display", bHumanCfg ? "" : "none");
		$("#MV_IPCLinkDiv").css("display", bNVRHuman ? "" : "none");
		if(bIPC && GetFunAbility(gDevice.Ability.OtherFunction.SupportAlarmLinkLight)){
			MVshow_message.innerHTML = lg.get("IDS_PD_LIGHTTS");
			$("#MV_ShowMessageBox").css("display", "");
		}
		else if(GetFunAbility(gDevice.Ability.AlarmFunction.ScreenTip)){
			$("#MV_ShowMessageBox").css("display", "");
		}
		recChannel("MV_TourChannelDiv", color, bColor);
		ChannelH = $("#MV_DivBoxTour").height();
		$("#MV_DivBoxTour .MaskDiv").css("height", ChannelH + "px");
		if(gDevice.loginRsp.AlarmOutChannel == 0){
			$("#MV_AOEvent").css("display", "none");
		}else {	
			recChannel("MV_AOChannelDiv", color, bColor, gDevice.loginRsp.AlarmOutChannel);
			ChannelH = $("#MV_AOEvent").height();
			$("#MV_AOEvent .MaskDiv").css("height", ChannelH + "px");
		}
		for(var j = 1; j <= 6; j++){
			var level = lg.get("IDS_SSV_" + j);
			$("#MVSensitivity").append('<option value="' + j + '">' + level + '</option>');
		}
		$('#MVDivBoxAll :checked').prop("checked",false);
		$("#mv_btn_box").css("margin-left", "115px");
		ChangeBtnState();
		$("#MotionChid").empty();
		var dataHtml = '';
		for (var j = 0; j < gDevice.loginRsp.ChannelNum; j++) {
			bGet[j] = false;
			motionCfg[j] = null;
			HumanCfg[j] = null;
			humanAbility[j] = null;
			digitalHumanAbility[j] = null;
			bGetIPCMotion[j] = false;
			IPCMotion[j] = null;
			dataHtml += '<option value="' + j + '">' + gDevice.getChannelName(j) + '</option>';
		}
		if(gDevice.loginRsp.ChannelNum > 1){
			dataHtml += '<option value="' + j + '">' + lg.get("IDS_CFG_ALL") + '</option>';
		}
		$("#MotionChid").append(dataHtml);
		if(chnIndex == -1){
			chnIndex = 0;
		}
		$("#MotionChid").val(chnIndex);
		$("#RegionSet").click(function (){
			var nChn = $("#MotionChid").val() * 1;
			if (nChn < 0){
				return;
			}
			if(nChn == gDevice.loginRsp.ChannelNum){
				nChn = 0;
			}
			var nRow;
			var nCol;
			if (nChn >= gDevice.loginRsp.VideoInChannel){			
				if(GetFunAbility(gDevice.Ability.OtherFunction.ShowAlarmLevelRegion)){
					RfParamCall(function(a){
						if(a.Ret == 100) {
							motionAreaDig = a;
							nRow = a[a.Name].GridRow;
							nCol = a[a.Name].GridColumn;
							ShowAreaSet(nChn, nRow, nCol);
						}else {
							ShowPaop(pageTitle, lg.get("IDS_NET_TIP_OTHER"));
							MasklayerHide();
							return;
						}
					}, pageTitle, "MotionArea", nChn, WSMsgID.WsMsgID_ABILITY_GET);
				}else {
					motionAreaDig = cloneObj(motionArea);
					nRow = motionAreaDig[motionAreaDig.Name].GridRow;
					nCol = motionAreaDig[motionAreaDig.Name].GridColumn;
					ShowAreaSet(nChn, nRow, nCol);
				}
			}else{
				nRow = motionArea[motionArea.Name].GridRow;
				nCol = motionArea[motionArea.Name].GridColumn;
				ShowAreaSet(nChn, nRow, nCol);
			}
		});
		$("#MotionChid").change(function () {
			var nChn = $("#MotionChid").val() * 1;
			$("#RegionDiv").css("display", "");
			if (nChn == gDevice.loginRsp.ChannelNum){
				GetMotionCfg(0);
				if(gDevice.loginRsp.DigChannel > 0){
					$("#RegionDiv").css("display", "none");
				}
				$("#MV_HumanEnableDiv, #MV_IPCLinkDiv").css("display", "none");
				bHuman = false;
				chnIndex = nChn;
			}else if ( chnIndex == gDevice.loginRsp.ChannelNum){
				GetMotionCfg(nChn);
				chnIndex = nChn;
			}else {
				CHOSDSaveSel(chnIndex);
				GetMotionCfg(nChn);
				chnIndex = nChn;
			}
		});
		$("#MV_HumanEnable").click(function(){
			var nChn = $("#MotionChid").val() * 1;
			if (nChn < 0){
				return;
			}
			if (nChn == gDevice.loginRsp.ChannelNum){
				nChn = 0;
			}
	
			var bEnable = $("#MV_HumanEnable").attr("data") * 1 ? true : false;
			HumanCfg[nChn][HumanCfg[nChn].Name].Enable = bEnable;
			
			if(bSupportAlarmVoiceTipSelect)
			{
				$("#VoiceTipDiv").css("display", bEnable ? "" : "none");
			}

			var nDiaChannel = nChn;
			if(bNVRHuman && nDiaChannel>= 0 && HumanCfg[nDiaChannel][HumanCfg[nDiaChannel].Name].Enable && chPeaInHumanPed[nChn]){
				RegionL.innerHTML = lg.get("IDS_CA_RULE");
			}else if(bHumanCfg && HumanCfg[nChn][HumanCfg[nChn].Name].Enable && bIPCPeaRule && gDevice.loginRsp.VideoInChannel == 1){
				RegionL.innerHTML = lg.get("IDS_CA_RULE");
			}else{
				RegionL.innerHTML = lg.get("IDS_Region");
			}
		});
		$("#MVVoice").click(function(){
			var bVoice = $("#MVVoice").prop("checked");
			var nVoice = $("#VoiceTip").val() * 1;
			DivBox(1, "#Custom_box");
			if (bVoice){
				DivBox(1, "#VoiceTipDiv");
				if (550 != nVoice){
					DivBox(0, "#Custom_box");
				}
				DivBox(1, "#VoiceIntervalDiv");
			}else{
				DivBox(0, "#VoiceTipDiv");
				DivBox(0, "#VoiceIntervalDiv");
			}
		});
		$("#VoiceTip").change(function(){
			var nVoice = $(this).val() * 1;
			if (nVoice == 550){
				DivBox(1, "#Custom_box");
			}else {
				DivBox(0, "#Custom_box");
			}
		});
		$("#MotionChnSwitch").click(function () {
			OnClickedEnable();
		});
		$("#MVRf").click(function () {
			FillAlarmType();
		});
		$("#MVSave").click(function () {
			var nChn = $("#MotionChid").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum && (gDevice.loginRsp.SoftWareVersion > "V2.62.R07" || gDevice.loginRsp.BuildTime > "2024-04-01")){
				CHOSDSaveSel(0);
				SaveAllCfg();
			}else{
				CHOSDSaveSel(nChn);
				SaveCfg(0);
			}
		});
		$("#MVCP").click(function () {
			var nChn = $("#MotionChid").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum){
				nChn = 0;
			}
			CHOSDSaveSel(nChn);
			copyCfg = cloneObj(motionCfg[nChn]);
			bCopy = true;
			if (bHuman){
				bHumanEnable = HumanCfg[nChn][HumanCfg[nChn].Name].Enable;
			}
			if (bNVRHuman && bGetIPCMotion[nChn]){
				copyNVRCfg = cloneObj(IPCMotion[nChn]);
			}
		});
		$("#MVPaste").click(function () {
			if(!bCopy)return;
			$(".rightEx > div[name='all']").css({
				"background-color": "transparent",
				color: "inherit"
			});
			var cfg = copyCfg[copyCfg.Name];		
			var btnFlag = cfg.Enable?1:0;
			$("#MotionChnSwitch").attr("data", btnFlag);
			$("#MVSensitivity").val(cfg.Level);
			var eventHandler = cfg.EventHandler;
			$("#MVEventLatch").val(eventHandler.EventLatch);	
			$("#MVSendEmail").prop("checked", eventHandler.MailEnable);
			$("#MVShowMessage").prop("checked", eventHandler.TipEnable);       
			$("#MVPhone").prop("checked", eventHandler.MessageEnable);
			$("#MVFTP").prop("checked", eventHandler.FTPEnable);
			$("#MVWriteLog").prop("checked", eventHandler.LogEnable);
			if(gDevice.loginRsp.AlarmOutChannel > 0){
				$("#MVAODelay").val(eventHandler.AlarmOutLatch);
				ShowMask("#MV_AOChannelDiv > div[name!='all']", eventHandler.AlarmOutMask);
			}
			if(bRecord){
				$("#MVRecordDelay").val(eventHandler.RecordLatch);
				if(bNoMulityAlarmLink){
					$("#MVRecord").prop("checked", eventHandler.RecordEnable);
				}else{
					ShowMask("#MV_RecChannelDiv > div[name!='all']", eventHandler.RecordMask);
				}
			}
			if(bNoMulityAlarmLink){
				$("#MVTour").prop("checked", eventHandler.TourEnable);
			}else{
				ShowMask("#MV_TourChannelDiv > div[name!='all']", eventHandler.TourMask);
			}		
			if(bSnap){
				if(bNoMulityAlarmLink){
					$("#MVSnap").prop("checked", eventHandler.SnapEnable);
				}else{
					ShowMask("#MV_SnapChannelDiv > div[name!='all']", eventHandler.SnapShotMask);
				}
			}
			$("#MV_HumanEnable").attr("data", bHumanEnable ? 1 : 0);
			var nChn = $("#MotionChid").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum){
				for (var k = 0; k < gDevice.loginRsp.ChannelNum; k++){
					if (!bGet[k]) continue;
					motionCfg[k][motionCfg[k].Name].Region = cfg.Region;
					var cfgHanlder = motionCfg[k][motionCfg[k].Name].EventHandler;
					for (var i = 0; i < 7; i++) {
						for (var j = 0; j < 6; j++) {
							cfgHanlder.TimeSection[i][j] = eventHandler.TimeSection[i][j];
						}
					}
	
					for (var m = 0; m < gDevice.loginRsp.ChannelNum; m++) {
						cfgHanlder.PtzLink[m][0] = eventHandler.PtzLink[m][0];
						cfgHanlder.PtzLink[m][1] = eventHandler.PtzLink[m][1];
					}
					
					if (bNVRHuman && bGetIPCMotion[k]){
						IPCMotion[k][IPCMotion[k].Name].EventHandler.VoiceEnable = copyNVRCfg[copyNVRCfg.Name].EventHandler.VoiceEnable;
						IPCMotion[k][IPCMotion[k].Name].EventHandler.TipEnable = copyNVRCfg[copyNVRCfg.Name].EventHandler.TipEnable;
					}
				}
			} else {
				motionCfg[nChn][motionCfg[nChn].Name].Region = cfg.Region;
				var cfgHanlder = motionCfg[nChn][motionCfg[nChn].Name].EventHandler;
				for (var i = 0; i < 7; i++) {
					for (var j = 0; j < 6; j++) {
						cfgHanlder.TimeSection[i][j] = eventHandler.TimeSection[i][j];
					}
				}
				for (var m = 0; m < gDevice.loginRsp.ChannelNum; m++) {
					cfgHanlder.PtzLink[m][0] = eventHandler.PtzLink[m][0];
					cfgHanlder.PtzLink[m][1] = eventHandler.PtzLink[m][1];
				}
				if (bNVRHuman && bGetIPCMotion[nChn]){
					IPCMotion[nChn][IPCMotion[nChn].Name].EventHandler.VoiceEnable = copyNVRCfg[copyNVRCfg.Name].EventHandler.VoiceEnable;
					IPCMotion[nChn][IPCMotion[nChn].Name].EventHandler.TipEnable = copyNVRCfg[copyNVRCfg.Name].EventHandler.TipEnable;
				}
			}
			if(bVoiceTip){
				$("#VoiceTip").val(eventHandler.VoiceType);
			}
			if(bSupportAlarmVoiceInterval){
				$("#VoiceInterval").val(eventHandler.VoiceTipInterval);
			}
			if(GetFunAbility(gDevice.Ability.OtherFunction.SupportAlarmVoiceTips)){
				$("#MVVoice").prop("checked", eventHandler.VoiceEnable);
			}else{
				SetAlarmToneType(eventHandler,"#mo_AbAlarmToneType","#mo_AbAlarmTone");
				ChangeVoiceType("#mo_AbAlarmToneType","#mo_alarmAndCustom");
			}
			OnClickedEnable();
			InitButton();
		});
		$("#MV_Period").click(function() {
			MasklayerShow(1);
			SetWndTop("#period_dialog", 60);
			$("#period_dialog").show(function(){
				var nIndex = chnIndex;
				if(chnIndex == gDevice.loginRsp.ChannelNum){
					nIndex = 0;
				}
				var timeSection = motionCfg[nIndex][motionCfg[nIndex].Name].EventHandler.TimeSection;
				ShowPeriodWnd(timeSection, AlarmTypeEnum.Motion);
			});
		});
		$("#MV_PTZSet").click(function() {
			MasklayerShow(1);
			if(gDevice.loginRsp.ChannelNum <= 16){
				SetWndTop("#PtzLink_dialog", 60);
			}else{
				SetWndTop("#PtzLink_dialog");
			}
			$("#PtzLink_dialog").show(function(){
				var nIndex = chnIndex;
				if(chnIndex == gDevice.loginRsp.ChannelNum){
					nIndex = 0;
				}
				var PtzCfg = motionCfg[nIndex][motionCfg[nIndex].Name].EventHandler.PtzLink;
				ShowPTZ(PtzCfg, AlarmTypeEnum.Motion);
			});
		});
		$("#MV_IPCLink").click(function(){
			var nChn = $("#MotionChid").val() * 1;
			if (nChn < 0){
				return;
			}
			if (nChn == gDevice.loginRsp.ChannelNum){
				nChn = 0;
			}
			
			Config_Title.innerHTML = lg.get("IDS_IPC_LINK");
			SetWndTop("#Config_dialog", 60);						
			$("#Config_dialog").css("width", '600px');
			$("#Config_dialog .content_container").html(IPCLinkHtml);
			
			var hEvent = IPCMotion[nChn][IPCMotion[nChn].Name].EventHandler;
			if (digitalHumanAbility[nChn].SupportAlarmVoiceTips){
				$("#MVNVR_VoiceBox").css("display", "");
				$("#MVNVRVoice").prop("checked", hEvent.VoiceEnable);
			}else{
				$("#MVNVR_VoiceBox").css("display", "none");
			}
			if (digitalHumanAbility[nChn].SupportAlarmLinkLight){
				$("#MV_AlarmLightBox").css("display", "");
				$("#AlarmLight").prop("checked", hEvent.TipEnable);
			}else{
				$("#MV_AlarmLightBox").css("display", "none");
			}
			if(hEvent.VoiceEnable){
				DivBox(1, "#NVR_VoiceBox");
			}else{
				DivBox(0, "#NVR_VoiceBox");
			}
			if(digitalHumanAbility[nChn].SupportAlarmVoiceTipsType){
				RfParamCall(function(a){
					VoiceTipCfg = a;
					dataHtml = '';
					$("#NVR_VoiceTip").empty();
					var cfg = VoiceTipCfg[VoiceTipCfg.Name].VoiceTip;
					for(var i = 0; i < cfg.length; i++){
						dataHtml += '<option value="' + cfg[i].VoiceEnum + '">' + cfg[i].VoiceText + '</option>';	
					}
					$("#NVR_VoiceTip").append(dataHtml);
					var nVoice = hEvent.VoiceType;
					$("#NVR_VoiceTip").val(nVoice);
					
					if (550 == nVoice){
						DivBox(1, "#NVR_VoiceCustomDiv");
					}else{
						DivBox(0, "#NVR_VoiceCustomDiv");
					}
	
					$("#NVR_VoiceBox").css("display", "");
					MasklayerShow(1);
					$("#Config_dialog").show();
				}, pageTitle, "Ability.VoiceTipType", nChn, WSMsgID.WsMsgID_CONFIG_GET);
			}else{
				$("#NVR_VoiceBox").css("display", "none");
				MasklayerShow(1);
				$("#Config_dialog").show();
			}
			
			$("#NVR_VoiceTip").change(function(){
				var nVoice = $(this).val() * 1;
				if (nVoice == 550){
					DivBox(1, "#NVR_VoiceCustomDiv");
				}else {
					DivBox(0, "#NVR_VoiceCustomDiv");
				}
			});
			
			$("#NVR_VoiceCustomBtn").click(function(){
				var cmd={
					"KeepMaskLayer":true,
					"FilePurpose":0
				};
				$("#Config_dialog").css("display","none");
				var chn=$("#MotionChid").val()*1;
				if(chn==gDevice.loginRsp.ChannelNum){
					chn=0;
				}
				ShowVoiceCustomDlg(chn,cmd,pageTitle,function(){
					$("#Config_dialog").css("display","");
				});
			});
			$("#IPCLink_OK").click(function(){
				var nChn = $("#MotionChid").val() * 1;
				if (nChn < 0){
					return;
				}
				if (nChn == gDevice.loginRsp.ChannelNum){
					nChn = 0;
				}
				var hEvent = IPCMotion[nChn][IPCMotion[nChn].Name].EventHandler;
				if (digitalHumanAbility[nChn].SupportAlarmVoiceTips){
					hEvent.VoiceEnable = $("#MVNVRVoice").prop("checked");
				}		
				if (digitalHumanAbility[nChn].SupportAlarmLinkLight){
					hEvent.TipEnable = $("#AlarmLight").prop("checked");
				}
				if(digitalHumanAbility[nChn].SupportAlarmVoiceTipsType){	
					hEvent.VoiceType = $("#NVR_VoiceTip").val() * 1;
				}
				closeDialog();
			});
			$("#MVNVRVoice").click(function(){
				var bVoice = $("#MVNVRVoice").prop("checked");
				var nVoice = $("#NVR_VoiceTip").val() * 1;
				DivBox(1, "#NVR_VoiceCustomDiv");
				if (bVoice){
					DivBox(1, "#NVR_VoiceBox");
					if (550 != nVoice){
						DivBox(0, "#NVR_VoiceCustomDiv");
					}
				}else{
					DivBox(0, "#NVR_VoiceBox");
				}
			});
		});
		
		$("#mo_AbAlarmToneType").change(function(){
			ChangeVoiceType("#mo_AbAlarmToneType","#mo_alarmAndCustom");
		})
		$("#VoiceTipBtn,#mo_AbAlarmToneCustomButton").click(function () {
			var cmd={
				"FilePurpose":(this.id == "mo_AbAlarmToneCustomButton"?7:0)
			};
			var chn = $("#MotionChid").val()*1;
			if(chn==gDevice.loginRsp.ChannelNum){
				chn=0;
			}
			ShowVoiceCustomDlg(chn,cmd,pageTitle);
		});
		$("#MVDefault").click(function(){
			var nIndex = $("#MotionChid").val() * 1;
			if (nIndex == gDevice.loginRsp.ChannelNum){
				nIndex = 0;
			}
			RfParamCall(function(a){
				motionCfg[nIndex] = a;
				var timeSection = motionCfg[nIndex][motionCfg[nIndex].Name].EventHandler.TimeSection;
				for(var i = 0; i < timeSection.length; i++){
					if(isObject(timeSection[i])){
						for(var j = 0; j < timeSection[i].length ; j++){
							if(timeSection[i][j] == ""){
								timeSection[i][j] = "0 00:00:00-00:00:00";
							}
						}
					}
				}
				motionCfg[nIndex][motionCfg[nIndex].Name].EventHandler.TimeSection = timeSection;
				bGet[nIndex] = true;	
				if(bHumanCfg || (bNVRHuman && nIndex >= gDevice.loginRsp.VideoInChannel && digitalHumanAbility[nIndex].HumanDection)){
					var cmdID = WSMsgID.WsMsgID_DEFAULTCONFIG_GET;
					if(digitalHumanAbility[nIndex] != null && digitalHumanAbility[nIndex].HumanDection){
						var cmdID = WSMsgID.WsMsgID_CONFIG_GET;
					}
					RfParamCall(function(a){
						HumanCfg[nIndex] = a; 
						ShowData(nIndex);
						MasklayerHide();
					}, pageTitle, "Detect.HumanDetection", nIndex, cmdID);
				}else{
					ShowData(nIndex);
					MasklayerHide();
				}
			}, pageTitle, "Detect.MotionDetect", nIndex, WSMsgID.WsMsgID_DEFAULTCONFIG_GET);
		});
		FillAlarmType();
	});
});