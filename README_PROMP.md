# Dynamic Prompt Configuration
This update introduces the ability to manage and select different prompts for the CV optimization process.

## Features

### 1. Prompt Management (Settings)
- **View Prompts**: You can see a list of saved prompts in the Settings page.
- **Add New Prompt**: Create custom prompts tailored for different needs (e.g., different languages, specific ATS focus).
- **Edit/Delete**: Modify or remove existing prompts.
- **Default Prompt**: The system initializes with a default English prompt if no prompts exist.

### 2. Prompt Selection (Main Popup)
- **Select Prompt**: A new dropdown menu above the "Job Description" field allows you to choose which prompt to use for the current optimization.
- **Persistence**: The selected prompt is saved as your default preference for future sessions.

### 3. Technical Implementation
- **Storage**: Prompts are stored in `localStorage` (or `chrome.storage.local` for extension builds) under the key `savedPrompts`.
- **Gemini Service**: The `optimizeCV` function now accepts a `promptTemplate` argument, allowing the selected prompt to dynamically replace the hardcoded one.
- **Placeholders**: Prompts support the following placeholders which are replaced at runtime:
  - `${jobDescription}`: The text from the job description field.
  - `${resumeLatex}`: The content of the selected LaTeX resume.
  - `${resumeName}`: The name of the selected resume.

## Usage
1. Go to **Settings** to add or edit prompts.
2. In the main window, select your desired prompt from the dropdown.
3. Paste the job description and click **Optimize Resume**.
