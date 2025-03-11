// GitHub Pages Path Configuration
const GITHUB_CONFIG = {
    repoName: 'mavikk-website',
    isGitHubPages: () => window.location.hostname === 'easyumer.github.io',
    
    // Utility to get correct asset path
    getAssetPath: (originalPath) => {
        // If on GitHub Pages, prepend repo name
        if (GITHUB_CONFIG.isGitHubPages()) {
            // Remove leading slash if present
            const cleanPath = originalPath.replace(/^\//, '');
            return `/${GITHUB_CONFIG.repoName}/${cleanPath}`;
        }
        return originalPath;
    },

    // Auto-adjust all asset paths
    adjustPaths: () => {
        if (!GITHUB_CONFIG.isGitHubPages()) return;

        // Adjust stylesheet links
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            link.href = GITHUB_CONFIG.getAssetPath(link.href);
        });

        // Adjust script sources
        document.querySelectorAll('script[src]').forEach(script => {
            script.src = GITHUB_CONFIG.getAssetPath(script.src);
        });

        // Adjust image sources
        document.querySelectorAll('img[src], source[srcset]').forEach(el => {
            const attributes = ['src', 'srcset'];
            attributes.forEach(attr => {
                if (el.hasAttribute(attr)) {
                    el.setAttribute(attr, GITHUB_CONFIG.getAssetPath(el.getAttribute(attr)));
                }
            });
        });
    }
};

// Run path adjustment on page load
document.addEventListener('DOMContentLoaded', GITHUB_CONFIG.adjustPaths);