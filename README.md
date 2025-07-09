# ✨ Ai Tab Groups for Zen Browser ✨
‼️This is still Work-in-Progress ‼️

https://github.com/user-attachments/assets/fc792843-b1da-448e-ba00-63322a3d9c99


## Pre-requisites
- Enable userChrome Customizations:
    In `about:config` go to `toolkit.legacyUserProfileCustomizations.stylesheets` and set it to True.
- Install and Setup the userChrome.js Loader from [Autoconfig](https://github.com/MrOtherGuy/fx-autoconfig/tree/master)
- Install the Tab groups config from [Advanced Tab Groups](https://github.com/Anoms12/Advanced-Tab-Groups)
    If you already have a TabGroup Config you can skip this
  
## Setup and Install
- Copy and paste the `tab_sort.uc.js` file to your `chrome/JS` folder.

### AI Setup (Multi-Provider Support)
The script supports **5 AI providers** with automatic failover. Choose one or enable multiple for redundancy:

1. **Gemini (RECOMMENDED)**
    - Set `gemini { enabled:true }` in `apiConfig`
    - Get an API Key from [AI Studio](https://aistudio.google.com)
    - Replace `YOUR_GEMINI_API_KEY` with the copied API key
    - Model: `gemini-2.5-flash-lite-preview-06-17` (default)

2. **OpenAI**
    - Set `openai { enabled:true }` in `apiConfig`
    - Get API key from [OpenAI](https://platform.openai.com/api-keys)
    - Models: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`

3. **Anthropic (Claude)**
    - Set `anthropic { enabled:true }` in `apiConfig`
    - Get API key from [Anthropic](https://console.anthropic.com)
    - Models: `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`, `claude-3-haiku-20240307`

4. **Mistral**
    - Set `mistral { enabled:true }` in `apiConfig`
    - Get API key from [Mistral](https://console.mistral.ai)
    - Models: `mistral-large-latest`, `mistral-small-latest`, `open-mistral-7b`

5. **DeepSeek**
    - Set `deepseek { enabled:true }` in `apiConfig`
    - Get API key from [DeepSeek](https://platform.deepseek.com)
    - Models: `deepseek-chat`, `deepseek-coder`

6. **Ollama (Local)**
    - Download and install [Ollama](https://ollama.com/)
    - Install your preferred model: `ollama pull llama3.1`
    - Set `ollama { enabled:true }` in `apiConfig`
    - Set your model in `ollama.model` (check with `ollama list`)

- Open Zen browser, go to `about:support` and clear startup cache.
- Done. Enjoy ^^

## 🚀 Features

### ⚡ **Auto-Sorting**
- **New Tab Auto-Sort**: Automatically sorts new tabs as they're created (configurable delay)
- **URL Change Auto-Sort**: Re-sorts tabs when their URLs change (perfect for dynamic content)
- **Smart Debouncing**: Prevents excessive sorting with intelligent timing controls

### 🧠 **Adaptive Intelligence System**
- **Dynamic Weight Adjustment**: Changes grouping strategy based on your browsing patterns
- **Behavioral Pattern Recognition**: Detects work vs leisure browsing and adjusts accordingly
- **Content Complexity Analysis**: Adapts to technical vs simple content automatically
- **Size-Based Profiles**: Different strategies for small (1-5), medium (6-15), and large (16+) tab workloads

### 🎯 **Multi-Stage Scoring System**
- **Existing Group Scorer**: Prioritizes joining existing groups
- **Opener Relationship Scorer**: Groups tabs opened from the same parent
- **Content Type Scorer**: Identifies documents, videos, code repos, etc.
- **Hostname Scorer**: Groups by domain/website
- **Keyword Scorer**: Matches based on title keywords
- **AI Scorer**: Powered by your chosen AI provider

### ⏰ **Time-Aware Features**
- **Recent Opener Boost**: Recently opened tabs get higher grouping priority
- **Decay System**: Opener relationships naturally decay over time
- **Smart Timing**: Configurable delays and thresholds for all auto-features

### 🎨 **Visual & UX Features**
- **Smart Button Visibility**: Buttons appear on hover or stay always visible
- **Sorting Animations**: Visual feedback during grouping operations
- **Color Randomization**: Random starting colors for variety
- **Progress Indicators**: Auto-sort status indicators

### 📊 **Advanced Logging & Debugging**
- **Detailed Scoring Logs**: See exactly why tabs were grouped
- **Weight Change Tracking**: Monitor dynamic adjustments
- **Performance Metrics**: Track grouping results and timing
- **Configurable Log Levels**: Debug, info, warn, error, or none

### ⚙️ **Extensive Customization**
- **Scorer Enable/Disable**: Turn individual scoring systems on/off
- **Weight Customization**: Fine-tune all scoring weights
- **Threshold Controls**: Adjust minimum scores and group sizes
- **Consolidation Settings**: Control group name merging sensitivity
- **Content Type Patterns**: Add custom content type detection

## How it works?

The script uses a sophisticated **adaptive multi-stage process** to intelligently group your tabs:

### **🎯 Phase 1: Context Analysis**
- **Workspace Analysis**: Detects existing groups and their characteristics
- **Behavioral Pattern Detection**: Identifies work vs leisure browsing patterns
- **Content Complexity Assessment**: Analyzes technical vs simple content
- **Tab Volume Profiling**: Adapts strategy based on number of tabs

### **⚖️ Phase 2: Dynamic Weight Calculation**
The system calculates optimal scoring weights based on:
- **Size Profile**: Small/medium/large tab workloads get different strategies
- **Work Pattern**: Technical domains (GitHub, Stack Overflow) boost hostname/content scoring
- **Leisure Pattern**: Entertainment domains (YouTube, Reddit) boost AI/keyword scoring  
- **Content Complexity**: Technical content gets different weight adjustments
- **Time Factors**: Recent opener relationships get priority boosts

### **🔍 Phase 3: Multi-Scorer Analysis**
Each tab gets scored by multiple systems simultaneously:
1. **Existing Group Scorer**: Analyzes similarity to current groups
2. **Opener Scorer**: Tracks parent-child tab relationships
3. **Content Type Scorer**: Detects documents, videos, repos, etc.
4. **Hostname Scorer**: Groups by domain/website
5. **Keyword Scorer**: Matches title keywords with fuzzy logic
6. **AI Scorer**: Contextual analysis by your chosen AI provider

### **🧩 Phase 4: Intelligent Resolution**
- **Conflict Resolution**: Handles competing group suggestions intelligently
- **Minimum Thresholds**: Ensures quality groupings with configurable minimums
- **Existing Group Priority**: Strongly favors joining existing groups over creating new ones

### **🤖 Phase 5: AI-Powered Refinement**
- **Context-Aware Prompts**: AI receives full context of existing groups
- **Two-Pass System**: Standard grouping followed by AI cleanup of leftovers
- **Multi-Provider Failover**: Automatic fallback if primary AI fails
- **Smart Categorization**: AI creates consistent, meaningful group names

### **🔄 Phase 6: Consolidation & Optimization**
- **Fuzzy Name Matching**: Merges similar group names (e.g., "Project Doc" + "Project Docs")
- **Group Validation**: Ensures minimum tab counts and quality
- **Color Assignment**: Smart color selection for new groups
- **Visual Feedback**: Smooth animations and progress indicators

### **📈 Adaptive Learning**
The system continuously adapts based on:
- **User Interaction Patterns**: Tracks tab access and dwell time
- **Domain Preferences**: Learns your most-used websites
- **Workspace Behavior**: Adapts to different workspace contexts
- **Time-Based Patterns**: Adjusts for recency and usage frequency

## 🎛️ Configuration Options

### **Auto-Sort Settings**
```javascript
autoSortNewTabs: {
    enabled: true,        // Enable/disable auto-sorting
    delay: 2000,         // Wait time before sorting
    maxTabsToSort: 10    // Limit for auto-sort mode
}
```

### **AI Provider Configuration**
```javascript
apiConfig: {
    openai: { enabled: false, apiKey: '', model: 'gpt-4o-mini' },
    anthropic: { enabled: false, apiKey: '', model: 'claude-3-haiku-20240307' },
    mistral: { enabled: false, apiKey: '', model: 'mistral-small-latest' },
    deepseek: { enabled: false, apiKey: '', model: 'deepseek-chat' },
    gemini: { enabled: true, apiKey: '', model: 'gemini-2.5-flash-lite-preview-06-17' }
}
```

### **Scoring System Controls**
```javascript
scorers: {
    enabled: {
        existingGroup: true,   // Prioritize existing groups
        opener: true,          // Track opener relationships  
        contentType: true,     // Detect content types
        hostname: true,        // Group by domain
        aiSuggestion: true,    // Use AI analysis
        keyword: true          // Match keywords
    }
}
```

### **Advanced Options**
- **AI-Only Mode**: Let AI handle all grouping decisions
- **Logging Controls**: Detailed debugging and performance tracking
- **Button Visibility**: Auto-hide or always show controls
- **Consolidation Tuning**: Adjust group name merging sensitivity
- **Custom Content Types**: Add your own content type patterns

*   The script primarily uses tab titles, URLs, and descriptions for context.
*   Groups are generally formed if they meet a minimum tab count (default is 1), though the system intelligently adapts thresholds.
*   You can customize AI prompts, scoring weights, and virtually every aspect of the system.
*   The "Clear" button only clears ungrouped, non-pinned tabs in the current workspace.

**Peace <3** 
