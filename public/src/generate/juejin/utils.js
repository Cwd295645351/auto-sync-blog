const FileUtils = require("../common/FileUtils");
const BASE_DATA = require("../common/base");
const BASE_ARTICLE_DATA = require("../common/base-article");

// 更新年月的文档（YYYYMM）
function updateYYMM(startyymm, addData, dirPath, countMap, userBean) { // 更新文档
    var filePath = dirPath + startyymm + ".md"; // 文件路径 
    var fileData = FileUtils.getFileData(filePath, BASE_DATA.YYMM_TEMPLATE_PATH); // 获取文件内容（不存在则获取模板内容）
    // 添加
    fileData = fileData.replaceAll("&{author}&", userBean["user_name"]) // 作者
    fileData += BASE_ARTICLE_DATA.BadgeLabelMap.new;
    // 添加月的文章总数（这个可以到写入月数据时添加）
    FileUtils.updateArticleFile(filePath, fileData, addData, startyymm, countMap);
}

// 更新年的文档（YYYY）
function updateYY(startyymm, addData, dirPath, countMap, userBean) { // 更新文档
    const yy = startyymm.substring(0, 4);
    var filePath = dirPath + yy + ".md"; // 文件路径 
    var fileData = FileUtils.getFileData(filePath, BASE_DATA.YY_TEMPLATE_PATH); // 获取文件内容（不存在则获取模板内容）
    // 添加
    fileData = fileData.replaceAll("&{author}&", userBean["user_name"]) // 作者
    var findPosition = fileData.indexOf("&{count}&");
    if (findPosition !== -1) { // 存在这个更新
        fileData = fileData.replaceAll("&{count}&", countMap[yy]);
        for (const keyYM in countMap) {
            if (keyYM.length > 4) {
                var mm = keyYM.substring(4);
                fileData = fileData.replaceAll("&{" + mm + "}&", countMap[keyYM]);
            }
        }
        const regex = /&\{(0[1-9]|1[0-2])\}&/g;
        fileData = fileData.replace(regex, "-");
    }
    // 添加月的文章总数（这个可以到写入月数据时添加）
    FileUtils.updateArticleFile(filePath, fileData, addData, startyymm, countMap);
}

function updateArticleMap(articleMap, countMap, userBean) {
    var yymmMapList = []; // 年月日的已经排序好，不过是倒序的，所以遍历一般好让年月的时间正序起来
    articleMap.forEach((strMap, yymm) => {
        yymmMapList.push({
            yymm,
            strMap
        });
    });
    // console.log(yymmMapList);
    // return;
    for (var backIndex in yymmMapList) {
        var oneMap = yymmMapList[yymmMapList.length - backIndex - 1];
        var {
            yymm,
            strMap
        } = oneMap;
        // console.log(oneMap, str, yymm)
        const {
            str
        } = strMap;
        updateCommon(yymm, str, BASE_DATA.DOCS_SORT_PATH, countMap, userBean);
    }
}

function updateHotArticleColumnList(columnHotList) {
    for (var i = 0; i < columnHotList.length; i++) {
        var articleHotColumn = columnHotList[i];
        var {
            idAndTitile, // 还有个user_name
            columnCountMap,
            articleMap,
        } = articleHotColumn;
        var yymmMapList = []; // 年月日的已经排序好，不过是倒序的，所以遍历一般好让年月的时间正序起来
        articleMap.forEach((strMap, yymm) => {
            yymmMapList.push({
                yymm,
                strMap,
            });
        });
        var commonMap = {
            idAndTitile,
            columnCountMap,
        };
        // console.log(yymmMapList);
        // return;
        updateHotColumn(commonMap, BASE_DATA.DOCS_SORT_PATH);
        for (var backIndex in yymmMapList) {
            var oneMap = yymmMapList[yymmMapList.length - backIndex - 1];
            updateArticleHotColumn(commonMap, oneMap, BASE_DATA.DOCS_SORT_PATH);
        }
    }
}

// 推荐专栏
function updateHotColumn(commonMap, dirPath) {
    const columnDirPath = dirPath + "column/";
    // var isMkHotDir = FileUtils.mkdirsSync(hotDirPath);
    var isMkMyDir = FileUtils.mkdirsSync(columnDirPath);
    if (!isMkMyDir) {
        console.log('新建文件夹有误！', "isMkMyDir", isMkMyDir, );
        return;
    }
    const {
        idAndTitile,
        columnCountMap,
    } = commonMap;
    var strList = idAndTitile.split("&&"); // [0]是id，[1]是标题，[2]是对应专栏的作者名
    var filePath = columnDirPath + "推荐专栏.md";
    var fileData = FileUtils.getFileData(filePath, BASE_DATA.COLUMN_HOT_TEMPLATE_PATH);
    // var templateValue = "- [{columnName}](hot/{columnName}) **文章数：{postTotal}**";
    var templateValue = "|**[{columnName}](my/{columnName})**|{postTotal}|";
    templateValue = templateValue.replaceAll("{columnName}", strList[1]).replaceAll("{postTotal}", columnCountMap["postTotal"]);
    fileData = fileData.replaceAll("&{author}&", strList[2]) // 作者
    fileData += templateValue + "\r\n";
    FileUtils.updateFile(filePath, fileData);
}

function updateArticleHotColumn(commonMap, oneMap, dirPath) {
    const hotDirPath = dirPath + "column/hot/";
    var isMkHotDir = FileUtils.mkdirsSync(hotDirPath);
    if (!isMkHotDir) {
        console.log('新建文件夹有误！', "isMkHotDir", isMkHotDir, );
        return;
    }
    const {
        yymm,
        strMap,
    } = oneMap;
    const {
        str
    } = strMap;
    const {
        idAndTitile,
        columnCountMap,
    } = commonMap;
    var strList = idAndTitile.split("&&"); // [0]是id，[1]是标题，[2]是对应专栏的作者名
    const fileName = strList[1];
    var filePath = hotDirPath + fileName + ".md"; // 文件路径 
    var fileData = FileUtils.getFileData(filePath, BASE_DATA.COLUMN_ARTICLE_TEMPLATE_PATH); // 获取文件内容（不存在则获取模板内容）
    // 添加
    fileData = fileData.replaceAll("&{author}&", strList[2]) // 作者
        .replaceAll("&{title}&", fileName);
    var findPosition = fileData.indexOf("&{postTotal}&");
    if (findPosition !== -1) { // 存在更新

        fileData = fileData.replaceAll("&{postTotal}&", columnCountMap["postTotal"]); // 所有文章总数
        fileData = initYearTotal(fileData, columnCountMap); // 初始化的年文章数量
    }
    // 添加月的文章总数（这个可以到写入月数据时添加）
    FileUtils.updateArticleFile(filePath, fileData, str, yymm, columnCountMap);

}

function updateArticleColumnList(columnList, userBean) {
    for (var i = 0; i < columnList.length; i++) {
        var articleColumn = columnList[i];
        var {
            idAndTitile,
            columnCountMap,
            articleMap,
        } = articleColumn;
        var yymmMapList = []; // 年月日的已经排序好，不过是倒序的，所以遍历一般好让年月的时间正序起来
        articleMap.forEach((strMap, yymm) => {
            yymmMapList.push({
                yymm,
                strMap,
            });
        });
        var commonMap = {
            idAndTitile,
            columnCountMap,
        };
        // console.log(yymmMapList);
        // return;
        for (var backIndex in yymmMapList) {
            var oneMap = yymmMapList[yymmMapList.length - backIndex - 1];
            updateArticleColumn(commonMap, oneMap, BASE_DATA.DOCS_SORT_PATH, userBean);
        }
    }
    updateColumn(columnList, commonMap, BASE_DATA.DOCS_SORT_PATH, userBean);
}

// 更新专栏md
function updateColumn(columnList, commonMap, dirPath, userBean) {
    const columnDirPath = dirPath + "column/";
    var isMkMyDir = FileUtils.mkdirsSync(columnDirPath);
    if (!isMkMyDir) {
        console.log('新建文件夹有误！', "isMkMyDir", isMkMyDir, );
        return;
    }
    // console.log("columnList", columnList)
    // console.log("commonMap", commonMap)
    let count = 0;
    let uColumnOne = "";
    const templateValue = "**[{columnName}](my/{columnName})**|{postTotal}";
    for (var i = 0; i < columnList.length; i++) {
        var articleColumn = columnList[i];
        var {
            idAndTitile,
            columnCountMap,
            articleMap,
        } = articleColumn;
        var strList = idAndTitile.split("&&"); // [0]是id，[1]是标题
        uColumnOne += "|" + templateValue.replaceAll("{columnName}", strList[1]).replaceAll("{postTotal}", columnCountMap["postTotal"]);
        count++;
        if (count === 3) {
            var filePath = columnDirPath + "我的专栏.md";
            var fileData = FileUtils.getFileData(filePath, BASE_DATA.COLUMN_MY_TEMPLATE_PATH);
            fileData += uColumnOne + "|\r\n";
            FileUtils.updateFile(filePath, fileData);
            count = 0;
            uColumnOne = "";
        }
    }
    var fileData = FileUtils.getFileData(filePath, BASE_DATA.COLUMN_MY_TEMPLATE_PATH);
    if (count > 0 && count < 3) {
        fileData += uColumnOne + "|\r\n";
    }
    fileData = fileData.replaceAll("&{author}&", userBean["user_name"]) // 作者
    FileUtils.updateFile(filePath, fileData);

    return;
    // throw new Error("报错了啊的", columnList)

    // const columnDirPath = dirPath + "column/";
    // // var isMkHotDir = FileUtils.mkdirsSync(hotDirPath);
    // var isMkMyDir = FileUtils.mkdirsSync(columnDirPath);
    // if (!isMkMyDir) {
    //     console.log('新建文件夹有误！', "isMkMyDir", isMkMyDir, );
    //     return;
    // }
    // const {
    //     idAndTitile,
    //     columnCountMap,
    // } = commonMap;
    // var strList = idAndTitile.split("&&"); // [0]是id，[1]是标题
    // var filePath = columnDirPath + "我的专栏.md";
    // var fileData = FileUtils.getFileData(filePath, BASE_DATA.COLUMN_MY_TEMPLATE_PATH);
    // // var templateValue = "- [{columnName}](my/{columnName}) **文章数：{postTotal}**";
    // var templateValue = "|**[{columnName}](my/{columnName})**|{postTotal}|";
    // templateValue = templateValue.replaceAll("{columnName}", strList[1]).replaceAll("{postTotal}", columnCountMap["postTotal"]);
    // fileData = fileData.replaceAll("&{author}&", userBean["user_name"]) // 作者
    // fileData += templateValue + "\r\n";
    // FileUtils.updateFile(filePath, fileData);
}

function updateArticleColumn(commonMap, oneMap, dirPath, userBean) {
    // const hotDirPath = dirPath + "column/hot/";
    const myDirPath = dirPath + "column/my/";
    // var isMkHotDir = FileUtils.mkdirsSync(hotDirPath);
    var isMkMyDir = FileUtils.mkdirsSync(myDirPath);
    // if (!isMkHotDir || !isMkMyDir) {
    //     console.log('新建文件夹有误！', "isMkHotDir", isMkHotDir, "isMkMyDir", isMkMyDir, );
    //     return;
    // }
    if (!isMkMyDir) {
        console.log('新建文件夹有误！', "isMkMyDir", isMkMyDir, );
        return;
    }
    const {
        yymm,
        strMap,
    } = oneMap;
    const {
        str
    } = strMap;
    const {
        idAndTitile,
        columnCountMap,
    } = commonMap;
    var strList = idAndTitile.split("&&"); // [0]是id，[1]是标题
    const fileName = strList[1];
    var filePath = myDirPath + fileName + ".md"; // 文件路径 
    var fileData = FileUtils.getFileData(filePath, BASE_DATA.COLUMN_ARTICLE_TEMPLATE_PATH); // 获取文件内容（不存在则获取模板内容）

    //     if (fileName == "未分类") {
    //         fileData = fileData.replaceAll(`&{author}&"`, userBean["user_name"] + `"
    // categories: 
    //  - 专栏`) // 未分类专栏
    //     }
    // 添加
    fileData = fileData.replaceAll("&{author}&", userBean["user_name"]) // 作者
        .replaceAll("&{title}&", fileName);
    var findPosition = fileData.indexOf("&{postTotal}&");
    if (findPosition !== -1) { // 存在更新
        fileData = fileData.replaceAll("&{postTotal}&", columnCountMap["postTotal"]); // 所有文章总数
        fileData = initYearTotal(fileData, columnCountMap); // 初始化的年文章数量
    }
    // 添加月的文章总数（这个可以到写入月数据时添加）
    FileUtils.updateArticleFile(filePath, fileData, str, yymm, columnCountMap);
}

// 更新进行一步的公共部分
function updateCommon(startyymm, addData, dirPath, countMap, userBean) {
    var isMkDir = FileUtils.mkdirsSync(dirPath);
    const yy = startyymm.substring(0, 4);
    const yearDirPath = dirPath + yy + "/";
    var isMkYearDir = FileUtils.mkdirsSync(yearDirPath);
    if (!isMkDir || !isMkYearDir) {
        console.log('新建文件夹有误！', "isMkDir：", isMkDir, "isMkYearDir：", isMkYearDir, );
        return;
    }
    updateYYMM(startyymm, addData, yearDirPath, countMap, userBean);
    updateYY(startyymm, addData, yearDirPath, countMap, userBean);
    updateAll(startyymm, addData, dirPath, countMap, userBean);
}

// 更新总的文档（all.md）
function updateAll(startyymm, addData, dirPath, countMap, userBean) { // 更新文档
    // 判断该文档是否存在
    // console.log(dirPath)
    const fileName = "all";
    var filePath = dirPath + fileName + ".md"; // 文件路径 
    var fileData = FileUtils.getFileData(filePath, BASE_DATA.ALL_TEMPLATE_PATH); // 获取文件内容（不存在则获取模板内容）
    // 添加
    fileData = fileData.replaceAll("&{author}&", userBean["user_name"]) // 作者
    var findPosition = fileData.indexOf("&{postTotal}&");
    if (findPosition !== -1) { // 存在更新
        fileData = fileData.replaceAll("&{postTotal}&", countMap["postTotal"]); // 所有文章总数
        fileData = initYearTotal(fileData, countMap); // 初始化的年文章数量
    }
    // 添加月的文章总数（这个可以到写入月数据时添加）
    FileUtils.updateArticleFile(filePath, fileData, addData, startyymm, countMap);
}

// 初始化年文章的统计
function initYearTotal(content, countMap) {
    var yytemplateStr = "**　&{yy}&年**　";
    // console.log(countMap)
    var updateContent = "";
    var updateList = [];
    var yyyyMap = new Map();
    for (var yy in countMap) {
        yy = String(yy);
        if (yy === "postTotal") {
            continue;
        }
        // console.log(yy, yy.length)
        const count = countMap[yy];
        var mm = "";
        if (yy.length > 4) {
            mm = yy.substring(4);
            yy = yy.substring(0, 4);
        }
        var yyyyData = yyyyMap.get(yy);
        var repName = "&{" + mm + "}&";
        if (yyyyData) {
            // 不为空直接替换
            yyyyData = yyyyData.replaceAll("&{monthTotal}&", count).replaceAll(repName, count);
        } else {
            // 为空的时候，获取模板，并进行修改
            yyyyData = BASE_ARTICLE_DATA.AllMonthSortTemplate.replaceAll("&{monthName}&", yy).replaceAll("&{monthTotal}&", count) + "\r\n";
            yyyyMap.set(yy, yyyyData);
        }
        yyyyMap.set(yy, yyyyData);
    }
    // 把其他的值都置为 - 
    const regex = /&\{(0[1-9]|1[0-2])\}&/g;
    // for (const [key, value] of yyyyMap) {
    //     yyyyMap.set(key, value.replace(regex, '-'));
    // }
    // console.log(yyyyMap)
    var yyyyList = Array.from(yyyyMap.values()).slice().reverse();
    var yyyyListStr = yyyyList.join('').replace(regex, "-");
    // console.log(yyyyMap)
    // console.log(content)
    // console.log(countMap)
    // console.log(yyyyList)
    // console.log(yyyyListStr)

    const templateValue = "<!-- 目录总的模板 -->";
    var findTemplatePosition = content.indexOf(templateValue);
    content = FileUtils.updateOptPosition(findTemplatePosition, yyyyListStr, content);
    // console.log(content)
    // throw new Error('抛出错误');
    return content;
}

module.exports = {
    updateArticleMap,
    updateArticleColumnList,
    updateHotArticleColumnList,
}