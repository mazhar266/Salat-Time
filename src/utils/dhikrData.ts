/**
 * Authentic Dhikr and Dua Library with Post-Prayer Personalization & Daily Tracker
 */

export interface DhikrItem {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  benefit?: string;
  reference: string;
  targetCount: number;
  category: 'after_prayer' | 'morning' | 'evening' | 'daily' | 'quranic' | 'hardship' | 'names_of_allah';
  assignedPrayers?: ('fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'all')[];
  isCustom?: boolean;
}

export interface DhikrSessionProgress {
  dhikrId: string;
  currentCount: number;
  targetCount: number;
  completed: boolean;
  lastUpdated: string;
}

export interface DailyRecitationRecord {
  date: string; // YYYY-MM-DD
  totalRecitations: number;
  completedDhikrsCount: number;
  dhikrCounts: Record<string, number>;
}

export const INITIAL_DHIRK_LIBRARY: DhikrItem[] = [
  // --- Post Prayer Sunnah Routine ---
  {
    id: 'post-istighfar',
    title: 'Seeking Forgiveness (Istighfar)',
    arabic: 'أَسْتَغْفِرُ اللهَ، أَسْتَغْفِرُ اللهَ، أَسْتَغْفِرُ اللهَ',
    transliteration: "Astaghfirullah, Astaghfirullah, Astaghfirullah",
    translation: 'I seek forgiveness from Allah (3 times).',
    benefit: 'The Prophet (peace be upon him) would recite this immediately after finishing the obligatory prayer.',
    reference: 'Sahih Muslim 591',
    targetCount: 3,
    category: 'after_prayer',
    assignedPrayers: ['all']
  },
  {
    id: 'post-salam',
    title: 'Dua of Peace (Antas-Salam)',
    arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    transliteration: "Allahumma antas-salamu wa minkas-salam, tabarakta ya dhal-jalali wal-ikram",
    translation: 'O Allah, You are Peace, and from You comes peace. Blessed are You, O Owner of majesty and honor.',
    benefit: 'Recited immediately after Istighfar following obligatory prayers.',
    reference: 'Sahih Muslim 592',
    targetCount: 1,
    category: 'after_prayer',
    assignedPrayers: ['all']
  },
  {
    id: 'post-ayat-kursi',
    title: 'Ayat al-Kursi (The Throne Verse)',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: "Allahu la ilaha illa Huwal-Hayyul-Qayyum. La ta'khudhuhu sinatun wa la nawm. Lahu ma fis-samawati wa ma fil-ard...",
    translation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep...',
    benefit: 'Whoever recites Ayat al-Kursi after every obligatory prayer, nothing stands between him and entering Paradise except death.',
    reference: 'Sunan an-Nasa’i, Sahih by Al-Albani',
    targetCount: 1,
    category: 'after_prayer',
    assignedPrayers: ['all']
  },
  {
    id: 'post-subhanallah',
    title: 'SubhanAllah (Glory be to Allah)',
    arabic: 'سُبْحَانَ اللهِ',
    transliteration: 'SubhanAllah',
    translation: 'Glory be to Allah and exalted is He.',
    benefit: 'Cleanses the heart and weighs heavy on the scales of good deeds.',
    reference: 'Sahih Muslim 597',
    targetCount: 33,
    category: 'after_prayer',
    assignedPrayers: ['all']
  },
  {
    id: 'post-alhamdulillah',
    title: 'Alhamdulillah (Praise be to Allah)',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise and gratitude belong exclusively to Allah.',
    benefit: 'The best supplication is Alhamdulillah. It fills the divine scale.',
    reference: 'Sahih Muslim 597',
    targetCount: 33,
    category: 'after_prayer',
    assignedPrayers: ['all']
  },
  {
    id: 'post-allahu-akbar',
    title: 'Allahu Akbar (Allah is the Greatest)',
    arabic: 'اللهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest, supreme above everything.',
    benefit: 'Fulfills the 99 tasbeeh sequence after prayer.',
    reference: 'Sahih Muslim 597',
    targetCount: 33,
    category: 'after_prayer',
    assignedPrayers: ['all']
  },
  {
    id: 'post-tahlil-complete',
    title: 'Seal of the 100th Tasbeeh (Tahlil)',
    arabic: 'لَا إِلَٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir",
    translation: 'None has the right to be worshipped except Allah alone, without partner. To Him belongs all sovereignty and praise, and He has power over all things.',
    benefit: 'Completes 100 dhikrs; sins are forgiven even if they are like the foam of the sea.',
    reference: 'Sahih Muslim 597',
    targetCount: 1,
    category: 'after_prayer',
    assignedPrayers: ['all']
  },
  {
    id: 'post-muawwidhat',
    title: 'Surahs of Protection (Al-Ikhlas, Al-Falaq, An-Nas)',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۞ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۞ قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    transliteration: "Qul Huwallahu Ahad, Qul A'udhu bi Rabbil-Falaq, Qul A'udhu bi Rabbin-Nas",
    translation: 'Surah Al-Ikhlas, Surah Al-Falaq, and Surah An-Nas.',
    benefit: 'Recite once after Dhuhr, Asr, and Isha, and three times after Fajr and Maghrib for divine protection.',
    reference: 'Sunan Abi Dawud 1523',
    targetCount: 3,
    category: 'after_prayer',
    assignedPrayers: ['fajr', 'maghrib']
  },
  {
    id: 'post-fajr-protection',
    title: 'Protection after Fajr & Maghrib',
    arabic: 'لَا إِلَٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu, yuhyi wa yumitu, wa huwa 'ala kulli shay'in qadir",
    translation: 'None has the right to be worshipped except Allah alone... He gives life and causes death, and He is over all things competent (10 times).',
    benefit: 'Whoever recites it 10 times after Fajr and Maghrib before speaking, 10 good deeds are written, 10 sins erased, and shielded from Satan.',
    reference: 'Jami` at-Tirmidhi 3474',
    targetCount: 10,
    category: 'after_prayer',
    assignedPrayers: ['fajr', 'maghrib']
  },
  {
    id: 'post-fajr-knowledge',
    title: 'Dua for Beneficial Knowledge & Provision',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    transliteration: "Allahumma inni as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan",
    translation: 'O Allah, I ask You for beneficial knowledge, wholesome provision, and accepted deeds.',
    benefit: 'The Prophet (peace be upon him) recited this after the Salam of the Fajr prayer.',
    reference: 'Sunan Ibn Majah 925',
    targetCount: 1,
    category: 'after_prayer',
    assignedPrayers: ['fajr']
  },

  // --- Morning & Evening Adhkar ---
  {
    id: 'sayyidul-istighfar',
    title: 'The Master of Forgiveness (Sayyidul Istighfar)',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliteration: "Allahumma anta Rabbi la ilaha illa ant, khalaqtani wa ana 'abduk...",
    translation: 'O Allah, You are my Lord; there is no god but You. You created me and I am Your servant...',
    benefit: 'Whoever says it with conviction during the morning or evening and dies that day will enter Paradise.',
    reference: 'Sahih al-Bukhari 6306',
    targetCount: 1,
    category: 'morning'
  },
  {
    id: 'morning-bismillah',
    title: 'Shield in the Name of Allah',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: "Bismillahilladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa huwas-Sami'ul-'Alim",
    translation: 'In the name of Allah, with Whose name nothing can cause harm in earth nor in the heavens, and He is the All-Hearing, All-Knowing.',
    benefit: 'Nothing will harm the person who recites it 3 times morning and evening.',
    reference: 'Sunan Abi Dawud 5088',
    targetCount: 3,
    category: 'morning'
  },
  {
    id: 'subhanallahi-wa-bihamdihi',
    title: 'SubhanAllahi wa bihamdihi (100 times)',
    arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
    transliteration: 'SubhanAllahi wa bi-hamdih',
    translation: 'Glory be to Allah and all praise is for Him.',
    benefit: 'Recited 100 times daily; sins will be forgiven even if they are like the foam of the sea.',
    reference: 'Sahih Muslim 2691',
    targetCount: 100,
    category: 'daily'
  },
  {
    id: 'hardship-yunus',
    title: 'Dua of Prophet Yunus (In Distress)',
    arabic: 'لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin",
    translation: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
    benefit: 'No Muslim suppliant ever supplicates with this during hardship except that Allah answers him.',
    reference: 'Quran 21:87 / Jami` at-Tirmidhi 3505',
    targetCount: 33,
    category: 'hardship'
  },
  {
    id: 'quranic-hasbuna',
    title: 'Allah is Sufficient for Us',
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    transliteration: "Hasbunallahu wa ni'mal-wakil",
    translation: 'Allah is sufficient for us, and He is the best Disposer of affairs.',
    benefit: 'Said by Prophet Ibrahim (AS) and Prophet Muhammad (peace be upon him) during great tests.',
    reference: 'Quran 3:173 / Sahih al-Bukhari 4563',
    targetCount: 33,
    category: 'quranic'
  },
  {
    id: 'salawat-prophet',
    title: 'Blessings upon the Prophet (peace be upon him) (Salawat)',
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ',
    transliteration: "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad",
    translation: 'O Allah, send blessings upon Muhammad and upon the family of Muhammad.',
    benefit: 'Whoever sends blessings upon me once, Allah sends blessings upon him tenfold.',
    reference: 'Sahih Muslim 408',
    targetCount: 10,
    category: 'daily'
  }
];

export const INITIAL_DHIKR_LIBRARY = INITIAL_DHIRK_LIBRARY;

export const STORAGE_KEYS = {
  DHIKR_LIBRARY: 'noorsalat_dhikr_library_v1',
  POST_PRAYER_PLAYLIST: 'noorsalat_post_prayer_playlist_v1',
  DAILY_RECORDS: 'noorsalat_daily_records_v1',
  ACTIVE_SESSION: 'noorsalat_active_session_v1',
  SETTINGS: 'noorsalat_user_settings_v1'
};

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
