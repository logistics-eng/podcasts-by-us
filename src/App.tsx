/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import {
  Mic,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  Loader2,
  Volume2,
  Clock,
  BarChart,
  BookOpen,
  Users,
  Gauge,
  Save,
  Library,
  Trash2,
  ArrowLeft,
  FileText,
  Pencil,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const FEMALE_NAMES = ['Emma', 'Sophie', 'Maya', 'Claire', 'Rachel', 'Nina', 'Grace', 'Lily', 'Zoe', 'Hannah'];
const MALE_NAMES = ['James', 'David', 'Marcus', 'Ryan', 'Lucas', 'Noah', 'Ethan', 'Oliver', 'Jack', 'Leo'];

const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const ROLEPLAY_SCENARIOS = [
  // Work & Career
  "A job interview at a tech startup. One speaker is the interviewer, the other is a nervous candidate applying for their first job.",
  "An employee asks their boss for a salary raise after two years with no increase.",
  "Two colleagues disagree about how to handle a difficult client — one wants to be flexible, the other wants to stick to the contract.",
  "A manager gives a performance review to an employee who thinks they deserve a promotion.",
  "Two coworkers discuss whether to report a colleague they suspect of taking credit for others' work.",
  "A new employee on their first day is being shown around by a senior team member who gives very confusing instructions.",
  "An employee tells their boss they are resigning to start their own business.",
  "Two freelancers negotiate the price for a joint project and can't agree on how to split the payment.",
  // Social & Relationships
  "Two old friends meet after five years apart and try to catch up without admitting their lives didn't go as planned.",
  "A first date at a coffee shop where both people are clearly nervous but trying to seem confident.",
  "Two roommates have a conflict over house chores and finally decide to talk about it.",
  "Someone tries to return an item to a store without a receipt, and the cashier refuses.",
  "Two neighbors argue politely about a noise complaint, then find common ground.",
  "A person tries to cancel a gym membership but the sales rep won't make it easy.",
  "Two friends argue about who forgot whose birthday and both are convinced the other is wrong.",
  "Someone confesses to a friend that they borrowed money from them years ago and never paid it back.",
  // Family
  "A teenager tells their parents they want to drop out of university to become a YouTuber.",
  "Two siblings argue about who should be responsible for taking care of their aging parent.",
  "A parent tries to explain to their child why they need to limit screen time — the child disagrees strongly.",
  "An adult child tells their traditional parent they are moving abroad for a job opportunity.",
  "Two parents disagree about how strict to be with their teenage child's curfew.",
  "A grandparent tries to understand what their grandchild does for work in tech, and the grandchild tries to explain it simply.",
  // Health & Medical
  "A doctor delivers test results to a patient who is in denial and keeps making excuses.",
  "A patient argues with their insurance company representative about a claim that was denied.",
  "A personal trainer pushes a client who wants to give up during a tough workout.",
  "Someone visits a therapist for the first time and isn't sure they believe therapy will help them.",
  "A nutritionist tries to convince a junk food lover to change their diet.",
  // Travel & Adventure
  "Two strangers are stuck together in an airport for eight hours due to a cancelled flight.",
  "A traveler realizes their hotel booking was never confirmed, and there are no available rooms left.",
  "Two friends on a road trip argue about which direction to go after getting lost without signal.",
  "A tourist tries to negotiate a price at a market in a foreign country with a language barrier.",
  "Two backpackers debate whether to take a risky shortcut through the mountains or the long safe route.",
  // School & Education
  "A student argues with a teacher about a failing grade they believe is unfair.",
  "Two students pull an all-nighter before an exam and motivate each other not to give up.",
  "A professor catches a student using AI to write an essay and confronts them about academic honesty.",
  "Two classmates who don't like each other are forced to work together on a group project.",
  "A student tries to convince their strict parent that studying art is a valid career path.",
  // Tech & Modern Life
  "A tech support agent tries to help an elderly customer who is very confused about their new smartphone.",
  "Two friends debate whether social media is more harmful or beneficial to society.",
  "Someone tries to explain to their parent what cryptocurrency is, and the parent remains deeply skeptical.",
  "Two coworkers argue over whether working from home or working in the office is better for productivity.",
  "A person calls customer service to complain about a package that never arrived, and the agent keeps following a script.",
  // Funny & Lighthearted
  "Two chefs compete in a cooking contest and both secretly burned their dish.",
  "A person tries to return a goldfish to a pet store claiming it has a bad personality.",
  "Two superheroes discuss their retirement plans and what they'll do after saving the world.",
  "A customer insists a restaurant got their very complicated order wrong — but they also can't remember what they ordered.",
  "Two people both claim they reserved the last parking spot and won't move their cars.",
  "An alien lands on Earth and a local tries to explain why humans stand in line for coffee.",
  // Ethics & Dilemmas
  "Two friends find a wallet with $500 cash and no ID — one wants to keep it, the other wants to turn it in.",
  "A journalist and a company spokesperson debate whether to publish a story that is true but might hurt innocent people.",
  "Two friends debate whether it is ethical to eat meat in the age of climate change.",
  "Someone discovers their best friend's partner is cheating — they debate whether to tell them.",
  "Two people debate whether it is okay to lie to protect someone's feelings.",
  // Finance & Business
  "A startup founder pitches their business idea to a skeptical investor who asks tough questions.",
  "Two business partners disagree about whether to sell their company for a big offer or keep growing independently.",
  "A financial advisor tells a client they have been spending way above their means and need to make big cuts.",
  "Two friends argue about whether buying a house is smarter than renting long-term.",
  "A person tries to negotiate the price of a used car with a determined salesman.",
];


const LEVELS = [
  { id: 'A1', label: 'A1' },
  { id: 'A2', label: 'A2' },
  { id: 'B1', label: 'B1' },
  { id: 'B2', label: 'B2' },
  { id: 'C1', label: 'C1' },
  { id: 'C2', label: 'C2' }
];

// Arabic Vocabulary Builder — themed word lists for A1 beginners
interface ArabicWord { ar: string; translit: string; he: string; }
interface ArabicTopic { emoji: string; title: string; words: ArabicWord[]; }

// Arabic Verb Conjugation — present vs. past pairs
interface ArabicVerbPair { emoji: string; presentAr: string; presentTranslit: string; presentHe: string; pastAr: string; pastTranslit: string; pastHe: string; }
interface ArabicVerbConjTopic { emoji: string; title: string; pairs: ArabicVerbPair[]; }

// Spanish Vocabulary Builder
interface SpanishWord { es: string; he: string; }
interface SpanishTopic { emoji: string; title: string; words: SpanishWord[]; }

// Spanish Verb Conjugation — present (yo) vs. preterite (yo)
interface SpanishVerbPair { emoji: string; presentEs: string; presentHe: string; pastEs: string; pastHe: string; }
interface SpanishVerbConjTopic { emoji: string; title: string; pairs: SpanishVerbPair[]; }

// Italian Vocabulary Builder — targets English speakers, so glosses and UI text are in English, not Hebrew
interface ItalianWord { it: string; en: string; }
interface ItalianTopic { emoji: string; title: string; words: ItalianWord[]; }

// Italian Verb Conjugation — present (io) vs. passato prossimo (io ho/sono ...)
interface ItalianVerbPair { emoji: string; presentIt: string; presentEn: string; pastIt: string; pastEn: string; }
interface ItalianVerbConjTopic { emoji: string; title: string; pairs: ItalianVerbPair[]; }

// Turkish Vocabulary Builder — targets Hebrew speakers, glosses in Hebrew
interface TurkishWord { tr: string; he: string; }
interface TurkishTopic { emoji: string; title: string; words: TurkishWord[]; }

// Turkish Verb Conjugation — present (ben) vs. past (ben)
interface TurkishVerbPair { emoji: string; presentTr: string; presentHe: string; pastTr: string; pastHe: string; }
interface TurkishVerbConjTopic { emoji: string; title: string; pairs: TurkishVerbPair[]; }

// French Vocabulary Builder — targets Hebrew speakers, glosses in Hebrew
interface FrenchWord { fr: string; he: string; }
interface FrenchTopic { emoji: string; title: string; words: FrenchWord[]; }

// French Verb Conjugation — présent (je) vs. passé composé (j'ai/je suis)
interface FrenchVerbPair { emoji: string; presentFr: string; presentHe: string; pastFr: string; pastHe: string; }
interface FrenchVerbConjTopic { emoji: string; title: string; pairs: FrenchVerbPair[]; }

// Arabic Alphabet Trainer
interface AlphabetLetter {
  ar: string;       // isolated form
  nameAr: string;   // name in Arabic (for TTS)
  nameHe: string;   // name in Hebrew (for display)
  sound: string;    // how it sounds, in Hebrew
  connects: boolean; // connects to following letter (false = non-joining)
  example: { ar: string; translit: string; he: string };
}
const ARABIC_ALPHABET: AlphabetLetter[] = [
  { ar: 'ا', nameAr: 'أَلِف', nameHe: 'אָלִיף', sound: 'תנועה ניטרלית / א שקטה', connects: false, example: { ar: 'أرض', translit: 'אַרְד', he: 'אדמה' } },
  { ar: 'ب', nameAr: 'بَاء', nameHe: 'בָּאא', sound: 'ב', connects: true, example: { ar: 'بيت', translit: 'בֵּית', he: 'בית' } },
  { ar: 'ت', nameAr: 'تَاء', nameHe: 'תָּאא', sound: 'ת', connects: true, example: { ar: 'تفاح', translit: 'תוּפָּאח', he: 'תפוח' } },
  { ar: 'ث', nameAr: 'ثَاء', nameHe: 'ת׳אא', sound: 'ת׳ (כמו th באנגלית)', connects: true, example: { ar: 'ثلاثة', translit: 'תְ׳לָּאתַ׳ה', he: 'שלושה' } },
  { ar: 'ج', nameAr: 'جِيم', nameHe: 'ג׳ִים', sound: 'ג׳ (כמו j באנגלית)', connects: true, example: { ar: 'جميل', translit: 'ג׳מִיל', he: 'יפה' } },
  { ar: 'ح', nameAr: 'حَاء', nameHe: 'חָּאא', sound: 'ח גרונית חזקה', connects: true, example: { ar: 'حلو', translit: 'חֵילוּ', he: 'מתוק / נחמד' } },
  { ar: 'خ', nameAr: 'خَاء', nameHe: 'חַ׳אא', sound: 'כ׳ (כמו ch בגרמנית)', connects: true, example: { ar: 'خبز', translit: 'חֻ׳בֵּז', he: 'לחם' } },
  { ar: 'د', nameAr: 'دَال', nameHe: 'דָּאל', sound: 'ד', connects: false, example: { ar: 'دكان', translit: 'דוּכָּאן', he: 'חנות' } },
  { ar: 'ذ', nameAr: 'ذَال', nameHe: 'ד׳אל', sound: 'ד׳ (כמו th ב-the)', connects: false, example: { ar: 'ذهب', translit: 'ד׳הַב', he: 'זהב' } },
  { ar: 'ر', nameAr: 'رَاء', nameHe: 'רָּאא', sound: 'ר מגולגל', connects: false, example: { ar: 'رجل', translit: 'רַג׳ַּל', he: 'איש' } },
  { ar: 'ز', nameAr: 'زَاي', nameHe: 'זָּאי', sound: 'ז', connects: false, example: { ar: 'زيت', translit: 'זֵית', he: 'זית / שמן' } },
  { ar: 'س', nameAr: 'سِين', nameHe: 'סִין', sound: 'ס', connects: true, example: { ar: 'سلام', translit: 'סלַּאם', he: 'שלום' } },
  { ar: 'ش', nameAr: 'شِين', nameHe: 'שִׁין', sound: 'ש', connects: true, example: { ar: 'شمس', translit: 'שַׁמְס', he: 'שמש' } },
  { ar: 'ص', nameAr: 'صَاد', nameHe: 'צָּאד', sound: 'ס אמפטית (כבדה)', connects: true, example: { ar: 'صباح', translit: 'צַּבָּאח', he: 'בוקר' } },
  { ar: 'ض', nameAr: 'ضَاد', nameHe: 'דָּאד', sound: 'ד אמפטית (כבדה)', connects: true, example: { ar: 'ضيف', translit: 'דַּ׳יְף', he: 'אורח' } },
  { ar: 'ط', nameAr: 'طَاء', nameHe: 'טָּאא', sound: 'ט אמפטית (כבדה)', connects: true, example: { ar: 'طيب', translit: 'טַּיִּב', he: 'טוב / בסדר' } },
  { ar: 'ظ', nameAr: 'ظَاء', nameHe: 'ט׳אא', sound: 'ד׳ אמפטית (כבדה)', connects: true, example: { ar: 'ظهر', translit: 'ט׳הַר', he: 'גב / צהריים' } },
  { ar: 'ع', nameAr: 'عَيْن', nameHe: 'עַיִן', sound: 'ע גרונית', connects: true, example: { ar: 'عين', translit: 'עֵין', he: 'עין' } },
  { ar: 'غ', nameAr: 'غَيْن', nameHe: 'ר׳יִן', sound: 'ר צרפתי / ר גרונית', connects: true, example: { ar: 'غريب', translit: 'ר׳רִיב', he: 'מוזר / זר' } },
  { ar: 'ف', nameAr: 'فَاء', nameHe: 'פָּאא', sound: 'פ', connects: true, example: { ar: 'فتح', translit: 'פַּתַח', he: 'פתיחה / ניצחון' } },
  { ar: 'ق', nameAr: 'قَاف', nameHe: 'קָּאף', sound: 'ק עמוקה (מגרון)', connects: true, example: { ar: 'قهوة', translit: 'קַהְוֶה', he: 'קפה' } },
  { ar: 'ك', nameAr: 'كَاف', nameHe: 'כָּאף', sound: 'כ', connects: true, example: { ar: 'كتاب', translit: 'כִּתָּאב', he: 'ספר' } },
  { ar: 'ل', nameAr: 'لَام', nameHe: 'לָּאם', sound: 'ל', connects: true, example: { ar: 'لون', translit: 'לוֹן', he: 'צבע' } },
  { ar: 'م', nameAr: 'مِيم', nameHe: 'מִים', sound: 'מ', connects: true, example: { ar: 'ماء', translit: 'מַאא', he: 'מים' } },
  { ar: 'ن', nameAr: 'نُون', nameHe: 'נוּן', sound: 'נ', connects: true, example: { ar: 'نور', translit: 'נוּר', he: 'אור' } },
  { ar: 'ه', nameAr: 'هَاء', nameHe: 'הָּאא', sound: 'ה', connects: true, example: { ar: 'هوا', translit: 'הַוָּא', he: 'אוויר / מזג אוויר' } },
  { ar: 'و', nameAr: 'وَاو', nameHe: 'וָּאו', sound: 'ו או אוּ (תנועה)', connects: false, example: { ar: 'وقت', translit: 'וַּקְת', he: 'זמן' } },
  { ar: 'ي', nameAr: 'يَاء', nameHe: 'יָּאא', sound: 'י או אִי (תנועה)', connects: true, example: { ar: 'يلا', translit: 'יַּלָּה', he: 'יאללה' } },
];
const ARABIC_VOCAB_TOPICS: ArabicTopic[] = [
  { emoji: '🔢', title: 'מספרים', words: [
    { ar: 'واحد', translit: 'וָאחֶד', he: 'אחד' },
    { ar: 'اثنان', translit: 'אִתְ׳נַאן', he: 'שניים' },
    { ar: 'ثلاثة', translit: 'תַ׳לָאתָ׳ה', he: 'שלושה' },
    { ar: 'أربعة', translit: 'אַרְבַּעָה', he: 'ארבעה' },
    { ar: 'خمسة', translit: 'חַ׳מְסָה', he: 'חמישה' },
    { ar: 'ستة', translit: 'סִתָּה', he: 'שישה' },
    { ar: 'سبعة', translit: 'סַבְּעָה', he: 'שבעה' },
    { ar: 'ثمانية', translit: 'תְ׳מַאנְיָה', he: 'שמונה' },
    { ar: 'تسعة', translit: 'תִ׳סְעָה', he: 'תשעה' },
    { ar: 'عشرة', translit: 'עַשַׁרָה', he: 'עשרה' },
  ]},
  { emoji: '👋', title: 'ברכות', words: [
    { ar: 'مرحبا', translit: 'מַרְחַבָּא', he: 'שלום / היי' },
    { ar: 'أهلاً', translit: 'אַהְלַאן', he: 'ברוך הבא' },
    { ar: 'صباح الخير', translit: 'צַּבָּאח אַלְחֵיר', he: 'בוקר טוב' },
    { ar: 'مساء الخير', translit: 'מַסָּא אַלְחֵיר', he: 'ערב טוב' },
    { ar: 'كيفك؟', translit: 'כֵּיפַּק?', he: 'מה שלומך?' },
    { ar: 'منيح', translit: 'מְנִיח', he: 'טוב (לבנטי)' },
    { ar: 'شكرا', translit: 'שֻׁקְרַאן', he: 'תודה' },
    { ar: 'عفواً', translit: 'עַפְוַאן', he: 'בבקשה / סליחה' },
    { ar: 'مع السلامة', translit: 'מַע אַסַּלַאמָ׳ה', he: 'להתראות' },
    { ar: 'يلا', translit: 'יַאלַּה', he: 'יאללה / בוא נלך' },
  ]},
  { emoji: '👨‍👩‍👧‍👦', title: 'משפחה', words: [
    { ar: 'أب', translit: 'אַב', he: 'אבא' },
    { ar: 'أم', translit: 'אֻמּ', he: 'אמא' },
    { ar: 'أخ', translit: 'אַח׳', he: 'אח' },
    { ar: 'أخت', translit: 'אֻחְת׳', he: 'אחות' },
    { ar: 'جد', translit: 'גַ׳ד', he: 'סבא' },
    { ar: 'ستو', translit: 'סִתּוּ', he: 'סבתא' },
    { ar: 'ابن', translit: 'אִבְּן', he: 'בן' },
    { ar: 'بنت', translit: 'בִּנְת', he: 'בת' },
    { ar: 'عم', translit: 'עַם', he: "דוד (מצד האב)" },
    { ar: 'زوج', translit: 'זַוְ׳ג', he: 'בעל / זוג' },
  ]},
  { emoji: '🎨', title: 'צבעים', words: [
    { ar: 'أحمر', translit: 'אַחְמַר', he: 'אדום' },
    { ar: 'أزرق', translit: 'אַזְרַק', he: 'כחול' },
    { ar: 'أخضر', translit: 'אַחְ׳צַ׳ר', he: 'ירוק' },
    { ar: 'أصفر', translit: 'אַצְפַ׳ר', he: 'צהוב' },
    { ar: 'أبيض', translit: 'אַבְיַד', he: 'לבן' },
    { ar: 'أسود', translit: 'אַסְוַד', he: 'שחור' },
    { ar: 'بنفسجي', translit: 'בַּנַפְסַ׳ג׳י', he: 'סגול' },
    { ar: 'برتقالي', translit: 'בּוּרְתוּקַּאלִי', he: 'כתום' },
    { ar: 'وردي', translit: 'וַרְדִּי', he: 'ורוד' },
    { ar: 'بني', translit: "בּוּנִּי", he: 'חום' },
  ]},
  { emoji: '😊', title: 'רגשות', words: [
    { ar: 'سعيد', translit: 'סַעִיד', he: 'שמח' },
    { ar: 'زعلان', translit: 'זַעְלָאן', he: 'עצוב / כועס' },
    { ar: 'خايف', translit: 'חַ׳איִף', he: 'מפחד' },
    { ar: 'متوتر', translit: 'מִתַּוַּתֵּר', he: 'לחוץ / עצבני' },
    { ar: 'متحمس', translit: 'מִתְחַמֶּס', he: 'נרגש / נלהב' },
    { ar: 'تعبان', translit: 'תַּעְבָּאן', he: 'עייף' },
    { ar: 'جوعان', translit: 'ג׳וּעַאן', he: 'רעב' },
    { ar: 'عطشان', translit: 'עַטְשָׁאן', he: 'צמא' },
    { ar: 'كسلان', translit: 'כַּסְלָאן', he: 'עצלן' },
    { ar: 'مبسوط', translit: 'מַבְּסוּט', he: 'מאושר / מרוצה' },
  ]},
  { emoji: '🍕', title: 'אוכל', words: [
    { ar: 'خبز', translit: 'חֻ׳בְּז', he: 'לחם' },
    { ar: 'ماء', translit: 'מַאא', he: 'מים' },
    { ar: 'قهوة', translit: 'קַהְוֶה', he: 'קפה' },
    { ar: 'شاي', translit: 'שַׁאי', he: 'תה' },
    { ar: 'تفاح', translit: 'תֻּפַּאח', he: 'תפוח' },
    { ar: 'دجاج', translit: 'דַ׳ג׳ַאג׳', he: 'עוף' },
    { ar: 'أرز', translit: 'אַרֻּז', he: 'אורז' },
    { ar: 'حلوى', translit: 'חַלְוַא', he: 'ממתק / קינוח' },
    { ar: 'بيض', translit: 'בֵּיד', he: 'ביצים' },
    { ar: 'لبن', translit: 'לַבַּן', he: 'יוגורט / חלב' },
  ]},
  { emoji: '🏠', title: 'מקומות', words: [
    { ar: 'بيت', translit: 'בֵּית', he: 'בית' },
    { ar: 'مدرسة', translit: 'מַדְרַסֶה', he: 'בית ספר' },
    { ar: 'سوق', translit: 'סוּק', he: 'שוק' },
    { ar: 'مستشفى', translit: 'מֻסְתַשְׁפַ׳א', he: 'בית חולים' },
    { ar: 'مطعم', translit: 'מַטְעַם', he: 'מסעדה' },
    { ar: 'شارع', translit: 'שַׁארִע', he: 'רחוב' },
    { ar: 'محطة', translit: 'מַחַטָּה', he: 'תחנה' },
    { ar: 'دكان', translit: 'דּוּכַּאן', he: 'חנות' },
    { ar: 'مسجد', translit: 'מַסְג׳ִד', he: 'מסגד' },
    { ar: 'بحر', translit: 'בַּחַר', he: 'ים' },
  ]},
  { emoji: '⏰', title: 'זמן', words: [
    { ar: 'اليوم', translit: 'אַלְיוֹם', he: 'היום' },
    { ar: 'بكرا', translit: 'בּוּכְרַא', he: 'מחר' },
    { ar: 'امبارح', translit: 'אִמְבָּארִח', he: 'אתמול' },
    { ar: 'هلق', translit: 'הַלַּק', he: 'עכשיו' },
    { ar: 'الصبح', translit: 'אַצּוּבּוּח', he: 'בוקר' },
    { ar: 'الليل', translit: 'אַלְלֵיל', he: 'לילה' },
    { ar: 'الأسبوع', translit: 'אַלּוּסְבּוּע', he: 'שבוע' },
    { ar: 'الشهر', translit: "אַשְּׁשַׁהְר", he: 'חודש' },
    { ar: 'السنة', translit: 'אַסַּנֶה', he: 'שנה' },
    { ar: 'دقيقة', translit: 'דַּקִּיקַה', he: 'דקה' },
  ]},
  { emoji: '🏃', title: 'פעלים בסיסיים', words: [
    { ar: 'بدي', translit: 'בַּדִּי', he: 'אני רוצה' },
    { ar: 'بحكي', translit: 'בִּחְכִּי', he: 'אני מדבר' },
    { ar: 'بشرب', translit: 'בִּשְׁרַב', he: 'אני שותה' },
    { ar: 'باكل', translit: 'בַּאכֻּל', he: 'אני אוכל' },
    { ar: 'بروح', translit: 'בְּרוּח', he: 'אני הולך' },
    { ar: 'بيجي', translit: 'בְּיִיג׳י', he: 'הוא בא' },
    { ar: 'بشتغل', translit: 'בְּשַׁתְּגַ׳ל', he: 'אני עובד' },
    { ar: 'بنام', translit: 'בְּנָאם', he: 'אני ישן' },
    { ar: 'بحب', translit: 'בְּחֻב', he: 'אני אוהב' },
    { ar: 'مافهمت', translit: 'מָא פְהִמְת', he: 'לא הבנתי' },
  ]},
  { emoji: '🧍', title: 'גוף', words: [
    { ar: 'راس', translit: 'רַאס', he: 'ראש' },
    { ar: 'عين', translit: 'עֵין', he: 'עין' },
    { ar: 'إيد', translit: 'אִיד', he: 'יד' },
    { ar: 'رجل', translit: 'רִ׳ג׳ל', he: "רגל" },
    { ar: 'قلب', translit: 'קַלְב', he: 'לב' },
    { ar: 'أذن', translit: 'אֻ׳ד׳ן', he: 'אוזן' },
    { ar: 'انف', translit: 'אַנְף', he: 'אף' },
    { ar: 'شعر', translit: "שַׁעַר", he: 'שיער' },
    { ar: 'كتف', translit: "כְּתֵף", he: 'כתף' },
    { ar: 'بطن', translit: "בַּטְּן", he: 'בטן' },
  ]},
];

const ARABIC_VERB_TOPICS: ArabicVerbConjTopic[] = [
  { emoji: '🖊️', title: 'פעלים: עבודה', pairs: [
    { emoji: '🎨', presentAr: 'أنا برسم', presentTranslit: 'אנא בְּרַסֻּם', presentHe: 'אני מציייר/ת', pastAr: 'أنا رسمت', pastTranslit: 'אנא רַסַּמְת', pastHe: 'אני ציירתי' },
    { emoji: '🧮', presentAr: 'أنا بحسب', presentTranslit: 'אנא בְּחַסֻּב', presentHe: 'אני מחשב/ת', pastAr: 'أنا حسبت', pastTranslit: 'אנא חַסַּבְת', pastHe: 'אני חישבתי' },
    { emoji: '🖨️', presentAr: 'أنا بطبع', presentTranslit: 'אנא בִּטְבַּע', presentHe: 'אני מדפיס/ה', pastAr: 'أنا طبعت', pastTranslit: 'אנא טַבַּעְת', pastHe: 'אני הדפסתי' },
    { emoji: '📋', presentAr: 'أنا بنسخ', presentTranslit: 'אנא בְּנַסַּח', presentHe: 'אני מעתיק/ה', pastAr: 'أنا نسخت', pastTranslit: 'אנא נַסַּחְת', pastHe: 'אני העתקתי' },
    { emoji: '⚙️', presentAr: 'أنا بجهّز', presentTranslit: 'אנא בְּג׳ַהֵּז', presentHe: 'אני מכין/ה', pastAr: "أنا جهّزت", pastTranslit: 'אנא ג׳ַהֵּזְת', pastHe: 'אני הכנתי' },
    { emoji: '📊', presentAr: 'أنا بحطّط', presentTranslit: 'אנא בְּחַטֵּט', presentHe: 'אני מתכנן/ת', pastAr: 'أنا حططت', pastTranslit: 'אנא חַטֵּטְת', pastHe: 'אני תיכננתי' },
    { emoji: '🤝', presentAr: 'أنا بنجتمع', presentTranslit: 'אנא בְּנִג׳תְמֵע', presentHe: 'אני נפגש/ת', pastAr: 'أنا اجتمعت', pastTranslit: 'אנא אִג׳תְמַעְת', pastHe: 'אני נפגשתי' },
    { emoji: '👨‍🏫', presentAr: "أنا بعلّم", presentTranslit: 'אנא בְּעַלֵּם', presentHe: 'אני מלמד/ת', pastAr: "أنا علّمت", pastTranslit: 'אנא עַלֵּמְת', pastHe: 'אני לימדתי' },
    { emoji: '📚', presentAr: "أنا بتعلّم", presentTranslit: 'אנא בִּתְעַלֵּם', presentHe: 'אני לומד/ת', pastAr: "أنا تعلّمت", pastTranslit: 'אנא תְּעַלֵּמְת', pastHe: 'אני למדתי' },
    { emoji: '✅', presentAr: "أنا بخلّص", presentTranslit: 'אנא בְּח׳לֵּץ', presentHe: 'אני מסיים/ת', pastAr: "أنا خلّصت", pastTranslit: 'אנא ח׳לֵּצְת', pastHe: 'אני סיימתי' },
  ]},
  { emoji: '📞', title: 'פעלים: תקשורת', pairs: [
    { emoji: '📱', presentAr: "أنا بتّصل", presentTranslit: 'אנא בִּתַּצֵּל', presentHe: 'אני מתקשר/ת', pastAr: "أنا اتّصلت", pastTranslit: 'אנא אִתַּצַּלְת', pastHe: 'אני התקשרתי' },
    { emoji: '📲', presentAr: 'أنا بردّ', presentTranslit: 'אנא בְּרֻד', presentHe: 'אני עונה', pastAr: 'أنا ردّيت', pastTranslit: 'אנא רַדֵּית', pastHe: 'אני עניתי' },
    { emoji: '❓', presentAr: 'أنا بسأل', presentTranslit: 'אנא בְּסַאל', presentHe: 'אני שואל/ת', pastAr: 'أنا سألت', pastTranslit: 'אנא סַאלְת', pastHe: 'אני שאלתי' },
    { emoji: '💬', presentAr: 'أنا بجاوب', presentTranslit: 'אנא בְּג׳אוֹב', presentHe: 'אני משיב/ה', pastAr: 'أنا جاوبت', pastTranslit: 'אנא ג׳אוֹבְת', pastHe: 'אני השבתי' },
    { emoji: '💡', presentAr: 'أنا بشرح', presentTranslit: 'אנא בְּשְׁרַח', presentHe: 'אני מסביר/ה', pastAr: 'أنا شرحت', pastTranslit: 'אנא שְׁרַחְת', pastHe: 'אני הסברתי' },
    { emoji: '🗣️', presentAr: "أنا بخبّر", presentTranslit: 'אנא בְּח׳בַּר', presentHe: 'אני מספר/ת', pastAr: "أنا خبّرت", pastTranslit: 'אנא ח׳בַּרְת', pastHe: 'אני סיפרתי' },
    { emoji: '📤', presentAr: 'أنا ببعت', presentTranslit: 'אנא בִּבְעַת', presentHe: 'אני שולח/ת', pastAr: 'أنا بعتت', pastTranslit: 'אנא בַּעַתְת', pastHe: 'אני שלחתי' },
    { emoji: '📥', presentAr: 'أنا بستلم', presentTranslit: 'אנא בִּסְתְּלֵם', presentHe: 'אני מקבל/ת', pastAr: 'أنا استلمت', pastTranslit: 'אנא אִסְתְּלַמְת', pastHe: 'אני קיבלתי' },
    { emoji: '📖', presentAr: 'أنا بقرا', presentTranslit: 'אנא בְּקְרָא', presentHe: 'אני קורא/ת', pastAr: 'أنا قريت', pastTranslit: 'אנא קְרֵית', pastHe: 'אני קראתי' },
    { emoji: '✍️', presentAr: "أنا بوقّع", presentTranslit: 'אנא בְּוַקֵּע', presentHe: 'אני חותם/ת', pastAr: "أنا وقّعت", pastTranslit: 'אנא וַקֵּעְת', pastHe: 'אני חתמתי' },
  ]},
  { emoji: '🏃', title: 'פעלים: תנועה', pairs: [
    { emoji: '🚶', presentAr: 'أنا بروح', presentTranslit: 'אנא בְּרוּח', presentHe: 'אני הולך/ת', pastAr: 'أنا رحت', pastTranslit: 'אנא רֻחְת', pastHe: 'אני הלכתי' },
    { emoji: '🏠', presentAr: 'أنا بيجي', presentTranslit: 'אנא בְּיִג׳ִי', presentHe: 'אני בא/ה', pastAr: 'أنا جيت', pastTranslit: 'אנא ג׳ִית', pastHe: 'אני באתי' },
    { emoji: '🏃', presentAr: 'أنا بركض', presentTranslit: 'אנא בְּרֻקּוּץ', presentHe: 'אני רץ/ה', pastAr: 'أنا ركضت', pastTranslit: 'אנא רֻקַּצְת', pastHe: 'אני רצתי' },
    { emoji: '👣', presentAr: 'أنا بمشي', presentTranslit: 'אנא בְּמַשִׁי', presentHe: 'אני מטייל/ת', pastAr: 'أنا مشيت', pastTranslit: 'אנא מַשִׁית', pastHe: 'אני טיילתי' },
    { emoji: '🚗', presentAr: 'أنا بسوق', presentTranslit: 'אנא בְּסוּק', presentHe: 'אני נוהג/ת', pastAr: 'أنا سقت', pastTranslit: 'אנא סֻקְת', pastHe: 'אני נהגתי' },
    { emoji: '✈️', presentAr: 'أنا بطير', presentTranslit: 'אנא בְּטִיר', presentHe: 'אני טס/ה', pastAr: 'أنا طرت', pastTranslit: 'אנא טֻרְת', pastHe: 'אני טסתי' },
    { emoji: '🧳', presentAr: 'أنا بسافر', presentTranslit: 'אנא בְּסָאפֵר', presentHe: 'אני נוסע/ת', pastAr: 'أنا سافرت', pastTranslit: 'אנא סָאפַּרְת', pastHe: 'אני נסעתי' },
    { emoji: '🏁', presentAr: 'أنا بوصل', presentTranslit: 'אנא בְּוַצַּל', presentHe: 'אני מגיע/ה', pastAr: 'أنا وصلت', pastTranslit: 'אנא וַצַּלְת', pastHe: 'אני הגעתי' },
    { emoji: '👋', presentAr: 'أنا بمشي من', presentTranslit: 'אנא בְּמַשִׁי מִן', presentHe: 'אני עוזב/ת', pastAr: 'أنا مشيت من', pastTranslit: 'אנא מַשִׁית מִן', pastHe: 'אני עזבתי' },
    { emoji: '🔄', presentAr: 'أنا برجع', presentTranslit: 'אנא בְּרְג׳ַע', presentHe: 'אני חוזר/ת', pastAr: 'أنا رجعت', pastTranslit: 'אנא רְג׳ַעְת', pastHe: 'אני חזרתי' },
  ]},
  { emoji: '🍳', title: 'פעלים: בית', pairs: [
    { emoji: '🍽️', presentAr: 'أنا بآكل', presentTranslit: 'אנא בָּאכֻל', presentHe: 'אני אוכל/ת', pastAr: 'أنا أكلت', pastTranslit: 'אנא אֲכַלְת', pastHe: 'אני אכלתי' },
    { emoji: '🥤', presentAr: 'أنا بشرب', presentTranslit: 'אנא בְּשְׁרַב', presentHe: 'אני שותה', pastAr: 'أنا شربت', pastTranslit: 'אנא שְׁרַבְת', pastHe: 'אני שתיתי' },
    { emoji: '👨‍🍳', presentAr: 'أنا بطبخ', presentTranslit: 'אנא בְּטְבֻח', presentHe: 'אני מבשל/ת', pastAr: 'أنا طبخت', pastTranslit: 'אנא טַבַּחְת', pastHe: 'אני בישלתי' },
    { emoji: '😴', presentAr: 'أنا بنام', presentTranslit: 'אנא בְּנָאם', presentHe: 'אני ישן/ה', pastAr: 'أنا نمت', pastTranslit: 'אנא נֻמְת', pastHe: 'אני ישנתי' },
    { emoji: '⏰', presentAr: 'أنا بصحّى', presentTranslit: 'אנא בְּצַחֵּי', presentHe: 'אני מתעורר/ת', pastAr: 'أنا صحّيت', pastTranslit: 'אנא צַחֵּית', pastHe: 'אני התעוררתי' },
    { emoji: '🧹', presentAr: 'أنا بنظّف', presentTranslit: 'אנא בְּנַדַּ׳ף', presentHe: 'אני מנקה', pastAr: 'أنا نظّفت', pastTranslit: 'אנא נַדַּ׳פְת', pastHe: 'אני ניקיתי' },
    { emoji: '🚿', presentAr: 'أنا بغسل', presentTranslit: 'אנא בְּר׳סֶל', presentHe: 'אני שוטף/ת', pastAr: 'أنا غسلت', pastTranslit: 'אנא ר׳סַּלְת', pastHe: 'אני שטפתי' },
    { emoji: '🚪', presentAr: 'أنا بفتح', presentTranslit: 'אנא בְּפַּתַח', presentHe: 'אני פותח/ת', pastAr: 'أنا فتحت', pastTranslit: 'אנא פַּתַחְת', pastHe: 'אני פתחתי' },
    { emoji: '🔒', presentAr: 'أنا بسكّر', presentTranslit: 'אנא בְּסַכֵּר', presentHe: 'אני סוגר/ת', pastAr: 'أنا سكّرت', pastTranslit: 'אנא סַכֵּרְת', pastHe: 'אני סגרתי' },
    { emoji: '🛒', presentAr: 'أنا بشتري', presentTranslit: 'אנא בִּשְׁתְּרִי', presentHe: 'אני קונה', pastAr: 'أنا اشتريت', pastTranslit: 'אנא אִשְׁתְּרֵית', pastHe: 'אני קניתי' },
  ]},
  { emoji: '💭', title: 'פעלים: מחשבה', pairs: [
    { emoji: '🤔', presentAr: 'أنا بفكّر', presentTranslit: 'אנא בְּפַּכֵּר', presentHe: 'אני חושב/ת', pastAr: 'أنا فكّرت', pastTranslit: 'אנא פַּכֵּרְת', pastHe: 'אני חשבתי' },
    { emoji: '🧠', presentAr: 'أنا بعرف', presentTranslit: 'אנא בְּעְרַף', presentHe: 'אני יודע/ת', pastAr: 'أنا عرفت', pastTranslit: 'אנא עְרַפְת', pastHe: 'אני ידעתי' },
    { emoji: '💝', presentAr: 'أنا بحبّ', presentTranslit: 'אנא בְּחֻב', presentHe: 'אני רוצה/אוהב/ת', pastAr: 'أنا حبّيت', pastTranslit: 'אנא חַבֵּית', pastHe: 'אני אהבתי' },
    { emoji: '🌟', presentAr: 'أنا بتذكّر', presentTranslit: 'אנא בִּתְדַּכֵּר', presentHe: 'אני זוכר/ת', pastAr: 'أنا تذكّرت', pastTranslit: 'אנא תְּדַּכֵּרְת', pastHe: 'אני זכרתי' },
    { emoji: '🌫️', presentAr: 'أنا بنسى', presentTranslit: 'אנא בְּנְסָא', presentHe: 'אני שוכח/ת', pastAr: 'أنا نسيت', pastTranslit: 'אנא נְסִית', pastHe: 'אני שכחתי' },
    { emoji: '💡', presentAr: 'أنا بفهم', presentTranslit: 'אנא בְּפְהַם', presentHe: 'אני מבין/ה', pastAr: 'أنا فهمت', pastTranslit: 'אנא פְּהַמְת', pastHe: 'אני הבנתי' },
    { emoji: '❤️', presentAr: 'أنا بحسّ', presentTranslit: 'אנא בְּחֻס', presentHe: 'אני מרגיש/ה', pastAr: 'أنا حسّيت', pastTranslit: 'אנא חַסֵּית', pastHe: 'אני הרגשתי' },
    { emoji: '🌈', presentAr: 'أنا بتمنّى', presentTranslit: 'אנא בִּתְמַנֵּא', presentHe: 'אני מקווה', pastAr: 'أنا تمنّيت', pastTranslit: 'אנא תְּמַנֵּית', pastHe: 'אני קיוויתי' },
    { emoji: '✔️', presentAr: 'أنا بقرّر', presentTranslit: 'אנא בְּקַרֵּר', presentHe: 'אני מחליט/ה', pastAr: 'أنا قرّرت', pastTranslit: 'אנא קַרֵּרְת', pastHe: 'אני החלטתי' },
    { emoji: '🎯', presentAr: 'أنا بريد', presentTranslit: 'אנא בְּרִיד', presentHe: 'אני רוצה', pastAr: 'أنا أردت', pastTranslit: 'אנא אֲרַדְת', pastHe: 'אני רציתי' },
  ]},
  { emoji: '🏥', title: 'פעלים: גוף ובריאות', pairs: [
    { emoji: '👁️', presentAr: 'أنا بشوف', presentTranslit: 'אנא בְּשׁוּף', presentHe: 'אני רואה', pastAr: 'أنا شفت', pastTranslit: 'אנא שֻׁפְת', pastHe: 'אני ראיתי' },
    { emoji: '👂', presentAr: 'أنا بسمع', presentTranslit: 'אנא בְּסְמַע', presentHe: 'אני שומע/ת', pastAr: 'أنا سمعت', pastTranslit: 'אנא סְמַעְת', pastHe: 'אני שמעתי' },
    { emoji: '🤕', presentAr: 'أنا بوجعني', presentTranslit: 'אנא בְּווּג׳ַ׳עְנִי', presentHe: 'כואב לי', pastAr: 'أنا وجعني', pastTranslit: 'אנא ווּג׳ַ׳עְנִי', pastHe: 'כאב לי' },
    { emoji: '😨', presentAr: 'أنا بوقع', presentTranslit: 'אנא בְּוַקַּע', presentHe: 'אני נופל/ת', pastAr: 'أنا وقعت', pastTranslit: 'אנא וַקַּעְת', pastHe: 'אני נפלתי' },
    { emoji: '🪑', presentAr: 'أنا بقعد', presentTranslit: 'אנא בְּקְעֻד', presentHe: 'אני יושב/ת', pastAr: 'أنا قعدت', pastTranslit: 'אנא קְעַדְת', pastHe: 'אני ישבתי' },
    { emoji: '🧍', presentAr: 'أنا بوقف', presentTranslit: 'אנא בְּוַקֵּף', presentHe: 'אני עומד/ת', pastAr: 'أنا وقفت', pastTranslit: 'אנא וַקַּפְת', pastHe: 'אני עמדתי' },
    { emoji: '😌', presentAr: 'أنا برتاح', presentTranslit: 'אנא בְּרְתָּאח', presentHe: 'אני נח/ה', pastAr: 'أنا ارتحت', pastTranslit: 'אנא אִרְתַּחְת', pastHe: 'אני נחתי' },
    { emoji: '🏋️', presentAr: 'أنا بتمرّن', presentTranslit: 'אנא בִּתְמַרֵּן', presentHe: 'אני מתאמן/ת', pastAr: 'أنا تمرّنت', pastTranslit: 'אנא תְּמַרֵּנְת', pastHe: 'אני התאמנתי' },
    { emoji: '🤒', presentAr: 'أنا بمرض', presentTranslit: 'אנא בְּמְרַץ', presentHe: 'אני חולה', pastAr: 'أنا مرضت', pastTranslit: 'אנא מְרַצְת', pastHe: 'אני חליתי' },
    { emoji: '💪', presentAr: 'أنا بتعافى', presentTranslit: 'אנא בִּתְעָאפָּא', presentHe: 'אני מחלים/ה', pastAr: 'أنا تعافيت', pastTranslit: 'אנא תְּעָאפִּית', pastHe: 'אני החלמתי' },
  ]},
  { emoji: '🌳', title: 'פעלים: טבע ופנאי', pairs: [
    { emoji: '🎮', presentAr: 'أنا بلعب', presentTranslit: 'אנא בְּלְעַב', presentHe: 'אני משחק/ת', pastAr: 'أنا لعبت', pastTranslit: 'אנא לְעַבְת', pastHe: 'אני שיחקתי' },
    { emoji: '🏊', presentAr: 'أنا بسبح', presentTranslit: 'אנא בִּסְבַּח', presentHe: 'אני שוחה', pastAr: 'أنا سبحت', pastTranslit: 'אנא סְבַּחְת', pastHe: 'אני שחיתי' },
    { emoji: '📺', presentAr: 'أنا بتفرّج', presentTranslit: 'אנא בִּתְפַּרַּג׳', presentHe: 'אני צופה', pastAr: 'أنا تفرّجت', pastTranslit: 'אנא תְּפַּרַּג׳ְת', pastHe: 'אני צפיתי' },
    { emoji: '🎵', presentAr: 'أنا بسمع موسيقى', presentTranslit: 'אנא בְּסְמַע מוּסִיקָּא', presentHe: 'אני מקשיב/ה למוזיקה', pastAr: 'أنا سمعت موسيقى', pastTranslit: 'אנא סְמַעְת מוּסִיקָּא', pastHe: 'אני הקשבתי למוזיקה' },
    { emoji: '📖', presentAr: 'أنا بقرا', presentTranslit: 'אנא בְּקְרָא', presentHe: 'אני קורא/ת', pastAr: 'أنا قريت', pastTranslit: 'אנא קְרֵית', pastHe: 'אני קראתי' },
    { emoji: '✏️', presentAr: 'أنا بكتب', presentTranslit: 'אנא בְּכְתֻב', presentHe: 'אני כותב/ת', pastAr: 'أنا كتبت', pastTranslit: 'אנא כְּתַבְת', pastHe: 'אני כתבתי' },
    { emoji: '🎤', presentAr: 'أنا بغنّي', presentTranslit: 'אנא בְּר׳נֵּי', presentHe: 'אני שר/ה', pastAr: 'أنا غنّيت', pastTranslit: 'אנא ר׳נֵּית', pastHe: 'אני שרתי' },
    { emoji: '😂', presentAr: 'أنا بضحك', presentTranslit: 'אנא בִּדְחַכ', presentHe: 'אני צוחק/ת', pastAr: 'أنا ضحكت', pastTranslit: 'אנא דְּחַכְת', pastHe: 'אני צחקתי' },
    { emoji: '😢', presentAr: 'أنا ببكي', presentTranslit: 'אנא בְּבְּכִי', presentHe: 'אני בוכה', pastAr: 'أنا بكيت', pastTranslit: 'אנא בְּכֵית', pastHe: 'אני בכיתי' },
    { emoji: '🤗', presentAr: 'أنا بلتقي', presentTranslit: 'אנא בִּלְתְּקִי', presentHe: 'אני נפגש/ת', pastAr: 'أنا التقيت', pastTranslit: 'אנא אִלְתְּקֵית', pastHe: 'אני נפגשתי' },
  ]},
];

const SPANISH_VOCAB_TOPICS: SpanishTopic[] = [
  { emoji: '🔢', title: 'מספרים', words: [
    { es: 'uno', he: 'אחד' },
    { es: 'dos', he: 'שניים' },
    { es: 'tres', he: 'שלושה' },
    { es: 'cuatro', he: 'ארבעה' },
    { es: 'cinco', he: 'חמישה' },
    { es: 'seis', he: 'שישה' },
    { es: 'siete', he: 'שבעה' },
    { es: 'ocho', he: 'שמונה' },
    { es: 'nueve', he: 'תשעה' },
    { es: 'diez', he: 'עשרה' },
  ]},
  { emoji: '👋', title: 'ברכות', words: [
    { es: 'hola', he: 'שלום' },
    { es: 'buenos días', he: 'בוקר טוב' },
    { es: 'buenas tardes', he: 'אחר הצהריים טובים' },
    { es: 'buenas noches', he: 'לילה טוב' },
    { es: '¿cómo estás?', he: 'מה שלומך?' },
    { es: 'muy bien', he: 'מצוין' },
    { es: 'gracias', he: 'תודה' },
    { es: 'de nada', he: 'בבקשה' },
    { es: 'adiós', he: 'להתראות' },
    { es: 'hasta luego', he: 'נתראה בקרוב' },
  ]},
  { emoji: '👨‍👩‍👧‍👦', title: 'משפחה', words: [
    { es: 'padre', he: 'אבא' },
    { es: 'madre', he: 'אמא' },
    { es: 'hermano', he: 'אח' },
    { es: 'hermana', he: 'אחות' },
    { es: 'abuelo', he: 'סבא' },
    { es: 'abuela', he: 'סבתא' },
    { es: 'hijo', he: 'בן' },
    { es: 'hija', he: 'בת' },
    { es: 'tío', he: 'דוד' },
    { es: 'esposo', he: 'בעל' },
  ]},
  { emoji: '🎨', title: 'צבעים', words: [
    { es: 'rojo', he: 'אדום' },
    { es: 'azul', he: 'כחול' },
    { es: 'verde', he: 'ירוק' },
    { es: 'amarillo', he: 'צהוב' },
    { es: 'blanco', he: 'לבן' },
    { es: 'negro', he: 'שחור' },
    { es: 'morado', he: 'סגול' },
    { es: 'naranja', he: 'כתום' },
    { es: 'rosa', he: 'ורוד' },
    { es: 'marrón', he: 'חום' },
  ]},
  { emoji: '😊', title: 'רגשות', words: [
    { es: 'feliz', he: 'שמח' },
    { es: 'triste', he: 'עצוב' },
    { es: 'enojado', he: 'כועס' },
    { es: 'asustado', he: 'מפחד' },
    { es: 'cansado', he: 'עייף' },
    { es: 'hambriento', he: 'רעב' },
    { es: 'emocionado', he: 'נרגש' },
    { es: 'nervioso', he: 'עצבני' },
    { es: 'aburrido', he: 'משועמם' },
    { es: 'orgulloso', he: 'גאה' },
  ]},
  { emoji: '🍕', title: 'אוכל', words: [
    { es: 'pan', he: 'לחם' },
    { es: 'agua', he: 'מים' },
    { es: 'café', he: 'קפה' },
    { es: 'leche', he: 'חלב' },
    { es: 'manzana', he: 'תפוח' },
    { es: 'pollo', he: 'עוף' },
    { es: 'arroz', he: 'אורז' },
    { es: 'queso', he: 'גבינה' },
    { es: 'huevo', he: 'ביצה' },
    { es: 'chocolate', he: 'שוקולד' },
  ]},
  { emoji: '🏠', title: 'מקומות', words: [
    { es: 'casa', he: 'בית' },
    { es: 'escuela', he: 'בית ספר' },
    { es: 'mercado', he: 'שוק' },
    { es: 'hospital', he: 'בית חולים' },
    { es: 'restaurante', he: 'מסעדה' },
    { es: 'calle', he: 'רחוב' },
    { es: 'playa', he: 'חוף ים' },
    { es: 'tienda', he: 'חנות' },
    { es: 'parque', he: 'פארק' },
    { es: 'ciudad', he: 'עיר' },
  ]},
  { emoji: '⏰', title: 'זמן', words: [
    { es: 'hoy', he: 'היום' },
    { es: 'mañana', he: 'מחר' },
    { es: 'ayer', he: 'אתמול' },
    { es: 'ahora', he: 'עכשיו' },
    { es: 'tarde', he: 'אחר הצהריים / מאוחר' },
    { es: 'noche', he: 'לילה' },
    { es: 'semana', he: 'שבוע' },
    { es: 'mes', he: 'חודש' },
    { es: 'año', he: 'שנה' },
    { es: 'minuto', he: 'דקה' },
  ]},
  { emoji: '🏃', title: 'פעלים בסיסיים', words: [
    { es: 'quiero', he: 'אני רוצה' },
    { es: 'hablo', he: 'אני מדבר' },
    { es: 'bebo', he: 'אני שותה' },
    { es: 'como', he: 'אני אוכל' },
    { es: 'voy', he: 'אני הולך' },
    { es: 'viene', he: 'הוא/היא בא/ה' },
    { es: 'trabajo', he: 'אני עובד' },
    { es: 'duermo', he: 'אני ישן' },
    { es: 'amo', he: 'אני אוהב' },
    { es: 'no entiendo', he: 'לא הבנתי' },
  ]},
  { emoji: '🧍', title: 'גוף', words: [
    { es: 'cabeza', he: 'ראש' },
    { es: 'ojo', he: 'עין' },
    { es: 'mano', he: 'יד' },
    { es: 'pie', he: 'רגל' },
    { es: 'corazón', he: 'לב' },
    { es: 'oreja', he: 'אוזן' },
    { es: 'nariz', he: 'אף' },
    { es: 'pelo', he: 'שיער' },
    { es: 'hombro', he: 'כתף' },
    { es: 'barriga', he: 'בטן' },
  ]},
];

const SPANISH_VERB_TOPICS: SpanishVerbConjTopic[] = [
  { emoji: '🏃', title: 'Verbos: Movimiento', pairs: [
    { emoji: '🚶', presentEs: 'yo voy', presentHe: 'אני הולך/ת', pastEs: 'yo fui', pastHe: 'אני הלכתי' },
    { emoji: '🏠', presentEs: 'yo vengo', presentHe: 'אני בא/ה', pastEs: 'yo vine', pastHe: 'אני באתי' },
    { emoji: '🏃', presentEs: 'yo corro', presentHe: 'אני רץ/ה', pastEs: 'yo corrí', pastHe: 'אני רצתי' },
    { emoji: '👣', presentEs: 'yo camino', presentHe: 'אני מטייל/ת', pastEs: 'yo caminé', pastHe: 'אני טיילתי' },
    { emoji: '✈️', presentEs: 'yo vuelo', presentHe: 'אני טס/ה', pastEs: 'yo volé', pastHe: 'אני טסתי' },
    { emoji: '🏁', presentEs: 'yo llego', presentHe: 'אני מגיע/ה', pastEs: 'yo llegué', pastHe: 'אני הגעתי' },
    { emoji: '🚪', presentEs: 'yo salgo', presentHe: 'אני יוצא/ת', pastEs: 'yo salí', pastHe: 'אני יצאתי' },
    { emoji: '🔄', presentEs: 'yo vuelvo', presentHe: 'אני חוזר/ת', pastEs: 'yo volví', pastHe: 'אני חזרתי' },
  ]},
  { emoji: '🍳', title: 'Verbos: Hogar', pairs: [
    { emoji: '🍽️', presentEs: 'yo como', presentHe: 'אני אוכל/ת', pastEs: 'yo comí', pastHe: 'אני אכלתי' },
    { emoji: '🥤', presentEs: 'yo bebo', presentHe: 'אני שותה', pastEs: 'yo bebí', pastHe: 'אני שתיתי' },
    { emoji: '👨‍🍳', presentEs: 'yo cocino', presentHe: 'אני מבשל/ת', pastEs: 'yo cociné', pastHe: 'אני בישלתי' },
    { emoji: '😴', presentEs: 'yo duermo', presentHe: 'אני ישן/ה', pastEs: 'yo dormí', pastHe: 'אני ישנתי' },
    { emoji: '🧹', presentEs: 'yo limpio', presentHe: 'אני מנקה', pastEs: 'yo limpié', pastHe: 'אני ניקיתי' },
    { emoji: '🚪', presentEs: 'yo abro', presentHe: 'אני פותח/ת', pastEs: 'yo abrí', pastHe: 'אני פתחתי' },
    { emoji: '🔒', presentEs: 'yo cierro', presentHe: 'אני סוגר/ת', pastEs: 'yo cerré', pastHe: 'אני סגרתי' },
    { emoji: '🛒', presentEs: 'yo compro', presentHe: 'אני קונה', pastEs: 'yo compré', pastHe: 'אני קניתי' },
  ]},
  { emoji: '💬', title: 'Verbos: Comunicación', pairs: [
    { emoji: '🗣️', presentEs: 'yo hablo', presentHe: 'אני מדבר/ת', pastEs: 'yo hablé', pastHe: 'אני דיברתי' },
    { emoji: '👂', presentEs: 'yo escucho', presentHe: 'אני מקשיב/ה', pastEs: 'yo escuché', pastHe: 'אני הקשבתי' },
    { emoji: '📖', presentEs: 'yo leo', presentHe: 'אני קורא/ת', pastEs: 'yo leí', pastHe: 'אני קראתי' },
    { emoji: '✍️', presentEs: 'yo escribo', presentHe: 'אני כותב/ת', pastEs: 'yo escribí', pastHe: 'אני כתבתי' },
    { emoji: '📱', presentEs: 'yo llamo', presentHe: 'אני מתקשר/ת', pastEs: 'yo llamé', pastHe: 'אני התקשרתי' },
    { emoji: '📲', presentEs: 'yo contesto', presentHe: 'אני עונה', pastEs: 'yo contesté', pastHe: 'אני עניתי' },
    { emoji: '📤', presentEs: 'yo mando', presentHe: 'אני שולח/ת', pastEs: 'yo mandé', pastHe: 'אני שלחתי' },
    { emoji: '📥', presentEs: 'yo recibo', presentHe: 'אני מקבל/ת', pastEs: 'yo recibí', pastHe: 'אני קיבלתי' },
  ]},
  { emoji: '💭', title: 'Verbos: Mente', pairs: [
    { emoji: '🤔', presentEs: 'yo pienso', presentHe: 'אני חושב/ת', pastEs: 'yo pensé', pastHe: 'אני חשבתי' },
    { emoji: '🧠', presentEs: 'yo sé', presentHe: 'אני יודע/ת', pastEs: 'yo supe', pastHe: 'אני ידעתי' },
    { emoji: '💝', presentEs: 'yo quiero', presentHe: 'אני רוצה/אוהב/ת', pastEs: 'yo quise', pastHe: 'אני רציתי' },
    { emoji: '🌟', presentEs: 'yo recuerdo', presentHe: 'אני זוכר/ת', pastEs: 'yo recordé', pastHe: 'אני זכרתי' },
    { emoji: '🌫️', presentEs: 'yo olvido', presentHe: 'אני שוכח/ת', pastEs: 'yo olvidé', pastHe: 'אני שכחתי' },
    { emoji: '💡', presentEs: 'yo entiendo', presentHe: 'אני מבין/ה', pastEs: 'yo entendí', pastHe: 'אני הבנתי' },
    { emoji: '❤️', presentEs: 'yo siento', presentHe: 'אני מרגיש/ה', pastEs: 'yo sentí', pastHe: 'אני הרגשתי' },
    { emoji: '✔️', presentEs: 'yo decido', presentHe: 'אני מחליט/ה', pastEs: 'yo decidí', pastHe: 'אני החלטתי' },
  ]},
  { emoji: '💼', title: 'Verbos: Trabajo', pairs: [
    { emoji: '💼', presentEs: 'yo trabajo', presentHe: 'אני עובד/ת', pastEs: 'yo trabajé', pastHe: 'אני עבדתי' },
    { emoji: '📚', presentEs: 'yo estudio', presentHe: 'אני לומד/ת', pastEs: 'yo estudié', pastHe: 'אני למדתי' },
    { emoji: '👨‍🏫', presentEs: 'yo enseño', presentHe: 'אני מלמד/ת', pastEs: 'yo enseñé', pastHe: 'אני לימדתי' },
    { emoji: '🎓', presentEs: 'yo aprendo', presentHe: 'אני לומד/ת', pastEs: 'yo aprendí', pastHe: 'אני למדתי' },
    { emoji: '✅', presentEs: 'yo termino', presentHe: 'אני מסיים/ת', pastEs: 'yo terminé', pastHe: 'אני סיימתי' },
    { emoji: '🚀', presentEs: 'yo empiezo', presentHe: 'אני מתחיל/ה', pastEs: 'yo empecé', pastHe: 'אני התחלתי' },
    { emoji: '🤝', presentEs: 'yo ayudo', presentHe: 'אני עוזר/ת', pastEs: 'yo ayudé', pastHe: 'אני עזרתי' },
    { emoji: '💰', presentEs: 'yo gano', presentHe: 'אני מרוויח/ה', pastEs: 'yo gané', pastHe: 'אני הרווחתי' },
  ]},
];

const ITALIAN_VOCAB_TOPICS: ItalianTopic[] = [
  { emoji: '🔢', title: 'Numbers', words: [
    { it: 'uno', en: 'one' },
    { it: 'due', en: 'two' },
    { it: 'tre', en: 'three' },
    { it: 'quattro', en: 'four' },
    { it: 'cinque', en: 'five' },
    { it: 'sei', en: 'six' },
    { it: 'sette', en: 'seven' },
    { it: 'otto', en: 'eight' },
    { it: 'nove', en: 'nine' },
    { it: 'dieci', en: 'ten' },
  ]},
  { emoji: '👋', title: 'Greetings', words: [
    { it: 'ciao', en: 'hello / bye' },
    { it: 'buongiorno', en: 'good morning' },
    { it: 'buon pomeriggio', en: 'good afternoon' },
    { it: 'buonasera', en: 'good evening' },
    { it: 'come stai?', en: 'how are you?' },
    { it: 'molto bene', en: 'very well' },
    { it: 'grazie', en: 'thank you' },
    { it: 'prego', en: "you're welcome" },
    { it: 'arrivederci', en: 'goodbye' },
    { it: 'a presto', en: 'see you soon' },
  ]},
  { emoji: '👨‍👩‍👧‍👦', title: 'Family', words: [
    { it: 'padre', en: 'father' },
    { it: 'madre', en: 'mother' },
    { it: 'fratello', en: 'brother' },
    { it: 'sorella', en: 'sister' },
    { it: 'nonno', en: 'grandfather' },
    { it: 'nonna', en: 'grandmother' },
    { it: 'figlio', en: 'son' },
    { it: 'figlia', en: 'daughter' },
    { it: 'zio', en: 'uncle' },
    { it: 'marito', en: 'husband' },
  ]},
  { emoji: '🎨', title: 'Colors', words: [
    { it: 'rosso', en: 'red' },
    { it: 'blu', en: 'blue' },
    { it: 'verde', en: 'green' },
    { it: 'giallo', en: 'yellow' },
    { it: 'bianco', en: 'white' },
    { it: 'nero', en: 'black' },
    { it: 'viola', en: 'purple' },
    { it: 'arancione', en: 'orange' },
    { it: 'rosa', en: 'pink' },
    { it: 'marrone', en: 'brown' },
  ]},
  { emoji: '😊', title: 'Emotions', words: [
    { it: 'felice', en: 'happy' },
    { it: 'triste', en: 'sad' },
    { it: 'arrabbiato', en: 'angry' },
    { it: 'spaventato', en: 'scared' },
    { it: 'stanco', en: 'tired' },
    { it: 'affamato', en: 'hungry' },
    { it: 'emozionato', en: 'excited' },
    { it: 'nervoso', en: 'nervous' },
    { it: 'annoiato', en: 'bored' },
    { it: 'orgoglioso', en: 'proud' },
  ]},
  { emoji: '🍕', title: 'Food', words: [
    { it: 'pane', en: 'bread' },
    { it: 'acqua', en: 'water' },
    { it: 'caffè', en: 'coffee' },
    { it: 'latte', en: 'milk' },
    { it: 'mela', en: 'apple' },
    { it: 'pollo', en: 'chicken' },
    { it: 'riso', en: 'rice' },
    { it: 'formaggio', en: 'cheese' },
    { it: 'uovo', en: 'egg' },
    { it: 'cioccolato', en: 'chocolate' },
  ]},
  { emoji: '🏠', title: 'Places', words: [
    { it: 'casa', en: 'house' },
    { it: 'scuola', en: 'school' },
    { it: 'mercato', en: 'market' },
    { it: 'ospedale', en: 'hospital' },
    { it: 'ristorante', en: 'restaurant' },
    { it: 'strada', en: 'street' },
    { it: 'spiaggia', en: 'beach' },
    { it: 'negozio', en: 'shop' },
    { it: 'parco', en: 'park' },
    { it: 'città', en: 'city' },
  ]},
  { emoji: '⏰', title: 'Time', words: [
    { it: 'oggi', en: 'today' },
    { it: 'domani', en: 'tomorrow' },
    { it: 'ieri', en: 'yesterday' },
    { it: 'adesso', en: 'now' },
    { it: 'pomeriggio', en: 'afternoon' },
    { it: 'notte', en: 'night' },
    { it: 'settimana', en: 'week' },
    { it: 'mese', en: 'month' },
    { it: 'anno', en: 'year' },
    { it: 'minuto', en: 'minute' },
  ]},
  { emoji: '🏃', title: 'Basic Verbs', words: [
    { it: 'voglio', en: 'I want' },
    { it: 'parlo', en: 'I speak' },
    { it: 'bevo', en: 'I drink' },
    { it: 'mangio', en: 'I eat' },
    { it: 'vado', en: 'I go' },
    { it: 'viene', en: 'he/she comes' },
    { it: 'lavoro', en: 'I work' },
    { it: 'dormo', en: 'I sleep' },
    { it: 'amo', en: 'I love' },
    { it: 'non capisco', en: "I don't understand" },
  ]},
  { emoji: '🧍', title: 'Body', words: [
    { it: 'testa', en: 'head' },
    { it: 'occhio', en: 'eye' },
    { it: 'mano', en: 'hand' },
    { it: 'piede', en: 'foot' },
    { it: 'cuore', en: 'heart' },
    { it: 'orecchio', en: 'ear' },
    { it: 'naso', en: 'nose' },
    { it: 'capelli', en: 'hair' },
    { it: 'spalla', en: 'shoulder' },
    { it: 'pancia', en: 'belly' },
  ]},
];

const ITALIAN_VERB_TOPICS: ItalianVerbConjTopic[] = [
  { emoji: '🏃', title: 'Verbs: Movement', pairs: [
    { emoji: '🚶', presentIt: 'io vado', presentEn: 'I go', pastIt: 'io sono andato/a', pastEn: 'I went' },
    { emoji: '🏠', presentIt: 'io vengo', presentEn: 'I come', pastIt: 'io sono venuto/a', pastEn: 'I came' },
    { emoji: '🏃', presentIt: 'io corro', presentEn: 'I run', pastIt: 'io ho corso', pastEn: 'I ran' },
    { emoji: '👣', presentIt: 'io cammino', presentEn: 'I walk', pastIt: 'io ho camminato', pastEn: 'I walked' },
    { emoji: '✈️', presentIt: 'io volo', presentEn: 'I fly', pastIt: 'io ho volato', pastEn: 'I flew' },
    { emoji: '🏁', presentIt: 'io arrivo', presentEn: 'I arrive', pastIt: 'io sono arrivato/a', pastEn: 'I arrived' },
    { emoji: '🚪', presentIt: 'io parto', presentEn: 'I leave', pastIt: 'io sono partito/a', pastEn: 'I left' },
    { emoji: '🔄', presentIt: 'io torno', presentEn: 'I return', pastIt: 'io sono tornato/a', pastEn: 'I returned' },
  ]},
  { emoji: '🍳', title: 'Verbs: Home', pairs: [
    { emoji: '🍽️', presentIt: 'io mangio', presentEn: 'I eat', pastIt: 'io ho mangiato', pastEn: 'I ate' },
    { emoji: '🥤', presentIt: 'io bevo', presentEn: 'I drink', pastIt: 'io ho bevuto', pastEn: 'I drank' },
    { emoji: '👨‍🍳', presentIt: 'io cucino', presentEn: 'I cook', pastIt: 'io ho cucinato', pastEn: 'I cooked' },
    { emoji: '😴', presentIt: 'io dormo', presentEn: 'I sleep', pastIt: 'io ho dormito', pastEn: 'I slept' },
    { emoji: '🧹', presentIt: 'io pulisco', presentEn: 'I clean', pastIt: 'io ho pulito', pastEn: 'I cleaned' },
    { emoji: '🚪', presentIt: 'io apro', presentEn: 'I open', pastIt: 'io ho aperto', pastEn: 'I opened' },
    { emoji: '🔒', presentIt: 'io chiudo', presentEn: 'I close', pastIt: 'io ho chiuso', pastEn: 'I closed' },
    { emoji: '🛒', presentIt: 'io compro', presentEn: 'I buy', pastIt: 'io ho comprato', pastEn: 'I bought' },
  ]},
  { emoji: '💬', title: 'Verbs: Communication', pairs: [
    { emoji: '🗣️', presentIt: 'io parlo', presentEn: 'I speak', pastIt: 'io ho parlato', pastEn: 'I spoke' },
    { emoji: '👂', presentIt: 'io ascolto', presentEn: 'I listen', pastIt: 'io ho ascoltato', pastEn: 'I listened' },
    { emoji: '📖', presentIt: 'io leggo', presentEn: 'I read', pastIt: 'io ho letto', pastEn: 'I read' },
    { emoji: '✍️', presentIt: 'io scrivo', presentEn: 'I write', pastIt: 'io ho scritto', pastEn: 'I wrote' },
    { emoji: '📱', presentIt: 'io chiamo', presentEn: 'I call', pastIt: 'io ho chiamato', pastEn: 'I called' },
    { emoji: '📲', presentIt: 'io rispondo', presentEn: 'I answer', pastIt: 'io ho risposto', pastEn: 'I answered' },
    { emoji: '📤', presentIt: 'io mando', presentEn: 'I send', pastIt: 'io ho mandato', pastEn: 'I sent' },
    { emoji: '📥', presentIt: 'io ricevo', presentEn: 'I receive', pastIt: 'io ho ricevuto', pastEn: 'I received' },
  ]},
  { emoji: '💭', title: 'Verbs: Mind', pairs: [
    { emoji: '🤔', presentIt: 'io penso', presentEn: 'I think', pastIt: 'io ho pensato', pastEn: 'I thought' },
    { emoji: '🧠', presentIt: 'io so', presentEn: 'I know', pastIt: 'io ho saputo', pastEn: 'I knew' },
    { emoji: '💝', presentIt: 'io voglio', presentEn: 'I want', pastIt: 'io ho voluto', pastEn: 'I wanted' },
    { emoji: '🌟', presentIt: 'io ricordo', presentEn: 'I remember', pastIt: 'io ho ricordato', pastEn: 'I remembered' },
    { emoji: '🌫️', presentIt: 'io dimentico', presentEn: 'I forget', pastIt: 'io ho dimenticato', pastEn: 'I forgot' },
    { emoji: '💡', presentIt: 'io capisco', presentEn: 'I understand', pastIt: 'io ho capito', pastEn: 'I understood' },
    { emoji: '❤️', presentIt: 'io sento', presentEn: 'I feel', pastIt: 'io ho sentito', pastEn: 'I felt' },
    { emoji: '✔️', presentIt: 'io decido', presentEn: 'I decide', pastIt: 'io ho deciso', pastEn: 'I decided' },
  ]},
  { emoji: '💼', title: 'Verbs: Work', pairs: [
    { emoji: '💼', presentIt: 'io lavoro', presentEn: 'I work', pastIt: 'io ho lavorato', pastEn: 'I worked' },
    { emoji: '📚', presentIt: 'io studio', presentEn: 'I study', pastIt: 'io ho studiato', pastEn: 'I studied' },
    { emoji: '👨‍🏫', presentIt: 'io insegno', presentEn: 'I teach', pastIt: 'io ho insegnato', pastEn: 'I taught' },
    { emoji: '🎓', presentIt: 'io imparo', presentEn: 'I learn', pastIt: 'io ho imparato', pastEn: 'I learned' },
    { emoji: '✅', presentIt: 'io finisco', presentEn: 'I finish', pastIt: 'io ho finito', pastEn: 'I finished' },
    { emoji: '🚀', presentIt: 'io inizio', presentEn: 'I start', pastIt: 'io ho iniziato', pastEn: 'I started' },
    { emoji: '🤝', presentIt: 'io aiuto', presentEn: 'I help', pastIt: 'io ho aiutato', pastEn: 'I helped' },
    { emoji: '💰', presentIt: 'io guadagno', presentEn: 'I earn', pastIt: 'io ho guadagnato', pastEn: 'I earned' },
  ]},
];

const TURKISH_VOCAB_TOPICS: TurkishTopic[] = [
  { emoji: '🔢', title: 'מספרים', words: [
    { tr: 'bir', he: 'אחד' },
    { tr: 'iki', he: 'שניים' },
    { tr: 'üç', he: 'שלושה' },
    { tr: 'dört', he: 'ארבעה' },
    { tr: 'beş', he: 'חמישה' },
    { tr: 'altı', he: 'שישה' },
    { tr: 'yedi', he: 'שבעה' },
    { tr: 'sekiz', he: 'שמונה' },
    { tr: 'dokuz', he: 'תשעה' },
    { tr: 'on', he: 'עשרה' },
  ]},
  { emoji: '👋', title: 'ברכות', words: [
    { tr: 'merhaba', he: 'שלום' },
    { tr: 'günaydın', he: 'בוקר טוב' },
    { tr: 'iyi günler', he: 'יום טוב' },
    { tr: 'iyi akşamlar', he: 'ערב טוב' },
    { tr: 'nasılsın?', he: 'מה שלומך?' },
    { tr: 'iyiyim', he: 'אני בסדר' },
    { tr: 'teşekkürler', he: 'תודה' },
    { tr: 'rica ederim', he: 'בבקשה' },
    { tr: 'hoşça kal', he: 'להתראות' },
    { tr: 'görüşürüz', he: 'נתראה' },
  ]},
  { emoji: '👨‍👩‍👧‍👦', title: 'משפחה', words: [
    { tr: 'baba', he: 'אבא' },
    { tr: 'anne', he: 'אמא' },
    { tr: 'erkek kardeş', he: 'אח' },
    { tr: 'kız kardeş', he: 'אחות' },
    { tr: 'dede', he: 'סבא' },
    { tr: 'büyükanne', he: 'סבתא' },
    { tr: 'oğul', he: 'בן' },
    { tr: 'kız', he: 'בת' },
    { tr: 'amca', he: 'דוד' },
    { tr: 'koca', he: 'בעל' },
  ]},
  { emoji: '🎨', title: 'צבעים', words: [
    { tr: 'kırmızı', he: 'אדום' },
    { tr: 'mavi', he: 'כחול' },
    { tr: 'yeşil', he: 'ירוק' },
    { tr: 'sarı', he: 'צהוב' },
    { tr: 'beyaz', he: 'לבן' },
    { tr: 'siyah', he: 'שחור' },
    { tr: 'mor', he: 'סגול' },
    { tr: 'turuncu', he: 'כתום' },
    { tr: 'pembe', he: 'ורוד' },
    { tr: 'kahverengi', he: 'חום' },
  ]},
  { emoji: '😊', title: 'רגשות', words: [
    { tr: 'mutlu', he: 'שמח' },
    { tr: 'üzgün', he: 'עצוב' },
    { tr: 'kızgın', he: 'כועס' },
    { tr: 'korkmuş', he: 'מפחד' },
    { tr: 'yorgun', he: 'עייף' },
    { tr: 'aç', he: 'רעב' },
    { tr: 'heyecanlı', he: 'נרגש' },
    { tr: 'gergin', he: 'עצבני' },
    { tr: 'sıkılmış', he: 'משועמם' },
    { tr: 'gururlu', he: 'גאה' },
  ]},
  { emoji: '🍕', title: 'אוכל', words: [
    { tr: 'ekmek', he: 'לחם' },
    { tr: 'su', he: 'מים' },
    { tr: 'kahve', he: 'קפה' },
    { tr: 'süt', he: 'חלב' },
    { tr: 'elma', he: 'תפוח' },
    { tr: 'tavuk', he: 'עוף' },
    { tr: 'pilav', he: 'אורז' },
    { tr: 'peynir', he: 'גבינה' },
    { tr: 'yumurta', he: 'ביצה' },
    { tr: 'çikolata', he: 'שוקולד' },
  ]},
  { emoji: '🏠', title: 'מקומות', words: [
    { tr: 'ev', he: 'בית' },
    { tr: 'okul', he: 'בית ספר' },
    { tr: 'çarşı', he: 'שוק' },
    { tr: 'hastane', he: 'בית חולים' },
    { tr: 'restoran', he: 'מסעדה' },
    { tr: 'cadde', he: 'רחוב' },
    { tr: 'plaj', he: 'חוף ים' },
    { tr: 'dükkan', he: 'חנות' },
    { tr: 'park', he: 'פארק' },
    { tr: 'şehir', he: 'עיר' },
  ]},
  { emoji: '⏰', title: 'זמן', words: [
    { tr: 'bugün', he: 'היום' },
    { tr: 'yarın', he: 'מחר' },
    { tr: 'dün', he: 'אתמול' },
    { tr: 'şimdi', he: 'עכשיו' },
    { tr: 'öğleden sonra', he: 'אחר הצהריים' },
    { tr: 'gece', he: 'לילה' },
    { tr: 'hafta', he: 'שבוע' },
    { tr: 'ay', he: 'חודש' },
    { tr: 'yıl', he: 'שנה' },
    { tr: 'dakika', he: 'דקה' },
  ]},
  { emoji: '🏃', title: 'פעלים בסיסיים', words: [
    { tr: 'istiyorum', he: 'אני רוצה' },
    { tr: 'konuşuyorum', he: 'אני מדבר' },
    { tr: 'içiyorum', he: 'אני שותה' },
    { tr: 'yiyorum', he: 'אני אוכל' },
    { tr: 'gidiyorum', he: 'אני הולך' },
    { tr: 'geliyor', he: 'הוא/היא בא/ה' },
    { tr: 'çalışıyorum', he: 'אני עובד' },
    { tr: 'uyuyorum', he: 'אני ישן' },
    { tr: 'seviyorum', he: 'אני אוהב' },
    { tr: 'anlamıyorum', he: 'לא הבנתי' },
  ]},
  { emoji: '🧍', title: 'גוף', words: [
    { tr: 'baş', he: 'ראש' },
    { tr: 'göz', he: 'עין' },
    { tr: 'el', he: 'יד' },
    { tr: 'ayak', he: 'רגל' },
    { tr: 'kalp', he: 'לב' },
    { tr: 'kulak', he: 'אוזן' },
    { tr: 'burun', he: 'אף' },
    { tr: 'saç', he: 'שיער' },
    { tr: 'omuz', he: 'כתף' },
    { tr: 'karın', he: 'בטן' },
  ]},
];

const TURKISH_VERB_TOPICS: TurkishVerbConjTopic[] = [
  { emoji: '🏃', title: 'פעלים: תנועה', pairs: [
    { emoji: '🚶', presentTr: 'ben gidiyorum', presentHe: 'אני הולך/ת', pastTr: 'ben gittim', pastHe: 'אני הלכתי' },
    { emoji: '🏠', presentTr: 'ben geliyorum', presentHe: 'אני בא/ה', pastTr: 'ben geldim', pastHe: 'אני באתי' },
    { emoji: '🏃', presentTr: 'ben koşuyorum', presentHe: 'אני רץ/ה', pastTr: 'ben koştum', pastHe: 'אני רצתי' },
    { emoji: '👣', presentTr: 'ben yürüyorum', presentHe: 'אני מהלך/ת', pastTr: 'ben yürüdüm', pastHe: 'אני הלכתי לאט' },
    { emoji: '✈️', presentTr: 'ben uçuyorum', presentHe: 'אני טס/ה', pastTr: 'ben uçtum', pastHe: 'אני טסתי' },
    { emoji: '🏁', presentTr: 'ben varıyorum', presentHe: 'אני מגיע/ה', pastTr: 'ben vardım', pastHe: 'אני הגעתי' },
    { emoji: '🚪', presentTr: 'ben çıkıyorum', presentHe: 'אני יוצא/ת', pastTr: 'ben çıktım', pastHe: 'אני יצאתי' },
    { emoji: '🔄', presentTr: 'ben dönüyorum', presentHe: 'אני חוזר/ת', pastTr: 'ben döndüm', pastHe: 'אני חזרתי' },
  ]},
  { emoji: '🍳', title: 'פעלים: בית', pairs: [
    { emoji: '🍽️', presentTr: 'ben yiyorum', presentHe: 'אני אוכל/ת', pastTr: 'ben yedim', pastHe: 'אני אכלתי' },
    { emoji: '🥤', presentTr: 'ben içiyorum', presentHe: 'אני שותה', pastTr: 'ben içtim', pastHe: 'אני שתיתי' },
    { emoji: '👨‍🍳', presentTr: 'ben pişiriyorum', presentHe: 'אני מבשל/ת', pastTr: 'ben pişirdim', pastHe: 'אני בישלתי' },
    { emoji: '😴', presentTr: 'ben uyuyorum', presentHe: 'אני ישן/ה', pastTr: 'ben uyudum', pastHe: 'אני ישנתי' },
    { emoji: '🧹', presentTr: 'ben temizliyorum', presentHe: 'אני מנקה', pastTr: 'ben temizledim', pastHe: 'אני ניקיתי' },
    { emoji: '🚪', presentTr: 'ben açıyorum', presentHe: 'אני פותח/ת', pastTr: 'ben açtım', pastHe: 'אני פתחתי' },
    { emoji: '🔒', presentTr: 'ben kapatıyorum', presentHe: 'אני סוגר/ת', pastTr: 'ben kapattım', pastHe: 'אני סגרתי' },
    { emoji: '🛒', presentTr: 'ben alıyorum', presentHe: 'אני קונה', pastTr: 'ben aldım', pastHe: 'אני קניתי' },
  ]},
  { emoji: '💬', title: 'פעלים: תקשורת', pairs: [
    { emoji: '🗣️', presentTr: 'ben konuşuyorum', presentHe: 'אני מדבר/ת', pastTr: 'ben konuştum', pastHe: 'אני דיברתי' },
    { emoji: '👂', presentTr: 'ben dinliyorum', presentHe: 'אני מקשיב/ה', pastTr: 'ben dinledim', pastHe: 'אני הקשבתי' },
    { emoji: '📖', presentTr: 'ben okuyorum', presentHe: 'אני קורא/ת', pastTr: 'ben okudum', pastHe: 'אני קראתי' },
    { emoji: '✍️', presentTr: 'ben yazıyorum', presentHe: 'אני כותב/ת', pastTr: 'ben yazdım', pastHe: 'אני כתבתי' },
    { emoji: '📱', presentTr: 'ben arıyorum', presentHe: 'אני מתקשר/ת', pastTr: 'ben aradım', pastHe: 'אני התקשרתי' },
    { emoji: '📲', presentTr: 'ben cevaplıyorum', presentHe: 'אני עונה', pastTr: 'ben cevapladım', pastHe: 'אני עניתי' },
    { emoji: '📤', presentTr: 'ben gönderiyorum', presentHe: 'אני שולח/ת', pastTr: 'ben gönderdim', pastHe: 'אני שלחתי' },
    { emoji: '📥', presentTr: 'ben alıyorum', presentHe: 'אני מקבל/ת', pastTr: 'ben aldım', pastHe: 'אני קיבלתי' },
  ]},
  { emoji: '💭', title: 'פעלים: מחשבה', pairs: [
    { emoji: '🤔', presentTr: 'ben düşünüyorum', presentHe: 'אני חושב/ת', pastTr: 'ben düşündüm', pastHe: 'אני חשבתי' },
    { emoji: '🧠', presentTr: 'ben biliyorum', presentHe: 'אני יודע/ת', pastTr: 'ben bildim', pastHe: 'אני ידעתי' },
    { emoji: '💝', presentTr: 'ben istiyorum', presentHe: 'אני רוצה', pastTr: 'ben istedim', pastHe: 'אני רציתי' },
    { emoji: '🌟', presentTr: 'ben hatırlıyorum', presentHe: 'אני זוכר/ת', pastTr: 'ben hatırladım', pastHe: 'אני זכרתי' },
    { emoji: '🌫️', presentTr: 'ben unutuyorum', presentHe: 'אני שוכח/ת', pastTr: 'ben unuttum', pastHe: 'אני שכחתי' },
    { emoji: '💡', presentTr: 'ben anlıyorum', presentHe: 'אני מבין/ה', pastTr: 'ben anladım', pastHe: 'אני הבנתי' },
    { emoji: '❤️', presentTr: 'ben hissediyorum', presentHe: 'אני מרגיש/ה', pastTr: 'ben hissettim', pastHe: 'אני הרגשתי' },
    { emoji: '✔️', presentTr: 'ben karar veriyorum', presentHe: 'אני מחליט/ה', pastTr: 'ben karar verdim', pastHe: 'אני החלטתי' },
  ]},
  { emoji: '💼', title: 'פעלים: עבודה', pairs: [
    { emoji: '💼', presentTr: 'ben çalışıyorum', presentHe: 'אני עובד/ת', pastTr: 'ben çalıştım', pastHe: 'אני עבדתי' },
    { emoji: '📚', presentTr: 'ben öğreniyorum', presentHe: 'אני לומד/ת', pastTr: 'ben öğrendim', pastHe: 'אני למדתי' },
    { emoji: '👨‍🏫', presentTr: 'ben öğretiyorum', presentHe: 'אני מלמד/ת', pastTr: 'ben öğrettim', pastHe: 'אני לימדתי' },
    { emoji: '✅', presentTr: 'ben bitiriyorum', presentHe: 'אני מסיים/ת', pastTr: 'ben bitirdim', pastHe: 'אני סיימתי' },
    { emoji: '🚀', presentTr: 'ben başlıyorum', presentHe: 'אני מתחיל/ה', pastTr: 'ben başladım', pastHe: 'אני התחלתי' },
    { emoji: '🤝', presentTr: 'ben yardım ediyorum', presentHe: 'אני עוזר/ת', pastTr: 'ben yardım ettim', pastHe: 'אני עזרתי' },
    { emoji: '📋', presentTr: 'ben planlıyorum', presentHe: 'אני מתכנן/ת', pastTr: 'ben planladım', pastHe: 'אני תכננתי' },
    { emoji: '💰', presentTr: 'ben kazanıyorum', presentHe: 'אני מרוויח/ה', pastTr: 'ben kazandım', pastHe: 'אני הרווחתי' },
  ]},
];

const FRENCH_VOCAB_TOPICS: FrenchTopic[] = [
  { emoji: '🔢', title: 'מספרים', words: [
    { fr: 'un', he: 'אחד' }, { fr: 'deux', he: 'שניים' }, { fr: 'trois', he: 'שלושה' },
    { fr: 'quatre', he: 'ארבעה' }, { fr: 'cinq', he: 'חמישה' }, { fr: 'six', he: 'שישה' },
    { fr: 'sept', he: 'שבעה' }, { fr: 'huit', he: 'שמונה' }, { fr: 'neuf', he: 'תשעה' }, { fr: 'dix', he: 'עשרה' },
  ]},
  { emoji: '👋', title: 'ברכות', words: [
    { fr: 'bonjour', he: 'שלום' }, { fr: 'bonsoir', he: 'ערב טוב' }, { fr: 'merci', he: 'תודה' },
    { fr: "s'il vous plaît", he: 'בבקשה' }, { fr: 'de rien', he: 'על לא דבר' },
    { fr: 'comment allez-vous?', he: 'מה שלומך?' }, { fr: 'très bien', he: 'מצוין' },
    { fr: 'au revoir', he: 'להתראות' }, { fr: 'excusez-moi', he: 'סליחה' }, { fr: 'bonne nuit', he: 'לילה טוב' },
  ]},
  { emoji: '👨‍👩‍👧‍👦', title: 'משפחה', words: [
    { fr: 'père', he: 'אבא' }, { fr: 'mère', he: 'אמא' }, { fr: 'frère', he: 'אח' },
    { fr: 'sœur', he: 'אחות' }, { fr: 'grand-père', he: 'סבא' }, { fr: 'grand-mère', he: 'סבתא' },
    { fr: 'fils', he: 'בן' }, { fr: 'fille', he: 'בת' }, { fr: 'oncle', he: 'דוד' }, { fr: 'mari', he: 'בעל' },
  ]},
  { emoji: '🎨', title: 'צבעים', words: [
    { fr: 'rouge', he: 'אדום' }, { fr: 'bleu', he: 'כחול' }, { fr: 'vert', he: 'ירוק' },
    { fr: 'jaune', he: 'צהוב' }, { fr: 'blanc', he: 'לבן' }, { fr: 'noir', he: 'שחור' },
    { fr: 'violet', he: 'סגול' }, { fr: 'orange', he: 'כתום' }, { fr: 'rose', he: 'ורוד' }, { fr: 'marron', he: 'חום' },
  ]},
  { emoji: '😊', title: 'רגשות', words: [
    { fr: 'heureux', he: 'שמח' }, { fr: 'triste', he: 'עצוב' }, { fr: 'en colère', he: 'כועס' },
    { fr: 'fatigué', he: 'עייף' }, { fr: 'affamé', he: 'רעב' }, { fr: 'excité', he: 'נרגש' },
    { fr: 'inquiet', he: 'מודאג' }, { fr: 'ennuyé', he: 'משועמם' }, { fr: 'fier', he: 'גאה' }, { fr: 'amoureux', he: 'מאוהב' },
  ]},
  { emoji: '🍕', title: 'אוכל', words: [
    { fr: 'pain', he: 'לחם' }, { fr: 'eau', he: 'מים' }, { fr: 'café', he: 'קפה' },
    { fr: 'lait', he: 'חלב' }, { fr: 'fromage', he: 'גבינה' }, { fr: 'poulet', he: 'עוף' },
    { fr: 'riz', he: 'אורז' }, { fr: 'œuf', he: 'ביצה' }, { fr: 'chocolat', he: 'שוקולד' }, { fr: 'pomme', he: 'תפוח' },
  ]},
  { emoji: '🏠', title: 'מקומות', words: [
    { fr: 'maison', he: 'בית' }, { fr: 'école', he: 'בית ספר' }, { fr: 'marché', he: 'שוק' },
    { fr: 'hôpital', he: 'בית חולים' }, { fr: 'restaurant', he: 'מסעדה' }, { fr: 'rue', he: 'רחוב' },
    { fr: 'plage', he: 'חוף ים' }, { fr: 'magasin', he: 'חנות' }, { fr: 'parc', he: 'פארק' }, { fr: 'ville', he: 'עיר' },
  ]},
  { emoji: '⏰', title: 'זמן', words: [
    { fr: "aujourd'hui", he: 'היום' }, { fr: 'demain', he: 'מחר' }, { fr: 'hier', he: 'אתמול' },
    { fr: 'maintenant', he: 'עכשיו' }, { fr: 'après-midi', he: 'אחר הצהריים' }, { fr: 'nuit', he: 'לילה' },
    { fr: 'semaine', he: 'שבוע' }, { fr: 'mois', he: 'חודש' }, { fr: 'année', he: 'שנה' }, { fr: 'minute', he: 'דקה' },
  ]},
  { emoji: '🏃', title: 'פעלים בסיסיים', words: [
    { fr: 'je veux', he: 'אני רוצה' }, { fr: 'je parle', he: 'אני מדבר' }, { fr: 'je bois', he: 'אני שותה' },
    { fr: 'je mange', he: 'אני אוכל' }, { fr: 'je vais', he: 'אני הולך' }, { fr: 'il vient', he: 'הוא בא' },
    { fr: 'je travaille', he: 'אני עובד' }, { fr: 'je dors', he: 'אני ישן' }, { fr: "j'aime", he: 'אני אוהב' }, { fr: 'je comprends', he: 'אני מבין' },
  ]},
  { emoji: '🧍', title: 'גוף', words: [
    { fr: 'tête', he: 'ראש' }, { fr: 'œil', he: 'עין' }, { fr: 'main', he: 'יד' },
    { fr: 'pied', he: 'רגל' }, { fr: 'cœur', he: 'לב' }, { fr: 'oreille', he: 'אוזן' },
    { fr: 'nez', he: 'אף' }, { fr: 'cheveux', he: 'שיער' }, { fr: 'épaule', he: 'כתף' }, { fr: 'ventre', he: 'בטן' },
  ]},
];

const FRENCH_VERB_TOPICS: FrenchVerbConjTopic[] = [
  { emoji: '🏃', title: 'פעלים: תנועה', pairs: [
    { emoji: '🚶', presentFr: 'je vais', presentHe: 'אני הולך/ת', pastFr: 'je suis allé(e)', pastHe: 'אני הלכתי' },
    { emoji: '🏠', presentFr: 'je viens', presentHe: 'אני בא/ה', pastFr: 'je suis venu(e)', pastHe: 'אני באתי' },
    { emoji: '🏃', presentFr: 'je cours', presentHe: 'אני רץ/ה', pastFr: "j'ai couru", pastHe: 'אני רצתי' },
    { emoji: '👣', presentFr: 'je marche', presentHe: 'אני מהלך/ת', pastFr: "j'ai marché", pastHe: 'אני הלכתי' },
    { emoji: '✈️', presentFr: 'je vole', presentHe: 'אני טס/ה', pastFr: "j'ai volé", pastHe: 'אני טסתי' },
    { emoji: '🏁', presentFr: "j'arrive", presentHe: 'אני מגיע/ה', pastFr: 'je suis arrivé(e)', pastHe: 'אני הגעתי' },
    { emoji: '🚪', presentFr: 'je pars', presentHe: 'אני עוזב/ת', pastFr: 'je suis parti(e)', pastHe: 'אני עזבתי' },
    { emoji: '🔄', presentFr: 'je rentre', presentHe: 'אני חוזר/ת', pastFr: 'je suis rentré(e)', pastHe: 'אני חזרתי' },
  ]},
  { emoji: '🍳', title: 'פעלים: בית', pairs: [
    { emoji: '🍽️', presentFr: 'je mange', presentHe: 'אני אוכל/ת', pastFr: "j'ai mangé", pastHe: 'אני אכלתי' },
    { emoji: '🥤', presentFr: 'je bois', presentHe: 'אני שותה', pastFr: "j'ai bu", pastHe: 'אני שתיתי' },
    { emoji: '👨‍🍳', presentFr: 'je cuisine', presentHe: 'אני מבשל/ת', pastFr: "j'ai cuisiné", pastHe: 'אני בישלתי' },
    { emoji: '😴', presentFr: 'je dors', presentHe: 'אני ישן/ה', pastFr: "j'ai dormi", pastHe: 'אני ישנתי' },
    { emoji: '🧹', presentFr: 'je nettoie', presentHe: 'אני מנקה', pastFr: "j'ai nettoyé", pastHe: 'אני ניקיתי' },
    { emoji: '🚪', presentFr: "j'ouvre", presentHe: 'אני פותח/ת', pastFr: "j'ai ouvert", pastHe: 'אני פתחתי' },
    { emoji: '🔒', presentFr: 'je ferme', presentHe: 'אני סוגר/ת', pastFr: "j'ai fermé", pastHe: 'אני סגרתי' },
    { emoji: '🛒', presentFr: "j'achète", presentHe: 'אני קונה', pastFr: "j'ai acheté", pastHe: 'אני קניתי' },
  ]},
  { emoji: '💬', title: 'פעלים: תקשורת', pairs: [
    { emoji: '🗣️', presentFr: 'je parle', presentHe: 'אני מדבר/ת', pastFr: "j'ai parlé", pastHe: 'אני דיברתי' },
    { emoji: '👂', presentFr: "j'écoute", presentHe: 'אני מקשיב/ה', pastFr: "j'ai écouté", pastHe: 'אני הקשבתי' },
    { emoji: '📖', presentFr: 'je lis', presentHe: 'אני קורא/ת', pastFr: "j'ai lu", pastHe: 'אני קראתי' },
    { emoji: '✍️', presentFr: "j'écris", presentHe: 'אני כותב/ת', pastFr: "j'ai écrit", pastHe: 'אני כתבתי' },
    { emoji: '📱', presentFr: "j'appelle", presentHe: 'אני מתקשר/ת', pastFr: "j'ai appelé", pastHe: 'אני התקשרתי' },
    { emoji: '📲', presentFr: 'je réponds', presentHe: 'אני עונה', pastFr: "j'ai répondu", pastHe: 'אני עניתי' },
    { emoji: '📤', presentFr: "j'envoie", presentHe: 'אני שולח/ת', pastFr: "j'ai envoyé", pastHe: 'אני שלחתי' },
    { emoji: '📥', presentFr: 'je reçois', presentHe: 'אני מקבל/ת', pastFr: "j'ai reçu", pastHe: 'אני קיבלתי' },
  ]},
  { emoji: '💭', title: 'פעלים: מחשבה', pairs: [
    { emoji: '🤔', presentFr: 'je pense', presentHe: 'אני חושב/ת', pastFr: "j'ai pensé", pastHe: 'אני חשבתי' },
    { emoji: '🧠', presentFr: 'je sais', presentHe: 'אני יודע/ת', pastFr: "j'ai su", pastHe: 'אני ידעתי' },
    { emoji: '💝', presentFr: 'je veux', presentHe: 'אני רוצה', pastFr: "j'ai voulu", pastHe: 'אני רציתי' },
    { emoji: '🌟', presentFr: 'je me souviens', presentHe: 'אני זוכר/ת', pastFr: 'je me suis souvenu(e)', pastHe: 'אני זכרתי' },
    { emoji: '🌫️', presentFr: "j'oublie", presentHe: 'אני שוכח/ת', pastFr: "j'ai oublié", pastHe: 'אני שכחתי' },
    { emoji: '💡', presentFr: 'je comprends', presentHe: 'אני מבין/ה', pastFr: "j'ai compris", pastHe: 'אני הבנתי' },
    { emoji: '❤️', presentFr: 'je sens', presentHe: 'אני מרגיש/ה', pastFr: "j'ai senti", pastHe: 'אני הרגשתי' },
    { emoji: '✔️', presentFr: 'je décide', presentHe: 'אני מחליט/ה', pastFr: "j'ai décidé", pastHe: 'אני החלטתי' },
  ]},
  { emoji: '💼', title: 'פעלים: עבודה', pairs: [
    { emoji: '💼', presentFr: 'je travaille', presentHe: 'אני עובד/ת', pastFr: "j'ai travaillé", pastHe: 'אני עבדתי' },
    { emoji: '📚', presentFr: "j'étudie", presentHe: 'אני לומד/ת', pastFr: "j'ai étudié", pastHe: 'אני למדתי' },
    { emoji: '👨‍🏫', presentFr: "j'enseigne", presentHe: 'אני מלמד/ת', pastFr: "j'ai enseigné", pastHe: 'אני לימדתי' },
    { emoji: '✅', presentFr: 'je finis', presentHe: 'אני מסיים/ת', pastFr: "j'ai fini", pastHe: 'אני סיימתי' },
    { emoji: '🚀', presentFr: 'je commence', presentHe: 'אני מתחיל/ה', pastFr: "j'ai commencé", pastHe: 'אני התחלתי' },
    { emoji: '🤝', presentFr: "j'aide", presentHe: 'אני עוזר/ת', pastFr: "j'ai aidé", pastHe: 'אני עזרתי' },
    { emoji: '📋', presentFr: 'je planifie', presentHe: 'אני מתכנן/ת', pastFr: "j'ai planifié", pastHe: 'אני תכננתי' },
    { emoji: '💰', presentFr: 'je gagne', presentHe: 'אני מרוויח/ה', pastFr: "j'ai gagné", pastHe: 'אני הרווחתי' },
  ]},
];

// ── LEVEL 2 STARTER PACKS ─────────────────────────────────────────────────

const ARABIC_VOCAB_TOPICS_2: ArabicTopic[] = [
  { emoji: '🛒', title: 'קניות', words: [
    { ar: 'دكان', translit: 'דוּכּאן', he: 'חנות' },
    { ar: 'سعر', translit: 'סַעְר', he: 'מחיר' },
    { ar: 'رخيص', translit: 'רְחִ׳יס', he: 'זול' },
    { ar: 'غالي', translit: 'ר׳אלי', he: 'יקר' },
    { ar: 'اشترى', translit: 'אִשְׁתְּרָה', he: 'קנה' },
    { ar: 'باع', translit: 'בַּאע', he: 'מכר' },
    { ar: 'كاش', translit: 'כַּאש', he: 'מזומן' },
    { ar: 'بطاقة', translit: 'בִּטַּאקַה', he: 'כרטיס' },
    { ar: 'فاتورة', translit: 'פַּאתוּרַה', he: 'קבלה' },
    { ar: 'مقاس', translit: 'מַּקַּאס', he: 'מידה' },
  ]},
  { emoji: '🗺️', title: 'כיוונים', words: [
    { ar: 'شمال', translit: 'שְׁמַאל', he: 'שמאל' },
    { ar: 'يمين', translit: 'יְמִין', he: 'ימין' },
    { ar: 'دغري', translit: 'דוּר׳רי', he: 'ישר' },
    { ar: 'قريب', translit: 'קְרִיב', he: 'קרוב' },
    { ar: 'بعيد', translit: 'בְּעִיד', he: 'רחוק' },
    { ar: 'شارع', translit: 'שָׁארִע', he: 'רחוב' },
    { ar: 'زاوية', translit: 'זָאוִויַה', he: 'פינה' },
    { ar: 'خريطة', translit: 'ח׳רִיטַה', he: 'מפה' },
    { ar: 'ضايع', translit: 'דָּאיִּע', he: 'אבוד' },
    { ar: 'وصل', translit: 'וֻצַּל', he: 'הגיע' },
  ]},
  { emoji: '🌤️', title: 'מזג אוויר', words: [
    { ar: 'حار', translit: 'חַאר', he: 'חם' },
    { ar: 'بارد', translit: 'בַּארִד', he: 'קר' },
    { ar: 'مطر', translit: 'מַטַר', he: 'גשם' },
    { ar: 'شمس', translit: 'שַׁמְס', he: 'שמש' },
    { ar: 'ريح', translit: 'רִיח', he: 'רוח' },
    { ar: 'غيم', translit: 'ר׳יִם', he: 'עננים' },
    { ar: 'ثلج', translit: 'תַּלְג׳', he: 'שלג' },
    { ar: 'درجة حرارة', translit: 'דַּרַג׳ה חַרַארַה', he: 'טמפרטורה' },
    { ar: 'توقع جو', translit: 'תַּוַּקֻּע ג׳וּ', he: 'תחזית' },
    { ar: 'فصل', translit: 'פַצְל', he: 'עונה' },
  ]},
  { emoji: '🏥', title: 'בריאות', words: [
    { ar: 'دكتور', translit: 'דוּכְּתוּר', he: 'רופא' },
    { ar: 'دوا', translit: 'דַּוַא', he: 'תרופה' },
    { ar: 'وجع', translit: 'וַּג׳َע', he: 'כאב' },
    { ar: 'حمى', translit: 'חֻמַּה', he: 'חום' },
    { ar: 'مريض', translit: 'מְרִיד', he: 'חולה' },
    { ar: 'صيدلية', translit: 'צֵיְדַלִיֵּה', he: 'בית מרקחת' },
    { ar: 'موعد', translit: 'מַוְעִד', he: 'תור' },
    { ar: 'راحة', translit: 'רַאחַה', he: 'מנוחה' },
    { ar: 'بتوجع', translit: 'בְּתוּג׳ַּע', he: 'כואב' },
    { ar: 'أحسن', translit: 'אַחְסַן', he: 'טוב יותר' },
  ]},
  { emoji: '🚌', title: 'תחבורה', words: [
    { ar: 'باص', translit: 'בַּאס', he: 'אוטובוס' },
    { ar: 'قطار', translit: 'קִטַּאר', he: 'רכבת' },
    { ar: 'تاكسي', translit: 'תַּאכְּסִי', he: 'מונית' },
    { ar: 'تذكرة', translit: 'תַּזְכַּרַה', he: 'כרטיס' },
    { ar: 'محطة', translit: 'מַחַטַּה', he: 'תחנה' },
    { ar: 'مطار', translit: 'מַטַּאר', he: 'שדה תעופה' },
    { ar: 'متأخر', translit: 'מְתַאַח׳ר', he: 'מאחר' },
    { ar: 'رصيف', translit: 'רַצִּיף', he: 'פלטפורמה' },
    { ar: 'كرسي', translit: 'כֻּרְסִי', he: 'מושב' },
    { ar: 'سواق', translit: 'סַוַּאק', he: 'נהג' },
  ]},
  { emoji: '🍽️', title: 'אכילה בחוץ', words: [
    { ar: 'قائمة', translit: 'קַאאִמַה', he: 'תפריט' },
    { ar: 'طلب', translit: 'טָלַב', he: 'הזמין' },
    { ar: 'نادل', translit: 'נַאדִל', he: 'מלצר' },
    { ar: 'حساب', translit: 'חִסַּאב', he: 'חשבון' },
    { ar: 'حجز', translit: 'חַג׳ַז', he: 'הזמנה' },
    { ar: 'طاولة', translit: 'טַאוְלַה', he: 'שולחן' },
    { ar: 'مقبلات', translit: 'מֻקַּבִּלַאת', he: 'מנה ראשונה' },
    { ar: 'حلو', translit: 'חֻלּוּ', he: 'קינוח' },
    { ar: 'بقشيش', translit: 'בַּקְשִׁיש', he: 'טיפ' },
    { ar: 'لذيذ', translit: 'לַּזִּיז', he: 'טעים' },
  ]},
  { emoji: '📅', title: 'שגרה יומית', words: [
    { ar: 'صحي', translit: 'צְחִי', he: 'התעורר' },
    { ar: 'استحمم', translit: 'אִסְתַּחַמַּם', he: 'התקלח' },
    { ar: 'فطور', translit: 'פְּטוּר', he: 'ארוחת בוקר' },
    { ar: 'روح عالشغل', translit: 'רוּח עַאשְׁשַׁר׳ל', he: 'יצא לעבודה' },
    { ar: 'غدا', translit: 'ר׳דַא', he: 'ארוחת צהריים' },
    { ar: 'شتغل', translit: 'שְׁתַּר׳ַל', he: 'עבד' },
    { ar: 'عشا', translit: 'עַשָּׁא', he: 'ארוחת ערב' },
    { ar: 'ارتاح', translit: 'אִרְתַּאח', he: 'נח' },
    { ar: 'نام', translit: 'נַאם', he: 'ישן' },
    { ar: 'خطط', translit: 'חַטַּט', he: 'תכנן' },
  ]},
  { emoji: '💬', title: 'דעות', words: [
    { ar: 'فكّر', translit: 'פַּכַּר', he: 'חשב' },
    { ar: 'آمن', translit: 'אָמַן', he: 'האמין' },
    { ar: 'وافق', translit: 'וַּאפַק', he: 'הסכים' },
    { ar: 'ما وافق', translit: 'מַא וַּאפַק', he: 'לא הסכים' },
    { ar: 'ممكن', translit: 'מֻמְכִן', he: 'אולי' },
    { ar: 'مهم', translit: 'מֻהִמּ', he: 'חשוב' },
    { ar: 'مثير', translit: 'מֻתִּיר', he: 'מעניין' },
    { ar: 'ممل', translit: 'מֻמִּל', he: 'משעמם' },
    { ar: 'فضّل', translit: 'פַּדַּל', he: 'העדיף' },
    { ar: 'رأي', translit: 'רַאיּ', he: 'דעה' },
  ]},
  { emoji: '🏠', title: 'בית ומחייה', words: [
    { ar: 'إيجار', translit: 'אִיג׳ַאר', he: 'שכירות' },
    { ar: 'جار', translit: 'ג׳אר', he: 'שכן' },
    { ar: 'طابق', translit: 'טַאבִּק', he: 'קומה' },
    { ar: 'مفتاح', translit: 'מִפְתַּאח', he: 'מפתח' },
    { ar: 'أثاث', translit: 'אַתַּאת', he: 'רהיטים' },
    { ar: 'نظّف', translit: 'נַּדַּף', he: 'ניקה' },
    { ar: 'مكسور', translit: 'מַכְּסוּר', he: 'שבור' },
    { ar: 'صلّح', translit: 'צַּלַּח', he: 'תיקן' },
    { ar: 'مريح', translit: 'מְרִיח', he: 'נוח' },
    { ar: 'انتقل', translit: 'אִנְתַּקַל', he: 'עבר דירה' },
  ]},
  { emoji: '💼', title: 'עבודה ולימודים', words: [
    { ar: 'شغل', translit: 'שַׁר׳ַל', he: 'עבודה' },
    { ar: 'مكتب', translit: 'מַכְּתַּב', he: 'משרד' },
    { ar: 'اجتماع', translit: 'אִג׳ְתִּמָאע', he: 'ישיבה' },
    { ar: 'موعد نهائي', translit: 'מַוְעִד נִהַאאִי', he: 'דד-ליין' },
    { ar: 'زميل', translit: 'זְמִיל', he: 'עמית' },
    { ar: 'امتحان', translit: 'אִמְתִּחָאן', he: 'מבחן' },
    { ar: 'علامة', translit: 'עַלַאמַה', he: 'ציון' },
    { ar: 'واجب', translit: 'וַּאג׳ִב', he: 'שיעורי בית' },
    { ar: 'مشروع', translit: 'מַשְׁרוּע', he: 'פרויקט' },
    { ar: 'تعلّم', translit: 'תַּעַלַּם', he: 'למד' },
  ]},
];

const ARABIC_VERB_TOPICS_2: ArabicVerbConjTopic[] = [
  { emoji: '🛍️', title: 'פעלים: קניות', pairs: [
    { emoji: '🛒', presentAr: 'عم يشتري', presentTranslit: 'עַם יִשְׁתְּרִי', presentHe: 'קונה', pastAr: 'اشترى', pastTranslit: 'אִשְׁתְּרָה', pastHe: 'קנה' },
    { emoji: '💰', presentAr: 'عم يبيع', presentTranslit: 'עַם יִבִּיע', presentHe: 'מוכר', pastAr: 'باع', pastTranslit: 'בַּאע', pastHe: 'מכר' },
    { emoji: '💳', presentAr: 'عم يدفع', presentTranslit: 'עַם יִדְפַע', presentHe: 'משלם', pastAr: 'دفع', pastTranslit: 'דַּפַע', pastHe: 'שילם' },
    { emoji: '💵', presentAr: 'عم يكلف', presentTranslit: 'עַם יִכַּלִּף', presentHe: 'עולה', pastAr: 'كلّف', pastTranslit: 'כַּלַּף', pastHe: 'עלה' },
    { emoji: '🏦', presentAr: 'عم يوفّر', presentTranslit: 'עַם יְוַּפִּר', presentHe: 'חוסך', pastAr: 'وفّر', pastTranslit: 'וַּפַּר', pastHe: 'חסך' },
    { emoji: '💸', presentAr: 'عم ينفق', presentTranslit: 'עַם יִנְפֻּק', presentHe: 'מוציא', pastAr: 'نفق', pastTranslit: 'נַפַק', pastHe: 'הוציא' },
    { emoji: '🤝', presentAr: 'عم يستعير', presentTranslit: 'עַם יִסְתַּעִיר', presentHe: 'שואל', pastAr: 'استعار', pastTranslit: 'אִסְתַּעַאר', pastHe: 'שאל' },
    { emoji: '↩️', presentAr: 'عم يرجع', presentTranslit: 'עַם יִרְג׳ַע', presentHe: 'מחזיר', pastAr: 'رجّع', pastTranslit: 'רַג׳ַּע', pastHe: 'החזיר' },
  ]},
  { emoji: '🤝', title: 'פעלים: חברתי', pairs: [
    { emoji: '🤗', presentAr: 'عم يلتقي', presentTranslit: 'עַם יִלְתַּקִּי', presentHe: 'נפגש', pastAr: 'التقى', pastTranslit: 'אִלְתַּקַה', pastHe: 'נפגש' },
    { emoji: '💌', presentAr: 'عم يدعو', presentTranslit: 'עַם יִדְעוּ', presentHe: 'מזמין', pastAr: 'دعا', pastTranslit: 'דַּעַה', pastHe: 'הזמין' },
    { emoji: '🏠', presentAr: 'عم يزور', presentTranslit: 'עַם יְזוּר', presentHe: 'מבקר', pastAr: 'زار', pastTranslit: 'זַּאר', pastHe: 'ביקר' },
    { emoji: '👋', presentAr: 'عم يعرّف', presentTranslit: 'עַם יְעַרִּף', presentHe: 'מציג', pastAr: 'عرّف', pastTranslit: 'עַרַּף', pastHe: 'הציג' },
    { emoji: '🎉', presentAr: 'عم يحتفل', presentTranslit: 'עַם יִחְתַּפִּל', presentHe: 'חוגג', pastAr: 'احتفل', pastTranslit: 'אִחְתַּפַל', pastHe: 'חגג' },
    { emoji: '🙏', presentAr: 'عم يشكر', presentTranslit: 'עַם יִשְׁכֻר', presentHe: 'מודה', pastAr: 'شكر', pastTranslit: 'שַׁכַר', pastHe: 'הודה' },
    { emoji: '😔', presentAr: 'عم يعتذر', presentTranslit: 'עַם יַעְתַּזִּר', presentHe: 'מתנצל', pastAr: 'اعتذر', pastTranslit: 'אִעְתַּזַר', pastHe: 'התנצל' },
    { emoji: '🎊', presentAr: 'عم يبارك', presentTranslit: 'עַם יְבַּארִך', presentHe: 'מברך', pastAr: 'بارك', pastTranslit: 'בַּארַך', pastHe: 'בירך' },
  ]},
  { emoji: '📱', title: 'פעלים: דיגיטל', pairs: [
    { emoji: '🔍', presentAr: 'عم يبحث', presentTranslit: 'עַם יִבְחַת', presentHe: 'מחפש', pastAr: 'بحث', pastTranslit: 'בַּחַת', pastHe: 'חיפש' },
    { emoji: '⬇️', presentAr: 'عم ينزّل', presentTranslit: 'עַם יְנַּזִּל', presentHe: 'מוריד', pastAr: 'نزّل', pastTranslit: 'נַּזַּל', pastHe: 'הוריד' },
    { emoji: '💬', presentAr: 'عم يراسل', presentTranslit: 'עַם יְרַאסִל', presentHe: 'שולח הודעה', pastAr: 'راسل', pastTranslit: 'רַאסַל', pastHe: 'שלח הודעה' },
    { emoji: '📤', presentAr: 'عم ينشر', presentTranslit: 'עַם יִנְשֻׁר', presentHe: 'מפרסם', pastAr: 'نشر', pastTranslit: 'נַּשַׁר', pastHe: 'פרסם' },
    { emoji: '📅', presentAr: 'عم يحجز', presentTranslit: 'עַם יִחְג׳ִז', presentHe: 'מזמין', pastAr: 'حجز', pastTranslit: 'חַג׳ַז', pastHe: 'הזמין' },
    { emoji: '❌', presentAr: 'عم يلغي', presentTranslit: 'עַם יִלְר׳ִּי', presentHe: 'מבטל', pastAr: 'لغى', pastTranslit: 'לַר׳ה', pastHe: 'ביטל' },
    { emoji: '🔋', presentAr: 'عم يشحن', presentTranslit: 'עַם יִשְׁחַן', presentHe: 'טוען', pastAr: 'شحن', pastTranslit: 'שַׁחַן', pastHe: 'טעון' },
    { emoji: '🔗', presentAr: 'عم يتواصل', presentTranslit: 'עַם יִתְוַּאסַל', presentHe: 'מתחבר', pastAr: 'تواصل', pastTranslit: 'תַּוַּאסַל', pastHe: 'התחבר' },
  ]},
  { emoji: '✈️', title: 'פעלים: נסיעות', pairs: [
    { emoji: '✈️', presentAr: 'عم يسافر', presentTranslit: 'עַם יְסַאפִר', presentHe: 'נוסע', pastAr: 'سافر', pastTranslit: 'סַאפַר', pastHe: 'נסע' },
    { emoji: '🏁', presentAr: 'عم يوصل', presentTranslit: 'עַם יוּצַּל', presentHe: 'מגיע', pastAr: 'وصل', pastTranslit: 'וֻצַּל', pastHe: 'הגיע' },
    { emoji: '🚪', presentAr: 'عم يطلع', presentTranslit: 'עַם יִטְלַע', presentHe: 'יוצא', pastAr: 'طلع', pastTranslit: 'טִלַע', pastHe: 'יצא' },
    { emoji: '🧳', presentAr: 'عم يحزّم', presentTranslit: 'עַם יְחַּזִּם', presentHe: 'ארוז', pastAr: 'حزّم', pastTranslit: 'חַּזַּם', pastHe: 'ארז' },
    { emoji: '🗺️', presentAr: 'عم يستكشف', presentTranslit: 'עַם יִסְתַּכְשִׁף', presentHe: 'מחקר', pastAr: 'استكشف', pastTranslit: 'אִסְתַּכְשַׁף', pastHe: 'חקר' },
    { emoji: '🏨', presentAr: 'عم يسجّل', presentTranslit: 'עַם יְסַּג׳ִּל', presentHe: "מצ'ק-אין", pastAr: 'سجّل', pastTranslit: 'סַּג׳ַּל', pastHe: "צ'ק-אין" },
    { emoji: '🔄', presentAr: 'عم يرجع', presentTranslit: 'עַם יִרְג׳ַע', presentHe: 'חוזר', pastAr: 'رجع', pastTranslit: 'רַג׳ַע', pastHe: 'חזר' },
    { emoji: '📋', presentAr: 'عم يخطّط', presentTranslit: 'עַם יְחַּטִּט', presentHe: 'מתכנן', pastAr: 'خطّط', pastTranslit: 'חַּטַּט', pastHe: 'תכנן' },
  ]},
  { emoji: '💭', title: 'פעלים: דעות', pairs: [
    { emoji: '🤔', presentAr: 'عم يفكّر', presentTranslit: 'עַם יְפַּכִּר', presentHe: 'חושב', pastAr: 'فكّر', pastTranslit: 'פַּכַּר', pastHe: 'חשב' },
    { emoji: '🙏', presentAr: 'عم يؤمن', presentTranslit: 'עַם יְאַּמִּן', presentHe: 'מאמין', pastAr: 'آمن', pastTranslit: 'אָמַן', pastHe: 'האמין' },
    { emoji: '⭐', presentAr: 'عم يفضّل', presentTranslit: 'עַם יְפַּדִּל', presentHe: 'מעדיף', pastAr: 'فضّل', pastTranslit: 'פַּדַּל', pastHe: 'העדיף' },
    { emoji: '✅', presentAr: 'عم يوافق', presentTranslit: 'עַם יְוַּאפִק', presentHe: 'מסכים', pastAr: 'وافق', pastTranslit: 'וַּאפַק', pastHe: 'הסכים' },
    { emoji: '❌', presentAr: 'ما عم يوافق', presentTranslit: 'מַא עַם יְוַּאפִק', presentHe: 'לא מסכים', pastAr: 'ما وافق', pastTranslit: 'מַא וַּאפַק', pastHe: 'לא הסכים' },
    { emoji: '💡', presentAr: 'عم يقترح', presentTranslit: 'עַם יִקְתְּרִח', presentHe: 'מציע', pastAr: 'اقترح', pastTranslit: 'אִקְתְּרַח', pastHe: 'הציע' },
    { emoji: '👍', presentAr: 'عم ينصح', presentTranslit: 'עַם יִנְצַח', presentHe: 'ממליץ', pastAr: 'نصح', pastTranslit: 'נַצַח', pastHe: 'המליץ' },
    { emoji: '📖', presentAr: 'عم يشرح', presentTranslit: 'עַם יִשְׁרַח', presentHe: 'מסביר', pastAr: 'شرح', pastTranslit: 'שַׁרַח', pastHe: 'הסביר' },
  ]},
];

const SPANISH_VOCAB_TOPICS_2: SpanishTopic[] = [
  { emoji: '🛒', title: 'קניות', words: [
    { es: 'tienda', he: 'חנות' }, { es: 'precio', he: 'מחיר' }, { es: 'barato', he: 'זול' },
    { es: 'caro', he: 'יקר' }, { es: 'comprar', he: 'לקנות' }, { es: 'vender', he: 'למכור' },
    { es: 'efectivo', he: 'מזומן' }, { es: 'tarjeta', he: 'כרטיס' }, { es: 'recibo', he: 'קבלה' }, { es: 'talla', he: 'מידה' },
  ]},
  { emoji: '🗺️', title: 'כיוונים', words: [
    { es: 'izquierda', he: 'שמאל' }, { es: 'derecha', he: 'ימין' }, { es: 'recto', he: 'ישר' },
    { es: 'cerca', he: 'קרוב' }, { es: 'lejos', he: 'רחוק' }, { es: 'calle', he: 'רחוב' },
    { es: 'esquina', he: 'פינה' }, { es: 'mapa', he: 'מפה' }, { es: 'perdido', he: 'אבוד' }, { es: 'llegar', he: 'להגיע' },
  ]},
  { emoji: '🌤️', title: 'מזג אוויר', words: [
    { es: 'caliente', he: 'חם' }, { es: 'frío', he: 'קר' }, { es: 'lluvia', he: 'גשם' },
    { es: 'sol', he: 'שמש' }, { es: 'viento', he: 'רוח' }, { es: 'nube', he: 'ענן' },
    { es: 'nieve', he: 'שלג' }, { es: 'temperatura', he: 'טמפרטורה' }, { es: 'pronóstico', he: 'תחזית' }, { es: 'estación', he: 'עונה' },
  ]},
  { emoji: '🏥', title: 'בריאות', words: [
    { es: 'médico', he: 'רופא' }, { es: 'medicina', he: 'תרופה' }, { es: 'dolor', he: 'כאב' },
    { es: 'fiebre', he: 'חום' }, { es: 'enfermo', he: 'חולה' }, { es: 'farmacia', he: 'בית מרקחת' },
    { es: 'cita', he: 'תור' }, { es: 'descanso', he: 'מנוחה' }, { es: 'duele', he: 'כואב' }, { es: 'mejor', he: 'טוב יותר' },
  ]},
  { emoji: '🚌', title: 'תחבורה', words: [
    { es: 'autobús', he: 'אוטובוס' }, { es: 'tren', he: 'רכבת' }, { es: 'taxi', he: 'מונית' },
    { es: 'billete', he: 'כרטיס' }, { es: 'estación', he: 'תחנה' }, { es: 'aeropuerto', he: 'שדה תעופה' },
    { es: 'tarde', he: 'מאחר' }, { es: 'andén', he: 'פלטפורמה' }, { es: 'asiento', he: 'מושב' }, { es: 'conductor', he: 'נהג' },
  ]},
  { emoji: '🍽️', title: 'אכילה בחוץ', words: [
    { es: 'menú', he: 'תפריט' }, { es: 'pedir', he: 'להזמין' }, { es: 'camarero', he: 'מלצר' },
    { es: 'cuenta', he: 'חשבון' }, { es: 'reserva', he: 'הזמנה' }, { es: 'mesa', he: 'שולחן' },
    { es: 'entrante', he: 'מנה ראשונה' }, { es: 'postre', he: 'קינוח' }, { es: 'propina', he: 'טיפ' }, { es: 'delicioso', he: 'טעים' },
  ]},
  { emoji: '📅', title: 'שגרה יומית', words: [
    { es: 'despertar', he: 'להתעורר' }, { es: 'ducha', he: 'מקלחת' }, { es: 'desayuno', he: 'ארוחת בוקר' },
    { es: 'ir al trabajo', he: 'לצאת לעבודה' }, { es: 'almuerzo', he: 'ארוחת צהריים' }, { es: 'trabajar', he: 'לעבוד' },
    { es: 'cena', he: 'ארוחת ערב' }, { es: 'relajarse', he: 'להירגע' }, { es: 'dormir', he: 'לישון' }, { es: 'planificar', he: 'לתכנן' },
  ]},
  { emoji: '💬', title: 'דעות', words: [
    { es: 'pensar', he: 'לחשוב' }, { es: 'creer', he: 'להאמין' }, { es: 'estar de acuerdo', he: 'להסכים' },
    { es: 'discrepar', he: 'לא להסכים' }, { es: 'quizás', he: 'אולי' }, { es: 'importante', he: 'חשוב' },
    { es: 'interesante', he: 'מעניין' }, { es: 'aburrido', he: 'משעמם' }, { es: 'preferir', he: 'להעדיף' }, { es: 'opinión', he: 'דעה' },
  ]},
  { emoji: '🏠', title: 'בית ומחייה', words: [
    { es: 'alquiler', he: 'שכירות' }, { es: 'vecino', he: 'שכן' }, { es: 'piso', he: 'קומה' },
    { es: 'llave', he: 'מפתח' }, { es: 'muebles', he: 'רהיטים' }, { es: 'limpiar', he: 'לנקות' },
    { es: 'roto', he: 'שבור' }, { es: 'arreglar', he: 'לתקן' }, { es: 'cómodo', he: 'נוח' }, { es: 'mudarse', he: 'לעבור דירה' },
  ]},
  { emoji: '💼', title: 'עבודה ולימודים', words: [
    { es: 'trabajo', he: 'עבודה' }, { es: 'oficina', he: 'משרד' }, { es: 'reunión', he: 'ישיבה' },
    { es: 'plazo', he: 'דד-ליין' }, { es: 'colega', he: 'עמית' }, { es: 'examen', he: 'מבחן' },
    { es: 'nota', he: 'ציון' }, { es: 'deberes', he: 'שיעורי בית' }, { es: 'proyecto', he: 'פרויקט' }, { es: 'aprender', he: 'ללמוד' },
  ]},
];

const SPANISH_VERB_TOPICS_2: SpanishVerbConjTopic[] = [
  { emoji: '🛍️', title: 'פעלים: קניות', pairs: [
    { emoji: '🛒', presentEs: 'compro', presentHe: 'אני קונה', pastEs: 'compré', pastHe: 'קניתי' },
    { emoji: '💰', presentEs: 'vendo', presentHe: 'אני מוכר', pastEs: 'vendí', pastHe: 'מכרתי' },
    { emoji: '💳', presentEs: 'pago', presentHe: 'אני משלם', pastEs: 'pagué', pastHe: 'שילמתי' },
    { emoji: '💵', presentEs: 'cuesta', presentHe: 'זה עולה', pastEs: 'costó', pastHe: 'עלה' },
    { emoji: '🏦', presentEs: 'ahorro', presentHe: 'אני חוסך', pastEs: 'ahorré', pastHe: 'חסכתי' },
    { emoji: '💸', presentEs: 'gasto', presentHe: 'אני מוציא', pastEs: 'gasté', pastHe: 'הוצאתי' },
    { emoji: '🤝', presentEs: 'presto', presentHe: 'אני מלווה', pastEs: 'presté', pastHe: 'הלוויתי' },
    { emoji: '↩️', presentEs: 'devuelvo', presentHe: 'אני מחזיר', pastEs: 'devolví', pastHe: 'החזרתי' },
  ]},
  { emoji: '🤝', title: 'פעלים: חברתי', pairs: [
    { emoji: '🤗', presentEs: 'me encuentro', presentHe: 'אני נפגש', pastEs: 'me encontré', pastHe: 'נפגשתי' },
    { emoji: '💌', presentEs: 'invito', presentHe: 'אני מזמין', pastEs: 'invité', pastHe: 'הזמנתי' },
    { emoji: '🏠', presentEs: 'visito', presentHe: 'אני מבקר', pastEs: 'visité', pastHe: 'ביקרתי' },
    { emoji: '👋', presentEs: 'presento', presentHe: 'אני מציג', pastEs: 'presenté', pastHe: 'הצגתי' },
    { emoji: '🎉', presentEs: 'celebro', presentHe: 'אני חוגג', pastEs: 'celebré', pastHe: 'חגגתי' },
    { emoji: '🙏', presentEs: 'agradezco', presentHe: 'אני מודה', pastEs: 'agradecí', pastHe: 'הודיתי' },
    { emoji: '😔', presentEs: 'me disculpo', presentHe: 'אני מתנצל', pastEs: 'me disculpé', pastHe: 'התנצלתי' },
    { emoji: '🎊', presentEs: 'felicito', presentHe: 'אני מברך', pastEs: 'felicité', pastHe: 'ברכתי' },
  ]},
  { emoji: '📱', title: 'פעלים: דיגיטל', pairs: [
    { emoji: '🔍', presentEs: 'busco', presentHe: 'אני מחפש', pastEs: 'busqué', pastHe: 'חיפשתי' },
    { emoji: '⬇️', presentEs: 'descargo', presentHe: 'אני מוריד', pastEs: 'descargué', pastHe: 'הורדתי' },
    { emoji: '💬', presentEs: 'mando un mensaje', presentHe: 'אני שולח הודעה', pastEs: 'mandé un mensaje', pastHe: 'שלחתי הודעה' },
    { emoji: '📤', presentEs: 'publico', presentHe: 'אני מפרסם', pastEs: 'publiqué', pastHe: 'פרסמתי' },
    { emoji: '📅', presentEs: 'reservo', presentHe: 'אני מזמין', pastEs: 'reservé', pastHe: 'הזמנתי' },
    { emoji: '❌', presentEs: 'cancelo', presentHe: 'אני מבטל', pastEs: 'cancelé', pastHe: 'ביטלתי' },
    { emoji: '🔋', presentEs: 'cargo', presentHe: 'אני טוען', pastEs: 'cargué', pastHe: 'טענתי' },
    { emoji: '🔗', presentEs: 'me conecto', presentHe: 'אני מתחבר', pastEs: 'me conecté', pastHe: 'התחברתי' },
  ]},
  { emoji: '✈️', title: 'פעלים: נסיעות', pairs: [
    { emoji: '✈️', presentEs: 'viajo', presentHe: 'אני נוסע', pastEs: 'viajé', pastHe: 'נסעתי' },
    { emoji: '🏁', presentEs: 'llego', presentHe: 'אני מגיע', pastEs: 'llegué', pastHe: 'הגעתי' },
    { emoji: '🚪', presentEs: 'salgo', presentHe: 'אני יוצא', pastEs: 'salí', pastHe: 'יצאתי' },
    { emoji: '🧳', presentEs: 'hago la maleta', presentHe: 'אני אורז', pastEs: 'hice la maleta', pastHe: 'ארזתי' },
    { emoji: '🗺️', presentEs: 'exploro', presentHe: 'אני חוקר', pastEs: 'exploré', pastHe: 'חקרתי' },
    { emoji: '🏨', presentEs: 'hago check-in', presentHe: "אני מצ'ק-אין", pastEs: 'hice check-in', pastHe: "צ'ק-אין" },
    { emoji: '🔄', presentEs: 'vuelvo', presentHe: 'אני חוזר', pastEs: 'volví', pastHe: 'חזרתי' },
    { emoji: '📋', presentEs: 'planifico', presentHe: 'אני מתכנן', pastEs: 'planifiqué', pastHe: 'תכננתי' },
  ]},
  { emoji: '💭', title: 'פעלים: דעות', pairs: [
    { emoji: '🤔', presentEs: 'pienso', presentHe: 'אני חושב', pastEs: 'pensé', pastHe: 'חשבתי' },
    { emoji: '🙏', presentEs: 'creo', presentHe: 'אני מאמין', pastEs: 'creí', pastHe: 'האמנתי' },
    { emoji: '⭐', presentEs: 'prefiero', presentHe: 'אני מעדיף', pastEs: 'preferí', pastHe: 'העדפתי' },
    { emoji: '✅', presentEs: 'estoy de acuerdo', presentHe: 'אני מסכים', pastEs: 'estuve de acuerdo', pastHe: 'הסכמתי' },
    { emoji: '❌', presentEs: 'no estoy de acuerdo', presentHe: 'אני לא מסכים', pastEs: 'no estuve de acuerdo', pastHe: 'לא הסכמתי' },
    { emoji: '💡', presentEs: 'sugiero', presentHe: 'אני מציע', pastEs: 'sugerí', pastHe: 'הצעתי' },
    { emoji: '👍', presentEs: 'recomiendo', presentHe: 'אני ממליץ', pastEs: 'recomendé', pastHe: 'המלצתי' },
    { emoji: '📖', presentEs: 'explico', presentHe: 'אני מסביר', pastEs: 'expliqué', pastHe: 'הסברתי' },
  ]},
];

const ITALIAN_VOCAB_TOPICS_2: ItalianTopic[] = [
  { emoji: '🛒', title: 'Shopping', words: [
    { it: 'negozio', en: 'shop' }, { it: 'prezzo', en: 'price' }, { it: 'economico', en: 'cheap' },
    { it: 'caro', en: 'expensive' }, { it: 'comprare', en: 'to buy' }, { it: 'vendere', en: 'to sell' },
    { it: 'contanti', en: 'cash' }, { it: 'carta', en: 'card' }, { it: 'scontrino', en: 'receipt' }, { it: 'taglia', en: 'size' },
  ]},
  { emoji: '🗺️', title: 'Directions', words: [
    { it: 'sinistra', en: 'left' }, { it: 'destra', en: 'right' }, { it: 'dritto', en: 'straight' },
    { it: 'vicino', en: 'near' }, { it: 'lontano', en: 'far' }, { it: 'strada', en: 'street' },
    { it: 'angolo', en: 'corner' }, { it: 'mappa', en: 'map' }, { it: 'perso', en: 'lost' }, { it: 'arrivare', en: 'to arrive' },
  ]},
  { emoji: '🌤️', title: 'Weather', words: [
    { it: 'caldo', en: 'hot' }, { it: 'freddo', en: 'cold' }, { it: 'pioggia', en: 'rain' },
    { it: 'sole', en: 'sun' }, { it: 'vento', en: 'wind' }, { it: 'nuvola', en: 'cloud' },
    { it: 'neve', en: 'snow' }, { it: 'temperatura', en: 'temperature' }, { it: 'previsioni', en: 'forecast' }, { it: 'stagione', en: 'season' },
  ]},
  { emoji: '🏥', title: 'Health', words: [
    { it: 'medico', en: 'doctor' }, { it: 'medicina', en: 'medicine' }, { it: 'dolore', en: 'pain' },
    { it: 'febbre', en: 'fever' }, { it: 'malato', en: 'sick' }, { it: 'farmacia', en: 'pharmacy' },
    { it: 'appuntamento', en: 'appointment' }, { it: 'riposo', en: 'rest' }, { it: 'fa male', en: 'it hurts' }, { it: 'meglio', en: 'better' },
  ]},
  { emoji: '🚌', title: 'Transport', words: [
    { it: 'autobus', en: 'bus' }, { it: 'treno', en: 'train' }, { it: 'taxi', en: 'taxi' },
    { it: 'biglietto', en: 'ticket' }, { it: 'stazione', en: 'station' }, { it: 'aeroporto', en: 'airport' },
    { it: 'in ritardo', en: 'late' }, { it: 'binario', en: 'platform' }, { it: 'posto', en: 'seat' }, { it: 'autista', en: 'driver' },
  ]},
  { emoji: '🍽️', title: 'Eating out', words: [
    { it: 'menù', en: 'menu' }, { it: 'ordinare', en: 'to order' }, { it: 'cameriere', en: 'waiter' },
    { it: 'conto', en: 'bill' }, { it: 'prenotazione', en: 'reservation' }, { it: 'tavolo', en: 'table' },
    { it: 'antipasto', en: 'starter' }, { it: 'dolce', en: 'dessert' }, { it: 'mancia', en: 'tip' }, { it: 'delizioso', en: 'delicious' },
  ]},
  { emoji: '📅', title: 'Daily routine', words: [
    { it: 'svegliarsi', en: 'to wake up' }, { it: 'doccia', en: 'shower' }, { it: 'colazione', en: 'breakfast' },
    { it: 'andare al lavoro', en: 'go to work' }, { it: 'pranzo', en: 'lunch' }, { it: 'lavorare', en: 'to work' },
    { it: 'cena', en: 'dinner' }, { it: 'rilassarsi', en: 'to relax' }, { it: 'dormire', en: 'to sleep' }, { it: 'pianificare', en: 'to plan' },
  ]},
  { emoji: '💬', title: 'Opinions', words: [
    { it: 'pensare', en: 'to think' }, { it: 'credere', en: 'to believe' }, { it: 'essere d\'accordo', en: 'to agree' },
    { it: 'non concordare', en: 'to disagree' }, { it: 'forse', en: 'maybe' }, { it: 'importante', en: 'important' },
    { it: 'interessante', en: 'interesting' }, { it: 'noioso', en: 'boring' }, { it: 'preferire', en: 'to prefer' }, { it: 'opinione', en: 'opinion' },
  ]},
  { emoji: '🏠', title: 'Home & living', words: [
    { it: 'affitto', en: 'rent' }, { it: 'vicino', en: 'neighbour' }, { it: 'piano', en: 'floor' },
    { it: 'chiave', en: 'key' }, { it: 'mobili', en: 'furniture' }, { it: 'pulire', en: 'to clean' },
    { it: 'rotto', en: 'broken' }, { it: 'riparare', en: 'to fix' }, { it: 'comodo', en: 'comfortable' }, { it: 'traslocare', en: 'to move' },
  ]},
  { emoji: '💼', title: 'Work & study', words: [
    { it: 'lavoro', en: 'job' }, { it: 'ufficio', en: 'office' }, { it: 'riunione', en: 'meeting' },
    { it: 'scadenza', en: 'deadline' }, { it: 'collega', en: 'colleague' }, { it: 'esame', en: 'exam' },
    { it: 'voto', en: 'grade' }, { it: 'compiti', en: 'homework' }, { it: 'progetto', en: 'project' }, { it: 'imparare', en: 'to learn' },
  ]},
];

const ITALIAN_VERB_TOPICS_2: ItalianVerbConjTopic[] = [
  { emoji: '🛍️', title: 'Verbs: Shopping', pairs: [
    { emoji: '🛒', presentIt: 'compro', presentEn: 'I buy', pastIt: 'ho comprato', pastEn: 'I bought' },
    { emoji: '💰', presentIt: 'vendo', presentEn: 'I sell', pastIt: 'ho venduto', pastEn: 'I sold' },
    { emoji: '💳', presentIt: 'pago', presentEn: 'I pay', pastIt: 'ho pagato', pastEn: 'I paid' },
    { emoji: '💵', presentIt: 'costa', presentEn: 'it costs', pastIt: 'è costato', pastEn: 'it cost' },
    { emoji: '🏦', presentIt: 'risparmio', presentEn: 'I save', pastIt: 'ho risparmiato', pastEn: 'I saved' },
    { emoji: '💸', presentIt: 'spendo', presentEn: 'I spend', pastIt: 'ho speso', pastEn: 'I spent' },
    { emoji: '🤝', presentIt: 'prendo in prestito', presentEn: 'I borrow', pastIt: 'ho preso in prestito', pastEn: 'I borrowed' },
    { emoji: '↩️', presentIt: 'restituisco', presentEn: 'I return', pastIt: 'ho restituito', pastEn: 'I returned' },
  ]},
  { emoji: '🤝', title: 'Verbs: Social', pairs: [
    { emoji: '🤗', presentIt: 'incontro', presentEn: 'I meet', pastIt: 'ho incontrato', pastEn: 'I met' },
    { emoji: '💌', presentIt: 'invito', presentEn: 'I invite', pastIt: 'ho invitato', pastEn: 'I invited' },
    { emoji: '🏠', presentIt: 'visito', presentEn: 'I visit', pastIt: 'ho visitato', pastEn: 'I visited' },
    { emoji: '👋', presentIt: 'presento', presentEn: 'I introduce', pastIt: 'ho presentato', pastEn: 'I introduced' },
    { emoji: '🎉', presentIt: 'festeggio', presentEn: 'I celebrate', pastIt: 'ho festeggiato', pastEn: 'I celebrated' },
    { emoji: '🙏', presentIt: 'ringrazio', presentEn: 'I thank', pastIt: 'ho ringraziato', pastEn: 'I thanked' },
    { emoji: '😔', presentIt: 'mi scuso', presentEn: 'I apologize', pastIt: 'mi sono scusato', pastEn: 'I apologized' },
    { emoji: '🎊', presentIt: 'faccio i complimenti', presentEn: 'I congratulate', pastIt: 'ho fatto i complimenti', pastEn: 'I congratulated' },
  ]},
  { emoji: '📱', title: 'Verbs: Digital', pairs: [
    { emoji: '🔍', presentIt: 'cerco', presentEn: 'I search', pastIt: 'ho cercato', pastEn: 'I searched' },
    { emoji: '⬇️', presentIt: 'scarico', presentEn: 'I download', pastIt: 'ho scaricato', pastEn: 'I downloaded' },
    { emoji: '💬', presentIt: 'mando un messaggio', presentEn: 'I message', pastIt: 'ho mandato un messaggio', pastEn: 'I messaged' },
    { emoji: '📤', presentIt: 'pubblico', presentEn: 'I post', pastIt: 'ho pubblicato', pastEn: 'I posted' },
    { emoji: '📅', presentIt: 'prenoto', presentEn: 'I book', pastIt: 'ho prenotato', pastEn: 'I booked' },
    { emoji: '❌', presentIt: 'cancello', presentEn: 'I cancel', pastIt: 'ho cancellato', pastEn: 'I cancelled' },
    { emoji: '🔋', presentIt: 'carico', presentEn: 'I charge', pastIt: 'ho caricato', pastEn: 'I charged' },
    { emoji: '🔗', presentIt: 'mi connetto', presentEn: 'I connect', pastIt: 'mi sono connesso', pastEn: 'I connected' },
  ]},
  { emoji: '✈️', title: 'Verbs: Travel', pairs: [
    { emoji: '✈️', presentIt: 'viaggio', presentEn: 'I travel', pastIt: 'ho viaggiato', pastEn: 'I travelled' },
    { emoji: '🏁', presentIt: 'arrivo', presentEn: 'I arrive', pastIt: 'sono arrivato', pastEn: 'I arrived' },
    { emoji: '🚪', presentIt: 'parto', presentEn: 'I depart', pastIt: 'sono partito', pastEn: 'I departed' },
    { emoji: '🧳', presentIt: 'faccio la valigia', presentEn: 'I pack', pastIt: 'ho fatto la valigia', pastEn: 'I packed' },
    { emoji: '🗺️', presentIt: 'esploro', presentEn: 'I explore', pastIt: 'ho esplorato', pastEn: 'I explored' },
    { emoji: '🏨', presentIt: 'faccio il check-in', presentEn: 'I check in', pastIt: 'ho fatto il check-in', pastEn: 'I checked in' },
    { emoji: '🔄', presentIt: 'torno', presentEn: 'I return', pastIt: 'sono tornato', pastEn: 'I returned' },
    { emoji: '📋', presentIt: 'planifico', presentEn: 'I plan', pastIt: 'ho pianificato', pastEn: 'I planned' },
  ]},
  { emoji: '💭', title: 'Verbs: Opinions', pairs: [
    { emoji: '🤔', presentIt: 'penso', presentEn: 'I think', pastIt: 'ho pensato', pastEn: 'I thought' },
    { emoji: '🙏', presentIt: 'credo', presentEn: 'I believe', pastIt: 'ho creduto', pastEn: 'I believed' },
    { emoji: '⭐', presentIt: 'preferisco', presentEn: 'I prefer', pastIt: 'ho preferito', pastEn: 'I preferred' },
    { emoji: '✅', presentIt: 'sono d\'accordo', presentEn: 'I agree', pastIt: 'ero d\'accordo', pastEn: 'I agreed' },
    { emoji: '❌', presentIt: 'non sono d\'accordo', presentEn: 'I disagree', pastIt: 'non ero d\'accordo', pastEn: 'I disagreed' },
    { emoji: '💡', presentIt: 'suggerisco', presentEn: 'I suggest', pastIt: 'ho suggerito', pastEn: 'I suggested' },
    { emoji: '👍', presentIt: 'raccomando', presentEn: 'I recommend', pastIt: 'ho raccomandato', pastEn: 'I recommended' },
    { emoji: '📖', presentIt: 'spiego', presentEn: 'I explain', pastIt: 'ho spiegato', pastEn: 'I explained' },
  ]},
];

const TURKISH_VOCAB_TOPICS_2: TurkishTopic[] = [
  { emoji: '🛒', title: 'קניות', words: [
    { tr: 'dükkan', he: 'חנות' }, { tr: 'fiyat', he: 'מחיר' }, { tr: 'ucuz', he: 'זול' },
    { tr: 'pahalı', he: 'יקר' }, { tr: 'satın almak', he: 'לקנות' }, { tr: 'satmak', he: 'למכור' },
    { tr: 'nakit', he: 'מזומן' }, { tr: 'kart', he: 'כרטיס' }, { tr: 'fiş', he: 'קבלה' }, { tr: 'beden', he: 'מידה' },
  ]},
  { emoji: '🗺️', title: 'כיוונים', words: [
    { tr: 'sol', he: 'שמאל' }, { tr: 'sağ', he: 'ימין' }, { tr: 'düz', he: 'ישר' },
    { tr: 'yakın', he: 'קרוב' }, { tr: 'uzak', he: 'רחוק' }, { tr: 'sokak', he: 'רחוב' },
    { tr: 'köşe', he: 'פינה' }, { tr: 'harita', he: 'מפה' }, { tr: 'kayboldum', he: 'אבדתי' }, { tr: 'varmak', he: 'להגיע' },
  ]},
  { emoji: '🌤️', title: 'מזג אוויר', words: [
    { tr: 'sıcak', he: 'חם' }, { tr: 'soğuk', he: 'קר' }, { tr: 'yağmur', he: 'גשם' },
    { tr: 'güneş', he: 'שמש' }, { tr: 'rüzgar', he: 'רוח' }, { tr: 'bulut', he: 'ענן' },
    { tr: 'kar', he: 'שלג' }, { tr: 'sıcaklık', he: 'טמפרטורה' }, { tr: 'hava tahmini', he: 'תחזית' }, { tr: 'mevsim', he: 'עונה' },
  ]},
  { emoji: '🏥', title: 'בריאות', words: [
    { tr: 'doktor', he: 'רופא' }, { tr: 'ilaç', he: 'תרופה' }, { tr: 'ağrı', he: 'כאב' },
    { tr: 'ateş', he: 'חום' }, { tr: 'hasta', he: 'חולה' }, { tr: 'eczane', he: 'בית מרקחת' },
    { tr: 'randevu', he: 'תור' }, { tr: 'dinlenme', he: 'מנוחה' }, { tr: 'acıyor', he: 'כואב' }, { tr: 'daha iyi', he: 'טוב יותר' },
  ]},
  { emoji: '🚌', title: 'תחבורה', words: [
    { tr: 'otobüs', he: 'אוטובוס' }, { tr: 'tren', he: 'רכבת' }, { tr: 'taksi', he: 'מונית' },
    { tr: 'bilet', he: 'כרטיס' }, { tr: 'istasyon', he: 'תחנה' }, { tr: 'havalimanı', he: 'שדה תעופה' },
    { tr: 'geç', he: 'מאחר' }, { tr: 'peron', he: 'פלטפורמה' }, { tr: 'koltuk', he: 'מושב' }, { tr: 'şoför', he: 'נהג' },
  ]},
  { emoji: '🍽️', title: 'אכילה בחוץ', words: [
    { tr: 'menü', he: 'תפריט' }, { tr: 'sipariş vermek', he: 'להזמין' }, { tr: 'garson', he: 'מלצר' },
    { tr: 'hesap', he: 'חשבון' }, { tr: 'rezervasyon', he: 'הזמנה' }, { tr: 'masa', he: 'שולחן' },
    { tr: 'başlangıç', he: 'מנה ראשונה' }, { tr: 'tatlı', he: 'קינוח' }, { tr: 'bahşiş', he: 'טיפ' }, { tr: 'lezzetli', he: 'טעים' },
  ]},
  { emoji: '📅', title: 'שגרה יומית', words: [
    { tr: 'uyanmak', he: 'להתעורר' }, { tr: 'duş', he: 'מקלחת' }, { tr: 'kahvaltı', he: 'ארוחת בוקר' },
    { tr: 'işe gitmek', he: 'לצאת לעבודה' }, { tr: 'öğle yemeği', he: 'ארוחת צהריים' }, { tr: 'çalışmak', he: 'לעבוד' },
    { tr: 'akşam yemeği', he: 'ארוחת ערב' }, { tr: 'dinlenmek', he: 'להירגע' }, { tr: 'uyumak', he: 'לישון' }, { tr: 'planlamak', he: 'לתכנן' },
  ]},
  { emoji: '💬', title: 'דעות', words: [
    { tr: 'düşünmek', he: 'לחשוב' }, { tr: 'inanmak', he: 'להאמין' }, { tr: 'katılmak', he: 'להסכים' },
    { tr: 'katılmamak', he: 'לא להסכים' }, { tr: 'belki', he: 'אולי' }, { tr: 'önemli', he: 'חשוב' },
    { tr: 'ilginç', he: 'מעניין' }, { tr: 'sıkıcı', he: 'משעמם' }, { tr: 'tercih etmek', he: 'להעדיף' }, { tr: 'görüş', he: 'דעה' },
  ]},
  { emoji: '🏠', title: 'בית ומחייה', words: [
    { tr: 'kira', he: 'שכירות' }, { tr: 'komşu', he: 'שכן' }, { tr: 'kat', he: 'קומה' },
    { tr: 'anahtar', he: 'מפתח' }, { tr: 'mobilya', he: 'רהיטים' }, { tr: 'temizlemek', he: 'לנקות' },
    { tr: 'kırık', he: 'שבור' }, { tr: 'tamir etmek', he: 'לתקן' }, { tr: 'rahat', he: 'נוח' }, { tr: 'taşınmak', he: 'לעבור דירה' },
  ]},
  { emoji: '💼', title: 'עבודה ולימודים', words: [
    { tr: 'iş', he: 'עבודה' }, { tr: 'ofis', he: 'משרד' }, { tr: 'toplantı', he: 'ישיבה' },
    { tr: 'son tarih', he: 'דד-ליין' }, { tr: 'meslektaş', he: 'עמית' }, { tr: 'sınav', he: 'מבחן' },
    { tr: 'not', he: 'ציון' }, { tr: 'ödev', he: 'שיעורי בית' }, { tr: 'proje', he: 'פרויקט' }, { tr: 'öğrenmek', he: 'ללמוד' },
  ]},
];

const TURKISH_VERB_TOPICS_2: TurkishVerbConjTopic[] = [
  { emoji: '🛍️', title: 'פעלים: קניות', pairs: [
    { emoji: '🛒', presentTr: 'ben satın alıyorum', presentHe: 'אני קונה', pastTr: 'ben satın aldım', pastHe: 'קניתי' },
    { emoji: '💰', presentTr: 'ben satıyorum', presentHe: 'אני מוכר', pastTr: 'ben sattım', pastHe: 'מכרתי' },
    { emoji: '💳', presentTr: 'ben ödüyorum', presentHe: 'אני משלם', pastTr: 'ben ödedim', pastHe: 'שילמתי' },
    { emoji: '💵', presentTr: 'bu kaça', presentHe: 'זה עולה כמה', pastTr: 'bu ... tuttu', pastHe: 'עלה ...' },
    { emoji: '🏦', presentTr: 'ben biriktiriyorum', presentHe: 'אני חוסך', pastTr: 'ben biriktirdim', pastHe: 'חסכתי' },
    { emoji: '💸', presentTr: 'ben harcıyorum', presentHe: 'אני מוציא', pastTr: 'ben harcadım', pastHe: 'הוצאתי' },
    { emoji: '🤝', presentTr: 'ben ödünç alıyorum', presentHe: 'אני שואל', pastTr: 'ben ödünç aldım', pastHe: 'שאלתי' },
    { emoji: '↩️', presentTr: 'ben iade ediyorum', presentHe: 'אני מחזיר', pastTr: 'ben iade ettim', pastHe: 'החזרתי' },
  ]},
  { emoji: '🤝', title: 'פעלים: חברתי', pairs: [
    { emoji: '🤗', presentTr: 'ben buluşuyorum', presentHe: 'אני נפגש', pastTr: 'ben buluştum', pastHe: 'נפגשתי' },
    { emoji: '💌', presentTr: 'ben davet ediyorum', presentHe: 'אני מזמין', pastTr: 'ben davet ettim', pastHe: 'הזמנתי' },
    { emoji: '🏠', presentTr: 'ben ziyaret ediyorum', presentHe: 'אני מבקר', pastTr: 'ben ziyaret ettim', pastHe: 'ביקרתי' },
    { emoji: '👋', presentTr: 'ben tanıştırıyorum', presentHe: 'אני מציג', pastTr: 'ben tanıştırdım', pastHe: 'הצגתי' },
    { emoji: '🎉', presentTr: 'ben kutluyorum', presentHe: 'אני חוגג', pastTr: 'ben kutladım', pastHe: 'חגגתי' },
    { emoji: '🙏', presentTr: 'ben teşekkür ediyorum', presentHe: 'אני מודה', pastTr: 'ben teşekkür ettim', pastHe: 'הודיתי' },
    { emoji: '😔', presentTr: 'ben özür diliyorum', presentHe: 'אני מתנצל', pastTr: 'ben özür diledim', pastHe: 'התנצלתי' },
    { emoji: '🎊', presentTr: 'ben tebrik ediyorum', presentHe: 'אני מברך', pastTr: 'ben tebrik ettim', pastHe: 'ברכתי' },
  ]},
  { emoji: '📱', title: 'פעלים: דיגיטל', pairs: [
    { emoji: '🔍', presentTr: 'ben arıyorum', presentHe: 'אני מחפש', pastTr: 'ben aradım', pastHe: 'חיפשתי' },
    { emoji: '⬇️', presentTr: 'ben indiriyorum', presentHe: 'אני מוריד', pastTr: 'ben indirdim', pastHe: 'הורדתי' },
    { emoji: '💬', presentTr: 'ben mesaj gönderiyorum', presentHe: 'אני שולח הודעה', pastTr: 'ben mesaj gönderdim', pastHe: 'שלחתי הודעה' },
    { emoji: '📤', presentTr: 'ben paylaşıyorum', presentHe: 'אני מפרסם', pastTr: 'ben paylaştım', pastHe: 'פרסמתי' },
    { emoji: '📅', presentTr: 'ben rezervasyon yapıyorum', presentHe: 'אני מזמין', pastTr: 'ben rezervasyon yaptım', pastHe: 'הזמנתי' },
    { emoji: '❌', presentTr: 'ben iptal ediyorum', presentHe: 'אני מבטל', pastTr: 'ben iptal ettim', pastHe: 'ביטלתי' },
    { emoji: '🔋', presentTr: 'ben şarj ediyorum', presentHe: 'אני טוען', pastTr: 'ben şarj ettim', pastHe: 'טענתי' },
    { emoji: '🔗', presentTr: 'ben bağlanıyorum', presentHe: 'אני מתחבר', pastTr: 'ben bağlandım', pastHe: 'התחברתי' },
  ]},
  { emoji: '✈️', title: 'פעלים: נסיעות', pairs: [
    { emoji: '✈️', presentTr: 'ben seyahat ediyorum', presentHe: 'אני נוסע', pastTr: 'ben seyahat ettim', pastHe: 'נסעתי' },
    { emoji: '🏁', presentTr: 'ben varıyorum', presentHe: 'אני מגיע', pastTr: 'ben vardım', pastHe: 'הגעתי' },
    { emoji: '🚪', presentTr: 'ben ayrılıyorum', presentHe: 'אני יוצא', pastTr: 'ben ayrıldım', pastHe: 'יצאתי' },
    { emoji: '🧳', presentTr: 'ben bavul topluyorum', presentHe: 'אני ארוז', pastTr: 'ben bavul topladım', pastHe: 'ארזתי' },
    { emoji: '🗺️', presentTr: 'ben keşfediyorum', presentHe: 'אני חוקר', pastTr: 'ben keşfettim', pastHe: 'חקרתי' },
    { emoji: '🏨', presentTr: 'ben check-in yapıyorum', presentHe: "אני מצ'ק-אין", pastTr: 'ben check-in yaptım', pastHe: "צ'ק-אין" },
    { emoji: '🔄', presentTr: 'ben dönüyorum', presentHe: 'אני חוזר', pastTr: 'ben döndüm', pastHe: 'חזרתי' },
    { emoji: '📋', presentTr: 'ben planlıyorum', presentHe: 'אני מתכנן', pastTr: 'ben planladım', pastHe: 'תכננתי' },
  ]},
  { emoji: '💭', title: 'פעלים: דעות', pairs: [
    { emoji: '🤔', presentTr: 'ben düşünüyorum', presentHe: 'אני חושב', pastTr: 'ben düşündüm', pastHe: 'חשבתי' },
    { emoji: '🙏', presentTr: 'ben inanıyorum', presentHe: 'אני מאמין', pastTr: 'ben inandım', pastHe: 'האמנתי' },
    { emoji: '⭐', presentTr: 'ben tercih ediyorum', presentHe: 'אני מעדיף', pastTr: 'ben tercih ettim', pastHe: 'העדפתי' },
    { emoji: '✅', presentTr: 'ben katılıyorum', presentHe: 'אני מסכים', pastTr: 'ben katıldım', pastHe: 'הסכמתי' },
    { emoji: '❌', presentTr: 'ben katılmıyorum', presentHe: 'אני לא מסכים', pastTr: 'ben katılmadım', pastHe: 'לא הסכמתי' },
    { emoji: '💡', presentTr: 'ben öneriyorum', presentHe: 'אני מציע', pastTr: 'ben önerdim', pastHe: 'הצעתי' },
    { emoji: '👍', presentTr: 'ben tavsiye ediyorum', presentHe: 'אני ממליץ', pastTr: 'ben tavsiye ettim', pastHe: 'המלצתי' },
    { emoji: '📖', presentTr: 'ben açıklıyorum', presentHe: 'אני מסביר', pastTr: 'ben açıkladım', pastHe: 'הסברתי' },
  ]},
];

const FRENCH_VOCAB_TOPICS_2: FrenchTopic[] = [
  { emoji: '🛒', title: 'קניות', words: [
    { fr: 'magasin', he: 'חנות' }, { fr: 'prix', he: 'מחיר' }, { fr: 'bon marché', he: 'זול' },
    { fr: 'cher', he: 'יקר' }, { fr: 'acheter', he: 'לקנות' }, { fr: 'vendre', he: 'למכור' },
    { fr: 'espèces', he: 'מזומן' }, { fr: 'carte', he: 'כרטיס' }, { fr: 'reçu', he: 'קבלה' }, { fr: 'taille', he: 'מידה' },
  ]},
  { emoji: '🗺️', title: 'כיוונים', words: [
    { fr: 'gauche', he: 'שמאל' }, { fr: 'droite', he: 'ימין' }, { fr: 'tout droit', he: 'ישר' },
    { fr: 'près', he: 'קרוב' }, { fr: 'loin', he: 'רחוק' }, { fr: 'rue', he: 'רחוב' },
    { fr: 'coin', he: 'פינה' }, { fr: 'carte', he: 'מפה' }, { fr: 'perdu', he: 'אבוד' }, { fr: 'arriver', he: 'להגיע' },
  ]},
  { emoji: '🌤️', title: 'מזג אוויר', words: [
    { fr: 'chaud', he: 'חם' }, { fr: 'froid', he: 'קר' }, { fr: 'pluie', he: 'גשם' },
    { fr: 'soleil', he: 'שמש' }, { fr: 'vent', he: 'רוח' }, { fr: 'nuage', he: 'ענן' },
    { fr: 'neige', he: 'שלג' }, { fr: 'température', he: 'טמפרטורה' }, { fr: 'prévisions', he: 'תחזית' }, { fr: 'saison', he: 'עונה' },
  ]},
  { emoji: '🏥', title: 'בריאות', words: [
    { fr: 'médecin', he: 'רופא' }, { fr: 'médicament', he: 'תרופה' }, { fr: 'douleur', he: 'כאב' },
    { fr: 'fièvre', he: 'חום' }, { fr: 'malade', he: 'חולה' }, { fr: 'pharmacie', he: 'בית מרקחת' },
    { fr: 'rendez-vous', he: 'תור' }, { fr: 'repos', he: 'מנוחה' }, { fr: 'ça fait mal', he: 'כואב' }, { fr: 'mieux', he: 'טוב יותר' },
  ]},
  { emoji: '🚌', title: 'תחבורה', words: [
    { fr: 'bus', he: 'אוטובוס' }, { fr: 'train', he: 'רכבת' }, { fr: 'taxi', he: 'מונית' },
    { fr: 'billet', he: 'כרטיס' }, { fr: 'gare', he: 'תחנה' }, { fr: 'aéroport', he: 'שדה תעופה' },
    { fr: 'en retard', he: 'מאחר' }, { fr: 'quai', he: 'פלטפורמה' }, { fr: 'siège', he: 'מושב' }, { fr: 'chauffeur', he: 'נהג' },
  ]},
  { emoji: '🍽️', title: 'אכילה בחוץ', words: [
    { fr: 'menu', he: 'תפריט' }, { fr: 'commander', he: 'להזמין' }, { fr: 'serveur', he: 'מלצר' },
    { fr: 'addition', he: 'חשבון' }, { fr: 'réservation', he: 'הזמנה' }, { fr: 'table', he: 'שולחן' },
    { fr: 'entrée', he: 'מנה ראשונה' }, { fr: 'dessert', he: 'קינוח' }, { fr: 'pourboire', he: 'טיפ' }, { fr: 'délicieux', he: 'טעים' },
  ]},
  { emoji: '📅', title: 'שגרה יומית', words: [
    { fr: 'se réveiller', he: 'להתעורר' }, { fr: 'douche', he: 'מקלחת' }, { fr: 'petit-déjeuner', he: 'ארוחת בוקר' },
    { fr: 'aller au travail', he: 'לצאת לעבודה' }, { fr: 'déjeuner', he: 'ארוחת צהריים' }, { fr: 'travailler', he: 'לעבוד' },
    { fr: 'dîner', he: 'ארוחת ערב' }, { fr: 'se détendre', he: 'להירגע' }, { fr: 'dormir', he: 'לישון' }, { fr: 'planifier', he: 'לתכנן' },
  ]},
  { emoji: '💬', title: 'דעות', words: [
    { fr: 'penser', he: 'לחשוב' }, { fr: 'croire', he: 'להאמין' }, { fr: 'être d\'accord', he: 'להסכים' },
    { fr: 'ne pas être d\'accord', he: 'לא להסכים' }, { fr: 'peut-être', he: 'אולי' }, { fr: 'important', he: 'חשוב' },
    { fr: 'intéressant', he: 'מעניין' }, { fr: 'ennuyeux', he: 'משעמם' }, { fr: 'préférer', he: 'להעדיף' }, { fr: 'opinion', he: 'דעה' },
  ]},
  { emoji: '🏠', title: 'בית ומחייה', words: [
    { fr: 'loyer', he: 'שכירות' }, { fr: 'voisin', he: 'שכן' }, { fr: 'étage', he: 'קומה' },
    { fr: 'clé', he: 'מפתח' }, { fr: 'meubles', he: 'רהיטים' }, { fr: 'nettoyer', he: 'לנקות' },
    { fr: 'cassé', he: 'שבור' }, { fr: 'réparer', he: 'לתקן' }, { fr: 'confortable', he: 'נוח' }, { fr: 'déménager', he: 'לעבור דירה' },
  ]},
  { emoji: '💼', title: 'עבודה ולימודים', words: [
    { fr: 'travail', he: 'עבודה' }, { fr: 'bureau', he: 'משרד' }, { fr: 'réunion', he: 'ישיבה' },
    { fr: 'délai', he: 'דד-ליין' }, { fr: 'collègue', he: 'עמית' }, { fr: 'examen', he: 'מבחן' },
    { fr: 'note', he: 'ציון' }, { fr: 'devoirs', he: 'שיעורי בית' }, { fr: 'projet', he: 'פרויקט' }, { fr: 'apprendre', he: 'ללמוד' },
  ]},
];

const FRENCH_VERB_TOPICS_2: FrenchVerbConjTopic[] = [
  { emoji: '🛍️', title: 'פעלים: קניות', pairs: [
    { emoji: '🛒', presentFr: "j'achète", presentHe: 'אני קונה', pastFr: "j'ai acheté", pastHe: 'קניתי' },
    { emoji: '💰', presentFr: 'je vends', presentHe: 'אני מוכר', pastFr: "j'ai vendu", pastHe: 'מכרתי' },
    { emoji: '💳', presentFr: 'je paie', presentHe: 'אני משלם', pastFr: "j'ai payé", pastHe: 'שילמתי' },
    { emoji: '💵', presentFr: 'ça coûte', presentHe: 'זה עולה', pastFr: 'ça a coûté', pastHe: 'עלה' },
    { emoji: '🏦', presentFr: "j'économise", presentHe: 'אני חוסך', pastFr: "j'ai économisé", pastHe: 'חסכתי' },
    { emoji: '💸', presentFr: 'je dépense', presentHe: 'אני מוציא', pastFr: "j'ai dépensé", pastHe: 'הוצאתי' },
    { emoji: '🤝', presentFr: "j'emprunte", presentHe: 'אני שואל', pastFr: "j'ai emprunté", pastHe: 'שאלתי' },
    { emoji: '↩️', presentFr: 'je rends', presentHe: 'אני מחזיר', pastFr: "j'ai rendu", pastHe: 'החזרתי' },
  ]},
  { emoji: '🤝', title: 'פעלים: חברתי', pairs: [
    { emoji: '🤗', presentFr: 'je rencontre', presentHe: 'אני נפגש', pastFr: "j'ai rencontré", pastHe: 'נפגשתי' },
    { emoji: '💌', presentFr: "j'invite", presentHe: 'אני מזמין', pastFr: "j'ai invité", pastHe: 'הזמנתי' },
    { emoji: '🏠', presentFr: 'je rends visite', presentHe: 'אני מבקר', pastFr: "j'ai rendu visite", pastHe: 'ביקרתי' },
    { emoji: '👋', presentFr: 'je présente', presentHe: 'אני מציג', pastFr: "j'ai présenté", pastHe: 'הצגתי' },
    { emoji: '🎉', presentFr: 'je fête', presentHe: 'אני חוגג', pastFr: "j'ai fêté", pastHe: 'חגגתי' },
    { emoji: '🙏', presentFr: 'je remercie', presentHe: 'אני מודה', pastFr: "j'ai remercié", pastHe: 'הודיתי' },
    { emoji: '😔', presentFr: 'je m\'excuse', presentHe: 'אני מתנצל', pastFr: 'je me suis excusé', pastHe: 'התנצלתי' },
    { emoji: '🎊', presentFr: 'je félicite', presentHe: 'אני מברך', pastFr: "j'ai félicité", pastHe: 'ברכתי' },
  ]},
  { emoji: '📱', title: 'פעלים: דיגיטל', pairs: [
    { emoji: '🔍', presentFr: 'je cherche', presentHe: 'אני מחפש', pastFr: "j'ai cherché", pastHe: 'חיפשתי' },
    { emoji: '⬇️', presentFr: 'je télécharge', presentHe: 'אני מוריד', pastFr: "j'ai téléchargé", pastHe: 'הורדתי' },
    { emoji: '💬', presentFr: 'j\'envoie un message', presentHe: 'אני שולח הודעה', pastFr: "j'ai envoyé un message", pastHe: 'שלחתי הודעה' },
    { emoji: '📤', presentFr: 'je publie', presentHe: 'אני מפרסם', pastFr: "j'ai publié", pastHe: 'פרסמתי' },
    { emoji: '📅', presentFr: 'je réserve', presentHe: 'אני מזמין', pastFr: "j'ai réservé", pastHe: 'הזמנתי' },
    { emoji: '❌', presentFr: "j'annule", presentHe: 'אני מבטל', pastFr: "j'ai annulé", pastHe: 'ביטלתי' },
    { emoji: '🔋', presentFr: 'je charge', presentHe: 'אני טוען', pastFr: "j'ai chargé", pastHe: 'טענתי' },
    { emoji: '🔗', presentFr: 'je me connecte', presentHe: 'אני מתחבר', pastFr: 'je me suis connecté', pastHe: 'התחברתי' },
  ]},
  { emoji: '✈️', title: 'פעלים: נסיעות', pairs: [
    { emoji: '✈️', presentFr: 'je voyage', presentHe: 'אני נוסע', pastFr: "j'ai voyagé", pastHe: 'נסעתי' },
    { emoji: '🏁', presentFr: "j'arrive", presentHe: 'אני מגיע', pastFr: 'je suis arrivé(e)', pastHe: 'הגעתי' },
    { emoji: '🚪', presentFr: 'je pars', presentHe: 'אני יוצא', pastFr: 'je suis parti(e)', pastHe: 'יצאתי' },
    { emoji: '🧳', presentFr: 'je fais ma valise', presentHe: 'אני ארוז', pastFr: "j'ai fait ma valise", pastHe: 'ארזתי' },
    { emoji: '🗺️', presentFr: "j'explore", presentHe: 'אני חוקר', pastFr: "j'ai exploré", pastHe: 'חקרתי' },
    { emoji: '🏨', presentFr: 'je fais le check-in', presentHe: "אני מצ'ק-אין", pastFr: "j'ai fait le check-in", pastHe: "צ'ק-אין" },
    { emoji: '🔄', presentFr: 'je rentre', presentHe: 'אני חוזר', pastFr: 'je suis rentré(e)', pastHe: 'חזרתי' },
    { emoji: '📋', presentFr: 'je planifie', presentHe: 'אני מתכנן', pastFr: "j'ai planifié", pastHe: 'תכננתי' },
  ]},
  { emoji: '💭', title: 'פעלים: דעות', pairs: [
    { emoji: '🤔', presentFr: 'je pense', presentHe: 'אני חושב', pastFr: "j'ai pensé", pastHe: 'חשבתי' },
    { emoji: '🙏', presentFr: 'je crois', presentHe: 'אני מאמין', pastFr: "j'ai cru", pastHe: 'האמנתי' },
    { emoji: '⭐', presentFr: 'je préfère', presentHe: 'אני מעדיף', pastFr: "j'ai préféré", pastHe: 'העדפתי' },
    { emoji: '✅', presentFr: 'je suis d\'accord', presentHe: 'אני מסכים', pastFr: "j'étais d'accord", pastHe: 'הסכמתי' },
    { emoji: '❌', presentFr: 'je ne suis pas d\'accord', presentHe: 'אני לא מסכים', pastFr: "je n'étais pas d'accord", pastHe: 'לא הסכמתי' },
    { emoji: '💡', presentFr: 'je suggère', presentHe: 'אני מציע', pastFr: "j'ai suggéré", pastHe: 'הצעתי' },
    { emoji: '👍', presentFr: 'je recommande', presentHe: 'אני ממליץ', pastFr: "j'ai recommandé", pastHe: 'המלצתי' },
    { emoji: '📖', presentFr: "j'explique", presentHe: 'אני מסביר', pastFr: "j'ai expliqué", pastHe: 'הסברתי' },
  ]},
];

interface SavedPodcast {
  id: number;
  title: string;
  description?: string;
  level: string;
  host_count: string;
  speech_speed?: number;
  duration?: number;
  created_at: string;
  transcript?: string;
  vocabulary?: string;
  audio_data?: string;
  grammar_tips?: { pattern: string; formula: string; formulaHighlights: string[]; whenToUse: string; podcastExample: string; podcastHighlights: string[]; examples: { type: string; sentence: string; highlights: string[] }[] }[];
  content_mode?: string;
  topic?: string;
  language?: string;
  worksheet?: string;
}

export default function App() {
  const [view, setView] = useState<'create' | 'library' | 'detail' | 'vocab-builder'>('create');
  const [vocabBuilderLanguage, setVocabBuilderLanguage] = useState<'arabic' | 'spanish' | 'italian' | 'turkish' | 'french' | 'arabic2' | 'spanish2' | 'italian2' | 'turkish2' | 'french2'>('arabic');
  const [vocabTopic, setVocabTopic] = useState<ArabicTopic | SpanishTopic | ItalianTopic | TurkishTopic | FrenchTopic | null>(null);
  const [activeVerbTopic, setActiveVerbTopic] = useState<ArabicVerbConjTopic | null>(null);
  const [activeSpanishVerbTopic, setActiveSpanishVerbTopic] = useState<SpanishVerbConjTopic | null>(null);
  const [activeItalianVerbTopic, setActiveItalianVerbTopic] = useState<ItalianVerbConjTopic | null>(null);
  const [activeTurkishVerbTopic, setActiveTurkishVerbTopic] = useState<TurkishVerbConjTopic | null>(null);
  const [activeFrenchVerbTopic, setActiveFrenchVerbTopic] = useState<FrenchVerbConjTopic | null>(null);
  const [vocabMode, setVocabMode] = useState<'browse' | 'quiz'>('browse');
  const [vocabAudioUrls, setVocabAudioUrls] = useState<Record<string, string>>({});
  const [vocabAudioLoading, setVocabAudioLoading] = useState<Record<string, boolean>>({});
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizAnswered, setQuizAnswered] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [playAllActive, setPlayAllActive] = useState(false);
  const [showAlphabet, setShowAlphabet] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<AlphabetLetter | null>(null);
  const [alphaQuizIndex, setAlphaQuizIndex] = useState(0);
  const [alphaQuizOptions, setAlphaQuizOptions] = useState<string[]>([]);
  const [alphaQuizAnswered, setAlphaQuizAnswered] = useState<string | null>(null);
  const [alphaQuizScore, setAlphaQuizScore] = useState(0);
  const [alphaMode, setAlphaMode] = useState<'grid' | 'quiz'>('grid');
  const [mode, setMode] = useState<'generate' | 'script'>('generate');

  const [language, setLanguage] = useState<'english' | 'spanish' | 'french' | 'arabic' | 'turkish' | 'italian'>('english');
  const [showHebrew, setShowHebrew] = useState(false);
  const [hebrewTranscript, setHebrewTranscript] = useState('');
  const [isTranslatingHebrew, setIsTranslatingHebrew] = useState(false);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [transliteratedTranscript, setTransliteratedTranscript] = useState('');
  const [isTransliterating, setIsTransliterating] = useState(false);
  const [spanishDialect, setSpanishDialect] = useState<'spain' | 'argentina'>('spain');

  // Generate mode state
  const [contentMode, setContentMode] = useState<'podcast' | 'roleplay' | 'phonecall'>('podcast');
  const [subject, setSubject] = useState('');
  const [sourceType, setSourceType] = useState<'subject' | 'article'>('subject');
  const [articleSourceType, setArticleSourceType] = useState<'text' | 'url'>('text');
  const [articleText, setArticleText] = useState('');
  const [articleText2, setArticleText2] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [articleUrl2, setArticleUrl2] = useState('');
  const [specificWords, setSpecificWords] = useState('');
  const [speechSpeed, setSpeechSpeed] = useState(100);
  const [length, setLength] = useState(4);
  const [level, setLevel] = useState('B2');
  const [hostCount, setHostCount] = useState<'one' | 'two'>('two');

  // My Script mode state
  const [scriptTitle, setScriptTitle] = useState('');
  const [scriptText, setScriptText] = useState('');
  const [scriptHostCount, setScriptHostCount] = useState<'one' | 'two'>('two');
  const [scriptSpeed, setScriptSpeed] = useState(100);

  // Speaker names (randomized per podcast)
  const [speakerNames, setSpeakerNames] = useState({ host1: 'Emma', host2: 'James' });

  // Generation timer
  const [genElapsed, setGenElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    const t = Date.now();
    setGenElapsed(0);
    timerRef.current = setInterval(() => setGenElapsed(Math.floor((Date.now() - t) / 1000)), 500);
  };
  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };
  const formatElapsed = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // Shared output state
  const [isGenerating, setIsGenerating] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [vocabularyChart, setVocabularyChart] = useState('');
  const [activeTab, setActiveTab] = useState<'transcript' | 'vocabulary' | 'grammar' | 'speaking'>('transcript');
  const [grammarTips, setGrammarTips] = useState<{
    pattern: string;
    formula: string;
    formulaHighlights: string[];
    whenToUse: string;
    podcastExample: string;
    podcastHighlights: string[];
    examples: { type: string; sentence: string; highlights: string[] }[];
  }[]>([]);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedTitleEn, setGeneratedTitleEn] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [vocabCopied, setVocabCopied] = useState(false);
  const [detailCopied, setDetailCopied] = useState(false);
  const [detailVocabCopied, setDetailVocabCopied] = useState(false);
  const [speakingCopied, setSpeakingCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [sourceName, setSourceName] = useState('');

  // Filter state
  const [filterTopic, setFilterTopic] = useState<string>('All');
  const [filterLevel, setFilterLevel] = useState<string>('All');

  // Library state
  const [library, setLibrary] = useState<SavedPodcast[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingGrammar, setIsGeneratingGrammar] = useState(false);
  const [isGeneratingWorksheet, setIsGeneratingWorksheet] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<SavedPodcast | null>(null);
  const [detailAudioUrl, setDetailAudioUrl] = useState<string | null>(null);
  const [detailIsPlaying, setDetailIsPlaying] = useState(false);
  const [detailCurrentTime, setDetailCurrentTime] = useState(0);
  const [detailDuration, setDetailDuration] = useState(0);
  const [detailActiveTab, setDetailActiveTab] = useState<'transcript' | 'vocabulary' | 'grammar' | 'speaking'>('transcript');
  const detailAudioRef = useRef<HTMLAudioElement | null>(null);

  const fetchLibrary = async () => {
    setLoadingLibrary(true);
    try {
      const res = await fetch(`/api/podcasts?language=${language}`);
      const data = await res.json();
      setLibrary(data);
    } finally {
      setLoadingLibrary(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  useEffect(() => {
    if (view === 'library') fetchLibrary();
  }, [view]);

  useEffect(() => {
    if (view === 'library') fetchLibrary();
    setFilterTopic('All');
    setFilterLevel('All');
  }, [language]);

  const openWorksheetHtml = (html: string, title?: string) => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      const a = document.createElement('a');
      a.href = url;
      a.download = `worksheet-${title || 'podcast'}.html`;
      a.click();
    }
  };

  const handleGenerateWorksheet = async (overrides?: { title?: string; vocabulary?: string; level?: string; grammarTips?: any[]; language?: string; podcastId?: number; savedWorksheet?: string }) => {
    // If a saved worksheet already exists, just open it
    if (overrides?.savedWorksheet) { openWorksheetHtml(overrides.savedWorksheet, overrides.title); return; }
    const vocab = overrides?.vocabulary ?? vocabularyChart;
    const lvl = overrides?.level ?? level;
    const title = overrides?.title ?? generatedTitle;
    const tips = overrides?.grammarTips ?? grammarTips;
    const lang = overrides?.language ?? language;
    if (!vocab || !lvl) return;
    setIsGeneratingWorksheet(true);
    try {
      const res = await fetch('/api/generate-worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, vocabulary: vocab, level: lvl, grammarTips: tips, language: lang }),
      });
      const data = await res.json();
      if (data.html) {
        openWorksheetHtml(data.html, title);
        // Save to library if this is a saved podcast
        if (overrides?.podcastId) {
          fetch(`/api/save-worksheet/${overrides.podcastId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html: data.html }),
          }).then(() => {
            setLibrary(prev => prev.map(p => p.id === overrides.podcastId ? { ...p, worksheet: data.html } : p));
            if (selectedPodcast?.id === overrides.podcastId) setSelectedPodcast(prev => prev ? { ...prev, worksheet: data.html } : prev);
          }).catch(() => {});
        }
      } else {
        alert('Failed to generate worksheet: ' + (data.error || 'Unknown error'));
      }
    } catch (e: any) {
      alert('Failed to generate worksheet: ' + e.message);
    } finally {
      setIsGeneratingWorksheet(false);
    }
  };

  const handleSave = async () => {
    if (!transcript || !audioData) {
      alert('Nothing to save yet — please generate a podcast first.');
      return;
    }
    setIsSaving(true);
    console.log('Saving podcast with contentMode:', contentMode);
    try {
      const res = await fetch('/api/podcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedTitle,
          description: generatedDescription || undefined,
          transcript,
          vocabulary: vocabularyChart,
          audioData,
          level: mode === 'script' ? '—' : level,
          hostCount: mode === 'script' ? scriptHostCount : hostCount,
          speechSpeed: mode === 'script' ? undefined : speechSpeed,
          duration: audioDuration || undefined,
          grammarTips: grammarTips.length > 0 ? grammarTips : undefined,
          language,
          contentMode,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      setSavedId(data.id);
      fetchLibrary();
    } catch (error: any) {
      alert('Failed to save: ' + (error?.message || error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenPodcast = async (podcast: SavedPodcast) => {
    const res = await fetch(`/api/podcasts/${podcast.id}`);
    const data = await res.json();
    setSelectedPodcast(data);
    setGrammarTips(data.grammar_tips || []);
    if (data.audio_data) {
      const base64Standard = data.audio_data.replace(/-/g, '+').replace(/_/g, '/');
      const binaryString = atob(base64Standard);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const isMp3 = bytes[0] === 0xFF || (bytes[0] === 0x49 && bytes[1] === 0x44);
      const blob = new Blob([bytes], { type: isMp3 ? 'audio/mpeg' : 'audio/wav' });
      setDetailAudioUrl(URL.createObjectURL(blob));
    }
    setDetailActiveTab('transcript');
    setDetailIsPlaying(false);
    setDetailCurrentTime(0);
    setShowHebrew(false);
    setHebrewTranscript('');
    setShowTransliteration(false);
    setTransliteratedTranscript('');
    setView('detail');
  };

  const handleDeletePodcast = async (id: number) => {
    await fetch(`/api/podcasts/${id}`, { method: 'DELETE' });
    setLibrary(prev => prev.filter(p => p.id !== id));
  };

  const getAudioBlob = async (podcast: SavedPodcast): Promise<{ blob: Blob; filename: string } | null> => {
    const res = await fetch(`/api/podcasts/${podcast.id}`);
    const data = await res.json();
    if (!data.audio_data) return null;
    const binary = atob(data.audio_data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const isMp3 = bytes[0] === 0xFF || (bytes[0] === 0x49 && bytes[1] === 0x44);
    const blob = new Blob([bytes], { type: isMp3 ? 'audio/mpeg' : 'audio/wav' });
    const ext = isMp3 ? 'mp3' : 'wav';
    const filename = `${podcast.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;
    return { blob, filename };
  };

  const handleDownloadPodcast = async (podcast: SavedPodcast, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await getAudioBlob(podcast);
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareWhatsApp = async (podcast: SavedPodcast, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await getAudioBlob(podcast);
    if (!result) return;

    const formatDuration = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m}:${String(s).padStart(2, '0')}`;
    };
    const podcastDuration = podcast.duration || 0;
    const lines = [
      `Length: ${podcastDuration ? formatDuration(podcastDuration) : ''}${podcast.level ? ` • Level ${podcast.level}` : ''}`,
      `${podcast.title}${podcast.description ? ` — ${podcast.description}` : ''}`,
    ].filter(Boolean).join('\n\n');

    const file = new File([result.blob], result.filename, { type: 'audio/wav' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: podcast.title, text: lines });
    } else {
      // Desktop fallback: download the file then open WhatsApp Web with pre-written message
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      setTimeout(() => window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(lines)}`, '_blank'), 500);
    }
  };

  const startEdit = (podcast: SavedPodcast, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(podcast.id);
    setEditTitle(podcast.title);
    setEditDescription(podcast.description || '');
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const saveEdit = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/podcasts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      const updated = await res.json();
      setLibrary(prev => prev.map(p => p.id === id ? { ...p, title: updated.title, description: updated.description } : p));
      setEditingId(null);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Shared audio generation: one server call handles all TTS chunks with rate-limit-safe spacing
  const generateAudio = async (
    script: string,
    hCount: 'one' | 'two',
    speed: number,
    lvl: string,
    readAsWritten: boolean,
    names: { host1: string; host2: string },
    lang?: string,
    dialect?: string
  ) => {
    const res = await fetch('/api/generate-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script, speechSpeed: speed, level: lvl, hostCount: hCount, readAsWritten, speakerNames: names, language: lang, spanishDialect: dialect }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!data.base64Pcm) throw new Error('No audio data');

    const mimeType = data.mimeType || 'audio/wav';
    const base64 = data.base64Pcm.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    let audioBytes: Uint8Array;
    if (mimeType === 'audio/mpeg') {
      audioBytes = bytes;
    } else {
      // Legacy WAV: build header around raw PCM
      const header = new ArrayBuffer(44);
      const dv = new DataView(header);
      const sampleRate = 24000;
      dv.setUint32(0, 0x52494646, false); dv.setUint32(4, 36 + bytes.length, true);
      dv.setUint32(8, 0x57415645, false); dv.setUint32(12, 0x666d7420, false);
      dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
      dv.setUint32(24, sampleRate, true); dv.setUint32(28, sampleRate * 2, true);
      dv.setUint16(32, 2, true); dv.setUint16(34, 16, true);
      dv.setUint32(36, 0x64617461, false); dv.setUint32(40, bytes.length, true);
      audioBytes = new Uint8Array(44 + bytes.length);
      audioBytes.set(new Uint8Array(header), 0);
      audioBytes.set(bytes, 44);
    }

    const audioBlob = new Blob([audioBytes], { type: mimeType });
    setAudioUrl(URL.createObjectURL(audioBlob));

    const duration = await new Promise<number>((resolve) => {
      const tempAudio = new Audio(URL.createObjectURL(audioBlob));
      tempAudio.onloadedmetadata = () => {
        const secs = Math.round(tempAudio.duration);
        setAudioDuration(secs);
        URL.revokeObjectURL(tempAudio.src);
        resolve(secs);
      };
      tempAudio.onerror = () => resolve(0);
    });

    let bin = '';
    for (let i = 0; i < audioBytes.length; i++) bin += String.fromCharCode(audioBytes[i]);
    setAudioData(btoa(bin));
    return duration;
  };

  const getSpeakingPrompt = (langHe: string, level: string, title: string, langCode?: string): string => {
    if (langCode === 'italian') {
      const variants = [
        `I just listened to an Italian podcast about "${title}" at ${level} level. I want to tell you about it — I'll share what I heard, and please ask me questions at the end. Only correct my Italian after we've finished discussing.`,
        `I've just finished listening to an Italian podcast on "${title}" (level ${level}). I'm going to tell you what I learned, and I'd like you to ask me questions when I'm done. Please save any language corrections for after our discussion.`,
        `I just listened to a podcast in Italian about "${title}", level ${level}. I want to share what I heard with you, and at the end please ask me questions about the topic. Correct my Italian only once we've finished talking about the podcast.`,
        `I've just heard an Italian podcast about "${title}" at ${level} level. I'd like to tell you about it — I'll speak and you ask me questions at the end. Keep any Italian corrections for after we finish the discussion.`,
      ];
      return variants[Math.floor(Math.random() * variants.length)];
    }
    const variants = [
      `זה עתה האזנתי לפודקאסט על "${title}" ב${langHe} ברמה ${level}. אני רוצה לספר לך על הפודקאסט, ואתה תקשיב ותשאל אותי שאלות בסוף. תתקן לי את ה${langHe} שלי רק אחרי שנסיים לדון בפודקאסט.`,
      `הרגע סיימתי לשמוע פודקאסט בנושא "${title}" ב${langHe}, רמה ${level}. אני אספר לך מה למדתי ואתה תשאל אותי שאלות אחרי שאסיים. תגיה לי את השפה רק בסוף השיחה, לא באמצע.`,
      `זה עתה שמעתי פודקאסט על "${title}" ב${langHe} (רמה ${level}). אני רוצה לשתף אותך במה שהאזנתי, ובסוף תשאל אותי שאלות על הנושא. אנא תתקן את הטעויות שלי ב${langHe} רק אחרי שנגמור לדון בפודקאסט.`,
      `זה עתה האזנתי לפודקאסט בנושא "${title}" ב${langHe}, רמה ${level}. אני רוצה לשוחח איתך על מה ששמעתי — אני אספר ואתה תשאל שאלות בסוף. את התיקונים ב${langHe} שמור לסוף, אחרי שנסיים את הדיון.`,
    ];
    return variants[Math.floor(Math.random() * variants.length)];
  };

  const highlightWords = (text: string, highlights: string[]): JSX.Element => {
    if (!highlights.length) return <>{text}</>;
    const pattern = highlights.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          highlights.some(h => h.toLowerCase() === part.toLowerCase())
            ? <span key={i} style={{ color: '#2563eb', fontWeight: 600 }}>{part}</span>
            : <span key={i}>{part}</span>
        )}
      </>
    );
  };

  const getVocabAudio = async (word: ArabicWord) => {
    const key = word.ar;
    if (vocabAudioUrls[key]) { new Audio(vocabAudioUrls[key]).play(); return; }
    setVocabAudioLoading(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/tts-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.ar }),
      });
      const data = await res.json();
      if (data.base64) {
        const binary = atob(data.base64.replace(/-/g, '+').replace(/_/g, '/'));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        setVocabAudioUrls(prev => ({ ...prev, [key]: url }));
        new Audio(url).play();
      }
    } finally {
      setVocabAudioLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const getSpanishVocabAudio = async (word: SpanishWord) => {
    const key = 'es_' + word.es;
    if (vocabAudioUrls[key]) { new Audio(vocabAudioUrls[key]).play(); return; }
    setVocabAudioLoading(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/tts-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.es, voice: 'es-ES-ElviraNeural' }),
      });
      const data = await res.json();
      if (data.base64) {
        const binary = atob(data.base64.replace(/-/g, '+').replace(/_/g, '/'));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        setVocabAudioUrls(prev => ({ ...prev, [key]: url }));
        new Audio(url).play();
      }
    } finally {
      setVocabAudioLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const getItalianVocabAudio = async (word: ItalianWord) => {
    const key = 'it_' + word.it;
    if (vocabAudioUrls[key]) { new Audio(vocabAudioUrls[key]).play(); return; }
    setVocabAudioLoading(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/tts-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.it, voice: 'it-IT-ElsaNeural' }),
      });
      const data = await res.json();
      if (data.base64) {
        const binary = atob(data.base64.replace(/-/g, '+').replace(/_/g, '/'));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        setVocabAudioUrls(prev => ({ ...prev, [key]: url }));
        new Audio(url).play();
      }
    } finally {
      setVocabAudioLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const getTurkishVocabAudio = async (word: TurkishWord) => {
    const key = 'tr_' + word.tr;
    if (vocabAudioUrls[key]) { new Audio(vocabAudioUrls[key]).play(); return; }
    setVocabAudioLoading(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/tts-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.tr, voice: 'tr-TR-EmelNeural' }),
      });
      const data = await res.json();
      if (data.base64) {
        const binary = atob(data.base64.replace(/-/g, '+').replace(/_/g, '/'));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        setVocabAudioUrls(prev => ({ ...prev, [key]: url }));
        new Audio(url).play();
      }
    } finally {
      setVocabAudioLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const getFrenchVocabAudio = async (word: FrenchWord) => {
    const key = 'fr_' + word.fr;
    if (vocabAudioUrls[key]) { new Audio(vocabAudioUrls[key]).play(); return; }
    setVocabAudioLoading(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/tts-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.fr, voice: 'fr-FR-DeniseNeural' }),
      });
      const data = await res.json();
      if (data.base64) {
        const binary = atob(data.base64.replace(/-/g, '+').replace(/_/g, '/'));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        setVocabAudioUrls(prev => ({ ...prev, [key]: url }));
        new Audio(url).play();
      }
    } finally {
      setVocabAudioLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const startQuiz = (topic: ArabicTopic | SpanishTopic | ItalianTopic | TurkishTopic | FrenchTopic) => {
    setQuizIndex(0);
    setQuizAnswered(null);
    setQuizScore(0);
    setVocabMode('quiz');
    generateQuizOptions(topic, 0);
  };

  const generateQuizOptions = (topic: ArabicTopic | SpanishTopic | ItalianTopic | TurkishTopic | FrenchTopic, idx: number) => {
    const isItalianTopic = vocabBuilderLanguage === 'italian' || vocabBuilderLanguage === 'italian2';
    const isTurkishTopic = vocabBuilderLanguage === 'turkish' || vocabBuilderLanguage === 'turkish2';
    const isFrenchTopic = vocabBuilderLanguage === 'french' || vocabBuilderLanguage === 'french2';
    const correct = isItalianTopic ? (topic.words[idx] as ItalianWord).en : (topic.words[idx] as ArabicWord | SpanishWord | TurkishWord | FrenchWord).he;
    const allWords = vocabBuilderLanguage === 'spanish2'
      ? SPANISH_VOCAB_TOPICS_2.flatMap(t => t.words.map(w => w.he))
      : vocabBuilderLanguage === 'spanish'
      ? SPANISH_VOCAB_TOPICS.flatMap(t => t.words.map(w => w.he))
      : vocabBuilderLanguage === 'italian2'
      ? ITALIAN_VOCAB_TOPICS_2.flatMap(t => t.words.map(w => w.en))
      : isItalianTopic
      ? ITALIAN_VOCAB_TOPICS.flatMap(t => t.words.map(w => w.en))
      : vocabBuilderLanguage === 'turkish2'
      ? TURKISH_VOCAB_TOPICS_2.flatMap(t => t.words.map(w => w.he))
      : isTurkishTopic
      ? TURKISH_VOCAB_TOPICS.flatMap(t => t.words.map(w => w.he))
      : vocabBuilderLanguage === 'french2'
      ? FRENCH_VOCAB_TOPICS_2.flatMap(t => t.words.map(w => w.he))
      : isFrenchTopic
      ? FRENCH_VOCAB_TOPICS.flatMap(t => t.words.map(w => w.he))
      : vocabBuilderLanguage === 'arabic2'
      ? ARABIC_VOCAB_TOPICS_2.flatMap(t => t.words.map(w => w.he))
      : ARABIC_VOCAB_TOPICS.flatMap(t => t.words.map(w => w.he));
    const others = allWords.filter(h => h !== correct);
    const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [...shuffled, correct].sort(() => Math.random() - 0.5);
    setQuizOptions(opts);
  };

  const startAlphaQuiz = () => {
    const shuffled = [...ARABIC_ALPHABET].sort(() => Math.random() - 0.5);
    setAlphaQuizIndex(0);
    setAlphaQuizAnswered(null);
    setAlphaQuizScore(0);
    setAlphaMode('quiz');
    generateAlphaOptions(shuffled, 0);
  };

  const alphaQuizLetters = (() => {
    // stable shuffle seeded per quiz session — use ref if needed, for now just shuffle once
    return [...ARABIC_ALPHABET].sort(() => 0.5 - Math.random());
  });

  const generateAlphaOptions = (letters: AlphabetLetter[], idx: number) => {
    const correct = letters[idx].nameHe;
    const others = ARABIC_ALPHABET.map(l => l.nameHe).filter(n => n !== correct);
    const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
    setAlphaQuizOptions([...shuffled, correct].sort(() => Math.random() - 0.5));
  };

  const getLetterAudio = async (letter: AlphabetLetter) => {
    const key = 'alpha_' + letter.ar;
    if (vocabAudioUrls[key]) { new Audio(vocabAudioUrls[key]).play(); return; }
    setVocabAudioLoading(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/tts-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: letter.nameAr }),
      });
      const data = await res.json();
      if (data.base64) {
        const binary = atob(data.base64.replace(/-/g, '+').replace(/_/g, '/'));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        setVocabAudioUrls(prev => ({ ...prev, [key]: url }));
        new Audio(url).play();
      }
    } finally {
      setVocabAudioLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const getVerbAudio = async (text: string) => {
    const key = 'verb_' + text;
    if (vocabAudioUrls[key]) { new Audio(vocabAudioUrls[key]).play(); return; }
    setVocabAudioLoading(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/tts-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: text }),
      });
      const data = await res.json();
      if (data.base64) {
        const binary = atob(data.base64.replace(/-/g, '+').replace(/_/g, '/'));
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        setVocabAudioUrls(prev => ({ ...prev, [key]: url }));
        new Audio(url).play();
      }
    } finally {
      setVocabAudioLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleToggleHebrew = async (overrideTranscript?: string) => {
    if (showHebrew) { setShowHebrew(false); return; }
    if (hebrewTranscript) { setShowHebrew(true); return; }
    const raw = String(overrideTranscript ?? transcript);
    const textToTranslate = raw.replace(/VOCABULARY CHART[\s\S]*/i, '').trim();
    console.log('[Hebrew] raw length:', raw.length, 'after strip:', textToTranslate.length, 'preview:', textToTranslate.slice(0, 100));
    if (!textToTranslate) { alert('No transcript to translate.'); return; }
    setIsTranslatingHebrew(true);
    try {
      const isItalianCtx = (overrideTranscript !== undefined ? selectedPodcast?.language : language) === 'italian';
      const res = await fetch('/api/translate-hebrew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: textToTranslate, targetLanguage: isItalianCtx ? 'English' : 'Hebrew' }),
      });
      const data = await res.json();
      console.log('[Hebrew] response status:', res.status, 'has translated:', !!data.translated, 'error:', data.error);
      if (data.translated) { setHebrewTranscript(data.translated); setShowHebrew(true); }
      else { alert('Translation failed: ' + (data.error || 'Unknown error')); }
    } catch (e: any) { alert('Translation failed: ' + (typeof e?.message === 'string' ? e.message : String(e))); }
    finally { setIsTranslatingHebrew(false); }
  };

  const handleToggleTransliteration = async () => {
    if (showTransliteration) { setShowTransliteration(false); return; }
    if (transliteratedTranscript) { setShowTransliteration(true); return; }
    setIsTransliterating(true);
    try {
      const res = await fetch('/api/transliterate-arabic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      if (data.transliterated) { setTransliteratedTranscript(data.transliterated); setShowTransliteration(true); }
    } catch (e) { alert('Failed to transliterate'); }
    finally { setIsTransliterating(false); }
  };

  const handleGenerate = async () => {
    const isSubjectMode = sourceType === 'subject';
    const isArticleUrlMode = !isSubjectMode && articleSourceType === 'url';

    if (isSubjectMode && !subject.trim()) return;
    if (!isSubjectMode && articleSourceType === 'text' && !articleText.trim()) return;
    if (isArticleUrlMode && !articleUrl.trim()) return;

    const TURKISH_FEMALE = ['Elif', 'Zeynep', 'Ayşe', 'Fatma', 'Merve'];
    const TURKISH_MALE = ['Mehmet', 'Ahmet', 'Mustafa', 'Emre', 'Burak'];
    const ARABIC_FEMALE = ['Layla', 'Nour', 'Rima', 'Hana', 'Dina'];
    const ARABIC_MALE = ['Omar', 'Karim', 'Tariq', 'Ziad', 'Hassan'];
    const FRENCH_FEMALE = ['Camille', 'Chloé', 'Léa', 'Marie', 'Julie'];
    const FRENCH_MALE = ['Lucas', 'Hugo', 'Théo', 'Antoine', 'Maxime'];
    const ITALIAN_FEMALE = ['Giulia', 'Francesca', 'Sofia', 'Chiara', 'Valentina'];
    const ITALIAN_MALE = ['Marco', 'Luca', 'Matteo', 'Alessandro', 'Francesco'];
    const SPANISH_FEMALE = spanishDialect === 'argentina' ? ['Valentina', 'Sofía', 'Lucía', 'Martina', 'Florencia'] : ['Isabel', 'Carmen', 'Lucía', 'Ana', 'Elena'];
    const SPANISH_MALE = spanishDialect === 'argentina' ? ['Matías', 'Santiago', 'Nicolás', 'Tomás', 'Facundo'] : ['Alejandro', 'Carlos', 'Miguel', 'Javier', 'Pablo'];
    const femalePool = language === 'turkish' ? TURKISH_FEMALE : language === 'arabic' ? ARABIC_FEMALE : language === 'french' ? FRENCH_FEMALE : language === 'spanish' ? SPANISH_FEMALE : language === 'italian' ? ITALIAN_FEMALE : FEMALE_NAMES;
    const malePool = language === 'turkish' ? TURKISH_MALE : language === 'arabic' ? ARABIC_MALE : language === 'french' ? FRENCH_MALE : language === 'spanish' ? SPANISH_MALE : language === 'italian' ? ITALIAN_MALE : MALE_NAMES;
    const names = hostCount === 'two'
      ? { host1: pickRandom(femalePool), host2: pickRandom(malePool) }
      : { host1: pickRandom(femalePool), host2: '' };
    setSpeakerNames(names);

    setIsGenerating(true);
    startTimer();
    setTranscript('');
    setVocabularyChart('');
    setGrammarTips([]);
    setActiveTab('transcript');
    setAudioUrl(null);
    setAudioData(null);
    setSavedId(null);
    setSourceName('');
    setAudioDuration(0);
    setShowHebrew(false);
    setHebrewTranscript('');
    setShowTransliteration(false);
    setTransliteratedTranscript('');

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject, sourceType: contentMode === 'roleplay' || contentMode === 'phonecall' ? 'subject' : sourceType,
          contentMode, articleSourceType, articleText, articleText2,
          articleUrl, articleUrl2, specificWords, length, level,
          hostCount: contentMode === 'roleplay' || contentMode === 'phonecall' ? 'two' : hostCount, speakerNames: names, language, spanishDialect,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const fullText = data.fullText || '';
      setSourceName(data.sourceName || '');

      if (fullText.startsWith("ERROR: COULD NOT ACCESS LINK")) {
        alert("The AI was unable to access the content of the link provided. Please try using the direct URL or paste the article text directly.");
        setIsGenerating(false);
        return;
      }

      const titleMatch = fullText.match(/^TITLE:\s*(.*)/im);
      const title = titleMatch ? titleMatch[1].trim() : (isSubjectMode ? subject : 'Podcast Episode');

      const titleEnMatch = fullText.match(/^TITLE_EN:\s*(.*)/im);
      const titleEn = titleEnMatch ? titleEnMatch[1].trim() : '';

      const descMatch = fullText.match(/^DESCRIPTION:\s*(.*)/im);
      const description = descMatch ? descMatch[1].trim() : '';

      const vocabMatch = fullText.match(/VOCABULARY CHART[\s\S]*/i);
      const vocab = vocabMatch ? vocabMatch[0].replace(/VOCABULARY CHART/i, '').trim() : '';

      const script = fullText
        .replace(/^TITLE:.*\n?/im, '')
        .replace(/^TITLE_EN:.*\n?/im, '')
        .replace(/^DESCRIPTION:.*\n?/im, '')
        .replace(/VOCABULARY CHART[\s\S]*/i, '')
        .trim();

      setGeneratedTitle(title);
      setGeneratedTitleEn(titleEn);
      setGeneratedDescription(description);
      setVocabularyChart(vocab);

      const sName = data.sourceName || '';

      // Fire grammar tips call in background (don't await — let audio generation run in parallel)
      setIsGeneratingGrammar(true);
      const grammarPromise = fetch('/api/generate-grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: fullText, level, language, contentMode }),
      }).then(r => r.json()).then(gData => {
        setGrammarTips(gData.grammarTips ?? []);
      }).catch(err => {
        console.error('Grammar tips failed:', err);
        setGrammarTips([]);
      }).finally(() => {
        setIsGeneratingGrammar(false);
      });

      const actualDuration = await generateAudio(script, hostCount, speechSpeed, level, false, names, language, spanishDialect) ?? 0;
      const formatDur = (secs: number) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
      const headerLines = [
        'Podcasts By Us',
        `Length: ${actualDuration ? formatDur(actualDuration) : ''} • Level ${level}`,
        sName ? `Taken from: ${sName}` : '',
        `${title}${description ? ` — ${description}` : ''}`,
      ].filter(Boolean).join('\n');
      setTranscript(headerLines + '\n\n\n' + script);

      // Wait for grammar tips before releasing isGenerating
      await grammarPromise;

    } catch (error: any) {
      console.error("Generation failed:", error);
      if (error?.message?.includes('429') || error?.status === 429) {
        alert("The AI is currently receiving too many requests. Please wait a minute and try again.");
      } else {
        alert("Failed to generate podcast: " + (error?.message || error));
      }
    } finally {
      stopTimer();
      setIsGenerating(false);
    }
  };

  const handleScriptGenerate = async () => {
    if (!scriptText.trim()) return;

    setIsGenerating(true);
    startTimer();
    setTranscript('');
    setVocabularyChart('');
    setGrammarTips([]);
    setActiveTab('transcript');
    setAudioUrl(null);
    setAudioData(null);
    setSavedId(null);

    const autoTitle = scriptTitle.trim() || scriptText.trim().split('\n').find(l => l.trim())?.replace(/^[^:]+:\s*/, '').slice(0, 60) || 'My Script';
    setGeneratedTitle(autoTitle);
    setTranscript(scriptText);

    try {
      await generateAudio(scriptText, scriptHostCount, scriptSpeed, 'B2', true, { host1: 'Alex', host2: 'Sam' });
    } catch (error: any) {
      console.error("Generation failed:", error);
      if (error?.message?.includes('429') || error?.status === 429) {
        alert("The AI is currently receiving too many requests. Please wait a minute and try again.");
      } else {
        alert("Failed to generate audio: " + (error?.message || error));
      }
    } finally {
      stopTimer();
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!audioUrl) return;
    try {
      setIsSharing(true);

      const formatDuration = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
      };
      const lines = [
        `Length: ${audioDuration ? formatDuration(audioDuration) : ''}${level ? ` • Level ${level}` : ''}`,
        sourceName ? `Taken from: ${sourceName}` : '',
        `${generatedTitle}${generatedDescription ? ` — ${generatedDescription}` : ''}`,
      ].filter(Boolean).join('\n\n');

      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const fileName = `Podcast-${generatedTitle.replace(/\s+/g, '-')}.wav`;
      const file = new File([blob], fileName, { type: 'audio/wav' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: lines });
      } else {
        const shareUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(lines)}`;
        window.open(shareUrl, '_blank');
        alert("WhatsApp Desktop requires you to download the file and drag it into the chat.\n\n1. Click Download (↓)\n2. Drag the file into WhatsApp.");
      }
    } catch (error) {
      const shareUrl = `https://wa.me/?text=${encodeURIComponent(`Check out this podcast: ${generatedTitle}! ${window.location.href}`)}`;
      window.open(shareUrl, '_blank');
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = () => { navigator.clipboard.writeText(transcript); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const copySpeakingPrompt = (text: string) => {
    const done = () => { setSpeakingCopied(true); setTimeout(() => setSpeakingCopied(false), 2000); };
    const fallback = () => {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.top = '0';
      el.style.left = '0';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(el);
      done();
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
  };
  const copyVocabToClipboard = () => { navigator.clipboard.writeText(vocabularyChart); setVocabCopied(true); setTimeout(() => setVocabCopied(false), 2000); };
  const shareViaWhatsApp = async (text: string, filename: string) => {
    if (navigator.share) {
      try {
        const file = new File([text], filename, { type: 'text/plain' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: generatedTitle || 'Podcast' });
        } else {
          await navigator.share({ title: generatedTitle || 'Podcast', text: text.slice(0, 2000) });
        }
      } catch {}
    } else {
      window.open('https://wa.me/?text=' + encodeURIComponent(text.slice(0, 2000)), '_blank');
    }
  };
  const togglePlay = () => {
    if (audioRef.current) { isPlaying ? audioRef.current.pause() : audioRef.current.play(); setIsPlaying(!isPlaying); }
  };
  const toggleDetailPlay = () => {
    if (detailAudioRef.current) { detailIsPlaying ? detailAudioRef.current.pause() : detailAudioRef.current.play(); setDetailIsPlaying(!detailIsPlaying); }
  };
  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) { audioRef.current.currentTime = time; setCurrentTime(time); }
  };
  const handleDetailSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (detailAudioRef.current) { detailAudioRef.current.currentTime = time; setDetailCurrentTime(time); }
  };
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    return `${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, '0')}`;
  };

  const filteredLibrary = library.filter(p => {
    if (filterTopic !== 'All' && p.topic !== filterTopic) return false;
    if (filterLevel !== 'All' && p.level !== filterLevel) return false;
    return true;
  });

  // VOCAB BUILDER VIEW
  if (view === 'vocab-builder') {
    const isSpanish = vocabBuilderLanguage === 'spanish' || vocabBuilderLanguage === 'spanish2';
    const isItalian = vocabBuilderLanguage === 'italian' || vocabBuilderLanguage === 'italian2';
    const isTurkish = vocabBuilderLanguage === 'turkish' || vocabBuilderLanguage === 'turkish2';
    const isFrench = vocabBuilderLanguage === 'french' || vocabBuilderLanguage === 'french2';
    const isLevel2 = vocabBuilderLanguage === 'arabic2' || vocabBuilderLanguage === 'spanish2' || vocabBuilderLanguage === 'italian2' || vocabBuilderLanguage === 'turkish2' || vocabBuilderLanguage === 'french2';
    const isLatin = isSpanish || isItalian || isTurkish || isFrench;
    const allTopics = vocabBuilderLanguage === 'spanish2' ? SPANISH_VOCAB_TOPICS_2
      : vocabBuilderLanguage === 'spanish' ? SPANISH_VOCAB_TOPICS
      : vocabBuilderLanguage === 'italian2' ? ITALIAN_VOCAB_TOPICS_2
      : vocabBuilderLanguage === 'italian' ? ITALIAN_VOCAB_TOPICS
      : vocabBuilderLanguage === 'turkish2' ? TURKISH_VOCAB_TOPICS_2
      : vocabBuilderLanguage === 'turkish' ? TURKISH_VOCAB_TOPICS
      : vocabBuilderLanguage === 'french2' ? FRENCH_VOCAB_TOPICS_2
      : vocabBuilderLanguage === 'french' ? FRENCH_VOCAB_TOPICS
      : vocabBuilderLanguage === 'arabic2' ? ARABIC_VOCAB_TOPICS_2
      : ARABIC_VOCAB_TOPICS;

    // Stable shuffled list for alphabet quiz (kept in closure)
    const alphaShuffled = [...ARABIC_ALPHABET].sort(() => 0.5 - Math.random());

    if (showAlphabet && !isLatin) {
      const quizLetter = alphaShuffled[alphaQuizIndex % alphaShuffled.length];
      return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
          <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
              <button onClick={() => { setShowAlphabet(false); setSelectedLetter(null); }} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all">
                <ArrowLeft size={16} /> נושאים
              </button>
              <div className="flex-1">
                <h1 className="text-base font-bold">האלפבית הערבי</h1>
                <p className="text-xs text-gray-500">28 אותיות</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setAlphaMode('grid'); setSelectedLetter(null); }} className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${alphaMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>אותיות</button>
                <button onClick={() => { setAlphaMode('quiz'); setAlphaQuizIndex(0); setAlphaQuizAnswered(null); setAlphaQuizScore(0); generateAlphaOptions(alphaShuffled, 0); }} className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${alphaMode === 'quiz' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>חידון</button>
              </div>
            </div>
          </header>

          <main className="max-w-2xl mx-auto px-4 py-6">
            {alphaMode === 'grid' ? (
              <>
                {/* 28-letter grid */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {ARABIC_ALPHABET.map((letter, i) => (
                    <button key={i} onClick={() => { setSelectedLetter(letter); getLetterAudio(letter); }}
                      className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all ${selectedLetter?.ar === letter.ar ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-100 hover:border-indigo-300 hover:shadow-sm'}`}>
                      <span className="text-2xl font-bold" dir="rtl">{letter.ar}</span>
                      <span className={`text-[10px] font-bold ${selectedLetter?.ar === letter.ar ? 'text-indigo-200' : 'text-gray-400'}`}>{letter.nameHe}</span>
                    </button>
                  ))}
                </div>

                {/* Detail card for selected letter */}
                {selectedLetter && (
                  <div className="bg-white border border-indigo-100 rounded-3xl shadow-sm p-6 space-y-5">
                    <div className="flex items-center gap-5">
                      <div className="flex-shrink-0 w-20 h-20 flex items-center justify-center bg-indigo-50 rounded-2xl">
                        <span className="text-5xl font-bold text-indigo-700" dir="rtl">{selectedLetter.ar}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="text-xl font-bold text-gray-800">{selectedLetter.nameHe}</p>
                          <button onClick={() => getLetterAudio(selectedLetter)} className="w-9 h-9 flex items-center justify-center bg-indigo-50 border border-indigo-200 rounded-full hover:bg-indigo-100 transition-all">
                            {vocabAudioLoading['alpha_' + selectedLetter.ar] ? <Loader2 size={14} className="animate-spin text-indigo-600" /> : <Volume2 size={14} className="text-indigo-600" />}
                          </button>
                        </div>
                        <p className="text-sm text-indigo-600 mt-1">🔊 {selectedLetter.sound}</p>
                        {!selectedLetter.connects && <p className="text-xs text-amber-600 mt-1 font-semibold">⚠️ אות שאינה מתחברת לאות הבאה</p>}
                      </div>
                    </div>

                    {/* 4 forms */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">צורות האות</p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {[
                          { label: 'בודדת', form: selectedLetter.ar },
                          { label: 'בתחילה', form: selectedLetter.connects ? selectedLetter.ar + 'ـ' : selectedLetter.ar },
                          { label: 'באמצע', form: selectedLetter.connects ? 'ـ' + selectedLetter.ar + 'ـ' : selectedLetter.ar },
                          { label: 'בסוף', form: 'ـ' + selectedLetter.ar },
                        ].map((f, i) => (
                          <div key={i} className="p-2 bg-gray-50 rounded-xl">
                            <p className="text-xl font-bold text-gray-800" dir="rtl">{f.form}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{f.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Example word */}
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                      <p className="text-xs font-bold text-amber-700 mb-2">דוגמה</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-mono text-amber-700">{selectedLetter.example.translit}</p>
                          <p className="text-sm text-gray-600">{selectedLetter.example.he}</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-800" dir="rtl">{selectedLetter.example.ar}</p>
                      </div>
                    </div>
                  </div>
                )}
                {!selectedLetter && (
                  <p className="text-center text-sm text-gray-400 mt-2">לחץ על אות לפרטים ולהאזנה</p>
                )}
              </>
            ) : (
              /* Quiz mode */
              alphaQuizIndex >= ARABIC_ALPHABET.length ? (
                <div className="text-center py-16 space-y-4">
                  <div className="text-5xl">🎉</div>
                  <h2 className="text-2xl font-bold text-gray-800">סיימת!</h2>
                  <p className="text-lg text-gray-600">ענית נכון על <span className="font-bold text-indigo-600">{alphaQuizScore}</span> מתוך <span className="font-bold">{ARABIC_ALPHABET.length}</span></p>
                  <div className="flex gap-3 justify-center mt-6">
                    <button onClick={() => { setAlphaQuizIndex(0); setAlphaQuizAnswered(null); setAlphaQuizScore(0); generateAlphaOptions(alphaShuffled, 0); }} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all">שחק שוב</button>
                    <button onClick={() => { setAlphaMode('grid'); setSelectedLetter(null); }} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition-all">חזור לאותיות</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>{alphaQuizIndex + 1} / {ARABIC_ALPHABET.length}</span>
                    <span>✅ {alphaQuizScore}</span>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-10 text-center space-y-3">
                    <button onClick={() => getLetterAudio(quizLetter)} className="mx-auto w-14 h-14 flex items-center justify-center bg-indigo-50 border border-indigo-200 rounded-full hover:bg-indigo-100 transition-all">
                      {vocabAudioLoading['alpha_' + quizLetter.ar] ? <Loader2 size={22} className="animate-spin text-indigo-600" /> : <Volume2 size={22} className="text-indigo-600" />}
                    </button>
                    <p className="text-7xl font-bold text-gray-800" dir="rtl">{quizLetter.ar}</p>
                    <p className="text-xs text-gray-400">מה שם האות הזו?</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {alphaQuizOptions.map((opt, i) => {
                      const isCorrect = opt === quizLetter.nameHe;
                      const isChosen = opt === alphaQuizAnswered;
                      let cls = 'p-4 rounded-2xl border-2 text-sm font-bold transition-all text-center ';
                      if (!alphaQuizAnswered) cls += 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer';
                      else if (isCorrect) cls += 'bg-green-50 border-green-400 text-green-700';
                      else if (isChosen) cls += 'bg-red-50 border-red-300 text-red-600';
                      else cls += 'bg-white border-gray-100 text-gray-400';
                      return (
                        <button key={i} className={cls} disabled={!!alphaQuizAnswered} onClick={() => {
                          setAlphaQuizAnswered(opt);
                          if (isCorrect) setAlphaQuizScore(s => s + 1);
                          setTimeout(() => {
                            const next = alphaQuizIndex + 1;
                            setAlphaQuizIndex(next);
                            setAlphaQuizAnswered(null);
                            if (next < ARABIC_ALPHABET.length) generateAlphaOptions(alphaShuffled, next);
                          }, 1200);
                        }}>
                          {opt}{alphaQuizAnswered && isCorrect && ' ✓'}{alphaQuizAnswered && isChosen && !isCorrect && ' ✗'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </main>
        </div>
      );
    }

    if (activeSpanishVerbTopic) {
      return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
          <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
              <button onClick={() => setActiveSpanishVerbTopic(null)} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all">
                <ArrowLeft size={16} /> Verbos
              </button>
              <div className="flex-1">
                <h1 className="text-base font-bold">{activeSpanishVerbTopic.emoji} {activeSpanishVerbTopic.title}</h1>
                <p className="text-xs text-gray-500">Presente vs. Pretérito</p>
              </div>
            </div>
          </header>
          <main className="max-w-2xl mx-auto px-4 py-4">
            <div className="grid grid-cols-[1fr_2.5rem_1fr] gap-2 mb-3">
              <div className="flex flex-col items-center py-2 px-3 bg-teal-50 border border-teal-200 rounded-2xl">
                <span className="text-sm font-bold text-teal-700">Presente</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-[10px] font-bold text-gray-400">↔</span>
              </div>
              <div className="flex flex-col items-center py-2 px-3 bg-rose-50 border border-rose-200 rounded-2xl">
                <span className="text-sm font-bold text-rose-700">Pretérito</span>
              </div>
            </div>
            <div className="space-y-2">
              {activeSpanishVerbTopic.pairs.map((pair, i) => (
                <div key={i} className="grid grid-cols-[1fr_2.5rem_1fr] gap-2 items-stretch">
                  <div className="bg-teal-50 border border-teal-100 rounded-2xl p-3 flex flex-col gap-1">
                    <p className="text-base font-bold text-teal-900 leading-tight">{pair.presentEs}</p>
                    <p className="text-[11px] text-gray-600 leading-tight">{pair.presentHe}</p>
                    <button onClick={() => getSpanishVocabAudio({ es: pair.presentEs, he: '' })} disabled={vocabAudioLoading['es_' + pair.presentEs]} className="mt-1 self-start w-7 h-7 flex items-center justify-center bg-white border border-teal-200 rounded-full hover:bg-teal-100 transition-all disabled:opacity-50">
                      {vocabAudioLoading['es_' + pair.presentEs] ? <Loader2 size={12} className="animate-spin text-teal-600" /> : <Volume2 size={12} className="text-teal-600" />}
                    </button>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="w-6 h-6 rounded-full bg-gray-700 text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-lg">{pair.emoji}</span>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 flex flex-col gap-1">
                    <p className="text-base font-bold text-rose-900 leading-tight">{pair.pastEs}</p>
                    <p className="text-[11px] text-gray-600 leading-tight">{pair.pastHe}</p>
                    <button onClick={() => getSpanishVocabAudio({ es: pair.pastEs, he: '' })} disabled={vocabAudioLoading['es_' + pair.pastEs]} className="mt-1 self-start w-7 h-7 flex items-center justify-center bg-white border border-rose-200 rounded-full hover:bg-rose-100 transition-all disabled:opacity-50">
                      {vocabAudioLoading['es_' + pair.pastEs] ? <Loader2 size={12} className="animate-spin text-rose-600" /> : <Volume2 size={12} className="text-rose-600" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      );
    }

    if (activeFrenchVerbTopic) {
      return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
          <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
              <button onClick={() => setActiveFrenchVerbTopic(null)} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all">
                <ArrowLeft size={16} /> נושאים
              </button>
              <div className="flex-1">
                <h1 className="text-base font-bold">{activeFrenchVerbTopic.emoji} {activeFrenchVerbTopic.title}</h1>
                <p className="text-xs text-gray-500">הווה מול עבר בצרפתית</p>
              </div>
            </div>
          </header>
          <main className="max-w-2xl mx-auto px-4 py-4">
            <div className="grid grid-cols-[1fr_2.5rem_1fr] gap-2 mb-3">
              <div className="flex flex-col items-center py-2 px-3 bg-blue-50 border border-blue-200 rounded-2xl">
                <span className="text-sm font-bold text-blue-700">הווה</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-[10px] font-bold text-gray-400">↔</span>
              </div>
              <div className="flex flex-col items-center py-2 px-3 bg-rose-50 border border-rose-200 rounded-2xl">
                <span className="text-sm font-bold text-rose-700">עבר</span>
              </div>
            </div>
            <div className="space-y-2">
              {activeFrenchVerbTopic.pairs.map((pair, i) => (
                <div key={i} className="grid grid-cols-[1fr_2.5rem_1fr] gap-2 items-stretch">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 flex flex-col gap-1">
                    <p className="text-base font-bold text-blue-900 leading-tight">{pair.presentFr}</p>
                    <p className="text-[11px] text-gray-600 leading-tight">{pair.presentHe}</p>
                    <button onClick={() => getFrenchVocabAudio({ fr: pair.presentFr, he: '' })} disabled={vocabAudioLoading['fr_' + pair.presentFr]} className="mt-1 self-start w-7 h-7 flex items-center justify-center bg-white border border-blue-200 rounded-full hover:bg-blue-100 transition-all disabled:opacity-50">
                      {vocabAudioLoading['fr_' + pair.presentFr] ? <Loader2 size={12} className="animate-spin text-blue-600" /> : <Volume2 size={12} className="text-blue-600" />}
                    </button>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="w-6 h-6 rounded-full bg-gray-700 text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-lg">{pair.emoji}</span>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 flex flex-col gap-1">
                    <p className="text-base font-bold text-rose-900 leading-tight">{pair.pastFr}</p>
                    <p className="text-[11px] text-gray-600 leading-tight">{pair.pastHe}</p>
                    <button onClick={() => getFrenchVocabAudio({ fr: pair.pastFr, he: '' })} disabled={vocabAudioLoading['fr_' + pair.pastFr]} className="mt-1 self-start w-7 h-7 flex items-center justify-center bg-white border border-rose-200 rounded-full hover:bg-rose-100 transition-all disabled:opacity-50">
                      {vocabAudioLoading['fr_' + pair.pastFr] ? <Loader2 size={12} className="animate-spin text-rose-600" /> : <Volume2 size={12} className="text-rose-600" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      );
    }

    if (activeTurkishVerbTopic) {
      return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
          <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
              <button onClick={() => setActiveTurkishVerbTopic(null)} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all">
                <ArrowLeft size={16} /> נושאים
              </button>
              <div className="flex-1">
                <h1 className="text-base font-bold">{activeTurkishVerbTopic.emoji} {activeTurkishVerbTopic.title}</h1>
                <p className="text-xs text-gray-500">הווה מול עבר בטורקית</p>
              </div>
            </div>
          </header>
          <main className="max-w-2xl mx-auto px-4 py-4">
            <div className="grid grid-cols-[1fr_2.5rem_1fr] gap-2 mb-3">
              <div className="flex flex-col items-center py-2 px-3 bg-teal-50 border border-teal-200 rounded-2xl">
                <span className="text-sm font-bold text-teal-700">הווה</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-[10px] font-bold text-gray-400">↔</span>
              </div>
              <div className="flex flex-col items-center py-2 px-3 bg-rose-50 border border-rose-200 rounded-2xl">
                <span className="text-sm font-bold text-rose-700">עבר</span>
              </div>
            </div>
            <div className="space-y-2">
              {activeTurkishVerbTopic.pairs.map((pair, i) => (
                <div key={i} className="grid grid-cols-[1fr_2.5rem_1fr] gap-2 items-stretch">
                  <div className="bg-teal-50 border border-teal-100 rounded-2xl p-3 flex flex-col gap-1">
                    <p className="text-base font-bold text-teal-900 leading-tight">{pair.presentTr}</p>
                    <p className="text-[11px] text-gray-600 leading-tight">{pair.presentHe}</p>
                    <button onClick={() => getTurkishVocabAudio({ tr: pair.presentTr, he: '' })} disabled={vocabAudioLoading['tr_' + pair.presentTr]} className="mt-1 self-start w-7 h-7 flex items-center justify-center bg-white border border-teal-200 rounded-full hover:bg-teal-100 transition-all disabled:opacity-50">
                      {vocabAudioLoading['tr_' + pair.presentTr] ? <Loader2 size={12} className="animate-spin text-teal-600" /> : <Volume2 size={12} className="text-teal-600" />}
                    </button>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="w-6 h-6 rounded-full bg-gray-700 text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-lg">{pair.emoji}</span>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 flex flex-col gap-1">
                    <p className="text-base font-bold text-rose-900 leading-tight">{pair.pastTr}</p>
                    <p className="text-[11px] text-gray-600 leading-tight">{pair.pastHe}</p>
                    <button onClick={() => getTurkishVocabAudio({ tr: pair.pastTr, he: '' })} disabled={vocabAudioLoading['tr_' + pair.pastTr]} className="mt-1 self-start w-7 h-7 flex items-center justify-center bg-white border border-rose-200 rounded-full hover:bg-rose-100 transition-all disabled:opacity-50">
                      {vocabAudioLoading['tr_' + pair.pastTr] ? <Loader2 size={12} className="animate-spin text-rose-600" /> : <Volume2 size={12} className="text-rose-600" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      );
    }

    if (activeItalianVerbTopic) {
      return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
          <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
              <button onClick={() => setActiveItalianVerbTopic(null)} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all">
                <ArrowLeft size={16} /> Back
              </button>
              <div className="flex-1">
                <h1 className="text-base font-bold">{activeItalianVerbTopic.emoji} {activeItalianVerbTopic.title}</h1>
                <p className="text-xs text-gray-500">Present vs. Past</p>
              </div>
            </div>
          </header>
          <main className="max-w-2xl mx-auto px-4 py-4">
            <div className="grid grid-cols-[1fr_2.5rem_1fr] gap-2 mb-3">
              <div className="flex flex-col items-center py-2 px-3 bg-teal-50 border border-teal-200 rounded-2xl">
                <span className="text-sm font-bold text-teal-700">Present</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-[10px] font-bold text-gray-400">↔</span>
              </div>
              <div className="flex flex-col items-center py-2 px-3 bg-rose-50 border border-rose-200 rounded-2xl">
                <span className="text-sm font-bold text-rose-700">Past</span>
              </div>
            </div>
            <div className="space-y-2">
              {activeItalianVerbTopic.pairs.map((pair, i) => (
                <div key={i} className="grid grid-cols-[1fr_2.5rem_1fr] gap-2 items-stretch">
                  <div className="bg-teal-50 border border-teal-100 rounded-2xl p-3 flex flex-col gap-1">
                    <p className="text-base font-bold text-teal-900 leading-tight">{pair.presentIt}</p>
                    <p className="text-[11px] text-gray-600 leading-tight">{pair.presentEn}</p>
                    <button onClick={() => getItalianVocabAudio({ it: pair.presentIt, en: '' })} disabled={vocabAudioLoading['it_' + pair.presentIt]} className="mt-1 self-start w-7 h-7 flex items-center justify-center bg-white border border-teal-200 rounded-full hover:bg-teal-100 transition-all disabled:opacity-50">
                      {vocabAudioLoading['it_' + pair.presentIt] ? <Loader2 size={12} className="animate-spin text-teal-600" /> : <Volume2 size={12} className="text-teal-600" />}
                    </button>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="w-6 h-6 rounded-full bg-gray-700 text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-lg">{pair.emoji}</span>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 flex flex-col gap-1">
                    <p className="text-base font-bold text-rose-900 leading-tight">{pair.pastIt}</p>
                    <p className="text-[11px] text-gray-600 leading-tight">{pair.pastEn}</p>
                    <button onClick={() => getItalianVocabAudio({ it: pair.pastIt, en: '' })} disabled={vocabAudioLoading['it_' + pair.pastIt]} className="mt-1 self-start w-7 h-7 flex items-center justify-center bg-white border border-rose-200 rounded-full hover:bg-rose-100 transition-all disabled:opacity-50">
                      {vocabAudioLoading['it_' + pair.pastIt] ? <Loader2 size={12} className="animate-spin text-rose-600" /> : <Volume2 size={12} className="text-rose-600" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      );
    }

    if (activeVerbTopic) {
      // Verb conjugation table view
      return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
          <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
              <button onClick={() => setActiveVerbTopic(null)} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all">
                <ArrowLeft size={16} /> נושאים
              </button>
              <div className="flex-1">
                <h1 className="text-base font-bold">{activeVerbTopic.emoji} {activeVerbTopic.title}</h1>
                <p className="text-xs text-gray-500">הווה מול עבר בערבית לבנטית</p>
              </div>
            </div>
          </header>
          <main className="max-w-2xl mx-auto px-4 py-4">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_2.5rem_1fr] gap-2 mb-3">
              <div className="flex flex-col items-center py-2 px-3 bg-teal-50 border border-teal-200 rounded-2xl">
                <span className="text-sm font-bold text-teal-700" dir="rtl">אַלְיוֹם</span>
                <span className="text-xs text-teal-500">היום</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-[10px] font-bold text-gray-400">מקאבל</span>
              </div>
              <div className="flex flex-col items-center py-2 px-3 bg-rose-50 border border-rose-200 rounded-2xl">
                <span className="text-sm font-bold text-rose-700" dir="rtl">אִמְבַּארֵח</span>
                <span className="text-xs text-rose-500">אתמול</span>
              </div>
            </div>

            <div className="space-y-2">
              {activeVerbTopic.pairs.map((pair, i) => (
                <div key={i} className="grid grid-cols-[1fr_2.5rem_1fr] gap-2 items-stretch">
                  {/* Present form */}
                  <div className="bg-teal-50 border border-teal-100 rounded-2xl p-3 flex flex-col gap-1">
                    <p className="text-base font-bold text-teal-900 text-right leading-tight" dir="rtl">{pair.presentAr}</p>
                    <p className="text-[11px] text-teal-700 font-mono leading-tight">{pair.presentTranslit}</p>
                    <p className="text-[11px] text-gray-600 leading-tight">{pair.presentHe}</p>
                    <button onClick={() => getVerbAudio(pair.presentAr)} disabled={vocabAudioLoading['verb_' + pair.presentAr]} className="mt-1 self-start w-7 h-7 flex items-center justify-center bg-white border border-teal-200 rounded-full hover:bg-teal-100 transition-all disabled:opacity-50">
                      {vocabAudioLoading['verb_' + pair.presentAr] ? <Loader2 size={12} className="animate-spin text-teal-600" /> : <Volume2 size={12} className="text-teal-600" />}
                    </button>
                  </div>

                  {/* Middle emoji + number */}
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="w-6 h-6 rounded-full bg-gray-700 text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-lg">{pair.emoji}</span>
                  </div>

                  {/* Past form */}
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 flex flex-col gap-1">
                    <p className="text-base font-bold text-rose-900 text-right leading-tight" dir="rtl">{pair.pastAr}</p>
                    <p className="text-[11px] text-rose-700 font-mono leading-tight">{pair.pastTranslit}</p>
                    <p className="text-[11px] text-gray-600 leading-tight">{pair.pastHe}</p>
                    <button onClick={() => getVerbAudio(pair.pastAr)} disabled={vocabAudioLoading['verb_' + pair.pastAr]} className="mt-1 self-start w-7 h-7 flex items-center justify-center bg-white border border-rose-200 rounded-full hover:bg-rose-100 transition-all disabled:opacity-50">
                      {vocabAudioLoading['verb_' + pair.pastAr] ? <Loader2 size={12} className="animate-spin text-rose-600" /> : <Volume2 size={12} className="text-rose-600" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      );
    }

    if (!vocabTopic) {
      // Topic selection grid
      return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
          <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
              <button onClick={() => setView('create')} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all">
                <ArrowLeft size={16} /> {isItalian ? 'Back' : 'חזרה'}
              </button>
              <div>
                <h1 className="text-base font-bold">{vocabBuilderLanguage === 'spanish2' ? '🇪🇸 Spanish A2' : vocabBuilderLanguage === 'spanish' ? '🇪🇸 Spanish Starter' : vocabBuilderLanguage === 'italian2' ? '🇮🇹 Italian A2' : vocabBuilderLanguage === 'italian' ? '🇮🇹 Italian Starter' : vocabBuilderLanguage === 'turkish2' ? '🇹🇷 Turkish A2' : vocabBuilderLanguage === 'turkish' ? '🇹🇷 Turkish Starter' : vocabBuilderLanguage === 'french2' ? '🇫🇷 French A2' : vocabBuilderLanguage === 'french' ? '🇫🇷 French Starter' : vocabBuilderLanguage === 'arabic2' ? '🌟 Arabic A2' : '🌙 Arabic Starter'}</h1>
                <p className="text-xs text-gray-500">{isItalian ? 'Choose a topic to learn' : 'בחר נושא ללמוד'}</p>
              </div>
            </div>
          </header>
          <main className="max-w-2xl mx-auto px-4 py-6">
            {/* Alphabet card — Arabic only */}
            {!isLatin && (
              <button onClick={() => { setShowAlphabet(true); setAlphaMode('grid'); setSelectedLetter(null); }}
                className="w-full mb-3 flex items-center gap-4 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group">
                <span className="text-4xl font-bold text-indigo-700 font-mono leading-none" style={{fontFamily: 'serif'}}>أ ب ت</span>
                <div className="text-left flex-1">
                  <p className="text-sm font-bold text-indigo-800">האלפבית הערבי</p>
                  <p className="text-xs text-indigo-500">28 אותיות • צליל • צורות • חידון</p>
                </div>
                <ArrowLeft size={16} className="text-indigo-400 rotate-180 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            <div className="grid grid-cols-2 gap-3">
              {allTopics.map((topic, i) => (
                <button key={i} onClick={() => { setVocabTopic(topic); setVocabMode('browse'); setQuizIndex(0); setQuizAnswered(null); setQuizScore(0); }}
                  className="flex flex-col items-center gap-2 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-200 transition-all group">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{topic.emoji}</span>
                  <span className="text-sm font-bold text-gray-700">{topic.title}</span>
                  <span className="text-xs text-gray-400">{topic.words.length} {isItalian ? 'words' : 'מילים'}</span>
                </button>
              ))}
              {/* Verb conjugation topics — Arabic only */}
              {!isLatin && (isLevel2 ? ARABIC_VERB_TOPICS_2 : ARABIC_VERB_TOPICS).map((topic, i) => (
                <button key={'verb_' + i} onClick={() => setActiveVerbTopic(topic)}
                  className="flex flex-col items-center gap-2 p-5 bg-white border border-teal-100 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-300 transition-all group">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{topic.emoji}</span>
                  <span className="text-sm font-bold text-gray-700">{topic.title}</span>
                  <span className="text-xs text-teal-500 font-semibold">הווה ↔ עבר</span>
                </button>
              ))}
              {isSpanish && (vocabBuilderLanguage === 'spanish2' ? SPANISH_VERB_TOPICS_2 : SPANISH_VERB_TOPICS).map((topic, i) => (
                <button key={'sverbz_' + i} onClick={() => setActiveSpanishVerbTopic(topic)}
                  className="flex flex-col items-center gap-2 p-5 bg-white border border-teal-100 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-300 transition-all group">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{topic.emoji}</span>
                  <span className="text-sm font-bold text-gray-700">{topic.title}</span>
                  <span className="text-xs text-teal-500 font-semibold">presente ↔ pretérito</span>
                </button>
              ))}
              {isItalian && (vocabBuilderLanguage === 'italian2' ? ITALIAN_VERB_TOPICS_2 : ITALIAN_VERB_TOPICS).map((topic, i) => (
                <button key={'iverbz_' + i} onClick={() => setActiveItalianVerbTopic(topic)}
                  className="flex flex-col items-center gap-2 p-5 bg-white border border-teal-100 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-300 transition-all group">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{topic.emoji}</span>
                  <span className="text-sm font-bold text-gray-700">{topic.title}</span>
                  <span className="text-xs text-teal-500 font-semibold">presente ↔ passato</span>
                </button>
              ))}
              {isTurkish && (vocabBuilderLanguage === 'turkish2' ? TURKISH_VERB_TOPICS_2 : TURKISH_VERB_TOPICS).map((topic, i) => (
                <button key={'tverbz_' + i} onClick={() => setActiveTurkishVerbTopic(topic)}
                  className="flex flex-col items-center gap-2 p-5 bg-white border border-teal-100 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-300 transition-all group">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{topic.emoji}</span>
                  <span className="text-sm font-bold text-gray-700">{topic.title}</span>
                  <span className="text-xs text-teal-500 font-semibold">שימוש ↔ עבר</span>
                </button>
              ))}
              {isFrench && (vocabBuilderLanguage === 'french2' ? FRENCH_VERB_TOPICS_2 : FRENCH_VERB_TOPICS).map((topic, i) => (
                <button key={'fverbz_' + i} onClick={() => setActiveFrenchVerbTopic(topic)}
                  className="flex flex-col items-center gap-2 p-5 bg-white border border-teal-100 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-300 transition-all group">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{topic.emoji}</span>
                  <span className="text-sm font-bold text-gray-700">{topic.title}</span>
                  <span className="text-xs text-teal-500 font-semibold">הווה ↔ עבר</span>
                </button>
              ))}
            </div>
          </main>
        </div>
      );
    }

    // Word list / quiz view
    const topic = vocabTopic;
    const word = topic.words[quizIndex];
    const wordKey = isSpanish ? 'es_' + (word as SpanishWord).es : isItalian ? 'it_' + (word as ItalianWord).it : isTurkish ? 'tr_' + (word as TurkishWord).tr : isFrench ? 'fr_' + (word as FrenchWord).fr : (word as ArabicWord).ar;
    const accentCls = isSpanish
      ? { btn: 'bg-red-500 text-white hover:bg-red-600', btnOutline: 'bg-red-50 border-red-200 hover:bg-red-100', text: 'text-red-600', hover: 'hover:border-red-300 hover:bg-red-50' }
      : isItalian
      ? { btn: 'bg-green-600 text-white hover:bg-green-700', btnOutline: 'bg-green-50 border-green-200 hover:bg-green-100', text: 'text-green-600', hover: 'hover:border-green-300 hover:bg-green-50' }
      : isTurkish
      ? { btn: 'bg-red-600 text-white hover:bg-red-700', btnOutline: 'bg-red-50 border-red-200 hover:bg-red-100', text: 'text-red-600', hover: 'hover:border-red-300 hover:bg-red-50' }
      : isFrench
      ? { btn: 'bg-blue-600 text-white hover:bg-blue-700', btnOutline: 'bg-blue-50 border-blue-200 hover:bg-blue-100', text: 'text-blue-600', hover: 'hover:border-blue-300 hover:bg-blue-50' }
      : { btn: 'bg-amber-500 text-white hover:bg-amber-600', btnOutline: 'bg-amber-50 border-amber-200 hover:bg-amber-100', text: 'text-amber-600', hover: 'hover:border-amber-300 hover:bg-amber-50' };

    const playAll = async () => {
      setPlayAllActive(true);
      for (const w of topic.words) {
        if (isSpanish) await getSpanishVocabAudio(w as SpanishWord);
        else if (isItalian) await getItalianVocabAudio(w as ItalianWord);
        else if (isTurkish) await getTurkishVocabAudio(w as TurkishWord);
        else if (isFrench) await getFrenchVocabAudio(w as FrenchWord);
        else await getVocabAudio(w as ArabicWord);
        await new Promise(r => setTimeout(r, 1800));
      }
      setPlayAllActive(false);
    };

    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
        <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => setVocabTopic(null)} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all">
              <ArrowLeft size={16} /> {isItalian ? 'Topics' : 'נושאים'}
            </button>
            <div className="flex-1">
              <h1 className="text-base font-bold">{topic.emoji} {topic.title}</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setVocabMode('browse'); }} className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${vocabMode === 'browse' ? accentCls.btn : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{isItalian ? 'Words' : 'מילים'}</button>
              <button onClick={() => startQuiz(topic as ArabicTopic | SpanishTopic | ItalianTopic | TurkishTopic | FrenchTopic)} className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${vocabMode === 'quiz' ? accentCls.btn : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{isItalian ? 'Quiz' : 'חידון'}</button>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6">
          {vocabMode === 'browse' ? (
            <>
              <div className="flex justify-end mb-4">
                <button onClick={playAll} disabled={playAllActive} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full disabled:opacity-60 transition-all ${accentCls.btn}`}>
                  {playAllActive ? <><Loader2 size={13} className="animate-spin" /> {isItalian ? 'Playing...' : 'מנגן...'}</> : <><Volume2 size={13} /> {isItalian ? 'Play all' : 'השמע הכל'}</>}
                </button>
              </div>
              <div className="space-y-3">
                {topic.words.map((w, i) => {
                  const wKey = isSpanish ? 'es_' + (w as SpanishWord).es : isItalian ? 'it_' + (w as ItalianWord).it : isTurkish ? 'tr_' + (w as TurkishWord).tr : isFrench ? 'fr_' + (w as FrenchWord).fr : (w as ArabicWord).ar;
                  return (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <button onClick={() => isSpanish ? getSpanishVocabAudio(w as SpanishWord) : isItalian ? getItalianVocabAudio(w as ItalianWord) : isTurkish ? getTurkishVocabAudio(w as TurkishWord) : isFrench ? getFrenchVocabAudio(w as FrenchWord) : getVocabAudio(w as ArabicWord)} disabled={vocabAudioLoading[wKey]} className={`flex-shrink-0 w-10 h-10 flex items-center justify-center border rounded-full transition-all disabled:opacity-50 ${accentCls.btnOutline}`}>
                        {vocabAudioLoading[wKey] ? <Loader2 size={16} className={`animate-spin ${accentCls.text}`} /> : <Volume2 size={16} className={accentCls.text} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        {isSpanish ? (
                          <p className="text-xl font-bold text-gray-800">{(w as SpanishWord).es}</p>
                        ) : isItalian ? (
                          <p className="text-xl font-bold text-gray-800">{(w as ItalianWord).it}</p>
                        ) : isTurkish ? (
                          <p className="text-xl font-bold text-gray-800">{(w as TurkishWord).tr}</p>
                        ) : isFrench ? (
                          <p className="text-xl font-bold text-gray-800">{(w as FrenchWord).fr}</p>
                        ) : (
                          <>
                            <p className="text-xl font-bold text-gray-800 text-right" dir="rtl">{(w as ArabicWord).ar}</p>
                            <p className="text-sm text-amber-700 font-mono">{(w as ArabicWord).translit}</p>
                          </>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-indigo-700">{isItalian ? (w as ItalianWord).en : (w as ArabicWord | SpanishWord | TurkishWord | FrenchWord).he}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            // Quiz mode
            quizIndex >= topic.words.length ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-5xl">🎉</div>
                <h2 className="text-2xl font-bold text-gray-800">{isItalian ? 'Finished!' : 'סיימת!'}</h2>
                {isItalian ? (
                  <p className="text-lg text-gray-600">You got <span className={`font-bold ${accentCls.text}`}>{quizScore}</span> out of <span className="font-bold">{topic.words.length}</span> correct</p>
                ) : (
                  <p className="text-lg text-gray-600">ענית נכון על <span className={`font-bold ${accentCls.text}`}>{quizScore}</span> מתוך <span className="font-bold">{topic.words.length}</span></p>
                )}
                <div className="flex gap-3 justify-center mt-6">
                  <button onClick={() => startQuiz(topic as ArabicTopic | SpanishTopic | ItalianTopic | TurkishTopic | FrenchTopic)} className={`px-5 py-2.5 font-bold rounded-full transition-all ${accentCls.btn}`}>{isItalian ? 'Play again' : 'שחק שוב'}</button>
                  <button onClick={() => setVocabMode('browse')} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition-all">{isItalian ? 'Back to words' : 'חזור למילים'}</button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{quizIndex + 1} / {topic.words.length}</span>
                  <span>✅ {quizScore}</span>
                </div>
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 text-center space-y-3">
                  <button onClick={() => isSpanish ? getSpanishVocabAudio(word as SpanishWord) : isItalian ? getItalianVocabAudio(word as ItalianWord) : isTurkish ? getTurkishVocabAudio(word as TurkishWord) : isFrench ? getFrenchVocabAudio(word as FrenchWord) : getVocabAudio(word as ArabicWord)} className={`mx-auto w-14 h-14 flex items-center justify-center border rounded-full transition-all ${accentCls.btnOutline}`}>
                    {vocabAudioLoading[wordKey] ? <Loader2 size={22} className={`animate-spin ${accentCls.text}`} /> : <Volume2 size={22} className={accentCls.text} />}
                  </button>
                  {isSpanish ? (
                    <p className="text-4xl font-bold text-gray-800">{(word as SpanishWord).es}</p>
                  ) : isItalian ? (
                    <p className="text-4xl font-bold text-gray-800">{(word as ItalianWord).it}</p>
                  ) : isTurkish ? (
                    <p className="text-4xl font-bold text-gray-800">{(word as TurkishWord).tr}</p>
                  ) : isFrench ? (
                    <p className="text-4xl font-bold text-gray-800">{(word as FrenchWord).fr}</p>
                  ) : (
                    <>
                      <p className="text-4xl font-bold text-gray-800" dir="rtl">{(word as ArabicWord).ar}</p>
                      <p className="text-base text-amber-700 font-mono">{(word as ArabicWord).translit}</p>
                    </>
                  )}
                  <p className="text-xs text-gray-400">{isItalian ? 'What does this mean?' : 'מה זה אומר בעברית?'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {quizOptions.map((opt, i) => {
                    const isCorrect = opt === (isItalian ? (word as ItalianWord).en : (word as ArabicWord | SpanishWord | TurkishWord | FrenchWord).he);
                    const isChosen = opt === quizAnswered;
                    let cls = 'p-4 rounded-2xl border-2 text-sm font-bold transition-all text-center ';
                    if (!quizAnswered) cls += `bg-white border-gray-200 ${accentCls.hover} cursor-pointer`;
                    else if (isCorrect) cls += 'bg-green-50 border-green-400 text-green-700';
                    else if (isChosen) cls += 'bg-red-50 border-red-300 text-red-600';
                    else cls += 'bg-white border-gray-100 text-gray-400';
                    return (
                      <button key={i} className={cls} disabled={!!quizAnswered} onClick={() => {
                        setQuizAnswered(opt);
                        if (isCorrect) setQuizScore(s => s + 1);
                        setTimeout(() => {
                          const next = quizIndex + 1;
                          setQuizIndex(next);
                          setQuizAnswered(null);
                          if (next < topic.words.length) generateQuizOptions(topic as ArabicTopic | SpanishTopic | ItalianTopic | TurkishTopic | FrenchTopic, next);
                        }, 1200);
                      }}>
                        {opt}
                        {quizAnswered && isCorrect && ' ✓'}
                        {quizAnswered && isChosen && !isCorrect && ' ✗'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </main>
      </div>
    );
  }

  // LIBRARY VIEW
  if (view === 'library') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
        <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 shadow-lg shadow-pink-50">
                <Mic size={20} strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Podcasts By Us</h1>
                          </div>
            <button onClick={() => setView('create')} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all">
              <ArrowLeft size={16} /> Create New
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Library size={22} className="text-indigo-600" /> Your Library
              {/iPhone|iPad|iPod/.test(navigator.userAgent) && (
                <button onClick={() => window.location.reload()} className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all" title="Refresh">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                </button>
              )}
            </h2>
            <div className="flex p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
              {(['english','spanish','french','arabic','turkish','italian'] as const).map(lang => (
                <button key={lang} onClick={() => setLanguage(lang)} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${language === lang ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {lang === 'english' ? '🇬🇧' : lang === 'spanish' ? '🇪🇸' : lang === 'french' ? '🇫🇷' : lang === 'arabic' ? '🇸🇾' : lang === 'turkish' ? '🇹🇷' : '🇮🇹'} {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {loadingLibrary ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={32} /></div>
          ) : (
            <div className="space-y-4">
              {library.length > 0 && (
                <>
                  {/* Topic filters */}
                  <div className="flex gap-2 flex-wrap">
                    {['All','World Events & Politics','Business & Economy','Science & Technology','Health & Psychology','Education & Culture','Travel & Places','Role Play'].map(t => (
                      <button key={t} onClick={() => setFilterTopic(t)} className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${filterTopic === t ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}>{t}</button>
                    ))}
                  </div>
                  {/* Level filters */}
                  <div className="flex gap-2 flex-wrap">
                    {['All','A1','A2','B1','B2','C1','C2'].map(l => (
                      <button key={l} onClick={() => setFilterLevel(l)} className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${filterLevel === l ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}>{l}</button>
                    ))}
                  </div>
                </>
              )}
              {library.length === 0 ? (
                <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
                  <Library size={48} className="mx-auto mb-4 text-gray-200" />
                  <p className="text-lg font-medium">No saved podcasts yet</p>
                  <p className="text-sm">Generate a podcast and click Save</p>
                </div>
              ) : filteredLibrary.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No podcasts match the selected filters.</p>
              ) : (
              <div className="space-y-3">
              {filteredLibrary.map(podcast => (
                <div key={podcast.id} className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${editingId === podcast.id ? 'border-indigo-300' : 'border-gray-100 hover:border-indigo-200 cursor-pointer'}`}
                  onClick={() => editingId !== podcast.id && handleOpenPodcast(podcast)}>
                  {editingId === podcast.id ? (
                    <div className="space-y-3" onClick={e => e.stopPropagation()}>
                      <input
                        autoFocus
                        className="w-full px-3 py-2 rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold text-gray-900"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        placeholder="Title"
                      />
                      <div className="relative">
                        <textarea
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm text-gray-600 resize-none min-h-[64px]"
                          value={editDescription}
                          onChange={e => setEditDescription(e.target.value)}
                          placeholder="Add a description (optional)..."
                        />
                        <button
                          type="button"
                          disabled={isGeneratingDesc || !editTitle.trim()}
                          onClick={async () => {
                            setIsGeneratingDesc(true);
                            try {
                              const r = await fetch('/api/generate-description', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: editTitle }) });
                              const d = await r.json();
                              if (d.description) setEditDescription(d.description);
                            } finally { setIsGeneratingDesc(false); }
                          }}
                          className="absolute bottom-2 right-2 text-[10px] font-bold text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all disabled:opacity-40"
                        >
                          {isGeneratingDesc ? '...' : '✨ Generate'}
                        </button>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={cancelEdit} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-1">
                          <X size={13} /> Cancel
                        </button>
                        <button onClick={e => saveEdit(podcast.id, e)} disabled={isSavingEdit || !editTitle.trim()} className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-1">
                          {isSavingEdit ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                          {podcast.content_mode === 'phonecall' ? <span style={{fontSize:'1.1rem'}}>📞</span> : podcast.content_mode === 'roleplay' ? <span style={{fontSize:'1.1rem'}}>🎭</span> : <Volume2 size={16} className="text-indigo-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900 leading-snug line-clamp-2">{podcast.title}</p>
                            {podcast.content_mode === 'phonecall' && <span className="text-[10px] font-bold bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full shrink-0">Phone Call</span>}
                            {podcast.content_mode === 'roleplay' && <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full shrink-0">Role Play</span>}
                            {podcast.topic && <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{podcast.topic}</span>}
                          </div>
                          {podcast.description && <p className="text-xs text-gray-500 mt-1">{podcast.description}</p>}
                          <p className="text-xs text-gray-400 mt-1">
                            {podcast.level !== '—' ? `Level ${podcast.level} · ` : ''}{podcast.host_count === 'two' ? 'Two hosts' : 'One host'}{podcast.speech_speed && podcast.speech_speed !== 100 ? ` · ${podcast.speech_speed}%` : ''} · {new Date(podcast.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 justify-end border-t border-gray-50 pt-2" onClick={e => e.stopPropagation()}>
                        <button onClick={e => startEdit(podcast, e)} className="p-2 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={e => handleDownloadPodcast(podcast, e)} className="p-2 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all" title="Download">
                          <Download size={15} />
                        </button>
                        <button onClick={e => handleShareWhatsApp(podcast, e)} className="p-2 text-gray-300 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all" title="Share on WhatsApp">
                          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </button>
                        <button onClick={e => { e.stopPropagation(); handleDeletePodcast(podcast.id); }} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              </div>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // DETAIL VIEW
  if (view === 'detail' && selectedPodcast) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
        <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 shadow-lg shadow-pink-50">
                <Mic size={20} strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Podcasts By Us</h1>
                          </div>
            <button onClick={() => { setView('library'); setDetailAudioUrl(null); setDetailIsPlaying(false); }} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all">
              <ArrowLeft size={16} /> Library
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-12 space-y-6">
          {detailAudioUrl && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
              <button onClick={toggleDetailPlay} className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 shrink-0">
                {detailIsPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
              </button>
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-sm font-bold text-gray-900 truncate">{selectedPodcast.title}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-400 w-7 tabular-nums">{formatTime(detailCurrentTime)}</span>
                  <input type="range" min="0" max={detailDuration || 0} value={detailCurrentTime} onChange={handleDetailSeek} className="flex-1 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  <span className="text-[10px] text-gray-400 w-7 tabular-nums">{formatTime(detailDuration)}</span>
                </div>
              </div>
              <button onClick={e => handleShareWhatsApp(selectedPodcast, e)} className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all" title="Share on WhatsApp">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </button>
              <a href={detailAudioUrl} download={`Podcast-${selectedPodcast.title.replace(/\s+/g, '-')}.wav`} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                <Download size={18} />
              </a>
              <audio ref={detailAudioRef} src={detailAudioUrl} onEnded={() => setDetailIsPlaying(false)} onTimeUpdate={() => detailAudioRef.current && setDetailCurrentTime(detailAudioRef.current.currentTime)} onLoadedMetadata={() => detailAudioRef.current && setDetailDuration(detailAudioRef.current.duration)} className="hidden" />
            </div>
          )}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[600px]">
            <div className="p-2 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 gap-1 flex-wrap">
              <div className="flex items-center gap-1 flex-wrap">
                <button onClick={() => setDetailActiveTab('transcript')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${detailActiveTab === 'transcript' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Transcript</button>
                {selectedPodcast.vocabulary && (
                  <button onClick={() => setDetailActiveTab('vocabulary')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${detailActiveTab === 'vocabulary' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Vocabulary Chart</button>
                )}
                {selectedPodcast.grammar_tips && selectedPodcast.grammar_tips.length > 0 && (
                  <button onClick={() => setDetailActiveTab('grammar')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${detailActiveTab === 'grammar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Grammar Tips</button>
                )}
                <button onClick={() => setDetailActiveTab('speaking')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${detailActiveTab === 'speaking' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>🎙️ Speaking Practice</button>
              </div>
              {selectedPodcast.vocabulary && selectedPodcast.level && (
                <button onClick={() => handleGenerateWorksheet({ title: selectedPodcast.title, vocabulary: selectedPodcast.vocabulary!, level: selectedPodcast.level!, grammarTips: selectedPodcast.grammar_tips ?? [], language: selectedPodcast.language ?? 'english', podcastId: selectedPodcast.id, savedWorksheet: selectedPodcast.worksheet })} disabled={isGeneratingWorksheet} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-green-600 text-white rounded-full hover:bg-green-700 shadow-sm disabled:opacity-50 transition-all">
                  {isGeneratingWorksheet ? <><Loader2 size={13} className="animate-spin" />Generating...</> : <>{selectedPodcast.worksheet ? '📄 Open Worksheet' : '📄 Worksheet'}</>}
                </button>
              )}
            </div>
            <div className="p-2 border-b border-gray-100 flex items-center bg-gray-50/50 gap-1 flex-wrap">
              {detailActiveTab === 'vocabulary' && selectedPodcast.vocabulary && (
                <button onClick={() => {
                  const text = selectedPodcast.vocabulary || '';
                  const copyFn = () => { setDetailVocabCopied(true); setTimeout(() => setDetailVocabCopied(false), 2000); };
                  if (navigator.clipboard) { navigator.clipboard.writeText(text).then(copyFn).catch(() => { const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); copyFn(); }); }
                  else { const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); copyFn(); }
                }} className="ml-auto flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-full transition-all">
                  {detailVocabCopied ? <><Check size={13} />Copied!</> : <><Copy size={13} />Copy Vocabulary</>}
                </button>
              )}
              {detailActiveTab === 'transcript' && selectedPodcast.transcript && (
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => {
                    const text = selectedPodcast.transcript || '';
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(text).then(() => { setDetailCopied(true); setTimeout(() => setDetailCopied(false), 2000); }).catch(() => {
                        const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); setDetailCopied(true); setTimeout(() => setDetailCopied(false), 2000);
                      });
                    } else {
                      const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); setDetailCopied(true); setTimeout(() => setDetailCopied(false), 2000);
                    }
                  }} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-full transition-all">
                    {detailCopied ? <><Check size={13} />Copied!</> : <><Copy size={13} />Copy Transcript</>}
                  </button>
                  {selectedPodcast.transcript && (
                    <button onClick={() => handleToggleHebrew(selectedPodcast.transcript)} disabled={isTranslatingHebrew} className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-full transition-all disabled:opacity-50">
                      {isTranslatingHebrew ? <><Loader2 size={14} className="animate-spin" /> Translating...</> : <>{showHebrew ? (selectedPodcast.language === 'italian' ? '✕ Hide English' : '✕ Hide Hebrew') : (selectedPodcast.language === 'italian' ? '🇬🇧 English' : '🇮🇱 Hebrew')}</>}
                    </button>
                  )}
                  {selectedPodcast.language === 'arabic' && (selectedPodcast.level === 'A1' || selectedPodcast.level === 'A2' || selectedPodcast.level === 'B1') && selectedPodcast.transcript && (
                    <button onClick={handleToggleTransliteration} disabled={isTransliterating} className="flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-full transition-all disabled:opacity-50">
                      {isTransliterating ? <><Loader2 size={14} className="animate-spin" /> Transliterating...</> : <>{showTransliteration ? '✕ Hide Transliteration' : '🔤 Transliteration'}</>}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="p-8 overflow-y-auto prose prose-indigo max-w-none">
              {detailActiveTab === 'transcript' ? (
                showTransliteration && transliteratedTranscript ? (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">טרנסליטרציה</p>
                      <p className="whitespace-pre-wrap leading-relaxed text-gray-700 text-right" dir="rtl">{transliteratedTranscript}</p>
                    </div>
                    <div dir="rtl">
                      <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">عربي</p>
                      <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{selectedPodcast.transcript}</p>
                    </div>
                  </div>
                ) : showHebrew && hebrewTranscript ? (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">Original</p>
                      <p className="whitespace-pre-wrap leading-relaxed text-gray-700" dir={selectedPodcast.language === 'arabic' ? 'rtl' : undefined}>{selectedPodcast.transcript}</p>
                    </div>
                    <div dir={selectedPodcast.language === 'italian' ? undefined : 'rtl'}>
                      <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">{selectedPodcast.language === 'italian' ? 'English' : 'עברית'}</p>
                      <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{hebrewTranscript}</p>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed text-gray-700" dir={selectedPodcast.language === 'arabic' ? 'rtl' : undefined}>{selectedPodcast.transcript}</p>
                )
              ) : detailActiveTab === 'grammar' ? (
                <div className="grid gap-4">
                  {(selectedPodcast.grammar_tips || []).map((tip, idx) => (
                    <div key={idx} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                      <h5 className="font-bold text-indigo-700">{tip.pattern}</h5>
                      <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Formula</p><p className="text-sm font-mono text-gray-700">{highlightWords(tip.formula, tip.formulaHighlights)}</p></div>
                      <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">When to use</p><p className="text-sm text-gray-600">{tip.whenToUse}</p></div>
                      <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">From the podcast</p><p className="text-sm italic text-gray-600">"{highlightWords(tip.podcastExample, tip.podcastHighlights)}"</p></div>
                      <div className="space-y-2">{tip.examples.map((ex, i) => (<p key={i} className="text-sm text-gray-700">{highlightWords(ex.sentence, ex.highlights)}</p>))}</div>
                    </div>
                  ))}
                </div>
              ) : detailActiveTab === 'speaking' ? (() => {
                const podLang = selectedPodcast.language || 'english';
                const langHe = podLang === 'spanish' ? 'ספרדית' : podLang === 'french' ? 'צרפתית' : podLang === 'arabic' ? 'ערבית' : podLang === 'turkish' ? 'טורקית' : podLang === 'italian' ? 'איטלקית' : 'אנגלית';
                const isItalianPod = podLang === 'italian';
                const prompt = getSpeakingPrompt(langHe, selectedPodcast.level || '', selectedPodcast.title || '', podLang);
                return (
                  <div className="space-y-5">
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-2">
                      {isItalianPod ? (
                        <>
                          <p className="text-sm font-bold text-indigo-800">How to use this?</p>
                          <p className="text-sm text-indigo-700 leading-relaxed">
                            Copy the prompt below and paste it into an AI tool like <strong>Claude</strong> or <strong>ChatGPT</strong> — tell it about the podcast you listened to, it will ask you questions at the end, and correct your Italian only after you've finished discussing.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-indigo-800">מה זה?</p>
                          <p className="text-sm text-indigo-700 leading-relaxed" dir="rtl">
                            העתק את הפרומפט למטה והדבק אותו לכלי AI כמו <strong>Claude</strong> או <strong>ChatGPT</strong> — ספר לו על הפודקאסט שהאזנת, הוא ישאל אותך שאלות בסוף, ויגיה לך את ה{langHe} רק אחרי שתסיים לדון.
                          </p>
                        </>
                      )}
                    </div>
                    <div className="p-5 bg-white border-2 border-indigo-200 rounded-2xl space-y-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{isItalianPod ? 'Your prompt' : 'הפרומפט שלך'}</p>
                      <p className="text-base text-gray-800 leading-relaxed" dir={isItalianPod ? undefined : 'rtl'}>{prompt}</p>
                      <button onClick={() => copySpeakingPrompt(prompt)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all text-sm">
                        {speakingCopied ? <><Check size={15} /> {isItalianPod ? 'Copied!' : 'הועתק!'}</> : <><Copy size={15} /> {isItalianPod ? 'Copy prompt' : 'העתק פרומפט'}</>}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 text-center" dir={isItalianPod ? undefined : 'rtl'}>{isItalianPod ? 'After copying — open Claude, ChatGPT or any AI assistant and paste it there' : 'לאחר ההעתקה — פתח Claude, ChatGPT או כל עוזר AI אחר והדבק שם'}</p>
                  </div>
                );
              })() : (
                <div className="space-y-4">
                  <h4 className="text-gray-900 font-bold mb-4">Vocabulary & Idioms</h4>
                  <div className="grid gap-3">
                    {(selectedPodcast.vocabulary || '').split('\n').filter(line => line.trim()).map((line, idx) => {
                      const [word, definition] = line.split('=');
                      return (
                        <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100" dir={selectedPodcast.language === 'arabic' ? 'rtl' : undefined}>
                          <span className="font-bold text-indigo-600 block mb-1">{word?.trim()}</span>
                          <span className="text-sm text-gray-600">{definition?.trim()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // CREATE VIEW
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-indigo-100">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 shadow-lg shadow-pink-50">
              <Mic size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Podcasts By Us</h1>
                      </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">

        {/* Mode toggle */}
        <div className="flex p-1 bg-white border border-gray-100 rounded-2xl shadow-sm mb-8 w-fit">
          <button
            onClick={() => { setMode('generate'); setTranscript(''); setAudioUrl(null); setAudioData(null); setSavedId(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === 'generate' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Volume2 size={15} /> Create a podcast
          </button>
          <button
            onClick={() => { setMode('script'); setTranscript(''); setAudioUrl(null); setAudioData(null); setSavedId(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === 'script' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FileText size={15} /> Use My Own Script
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* Left Column: Controls */}
          <div className="md:col-span-5 space-y-8">

            {mode === 'generate' ? (
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Mic size={18} className="text-indigo-600" />
                    Build Your Podcast
                  </h2>
                  <button onClick={() => setView('library')} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl transition-all">
                    <Library size={15} />
                    See My Podcasts{library.length > 0 ? ` (${library.length})` : ''}
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Language toggle */}
                  <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button onClick={() => setLanguage('english')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${language === 'english' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>🇬🇧 English</button>
                    <button onClick={() => setLanguage('spanish')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${language === 'spanish' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>🇪🇸 Spanish</button>
                    <button onClick={() => setLanguage('french')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${language === 'french' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>🇫🇷 French</button>
                    <button onClick={() => setLanguage('arabic')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${language === 'arabic' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>🇸🇾 Arabic</button>
                    <button onClick={() => setLanguage('turkish')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${language === 'turkish' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>🇹🇷 Turkish</button>
                    <button onClick={() => setLanguage('italian')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${language === 'italian' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>🇮🇹 Italian</button>
                  </div>
                  {language === 'arabic' && (
                    <button onClick={() => { setVocabBuilderLanguage('arabic'); setView('vocab-builder'); setVocabTopic(null); setVocabMode('browse'); setShowAlphabet(false); setSelectedLetter(null); }} className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl hover:from-amber-100 hover:to-orange-100 transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🌙</span>
                        <div className="text-left">
                          <p className="text-sm font-bold text-amber-800">Arabic Starter A1 — לומדים ערבית מאפס</p>
                          <p className="text-xs text-amber-600">אלפבית • מילים ראשונות עם הגייה • רשימות נושא • חידון</p>
                        </div>
                      </div>
                      <ArrowLeft size={16} className="text-amber-600 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {language === 'arabic' && (
                    <button onClick={() => { setVocabBuilderLanguage('arabic2'); setView('vocab-builder'); setVocabTopic(null); setVocabMode('browse'); }} className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-300 rounded-2xl hover:from-orange-200 hover:to-amber-200 transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🌟</span>
                        <div className="text-left">
                          <p className="text-sm font-bold text-orange-800">Arabic Level A2 — ערבית שלב ב׳</p>
                          <p className="text-xs text-orange-600">קניות • כיוונים • מזג אוויר • בריאות • ועוד</p>
                        </div>
                      </div>
                      <ArrowLeft size={16} className="text-orange-600 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {language === 'spanish' && (
                    <button onClick={() => { setVocabBuilderLanguage('spanish'); setView('vocab-builder'); setVocabTopic(null); setVocabMode('browse'); }} className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-50 to-yellow-50 border border-red-200 rounded-2xl hover:from-red-100 hover:to-yellow-100 transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🇪🇸</span>
                        <div className="text-left">
                          <p className="text-sm font-bold text-red-800">Spanish Starter A1 — לומדים ספרדית מאפס</p>
                          <p className="text-xs text-red-600">מילים ראשונות עם הגייה • רשימות נושא • חידון</p>
                        </div>
                      </div>
                      <ArrowLeft size={16} className="text-red-500 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {language === 'spanish' && (
                    <button onClick={() => { setVocabBuilderLanguage('spanish2'); setView('vocab-builder'); setVocabTopic(null); setVocabMode('browse'); }} className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-yellow-100 to-red-100 border border-yellow-300 rounded-2xl hover:from-yellow-200 hover:to-red-200 transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🌟</span>
                        <div className="text-left">
                          <p className="text-sm font-bold text-yellow-800">Spanish Level A2 — ספרדית שלב ב׳</p>
                          <p className="text-xs text-yellow-700">קניות • כיוונים • מזג אוויר • בריאות • ועוד</p>
                        </div>
                      </div>
                      <ArrowLeft size={16} className="text-yellow-600 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {language === 'spanish' && (
                    <div className="flex p-1 bg-gray-100 rounded-xl">
                      <button onClick={() => setSpanishDialect('spain')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${spanishDialect === 'spain' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>🇪🇸 Spain</button>
                      <button onClick={() => setSpanishDialect('argentina')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${spanishDialect === 'argentina' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>🇦🇷 Argentina</button>
                    </div>
                  )}
                  {language === 'italian' && (
                    <button onClick={() => { setVocabBuilderLanguage('italian'); setView('vocab-builder'); setVocabTopic(null); setVocabMode('browse'); }} className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-50 to-red-50 border border-green-200 rounded-2xl hover:from-green-100 hover:to-red-100 transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🇮🇹</span>
                        <div className="text-left">
                          <p className="text-sm font-bold text-green-800">Italian Starter A1 — Learn Italian from scratch</p>
                          <p className="text-xs text-green-600">First words with pronunciation • Topic lists • Quiz</p>
                        </div>
                      </div>
                      <ArrowLeft size={16} className="text-green-600 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {language === 'italian' && (
                    <button onClick={() => { setVocabBuilderLanguage('italian2'); setView('vocab-builder'); setVocabTopic(null); setVocabMode('browse'); }} className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-300 rounded-2xl hover:from-emerald-200 hover:to-green-200 transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🌟</span>
                        <div className="text-left">
                          <p className="text-sm font-bold text-emerald-800">Italian Level A2 — Intermediate Italian</p>
                          <p className="text-xs text-emerald-600">Shopping • Directions • Weather • Health • and more</p>
                        </div>
                      </div>
                      <ArrowLeft size={16} className="text-emerald-600 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {language === 'turkish' && (
                    <button onClick={() => { setVocabBuilderLanguage('turkish'); setView('vocab-builder'); setVocabTopic(null); setVocabMode('browse'); }} className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl hover:from-red-100 hover:to-red-200 transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🇹🇷</span>
                        <div className="text-left">
                          <p className="text-sm font-bold text-red-800">Turkish Starter A1 — ללמוד טורקית</p>
                          <p className="text-xs text-red-600">מילים ראשונות עם הגייה • רשימות נושא • חידון</p>
                        </div>
                      </div>
                      <ArrowLeft size={16} className="text-red-600 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {language === 'turkish' && (
                    <button onClick={() => { setVocabBuilderLanguage('turkish2'); setView('vocab-builder'); setVocabTopic(null); setVocabMode('browse'); }} className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-rose-100 to-red-100 border border-rose-300 rounded-2xl hover:from-rose-200 hover:to-red-200 transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🌟</span>
                        <div className="text-left">
                          <p className="text-sm font-bold text-rose-800">Turkish Level A2 — טורקית שלב ב׳</p>
                          <p className="text-xs text-rose-600">קניות • כיוונים • מזג אוויר • בריאות • ועוד</p>
                        </div>
                      </div>
                      <ArrowLeft size={16} className="text-rose-600 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {language === 'french' && (
                    <button onClick={() => { setVocabBuilderLanguage('french'); setView('vocab-builder'); setVocabTopic(null); setVocabMode('browse'); }} className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl hover:from-blue-100 hover:to-blue-200 transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🇫🇷</span>
                        <div className="text-left">
                          <p className="text-sm font-bold text-blue-800">French Starter A1 — ללמוד צרפתית</p>
                          <p className="text-xs text-blue-600">מילים ראשונות עם הגייה • רשימות נושא • חידון</p>
                        </div>
                      </div>
                      <ArrowLeft size={16} className="text-blue-600 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {language === 'french' && (
                    <button onClick={() => { setVocabBuilderLanguage('french2'); setView('vocab-builder'); setVocabTopic(null); setVocabMode('browse'); }} className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-sky-100 to-blue-100 border border-sky-300 rounded-2xl hover:from-sky-200 hover:to-blue-200 transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🌟</span>
                        <div className="text-left">
                          <p className="text-sm font-bold text-sky-800">French Level A2 — צרפתית שלב ב׳</p>
                          <p className="text-xs text-sky-600">קניות • כיוונים • מזג אוויר • בריאות • ועוד</p>
                        </div>
                      </div>
                      <ArrowLeft size={16} className="text-sky-600 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}

                  {/* Podcast / Role Play toggle */}
                  <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button onClick={() => { setContentMode('podcast'); setHostCount('two'); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${contentMode === 'podcast' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>🎙 Podcast</button>
                    <button onClick={() => { setContentMode('roleplay'); setHostCount('two'); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${contentMode === 'roleplay' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>🎭 Role Play</button>
                    <button onClick={() => { setContentMode('phonecall'); setHostCount('two'); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${contentMode === 'phonecall' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>📞 Phone Call</button>
                  </div>

                  {contentMode === 'roleplay' || contentMode === 'phonecall' ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-600">Scenario</label>
                        <button
                          type="button"
                          onClick={() => setSubject(pickRandom(ROLEPLAY_SCENARIOS))}
                          className="text-xs font-bold text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all"
                        >
                          🎲 Surprise me
                        </button>
                      </div>
                      <textarea autoFocus placeholder="e.g. A job interview at a tech company. One speaker is the interviewer, the other is a nervous candidate applying for their first job..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[100px] resize-none" value={subject} onChange={(e) => setSubject(e.target.value)} />
                    </div>
                  ) : (
                  <>
                  <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button onClick={() => setSourceType('subject')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${sourceType === 'subject' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Type a Topic</button>
                    <button onClick={() => setSourceType('article')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${sourceType === 'article' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Add Article</button>
                  </div>

                  {sourceType === 'subject' ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Topic</label>
                      <input autoFocus type="text" placeholder="e.g. The history of jazz, Quantum computing..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={subject} onChange={(e) => setSubject(e.target.value)} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <button onClick={() => setArticleSourceType('text')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${articleSourceType === 'text' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600'}`}>Paste Text</button>
                        <button onClick={() => setArticleSourceType('url')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${articleSourceType === 'url' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600'}`}>Article URL</button>
                      </div>
                      {articleSourceType === 'text' ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Article 1 Text</label>
                            <textarea placeholder="Paste your first article content here..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[120px] resize-none" value={articleText} onChange={(e) => setArticleText(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Article 2 Text (Optional)</label>
                            <textarea placeholder="Paste your second article content here..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[120px] resize-none" value={articleText2} onChange={(e) => setArticleText2(e.target.value)} />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Article 1 URL</label>
                            <input type="url" placeholder="https://example.com/article-1" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={articleUrl} onChange={(e) => setArticleUrl(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Article 2 URL (Optional)</label>
                            <input type="url" placeholder="https://example.com/article-2" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={articleUrl2} onChange={(e) => setArticleUrl2(e.target.value)} />
                          </div>
                          <p className="text-[10px] text-gray-400 italic px-1">Tip: Use direct links instead of shortened "share" links for better results.</p>
                        </div>
                      )}
                    </div>
                  )}
                  </>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Include specific words (optional)</label>
                    <input type="text" placeholder="e.g. innovation, synergy, paradigm shift..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={specificWords} onChange={(e) => setSpecificWords(e.target.value)} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-1"><Gauge size={14} /> Speech Speed</label>
                      <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">{speechSpeed}%</span>
                    </div>
                    <input type="range" min="80" max="100" step="5" value={speechSpeed} onChange={(e) => setSpeechSpeed(parseInt(e.target.value))} className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 font-medium px-1">
                      <span>80%</span><span>85%</span><span>90%</span><span>95%</span><span>100%</span>
                    </div>
                  </div>

                  {contentMode === 'podcast' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1"><Users size={14} /> Narrators</label>
                    <div className="flex bg-gray-100 rounded-xl p-1">
                      <button onClick={() => setHostCount('one')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${hostCount === 'one' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>One Host</button>
                      <button onClick={() => setHostCount('two')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${hostCount === 'two' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Two Hosts</button>
                    </div>
                  </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-1"><Clock size={14} /> Length</label>
                      <span className="text-sm font-bold text-indigo-600">{length} min</span>
                    </div>
                    <input type="range" min="1" max="6" step="1" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" value={length} onChange={(e) => setLength(parseInt(e.target.value))} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1"><BarChart size={14} /> {language === 'spanish' ? 'Spanish' : language === 'french' ? 'French' : language === 'arabic' ? 'Arabic' : language === 'turkish' ? 'Turkish' : language === 'italian' ? 'Italian' : 'English'} Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {LEVELS.map((l) => (
                        <button key={l.id} onClick={() => setLevel(l.id)} className={`py-2 rounded-lg text-sm font-medium transition-all ${level === l.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{l.label}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || (contentMode === 'roleplay' || contentMode === 'phonecall' ? !subject.trim() : (sourceType === 'subject' ? !subject.trim() : (articleSourceType === 'text' ? !articleText.trim() : !articleUrl.trim())))}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-100"
                >
                  {isGenerating ? (<><Loader2 className="animate-spin" size={20} /><span>Generating...{genElapsed > 0 ? ` ${formatElapsed(genElapsed)}` : ''}</span></>) : (<><Volume2 size={20} />{contentMode === 'phonecall' ? 'Create Phone Call' : contentMode === 'roleplay' ? 'Create Role Play' : 'Create Podcast'}</>)}
                </button>
              </section>
            ) : (
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" />
                  Use My Own Script
                </h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Title <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. My roleplay conversation..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={scriptTitle}
                      onChange={(e) => setScriptTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1"><Users size={14} /> Speakers</label>
                    <div className="flex bg-gray-100 rounded-xl p-1">
                      <button onClick={() => setScriptHostCount('one')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${scriptHostCount === 'one' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>One Speaker</button>
                      <button onClick={() => setScriptHostCount('two')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${scriptHostCount === 'two' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Two Speakers</button>
                    </div>
                    {scriptHostCount === 'two' && (
                      <p className="text-[10px] text-gray-400 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">
                        Format each line with the speaker name:<br />
                        <span className="font-mono text-indigo-500">Alex: Hello, how are you?</span><br />
                        <span className="font-mono text-indigo-500">Sam: I'm doing great, thanks!</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Paste your script</label>
                    <textarea
                      placeholder={scriptHostCount === 'two'
                        ? "Alex: Welcome to the show!\nSam: Thanks for having me.\nAlex: Today we're talking about..."
                        : "Paste your transcript here..."}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[200px] resize-none font-mono text-sm"
                      value={scriptText}
                      onChange={(e) => setScriptText(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-1"><Gauge size={14} /> Speech Speed</label>
                      <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">{scriptSpeed}%</span>
                    </div>
                    <input type="range" min="80" max="100" step="5" value={scriptSpeed} onChange={(e) => setScriptSpeed(parseInt(e.target.value))} className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 font-medium px-1">
                      <span>80%</span><span>85%</span><span>90%</span><span>95%</span><span>100%</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleScriptGenerate}
                  disabled={isGenerating || !scriptText.trim()}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-100"
                >
                  {isGenerating ? (<><Loader2 className="animate-spin" size={20} /><span>Generating...{genElapsed > 0 ? ` ${formatElapsed(genElapsed)}` : ''}</span></>) : (<><Volume2 size={20} />Read My Own Script</>)}
                </button>
              </section>
            )}
          </div>

          {/* Right Column: Output */}
          <div className="md:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              {!transcript && !isGenerating ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400">
                  {mode === 'generate' ? (
                    <>
                      <Mic size={48} className="mb-4 text-pink-200" />
                      <p className="text-lg font-medium">Your podcast will appear here</p>
                      <p className="text-sm">Enter a subject and click generate to start</p>
                    </>
                  ) : (
                    <>
                      <FileText size={48} className="mb-4 text-indigo-200" />
                      <p className="text-lg font-medium">Audio will appear here</p>
                      <p className="text-sm">Paste your script and click Read My Own Script</p>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                  {isGenerating && transcript && !audioUrl && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 flex items-center gap-3 text-indigo-700 text-sm font-medium">
                      <Loader2 size={16} className="animate-spin shrink-0" />
                      <span>Recording audio...{genElapsed > 0 ? ` ${formatElapsed(genElapsed)}` : ''}</span>
                    </div>
                  )}
                  {audioUrl && (
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <button onClick={togglePlay} className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 shrink-0">
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
                      </button>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex justify-between items-center gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{generatedTitle}</p>
                            {generatedTitleEn && <p className="text-xs text-gray-400 truncate">{generatedTitleEn}</p>}
                          </div>
                          {mode === 'generate' && <p className="text-[10px] font-medium text-gray-400 whitespace-nowrap">Level {LEVELS.find(l => l.id === level)?.label}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-gray-400 w-7 tabular-nums">{formatTime(currentTime)}</span>
                          <input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleSeek} className="flex-1 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                          <span className="text-[10px] text-gray-400 w-7 tabular-nums">{formatTime(duration)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={handleSave} disabled={isSaving || !!savedId} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${savedId ? 'text-green-600 bg-green-50' : 'text-indigo-600 hover:bg-indigo-50'}`} title="Save to Library">
                          {isSaving ? <Loader2 className="animate-spin" size={16} /> : savedId ? <><Check size={16} />Saved</> : <><Save size={16} />Save</>}
                        </button>
                        <button onClick={handleShare} disabled={isSharing} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all" title="Share to WhatsApp">
                          {isSharing ? <Loader2 className="animate-spin" size={18} /> : (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          )}
                        </button>
                        <a href={audioUrl} download={`Podcast-${generatedTitle.replace(/\s+/g, '-')}.wav`} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Download">
                          <Download size={18} />
                        </a>
                      </div>
                      <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)} onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)} className="hidden" />
                    </div>
                  )}

                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[600px]">
                    <div className="p-2 border-b border-gray-100 bg-gray-50/50 space-y-1">
                      <div className="flex gap-1 flex-wrap items-center justify-between">
                        <div className="flex gap-1 flex-wrap">
                          <button onClick={() => setActiveTab('transcript')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'transcript' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Transcript</button>
                          {vocabularyChart && (
                            <button onClick={() => setActiveTab('vocabulary')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'vocabulary' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Vocabulary Chart</button>
                          )}
                          {mode === 'generate' && (
                            <button onClick={() => setActiveTab('grammar')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'grammar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Grammar Tips</button>
                          )}
                          <button onClick={() => setActiveTab('speaking')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'speaking' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>🎙️ Speaking Practice</button>
                        </div>
                        {vocabularyChart && level && (
                          <button onClick={handleGenerateWorksheet} disabled={isGeneratingWorksheet} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-green-600 text-white rounded-full hover:bg-green-700 shadow-sm disabled:opacity-50 transition-all">
                            {isGeneratingWorksheet ? <><Loader2 size={13} className="animate-spin" />Generating...</> : <>📄 Worksheet</>}
                          </button>
                        )}
                      </div>
                      {activeTab === 'transcript' && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <button onClick={copyToClipboard} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-full transition-all">
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied' : 'Copy Transcript'}
                          </button>
                          {transcript && (
                            <button onClick={() => shareViaWhatsApp(transcript, `transcript-${generatedTitle || 'podcast'}.txt`)} className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-full transition-all">
                              💬 WhatsApp
                            </button>
                          )}
                          {transcript && (
                            <button onClick={() => handleToggleHebrew()} disabled={isTranslatingHebrew} className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-full transition-all disabled:opacity-50">
                              {isTranslatingHebrew ? <><Loader2 size={14} className="animate-spin" /> Translating...</> : <>{showHebrew ? (language === 'italian' ? '✕ Hide English' : '✕ Hide Hebrew') : (language === 'italian' ? '🇬🇧 English' : '🇮🇱 Hebrew')}</>}
                            </button>
                          )}
                          {language === 'arabic' && (level === 'A1' || level === 'A2' || level === 'B1') && transcript && (
                            <button onClick={handleToggleTransliteration} disabled={isTransliterating} className="flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-full transition-all disabled:opacity-50">
                              {isTransliterating ? <><Loader2 size={14} className="animate-spin" /> Transliterating...</> : <>{showTransliteration ? '✕ Hide Transliteration' : '🔤 Transliteration'}</>}
                            </button>
                          )}
                        </div>
                      )}
                      {activeTab === 'vocabulary' && (
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <button onClick={copyVocabToClipboard} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-full transition-all">
                            {vocabCopied ? <Check size={14} /> : <Copy size={14} />}
                            {vocabCopied ? 'Copied' : 'Copy Chart'}
                          </button>
                          {vocabularyChart && (
                            <button onClick={() => shareViaWhatsApp(vocabularyChart, `vocabulary-${generatedTitle || 'podcast'}.txt`)} className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-full transition-all">
                              💬 WhatsApp
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="p-8 overflow-y-auto prose prose-indigo max-w-none">
                      {isGenerating && !transcript ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium mb-4">
                            <Loader2 size={15} className="animate-spin shrink-0" />
                            <span>Writing script...{genElapsed > 0 ? ` ${formatElapsed(genElapsed)}` : ''}</span>
                          </div>
                          <div className="space-y-3 animate-pulse">
                            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-100 rounded w-full"></div>
                            <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                          </div>
                        </div>
                      ) : activeTab === 'transcript' ? (
                        (() => {
                          const parts = transcript.split('\n\n\n');
                          const hasHeader = parts.length >= 2;
                          const header = hasHeader ? parts[0] : '';
                          const body = hasHeader ? parts.slice(1).join('\n\n\n') : transcript;
                          return (
                            <div>
                              {hasHeader && (
                                <div className="mb-4 pb-3 border-b border-indigo-100">
                                  {header.split('\n').map((line, i) => (
                                    <p key={i} className="font-bold text-indigo-700 leading-snug">{line}</p>
                                  ))}
                                  {generatedTitleEn && <p className="text-sm text-gray-400 mt-1">{generatedTitleEn}</p>}
                                </div>
                              )}
                              {showTransliteration && transliteratedTranscript ? (
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">טרנסליטרציה</p>
                                    <p className="whitespace-pre-wrap leading-relaxed text-gray-700 text-right" dir="rtl">{transliteratedTranscript}</p>
                                  </div>
                                  <div dir="rtl">
                                    <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">عربي</p>
                                    <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{body}</p>
                                  </div>
                                </div>
                              ) : showHebrew && hebrewTranscript ? (
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">Original</p>
                                    <p className="whitespace-pre-wrap leading-relaxed text-gray-700" dir={language === 'arabic' ? 'rtl' : undefined}>{body}</p>
                                  </div>
                                  <div dir={language === 'italian' ? undefined : 'rtl'}>
                                    <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">{language === 'italian' ? 'English' : 'עברית'}</p>
                                    <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{hebrewTranscript}</p>
                                  </div>
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap leading-relaxed text-gray-700" dir={language === 'arabic' ? 'rtl' : undefined}>{body}</p>
                              )}
                            </div>
                          );
                        })()
                      ) : activeTab === 'vocabulary' ? (
                        <div className="space-y-4">
                          <h4 className="text-gray-900 font-bold mb-4">Vocabulary & Idioms</h4>
                          <div className="grid gap-3">
                            {vocabularyChart.split('\n').filter(line => line.trim()).map((line, idx) => {
                              const [word, definition] = line.split('=');
                              return (
                                <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100" dir={language === 'arabic' ? 'rtl' : undefined}>
                                  <span className="font-bold text-indigo-600 block mb-1">{word?.trim()}</span>
                                  <span className="text-sm text-gray-600">{definition?.trim()}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : activeTab === 'speaking' ? (() => {
                        const langHe = language === 'spanish' ? 'ספרדית' : language === 'french' ? 'צרפתית' : language === 'arabic' ? 'ערבית' : language === 'turkish' ? 'טורקית' : language === 'italian' ? 'איטלקית' : 'אנגלית';
                        const isItalianPod = language === 'italian';
                        const prompt = getSpeakingPrompt(langHe, level, generatedTitle || (isItalianPod ? 'the podcast' : 'הפודקאסט'), language);
                        return (
                          <div className="space-y-5">
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-2">
                              {isItalianPod ? (
                                <>
                                  <p className="text-sm font-bold text-indigo-800">How to use this?</p>
                                  <p className="text-sm text-indigo-700 leading-relaxed">
                                    Copy the prompt below and paste it into an AI tool like <strong>Claude</strong> or <strong>ChatGPT</strong> — tell it about the podcast you listened to, it will ask you questions at the end, and correct your Italian only after you've finished discussing.
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm font-bold text-indigo-800">מה זה?</p>
                                  <p className="text-sm text-indigo-700 leading-relaxed" dir="rtl">
                                    העתק את הפרומפט למטה והדבק אותו לכלי AI כמו <strong>Claude</strong> או <strong>ChatGPT</strong> — ספר לו על הפודקאסט שהאזנת, הוא ישאל אותך שאלות בסוף, ויגיה לך את ה{langHe} רק אחרי שתסיים לדון.
                                  </p>
                                </>
                              )}
                            </div>
                            <div className="p-5 bg-white border-2 border-indigo-200 rounded-2xl space-y-4">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{isItalianPod ? 'Your prompt' : 'הפרומפט שלך'}</p>
                              <p className="text-base text-gray-800 leading-relaxed" dir={isItalianPod ? undefined : 'rtl'}>{prompt}</p>
                              <button onClick={() => copySpeakingPrompt(prompt)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all text-sm">
                                {speakingCopied ? <><Check size={15} /> {isItalianPod ? 'Copied!' : 'הועתק!'}</> : <><Copy size={15} /> {isItalianPod ? 'Copy prompt' : 'העתק פרומפט'}</>}
                              </button>
                            </div>
                            <p className="text-xs text-gray-400 text-center" dir={isItalianPod ? undefined : 'rtl'}>{isItalianPod ? 'After copying — open Claude, ChatGPT or any AI assistant and paste it there' : 'לאחר ההעתקה — פתח Claude, ChatGPT או כל עוזר AI אחר והדבק שם'}</p>
                          </div>
                        );
                      })() : (
                        <div className="space-y-4">
                          <h4 className="text-gray-900 font-bold mb-4">Grammar Tips</h4>
                          {isGeneratingGrammar ? (
                            <div className="flex items-center gap-2 text-sm text-indigo-500 font-medium">
                              <Loader2 size={15} className="animate-spin shrink-0" />
                              <span>Generating grammar tips...</span>
                            </div>
                          ) : grammarTips.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">Grammar tips will appear after generating a podcast.</p>
                          ) : (
                            <div className="grid gap-4">
                              {grammarTips.map((tip, idx) => (
                                <div key={idx} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                                  <p className="font-bold text-base text-gray-900">{tip.pattern}</p>
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Formula</p>
                                    <p className="text-sm font-mono text-gray-700">{highlightWords(tip.formula, tip.formulaHighlights)}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">When to use it</p>
                                    <p className="text-sm text-gray-600">{tip.whenToUse}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">From the podcast</p>
                                    <p className="text-sm text-gray-700 italic">"{highlightWords(tip.podcastExample, tip.podcastHighlights)}"</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Examples</p>
                                    <div className="space-y-1">
                                      {tip.examples.map((ex, ei) => (
                                        <p key={ei} className="text-sm text-gray-700">
                                          {ex.type === 'positive' && <span style={{ color: '#16a34a', fontWeight: 600, marginRight: 6 }}>+</span>}
                                          {ex.type === 'negative' && <span style={{ color: '#dc2626', fontWeight: 600, marginRight: 6 }}>−</span>}
                                          {ex.type === 'question' && <span style={{ color: '#d97706', fontWeight: 600, marginRight: 6 }}>?</span>}
                                          {highlightWords(ex.sentence, ex.highlights)}
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
