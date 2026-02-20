
﻿import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '@/lib/apiUrl';

const FloatingContact = () => {
    const phoneNumber = "919000000000"; // Replace with actual number
    const message = "Hi FarmLyf, I have a query about your products!";

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    const API_URL = API_BASE_URL;
    const { user } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const chatScrollRef = useRef(null);
    const typingTimersRef = useRef([]);
    const [analysisStageIndex, setAnalysisStageIndex] = useState(0);
    const [analysisDotCount, setAnalysisDotCount] = useState(1);
    const [products, setProducts] = useState([]);
    const [form, setForm] = useState({
        name: '',
        age: '',
        gender: '',
        heightCm: '',
        weightKg: '',
        activity: 'moderate',
        goal: 'maintain',
        diet: 'balanced',
        allergies: ''
    });
    const MAX_RECOMMENDATIONS = 5;

    const normalizeText = (value) => (value || '').toString().toLowerCase().trim();
    const stripHtml = (value) => (value || '').toString().replace(/<[^>]*>/g, ' ');
    const tokenize = (value) =>
        normalizeText(value)
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((t) => t.length >= 3);

    const PRODUCT_FIELD_WEIGHTS = {
        name: 4,
        category: 2,
        subcategory: 2,
        tag: 1,
        description: 5,
        benefits: 4,
        specifications: 3,
        nutrition: 4,
        faqs: 2,
        contents: 2
    };

    const buildProductKnowledge = (product) => {
        if (!product) return { weightedTokens: [], fullText: '' };
        const fieldValues = {
            name: product.name,
            category: product.category,
            subcategory: product.subcategory,
            tag: product.tag,
            description: stripHtml(product.description),
            benefits: (product.benefits || []).map((b) => `${b?.title || ''} ${b?.description || ''}`).join(' '),
            specifications: (product.specifications || []).map((s) => `${s?.label || ''} ${s?.value || ''}`).join(' '),
            nutrition: (product.nutrition || []).map((n) => `${n?.label || ''} ${n?.value || ''}`).join(' '),
            faqs: (product.faqs || []).map((f) => `${f?.q || ''} ${f?.a || ''}`).join(' '),
            contents: (product.contents || []).map((c) => `${c?.productName || ''} ${c?.quantity || ''}`).join(' ')
        };

        const weightedTokens = [];
        Object.entries(fieldValues).forEach(([key, text]) => {
            const tokens = tokenize(text);
            const weight = PRODUCT_FIELD_WEIGHTS[key] || 1;
            for (let i = 0; i < weight; i += 1) {
                weightedTokens.push(...tokens);
            }
        });

        return {
            weightedTokens,
            fullText: Object.values(fieldValues).filter(Boolean).join(' ')
        };
    };

    const buildIntentTokens = () => {
        const goal = normalizeText(form.goal);
        const activity = normalizeText(form.activity);
        const diet = normalizeText(form.diet);
        const allergy = normalizeText(form.allergies);

        const goalMap = {
            lose: ['weight', 'loss', 'fiber', 'high-fiber', 'light', 'low-sugar', 'roasted', 'seed', 'almond', 'walnut', 'pistachio'],
            gain: ['weight', 'gain', 'energy', 'calorie', 'protein', 'dates', 'raisins', 'fig', 'cashew', 'mix', 'trail'],
            maintain: ['balanced', 'daily', 'nuts', 'dry', 'fruit', 'snack', 'omega', 'protein', 'fiber']
        };
        const activityMap = {
            low: ['light', 'snack', 'fiber', 'digestive'],
            moderate: ['balanced', 'energy', 'protein', 'daily'],
            high: ['energy', 'protein', 'recovery', 'stamina', 'trail', 'mix']
        };
        const dietMap = {
            balanced: ['balanced', 'mixed', 'nutrient', 'vitamin', 'minerals'],
            highprotein: ['protein', 'amino', 'muscle', 'recovery'],
            lowcarb: ['low-carb', 'healthy-fat', 'fat', 'protein', 'nuts']
        };

        const tokens = [
            ...(goalMap[goal] || goalMap.maintain),
            ...(activityMap[activity] || activityMap.moderate),
            ...(dietMap[diet] || dietMap.balanced),
            ...tokenize(allergy)
        ];
        return tokens;
    };

    const getAllergyKeywords = (allergiesInput) => {
        const text = normalizeText(allergiesInput);
        if (!text) return [];
        const keywords = new Set();
        if (text.includes('peanut')) {
            ['peanut', 'groundnut'].forEach((k) => keywords.add(k));
        }
        if (text.includes('dairy') || text.includes('milk')) {
            ['dairy', 'milk', 'butter', 'ghee', 'cheese'].forEach((k) => keywords.add(k));
        }
        if (text.includes('gluten') || text.includes('wheat')) {
            ['gluten', 'wheat', 'barley', 'rye'].forEach((k) => keywords.add(k));
        }
        if (text.includes('soy')) {
            ['soy', 'soya'].forEach((k) => keywords.add(k));
        }
        if (text.includes('nut')) {
            ['almond', 'cashew', 'pistachio', 'walnut', 'hazelnut', 'pecan', 'macadamia'].forEach((k) => keywords.add(k));
        }
        return Array.from(keywords);
    };

    const curateProducts = (allProducts) => {
        if (!Array.isArray(allProducts) || allProducts.length === 0) return [];
        const allergyKeywords = getAllergyKeywords(form.allergies);
        const intentTokens = buildIntentTokens();
        const intentTokenSet = new Set(intentTokens);

        const scored = allProducts
            .filter((p) => p && p.name)
            .map((p) => {
                const knowledge = buildProductKnowledge(p);
                const text = normalizeText(knowledge.fullText);
                if (allergyKeywords.some((k) => text.includes(k))) return null;
                let score = 0;
                if (p.image || p?.images?.[0] || p?.seoImage) score += 2;
                if (p.price || p?.variants?.[0]?.price) score += 1;
                if (p.inStock !== false) score += 1;
                if ((p.rating || 0) >= 4.5) score += 1;

                const overlapScore = knowledge.weightedTokens.reduce((acc, token) => (
                    acc + (intentTokenSet.has(token) ? 1 : 0)
                ), 0);
                score += overlapScore;

                return { product: p, score, text, overlapScore };
            })
            .filter(Boolean)
            .sort((a, b) => b.score - a.score || b.overlapScore - a.overlapScore || a.text.localeCompare(b.text));

        return scored.slice(0, 25).map((item) => item.product);
    };

    useEffect(() => {
        if (!isOpen) return;
        if (!API_URL) return;
        let active = true;
        fetch(`${API_URL}/products`)
            .then((res) => res.json())
            .then((data) => {
                if (!active) return;
                if (Array.isArray(data)) {
                    setProducts(data.slice(0, 60));
                } else if (Array.isArray(data?.products)) {
                    setProducts(data.products.slice(0, 60));
                }
            })
            .catch(() => {});
        return () => { active = false; };
    }, [isOpen, API_URL]);

    const bmi = useMemo(() => {
        const h = Number(form.heightCm);
        const w = Number(form.weightKg);
        if (!h || !w) return null;
        const m = h / 100;
        return Number((w / (m * m)).toFixed(1));
    }, [form.heightCm, form.weightKg]);

    const bmiCategory = useMemo(() => {
        if (bmi === null) return '';
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Healthy';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    }, [bmi]);

    const scheduleTypingStep = (callback, delay) => {
        const timerId = setTimeout(() => {
            typingTimersRef.current = typingTimersRef.current.filter((id) => id !== timerId);
            callback();
        }, delay);
        typingTimersRef.current.push(timerId);
    };

    const clearTypingTimers = () => {
        typingTimersRef.current.forEach((id) => clearTimeout(id));
        typingTimersRef.current = [];
    };

    const pushMessage = (role, text) => {
        const safeText = String(text || '');
        const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        if (role !== 'assistant') {
            setMessages((prev) => [...prev, { id, role, text: safeText }]);
            return;
        }

        setMessages((prev) => [...prev, { id, role, text: safeText, displayText: '', isTyping: true }]);

        const total = safeText.length;
        if (!total) return;
        const charsPerStep = total > 280 ? 4 : total > 140 ? 3 : 2;
        const stepDelay = total > 280 ? 8 : total > 140 ? 10 : 12;

        let current = 0;
        const typeNext = () => {
            current = Math.min(total, current + charsPerStep);
            setMessages((prev) =>
                prev.map((m) => (m.id === id
                    ? {
                        ...m,
                        displayText: safeText.slice(0, current),
                        isTyping: current < total
                    }
                    : m))
            );

            if (current < total) {
                scheduleTypingStep(typeNext, stepDelay);
            }
        };

        scheduleTypingStep(typeNext, 80);
    };

    const estimateTypingTimeMs = (text) => {
        const safeText = String(text || '');
        const total = safeText.length;
        if (!total) return 0;
        const charsPerStep = total > 280 ? 4 : total > 140 ? 3 : 2;
        const stepDelay = total > 280 ? 8 : total > 140 ? 10 : 12;
        const steps = Math.ceil(total / charsPerStep);
        return 80 + (steps * stepDelay);
    };

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));

    const resetChat = () => {
        clearTypingTimers();
        setStep(0);
        setMessages([]);
        setChatInput('');
        setRecommendations([]);
        setLoading(false);
        setForm((prev) => ({
            ...prev,
            age: '',
            heightCm: '',
            weightKg: '',
            activity: 'moderate',
            goal: 'maintain',
            diet: 'balanced',
            allergies: ''
        }));
    };

    const buildPrompt = (curatedProducts) => {
        const summary = {
            name: form.name,
            age: form.age,
            gender: form.gender,
            heightCm: form.heightCm,
            weightKg: form.weightKg,
            bmi,
            bmiCategory,
            activity: form.activity,
            goal: form.goal,
            diet: form.diet,
            allergies: form.allergies
        };

        const productList = (curatedProducts || []).slice(0, 12).map((p) => ({
            id: p._id || p.id,
            name: p.name,
            category: p.category,
            subcategory: p.subcategory,
            tag: p.tag,
            price: p.price || p?.variants?.[0]?.price,
            slug: p.slug,
            image: p.image || p?.images?.[0] || p?.seoImage,
            description: stripHtml(p.description || ''),
            benefits: (p.benefits || []).map((b) => `${b?.title || ''}: ${b?.description || ''}`),
            specifications: (p.specifications || []).map((s) => `${s?.label || ''}: ${s?.value || ''}`),
            nutrition: (p.nutrition || []).map((n) => `${n?.label || ''}: ${n?.value || ''}`),
            faqs: (p.faqs || []).map((f) => `Q:${f?.q || ''} A:${f?.a || ''}`)
        }));

        return `You are a nutrition assistant for Farmlyf (dry fruits and healthy foods).
User profile: ${JSON.stringify(summary)}
Available products: ${JSON.stringify(productList)}

Task:
1) Explain BMI status in 1-2 sentences.
2) Recommend 3-5 products from the list, with a short reason (max 1 line each).
3) Analyze deeply using product description, benefits, specifications, nutrition, and FAQs.
4) Do not recommend products outside the list.
5) If allergies are listed, avoid those ingredients.
4) Return JSON with keys: bmiSummary, recommendations (array of {name, reason, slug, image}).`;
    };

    const runGemini = async (curatedProducts) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            pushMessage('assistant', 'Set `VITE_GEMINI_API_KEY` in frontend `.env` to enable AI suggestions.');
            return '';
        }
        const prompt = buildPrompt(curatedProducts);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 600
                }
            })
        });
        if (!res.ok) throw new Error('Gemini API failed');
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return text;
    };

    const fallbackRecommendations = (curatedProducts) => {
        const goal = normalizeText(form.goal);
        const list = (curatedProducts || []).slice(0, MAX_RECOMMENDATIONS).map((p) => {
            const knowledge = normalizeText(buildProductKnowledge(p).fullText);
            let reason = 'Nutrient-dense and wholesome.';
            if (goal === 'lose' && (knowledge.includes('fiber') || knowledge.includes('protein'))) {
                reason = 'Supports satiety with fiber/protein-rich nutrition.';
            } else if (goal === 'gain' && (knowledge.includes('energy') || knowledge.includes('calorie'))) {
                reason = 'Good for healthy calorie and energy support.';
            } else if (knowledge.includes('heart') || knowledge.includes('omega')) {
                reason = 'Useful for heart and overall wellness support.';
            }
            return {
                name: p.name,
                reason,
                slug: p.slug,
                image: p.image || p?.images?.[0] || p?.seoImage
            };
        });
        return {
            bmiSummary: bmi ? `Your BMI is ${bmi} (${bmiCategory}).` : 'Your BMI is not available.',
            recommendations: list
        };
    };

    const enrichRecommendations = (list) => {
        return (list || []).map((r) => {
            const match = r.slug ? products.find((p) => p.slug === r.slug) : products.find((p) => p.name === r.name);
            const image = r.image || match?.image || match?.images?.[0] || match?.seoImage || '';
            return { ...r, image };
        });
    };

    const handleGenerate = async () => {
        const curated = curateProducts(products);
        const curatedForUse = curated.length ? curated : products.slice(0, 25);
        setLoading(true);
        try {
            const raw = await runGemini(curatedForUse);
            let parsed = null;
            if (raw) {
                try {
                    parsed = JSON.parse(raw);
                } catch {
                    const jsonMatch = raw.match(/\{[\s\S]*\}/);
                    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
                }
            }
            const final = parsed || fallbackRecommendations(curatedForUse);
            const safeRecommendations = (final.recommendations || []).slice(0, MAX_RECOMMENDATIONS);
            const enriched = enrichRecommendations(safeRecommendations);
            const reply = [
                final.bmiSummary || `Your BMI is ${bmi} (${bmiCategory}).`,
                'Recommended products:',
                ...(enriched || []).map((r) => `- ${r.name} - ${r.reason}`)
            ].join('\n');

            setLoading(false);
            pushMessage('assistant', reply);
            await wait(estimateTypingTimeMs(reply) + 200);
            setRecommendations(enriched || []);
            setStep(10);
        } catch (err) {
            const final = fallbackRecommendations(curatedForUse);
            const enriched = enrichRecommendations(final.recommendations);
            const reply = [
                final.bmiSummary || `Your BMI is ${bmi} (${bmiCategory}).`,
                'Recommended products:',
                ...(enriched || []).map((r) => `- ${r.name} - ${r.reason}`)
            ].join('\n');

            setLoading(false);
            pushMessage('assistant', reply);
            await wait(estimateTypingTimeMs(reply) + 200);
            setRecommendations(enriched || []);
            setStep(10);
        } finally {
            setLoading(false);
        }
    };

    const normalizeGender = (input) => {
        const g = (input || '').toLowerCase();
        if (g.includes('f')) return 'female';
        if (g.includes('o')) return 'other';
        return 'male';
    };

    const askForStep = (nextStep) => {
        setStep(nextStep);
        switch (nextStep) {
            case 1:
                pushMessage('assistant', 'What is your name?');
                break;
            case 2:
                pushMessage('assistant', 'What is your gender? (male / female / other)');
                break;
            case 3:
                pushMessage('assistant', 'How old are you?');
                break;
            case 4:
                pushMessage('assistant', 'Your height in cm? Pick one or type your own:');
                break;
            case 5:
                pushMessage('assistant', 'Your weight in kg? Pick one or type your own:');
                break;
            case 6:
                pushMessage('assistant', 'What\'s your activity level?');
                break;
            case 7:
                pushMessage('assistant', 'What\'s your goal?');
                break;
            case 8:
                pushMessage('assistant', 'Any allergies? Pick one or type your own:');
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        if (messages.length > 0) return;
        if (!user) {
            pushMessage('assistant', 'Please sign in to use Farmlyf Assistant.');
            setStep(99);
            return;
        }
        const name = user?.name || '';
        const gender = user?.gender || '';
        setForm((prev) => ({
            ...prev,
            name,
            gender
        }));

        if (!name) {
            askForStep(1);
            return;
        }
        if (!gender) {
            pushMessage('assistant', `Hii ${name}, welcome to Farmlyf! What is your gender? (male / female / other)`);
            setStep(2);
            return;
        }
        pushMessage('assistant', `Hii ${name}, welcome to Farmlyf!`);
        askForStep(3);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, user, messages.length]);

    useEffect(() => {
        if (!isOpen) return;
        if (!chatScrollRef.current) return;
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }, [messages, isOpen, recommendations]);

    useEffect(() => {
        if (!loading) {
            setAnalysisStageIndex(0);
            setAnalysisDotCount(1);
            return;
        }

        const stageTimer = setInterval(() => {
            setAnalysisStageIndex((prev) => (prev + 1) % 3);
        }, 1500);

        const dotTimer = setInterval(() => {
            setAnalysisDotCount((prev) => (prev % 3) + 1);
        }, 450);

        return () => {
            clearInterval(stageTimer);
            clearInterval(dotTimer);
        };
    }, [loading]);

    useEffect(() => {
        return () => {
            clearTypingTimers();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── quick-reply option config ── */
    const quickOptions = useMemo(() => {
        switch (step) {
            case 2:
                return ['Male', 'Female', 'Other'];
            case 4:
                return ['150 cm', '155 cm', '160 cm', '165 cm', '170 cm', '175 cm', '180 cm'];
            case 5:
                return ['45 kg', '50 kg', '55 kg', '60 kg', '65 kg', '70 kg', '75 kg', '80 kg'];
            case 6:
                return ['Low', 'Moderate', 'High'];
            case 7:
                return ['Lose', 'Maintain', 'Gain'];
            case 8:
                return ['None', 'Peanuts', 'Dairy', 'Gluten'];
            default:
                return [];
        }
    }, [step]);

    const analyzingStages = [
        'Analyzing your profile',
        'Reading product descriptions',
        'Finalizing best suggestions'
    ];

    const handleQuickReply = (value) => {
        if (loading) return;
        const clean = value.replace(/\s*(cm|kg)$/i, '').trim();
        pushMessage('user', value);
        processInput(clean);
    };

    const processInput = (input) => {
        switch (step) {
            case 1:
                setForm((prev) => ({ ...prev, name: input }));
                askForStep(2);
                break;
            case 2: {
                const g = input.toLowerCase();
                if (!g.includes('male') && !g.includes('female') && !g.includes('other') && !g.includes('m') && !g.includes('f') && !g.includes('o')) {
                    pushMessage('assistant', 'Sorry, I couldn\'t understand that. Please select your gender below or type it.');
                    return;
                }
                setForm((prev) => ({ ...prev, gender: normalizeGender(input) }));
                askForStep(3);
                break;
            }
            case 3: {
                const age = Number(input);
                if (!age || age < 1 || age > 150 || !Number.isInteger(age)) {
                    pushMessage('assistant', 'Oops! That doesn\'t look like a valid age. Please enter a number (e.g. 25).');
                    return;
                }
                setForm((prev) => ({ ...prev, age: input }));
                askForStep(4);
                break;
            }
            case 4: {
                const height = Number(input);
                if (!height || height < 50 || height > 300) {
                    pushMessage('assistant', 'Hmm, that doesn\'t seem right. Please pick a height below or type in cm (e.g. 170).');
                    return;
                }
                setForm((prev) => ({ ...prev, heightCm: String(height) }));
                askForStep(5);
                break;
            }
            case 5: {
                const weight = Number(input);
                if (!weight || weight < 10 || weight > 500) {
                    pushMessage('assistant', 'That doesn\'t look like a valid weight. Pick below or type in kg (e.g. 65).');
                    return;
                }
                setForm((prev) => ({ ...prev, weightKg: String(weight) }));
                askForStep(6);
                break;
            }
            case 6: {
                const val = input.toLowerCase();
                if (!val.includes('low') && !val.includes('moderate') && !val.includes('high')) {
                    pushMessage('assistant', 'Sorry, I couldn\'t get you. Please select an option below.');
                    return;
                }
                const activity = val.includes('low') ? 'low' : val.includes('high') ? 'high' : 'moderate';
                setForm((prev) => ({ ...prev, activity }));
                askForStep(7);
                break;
            }
            case 7: {
                const val = input.toLowerCase();
                if (!val.includes('lose') && !val.includes('maintain') && !val.includes('gain')) {
                    pushMessage('assistant', 'Sorry, I didn\'t catch that. Please select a goal below.');
                    return;
                }
                const goal = val.includes('lose') ? 'lose' : val.includes('gain') ? 'gain' : 'maintain';
                setForm((prev) => ({ ...prev, goal }));
                askForStep(8);
                break;
            }
            case 8:
                setForm((prev) => ({ ...prev, allergies: input }));
                setStep(9);
                pushMessage('assistant', bmi ? `Thanks! Your BMI is ${bmi} (${bmiCategory}). I am finding products for you...` : 'Thanks! Calculating BMI and finding products...');
                handleGenerate();
                break;
            default:
                pushMessage('assistant', 'Sorry, I couldn\'t get you. 😅 Please click "Reset" to start a new conversation!');
                break;
        }
    };

    const handleUserSubmit = (e) => {
        e.preventDefault();
        if (!chatInput.trim() || loading) return;
        const input = chatInput.trim();
        setChatInput('');
        pushMessage('user', input);
        processInput(input);
    };

    return (
        <div className="fixed bottom-[85px] md:bottom-6 right-4 md:right-6 flex flex-col gap-2 md:gap-3 z-[9999]">
            {/* Chat Icon - Nutraj Style */}
            <button
                onClick={() => setIsOpen((v) => !v)}
                className="w-10 h-10 md:w-12 md:h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 group"
                title="Chat with us"
            >
                <div className="bg-white/20 p-1.5 md:p-2 rounded-full">
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6" fill="white" />
                </div>
            </button>

            {/* WhatsApp Icon */}
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 md:w-12 md:h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
                title="WhatsApp us"
            >
                <svg
                    viewBox="0 0 24 24"
                    className="w-[22px] h-[22px] md:w-7 md:h-7"
                    stroke="currentColor"
                    strokeWidth="0"
                    fill="currentColor"
                >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.520-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.510-.173-.008-.371-.010-.57-.010-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.200 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.870 9.870 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.860 9.860 0 01-1.510-5.260c.001-5.450 4.436-9.884 9.888-9.884 2.640 0 5.122 1.030 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.450-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.050 0C5.495 0 .160 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.480-8.413Z" />
                </svg>
            </a>

            {/* BMI Assistant Chatbox */}
            {isOpen && (
                <div className="fixed bottom-24 right-4 md:right-6 w-[90vw] max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-footerBg text-white">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} />
                            <span className="text-xs font-black uppercase tracking-widest">Farmlyf Assistant</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-full hover:bg-white/10"
                            aria-label="Close chat"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div ref={chatScrollRef} className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                        {messages.map((m, i) => (
                            <div key={m.id || i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${
                                        m.role === 'user'
                                            ? 'bg-footerBg text-white rounded-br-sm'
                                            : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                                    }`}
                                >
                                    {(m.role === 'assistant' && typeof m.displayText === 'string') ? m.displayText : m.text}
                                    {m.role === 'assistant' && m.isTyping ? <span className="ml-1 inline-block animate-pulse">|</span> : null}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed bg-gray-100 text-gray-700 rounded-bl-sm">
                                    {analyzingStages[analysisStageIndex]}{'.'.repeat(analysisDotCount)}
                                </div>
                            </div>
                        )}
                        {recommendations.length > 0 && (
                            <div className="space-y-2">
                                {recommendations.map((rec) => (
                                    <a
                                        key={rec.slug || rec.name}
                                        href={rec.slug ? `/product/${rec.slug}` : '#'}
                                        className="block bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold text-footerBg hover:border-footerBg transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                                                {rec.image ? (
                                                    <img src={rec.image} alt={rec.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-black truncate">{rec.name}</div>
                                                <div className="text-[10px] text-gray-400 truncate">{rec.reason}</div>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick-reply option buttons */}
                    {quickOptions.length > 0 && !loading && step < 9 && (
                        <div className="px-3 py-2 border-t border-gray-50 flex flex-wrap gap-1.5">
                            {quickOptions.map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleQuickReply(opt)}
                                    className="px-3 py-1.5 bg-footerBg/10 text-footerBg text-[11px] font-bold rounded-full border border-footerBg/20 hover:bg-footerBg hover:text-white transition-all duration-200 active:scale-95"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleUserSubmit} className="border-t border-gray-100 p-3 flex gap-2 items-center">
                        <input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder={loading ? 'Analyzing...' : 'Type your reply...'}
                            disabled={loading || step >= 9 || !user}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold"
                        />
                        <button
                            type="submit"
                            disabled={loading || !chatInput.trim() || step >= 9 || !user}
                            className="w-9 h-9 bg-footerBg text-white rounded-xl flex items-center justify-center disabled:opacity-60"
                            aria-label="Send"
                        >
                            <Send size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={resetChat}
                            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-footerBg"
                        >
                            Reset
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default FloatingContact;
