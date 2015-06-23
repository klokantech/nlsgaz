
/**
 * @fileoverview A class to use the V3 google.maps.Geocoder for autocomplete
 *
 * More info:
 * http://code.google.com/apis/maps/documentation/javascript/services.html
 *
 * @author petr.pridal@klokantech.com (Petr Pridal)
 *
 * Copyright 2011 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('goog.ui.ac.AutoComplete.GoogleGeocoder');

goog.require('goog.net.Jsonp');
goog.require('goog.userAgent');
goog.require('goog.ui.ac.AutoComplete');
//goog.require('goog.ui.ac.AutoComplete.Basic');
goog.require('goog.ui.ac.InputHandler');
goog.require('goog.ui.ac.Renderer');



/**
 * Factory class to create a rich autocomplete widget that autocompletes an
 * inputbox or textarea from data provided via ajax.  The server returns a
 * complex data structure that is used with client-side javascript functions to
 * render the results.
 * @param {Element} input Input element or text area.
 * @constructor
 * @extends {goog.ui.ac.AutoComplete}
 */
goog.ui.ac.AutoComplete.GoogleGeocoder = function(input) {

  // Create a custom renderer that renders rich rows returned from server.
  var customRenderer = {};
  customRenderer.renderRow = function(row, token, node) {
    node.innerHTML = row.data['formatted_address']; // + ' (' + row.data['types'].toString() + ')';
    /* render:
    goog.dom.appendChild(node, goog.dom.createTextNode(
      row.data['display_name']));
    goog.dom.appendChild(node, goog.dom.createDom("span", "ac-type",
        goog.dom.createTextNode(row.data['type'])));
    */
  };

  /**
   * A standard renderer that uses a custom row renderer to display the
   * rich rows generated by this autocomplete widget.
   * @type {goog.ui.ac.Renderer}
   * @private
   */
  var renderer = new goog.ui.ac.Renderer(null, customRenderer);
  this.renderer_ = renderer;

  /**
   * A remote matcher that parses rich results returned via JSONP from a server.
   * @private
   */
  var geocoder = new google.maps.Geocoder();
  var ngrid = /^([A-Z]{2})([0-9]+)$/i;
  var matcher = {};
  matcher.requestMatchingRows = function(token, maxMatches, matchCallback) {
    
    // After direct request cancel autocomplete
    if (maxMatches == 1) this.oldtoken_ = token;
    if (maxMatches > 1 && token === this.oldtoken_) return matchCallback(token, []);
    if (token.length < 3) return matchCallback(token, []);

    // HACK!!! NLS: If it is national grid then do not autocomplete
    if (token.replace(/\s/g,'').match(ngrid) !== null) return matchCallback(token, []);
   //NLS: Search in UK or World
   var nlsgazarea = document.querySelector('input[name="nlsgazarea"]:checked');
   if(nlsgazarea){
     var area = ', ' + nlsgazarea.value;
   }
    geocoder.geocode( { 'address': token + area }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        matchCallback(token, results);
      }
    });
  };
  this.matcher_ = matcher;

  /**
   * An input handler that calls select on a row when it is selected.
   * @type {goog.ui.ac.InputHandler}
   * @private
   */
  var inputhandler = new goog.ui.ac.InputHandler(null, null, false);

  inputhandler.setThrottleTime(300);
  inputhandler.setUpdateDuringTyping(false);
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher(8)) {
    // we don't want autocomplete in IE < 8
  } else inputhandler.attachAutoComplete(this);
  inputhandler.attachInputs(input);

  // Create the widget and connect it to the input handler.
  goog.ui.ac.AutoComplete.call(this, matcher, renderer, inputhandler);

goog.events.listen(this, goog.ui.ac.AutoComplete.EventType.UPDATE, function(e) {
    input.value = e.row['formatted_address'];
  });

};
goog.inherits(goog.ui.ac.AutoComplete.GoogleGeocoder, goog.ui.ac.AutoComplete);


/**
 * Calls matchHandler on a set of matching rows retrieved from server.
 * @param {string} token The text that should be matched; passed to the server
 *     as the 'token' query param.
 * @param {number} maxMatches The maximum number of matches requested from the
 *     server; passed as the 'max_matches' query param.  The server is
 *     responsible for limiting the number of matches that are returned.
 * @param {Function} matchHandler Callback to execute on the result after
 *     matching.
 */
goog.ui.ac.AutoComplete.GoogleGeocoder.prototype.search =
    function(token, maxMatches, matchHandler) {
  this.matcher_.requestMatchingRows(token, maxMatches, matchHandler);
};