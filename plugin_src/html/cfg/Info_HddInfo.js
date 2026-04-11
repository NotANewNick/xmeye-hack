//# sourceURL=Info_HddInfo.js
$(function() {
	var StorageInfo = {};
	var listData = [];
	var listData2 = [];
	var table = $("#TypeCapacityTable")[0];
	var table2 = $("#RecordTimeTable")[0];
	var pageTitle = $("#Info_HddInfo").text();
	var hddInfoArr;
	function ShowData(){
		listData = [];
		listData2 = [];
		hddInfoArr = StorageInfo[StorageInfo.Name];

		var fristData = {"StorageNo":lg.get("IDS_PATH_ALL"), "Type":"-", "Capacity":"0", "LeftCapacity":"0", "Status":""};
		listData.push(fristData);
		
		var fristData2 = {"StorageNo":lg.get("IDS_PATH_ALL"), "StartTime":"", "EndTime":""};
		listData2.push(fristData2);

		var allCapacity = 0;
		var allLeftCapacity = 0;
		var startTime = "";
		var endTime = "";
		if (hddInfoArr != null) {
			for (var i=0; i < hddInfoArr.length; i++) {
				if(hddInfoArr[i].PartNumber == 255){
					if(g_productID === "G2"){
						var tempData = {
							"StorageNo":hddInfoArr[i].PlysicalNo+1 +"-1",
							"Type":"?",
							"Capacity":"",
							"LeftCapacity":"",
							"Status":lg.get("IDS_HDD_Unformatted"),
							"Version":Version
						};
						listData.push(tempData);
						
						var tempData2 = {
							"StorageNo":hddInfoArr[i].PlysicalNo+1 +"-1",
							"StartTime":"-", 
							"EndTime":"-"
						};
						listData2.push(tempData2);
					}
					continue;
				}
				for (var j=0; j < hddInfoArr[i].PartNumber; j++) {
					var capacity = parseInt(hddInfoArr[i].Partition[j].TotalSpace);
					var leftCapacity = parseInt(hddInfoArr[i].Partition[j].RemainSpace);
					
					var strStatus = "Normal";
					if (hddInfoArr[i].Partition[j].Status != 0) {
						strStatus = "Error";
					}
					
					var strType = lg.get("IDS_HDD_TYPE_ReadWrite");
					var nDriverType = hddInfoArr[i].Partition[j].DirverType;
					if (nDriverType == 0) {
						strType = lg.get("IDS_HDD_TYPE_ReadWrite");
					}else if(nDriverType == 1) {
						strType = lg.get("IDS_HDD_TYPE_ReadOnly");
					}else if (nDriverType == 2) {
						strType = lg.get("IDS_HDD_TYPE_EventDriver");
					}else if (nDriverType == 3) {
						strType = lg.get("IDS_HDD_TYPE_ReduDriver");
					}else if (nDriverType == 4) {
						strType = lg.get("IDS_HDD_TYPE_SnapShotDriver");
					}
					
					allCapacity += capacity;
					if (nDriverType == 0 || nDriverType == 4) { //本地端只计算抓图盘和读写盘的剩余容量
						allLeftCapacity += leftCapacity;
					}
					var Version = "-";
					var tempData = {
						"StorageNo":hddInfoArr[i].PlysicalNo+1 +"-"+ (j+1),
						"Type":strType,
						"Capacity":ChangeSpaceToString(capacity),
						"LeftCapacity":ChangeSpaceToString(leftCapacity),
						"Status":lg.getEx(strStatus),
						"Version":Version
					};
					listData.push(tempData);
					
					var tempData2 = {
						"StorageNo":hddInfoArr[i].PlysicalNo+1 +"-"+ (j+1),
						"StartTime":hddInfoArr[i].Partition[j].NewStartTime, 
						"EndTime":hddInfoArr[i].Partition[j].NewEndTime
					};
					listData2.push(tempData2);					
					if(tempData2.StartTime == tempData2.EndTime){
						continue;
					}
					if(startTime != "" && endTime != ""){
						var sDate = str2Date(startTime);
						var sCurData = str2Date(tempData2.StartTime);
						if(sCurData.getTime() < sDate.getTime()){
							startTime = tempData2.StartTime;
						}
						var eDate = str2Date(endTime);
						var eCurData = str2Date(tempData2.EndTime);
						if(eDate.getTime() < eCurData.getTime()){
							endTime = tempData2.EndTime;
						}
					}else{
						startTime = tempData2.StartTime;
						endTime = tempData2.EndTime;
					}
				}
			}
			listData[0].Capacity = ChangeSpaceToString(allCapacity);
			listData[0].LeftCapacity = ChangeSpaceToString(allLeftCapacity);
			listData[0].Version = "-";
			listData2[0].StartTime = startTime;
			listData2[0].EndTime = endTime;
			
			for (var n = 0; n < listData.length; ++n) {
				var tr = table.insertRow(n);
				var td1 = tr.insertCell(0);
				var td2 = tr.insertCell(1);
				var td3 = tr.insertCell(2);
				var td4 = tr.insertCell(3);
				var td5 = tr.insertCell(4);
				//var td6 = tr.insertCell(5);
				td1.innerHTML = listData[n].StorageNo;
				td2.innerHTML = listData[n].Type;
				td3.innerHTML = listData[n].Capacity;
				td4.innerHTML = listData[n].LeftCapacity;
				td5.innerHTML = listData[n].Status;
				//td6.innerHTML = listData[n].Version;
			}
			for (var m = 0; m < listData2.length; ++m) {
				var tr = table2.insertRow(m);
				var td1 = tr.insertCell(0);
				var td2 = tr.insertCell(1);
				var td3 = tr.insertCell(2);
				td1.innerHTML = listData2[m].StorageNo;
				td2.innerHTML = listData2[m].StartTime;
				td3.innerHTML = listData2[m].EndTime;
			}
			var nHeadPadding = 0;
			var nHeadPadding2 = 0;
			var nHeight = $("#TypeCapacityList .table-responsive").height()-$("#TypeCapacityList .table-head").height();
			var nHeight2 = $("#RecordTimeList .table-responsive").height()-$("#RecordTimeList .table-head").height();
			if(listData.length * 30 > nHeight){
				nHeadPadding = TableRightPadding;
			}
			if (listData2.length * 30 > nHeight2){
				nHeadPadding2 = TableRightPadding;
			}
			$("#TypeCapacityList .table-head").css("padding-right", nHeadPadding+"px");
			$("#RecordTimeList .table-head").css("padding-right", nHeadPadding2+"px");
		}
		$("#InfoHddChange").val(0);
		$("#InfoHddChange").text(lg.get("IDS_HDD_View2"));
		$("#TypeCapacityList").css("display","");
		$("#RecordTimeList").css("display","none");
		MasklayerHide();
	}

	function LoadConfig(){
		RfParamCall(function(a,b){
			StorageInfo = a;
			ShowData();
		}, pageTitle, "StorageInfo", -1, WSMsgID.WsMsgID_SYSINFO_REQ);
	}
	$(function() {
		$("#InfoHddChange").click(function(){
			nValue = $(this).val();
			if (nValue == 0) {
				$(this).val(1);
				$(this).text(lg.get("IDS_HDD_View1"));
				$("#TypeCapacityList").css("display","none");
				$("#RecordTimeList").css("display","");
			}else if(nValue == 1) {
				$(this).val(0);
				$(this).text(lg.get("IDS_HDD_View2"));
				$("#TypeCapacityList").css("display","");
				$("#RecordTimeList").css("display","none");
			} 
		});
		if(g_productID === "G2"){
			function DiskOperatorClear() {
				if (listData.length <=0) {
					return;
				}
				var HddHtml = 	'<div class="cfg_row">\n' +
				'				<div class="cfg_row_left">'+ lg.get("IDS_HDDM_Disk") +'</div>\n' +
				'				<div class="cfg_row_right" style="width: auto">\n' +
				'					<select class="select" id="disk_No"></select>\n' +
				'				</div>\n' +
				'            </div>\n' +
				
				'			<div id="partiton_cfg">\n' + 
				'				<div class="cfg_row">\n' +
				'					<div class="cfg_row_left">'+ lg.get("IDS_HDDM_RecordPartition") +'</div>\n' +
				'					<div class="cfg_row_right" style="width: auto">\n' +
				'						<input class="inputTxt" type="text" id="disk_Record" autocomplete="off"/>\n' +
				'						<font id="CHN_Iratio_range_sub">MB</font>\n' +
				'					</div>\n' +
				'				</div>\n' +
	
				'            	<div class="cfg_row">\n' +
				'                	<div class="cfg_row_left">'+ lg.get("IDS_HDDM_ImagePartition") +'</div>\n' +
				'                	<div class="cfg_row_right" style="width: auto">\n' +
				'                    	<input class="inputTxt" type="text" id="disk_Image" autocomplete="off"/>\n' +
				'                    	<font id="CHN_Iratio_range_sub">MB</font>\n' +
				'                	</div>\n' +
				'            	</div>\n' +
				'            </div>\n' +
				
				'			 <div id="DiskOpTips">\n' +
				'			 </div>\n' +
	
				'            <div class="cfg_row">\n' +
				'                <div class="btn_box" style="height: 30px;margin-top: 6px">\n' +
				'                    <button id="diskBtnOk" class="btn">' + lg.get("IDS_OK") + '</button>\n' +
				'                    <button class="btn btn_cancle" id="btnCancel">' + lg.get("IDS_CANCEL") + '</button>\n' +
				'                </div>\n' +
				'			</div>';
				var dataHtml = '<div id="HddFormat">' + HddHtml + '</div>';
				RenderSencondShow(lg.get("IDS_HDDM_ClearTitle"), dataHtml, '', true);
				$("#DiskOpTips").html(lg.get("IDS_HDDM_TipFormatDisk"));
				$("#partiton_cfg").css("display", "none");
				for (var i=0; i < hddInfoArr.length; i++) {
					if(hddInfoArr[i].PartNumber == 255){
						$("#disk_No").append('<option value="'+ i +'">'+ (hddInfoArr[i].PlysicalNo+1) +'-1'+ '</option>')
						continue;
					}
					for (var j=0; j < hddInfoArr[i].PartNumber; j++) {
						$("#disk_No").append('<option value="'+ i +'">'+ (hddInfoArr[i].PlysicalNo+1) +'-'+ (j+1) +'</option>')
					}
				}
				$("#diskBtnOk").click(function() {
					var nLogicNo = $("#disk_No").val() *1;						//逻辑磁盘号
					var selText = $("#disk_No").find("option:selected").text();
					var nPartNo = (selText.split("-")[1]) *1 -1;	//分区号
					if (hddInfoArr[nLogicNo].Partition[nPartNo].DirverType == 1) {	//readonly
						$("#btnCancel").click();
						ShowPaop(pageTitle, lg.get("IDS_HDDM_CannotClear"));
						return;
					}
					var OPStorageManager = {
						"Action":"Clear",
						"SerialNo":nLogicNo,
						"PartNo":nPartNo
					};
					var data = {
						"Name":"OPStorageManager",
						"OPStorageManager":OPStorageManager
					};
					$("#btnCancel").click();
					ShowPaop(pageTitle, lg.get("IDS_HDDM_ClearStart"));
					RfParamCall(function(Result) {
						if (Result.Ret == 100) {
							ShowPaop(pageTitle, lg.get("IDS_HDDM_ClearSuc"));
						} else if(Result.Ret == 603){
							RebootDev(pageTitle, lg.get("IDS_HDDM_ClearSuc"), false);
						}
					}, pageTitle, "OPStorageManager", -1, WSMsgID.WSMsgID_DSIKMANAGER_REQ, data);
				});
			}
			$("#HddClearDisk2").click(function () {
				DiskOperatorClear();
			});
			$("#HddClearDisk2").show();
		}
		
		LoadConfig();
	});
});
