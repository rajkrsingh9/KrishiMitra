let prevLang = 'en';

        async function translateText(text, srcLang, destLang) {
            const apiUrl = 'https://api.devnagri.com/machine-translation/v2/translate';
            const apiKey = 'devnagri_27c27424b26b11efb34742010aa00012';

            const payload = {
                key: apiKey,
                sentence: text,
                src_lang: srcLang,
                dest_lang: destLang,
            };

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.translated_text;
                } else {
                    console.error(`API Error: ${response.status} - ${response.statusText}`);
                    return text;
                }
            } catch (error) {
                console.error('API Call Failed:', error);
                return text;
            }
        }

        function getAllTextNodes() {
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        if (node.nodeValue.trim()) return NodeFilter.FILTER_ACCEPT;
                        return NodeFilter.FILTER_REJECT;
                    },
                }
            );

            const nodes = [];
            let node;
            while ((node = walker.nextNode())) {
                nodes.push(node);
            }
            return nodes;
        }

        async function translateSiteText(srcLang, destLang) {
            const textNodes = getAllTextNodes();

            for (const node of textNodes) {
                const originalText = node.nodeValue.trim();
                if (originalText.length > 0) {
                    const translatedText = await translateText(originalText, srcLang, destLang);
                    if (translatedText !== originalText) {
                        node.nodeValue = translatedText;
                    }
                }
            }
        }

        async function setLanguage(destLang) {
            const srcLang = prevLang;

            // Save language in cookie
            await fetch(`/set-language/?language=${destLang}`);

            await translateSiteText(srcLang, destLang);
            prevLang = destLang;
        }

        document.addEventListener('DOMContentLoaded', () => {
            const savedLanguage = getCookie('selected_language') || 'en';
            prevLang = savedLanguage;

            if (savedLanguage !== 'en') {
                setLanguage(savedLanguage);
            }

            document.getElementById('languageSelect').addEventListener('change', (event) => {
                setLanguage(event.target.value);
            });
        });

        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        }