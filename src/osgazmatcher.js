
/**
 * @fileoverview Class that retrieves autocomplete matches from OSGaz
 * geocoder service.
 *
 * @author petr.pridal@klokantech.com (Petr Pridal)
 *
 * Copyright 2011 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('goog.ui.AutoComplete.OSGazMatcher');

goog.require('goog.Disposable');
goog.require('goog.Timer');
goog.require('goog.Uri');
goog.require('goog.events');
goog.require('goog.json');
goog.require('goog.net.Jsonp');
goog.require('goog.ui.AutoComplete');



/**
 * An array matcher that requests matches via JSONP.
 * @param {string=} opt_url The Uri of the web service.
 * @param {Object.<string, string>=} opt_payload The list of extra parameters
     for the Jsonp request.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.ui.AutoComplete.OSGazMatcher = function(opt_url, opt_payload) {

  /**
   * The url of the OSGaz instance
   * @type {string}
   * @private
   */
  this.url_ = opt_url || 'http://geotest.nls.uk/gazetteer/json.cfm';

  /**
   * The list of extra parameters for the Jsonp request
   * @type {Object}
   * @private
   */
  this.payload_ = opt_payload || {};

  /**
   * The Jsonp object used for making remote requests.  When a new request
   * is made, the current one is aborted and the new one sent instead.
   * @type {goog.net.Jsonp}
   * @private
   */
  this.jsonp_ = new goog.net.Jsonp(this.url_, 'callback');
};
goog.inherits(goog.ui.AutoComplete.OSGazMatcher, goog.Disposable);


/**
 * Retrieve a set of matching rows from the server via JSONP and convert them
 * into rich rows.
 * @param {string} token The text that should be matched; passed to the server
 *     as the 'token' query param.
 * @param {number} maxMatches The maximum number of matches requested from the
 *     server; passed as the 'max_matches' query param.  The server is
 *     responsible for limiting the number of matches that are returned.
 * @param {Function} matchHandler Callback to execute on the result after
 *     matching.
 */
goog.ui.AutoComplete.OSGazMatcher.prototype.requestMatchingRows =
    function(token, maxMatches, matchHandler) {

  this.payload_['q'] = token;
  // this.payload_['limit'] = maxMatches;

  // Ignore token which is empty or just one letter
  if (!token || token.length == 1) {
    matchHandler(token, []);
    return;
  }

  // After direct request cancel autocomplete
  // if (maxMatches == 1) this.oldtoken_ = token;
  // if (maxMatches > 1 && token === this.oldtoken_) return;

  // Cancel old request when we have a new one
  if (this.request_ !== null) this.jsonp_.cancel(this.request_);

  this.request_ = this.jsonp_.send(this.payload_, function(e) {

    // window['console']['log'](e);

    // If there is one or more "place" then return only these
    var places = e['DATA'];

    if (places.length > 0) {
      // Fix the "display_name"
      goog.array.forEach(places, function(r) {
        r['lon'] = r[0];
        r['lat'] = r[1];
        r['easting'] = r[3];
        r['northing'] = r[4];
        r['display_name'] = r[2];
      });
      // TODO: Sort places: the cities, towns, and other populated places
      // first - order by their area (calculated from bounxing box).
      // Test: "London", "Paris", "Prague" - should return what you expect
// console.log(places);
      matchHandler(token, places);
    }
  });
};
