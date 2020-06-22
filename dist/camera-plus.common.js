"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSetProperty = exports.CameraVideoQuality = exports.CameraPlusBase = exports.CLog = exports.CameraUtil = void 0;
var content_view_1 = require("tns-core-modules/ui/content-view");
var CameraUtil = (function () {
    function CameraUtil() {
    }
    CameraUtil.debug = false;
    return CameraUtil;
}());
exports.CameraUtil = CameraUtil;
exports.CLog = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    if (CameraUtil.debug) {
        console.log('NativeScript-CameraPlus ---', args);
    }
};
var CameraPlusBase = (function (_super) {
    __extends(CameraPlusBase, _super);
    function CameraPlusBase() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.confirmPhotos = true;
        _this.confirmVideo = false;
        _this.saveToGallery = true;
        _this.galleryPickerMode = 'multiple';
        _this.showFlashIcon = true;
        _this.showToggleIcon = true;
        _this.showCaptureIcon = true;
        _this.showGalleryIcon = true;
        _this.flashOnIcon = '';
        _this.flashOffIcon = '';
        _this.toggleCameraIcon = '';
        _this.takePicIcon = '';
        _this.galleryIcon = '';
        _this.autoFocus = true;
        _this.doubleTapCameraSwitch = true;
        _this.autoSquareCrop = false;
        return _this;
    }
    Object.defineProperty(CameraPlusBase.prototype, "debug", {
        set: function (value) {
            CameraUtil.debug = value;
        },
        enumerable: false,
        configurable: true
    });
    CameraPlusBase.prototype.toggleCamera = function () { };
    CameraPlusBase.prototype.toggleFlash = function () { };
    CameraPlusBase.prototype.getFlashMode = function () {
        return null;
    };
    CameraPlusBase.prototype.isCameraAvailable = function () {
        return false;
    };
    CameraPlusBase.prototype.getCurrentCamera = function () {
        return 'rear';
    };
    CameraPlusBase.prototype.requestCameraPermissions = function (explanationText) {
        return new Promise(function (resolve, reject) { return resolve(); });
    };
    CameraPlusBase.prototype.hasCameraPermission = function () {
        return false;
    };
    CameraPlusBase.prototype.requestStoragePermissions = function (explanationText) {
        return new Promise(function (resolve, reject) { return resolve(false); });
    };
    CameraPlusBase.prototype.hasStoragePermissions = function () {
        return false;
    };
    CameraPlusBase.prototype.requestAudioPermissions = function (explanationText) {
        return new Promise(function (resolve, reject) { return resolve(); });
    };
    CameraPlusBase.prototype.hasAudioPermission = function () {
        return false;
    };
    CameraPlusBase.prototype.requestVideoRecordingPermissions = function (explanationText) {
        return new Promise(function (resolve, reject) { return resolve(true); });
    };
    CameraPlusBase.prototype.hasVideoRecordingPermissions = function () {
        return false;
    };
    CameraPlusBase.prototype.getNumberOfCameras = function () {
        return 0;
    };
    CameraPlusBase.prototype.hasFlash = function () {
        return false;
    };
    CameraPlusBase.prototype.sendEvent = function (eventName, data, msg) {
        this.notify({
            eventName: eventName,
            object: this,
            data: data,
            message: msg
        });
    };
    CameraPlusBase.enableVideo = false;
    CameraPlusBase.resizeAspectFill = false;
    CameraPlusBase.defaultCamera = 'rear';
    CameraPlusBase.errorEvent = 'errorEvent';
    CameraPlusBase.photoCapturedEvent = 'photoCapturedEvent';
    CameraPlusBase.toggleCameraEvent = 'toggleCameraEvent';
    CameraPlusBase.imagesSelectedEvent = 'imagesSelectedEvent';
    CameraPlusBase.videoRecordingStartedEvent = 'videoRecordingStartedEvent';
    CameraPlusBase.videoRecordingFinishedEvent = 'videoRecordingFinishedEvent';
    CameraPlusBase.videoRecordingReadyEvent = 'videoRecordingReadyEvent';
    CameraPlusBase.confirmScreenShownEvent = 'confirmScreenShownEvent';
    CameraPlusBase.confirmScreenDismissedEvent = 'confirmScreenDismissedEvent';
    __decorate([
        GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlusBase.prototype, "confirmPhotos", void 0);
    __decorate([
        GetSetProperty(),
        __metadata("design:type", String)
    ], CameraPlusBase.prototype, "confirmRetakeText", void 0);
    __decorate([
        GetSetProperty(),
        __metadata("design:type", String)
    ], CameraPlusBase.prototype, "confirmSaveText", void 0);
    __decorate([
        GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlusBase.prototype, "confirmVideo", void 0);
    __decorate([
        GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlusBase.prototype, "saveToGallery", void 0);
    __decorate([
        GetSetProperty(),
        __metadata("design:type", String)
    ], CameraPlusBase.prototype, "galleryPickerMode", void 0);
    __decorate([
        GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlusBase.prototype, "showFlashIcon", void 0);
    __decorate([
        GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlusBase.prototype, "showToggleIcon", void 0);
    __decorate([
        GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlusBase.prototype, "showCaptureIcon", void 0);
    __decorate([
        GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlusBase.prototype, "showGalleryIcon", void 0);
    __decorate([
        GetSetProperty(),
        __metadata("design:type", String)
    ], CameraPlusBase.prototype, "flashOnIcon", void 0);
    __decorate([
        GetSetProperty(),
        __metadata("design:type", String)
    ], CameraPlusBase.prototype, "flashOffIcon", void 0);
    __decorate([
        GetSetProperty(),
        __metadata("design:type", String)
    ], CameraPlusBase.prototype, "toggleCameraIcon", void 0);
    __decorate([
        GetSetProperty(),
        __metadata("design:type", String)
    ], CameraPlusBase.prototype, "takePicIcon", void 0);
    __decorate([
        GetSetProperty(),
        __metadata("design:type", String)
    ], CameraPlusBase.prototype, "galleryIcon", void 0);
    __decorate([
        GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlusBase.prototype, "autoFocus", void 0);
    __decorate([
        GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlusBase.prototype, "doubleTapCameraSwitch", void 0);
    __decorate([
        GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlusBase.prototype, "autoSquareCrop", void 0);
    return CameraPlusBase;
}(content_view_1.ContentView));
exports.CameraPlusBase = CameraPlusBase;
var CameraVideoQuality;
(function (CameraVideoQuality) {
    CameraVideoQuality["MAX_480P"] = "480p";
    CameraVideoQuality["MAX_720P"] = "720p";
    CameraVideoQuality["MAX_1080P"] = "1080p";
    CameraVideoQuality["MAX_2160P"] = "2160p";
    CameraVideoQuality["HIGHEST"] = "highest";
    CameraVideoQuality["LOWEST"] = "lowest";
    CameraVideoQuality["QVGA"] = "qvga";
})(CameraVideoQuality = exports.CameraVideoQuality || (exports.CameraVideoQuality = {}));
function GetSetProperty() {
    return function (target, propertyKey) {
        Object.defineProperty(target, propertyKey, {
            get: function () {
                return this['_' + propertyKey];
            },
            set: function (value) {
                if (this['_' + propertyKey] === value) {
                    return;
                }
                if (value === 'true') {
                    value = true;
                }
                else if (value === 'false') {
                    value = false;
                }
                this['_' + propertyKey] = value;
            },
            enumerable: true,
            configurable: true
        });
    };
}
exports.GetSetProperty = GetSetProperty;
//# sourceMappingURL=camera-plus.common.js.map