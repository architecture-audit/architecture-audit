# Contributing to AI Architecture Audit

Thank you for your interest in contributing to AI Architecture Audit! We welcome contributions from the community to make our assessment frameworks even better.

## 🎯 Ways to Contribute

### 1. Report Bugs
- Use the GitHub Issues page
- Check if the issue already exists
- Include browser version and steps to reproduce
- Provide screenshots if applicable

### 2. Suggest Features
- Open a GitHub Issue with the "enhancement" label
- Describe the feature and its benefits
- Include use cases and examples

### 3. Submit Code
- Fork the repository
- Create a feature branch
- Make your changes
- Submit a pull request

### 4. Improve Documentation
- Fix typos or clarify confusing sections
- Add examples and use cases
- Translate documentation

### 5. Share Use Cases
- Write about how you're using the frameworks
- Share success stories
- Provide industry-specific insights

## 🚀 Getting Started

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/YOUR-USERNAME/frameworks.git
cd frameworks
```

3. Add the upstream remote:
```bash
git remote add upstream https://github.com/architecture-audit/frameworks.git
```

### Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:
- `feature/add-dark-mode`
- `fix/calculator-validation`
- `docs/update-readme`

## 💻 Development Setup

### Prerequisites
- Git
- Python 3.x (for local server)
- Modern web browser
- Text editor or IDE

### Running Locally

1. Start the development server:
```bash
python3 -m http.server 8888
```

2. Open browser to:
```
http://localhost:8888
```

3. For calculator development:
- Basic calculator: `/calculators.html`
- Full-featured calculators: `/calculators/[name]/`

### Testing

Run tests before submitting:
```bash
# Start server
python3 -m http.server 8888

# Open test runner in browser
http://localhost:8888/tests/FINAL-TEST-RUNNER.html
```

## 📝 Code Style Guidelines

### JavaScript
- Use ES6+ features
- Descriptive variable names
- Comment complex logic
- Keep functions focused and small

Example:
```javascript
// Good
function calculateMaturityScore(assessmentData) {
    const weights = getAssessmentWeights();
    return assessmentData.reduce((score, item, index) => {
        return score + (item.value * weights[index]);
    }, 0);
}

// Avoid
function calc(d) {
    let s = 0;
    for(let i=0; i<d.length; i++) {
        s += d[i].v * w[i];
    }
    return s;
}
```

### CSS
- Use CSS variables for colors
- Mobile-first responsive design
- Meaningful class names
- Avoid inline styles

Example:
```css
/* Good */
.calculator-section {
    background: var(--light);
    padding: 2rem;
    border-radius: 12px;
}

/* Avoid */
.cs {
    background: #f8fafc;
    padding: 32px;
    border-radius: 12px;
}
```

### HTML
- Semantic HTML elements
- Accessible form labels
- Alt text for images
- Valid HTML5

## 🔄 Pull Request Process

### Before Submitting

1. **Test your changes**
   - Run all calculators
   - Test on multiple browsers
   - Check mobile responsiveness

2. **Update documentation**
   - Update README if needed
   - Add comments to complex code
   - Update relevant documentation pages

3. **Follow conventions**
   - Use existing code patterns
   - Match the project's style
   - Keep changes focused

### Submitting a PR

1. Push to your fork:
```bash
git push origin feature/your-feature-name
```

2. Create Pull Request on GitHub
3. Fill out the PR template:
   - Describe what changes you made
   - Explain why the changes are needed
   - List any breaking changes
   - Include screenshots for UI changes

4. Wait for review
   - Respond to feedback promptly
   - Make requested changes
   - Be patient and respectful

### PR Title Format

Use clear, descriptive titles:
- `feat: Add dark mode toggle`
- `fix: Resolve auto-save data loss issue`
- `docs: Update installation instructions`
- `style: Improve mobile navigation`
- `refactor: Simplify calculator validation`

## 🎨 Design Guidelines

### Colors
Use the defined CSS variables:
- Primary: `--primary: #6366f1`
- Secondary: `--secondary: #8b5cf6`
- Success: `--success: #10b981`
- Warning: `--warning: #f59e0b`
- Danger: `--danger: #ef4444`

### Typography
- Headers: System fonts
- Body: 16px base size
- Line height: 1.7

### Spacing
- Use rem units
- Consistent padding/margins
- Follow 8px grid system

## 🚫 What NOT to Do

- Don't introduce external dependencies unnecessarily
- Don't remove existing features without discussion
- Don't change core architecture without RFC
- Don't commit sensitive data or credentials
- Don't update minified files directly

## 🤝 Code of Conduct

### Be Respectful
- Welcome newcomers
- Be patient with questions
- Respect different viewpoints
- Focus on what's best for the project

### Be Inclusive
- Use welcoming language
- Accept constructive criticism
- Focus on collaboration
- Support community members

### Be Professional
- Stay on topic
- Avoid personal attacks
- Handle disagreements gracefully
- Follow project guidelines

## 📚 Resources

### Documentation
- [README.md](README.md) - Project overview
- [Test Suite](/tests/) - Testing guidelines
- [Calculators](/calculators/) - Calculator documentation

### Learning Resources
- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript Best Practices](https://www.w3.org/wiki/JavaScript_best_practices)
- [CSS Guidelines](https://cssguidelin.es/)
- [Web Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)

## 🙋 Getting Help

### Questions?
- Check existing issues
- Ask in GitHub Discussions
- Review documentation

### Need Clarification?
- Comment on the relevant issue
- Ask in your pull request
- Reach out to maintainers

## 🎉 Recognition

Contributors will be:
- Listed in the contributors section
- Credited in release notes
- Appreciated by the community!

## 📋 Checklist for Contributors

Before submitting your contribution, ensure you have:

- [ ] Read this contributing guide
- [ ] Forked and cloned the repository
- [ ] Created a descriptive branch name
- [ ] Made focused, logical commits
- [ ] Tested your changes thoroughly
- [ ] Updated relevant documentation
- [ ] Followed code style guidelines
- [ ] Created a clear pull request
- [ ] Responded to review feedback

## 💡 Tips for Success

1. **Start small** - Pick a simple issue for your first contribution
2. **Ask questions** - Don't hesitate to ask for clarification
3. **Be patient** - Reviews may take time
4. **Stay focused** - One feature/fix per PR
5. **Test thoroughly** - Prevent regressions
6. **Document well** - Help future contributors
7. **Communicate** - Keep reviewers informed

---

Thank you for contributing to AI Architecture Audit! Your efforts help make enterprise architecture assessment better for everyone.

**Built with ❤️ by architects, for architects! 🚀**