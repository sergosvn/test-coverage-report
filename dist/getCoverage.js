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
exports.calculateCoverage = void 0;
const fs = __importStar(require("fs"));
const xml2js = __importStar(require("xml2js"));
// Function to calculate coverage from clover.xml
const calculateCoverage = async (cloverFile) => {
    // Read the clover.xml file
    const xmlData = fs.readFileSync(cloverFile, 'utf-8');
    // Parse the XML data
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);
    // Initialize totals
    let totalStatements = 0;
    let coveredStatements = 0;
    // Traverse through the XML structure to find metrics
    if (result && result.coverage && result.coverage.project) {
        const metrics = result.coverage.project[0].metrics[0];
        totalStatements += parseInt(metrics.$.statements, 10);
        coveredStatements += parseInt(metrics.$.coveredstatements, 10);
    }
    // Calculate coverage percentage
    if (totalStatements === 0) {
        return 0.0; // Avoid division by zero
    }
    return (coveredStatements / totalStatements) * 100;
};
exports.calculateCoverage = calculateCoverage;
//# sourceMappingURL=getCoverage.js.map