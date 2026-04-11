//# sourceURL=Advance_Upgrade.js
$(function () {
    var pageTitle = $("#Advance_Upgrade").text();
	var AutoUpgradeCfg = {};
	var bCloudUpgradeConfig = GetFunAbility(gDevice.Ability.OtherFunction.SupportCfgCloudupgrade);
	function showData() {
		if (bCloudUpgradeConfig) {
			var cfg = AutoUpgradeCfg[AutoUpgradeCfg.Name];
			if (cfg.Enable) {
				$("#table_online_upgrade").css("display", "");
			}else {
				$("#table_online_upgrade").css("display", "none");
			}
			$("#AutoUpgrade").prop("checked", cfg.AutoUpgradeImp);
			$("#RemindNewUpgrade").prop("checked", !cfg.IgnoreAllVersion);
		}
	}
	function LoadConfig() {
		if (bCloudUpgradeConfig) {
			RfParamCall(function(b){
				AutoUpgradeCfg = b;
				showData();
				$("#table_online_upgrade").css("display", "");
				MasklayerHide();
			}, pageTitle, "NetWork.OnlineUpgrade", -1, WSMsgID.WsMsgID_CONFIG_GET);
		}else {
			MasklayerHide();
		}
	}
	function SaveConfig() {
		if (bCloudUpgradeConfig) {
			var cfg = AutoUpgradeCfg[AutoUpgradeCfg.Name];
			cfg.AutoUpgradeImp = $("#AutoUpgrade").prop("checked")?1:0;
			cfg.IgnoreAllVersion = $("#RemindNewUpgrade").prop("checked")?0:1;
			RfParamCall(function(c){
				ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
			}, pageTitle, AutoUpgradeCfg.Name, -1, WSMsgID.WsMsgID_CONFIG_SET, AutoUpgradeCfg);
		}
	}

    function updateUpgradeProgress(retryCount = 0,maxRetries = 120){
        if(retryCount >= maxRetries){
            ShowPaop(pageTitle, lg.get("IDS_UPGRADE_TIMEOUT"));
            return;
        }
        gDevice.GetUpgradeProgress(function(a){
            if(a.UpgradeStatus == UpgradeStatus.UpgradeStatusDown){
                if(a.Ret >= 0 && a.Ret <= 100){
                    $("#OperationType").html(lg.get("IDS_UP_DonwLoadProgress"));
                    $("#aa").css("width", a.Ret + "%");
                    $("#updateMsg").html(a.Ret + "%");
                    setTimeout(() => {
                        updateUpgradeProgress(retryCount + 1, maxRetries);
                    }, 2000);
                }
            }else if(a.UpgradeStatus == UpgradeStatus.UpgradeStatusUpgrade){
                if(a.Ret >= 0 && a.Ret <= 100){
                    $("#OperationType").html(lg.get("IDS_UP_UpgradeProgress"));
                    $("#aa").css("width", a.Ret + "%");
                    $("#updateMsg").html(a.Ret + "%");
                    setTimeout(() => {
                        updateUpgradeProgress(retryCount + 1, maxRetries);
                    }, 2000);
                }
            }else if(a.UpgradeStatus == UpgradeStatus.UpgradeStatusFinish){
				MasklayerHide();
				$("#UPDATESTATE").css("display", "none");
				$("#UpgradeRezult").css("display", "");
				$("#UpgradeRezult").html(lg.get("IDS_UPDATE_SUCCESS"));
                gVar.bUpgrade = false;
				AutoClose(pageTitle);
			}else if(a.UpgradeStatus == UpgradeStatus.UpgradeStatusAbort){
				MasklayerHide();
				$("#UPDATESTATE").css("display", "none");
				$("#UpgradeRezult").css("display", "");
				$("#UpgradeRezult").html(lg.get("IDS_UPDATE_FAILED"));
                gVar.bUpgrade = false;
				AutoClose(pageTitle);
			}
        });
    }
    $("#OnlineQueryBtn").click(function () {
        gDevice.CheckDevVersion(function (a) {
			if (a.Ret == 100) {
                if(a.NewVersion != ""){
                    $("#OnlineUpGradeVersion").val(a.NewVersion);
                    $("#OnlineQueryBtn").hide();
                    $("#OnlineUpgradeBtn").show();
                }else{
                    $("#OnlineUpGradeVersion").val(lg.get("IDS_UPDATE_New"));
                }
			}
		});
    });
	$("#OnlineUpgradeBtn").click(function () {
		MasklayerShow();
        gVar.bUpgrade = true;
		gDevice.StartOnlineUpgrade(function (a) {
			if (a.Ret == 100) {
				$("#UPDATESTATE").css("display", "block");
				$("#aa").css("display", "block");
				$("#OperationType").html(lg.get("IDS_UP_DonwLoadProgress"));
				$("#OperationType").css("display", "block");
				$("#aa").css("width", 0 + "%");
				$("#updateMsg").html(0 + "%");
				if(!WebCms.plugin.isLoaded){
					updateUpgradeProgress();
				}
			} else {
				MasklayerHide();
				ShowPaop(pageTitle, getCodeErrorString(a.Ret));
			}
		});
	});
	$("#BrowseBtn").click(function () {
		if (WebCms.plugin.isLoaded) {
			MasklayerShow();
			gDevice.BrowseLocalUpgradeFile(function (a) {
				if (a.nRet == 100) {
					$("#UpGradeFileName").val(a.Path);
				}
				MasklayerHide();
			});
		} else{
			if (g_BrowseType != BrowseType.BrowseMSIE) {
				//IE下不清空输入框
				$("#UpGradeFileName").val("");
				$("#choose").val("");
			}
			$("#choose").click();
		}
	});
	$("#choose").change(function (event) {
		var path = $(this).val();
		$("#UpGradeFileName").val(path);
	});
	$("#UpgradeRf").click(function() {
		LoadConfig();
	});
	$("#UpgradeSave").click(function() {
		SaveConfig();
	});
	$("#UpgradeBtn").click(function () {
		if (WebCms.plugin.isLoaded) {
			if ($("#UpGradeFileName").val() == "") {
				ShowPaop(pageTitle, lg.get("IDS_UP_ChooseFile"));
				return;
			}
			gVar.bUpgrade = true;
			let filename = $("#UpGradeFileName").val();
			MasklayerShow();
			gDevice.StartLocalUpgrade(filename, function (a) {
				if (a.Ret == 100) {
					$("#UPDATESTATE").css("display", "block");
					$("#aa").css("display", "block");
					$("#OperationType").css("display", "block");
					$("#OperationType").html(lg.get("IDS_UP_DonwLoadProgress"));
					$("#aa").css("width", 0 + "%");
					$("#updateMsg").html(0 + "%");
				} else {
					MasklayerHide();
					ShowPaop(pageTitle, getCodeErrorString(a.Ret));
				}
			});
		} else {
			if ($("#UpGradeFileName").val() == "") {
				ShowPaop(pageTitle, lg.get("IDS_UP_ChooseFile"));
				return;
			}
			if (!$('#choose').val()) {
				ShowPaop(pageTitle, lg.get("IDS_UP_ChooseFile"));
				return false;
			}
			let file = $("#choose")[0].files[0];
			if (file) {
				if (file.name.indexOf(".bin") == -1 && file.name.indexOf(".zip") == -1) {
					ShowPaop(pageTitle, lg.get("IDS_UP_InvalidFile"))
					return;
				}
				MasklayerShow();
				let size = file.size;
				gVar.bUpgrade = true;
				gDevice.StartLocalUpgrade(file, function (result) {
					if (result.Ret == 100) {
                        $("#UPDATESTATE").css("display", "block");
                        $("#aa").css("display", "block");
                        $("#OperationType").html(lg.get("IDS_UP_UpgradeProgress"));
                        $("#OperationType").css("display", "block");
                        $("#aa").css("width", 0 + "%");
                        $("#updateMsg").html(0 + "%");
						var url = window.location.protocol + "//" + gDevice.ip + ":" + gDevice.httpPort + "/cgi-bin/upgrade.cgi?Name=UpgradeData&" + "Salt=" + gNet.Salt + "&DataLength=" + size;
						var ajax_option = {
							success: function (data) {
								updateUpgradeProgress();
							},
							url: encodeURI(url),
							error: function (data) {
								ShowPaop(pageTitle, lg.get("IDS_UPDATE_FAILED"));
								gVar.bUpgrade = false;
								AutoClose(pageTitle);
							}
						};
						$('#upfile_form').ajaxSubmit(ajax_option);
					} else {
						MasklayerHide();
						gVar.bUpgrade = false;
						ShowPaop(pageTitle, getCodeErrorString(result.Ret));
					}
				});
			}
		}
	});
	if(WebCms.plugin.isLoaded){
		function OnlineUpgradeCallBack(a) {
			var Status = a.Data.Status;
			var TotalSize = a.Data.TotalSize;
			var SendSize = a.Data.SendSize;
			if (Status == 2) {
				$("#UPDATESTATE").css("display", "block");
				$("#aa").css("display", "block");
				$("#OperationType").css("display", "block");
				$("#OperationType").html(lg.get("IDS_UP_DonwLoadProgress"));
				if (SendSize == -1) {
					MasklayerHide();
					$("#UPDATESTATE").css("display", "none");
					$("#UpgradeRezult").css("display", "");
					$("#UpgradeRezult").html(lg.get("IDS_UPDATE_ABORT"));
					AutoClose(pageTitle);
				} else if (SendSize == -2) {
					MasklayerHide();
					$("#UPDATESTATE").css("display", "none");
					$("#UpgradeRezult").css("display", "");
					$("#UpgradeRezult").html(lg.get("IDS_UPDATE_FAILED"));
					AutoClose(pageTitle);
				} else if (TotalSize == -1) {
					$("#OperationType").html(lg.get("IDS_UP_UpgradeProgress"));
					$("#aa").css("width", SendSize + "%");
					$("#updateMsg").html(SendSize + "%");
				} else if (TotalSize == -3 || TotalSize == -2) {
					$("#OperationType").html(lg.get("IDS_UP_DonwLoadProgress"));
					$("#aa").css("width", SendSize + "%");
					$("#updateMsg").html(SendSize + "%");
				} else if (TotalSize > 0) {
					var n = (SendSize / TotalSize);
					var num = Math.floor(n * 100);
					$("#OperationType").html(lg.get("IDS_UP_DonwLoadProgress"));
					$("#aa").css("width", num + "%");
					$("#updateMsg").html(num + "%");
				}
			} else if (Status == 1) {
				MasklayerHide();
				$("#UPDATESTATE").css("display", "none");
				$("#UpgradeRezult").css("display", "");
				$("#UpgradeRezult").html(lg.get("IDS_UPDATE_SUCCESS"));
				AutoClose(pageTitle);
			} else if (Status == 3) {
				MasklayerHide();
				$("#UPDATESTATE").css("display", "none");
				$("#UpgradeRezult").css("display", "");
				$("#UpgradeRezult").html(lg.get("IDS_UPDATE_FAILED"));
				AutoClose(pageTitle);
			}
		}

		UpgradeEventCallBack = OnlineUpgradeCallBack;
	}
	if (GetFunAbility(gDevice.Ability.OtherFunction.SupportCloudUpgrade)) {
		$("#boxOnlineUpgrade").show();
        $("#OnlineUpGradeVersion").val("");
		gDevice.CheckDevVersion(function (a) {
			if (a.Ret == 100) {
                if(a.NewVersion != ""){
                    $("#OnlineUpGradeVersion").val(a.NewVersion);
                    $("#OnlineUpgradeBtn").show();
                }else{
                    $("#OnlineQueryBtn").show();
                    $("#OnlineUpGradeVersion").val(lg.get("IDS_UPDATE_New"));
                }
			}
			LoadConfig();
		});
	} else {
		LoadConfig();
	}

});
