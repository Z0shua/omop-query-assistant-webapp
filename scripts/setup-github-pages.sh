#!/bin/bash

# Setup script for GitHub Pages deployment
echo "🚀 Setting up GitHub Pages deployment for OMOP Query Assistant"

# Get the current repository name
REPO_NAME=$(basename -s .git `git config --get remote.origin.url`)
echo "📦 Repository name: $REPO_NAME"

# Get GitHub username from remote URL, default to Z0shua if not found
GITHUB_USERNAME=$(git config --get remote.origin.url | sed -n 's/.*github\.com[:/]\([^/]*\).*/\1/p')
if [ -z "$GITHUB_USERNAME" ]; then
    GITHUB_USERNAME="z0shua"
fi
echo "👤 GitHub username: $GITHUB_USERNAME"

# Update package.json with correct homepage
echo "📝 Updating package.json homepage..."
sed -i "s|https://z0shua\.github\.io/omop-query-assistant-webapp|https://$GITHUB_USERNAME.github.io/$REPO_NAME|g" package.json

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Push your changes to GitHub:"
echo "   git add ."
echo "   git commit -m 'Setup GitHub Pages deployment'"
echo "   git push origin main"
echo ""
echo "2. Go to your repository on GitHub:"
echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "3. Navigate to Settings → Pages"
echo "4. Under 'Source', select 'GitHub Actions'"
echo "5. Your app will be deployed automatically!"
echo ""
echo "🌐 Your app will be available at:"
echo "   https://$GITHUB_USERNAME.github.io/$REPO_NAME" 