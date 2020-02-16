var fs = require('fs');

// ファイルサイズの取得、ない時は-1
exports.getFileSize = function (filePath) {
    try {
        // ステータス取得で存在しない時エラーにする
        var fstat = require('fs').statSync(filePath)
        return fstat.size
    }
    catch (e) {
        return -1
    }
}