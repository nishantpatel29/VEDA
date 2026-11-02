// Five questions per Kanda. q: [en, hi]; a: list of [en, hi] answers, the FIRST one is correct
// (the UI shuffles them). Keyed by the English Kanda name used in BOOKS.
var QUIZZES = {
  ramayana: {
    "Bala Kanda": [
      { q: ["Who composed the Ramayana?", "रामायण की रचना किसने की?"],
        a: [["Valmiki", "वाल्मीकि"], ["Vyasa", "व्यास"], ["Narada", "नारद"], ["Tulsidas", "तुलसीदास"]] },
      { q: ["What moved Valmiki to speak the first shloka?", "किस घटना ने वाल्मीकि से पहला श्लोक कहलवाया?"],
        a: [["A hunter killing a crane", "एक शिकारी का क्रौंच पक्षी को मारना"], ["A dream", "एक स्वप्न"], ["A king's order", "राजा का आदेश"], ["A flood", "एक बाढ़"]] },
      { q: ["Who were Rama's three brothers?", "राम के तीन भाई कौन थे?"],
        a: [["Lakshmana, Bharata, Shatrughna", "लक्ष्मण, भरत, शत्रुघ्न"], ["Lava, Kusha, Angada", "लव, कुश, अंगद"], ["Sugriva, Vali, Hanuman", "सुग्रीव, वाली, हनुमान"]] },
      { q: ["Which sage took the young princes to guard his sacrifice?", "कौन से ऋषि राजकुमारों को अपने यज्ञ की रक्षा के लिए ले गए?"],
        a: [["Vishwamitra", "विश्वामित्र"], ["Vashishtha", "वशिष्ठ"], ["Narada", "नारद"], ["Valmiki", "वाल्मीकि"]] },
      { q: ["How did Rama win Sita's hand?", "राम ने सीता का वरण कैसे किया?"],
        a: [["He broke Shiva's great bow", "शिव का महान धनुष तोड़कर"], ["He won a chariot race", "रथ-दौड़ जीतकर"], ["He answered riddles", "पहेलियाँ सुलझाकर"], ["He defeated Ravana", "रावण को हराकर"]] }
    ],
    "Ayodhya Kanda": [
      { q: ["Who asked King Dasharatha to send Rama away?", "राजा दशरथ से राम का वनवास किसने माँगा?"],
        a: [["Kaikeyi", "कैकेयी"], ["Kausalya", "कौशल्या"], ["Sumitra", "सुमित्रा"], ["Urmila", "उर्मिला"]] },
      { q: ["How many years did Rama spend in exile?", "राम ने कितने वर्ष वनवास में बिताए?"],
        a: [["Fourteen", "चौदह"], ["Seven", "सात"], ["Twelve", "बारह"], ["Ten", "दस"]] },
      { q: ["Who went into the forest with Rama?", "राम के साथ वन कौन गया?"],
        a: [["Sita and Lakshmana", "सीता और लक्ष्मण"], ["Bharata and Shatrughna", "भरत और शत्रुघ्न"], ["Hanuman", "हनुमान"], ["Vashishtha", "वशिष्ठ"]] },
      { q: ["What did Bharata place on the throne of Ayodhya?", "भरत ने अयोध्या के सिंहासन पर क्या रखा?"],
        a: [["Rama's sandals", "राम की पादुकाएँ"], ["Rama's bow", "राम का धनुष"], ["A crown", "एक मुकुट"], ["A lamp", "एक दीपक"]] },
      { q: ["Which forest chief helped them cross the Ganga?", "किस वनवासी राजा ने उन्हें गंगा पार कराई?"],
        a: [["Guha", "गुह"], ["Jatayu", "जटायु"], ["Sugriva", "सुग्रीव"], ["Angada", "अंगद"]] }
    ],
    "Aranya Kanda": [
      { q: ["Who took the form of a golden deer?", "सोने के हिरण का रूप किसने धरा?"],
        a: [["Maricha", "मारीच"], ["Ravana", "रावण"], ["Kumbhakarna", "कुंभकर्ण"], ["Vali", "वाली"]] },
      { q: ["Which old bird fought Ravana to save Sita?", "किस वृद्ध पक्षी ने सीता को बचाने के लिए रावण से युद्ध किया?"],
        a: [["Jatayu", "जटायु"], ["Garuda", "गरुड़"], ["A crane", "एक सारस"], ["A peacock", "एक मोर"]] },
      { q: ["Who welcomed Rama with berries she had gathered?", "किसने अपने चुने हुए बेरों से राम का स्वागत किया?"],
        a: [["Shabari", "शबरी"], ["Ahalya", "अहल्या"], ["Shurpanakha", "शूर्पणखा"], ["Urmila", "उर्मिला"]] },
      { q: ["Where did Ravana carry Sita away to?", "रावण सीता को कहाँ ले गया?"],
        a: [["Lanka", "लंका"], ["Kishkindha", "किष्किंधा"], ["Mithila", "मिथिला"], ["Ayodhya", "अयोध्या"]] },
      { q: ["Which rakshasi did Lakshmana wound, enraging Ravana?", "लक्ष्मण ने किस राक्षसी को घायल किया, जिससे रावण क्रोधित हुआ?"],
        a: [["Shurpanakha", "शूर्पणखा"], ["Tataka", "ताड़का"], ["Manthara", "मंथरा"], ["Kaikeyi", "कैकेयी"]] }
    ],
    "Kishkindha Kanda": [
      { q: ["Who became Rama's most devoted friend in Kishkindha?", "किष्किंधा में राम का सबसे समर्पित मित्र कौन बना?"],
        a: [["Hanuman", "हनुमान"], ["Vali", "वाली"], ["Ravana", "रावण"], ["Guha", "गुह"]] },
      { q: ["Who was Sugriva's brother?", "सुग्रीव का भाई कौन था?"],
        a: [["Vali", "वाली"], ["Angada", "अंगद"], ["Jatayu", "जटायु"], ["Vibhishana", "विभीषण"]] },
      { q: ["What clue had Sita dropped for the vanaras to find?", "सीता ने वानरों के लिए कौन सा संकेत गिराया था?"],
        a: [["Her jewellery, wrapped in cloth", "कपड़े में बँधे अपने आभूषण"], ["A letter", "एक पत्र"], ["Her sandal", "अपनी पादुका"], ["A flower garland", "फूलों की माला"]] },
      { q: ["Who was Vali's son?", "वाली का पुत्र कौन था?"],
        a: [["Angada", "अंगद"], ["Indrajit", "इंद्रजित"], ["Lava", "लव"], ["Sugriva", "सुग्रीव"]] },
      { q: ["Who reminded Hanuman of his forgotten strength?", "हनुमान को उनकी भूली हुई शक्ति किसने याद दिलाई?"],
        a: [["Jambavan", "जांबवान"], ["Sugriva", "सुग्रीव"], ["Rama", "राम"], ["Vibhishana", "विभीषण"]] }
    ],
    "Sundara Kanda": [
      { q: ["How did Hanuman reach Lanka?", "हनुमान लंका कैसे पहुँचे?"],
        a: [["He leapt across the ocean", "समुद्र लाँघकर"], ["By boat", "नाव से"], ["Over a bridge", "पुल से"], ["On Garuda's back", "गरुड़ की पीठ पर"]] },
      { q: ["Where did Hanuman find Sita?", "हनुमान को सीता कहाँ मिलीं?"],
        a: [["In the Ashoka grove", "अशोक वाटिका में"], ["In Ravana's throne room", "रावण के दरबार में"], ["In a cave", "एक गुफा में"], ["In a temple", "एक मंदिर में"]] },
      { q: ["What did Hanuman show Sita to prove Rama sent him?", "हनुमान ने सीता को राम का दूत होने का क्या प्रमाण दिया?"],
        a: [["Rama's ring", "राम की अँगूठी"], ["Rama's bow", "राम का धनुष"], ["A letter", "एक पत्र"], ["A sandal", "एक पादुका"]] },
      { q: ["What did Ravana's guards set on fire?", "रावण के सैनिकों ने किसमें आग लगाई?"],
        a: [["Hanuman's tail", "हनुमान की पूँछ में"], ["The bridge", "पुल में"], ["Rama's ships", "राम के जहाज़ों में"], ["The forest", "वन में"]] },
      { q: ["What did Sita send back to Rama with Hanuman?", "सीता ने हनुमान के हाथ राम को क्या भेजा?"],
        a: [["Her hair jewel", "अपनी चूड़ामणि"], ["Her ring", "अपनी अँगूठी"], ["A garland", "एक माला"], ["A letter", "एक पत्र"]] }
    ],
    "Yuddha Kanda": [
      { q: ["Which brother of Ravana crossed over to Rama's side?", "रावण का कौन सा भाई राम की ओर आ गया?"],
        a: [["Vibhishana", "विभीषण"], ["Kumbhakarna", "कुंभकर्ण"], ["Indrajit", "इंद्रजित"], ["Maricha", "मारीच"]] },
      { q: ["Which vanara led the building of the bridge to Lanka?", "लंका तक पुल बनाने का नेतृत्व किस वानर ने किया?"],
        a: [["Nala", "नल"], ["Hanuman", "हनुमान"], ["Angada", "अंगद"], ["Sugriva", "सुग्रीव"]] },
      { q: ["Which of Ravana's brothers slept for months at a time?", "रावण का कौन सा भाई महीनों तक सोता था?"],
        a: [["Kumbhakarna", "कुंभकर्ण"], ["Vibhishana", "विभीषण"], ["Indrajit", "इंद्रजित"], ["Maricha", "मारीच"]] },
      { q: ["Which festival celebrates Rama's victory over Ravana?", "राम की रावण पर विजय का पर्व कौन सा है?"],
        a: [["Dussehra", "दशहरा"], ["Holi", "होली"], ["Pongal", "पोंगल"], ["Onam", "ओणम"]] },
      { q: ["Which festival of lamps remembers Rama's return home?", "राम की घर-वापसी की याद में कौन सा दीपों का पर्व मनाया जाता है?"],
        a: [["Diwali", "दीपावली"], ["Navratri", "नवरात्रि"], ["Holi", "होली"], ["Baisakhi", "बैसाखी"]] }
    ],
    "Uttara Kanda": [
      { q: ["What were the names of Sita's twin sons?", "सीता के जुड़वाँ पुत्रों के नाम क्या थे?"],
        a: [["Lava and Kusha", "लव और कुश"], ["Nala and Nila", "नल और नील"], ["Bharata and Shatrughna", "भरत और शत्रुघ्न"], ["Vali and Sugriva", "वाली और सुग्रीव"]] },
      { q: ["Where did the twins grow up?", "जुड़वाँ बालक कहाँ बड़े हुए?"],
        a: [["In Valmiki's ashram", "वाल्मीकि के आश्रम में"], ["In Ayodhya's palace", "अयोध्या के महल में"], ["In Lanka", "लंका में"], ["In Kishkindha", "किष्किंधा में"]] },
      { q: ["Who taught the twins to sing the Ramayana?", "जुड़वाँ बालकों को रामायण गाना किसने सिखाया?"],
        a: [["Valmiki", "वाल्मीकि"], ["Vashishtha", "वशिष्ठ"], ["Narada", "नारद"], ["Hanuman", "हनुमान"]] },
      { q: ["Where did Sita go at the very end?", "अंत में सीता कहाँ गईं?"],
        a: [["Back into the earth", "धरती में समा गईं"], ["Home to Mithila", "मिथिला लौट गईं"], ["To Lanka", "लंका गईं"], ["To the forest alone", "अकेले वन गईं"]] },
      { q: ["By which river does the story close?", "कथा किस नदी के तट पर समाप्त होती है?"],
        a: [["Sarayu", "सरयू"], ["Ganga", "गंगा"], ["Godavari", "गोदावरी"], ["Yamuna", "यमुना"]] }
    ]
  }
};
