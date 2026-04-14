import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ICONS } from '../constants';

const steps = [
    "Extracting product signals...",
    "Evaluating sustainability patterns...",
    "Generating SDG + recommendations..."
];

const PipelineSteps = () => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 1200); // Switch every 1.2s

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-md mx-auto space-y-4 py-8">
            {steps.map((text, index) => (
                <div key={index} className="flex items-center gap-4">
                    <div className="relative flex-shrink-0 w-8 h-8 flex items-center justify-center">
                        {index < currentStep ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#CFE5DA]0">
                                <ICONS.CheckCircle className="w-6 h-6" />
                            </motion.div>
                        ) : index === currentStep ? (
                            <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                        ) : (
                            <div className="w-3 h-3 bg-emerald-100 rounded-full" />
                        )}
                    </div>
                    <span className={`text-sm font-medium transition-colors duration-300 ${index <= currentStep ? 'text-[#CFE5DA]' : 'text-[#CFE5DA]/40'}`}>
                        {text}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default PipelineSteps;
