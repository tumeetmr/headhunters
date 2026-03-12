export const locales = ["en", "mn"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

const translations = {
  en: {
    // Navbar
    "nav.home": "Home",
    "nav.jobs": "Job & Projects",
    "nav.applications": "My Applications",
    "nav.headhunting": "Headhunting",
    "nav.language": "English",

    // Hero
    "hero.title.1": "Recruiting software that",
    "hero.title.2": "helps you ",
    "hero.title.highlight": "hire faster",
    "hero.title.3": " for free",
    "hero.description":
      "Attract great talent to your open roles to take your business to the next level. Build, promote and manage your jobs with our free to use recruitment software.",
    "hero.cta": "Get Started Free",
    "hero.learn": "Learn more",

    // Recruiters
    "recruiters.title": "Our Expert Recruiters",
    "recruiters.subtitle":
      "Meet our team of industry specialists dedicated to finding your perfect match",
    "recruiters.loading": "Loading...",
    "recruiters.error": "Failed to load recruiters.",
    "recruiters.notFound": "Recruiter not found.",

    // Recruiter detail
    "recruiter.back": "Back",
    "recruiter.backHome": "← Back to home",
    "recruiter.about": "About",
    "recruiter.expertise": "Expertise",
    "recruiter.industries": "Industries",
    "recruiter.languages": "Languages",
    "recruiter.certifications": "Certifications",
    "recruiter.skills": "Skills",
    "recruiter.email": "Email",
    "recruiter.call": "Call",
    "recruiter.yrsExperience": "yrs experience",
    "recruiter.insights": "Insights",

    // Steps
    "steps.title": "Talent verification 4 steps",
    "steps.subtitle": "We prioritize skills, professionalism, focus on practical abilities, and ensure all talents are rigorously screened and validated to meet today's business needs.",
    "steps.step1.title": "Client's Needs",
    "steps.step1.time": "Estimated Time: ~24 hours*",
    "steps.step2.title": "Talent Evaluation and Shortlistings",
    "steps.step2.time": "Estimated Time: ~24 hours*",
    "steps.step3.title": "Interviewing and Evaluation",
    "steps.step3.time": "Estimated Time: 3-5 days",
    "steps.step4.title": "Offer/Contract Negotiation",
    "steps.step4.time": "Estimated Time: 3-5 days",

    // Footer
    "footer.home": "Home page",
    "footer.about": "About",
    "footer.features": "Features",
    "footer.pricing": "Pricing",
    "footer.contact": "Contact",
    "footer.reviews": "Reviews",
    "footer.copyright": "© 2024 Lambda. All rights reserved",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
  },
  mn: {
    // Navbar
    "nav.home": "Нүүр",
    "nav.jobs": "Ажил & Төслүүд",
    "nav.applications": "Миний өргөдлүүд",
    "nav.headhunting": "Headhunting",
    "nav.language": "Монгол",

    // Hero
    "hero.title.1": "Бид таньд илүү хурдан",
    "hero.title.2": "",
    "hero.title.highlight": "ажилд авах",
    "hero.title.3": " боломжийг олгоно",
    "hero.description": "Бид танд зөвхөн шилдэг талентуудыг санал болгоно Таны цагийг хэмнэж, зардлыг бууруулж, бүтээмжийг тань ихэсгэе!",
    "hero.cta": "Талент захиалах",
    "hero.learn": "Дэлгэрэнгүй",

    // Recruiters
    "recruiters.title": "Манай мэргэжилтнүүд",
    "recruiters.subtitle":
      "Танд тохирсон ажилтныг олоход зориулагдсан манай мэргэжилтнүүдтэй танилцаарай",
    "recruiters.loading": "Ачаалж байна...",
    "recruiters.error": "Мэдээлэл ачаалахад алдаа гарлаа.",
    "recruiters.notFound": "Рекрутер олдсонгүй.",

    // Recruiter detail
    "recruiter.back": "Буцах",
    "recruiter.backHome": "← Нүүр хуудас руу буцах",
    "recruiter.about": "Тухай",
    "recruiter.expertise": "Мэргэшил",
    "recruiter.industries": "Салбарууд",
    "recruiter.languages": "Хэлүүд",
    "recruiter.certifications": "Гэрчилгээ",
    "recruiter.skills": "Ур чадвар",
    "recruiter.email": "Имэйл",
    "recruiter.call": "Залгах",
    "recruiter.yrsExperience": "жил туршлага",
    "recruiter.insights": "Медиа",

    // Steps
    "steps.title": "Талент баталгаажуулалтын 4 алхам",
    "steps.subtitle": "Бид ур чадвар, мэргэжлийн ёс зүй, практик чадварт анхаарч, бүх талентуудыг өнөөгийн бизнесийн хэрэгцээнд нийцүүлэн нягт шалгаж баталгаажуулдаг.",
    "steps.step1.title": "Үйлчлүүлэгчийн хэрэгцээ",
    "steps.step1.time": "Хугацаа: ~24 цаг*",
    "steps.step2.title": "Талент үнэлгээ ба жагсаалт",
    "steps.step2.time": "Хугацаа: ~24 цаг*",
    "steps.step3.title": "Ярилцлага ба үнэлгээ",
    "steps.step3.time": "Хугацаа: 3-5 хоног",
    "steps.step4.title": "Санал/Гэрээ хэлэлцээр",
    "steps.step4.time": "Хугацаа: 3-5 хоног",

    // Footer
    "footer.home": "Нүүр хуудас",
    "footer.about": "Бидний тухай",
    "footer.features": "Онцлогууд",
    "footer.pricing": "Үнийн мэдээлэл",
    "footer.contact": "Холбоо барих",
    "footer.reviews": "Сэтгэгдлүүд",
    "footer.copyright": "© 2024 Ламбда. Бүх эрх хуулиар хамгаалагдсан",
    "footer.privacy": "Нууцлалын бодлого",
    "footer.terms": "Үйлчилгээний нөхцөл",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

export function getTranslations(locale: Locale) {
  return translations[locale];
}
