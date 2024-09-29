"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const commentCoverage_1 = require("./commentCoverage");
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const getCoverage_1 = require("./getCoverage");
const eventInfo_1 = require("./eventInfo");
const main = async () => {
    try {
        const eventInfo = (0, eventInfo_1.getEventInfo)();
        const files = findFiles(eventInfo.cloverPath);
        const calculatedFiles = await calculatePercentageAll(files);
        const commentBody = (0, commentCoverage_1.buildBody)(eventInfo, calculatedFiles);
        await (0, commentCoverage_1.commentCoverage)(eventInfo, commentBody);
    }
    catch (error) {
        core.setFailed(error.message);
    }
};
exports.main = main;
const calculatePercentageAll = async (arr) => {
    const promises = arr.map((reportFile) => calculatePercentage(reportFile));
    return Promise.all(promises);
};
const calculatePercentage = async (reportFile) => {
    reportFile.percentage = await (0, getCoverage_1.calculateCoverage)(reportFile.path);
    return reportFile;
};
const findFiles = (pathName) => {
    const regexPattern = /(?<serviceName>[a-z]+[-[a-z]+]?)-(?<testType>behat|phpunit)-coverage\.xml/;
    const result = [];
    fs.readdirSync(pathName).forEach((file) => {
        const matches = regexPattern.exec(file);
        if (!matches) {
            return;
        }
        result.push({
            path: path.join(pathName, file),
            serviceName: matches?.groups?.serviceName,
            testType: matches?.groups?.testType,
        });
    });
    return result;
};
//# sourceMappingURL=main.js.map