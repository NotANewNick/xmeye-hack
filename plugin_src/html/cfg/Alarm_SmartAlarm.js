//# sourceURL=Alarm_SmartAlarm.js
$(function () {
	var pageTitle = $("#Alarm_SmartAlarm").text();
	var bGet = new Array;
	var motionCfg = new Array;
	var HumanCfg = new Array;
	var humanAbility = new Array;
	var digitalHumanAbility = new Array;
	var bGetIPCMotion = new Array;
	var IPCMotionCfg = new Array;
	var chPeaInHumanPed = new Array;
	var faceCfg = new Array;
	var detectCfg = new Array;
	var faceFuncAry = new Array;
	var VoiceTipFunc = new Array;
	var motionArea = null;
	var chnIndex = -1;
	var bIPCPeaRule = GetFunAbility(gDevice.Ability.AlarmFunction.PEAInHumanPed);
	var bRecord = !GetFunAbility(gDevice.Ability.OtherFunction.NOHDDRECORD);
	var bSnap = (GetFunAbility(gDevice.Ability.EncodeFunction.SnapStream) || GetFunAbility(gDevice.Ability.OtherFunction.SupportSnapSchedule));
	var bIPC = gDevice.devType == devTypeEnum.DEV_IPC ? true : false;
	var bHumanCfg = GetFunAbility(gDevice.Ability.AlarmFunction.HumanDection);
	var bNVRHuman = GetFunAbility(gDevice.Ability.AlarmFunction.HumanDectionNVR) || GetFunAbility(gDevice.Ability.AlarmFunction.HumanDectionNVRNew);
	var bSendEmail = !GetFunAbility(gDevice.Ability.TipShow.NoEmailTipShow);
	var bTour = gDevice.loginRsp.ChannelNum > 1;
	var bFtp = !GetFunAbility(gDevice.Ability.TipShow.NoFTPTipShow);
	var bWriteLog = GetFunAbility(gDevice.Ability.OtherFunction.SupportWriteLog);
	var bPtz = GetFunAbility(gDevice.Ability.CommFunction.CommRS485)
	var bSelectHuman = false;
	var copyChannel = -1;
	var bCopy = false;
	var color = gVar.skin_mColor;
    var bColor = gVar.skin_bColor;
	var IPCInfo = new Array;
	var chFlowCount = new Array;

	function InitButton() {
		$("input[data],div[data]").each(function() {
			if ($(this).attr("data") * 1 == 1) {
				$(this).removeClass("switch").addClass("selectEnable")
			} else {
				$(this).removeClass("selectEnable").addClass("switch")
			}
		})
	}

	var RegionHtml = 
		'	<div id="SA_MotionSP" style="width:600px; height:400px;">\n' +
		'		<img id="SA_motion_Img" src="" style="position:absolute;' +
		'			width:600px; height:400px;" />\n' +
		'		<canvas id="SA_motion_cvs" width="600" height="400"'+
		'			style="position:absolute;">No Support</canvas>' +
		'	</div>\n' +
		'	<div class="btn_box" style="padding-left:175px;">\n' +						
		'		<button class="btn" id="SA_SaveRegionBtn">' + lg.get("IDS_SAVE") + '</button>\n' +
		'		<button class="btn btn_cancle" id="SA_Region_Cancel">' + lg.get("IDS_CANCEL") + '</button>\n' +
		'	</div>';

	function ShowData(chn) {
		var SAEnable;
		var SensitivenessLev;
		var AlarmLightFunc;
		var AlarmLightEnable;
		var PhonePushEnable;
		var RecordEnable;
		var AlarmSoundFunc = digitalHumanAbility[chn].SupportAlarmVoiceTips;
		var AlarmSoundEnable = false;
		var FaceFunc = faceFuncAry[chn];
		var FaceEnable = !1;
		var PhonePushFaceEnable = false;
		var RecordFaceEnable = false;
		var HumanFunc = (digitalHumanAbility[chn].HumanDection && bNVRHuman);
		var HumanEnable = !1;


		$("#SA_CustomFlowDiv").css("display", chnIndex != gDevice.loginRsp.ChannelNum && chFlowCount[chn] ? "" : "none");
		$("#SA_IsOutsideDiv").css("display", chnIndex != gDevice.loginRsp.ChannelNum && chFlowCount[chn] ? "" : "none");
		if(chFlowCount[chn])
		{
			$("#SA_CustomFlowSwitch").attr("data", detectCfg[chn][detectCfg[chn].Name].Enable ? 1 : 0);
			$("#SA_IsOutsideSel").val(detectCfg[chn][detectCfg[chn].Name].IsOutSide ? 1 : 0);
		}

		try {
			var Motion = motionCfg[chn][motionCfg[chn].Name];
			SAEnable = Motion.Enable ? 1 : 0;
			SensitivenessLev = Motion.Level;
			AlarmLightFunc = digitalHumanAbility[chn].SupportAlarmLinkLight;
			AlarmLightEnable = AlarmLightFunc ? Motion.EventHandler.LightEnable : false;
			PhonePushEnable = Motion.EventHandler.MessageEnable;
			RecordEnable = Motion.EventHandler.RecordEnable;
		} catch (error) {
			DebugStringEvent("Motion Config Error");
			SAEnable = 0;
			SensitivenessLev = 0;
			AlarmLightFunc = false;
			AlarmLightEnable = false;
			PhonePushEnable = false;
			RecordEnable = false;
		}

		if(bGetIPCMotion[chn] && isObject(IPCMotionCfg[chn])){
			var IPCMotion = IPCMotionCfg[chn][IPCMotionCfg[chn].Name];
			AlarmSoundEnable = AlarmSoundFunc ? IPCMotion.EventHandler.VoiceEnable : false;
		}
	
		if(FaceFunc && isObject(faceCfg[chn])){
			var Face = faceCfg[chn][faceCfg[chn].Name];
			FaceEnable = FaceFunc ? (FaceEnable = Face.Enable ? 1 : 0) : 0;
			PhonePushFaceEnable = Face.EventHandler.MessageEnable;
			RecordFaceEnable = Face.EventHandler.RecordEnable;
		}

		if(HumanFunc && isObject(HumanCfg[chn])){
			var Human = HumanCfg[chn][HumanCfg[chn].Name];
			HumanEnable = HumanFunc ? (Human.Enable ? 1 : 0) : 0;
		}

		$("#SA_Enable").attr("data", SAEnable);
		//--------------人形和移动----------------
		$("#SA_MotionAndHumanDiv").css("display", chnIndex != gDevice.loginRsp.ChannelNum && HumanFunc ? "" : "none");
		$("#SA_MotionAndHumanSwitch").attr("data", HumanEnable);
		//选择全通道隐藏人形移动切换按钮
		//报警声
		$("#SA_AlarmSound_line").css("display", AlarmSoundFunc ? "" : "none");
		$("#SA_MotionAndHuman_AlarmSound").prop("checked", AlarmSoundEnable);
		//报警灯
		$("#SA_AlarmLight_line").css("display", AlarmLightFunc ? "" : "none");
		$("#SA_MotionAndHuman_AlarmLight").prop("checked", AlarmLightEnable);
		//手机上报
		$("#SA_MotionAndHuman_PhoneUp").prop("checked", PhonePushEnable);
		//录像
		$("#SA_MotionAndHuman_Record").prop("checked", RecordEnable);
		//--------------人脸------------------
		$(".FaceClass").css("display", FaceFunc ? "" : "none");
		$("#SA_FaceEnable").attr("data", FaceEnable);
		$("#SA_Face_PhoneUp").prop("checked", PhonePushFaceEnable);
		$("#SA_Face_Record").prop("checked", RecordFaceEnable);
		
		//灵敏度
		$("#SA_SensitivenessS").val(SensitivenessLev);
		MasklayerHide();
		OnClickedEnable();

		if ($("#SA_MotionAndHumanSwitch").attr("data") * 1 == 1) {
			SA_MotionAndHumanL.innerHTML = lg.get("IDS_HUMAN_DETECT");
		}
		else{
			SA_MotionAndHumanL.innerHTML = lg.get("MotionDetect");
		}

		ShowRuleAndRegion();

		if($("#SA_FaceEnable").attr("data") * 1 == 1)
		{
			$("#SA_MotionAndHumanSwitch").attr("data", 1);
		}
		if($("#SA_MotionAndHumanSwitch").attr("data") * 1 == 0)
		{
			$("#SA_FaceEnable").attr("data", 0);
		}

		var customerFlowEnbale = $("#SA_CustomFlowSwitch").attr("data") * 1;

		var FaceEnable = $("#SA_FaceEnable").attr("data") * 1;
		var Enable = $("#SA_Enable").attr("data") * 1;
		if (Enable) {
			DivBox(customerFlowEnbale, "#SA_IsOutsideDiv");
			DivBox(FaceEnable, ".Face_Config");
		}

		InitButton();
	}
	function ShowRuleAndRegion()
	{
		if($("#SA_MotionAndHumanSwitch").attr("data") * 1 == 1
			|| $("#SA_FaceEnable").attr("data") * 1 == 1
			|| $("#SA_CustomFlowSwitch").attr("data") * 1 == 1)
		{
			SA_RuleAndRegionL.innerHTML = lg.get("IDS_CA_RULE");
			bSelectHuman = true;
		}
		else
		{
			SA_RuleAndRegionL.innerHTML = lg.get("IDS_Region");
			bSelectHuman = false;
		}
	}
	function OnClickCustomerFlowEnableBtn(){
		var customerFlowEnbale = $("#SA_CustomFlowSwitch").attr("data") * 1;

		var Enable = $("#SA_Enable").attr("data") * 1;
		if (Enable) {
			DivBox(customerFlowEnbale, "#SA_IsOutsideDiv");
		}

		if(customerFlowEnbale)
		{
			$("#SA_MotionAndHumanSwitch").attr("data", 0);
			OnClickHumanSwh();
		}
		else
		{
			$("#SA_MotionAndHumanSwitch").attr("data", 1);
			OnClickHumanSwh();
			OnClickFaceEnableBtn();
		}
		InitButton();
		ShowRuleAndRegion();
	}
	function GetHumanRule(chn, iRule, iTrack) {
		var cfg = HumanCfg[chn][HumanCfg[chn].Name];
		cfg.ShowRule = iRule;
		cfg.ShowTrack = iTrack;
	}
	function drawGrid(nRow, nCol) {
		var cvs = document.getElementById("SA_motion_cvs");
		var ctx = cvs.getContext('2d');
		var wCell = bkWidth / nCol;
		var hCell = bkHeight / nRow;
		ctx.clearRect(0, 0, bkWidth, bkHeight);
		ctx.strokeStyle = "#0f0";
		ctx.fillStyle = "#f00";
		ctx.globalAlpha = 0.2;
		var xPos = 0;
		var yPos = 0;
		for (var i = 0; i < nRow; i++) {
			for (var j = 0; j < nCol; j++) {
				ctx.strokeRect(xPos, yPos, wCell, hCell);
				if (nRegion[i][j]) {
					ctx.fillRect(xPos, yPos, wCell, hCell);
				}
				xPos += wCell;
			}
			yPos += hCell;
			xPos = 0;
		}
	}
	function drawPolygon(pts, nRow, nCol) {
		var cvs = document.getElementById("SA_motion_cvs");
		var ctx = cvs.getContext('2d');
		ctx.clearRect(0, 0, bkWidth, bkHeight);
		ctx.strokeStyle = "#f00";
		ctx.globalAlpha = 1;
		ctx.beginPath();
		var wSpace = parseInt((bkWidth / nCol) / 2) < 5 ? parseInt((bkWidth / nCol) / 2) : 5;
		var hSpace = parseInt((bkHeight / nRow) / 2) < 5 ? parseInt((bkHeight / nRow) / 2) : 5;
		var points = [];
		for (var i = 0; i < pts.length; i++) {
			var x, y;
			if (pts[i].x <= wSpace) {
				x = wSpace;
			} else if (pts[i].x >= bkWidth - wSpace) {
				x = bkWidth - wSpace;
			} else {
				x = pts[i].x
			}
			if (pts[i].y <= hSpace) {
				y = hSpace;
			} else if (pts[i].y >= bkHeight - hSpace) {
				y = bkHeight - hSpace;
			} else {
				y = pts[i].y;
			}
			points.push({ x: x, y: y });
		}
		ctx.moveTo(points[0].x, points[0].y);
		for (var i = 1; i < points.length; i++) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		ctx.lineTo(points[0].x, points[0].y);
		ctx.stroke();
	}
	function showHumanArea(nChn, _nRow, _nCol) {
		MasklayerShow(1);
		$("#SA_Region_dialog").show(function () {
			var region = motionCfg[nChn][motionCfg[nChn].Name].Region;
			bkWidth = $("#SA_motion_cvs").width();
			bkHeight = $("#SA_motion_cvs").height();
			var wCell = bkWidth / _nCol;
			var hCell = bkHeight / _nRow;
			var pointNum = 4;
			var nState = -1;		//鼠标左键按下的位置：1-选择坐标,2-选择边框, 3-选择矩形内部
			var nPointId = -1;		//按顺序左下右上
			var humanPts = [];
			InitArea();
			function InitArea() {
				var leftTop = { x: 50, y: 40 };
				var rightBottom = { x: 150, y: 85 };
				var leftPt = false;
				for (var i = 0; i < _nRow; i++) {
					for (var j = 0; j < _nCol; j++) {
						if (region[i] & (1 << j)) {
							var x = j * wCell;
							var y = i * hCell;
							if (!leftPt) {
								leftTop.x = x;
								leftTop.y = y;
								leftPt = true;
							}
							rightBottom.x = x + wCell;
							rightBottom.y = y + hCell;
							if (j == _nCol - 1) {
								if (bkWidth - rightBottom.x < wCell && bkWidth - rightBottom.x > 0) {
									rightBottom.x = bkWidth;
								}
							}
							if (i == _nRow - 1) {
								if (bkHeight - rightBottom.y < hCell && bkHeight - rightBottom.y > 0) {
									rightBottom.y = bkHeight;
								}
							}
						}
					}
				}
				humanPts.push({ x: leftTop.x, y: leftTop.y });
				humanPts.push({ x: leftTop.x, y: rightBottom.y });
				humanPts.push({ x: rightBottom.x, y: rightBottom.y });
				humanPts.push({ x: rightBottom.x, y: leftTop.y });
			}
			var offset = $("#SA_motion_cvs").offset();
			$("#SA_motion_cvs").unbind();
			$("#SA_motion_cvs").mousedown(function (e) {
				if (e.button == 0) {		//鼠标左键
					var beginPos = { "x": e.pageX - offset.left, "y": e.pageY - offset.top };
					nState = -1;
					nPointId = -1;
					CheckSelect(beginPos);
					$(this).bind("mousemove", function (ev) {
						var endPos = { "x": ev.pageX - offset.left, "y": ev.pageY - offset.top };
						var points = humanPts;

						if (nState == 3) {
							var temp = cloneObj(points);
							for (var i = 0; i < 4; i++) {
								temp[i].x += endPos.x - beginPos.x;
								temp[i].y += endPos.y - beginPos.y;
								if (!CheckPoint(temp[i])) {
									return;
								}
							}
							for (var i = 0; i < 4; i++) {
								points[i].x = temp[i].x;
								points[i].y = temp[i].y;
							}
							beginPos = endPos;
						} else if (nState == 1) {
							var temp = cloneObj(points);
							var nNextPointId = nPointId + 1;
							if (nPointId == pointNum - 1) {
								nNextPointId = 0;
							}
							if (temp[nNextPointId].x == points[nPointId].x) {
								temp[nNextPointId].x = temp[nPointId].x += endPos.x - beginPos.x;
							}
							if (temp[nNextPointId].y == points[nPointId].y) {
								temp[nNextPointId].y = temp[nPointId].y += endPos.y - beginPos.y;
							}
							/*设置矩形最小长宽为30*/
							if (nPointId == 0 && temp[nPointId + 2].x - temp[nPointId].x <= 30) {
								temp[nNextPointId].x = temp[nPointId].x = temp[nPointId + 2].x - 30;
							}
							if (nPointId == 1 && temp[nPointId].y - temp[nPointId + 2].y <= 30) {
								temp[nNextPointId].y = temp[nPointId].y = temp[nPointId + 2].y + 30;
							}
							if (nPointId == 2 && temp[nPointId].x - temp[nPointId - 2].x <= 30) {
								temp[nNextPointId].x = temp[nPointId].x = temp[nPointId - 2].x + 30;
							}
							if (nPointId == 3 && temp[nPointId - 2].y - temp[nPointId].y <= 30) {
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
			}).mouseup(function (e) {
				$(this).unbind("mousemove");
			}).mouseout(function (e) {
				$(this).unbind("mousemove");
			});
			drawPolygon(humanPts, _nRow, _nCol);
			function CheckPoint(pt) {
				if (pt.x >= 0 && pt.x <= bkWidth && pt.y >= 0 && pt.y <= bkHeight) {
					return true;
				}
				return false;
			}
			function CheckSelect(pt) {
				var bFinded = false;
				var points = humanPts;
				for (var n = 0; n < points.length; n++) {
					if (Math.abs(pt.x - points[n].x) < 5 && Math.abs(pt.y - points[n].y) < 5) {
						bFinded = true;
						nState = 2;
						nPointId = n;
					}
				}
				if (nState == -1) {
					var lna = 0;
					var lnb = 0;
					var lnc = 0;
					for (var j = 0; j < pointNum; j++) {
						var k = j + 1 < pointNum ? j + 1 : 0;
						lna = (points[j].x - points[k].x) * (points[j].x - points[k].x) +
							(points[j].y - points[k].y) * (points[j].y - points[k].y);
						lnb = (pt.x - points[k].x) * (pt.x - points[k].x) +
							(pt.y - points[k].y) * (pt.y - points[k].y);
						lnc = (pt.x - points[j].x) * (pt.x - points[j].x) +
							(pt.y - points[j].y) * (pt.y - points[j].y);

						if ((Math.sqrt(lnb) + Math.sqrt(lnc)) < (Math.sqrt(lna) + 1)) {
							nState = 1;
							nPointId = j;
							bFinded = true;
						}
					}
				}
				if (nState == -1) {
					if (PtInPolygon(pt, points, pointNum)) {
						bFinded = true;
						nState = 3;
					}
				}
				return bFinded;
			}
			$("#SA_SaveRegionBtn").unbind().click(function () {
				var leftTop = HitTest(humanPts[0]);
				var rightBottom = HitTest(humanPts[2]);
				for (var i = 0; i < _nRow; i++) {
					var Region_temp = region[i];
					Region_temp = Region_temp.substring(2);
					var mask = [];
					mask[1] = parseInt(Region_temp.substr(0, 4), 16);
					mask[0] = parseInt(Region_temp.substr(4, 4), 16);
					for (var j = 0; j < 32; j++) {
						var m = parseInt(j / 16);
						var n = j % 16;
						if(j < _nCol){
							if (j >= leftTop.x && j <= rightBottom.x && i >= leftTop.y && i <= rightBottom.y) {
								mask[m] |= 1 << n;
							} else {
								mask[m] = mask[m] & ~(1 << n);
							}
						}
						else{
							mask[m] = mask[m] & ~(1 << n);
						}
					}
					region[i] = "0x" + toHex(mask[1], 4) + toHex(mask[0], 4);
				}
				closeDialog();
			});
			function HitTest(point) {
				var pos = { x: 0, y: 0 };
				if (point.x < 0) {
					point.x = 0;
				}

				if (point.y < 0) {
					point.y = 0;
				}

				if (wCell && hCell) {
					pos.x = parseInt(point.x / wCell);	//列
					pos.y = parseInt(point.y / hCell);	//行
				}
				return pos;
			}
		});

	}
	function showMotionArea(nChn, _nRow, _nCol) {
		MasklayerShow(1);
		Config_Title.innerHTML = lg.get("IDS_Region");
		SA_motion_cvs.innerHTML = lg.get("IDS_NOT_SUPPORT");
		SetWndTop("#Config_dialog");						
		$("#Config_dialog").css("width", '650px');

		$("#Config_dialog").show(function () {
			var region = motionCfg[nChn][motionCfg[nChn].Name].Region;
			bkWidth = $("#SA_motion_cvs").width();
			bkHeight = $("#SA_motion_cvs").height();
			var wCell = bkWidth / _nCol;
			var hCell = bkHeight / _nRow;
			nRegion = [];
			for (var i = 0; i < _nRow; i++) {
				nRegion[i] = [];
				for (var j = 0; j < _nCol; j++) {
					nRegion[i][j] = ExtractMask(region[i], j) ? true : false;
				}
			}
			var offset = $("#SA_motion_cvs").offset();
			$("#SA_motion_cvs").unbind();
			$("#SA_motion_cvs").mousedown(function (e) {
				if (e.button == 0) {
					var pt = {
						x: e.pageX - offset.left,
						y: e.pageY - offset.top
					};
					var pos = GetPos(pt);
					if (pos.x > _nCol || pos.y > _nRow) return;
					nRegion[pos.y][pos.x] = !nRegion[pos.y][pos.x];
					drawGrid(_nRow, _nCol);
					$(this).bind("mousemove", function (ev) {
						var pt2 = {
							x: ev.pageX - offset.left,
							y: ev.pageY - offset.top
						};
						var pos2 = GetPos(pt2);
						if (pos2.x > _nCol || pos2.y > _nRow) return;
						var bx = pos.x > pos2.x ? pos2.x : pos.x;
						var ex = pos.x > pos2.x ? pos.x : pos2.x;
						var by = pos.y > pos2.y ? pos2.y : pos.y;
						var ey = pos.y > pos2.y ? pos.y : pos2.y;
						for (var i = by; i <= ey; i++) {
							for (var j = bx; j <= ex; j++) {
								nRegion[i][j] = nRegion[pos.y][pos.x];
							}
						}
						drawGrid(_nRow, _nCol);
					});
				}
			}).mouseup(function (e) {
				$(this).unbind("mousemove");
			}).mouseout(function (e) {
				$(this).unbind("mousemove");
			});
			function GetPos(pt) {
				if (pt.x < 0) pt.x = 0;
				if (pt.y < 0) pt.y = 0;
				var pos = { x: 0, y: 0 };
				if (hCell && wCell) {
					pos.x = parseInt(pt.x / wCell);
					pos.y = parseInt(pt.y / hCell);
				}
				return pos;
			}
			drawGrid(_nRow, _nCol);
			$("#SA_SaveRegionBtn").unbind().click(function () {
				for (var i = 0; i < _nRow; i++) {
					var Region_temp = region[i];
					Region_temp = Region_temp.substring(2);
					var mask = [];
					mask[1] = parseInt(Region_temp.substr(0, 4), 16);
					mask[0] = parseInt(Region_temp.substr(4, 4), 16);
					for (var j = 0; j < 32; j++) {
						var m = parseInt(j / 16);
						var n = j % 16;
						if(j < _nCol){
							if (nRegion[i][j]) {
								mask[m] |= 1 << n;
							} else {
								mask[m] = mask[m] & ~(1 << n);
							}
						}
						else{
							mask[m] = mask[m] & ~(1 << n);
						}
					}
					region[i] = "0x" + toHex(mask[1], 4) + toHex(mask[0], 4);
				}
				$(".dialog_role").css("display", "none");
				MasklayerHide();
			});
		});
	}
	function ShowAreaSet(nChn, nRow, nCol) {
		var bShow = bSelectHuman;
		//var bEnable = $("#SA_MotionAndHumanSwitch").attr("data") * 1 ? true : false;
		var imgUrl = gVar.captureUrl + "&channel=" +(nChn+1) + "&user=" + gDevice.username + "&password=" + gDevice.password;
		if (!(bShow/* && bEnable*/)) {
			if (nRow == 0 || nCol == 0) {
				MasklayerHide();
				ShowPaop(pageTitle, lg.get("IDS_INFO_NO_SUPPORT"));
				return;
			}
			$("#Config_dialog .content_container").html(RegionHtml);
			MasklayerShow();
			function showPic(a){
				MasklayerShow(1);
				if(a == ""){
					$("#SA_motion_Img").css("display", "none");
				}else{
					$("#SA_motion_Img").attr("src", a);
					$("#SA_motion_Img").css("display", "");
				}
				showMotionArea(nChn, nRow, nCol);
			}
			gDevice.ParamCapture(nChn, function (a) {
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
		} else {
			if (bNVRHuman && chPeaInHumanPed[nChn]) {
				MasklayerShow();
				var _parent = "#Config_dialog .content_container";
				function showPic(a){
					MasklayerShow(1);
					if(a == ""){
						$("#PEA_Img").css("display", "none");
					}else{
						$("#PEA_Img").attr("src", a);
						$("#PEA_Img").css("display", "");
					}
					var cfg = HumanCfg[nChn][HumanCfg[nChn].Name];
					$("#Config_dialog").show(500);
					HumanZoneObj = new HumanZone({
						nChannel: nChn,
						iShowRule: cfg.ShowRule,
						iShowTrack: cfg.ShowTrack,
						humanAbility: humanAbility[nChn],
						PedRule: cfg.PedRule,
						SaveCallback: GetHumanRule
					});
				}
				gVar.LoadChildConfigPage("PEA_Zone", "Human_Zone", _parent, function () {
					Config_Title.innerHTML = lg.get("IDS_CA_RULE");
					lan("PEA_Zone");
					SetWndTop("#Config_dialog");
					$("#Config_dialog").css("width", '650px');
					gDevice.ParamCapture(nChn, function (a) {
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
			} else {
				if (nRow == 0 || nCol == 0) {
					MasklayerHide();
					ShowPaop(pageTitle, lg.get("IDS_INFO_NO_SUPPORT"));
					return;
				}
				function showPic(a){
					if(a == ""){
						$("#SA_motion_Img").css("display", "none");
					}else{
						$("#SA_motion_Img").attr("src", a);
						$("#SA_motion_Img").css("display", "");
					}
					showHumanArea(nChn, nRow, nCol);
				}
				gDevice.ParamCapture(nChn, function (a) {
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

	function OnClickedEnable() {
		var Enable = $("#SA_Enable").attr("data") * 1;
		DivBox(Enable, "#SA_CfgBox");
	}

	function OnClickHumanSwh() {
		if ($("#SA_MotionAndHumanSwitch").attr("data") * 1 == 1) {
			// if(chnIndex != gDevice.loginRsp.ChannelNum && chFlowCount[chnIndex]){
			// 	SA_MotionAndHumanL.innerHTML = lg.get("IDS_CustomerFlowCount");
			// }else{
			SA_MotionAndHumanL.innerHTML = lg.get("IDS_HUMAN_DETECT");
			//}
			//bSelectHuman = true;
		} else {
			SA_MotionAndHumanL.innerHTML = lg.get("MotionDetect");
			if ($("#SA_FaceDiv").css("display") != "none" && $("#SA_FaceEnable").attr("data") * 1 == 1) {
				$("#SA_FaceEnable").attr("data", 0);
				OnClickFaceEnableBtn();
				InitButton();
			}
		}
		ShowRuleAndRegion();
	}
	function OnClickFaceEnableBtn() {
		var FaceEnable = $("#SA_FaceEnable").attr("data") * 1;
		var Enable = $("#SA_Enable").attr("data") * 1;
		if (Enable) {
			DivBox(FaceEnable, ".Face_Config");
			if ($("#SA_MotionAndHumanDiv").css("display") != "none" && FaceEnable && ($("#SA_MotionAndHumanSwitch").attr("data") * 1 == 0)) {
				$("#SA_MotionAndHumanSwitch").attr("data", 1);
				OnClickHumanSwh();
				InitButton();
			}
		}
		ShowRuleAndRegion();
	}
	function OnClickAdvanceBtn(MotionOrFace) {
		MasklayerShow(1);
		var chn = chnIndex == gDevice.loginRsp.ChannelNum ? 0 : chnIndex;
		var cfg = null;
		if (MotionOrFace) {
			//人形或移动
			cfg = motionCfg[chn][motionCfg[chn].Name];
			if (bSelectHuman || !digitalHumanAbility[chn].HumanDection) {
				//人形
				if (digitalHumanAbility[chn].SupportAlarmVoiceTips && digitalHumanAbility[chn].SupportAlarmVoiceTipsType) {
					$("#SA_VoiceTipDiv").css("display", "");
					$("#SA_VoiceTip").empty();
					var dataHtml;
					for (var i = 0; i < VoiceTipFunc[chn].VoiceTip.length; i++) {
						dataHtml += '<option value="' + VoiceTipFunc[chn].VoiceTip[i].VoiceEnum + '">' + VoiceTipFunc[chn].VoiceTip[i].VoiceText + '</option>';
					}
					$("#SA_VoiceTip").append(dataHtml);
					var nVoice = IPCMotionCfg[chn][IPCMotionCfg[chn].Name].EventHandler.VoiceType;
					$("#SA_VoiceTip").val(nVoice);

					if (550 == nVoice){
						DivBox(1, "#SA_Custom_box");
					}else{
						DivBox(0, "#SA_Custom_box");
					}
				} else {
					$("#SA_VoiceTipDiv").css("display", "none");
				}
			} else {
				//移动
				$("#SA_VoiceTipDiv").css("display", "none");
			}

			if(IPCInfo[chn] != null && IPCInfo[chn].AlarmOutChannel > 0 && bGetIPCMotion[chn]){
				$("#SA_IPC_AOEvent").css("display", "");
				recChannel("SA_IPC_AOChannelDiv", color, bColor, IPCInfo[chn].AlarmOutChannel);
				var ChannelH = $("#SA_IPC_AOEvent").height();
				$("#SA_IPC_AOEvent .MaskDiv").css("height", ChannelH + "px");

				var ipcEventHandler = IPCMotionCfg[chn][IPCMotionCfg[chn].Name].EventHandler;
				$("#SA_IPC_AODelay").val(ipcEventHandler.AlarmOutLatch);
				ShowMask("#SA_IPC_AOChannelDiv > div[name!='all']", ipcEventHandler.AlarmOutMask);
			}else{
				$("#SA_IPC_AOEvent").css("display", "none");
			}
		} else {
			//人脸
			cfg = faceCfg[chn][faceCfg[chn].Name];
			$("#SA_VoiceTipDiv").css("display", "none");
			$("#SA_IPC_AOEvent").css("display", "none");
		}

		$("#SA_VoiceTip").unbind().change(function(){
			var nVoice = $(this).val() * 1;
			if (nVoice == 550){
				DivBox(1, "#SA_Custom_box");
			}else {
				DivBox(0, "#SA_Custom_box");
			}
		});

		if(gDevice.loginRsp.AlarmOutChannel == 0){
			$("#SA_AOEvent").css("display", "none");
		}else {
			recChannel("SA_AOChannelDiv", color, bColor, gDevice.loginRsp.AlarmOutChannel);
			var ChannelH = $("#SA_AOEvent").height();
			$("#SA_AOEvent .MaskDiv").css("height", ChannelH + "px");			
			$("#SA_AODelay").val(cfg.EventHandler.AlarmOutLatch);
			ShowMask("#SA_AOChannelDiv > div[name!='all']", cfg.EventHandler.AlarmOutMask);
		}			
		GetAlarmToneType(MotionOrFace ? "Detect.MotionDetect" : "Detect.FaceDetection", "#SA_Alarm_tone", "#SA_AbAlarmToneType", "#SA_AbAlarmTone");
		SetAlarmToneType(cfg.EventHandler, "#SA_AbAlarmToneType", "#SA_AbAlarmTone");
		ChangeVoiceType("#SA_AbAlarmToneType", "#SA_alarmAndCustom");
		$("#SA_SnapBox").css("display", bSnap ? "" : "none");
		$("#SA_SendEmailBox").css("display", bSendEmail ? "" : "none");
		$("#SA_TourBox").css("display", bTour ? "" : "none");
		$("#SA_FTPBox").css("display", bFtp && MotionOrFace ? "" : "none");
		$("#SA_WriteLogBox").css("display", bWriteLog ? "" : "none");
		$("#SA_PTZSetDiv").css("display", bPtz ? "" : "none");

		$("#SA_Tour").prop("checked", bTour ? (cfg.EventHandler.TourEnable ? true : false) : false);
		$("#SA_SendEmail").prop("checked", bSendEmail ? (cfg.EventHandler.MailEnable ? true : false) : false);
		$("#SA_Snap").prop("checked", bSnap ? (cfg.EventHandler.SnapEnable ? true : false) : false);
		$("#SA_FTP").prop("checked", bFtp && MotionOrFace ? (cfg.EventHandler.FTPEnable ? true : false) : false);
		$("#SA_WriteLog").prop("checked", bWriteLog ? (cfg.EventHandler.LogEnable ? true : false) : false);
		$("#SA_RecordDelay").val(cfg.EventHandler.RecordLatch);
		$("#SA_Interval").val(cfg.EventHandler.EventLatch);

		$("#SA_AbAlarmToneCustomButton").unbind().click(function () {
			var cmd = {
				"KeepMaskLayer": true,
				"FilePurpose": 7
			};
			$("#SA_Advance_Dialog").css("display","none");
			ShowVoiceCustomDlg(-1, cmd, pageTitle, function () {
				$("#SA_Advance_Dialog").css("display","");
			});
		})
		$("#SA_VoiceTipBtn").unbind().click(function () {
			var cmd = {
				"KeepMaskLayer": true,
				"FilePurpose": 0
			};
			$("#SA_Advance_Dialog").css("display","none");
			if(chn == gDevice.loginRsp.ChannelNum){
				chn = 0;
			}
			ShowVoiceCustomDlg(chn, cmd, pageTitle, function () {
				$("#SA_Advance_Dialog").css("display","");
			});
		})
		$("#SA_Period").unbind().click(function () {
			$("#period_dialog").show(function () {
				var timeSection = cfg.EventHandler.TimeSection;
				var AlarmType = MotionOrFace ? (bSelectHuman ? AlarmTypeEnum.Human : AlarmTypeEnum.Motion) : AlarmTypeEnum.Face;
				$("#SA_Advance_Dialog").css("display","none");
				ShowPeriodWnd(timeSection, AlarmType, true, function () {
					$("#SA_Advance_Dialog").css("display","");
				});
			});
		});
		$("#SA_PTZSet").unbind().click(function () {
			if(gDevice.loginRsp.ChannelNum <= 32){
				SetWndTop("#PtzLink_dialog", 60);
			}else{
				SetWndTop("#PtzLink_dialog");
			}
			$("#PtzLink_dialog").show(function () {
				var PtzCfg = cfg.EventHandler.PtzLink;
				var AlarmType = MotionOrFace ? (bSelectHuman ? AlarmTypeEnum.Human : AlarmTypeEnum.Motion) : AlarmTypeEnum.Face;
				$("#SA_Advance_Dialog").css("display","none");
				ShowPTZ(PtzCfg, AlarmType, true, function () {
					$("#SA_Advance_Dialog").css("display","");
				});
			});
		});
		$("#SA_AbAlarmToneType").unbind().change(function () {
			ChangeVoiceType("#SA_AbAlarmToneType", "#SA_alarmAndCustom");
		});
		$("#SA_Advance_Confirm").unbind().click(function () {
			cfg.EventHandler.TourEnable = $("#SA_Tour").prop("checked");
			cfg.EventHandler.TourMask = GetSingleChnMasks(cfg.EventHandler.TourEnable, chn);
			cfg.EventHandler.MailEnable = $("#SA_SendEmail").prop("checked");
			cfg.EventHandler.SnapEnable = $("#SA_Snap").prop("checked");
			cfg.EventHandler.SnapShotMask = GetSingleChnMasks(cfg.EventHandler.SnapEnable, chn);
			if(MotionOrFace){
				cfg.EventHandler.FTPEnable = $("#SA_FTP").prop("checked");
			}
			cfg.EventHandler.LogEnable = $("#SA_WriteLog").prop("checked");
			cfg.EventHandler.RecordLatch = $("#SA_RecordDelay").val()*1;
			cfg.EventHandler.EventLatch = $("#SA_Interval").val()*1;
			if(gDevice.loginRsp.AlarmOutChannel > 0){
				cfg.EventHandler.AlarmOutLatch = $("#SA_AODelay").val() * 1;
				cfg.EventHandler.AlarmOutMask = GetMasks("#SA_AOChannelDiv > div[name!='all']");
				cfg.EventHandler.AlarmOutEnable = false;
				if (parseInt(cfg.EventHandler.AlarmOutMask) > 0){
					cfg.EventHandler.AlarmOutEnable = true;
				}
			}
			SaveAlarmToneType(cfg.EventHandler, "#SA_AbAlarmToneType", "#SA_AbAlarmTone");
			if (MotionOrFace && (bSelectHuman || !digitalHumanAbility[chn].HumanDection) 
			&& digitalHumanAbility[chn].SupportAlarmVoiceTips && digitalHumanAbility[chn].SupportAlarmVoiceTipsType) {
				IPCMotionCfg[chn][IPCMotionCfg[chn].Name].EventHandler.VoiceType = $("#SA_VoiceTip").val()*1;
			}
			if(MotionOrFace && IPCInfo[chn] != null && IPCInfo[chn].AlarmOutChannel > 0 && bGetIPCMotion[chn]){
				var ipcEventHandler = IPCMotionCfg[chn][IPCMotionCfg[chn].Name].EventHandler;
				ipcEventHandler.AlarmOutLatch = $("#SA_IPC_AODelay").val() * 1;
				ipcEventHandler.AlarmOutMask = GetMasks("#SA_IPC_AOChannelDiv > div[name!='all']");
				ipcEventHandler.AlarmOutEnable = false;
				if (parseInt(ipcEventHandler.AlarmOutMask) > 0){
					ipcEventHandler.AlarmOutEnable = true;
				}
			}

			$(".btn_cancle").click();
		})
		$("#SA_Tour").unbind().change(function () {
			cfg.EventHandler.TourMask = GetSingleChnMasks($("#SA_Tour").prop("checked"), chn);
		})
		$("#SA_Snap").unbind().change(function () {
			cfg.EventHandler.SnapShotMask = GetSingleChnMasks($("#SA_Snap").prop("checked"), chn);
		})

		SetWndTop("#SA_Advance_Dialog", 60);
		$("#SA_Advance_Dialog").show();
	}

	function GetFaceCfg(nIndex) {
		RfParamCall(function (a) {
			faceCfg[nIndex] = a;
			var timeSection = faceCfg[nIndex][faceCfg[nIndex].Name].EventHandler.TimeSection;
			for(var i = 0; i < timeSection.length; i++){
				if(isObject(timeSection[i])){
					for(var j = 0; j < timeSection[i].length ; j++){
						if(timeSection[i][j] == ""){
							timeSection[i][j] = "0 00:00:00-00:00:00";
						}
					}
				}
			}
			faceCfg[nIndex][faceCfg[nIndex].Name].EventHandler.TimeSection = timeSection;
			GetDigitalHuman(nIndex, function () {
				ShowData(nIndex);
				MasklayerHide();
			});
		}, pageTitle, "Detect.FaceDetection", nIndex, WSMsgID.WsMsgID_CONFIG_GET);
	}
	function GetHumanCfg(nIndex, callback) {
		if (!bHumanCfg) {
			callback();
			return;
		}
		RfParamCall(function (a) {
			if (a.Ret == 100) {
				humanAbility[nIndex] = a[a.Name];
			}
			RfParamCall(function (a) {
				HumanCfg[nIndex] = a;
				callback();
			}, pageTitle, "Detect.HumanDetection", nIndex, WSMsgID.WsMsgID_CONFIG_GET);
		}, pageTitle, "HumanRuleLimit", -1, WSMsgID.WsMsgID_ABILITY_GET);
	}

	function GetDigitalHuman(nChn, callback) {
		if (nChn < gDevice.loginRsp.VideoInChannel || !bNVRHuman) {
			digitalHumanAbility[nChn] = {};
			digitalHumanAbility[nChn].HumanDection = false;
			digitalHumanAbility[nChn].SupportAlarmLinkLight = false;
			digitalHumanAbility[nChn].SupportAlarmVoiceTips = false;
			digitalHumanAbility[nChn].SupportAlarmVoiceTipsType = false;	
			callback();
			return;
		}
		RfParamCall(function (a) {
			if (typeof a[a.Name] == 'undefined') {
				digitalHumanAbility[nChn] = {};
				digitalHumanAbility[nChn].HumanDection = false;
				digitalHumanAbility[nChn].SupportAlarmLinkLight = false;
				digitalHumanAbility[nChn].SupportAlarmVoiceTips = false;
				digitalHumanAbility[nChn].SupportAlarmVoiceTipsType = false;
			} else {
				digitalHumanAbility[nChn] = a[a.Name];
			}
			
			RfParamCall(function (a) {
				VoiceTipFunc[nChn] = a[a.Name];
				if (!digitalHumanAbility[nChn].HumanDection) {
					GetDetectIPC(nChn, function(){
						callback();
					});
				}else{
					RfParamCall(function (a) {
						humanAbility[nChn] = a[a.Name];
						RfParamCall(function (a) {
							HumanCfg[nChn] = a;
							GetDetectIPC(nChn, function(){
								callback();
							});
						}, pageTitle, "Detect.HumanDetection", nChn, WSMsgID.WsMsgID_CONFIG_GET);
					}, pageTitle, "ChannelHumanRuleLimit", nChn, WSMsgID.WSMsgID_CHANNEL_ABILITY_GET_REQ);
				}
			}, pageTitle, "Ability.VoiceTipType", nChn, WSMsgID.WsMsgID_CONFIG_GET, "", false, true);
		}, pageTitle, "NetUse.DigitalHumanAbility", nChn, WSMsgID.WsMsgID_CONFIG_GET);
	}
	function GetDetectIPC(nChn, callback){
		if (digitalHumanAbility[nChn].SupportAlarmLinkLight || digitalHumanAbility[nChn].SupportAlarmVoiceTips
			|| (IPCInfo[nChn] != null && IPCInfo[nChn].AlarmOutChannel > 0)){
			bGetIPCMotion[nChn] = false;
			RfParamCall(function(a){
				IPCMotionCfg[nChn] = a;
				bGetIPCMotion[nChn] = true;
				GetCustomerFlowDetectCfg(callback);
			}, pageTitle, "Detect.MotionDetectIPC", nChn, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			GetCustomerFlowDetectCfg(callback);
		}
	}
	function GetMotionCfg(nIndex) {
		if (!bGet[nIndex]){
			RfParamCall(function (a) {
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
				
				req = {"Name": "OPFileUpgradeIPCReq", "OPFileUpgradeIPCReq": {"Channel": nIndex}};
				RfParamCall(function(a){
					if(a.Ret == 100){
						IPCInfo[nIndex] = a[a.Name];
					}

					if(faceFuncAry[nIndex]){
						GetFaceCfg(nIndex);
					}else{
						GetDigitalHuman(nIndex, function () {
							ShowData(nIndex);
							MasklayerHide();
						});
					}		
				}, pageTitle, "OPFileUpgradeIPCReq", -1, WSMsgID.WSMsgID_GET_IPC_SYSINFO_REQ, req, true);	
			}, pageTitle, "Detect.MotionDetect", nIndex, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			ShowData(nIndex);
		}
	}
	function CHOSDSaveSel(nIndex) {
		var chn=chnIndex==gDevice.loginRsp.ChannelNum?0:chnIndex;
		try {
			var Motion = motionCfg[chn][motionCfg[chn].Name];
			if(digitalHumanAbility[chn].SupportAlarmVoiceTips && bGetIPCMotion[chn]){
				IPCMotionCfg[chn][IPCMotionCfg[chn].Name].EventHandler.VoiceEnable=$("#SA_MotionAndHuman_AlarmSound").prop("checked");
			}
			if(digitalHumanAbility[chn].HumanDection){
				HumanCfg[chn][HumanCfg[chn].Name].Enable=$("#SA_MotionAndHumanSwitch").attr("data")*1?true:false;
			}
			Motion.Enable=$("#SA_Enable").attr("data")*1?true:false;
			if(digitalHumanAbility[chn].SupportAlarmLinkLight){
				Motion.EventHandler.LightEnable=$("#SA_MotionAndHuman_AlarmLight").prop("checked");
			}
			Motion.EventHandler.MessageEnable=$("#SA_MotionAndHuman_PhoneUp").prop("checked");
			Motion.EventHandler.RecordEnable=$("#SA_MotionAndHuman_Record").prop("checked");
			Motion.EventHandler.RecordMask = GetSingleChnMasks(Motion.EventHandler.RecordEnable, chn);
			Motion.Level=$("#SA_SensitivenessS").val()*1;
		} catch (error) {
			DebugStringEvent("Save Motion Error");
		}

		if(faceFuncAry[chn] && isObject(faceCfg[chn])){
			var Face = faceCfg[chn][faceCfg[chn].Name];
			Face.Enable=$("#SA_FaceEnable").attr("data")*1?true:false;
			Face.EventHandler.MessageEnable=$("#SA_Face_PhoneUp").prop("checked");
			Face.EventHandler.RecordEnable=$("#SA_Face_Record").prop("checked");
			Face.EventHandler.RecordMask = GetSingleChnMasks(Face.EventHandler.RecordEnable, chn);
		}		

		if(chFlowCount[chn] && isObject(detectCfg[chn])){
			var cfg = detectCfg[chn];
			cfg[cfg.Name]["Enable"] = $("#SA_CustomFlowSwitch").attr("data") * 1 ? true : false;
			cfg[cfg.Name]["IsOutSide"] = $("#SA_IsOutsideSel").val() * 1;
		}
	}
	function SaveFaceCfg(nIndex){
		if(nIndex <  gDevice.loginRsp.ChannelNum){
			if(faceFuncAry[nIndex] && isObject(faceCfg[nIndex])){
				RfParamCall(function (data){
					SaveFaceCfg(nIndex + 1);
				}, pageTitle, "Detect.FaceDetection", nIndex, WSMsgID.WsMsgID_CONFIG_SET, faceCfg[nIndex]);
			}else{
				SaveFaceCfg(nIndex + 1);
			}
		}else{
			ShowPaop(pageTitle,lg.get("IDS_SAVE_SUCCESS"));
		}
	}
	function SaveIPCMotion(nIndex){
		if(nIndex < gDevice.loginRsp.ChannelNum){
			if ( bGetIPCMotion[nIndex]){
				//2019-04-16 同步是否启用选项
				IPCMotionCfg[nIndex][IPCMotionCfg[nIndex].Name].Enable = motionCfg[nIndex][motionCfg[nIndex].Name].Enable;
				RfParamCall(function(a){
					SaveIPCMotion(nIndex + 1);
				}, pageTitle, "Detect.MotionDetectIPC", nIndex, WSMsgID.WsMsgID_CONFIG_SET, IPCMotionCfg[nIndex]);
			}else{
				SaveIPCMotion(nIndex + 1);
			}
		}else{
			SaveFaceCfg(0);
		}
	}
	function SaveHumanCfg(nIndex){
		if(nIndex < gDevice.loginRsp.ChannelNum){
			if (bGet[nIndex] && (bNVRHuman && isObject(digitalHumanAbility[nIndex])
				&& digitalHumanAbility[nIndex].HumanDection)){
				RfParamCall(function(a){
					SaveHumanCfg(nIndex + 1);
				}, pageTitle, "Detect.HumanDetection", nIndex, WSMsgID.WsMsgID_CONFIG_SET, HumanCfg[nIndex]);
			}else{
				SaveHumanCfg(nIndex + 1);
			}
		}else{
			if(bNVRHuman){
				SaveIPCMotion(gDevice.loginRsp.VideoInChannel);
			}else{
				SaveFaceCfg(0);
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
			if(bNVRHuman){
				SaveHumanCfg(0);
			}else{
				ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
			}
		}
	}

	function SaveAllMotionDetectCfg(nIndex){
		if(nIndex < gDevice.loginRsp.ChannelNum){
			var CfgData = {
				"Name": "Detect.MotionDetect.[" + nIndex + "]"
			}
			CfgData[CfgData.Name] = cloneObj(motionCfg[0][motionCfg[0].Name]);
	
			var chnHex = GetSingleChnMasks(true, nIndex);

			if(CfgData[CfgData.Name].EventHandler.RecordEnable){
				CfgData[CfgData.Name].EventHandler.RecordMask = chnHex;
			}else{
				CfgData[CfgData.Name].EventHandler.RecordMask="0x0";
			}
	
			if(CfgData[CfgData.Name].EventHandler.TourEnable){
				CfgData[CfgData.Name].EventHandler.TourMask = chnHex;
			}else{
				CfgData[CfgData.Name].EventHandler.TourMask="0x0";
			}
	
			if(CfgData[CfgData.Name].EventHandler.SnapEnable){
				CfgData[CfgData.Name].EventHandler.SnapShotMask = chnHex;
			}else{
				CfgData[CfgData.Name].EventHandler.SnapShotMask="0x0";
			}

			RfParamCall(function (data){
				SaveAllMotionDetectCfg(nIndex + 1);
			}, pageTitle, CfgData.Name, nIndex, WSMsgID.WsMsgID_CONFIG_SET, CfgData);
		}	
		else
		{
			if(bNVRHuman && bGetIPCMotion[0]){
				SaveAllIPCMotionCfg(0);
			}else{
				
				SaveAllFaceCfg();
			}
		}
	}
	function SaveAllIPCMotionCfg(nIndex){
		if(nIndex < gDevice.loginRsp.ChannelNum){
			if(bGetIPCMotion[nIndex] && bGetIPCMotion[0]){
				IPCMotionCfg[nIndex][IPCMotionCfg[nIndex].Name].Enable = motionCfg[nIndex][motionCfg[nIndex].Name].Enable;
				if(nIndex > 0){
					var handler = IPCMotionCfg[0][IPCMotionCfg[0].Name].EventHandler;
					var ipcEventHandler = IPCMotionCfg[nIndex][IPCMotionCfg[nIndex].Name].EventHandler;
					var bAlarmSoundFunc = (digitalHumanAbility[0].SupportAlarmVoiceTips
						&& digitalHumanAbility[nIndex].SupportAlarmVoiceTips);
					var bIPCAlarm = (IPCInfo[0] != null && IPCInfo[0].AlarmOutChannel > 0) 
						&& (IPCInfo[nIndex] != null && IPCInfo[nIndex].AlarmOutChannel > 0);
					if(bAlarmSoundFunc){
						ipcEventHandler.VoiceEnable = handler.VoiceEnable;
					}			
					if(bIPCAlarm){
						ipcEventHandler.AlarmOutLatch = handler.AlarmOutLatch;
						ipcEventHandler.AlarmOutMask = handler.AlarmOutMask;
						ipcEventHandler.AlarmOutEnable = handler.AlarmOutEnable;
					}
				}
				
				RfParamCall(function(a){
					SaveAllIPCMotionCfg(nIndex + 1);
				}, pageTitle, "Detect.MotionDetectIPC", nIndex, WSMsgID.WsMsgID_CONFIG_SET, IPCMotionCfg[nIndex]);
			}else {
				SaveAllIPCMotionCfg(nIndex + 1);
			}
		}else{
			SaveAllFaceCfg()
		}
	}
	function SaveAllFaceCfg(){
		if(faceFuncAry[0] && isObject(faceCfg[0])){
			var CfgData = {
				"Name": "Detect.FaceDetection.[ff]",
				"Detect.FaceDetection.[ff]": cloneObj(faceCfg[0][faceCfg[0].Name])
			};
			
			if(CfgData[CfgData.Name].EventHandler.RecordEnable){
				CfgData[CfgData.Name].EventHandler.RecordMask="0xffffffffffffffff";
			}else{
				CfgData[CfgData.Name].EventHandler.RecordMask="0x0";
			}
	
			if(CfgData[CfgData.Name].EventHandler.TourEnable){
				CfgData[CfgData.Name].EventHandler.TourMask="0xffffffffffffffff";
			}else{
				CfgData[CfgData.Name].EventHandler.TourMask="0x0";
			}
	
			if(CfgData[CfgData.Name].EventHandler.SnapEnable){
				CfgData[CfgData.Name].EventHandler.SnapShotMask="0xffffffffffffffff";
			}else{
				CfgData[CfgData.Name].EventHandler.SnapShotMask="0x0";
			}

			RfParamCall(function (data){
				SetCustomerFlowDetectCfg(0, function(){
					ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
					FillAlarmType();
				});
			}, pageTitle, CfgData.Name, -1, WSMsgID.WsMsgID_CONFIG_SET, CfgData);
		}else{
			SetCustomerFlowDetectCfg(0, function(){
				ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
				FillAlarmType();
			});
		}
	}
	function GetCustomerFlowDetectCfg(callback)
	{
		if(chFlowCount[chnIndex])
		{			
			RfParamCall(function(a, b){
				if(a.Ret == 100)
				{
					detectCfg[chnIndex] = a;
				}

				if(callback != null)
					callback();

			}, pageTitle, "bypass@Detect.CustomerFlow", chnIndex, WSMsgID.WsMsgID_CONFIG_GET);
		}
		else
		{	
			if(callback != null)
				callback();
		}
	}
	function SetCustomerFlowDetectCfg(nIndex, callback)
	{
		if(nIndex < gDevice.loginRsp.ChannelNum){
			if(chFlowCount[chnIndex] && isObject(detectCfg[nIndex])){
				RfParamCall(function (data){
					SetCustomerFlowDetectCfg(nIndex + 1, callback);
				}, pageTitle, "bypass@Detect.CustomerFlow", chnIndex, WSMsgID.WsMsgID_CONFIG_SET, detectCfg[nIndex]);
			}
			else
			{
				SetCustomerFlowDetectCfg(nIndex + 1, callback);
			}
		}
		else
		{
			if(callback != null)
				callback();
		}
	}
	function SaveFaceCfg(nIndex){
		if(nIndex <  gDevice.loginRsp.ChannelNum){
			if(faceFuncAry[nIndex] && isObject(faceCfg[nIndex])){
				RfParamCall(function (data){
					SaveFaceCfg(nIndex + 1);
				}, pageTitle, "Detect.FaceDetection", nIndex, WSMsgID.WsMsgID_CONFIG_SET, faceCfg[nIndex]);
			}else{
				SaveFaceCfg(nIndex + 1);
			}
		}else{
			SetCustomerFlowDetectCfg(0, function(){
				ShowPaop(pageTitle,lg.get("IDS_SAVE_SUCCESS"));
			});
		}
	}
	function InitSmartAlarmPage() {
		bCopy = false;
		for (var j = 0; j < gDevice.loginRsp.ChannelNum; j++) {
			bGet[j] = false;
			motionCfg[j] = null;
			HumanCfg[j] = null;
			humanAbility[j] = null;
			digitalHumanAbility[j] = null;
			bGetIPCMotion[j] = false;
			IPCMotionCfg[j] = null;
			chPeaInHumanPed[j] = 0;
			faceCfg[j] = null;
			faceFuncAry[j] = 0;
			IPCInfo[j] = null;
			chFlowCount[j] = 0;
		}
		var nIndex = chnIndex;
		if (nIndex >= gDevice.loginRsp.ChannelNum || nIndex < 0) {
			nIndex = 0;
		}
		RfParamCall(function (a) {
			if(typeof a[a.Name].SupportFaceDetectV2 != 'undefined'){
				faceFuncAry = a[a.Name].SupportFaceDetectV2;
			}
			if(typeof a[a.Name].SupportPeaInHumanPed != 'undefined'){
				chPeaInHumanPed = a[a.Name].SupportPeaInHumanPed;
			}
			if(GetFunAbility(gDevice.Ability.OtherFunction.SupportCustomerFlowCount)
			 && typeof a[a.Name].SupportCustomerFlowCount != 'undefined'){
				chFlowCount = a[a.Name].SupportCustomerFlowCount;
			}
			RfParamCall(function (a) {
				motionArea = a;
				GetMotionCfg(nIndex);
			}, pageTitle, "MotionArea", -1, WSMsgID.WsMsgID_ABILITY_GET);
		}, pageTitle, "ChannelSystemFunction", -1, WSMsgID.WSMsgID_CHANNEL_ABILITY_GET_REQ, "", false, true);
	}
	function FillAlarmType(){
		GetLocalVoiceTipType("Detect.MotionDetect", function(){
			InitSmartAlarmPage();
		});
	}
	$(".SA_FaceL").each(function () {
		$(this).text(lg.get("IDS_ALARM_FACE"))
	})
	//支持录像
	$("#SA_Record_line").css("display", bRecord ? "" : "none");
	//支持手机上报.
	$("#SA_PhoneUp_line").css("display", GetFunAbility(gDevice.Ability.NetServerFunction.NetPMS) ? "" : "none");

	$(function () {
		if(gDevice.bGetDefault){
			$("#SA_Default").css("display", "");
		}
		$("#SA_Channel").empty();
		var dataHtml = '';
		for (var j = 0; j < gDevice.loginRsp.ChannelNum; j++) {
			dataHtml += '<option value="' + j + '">' + gDevice.getChannelName(j) + '</option>';
		}
		if (gDevice.loginRsp.ChannelNum > 1) {
			dataHtml += '<option value="' + j + '">' + lg.get("IDS_CFG_ALL") + '</option>';
		}
		$("#SA_Channel").append(dataHtml);
		if (chnIndex == -1) {
			chnIndex = 0;
		}
		$("#SA_Channel").val(chnIndex);
		for (var j = 1; j <= 6; j++) {
			var level = lg.get("IDS_SSV_" + j);
			$("#SA_SensitivenessS").append('<option value="' + j + '">' + level + '</option>');
		}
		$("#SA_IsOutsideSel").append('<option value="' + 0 + '">' + lg.get("IDS_StatisticMode_Inside") + '</option>');
		$("#SA_IsOutsideSel").append('<option value="' + 1 + '">' + lg.get("IDS_StatisticMode_Outside") + '</option>');
		ChangeBtnState();
		$("#SA_Save").click(function(){
			var nChn = $("#SA_Channel").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum && (gDevice.loginRsp.SoftWareVersion > "V2.62.R07" || gDevice.loginRsp.BuildTime > "2024-04-01")){
				CHOSDSaveSel(0);
				SaveAllMotionDetectCfg(0);
			}else{
				CHOSDSaveSel(nChn);
				SaveCfg(0);
			}
		})
		$("#SA_Rf").click(function () {
			FillAlarmType();
		})
		$("#SA_FaceEnable").click(function () {
			OnClickFaceEnableBtn();
		})
		$("#SA_MotionAndHumanSwitch").click(function () {
			OnClickHumanSwh();
		})
		$("#SA_CustomFlowSwitch").click(function(){
			OnClickCustomerFlowEnableBtn();
		});
		$("#SA_Enable").click(function () {
			OnClickedEnable();
			OnClickFaceEnableBtn();
		})
		$(".SA_AdvanceSet").unbind().click(function () {
			var flag = this.id == "SA_MotionAndHuman_Advance_Set" ? true : false;
			OnClickAdvanceBtn(flag);
		});
		$("#SA_Channel").change(function () {
			var nChn = $("#SA_Channel").val() * 1;
			//是否全通道
			var bAllChn = (nChn == gDevice.loginRsp.ChannelNum ? true : false);
			$("#SA_RuleAndRegion").css("display", bAllChn ? "none" : "");
			if (chnIndex != gDevice.loginRsp.ChannelNum) {
				//TODO保存当前通道配置
				CHOSDSaveSel(chnIndex);
			}
			chnIndex = nChn;
			GetMotionCfg(bAllChn ? 0 : nChn);
		})
		$("#SA_RuleAndRegionBtn").click(function () {
			var nChn = $("#SA_Channel").val() * 1;
			if (nChn < 0) {
				return;
			}
			if (nChn == gDevice.loginRsp.ChannelNum) {
				nChn = 0;
			}
			var nRow;
			var nCol;
			if (nChn >= gDevice.loginRsp.VideoInChannel) {
				if (GetFunAbility(gDevice.Ability.OtherFunction.ShowAlarmLevelRegion)) {
					RfParamCall(function (a) {
						if (a.Ret == 100) {
							motionAreaDig = a;
							nRow = a[a.Name].GridRow;
							nCol = a[a.Name].GridColumn;
							ShowAreaSet(nChn, nRow, nCol);
						} else {
							ShowPaop(pageTitle, lg.get("IDS_NET_TIP_OTHER"));
							MasklayerHide();
							return;
						}
					}, pageTitle, "MotionArea", nChn, WSMsgID.WsMsgID_ABILITY_GET);
				} else {
					motionAreaDig = cloneObj(motionArea);
					nRow = motionAreaDig[motionAreaDig.Name].GridRow;
					nCol = motionAreaDig[motionAreaDig.Name].GridColumn;
					ShowAreaSet(nChn, nRow, nCol);
				}
			} else {
				nRow = motionArea[motionArea.Name].GridRow;
				nCol = motionArea[motionArea.Name].GridColumn;
				ShowAreaSet(nChn, nRow, nCol);
			}
		})
		$("#SA_MotionAndHuman_Record ,#SA_Face_Record").change(function () {
			var flag=this.id=="SA_MotionAndHuman_Record"?true:false;
			var index=chnIndex==gDevice.loginRsp.ChannelNum?0:chnIndex;
			var cfg=flag?motionCfg[index][motionCfg[index].Name]:faceCfg[index][faceCfg[index].Name];
			var index = $("#SA_Channel").val()*1;
			index=index==gDevice.loginRsp.ChannelNum?0:index;
			cfg.EventHandler.RecordMask = GetSingleChnMasks($(this).prop("checked"), index);
			if(flag){
				if(!$("#SA_MotionAndHuman_Record").prop("checked") && faceFuncAry[index]){
					$("#SA_Face_Record").prop("checked",false);
					faceCfg[index][faceCfg[index].Name].EventHandler.RecordMask = GetSingleChnMasks(0, index);
				}
			}else{
				if($("#SA_Face_Record").prop("checked")){
					$("#SA_MotionAndHuman_Record").prop("checked",true);
					motionCfg[index][motionCfg[index].Name].EventHandler.RecordMask = GetSingleChnMasks(1, index);
				}
			}
		})
		$("#SA_CP").click(function () {
			var nChn = $("#SA_Channel").val() * 1;
			if (nChn == gDevice.loginRsp.ChannelNum){
				nChn = 0;
			}
			CHOSDSaveSel(nChn);
			bCopy = true;
			copyChannel = nChn;
		});

		$("#SA_Paste").click(function () {
			if(!bCopy)return;
			var nChn = $("#SA_Channel").val() * 1;

			var cfg = motionCfg[copyChannel][motionCfg[copyChannel].Name];		
			var eventHandler = cfg.EventHandler;

			if (nChn == gDevice.loginRsp.ChannelNum){
				for (var k = 0; k < gDevice.loginRsp.ChannelNum; k++){
					if (!bGet[k]) continue;
					motionCfg[k][motionCfg[k].Name].Region = cfg.Region;
					var cfgHandler = motionCfg[k][motionCfg[k].Name].EventHandler;

					var FaceEnable = false;
					var faceHandler = null;
					var faceCopyHandler = null;
					if(faceFuncAry[copyChannel] && faceFuncAry[k] 
						&& isObject(faceCfg[copyChannel]) && isObject(faceCfg[k])){
						FaceEnable = true;
						faceHandler = faceCfg[k][faceCfg[k].Name].EventHandler;
						faceCopyHandler = faceCfg[copyChannel][faceCfg[copyChannel].Name].EventHandler;
					}

					for (var i = 0; i < 7; i++) {
						for (var j = 0; j < 6; j++) {
							cfgHandler.TimeSection[i][j] = eventHandler.TimeSection[i][j];
							if(FaceEnable){
								faceHandler.TimeSection[i][j] = faceCopyHandler.TimeSection[i][j];
							}
						}
					}
	
					for (var m = 0; m < gDevice.loginRsp.ChannelNum; m++) {
						cfgHandler.PtzLink[m][0] = eventHandler.PtzLink[m][0];
						cfgHandler.PtzLink[m][1] = eventHandler.PtzLink[m][1];
						if(FaceEnable){
							faceHandler.PtzLink[m][0] = faceCopyHandler.PtzLink[m][0];
							faceHandler.PtzLink[m][1] = faceCopyHandler.PtzLink[m][1];
						}
					}
					
					if(bTour){
						cfgHandler.TourEnable = eventHandler.TourEnable;
						if(FaceEnable){
							faceHandler.TourEnable = faceCopyHandler.TourEnable;
						}
					}
					if(bSendEmail){
						cfgHandler.MailEnable = eventHandler.MailEnable;
						if(FaceEnable){
							faceHandler.MailEnable = faceCopyHandler.MailEnable;
						}
					}	
					if(bSnap){
						cfgHandler.SnapEnable = eventHandler.SnapEnable;
						if(FaceEnable){
							faceHandler.SnapEnable = faceCopyHandler.SnapEnable;
						}
					}
					if(bFtp){
						cfgHandler.FTPEnable = eventHandler.FTPEnable;
					}
					if(bWriteLog){
						cfgHandler.LogEnable = eventHandler.LogEnable;
						if(FaceEnable){
							faceHandler.LogEnable = faceCopyHandler.LogEnable;
						}
					}		
					cfgHandler.RecordLatch = eventHandler.RecordLatch;
					cfgHandler.EventLatch = eventHandler.EventLatch;
					cfgHandler.BeepEnable = eventHandler.BeepEnable;
					cfgHandler.VoiceEnable = eventHandler.VoiceEnable;
					cfgHandler.VoiceType = eventHandler.VoiceType;
					if(gDevice.loginRsp.AlarmOutChannel > 0){
						cfgHandler.AlarmOutLatch = eventHandler.AlarmOutLatch;
						cfgHandler.AlarmOutMask = eventHandler.AlarmOutMask;
						cfgHandler.AlarmOutEnable = eventHandler.AlarmOutEnable;
					}
					if(FaceEnable){
						faceHandler.RecordLatch = faceCopyHandler.RecordLatch;
						faceHandler.EventLatch = faceCopyHandler.EventLatch;
						faceHandler.BeepEnable = faceCopyHandler.BeepEnable;
						faceHandler.VoiceEnable = faceCopyHandler.VoiceEnable;
						faceHandler.VoiceType = faceCopyHandler.VoiceType;
						if(gDevice.loginRsp.AlarmOutChannel > 0){
							faceHandler.AlarmOutLatch = faceCopyHandler.AlarmOutLatch;
							faceHandler.AlarmOutMask = faceCopyHandler.AlarmOutMask;
							faceHandler.AlarmOutEnable = faceCopyHandler.AlarmOutEnable;
						}
					}

					// 都支持客流统计
					if(chFlowCount[copyChannel] && chFlowCount[k] 
						&& isObject(detectCfg[copyChannel]) && isObject(detectCfg[k]))
					{
						detectCfg[k][detectCfg[k].Name].Enable = detectCfg[copyChannel][detectCfg[copyChannel].Name].Enable;
						detectCfg[k][detectCfg[k].Name].IsOutSide = detectCfg[copyChannel][detectCfg[copyChannel].Name].IsOutSide;
					}
				}
			} else {
				motionCfg[nChn][motionCfg[nChn].Name].Region = cfg.Region;
				var cfgHandler = motionCfg[nChn][motionCfg[nChn].Name].EventHandler;
				var FaceEnable = false;
				var faceHandler = null;
				var faceCopyHandler = null;
				if(faceFuncAry[copyChannel] && faceFuncAry[nChn] 
					&& isObject(faceCfg[copyChannel]) && isObject(faceCfg[nChn])){
					FaceEnable = true;
					faceHandler = faceCfg[nChn][faceCfg[nChn].Name].EventHandler;
					faceCopyHandler = faceCfg[copyChannel][faceCfg[copyChannel].Name].EventHandler;
				}

				for (var i = 0; i < 7; i++) {
					for (var j = 0; j < 6; j++) {
						cfgHandler.TimeSection[i][j] = eventHandler.TimeSection[i][j];
						if(FaceEnable){
							faceHandler.TimeSection[i][j] = faceCopyHandler.TimeSection[i][j];
						}
					}
				}
				for (var m = 0; m < gDevice.loginRsp.ChannelNum; m++) {
					cfgHandler.PtzLink[m][0] = eventHandler.PtzLink[m][0];
					cfgHandler.PtzLink[m][1] = eventHandler.PtzLink[m][1];
					if(FaceEnable){
						faceHandler.PtzLink[m][0] = faceCopyHandler.PtzLink[m][0];
						faceHandler.PtzLink[m][1] = faceCopyHandler.PtzLink[m][1];
					}
				}

				if(bTour){
					cfgHandler.TourEnable = eventHandler.TourEnable;
					if(FaceEnable){
						faceHandler.TourEnable = faceCopyHandler.TourEnable;
					}
				}
				if(bSendEmail){
					cfgHandler.MailEnable = eventHandler.MailEnable;
					if(FaceEnable){
						faceHandler.MailEnable = faceCopyHandler.MailEnable;
					}
				}	
				if(bSnap){
					cfgHandler.SnapEnable = eventHandler.SnapEnable;
					if(FaceEnable){
						faceHandler.SnapEnable = faceCopyHandler.SnapEnable;
					}
				}
				if(bFtp){
					cfgHandler.FTPEnable = eventHandler.FTPEnable;
				}
				if(bWriteLog){
					cfgHandler.LogEnable = eventHandler.LogEnable;
					if(FaceEnable){
						faceHandler.LogEnable = faceCopyHandler.LogEnable;
					}
				}		
				cfgHandler.RecordLatch = eventHandler.RecordLatch;
				cfgHandler.EventLatch = eventHandler.EventLatch;
				cfgHandler.BeepEnable = eventHandler.BeepEnable;
				cfgHandler.VoiceEnable = eventHandler.VoiceEnable;
				cfgHandler.VoiceType = eventHandler.VoiceType;
				if(gDevice.loginRsp.AlarmOutChannel > 0){
					cfgHandler.AlarmOutLatch = eventHandler.AlarmOutLatch;
					cfgHandler.AlarmOutMask = eventHandler.AlarmOutMask;
					cfgHandler.AlarmOutEnable = eventHandler.AlarmOutEnable;
				}
				if(FaceEnable){
					faceHandler.RecordLatch = faceCopyHandler.RecordLatch;
					faceHandler.EventLatch = faceCopyHandler.EventLatch;
					faceHandler.BeepEnable = faceCopyHandler.BeepEnable;
					faceHandler.VoiceEnable = faceCopyHandler.VoiceEnable;
					faceHandler.VoiceType = faceCopyHandler.VoiceType;
					if(gDevice.loginRsp.AlarmOutChannel > 0){
						faceHandler.AlarmOutLatch = faceCopyHandler.AlarmOutLatch;
						faceHandler.AlarmOutMask = faceCopyHandler.AlarmOutMask;
						faceHandler.AlarmOutEnable = faceCopyHandler.AlarmOutEnable;
					}
				}

				if(chFlowCount[copyChannel] && chFlowCount[nChn] 
					&& isObject(detectCfg[copyChannel]) && isObject(detectCfg[nChn]))
				{
					detectCfg[nChn][detectCfg[nChn].Name].Enable = detectCfg[copyChannel][detectCfg[copyChannel].Name].Enable;
					detectCfg[nChn][detectCfg[nChn].Name].IsOutSide = detectCfg[copyChannel][detectCfg[copyChannel].Name].IsOutSide;
				}
			}

			var chn = (nChn == gDevice.loginRsp.ChannelNum ? 0 : nChn);
			var SAEnable;
			var SensitivenessLev;
			var AlarmLightFunc;
			var AlarmLightEnable;
			var PhonePushEnable;
			var RecordEnable;
			var AlarmSoundFunc = (digitalHumanAbility[copyChannel].SupportAlarmVoiceTips
				&& digitalHumanAbility[chn].SupportAlarmVoiceTips);
			var AlarmSoundEnable = false;
			var FaceFunc = (faceFuncAry[copyChannel] && faceFuncAry[chn]);
			var FaceEnable = !1;
			var PhonePushFaceEnable = false;
			var RecordFaceEnable = false;
			var HumanFunc = (digitalHumanAbility[copyChannel].HumanDection && digitalHumanAbility[chn].HumanDection);
			var HumanEnable = !1;

			try {
				var Motion = motionCfg[copyChannel][motionCfg[copyChannel].Name];
				SAEnable = Motion.Enable ? 1 : 0;
				SensitivenessLev = Motion.Level;
				AlarmLightFunc = (digitalHumanAbility[copyChannel].SupportAlarmLinkLight 
					&& digitalHumanAbility[chn].SupportAlarmLinkLight);
				AlarmLightEnable = AlarmLightFunc ? Motion.EventHandler.LightEnable : false;
				PhonePushEnable = Motion.EventHandler.MessageEnable;
				RecordEnable = Motion.EventHandler.RecordEnable;
			} catch (error) {
				DebugStringEvent("Motion Config Error");
				SAEnable = 0;
				SensitivenessLev = 0;
				AlarmLightFunc = false;
				AlarmLightEnable = false;
				PhonePushEnable = false;
				RecordEnable = false;
			}

			if(AlarmSoundFunc && bGetIPCMotion[chn] && bGetIPCMotion[copyChannel] && isObject(IPCMotionCfg[copyChannel])){
				var IPCMotion = IPCMotionCfg[copyChannel][IPCMotionCfg[copyChannel].Name];
				AlarmSoundEnable = AlarmSoundFunc ? IPCMotion.EventHandler.VoiceEnable : false;
			}
	
			if(FaceFunc && isObject(faceCfg[copyChannel])){
				var Face = faceCfg[copyChannel][faceCfg[copyChannel].Name];
				FaceEnable = FaceFunc ? (FaceEnable = Face.Enable ? 1 : 0) : 0;
				PhonePushFaceEnable = Face.EventHandler.MessageEnable;
				RecordFaceEnable = Face.EventHandler.RecordEnable;
			}

			if(HumanFunc && isObject(HumanCfg[copyChannel])){
				var Human = HumanCfg[copyChannel][HumanCfg[copyChannel].Name];
				HumanEnable = HumanFunc ? (Human.Enable ? 1 : 0) : 0;
			}

			$("#SA_CustomFlowDiv").css("display", chnIndex != gDevice.loginRsp.ChannelNum && chFlowCount[chn] ? "" : "none");
			$("#SA_IsOutsideDiv").css("display", chnIndex != gDevice.loginRsp.ChannelNum && chFlowCount[chn] ? "" : "none");
			if(chFlowCount[chn])
			{
				$("#SA_CustomFlowSwitch").attr("data", detectCfg[chn][detectCfg[chn].Name].Enable ? 1 : 0);
				$("#SA_IsOutsideSel").val(detectCfg[chn][detectCfg[chn].Name].IsOutSide ? 1 : 0);
			}

			$("#SA_Enable").attr("data", SAEnable);
			//--------------人形和移动----------------
			if(chnIndex != gDevice.loginRsp.ChannelNum && HumanFunc){
				$("#SA_MotionAndHumanSwitch").attr("data", HumanEnable);
			}		
			//选择全通道隐藏人形移动切换按钮
			//报警声
			if(AlarmSoundFunc){
				$("#SA_MotionAndHuman_AlarmSound").prop("checked", AlarmSoundEnable);
			}
			//报警灯
			if(AlarmLightFunc){
				$("#SA_MotionAndHuman_AlarmLight").prop("checked", AlarmLightEnable);
			}			
			//手机上报
			$("#SA_MotionAndHuman_PhoneUp").prop("checked", PhonePushEnable);
			//录像
			$("#SA_MotionAndHuman_Record").prop("checked", RecordEnable);
			//--------------人脸------------------
			if(FaceFunc){
				$("#SA_FaceEnable").attr("data", FaceEnable);
				$("#SA_Face_PhoneUp").prop("checked", PhonePushFaceEnable);
				$("#SA_Face_Record").prop("checked", RecordFaceEnable);
			}
			
			//灵敏度
			$("#SA_SensitivenessS").val(SensitivenessLev);
			MasklayerHide();
			OnClickedEnable();
	
			if ($("#SA_MotionAndHumanSwitch").attr("data") * 1 == 1) {
				SA_MotionAndHumanL.innerHTML = lg.get("IDS_HUMAN_DETECT");
			}
			else{
				SA_MotionAndHumanL.innerHTML = lg.get("MotionDetect");
			}

			ShowRuleAndRegion();

			if($("#SA_FaceEnable").attr("data") * 1 == 1)
			{
				$("#SA_MotionAndHumanSwitch").attr("data", 1);
			}
			if($("#SA_MotionAndHumanSwitch").attr("data") * 1 == 0)
			{
				$("#SA_FaceEnable").attr("data", 0);
			}

			var customerFlowEnbale = $("#SA_CustomFlowSwitch").attr("data") * 1;

			var FaceEnable = $("#SA_FaceEnable").attr("data") * 1;
			var Enable = $("#SA_Enable").attr("data") * 1;
			if (Enable) {
				DivBox(customerFlowEnbale, "#SA_IsOutsideDiv");
				DivBox(FaceEnable, ".Face_Config");
			}

			InitButton();
		});
		$("#SA_Default").click(function(){
			function GetDefaultHumanCfg(nIndex){
				if (digitalHumanAbility[nIndex].HumanDection) {
					RfParamCall(function (a) {
						HumanCfg[nIndex] = a;
						ShowData(nIndex);
						MasklayerHide();
					}, pageTitle, "Detect.HumanDetection", nIndex, WSMsgID.WsMsgID_CONFIG_GET);
				}else{
					ShowData(nIndex);
					MasklayerHide();
				}
			}
			function GetDefaultFaceCfg(nIndex) {
				RfParamCall(function (a) {
					faceCfg[nIndex] = a;
					var timeSection = faceCfg[nIndex][faceCfg[nIndex].Name].EventHandler.TimeSection;
					for(var i = 0; i < timeSection.length; i++){
						if(isObject(timeSection[i])){
							for(var j = 0; j < timeSection[i].length ; j++){
								if(timeSection[i][j] == ""){
									timeSection[i][j] = "0 00:00:00-00:00:00";
								}
							}
						}
					}
					faceCfg[nIndex][faceCfg[nIndex].Name].EventHandler.TimeSection = timeSection;
					GetDefaultHumanCfg(nIndex);
				}, pageTitle, "Detect.FaceDetection", nIndex, WSMsgID.WsMsgID_DEFAULTCONFIG_GET);
			}
			
			var nIndex = $("#SA_Channel").val() * 1;
			if (nIndex == gDevice.loginRsp.ChannelNum){
				nIndex = 0;
			}
			RfParamCall(function (a) {
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
				
				if(faceFuncAry[nIndex]){
					GetDefaultFaceCfg(nIndex);
				}else{
					GetDefaultHumanCfg(nIndex);
				}
			}, pageTitle, "Detect.MotionDetect", nIndex, WSMsgID.WsMsgID_DEFAULTCONFIG_GET);
		});
		FillAlarmType();
	})
})