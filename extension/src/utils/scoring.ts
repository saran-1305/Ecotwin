export interface ProductScore {
    score: number;
    carbon: string;
    recyclability: string;
    labor: string;
}

export const analyzeProduct = (title: string): ProductScore => {
    const lowerTitle = title.toLowerCase();

    // Default values
    let score = 65;
    let carbon = "Med";
    let recyclability = "50%";
    let labor = "B";

    if (lowerTitle.includes("plastic") || lowerTitle.includes("polyester")) {
        score = 35;
        carbon = "High";
        recyclability = "20%";
        labor = "C";
    } else if (lowerTitle.includes("steel") || lowerTitle.includes("glass") || lowerTitle.includes("bamboo")) {
        score = 92;
        carbon = "Low";
        recyclability = "100%";
        labor = "A";
    } else if (lowerTitle.includes("organic") || lowerTitle.includes("cotton")) {
        score = 85;
        carbon = "Low";
        recyclability = "90%";
        labor = "A+";
    }

    return { score, carbon, recyclability, labor };
};
