$(function() {
	var CodeCfg = {};
	var AppLinkCfg = {};
	var pageTitle = $("#Info_QR").text();
	$(function() {
		function ShowData(){
			var cfg = AppLinkCfg[AppLinkCfg.Name];
			bShow1 = cfg.SNEnable;
			bShow2 = cfg.AndroidEnable;
			bShow3 = cfg.IOSEnable;
			bShow4 = cfg.OtherEnable;
			if(cfg.IOSLink == ""){
				bShow3=false;
			}
			if(cfg.AndroidLink == ""){
				bShow2=false;
			}
			cfg = CodeCfg[CodeCfg.Name];
			var count = 0;
			$(".QR").empty();
			if(bShow1 && typeof cfg.SN != "undefined"){
				$("#QR_SN").qrcode({
					render: "canvas",
					width: 170,
					height: 170,
					text: cfg.SN.Text
				});
				$('#SNDiv').css('display', '');
				SNText.innerHTML = lg.get('IDS_VER_SerialID');
				$('#QR_SN').attr('title', lg.get('IDS_VER_SerialID'));
			}
			if(bShow2 && typeof cfg.appAndroid != "undefined"){
				$("#QR_Android").qrcode({
					render: "canvas",
					width: 170,
					height: 170,
					text: cfg.appAndroid.Text
				});
				$('#AndroidDiv').css('display', '');
				$('#QR_Android').attr('title', 'Android');
			}
			if(bShow3 && typeof cfg.appIOS != "undefined"){
				AndroidText.innerHTML = 'Android';
				$('#QR_Android').attr('title', 'Android');
				$("#QR_IOS").qrcode({
					render: "canvas",
					width: 170,
					height: 170,
					text: cfg.appIOS.Text
				});
				$('#IOSDiv').css('display', '');
				$('#QR_IOS').attr('title', 'IOS');
			}else{
				AndroidText.innerHTML = 'APP';
				$('#QR_Android').attr('title', 'APP');
			}
			if(bShow4 && typeof cfg.otherInfo != "undefined"){
				$("#QR_Other").qrcode({
					render: "canvas",
					width: 170,
					height: 170,
					text: cfg.otherInfo.Text
				});
				$('#OtherDiv').css('display', '');
				var name = AppLinkCfg[AppLinkCfg.Name].OtherName;
				OtherText.innerHTML = name;
				$('#QR_Other').attr('title', name);
			}
			MasklayerHide();	
		}
		RfParamCall(function(a, b){
			AppLinkCfg = a;
			RfParamCall(function(a, b){
				CodeCfg = a;
				ShowData();
			}, pageTitle, "DimenCode", -1, WSMsgID.WsMsgID_ABILITY_GET);
		}, pageTitle, "AppDowloadLink", -1, WSMsgID.WsMsgID_CONFIG_GET);
	});
});