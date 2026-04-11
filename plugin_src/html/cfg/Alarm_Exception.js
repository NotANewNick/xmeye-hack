//# sourceURL=Alarm_Exception.js
$(function(){
    var sel=0;
    var noDisk = null;
	var lowSpace = null;
	var errSpace = null;
	var ipConflict = null;
	var netAbort = null;
	var bflag = false;
	var pageTitle = $("#Alarm_Exception").text();
	var bGet = new Array;
	var fname = ["Storage.StorageNotExist", "Storage.StorageFailure", "Storage.StorageLowSpace",  
	"Alarm.NetAbort", "Alarm.NetIPConflict"];
	var arr = ["IDS_HDD_NO_DISK","IDS_ALARM_HDDINVALIDALARM","IDS_HDD_NOT_CONTENT","IDS_NET_DISCONNECTION",
	           "IDS_IP_CONFLICT"];
	var bSupportEvent = [GetFunAbility(gDevice.Ability.AlarmFunction.StorageNotExist),
						GetFunAbility(gDevice.Ability.AlarmFunction.StorageFailure),
						GetFunAbility(gDevice.Ability.AlarmFunction.StorageLowSpace),
						GetFunAbility(gDevice.Ability.AlarmFunction.NetAbort),
						GetFunAbility(gDevice.Ability.AlarmFunction.NetIpConflict)];
	if(GetFunAbility(gDevice.Ability.OtherFunction.NOHDDRECORD)){
		bSupportEvent[0] = false;
		bSupportEvent[1] = false;
		bSupportEvent[2] = false;
	}
	if (GetFunAbility(gDevice.Ability.AlarmFunction.ScreenTip)){
		$("#screen_box").css("display", "");
	}
	if(gDevice.devType==devTypeEnum.DEV_IPC){
		$("#screen_box").css("display", "none");
	}
	$("#CheckDiskIntervalSwitch").click(function(){
		var bCheck = $(this).prop("checked");
		if(!bCheck){
			$("#CheckDiskIntervalInputTxt").val(0);
			$("#CheckDiskIntervalInputTxt").css("display", "none");
			$("#CheckDiskIntervalSec").css("display", "none");
		}else{
			$("#CheckDiskIntervalInputTxt").val(1);
			$("#CheckDiskIntervalInputTxt").css("display", "");
			$("#CheckDiskIntervalSec").css("display", "");
		}
	});
	function ShowData() {
		var cfg;
		$("#Limit_box").css("display", "none");
		$("#Reboot_box").css("display", "none");
		$("#CheckDiskInterval_Box").css("display", "none");
		if(sel == 0){
			cfg = noDisk[noDisk.Name];
			$("#CheckDiskInterval_Box").css("display", "");
			$("#CheckDiskIntervalInputTxt").val(cfg.EventHandler.CheckDiskInterval);
			if(cfg.EventHandler.CheckDiskInterval > 0){
				$("#CheckDiskIntervalSwitch").prop("checked",true);
				$("#CheckDiskIntervalInputTxt").css("display", "");
				$("#CheckDiskIntervalSec").css("display", "");
			}else{
				$("#CheckDiskIntervalSwitch").prop("checked",false);
				$("#CheckDiskIntervalInputTxt").css("display", "none");
				$("#CheckDiskIntervalSec").css("display", "none");
			}
			
		}else if(sel == 1){
			cfg = errSpace[errSpace.Name];
			$("#CheckDiskInterval_Box").css("display", "");
			$("#CheckDiskIntervalInputTxt").val(cfg.EventHandler.CheckDiskInterval);
			if(cfg.EventHandler.CheckDiskInterval > 0){
				$("#CheckDiskIntervalSwitch").prop("checked",true);
				$("#CheckDiskIntervalInputTxt").css("display", "");
				$("#CheckDiskIntervalSec").css("display", "");
			}else{
				$("#CheckDiskIntervalSwitch").prop("checked",false);
				$("#CheckDiskIntervalInputTxt").css("display", "none");
				$("#CheckDiskIntervalSec").css("display", "none");
			}
			if(GetFunAbility(gDevice.Ability.OtherFunction.SupportStorageFailReboot)){
				$("#Reboot_box").css("display", "");
				$("#AutoReboot").prop("checked", cfg.RebootEnable?1:0);
			}
		}else if(sel == 2){
			cfg = lowSpace[lowSpace.Name];
			$("#Limit_box").css("display", "");
			$("#LimitPercent").val(cfg.LowerLimit);
		}else if(sel == 3){
			cfg = netAbort[netAbort.Name];
		}else if(sel == 4){
			cfg = ipConflict[ipConflict.Name];
		}
		
		if(sel >= 0 && sel < 3){
			if (GetFunAbility(gDevice.Ability.NetServerFunction.NetPMS)){
				$("#yc_push_switch_box").css("display", "")
			}
			if(GetFunAbility(gDevice.Ability.OtherFunction.SupportAbnormitySendMail)){
				$("#sendEmail_box").css("display", "");
			}
		}else{
			$("#yc_push_switch_box").css("display", "none");
			$("#sendEmail_box").css("display", "none");
		}

		$("#ABEnable").attr("data",cfg.Enable?1:0);
		$("#ABShowMessage").prop("checked",cfg.EventHandler.TipEnable?1:0);
		if(sel != 3 && sel != 4){
			$("#ABPushSwitch").prop("checked",cfg.EventHandler.MessageEnable?1:0);
			$("#ABSendEmail").prop("checked",cfg.EventHandler.MailEnable?1:0);
		}
		SetAlarmToneType(cfg.EventHandler,"#EX_AbAlarmToneType","#EX_AbAlarmTone");
		ChangeVoiceType("#EX_AbAlarmToneType","#EX_alarmAndCustom");
		DivBox_Net("#ABEnable", "#ABDivBoxEnable");
        InitButton2();
    }
	function GetCurEventCfg(){
		if(bGet[sel]){
			ShowData();
			$("#alarmEventConnent").css("visibility","visible");
			return;
		}
		RfParamCall(function(a){
			if(a.Ret == 100){
				if(a.Name == fname[0]){
					noDisk = a;
				}else if(a.Name == fname[1]){
					errSpace = a;
				}else if(a.Name == fname[2]){
					lowSpace = a;
				}else if(a.Name == fname[3]){
					netAbort = a;		
				}else if(a.Name == fname[4]){
					ipConflict = a;
				}
	
				bGet[sel] = true;
				$("#alarmEventConnent").css("visibility","visible");				
				if(sel == 0 && !bGet[1]){
					RfParamCall(function(a){
						if(a.Ret == 100){
							bGet[1] = true;
							errSpace = a;
						}else{
							errSpace = null;
						}
						ShowData();
						MasklayerHide();
					}, pageTitle, fname[1], -1, WSMsgID.WsMsgID_CONFIG_GET, null, false, true);
				}else if(sel == 1 && !bGet[0]){
					RfParamCall(function(a){
						if(a.Ret == 100){
							bGet[0] = true;
							noDisk = a;
						}else{
							noDisk = null;
						}
						ShowData();
						MasklayerHide();
					}, pageTitle, fname[0], -1, WSMsgID.WsMsgID_CONFIG_GET, null, false, true);
				}else{
					ShowData();
					MasklayerHide();
				}
			}else{
				if(sel == 0){
					noDisk = null;
				}else if(sel == 1){
					errSpace = null;
				}else if(sel == 2){
					lowSpace = null;
				}else if(sel == 3){
					netAbort = null;
				}else if(sel == 4){					
					ipConflict = null;
				}
				MasklayerHide();
				if(a.Ret == 107){
					$("#alarmEventConnent").css("visibility","hidden");
					ShowPaop(pageTitle, lg.get("IDS_NO_POWER"));
				}else{
					$("#alarmEventConnent").css("visibility","hidden");
					ShowPaop(pageTitle, lg.get("IDS_REFRESH_FAILED"));
				}
			} 
		}, pageTitle, fname[sel], -1, WSMsgID.WsMsgID_CONFIG_GET, null, false, true);
	}
	function FillAlarmType(){
		GetLocalVoiceTipType("Storage.StorageNotExist", function(){
			GetAlarmToneType("Storage.StorageNotExist","#EX_Alarm_tone","#EX_AbAlarmToneType","#EX_AbAlarmTone");
			GetCurEventCfg();
		});
	}
	function SaveCurEventCfg(nIndex){
		if(bGet[nIndex]){
			var cfg = null;
			if(nIndex == 0){
				cfg = noDisk;
			}else if(nIndex == 1){
				cfg = errSpace;
			}else if(nIndex == 2){
				cfg = lowSpace;				
			}else if(nIndex == 3){			
				cfg = netAbort;
			}else if(nIndex == 4){
				cfg = ipConflict;
			}
			RfParamCall(function(a){
				if (bflag && nIndex == 0){
					bflag = false;
					RfParamCall(function(a){
						ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
					}, pageTitle, fname[1], -1, WSMsgID.WsMsgID_CONFIG_SET, errSpace)
				} else if (bflag && nIndex == 1) {
					bflag = false;
					RfParamCall(function(a){
						ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
					}, pageTitle, fname[0], -1, WSMsgID.WsMsgID_CONFIG_SET, noDisk)
				} else {
					ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
				}
			}, pageTitle, fname[nIndex], -1, WSMsgID.WsMsgID_CONFIG_SET, cfg)
		}
	}
	function CHOSDSaveSel(){
		var cfg;
		try{
			if(sel == 0) {
				cfg = noDisk[noDisk.Name];
				if (noDisk[noDisk.Name].EventHandler.CheckDiskInterval != $("#CheckDiskIntervalInputTxt").val() * 1) {
					errSpace[errSpace.Name].EventHandler.CheckDiskInterval = $("#CheckDiskIntervalInputTxt").val() * 1;
					bflag = true;
				}
				cfg.EventHandler.CheckDiskInterval = $("#CheckDiskIntervalInputTxt").val() * 1;
			}else if(sel == 1){
				cfg = errSpace[errSpace.Name];
				if (errSpace[errSpace.Name].EventHandler.CheckDiskInterval != $("#CheckDiskIntervalInputTxt").val() * 1) {
					noDisk[noDisk.Name].EventHandler.CheckDiskInterval = $("#CheckDiskIntervalInputTxt").val() * 1;
					bflag = true;
				}
				cfg.EventHandler.CheckDiskInterval = $("#CheckDiskIntervalInputTxt").val() * 1;
				if(GetFunAbility(gDevice.Ability.OtherFunction.SupportStorageFailReboot)){
					cfg.RebootEnable = $("#AutoReboot").prop("checked");
				}
			}else if(sel == 2){
				cfg = lowSpace[lowSpace.Name];
				cfg.LowerLimit = $("#LimitPercent").val() * 1;
			}else if(sel == 3){
				cfg = netAbort[netAbort.Name];
			}else if(sel == 4){
				cfg = ipConflict[ipConflict.Name];
			}

			cfg.Enable = $("#ABEnable").attr("data")*1?true:false;
			cfg.EventHandler.TipEnable = $("#ABShowMessage").prop("checked");
			if(sel != 3 && sel != 4){
				cfg.EventHandler.MessageEnable = $("#ABPushSwitch").prop("checked");
				cfg.EventHandler.MailEnable = $("#ABSendEmail").prop("checked");
			}
			SaveAlarmToneType(cfg.EventHandler,"#EX_AbAlarmToneType","#EX_AbAlarmTone");
		}catch(e){

		}
	}
	$(function () {
		ChangeBtnState2();
		sel = 0;
		$("#AbnormalType").empty();
		var temp = -1;
		for(var i =0;i<arr.length;i++){
			if(bSupportEvent[i]){
				$("#AbnormalType").append('<option value="'+i+'">'+ lg.get(arr[i]) +'</option>');
				if(temp == -1) temp = i;
			}
			bGet[i] = ![];
		}
		sel = temp < 0?0:temp;
		$("#AbnormalType").val(sel);
		$("#AbnormalType").change(function(){
			CHOSDSaveSel();
			sel = $("#AbnormalType").val()*1;	
			GetCurEventCfg();
		});
		$("#ABEnable").click(function() {
			DivBox_Net("#ABEnable", "#ABDivBoxEnable");
		});
		$("#ABRf").click(function(){
			bGet[sel] = ![];
			FillAlarmType();
		});
		$("#ABSave").click(function(){
			CHOSDSaveSel();
			SaveCurEventCfg(sel);
		});
		$("#EX_AbAlarmToneType").change(function(){
			ChangeVoiceType("#EX_AbAlarmToneType","#EX_alarmAndCustom");
		})
		$("#EX_AbAlarmToneCustomButton").click(function(){
			var cmd={
				"FilePurpose":7
			};
			ShowVoiceCustomDlg(-1,cmd,pageTitle);
		})
		$("CheckDiskIntervalInputTxt").change(function(){
				var Tm = (this).val()*1;
				if(Tm >= 0 || Tm <= 60000){
					
				}else{
					(this).val(0);
				}
		});
		FillAlarmType();
	});
});