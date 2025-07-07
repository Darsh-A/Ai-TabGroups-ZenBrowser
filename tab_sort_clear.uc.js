// VERSION 6.2.0 - Added random group color starting point feature
(() => {
    // --- Configuration ---
    const CONFIG = {
        // --- Logging Control ---
        logging: {
            enabled: true,
            level: 'warn', // 'debug', 'info', 'warn', 'error', 'none'
            showDetailedScoring: false, // Show individual scorer details
            showWeightChanges: false, // Show dynamic weight adjustments
            showGroupingResults: false // Show final grouping results
        },

        aiOnlyGrouping: false, // << --- Set to true to let AI handle all grouping logic

        // Auto-sort new tabs into groups automatically
        // This feature listens for new tab creation and automatically sorts them
        // without requiring manual button clicks
        autoSortNewTabs: {
            enabled: true, // << --- Set to false to disable auto-sorting
            delay: 2000, // Wait 1 second after tab creation before sorting
            maxTabsToSort: 10, // Maximum number of tabs to consider for auto-sort mode
        },

        // Auto-sort when selected tab URL changes
        // This feature monitors the selected tab and triggers auto-sort when its URL changes
        autoSortOnURLChange: {
            enabled: true, // << --- Set to false to disable URL change auto-sorting
            delay: 2000, // Wait 2 seconds after URL change before sorting
            debounceTime: 500, // Minimum time between auto-sorts for the same tab
        },

        // Button visibility settings
        buttons: {
            autoHide: true // << --- Set to false to make buttons always visible
        },

        // Group color settings
        colorSettings: {
            randomStart: true, // << --- Set to false to always start with blue (first color), true for random starting color
        },

        // --- Scoring Weights & Thresholds ---
        scoringWeights: {
            existingGroup: 0.90,
            opener: 0.85,
            contentType: 0.80,
            hostname: 0.75,
            aiSuggestion: 0.70,
            keyword: 0.60
        },

        // --- Dynamic Weight Adaptation ---
        dynamicWeights: {
            enabled: true,

            // Size-based weight profiles
            sizeProfiles: {
                small: { // 1-5 tabs
                    hostname: 0.90,
                    contentType: 0.85,
                    aiSuggestion: 0.80,
                    opener: 0.75,
                    existingGroup: 0.70,
                    keyword: 0.60
                },
                medium: { // 6-15 tabs
                    existingGroup: 0.90,
                    opener: 0.85,
                    hostname: 0.80,
                    contentType: 0.75,
                    aiSuggestion: 0.70,
                    keyword: 0.60
                },
                large: { // 16+ tabs
                    existingGroup: 0.90,
                    aiSuggestion: 0.75,
                    hostname: 0.85,
                    contentType: 0.75,
                    opener: 0.70,
                    keyword: 0.60
                }
            },

            // Time-based opener adjustments
            openerTimeTracking: {
                enabled: true,
                recentOpenerBoost: 0.20, // Boost for recent opener relationships
                recentThreshold: 5 * 60 * 1000, // 5 minutes
                decayHalfLife: 15 * 60 * 1000 // 15 minutes
            },

        },

        thresholds: {
            minGroupingScore: 0.55,
            minTabsForNewGroup: 1 // Threshold for the FIRST pass. AI pass will group everything.
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
            'js': 'JavaScript',
            'py': 'Python',
            'JS': 'JavaScript',
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
                model: 'gemini-2.0-flash',
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
        getStyles() {
            return `
        #sort-button {
            opacity: ${CONFIG.buttons.autoHide ? '0' : '1'};
            transition: opacity 0.1s ease-in-out;
            position: absolute;
            right: 57px; /* Reduced by 5px */
            font-size: 12px;
            width: 60px;
            pointer-events: auto;
            align-self: end;
            appearance: none;
            margin-top: -8px;
            padding: 1px;
            color: ${CONFIG.buttons.autoHide ? 'gray' : 'white'};
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #sort-button label { display: block; margin-left: 2px; font-size: 13px; }
        #sort-button:hover {
            opacity: 1;
            color: white;
            border-radius: 4px;
        }
        
        /* Broom brushing animation */
        @keyframes brush-sweep {
            0% { transform: rotate(0deg); }
            20% { transform: rotate(-15deg); }
            40% { transform: rotate(15deg); }
            60% { transform: rotate(-15deg); }
            80% { transform: rotate(15deg); }  
            100% { transform: rotate(0deg); }
        }
        
        #sort-button.brushing .broom-icon {
            animation: brush-sweep 0.8s ease-in-out;
            transform-origin: 50% 50%; /* Center of broom */
        }
  
        #clear-button {
            opacity: ${CONFIG.buttons.autoHide ? '0' : '1'};
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
            color: ${CONFIG.buttons.autoHide ? 'grey' : 'white'};
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #clear-button label { display: block; margin-left: 2px; font-size: 13px; }
        #clear-button .down-arrow-icon { margin-right: 2px; }
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
             ${CONFIG.buttons.autoHide ? '' : `
             width: calc(100% - 117px);
             margin-right: auto;
             `}
        }
        .vertical-pinned-tabs-container-separator:has(#sort-button):has(#clear-button):hover {
            width: calc(100% - 117px);
            margin-right: auto;
            background-color: var(--lwt-toolbarbutton-hover-background, rgba(200, 200, 200, 0.2));
        }
        ${CONFIG.buttons.autoHide ? `
        .vertical-pinned-tabs-container-separator:hover #sort-button,
        .vertical-pinned-tabs-container-separator:hover #clear-button {
            opacity: 1;
        }
        ` : ''}
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
        
        @keyframes auto-sort-pulse {
            0%, 100% { background-color: rgba(33, 150, 243, 0.1); }
            50% { background-color: rgba(33, 150, 243, 0.3); }
        }
        .tab-auto-sorting {
            /* animation: auto-sort-pulse 2s ease-in-out infinite; */
            animation: none;
            will-change: background-color;
        }
        .tabbrowser-tab {
            transition: transform 0.3s ease-out, opacity 0.3s ease-out, max-height 0.5s ease-out, margin 0.5s ease-out, padding 0.5s ease-out;
        }
        `;
        }
    };

    // --- Logging Utility ---
    const Logger = {
        shouldLog(level) {
            if (!CONFIG.logging.enabled) return false;
            const levels = { 'debug': 0, 'info': 1, 'warn': 2, 'error': 3, 'none': 4 };
            const currentLevel = levels[CONFIG.logging.level] || 1;
            const requestedLevel = levels[level] || 1;
            return requestedLevel >= currentLevel;
        },

        debug(...args) {
            if (this.shouldLog('debug')) console.log(...args);
        },

        info(...args) {
            if (this.shouldLog('info')) console.log(...args);
        },

        warn(...args) {
            if (this.shouldLog('warn')) console.warn(...args);
        },

        error(...args) {
            if (this.shouldLog('error')) console.error(...args);
        }
    };

    // --- Globals & State ---
    let groupColorIndex = CONFIG.colorSettings.randomStart ?
        Math.floor(Math.random() * CONFIG.groupColors.length) : 0; // Random or sequential starting color
    let isSorting = false;
    let commandListenerAdded = false;

    // --- Tab Creation & URL Change Tracking ---
    const TabCreationTracker = {
        tabCreationTimes: new Map(),
        openerRelationships: new Map(), // tabId -> { openerId, creationTime }
        pendingAutoSorts: new Map(), // tabId -> timeoutId

        // URL change tracking
        currentSelectedTab: null,
        currentSelectedTabURL: null,
        lastAutoSortTime: new Map(), // tabId -> timestamp
        pendingURLChangeSorts: new Map(), // tabId -> timeoutId

        init() {
            this.setupTabListeners();
            this.setupURLChangeListeners();

            // Also try alternative event listener approach
            this.setupAlternativeListeners();
        },

        setupTabListeners() {
            // Ensure gBrowser is available
            if (!gBrowser || !gBrowser.tabContainer) {
                Logger.warn('gBrowser not available, retrying in 1 second...');
                setTimeout(() => this.setupTabListeners(), 1000);
                return;
            }

            // Listen for new tab creation
            gBrowser.addEventListener('TabOpen', (event) => {
                const tab = event.target;
                const now = Date.now();

                this.tabCreationTimes.set(tab.id, now);

                // Track opener relationship
                if (tab.openerTab) {
                    this.openerRelationships.set(tab.id, {
                        openerId: tab.openerTab.id,
                        creationTime: now
                    });
                }

                // Trigger auto-sort if enabled and tab is not pinned
                if (CONFIG.autoSortNewTabs.enabled && !tab.pinned) {
                    this.scheduleAutoSort(tab);
                }
            });

            // Clean up when tabs are closed
            gBrowser.addEventListener('TabClose', (event) => {
                const tab = event.target;
                this.tabCreationTimes.delete(tab.id);
                this.openerRelationships.delete(tab.id);
                this.lastAutoSortTime.delete(tab.id);

                // Cancel pending auto-sort
                const timeoutId = this.pendingAutoSorts.get(tab.id);
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    this.pendingAutoSorts.delete(tab.id);
                }

                // Cancel pending URL change auto-sort
                const urlChangeTimeoutId = this.pendingURLChangeSorts.get(tab.id);
                if (urlChangeTimeoutId) {
                    clearTimeout(urlChangeTimeoutId);
                    this.pendingURLChangeSorts.delete(tab.id);
                }

                // Clean up URL change listener if this was the selected tab
                if (tab === this.currentSelectedTab) {
                    this.currentSelectedTab = null;
                    this.currentSelectedTabURL = null;
                }
            });
        },

        setupAlternativeListeners() {
            // Alternative approach: listen to the tab container directly
            const setupAltListeners = () => {
                if (!gBrowser || !gBrowser.tabContainer) {
                    setTimeout(setupAltListeners, 500);
                    return;
                }

                // Listen to tab container for new tabs
                gBrowser.tabContainer.addEventListener('TabOpen', (event) => {
                    const tab = event.target;

                    // Only schedule if not already scheduled and tab is not pinned
                    if (!this.pendingAutoSorts.has(tab.id) && !tab.pinned) {
                        if (CONFIG.autoSortNewTabs.enabled) {
                            this.scheduleAutoSort(tab);
                        }
                    }
                });

                // Also try listening to the window
                window.addEventListener('TabOpen', (event) => {
                    const tab = event.target;

                    // Only schedule if not already scheduled and tab is not pinned
                    if (!this.pendingAutoSorts.has(tab.id) && !tab.pinned) {
                        if (CONFIG.autoSortNewTabs.enabled) {
                            this.scheduleAutoSort(tab);
                        }
                    }
                });
            };

            setupAltListeners();
        },

        setupURLChangeListeners() {
            // Ensure gBrowser is available
            if (!gBrowser) {
                Logger.warn('gBrowser not available for URL change listeners, retrying in 1 second...');
                setTimeout(() => this.setupURLChangeListeners(), 1000);
                return;
            }

            // Listen for tab selection changes via tabContainer (this one works)
            if (gBrowser.tabContainer) {
                gBrowser.tabContainer.addEventListener('TabSelect', (event) => {
                    const newSelectedTab = event.target;
                    if (newSelectedTab !== this.currentSelectedTab) {
                        this.updateSelectedTab(newSelectedTab);
                    }
                });
            }

            // Poll for tab selection changes as fallback
            this.setupTabSelectionPolling();

            // Initialize with current selected tab
            this.initializeCurrentSelectedTab();
        },

        updateSelectedTab(newSelectedTab) {
            // Update current selected tab
            this.currentSelectedTab = newSelectedTab;

            // Get initial URL (might be null if tab is still loading)
            this.currentSelectedTabURL = this.getTabURL(newSelectedTab);

            // Setup URL change monitoring for the new selected tab
            this.setupURLChangeMonitoring(newSelectedTab);
        },

        // Manually update the current URL (for testing and fixing sync issues)
        updateCurrentURL() {
            if (this.currentSelectedTab && this.currentSelectedTab.isConnected) {
                const newURL = this.getTabURL(this.currentSelectedTab);
                if (newURL && newURL !== this.currentSelectedTabURL && this.isValidURLForAutoSort(newURL)) {
                    this.currentSelectedTabURL = newURL;
                    this.scheduleAutoSortForURLChange(this.currentSelectedTab);
                } else if (newURL && !this.currentSelectedTabURL && this.isValidURLForAutoSort(newURL)) {
                    // Initial URL set
                    this.currentSelectedTabURL = newURL;
                }
            }
        },

        setupTabSelectionPolling() {
            // Poll for tab selection changes as a fallback
            let lastSelectedTabId = null;
            let lastMonitoringCheck = 0;
            let lastURLCheck = 0;

            const pollForTabSelection = () => {
                if (!gBrowser || !gBrowser.selectedTab) return;

                const currentSelectedTabId = gBrowser.selectedTab.id;
                if (currentSelectedTabId !== lastSelectedTabId) {
                    this.updateSelectedTab(gBrowser.selectedTab);
                    lastSelectedTabId = currentSelectedTabId;
                }

                // Check URL monitoring less frequently (every 5 seconds)
                const now = Date.now();
                if (now - lastMonitoringCheck > 5000) {
                    this.ensureURLMonitoringActive();
                    lastMonitoringCheck = now;
                }

                // Check for URL changes every 2 seconds
                if (now - lastURLCheck > 2000) {
                    this.checkForURLChanges();
                    lastURLCheck = now;
                }
            };

            // Poll every 1 second (less frequent)
            setInterval(pollForTabSelection, 1000);
        },

        checkForURLChanges() {
            if (this.currentSelectedTab && this.currentSelectedTab.isConnected) {
                const currentURL = this.getTabURL(this.currentSelectedTab);
                if (currentURL && currentURL !== this.currentSelectedTabURL && this.isValidURLForAutoSort(currentURL)) {
                    this.currentSelectedTabURL = currentURL;
                    this.scheduleAutoSortForURLChange(this.currentSelectedTab);
                }
            }
        },

        initializeCurrentSelectedTab() {
            // Try multiple ways to get the current selected tab
            let selectedTab = null;

            // Method 1: gBrowser.selectedTab
            if (gBrowser.selectedTab) {
                selectedTab = gBrowser.selectedTab;
            }
            // Method 2: gBrowser.selectedTabIndex
            else if (gBrowser.selectedTabIndex !== undefined && gBrowser.tabs[gBrowser.selectedTabIndex]) {
                selectedTab = gBrowser.tabs[gBrowser.selectedTabIndex];
            }
            // Method 3: Look for selected attribute
            else {
                const selectedTabElement = document.querySelector('tab[selected="true"]');
                if (selectedTabElement) {
                    selectedTab = selectedTabElement;
                }
            }

            if (selectedTab) {
                this.currentSelectedTab = selectedTab;
                this.currentSelectedTabURL = this.getTabURL(selectedTab);
                this.setupURLChangeMonitoring(selectedTab);
            } else {
                Logger.warn('Could not find current selected tab during initialization');
            }
        },

        setupURLChangeMonitoring(tab) {
            if (!tab || !tab.isConnected) {
                Logger.warn(`Cannot setup URL monitoring: tab not connected or invalid`);
                return;
            }

            const browser = tab.linkedBrowser || tab._linkedBrowser || gBrowser?.getBrowserForTab?.(tab);
            if (!browser) {
                Logger.warn(`Cannot setup URL monitoring: no browser for tab ${tab.id}`);
                return;
            }

            // Remove any existing listeners to avoid duplicates
            if (browser._urlChangeListener) {
                browser.removeEventListener('load', browser._urlChangeListener);
            }

            // Create new listener for page loads
            const urlChangeListener = () => {
                const newURL = this.getTabURL(tab);

                if (newURL && newURL !== this.currentSelectedTabURL && this.isValidURLForAutoSort(newURL)) {
                    this.currentSelectedTabURL = newURL;
                    this.scheduleAutoSortForURLChange(tab);
                } else if (newURL && (!this.currentSelectedTabURL || this.currentSelectedTabURL === 'none') && this.isValidURLForAutoSort(newURL)) {
                    // Initial page load with valid URL
                    this.currentSelectedTabURL = newURL;
                }
            };

            // Store reference and add listener
            browser._urlChangeListener = urlChangeListener;
            browser.addEventListener('load', urlChangeListener);
        },

        // Ensure URL monitoring is active on the current selected tab
        ensureURLMonitoringActive() {
            if (this.currentSelectedTab && this.currentSelectedTab.isConnected) {
                const browser = this.currentSelectedTab.linkedBrowser || this.currentSelectedTab._linkedBrowser || gBrowser?.getBrowserForTab?.(this.currentSelectedTab);

                // Only setup monitoring if it's not already set up
                if (browser && !browser._urlChangeListener) {
                    this.setupURLChangeMonitoring(this.currentSelectedTab);
                }
            }
        },

        getTabURL(tab) {
            if (!tab || !tab.isConnected) return null;

            try {
                const browser = tab.linkedBrowser || tab._linkedBrowser || gBrowser?.getBrowserForTab?.(tab);
                if (!browser || !browser.currentURI) {
                    return null;
                }

                const url = browser.currentURI.spec;
                return url && url !== 'about:blank' ? url : null;
            } catch (e) {
                return null;
            }
        },

        isValidURLForAutoSort(url) {
            if (!url) return false;

            // Skip internal browser pages
            if (url.startsWith('about:') ||
                url.startsWith('chrome://') ||
                url.startsWith('moz-extension://') ||
                url.startsWith('resource://') ||
                url === 'about:blank') {
                return false;
            }

            // Skip data URLs
            if (url.startsWith('data:')) return false;

            return true;
        },

        scheduleAutoSortForURLChange(tab) {
            if (!CONFIG.autoSortOnURLChange.enabled) {
                return;
            }

            // Skip auto-sort for pinned tabs
            if (tab.pinned) {
                return;
            }

            // Check debounce time
            const lastSortTime = this.lastAutoSortTime.get(tab.id) || 0;
            const timeSinceLastSort = Date.now() - lastSortTime;

            if (timeSinceLastSort < CONFIG.autoSortOnURLChange.debounceTime) {
                return;
            }

            // Cancel any pending URL change auto-sort for this tab
            const existingTimeout = this.pendingURLChangeSorts.get(tab.id);
            if (existingTimeout) {
                clearTimeout(existingTimeout);
            }

            const timeoutId = setTimeout(() => {
                this.performAutoSortForURLChange(tab);
                this.pendingURLChangeSorts.delete(tab.id);
            }, CONFIG.autoSortOnURLChange.delay);

            this.pendingURLChangeSorts.set(tab.id, timeoutId);
        },

        async performAutoSortForURLChange(tab) {
            if (!tab.isConnected) {
                Logger.warn(`Tab ${tab.id} no longer connected, skipping URL change auto-sort`);
                return;
            }

            // Skip auto-sort for pinned tabs
            if (tab.pinned) {
                Logger.info(`🤖 URL Auto-sort: Tab ${tab.id} is pinned, skipping URL change auto-sort`);
                return;
            }

            const currentWorkspaceId = WorkspaceUtils.getCurrentWorkspaceId();

            if (!WorkspaceUtils.validateWorkspace(currentWorkspaceId)) {
                Logger.warn(`Invalid workspace, skipping URL change auto-sort`);
                return;
            }

            // Always perform auto-sort for URL changes, regardless of grouping status
            // This allows tabs to be re-sorted when their content changes
            try {
                // Add visual indicator for auto-sorting
                if (tab.isConnected) {
                    tab.classList.add('tab-auto-sorting');
                }

                // Update last auto-sort time
                this.lastAutoSortTime.set(tab.id, Date.now());

                // Use the existing sorting logic with auto-sort flag
                await sortTabsByTopic(true, tab);

                // Remove visual indicator
                setTimeout(() => {
                    if (tab.isConnected) {
                        tab.classList.remove('tab-auto-sorting');
                    }
                }, 1000);

            } catch (error) {
                Logger.error("URL change auto-sort failed:", error);

                // Remove visual indicator on error
                if (tab.isConnected) {
                    tab.classList.remove('tab-auto-sorting');
                }
            }
        },

        scheduleAutoSort(tab) {
            // Additional safety check for pinned tabs
            if (tab.pinned) {
                Logger.info(`🤖 Auto-sort: Tab ${tab.id} is pinned, skipping auto-sort scheduling`);
                return;
            }

            const timeoutId = setTimeout(() => {
                this.performAutoSort(tab);
                this.pendingAutoSorts.delete(tab.id);
            }, CONFIG.autoSortNewTabs.delay);

            this.pendingAutoSorts.set(tab.id, timeoutId);
        },

        async performAutoSort(newTab) {
            Logger.info(`🤖 Auto-sort: Starting auto-sort for tab ${newTab.id}`);

            if (!newTab.isConnected) {
                Logger.warn(`❌ Tab ${newTab.id} no longer connected, skipping auto-sort`);
                return;
            }

            // Skip auto-sort for pinned tabs
            if (newTab.pinned) {
                Logger.info(`🤖 Auto-sort: Tab ${newTab.id} is pinned, skipping auto-sort`);
                return;
            }

            const currentWorkspaceId = WorkspaceUtils.getCurrentWorkspaceId();
            Logger.info(`🤖 Auto-sort: Current workspace ID: ${currentWorkspaceId}`);

            if (!WorkspaceUtils.validateWorkspace(currentWorkspaceId)) {
                Logger.warn(`❌ Invalid workspace, skipping auto-sort`);
                return;
            }

            // Check if the new tab is already in a group
            const isInGroup = newTab.closest('tab-group') !== null;
            Logger.info(`🤖 Auto-sort: Tab ${newTab.id} is ${isInGroup ? 'already grouped' : 'ungrouped'}`);

            try {
                // Add visual indicator for auto-sorting on the new tab only
                if (newTab.isConnected) {
                    newTab.classList.add('tab-auto-sorting');
                }

                Logger.info(`🤖 Auto-sort: Starting sorting process for NEW TAB ONLY...`);
                // Use the existing sorting logic with auto-sort flag and pass the new tab
                await sortTabsByTopic(true, newTab);
                Logger.info(`🤖 Auto-sort: Sorting process completed`);

                // Remove visual indicator
                setTimeout(() => {
                    if (newTab.isConnected) {
                        newTab.classList.remove('tab-auto-sorting');
                    }
                }, 1000);

            } catch (error) {
                Logger.error("Auto-sort failed:", error);

                // Remove visual indicator on error
                if (newTab.isConnected) {
                    newTab.classList.remove('tab-auto-sorting');
                }
            }
        },

        getOpenerRelationshipAge(tabId) {
            const relationship = this.openerRelationships.get(tabId);
            return relationship ? Date.now() - relationship.creationTime : null;
        },

        isRecentOpener(tabId) {
            const age = this.getOpenerRelationshipAge(tabId);
            return age && age < CONFIG.dynamicWeights.openerTimeTracking.recentThreshold;
        },

    };

    // --- User Behavior & Content Analysis ---
    const UserBehaviorAnalyzer = {
        tabAccessPatterns: new Map(), // tabId -> { accessCount, lastAccess, dwellTime }
        workspacePatterns: new Map(), // workspaceId -> { workPattern, domainPreferences }

        init() {
            this.setupBehaviorTracking();
        },

        setupBehaviorTracking() {
            // Track tab selection (user interest)
            gBrowser.addEventListener('TabSelect', (event) => {
                const tab = event.target;
                this.recordTabAccess(tab.id);

                // Mark tab as having user activity for auto-sort
                tab.setAttribute('data-user-activity', 'true');
            });

            // Track tab focus/blur for dwell time
            gBrowser.addEventListener('TabSelect', (event) => {
                const tab = event.target;
                tab.setAttribute('data-focus-start', Date.now());
            });

            gBrowser.addEventListener('TabSelect', (event) => {
                const previousTab = event.detail?.previousTab;
                if (previousTab) {
                    const focusStart = parseInt(previousTab.getAttribute('data-focus-start') || '0');
                    const dwellTime = Date.now() - focusStart;
                    this.recordDwellTime(previousTab.id, dwellTime);
                }
            });

            // Track page load completion for auto-sort
            gBrowser.addEventListener('TabOpen', (event) => {
                const tab = event.target;
                const browser = tab.linkedBrowser || tab._linkedBrowser || gBrowser?.getBrowserForTab?.(tab);

                if (browser) {
                    browser.addEventListener('load', () => {
                        // Mark tab as loaded for auto-sort
                        tab.setAttribute('data-loaded', 'true');
                    }, { once: true });
                }
            });
        },

        recordTabAccess(tabId) {
            const now = Date.now();
            const pattern = this.tabAccessPatterns.get(tabId) || { accessCount: 0, lastAccess: 0, dwellTime: 0 };

            pattern.accessCount++;
            pattern.lastAccess = now;

            this.tabAccessPatterns.set(tabId, pattern);
        },

        recordDwellTime(tabId, dwellTime) {
            const pattern = this.tabAccessPatterns.get(tabId);
            if (pattern) {
                pattern.dwellTime += dwellTime;
            }
        },

        analyzeWorkspaceBehavior(workspaceId) {
            const workspaceTabs = Array.from(gBrowser.tabs)
                .filter(tab => tab.getAttribute('zen-workspace-id') === workspaceId);

            const domains = workspaceTabs.map(tab => {
                try {
                    return new URL(tab.linkedBrowser?.currentURI?.spec || '').hostname;
                } catch { return null; }
            }).filter(Boolean);

            const domainCounts = {};
            domains.forEach(domain => {
                domainCounts[domain] = (domainCounts[domain] || 0) + 1;
            });

            // Determine work vs leisure pattern
            const workKeywords = ['github', 'stackoverflow', 'docs', 'api', 'code', 'developer'];
            const leisureKeywords = ['youtube', 'reddit', 'social', 'entertainment', 'game'];

            let workScore = 0, leisureScore = 0;
            domains.forEach(domain => {
                const domainLower = domain.toLowerCase();
                workKeywords.forEach(kw => { if (domainLower.includes(kw)) workScore++; });
                leisureKeywords.forEach(kw => { if (domainLower.includes(kw)) leisureScore++; });
            });

            return {
                workPattern: workScore > leisureScore ? 'work' : 'leisure',
                domainPreferences: domainCounts,
                totalTabs: workspaceTabs.length
            };
        },

        getUserInterestScore(tabId) {
            const pattern = this.tabAccessPatterns.get(tabId);
            if (!pattern) return 0.5; // Neutral if no data

            // Calculate interest based on access frequency and dwell time
            const accessScore = Math.min(pattern.accessCount / 5, 1.0); // Cap at 5 accesses
            const dwellScore = Math.min(pattern.dwellTime / (30 * 60 * 1000), 1.0); // Cap at 30 minutes
            const recencyScore = Math.max(0, 1 - (Date.now() - pattern.lastAccess) / (24 * 60 * 60 * 1000)); // Decay over 24h

            return (accessScore * 0.4 + dwellScore * 0.4 + recencyScore * 0.2);
        }
    };

    const ContentComplexityAnalyzer = {
        analyzeContentComplexity(tabData) {
            const complexity = {
                textLength: 0,
                keywordDensity: 0,
                technicalTerms: 0,
                readabilityScore: 0,
                overallComplexity: 0
            };

            // Analyze title and description
            const text = `${tabData.title} ${tabData.description}`;
            complexity.textLength = text.length;

            // Count technical terms
            const technicalTerms = [
                'api', 'sdk', 'framework', 'library', 'algorithm', 'protocol', 'database',
                'server', 'client', 'authentication', 'authorization', 'encryption',
                'deployment', 'configuration', 'optimization', 'performance', 'scalability'
            ];

            const textLower = text.toLowerCase();
            complexity.technicalTerms = technicalTerms.filter(term =>
                textLower.includes(term)
            ).length;

            // Calculate keyword density
            const words = text.split(/\s+/).filter(word => word.length > 3);
            const uniqueWords = new Set(words);
            complexity.keywordDensity = uniqueWords.size / words.length;

            // Simple readability score (lower = more complex)
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const avgWordsPerSentence = words.length / sentences.length;
            complexity.readabilityScore = Math.max(0, 1 - (avgWordsPerSentence / 20)); // Normalize to 0-1

            // Overall complexity score
            complexity.overallComplexity = (
                (complexity.technicalTerms / 10) * 0.3 +
                (1 - complexity.keywordDensity) * 0.2 +
                (1 - complexity.readabilityScore) * 0.3 +
                Math.min(complexity.textLength / 1000, 1) * 0.2
            );

            return complexity;
        },

        getComplexityAdjustment(complexity) {
            // High complexity content gets different weight adjustments
            if (complexity.overallComplexity > 0.7) {
                return {
                    contentType: 1.2, // Content type matters more for complex content
                    keyword: 0.8,     // Keywords matter less
                    aiSuggestion: 1.1 // AI better at complex categorization
                };
            } else if (complexity.overallComplexity < 0.3) {
                return {
                    hostname: 1.1,    // Simple content: domain matters more
                    keyword: 1.2,     // Keywords matter more
                    aiSuggestion: 0.9 // AI less needed for simple content
                };
            }

            return { // Default adjustments
                existingGroup: 1.0,
                opener: 1.0,
                contentType: 1.0,
                hostname: 1.0,
                aiSuggestion: 1.0,
                keyword: 1.0
            };
        }
    };

    // --- SCORING SYSTEM ARCHITECTURE ---

    class TabGroupingEngine {
        constructor(enrichedTabs, existingGroups) {
            this.enrichedTabs = enrichedTabs;
            this.existingGroups = existingGroups;
            this.dynamicWeights = getDynamicWeights(enrichedTabs, existingGroups);
            this.scorers = [
                new OpenerScorer(this.dynamicWeights),
                new ContentTypeScorer(this.dynamicWeights),
                new HostnameScorer(this.dynamicWeights),
                new KeywordScorer(this.dynamicWeights),
                new ExistingGroupScorer(this.dynamicWeights)
            ];
            this.tabProposals = new Map();
        }

        generateProposals(context) {
            this.enrichedTabs.forEach(et => {
                const proposals = [];

                this.scorers.forEach(scorer => {
                    const scorerProposals = scorer.propose(et, this.enrichedTabs, this.existingGroups);
                    proposals.push(...scorerProposals);
                });

                if (context.aiResults.has(et.tab)) {
                    const aiTopic = context.aiResults.get(et.tab);
                    if (aiTopic !== "Uncategorized") {
                        const aiProposal = {
                            groupName: aiTopic,
                            score: this.dynamicWeights.aiSuggestion,
                            source: 'AI'
                        };
                        proposals.push(aiProposal);
                    }
                }

                if (proposals.length > 0) {
                    proposals.sort((a, b) => b.score - a.score);
                }

                this.tabProposals.set(et.tab, proposals);
            });
        }

        resolveGroupAssignments() {
            const groupCandidates = new Map();

            // --- Step 1: Build Candidate Groups from all proposals ---
            // Instead of picking the best proposal per tab, we aggregate all proposals by their group name.
            this.enrichedTabs.forEach(et => {
                const proposals = this.tabProposals.get(et.tab);
                if (!proposals || proposals.length === 0) return;

                proposals.forEach(proposal => {
                    // Ignore low-confidence proposals from the start
                    if (proposal.score < CONFIG.thresholds.minGroupingScore) return;

                    const groupName = proposal.groupName;
                    if (!groupCandidates.has(groupName)) {
                        groupCandidates.set(groupName, {
                            tabs: [],
                            totalScore: 0,
                            sources: new Set()
                        });
                    }
                    const candidate = groupCandidates.get(groupName);
                    candidate.tabs.push({ tab: et.tab, score: proposal.score });
                    candidate.totalScore += proposal.score;
                    candidate.sources.add(proposal.source);
                });
            });

            // --- Step 2: Score the strength of each Candidate Group ---
            // A group is stronger if it has more tabs and diverse sources.
            const scoredCandidates = [];
            for (const [name, candidate] of groupCandidates.entries()) {
                const numTabs = candidate.tabs.length;
                const numSources = candidate.sources.size;

                // Don't even consider single-tab groups unless they match an existing group
                // or are being added via auto-sort.
                const isExisting = this.existingGroups.has(name);
                const isAutoSortMode = this.enrichedTabs.length <= CONFIG.autoSortNewTabs.maxTabsToSort;
                if (numTabs < CONFIG.thresholds.minTabsForNewGroup && !isExisting && !isAutoSortMode) {
                    continue;
                }

                // Scoring Formula: Base score is the sum of tab scores.
                // Add a significant bonus for each additional tab.
                // Add a smaller bonus for each unique source (AI, Keyword, etc.)
                const tabBonus = 1 + ((numTabs - 1) * 0.5); // 50% bonus per extra tab
                const sourceBonus = 1 + ((numSources - 1) * 0.15); // 15% bonus per extra source

                const finalScore = candidate.totalScore * tabBonus * sourceBonus;

                scoredCandidates.push({
                    name,
                    finalScore,
                    tabs: candidate.tabs.map(t => t.tab) // Just need the tab objects now
                });
            }

            // --- Step 3: Resolve conflicts by picking the strongest groups first ---
            scoredCandidates.sort((a, b) => b.finalScore - a.finalScore);

            const finalGroups = {};
            const assignedTabs = new Set();
            const leftoverTabs = [];

            for (const candidate of scoredCandidates) {
                // Get tabs for this group that haven't already been assigned to a stronger group
                const tabsForThisGroup = candidate.tabs.filter(tab => !assignedTabs.has(tab));

                if (tabsForThisGroup.length > 0) {
                    // Check min size again after filtering out assigned tabs
                    const isExisting = this.existingGroups.has(candidate.name);
                    if (tabsForThisGroup.length >= CONFIG.thresholds.minTabsForNewGroup || isExisting) {
                        finalGroups[candidate.name] = tabsForThisGroup;
                        tabsForThisGroup.forEach(tab => assignedTabs.add(tab));
                    }
                }
            }

            // Any tab not in a final group is a leftover
            this.enrichedTabs.forEach(et => {
                if (!assignedTabs.has(et.tab)) {
                    leftoverTabs.push(et);
                }
            });

            return { finalGroups, leftoverTabs };
        }
    }

    // --- Individual Scorer Implementations ---

    class OpenerScorer {
        constructor(weights) {
            this.weights = weights;
        }

        propose(tab, allTabs, existingGroups) {
            if (tab.openerTab?.isConnected) {
                const openerEnrichedTab = allTabs.find(et => et.tab.id === tab.openerTab.id);
                if (openerEnrichedTab) {
                    const groupName = processTopic(openerEnrichedTab.data.title);
                    let score = this.weights.opener;

                    // Apply time-based adjustments if enabled
                    if (CONFIG.dynamicWeights.openerTimeTracking.enabled) {
                        const isRecent = TabCreationTracker.isRecentOpener(tab.tab.id);
                        if (isRecent) {
                            score += CONFIG.dynamicWeights.openerTimeTracking.recentOpenerBoost;
                        }
                    }

                    return [{ groupName, score, source: 'Opener' }];
                }
            }
            return [];
        }
    }

    class ContentTypeScorer {
        constructor(weights) {
            this.weights = weights;
        }

        propose(tab, allTabs, existingGroups) {
            if (tab.contentType) {
                const score = this.weights.contentType;
                return [{ groupName: tab.contentType, score, source: 'Content-Type' }];
            }
            return [];
        }
    }

    // Helper to extract main domain (second-level + top-level)
    function getMainDomain(hostname) {
        if (!hostname) return hostname;
        const parts = hostname.split('.');
        if (parts.length <= 2) return hostname; // already main domain
        // Handles cases like a.b.c.domain.com -> domain.com
        return parts.slice(-2).join('.');
    }

    class HostnameScorer {
        constructor(weights) {
            this.weights = weights;
        }

        propose(tab, allTabs, existingGroups) {
            if (tab.data.hostname && tab.data.hostname !== 'N/A') {
                // Use only the main domain for grouping
                const mainDomain = getMainDomain(tab.data.hostname);
                const groupName = processTopic(mainDomain);
                const score = this.weights.hostname;
                return [{ groupName, score, source: 'Hostname' }];
            }
            return [];
        }
    }

    class KeywordScorer {
        constructor(weights) {
            this.weights = weights;
        }

        propose(tab, allTabs, existingGroups) {
            const proposals = [];
            if (tab.keywords && tab.keywords.size > 0) {
                const score = this.weights.keyword;
                // Fuzzy merge keywords for this tab
                const tabKeywords = Array.from(tab.keywords);
                const mergedTabKeywords = [];
                const used = new Set();
                for (let i = 0; i < tabKeywords.length; i++) {
                    if (used.has(tabKeywords[i])) continue;
                    let group = [tabKeywords[i]];
                    used.add(tabKeywords[i]);
                    for (let j = i + 1; j < tabKeywords.length; j++) {
                        if (used.has(tabKeywords[j])) continue;
                        if (levenshteinDistance(tabKeywords[i], tabKeywords[j]) <= 4) {
                            group.push(tabKeywords[j]);
                            used.add(tabKeywords[j]);
                        }
                    }
                    // Use the shortest keyword as canonical
                    group.sort((a, b) => a.length - b.length);
                    mergedTabKeywords.push(group[0]);
                }
                mergedTabKeywords.forEach(kw => {
                    const groupName = processTopic(kw);
                    proposals.push({
                        groupName,
                        score,
                        source: 'Keyword'
                    });
                });
            }
            return proposals;
        }
    }

    class ExistingGroupScorer {
        constructor(weights) {
            this.weights = weights;
        }

        propose(tab, allTabs, existingGroups) {
            const proposals = [];
            if (!existingGroups || existingGroups.size === 0) {
                return [];
            }

            for (const [groupName, groupData] of existingGroups) {
                const similarity = this.calculateSimilarityToGroup(tab, groupData);
                if (similarity > 0.4) {
                    const score = this.weights.existingGroup * similarity;
                    proposals.push({
                        groupName,
                        score,
                        source: 'Existing Group'
                    });
                }
            }
            return proposals;
        }

        calculateSimilarityToGroup(tab, groupData) {
            let factors = 0;
            let totalScore = 0;

            // Check hostname similarity
            if (tab.data.hostname && groupData.commonHostnames?.includes(tab.data.hostname)) {
                totalScore += 1.0;
                factors++;
            }

            // Check content type similarity
            if (tab.contentType && groupData.contentTypes?.includes(tab.contentType)) {
                totalScore += 1.0;
                factors++;
            }

            // Check keyword similarity
            if (tab.keywords && groupData.commonKeywords) {
                const overlap = [...tab.keywords].filter(kw => groupData.commonKeywords.includes(kw));
                if (overlap.length > 0) {
                    const keywordScore = overlap.length / tab.keywords.size;
                    totalScore += keywordScore;
                    factors++;
                }
            }

            return factors > 0 ? totalScore / factors : 0;
        }
    }



    // --- Dynamic Weight Calculation ---

    const getDynamicWeights = (enrichedTabs, existingGroups) => {
        if (!CONFIG.dynamicWeights.enabled) {
            return CONFIG.scoringWeights;
        }

        // Apply size-based adjustments
        let finalWeights = getSizeBasedWeights(enrichedTabs.length);

        // Apply user behavior adjustments
        const currentWorkspaceId = WorkspaceUtils.getCurrentWorkspaceId();
        if (currentWorkspaceId) {
            const behavior = UserBehaviorAnalyzer.analyzeWorkspaceBehavior(currentWorkspaceId);

            if (behavior.workPattern === 'work') {
                finalWeights.contentType *= 1.15; // Content type matters more for work
                finalWeights.hostname *= 1.10;    // Domain matters more for work
                finalWeights.aiSuggestion *= 0.95; // AI less needed for work patterns
            } else {
                finalWeights.aiSuggestion *= 1.15; // AI better at leisure categorization
                finalWeights.keyword *= 1.10;      // Keywords matter more for leisure
            }
        }

        // Apply content complexity adjustments (average across all tabs)
        const complexityAdjustments = enrichedTabs.map(et =>
            ContentComplexityAnalyzer.getComplexityAdjustment(
                ContentComplexityAnalyzer.analyzeContentComplexity(et.data)
            )
        );

        // Average the adjustments
        const avgAdjustment = {};
        Object.keys(finalWeights).forEach(key => {
            const values = complexityAdjustments.map(adj => adj[key] || 1.0);
            avgAdjustment[key] = values.reduce((a, b) => a + b, 0) / values.length;
        });

        // Apply complexity adjustments
        Object.keys(finalWeights).forEach(key => {
            finalWeights[key] *= avgAdjustment[key];
        });

        return finalWeights;
    };

    const getSizeBasedWeights = (tabCount) => {
        let profile;
        if (tabCount <= 5) {
            profile = CONFIG.dynamicWeights.sizeProfiles.small;
        } else if (tabCount <= 15) {
            profile = CONFIG.dynamicWeights.sizeProfiles.medium;
        } else {
            profile = CONFIG.dynamicWeights.sizeProfiles.large;
        }

        return { ...profile };
    };

    const getSizeProfileName = (tabCount) => {
        if (tabCount <= 5) return 'small';
        if (tabCount <= 15) return 'medium';
        return 'large';
    };



    // --- Helper Functions ---

    const injectStyles = () => {
        let styleElement = document.getElementById('tab-sort-clear-styles');
        const styles = CONFIG.getStyles();

        if (styleElement) {
            if (styleElement.textContent !== styles) {
                styleElement.textContent = styles;
            }
            return;
        }
        styleElement = Object.assign(document.createElement('style'), {
            id: 'tab-sort-clear-styles',
            textContent: styles
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
            Logger.error('Error getting tab data for tab:', tab, e);
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

        return existingGroups;
    };

    const extractCommonKeywords = (titles) => {
        const keywordCounts = new Map();
        let allKeywords = [];
        titles.forEach(title => {
            const keywords = extractTitleKeywords(title);
            keywords.forEach(keyword => {
                keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
                allKeywords.push(keyword);
            });
        });
        // Fuzzy merge keywords using Levenshtein distance (threshold 4)
        const mergedKeywords = [];
        const used = new Set();
        for (let i = 0; i < allKeywords.length; i++) {
            if (used.has(allKeywords[i])) continue;
            let group = [allKeywords[i]];
            used.add(allKeywords[i]);
            for (let j = i + 1; j < allKeywords.length; j++) {
                if (used.has(allKeywords[j])) continue;
                if (levenshteinDistance(allKeywords[i], allKeywords[j]) <= 4) {
                    group.push(allKeywords[j]);
                    used.add(allKeywords[j]);
                }
            }
            // Use the most common/shortest keyword as the canonical
            group.sort((a, b) => (keywordCounts.get(b) - keywordCounts.get(a)) || (a.length - b.length));
            mergedKeywords.push(group[0]);
        }
        // Count merged keywords
        const mergedCounts = new Map();
        mergedKeywords.forEach(k => {
            mergedCounts.set(k, (mergedCounts.get(k) || 0) + 1);
        });
        const threshold = Math.max(1, Math.floor(titles.length * 0.4));
        return Array.from(mergedCounts.entries())
            .filter(([_, count]) => count >= threshold)
            .sort((a, b) => b[1] - a[1])
            .map(([keyword]) => keyword);
    };

    const toTitleCase = (str) => {
        if (!str) return "";
        return str.toLowerCase().split(' ').map(word => {
            if (word.toUpperCase() === 'AI' || word.toUpperCase() === 'XAI') return word.toUpperCase();
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
            Logger.error(`Error finding group with selector: ${selector}`, e);
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
                Logger.error("Cannot get current workspace ID.");
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
            Logger.warn(`AI (${apiName}): Response mismatch. Expected ${validTabsWithData.length}, received ${lines.length}.`);
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
                if (id === 'sort-button') {
                    // Broom + Sort text
                    const buttonFragment = window.MozXULElement.parseXULToFragment(`
                        <toolbarbutton
                            id="sort-button"
                            class="sort-button-with-icon"
                            command="cmd_zenSortTabs"
                            tooltiptext="${tooltip}">
                            <hbox class="toolbarbutton-box" align="center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 28 28" class="broom-icon">
                                    <g>
                                        <path d="M19.9132 21.3765C19.8875 21.0162 19.6455 20.7069 19.3007 20.5993L7.21755 16.8291C6.87269 16.7215 6.49768 16.8384 6.27165 17.1202C5.73893 17.7845 4.72031 19.025 3.78544 19.9965C2.4425 21.392 3.01177 22.4772 4.66526 22.9931C4.82548 23.0431 5.78822 21.7398 6.20045 21.7398C6.51906 21.8392 6.8758 23.6828 7.26122 23.8031C7.87402 23.9943 8.55929 24.2081 9.27891 24.4326C9.59033 24.5298 10.2101 23.0557 10.5313 23.1559C10.7774 23.2327 10.7236 24.8834 10.9723 24.961C11.8322 25.2293 12.699 25.4997 13.5152 25.7544C13.868 25.8645 14.8344 24.3299 15.1637 24.4326C15.496 24.5363 15.191 26.2773 15.4898 26.3705C16.7587 26.7664 17.6824 27.0546 17.895 27.1209C19.5487 27.6369 20.6333 27.068 20.3226 25.1563C20.1063 23.8255 19.9737 22.2258 19.9132 21.3765Z" fill="currentColor" stroke="none"/>
                                        <path d="M16.719 1.7134C17.4929-0.767192 20.7999 0.264626 20.026 2.74523C19.2521 5.22583 18.1514 8.75696 17.9629 9.36C17.7045 10.1867 16.1569 15.1482 15.899 15.9749L19.2063 17.0068C20.8597 17.5227 20.205 19.974 18.4514 19.4268L8.52918 16.331C6.87208 15.8139 7.62682 13.3938 9.28426 13.911L12.5916 14.9429C12.8495 14.1163 14.3976 9.15491 14.6555 8.32807C14.9135 7.50122 15.9451 4.19399 16.719 1.7134Z" fill="currentColor" stroke="none"/>
                                    </g>
                                </svg>
                                <label class="toolbarbutton-text" value="Sort" crop="right"/>
                            </hbox>
                        </toolbarbutton>
                    `);
                    return buttonFragment.firstChild.cloneNode(true);
                } else if (id === 'clear-button') {
                    // Down arrow + Clear text (with line)
                    const buttonFragment = window.MozXULElement.parseXULToFragment(`
                        <toolbarbutton
                            id="clear-button"
                            class="clear-button-with-icon"
                            command="cmd_zenClearTabs"
                            tooltiptext="${tooltip}">
                            <hbox class="toolbarbutton-box" align="center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="down-arrow-icon">
                                  <path d="M8 3v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                  <path d="M5 10l3 3 3-3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <label class="toolbarbutton-text" value="Clear" crop="right"/>
                            </hbox>
                        </toolbarbutton>
                    `);
                    return buttonFragment.firstChild.cloneNode(true);
                } else {
                    // Fallback for any other button
                    const fragment = window.MozXULElement.parseXULToFragment(
                        `<toolbarbutton id=\"${id}\" command=\"${command}\" label=\"${label}\" tooltiptext=\"${tooltip}\"/>`
                    );
                    return fragment.firstChild.cloneNode(true);
                }
            } catch (e) {
                Logger.error(`BUTTONS: Error creating ${id}:`, e);
                return null;
            }
        },

        ensureButtonsExist: (container) => {
            if (!container) return;
            if (!container.querySelector('#sort-button')) {
                const sortButton = ButtonFactory.createButton('sort-button', 'cmd_zenSortTabs', '', 'Sort Tabs into Groups');
                if (sortButton) container.appendChild(sortButton);
            }
            if (!container.querySelector('#clear-button')) {
                const clearButton = ButtonFactory.createButton('clear-button', 'cmd_zenClearTabs', 'Clear', 'Close ungrouped, non-pinned tabs');
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
                    Logger.error("Gemini API Error:", reason, data);
                    throw new Error(`Gemini API Error: ${reason}`);
                }
                return processAIResponse(aiText, validTabsWithData, "Gemini");
            } else {
                throw new Error("No AI API is enabled in the configuration.");
            }
        } catch (error) {
            Logger.error(`AI (${apiChoice}): Error getting topics:`, error);
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
    const sortTabsByTopic = async (isAutoSortForNewTab = false, newTab = null) => {
        if (isSorting) {
            return;
        }
        isSorting = true;
        const selectedTabs = gBrowser.selectedTabs;
        const isSortingSelectedTabs = selectedTabs.length > 1;
        let separatorsToSort = [];

        try {
            separatorsToSort = document.querySelectorAll('.vertical-pinned-tabs-container-separator');
            if (separatorsToSort.length > 0) separatorsToSort.forEach(sep => sep.classList.add('separator-is-sorting'));

            // Add brushing animation to sort button
            const sortButton = document.querySelector('#sort-button');
            if (sortButton) {
                sortButton.classList.add('brushing');
            }

            const currentWorkspaceId = WorkspaceUtils.getCurrentWorkspaceId();
            if (!WorkspaceUtils.validateWorkspace(currentWorkspaceId)) { isSorting = false; return; }
            // --- Step 1: Analyze Environment & Determine Tabs to Consider ---


            const existingGroups = analyzeExistingGroups(currentWorkspaceId);
            let rawTabsToConsider;

            if (isAutoSortForNewTab) {
                // In auto-sort mode, we need a broader context.
                // Start with all ungrouped tabs.
                const tabsToReEvaluate = new Set(TabFilters.getUngroupedTabs(currentWorkspaceId));

                // Also pull tabs from "weak" single-tab groups to allow for merging.
                // This is the key to solving the incremental sorting problem.
                for (const [groupName, groupData] of existingGroups.entries()) {
                    if (groupData.size === 1) {
                        // Find the actual tab element for that weak group
                        const weakGroupEl = findGroupElement(groupName, currentWorkspaceId);
                        if (weakGroupEl) {
                            const tabInWeakGroup = weakGroupEl.querySelector('tab');
                            if (tabInWeakGroup && !tabInWeakGroup.pinned) {
                                tabsToReEvaluate.add(tabInWeakGroup);
                            }
                        }
                    }
                }

                // Ensure the newly triggered tab is included if it's not already.
                if (newTab && !newTab.pinned) {
                    tabsToReEvaluate.add(newTab);
                }

                rawTabsToConsider = Array.from(tabsToReEvaluate);

                rawTabsToConsider.forEach(tab => {
                    const parentGroup = tab.closest('tab-group');
                    // The `gBrowser.moveTabToGroup(tab, null)` command is how you ungroup a tab.
                    if (parentGroup) {
                        try {
                            gBrowser.moveTabToGroup(tab, null);
                        } catch (e) {
                            Logger.warn(`Harmless race condition while ungrouping tab "${tab.label}". This is expected during rapid sorting.`, e.message);
                        }
                    }
                });

            } else if (isSortingSelectedTabs) {
                // Standard multi-select sort logic
                rawTabsToConsider = TabFilters.getSelectedTabsForWorkspace(selectedTabs, currentWorkspaceId);
            } else {
                // Standard "Sort All" logic
                rawTabsToConsider = TabFilters.getUngroupedTabs(currentWorkspaceId);
            }

            if (rawTabsToConsider.length === 0) {
                isSorting = false; return;
            }

            const enrichedTabs = rawTabsToConsider.map(tab => {
                const data = getTabData(tab);
                return {
                    tab, data,
                    keywords: extractTitleKeywords(data.title),
                    contentType: detectContentType(data),
                    openerTab: tab.openerTab
                };
            });

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

                const engine = new TabGroupingEngine(enrichedTabs, existingGroups);
                engine.generateProposals({ aiResults });
                const { finalGroups: firstPassGroups, leftoverTabs } = engine.resolveGroupAssignments();

                finalGroups = firstPassGroups;

                // --- Step 3: Second Pass for Leftovers ---
                if (leftoverTabs.length > 0) {
                    const secondPassAiResults = await askAIForMultipleTopics(
                        leftoverTabs.map(et => ({ tab: et.tab, data: et.data, contentTypeHint: et.contentType })),
                        [...existingGroups.keys(), ...Object.keys(finalGroups)] // Provide full context
                    );

                    secondPassAiResults.forEach((topic, tab) => {
                        if (topic !== "Uncategorized") {
                            if (!finalGroups[topic]) finalGroups[topic] = [];
                            finalGroups[topic].push(tab);
                        }
                    });
                }
            }

            // --- Step 4: Consolidate & Create Groups ---
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

            const existingGroupElementsMap = new Map();
            document.querySelectorAll(WorkspaceUtils.getGroupSelector(currentWorkspaceId)).forEach(el => {
                if (el.label) existingGroupElementsMap.set(el.label, el);
            });
            groupColorIndex = CONFIG.colorSettings.randomStart ?
                Math.floor(Math.random() * CONFIG.groupColors.length) : 0; // Random or sequential starting color for this sorting session

            for (const topic in finalGroups) {
                const tabsForThisTopic = finalGroups[topic].filter(t => t?.isConnected);
                if (tabsForThisTopic.length === 0) continue;

                const existingEl = existingGroupElementsMap.get(topic) || findGroupElement(topic, currentWorkspaceId);

                if (existingEl?.isConnected) {
                    // Use a loop, as moveTabToGroup handles one tab at a time.
                    for (const tab of tabsForThisTopic) {
                        if (tab?.isConnected) {
                            // Only move the tab if it's not already in the target group
                            if (tab.closest('tab-group') !== existingEl) {
                                try {
                                    gBrowser.moveTabToGroup(tab, existingEl);
                                } catch (e) {
                                    Logger.error(`Error moving tab "${tab.label}" to group "${topic}":`, e);
                                }
                            }
                        }
                    }
                } else {
                    try {
                        const groupOpts = { label: topic, color: getNextGroupColor(), insertBefore: tabsForThisTopic[0] };
                        gBrowser.addTabGroup(tabsForThisTopic, groupOpts);
                    } catch (e) {
                        Logger.error(`Error creating new group "${topic}":`, e);
                    }
                }
            }

        } catch (error) {
            Logger.error("Error during overall sorting process:", error);
        } finally {
            isSorting = false;
            if (separatorsToSort.length > 0) separatorsToSort.forEach(sep => {
                if (sep?.isConnected) sep.classList.remove('separator-is-sorting');
            });

            // Remove brushing animation from sort button
            const sortButton = document.querySelector('#sort-button');
            if (sortButton) {
                sortButton.classList.remove('brushing');
            }

            setTimeout(() => {
                Array.from(gBrowser.tabs).forEach(t => {
                    if (t?.isConnected) t.classList.remove('tab-is-sorting');
                });
            }, 500);
        }
    };

    // --- Clear Tabs Functionality ---
    const clearTabs = () => {
        let closedCount = 0;
        try {
            const currentWorkspaceId = WorkspaceUtils.getCurrentWorkspaceId();
            if (!WorkspaceUtils.validateWorkspace(currentWorkspaceId)) {
                return;
            }
            const tabsToClose = TabFilters.getClearableTabs(currentWorkspaceId);
            if (tabsToClose.length === 0) {
                return;
            }
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
                            Logger.warn(`Error removing tab: ${removeError}`, tab);
                            if (tab?.isConnected) tab.classList.remove('tab-closing');
                        }
                    }
                }, 500);
            });
        } catch (error) {
            Logger.error("Error during tab clearing:", error);
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
                ensureButtonsExist(periphery);
            } else if (!periphery) Logger.error("No separators or fallback container found.");
        }
    }

    function setupCommandsAndListener() {
        const zenCommands = document.querySelector("commandset#zenCommandSet");
        if (!zenCommands) {
            Logger.error("Could not find 'commandset#zenCommandSet'.");
            return;
        }
        if (!zenCommands.querySelector("#cmd_zenSortTabs")) {
            try {
                zenCommands.appendChild(window.MozXULElement.parseXULToFragment(`<command id="cmd_zenSortTabs"/>`).firstChild);
            } catch (e) {
                Logger.error("Error adding 'cmd_zenSortTabs':", e);
            }
        }
        if (!zenCommands.querySelector("#cmd_zenClearTabs")) {
            try {
                zenCommands.appendChild(window.MozXULElement.parseXULToFragment(`<command id="cmd_zenClearTabs"/>`).firstChild);
            } catch (e) {
                Logger.error("Error adding 'cmd_zenClearTabs':", e);
            }
        }
        if (!commandListenerAdded) {
            try {
                zenCommands.addEventListener('command', (event) => {
                    if (event.target.id === "cmd_zenSortTabs") sortTabsByTopic();
                    else if (event.target.id === "cmd_zenClearTabs") clearTabs();
                });
                commandListenerAdded = true;
            } catch (e) {
                Logger.error("Error adding command listener:", e);
            }
        }
    }

    function setupZenWorkspaceHooks() {
        if (typeof gZenWorkspaces === 'undefined') {
            Logger.warn("gZenWorkspaces not found. Skipping hooks.");
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
                    Logger.error("Error in original onTabBrowserInserted:", e);
                }
            }
            setTimeout(addButtonsToAllSeparators, 150);
        };
        gZenWorkspaces.updateTabsContainers = function (...args) {
            if (typeof gZenWorkspaces.originalHooks.updateTabsContainers === 'function' && gZenWorkspaces.originalHooks.updateTabsContainers !== gZenWorkspaces.updateTabsContainers) {
                try {
                    gZenWorkspaces.originalHooks.updateTabsContainers.apply(gZenWorkspaces, args);
                } catch (e) {
                    Logger.error("Error in original updateTabsContainers:", e);
                }
            }
            setTimeout(addButtonsToAllSeparators, 150);
        };
    }

    function initializeScript() {
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
                clearInterval(initCheckInterval);
                const finalSetup = () => {
                    try {
                        // Initialize tracking systems
                        TabCreationTracker.init();
                        UserBehaviorAnalyzer.init();

                        injectStyles();
                        setupCommandsAndListener();
                        addButtonsToAllSeparators();
                        setupZenWorkspaceHooks();
                    } catch (e) {
                        Logger.error("Error during deferred final setup:", e);
                    }
                };
                if ('requestIdleCallback' in window) requestIdleCallback(finalSetup, { timeout: 2000 });
                else setTimeout(finalSetup, 500);
            } else if (checkCount > maxChecks) {
                clearInterval(initCheckInterval);
                Logger.error(`Failed to find required elements after ${maxChecks} checks.`);
            }
        }, checkInterval);
    }

    if (document.readyState === "complete" || document.readyState === "interactive") {
        initializeScript();
    } else {
        window.addEventListener("load", initializeScript, { once: true });
    }

    window.ensureURLMonitoring = () => {
        if (typeof TabCreationTracker !== 'undefined') {
            console.log('🔄 Ensuring URL monitoring is active on current selected tab...');
            TabCreationTracker.ensureURLMonitoringActive();
            console.log('✅ URL monitoring ensured');
        } else {
            console.log('TabCreationTracker not initialized yet');
        }
    };

    window.triggerURLUpdate = () => {
        if (typeof TabCreationTracker !== 'undefined') {
            console.log('🔄 Manually triggering URL update and auto-sort...');
            TabCreationTracker.updateCurrentURL();
            console.log('✅ URL update triggered');
        } else {
            console.log('TabCreationTracker not initialized yet');
        }
    };

})();