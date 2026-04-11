//# sourceURL=Advance_Account.js
$(function () {
    var userCfg;
	var userCfgEx;
	var groupCfg;
	var AuthorityCfg;
	var nSelUser;
	var g_bAdd;
	var g_bOpUser = false;
	var g_bOpGroup = false;
	var bRf = false;
	var bHaveAdmin=false;
	var bHaveAccount=false;
	var bIPC = gDevice.devType == devTypeEnum.DEV_IPC ? true : false;
	var pageTitle = $("#Advance_Account").text();
	var PWDInvalid = '';
	var PWDFormatError = "";
	var PwdStrength = 0;
	if (gVar.pswMinLen == gVar.pswMaxLen) {
		PWDInvalid = lg.get("IDS_CHECKPW_LENGTH") + ' ' + gVar.pswMinLen + ' ' + lg.get("IDS_CHECKPW_LENGTHU");
	} else {
		PWDInvalid = lg.get("IDS_CHECKPW_LENGTH") + ' ' + gVar.pswMinLen + ' ~ ' + gVar.pswMaxLen + ' ' + lg.get("IDS_CHECKPW_LENGTHU");
	}
	PWDFormatError = lg.get("IDS_CHECKPW_Format");
	var confrimDialog = '<div class="confirm_prompt"><div>\n' +
	'<div class="confirm_str">'+lg.get("IDS_MUTIPLEXING_WARNING")+'</div></div>' +
	'<div class="btn_box">\n' +
	'<input type="button" class="btn" id="confirmUserBtn" value='+lg.get("IDS_OK")+' />\n' +
	'<input type="button" class="btn" id="cancelUserBtn" value='+lg.get("IDS_CANCEL")+' />' +
	'</div></div>';
	function FillRights(index){
		var rights;
		if (index == -1) {
			rights = AuthorityCfg["AuthorityList"];
		}else {
			rights = groupCfg.Groups[index].AuthorityList;
		}
		var c = 0;
		var d = 0;
		$("#SystemUserAuth").empty();
		$('#Monitor_List').empty();
		$('#Playback_List').empty();
		var tip = lg.get("IDS_CFG_ALL");
		var managementNum = 0;
		var MonitorNum = 0;
		var ReplayNum = 0;
		for(var k = 0; k < rights.length;k++){
			var a = rights[k];
			if(a.search("Monitor") == -1 && a.search("Replay") == -1){
				managementNum++;
			}
			else if(a.search("Monitor") != -1){
				MonitorNum++;
			}
			else if(a.search("Replay") != -1){
				ReplayNum++;		
			}
		}
		if(managementNum > 0){
			$("<span><input id='UserAuth_all' type='checkbox' onclick='AllAuthCallBack()'><label for='UserAuth_all'>"
			+tip+"</label></span>").appendTo($("#SystemUserAuth"));
		}
		if(!bIPC){
			if(MonitorNum > 0){
				$("<span><input id='Monitor_all' type='checkbox' onclick='MonitorAllCallBack()'><label for='Monitor_all'>"
				+tip+"</label></span>").appendTo($("#Monitor_List"));
			}
			if(ReplayNum > 0){
				$("<span><input id='Playback_all' type='checkbox' onclick='PlaybackAllCallBack()'><label for='Playback_all'>"
				+tip+"</label></span>").appendTo($("#Playback_List"));
			}
		}
		for(var k = 0; k < rights.length;k++){
			var a = rights[k];
			if(a.search("IOT_Alarm") != -1){
				var b = lg.get("IOTAlarm");
				if(b.search("undefined") != -1) b = a;
				$("<span><input id='userList"+(k+1)+"' type='checkbox' onclick='UserAuthCallBack()'>"
				+ "<label for='userList"+(k+1)+"'>"+b+"</label></span>").appendTo($("#SystemUserAuth"));
			}else if(a.search("Monitor") == -1 && a.search("Replay") == -1 ){
				var b = lg.get("IDS_AUTH_" + a);
				if(b.search("undefined") != -1) b = a;
				$("<span><input id='userList"+(k+1)+"' type='checkbox' onclick='UserAuthCallBack()'>"
				+ "<label for='userList"+(k+1)+"'>"+b+"</label></span>").appendTo($("#SystemUserAuth"));
				managementNum++;
			}else if(a.search("Monitor") != -1){
				tip = lg.get("IDS_AUTH_Monitor");
				if(!bIPC){
					var nIndex = a.indexOf("_") + 1;
					c = a.substring(nIndex);
					tip = (c * 1).toString();
				}
				var optHtml = "<span><input id='userList"+(k+1)+"' type='checkbox' onclick='MonitorCallBack()'>"
				+"<label for='userList"+(k+1)+"'>"+tip+"</label></span>";
				if(bIPC){
					$("#SystemUserAuth").append(optHtml);
				}else{
					$('#Monitor_List').append(optHtml);
				}
				MonitorNum++;
			}
			else if(a.search("Replay") != -1){
				tip = lg.get("IDS_AUTH_Replay");
				if(!bIPC){
					var nIndex = a.indexOf("_") + 1;
					d = a.substring(nIndex);
					tip = (d * 1).toString();
				}
				var optHtml = "<span><input id='userList"+(k+1)+"' type='checkbox' onclick='PlaybackCallBack()'><label for='userList"
				+(k+1)+"'>"+tip+"</label></span>";
				if(bIPC){
					$("#SystemUserAuth").append(optHtml);
				}else{
					$('#Playback_List').append(optHtml);
				}
				ReplayNum++;		
			}
		}
		
	}
	function showData(){
		nSelUser = -1;
		var userList = userCfg.Users;
		var table = $("#AccountTable")[0];
		var nClearRow = table.rows.length;
		for (var n = 0; n < nClearRow; ++n) {
			table.deleteRow(0);
		}
		for (var i=0; i < userList.length; i++) {
			var tr = table.insertRow(i);
			tr.classList.add("CustomAccountClass");
			$(tr).attr("d", "not-active");
			var td1 = tr.insertCell(0);
			var td2 = tr.insertCell(1);
			var td3 = tr.insertCell(2);
			td1.innerHTML = i+1;
			td2.innerHTML = toHtmlEncode(userList[i].Name);
			td3.innerHTML = toHtmlEncode(userList[i].Group);
		}
		var nHeadPadding = 0;
		var nHeight = $("#AccountList .table-responsive").height()-$("#AccountList .table-head").height();
		if(userList.length * 30 > nHeight){
			nHeadPadding = TableRightPadding;
		}
		$("#AccountList .table-head").css("padding-right", nHeadPadding+"px");
		
		//表格支持单选行
		$(".CustomAccountClass").click(function(){			
			nSelUser = $(this)[0].rowIndex;
			$(".CustomAccountClass").attr("d", "not-active");
			$(this).attr("d", "active");
		});
		bHaveAdmin=false;
		bHavaAccount=false;
		for(var i=0;i<userCfg.Users.length;i++){
			if(userCfg.Users[i].Name=="admin"){
				bHaveAdmin=true;
				break;
			}
		}
		for(var i=0;i<userCfg.Users.length;i++){
			for(var j=0;j<userCfg.Users[i].AuthorityList.length;j++){
				if(userCfg.Users[i].AuthorityList[j]=="Account"){
					bHaveAccount=true;
				}
			}
			if(bHaveAccount){
				break;
			}
		}
		if(GetFunAbility(gDevice.Ability.OtherFunction.SupportPWDSafety)&&bHaveAdmin&&gDevice.username=="admin")
		{
			$("#USSecurity").css("display","");
		}
		else if(GetFunAbility(gDevice.Ability.OtherFunction.SupportPWDSafety)&&!bHaveAdmin&&bHaveAccount)
		{
			$("#USSecurity").css("display","");
		}
		else
		{
			$("#USSecurity").css("display","none");
		}
		MasklayerHide();
	}

	function AllAuthClick(){
		var i = $("#UserAuth_all").prop("checked");
		$("#SystemUserAuth input").prop("checked", i);
	}

	function UserAuthEventClick(){
		var rightsNum = 0;
		$("#SystemUserAuth input[id!='UserAuth_all']").each(function(){
			if($(this).prop("checked")){
				rightsNum++;
			}
		})

		if(rightsNum == $("#SystemUserAuth").find("input").length - 1){
			$("#UserAuth_all").prop("checked", true);
		}else{
			$("#UserAuth_all").prop("checked", false);
		}
	}

	function MonitorAllClick(){
		var i = $("#Monitor_all").prop("checked");
		$("#Monitor_List input").prop("checked", i);
	}
	function MonitorEventClick(){
		var rightsNum = 0;
		$("#Monitor_List input[id != 'Monitor_all']").each(function(){
			if($(this).prop("checked")){
				rightsNum++;
			}
		});

		if(rightsNum == $("#Monitor_List").find("input").length - 1){
			$("#Monitor_all").prop("checked", true);
		}else{
			$("#Monitor_all").prop("checked", false);
		}
	}
	function PlaybackAllClick(){
		var i = $("#Playback_all").prop("checked");
		$("#Playback_List input").prop("checked", i);
	}
	function PlaybackEventClick(){
		var rightsNum = 0;
		$("#Playback_List input[id!='Playback_all']").each(function(){
			if($(this).prop("checked")){
				rightsNum++;
			}
		});

		if(rightsNum == $("#Playback_List").find("input").length - 1){
			$("#Playback_all").prop("checked", true);
		}else{
			$("#Playback_all").prop("checked", false);
		}
	}
	function UpdateGroup(){
		FillRights(-1);
		if(g_bAdd){
			$(".check-btn-box").find("input").prop("checked", true);
		}else{
			var b = $('#GroupNameList').val() * 1;
			var rights = AuthorityCfg["AuthorityList"]
			for (var i = 0; i < rights.length; i++) {
				var temp = "#userList" + (i + 1).toString();	
				var c = CheckRight(rights[i], b, 1);
				$(temp).prop("checked", c);
			}
			UserAuthEventClick();
			PlaybackEventClick();
			MonitorEventClick();
		}
	}
	function HasUser(name, callback) {
		var Cfg = userCfg.Users;
		var bHasUser = false;
		for(var i = 0; i < Cfg.length; i++){
			if(Cfg[i].Group == name){
				bHasUser = true;
				break;
			}
		}
		callback(bHasUser);
	}

	function GetUserInfo(){
		var user = {};
		if(!g_bAdd){
			var sel = $("#UserNameList").val() * 1;
			user = cloneObj(userCfg.Users[sel]);
		}
		var newName = $("#UserName").val();

		if(newName == ""){
			ShowPaop(pageTitle, lg.get("IDS_ACC_EmptyName"));
			return -1;
		}
		newName = trim(newName);								// 去掉前后空格
		if(newName == "default"  && gDevice.devType != devTypeEnum.DEV_IPC
		&& (g_bAdd || "default" != user.Name)){
			ShowPaop(pageTitle, lg.get("IDS_ACC_AddUserExist"));
			return -1;
		}
		if(newName[0] == '&'){
			ShowPaop(pageTitle, lg.get("IDS_ACC_ErrorName"));
			return -1;
		}
		var lowerName = newName.toLowerCase();					// 转小写判断
		if(lowerName == "guest" || lowerName == "administrator" 
			|| lowerName == "admin" || lowerName == "root" || lowerName == "system"){
			ShowPaop(pageTitle, lg.get("IDS_ACC_InvalidUserName"));
			return -1;
		}
		var i;
		if((!g_bAdd && newName != user.Name) || g_bAdd){
			for(i = 0; i < userCfg.Users.length; i++){
				if(newName == userCfg.Users[i].Name){
					ShowPaop(pageTitle, lg.get("IDS_ACC_UserNameUse"));
					return -1;
				}
			}
		}
		
		user.Name = newName;
		user.Sharable = $("#Sharable").attr("data") * 1 ? true :false;
		user.Memo = $("#Memo").val();
		var authList = [];
		var a = $('#UserGroup').val() * 1;
		user.Group = groupCfg.Groups[a].Name;
		var cfg = groupCfg.Groups[a].AuthorityList;
		for (i = 0; i < cfg.length; i++) {
			var temp = "#userList" + (i + 1).toString();
			if ($(temp).prop("checked")) {
				authList.push(cfg[i]);
			}
		}
		if (authList.length == 0) {
			ShowPaop(pageTitle, lg.get("IDS_ACC_EmptyAuthority"));
			return -1;
		}
		user.AuthorityList = authList;
		return user;
	}
	
	function GetGroupInfo(){
		var group = {};
		if(!g_bAdd){
			var sel = $("#GroupNameList").val() * 1;
			group = cloneObj(groupCfg.Groups[sel]);
		}
		var newName = $("#GroupName").val();
		if(newName == ""){
			ShowPaop(pageTitle, lg.get("IDS_ACC_EmptyName"));
			return -1;
		}
		if(newName[0] == '&'){
			ShowPaop(pageTitle, lg.get("IDS_ACC_ErrorName"));
			return -1;
		}
		var i;
		if((!g_bAdd && newName != group.Name) || g_bAdd){
			for(i = 0; i < groupCfg.Groups.length; i++){
				if(newName == groupCfg.Groups[i].Name){
					ShowPaop(pageTitle, lg.get("IDS_ACC_GroupExist"));
					return -1;
				}
			}
		}
		
		group.Name = newName;
		group.Memo = $("#Memo2").val();
		var authList = [];
		var rights = AuthorityCfg["AuthorityList"];
		for (i = 0; i < rights.length; i++) {
			var temp = "#userList" + (i + 1).toString();
			if ($(temp).prop("checked")) {
				authList.push(rights[i]);
			}
		}
		if (authList.length == 0) {
			ShowPaop(pageTitle, lg.get("IDS_ACC_EmptyAuthority"));
			return -1;
		}
		group.AuthorityList = authList;
		return group;
	}

	function CheckRight(a, b, c){
		var rights;
		if (c == 0) {
			rights = userCfg.Users[b].AuthorityList;
		}else if (c == 1) {
			rights = groupCfg.Groups[b].AuthorityList;
		}
		var i;
		for(i = 0; i < rights.length; i++){
			if(rights[i] == a) break;
		}
		return i==rights.length?false:true;
	}

	function ModifyPassword(oldPsw, newPsw, callback){
		var user = userCfg.Users[nSelUser];
		var req = {
			"Name": "ModifyPassword",
			"EncryptType": "MD5",
			"UserName" : user.Name,
			"PassWord": user.Password,
			"NewPassWord": MD5_8(newPsw)
		}
		if(gDevice.loginRsp.BuildTime >= "2022-12-28 18:19:47"){
			req.EncryptType="NONE";
			req.NewPassWord=newPsw;
			req.PassWord = oldPsw;
		}
		RfParamCall(function(a,b){
			callback(a,b);
		}, pageTitle, "ModifyPassword", -1, WSMsgID.WSMsgID_MODIFYPASSWORD_REQ,req);
	}

	function ModifyTextPsw(oldname, newPsw, callback){
		var nSel = -1;
		for(var i = 0;i < userCfgEx[userCfgEx.Name].UserNum;i ++){
			if(userCfgEx[userCfgEx.Name].User[i].Name == oldname){
				nSel = i;
			}
		}
		var temp = {"Name":oldname};
		temp.Password = encodePassword(newPsw);
		if(nSel < 0){
			userCfgEx[userCfgEx.Name].User.push(temp);
			userCfgEx[userCfgEx.Name].UserNum = userCfgEx[userCfgEx.Name].User.length;
		}else{
			userCfgEx[userCfgEx.Name].User[nSel] = temp;
		}
		RfParamCall(function(a,b){
			callback(a,b);
		}, pageTitle, "System.ExUserMap", -1,  WSMsgID.WsMsgID_CONFIG_SET, userCfgEx);
	}
	function ModifyTextAccount(oldname, callback){
		var nSel = -1;
		for(var i = 0;i < userCfgEx[userCfgEx.Name].UserNum;i ++){
			if(userCfgEx[userCfgEx.Name].User[i].Name == oldname){
				nSel = i;
			}
		}
		if(nSel < 0){
			var newPsw = $("#PWD").val();
			var temp = {"Name":oldname};
			temp.Password = encodePassword(newPsw);
			userCfgEx[userCfgEx.Name].User.push(temp);
			userCfgEx[userCfgEx.Name].UserNum = userCfgEx[userCfgEx.Name].User.length;
		}else{
			userCfgEx[userCfgEx.Name].User[nSel].Name = oldname;
		}
		RfParamCall(function(a,b){
			callback(a,b);
		}, pageTitle, "System.ExUserMap", -1, WSMsgID.WsMsgID_CONFIG_SET, userCfgEx);
	}
	function LoadConfig(flag) {
		RfParamCall(function(a,b){
			userCfg = a;
			RfParamCall(function(a, b){
				groupCfg = a;
				RfParamCall(function(a, b){
					AuthorityCfg = a;
					if(GetFunAbility(gDevice.Ability.OtherFunction.SupportTextPassword)){
						RfParamCall(function(a,b){
							if(a.Ret == 100){
								userCfgEx = a;
							}else{
								userCfgEx = null;
							}
							showData();
							if(flag){
								$("#USSecurity").click();
							}
						}, pageTitle, "System.ExUserMap", -1, WSMsgID.WsMsgID_CONFIG_GET);
					}else{
						showData();
						if(flag){
							$("#USSecurity").click();
						}
					}
				}, "", "GetFullAuthoritylist", -1, WSMsgID.WSMsgID_FULLAUTHORITYLIST_GET);
			}, pageTitle, "GetAllGroup", -1, WSMsgID.WSMsgID_GROUPS_GET);
		}, pageTitle, "GetAllUser", -1, WSMsgID.WSMsgID_USERS_GET);
	}
    $(function () {
		bRf = true;
		var contentH = $("#AccountList .table-responsive").height()-$("#AccountList .table-head").height();
		$("#AccountList .table-content").css("height", contentH+'px');

		$("#UserName").keyup(function () {
			var realValue = checkSpecialCharacter($(this).val());
			$(this).val(realValue);
		});
		$("#GroupName").keyup(function () {
			var realValue = checkSpecialCharacter($(this).val());
			$(this).val(realValue);
		});
		$("#UserName").prop("maxlength", gVar.userNameLen);
		$("#PWD, #ConPWD, #ModOldPWD, #ModPWD, #ModConPWD").prop("maxlength", gVar.pswMaxLen);
		if(bIPC){
			$("#PlaybackTab, #MonitorTab").css("display", "none");
		}

		ChangeBtnState();

		AllAuthCallBack = AllAuthClick;
		UserAuthCallBack = UserAuthEventClick;
		MonitorAllCallBack = MonitorAllClick;
		MonitorCallBack = MonitorEventClick;
		PlaybackAllCallBack = PlaybackAllClick;
		PlaybackCallBack = PlaybackEventClick;

		$("#USUsRf").click(function () {
			bRf = true;
			LoadConfig();
		});
		$("#USSecurity").click(function (){
			MasklayerShow();
			gVar.LoadChildConfigPage("security");
		});
		$(".tabItem").click(function(){
			$(".tabItem").removeClass("tabs-activeItem");
			$(this).addClass("tabs-activeItem");
			var id = $(this).attr("id");
			$(".check-btn-box").css("display", "none");
			if(id == "UserAuthTab"){
				$("#SystemUserAuth").css("display", "");
			}else if(id == "PlaybackTab"){
				$("#Playback_List").css("display", "");
			}else if(id == "MonitorTab"){
				$("#Monitor_List").css("display", "");
			}
		});
		$("#addUser").unbind().click(function (){
			g_bAdd = true;
			g_bOpUser = true;
			g_bOpGroup = false;
			$("#add_modify_page").css("display", "");
			$("#delete_page, #modify_pwd_page, #ModPWDBtn, #ModBtn, #Confirm_Del").css("display", "none");
			$("#UserInfoDiv").css("display", "");
			$("#GroupInfoDiv").css("display", "none");
			$("#add_user_group #Title").text(lg.get("IDS_ACC_AddUser"));
			$("#AddBtn, #PWDBox").css("display", "");
			$("#UserNameListDiv, #ModBtn, #strengthDiv").css("display", "none");
			$("#UserName, #PWD, #ConPWD, #Memo").val("");
			$("#Sharable").attr("data", 1);
			$("#UserName, #UserGroup, #Memo, #Sharable").prop("disabled", false);
			var cfg = groupCfg.Groups;
			$("#UserGroup").empty();
			for (var i = 0; i < cfg.length; i++) {
				$("#UserGroup").append('<option value="' + i + '">' + cfg[i].Name + '</option>');
			}
	
			$("#UserGroup").val(0);
			$("#UserGroup").change();
			if(!bIPC){
				var bActiveItem = false;
				$(".tabItem").each(function() {
					if ($(this).hasClass("tabs-activeItem")) {
						bActiveItem = true;
						return false;
					}
				});
				if(!bActiveItem){
					$(".tabItem")[0].click();
				}
			}else{
				$("#UserAuthTab").click();
			}
			InitButton();
			$("#add_user_group").css("width", "700px");
			$("#add_user_group .btn_box").css("padding-left", "175px");
			SetWndTop("#add_user_group");
			MasklayerShow(1);
			$("#add_user_group").show(function(){
				if(gDevice.devType == devTypeEnum.DEV_IPC){
					$("#Sharable").prop("disabled",true);
					$("#Sharable").fadeTo("fast", 0.6);
				}
			});
		});
		$("#addGroup").unbind().click(function (){
			g_bAdd = true;
			g_bOpUser = false;
			g_bOpGroup = true;
			$("#add_modify_page").css("display", "");
			$("#delete_page, #modify_pwd_page, #ModPWDBtn, #ModBtn, #Confirm_Del").css("display", "none");
			$("#UserInfoDiv").css("display", "none");
			$("#GroupInfoDiv").css("display", "");
			$("#add_user_group #Title").text(lg.get("IDS_ACC_AddGroup"));
			$("#AddBtn").css("display", "");
			$("#GroupNameListDiv, #ModBtn").css("display", "none");
			$("#GroupName, #Memo2").val("");
			
			UpdateGroup();
			if(!bIPC){
				var bActiveItem = false;
				$(".tabItem").each(function() {
					if ($(this).hasClass("tabs-activeItem")) {
						bActiveItem = true;
						return false;
					}
				});
				if(!bActiveItem){
					$(".tabItem")[0].click();
				}
			}else{
				$("#UserAuthTab").click();
			}
			
			$("#add_user_group").css("width", "700px");
			$("#add_user_group .btn_box").css("padding-left", "175px");
			SetWndTop("#add_user_group");
			MasklayerShow(1);
			$("#add_user_group").show();
		});
		$("#modUser").unbind().click(function (){
			if (nSelUser == -1) return;
			g_bAdd = false;
			g_bOpGroup = false;
			g_bOpUser = true;
			$("#add_modify_page").css("display", "");
			$("#delete_page, #modify_pwd_page, #ModBtn,#ModPWDBtn, #Confirm_Del").css("display", "none");
			$("#UserInfoDiv").css("display", "");
			$("#GroupInfoDiv").css("display", "none");
			$("#add_user_group #Title").text(lg.get("IDS_ACC_ModifyUser"));
			$("#AddBtn, #PWDBox").css("display", "none");
			$("#UserNameListDiv, #ModBtn").css("display", "");
			var i;
			var UsersList = userCfg.Users;
			$("#UserNameList").empty();
			for (i = 0; i < UsersList.length; i++) {
				$("#UserNameList").append('<option value="' + i + '">'+ UsersList[i].Name +'</option>');
			}
			var cfg = groupCfg.Groups;
			$("#UserGroup").empty();
			for (i = 0; i < cfg.length; i++) {
				$("#UserGroup").append('<option value="' + i + '">' + cfg[i].Name + '</option>');
			}
			$("#UserNameList").val(nSelUser);
			$("#UserNameList").change();
			$("#add_user_group").css("width", "700px");
			$("#add_user_group .btn_box").css("padding-left", "175px");
			SetWndTop("#add_user_group");
			MasklayerShow(1);
			$("#add_user_group").show(function(){
				if(gDevice.devType == devTypeEnum.DEV_IPC){
					$("#Sharable").prop("disabled",true);
					$("#Sharable").fadeTo("fast", 0.6);
				}
			});
		});
		$("#UserNameList").change(function(){
			var sel = $(this).val() * 1;
			var curUser = userCfg.Users[sel];
			$("#Memo").val(curUser.Memo);
			$("#UserName").val(curUser.Name);
			$("#Sharable").attr("data", curUser.Sharable * 1);
			var cfg = groupCfg.Groups;
			for (i = 0; i < cfg.length; i++) {
				if(cfg[i].Name == curUser.Group){
					$("#UserGroup").val(i);
					break;
				}
			}
			if(curUser.Name == "admin"){
				$("#UserName, #UserGroup, #Memo, #Sharable").prop("disabled", true);
			}else if(curUser.Name == "default" && gDevice.devType != devTypeEnum.DEV_IPC){
				$("#UserName, #UserGroup").prop("disabled", true);
				$("#Memo, #Sharable").prop("disabled", false);
			}else{
				$("#UserName, #UserGroup, #Memo, #Sharable").prop("disabled", false);
			}
			InitButton();
			$("#UserGroup").change();
		});
		$("#UserGroup").change(function(){
			var sel = $(this).val() * 1;
			FillRights(sel);
			$(".check-btn-box").find("input").prop("disabled", false);
			if(g_bAdd){
				$(".check-btn-box").find("input").prop("checked", true);
			}else{
				if($('#UserNameList').find("option:selected").text() == "admin"){
					$(".check-btn-box").find("input").prop("disabled", true);
				}
			}
			if(!g_bAdd){
				var b = $('#UserNameList').val() * 1;
				if(userCfg.Users[b].AuthorityList == null){
					ShowPaop(pageTitle, lg.get("IDS_ACC_EmptyAuthority"));
					return;
				}
				var len = groupCfg.Groups[sel].AuthorityList.length;
				for (var i = 0; i < len; i++) {
					var temp = "#userList" + (i + 1).toString();	
					var c = CheckRight(groupCfg.Groups[sel].AuthorityList[i], b, 0);
					$(temp).prop("checked", c);
				}
				UserAuthEventClick();
				PlaybackEventClick();
				MonitorEventClick();
			}
		});
		$("#modGroup").unbind().click(function(){
			g_bAdd = false;
			g_bOpGroup = true;
			g_bOpUser = false;
			$("#add_modify_page").css("display", "");
			$("#delete_page, #modify_pwd_page, #ModBtn, #Confirm_Del").css("display", "none");
			$("#UserInfoDiv").css("display", "none");
			$("#GroupInfoDiv").css("display", "");
			$("#add_user_group #Title").text(lg.get("IDS_ACC_ModifyGroup"));
			$("#AddBtn").css("display", "none");
			$("#GroupNameListDiv, #ModBtn").css("display", "");
		
			var i;
			var GroupList = groupCfg.Groups;
			$("#GroupNameList").empty();
			for (i = 0; i < GroupList.length; i++) {
				$("#GroupNameList").append('<option value="' + i + '">'+ GroupList[i].Name +'</option>');
			}
			
			$("#GroupNameList").val(0);
			$("#GroupNameList").change();
		
			$("#add_user_group").css("width", "700px");
			$("#add_user_group .btn_box").css("padding-left", "175px");
			SetWndTop("#add_user_group");
			MasklayerShow(1);
			$("#add_user_group").show();
		});
		$("#GroupNameList").change(function(){
			var sel = $(this).val() * 1;
			var curGroup = groupCfg.Groups[sel];
			$("#Memo2").val(curGroup.Memo);
			$("#GroupName").val(curGroup.Name);
			UpdateGroup();
		});
		
		$("#AddBtn").unbind().click(function(){
			if (g_bOpUser) {
				var user = GetUserInfo();
				if(user == -1){
					return;
				}
				var newPsw = $("#PWD").val();
				var confirmPsw = $("#ConPWD").val();
				var nPswLen = newPsw.length;
				
				// 新增用户密码不能为空
				if(newPsw == "")
				{
					ShowPaop(pageTitle, lg.get("IDS_NO_PASSWORD"));
					$("#PWD").focus().select();
					return;
				}

				if (newPsw != confirmPsw) {
					ShowPaop(pageTitle, lg.get("IDS_ACC_PwdDiffrent"));
					$("#PWD").focus().select();
					return;
				}
				PwdStrength = CheckPasswordStrength(newPsw);
				if(PwdStrength == PASSWORD_STRENTH.DANGER && !bIPC){
					ShowPaop(pageTitle, lg.get("IDS_PWD_DANGER_STRENGTH"));
					return;
				}

				if (gVar.pswMinLen > nPswLen || nPswLen > gVar.pswMaxLen ){	
					ShowPaop(pageTitle, PWDInvalid);
					$("#PWD").focus().select();
					return;
				}
				// if(!CheckPwdFormat(newPsw)){
				// 	ShowPaop(pageTitle, PWDFormatError);
				// 	$("#PWD").focus().select();
				// 	return;
				// }
				user.Password = MD5_8(newPsw);
				user.Reserved = false;
				var req = {"Name": "AddUser","EncryptType": "MD5","User":user};
				if(gDevice.loginRsp.BuildTime >= "2022-12-28 18:19:47"){
					req.EncryptType="NONE";
					req.User.Password=newPsw;
				}
				function func(){
					RfParamCall(function(a, b){
						if(GetFunAbility(gDevice.Ability.OtherFunction.SupportTextPassword) && (isObject(userCfgEx))){
							ModifyTextAccount(user.Name, function(a,b){
								if(a.Ret == 100){
									ShowPaop(pageTitle, lg.get("IDS_ACC_AddUserSuc"));
									closeDialog();
									bRf = false;
									LoadConfig();
								}
							});
						}else{
							ShowPaop(pageTitle, lg.get("IDS_ACC_AddUserSuc"));
							closeDialog();
							bRf = false;
							LoadConfig();
						}
					}, pageTitle, "AddUser", -1, WSMsgID.WSMsgID_ADDUSER_REQ, req);
				}
				if(user.Sharable){
					$("#add_user_group").hide();
					func();
				}else{
					$("#add_user_group").hide();
					RenderSencondShow(lg.get("IDS_ALARM_PROMPT"),confrimDialog,'Tips_Content',true);
					$("#confirmUserBtn").unbind().click(function(){
						$("#SecondaryContent").hide();
						$("#add_user_group").hide();
						func();
					})
					$("#cancelUserBtn").unbind().click(function(){
						$("#SecondaryContent").hide();
						$("#add_user_group").show();
					})
				}
			}
			if (g_bOpGroup) {
				var group = GetGroupInfo();
				if(group == -1){
					return;
				}
				
				var req = {"Name":"AddGroup", "Group":group};
				RfParamCall(function(a, b){
					ShowPaop(pageTitle, lg.get("IDS_ACC_AddGroupSuc"));
					closeDialog();
					bRf = false;
					LoadConfig();
				}, pageTitle, "AddGroup", -1, WSMsgID.WSMsgID_ADDGROUP_REQ, req);
			}
		});
		$("#ModBtn").unbind().click(function(){
			if (g_bOpUser) {
				var sel = $("#UserNameList").val() * 1;
				var UsersList = userCfg.Users
				if(UsersList[sel].Reserved || UsersList[sel].Name == "admin"){
					ShowPaop(pageTitle, lg.get("IDS_ACC_TryModifyResvUser"));
					return;
				}
				var user = GetUserInfo();
				if(user == -1){
					return;
				}
				var req = {
					"Name" : "ModifyUser",
					"User" : user,
					"UserName" : userCfg.Users[sel].Name,
				}
				var newName = user.Name;
				function func(){
					RfParamCall(function(a, b){
						if (a.Ret == 100 && UsersList[sel].Name == gDevice.username && newName != gDevice.username) {
							ShowPaop(pageTitle, lg.get("IDS_ACC_ModifyCurUserSuc"));
							window.setTimeout(function() {
								closewnd(1);
							}, 2000)
							return ;
						}
						if(GetFunAbility(gDevice.Ability.OtherFunction.SupportTextPassword) && (isObject(userCfgEx))){
							ModifyTextAccount(userCfg.Users[sel].Name, function(a,b){
								if(a.Ret == 100){
									ShowPaop(pageTitle, lg.get("IDS_ACC_ModifyUserSuc"));
									bRf = false;
									LoadConfig();
								}
							});
						}else{
							ShowPaop(pageTitle, lg.get("IDS_ACC_ModifyUserSuc"));
							bRf = false;
							LoadConfig();
						}
					}, pageTitle, "ModifyUser", -1, WSMsgID.WSMsgID_MODIFYUSER_REQ, req);
				}
				if(user.Sharable || (newName == "default" && gDevice.devType != devTypeEnum.DEV_IPC)){
					$("#add_user_group").hide();
					func();
				}else{
					$("#add_user_group").hide();
					RenderSencondShow(lg.get("IDS_ALARM_PROMPT"),confrimDialog,'Tips_Content',true);
					$("#confirmUserBtn").unbind().click(function(){
						$("#SecondaryContent").hide();
						$("#add_user_group").hide();
						func();
					})
					$("#cancelUserBtn").unbind().click(function(){
						$("#SecondaryContent").hide();
						$("#add_user_group").show();
					})
				}
			} else if (g_bOpGroup) {
				var group = GetGroupInfo();
				if (group == -1) {
					return;
				}
				var userlist = userCfg.Users;
				var group_user_list = new Array();
				var a = true;
				for (var i = 0; i < userlist.length; i++) {
					if (userlist[i].Group == group.Name) {
						group_user_list.push(userlist[i]);
					}
				}
				for (var i = 0; i < group_user_list.length; i++) {
					for (var n = 0; n < group_user_list[i].AuthorityList.length; n++) {
						if (group.AuthorityList.indexOf(group_user_list[i].AuthorityList[n]) == -1) {
							ShowPaop(pageTitle, lg.get("IDS_ACC_AuthorHasBeenUsed"));
							a = false;
							break;
						}
					}
					if(a==false)
					{
						break;
					}
				}
				if (a) {
					var sel = $("#GroupNameList").val() * 1;
					var req = {
						"Name": "ModifyGroup",
						"Group": group,
						"GroupName": groupCfg.Groups[sel].Name
					}
					closeDialog();
					RfParamCall(function (a, b) {
						if (a.Ret == 100) {
							ShowPaop(pageTitle, lg.get("IDS_ACC_ModifyGroupSuc"));
							bRf = false;
							LoadConfig();
						}
					}, pageTitle, "ModifyGroup", -1, WSMsgID.WSMsgID_MODIFYGROUP_REQ, req);
				}

			}
		});
		$("#modPwd").unbind().click(function (){
			if (nSelUser == -1) return;
			$("#add_user_group #Title").text(lg.get("IDS_ACC_ModifyPW"));
			$("#modify_pwd_page, #ModPWDBtn").css("display", "");
			$("#add_modify_page, #delete_page, #ModBtn, #AddBtn, #Confirm_Del").css("display", "none");
			
			$("#ModPWD_strengthDiv").css("display", "none");
			$("#ModOldPWD, #ModPWD, #ModConPWD").val("");
			var UsersList = userCfg.Users;
			$("#PWDUserNameList").val(UsersList[nSelUser].Name);
			$("#PWDUserNameList").prop("disabled", true);
	
			$("#add_user_group").css("width", "580px");
			$("#add_user_group .btn_box").css("padding-left", "175px");
			SetWndTop("#add_user_group", 60);			
			MasklayerShow(1);
			$("#add_user_group").show();
		});
		$("#ModPWDBtn").unbind().click(function(){
			var user = userCfg.Users[nSelUser];
			var oldPsw = $("#ModOldPWD").val();
			var newPsw = $("#ModPWD").val();
			var confirmPsw = $("#ModConPWD").val();
			var nPswLen = newPsw.length;
			if(newPsw == "")
			{
				ShowPaop(pageTitle, lg.get("IDS_NO_PASSWORD"));
				return;
			}
			if (newPsw != confirmPsw) {
				ShowPaop(pageTitle, lg.get("IDS_ACC_PwdDiffrent"));
				$("#ModPWD").focus().select();
				return;
			}
			PwdStrength = CheckPasswordStrength(newPsw);
			if(PwdStrength == PASSWORD_STRENTH.DANGER){
				ShowPaop(pageTitle, lg.get("IDS_PWD_DANGER_STRENGTH"));
				return;
			}

			if (gVar.pswMinLen > nPswLen || nPswLen > gVar.pswMaxLen) {	
				ShowPaop(pageTitle, PWDInvalid);
				$("#PWD").focus().select();
				return;
			}
			// if(!CheckPwdFormat(newPsw)){
			// 	ShowPaop(pageTitle, PWDFormatError);
			// 	$("#PWD").focus().select();
			// 	return;
			// }
			ModifyPassword(oldPsw, newPsw, function(a,b){
				if(GetFunAbility(gDevice.Ability.OtherFunction.SupportTextPassword) && (isObject(userCfgEx))){
					ModifyTextPsw(user.Name, newPsw, function(a,b){
						if(a.Ret == 100){
							if(user.Name == gDevice.username){
								gDevice.password = newPsw;
							}
							ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
							closeDialog();
							bRf = false;
							var flag;
							if (bHaveAdmin && gDevice.username == "admin") {
								flag=true;
							}
							else if (!bHaveAdmin && bHaveAccount) {
								flag=true;
							}
							else {
								flag=false;
							}
							LoadConfig(flag);
						}
					});
				}else{
					if(user.Name == gDevice.username){
						gDevice.password = newPsw;
					}
					ShowPaop(pageTitle, lg.get("IDS_SAVE_SUCCESS"));
					closeDialog();
					bRf = false;
					var flag;
					if (bHaveAdmin && gDevice.username == "admin") {
						flag=true;
					}
					else if (!bHaveAdmin && bHaveAccount) {
						flag=true;
					}
					else {
						flag=false;
					}
					LoadConfig(flag);
				}
			});
		});
		$("#delUser").unbind().click(function(){
			if (nSelUser == -1) return;
			g_bOpUser = true;
			g_bOpGroup = false;
			
			$("#delete_page, #Confirm_Del").css("display", "");
			$("#add_modify_page, #modify_pwd_page, #ModBtn, #AddBtn, #ModPWDBtn").css("display", "none");
			$("#DeleteUser").css("display", "");
			$("#DeleteGroup").css("display", "none");
			$("#add_user_group #Title").text(lg.get("IDS_ACC_DeleteUser"));
			
			$("#add_user_group").css("width", "456px");
			$("#add_user_group .btn_box").css("padding-left", "100px");
			SetWndTop("#add_user_group", 80);
			MasklayerShow(1);
			$("#add_user_group").show();
		});
		$("#delGroup").unbind().click(function(){
			g_bOpUser = false;
			g_bOpGroup = true;
			$("#delete_page, #Confirm_Del").css("display", "");
			$("#add_modify_page, #modify_pwd_page, #ModBtn, #AddBtn, #ModPWDBtn").css("display", "none");
			$("#DeleteUser").css("display", "none");
			$("#DeleteGroup").css("display", "");
			$("#add_user_group #Title").text(lg.get("IDS_ACC_DeleteGroup"));
		
			var GroupList = groupCfg.Groups;
			$("#DelGroupList").empty();
			for (var i = 0; i < GroupList.length; i++) {
				$("#DelGroupList").append('<option value="' + i + '">'+ GroupList[i].Name +'</option>');
			}
			
			$("#DelGroupList").val(0);
			$("#DelGroupList").change();
			
			$("#add_user_group").css("width", "456px");
			$("#add_user_group .btn_box").css("padding-left", "100px");
			SetWndTop("#add_user_group", 80);
			MasklayerShow(1);
			$("#add_user_group").show();
		});
		$("#DelGroupList").change(function(){
			var sel = $(this).val() * 1;
			var curGroup = groupCfg.Groups[sel];
			$("#DelMemo").val(curGroup.Memo);
			$("#DelGroupName").val(curGroup.Name);
		});
		$("#Confirm_Del").unbind().click(function(){
			if (g_bOpUser) {
				var user = userCfg.Users[nSelUser];
				if (user.Reserved || (user.Name == "default" && gDevice.devType != devTypeEnum.DEV_IPC)){
					ShowPaop(pageTitle, lg.get("IDS_ACC_TryDeleteResvUser"));
					closeDialog();
					return;
				}
				closeDialog();
				var req = {"Name": "DeleteUser","User" :{"Name": user.Name}};
				RfParamCall(function(a,b){
					ShowPaop(pageTitle, lg.get("IDS_ACC_DeleteUserSuc"));
					bRf = false;
					LoadConfig();
				}, pageTitle, user.Name, -1, WSMsgID.WSMsgID_DELETEUSER_REQ, req);
			
			}else if (g_bOpGroup) {
				var nSelGroup = $("#DelGroupList").val() * 1;
				var group = groupCfg.Groups[nSelGroup];
				HasUser(group.Name, function(a){
					if(a){
						ShowPaop(pageTitle, lg.get("IDS_ACC_DelGroupInUse"));
					}else{
						var req = {"Name": "DeleteGroup","Group": {"Name": group.Name}};
						RfParamCall(function(a,b){
							ShowPaop(pageTitle, lg.get("IDS_ACC_DeleteGroupSuc"));
							bRf = false;
							LoadConfig();
						}, pageTitle, group.Name, -1, WSMsgID.WSMsgID_DELETEGROUP_REQ,req);
					}
				});
				closeDialog();
			}
		});
		$("#PWD, #ModPWD").keyup(function () {
			PwdStrength = 0;
			var value = $(this).val();
			var id = $(this).attr("id");
			var objDiv;
			if(id == "PWD"){
				objDiv = "#strengthDiv";
			}else if(id == "ModPWD"){
				objDiv = "#ModPWD_strengthDiv";
			}
			if (value.length > 0) {
				$(objDiv).css("display", "block");
				CPswStrength($(this).prop("value"));
				PwdStrength = CheckPasswordStrength($(this).prop("value"));
			} else {
				$(objDiv).css("display", "none");
			}
		});
		LoadConfig();
	});
});