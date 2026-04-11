//# sourceURL=Info_ChanStatus.js
$(function() {
	var ChanStatus ={};
	var pageTitle = $("#Info_ChanStatus").text();
	function ShowData(){
		var table = $("#ChnStatusTable")[0];
		var nIndex = 0
		var nCount = ChanStatus[ChanStatus.Name].length;
		while(nIndex < nCount && ChanStatus[ChanStatus.Name][nIndex].ChnName != "") {
			var ChanName = ChanStatus[ChanStatus.Name][nIndex].ChnName;
			var MaxRes = ChanStatus[ChanStatus.Name][nIndex].MaxRes;
			if (MaxRes == "Unknown" || MaxRes == "0x0") {
				MaxRes = lg.get("IDS_CHSTA_Unknown");
			}
			var CurRes = ChanStatus[ChanStatus.Name][nIndex].CurRes;
			if ( CurRes == "Unknown" ) {
				CurRes = lg.get("IDS_CHSTA_Unknown");
			} 
			else {
				var nFind = CurRes.indexOf("0x0");
				if(nFind >= 0) {
					CurRes = CurRes.replace("0x0", lg.get("IDS_CHSTA_Unknown"));
				}
			}
			var Status = "IDS_CHSTA_" + ChanStatus[ChanStatus.Name][nIndex].Status;
			var tr = table.insertRow(nIndex);
			var td1 = tr.insertCell(0);
			var td2 = tr.insertCell(1);
			var td3 = tr.insertCell(2);
			var td4 = tr.insertCell(3);
			td1.innerHTML = ChanName;
			td2.innerHTML = MaxRes;
			td3.innerHTML = CurRes;
			td4.innerHTML = lg.get(Status);
			
			nIndex++;
		}
		var nHeadPadding = 0;
		var contentH = $("#ChnStstusList .table-responsive").height()-$("#ChnStstusList .table-head").height();
		if(nIndex * 30 > contentH){
			nHeadPadding = TableRightPadding;
		}
		$("#ChnStstusList .table-head").css("padding-right", nHeadPadding+"px");
		MasklayerHide();
	}
	function LoadConfig(){
		RfParamCall(function(a,b){
			ChanStatus = a;
			ShowData();
		}, pageTitle, "NetWork.ChnStatus", -1, WSMsgID.WsMsgID_CONFIG_GET);
	}
	$(function() {
		var contentH = $("#ChnStstusList .table-responsive").height()-$("#ChnStstusList .table-head").height();
		$("#ChnStstusList .table-content").css("height", contentH+'px');

		LoadConfig();
	});
});