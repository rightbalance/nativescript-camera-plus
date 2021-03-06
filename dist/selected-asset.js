"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectedAsset = void 0;
var application = require("tns-core-modules/application");
var image_asset_1 = require("tns-core-modules/image-asset");
var image_source_1 = require("tns-core-modules/image-source");
var MediaStore = function () { return android.provider.MediaStore; };
var DocumentsContract = function () { return android.provider.DocumentsContract; };
var BitmapFactory = function () { return android.graphics.BitmapFactory; };
var SelectedAsset = (function (_super) {
    __extends(SelectedAsset, _super);
    function SelectedAsset(uri) {
        var _this = _super.call(this, SelectedAsset._calculateFileUri(uri)) || this;
        _this._uri = uri;
        _this._thumbRequested = false;
        return _this;
    }
    SelectedAsset.prototype.data = function () {
        return Promise.reject(new Error('Not implemented.'));
    };
    SelectedAsset.prototype.getImage = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                resolve(_this.decodeUri(_this._uri, options));
            }
            catch (ex) {
                reject(ex);
            }
        });
    };
    SelectedAsset.prototype.getImageData = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                if (!_this._data) {
                    var bb = _this.getByteBuffer(_this._uri);
                    _this._data = ArrayBuffer.from(bb);
                }
                resolve(_this._data);
            }
            catch (ex) {
                reject(ex);
            }
        });
    };
    Object.defineProperty(SelectedAsset.prototype, "thumb", {
        get: function () {
            if (!this._thumbRequested) {
                this.decodeThumbUri();
            }
            return this._thumb;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SelectedAsset.prototype, "thumbAsset", {
        get: function () {
            return this._thumbAsset;
        },
        enumerable: false,
        configurable: true
    });
    SelectedAsset.prototype.setThumbAsset = function (value) {
        this._thumbAsset = value;
        this.notifyPropertyChange('thumbAsset', value);
    };
    Object.defineProperty(SelectedAsset.prototype, "uri", {
        get: function () {
            return this._uri.toString();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SelectedAsset.prototype, "fileUri", {
        get: function () {
            if (!this._fileUri) {
                this._fileUri = SelectedAsset._calculateFileUri(this._uri);
            }
            return this._fileUri;
        },
        enumerable: false,
        configurable: true
    });
    SelectedAsset._calculateFileUri = function (uri) {
        var isKitKat = android.os.Build.VERSION.SDK_INT >= 19;
        if (isKitKat && DocumentsContract().isDocumentUri(application.android.context, uri)) {
            if (SelectedAsset.isExternalStorageDocument(uri)) {
                var docId = DocumentsContract().getDocumentId(uri);
                var id = docId.split(':')[1];
                var type = docId.split(':')[0];
                if ('primary' === type.toLowerCase()) {
                    return android.os.Environment.getExternalStorageDirectory() + '/' + id;
                }
            }
            else if (SelectedAsset.isDownloadsDocument(uri)) {
                var id = DocumentsContract().getDocumentId(uri);
                var contentUri = android.content.ContentUris.withAppendedId(android.net.Uri.parse('content://downloads/public_downloads'), long(id));
                return SelectedAsset.getDataColumn(contentUri, null, null);
            }
            else if (SelectedAsset.isMediaDocument(uri)) {
                var docId = DocumentsContract().getDocumentId(uri);
                var split = docId.split(':');
                var type = split[0];
                var id = split[1];
                var contentUri = null;
                if ('image' === type) {
                    contentUri = MediaStore().Images.Media.EXTERNAL_CONTENT_URI;
                }
                else if ('video' === type) {
                    contentUri = MediaStore().Video.Media.EXTERNAL_CONTENT_URI;
                }
                else if ('audio' === type) {
                    contentUri = MediaStore().Audio.Media.EXTERNAL_CONTENT_URI;
                }
                var selection = '_id=?';
                var selectionArgs = [id];
                return SelectedAsset.getDataColumn(contentUri, selection, selectionArgs);
            }
        }
        else {
            if ('content' === uri.getScheme()) {
                return SelectedAsset.getDataColumn(uri, null, null);
            }
            else if ('file' === uri.getScheme()) {
                return uri.getPath();
            }
        }
        return undefined;
    };
    SelectedAsset.getDataColumn = function (uri, selection, selectionArgs) {
        var cursor = null;
        var columns = [MediaStore().MediaColumns.DATA];
        var filePath;
        try {
            cursor = this.getContentResolver().query(uri, columns, selection, selectionArgs, null);
            if (cursor != null && cursor.moveToFirst()) {
                var column_index = cursor.getColumnIndexOrThrow(columns[0]);
                filePath = cursor.getString(column_index);
                if (filePath) {
                    return filePath;
                }
            }
        }
        catch (e) {
            console.log(e);
        }
        finally {
            if (cursor) {
                cursor.close();
            }
        }
        return undefined;
    };
    SelectedAsset.isExternalStorageDocument = function (uri) {
        return 'com.android.externalstorage.documents' === uri.getAuthority();
    };
    SelectedAsset.isDownloadsDocument = function (uri) {
        return 'com.android.providers.downloads.documents' === uri.getAuthority();
    };
    SelectedAsset.isMediaDocument = function (uri) {
        return 'com.android.providers.media.documents' === uri.getAuthority();
    };
    SelectedAsset.prototype.decodeThumbUri = function () {
        var REQUIRED_SIZE = {
            maxWidth: 100,
            maxHeight: 100
        };
        this._thumb = this.decodeUri(this._uri, REQUIRED_SIZE);
        this.notifyPropertyChange('thumb', this._thumb);
    };
    SelectedAsset.prototype.decodeThumbAssetUri = function () {
        var REQUIRED_SIZE = {
            maxWidth: 100,
            maxHeight: 100
        };
        this._thumbAsset = this.decodeUriForImageAsset(this._uri, REQUIRED_SIZE);
        this.notifyPropertyChange('thumbAsset', this._thumbAsset);
    };
    SelectedAsset.prototype.getSampleSize = function (uri, options) {
        var boundsOptions = new android.graphics.BitmapFactory.Options();
        boundsOptions.inJustDecodeBounds = true;
        BitmapFactory().decodeStream(this.openInputStream(uri), null, boundsOptions);
        var outWidth = boundsOptions.outWidth;
        var outHeight = boundsOptions.outHeight;
        var scale = 1;
        if (options) {
            var targetSize = options.maxWidth < options.maxHeight ? options.maxWidth : options.maxHeight;
            while (!(this.matchesSize(targetSize, outWidth) || this.matchesSize(targetSize, outHeight))) {
                outWidth /= 2;
                outHeight /= 2;
                scale *= 2;
            }
        }
        return scale;
    };
    SelectedAsset.prototype.matchesSize = function (targetSize, actualSize) {
        return targetSize && actualSize / 2 < targetSize;
    };
    SelectedAsset.prototype.decodeUri = function (uri, options) {
        var downsampleOptions = new android.graphics.BitmapFactory.Options();
        downsampleOptions.inSampleSize = this.getSampleSize(uri, options);
        var bitmap = BitmapFactory().decodeStream(this.openInputStream(uri), null, downsampleOptions);
        var image = new image_source_1.ImageSource();
        image.setNativeSource(bitmap);
        return image;
    };
    SelectedAsset.prototype.decodeUriForImageAsset = function (uri, options) {
        var downsampleOptions = new android.graphics.BitmapFactory.Options();
        downsampleOptions.inSampleSize = this.getSampleSize(uri, options);
        var bitmap = BitmapFactory().decodeStream(this.openInputStream(uri), null, downsampleOptions);
        return new image_asset_1.ImageAsset(bitmap);
    };
    SelectedAsset.prototype.getByteBuffer = function (uri) {
        var file = null;
        try {
            file = SelectedAsset.getContentResolver().openAssetFileDescriptor(uri, 'r');
            var length_1 = file.getLength();
            var buffer = java.nio.ByteBuffer.allocateDirect(length_1);
            var bytes = buffer.array();
            var stream = file.createInputStream();
            var reader = new java.io.BufferedInputStream(stream, 4096);
            reader.read(bytes, 0, bytes.length);
            return buffer;
        }
        finally {
            if (file) {
                file.close();
            }
        }
    };
    SelectedAsset.prototype.openInputStream = function (uri) {
        return SelectedAsset.getContentResolver().openInputStream(uri);
    };
    SelectedAsset.getContentResolver = function () {
        return application.android.nativeApp.getContentResolver();
    };
    return SelectedAsset;
}(image_asset_1.ImageAsset));
exports.SelectedAsset = SelectedAsset;
//# sourceMappingURL=selected-asset.js.map