# AI Tab Groups for Zen Browser

Advanced AI-powered tab management with intelligent grouping, auto-sorting, and multi-provider support.

## Prerequisites

- **Enable userChrome Customizations**: In `about:config`, set `toolkit.legacyUserProfileCustomizations.stylesheets` to `true`
- **Install userChrome.js Loader**: Set up [Autoconfig](https://github.com/MrOtherGuy/fx-autoconfig/tree/master)
- **Install Tab Groups Config**: Use [Advanced Tab Groups](https://github.com/Anoms12/Advanced-Tab-Groups) (skip if you already have a TabGroup config)

## Installation & Setup

### 1. Choose Your Configuration

This repository provides two complementary scripts:

**Option A: `tidy-tabs.uc.js` (Advanced)**
- Full-featured AI tab management with 6 AI provider support
- Advanced scoring system with dynamic weight adaptation
- Auto-sorting for new tabs and URL changes
- Comprehensive preference-based configuration
- Detailed logging and debugging capabilities

**Option B: `tab_sort_clear.uc.js` (Simple)**
- Lightweight AI-powered tab sorting
- 3 AI providers (Gemini, Ollama, Mistral)
- Simple configuration with basic preferences
- Minimal resource usage

### 2. File Installation

Copy your chosen script(s) to your `chrome/JS` folder:
- `tidy-tabs.uc.js` for advanced features
- `tab_sort_clear.uc.js` for simple setup
- Both can coexist if desired

### 3. Configuration Setup

**NEW: Preference-Based Configuration**
All settings are now managed through Firefox preferences instead of editing script files. Use the included `preferences.json` as a reference for all available options.

**Quick Setup Examples:**

Set these preferences in `about:config` or through your preference management tool:

**Minimal Gemini Setup:**
```
extensions.tidytabs.apiConfig.gemini.enabled = true
extensions.tidytabs.apiConfig.gemini.apiKey = "YOUR_GEMINI_API_KEY"
```

**Multi-Provider Setup:**
```
extensions.tidytabs.apiConfig.openai.enabled = true
extensions.tidytabs.apiConfig.openai.apiKey = "YOUR_OPENAI_KEY"
extensions.tidytabs.apiConfig.anthropic.enabled = true
extensions.tidytabs.apiConfig.anthropic.apiKey = "YOUR_ANTHROPIC_KEY"
extensions.tidytabs.apiConfig.gemini.enabled = true
extensions.tidytabs.apiConfig.gemini.apiKey = "YOUR_GEMINI_KEY"
```

### 4. AI Provider Setup

**Supported Providers (in order of preference):**

1. **OpenAI** - Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Models: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`

2. **Anthropic (Claude)** - Get API key from [Anthropic Console](https://console.anthropic.com)
   - Models: `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`, `claude-3-haiku-20240307`

3. **Mistral** - Get API key from [Mistral Console](https://console.mistral.ai)
   - Models: `mistral-large-latest`, `mistral-small-latest`, `open-mistral-7b`

4. **DeepSeek** - Get API key from [DeepSeek Platform](https://platform.deepseek.com)
   - Models: `deepseek-chat`, `deepseek-coder`

5. **Gemini (Recommended for free tier)** - Get API key from [AI Studio](https://aistudio.google.com)
   - Models: `gemini-2.5-flash-lite-preview-06-17`, `gemini-1.5-flash`, `gemini-1.5-pro`

6. **Ollama (Local/Private)** - Install [Ollama](https://ollama.com/) locally
   - Run: `ollama pull llama3.1` (or your preferred model)
   - Endpoint: `http://localhost:11434/api/generate`

### 5. Finalize Installation

- Open Zen browser
- Go to `about:support` and clear startup cache
- Restart browser or reload userChrome scripts

## Core Features

### Intelligent Auto-Sorting
- **New Tab Auto-Sort**: Automatically groups new tabs as they're created
- **URL Change Auto-Sort**: Re-groups tabs when their content changes
- **Smart Debouncing**: Prevents excessive sorting with configurable timing
- **Context-Aware**: Adapts sorting behavior based on workspace patterns

### Advanced Scoring System
- **Existing Group Priority**: Strongly favors joining existing groups
- **Opener Relationship Tracking**: Groups tabs opened from the same source
- **Content Type Detection**: Identifies documents, videos, code repositories, etc.
- **Hostname Analysis**: Groups by domain with intelligent subdomain handling
- **Keyword Matching**: Fuzzy matching of title keywords
- **AI-Powered Categorization**: Context-aware grouping using your chosen AI

### Dynamic Weight Adaptation
- **Size-Based Profiles**: Different strategies for small (1-5), medium (6-15), and large (16+) tab counts
- **Behavioral Pattern Recognition**: Detects work vs leisure browsing patterns
- **Content Complexity Analysis**: Adapts to technical vs simple content
- **Time-Aware Adjustments**: Recent relationships get priority boosts

### Multi-Provider AI Support
- **Automatic Failover**: Falls back to next provider if primary fails
- **Provider Selection**: Choose based on cost, speed, or privacy preferences
- **Local Processing**: Ollama support for complete privacy
- **Smart Prompting**: Context-aware prompts with existing group information

## Configuration Options

### Preference Categories

**Logging & Debugging**
```
extensions.tidytabs.logging.enabled (checkbox)
extensions.tidytabs.logging.level (string: debug|info|warn|error|none)
extensions.tidytabs.logging.showDetailedScoring (checkbox)
```

**Auto-Sort Behavior**
```
extensions.tidytabs.autoSortNewTabs.enabled (checkbox)
extensions.tidytabs.autoSortNewTabs.delay (integer: milliseconds)
extensions.tidytabs.autoSortOnURLChange.enabled (checkbox)
extensions.tidytabs.autoSortOnURLChange.delay (integer: milliseconds)
```

**AI Provider Configuration**
```
extensions.tidytabs.apiConfig.gemini.enabled (checkbox)
extensions.tidytabs.apiConfig.gemini.apiKey (string)
extensions.tidytabs.apiConfig.gemini.model (string)
extensions.tidytabs.apiConfig.openai.enabled (checkbox)
extensions.tidytabs.apiConfig.openai.apiKey (string)
extensions.tidytabs.apiConfig.openai.model (string)
[...and similar for anthropic, mistral, deepseek, ollama]
```

**Scoring System**
```
extensions.tidytabs.scoringWeights.existingGroup (string: 0.0-1.0)
extensions.tidytabs.scoringWeights.opener (string: 0.0-1.0)
extensions.tidytabs.scoringWeights.hostname (string: 0.0-1.0)
extensions.tidytabs.scoringWeights.aiSuggestion (string: 0.0-1.0)
```

**Scorer Enable/Disable**
```
extensions.tidytabs.scorers.enabled.existingGroup (checkbox)
extensions.tidytabs.scorers.enabled.opener (checkbox)
extensions.tidytabs.scorers.enabled.contentType (checkbox)
extensions.tidytabs.scorers.enabled.hostname (checkbox)
extensions.tidytabs.scorers.enabled.aiSuggestion (checkbox)
extensions.tidytabs.scorers.enabled.keyword (checkbox)
```

**Dynamic Weight Profiles**
```
extensions.tidytabs.dynamicWeights.enabled (checkbox)
extensions.tidytabs.dynamicWeights.sizeProfiles.small.existingGroup (string)
extensions.tidytabs.dynamicWeights.sizeProfiles.medium.opener (string)
extensions.tidytabs.dynamicWeights.sizeProfiles.large.aiSuggestion (string)
[...and many more size-specific weights]
```

### Recommended Configurations

**Minimal Setup (Free Gemini)**
```
extensions.tidytabs.apiConfig.gemini.enabled = true
extensions.tidytabs.apiConfig.gemini.apiKey = "YOUR_KEY"
extensions.tidytabs.autoSortNewTabs.enabled = true
extensions.tidytabs.logging.level = "info"
```

**Power User (Multi-Provider)**
```
extensions.tidytabs.apiConfig.openai.enabled = true
extensions.tidytabs.apiConfig.anthropic.enabled = true
extensions.tidytabs.apiConfig.gemini.enabled = true
extensions.tidytabs.logging.showDetailedScoring = true
extensions.tidytabs.dynamicWeights.enabled = true
```

**Privacy-Focused (Local Only)**
```
extensions.tidytabs.apiConfig.ollama.enabled = true
extensions.tidytabs.apiConfig.ollama.endpoint = "http://localhost:11434/api/generate"
[disable all cloud providers]
```

## How It Works

### Multi-Stage Processing Pipeline

1. **Context Analysis**: Analyzes existing groups, workspace patterns, and content types
2. **Dynamic Weight Calculation**: Adjusts scoring weights based on tab count, content complexity, and user patterns
3. **Multi-Scorer Evaluation**: Each tab is scored by up to 6 different systems simultaneously
4. **Conflict Resolution**: Intelligent tie-breaking with preference for existing groups
5. **AI Refinement**: Context-aware AI analysis for remaining tabs
6. **Consolidation**: Merges similar group names and optimizes final structure

### Adaptive Intelligence

The system learns and adapts based on:
- **Workspace Context**: Different strategies for work vs leisure browsing
- **Content Complexity**: Technical content gets different weight adjustments
- **Tab Volume**: Small workspaces prioritize domains, large workspaces leverage AI
- **User Behavior**: Tracks access patterns and dwell time
- **Temporal Patterns**: Recent relationships get priority boosts

### Quality Assurance

- **Minimum Thresholds**: Configurable minimum scores prevent poor groupings
- **Existing Group Priority**: Strong bias toward joining existing groups
- **Fuzzy Consolidation**: Merges similar group names (e.g., "GitHub" + "Github")
- **Smart Validation**: Ensures meaningful group sizes and quality

## Advanced Features

### Time-Aware Processing
- **Opener Relationship Decay**: Parent-child relationships naturally weaken over time
- **Recent Boost**: Recently opened tabs get scoring advantages
- **Smart Debouncing**: Prevents rapid-fire sorting operations

### Content Intelligence
- **Semantic Analysis**: Detects spreadsheets, documents, videos, code repos
- **Domain Normalization**: Maps subdomains to main brands (e.g., docs.google.com → Google Docs)
- **Keyword Extraction**: Intelligent title analysis with stop-word filtering

### Developer Features
- **Comprehensive Logging**: Detailed scoring breakdowns and decision rationale
- **Performance Metrics**: Timing and efficiency tracking
- **Debug Modes**: Step-by-step analysis of grouping decisions
- **Custom Content Types**: Extensible pattern matching system

## Preference Management

All configuration is managed through Firefox preferences with the `preferences.json` file serving as a comprehensive reference. The JSON includes:

- **Complete Option Catalog**: Every configurable setting with descriptions
- **Data Types**: Proper type definitions (checkbox, string, integer)
- **Default Values**: Sensible defaults for all options
- **Setup Instructions**: Step-by-step configuration guide
- **Recommended Configs**: Pre-built setups for common use cases
- **Migration Notes**: Important information for users upgrading

## Notes

- The system primarily analyzes tab titles, URLs, and meta descriptions
- Groups require a minimum tab count (configurable, default is 1)
- AI prompts are optimized for consistent, meaningful category names
- The "Clear" button only affects ungrouped, non-pinned tabs in the current workspace
- Both scripts can coexist using different preference namespaces
- Changes to preferences take effect immediately without restart

## Troubleshooting

**Common Issues:**
- **No API Key**: Ensure your chosen provider has a valid API key set
- **No Groups Created**: Check minimum thresholds and scoring weights
- **Poor Grouping**: Enable detailed logging to analyze scoring decisions
- **Auto-Sort Not Working**: Verify auto-sort settings and delays

**Debug Mode:**
Set `extensions.tidytabs.logging.level = "debug"` and `extensions.tidytabs.logging.showDetailedScoring = true` for comprehensive analysis.

---

**Contribution and feedback welcome. Happy browsing!** 
