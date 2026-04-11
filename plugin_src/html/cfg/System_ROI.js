//# sourceURL=System_ROI.js
$(function(){
    var roiInfo;
    var pageTitle = $("#System_ROI").text();
    $(function(){
        ChangeBtnState();
        $("#roiLevel").empty();
        for (var i=0; i < 6; i++) {
            $("#roiLevel").append('<option value="'+i+'">'+i+'</option>');
        }
        function ShowData(){
            $("#roiLevel").val(roiInfo[roiInfo.Name].ROIList[0].Level);
            $("#roiEnable").attr("data", roiInfo[roiInfo.Name].ROIList[0].Enable ? 1: 0);
            DivBox_Net("#roiEnable", "#roiBox");
            InitButton();
        }
        $("#roiEnable").click(function() {
			DivBox_Net("#roiEnable", "#roiBox");
		});
        $("#roiSave").unbind().click(function(){
            roiInfo[roiInfo.Name].ROIList[0].Enable = $("#roiEnable").attr("data") * 1 ? true : false;
            roiInfo[roiInfo.Name].ROIList[0].Level = $("#roiLevel").val()*1 ;
            gDevice.getROIRegion(function(a){
                if(a.Ret == 100){
                    for(var i =0; i < roiInfo[roiInfo.Name].ROINum;i++){
                        roiInfo[roiInfo.Name].ROIList[i].Width = a.RoiInfo.ROIList[i].Width;
                        roiInfo[roiInfo.Name].ROIList[i].Height = a.RoiInfo.ROIList[i].Height;
                        roiInfo[roiInfo.Name].ROIList[i].X = a.RoiInfo.ROIList[i].X;
                        roiInfo[roiInfo.Name].ROIList[i].Y = a.RoiInfo.ROIList[i].Y;
                    }
                    RfParamCall(function(b){
                        ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
                    }, pageTitle, "AVEnc.ROI", 0, WSMsgID.WsMsgID_CONFIG_SET, roiInfo);
                }
            });
        });
        $("#roiRefresh").unbind().click(function(){
            initColorSet();
        });
        $(".cfg_container").unbind().scroll(function(event){
            $("#roiSetOcx").css("top",$(".cfg_container")[0].scrollTop+20);
		})
        function LoadConfig(callback) {
            RfParamCall(function(a){
                if(a.Ret == 100){
                    var nRegionNum = a[a.Name].RegionNum;
                    if(nRegionNum == 1){
                        RfParamCall(function(b){
                            roiInfo = b;
                            roiInfo[roiInfo.Name].ROINum = nRegionNum;
                            callback(b.Ret);
                        }, pageTitle, "AVEnc.ROI", 0, WSMsgID.WsMsgID_CONFIG_GET, null,true);
                    }else{
                        a.Ret = ERR_NoSupport;
                        callback(a.Ret);
                    }
                }else{
                    callback(a.Ret);
                }
            }, pageTitle, "ROIRuleLimitAbility", -1, WSMsgID.WsMsgID_ABILITY_GET, null,true);
        }
        function initColorSet(){
            LoadConfig(function(a){
                if(a == 100){
                    ShowData();
                    gDevice.ColorSetPreviewPlay(0, 1, function(a){
                        gDevice.ShowROIRegion(roiInfo[roiInfo.Name], function(a){
                            MasklayerHide();
                        });
                    });
                }
                else{
                    if(a == 107){
                        ShowPaop(pageTitle, lg.get("IDS_NO_POWER"));
                    }else{
                        ShowPaop(pageTitle, lg.get("IDS_REFRESH_FAILED"));
                    }                     
                    gDevice.ColorSetPreviewStop(function(){
                        MasklayerHide();
                    });
                }
            });
        }
        initColorSetEvent = initColorSet;
        initColorSet();
	});
});