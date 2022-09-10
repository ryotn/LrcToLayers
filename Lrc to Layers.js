/*
  Lrc to Layers
    
  Lrcファイルをテキストレイヤーに変換するスクリプトです。
  行の先頭に表示開始時間、行の最後に表示終了時間を入れてください。

  ・例
  [00:10:00]あいうえお[00:20:00]

  ・結果
  「あいうえお」と書かれたテキストレイヤーが10秒～20秒の間に表示されるように作成される。

  Lrcファイルの生成には「RhythmicaLyrics」というソフトがおすすめです。

  使用方法
    1.ファイル→スクリプト→スクリプトファイルの実行から実行.

  動作環境
    Adobe After Effects CC 2022(22.60)で確認

  ライセンス
    MIT License

  バージョン情報
    2022/09/10 Ver 1.0.0 Release

  ※このスクリプトはあかつきみさき(みくちぃP)氏のText to Layers(ver 1.2.0)を元に作成しています。
    http://sunrisemoon.net/program/ae/script/TexttoLayers/
*/
/// 
(function () {
    var log = function (str) {
        $.writeln(str);
    };
    var _STRINGS = {
        JP: {
            LOAD: "ファイルを開く",
        },
        EN: {
            LOAD: "Load File",
        }
    };
    var LOAD_SUPPORT_EXTENTION = ["Lrc files:*.lrc", "Text files:*.txt"];
    var getLocalizedText = function (str) {
        if (app.isoLanguage == "ja_JP") {
            return str.jp;
        }
        else {
            return str.en;
        }
    };
    var isCompActive = function (comp) {
        if (!(comp && comp instanceof CompItem)) {
            return false;
        }
        else {
            return true;
        }
    };
    var timeTagParser = function (strTime) {
        var time = 0.0;
        if (strTime != undefined) {
            var strTmpTime = strTime[0].replace("[","").replace("]","");
            var arrTime = strTmpTime.split(":");
            if(arrTime.length == 3)time = (arrTime[0] * 60) + (arrTime[1] * 1) + (arrTime[2] / 100);
        }

        return time;
    }
    var lrcTagParser = function (line) {
        var startTime = line.match(/^\[([0-9]+):([0-9]+):([0-9]+)\]/g);
        var endTime = line.match(/\[([0-9]+):([0-9]+):([0-9]+)\]$/g);
        var tags = line.match(/\[([0-9]+):([0-9]+):([0-9]+)\]/g);
        var lyrics = line;
        if (tags != undefined){
            for (var i = 0; i < tags.length; ++i) {
                lyrics = lyrics.replace(tags[i],"");
            }
        }

        startTime = timeTagParser(startTime);
        endTime = timeTagParser(endTime);
        
        var json = {
            "originalStr"   : line,
            "lyrics"        : lyrics,
            "startTime"     : startTime,
            "endTime"       : endTime
        }

        return json
    };
    var main = function () {
        var actComp = app.project.activeItem;
        if (!isCompActive(actComp)) {
            return 0;
        }
        var folderPath = Folder.desktop;
        if (app.project.file != null) {
            folderPath = app.project.file.parent;
        }
        var fileName = decodeURIComponent(folderPath);
        var filePath = new File(fileName).openDlg(getLocalizedText({ jp: _STRINGS.JP.LOAD, en: _STRINGS.EN.LOAD }), LOAD_SUPPORT_EXTENTION);
        if (filePath == null) {
            return 0;
        }
        var line = [];
        var splitText = "\n";
        try {
            filePath.open("r");
            line = filePath.read().split(splitText);
            filePath.close();
        }
        catch (err) {
            alert(err, "Lrc to Layers");
        }
        for (var i = line.length; i >= 0; i--) {
            if (!line[i]) {
                continue;
            }
            var json = lrcTagParser(line[i]);
            var textLayer = actComp.layers.addText(json.lyrics);
            textLayer.inPoint = json.startTime;
            textLayer.outPoint = json.endTime;
            var inPoint = textLayer.inPoint;
            var outPoint = textLayer.outPoint;
            log("json.lyrics:" + json.lyrics + " inPoint:" + inPoint + " outPoint:" + outPoint);
        }
    };
    app.beginUndoGroup("Lrc to Layers");
    main();
    app.endUndoGroup();
}).call(this);
