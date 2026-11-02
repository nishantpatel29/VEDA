// Optional depth for individual pages, keyed by work and page id.
// verse: original Sanskrit (Devanagari), iast: Roman transliteration, ref: where it is in Valmiki.
// meaning / why / context: per language, English is the fallback.
// Verse numbers follow the common Gita Press numbering; other editions differ slightly.
// Have a Sanskrit scholar review verses before publishing.

var PAGE_EXTRAS = {
  ramayana: {
    "q-man": {
      verse: "तपःस्वाध्यायनिरतं तपस्वी वाग्विदां वरम्।\nनारदं परिपप्रच्छ वाल्मीकिर्मुनिपुङ्गवम्॥",
      iast: "tapaḥ-svādhyāya-nirataṃ tapasvī vāg-vidāṃ varam |\nnāradaṃ paripapraccha vālmīkir muni-puṅgavam ||",
      ref: "Bala Kanda 1.1",
      meaning: {
        en: "Valmiki the ascetic questioned Narada, devoted to austerity and study, finest of speakers and foremost of sages.",
        hi: "तपस्वी वाल्मीकि ने तप और स्वाध्याय में लीन, वाणी-विदों में श्रेष्ठ, मुनिश्रेष्ठ नारद से प्रश्न किया।"
      },
      why: {
        en: "These are the first words of the Ramayana, composed around 2,500 years ago. The epic opens not with a battle but with a question: what does a good life look like?",
        hi: "ये रामायण के पहले शब्द हैं, लगभग ढाई हज़ार वर्ष पुराने। काव्य युद्ध से नहीं, एक प्रश्न से आरंभ होता है: अच्छा जीवन कैसा होता है?"
      }
    },
    "virtues": {
      verse: "को न्वस्मिन्साम्प्रतं लोके गुणवान्कश्च वीर्यवान्।\nधर्मज्ञश्च कृतज्ञश्च सत्यवाक्यो दृढव्रतः॥",
      iast: "ko nv asmin sāmprataṃ loke guṇavān kaś ca vīryavān |\ndharmajñaś ca kṛtajñaś ca satya-vākyo dṛḍha-vrataḥ ||",
      ref: "Bala Kanda 1.2",
      meaning: {
        en: "Who in this world today is virtuous, and who is valiant? Who knows dharma, remembers kindness, speaks truth, and keeps his vows?",
        hi: "इस समय संसार में गुणवान और पराक्रमी कौन है? धर्म को जानने वाला, कृतज्ञ, सत्यवादी और दृढ़व्रती कौन है?"
      },
      why: {
        en: "Valmiki's list became a shared idea of character across South and Southeast Asia: courage joined with honesty, gratitude and self-control.",
        hi: "वाल्मीकि की यह सूची दक्षिण और दक्षिण-पूर्व एशिया में चरित्र का साझा आदर्श बनी: साहस के साथ सत्य, कृतज्ञता और संयम।"
      }
    },
    "shloka": {
      verse: "मा निषाद प्रतिष्ठां त्वमगमः शाश्वतीः समाः।\nयत्क्रौञ्चमिथुनादेकमवधीः काममोहितम्॥",
      iast: "mā niṣāda pratiṣṭhāṃ tvam agamaḥ śāśvatīḥ samāḥ |\nyat krauñca-mithunād ekam avadhīḥ kāma-mohitam ||",
      ref: "Bala Kanda 2.15",
      meaning: {
        en: "Hunter, may you find no rest for endless years, for you killed one of a pair of cranes lost in love.",
        hi: "हे निषाद! तुम्हें अनंत वर्षों तक प्रतिष्ठा न मिले, क्योंकि तुमने प्रेम में मग्न क्रौंच पक्षियों के जोड़े में से एक को मार डाला।"
      },
      why: {
        en: "Tradition calls this the first verse of poetry in Sanskrit. Grief (shoka) became verse (shloka): the epic is born from compassion for a bird.",
        hi: "परंपरा इसे संस्कृत का पहला काव्य-श्लोक मानती है। शोक ही श्लोक बना: यह महाकाव्य एक पक्षी के प्रति करुणा से जन्मा।"
      }
    },
    "rama-accepts": {
      why: {
        en: "Rama accepts fourteen years of exile without anger so that his father's word is kept. For many readers this is the heart of the epic: keeping your word when it costs you everything.",
        hi: "राम बिना क्रोध चौदह वर्ष का वनवास स्वीकारते हैं ताकि पिता का वचन बना रहे। बहुतों के लिए यही काव्य का हृदय है: सब कुछ दाँव पर हो, तब भी वचन निभाना।"
      }
    },
    "sita-will-go": {
      why: {
        en: "No one orders Sita to the forest. She argues for her place beside Rama and wins. Her choice is hers.",
        hi: "सीता को वन जाने का आदेश कोई नहीं देता। वे राम के साथ रहने का तर्क देती हैं और मनवा लेती हैं। यह निर्णय उनका अपना है।"
      }
    },
    "the-leaving": {
      verse: "रामं दशरथं विद्धि मां विद्धि जनकात्मजाम्।\nअयोध्यामटवीं विद्धि गच्छ तात यथासुखम्॥",
      iast: "rāmaṃ daśarathaṃ viddhi māṃ viddhi janakātmajām |\nayodhyām aṭavīṃ viddhi gaccha tāta yathā-sukham ||",
      ref: "Ayodhya Kanda 40.9",
      meaning: {
        en: "Sumitra to Lakshmana: Think of Rama as your father Dasharatha, of Sita as me, and of the forest as Ayodhya. Go, my son, and be at peace.",
        hi: "सुमित्रा लक्ष्मण से: राम को दशरथ समझना, जनकनंदिनी को मुझे समझना, और वन को अयोध्या समझना। पुत्र, सुखपूर्वक जाओ।"
      },
      why: {
        en: "A mother's blessing that turns exile into home. The verse is still quoted at Indian farewells.",
        hi: "माँ का आशीर्वाद, जो वनवास को घर बना देता है। यह श्लोक आज भी विदाई के समय उद्धृत होता है।"
      }
    },
    "the-sandals": {
      why: {
        en: "Bharata could keep the throne. Instead he places Rama's sandals on it and rules as a caretaker. Power held in trust, not taken.",
        hi: "भरत राज्य रख सकते थे। उन्होंने राम की पादुकाएँ सिंहासन पर रखीं और केवल संरक्षक बनकर शासन किया। सत्ता धरोहर के रूप में, अधिकार के रूप में नहीं।"
      }
    },
    "jatayu-falls": {
      why: {
        en: "An old bird fights a king he cannot beat, because it is right. Rama later performs his funeral rites as he would for his own father.",
        hi: "एक वृद्ध पक्षी उस राजा से लड़ता है जिसे वह हरा नहीं सकता, क्योंकि यही उचित है। राम बाद में उसका अंतिम संस्कार पिता की तरह करते हैं।"
      }
    },
    "shabari-berries": {
      why: {
        en: "An elderly forest woman, outside every court and caste of power, is the one Rama honours as a host. Devotion matters more than status.",
        hi: "हर सत्ता और ऊँच-नीच से बाहर की एक वृद्ध वनवासी को राम आतिथेय के रूप में सम्मान देते हैं। भक्ति पद से बड़ी है।"
      }
    },
    "hanuman-meets": {
      why: {
        en: "Hanuman is worshipped across India and loved in Thailand, Cambodia and Indonesia. He stands for strength used in service, never for show.",
        hi: "हनुमान पूरे भारत में पूजे जाते हैं और थाईलैंड, कंबोडिया, इंडोनेशिया में भी प्रिय हैं। वे सेवा में लगे बल के प्रतीक हैं, दिखावे के नहीं।"
      }
    },
    "the-leap": {
      why: {
        en: "The leap to Lanka is the centre of the Sundara Kanda, a book many families recite whole for courage. In Bali, the Kecak dance retells these scenes by firelight.",
        hi: "लंका की छलाँग सुंदरकांड का केंद्र है, जिसका पाठ कई परिवार साहस के लिए करते हैं। बाली में केचक नृत्य अग्नि के प्रकाश में यही दृश्य दोहराता है।"
      }
    },
    "vibhishana-comes": {
      verse: "सकृदेव प्रपन्नाय तवास्मीति च याचते।\nअभयं सर्वभूतेभ्यो ददाम्येतद्व्रतं मम॥",
      iast: "sakṛd eva prapannāya tavāsmīti ca yācate |\nabhayaṃ sarva-bhūtebhyo dadāmy etad vrataṃ mama ||",
      ref: "Yuddha Kanda 18.33",
      meaning: {
        en: "To anyone who comes to me even once and says 'I am yours', I give safety from every being. This is my vow.",
        hi: "जो एक बार भी शरण में आकर कहे 'मैं तुम्हारा हूँ', उसे मैं सब प्राणियों से अभय देता हूँ। यह मेरा व्रत है।"
      },
      why: {
        en: "Rama's advisers fear a spy. Rama welcomes the enemy's brother anyway. Refuge is given, not earned.",
        hi: "राम के सलाहकार भेदिए का डर जताते हैं। फिर भी राम शत्रु के भाई का स्वागत करते हैं। शरण दी जाती है, कमाई नहीं जाती।"
      }
    },
    "the-setu": {
      why: {
        en: "Everyone builds the bridge together, down to a small squirrel in later retellings. A chain of shoals between India and Sri Lanka is still called Rama Setu.",
        hi: "पुल सब मिलकर बनाते हैं, बाद की कथाओं में एक छोटी गिलहरी तक। भारत और श्रीलंका के बीच की उथली चट्टानों की श्रृंखला आज भी रामसेतु कहलाती है।"
      }
    },
    "ravana-falls": {
      why: {
        en: "Dussehra marks this victory. Across India, giant effigies of Ravana are burned: the defeat of pride, not of a people.",
        hi: "दशहरा इसी विजय का पर्व है। पूरे भारत में रावण के विशाल पुतले जलाए जाते हैं: यह अहंकार की हार है, किसी जाति की नहीं।"
      }
    },
    "the-ordeal": {
      context: {
        en: "Sita's trial by fire is one of the most debated scenes in the epic. Many retellings, from medieval poets to modern writers, question or reimagine it. The story shows the fire refusing to burn her.",
        hi: "सीता की अग्नि-परीक्षा काव्य के सबसे अधिक विवादित प्रसंगों में है। मध्यकाल के कवियों से आज के लेखकों तक, कई कथाएँ इस पर प्रश्न उठाती हैं या इसे नए ढंग से कहती हैं। कथा में अग्नि उन्हें जलाने से इनकार कर देती है।"
      }
    },
    "the-coronation": {
      why: {
        en: "Rama's return to Ayodhya is remembered at Diwali, when homes are lit with lamps to welcome him. 'Ram Rajya' still means a just and peaceful rule.",
        hi: "राम के अयोध्या लौटने की स्मृति में दीपावली पर घर दीपों से सजते हैं। 'रामराज्य' आज भी न्यायपूर्ण और शांत शासन का अर्थ रखता है।"
      }
    },
    "sita-sent": {
      context: {
        en: "Sita's exile belongs to the Uttara Kanda, which many scholars consider a later addition. It is a painful episode, and readers and retellers have long argued with it.",
        hi: "सीता का निर्वासन उत्तरकांड में है, जिसे कई विद्वान बाद में जोड़ा गया भाग मानते हैं। यह पीड़ादायक प्रसंग है, और पाठक तथा कथाकार लंबे समय से इस पर प्रश्न करते आए हैं।"
      }
    },
    "the-earth": {
      why: {
        en: "Sita returns to the earth she came from. She is not tested again. The epic lets her final choice be her own.",
        hi: "सीता उसी धरती में लौट जाती हैं जहाँ से आई थीं। अब कोई परीक्षा नहीं। काव्य उनका अंतिम निर्णय उन्हीं का रहने देता है।"
      }
    }
  }
};
