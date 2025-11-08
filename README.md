‼️‼️ Currently broken due to discontinuation support for tab-groups officially from the zen team and clashing with its new features. i will try to look for a solution when im a bit free. PRs welcomed as always ^^

# ✨ AI Tab Groups for Zen Browser ✨

https://github.com/user-attachments/assets/fc792843-b1da-448e-ba00-63322a3d9c99

## Pre-requisites
- Enable userChrome Customizations:
    In `about:config` go to `toolkit.legacyUserProfileCustomizations.stylesheets` and set it to `true`.
- Install and Setup the userChrome.js Loader from [Autoconfig](https://github.com/MrOtherGuy/fx-autoconfig/tree/master)
- Install the Tab Groups config from [Advanced Tab Groups](https://github.com/Anoms12/Advanced-Tab-Groups)
    If you already have a Tab Groups config you can skip this
  
## Setup and Install

## Method 1 (Recommended):
***Through [Sine](https://github.com/CosmoCreeper/Sine)***

Settings Can be configured through the mod settings through the Sine UI
*This also allows for Auto-Updates :D


## Method 2 (Manual) :
- Copy and paste the `tab_sort_clear.uc.js` file to your `chrome/JS` folder.
### AI Setup
1. For Gemini (RECOMMENDED)
    - Set `gemini { enabled:true }` in `apiConfig` and `ollama { enabled:false }` in `apiConfig`
    - Get an API Key from [AI Studios](https://aistudio.google.com)
    - Replace `YOUR_GEMINI-API-KEY` with the copied API key
    - Don't change the Gemini model since 2.0 has very low rate limits (unless you are rich ig)
2. For Ollama
    - Download and install [Ollama](https://ollama.com/)
    - Install your preferred model. The script uses `llama3.1` by default
    - Set `ollama { enabled:true }` in `apiConfig` and `gemini { enabled:false }` in `apiConfig`
    - Set the model you downloaded in ollama.model: in the config (you can see the models by doing `ollama list` in terminal)
- Make sure `browser.tabs.groups.smart.enabled` is set to `false` in `about:config`
- Open Zen browser, go to `about:support` and clear the startup cache.
- Done. Enjoy ^^


## How it works?
- The script has two phases, first it manually sorts tabs that have common words in their title and URL, second it uses the AI to sort rest of the tabs and checks if they fit in the existing groups (that were manually created) or if it should create a new group.
- The script only fetches the tabs full URL and title, thus it prioritizes the title first for main context and URL for sub context.
- The sort function only works when there is two or more tabs to sort into a group.
- You can also have a selected group of tabs sorted as well, this allows you to have fine-grained control over the sorting (works for tabs that are already grouped as well, they may be re-sorted).
- You are free to change the AI prompt to your suitable workflow. The prompt is at the top in `apiConfig`.
- The `Clear` button only clears un-grouped non-pinned tabs.

**Peace <3**

