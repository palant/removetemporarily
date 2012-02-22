/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

let InspectorObserver =
{
  init: function()
  {
    Services.obs.addObserver(this, "inspector-opened", true);
    onShutdown.add((function() Services.obs.removeObserver(this, "inspector-opened")).bind(this));
  },

  get inspectorButton()
  {
    // Randomize URI to work around bug 719376
    let stringBundle = Services.strings.createBundle("chrome://removetemporarily/locale/global.properties?" + Math.random());
    let result = [stringBundle.GetStringFromName("inspector.button.label"), stringBundle.GetStringFromName("inspector.button.accesskey"), stringBundle.GetStringFromName("inspector.button.tooltiptext")];

    delete this.inspectorButton;
    this.__defineGetter__("inspectorButton", function() result);
    return this.inspectorButton;
  },

  observe: function(subject, topic, data)
  {
    if (topic != "inspector-opened")
      return;

    let InspectorUI = subject.wrappedJSObject;

    let [label, accesskey, tooltiptext] = this.inspectorButton;
    let tool = {
      id: "remove-temporarily",
      label: label,
      accesskey: accesskey,
      tooltiptext: tooltiptext,
      get isOpen() false,
      show: function(selection)
      {
        if (selection && selection.parentNode && selection.parentNode.nodeType == Ci.nsIDOMNode.ELEMENT_NODE)
        {
          let parent = selection.parentNode;
          InspectorUI.highlighter.highlight(parent);
          parent.removeChild(selection);
        }
        InspectorUI.toolHide(tool);
      },
      hide: function() {}
    };
    InspectorUI.registerTool(tool);
  },

  QueryInterface: XPCOMUtils.generateQI([Ci.nsISupportsWeakReference, Ci.nsIObserver])
};

InspectorObserver.init();
