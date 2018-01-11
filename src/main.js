
/**
 * @fileoverview The main application for NLS Gazetteer.
 *
 * @author petr.pridal@klokantech.com (Petr Pridal)
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 * Copyright 2018 Klokan Technologies Gmbh (www.klokantech.com)
 */

goog.provide('nlsgaz');

goog.require('countyparish');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');


/**
 * The main application for the NLS Gazetteer.
 * @param {Function} callback
 */
nlsgaz = function(callback) {
  // Initialize County & Parish
  var county = goog.dom.getElement('county');
  var BBOX_MAX = [180, 90, -180, -90];
  var bbox;
  var parish = goog.dom.getElement('parish');
  var parish_span = goog.dom.getElement('parish_span');
  parish_span.style.display = 'none';

  goog.dom.appendChild(county,
    goog.dom.createDom('option', { 'value': '' },
          goog.dom.createTextNode('Choose...')
                  ));

  var last = '';
  goog.array.forEach(countyparish, function(r) {
    if (last == r[0]) return;
    last = r[0];
    var option = goog.dom.createDom('option', {
        'value': last
      },
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
      goog.dom.createDom('option', { 'value': '' },
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
          Math.max(bbox[3], r[5])
        ];
        var option = goog.dom.createDom('option', {
            'value': [r[2], r[3], r[4], r[5]]
          },
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

  var ac = new goog.global['kt']['OsmNamesAutocomplete'](
      'nlsgaz', 'https://nlsgaz.klokantech.com/');
  ac['registerCallback'](function(item) {
    var bnds = item['boundingbox'];
    if (bnds[0] > bnds[2]) {
      bnds[0] -= 360;
    }
    callback(bnds[0], bnds[1], bnds[2], bnds[3], item);
  });

  var areas = document.querySelectorAll('input[name="nlsgazarea"]');
  goog.array.forEach(areas, function(el) {
    goog.events.listen(el, goog.events.EventType.CLICK, function(e) {
      var code = el.value;
      if (code == 'uk') {
        code = 'gb';
      }
      ac['setCountryCode'](code);
    });
  });

  var selected = document.querySelector('input[name="nlsgazarea"]:checked');
  var code = selected.value;
  if (code == 'uk') {
    code = 'gb';
  }
  ac['setCountryCode'](code);
};
window['nlsgaz'] = nlsgaz;
