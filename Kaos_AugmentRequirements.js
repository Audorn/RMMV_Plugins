//=============================================================================
// Kaos - AugmentRequirements
// Kaos_AugmentRequirements.js
//=============================================================================

var Imported = Imported || {};
Imported.Kaos_AugmentRequirements = true;

var Kaos = Kaos || {};
Kaos.Augment = Kaos.Augment || {};

//=============================================================================
 /*:
 * @plugindesc v1.0 Allows specification of requirements for augments, and
 * the ability to grant tags to whatever they attach to.
 * @author Audorn
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin is designed to streamline the process of allowing augments of
 * the same slot type to have different requirement tags which must be present
 * on an independent item for them to attach successfully.  A rejection string
 * will be displayed in the item's description window if the player attempts to
 * attach an augment when the requirement tag(s) are not present on the target
 * item.  Augments can also be set to grant tags to the item they are attached
 * to through notetags.
 *
 * YEP_X_AttachAugments.js, YEP_X_EquipCustomize, all their pre-requisites, and
 * NeMV_Tags.js are required for this plugin to work.  Place this plugin under
 * all three of the above named plugins in the plugin manager.
 *
 * ============================================================================
 * Usage - Notetags
 * ============================================================================
 * YEP_X_AttachAugments & NeMV_Tags pre-requisites ----------------------------
 *
 * An item must be declared an augment type and the target item/weapon/armor it
 * can be attached to must have one or more slots declared for that type.  The
 * valid notetags for these declarations can easily be found in
 * YEP_X_AttachAugments.js.
 *
 * The target item/weapon/armor that the augment will attach to must then have
 * the required tag declared via the valid notetag found in NeMV_Tag.js.
 *
 * Example:
 * Augment Item Notetag ->
 * <Augment: Gun Software>
 *  AGI: +5%
 * </Augment: Gun Software>
 *
 * Target Item Notetag ->
 * <Augment Slots>
 *  Gun Software
 * </Augment Slots>
 * <Tags: canFullAuto>
 *
 * See either respective *.js file for more help on this step if needed.
 *
 * Requirements ---------------------------------------------------------------
 *
 * Once the augment and target item/weapon/armor are properly declared, it is
 * time to set the augment to look for the required tag(s).  Multiple entries
 * can be separated by whitespace or commas, but all requirements must be met
 * for the augment to successfully attach.  These are not case sensitive.
 *
 * Examples:
 * Augment Item Notetag ->
 * <Augment Requires Tags: canFullAuto>
 *  ... or ...
 * <Augment Requires Tags: canFullAuto, submachinegun>
 *
 * Rejection String -----------------------------------------------------------
 *
 * If the player attempts to attach an agument to a target item/weapon/armor
 * that does not have the tag(s) it requires, a rejection string will display
 * in the window that would normally show the description of the
 * item/weapon/armor in the Equip->Customize description window at the top of
 * the screen (YEP_X_EquipCustomize.js).
 *
 * Only a single rejection string can be specified, and all RMMV text codes,
 * including those from YEP_MessageCore.js if you have it installed, will take
 * effect.
 *
 * Examples:
 * Augment Item Notetag ->
 * <Augment Rejection String: Software Rejected!>
 *  ... or ...
 * <Augment Rejection String: \ii[183]    \C[2]Software Failure:\C[0]  Only
 *  Thompson & Flavell weapons are vulnerable to this software hack.>
 *
 * Results:
 * Software Rejected!
 * ... or ...
 *                               [red            ]
 * [Icon and name of item183]    Software Failure:  Only Thompson & Flavell
 * weapons are vulnerable to this software hack.
 *
 * There is currently no way to specify multiple rejection strings attached to
 * multiple requirements.
 *
 * Granted Tags ---------------------------------------------------------------
 *
 * When an augment with granted tag(s) attaches to an item/weapon/armor, it
 * will add those tags, along with the prefix "aug_", to the item/weapon/armor.
 * When the augment is removed, the tag(s) are removed as well.  Multiple
 * entries can be separated by whitespace or commas and are not case sensitive.
 *
 * Examples:
 * Augment Item Notetag ->
 * <Augment Grants Tags: illegalUFM>
 *  ... or ...
 * <Augment Grants Tags: illegalUFM, hacked>
 *
 * ============================================================================
 * Usage - JavaScript
 * ============================================================================
 * Independent Item Checks ----------------------------------------------------
 *
 * Kaos.Augment.hasTag(item, tag, [returnIndex]);
 *
 * Returns either true (default) or the index of the specified tag if the
 * independent item/weapon/armor has it, returns false if it does not.
 * Although this can be used on non-independent items, I would recommend using
 * Nekoyoubi's [Object].hasTag("plant") instead, from NeMV_Tags.js.
 * An asterisk can be used to do a partial check, e.g. "illegal*".
 *
 * item == The independent item/weapon/armor you wish to check.
 * tag  == The tag you are searching for (remember granted tags are given the
 *         prefix "aug_" so they can be removed easily later, e.g.: "hacked"
 *         would become "aug_hacked".)
 * returnIndex == Optional boolean value (true or false), default false.  When
 *                set to false, the function will return true if the tag is
 *                present, false if it is not.  When set to true, the function
 *                will return the index number of the tag if it is present, and
 *                will still return false if it is not.
 *
 * Examples:
 *  Kaos.Augment.hasTag($gameActors.actor(1).equips()[0], "aug_hacked");
 *   ... or ...
 *  var itemToCheck = $gameActors.actor(3).equips()[3];
 *  var index = Kaos.Augment.hasTag(itemToCheck, "radioactive", true);
 *
 * The second example would return the index of the "radioactive" tag, and
 * setting the variable index to that number.
 *
 * Party Wide Requirement Check -----------------------------------------------
 *
 * Kaos.Augment.partyItemsWithReq(req);
 *  Returns true if any augments are found that contain the specified req.
 *
 * req == The requirement you are checking all your augments for.
 *
 * Example: Kaos.Augment.partyItemsWithReq("canFullAuto");
 *
 * Script Calls to Install or Remove Augments (USE AT YOUR OWN RISK) ----------
 *
 * I managed to put these two functions together that seem to follow the
 * necessary steps to install and remove the augments on command.  I am using
 * them in my own game so that I can use events to add and remove augments, but
 * I don't want to guarantee them yet.
 *
 * Kaos.Augment.installAugmentToSlot(item, effectItem, slotId, [gain]);
 * Kaos.Augment.removeAugmentFromSlot(item, slotId, [gain]);
 *
 * Installs the specified augment to the specified slot on the specified item.
 * This will fail if the augment doesn't meet the requirements, or if the slot
 * types are not set up correctly on either the augment or the target.
 *
 * item       == Target item/weapon/armor with the correct slot type.
 * effectItem == Augment item.
 * slotId     == Slot ID on the item, starts at 0.
 * gain       == Modify whether the augment is consumed on installation, and
 *               how many you get back on removal, defaults to 0, resulting in
 *               one being removed on installation and one being returned on
 *               removal.
 *
 * Examples:
 *  Kaos.Augment.installAugmenttoSlot($gameParty.items()[5],
 *    $gameParty.items()[2], 0);
 *   ... or ...
 *  Kaos.Augment.removeAugmentFromSlot($gameActors.actor(1).equips()[2], 1);
 *
 * Result:
 * Attempts to install the third item in the party inventory into the first
 * slot on the sixth item.
 * ... or ...
 * Remove the augment from the second slot on the first actor's third equipped
 * item.
 *
 * Modifying Requirements, Grants, or the Rejection String --------------------
 *
 * Any of these can be used to check or modify an augment.  They will not work
 * on any weapons or armors, nor any independent items.
 *
 * [object].hasReq(req);
 * [object].removeReq(req);
 * [object].addReq(req);
 * [object].hasGrant(grant);
 * [object].removeGrant(grant);
 * [object].addGrant(grant);
 * [object].removeReject();
 * [object].replaceReject(reject);
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 1.0.0:
 * - initial plugin
 *
 */
//=============================================================================

// INITIALIZATION -------------------------------------------------------------

Kaos.Augment.init = function() {
	if ($dataItems !== null && $dataItems !== undefined) this.processNotetags($dataItems);
};

Kaos.Augment.processNotetags = function(data) {
	var reqsRegex = /<(?:AUGMENT REQUIRES TAGS):[ ](.*)>/i;
	for (var n = 1; n < data.length; n++) {
		var obj = data[n];
		if (obj === null || obj === undefined) continue;
		obj.augmentRequirements = obj.augmentRequirements || [];
		var notelines = obj.note.split(/[\r\n]+/);
		obj.hasReq = function(req) {
			return Kaos.Augment.baseHasReqs(req, this.augmentRequirements);
		};
		obj.removeReq = function(req) {
			var index = this.augmentRequirements.indexOf(req.toUpperCase());
			if (index > -1) this.augmentRequirements.splice(index, 1);
		};
		obj.addReq = function(req) {
			this.removeReq(req.toUpperCase());
			this.augmentRequirements.push(req.toUpperCase());
		};
		for (var i = 0; i < notelines.length; i++) {
			var line = notelines[i];
			lineMatch = line.match(reqsRegex);
			if (lineMatch) {
				var reqData = lineMatch[1].toUpperCase().match(/\w+/gi);
	    		obj.augmentRequirements = obj.augmentRequirements.concat(reqData);
			}
		}
	}
  var grantsRegex = /<(?:AUGMENT GRANTS TAGS):[ ](.*)>/i;
  for (var n = 1; n < data.length; n++) {
    var obj = data[n];
    if (obj === null || obj === undefined) continue;
    obj.augmentGrantedTags = obj.augmentGrantedTags || [];
    var notelines = obj.note.split(/[\r\n]+/);
    obj.hasGrant = function(grant) {
      return Kaos.Augment.baseHasGrants(grant, this.augmentGrantedTags);
    };
    obj.removeGrant = function(grant) {
      var index = this.augmentGrantedTags.indexOf(grant.toUpperCase());
      if (index > -1) this.augmentGrantedTags.splice(index, 1);
    };
    obj.addGrant = function(grant) {
      this.removeGrant(grant.toUpperCase());
      this.augmentGrantedTags.push(grant.toUpperCase());
    };
    for (var i = 0; i < notelines.length; i++) {
      var line = notelines[i];
      lineMatch = line.match(grantsRegex);
      if (lineMatch) {
        var grantData = lineMatch[1].toUpperCase().match(/\w+/gi);
          obj.augmentGrantedTags = obj.augmentGrantedTags.concat(grantData);
      }
    }
  }
  var rejectRegex = /<(?:AUGMENT REJECTION STRING):[ ](.*)>/i;
  for (var n = 1; n < data.length; n++) {
    var obj = data[n];
    if (obj === null || obj === undefined) continue;
    obj.augmentRejectionString = obj.augmentRejectionString || "";
    var notelines = obj.note.split(/[\r\n]+/);
    obj.hasReject = function(reject) {
      return Kaos.Augment.baseHasRejectString(reject, this.augmentRejectionString);
    };
    obj.removeReject = function() {
			this.augmentRejectionString = "";
    };
    obj.replaceReject = function(reject) {
      this.removeReject();
      this.augmentRejectionString = reject;
    };
    for (var i = 0; i < notelines.length; i++) {
      var line = notelines[i];
      lineMatch = line.match(rejectRegex);
      if (lineMatch) {
        var rejectData = lineMatch[1];
          obj.augmentRejectionString = obj.augmentRejectionString.concat(rejectData);
      }
    }
  }
};

// BASE METHODS ---------------------------------------------------------------

Kaos.Augment.baseHasReqs = function(req, reqs) {
	for (var r = 0; r < reqs.length; r++) {
		req = req.toUpperCase();
		var regex = "^"+req+"$";
		if (req.indexOf("*") >= 0) {
			if (req.charAt(0) == "*") {
				regex = req.replace("*","")+"$";
			} else if (req.charAt(req.length-1) == "*") {
				regex = "^"+req.replace("*","");
			} else {
				regex = "^"+req.replace("*","\\w*")+"$";
			}
		}
		var currentReq = reqs[r].toUpperCase();
		var exp = new RegExp(regex, "i");
		if (exp.exec(currentReq) !== null)
			return true;
	}
	return false;
};

Kaos.Augment.baseHasGrants = function(grant, grants) {
	for (var g = 0; g < grants.length; g++) {
		grant = grant.toUpperCase();
		var regex = "^"+grant+"$";
		if (grant.indexOf("*") >= 0) {
			if (grant.charAt(0) == "*") {
				regex = grant.replace("*","")+"$";
			} else if (grant.charAt(grant.length-1) == "*") {
				regex = "^"+grant.replace("*","");
			} else {
				regex = "^"+grant.replace("*","\\w*")+"$";
			}
		}
		var currentGrant = grants[g].toUpperCase();
		var exp = new RegExp(regex, "i");
		if (exp.exec(currentGrant) !== null)
			return true;
	}
	return false;
};

Kaos.Augment.baseHasRejectString = function(reject, rejects) {
	for (var r = 0; r < rejects.length; r++) {
		reject = reject.toUpperCase();
		var regex = "^"+reject+"$";
		if (reject.indexOf("*") >= 0) {
			if (reject.charAt(0) == "*") {
				regex = reject.replace("*","")+"$";
			} else if (reject.charAt(reject.length-1) == "*") {
				regex = "^"+reject.replace("*","");
			} else {
				regex = "^"+reject.replace("*","\\w*")+"$";
			}
		}
		var currentReject = rejects[r].toUpperCase();
		var exp = new RegExp(regex, "i");
		if (exp.exec(currentReject) !== null)
			return true;
	}
	return false;
};

// OVERRIDES ------------------------------------------------------------------

Kaos.Augment.Scene_Boot_terminate = Scene_Boot.prototype.terminate;
Scene_Boot.prototype.terminate = function() {
  Kaos.Augment.Scene_Boot_terminate.call(this);
  Kaos.Augment.init();
};

// OVERRIDE YEP_X_AttachAugments ==============================================
// Learn how to use the above override method to make similar less intrusive
// overrides.

ItemManager.applyAugmentEffects = function(item, effectItem, slotId, gain) {
  if (!item) return;

  // Kaos pre-augment checks --------------------------------------------------
  if (effectItem) {
    var okToInstall = Kaos.Augment.checkRequirements(effectItem, item);
    if (okToInstall) Kaos.Augment.addGrantedTags(item, effectItem);
  }
  // --------------------------------------------------------------------------

  if (okToInstall || !effectItem) {
    gain = gain || 0;
    this.checkAugmentSlots(item);
    if (item.augmentSlotItems[slotId] !== 'none') {
      var augment = this.removeAugmentFromSlot(item, slotId);
      if (augment) $gameParty.gainItem(augment, gain);
    }
    this.installAugmentToSlot(item, effectItem, slotId);
    $gameParty.loseItem(effectItem, gain);
    this.augmentRefreshParty(item);
  }

  // Kaos post-augment rejection display --------------------------------------
  if (!okToInstall) Kaos.Augment.showRejection(effectItem);
  // --------------------------------------------------------------------------
};

ItemManager.removeAugmentFromSlot = function(item, slotId) {

  // Kaos pre-removal checks --------------------------------------------------
  Kaos.Augment.removeGrantedTags(item, this.augmentInSlot(item, slotId));
  // --------------------------------------------------------------------------

  $gameTemp._augmentSetting = 'detach';
  var type = item.augmentSlots[slotId].toUpperCase().trim();
  var augment = this.augmentInSlot(item, slotId);
  if (!augment) {
    $gameTemp._augmentSetting = undefined;
    return augment;
  }
  var list = augment.augmentDataDetach[type];
  if (list && list.length > 0)  {
    this.processAugmentList(item, augment, slotId, list);
  }
  var code = augment.augmentEvalDetach[type];
  this.processAugmentEval(code, item, augment, slotId);
  $gameTemp._augmentSetting = undefined;
  return augment;
};

Scene_Item.prototype.onActionAugment = function() {
    this._itemActionWindow.hide();
    this._itemActionWindow.deactivate();
    this._augmentListWindow.show();
    this._augmentListWindow.activate();
    var slotId = this._itemActionWindow.currentExt();
    this._augmentListWindow.setItem(this.item(), slotId);
    SceneManager._scene._augmentRejectionWindow.hide();
};



// OVERRIDE YEP_X_EquipCustomize ----------------------------------------------

Scene_EquipCustomize.prototype.createItemWindow = function() {
    Scene_Item.prototype.createItemWindow.call(this);
    this._itemWindow._data = [$gameTemp._customizeItem];
    this._itemWindow.select(1);
    this._itemWindow.hide();
    this._augmentRejectionWindow = new Window_AugmentRejection(0,0);
    this.addWindow(this._augmentRejectionWindow);
};

// REJECTION WINDOW -----------------------------------------------------------

function Window_AugmentRejection() {
    this.initialize.apply(this, arguments);
}

Window_AugmentRejection.prototype = Object.create(Window_Base.prototype);
Window_AugmentRejection.prototype.constructor = Window_AugmentRejection;

Window_AugmentRejection.prototype.initialize = function(x, y) {
  var width = Graphics.width;
  var height = SceneManager._scene._helpWindow.height;
  Window_Base.prototype.initialize.call(this, x, y, width, height);
  this.hide();
};

Window_AugmentRejection.prototype.refresh = function() {
    this.contents.clear();
    this.drawTextEx(this._text, this.textPadding(), 0);
};

Window_AugmentRejection.prototype.open = function() {
  this.refresh();
  Window_Base.prototype.open.call(this);
  this._text = "testing.";
}

Window_AugmentRejection.prototype.setText = function(text) {
    if (this._text !== text) {
        this._text = text;
        this.refresh();
    }
};

Window_AugmentRejection.prototype.clear = function() {
    this.setText('');
};

Window_AugmentRejection.prototype.setItem = function(item) {
    this.setText(item ? item.augmentRejectionString : '');
};

// UTILITIES ------------------------------------------------------------------

Kaos.Augment.hasTag = function(item, tag, returnIndex) {
  returnIndex = returnIndex || false;
  var index = 0;
  var itemHasTag = false;
  for (var t = 0; t < item.tags.length; t++) {
		tag = tag.toUpperCase();
		var regex = "^"+tag+"$";
		if (tag.indexOf("*") >= 0) {
			if (tag.charAt(0) == "*") {
				regex = tag.replace("*","")+"$";
			} else if (tag.charAt(tag.length-1) == "*") {
				regex = "^"+tag.replace("*","");
			} else {
				regex = "^"+tag.replace("*","\\w*")+"$";
			}
		}
		var currentTag = item.tags[t].toUpperCase();
		var exp = new RegExp(regex, "i");
		if (exp.exec(currentTag) !== null) {
			itemHasTag = true;
      index = t;
    }
	}
  return (itemHasTag && returnIndex) ? index : itemHasTag;
}

Kaos.Augment.hasGrant = function(item, grant, returnIndex) {
  returnIndex = returnIndex || false;
  var index = 0;
  var itemHasGrant = false;
  for (var g = 0; g < item.augmentGrantedTags.length; g++) {
		grant = grant.toUpperCase();
		var regex = "^"+grant+"$";
		if (grant.indexOf("*") >= 0) {
			if (grant.charAt(0) == "*") {
				regex = grant.replace("*","")+"$";
			} else if (grant.charAt(grant.length-1) == "*") {
				regex = "^"+grant.replace("*","");
			} else {
				regex = "^"+grant.replace("*","\\w*")+"$";
			}
		}
		var currentGrant = item.augmentGrantedTags[g].toUpperCase();
		var exp = new RegExp(regex, "i");
		if (exp.exec(currentGrant) !== null) {
			itemHasGrant = true;
      index = g;
    }
	}
  return (itemHasGrant && returnIndex) ? index : itemHasGrant;
}

Kaos.Augment.addTag = function(item, tag) {
  Kaos.Augment.removeTag(item, tag.toUpperCase());
	item.tags.push(tag.toUpperCase());
}

Kaos.Augment.addGrantedTags = function(item, augment) {
  for (g = 0; g < augment.augmentGrantedTags.length; g++)
    Kaos.Augment.addTag(item, "aug_" + augment.augmentGrantedTags[g]);
}

Kaos.Augment.removeTag = function(item, tag) {
  var index = item.tags.indexOf(tag.toUpperCase());
  if (index > -1) item.tags.splice(index, 1);
}

Kaos.Augment.removeGrantedTags = function(item, augment) {
  var removeTag = true;
  for (g = 0; g < augment.augmentGrantedTags.length; g++) {
    grant = augment.augmentGrantedTags[g];
    for (a = 0; a < item.augmentSlotItems.length; a++) {
      var otherAugment = item.augmentSlotItems[a];
      if (otherAugment != "none" && otherAugment.match(/\d+/) != augment.id) {
        otherAugment = $dataItems[otherAugment.match(/\d+/)];
        if (Kaos.Augment.hasGrant(otherAugment, grant)) removeTag = false;
      }
    }
    if (removeTag) Kaos.Augment.removeTag(item, "aug_" + grant);
  }
}

Kaos.Augment.checkRequirements = function(augment, item) {
  var okToInstall = false;
  var requirement = augment.augmentRequirements;
  if (requirement.length > 0)
    for (var r = 0; r < requirement.length; r++) {
			okToInstall = false;
      for (var t = 0; t < item.tags.length; t++) {
        if (requirement[r] == item.tags[t]) {
					okToInstall = true;
				}
			}
      if (!okToInstall) return false;
    }
  return true;
}

Kaos.Augment.showRejection = function(augment) {
  SceneManager._scene._augmentRejectionWindow.setItem(augment);
  SceneManager._scene._augmentRejectionWindow.show();
}

Kaos.Augment.installAugmentToSlot = function(item, effectItem, slotId, gain) {
  gain = gain || 0;
  ItemManager.applyAugmentEffects(item, effectItem, slotId, gain);
  $gameParty.loseItem(effectItem, 1);
}

Kaos.Augment.removeAugmentFromSlot = function(item, slotId, gain) {
  gain = gain || true;
  Kaos.Augment.removeGrantedTags(item, ItemManager.augmentInSlot(item, slotId));
  var augment = ItemManager.removeAugmentFromSlot(item, slotId);
  if (gain) $gameParty.gainItem(augment, 1);
  item.augmentSlotItems[slotId] = "none";
  return augment;
}

Kaos.Augment.partyItemsWithReq = function(req) {
	if (Imported.YEP_ItemCore) {
		return $gameParty._actors.reduce(function(a,b) {
			return $gameActors.actor(b)._equips.reduce(function(c,d) {
				return c || ((d.object() !== null) ? DataManager.getBaseItem(d.object()).hasReq(req) : false);
			},a);
		}, false) ||
		$gameParty.equipItems().reduce(function(e,f) {
			return e || DataManager.getBaseItem(f).hasReq(req);
		}, false) ||
		$gameParty.items().reduce(function(g,h) {
			return g || DataManager.getBaseItem(h).hasReq(req);
		}, false);
	} else {
		return $gameParty._actors.reduce(function(a,b) {
			return $gameActors.actor(b)._equips.reduce(function(c,d) {
				return c || ((d.object() !== null) ? d.object().hasReq(req) : false);
			},a);
		}, false) ||
		$gameParty.equipItems().reduce(function(e,f) {
			return e || f.hasReq(req);
		}, false) ||
		$gameParty.items().reduce(function(g,h) {
			return g || h.hasReq(req);
		}, false);
	}
};

// ITEM PROTO ----------------------------------------------------------------

Game_Item.prototype.hasReq = function(req) {
	return Kaos.Augment.baseHasReq(req, this.object().reqs);
};

Game_Item.prototype.removeReq = function(req) {
	var index = this.object().reqs.indexOf(req.toUpperCase());
	if (index > -1) this.object().reqs.splice(index, 1);
};

Game_Item.prototype.addReq = function(req) {
	this.object().removeReq(req.toUpperCase());
	this.object().reqs.push(req.toUpperCase());
};

Game_Item.prototype.hasGrant = function(grant) {
	return Kaos.Augment.baseHasGrant(grant, this.object().grants);
};

Game_Item.prototype.removeGrant = function(grant) {
	var index = this.object().grants.indexOf(grant.toUpperCase());
	if (index > -1) this.object().grants.splice(index, 1);
};

Game_Item.prototype.addGrant = function(grant) {
	this.object().removeGrant(grant.toUpperCase());
	this.object().grants.push(grant.toUpperCase());
};

Game_Item.prototype.hasReject = function(reject) {
	return Kaos.Augment.baseHasReject(reject, this.object().rejects);
};

Game_Item.prototype.removeReject = function() {
	this.object().augmentRejectionString = "";
};

Game_Item.prototype.replaceReject = function(reject) {
	this.object().removeReject();
	this.object().augmentRejectionString = reject;
};
