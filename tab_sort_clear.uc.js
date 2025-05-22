// VERSION 5.1.0 AI-Only Grouping Option & Enhanced AI Context
(() => {
    // --- Configuration ---
    const CONFIG = {
        aiOnlyGrouping: true, // << --- Set to true to let AI handle all grouping logic
        apiConfig: {
            ollama: {
                endpoint: 'http://localhost:11434/api/generate',
                enabled: false,
                model: 'llama3.1:latest',
                promptTemplateBatch: `Analyze the following numbered list of tab data (Title, URL, Description, ContentTypeHint, OpenerID) and assign a concise category (1-2 words, Title Case) for EACH tab.

                Existing Categories (Use these EXACT names if a tab fits):
                {EXISTING_CATEGORIES_LIST}

                ---
                Instructions for Assignment:
                1.  **Prioritize Existing:** For each tab below, determine if it clearly belongs to one of the 'Existing Categories'. Base this primarily on the URL/Domain, then Title/Description/ContentTypeHint. If it fits, you MUST use the EXACT category name provided in the 'Existing Categories' list. DO NOT create a minor variation (e.g., if 'Project Docs' exists, use that, don't create 'Project Documentation').
                2.  **Assign New Category (If Necessary):** Only if a tab DOES NOT fit an existing category, assign the best NEW concise category (1-2 words, Title Case).
                    *   PRIORITIZE the URL/Domain (e.g., 'GitHub', 'YouTube', 'StackOverflow').
                    *   Use Title/Description/ContentTypeHint for specifics or generic domains.
                3.  **Consistency is CRITICAL:** Use the EXACT SAME category name for all tabs belonging to the same logical group (whether assigned an existing or a new category).
                4.  **Format:** 1-2 words, Title Case.

                ---
                Input Tab Data:
                {TAB_DATA_LIST}

                ---
                Instructions for Output:
                1. Output ONLY the category names.
                2. Provide EXACTLY ONE category name per line.
                3. The number of lines in your output MUST EXACTLY MATCH the number of tabs in the Input Tab Data list above.
                4. DO NOT include numbering, explanations, apologies, markdown formatting, or any surrounding text like "Output:" or backticks.
                5. Just the list of categories, separated by newlines.
                ---

                Output:`,
                promptTemplateAiOnlyBatch: `Analyze the following numbered list of tab data (Title, URL, Description, ContentTypeHint, OpenerID) and assign a concise category (1-2 words, Title Case) for EACH tab.

                    You are an advanced tab grouping assistant. Your task is to categorize the browser tabs below by emulating the following multi-stage process:

                        1.  **Deterministic Grouping (Strong Signals):**
                            *   Prioritize grouping tabs that seem to be opened from the same parent source (using 'OpenerID' if available and relevant).
                            *   Identify common content types (e.g., 'Dev Docs', 'Spreadsheet', 'Social Media') based on URL, title patterns, and 'ContentTypeHint'.
                            *   Group tabs sharing common, significant keywords in their titles or identical primary hostnames (e.g., 'GitHub' for github.com tabs).

                        2.  **Similarity-Based Grouping:**
                            *   For tabs not clearly grouped by strong signals, analyze their text content (title and description) for semantic similarity.
                            *   Group tabs with highly similar text content, even if keywords or hostnames differ slightly.

                        3.  **Comprehensive Categorization & Refinement:**
                            *   Assign the most appropriate category to all tabs, ensuring each tab gets one.
                            *   If a tab fits an existing category (from 'Existing Categories' list below, or one you've conceptually formed during this process for other tabs), use that EXACT category name.
                            *   If a new category is needed, create a concise one (1-2 words, Title Case).

                        4.  **Consistency and Consolidation:**
                            *   Strive for consistent naming. Avoid near-duplicate names (e.g., "Project Doc" and "Project Docs" should ideally be one category like "Project Docs").
                            *   The goal is to create logical, well-defined groups.

                    Existing Categories (Use these EXACT names if a tab fits an already established group):
                    {EXISTING_CATEGORIES_LIST}

                    ---
                    Input Tab Data:
                    {TAB_DATA_LIST}

                    ---
                    Instructions for Output:
                    1. Output ONLY the category names.
                    2. Provide EXACTLY ONE category name per line.
                    3. The number of lines in your output MUST EXACTLY MATCH the number of tabs in the Input Tab Data list above.
                    4. DO NOT include numbering, explanations, apologies, markdown formatting, or any surrounding text like "Output:" or backticks.
                    5. Just the list of categories, separated by newlines.
                    ---

                    Output:`
            },
            gemini: {
                enabled: true,
                apiKey: 'YOUR_GEMINI_API_KEY', // <<<--- PASTE YOUR KEY HERE --- >>>
                model: 'gemini-1.5-flash-latest',
                apiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/',
                promptTemplateBatch: `Analyze the following numbered list of tab data (Title, URL, Description, ContentTypeHint, OpenerID) and assign a concise category (1-2 words, Title Case) for EACH tab.

                    Existing Categories (Use these EXACT names if a tab fits):
                    {EXISTING_CATEGORIES_LIST}

                    ---
                    Instructions for Assignment:
                    1.  **Prioritize Existing:** For each tab below, determine if it clearly belongs to one of the 'Existing Categories'. Base this primarily on the URL/Domain, then Title/Description/ContentTypeHint. If it fits, you MUST use the EXACT category name provided in the 'Existing Categories' list. DO NOT create a minor variation (e.g., if 'Project Docs' exists, use that, don't create 'Project Documentation').
                    2.  **Assign New Category (If Necessary):** Only if a tab DOES NOT fit an existing category, assign the best NEW concise category (1-2 words, Title Case).
                        *   PRIORITIZE the URL/Domain (e.g., 'GitHub', 'YouTube', 'StackOverflow').
                        *   Use Title/Description/ContentTypeHint for specifics or generic domains.
                    3.  **Consistency is CRITICAL:** Use the EXACT SAME category name for all tabs belonging to the same logical group (whether assigned an existing or a new category).
                    4.  **Format:** 1-2 words, Title Case.

                    ---
                    Input Tab Data:
                    {TAB_DATA_LIST}

                    ---
                    Instructions for Output:
                    1. Output ONLY the category names.
                    2. Provide EXACTLY ONE category name per line.
                    3. The number of lines in your output MUST EXACTLY MATCH the number of tabs in the Input Tab Data list above.
                    4. DO NOT include numbering, explanations, apologies, markdown formatting, or any surrounding text like "Output:" or backticks.
                    5. Just the list of categories, separated by newlines.
                    ---

                    Output:`,
                promptTemplateAiOnlyBatch: `Analyze the following numbered list of tab data (Title, URL, Description, ContentTypeHint, OpenerID) and assign a concise category (1-2 words, Title Case) for EACH tab.

                    You are an advanced tab grouping assistant. Your task is to categorize the browser tabs below by emulating the following multi-stage process:

                        1.  **Deterministic Grouping (Strong Signals):**
                            *   Prioritize grouping tabs that seem to be opened from the same parent source (using 'OpenerID' if available and relevant).
                            *   Identify common content types (e.g., 'Dev Docs', 'Spreadsheet', 'Social Media') based on URL, title patterns, and 'ContentTypeHint'.
                            *   Group tabs sharing common, significant keywords in their titles or identical primary hostnames (e.g., 'GitHub' for github.com tabs).

                        2.  **Similarity-Based Grouping:**
                            *   For tabs not clearly grouped by strong signals, analyze their text content (title and description) for semantic similarity.
                            *   Group tabs with highly similar text content, even if keywords or hostnames differ slightly.

                        3.  **Comprehensive Categorization & Refinement:**
                            *   Assign the most appropriate category to all tabs, ensuring each tab gets one.
                            *   If a tab fits an existing category (from 'Existing Categories' list below, or one you've conceptually formed during this process for other tabs), use that EXACT category name.
                            *   If a new category is needed, create a concise one (1-2 words, Title Case).

                        4.  **Consistency and Consolidation:**
                            *   Strive for consistent naming. Avoid near-duplicate names (e.g., "Project Doc" and "Project Docs" should ideally be one category like "Project Docs").
                            *   The goal is to create logical, well-defined groups.

                    Existing Categories (Use these EXACT names if a tab fits an already established group):
                    {EXISTING_CATEGORIES_LIST}

                    ---
                    Input Tab Data:
                    {TAB_DATA_LIST}

                    ---
                    Instructions for Output:
                    1. Output ONLY the category names.
                    2. Provide EXACTLY ONE category name per line.
                    3. The number of lines in your output MUST EXACTLY MATCH the number of tabs in the Input Tab Data list above.
                    4. DO NOT include numbering, explanations, apologies, markdown formatting, or any surrounding text like "Output:" or backticks.
                    5. Just the list of categories, separated by newlines.
                    ---

                    Output:`,
                generationConfig: {
                    temperature: 0.1,
                    candidateCount: 1,
                }
            }
        },

        preGroupingThreshold: 2, // Min tabs for keyword/hostname/opener/content-type/TF-IDF pre-grouping
        minKeywordLength: 3,
        consolidationDistanceThreshold: 2,

        groupColors: [ // Directly using color names
            "blue", "red", "yellow", "green", "pink", "purple", "orange", "cyan", "gray"
        ],
        titleKeywordStopWords: new Set([
            'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of',
            'is', 'am', 'are', 'was', 'were', 'be', 'being', 'been', 'has', 'have', 'had', 'do', 'does', 'did',
            'how', 'what', 'when', 'where', 'why', 'which', 'who', 'whom', 'whose',
            'new', 'tab', 'untitled', 'page', 'home', 'com', 'org', 'net', 'io', 'dev', 'app', 'site', 'web',
            'get', 'set', 'list', 'view', 'edit', 'create', 'update', 'delete', 'article', 'blog',
            'my', 'your', 'his', 'her', 'its', 'our', 'their', 'me', 'you', 'him', 'her', 'it', 'us', 'them',
            'about', 'search', 'results', 'posts', 'index', 'dashboard', 'profile', 'settings',
            'official', 'documentation', 'docs', 'wiki', 'help', 'support', 'faq', 'guide', 'tutorial',
            'error', 'login', 'signin', 'sign', 'up', 'out', 'welcome', 'loading', 'vs', 'using', 'code',
            'microsoft', 'google', 'apple', 'amazon', 'facebook', 'twitter', 'mozilla'
        ]),

        semanticAnalysis: {
            enabled: true,
            minSimilarityScore: 0.65,
            tfIdfMinDocsForCorpus: 3,
            openerTabGrouping: {
                enabled: true
            },
            contentTypeGrouping: {
                enabled: true
            },
            contentTypePatterns: [{
                name: "Spreadsheet",
                patterns: [/docs\.google\.com\/spreadsheets/, /office\.live\.com\/start\/Excel/, /sheets\.com/]
            }, {
                name: "Document",
                patterns: [/docs\.google\.com\/document/, /office\.live\.com\/start\/Word/, /paper\.dropbox\.com/]
            }, {
                name: "Slides",
                patterns: [/docs\.google\.com\/presentation/, /office\.live\.com\/start\/PowerPoint/, /slides\.com/, /prezi\.com/]
            }, {
                name: "Video Conf",
                patterns: [/meet\.google\.com/, /zoom\.us/, /teams\.microsoft\.com/]
            }, {
                name: "Code Repo",
                patterns: [/github\.com\/[^\/]+\/[^\/]+$/, /gitlab\.com\/[^\/]+\/[^\/]+$/, /bitbucket\.org\/[^\/]+\/[^\/]+$/]
            }, {
                name: "Dev Docs",
                patterns: [/developer\.mozilla\.org/, /stackoverflow\.com\/questions/, /readthedocs\.io/, /dev\.to/, /medium\.com.*?\b(programming|software|coding)\b/i, /\/api[-_]?reference/, /\/sdk\//, /js\.org/, /npmjs\.com\/package/]
            }, {
                name: "YouTube",
                patterns: [/youtube\.com\/watch/, /youtu\.be/]
            }, {
                name: "Shopping",
                patterns: [/amazon\.com\/.*\/dp\//, /ebay\.com\/itm\//, /etsy\.com\/listing\//, /target\.com\/p\//, /walmart\.com\/ip\//]
            }, {
                name: "Social Media",
                patterns: [/twitter\.com/, /facebook\.com/, /instagram\.com/, /linkedin\.com\/feed/, /reddit\.com\/r\//]
            }, {
                name: "News Article",
                patterns: [/\/(article|story|news)\//, /(?:bbc\.com|cnn\.com|nytimes\.com|reuters\.com|theguardian\.com)\//]
            }, {
                name: "Search Results",
                patterns: [/google\.com\/search/, /bing\.com\/search/, /duckduckgo\.com\/\?q=/]
            },],
        },
        styles: `
        #sort-button {
            opacity: 0;
            transition: opacity 0.1s ease-in-out;
            position: absolute;
            right: 55px; /* Positioned to the left of the clear button */
            font-size: 12px;
            width: 60px;
            pointer-events: auto;
            align-self: end;
            appearance: none;
            margin-top: -8px;
            padding: 1px;
            color: gray;
        }
        #sort-button label { display: block; }
        #sort-button:hover {
            opacity: 1;
            color: white;
            border-radius: 4px;
        }

        #clear-button {
            opacity: 0;
            transition: opacity 0.1s ease-in-out;
            position: absolute;
            right: 0;
            font-size: 12px;
            width: 60px;
            pointer-events: auto;
            align-self: end;
            appearance: none;
            margin-top: -8px;
            padding: 1px;
            color: grey;
        }
        #clear-button label { display: block; }
        #clear-button:hover {
            opacity: 1;
            color: white;
            border-radius: 4px;
        }
        /* Separator Base Style (Ensures background is animatable) */
        .vertical-pinned-tabs-container-separator {
             display: flex !important;
             flex-direction: column;
             margin-left: 0;
             min-height: 1px;
             background-color: var(--lwt-toolbarbutton-border-color, rgba(200, 200, 200, 0.1)); /* Subtle base color */
             transition: width 0.1s ease-in-out, margin-right 0.1s ease-in-out, background-color 0.3s ease-out; /* Add background transition */
        }
        /* Separator Hover Logic */
        .vertical-pinned-tabs-container-separator:has(#sort-button):has(#clear-button):hover {
            width: calc(100% - 115px); /* 60px (clear) + 55px (sort) */
            margin-right: auto;
            background-color: var(--lwt-toolbarbutton-hover-background, rgba(200, 200, 200, 0.2)); /* Slightly lighter on hover */
        }
         /* Hover when ONLY SORT is present */
        .vertical-pinned-tabs-container-separator:has(#sort-button):not(:has(#clear-button)):hover {
            width: calc(100% - 65px); /* Only space for sort + margin */
            margin-right: auto;
            background-color: var(--lwt-toolbarbutton-hover-background, rgba(200, 200, 200, 0.2));
        }
         /* Hover when ONLY CLEAR is present */
        .vertical-pinned-tabs-container-separator:not(:has(#sort-button)):has(#clear-button):hover {
            width: calc(100% - 60px); /* Only space for clear */
            margin-right: auto;
            background-color: var(--lwt-toolbarbutton-hover-background, rgba(200, 200, 200, 0.2));
        }
        /* Show BOTH buttons on separator hover */
        .vertical-pinned-tabs-container-separator:hover #sort-button,
        .vertical-pinned-tabs-container-separator:hover #clear-button {
            opacity: 1;
        }

        /* When theres no Pinned Tabs */
        .zen-workspace-tabs-section[hide-separator] .vertical-pinned-tabs-container-separator {
            display: flex !important;
            flex-direction: column !important;
            margin-left: 0 !important;
            margin-top: 5px !important;
            margin-bottom: 8px !important;
            min-height: 1px !important;
            background-color: var(--lwt-toolbarbutton-border-color, rgba(200, 200, 200, 0.1)); /* Subtle base color */
            transition: width 0.1s ease-in-out, margin-right 0.1s ease-in-out, background-color 0.3s ease-out; /* Add background transition */
        }
         /* Hover when BOTH buttons are potentially visible (No Pinned) */
        .zen-workspace-tabs-section[hide-separator] .vertical-pinned-tabs-container-separator:has(#sort-button):has(#clear-button):hover {
             width: calc(100% - 115px); /* 60px (clear) + 55px (sort) */
             margin-right: auto;
             background-color: var(--lwt-toolbarbutton-hover-background, rgba(200, 200, 200, 0.2));
        }
         /* Hover when ONLY SORT is present (No Pinned) */
        .zen-workspace-tabs-section[hide-separator] .vertical-pinned-tabs-container-separator:has(#sort-button):not(:has(#clear-button)):hover {
            width: calc(100% - 65px); /* Only space for sort + margin */
            margin-right: auto;
            background-color: var(--lwt-toolbarbutton-hover-background, rgba(200, 200, 200, 0.2));
        }
        /* Hover when ONLY CLEAR is present (No Pinned) */
        .zen-workspace-tabs-section[hide-separator] .vertical-pinned-tabs-container-separator:not(:has(#sort-button)):has(#clear-button):hover {
            width: calc(100% - 60px); /* Only space for clear */
            margin-right: auto;
            background-color: var(--lwt-toolbarbutton-hover-background, rgba(200, 200, 200, 0.2));
        }
        /* Show BOTH buttons on separator hover (No Pinned) */
        .zen-workspace-tabs-section[hide-separator] .vertical-pinned-tabs-container-separator:hover #sort-button,
        .zen-workspace-tabs-section[hide-separator] .vertical-pinned-tabs-container-separator:hover #clear-button {
            opacity: 1;
        }

        /* Separator Pulsing Animation */
        @keyframes pulse-separator-bg {
            0% { background-color: var(--lwt-toolbarbutton-border-color, rgb(255, 141, 141)); }
            50% { background-color: var(--lwt-toolbarbutton-hover-background, rgba(137, 178, 255, 0.91)); } /* Brighter pulse color */
            100% { background-color: var(--lwt-toolbarbutton-border-color, rgb(142, 253, 238)); }
        }

        .separator-is-sorting {
            animation: pulse-separator-bg 1.5s ease-in-out infinite;
            will-change: background-color;
        }

        /* Tab Animations */
        .tab-closing {
            animation: fadeUp 0.5s forwards;
        }
        @keyframes fadeUp {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); max-height: 0px; padding: 0; margin: 0; border: 0; } /* Add max-height */
        }
        @keyframes loading-pulse-tab {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
        }
        .tab-is-sorting .tab-icon-image,
        .tab-is-sorting .tab-label {
            animation: loading-pulse-tab 1.5s ease-in-out infinite;
            will-change: opacity;
        }
        .tabbrowser-tab {
            transition: transform 0.3s ease-out, opacity 0.3s ease-out, max-height 0.5s ease-out, margin 0.5s ease-out, padding 0.5s ease-out; /* Add transition for closing */
        }
        `
    };

    // --- Globals & State ---
    let groupColorIndex = 0;
    let isSorting = false;
    let commandListenerAdded = false;
    let tabDataCache = new Map(); // Moved to be accessible by sortTabsByTopic

    // --- Helper Functions ---

    const injectStyles = () => {
        let styleElement = document.getElementById('tab-sort-clear-styles');
        if (styleElement) {
            if (styleElement.textContent !== CONFIG.styles) {
                styleElement.textContent = CONFIG.styles;
                console.log("BUTTONS: Styles updated.");
            }
            return;
        }
        styleElement = Object.assign(document.createElement('style'), {
            id: 'tab-sort-clear-styles',
            textContent: CONFIG.styles
        });
        document.head.appendChild(styleElement);
        console.log("BUTTONS: Styles injected.");
    };

    const getTabData = (tab) => {
        if (!tab || !tab.isConnected) {
            return {
                id: null,
                title: 'Invalid Tab',
                url: '',
                hostname: '',
                description: '',
                openerTabId: null
            };
        }
        let title = 'Untitled Page';
        let fullUrl = '';
        let hostname = '';
        let description = '';
        let tabId = tab.id || null;
        let openerTabId = tab.openerTabId || null;

        try {
            const originalTitle = tab.getAttribute('label') || tab.querySelector('.tab-label, .tab-text')?.textContent || '';
            const browser = tab.linkedBrowser || tab._linkedBrowser || gBrowser?.getBrowserForTab?.(tab);

            if (browser?.currentURI?.spec && !browser.currentURI.spec.startsWith('about:')) {
                try {
                    const currentURL = new URL(browser.currentURI.spec);
                    fullUrl = currentURL.href;
                    hostname = currentURL.hostname.replace(/^www\./, '');
                } catch (e) {
                    hostname = 'Invalid URL';
                    fullUrl = browser?.currentURI?.spec || 'Invalid URL';
                }
            } else if (browser?.currentURI?.spec) {
                fullUrl = browser.currentURI.spec;
                hostname = 'Internal Page';
            }

            if (!originalTitle || originalTitle === 'New Tab' || originalTitle === 'about:blank' || originalTitle === 'Loading...' || originalTitle.startsWith('http:') || originalTitle.startsWith('https:')) {
                if (hostname && hostname !== 'Invalid URL' && hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== 'Internal Page') {
                    title = hostname;
                } else {
                    try {
                        const pathSegment = new URL(fullUrl).pathname.split('/')[1];
                        if (pathSegment) title = pathSegment;
                    } catch { /* ignore */ }
                }
            } else {
                title = originalTitle.trim();
            }
            title = title || 'Untitled Page';

            try {
                if (browser && browser.contentDocument) {
                    const metaDescElement = browser.contentDocument.querySelector('meta[name="description"]');
                    if (metaDescElement) {
                        description = metaDescElement.getAttribute('content')?.trim() || '';
                        description = description.substring(0, 250);
                    }
                }
            } catch (contentError) { /* ignore */ }
        } catch (e) {
            console.error('Error getting tab data for tab:', tab, e);
            title = 'Error Processing Tab';
        }
        return {
            id: tabId,
            title: title,
            url: fullUrl,
            hostname: hostname || 'N/A',
            description: description || 'N/A',
            openerTabId: openerTabId
        };
    };

    const toTitleCase = (str) => {
        if (!str) return "";
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const processTopic = (text) => {
        if (!text) return "Uncategorized";
        const originalTextTrimmedLower = text.trim().toLowerCase();
        const normalizationMap = {
            'github.com': 'GitHub',
            'github': 'GitHub',
            'code repo': 'Code Repos',
            'stackoverflow.com': 'Stack Overflow',
            'stack overflow': 'Stack Overflow',
            'stackoverflow': 'Stack Overflow',
            'google docs': 'Google Docs',
            'docs.google.com': 'Google Docs',
            'document': 'Documents',
            'spreadsheet': 'Spreadsheets',
            'slides': 'Presentations',
            'google drive': 'Google Drive',
            'drive.google.com': 'Google Drive',
            'youtube.com': 'YouTube',
            'youtube': 'YouTube',
            'reddit.com': 'Reddit',
            'reddit': 'Reddit',
            'chatgpt': 'ChatGPT',
            'openai.com': 'OpenAI',
            'gmail': 'Gmail',
            'mail.google.com': 'Gmail',
            'aws': 'AWS',
            'amazon web services': 'AWS',
            'pinterest.com': 'Pinterest',
            'pinterest': 'Pinterest',
            'developer.mozilla.org': 'MDN Web Docs',
            'mdn': 'MDN Web Docs',
            'mozilla': 'Mozilla',
            'dev docs': 'Dev Docs',
            'shopping': 'Shopping',
            'social media': 'Social Media',
            'news article': 'News',
            'search results': 'Search Results',
            'video conf': 'Video Conferencing'
        };

        if (normalizationMap[originalTextTrimmedLower]) return normalizationMap[originalTextTrimmedLower];
        let processedText = text.replace(/^(Category is|The category is|Topic:|Category:|Group:|Name:)\s*"?/i, '');
        processedText = processedText.replace(/^\s*[\d.\-*]+\s*/, '');
        processedText = processedText.replace(/[".*();:,]/g, '');
        let words = processedText.trim().split(/\s+/);
        let category;
        if (words.length > 1 && words[0].toLowerCase() === 'from' && words[1].startsWith('Session')) {
            category = toTitleCase(words.slice(0, 3).join(' '));
        } else if (words.length > 1 && words[0].toLowerCase() === 'from') {
            category = toTitleCase(words.slice(0, 2).join(' '));
        } else {
            category = words.slice(0, 2).join(' ');
        }
        return toTitleCase(category).substring(0, 50) || "Uncategorized";
    };

    const extractTitleKeywords = (title) => {
        if (!title || typeof title !== 'string') return new Set();
        const cleanedTitle = title.toLowerCase().replace(/[-_]/g, ' ').replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
        const words = cleanedTitle.split(' ');
        const keywords = new Set();
        for (const word of words) {
            if (word.length >= CONFIG.minKeywordLength && !CONFIG.titleKeywordStopWords.has(word) && !/^\d+$/.test(word)) {
                keywords.add(word);
            }
        }
        return keywords;
    };

    const getNextGroupColor = () => {
        const color = CONFIG.groupColors[groupColorIndex % CONFIG.groupColors.length];
        groupColorIndex++;
        return color;
    };

    const findGroupElement = (topicName, workspaceId) => {
        const sanitizedTopicName = topicName.trim();
        if (!sanitizedTopicName) return null;
        const safeSelectorTopicName = sanitizedTopicName.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const selector = `tab-group[label="${safeSelectorTopicName}"]:has(tab[zen-workspace-id="${workspaceId}"])`;
        try {
            return document.querySelector(selector);
        } catch (e) {
            console.error(`Error finding group with selector: ${selector}`, e);
            return null;
        }
    };

    const levenshteinDistance = (a, b) => {
        if (!a || !b) return Math.max(a?.length ?? 0, b?.length ?? 0);
        a = a.toLowerCase();
        b = b.toLowerCase();
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                const cost = b[i - 1] === a[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
            }
        }
        return matrix[b.length][a.length];
    };

    const detectContentType = (tabData) => {
        if (!CONFIG.semanticAnalysis.enabled || !tabData || !tabData.url) return null;
        const urlLower = tabData.url.toLowerCase();
        const titleLower = tabData.title.toLowerCase();
        for (const type of CONFIG.semanticAnalysis.contentTypePatterns) {
            for (const pattern of type.patterns) {
                if (pattern.test(urlLower) || pattern.test(titleLower)) return type.name;
            }
        }
        return null;
    };

    const tokenizeForTfIdf = (text) => {
        if (!text) return [];
        return text.toLowerCase().replace(/[^\w\s'-]/g, '').replace(/\s+/g, ' ').trim().split(/\s+/).filter(word => word.length >= 2 && !CONFIG.titleKeywordStopWords.has(word));
    };

    const calculateTfIdf = (tabDocs) => {
        if (!CONFIG.semanticAnalysis.enabled || tabDocs.length < CONFIG.semanticAnalysis.tfIdfMinDocsForCorpus) {
            console.log("TF-IDF: Not enough documents or disabled for TF-IDF calculation step.");
            return {};
        }
        const termFrequencies = {};
        const documentFrequencies = {};
        const corpus = [];
        const totalDocs = tabDocs.length;
        tabDocs.forEach(doc => {
            if (!doc.id || !doc.text) return;
            const tokens = tokenizeForTfIdf(doc.text);
            if (tokens.length === 0) return;
            corpus.push({
                id: doc.id,
                tokens
            });
            const termCountsInDoc = {};
            tokens.forEach(token => {
                termCountsInDoc[token] = (termCountsInDoc[token] || 0) + 1;
            });
            termFrequencies[doc.id] = {};
            const uniqueTermsInDoc = new Set();
            for (const term in termCountsInDoc) {
                termFrequencies[doc.id][term] = termCountsInDoc[term] / tokens.length;
                uniqueTermsInDoc.add(term);
            }
            uniqueTermsInDoc.forEach(term => {
                documentFrequencies[term] = (documentFrequencies[term] || 0) + 1;
            });
        });
        const tfIdfVectors = {};
        corpus.forEach(docInCorpus => {
            tfIdfVectors[docInCorpus.id] = {};
            docInCorpus.tokens.forEach(term => {
                const tf = termFrequencies[docInCorpus.id]?.[term] || 0;
                const idf = Math.log(totalDocs / (documentFrequencies[term] || totalDocs)) + 1;
                tfIdfVectors[docInCorpus.id][term] = tf * idf;
            });
        });
        return tfIdfVectors;
    };

    const cosineSimilarity = (vecA, vecB) => {
        if (!vecA || !vecB || Object.keys(vecA).length === 0 || Object.keys(vecB).length === 0) return 0;
        const allTerms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
        let dotProduct = 0;
        let magnitudeA = 0;
        let magnitudeB = 0;
        for (const term of allTerms) {
            const valA = vecA[term] || 0;
            const valB = vecB[term] || 0;
            dotProduct += valA * valB;
            magnitudeA += valA * valA;
            magnitudeB += valB * valB;
        }
        if (magnitudeA === 0 || magnitudeB === 0) return 0;
        return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
    };

    // --- AI Interaction ---
    const askAIForMultipleTopics = async (tabsWithData, existingCategoryNames = []) => {
        const validTabsWithData = tabsWithData.filter(item => item.tab && item.tab.isConnected && item.data);
        if (!validTabsWithData || validTabsWithData.length === 0) return [];
        const {
            gemini,
            ollama
        } = CONFIG.apiConfig;
        let result = [];
        let apiChoice = "None";
        validTabsWithData.forEach(item => item.tab.classList.add('tab-is-sorting'));

        try {
            const promptTemplateToUse = CONFIG.aiOnlyGrouping ?
                (gemini.enabled ? gemini.promptTemplateAiOnlyBatch : ollama.promptTemplateAiOnlyBatch) :
                (gemini.enabled ? gemini.promptTemplateBatch : ollama.promptTemplateBatch);

            if (!promptTemplateToUse) {
                 throw new Error("Appropriate AI prompt template not found for the selected API and mode.");
            }

            const formattedTabDataList = validTabsWithData.map((item, index) =>
                `${index + 1}.\nTitle: "${item.data.title}"\nURL: "${item.data.url}"\nDescription: "${item.data.description}"\nContentTypeHint: "${item.contentTypeHint || 'N/A'}"\nOpenerID: "${item.data.openerTabId || 'None'}"`
            ).join('\n\n');
            const formattedExistingCategories = existingCategoryNames.length > 0 ? existingCategoryNames.map(name => `- ${name}`).join('\n') : "None";
            const prompt = promptTemplateToUse
                .replace("{EXISTING_CATEGORIES_LIST}", formattedExistingCategories)
                .replace("{TAB_DATA_LIST}", formattedTabDataList);

            if (gemini.enabled && (CONFIG.aiOnlyGrouping || !ollama.enabled)) { // Prioritize Gemini if enabled, or if it's the only one for the mode
                apiChoice = "Gemini";
                if (!gemini.apiKey || gemini.apiKey === 'YOUR_GEMINI-API-KEY' || gemini.apiKey.startsWith('AIzaSyD') && gemini.apiKey.length < 30) throw new Error("Gemini API key is missing or not set. Please paste your key in the CONFIG section."); // Basic check
                console.log(`Batch AI (Gemini): Requesting categories for ${validTabsWithData.length} tabs, context: ${existingCategoryNames.length} existing categories. Mode: ${CONFIG.aiOnlyGrouping ? 'AI-Only' : 'Standard'}`);

                const apiUrl = `${gemini.apiBaseUrl}${gemini.model}:generateContent?key=${gemini.apiKey}`;
                const headers = {
                    'Content-Type': 'application/json'
                };
                const estimatedOutputTokens = Math.max(256, validTabsWithData.length * 20); // Increased base for potentially more complex reasoning in AI-Only
                const requestBody = {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        ...gemini.generationConfig,
                        maxOutputTokens: estimatedOutputTokens
                    }
                };
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(requestBody)
                });
                if (!response.ok) {
                    let errorText = `API Error ${response.status}`;
                    try {
                        const errorData = await response.json();
                        errorText += `: ${errorData?.error?.message || response.statusText}`;
                        console.error("Gemini API Error Response:", errorData);
                    } catch (parseError) {
                        errorText += `: ${response.statusText}`;
                        const rawText = await response.text().catch(() => '');
                        console.error("Gemini API Error Raw Response:", rawText);
                    }
                    if (response.status === 400 && errorText.includes("API key not valid")) throw new Error(`Gemini API Error: API key is not valid. (${errorText})`);
                    if (response.status === 403) throw new Error(`Gemini API Error: Permission denied. Ensure API key has 'generativelanguage.models.generateContent' permission. (${errorText})`);
                    throw new Error(errorText);
                }
                const data = await response.json();
                const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                if (!aiText) {
                    console.error("Gemini API: Empty or unexpected response structure.", data);
                    if (data?.promptFeedback?.blockReason) throw new Error(`Gemini API Error: Request blocked due to ${data.promptFeedback.blockReason}. Ratings: ${JSON.stringify(data.promptFeedback.safetyRatings)}`);
                    if (data?.candidates?.[0]?.finishReason && data.candidates[0].finishReason !== "STOP") throw new Error(`Gemini API Error: Generation finished unexpectedly: ${data.candidates[0].finishReason}.`);
                    throw new Error("Gemini API response content is missing or empty.");
                }
                const lines = aiText.split('\n').map(line => line.trim()).filter(Boolean);
                if (lines.length !== validTabsWithData.length) {
                    console.warn(`Batch AI (Gemini): Mismatch! Expected ${validTabsWithData.length} topics, received ${lines.length}.`);
                    // Flexible handling of mismatch
                    result = validTabsWithData.map((item, i) => ({
                        tab: item.tab,
                        topic: i < lines.length ? processTopic(lines[i]) : "Uncategorized"
                    }));
                } else {
                    const topics = lines.map(processTopic);
                    result = validTabsWithData.map((item, i) => ({
                        tab: item.tab,
                        topic: topics[i]
                    }));
                }
            } else if (ollama.enabled) {
                apiChoice = "Ollama";
                console.log(`Batch AI (Ollama): Requesting categories for ${validTabsWithData.length} tabs, context: ${existingCategoryNames.length} existing categories. Mode: ${CONFIG.aiOnlyGrouping ? 'AI-Only' : 'Standard'}`);
                const requestBody = {
                    model: ollama.model,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: 0.1,
                        num_predict: validTabsWithData.length * 25 // Increased slightly for AI-Only
                    }
                };
                const response = await fetch(ollama.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });
                if (!response.ok) {
                    const errorText = await response.text().catch(() => 'Unknown');
                    throw new Error(`Ollama API Error ${response.status}: ${errorText}`);
                }
                const data = await response.json();
                let aiText = data.response?.trim();
                if (!aiText) throw new Error("Ollama: Empty API response");
                const lines = aiText.split('\n').map(line => line.trim()).filter(Boolean);
                 if (lines.length !== validTabsWithData.length) {
                    console.warn(`Batch AI (Ollama): Mismatch! Expected ${validTabsWithData.length}, received ${lines.length}.`);
                    result = validTabsWithData.map((item, i) => ({
                        tab: item.tab,
                        topic: i < lines.length ? processTopic(lines[i]) : "Uncategorized"
                    }));
                } else {
                    const topics = lines.map(processTopic);
                    result = validTabsWithData.map((item, i) => ({
                        tab: item.tab,
                        topic: topics[i]
                    }));
                }
            } else {
                throw new Error("No AI API is enabled in the configuration for the current mode.");
            }
            return result;
        } catch (error) {
            console.error(`Batch AI (${apiChoice}): Error getting topics:`, error);
            return validTabsWithData.map(item => ({
                tab: item.tab,
                topic: "Uncategorized" // Fallback
            }));
        } finally {
            setTimeout(() => {
                validTabsWithData.forEach(item => {
                    if (item.tab?.isConnected) item.tab.classList.remove('tab-is-sorting');
                });
            }, 200);
        }
    };

    // --- Main Sorting Function ---
    const sortTabsByTopic = async () => {
        if (isSorting) {
            console.log("Sorting already in progress.");
            return;
        }
        isSorting = true;
        tabDataCache.clear(); // Clear cache for fresh data each run
        const selectedTabs = gBrowser.selectedTabs;
        const isSortingSelectedTabs = selectedTabs.length > 1;
        const actionType = isSortingSelectedTabs ? "selected tabs" : "all ungrouped tabs";
        console.log(`Starting tab sort (${actionType} mode) - (v5.1.0)...`);
        let separatorsToSort = [];

        try {
            separatorsToSort = document.querySelectorAll('.vertical-pinned-tabs-container-separator');
            if (separatorsToSort.length > 0) separatorsToSort.forEach(sep => sep.classList.add('separator-is-sorting'));
            else console.warn("Could not find separator element for sorting indicator.");

            const currentWorkspaceId = window.gZenWorkspaces?.activeWorkspace;
            if (!currentWorkspaceId) {
                console.error("Cannot get current workspace ID.");
                isSorting = false; return;
            }

            const allExistingGroupNames = new Set();
            const groupSelector = `tab-group:has(tab[zen-workspace-id="${currentWorkspaceId}"])`;
            document.querySelectorAll(groupSelector).forEach(el => {
                if (el.label) allExistingGroupNames.add(el.label);
            });
            console.log(`Found ${allExistingGroupNames.size} existing group names:`, Array.from(allExistingGroupNames));

            let rawTabsToConsider = [];
            if (isSortingSelectedTabs) {
                rawTabsToConsider = selectedTabs.filter(t => t.getAttribute('zen-workspace-id') === currentWorkspaceId && !t.pinned && !t.hasAttribute('zen-empty-tab') && t.isConnected);
            } else {
                rawTabsToConsider = Array.from(gBrowser.tabs).filter(t => {
                    const inWS = t.getAttribute('zen-workspace-id') === currentWorkspaceId;
                    const groupParent = t.closest('tab-group');
                    const inWSGroup = groupParent ? groupParent.matches(groupSelector) : false;
                    return inWS && !t.pinned && !t.hasAttribute('zen-empty-tab') && !inWSGroup && t.isConnected;
                });
            }
            if (rawTabsToConsider.length === 0) {
                console.log(`No tabs to sort in this workspace (${actionType} mode).`);
                isSorting = false; return;
            }
            console.log(`Found ${rawTabsToConsider.length} raw tabs to process.`);

            const enrichedTabsToSort = [];
            for (const tab of rawTabsToConsider) {
                const data = getTabData(tab);
                tabDataCache.set(tab, data); // Populate cache
                const keywords = extractTitleKeywords(data.title);
                const contentType = detectContentType(data);
                let openerNameHint = `Session ${data.openerTabId}`;
                if (data.openerTabId) {
                    const openerTabEl = Array.from(gBrowser.tabs).find(t => t.id === data.openerTabId && t.isConnected); // Ensure gBrowser.tabs is array
                    if (openerTabEl && !rawTabsToConsider.includes(openerTabEl)) openerNameHint = getTabData(openerTabEl).title || openerNameHint;
                    else if (rawTabsToConsider.includes(openerTabEl)) openerNameHint = null;
                } else openerNameHint = null;
                enrichedTabsToSort.push({
                    tab,
                    data,
                    keywords,
                    contentType,
                    openerTabId: data.openerTabId,
                    openerNameHint
                });
            }

            const finalGroups = {};
            let aiTabTopics = []; // Stores results from AI

            if (CONFIG.aiOnlyGrouping) {
                console.log("--- AI-Only Grouping Mode Activated ---");
                console.log(" -> AI will perform the full grouping logic based on provided instructions.");

                const enrichedTabsForAIOnlyMode = enrichedTabsToSort.filter(et => et.tab.isConnected);
                const existingNamesForAIContext = Array.from(allExistingGroupNames);

                if (enrichedTabsForAIOnlyMode.length > 0) {
                    console.log(` -> Sending ${enrichedTabsForAIOnlyMode.length} tabs to AI for full grouping. Context: ${existingNamesForAIContext.length} existing group names.`);
                    const aiInputData = enrichedTabsForAIOnlyMode.map(et => ({
                        tab: et.tab,
                        data: et.data, // Contains openerTabId
                        contentTypeHint: et.contentType
                    }));
                    aiTabTopics = await askAIForMultipleTopics(aiInputData, existingNamesForAIContext);

                    aiTabTopics.forEach(({ tab, topic }) => {
                        if (!topic || !tab || !tab.isConnected) return;
                        const processedTopicName = processTopic(topic); // Process AI topic
                        if (processedTopicName === "Uncategorized" && enrichedTabsForAIOnlyMode.length > 1) return; // Avoid single "Uncategorized" group if many tabs

                        if (!finalGroups[processedTopicName]) finalGroups[processedTopicName] = [];
                        if (!finalGroups[processedTopicName].includes(tab)) finalGroups[processedTopicName].push(tab);
                    });
                } else {
                    console.log(" -> No tabs to send for AI-only grouping.");
                }

            } else { // Standard multi-stage grouping (CONFIG.aiOnlyGrouping is false)
                const preGroups = {};
                const handledTabs = new Set();

                console.log("--- Pre-Grouping Phase 1: Deterministic ---");
                if (CONFIG.semanticAnalysis.enabled && CONFIG.semanticAnalysis.openerTabGrouping.enabled) {
                    console.log(" -> Opener Tab ID Grouping...");
                    const openerBasedGroups = {};
                    enrichedTabsToSort.forEach(et => {
                        if (et.openerTabId && et.openerNameHint) {
                            const key = `opener_${et.openerTabId}_${et.openerNameHint}`;
                            if (!openerBasedGroups[key]) openerBasedGroups[key] = {
                                tabs: [],
                                nameHint: et.openerNameHint
                            };
                            openerBasedGroups[key].tabs.push(et);
                        }
                    });
                    for (const key in openerBasedGroups) {
                        const groupData = openerBasedGroups[key];
                        if (groupData.tabs.length >= CONFIG.preGroupingThreshold) {
                            const unhandled = groupData.tabs.filter(et => !handledTabs.has(et.tab));
                            if (unhandled.length >= CONFIG.preGroupingThreshold) {
                                let catName = processTopic(`From: ${groupData.nameHint}`);
                                let origName = catName;
                                let c = 1;
                                while (preGroups[catName]) catName = `${origName} (${c++})`;
                                console.log(`   - Opener Group: "${catName}" (Hint: "${groupData.nameHint}", Count: ${unhandled.length})`);
                                preGroups[catName] = unhandled.map(et => et.tab);
                                unhandled.forEach(et => handledTabs.add(et.tab));
                            }
                        }
                    }
                }

                if (CONFIG.semanticAnalysis.enabled && CONFIG.semanticAnalysis.contentTypeGrouping.enabled) {
                    console.log(" -> Content Type Grouping...");
                    const contentTypeBasedGroups = {};
                    enrichedTabsToSort.forEach(et => {
                        if (!handledTabs.has(et.tab) && et.contentType) {
                            if (!contentTypeBasedGroups[et.contentType]) contentTypeBasedGroups[et.contentType] = [];
                            contentTypeBasedGroups[et.contentType].push(et);
                        }
                    });
                    for (const typeName in contentTypeBasedGroups) {
                        if (contentTypeBasedGroups[typeName].length >= CONFIG.preGroupingThreshold) {
                            const catName = processTopic(typeName);
                            if (preGroups[catName]) {
                                const newTabs = contentTypeBasedGroups[typeName].filter(et => !handledTabs.has(et.tab)).map(et => et.tab);
                                if (newTabs.length > 0) {
                                    preGroups[catName].push(...newTabs);
                                    newTabs.forEach(t => handledTabs.add(t));
                                }
                            } else {
                                console.log(`   - Content Type Group: "${catName}" (Type: "${typeName}", Count: ${contentTypeBasedGroups[typeName].length})`);
                                preGroups[catName] = contentTypeBasedGroups[typeName].map(et => et.tab);
                                contentTypeBasedGroups[typeName].forEach(et => handledTabs.add(et.tab));
                            }
                        }
                    }
                }

                console.log(" -> Title Keyword Grouping (for remaining tabs)...");
                const keywordToEnrichedTabsMap = new Map();
                enrichedTabsToSort.forEach(et => {
                    if (!handledTabs.has(et.tab) && et.keywords) {
                        et.keywords.forEach(kw => {
                            if (!keywordToEnrichedTabsMap.has(kw)) keywordToEnrichedTabsMap.set(kw, new Set());
                            keywordToEnrichedTabsMap.get(kw).add(et);
                        });
                    }
                });
                const potentialKeywordGroups = [];
                keywordToEnrichedTabsMap.forEach((tabsSet, kw) => {
                    if (tabsSet.size >= CONFIG.preGroupingThreshold) potentialKeywordGroups.push({ kw, tabs: tabsSet, size: tabsSet.size });
                });
                potentialKeywordGroups.sort((a, b) => b.size - a.size);
                potentialKeywordGroups.forEach(({ kw, tabs }) => {
                    const finalTabsForKW = new Set();
                    tabs.forEach(et => { if (!handledTabs.has(et.tab)) finalTabsForKW.add(et); });
                    if (finalTabsForKW.size >= CONFIG.preGroupingThreshold) {
                        const catName = processTopic(kw);
                        if (preGroups[catName]) {
                            const newToAdd = Array.from(finalTabsForKW).map(et => et.tab).filter(t => !preGroups[catName].includes(t));
                            preGroups[catName].push(...newToAdd);
                        } else {
                            preGroups[catName] = Array.from(finalTabsForKW).map(et => et.tab);
                            console.log(`   - Keyword Group: "${catName}" (Keyword: "${kw}", Count: ${finalTabsForKW.size})`);
                        }
                        finalTabsForKW.forEach(et => handledTabs.add(et.tab));
                    }
                });

                console.log(" -> Hostname Grouping (for remaining tabs)...");
                const hostnameCounts = {};
                enrichedTabsToSort.forEach(et => {
                    if (!handledTabs.has(et.tab)) {
                        const data = et.data;
                        if (data?.hostname && data.hostname !== 'N/A' && data.hostname !== 'Invalid URL' && data.hostname !== 'Internal Page') {
                            hostnameCounts[data.hostname] = (hostnameCounts[data.hostname] || 0) + 1;
                        }
                    }
                });
                const sortedHostnames = Object.keys(hostnameCounts).sort((a, b) => hostnameCounts[b] - hostnameCounts[a]);
                for (const hostname of sortedHostnames) {
                    if (hostnameCounts[hostname] >= CONFIG.preGroupingThreshold) {
                        const catName = processTopic(hostname);
                        const tabsForHost = [];
                        enrichedTabsToSort.forEach(et => { if (!handledTabs.has(et.tab) && et.data?.hostname === hostname) tabsForHost.push(et.tab); });
                        if (tabsForHost.length >= CONFIG.preGroupingThreshold) {
                            if (preGroups[catName]) {
                                preGroups[catName].push(...tabsForHost.filter(t => !preGroups[catName].includes(t)));
                            } else {
                                preGroups[catName] = tabsForHost;
                                console.log(`   - Hostname Group: "${catName}" (Hostname: "${hostname}", Count: ${tabsForHost.length})`);
                            }
                            tabsForHost.forEach(t => handledTabs.add(t));
                        }
                    }
                }

                console.log("--- Pre-Grouping Phase 2: Similarity (TF-IDF) ---");
                const enrichedTabsForTfIdf = enrichedTabsToSort.filter(et => !handledTabs.has(et.tab) && et.tab.isConnected);
                if (CONFIG.semanticAnalysis.enabled && enrichedTabsForTfIdf.length >= CONFIG.semanticAnalysis.tfIdfMinDocsForCorpus) {
                    console.log(` -> Applying TF-IDF for ${enrichedTabsForTfIdf.length} remaining tabs...`);
                    const docsForTfIdf = enrichedTabsForTfIdf.map(et => ({ id: et.tab.id, text: `${et.data.title} ${et.data.description}` }));
                    const tfIdfVectors = calculateTfIdf(docsForTfIdf);
                    if (Object.keys(tfIdfVectors).length > 0) {
                        const tabSimilarities = {};
                        for (let i = 0; i < enrichedTabsForTfIdf.length; i++) {
                            const etA = enrichedTabsForTfIdf[i];
                            if (!tfIdfVectors[etA.tab.id] || handledTabs.has(etA.tab)) continue;
                            if (!tabSimilarities[etA.tab.id]) tabSimilarities[etA.tab.id] = [];
                            for (let j = i + 1; j < enrichedTabsForTfIdf.length; j++) {
                                const etB = enrichedTabsForTfIdf[j];
                                if (!tfIdfVectors[etB.tab.id] || handledTabs.has(etB.tab)) continue;
                                const score = cosineSimilarity(tfIdfVectors[etA.tab.id], tfIdfVectors[etB.tab.id]);
                                if (score >= CONFIG.semanticAnalysis.minSimilarityScore) {
                                    tabSimilarities[etA.tab.id].push({ tab: etB.tab, score });
                                    if (!tabSimilarities[etB.tab.id]) tabSimilarities[etB.tab.id] = [];
                                    tabSimilarities[etB.tab.id].push({ tab: etA.tab, score });
                                }
                            }
                            if (tabSimilarities[etA.tab.id]) tabSimilarities[etA.tab.id].sort((a, b) => b.score - a.score);
                        }
                        const tfIdfGroupedTabObjs = new Set();
                        for (const etOuter of enrichedTabsForTfIdf) {
                            if (handledTabs.has(etOuter.tab) || tfIdfGroupedTabObjs.has(etOuter.tab)) continue;
                            const similarRawTabs = [etOuter.tab];
                            if (tabSimilarities[etOuter.tab.id]) {
                                tabSimilarities[etOuter.tab.id].forEach(simMatch => {
                                    if (!handledTabs.has(simMatch.tab) && !tfIdfGroupedTabObjs.has(simMatch.tab) && simMatch.score >= CONFIG.semanticAnalysis.minSimilarityScore) {
                                        similarRawTabs.push(simMatch.tab);
                                    }
                                });
                            }
                            if (similarRawTabs.length >= CONFIG.preGroupingThreshold) {
                                const repTabData = tabDataCache.get(similarRawTabs[0]);
                                let groupName = processTopic(repTabData.title || "Similar Content");
                                let origName = groupName;
                                let c = 1;
                                while (preGroups[groupName] || Object.values(preGroups).flat().includes(similarRawTabs[0])) groupName = `${origName} (Sim ${c++})`;
                                console.log(`   - TF-IDF Group: "${groupName}" (Based on "${repTabData.title}", Count: ${similarRawTabs.length})`);
                                preGroups[groupName] = similarRawTabs;
                                similarRawTabs.forEach(t => { handledTabs.add(t); tfIdfGroupedTabObjs.add(t); });
                            }
                        }
                    }
                } else {
                     console.log(` -> Skipping TF-IDF: SemanticAnalysisEnabled=${CONFIG.semanticAnalysis.enabled}, TabsForTFIDF=${enrichedTabsForTfIdf.length}, MinDocsRequired=${CONFIG.semanticAnalysis.tfIdfMinDocsForCorpus}`);
                }

                console.log("--- AI Grouping (for remaining tabs) ---");
                const enrichedTabsForAI = enrichedTabsToSort.filter(et => !handledTabs.has(et.tab) && et.tab.isConnected);
                const comprehensiveExistingNamesForAI = new Set([...allExistingGroupNames, ...Object.keys(preGroups)]);
                const existingNamesForAIContext = Array.from(comprehensiveExistingNamesForAI);

                if (enrichedTabsForAI.length > 0) {
                    console.log(` -> ${enrichedTabsForAI.length} tabs remaining for AI. Context: ${existingNamesForAIContext.length} existing/pre-group names.`);
                    const aiInputData = enrichedTabsForAI.map(et => ({
                        tab: et.tab,
                        data: et.data, // Contains openerTabId
                        contentTypeHint: et.contentType
                    }));
                    aiTabTopics = await askAIForMultipleTopics(aiInputData, existingNamesForAIContext);
                } else {
                    console.log(" -> No tabs remaining for AI analysis.");
                }

                console.log("--- Combining Groups (Standard Mode) ---");
                for (const groupName in preGroups) { // Populate finalGroups with preGroups
                    if (preGroups.hasOwnProperty(groupName)) {
                        finalGroups[groupName] = [...(preGroups[groupName] || [])].filter(t => t && t.isConnected);
                    }
                }
                aiTabTopics.forEach(({ tab, topic }) => { // Add AI topics for non-handled tabs
                    if (!topic || !tab || !tab.isConnected) return;
                    const processedTopicName = processTopic(topic);
                    if (processedTopicName === "Uncategorized" && enrichedTabsForAI.length > 1) return;

                    // Tabs in aiTabTopics are guaranteed not to be in handledTabs here
                    if (!finalGroups[processedTopicName]) finalGroups[processedTopicName] = [];
                    if (!finalGroups[processedTopicName].includes(tab)) finalGroups[processedTopicName].push(tab);
                });
            }

            // --- Shared Logic from here ---
            console.log(" -> Consolidating group names (Levenshtein)...");
            const originalKeys = Object.keys(finalGroups);
            const mergedKeys = new Set();
            const consolidationMap = {};

            for (let i = 0; i < originalKeys.length; i++) {
                let keyA = originalKeys[i];
                if (mergedKeys.has(keyA)) continue;
                while (consolidationMap[keyA]) keyA = consolidationMap[keyA]; // Follow chain if keyA was already merged into another
                if (mergedKeys.has(keyA)) continue;

                for (let j = i + 1; j < originalKeys.length; j++) {
                    let keyB = originalKeys[j];
                    if (mergedKeys.has(keyB)) continue;
                    while (consolidationMap[keyB]) keyB = consolidationMap[keyB];
                    if (mergedKeys.has(keyB) || keyA === keyB) continue;

                    const distance = levenshteinDistance(keyA, keyB);
                    if (distance <= CONFIG.consolidationDistanceThreshold && distance > 0) { // distance > 0 ensures they are not identical already
                        let canonicalKey = keyA;
                        let mergedKeyVal = keyB;

                        const keyAExistsAsActualGroup = allExistingGroupNames.has(keyA);
                        const keyBExistsAsActualGroup = allExistingGroupNames.has(keyB);

                        if (keyBExistsAsActualGroup && !keyAExistsAsActualGroup) {
                            [canonicalKey, mergedKeyVal] = [keyB, keyA];
                        } else if (keyAExistsAsActualGroup == keyBExistsAsActualGroup) { // Both exist or neither exist
                            if (keyA.length > keyB.length) { // Prefer shorter name
                                [canonicalKey, mergedKeyVal] = [keyB, keyA];
                            } else if (keyA.length === keyB.length && keyA > keyB) { // Prefer lexicographically smaller if same length
                                [canonicalKey, mergedKeyVal] = [keyB, keyA];
                            }
                        }
                        // If keyAExistsAsActualGroup and !keyBExistsAsActualGroup, canonicalKey is already keyA (preferred)

                        console.log(`    - Consolidating: Merging "${mergedKeyVal}" into "${canonicalKey}" (Distance: ${distance})`);
                        if (finalGroups[mergedKeyVal]) {
                            if (!finalGroups[canonicalKey]) finalGroups[canonicalKey] = [];
                            finalGroups[mergedKeyVal].forEach(t => {
                                if (t?.isConnected && !finalGroups[canonicalKey].includes(t)) {
                                    finalGroups[canonicalKey].push(t);
                                }
                            });
                        }
                        mergedKeys.add(mergedKeyVal);
                        consolidationMap[mergedKeyVal] = canonicalKey; // Record the merge target
                        delete finalGroups[mergedKeyVal];

                        if (mergedKeyVal === keyA) { // If keyA was the one merged away, update keyA to canonical for current outer loop iteration
                            keyA = canonicalKey;
                            break; // Re-evaluate keyA (now canonicalKey) against subsequent keys
                        }
                    }
                }
            }

            console.log(" -> Final groups for action:", Object.keys(finalGroups).map(k => `${k} (${finalGroups[k]?.length ?? 0})`).join('; ') || "None");
            if (Object.keys(finalGroups).length === 0) {
                console.log("No valid groups identified after all steps. Sorting finished.");
                isSorting = false; return;
            }

            const existingGroupElementsMap = new Map();
            document.querySelectorAll(groupSelector).forEach(el => {
                if (el.label) existingGroupElementsMap.set(el.label, el);
            });
            groupColorIndex = 0; // Reset color index for new groups

            for (const topic in finalGroups) {
                const tabsForThisTopic = finalGroups[topic].filter(t => t?.isConnected);
                if (tabsForThisTopic.length === 0) {
                    console.log(` -> Skipping group "${topic}" as no valid tabs remain.`);
                    continue;
                }

                const existingEl = existingGroupElementsMap.get(topic) || findGroupElement(topic, currentWorkspaceId);

                if (existingEl?.isConnected) {
                    console.log(` -> Moving ${tabsForThisTopic.length} tabs to existing group "${topic}".`);
                    if (existingEl.getAttribute("collapsed") === "true") {
                        existingEl.setAttribute("collapsed", "false");
                        existingEl.querySelector('.tab-group-label')?.setAttribute('aria-expanded', 'true');
                    }
                    for (const tab of tabsForThisTopic) {
                        // Only move if not already in this exact group element
                        if (tab.closest('tab-group') !== existingEl) {
                             gBrowser.moveTabToGroup(tab, existingEl);
                        }
                    }
                } else {
                     // Determine if group creation is justified
                    const wasFromAI = CONFIG.aiOnlyGrouping || aiTabTopics.some(ait => processTopic(ait.topic) === topic && tabsForThisTopic.includes(ait.tab));
                    const meetsThreshold = tabsForThisTopic.length >= CONFIG.preGroupingThreshold;

                    if (meetsThreshold || (wasFromAI && tabsForThisTopic.length > 0) ) { // Create if meets threshold, or if AI made it (even if small, for AI-Only mode)
                        console.log(` -> Creating new group "${topic}" with ${tabsForThisTopic.length} tabs.`);
                        const groupOpts = {
                            label: topic,
                            color: getNextGroupColor(),
                            insertBefore: tabsForThisTopic[0] // Sensible default insertion point
                        };
                        try {
                            // Filter tabs that might already be in *some* group if moving them to a new one
                            const tabsToActuallyGroup = tabsForThisTopic.filter(t => !t.closest('tab-group'));
                            if (tabsToActuallyGroup.length === 0 && tabsForThisTopic.length > 0) { // All tabs are already in some groups, but not this one
                                console.warn(` -> Group "${topic}" intended, but all its tabs are already in other groups. This might indicate a consolidation issue or complex state.`);
                                // Potentially try to move them if that's desired, but for now, log and skip direct creation with these tabs.
                                // This scenario should be rare if consolidation works well.
                                continue;
                            }
                            if (tabsToActuallyGroup.length > 0) {
                                const newGroup = gBrowser.addTabGroup(tabsToActuallyGroup, groupOpts);
                                if (newGroup?.isConnected) existingGroupElementsMap.set(topic, newGroup);
                                else {
                                    const fb = findGroupElement(topic, currentWorkspaceId); // Retry find
                                    if (fb?.isConnected) existingGroupElementsMap.set(topic, fb);
                                    else console.error(` -> Failed to find/create group element for "${topic}" after creation attempt.`);
                                }
                            } else {
                                console.log(` -> No ungrouped tabs available to form new group "${topic}".`);
                            }
                        } catch (e) {
                            console.error(`Error gBrowser.addTabGroup for "${topic}":`, e);
                        }
                    } else {
                        console.log(` -> Skipping creation of small group "${topic}" (${tabsForThisTopic.length} tabs, not meeting threshold/AI criteria).`);
                    }
                }
            }
            console.log("--- Tab sorting process complete ---");
        } catch (error) {
            console.error("Error during overall sorting process:", error);
        } finally {
            isSorting = false;
            if (separatorsToSort.length > 0) separatorsToSort.forEach(sep => {
                if (sep?.isConnected) sep.classList.remove('separator-is-sorting');
            });
            setTimeout(() => {
                Array.from(gBrowser.tabs).forEach(t => { // Ensure gBrowser.tabs is an array
                    if (t?.isConnected) t.classList.remove('tab-is-sorting');
                });
            }, 500);
        }
    };

    // --- Clear Tabs Functionality ---
    const clearTabs = () => {
        console.log("Clearing tabs...");
        let closedCount = 0;
        try {
            const currentWorkspaceId = window.gZenWorkspaces?.activeWorkspace;
            if (!currentWorkspaceId) {
                console.error("CLEAR BTN: Cannot get current workspace ID.");
                return;
            }
            const groupSelector = `tab-group:has(tab[zen-workspace-id="${currentWorkspaceId}"])`;
            const tabsToClose = [];
            for (const tab of Array.from(gBrowser.tabs)) { // Ensure gBrowser.tabs is an array
                const isSameWorkSpace = tab.getAttribute('zen-workspace-id') === currentWorkspaceId;
                const groupParent = tab.closest('tab-group');
                const isInGroupInCorrectWorkspace = groupParent ? groupParent.matches(groupSelector) : false;
                const isEmptyZenTab = tab.hasAttribute("zen-empty-tab");
                if (isSameWorkSpace && !tab.selected && !tab.pinned && !isInGroupInCorrectWorkspace && !isEmptyZenTab && tab.isConnected) {
                    tabsToClose.push(tab);
                }
            }
            if (tabsToClose.length === 0) {
                console.log("CLEAR BTN: No ungrouped, non-pinned, non-active tabs to clear.");
                return;
            }
            console.log(`CLEAR BTN: Closing ${tabsToClose.length} tabs.`);
            tabsToClose.forEach(tab => {
                tab.classList.add('tab-closing');
                closedCount++;
                setTimeout(() => {
                    if (tab?.isConnected) {
                        try {
                            gBrowser.removeTab(tab, {
                                animate: false,
                                skipSessionStore: false,
                                closeWindowWithLastTab: false
                            });
                        } catch (removeError) {
                            console.warn(`CLEAR BTN: Error removing tab: ${removeError}`, tab);
                            if(tab?.isConnected) tab.classList.remove('tab-closing'); // Remove class if still connected after error
                        }
                    }
                }, 500);
            });
        } catch (error) {
            console.error("CLEAR BTN: Error during tab clearing:", error);
        } finally {
            console.log(`CLEAR BTN: Initiated closing for ${closedCount} tabs.`);
        }
    };

    // --- Button Initialization & Workspace Handling ---
    function ensureButtonsExist(container) {
        if (!container) return;
        if (!container.querySelector('#sort-button')) {
            try {
                const bf = window.MozXULElement.parseXULToFragment(`<toolbarbutton id="sort-button" command="cmd_zenSortTabs" label="⇅ Sort" tooltiptext="Sort Tabs into Groups (AI + Semantic)"/>`);
                container.appendChild(bf.firstChild.cloneNode(true));
            } catch (e) {
                console.error("BUTTONS: Error creating sort button:", e);
            }
        }
        if (!container.querySelector('#clear-button')) {
            try {
                const bf = window.MozXULElement.parseXULToFragment(`<toolbarbutton id="clear-button" command="cmd_zenClearTabs" label="↓ Clear" tooltiptext="Close ungrouped, non-pinned tabs"/>`);
                container.appendChild(bf.firstChild.cloneNode(true));
            } catch (e) {
                console.error("BUTTONS: Error creating clear button:", e);
            }
        }
    }

    function addButtonsToAllSeparators() {
        const separators = document.querySelectorAll(".vertical-pinned-tabs-container-separator");
        if (separators.length > 0) separators.forEach(ensureButtonsExist);
        else {
            const periphery = document.querySelector('#tabbrowser-arrowscrollbox-periphery');
            if (periphery && !periphery.querySelector('#sort-button') && !periphery.querySelector('#clear-button')) {
                console.warn("BUTTONS: No separators found, fallback to periphery.");
                ensureButtonsExist(periphery);
            } else if (!periphery) console.error("BUTTONS: No separators or fallback container found.");
        }
    }

    function setupCommandsAndListener() {
        const zenCommands = document.querySelector("commandset#zenCommandSet");
        if (!zenCommands) {
            console.error("BUTTONS INIT: Could not find 'commandset#zenCommandSet'.");
            return;
        }
        if (!zenCommands.querySelector("#cmd_zenSortTabs")) {
            try {
                zenCommands.appendChild(window.MozXULElement.parseXULToFragment(`<command id="cmd_zenSortTabs"/>`).firstChild);
            } catch (e) {
                console.error("BUTTONS INIT: Error adding 'cmd_zenSortTabs':", e);
            }
        }
        if (!zenCommands.querySelector("#cmd_zenClearTabs")) {
            try {
                zenCommands.appendChild(window.MozXULElement.parseXULToFragment(`<command id="cmd_zenClearTabs"/>`).firstChild);
            } catch (e) {
                console.error("BUTTONS INIT: Error adding 'cmd_zenClearTabs':", e);
            }
        }
        if (!commandListenerAdded) {
            try {
                zenCommands.addEventListener('command', (event) => {
                    if (event.target.id === "cmd_zenSortTabs") sortTabsByTopic();
                    else if (event.target.id === "cmd_zenClearTabs") clearTabs();
                });
                commandListenerAdded = true;
                console.log("BUTTONS INIT: Command listener added.");
            } catch (e) {
                console.error("BUTTONS INIT: Error adding command listener:", e);
            }
        }
    }

    function setupZenWorkspaceHooks() {
        if (typeof gZenWorkspaces === 'undefined') {
            console.warn("BUTTONS: gZenWorkspaces not found. Skipping hooks.");
            return;
        }
        if (typeof gZenWorkspaces.originalHooks !== 'undefined' && gZenWorkspaces.originalHooks.customSortClearApplied) return; // Check if already applied

        gZenWorkspaces.originalHooks = {
            ...(gZenWorkspaces.originalHooks || {}), // Preserve other hooks if any
            onTabBrowserInserted: gZenWorkspaces.onTabBrowserInserted,
            updateTabsContainers: gZenWorkspaces.updateTabsContainers,
            customSortClearApplied: true // Mark as applied
        };

        gZenWorkspaces.onTabBrowserInserted = function (event) {
            if (typeof gZenWorkspaces.originalHooks.onTabBrowserInserted === 'function' && gZenWorkspaces.originalHooks.onTabBrowserInserted !== gZenWorkspaces.onTabBrowserInserted) { // Avoid recursion
                try {
                    gZenWorkspaces.originalHooks.onTabBrowserInserted.call(gZenWorkspaces, event);
                } catch (e) {
                    console.error("HOOK: Error in original onTabBrowserInserted:", e);
                }
            }
            setTimeout(addButtonsToAllSeparators, 150);
        };
        gZenWorkspaces.updateTabsContainers = function (...args) {
            if (typeof gZenWorkspaces.originalHooks.updateTabsContainers === 'function' && gZenWorkspaces.originalHooks.updateTabsContainers !== gZenWorkspaces.updateTabsContainers) { // Avoid recursion
                try {
                    gZenWorkspaces.originalHooks.updateTabsContainers.apply(gZenWorkspaces, args);
                } catch (e) {
                    console.error("HOOK: Error in original updateTabsContainers:", e);
                }
            }
            setTimeout(addButtonsToAllSeparators, 150);
        };
        console.log("BUTTONS HOOK: gZenWorkspaces hooks applied for Sort & Clear.");
    }

    // --- Initial Setup Trigger ---
    function initializeScript() {
        console.log("INIT: Sort & Clear Tabs Script (v5.1.0) loading...");
        let checkCount = 0;
        const maxChecks = 30;
        const checkInterval = 1000;
        const initCheckInterval = setInterval(() => {
            checkCount++;
            const sepExists = !!document.querySelector(".vertical-pinned-tabs-container-separator");
            const periphExists = !!document.querySelector('#tabbrowser-arrowscrollbox-periphery');
            const cmdSetExists = !!document.querySelector("commandset#zenCommandSet");
            const gBReady = typeof gBrowser !== 'undefined' && gBrowser.tabContainer;
            const gZWReady = typeof gZenWorkspaces !== 'undefined' && typeof gZenWorkspaces.activeWorkspace !== 'undefined'; // Check for activeWorkspace
            const ready = gBReady && cmdSetExists && (sepExists || periphExists) && gZWReady;

            if (ready) {
                console.log(`INIT: Required elements found after ${checkCount} checks. Initializing...`);
                clearInterval(initCheckInterval);
                const finalSetup = () => {
                    try {
                        injectStyles();
                        setupCommandsAndListener();
                        addButtonsToAllSeparators(); // Initial call
                        setupZenWorkspaceHooks();   // Setup hooks that will also call addButtons
                        console.log("INIT: Sort & Clear Button setup and hooks complete.");
                    } catch (e) {
                        console.error("INIT: Error during deferred final setup:", e);
                    }
                };
                if ('requestIdleCallback' in window) requestIdleCallback(finalSetup, { timeout: 2000 });
                else setTimeout(finalSetup, 500);
            } else if (checkCount > maxChecks) {
                clearInterval(initCheckInterval);
                console.error(`INIT: Failed to find required elements after ${maxChecks} checks. Status:`, {
                    gBReady,
                    cmdSetExists,
                    sepExists,
                    periphExists,
                    gZWReady
                });
            }
        }, checkInterval);
    }

    if (document.readyState === "complete" || document.readyState === "interactive") {
        initializeScript();
    } else {
        window.addEventListener("load", initializeScript, {
            once: true
        });
    }

})();
