"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraPlus = void 0;
var permissions = require("nativescript-permissions");
var app = require("tns-core-modules/application");
var image_asset_1 = require("tns-core-modules/image-asset");
var platform_1 = require("tns-core-modules/platform");
var view_1 = require("tns-core-modules/ui/core/view/view");
var types = require("tns-core-modules/utils/types");
var utils = require("tns-core-modules/utils/utils");
var camera_plus_common_1 = require("./camera-plus.common");
var CamHelpers = require("./helpers");
var selected_asset_1 = require("./selected-asset");
__exportStar(require("./camera-plus.common"), exports);
var camera_plus_common_2 = require("./camera-plus.common");
Object.defineProperty(exports, "CameraVideoQuality", { enumerable: true, get: function () { return camera_plus_common_2.CameraVideoQuality; } });
var REQUEST_VIDEO_CAPTURE = 999;
var WRAP_CONTENT = -2;
var ALIGN_PARENT_TOP = 10;
var ALIGN_PARENT_BOTTOM = 12;
var ALIGN_PARENT_LEFT = 9;
var ALIGN_PARENT_RIGHT = 11;
var CENTER_HORIZONTAL = 14;
var DIRECTORY_PICTURES = 'DIRECTORY_PICTURES';
var DIRECTORY_MOVIES = 'DIRECTORY_MOVIES';
var FOCUS_MODE_AUTO = 'auto';
var FOCUS_MODE_EDOF = 'edof';
var FOCUS_MODE_CONTINUOUS_PICTURE = 'continuous-picture';
var FOCUS_MODE_CONTINUOUS_VIDEO = 'continuous-video';
var FLASH_MODE_ON = 'on';
var FLASH_MODE_OFF = 'off';
var CAMERA_FACING_FRONT = 1;
var CAMERA_FACING_BACK = 0;
var RESULT_CODE_PICKER_IMAGES = 941;
var RESULT_OK = -1;
var CAMERA = function () { return android.Manifest.permission.CAMERA; };
var RECORD_AUDIO = function () { return android.Manifest.permission.RECORD_AUDIO; };
var READ_EXTERNAL_STORAGE = function () { return android.Manifest.permission.READ_EXTERNAL_STORAGE; };
var WRITE_EXTERNAL_STORAGE = function () { return android.Manifest.permission.WRITE_EXTERNAL_STORAGE; };
var DEVICE_INFO_STRING = function () { return "device: " + platform_1.device.manufacturer + " " + platform_1.device.model + " on SDK: " + platform_1.device.sdkVersion; };
var CameraPlus = (function (_super) {
    __extends(CameraPlus, _super);
    function CameraPlus() {
        var _this = _super.call(this) || this;
        _this.flashOnIcon = 'ic_flash_on_white';
        _this.flashOffIcon = 'ic_flash_off_white';
        _this.toggleCameraIcon = 'ic_switch_camera_white';
        _this.confirmPhotos = true;
        _this.saveToGallery = false;
        _this.takePicIcon = 'ic_camera_white';
        _this.galleryIcon = 'ic_photo_library_white';
        _this.insetButtons = false;
        _this.insetButtonsPercent = 0.1;
        _this._flashBtn = null;
        _this._takePicBtn = null;
        _this._toggleCamBtn = null;
        _this._galleryBtn = null;
        _this._autoFocus = false;
        _this._togglingCamera = false;
        _this._camera = null;
        _this._textureSurface = null;
        _this.flashOnIcon = _this.flashOnIcon ? _this.flashOnIcon : 'ic_flash_on_white';
        _this.flashOffIcon = _this.flashOffIcon ? _this.flashOffIcon : 'ic_flash_off_white';
        _this.toggleCameraIcon = _this.toggleCameraIcon ? _this.toggleCameraIcon : 'ic_switch_camera_white';
        _this.takePicIcon = _this.takePicIcon ? _this.takePicIcon : 'ic_camera_alt_white';
        _this.galleryIcon = _this.galleryIcon ? _this.galleryIcon : 'ic_photo_library_white';
        _this.cameraId = CameraPlus.defaultCamera === 'front' ? CAMERA_FACING_FRONT : CAMERA_FACING_BACK;
        _this._onLayoutChangeListener = _this._onLayoutChangeFn.bind(_this);
        _this._permissionListener = _this._permissionListenerFn.bind(_this);
        _this._lastCameraOptions = [];
        return _this;
    }
    CameraPlus.prototype.isVideoEnabled = function () {
        return this.enableVideo === true || CameraPlus.enableVideo;
    };
    Object.defineProperty(CameraPlus.prototype, "camera", {
        get: function () {
            return this._camera;
        },
        enumerable: false,
        configurable: true
    });
    CameraPlus.prototype.createNativeView = function () {
        app.android.on('activityRequestPermissions', this._permissionListener);
        this._nativeView = new android.widget.RelativeLayout(this._context);
        this._camera = new co.fitcom.fancycamera.FancyCamera(this._context);
        this._camera.setLayoutParams(new android.view.ViewGroup.LayoutParams(android.view.ViewGroup.LayoutParams.MATCH_PARENT, android.view.ViewGroup.LayoutParams.MATCH_PARENT));
        this._nativeView.addView(this._camera);
        return this._nativeView;
    };
    CameraPlus.prototype._onLayoutChangeFn = function (args) {
        var size = this.getActualSize();
        camera_plus_common_1.CLog('xml width/height:', size.width + 'x' + size.height);
        this._initDefaultButtons();
    };
    CameraPlus.prototype._permissionListenerFn = function (args) {
        if (this._camera) {
            if (this._camera.hasPermission()) {
                this._camera.start();
            }
        }
    };
    CameraPlus.prototype.initNativeView = function () {
        _super.prototype.initNativeView.call(this);
        this.on(view_1.View.layoutChangedEvent, this._onLayoutChangeListener);
        var listenerImpl = co.fitcom.fancycamera.CameraEventListenerUI.extend({
            owner: null,
            onCameraCloseUI: function () { },
            onPhotoEventUI: function (event) {
                return __awaiter(this, void 0, void 0, function () {
                    var owner, file, options, confirmPic, confirmPicRetakeText, confirmPicSaveText, saveToGallery, reqWidth, reqHeight, shouldKeepAspectRatio, shouldAutoSquareCrop, density, result, asset, asset;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                owner = this.owner ? this.owner.get() : null;
                                if (!(event.getType() === co.fitcom.fancycamera.EventType.ERROR)) return [3, 1];
                                if (owner) {
                                    owner._lastCameraOptions.shift();
                                    camera_plus_common_1.CLog('takePicture error', null);
                                    owner.sendEvent(CameraPlus.errorEvent, null, 'Error taking picture.');
                                }
                                return [3, 4];
                            case 1:
                                if (!(event.getType() === co.fitcom.fancycamera.EventType.INFO)) return [3, 4];
                                file = event.getFile();
                                if (!(event.getMessage() === co.fitcom.fancycamera.PhotoEvent.EventInfo.PHOTO_TAKEN.toString())) return [3, 4];
                                options = owner._lastCameraOptions.shift();
                                confirmPic = void 0;
                                confirmPicRetakeText = void 0;
                                confirmPicSaveText = void 0;
                                saveToGallery = void 0;
                                reqWidth = void 0;
                                reqHeight = void 0;
                                shouldKeepAspectRatio = void 0;
                                shouldAutoSquareCrop = owner.autoSquareCrop;
                                density = utils.layout.getDisplayDensity();
                                if (options) {
                                    confirmPic = options.confirm ? true : false;
                                    confirmPicRetakeText = options.confirmRetakeText ? options.confirmRetakeText : owner.confirmRetakeText;
                                    confirmPicSaveText = options.confirmSaveText ? options.confirmSaveText : owner.confirmSaveText;
                                    saveToGallery = options.saveToGallery ? true : false;
                                    reqWidth = options.width ? options.width * density : 0;
                                    reqHeight = options.height ? options.height * density : reqWidth;
                                    shouldKeepAspectRatio = types.isNullOrUndefined(options.keepAspectRatio) ? true : options.keepAspectRatio;
                                    shouldAutoSquareCrop = !!options.autoSquareCrop;
                                }
                                else {
                                    camera_plus_common_1.CLog('Using property getters for defaults, no options.');
                                    confirmPic = owner.confirmPhotos;
                                    saveToGallery = owner.saveToGallery;
                                }
                                if (!(confirmPic === true)) return [3, 3];
                                owner.sendEvent(CameraPlus.confirmScreenShownEvent);
                                return [4, CamHelpers.createImageConfirmationDialog(file.getAbsolutePath(), confirmPicRetakeText, confirmPicSaveText).catch(function (ex) {
                                        camera_plus_common_1.CLog('Error createImageConfirmationDialog', ex);
                                    })];
                            case 2:
                                result = _a.sent();
                                owner.sendEvent(CameraPlus.confirmScreenDismissedEvent);
                                camera_plus_common_1.CLog("confirmation result = " + result);
                                if (result !== true) {
                                    file.delete();
                                    return [2];
                                }
                                asset = CamHelpers.assetFromPath(file.getAbsolutePath(), reqWidth, reqHeight, shouldKeepAspectRatio);
                                owner.sendEvent(CameraPlus.photoCapturedEvent, asset);
                                return [2];
                            case 3:
                                asset = CamHelpers.assetFromPath(file.getAbsolutePath(), reqWidth, reqHeight, shouldKeepAspectRatio);
                                owner.sendEvent(CameraPlus.photoCapturedEvent, asset);
                                return [2];
                            case 4: return [2];
                        }
                    });
                });
            },
            onCameraOpenUI: function () {
                var owner = this.owner ? this.owner.get() : null;
                if (owner) {
                    owner._initDefaultButtons();
                    if (owner._togglingCamera) {
                        owner.sendEvent(CameraPlus.toggleCameraEvent, owner.camera);
                        owner._ensureCorrectFlashIcon();
                        owner._togglingCamera = true;
                    }
                    else {
                        owner.sendEvent('loaded', owner.camera);
                    }
                }
            },
            onVideoEventUI: function (event) {
                var owner = this.owner ? this.owner.get() : null;
                if (owner) {
                    if (event.getType() === co.fitcom.fancycamera.EventType.ERROR) {
                        camera_plus_common_1.CLog("stopRecording error", null);
                        owner.sendEvent(CameraPlus.errorEvent, null, 'Error trying to stop recording.');
                        owner.isRecording = false;
                    }
                    else if (event.getType() === co.fitcom.fancycamera.EventType.INFO) {
                        if (event.getMessage() === co.fitcom.fancycamera.VideoEvent.EventInfo.RECORDING_STARTED.toString()) {
                            owner.isRecording = true;
                            owner.sendEvent(CameraPlus.videoRecordingStartedEvent, owner.camera);
                        }
                        else if (event.getMessage() === co.fitcom.fancycamera.VideoEvent.EventInfo.RECORDING_FINISHED.toString()) {
                            owner.sendEvent(CameraPlus.videoRecordingReadyEvent, event.getFile().getAbsolutePath());
                            camera_plus_common_1.CLog("Recording complete");
                            owner.isRecording = false;
                        }
                    }
                }
            }
        });
        var listener = new listenerImpl();
        listener.owner = new WeakRef(this);
        this._camera.setListener(listener);
        this.cameraId = this._cameraId;
    };
    CameraPlus.prototype.disposeNativeView = function () {
        camera_plus_common_1.CLog('disposeNativeView.');
        this.off(view_1.View.layoutChangedEvent, this._onLayoutChangeListener);
        app.android.off('activityRequestPermissions', this._permissionListener);
        this.releaseCamera();
        _super.prototype.disposeNativeView.call(this);
    };
    Object.defineProperty(CameraPlus.prototype, "cameraId", {
        get: function () {
            return this._cameraId;
        },
        set: function (id) {
            if (this._camera) {
                switch (id) {
                    case CAMERA_FACING_FRONT:
                        this._camera.setCameraPosition(co.fitcom.fancycamera.FancyCamera.CameraPosition.FRONT);
                        this._cameraId = CAMERA_FACING_FRONT;
                        break;
                    default:
                        this._camera.setCameraPosition(co.fitcom.fancycamera.FancyCamera.CameraPosition.BACK);
                        this._cameraId = CAMERA_FACING_BACK;
                        break;
                }
            }
            this._cameraId = id;
        },
        enumerable: false,
        configurable: true
    });
    CameraPlus.prototype.takePicture = function (options) {
        if (this._camera) {
            options = options || {};
            camera_plus_common_1.CLog(JSON.stringify(options));
            var hasCamPerm = this.hasCameraPermission();
            if (!hasCamPerm) {
                camera_plus_common_1.CLog('Application does not have permission to use Camera.');
                return;
            }
            this._camera.setSaveToGallery(!!options.saveToGallery);
            this._camera.setAutoSquareCrop(!!options.autoSquareCrop);
            this._lastCameraOptions.push(options);
            this._camera.takePhoto();
        }
    };
    CameraPlus.prototype.releaseCamera = function () {
        if (this._camera) {
            this._camera.release();
        }
    };
    Object.defineProperty(CameraPlus.prototype, "autoFocus", {
        get: function () {
            return this._autoFocus;
        },
        set: function (focus) {
            if (this._camera) {
                this._camera.setAutoFocus(focus);
            }
            this._autoFocus = focus;
        },
        enumerable: false,
        configurable: true
    });
    CameraPlus.prototype.toggleCamera = function () {
        if (this._camera) {
            this._togglingCamera = true;
            this._camera.toggleCamera();
            var camNumber = this.getNumberOfCameras();
            if (camNumber <= 1) {
                camera_plus_common_1.CLog("Android Device has " + camNumber + " camera.");
                return;
            }
            this.sendEvent(CameraPlus.toggleCameraEvent, this.camera);
            this._ensureCorrectFlashIcon();
            this._ensureFocusMode();
        }
    };
    CameraPlus.prototype.record = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var permResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = options || {};
                        if (!this._camera) return [3, 2];
                        this._camera.setDisableHEVC(!!options.disableHEVC);
                        this._camera.setSaveToGallery(!!options.saveToGallery);
                        switch (options.quality) {
                            case camera_plus_common_1.CameraVideoQuality.HIGHEST:
                                this._camera.setQuality(co.fitcom.fancycamera.FancyCamera.Quality.HIGHEST.getValue());
                                break;
                            case camera_plus_common_1.CameraVideoQuality.LOWEST:
                                this._camera.setQuality(co.fitcom.fancycamera.FancyCamera.Quality.LOWEST.getValue());
                                break;
                            case camera_plus_common_1.CameraVideoQuality.MAX_2160P:
                                this._camera.setQuality(co.fitcom.fancycamera.FancyCamera.Quality.MAX_2160P.getValue());
                                break;
                            case camera_plus_common_1.CameraVideoQuality.MAX_1080P:
                                this._camera.setQuality(co.fitcom.fancycamera.FancyCamera.Quality.MAX_1080P.getValue());
                                break;
                            case camera_plus_common_1.CameraVideoQuality.MAX_720P:
                                this._camera.setQuality(co.fitcom.fancycamera.FancyCamera.Quality.MAX_720P.getValue());
                                break;
                            case camera_plus_common_1.CameraVideoQuality.QVGA:
                                this._camera.setQuality(co.fitcom.fancycamera.FancyCamera.Quality.QVGA.getValue());
                                break;
                            default:
                                this._camera.setQuality(co.fitcom.fancycamera.FancyCamera.Quality.MAX_480P.getValue());
                                break;
                        }
                        this._camera.setMaxAudioBitRate(options.androidMaxAudioBitRate || -1);
                        this._camera.setMaxVideoBitrate(options.androidMaxVideoBitRate || -1);
                        this._camera.setMaxVideoFrameRate(options.androidMaxFrameRate || -1);
                        return [4, this.requestVideoRecordingPermissions()];
                    case 1:
                        permResult = _a.sent();
                        camera_plus_common_1.CLog(permResult);
                        this._camera.startRecording();
                        _a.label = 2;
                    case 2: return [2];
                }
            });
        });
    };
    CameraPlus.prototype.stop = function () {
        this.stopRecording();
    };
    CameraPlus.prototype.stopRecording = function () {
        if (this._camera) {
            camera_plus_common_1.CLog("*** stopping mediaRecorder ***");
            this._camera.stopRecording();
        }
    };
    CameraPlus.prototype.chooseFromLibrary = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var createThePickerIntent_1 = function () {
                    var intent = new android.content.Intent();
                    intent.setType('*/*');
                    if (!options) {
                        options = {
                            showImages: true,
                            showVideos: _this.isVideoEnabled()
                        };
                    }
                    if (options.showImages === undefined) {
                        options.showImages = true;
                    }
                    if (options.showVideos === undefined) {
                        options.showVideos = true;
                    }
                    var length = 0;
                    if (options.showImages) {
                        length++;
                    }
                    if (options.showVideos) {
                        length++;
                    }
                    var mimetypes = Array.create(java.lang.String, length);
                    var index = 0;
                    if (options.showImages) {
                        mimetypes[index] = 'image/*';
                        index++;
                    }
                    if (options.showVideos) {
                        mimetypes[index] = 'video/*';
                    }
                    intent.putExtra(android.content.Intent.EXTRA_MIME_TYPES, mimetypes);
                    intent.setAction('android.intent.action.GET_CONTENT');
                    if (_this.galleryPickerMode === 'multiple') {
                        intent.putExtra('android.intent.extra.ALLOW_MULTIPLE', true);
                    }
                    var onImagePickerResult = function (args) {
                        if (args.requestCode === RESULT_CODE_PICKER_IMAGES && args.resultCode === RESULT_OK) {
                            try {
                                var selectedImages = [];
                                var data = args.intent;
                                var clipData = data.getClipData();
                                if (clipData !== null) {
                                    for (var i = 0; i < clipData.getItemCount(); i++) {
                                        var clipItem = clipData.getItemAt(i);
                                        var uri = clipItem.getUri();
                                        var selectedAsset = new selected_asset_1.SelectedAsset(uri);
                                        var asset = new image_asset_1.ImageAsset(selectedAsset.android);
                                        selectedImages.push(asset);
                                    }
                                }
                                else {
                                    var uri = data.getData();
                                    var path = uri.getPath();
                                    var selectedAsset = new selected_asset_1.SelectedAsset(uri);
                                    var asset = new image_asset_1.ImageAsset(selectedAsset.android);
                                    selectedImages.push(asset);
                                }
                                app.android.off(app.AndroidApplication.activityResultEvent, onImagePickerResult);
                                resolve(selectedImages);
                                _this.sendEvent(CameraPlus.imagesSelectedEvent, selectedImages);
                                return;
                            }
                            catch (e) {
                                camera_plus_common_1.CLog(e);
                                app.android.off(app.AndroidApplication.activityResultEvent, onImagePickerResult);
                                reject(e);
                                _this.sendEvent(CameraPlus.errorEvent, e, 'Error with the image picker result.');
                                return;
                            }
                        }
                        else {
                            app.android.off(app.AndroidApplication.activityResultEvent, onImagePickerResult);
                            reject("Image picker activity result code " + args.resultCode);
                            return;
                        }
                    };
                    app.android.on(app.AndroidApplication.activityResultEvent, onImagePickerResult);
                    app.android.foregroundActivity.startActivityForResult(intent, RESULT_CODE_PICKER_IMAGES);
                };
                var hasPerm = _this.hasStoragePermissions();
                if (hasPerm === true) {
                    createThePickerIntent_1();
                }
                else {
                    permissions.requestPermissions([READ_EXTERNAL_STORAGE(), WRITE_EXTERNAL_STORAGE()]).then(function () {
                        createThePickerIntent_1();
                    });
                }
            }
            catch (e) {
                reject(e);
                _this.sendEvent(CameraPlus.errorEvent, e, 'Error choosing an image from the device library.');
            }
        });
    };
    CameraPlus.prototype.toggleFlash = function () {
        if (this._camera) {
            this._camera.toggleFlash();
        }
    };
    CameraPlus.prototype.requestCameraPermissions = function (explanation) {
        var _this = this;
        if (explanation === void 0) { explanation = ''; }
        return new Promise(function (resolve, reject) {
            permissions
                .requestPermission(CAMERA(), explanation)
                .then(function () {
                resolve(true);
            })
                .catch(function (err) {
                _this.sendEvent(CameraPlus.errorEvent, err, 'Error requesting Camera permissions.');
                reject(false);
            });
        });
    };
    CameraPlus.prototype.hasCameraPermission = function () {
        return permissions.hasPermission(CAMERA());
    };
    CameraPlus.prototype.requestAudioPermissions = function (explanation) {
        var _this = this;
        if (explanation === void 0) { explanation = ''; }
        return new Promise(function (resolve, reject) {
            permissions
                .requestPermission(RECORD_AUDIO(), explanation)
                .then(function () {
                resolve(true);
            })
                .catch(function (err) {
                _this.sendEvent(CameraPlus.errorEvent, err, 'Error requesting Audio permission.');
                reject(false);
            });
        });
    };
    CameraPlus.prototype.hasAudioPermission = function () {
        return permissions.hasPermission(RECORD_AUDIO());
    };
    CameraPlus.prototype.requestStoragePermissions = function (explanation) {
        var _this = this;
        if (explanation === void 0) { explanation = ''; }
        return new Promise(function (resolve, reject) {
            permissions
                .requestPermissions([WRITE_EXTERNAL_STORAGE(), READ_EXTERNAL_STORAGE()], explanation)
                .then(function () {
                resolve(true);
            })
                .catch(function (err) {
                _this.sendEvent(CameraPlus.errorEvent, err, 'Error requesting Storage permissions.');
                reject(false);
            });
        });
    };
    CameraPlus.prototype.hasStoragePermissions = function () {
        var writePerm = permissions.hasPermission(WRITE_EXTERNAL_STORAGE());
        var readPerm = permissions.hasPermission(READ_EXTERNAL_STORAGE());
        if (writePerm === true && readPerm === true) {
            return true;
        }
        else {
            return false;
        }
    };
    CameraPlus.prototype.requestVideoRecordingPermissions = function (explanation) {
        var _this = this;
        if (explanation === void 0) { explanation = ''; }
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                permissions
                    .requestPermissions([WRITE_EXTERNAL_STORAGE(), RECORD_AUDIO()], explanation)
                    .then(function () {
                    resolve(true);
                })
                    .catch(function (err) {
                    _this.sendEvent(CameraPlus.errorEvent, err, 'Error requesting Video permissions.');
                    reject(false);
                });
                return [2];
            });
        }); });
    };
    CameraPlus.prototype.hasVideoRecordingPermissions = function () {
        var writePerm = permissions.hasPermission(WRITE_EXTERNAL_STORAGE());
        var audio = permissions.hasPermission(RECORD_AUDIO());
        if (writePerm === true && audio === true) {
            return true;
        }
        else {
            return false;
        }
    };
    CameraPlus.prototype.getCurrentCamera = function () {
        if (!this._camera)
            return 'rear';
        switch (this._camera.getCameraPosition()) {
            case co.fitcom.fancycamera.FancyCamera.CameraPosition.FRONT.getValue():
                return 'front';
            default:
                return 'rear';
        }
    };
    CameraPlus.prototype.isCameraAvailable = function () {
        if (utils.ad
            .getApplicationContext()
            .getPackageManager()
            .hasSystemFeature('android.hardware.camera')) {
            return true;
        }
        else {
            return false;
        }
    };
    CameraPlus.prototype.getNumberOfCameras = function () {
        if (!this._camera)
            return 0;
        return this._camera.getNumberOfCameras();
    };
    CameraPlus.prototype.hasFlash = function () {
        if (!this._camera) {
            return false;
        }
        return this._camera.hasFlash();
    };
    CameraPlus.prototype.getFlashMode = function () {
        if (this.hasFlash()) {
            if (this._camera.flashEnabled()) {
                return 'on';
            }
            return 'off';
        }
        return null;
    };
    CameraPlus.prototype._ensureCorrectFlashIcon = function () {
        var currentFlashMode = this.getFlashMode();
        camera_plus_common_1.CLog('_ensureCorrectFlashIcon flash mode', currentFlashMode);
        if (currentFlashMode === null) {
            if (this._flashBtn) {
                this._flashBtn.setVisibility(android.view.View.GONE);
            }
            return;
        }
        if (this._flashBtn === undefined || this._flashBtn === null) {
            return;
        }
        this._flashBtn.setVisibility(android.view.View.VISIBLE);
        this._flashBtn.setImageResource(android.R.color.transparent);
        var flashIcon = currentFlashMode === FLASH_MODE_OFF ? this.flashOffIcon : this.flashOnIcon;
        var imageDrawable = CamHelpers.getImageDrawable(flashIcon);
        this._flashBtn.setImageResource(imageDrawable);
    };
    CameraPlus.prototype._ensureFocusMode = function () {
    };
    CameraPlus.prototype._initFlashButton = function () {
        this._flashBtn = CamHelpers.createImageButton();
        this._ensureCorrectFlashIcon();
        var shape = CamHelpers.createTransparentCircleDrawable();
        this._flashBtn.setBackgroundDrawable(shape);
        var ref = new WeakRef(this);
        this._flashBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (args) {
                var owner = ref.get();
                if (owner) {
                    owner.toggleFlash();
                    owner._ensureCorrectFlashIcon();
                }
            }
        }));
        var flashParams = new android.widget.RelativeLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT);
        if (this.insetButtons === true) {
            var layoutWidth = this._nativeView.getWidth();
            camera_plus_common_1.CLog("layoutWidth = " + layoutWidth);
            var xMargin = layoutWidth * this.insetButtonsPercent;
            var layoutHeight = this._nativeView.getHeight();
            camera_plus_common_1.CLog("layoutHeight = " + layoutHeight);
            var yMargin = layoutHeight * this.insetButtonsPercent;
            flashParams.setMargins(xMargin, yMargin, 8, 8);
        }
        else {
            flashParams.setMargins(8, 8, 8, 8);
        }
        flashParams.addRule(ALIGN_PARENT_TOP);
        flashParams.addRule(ALIGN_PARENT_LEFT);
        this._nativeView.addView(this._flashBtn, flashParams);
    };
    CameraPlus.prototype._initGalleryButton = function () {
        this._galleryBtn = CamHelpers.createImageButton();
        var openGalleryDrawable = CamHelpers.getImageDrawable(this.galleryIcon);
        this._galleryBtn.setImageResource(openGalleryDrawable);
        var shape = CamHelpers.createTransparentCircleDrawable();
        this._galleryBtn.setBackgroundDrawable(shape);
        var ref = new WeakRef(this);
        this._galleryBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (args) {
                var owner = ref.get();
                if (owner) {
                    owner.chooseFromLibrary();
                }
            }
        }));
        var galleryParams = new android.widget.RelativeLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT);
        if (this.insetButtons === true) {
            var layoutWidth = this._nativeView.getWidth();
            camera_plus_common_1.CLog("layoutWidth = " + layoutWidth);
            var xMargin = layoutWidth * this.insetButtonsPercent;
            var layoutHeight = this._nativeView.getHeight();
            camera_plus_common_1.CLog("layoutHeight = " + layoutHeight);
            var yMargin = layoutHeight * this.insetButtonsPercent;
            galleryParams.setMargins(xMargin, 8, 8, yMargin);
        }
        else {
            galleryParams.setMargins(8, 8, 8, 8);
        }
        galleryParams.addRule(ALIGN_PARENT_BOTTOM);
        galleryParams.addRule(ALIGN_PARENT_LEFT);
        this._nativeView.addView(this._galleryBtn, galleryParams);
    };
    CameraPlus.prototype._initToggleCameraButton = function () {
        this._toggleCamBtn = CamHelpers.createImageButton();
        var switchCameraDrawable = CamHelpers.getImageDrawable(this.toggleCameraIcon);
        this._toggleCamBtn.setImageResource(switchCameraDrawable);
        var shape = CamHelpers.createTransparentCircleDrawable();
        this._toggleCamBtn.setBackgroundDrawable(shape);
        var ref = new WeakRef(this);
        this._toggleCamBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (view) {
                var owner = ref.get();
                if (owner) {
                    owner.toggleCamera();
                }
            }
        }));
        var toggleCamParams = new android.widget.RelativeLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT);
        if (this.insetButtons === true) {
            var layoutWidth = this._nativeView.getWidth();
            camera_plus_common_1.CLog("layoutWidth = " + layoutWidth);
            var xMargin = layoutWidth * this.insetButtonsPercent;
            var layoutHeight = this._nativeView.getHeight();
            camera_plus_common_1.CLog("layoutHeight = " + layoutHeight);
            var yMargin = layoutHeight * this.insetButtonsPercent;
            toggleCamParams.setMargins(8, yMargin, xMargin, 8);
        }
        else {
            toggleCamParams.setMargins(8, 8, 8, 8);
        }
        toggleCamParams.addRule(ALIGN_PARENT_TOP);
        toggleCamParams.addRule(ALIGN_PARENT_RIGHT);
        this._nativeView.addView(this._toggleCamBtn, toggleCamParams);
    };
    CameraPlus.prototype._initTakePicButton = function () {
        var _this = this;
        this._takePicBtn = CamHelpers.createImageButton();
        var takePicDrawable = CamHelpers.getImageDrawable(this.takePicIcon);
        this._takePicBtn.setImageResource(takePicDrawable);
        var shape = CamHelpers.createTransparentCircleDrawable();
        this._takePicBtn.setBackgroundDrawable(shape);
        var ref = new WeakRef(this);
        this._takePicBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (args) {
                camera_plus_common_1.CLog("The default Take Picture event will attempt to save the image to gallery.");
                var opts = {
                    saveToGallery: true,
                    confirm: _this.confirmPhotos ? true : false,
                    autoSquareCrop: _this.autoSquareCrop
                };
                var owner = ref.get();
                if (owner) {
                    owner.takePicture(opts);
                }
            }
        }));
        var takePicParams = new android.widget.RelativeLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT);
        if (this.insetButtons === true) {
            var layoutHeight = this._nativeView.getHeight();
            camera_plus_common_1.CLog("layoutHeight = " + layoutHeight);
            var yMargin = layoutHeight * this.insetButtonsPercent;
            takePicParams.setMargins(8, 8, 8, yMargin);
        }
        else {
            takePicParams.setMargins(8, 8, 8, 8);
        }
        takePicParams.addRule(ALIGN_PARENT_BOTTOM);
        takePicParams.addRule(CENTER_HORIZONTAL);
        this._nativeView.addView(this._takePicBtn, takePicParams);
    };
    CameraPlus.prototype._initDefaultButtons = function () {
        try {
            if (this.showFlashIcon === true && this.getFlashMode() !== null && this._flashBtn === null) {
                this._initFlashButton();
            }
            if (this.showGalleryIcon === true && this._galleryBtn === null) {
                this._initGalleryButton();
            }
            if (this.showToggleIcon === true && this.getNumberOfCameras() > 1 && this._toggleCamBtn === null) {
                this._initToggleCameraButton();
            }
            if (this.showCaptureIcon === true && this._takePicBtn === null) {
                if (this.showFlashIcon === true && this.getFlashMode() !== null && this._flashBtn === null) {
                    this._initFlashButton();
                }
                if (this.showGalleryIcon === true && this._galleryBtn === null) {
                    this._initGalleryButton();
                }
                if (this.showToggleIcon === true && this.getNumberOfCameras() > 1 && this._toggleCamBtn === null) {
                    this._initToggleCameraButton();
                }
                if (this.showCaptureIcon === true && this._takePicBtn === null) {
                    this._initTakePicButton();
                }
            }
        }
        catch (ex) {
            camera_plus_common_1.CLog('_initDefaultButtons error', ex);
        }
    };
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", String)
    ], CameraPlus.prototype, "flashOnIcon", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", String)
    ], CameraPlus.prototype, "flashOffIcon", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", String)
    ], CameraPlus.prototype, "toggleCameraIcon", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlus.prototype, "confirmPhotos", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlus.prototype, "saveToGallery", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", String)
    ], CameraPlus.prototype, "takePicIcon", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", String)
    ], CameraPlus.prototype, "galleryIcon", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlus.prototype, "insetButtons", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", Number)
    ], CameraPlus.prototype, "insetButtonsPercent", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlus.prototype, "enableVideo", void 0);
    __decorate([
        camera_plus_common_1.GetSetProperty(),
        __metadata("design:type", Boolean)
    ], CameraPlus.prototype, "isRecording", void 0);
    return CameraPlus;
}(camera_plus_common_1.CameraPlusBase));
exports.CameraPlus = CameraPlus;
//# sourceMappingURL=camera-plus.android.js.map