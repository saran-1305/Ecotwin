
export const calculateSDGValues = (overallScore: number, carbonImpactScore: number, circularityScore: number) => {
    // Clamp values to ensure they are within realistic ranges
    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

    return [
        {
            sdg: 12,
            score: clamp(overallScore + 10, 25, 95),
            description: "Responsible Consumption & Production",
        },
        {
            sdg: 13,
            score: clamp(carbonImpactScore, 20, 90),
            description: "Climate Action",
        },
        {
            sdg: 9,
            score: clamp(circularityScore - 5, 20, 85),
            description: "Industry, Innovation, and Infrastructure",
        },
    ];
};

export const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    }).format(date);
};
