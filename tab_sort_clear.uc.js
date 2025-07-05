// VERSION 5.2.4 - Two-Pass AI & Pretty Names
(() => {
    // --- Configuration ---
    const CONFIG = {
        aiOnlyGrouping: false, // << --- Set to true to let AI handle all grouping logic

        // --- Scoring Weights & Thresholds ---
        scoringWeights: {
            existingGroup: 0.90,
            opener: 0.85,
            contentType: 0.80,
            hostname: 0.75,
            aiSuggestion: 0.70,
            keyword: 0.60
        },

        thresholds: {
            minGroupingScore: 0.55,
            minTabsForNewGroup: 2 // Threshold for the FIRST pass. AI pass will group everything.
        },

        // Essential hostname-to-brand mappings
        normalizationMap: {
            'github.com': 'GitHub',
            'github': 'GitHub',
            'stackoverflow.com': 'Stack Overflow',
            'stackoverflow': 'Stack Overflow',
            'youtube.com': 'YouTube',
            'youtube': 'YouTube',
            'docs.google.com': 'Google Docs',
            'drive.google.com': 'Google Drive',
            'mail.google.com': 'Gmail',
            'reddit.com': 'Reddit',
            'openai.com': 'OpenAI',
            'chatgpt': 'ChatGPT',
            'developer.mozilla.org': 'MDN Web Docs',
            'mdn': 'MDN Web Docs',
            'pinterest.com': 'Pinterest',
            'ibm.com': 'IBM',
            // *** NEW: Added pretty names for your university examples ***
            'tum.de': 'TUM',
            'lmu.de': 'LMU',
            'uni-heidelberg.de': 'Heidelberg University'
        },
  
        apiConfig: {
            ollama: {
                endpoint: 'http://localhost:11434/api/generate',
                enabled: false,
                model: 'llama3.1:latest'
            },
            gemini: {
                enabled: true,
                apiKey: '', // <<<--- PASTE YOUR KEY HERE --- >>>
                model: 'gemini-1.5-flash-latest',
                apiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/',
                generationConfig: {
                    temperature: 0.1,
                    candidateCount: 1,
                }
            },
            prompts: {
                standard: `Analyze the following numbered list of tab data (Title, URL, Description, ContentTypeHint, OpenerID) and assign a concise category (1-2 words, Title Case) for EACH tab.
  
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
  
                aiOnly: `Analyze the following numbered list of tab data (Title, URL, Description, ContentTypeHint, OpenerID) and assign a concise category (1-2 words, Title Case) for EACH tab.
  
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
            }
        },
  
        consolidationDistanceThreshold: 2,
        minKeywordLength: 3,
        groupColors: [
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
        .vertical-pinned-tabs-container-separator {
             display: flex !important;
             flex-direction: column;
             margin-left: 0;
             min-height: 1px;
             background-color: var(--lwt-toolbarbutton-border-color, rgba(200, 200, 200, 0.1));
             transition: width 0.1s ease-in-out, margin-right 0.1s ease-in-out, background-color 0.3s ease-out;
        }
        .vertical-pinned-tabs-container-separator:has(#sort-button):has(#clear-button):hover {
            width: calc(100% - 115px);
            margin-right: auto;
            background-color: var(--lwt-toolbarbutton-hover-background, rgba(200, 200, 200, 0.2));
        }
        .vertical-pinned-tabs-container-separator:hover #sort-button,
        .vertical-pinned-tabs-container-separator:hover #clear-button {
            opacity: 1;
        }
        @keyframes pulse-separator-bg {
            0% { background-color: var(--lwt-toolbarbutton-border-color, rgb(255, 141, 141)); }
            50% { background-color: var(--lwt-toolbarbutton-hover-background, rgba(137, 178, 255, 0.91)); }
            100% { background-color: var(--lwt-toolbarbutton-border-color, rgb(142, 253, 238)); }
        }
        .separator-is-sorting {
            animation: pulse-separator-bg 1.5s ease-in-out infinite;
            will-change: background-color;
        }
        .tab-closing {
            animation: fadeUp 0.5s forwards;
        }
        @keyframes fadeUp {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); max-height: 0px; padding: 0; margin: 0; border: 0; }
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
            transition: transform 0.3s ease-out, opacity 0.3s ease-out, max-height 0.5s ease-out, margin 0.5s ease-out, padding 0.5s ease-out;
        }
        `
    };
  
    // --- Globals & State ---
    let groupColorIndex = 0;
    let isSorting = false;
    let commandListenerAdded = false;
    let tabDataCache = new Map();

    // --- SCORING SYSTEM ARCHITECTURE ---

    class TabGroupingEngine {
        constructor(enrichedTabs, existingGroups) {
            this.enrichedTabs = enrichedTabs;
            this.existingGroups = existingGroups;
            this.scorers = [
                new OpenerScorer(),
                new ContentTypeScorer(),
                new HostnameScorer(),
                new KeywordScorer(),
                new ExistingGroupScorer()
            ];
            this.tabProposals = new Map();
        }

        generateProposals(context) {
            console.log("--- Generating Score Proposals ---");
            this.enrichedTabs.forEach(et => {
                const proposals = [];
                this.scorers.forEach(scorer => {
                    proposals.push(...scorer.propose(et, this.enrichedTabs, this.existingGroups));
                });

                if (context.aiResults.has(et.tab)) {
                    const aiTopic = context.aiResults.get(et.tab);
                    if (aiTopic !== "Uncategorized") {
                        proposals.push({
                            groupName: aiTopic,
                            score: CONFIG.scoringWeights.aiSuggestion,
                            source: 'AI'
                        });
                    }
                }
                this.tabProposals.set(et.tab, proposals);
            });
        }
        
        // *** FIXED: Logic to correctly identify leftover tabs ***
        resolveGroupAssignments() {
            console.log("--- Resolving Group Assignments (First Pass) ---");
            const provisionalGroups = new Map();
            
            // Assign every tab to its best possible group provisionally
            this.enrichedTabs.forEach(et => {
                const proposals = this.tabProposals.get(et.tab);
                if (!proposals || proposals.length === 0) return;
                
                proposals.sort((a, b) => b.score - a.score);
                const bestProposal = proposals[0];

                if (bestProposal && bestProposal.score >= CONFIG.thresholds.minGroupingScore) {
                    const groupName = bestProposal.groupName;
                    if (!provisionalGroups.has(groupName)) {
                        provisionalGroups.set(groupName, []);
                    }
                    provisionalGroups.get(groupName).push(et.tab);
                }
            });

            const finalGroups = new Map();
            const leftoverTabs = [];
            const assignedTabs = new Set();

            // Now, filter the provisional groups into final groups and leftovers
            for (const [name, tabs] of provisionalGroups.entries()) {
                const isExisting = this.existingGroups.has(name);
                if (tabs.length >= CONFIG.thresholds.minTabsForNewGroup || isExisting) {
                    finalGroups.set(name, tabs);
                    tabs.forEach(t => assignedTabs.add(t));
                }
            }
            
            // Any tab not in a final group is a leftover
            this.enrichedTabs.forEach(et => {
                if (!assignedTabs.has(et.tab)) {
                    leftoverTabs.push(et);
                }
            });

            console.log(`First Pass Results: ${finalGroups.size} groups formed, ${leftoverTabs.length} tabs remaining for AI cleanup.`);
            
            const finalGroupsObject = {};
            for(const [name, tabs] of finalGroups) {
                finalGroupsObject[name] = tabs;
            }

            return { finalGroups: finalGroupsObject, leftoverTabs };
        }
    }

    // --- Individual Scorer Implementations ---

    class OpenerScorer {
        propose(tab, allTabs, existingGroups) {
            if (tab.openerTab?.isConnected) {
                const openerEnrichedTab = allTabs.find(et => et.tab.id === tab.openerTab.id);
                if (openerEnrichedTab) {
                    const groupName = processTopic(openerEnrichedTab.data.title);
                    return [{ groupName, score: CONFIG.scoringWeights.opener, source: 'Opener' }];
                }
            }
            return [];
        }
    }

    class ContentTypeScorer {
        propose(tab, allTabs, existingGroups) {
            if (tab.contentType) {
                return [{ groupName: tab.contentType, score: CONFIG.scoringWeights.contentType, source: 'Content-Type' }];
            }
            return [];
        }
    }

    class HostnameScorer {
        propose(tab, allTabs, existingGroups) {
            if (tab.data.hostname && tab.data.hostname !== 'N/A') {
                const groupName = processTopic(tab.data.hostname);
                return [{ groupName, score: CONFIG.scoringWeights.hostname, source: 'Hostname' }];
            }
            return [];
        }
    }
    
    class KeywordScorer {
        propose(tab, allTabs, existingGroups) {
            const proposals = [];
            if (tab.keywords) {
                tab.keywords.forEach(kw => {
                    proposals.push({
                        groupName: processTopic(kw),
                        score: CONFIG.scoringWeights.keyword,
                        source: 'Keyword'
                    });
                });
            }
            return proposals;
        }
    }
    
    class ExistingGroupScorer {
        propose(tab, allTabs, existingGroups) {
            const proposals = [];
            if (!existingGroups) return [];

            for (const [groupName, groupData] of existingGroups) {
                const similarity = this.calculateSimilarityToGroup(tab, groupData);
                if (similarity > 0.4) {
                    proposals.push({
                        groupName,
                        score: CONFIG.scoringWeights.existingGroup * similarity,
                        source: 'Existing Group'
                    });
                }
            }
            return proposals;
        }
        
        calculateSimilarityToGroup(tab, groupData) {
            let factors = 0;
            let totalScore = 0;
            if (tab.data.hostname && groupData.commonHostnames?.includes(tab.data.hostname)) {
                totalScore += 1.0;
                factors++;
            }
            if (tab.contentType && groupData.contentTypes?.includes(tab.contentType)) {
                totalScore += 1.0;
                factors++;
            }
            if (tab.keywords && groupData.commonKeywords) {
                const overlap = [...tab.keywords].filter(kw => groupData.commonKeywords.includes(kw));
                if (overlap.length > 0) {
                    totalScore += overlap.length / tab.keywords.size;
                    factors++;
                }
            }
            return factors > 0 ? totalScore / factors : 0;
        }
    }

    // --- Helper Functions ---
  
    const injectStyles = () => {
        let styleElement = document.getElementById('tab-sort-clear-styles');
        if (styleElement) {
            if (styleElement.textContent !== CONFIG.styles) {
                styleElement.textContent = CONFIG.styles;
            }
            return;
        }
        styleElement = Object.assign(document.createElement('style'), {
            id: 'tab-sort-clear-styles',
            textContent: CONFIG.styles
        });
        document.head.appendChild(styleElement);
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
        let openerTabId = tab.openerTab?.id || null;
  
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

    const analyzeExistingGroups = (workspaceId) => {
        const existingGroups = new Map();
        const groupSelector = WorkspaceUtils.getGroupSelector(workspaceId);
        
        document.querySelectorAll(groupSelector).forEach(groupEl => {
            const label = groupEl.getAttribute('label');
            if (!label) return;
            
            const tabsInGroup = Array.from(groupEl.querySelectorAll('tab'))
                .filter(tab => TabFilters.isValidForWorkspace(tab, workspaceId))
                .map(tab => getTabData(tab));
                
            if (tabsInGroup.length === 0) return;
            
            const commonHostnames = [...new Set(tabsInGroup.map(t => t.hostname).filter(h => h && h !== 'N/A'))];
            const commonKeywords = extractCommonKeywords(tabsInGroup.map(t => t.title));
            const contentTypes = [...new Set(tabsInGroup.map(t => detectContentType(t)).filter(ct => ct))];
            
            existingGroups.set(label, {
                tabs: tabsInGroup,
                commonHostnames,
                commonKeywords,
                contentTypes,
                size: tabsInGroup.length
            });
        });
        
        console.log(`Found ${existingGroups.size} existing groups with analysis.`);
        return existingGroups;
    };

    const extractCommonKeywords = (titles) => {
        const keywordCounts = new Map();
        titles.forEach(title => {
            const keywords = extractTitleKeywords(title);
            keywords.forEach(keyword => {
                keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
            });
        });
        
        const threshold = Math.max(1, Math.floor(titles.length * 0.4));
        return Array.from(keywordCounts.entries())
            .filter(([_, count]) => count >= threshold)
            .sort((a, b) => b[1] - a[1])
            .map(([keyword]) => keyword);
    };
  
    const toTitleCase = (str) => {
        if (!str) return "";
        return str.toLowerCase().split(' ').map(word => {
            if (word.toUpperCase() === 'AI' || word.toUpperCase() === 'XAI' ) return word.toUpperCase();
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    };
  
    // *** FIXED: Now creates "pretty names" ***
    const processTopic = (text) => {
        if (!text) return "Uncategorized";
        let processedText = text.trim().toLowerCase();
        
        if (CONFIG.normalizationMap[processedText]) {
            return CONFIG.normalizationMap[processedText];
        }
        
        processedText = processedText.replace(/^(Category is|The category is|Topic:|Category:|Group:|Name:)\s*"?/i, '');
        processedText = processedText.replace(/^\s*[\d.\-*]+\s*/, '');
        
        // Prettify by removing TLDs and replacing separators with spaces
        processedText = processedText.replace(/\.(com|de|org|io|net|md|gov|edu)/g, ' ');
        processedText = processedText.replace(/[.\-_]/g, ' ');
        
        // Remove remaining unwanted characters
        processedText = processedText.replace(/["*();:,]/g, ''); 
        
        let words = processedText.trim().split(/\s+/);
        
        let category = toTitleCase(words.slice(0, 3).join(' '));
        return category.substring(0, 50) || "Uncategorized";
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
        
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();

        // First, check for case-insensitive equality. This should always be a distance of 0.
        if (aLower === bLower) {
            return 0; 
        }

        if (a.length <= 3 || b.length <= 3) {
            // Return a value higher than any reasonable consolidation threshold.
            return 99; 
        }

        // --- Original Levenshtein calculation for longer strings ---
        const matrix = [];
        for (let i = 0; i <= bLower.length; i++) matrix[i] = [i];
        for (let j = 0; j <= aLower.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= bLower.length; i++) {
            for (let j = 1; j <= aLower.length; j++) {
                const cost = bLower[i - 1] === aLower[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // Deletion
                    matrix[i][j - 1] + 1,      // Insertion
                    matrix[i - 1][j - 1] + cost // Substitution
                );
            }
        }
        
        return matrix[bLower.length][aLower.length];
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
  
    const WorkspaceUtils = {
        getCurrentWorkspaceId: () => window.gZenWorkspaces?.activeWorkspace,
        getGroupSelector: (workspaceId) => `tab-group:has(tab[zen-workspace-id="${workspaceId}"])`,
        validateWorkspace: (workspaceId) => {
            if (!workspaceId) {
                console.error("Cannot get current workspace ID.");
                return false;
            }
            return true;
        }
    };
  
    const TabFilters = {
        isValidForWorkspace: (tab, workspaceId) => {
            return tab.getAttribute('zen-workspace-id') === workspaceId && 
                   !tab.hasAttribute('zen-empty-tab') && 
                   tab.isConnected;
        },
        isInGroup: (tab, groupSelector) => {
            const groupParent = tab.closest('tab-group');
            return groupParent ? groupParent.matches(groupSelector) : false;
        },
        getUngroupedTabs: (workspaceId) => {
            const groupSelector = WorkspaceUtils.getGroupSelector(workspaceId);
            return Array.from(gBrowser.tabs).filter(tab => 
                TabFilters.isValidForWorkspace(tab, workspaceId) &&
                !tab.pinned && 
                !TabFilters.isInGroup(tab, groupSelector)
            );
        },
        getClearableTabs: (workspaceId) => {
            const groupSelector = WorkspaceUtils.getGroupSelector(workspaceId);
            return Array.from(gBrowser.tabs).filter(tab => 
                TabFilters.isValidForWorkspace(tab, workspaceId) &&
                !tab.selected && 
                !tab.pinned && 
                !TabFilters.isInGroup(tab, groupSelector)
            );
        },
        getSelectedTabsForWorkspace: (selectedTabs, workspaceId) => {
            return selectedTabs.filter(tab => 
                TabFilters.isValidForWorkspace(tab, workspaceId) && !tab.pinned
            );
        }
    };
  
    const processAIResponse = (aiText, validTabsWithData, apiName) => {
        const results = new Map();
        const lines = aiText.split('\n').map(line => line.trim()).filter(Boolean);

        if (lines.length !== validTabsWithData.length) {
            console.warn(`Batch AI (${apiName}): Mismatch! Expected ${validTabsWithData.length}, received ${lines.length}. This may be due to API safety filters.`);
            lines.forEach((line, i) => {
                if (i < validTabsWithData.length) {
                    const tab = validTabsWithData[i].tab;
                    results.set(tab, processTopic(line));
                }
            });
        } else {
            lines.forEach((line, i) => {
                const tab = validTabsWithData[i].tab;
                results.set(tab, processTopic(line));
            });
        }
        return results;
    };
  
    const ButtonFactory = {
        createButton: (id, command, label, tooltip) => {
            try {
                const fragment = window.MozXULElement.parseXULToFragment(
                    `<toolbarbutton id="${id}" command="${command}" label="${label}" tooltiptext="${tooltip}"/>`
                );
                return fragment.firstChild.cloneNode(true);
            } catch (e) {
                console.error(`BUTTONS: Error creating ${id}:`, e);
                return null;
            }
        },
  
        ensureButtonsExist: (container) => {
            if (!container) return;
            if (!container.querySelector('#sort-button')) {
                const sortButton = ButtonFactory.createButton('sort-button', 'cmd_zenSortTabs', '⇅ Sort', 'Sort Tabs into Groups');
                if (sortButton) container.appendChild(sortButton);
            }
            if (!container.querySelector('#clear-button')) {
                const clearButton = ButtonFactory.createButton('clear-button', 'cmd_zenClearTabs', '↓ Clear', 'Close ungrouped, non-pinned tabs');
                if (clearButton) container.appendChild(clearButton);
            }
        }
    };
  
    const askAIForMultipleTopics = async (tabsWithData, existingCategoryNames = []) => {
        const validTabsWithData = tabsWithData.filter(item => item.tab && item.tab.isConnected && item.data);
        if (!validTabsWithData || validTabsWithData.length === 0) return new Map();
        const { gemini } = CONFIG.apiConfig;
        let apiChoice = "None";
        validTabsWithData.forEach(item => item.tab.classList.add('tab-is-sorting'));
  
        try {
            const promptTemplateToUse = CONFIG.aiOnlyGrouping ? CONFIG.apiConfig.prompts.aiOnly : CONFIG.apiConfig.prompts.standard;
            if (!promptTemplateToUse) throw new Error("Appropriate AI prompt template not found.");
  
            const formattedTabDataList = validTabsWithData.map((item, index) =>
                `${index + 1}.\nTitle: "${item.data.title}"\nURL: "${item.data.url}"\nDescription: "${item.data.description}"\nContentTypeHint: "${item.contentTypeHint || 'N/A'}"\nOpenerID: "${item.data.openerTabId || 'None'}"`
            ).join('\n\n');
            const formattedExistingCategories = existingCategoryNames.length > 0 ? existingCategoryNames.map(name => `- ${name}`).join('\n') : "None";
            const prompt = promptTemplateToUse
                .replace("{EXISTING_CATEGORIES_LIST}", formattedExistingCategories)
                .replace("{TAB_DATA_LIST}", formattedTabDataList);
  
            if (gemini.enabled) {
                apiChoice = "Gemini";
                if (!gemini.apiKey || gemini.apiKey.length < 30) throw new Error("Gemini API key is missing or not set.");
                
                const apiUrl = `${gemini.apiBaseUrl}${gemini.model}:generateContent?key=${gemini.apiKey}`;
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { ...gemini.generationConfig, maxOutputTokens: Math.max(256, validTabsWithData.length * 20) }
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    const errorMsg = data?.error?.message || response.statusText;
                    throw new Error(`Gemini API Error ${response.status}: ${errorMsg}`);
                }
                const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                if (!aiText) {
                    const finishReason = data?.candidates?.[0]?.finishReason;
                    const safetyRatings = data?.promptFeedback?.safetyRatings;
                    let reason = "Response content was missing.";
                    if (finishReason === 'SAFETY') {
                        reason = `Request blocked by API safety filters. Ratings: ${JSON.stringify(safetyRatings)}`;
                    } else if (finishReason) {
                        reason = `Generation finished unexpectedly. Reason: ${finishReason}`;
                    }
                    console.error("Gemini API Error:", reason, data);
                    throw new Error(`Gemini API Error: ${reason}`);
                }
                return processAIResponse(aiText, validTabsWithData, "Gemini");
            } else {
                throw new Error("No AI API is enabled in the configuration.");
            }
        } catch (error) {
            console.error(`Batch AI (${apiChoice}): Error getting topics:`, error);
            const fallbackResults = new Map();
            validTabsWithData.forEach(item => fallbackResults.set(item.tab, "Uncategorized"));
            return fallbackResults;
        } finally {
            setTimeout(() => {
                validTabsWithData.forEach(item => {
                    if (item.tab?.isConnected) item.tab.classList.remove('tab-is-sorting');
                });
            }, 200);
        }
    };
  
    // --- MAIN SORTING FUNCTION ---
    const sortTabsByTopic = async () => {
        if (isSorting) {
            console.log("Sorting already in progress.");
            return;
        }
        isSorting = true;
        tabDataCache.clear();
        const selectedTabs = gBrowser.selectedTabs;
        const isSortingSelectedTabs = selectedTabs.length > 1;
        const actionType = isSortingSelectedTabs ? "selected tabs" : "all ungrouped tabs";
        console.log(`\n🚀 === STARTING WEIGHT-BASED TAB SORT (${actionType} mode) - v5.2.4 ===`);
        let separatorsToSort = [];

        try {
            separatorsToSort = document.querySelectorAll('.vertical-pinned-tabs-container-separator');
            if (separatorsToSort.length > 0) separatorsToSort.forEach(sep => sep.classList.add('separator-is-sorting'));

            const currentWorkspaceId = WorkspaceUtils.getCurrentWorkspaceId();
            if (!WorkspaceUtils.validateWorkspace(currentWorkspaceId)) { isSorting = false; return; }

            // --- Step 1: Analyze Environment & Enrich Tabs ---
            const existingGroups = analyzeExistingGroups(currentWorkspaceId);
            let rawTabsToConsider = isSortingSelectedTabs ?
                TabFilters.getSelectedTabsForWorkspace(selectedTabs, currentWorkspaceId) :
                TabFilters.getUngroupedTabs(currentWorkspaceId);

            if (rawTabsToConsider.length === 0) {
                console.log(`No tabs to sort in workspace. Exiting.`);
                isSorting = false; return;
            }

            const enrichedTabs = rawTabsToConsider.map(tab => {
                const data = getTabData(tab);
                tabDataCache.set(tab.id, data);
                return {
                    tab, data,
                    keywords: extractTitleKeywords(data.title),
                    contentType: detectContentType(data),
                    openerTab: tab.openerTab
                };
            });
            console.log(`📋 Found and enriched ${enrichedTabs.length} tabs to process.`);

            let finalGroups = {};

            if (CONFIG.aiOnlyGrouping) {
                const aiInputData = enrichedTabs.map(et => ({ tab: et.tab, data: et.data, contentTypeHint: et.contentType }));
                const aiResults = await askAIForMultipleTopics(aiInputData, [...existingGroups.keys()]);
                aiResults.forEach((topic, tab) => {
                    if (topic !== "Uncategorized") {
                        if (!finalGroups[topic]) finalGroups[topic] = [];
                        finalGroups[topic].push(tab);
                    }
                });
            } else {
                // --- Step 2: First Pass Grouping ---
                const aiResults = await askAIForMultipleTopics(
                    enrichedTabs.map(et => ({ tab: et.tab, data: et.data, contentTypeHint: et.contentType })),
                    [...existingGroups.keys()]
                );
                console.log(`🤖 Received ${aiResults.size} initial AI suggestions to use as a scoring signal.`);

                const engine = new TabGroupingEngine(enrichedTabs, existingGroups);
                engine.generateProposals({ aiResults });
                const { finalGroups: firstPassGroups, leftoverTabs } = engine.resolveGroupAssignments();
                
                finalGroups = firstPassGroups;

                // --- Step 3: Second Pass for Leftovers ---
                if (leftoverTabs.length > 0) {
                    console.log(`--- Second Pass: Grouping ${leftoverTabs.length} Leftover Tabs ---`);
                    const secondPassAiResults = await askAIForMultipleTopics(
                        leftoverTabs.map(et => ({ tab: et.tab, data: et.data, contentTypeHint: et.contentType })),
                        [...existingGroups.keys(), ...Object.keys(finalGroups)] // Provide full context
                    );
                    
                    secondPassAiResults.forEach((topic, tab) => {
                        if (topic !== "Uncategorized") {
                            if (!finalGroups[topic]) finalGroups[topic] = [];
                            finalGroups[topic].push(tab);
                            const tabData = enrichedTabs.find(et => et.tab === tab)?.data;
                            console.log(`✨ AI (2nd Pass) assigned "${tabData?.title || 'Unknown Tab'}" to group "${topic}"`);
                        }
                    });
                }
            }

            // --- Step 4: Consolidate & Create Groups ---
            console.log(" -> Consolidating group names (Levenshtein)...");
            const originalKeys = Object.keys(finalGroups);
            const mergedKeys = new Set();
            const consolidationMap = {};
  
            for (let i = 0; i < originalKeys.length; i++) {
                let keyA = originalKeys[i];
                if (mergedKeys.has(keyA)) continue;
                while (consolidationMap[keyA]) keyA = consolidationMap[keyA];
                if (mergedKeys.has(keyA)) continue;
  
                for (let j = i + 1; j < originalKeys.length; j++) {
                    let keyB = originalKeys[j];
                    if (mergedKeys.has(keyB)) continue;
                    while (consolidationMap[keyB]) keyB = consolidationMap[keyB];
                    if (mergedKeys.has(keyB) || keyA === keyB) continue;
  
                    const distance = levenshteinDistance(keyA, keyB);
                    if (distance <= CONFIG.consolidationDistanceThreshold) {
                         let canonicalKey, mergedKeyVal;
                         if (existingGroups.has(keyA) && !existingGroups.has(keyB)) {
                             [canonicalKey, mergedKeyVal] = [keyA, keyB];
                         } else if (!existingGroups.has(keyA) && existingGroups.has(keyB)) {
                             [canonicalKey, mergedKeyVal] = [keyB, keyA];
                         } else {
                             [canonicalKey, mergedKeyVal] = keyA.length <= keyB.length ? [keyA, keyB] : [keyB, keyA];
                         }

                        console.log(`    - Consolidating: Merging "${mergedKeyVal}" into "${canonicalKey}" (Distance: ${distance})`);
                        if (finalGroups[mergedKeyVal]) {
                            if (!finalGroups[canonicalKey]) finalGroups[canonicalKey] = [];
                            finalGroups[canonicalKey].push(...finalGroups[mergedKeyVal]);
                            delete finalGroups[mergedKeyVal];
                        }
                        mergedKeys.add(mergedKeyVal);
                        consolidationMap[mergedKeyVal] = canonicalKey;
                        if (mergedKeyVal === keyA) {
                            keyA = canonicalKey;
                            break;
                        }
                    }
                }
            }
            
            console.log("\n🎯 === FINAL GROUPING RESULTS ===");
            console.log(" -> Final groups for action:", Object.keys(finalGroups).map(k => `${k} (${finalGroups[k]?.length ?? 0})`).join('; ') || "None");
            
            const existingGroupElementsMap = new Map();
            document.querySelectorAll(WorkspaceUtils.getGroupSelector(currentWorkspaceId)).forEach(el => {
                if (el.label) existingGroupElementsMap.set(el.label, el);
            });
            groupColorIndex = 0;

            for (const topic in finalGroups) {
                const tabsForThisTopic = finalGroups[topic].filter(t => t?.isConnected);
                if (tabsForThisTopic.length === 0) continue;

                const existingEl = existingGroupElementsMap.get(topic) || findGroupElement(topic, currentWorkspaceId);

                if (existingEl?.isConnected) {
                    console.log(` -> Moving ${tabsForThisTopic.length} tabs to existing group "${topic}".`);
                    gBrowser.moveTabsToGroup(tabsForThisTopic, existingEl);
                } else {
                    console.log(` -> Creating new group "${topic}" with ${tabsForThisTopic.length} tabs.`);
                    const groupOpts = { label: topic, color: getNextGroupColor(), insertBefore: tabsForThisTopic[0] };
                    gBrowser.addTabGroup(tabsForThisTopic, groupOpts);
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
                Array.from(gBrowser.tabs).forEach(t => {
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
            const currentWorkspaceId = WorkspaceUtils.getCurrentWorkspaceId();
            if (!WorkspaceUtils.validateWorkspace(currentWorkspaceId)) {
                return;
            }
            const tabsToClose = TabFilters.getClearableTabs(currentWorkspaceId);
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
                            if(tab?.isConnected) tab.classList.remove('tab-closing');
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
        ButtonFactory.ensureButtonsExist(container);
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
        if (typeof gZenWorkspaces.originalHooks?.customSortClearApplied) return;
  
        gZenWorkspaces.originalHooks = {
            ...(gZenWorkspaces.originalHooks || {}),
            onTabBrowserInserted: gZenWorkspaces.onTabBrowserInserted,
            updateTabsContainers: gZenWorkspaces.updateTabsContainers,
            customSortClearApplied: true
        };
  
        gZenWorkspaces.onTabBrowserInserted = function (event) {
            if (typeof gZenWorkspaces.originalHooks.onTabBrowserInserted === 'function' && gZenWorkspaces.originalHooks.onTabBrowserInserted !== gZenWorkspaces.onTabBrowserInserted) {
                try {
                    gZenWorkspaces.originalHooks.onTabBrowserInserted.call(gZenWorkspaces, event);
                } catch (e) {
                    console.error("HOOK: Error in original onTabBrowserInserted:", e);
                }
            }
            setTimeout(addButtonsToAllSeparators, 150);
        };
        gZenWorkspaces.updateTabsContainers = function (...args) {
            if (typeof gZenWorkspaces.originalHooks.updateTabsContainers === 'function' && gZenWorkspaces.originalHooks.updateTabsContainers !== gZenWorkspaces.updateTabsContainers) {
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
  
    function initializeScript() {
        console.log("INIT: Sort & Clear Tabs Script (v5.2.4) loading...");
        let checkCount = 0;
        const maxChecks = 30;
        const checkInterval = 1000;
        const initCheckInterval = setInterval(() => {
            checkCount++;
            const sepExists = !!document.querySelector(".vertical-pinned-tabs-container-separator");
            const periphExists = !!document.querySelector('#tabbrowser-arrowscrollbox-periphery');
            const cmdSetExists = !!document.querySelector("commandset#zenCommandSet");
            const gBReady = typeof gBrowser !== 'undefined' && gBrowser.tabContainer;
            const gZWReady = typeof gZenWorkspaces !== 'undefined' && gZenWorkspaces.activeWorkspace;
            const ready = gBReady && cmdSetExists && (sepExists || periphExists) && gZWReady;
  
            if (ready) {
                console.log(`INIT: Required elements found after ${checkCount} checks. Initializing...`);
                clearInterval(initCheckInterval);
                const finalSetup = () => {
                    try {
                        injectStyles();
                        setupCommandsAndListener();
                        addButtonsToAllSeparators();
                        setupZenWorkspaceHooks();
                        console.log("INIT: Sort & Clear Button setup and hooks complete.");
                    } catch (e) {
                        console.error("INIT: Error during deferred final setup:", e);
                    }
                };
                if ('requestIdleCallback' in window) requestIdleCallback(finalSetup, { timeout: 2000 });
                else setTimeout(finalSetup, 500);
            } else if (checkCount > maxChecks) {
                clearInterval(initCheckInterval);
                console.error(`INIT: Failed to find required elements after ${maxChecks} checks.`);
            }
        }, checkInterval);
    }
  
    if (document.readyState === "complete" || document.readyState === "interactive") {
        initializeScript();
    } else {
        window.addEventListener("load", initializeScript, { once: true });
    }
  
})();