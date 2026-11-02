# VEDA translation guide

Every translator (human or agent) follows this guide so the whole book reads as if one storyteller wrote it.

## Voice
- Write as a native storyteller of the target language telling the epic aloud to family. Not a literal translation, not a textbook.
- Keep the English page's meaning, images and order of ideas. Do not add facts, morals or explanations; do not drop any.
- Prefer short, clear sentences that sound natural when read aloud by a text-to-speech voice. Break long English sentences.
- Use the everyday modern register of the language (the language of good newspapers and children's storybooks), not archaic or heavily Sanskritised prose. Hindi/Marathi: simple Hindustani/Marathi, avoid pedantic tatsama words where a common word exists.
- Translate idioms by meaning. "The word turns expensive" -> the natural way your language says "keeping a promise becomes costly".
- Keep dialogue punctuation natural for the language (Hindi uses । ; Japanese uses 。「」; Arabic uses Arabic punctuation ، ؟).
- Numbers: write in words when short. Use the script's normal digits for the language (Western digits are fine everywhere).

## Shape (strict)
- Each page is an array: `[title, hook, paragraph(s)..., closing line]`. Return exactly the same number of strings as the English array. An empty English string stays empty.
- Title: short (2-6 words), evocative, like a chapter title.
- Hook: one or two sentences, the page's opening image.
- Closing line: a short reflective line; keep it crisp.
- Output is JSON only, UTF-8, no comments, no trailing commas. Use straight double quotes for JSON; use the language's own quotation marks inside text.

## Names and terms
Use the forms below everywhere. For names not listed, use the standard, most familiar form in that language and keep it identical every time it appears.

| English | gu | te | ta | mr | kn | ml | hi |
|---|---|---|---|---|---|---|---|
| Rama | રામ | రాముడు | ராமன் | राम | ರಾಮ | രാമൻ | राम |
| Sita | સીતા | సీత | சீதை | सीता | ಸೀತೆ | സീത | सीता |
| Lakshmana | લક્ષ્મણ | లక్ష్మణుడు | லட்சுமணன் | लक्ष्मण | ಲಕ್ಷ್ಮಣ | ലക്ഷ്മണൻ | लक्ष्मण |
| Bharata | ભરત | భరతుడు | பரதன் | भरत | ಭರತ | ഭരതൻ | भरत |
| Shatrughna | શત્રુઘ્ન | శత్రుఘ్నుడు | சத்ருக்னன் | शत्रुघ्न | ಶತ್ರುಘ್ನ | ശത്രുഘ്നൻ | शत्रुघ्न |
| Dasharatha | દશરથ | దశరథుడు | தசரதன் | दशरथ | ದಶರಥ | ദശരഥൻ | दशरथ |
| Kaikeyi | કૈકેયી | కైకేయి | கைகேயி | कैकेयी | ಕೈಕೇಯಿ | കൈകേയി | कैकेयी |
| Kausalya | કૌશલ્યા | కౌసల్య | கௌசல்யை | कौसल्या | ಕೌಸಲ್ಯೆ | കൗസല്യ | कौशल्या |
| Hanuman | હનુમાન | హనుమంతుడు | அனுமன் | हनुमान | ಹನುಮಂತ | ഹനുമാൻ | हनुमान |
| Ravana | રાવણ | రావణుడు | ராவணன் | रावण | ರಾವಣ | രാവണൻ | रावण |
| Valmiki | વાલ્મીકિ | వాల్మీకి | வால்மீகி | वाल्मीकी | ವಾಲ್ಮೀಕಿ | വാല്മീകി | वाल्मीकि |
| Narada | નારદ | నారదుడు | நாரதர் | नारद | ನಾರದ | നാരദൻ | नारद |
| Vishwamitra | વિશ્વામિત્ર | విశ్వామిత్రుడు | விசுவாமித்திரர் | विश्वामित्र | ವಿಶ್ವಾಮಿತ್ರ | വിശ്വാമിത്രൻ | विश्वामित्र |
| Sugriva | સુગ્રીવ | సుగ్రీవుడు | சுக்ரீவன் | सुग्रीव | ಸುಗ್ರೀವ | സുഗ്രീവൻ | सुग्रीव |
| Vibhishana | વિભીષણ | విభీషణుడు | விபீஷணன் | बिभीषण | ವಿಭೀಷಣ | വിഭീഷണൻ | विभीषण |
| Ayodhya | અયોધ્યા | అయోధ్య | அயோத்தி | अयोध्या | ಅಯೋಧ್ಯೆ | അയോധ്യ | अयोध्या |
| Lanka | લંકા | లంక | இலங்கை | लंका | ಲಂಕೆ | ലങ്ക | लंका |
| Krishna | કૃષ્ણ | కృష్ణుడు | கிருஷ்ணன் | कृष्ण | ಕೃಷ್ಣ | കൃഷ്ണൻ | कृष्ण |
| Arjuna | અર્જુન | అర్జునుడు | அர்ஜுனன் | अर्जुन | ಅರ್ಜುನ | അർജുനൻ | अर्जुन |
| Yudhishthira | યુધિષ્ઠિર | ధర్మరాజు | தருமன் | युधिष्ठिर | ಧರ್ಮರಾಯ | യുധിഷ്ഠിരൻ | युधिष्ठिर |
| Bhima | ભીમ | భీముడు | பீமன் | भीम | ಭೀಮ | ഭീമൻ | भीम |
| Draupadi | દ્રૌપદી | ద్రౌపది | திரௌபதி | द्रौपदी | ದ್ರೌಪದಿ | ദ്രൗപദി | द्रौपदी |
| Duryodhana | દુર્યોધન | దుర్యోధనుడు | துரியோதனன் | दुर्योधन | ದುರ್ಯೋಧನ | ദുര്യോധനൻ | दुर्योधन |
| Karna | કર્ણ | కర్ణుడు | கர்ணன் | कर्ण | ಕರ್ಣ | കർണ്ണൻ | कर्ण |
| Bhishma | ભીષ્મ | భీష్ముడు | பீஷ்மர் | भीष्म | ಭೀಷ್ಮ | ഭീഷ്മർ | भीष्म |
| Vyasa | વ્યાસ | వ్యాసుడు | வியாசர் | व्यास | ವ್ಯಾಸ | വ്യാസൻ | व्यास |
| dharma | ધર્મ | ధర్మం | தர்மம் | धर्म | ಧರ್ಮ | ധർമ്മം | धर्म |
| rakshasa | રાક્ષસ | రాక్షసుడు | அரக்கன் | राक्षस | ರಾಕ್ಷಸ | രാക്ഷസൻ | राक्षस |
| vanara | વાનર | వానరుడు | வானரர் | वानर | ವಾನರ | വാനരൻ | वानर |

International languages: keep the Sanskrit names in the familiar international spelling (Rama, Sita, Lakshmana, Hanuman, Ravana, Krishna, Arjuna, Draupadi; dharma in italics is not possible, so plain "dharma"). Japanese: ラーマ, シーター, ラクシュマナ, ハヌマーン, ラーヴァナ, クリシュナ, アルジュナ, ドラウパディー. Arabic: راما, سيتا, لاكشمانا, هانومان, رافانا, كريشنا, أرجونا, دروبادي.

Section names (Kandas / parvas): the Indian languages use their own common names (for example gu: બાલકાંડ, ta: பால காண்டம், te: బాలకాండ). International languages keep "Bala Kanda" style names, translating only the Mahabharata section titles that are English words ("The War" -> "La guerra").

## Self-review before handing in
Read every page aloud in your head as a native listener. Fix anything that sounds translated: word order copied from English, stiff passive voice, repeated pronouns, words a grandparent would not use. Then check the JSON shape again.
