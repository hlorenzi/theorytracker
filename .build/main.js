/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/prefs.ts":
/*!**********************!*\
  !*** ./src/prefs.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   makeNew: () => (/* binding */ makeNew)
/* harmony export */ });
function makeNew() {
  return {
    timeline: {
      bkgColor: "#202225",
      bkgAlternateMeasureColor: "#1a1c1f",
      bkgInactiveOverlayColor: "#0008",
      trackVBorderColor: "#888",
      trackHBorderColor: "#888",
      selectionCursorColor: "#0af",
      selectionBkgColor: "#8cf8",
      playbackCursorColor: "#f00",
      trackSeparatorColor: "#aaa",
      measureColor: "#040404",
      submeasureColor: "#080808",
      halfSubmeasureColor: "#181818",
      measureLabelColor: "#aaa",
      octaveLabelColor: "#aaa",
      meterChangeColor: "#0cf",
      keyChangeColor: "#f0c",
      noteVelocityMarkerColor: "#0c4",
      noteVelocityMarkerInactiveColor: "#063",
      keyPan: " ",
      keyPencil: "a",
      keySelectMultiple: "control",
      keySelectRange: "shift",
      keySelectRect: "shift",
      keySelectClone: "alt",
      keyDisplaceCursor2: "shift",
      keyDisplaceFast: "control",
      keyDisplaceChromatically: "shift",
      keyDisplaceStretch: "shift",
      mouseDoubleClickThresholdMs: 300,
      mouseDragXLockedDistance: 10,
      mouseDragYLockedDistance: 10,
      mouseEdgeScrollThreshold: 10,
      mouseEdgeScrollSpeed: 1
    }
  };
}

/***/ }),

/***/ "./src/project/elem.ts":
/*!*****************************!*\
  !*** ./src/project/elem.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DefaultChordVolumeDb: () => (/* binding */ DefaultChordVolumeDb),
/* harmony export */   DefaultVolumeDb: () => (/* binding */ DefaultVolumeDb),
/* harmony export */   MaxVolumeDb: () => (/* binding */ MaxVolumeDb),
/* harmony export */   MinVolumeDb: () => (/* binding */ MinVolumeDb),
/* harmony export */   elemModify: () => (/* binding */ elemModify),
/* harmony export */   makeChord: () => (/* binding */ makeChord),
/* harmony export */   makeKeyChange: () => (/* binding */ makeKeyChange),
/* harmony export */   makeMeterChange: () => (/* binding */ makeMeterChange),
/* harmony export */   makeNote: () => (/* binding */ makeNote),
/* harmony export */   makeTrackChords: () => (/* binding */ makeTrackChords),
/* harmony export */   makeTrackKeyChanges: () => (/* binding */ makeTrackKeyChanges),
/* harmony export */   makeTrackMeterChanges: () => (/* binding */ makeTrackMeterChanges),
/* harmony export */   makeTrackNotes: () => (/* binding */ makeTrackNotes),
/* harmony export */   trackDisplayName: () => (/* binding */ trackDisplayName)
/* harmony export */ });
/* harmony import */ var _utils_range_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/range.ts */ "./src/utils/range.ts");

const MinVolumeDb = -30;
const MaxVolumeDb = 0;
const DefaultVolumeDb = 0;
const DefaultChordVolumeDb = -4;
function elemModify(original, changes) {
  return {
    ...original,
    ...changes
  };
}
function makeTrackNotes() {
  return {
    type: "track",
    trackType: "notes",
    id: -1,
    parentId: 0,
    range: _utils_range_ts__WEBPACK_IMPORTED_MODULE_0__["default"].dummy(),
    name: "",
    mute: false,
    solo: false
  };
}
function makeTrackChords() {
  return {
    type: "track",
    trackType: "chords",
    id: -1,
    parentId: 0,
    range: _utils_range_ts__WEBPACK_IMPORTED_MODULE_0__["default"].dummy(),
    name: "Chords",
    mute: false,
    solo: false
  };
}
function trackDisplayName(track) {
  if (track.name) return track.name;
  return "New Track";
}
function makeTrackKeyChanges() {
  return {
    type: "track",
    trackType: "keyChanges",
    id: -1,
    parentId: 0,
    range: _utils_range_ts__WEBPACK_IMPORTED_MODULE_0__["default"].dummy(),
    name: "Key Changes"
  };
}
function makeTrackMeterChanges() {
  return {
    type: "track",
    trackType: "meterChanges",
    id: -1,
    parentId: 0,
    range: _utils_range_ts__WEBPACK_IMPORTED_MODULE_0__["default"].dummy(),
    name: "Meter Changes"
  };
}
function makeMeterChange(parentId, time, meter) {
  return {
    type: "meterChange",
    id: -1,
    parentId,
    range: _utils_range_ts__WEBPACK_IMPORTED_MODULE_0__["default"].fromPoint(time),
    meter
  };
}
function makeKeyChange(parentId, time, key) {
  return {
    type: "keyChange",
    id: -1,
    parentId,
    range: _utils_range_ts__WEBPACK_IMPORTED_MODULE_0__["default"].fromPoint(time),
    key
  };
}
function makeNote(parentId, range, midiPitch) {
  return {
    type: "note",
    id: -1,
    parentId,
    range,
    midiPitch
  };
}
function makeChord(parentId, range, chord) {
  return {
    type: "chord",
    id: -1,
    parentId,
    range,
    chord
  };
}

/***/ }),

/***/ "./src/project/index.ts":
/*!******************************!*\
  !*** ./src/project/index.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DefaultChordVolumeDb: () => (/* reexport safe */ _elem__WEBPACK_IMPORTED_MODULE_2__.DefaultChordVolumeDb),
/* harmony export */   DefaultVolumeDb: () => (/* reexport safe */ _elem__WEBPACK_IMPORTED_MODULE_2__.DefaultVolumeDb),
/* harmony export */   MAX_RATIONAL_DENOMINATOR: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.MAX_RATIONAL_DENOMINATOR),
/* harmony export */   MaxVolumeDb: () => (/* reexport safe */ _elem__WEBPACK_IMPORTED_MODULE_2__.MaxVolumeDb),
/* harmony export */   MinVolumeDb: () => (/* reexport safe */ _elem__WEBPACK_IMPORTED_MODULE_2__.MinVolumeDb),
/* harmony export */   cloneElem: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.cloneElem),
/* harmony export */   defaultKey: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.defaultKey),
/* harmony export */   defaultMeter: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.defaultMeter),
/* harmony export */   elemModify: () => (/* reexport safe */ _elem__WEBPACK_IMPORTED_MODULE_2__.elemModify),
/* harmony export */   ensureMeasureCacheRefreshed: () => (/* reexport safe */ _measures__WEBPACK_IMPORTED_MODULE_1__.ensureMeasureCacheRefreshed),
/* harmony export */   getAbsoluteRange: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.getAbsoluteRange),
/* harmony export */   getAbsoluteTime: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.getAbsoluteTime),
/* harmony export */   getElem: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.getElem),
/* harmony export */   getMillisecondsAt: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.getMillisecondsAt),
/* harmony export */   getRangeForElems: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.getRangeForElems),
/* harmony export */   getRelativeRange: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.getRelativeRange),
/* harmony export */   getRelativeTime: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.getRelativeTime),
/* harmony export */   getTrack: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.getTrack),
/* harmony export */   iterMeasuresAtRange: () => (/* reexport safe */ _measures__WEBPACK_IMPORTED_MODULE_1__.iterMeasuresAtRange),
/* harmony export */   keyAt: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.keyAt),
/* harmony export */   keyChangeTrackId: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.keyChangeTrackId),
/* harmony export */   makeChord: () => (/* reexport safe */ _elem__WEBPACK_IMPORTED_MODULE_2__.makeChord),
/* harmony export */   makeEmpty: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.makeEmpty),
/* harmony export */   makeKeyChange: () => (/* reexport safe */ _elem__WEBPACK_IMPORTED_MODULE_2__.makeKeyChange),
/* harmony export */   makeMeterChange: () => (/* reexport safe */ _elem__WEBPACK_IMPORTED_MODULE_2__.makeMeterChange),
/* harmony export */   makeNew: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.makeNew),
/* harmony export */   makeNote: () => (/* reexport safe */ _elem__WEBPACK_IMPORTED_MODULE_2__.makeNote),
/* harmony export */   makeTest: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.makeTest),
/* harmony export */   makeTrackChords: () => (/* reexport safe */ _elem__WEBPACK_IMPORTED_MODULE_2__.makeTrackChords),
/* harmony export */   makeTrackKeyChanges: () => (/* reexport safe */ _elem__WEBPACK_IMPORTED_MODULE_2__.makeTrackKeyChanges),
/* harmony export */   makeTrackMeterChanges: () => (/* reexport safe */ _elem__WEBPACK_IMPORTED_MODULE_2__.makeTrackMeterChanges),
/* harmony export */   makeTrackNotes: () => (/* reexport safe */ _elem__WEBPACK_IMPORTED_MODULE_2__.makeTrackNotes),
/* harmony export */   meterAt: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.meterAt),
/* harmony export */   meterChangeAt: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.meterChangeAt),
/* harmony export */   meterChangeTrackId: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.meterChangeTrackId),
/* harmony export */   parentTrackFor: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.parentTrackFor),
/* harmony export */   splitElem: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.splitElem),
/* harmony export */   trackDisplayName: () => (/* reexport safe */ _elem__WEBPACK_IMPORTED_MODULE_2__.trackDisplayName),
/* harmony export */   upsertElement: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.upsertElement),
/* harmony export */   upsertTrack: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.upsertTrack),
/* harmony export */   withRefreshedRange: () => (/* reexport safe */ _root__WEBPACK_IMPORTED_MODULE_0__.withRefreshedRange)
/* harmony export */ });
/* harmony import */ var _root__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./root */ "./src/project/root.ts");
/* harmony import */ var _measures__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./measures */ "./src/project/measures.ts");
/* harmony import */ var _elem__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./elem */ "./src/project/elem.ts");
//export * from "./_global"



//export * from "./midiImport"
//export * from "./midiExport"
//export * from "./jsonExport"
//export * from "./jsonImport"

/***/ }),

/***/ "./src/project/measures.ts":
/*!*********************************!*\
  !*** ./src/project/measures.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ensureMeasureCacheRefreshed: () => (/* binding */ ensureMeasureCacheRefreshed),
/* harmony export */   iterMeasuresAtRange: () => (/* binding */ iterMeasuresAtRange)
/* harmony export */ });
/* harmony import */ var _index_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.ts */ "./src/project/index.ts");
/* harmony import */ var _utils_binarySearch_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/binarySearch.ts */ "./src/utils/binarySearch.ts");


let measureCacheKey = null;
let measureCache = [];
let firstMeterCh = null;
let lastMeterCh = null;
function ensureMeasureCacheRefreshed(project) {
  const meterChangeTrackId = _index_ts__WEBPACK_IMPORTED_MODULE_0__.meterChangeTrackId(project);
  const meterChangeList = project.lists.get(meterChangeTrackId);
  if (meterChangeList === measureCacheKey) return;
  measureCacheKey = meterChangeList;
  measureCache = [];
  if (!meterChangeList) return;
  let num = 0;
  for (const [elem1, elem2] of meterChangeList.iterAllPairwise()) {
    if (!elem1) firstMeterCh = elem2;
    if (!elem2) lastMeterCh = elem1;
    if (!elem1 || !elem2) continue;
    const meterCh1 = elem1;
    const meterCh2 = elem2;
    let numLocal = 0;
    for (const [measureN, measureD, time1, time2] of meterCh1.meter.iterMeasuresPairwise(meterCh1.range.start)) {
      if (meterCh2 && time1.compare(meterCh2.range.start) >= 0) break;
      measureCache.push({
        num,
        numLocal,
        time1,
        time2: time2.min(meterCh2 ? meterCh2.range.start : time2),
        meterCh: meterCh1
      });
      num++;
      numLocal++;
    }
  }
}
function* iterMeasuresAtRange(project, range) {
  ensureMeasureCacheRefreshed(project);
  const measureStart = _utils_binarySearch_ts__WEBPACK_IMPORTED_MODULE_1__["default"].findPreviousOrEqual(measureCache, m => range.start.compare(m.time1));
  if (measureStart === null && firstMeterCh) {
    let time = firstMeterCh.range.start;
    let num = 0;
    while (time.compare(range.start) > 0) {
      time = time.subtract(firstMeterCh.meter.fullCycleDuration);
      num--;
    }
    while (time.compare(firstMeterCh.range.start) < 0) {
      const time2 = time.add(firstMeterCh.meter.fullCycleDuration);
      if (time2.compare(range.start) >= 0) {
        yield {
          meterCh: firstMeterCh,
          num,
          numLocal: num,
          time1: time,
          time2
        };
      }
      time = time2;
      num++;
    }
  }
  let lastMeasureNum = -1;
  let measureIndex = measureStart ?? 0;
  while (true) {
    if (measureIndex >= measureCache.length) break;
    const measure = measureCache[measureIndex];
    if (measure.time1.compare(range.end) >= 0) break;
    yield measure;
    lastMeasureNum = measure.num;
    measureIndex++;
  }
  if (lastMeterCh) {
    let num = lastMeasureNum + 1;
    let time = lastMeterCh.range.start;
    while (time.compare(range.end) < 0) {
      const time2 = time.add(lastMeterCh.meter.fullCycleDuration);
      if (time2.compare(range.start) >= 0) {
        yield {
          meterCh: lastMeterCh,
          num,
          numLocal: num,
          time1: time,
          time2
        };
      }
      time = time2;
      num++;
    }
  }
}

/***/ }),

/***/ "./src/project/root.ts":
/*!*****************************!*\
  !*** ./src/project/root.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MAX_RATIONAL_DENOMINATOR: () => (/* binding */ MAX_RATIONAL_DENOMINATOR),
/* harmony export */   cloneElem: () => (/* binding */ cloneElem),
/* harmony export */   defaultKey: () => (/* binding */ defaultKey),
/* harmony export */   defaultMeter: () => (/* binding */ defaultMeter),
/* harmony export */   getAbsoluteRange: () => (/* binding */ getAbsoluteRange),
/* harmony export */   getAbsoluteTime: () => (/* binding */ getAbsoluteTime),
/* harmony export */   getElem: () => (/* binding */ getElem),
/* harmony export */   getMillisecondsAt: () => (/* binding */ getMillisecondsAt),
/* harmony export */   getRangeForElems: () => (/* binding */ getRangeForElems),
/* harmony export */   getRelativeRange: () => (/* binding */ getRelativeRange),
/* harmony export */   getRelativeTime: () => (/* binding */ getRelativeTime),
/* harmony export */   getTrack: () => (/* binding */ getTrack),
/* harmony export */   keyAt: () => (/* binding */ keyAt),
/* harmony export */   keyChangeTrackId: () => (/* binding */ keyChangeTrackId),
/* harmony export */   makeEmpty: () => (/* binding */ makeEmpty),
/* harmony export */   makeNew: () => (/* binding */ makeNew),
/* harmony export */   makeTest: () => (/* binding */ makeTest),
/* harmony export */   meterAt: () => (/* binding */ meterAt),
/* harmony export */   meterChangeAt: () => (/* binding */ meterChangeAt),
/* harmony export */   meterChangeTrackId: () => (/* binding */ meterChangeTrackId),
/* harmony export */   parentTrackFor: () => (/* binding */ parentTrackFor),
/* harmony export */   splitElem: () => (/* binding */ splitElem),
/* harmony export */   upsertElement: () => (/* binding */ upsertElement),
/* harmony export */   upsertTrack: () => (/* binding */ upsertTrack),
/* harmony export */   withRefreshedRange: () => (/* binding */ withRefreshedRange)
/* harmony export */ });
/* harmony import */ var immutable__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! immutable */ "./node_modules/immutable/dist/immutable.es.js");
/* harmony import */ var _index_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.ts */ "./src/project/index.ts");
/* harmony import */ var _theory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../theory */ "./src/theory/index.ts");
/* harmony import */ var _utils_range_ts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/range.ts */ "./src/utils/range.ts");
/* harmony import */ var _utils_rational_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/rational.ts */ "./src/utils/rational.ts");
/* harmony import */ var _utils_listOfRanges_ts__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/listOfRanges.ts */ "./src/utils/listOfRanges.ts");







// Least Common Multiple of 2, 3, 4, 5, 6, 7, 8, 9, and 10.
const MAX_RATIONAL_DENOMINATOR = 2520;
function makeEmpty() {
  return {
    nextId: 1,
    range: new _utils_range_ts__WEBPACK_IMPORTED_MODULE_2__["default"](new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_3__["default"](0), new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_3__["default"](4)),
    baseBpm: 120,
    tracks: [],
    lists: immutable__WEBPACK_IMPORTED_MODULE_5__["default"].Map(),
    elems: immutable__WEBPACK_IMPORTED_MODULE_5__["default"].Map(),
    keyChangeTrackId: -1,
    meterChangeTrackId: -1,
    chordTrackId: -1,
    noteTrackId: -1
  };
}
function makeNew() {
  let project = makeEmpty();
  const track1Id = project.nextId;
  project.keyChangeTrackId = track1Id;
  project = upsertTrack(project, _index_ts__WEBPACK_IMPORTED_MODULE_0__.makeTrackKeyChanges());
  const track2Id = project.nextId;
  project.meterChangeTrackId = track2Id;
  project = upsertTrack(project, _index_ts__WEBPACK_IMPORTED_MODULE_0__.makeTrackMeterChanges());
  project = upsertElement(project, _index_ts__WEBPACK_IMPORTED_MODULE_0__.makeKeyChange(track1Id, new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_3__["default"](0), _theory__WEBPACK_IMPORTED_MODULE_1__.Key.parse("C Major")));
  project = upsertElement(project, _index_ts__WEBPACK_IMPORTED_MODULE_0__.makeMeterChange(track2Id, new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_3__["default"](0), new _theory__WEBPACK_IMPORTED_MODULE_1__.Meter(4, 4)));
  const track3Id = project.nextId;
  project.chordTrackId = track3Id;
  project = upsertTrack(project, _index_ts__WEBPACK_IMPORTED_MODULE_0__.makeTrackChords());
  const track4Id = project.nextId;
  project.noteTrackId = track4Id;
  project = upsertTrack(project, _index_ts__WEBPACK_IMPORTED_MODULE_0__.makeTrackNotes());
  return project;
}
function makeTest() {
  let project = makeNew();
  for (let i = 0; i < 24; i++) project = upsertElement(project, _index_ts__WEBPACK_IMPORTED_MODULE_0__.makeNote(project.noteTrackId, _utils_range_ts__WEBPACK_IMPORTED_MODULE_2__["default"].fromStartDuration(new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_3__["default"](i, 4), new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_3__["default"](1, 4)), _theory__WEBPACK_IMPORTED_MODULE_1__.Utils.midiMiddleC + i));
  return project;
}
function upsertTrack(project, track, remove = false, insertBefore = -1) {
  let nextId = project.nextId;
  let tracks = project.tracks;
  if (track.id < 0) {
    track = _index_ts__WEBPACK_IMPORTED_MODULE_0__.elemModify(track, {
      id: nextId
    });
    nextId++;
  }
  if (remove) {
    const trackIndex = tracks.findIndex(t => t.id === track.id);
    if (trackIndex >= 0) tracks = [...tracks.slice(0, trackIndex), ...tracks.slice(trackIndex + 1)];
  } else {
    const trackIndex = tracks.findIndex(t => t.id === track.id);
    if (trackIndex < 0) {
      if (insertBefore < 0) tracks = [...tracks, track];else tracks = [...tracks.slice(0, insertBefore), track, ...tracks.slice(insertBefore)];
    } else {
      tracks = [...tracks.slice(0, trackIndex), track, ...tracks.slice(trackIndex + 1)];
    }
  }
  let elems = project.elems;
  if (remove) elems = elems.delete(track.id);else elems = elems.set(track.id, track);
  return {
    ...project,
    nextId,
    elems,
    tracks
  };
}
function upsertElement(project, elem) {
  let nextId = project.nextId;
  if (elem.id < 0) {
    elem = _index_ts__WEBPACK_IMPORTED_MODULE_0__.elemModify(elem, {
      id: nextId
    });
    nextId++;
  }
  const prevElem = project.elems.get(elem.id);
  const changeParent = !!prevElem && prevElem.parentId != elem.parentId;
  if (!changeParent) {
    let list = project.lists.get(elem.parentId) ?? new _utils_listOfRanges_ts__WEBPACK_IMPORTED_MODULE_4__["default"]();
    list = list.upsert(elem);
    let elems = project.elems.set(elem.id, elem);
    let lists = project.lists.set(elem.parentId, list);
    return {
      ...project,
      nextId,
      elems,
      lists
    };
  } else if (elem.parentId < 0) {
    let prevList = project.lists.get(prevElem.parentId) ?? new _utils_listOfRanges_ts__WEBPACK_IMPORTED_MODULE_4__["default"]();
    prevList = prevList.removeById(prevElem.id);
    let elems = project.elems.delete(elem.id);
    let lists = project.lists.set(prevElem.parentId, prevList);
    return {
      ...project,
      nextId,
      elems,
      lists
    };
  } else {
    let prevList = project.lists.get(prevElem.parentId) ?? new _utils_listOfRanges_ts__WEBPACK_IMPORTED_MODULE_4__["default"]();
    prevList = prevList.removeById(prevElem.id);
    let nextList = project.lists.get(elem.parentId) ?? new _utils_listOfRanges_ts__WEBPACK_IMPORTED_MODULE_4__["default"]();
    nextList = nextList.upsert(elem);
    let elems = project.elems.set(elem.id, elem);
    let lists = project.lists.set(prevElem.parentId, prevList).set(elem.parentId, nextList);
    return {
      ...project,
      nextId,
      elems,
      lists
    };
  }
}
function keyChangeTrackId(project) {
  return project.keyChangeTrackId;
}
function meterChangeTrackId(project) {
  return project.meterChangeTrackId;
}
function keyAt(project, trackId, time) {
  const keyChangeTrackId = _index_ts__WEBPACK_IMPORTED_MODULE_0__.keyChangeTrackId(project);
  const keyChangeTrackTimedElems = project.lists.get(keyChangeTrackId);
  if (!keyChangeTrackTimedElems) return defaultKey();
  const keyCh = keyChangeTrackTimedElems.findActiveAt(time);
  if (keyCh) return keyCh.key;
  const firstKeyCh = keyChangeTrackTimedElems.findFirst();
  if (firstKeyCh) return firstKeyCh.key;
  return defaultKey();
}
function meterChangeAt(project, trackId, time) {
  const meterChangeTrackId = _index_ts__WEBPACK_IMPORTED_MODULE_0__.meterChangeTrackId(project);
  const meterChangeTrackTimedElems = project.lists.get(meterChangeTrackId);
  if (!meterChangeTrackTimedElems) return null;
  const meterCh = meterChangeTrackTimedElems.findActiveAt(time);
  if (meterCh) return meterCh;
  const firstMeterCh = meterChangeTrackTimedElems.findFirst();
  if (firstMeterCh) return firstMeterCh;
  return null;
}
function meterAt(project, trackId, time) {
  const meterCh = meterChangeAt(project, trackId, time);
  if (meterCh) return meterCh.meter;
  return defaultMeter();
}
function withRefreshedRange(project) {
  let range = new _utils_range_ts__WEBPACK_IMPORTED_MODULE_2__["default"](new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_3__["default"](0), new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_3__["default"](4));
  for (const track of project.tracks) {
    const list = project.lists.get(track.id);
    if (list) range = range.merge(list.getTotalRange());
  }
  if (range.start.compare(project.range.start) == 0 && range.end.compare(project.range.end) == 0) return project;
  return {
    ...project,
    range
  };
}
function getElem(project, id, type) {
  const elem = project.elems.get(id);
  if (!elem || elem.type != type) return null;
  return elem;
}
function getTrack(project, id, trackType) {
  const elem = project.elems.get(id);
  if (!elem || elem.type != "track" || elem.trackType != trackType) return null;
  return elem;
}
function cloneElem(fromProject, elem, toProject) {
  const newElem = {
    ...elem
  };
  newElem.id = -1;
  const newId = toProject.nextId;
  toProject = _index_ts__WEBPACK_IMPORTED_MODULE_0__.upsertElement(toProject, newElem);
  const innerList = fromProject.lists.get(elem.id);
  if (innerList) {
    for (const innerElem of innerList.iterAll()) {
      const newInnerElem = {
        ...innerElem
      };
      newInnerElem.parentId = newId;
      toProject = cloneElem(fromProject, newInnerElem, toProject);
    }
  }
  return toProject;
}
function splitElem(project, elem, splitRange) {
  const origProject = project;
  const absRange = getAbsoluteRange(origProject, elem.parentId, elem.range);
  if (!absRange.overlapsRange(splitRange)) return project;
  const removeElem = _index_ts__WEBPACK_IMPORTED_MODULE_0__.elemModify(elem, {
    parentId: -1
  });
  project = _index_ts__WEBPACK_IMPORTED_MODULE_0__.upsertElement(project, removeElem);
  project = splitInnerElem(origProject, project, elem.parentId, elem, new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_3__["default"](0), splitRange, absRange);
  return project;
}
function splitInnerElem(origProject, project, newParentId, elem, relativeDisplace, splitRange, keepRange) {
  const innerList = origProject.lists.get(elem.id);

  // FIXME: Also keep inner elements that were outside parent's range
  const absRange = getAbsoluteRange(origProject, elem.parentId, elem.range);
  if (!absRange.overlapsRange(keepRange)) return project;
  for (const slice of absRange.iterSlices(splitRange)) {
    const newElemPart = _index_ts__WEBPACK_IMPORTED_MODULE_0__.elemModify(elem, {
      id: -1,
      parentId: newParentId,
      range: getRelativeRange(origProject, elem.parentId, slice).subtract(relativeDisplace)
    });
    const newElemPartId = project.nextId;
    project = _index_ts__WEBPACK_IMPORTED_MODULE_0__.upsertElement(project, newElemPart);
    if (innerList) {
      const innerRelativeDisplace = slice.start.subtract(absRange.start);
      for (const innerElem of innerList.iterAll()) {
        project = splitInnerElem(origProject, project, newElemPartId, innerElem, innerRelativeDisplace, splitRange, slice);
      }
    }
  }
  return project;
}
function parentTrackFor(project, elemId) {
  while (true) {
    const elem = project.elems.get(elemId);
    if (!elem) return null;
    if (elem.type == "track") return elem;
    elemId = elem.parentId;
  }
}
function getAbsoluteTime(project, parentId, time) {
  while (true) {
    const elem = project.elems.get(parentId);
    if (!elem) return time;
    if (elem.type == "track") return time;
    time = time.add(elem.range.start);
    parentId = elem.parentId;
  }
}
function getRelativeTime(project, parentId, time) {
  while (true) {
    const elem = project.elems.get(parentId);
    if (!elem) return time;
    if (elem.type == "track") return time;
    time = time.subtract(elem.range.start);
    parentId = elem.parentId;
  }
}
function getAbsoluteRange(project, parentId, range) {
  while (true) {
    const elem = project.elems.get(parentId);
    if (!elem) return range;
    if (elem.type == "track") return range;
    range = range.displace(elem.range.start);
    parentId = elem.parentId;
  }
}
function getRelativeRange(project, parentId, range) {
  while (true) {
    const elem = project.elems.get(parentId);
    if (!elem) return range;
    if (elem.type == "track") return range;
    range = range.subtract(elem.range.start);
    parentId = elem.parentId;
  }
}
function getRangeForElems(project, elemIds) {
  let range = null;
  for (const id of elemIds) {
    const elem = project.elems.get(id);
    if (!elem) continue;
    if (elem.type == "track") continue;
    const absRange = _index_ts__WEBPACK_IMPORTED_MODULE_0__.getAbsoluteRange(project, elem.parentId, elem.range);
    range = _utils_range_ts__WEBPACK_IMPORTED_MODULE_2__["default"].merge(range, absRange);
  }
  return range;
}
function getMillisecondsAt(project, time) {
  const measuresPerSecond = project.baseBpm / 4 / 60;
  return time.subtract(project.range.start).asFloat() / measuresPerSecond * 1000;
}
function defaultKey() {
  return _theory__WEBPACK_IMPORTED_MODULE_1__.Key.parse("C Major");
}
function defaultMeter() {
  return new _theory__WEBPACK_IMPORTED_MODULE_1__.Meter(4, 4);
}

/***/ }),

/***/ "./src/state.ts":
/*!**********************!*\
  !*** ./src/state.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   get: () => (/* binding */ get),
/* harmony export */   makeNew: () => (/* binding */ makeNew),
/* harmony export */   refresh: () => (/* binding */ refresh)
/* harmony export */ });
/* harmony import */ var solid_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! solid-js */ "./node_modules/solid-js/dist/dev.js");
/* harmony import */ var _project__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./project */ "./src/project/index.ts");
/* harmony import */ var _timeline__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./timeline */ "./src/timeline/index.ts");
/* harmony import */ var _prefs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./prefs */ "./src/prefs.ts");




const [state, setState] = solid_js__WEBPACK_IMPORTED_MODULE_3__.createSignal(makeNew());
function makeNew() {
  return {
    test: 0,
    prefs: _prefs__WEBPACK_IMPORTED_MODULE_2__.makeNew(),
    project: {
      root: _project__WEBPACK_IMPORTED_MODULE_0__.makeTest()
    },
    timeline: _timeline__WEBPACK_IMPORTED_MODULE_1__.makeNew()
  };
}
function get() {
  return state();
}
function refresh() {
  setState({
    ...state()
  });
}

/***/ }),

/***/ "./src/theory/chord.ts":
/*!*****************************!*\
  !*** ./src/theory/chord.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   chordKinds: () => (/* binding */ chordKinds),
/* harmony export */   "default": () => (/* binding */ Chord)
/* harmony export */ });
/* harmony import */ var _utils_mathUtils_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/mathUtils.ts */ "./src/utils/mathUtils.ts");
/* harmony import */ var _utils_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils.ts */ "./src/theory/utils.ts");


const chordKinds = [{
  pitches: [0, 4, 7],
  id: "M",
  symbol: [false, "", null],
  name: "Major",
  startGroup: "Triads"
}, {
  pitches: [0, 3, 7],
  id: "m",
  symbol: [true, "", null],
  name: "Minor"
}, {
  pitches: [0, 4, 8],
  id: "+",
  symbol: [false, "", "+"],
  name: "Augmented"
}, {
  pitches: [0, 3, 6],
  id: "o",
  symbol: [true, "", "o"],
  name: "Diminished"
}, {
  pitches: [0, 2, 6],
  id: "oo",
  symbol: [true, "", "oo"],
  name: "Doubly-Diminished"
}, {
  pitches: [0, 4, 6],
  id: "b5",
  symbol: [false, "", "(b5)"],
  name: "Flat-Fifth"
}, {
  pitches: [0, 7],
  id: "5",
  symbol: [false, "", "5"],
  name: "Power"
}, {
  pitches: [0, 4, 7, 9],
  id: "6",
  symbol: [false, "", "6"],
  name: "Major Sixth",
  startGroup: "Sixths"
}, {
  pitches: [0, 3, 7, 9],
  id: "m6",
  symbol: [true, "", "6"],
  name: "Minor Sixth"
}, {
  pitches: [0, 4, 7, 10],
  id: "7",
  symbol: [false, "", "7"],
  name: "Dominant Seventh",
  startGroup: "Sevenths"
}, {
  pitches: [0, 4, 7, 11],
  id: "maj7",
  symbol: [false, "", "M7"],
  name: "Major Seventh"
}, {
  pitches: [0, 3, 7, 10],
  id: "m7",
  symbol: [true, "", "7"],
  name: "Minor Seventh"
}, {
  pitches: [0, 3, 7, 11],
  id: "mmaj7",
  symbol: [true, "", "M7"],
  name: "Minor-Major Seventh"
}, {
  pitches: [0, 4, 8, 10],
  id: "+7",
  symbol: [false, "+", "7"],
  name: "Augmented Seventh"
}, {
  pitches: [0, 4, 8, 11],
  id: "+maj7",
  symbol: [false, "+", "M7"],
  name: "Augmented Major Seventh"
}, {
  pitches: [0, 3, 6, 9],
  id: "o7",
  symbol: [true, "", "o7"],
  name: "Diminished Seventh"
}, {
  pitches: [0, 3, 6, 10],
  id: "%7",
  symbol: [true, "", "ø7"],
  name: "Half-Diminished Seventh"
}, {
  pitches: [0, 4, 7, 10, 14],
  id: "9",
  symbol: [false, "", "9"],
  name: "Dominant Ninth",
  startGroup: "Ninths"
}, {
  pitches: [0, 4, 7, 11, 14],
  id: "maj9",
  symbol: [false, "", "M9"],
  name: "Major Ninth"
}, {
  pitches: [0, 3, 7, 10, 14],
  id: "m9",
  symbol: [true, "", "9"],
  name: "Minor Ninth"
}, {
  pitches: [0, 3, 7, 11, 14],
  id: "mmaj9",
  symbol: [true, "", "M9"],
  name: "Minor-Major Ninth"
}, {
  pitches: [0, 3, 7, 10, 13],
  id: "9?",
  symbol: [true, "", "9?"],
  name: "???"
}, {
  pitches: [0, 4, 8, 10, 14],
  id: "+9",
  symbol: [false, "+", "9"],
  name: "Augmented Ninth"
}, {
  pitches: [0, 4, 8, 11, 14],
  id: "+maj9",
  symbol: [false, "+", "M9"],
  name: "Augmented Major Ninth"
}, {
  pitches: [0, 3, 6, 9, 14],
  id: "o9",
  symbol: [true, "", "o9"],
  name: "Diminished Ninth"
}, {
  pitches: [0, 3, 6, 9, 13],
  id: "ob9",
  symbol: [true, "", "o♭9"],
  name: "Diminished Minor Ninth"
}, {
  pitches: [0, 3, 6, 10, 14],
  id: "%9",
  symbol: [true, "", "ø9"],
  name: "Half-Diminished Ninth"
}, {
  pitches: [0, 3, 6, 10, 13],
  id: "%b9",
  symbol: [true, "", "ø♭9"],
  name: "Half-Diminished Minor Ninth"
}];
class Chord {
  static kinds = chordKinds;
  constructor(rootChroma, kind, inversion = 0, modifiers = []) {
    this.rootChroma = rootChroma;
    this.kind = kind;
    this.inversion = inversion;
    this.modifiers = modifiers;
  }
  withChanges(obj) {
    return Object.assign(new Chord(this.rootChroma, this.kind, this.inversion, this.modifiers), obj);
  }
  static kindFromId(id) {
    return chordKinds.findIndex(k => k.id === id);
  }
  static kindFromPitches(pitches) {
    return chordKinds.findIndex(k => k.pitches.length === pitches.length && k.pitches.every((p, i) => pitches[i] === p));
  }
  static suggestChordsForPitches(pitches) {
    const suggestions = [];
    for (let k = 0; k < chordKinds.length; k++) {
      const kind = chordKinds[k];
      for (let root = 0; root < pitches.length; root++) {
        const rootPitch = pitches[root];
        const matches = new Set();
        let misses = 0;
        for (let i = 0; i < pitches.length; i++) {
          const pitch = pitches[(root + i) % pitches.length];
          const relPitch = _utils_mathUtils_ts__WEBPACK_IMPORTED_MODULE_0__.mod(pitch - rootPitch, 12);
          const kindMatch = kind.pitches.findIndex(p => p === relPitch);
          if (kindMatch >= 0) matches.add(kindMatch);else misses++;
        }
        suggestions.push({
          chord: new Chord(_utils_mathUtils_ts__WEBPACK_IMPORTED_MODULE_0__.mod(rootPitch, 12), k, 0, []),
          matches: matches.size,
          misses
        });
      }
    }
    suggestions.sort((a, b) => {
      if (a.misses != b.misses) return a.misses - b.misses;
      return b.matches - a.matches;
    });

    //console.log("suggestions", pitches, suggestions)
    return suggestions.slice(0, 10);
  }
  get kindId() {
    return chordKinds[this.kind].id;
  }
  romanBase(key) {
    const degree = key.degreeForMidi(this.rootChroma);
    const chordKind = chordKinds[this.kind] || {
      symbol: [false, "", "?"]
    };
    let roman = Math.floor(degree);
    let accidental = 0;
    if (Math.floor(degree) != degree) {
      roman = _utils_mathUtils_ts__WEBPACK_IMPORTED_MODULE_0__.mod(roman + 1, 7);
      accidental = -1;
    }
    let baseStr = _utils_ts__WEBPACK_IMPORTED_MODULE_1__["default"].accidentalToStr(accidental, true) + _utils_ts__WEBPACK_IMPORTED_MODULE_1__["default"].degreeToRomanStr(roman);
    if (chordKind.symbol[0]) baseStr = baseStr.toLowerCase();
    return baseStr + chordKind.symbol[1];
  }
  romanSup(key) {
    const chordKind = chordKinds[this.kind] || {
      symbol: [false, "", "?"]
    };
    let supStr = chordKind.symbol[2] || "";
    if (this.modifiers) {
      if (this.modifiers.add9) supStr += "(add9)";
      if (this.modifiers.add11) supStr += "(add11)";
      if (this.modifiers.add13) supStr += "(add13)";
      if (this.modifiers.no3) supStr += "(no3)";
      if (this.modifiers.no5) supStr += "(no5)";
    }
    return supStr;
  }
  romanSub(key) {
    let subStr = "";
    if (this.modifiers) {
      if (this.modifiers.sus2) {
        if (this.modifiers.sus4) subStr += "sus24";else subStr += "sus2";
      } else if (this.modifiers.sus4) subStr += "sus4";
    }
    return subStr;
  }
  get pitches() {
    const chordData = chordKinds[this.kind];
    if (!chordData) return [];
    const rootMidi = _utils_ts__WEBPACK_IMPORTED_MODULE_1__["default"].mod(this.rootChroma, 12);
    const pitches = [];
    for (let i = 0; i < chordData.pitches.length; i++) pitches.push(rootMidi + chordData.pitches[i]);
    if (this.modifiers.sus2) pitches[1] = rootMidi + 2;
    if (this.modifiers.sus4) {
      if (this.modifiers.sus2) pitches.splice(2, 0, rootMidi + 5);else pitches[1] = rootMidi + 5;
    }
    return pitches;
  }
  get strummingPitches() {
    const rootMidi = _utils_ts__WEBPACK_IMPORTED_MODULE_1__["default"].mod(this.rootChroma, 12);
    let pitches = this.pitches;
    if (pitches.length == 0) return [];
    let octave = 12 * 4;
    if (rootMidi >= 6) octave -= 12;
    pitches = pitches.map(p => p + octave);
    if (pitches.length <= 3) pitches.push(pitches[0] + 12);
    pitches = pitches.sort((x, y) => x - y);
    let sum = pitches.reduce((x, y) => x + y) / pitches.length;
    while (sum < 60) {
      const x = pitches.shift();
      pitches.push(x + 12);
      sum += 12 / pitches.length;
    }
    if (pitches.length >= 4) {
      pitches[0] += 12;
      pitches[3] -= 12;
    }
    pitches.unshift(octave + rootMidi);
    return pitches;
  }
}

/***/ }),

/***/ "./src/theory/index.ts":
/*!*****************************!*\
  !*** ./src/theory/index.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Chord: () => (/* reexport safe */ _chord_ts__WEBPACK_IMPORTED_MODULE_5__["default"]),
/* harmony export */   Key: () => (/* reexport safe */ _key_ts__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   Meter: () => (/* reexport safe */ _meter_ts__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   Pitch: () => (/* reexport safe */ _pitch_ts__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   PitchName: () => (/* reexport safe */ _pitchName_ts__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   Scale: () => (/* reexport safe */ _scale_ts__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   Utils: () => (/* reexport safe */ _utils_ts__WEBPACK_IMPORTED_MODULE_6__["default"])
/* harmony export */ });
/* harmony import */ var _pitch_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pitch.ts */ "./src/theory/pitch.ts");
/* harmony import */ var _pitchName_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pitchName.ts */ "./src/theory/pitchName.ts");
/* harmony import */ var _scale_ts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./scale.ts */ "./src/theory/scale.ts");
/* harmony import */ var _key_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./key.ts */ "./src/theory/key.ts");
/* harmony import */ var _meter_ts__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./meter.ts */ "./src/theory/meter.ts");
/* harmony import */ var _chord_ts__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./chord.ts */ "./src/theory/chord.ts");
/* harmony import */ var _utils_ts__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./utils.ts */ "./src/theory/utils.ts");








/***/ }),

/***/ "./src/theory/key.ts":
/*!***************************!*\
  !*** ./src/theory/key.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Key)
/* harmony export */ });
/* harmony import */ var _pitchName_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pitchName.ts */ "./src/theory/pitchName.ts");
/* harmony import */ var _pitch_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pitch.ts */ "./src/theory/pitch.ts");
/* harmony import */ var _scale_ts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./scale.ts */ "./src/theory/scale.ts");
/* harmony import */ var _utils_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils.ts */ "./src/theory/utils.ts");




class Key {
  constructor(tonic, scale) {
    this.tonic = tonic;
    this.scale = scale;
    this._chromaToDegree = [];
    for (let degree = 0; degree < this.scale.chromas.length; degree++) {
      let chroma = _utils_ts__WEBPACK_IMPORTED_MODULE_3__["default"].mod(this.tonic.midi + this.scale.chromas[degree], 12);
      this._chromaToDegree[chroma] = degree;
      const nextDegree = (degree + 1) % this.scale.chromas.length;
      let nextChroma = chroma + 1;
      while (true) {
        let testNextChroma = _utils_ts__WEBPACK_IMPORTED_MODULE_3__["default"].mod(this.tonic.midi + this.scale.chromas[nextDegree], 12);
        while (testNextChroma < chroma) testNextChroma += 12;
        if (nextChroma >= testNextChroma) break;
        this._chromaToDegree[nextChroma % 12] = (degree + 0.5) % this.scale.chromas.length;
        nextChroma += 1;
      }
    }
  }
  static fromTonicAndScale(tonic, scale) {
    return new Key(tonic, scale);
  }
  static parse(str) {
    str = str.toLowerCase().trim();
    const separator = str.indexOf(" ");
    if (separator < 1) throw "invalid key string";
    const tonicStr = str.substr(0, separator);
    const scaleStr = str.substr(separator);
    const tonic = _pitchName_ts__WEBPACK_IMPORTED_MODULE_0__["default"].parse(tonicStr);
    const scale = _scale_ts__WEBPACK_IMPORTED_MODULE_2__["default"].parse(scaleStr);
    return new Key(tonic, scale);
  }
  get str() {
    const scaleStr = this.scale.name || "Unknown Scale";
    const tonicStr = this.tonic.str;
    return tonicStr + " " + scaleStr;
  }
  toString() {
    return this.str;
  }
  degreeForChroma(chroma) {
    return _utils_ts__WEBPACK_IMPORTED_MODULE_3__["default"].mod(this._chromaToDegree[chroma], this.scale.chromas.length);
  }
  degreeForMidi(midi) {
    return this.degreeForChroma(_utils_ts__WEBPACK_IMPORTED_MODULE_3__["default"].mod(midi, 12));
  }
  degreeForPitch(pitch) {
    return this.degreeForMidi(pitch.midi);
  }
  octavedDegreeForMidi(midi) {
    const degree = this.degreeForMidi(midi);
    const degreeOctave = Math.floor((midi - this.tonic.midi) / 12);
    return degree + this.scale.chromas.length * degreeOctave;
  }
  octavedDegreeForPitch(pitch) {
    return this.octavedDegreeForMidi(pitch.midi);
  }
  midiForDegree(octavedDegree) {
    const degree = _utils_ts__WEBPACK_IMPORTED_MODULE_3__["default"].mod(octavedDegree, this.scale.chromas.length);
    const degreeOctave = Math.floor(octavedDegree / this.scale.chromas.length);
    return this.tonic.midi + this.scale.chromas[degree] + degreeOctave * 12;
  }
  pitchForDegree(octavedDegree) {
    return _pitch_ts__WEBPACK_IMPORTED_MODULE_1__["default"].fromMidi(this.midiForDegree(octavedDegree));
  }
  chromaForDegree(octavedDegree) {
    return _utils_ts__WEBPACK_IMPORTED_MODULE_3__["default"].mod(this.midiForDegree(octavedDegree), 12);
  }
  nameForMidi(midi) {
    const degree = this.degreeForMidi(midi);
    const letter1 = _utils_ts__WEBPACK_IMPORTED_MODULE_3__["default"].mod(this.tonic.letter + Math.floor(degree), 7);
    const accidental1 = _utils_ts__WEBPACK_IMPORTED_MODULE_3__["default"].mod(midi - _utils_ts__WEBPACK_IMPORTED_MODULE_3__["default"].letterToChroma(letter1) + 6, 12) - 6;
    if (degree == Math.floor(degree)) return new _pitchName_ts__WEBPACK_IMPORTED_MODULE_0__["default"](letter1, accidental1);
    const letter2 = _utils_ts__WEBPACK_IMPORTED_MODULE_3__["default"].mod(letter1 + 1, 7);
    const accidental2 = _utils_ts__WEBPACK_IMPORTED_MODULE_3__["default"].mod(midi - _utils_ts__WEBPACK_IMPORTED_MODULE_3__["default"].letterToChroma(letter2) + 6, 12) - 6;
    const letter3 = _utils_ts__WEBPACK_IMPORTED_MODULE_3__["default"].mod(letter1 - 1, 7);
    const accidental3 = _utils_ts__WEBPACK_IMPORTED_MODULE_3__["default"].mod(midi - _utils_ts__WEBPACK_IMPORTED_MODULE_3__["default"].letterToChroma(letter3) + 6, 12) - 6;
    const attempts = [[letter1, accidental1], [letter2, accidental2], [letter3, accidental3]];
    attempts.sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]));
    return new _pitchName_ts__WEBPACK_IMPORTED_MODULE_0__["default"](attempts[0][0], attempts[0][1]);
  }
  nameForPitch(pitch) {
    return this.nameForMidi(pitch.midi);
  }
  nameForChroma(chroma) {
    return this.nameForMidi(chroma);
  }
  nameForDegree(degree) {
    return this.nameForMidi(this.midiForDegree(degree));
  }
  get midi() {
    return this.scale.chromas.map(chroma => chroma + this.tonic.midi);
  }
  get chroma() {
    return this.scale.chromas.map(chroma => _utils_ts__WEBPACK_IMPORTED_MODULE_3__["default"].mod(chroma + this.tonic.midi, 12));
  }
  get namedPitches() {
    return this.scale.chromas.map(chroma => this.nameForMidi(chroma + this.tonic.midi));
  }
}

/***/ }),

/***/ "./src/theory/meter.ts":
/*!*****************************!*\
  !*** ./src/theory/meter.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Meter)
/* harmony export */ });
/* harmony import */ var _utils_rational_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/rational.ts */ "./src/utils/rational.ts");

class Meter {
  constructor(numerator, denominator) {
    this.numerator = numerator;
    this.denominator = denominator;
  }
  withChanges(obj) {
    return Object.assign(new Meter(this.numerator, this.denominator), obj);
  }
  *iterMeasuresPairwise(time = null) {
    time = time || new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_0__["default"](0);
    while (true) {
      const nextTime = time.add(new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_0__["default"](this.numerator, this.denominator));
      yield [this.numerator, this.denominator, time, nextTime];
      time = nextTime;
    }
  }
  get fullCycleDuration() {
    return new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_0__["default"](this.numerator, this.denominator);
  }
  get alternatingMeasureCount() {
    return 1;
  }
  get str() {
    return this.numerator + " / " + this.denominator;
  }
  static parse(src) {
    const split = src.split("/");
    if (split.length != 2) throw "invalid meter syntax";
    const numerator = parseInt(split[0].trim());
    const denominator = parseInt(split[1].trim());
    if (!isFinite(numerator) || !isFinite(denominator)) throw "invalid meter syntax";
    return new Meter(numerator, denominator);
  }
}

/***/ }),

/***/ "./src/theory/pitch.ts":
/*!*****************************!*\
  !*** ./src/theory/pitch.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Pitch)
/* harmony export */ });
/* harmony import */ var _pitchName_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pitchName.ts */ "./src/theory/pitchName.ts");
/* harmony import */ var _utils_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils.ts */ "./src/theory/utils.ts");


class Pitch {
  constructor(midi) {
    this.midi = midi;
  }
  static fromMidi(midi) {
    return new Pitch(midi);
  }
  static fromOctaveAndChroma(octave, chroma) {
    return Pitch.fromMidi(12 * octave + chroma);
  }
  static fromOctaveAndName(octave, pitchName) {
    return Pitch.fromMidi(12 * octave + pitchName.midi);
  }
  static parse(str) {
    const pitchName = _pitchName_ts__WEBPACK_IMPORTED_MODULE_0__["default"].parse(str);
    str = str.toLowerCase().trim();

    // Determine octave
    let octave = 0;
    for (let i = 1; i < str.length; i++) {
      const c = str.charCodeAt(i);
      if (c == "-".charCodeAt(0) || c >= "0".charCodeAt(0) && c <= "9".charCodeAt(0)) {
        octave = parseInt(str.substr(i));
        break;
      }
    }
    if (octave === undefined || octave === null || isNaN(octave) || !isFinite(octave)) throw "invalid pitch string";
    return Pitch.fromOctaveAndName(octave, pitchName);
  }
  get frequency() {
    return Math.pow(2, (this.midi - 69) / 12) * 440;
  }
  get octave() {
    return Math.floor(this.midi / 12);
  }
  get chroma() {
    return _utils_ts__WEBPACK_IMPORTED_MODULE_1__["default"].mod(this.midi, 12);
  }
  get name() {
    return _pitchName_ts__WEBPACK_IMPORTED_MODULE_0__["default"].fromMidi(this.midi);
  }
  get str() {
    return this.name.str + this.octave.toString();
  }
  toString() {
    return this.str;
  }
}

/***/ }),

/***/ "./src/theory/pitchName.ts":
/*!*********************************!*\
  !*** ./src/theory/pitchName.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ PitchName)
/* harmony export */ });
/* harmony import */ var _utils_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.ts */ "./src/theory/utils.ts");

class PitchName {
  constructor(letter, accidental) {
    this.letter = _utils_ts__WEBPACK_IMPORTED_MODULE_0__["default"].mod(letter, 7);
    this.accidental = accidental;
  }
  static fromMidi(midi) {
    const chroma = _utils_ts__WEBPACK_IMPORTED_MODULE_0__["default"].mod(midi, 12);
    const letter = _utils_ts__WEBPACK_IMPORTED_MODULE_0__["default"].chromaToLetter(chroma);
    const accidental = _utils_ts__WEBPACK_IMPORTED_MODULE_0__["default"].chromaToAccidental(chroma);
    return new PitchName(letter, accidental);
  }
  static fromChroma(chroma) {
    return PitchName.fromMidi(chroma);
  }
  static parse(str) {
    if (str.length < 1) throw "invalid pitch string";
    str = str.toLowerCase().trim();

    // Determine letter
    const letterStr = str[0];
    const letter = _utils_ts__WEBPACK_IMPORTED_MODULE_0__["default"].strToLetter(letterStr);
    if (letter === undefined) throw "invalid pitch string";

    // Determine accidental
    let accidental = 0;
    for (let i = 1; i < str.length; i++) {
      const c = str.charCodeAt(i);
      if (c == "b".charCodeAt(0) || c == "♭".charCodeAt(0)) accidental -= 1;else if (c == "#".charCodeAt(0) || c == "♯".charCodeAt(0)) accidental += 1;
    }
    return new PitchName(letter, accidental);
  }
  get midi() {
    return _utils_ts__WEBPACK_IMPORTED_MODULE_0__["default"].letterToChroma(this.letter) + this.accidental;
  }
  get chroma() {
    return _utils_ts__WEBPACK_IMPORTED_MODULE_0__["default"].mod(this.midi, 12);
  }
  altered(additionalAccidental) {
    return new PitchName(this.letter, this.accidental + additionalAccidental);
  }
  get simplified() {
    if (this.accidental === 0) return this;else return PitchName.fromMidi(this.midi);
  }
  get str() {
    const letterStr = _utils_ts__WEBPACK_IMPORTED_MODULE_0__["default"].letterToStr(this.letter);
    const accidentalStr = _utils_ts__WEBPACK_IMPORTED_MODULE_0__["default"].accidentalToStr(this.accidental);
    return letterStr + accidentalStr;
  }
  get strUnicode() {
    const letterStr = _utils_ts__WEBPACK_IMPORTED_MODULE_0__["default"].letterToStr(this.letter);
    const accidentalStr = _utils_ts__WEBPACK_IMPORTED_MODULE_0__["default"].accidentalToStr(this.accidental, true);
    return letterStr + accidentalStr;
  }
  toString() {
    return this.str;
  }
}

/***/ }),

/***/ "./src/theory/scale.ts":
/*!*****************************!*\
  !*** ./src/theory/scale.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Scale),
/* harmony export */   knownScales: () => (/* binding */ knownScales)
/* harmony export */ });
/* harmony import */ var _pitchName_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pitchName.ts */ "./src/theory/pitchName.ts");

const knownScales = [{
  chromas: [0, 2, 4, 5, 7, 9, 11],
  mode: 0,
  id: "maj",
  names: ["Major", "Ionian"]
}, {
  chromas: [0, 2, 3, 5, 7, 9, 10],
  mode: 1,
  id: "dor",
  names: ["Dorian"]
}, {
  chromas: [0, 1, 3, 5, 7, 8, 10],
  mode: 2,
  id: "phr",
  names: ["Phrygian"]
}, {
  chromas: [0, 2, 4, 6, 7, 9, 11],
  mode: 3,
  id: "lyd",
  names: ["Lydian"]
}, {
  chromas: [0, 2, 4, 5, 7, 9, 10],
  mode: 4,
  id: "mix",
  names: ["Mixolydian"]
}, {
  chromas: [0, 2, 3, 5, 7, 8, 10],
  mode: 5,
  id: "min",
  names: ["Natural Minor", "Minor", "Aeolian"]
}, {
  chromas: [0, 1, 3, 5, 6, 8, 10],
  mode: 6,
  id: "loc",
  names: ["Locrian"]
}, {
  chromas: [0, 1, 4, 5, 7, 8, 11],
  mode: 0,
  id: "dharmaj",
  names: ["Double Harmonic Major"]
}];
class Scale {
  static list = knownScales;
  constructor(chromas) {
    if (chromas.length <= 1 || chromas.length > 12) throw "invalid scale length";
    this.chromas = chromas;
    this.metadata = knownScales.find(s => s.chromas.length == this.chromas.length && s.chromas.every((p, index) => p == this.chromas[index]));
  }
  static fromChromas(chromas) {
    return new Scale(chromas);
  }
  static fromId(id) {
    return new Scale(knownScales.find(s => s.id === id).chromas);
  }
  static parse(str) {
    str = str.toLowerCase().trim();
    const knownScale = knownScales.find(s => s.names.some(n => n.toLowerCase() == str));
    if (!knownScale) throw "no known scale with given name";
    return new Scale(knownScale.chromas);
  }
  get id() {
    if (!this.metadata) return null;
    return this.metadata.id;
  }
  get name() {
    if (!this.metadata) return null;
    return this.metadata.names[0];
  }
  get alterationsFromMajor() {
    if (this.chromas.length != 7) throw "not a seven-note scale";
    return this.chromas.map((pitch, i) => pitch - knownScales[0].chromas[i]);
  }
  get str() {
    return this.name || "[" + this.chromas.map(chroma => _pitchName_ts__WEBPACK_IMPORTED_MODULE_0__["default"].fromChroma(chroma).str).join(", ") + "]";
  }
  toString() {
    return this.str;
  }
}

/***/ }),

/***/ "./src/theory/utils.ts":
/*!*****************************!*\
  !*** ./src/theory/utils.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Utils)
/* harmony export */ });
class Utils {
  static mod(x, m) {
    return (x % m + m) % m;
  }
  static midiMiddleC = 60;
  static chromaToLetter = chroma => [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][chroma];
  static chromaToAccidental = chroma => [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0][chroma];
  static chromaToDegreeInCMajor = chroma => [0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 5.5, 6][chroma];
  static letterToChroma = letter => [0, 2, 4, 5, 7, 9, 11][letter];
  static letterToStr = letter => ["C", "D", "E", "F", "G", "A", "B"][letter];
  static strToLetter = str => {
    const map = {
      c: 0,
      d: 1,
      e: 2,
      f: 3,
      g: 4,
      a: 5,
      b: 6
    };
    return map[str];
  };
  static degreeToRomanStr = degree => ["I", "II", "III", "IV", "V", "VI", "VII"][degree];
  static degreeToColor = degree => ["#f00", "#f80", "#fd0", "#0d0", "#00f", "#80f", "#f0f"][degree];
  static degreeToColorFaded = degree => ["#400", "#420", "#430", "#030", "#004", "#204", "#404"][degree];
  static accidentalToStr(accidental, useUnicode = false) {
    if (accidental < 0) return (useUnicode ? "\u{266d}" : "b").repeat(-accidental);else return (useUnicode ? "\u{266f}" : "#").repeat(accidental);
  }
}

/***/ }),

/***/ "./src/timeline/Element.tsx":
/*!**********************************!*\
  !*** ./src/timeline/Element.tsx ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Element: () => (/* binding */ Element)
/* harmony export */ });
/* harmony import */ var solid_js_web__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! solid-js/web */ "./node_modules/solid-js/web/dist/dev.js");
/* harmony import */ var solid_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! solid-js */ "./node_modules/solid-js/dist/dev.js");
/* harmony import */ var _state_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../state.ts */ "./src/state.ts");
/* harmony import */ var _index_ts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index.ts */ "./src/timeline/index.ts");
/* harmony import */ var _utils_rect_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/rect.ts */ "./src/utils/rect.ts");


var _tmpl$ = /*#__PURE__*/(0,solid_js_web__WEBPACK_IMPORTED_MODULE_0__.template)(`<div><canvas>`);




function Element(props) {
  let div = undefined;
  let canvas = undefined;
  solid_js__WEBPACK_IMPORTED_MODULE_4__.createEffect(() => {
    if (!div || !canvas) return;
    const cleanup = registerHandlers(div, canvas);
    solid_js__WEBPACK_IMPORTED_MODULE_4__.onCleanup(cleanup);
  });
  return (() => {
    var _el$ = _tmpl$(),
      _el$2 = _el$.firstChild;
    var _ref$ = div;
    typeof _ref$ === "function" ? (0,solid_js_web__WEBPACK_IMPORTED_MODULE_0__.use)(_ref$, _el$) : div = _el$;
    _el$.style.setProperty("width", "100%");
    _el$.style.setProperty("height", "100%");
    var _ref$2 = canvas;
    typeof _ref$2 === "function" ? (0,solid_js_web__WEBPACK_IMPORTED_MODULE_0__.use)(_ref$2, _el$2) : canvas = _el$2;
    return _el$;
  })();
}
function canvasResize(div, canvas, timeline) {
  const pixelRatio = window.devicePixelRatio || 1;
  const domRect = div.getBoundingClientRect();
  const x = Math.floor(domRect.x);
  const y = Math.floor(domRect.y);
  const w = Math.floor(domRect.width * pixelRatio);
  const h = Math.floor(domRect.height * pixelRatio);
  canvas.style.width = domRect.width + "px";
  canvas.style.height = domRect.height + "px";
  canvas.width = w;
  canvas.height = h;
  const rect = new _utils_rect_ts__WEBPACK_IMPORTED_MODULE_3__["default"](0, 0, w, h);
  _index_ts__WEBPACK_IMPORTED_MODULE_2__.resize(timeline, pixelRatio, rect);
}
function registerHandlers(div, canvas) {
  const ctx = canvas.getContext("2d");
  const transformMousePos = (canvas, ev) => {
    const rect = canvas.getBoundingClientRect();
    const timeline = _state_ts__WEBPACK_IMPORTED_MODULE_1__.get().timeline;
    return {
      x: (ev.clientX - rect.left) * timeline.pixelRatio,
      y: (ev.clientY - rect.top) * timeline.pixelRatio
    };
  };
  const setCursor = () => {
    const timeline = _state_ts__WEBPACK_IMPORTED_MODULE_1__.get().timeline;
    const action = timeline.mouse.down ? timeline.mouse.action : timeline.hover?.action;
    canvas.style.cursor = action === _index_ts__WEBPACK_IMPORTED_MODULE_2__.MouseAction.DragTime || action === _index_ts__WEBPACK_IMPORTED_MODULE_2__.MouseAction.DragRow || action === _index_ts__WEBPACK_IMPORTED_MODULE_2__.MouseAction.DragTimeAndRow ? timeline.mouse.down ? "grabbing" : "grab" : action === _index_ts__WEBPACK_IMPORTED_MODULE_2__.MouseAction.StretchTimeStart || action === _index_ts__WEBPACK_IMPORTED_MODULE_2__.MouseAction.StretchTimeEnd ? "col-resize" : "inherit";
  };
  const onResize = () => {
    const timeline = _state_ts__WEBPACK_IMPORTED_MODULE_1__.get().timeline;
    const project = _state_ts__WEBPACK_IMPORTED_MODULE_1__.get().project;
    canvasResize(div, canvas, timeline);
    _index_ts__WEBPACK_IMPORTED_MODULE_2__.layout(timeline, project.root);
    _index_ts__WEBPACK_IMPORTED_MODULE_2__.draw(timeline, ctx);
  };
  const onMouseMove = ev => {
    ev.preventDefault();
    const timeline = _state_ts__WEBPACK_IMPORTED_MODULE_1__.get().timeline;
    const project = _state_ts__WEBPACK_IMPORTED_MODULE_1__.get().project;
    const mouse = transformMousePos(canvas, ev);
    _index_ts__WEBPACK_IMPORTED_MODULE_2__.mouseMove(timeline, project.root, mouse.x, mouse.y);
    if (_index_ts__WEBPACK_IMPORTED_MODULE_2__.mouseDrag(timeline, project)) _index_ts__WEBPACK_IMPORTED_MODULE_2__.layout(timeline, project.root);
    _index_ts__WEBPACK_IMPORTED_MODULE_2__.draw(timeline, ctx);
    setCursor();
  };
  const onMouseDown = ev => {
    ev.preventDefault();
    const timeline = _state_ts__WEBPACK_IMPORTED_MODULE_1__.get().timeline;
    const project = _state_ts__WEBPACK_IMPORTED_MODULE_1__.get().project;
    const prefs = _state_ts__WEBPACK_IMPORTED_MODULE_1__.get().prefs;
    const mouse = transformMousePos(canvas, ev);
    _index_ts__WEBPACK_IMPORTED_MODULE_2__.mouseMove(timeline, project.root, mouse.x, mouse.y);
    _index_ts__WEBPACK_IMPORTED_MODULE_2__.mouseDown(timeline, project.root, prefs, ev.button !== 0);
    _index_ts__WEBPACK_IMPORTED_MODULE_2__.draw(timeline, ctx);
    setCursor();
  };
  const onMouseUp = ev => {
    ev.preventDefault();
    const timeline = _state_ts__WEBPACK_IMPORTED_MODULE_1__.get().timeline;
    const project = _state_ts__WEBPACK_IMPORTED_MODULE_1__.get().project;
    const mouse = transformMousePos(canvas, ev);
    _index_ts__WEBPACK_IMPORTED_MODULE_2__.mouseMove(timeline, project.root, mouse.x, mouse.y);
    _index_ts__WEBPACK_IMPORTED_MODULE_2__.mouseUp(timeline, project.root, ev.button !== 0);
    _index_ts__WEBPACK_IMPORTED_MODULE_2__.draw(timeline, ctx);
    setCursor();
  };
  const onMouseWheel = ev => {
    ev.preventDefault();
    const timeline = _state_ts__WEBPACK_IMPORTED_MODULE_1__.get().timeline;
    const project = _state_ts__WEBPACK_IMPORTED_MODULE_1__.get().project;
    _index_ts__WEBPACK_IMPORTED_MODULE_2__.mouseWheel(timeline, ev.deltaX, ev.deltaY);
    _index_ts__WEBPACK_IMPORTED_MODULE_2__.layout(timeline, project.root);
    _index_ts__WEBPACK_IMPORTED_MODULE_2__.draw(timeline, ctx);
  };
  const onKeyDown = ev => {
    const timeline = _state_ts__WEBPACK_IMPORTED_MODULE_1__.get().timeline;
    _index_ts__WEBPACK_IMPORTED_MODULE_2__.keyDown(timeline, ev.key.toLowerCase());
  };
  const onKeyUp = ev => {
    const timeline = _state_ts__WEBPACK_IMPORTED_MODULE_1__.get().timeline;
    _index_ts__WEBPACK_IMPORTED_MODULE_2__.keyUp(timeline, ev.key.toLowerCase());
  };
  const preventDefault = ev => {
    ev.preventDefault();
  };
  onResize();
  canvas.addEventListener("resize", onResize);
  window.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("wheel", onMouseWheel);
  canvas.addEventListener("contextmenu", preventDefault);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  return () => {
    canvas.removeEventListener("resize", onResize);
    window.removeEventListener("mousemove", onMouseMove);
    canvas.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mouseup", onMouseUp);
    canvas.removeEventListener("wheel", onMouseWheel);
    canvas.removeEventListener("contextmenu", preventDefault);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  };
}

/***/ }),

/***/ "./src/timeline/draw.ts":
/*!******************************!*\
  !*** ./src/timeline/draw.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   draw: () => (/* binding */ draw),
/* harmony export */   drawLaneBkgCenterStroke: () => (/* binding */ drawLaneBkgCenterStroke),
/* harmony export */   drawLaneBkgMeasures: () => (/* binding */ drawLaneBkgMeasures),
/* harmony export */   drawLaneBkgOctaves: () => (/* binding */ drawLaneBkgOctaves),
/* harmony export */   drawLaneBkgSolid: () => (/* binding */ drawLaneBkgSolid),
/* harmony export */   drawLaneFrgOutline: () => (/* binding */ drawLaneFrgOutline)
/* harmony export */ });
/* harmony import */ var _state_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../state.ts */ "./src/state.ts");
/* harmony import */ var _index_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.ts */ "./src/timeline/index.ts");
/* harmony import */ var _theory__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../theory */ "./src/theory/index.ts");
/* harmony import */ var _utils_rational_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/rational.ts */ "./src/utils/rational.ts");




function draw(timeline, ctx) {
  ctx.save();
  ctx.translate(0.5, 0.5);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, timeline.renderRect.w, timeline.renderRect.h);
  drawElements(timeline, ctx, timeline.layout.elements);
  if (timeline.cursor.visible) {
    const timeMin = timeline.cursor.time1.min(timeline.cursor.time2);
    const timeMax = timeline.cursor.time1.max(timeline.cursor.time2);
    drawCursorBeam(timeline, ctx, timeMin, false);
    drawCursorBeam(timeline, ctx, timeMax, true);
  }
  ctx.restore();
}
function drawElements(timeline, ctx, elements) {
  for (const element of elements) {
    if (element.kind === "lane") {
      ctx.save();
      ctx.beginPath();
      ctx.rect(element.rect.x, element.rect.y, element.rect.w, element.rect.h);
      ctx.clip();
      drawLaneBkgSolid(timeline, ctx, element);
      drawLaneBkgMeasures(timeline, ctx, element, false);
      drawLaneBkgMeasures(timeline, ctx, element, true);
      drawCursorBkg(timeline, ctx, element);
      if (element.subElements) drawElements(timeline, ctx, element.subElements);
      drawLaneFrgOutline(timeline, ctx, element);
      ctx.restore();
    }
    if (element.kind === "laneNotes") {
      ctx.save();
      ctx.beginPath();
      ctx.rect(element.rect.x, element.rect.y, element.rect.w, element.rect.h);
      ctx.clip();
      drawLaneBkgSolid(timeline, ctx, element);
      drawLaneBkgOctaves(timeline, ctx, element, false);
      drawLaneBkgMeasures(timeline, ctx, element, false);
      drawLaneBkgOctaves(timeline, ctx, element, true);
      drawLaneBkgMeasures(timeline, ctx, element, true);
      drawCursorBkg(timeline, ctx, element);
      if (element.subElements) drawElements(timeline, ctx, element.subElements);
      drawLaneFrgOutline(timeline, ctx, element);
      ctx.restore();
    }
    if (element.kind === "note") {
      ctx.fillStyle = timeline.hover?.id === element.id ? "#f88" : "#f00";
      ctx.beginPath();
      ctx.roundRect(element.rect.x, element.rect.y, element.rect.w, element.rect.h, timeline.noteRowH / 4);
      ctx.fill();
      if (element.id !== undefined && timeline.selection.has(element.id)) {
        ctx.strokeStyle = "#fbb";
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    }
  }
}
function drawLaneBkgCenterStroke(timeline, ctx, lane) {
  const yCenter = Math.floor(lane.rect.y + lane.rect.h / 2) + 0.5;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(lane.rect.x, yCenter);
  ctx.lineTo(lane.rect.x + lane.rect.w, yCenter);
  ctx.stroke();
}
function drawLaneBkgSolid(timeline, ctx, lane) {
  ctx.fillStyle = "#eee";
  ctx.fillRect(lane.rect.x, lane.rect.y, lane.rect.w, lane.rect.h);
}
function drawLaneFrgOutline(timeline, ctx, lane) {
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(lane.rect.x, lane.rect.y);
  ctx.lineTo(lane.rect.x + lane.rect.w, lane.rect.y);
  ctx.moveTo(lane.rect.x, lane.rect.y + lane.rect.h);
  ctx.lineTo(lane.rect.x + lane.rect.w, lane.rect.y + lane.rect.h);
  ctx.stroke();
}
function drawLaneBkgMeasures(timeline, ctx, lane, mainLinePass) {
  // Render alternating measure background and sub-measure dividers.
  const measureHalfH = lane.rect.h / 2;
  const submeasureHalfH = lane.rect.h / 2;
  for (const measure of timeline.layout.measures) {
    const x1 = Math.floor(_index_ts__WEBPACK_IMPORTED_MODULE_1__.xAtTime(timeline, measure.time1));
    const x2 = Math.floor(_index_ts__WEBPACK_IMPORTED_MODULE_1__.xAtTime(timeline, measure.time2));
    const submeasureSize = _index_ts__WEBPACK_IMPORTED_MODULE_1__.xAtTime(timeline, new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_3__["default"](1, measure.meterCh.meter.denominator)) - _index_ts__WEBPACK_IMPORTED_MODULE_1__.xAtTime(timeline, new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_3__["default"](0));
    if (mainLinePass) {
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1 + 0.5, lane.rect.y);
      ctx.lineTo(x1 + 0.5, lane.rect.y + lane.rect.h);
      ctx.stroke();
    }
    if (!mainLinePass && submeasureSize > 8) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let n = 1; n < measure.meterCh.meter.numerator; n++) {
        const submeasureX = x1 + Math.round(submeasureSize * n);
        if (submeasureX >= x2) break;
        ctx.moveTo(submeasureX, lane.rect.y);
        ctx.lineTo(submeasureX, lane.rect.y + lane.rect.h);
      }
      ctx.stroke();
    }
  }
}
function drawLaneBkgOctaves(timeline, ctx, lane, mainLinePass) {
  const rowAtTop = _index_ts__WEBPACK_IMPORTED_MODULE_1__.rowAtY(timeline, lane, lane.rect.y);
  const rowAtBottom = _index_ts__WEBPACK_IMPORTED_MODULE_1__.rowAtY(timeline, lane, lane.rect.y + lane.rect.h);
  const octaveAtTop = Math.ceil(rowAtTop / 7) + 1;
  const octaveAtBottom = Math.floor(rowAtBottom / 7) - 1;
  ctx.fillStyle = "#444";
  ctx.font = Math.floor(timeline.noteRowH - 4) + "px system-ui";
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  for (const keyRegion of timeline.layout.keyRegions) {
    const tonicRowOffset = _theory__WEBPACK_IMPORTED_MODULE_2__.Utils.chromaToDegreeInCMajor(keyRegion.keyCh1.key.tonic.chroma);
    let needsOctaveLabels = true;
    let drewOctaveLabels = false;
    for (const measure of timeline.layout.measures) {
      /*if (measure.time1.lessThan(keyRegion.keyCh1.range.start) ||
          measure.time2.greaterThan(keyRegion.keyCh2.range.start))
          continue*/

      const x1 = Math.floor(_index_ts__WEBPACK_IMPORTED_MODULE_1__.xAtTime(timeline, measure.time1));
      const x2 = Math.floor(_index_ts__WEBPACK_IMPORTED_MODULE_1__.xAtTime(timeline, measure.time2));
      for (let i = octaveAtBottom; i <= octaveAtTop; i++) {
        const y = Math.floor(_index_ts__WEBPACK_IMPORTED_MODULE_1__.yForRow(timeline, lane, tonicRowOffset + i * 7) + timeline.noteRowH);
        if (mainLinePass) {
          const labelX = Math.max(x1 + 5, 5);
          if (needsOctaveLabels && labelX + 30 < x2) {
            ctx.fillText(keyRegion.keyCh1.key.tonic.str + (i + 5).toString(), labelX, y - 1);
            drewOctaveLabels = true;
          }
          ctx.strokeStyle = "#444";
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.moveTo(x1, y + 1);
          ctx.lineTo(x2, y + 1);
          ctx.stroke();
        }
        if (!mainLinePass) {
          ctx.strokeStyle = "#fff";
          ctx.beginPath();
          for (let j = 1; j < 7; j += 1) {
            const ySuboctave = Math.floor(_index_ts__WEBPACK_IMPORTED_MODULE_1__.yForRow(timeline, lane, tonicRowOffset + i * 7 + j) + timeline.noteRowH);
            ctx.moveTo(x1, ySuboctave);
            ctx.lineTo(x2, ySuboctave);
          }
          ctx.stroke();
        }
      }
      if (drewOctaveLabels) needsOctaveLabels = false;
    }
  }
}
function drawCursorBeam(timeline, ctx, time, tipOffsetSide) {
  const prefs = _state_ts__WEBPACK_IMPORTED_MODULE_0__.get().prefs;
  const laneIndexMin = _index_ts__WEBPACK_IMPORTED_MODULE_1__.cursorGetLaneIndexMin(timeline);
  const laneIndexMax = _index_ts__WEBPACK_IMPORTED_MODULE_1__.cursorGetLaneIndexMax(timeline);
  const laneMin = timeline.layout.lanes[laneIndexMin];
  const laneMax = timeline.layout.lanes[laneIndexMax];
  const x = 0.5 + Math.floor(_index_ts__WEBPACK_IMPORTED_MODULE_1__.xAtTime(timeline, time));
  ctx.strokeStyle = prefs.timeline.selectionCursorColor;
  ctx.fillStyle = prefs.timeline.selectionCursorColor;
  ctx.lineCap = "square";
  ctx.lineWidth = 2;
  const headYSize = 10;
  const headXSize = headYSize * (tipOffsetSide ? -1 : 1);
  const y1 = Math.floor(laneMin.rect.y);
  const y2 = Math.floor(laneMax.rect.y2);
  ctx.beginPath();
  ctx.moveTo(x, y1 + headYSize);
  ctx.lineTo(x + headXSize, y1);
  ctx.lineTo(x, y1);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y2 - headYSize);
  ctx.lineTo(x + headXSize, y2);
  ctx.lineTo(x, y2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y1 + 1);
  ctx.lineTo(x, y2 - 1);
  ctx.stroke();
}
function drawCursorBkg(timeline, ctx, lane) {
  if (!timeline.cursor.visible) return;
  const prefs = _state_ts__WEBPACK_IMPORTED_MODULE_0__.get().prefs;
  const timeMin = timeline.cursor.time1.min(timeline.cursor.time2);
  const timeMax = timeline.cursor.time1.max(timeline.cursor.time2);
  const laneIndexMin = _index_ts__WEBPACK_IMPORTED_MODULE_1__.cursorGetLaneIndexMin(timeline);
  const laneIndexMax = _index_ts__WEBPACK_IMPORTED_MODULE_1__.cursorGetLaneIndexMax(timeline);
  if (laneIndexMin > lane.laneIndex || laneIndexMax < lane.laneIndex) return;
  const y1 = Math.floor(lane.rect.y);
  const y2 = Math.floor(lane.rect.y2);
  const x1 = _index_ts__WEBPACK_IMPORTED_MODULE_1__.xAtTime(timeline, timeMin);
  const x2 = _index_ts__WEBPACK_IMPORTED_MODULE_1__.xAtTime(timeline, timeMax);
  ctx.fillStyle = prefs.timeline.selectionBkgColor;
  ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
}

/***/ }),

/***/ "./src/timeline/index.ts":
/*!*******************************!*\
  !*** ./src/timeline/index.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Element: () => (/* reexport safe */ _Element_tsx__WEBPACK_IMPORTED_MODULE_0__.Element),
/* harmony export */   Layout: () => (/* reexport safe */ _layout_ts__WEBPACK_IMPORTED_MODULE_2__.Layout),
/* harmony export */   MouseAction: () => (/* reexport safe */ _timeline_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction),
/* harmony export */   cursorGetLaneIndexMax: () => (/* reexport safe */ _timeline_ts__WEBPACK_IMPORTED_MODULE_1__.cursorGetLaneIndexMax),
/* harmony export */   cursorGetLaneIndexMin: () => (/* reexport safe */ _timeline_ts__WEBPACK_IMPORTED_MODULE_1__.cursorGetLaneIndexMin),
/* harmony export */   cursorSetTime: () => (/* reexport safe */ _timeline_ts__WEBPACK_IMPORTED_MODULE_1__.cursorSetTime),
/* harmony export */   cursorSetTrack: () => (/* reexport safe */ _timeline_ts__WEBPACK_IMPORTED_MODULE_1__.cursorSetTrack),
/* harmony export */   draw: () => (/* reexport safe */ _draw_ts__WEBPACK_IMPORTED_MODULE_11__.draw),
/* harmony export */   drawLaneBkgCenterStroke: () => (/* reexport safe */ _draw_ts__WEBPACK_IMPORTED_MODULE_11__.drawLaneBkgCenterStroke),
/* harmony export */   drawLaneBkgMeasures: () => (/* reexport safe */ _draw_ts__WEBPACK_IMPORTED_MODULE_11__.drawLaneBkgMeasures),
/* harmony export */   drawLaneBkgOctaves: () => (/* reexport safe */ _draw_ts__WEBPACK_IMPORTED_MODULE_11__.drawLaneBkgOctaves),
/* harmony export */   drawLaneBkgSolid: () => (/* reexport safe */ _draw_ts__WEBPACK_IMPORTED_MODULE_11__.drawLaneBkgSolid),
/* harmony export */   drawLaneFrgOutline: () => (/* reexport safe */ _draw_ts__WEBPACK_IMPORTED_MODULE_11__.drawLaneFrgOutline),
/* harmony export */   keyDown: () => (/* reexport safe */ _key_down_ts__WEBPACK_IMPORTED_MODULE_9__.keyDown),
/* harmony export */   keyUp: () => (/* reexport safe */ _key_up_ts__WEBPACK_IMPORTED_MODULE_10__.keyUp),
/* harmony export */   laneIndexAtY: () => (/* reexport safe */ _timeline_ts__WEBPACK_IMPORTED_MODULE_1__.laneIndexAtY),
/* harmony export */   layout: () => (/* reexport safe */ _layout_ts__WEBPACK_IMPORTED_MODULE_2__.layout),
/* harmony export */   layoutLaneNotes: () => (/* reexport safe */ _layout_notes_ts__WEBPACK_IMPORTED_MODULE_3__.layoutLaneNotes),
/* harmony export */   makeNew: () => (/* reexport safe */ _timeline_ts__WEBPACK_IMPORTED_MODULE_1__.makeNew),
/* harmony export */   mouseDown: () => (/* reexport safe */ _mouse_down_ts__WEBPACK_IMPORTED_MODULE_5__.mouseDown),
/* harmony export */   mouseDrag: () => (/* reexport safe */ _mouse_drag_ts__WEBPACK_IMPORTED_MODULE_6__.mouseDrag),
/* harmony export */   mouseMove: () => (/* reexport safe */ _mouse_move_ts__WEBPACK_IMPORTED_MODULE_4__.mouseMove),
/* harmony export */   mouseUp: () => (/* reexport safe */ _mouse_up_ts__WEBPACK_IMPORTED_MODULE_7__.mouseUp),
/* harmony export */   mouseWheel: () => (/* reexport safe */ _mouse_wheel_ts__WEBPACK_IMPORTED_MODULE_8__.mouseWheel),
/* harmony export */   pitchForRow: () => (/* reexport safe */ _layout_notes_ts__WEBPACK_IMPORTED_MODULE_3__.pitchForRow),
/* harmony export */   pointAt: () => (/* reexport safe */ _timeline_ts__WEBPACK_IMPORTED_MODULE_1__.pointAt),
/* harmony export */   resize: () => (/* reexport safe */ _timeline_ts__WEBPACK_IMPORTED_MODULE_1__.resize),
/* harmony export */   rowAtY: () => (/* reexport safe */ _layout_notes_ts__WEBPACK_IMPORTED_MODULE_3__.rowAtY),
/* harmony export */   rowForPitch: () => (/* reexport safe */ _layout_notes_ts__WEBPACK_IMPORTED_MODULE_3__.rowForPitch),
/* harmony export */   selectionAdd: () => (/* reexport safe */ _timeline_ts__WEBPACK_IMPORTED_MODULE_1__.selectionAdd),
/* harmony export */   selectionAddAtCursor: () => (/* reexport safe */ _timeline_ts__WEBPACK_IMPORTED_MODULE_1__.selectionAddAtCursor),
/* harmony export */   selectionClear: () => (/* reexport safe */ _timeline_ts__WEBPACK_IMPORTED_MODULE_1__.selectionClear),
/* harmony export */   selectionRange: () => (/* reexport safe */ _timeline_ts__WEBPACK_IMPORTED_MODULE_1__.selectionRange),
/* harmony export */   selectionToggle: () => (/* reexport safe */ _timeline_ts__WEBPACK_IMPORTED_MODULE_1__.selectionToggle),
/* harmony export */   timeAtX: () => (/* reexport safe */ _timeline_ts__WEBPACK_IMPORTED_MODULE_1__.timeAtX),
/* harmony export */   timeRangeAtX: () => (/* reexport safe */ _timeline_ts__WEBPACK_IMPORTED_MODULE_1__.timeRangeAtX),
/* harmony export */   visibleTimeRange: () => (/* reexport safe */ _timeline_ts__WEBPACK_IMPORTED_MODULE_1__.visibleTimeRange),
/* harmony export */   xAtTime: () => (/* reexport safe */ _timeline_ts__WEBPACK_IMPORTED_MODULE_1__.xAtTime),
/* harmony export */   yForRow: () => (/* reexport safe */ _layout_notes_ts__WEBPACK_IMPORTED_MODULE_3__.yForRow)
/* harmony export */ });
/* harmony import */ var _Element_tsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Element.tsx */ "./src/timeline/Element.tsx");
/* harmony import */ var _timeline_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./timeline.ts */ "./src/timeline/timeline.ts");
/* harmony import */ var _layout_ts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./layout.ts */ "./src/timeline/layout.ts");
/* harmony import */ var _layout_notes_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./layout_notes.ts */ "./src/timeline/layout_notes.ts");
/* harmony import */ var _mouse_move_ts__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./mouse_move.ts */ "./src/timeline/mouse_move.ts");
/* harmony import */ var _mouse_down_ts__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./mouse_down.ts */ "./src/timeline/mouse_down.ts");
/* harmony import */ var _mouse_drag_ts__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./mouse_drag.ts */ "./src/timeline/mouse_drag.ts");
/* harmony import */ var _mouse_up_ts__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./mouse_up.ts */ "./src/timeline/mouse_up.ts");
/* harmony import */ var _mouse_wheel_ts__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./mouse_wheel.ts */ "./src/timeline/mouse_wheel.ts");
/* harmony import */ var _key_down_ts__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./key_down.ts */ "./src/timeline/key_down.ts");
/* harmony import */ var _key_up_ts__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./key_up.ts */ "./src/timeline/key_up.ts");
/* harmony import */ var _draw_ts__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./draw.ts */ "./src/timeline/draw.ts");













/***/ }),

/***/ "./src/timeline/key_down.ts":
/*!**********************************!*\
  !*** ./src/timeline/key_down.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   keyDown: () => (/* binding */ keyDown)
/* harmony export */ });
function keyDown(timeline, key) {
  timeline.keysDown.add(key);
}

/***/ }),

/***/ "./src/timeline/key_up.ts":
/*!********************************!*\
  !*** ./src/timeline/key_up.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   keyUp: () => (/* binding */ keyUp)
/* harmony export */ });
function keyUp(timeline, key) {
  timeline.keysDown.delete(key);
}

/***/ }),

/***/ "./src/timeline/layout.ts":
/*!********************************!*\
  !*** ./src/timeline/layout.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Layout: () => (/* binding */ Layout),
/* harmony export */   layout: () => (/* binding */ layout)
/* harmony export */ });
/* harmony import */ var _project__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../project */ "./src/project/index.ts");
/* harmony import */ var _index_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.ts */ "./src/timeline/index.ts");
/* harmony import */ var _utils_rect_ts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/rect.ts */ "./src/utils/rect.ts");



class Layout {
  lanes = [];
  elements = [];
  elementCount = 0;
  measures = [];
  keyRegions = [];
  constructor() {}
  add(parent, elem) {
    this.elementCount++;
    if (parent !== undefined) {
      if (parent.subElements === undefined) parent.subElements = [];
      parent.subElements.push(elem);
    } else {
      this.elements.push(elem);
      if (elem.kind === "lane" || elem.kind === "laneNotes") this.lanes.push(elem);
    }
  }
}
function layout(timeline, project) {
  const layout = new Layout();
  layout.range = _index_ts__WEBPACK_IMPORTED_MODULE_1__.visibleTimeRange(timeline);
  layout.measures = [..._project__WEBPACK_IMPORTED_MODULE_0__.iterMeasuresAtRange(project, layout.range)];
  layout.keyRegions = [...iterKeyChangePairsAtRange(timeline, project, layout.range)];
  const laneMarkerH = 32;
  const laneChordH = 60;
  const laneMarginH = 8;
  const laneKeyChanges = {
    kind: "lane",
    laneIndex: 0,
    rect: new _utils_rect_ts__WEBPACK_IMPORTED_MODULE_2__["default"](0, 0, timeline.renderRect.w, laneMarkerH)
  };
  const laneMeterChanges = {
    kind: "lane",
    laneIndex: 1,
    rect: new _utils_rect_ts__WEBPACK_IMPORTED_MODULE_2__["default"](0, laneMarkerH + laneMarginH, timeline.renderRect.w, laneMarkerH)
  };
  const laneChords = {
    kind: "lane",
    laneIndex: 2,
    rect: new _utils_rect_ts__WEBPACK_IMPORTED_MODULE_2__["default"](0, laneMarkerH + laneMarginH + laneMarkerH + laneMarginH, timeline.renderRect.w, laneChordH)
  };
  const laneNotesY = laneMarkerH + laneMarginH + laneMarkerH + laneMarginH + laneChordH + laneMarginH;
  const laneNotes = {
    kind: "laneNotes",
    laneIndex: 3,
    rect: new _utils_rect_ts__WEBPACK_IMPORTED_MODULE_2__["default"](0, laneNotesY, timeline.renderRect.w, timeline.renderRect.h - laneNotesY)
  };
  layout.add(undefined, laneKeyChanges);
  layout.add(undefined, laneMeterChanges);
  layout.add(undefined, laneChords);
  layout.add(undefined, laneNotes);
  layout.laneNotes = laneNotes;
  _index_ts__WEBPACK_IMPORTED_MODULE_1__.layoutLaneNotes(timeline, project, layout, laneNotes);
  timeline.layout = layout;
  console.log(layout.elementCount, layout);
}
function* iterKeyChangePairsAtRange(timeline, project, range) {
  const keyChangeTrackId = _project__WEBPACK_IMPORTED_MODULE_0__.keyChangeTrackId(project);
  const keyChangeTrackTimedElems = project.lists.get(keyChangeTrackId);
  if (!keyChangeTrackTimedElems) return;
  const firstKeyCh = keyChangeTrackTimedElems.findFirst();
  const defaultKey = firstKeyCh?.key ?? _project__WEBPACK_IMPORTED_MODULE_0__.defaultKey();
  for (const pair of keyChangeTrackTimedElems.iterActiveAtRangePairwise(range)) {
    const keyCh1 = pair[0] ?? _project__WEBPACK_IMPORTED_MODULE_0__.makeKeyChange(-1, range.start, defaultKey);
    const keyCh2 = pair[1] ?? _project__WEBPACK_IMPORTED_MODULE_0__.makeKeyChange(-1, range.end, defaultKey);
    const x1 = _index_ts__WEBPACK_IMPORTED_MODULE_1__.xAtTime(timeline, keyCh1.range.start);
    const x2 = _index_ts__WEBPACK_IMPORTED_MODULE_1__.xAtTime(timeline, keyCh2.range.start);
    yield {
      keyCh1,
      keyCh2,
      x1,
      x2
    };
  }
}

/***/ }),

/***/ "./src/timeline/layout_notes.ts":
/*!**************************************!*\
  !*** ./src/timeline/layout_notes.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   layoutLaneNotes: () => (/* binding */ layoutLaneNotes),
/* harmony export */   pitchForRow: () => (/* binding */ pitchForRow),
/* harmony export */   rowAtY: () => (/* binding */ rowAtY),
/* harmony export */   rowForPitch: () => (/* binding */ rowForPitch),
/* harmony export */   yForRow: () => (/* binding */ yForRow)
/* harmony export */ });
/* harmony import */ var _theory__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../theory */ "./src/theory/index.ts");
/* harmony import */ var _index_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.ts */ "./src/timeline/index.ts");
/* harmony import */ var _utils_rect_ts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/rect.ts */ "./src/utils/rect.ts");
/* harmony import */ var _utils_range_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/range.ts */ "./src/utils/range.ts");




function layoutLaneNotes(timeline, project, layout, laneNotes) {
  laneNotes.iterElementsAtRegion = (timeline, project, range, verticalRegion) => iterNotesAtRegion(timeline, project, laneNotes, range, verticalRegion);
  for (const [note, keyChPair] of iterNotesAndKeyChanges(timeline, project, layout)) {
    const key = keyChPair.keyCh1.key;
    const row = rowForPitch(note.midiPitch, key);
    const [rect, cutStart, cutEnd] = rectForNote(timeline, laneNotes, note.range, row, keyChPair.x1, keyChPair.x2, true);
    if (!cutStart) {
      const rectStretchStart = rect.withX1(rect.x1 - 8);
      layout.add(laneNotes, {
        kind: "hidden",
        id: note.id,
        action: _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.StretchTimeStart,
        rect: rectStretchStart
      });
    }
    if (!cutEnd) {
      const rectStretchEnd = rect.withX2(rect.x2 + 8);
      layout.add(laneNotes, {
        kind: "hidden",
        id: note.id,
        action: _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.StretchTimeEnd,
        rect: rectStretchEnd
      });
    }
    layout.add(laneNotes, {
      kind: "note",
      id: note.id,
      action: _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.DragTimeAndRow,
      rect,
      priority: 1
    });
  }
}
function* iterNotesAndKeyChanges(timeline, project, layout) {
  for (const keyRegion of layout.keyRegions) {
    const time1 = keyRegion.keyCh1.range.start.max(layout.range.start);
    const time2 = keyRegion.keyCh2.range.start.min(layout.range.end);
    for (const note of iterNotes(timeline, project, new _utils_range_ts__WEBPACK_IMPORTED_MODULE_3__["default"](time1, time2))) yield [note, keyRegion];
  }
}
function* iterNotes(timeline, project, range) {
  const list = project.lists.get(project.noteTrackId);
  if (!list) return;
  for (const elem of list.iterAtRange(range)) yield elem;
}
function rowForPitch(pitch, key) {
  const tonicRowOffset = _theory__WEBPACK_IMPORTED_MODULE_0__.Utils.chromaToDegreeInCMajor(key.tonic.chroma);
  return key.octavedDegreeForMidi(pitch - _theory__WEBPACK_IMPORTED_MODULE_0__.Utils.midiMiddleC) + tonicRowOffset;
}
function pitchForRow(row, key) {
  const tonicRowOffset = _theory__WEBPACK_IMPORTED_MODULE_0__.Utils.chromaToDegreeInCMajor(key.tonic.chroma);
  return key.midiForDegree(row - Math.floor(tonicRowOffset)) + _theory__WEBPACK_IMPORTED_MODULE_0__.Utils.midiMiddleC;
}
function yForRow(timeline, lane, row) {
  return lane.rect.y + lane.rect.h / 2 - (row + 1) * timeline.noteRowH - timeline.yScroll;
}
function rowAtY(timeline, lane, y) {
  return -Math.floor((y - lane.rect.y + timeline.yScroll - lane.rect.h / 2) / timeline.noteRowH) - 1;
}
function rectForNote(timeline, lane, noteRange, noteRow, keyChXStart, keyChXEnd, clampY) {
  const noteOrigX1 = _index_ts__WEBPACK_IMPORTED_MODULE_1__.xAtTime(timeline, noteRange.start);
  const noteOrigX2 = _index_ts__WEBPACK_IMPORTED_MODULE_1__.xAtTime(timeline, noteRange.end);
  let noteY = 0.5 + Math.floor(yForRow(timeline, lane, noteRow));
  if (clampY) {
    noteY = Math.max(lane.rect.y - timeline.noteRowH / 2, Math.min(lane.rect.y + lane.rect.h - timeline.noteRowH / 2, noteY));
  }
  let noteX1 = Math.max(noteOrigX1, keyChXStart);
  let noteX2 = Math.min(noteOrigX2, keyChXEnd);
  const cutStart = noteOrigX1 < noteX1;
  const cutEnd = noteOrigX2 > noteX2;

  //if (!cutStart) noteX1 += 1
  //if (!cutEnd)   noteX2 -= 1

  noteX1 = 0.5 + Math.floor(noteX1);
  noteX2 = 0.5 + Math.floor(noteX2);
  const noteW = Math.max(2, noteX2 - noteX1);
  return [new _utils_rect_ts__WEBPACK_IMPORTED_MODULE_2__["default"](noteX1, noteY, noteW, timeline.noteRowH), cutStart, cutEnd];
}
function* iterNotesAtRegion(timeline, project, lane, range, verticalRegion) {
  for (const [note, keyChPair] of iterNotesAndKeyChanges(timeline, project, timeline.layout)) {
    if (!note.range.overlapsRange(range)) continue;
    if (verticalRegion !== undefined) {
      const [rect] = rectForNote(timeline, lane, note.range, rowForPitch(note.midiPitch, keyChPair.keyCh1.key), keyChPair.x1, keyChPair.x2, false);
      if (verticalRegion.y1 > rect.y2 || verticalRegion.y2 < rect.y1) continue;
    }
    yield note.id;
  }
}

/***/ }),

/***/ "./src/timeline/mouse_down.ts":
/*!************************************!*\
  !*** ./src/timeline/mouse_down.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mouseDown: () => (/* binding */ mouseDown)
/* harmony export */ });
/* harmony import */ var _index_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.ts */ "./src/timeline/index.ts");
/* harmony import */ var _utils_rational_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/rational.ts */ "./src/utils/rational.ts");


function mouseDown(timeline, project, prefs, rightButton) {
  if (timeline.mouse.down) return;
  const prevDownDate = timeline.mouse.downDate;
  timeline.mouse.down = true;
  timeline.mouse.downDate = new Date();
  timeline.mouse.action = _index_ts__WEBPACK_IMPORTED_MODULE_0__.MouseAction.None;
  const selectMultiple = timeline.keysDown.has(prefs.timeline.keySelectMultiple);
  const selectRange = timeline.keysDown.has(prefs.timeline.keySelectRange);
  const selectClone = timeline.keysDown.has(prefs.timeline.keySelectClone);
  const selectRect = timeline.keysDown.has(prefs.timeline.keySelectRect);
  const forcePan = timeline.keysDown.has(prefs.timeline.keyPan);
  const doubleClick = timeline.mouse.downDate.getTime() - prevDownDate.getTime() < prefs.timeline.mouseDoubleClickThresholdMs;
  timeline.drag = {
    origin: {
      point: {
        ...timeline.mouse.point
      },
      range: null,
      timeScroll: timeline.timeScroll,
      yScroll: timeline.yScroll,
      project
    },
    xLocked: true,
    yLocked: true,
    posDelta: {
      x: 0,
      y: 0
    },
    timeDelta: new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_1__["default"](0),
    rowDelta: 0,
    trackDelta: 0,
    trackInsertionBefore: -1,
    elemId: -1,
    notePreviewLast: null
  };
  if (rightButton || forcePan) {
    timeline.mouse.action = _index_ts__WEBPACK_IMPORTED_MODULE_0__.MouseAction.Pan;
    return;
  }
  const hoverIsSelected = timeline.hover !== undefined && timeline.hover.id !== undefined && timeline.selection.has(timeline.hover.id);
  if (!selectMultiple && !hoverIsSelected) _index_ts__WEBPACK_IMPORTED_MODULE_0__.selectionClear(timeline);
  if (timeline.hover === undefined || timeline.hover.action === undefined) {
    timeline.mouse.action = _index_ts__WEBPACK_IMPORTED_MODULE_0__.MouseAction.SelectCursor;
    timeline.cursor.visible = true; //!selectRect
    _index_ts__WEBPACK_IMPORTED_MODULE_0__.cursorSetTime(timeline, timeline.mouse.point.time, timeline.mouse.point.time);
    timeline.cursor.rectY1 = timeline.cursor.rectY2 = timeline.mouse.point.trackPos.y;
    timeline.cursor.laneIndex1 = timeline.cursor.laneIndex2 = timeline.mouse.point.laneIndex;

    /*if (doubleClick)
    {
        const anchor = Timeline.findPreviousAnchor(
            timeline, timeline.mouse.point.time,
            timeline.mouse.point.trackIndex, timeline.mouse.point.trackIndex)
            
        Timeline.cursorSetTime(timeline, anchor, anchor)
        Timeline.scrollTimeIntoView(timeline, anchor)
    }*/

    return;
  }
  if (timeline.hover !== undefined) {
    timeline.cursor.visible = false;
    if (!hoverIsSelected) _index_ts__WEBPACK_IMPORTED_MODULE_0__.selectionToggle(timeline, project, timeline.hover);
    timeline.drag.origin.range = _index_ts__WEBPACK_IMPORTED_MODULE_0__.selectionRange(timeline, project);
    timeline.mouse.action = timeline.hover.action;
    return;
  }
}

/***/ }),

/***/ "./src/timeline/mouse_drag.ts":
/*!************************************!*\
  !*** ./src/timeline/mouse_drag.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mouseDrag: () => (/* binding */ mouseDrag)
/* harmony export */ });
/* harmony import */ var _project__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../project */ "./src/project/index.ts");
/* harmony import */ var _index_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.ts */ "./src/timeline/index.ts");
/* harmony import */ var _utils_range_ts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/range.ts */ "./src/utils/range.ts");



function mouseDrag(timeline, project) {
  if (!timeline.mouse.down) return false;
  timeline.mouse.pointPrev = timeline.mouse.point;
  timeline.mouse.point = _index_ts__WEBPACK_IMPORTED_MODULE_1__.pointAt(timeline, timeline.mouse.point.pos.x, timeline.mouse.point.pos.y);
  timeline.drag.posDelta = {
    x: timeline.mouse.point.pos.x - timeline.drag.origin.point.pos.x,
    y: timeline.mouse.point.pos.y - timeline.drag.origin.point.pos.y
  };
  timeline.drag.timeDelta = timeline.mouse.point.time.subtract(timeline.drag.origin.point.time);
  timeline.drag.rowDelta = timeline.mouse.point.row - timeline.drag.origin.point.row;
  timeline.drag.xLocked = timeline.drag.xLocked && Math.abs(timeline.drag.posDelta.x) < 10;
  timeline.drag.yLocked = timeline.drag.yLocked && Math.abs(timeline.drag.posDelta.y) < 10;
  if (timeline.mouse.action === _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.Pan) return handlePanning(timeline, project);else if (timeline.mouse.action === _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.SelectCursor) return handleSelectCursor(timeline, project);else return handleDragElements(timeline, project);
}
function handlePanning(timeline, project) {
  timeline.timeScroll = timeline.drag.origin.timeScroll - timeline.drag.posDelta.x / timeline.timeScale;
  timeline.yScroll = timeline.drag.origin.yScroll - timeline.drag.posDelta.y;
  return true;
}
function handleSelectCursor(timeline, project) {
  timeline.cursor.time2 = timeline.mouse.point.time;
  timeline.cursor.laneIndex2 = timeline.mouse.point.laneIndex;
  _index_ts__WEBPACK_IMPORTED_MODULE_1__.selectionClear(timeline);
  _index_ts__WEBPACK_IMPORTED_MODULE_1__.selectionAddAtCursor(timeline, project.root);
  return true;
}
function handleDragElements(timeline, project) {
  let action = timeline.mouse.action;
  if (timeline.drag.xLocked) {
    if (action === _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.DragTime || action === _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.StretchTimeStart || action === _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.StretchTimeEnd) action = _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.None;else if (action === _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.DragTimeAndRow) action = _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.DragRow;
  }
  if (timeline.drag.yLocked) {
    if (action === _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.DragTimeAndRow) action = _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.DragTime;else if (action === _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.DragRow) action = _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.None;
  }
  const origProject = timeline.drag.origin.project;
  let newProject = origProject;
  for (const id of timeline.selection) {
    const elem = origProject.elems.get(id);
    if (!elem) continue;
    if (elem.type === "track") continue;
    const changes = {};
    if (action == _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.DragTime || action == _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.DragTimeAndRow) {
      changes.range = elem.range.displace(timeline.drag.timeDelta).quantize(_project__WEBPACK_IMPORTED_MODULE_0__.MAX_RATIONAL_DENOMINATOR);
    }
    if (action == _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.StretchTimeStart && timeline.drag.origin.range) {
      changes.range = _project__WEBPACK_IMPORTED_MODULE_0__.getAbsoluteRange(origProject, elem.parentId, elem.range);
      changes.range = changes.range.stretch(timeline.drag.timeDelta, timeline.drag.origin.range.end, timeline.drag.origin.range.start);
      if (elem.range.start.compare(timeline.drag.origin.range.start) == 0) changes.range = new _utils_range_ts__WEBPACK_IMPORTED_MODULE_2__["default"](changes.range.start.snap(timeline.timeSnap), changes.range.end).quantize(_project__WEBPACK_IMPORTED_MODULE_0__.MAX_RATIONAL_DENOMINATOR);
      changes.range = changes.range.sorted();
      changes.range = _project__WEBPACK_IMPORTED_MODULE_0__.getRelativeRange(origProject, elem.parentId, changes.range);
    }
    if (action == _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.StretchTimeEnd && timeline.drag.origin.range) {
      changes.range = _project__WEBPACK_IMPORTED_MODULE_0__.getAbsoluteRange(origProject, elem.parentId, elem.range);
      changes.range = changes.range.stretch(timeline.drag.timeDelta, timeline.drag.origin.range.start, timeline.drag.origin.range.end);
      if (elem.range.end.compare(timeline.drag.origin.range.end) == 0) changes.range = new _utils_range_ts__WEBPACK_IMPORTED_MODULE_2__["default"](changes.range.start, changes.range.end.snap(timeline.timeSnap)).quantize(_project__WEBPACK_IMPORTED_MODULE_0__.MAX_RATIONAL_DENOMINATOR);
      changes.range = changes.range.sorted();
      changes.range = _project__WEBPACK_IMPORTED_MODULE_0__.getRelativeRange(origProject, elem.parentId, changes.range);
    }
    if ((action == _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.DragRow || action == _index_ts__WEBPACK_IMPORTED_MODULE_1__.MouseAction.DragTimeAndRow) && elem.type === "note") {
      const note = elem;
      const trackId = project.root.noteTrackId;
      const key = _project__WEBPACK_IMPORTED_MODULE_0__.keyAt(project.root, trackId, note.range.start);
      const degree = key.octavedDegreeForMidi(note.midiPitch);
      const newPitch = key.midiForDegree(Math.floor(degree + timeline.drag.rowDelta));
      changes.midiPitch = newPitch;
    }
    newProject = _project__WEBPACK_IMPORTED_MODULE_0__.upsertElement(newProject, _project__WEBPACK_IMPORTED_MODULE_0__.elemModify(elem, changes));
  }
  project.root = newProject;
  return newProject !== origProject;
}

/***/ }),

/***/ "./src/timeline/mouse_move.ts":
/*!************************************!*\
  !*** ./src/timeline/mouse_move.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mouseMove: () => (/* binding */ mouseMove)
/* harmony export */ });
/* harmony import */ var _index_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.ts */ "./src/timeline/index.ts");

function mouseMove(timeline, project, x, y) {
  timeline.mouse.point = _index_ts__WEBPACK_IMPORTED_MODULE_0__.pointAt(timeline, x, y);
  if (!timeline.mouse.down) {
    timeline.hover = undefined;
    hoverRecursive(timeline, timeline.layout.elements, x, y);
  }
}
function hoverRecursive(timeline, elements, x, y) {
  for (const elem of elements) {
    if (x >= elem.rect.x && x < elem.rect.x + elem.rect.w && y >= elem.rect.y && y < elem.rect.y + elem.rect.h) {
      if (timeline.hover === undefined || (elem.priority ?? 0) >= (timeline.hover.priority ?? 0)) timeline.hover = elem;
      if (elem.subElements) hoverRecursive(timeline, elem.subElements, x, y);
    }
  }
}

/***/ }),

/***/ "./src/timeline/mouse_up.ts":
/*!**********************************!*\
  !*** ./src/timeline/mouse_up.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mouseUp: () => (/* binding */ mouseUp)
/* harmony export */ });
/* harmony import */ var _index_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.ts */ "./src/timeline/index.ts");

function mouseUp(timeline, project, rightButton) {
  if (!timeline.mouse.down) return;
  timeline.mouse.down = false;
  timeline.mouse.action = _index_ts__WEBPACK_IMPORTED_MODULE_0__.MouseAction.None;
}

/***/ }),

/***/ "./src/timeline/mouse_wheel.ts":
/*!*************************************!*\
  !*** ./src/timeline/mouse_wheel.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mouseWheel: () => (/* binding */ mouseWheel)
/* harmony export */ });
/* harmony import */ var _index_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.ts */ "./src/timeline/index.ts");
/* harmony import */ var _utils_rational_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/rational.ts */ "./src/utils/rational.ts");


function mouseWheel(timeline, deltaX, deltaY) {
  if (Math.abs(deltaX) > 0) {
    timeline.timeScroll = timeline.timeScroll + 0.01 / (timeline.timeScale / 100) * deltaX;
    timeline.mouse.wheelDate = new Date();
  } else if (new Date().getTime() - timeline.mouse.wheelDate.getTime() > 250) {
    const snap = new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_1__["default"](1, 1024);
    const prevMouseTime = _index_ts__WEBPACK_IMPORTED_MODULE_0__.timeAtX(timeline, timeline.mouse.point.pos.x, snap);
    let newTimeScale = timeline.timeScale * (deltaY > 0 ? 0.8 : 1.25);
    newTimeScale = Math.max(4, Math.min(2048, newTimeScale));
    timeline.timeScale = newTimeScale;
    const newMouseTime = _index_ts__WEBPACK_IMPORTED_MODULE_0__.timeAtX(timeline, timeline.mouse.point.pos.x, snap);
    const newTimeScroll = timeline.timeScroll - newMouseTime.subtract(prevMouseTime).asFloat();
    const timeSnapAdjustThresholdUpper = 24;
    const timeSnapAdjustThresholdLower = 8;
    let newTimeSnap = timeline.timeSnapBase;
    if (newTimeSnap.asFloat() * newTimeScale > timeSnapAdjustThresholdUpper) while (newTimeSnap.asFloat() * newTimeScale > timeSnapAdjustThresholdUpper) newTimeSnap = newTimeSnap.divide(new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_1__["default"](2));else if (newTimeSnap.asFloat() * newTimeScale < timeSnapAdjustThresholdLower) while (newTimeSnap.asFloat() * newTimeScale < timeSnapAdjustThresholdLower) newTimeSnap = newTimeSnap.divide(new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_1__["default"](1, 2));
    timeline.timeScroll = newTimeScroll;
    timeline.timeSnap = newTimeSnap;
  }
}

/***/ }),

/***/ "./src/timeline/timeline.ts":
/*!**********************************!*\
  !*** ./src/timeline/timeline.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MouseAction: () => (/* binding */ MouseAction),
/* harmony export */   cursorGetLaneIndexMax: () => (/* binding */ cursorGetLaneIndexMax),
/* harmony export */   cursorGetLaneIndexMin: () => (/* binding */ cursorGetLaneIndexMin),
/* harmony export */   cursorSetTime: () => (/* binding */ cursorSetTime),
/* harmony export */   cursorSetTrack: () => (/* binding */ cursorSetTrack),
/* harmony export */   laneIndexAtY: () => (/* binding */ laneIndexAtY),
/* harmony export */   makeNew: () => (/* binding */ makeNew),
/* harmony export */   pointAt: () => (/* binding */ pointAt),
/* harmony export */   resize: () => (/* binding */ resize),
/* harmony export */   selectionAdd: () => (/* binding */ selectionAdd),
/* harmony export */   selectionAddAtCursor: () => (/* binding */ selectionAddAtCursor),
/* harmony export */   selectionClear: () => (/* binding */ selectionClear),
/* harmony export */   selectionRange: () => (/* binding */ selectionRange),
/* harmony export */   selectionToggle: () => (/* binding */ selectionToggle),
/* harmony export */   timeAtX: () => (/* binding */ timeAtX),
/* harmony export */   timeRangeAtX: () => (/* binding */ timeRangeAtX),
/* harmony export */   visibleTimeRange: () => (/* binding */ visibleTimeRange),
/* harmony export */   xAtTime: () => (/* binding */ xAtTime)
/* harmony export */ });
/* harmony import */ var immutable__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! immutable */ "./node_modules/immutable/dist/immutable.es.js");
/* harmony import */ var _project__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../project */ "./src/project/index.ts");
/* harmony import */ var _index_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.ts */ "./src/timeline/index.ts");
/* harmony import */ var _utils_rational_ts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/rational.ts */ "./src/utils/rational.ts");
/* harmony import */ var _utils_range_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/range.ts */ "./src/utils/range.ts");
/* harmony import */ var _utils_rect_ts__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/rect.ts */ "./src/utils/rect.ts");






let MouseAction = /*#__PURE__*/function (MouseAction) {
  MouseAction[MouseAction["None"] = 0] = "None";
  MouseAction[MouseAction["Pan"] = 1] = "Pan";
  MouseAction[MouseAction["DragTime"] = 2] = "DragTime";
  MouseAction[MouseAction["DragRow"] = 3] = "DragRow";
  MouseAction[MouseAction["DragTimeAndRow"] = 4] = "DragTimeAndRow";
  MouseAction[MouseAction["StretchTimeStart"] = 5] = "StretchTimeStart";
  MouseAction[MouseAction["StretchTimeEnd"] = 6] = "StretchTimeEnd";
  MouseAction[MouseAction["SelectCursor"] = 7] = "SelectCursor";
  return MouseAction;
}({});
function makeNew() {
  return {
    pixelRatio: 1,
    renderRect: new _utils_rect_ts__WEBPACK_IMPORTED_MODULE_4__["default"](0, 0, 0, 0),
    trackMeasuresH: 20,
    trackControlX: 10,
    trackControlY: 25,
    trackControlSize: 20,
    layout: new _index_ts__WEBPACK_IMPORTED_MODULE_1__.Layout(),
    hover: undefined,
    yScroll: 0,
    timeScroll: -2.5,
    timeScale: 100,
    timeSnap: new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_2__["default"](1, 8),
    timeSnapBase: new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_2__["default"](1, 16),
    noteRowH: 16,
    cursor: {
      visible: true,
      time1: new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_2__["default"](0),
      time2: new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_2__["default"](0),
      laneIndex1: 0,
      laneIndex2: 0,
      rectY1: 0,
      rectY2: 0
    },
    keysDown: new Set(),
    mouse: {
      down: false,
      downDate: new Date(),
      action: MouseAction.None,
      point: {
        pos: {
          x: 0,
          y: 0
        },
        time: new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_2__["default"](0),
        row: 0,
        laneIndex: 0,
        trackPos: {
          x: 0,
          y: 0
        },
        originTrackPos: {
          x: 0,
          y: 0
        }
      },
      pointPrev: {
        pos: {
          x: 0,
          y: 0
        },
        time: new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_2__["default"](0),
        row: 0,
        laneIndex: 0,
        trackPos: {
          x: 0,
          y: 0
        },
        originTrackPos: {
          x: 0,
          y: 0
        }
      },
      wheelDate: new Date()
    },
    drag: {
      origin: null,
      xLocked: true,
      yLocked: true,
      posDelta: {
        x: 0,
        y: 0
      },
      timeDelta: new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_2__["default"](0),
      rowDelta: 0,
      trackDelta: 0,
      trackInsertionBefore: -1,
      elemId: -1,
      notePreviewLast: null
    },
    insertion: {
      nearMidiPitch: 60,
      duration: new _utils_rational_ts__WEBPACK_IMPORTED_MODULE_2__["default"](1, 4)
    },
    selection: immutable__WEBPACK_IMPORTED_MODULE_5__["default"].Set(),
    needsKeyFinish: false,
    rangeSelectOriginTrackIndex: -1
  };
}
function resize(state, pixelRatio, rect) {
  state.pixelRatio = pixelRatio;
  state.renderRect = rect;
}
function xAtTime(timeline, time) {
  return (time.asFloat() - timeline.timeScroll) * timeline.timeScale;
}
function timeAtX(timeline, x, timeSnap) {
  timeSnap = timeSnap || timeline.timeSnap;
  const time = x / timeline.timeScale + timeline.timeScroll;
  return _utils_rational_ts__WEBPACK_IMPORTED_MODULE_2__["default"].fromFloat(time, timeSnap.denominator);
}
function timeRangeAtX(timeline, x1, x2, timeSnap) {
  timeSnap = timeSnap || timeline.timeSnap;
  return new _utils_range_ts__WEBPACK_IMPORTED_MODULE_3__["default"](timeAtX(timeline, x1, timeSnap).subtract(timeSnap), timeAtX(timeline, x2, timeSnap).add(timeSnap));
}
function visibleTimeRange(timeline) {
  return new _utils_range_ts__WEBPACK_IMPORTED_MODULE_3__["default"](timeAtX(timeline, 0).subtract(timeline.timeSnap), timeAtX(timeline, timeline.renderRect.w).add(timeline.timeSnap));
}
function laneIndexAtY(timeline, y) {
  if (y < 0) return -1;
  for (let i = 0; i < timeline.layout.lanes.length; i++) {
    const lane = timeline.layout.lanes[i];
    if (y < lane.rect.y2) return i;
  }
  return timeline.layout.lanes.length;
}
function pointAt(timeline, x, y) {
  const time = timeAtX(timeline, x);
  const row = timeline.layout.laneNotes ? _index_ts__WEBPACK_IMPORTED_MODULE_1__.rowAtY(timeline, timeline.layout.laneNotes, y) : 0;
  const laneIndex = laneIndexAtY(timeline, y);

  /*const trackPosY = pos.y - trackY(state, state.mouse.point.trackIndex)
  const trackPos = { x: pos.x, y: trackPosY }
      let originTrackPos = trackPos
  if (state.drag.origin)
  {
      const originTrackPosY = pos.y - trackY(state, state.drag.origin.point.trackIndex)
      originTrackPos = { x: pos.x, y: originTrackPosY }
  }*/

  return {
    pos: {
      x,
      y
    },
    time,
    laneIndex,
    trackPos: {
      x: 0,
      y: 0
    },
    row,
    originTrackPos: {
      x: 0,
      y: 0
    }
  };
}
function selectionClear(timeline) {
  timeline.selection = timeline.selection.clear();
}
function selectionRange(state, project) {
  return _project__WEBPACK_IMPORTED_MODULE_0__.getRangeForElems(project, state.selection);
}
function selectionToggle(timeline, project, element) {
  if (element.id === undefined || element.action === undefined) return;
  const alreadySelected = timeline.selection.has(element.id);
  if (!alreadySelected) timeline.selection = timeline.selection.add(element.id);else timeline.selection = timeline.selection.remove(element.id);
}
function selectionAdd(timeline, id) {
  timeline.selection = timeline.selection.add(id);
}
function selectionAddAtCursor(timeline, project, verticalRegion) {
  const time1 = timeline.cursor.time1;
  const time2 = timeline.cursor.time2;
  if (time1.compare(time2) === 0) return;
  const range = new _utils_range_ts__WEBPACK_IMPORTED_MODULE_3__["default"](time1, time2, false, false).sorted();
  const laneIndexMin = cursorGetLaneIndexMin(timeline);
  const laneIndexMax = cursorGetLaneIndexMax(timeline);
  for (let l = laneIndexMin; l <= laneIndexMax; l++) {
    const lane = timeline.layout.lanes[l];
    if (lane.iterElementsAtRegion === undefined) continue;
    for (const id of lane.iterElementsAtRegion(timeline, project, range, verticalRegion)) selectionAdd(timeline, id);
  }
}
function cursorSetTime(timeline, time1, time2) {
  timeline.cursor.time1 = time1 ?? timeline.cursor.time1;
  timeline.cursor.time2 = time2 ?? timeline.cursor.time2;
}
function cursorSetTrack(timeline, trackIndex1, trackIndex2) {
  timeline.cursor.laneIndex1 = Math.max(0, Math.min(timeline.layout.lanes.length - 1, trackIndex1 ?? timeline.cursor.laneIndex1));
  timeline.cursor.laneIndex2 = Math.max(0, Math.min(timeline.layout.lanes.length - 1, trackIndex2 ?? timeline.cursor.laneIndex2));
}
function cursorGetLaneIndexMin(timeline) {
  return Math.max(0, Math.min(timeline.cursor.laneIndex1, timeline.cursor.laneIndex2));
}
function cursorGetLaneIndexMax(timeline) {
  return Math.min(timeline.layout.lanes.length - 1, Math.max(timeline.cursor.laneIndex1, timeline.cursor.laneIndex2));
}

/***/ }),

/***/ "./src/utils/binarySearch.ts":
/*!***********************************!*\
  !*** ./src/utils/binarySearch.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BinarySearch)
/* harmony export */ });
class BinarySearch {
  static find(array, compareFn) {
    /*for (let i = 0; i < array.length; i++)
    {
        const comparison = compareFn(value, array[i])
        
        if (comparison <= 0)
            return i
    }
    
    return array.length*/

    let lo = -1;
    let hi = array.length;
    while (1 + lo < hi) {
      const mi = lo + (hi - lo >> 1);
      if (compareFn(array[mi]) <= 0) hi = mi;else lo = mi;
    }
    return hi;
  }
  static findExact(array, value, compareFn) {
    let i = BinarySearch.find(array, compareFn);
    while (i < array.length) {
      if (array[i] === value) return i;
      i += 1;
    }
    return null;
  }
  static findPreviousOrEqual(array, compareFn) {
    if (array.length == 0) return null;
    const i = BinarySearch.find(array, compareFn);
    if (i < array.length && compareFn(array[i]) == 0) return i;
    if (i > 0) return i - 1;
    return null;
  }
  static findPreviousNotEqual(array, compareFn) {
    if (array.length == 0) return null;
    const i = BinarySearch.find(array, compareFn);
    if (i > 0) return i - 1;
    return null;
  }
  static findNextNotEqual(array, compareFn) {
    if (array.length == 0) return null;
    let i = BinarySearch.find(array, compareFn);
    while (i < array.length) {
      if (compareFn(array[i]) != 0) break;
      i += 1;
    }
    if (i < array.length) return i;
    return null;
  }
  static *iterEqual(array, compareFn) {
    let i = BinarySearch.find(array, compareFn);
    while (i < array.length) {
      if (compareFn(array[i]) != 0) break;
      yield i;
      i += 1;
    }
  }
}

/***/ }),

/***/ "./src/utils/listOfRanges.ts":
/*!***********************************!*\
  !*** ./src/utils/listOfRanges.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ListOfRanges)
/* harmony export */ });
/* harmony import */ var assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! assert */ "?1e65");
/* harmony import */ var assert__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(assert__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var immutable__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! immutable */ "./node_modules/immutable/dist/immutable.es.js");
/* harmony import */ var _rational_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rational.ts */ "./src/utils/rational.ts");
/* harmony import */ var _range_ts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./range.ts */ "./src/utils/range.ts");
/* harmony import */ var _binarySearch_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./binarySearch.ts */ "./src/utils/binarySearch.ts");





class Bucket {
  constructor(start) {
    this.start = start;
    this.elems = [];
  }
}
class ListOfRanges {
  constructor() {
    this.idMap = immutable__WEBPACK_IMPORTED_MODULE_4__["default"].Map();
    this.buckets = [];
    this.bucketFn = t => t.asFloat();
  }
  clone() {
    let cloned = new ListOfRanges();
    cloned.idMap = this.idMap;
    cloned.buckets = this.buckets;
    cloned.bucketFn = this.bucketFn;
    return cloned;
  }
  clear() {
    return Object.assign(new ListOfRanges(), {
      bucketFn: this.bucketFn
    });
  }
  _ensureBucketsAtRange(range) {
    let newBuckets = [...this.buckets];
    if (this.buckets.length == 0) newBuckets = [new Bucket(0)];
    const start = this.bucketFn(range.start);
    while (start < newBuckets[0].start) {
      const newBucket = new Bucket(newBuckets[0].start - 1);
      newBuckets = [newBucket, ...newBuckets];
    }
    const end = this.bucketFn(range.end);
    while (end >= newBuckets[newBuckets.length - 1].start + 1) {
      const newBucket = new Bucket(newBuckets[newBuckets.length - 1].start + 1);
      newBuckets = [...newBuckets, newBucket];
    }
    const cloned = this.clone();
    cloned.buckets = newBuckets;
    return cloned;
  }
  *_iterBucketIndicesAtRange(range) {
    const start = this.bucketFn(range.start);
    const end = this.bucketFn(range.end);
    let b = _binarySearch_ts__WEBPACK_IMPORTED_MODULE_3__["default"].find(this.buckets, bucket => start - bucket.start);
    if (b > 0 && start < this.buckets[b - 1].start + 1) b -= 1;
    while (true) {
      if (b >= this.buckets.length || this.buckets[b].start > end) break;
      yield b;
      b += 1;
    }
  }
  get size() {
    return this.idMap.size;
  }
  update(elem) {
    if (!this.idMap.get(elem.id)) return this;
    return this.upsert(elem);
  }
  upsert(elem) {
    //console.log("upsert id", elem.id, "buckets", this.bucketFn(elem.range.start), this.bucketFn(elem.range.end),)

    let newList = this._ensureBucketsAtRange(elem.range);
    newList = newList.removeById(elem.id, false);
    for (const b of newList._iterBucketIndicesAtRange(elem.range)) {
      newList.buckets[b] = Object.assign({}, newList.buckets[b]);
      const newElemIndex = _binarySearch_ts__WEBPACK_IMPORTED_MODULE_3__["default"].find(newList.buckets[b].elems, e => elem.range.start.compare(e.range.start));
      //console.log("- add to bucket", b, "at elem", newElemIndex)

      newList.buckets[b].elems = [...newList.buckets[b].elems.slice(0, newElemIndex), elem, ...newList.buckets[b].elems.slice(newElemIndex)];
    }
    newList.idMap = newList.idMap.set(elem.id, elem);
    return newList;
  }
  upsertMany(elems) {
    let newList = this;
    for (const elem of elems) newList = newList.upsert(elem);
    return newList;
  }
  removeById(id, removeId = true) {
    let newList = this;
    const elem = this.idMap.get(id);
    if (elem) {
      newList = this.clone();
      newList.buckets = [...newList.buckets];
      for (const b of newList._iterBucketIndicesAtRange(elem.range)) {
        const elemIndex = _binarySearch_ts__WEBPACK_IMPORTED_MODULE_3__["default"].findExact(newList.buckets[b].elems, elem, b => elem.range.start.compare(b.range.start));
        if (elemIndex === null) continue;

        //console.log("- remove from bucket", b, "at elem", elemIndex)

        newList.buckets[b] = Object.assign({}, newList.buckets[b]);
        newList.buckets[b].elems = [...newList.buckets[b].elems.slice(0, elemIndex), ...newList.buckets[b].elems.slice(elemIndex + 1)];
      }
      if (removeId) newList.idMap = newList.idMap.delete(id);
    }
    return newList;
  }
  findById(id) {
    return this.idMap.get(id);
  }
  *iterAll() {
    for (const bucket of this.buckets) for (const elem of bucket.elems) {
      const elemStart = this.bucketFn(elem.range.start);
      if (elemStart >= bucket.start && elemStart < bucket.start + 1) yield elem;
    }
  }
  *iterAtRange(range) {
    let firstBucket = true;
    for (const b of this._iterBucketIndicesAtRange(range)) {
      const bucket = this.buckets[b];
      for (const elem of bucket.elems) {
        const elemStart = this.bucketFn(elem.range.start);
        if (range.overlapsRange(elem.range) && (firstBucket || elemStart >= bucket.start && elemStart < bucket.start + 1)) yield elem;
      }
      firstBucket = false;
    }
  }
  *iterAtPoint(point) {
    const range = _range_ts__WEBPACK_IMPORTED_MODULE_2__["default"].fromPoint(point, true, true);
    for (const item of this.iterAtRange(range)) yield item;
  }
  *iterActiveAtRangePairwise(range) {
    if (this.idMap.size == 0) {
      yield [null, null];
      return;
    }
    let prevItem = this.findPrevious(range.start);
    while (true) {
      const nextItem = this.findNextNotEqual(prevItem?.range.end ?? range.start);
      yield [prevItem, nextItem];
      if (!nextItem) break;
      prevItem = nextItem;
    }
  }
  *iterAllPairwise() {
    if (this.idMap.size == 0) {
      yield [null, null];
      return;
    }
    let prevItem = null;
    for (const nextItem of this.iterAll()) {
      yield [prevItem, nextItem];
      prevItem = nextItem;
    }
    yield [prevItem, null];
  }
  getTotalRange() {
    let firstElem = null;
    let lastElem = null;
    for (const bucket of this.buckets) {
      if (bucket.elems.length > 0) {
        firstElem = bucket.elems[0];
        break;
      }
    }
    for (let b = this.buckets.length - 1; b >= 0; b--) {
      for (const elem of this.buckets[b].elems) {
        if (!lastElem || elem.range.end.compare(lastElem.range.end) > 0) lastElem = elem;
      }
      if (lastElem) break;
    }
    if (!firstElem || !lastElem) return null;
    return firstElem.range.merge(lastElem.range);
  }
  findFirst() {
    for (const elem of this.iterAll()) return elem;
    return null;
  }
  findActiveAt(time) {
    let result = null;
    for (const elem of this.iterAll()) {
      if (elem.range.start.compare(time) > 0) break;
      result = elem;
    }
    return result;
  }
  findPreviousAnchor(fromPoint) {
    let previous = null;
    const end = this.bucketFn(fromPoint);
    const endB = Math.min(this.buckets.length - 1, _binarySearch_ts__WEBPACK_IMPORTED_MODULE_3__["default"].find(this.buckets, bucket => end - bucket.start));
    for (let b = endB; b >= 0; b--) {
      if (previous && this.bucketFn(previous) > this.buckets[b].start + 1) break;
      for (const elem of this.buckets[b].elems) {
        if (elem.range.start.compare(fromPoint) < 0 && (previous === null || elem.range.start.compare(previous) > 0)) previous = elem.range.start;
        if (elem.range.end.compare(fromPoint) < 0 && (previous === null || elem.range.end.compare(previous) > 0)) previous = elem.range.end;
      }
    }
    return previous;
  }
  findPrevious(fromPoint) {
    let nearestItem = null;
    let nearestPoint = null;
    for (const item of this.iterAll()) {
      const itemRange = item.range;
      if (itemRange.end.compare(fromPoint) > 0) continue;
      if (nearestPoint == null || itemRange.end.compare(nearestPoint) > 0) {
        nearestItem = item;
        nearestPoint = itemRange.end;
      }
    }
    return nearestItem;
  }
  findPreviousDeletionAnchor(fromPoint) {
    const anchor = this.findPrevious(fromPoint);
    if (!anchor) return null;
    const anchorRange = anchor.range;
    if (anchorRange.end.compare(fromPoint) != 0) return anchorRange.end;
    let nearestPoint = anchorRange.start;
    for (const item of this.iterAll()) {
      const itemRange = item.range;
      if (itemRange.end.compare(anchorRange.end) != 0) continue;
      if (itemRange.start.compare(nearestPoint) > 0) nearestPoint = itemRange.start;
    }
    return nearestPoint;
  }
  findNextNotEqual(fromPoint) {
    let nearestItem = null;
    let nearestPoint = null;
    for (const item of this.iterAll()) {
      const itemRange = item.range;
      if (itemRange.end.compare(fromPoint) <= 0) continue;
      if (nearestPoint == null || itemRange.end.compare(nearestPoint) < 0) {
        nearestItem = item;
        nearestPoint = itemRange.end;
      }
    }
    return nearestItem;
  }
  static test() {
    let list = new ListOfRanges();
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAll()], []);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual(list.getTotalRange(), null);
    const elem1 = {
      id: 1,
      range: new _range_ts__WEBPACK_IMPORTED_MODULE_2__["default"](new _rational_ts__WEBPACK_IMPORTED_MODULE_1__["default"](2, 4), new _rational_ts__WEBPACK_IMPORTED_MODULE_1__["default"](6, 4))
    };
    const elem2 = {
      id: 2,
      range: new _range_ts__WEBPACK_IMPORTED_MODULE_2__["default"](new _rational_ts__WEBPACK_IMPORTED_MODULE_1__["default"](0, 4), new _rational_ts__WEBPACK_IMPORTED_MODULE_1__["default"](3, 4))
    };
    const elem3 = {
      id: 3,
      range: new _range_ts__WEBPACK_IMPORTED_MODULE_2__["default"](new _rational_ts__WEBPACK_IMPORTED_MODULE_1__["default"](-3, 4), new _rational_ts__WEBPACK_IMPORTED_MODULE_1__["default"](11, 4))
    };
    const elem4 = {
      id: 4,
      range: new _range_ts__WEBPACK_IMPORTED_MODULE_2__["default"](new _rational_ts__WEBPACK_IMPORTED_MODULE_1__["default"](12, 4), new _rational_ts__WEBPACK_IMPORTED_MODULE_1__["default"](16, 4))
    };
    const elem5 = {
      id: 5,
      range: new _range_ts__WEBPACK_IMPORTED_MODULE_2__["default"](new _rational_ts__WEBPACK_IMPORTED_MODULE_1__["default"](5, 4), new _rational_ts__WEBPACK_IMPORTED_MODULE_1__["default"](13, 4))
    };
    const elem1_2 = {
      id: 1,
      range: new _range_ts__WEBPACK_IMPORTED_MODULE_2__["default"](new _rational_ts__WEBPACK_IMPORTED_MODULE_1__["default"](6, 4), new _rational_ts__WEBPACK_IMPORTED_MODULE_1__["default"](11, 4))
    };
    list = list.upsert(elem1);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAll()], [elem1]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem1.range)], [elem1]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual(list.getTotalRange(), elem1.range);
    list = list.upsert(elem2);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAll()], [elem2, elem1]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem1.range)], [elem2, elem1]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem2.range)], [elem2, elem1]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual(list.getTotalRange(), elem2.range.merge(elem1.range));
    list = list.upsert(elem3);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAll()], [elem3, elem2, elem1]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem1.range)], [elem3, elem2, elem1]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem2.range)], [elem3, elem2, elem1]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem3.range)], [elem3, elem2, elem1]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual(list.getTotalRange(), elem3.range.merge(elem1.range));
    list = list.upsert(elem4);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAll()], [elem3, elem2, elem1, elem4]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem1.range)], [elem3, elem2, elem1]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem2.range)], [elem3, elem2, elem1]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem3.range)], [elem3, elem2, elem1]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem4.range)], [elem4]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual(list.getTotalRange(), elem3.range.merge(elem4.range));
    list = list.upsert(elem5);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAll()], [elem3, elem2, elem1, elem5, elem4]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem1.range)], [elem3, elem2, elem1, elem5]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem2.range)], [elem3, elem2, elem1]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem3.range)], [elem3, elem2, elem1, elem5]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem4.range)], [elem5, elem4]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem5.range)], [elem3, elem1, elem5, elem4]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual(list.getTotalRange(), elem3.range.merge(elem4.range));
    list = list.upsert(elem1_2);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAll()], [elem3, elem2, elem5, elem1_2, elem4]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem1.range)], [elem3, elem2, elem5]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem2.range)], [elem3, elem2]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem3.range)], [elem3, elem2, elem5, elem1_2]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem4.range)], [elem5, elem4]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem5.range)], [elem3, elem5, elem1_2, elem4]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual([...list.iterAtRange(elem1_2.range)], [elem3, elem5, elem1_2]);
    assert__WEBPACK_IMPORTED_MODULE_0___default().deepEqual(list.getTotalRange(), elem3.range.merge(elem4.range));
    console.log("ListOfRanges tests passed");
  }
}

/***/ }),

/***/ "./src/utils/mathUtils.ts":
/*!********************************!*\
  !*** ./src/utils/mathUtils.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dbToLinearGain: () => (/* binding */ dbToLinearGain),
/* harmony export */   dbToMidiVolume: () => (/* binding */ dbToMidiVolume),
/* harmony export */   linearGainToDb: () => (/* binding */ linearGainToDb),
/* harmony export */   midiToHertz: () => (/* binding */ midiToHertz),
/* harmony export */   midiVolumeToDb: () => (/* binding */ midiVolumeToDb),
/* harmony export */   midiVolumeToLinearGain: () => (/* binding */ midiVolumeToLinearGain),
/* harmony export */   mod: () => (/* binding */ mod),
/* harmony export */   quantize: () => (/* binding */ quantize)
/* harmony export */ });
function mod(x, m) {
  return (x % m + m) % m;
}
function quantize(x, step) {
  return Math.floor(x * step) / step;
}
function midiToHertz(midi) {
  return Math.pow(2, (midi - 69) / 12) * 440;
}
function dbToLinearGain(db) {
  return Math.pow(10, db / 20);
}
function linearGainToDb(linearGain) {
  return 20 * Math.log10(linearGain);
}
const minMidiDbLevel = -30;
function dbToMidiVolume(db) {
  return Math.max(0, Math.min(1, 1 - db / minMidiDbLevel));
}
function midiVolumeToDb(midiVol) {
  if (midiVol <= 0) return 0;
  return minMidiDbLevel * (1 - midiVol);
}
function midiVolumeToLinearGain(midiVol) {
  if (midiVol <= 0) return 0;
  return dbToLinearGain(midiVolumeToDb(midiVol));
}

/***/ }),

/***/ "./src/utils/range.ts":
/*!****************************!*\
  !*** ./src/utils/range.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Range)
/* harmony export */ });
/* harmony import */ var _rational_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rational.ts */ "./src/utils/rational.ts");

class Range {
  constructor(start, end, startInclusive = true, endInclusive = false) {
    this.start = start;
    this.end = end;
    this.startInclusive = startInclusive;
    this.endInclusive = endInclusive;
  }
  static fromPoint(p, startInclusive = true, endInclusive = true) {
    return new Range(p, p, startInclusive, endInclusive);
  }
  static fromStartDuration(start, duration) {
    return new Range(start, start.add(duration));
  }
  static dummy() {
    return new Range(new _rational_ts__WEBPACK_IMPORTED_MODULE_0__["default"](0), new _rational_ts__WEBPACK_IMPORTED_MODULE_0__["default"](0));
  }
  get duration() {
    return this.end.subtract(this.start);
  }
  setDuration(newDuration) {
    return new Range(this.start, this.start.add(newDuration), this.startInclusive, this.endInclusive);
  }
  sorted() {
    const startInclusive = this.start.lessThan(this.end) ? this.startInclusive : this.endInclusive;
    const endInclusive = this.end.greaterThan(this.start) ? this.endInclusive : this.startInclusive;
    return new Range(this.start.min(this.end), this.start.max(this.end), startInclusive, endInclusive);
  }
  max() {
    return this.start.max(this.end);
  }
  min() {
    return this.start.min(this.end);
  }
  merge(other) {
    return Range.merge(this, other);
  }
  static merge(r1, r2) {
    if (r1 === null && r2 === null) return null;
    if (r1 === null) return r2;
    if (r2 === null) return r1;
    return new Range(r1.start.min(r2.start), r1.end.max(r2.end));
  }
  intersect(other) {
    return Range.intersect(this, other);
  }
  static intersect(r1, r2) {
    if (r1 === null && r2 === null) return null;
    if (r1 === null) return r2;
    if (r2 === null) return r1;
    return new Range(r1.start.max(r2.start), r1.end.min(r2.end));
  }
  atZero() {
    return new Range(new _rational_ts__WEBPACK_IMPORTED_MODULE_0__["default"](0), this.duration, this.startInclusive, this.endInclusive);
  }
  stretch(offset, pivot, origin) {
    return new Range(this.start.stretch(offset, pivot, origin), this.end.stretch(offset, pivot, origin), this.startInclusive, this.endInclusive);
  }
  displace(offset) {
    return new Range(this.start.add(offset), this.end.add(offset), this.startInclusive, this.endInclusive);
  }
  subtract(offset) {
    return new Range(this.start.subtract(offset), this.end.subtract(offset), this.startInclusive, this.endInclusive);
  }
  grow(offset) {
    return new Range(this.start.subtract(offset), this.end.add(offset), this.startInclusive, this.endInclusive);
  }
  shrink(offset) {
    return new Range(this.start.add(offset), this.end.subtract(offset), this.startInclusive, this.endInclusive);
  }
  snap(step) {
    return new Range(this.start.snap(step), this.end.snap(step), this.startInclusive, this.endInclusive);
  }
  *iterSlices(slice) {
    if (slice.start.compare(this.start) <= 0) {
      if (slice.end.compare(this.end) < 0) yield new Range(slice.end.max(this.start), this.end);
    } else {
      if (slice.end.compare(this.end) >= 0) yield new Range(this.start, slice.start.min(this.end));else {
        yield new Range(this.start, slice.start.min(this.end));
        yield new Range(slice.end.max(this.start), this.end);
      }
    }
  }
  isPoint() {
    return this.start.equalTo(this.end);
  }
  overlapsPoint(point) {
    const compStart = this.start.compare(point);
    const compEnd = this.end.compare(point);
    const checkStart = this.startInclusive ? compStart <= 0 : compStart < 0;
    const checkEnd = this.endInclusive ? compEnd >= 0 : compEnd > 0;
    return checkStart && checkEnd;
  }
  overlapsRange(range) {
    const compStart = this.start.compare(range.end);
    const compEnd = this.end.compare(range.start);
    const checkStart = this.startInclusive && range.endInclusive ? compStart <= 0 : compStart < 0;
    const checkEnd = this.endInclusive && range.startInclusive ? compEnd >= 0 : compEnd > 0;
    return checkStart && checkEnd;
  }
  containsRangeCompletely(range) {
    const compStart = this.start.compare(range.start);
    const compEnd = this.end.compare(range.end);
    const checkStart = this.startInclusive ? compStart <= 0 : compStart < 0;
    const checkEnd = this.endInclusive ? compEnd >= 0 : compEnd > 0;
    return checkStart && checkEnd;
  }
  quantize(maxDenom) {
    return new Range(this.start.quantize(maxDenom), this.end.quantize(maxDenom), this.startInclusive, this.endInclusive);
  }
  toString() {
    return "[" + this.start.toString() + " ~ " + this.end.toString() + "]";
  }
  toJson(quantize) {
    if (this.start.compare(this.end) == 0) return [this.start.toJson()];else {
      if (quantize !== undefined) return [this.start.toJson(), this.duration.quantize(quantize).toJson()];else return [this.start.toJson(), this.duration.toJson()];
    }
  }
  static fromJson(json) {
    if (json.length == 1) return Range.fromPoint(_rational_ts__WEBPACK_IMPORTED_MODULE_0__["default"].fromJson(json[0]));else return Range.fromStartDuration(_rational_ts__WEBPACK_IMPORTED_MODULE_0__["default"].fromJson(json[0]), _rational_ts__WEBPACK_IMPORTED_MODULE_0__["default"].fromJson(json[1]));
  }
}

/***/ }),

/***/ "./src/utils/rational.ts":
/*!*******************************!*\
  !*** ./src/utils/rational.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Rational)
/* harmony export */ });
function mod(x, m) {
  return (x % m + m) % m;
}
class Rational {
  constructor(numerator = 0, denominator = 1) {
    if (denominator == 0) throw "denominator zero";
    if (!isFinite(numerator) || !isFinite(denominator)) throw "invalid rational";
    this.numerator = numerator;
    this.denominator = denominator;
    this.simplifyInPlace();
  }
  static fromFloat(floatValue, maxDenominator) {
    const integer = Math.floor(floatValue);
    const frac = floatValue - integer;
    return new Rational(integer * maxDenominator + Math.round(frac * maxDenominator), maxDenominator);
  }
  static fromIntegerPlusRational(integer, numeratorWithoutInteger, denominator) {
    return new Rational(integer * denominator + numeratorWithoutInteger, denominator);
  }
  asFloat() {
    return this.numerator / this.denominator;
  }
  get n() {
    return this.numerator;
  }
  get d() {
    return this.denominator;
  }
  get integer() {
    return Math.floor(this.numerator / this.denominator);
  }
  get numeratorWithoutInteger() {
    return mod(this.numerator, this.denominator);
  }
  negate() {
    return new Rational(-this.numerator, this.denominator);
  }
  absolute() {
    if (this.numerator < 0) return new Rational(-this.numerator, this.denominator);else return this;
  }
  add(other) {
    return new Rational(this.numerator * other.denominator + other.numerator * this.denominator, this.denominator * other.denominator);
  }
  subtract(other) {
    return new Rational(this.numerator * other.denominator - other.numerator * this.denominator, this.denominator * other.denominator);
  }
  multiply(other) {
    return new Rational(this.numerator * other.numerator, this.denominator * other.denominator);
  }
  multiplyByFloat(x) {
    return new Rational(this.numerator * x, this.denominator);
  }
  divide(other) {
    return new Rational(this.numerator * other.denominator, this.denominator * other.numerator);
  }
  snap(step) {
    return Rational.fromFloat(this.asFloat(), step.denominator);
  }
  quantize(maxDenominator) {
    if (this.denominator <= maxDenominator) return this.simplify();
    return new Rational(Math.round(this.numerator / this.denominator * maxDenominator), maxDenominator);
  }
  stretch(offset, pivot, origin) {
    let dist = origin.subtract(pivot);
    if (dist.numerator == 0) return this;
    let p = this.subtract(pivot).divide(dist);
    let move = origin.add(offset).subtract(pivot).divide(dist);
    return pivot.add(dist.multiply(p).multiply(move));
  }
  isZero() {
    return this.numerator == 0;
  }
  compare(other) {
    let thisNumerator = this.numerator * other.denominator;
    let otherNumerator = other.numerator * this.denominator;
    if (thisNumerator < otherNumerator) return -1;else if (thisNumerator > otherNumerator) return 1;else return 0;
  }
  equalTo(other) {
    return this.compare(other) == 0;
  }
  notEqualTo(other) {
    return this.compare(other) != 0;
  }
  lessThan(other) {
    return this.compare(other) < 0;
  }
  lessThanOrEqual(other) {
    return this.compare(other) <= 0;
  }
  greaterThan(other) {
    return this.compare(other) > 0;
  }
  greaterThanOrEqual(other) {
    return this.compare(other) >= 0;
  }
  static max(a, b) {
    if (a === null && b === null) return null;
    if (a === null) return b;
    if (b === null) return a;
    if (a.compare(b) > 0) return a;else return b;
  }
  static min(a, b) {
    if (a === null && b === null) return null;
    if (a === null) return b;
    if (b === null) return a;
    if (a.compare(b) < 0) return a;else return b;
  }
  max(other) {
    return Rational.max(this, other);
  }
  min(other) {
    return Rational.min(this, other);
  }
  simplify() {
    return new Rational(this.numerator, this.denominator);
  }
  simplifyInPlace() {
    this.trySimplifyInPlaceBy(2);
    this.trySimplifyInPlaceBy(3);
    this.trySimplifyInPlaceBy(5);
    this.trySimplifyInPlaceBy(7);
    this.trySimplifyInPlaceBy(11);
    this.trySimplifyInPlaceBy(13);
  }
  trySimplifyInPlaceBy(divider) {
    while (this.numerator % divider == 0 && this.denominator % divider == 0) {
      this.numerator /= divider;
      this.denominator /= divider;
    }
  }
  toString() {
    let integer = Math.floor(this.numerator / this.denominator);
    let numerator = this.numerator % this.denominator;
    if (numerator == 0) return integer.toString();else return integer.toString() + " + " + numerator.toString() + "/" + this.denominator.toString();
  }
  toJson() {
    return [this.integer, this.numeratorWithoutInteger, this.denominator];
  }
  static fromJson(array) {
    return new Rational(array[0] * array[2] + array[1], array[2]);
  }
}

/***/ }),

/***/ "./src/utils/rect.ts":
/*!***************************!*\
  !*** ./src/utils/rect.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Rect)
/* harmony export */ });
class Rect {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  static fromVertices(x1, y1, x2, y2) {
    return new Rect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
  }
  static fromElement(elem) {
    const clientRect = elem.getBoundingClientRect();
    return new Rect(clientRect.left, clientRect.top, clientRect.width, clientRect.height);
  }
  clone() {
    return new Rect(this.x, this.y, this.w, this.h);
  }
  get x1() {
    return this.x;
  }
  get y1() {
    return this.y;
  }
  get x2() {
    return this.x + this.w;
  }
  get y2() {
    return this.y + this.h;
  }
  get xCenter() {
    return (this.x1 + this.x2) / 2;
  }
  get yCenter() {
    return (this.y1 + this.y2) / 2;
  }
  withX(value) {
    return new Rect(value, this.y, this.w, this.h);
  }
  withY(value) {
    return new Rect(this.x, value, this.w, this.h);
  }
  withW(value) {
    return new Rect(this.x, this.y, value, this.h);
  }
  withH(value) {
    return new Rect(this.x, this.y, this.w, value);
  }
  withX1(value) {
    return Rect.fromVertices(value, this.y1, this.x2, this.y2);
  }
  withY1(value) {
    return Rect.fromVertices(this.x1, value, this.x2, this.y2);
  }
  withX2(value) {
    return Rect.fromVertices(this.x1, this.y1, value, this.y2);
  }
  withY2(value) {
    return Rect.fromVertices(this.x1, this.y1, this.x2, value);
  }
  displace(x, y) {
    return new Rect(this.x + x, this.y + y, this.w, this.h);
  }
  expand(amount) {
    return Rect.fromVertices(this.x1 - amount, this.y1 - amount, this.x2 + amount, this.y2 + amount);
  }
  expandW(amount) {
    return Rect.fromVertices(this.x1 - amount, this.y1, this.x2 + amount, this.y2);
  }
  contains(p) {
    return p.x >= this.x && p.x < this.x2 && p.y >= this.y && p.y < this.y2;
  }
  overlaps(other) {
    return this.x2 >= other.x && this.x < other.x2 && this.y2 >= other.y && this.y < other.y2;
  }
}

/***/ }),

/***/ "./node_modules/immutable/dist/immutable.es.js":
/*!*****************************************************!*\
  !*** ./node_modules/immutable/dist/immutable.es.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Collection: () => (/* binding */ Collection),
/* harmony export */   Iterable: () => (/* binding */ Iterable),
/* harmony export */   List: () => (/* binding */ List),
/* harmony export */   Map: () => (/* binding */ Map),
/* harmony export */   OrderedMap: () => (/* binding */ OrderedMap),
/* harmony export */   OrderedSet: () => (/* binding */ OrderedSet),
/* harmony export */   PairSorting: () => (/* binding */ PairSorting),
/* harmony export */   Range: () => (/* binding */ Range),
/* harmony export */   Record: () => (/* binding */ Record),
/* harmony export */   Repeat: () => (/* binding */ Repeat),
/* harmony export */   Seq: () => (/* binding */ Seq),
/* harmony export */   Set: () => (/* binding */ Set),
/* harmony export */   Stack: () => (/* binding */ Stack),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   fromJS: () => (/* binding */ fromJS),
/* harmony export */   get: () => (/* binding */ get),
/* harmony export */   getIn: () => (/* binding */ getIn$1),
/* harmony export */   has: () => (/* binding */ has),
/* harmony export */   hasIn: () => (/* binding */ hasIn$1),
/* harmony export */   hash: () => (/* binding */ hash),
/* harmony export */   is: () => (/* binding */ is),
/* harmony export */   isAssociative: () => (/* binding */ isAssociative),
/* harmony export */   isCollection: () => (/* binding */ isCollection),
/* harmony export */   isImmutable: () => (/* binding */ isImmutable),
/* harmony export */   isIndexed: () => (/* binding */ isIndexed),
/* harmony export */   isKeyed: () => (/* binding */ isKeyed),
/* harmony export */   isList: () => (/* binding */ isList),
/* harmony export */   isMap: () => (/* binding */ isMap),
/* harmony export */   isOrdered: () => (/* binding */ isOrdered),
/* harmony export */   isOrderedMap: () => (/* binding */ isOrderedMap),
/* harmony export */   isOrderedSet: () => (/* binding */ isOrderedSet),
/* harmony export */   isPlainObject: () => (/* binding */ isPlainObject),
/* harmony export */   isRecord: () => (/* binding */ isRecord),
/* harmony export */   isSeq: () => (/* binding */ isSeq),
/* harmony export */   isSet: () => (/* binding */ isSet),
/* harmony export */   isStack: () => (/* binding */ isStack),
/* harmony export */   isValueObject: () => (/* binding */ isValueObject),
/* harmony export */   merge: () => (/* binding */ merge),
/* harmony export */   mergeDeep: () => (/* binding */ mergeDeep$1),
/* harmony export */   mergeDeepWith: () => (/* binding */ mergeDeepWith$1),
/* harmony export */   mergeWith: () => (/* binding */ mergeWith),
/* harmony export */   remove: () => (/* binding */ remove),
/* harmony export */   removeIn: () => (/* binding */ removeIn),
/* harmony export */   set: () => (/* binding */ set),
/* harmony export */   setIn: () => (/* binding */ setIn$1),
/* harmony export */   update: () => (/* binding */ update$1),
/* harmony export */   updateIn: () => (/* binding */ updateIn$1),
/* harmony export */   version: () => (/* binding */ version)
/* harmony export */ });
/**
 * MIT License
 * 
 * Copyright (c) 2014-present, Lee Byron and other contributors.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var DELETE = 'delete';

// Constants describing the size of trie nodes.
var SHIFT = 5; // Resulted in best performance after ______?
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;

// A consistent shared value representing "not set" which equals nothing other
// than itself, and nothing that could be provided externally.
var NOT_SET = {};

// Boolean references, Rough equivalent of `bool &`.
function MakeRef() {
  return { value: false };
}

function SetRef(ref) {
  if (ref) {
    ref.value = true;
  }
}

// A function which returns a value representing an "owner" for transient writes
// to tries. The return value will only ever equal itself, and will not equal
// the return of any subsequent call of this function.
function OwnerID() {}

function ensureSize(iter) {
  if (iter.size === undefined) {
    iter.size = iter.__iterate(returnTrue);
  }
  return iter.size;
}

function wrapIndex(iter, index) {
  // This implements "is array index" which the ECMAString spec defines as:
  //
  //     A String property name P is an array index if and only if
  //     ToString(ToUint32(P)) is equal to P and ToUint32(P) is not equal
  //     to 2^32−1.
  //
  // http://www.ecma-international.org/ecma-262/6.0/#sec-array-exotic-objects
  if (typeof index !== 'number') {
    var uint32Index = index >>> 0; // N >>> 0 is shorthand for ToUint32
    if ('' + uint32Index !== index || uint32Index === 4294967295) {
      return NaN;
    }
    index = uint32Index;
  }
  return index < 0 ? ensureSize(iter) + index : index;
}

function returnTrue() {
  return true;
}

function wholeSlice(begin, end, size) {
  return (
    ((begin === 0 && !isNeg(begin)) ||
      (size !== undefined && begin <= -size)) &&
    (end === undefined || (size !== undefined && end >= size))
  );
}

function resolveBegin(begin, size) {
  return resolveIndex(begin, size, 0);
}

function resolveEnd(end, size) {
  return resolveIndex(end, size, size);
}

function resolveIndex(index, size, defaultIndex) {
  // Sanitize indices using this shorthand for ToInt32(argument)
  // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
  return index === undefined
    ? defaultIndex
    : isNeg(index)
    ? size === Infinity
      ? size
      : Math.max(0, size + index) | 0
    : size === undefined || size === index
    ? index
    : Math.min(size, index) | 0;
}

function isNeg(value) {
  // Account for -0 which is negative, but not less than 0.
  return value < 0 || (value === 0 && 1 / value === -Infinity);
}

var IS_COLLECTION_SYMBOL = '@@__IMMUTABLE_ITERABLE__@@';

function isCollection(maybeCollection) {
  return Boolean(maybeCollection && maybeCollection[IS_COLLECTION_SYMBOL]);
}

var IS_KEYED_SYMBOL = '@@__IMMUTABLE_KEYED__@@';

function isKeyed(maybeKeyed) {
  return Boolean(maybeKeyed && maybeKeyed[IS_KEYED_SYMBOL]);
}

var IS_INDEXED_SYMBOL = '@@__IMMUTABLE_INDEXED__@@';

function isIndexed(maybeIndexed) {
  return Boolean(maybeIndexed && maybeIndexed[IS_INDEXED_SYMBOL]);
}

function isAssociative(maybeAssociative) {
  return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
}

var Collection = function Collection(value) {
  // eslint-disable-next-line no-constructor-return
  return isCollection(value) ? value : Seq(value);
};

var KeyedCollection = /*@__PURE__*/(function (Collection) {
  function KeyedCollection(value) {
    // eslint-disable-next-line no-constructor-return
    return isKeyed(value) ? value : KeyedSeq(value);
  }

  if ( Collection ) KeyedCollection.__proto__ = Collection;
  KeyedCollection.prototype = Object.create( Collection && Collection.prototype );
  KeyedCollection.prototype.constructor = KeyedCollection;

  return KeyedCollection;
}(Collection));

var IndexedCollection = /*@__PURE__*/(function (Collection) {
  function IndexedCollection(value) {
    // eslint-disable-next-line no-constructor-return
    return isIndexed(value) ? value : IndexedSeq(value);
  }

  if ( Collection ) IndexedCollection.__proto__ = Collection;
  IndexedCollection.prototype = Object.create( Collection && Collection.prototype );
  IndexedCollection.prototype.constructor = IndexedCollection;

  return IndexedCollection;
}(Collection));

var SetCollection = /*@__PURE__*/(function (Collection) {
  function SetCollection(value) {
    // eslint-disable-next-line no-constructor-return
    return isCollection(value) && !isAssociative(value) ? value : SetSeq(value);
  }

  if ( Collection ) SetCollection.__proto__ = Collection;
  SetCollection.prototype = Object.create( Collection && Collection.prototype );
  SetCollection.prototype.constructor = SetCollection;

  return SetCollection;
}(Collection));

Collection.Keyed = KeyedCollection;
Collection.Indexed = IndexedCollection;
Collection.Set = SetCollection;

var IS_SEQ_SYMBOL = '@@__IMMUTABLE_SEQ__@@';

function isSeq(maybeSeq) {
  return Boolean(maybeSeq && maybeSeq[IS_SEQ_SYMBOL]);
}

var IS_RECORD_SYMBOL = '@@__IMMUTABLE_RECORD__@@';

function isRecord(maybeRecord) {
  return Boolean(maybeRecord && maybeRecord[IS_RECORD_SYMBOL]);
}

function isImmutable(maybeImmutable) {
  return isCollection(maybeImmutable) || isRecord(maybeImmutable);
}

var IS_ORDERED_SYMBOL = '@@__IMMUTABLE_ORDERED__@@';

function isOrdered(maybeOrdered) {
  return Boolean(maybeOrdered && maybeOrdered[IS_ORDERED_SYMBOL]);
}

var ITERATE_KEYS = 0;
var ITERATE_VALUES = 1;
var ITERATE_ENTRIES = 2;

var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator';

var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;

var Iterator = function Iterator(next) {
  this.next = next;
};

Iterator.prototype.toString = function toString () {
  return '[Iterator]';
};

Iterator.KEYS = ITERATE_KEYS;
Iterator.VALUES = ITERATE_VALUES;
Iterator.ENTRIES = ITERATE_ENTRIES;

Iterator.prototype.inspect = Iterator.prototype.toSource = function () {
  return this.toString();
};
Iterator.prototype[ITERATOR_SYMBOL] = function () {
  return this;
};

function iteratorValue(type, k, v, iteratorResult) {
  var value = type === 0 ? k : type === 1 ? v : [k, v];
  iteratorResult
    ? (iteratorResult.value = value)
    : (iteratorResult = {
        value: value,
        done: false,
      });
  return iteratorResult;
}

function iteratorDone() {
  return { value: undefined, done: true };
}

function hasIterator(maybeIterable) {
  if (Array.isArray(maybeIterable)) {
    // IE11 trick as it does not support `Symbol.iterator`
    return true;
  }

  return !!getIteratorFn(maybeIterable);
}

function isIterator(maybeIterator) {
  return maybeIterator && typeof maybeIterator.next === 'function';
}

function getIterator(iterable) {
  var iteratorFn = getIteratorFn(iterable);
  return iteratorFn && iteratorFn.call(iterable);
}

function getIteratorFn(iterable) {
  var iteratorFn =
    iterable &&
    ((REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) ||
      iterable[FAUX_ITERATOR_SYMBOL]);
  if (typeof iteratorFn === 'function') {
    return iteratorFn;
  }
}

function isEntriesIterable(maybeIterable) {
  var iteratorFn = getIteratorFn(maybeIterable);
  return iteratorFn && iteratorFn === maybeIterable.entries;
}

function isKeysIterable(maybeIterable) {
  var iteratorFn = getIteratorFn(maybeIterable);
  return iteratorFn && iteratorFn === maybeIterable.keys;
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

function isArrayLike(value) {
  if (Array.isArray(value) || typeof value === 'string') {
    return true;
  }

  return (
    value &&
    typeof value === 'object' &&
    Number.isInteger(value.length) &&
    value.length >= 0 &&
    (value.length === 0
      ? // Only {length: 0} is considered Array-like.
        Object.keys(value).length === 1
      : // An object is only Array-like if it has a property where the last value
        // in the array-like may be found (which could be undefined).
        value.hasOwnProperty(value.length - 1))
  );
}

var Seq = /*@__PURE__*/(function (Collection) {
  function Seq(value) {
    // eslint-disable-next-line no-constructor-return
    return value === undefined || value === null
      ? emptySequence()
      : isImmutable(value)
      ? value.toSeq()
      : seqFromValue(value);
  }

  if ( Collection ) Seq.__proto__ = Collection;
  Seq.prototype = Object.create( Collection && Collection.prototype );
  Seq.prototype.constructor = Seq;

  Seq.prototype.toSeq = function toSeq () {
    return this;
  };

  Seq.prototype.toString = function toString () {
    return this.__toString('Seq {', '}');
  };

  Seq.prototype.cacheResult = function cacheResult () {
    if (!this._cache && this.__iterateUncached) {
      this._cache = this.entrySeq().toArray();
      this.size = this._cache.length;
    }
    return this;
  };

  // abstract __iterateUncached(fn, reverse)

  Seq.prototype.__iterate = function __iterate (fn, reverse) {
    var cache = this._cache;
    if (cache) {
      var size = cache.length;
      var i = 0;
      while (i !== size) {
        var entry = cache[reverse ? size - ++i : i++];
        if (fn(entry[1], entry[0], this) === false) {
          break;
        }
      }
      return i;
    }
    return this.__iterateUncached(fn, reverse);
  };

  // abstract __iteratorUncached(type, reverse)

  Seq.prototype.__iterator = function __iterator (type, reverse) {
    var cache = this._cache;
    if (cache) {
      var size = cache.length;
      var i = 0;
      return new Iterator(function () {
        if (i === size) {
          return iteratorDone();
        }
        var entry = cache[reverse ? size - ++i : i++];
        return iteratorValue(type, entry[0], entry[1]);
      });
    }
    return this.__iteratorUncached(type, reverse);
  };

  return Seq;
}(Collection));

var KeyedSeq = /*@__PURE__*/(function (Seq) {
  function KeyedSeq(value) {
    // eslint-disable-next-line no-constructor-return
    return value === undefined || value === null
      ? emptySequence().toKeyedSeq()
      : isCollection(value)
      ? isKeyed(value)
        ? value.toSeq()
        : value.fromEntrySeq()
      : isRecord(value)
      ? value.toSeq()
      : keyedSeqFromValue(value);
  }

  if ( Seq ) KeyedSeq.__proto__ = Seq;
  KeyedSeq.prototype = Object.create( Seq && Seq.prototype );
  KeyedSeq.prototype.constructor = KeyedSeq;

  KeyedSeq.prototype.toKeyedSeq = function toKeyedSeq () {
    return this;
  };

  return KeyedSeq;
}(Seq));

var IndexedSeq = /*@__PURE__*/(function (Seq) {
  function IndexedSeq(value) {
    // eslint-disable-next-line no-constructor-return
    return value === undefined || value === null
      ? emptySequence()
      : isCollection(value)
      ? isKeyed(value)
        ? value.entrySeq()
        : value.toIndexedSeq()
      : isRecord(value)
      ? value.toSeq().entrySeq()
      : indexedSeqFromValue(value);
  }

  if ( Seq ) IndexedSeq.__proto__ = Seq;
  IndexedSeq.prototype = Object.create( Seq && Seq.prototype );
  IndexedSeq.prototype.constructor = IndexedSeq;

  IndexedSeq.of = function of (/*...values*/) {
    return IndexedSeq(arguments);
  };

  IndexedSeq.prototype.toIndexedSeq = function toIndexedSeq () {
    return this;
  };

  IndexedSeq.prototype.toString = function toString () {
    return this.__toString('Seq [', ']');
  };

  return IndexedSeq;
}(Seq));

var SetSeq = /*@__PURE__*/(function (Seq) {
  function SetSeq(value) {
    // eslint-disable-next-line no-constructor-return
    return (
      isCollection(value) && !isAssociative(value) ? value : IndexedSeq(value)
    ).toSetSeq();
  }

  if ( Seq ) SetSeq.__proto__ = Seq;
  SetSeq.prototype = Object.create( Seq && Seq.prototype );
  SetSeq.prototype.constructor = SetSeq;

  SetSeq.of = function of (/*...values*/) {
    return SetSeq(arguments);
  };

  SetSeq.prototype.toSetSeq = function toSetSeq () {
    return this;
  };

  return SetSeq;
}(Seq));

Seq.isSeq = isSeq;
Seq.Keyed = KeyedSeq;
Seq.Set = SetSeq;
Seq.Indexed = IndexedSeq;

Seq.prototype[IS_SEQ_SYMBOL] = true;

// #pragma Root Sequences

var ArraySeq = /*@__PURE__*/(function (IndexedSeq) {
  function ArraySeq(array) {
    this._array = array;
    this.size = array.length;
  }

  if ( IndexedSeq ) ArraySeq.__proto__ = IndexedSeq;
  ArraySeq.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
  ArraySeq.prototype.constructor = ArraySeq;

  ArraySeq.prototype.get = function get (index, notSetValue) {
    return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
  };

  ArraySeq.prototype.__iterate = function __iterate (fn, reverse) {
    var array = this._array;
    var size = array.length;
    var i = 0;
    while (i !== size) {
      var ii = reverse ? size - ++i : i++;
      if (fn(array[ii], ii, this) === false) {
        break;
      }
    }
    return i;
  };

  ArraySeq.prototype.__iterator = function __iterator (type, reverse) {
    var array = this._array;
    var size = array.length;
    var i = 0;
    return new Iterator(function () {
      if (i === size) {
        return iteratorDone();
      }
      var ii = reverse ? size - ++i : i++;
      return iteratorValue(type, ii, array[ii]);
    });
  };

  return ArraySeq;
}(IndexedSeq));

var ObjectSeq = /*@__PURE__*/(function (KeyedSeq) {
  function ObjectSeq(object) {
    var keys = Object.keys(object).concat(
      Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(object) : []
    );
    this._object = object;
    this._keys = keys;
    this.size = keys.length;
  }

  if ( KeyedSeq ) ObjectSeq.__proto__ = KeyedSeq;
  ObjectSeq.prototype = Object.create( KeyedSeq && KeyedSeq.prototype );
  ObjectSeq.prototype.constructor = ObjectSeq;

  ObjectSeq.prototype.get = function get (key, notSetValue) {
    if (notSetValue !== undefined && !this.has(key)) {
      return notSetValue;
    }
    return this._object[key];
  };

  ObjectSeq.prototype.has = function has (key) {
    return hasOwnProperty.call(this._object, key);
  };

  ObjectSeq.prototype.__iterate = function __iterate (fn, reverse) {
    var object = this._object;
    var keys = this._keys;
    var size = keys.length;
    var i = 0;
    while (i !== size) {
      var key = keys[reverse ? size - ++i : i++];
      if (fn(object[key], key, this) === false) {
        break;
      }
    }
    return i;
  };

  ObjectSeq.prototype.__iterator = function __iterator (type, reverse) {
    var object = this._object;
    var keys = this._keys;
    var size = keys.length;
    var i = 0;
    return new Iterator(function () {
      if (i === size) {
        return iteratorDone();
      }
      var key = keys[reverse ? size - ++i : i++];
      return iteratorValue(type, key, object[key]);
    });
  };

  return ObjectSeq;
}(KeyedSeq));
ObjectSeq.prototype[IS_ORDERED_SYMBOL] = true;

var CollectionSeq = /*@__PURE__*/(function (IndexedSeq) {
  function CollectionSeq(collection) {
    this._collection = collection;
    this.size = collection.length || collection.size;
  }

  if ( IndexedSeq ) CollectionSeq.__proto__ = IndexedSeq;
  CollectionSeq.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
  CollectionSeq.prototype.constructor = CollectionSeq;

  CollectionSeq.prototype.__iterateUncached = function __iterateUncached (fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var collection = this._collection;
    var iterator = getIterator(collection);
    var iterations = 0;
    if (isIterator(iterator)) {
      var step;
      while (!(step = iterator.next()).done) {
        if (fn(step.value, iterations++, this) === false) {
          break;
        }
      }
    }
    return iterations;
  };

  CollectionSeq.prototype.__iteratorUncached = function __iteratorUncached (type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var collection = this._collection;
    var iterator = getIterator(collection);
    if (!isIterator(iterator)) {
      return new Iterator(iteratorDone);
    }
    var iterations = 0;
    return new Iterator(function () {
      var step = iterator.next();
      return step.done ? step : iteratorValue(type, iterations++, step.value);
    });
  };

  return CollectionSeq;
}(IndexedSeq));

// # pragma Helper functions

var EMPTY_SEQ;

function emptySequence() {
  return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));
}

function keyedSeqFromValue(value) {
  var seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return seq.fromEntrySeq();
  }
  if (typeof value === 'object') {
    return new ObjectSeq(value);
  }
  throw new TypeError(
    'Expected Array or collection object of [k, v] entries, or keyed object: ' +
      value
  );
}

function indexedSeqFromValue(value) {
  var seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return seq;
  }
  throw new TypeError(
    'Expected Array or collection object of values: ' + value
  );
}

function seqFromValue(value) {
  var seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return isEntriesIterable(value)
      ? seq.fromEntrySeq()
      : isKeysIterable(value)
      ? seq.toSetSeq()
      : seq;
  }
  if (typeof value === 'object') {
    return new ObjectSeq(value);
  }
  throw new TypeError(
    'Expected Array or collection object of values, or keyed object: ' + value
  );
}

function maybeIndexedSeqFromValue(value) {
  return isArrayLike(value)
    ? new ArraySeq(value)
    : hasIterator(value)
    ? new CollectionSeq(value)
    : undefined;
}

var IS_MAP_SYMBOL = '@@__IMMUTABLE_MAP__@@';

function isMap(maybeMap) {
  return Boolean(maybeMap && maybeMap[IS_MAP_SYMBOL]);
}

function isOrderedMap(maybeOrderedMap) {
  return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
}

function isValueObject(maybeValue) {
  return Boolean(
    maybeValue &&
      typeof maybeValue.equals === 'function' &&
      typeof maybeValue.hashCode === 'function'
  );
}

/**
 * An extension of the "same-value" algorithm as [described for use by ES6 Map
 * and Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Key_equality)
 *
 * NaN is considered the same as NaN, however -0 and 0 are considered the same
 * value, which is different from the algorithm described by
 * [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).
 *
 * This is extended further to allow Objects to describe the values they
 * represent, by way of `valueOf` or `equals` (and `hashCode`).
 *
 * Note: because of this extension, the key equality of Immutable.Map and the
 * value equality of Immutable.Set will differ from ES6 Map and Set.
 *
 * ### Defining custom values
 *
 * The easiest way to describe the value an object represents is by implementing
 * `valueOf`. For example, `Date` represents a value by returning a unix
 * timestamp for `valueOf`:
 *
 *     var date1 = new Date(1234567890000); // Fri Feb 13 2009 ...
 *     var date2 = new Date(1234567890000);
 *     date1.valueOf(); // 1234567890000
 *     assert( date1 !== date2 );
 *     assert( Immutable.is( date1, date2 ) );
 *
 * Note: overriding `valueOf` may have other implications if you use this object
 * where JavaScript expects a primitive, such as implicit string coercion.
 *
 * For more complex types, especially collections, implementing `valueOf` may
 * not be performant. An alternative is to implement `equals` and `hashCode`.
 *
 * `equals` takes another object, presumably of similar type, and returns true
 * if it is equal. Equality is symmetrical, so the same result should be
 * returned if this and the argument are flipped.
 *
 *     assert( a.equals(b) === b.equals(a) );
 *
 * `hashCode` returns a 32bit integer number representing the object which will
 * be used to determine how to store the value object in a Map or Set. You must
 * provide both or neither methods, one must not exist without the other.
 *
 * Also, an important relationship between these methods must be upheld: if two
 * values are equal, they *must* return the same hashCode. If the values are not
 * equal, they might have the same hashCode; this is called a hash collision,
 * and while undesirable for performance reasons, it is acceptable.
 *
 *     if (a.equals(b)) {
 *       assert( a.hashCode() === b.hashCode() );
 *     }
 *
 * All Immutable collections are Value Objects: they implement `equals()`
 * and `hashCode()`.
 */
function is(valueA, valueB) {
  if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
    return true;
  }
  if (!valueA || !valueB) {
    return false;
  }
  if (
    typeof valueA.valueOf === 'function' &&
    typeof valueB.valueOf === 'function'
  ) {
    valueA = valueA.valueOf();
    valueB = valueB.valueOf();
    if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
      return true;
    }
    if (!valueA || !valueB) {
      return false;
    }
  }
  return !!(
    isValueObject(valueA) &&
    isValueObject(valueB) &&
    valueA.equals(valueB)
  );
}

var imul =
  typeof Math.imul === 'function' && Math.imul(0xffffffff, 2) === -2
    ? Math.imul
    : function imul(a, b) {
        a |= 0; // int
        b |= 0; // int
        var c = a & 0xffff;
        var d = b & 0xffff;
        // Shift by 0 fixes the sign on the high part.
        return (c * d + ((((a >>> 16) * d + c * (b >>> 16)) << 16) >>> 0)) | 0; // int
      };

// v8 has an optimization for storing 31-bit signed numbers.
// Values which have either 00 or 11 as the high order bits qualify.
// This function drops the highest order bit in a signed number, maintaining
// the sign bit.
function smi(i32) {
  return ((i32 >>> 1) & 0x40000000) | (i32 & 0xbfffffff);
}

var defaultValueOf = Object.prototype.valueOf;

function hash(o) {
  if (o == null) {
    return hashNullish(o);
  }

  if (typeof o.hashCode === 'function') {
    // Drop any high bits from accidentally long hash codes.
    return smi(o.hashCode(o));
  }

  var v = valueOf(o);

  if (v == null) {
    return hashNullish(v);
  }

  switch (typeof v) {
    case 'boolean':
      // The hash values for built-in constants are a 1 value for each 5-byte
      // shift region expect for the first, which encodes the value. This
      // reduces the odds of a hash collision for these common values.
      return v ? 0x42108421 : 0x42108420;
    case 'number':
      return hashNumber(v);
    case 'string':
      return v.length > STRING_HASH_CACHE_MIN_STRLEN
        ? cachedHashString(v)
        : hashString(v);
    case 'object':
    case 'function':
      return hashJSObj(v);
    case 'symbol':
      return hashSymbol(v);
    default:
      if (typeof v.toString === 'function') {
        return hashString(v.toString());
      }
      throw new Error('Value type ' + typeof v + ' cannot be hashed.');
  }
}

function hashNullish(nullish) {
  return nullish === null ? 0x42108422 : /* undefined */ 0x42108423;
}

// Compress arbitrarily large numbers into smi hashes.
function hashNumber(n) {
  if (n !== n || n === Infinity) {
    return 0;
  }
  var hash = n | 0;
  if (hash !== n) {
    hash ^= n * 0xffffffff;
  }
  while (n > 0xffffffff) {
    n /= 0xffffffff;
    hash ^= n;
  }
  return smi(hash);
}

function cachedHashString(string) {
  var hashed = stringHashCache[string];
  if (hashed === undefined) {
    hashed = hashString(string);
    if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
      STRING_HASH_CACHE_SIZE = 0;
      stringHashCache = {};
    }
    STRING_HASH_CACHE_SIZE++;
    stringHashCache[string] = hashed;
  }
  return hashed;
}

// http://jsperf.com/hashing-strings
function hashString(string) {
  // This is the hash from JVM
  // The hash code for a string is computed as
  // s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
  // where s[i] is the ith character of the string and n is the length of
  // the string. We "mod" the result to make it between 0 (inclusive) and 2^31
  // (exclusive) by dropping high bits.
  var hashed = 0;
  for (var ii = 0; ii < string.length; ii++) {
    hashed = (31 * hashed + string.charCodeAt(ii)) | 0;
  }
  return smi(hashed);
}

function hashSymbol(sym) {
  var hashed = symbolMap[sym];
  if (hashed !== undefined) {
    return hashed;
  }

  hashed = nextHash();

  symbolMap[sym] = hashed;

  return hashed;
}

function hashJSObj(obj) {
  var hashed;
  if (usingWeakMap) {
    hashed = weakMap.get(obj);
    if (hashed !== undefined) {
      return hashed;
    }
  }

  hashed = obj[UID_HASH_KEY];
  if (hashed !== undefined) {
    return hashed;
  }

  if (!canDefineProperty) {
    hashed = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];
    if (hashed !== undefined) {
      return hashed;
    }

    hashed = getIENodeHash(obj);
    if (hashed !== undefined) {
      return hashed;
    }
  }

  hashed = nextHash();

  if (usingWeakMap) {
    weakMap.set(obj, hashed);
  } else if (isExtensible !== undefined && isExtensible(obj) === false) {
    throw new Error('Non-extensible objects are not allowed as keys.');
  } else if (canDefineProperty) {
    Object.defineProperty(obj, UID_HASH_KEY, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: hashed,
    });
  } else if (
    obj.propertyIsEnumerable !== undefined &&
    obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable
  ) {
    // Since we can't define a non-enumerable property on the object
    // we'll hijack one of the less-used non-enumerable properties to
    // save our hash on it. Since this is a function it will not show up in
    // `JSON.stringify` which is what we want.
    obj.propertyIsEnumerable = function () {
      return this.constructor.prototype.propertyIsEnumerable.apply(
        this,
        arguments
      );
    };
    obj.propertyIsEnumerable[UID_HASH_KEY] = hashed;
  } else if (obj.nodeType !== undefined) {
    // At this point we couldn't get the IE `uniqueID` to use as a hash
    // and we couldn't use a non-enumerable property to exploit the
    // dontEnum bug so we simply add the `UID_HASH_KEY` on the node
    // itself.
    obj[UID_HASH_KEY] = hashed;
  } else {
    throw new Error('Unable to set a non-enumerable property on object.');
  }

  return hashed;
}

// Get references to ES5 object methods.
var isExtensible = Object.isExtensible;

// True if Object.defineProperty works as expected. IE8 fails this test.
var canDefineProperty = (function () {
  try {
    Object.defineProperty({}, '@', {});
    return true;
  } catch (e) {
    return false;
  }
})();

// IE has a `uniqueID` property on DOM nodes. We can construct the hash from it
// and avoid memory leaks from the IE cloneNode bug.
function getIENodeHash(node) {
  if (node && node.nodeType > 0) {
    switch (node.nodeType) {
      case 1: // Element
        return node.uniqueID;
      case 9: // Document
        return node.documentElement && node.documentElement.uniqueID;
    }
  }
}

function valueOf(obj) {
  return obj.valueOf !== defaultValueOf && typeof obj.valueOf === 'function'
    ? obj.valueOf(obj)
    : obj;
}

function nextHash() {
  var nextHash = ++_objHashUID;
  if (_objHashUID & 0x40000000) {
    _objHashUID = 0;
  }
  return nextHash;
}

// If possible, use a WeakMap.
var usingWeakMap = typeof WeakMap === 'function';
var weakMap;
if (usingWeakMap) {
  weakMap = new WeakMap();
}

var symbolMap = Object.create(null);

var _objHashUID = 0;

var UID_HASH_KEY = '__immutablehash__';
if (typeof Symbol === 'function') {
  UID_HASH_KEY = Symbol(UID_HASH_KEY);
}

var STRING_HASH_CACHE_MIN_STRLEN = 16;
var STRING_HASH_CACHE_MAX_SIZE = 255;
var STRING_HASH_CACHE_SIZE = 0;
var stringHashCache = {};

var ToKeyedSequence = /*@__PURE__*/(function (KeyedSeq) {
  function ToKeyedSequence(indexed, useKeys) {
    this._iter = indexed;
    this._useKeys = useKeys;
    this.size = indexed.size;
  }

  if ( KeyedSeq ) ToKeyedSequence.__proto__ = KeyedSeq;
  ToKeyedSequence.prototype = Object.create( KeyedSeq && KeyedSeq.prototype );
  ToKeyedSequence.prototype.constructor = ToKeyedSequence;

  ToKeyedSequence.prototype.get = function get (key, notSetValue) {
    return this._iter.get(key, notSetValue);
  };

  ToKeyedSequence.prototype.has = function has (key) {
    return this._iter.has(key);
  };

  ToKeyedSequence.prototype.valueSeq = function valueSeq () {
    return this._iter.valueSeq();
  };

  ToKeyedSequence.prototype.reverse = function reverse () {
    var this$1$1 = this;

    var reversedSequence = reverseFactory(this, true);
    if (!this._useKeys) {
      reversedSequence.valueSeq = function () { return this$1$1._iter.toSeq().reverse(); };
    }
    return reversedSequence;
  };

  ToKeyedSequence.prototype.map = function map (mapper, context) {
    var this$1$1 = this;

    var mappedSequence = mapFactory(this, mapper, context);
    if (!this._useKeys) {
      mappedSequence.valueSeq = function () { return this$1$1._iter.toSeq().map(mapper, context); };
    }
    return mappedSequence;
  };

  ToKeyedSequence.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    return this._iter.__iterate(function (v, k) { return fn(v, k, this$1$1); }, reverse);
  };

  ToKeyedSequence.prototype.__iterator = function __iterator (type, reverse) {
    return this._iter.__iterator(type, reverse);
  };

  return ToKeyedSequence;
}(KeyedSeq));
ToKeyedSequence.prototype[IS_ORDERED_SYMBOL] = true;

var ToIndexedSequence = /*@__PURE__*/(function (IndexedSeq) {
  function ToIndexedSequence(iter) {
    this._iter = iter;
    this.size = iter.size;
  }

  if ( IndexedSeq ) ToIndexedSequence.__proto__ = IndexedSeq;
  ToIndexedSequence.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
  ToIndexedSequence.prototype.constructor = ToIndexedSequence;

  ToIndexedSequence.prototype.includes = function includes (value) {
    return this._iter.includes(value);
  };

  ToIndexedSequence.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    var i = 0;
    reverse && ensureSize(this);
    return this._iter.__iterate(
      function (v) { return fn(v, reverse ? this$1$1.size - ++i : i++, this$1$1); },
      reverse
    );
  };

  ToIndexedSequence.prototype.__iterator = function __iterator (type, reverse) {
    var this$1$1 = this;

    var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
    var i = 0;
    reverse && ensureSize(this);
    return new Iterator(function () {
      var step = iterator.next();
      return step.done
        ? step
        : iteratorValue(
            type,
            reverse ? this$1$1.size - ++i : i++,
            step.value,
            step
          );
    });
  };

  return ToIndexedSequence;
}(IndexedSeq));

var ToSetSequence = /*@__PURE__*/(function (SetSeq) {
  function ToSetSequence(iter) {
    this._iter = iter;
    this.size = iter.size;
  }

  if ( SetSeq ) ToSetSequence.__proto__ = SetSeq;
  ToSetSequence.prototype = Object.create( SetSeq && SetSeq.prototype );
  ToSetSequence.prototype.constructor = ToSetSequence;

  ToSetSequence.prototype.has = function has (key) {
    return this._iter.includes(key);
  };

  ToSetSequence.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    return this._iter.__iterate(function (v) { return fn(v, v, this$1$1); }, reverse);
  };

  ToSetSequence.prototype.__iterator = function __iterator (type, reverse) {
    var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
    return new Iterator(function () {
      var step = iterator.next();
      return step.done
        ? step
        : iteratorValue(type, step.value, step.value, step);
    });
  };

  return ToSetSequence;
}(SetSeq));

var FromEntriesSequence = /*@__PURE__*/(function (KeyedSeq) {
  function FromEntriesSequence(entries) {
    this._iter = entries;
    this.size = entries.size;
  }

  if ( KeyedSeq ) FromEntriesSequence.__proto__ = KeyedSeq;
  FromEntriesSequence.prototype = Object.create( KeyedSeq && KeyedSeq.prototype );
  FromEntriesSequence.prototype.constructor = FromEntriesSequence;

  FromEntriesSequence.prototype.entrySeq = function entrySeq () {
    return this._iter.toSeq();
  };

  FromEntriesSequence.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    return this._iter.__iterate(function (entry) {
      // Check if entry exists first so array access doesn't throw for holes
      // in the parent iteration.
      if (entry) {
        validateEntry(entry);
        var indexedCollection = isCollection(entry);
        return fn(
          indexedCollection ? entry.get(1) : entry[1],
          indexedCollection ? entry.get(0) : entry[0],
          this$1$1
        );
      }
    }, reverse);
  };

  FromEntriesSequence.prototype.__iterator = function __iterator (type, reverse) {
    var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
    return new Iterator(function () {
      while (true) {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        // Check if entry exists first so array access doesn't throw for holes
        // in the parent iteration.
        if (entry) {
          validateEntry(entry);
          var indexedCollection = isCollection(entry);
          return iteratorValue(
            type,
            indexedCollection ? entry.get(0) : entry[0],
            indexedCollection ? entry.get(1) : entry[1],
            step
          );
        }
      }
    });
  };

  return FromEntriesSequence;
}(KeyedSeq));

ToIndexedSequence.prototype.cacheResult =
  ToKeyedSequence.prototype.cacheResult =
  ToSetSequence.prototype.cacheResult =
  FromEntriesSequence.prototype.cacheResult =
    cacheResultThrough;

function flipFactory(collection) {
  var flipSequence = makeSequence(collection);
  flipSequence._iter = collection;
  flipSequence.size = collection.size;
  flipSequence.flip = function () { return collection; };
  flipSequence.reverse = function () {
    var reversedSequence = collection.reverse.apply(this); // super.reverse()
    reversedSequence.flip = function () { return collection.reverse(); };
    return reversedSequence;
  };
  flipSequence.has = function (key) { return collection.includes(key); };
  flipSequence.includes = function (key) { return collection.has(key); };
  flipSequence.cacheResult = cacheResultThrough;
  flipSequence.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    return collection.__iterate(function (v, k) { return fn(k, v, this$1$1) !== false; }, reverse);
  };
  flipSequence.__iteratorUncached = function (type, reverse) {
    if (type === ITERATE_ENTRIES) {
      var iterator = collection.__iterator(type, reverse);
      return new Iterator(function () {
        var step = iterator.next();
        if (!step.done) {
          var k = step.value[0];
          step.value[0] = step.value[1];
          step.value[1] = k;
        }
        return step;
      });
    }
    return collection.__iterator(
      type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES,
      reverse
    );
  };
  return flipSequence;
}

function mapFactory(collection, mapper, context) {
  var mappedSequence = makeSequence(collection);
  mappedSequence.size = collection.size;
  mappedSequence.has = function (key) { return collection.has(key); };
  mappedSequence.get = function (key, notSetValue) {
    var v = collection.get(key, NOT_SET);
    return v === NOT_SET
      ? notSetValue
      : mapper.call(context, v, key, collection);
  };
  mappedSequence.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    return collection.__iterate(
      function (v, k, c) { return fn(mapper.call(context, v, k, c), k, this$1$1) !== false; },
      reverse
    );
  };
  mappedSequence.__iteratorUncached = function (type, reverse) {
    var iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    return new Iterator(function () {
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      var key = entry[0];
      return iteratorValue(
        type,
        key,
        mapper.call(context, entry[1], key, collection),
        step
      );
    });
  };
  return mappedSequence;
}

function reverseFactory(collection, useKeys) {
  var this$1$1 = this;

  var reversedSequence = makeSequence(collection);
  reversedSequence._iter = collection;
  reversedSequence.size = collection.size;
  reversedSequence.reverse = function () { return collection; };
  if (collection.flip) {
    reversedSequence.flip = function () {
      var flipSequence = flipFactory(collection);
      flipSequence.reverse = function () { return collection.flip(); };
      return flipSequence;
    };
  }
  reversedSequence.get = function (key, notSetValue) { return collection.get(useKeys ? key : -1 - key, notSetValue); };
  reversedSequence.has = function (key) { return collection.has(useKeys ? key : -1 - key); };
  reversedSequence.includes = function (value) { return collection.includes(value); };
  reversedSequence.cacheResult = cacheResultThrough;
  reversedSequence.__iterate = function (fn, reverse) {
    var this$1$1 = this;

    var i = 0;
    reverse && ensureSize(collection);
    return collection.__iterate(
      function (v, k) { return fn(v, useKeys ? k : reverse ? this$1$1.size - ++i : i++, this$1$1); },
      !reverse
    );
  };
  reversedSequence.__iterator = function (type, reverse) {
    var i = 0;
    reverse && ensureSize(collection);
    var iterator = collection.__iterator(ITERATE_ENTRIES, !reverse);
    return new Iterator(function () {
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      return iteratorValue(
        type,
        useKeys ? entry[0] : reverse ? this$1$1.size - ++i : i++,
        entry[1],
        step
      );
    });
  };
  return reversedSequence;
}

function filterFactory(collection, predicate, context, useKeys) {
  var filterSequence = makeSequence(collection);
  if (useKeys) {
    filterSequence.has = function (key) {
      var v = collection.get(key, NOT_SET);
      return v !== NOT_SET && !!predicate.call(context, v, key, collection);
    };
    filterSequence.get = function (key, notSetValue) {
      var v = collection.get(key, NOT_SET);
      return v !== NOT_SET && predicate.call(context, v, key, collection)
        ? v
        : notSetValue;
    };
  }
  filterSequence.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    var iterations = 0;
    collection.__iterate(function (v, k, c) {
      if (predicate.call(context, v, k, c)) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, this$1$1);
      }
    }, reverse);
    return iterations;
  };
  filterSequence.__iteratorUncached = function (type, reverse) {
    var iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    var iterations = 0;
    return new Iterator(function () {
      while (true) {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var key = entry[0];
        var value = entry[1];
        if (predicate.call(context, value, key, collection)) {
          return iteratorValue(type, useKeys ? key : iterations++, value, step);
        }
      }
    });
  };
  return filterSequence;
}

function countByFactory(collection, grouper, context) {
  var groups = Map().asMutable();
  collection.__iterate(function (v, k) {
    groups.update(grouper.call(context, v, k, collection), 0, function (a) { return a + 1; });
  });
  return groups.asImmutable();
}

function groupByFactory(collection, grouper, context) {
  var isKeyedIter = isKeyed(collection);
  var groups = (isOrdered(collection) ? OrderedMap() : Map()).asMutable();
  collection.__iterate(function (v, k) {
    groups.update(
      grouper.call(context, v, k, collection),
      function (a) { return ((a = a || []), a.push(isKeyedIter ? [k, v] : v), a); }
    );
  });
  var coerce = collectionClass(collection);
  return groups.map(function (arr) { return reify(collection, coerce(arr)); }).asImmutable();
}

function partitionFactory(collection, predicate, context) {
  var isKeyedIter = isKeyed(collection);
  var groups = [[], []];
  collection.__iterate(function (v, k) {
    groups[predicate.call(context, v, k, collection) ? 1 : 0].push(
      isKeyedIter ? [k, v] : v
    );
  });
  var coerce = collectionClass(collection);
  return groups.map(function (arr) { return reify(collection, coerce(arr)); });
}

function sliceFactory(collection, begin, end, useKeys) {
  var originalSize = collection.size;

  if (wholeSlice(begin, end, originalSize)) {
    return collection;
  }

  // begin or end can not be resolved if they were provided as negative numbers and
  // this collection's size is unknown. In that case, cache first so there is
  // a known size and these do not resolve to NaN.
  if (typeof originalSize === 'undefined' && (begin < 0 || end < 0)) {
    return sliceFactory(collection.toSeq().cacheResult(), begin, end, useKeys);
  }

  var resolvedBegin = resolveBegin(begin, originalSize);
  var resolvedEnd = resolveEnd(end, originalSize);

  // Note: resolvedEnd is undefined when the original sequence's length is
  // unknown and this slice did not supply an end and should contain all
  // elements after resolvedBegin.
  // In that case, resolvedSize will be NaN and sliceSize will remain undefined.
  var resolvedSize = resolvedEnd - resolvedBegin;
  var sliceSize;
  if (resolvedSize === resolvedSize) {
    sliceSize = resolvedSize < 0 ? 0 : resolvedSize;
  }

  var sliceSeq = makeSequence(collection);

  // If collection.size is undefined, the size of the realized sliceSeq is
  // unknown at this point unless the number of items to slice is 0
  sliceSeq.size =
    sliceSize === 0 ? sliceSize : (collection.size && sliceSize) || undefined;

  if (!useKeys && isSeq(collection) && sliceSize >= 0) {
    sliceSeq.get = function (index, notSetValue) {
      index = wrapIndex(this, index);
      return index >= 0 && index < sliceSize
        ? collection.get(index + resolvedBegin, notSetValue)
        : notSetValue;
    };
  }

  sliceSeq.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    if (sliceSize === 0) {
      return 0;
    }
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var skipped = 0;
    var isSkipping = true;
    var iterations = 0;
    collection.__iterate(function (v, k) {
      if (!(isSkipping && (isSkipping = skipped++ < resolvedBegin))) {
        iterations++;
        return (
          fn(v, useKeys ? k : iterations - 1, this$1$1) !== false &&
          iterations !== sliceSize
        );
      }
    });
    return iterations;
  };

  sliceSeq.__iteratorUncached = function (type, reverse) {
    if (sliceSize !== 0 && reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    // Don't bother instantiating parent iterator if taking 0.
    if (sliceSize === 0) {
      return new Iterator(iteratorDone);
    }
    var iterator = collection.__iterator(type, reverse);
    var skipped = 0;
    var iterations = 0;
    return new Iterator(function () {
      while (skipped++ < resolvedBegin) {
        iterator.next();
      }
      if (++iterations > sliceSize) {
        return iteratorDone();
      }
      var step = iterator.next();
      if (useKeys || type === ITERATE_VALUES || step.done) {
        return step;
      }
      if (type === ITERATE_KEYS) {
        return iteratorValue(type, iterations - 1, undefined, step);
      }
      return iteratorValue(type, iterations - 1, step.value[1], step);
    });
  };

  return sliceSeq;
}

function takeWhileFactory(collection, predicate, context) {
  var takeSequence = makeSequence(collection);
  takeSequence.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterations = 0;
    collection.__iterate(
      function (v, k, c) { return predicate.call(context, v, k, c) && ++iterations && fn(v, k, this$1$1); }
    );
    return iterations;
  };
  takeSequence.__iteratorUncached = function (type, reverse) {
    var this$1$1 = this;

    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    var iterating = true;
    return new Iterator(function () {
      if (!iterating) {
        return iteratorDone();
      }
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      var k = entry[0];
      var v = entry[1];
      if (!predicate.call(context, v, k, this$1$1)) {
        iterating = false;
        return iteratorDone();
      }
      return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
    });
  };
  return takeSequence;
}

function skipWhileFactory(collection, predicate, context, useKeys) {
  var skipSequence = makeSequence(collection);
  skipSequence.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var isSkipping = true;
    var iterations = 0;
    collection.__iterate(function (v, k, c) {
      if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, this$1$1);
      }
    });
    return iterations;
  };
  skipSequence.__iteratorUncached = function (type, reverse) {
    var this$1$1 = this;

    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    var skipping = true;
    var iterations = 0;
    return new Iterator(function () {
      var step;
      var k;
      var v;
      do {
        step = iterator.next();
        if (step.done) {
          if (useKeys || type === ITERATE_VALUES) {
            return step;
          }
          if (type === ITERATE_KEYS) {
            return iteratorValue(type, iterations++, undefined, step);
          }
          return iteratorValue(type, iterations++, step.value[1], step);
        }
        var entry = step.value;
        k = entry[0];
        v = entry[1];
        skipping && (skipping = predicate.call(context, v, k, this$1$1));
      } while (skipping);
      return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
    });
  };
  return skipSequence;
}

function concatFactory(collection, values) {
  var isKeyedCollection = isKeyed(collection);
  var iters = [collection]
    .concat(values)
    .map(function (v) {
      if (!isCollection(v)) {
        v = isKeyedCollection
          ? keyedSeqFromValue(v)
          : indexedSeqFromValue(Array.isArray(v) ? v : [v]);
      } else if (isKeyedCollection) {
        v = KeyedCollection(v);
      }
      return v;
    })
    .filter(function (v) { return v.size !== 0; });

  if (iters.length === 0) {
    return collection;
  }

  if (iters.length === 1) {
    var singleton = iters[0];
    if (
      singleton === collection ||
      (isKeyedCollection && isKeyed(singleton)) ||
      (isIndexed(collection) && isIndexed(singleton))
    ) {
      return singleton;
    }
  }

  var concatSeq = new ArraySeq(iters);
  if (isKeyedCollection) {
    concatSeq = concatSeq.toKeyedSeq();
  } else if (!isIndexed(collection)) {
    concatSeq = concatSeq.toSetSeq();
  }
  concatSeq = concatSeq.flatten(true);
  concatSeq.size = iters.reduce(function (sum, seq) {
    if (sum !== undefined) {
      var size = seq.size;
      if (size !== undefined) {
        return sum + size;
      }
    }
  }, 0);
  return concatSeq;
}

function flattenFactory(collection, depth, useKeys) {
  var flatSequence = makeSequence(collection);
  flatSequence.__iterateUncached = function (fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterations = 0;
    var stopped = false;
    function flatDeep(iter, currentDepth) {
      iter.__iterate(function (v, k) {
        if ((!depth || currentDepth < depth) && isCollection(v)) {
          flatDeep(v, currentDepth + 1);
        } else {
          iterations++;
          if (fn(v, useKeys ? k : iterations - 1, flatSequence) === false) {
            stopped = true;
          }
        }
        return !stopped;
      }, reverse);
    }
    flatDeep(collection, 0);
    return iterations;
  };
  flatSequence.__iteratorUncached = function (type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = collection.__iterator(type, reverse);
    var stack = [];
    var iterations = 0;
    return new Iterator(function () {
      while (iterator) {
        var step = iterator.next();
        if (step.done !== false) {
          iterator = stack.pop();
          continue;
        }
        var v = step.value;
        if (type === ITERATE_ENTRIES) {
          v = v[1];
        }
        if ((!depth || stack.length < depth) && isCollection(v)) {
          stack.push(iterator);
          iterator = v.__iterator(type, reverse);
        } else {
          return useKeys ? step : iteratorValue(type, iterations++, v, step);
        }
      }
      return iteratorDone();
    });
  };
  return flatSequence;
}

function flatMapFactory(collection, mapper, context) {
  var coerce = collectionClass(collection);
  return collection
    .toSeq()
    .map(function (v, k) { return coerce(mapper.call(context, v, k, collection)); })
    .flatten(true);
}

function interposeFactory(collection, separator) {
  var interposedSequence = makeSequence(collection);
  interposedSequence.size = collection.size && collection.size * 2 - 1;
  interposedSequence.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    var iterations = 0;
    collection.__iterate(
      function (v) { return (!iterations || fn(separator, iterations++, this$1$1) !== false) &&
        fn(v, iterations++, this$1$1) !== false; },
      reverse
    );
    return iterations;
  };
  interposedSequence.__iteratorUncached = function (type, reverse) {
    var iterator = collection.__iterator(ITERATE_VALUES, reverse);
    var iterations = 0;
    var step;
    return new Iterator(function () {
      if (!step || iterations % 2) {
        step = iterator.next();
        if (step.done) {
          return step;
        }
      }
      return iterations % 2
        ? iteratorValue(type, iterations++, separator)
        : iteratorValue(type, iterations++, step.value, step);
    });
  };
  return interposedSequence;
}

function sortFactory(collection, comparator, mapper) {
  if (!comparator) {
    comparator = defaultComparator;
  }
  var isKeyedCollection = isKeyed(collection);
  var index = 0;
  var entries = collection
    .toSeq()
    .map(function (v, k) { return [k, v, index++, mapper ? mapper(v, k, collection) : v]; })
    .valueSeq()
    .toArray();
  entries
    .sort(function (a, b) { return comparator(a[3], b[3]) || a[2] - b[2]; })
    .forEach(
      isKeyedCollection
        ? function (v, i) {
            entries[i].length = 2;
          }
        : function (v, i) {
            entries[i] = v[1];
          }
    );
  return isKeyedCollection
    ? KeyedSeq(entries)
    : isIndexed(collection)
    ? IndexedSeq(entries)
    : SetSeq(entries);
}

function maxFactory(collection, comparator, mapper) {
  if (!comparator) {
    comparator = defaultComparator;
  }
  if (mapper) {
    var entry = collection
      .toSeq()
      .map(function (v, k) { return [v, mapper(v, k, collection)]; })
      .reduce(function (a, b) { return (maxCompare(comparator, a[1], b[1]) ? b : a); });
    return entry && entry[0];
  }
  return collection.reduce(function (a, b) { return (maxCompare(comparator, a, b) ? b : a); });
}

function maxCompare(comparator, a, b) {
  var comp = comparator(b, a);
  // b is considered the new max if the comparator declares them equal, but
  // they are not equal and b is in fact a nullish value.
  return (
    (comp === 0 && b !== a && (b === undefined || b === null || b !== b)) ||
    comp > 0
  );
}

function zipWithFactory(keyIter, zipper, iters, zipAll) {
  var zipSequence = makeSequence(keyIter);
  var sizes = new ArraySeq(iters).map(function (i) { return i.size; });
  zipSequence.size = zipAll ? sizes.max() : sizes.min();
  // Note: this a generic base implementation of __iterate in terms of
  // __iterator which may be more generically useful in the future.
  zipSequence.__iterate = function (fn, reverse) {
    /* generic:
    var iterator = this.__iterator(ITERATE_ENTRIES, reverse);
    var step;
    var iterations = 0;
    while (!(step = iterator.next()).done) {
      iterations++;
      if (fn(step.value[1], step.value[0], this) === false) {
        break;
      }
    }
    return iterations;
    */
    // indexed:
    var iterator = this.__iterator(ITERATE_VALUES, reverse);
    var step;
    var iterations = 0;
    while (!(step = iterator.next()).done) {
      if (fn(step.value, iterations++, this) === false) {
        break;
      }
    }
    return iterations;
  };
  zipSequence.__iteratorUncached = function (type, reverse) {
    var iterators = iters.map(
      function (i) { return ((i = Collection(i)), getIterator(reverse ? i.reverse() : i)); }
    );
    var iterations = 0;
    var isDone = false;
    return new Iterator(function () {
      var steps;
      if (!isDone) {
        steps = iterators.map(function (i) { return i.next(); });
        isDone = zipAll ? steps.every(function (s) { return s.done; }) : steps.some(function (s) { return s.done; });
      }
      if (isDone) {
        return iteratorDone();
      }
      return iteratorValue(
        type,
        iterations++,
        zipper.apply(
          null,
          steps.map(function (s) { return s.value; })
        )
      );
    });
  };
  return zipSequence;
}

// #pragma Helper Functions

function reify(iter, seq) {
  return iter === seq ? iter : isSeq(iter) ? seq : iter.constructor(seq);
}

function validateEntry(entry) {
  if (entry !== Object(entry)) {
    throw new TypeError('Expected [K, V] tuple: ' + entry);
  }
}

function collectionClass(collection) {
  return isKeyed(collection)
    ? KeyedCollection
    : isIndexed(collection)
    ? IndexedCollection
    : SetCollection;
}

function makeSequence(collection) {
  return Object.create(
    (isKeyed(collection)
      ? KeyedSeq
      : isIndexed(collection)
      ? IndexedSeq
      : SetSeq
    ).prototype
  );
}

function cacheResultThrough() {
  if (this._iter.cacheResult) {
    this._iter.cacheResult();
    this.size = this._iter.size;
    return this;
  }
  return Seq.prototype.cacheResult.call(this);
}

function defaultComparator(a, b) {
  if (a === undefined && b === undefined) {
    return 0;
  }

  if (a === undefined) {
    return 1;
  }

  if (b === undefined) {
    return -1;
  }

  return a > b ? 1 : a < b ? -1 : 0;
}

function arrCopy(arr, offset) {
  offset = offset || 0;
  var len = Math.max(0, arr.length - offset);
  var newArr = new Array(len);
  for (var ii = 0; ii < len; ii++) {
    newArr[ii] = arr[ii + offset];
  }
  return newArr;
}

function invariant(condition, error) {
  if (!condition) { throw new Error(error); }
}

function assertNotInfinite(size) {
  invariant(
    size !== Infinity,
    'Cannot perform this action with an infinite size.'
  );
}

function coerceKeyPath(keyPath) {
  if (isArrayLike(keyPath) && typeof keyPath !== 'string') {
    return keyPath;
  }
  if (isOrdered(keyPath)) {
    return keyPath.toArray();
  }
  throw new TypeError(
    'Invalid keyPath: expected Ordered Collection or Array: ' + keyPath
  );
}

var toString = Object.prototype.toString;

function isPlainObject(value) {
  // The base prototype's toString deals with Argument objects and native namespaces like Math
  if (
    !value ||
    typeof value !== 'object' ||
    toString.call(value) !== '[object Object]'
  ) {
    return false;
  }

  var proto = Object.getPrototypeOf(value);
  if (proto === null) {
    return true;
  }

  // Iteratively going up the prototype chain is needed for cross-realm environments (differing contexts, iframes, etc)
  var parentProto = proto;
  var nextProto = Object.getPrototypeOf(proto);
  while (nextProto !== null) {
    parentProto = nextProto;
    nextProto = Object.getPrototypeOf(parentProto);
  }
  return parentProto === proto;
}

/**
 * Returns true if the value is a potentially-persistent data structure, either
 * provided by Immutable.js or a plain Array or Object.
 */
function isDataStructure(value) {
  return (
    typeof value === 'object' &&
    (isImmutable(value) || Array.isArray(value) || isPlainObject(value))
  );
}

function quoteString(value) {
  try {
    return typeof value === 'string' ? JSON.stringify(value) : String(value);
  } catch (_ignoreError) {
    return JSON.stringify(value);
  }
}

function has(collection, key) {
  return isImmutable(collection)
    ? collection.has(key)
    : isDataStructure(collection) && hasOwnProperty.call(collection, key);
}

function get(collection, key, notSetValue) {
  return isImmutable(collection)
    ? collection.get(key, notSetValue)
    : !has(collection, key)
    ? notSetValue
    : typeof collection.get === 'function'
    ? collection.get(key)
    : collection[key];
}

function shallowCopy(from) {
  if (Array.isArray(from)) {
    return arrCopy(from);
  }
  var to = {};
  for (var key in from) {
    if (hasOwnProperty.call(from, key)) {
      to[key] = from[key];
    }
  }
  return to;
}

function remove(collection, key) {
  if (!isDataStructure(collection)) {
    throw new TypeError(
      'Cannot update non-data-structure value: ' + collection
    );
  }
  if (isImmutable(collection)) {
    if (!collection.remove) {
      throw new TypeError(
        'Cannot update immutable value without .remove() method: ' + collection
      );
    }
    return collection.remove(key);
  }
  if (!hasOwnProperty.call(collection, key)) {
    return collection;
  }
  var collectionCopy = shallowCopy(collection);
  if (Array.isArray(collectionCopy)) {
    collectionCopy.splice(key, 1);
  } else {
    delete collectionCopy[key];
  }
  return collectionCopy;
}

function set(collection, key, value) {
  if (!isDataStructure(collection)) {
    throw new TypeError(
      'Cannot update non-data-structure value: ' + collection
    );
  }
  if (isImmutable(collection)) {
    if (!collection.set) {
      throw new TypeError(
        'Cannot update immutable value without .set() method: ' + collection
      );
    }
    return collection.set(key, value);
  }
  if (hasOwnProperty.call(collection, key) && value === collection[key]) {
    return collection;
  }
  var collectionCopy = shallowCopy(collection);
  collectionCopy[key] = value;
  return collectionCopy;
}

function updateIn$1(collection, keyPath, notSetValue, updater) {
  if (!updater) {
    updater = notSetValue;
    notSetValue = undefined;
  }
  var updatedValue = updateInDeeply(
    isImmutable(collection),
    collection,
    coerceKeyPath(keyPath),
    0,
    notSetValue,
    updater
  );
  return updatedValue === NOT_SET ? notSetValue : updatedValue;
}

function updateInDeeply(
  inImmutable,
  existing,
  keyPath,
  i,
  notSetValue,
  updater
) {
  var wasNotSet = existing === NOT_SET;
  if (i === keyPath.length) {
    var existingValue = wasNotSet ? notSetValue : existing;
    var newValue = updater(existingValue);
    return newValue === existingValue ? existing : newValue;
  }
  if (!wasNotSet && !isDataStructure(existing)) {
    throw new TypeError(
      'Cannot update within non-data-structure value in path [' +
        keyPath.slice(0, i).map(quoteString) +
        ']: ' +
        existing
    );
  }
  var key = keyPath[i];
  var nextExisting = wasNotSet ? NOT_SET : get(existing, key, NOT_SET);
  var nextUpdated = updateInDeeply(
    nextExisting === NOT_SET ? inImmutable : isImmutable(nextExisting),
    nextExisting,
    keyPath,
    i + 1,
    notSetValue,
    updater
  );
  return nextUpdated === nextExisting
    ? existing
    : nextUpdated === NOT_SET
    ? remove(existing, key)
    : set(
        wasNotSet ? (inImmutable ? emptyMap() : {}) : existing,
        key,
        nextUpdated
      );
}

function setIn$1(collection, keyPath, value) {
  return updateIn$1(collection, keyPath, NOT_SET, function () { return value; });
}

function setIn(keyPath, v) {
  return setIn$1(this, keyPath, v);
}

function removeIn(collection, keyPath) {
  return updateIn$1(collection, keyPath, function () { return NOT_SET; });
}

function deleteIn(keyPath) {
  return removeIn(this, keyPath);
}

function update$1(collection, key, notSetValue, updater) {
  return updateIn$1(collection, [key], notSetValue, updater);
}

function update(key, notSetValue, updater) {
  return arguments.length === 1
    ? key(this)
    : update$1(this, key, notSetValue, updater);
}

function updateIn(keyPath, notSetValue, updater) {
  return updateIn$1(this, keyPath, notSetValue, updater);
}

function merge$1() {
  var iters = [], len = arguments.length;
  while ( len-- ) iters[ len ] = arguments[ len ];

  return mergeIntoKeyedWith(this, iters);
}

function mergeWith$1(merger) {
  var iters = [], len = arguments.length - 1;
  while ( len-- > 0 ) iters[ len ] = arguments[ len + 1 ];

  if (typeof merger !== 'function') {
    throw new TypeError('Invalid merger function: ' + merger);
  }
  return mergeIntoKeyedWith(this, iters, merger);
}

function mergeIntoKeyedWith(collection, collections, merger) {
  var iters = [];
  for (var ii = 0; ii < collections.length; ii++) {
    var collection$1 = KeyedCollection(collections[ii]);
    if (collection$1.size !== 0) {
      iters.push(collection$1);
    }
  }
  if (iters.length === 0) {
    return collection;
  }
  if (
    collection.toSeq().size === 0 &&
    !collection.__ownerID &&
    iters.length === 1
  ) {
    return collection.constructor(iters[0]);
  }
  return collection.withMutations(function (collection) {
    var mergeIntoCollection = merger
      ? function (value, key) {
          update$1(collection, key, NOT_SET, function (oldVal) { return oldVal === NOT_SET ? value : merger(oldVal, value, key); }
          );
        }
      : function (value, key) {
          collection.set(key, value);
        };
    for (var ii = 0; ii < iters.length; ii++) {
      iters[ii].forEach(mergeIntoCollection);
    }
  });
}

function merge(collection) {
  var sources = [], len = arguments.length - 1;
  while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

  return mergeWithSources(collection, sources);
}

function mergeWith(merger, collection) {
  var sources = [], len = arguments.length - 2;
  while ( len-- > 0 ) sources[ len ] = arguments[ len + 2 ];

  return mergeWithSources(collection, sources, merger);
}

function mergeDeep$1(collection) {
  var sources = [], len = arguments.length - 1;
  while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

  return mergeDeepWithSources(collection, sources);
}

function mergeDeepWith$1(merger, collection) {
  var sources = [], len = arguments.length - 2;
  while ( len-- > 0 ) sources[ len ] = arguments[ len + 2 ];

  return mergeDeepWithSources(collection, sources, merger);
}

function mergeDeepWithSources(collection, sources, merger) {
  return mergeWithSources(collection, sources, deepMergerWith(merger));
}

function mergeWithSources(collection, sources, merger) {
  if (!isDataStructure(collection)) {
    throw new TypeError(
      'Cannot merge into non-data-structure value: ' + collection
    );
  }
  if (isImmutable(collection)) {
    return typeof merger === 'function' && collection.mergeWith
      ? collection.mergeWith.apply(collection, [ merger ].concat( sources ))
      : collection.merge
      ? collection.merge.apply(collection, sources)
      : collection.concat.apply(collection, sources);
  }
  var isArray = Array.isArray(collection);
  var merged = collection;
  var Collection = isArray ? IndexedCollection : KeyedCollection;
  var mergeItem = isArray
    ? function (value) {
        // Copy on write
        if (merged === collection) {
          merged = shallowCopy(merged);
        }
        merged.push(value);
      }
    : function (value, key) {
        var hasVal = hasOwnProperty.call(merged, key);
        var nextVal =
          hasVal && merger ? merger(merged[key], value, key) : value;
        if (!hasVal || nextVal !== merged[key]) {
          // Copy on write
          if (merged === collection) {
            merged = shallowCopy(merged);
          }
          merged[key] = nextVal;
        }
      };
  for (var i = 0; i < sources.length; i++) {
    Collection(sources[i]).forEach(mergeItem);
  }
  return merged;
}

function deepMergerWith(merger) {
  function deepMerger(oldValue, newValue, key) {
    return isDataStructure(oldValue) &&
      isDataStructure(newValue) &&
      areMergeable(oldValue, newValue)
      ? mergeWithSources(oldValue, [newValue], deepMerger)
      : merger
      ? merger(oldValue, newValue, key)
      : newValue;
  }
  return deepMerger;
}

/**
 * It's unclear what the desired behavior is for merging two collections that
 * fall into separate categories between keyed, indexed, or set-like, so we only
 * consider them mergeable if they fall into the same category.
 */
function areMergeable(oldDataStructure, newDataStructure) {
  var oldSeq = Seq(oldDataStructure);
  var newSeq = Seq(newDataStructure);
  // This logic assumes that a sequence can only fall into one of the three
  // categories mentioned above (since there's no `isSetLike()` method).
  return (
    isIndexed(oldSeq) === isIndexed(newSeq) &&
    isKeyed(oldSeq) === isKeyed(newSeq)
  );
}

function mergeDeep() {
  var iters = [], len = arguments.length;
  while ( len-- ) iters[ len ] = arguments[ len ];

  return mergeDeepWithSources(this, iters);
}

function mergeDeepWith(merger) {
  var iters = [], len = arguments.length - 1;
  while ( len-- > 0 ) iters[ len ] = arguments[ len + 1 ];

  return mergeDeepWithSources(this, iters, merger);
}

function mergeIn(keyPath) {
  var iters = [], len = arguments.length - 1;
  while ( len-- > 0 ) iters[ len ] = arguments[ len + 1 ];

  return updateIn$1(this, keyPath, emptyMap(), function (m) { return mergeWithSources(m, iters); });
}

function mergeDeepIn(keyPath) {
  var iters = [], len = arguments.length - 1;
  while ( len-- > 0 ) iters[ len ] = arguments[ len + 1 ];

  return updateIn$1(this, keyPath, emptyMap(), function (m) { return mergeDeepWithSources(m, iters); }
  );
}

function withMutations(fn) {
  var mutable = this.asMutable();
  fn(mutable);
  return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
}

function asMutable() {
  return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
}

function asImmutable() {
  return this.__ensureOwner();
}

function wasAltered() {
  return this.__altered;
}

var Map = /*@__PURE__*/(function (KeyedCollection) {
  function Map(value) {
    // eslint-disable-next-line no-constructor-return
    return value === undefined || value === null
      ? emptyMap()
      : isMap(value) && !isOrdered(value)
      ? value
      : emptyMap().withMutations(function (map) {
          var iter = KeyedCollection(value);
          assertNotInfinite(iter.size);
          iter.forEach(function (v, k) { return map.set(k, v); });
        });
  }

  if ( KeyedCollection ) Map.__proto__ = KeyedCollection;
  Map.prototype = Object.create( KeyedCollection && KeyedCollection.prototype );
  Map.prototype.constructor = Map;

  Map.of = function of () {
    var keyValues = [], len = arguments.length;
    while ( len-- ) keyValues[ len ] = arguments[ len ];

    return emptyMap().withMutations(function (map) {
      for (var i = 0; i < keyValues.length; i += 2) {
        if (i + 1 >= keyValues.length) {
          throw new Error('Missing value for key: ' + keyValues[i]);
        }
        map.set(keyValues[i], keyValues[i + 1]);
      }
    });
  };

  Map.prototype.toString = function toString () {
    return this.__toString('Map {', '}');
  };

  // @pragma Access

  Map.prototype.get = function get (k, notSetValue) {
    return this._root
      ? this._root.get(0, undefined, k, notSetValue)
      : notSetValue;
  };

  // @pragma Modification

  Map.prototype.set = function set (k, v) {
    return updateMap(this, k, v);
  };

  Map.prototype.remove = function remove (k) {
    return updateMap(this, k, NOT_SET);
  };

  Map.prototype.deleteAll = function deleteAll (keys) {
    var collection = Collection(keys);

    if (collection.size === 0) {
      return this;
    }

    return this.withMutations(function (map) {
      collection.forEach(function (key) { return map.remove(key); });
    });
  };

  Map.prototype.clear = function clear () {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = 0;
      this._root = null;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return emptyMap();
  };

  // @pragma Composition

  Map.prototype.sort = function sort (comparator) {
    // Late binding
    return OrderedMap(sortFactory(this, comparator));
  };

  Map.prototype.sortBy = function sortBy (mapper, comparator) {
    // Late binding
    return OrderedMap(sortFactory(this, comparator, mapper));
  };

  Map.prototype.map = function map (mapper, context) {
    var this$1$1 = this;

    return this.withMutations(function (map) {
      map.forEach(function (value, key) {
        map.set(key, mapper.call(context, value, key, this$1$1));
      });
    });
  };

  // @pragma Mutability

  Map.prototype.__iterator = function __iterator (type, reverse) {
    return new MapIterator(this, type, reverse);
  };

  Map.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    var iterations = 0;
    this._root &&
      this._root.iterate(function (entry) {
        iterations++;
        return fn(entry[1], entry[0], this$1$1);
      }, reverse);
    return iterations;
  };

  Map.prototype.__ensureOwner = function __ensureOwner (ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      if (this.size === 0) {
        return emptyMap();
      }
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeMap(this.size, this._root, ownerID, this.__hash);
  };

  return Map;
}(KeyedCollection));

Map.isMap = isMap;

var MapPrototype = Map.prototype;
MapPrototype[IS_MAP_SYMBOL] = true;
MapPrototype[DELETE] = MapPrototype.remove;
MapPrototype.removeAll = MapPrototype.deleteAll;
MapPrototype.setIn = setIn;
MapPrototype.removeIn = MapPrototype.deleteIn = deleteIn;
MapPrototype.update = update;
MapPrototype.updateIn = updateIn;
MapPrototype.merge = MapPrototype.concat = merge$1;
MapPrototype.mergeWith = mergeWith$1;
MapPrototype.mergeDeep = mergeDeep;
MapPrototype.mergeDeepWith = mergeDeepWith;
MapPrototype.mergeIn = mergeIn;
MapPrototype.mergeDeepIn = mergeDeepIn;
MapPrototype.withMutations = withMutations;
MapPrototype.wasAltered = wasAltered;
MapPrototype.asImmutable = asImmutable;
MapPrototype['@@transducer/init'] = MapPrototype.asMutable = asMutable;
MapPrototype['@@transducer/step'] = function (result, arr) {
  return result.set(arr[0], arr[1]);
};
MapPrototype['@@transducer/result'] = function (obj) {
  return obj.asImmutable();
};

// #pragma Trie Nodes

var ArrayMapNode = function ArrayMapNode(ownerID, entries) {
  this.ownerID = ownerID;
  this.entries = entries;
};

ArrayMapNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
  var entries = this.entries;
  for (var ii = 0, len = entries.length; ii < len; ii++) {
    if (is(key, entries[ii][0])) {
      return entries[ii][1];
    }
  }
  return notSetValue;
};

ArrayMapNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
  var removed = value === NOT_SET;

  var entries = this.entries;
  var idx = 0;
  var len = entries.length;
  for (; idx < len; idx++) {
    if (is(key, entries[idx][0])) {
      break;
    }
  }
  var exists = idx < len;

  if (exists ? entries[idx][1] === value : removed) {
    return this;
  }

  SetRef(didAlter);
  (removed || !exists) && SetRef(didChangeSize);

  if (removed && entries.length === 1) {
    return; // undefined
  }

  if (!exists && !removed && entries.length >= MAX_ARRAY_MAP_SIZE) {
    return createNodes(ownerID, entries, key, value);
  }

  var isEditable = ownerID && ownerID === this.ownerID;
  var newEntries = isEditable ? entries : arrCopy(entries);

  if (exists) {
    if (removed) {
      idx === len - 1
        ? newEntries.pop()
        : (newEntries[idx] = newEntries.pop());
    } else {
      newEntries[idx] = [key, value];
    }
  } else {
    newEntries.push([key, value]);
  }

  if (isEditable) {
    this.entries = newEntries;
    return this;
  }

  return new ArrayMapNode(ownerID, newEntries);
};

var BitmapIndexedNode = function BitmapIndexedNode(ownerID, bitmap, nodes) {
  this.ownerID = ownerID;
  this.bitmap = bitmap;
  this.nodes = nodes;
};

BitmapIndexedNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }
  var bit = 1 << ((shift === 0 ? keyHash : keyHash >>> shift) & MASK);
  var bitmap = this.bitmap;
  return (bitmap & bit) === 0
    ? notSetValue
    : this.nodes[popCount(bitmap & (bit - 1))].get(
        shift + SHIFT,
        keyHash,
        key,
        notSetValue
      );
};

BitmapIndexedNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }
  var keyHashFrag = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
  var bit = 1 << keyHashFrag;
  var bitmap = this.bitmap;
  var exists = (bitmap & bit) !== 0;

  if (!exists && value === NOT_SET) {
    return this;
  }

  var idx = popCount(bitmap & (bit - 1));
  var nodes = this.nodes;
  var node = exists ? nodes[idx] : undefined;
  var newNode = updateNode(
    node,
    ownerID,
    shift + SHIFT,
    keyHash,
    key,
    value,
    didChangeSize,
    didAlter
  );

  if (newNode === node) {
    return this;
  }

  if (!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE) {
    return expandNodes(ownerID, nodes, bitmap, keyHashFrag, newNode);
  }

  if (
    exists &&
    !newNode &&
    nodes.length === 2 &&
    isLeafNode(nodes[idx ^ 1])
  ) {
    return nodes[idx ^ 1];
  }

  if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
    return newNode;
  }

  var isEditable = ownerID && ownerID === this.ownerID;
  var newBitmap = exists ? (newNode ? bitmap : bitmap ^ bit) : bitmap | bit;
  var newNodes = exists
    ? newNode
      ? setAt(nodes, idx, newNode, isEditable)
      : spliceOut(nodes, idx, isEditable)
    : spliceIn(nodes, idx, newNode, isEditable);

  if (isEditable) {
    this.bitmap = newBitmap;
    this.nodes = newNodes;
    return this;
  }

  return new BitmapIndexedNode(ownerID, newBitmap, newNodes);
};

var HashArrayMapNode = function HashArrayMapNode(ownerID, count, nodes) {
  this.ownerID = ownerID;
  this.count = count;
  this.nodes = nodes;
};

HashArrayMapNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }
  var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
  var node = this.nodes[idx];
  return node
    ? node.get(shift + SHIFT, keyHash, key, notSetValue)
    : notSetValue;
};

HashArrayMapNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }
  var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
  var removed = value === NOT_SET;
  var nodes = this.nodes;
  var node = nodes[idx];

  if (removed && !node) {
    return this;
  }

  var newNode = updateNode(
    node,
    ownerID,
    shift + SHIFT,
    keyHash,
    key,
    value,
    didChangeSize,
    didAlter
  );
  if (newNode === node) {
    return this;
  }

  var newCount = this.count;
  if (!node) {
    newCount++;
  } else if (!newNode) {
    newCount--;
    if (newCount < MIN_HASH_ARRAY_MAP_SIZE) {
      return packNodes(ownerID, nodes, newCount, idx);
    }
  }

  var isEditable = ownerID && ownerID === this.ownerID;
  var newNodes = setAt(nodes, idx, newNode, isEditable);

  if (isEditable) {
    this.count = newCount;
    this.nodes = newNodes;
    return this;
  }

  return new HashArrayMapNode(ownerID, newCount, newNodes);
};

var HashCollisionNode = function HashCollisionNode(ownerID, keyHash, entries) {
  this.ownerID = ownerID;
  this.keyHash = keyHash;
  this.entries = entries;
};

HashCollisionNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
  var entries = this.entries;
  for (var ii = 0, len = entries.length; ii < len; ii++) {
    if (is(key, entries[ii][0])) {
      return entries[ii][1];
    }
  }
  return notSetValue;
};

HashCollisionNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }

  var removed = value === NOT_SET;

  if (keyHash !== this.keyHash) {
    if (removed) {
      return this;
    }
    SetRef(didAlter);
    SetRef(didChangeSize);
    return mergeIntoNode(this, ownerID, shift, keyHash, [key, value]);
  }

  var entries = this.entries;
  var idx = 0;
  var len = entries.length;
  for (; idx < len; idx++) {
    if (is(key, entries[idx][0])) {
      break;
    }
  }
  var exists = idx < len;

  if (exists ? entries[idx][1] === value : removed) {
    return this;
  }

  SetRef(didAlter);
  (removed || !exists) && SetRef(didChangeSize);

  if (removed && len === 2) {
    return new ValueNode(ownerID, this.keyHash, entries[idx ^ 1]);
  }

  var isEditable = ownerID && ownerID === this.ownerID;
  var newEntries = isEditable ? entries : arrCopy(entries);

  if (exists) {
    if (removed) {
      idx === len - 1
        ? newEntries.pop()
        : (newEntries[idx] = newEntries.pop());
    } else {
      newEntries[idx] = [key, value];
    }
  } else {
    newEntries.push([key, value]);
  }

  if (isEditable) {
    this.entries = newEntries;
    return this;
  }

  return new HashCollisionNode(ownerID, this.keyHash, newEntries);
};

var ValueNode = function ValueNode(ownerID, keyHash, entry) {
  this.ownerID = ownerID;
  this.keyHash = keyHash;
  this.entry = entry;
};

ValueNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
  return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
};

ValueNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
  var removed = value === NOT_SET;
  var keyMatch = is(key, this.entry[0]);
  if (keyMatch ? value === this.entry[1] : removed) {
    return this;
  }

  SetRef(didAlter);

  if (removed) {
    SetRef(didChangeSize);
    return; // undefined
  }

  if (keyMatch) {
    if (ownerID && ownerID === this.ownerID) {
      this.entry[1] = value;
      return this;
    }
    return new ValueNode(ownerID, this.keyHash, [key, value]);
  }

  SetRef(didChangeSize);
  return mergeIntoNode(this, ownerID, shift, hash(key), [key, value]);
};

// #pragma Iterators

ArrayMapNode.prototype.iterate = HashCollisionNode.prototype.iterate =
  function (fn, reverse) {
    var entries = this.entries;
    for (var ii = 0, maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
      if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
        return false;
      }
    }
  };

BitmapIndexedNode.prototype.iterate = HashArrayMapNode.prototype.iterate =
  function (fn, reverse) {
    var nodes = this.nodes;
    for (var ii = 0, maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
      var node = nodes[reverse ? maxIndex - ii : ii];
      if (node && node.iterate(fn, reverse) === false) {
        return false;
      }
    }
  };

// eslint-disable-next-line no-unused-vars
ValueNode.prototype.iterate = function (fn, reverse) {
  return fn(this.entry);
};

var MapIterator = /*@__PURE__*/(function (Iterator) {
  function MapIterator(map, type, reverse) {
    this._type = type;
    this._reverse = reverse;
    this._stack = map._root && mapIteratorFrame(map._root);
  }

  if ( Iterator ) MapIterator.__proto__ = Iterator;
  MapIterator.prototype = Object.create( Iterator && Iterator.prototype );
  MapIterator.prototype.constructor = MapIterator;

  MapIterator.prototype.next = function next () {
    var type = this._type;
    var stack = this._stack;
    while (stack) {
      var node = stack.node;
      var index = stack.index++;
      var maxIndex = (void 0);
      if (node.entry) {
        if (index === 0) {
          return mapIteratorValue(type, node.entry);
        }
      } else if (node.entries) {
        maxIndex = node.entries.length - 1;
        if (index <= maxIndex) {
          return mapIteratorValue(
            type,
            node.entries[this._reverse ? maxIndex - index : index]
          );
        }
      } else {
        maxIndex = node.nodes.length - 1;
        if (index <= maxIndex) {
          var subNode = node.nodes[this._reverse ? maxIndex - index : index];
          if (subNode) {
            if (subNode.entry) {
              return mapIteratorValue(type, subNode.entry);
            }
            stack = this._stack = mapIteratorFrame(subNode, stack);
          }
          continue;
        }
      }
      stack = this._stack = this._stack.__prev;
    }
    return iteratorDone();
  };

  return MapIterator;
}(Iterator));

function mapIteratorValue(type, entry) {
  return iteratorValue(type, entry[0], entry[1]);
}

function mapIteratorFrame(node, prev) {
  return {
    node: node,
    index: 0,
    __prev: prev,
  };
}

function makeMap(size, root, ownerID, hash) {
  var map = Object.create(MapPrototype);
  map.size = size;
  map._root = root;
  map.__ownerID = ownerID;
  map.__hash = hash;
  map.__altered = false;
  return map;
}

var EMPTY_MAP;
function emptyMap() {
  return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
}

function updateMap(map, k, v) {
  var newRoot;
  var newSize;
  if (!map._root) {
    if (v === NOT_SET) {
      return map;
    }
    newSize = 1;
    newRoot = new ArrayMapNode(map.__ownerID, [[k, v]]);
  } else {
    var didChangeSize = MakeRef();
    var didAlter = MakeRef();
    newRoot = updateNode(
      map._root,
      map.__ownerID,
      0,
      undefined,
      k,
      v,
      didChangeSize,
      didAlter
    );
    if (!didAlter.value) {
      return map;
    }
    newSize = map.size + (didChangeSize.value ? (v === NOT_SET ? -1 : 1) : 0);
  }
  if (map.__ownerID) {
    map.size = newSize;
    map._root = newRoot;
    map.__hash = undefined;
    map.__altered = true;
    return map;
  }
  return newRoot ? makeMap(newSize, newRoot) : emptyMap();
}

function updateNode(
  node,
  ownerID,
  shift,
  keyHash,
  key,
  value,
  didChangeSize,
  didAlter
) {
  if (!node) {
    if (value === NOT_SET) {
      return node;
    }
    SetRef(didAlter);
    SetRef(didChangeSize);
    return new ValueNode(ownerID, keyHash, [key, value]);
  }
  return node.update(
    ownerID,
    shift,
    keyHash,
    key,
    value,
    didChangeSize,
    didAlter
  );
}

function isLeafNode(node) {
  return (
    node.constructor === ValueNode || node.constructor === HashCollisionNode
  );
}

function mergeIntoNode(node, ownerID, shift, keyHash, entry) {
  if (node.keyHash === keyHash) {
    return new HashCollisionNode(ownerID, keyHash, [node.entry, entry]);
  }

  var idx1 = (shift === 0 ? node.keyHash : node.keyHash >>> shift) & MASK;
  var idx2 = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;

  var newNode;
  var nodes =
    idx1 === idx2
      ? [mergeIntoNode(node, ownerID, shift + SHIFT, keyHash, entry)]
      : ((newNode = new ValueNode(ownerID, keyHash, entry)),
        idx1 < idx2 ? [node, newNode] : [newNode, node]);

  return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
}

function createNodes(ownerID, entries, key, value) {
  if (!ownerID) {
    ownerID = new OwnerID();
  }
  var node = new ValueNode(ownerID, hash(key), [key, value]);
  for (var ii = 0; ii < entries.length; ii++) {
    var entry = entries[ii];
    node = node.update(ownerID, 0, undefined, entry[0], entry[1]);
  }
  return node;
}

function packNodes(ownerID, nodes, count, excluding) {
  var bitmap = 0;
  var packedII = 0;
  var packedNodes = new Array(count);
  for (var ii = 0, bit = 1, len = nodes.length; ii < len; ii++, bit <<= 1) {
    var node = nodes[ii];
    if (node !== undefined && ii !== excluding) {
      bitmap |= bit;
      packedNodes[packedII++] = node;
    }
  }
  return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
}

function expandNodes(ownerID, nodes, bitmap, including, node) {
  var count = 0;
  var expandedNodes = new Array(SIZE);
  for (var ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
    expandedNodes[ii] = bitmap & 1 ? nodes[count++] : undefined;
  }
  expandedNodes[including] = node;
  return new HashArrayMapNode(ownerID, count + 1, expandedNodes);
}

function popCount(x) {
  x -= (x >> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  x += x >> 8;
  x += x >> 16;
  return x & 0x7f;
}

function setAt(array, idx, val, canEdit) {
  var newArray = canEdit ? array : arrCopy(array);
  newArray[idx] = val;
  return newArray;
}

function spliceIn(array, idx, val, canEdit) {
  var newLen = array.length + 1;
  if (canEdit && idx + 1 === newLen) {
    array[idx] = val;
    return array;
  }
  var newArray = new Array(newLen);
  var after = 0;
  for (var ii = 0; ii < newLen; ii++) {
    if (ii === idx) {
      newArray[ii] = val;
      after = -1;
    } else {
      newArray[ii] = array[ii + after];
    }
  }
  return newArray;
}

function spliceOut(array, idx, canEdit) {
  var newLen = array.length - 1;
  if (canEdit && idx === newLen) {
    array.pop();
    return array;
  }
  var newArray = new Array(newLen);
  var after = 0;
  for (var ii = 0; ii < newLen; ii++) {
    if (ii === idx) {
      after = 1;
    }
    newArray[ii] = array[ii + after];
  }
  return newArray;
}

var MAX_ARRAY_MAP_SIZE = SIZE / 4;
var MAX_BITMAP_INDEXED_SIZE = SIZE / 2;
var MIN_HASH_ARRAY_MAP_SIZE = SIZE / 4;

var IS_LIST_SYMBOL = '@@__IMMUTABLE_LIST__@@';

function isList(maybeList) {
  return Boolean(maybeList && maybeList[IS_LIST_SYMBOL]);
}

var List = /*@__PURE__*/(function (IndexedCollection) {
  function List(value) {
    var empty = emptyList();
    if (value === undefined || value === null) {
      // eslint-disable-next-line no-constructor-return
      return empty;
    }
    if (isList(value)) {
      // eslint-disable-next-line no-constructor-return
      return value;
    }
    var iter = IndexedCollection(value);
    var size = iter.size;
    if (size === 0) {
      // eslint-disable-next-line no-constructor-return
      return empty;
    }
    assertNotInfinite(size);
    if (size > 0 && size < SIZE) {
      // eslint-disable-next-line no-constructor-return
      return makeList(0, size, SHIFT, null, new VNode(iter.toArray()));
    }
    // eslint-disable-next-line no-constructor-return
    return empty.withMutations(function (list) {
      list.setSize(size);
      iter.forEach(function (v, i) { return list.set(i, v); });
    });
  }

  if ( IndexedCollection ) List.__proto__ = IndexedCollection;
  List.prototype = Object.create( IndexedCollection && IndexedCollection.prototype );
  List.prototype.constructor = List;

  List.of = function of (/*...values*/) {
    return this(arguments);
  };

  List.prototype.toString = function toString () {
    return this.__toString('List [', ']');
  };

  // @pragma Access

  List.prototype.get = function get (index, notSetValue) {
    index = wrapIndex(this, index);
    if (index >= 0 && index < this.size) {
      index += this._origin;
      var node = listNodeFor(this, index);
      return node && node.array[index & MASK];
    }
    return notSetValue;
  };

  // @pragma Modification

  List.prototype.set = function set (index, value) {
    return updateList(this, index, value);
  };

  List.prototype.remove = function remove (index) {
    return !this.has(index)
      ? this
      : index === 0
      ? this.shift()
      : index === this.size - 1
      ? this.pop()
      : this.splice(index, 1);
  };

  List.prototype.insert = function insert (index, value) {
    return this.splice(index, 0, value);
  };

  List.prototype.clear = function clear () {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = this._origin = this._capacity = 0;
      this._level = SHIFT;
      this._root = this._tail = this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return emptyList();
  };

  List.prototype.push = function push (/*...values*/) {
    var values = arguments;
    var oldSize = this.size;
    return this.withMutations(function (list) {
      setListBounds(list, 0, oldSize + values.length);
      for (var ii = 0; ii < values.length; ii++) {
        list.set(oldSize + ii, values[ii]);
      }
    });
  };

  List.prototype.pop = function pop () {
    return setListBounds(this, 0, -1);
  };

  List.prototype.unshift = function unshift (/*...values*/) {
    var values = arguments;
    return this.withMutations(function (list) {
      setListBounds(list, -values.length);
      for (var ii = 0; ii < values.length; ii++) {
        list.set(ii, values[ii]);
      }
    });
  };

  List.prototype.shift = function shift () {
    return setListBounds(this, 1);
  };

  // @pragma Composition

  List.prototype.concat = function concat (/*...collections*/) {
    var arguments$1 = arguments;

    var seqs = [];
    for (var i = 0; i < arguments.length; i++) {
      var argument = arguments$1[i];
      var seq = IndexedCollection(
        typeof argument !== 'string' && hasIterator(argument)
          ? argument
          : [argument]
      );
      if (seq.size !== 0) {
        seqs.push(seq);
      }
    }
    if (seqs.length === 0) {
      return this;
    }
    if (this.size === 0 && !this.__ownerID && seqs.length === 1) {
      return this.constructor(seqs[0]);
    }
    return this.withMutations(function (list) {
      seqs.forEach(function (seq) { return seq.forEach(function (value) { return list.push(value); }); });
    });
  };

  List.prototype.setSize = function setSize (size) {
    return setListBounds(this, 0, size);
  };

  List.prototype.map = function map (mapper, context) {
    var this$1$1 = this;

    return this.withMutations(function (list) {
      for (var i = 0; i < this$1$1.size; i++) {
        list.set(i, mapper.call(context, list.get(i), i, this$1$1));
      }
    });
  };

  // @pragma Iteration

  List.prototype.slice = function slice (begin, end) {
    var size = this.size;
    if (wholeSlice(begin, end, size)) {
      return this;
    }
    return setListBounds(
      this,
      resolveBegin(begin, size),
      resolveEnd(end, size)
    );
  };

  List.prototype.__iterator = function __iterator (type, reverse) {
    var index = reverse ? this.size : 0;
    var values = iterateList(this, reverse);
    return new Iterator(function () {
      var value = values();
      return value === DONE
        ? iteratorDone()
        : iteratorValue(type, reverse ? --index : index++, value);
    });
  };

  List.prototype.__iterate = function __iterate (fn, reverse) {
    var index = reverse ? this.size : 0;
    var values = iterateList(this, reverse);
    var value;
    while ((value = values()) !== DONE) {
      if (fn(value, reverse ? --index : index++, this) === false) {
        break;
      }
    }
    return index;
  };

  List.prototype.__ensureOwner = function __ensureOwner (ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      if (this.size === 0) {
        return emptyList();
      }
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeList(
      this._origin,
      this._capacity,
      this._level,
      this._root,
      this._tail,
      ownerID,
      this.__hash
    );
  };

  return List;
}(IndexedCollection));

List.isList = isList;

var ListPrototype = List.prototype;
ListPrototype[IS_LIST_SYMBOL] = true;
ListPrototype[DELETE] = ListPrototype.remove;
ListPrototype.merge = ListPrototype.concat;
ListPrototype.setIn = setIn;
ListPrototype.deleteIn = ListPrototype.removeIn = deleteIn;
ListPrototype.update = update;
ListPrototype.updateIn = updateIn;
ListPrototype.mergeIn = mergeIn;
ListPrototype.mergeDeepIn = mergeDeepIn;
ListPrototype.withMutations = withMutations;
ListPrototype.wasAltered = wasAltered;
ListPrototype.asImmutable = asImmutable;
ListPrototype['@@transducer/init'] = ListPrototype.asMutable = asMutable;
ListPrototype['@@transducer/step'] = function (result, arr) {
  return result.push(arr);
};
ListPrototype['@@transducer/result'] = function (obj) {
  return obj.asImmutable();
};

var VNode = function VNode(array, ownerID) {
  this.array = array;
  this.ownerID = ownerID;
};

// TODO: seems like these methods are very similar

VNode.prototype.removeBefore = function removeBefore (ownerID, level, index) {
  if (index === level ? 1 << level : this.array.length === 0) {
    return this;
  }
  var originIndex = (index >>> level) & MASK;
  if (originIndex >= this.array.length) {
    return new VNode([], ownerID);
  }
  var removingFirst = originIndex === 0;
  var newChild;
  if (level > 0) {
    var oldChild = this.array[originIndex];
    newChild =
      oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
    if (newChild === oldChild && removingFirst) {
      return this;
    }
  }
  if (removingFirst && !newChild) {
    return this;
  }
  var editable = editableVNode(this, ownerID);
  if (!removingFirst) {
    for (var ii = 0; ii < originIndex; ii++) {
      editable.array[ii] = undefined;
    }
  }
  if (newChild) {
    editable.array[originIndex] = newChild;
  }
  return editable;
};

VNode.prototype.removeAfter = function removeAfter (ownerID, level, index) {
  if (index === (level ? 1 << level : 0) || this.array.length === 0) {
    return this;
  }
  var sizeIndex = ((index - 1) >>> level) & MASK;
  if (sizeIndex >= this.array.length) {
    return this;
  }

  var newChild;
  if (level > 0) {
    var oldChild = this.array[sizeIndex];
    newChild =
      oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
    if (newChild === oldChild && sizeIndex === this.array.length - 1) {
      return this;
    }
  }

  var editable = editableVNode(this, ownerID);
  editable.array.splice(sizeIndex + 1);
  if (newChild) {
    editable.array[sizeIndex] = newChild;
  }
  return editable;
};

var DONE = {};

function iterateList(list, reverse) {
  var left = list._origin;
  var right = list._capacity;
  var tailPos = getTailOffset(right);
  var tail = list._tail;

  return iterateNodeOrLeaf(list._root, list._level, 0);

  function iterateNodeOrLeaf(node, level, offset) {
    return level === 0
      ? iterateLeaf(node, offset)
      : iterateNode(node, level, offset);
  }

  function iterateLeaf(node, offset) {
    var array = offset === tailPos ? tail && tail.array : node && node.array;
    var from = offset > left ? 0 : left - offset;
    var to = right - offset;
    if (to > SIZE) {
      to = SIZE;
    }
    return function () {
      if (from === to) {
        return DONE;
      }
      var idx = reverse ? --to : from++;
      return array && array[idx];
    };
  }

  function iterateNode(node, level, offset) {
    var values;
    var array = node && node.array;
    var from = offset > left ? 0 : (left - offset) >> level;
    var to = ((right - offset) >> level) + 1;
    if (to > SIZE) {
      to = SIZE;
    }
    return function () {
      while (true) {
        if (values) {
          var value = values();
          if (value !== DONE) {
            return value;
          }
          values = null;
        }
        if (from === to) {
          return DONE;
        }
        var idx = reverse ? --to : from++;
        values = iterateNodeOrLeaf(
          array && array[idx],
          level - SHIFT,
          offset + (idx << level)
        );
      }
    };
  }
}

function makeList(origin, capacity, level, root, tail, ownerID, hash) {
  var list = Object.create(ListPrototype);
  list.size = capacity - origin;
  list._origin = origin;
  list._capacity = capacity;
  list._level = level;
  list._root = root;
  list._tail = tail;
  list.__ownerID = ownerID;
  list.__hash = hash;
  list.__altered = false;
  return list;
}

var EMPTY_LIST;
function emptyList() {
  return EMPTY_LIST || (EMPTY_LIST = makeList(0, 0, SHIFT));
}

function updateList(list, index, value) {
  index = wrapIndex(list, index);

  if (index !== index) {
    return list;
  }

  if (index >= list.size || index < 0) {
    return list.withMutations(function (list) {
      index < 0
        ? setListBounds(list, index).set(0, value)
        : setListBounds(list, 0, index + 1).set(index, value);
    });
  }

  index += list._origin;

  var newTail = list._tail;
  var newRoot = list._root;
  var didAlter = MakeRef();
  if (index >= getTailOffset(list._capacity)) {
    newTail = updateVNode(newTail, list.__ownerID, 0, index, value, didAlter);
  } else {
    newRoot = updateVNode(
      newRoot,
      list.__ownerID,
      list._level,
      index,
      value,
      didAlter
    );
  }

  if (!didAlter.value) {
    return list;
  }

  if (list.__ownerID) {
    list._root = newRoot;
    list._tail = newTail;
    list.__hash = undefined;
    list.__altered = true;
    return list;
  }
  return makeList(list._origin, list._capacity, list._level, newRoot, newTail);
}

function updateVNode(node, ownerID, level, index, value, didAlter) {
  var idx = (index >>> level) & MASK;
  var nodeHas = node && idx < node.array.length;
  if (!nodeHas && value === undefined) {
    return node;
  }

  var newNode;

  if (level > 0) {
    var lowerNode = node && node.array[idx];
    var newLowerNode = updateVNode(
      lowerNode,
      ownerID,
      level - SHIFT,
      index,
      value,
      didAlter
    );
    if (newLowerNode === lowerNode) {
      return node;
    }
    newNode = editableVNode(node, ownerID);
    newNode.array[idx] = newLowerNode;
    return newNode;
  }

  if (nodeHas && node.array[idx] === value) {
    return node;
  }

  if (didAlter) {
    SetRef(didAlter);
  }

  newNode = editableVNode(node, ownerID);
  if (value === undefined && idx === newNode.array.length - 1) {
    newNode.array.pop();
  } else {
    newNode.array[idx] = value;
  }
  return newNode;
}

function editableVNode(node, ownerID) {
  if (ownerID && node && ownerID === node.ownerID) {
    return node;
  }
  return new VNode(node ? node.array.slice() : [], ownerID);
}

function listNodeFor(list, rawIndex) {
  if (rawIndex >= getTailOffset(list._capacity)) {
    return list._tail;
  }
  if (rawIndex < 1 << (list._level + SHIFT)) {
    var node = list._root;
    var level = list._level;
    while (node && level > 0) {
      node = node.array[(rawIndex >>> level) & MASK];
      level -= SHIFT;
    }
    return node;
  }
}

function setListBounds(list, begin, end) {
  // Sanitize begin & end using this shorthand for ToInt32(argument)
  // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
  if (begin !== undefined) {
    begin |= 0;
  }
  if (end !== undefined) {
    end |= 0;
  }
  var owner = list.__ownerID || new OwnerID();
  var oldOrigin = list._origin;
  var oldCapacity = list._capacity;
  var newOrigin = oldOrigin + begin;
  var newCapacity =
    end === undefined
      ? oldCapacity
      : end < 0
      ? oldCapacity + end
      : oldOrigin + end;
  if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
    return list;
  }

  // If it's going to end after it starts, it's empty.
  if (newOrigin >= newCapacity) {
    return list.clear();
  }

  var newLevel = list._level;
  var newRoot = list._root;

  // New origin might need creating a higher root.
  var offsetShift = 0;
  while (newOrigin + offsetShift < 0) {
    newRoot = new VNode(
      newRoot && newRoot.array.length ? [undefined, newRoot] : [],
      owner
    );
    newLevel += SHIFT;
    offsetShift += 1 << newLevel;
  }
  if (offsetShift) {
    newOrigin += offsetShift;
    oldOrigin += offsetShift;
    newCapacity += offsetShift;
    oldCapacity += offsetShift;
  }

  var oldTailOffset = getTailOffset(oldCapacity);
  var newTailOffset = getTailOffset(newCapacity);

  // New size might need creating a higher root.
  while (newTailOffset >= 1 << (newLevel + SHIFT)) {
    newRoot = new VNode(
      newRoot && newRoot.array.length ? [newRoot] : [],
      owner
    );
    newLevel += SHIFT;
  }

  // Locate or create the new tail.
  var oldTail = list._tail;
  var newTail =
    newTailOffset < oldTailOffset
      ? listNodeFor(list, newCapacity - 1)
      : newTailOffset > oldTailOffset
      ? new VNode([], owner)
      : oldTail;

  // Merge Tail into tree.
  if (
    oldTail &&
    newTailOffset > oldTailOffset &&
    newOrigin < oldCapacity &&
    oldTail.array.length
  ) {
    newRoot = editableVNode(newRoot, owner);
    var node = newRoot;
    for (var level = newLevel; level > SHIFT; level -= SHIFT) {
      var idx = (oldTailOffset >>> level) & MASK;
      node = node.array[idx] = editableVNode(node.array[idx], owner);
    }
    node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
  }

  // If the size has been reduced, there's a chance the tail needs to be trimmed.
  if (newCapacity < oldCapacity) {
    newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);
  }

  // If the new origin is within the tail, then we do not need a root.
  if (newOrigin >= newTailOffset) {
    newOrigin -= newTailOffset;
    newCapacity -= newTailOffset;
    newLevel = SHIFT;
    newRoot = null;
    newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);

    // Otherwise, if the root has been trimmed, garbage collect.
  } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
    offsetShift = 0;

    // Identify the new top root node of the subtree of the old root.
    while (newRoot) {
      var beginIndex = (newOrigin >>> newLevel) & MASK;
      if ((beginIndex !== newTailOffset >>> newLevel) & MASK) {
        break;
      }
      if (beginIndex) {
        offsetShift += (1 << newLevel) * beginIndex;
      }
      newLevel -= SHIFT;
      newRoot = newRoot.array[beginIndex];
    }

    // Trim the new sides of the new root.
    if (newRoot && newOrigin > oldOrigin) {
      newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
    }
    if (newRoot && newTailOffset < oldTailOffset) {
      newRoot = newRoot.removeAfter(
        owner,
        newLevel,
        newTailOffset - offsetShift
      );
    }
    if (offsetShift) {
      newOrigin -= offsetShift;
      newCapacity -= offsetShift;
    }
  }

  if (list.__ownerID) {
    list.size = newCapacity - newOrigin;
    list._origin = newOrigin;
    list._capacity = newCapacity;
    list._level = newLevel;
    list._root = newRoot;
    list._tail = newTail;
    list.__hash = undefined;
    list.__altered = true;
    return list;
  }
  return makeList(newOrigin, newCapacity, newLevel, newRoot, newTail);
}

function getTailOffset(size) {
  return size < SIZE ? 0 : ((size - 1) >>> SHIFT) << SHIFT;
}

var OrderedMap = /*@__PURE__*/(function (Map) {
  function OrderedMap(value) {
    // eslint-disable-next-line no-constructor-return
    return value === undefined || value === null
      ? emptyOrderedMap()
      : isOrderedMap(value)
      ? value
      : emptyOrderedMap().withMutations(function (map) {
          var iter = KeyedCollection(value);
          assertNotInfinite(iter.size);
          iter.forEach(function (v, k) { return map.set(k, v); });
        });
  }

  if ( Map ) OrderedMap.__proto__ = Map;
  OrderedMap.prototype = Object.create( Map && Map.prototype );
  OrderedMap.prototype.constructor = OrderedMap;

  OrderedMap.of = function of (/*...values*/) {
    return this(arguments);
  };

  OrderedMap.prototype.toString = function toString () {
    return this.__toString('OrderedMap {', '}');
  };

  // @pragma Access

  OrderedMap.prototype.get = function get (k, notSetValue) {
    var index = this._map.get(k);
    return index !== undefined ? this._list.get(index)[1] : notSetValue;
  };

  // @pragma Modification

  OrderedMap.prototype.clear = function clear () {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = 0;
      this._map.clear();
      this._list.clear();
      this.__altered = true;
      return this;
    }
    return emptyOrderedMap();
  };

  OrderedMap.prototype.set = function set (k, v) {
    return updateOrderedMap(this, k, v);
  };

  OrderedMap.prototype.remove = function remove (k) {
    return updateOrderedMap(this, k, NOT_SET);
  };

  OrderedMap.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    return this._list.__iterate(
      function (entry) { return entry && fn(entry[1], entry[0], this$1$1); },
      reverse
    );
  };

  OrderedMap.prototype.__iterator = function __iterator (type, reverse) {
    return this._list.fromEntrySeq().__iterator(type, reverse);
  };

  OrderedMap.prototype.__ensureOwner = function __ensureOwner (ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map.__ensureOwner(ownerID);
    var newList = this._list.__ensureOwner(ownerID);
    if (!ownerID) {
      if (this.size === 0) {
        return emptyOrderedMap();
      }
      this.__ownerID = ownerID;
      this.__altered = false;
      this._map = newMap;
      this._list = newList;
      return this;
    }
    return makeOrderedMap(newMap, newList, ownerID, this.__hash);
  };

  return OrderedMap;
}(Map));

OrderedMap.isOrderedMap = isOrderedMap;

OrderedMap.prototype[IS_ORDERED_SYMBOL] = true;
OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;

function makeOrderedMap(map, list, ownerID, hash) {
  var omap = Object.create(OrderedMap.prototype);
  omap.size = map ? map.size : 0;
  omap._map = map;
  omap._list = list;
  omap.__ownerID = ownerID;
  omap.__hash = hash;
  omap.__altered = false;
  return omap;
}

var EMPTY_ORDERED_MAP;
function emptyOrderedMap() {
  return (
    EMPTY_ORDERED_MAP ||
    (EMPTY_ORDERED_MAP = makeOrderedMap(emptyMap(), emptyList()))
  );
}

function updateOrderedMap(omap, k, v) {
  var map = omap._map;
  var list = omap._list;
  var i = map.get(k);
  var has = i !== undefined;
  var newMap;
  var newList;
  if (v === NOT_SET) {
    // removed
    if (!has) {
      return omap;
    }
    if (list.size >= SIZE && list.size >= map.size * 2) {
      newList = list.filter(function (entry, idx) { return entry !== undefined && i !== idx; });
      newMap = newList
        .toKeyedSeq()
        .map(function (entry) { return entry[0]; })
        .flip()
        .toMap();
      if (omap.__ownerID) {
        newMap.__ownerID = newList.__ownerID = omap.__ownerID;
      }
    } else {
      newMap = map.remove(k);
      newList = i === list.size - 1 ? list.pop() : list.set(i, undefined);
    }
  } else if (has) {
    if (v === list.get(i)[1]) {
      return omap;
    }
    newMap = map;
    newList = list.set(i, [k, v]);
  } else {
    newMap = map.set(k, list.size);
    newList = list.set(list.size, [k, v]);
  }
  if (omap.__ownerID) {
    omap.size = newMap.size;
    omap._map = newMap;
    omap._list = newList;
    omap.__hash = undefined;
    omap.__altered = true;
    return omap;
  }
  return makeOrderedMap(newMap, newList);
}

var IS_STACK_SYMBOL = '@@__IMMUTABLE_STACK__@@';

function isStack(maybeStack) {
  return Boolean(maybeStack && maybeStack[IS_STACK_SYMBOL]);
}

var Stack = /*@__PURE__*/(function (IndexedCollection) {
  function Stack(value) {
    // eslint-disable-next-line no-constructor-return
    return value === undefined || value === null
      ? emptyStack()
      : isStack(value)
      ? value
      : emptyStack().pushAll(value);
  }

  if ( IndexedCollection ) Stack.__proto__ = IndexedCollection;
  Stack.prototype = Object.create( IndexedCollection && IndexedCollection.prototype );
  Stack.prototype.constructor = Stack;

  Stack.of = function of (/*...values*/) {
    return this(arguments);
  };

  Stack.prototype.toString = function toString () {
    return this.__toString('Stack [', ']');
  };

  // @pragma Access

  Stack.prototype.get = function get (index, notSetValue) {
    var head = this._head;
    index = wrapIndex(this, index);
    while (head && index--) {
      head = head.next;
    }
    return head ? head.value : notSetValue;
  };

  Stack.prototype.peek = function peek () {
    return this._head && this._head.value;
  };

  // @pragma Modification

  Stack.prototype.push = function push (/*...values*/) {
    var arguments$1 = arguments;

    if (arguments.length === 0) {
      return this;
    }
    var newSize = this.size + arguments.length;
    var head = this._head;
    for (var ii = arguments.length - 1; ii >= 0; ii--) {
      head = {
        value: arguments$1[ii],
        next: head,
      };
    }
    if (this.__ownerID) {
      this.size = newSize;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newSize, head);
  };

  Stack.prototype.pushAll = function pushAll (iter) {
    iter = IndexedCollection(iter);
    if (iter.size === 0) {
      return this;
    }
    if (this.size === 0 && isStack(iter)) {
      return iter;
    }
    assertNotInfinite(iter.size);
    var newSize = this.size;
    var head = this._head;
    iter.__iterate(function (value) {
      newSize++;
      head = {
        value: value,
        next: head,
      };
    }, /* reverse */ true);
    if (this.__ownerID) {
      this.size = newSize;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newSize, head);
  };

  Stack.prototype.pop = function pop () {
    return this.slice(1);
  };

  Stack.prototype.clear = function clear () {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = 0;
      this._head = undefined;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return emptyStack();
  };

  Stack.prototype.slice = function slice (begin, end) {
    if (wholeSlice(begin, end, this.size)) {
      return this;
    }
    var resolvedBegin = resolveBegin(begin, this.size);
    var resolvedEnd = resolveEnd(end, this.size);
    if (resolvedEnd !== this.size) {
      // super.slice(begin, end);
      return IndexedCollection.prototype.slice.call(this, begin, end);
    }
    var newSize = this.size - resolvedBegin;
    var head = this._head;
    while (resolvedBegin--) {
      head = head.next;
    }
    if (this.__ownerID) {
      this.size = newSize;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newSize, head);
  };

  // @pragma Mutability

  Stack.prototype.__ensureOwner = function __ensureOwner (ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      if (this.size === 0) {
        return emptyStack();
      }
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeStack(this.size, this._head, ownerID, this.__hash);
  };

  // @pragma Iteration

  Stack.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    if (reverse) {
      return new ArraySeq(this.toArray()).__iterate(
        function (v, k) { return fn(v, k, this$1$1); },
        reverse
      );
    }
    var iterations = 0;
    var node = this._head;
    while (node) {
      if (fn(node.value, iterations++, this) === false) {
        break;
      }
      node = node.next;
    }
    return iterations;
  };

  Stack.prototype.__iterator = function __iterator (type, reverse) {
    if (reverse) {
      return new ArraySeq(this.toArray()).__iterator(type, reverse);
    }
    var iterations = 0;
    var node = this._head;
    return new Iterator(function () {
      if (node) {
        var value = node.value;
        node = node.next;
        return iteratorValue(type, iterations++, value);
      }
      return iteratorDone();
    });
  };

  return Stack;
}(IndexedCollection));

Stack.isStack = isStack;

var StackPrototype = Stack.prototype;
StackPrototype[IS_STACK_SYMBOL] = true;
StackPrototype.shift = StackPrototype.pop;
StackPrototype.unshift = StackPrototype.push;
StackPrototype.unshiftAll = StackPrototype.pushAll;
StackPrototype.withMutations = withMutations;
StackPrototype.wasAltered = wasAltered;
StackPrototype.asImmutable = asImmutable;
StackPrototype['@@transducer/init'] = StackPrototype.asMutable = asMutable;
StackPrototype['@@transducer/step'] = function (result, arr) {
  return result.unshift(arr);
};
StackPrototype['@@transducer/result'] = function (obj) {
  return obj.asImmutable();
};

function makeStack(size, head, ownerID, hash) {
  var map = Object.create(StackPrototype);
  map.size = size;
  map._head = head;
  map.__ownerID = ownerID;
  map.__hash = hash;
  map.__altered = false;
  return map;
}

var EMPTY_STACK;
function emptyStack() {
  return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
}

var IS_SET_SYMBOL = '@@__IMMUTABLE_SET__@@';

function isSet(maybeSet) {
  return Boolean(maybeSet && maybeSet[IS_SET_SYMBOL]);
}

function isOrderedSet(maybeOrderedSet) {
  return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
}

function deepEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (
    !isCollection(b) ||
    (a.size !== undefined && b.size !== undefined && a.size !== b.size) ||
    (a.__hash !== undefined &&
      b.__hash !== undefined &&
      a.__hash !== b.__hash) ||
    isKeyed(a) !== isKeyed(b) ||
    isIndexed(a) !== isIndexed(b) ||
    isOrdered(a) !== isOrdered(b)
  ) {
    return false;
  }

  if (a.size === 0 && b.size === 0) {
    return true;
  }

  var notAssociative = !isAssociative(a);

  if (isOrdered(a)) {
    var entries = a.entries();
    return (
      b.every(function (v, k) {
        var entry = entries.next().value;
        return entry && is(entry[1], v) && (notAssociative || is(entry[0], k));
      }) && entries.next().done
    );
  }

  var flipped = false;

  if (a.size === undefined) {
    if (b.size === undefined) {
      if (typeof a.cacheResult === 'function') {
        a.cacheResult();
      }
    } else {
      flipped = true;
      var _ = a;
      a = b;
      b = _;
    }
  }

  var allEqual = true;
  var bSize = b.__iterate(function (v, k) {
    if (
      notAssociative
        ? !a.has(v)
        : flipped
        ? !is(v, a.get(k, NOT_SET))
        : !is(a.get(k, NOT_SET), v)
    ) {
      allEqual = false;
      return false;
    }
  });

  return allEqual && a.size === bSize;
}

function mixin(ctor, methods) {
  var keyCopier = function (key) {
    ctor.prototype[key] = methods[key];
  };
  Object.keys(methods).forEach(keyCopier);
  Object.getOwnPropertySymbols &&
    Object.getOwnPropertySymbols(methods).forEach(keyCopier);
  return ctor;
}

function toJS(value) {
  if (!value || typeof value !== 'object') {
    return value;
  }
  if (!isCollection(value)) {
    if (!isDataStructure(value)) {
      return value;
    }
    value = Seq(value);
  }
  if (isKeyed(value)) {
    var result$1 = {};
    value.__iterate(function (v, k) {
      result$1[k] = toJS(v);
    });
    return result$1;
  }
  var result = [];
  value.__iterate(function (v) {
    result.push(toJS(v));
  });
  return result;
}

var Set = /*@__PURE__*/(function (SetCollection) {
  function Set(value) {
    // eslint-disable-next-line no-constructor-return
    return value === undefined || value === null
      ? emptySet()
      : isSet(value) && !isOrdered(value)
      ? value
      : emptySet().withMutations(function (set) {
          var iter = SetCollection(value);
          assertNotInfinite(iter.size);
          iter.forEach(function (v) { return set.add(v); });
        });
  }

  if ( SetCollection ) Set.__proto__ = SetCollection;
  Set.prototype = Object.create( SetCollection && SetCollection.prototype );
  Set.prototype.constructor = Set;

  Set.of = function of (/*...values*/) {
    return this(arguments);
  };

  Set.fromKeys = function fromKeys (value) {
    return this(KeyedCollection(value).keySeq());
  };

  Set.intersect = function intersect (sets) {
    sets = Collection(sets).toArray();
    return sets.length
      ? SetPrototype.intersect.apply(Set(sets.pop()), sets)
      : emptySet();
  };

  Set.union = function union (sets) {
    sets = Collection(sets).toArray();
    return sets.length
      ? SetPrototype.union.apply(Set(sets.pop()), sets)
      : emptySet();
  };

  Set.prototype.toString = function toString () {
    return this.__toString('Set {', '}');
  };

  // @pragma Access

  Set.prototype.has = function has (value) {
    return this._map.has(value);
  };

  // @pragma Modification

  Set.prototype.add = function add (value) {
    return updateSet(this, this._map.set(value, value));
  };

  Set.prototype.remove = function remove (value) {
    return updateSet(this, this._map.remove(value));
  };

  Set.prototype.clear = function clear () {
    return updateSet(this, this._map.clear());
  };

  // @pragma Composition

  Set.prototype.map = function map (mapper, context) {
    var this$1$1 = this;

    // keep track if the set is altered by the map function
    var didChanges = false;

    var newMap = updateSet(
      this,
      this._map.mapEntries(function (ref) {
        var v = ref[1];

        var mapped = mapper.call(context, v, v, this$1$1);

        if (mapped !== v) {
          didChanges = true;
        }

        return [mapped, mapped];
      }, context)
    );

    return didChanges ? newMap : this;
  };

  Set.prototype.union = function union () {
    var iters = [], len = arguments.length;
    while ( len-- ) iters[ len ] = arguments[ len ];

    iters = iters.filter(function (x) { return x.size !== 0; });
    if (iters.length === 0) {
      return this;
    }
    if (this.size === 0 && !this.__ownerID && iters.length === 1) {
      return this.constructor(iters[0]);
    }
    return this.withMutations(function (set) {
      for (var ii = 0; ii < iters.length; ii++) {
        if (typeof iters[ii] === 'string') {
          set.add(iters[ii]);
        } else {
          SetCollection(iters[ii]).forEach(function (value) { return set.add(value); });
        }
      }
    });
  };

  Set.prototype.intersect = function intersect () {
    var iters = [], len = arguments.length;
    while ( len-- ) iters[ len ] = arguments[ len ];

    if (iters.length === 0) {
      return this;
    }
    iters = iters.map(function (iter) { return SetCollection(iter); });
    var toRemove = [];
    this.forEach(function (value) {
      if (!iters.every(function (iter) { return iter.includes(value); })) {
        toRemove.push(value);
      }
    });
    return this.withMutations(function (set) {
      toRemove.forEach(function (value) {
        set.remove(value);
      });
    });
  };

  Set.prototype.subtract = function subtract () {
    var iters = [], len = arguments.length;
    while ( len-- ) iters[ len ] = arguments[ len ];

    if (iters.length === 0) {
      return this;
    }
    iters = iters.map(function (iter) { return SetCollection(iter); });
    var toRemove = [];
    this.forEach(function (value) {
      if (iters.some(function (iter) { return iter.includes(value); })) {
        toRemove.push(value);
      }
    });
    return this.withMutations(function (set) {
      toRemove.forEach(function (value) {
        set.remove(value);
      });
    });
  };

  Set.prototype.sort = function sort (comparator) {
    // Late binding
    return OrderedSet(sortFactory(this, comparator));
  };

  Set.prototype.sortBy = function sortBy (mapper, comparator) {
    // Late binding
    return OrderedSet(sortFactory(this, comparator, mapper));
  };

  Set.prototype.wasAltered = function wasAltered () {
    return this._map.wasAltered();
  };

  Set.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    return this._map.__iterate(function (k) { return fn(k, k, this$1$1); }, reverse);
  };

  Set.prototype.__iterator = function __iterator (type, reverse) {
    return this._map.__iterator(type, reverse);
  };

  Set.prototype.__ensureOwner = function __ensureOwner (ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map.__ensureOwner(ownerID);
    if (!ownerID) {
      if (this.size === 0) {
        return this.__empty();
      }
      this.__ownerID = ownerID;
      this._map = newMap;
      return this;
    }
    return this.__make(newMap, ownerID);
  };

  return Set;
}(SetCollection));

Set.isSet = isSet;

var SetPrototype = Set.prototype;
SetPrototype[IS_SET_SYMBOL] = true;
SetPrototype[DELETE] = SetPrototype.remove;
SetPrototype.merge = SetPrototype.concat = SetPrototype.union;
SetPrototype.withMutations = withMutations;
SetPrototype.asImmutable = asImmutable;
SetPrototype['@@transducer/init'] = SetPrototype.asMutable = asMutable;
SetPrototype['@@transducer/step'] = function (result, arr) {
  return result.add(arr);
};
SetPrototype['@@transducer/result'] = function (obj) {
  return obj.asImmutable();
};

SetPrototype.__empty = emptySet;
SetPrototype.__make = makeSet;

function updateSet(set, newMap) {
  if (set.__ownerID) {
    set.size = newMap.size;
    set._map = newMap;
    return set;
  }
  return newMap === set._map
    ? set
    : newMap.size === 0
    ? set.__empty()
    : set.__make(newMap);
}

function makeSet(map, ownerID) {
  var set = Object.create(SetPrototype);
  set.size = map ? map.size : 0;
  set._map = map;
  set.__ownerID = ownerID;
  return set;
}

var EMPTY_SET;
function emptySet() {
  return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));
}

/**
 * Returns a lazy seq of nums from start (inclusive) to end
 * (exclusive), by step, where start defaults to 0, step to 1, and end to
 * infinity. When start is equal to end, returns empty list.
 */
var Range = /*@__PURE__*/(function (IndexedSeq) {
  function Range(start, end, step) {
    if (!(this instanceof Range)) {
      // eslint-disable-next-line no-constructor-return
      return new Range(start, end, step);
    }
    invariant(step !== 0, 'Cannot step a Range by 0');
    start = start || 0;
    if (end === undefined) {
      end = Infinity;
    }
    step = step === undefined ? 1 : Math.abs(step);
    if (end < start) {
      step = -step;
    }
    this._start = start;
    this._end = end;
    this._step = step;
    this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
    if (this.size === 0) {
      if (EMPTY_RANGE) {
        // eslint-disable-next-line no-constructor-return
        return EMPTY_RANGE;
      }
      EMPTY_RANGE = this;
    }
  }

  if ( IndexedSeq ) Range.__proto__ = IndexedSeq;
  Range.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
  Range.prototype.constructor = Range;

  Range.prototype.toString = function toString () {
    if (this.size === 0) {
      return 'Range []';
    }
    return (
      'Range [ ' +
      this._start +
      '...' +
      this._end +
      (this._step !== 1 ? ' by ' + this._step : '') +
      ' ]'
    );
  };

  Range.prototype.get = function get (index, notSetValue) {
    return this.has(index)
      ? this._start + wrapIndex(this, index) * this._step
      : notSetValue;
  };

  Range.prototype.includes = function includes (searchValue) {
    var possibleIndex = (searchValue - this._start) / this._step;
    return (
      possibleIndex >= 0 &&
      possibleIndex < this.size &&
      possibleIndex === Math.floor(possibleIndex)
    );
  };

  Range.prototype.slice = function slice (begin, end) {
    if (wholeSlice(begin, end, this.size)) {
      return this;
    }
    begin = resolveBegin(begin, this.size);
    end = resolveEnd(end, this.size);
    if (end <= begin) {
      return new Range(0, 0);
    }
    return new Range(
      this.get(begin, this._end),
      this.get(end, this._end),
      this._step
    );
  };

  Range.prototype.indexOf = function indexOf (searchValue) {
    var offsetValue = searchValue - this._start;
    if (offsetValue % this._step === 0) {
      var index = offsetValue / this._step;
      if (index >= 0 && index < this.size) {
        return index;
      }
    }
    return -1;
  };

  Range.prototype.lastIndexOf = function lastIndexOf (searchValue) {
    return this.indexOf(searchValue);
  };

  Range.prototype.__iterate = function __iterate (fn, reverse) {
    var size = this.size;
    var step = this._step;
    var value = reverse ? this._start + (size - 1) * step : this._start;
    var i = 0;
    while (i !== size) {
      if (fn(value, reverse ? size - ++i : i++, this) === false) {
        break;
      }
      value += reverse ? -step : step;
    }
    return i;
  };

  Range.prototype.__iterator = function __iterator (type, reverse) {
    var size = this.size;
    var step = this._step;
    var value = reverse ? this._start + (size - 1) * step : this._start;
    var i = 0;
    return new Iterator(function () {
      if (i === size) {
        return iteratorDone();
      }
      var v = value;
      value += reverse ? -step : step;
      return iteratorValue(type, reverse ? size - ++i : i++, v);
    });
  };

  Range.prototype.equals = function equals (other) {
    return other instanceof Range
      ? this._start === other._start &&
          this._end === other._end &&
          this._step === other._step
      : deepEqual(this, other);
  };

  return Range;
}(IndexedSeq));

var EMPTY_RANGE;

function getIn$1(collection, searchKeyPath, notSetValue) {
  var keyPath = coerceKeyPath(searchKeyPath);
  var i = 0;
  while (i !== keyPath.length) {
    collection = get(collection, keyPath[i++], NOT_SET);
    if (collection === NOT_SET) {
      return notSetValue;
    }
  }
  return collection;
}

function getIn(searchKeyPath, notSetValue) {
  return getIn$1(this, searchKeyPath, notSetValue);
}

function hasIn$1(collection, keyPath) {
  return getIn$1(collection, keyPath, NOT_SET) !== NOT_SET;
}

function hasIn(searchKeyPath) {
  return hasIn$1(this, searchKeyPath);
}

function toObject() {
  assertNotInfinite(this.size);
  var object = {};
  this.__iterate(function (v, k) {
    object[k] = v;
  });
  return object;
}

// Note: all of these methods are deprecated.
Collection.isIterable = isCollection;
Collection.isKeyed = isKeyed;
Collection.isIndexed = isIndexed;
Collection.isAssociative = isAssociative;
Collection.isOrdered = isOrdered;

Collection.Iterator = Iterator;

mixin(Collection, {
  // ### Conversion to other types

  toArray: function toArray() {
    assertNotInfinite(this.size);
    var array = new Array(this.size || 0);
    var useTuples = isKeyed(this);
    var i = 0;
    this.__iterate(function (v, k) {
      // Keyed collections produce an array of tuples.
      array[i++] = useTuples ? [k, v] : v;
    });
    return array;
  },

  toIndexedSeq: function toIndexedSeq() {
    return new ToIndexedSequence(this);
  },

  toJS: function toJS$1() {
    return toJS(this);
  },

  toKeyedSeq: function toKeyedSeq() {
    return new ToKeyedSequence(this, true);
  },

  toMap: function toMap() {
    // Use Late Binding here to solve the circular dependency.
    return Map(this.toKeyedSeq());
  },

  toObject: toObject,

  toOrderedMap: function toOrderedMap() {
    // Use Late Binding here to solve the circular dependency.
    return OrderedMap(this.toKeyedSeq());
  },

  toOrderedSet: function toOrderedSet() {
    // Use Late Binding here to solve the circular dependency.
    return OrderedSet(isKeyed(this) ? this.valueSeq() : this);
  },

  toSet: function toSet() {
    // Use Late Binding here to solve the circular dependency.
    return Set(isKeyed(this) ? this.valueSeq() : this);
  },

  toSetSeq: function toSetSeq() {
    return new ToSetSequence(this);
  },

  toSeq: function toSeq() {
    return isIndexed(this)
      ? this.toIndexedSeq()
      : isKeyed(this)
      ? this.toKeyedSeq()
      : this.toSetSeq();
  },

  toStack: function toStack() {
    // Use Late Binding here to solve the circular dependency.
    return Stack(isKeyed(this) ? this.valueSeq() : this);
  },

  toList: function toList() {
    // Use Late Binding here to solve the circular dependency.
    return List(isKeyed(this) ? this.valueSeq() : this);
  },

  // ### Common JavaScript methods and properties

  toString: function toString() {
    return '[Collection]';
  },

  __toString: function __toString(head, tail) {
    if (this.size === 0) {
      return head + tail;
    }
    return (
      head +
      ' ' +
      this.toSeq().map(this.__toStringMapper).join(', ') +
      ' ' +
      tail
    );
  },

  // ### ES6 Collection methods (ES6 Array and Map)

  concat: function concat() {
    var values = [], len = arguments.length;
    while ( len-- ) values[ len ] = arguments[ len ];

    return reify(this, concatFactory(this, values));
  },

  includes: function includes(searchValue) {
    return this.some(function (value) { return is(value, searchValue); });
  },

  entries: function entries() {
    return this.__iterator(ITERATE_ENTRIES);
  },

  every: function every(predicate, context) {
    assertNotInfinite(this.size);
    var returnValue = true;
    this.__iterate(function (v, k, c) {
      if (!predicate.call(context, v, k, c)) {
        returnValue = false;
        return false;
      }
    });
    return returnValue;
  },

  filter: function filter(predicate, context) {
    return reify(this, filterFactory(this, predicate, context, true));
  },

  partition: function partition(predicate, context) {
    return partitionFactory(this, predicate, context);
  },

  find: function find(predicate, context, notSetValue) {
    var entry = this.findEntry(predicate, context);
    return entry ? entry[1] : notSetValue;
  },

  forEach: function forEach(sideEffect, context) {
    assertNotInfinite(this.size);
    return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
  },

  join: function join(separator) {
    assertNotInfinite(this.size);
    separator = separator !== undefined ? '' + separator : ',';
    var joined = '';
    var isFirst = true;
    this.__iterate(function (v) {
      isFirst ? (isFirst = false) : (joined += separator);
      joined += v !== null && v !== undefined ? v.toString() : '';
    });
    return joined;
  },

  keys: function keys() {
    return this.__iterator(ITERATE_KEYS);
  },

  map: function map(mapper, context) {
    return reify(this, mapFactory(this, mapper, context));
  },

  reduce: function reduce$1(reducer, initialReduction, context) {
    return reduce(
      this,
      reducer,
      initialReduction,
      context,
      arguments.length < 2,
      false
    );
  },

  reduceRight: function reduceRight(reducer, initialReduction, context) {
    return reduce(
      this,
      reducer,
      initialReduction,
      context,
      arguments.length < 2,
      true
    );
  },

  reverse: function reverse() {
    return reify(this, reverseFactory(this, true));
  },

  slice: function slice(begin, end) {
    return reify(this, sliceFactory(this, begin, end, true));
  },

  some: function some(predicate, context) {
    assertNotInfinite(this.size);
    var returnValue = false;
    this.__iterate(function (v, k, c) {
      if (predicate.call(context, v, k, c)) {
        returnValue = true;
        return false;
      }
    });
    return returnValue;
  },

  sort: function sort(comparator) {
    return reify(this, sortFactory(this, comparator));
  },

  values: function values() {
    return this.__iterator(ITERATE_VALUES);
  },

  // ### More sequential methods

  butLast: function butLast() {
    return this.slice(0, -1);
  },

  isEmpty: function isEmpty() {
    return this.size !== undefined ? this.size === 0 : !this.some(function () { return true; });
  },

  count: function count(predicate, context) {
    return ensureSize(
      predicate ? this.toSeq().filter(predicate, context) : this
    );
  },

  countBy: function countBy(grouper, context) {
    return countByFactory(this, grouper, context);
  },

  equals: function equals(other) {
    return deepEqual(this, other);
  },

  entrySeq: function entrySeq() {
    var collection = this;
    if (collection._cache) {
      // We cache as an entries array, so we can just return the cache!
      return new ArraySeq(collection._cache);
    }
    var entriesSequence = collection.toSeq().map(entryMapper).toIndexedSeq();
    entriesSequence.fromEntrySeq = function () { return collection.toSeq(); };
    return entriesSequence;
  },

  filterNot: function filterNot(predicate, context) {
    return this.filter(not(predicate), context);
  },

  findEntry: function findEntry(predicate, context, notSetValue) {
    var found = notSetValue;
    this.__iterate(function (v, k, c) {
      if (predicate.call(context, v, k, c)) {
        found = [k, v];
        return false;
      }
    });
    return found;
  },

  findKey: function findKey(predicate, context) {
    var entry = this.findEntry(predicate, context);
    return entry && entry[0];
  },

  findLast: function findLast(predicate, context, notSetValue) {
    return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
  },

  findLastEntry: function findLastEntry(predicate, context, notSetValue) {
    return this.toKeyedSeq()
      .reverse()
      .findEntry(predicate, context, notSetValue);
  },

  findLastKey: function findLastKey(predicate, context) {
    return this.toKeyedSeq().reverse().findKey(predicate, context);
  },

  first: function first(notSetValue) {
    return this.find(returnTrue, null, notSetValue);
  },

  flatMap: function flatMap(mapper, context) {
    return reify(this, flatMapFactory(this, mapper, context));
  },

  flatten: function flatten(depth) {
    return reify(this, flattenFactory(this, depth, true));
  },

  fromEntrySeq: function fromEntrySeq() {
    return new FromEntriesSequence(this);
  },

  get: function get(searchKey, notSetValue) {
    return this.find(function (_, key) { return is(key, searchKey); }, undefined, notSetValue);
  },

  getIn: getIn,

  groupBy: function groupBy(grouper, context) {
    return groupByFactory(this, grouper, context);
  },

  has: function has(searchKey) {
    return this.get(searchKey, NOT_SET) !== NOT_SET;
  },

  hasIn: hasIn,

  isSubset: function isSubset(iter) {
    iter = typeof iter.includes === 'function' ? iter : Collection(iter);
    return this.every(function (value) { return iter.includes(value); });
  },

  isSuperset: function isSuperset(iter) {
    iter = typeof iter.isSubset === 'function' ? iter : Collection(iter);
    return iter.isSubset(this);
  },

  keyOf: function keyOf(searchValue) {
    return this.findKey(function (value) { return is(value, searchValue); });
  },

  keySeq: function keySeq() {
    return this.toSeq().map(keyMapper).toIndexedSeq();
  },

  last: function last(notSetValue) {
    return this.toSeq().reverse().first(notSetValue);
  },

  lastKeyOf: function lastKeyOf(searchValue) {
    return this.toKeyedSeq().reverse().keyOf(searchValue);
  },

  max: function max(comparator) {
    return maxFactory(this, comparator);
  },

  maxBy: function maxBy(mapper, comparator) {
    return maxFactory(this, comparator, mapper);
  },

  min: function min(comparator) {
    return maxFactory(
      this,
      comparator ? neg(comparator) : defaultNegComparator
    );
  },

  minBy: function minBy(mapper, comparator) {
    return maxFactory(
      this,
      comparator ? neg(comparator) : defaultNegComparator,
      mapper
    );
  },

  rest: function rest() {
    return this.slice(1);
  },

  skip: function skip(amount) {
    return amount === 0 ? this : this.slice(Math.max(0, amount));
  },

  skipLast: function skipLast(amount) {
    return amount === 0 ? this : this.slice(0, -Math.max(0, amount));
  },

  skipWhile: function skipWhile(predicate, context) {
    return reify(this, skipWhileFactory(this, predicate, context, true));
  },

  skipUntil: function skipUntil(predicate, context) {
    return this.skipWhile(not(predicate), context);
  },

  sortBy: function sortBy(mapper, comparator) {
    return reify(this, sortFactory(this, comparator, mapper));
  },

  take: function take(amount) {
    return this.slice(0, Math.max(0, amount));
  },

  takeLast: function takeLast(amount) {
    return this.slice(-Math.max(0, amount));
  },

  takeWhile: function takeWhile(predicate, context) {
    return reify(this, takeWhileFactory(this, predicate, context));
  },

  takeUntil: function takeUntil(predicate, context) {
    return this.takeWhile(not(predicate), context);
  },

  update: function update(fn) {
    return fn(this);
  },

  valueSeq: function valueSeq() {
    return this.toIndexedSeq();
  },

  // ### Hashable Object

  hashCode: function hashCode() {
    return this.__hash || (this.__hash = hashCollection(this));
  },

  // ### Internal

  // abstract __iterate(fn, reverse)

  // abstract __iterator(type, reverse)
});

var CollectionPrototype = Collection.prototype;
CollectionPrototype[IS_COLLECTION_SYMBOL] = true;
CollectionPrototype[ITERATOR_SYMBOL] = CollectionPrototype.values;
CollectionPrototype.toJSON = CollectionPrototype.toArray;
CollectionPrototype.__toStringMapper = quoteString;
CollectionPrototype.inspect = CollectionPrototype.toSource = function () {
  return this.toString();
};
CollectionPrototype.chain = CollectionPrototype.flatMap;
CollectionPrototype.contains = CollectionPrototype.includes;

mixin(KeyedCollection, {
  // ### More sequential methods

  flip: function flip() {
    return reify(this, flipFactory(this));
  },

  mapEntries: function mapEntries(mapper, context) {
    var this$1$1 = this;

    var iterations = 0;
    return reify(
      this,
      this.toSeq()
        .map(function (v, k) { return mapper.call(context, [k, v], iterations++, this$1$1); })
        .fromEntrySeq()
    );
  },

  mapKeys: function mapKeys(mapper, context) {
    var this$1$1 = this;

    return reify(
      this,
      this.toSeq()
        .flip()
        .map(function (k, v) { return mapper.call(context, k, v, this$1$1); })
        .flip()
    );
  },
});

var KeyedCollectionPrototype = KeyedCollection.prototype;
KeyedCollectionPrototype[IS_KEYED_SYMBOL] = true;
KeyedCollectionPrototype[ITERATOR_SYMBOL] = CollectionPrototype.entries;
KeyedCollectionPrototype.toJSON = toObject;
KeyedCollectionPrototype.__toStringMapper = function (v, k) { return quoteString(k) + ': ' + quoteString(v); };

mixin(IndexedCollection, {
  // ### Conversion to other types

  toKeyedSeq: function toKeyedSeq() {
    return new ToKeyedSequence(this, false);
  },

  // ### ES6 Collection methods (ES6 Array and Map)

  filter: function filter(predicate, context) {
    return reify(this, filterFactory(this, predicate, context, false));
  },

  findIndex: function findIndex(predicate, context) {
    var entry = this.findEntry(predicate, context);
    return entry ? entry[0] : -1;
  },

  indexOf: function indexOf(searchValue) {
    var key = this.keyOf(searchValue);
    return key === undefined ? -1 : key;
  },

  lastIndexOf: function lastIndexOf(searchValue) {
    var key = this.lastKeyOf(searchValue);
    return key === undefined ? -1 : key;
  },

  reverse: function reverse() {
    return reify(this, reverseFactory(this, false));
  },

  slice: function slice(begin, end) {
    return reify(this, sliceFactory(this, begin, end, false));
  },

  splice: function splice(index, removeNum /*, ...values*/) {
    var numArgs = arguments.length;
    removeNum = Math.max(removeNum || 0, 0);
    if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
      return this;
    }
    // If index is negative, it should resolve relative to the size of the
    // collection. However size may be expensive to compute if not cached, so
    // only call count() if the number is in fact negative.
    index = resolveBegin(index, index < 0 ? this.count() : this.size);
    var spliced = this.slice(0, index);
    return reify(
      this,
      numArgs === 1
        ? spliced
        : spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum))
    );
  },

  // ### More collection methods

  findLastIndex: function findLastIndex(predicate, context) {
    var entry = this.findLastEntry(predicate, context);
    return entry ? entry[0] : -1;
  },

  first: function first(notSetValue) {
    return this.get(0, notSetValue);
  },

  flatten: function flatten(depth) {
    return reify(this, flattenFactory(this, depth, false));
  },

  get: function get(index, notSetValue) {
    index = wrapIndex(this, index);
    return index < 0 ||
      this.size === Infinity ||
      (this.size !== undefined && index > this.size)
      ? notSetValue
      : this.find(function (_, key) { return key === index; }, undefined, notSetValue);
  },

  has: function has(index) {
    index = wrapIndex(this, index);
    return (
      index >= 0 &&
      (this.size !== undefined
        ? this.size === Infinity || index < this.size
        : this.indexOf(index) !== -1)
    );
  },

  interpose: function interpose(separator) {
    return reify(this, interposeFactory(this, separator));
  },

  interleave: function interleave(/*...collections*/) {
    var collections = [this].concat(arrCopy(arguments));
    var zipped = zipWithFactory(this.toSeq(), IndexedSeq.of, collections);
    var interleaved = zipped.flatten(true);
    if (zipped.size) {
      interleaved.size = zipped.size * collections.length;
    }
    return reify(this, interleaved);
  },

  keySeq: function keySeq() {
    return Range(0, this.size);
  },

  last: function last(notSetValue) {
    return this.get(-1, notSetValue);
  },

  skipWhile: function skipWhile(predicate, context) {
    return reify(this, skipWhileFactory(this, predicate, context, false));
  },

  zip: function zip(/*, ...collections */) {
    var collections = [this].concat(arrCopy(arguments));
    return reify(this, zipWithFactory(this, defaultZipper, collections));
  },

  zipAll: function zipAll(/*, ...collections */) {
    var collections = [this].concat(arrCopy(arguments));
    return reify(this, zipWithFactory(this, defaultZipper, collections, true));
  },

  zipWith: function zipWith(zipper /*, ...collections */) {
    var collections = arrCopy(arguments);
    collections[0] = this;
    return reify(this, zipWithFactory(this, zipper, collections));
  },
});

var IndexedCollectionPrototype = IndexedCollection.prototype;
IndexedCollectionPrototype[IS_INDEXED_SYMBOL] = true;
IndexedCollectionPrototype[IS_ORDERED_SYMBOL] = true;

mixin(SetCollection, {
  // ### ES6 Collection methods (ES6 Array and Map)

  get: function get(value, notSetValue) {
    return this.has(value) ? value : notSetValue;
  },

  includes: function includes(value) {
    return this.has(value);
  },

  // ### More sequential methods

  keySeq: function keySeq() {
    return this.valueSeq();
  },
});

var SetCollectionPrototype = SetCollection.prototype;
SetCollectionPrototype.has = CollectionPrototype.includes;
SetCollectionPrototype.contains = SetCollectionPrototype.includes;
SetCollectionPrototype.keys = SetCollectionPrototype.values;

// Mixin subclasses

mixin(KeyedSeq, KeyedCollectionPrototype);
mixin(IndexedSeq, IndexedCollectionPrototype);
mixin(SetSeq, SetCollectionPrototype);

// #pragma Helper functions

function reduce(collection, reducer, reduction, context, useFirst, reverse) {
  assertNotInfinite(collection.size);
  collection.__iterate(function (v, k, c) {
    if (useFirst) {
      useFirst = false;
      reduction = v;
    } else {
      reduction = reducer.call(context, reduction, v, k, c);
    }
  }, reverse);
  return reduction;
}

function keyMapper(v, k) {
  return k;
}

function entryMapper(v, k) {
  return [k, v];
}

function not(predicate) {
  return function () {
    return !predicate.apply(this, arguments);
  };
}

function neg(predicate) {
  return function () {
    return -predicate.apply(this, arguments);
  };
}

function defaultZipper() {
  return arrCopy(arguments);
}

function defaultNegComparator(a, b) {
  return a < b ? 1 : a > b ? -1 : 0;
}

function hashCollection(collection) {
  if (collection.size === Infinity) {
    return 0;
  }
  var ordered = isOrdered(collection);
  var keyed = isKeyed(collection);
  var h = ordered ? 1 : 0;
  var size = collection.__iterate(
    keyed
      ? ordered
        ? function (v, k) {
            h = (31 * h + hashMerge(hash(v), hash(k))) | 0;
          }
        : function (v, k) {
            h = (h + hashMerge(hash(v), hash(k))) | 0;
          }
      : ordered
      ? function (v) {
          h = (31 * h + hash(v)) | 0;
        }
      : function (v) {
          h = (h + hash(v)) | 0;
        }
  );
  return murmurHashOfSize(size, h);
}

function murmurHashOfSize(size, h) {
  h = imul(h, 0xcc9e2d51);
  h = imul((h << 15) | (h >>> -15), 0x1b873593);
  h = imul((h << 13) | (h >>> -13), 5);
  h = ((h + 0xe6546b64) | 0) ^ size;
  h = imul(h ^ (h >>> 16), 0x85ebca6b);
  h = imul(h ^ (h >>> 13), 0xc2b2ae35);
  h = smi(h ^ (h >>> 16));
  return h;
}

function hashMerge(a, b) {
  return (a ^ (b + 0x9e3779b9 + (a << 6) + (a >> 2))) | 0; // int
}

var OrderedSet = /*@__PURE__*/(function (Set) {
  function OrderedSet(value) {
    // eslint-disable-next-line no-constructor-return
    return value === undefined || value === null
      ? emptyOrderedSet()
      : isOrderedSet(value)
      ? value
      : emptyOrderedSet().withMutations(function (set) {
          var iter = SetCollection(value);
          assertNotInfinite(iter.size);
          iter.forEach(function (v) { return set.add(v); });
        });
  }

  if ( Set ) OrderedSet.__proto__ = Set;
  OrderedSet.prototype = Object.create( Set && Set.prototype );
  OrderedSet.prototype.constructor = OrderedSet;

  OrderedSet.of = function of (/*...values*/) {
    return this(arguments);
  };

  OrderedSet.fromKeys = function fromKeys (value) {
    return this(KeyedCollection(value).keySeq());
  };

  OrderedSet.prototype.toString = function toString () {
    return this.__toString('OrderedSet {', '}');
  };

  return OrderedSet;
}(Set));

OrderedSet.isOrderedSet = isOrderedSet;

var OrderedSetPrototype = OrderedSet.prototype;
OrderedSetPrototype[IS_ORDERED_SYMBOL] = true;
OrderedSetPrototype.zip = IndexedCollectionPrototype.zip;
OrderedSetPrototype.zipWith = IndexedCollectionPrototype.zipWith;
OrderedSetPrototype.zipAll = IndexedCollectionPrototype.zipAll;

OrderedSetPrototype.__empty = emptyOrderedSet;
OrderedSetPrototype.__make = makeOrderedSet;

function makeOrderedSet(map, ownerID) {
  var set = Object.create(OrderedSetPrototype);
  set.size = map ? map.size : 0;
  set._map = map;
  set.__ownerID = ownerID;
  return set;
}

var EMPTY_ORDERED_SET;
function emptyOrderedSet() {
  return (
    EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()))
  );
}

var PairSorting = {
  LeftThenRight: -1,
  RightThenLeft: +1,
};

function throwOnInvalidDefaultValues(defaultValues) {
  if (isRecord(defaultValues)) {
    throw new Error(
      'Can not call `Record` with an immutable Record as default values. Use a plain javascript object instead.'
    );
  }

  if (isImmutable(defaultValues)) {
    throw new Error(
      'Can not call `Record` with an immutable Collection as default values. Use a plain javascript object instead.'
    );
  }

  if (defaultValues === null || typeof defaultValues !== 'object') {
    throw new Error(
      'Can not call `Record` with a non-object as default values. Use a plain javascript object instead.'
    );
  }
}

var Record = function Record(defaultValues, name) {
  var hasInitialized;

  throwOnInvalidDefaultValues(defaultValues);

  var RecordType = function Record(values) {
    var this$1$1 = this;

    if (values instanceof RecordType) {
      return values;
    }
    if (!(this instanceof RecordType)) {
      return new RecordType(values);
    }
    if (!hasInitialized) {
      hasInitialized = true;
      var keys = Object.keys(defaultValues);
      var indices = (RecordTypePrototype._indices = {});
      // Deprecated: left to attempt not to break any external code which
      // relies on a ._name property existing on record instances.
      // Use Record.getDescriptiveName() instead
      RecordTypePrototype._name = name;
      RecordTypePrototype._keys = keys;
      RecordTypePrototype._defaultValues = defaultValues;
      for (var i = 0; i < keys.length; i++) {
        var propName = keys[i];
        indices[propName] = i;
        if (RecordTypePrototype[propName]) {
          /* eslint-disable no-console */
          typeof console === 'object' &&
            console.warn &&
            console.warn(
              'Cannot define ' +
                recordName(this) +
                ' with property "' +
                propName +
                '" since that property name is part of the Record API.'
            );
          /* eslint-enable no-console */
        } else {
          setProp(RecordTypePrototype, propName);
        }
      }
    }
    this.__ownerID = undefined;
    this._values = List().withMutations(function (l) {
      l.setSize(this$1$1._keys.length);
      KeyedCollection(values).forEach(function (v, k) {
        l.set(this$1$1._indices[k], v === this$1$1._defaultValues[k] ? undefined : v);
      });
    });
    return this;
  };

  var RecordTypePrototype = (RecordType.prototype =
    Object.create(RecordPrototype));
  RecordTypePrototype.constructor = RecordType;

  if (name) {
    RecordType.displayName = name;
  }

  // eslint-disable-next-line no-constructor-return
  return RecordType;
};

Record.prototype.toString = function toString () {
  var str = recordName(this) + ' { ';
  var keys = this._keys;
  var k;
  for (var i = 0, l = keys.length; i !== l; i++) {
    k = keys[i];
    str += (i ? ', ' : '') + k + ': ' + quoteString(this.get(k));
  }
  return str + ' }';
};

Record.prototype.equals = function equals (other) {
  return (
    this === other ||
    (isRecord(other) && recordSeq(this).equals(recordSeq(other)))
  );
};

Record.prototype.hashCode = function hashCode () {
  return recordSeq(this).hashCode();
};

// @pragma Access

Record.prototype.has = function has (k) {
  return this._indices.hasOwnProperty(k);
};

Record.prototype.get = function get (k, notSetValue) {
  if (!this.has(k)) {
    return notSetValue;
  }
  var index = this._indices[k];
  var value = this._values.get(index);
  return value === undefined ? this._defaultValues[k] : value;
};

// @pragma Modification

Record.prototype.set = function set (k, v) {
  if (this.has(k)) {
    var newValues = this._values.set(
      this._indices[k],
      v === this._defaultValues[k] ? undefined : v
    );
    if (newValues !== this._values && !this.__ownerID) {
      return makeRecord(this, newValues);
    }
  }
  return this;
};

Record.prototype.remove = function remove (k) {
  return this.set(k);
};

Record.prototype.clear = function clear () {
  var newValues = this._values.clear().setSize(this._keys.length);

  return this.__ownerID ? this : makeRecord(this, newValues);
};

Record.prototype.wasAltered = function wasAltered () {
  return this._values.wasAltered();
};

Record.prototype.toSeq = function toSeq () {
  return recordSeq(this);
};

Record.prototype.toJS = function toJS$1 () {
  return toJS(this);
};

Record.prototype.entries = function entries () {
  return this.__iterator(ITERATE_ENTRIES);
};

Record.prototype.__iterator = function __iterator (type, reverse) {
  return recordSeq(this).__iterator(type, reverse);
};

Record.prototype.__iterate = function __iterate (fn, reverse) {
  return recordSeq(this).__iterate(fn, reverse);
};

Record.prototype.__ensureOwner = function __ensureOwner (ownerID) {
  if (ownerID === this.__ownerID) {
    return this;
  }
  var newValues = this._values.__ensureOwner(ownerID);
  if (!ownerID) {
    this.__ownerID = ownerID;
    this._values = newValues;
    return this;
  }
  return makeRecord(this, newValues, ownerID);
};

Record.isRecord = isRecord;
Record.getDescriptiveName = recordName;
var RecordPrototype = Record.prototype;
RecordPrototype[IS_RECORD_SYMBOL] = true;
RecordPrototype[DELETE] = RecordPrototype.remove;
RecordPrototype.deleteIn = RecordPrototype.removeIn = deleteIn;
RecordPrototype.getIn = getIn;
RecordPrototype.hasIn = CollectionPrototype.hasIn;
RecordPrototype.merge = merge$1;
RecordPrototype.mergeWith = mergeWith$1;
RecordPrototype.mergeIn = mergeIn;
RecordPrototype.mergeDeep = mergeDeep;
RecordPrototype.mergeDeepWith = mergeDeepWith;
RecordPrototype.mergeDeepIn = mergeDeepIn;
RecordPrototype.setIn = setIn;
RecordPrototype.update = update;
RecordPrototype.updateIn = updateIn;
RecordPrototype.withMutations = withMutations;
RecordPrototype.asMutable = asMutable;
RecordPrototype.asImmutable = asImmutable;
RecordPrototype[ITERATOR_SYMBOL] = RecordPrototype.entries;
RecordPrototype.toJSON = RecordPrototype.toObject =
  CollectionPrototype.toObject;
RecordPrototype.inspect = RecordPrototype.toSource = function () {
  return this.toString();
};

function makeRecord(likeRecord, values, ownerID) {
  var record = Object.create(Object.getPrototypeOf(likeRecord));
  record._values = values;
  record.__ownerID = ownerID;
  return record;
}

function recordName(record) {
  return record.constructor.displayName || record.constructor.name || 'Record';
}

function recordSeq(record) {
  return keyedSeqFromValue(record._keys.map(function (k) { return [k, record.get(k)]; }));
}

function setProp(prototype, name) {
  try {
    Object.defineProperty(prototype, name, {
      get: function () {
        return this.get(name);
      },
      set: function (value) {
        invariant(this.__ownerID, 'Cannot set on an immutable record.');
        this.set(name, value);
      },
    });
  } catch (error) {
    // Object.defineProperty failed. Probably IE8.
  }
}

/**
 * Returns a lazy Seq of `value` repeated `times` times. When `times` is
 * undefined, returns an infinite sequence of `value`.
 */
var Repeat = /*@__PURE__*/(function (IndexedSeq) {
  function Repeat(value, times) {
    if (!(this instanceof Repeat)) {
      // eslint-disable-next-line no-constructor-return
      return new Repeat(value, times);
    }
    this._value = value;
    this.size = times === undefined ? Infinity : Math.max(0, times);
    if (this.size === 0) {
      if (EMPTY_REPEAT) {
        // eslint-disable-next-line no-constructor-return
        return EMPTY_REPEAT;
      }
      EMPTY_REPEAT = this;
    }
  }

  if ( IndexedSeq ) Repeat.__proto__ = IndexedSeq;
  Repeat.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
  Repeat.prototype.constructor = Repeat;

  Repeat.prototype.toString = function toString () {
    if (this.size === 0) {
      return 'Repeat []';
    }
    return 'Repeat [ ' + this._value + ' ' + this.size + ' times ]';
  };

  Repeat.prototype.get = function get (index, notSetValue) {
    return this.has(index) ? this._value : notSetValue;
  };

  Repeat.prototype.includes = function includes (searchValue) {
    return is(this._value, searchValue);
  };

  Repeat.prototype.slice = function slice (begin, end) {
    var size = this.size;
    return wholeSlice(begin, end, size)
      ? this
      : new Repeat(
          this._value,
          resolveEnd(end, size) - resolveBegin(begin, size)
        );
  };

  Repeat.prototype.reverse = function reverse () {
    return this;
  };

  Repeat.prototype.indexOf = function indexOf (searchValue) {
    if (is(this._value, searchValue)) {
      return 0;
    }
    return -1;
  };

  Repeat.prototype.lastIndexOf = function lastIndexOf (searchValue) {
    if (is(this._value, searchValue)) {
      return this.size;
    }
    return -1;
  };

  Repeat.prototype.__iterate = function __iterate (fn, reverse) {
    var size = this.size;
    var i = 0;
    while (i !== size) {
      if (fn(this._value, reverse ? size - ++i : i++, this) === false) {
        break;
      }
    }
    return i;
  };

  Repeat.prototype.__iterator = function __iterator (type, reverse) {
    var this$1$1 = this;

    var size = this.size;
    var i = 0;
    return new Iterator(function () { return i === size
        ? iteratorDone()
        : iteratorValue(type, reverse ? size - ++i : i++, this$1$1._value); }
    );
  };

  Repeat.prototype.equals = function equals (other) {
    return other instanceof Repeat
      ? is(this._value, other._value)
      : deepEqual(this, other);
  };

  return Repeat;
}(IndexedSeq));

var EMPTY_REPEAT;

function fromJS(value, converter) {
  return fromJSWith(
    [],
    converter || defaultConverter,
    value,
    '',
    converter && converter.length > 2 ? [] : undefined,
    { '': value }
  );
}

function fromJSWith(stack, converter, value, key, keyPath, parentValue) {
  if (
    typeof value !== 'string' &&
    !isImmutable(value) &&
    (isArrayLike(value) || hasIterator(value) || isPlainObject(value))
  ) {
    if (~stack.indexOf(value)) {
      throw new TypeError('Cannot convert circular structure to Immutable');
    }
    stack.push(value);
    keyPath && key !== '' && keyPath.push(key);
    var converted = converter.call(
      parentValue,
      key,
      Seq(value).map(function (v, k) { return fromJSWith(stack, converter, v, k, keyPath, value); }
      ),
      keyPath && keyPath.slice()
    );
    stack.pop();
    keyPath && keyPath.pop();
    return converted;
  }
  return value;
}

function defaultConverter(k, v) {
  // Effectively the opposite of "Collection.toSeq()"
  return isIndexed(v) ? v.toList() : isKeyed(v) ? v.toMap() : v.toSet();
}

var version = "4.3.7";

var Immutable = {
  version: version,

  Collection: Collection,
  // Note: Iterable is deprecated
  Iterable: Collection,

  Seq: Seq,
  Map: Map,
  OrderedMap: OrderedMap,
  List: List,
  Stack: Stack,
  Set: Set,
  OrderedSet: OrderedSet,
  PairSorting: PairSorting,

  Record: Record,
  Range: Range,
  Repeat: Repeat,

  is: is,
  fromJS: fromJS,
  hash: hash,

  isImmutable: isImmutable,
  isCollection: isCollection,
  isKeyed: isKeyed,
  isIndexed: isIndexed,
  isAssociative: isAssociative,
  isOrdered: isOrdered,
  isValueObject: isValueObject,
  isPlainObject: isPlainObject,
  isSeq: isSeq,
  isList: isList,
  isMap: isMap,
  isOrderedMap: isOrderedMap,
  isStack: isStack,
  isSet: isSet,
  isOrderedSet: isOrderedSet,
  isRecord: isRecord,

  get: get,
  getIn: getIn$1,
  has: has,
  hasIn: hasIn$1,
  merge: merge,
  mergeDeep: mergeDeep$1,
  mergeWith: mergeWith,
  mergeDeepWith: mergeDeepWith$1,
  remove: remove,
  removeIn: removeIn,
  set: set,
  setIn: setIn$1,
  update: update$1,
  updateIn: updateIn$1,
};

// Note: Iterable is deprecated
var Iterable = Collection;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Immutable);



/***/ }),

/***/ "?1e65":
/*!************************!*\
  !*** assert (ignored) ***!
  \************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "./node_modules/goober/dist/goober.modern.js":
/*!***************************************************!*\
  !*** ./node_modules/goober/dist/goober.modern.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   css: () => (/* binding */ u),
/* harmony export */   extractCss: () => (/* binding */ r),
/* harmony export */   glob: () => (/* binding */ b),
/* harmony export */   keyframes: () => (/* binding */ h),
/* harmony export */   setup: () => (/* binding */ m),
/* harmony export */   styled: () => (/* binding */ j)
/* harmony export */ });
let e={data:""},t=t=>"object"==typeof window?((t?t.querySelector("#_goober"):window._goober)||Object.assign((t||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:t||e,r=e=>{let r=t(e),l=r.data;return r.data="",l},l=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,a=/\/\*[^]*?\*\/|  +/g,n=/\n+/g,o=(e,t)=>{let r="",l="",a="";for(let n in e){let c=e[n];"@"==n[0]?"i"==n[1]?r=n+" "+c+";":l+="f"==n[1]?o(c,n):n+"{"+o(c,"k"==n[1]?"":t)+"}":"object"==typeof c?l+=o(c,t?t.replace(/([^,])+/g,e=>n.replace(/(^:.*)|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):n):null!=c&&(n=/^--/.test(n)?n:n.replace(/[A-Z]/g,"-$&").toLowerCase(),a+=o.p?o.p(n,c):n+":"+c+";")}return r+(t&&a?t+"{"+a+"}":a)+l},c={},s=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+s(e[r]);return t}return e},i=(e,t,r,i,p)=>{let u=s(e),d=c[u]||(c[u]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(u));if(!c[d]){let t=u!==e?e:(e=>{let t,r,o=[{}];for(;t=l.exec(e.replace(a,""));)t[4]?o.shift():t[3]?(r=t[3].replace(n," ").trim(),o.unshift(o[0][r]=o[0][r]||{})):o[0][t[1]]=t[2].replace(n," ").trim();return o[0]})(e);c[d]=o(p?{["@keyframes "+d]:t}:t,r?"":"."+d)}let f=r&&c.g?c.g:null;return r&&(c.g=c[d]),((e,t,r,l)=>{l?t.data=t.data.replace(l,e):-1===t.data.indexOf(e)&&(t.data=r?e+t.data:t.data+e)})(c[d],t,i,f),d},p=(e,t,r)=>e.reduce((e,l,a)=>{let n=t[a];if(n&&n.call){let e=n(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;n=t?"."+t:e&&"object"==typeof e?e.props?"":o(e,""):!1===e?"":e}return e+l+(null==n?"":n)},"");function u(e){let r=this||{},l=e.call?e(r.p):e;return i(l.unshift?l.raw?p(l,[].slice.call(arguments,1),r.p):l.reduce((e,t)=>Object.assign(e,t&&t.call?t(r.p):t),{}):l,t(r.target),r.g,r.o,r.k)}let d,f,g,b=u.bind({g:1}),h=u.bind({k:1});function m(e,t,r,l){o.p=t,d=e,f=r,g=l}function j(e,t){let r=this||{};return function(){let l=arguments;function a(n,o){let c=Object.assign({},n),s=c.className||a.className;r.p=Object.assign({theme:f&&f()},c),r.o=/ *go\d+/.test(s),c.className=u.apply(r,l)+(s?" "+s:""),t&&(c.ref=o);let i=e;return e[0]&&(i=c.as||e,delete c.as),g&&i[0]&&g(c),d(i,c)}return t?t(a):a}}


/***/ }),

/***/ "./node_modules/solid-js/dist/dev.js":
/*!*******************************************!*\
  !*** ./node_modules/solid-js/dist/dev.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $DEVCOMP: () => (/* binding */ $DEVCOMP),
/* harmony export */   $PROXY: () => (/* binding */ $PROXY),
/* harmony export */   $TRACK: () => (/* binding */ $TRACK),
/* harmony export */   DEV: () => (/* binding */ DEV),
/* harmony export */   ErrorBoundary: () => (/* binding */ ErrorBoundary),
/* harmony export */   For: () => (/* binding */ For),
/* harmony export */   Index: () => (/* binding */ Index),
/* harmony export */   Match: () => (/* binding */ Match),
/* harmony export */   Show: () => (/* binding */ Show),
/* harmony export */   Suspense: () => (/* binding */ Suspense),
/* harmony export */   SuspenseList: () => (/* binding */ SuspenseList),
/* harmony export */   Switch: () => (/* binding */ Switch),
/* harmony export */   batch: () => (/* binding */ batch),
/* harmony export */   cancelCallback: () => (/* binding */ cancelCallback),
/* harmony export */   catchError: () => (/* binding */ catchError),
/* harmony export */   children: () => (/* binding */ children),
/* harmony export */   createComponent: () => (/* binding */ createComponent),
/* harmony export */   createComputed: () => (/* binding */ createComputed),
/* harmony export */   createContext: () => (/* binding */ createContext),
/* harmony export */   createDeferred: () => (/* binding */ createDeferred),
/* harmony export */   createEffect: () => (/* binding */ createEffect),
/* harmony export */   createMemo: () => (/* binding */ createMemo),
/* harmony export */   createReaction: () => (/* binding */ createReaction),
/* harmony export */   createRenderEffect: () => (/* binding */ createRenderEffect),
/* harmony export */   createResource: () => (/* binding */ createResource),
/* harmony export */   createRoot: () => (/* binding */ createRoot),
/* harmony export */   createSelector: () => (/* binding */ createSelector),
/* harmony export */   createSignal: () => (/* binding */ createSignal),
/* harmony export */   createUniqueId: () => (/* binding */ createUniqueId),
/* harmony export */   enableExternalSource: () => (/* binding */ enableExternalSource),
/* harmony export */   enableHydration: () => (/* binding */ enableHydration),
/* harmony export */   enableScheduling: () => (/* binding */ enableScheduling),
/* harmony export */   equalFn: () => (/* binding */ equalFn),
/* harmony export */   from: () => (/* binding */ from),
/* harmony export */   getListener: () => (/* binding */ getListener),
/* harmony export */   getOwner: () => (/* binding */ getOwner),
/* harmony export */   indexArray: () => (/* binding */ indexArray),
/* harmony export */   lazy: () => (/* binding */ lazy),
/* harmony export */   mapArray: () => (/* binding */ mapArray),
/* harmony export */   mergeProps: () => (/* binding */ mergeProps),
/* harmony export */   observable: () => (/* binding */ observable),
/* harmony export */   on: () => (/* binding */ on),
/* harmony export */   onCleanup: () => (/* binding */ onCleanup),
/* harmony export */   onError: () => (/* binding */ onError),
/* harmony export */   onMount: () => (/* binding */ onMount),
/* harmony export */   requestCallback: () => (/* binding */ requestCallback),
/* harmony export */   resetErrorBoundaries: () => (/* binding */ resetErrorBoundaries),
/* harmony export */   runWithOwner: () => (/* binding */ runWithOwner),
/* harmony export */   sharedConfig: () => (/* binding */ sharedConfig),
/* harmony export */   splitProps: () => (/* binding */ splitProps),
/* harmony export */   startTransition: () => (/* binding */ startTransition),
/* harmony export */   untrack: () => (/* binding */ untrack),
/* harmony export */   useContext: () => (/* binding */ useContext),
/* harmony export */   useTransition: () => (/* binding */ useTransition)
/* harmony export */ });
let taskIdCounter = 1,
  isCallbackScheduled = false,
  isPerformingWork = false,
  taskQueue = [],
  currentTask = null,
  shouldYieldToHost = null,
  yieldInterval = 5,
  deadline = 0,
  maxYieldInterval = 300,
  scheduleCallback = null,
  scheduledCallback = null;
const maxSigned31BitInt = 1073741823;
function setupScheduler() {
  const channel = new MessageChannel(),
    port = channel.port2;
  scheduleCallback = () => port.postMessage(null);
  channel.port1.onmessage = () => {
    if (scheduledCallback !== null) {
      const currentTime = performance.now();
      deadline = currentTime + yieldInterval;
      const hasTimeRemaining = true;
      try {
        const hasMoreWork = scheduledCallback(hasTimeRemaining, currentTime);
        if (!hasMoreWork) {
          scheduledCallback = null;
        } else port.postMessage(null);
      } catch (error) {
        port.postMessage(null);
        throw error;
      }
    }
  };
  if (navigator && navigator.scheduling && navigator.scheduling.isInputPending) {
    const scheduling = navigator.scheduling;
    shouldYieldToHost = () => {
      const currentTime = performance.now();
      if (currentTime >= deadline) {
        if (scheduling.isInputPending()) {
          return true;
        }
        return currentTime >= maxYieldInterval;
      } else {
        return false;
      }
    };
  } else {
    shouldYieldToHost = () => performance.now() >= deadline;
  }
}
function enqueue(taskQueue, task) {
  function findIndex() {
    let m = 0;
    let n = taskQueue.length - 1;
    while (m <= n) {
      const k = n + m >> 1;
      const cmp = task.expirationTime - taskQueue[k].expirationTime;
      if (cmp > 0) m = k + 1;else if (cmp < 0) n = k - 1;else return k;
    }
    return m;
  }
  taskQueue.splice(findIndex(), 0, task);
}
function requestCallback(fn, options) {
  if (!scheduleCallback) setupScheduler();
  let startTime = performance.now(),
    timeout = maxSigned31BitInt;
  if (options && options.timeout) timeout = options.timeout;
  const newTask = {
    id: taskIdCounter++,
    fn,
    startTime,
    expirationTime: startTime + timeout
  };
  enqueue(taskQueue, newTask);
  if (!isCallbackScheduled && !isPerformingWork) {
    isCallbackScheduled = true;
    scheduledCallback = flushWork;
    scheduleCallback();
  }
  return newTask;
}
function cancelCallback(task) {
  task.fn = null;
}
function flushWork(hasTimeRemaining, initialTime) {
  isCallbackScheduled = false;
  isPerformingWork = true;
  try {
    return workLoop(hasTimeRemaining, initialTime);
  } finally {
    currentTask = null;
    isPerformingWork = false;
  }
}
function workLoop(hasTimeRemaining, initialTime) {
  let currentTime = initialTime;
  currentTask = taskQueue[0] || null;
  while (currentTask !== null) {
    if (currentTask.expirationTime > currentTime && (!hasTimeRemaining || shouldYieldToHost())) {
      break;
    }
    const callback = currentTask.fn;
    if (callback !== null) {
      currentTask.fn = null;
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      callback(didUserCallbackTimeout);
      currentTime = performance.now();
      if (currentTask === taskQueue[0]) {
        taskQueue.shift();
      }
    } else taskQueue.shift();
    currentTask = taskQueue[0] || null;
  }
  return currentTask !== null;
}

const sharedConfig = {
  context: undefined,
  registry: undefined,
  effects: undefined,
  done: false,
  getContextId() {
    return getContextId(this.context.count);
  },
  getNextContextId() {
    return getContextId(this.context.count++);
  }
};
function getContextId(count) {
  const num = String(count),
    len = num.length - 1;
  return sharedConfig.context.id + (len ? String.fromCharCode(96 + len) : "") + num;
}
function setHydrateContext(context) {
  sharedConfig.context = context;
}
function nextHydrateContext() {
  return {
    ...sharedConfig.context,
    id: sharedConfig.getNextContextId(),
    count: 0
  };
}

const equalFn = (a, b) => a === b;
const $PROXY = Symbol("solid-proxy");
const $TRACK = Symbol("solid-track");
const $DEVCOMP = Symbol("solid-dev-component");
const signalOptions = {
  equals: equalFn
};
let ERROR = null;
let runEffects = runQueue;
const STALE = 1;
const PENDING = 2;
const UNOWNED = {
  owned: null,
  cleanups: null,
  context: null,
  owner: null
};
const NO_INIT = {};
var Owner = null;
let Transition = null;
let Scheduler = null;
let ExternalSourceConfig = null;
let Listener = null;
let Updates = null;
let Effects = null;
let ExecCount = 0;
const DevHooks = {
  afterUpdate: null,
  afterCreateOwner: null,
  afterCreateSignal: null
};
function createRoot(fn, detachedOwner) {
  const listener = Listener,
    owner = Owner,
    unowned = fn.length === 0,
    current = detachedOwner === undefined ? owner : detachedOwner,
    root = unowned ? {
      owned: null,
      cleanups: null,
      context: null,
      owner: null
    }  : {
      owned: null,
      cleanups: null,
      context: current ? current.context : null,
      owner: current
    },
    updateFn = unowned ? () => fn(() => {
      throw new Error("Dispose method must be an explicit argument to createRoot function");
    })  : () => fn(() => untrack(() => cleanNode(root)));
  DevHooks.afterCreateOwner && DevHooks.afterCreateOwner(root);
  Owner = root;
  Listener = null;
  try {
    return runUpdates(updateFn, true);
  } finally {
    Listener = listener;
    Owner = owner;
  }
}
function createSignal(value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const s = {
    value,
    observers: null,
    observerSlots: null,
    comparator: options.equals || undefined
  };
  {
    if (options.name) s.name = options.name;
    if (DevHooks.afterCreateSignal) DevHooks.afterCreateSignal(s);
    if (!options.internal) registerGraph(s);
  }
  const setter = value => {
    if (typeof value === "function") {
      if (Transition && Transition.running && Transition.sources.has(s)) value = value(s.tValue);else value = value(s.value);
    }
    return writeSignal(s, value);
  };
  return [readSignal.bind(s), setter];
}
function createComputed(fn, value, options) {
  const c = createComputation(fn, value, true, STALE, options );
  if (Scheduler && Transition && Transition.running) Updates.push(c);else updateComputation(c);
}
function createRenderEffect(fn, value, options) {
  const c = createComputation(fn, value, false, STALE, options );
  if (Scheduler && Transition && Transition.running) Updates.push(c);else updateComputation(c);
}
function createEffect(fn, value, options) {
  runEffects = runUserEffects;
  const c = createComputation(fn, value, false, STALE, options ),
    s = SuspenseContext && useContext(SuspenseContext);
  if (s) c.suspense = s;
  if (!options || !options.render) c.user = true;
  Effects ? Effects.push(c) : updateComputation(c);
}
function createReaction(onInvalidate, options) {
  let fn;
  const c = createComputation(() => {
      fn ? fn() : untrack(onInvalidate);
      fn = undefined;
    }, undefined, false, 0, options ),
    s = SuspenseContext && useContext(SuspenseContext);
  if (s) c.suspense = s;
  c.user = true;
  return tracking => {
    fn = tracking;
    updateComputation(c);
  };
}
function createMemo(fn, value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const c = createComputation(fn, value, true, 0, options );
  c.observers = null;
  c.observerSlots = null;
  c.comparator = options.equals || undefined;
  if (Scheduler && Transition && Transition.running) {
    c.tState = STALE;
    Updates.push(c);
  } else updateComputation(c);
  return readSignal.bind(c);
}
function isPromise(v) {
  return v && typeof v === "object" && "then" in v;
}
function createResource(pSource, pFetcher, pOptions) {
  let source;
  let fetcher;
  let options;
  if (arguments.length === 2 && typeof pFetcher === "object" || arguments.length === 1) {
    source = true;
    fetcher = pSource;
    options = pFetcher || {};
  } else {
    source = pSource;
    fetcher = pFetcher;
    options = pOptions || {};
  }
  let pr = null,
    initP = NO_INIT,
    id = null,
    loadedUnderTransition = false,
    scheduled = false,
    resolved = ("initialValue" in options),
    dynamic = typeof source === "function" && createMemo(source);
  const contexts = new Set(),
    [value, setValue] = (options.storage || createSignal)(options.initialValue),
    [error, setError] = createSignal(undefined),
    [track, trigger] = createSignal(undefined, {
      equals: false
    }),
    [state, setState] = createSignal(resolved ? "ready" : "unresolved");
  if (sharedConfig.context) {
    id = sharedConfig.getNextContextId();
    if (options.ssrLoadFrom === "initial") initP = options.initialValue;else if (sharedConfig.load && sharedConfig.has(id)) initP = sharedConfig.load(id);
  }
  function loadEnd(p, v, error, key) {
    if (pr === p) {
      pr = null;
      key !== undefined && (resolved = true);
      if ((p === initP || v === initP) && options.onHydrated) queueMicrotask(() => options.onHydrated(key, {
        value: v
      }));
      initP = NO_INIT;
      if (Transition && p && loadedUnderTransition) {
        Transition.promises.delete(p);
        loadedUnderTransition = false;
        runUpdates(() => {
          Transition.running = true;
          completeLoad(v, error);
        }, false);
      } else completeLoad(v, error);
    }
    return v;
  }
  function completeLoad(v, err) {
    runUpdates(() => {
      if (err === undefined) setValue(() => v);
      setState(err !== undefined ? "errored" : resolved ? "ready" : "unresolved");
      setError(err);
      for (const c of contexts.keys()) c.decrement();
      contexts.clear();
    }, false);
  }
  function read() {
    const c = SuspenseContext && useContext(SuspenseContext),
      v = value(),
      err = error();
    if (err !== undefined && !pr) throw err;
    if (Listener && !Listener.user && c) {
      createComputed(() => {
        track();
        if (pr) {
          if (c.resolved && Transition && loadedUnderTransition) Transition.promises.add(pr);else if (!contexts.has(c)) {
            c.increment();
            contexts.add(c);
          }
        }
      });
    }
    return v;
  }
  function load(refetching = true) {
    if (refetching !== false && scheduled) return;
    scheduled = false;
    const lookup = dynamic ? dynamic() : source;
    loadedUnderTransition = Transition && Transition.running;
    if (lookup == null || lookup === false) {
      loadEnd(pr, untrack(value));
      return;
    }
    if (Transition && pr) Transition.promises.delete(pr);
    const p = initP !== NO_INIT ? initP : untrack(() => fetcher(lookup, {
      value: value(),
      refetching
    }));
    if (!isPromise(p)) {
      loadEnd(pr, p, undefined, lookup);
      return p;
    }
    pr = p;
    if ("value" in p) {
      if (p.status === "success") loadEnd(pr, p.value, undefined, lookup);else loadEnd(pr, undefined, castError(p.value), lookup);
      return p;
    }
    scheduled = true;
    queueMicrotask(() => scheduled = false);
    runUpdates(() => {
      setState(resolved ? "refreshing" : "pending");
      trigger();
    }, false);
    return p.then(v => loadEnd(p, v, undefined, lookup), e => loadEnd(p, undefined, castError(e), lookup));
  }
  Object.defineProperties(read, {
    state: {
      get: () => state()
    },
    error: {
      get: () => error()
    },
    loading: {
      get() {
        const s = state();
        return s === "pending" || s === "refreshing";
      }
    },
    latest: {
      get() {
        if (!resolved) return read();
        const err = error();
        if (err && !pr) throw err;
        return value();
      }
    }
  });
  if (dynamic) createComputed(() => load(false));else load(false);
  return [read, {
    refetch: load,
    mutate: setValue
  }];
}
function createDeferred(source, options) {
  let t,
    timeout = options ? options.timeoutMs : undefined;
  const node = createComputation(() => {
    if (!t || !t.fn) t = requestCallback(() => setDeferred(() => node.value), timeout !== undefined ? {
      timeout
    } : undefined);
    return source();
  }, undefined, true);
  const [deferred, setDeferred] = createSignal(Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value, options);
  updateComputation(node);
  setDeferred(() => Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value);
  return deferred;
}
function createSelector(source, fn = equalFn, options) {
  const subs = new Map();
  const node = createComputation(p => {
    const v = source();
    for (const [key, val] of subs.entries()) if (fn(key, v) !== fn(key, p)) {
      for (const c of val.values()) {
        c.state = STALE;
        if (c.pure) Updates.push(c);else Effects.push(c);
      }
    }
    return v;
  }, undefined, true, STALE, options );
  updateComputation(node);
  return key => {
    const listener = Listener;
    if (listener) {
      let l;
      if (l = subs.get(key)) l.add(listener);else subs.set(key, l = new Set([listener]));
      onCleanup(() => {
        l.delete(listener);
        !l.size && subs.delete(key);
      });
    }
    return fn(key, Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value);
  };
}
function batch(fn) {
  return runUpdates(fn, false);
}
function untrack(fn) {
  if (!ExternalSourceConfig && Listener === null) return fn();
  const listener = Listener;
  Listener = null;
  try {
    if (ExternalSourceConfig) return ExternalSourceConfig.untrack(fn);
    return fn();
  } finally {
    Listener = listener;
  }
}
function on(deps, fn, options) {
  const isArray = Array.isArray(deps);
  let prevInput;
  let defer = options && options.defer;
  return prevValue => {
    let input;
    if (isArray) {
      input = Array(deps.length);
      for (let i = 0; i < deps.length; i++) input[i] = deps[i]();
    } else input = deps();
    if (defer) {
      defer = false;
      return prevValue;
    }
    const result = untrack(() => fn(input, prevInput, prevValue));
    prevInput = input;
    return result;
  };
}
function onMount(fn) {
  createEffect(() => untrack(fn));
}
function onCleanup(fn) {
  if (Owner === null) console.warn("cleanups created outside a `createRoot` or `render` will never be run");else if (Owner.cleanups === null) Owner.cleanups = [fn];else Owner.cleanups.push(fn);
  return fn;
}
function catchError(fn, handler) {
  ERROR || (ERROR = Symbol("error"));
  Owner = createComputation(undefined, undefined, true);
  Owner.context = {
    ...Owner.context,
    [ERROR]: [handler]
  };
  if (Transition && Transition.running) Transition.sources.add(Owner);
  try {
    return fn();
  } catch (err) {
    handleError(err);
  } finally {
    Owner = Owner.owner;
  }
}
function getListener() {
  return Listener;
}
function getOwner() {
  return Owner;
}
function runWithOwner(o, fn) {
  const prev = Owner;
  const prevListener = Listener;
  Owner = o;
  Listener = null;
  try {
    return runUpdates(fn, true);
  } catch (err) {
    handleError(err);
  } finally {
    Owner = prev;
    Listener = prevListener;
  }
}
function enableScheduling(scheduler = requestCallback) {
  Scheduler = scheduler;
}
function startTransition(fn) {
  if (Transition && Transition.running) {
    fn();
    return Transition.done;
  }
  const l = Listener;
  const o = Owner;
  return Promise.resolve().then(() => {
    Listener = l;
    Owner = o;
    let t;
    if (Scheduler || SuspenseContext) {
      t = Transition || (Transition = {
        sources: new Set(),
        effects: [],
        promises: new Set(),
        disposed: new Set(),
        queue: new Set(),
        running: true
      });
      t.done || (t.done = new Promise(res => t.resolve = res));
      t.running = true;
    }
    runUpdates(fn, false);
    Listener = Owner = null;
    return t ? t.done : undefined;
  });
}
const [transPending, setTransPending] = /*@__PURE__*/createSignal(false);
function useTransition() {
  return [transPending, startTransition];
}
function resumeEffects(e) {
  Effects.push.apply(Effects, e);
  e.length = 0;
}
function devComponent(Comp, props) {
  const c = createComputation(() => untrack(() => {
    Object.assign(Comp, {
      [$DEVCOMP]: true
    });
    return Comp(props);
  }), undefined, true, 0);
  c.props = props;
  c.observers = null;
  c.observerSlots = null;
  c.name = Comp.name;
  c.component = Comp;
  updateComputation(c);
  return c.tValue !== undefined ? c.tValue : c.value;
}
function registerGraph(value) {
  if (!Owner) return;
  if (Owner.sourceMap) Owner.sourceMap.push(value);else Owner.sourceMap = [value];
  value.graph = Owner;
}
function createContext(defaultValue, options) {
  const id = Symbol("context");
  return {
    id,
    Provider: createProvider(id, options),
    defaultValue
  };
}
function useContext(context) {
  let value;
  return Owner && Owner.context && (value = Owner.context[context.id]) !== undefined ? value : context.defaultValue;
}
function children(fn) {
  const children = createMemo(fn);
  const memo = createMemo(() => resolveChildren(children()), undefined, {
    name: "children"
  }) ;
  memo.toArray = () => {
    const c = memo();
    return Array.isArray(c) ? c : c != null ? [c] : [];
  };
  return memo;
}
let SuspenseContext;
function getSuspenseContext() {
  return SuspenseContext || (SuspenseContext = createContext());
}
function enableExternalSource(factory, untrack = fn => fn()) {
  if (ExternalSourceConfig) {
    const {
      factory: oldFactory,
      untrack: oldUntrack
    } = ExternalSourceConfig;
    ExternalSourceConfig = {
      factory: (fn, trigger) => {
        const oldSource = oldFactory(fn, trigger);
        const source = factory(x => oldSource.track(x), trigger);
        return {
          track: x => source.track(x),
          dispose() {
            source.dispose();
            oldSource.dispose();
          }
        };
      },
      untrack: fn => oldUntrack(() => untrack(fn))
    };
  } else {
    ExternalSourceConfig = {
      factory,
      untrack
    };
  }
}
function readSignal() {
  const runningTransition = Transition && Transition.running;
  if (this.sources && (runningTransition ? this.tState : this.state)) {
    if ((runningTransition ? this.tState : this.state) === STALE) updateComputation(this);else {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(this), false);
      Updates = updates;
    }
  }
  if (Listener) {
    const sSlot = this.observers ? this.observers.length : 0;
    if (!Listener.sources) {
      Listener.sources = [this];
      Listener.sourceSlots = [sSlot];
    } else {
      Listener.sources.push(this);
      Listener.sourceSlots.push(sSlot);
    }
    if (!this.observers) {
      this.observers = [Listener];
      this.observerSlots = [Listener.sources.length - 1];
    } else {
      this.observers.push(Listener);
      this.observerSlots.push(Listener.sources.length - 1);
    }
  }
  if (runningTransition && Transition.sources.has(this)) return this.tValue;
  return this.value;
}
function writeSignal(node, value, isComp) {
  let current = Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value;
  if (!node.comparator || !node.comparator(current, value)) {
    if (Transition) {
      const TransitionRunning = Transition.running;
      if (TransitionRunning || !isComp && Transition.sources.has(node)) {
        Transition.sources.add(node);
        node.tValue = value;
      }
      if (!TransitionRunning) node.value = value;
    } else node.value = value;
    if (node.observers && node.observers.length) {
      runUpdates(() => {
        for (let i = 0; i < node.observers.length; i += 1) {
          const o = node.observers[i];
          const TransitionRunning = Transition && Transition.running;
          if (TransitionRunning && Transition.disposed.has(o)) continue;
          if (TransitionRunning ? !o.tState : !o.state) {
            if (o.pure) Updates.push(o);else Effects.push(o);
            if (o.observers) markDownstream(o);
          }
          if (!TransitionRunning) o.state = STALE;else o.tState = STALE;
        }
        if (Updates.length > 10e5) {
          Updates = [];
          if (true) throw new Error("Potential Infinite Loop Detected.");
          throw new Error();
        }
      }, false);
    }
  }
  return value;
}
function updateComputation(node) {
  if (!node.fn) return;
  cleanNode(node);
  const time = ExecCount;
  runComputation(node, Transition && Transition.running && Transition.sources.has(node) ? node.tValue : node.value, time);
  if (Transition && !Transition.running && Transition.sources.has(node)) {
    queueMicrotask(() => {
      runUpdates(() => {
        Transition && (Transition.running = true);
        Listener = Owner = node;
        runComputation(node, node.tValue, time);
        Listener = Owner = null;
      }, false);
    });
  }
}
function runComputation(node, value, time) {
  let nextValue;
  const owner = Owner,
    listener = Listener;
  Listener = Owner = node;
  try {
    nextValue = node.fn(value);
  } catch (err) {
    if (node.pure) {
      if (Transition && Transition.running) {
        node.tState = STALE;
        node.tOwned && node.tOwned.forEach(cleanNode);
        node.tOwned = undefined;
      } else {
        node.state = STALE;
        node.owned && node.owned.forEach(cleanNode);
        node.owned = null;
      }
    }
    node.updatedAt = time + 1;
    return handleError(err);
  } finally {
    Listener = listener;
    Owner = owner;
  }
  if (!node.updatedAt || node.updatedAt <= time) {
    if (node.updatedAt != null && "observers" in node) {
      writeSignal(node, nextValue, true);
    } else if (Transition && Transition.running && node.pure) {
      Transition.sources.add(node);
      node.tValue = nextValue;
    } else node.value = nextValue;
    node.updatedAt = time;
  }
}
function createComputation(fn, init, pure, state = STALE, options) {
  const c = {
    fn,
    state: state,
    updatedAt: null,
    owned: null,
    sources: null,
    sourceSlots: null,
    cleanups: null,
    value: init,
    owner: Owner,
    context: Owner ? Owner.context : null,
    pure
  };
  if (Transition && Transition.running) {
    c.state = 0;
    c.tState = state;
  }
  if (Owner === null) console.warn("computations created outside a `createRoot` or `render` will never be disposed");else if (Owner !== UNOWNED) {
    if (Transition && Transition.running && Owner.pure) {
      if (!Owner.tOwned) Owner.tOwned = [c];else Owner.tOwned.push(c);
    } else {
      if (!Owner.owned) Owner.owned = [c];else Owner.owned.push(c);
    }
  }
  if (options && options.name) c.name = options.name;
  if (ExternalSourceConfig && c.fn) {
    const [track, trigger] = createSignal(undefined, {
      equals: false
    });
    const ordinary = ExternalSourceConfig.factory(c.fn, trigger);
    onCleanup(() => ordinary.dispose());
    const triggerInTransition = () => startTransition(trigger).then(() => inTransition.dispose());
    const inTransition = ExternalSourceConfig.factory(c.fn, triggerInTransition);
    c.fn = x => {
      track();
      return Transition && Transition.running ? inTransition.track(x) : ordinary.track(x);
    };
  }
  DevHooks.afterCreateOwner && DevHooks.afterCreateOwner(c);
  return c;
}
function runTop(node) {
  const runningTransition = Transition && Transition.running;
  if ((runningTransition ? node.tState : node.state) === 0) return;
  if ((runningTransition ? node.tState : node.state) === PENDING) return lookUpstream(node);
  if (node.suspense && untrack(node.suspense.inFallback)) return node.suspense.effects.push(node);
  const ancestors = [node];
  while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
    if (runningTransition && Transition.disposed.has(node)) return;
    if (runningTransition ? node.tState : node.state) ancestors.push(node);
  }
  for (let i = ancestors.length - 1; i >= 0; i--) {
    node = ancestors[i];
    if (runningTransition) {
      let top = node,
        prev = ancestors[i + 1];
      while ((top = top.owner) && top !== prev) {
        if (Transition.disposed.has(top)) return;
      }
    }
    if ((runningTransition ? node.tState : node.state) === STALE) {
      updateComputation(node);
    } else if ((runningTransition ? node.tState : node.state) === PENDING) {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(node, ancestors[0]), false);
      Updates = updates;
    }
  }
}
function runUpdates(fn, init) {
  if (Updates) return fn();
  let wait = false;
  if (!init) Updates = [];
  if (Effects) wait = true;else Effects = [];
  ExecCount++;
  try {
    const res = fn();
    completeUpdates(wait);
    return res;
  } catch (err) {
    if (!wait) Effects = null;
    Updates = null;
    handleError(err);
  }
}
function completeUpdates(wait) {
  if (Updates) {
    if (Scheduler && Transition && Transition.running) scheduleQueue(Updates);else runQueue(Updates);
    Updates = null;
  }
  if (wait) return;
  let res;
  if (Transition) {
    if (!Transition.promises.size && !Transition.queue.size) {
      const sources = Transition.sources;
      const disposed = Transition.disposed;
      Effects.push.apply(Effects, Transition.effects);
      res = Transition.resolve;
      for (const e of Effects) {
        "tState" in e && (e.state = e.tState);
        delete e.tState;
      }
      Transition = null;
      runUpdates(() => {
        for (const d of disposed) cleanNode(d);
        for (const v of sources) {
          v.value = v.tValue;
          if (v.owned) {
            for (let i = 0, len = v.owned.length; i < len; i++) cleanNode(v.owned[i]);
          }
          if (v.tOwned) v.owned = v.tOwned;
          delete v.tValue;
          delete v.tOwned;
          v.tState = 0;
        }
        setTransPending(false);
      }, false);
    } else if (Transition.running) {
      Transition.running = false;
      Transition.effects.push.apply(Transition.effects, Effects);
      Effects = null;
      setTransPending(true);
      return;
    }
  }
  const e = Effects;
  Effects = null;
  if (e.length) runUpdates(() => runEffects(e), false);else DevHooks.afterUpdate && DevHooks.afterUpdate();
  if (res) res();
}
function runQueue(queue) {
  for (let i = 0; i < queue.length; i++) runTop(queue[i]);
}
function scheduleQueue(queue) {
  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    const tasks = Transition.queue;
    if (!tasks.has(item)) {
      tasks.add(item);
      Scheduler(() => {
        tasks.delete(item);
        runUpdates(() => {
          Transition.running = true;
          runTop(item);
        }, false);
        Transition && (Transition.running = false);
      });
    }
  }
}
function runUserEffects(queue) {
  let i,
    userLength = 0;
  for (i = 0; i < queue.length; i++) {
    const e = queue[i];
    if (!e.user) runTop(e);else queue[userLength++] = e;
  }
  if (sharedConfig.context) {
    if (sharedConfig.count) {
      sharedConfig.effects || (sharedConfig.effects = []);
      sharedConfig.effects.push(...queue.slice(0, userLength));
      return;
    }
    setHydrateContext();
  }
  if (sharedConfig.effects && (sharedConfig.done || !sharedConfig.count)) {
    queue = [...sharedConfig.effects, ...queue];
    userLength += sharedConfig.effects.length;
    delete sharedConfig.effects;
  }
  for (i = 0; i < userLength; i++) runTop(queue[i]);
}
function lookUpstream(node, ignore) {
  const runningTransition = Transition && Transition.running;
  if (runningTransition) node.tState = 0;else node.state = 0;
  for (let i = 0; i < node.sources.length; i += 1) {
    const source = node.sources[i];
    if (source.sources) {
      const state = runningTransition ? source.tState : source.state;
      if (state === STALE) {
        if (source !== ignore && (!source.updatedAt || source.updatedAt < ExecCount)) runTop(source);
      } else if (state === PENDING) lookUpstream(source, ignore);
    }
  }
}
function markDownstream(node) {
  const runningTransition = Transition && Transition.running;
  for (let i = 0; i < node.observers.length; i += 1) {
    const o = node.observers[i];
    if (runningTransition ? !o.tState : !o.state) {
      if (runningTransition) o.tState = PENDING;else o.state = PENDING;
      if (o.pure) Updates.push(o);else Effects.push(o);
      o.observers && markDownstream(o);
    }
  }
}
function cleanNode(node) {
  let i;
  if (node.sources) {
    while (node.sources.length) {
      const source = node.sources.pop(),
        index = node.sourceSlots.pop(),
        obs = source.observers;
      if (obs && obs.length) {
        const n = obs.pop(),
          s = source.observerSlots.pop();
        if (index < obs.length) {
          n.sourceSlots[s] = index;
          obs[index] = n;
          source.observerSlots[index] = s;
        }
      }
    }
  }
  if (Transition && Transition.running && node.pure) {
    if (node.tOwned) {
      for (i = node.tOwned.length - 1; i >= 0; i--) cleanNode(node.tOwned[i]);
      delete node.tOwned;
    }
    reset(node, true);
  } else if (node.owned) {
    for (i = node.owned.length - 1; i >= 0; i--) cleanNode(node.owned[i]);
    node.owned = null;
  }
  if (node.cleanups) {
    for (i = node.cleanups.length - 1; i >= 0; i--) node.cleanups[i]();
    node.cleanups = null;
  }
  if (Transition && Transition.running) node.tState = 0;else node.state = 0;
  delete node.sourceMap;
}
function reset(node, top) {
  if (!top) {
    node.tState = 0;
    Transition.disposed.add(node);
  }
  if (node.owned) {
    for (let i = 0; i < node.owned.length; i++) reset(node.owned[i]);
  }
}
function castError(err) {
  if (err instanceof Error) return err;
  return new Error(typeof err === "string" ? err : "Unknown error", {
    cause: err
  });
}
function runErrors(err, fns, owner) {
  try {
    for (const f of fns) f(err);
  } catch (e) {
    handleError(e, owner && owner.owner || null);
  }
}
function handleError(err, owner = Owner) {
  const fns = ERROR && owner && owner.context && owner.context[ERROR];
  const error = castError(err);
  if (!fns) throw error;
  if (Effects) Effects.push({
    fn() {
      runErrors(error, fns, owner);
    },
    state: STALE
  });else runErrors(error, fns, owner);
}
function resolveChildren(children) {
  if (typeof children === "function" && !children.length) return resolveChildren(children());
  if (Array.isArray(children)) {
    const results = [];
    for (let i = 0; i < children.length; i++) {
      const result = resolveChildren(children[i]);
      Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
    }
    return results;
  }
  return children;
}
function createProvider(id, options) {
  return function provider(props) {
    let res;
    createRenderEffect(() => res = untrack(() => {
      Owner.context = {
        ...Owner.context,
        [id]: props.value
      };
      return children(() => props.children);
    }), undefined, options);
    return res;
  };
}
function onError(fn) {
  ERROR || (ERROR = Symbol("error"));
  if (Owner === null) console.warn("error handlers created outside a `createRoot` or `render` will never be run");else if (Owner.context === null || !Owner.context[ERROR]) {
    Owner.context = {
      ...Owner.context,
      [ERROR]: [fn]
    };
    mutateContext(Owner, ERROR, [fn]);
  } else Owner.context[ERROR].push(fn);
}
function mutateContext(o, key, value) {
  if (o.owned) {
    for (let i = 0; i < o.owned.length; i++) {
      if (o.owned[i].context === o.context) mutateContext(o.owned[i], key, value);
      if (!o.owned[i].context) {
        o.owned[i].context = o.context;
        mutateContext(o.owned[i], key, value);
      } else if (!o.owned[i].context[key]) {
        o.owned[i].context[key] = value;
        mutateContext(o.owned[i], key, value);
      }
    }
  }
}

function observable(input) {
  return {
    subscribe(observer) {
      if (!(observer instanceof Object) || observer == null) {
        throw new TypeError("Expected the observer to be an object.");
      }
      const handler = typeof observer === "function" ? observer : observer.next && observer.next.bind(observer);
      if (!handler) {
        return {
          unsubscribe() {}
        };
      }
      const dispose = createRoot(disposer => {
        createEffect(() => {
          const v = input();
          untrack(() => handler(v));
        });
        return disposer;
      });
      if (getOwner()) onCleanup(dispose);
      return {
        unsubscribe() {
          dispose();
        }
      };
    },
    [Symbol.observable || "@@observable"]() {
      return this;
    }
  };
}
function from(producer) {
  const [s, set] = createSignal(undefined, {
    equals: false
  });
  if ("subscribe" in producer) {
    const unsub = producer.subscribe(v => set(() => v));
    onCleanup(() => "unsubscribe" in unsub ? unsub.unsubscribe() : unsub());
  } else {
    const clean = producer(set);
    onCleanup(clean);
  }
  return s;
}

const FALLBACK = Symbol("fallback");
function dispose(d) {
  for (let i = 0; i < d.length; i++) d[i]();
}
function mapArray(list, mapFn, options = {}) {
  let items = [],
    mapped = [],
    disposers = [],
    len = 0,
    indexes = mapFn.length > 1 ? [] : null;
  onCleanup(() => dispose(disposers));
  return () => {
    let newItems = list() || [],
      newLen = newItems.length,
      i,
      j;
    newItems[$TRACK];
    return untrack(() => {
      let newIndices, newIndicesNext, temp, tempdisposers, tempIndexes, start, end, newEnd, item;
      if (newLen === 0) {
        if (len !== 0) {
          dispose(disposers);
          disposers = [];
          items = [];
          mapped = [];
          len = 0;
          indexes && (indexes = []);
        }
        if (options.fallback) {
          items = [FALLBACK];
          mapped[0] = createRoot(disposer => {
            disposers[0] = disposer;
            return options.fallback();
          });
          len = 1;
        }
      }
      else if (len === 0) {
        mapped = new Array(newLen);
        for (j = 0; j < newLen; j++) {
          items[j] = newItems[j];
          mapped[j] = createRoot(mapper);
        }
        len = newLen;
      } else {
        temp = new Array(newLen);
        tempdisposers = new Array(newLen);
        indexes && (tempIndexes = new Array(newLen));
        for (start = 0, end = Math.min(len, newLen); start < end && items[start] === newItems[start]; start++);
        for (end = len - 1, newEnd = newLen - 1; end >= start && newEnd >= start && items[end] === newItems[newEnd]; end--, newEnd--) {
          temp[newEnd] = mapped[end];
          tempdisposers[newEnd] = disposers[end];
          indexes && (tempIndexes[newEnd] = indexes[end]);
        }
        newIndices = new Map();
        newIndicesNext = new Array(newEnd + 1);
        for (j = newEnd; j >= start; j--) {
          item = newItems[j];
          i = newIndices.get(item);
          newIndicesNext[j] = i === undefined ? -1 : i;
          newIndices.set(item, j);
        }
        for (i = start; i <= end; i++) {
          item = items[i];
          j = newIndices.get(item);
          if (j !== undefined && j !== -1) {
            temp[j] = mapped[i];
            tempdisposers[j] = disposers[i];
            indexes && (tempIndexes[j] = indexes[i]);
            j = newIndicesNext[j];
            newIndices.set(item, j);
          } else disposers[i]();
        }
        for (j = start; j < newLen; j++) {
          if (j in temp) {
            mapped[j] = temp[j];
            disposers[j] = tempdisposers[j];
            if (indexes) {
              indexes[j] = tempIndexes[j];
              indexes[j](j);
            }
          } else mapped[j] = createRoot(mapper);
        }
        mapped = mapped.slice(0, len = newLen);
        items = newItems.slice(0);
      }
      return mapped;
    });
    function mapper(disposer) {
      disposers[j] = disposer;
      if (indexes) {
        const [s, set] = createSignal(j, {
          name: "index"
        }) ;
        indexes[j] = set;
        return mapFn(newItems[j], s);
      }
      return mapFn(newItems[j]);
    }
  };
}
function indexArray(list, mapFn, options = {}) {
  let items = [],
    mapped = [],
    disposers = [],
    signals = [],
    len = 0,
    i;
  onCleanup(() => dispose(disposers));
  return () => {
    const newItems = list() || [],
      newLen = newItems.length;
    newItems[$TRACK];
    return untrack(() => {
      if (newLen === 0) {
        if (len !== 0) {
          dispose(disposers);
          disposers = [];
          items = [];
          mapped = [];
          len = 0;
          signals = [];
        }
        if (options.fallback) {
          items = [FALLBACK];
          mapped[0] = createRoot(disposer => {
            disposers[0] = disposer;
            return options.fallback();
          });
          len = 1;
        }
        return mapped;
      }
      if (items[0] === FALLBACK) {
        disposers[0]();
        disposers = [];
        items = [];
        mapped = [];
        len = 0;
      }
      for (i = 0; i < newLen; i++) {
        if (i < items.length && items[i] !== newItems[i]) {
          signals[i](() => newItems[i]);
        } else if (i >= items.length) {
          mapped[i] = createRoot(mapper);
        }
      }
      for (; i < items.length; i++) {
        disposers[i]();
      }
      len = signals.length = disposers.length = newLen;
      items = newItems.slice(0);
      return mapped = mapped.slice(0, len);
    });
    function mapper(disposer) {
      disposers[i] = disposer;
      const [s, set] = createSignal(newItems[i], {
        name: "value"
      }) ;
      signals[i] = set;
      return mapFn(s, i);
    }
  };
}

let hydrationEnabled = false;
function enableHydration() {
  hydrationEnabled = true;
}
function createComponent(Comp, props) {
  if (hydrationEnabled) {
    if (sharedConfig.context) {
      const c = sharedConfig.context;
      setHydrateContext(nextHydrateContext());
      const r = devComponent(Comp, props || {}) ;
      setHydrateContext(c);
      return r;
    }
  }
  return devComponent(Comp, props || {});
}
function trueFn() {
  return true;
}
const propTraps = {
  get(_, property, receiver) {
    if (property === $PROXY) return receiver;
    return _.get(property);
  },
  has(_, property) {
    if (property === $PROXY) return true;
    return _.has(property);
  },
  set: trueFn,
  deleteProperty: trueFn,
  getOwnPropertyDescriptor(_, property) {
    return {
      configurable: true,
      enumerable: true,
      get() {
        return _.get(property);
      },
      set: trueFn,
      deleteProperty: trueFn
    };
  },
  ownKeys(_) {
    return _.keys();
  }
};
function resolveSource(s) {
  return !(s = typeof s === "function" ? s() : s) ? {} : s;
}
function resolveSources() {
  for (let i = 0, length = this.length; i < length; ++i) {
    const v = this[i]();
    if (v !== undefined) return v;
  }
}
function mergeProps(...sources) {
  let proxy = false;
  for (let i = 0; i < sources.length; i++) {
    const s = sources[i];
    proxy = proxy || !!s && $PROXY in s;
    sources[i] = typeof s === "function" ? (proxy = true, createMemo(s)) : s;
  }
  if (proxy) {
    return new Proxy({
      get(property) {
        for (let i = sources.length - 1; i >= 0; i--) {
          const v = resolveSource(sources[i])[property];
          if (v !== undefined) return v;
        }
      },
      has(property) {
        for (let i = sources.length - 1; i >= 0; i--) {
          if (property in resolveSource(sources[i])) return true;
        }
        return false;
      },
      keys() {
        const keys = [];
        for (let i = 0; i < sources.length; i++) keys.push(...Object.keys(resolveSource(sources[i])));
        return [...new Set(keys)];
      }
    }, propTraps);
  }
  const sourcesMap = {};
  const defined = Object.create(null);
  for (let i = sources.length - 1; i >= 0; i--) {
    const source = sources[i];
    if (!source) continue;
    const sourceKeys = Object.getOwnPropertyNames(source);
    for (let i = sourceKeys.length - 1; i >= 0; i--) {
      const key = sourceKeys[i];
      if (key === "__proto__" || key === "constructor") continue;
      const desc = Object.getOwnPropertyDescriptor(source, key);
      if (!defined[key]) {
        defined[key] = desc.get ? {
          enumerable: true,
          configurable: true,
          get: resolveSources.bind(sourcesMap[key] = [desc.get.bind(source)])
        } : desc.value !== undefined ? desc : undefined;
      } else {
        const sources = sourcesMap[key];
        if (sources) {
          if (desc.get) sources.push(desc.get.bind(source));else if (desc.value !== undefined) sources.push(() => desc.value);
        }
      }
    }
  }
  const target = {};
  const definedKeys = Object.keys(defined);
  for (let i = definedKeys.length - 1; i >= 0; i--) {
    const key = definedKeys[i],
      desc = defined[key];
    if (desc && desc.get) Object.defineProperty(target, key, desc);else target[key] = desc ? desc.value : undefined;
  }
  return target;
}
function splitProps(props, ...keys) {
  if ($PROXY in props) {
    const blocked = new Set(keys.length > 1 ? keys.flat() : keys[0]);
    const res = keys.map(k => {
      return new Proxy({
        get(property) {
          return k.includes(property) ? props[property] : undefined;
        },
        has(property) {
          return k.includes(property) && property in props;
        },
        keys() {
          return k.filter(property => property in props);
        }
      }, propTraps);
    });
    res.push(new Proxy({
      get(property) {
        return blocked.has(property) ? undefined : props[property];
      },
      has(property) {
        return blocked.has(property) ? false : property in props;
      },
      keys() {
        return Object.keys(props).filter(k => !blocked.has(k));
      }
    }, propTraps));
    return res;
  }
  const otherObject = {};
  const objects = keys.map(() => ({}));
  for (const propName of Object.getOwnPropertyNames(props)) {
    const desc = Object.getOwnPropertyDescriptor(props, propName);
    const isDefaultDesc = !desc.get && !desc.set && desc.enumerable && desc.writable && desc.configurable;
    let blocked = false;
    let objectIndex = 0;
    for (const k of keys) {
      if (k.includes(propName)) {
        blocked = true;
        isDefaultDesc ? objects[objectIndex][propName] = desc.value : Object.defineProperty(objects[objectIndex], propName, desc);
      }
      ++objectIndex;
    }
    if (!blocked) {
      isDefaultDesc ? otherObject[propName] = desc.value : Object.defineProperty(otherObject, propName, desc);
    }
  }
  return [...objects, otherObject];
}
function lazy(fn) {
  let comp;
  let p;
  const wrap = props => {
    const ctx = sharedConfig.context;
    if (ctx) {
      const [s, set] = createSignal();
      sharedConfig.count || (sharedConfig.count = 0);
      sharedConfig.count++;
      (p || (p = fn())).then(mod => {
        !sharedConfig.done && setHydrateContext(ctx);
        sharedConfig.count--;
        set(() => mod.default);
        setHydrateContext();
      });
      comp = s;
    } else if (!comp) {
      const [s] = createResource(() => (p || (p = fn())).then(mod => mod.default));
      comp = s;
    }
    let Comp;
    return createMemo(() => (Comp = comp()) ? untrack(() => {
      if (true) Object.assign(Comp, {
        [$DEVCOMP]: true
      });
      if (!ctx || sharedConfig.done) return Comp(props);
      const c = sharedConfig.context;
      setHydrateContext(ctx);
      const r = Comp(props);
      setHydrateContext(c);
      return r;
    }) : "");
  };
  wrap.preload = () => p || ((p = fn()).then(mod => comp = () => mod.default), p);
  return wrap;
}
let counter = 0;
function createUniqueId() {
  const ctx = sharedConfig.context;
  return ctx ? sharedConfig.getNextContextId() : `cl-${counter++}`;
}

const narrowedError = name => `Attempting to access a stale value from <${name}> that could possibly be undefined. This may occur because you are reading the accessor returned from the component at a time where it has already been unmounted. We recommend cleaning up any stale timers or async, or reading from the initial condition.` ;
function For(props) {
  const fallback = "fallback" in props && {
    fallback: () => props.fallback
  };
  return createMemo(mapArray(() => props.each, props.children, fallback || undefined), undefined, {
    name: "value"
  }) ;
}
function Index(props) {
  const fallback = "fallback" in props && {
    fallback: () => props.fallback
  };
  return createMemo(indexArray(() => props.each, props.children, fallback || undefined), undefined, {
    name: "value"
  }) ;
}
function Show(props) {
  const keyed = props.keyed;
  const condition = createMemo(() => props.when, undefined, {
    equals: (a, b) => keyed ? a === b : !a === !b,
    name: "condition"
  } );
  return createMemo(() => {
    const c = condition();
    if (c) {
      const child = props.children;
      const fn = typeof child === "function" && child.length > 0;
      return fn ? untrack(() => child(keyed ? c : () => {
        if (!untrack(condition)) throw narrowedError("Show");
        return props.when;
      })) : child;
    }
    return props.fallback;
  }, undefined, {
    name: "value"
  } );
}
function Switch(props) {
  let keyed = false;
  const equals = (a, b) => (keyed ? a[1] === b[1] : !a[1] === !b[1]) && a[2] === b[2];
  const conditions = children(() => props.children),
    evalConditions = createMemo(() => {
      let conds = conditions();
      if (!Array.isArray(conds)) conds = [conds];
      for (let i = 0; i < conds.length; i++) {
        const c = conds[i].when;
        if (c) {
          keyed = !!conds[i].keyed;
          return [i, c, conds[i]];
        }
      }
      return [-1];
    }, undefined, {
      equals,
      name: "eval conditions"
    } );
  return createMemo(() => {
    const [index, when, cond] = evalConditions();
    if (index < 0) return props.fallback;
    const c = cond.children;
    const fn = typeof c === "function" && c.length > 0;
    return fn ? untrack(() => c(keyed ? when : () => {
      if (untrack(evalConditions)[0] !== index) throw narrowedError("Match");
      return cond.when;
    })) : c;
  }, undefined, {
    name: "value"
  } );
}
function Match(props) {
  return props;
}
let Errors;
function resetErrorBoundaries() {
  Errors && [...Errors].forEach(fn => fn());
}
function ErrorBoundary(props) {
  let err;
  if (sharedConfig.context && sharedConfig.load) err = sharedConfig.load(sharedConfig.getContextId());
  const [errored, setErrored] = createSignal(err, {
    name: "errored"
  } );
  Errors || (Errors = new Set());
  Errors.add(setErrored);
  onCleanup(() => Errors.delete(setErrored));
  return createMemo(() => {
    let e;
    if (e = errored()) {
      const f = props.fallback;
      if ((typeof f !== "function" || f.length == 0)) console.error(e);
      return typeof f === "function" && f.length ? untrack(() => f(e, () => setErrored())) : f;
    }
    return catchError(() => props.children, setErrored);
  }, undefined, {
    name: "value"
  } );
}

const suspenseListEquals = (a, b) => a.showContent === b.showContent && a.showFallback === b.showFallback;
const SuspenseListContext = /* #__PURE__ */createContext();
function SuspenseList(props) {
  let [wrapper, setWrapper] = createSignal(() => ({
      inFallback: false
    })),
    show;
  const listContext = useContext(SuspenseListContext);
  const [registry, setRegistry] = createSignal([]);
  if (listContext) {
    show = listContext.register(createMemo(() => wrapper()().inFallback));
  }
  const resolved = createMemo(prev => {
    const reveal = props.revealOrder,
      tail = props.tail,
      {
        showContent = true,
        showFallback = true
      } = show ? show() : {},
      reg = registry(),
      reverse = reveal === "backwards";
    if (reveal === "together") {
      const all = reg.every(inFallback => !inFallback());
      const res = reg.map(() => ({
        showContent: all && showContent,
        showFallback
      }));
      res.inFallback = !all;
      return res;
    }
    let stop = false;
    let inFallback = prev.inFallback;
    const res = [];
    for (let i = 0, len = reg.length; i < len; i++) {
      const n = reverse ? len - i - 1 : i,
        s = reg[n]();
      if (!stop && !s) {
        res[n] = {
          showContent,
          showFallback
        };
      } else {
        const next = !stop;
        if (next) inFallback = true;
        res[n] = {
          showContent: next,
          showFallback: !tail || next && tail === "collapsed" ? showFallback : false
        };
        stop = true;
      }
    }
    if (!stop) inFallback = false;
    res.inFallback = inFallback;
    return res;
  }, {
    inFallback: false
  });
  setWrapper(() => resolved);
  return createComponent(SuspenseListContext.Provider, {
    value: {
      register: inFallback => {
        let index;
        setRegistry(registry => {
          index = registry.length;
          return [...registry, inFallback];
        });
        return createMemo(() => resolved()[index], undefined, {
          equals: suspenseListEquals
        });
      }
    },
    get children() {
      return props.children;
    }
  });
}
function Suspense(props) {
  let counter = 0,
    show,
    ctx,
    p,
    flicker,
    error;
  const [inFallback, setFallback] = createSignal(false),
    SuspenseContext = getSuspenseContext(),
    store = {
      increment: () => {
        if (++counter === 1) setFallback(true);
      },
      decrement: () => {
        if (--counter === 0) setFallback(false);
      },
      inFallback,
      effects: [],
      resolved: false
    },
    owner = getOwner();
  if (sharedConfig.context && sharedConfig.load) {
    const key = sharedConfig.getContextId();
    let ref = sharedConfig.load(key);
    if (ref) {
      if (typeof ref !== "object" || ref.status !== "success") p = ref;else sharedConfig.gather(key);
    }
    if (p && p !== "$$f") {
      const [s, set] = createSignal(undefined, {
        equals: false
      });
      flicker = s;
      p.then(() => {
        if (sharedConfig.done) return set();
        sharedConfig.gather(key);
        setHydrateContext(ctx);
        set();
        setHydrateContext();
      }, err => {
        error = err;
        set();
      });
    }
  }
  const listContext = useContext(SuspenseListContext);
  if (listContext) show = listContext.register(store.inFallback);
  let dispose;
  onCleanup(() => dispose && dispose());
  return createComponent(SuspenseContext.Provider, {
    value: store,
    get children() {
      return createMemo(() => {
        if (error) throw error;
        ctx = sharedConfig.context;
        if (flicker) {
          flicker();
          return flicker = undefined;
        }
        if (ctx && p === "$$f") setHydrateContext();
        const rendered = createMemo(() => props.children);
        return createMemo(prev => {
          const inFallback = store.inFallback(),
            {
              showContent = true,
              showFallback = true
            } = show ? show() : {};
          if ((!inFallback || p && p !== "$$f") && showContent) {
            store.resolved = true;
            dispose && dispose();
            dispose = ctx = p = undefined;
            resumeEffects(store.effects);
            return rendered();
          }
          if (!showFallback) return;
          if (dispose) return prev;
          return createRoot(disposer => {
            dispose = disposer;
            if (ctx) {
              setHydrateContext({
                id: ctx.id + "F",
                count: 0
              });
              ctx = undefined;
            }
            return props.fallback;
          }, owner);
        });
      });
    }
  });
}

const DEV = {
  hooks: DevHooks,
  writeSignal,
  registerGraph
} ;
if (globalThis) {
  if (!globalThis.Solid$$) globalThis.Solid$$ = true;else console.warn("You appear to have multiple instances of Solid. This can lead to unexpected behavior.");
}




/***/ }),

/***/ "./node_modules/solid-js/web/dist/dev.js":
/*!***********************************************!*\
  !*** ./node_modules/solid-js/web/dist/dev.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Aliases: () => (/* binding */ Aliases),
/* harmony export */   Assets: () => (/* binding */ voidFn),
/* harmony export */   ChildProperties: () => (/* binding */ ChildProperties),
/* harmony export */   DOMElements: () => (/* binding */ DOMElements),
/* harmony export */   DelegatedEvents: () => (/* binding */ DelegatedEvents),
/* harmony export */   Dynamic: () => (/* binding */ Dynamic),
/* harmony export */   ErrorBoundary: () => (/* reexport safe */ solid_js__WEBPACK_IMPORTED_MODULE_0__.ErrorBoundary),
/* harmony export */   For: () => (/* reexport safe */ solid_js__WEBPACK_IMPORTED_MODULE_0__.For),
/* harmony export */   Hydration: () => (/* binding */ Hydration),
/* harmony export */   HydrationScript: () => (/* binding */ voidFn),
/* harmony export */   Index: () => (/* reexport safe */ solid_js__WEBPACK_IMPORTED_MODULE_0__.Index),
/* harmony export */   Match: () => (/* reexport safe */ solid_js__WEBPACK_IMPORTED_MODULE_0__.Match),
/* harmony export */   NoHydration: () => (/* binding */ NoHydration),
/* harmony export */   Portal: () => (/* binding */ Portal),
/* harmony export */   Properties: () => (/* binding */ Properties),
/* harmony export */   RequestContext: () => (/* binding */ RequestContext),
/* harmony export */   SVGElements: () => (/* binding */ SVGElements),
/* harmony export */   SVGNamespace: () => (/* binding */ SVGNamespace),
/* harmony export */   Show: () => (/* reexport safe */ solid_js__WEBPACK_IMPORTED_MODULE_0__.Show),
/* harmony export */   Suspense: () => (/* reexport safe */ solid_js__WEBPACK_IMPORTED_MODULE_0__.Suspense),
/* harmony export */   SuspenseList: () => (/* reexport safe */ solid_js__WEBPACK_IMPORTED_MODULE_0__.SuspenseList),
/* harmony export */   Switch: () => (/* reexport safe */ solid_js__WEBPACK_IMPORTED_MODULE_0__.Switch),
/* harmony export */   addEventListener: () => (/* binding */ addEventListener),
/* harmony export */   assign: () => (/* binding */ assign),
/* harmony export */   classList: () => (/* binding */ classList),
/* harmony export */   className: () => (/* binding */ className),
/* harmony export */   clearDelegatedEvents: () => (/* binding */ clearDelegatedEvents),
/* harmony export */   createComponent: () => (/* reexport safe */ solid_js__WEBPACK_IMPORTED_MODULE_0__.createComponent),
/* harmony export */   delegateEvents: () => (/* binding */ delegateEvents),
/* harmony export */   dynamicProperty: () => (/* binding */ dynamicProperty),
/* harmony export */   effect: () => (/* reexport safe */ solid_js__WEBPACK_IMPORTED_MODULE_0__.createRenderEffect),
/* harmony export */   escape: () => (/* binding */ escape),
/* harmony export */   generateHydrationScript: () => (/* binding */ voidFn),
/* harmony export */   getAssets: () => (/* binding */ voidFn),
/* harmony export */   getHydrationKey: () => (/* binding */ getHydrationKey),
/* harmony export */   getNextElement: () => (/* binding */ getNextElement),
/* harmony export */   getNextMarker: () => (/* binding */ getNextMarker),
/* harmony export */   getNextMatch: () => (/* binding */ getNextMatch),
/* harmony export */   getOwner: () => (/* reexport safe */ solid_js__WEBPACK_IMPORTED_MODULE_0__.getOwner),
/* harmony export */   getPropAlias: () => (/* binding */ getPropAlias),
/* harmony export */   getRequestEvent: () => (/* binding */ voidFn),
/* harmony export */   hydrate: () => (/* binding */ hydrate),
/* harmony export */   innerHTML: () => (/* binding */ innerHTML),
/* harmony export */   insert: () => (/* binding */ insert),
/* harmony export */   isDev: () => (/* binding */ isDev),
/* harmony export */   isServer: () => (/* binding */ isServer),
/* harmony export */   memo: () => (/* reexport safe */ solid_js__WEBPACK_IMPORTED_MODULE_0__.createMemo),
/* harmony export */   mergeProps: () => (/* reexport safe */ solid_js__WEBPACK_IMPORTED_MODULE_0__.mergeProps),
/* harmony export */   render: () => (/* binding */ render),
/* harmony export */   renderToStream: () => (/* binding */ renderToStream),
/* harmony export */   renderToString: () => (/* binding */ renderToString),
/* harmony export */   renderToStringAsync: () => (/* binding */ renderToStringAsync),
/* harmony export */   resolveSSRNode: () => (/* binding */ resolveSSRNode),
/* harmony export */   runHydrationEvents: () => (/* binding */ runHydrationEvents),
/* harmony export */   setAttribute: () => (/* binding */ setAttribute),
/* harmony export */   setAttributeNS: () => (/* binding */ setAttributeNS),
/* harmony export */   setProperty: () => (/* binding */ setProperty),
/* harmony export */   spread: () => (/* binding */ spread),
/* harmony export */   ssr: () => (/* binding */ ssr),
/* harmony export */   ssrAttribute: () => (/* binding */ ssrAttribute),
/* harmony export */   ssrClassList: () => (/* binding */ ssrClassList),
/* harmony export */   ssrElement: () => (/* binding */ ssrElement),
/* harmony export */   ssrHydrationKey: () => (/* binding */ ssrHydrationKey),
/* harmony export */   ssrSpread: () => (/* binding */ ssrSpread),
/* harmony export */   ssrStyle: () => (/* binding */ ssrStyle),
/* harmony export */   style: () => (/* binding */ style),
/* harmony export */   template: () => (/* binding */ template),
/* harmony export */   untrack: () => (/* reexport safe */ solid_js__WEBPACK_IMPORTED_MODULE_0__.untrack),
/* harmony export */   use: () => (/* binding */ use),
/* harmony export */   useAssets: () => (/* binding */ voidFn)
/* harmony export */ });
/* harmony import */ var solid_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! solid-js */ "./node_modules/solid-js/dist/dev.js");



const booleans = ["allowfullscreen", "async", "autofocus", "autoplay", "checked", "controls", "default", "disabled", "formnovalidate", "hidden", "indeterminate", "inert", "ismap", "loop", "multiple", "muted", "nomodule", "novalidate", "open", "playsinline", "readonly", "required", "reversed", "seamless", "selected"];
const Properties = /*#__PURE__*/new Set(["className", "value", "readOnly", "formNoValidate", "isMap", "noModule", "playsInline", ...booleans]);
const ChildProperties = /*#__PURE__*/new Set(["innerHTML", "textContent", "innerText", "children"]);
const Aliases = /*#__PURE__*/Object.assign(Object.create(null), {
  className: "class",
  htmlFor: "for"
});
const PropAliases = /*#__PURE__*/Object.assign(Object.create(null), {
  class: "className",
  formnovalidate: {
    $: "formNoValidate",
    BUTTON: 1,
    INPUT: 1
  },
  ismap: {
    $: "isMap",
    IMG: 1
  },
  nomodule: {
    $: "noModule",
    SCRIPT: 1
  },
  playsinline: {
    $: "playsInline",
    VIDEO: 1
  },
  readonly: {
    $: "readOnly",
    INPUT: 1,
    TEXTAREA: 1
  }
});
function getPropAlias(prop, tagName) {
  const a = PropAliases[prop];
  return typeof a === "object" ? a[tagName] ? a["$"] : undefined : a;
}
const DelegatedEvents = /*#__PURE__*/new Set(["beforeinput", "click", "dblclick", "contextmenu", "focusin", "focusout", "input", "keydown", "keyup", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup", "pointerdown", "pointermove", "pointerout", "pointerover", "pointerup", "touchend", "touchmove", "touchstart"]);
const SVGElements = /*#__PURE__*/new Set([
"altGlyph", "altGlyphDef", "altGlyphItem", "animate", "animateColor", "animateMotion", "animateTransform", "circle", "clipPath", "color-profile", "cursor", "defs", "desc", "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence", "filter", "font", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignObject", "g", "glyph", "glyphRef", "hkern", "image", "line", "linearGradient", "marker", "mask", "metadata", "missing-glyph", "mpath", "path", "pattern", "polygon", "polyline", "radialGradient", "rect",
"set", "stop",
"svg", "switch", "symbol", "text", "textPath",
"tref", "tspan", "use", "view", "vkern"]);
const SVGNamespace = {
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace"
};
const DOMElements = /*#__PURE__*/new Set(["html", "base", "head", "link", "meta", "style", "title", "body", "address", "article", "aside", "footer", "header", "main", "nav", "section", "body", "blockquote", "dd", "div", "dl", "dt", "figcaption", "figure", "hr", "li", "ol", "p", "pre", "ul", "a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn", "em", "i", "kbd", "mark", "q", "rp", "rt", "ruby", "s", "samp", "small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr", "area", "audio", "img", "map", "track", "video", "embed", "iframe", "object", "param", "picture", "portal", "source", "svg", "math", "canvas", "noscript", "script", "del", "ins", "caption", "col", "colgroup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "button", "datalist", "fieldset", "form", "input", "label", "legend", "meter", "optgroup", "option", "output", "progress", "select", "textarea", "details", "dialog", "menu", "summary", "details", "slot", "template", "acronym", "applet", "basefont", "bgsound", "big", "blink", "center", "content", "dir", "font", "frame", "frameset", "hgroup", "image", "keygen", "marquee", "menuitem", "nobr", "noembed", "noframes", "plaintext", "rb", "rtc", "shadow", "spacer", "strike", "tt", "xmp", "a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "bgsound", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "head", "header", "hgroup", "hr", "html", "i", "iframe", "image", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "main", "map", "mark", "marquee", "menu", "menuitem", "meta", "meter", "nav", "nobr", "noembed", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "plaintext", "portal", "pre", "progress", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp", "script", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr", "xmp", "input", "h1", "h2", "h3", "h4", "h5", "h6"]);

function reconcileArrays(parentNode, a, b) {
  let bLength = b.length,
    aEnd = a.length,
    bEnd = bLength,
    aStart = 0,
    bStart = 0,
    after = a[aEnd - 1].nextSibling,
    map = null;
  while (aStart < aEnd || bStart < bEnd) {
    if (a[aStart] === b[bStart]) {
      aStart++;
      bStart++;
      continue;
    }
    while (a[aEnd - 1] === b[bEnd - 1]) {
      aEnd--;
      bEnd--;
    }
    if (aEnd === aStart) {
      const node = bEnd < bLength ? bStart ? b[bStart - 1].nextSibling : b[bEnd - bStart] : after;
      while (bStart < bEnd) parentNode.insertBefore(b[bStart++], node);
    } else if (bEnd === bStart) {
      while (aStart < aEnd) {
        if (!map || !map.has(a[aStart])) a[aStart].remove();
        aStart++;
      }
    } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
      const node = a[--aEnd].nextSibling;
      parentNode.insertBefore(b[bStart++], a[aStart++].nextSibling);
      parentNode.insertBefore(b[--bEnd], node);
      a[aEnd] = b[bEnd];
    } else {
      if (!map) {
        map = new Map();
        let i = bStart;
        while (i < bEnd) map.set(b[i], i++);
      }
      const index = map.get(a[aStart]);
      if (index != null) {
        if (bStart < index && index < bEnd) {
          let i = aStart,
            sequence = 1,
            t;
          while (++i < aEnd && i < bEnd) {
            if ((t = map.get(a[i])) == null || t !== index + sequence) break;
            sequence++;
          }
          if (sequence > index - bStart) {
            const node = a[aStart];
            while (bStart < index) parentNode.insertBefore(b[bStart++], node);
          } else parentNode.replaceChild(b[bStart++], a[aStart++]);
        } else aStart++;
      } else a[aStart++].remove();
    }
  }
}

const $$EVENTS = "_$DX_DELEGATE";
function render(code, element, init, options = {}) {
  if (!element) {
    throw new Error("The `element` passed to `render(..., element)` doesn't exist. Make sure `element` exists in the document.");
  }
  let disposer;
  (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.createRoot)(dispose => {
    disposer = dispose;
    element === document ? code() : insert(element, code(), element.firstChild ? null : undefined, init);
  }, options.owner);
  return () => {
    disposer();
    element.textContent = "";
  };
}
function template(html, isCE, isSVG) {
  let node;
  const create = () => {
    if (isHydrating()) throw new Error("Failed attempt to create new DOM elements during hydration. Check that the libraries you are using support hydration.");
    const t = document.createElement("template");
    t.innerHTML = html;
    return isSVG ? t.content.firstChild.firstChild : t.content.firstChild;
  };
  const fn = isCE ? () => (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.untrack)(() => document.importNode(node || (node = create()), true)) : () => (node || (node = create())).cloneNode(true);
  fn.cloneNode = fn;
  return fn;
}
function delegateEvents(eventNames, document = window.document) {
  const e = document[$$EVENTS] || (document[$$EVENTS] = new Set());
  for (let i = 0, l = eventNames.length; i < l; i++) {
    const name = eventNames[i];
    if (!e.has(name)) {
      e.add(name);
      document.addEventListener(name, eventHandler);
    }
  }
}
function clearDelegatedEvents(document = window.document) {
  if (document[$$EVENTS]) {
    for (let name of document[$$EVENTS].keys()) document.removeEventListener(name, eventHandler);
    delete document[$$EVENTS];
  }
}
function setProperty(node, name, value) {
  if (isHydrating(node)) return;
  node[name] = value;
}
function setAttribute(node, name, value) {
  if (isHydrating(node)) return;
  if (value == null) node.removeAttribute(name);else node.setAttribute(name, value);
}
function setAttributeNS(node, namespace, name, value) {
  if (isHydrating(node)) return;
  if (value == null) node.removeAttributeNS(namespace, name);else node.setAttributeNS(namespace, name, value);
}
function className(node, value) {
  if (isHydrating(node)) return;
  if (value == null) node.removeAttribute("class");else node.className = value;
}
function addEventListener(node, name, handler, delegate) {
  if (delegate) {
    if (Array.isArray(handler)) {
      node[`$$${name}`] = handler[0];
      node[`$$${name}Data`] = handler[1];
    } else node[`$$${name}`] = handler;
  } else if (Array.isArray(handler)) {
    const handlerFn = handler[0];
    node.addEventListener(name, handler[0] = e => handlerFn.call(node, handler[1], e));
  } else node.addEventListener(name, handler);
}
function classList(node, value, prev = {}) {
  const classKeys = Object.keys(value || {}),
    prevKeys = Object.keys(prev);
  let i, len;
  for (i = 0, len = prevKeys.length; i < len; i++) {
    const key = prevKeys[i];
    if (!key || key === "undefined" || value[key]) continue;
    toggleClassKey(node, key, false);
    delete prev[key];
  }
  for (i = 0, len = classKeys.length; i < len; i++) {
    const key = classKeys[i],
      classValue = !!value[key];
    if (!key || key === "undefined" || prev[key] === classValue || !classValue) continue;
    toggleClassKey(node, key, true);
    prev[key] = classValue;
  }
  return prev;
}
function style(node, value, prev) {
  if (!value) return prev ? setAttribute(node, "style") : value;
  const nodeStyle = node.style;
  if (typeof value === "string") return nodeStyle.cssText = value;
  typeof prev === "string" && (nodeStyle.cssText = prev = undefined);
  prev || (prev = {});
  value || (value = {});
  let v, s;
  for (s in prev) {
    value[s] == null && nodeStyle.removeProperty(s);
    delete prev[s];
  }
  for (s in value) {
    v = value[s];
    if (v !== prev[s]) {
      nodeStyle.setProperty(s, v);
      prev[s] = v;
    }
  }
  return prev;
}
function spread(node, props = {}, isSVG, skipChildren) {
  const prevProps = {};
  if (!skipChildren) {
    (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.createRenderEffect)(() => prevProps.children = insertExpression(node, props.children, prevProps.children));
  }
  (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.createRenderEffect)(() => typeof props.ref === "function" && use(props.ref, node));
  (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.createRenderEffect)(() => assign(node, props, isSVG, true, prevProps, true));
  return prevProps;
}
function dynamicProperty(props, key) {
  const src = props[key];
  Object.defineProperty(props, key, {
    get() {
      return src();
    },
    enumerable: true
  });
  return props;
}
function use(fn, element, arg) {
  return (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.untrack)(() => fn(element, arg));
}
function insert(parent, accessor, marker, initial) {
  if (marker !== undefined && !initial) initial = [];
  if (typeof accessor !== "function") return insertExpression(parent, accessor, initial, marker);
  (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.createRenderEffect)(current => insertExpression(parent, accessor(), current, marker), initial);
}
function assign(node, props, isSVG, skipChildren, prevProps = {}, skipRef = false) {
  props || (props = {});
  for (const prop in prevProps) {
    if (!(prop in props)) {
      if (prop === "children") continue;
      prevProps[prop] = assignProp(node, prop, null, prevProps[prop], isSVG, skipRef);
    }
  }
  for (const prop in props) {
    if (prop === "children") {
      if (!skipChildren) insertExpression(node, props.children);
      continue;
    }
    const value = props[prop];
    prevProps[prop] = assignProp(node, prop, value, prevProps[prop], isSVG, skipRef);
  }
}
function hydrate$1(code, element, options = {}) {
  if (globalThis._$HY.done) return render(code, element, [...element.childNodes], options);
  solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.completed = globalThis._$HY.completed;
  solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.events = globalThis._$HY.events;
  solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.load = id => globalThis._$HY.r[id];
  solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.has = id => id in globalThis._$HY.r;
  solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.gather = root => gatherHydratable(element, root);
  solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.registry = new Map();
  solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.context = {
    id: options.renderId || "",
    count: 0
  };
  try {
    gatherHydratable(element, options.renderId);
    return render(code, element, [...element.childNodes], options);
  } finally {
    solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.context = null;
  }
}
function getNextElement(template) {
  let node,
    key,
    hydrating = isHydrating();
  if (!hydrating || !(node = solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.registry.get(key = getHydrationKey()))) {
    if (hydrating) throw new Error(`Hydration Mismatch. Unable to find DOM nodes for hydration key: ${key}`);
    return template();
  }
  if (solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.completed) solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.completed.add(node);
  solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.registry.delete(key);
  return node;
}
function getNextMatch(el, nodeName) {
  while (el && el.localName !== nodeName) el = el.nextSibling;
  return el;
}
function getNextMarker(start) {
  let end = start,
    count = 0,
    current = [];
  if (isHydrating(start)) {
    while (end) {
      if (end.nodeType === 8) {
        const v = end.nodeValue;
        if (v === "$") count++;else if (v === "/") {
          if (count === 0) return [end, current];
          count--;
        }
      }
      current.push(end);
      end = end.nextSibling;
    }
  }
  return [end, current];
}
function runHydrationEvents() {
  if (solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.events && !solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.events.queued) {
    queueMicrotask(() => {
      const {
        completed,
        events
      } = solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig;
      events.queued = false;
      while (events.length) {
        const [el, e] = events[0];
        if (!completed.has(el)) return;
        events.shift();
        eventHandler(e);
      }
      if (solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.done) {
        solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.events = _$HY.events = null;
        solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.completed = _$HY.completed = null;
      }
    });
    solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.events.queued = true;
  }
}
function isHydrating(node) {
  return !!solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.context && !solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.done && (!node || node.isConnected);
}
function toPropertyName(name) {
  return name.toLowerCase().replace(/-([a-z])/g, (_, w) => w.toUpperCase());
}
function toggleClassKey(node, key, value) {
  const classNames = key.trim().split(/\s+/);
  for (let i = 0, nameLen = classNames.length; i < nameLen; i++) node.classList.toggle(classNames[i], value);
}
function assignProp(node, prop, value, prev, isSVG, skipRef) {
  let isCE, isProp, isChildProp, propAlias, forceProp;
  if (prop === "style") return style(node, value, prev);
  if (prop === "classList") return classList(node, value, prev);
  if (value === prev) return prev;
  if (prop === "ref") {
    if (!skipRef) value(node);
  } else if (prop.slice(0, 3) === "on:") {
    const e = prop.slice(3);
    prev && node.removeEventListener(e, prev);
    value && node.addEventListener(e, value);
  } else if (prop.slice(0, 10) === "oncapture:") {
    const e = prop.slice(10);
    prev && node.removeEventListener(e, prev, true);
    value && node.addEventListener(e, value, true);
  } else if (prop.slice(0, 2) === "on") {
    const name = prop.slice(2).toLowerCase();
    const delegate = DelegatedEvents.has(name);
    if (!delegate && prev) {
      const h = Array.isArray(prev) ? prev[0] : prev;
      node.removeEventListener(name, h);
    }
    if (delegate || value) {
      addEventListener(node, name, value, delegate);
      delegate && delegateEvents([name]);
    }
  } else if (prop.slice(0, 5) === "attr:") {
    setAttribute(node, prop.slice(5), value);
  } else if ((forceProp = prop.slice(0, 5) === "prop:") || (isChildProp = ChildProperties.has(prop)) || !isSVG && ((propAlias = getPropAlias(prop, node.tagName)) || (isProp = Properties.has(prop))) || (isCE = node.nodeName.includes("-"))) {
    if (forceProp) {
      prop = prop.slice(5);
      isProp = true;
    } else if (isHydrating(node)) return value;
    if (prop === "class" || prop === "className") className(node, value);else if (isCE && !isProp && !isChildProp) node[toPropertyName(prop)] = value;else node[propAlias || prop] = value;
  } else {
    const ns = isSVG && prop.indexOf(":") > -1 && SVGNamespace[prop.split(":")[0]];
    if (ns) setAttributeNS(node, ns, prop, value);else setAttribute(node, Aliases[prop] || prop, value);
  }
  return value;
}
function eventHandler(e) {
  if (solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.registry && solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.events) {
    if (solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.events.find(([el, ev]) => ev === e)) return;
  }
  const key = `$$${e.type}`;
  let node = e.composedPath && e.composedPath()[0] || e.target;
  if (e.target !== node) {
    Object.defineProperty(e, "target", {
      configurable: true,
      value: node
    });
  }
  Object.defineProperty(e, "currentTarget", {
    configurable: true,
    get() {
      return node || document;
    }
  });
  if (solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.registry && !solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.done) solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.done = _$HY.done = true;
  while (node) {
    const handler = node[key];
    if (handler && !node.disabled) {
      const data = node[`${key}Data`];
      data !== undefined ? handler.call(node, data, e) : handler.call(node, e);
      if (e.cancelBubble) return;
    }
    node = node._$host || node.parentNode || node.host;
  }
}
function insertExpression(parent, value, current, marker, unwrapArray) {
  const hydrating = isHydrating(parent);
  if (hydrating) {
    !current && (current = [...parent.childNodes]);
    let cleaned = [];
    for (let i = 0; i < current.length; i++) {
      const node = current[i];
      if (node.nodeType === 8 && node.data.slice(0, 2) === "!$") node.remove();else cleaned.push(node);
    }
    current = cleaned;
  }
  while (typeof current === "function") current = current();
  if (value === current) return current;
  const t = typeof value,
    multi = marker !== undefined;
  parent = multi && current[0] && current[0].parentNode || parent;
  if (t === "string" || t === "number") {
    if (hydrating) return current;
    if (t === "number") {
      value = value.toString();
      if (value === current) return current;
    }
    if (multi) {
      let node = current[0];
      if (node && node.nodeType === 3) {
        node.data !== value && (node.data = value);
      } else node = document.createTextNode(value);
      current = cleanChildren(parent, current, marker, node);
    } else {
      if (current !== "" && typeof current === "string") {
        current = parent.firstChild.data = value;
      } else current = parent.textContent = value;
    }
  } else if (value == null || t === "boolean") {
    if (hydrating) return current;
    current = cleanChildren(parent, current, marker);
  } else if (t === "function") {
    (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.createRenderEffect)(() => {
      let v = value();
      while (typeof v === "function") v = v();
      current = insertExpression(parent, v, current, marker);
    });
    return () => current;
  } else if (Array.isArray(value)) {
    const array = [];
    const currentArray = current && Array.isArray(current);
    if (normalizeIncomingArray(array, value, current, unwrapArray)) {
      (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.createRenderEffect)(() => current = insertExpression(parent, array, current, marker, true));
      return () => current;
    }
    if (hydrating) {
      if (!array.length) return current;
      if (marker === undefined) return current = [...parent.childNodes];
      let node = array[0];
      if (node.parentNode !== parent) return current;
      const nodes = [node];
      while ((node = node.nextSibling) !== marker) nodes.push(node);
      return current = nodes;
    }
    if (array.length === 0) {
      current = cleanChildren(parent, current, marker);
      if (multi) return current;
    } else if (currentArray) {
      if (current.length === 0) {
        appendNodes(parent, array, marker);
      } else reconcileArrays(parent, current, array);
    } else {
      current && cleanChildren(parent);
      appendNodes(parent, array);
    }
    current = array;
  } else if (value.nodeType) {
    if (hydrating && value.parentNode) return current = multi ? [value] : value;
    if (Array.isArray(current)) {
      if (multi) return current = cleanChildren(parent, current, marker, value);
      cleanChildren(parent, current, null, value);
    } else if (current == null || current === "" || !parent.firstChild) {
      parent.appendChild(value);
    } else parent.replaceChild(value, parent.firstChild);
    current = value;
  } else console.warn(`Unrecognized value. Skipped inserting`, value);
  return current;
}
function normalizeIncomingArray(normalized, array, current, unwrap) {
  let dynamic = false;
  for (let i = 0, len = array.length; i < len; i++) {
    let item = array[i],
      prev = current && current[normalized.length],
      t;
    if (item == null || item === true || item === false) ; else if ((t = typeof item) === "object" && item.nodeType) {
      normalized.push(item);
    } else if (Array.isArray(item)) {
      dynamic = normalizeIncomingArray(normalized, item, prev) || dynamic;
    } else if (t === "function") {
      if (unwrap) {
        while (typeof item === "function") item = item();
        dynamic = normalizeIncomingArray(normalized, Array.isArray(item) ? item : [item], Array.isArray(prev) ? prev : [prev]) || dynamic;
      } else {
        normalized.push(item);
        dynamic = true;
      }
    } else {
      const value = String(item);
      if (prev && prev.nodeType === 3 && prev.data === value) normalized.push(prev);else normalized.push(document.createTextNode(value));
    }
  }
  return dynamic;
}
function appendNodes(parent, array, marker = null) {
  for (let i = 0, len = array.length; i < len; i++) parent.insertBefore(array[i], marker);
}
function cleanChildren(parent, current, marker, replacement) {
  if (marker === undefined) return parent.textContent = "";
  const node = replacement || document.createTextNode("");
  if (current.length) {
    let inserted = false;
    for (let i = current.length - 1; i >= 0; i--) {
      const el = current[i];
      if (node !== el) {
        const isParent = el.parentNode === parent;
        if (!inserted && !i) isParent ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);else isParent && el.remove();
      } else inserted = true;
    }
  } else parent.insertBefore(node, marker);
  return [node];
}
function gatherHydratable(element, root) {
  const templates = element.querySelectorAll(`*[data-hk]`);
  for (let i = 0; i < templates.length; i++) {
    const node = templates[i];
    const key = node.getAttribute("data-hk");
    if ((!root || key.startsWith(root)) && !solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.registry.has(key)) solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.registry.set(key, node);
  }
}
function getHydrationKey() {
  return solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.getNextContextId();
}
function NoHydration(props) {
  return solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.context ? undefined : props.children;
}
function Hydration(props) {
  return props.children;
}
const voidFn = () => undefined;
const RequestContext = Symbol();
function innerHTML(parent, content) {
  !solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.context && (parent.innerHTML = content);
}

function throwInBrowser(func) {
  const err = new Error(`${func.name} is not supported in the browser, returning undefined`);
  console.error(err);
}
function renderToString(fn, options) {
  throwInBrowser(renderToString);
}
function renderToStringAsync(fn, options) {
  throwInBrowser(renderToStringAsync);
}
function renderToStream(fn, options) {
  throwInBrowser(renderToStream);
}
function ssr(template, ...nodes) {}
function ssrElement(name, props, children, needsId) {}
function ssrClassList(value) {}
function ssrStyle(value) {}
function ssrAttribute(key, value) {}
function ssrHydrationKey() {}
function resolveSSRNode(node) {}
function escape(html) {}
function ssrSpread(props, isSVG, skipChildren) {}

const isServer = false;
const isDev = true;
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
function createElement(tagName, isSVG = false) {
  return isSVG ? document.createElementNS(SVG_NAMESPACE, tagName) : document.createElement(tagName);
}
const hydrate = (...args) => {
  (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.enableHydration)();
  return hydrate$1(...args);
};
function Portal(props) {
  const {
      useShadow
    } = props,
    marker = document.createTextNode(""),
    mount = () => props.mount || document.body,
    owner = (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.getOwner)();
  let content;
  let hydrating = !!solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.context;
  (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.createEffect)(() => {
    if (hydrating) (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.getOwner)().user = hydrating = false;
    content || (content = (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.runWithOwner)(owner, () => (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.createMemo)(() => props.children)));
    const el = mount();
    if (el instanceof HTMLHeadElement) {
      const [clean, setClean] = (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.createSignal)(false);
      const cleanup = () => setClean(true);
      (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.createRoot)(dispose => insert(el, () => !clean() ? content() : dispose(), null));
      (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.onCleanup)(cleanup);
    } else {
      const container = createElement(props.isSVG ? "g" : "div", props.isSVG),
        renderRoot = useShadow && container.attachShadow ? container.attachShadow({
          mode: "open"
        }) : container;
      Object.defineProperty(container, "_$host", {
        get() {
          return marker.parentNode;
        },
        configurable: true
      });
      insert(renderRoot, content);
      el.appendChild(container);
      props.ref && props.ref(container);
      (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.onCleanup)(() => el.removeChild(container));
    }
  }, undefined, {
    render: !hydrating
  });
  return marker;
}
function Dynamic(props) {
  const [p, others] = (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.splitProps)(props, ["component"]);
  const cached = (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.createMemo)(() => p.component);
  return (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.createMemo)(() => {
    const component = cached();
    switch (typeof component) {
      case "function":
        Object.assign(component, {
          [solid_js__WEBPACK_IMPORTED_MODULE_0__.$DEVCOMP]: true
        });
        return (0,solid_js__WEBPACK_IMPORTED_MODULE_0__.untrack)(() => component(others));
      case "string":
        const isSvg = SVGElements.has(component);
        const el = solid_js__WEBPACK_IMPORTED_MODULE_0__.sharedConfig.context ? getNextElement() : createElement(component, isSvg);
        spread(el, others, isSvg);
        return el;
    }
  });
}




/***/ }),

/***/ "./node_modules/solid-styled-components/src/index.js":
/*!***********************************************************!*\
  !*** ./node_modules/solid-styled-components/src/index.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ThemeProvider: () => (/* binding */ ThemeProvider),
/* harmony export */   createGlobalStyles: () => (/* binding */ createGlobalStyles),
/* harmony export */   css: () => (/* reexport safe */ goober__WEBPACK_IMPORTED_MODULE_0__.css),
/* harmony export */   extractCss: () => (/* reexport safe */ goober__WEBPACK_IMPORTED_MODULE_0__.extractCss),
/* harmony export */   glob: () => (/* reexport safe */ goober__WEBPACK_IMPORTED_MODULE_0__.glob),
/* harmony export */   keyframes: () => (/* reexport safe */ goober__WEBPACK_IMPORTED_MODULE_0__.keyframes),
/* harmony export */   setup: () => (/* binding */ setup),
/* harmony export */   shouldForwardProp: () => (/* binding */ shouldForwardProp),
/* harmony export */   styled: () => (/* binding */ styled),
/* harmony export */   useTheme: () => (/* binding */ useTheme)
/* harmony export */ });
/* harmony import */ var goober__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! goober */ "./node_modules/goober/dist/goober.modern.js");
/* harmony import */ var solid_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! solid-js */ "./node_modules/solid-js/dist/dev.js");
/* harmony import */ var solid_js_web__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! solid-js/web */ "./node_modules/solid-js/web/dist/dev.js");





let getForwardProps = null;

function shouldForwardProp(predicate) {
  return props => props.filter(predicate);
}

function setup(prefixer, shouldForwardProp = null) {
  (0,goober__WEBPACK_IMPORTED_MODULE_0__.setup)(null, prefixer);
  getForwardProps = shouldForwardProp;
}
const ThemeContext = (0,solid_js__WEBPACK_IMPORTED_MODULE_1__.createContext)();
function ThemeProvider(props) {
  return (0,solid_js__WEBPACK_IMPORTED_MODULE_1__.createComponent)(ThemeContext.Provider, {
    value: props.theme,
    get children() {
      return props.children;
    }
  });
}
function useTheme() {
  return (0,solid_js__WEBPACK_IMPORTED_MODULE_1__.useContext)(ThemeContext);
}

function makeStyled(tag) {
  let _ctx = this || {};
  return (...args) => {
    const Styled = props => {
      const theme = (0,solid_js__WEBPACK_IMPORTED_MODULE_1__.useContext)(ThemeContext);
      const withTheme = (0,solid_js__WEBPACK_IMPORTED_MODULE_1__.mergeProps)(props, { theme });
      const clone = (0,solid_js__WEBPACK_IMPORTED_MODULE_1__.mergeProps)(withTheme, {
        get class() {
          const pClass = withTheme.class,
            append = "class" in withTheme && /^go[0-9]+/.test(pClass);
          // Call `css` with the append flag and pass the props
          let className = goober__WEBPACK_IMPORTED_MODULE_0__.css.apply(
            { target: _ctx.target, o: append, p: withTheme, g: _ctx.g },
            args
          );
          return [pClass, className].filter(Boolean).join(" ");
        }
      });
      const [local, newProps] = (0,solid_js__WEBPACK_IMPORTED_MODULE_1__.splitProps)(clone, ["as", "theme"]);
      const htmlProps = getForwardProps
        ? (0,solid_js__WEBPACK_IMPORTED_MODULE_1__.splitProps)(newProps, getForwardProps(Object.keys(newProps)))[0]
        : newProps;
      const createTag = local.as || tag;
      let el;

      if (typeof createTag === "function") {
        el = createTag(htmlProps);
      } else {
        if (solid_js_web__WEBPACK_IMPORTED_MODULE_2__.isServer) {
          const [local, others] = (0,solid_js__WEBPACK_IMPORTED_MODULE_1__.splitProps)(htmlProps, ["children", "theme"]);
          el = (0,solid_js_web__WEBPACK_IMPORTED_MODULE_2__.Dynamic)({
            component: createTag,
            get children() {
              return local.children;
            },
            ...others
          });
        } else {
          if (_ctx.g == 1) {
            // When using Global Styles we don't want to hydrate the unused nodes
            el = document.createElement(createTag);
            (0,solid_js_web__WEBPACK_IMPORTED_MODULE_2__.spread)(el, htmlProps);
          } else {
            el = (0,solid_js_web__WEBPACK_IMPORTED_MODULE_2__.Dynamic)((0,solid_js__WEBPACK_IMPORTED_MODULE_1__.mergeProps)({ component: createTag }, htmlProps));
          }
        }
      }
      return el;
    };
    Styled.class = props => {
      return (0,solid_js__WEBPACK_IMPORTED_MODULE_1__.untrack)(() => {
        return goober__WEBPACK_IMPORTED_MODULE_0__.css.apply({ target: _ctx.target, p: props, g: _ctx.g }, args);
      });
    };

    return Styled;
  };
}

const styled = new Proxy(makeStyled, {
  get(target, tag) {
    return target(tag);
  }
});

function createGlobalStyles() {
  const fn = makeStyled.call({ g: 1 }, "div").apply(null, arguments);

  return function GlobalStyles(props) {
    fn(props);
    return null;
  };
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/main.tsx ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var solid_js_web__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! solid-js/web */ "./node_modules/solid-js/web/dist/dev.js");
/* harmony import */ var solid_js_web__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! solid-js/web */ "./node_modules/solid-js/dist/dev.js");
/* harmony import */ var solid_styled_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! solid-styled-components */ "./node_modules/solid-styled-components/src/index.js");
/* harmony import */ var _state_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./state.ts */ "./src/state.ts");
/* harmony import */ var _timeline__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./timeline */ "./src/timeline/index.ts");




var _tmpl$ = /*#__PURE__*/(0,solid_js_web__WEBPACK_IMPORTED_MODULE_0__.template)(`<div>Hello, world! <br><button>Increment`);




function App() {
  return (0,solid_js_web__WEBPACK_IMPORTED_MODULE_3__.createComponent)(AppRoot, {
    get children() {
      return [(() => {
        var _el$ = _tmpl$(),
          _el$2 = _el$.firstChild,
          _el$3 = _el$2.nextSibling,
          _el$4 = _el$3.nextSibling;
        (0,solid_js_web__WEBPACK_IMPORTED_MODULE_0__.insert)(_el$, () => _state_ts__WEBPACK_IMPORTED_MODULE_1__.get().test, _el$3);
        _el$4.$$click = () => {
          _state_ts__WEBPACK_IMPORTED_MODULE_1__.get().test++;
          _state_ts__WEBPACK_IMPORTED_MODULE_1__.refresh();
        };
        return _el$;
      })(), (0,solid_js_web__WEBPACK_IMPORTED_MODULE_3__.createComponent)(_timeline__WEBPACK_IMPORTED_MODULE_2__.Element, {})];
    }
  });
}
const AppRoot = solid_styled_components__WEBPACK_IMPORTED_MODULE_4__.styled.div`
    display: grid;
    grid-template: auto 1fr / 1fr;
    margin: auto;
    width: 100%;
    height: 100%;
    min-height: 0;
`;
solid_js_web__WEBPACK_IMPORTED_MODULE_0__.render(App, document.getElementById("app"));
(0,solid_js_web__WEBPACK_IMPORTED_MODULE_0__.delegateEvents)(["click"]);
})();

/******/ })()
;
//# sourceMappingURL=main.js.map