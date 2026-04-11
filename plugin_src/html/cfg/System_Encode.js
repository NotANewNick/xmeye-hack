//# sourceURL=System_Encode.js
$(document).ready(function () {
	var chnIndex = -1;
	var videoFormat;
	var nCapture;
	var encodeAbility;
	var digEncodeAbility = new Array;
	var m_abilityEncode;
	var analogEncode;
	var copyData;
	var bCopy;
	var m_allData;
	var digEncode = new Array;
	var OlddigEncode = new Array;
	var bGetDig = new Array;
	var locationCfg;
	var resolution = {};
	var ssRemoteDevice;
	var bMultiStream=GetFunAbility(gDevice.Ability.EncodeFunction.DoubleStream);
	var nFPS;
	var nTotalChannel = gDevice.loginRsp.ChannelNum;
	var nAnaChannel = gDevice.loginRsp.VideoInChannel;
	var nDigChannel = gDevice.loginRsp.DigChannel;
	var bNewConfig = (gDevice.loginRsp.SoftWareVersion > "V2.62.R07" || gDevice.loginRsp.BuildTime > "2024-04-01") ? true : false;
	var bH265Bitrate = [false, false, false, false];
	var bStatus = false;
	var bSmartEncode = GetFunAbility(gDevice.Ability.EncodeFunction.SmartH264);
	var bSmartEncodeV2 = GetFunAbility(gDevice.Ability.EncodeFunction.SmartH264V2);
	var SmartH264Ability;
	var chAbilitySmart = new Array(64);
	var chAbilitySmartV2 = new Array(64);
	var hzzsEncodeMode = null;
	var m_SmartH264ParamALL;
	var m_SmartH264ParamALL_V2;
	var bAudioFormat = GetFunAbility(gDevice.Ability.OtherFunction.SupportAudioFormat);
	var bEncodeImgSize = GetFunAbility(gDevice.Ability.EncodeFunction.EncodeImgSize);
	var bFisheyeBitrate = GetFunAbility(gDevice.Ability.OtherFunction.SupportFishEye);
	var bLowBitrate = GetFunAbility(gDevice.Ability.EncodeFunction.LowBitRate);
	var bMaxSupportEncFPS = GetFunAbility(gDevice.Ability.EncodeFunction.MaxSupportEncFPS);
	var bNoSyns = GetFunAbility(gDevice.Ability.EncodeFunction.NoSyncCompression);//是否支持主副码流
	var maxEncFPS = null;
	var nAudioInNum = gDevice.loginRsp.AudioInChannel;
	var bIPC = gDevice.devType == devTypeEnum.DEV_IPC ? true : false;
	var bStaticParam = false;
	var bMaxFps = false;
	var allMaxFps;
	var EncStaticParamAblity;
	var encStaticParamV2;
	var audioSupportType;
	var bSave = false;
	var sCompression = ["DIVX MPEG4", "MS MPEG4", "MPEG2", "MPEG1", "H.263", "MJPG", "FCC MPEG4", "H.264", "H.265", " "];
	var bReboot = false;
	var bRefresh = false;
	var bMultiChannel = GetFunAbility(gDevice.Ability.EncodeFunction.MultiChannel)
	var MultiChannel;
	var MultiEncode;
	var pageTitle = $("#System_Encode").text();
	var audioInFormats = ["",  "G729_8KBIT", "G726_16KBIT", "G726_24KBIT", "G726_32KBIT", "G726_40KBIT", 
		"PCM_8TO16BIT", "PCM_ALAW", "PCM_ULAW", "ADPCM8K16BIT", "ADPCM16K16BIT", "G711_ALAW",
		"MPEG2_LAYER1", "AMR8K16BIT", "G711_ULAW", "IMA_ADPCM_8K16BIT", "AAC_8K16b", "AAC_44100Hz"];
	var STREAM_CODE_VALUE = [ [ 512, 768, 1024, 1536, 2048, 2560 ], 	  // /< D1
		[ 384, 512, 768, 1024, 1536, 2048 ], 	  // /< HD1
		[ 384, 512, 768, 1024, 1536, 2048 ], 	  // /< BCIF
		[ 64, 192, 384, 512, 768, 1024 ], 		  // /< CIF
		[ 64, 128, 192, 384, 448, 512 ], 		  // /< QCIF
		[ 512, 768, 896, 1280, 1536, 2048 ], 	  // /< VGA
		[ 256, 384, 512, 640, 768, 1024 ], 		  // /< QVGA
		[ 512, 768, 896, 1280, 1536, 2048 ], 	  // /< SVCD
		[ 64, 128, 192, 384, 448, 512 ], 		  // /< QQVGA
		[ 64, 128, 256, 448, 512, 768 ], 		  // /< ND1
		[ 896, 1024, 1536, 2048, 3072, 4096 ],    // /< 650TVL
		[ 1024, 1536, 2048, 2560, 3072, 4096 ],   // /< 720P
		[ 1024, 1536, 2048, 3072, 4096, 5120 ],   // /< 1_3M
		[ 1024, 2048, 3072, 4096, 6144, 8192 ],   // /< UXGA
		[ 1024, 2048, 3072, 4096, 6144, 8192 ],   // /< 1080P
		[ 1177, 2355, 3532, 4710, 7065, 10240 ],  // /< WUXGA
		[ 1280, 2560, 3840, 5120, 7680, 10240 ],  // /< 2_5M
		[ 1536, 3072, 4096, 6144, 8192, 10240 ],  // /< 3M
		[ 2048, 3072, 4096, 6144, 8192, 10240 ],  // /< 5M
		[ 1024, 1536, 2048, 2560, 3072, 4096 ],   // /< 1080N
		[ 1536, 3072, 4096, 6144, 8192, 10240 ],  // /< 4M
		[ 1536, 3072, 4096, 6144, 8192, 10240 ],  // /< 6M
		[ 1536, 3072, 4096, 6144, 8192, 10240 ],  // /< 8M
		[ 3072, 6144, 9216, 12288, 16896, 19968 ],// /< 12M
		[ 2048, 4096, 6144, 8192, 11264, 13312 ], // /< 4K
		[ 512, 768, 1024, 1536, 2048, 2560 ], 	  // /< 720N
		[ 1024, 1536, 2048, 2560, 3072, 4096 ],   // /< WSVGA
		[ 512, 768, 896, 1280, 1536, 2048 ], 	  // /< NHD
		[ 1024, 1536, 2048, 3072, 4096, 5120 ],   // /< 3M_N
		[ 1024, 2048, 3072, 4096, 6144, 8192 ],   // /< 4M_N
		[ 1280, 2560, 3840, 5120, 7680, 10240 ],  // /< 5M_N
		[ 1536, 3072, 4096, 6144, 8192, 10240 ],  // /< 4K_N
	];
	
	var H265_STREAM_CODE_VALUE = [ [ 332, 499, 665, 998, 1331, 1664 ],     // /< D1
		[ 249, 332, 499, 665, 998, 1331 ], 		// /< HD1
		[ 249, 332, 499, 665, 998, 1331 ], 		// /< BCIF
		[ 41, 124, 249, 332, 499, 665 ], 		// /< CIF
		[ 41, 83, 124, 249, 291, 332 ], 		// /< QCIF
		[ 332, 499, 582, 832, 998, 1331 ], 		// /< VGA
		[ 166, 249, 332, 416, 499, 665 ], 		// /< QVGA
		[ 332, 499, 582, 832, 998, 1331 ], 		// /< SVCD
		[ 41, 83, 124, 249, 291, 332 ], 		// /< QQVGA
		[ 41, 83, 166, 291, 332, 499 ], 		// /< ND1
		[ 582, 665, 998, 1331, 1996, 2662 ],    // /< 650TVL
		[ 665, 998, 1331, 1664, 1996, 2662 ],   // /< 720P
		[ 665, 998, 1331, 1996, 2662, 3328 ],   // /< 1_3M
		[ 665, 1331, 1996, 2662, 3993, 5324 ],  // /< UXGA
		[ 665, 1331, 1996, 2662, 3993, 5324 ],  // /< 1080P
		[ 765, 1530, 2295, 3061, 4592, 6656 ],  // /< WUXGA
		[ 832, 1664, 2496, 3328, 4992, 6656 ],  // /< 2_5M
		[ 998, 1996, 2662, 3993, 5324, 6656 ],  // /< 3M
		[ 1331, 1996, 2662, 3993, 5324, 6656 ], // /< 5M
		[ 665, 998, 1331, 1664, 1996, 2662 ],   // /< 1080N
		[ 998, 1996, 2662, 3993, 5324, 6656 ],  // /< 4M
		[ 998, 1996, 2662, 3993, 5324, 6656 ],  // /< 6M
		[ 998, 1996, 2662, 3993, 5324, 6656 ],  // /< 8M
		[1996, 3993, 5989, 7986, 10982, 12978], // /< 12M
		[ 1331, 2662, 3993, 5324, 7321, 8652 ], // /< 4K
		[ 332, 499, 665, 998, 1331, 1664 ], 	// /< 720N
		[665, 998, 1331, 1664, 1996],			// /< WSVGA(1024*576)
		[332, 499, 582, 832, 998, 1331],		// /< NHD
		[665, 998, 1331, 1996, 2662, 3328],		// /< 3M_N
		[665, 1331, 1996, 2662, 3993, 5324],	// /< 4M_N
		[832, 1664, 2496, 3328, 4992, 6656],	// /< 5M_N   
		[998, 1996, 2662, 3993, 5324, 6656],	/// < 4K_N
	];
	
	var res_type = [ "D1", "HD1", "BCIF", "CIF", "QCIF", "VGA", "QVGA", "SVCD",
			"QQVGA", "ND1", "650TVL", "720P", "1_3M", "UXGA", "1080P", "WUXGA",
			"2_5M", "3M", "5M", "1080N", "4M", "6M", "8M", "12M", 
			"4K", "720N","WSVGA", "NHD", "3M_N", "4M_N", "5M_N", "4K_N" ];
	var res_pw = [704, 704, 352, 352, 176, 640, 320, 480,
						160, 240, 928, 1280, 1280, 1600, 1920, 1920,
						1872, 2048, 2560, 944, 2560, 3072, 3264, 4000,
						3840, 640, 1024, 640, 1024, 1280, 1280, 1920];
	var res_ph = [576, 288, 576, 288, 144, 480, 240, 480,
						128, 192, 576, 720, 960, 1200, 1080, 1200,
						1408, 1536, 1920, 1080, 1440, 2048, 2448, 3000,
						2160, 720, 576, 360, 1536, 1440, 1920, 2160]
	var res_nw = [704, 704, 352, 352, 176, 640, 320, 480,
						160, 240, 928, 1280, 1280, 1600, 1920, 1920,
						1872, 2048, 2560, 944, 2560, 3072, 3264, 4000,
						3840, 640, 1024, 640, 1024, 1280, 1280, 1920];
	var res_nh = [480, 240, 480, 240, 120, 480, 240, 480,
						128, 192, 480, 720, 960, 1200, 1080, 1200,
						1408, 1536, 1920, 1080, 1440, 2048, 2448, 3000,
						2160, 720, 576, 360, 1536, 1440, 1920, 2160];
	var res_text = [ "D1", "HD1", "BCIF", "CIF", "QCIF", "VGA", "QVGA", "SVCD",
			"QQVGA", "ND1", "960H", "720P", "960P", "UXGA", "1080P", "WUXGA",
			"2.5M", "3M", "5M", "1080N", "4M", "6M", "8M", "12M", 
			"4K", "720N","WSVGA", "NHD", "3M-N", "4M-N", "5M-N", "4K-N" ];
	var Compression = ["DIVX MPEG4", "MS MPEG4", "MPEG2", "MPEG1", "H.263", "MJPG", "FCC MPEG4", "H.264", "H.265", " "]
	var STREAM = {
		MAIN: 0,
		EXPAND: 1,
		COMBINE: 2,
		MULTI: 3,
		NUM: 4,
	};
	
	var ControlType = {
		RESOLUTION : 0,
		FRAME : 1,
		BITCONTROL : 2,
		QUALITY : 3,
		BITRATE : 4,
		GOP : 5,
		VIDEO : 6,
		AUDIO : 7,
		NUM : 8,
	};

	var ControlTag = [
		[ "#MainResol", "#MainFPS", "#MainBitCtrl", "#Mainquality", "#MainBitRate", "#MainGop", "#MainVideo", "#MainAudio" ],
		[ "#ExtResol", "#ExtFPS", "#ExtBitCtrl", "#Extquality", "#ExtBitRate", "#ExtGop", "#ExtVideo", "#ExtAudio" ],
		[ "#ExtResol", "#ExtFPS", "#ExtBitCtrl", "#Extquality", "#BitRate2","#ExtGop", "#ExtVideo", "#ExtAudio" ],
		[ "#RemoteResol", "#RemoteFPS", "#ExtBitCtrl", "#Remotequality", "#RemoteBitRate", "#ExtGop", "#ExtVideo", "#ExtAudio"]];

	if (bIPC) {
	    $("#chn_div, #EncodeCP, #EncodePaste").css("display", "none");
	}
	if(nAnaChannel == 0) {
		$("#EncodeCP, #EncodePaste").css("display", "none");
	}
	if(gDevice.bGetDefault && nAnaChannel != 0){
		$("#EncodeDefault").css("display", "");
	}
	function IsRebootDev(){
		if(bReboot){
			RebootDev(pageTitle, lg.get("IDS_CONFIRM_RESTART"), true);
		}else{
			ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
		}
	}
	function InitResData(){
		var len = res_type.length;
		var w = videoFormat == "PAL" ? res_pw:res_nw;
		var h = videoFormat == "PAL" ? res_ph:res_nh;
		for(var i = 0; i < len;i++){
			var temp = {};
			temp.dwSize=w[i]*h[i];
			temp.szText = res_text[i];
			temp.nIndex = i;
			resolution[i] = temp;
		}
		resolution[0].dsMask = 1 << 0 | 1 << 1 | 1 << 3 | 1 << 4 | 1 << 6;
		resolution[1].dsMask = 1 << 1 | 1 << 3 | 1 << 4;
		resolution[2].dsMask = 1 << 2 | 1 << 3 | 1 << 4;
		resolution[3].dsMask = 1 << 3 | 1 << 4;
		resolution[4].dsMask = 1 << 4;
		resolution[5].dsMask = 1 << 5 | 1 << 6;
		resolution[6].dsMask = 1 << 6;
		resolution[7].dsMask = 1 << 7;
		resolution[8].dsMask = 1 << 8;
		resolution[9].dsMask = 1 << 9;
		resolution[10].dsMask = 1 << 0 | 1 << 1 | 1 << 3 | 1 << 4 | 1 << 6;
		resolution[11].dsMask  = 1 << 0 | 1 << 1 | 1 << 3 | 1 << 4 | 1 << 6;
		resolution[12].dsMask  = 1 << 0 | 1 << 1 | 1 << 3 | 1 << 4 | 1 << 6;
		resolution[13].dsMask  = 1 << 0 | 1 << 1 | 1 << 3 | 1 << 4 | 1 << 6;
		resolution[14].dsMask  = 1 << 26 | 1 << 0 | 1 << 1 | 1 << 3 | 1 << 4 | 1 << 11 | 1 << 6;
		resolution[15].dsMask  = 1 << 0 | 1 << 1 | 1 << 3 | 1 << 4 | 1 << 11 | 1 << 6;
		resolution[16].dsMask  = 1 << 0 | 1 << 1 | 1 << 3 | 1 << 4 | 1 << 11 | 1 << 6;
		resolution[17].dsMask  = 1 << 26 | 1 << 0 | 1 << 1 | 1 << 3 | 1 << 4 | 1 << 11 | 1 << 6;
		resolution[18].dsMask  = 1 << 0 | 1 << 1 | 1 << 3 | 1 << 4 | 1 << 11 | 1 << 6;
		resolution[19].dsMask  = 1 << 10 | 1 << 0 | 1 << 3 | 1 << 4 | 1 << 6;
		resolution[20].dsMask  = 1 << 26 | 1 << 0 | 1 << 1 | 1 << 3 | 1 << 4 | 1 << 11 | 1 << 3 | 1 << 6;
		resolution[21].dsMask = 1 << 0 | 1 << 11 | 1 << 14 | 1 << 6;
		resolution[22].dsMask = 1 << 0 | 1 << 11 | 1 << 14 | 1 << 6;
		resolution[23].dsMask = 1 << 0 | 1 << 11 | 1 << 14 | 1 << 6;
		resolution[24].dsMask = 1 << 0 | 1 << 11 | 1 << 14|1 << 3 | 1 << 6;
		resolution[25].dsMask  = 1 << 3 | 1 << 4;
		resolution[28].dsMask = 1 << 0 | 1 << 3 | 1 << 6;
		resolution[29].dsMask = 1 << 0 |1 << 3 | 1 << 6;
		resolution[30].dsMask = 1 << 0 | 1 << 3 | 1 << 6;
		resolution[31].dsMask = 1 << 0 | 1 << 3 | 1 << 6;
	}
	function UpdateCodeFormat(nStream,ctrl) {
		var uiCompression;
		if(nStream == 2){
			uiCompression = m_abilityEncode.CombEncodeInfo[0].CompressionMask ? m_abilityEncode.CombEncodeInfo[0].CompressionMask : m_abilityEncode.EncodeInfo[0].CompressionMask;
		}else if(nStream == 3){
			uiCompression = MultiChannel.Compression ? MultiChannel.Compression : m_abilityEncode.EncodeInfo[0].CompressionMask;
		}else{
			uiCompression = m_abilityEncode.EncodeInfo[nStream].CompressionMask;
		}
		var len = sCompression.length;
		$(ctrl).empty();
		for (var i = 0; i < len; i++) {
			if (uiCompression & (1 << i)) {
				var dataHtml = '<option value="' + i + '">' + sCompression[i] + '</option>';
				$(ctrl).append(dataHtml);
				if(typeof g_HZZSEncodeMode != "undefined" && g_HZZSEncodeMode * 1 && nStream == 0 )
				{
					if(sCompression[i] == "H.265X")
					{
						$(ctrl).append('<option value="100" data="' + i + '">H.264</option>');
						$(ctrl).append('<option value="101" data="' + i + '">H.264+</option>');
					}
					if(sCompression[i] == "H.265")
					{
						$(ctrl).append('<option value="102" data="' + i + '">H.265+</option>');
					}
				}
			}
		}
	}
	function ResolutionIndex(res) {
		var len = res_type.length;
		var i = 0;
		for (; i < len; i++) {
			if (res == res_type[i]) {
				break;
			}
		}
		return i;
	}
	function CompressionIndex(compress){
		var len = Compression.length;
		var i = 0;
		for (; i < len; i++) {
			if (compress == Compression[i]) {
				break;
			}
		}
		return i;
	}
	function InitSelect(){
		$("#EncodePage select").each(function() {
			if ($(this).prop("disabled") == true) {
				$(this).prop("disabled", false).css("opacity", "1");
			}
		})
	}
	function EnableExpandVideo(bEnable){
		$("#ExtResol, #ExtFPS, #ExtBitCtrl, #Extquality, #ExtBitRate, #ExtGop").prop("disabled", !bEnable)
		.css("opacity", bEnable ? "1" : "0.4");
		$("#SubAudioDiv").css("opacity", bEnable ? "1" : "0.4");
	}
	function GetFreeDspPower(nChannel, bDigStatus, nEncodeType){
		var nChannelNum = $("#CHNBMchn").val() * 1;
		if (nChannelNum == nAnaChannel && nDigChannel <= 0){
			nChannelNum = 0;
		}
		var lFreePower = m_abilityEncode.MaxEncodePower;
		var dstFormat;
		if (!bDigStatus) {
			for(var i=0; i<nAnaChannel; i++){
				if(i != nChannel){
					var cfg = analogEncode[analogEncode.Name][i];
					if(cfg.MainFormat.VideoEnable){
						var lSize = resolution[ResolutionIndex(cfg.MainFormat.Video.Resolution)].dwSize;
						lFreePower -= lSize*cfg.MainFormat.Video.FPS;
					}
					if(cfg.ExtraFormat.VideoEnable){
						var lSize = resolution[ResolutionIndex(cfg.ExtraFormat.Video.Resolution)].dwSize;
						lFreePower -= lSize*cfg.ExtraFormat.Video.FPS;
					}
				}
			}
			if(nEncodeType == STREAM.MAIN){
				dstFormat = analogEncode[analogEncode.Name][nChannel].ExtraFormat;
			}else if(nEncodeType == STREAM.EXPAND){
				dstFormat = analogEncode[analogEncode.Name][nChannel].MainFormat;
			}
			
		}else{
			var nDig = nChannelNum - nAnaChannel;
			for (var i = 0; i < nCapture; i ++ ) {
				if ( i != nChannel ){
					var digCfg = digEncode[nDig][digEncode[nDig].Name][i];
					if ( digCfg.MainFormat.VideoEnable ){
						var lSize = resolution[ ResolutionIndex(digCfg.MainFormat.Video.Resolution)].dwSize;
						lFreePower -= lSize * digCfg.MainFormat.Video.FPS;
					}
					if ( digCfg.ExtraFormat.VideoEnable ){
						var lSize = resolution[ ResolutionIndex(digCfg.ExtraFormat.Video.Resolution)].dwSize;
						lFreePower -= lSize * digCfg.ExtraFormat.Video.FPS;
					}
				}
			}
			if(nEncodeType == STREAM.MAIN){
				dstFormat = digEncode[nDig][digEncode[nDig].Name][nChannel].ExtraFormat;
			}else if(nEncodeType == STREAM.EXPAND){
				dstFormat = digEncode[nDig][digEncode[nDig].Name][nChannel].MainFormat;
			}
		}
		if (m_abilityEncode.MaxEncodePowerPerChannel[nChannel]) {
			lFreePower = (lFreePower < m_abilityEncode.MaxEncodePowerPerChannel[nChannel]) ? lFreePower : m_abilityEncode.MaxEncodePowerPerChannel[nChannel];
		}
		var dwChnUsed = 0;
		if(nEncodeType == STREAM.MAIN){
			if (bMultiStream && dstFormat.VideoEnable) {
				dwChnUsed = resolution[ResolutionIndex(dstFormat.Video.Resolution)].dwSize * dstFormat.Video.FPS;
			}
			lFreePower = lFreePower - dwChnUsed;
			if (m_abilityEncode.ChannelMaxSetSync) {
				var dwAvgPower = (m_abilityEncode.MaxEncodePower - GetExpandUsed()) / nAnaChannel;
				lFreePower = lFreePower<dwAvgPower?lFreePower:dwAvgPower;
			}
		}else if(nEncodeType == STREAM.EXPAND){
			if (dstFormat.VideoEnable){
				dwChnUsed = resolution[ResolutionIndex(dstFormat.Video.Resolution)].dwSize * dstFormat.Video.FPS;
			}
			lFreePower = lFreePower - dwChnUsed;
			if (m_abilityEncode.ChannelMaxSetSync && nAnaChannel > 0) {
				var dwAvgPower = (m_abilityEncode.MaxEncodePower - GetMainUsed()) / nAnaChannel;
				lFreePower = lFreePower<dwAvgPower?lFreePower:dwAvgPower;
			}
		}

		return lFreePower>>>0;
	}
	function GetMaxResolution(res) {
		var tempSize = 0;
		var index = -1;
		for (var i = 0; i < res_type.length; i++) {
			if ((1 << i) & res) {
				if (tempSize < resolution[i].dwSize) {
					tempSize = resolution[i].dwSize;
					index = i;
				}
			}
		}
		return index;
	}
	function GetFreeBitratePower(nChannel) {
		var lFreePower = m_abilityEncode.MaxBitrate;
		if (nAnaChannel <= 0) {
			return lFreePower;
		}
		for (var i = 0; i < nAnaChannel; i++) {
			if (i != nChannel) {
				if (analogEncode[analogEncode.Name][i].MainFormat.VideoEnable) {
					lFreePower -= analogEncode[analogEncode.Name][i].MainFormat.Video.BitRate;
				}
			}
		}
		return lFreePower;
	}
	function GetExpandUsed() {
		var lUsePower = 0;
		if (nAnaChannel <= 0) {
			return lUsePower;
		}
		if (bMultiStream) {
			for (var i = 0; i < nAnaChannel; i++) {
				var cfg = analogEncode[analogEncode.Name][i];
				if (cfg.ExtraFormat.VideoEnable) {
					var lSize = resolution[ResolutionIndex(cfg.ExtraFormat.Video.Resolution)].dwSize;
					lUsePower += lSize * cfg.ExtraFormat.Video.FPS;
				}
			}
		}
		return lUsePower;
	}
	function GetMainUsed() {
		var lUsePower = 0;
		if (nAnaChannel <= 0) {
			return lUsePower;
		}
		for (var i = 0; i < nAnaChannel; i++) {
			var cfg = analogEncode[analogEncode.Name][i];
			if (cfg.MainFormat.VideoEnable) {
				var lSize = resolution[ResolutionIndex(cfg.MainFormat.Video.Resolution)].dwSize;
				lUsePower += lSize * cfg.MainFormat.Video.FPS;
			}
		}
		return lUsePower;
	}
	function GetMaxResolAndRate(nMaxRes, nMaxFPS, dwPower){
		if(dwPower > 0){
			var nSize = resolution[nMaxRes].dwSize;
			if (nSize > dwPower) {
				nMaxRes = -1;
				nMaxFPS = -1;
			}else{
				nMaxFPS = parseInt(dwPower / nSize);
				var nMax = videoFormat == "PAL"?25:30;
				nMaxFPS = nMaxFPS < nMax ? nMaxFPS : nMax;
			}
			var lMaxSize = nSize;
			for (var i = 0; i < res_type.length; i++) {
				var lTempsize = resolution[i].dwSize;
				if (dwPower >= lTempsize && lMaxSize < lTempsize) {
					nMaxRes = i;
					lMaxSize = lTempsize;
				}
			}
			var obj = {
				"nMaxRes": nMaxRes,
				"nMaxFPS": nMaxFPS
			}
			return obj;
		}
	}
	function GetConfigEncode(){
		var nChannelNum = $('#CHNBMchn').val() * 1;
		var pConfigEncode;
		if (nChannelNum == nAnaChannel) {
			if (!bStatus) {
				pConfigEncode = m_allData;
			}else{
				var nDig = nChannelNum - nAnaChannel;
				var nIndex = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].SingleConnId - 1;
				nChannel = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].Decoder[nIndex].Channel;
				pConfigEncode = digEncode[nDig][digEncode[nDig].Name][nChannel];
			}
		}else{
			if(nChannelNum < nAnaChannel){
				pConfigEncode=analogEncode[analogEncode.Name][nChannelNum];
			}else{
				var nDig = nChannelNum - nAnaChannel;
				var nIndex = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].SingleConnId - 1;
				var nChannel = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].Decoder[nIndex].Channel;
				pConfigEncode = digEncode[nDig][digEncode[nDig].Name][nChannel];
			}
		}

		return pConfigEncode;
	}
	function InitGOP(IFrameRange) {
		$("#MainGop, #ExtGop").empty();
		var nIFIntervalCount = 0;
		var nIFIntervalMin = 0;
		for (var i = 0; i < 2; i++) {
			if (IFrameRange == null || IFrameRange == undefined) {
				nIFIntervalCount = 12;
				nIFIntervalMin = 1;
			} else {
				if (i == 0) {
					nIFIntervalCount = IFrameRange.main_max;
					nIFIntervalMin = IFrameRange.main_min;
				} else {
					nIFIntervalCount = IFrameRange.sub_max;
					nIFIntervalMin = IFrameRange.sub_min;
				}
			}
			for (; nIFIntervalMin <= nIFIntervalCount; ++nIFIntervalMin) {
				if (i == 0) {
					$("#MainGop").append('<option value="'+ nIFIntervalMin +'">'+ nIFIntervalMin +'</option>');
				} else {
					$("#ExtGop").append('<option value="'+ nIFIntervalMin +'">'+ nIFIntervalMin +'</option>');
				}
			}
		}
	}
	function AddCmbResolution(nEncodeType, maxRes, dwMask) {
		var nID = ControlTag[nEncodeType][ControlType.RESOLUTION];
		$(nID).empty();
		var nIndex = 0;
		var tempRes = [];
		for (var i = 0; i < res_type.length; i++) {
			if ((resolution[i].dwSize <= resolution[maxRes].dwSize) && (dwMask & (0x01 << i))) {
				tempRes[nIndex] = resolution[i];
				nIndex += 1;
			}
		}
		tempRes.sort(function (a, b) { return a.dwSize - b.dwSize; });
		for(var i = 0; i < tempRes.length;i++){
			var dataHtml = '<option value="' + tempRes[i].nIndex + '">' + tempRes[i].szText + '</option>';
			$(nID).append(dataHtml);
		}
	}
	function AddCmbFPS(nEncodeType, maxFPS) {
		var nID = ControlTag[nEncodeType][ControlType.FRAME];
		$(nID).empty();
		var dataHtml = "";
		for (var i = 0; i < maxFPS; i++) {
			dataHtml += '<option value="' + (i+1) + '">' + (i+1) + '</option>';
		}
		$(nID).append(dataHtml);
	}
	function GetBitrate(curRes, curFps, curGop,curQuality,nEncodeType){
		var iBitrate = -1;
		if(bH265Bitrate[nEncodeType]){
			iBitrate = parseInt(H265_STREAM_CODE_VALUE[curRes][curQuality] * (curGop * curFps + 10 - 1) / (curGop * nFPS + 10 - 1));
		}else{
			iBitrate = parseInt(STREAM_CODE_VALUE[curRes][curQuality] * (curGop * curFps + 10 - 1) / (curGop * nFPS + 10 - 1));
		}
		return iBitrate;
	}
	function StructToWinData(nChannelNum, pConfigEncode, nEncodeType, dwPower, dwMask, dwBitrate, dwDig) {
		if (nEncodeType >= STREAM.NUM){
			return false;
		}
		var dstMainFmt = pConfigEncode.MainFormat;
		var vfFormat = dstMainFmt.Video;
		var dstExtraFmt = pConfigEncode.ExtraFormat;
		var vfExFormat = dstExtraFmt.Video;
		var dstSetFmt;
		var vfSetFormat;
		var nMaxRes = 0, nMaxFPS = 25, dwChnUsed = 0, dwChnFree = 0;
		if (nEncodeType == STREAM.MAIN) {
			if (dwMask == -1) {
				if (m_abilityEncode.ImageSizePerChannel[nChannelNum]) {
					dwMask = m_abilityEncode.ImageSizePerChannel[nChannelNum];
				} else {
					dwMask = m_abilityEncode.EncodeInfo[0].ResolutionMask;
				}
			}
			nMaxRes = ResolutionIndex(vfFormat.Resolution);
			nMaxFPS = vfFormat.FPS;
			var temp = GetMaxResolAndRate(nMaxRes, nMaxFPS, dwPower);
			if(isObject(temp)){
				nMaxRes = temp.nMaxRes;
				nMaxFPS = temp.nMaxFPS;
			}
			dstSetFmt = dstMainFmt;
			vfSetFormat = vfFormat;
		}else if (nEncodeType == STREAM.EXPAND){
			dwMask = m_abilityEncode.ExImageSizePerChannelEx[nChannelNum][ResolutionIndex(dstMainFmt.Video.Resolution)];
			nMaxRes = ResolutionIndex(vfExFormat.Resolution);
			nMaxFPS = vfExFormat.FPS;
			var temp = GetMaxResolAndRate(nMaxRes, nMaxFPS, dwPower);
			if(isObject(temp)){
				nMaxRes = temp.nMaxRes;
				nMaxFPS = temp.nMaxFPS;
			}
			EnableExpandVideo(dstExtraFmt.VideoEnable);
			dstSetFmt = dstExtraFmt;
			vfSetFormat = vfExFormat;
		}else{
			dwMask = m_abilityEncode.CombEncodeInfo[0].ResolutionMask ? m_abilityEncode.CombEncodeInfo[0].ResolutionMask : m_abilityEncode.EncodeInfo[0].ResolutionMask;
			nMaxRes = 0;
			nMaxFPS = videoFormat == "PAL"?25:30;
			
			dstSetFmt = dstMainFmt;
			vfSetFormat = vfFormat;
		}
		var nCurRes = ResolutionIndex(vfSetFormat.Resolution);
		if(nCurRes >= res_type.length || nCurRes  < 0) return false;
		AddCmbResolution(nEncodeType, nMaxRes, dwMask);
		if(bMaxFps){
			for(var i = 0;i < allMaxFps.length;i++){
				if(allMaxFps[i].ImageSize == nCurRes){
					nMaxFPS = allMaxFps[i].MaxFps;
					break;
				}
			}
		}
		var nChnNum = $("#CHNBMchn").val() * 1;
		if (bMaxSupportEncFPS && maxEncFPS != null && nChnNum < nAnaChannel) {
			var nIndex = -1;
			if (nEncodeType == STREAM.MAIN) {
				nIndex = ResolutionIndex(vfFormat.Resolution);
			} else {
				nIndex = ResolutionIndex(vfExFormat.Resolution);
			}
			var nMaxEncFPS = maxEncFPS["astDspAbilityEx"][nChnNum][nEncodeType]["MaxFps"][nIndex];
			nMaxFPS = nMaxFPS < nMaxEncFPS ? nMaxFPS : nMaxEncFPS;
		}
		AddCmbFPS(nEncodeType, nMaxFPS);
		
		var nCurFps = vfSetFormat.FPS > nFPS ? nFPS : vfSetFormat.FPS;
		nCurFps = nCurFps < nMaxFPS ? nCurFps : nMaxFPS;
		var nCompression = "";
		if(nEncodeType == STREAM.MAIN && typeof g_HZZSEncodeMode != "undefined" && g_HZZSEncodeMode * 1)
		{
			if(hzzsEncodeMode != null && typeof hzzsEncodeMode.EncodeType != "undefined")
			{
				nCompression = hzzsEncodeMode.EncodeType * 1;
			}
			else
			{
				nCompression = CompressionIndex(vfSetFormat.Compression);
			}
		}
		else
		{
			nCompression = CompressionIndex(vfSetFormat.Compression);
		}
		if(nEncodeType == STREAM.MAIN){
			$("#MainCodeFormat").val(nCompression);
		}else if(nEncodeType == STREAM.EXPAND){
			$("#ExtCodeFormat").val(nCompression);
		}
		
		if(nCompression == 8){
			bH265Bitrate[nEncodeType] = true;
		}else{
			bH265Bitrate[nEncodeType] = false;
		}
		
		var BitRateTag = ControlTag[nEncodeType][ControlType.BITRATE];
		$(BitRateTag).empty();
		for (var j = 0; j < 6; ++j) {
			var iBitrate = GetBitrate(nCurRes,nCurFps,vfSetFormat.GOP,j,nEncodeType);
			if (dwBitrate < 0 || dwBitrate >= iBitrate) {
				var dataHtml = '<option value="' + iBitrate + '">' + iBitrate + '</option>';
				$(BitRateTag).append(dataHtml);
			}
		}
		$(ControlTag[nEncodeType][ControlType.RESOLUTION]).val(nCurRes);
		$(ControlTag[nEncodeType][ControlType.FRAME]).val(nCurFps);

		var nSel = vfSetFormat.BitRateControl == "CBR"?0:1;
		$(ControlTag[nEncodeType][ControlType.BITCONTROL]).val(nSel);
		if (vfSetFormat.Quality > 6 || vfSetFormat.Quality <= 0) {  //  Quality 画质超出范围后默认
			vfSetFormat.Quality = 4;
		}
		$(ControlTag[nEncodeType][ControlType.QUALITY]).val(vfSetFormat.Quality);
		if (dwDig == true) {
			if (digEncodeAbility[nChannelNum] != null) {
				if (digEncodeAbility[nChannelNum].IFrameRange.main_max != 0) {
					if (vfSetFormat.GOP > digEncodeAbility[nChannelNum].IFrameRange.main_max) {
						vfSetFormat.GOP = digEncodeAbility[nChannelNum].IFrameRange.main_max;
					}
				} else {
					if (vfSetFormat.GOP > 12) {
						vfSetFormat.GOP = 12;
					}
				}
				if (digEncodeAbility[nChannelNum].IFrameRange.sub_max != 0) {
					if (vfSetFormat.GOP > digEncodeAbility[nChannelNum].IFrameRange.sub_max) {
						vfSetFormat.GOP = digEncodeAbility[nChannelNum].IFrameRange.sub_max;
					}
				} else {
					if (vfSetFormat.GOP > 12) {
						vfSetFormat.GOP = 12;
					}
				}
			}
		}
		$(ControlTag[nEncodeType][ControlType.GOP]).val(vfSetFormat.GOP);
		var nTemp;
		if ("CBR" == vfSetFormat.BitRateControl) {
			if (dwBitrate < 0) {
				nTemp = vfSetFormat.BitRate;
			} else {
				nTemp = (dwBitrate > vfSetFormat.BitRate) ? vfSetFormat.BitRate : dwBitrate;
			}
		} else {
			nTemp = GetBitrate(nCurRes,nCurFps,vfSetFormat.GOP,vfSetFormat.Quality-1,nEncodeType);
			if (dwBitrate >= 0) {
				if (nTemp > dwBitrate) nTemp = dwBitrate;
			}
		}
		var nMaLiu=0;
		var nOldTag=0;
		$(BitRateTag).children("option").each(function(){
			if($(this).val()*1 >= nTemp){
				if ((nTemp - nOldTag) < ($(this).val()*1 - nTemp)) {
					if (nOldTag == 0) {
						nMaLiu = $(this).val()*1;
					} else {
						nMaLiu = nOldTag;
					}
				} else {
					nMaLiu = $(this).val()*1;
				}
				return false;
			} else {
				nOldTag = $(this).val() * 1;
			}
		});
		if (nMaLiu == 0) {
			nMaLiu = nOldTag;
		}
		$(BitRateTag).val(nMaLiu);
		$(ControlTag[nEncodeType][ControlType.VIDEO]).prop("checked", dstSetFmt.VideoEnable);
		$(ControlTag[nEncodeType][ControlType.AUDIO]).prop("checked", dstSetFmt.AudioEnable && dstSetFmt.VideoEnable);
		
		var bDisable= true;
		if("CBR" == vfSetFormat.BitRateControl && dstSetFmt.VideoEnable) bDisable = false;
		$(BitRateTag).prop("disabled", bDisable).css("opacity", bDisable ? "0.4" : "1");
		bDisable= true;
		if("VBR" == vfSetFormat.BitRateControl && dstSetFmt.VideoEnable) bDisable = false;
		$(ControlTag[nEncodeType][ControlType.QUALITY]).prop("disabled", bDisable).css("opacity", bDisable ? "0.4" : "1");
	}
	function NormalStructToWinData(nChannelNum, pConfigEncode, nEncodeType) {
		var nChnNum = $("#CHNBMchn").val() * 1;
		var bDig = (nChnNum >= nAnaChannel && nDigChannel > 0)? true : false;
		
		if (nEncodeType == STREAM.MAIN || (nEncodeType == STREAM.EXPAND && bMultiStream)){
			var dwPower = GetFreeDspPower(nChannelNum, bDig,nEncodeType);
			var dwBitrate = -1;
			if(nEncodeType == STREAM.MAIN){
				var i = 0;
				i = GetMaxResolution(m_abilityEncode.ImageSizePerChannel[nChannelNum]);
				if (i >= 0 && resolution[i].dwSize < resolution[ResolutionIndex(pConfigEncode.MainFormat.Video.Resolution)].dwSize) {
					pConfigEncode.MainFormat.Video.Resolution = res_type[i];
				}
				dwBitrate = GetFreeBitratePower(nChannelNum);
			}else if(nEncodeType == STREAM.EXPAND){
				var i = 0;
				i = GetMaxResolution(m_abilityEncode.ExImageSizePerChannelEx[nChannelNum][ResolutionIndex(pConfigEncode.MainFormat.Video.Resolution)]);
				if (i >= 0 && resolution[i].dwSize < resolution[ResolutionIndex(pConfigEncode.ExtraFormat.Video.Resolution)].dwSize) {
					pConfigEncode.ExtraFormat.Video.Resolution = res_type[i];
				}
			}
		}
		return StructToWinData(nChannelNum, pConfigEncode, nEncodeType, dwPower, -1, dwBitrate, bDig);
	}
	function SelchangeComboFrame(dstFormat, nEncodeType) {
		var nCurRes = $(ControlTag[nEncodeType][ControlType.RESOLUTION]).val() * 1;
		var nQuality = $(ControlTag[nEncodeType][ControlType.QUALITY]).val() * 1;

		var vfFormat = dstFormat.Video;
		var iSrcFPS = vfFormat.FPS;
		vfFormat.FPS = $(ControlTag[nEncodeType][ControlType.FRAME]).val() * 1

		if (vfFormat.BitRateControl == "VBR") {
			vfFormat.BitRate = GetBitrate(nCurRes,vfFormat.FPS,vfFormat.GOP,nQuality-1,nEncodeType);
		} else {
			var nTarget = vfFormat.BitRate * (vfFormat.GOP * nFPS + 10 - 1) / (vfFormat.GOP * iSrcFPS + 10 - 1);
			vfFormat.BitRate = nTarget * (vfFormat.GOP * vfFormat.FPS + 10 - 1) / (vfFormat.GOP * nFPS + 10 - 1);
		}

		dstFormat.Video = vfFormat;
		return dstFormat;
	}
	function ChangeFPS(nEncodeType) {
		var nChannelNum = $('#CHNBMchn').val() * 1;
		var pConfigEncode;
		var nChannel;
		if (nChannelNum == nAnaChannel) {
			if (!bStatus) {
				if (nEncodeType == STREAM.MAIN) {
					m_allData.MainFormat = SelchangeComboFrame(m_allData.MainFormat, STREAM.MAIN);
				} else if (nEncodeType == STREAM.EXPAND) {
					m_allData.ExtraFormat = SelchangeComboFrame(m_allData.ExtraFormat, STREAM.EXPAND);
				}
				AllStructToWinData(0, m_allData, STREAM.MAIN);
				AllStructToWinData(0, m_allData, STREAM.EXPAND);
			} else {
				var nDig = nChannelNum - nAnaChannel;
				var nIndex = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].SingleConnId - 1;
				nChannel = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].Decoder[nIndex].Channel;
				pConfigEncode = digEncode[nDig][digEncode[nDig].Name][nChannel];
				if (nEncodeType == STREAM.MAIN) {
					pConfigEncode.MainFormat = SelchangeComboFrame(pConfigEncode.MainFormat, STREAM.MAIN);
				} else if ((nEncodeType == STREAM.EXPAND)) {
					pConfigEncode.ExtraFormat = SelchangeComboFrame(pConfigEncode.ExtraFormat, STREAM.EXPAND);
				}
				NormalStructToWinData(nChannel, pConfigEncode, STREAM.MAIN);
				NormalStructToWinData(nChannel, pConfigEncode, STREAM.EXPAND);
			}
		} else {
			if(nChannelNum < nAnaChannel){
				pConfigEncode=analogEncode[analogEncode.Name][nChannelNum];
				nChannel = nChannelNum;
			}else{
				var nDig = nChannelNum - nAnaChannel;
				var nIndex = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].SingleConnId - 1;
				nChannel = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].Decoder[nIndex].Channel;
				pConfigEncode = digEncode[nDig][digEncode[nDig].Name][nChannel];
			}
			if (nEncodeType == STREAM.MAIN) {
				pConfigEncode.MainFormat = SelchangeComboFrame(pConfigEncode.MainFormat, STREAM.MAIN);
			} else if ((nEncodeType == STREAM.EXPAND)) {
				pConfigEncode.ExtraFormat = SelchangeComboFrame(pConfigEncode.ExtraFormat, STREAM.EXPAND);
			}
			NormalStructToWinData(nChannel, pConfigEncode, STREAM.MAIN);
			NormalStructToWinData(nChannel, pConfigEncode, STREAM.EXPAND);
		}
	}
	function ShowData(){
		EnableButton(1, "#EncodeCP");
		EnableButton(1, "#EncodePaste");
		EnableButton(1, "#EncodeSV");
		InitSelect();
		bRefresh = false;
		var nChannelNo = $("#CHNBMchn").val() * 1;
		if(nChannelNo == nAnaChannel && !bStatus){
			nChannelNo = 0;
		}
		if(nChannelNo < nAnaChannel){
			videoFormat = locationCfg.VideoFormat;
			nFPS = ("PAL" == videoFormat) ? 25 : 30;
			m_abilityEncode = encodeAbility;
		}else{
			var nDig = nChannelNo - nAnaChannel;
			videoFormat = digEncodeAbility[nDig].videoFormat == 0?"PAL":"NTSC";
			nCapture = digEncodeAbility[nDig].nCapture;
			nFPS = ("PAL" == videoFormat) ? 25 : 30;
			m_abilityEncode = digEncodeAbility[nDig].ability;
			InitGOP(digEncodeAbility[nDig].IFrameRange);
			m_abilityEncode.EncodeInfo[0].CompressionMask = digEncodeAbility[nDig].ability.Compression;
			m_abilityEncode.EncodeInfo[1].CompressionMask = digEncodeAbility[nDig].ability.Compression;
		}
		
		if(m_abilityEncode.MaxBitrate == 0){
			m_abilityEncode.MaxBitrate = 24 * 1024;
		}
		InitResData();
		
		UpdateCodeFormat(0,"#MainCodeFormat");
		if(bMultiStream){
			UpdateCodeFormat(1,"#ExtCodeFormat");
		}

		if(nChannelNo < nAnaChannel){
			NormalStructToWinData(nChannelNo, analogEncode[analogEncode.Name][nChannelNo], 0);
			NormalStructToWinData(nChannelNo, analogEncode[analogEncode.Name][nChannelNo], 1);
		}else{
			var nDig = nChannelNo - nAnaChannel;
			var cfg = digEncode[nDig][digEncode[nDig].Name];
			var nIndex = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].SingleConnId - 1;
			var nChannel = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].Decoder[nIndex].Channel;
			NormalStructToWinData(nChannel, cfg[nChannel], 0);
			NormalStructToWinData(nChannel, cfg[nChannel], 1);
		}
		SetAudio();
		InitButton();
		InitChannelSmart(nChannelNo);
		if (bSmartEncodeV2 || bSmartEncode){
			ShowCurSmartCfg(nChannelNo, true);
		}else{
			MasklayerHide();
		}
	}
	function ChangeChannel() {
		if (m_abilityEncode.MaxBitrate == 0) {
			m_abilityEncode.MaxBitrate = 24 * 1024; // 24Mbps
		}
		InitSelect();
		InitResData();

		var nChannelNum = $('#CHNBMchn').val() * 1;
		if (nChannelNum == nAnaChannel) {
			if (!bStatus) {
				m_allData = cloneObj(analogEncode[analogEncode.Name][0]);
				AllStructToWinData(0, m_allData, 0);
				AllStructToWinData(0, m_allData, 1);
				chnIndex = nChannelNum;
				if (bStaticParam) {
					$("#StaticEncodeDiv").css("display", "");
				}
			} else {
				if (nChannelNum != chnIndex) {
					if (!bGetDig[nChannelNum - nAnaChannel]) {
						return;
					}

					if (chnIndex < nAnaChannel) {				
						NormalWinDataToStruct(chnIndex, false);
					} else {	
						NormalWinDataToStruct(chnIndex - nAnaChannel, true);
					}

					var nDig = nChannelNum - nAnaChannel;
					var nIndex = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].SingleConnId - 1; // 配置的第几个
					var nChannel = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].Decoder[nIndex].Channel; // 解码器连接的通道数
					var cfg = digEncode[nDig][digEncode[nDig].Name];
					var pConfigEncode = cfg[nChannel];

					InitGOP(digEncodeAbility[nDig].IFrameRange);
					NormalStructToWinData(nChannel, pConfigEncode, 0);
					NormalStructToWinData(nChannel, pConfigEncode, 1);
					chnIndex = nChannelNum;
				}
			}
		} else if (chnIndex == nAnaChannel && nAnaChannel != 0) {
			if (!bStatus) {	
				AllWinDataToStruct(0);
				NormalStructToWinData(nChannelNum, analogEncode[analogEncode.Name][nChannelNum], 0);
				NormalStructToWinData(nChannelNum, analogEncode[analogEncode.Name][nChannelNum], 1);
				chnIndex = nChannelNum;
				if (bStaticParam) {
					$("#StaticEncodeDiv").css("display", "");
				}
			} else {
				NormalWinDataToStruct(chnIndex - nAnaChannel, true);
				if (nChannelNum < nAnaChannel) {		
					InitGOP(null);
					NormalStructToWinData(nChannelNum, analogEncode[analogEncode.Name][nChannelNum], 0);
					NormalStructToWinData(nChannelNum, analogEncode[analogEncode.Name][nChannelNum], 1);
					if (bStaticParam) {
						$("#StaticEncodeDiv").css("display", "");
					}
				} else {
					if (!bGetDig[nChannelNum - nAnaChannel]) {
						return;
					}
					var nDig = nChannelNum - nAnaChannel;
					var nIndex = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].SingleConnId - 1; // 配置的第几个
					var nChannel = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].Decoder[nIndex].Channel; // 解码器连接的通道数

					var cfg = digEncode[nDig][digEncode[nDig].Name];
					var pConfigEncode = cfg[nChannel];
					NormalStructToWinData(nChannel, pConfigEncode, 0);
					NormalStructToWinData(nChannel, pConfigEncode, 1);
				}
				chnIndex = nChannelNum;
			}
		} else {
			if (nChannelNum != chnIndex) {
				if (!bStatus) {
					NormalWinDataToStruct(chnIndex, false);
					NormalStructToWinData(nChannelNum, analogEncode[analogEncode.Name][nChannelNum], 0);
					NormalStructToWinData(nChannelNum, analogEncode[analogEncode.Name][nChannelNum], 1);
					chnIndex = nChannelNum;

					if (bStaticParam) {
						$("#StaticEncodeDiv").css("display", "");
					}
				} else {
					if (chnIndex < nAnaChannel) {
						NormalWinDataToStruct(chnIndex, false);
					} else {
						NormalWinDataToStruct(chnIndex - nAnaChannel, true);
					}
					
					if (nChannelNum >= nAnaChannel) {
						if (!bGetDig[nChannelNum - nAnaChannel]) {
							return;
						}
						var nDig = nChannelNum - nAnaChannel;
						var nIndex = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].SingleConnId - 1;
						var nChannel = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].Decoder[nIndex].Channel;

						var cfg = digEncode[nDig][digEncode[nDig].Name];
						var pConfigEncode = cfg[nChannel];

						InitGOP(digEncodeAbility[nDig].IFrameRange);
						NormalStructToWinData(nChannel, pConfigEncode, 0);
						NormalStructToWinData(nChannel, pConfigEncode, 1);
						chnIndex = nChannelNum;
					}
					if (nChannelNum < nAnaChannel) {	
						InitGOP(null);
						NormalStructToWinData(nChannelNum, analogEncode[analogEncode.Name][nChannelNum], 0);
						NormalStructToWinData(nChannelNum, analogEncode[analogEncode.Name][nChannelNum], 1);
						chnIndex = nChannelNum;
						if (bStaticParam) {
							$("#StaticEncodeDiv").css("display", "");
						}
					}
				}
			}
		}
		SetAudio();
		if(nChannelNum == nAnaChannel && nDigChannel <= 0) {
			nChannelNum = 0;
		}
		InitChannelSmart(nChannelNum);
		if (bSmartEncodeV2 || bSmartEncode){
			ShowCurSmartCfg(nChannelNum, true);
		}else{
			MasklayerHide();
		}
	}
	function GetDigEncodeCfg(nDig){
		if(!bGetDig[nDig]){
			RfParamCall(function(a){
				digEncodeAbility[nDig] = a[a.Name];
				RfParamCall(function(b){
					MasklayerHide();
					if(b.Ret != 100){
						ShowPaop(pageTitle, lg.get("IDS_REFRESH_FAILED"));
						ShowChildConfigFrame(pageTitle, false,false);
						EnableButton(0, "#EncodeCP");
						EnableButton(0, "#EncodePaste");
						EnableButton(0, "#EncodeSV");
						EnableButton(0, "#EncodeDefault");
						return;
					}
					var cfg = ssRemoteDevice[ssRemoteDevice.Name][nDig];
					var nDecIndex = parseInt(cfg.SingleConnId,16)-1;
					var nChannel = cfg.Decoder[nDecIndex].Channel;
					if(b[b.Name][nChannel].MainFormat.Video.GOP == 0 && b[b.Name][nChannel].ExtraFormat.Video.GOP == 0){						
						ShowPaop(pageTitle, lg.get("IDS_CHSTA_NoConfig"));
						return;
					}

					digEncode[nDig] = b;
					OlddigEncode = cloneObj(b);
					bGetDig[nDig] = true;
					if ((nAnaChannel == 0 && $('#CHNBMchn')[0].selectedIndex == 0) || bRefresh) {
						chnIndex = $('#CHNBMchn').val() * 1;
						ShowData();
					} else {
						videoFormat = digEncodeAbility[nDig].videoFormat == 0?"PAL":"NTSC";
						nCapture = digEncodeAbility[nDig].nCapture;
						nFPS = ("PAL" == videoFormat) ? 25 : 30;
						m_abilityEncode = digEncodeAbility[nDig].ability;
						m_abilityEncode.EncodeInfo[0].CompressionMask = digEncodeAbility[nDig].ability.Compression;
						m_abilityEncode.EncodeInfo[1].CompressionMask = digEncodeAbility[nDig].ability.Compression;
						ChangeChannel();
					}
				}, pageTitle, "NetUse.DigitalEncode", nDig, WSMsgID.WsMsgID_CONFIG_GET);
			}, pageTitle, "NetUse.DigitalAbility", nDig, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			ChangeChannel();
		}
	}
	function GetAnaEncodeCfg(){
		RfParamCall(function(a){
			locationCfg = a[a.Name];
			RfParamCall(function(b){
				encodeAbility = b[b.Name];
				if (encodeAbility.MaxBitrate == 0) {
					encodeAbility.MaxBitrate = 24 * 1024; // 24Mbps
				}
				if(bEncodeImgSize){
					res_pw = encodeAbility.res_pw;
					res_ph = encodeAbility.res_ph;
					res_nw = encodeAbility.res_nw;
					res_nh = encodeAbility.res_nh;
				}
				RfParamCall(function(c){
					analogEncode = c;
					if(nAnaChannel > 0 && bMaxSupportEncFPS){
						RfParamCall(function(a){
							if (a.Ret == 100) {
								maxEncFPS = a[a.Name];
							} 
							if(bRefresh && bStatus && chnIndex >= nAnaChannel){
								GetDigEncodeCfg(chnIndex - nAnaChannel);
							}else{
								ShowData();
							}
						}, pageTitle, "MaxSupportEncFPSAbility", -1, WSMsgID.WsMsgID_ABILITY_GET);
					}else if(bRefresh && bStatus && chnIndex >= nAnaChannel){
						GetDigEncodeCfg(chnIndex - nAnaChannel);
					}else{
						ShowData();
					}
				}, pageTitle, "Simplify.Encode", -1, WSMsgID.WsMsgID_CONFIG_GET);
			}, pageTitle, "EncodeCapability", -1, WSMsgID.WsMsgID_ABILITY_GET);
		}, pageTitle, "General.Location", -1, WSMsgID.WsMsgID_CONFIG_GET);
	}
	function InitChannel() {
	    $("#CHNBMchn").empty();
	    var dataHtml = '';
	    for (var j = 0; j < nAnaChannel; j++) {
	    	dataHtml += '<option value="' + j + '">' + gDevice.getChannelName(j) + '</option>';
	    }
	    if(nAnaChannel > 0 && chnIndex == -1){
	    	chnIndex = 0;
	    }
	    $("#CHNBMchn").append(dataHtml);
		if(nDigChannel > 0 && !bIPC){
			var ssDigitChStatus;
			var ssDigitChDisplay;
			function AddDigitChannels(){
				if (GetFunAbility(gDevice.Ability.OtherFunction.SupportDigitalEncode)) {
					for (var i = nAnaChannel; i < gDevice.loginRsp.ChannelNum; i++) {
						var m = i - nAnaChannel;
						bGetDig[m] = false;
						digEncodeAbility[m] =  null;
						digEncode[m] = null;
						if (ssDigitChStatus["NetWork.ChnStatus"][m].Status == "Connected"
								&& ssRemoteDevice["NetWork.RemoteDeviceV3"][m].ConnType == "SINGLE") {
							var cfg=ssRemoteDevice["NetWork.RemoteDeviceV3"][m];
							var nDecIndex = parseInt(cfg.SingleConnId,16)-1;
							if (nDecIndex >= 0 && ExtractMask(ssDigitChDisplay["NetUse.EncodeChDisplay"].displayChanelMask, i)) {
								if(chnIndex == -1){
									chnIndex = i;
								}
								bStatus = true;
								var dataHtml = '<option value="' + i + '">' + gDevice.getChannelName(i) + '</option>';
								$("#CHNBMchn").append(dataHtml);
							}
						}
					}
				}
				if(chnIndex >= 0 ){
					$("#CHNBMchn").val(chnIndex);
					if(nAnaChannel > 0){
						GetAnaEncodeCfg();
					}else{
						GetDigEncodeCfg(chnIndex - nAnaChannel);
					}
				}else{
					MasklayerHide();
					ShowPaop(pageTitle, lg.get("IDS_CHSTA_NoConfig"));
					$("#EncodePage").css("display", "none");
					return;
				}
			}
			RfParamCall(function(a){
				ssDigitChStatus = a;
				RfParamCall(function(b){
					ssRemoteDevice = b;
					RfParamCall(function(c){
						ssDigitChDisplay = c;
						AddDigitChannels();
					}, pageTitle, "NetUse.EncodeChDisplay", -1, WSMsgID.WsMsgID_CONFIG_GET);
				}, pageTitle, "NetWork.RemoteDeviceV3", -1, WSMsgID.WsMsgID_CONFIG_GET);
			}, pageTitle, "NetWork.ChnStatus", -1, WSMsgID.WsMsgID_CONFIG_GET);
		}else{
			if(nTotalChannel != 1){
				$("#CHNBMchn").append('<option value="'+ nTotalChannel +'">'+ lg.get("IDS_CFG_ALL") +'</option>');
			}
			$("#CHNBMchn").val(chnIndex);
			GetAnaEncodeCfg();
		}
	}
	function GetAudioMode(callback){
		RfParamCall(function(a, b){
			var audioFormType = a[a.Name];
			if(audioFormType.EncodeType != 0){
				$("#AudioModeDiv").css("display", "");
				$("#AudioMode").empty();
				RfParamCall(function(a, b){
					audioSupportType = a;
					var AudioType = ["", "G729_8K", "G726_16K", "G726_24K", "G726_32K", "G726_40K", "PCM_8K16b", "PCM_A", "PCM_U", 
					"ADPCM_8K16b", "ADPCM_16K16b", "G711A_8K16b", "MPEG2", "AMR_8K16b", "G711U_8K16b","IMA_ADPCM_8K16b",
					"AAC_8K16b","AAC_44100Hz"];
					for(var i = 0; i < AudioType.length; i++){
						if((audioFormType.EncodeType >> i) & 0x01){
							$("#AudioMode").append('<option value="'+ audioInFormats[i] +'">'+ AudioType[i] +'</option>');
						}
					}
					$("#AudioMode").val(audioSupportType[audioSupportType.Name].EncodeType);
					callback(100);
				}, pageTitle, "fVideo.AudioSupportType", -1, WSMsgID.WsMsgID_CONFIG_GET);
			}else{
				callback(100);;
			}
		}, pageTitle, "AudioEncodeType", -1, WSMsgID.WsMsgID_ABILITY_GET);
	}
	function GetSmartAbility(callback){
		var bShowDigitalSmart = GetFunAbility(gDevice.Ability.EncodeFunction.SmartEncodeDigital);
		if(typeof bShowDigitalSmart == 'undefined'){
			bShowDigitalSmart = false;
		}
		if (bShowDigitalSmart){
			bSmartEncodeV2 = false;
			RfParamCall(function (a, b){
				chAbilitySmart = a[a.Name];
				RfParamCall(function(a, b){
					chAbilitySmartV2 = a[a.Name];
					bSmartEncodeV2 = true;
					callback(a.Ret);
				}, pageTitle, "ChannelSystemFunction@SmartH264V2", -1, WSMsgID.WSMsgID_CHANNEL_ABILITY_GET_REQ);
			}, pageTitle, "ChannelSystemFunction@SmartH264", -1, WSMsgID.WSMsgID_CHANNEL_ABILITY_GET_REQ);
		}else if(bSmartEncodeV2){
			var fname;
			if(bIPC){
				fname = "Encode264ability"
			}else{
				fname = "AVEnc.H264Ability";
			}
			RfParamCall(function (a, b){
				SmartH264Ability = a[a.Name];
				for(var i = 0; i < nTotalChannel; i++){
					chAbilitySmartV2[i] = SmartH264Ability.uIntel264Plus[0]&(0x01<<i);
					chAbilitySmart[i] = SmartH264Ability.uIntel264[0]&(0x01<<i);
				}
				callback(100);
			}, pageTitle, fname, -1, WSMsgID.WsMsgID_ABILITY_GET);
		}else{
			for(var i = 0; i < nTotalChannel; i++){
				chAbilitySmartV2[i] = 0;
				chAbilitySmart[i] = 0;
			}
			callback(100);
		}
	}
	function GetHZZSEncodeModeCfg(callback)
	{
		if(typeof g_HZZSEncodeMode != "undefined" && g_HZZSEncodeMode * 1)
		{
			RfParamCall(function(a, b){
				if(a.Ret == 100)
				{
					hzzsEncodeMode = a[a.Name];
				}
				callback();
			}, pageTitle, "HZZS.EncodeMode", -1, WSMsgID.WsMsgID_CONFIG_GET, null, true, true);
		}
		else
		{
			callback();
		}
	}
	function Init(){
		m_SmartH264ParamALL = {};
		m_SmartH264ParamALL.Name = "AVEnc.SmartH264";
		m_SmartH264ParamALL[m_SmartH264ParamALL.Name] = new Array(64);
		m_SmartH264ParamALL_V2 = {};
		m_SmartH264ParamALL_V2.Name = "AVEnc.SmartH264V2";
		m_SmartH264ParamALL_V2[m_SmartH264ParamALL_V2.Name] = new Array(64);
		function GetStaticParam(){
			if(bIPC){
				if (gDevice.loginRsp.BuildTime >= "2012-07-10"){
					RfParamCall(function(a, b){
						EncodeStaticParamAll = a;
						bStaticParam = false;
						$("#StaticEncodeDiv").css("display", "");
						$("#StaticEncode").empty();
						$("#StaticEncode").append('<option value="1" level="51">baseline</option>');
						$("#StaticEncode").append('<option value="2" level="41">main profile</option>');
						$("#StaticEncode").append('<option value="3" level="40">high profile</option>');
						$("#StaticEncode").val(a[a.Name][0].Profile);
						RfParamCall(function(a, b){
							bMaxFps = false;
							allMaxFps = null;
							if(a.Ret == 100){
								bMaxFps = true;
								allMaxFps = a[a.Name];
							}
							InitChannel();
						}, pageTitle, "VencMaxFps", -1, WSMsgID.WsMsgID_ABILITY_GET);				
					}, pageTitle, "AVEnc.EncodeStaticParam", -1, WSMsgID.WsMsgID_CONFIG_GET);
				}
			}else{
				RfParamCall(function(a, b){
					if(a.Ret == 100){
						EncStaticParamAblity = a[a.Name];
						var nStaticParam = EncStaticParamAblity.EncStaticParam;
						$("#StaticEncode").empty();		
						var nCount = 0;
						if (nStaticParam & 0x01){
							$("#StaticEncode").append('<option value="baseline">baseline</option>');
							nCount +=1 ;
						}
						if (nStaticParam & 0x02){
							$("#StaticEncode").append('<option value="mainprofile">main profile</option>');
							nCount += 1;
						}
						if (nStaticParam & 0x04){
							$("#StaticEncode").append('<option value="highprofile">high profile</option>');
							nCount += 1;
						}
						if(nStaticParam > 0){
							bStaticParam = true;
							$("#StaticEncodeDiv").css("display", "");
						}
						encStaticParamV2 = {};
						if(nCount > 1){
							RfParamCall(function(a, b){
								encStaticParamV2 = a;
								$("#StaticEncode").val(a[a.Name].Profile);
								InitChannel();
							}, pageTitle, "AVEnc.EncodeStaticParamV2", -1, WSMsgID.WsMsgID_CONFIG_GET);
						}else{
							InitChannel();
						}
					}else{
						InitChannel();
					}
				}, pageTitle, "EncStaticParam", -1, WSMsgID.WsMsgID_ABILITY_GET);
			}
		}
		GetSmartAbility(function(a){
			if(a == 100){
				if(bAudioFormat){
					GetHZZSEncodeModeCfg(function()
					{
						GetAudioMode(function(a){
							if(a == 100){
								GetStaticParam();
							}
						});
					});
				}else{
					GetHZZSEncodeModeCfg(GetStaticParam);
				}
			}
		});
	}
	function AllStructToWinData(nChannelNum, pConfigEncode, nEncodeType) {
		if (nEncodeType == 0 || (nEncodeType == 1 && bMultiStream)) {
			var lFreePower = m_abilityEncode.MaxEncodePower;
			var dwPower = lFreePower / nAnaChannel;
			var dwMask = m_abilityEncode.EncodeInfo[0].ResolutionMask;
			var dwBitrate = -1;
			var dstFormat;
			if (nEncodeType == 0) {
				var dwTmpPower = 0xFFFFFFFF;
				var uiResolution = 0xFFFFFFFF;
				var i = 0;
				for (i = 0; i < nAnaChannel; i++) {
					if (m_abilityEncode.ImageSizePerChannel[i] && m_abilityEncode.MaxEncodePowerPerChannel[i]) {
						dwTmpPower = (dwTmpPower < m_abilityEncode.MaxEncodePowerPerChannel[i]) ? dwTmpPower : m_abilityEncode.MaxEncodePowerPerChannel[i];
						uiResolution &= m_abilityEncode.ImageSizePerChannel[i];
					}
				}
				if (m_abilityEncode.ImageSizePerChannel[nChannelNum]) {
					dwMask = m_abilityEncode.ImageSizePerChannel[nChannelNum] & uiResolution;
				} else {
					dwMask = m_abilityEncode.EncodeInfo[0].ResolutionMask;
				}

				dwPower = (dwPower < dwTmpPower) ? dwPower : dwTmpPower;
				dstFormat = pConfigEncode.ExtraFormat;
				var dwChnUsed = 0;
				if (bMultiStream && dstFormat.VideoEnable) {
					dwChnUsed = resolution[ResolutionIndex(dstFormat.Video.Resolution)].dwSize * dstFormat.Video.FPS;
				}
				dwPower = dwPower - dwChnUsed;
				if (m_abilityEncode.ChannelMaxSetSync) {
					var dwAvgPower = (m_abilityEncode.MaxEncodePower - GetExpandUsed()) / nAnaChannel;
					dwPower = dwPower<dwAvgPower?dwPower:dwAvgPower;
				}
				var nTmp = ResolutionIndex(pConfigEncode.MainFormat.Video.Resolution);
				i = GetMaxResolution(uiResolution);
				if (i >= 0 && resolution[i].dwSize < resolution[nTmp].dwSize) {
					pConfigEncode.MainFormat.Video.Resolution = res_type[i];
				}
				dwBitrate = m_abilityEncode.MaxBitrate / nAnaChannel;
			} else if (nEncodeType == 1) {
				var uiResolution = 0xFFFFFFFF;
				var i = 0;
				for (i = 0; i < nAnaChannel; i++) {
					if (m_abilityEncode.ExImageSizePerChannelEx[i][ResolutionIndex(pConfigEncode.MainFormat.Video.Resolution)]) {
						uiResolution &= m_abilityEncode.ExImageSizePerChannelEx[i][ResolutionIndex(pConfigEncode.MainFormat.Video.Resolution)];
					}
				}
				if (m_abilityEncode.ExImageSizePerChannelEx[nChannelNum][ResolutionIndex(pConfigEncode.MainFormat.Video.Resolution)]) {
					dwMask = m_abilityEncode.ExImageSizePerChannelEx[nChannelNum][ResolutionIndex(pConfigEncode.MainFormat.Video.Resolution)] & uiResolution;
				} else {
					dwMask = m_abilityEncode.EncodeInfo[0].ResolutionMask;
				}

				dstFormat = pConfigEncode.MainFormat;
				var dwChnUsed = 0;
				if (dstFormat.VideoEnable){
					dwChnUsed = resolution[ResolutionIndex(dstFormat.Video.Resolution)].dwSize * dstFormat.Video.FPS;
				}
				dwPower = dwPower - dwChnUsed;
				if (m_abilityEncode.ChannelMaxSetSync && nAnaChannel > 0) {
					var dwAvgPower = (m_abilityEncode.MaxEncodePower - GetMainUsed()) / nAnaChannel;
					dwPower = dwPower<dwAvgPower?dwPower:dwAvgPower;
				}
				i = GetMaxResolution(uiResolution);
				if (i >= 0 && resolution[i].dwSize < resolution[ResolutionIndex(pConfigEncode.MainFormat.Video.Resolution)].dwSize) {
					pConfigEncode.ExtraFormat.Video.Resolution = res_type[i];
				}
			}
			m_allData = pConfigEncode;
			return StructToWinData(nChannelNum, pConfigEncode, nEncodeType, dwPower, dwMask, dwBitrate);
		}
		return false;
	}
	
	function SelchangeComboBitcontrol(dstFormat, nEncodeType) {
		var nCurRes = $(ControlTag[nEncodeType][ControlType.RESOLUTION]).val() * 1;
		var nQuality = $(ControlTag[nEncodeType][ControlType.QUALITY]).val() * 1;

		var nGOP = $(ControlTag[nEncodeType][ControlType.GOP]).val() * 1;
		var nCurFps = $(ControlTag[nEncodeType][ControlType.FRAME]).val() * 1;	
		nCurFps = Math.min(nCurFps, nFPS);

		if ($(ControlTag[nEncodeType][ControlType.BITCONTROL]).val() * 1 == 0) {
			dstFormat.Video.BitRateControl = "CBR";
		} else {
			dstFormat.Video.BitRateControl = "VBR";
		}
		
		dstFormat.Video.BitRate = GetBitrate(nCurRes,nCurFps,nGOP,nQuality-1,nEncodeType);

		var bDisable = true;
		if("CBR" == dstFormat.Video.BitRateControl && dstFormat.VideoEnable) bDisable = false;
		$(ControlTag[nEncodeType][ControlType.BITRATE]).prop("disabled", bDisable).css("opacity", bDisable ? "0.4" : "1");
		bDisable= true;
		if("VBR" == dstFormat.Video.BitRateControl && dstFormat.VideoEnable) bDisable = false;
		$(ControlTag[nEncodeType][ControlType.QUALITY]).prop("disabled", bDisable).css("opacity", bDisable ? "0.4" : "1");

		return dstFormat;
	}
	function ChangeBitCtrl(nEncodeType) {
		var nChannelNum = $('#CHNBMchn').val() * 1;
		var pConfigEncode;
		var nChannel;
		if (nChannelNum == nAnaChannel) {
			if (!bStatus) {
				if (nEncodeType == STREAM.MAIN) {
					m_allData.MainFormat = SelchangeComboBitcontrol(m_allData.MainFormat, STREAM.MAIN);
					AllStructToWinData(0, m_allData, STREAM.MAIN);
				} else if (nEncodeType == STREAM.EXPAND) {
					m_allData.ExtraFormat = SelchangeComboBitcontrol(m_allData.ExtraFormat, STREAM.EXPAND);
					AllStructToWinData(0, m_allData, STREAM.EXPAND);
				}
			} else {
				var nDig = nChannelNum - nAnaChannel;
				var nIndex = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].SingleConnId - 1;
				nChannel = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].Decoder[nIndex].Channel;
				pConfigEncode = digEncode[nDig][digEncode[nDig].Name][nChannel];
				if (nEncodeType == STREAM.MAIN) {
					pConfigEncode.MainFormat = SelchangeComboBitcontrol(pConfigEncode.MainFormat, STREAM.MAIN);
				} else if (nEncodeType == STREAM.EXPAND) {
					pConfigEncode.ExtraFormat = SelchangeComboBitcontrol(pConfigEncode.ExtraFormat, STREAM.EXPAND);
				}

				//NormalStructToWinData(nChannel, pConfigEncode, nEncodeType);
			}
		} else {
			if(nChannelNum < nAnaChannel){
				pConfigEncode = analogEncode[analogEncode.Name][nChannelNum];
				nChannel = nChannelNum;
			}else{
				var nDig = nChannelNum - nAnaChannel;
				var nIndex = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].SingleConnId - 1;
				nChannel = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].Decoder[nIndex].Channel;
				pConfigEncode = digEncode[nDig][digEncode[nDig].Name][nChannel];
			}
		
			if (nEncodeType == STREAM.MAIN) {
				pConfigEncode.MainFormat = SelchangeComboBitcontrol(pConfigEncode.MainFormat, STREAM.MAIN);
			} else if (nEncodeType == STREAM.EXPAND) {
				pConfigEncode.ExtraFormat = SelchangeComboBitcontrol(pConfigEncode.ExtraFormat, STREAM.EXPAND);
			}

			//NormalStructToWinData(nChannel, pConfigEncode, nEncodeType);
		}
	}
	function ChangeQuality(nEncodeType) {
		var nCurRes = $(ControlTag[nEncodeType][ControlType.RESOLUTION]).val() * 1;
		var nQuality = $(ControlTag[nEncodeType][ControlType.QUALITY]).val() * 1;
		var nGop = $(ControlTag[nEncodeType][ControlType.GOP]).val() * 1;
		var nCurFps = $(ControlTag[nEncodeType][ControlType.FRAME]).val() * 1;

		nCurFps = Math.min(nCurFps, nFPS);
		var nBitRate;
		nBitRate = GetBitrate(nCurRes,nCurFps,nGop,nQuality-1, nEncodeType);
		$(ControlTag[nEncodeType][ControlType.BITRATE])[0].selectedIndex = nQuality - 1;
		
		var pConfigEncode = GetConfigEncode();
		if (nEncodeType == STREAM.MAIN) {
			pConfigEncode.MainFormat.Video.Quality = nQuality;
			pConfigEncode.MainFormat.Video.BitRate = nBitRate;
		} else if (nEncodeType == STREAM.EXPAND) {
			pConfigEncode.ExtraFormat.Video.Quality = nQuality;
			pConfigEncode.ExtraFormat.Video.BitRate = nBitRate;
		}
	}
	function ChangeGop(nEncodeType) {
		var nGop = $(ControlTag[nEncodeType][ControlType.GOP]).val() * 1;
		var pConfigEncode = GetConfigEncode();
		if (nEncodeType == STREAM.MAIN) {
			pConfigEncode.MainFormat.Video.GOP = nGop;
		} else if (nEncodeType == STREAM.EXPAND) {
			pConfigEncode.ExtraFormat.Video.GOP = nGop;
		}
	}
	function ClickAudio(nEncodeType) {
		var pConfigEncode = GetConfigEncode();
		var bEnable = false;
		var bChoose = $(ControlTag[nEncodeType][ControlType.AUDIO]).prop("checked");
		if(bChoose){
			bEnable = true;
			if(!$(ControlTag[nEncodeType][ControlType.VIDEO]).prop("checked")){
				$(ControlTag[nEncodeType][ControlType.AUDIO]).prop("checked", false);
				bEnable = false;
			}
		}
		if (nEncodeType == STREAM.MAIN) {
			pConfigEncode.MainFormat.AudioEnable = bEnable;
		} else if (nEncodeType == STREAM.EXPAND) {
			pConfigEncode.ExtraFormat.AudioEnable = bEnable;
		}
	}
	function SelchangeComboResolution(dstFormat, nEncodeType, dwPower) {
		var nCurFps = $(ControlTag[nEncodeType][ControlType.FRAME]).val() * 1;
		var nCurRes = $(ControlTag[nEncodeType][ControlType.RESOLUTION]).val() * 1;
		var nQuality = $(ControlTag[nEncodeType][ControlType.QUALITY]).val() * 1;

		var vfFormat = dstFormat.Video;
		var nMaxFrame = 0;

		var nMaxFrame = parseInt(dwPower / resolution[nCurRes].dwSize);
		nMaxFrame = nMaxFrame > nFPS?nFPS:nMaxFrame;
		nCurFps = Math.min(nCurFps, nMaxFrame);
		vfFormat.Resolution = res_type[nCurRes];
		vfFormat.FPS = nCurFps;
		vfFormat.BitRate = GetBitrate(nCurRes,nCurFps,vfFormat.GOP,nQuality-1, nEncodeType);
	}
	function SelComboResolution(nEncodeType) {
		var nChannelNum = $('#CHNBMchn').val()* 1;
		var pConfigEncode;
		var nChannel;
		if(nChannelNum < nAnaChannel){
			pConfigEncode=analogEncode[analogEncode.Name][nChannelNum];
			nChannel = nChannelNum;
		}else{
			var nDig = nChannelNum - nAnaChannel;
			var nIndex = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].SingleConnId - 1;
			nChannel = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].Decoder[nIndex].Channel;
			pConfigEncode = digEncode[nDig][digEncode[nDig].Name][nChannel];
		}
		var bDig = nChannelNum >= nAnaChannel?true:false;
		if(nEncodeType == STREAM.MAIN){
			var dwPower = GetFreeDspPower(nChannel, bDig, STREAM.MAIN);	
			SelchangeComboResolution(pConfigEncode.MainFormat, STREAM.MAIN, dwPower);
		}else if(nEncodeType == STREAM.EXPAND){
			var dwPower = GetFreeDspPower(nChannel, bDig, STREAM.EXPAND);	
			SelchangeComboResolution(pConfigEncode.ExtraFormat, STREAM.EXPAND, dwPower);
		}
		if (m_abilityEncode.ChannelMaxSetSync && nChannelNum <= nAnaChannel) {
			var cfg = analogEncode[analogEncode.Name];
			for (var i = 0; i < nAnaChannel; i++) {
				if (i != nChannelNum) {
					if(nEncodeType == STREAM.MAIN){
						cfg[i].MainFormat.Video.Resolution = cfg[nChannelNum].MainFormat.Video.Resolution;
						cfg[i].MainFormat.Video.FPS = cfg[nChannelNum].MainFormat.Video.FPS;
					}else if(nEncodeType == STREAM.EXPAND){
						cfg[i].ExtraFormat.Video.Resolution = cfg[nChannelNum].ExtraFormat.Video.Resolution;
						cfg[i].ExtraFormat.Video.FPS = cfg[nChannelNum].ExtraFormat.Video.FPS;
					}
				}
			}
		}
		NormalStructToWinData(nChannel, pConfigEncode, STREAM.MAIN);
		NormalStructToWinData(nChannel, pConfigEncode, STREAM.EXPAND);
	}
	function ChangeResolution(nEncodeType){
		var nChannelNum = $('#CHNBMchn').val() * 1;
		if (nChannelNum == nAnaChannel) {
			if (!bStatus) {
				var lFreePower = m_abilityEncode.MaxEncodePower;
				var lAvrPower = lFreePower / nChannelNum;
				var dstFormat, vfFormat, curFormat;
				
				if(nEncodeType == STREAM.MAIN){
					dstFormat = m_allData.ExtraFormat;
					vfFormat = dstFormat.Video;
					curFormat = m_allData.MainFormat;
				}else if(nEncodeType == STREAM.EXPAND){
					dstFormat = m_allData.MainFormat;
					vfFormat = dstFormat.Video;
					curFormat = m_allData.ExtraFormat;
				}

				var nExResolution = 0;
				var nExFPS = 0;
				if (bMultiStream && dstFormat.VideoEnable) {
					nExResolution = resolution[ResolutionIndex(vfFormat.Resolution)].dwSize;
					nExFPS = vfFormat.FPS;
				}
				var dwEnable = nExResolution * nExFPS;
				if (lAvrPower - dwEnable <= 0) {
					$('#ExtVideo').prop("checked", false);
					return;
				}
				lAvrPower = lAvrPower - dwEnable;
				
				SelchangeComboResolution(curFormat, nEncodeType, lAvrPower);
				AllStructToWinData(0, m_allData, STREAM.MAIN);
				AllStructToWinData(0, m_allData, STREAM.EXPAND);
			} else {
				SelComboResolution(nEncodeType);
			}
		} else {
			SelComboResolution(nEncodeType);
		}
	}
	function WinDataToStruct(dstFmt, nEncodeType) {
		if (nEncodeType > STREAM.NUM) {
			return false;
		}
		vfFormat = dstFmt.Video;
		vfFormat.Resolution = res_type[$(ControlTag[nEncodeType][ControlType.RESOLUTION]).val() * 1];
		vfFormat.FPS = $(ControlTag[nEncodeType][ControlType.FRAME]).val() * 1;
		if ($(ControlTag[nEncodeType][ControlType.BITCONTROL]).val() * 1 == 0) {
			vfFormat.BitRateControl = "CBR";
		} else {
			vfFormat.BitRateControl = "VBR";
		}
		vfFormat.GOP = $(ControlTag[nEncodeType][ControlType.GOP]).val() * 1;
		dstFmt.VideoEnable = $(ControlTag[nEncodeType][ControlType.VIDEO]).prop("checked");
		dstFmt.AudioEnable = $(ControlTag[nEncodeType][ControlType.AUDIO]).prop("checked");
		vfFormat.Quality = $(ControlTag[nEncodeType][ControlType.QUALITY]).val() * 1;
		vfFormat.BitRate = $(ControlTag[nEncodeType][ControlType.BITRATE]).val() * 1;
		dstFmt.Video = vfFormat;
		return dstFmt;
	}
	function NormalWinDataToStruct(nChannelNum, bSaveDig) {
		if (!bSaveDig) {
			analogEncode[analogEncode.Name][nChannelNum].MainFormat = WinDataToStruct(analogEncode[analogEncode.Name][nChannelNum].MainFormat, 0);
			analogEncode[analogEncode.Name][nChannelNum].ExtraFormat = WinDataToStruct(analogEncode[analogEncode.Name][nChannelNum].ExtraFormat, 1);
		} else {
			var nIndex = ssRemoteDevice["NetWork.RemoteDeviceV3"][nChannelNum].SingleConnId - 1;
			var nChannel = ssRemoteDevice["NetWork.RemoteDeviceV3"][nChannelNum].Decoder[nIndex].Channel;

			var cfg = digEncode[nChannelNum][digEncode[nChannelNum].Name];

			if (!cfg[nChannel].ExtraFormat.VideoEnable) {
				cfg[nChannel].ExtraFormat.AudioEnable = false;
			}
			cfg[nChannel].MainFormat = WinDataToStruct(cfg[nChannel].MainFormat, 0);
			cfg[nChannel].ExtraFormat = WinDataToStruct(cfg[nChannel].ExtraFormat, 1);
		}
		
		if(!bSave){
			UpdateCodeFormat(0, "#MainCodeFormat");
			if (bMultiStream){
				UpdateCodeFormat(1, "#ExCodeFormat");
			}
		}
		return true;
	}
	function AllWinDataToStruct(nChannelNum) {
		m_allData.MainFormat = WinDataToStruct(m_allData.MainFormat, 0);
		m_allData.ExtraFormat = WinDataToStruct(m_allData.ExtraFormat, 1);
		return true;
	}
	function SmartChangeCtrlEnable(channel, nSmart){
		if(nSmart != 0){
			$("#MainGop, #MainBitCtrl, #MainBitRate").prop("disabled", true).css("opacity", "0.4");	
			$("#MainBitCtrl").val(1);
			$("#Mainquality").prop("disabled", false).css("opacity", "1");
			$("#MainGop").val(2);
			var nChannelNum = $('#CHNBMchn').val()* 1;
			if (nChannelNum < nAnaChannel) {
				if (typeof analogEncode != "undefined" && analogEncode[analogEncode.Name][nChannelNum].ExtraFormat != null && analogEncode[analogEncode.Name][nChannelNum].MainFormat != null)
				{
					if (analogEncode[analogEncode.Name][nChannelNum].ExtraFormat.Video != null && analogEncode[analogEncode.Name][nChannelNum].ExtraFormat.Video != null) {
						analogEncode[analogEncode.Name][nChannelNum].ExtraFormat.Video.GOP = 2;
						analogEncode[analogEncode.Name][nChannelNum].MainFormat.Video.GOP = 2;
					}
				}
			}
		}else{
			$("#MainGop, #MainBitCtrl").prop("disabled", false).css("opacity", "1");
		}
		if((bSmartEncodeV2 && !chAbilitySmartV2[channel]) ||
		(bSmartEncode && !bSmartEncodeV2)){
			SmartChangeExCtrlEnable(nSmart);
		}
	}
	function SmartChangeExCtrlEnable(nSmart){
		if(nSmart === 0){
			$("#ExtGop, #ExtBitCtrl").prop("disabled", false).css("opacity", "1");
		}else{	
			$("#ExtGop, #ExtBitCtrl, #ExtBitRate").prop("disabled", true).css("opacity", "0.4");
			$("#ExtBitCtrl").val(1);
			$("#Extquality").prop("disabled", false).css("opacity", "1");
			$("#ExtGop").val(2);
		}
	}
	function SetSmartToWnd(channel){
		if(bSmartEncodeV2 && chAbilitySmartV2[channel]){
			var nData = 0;
			if(m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][channel].Smart264PlusV2[0].SmartH264Plus === 0 &&
			m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][channel].Smart264V2[0].SmartH264 === false){
				nData = 0;
			} else if(m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][channel].Smart264PlusV2[0].SmartH264Plus === 0 &&
			m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][channel].Smart264V2[0].SmartH264 === true){
				nData = 1;
			} else if(m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][channel].Smart264PlusV2[0].SmartH264Plus === 1){
				nData = 2;
			}
			
			var a = SetCurComboData("#SmartM", nData);
			if(a < 0){
				$("#SmartM").val(0);
				nData = 0;
			}
			SmartChangeCtrlEnable(channel, nData);
			nData = 0;
			if(m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][channel].Smart264PlusV2[1].SmartH264Plus === 0 &&
			m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][channel].Smart264V2[1].SmartH264 === false){
				nData = 0;
			} else if(m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][channel].Smart264PlusV2[1].SmartH264Plus === 0 &&
			m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][channel].Smart264V2[1].SmartH264 === true){
				nData = 1;
			} else if(m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][channel].Smart264PlusV2[1].SmartH264Plus === 1 ){
				nData = 2;
			}
			var a = SetCurComboData("#SmartExt", nData);
			if(a < 0){
				$("#SmartExt").val(0);
				nData = 0;
			}
			SmartChangeExCtrlEnable(nData);
		} else if(bSmartEncodeV2 && chAbilitySmart[channel] || 
		(bSmartEncode && !bSmartEncodeV2 && channel < nAnaChannel)){
			var nData = 0;
			if(m_SmartH264ParamALL["AVEnc.SmartH264"][channel].SmartH264 ){
				nData = 1;
			}
			var a = SetCurComboData("#SmartM", nData);
			if(a < 0){
				$("#SmartM").val(0);
				nData = 0;
			}
			SmartChangeCtrlEnable(channel, nData);
		}
	}
	function GetSmartConfig(channel, bDefault){
		var fname;
		if(bSmartEncodeV2 && chAbilitySmartV2[channel]){
			if(isObject(m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][channel])){
				SetSmartToWnd(channel);
				MasklayerHide();
				return;
			}
			fname = "AVEnc.SmartH264V2.[" + channel + "]";
		} else if(bSmartEncodeV2 && chAbilitySmart[channel]){
			fname = "AVEnc.SmartH264.[" + channel + "]";
		} else if(bSmartEncode && !bSmartEncodeV2 && channel < nAnaChannel){
			fname = "AVEnc.SmartH264";
		} else{
			MasklayerHide();
			return;
		}
		
		if(isObject(m_SmartH264ParamALL["AVEnc.SmartH264"][channel])){
			SetSmartToWnd(channel);
			MasklayerHide();
			return;
		}
		var cmdID = WSMsgID.WsMsgID_CONFIG_GET;
		bDefault = bDefault == void 0 ? false : bDefault;
		if(bDefault){
			cmdID = WSMsgID.WsMsgID_DEFAULTCONFIG_GET;
		}
		RfParamCall(function(a, b){
			if(a.Name.indexOf("AVEnc.SmartH264V2.[") >= 0){
				m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][channel] = a[a.Name];
			}else if(a.Name.indexOf("AVEnc.SmartH264.[") >= 0){
				m_SmartH264ParamALL["AVEnc.SmartH264"][channel] = a[a.Name];
			}else if(a.Name === "AVEnc.SmartH264"){
				m_SmartH264ParamALL = a;
			}
			SetSmartToWnd(channel);
			MasklayerHide();
		}, pageTitle, fname, -1, cmdID);
	}
	function ShowCurSmartCfg(channel, bGet){
		if(bGet){
			GetSmartConfig(channel);
		}else{
			SetSmartToWnd(channel);
		}
	}
	function InitChannelSmart(nChannel){
		$("#SmartM, #SmartExt").empty();
		var bShowH265X = GetFunAbility(gDevice.Ability.OtherFunction.SupportShowH265X);
		if (bSmartEncodeV2){
			if (chAbilitySmartV2[nChannel]){
				$("#SmartL, #SmartM, #SmartExt").css("display", "");
				$("#SmartM, #SmartExt").append('<option value="0">OFF</option>');
			}else if (chAbilitySmart[nChannel]){
				$("#SmartL, #SmartM").css("display", "");
				$("#SmartExt").css("display", "none");
				$("#SmartM").append('<option value="0">OFF</option>');
			}else {
				$("#SmartL, #SmartM, #SmartExt").css("display", "none");
			}
			var nType = $("#MainCodeFormat").val() * 1;
			if(typeof g_HZZSEncodeMode != "undefined" && g_HZZSEncodeMode * 1 && nType >= 100)
			{
				nType = $("#MainCodeFormat option:selected").attr("data") * 1;
			}
			var strItem = "H.264+";
			if (chAbilitySmart[nChannel]){
				if (8 == nType){
					strItem = "H.265+";
				} else if (bShowH265X){
					strItem = "H.265X";
				}
				$("#SmartM").append('<option value="1">'+ strItem +'</option>');

				if (chAbilitySmartV2[nChannel]){
					$("#SmartExt").append('<option value="1">'+ strItem +'</option>');
				}
			}
			if (chAbilitySmartV2[nChannel]){
				strItem = "H.265X";
				if (8 == nType){
					strItem = "H.265++";
					if (bShowH265X){
						strItem = "H.265AI";
					}
				}
				if (bShowH265X && 8 == nType || !bShowH265X){			
					$("#SmartM, #SmartExt").append('<option value="2">'+ strItem +'</option>');
				}
			}
		}else if (bSmartEncode && nChannel < nAnaChannel){
			$("#SmartL, #SmartM").css("display", "");
			$("#SmartExt").css("display", "none");
			$("#SmartM").append('<option value="0">OFF</option>');
			var nType = $("#MainCodeFormat").val() * 1;
			if(typeof g_HZZSEncodeMode != "undefined" && g_HZZSEncodeMode * 1 && nType >= 100)
			{
				nType = $("#MainCodeFormat option:selected").attr("data") * 1;
			}
			var strItem = "H.264+";
			if (8 == nType){
				strItem = "H.265+";
			}else if (bShowH265X){
				strItem = "H.265X";
			}
			$("#SmartM").append('<option value="1">'+ strItem +'</option>');
		}else{
			$("#SmartL, #SmartM, #SmartExt").css("display", "none");
		}
	}
	function SaveCurSmartConfig(channel, nEncodeType, nSmart){
		if(bSmartEncodeV2 && chAbilitySmartV2[channel]){
			if(nSmart == 0){
				m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][channel].Smart264PlusV2[nEncodeType].SmartH264Plus = 0;
				m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][channel].Smart264V2[nEncodeType].SmartH264 = false;
			}else if(nSmart == 1){
				m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][channel].Smart264PlusV2[nEncodeType].SmartH264Plus = 0;
				m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][channel].Smart264V2[nEncodeType].SmartH264 = true;
			}else if(nSmart == 2){
				m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][channel].Smart264PlusV2[nEncodeType].SmartH264Plus = 1;
			}
		}else if((bSmartEncode && !bSmartEncodeV2 && nAnaChannel > 0) ||
		(bSmartEncodeV2 && chAbilitySmart[channel])){
			if(nSmart == 0){
				m_SmartH264ParamALL["AVEnc.SmartH264"][channel].SmartH264 = false;
			}else if(nSmart == 1){
				m_SmartH264ParamALL["AVEnc.SmartH264"][channel].SmartH264 = true;
			}
		}
	}
	function ChangeSmart(type){
		var nChannel = $('#CHNBMchn').val() * 1;
		if(nChannel === nTotalChannel){
			nChannel = 0;
		}
		var comboID = "#SmartM";
		if(type == 1){
			comboID = "#SmartExt";
		}
		var nSmart = $(comboID).val() * 1;
		if(type === 0){
			SmartChangeCtrlEnable(nChannel, nSmart);
		}else if(type === 1){
			SmartChangeExCtrlEnable(nSmart);
		}
		SaveCurSmartConfig(nChannel, type, nSmart);
		if(nSmart){
			ChangeQuality(type);
			if(type == 0 && !chAbilitySmartV2[nChannel]){
				ChangeQuality(1);
			}
		}
	}
	function SetAudio(){
		var nChannelNum = $("#CHNBMchn").val() * 1;
		if (nAudioInNum != nAnaChannel) {
			if (nAnaChannel) {
				$("#MainAudioDiv").css("display", nChannelNum < nAudioInNum ? "" : "none");
				$("#MainAudio").prop("disabled", nChannelNum < nAudioInNum ? false : true);
				if (bMultiStream) {
					$("#SubAudioDiv").css("display", nChannelNum < nAudioInNum ? "" : "none");
					$("#ExtAudio").prop("disabled", nChannelNum < nAudioInNum ? false : true);
				}
			} else if(bStatus) {
				var nDig = nChannelNum-nAnaChannel;
				var nIndex = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].SingleConnId - 1;
				var nChannel = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].Decoder[nIndex].Channel;
				var nAudio = digEncodeAbility[nDig].nAudio
				$("#MainAudioDiv, #SubAudioDiv").css("display", nChannel < nAudio ? "" : "none");
				$("#MainAudio, #ExtAudio").prop("disabled", nChannel < nAudio ? false : true);
			}	
		}
		if(bStatus && nChannelNum >= nAnaChannel) {
			var nDig = nChannelNum-nAnaChannel;
			var nIndex = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].SingleConnId - 1;
			var nChannel = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].Decoder[nIndex].Channel;
			var nAudio = digEncodeAbility[nDig].nAudio
			$("#MainAudioDiv, #SubAudioDiv").css("display", nChannel < nAudio ? "" : "none");
			$("#MainAudio, #ExtAudio").prop("disabled", nChannel < nAudio ? false : true);
		}
		if(bStatus && nChannelNum < nAnaChannel) {
			if (nAnaChannel){
				$("#MainAudioDiv").css("display", nChannelNum < nAudioInNum ? "" : "none");
				$("#MainAudio").prop("disabled", nChannelNum < nAudioInNum ? false : true);
				if (bMultiStream) {
					$("#SubAudioDiv").css("display", nChannelNum < nAudioInNum ? "" : "none");
					$("#ExtAudio").prop("disabled", nChannelNum < nAudioInNum ? false : true);
				}
			}
		}
	}
	function DataToStruct() {
		var nChannelNum = $('#CHNBMchn').val() * 1;
		if (nChannelNum == nAnaChannel && !bStatus) {
			AllWinDataToStruct(0);
			for (var i = 0; i < nChannelNum; i++) {
				analogEncode[analogEncode.Name][i] = m_allData;
				if (bSmartEncodeV2 && chAbilitySmartV2[i]){
					if(m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][i]){
						m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][i] = cloneObj(m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][0]);
					}else{
						m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][i] = {};
						m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][i] = cloneObj(m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][0]);
					}
				}else if ((bSmartEncode && !bSmartEncodeV2) || (bSmartEncodeV2 && chAbilitySmart[i])){
					if(m_SmartH264ParamALL["AVEnc.SmartH264"][i]){
						m_SmartH264ParamALL["AVEnc.SmartH264"][i] = cloneObj(m_SmartH264ParamALL["AVEnc.SmartH264"][0]);
					}else{
						m_SmartH264ParamALL["AVEnc.SmartH264"][i] = {};
						m_SmartH264ParamALL["AVEnc.SmartH264"][i] = cloneObj(m_SmartH264ParamALL["AVEnc.SmartH264"][0]);
					}
				}
			}
		} else if (nChannelNum != nAnaChannel) {
			if (nChannelNum >= nAnaChannel) {
				NormalWinDataToStruct(nChannelNum - nAnaChannel, true);
			} else {
				NormalWinDataToStruct(nChannelNum, false);
			}
		} else if (nChannelNum == nAnaChannel && bStatus) {
			NormalWinDataToStruct(nChannelNum - nAnaChannel, true);
		}

		return true;
	}
	function SaveDigitalChannels(nDig) {
		if(nDig < nDigChannel){
			if(bGetDig[nDig]){
				RfParamCall(function (a){
					if(a.Ret == 603){
						bReboot = true;
					}
					SaveDigitalChannels(nDig + 1);
				}, pageTitle, "NetUse.DigitalEncode", nDig, WSMsgID.WsMsgID_CONFIG_SET, digEncode[nDig]);
			}else{
				SaveDigitalChannels(nDig + 1);
			}
		}else{
			IsRebootDev();
		}
	}
	function SaveAnalogChannels(){
		var nChannelNum = $('#CHNBMchn').val() * 1;
		if(nAnaChannel != 0){
			var cfg = null;
			if (nChannelNum == nAnaChannel && !bStatus && bNewConfig) {
				cfg = {};
				var title = "Simplify.Encode.[ff]";
				cfg[title] = cloneObj(analogEncode[analogEncode.Name][0]);
				cfg.Name = title;
			}else{
				cfg = analogEncode;
			}

			RfParamCall(function(data){
				if(data.Ret == 603){
					bReboot = true;
				}
				SaveAudioMode();
			}, pageTitle, cfg.Name, -1, WSMsgID.WsMsgID_CONFIG_SET, cfg);
		}else{
			SaveAudioMode();
		}
	}
	function SaveSmartConfig(nIndex){
		if (bSmartEncodeV2){
			if(nIndex < nTotalChannel){
				if (chAbilitySmartV2[nIndex]) {
					if(m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][nIndex]){
						var cfgData = {};
						cfgData.Name = "AVEnc.SmartH264V2.[" + nIndex + "]";
						cfgData[cfgData.Name] = m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][nIndex];
						RfParamCall(function(a, b){
							if(a.Ret == 603 && nIndex < nAnaChannel){
								bReboot = true;	
							}
							SaveSmartConfig(nIndex + 1);
						}, pageTitle, "AVEnc.SmartH264V2", nIndex, WSMsgID.WsMsgID_CONFIG_SET, cfgData);
					}else{
						SaveSmartConfig(nIndex + 1);
					}
				} else if (chAbilitySmart[nIndex]){
					if(m_SmartH264ParamALL["AVEnc.SmartH264"][nIndex]){
						var cfgData = {};
						cfgData.Name = "AVEnc.SmartH264.[" + nIndex + "]";
						cfgData[cfgData.Name] = m_SmartH264ParamALL["AVEnc.SmartH264"][nIndex];
						RfParamCall(function(a, b){
							if(a.Ret == 603){
								bReboot = true;	
							}
							SaveSmartConfig(nIndex + 1);
						}, pageTitle, "AVEnc.SmartH264", nIndex, WSMsgID.WsMsgID_CONFIG_SET, cfgData);
					}else{
						SaveSmartConfig(nIndex + 1);
					}
				} else{
					SaveSmartConfig(nIndex + 1);
				}
			}else{
				SaveAnalogChannels();
			}
		} else if (bSmartEncode && nAnaChannel > 0){
			RfParamCall(function(a){
				if(a.Ret == 603){
					bReboot = true;
				}
				SaveAnalogChannels();
			}, pageTitle, "AVEnc.SmartH264", -1, WSMsgID.WsMsgID_CONFIG_SET, m_SmartH264ParamALL);
		}else{
			SaveAnalogChannels();	
		}
	}
	function SaveHZZSEncodeType(callback)
	{
		if(typeof g_HZZSEncodeMode != "undefined" && g_HZZSEncodeMode * 1)
		{
			hzzsEncodeMode = {
				"EncodeType" : $("#MainCodeFormat option:selected").val() * 1
			};
			var obj = {
				"Name" : "HZZS.EncodeMode",
				"HZZS.EncodeMode" : hzzsEncodeMode
			};
			RfParamCall(function(a, b){
				callback();
			}, pageTitle, "HZZS.EncodeMode", -1, WSMsgID.WsMsgID_CONFIG_SET, obj);
		}
		else
		{
			callback();
		}
	}
	function SaveStaticEncode(){
		if(bIPC){
			EncodeStaticParamAll[EncodeStaticParamAll.Name][0].Profile = $("#StaticEncode").val() * 1;
			RfParamCall(function(a, b){
				if(a.Ret == 603){
					bReboot = true;
				}
				SaveHZZSEncodeType(function(){
					if(bStatus){
						SaveDigitalChannels(0);
					}else{
						IsRebootDev();
					}
				});		
			}, pageTitle, "AVEnc.EncodeStaticParam", -1, WSMsgID.WsMsgID_CONFIG_SET, EncodeStaticParamAll);
		}else{
			if(bStaticParam){
				encStaticParamV2[encStaticParamV2.Name].Profile = $("#StaticEncode").val();
				RfParamCall(function(a, b){
					if(a.Ret == 603){
						bReboot = true;
					}
					if(bStatus){
						 SaveDigitalChannels(0);
					}else{
						IsRebootDev();
					}				
				}, pageTitle, "AVEnc.EncodeStaticParam", -1, WSMsgID.WsMsgID_CONFIG_SET, encStaticParamV2);
			}else{
				if(bStatus){
					 SaveDigitalChannels(0);
				}else{
					IsRebootDev();
				}			
			}
		}
	}
	function SaveAudioMode(){
		if(bAudioFormat && audioSupportType[audioSupportType.Name].EncodeType != $("#AudioMode").val()){
			audioSupportType[audioSupportType.Name].EncodeType = $("#AudioMode").val();
			RfParamCall(function(a){
				if(a.Ret == 603){
					bReboot = true;
				}
				SaveStaticEncode();
			}, pageTitle, "fVideo.AudioSupportType", -1, WSMsgID.WsMsgID_CONFIG_SET, audioSupportType);
		}else{
			SaveStaticEncode();
		}
	}
	function ShowRemoteSmart(){
		$("#RemoteSmartM").empty();
		var bShowH265X = GetFunAbility(gDevice.Ability.OtherFunction.SupportShowH265X);
		if (bSmartEncode){
			$("#Remote_SmartDiv").css("display", "");
			$("#RemoteSmartM").append('<option value="0">OFF</option>');
			var nType = $("#RemoteCodeFormat").val() * 1;
			var strItem = "H.264+";
			if (8 == nType){
				strItem = "H.265+";
			}else if (bShowH265X){
				strItem = "H.265X";
			}
			$("#RemoteSmartM").append('<option value="1">'+ strItem +'</option>');

			var nData = MultiEncode[MultiEncode.Name].SmartEncode ? 1 : 0;
			$("#RemoteSmartM").val(nData);
		}else{
			$("#Remote_SmartDiv").css("display", "none");
		}
	}
	function EnableRemoteVideo(bEnable){
		$("#Remote_MainDivBoxAll, #Remote_SmartDiv").css("opacity", bEnable ? "1" : "0.4");
		$("#RemoteCodeFormat, #RemoteResol, #RemoteFPS, #Remotequality, #ExtBitRate, #RemoteSmartM").prop("disabled", !bEnable);
	}
	function MultiEncodeStructToWinData() {
		var dwPower = MultiChannel.uiMaxEncodePower;
		var dwMask = MultiChannel.uiExImageSize;
		var dwBitrate = MultiChannel.uiMaxBps;
		var i = 0;
		i = GetMaxResolution(MultiChannel.uiExImageSize);

		var dstSetFmt = MultiEncode[MultiEncode.Name];
		var vfSetFormat = dstSetFmt.Video;
		if (i >= 0 && resolution[i].dwSize < resolution[ResolutionIndex(dstSetFmt.Video.Resolution)].dwSize) {
			dstSetFmt.Video.Resolution =  res_type[i];
		}

		var nEncodeType = STREAM.MULTI;
		var nMaxRes = 0, nMaxFPS = 25;
		nMaxRes = ResolutionIndex(vfSetFormat.Resolution);
		nMaxFPS = vfSetFormat.FPS;
		var temp = GetMaxResolAndRate(nMaxRes, nMaxFPS, dwPower);
		if(isObject(temp)){
			nMaxRes = temp.nMaxRes;
			nMaxFPS = temp.nMaxFPS;
		}
		EnableRemoteVideo(dstSetFmt.VideoEnable);

		var nCurRes = ResolutionIndex(vfSetFormat.Resolution);
		if(nCurRes >= res_type.length || nCurRes  < 0) return false;

		AddCmbResolution(nEncodeType, nMaxRes, dwMask);
		if(bMaxFps){
			for(var i = 0;i < allMaxFps.length;i++){
				if(allMaxFps[i].ImageSize == nCurRes){
					nMaxFPS = allMaxFps[i].MaxFps;
					break;
				}
			}
		}
		AddCmbFPS(nEncodeType, nMaxFPS);

		var nCurFps = vfSetFormat.FPS > nFPS ? nFPS : vfSetFormat.FPS;
		nCurFps = nCurFps < nMaxFPS ? nCurFps : nMaxFPS;
		var nCompression = CompressionIndex(vfSetFormat.Compression);
		$("#RemoteCodeFormat").val(nCompression);

		if(nCompression == 8){
			bH265Bitrate[nEncodeType] = true;
		}else{
			bH265Bitrate[nEncodeType] = false;
		}

		$("#RemoteBitRate").empty();
		for (var j = 0; j < 6; ++j) {
			var iBitrate = GetBitrate(nCurRes,nCurFps,vfSetFormat.GOP,j,nEncodeType);
			if (dwBitrate < 0 || dwBitrate >= iBitrate) {
				var dataHtml = '<option value="' + iBitrate + '">' + iBitrate + '</option>';
				$("#RemoteBitRate").append(dataHtml);
			}
		}
		$("#RemoteResol").val(nCurRes);
		$("#RemoteFPS").val(nCurFps);
		$("#Remotequality").val(vfSetFormat.Quality);

		var nTemp;
		if ("CBR" == vfSetFormat.BitRateControl) {
			if (dwBitrate < 0) {
				nTemp = vfSetFormat.BitRate;
			} else {
				nTemp = (dwBitrate > vfSetFormat.BitRate) ? vfSetFormat.BitRate : dwBitrate;
			}
		} else {
			nTemp = GetBitrate(nCurRes,nCurFps,vfSetFormat.GOP,vfSetFormat.Quality-1,nEncodeType);
			if (dwBitrate >= 0) {
				if (nTemp > dwBitrate) nTemp = dwBitrate;
			}
		}
		var nMaLiu=0;
		$("#RemoteBitRate").children("option").each(function(){
			if($(this).val()*1 >= nTemp){
				nMaLiu = $(this).val()*1;
				return false;
			}
		});
		$("#RemoteBitRate").val(nMaLiu);
		$("#RemoteBitRate").prop("disabled", true).css("opacity", "0.4");
	}	
	function FillAppEncode(){
		var mulitHtml = 
		'	<div class="cfg_row" id="remote_enable_div">' +
		'		<div class="cfg_row_left" id="RemoteEnalbeL">' + lg.get("IDS_ENABLE") + '</div>' +
		'		<div class="cfg_row_right">' +
		'			<input type="button" class="selectDisable" id="RemoteEnable" data=""/>' +
		'		</div>' +
		'	</div>' +
		'	<div id="Remote_MainDivBoxAll" class="encode">' +
		'		<div class="cfg_row" id="remote_codetype_div">' +
		'		   <div class="cfg_row_left" id="remotecodetypeL">' + lg.get("IDS_CODE_TYPE") + '</div>' +
		'		    <div class="cfg_row_right">' +
		'		       <select id="RemoteCodeFormat" class="select"></select>' +
		'		   </div>' +
		'		 </div>' +
		'		<div class="cfg_row">' +
		'		   <div class="cfg_row_left" id="remote_Resolution_div">' + lg.get("IDS_RESOLUTION") + '</div>' +
		'		    <div class="cfg_row_right">' +
		'		        <select class="select" id="RemoteResol"></select>' +
		'			</div>' +
		'		</div>' +
		'		<div class="cfg_row" id="fps_row">' +
		'			<div class="cfg_row_left" id="remote_frame_div">' + lg.get("IDS_FRAMERATE") + '</div>' +
		'			<div class="cfg_row_right">' +
		'				<select class="select" id="RemoteFPS"></select>' +
		'			</div>' +
		'		</div>' +
		'		<div class="cfg_row" id="remote_quality_div">' +
		'			<div class="cfg_row_left" id="RemoteQualityL">' + lg.get("IDS_VIDEO_QUALITY") + '</div>' +
		'			<div class="cfg_row_right">' +
		'				<select class="select" id="Remotequality">' +
		'				</select>' +
		'			</div>' +
		'		</div>' +
		'		<div class="cfg_row" id="remote_BitRate_div">' +
		'			<div class="cfg_row_left" id="RemoteBitRateL">' + lg.get("IDS_BITERATE") + '</div>' +
		'			<div class="cfg_row_right">' +
		'				<select class="select" id="RemoteBitRate"></select>' +
		'			</div>' +
		'		</div>' +
		'	</div>' +
		'	<div class="cfg_row encode" id="Remote_SmartDiv">' +
		'		<div class="cfg_row_left" id="RemoteSmartL">' + lg.get("IDS_ENC_SMART") + '</div>' +
		'		<div class="cfg_row_right">' +
		'			<select class="select" id="RemoteSmartM"></select>' +
		'		</div>' +
		'	</div>' +		
		'	<div class="cfg_row">' +
		'		<div class="btn_box" style="margin-left: 135px;">' +
		'			<button id="RemoteSV" class="btn">' + lg.get("IDS_SAVE") + '</button>' +
		'			<button id="RemoteCancel" class="btn btn_cancle">' + lg.get("IDS_CANCEL") + '</button>' +
		'		</div>' +
		'	</div>';

		$("#Config_dialog .content_container").html(mulitHtml);
		MasklayerShow();
		Config_Title.innerHTML = lg.get("IDS_AUTH_RemotePreview");
		SetWndTop("#Config_dialog", 30, 25);						
		$("#Config_dialog").css("width", '500px');
		ChangeBtnState2();
		$("#Config_dialog").show(function () {
			var strQuality = ["IDS_ENC_WORST", "IDS_ENC_WORSE", "IDS_ENC_GENERAL", 
					"IDS_ENC_GOOD", "IDS_ENC_BETTER", "IDS_ENC_BEST"];
			for(var i = 0; i < 6; i++){
				$("#Remotequality").append('<option value="' + (i + 1) + '">' + lg.get(strQuality[i]) + '</option>');
			}
			var btnFlag = MultiEncode[MultiEncode.Name].VideoEnable?1:0
			$("#RemoteEnable").attr("data", btnFlag);
			UpdateCodeFormat(STREAM.MULTI,"#RemoteCodeFormat");
			MultiEncodeStructToWinData();
			ShowRemoteSmart();
			InitButton2();
		});

		$("#RemoteEnable").click(function() {
			MultiEncode[MultiEncode.Name].VideoEnable = $("#RemoteEnable").attr("data") * 1 ? true: false;
			MultiEncodeStructToWinData();
		});
		$("#RemoteCodeFormat").change(function(){
			var count = $('#RemoteCodeFormat option').length;
			if (count >= 2) {
				var nType = $(this).val() * 1;
				if (8 == nType) {
					bH265Bitrate[STREAM.MULTI] = true;
				} else if (7 == nType) {
					bH265Bitrate[STREAM.MULTI] = false;
				}
				MultiEncode[MultiEncode.Name].Video.Compression = Compression[nType];
				var lFreePower = 0;
				lFreePower = MultiChannel.uiMaxEncodePower;
				SelchangeComboResolution(MultiEncode[MultiEncode.Name], STREAM.MULTI, lFreePower);
				MultiEncodeStructToWinData();

				if(bSmartEncode){
					ShowRemoteSmart();
				}
			}
		});
		$("#RemoteResol").change(function(){
			var lFreePower = 0;
			lFreePower = MultiChannel.uiMaxEncodePower;
			SelchangeComboResolution(MultiEncode[MultiEncode.Name], STREAM.MULTI, lFreePower);
			MultiEncodeStructToWinData();
		});
		$("#RemoteFPS").change(function(){
			var lFreePower = 0;
			lFreePower = MultiChannel.uiMaxEncodePower;
			SelchangeComboResolution(MultiEncode[MultiEncode.Name], STREAM.MULTI, lFreePower);
			MultiEncodeStructToWinData();
		});
		$("#Remotequality").change(function(){
			var nCurRes = $("#RemoteResol").val() * 1;
			var nQuality = $("#Remotequality").val() * 1;
			var nCurFps = $("#RemoteFPS").val() * 1;
			var cfg = MultiEncode[MultiEncode.Name];
			var nGop = cfg.Video.GOP;

			nCurFps = Math.min(nCurFps, nFPS);
			var nBitRate;
			nBitRate = GetBitrate(nCurRes,nCurFps,nGop,nQuality-1, STREAM.MULTI);
			$("#RemoteBitRate")[0].selectedIndex = nQuality - 1;
			
			cfg.Video.Quality = nQuality;
			cfg.Video.BitRate = nBitRate;
		});
		$("#RemoteSV").unbind().click(function(){
			MultiEncode[MultiEncode.Name].VideoEnable = $("#RemoteEnable").attr("data") * 1 ? true: false;
			var vfFormat = MultiEncode[MultiEncode.Name].Video;
			vfFormat.Resolution = res_type[$("#RemoteResol").val() * 1];
			vfFormat.FPS = $("#RemoteFPS").val() * 1;
			vfFormat.Quality = $("#Remotequality").val() * 1;
			vfFormat.BitRate = $("#RemoteBitRate").val() * 1;
			var sTitle = lg.get("IDS_AUTH_RemotePreview");
			RfParamCall(function(a){
				closeDialog();
				if(a.Ret == 603){
					RebootDev(sTitle, lg.get("IDS_CONFIRM_RESTART"), true);
				}else{
					ShowPaop(sTitle, lg.get("IDS_SAVE_SUCCESS"));
				}
			}, sTitle, MultiEncode.Name, -1, WSMsgID.WsMsgID_CONFIG_SET, MultiEncode);
		});
	}
	$(function(){
		if(bNoSyns){
			$("#ExtCodeFormat").css("display","");
		}
		if(bMultiChannel){
			$("#RemotePreviewDiv").css("display", "");
		}
		if(GetFunAbility(gDevice.Ability.OtherFunction.SupportShowH265X)){
			sCompression[7] = "H.265X";
		}
		var strQuality = ["IDS_ENC_WORST", "IDS_ENC_WORSE", "IDS_ENC_GENERAL", 
		"IDS_ENC_GOOD", "IDS_ENC_BETTER", "IDS_ENC_BEST"];
		$("#Mainquality, #Extquality, #MainBitCtrl, #ExtBitCtrl").empty();
		var i;
		for(i = 0; i < 6; i++){
			$("#Mainquality, #Extquality").append('<option value="' + (i + 1) + '">' + lg.get(strQuality[i]) + '</option>');
		}
		var strBitCtrl = ["IDS_ENC_CBR", "IDS_ENC_VBR"];
		for(i = 0; i < 2; i++){
			$("#MainBitCtrl, #ExtBitCtrl").append('<option value="' + i + '">' + lg.get(strBitCtrl[i]) + '</option>');
		}
		InitGOP(null);
		if(bMultiStream){
			$("#AudioGroupS").css("display", "");
		}else{
			$("#AudioGroupS").css("display", "none");
		}
		$("#MainVideo").prop("disabled", true);
		if (nAudioInNum > 0 ){
			$("#MainAudioDiv, #SubAudioDiv").css("display", "");
			VAL.innerHTML = lg.get("IDS_VIDEOAUDIO");
		}else{
			$("#MainAudioDiv, #SubAudioDiv").css("display", "");
			VAL.innerHTML = lg.get("IDS_VIDEO");
		}
		$("#EncodeRF").click(function(){
			bRefresh = true;
			Init();
		});
		$("#CHNBMchn").change(function(){
			var nChannelNum = $(this).val() * 1;
			if (nChannelNum >= nAnaChannel && nAnaChannel != 1) {
				$("#EncodeCP, #EncodePaste, #EncodeDefault").css("display", "none");
			} else {
				$("#EncodeCP, #EncodePaste").css("display", "");
				if(gDevice.bGetDefault){
					$("#EncodeDefault").css("display", "");
				}
			}
			if (bStatus) {
				if (nChannelNum >= nAnaChannel) {
					$("#StaticEncodeDiv").css("display", "none");
					if (!bGetDig[nChannelNum - nAnaChannel]){
						GetDigEncodeCfg(nChannelNum - nAnaChannel);
					} else {
						var nDig = nChannelNum - nAnaChannel;
						videoFormat = digEncodeAbility[nDig].videoFormat == 0?"PAL":"NTSC";
						nCapture = digEncodeAbility[nDig].nCapture;
						nFPS = ("PAL" == videoFormat) ? 25 : 30;
						m_abilityEncode = digEncodeAbility[nDig].ability;
						m_abilityEncode.EncodeInfo[0].CompressionMask = digEncodeAbility[nDig].ability.Compression;
						m_abilityEncode.EncodeInfo[1].CompressionMask = digEncodeAbility[nDig].ability.Compression;
						ChangeChannel();
					}
				} else {
					videoFormat = locationCfg.VideoFormat;
					nFPS = ("PAL" == videoFormat) ? 25 : 30;
					m_abilityEncode = encodeAbility;
					if (bStaticParam) {
						$("#StaticEncodeDiv").css("display", "");
					}
					ChangeChannel();
				}
			} else {
				videoFormat = locationCfg.VideoFormat;
				nFPS = ("PAL" == videoFormat) ? 25 : 30;
				m_abilityEncode = encodeAbility;
				if (bStaticParam) {
					$("#StaticEncodeDiv").css("display", "");
				}
				ChangeChannel();
			}
		});
		$("#MainCodeFormat").change(function(){
			var count = $('#MainCodeFormat option').length;
			if (count >= 2) {
				var nType = $(this).val() * 1;
				if(typeof g_HZZSEncodeMode != "undefined" && g_HZZSEncodeMode * 1 && nType >= 100)
				{
					nType = $("#MainCodeFormat option:selected").attr("data") * 1;
				}
				if (8 == nType) {
					bH265Bitrate[STREAM.MAIN] = true;
					if(!bNoSyns)
						bH265Bitrate[STREAM.EXPAND] = true;
				} else if (7 == nType) {
					bH265Bitrate[STREAM.MAIN] = false;
					if(!bNoSyns)
						bH265Bitrate[STREAM.EXPAND] = false;
				}
				var pConfigEncode = GetConfigEncode();
				pConfigEncode.MainFormat.Video.Compression = Compression[nType];
				if(!bNoSyns)
					pConfigEncode.ExtraFormat.Video.Compression = Compression[nType];
				if(typeof g_HZZSEncodeMode != "undefined" && g_HZZSEncodeMode * 1)
				{
					hzzsEncodeMode = { "EncodeType" : $(this).val() * 1 };
				}
				ChangeResolution(STREAM.MAIN);
				if(!bNoSyns)
					ChangeResolution(STREAM.EXPAND);
				var nChannelNum = $('#CHNBMchn').val() * 1;
				if(nChannelNum == nAnaChannel && nDigChannel <= 0){
					nChannelNum = 0;
				}
				InitChannelSmart(nChannelNum);
				if (bSmartEncodeV2 || bSmartEncode){
					ShowCurSmartCfg(nChannelNum, false);
				}
			}
		});

		$("#ExtCodeFormat").change(function(){
			var count = $('#ExtCodeFormat option').length;
			if (count >= 2) {
				var nType = $(this).val() * 1;
				if (8 == nType) {
					bH265Bitrate[STREAM.EXPAND] = true;
				} else if (7 == nType) {
					bH265Bitrate[STREAM.EXPAND] = false;
				}
				var pConfigEncode = GetConfigEncode();
				var nCompression= $("#ExtCodeFormat").val();
				if(!bNoSyns)
					pConfigEncode.MainFormat.Video.Compression = Compression[nCompression];
				pConfigEncode.ExtraFormat.Video.Compression = Compression[nCompression];
				ChangeResolution(STREAM.MAIN);
				var nChannelNum = $('#CHNBMchn').val() * 1;
				if(nChannelNum == nAnaChannel && nDigChannel <= 0){
					nChannelNum = 0;
				}
				InitChannelSmart(nChannelNum);
				if (bSmartEncodeV2 || bSmartEncode){
					ShowCurSmartCfg(nChannelNum, false);
				}
			}
		});
		$("#MainResol").change(function(){
			ChangeResolution(STREAM.MAIN);

			var nChannelNum = $("#CHNBMchn").val() * 1;
			if(nChannelNum == nAnaChannel && !bStatus){
				nChannelNum = 0;
			}
			InitChannelSmart(nChannelNum);
			if (bSmartEncodeV2 || bSmartEncode){
				ShowCurSmartCfg(nChannelNum, false);
			}
		});
		$("#ExtResol").change(function(){
			ChangeResolution(STREAM.EXPAND);
			
			var nChannelNum = $("#CHNBMchn").val() * 1;
			if(nChannelNum == nAnaChannel && !bStatus){
				nChannelNum = 0;
			}
			InitChannelSmart(nChannelNum);
			if (bSmartEncodeV2 || bSmartEncode){
				ShowCurSmartCfg(nChannelNum, false);
			}
		});
		$("#MainFPS").change(function(){
			ChangeFPS(STREAM.MAIN);

			var nChannelNum = $("#CHNBMchn").val() * 1;
			if(nChannelNum == nAnaChannel && !bStatus){
				nChannelNum = 0;
			}
			InitChannelSmart(nChannelNum);
			if (bSmartEncodeV2 || bSmartEncode){
				ShowCurSmartCfg(nChannelNum, false);
			}
		});
		$("#ExtFPS").change(function(){
			ChangeFPS(STREAM.EXPAND);

			var nChannelNum = $("#CHNBMchn").val() * 1;
			if(nChannelNum == nAnaChannel && !bStatus){
				nChannelNum = 0;
			}
			InitChannelSmart(nChannelNum);
			if (bSmartEncodeV2 || bSmartEncode){
				ShowCurSmartCfg(nChannelNum, false);
			}
		});
		$("#MainBitRate").change(function(){
			var pConfigEncode = GetConfigEncode();
			pConfigEncode.MainFormat.Video.BitRate=$("#MainBitRate").val()*1;
		});
		$("#ExtBitRate").change(function(){
			var pConfigEncode = GetConfigEncode();
			pConfigEncode.ExtraFormat.Video.BitRate = $("#ExtBitRate").val()*1;
		});
		$("#MainBitCtrl").change(function(){
			ChangeBitCtrl(STREAM.MAIN)
		});
		$("#ExtBitCtrl").change(function(){
			ChangeBitCtrl(STREAM.EXPAND)
		});
		$("#Mainquality").change(function(){
			ChangeQuality(STREAM.MAIN);
		});
		$("#Extquality").change(function(){
			ChangeQuality(STREAM.EXPAND);
		});
		$("#MainGop").change(function(){
			ChangeGop(STREAM.MAIN);
		});
		$("#ExtGop").change(function(){
			ChangeGop(STREAM.EXPAND);
		});
		$("#ExtVideo").click(function(){
			var nChannelNum = $('#CHNBMchn').val() * 1;
			var bEnable = $("#ExtVideo").prop("checked");
			var pConfigEncode;
			var nChannel;
			if (nChannelNum == nAnaChannel) {
				if (!bStatus) {	
					m_allData.ExtraFormat.VideoEnable = bEnable;
					AllStructToWinData(0, m_allData, STREAM.MAIN);
					AllStructToWinData(0, m_allData, STREAM.EXPAND);
				} else {
					var nDig = nChannelNum - nAnaChannel;
					var nIndex = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].SingleConnId - 1;
					nChannel = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].Decoder[nIndex].Channel;
					pConfigEncode = digEncode[nDig][digEncode[nDig].Name][nChannel];
					pConfigEncode.ExtraFormat.VideoEnable = bEnable;
					NormalStructToWinData(nChannel, pConfigEncode, STREAM.MAIN);
					NormalStructToWinData(nChannel, pConfigEncode, STREAM.EXPAND);
				}
			} else {
				if(nChannelNum < nAnaChannel){
					pConfigEncode=analogEncode[analogEncode.Name][nChannelNum];
					nChannel = nChannelNum;
				}else{
					var nDig = nChannelNum - nAnaChannel;
					var nIndex = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].SingleConnId - 1;
					nChannel = ssRemoteDevice["NetWork.RemoteDeviceV3"][nDig].Decoder[nIndex].Channel;
					pConfigEncode = digEncode[nDig][digEncode[nDig].Name][nChannel];
				}
				
				pConfigEncode.ExtraFormat.VideoEnable = bEnable;
				NormalStructToWinData(nChannel, pConfigEncode, STREAM.MAIN);
				NormalStructToWinData(nChannel, pConfigEncode, STREAM.EXPAND);
			}

			if(bEnable){
				if(nChannelNum == nAnaChannel && !bStatus){
					nChannelNum = 0;
				}
				InitChannelSmart(nChannelNum);
				if (bSmartEncodeV2 || bSmartEncode){
					ShowCurSmartCfg(nChannelNum, false);
				}
			}
		});
		$("#MainAudio").click(function(){
			ClickAudio(STREAM.MAIN);
		});
		$("#ExtAudio").click(function(){
			ClickAudio(STREAM.EXPAND);
		});
		$("#SmartM").change(function(){
			ChangeSmart(0);
		});
		$("#SmartExt").change(function(){
			ChangeSmart(1);
		});
		$("#EncodeSV").click(function(){
			bSave = true;
			DataToStruct();
			bSave = false;
			bReboot = false;
						
			SaveSmartConfig(0);			
		});
		$("#EncodeCP").click(function(){
			var nChannelNum = $("#CHNBMchn").val() * 1;
			if (nChannelNum > nAnaChannel || ( nChannelNum == nAnaChannel && bStatus)) {
				return;
			}
			if (nChannelNum == nAnaChannel){
				nChannelNum = 0;
			}
			bSave = true;
			NormalWinDataToStruct(nChannelNum, false);
			bSave = false;
			copyData = cloneObj(analogEncode[analogEncode.Name][nChannelNum]);
			bCopy = true;
		});
		$("#EncodePaste").click(function(){
			if (!bCopy ){
				return;
			}
			var nChannelNum = $("#CHNBMchn").val() * 1;
			if (nChannelNum > nAnaChannel || (nChannelNum == nAnaChannel && bStatus)){
				return;
			}
			var nExResolution = 0;
			var nExFPS = 0;	
			var nResolutin = resolution[ResolutionIndex(copyData.MainFormat.Video.Resolution)].dwSize;
			var nFPS = copyData.MainFormat.Video.FPS;
			if (bMultiStream && copyData.ExtraFormat.VideoEnable ){
				nExResolution = resolution[ResolutionIndex(copyData.ExtraFormat.Video.Resolution)].dwSize;
				nExFPS = copyData.ExtraFormat.Video.FPS;
			}
			var dwEnable = nResolutin * nFPS + nExResolution * nExFPS;
			if ( nChannelNum == nAnaChannel ){
				var lFreePower = m_abilityEncode.MaxEncodePower;
				var nChannelCount = nAnaChannel;
				var lAvrPower = lFreePower / nChannelCount;
				if (dwEnable > lAvrPower ) {
					return;
				}
				for (var i = 0; i < nChannelNum; i ++ ){
					analogEncode[analogEncode.Name][i] = cloneObj(copyData);
				}	
				nChannelNum = 0;
			} else{
				var dwCurChannelEnable = GetFreeDspPower(nChannelNum, false, STREAM.NUM);
				if ( dwEnable > dwCurChannelEnable ){
					return;
				}
				analogEncode[analogEncode.Name][nChannelNum] = cloneObj(copyData);
			}
			NormalStructToWinData(nChannelNum, analogEncode[analogEncode.Name][nChannelNum], STREAM.MAIN);
			NormalStructToWinData(nChannelNum, analogEncode[analogEncode.Name][nChannelNum], STREAM.EXPAND);
		});
		$("#RemotePreview").click(function(){
			RfParamCall(function(a){
				MultiChannel = a[a.Name];
				RfParamCall(function(a){
					MultiEncode = a;
					FillAppEncode();
				}, pageTitle, "AVEnc.MultiChannelEncode", -1, WSMsgID.WsMsgID_CONFIG_GET);
			}, pageTitle, "MultiChannel", -1, WSMsgID.WsMsgID_ABILITY_GET);
		});
		$("#EncodeDefault").click(function(){
			var nChannelNum = $("#CHNBMchn").val() * 1;
			RfParamCall(function(c){
				if (nChannelNum == nAnaChannel) {
					analogEncode[analogEncode.Name][0] = c[c.Name][0];
					m_allData = cloneObj(analogEncode[analogEncode.Name][0]);
					AllStructToWinData(0, m_allData, 0);
					AllStructToWinData(0, m_allData, 1);
				}else {
					analogEncode[analogEncode.Name][nChannelNum] = c[c.Name][nChannelNum];
					NormalStructToWinData(nChannelNum, analogEncode[analogEncode.Name][nChannelNum], 0);
					NormalStructToWinData(nChannelNum, analogEncode[analogEncode.Name][nChannelNum], 1);
				}

				nChannelNum = (nChannelNum == nAnaChannel) ? 0 : nChannelNum;
				if (bSmartEncodeV2 || bSmartEncode){
					m_SmartH264ParamALL_V2["AVEnc.SmartH264V2"][nChannelNum] = null;
					m_SmartH264ParamALL["AVEnc.SmartH264"][nChannelNum] = null;
					GetSmartConfig(nChannelNum, true);
				}else{
					MasklayerHide();
				}
			}, pageTitle, "Simplify.Encode", -1, WSMsgID.WsMsgID_DEFAULTCONFIG_GET);
		});
		Init();
	});
});