import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { useFAQs } from '../../../hooks/useContent';

const FAQItem = ({ item, isOpen, onClick }) => {
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={onClick}
                className="w-full py-3 md:py-4 flex items-center justify-between text-left group transition-colors"
                aria-expanded={isOpen}
            >
                <span className={`text-base md:text-lg font-semibold font-['Poppins'] transition-colors ${isOpen ? 'text-primary' : 'text-gray-800 group-hover:text-primary'}`}>
                    {item.question}
                </span>
                <div className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4 text-gray-600 leading-relaxed text-sm md:text-base pr-4 md:pr-12">
                            {item.answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQSection = () => {
    const { data: allFaqs = [] } = useFAQs();
    const faqs = allFaqs.filter(f => f.isActive !== false);
    const [openIndex, setOpenIndex] = useState(0);

    if (faqs.length === 0) return null;

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <section className="bg-white pt-0 pb-2 md:pt-0 md:pb-12">
            <div className="container mx-auto px-2 md:px-4">

                {/* Centered Heading */}
                <div className="text-center mb-8 md:mb-14">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl md:text-4xl font-['Poppins'] font-bold text-gray-900 mb-3"
                    >
                        Frequently Asked <span className="text-primary">Questions</span>
                    </motion.h2>
                    <div className="w-24 md:w-32 h-1 bg-primary mx-auto rounded-full" />
                </div>

                {/* Centered FAQ List */}
                <div className="max-w-screen-2xl mx-auto">
                    <div className="bg-gray-50/50 rounded-3xl py-8 md:py-12 px-6 md:px-12 border border-gray-100">
                        {faqs.map((faq, index) => (
                            <FAQItem
                                key={faq._id || faq.id || index}
                                item={faq}
                                isOpen={openIndex === index}
                                onClick={() => toggleFAQ(index)}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default FAQSection;
