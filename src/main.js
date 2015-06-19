
/**
 * @fileoverview The main application for NLS Gazetteer.
 *
 * @author petr.pridal@klokantech.com (Petr Pridal)
 *
 * Copyright 2015 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('nlsgaz');

goog.require('goog.array');
goog.require('goog.debug.Console');
goog.require('goog.debug.DivConsole');

goog.require('goog.debug.ErrorHandler');

goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.events.EventType');
// goog.require('goog.ui.AutoComplete.OSGaz');
goog.require('goog.ui.ac.AutoComplete.GoogleGeocoder');

goog.require('countyparish');

/**
 * The main application for the NLS Gazetteer.
 */
nlsgaz = function( callback ) {

  // Initialize logger
  // var logger = goog.debug.Logger.getLogger('nlsgaz');
  // var logconsole = new goog.debug.DivConsole(goog.dom.getElement('log'));
  // var logconsole = new goog.debug.Console();
  // logconsole.setCapturing(true);

  // Initialize County & Parish
  var county = goog.dom.getElement('county');
  var BBOX_MAX = [180, 90, -180, -90];
  var bbox;
  var parish = goog.dom.getElement('parish');
  var parish_span = goog.dom.getElement('parish_span');
  parish_span.style.display = 'none';
  
  goog.dom.appendChild(county,
    goog.dom.createDom('option', { 'value':'' },
    goog.dom.createTextNode('Choose...')
  ));

  var last = "";
  goog.array.forEach(countyparish, function(r) {
    if (last == r[0]) return;
    last = r[0];
    var option = goog.dom.createDom('option', {
      'value':last },
      goog.dom.createTextNode(last)
    );
    goog.dom.appendChild(county, option);
  });


  // Listener for "county" select box
  goog.events.listen(county, goog.events.EventType.CHANGE, function(e) {
		if (e.target.value == '') return parish_span.style.display = 'none'; 
		else parish_span.style.display = 'inline';
		goog.dom.removeChildren(parish);
		// Add "Choose..."
		goog.dom.appendChild(parish,
		  goog.dom.createDom('option', { 'value':'' },
		  goog.dom.createTextNode('Choose...')
		));
		// Add all the values...
		bbox = BBOX_MAX;
		goog.array.forEach(countyparish, function(r) {
			if (r[0] == e.target.value) {
				bbox = [
					Math.min(bbox[0], r[2]),
					Math.min(bbox[1], r[3]),
					Math.max(bbox[2], r[4]),
					Math.max(bbox[3], r[5]) ];
				var option = goog.dom.createDom('option', {
				  'value': [r[2],r[3],r[4],r[5]] },
				  goog.dom.createTextNode(r[1])
				);
				goog.dom.appendChild(parish, option);
			}
		});
		// Call the 'callback' function on the selected county bbox
		callback(bbox[0], bbox[1], bbox[2], bbox[3]);
  });

  // Listener for "parish" select box
  goog.events.listen(parish, goog.events.EventType.CHANGE, function(e) {
		if (e.target.value == '') return callback(bbox[0], bbox[1], bbox[2], bbox[3]);
		var b = goog.array.map(e.target.value.split(','), parseFloat);
		// Call the 'callback' function on the selected parish bbox
		callback(b[0], b[1], b[2], b[3]);
  });


  // Initialize gazeteer search
  var input = goog.dom.getElement('nlsgaz');
  var ac = new goog.ui.ac.AutoComplete.GoogleGeocoder(input);

goog.events.listen(ac, goog.ui.ac.AutoComplete.EventType.UPDATE, function(e) {
    var bounds = e.row['geometry']['viewport'] // ['bounds'];
    // logger.info('SELECT: ' + bounds);
    callback(bounds.getSouthWest().lng(),
		bounds.getSouthWest().lat(),
		bounds.getNorthEast().lng(),
		bounds.getNorthEast().lat());
  });

  var ngrid = /^([A-Z]{2})([0-9]+)$/i;
  goog.events.listen(goog.dom.getElement('nlsgazform'),
      goog.events.EventType.SUBMIT, function(e) {
        e.preventDefault();
        // logger.info('DIRECT: ' + input.value);
        // test for the National Grid Reference
        var m = input.value.replace(/\s/g,'').match(ngrid);
        if (m !== null) {
	        // logger.info('NGRID: ' + m[1].toUpperCase()+m[2]);
	        callback(m[1].toUpperCase()+m[2]);
		} else 
	        ac.search(input.value, 1, function(token, result) {
	          if (result.length > 0) {
		          var bounds = result[0]['geometry']['viewport']; // ['bounds'];
	            // logger.info(bounds);
	            callback(bounds.getSouthWest().lng(),
					bounds.getSouthWest().lat(),
					bounds.getNorthEast().lng(),
					bounds.getNorthEast().lat());
	          }
	        });
      });

};

window['nlsgaz'] = nlsgaz;
