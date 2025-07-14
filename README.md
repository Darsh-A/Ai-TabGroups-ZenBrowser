# 🤖 AI Tab Groups for Zen Browser

Advanced AI-powered tab management with intelligent grouping, auto-sorting, and multi-provider support.

## 📋 Prerequisites

- **Enable userChrome Customizations**: In `about:config`, set `toolkit.legacyUserProfileCustomizations.stylesheets` to `true`
- **Install userChrome.js Loader**: Set up [Autoconfig](https://github.com/MrOtherGuy/fx-autoconfig/tree/master)
- **Install Tab Groups Config**: Use [Advanced Tab Groups](https://github.com/Anoms12/Advanced-Tab-Groups) (skip if you already have a TabGroup config)

## 📦 Installation

### 1. Through Sine (R)
Sine is a community-driven mod/theme manager for all Firefox-based browsers.
Install it [here](https://github.com/CosmoCreeper/Sine)

The mod will be available in its marketplace as `Tidy-Tabs`.

### 2. Manual Installation
1. Setup [Fx-Autoconfig](https://github.com/MrOtherGuy/fx-autoconfig) (Sine installs this automatically)
2. Download the latest scripts and preferences from the repo.
3. Place it in the chrome directory of your profile. To open the directory, type `about:profiles` in the address bar, click on your profile, and then click "Open Directory".
4. Go to `about:support` and Clear the startup cache.

## ⚙️ Setup 
All settings are managed through Firefox preferences `extensions.tidytabs` or the Sine menu in `about:preferences`. The `preferences.json` file contains all configurable options.

### 🔧 Core Feature Options

- **AI-Only Grouping**: Let AI handle all grouping logic, bypassing deterministic scoring for pure AI-driven organization
- **Auto-Hide UI**: Hide sort and clear buttons by default, showing them only on hover for cleaner interface
- **Random Colors**: Start with random group colors instead of always defaulting to blue
- **Semantic Analysis**: Enable content type analysis for more intelligent categorization
- **Auto-Sort**: Automatically sort new tabs and tabs with URL changes with configurable delays
- **Detailed Logging**: Comprehensive logging with adjustable levels for debugging and monitoring

### 🤖 AI Provider Configuration

The models are predefined in the Sine UI but can be adjusted through `about:preferences`.

- **Google Gemini**: Latest models including Gemini 2.5 Flash Lite Preview
- **OpenAI**: GPT-4o, GPT-4o Mini, GPT-4 Turbo, and GPT-3.5 Turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3.5 Haiku, and Claude 3 Haiku
- **Mistral AI**: Large, Small, and Open Mistral models
- **DeepSeek**: Chat and Coder specialized models
- **Ollama**: Local AI provider support with customizable endpoints

## ✨ Features

- Advanced AI-powered categorization that understands content context, relationships, and user behavior patterns.
- Automatically organizes new tabs and responds to URL changes with configurable delays and debouncing.
- Combines multiple scoring methods including existing group similarity, opener relationships, hostname matching, content type analysis, and AI suggestions.
- Fine-tune scoring weights, enable/disable specific scorers, and adjust dynamic weight adaptation.

## 🔬 Advanced Preferences

### **Scoring Weight Configuration**
- **Existing Group Weight** (0.90): Highest priority for keeping related tabs together
- **Opener Relationship** (0.85): Strong preference for tabs opened from the same source
- **Content Type Similarity** (0.80): Groups similar content types (videos, articles, etc.)
- **Hostname Matching** (0.75): Domain-based grouping for site-related tabs
- **AI Suggestions** (0.70): AI-driven categorization recommendations
- **Keyword Similarity** (0.60): Text-based content matching

### **Dynamic Weight Adaptation**
- **Time-based Tracking**: Boost recent opener relationships with configurable decay
- **Size Profiles**: Different weight configurations for small (1-5), medium (6-15), and large (16+) tab counts
- **Adaptive Learning**: System learns from user patterns and adjusts weights accordingly

### **Size-Based Optimization**
- **Small Workspaces** (1-5 tabs): Emphasizes existing groups and hostname matching
- **Medium Workspaces** (6-15 tabs): Balanced approach with moderate AI involvement
- **Large Workspaces** (16+ tabs): Heavy AI assistance with content type focus

### **Advanced Controls**
- **Scorer Enable/Disable**: Individual control over each scoring algorithm
- **Debounce Settings**: Prevent excessive auto-sorting with configurable timing
- **API Rate Limiting**: Smart request management to avoid hitting provider limits
- **Fallback Mechanisms**: Graceful degradation when AI services are unavailable

