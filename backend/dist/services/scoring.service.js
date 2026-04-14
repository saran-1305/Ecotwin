"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateScore = void 0;
const calculateScore = (title, description = '') => {
    const content = (title + ' ' + description).toLowerCase();
    // Default values
    let score = 65;
    let carbon = "Med";
    let recyclability = "50%";
    let labor = "B";
    if (content.includes("plastic") || content.includes("polyester") || content.includes("synthetic")) {
        score = 35;
        carbon = "High";
        recyclability = "20%";
        labor = "C";
    }
    else if (content.includes("steel") || content.includes("glass") || content.includes("bamboo") || content.includes("wood")) {
        score = 92;
        carbon = "Low";
        recyclability = "100%";
        labor = "A";
    }
    else if (content.includes("organic") || content.includes("cotton") || content.includes("hemp")) {
        score = 85;
        carbon = "Low";
        recyclability = "90%";
        labor = "A+";
    }
    return { score, carbon, recyclability, labor };
};
exports.calculateScore = calculateScore;
