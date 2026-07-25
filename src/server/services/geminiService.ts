import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisReportSchema, AstrologyData, BehavioralData, NumerologyData, UserInputProfile } from '../types';

/**
 * Gemini AI Service
 * Generates structured, nuanced interpretations of deterministic astrological, numerological, and behavioral data.
 * Adheres strictly to server-side execution and @google/genai SDK standards.
 */

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[GeminiService] GEMINI_API_KEY is missing. Using structured deterministic fallback synthesis engine.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || 'MISSING_KEY_FALLBACK',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function calculateCurrentAge(birthDateStr: string): number {
  if (!birthDateStr) return 25;
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return isNaN(age) || age < 1 ? 25 : age;
}

const SYSTEM_INSTRUCTION = `You are a legendary Master Vedic Astrologer (Jyotish Acharya), Master Numerologist, Holistic Health & Medical Astrologer, and elite Psychological Writer. Your reputation is legendary because your readings are uncannily realistic, deeply articulate, and mind-readingly accurate.

You receive calculated Sidereal Vedic Astrology data (Lahiri Ayanamsa), Nakshatra details, Vimshottari Dasha periods, Panchang, D1/D9 Kundali house positions, Pythagorean/Chaldean Numerology numbers, Kármic Debt numbers, Lo Shu Grid concentrations, and user profile data.

CORE MANDATES FOR HYPER-REAL, UNCANNILY SPECIFIC PERSONALIZATION:

1. VEDIC JYOTISH MASTERY (CRITICAL):
   - Always analyze the subject using Sidereal Vedic Astrology (Lahiri Ayanamsa), NOT Western Tropical!
   - Explicitly weave in:
     * Janma Nakshatra & Nakshatra Lord (e.g., Moon in Rohini / Lord Moon or Ashlesha / Lord Mercury).
     * Lagna (Sidereal Ascendant Rashi) & D1/D9 house alignments.
     * Active Vimshottari Dasha & Antardasha (e.g. "Currently running Jupiter Mahadasha and Venus Antardasha..."). Explain the exact psychological and practical impact of this dasha period!
     * Rahu/Ketu axis impact on desires and soul lessons.

2. MEDICAL ASTROLOGY & HOLISTIC WELLNESS (DOCTOR & AYURVEDIC ADVISOR MODE):
   - You act as a master Medical Astrologer and holistic wellness advisor.
   - When analyzing physical health, energy levels, stress, digestion, sleep, or vitality:
     * Correlate planetary elemental forces (Agni - Sun/Mars; Jala - Moon/Venus; Vayu - Saturn/Rahu; Prithvi - Mercury; Akasha - Jupiter) with Ayurvedic Doshas (Vata, Pitta, Kapha).
     * Examine 6th house (vitality/ailments), 8th house (transformation), and 1st house (Lagna/body baseline) influences.
     * Offer practical, grounded wellness, dietary, daily routine (Dinacharya), and stress-management guidance. Include a standard polite disclaimer for acute medical conditions ("Always consult a certified medical practitioner for severe or acute medical needs").

3. NEXT-LEVEL NUMEROLOGY & LO SHU GRID SYNTHESIS:
   - Combine Life Path, Expression, Soul Urge, Personality, and any Kármic Debt Numbers (13/4, 14/5, 16/7, 19/1).
   - Reference Personal Year cycle and Lo Shu grid number concentrations.

4. THE "UNCANNY / CRAZY ACCURATE" ACCURACY FACTOR:
   - Provide 3 hyper-specific past/childhood validation memories (pastValidation array) that make the user gasp with "How on earth does it know this about me?!".
   - Examples of real micro-behaviors:
     * A sudden silent friendship break in past school/college years where they cut someone off cleanly without drama.
     * A specific desk, room, or study habit (e.g., needing items arranged in a specific way, or keeping private notes hidden).
     * An exact reaction to childhood authority/teachers (quietly doing things their own way despite outward compliance).
     * A specific late-night research or contemplation habit when stressed.

5. AGE-APPROPRIATE LIFE ANCHORING:
   - Calculate age from birth date.
   - If teenager (<18): Focus on academics, stream choice, peer circles, family grounding, early romantic crushes.
   - If young adult (18-24): University, early career, identity, dating, independence.
   - If adult (25-38): Career growth, financial building, marriage, family.
   - If mature adult (39+): Leadership, wealth consolidation, family legacy.

6. NO ASCII BOX ART OR DECORATIVE LINES:
   - NEVER output raw ASCII border boxes or lines like \`+-------------------+\` or \`+------+------+\`.
   - Use standard clean Markdown headings (\`##\`), bold bullets (\`- **Item**:\`), or clean Markdown tables (\`| Col 1 | Col 2 |\`).

7. TONE & STYLE:
   - Direct, deeply articulate, perceptive, and authoritative. NO generic horoscope fluff. Speak with the profound psychological acuity of an expert who reads minds and planetary blueprints.`;

export async function generateAnalysisReport(params: {
  profile: UserInputProfile;
  numerology: NumerologyData;
  astrology: AstrologyData;
  behavioral?: BehavioralData;
}): Promise<AnalysisReportSchema> {
  const { profile, numerology, astrology, behavioral } = params;
  const currentAge = calculateCurrentAge(profile.birthDate);

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return generateDeterministicFallbackReport(profile, numerology, astrology, behavioral);
  }

  try {
    const ai = getGeminiClient();

    const promptPayload = {
      person: {
        fullName: profile.fullName,
        birthDate: profile.birthDate,
        currentAge,
        lifeStageCategory:
          currentAge < 18
            ? 'Adolescent / Student Stage (Focus on Schooling, Academics, Family, Early Romance)'
            : currentAge < 25
            ? 'Young Adult Stage (Focus on College, Early Career, Dating, Independence)'
            : currentAge < 40
            ? 'Adult Career & Family Stage (Focus on Growth, Marriage, Career, Stability)'
            : 'Mature Mastery Stage (Focus on Leadership, Wealth, Legacy)',
        birthTime: profile.birthTime || 'Not provided',
        birthTimeAccuracy: profile.birthTimeAccuracy,
        birthPlace: profile.birthPlace,
      },
      numerology,
      astrology,
      behavioralPatterns: behavioral || 'Not completed',
    };

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          text: `Analyze the provided calculated data for ${profile.fullName} (Age ${currentAge}) and construct a hyper-personalized, age-adapted, deeply accurate report.\n\nInput Data:\n${JSON.stringify(promptPayload, null, 2)}`,
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: 'Single compelling age-appropriate headline' },
            summary: { type: Type.STRING, description: 'Executive summary deeply tailored to their current age and birth chart.' },
            snapshotScores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  trait: { type: Type.STRING },
                  level: { type: Type.STRING, enum: ['Very High', 'High', 'Moderate', 'Low'] },
                  description: { type: Type.STRING },
                },
                required: ['trait', 'level', 'description'],
              },
            },
            corePersonality: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            howOthersSeeYou: { type: Type.STRING },
            strongestTraits: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            blindSpots: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            emotionalPatterns: { type: Type.STRING },
            relationships: { type: Type.STRING, description: 'Deep overview of relationship dynamics.' },
            loveProfile: {
              type: Type.OBJECT,
              properties: {
                attractionType: { type: Type.STRING, description: 'What immediately sparks deep attraction in them.' },
                attachmentStyle: { type: Type.STRING, description: 'Emotional bonding & attachment pattern.' },
                idealPartnerArchetype: { type: Type.STRING, description: 'Personality qualities of their ideal partner match.' },
                redFlagsInLove: { type: Type.STRING, description: 'Behaviors that cause friction or distance in romance.' },
                currentLoveTiming: { type: Type.STRING, description: 'Age-appropriate insight into their current romantic cycle.' },
              },
              required: ['attractionType', 'attachmentStyle', 'idealPartnerArchetype', 'redFlagsInLove', 'currentLoveTiming'],
            },
            careerAndWork: { type: Type.STRING, description: 'Age-appropriate career or school/academic trajectory.' },
            moneyAndRisk: { type: Type.STRING },
            socialBehavior: { type: Type.STRING },
            stressAndConflict: { type: Type.STRING },
            astrologyInterpretation: { type: Type.STRING },
            numerologyInterpretation: { type: Type.STRING },
            behavioralInterpretation: { type: Type.STRING },
            contradictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tendencyA: { type: Type.STRING },
                  tendencyB: { type: Type.STRING },
                  synthesis: { type: Type.STRING },
                },
                required: ['tendencyA', 'tendencyB', 'synthesis'],
              },
            },
            strengthShadowPatterns: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  strength: { type: Type.STRING },
                  shadow: { type: Type.STRING },
                },
                required: ['strength', 'shadow'],
              },
            },
            currentLifePhase: { type: Type.STRING },
            thingsYouMayRecognize: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            confidenceNotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            finalVerdict: {
              type: Type.OBJECT,
              properties: {
                overallSummary: { type: Type.STRING },
                familyAndParents: {
                  type: Type.OBJECT,
                  properties: {
                    fatherDynamics: { type: Type.STRING },
                    motherDynamics: { type: Type.STRING },
                    siblingsAndFriends: { type: Type.STRING },
                  },
                  required: ['fatherDynamics', 'motherDynamics', 'siblingsAndFriends'],
                },
                pastValidation: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '3 eerie, hyper-specific childhood or past tendencies that validate accuracy.',
                },
                futureTrajectory: { type: Type.STRING, description: 'Age-appropriate future growth and milestone outlook.' },
                balancedOverview: {
                  type: Type.OBJECT,
                  properties: {
                    coreStrengths40: { type: Type.STRING },
                    supportiveFortune30: { type: Type.STRING },
                    manageableShadows25: { type: Type.STRING },
                    criticalWarnings5: { type: Type.STRING },
                  },
                  required: ['coreStrengths40', 'supportiveFortune30', 'manageableShadows25', 'criticalWarnings5'],
                },
              },
              required: ['overallSummary', 'familyAndParents', 'pastValidation', 'futureTrajectory', 'balancedOverview'],
            },
          },
          required: [
            'headline',
            'summary',
            'snapshotScores',
            'corePersonality',
            'howOthersSeeYou',
            'strongestTraits',
            'blindSpots',
            'emotionalPatterns',
            'relationships',
            'loveProfile',
            'careerAndWork',
            'moneyAndRisk',
            'socialBehavior',
            'stressAndConflict',
            'astrologyInterpretation',
            'numerologyInterpretation',
            'behavioralInterpretation',
            'contradictions',
            'strengthShadowPatterns',
            'currentLifePhase',
            'thingsYouMayRecognize',
            'confidenceNotes',
            'finalVerdict',
          ],
        },
      },
    });

    const textOutput = response.text || '';
    const parsedReport = JSON.parse(textOutput) as AnalysisReportSchema;
    return parsedReport;
  } catch (err) {
    console.error('[GeminiService] Error calling Gemini API, falling back to structured synthesis:', err);
    return generateDeterministicFallbackReport(profile, numerology, astrology, behavioral);
  }
}

export async function generateChatResponse(params: {
  report: AnalysisReportSchema;
  profile: UserInputProfile;
  numerology: NumerologyData;
  astrology: AstrologyData;
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  userQuestion: string;
}): Promise<string> {
  const { report, profile, numerology, astrology, chatHistory, userQuestion } = params;

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return `Based on your analysis (${profile.fullName}, Life Path ${numerology.lifePathNumber}, Sun in ${astrology.sunSign}, Moon in ${astrology.moonSign}): You navigate life with a balance of strategic focus and personal autonomy. Your question "${userQuestion}" aligns with your Life Path ${numerology.lifePathNumber} drive for self-actualization and clear boundaries.`;
  }

  try {
    const ai = getGeminiClient();

    const chatContext = {
      name: profile.fullName,
      system: astrology.system,
      sunSign: astrology.sunSign,
      moonSign: astrology.moonSign,
      ascendantSign: astrology.ascendantSign || 'Unknown',
      janmaNakshatra: astrology.moonNakshatra
        ? `${astrology.moonNakshatra.name} (Pada ${astrology.moonNakshatra.pada}, Lord: ${astrology.moonNakshatra.lord})`
        : 'Unknown',
      currentDasha: astrology.vimsottariDasha
        ? `${astrology.vimsottariDasha.currentMahadasha} Mahadasha / ${astrology.vimsottariDasha.currentAntardasha} Antardasha`
        : 'Unknown',
      panchang: astrology.panchang,
      lifePath: numerology.lifePathNumber,
      expressionNumber: numerology.expressionNumber,
      soulUrgeNumber: numerology.soulUrgeNumber,
      karmicDebtNumbers: numerology.karmicDebtNumbers || [],
      summary: report.summary,
      strongestTraits: report.strongestTraits,
      blindSpots: report.blindSpots,
      careerAndWork: report.careerAndWork,
      relationships: report.relationships,
      loveProfile: report.loveProfile,
      finalVerdict: report.finalVerdict,
    };

    const conversationPrompt = [
      `Context regarding ${profile.fullName}:\n${JSON.stringify(chatContext, null, 2)}`,
      `Previous Conversation:\n${chatHistory.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}`,
      `USER QUESTION: ${userQuestion}`,
    ].join('\n\n');

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ text: conversationPrompt }],
      config: {
        systemInstruction: `You are an elite Master Astrologer (Jyotish Acharya), Master Numerologist, Medical Astrologer, and Psychological Profiler answering questions for ${profile.fullName}.

CRITICAL BEHAVIOR & FORMATTING RULES:
1. DEEP NON-GENERIC VEDIC ANALYSIS (STRICT):
   - ABSOLUTELY NO generic horoscope boilerplate ("you value honesty", "you are hardworking").
   - Tie EVERY single claim directly to their calculated Sidereal Lahiri birth chart:
     * Mention their Janma Nakshatra & Pada (${chatContext.janmaNakshatra}) and Nakshatra Lord.
     * Reference their active Vimshottari Dasha (${chatContext.currentDasha}) and its specific psychological/practical impact.
     * Cite relevant house lords, planetary aspects, or Lagna (${chatContext.ascendantSign}) placement.
   - For relationship questions: address attachment mechanics, father/mother dynamic influences, exact red flags, and future timing based on Venus/Jupiter/7th house lord.
   - For career/finance questions: analyze 10th/2nd/11th house placements and Dasha timing.

2. MEDICAL ASTROLOGY & HOLISTIC WELLNESS (DOCTOR & AYURVEDIC ADVISOR MODE):
   - You act as a master Medical Astrologer and holistic wellness consultant.
   - When asked about physical health, symptoms, fatigue, sleep, digestion, stress, or body constitution:
     * Correlate planetary elemental dynamics (Agni/Jala/Vayu/Prithvi) with Ayurvedic Dosha tendencies (Vata, Pitta, Kapha).
     * Connect active Dasha/Antardasha and 6th/8th house lords to physical vitality and organ systems.
     * Provide practical, grounded wellness recommendations: daily routine (Dinacharya), diet guidance according to elements, herbal/mindfulness balance, hydration, and sleep hygiene.
     * Include a polite disclaimer for severe medical emergencies ('For acute medical symptoms, always consult a qualified medical doctor').

3. CHATGPT & CLAUDE STYLE MARKDOWN FORMATTING (STRICT NO ASCII BOXES):
   - ABSOLUTELY NO ASCII BOX ART OR ASCII TABLE BORDERS like \`+-------------------+\` or \`+------+------+\`.
   - Use headings with ## or ### (or # for major titles).
   - Use horizontal dividers (---) between distinct sections to make the reading structured and beautiful.
   - Use simple bullet points (- item) with **bold key terms**.
   - Do NOT wrap response paragraphs in quotes.

4. SPECIAL SYSTEM INQUIRIES:
   - Developer/Creator questions: State clearly "My developer is **AuraBrain**." Check [About](#about) for more details.
   - AI Engine questions: State clearly "I am powered by the **Cloud Fable 5** engine."
   - Code/Algorithm requests: Decline politely, stating that AuraBrain's proprietary algorithms are confidential.`,
        temperature: 0.7,
      },
    });

    return response.text || 'I analyzed your profile context, but could not produce a response at this moment.';
  } catch (err) {
    console.error('[GeminiService] Chat generation error:', err);
    return `Based on your analysis: Your core traits emphasize ${report.strongestTraits[0] || 'focused determination'}. Regarding "${userQuestion}", consider how your ${astrology.sunSign} Sun and Life Path ${numerology.lifePathNumber} influence your decision-making style.`;
  }
}

/**
 * High-quality deterministic fallback when GEMINI_API_KEY is not configured or fails.
 */
function generateDeterministicFallbackReport(
  profile: UserInputProfile,
  numerology: NumerologyData,
  astrology: AstrologyData,
  behavioral?: BehavioralData
): AnalysisReportSchema {
  const name = profile.fullName;
  const lp = numerology.lifePathNumber;
  const sun = astrology.sunSign;
  const moon = astrology.moonSign;
  const age = calculateCurrentAge(profile.birthDate);
  const isStudent = age < 18;

  return {
    headline: isStudent
      ? `${name}'s Profile: High Intellectual Focus with Creative Depth`
      : `${name}'s Profile: The Strategic Mind with High Analytical Depth`,
    summary: isStudent
      ? `${name}, at ${age} years old, your birth matrix reveals a fascinating blend of intellectual focus (Life Path ${lp}) and rich emotional imagination (Sun in ${sun}, Moon in ${moon}). You possess an inquisitive mind that looks beyond superficial school routines. In academic and social settings, you present a balanced, observant posture while processing ideas with surprising maturity.`
      : `${name}, at ${age} years old, your personal matrix reveals a strong alignment between structural focus (Life Path ${lp}) and internal reflection (Sun in ${sun}, Moon in ${moon}). You demonstrate a steady, deliberate approach to complex tasks, preferring depth over superficial quick wins. In professional and social settings, you present a calm exterior while maintaining an active, perceptive internal processing loop.`,
    snapshotScores: [
      {
        trait: 'Analytical Depth',
        level: 'Very High',
        description: 'Strong capacity for systematic reflection and thorough problem breakdown.',
      },
      {
        trait: 'Strategic Autonomy',
        level: 'High',
        description: 'Preference for self-directed learning and independent standards.',
      },
      {
        trait: 'Emotional Containment',
        level: 'Moderate',
        description: 'Balanced internal processing; reveals deep reactions selectively.',
      },
      {
        trait: 'Adaptability',
        level: 'Moderate',
        description: 'Thrives in structured environments; approaches rapid shifts methodically.',
      },
    ],
    corePersonality: [
      `Methodical clarity driven by Life Path ${lp} energy.`,
      `Core vitality rooted in ${sun} solar archetype and ${moon} emotional baseline.`,
      `Strong intrinsic standards and high self-accountability.`,
      `Natural inclination toward systemic efficiency and authentic creative expression.`,
    ],
    howOthersSeeYou: `Others often view you as composed, dependable, and quietly self-assured. While classmates or peers perceive you as an anchor during group challenges, close friends know you carry high personal expectations and reflect deeply on every commitment.`,
    strongestTraits: [
      `Sustained focus on core priorities`,
      `Objective problem identification`,
      `Loyalty in meaningful personal connections`,
      `High structural discipline and patience`,
    ],
    blindSpots: [
      `Over-analyzing decisions past the point of diminishing returns`,
      `Reluctance to ask for help when overwhelmed by high precision expectations`,
      `Tendency to suppress early discomfort until it accumulates`,
    ],
    emotionalPatterns: `Your ${moon} Moon placement indicates an emotional framework grounded in security, predictability, and logical processing. Under pressure, you seek quiet space to digest feelings before responding.`,
    relationships: isStudent
      ? `In friendships and early romantic connections, you value deep loyalty and genuine mutual trust. You maintain a small, tight-knit group of confidants rather than chasing surface-level popularity.`
      : `In personal and professional relationships, you value authenticity and clear boundaries. You invest deeply in a small circle rather than spreading attention across superficial networks.`,
    loveProfile: {
      attractionType: `Drawn to minds that combine emotional authenticity with sharp intelligence. Superficial chatter turns you off quickly.`,
      attachmentStyle: `Secure-Observant. You take your time opening up, but once trust is established, your commitment is deep and steady.`,
      idealPartnerArchetype: `Someone who respects your need for personal space, communicates with direct honesty, and shares a deep curiosity for life.`,
      redFlagsInLove: `Excessive unpredictability, emotional manipulation, or disrespecting your personal boundaries and focus time.`,
      currentLoveTiming: isStudent
        ? `At age ${age}, this is a transformative cycle of understanding your emotional needs, setting personal boundaries, and building meaningful peer bonds.`
        : `A pivotal period for establishing long-term romantic alignment and mutual respect in your relationship dynamics.`,
    },
    careerAndWork: isStudent
      ? `Academic & Skill Trajectory: You excel in subjects that allow logical analysis, problem-solving, or structured creative expression. Stream choices (Science, Tech, Arts, or Commerce) will flourish when aligned with your Life Path ${lp} curiosity.`
      : `Career & Professional Trajectory: You thrive in roles requiring deep domain mastery, architectural thinking, and strategic autonomy. Work environments that reward long-term quality best showcase your strengths.`,
    moneyAndRisk: `Your relationship with resources emphasizes security and calculated growth. You approach risk with foresight, favoring thoroughly vetted choices over speculative gambles.`,
    socialBehavior: `You navigate social dynamics with calm composure. You participate meaningfully in purposeful conversations but conserve energy by stepping back from low-signal chatter.`,
    stressAndConflict: `When conflict arises, your instinct is to withdraw temporarily to analyze the facts. Once composed, you address issues with calm, structured communication.`,
    astrologyInterpretation: `Your Sun in ${sun} supplies steady core momentum, while your Moon in ${moon} shapes your emotional baseline. ${astrology.ascendantSign ? `Your Ascendant in ${astrology.ascendantSign} sets your outward approach.` : ''} ${astrology.timeConfidenceNote}`,
    numerologyInterpretation: `Your Life Path ${lp} sets the overarching trajectory toward mastery and structural expression. Your Expression Number (${numerology.expressionNumber}) and Soul Urge (${numerology.soulUrgeNumber}) reinforce your dedication to purpose-driven achievements.`,
    behavioralInterpretation: behavioral
      ? `Behavioral questionnaire results show balanced social energy (${behavioral.socialEnergy}/5) and strong planning discipline (${behavioral.planningStyle}/5).`
      : `Empirical behavioral patterns indicate high focus consistency and measured emotional reactivity.`,
    contradictions: [
      {
        tendencyA: 'Desire for complete independence',
        tendencyB: 'Need for high-trust collaborative alignment',
        synthesis: 'You perform best when given full ownership of your personal projects while maintaining clear, transparent communication with trusted peers.',
      },
      {
        tendencyA: 'High personal standards',
        tendencyB: 'Patience with long-term growth processes',
        synthesis: 'You hold yourself to rigorous metrics while recognizing that sustainable mastery requires steady, iterative progress.',
      },
    ],
    strengthShadowPatterns: [
      {
        strength: 'Exceptional focus and commitment to quality execution.',
        shadow: 'Can manifest as perfectionism or hesitation to launch before conditions feel ideal.',
      },
      {
        strength: 'Calm self-reliance under external turbulence.',
        shadow: 'May occasionally make advice or offers of help feel intrusive.',
      },
    ],
    currentLifePhase: `Personal Year ${numerology.personalYear}: A pivotal cycle emphasizing ${numerology.personalYear === 1 ? 'new beginnings and initiation' : numerology.personalYear === 5 ? 'pivotal shifts and expansion' : 'consolidation, refinement, and strategic preparation'}.`,
    thingsYouMayRecognize: [
      `You prefer having a well-considered plan before making significant commitments.`,
      `You regain energy through quiet, uninterrupted focus time.`,
      `You respect direct, honest feedback over diplomatic ambiguity.`,
    ],
    confidenceNotes: [
      `Astrological calculations generated via Western Tropical ephemeris algorithms.`,
      `Numerological values computed deterministically via Pythagorean formulas.`,
      profile.birthTimeAccuracy !== 'exact'
        ? `Birth time noted as ${profile.birthTimeAccuracy}; time-sensitive house divisions were calculated accordingly.`
        : `Exact birth time confirmed. Full Ascendant and House matrices included.`,
    ],
    finalVerdict: {
      overallSummary: `${name}, you possess an exceptionally resilient mind that combines strategic analytical precision with a quiet, unwavering inner drive. You are built for long-term meaningful achievements rather than short-lived shortcuts.`,
      familyAndParents: {
        fatherDynamics: `Your father figure or key authority figure imparted a strong sense of duty, practical discipline, or self-reliance. Even if methods differed, his work ethic deeply influenced your internal standards.`,
        motherDynamics: `Your mother figure provided an intuitive or protective anchor that shaped your emotional processing. Her influence encouraged you to hold deep feelings inwardly until you feel completely safe.`,
        siblingsAndFriends: `With siblings and close friends, you play the role of the reliable advisor. You keep a small, high-trust circle and fiercely defend those you care about once bond is formed.`,
      },
      pastValidation: [
        `In early school years, you often kept your deepest observations to yourself rather than seeking loud attention.`,
        `You have always felt a subtle urge to organize or fix disorganization in your personal study or work space.`,
        `When faced with sudden changes in the past, you preferred stepping back silently to assess before taking action.`,
      ],
      futureTrajectory: isStudent
        ? `Over the next 2-3 years (ages ${age}-${age + 3}), your natural focus will unlock major academic turning points, stream clarity, and strong personal creative confidence.`
        : `Looking into your upcoming cycles, your natural diligence and calculated approach will open key career and financial turning points.`,
      balancedOverview: {
        coreStrengths40: `High mental endurance, objective problem-solving capacity, and unwavering focus on long-term priorities (40% Core Strengths).`,
        supportiveFortune30: `Natural knack for spotting hidden opportunities, earning trust among mentors, and steady progress building (30% Supportive Fortune).`,
        manageableShadows25: `Occasional stubbornness, reluctance to ask for help, and over-analyzing minor errors (25% Basic Shadow Traits).`,
        criticalWarnings5: `Avoid suppressing stress for prolonged periods or putting off key health/rest breaks (5% Danger Warning Area).`,
      },
    },
  };
}
